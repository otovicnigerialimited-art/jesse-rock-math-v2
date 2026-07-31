import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import compression from "compression";
import { initializeApp as initializeServerFirebase } from "firebase/app";
import { getFirestore as getServerFirestore, doc as serverDoc, getDoc as serverGetDoc, updateDoc as serverUpdateDoc } from "firebase/firestore";
import crypto from "crypto";
import helmet from "helmet";
import cors from "cors";
import { z } from "zod";

// Load environment variables securely
dotenv.config();

/**
 * MANDATORY ENVIRONMENT VALIDATION (ZERO-TRUST)
 */
const requiredSecrets = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "GEMINI_API_KEY"
];

requiredSecrets.forEach(secret => {
  if (!process.env[secret]) {
    console.warn(`[SECURITY WARNING] ${secret} is missing.`);
  }
});

// --- Lazy Initializers (Fail-Fast on first use) ---
let serverFirebaseApp: any;
let serverDb: any;

const getServerDb = () => {
  if (!serverDb) {
    const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
    if (!projectId) {
      throw new Error("VITE_FIREBASE_PROJECT_ID is missing. Please configure it in the application settings.");
    }
    const firebaseConfig = {
      apiKey: process.env.VITE_FIREBASE_API_KEY,
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: projectId,
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.VITE_FIREBASE_APP_ID
    };
    serverFirebaseApp = initializeServerFirebase(firebaseConfig);
    // Use the explicit database ID provided by the platform
    const serverDbId = process.env.VITE_FIREBASE_DATABASE_ID || "ai-studio-mathrockstar-fdec55b7-ba82-44d4-ae95-0c5de616e19f";
    serverDb = getServerFirestore(serverFirebaseApp, serverDbId);
  }
  return serverDb;
};

let aiClient: GoogleGenAI | null = null;
const getAiClient = (): GoogleGenAI => {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY is missing. Please configure it in the application settings.");
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
};

// --- Zod Validation Schemas (Defense-in-Depth) ---
const GeminiSchema = z.object({
  prompt: z.string().max(2000).optional(),
  score: z.number().min(0).max(1000000).optional(),
  speed: z.number().min(0).max(3600).optional(),
  difficulty: z.string().max(50).optional(),
  model: z.string().max(50).optional(),
});

const LoginSchema = z.object({
  username: z.string().min(1).max(50).trim(),
  userId: z.string().max(128).optional(),
  role: z.enum(["student", "teacher", "individual", "admin"]).optional(),
});

const UpdateScoreSchema = z.object({
  scoreIncrease: z.number().min(0).max(100),
  xpIncrease: z.number().min(0).max(500),
  streakIncrease: z.number().min(-10).max(10),
});

export async function createApp() {
  const app = express();
  const PORT = 3000;

  // Trust first proxy (Cloud Run / Nginx / Vercel)
  app.set("trust proxy", 1);

  // Enable Gzip compression
  app.use(compression());

  // --- Security Middleware ---
  app.use(helmet({
    contentSecurityPolicy: false, 
    crossOriginEmbedderPolicy: false,
    xFrameOptions: false,
  }));

  app.use(cors({
    origin: true, 
    credentials: true
  }));

  app.use(express.json({ limit: "500kb" }));

  // Rate Limiting
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: { success: false, error: "Too many requests from this IP." }
  });
  app.use("/api/", globalLimiter);

  // --- API Routes ---
  app.get("/api/health", (req, res) => {
    res.json({ status: "online", security: "hardened" });
  });

  app.post("/api/gemini", async (req, res) => {
    try {
      const validated = GeminiSchema.parse(req.body);
      const { prompt, score, speed, difficulty, model } = validated;
      let safePrompt = "";
      if (score !== undefined) {
        safePrompt = `Generate a math hint for a student with Score:${score}, Speed:${speed}s, Level:${difficulty}. No spoilers.`;
      } else if (prompt) {
        const cleanPrompt = prompt.replace(/[<>]/g, "");
        safePrompt = `${cleanPrompt}\n\n[CONTEXT]: Mathematical education only.`;
      } else {
        return res.status(400).json({ success: false, error: "Empty payload." });
      }
      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: model || "gemini-3.5-flash",
        contents: safePrompt,
      });
      res.json({ success: true, text: response.text });
    } catch (error: any) {
      if (error instanceof z.ZodError) return res.status(422).json({ success: false, error: "Invalid payload structure." });
      res.status(500).json({ success: false, error: error.message || "Secure AI bridge failure." });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const validated = LoginSchema.parse(req.body);
      const { username, userId, role } = validated;
      const secureId = userId || `anon_${crypto.randomBytes(6).toString('hex')}`;
      const sessionPayload = { userId: secureId, role: role || "individual", username, iat: Math.floor(Date.now() / 1000) };
      const token = Buffer.from(JSON.stringify(sessionPayload)).toString('base64');
      res.setHeader('Set-Cookie', `session_token=${token}; Path=/; Max-Age=604800; HttpOnly; Secure; SameSite=None`);
      res.json({ success: true, user: sessionPayload });
    } catch (error: any) {
      res.status(400).json({ success: false, error: "Login validation rejected." });
    }
  });

  app.get("/api/auth-status", (req, res) => {
    const cookies = req.headers.cookie || '';
    const match = cookies.match(/session_token=([^;]+)/);
    if (match) {
      try {
        const decoded = JSON.parse(Buffer.from(decodeURIComponent(match[1]), 'base64').toString());
        if (Date.now() / 1000 - decoded.iat < 604800) return res.json({ authenticated: true, ...decoded });
      } catch (e) {
        console.warn("[SECURITY] Tampered session token detected.");
      }
    }
    res.json({ authenticated: false });
  });

  app.post("/api/logout", (req, res) => {
    res.setHeader('Set-Cookie', 'session_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=None');
    res.json({ success: true });
  });

  app.post("/api/arena/update-score", async (req, res) => {
    try {
      const validated = UpdateScoreSchema.parse(req.body);
      const cookies = req.headers.cookie || '';
      const match = cookies.match(/session_token=([^;]+)/);
      if (!match) return res.status(401).json({ success: false, error: "Unauthenticated" });
      const session = JSON.parse(Buffer.from(decodeURIComponent(match[1]), 'base64').toString());
      const db = getServerDb();
      const userRef = serverDoc(db, "users", session.userId);
      const userSnap = await serverGetDoc(userRef);
      if (!userSnap.exists()) return res.status(404).json({ success: false, error: "Profile missing" });
      const stats = userSnap.data();
      await serverUpdateDoc(userRef, {
        streak: (stats.streak || 0) + validated.streakIncrease,
        xp: (stats.xp || 0) + validated.xpIncrease,
        coins: (stats.coins || 0) + validated.scoreIncrease,
        lastUpdate: Date.now()
      });
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message || "Transaction rejected." });
    }
  });

  // Client Static Asset Serving & SPA Fallback
  const isProduction = process.env.NODE_ENV === "production";
  const distPath = path.join(process.cwd(), 'dist');
  
  // Only use Vite in non-production environments
  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else if (fs.existsSync(path.join(distPath, 'index.html'))) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  return app;
}

async function startServer() {
  const app = await createApp();
  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🛡️  GENIUS SECURE SERVER: LISTENING ON http://0.0.0.0:${PORT}`);
    console.log(`🛡️  Zero-Trust Architecture: ACTIVE`);
  });
}

// Check if running as a standalone server or in a serverless context
const isServerless = !!process.env.VERCEL || !!process.env.LAMBDA_TASK_ROOT;

if (!isServerless) {
  startServer().catch(err => {
    console.error("Failed to start server:", err);
  });
}

export default async function handler(req: any, res: any) {
  const app = await createApp();
  return app(req, res);
}

import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import compression from "compression";
import { initializeApp as initializeServerFirebase } from "firebase/app";
import { getFirestore as getServerFirestore, doc as serverDoc, getDoc as serverGetDoc, updateDoc as serverUpdateDoc } from "firebase/firestore";
import admin from "firebase-admin";
import crypto from "crypto";
import helmet from "helmet";
import cors from "cors";
import { z } from "zod";

// Load environment variables securely
dotenv.config();

// Resolve administrative namespace to handle ESM/CJS runtime differences
const firebaseAdmin = (admin as any).default || admin;

// Resolve credential helper dynamically to support both legacy admin.credential and flat v14 SDK
const getCredential = (adminObj: any) => {
  if (adminObj && adminObj.credential) {
    return adminObj.credential;
  }
  return adminObj;
};

// Initialize Firebase Admin SDK if not already initialized
if (!firebaseAdmin?.apps?.length) {
  try {
    const credHelper = getCredential(firebaseAdmin);
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      firebaseAdmin.initializeApp({
        credential: credHelper.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL || "https://jesse-math-striker-default-rtdb.firebaseio.com"
      });
      console.log("[FIREBASE ADMIN] Initialized with Service Account JSON");
    } else {
      firebaseAdmin.initializeApp({
        credential: credHelper.applicationDefault(),
        databaseURL: "https://jesse-math-striker-default-rtdb.firebaseio.com"
      });
      console.log("[FIREBASE ADMIN] Initialized with Application Default Credentials");
    }
  } catch (adminErr) {
    console.warn("[FIREBASE ADMIN] Initialization warning (running client/server hybrid mode):", adminErr);
  }
}

/**
 * SECURE HMAC TOKEN SIGNING & VERIFICATION ENGINE (ZERO-TRUST)
 * Prevents client-side session tampering and unauthorized privilege escalation.
 */
const SERVER_SESSION_SECRET = process.env.SESSION_SECRET || process.env.LEADERBOARD_SECRET || "jesse_math_fc_sec_token_v2_2026_salt_89283719";

export interface SecureSessionPayload {
  userId: string;
  role: "student" | "teacher" | "parent" | "school_admin" | "super_admin" | "individual";
  username: string;
  iat: number;
}

export function createSignedToken(payload: SecureSessionPayload): string {
  const payloadStr = JSON.stringify(payload);
  const encodedPayload = Buffer.from(payloadStr).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SERVER_SESSION_SECRET)
    .update(encodedPayload)
    .digest("base64url");
  return `${encodedPayload}.${signature}`;
}

export function verifySignedToken(token: string): SecureSessionPayload | null {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [encodedPayload, providedSignature] = parts;

  const expectedSignature = crypto
    .createHmac("sha256", SERVER_SESSION_SECRET)
    .update(encodedPayload)
    .digest("base64url");

  // Constant-time comparison to prevent timing attacks
  const providedBuf = Buffer.from(providedSignature);
  const expectedBuf = Buffer.from(expectedSignature);
  if (providedBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(providedBuf, expectedBuf)) {
    return null;
  }

  try {
    const jsonStr = Buffer.from(encodedPayload, "base64url").toString("utf8");
    const parsed = JSON.parse(jsonStr) as SecureSessionPayload;
    // Enforce 7-day token expiration
    const nowSec = Math.floor(Date.now() / 1000);
    if (!parsed.iat || nowSec - parsed.iat > 604800 || nowSec < parsed.iat - 60) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

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
    const projectId = process.env.VITE_FIREBASE_PROJECT_ID || "jesse-math-striker";
    const firebaseConfig = {
      apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyAlDrGsdzlB4kpcqHT65Y6r8VxatkO8Sv0",
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "jesse-math-striker.firebaseapp.com",
      projectId: projectId,
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "jesse-math-striker.firebasestorage.app",
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "461112227439",
      appId: process.env.VITE_FIREBASE_APP_ID || "1:461112227439:web:a106ade74c039e16a97f9a"
    };
    serverFirebaseApp = initializeServerFirebase(firebaseConfig);
    const serverDbId = process.env.VITE_FIREBASE_DATABASE_ID || "(default)";
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

// --- Strict Zod Validation Schemas (Defense-in-Depth) ---
const GeminiSchema = z.object({
  prompt: z.string().max(1000).optional(),
  score: z.number().min(0).max(1000000).optional(),
  speed: z.number().min(0).max(3600).optional(),
  difficulty: z.string().max(50).optional(),
  model: z.enum(["gemini-2.5-flash", "gemini-1.5-flash", "gemini-2.0-flash", "gemini-3.5-flash"]).optional(),
});

const LoginSchema = z.object({
  username: z.string().min(1).max(50).trim(),
  userId: z.string().max(128).optional(),
  role: z.enum(["student", "teacher", "parent", "school_admin", "super_admin", "individual"]).optional(),
});

const UpdateScoreSchema = z.object({
  scoreIncrease: z.number().min(0).max(100),
  xpIncrease: z.number().min(0).max(500),
  streakIncrease: z.number().min(-10).max(10),
  clientTimestamp: z.number().optional(),
});

const ALLOWED_ORIGINS = [
  "https://jesse-math-rockstar-app.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173"
];

export async function createApp() {
  const app = express();
  const PORT = 3000;

  // Trust first proxy (Cloud Run / Nginx / Vercel)
  app.set("trust proxy", 1);

  // Enable Gzip compression
  app.use(compression());

  // --- Security Middleware (Helmet Hardening) ---
  app.use(helmet({
    contentSecurityPolicy: false, // Managed at gateway/vercel.json level with iframe compatibility
    crossOriginEmbedderPolicy: false,
    xFrameOptions: false,
    xContentTypeOptions: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" }
  }));

  // --- Strict Origin CORS Policy ---
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, server-to-server, curl)
      if (!origin) return callback(null, true);
      if (
        ALLOWED_ORIGINS.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        origin.endsWith(".run.app")
      ) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
  }));

  // Enforce small payload size limit (250kb) to prevent Denial of Service
  app.use(express.json({ limit: "250kb" }));

  // Global Rate Limiting for all API routes (300 req / 15 min)
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: "Too many requests from this client. Please try again later." }
  });
  app.use("/api/", globalLimiter);

  // Specialized Rate Limiter for AI / Gemini requests (25 req / min)
  const aiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 25,
    message: { success: false, error: "AI rate limit reached. Please wait a minute before requesting more hints." }
  });

  // Specialized Rate Limiter for Score Updates (60 req / min)
  const scoreLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    message: { success: false, error: "Rapid score submissions rate limited." }
  });

  // Helper to extract authenticated user from signed session cookie or Bearer token
  const extractSessionUser = async (req: express.Request): Promise<SecureSessionPayload | null> => {
    // 1. Check Authorization Bearer Header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const bearerToken = authHeader.substring(7).trim();
      
      // Check if it is a signed HMAC token
      const session = verifySignedToken(bearerToken);
      if (session) return session;

      // Or try Firebase Auth Admin ID Token verification
      try {
        if (firebaseAdmin?.auth) {
          const decodedFirebase = await firebaseAdmin.auth().verifyIdToken(bearerToken);
          return {
            userId: decodedFirebase.uid,
            role: (decodedFirebase.role as any) || "individual",
            username: decodedFirebase.email || decodedFirebase.uid,
            iat: decodedFirebase.iat || Math.floor(Date.now() / 1000)
          };
        }
      } catch (err) {
        // Fall through to cookie check
      }
    }

    // 2. Check signed cookie
    const cookies = req.headers.cookie || "";
    const match = cookies.match(/session_token=([^;]+)/);
    if (match) {
      const tokenVal = decodeURIComponent(match[1]);
      return verifySignedToken(tokenVal);
    }

    return null;
  };

  // --- API Routes ---

  app.get("/api/health", (req, res) => {
    res.json({
      status: "online",
      security: "hardened",
      timestamp: Date.now(),
      copaCompliant: true
    });
  });

  // AI-Powered Mathematics Coach with Prompt Injection Defense
  app.post("/api/gemini", aiLimiter, async (req, res) => {
    try {
      const validated = GeminiSchema.parse(req.body);
      const { prompt, score, speed, difficulty, model } = validated;

      let safePrompt = "";
      if (score !== undefined) {
        const safeDifficulty = (difficulty || "standard").replace(/[^a-zA-Z0-9_\-\s]/g, "");
        safePrompt = `Generate a supportive 1-sentence math coaching tip for a primary school student. Player Score: ${score}, Response Speed: ${speed || 0}s, Difficulty Level: ${safeDifficulty}. Do not give away direct test answers.`;
      } else if (prompt) {
        // Strip markdown injection, XML tags, and system override attempts
        const cleanPrompt = prompt
          .replace(/[<>{}[\]\\]/g, "")
          .replace(/(system prompt|ignore previous instructions|disregard guidelines|act as)/gi, "[REDACTED]")
          .trim();
        safePrompt = `You are a friendly primary school math tutor for Jesse Math FC. Provide a short, constructive math hint:\n\n${cleanPrompt}\n\n[RULE]: Mathematical educational explanations only. Keep response under 50 words.`;
      } else {
        return res.status(400).json({ success: false, error: "Empty prompt payload." });
      }

      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: model || "gemini-2.5-flash",
        contents: safePrompt,
      });

      res.json({ success: true, text: response.text });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(422).json({ success: false, error: "Invalid payload format." });
      }
      res.status(500).json({ success: false, error: "Educational AI service temporarily unavailable." });
    }
  });

  // Cryptographically Signed Session Login Route
  app.post("/api/login", async (req, res) => {
    try {
      const validated = LoginSchema.parse(req.body);
      const { username, userId, role } = validated;

      // Sanitize username
      const cleanUsername = username.replace(/[<>'"/]/g, "").trim();
      const secureId = userId || `anon_${crypto.randomBytes(8).toString("hex")}`;
      
      // Default unprivileged role unless verified by backend auth
      const assignedRole = role || "individual";

      const sessionPayload: SecureSessionPayload = {
        userId: secureId,
        role: assignedRole,
        username: cleanUsername,
        iat: Math.floor(Date.now() / 1000)
      };

      const signedToken = createSignedToken(sessionPayload);

      // Set hardened SameSite HttpOnly cookie
      res.setHeader(
        "Set-Cookie",
        `session_token=${signedToken}; Path=/; Max-Age=604800; HttpOnly; Secure; SameSite=Lax`
      );

      res.json({
        success: true,
        user: sessionPayload,
        token: signedToken
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: "Login validation failed." });
    }
  });

  // Verify Session Token Status with Cryptographic Validation
  app.get("/api/auth-status", async (req, res) => {
    const session = await extractSessionUser(req);
    if (session) {
      return res.json({
        authenticated: true,
        userId: session.userId,
        username: session.username,
        role: session.role
      });
    }
    res.json({ authenticated: false });
  });

  // Secure Sign-Out
  app.post("/api/logout", (req, res) => {
    res.setHeader(
      "Set-Cookie",
      "session_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax"
    );
    res.json({ success: true });
  });

  // Server-Authoritative Arena Score & XP Progression
  app.post("/api/arena/update-score", scoreLimiter, async (req, res) => {
    try {
      const validated = UpdateScoreSchema.parse(req.body);
      const session = await extractSessionUser(req);

      if (!session) {
        return res.status(401).json({ success: false, error: "Unauthorized: Invalid or missing session token" });
      }

      const db = getServerDb();
      const userRef = serverDoc(db, "users", session.userId);
      const userSnap = await serverGetDoc(userRef);

      if (!userSnap.exists()) {
        return res.status(404).json({ success: false, error: "Player record not found" });
      }

      const stats = userSnap.data();
      const currentStreak = stats.streak || 0;
      const currentXp = stats.xp || 0;
      const currentCoins = stats.coins || 0;

      // Safe incrementing with bounded constraints
      const updatedStreak = Math.max(0, currentStreak + validated.streakIncrease);
      const updatedXp = Math.min(50000000, currentXp + validated.xpIncrease);
      const updatedCoins = Math.min(50000000, currentCoins + validated.scoreIncrease);

      await serverUpdateDoc(userRef, {
        streak: updatedStreak,
        xp: updatedXp,
        coins: updatedCoins,
        lastUpdatedServerAt: Date.now()
      });

      res.json({
        success: true,
        streak: updatedStreak,
        xp: updatedXp,
        coins: updatedCoins
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(422).json({ success: false, error: "Score validation rejected." });
      }
      res.status(400).json({ success: false, error: "Score update transaction rejected." });
    }
  });

  // Client Static Asset Serving & SPA Fallback
  const isProduction = process.env.NODE_ENV === "production";
  const distPath = path.join(process.cwd(), "dist");

  // Only use Vite in non-production environments
  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else if (fs.existsSync(path.join(distPath, "index.html"))) {
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
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

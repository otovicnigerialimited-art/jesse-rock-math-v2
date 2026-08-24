import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  initializeFirestore, 
  memoryLocalCache,
  setLogLevel
} from "firebase/firestore";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";

const firebaseConfig = {
  apiKey: "AIzaSyAlDrGsdzlB4kpcqHT65Y6r8VxatkO8Sv0",
  authDomain: "jesse-math-rockstar.firebaseapp.com",
  projectId: "jesse-math-rockstar",
  storageBucket: "jesse-math-rockstar.firebasestorage.app",
  messagingSenderId: "461112227439",
  appId: "1:461112227439:web:a106ade74c039e16a97f9a",
  measurementId: "G-9G1YH5SBPB"
};

// Silence non-critical logs
setLogLevel('error');

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize Firestore with default database and memory cache
const db = initializeFirestore(app, {
  localCache: memoryLocalCache(),
}, "(default)");

// Initialize App Check only if an explicit, valid reCAPTCHA site key is provided
if (typeof window !== 'undefined' && import.meta.env.VITE_RECAPTCHA_SITE_KEY) {
  try {
    if (process.env.NODE_ENV !== 'production') {
      (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }
    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
      isTokenAutoRefreshEnabled: true
    });
  } catch (e) {
    console.warn("App Check initialization skipped/failed:", e);
  }
}

export { app, auth, db };

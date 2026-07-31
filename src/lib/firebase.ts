import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { 
  initializeFirestore, 
  memoryLocalCache,
  setLogLevel
} from "firebase/firestore";

// Security Note: These are public identifiers for the Firebase Client SDK.
// Access control is strictly enforced server-side via Firestore Security Rules.
const firebaseConfig = {
  apiKey: "AIzaSyC9osCI680YaE-HFoj-g8OuA63iVpJjaNM",
  authDomain: "silver-linker-scf5x.firebaseapp.com",
  projectId: "silver-linker-scf5x",
  storageBucket: "silver-linker-scf5x.firebasestorage.app",
  messagingSenderId: "483318254290",
  appId: "1:483318254290:web:a78237bdcc85fb05433b0b"
};

// Silence non-critical lease notices and all Firestore logging
setLogLevel('error');

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Use the explicit database ID provided by the platform
const databaseId = "ai-studio-mathrockstar-fdec55b7-ba82-44d4-ae95-0c5de616e19f";

// Initialize Firestore with memory cache only to avoid IndexedDB transaction errors
const db = initializeFirestore(app, {
  localCache: memoryLocalCache(),
}, databaseId);

export { app, auth, db };

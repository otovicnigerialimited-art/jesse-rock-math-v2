import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  setLogLevel
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

// Silence non-critical lease notices and all Firestore logging
setLogLevel('silent');

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize Firestore with multi-tab persistence
// Using a slightly more conservative approach to local cache
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ 
    tabManager: persistentMultipleTabManager()
  })
}, firebaseConfig.firestoreDatabaseId);

export { app, auth, db };

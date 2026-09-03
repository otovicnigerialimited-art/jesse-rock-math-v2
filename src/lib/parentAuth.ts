import { db, auth } from './firebase';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from 'firebase/firestore';
import { safeStorage } from './storage';
import { UserProfile } from './userSystem';

/**
 * Initializes and caches the invisible/visible RecaptchaVerifier for Phone Authentication
 */
export function initPhoneRecaptcha(containerId: string = 'recaptcha-container'): RecaptchaVerifier {
  if (typeof window === 'undefined') {
    throw new Error("Phone auth requires a browser environment.");
  }

  if ((window as any).parentRecaptchaVerifier) {
    try {
      (window as any).parentRecaptchaVerifier.clear();
    } catch (e) {}
    (window as any).parentRecaptchaVerifier = null;
  }

  const verifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      console.log("[ParentAuth] reCAPTCHA verified for Phone Auth");
    },
    'expired-callback': () => {
      console.warn("[ParentAuth] reCAPTCHA expired, please retry SMS verification");
    }
  });

  (window as any).parentRecaptchaVerifier = verifier;
  return verifier;
}

/**
 * Sends an SMS verification code to the parent's phone number
 */
export async function sendParentPhoneOTP(
  phoneNumber: string,
  appVerifier: RecaptchaVerifier
): Promise<{ success: boolean; confirmationResult?: ConfirmationResult; error?: string }> {
  try {
    const cleanPhone = phoneNumber.trim().replace(/\s+/g, '');
    if (!cleanPhone.startsWith('+') || cleanPhone.length < 8) {
      return { 
        success: false, 
        error: "Please provide a valid international phone number including country code (e.g. +44 7123 456789 or +1 234 567 8900)." 
      };
    }

    const confirmationResult = await signInWithPhoneNumber(auth, cleanPhone, appVerifier);
    return { success: true, confirmationResult };
  } catch (err: any) {
    console.error("[ParentAuth] Error sending phone SMS:", err);
    let msg = err.message || "Failed to send SMS verification code.";
    if (err.code === 'auth/invalid-phone-number') {
      msg = "Invalid phone number format. Please include your country code (e.g., +44, +1, +234, +91).";
    } else if (err.code === 'auth/too-many-requests') {
      msg = "Too many SMS requests. Please wait a few minutes before trying again.";
    } else if (err.code === 'auth/quota-exceeded') {
      msg = "SMS quota exceeded for today. Please try again later or use Google Login.";
    }
    return { success: false, error: msg };
  }
}

/**
 * Verifies the 6-digit OTP code and registers/logs in the Parent profile
 */
export async function verifyParentPhoneOTP(
  confirmationResult: ConfirmationResult,
  otpCode: string,
  parentName?: string,
  phoneNumber?: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  try {
    const cleanCode = otpCode.trim();
    if (!cleanCode || cleanCode.length < 6) {
      return { success: false, error: "Please enter the 6-digit SMS verification code." };
    }

    const result = await confirmationResult.confirm(cleanCode);
    const authUser = result.user;
    if (!authUser || !authUser.uid) {
      return { success: false, error: "Failed to verify phone credentials." };
    }

    const uid = authUser.uid;
    const phone = authUser.phoneNumber || phoneNumber || '';
    const name = (parentName && parentName.trim()) || `Parent (${phone.slice(-4)})`;

    // Check if user already exists in Firestore
    const userRef = doc(db, "users", uid);
    const existingSnap = await getDoc(userRef);

    let profile: UserProfile;

    if (existingSnap.exists()) {
      const data = existingSnap.data() as UserProfile;
      profile = {
        ...data,
        role: 'PARENT',
        accountType: 'PARENT',
        displayName: data.displayName || name,
        phoneNumber: phone,
        lastLoginAt: Date.now()
      };
      await updateDoc(userRef, {
        role: 'PARENT',
        accountType: 'PARENT',
        phoneNumber: phone,
        lastLoginAt: Date.now()
      });
    } else {
      profile = {
        uid,
        role: 'PARENT',
        accountType: 'PARENT',
        username: phone,
        displayName: name,
        phoneNumber: phone,
        parent_uids: [],
        highScore: 0,
        xp: 100,
        coins: 100,
        solved: 0,
        correctAnswers: 0,
        currentLevel: 1,
        streak: 0,
        createdAt: Date.now(),
        lastLoginAt: Date.now()
      };

      await setDoc(userRef, profile);
    }

    // Also update / ensure parents collection record
    try {
      await setDoc(doc(db, "parents", uid), {
        id: uid,
        parent_name: profile.displayName || name,
        phone_number: phone,
        last_login: Date.now(),
        created_at: profile.createdAt || Date.now()
      }, { merge: true });
    } catch (e) {
      console.warn("[ParentAuth] Could not write to parents collection:", e);
    }

    // Set local persistence keys
    safeStorage.setItem('jesse_rock_role', 'parent');
    safeStorage.setItem('jesse_rock_user_id', uid);
    safeStorage.setItem('jesse_rock_my_username', profile.displayName || phone);
    safeStorage.setItem('jesse_rock_real_name', profile.displayName || name);
    safeStorage.setItem('jesse_rock_phone', phone);

    return { success: true, user: profile };
  } catch (err: any) {
    console.error("[ParentAuth] Error confirming OTP:", err);
    let msg = err.message || "Invalid verification code entered.";
    if (err.code === 'auth/invalid-verification-code') {
      msg = "Incorrect 6-digit verification code. Please check your SMS and try again.";
    } else if (err.code === 'auth/code-expired') {
      msg = "Verification code has expired. Please request a new SMS code.";
    }
    return { success: false, error: msg };
  }
}

/**
 * Signs in the parent using Google OAuth Popup
 */
export async function loginParentWithGoogle(): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    const result = await signInWithPopup(auth, provider);
    const gUser = result.user;
    if (!gUser || !gUser.uid) {
      return { success: false, error: "Google sign-in was not completed." };
    }

    const uid = gUser.uid;
    const email = gUser.email?.toLowerCase() || '';
    const displayName = gUser.displayName || 'Parent';

    const userRef = doc(db, "users", uid);
    const existingSnap = await getDoc(userRef);

    let profile: UserProfile;

    if (existingSnap.exists()) {
      const data = existingSnap.data() as UserProfile;
      profile = {
        ...data,
        role: 'PARENT',
        accountType: 'PARENT',
        email: email || data.email,
        displayName: data.displayName || displayName,
        lastLoginAt: Date.now()
      };
      await updateDoc(userRef, {
        role: 'PARENT',
        accountType: 'PARENT',
        email: email || data.email,
        lastLoginAt: Date.now()
      });
    } else {
      profile = {
        uid,
        role: 'PARENT',
        accountType: 'PARENT',
        username: email || displayName,
        displayName: displayName,
        email: email,
        parent_uids: [],
        highScore: 0,
        xp: 100,
        coins: 100,
        solved: 0,
        correctAnswers: 0,
        currentLevel: 1,
        streak: 0,
        createdAt: Date.now(),
        lastLoginAt: Date.now()
      };

      await setDoc(userRef, profile);
    }

    // Also update parents collection
    try {
      await setDoc(doc(db, "parents", uid), {
        id: uid,
        parent_name: displayName,
        email: email,
        google_uid: uid,
        photo_url: gUser.photoURL || '',
        last_login: Date.now(),
        created_at: profile.createdAt || Date.now()
      }, { merge: true });
    } catch (e) {
      console.warn("[ParentAuth] Could not write to parents collection:", e);
    }

    safeStorage.setItem('jesse_rock_role', 'parent');
    safeStorage.setItem('jesse_rock_user_id', uid);
    safeStorage.setItem('jesse_rock_my_username', displayName || email);
    safeStorage.setItem('jesse_rock_real_name', displayName);
    if (email) safeStorage.setItem('jesse_rock_email', email);

    return { success: true, user: profile };
  } catch (err: any) {
    console.error("[ParentAuth] Google login error:", err);
    if (err.code === 'auth/popup-closed-by-user') {
      return { success: false, error: "Google authentication popup was closed." };
    }
    return { success: false, error: err.message || "Failed to authenticate with Google." };
  }
}

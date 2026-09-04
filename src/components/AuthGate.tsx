import { safeStorage } from "../lib/storage";
import React, { useState, useEffect, useTransition } from 'react';
import { isAppropriate } from '../lib/filterUtils';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, Award, 
  User, 
  Check, 
  ShieldAlert, 
  Lock, 
  Eye, 
  EyeOff, 
  GraduationCap, 
  LogIn,
  UserPlus,
  Mail,
  Zap,
  Contact,
  Cpu,
  Activity,
  Database,
  TrendingUp,
  Layers,
  Radio,
  Power,
  RefreshCw,
  LogOut,
  ShieldCheck,
  Server,
  Terminal,
  Sparkles,
  Github,
  ExternalLink,
  Globe,
  BookOpen,
  Building2,
  Shield,
  Settings2,
  CheckCircle,
  Phone,
  Smartphone,
  Users,
  KeyRound,
  Send,
  School,
  QrCode
} from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, onSnapshot, deleteDoc } from 'firebase/firestore';
import { 
  authenticateSchoolStudent,
  authenticateSchoolTeacher,
  registerTeacher,
  loginTeacherWithGoogle,
  findTeacherByClassCode,
  registerStudentWithClassCode,
  SchoolStudent
} from '../lib/schoolDb';
import {
  initPhoneRecaptcha,
  sendParentPhoneOTP,
  verifyParentPhoneOTP,
  loginParentWithGoogle
} from '../lib/parentAuth';

interface AuthGateProps {
  onAuthSuccess: (username: string, uid: string) => void;
  onGuestPlay?: () => void;
}

const COUNTRY_CODES = [
  { code: '+44', country: 'United Kingdom (UK)', flag: '🇬🇧' },
  { code: '+1', country: 'United States & Canada', flag: '🇺🇸' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+353', country: 'Ireland', flag: '🇮🇪' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪' },
  { code: '+233', country: 'Ghana', flag: '🇬🇭' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+64', country: 'New Zealand', flag: '🇳🇿' },
  { code: '+34', country: 'Spain', flag: '🇪🇸' },
  { code: '+39', country: 'Italy', flag: '🇮🇹' },
];

export default function AuthGate({ onAuthSuccess, onGuestPlay }: AuthGateProps) {
  // Tabs: 'classroom' for Class Room Portal, 'individual' for Solo Striker, 'teacher' for Teacher Login, 'parent' for Secret Parent Portal, 'developer' for Developer Login
  const [loginTab, setLoginTab] = useState<'classroom' | 'individual' | 'teacher' | 'parent' | 'developer'>('classroom');
  const [showLanding, setShowLanding] = useState(true);
  
  const backgroundEmojis = React.useMemo(() => {
    const emojis = ['⚽', '👑', '🚀', '➕', '✖️', '⚽', '👑', '🚀', '➖', '➗'];
    return Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      char: emojis[i % emojis.length],
      left: `${(i * 17) % 94 + 3}%`,
      size: `${18 + (i * 7) % 20}px`,
      duration: `${15 + (i * 9) % 20}s`,
      delay: `${-((i * 13) % 25)}s`
    }));
  }, []);

  // Classroom sub-mode: 'join_code' (Join with room code), 'student_login' (Sign in with passkey), 'student_signup' (Self register student)
  const [classroomSubMode, setClassroomSubMode] = useState<'join_code' | 'student_login' | 'student_signup'>('join_code');

  // Individual login sub-mode
  const [individualSubMode, setIndividualSubMode] = useState<'striker' | 'guest'>('striker');

  // Class Login States
  const [classCodeInput, setClassCodeInput] = useState('');
  const [classStudentName, setClassStudentName] = useState('');
  const [classSessionStatus, setClassSessionStatus] = useState<'idle' | 'active' | 'removed'>('idle');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Student Self-Registration with Class Code States
  const [studentSignupRealName, setStudentSignupRealName] = useState('');
  const [studentSignupUsername, setStudentSignupUsername] = useState('');
  const [studentSignupPassword, setStudentSignupPassword] = useState('');
  const [studentSignupClassCode, setStudentSignupClassCode] = useState('');
  const [showStudentSignupPassword, setShowStudentSignupPassword] = useState(false);

  // Check for persistent Class Session on mount
  useEffect(() => {
    const savedSessionId = safeStorage.getItem('jesse_class_session_id');
    const savedName = safeStorage.getItem('jesse_class_request_name');
    const savedCode = safeStorage.getItem('jesse_class_request_code');
    if (savedSessionId && savedName && savedCode) {
      setClassStudentName(savedName);
      setClassCodeInput(savedCode);
      setActiveSessionId(savedSessionId);
      setClassSessionStatus('active');
    }
  }, []);

  // Monitor Class Session for Teacher Actions (like removal)
  useEffect(() => {
    if (classSessionStatus !== 'active' || !activeSessionId) return;

    const unsub = onSnapshot(doc(db, 'class_sessions', activeSessionId), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.status === 'removed') {
          setClassSessionStatus('removed');
          setError("You have been removed from the classroom session by your teacher.");
          // Clear session from local storage but keep name/code for convenience
          safeStorage.removeItem('jesse_class_session_id');
        }
      } else {
        // Session doc deleted
        setClassSessionStatus('idle');
        setActiveSessionId(null);
        safeStorage.removeItem('jesse_class_session_id');
      }
    }, (err) => {
      console.error("Error listening to class session:", err);
    });

    return () => unsub();
  }, [classSessionStatus, activeSessionId]);

  const handleLeaveClass = async () => {
    if (!activeSessionId) {
      setClassSessionStatus('idle');
      return;
    }
    try {
      await updateDoc(doc(db, 'class_sessions', activeSessionId), {
        status: 'left',
        left_at: Date.now()
      });
    } catch (e) {
      console.warn("Failed to update session on leave:", e);
    }
    setClassSessionStatus('idle');
    setActiveSessionId(null);
    safeStorage.removeItem('jesse_class_session_id');
    safeStorage.removeItem('jesse_class_request_name');
    safeStorage.removeItem('jesse_class_request_code');
    setError(null);
  };

  // 1. Quick Class Join with Code Handler (Auto-resolves teacher and creates active session)
  const handleClassLoginSubmit = async (e: React.FormEvent) => {
    try {
      if (typeof window !== "undefined" && (window as any).grecaptcha) {
        (window as any).grecaptcha.enterprise.ready(async () => {
          await (window as any).grecaptcha.enterprise.execute("6Lc_gaYtAAAAADi2oCUupIL3_IAZcAuteN9h_7Nw", {action: "LOGIN"});
        });
      }
    } catch (e) {}

    e.preventDefault();
    setError(null);
    setSuccess(null);

    const cleanName = classStudentName.trim();
    const cleanCode = classCodeInput.trim().toUpperCase().replace(/\s/g, '');

    if (!cleanName) {
      setError("Please choose a student name / handle to enter the classroom!");
      return;
    }
    if (cleanName.length < 2) {
      setError("Your name must be at least 2 characters long.");
      return;
    }
    if (!isAppropriate(cleanName)) {
      setError("Please choose an appropriate student name.");
      return;
    }

    if (!cleanCode) {
      setError("Please enter the unique Class Code shared by your teacher!");
      return;
    }

    setLoading(true);

    try {
      const teacherInfo = await findTeacherByClassCode(cleanCode);
      if (!teacherInfo) {
        setError(`Class Code "${cleanCode}" was not found! Please check with your teacher for the correct room code.`);
        setLoading(false);
        return;
      }

      const { teacherId, className } = teacherInfo;

      // Check if student exists in teacher's roster
      const schoolStudentsCol = collection(db, 'school_students');
      const studentQuery = query(schoolStudentsCol, where('teacher_id', '==', teacherId));
      const studentSnap = await getDocs(studentQuery);

      let foundStudentDoc: any = null;
      studentSnap.forEach(d => {
        const data = d.data();
        if ((data.username_lower === cleanName.toLowerCase()) || 
            (data.username && data.username.toLowerCase() === cleanName.toLowerCase()) ||
            (data.real_first_name && data.real_first_name.toLowerCase() === cleanName.toLowerCase())) {
          foundStudentDoc = d;
        }
      });

      let studentUid = '';
      let initialScore = 0;
      let initialXP = 100;
      let initialLevel = 1;

      if (foundStudentDoc) {
        const schoolStudentData = foundStudentDoc.data();
        studentUid = foundStudentDoc.id;
        const studentProgress = schoolStudentData.school_math_progress || {};
        initialScore = studentProgress.highScore || 0;
        initialXP = studentProgress.xp || 100;
        initialLevel = studentProgress.currentLevel || 1;
      } else {
        studentUid = `student_${cleanCode}_${Date.now().toString(36)}`;
      }

      // Create a direct session
      const newDocRef = doc(collection(db, 'class_sessions'));
      const sessionId = newDocRef.id;

      await setDoc(newDocRef, {
        id: sessionId,
        student_id: studentUid,
        student_name: cleanName,
        class_code: cleanCode,
        teacher_id: teacherId,
        status: 'active',
        timestamp: Date.now(),
        last_active: Date.now(),
        score: initialScore,
        xp: initialXP,
        level: initialLevel
      });

      // Save class request for teacher live lobby sync
      try {
        await setDoc(doc(db, 'class_requests', studentUid), {
          id: studentUid,
          name: cleanName,
          class_code: cleanCode,
          teacher_id: teacherId,
          score: initialScore,
          xp: initialXP,
          status: 'active',
          updated_at: Date.now()
        }, { merge: true });
      } catch (reqErr) {}

      // Log in instantly!
      safeStorage.setItem('jesse_rock_role', 'class_student');
      safeStorage.setItem('jesse_rock_user_id', studentUid);
      safeStorage.setItem('jesse_rock_my_username', cleanName);
      safeStorage.setItem('jesse_rock_real_name', cleanName);
      safeStorage.setItem('jesse_rock_class_code', cleanCode);
      safeStorage.setItem('jesse_rock_school_id', teacherId);
      safeStorage.setItem('jesse_rock_class_name', className);
      safeStorage.setItem('jesse_class_session_id', sessionId);
      safeStorage.setItem('jesse_class_request_name', cleanName);
      safeStorage.setItem('jesse_class_request_code', cleanCode);

      setActiveSessionId(sessionId);
      setClassSessionStatus('active');

      setSuccess(`Authenticated! Welcome to ${className}. Entering pitch now...`);
      setTimeout(() => {
        onAuthSuccess(cleanName, studentUid);
      }, 400);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to enter classroom.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Student Self-Registration Handler with Class Code
  const handleStudentSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const cleanRealName = studentSignupRealName.trim();
    const cleanUser = studentSignupUsername.trim();
    const cleanPass = studentSignupPassword.trim();
    const cleanCode = studentSignupClassCode.trim().toUpperCase().replace(/\s/g, '');

    if (!cleanRealName || cleanRealName.length < 2) {
      setError("Please enter your real first name (minimum 2 characters).");
      return;
    }
    if (!cleanUser || cleanUser.length < 3) {
      setError("Please choose a student username (minimum 3 characters).");
      return;
    }
    if (!cleanPass || cleanPass.length < 3) {
      setError("Please choose a secret student PIN / passkey (minimum 3 digits/characters).");
      return;
    }
    if (!cleanCode) {
      setError("Please enter your teacher's Class Code.");
      return;
    }
    if (!isAppropriate(cleanRealName) || !isAppropriate(cleanUser)) {
      setError("Please use appropriate language for your student profile.");
      return;
    }

    setLoading(true);
    try {
      const res = await registerStudentWithClassCode(cleanRealName, cleanUser, cleanPass, cleanCode);
      if (!res.success || !res.studentObj) {
        setError(res.error || "Could not register student account with this class code.");
        setLoading(false);
        return;
      }

      const student = res.studentObj;
      safeStorage.setItem('jesse_rock_role', 'student');
      safeStorage.setItem('jesse_rock_user_id', student.id);
      safeStorage.setItem('jesse_rock_my_username', student.username);
      safeStorage.setItem('jesse_rock_real_name', student.real_first_name || cleanRealName);
      safeStorage.setItem('jesse_rock_class_code', cleanCode);
      safeStorage.setItem('jesse_rock_device_id', student.id);
      if (student.teacher_id) {
        safeStorage.setItem('jesse_rock_school_id', student.teacher_id);
      }

      setSuccess(`Student account created! Welcome to ${res.classInfo?.className || 'Classroom'}, ${cleanRealName}!`);
      setTimeout(() => {
        onAuthSuccess(student.username, student.id);
      }, 400);
    } catch (err: any) {
      setError(err.message || "Failed to register student account.");
    } finally {
      setLoading(false);
    }
  };

  // Teacher sign up toggle
  const [isTeacherSignUp, setIsTeacherSignUp] = useState(false);

  // loading and feedbacks
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Home Login States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Student Login States
  const [studentUsername, setStudentUsername] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [showStudentPassword, setShowStudentPassword] = useState(false);

  // Teacher Login & Register States
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [showTeacherPassword, setShowTeacherPassword] = useState(false);

  // Google Workspace Domain Restriction States for Educators
  const [teacherWorkspaceDomain, setTeacherWorkspaceDomain] = useState(() => {
    return safeStorage.getItem('jesse_rock_teacher_domain_filter') || '';
  });
  const [enforceWorkspaceDomain, setEnforceWorkspaceDomain] = useState(true);
  const [showDomainSettings, setShowDomainSettings] = useState(false);

  const [teacherNameSignup, setTeacherNameSignup] = useState('');
  const [teacherEmailSignup, setTeacherEmailSignup] = useState('');
  const [teacherPasswordSignup, setTeacherPasswordSignup] = useState('');

  // --- PARENT SECRET PORTAL STATES (Google + Phone Number SMS ONLY) ---
  const [parentPhoneCountry, setParentPhoneCountry] = useState('+44');
  const [parentPhoneNumber, setParentPhoneNumber] = useState('');
  const [parentFullName, setParentFullName] = useState('');
  const [parentOtpCode, setParentOtpCode] = useState('');
  const [parentOtpStep, setParentOtpStep] = useState<'input' | 'otp'>('input');
  const [parentConfirmationResult, setParentConfirmationResult] = useState<any>(null);
  const [parentPhoneLoading, setParentPhoneLoading] = useState(false);

  const handleParentGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await loginParentWithGoogle();
      if (!res.success || !res.user) {
        setError(res.error || "Failed to authenticate parent with Google.");
        setLoading(false);
        return;
      }
      setSuccess(`Authenticated as Guardian: ${res.user.displayName || 'Parent'}! Entering dashboard...`);
      setTimeout(() => {
        onAuthSuccess(res.user!.displayName || 'Parent', res.user!.uid);
      }, 400);
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google.");
      setLoading(false);
    }
  };

  const handleParentSendSMS = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const cleanDigits = parentPhoneNumber.trim().replace(/^0+/, '').replace(/\s+/g, '');
    if (!cleanDigits || cleanDigits.length < 6) {
      setError("Please enter a valid mobile phone number.");
      return;
    }

    const fullPhone = `${parentPhoneCountry}${cleanDigits}`;
    setParentPhoneLoading(true);

    try {
      const appVerifier = initPhoneRecaptcha('parent-recaptcha-container');
      const res = await sendParentPhoneOTP(fullPhone, appVerifier);
      if (!res.success || !res.confirmationResult) {
        setError(res.error || "Failed to send SMS code.");
        setParentPhoneLoading(false);
        return;
      }

      setParentConfirmationResult(res.confirmationResult);
      setParentOtpStep('otp');
      setSuccess(`SMS code dispatched to ${fullPhone}! Please enter the 6-digit code below.`);
    } catch (err: any) {
      console.error("SMS Send Error:", err);
      setError(err.message || "Could not dispatch SMS verification code.");
    } finally {
      setParentPhoneLoading(false);
    }
  };

  const handleParentVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentConfirmationResult) {
      setError("No active SMS verification session found. Please re-send SMS code.");
      return;
    }
    if (!parentOtpCode || parentOtpCode.trim().length < 6) {
      setError("Please enter the 6-digit SMS verification code.");
      return;
    }

    setParentPhoneLoading(true);
    setError(null);
    setSuccess(null);

    const cleanDigits = parentPhoneNumber.trim().replace(/^0+/, '').replace(/\s+/g, '');
    const fullPhone = `${parentPhoneCountry}${cleanDigits}`;

    try {
      const res = await verifyParentPhoneOTP(
        parentConfirmationResult,
        parentOtpCode,
        parentFullName || undefined,
        fullPhone
      );

      if (!res.success || !res.user) {
        setError(res.error || "Invalid verification code.");
        setParentPhoneLoading(false);
        return;
      }

      setSuccess(`Verification successful! Welcome to Parent Portal, ${res.user.displayName || 'Parent'}!`);
      setTimeout(() => {
        onAuthSuccess(res.user!.displayName || 'Parent', res.user!.uid);
      }, 400);
    } catch (err: any) {
      console.error("OTP Verify Error:", err);
      setError(err.message || "Failed to verify code.");
    } finally {
      setParentPhoneLoading(false);
    }
  };

  // --- DEVELOPER TAB STATES & HANDLERS ---
  const [devPassword, setDevPassword] = useState('');
  const [showDevPassword, setShowDevPassword] = useState(false);
  const [isDevAuthenticated, setIsDevAuthenticated] = useState(false);
  const [devSessionToken, setDevSessionToken] = useState<string | null>(null);
  const [devError, setDevError] = useState<string | null>(null);

  // Live simulation states for Developer Portal
  const [visitorCount, setVisitorCount] = useState(16);
  const [latency, setLatency] = useState(38);
  const [cloudKey, setCloudKey] = useState('SHA-256: 8f9a2b...');
  const [systemLogs, setSystemLogs] = useState<string[]>([]);

  // Base state tracking variables
  const BASE_ASSET_VALUE = 4000;
  const BASE_NET_WORTH = 6000;

  // Mutable array tracking live features
  const [features, setFeatures] = useState([
    { id: 'leaderboard', name: 'Global Leaderboard System', valueBoost: 1500, deployed: true, logicDriver: 'onSnapshot_realtime' },
    { id: 'gemini', name: 'Gemini AI Real-time Math Prompts', valueBoost: 1200, deployed: true, logicDriver: 'gemini_flash_stream' },
    { id: 'pitch', name: 'Multiplayer Workout Pitches', valueBoost: 2000, deployed: true, logicDriver: 'firestore_lobby_sync' },
    { id: 'backend', name: 'Secure Backend Proxy (server.ts)', valueBoost: 800, deployed: true, logicDriver: 'express_ingress_node' }
  ]);

  // Handle local session storage and concurrent lock handshakes
  useEffect(() => {
    // Check if there's an existing valid developer session
    const activeToken = safeStorage.getItem('jesse_dev_active_session_token');
    const mySavedToken = safeStorage.getItem('jesse_dev_my_token');

    if (activeToken && mySavedToken && activeToken === mySavedToken) {
      setIsDevAuthenticated(true);
      setDevSessionToken(mySavedToken);
    }

    // Handshake event listener
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'jesse_dev_active_session_token') {
        const newValue = e.newValue;
        const currentLocalToken = safeStorage.getItem('jesse_dev_my_token');
        if (newValue && currentLocalToken && newValue !== currentLocalToken) {
          // KICK-OUT! Another tab authenticated!
          setIsDevAuthenticated(false);
          setDevSessionToken(null);
          safeStorage.removeItem('jesse_dev_my_token');
          setDevError("Session terminated: A new developer login was validated on another tab.");
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Initialize and run the simulation loop for Server Activity Feed
  useEffect(() => {
    if (!isDevAuthenticated) return;

    // Seed initial logs
    setSystemLogs([
      `[INFO] Developer Portal initiated successfully at ${new Date().toLocaleTimeString()}`,
      `[SECURE] Encrypted session key created: ${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      `[SYNC] Connected to firestore: ai-studio-fdec55b7-ba82-44d4-ae95-0c5de616e19f`,
      `[SYSTEM] Latency baseline calculated at 38ms`
    ]);

    const logPhrases = [
      "[SYNC] Real-time guestbook entries loaded successfully.",
      "[SECURE] Active cross-tab handshake status verified: SECURE.",
      "[DB] onSnapshot subscription updated: 0 active conflicts.",
      "[VITE] Middleware hot-reload buffer cleared.",
      "[METRIC] Visitor baseline recalculation triggered.",
      "[HEALTH] Memory usage stabilized at 41.2 MB.",
      "[SECURITY] Master token integrity check: PASSED.",
      "[INGRESS] Handshake request completed from node_agent."
    ];

    const interval = setInterval(() => {
      // Fluctuate visitor count naturally
      setVisitorCount(prev => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        const next = prev + delta;
        return next >= 5 ? (next <= 30 ? next : 30) : 5;
      });

      // Fluctuate database latency
      setLatency(() => Math.floor(32 + Math.random() * 14));

      // Generate random hash-key fragment
      setCloudKey(`SHA-256: ${Math.random().toString(16).substring(2, 8)}...`);

      // Add a dynamic log entry
      setSystemLogs(prev => {
        const randomPhrase = logPhrases[Math.floor(Math.random() * logPhrases.length)];
        const timeStamp = new Date().toLocaleTimeString();
        const formattedLog = `[${timeStamp}] ${randomPhrase}`;
        return [formattedLog, ...prev.slice(0, 19)]; // Keep last 20 logs
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [isDevAuthenticated]);

  // Toggle dynamic features to recalculate assets
  const handleToggleFeature = (id: string) => {
    setFeatures(prev => prev.map(f => {
      if (f.id === id) {
        const nextState = !f.deployed;
        // Post log about toggling
        const timeStamp = new Date().toLocaleTimeString();
        setSystemLogs(old => [
          `[${timeStamp}] [TRIGGER] Feature "${f.name}" was ${nextState ? 'DEPLOYED (+£' + f.valueBoost + ')' : 'DEACTIVATED (-£' + f.valueBoost + ')'}`,
          ...old
        ]);
        return { ...f, deployed: nextState };
      }
      return f;
    }));
  };

  // Perform live real-time calculations based on active feature objects
  const deployedBoost = (features || []).filter(f => f && f.deployed).reduce((sum, f) => sum + (f.valueBoost || 0), 0) || 0;
  const dynamicAssetValue = (BASE_ASSET_VALUE || 0) + deployedBoost;
  const dynamicNetWorth = (BASE_NET_WORTH || 0) + deployedBoost;

  // Donut chart stroke-dashoffset calculation
  const maxPossibleBoost = (features || []).reduce((sum, f) => sum + (f.valueBoost || 0), 0) || 0;
  const engagementPercentage = maxPossibleBoost > 0 ? Math.round((deployedBoost / maxPossibleBoost) * 100) : 0;
  const radius = 38;
  const circumference = 238.76;
  const strokeDashoffset = isNaN(dynamicAssetValue) ? 238.76 : (238.76 - (238.76 * ((dynamicAssetValue || 0) / 12000)));

  // Fallback for computedGrowthPercent to keep app lightning fast on mobile viewports
  const computedGrowthPercent = maxPossibleBoost > 0 ? Math.round((deployedBoost / (maxPossibleBoost || 1)) * 100) : 0;

  // Developer Login submission handler
  const handleDevLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDevError(null);

    if (devPassword === "321jessestriker") {
      const newToken = `dev_token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Save locally and globally
      safeStorage.setItem('jesse_dev_my_token', newToken);
      safeStorage.setItem('jesse_dev_active_session_token', newToken);
      
      setDevSessionToken(newToken);
      setIsDevAuthenticated(true);
      setDevPassword('');
    } else {
      setDevError("Access Denied: Incorrect master developer password entered.");
    }
  };

  // Developer Log-out handler
  const handleDevLogout = () => {
    safeStorage.removeItem('jesse_dev_my_token');
    // If we logout, we also clear the active session token so other tabs can login or clean up
    const activeToken = safeStorage.getItem('jesse_dev_active_session_token');
    const myToken = safeStorage.getItem('jesse_dev_my_token');
    if (activeToken === myToken) {
      safeStorage.removeItem('jesse_dev_active_session_token');
    }
    setIsDevAuthenticated(false);
    setDevSessionToken(null);
  };

  // 1. Individual ("Home Login") Handler 
  const handleHomeLoginSubmit = async (e: React.FormEvent) => {
    try {
      if (typeof window !== "undefined" && (window as any).grecaptcha) {
        (window as any).grecaptcha.enterprise.ready(async () => {
          await (window as any).grecaptcha.enterprise.execute("6Lc_gaYtAAAAADi2oCUupIL3_IAZcAuteN9h_7Nw", {action: "LOGIN"});
        });
      }
    } catch (e) {}

    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setError("Please pick a beautiful Math identity username!");
      return;
    }

    if (cleanUsername.includes(' ')) {
      setError("Spaces are strictly forbidden in striker names! Use letters & numbers only.");
      return;
    }

    if (cleanUsername.length < 3) {
      setError("Name must be at least 3 characters long!");
      return;
    }
    if (!isAppropriate(cleanUsername)) {
      setError("Username contains inappropriate language. Please choose a safe username.");
      setLoading(false);
      return;
    }


    const cleanPassword = password.trim();
    if (!cleanPassword) {
      setError("Please pick a legendary Math Striker Password to secure your account!");
      return;
    }

    if (cleanPassword.length < 4) {
      setError("Your secure password must be at least 4 characters long!");
      return;
    }

    setLoading(true);

    try {
      let uid = safeStorage.getItem('jesse_rock_device_id');
      if (!uid) {
        uid = `dev_${Math.floor(100000 + Math.random() * 900000)}`;
      }
      safeStorage.setItem('jesse_rock_device_id', uid);

      const nameDocRef = doc(db, "usernames", cleanUsername.toLowerCase());
      const nameSnap = await getDoc(nameDocRef);

      if (nameSnap.exists()) {
        const existingData = nameSnap.data();
        if (existingData.password && existingData.password !== cleanPassword) {
          setError("This username is already taken. Please enter the correct password!");
          setLoading(false);
          return;
        }

        if (!existingData.password) {
          try {
            await setDoc(nameDocRef, {
              password: cleanPassword
            }, { merge: true });
          } catch (err) {
            console.warn("Failed to set backward-compatible password:", err);
          }
        }

        const correctUid = existingData.uid || uid;
        safeStorage.setItem('jesse_rock_role', 'individual');
        safeStorage.setItem('jesse_rock_device_id', correctUid);
        safeStorage.setItem(`jesse_rock_uid_${cleanUsername.toLowerCase()}`, correctUid);
        safeStorage.setItem('jesse_rock_my_username', existingData.username || cleanUsername);
        safeStorage.setItem('jesse_rock_user_id', correctUid);
        
        setSuccess(`Welcome back, ${existingData.username || cleanUsername}! Loading progress...`);
        setTimeout(() => {
          onAuthSuccess(existingData.username || cleanUsername, correctUid);
        }, 400);
        return;
      }

      const newUid = `dev_${Math.floor(100000 + Math.random() * 900000)}_${Date.now().toString(36)}`;

      try {
        await setDoc(nameDocRef, {
          uid: newUid,
          username: cleanUsername,
          password: cleanPassword,
          createdAt: Date.now()
        });
      } catch (err) {
        console.error("Could not register username on Firestore:", err);
        throw new Error("Failed to reserve legendary username. Please try again!");
      }

      const userProfileRef = doc(db, "users", newUid);
      try {
        await setDoc(userProfileRef, {
          uid: newUid,
          username: cleanUsername,
          displayName: cleanUsername,
          password: cleanPassword,
          role: 'INDIVIDUAL',
          accountType: 'INDIVIDUAL',
          xp: 100,
          streak: 1, 
          coins: 100,
          highScore: 0,
          solved: 0,
          correctAnswers: 0,
          currentLevel: 1,
          badges: ["Genius Debut"],
          createdAt: Date.now(),
          lastLoginAt: Date.now()
        }, { merge: true });
      } catch (err) {
        console.warn("Could not save initial user profile doc, falling back securely:", err);
      }

      safeStorage.setItem('jesse_rock_role', 'individual');
      safeStorage.setItem('jesse_rock_device_id', newUid);
      safeStorage.setItem(`jesse_rock_uid_${cleanUsername.toLowerCase()}`, newUid);
      safeStorage.setItem('jesse_rock_my_username', cleanUsername);
      safeStorage.setItem('jesse_rock_user_id', newUid);

      setSuccess(`Congratulations! Username "${cleanUsername}" is now registered.`);
      setTimeout(() => {
        onAuthSuccess(cleanUsername, newUid);
      }, 400);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to enter Jesse Math FC Pitch. Check internet connection.");
    } finally {
      setLoading(false);
    }
  };

  // 2. School Student Login Handler
  const handleStudentLoginSubmit = async (e: React.FormEvent) => {
    try {
      if (typeof window !== "undefined" && (window as any).grecaptcha) {
        (window as any).grecaptcha.enterprise.ready(async () => {
          await (window as any).grecaptcha.enterprise.execute("6Lc_gaYtAAAAADi2oCUupIL3_IAZcAuteN9h_7Nw", {action: "LOGIN"});
        });
      }
    } catch (e) {}

    e.preventDefault();
    setError(null);

    const cleanUser = studentUsername.trim();
    const cleanPass = studentPassword.trim();

    if (!cleanUser) {
      setError("Error: Student username is required.");
      return;
    }
    if (!cleanPass) {
      setError("Error: Student password pin is required.");
      return;
    }

    if (!isAppropriate(cleanUser)) {
      setError("Error: Username contains inappropriate language.");
      return;
    }

    setLoading(true);
    try {
      const res = await authenticateSchoolStudent(cleanUser, cleanPass);
      if (!res || !res.success || !res.userObj) {
        setError(res?.error || "Incorrect Student username or secret password pair.");
        setLoading(false);
        return;
      }

      const freshStudent = res.userObj;

      safeStorage.setItem('jesse_rock_role', 'student'); 
      safeStorage.setItem('jesse_rock_user_id', freshStudent.id);
      safeStorage.setItem('jesse_rock_my_username', freshStudent.username);
      safeStorage.setItem('jesse_rock_real_name', freshStudent.real_first_name);
      safeStorage.setItem('jesse_rock_teacher_id', freshStudent.teacher_id);
      if (freshStudent.class_code) {
        safeStorage.setItem('jesse_rock_class_code', freshStudent.class_code);
      }

      setSuccess(`Verified Striker Student @${freshStudent.username}! Preparing your instruments...`);
      setTimeout(() => {
        onAuthSuccess(freshStudent.username, freshStudent.id);
      }, 400);

    } catch (err: any) {
      setError(err.message || "Failed to log in student.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Teacher Login Handler
  const handleTeacherLoginSubmit = async (e: React.FormEvent) => {
    try {
      if (typeof window !== "undefined" && (window as any).grecaptcha) {
        (window as any).grecaptcha.enterprise.ready(async () => {
          await (window as any).grecaptcha.enterprise.execute("6Lc_gaYtAAAAADi2oCUupIL3_IAZcAuteN9h_7Nw", {action: "LOGIN"});
        });
      }
    } catch (e) {}

    e.preventDefault();
    setError(null);

    const cleanEmail = teacherEmail.trim().toLowerCase();
    const cleanPass = teacherPassword.trim();

    if (!cleanEmail) {
      setError("Error: Email address is required.");
      return;
    }
    if (!cleanPass) {
      setError("Error: Password is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await authenticateSchoolTeacher(cleanEmail, cleanPass);
      if (!res || !res.success || !res.userObj) {
        setError(res?.error || "Invalid teacher email or login password.");
        setLoading(false);
        return;
      }

      const authenticatedTeacher = res.userObj;

      safeStorage.setItem('jesse_rock_role', 'teacher');
      safeStorage.setItem('jesse_rock_user_id', authenticatedTeacher.id);
      safeStorage.setItem('jesse_rock_my_username', authenticatedTeacher.email);
      safeStorage.setItem('jesse_rock_real_name', authenticatedTeacher.teacher_name);
      if (authenticatedTeacher.class_code) {
        safeStorage.setItem('jesse_rock_class_code', authenticatedTeacher.class_code);
      }

      setSuccess(`Welcome back, Teacher ${authenticatedTeacher.teacher_name}! Synchronising...`);
      setTimeout(() => {
        onAuthSuccess(authenticatedTeacher.email, authenticatedTeacher.id);
      }, 400);

    } catch (err: any) {
      setError(err.message || "Teacher login check failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherGoogleLogin = async () => {
    try {
      if (typeof window !== "undefined" && (window as any).grecaptcha) {
        (window as any).grecaptcha.enterprise.ready(async () => {
          await (window as any).grecaptcha.enterprise.execute("6Lc_gaYtAAAAADi2oCUupIL3_IAZcAuteN9h_7Nw", {action: "LOGIN"});
        });
      }
    } catch (e) {}

    setError(null);
    setLoading(true);
    try {
      const cleanDomain = teacherWorkspaceDomain.trim().toLowerCase().replace(/^@/, '');
      if (cleanDomain) {
        safeStorage.setItem('jesse_rock_teacher_domain_filter', cleanDomain);
      }

      const res = await loginTeacherWithGoogle({
        restrictedDomain: cleanDomain || undefined,
        enforceWorkspaceDomain: enforceWorkspaceDomain
      });

      if (!res || !res.success || !res.userObj) {
        setError(res?.error || "Google Workspace teacher login failed.");
        setLoading(false);
        return;
      }
      const teacher = res.userObj;
      safeStorage.setItem('jesse_rock_role', 'teacher');
      safeStorage.setItem('jesse_rock_user_id', teacher.id);
      safeStorage.setItem('jesse_rock_my_username', teacher.email);
      safeStorage.setItem('jesse_rock_real_name', teacher.teacher_name);
      if (teacher.class_code) {
        safeStorage.setItem('jesse_rock_class_code', teacher.class_code);
      }

      const domainDisplay = teacher.workspace_domain || (teacher.email.includes('@') ? teacher.email.split('@')[1] : 'workspace');
      setSuccess(`Welcome back, Educator ${teacher.teacher_name}! Verified Workspace Domain: @${domainDisplay}`);
      setTimeout(() => {
        onAuthSuccess(teacher.email, teacher.id);
      }, 400);
    } catch (err: any) {
      setError(err.message || "Google Workspace teacher sign-in error.");
    } finally {
      setLoading(false);
    }
  };

  // 4. Teacher Registration Handler
  const handleTeacherSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = teacherNameSignup.trim();
    const cleanEmail = teacherEmailSignup.trim().toLowerCase();
    const cleanPass = teacherPasswordSignup.trim();

    if (!cleanName) {
      setError("Error: Educator's name is required.");
      return;
    }
    if (cleanName.length < 2) {
      setError("Error: Educator's name must be at least 2 characters long.");
      return;
    }

    if (!isAppropriate(cleanName) || !isAppropriate(cleanEmail)) {
      setError("Error: Name or email contains inappropriate language.");
      return;
    }
    if (!cleanEmail) {
      setError("Error: Registered email address is required.");
      return;
    }
    if (!cleanPass) {
      setError("Error: Roster workspace security password is required.");
      return;
    }
    if (cleanPass.length < 4) {
      setError("Error: Security password must be at least 4 characters long.");
      return;
    }

    setLoading(true);
    try {
      const res = await registerTeacher(cleanName, cleanEmail, cleanPass);
      if (!res.success || !res.userObj) {
        setError(res.error || "Educator account creation was unable to complete.");
        setLoading(false);
        return;
      }

      const freshlyTeacher = res.userObj;

      safeStorage.setItem('jesse_rock_role', 'teacher');
      safeStorage.setItem('jesse_rock_user_id', freshlyTeacher.id);
      safeStorage.setItem('jesse_rock_my_username', freshlyTeacher.email);
      safeStorage.setItem('jesse_rock_real_name', freshlyTeacher.teacher_name);
      safeStorage.setItem('jesse_rock_device_id', freshlyTeacher.id);
      if (freshlyTeacher.class_code) {
        safeStorage.setItem('jesse_rock_class_code', freshlyTeacher.class_code);
      }

      setSuccess(`Teacher Workspace Registered Successfully! Launching Class ${freshlyTeacher.teacher_name}...`);
      setTimeout(() => {
        onAuthSuccess(freshlyTeacher.email, freshlyTeacher.id);
      }, 400);

    } catch (err: any) {
      setError(err.message || "Failed to complete teacher registration.");
    } finally {
      setLoading(false);
    }
  };


    if (showLanding) {
    return (
      <div className="min-h-screen bg-[#E8F8F5] text-slate-900 overflow-y-auto font-sans relative">
        {/* Floating Kids Animation Emojis */}
        <div className="floating-bg-container fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-40">
          {backgroundEmojis.map((emoji, idx) => (
            <div
              key={`emoji-${emoji.id}-${idx}`}
              className="floating-emoji-item"
              style={{
                left: emoji.left,
                fontSize: emoji.size,
                animationDuration: emoji.duration,
                animationDelay: emoji.delay,
              }}
            >
              {emoji.char}
            </div>
          ))}
        </div>
        {/* Crisp mathematical coordinate grids */}
        <div 
          className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
          style={{ 
            backgroundImage: `
              linear-gradient(to right, #334155 1px, transparent 1px),
              linear-gradient(to bottom, #334155 1px, transparent 1px)
            `, 
            backgroundSize: '40px 40px' 
          }}
        />
        {/* Geometric equations layered subtly */}
        <div className="absolute top-20 right-20 z-0 opacity-5 pointer-events-none font-mono text-4xl select-none">
          ∑(x² + y²) = r²
        </div>
        <div className="absolute bottom-40 left-20 z-0 opacity-5 pointer-events-none font-mono text-4xl select-none">
          ∫ e^x dx = e^x + C
        </div>
        <div className="absolute top-1/2 left-1/3 z-0 opacity-5 pointer-events-none font-mono text-3xl select-none transform rotate-45">
          f'(x) = lim(h→0) [f(x+h) - f(x)] / h
        </div>
        
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-24 relative z-10 space-y-12 sm:space-y-16">
          
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Asymmetric Grid & Typography */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="lg:col-span-7 space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-slate-300 bg-white rounded text-xs font-semibold uppercase tracking-widest text-slate-600">
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
                Jesse Math FC
              </div>
              
              <h1 className="text-5xl md:text-7xl font-light tracking-tight text-slate-900 leading-[1.1]">
                Master mathematics.<br/>
                <span className="font-bold text-cyan-400">Zero hesitation.</span>
              </h1>
              
              <p className="text-lg md:text-xl text-slate-600 max-w-xl font-normal leading-relaxed">
                An elite educational platform engineered for mental acceleration. Replace anxiety with instant reflex through high-performance, live multiplayer calculation pitches.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                <button 
                  onClick={() => setShowLanding(false)}
                  className="w-full sm:w-auto px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded text-sm uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                >
                  <Zap size={18} /> Initialize Pitch
                </button>
                <button 
                  onClick={() => setShowLanding(false)}
                  className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-800 text-slate-900 font-semibold rounded text-sm uppercase tracking-widest border border-slate-300 transition-colors flex items-center justify-center gap-2"
                >
                  <User size={18} /> Authenticate
                </button>
              </div>
            </motion.div>

            {/* Right Column: Visual representation (SaaS dashboard interface trend) */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="lg:col-span-5 relative"
            >
              <div className="border border-slate-300 bg-white/80 p-6 rounded-lg relative overflow-hidden backdrop-blur-sm">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
                <div className="flex items-center justify-between border-b border-slate-300 pb-4 mb-4">
                  <div className="text-xs font-mono text-slate-600">SYSTEM_STATUS</div>
                  <div className="text-xs font-mono text-cyan-400">OPTIMAL</div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-[#E8F8F5] border border-slate-300 rounded">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="text-cyan-500" size={16} />
                      <span className="text-sm font-medium text-slate-700">Adaptive Engine</span>
                    </div>
                    <span className="text-xs font-mono text-slate-500">ACTIVE</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-[#E8F8F5] border border-slate-300 rounded">
                    <div className="flex items-center gap-3">
                      <Globe className="text-cyan-500" size={16} />
                      <span className="text-sm font-medium text-slate-700">Global Network</span>
                    </div>
                    <span className="text-xs font-mono text-slate-500">12ms LATENCY</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-[#E8F8F5] border border-slate-300 rounded">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="text-cyan-500" size={16} />
                      <span className="text-sm font-medium text-slate-700">COPPA Shield</span>
                    </div>
                    <span className="text-xs font-mono text-slate-500">VERIFIED</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            className="mt-32 pt-16 border-t border-slate-300"
          >
            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="w-10 h-10 bg-white border border-slate-300 flex items-center justify-center rounded">
                  <Database className="text-cyan-400" size={20} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Absolute Precision</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Engineered with strict algorithmic bounds. Every problem set is dynamically generated for perfect difficulty scaling without repetitive fatigue.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="w-10 h-10 bg-white border border-slate-300 flex items-center justify-center rounded">
                  <Terminal className="text-cyan-400" size={20} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Zero Latency Architecture</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Built on a modern stack ensuring immediate input validation and real-time multiplayer synchronization. No lag, just pure mental speed.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="w-10 h-10 bg-white border border-slate-300 flex items-center justify-center rounded">
                  <Award className="text-cyan-400" size={20} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Quantifiable Mastery</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Transparent metrics and verified progression. Achieve Grand Master certification backed by rigorous, time-bound testing parameters.
                </p>
              </div>
            </div>
          </motion.div>

          
          {/* App History & Origin Story */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
            className="mt-32 pt-16 border-t border-slate-300 grid md:grid-cols-2 gap-12 items-center"
          >
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold tracking-wide uppercase">
                <span>📖</span> Platform Heritage & History
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                Born from a Passion for Fearless Mathematics
              </h2>
              <p className="text-slate-600 leading-relaxed text-base">
                Jesse Math FC was founded on June 20, 2026, by visionary educator and developer <strong>Jesse Otobo</strong>. Witnessing how standard timed drills paralyzed young learners with math anxiety, Jesse set out to bridge the gap between high-octane arcade gaming and rigorous mathematics.
              </p>
              <p className="text-slate-600 leading-relaxed text-base">
                What started as a simple mental arithmetic prototype rapidly evolved into an elite multiplayer EdTech pitch trusted by classrooms worldwide, empowering thousands of students to master their arithmetic, algebra, and fractions without fear.
              </p>
              <div className="flex items-center gap-4 pt-2">
                <div className="flex -space-x-2">
                  <span className="w-10 h-10 rounded-full bg-cyan-500 text-white font-bold flex items-center justify-center border-2 border-white shadow">JO</span>
                  <span className="w-10 h-10 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center border-2 border-white shadow">⚽</span>
                  <span className="w-10 h-10 rounded-full bg-purple-500 text-white font-bold flex items-center justify-center border-2 border-white shadow">🚀</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Created by Jesse Otobo</div>
                  <div className="text-xs text-slate-500">Lead Architect & Educator</div>
                </div>
              </div>
            </div>

            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="bg-white border-2 border-slate-200 p-8 rounded-3xl shadow-xl relative overflow-hidden"
            >
              <div className="absolute -right-10 -bottom-10 text-9xl opacity-10 select-none">⚽</div>
              <div className="space-y-4 relative z-10">
                <div className="text-xs font-mono font-bold text-emerald-600 uppercase tracking-widest">Mission Statement</div>
                <h3 className="text-2xl font-bold text-slate-900">"Transforming Math into Music and Mastery."</h3>
                <p className="text-slate-600 text-sm italic">
                  "We believe every child is a natural mathematician when given the right rhythm, low-stress environment, and joyful encouragement."
                </p>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
                  <span>EST. JUNE 20, 2026</span>
                  <span className="text-emerald-600 font-bold">VERIFIED PLATFORM</span>
                </div>
              </div>
            </motion.div>
          </motion.div>



          {/* YouTube Video Embed & Comprehensive Curriculum Breakdown */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, delay: 0.7, ease: "easeOut" }}
            className="mt-32 pt-16 border-t border-slate-300 space-y-16"
          >
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full text-xs font-bold tracking-wide uppercase">
                <span>▶️</span> Watch Platform Demo
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                See Jesse Math FC in Action
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed">
                Watch our official walkthrough video to see how live multiplayer battles, zero-lag mechanics, and adaptive speed drills transform math practice into an addictive football match.
              </p>
            </div>

            
          {/* Extra Gliding Benefits & Features */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mt-24 grid md:grid-cols-3 gap-8"
          >
            <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="bg-white border-2 border-emerald-200 p-8 rounded-3xl shadow-xl space-y-4 relative overflow-hidden"
            >
              <div className="absolute -right-6 -bottom-6 text-7xl opacity-10 select-none">🌟</div>
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center font-bold text-xl shadow-sm">🏆</div>
              <h3 className="text-xl font-bold text-slate-900">Real-Time Leaderboards</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Compete with students worldwide on live global and classroom leaderboards. Earn football badges, level up your avatar, and celebrate math milestones together.
              </p>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="bg-white border-2 border-cyan-200 p-8 rounded-3xl shadow-xl space-y-4 relative overflow-hidden"
            >
              <div className="absolute -right-6 -bottom-6 text-7xl opacity-10 select-none">⚡</div>
              <div className="w-12 h-12 bg-cyan-100 text-cyan-700 rounded-2xl flex items-center justify-center font-bold text-xl shadow-sm">⚡</div>
              <h3 className="text-xl font-bold text-slate-900">Lightning Fast Feedback</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Instant visual and audio feedback rewards correct answers immediately, reinforcing positive numerical instincts and keeping engagement sky-high.
              </p>
            </motion.div>

            <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut" }}
              className="bg-white border-2 border-purple-200 p-8 rounded-3xl shadow-xl space-y-4 relative overflow-hidden"
            >
              <div className="absolute -right-6 -bottom-6 text-7xl opacity-10 select-none">🛡️</div>
              <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center font-bold text-xl shadow-sm">👨‍👩‍👧‍👦</div>
              <h3 className="text-xl font-bold text-slate-900">Parent & Guardian Secret Portal</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Dedicated parent access via Google or Mobile SMS Phone verification. Monitor child learning progress, speed drill accuracy, and live homework assignments in real-time.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => { setShowLanding(false); setLoginTab('parent'); }}
                  className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-95"
                >
                  <Users size={14} />
                  <span>Enter Parent Portal</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setShowLanding(false); setLoginTab('teacher'); }}
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <GraduationCap size={14} />
                  <span>Teacher Portal</span>
                </button>
              </div>
            </motion.div>
          </motion.div>


{/* YouTube Link Banner with 8K MaxRes Thumbnail Preview (Opens in New Tab) */}
            <div className="max-w-4xl mx-auto bg-white p-4 rounded-3xl border-2 border-slate-200 shadow-xl overflow-hidden">
              <a 
                href="https://www.youtube.com/watch?v=BiOiAtKTfsQ" 
                target="_blank" 
                rel="noopener noreferrer"
                className="relative block w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 group cursor-pointer shadow-inner"
              >
                <img 
                  src="https://img.youtube.com/vi/BiOiAtKTfsQ/maxresdefault.jpg" 
                  alt="Jesse Math FC 8K Video Thumbnail" 
                  className="w-full h-full object-cover filter contrast-110 saturate-120 transform group-hover:scale-105 transition-transform duration-700"
                  onError={(e) => { e.currentTarget.src = 'https://img.youtube.com/vi/BiOiAtKTfsQ/hqdefault.jpg'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 bg-red-600 rounded-3xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 group-hover:bg-red-500 transition-all duration-300 border-4 border-white/80">
                    <div className="w-0 h-0 border-y-[14px] border-y-transparent border-l-[24px] border-l-white ml-1.5" />
                  </div>
                </div>
                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-white drop-shadow-md">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-red-600 rounded-xl text-xs font-mono font-black uppercase tracking-wider">8K Ultra HD</span>
                    <span className="font-bold text-lg md:text-xl">Watch Jesse Math FC on YouTube</span>
                  </div>
                  <span className="text-sm font-semibold underline text-cyan-300 group-hover:text-white transition-colors">Open YouTube ↗</span>
                </div>
              </a>
            </div>

            {/* Complete Topics & Benefits Deep Dive */}
            <div className="grid lg:grid-cols-2 gap-12 items-center mt-20">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold tracking-wide uppercase">
                  <span>📚</span> All Core Topics Covered
                </div>
                <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
                  A Complete Mathematical Ecosystem for K-12 & Beyond
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Jesse Math FC is meticulously engineered to cover every essential pillar of early and intermediate mathematical proficiency, ensuring students develop intuition rather than rote memorization.
                </p>

                <div className="grid sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-1">
                    <div className="font-bold text-slate-900 flex items-center gap-2">➕ Basic Arithmetic</div>
                    <p className="text-xs text-slate-600">Addition, subtraction, multiplication & division speed mastery.</p>
                  </div>
                  <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-1">
                    <div className="font-bold text-slate-900 flex items-center gap-2">⚖️ Fractions & Decimals</div>
                    <p className="text-xs text-slate-600">Visual slider balance, equivalence, and decimal conversion.</p>
                  </div>
                  <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-1">
                    <div className="font-bold text-slate-900 flex items-center gap-2">📐 Pre-Algebra & X</div>
                    <p className="text-xs text-slate-600">Solving unknown variables, exponents, and order of operations.</p>
                  </div>
                  <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-1">
                    <div className="font-bold text-slate-900 flex items-center gap-2">📈 Percentages & Ratios</div>
                    <p className="text-xs text-slate-600">Real-world financial literacy, discounts, and proportional scaling.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-slate-200 p-8 md:p-10 rounded-3xl shadow-xl space-y-6">
                <div className="text-xs font-mono font-bold text-cyan-600 uppercase tracking-widest">Platform Benefits</div>
                <h4 className="text-2xl font-bold text-slate-900">Why Students, Parents, and Schools Choose Us</h4>
                
                <div className="space-y-4 text-slate-700 text-sm">
                  <motion.div 
                    whileHover={{ x: 6 }} 
                    transition={{ type: "spring", stiffness: 300 }}
                    className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/60 flex items-start gap-3"
                  >
                    <span className="text-emerald-600 font-bold text-lg">🛡️</span>
                    <div>
                      <strong className="text-slate-900 block mb-0.5">1. Eliminates Math Anxiety & Fear</strong>
                      By blending interactive arcade music, vibrant visuals, and positive reinforcement, students drop performance anxiety and embrace mistakes as fun puzzles.
                    </div>
                  </motion.div>

                  <motion.div 
                    whileHover={{ x: 6 }} 
                    transition={{ type: "spring", stiffness: 300 }}
                    className="p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 flex items-start gap-3"
                  >
                    <span className="text-cyan-600 font-bold text-lg">⚡</span>
                    <div>
                      <strong className="text-slate-900 block mb-0.5">2. Zero-Lag Real-Time Multiplayer</strong>
                      Built with instant WebSocket and Firestore sync, allowing classmates and global peers to battle head-to-head seamlessly without freezing or network delay.
                    </div>
                  </motion.div>

                  <motion.div 
                    whileHover={{ x: 6 }} 
                    transition={{ type: "spring", stiffness: 300 }}
                    className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20 flex items-start gap-3"
                  >
                    <span className="text-purple-600 font-bold text-lg">🔒</span>
                    <div>
                      <strong className="text-slate-900 block mb-0.5">3. 100% COPPA & Student Privacy Safe</strong>
                      Designed specifically for classrooms with strict zero-tracking policies, no third-party ad networks, and complete teacher administrative control.
                    </div>
                  </motion.div>

                  <motion.div 
                    whileHover={{ x: 6 }} 
                    transition={{ type: "spring", stiffness: 300 }}
                    className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 flex items-start gap-3"
                  >
                    <span className="text-amber-600 font-bold text-lg">🎖️</span>
                    <div>
                      <strong className="text-slate-900 block mb-0.5">4. Printable Grand Master Certification</strong>
                      Students who conquer 200 rigorous equations unlock official verifiable certificates complete with badges to proudly hang on classroom walls or fridges.
                    </div>
                  </motion.div>

                  <motion.div 
                    whileHover={{ x: 6 }} 
                    transition={{ type: "spring", stiffness: 300 }}
                    className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 flex items-start gap-3"
                  >
                    <span className="text-blue-600 font-bold text-lg">📈</span>
                    <div>
                      <strong className="text-slate-900 block mb-0.5">5. Actionable Teacher & Parent Dashboards</strong>
                      Educators gain real-time visibility into student accuracy, speed trends, and trouble spots, enabling precise, targeted interventions.
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

          </motion.div>


{/* Detailed Educational Purpose & Platform Modules Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
            className="mt-32 pt-16 border-t border-slate-300 space-y-16"
          >
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                Why Jesse Math FC Changes Everything
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed">
                Traditional math education is plagued by slow drills, anxiety, and rigid testing. Jesse Math FC transforms calculations into an electrifying, gamified experience that builds lifelong confidence and lightning-fast mental math reflexes.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white border border-slate-300 p-8 rounded-2xl shadow-sm space-y-4">
                <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center justify-center text-cyan-600 font-bold text-xl">
                  🧠
                </div>
                <h3 className="text-xl font-bold text-slate-900">Eradicating Math Anxiety</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  By framing practice as an interactive football arcade game rather than stressful testing, students drop their guard, embrace mistakes as learning moments, and build healthy mathematical resilience.
                </p>
              </div>

              <div className="bg-white border border-slate-300 p-8 rounded-2xl shadow-sm space-y-4">
                <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-600 font-bold text-xl">
                  ⚡
                </div>
                <h3 className="text-xl font-bold text-slate-900">Adaptive Speed Engine</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Our intelligent algorithm continuously evaluates user response times and accuracy, dynamically adjusting difficulty from basic arithmetic to complex algebraic equations in real time.
                </p>
              </div>

              <div className="bg-white border border-slate-300 p-8 rounded-2xl shadow-sm space-y-4">
                <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/30 rounded-xl flex items-center justify-center text-purple-600 font-bold text-xl">
                  🏆
                </div>
                <h3 className="text-xl font-bold text-slate-900">Grand Master Certification</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Students who conquer 200 rigorous problems unlock official, printable Grand Master certificates complete with verification badges to proudly showcase their milestone achievement.
                </p>
              </div>

              <div className="bg-white border border-slate-300 p-8 rounded-2xl shadow-sm space-y-4">
                <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-center text-amber-600 font-bold text-xl">
                  🏫
                </div>
                <h3 className="text-xl font-bold text-slate-900">Teacher & Classroom Roster Tools</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Educators get instant access to live student progress dashboards, custom assignment schedulers, and zero-friction class codes for seamless math lab integration.
                </p>
              </div>

              <div className="bg-white border border-slate-300 p-8 rounded-2xl shadow-sm space-y-4">
                <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center justify-center text-rose-600 font-bold text-xl">
                  🛡️
                </div>
                <h3 className="text-xl font-bold text-slate-900">100% COPPA & Safe Schools</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Strict privacy controls, zero tracking cookies, and automated name screening ensure a completely safe, distraction-free environment trusted by schools worldwide.
                </p>
              </div>

              <div className="bg-white border border-slate-300 p-8 rounded-2xl shadow-sm space-y-4">
                <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center justify-center text-blue-600 font-bold text-xl">
                  ⚔️
                </div>
                <h3 className="text-xl font-bold text-slate-900">Live Multiplayer Duels</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Challenge classmates or global peers in thrilling head-to-head calculation matches where speed, accuracy, and quick thinking crown the ultimate Math Striker.
                </p>
              </div>
            </div>

            {/* Curriculum Coverage Breakdown */}
            <div className="bg-white border border-slate-300 p-8 md:p-12 rounded-3xl shadow-sm space-y-8">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-600">Comprehensive Curriculum</span>
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900">From Elementary Basics to Advanced Algebra</h3>
                <p className="text-slate-600 text-sm">Built to align with international educational standards across all core math domains.</p>
              </div>

              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div className="p-4 bg-[#E8F8F5] rounded-xl border border-slate-200">
                  <div className="text-2xl mb-2">➕ ➖</div>
                  <h4 className="font-bold text-slate-900 mb-1">Arithmetic</h4>
                  <p className="text-xs text-slate-600">Addition, subtraction, multiplication & division mastery.</p>
                </div>
                <div className="p-4 bg-[#E8F8F5] rounded-xl border border-slate-200">
                  <div className="text-2xl mb-2">⚖️</div>
                  <h4 className="font-bold text-slate-900 mb-1">Fractions & Decimals</h4>
                  <p className="text-xs text-slate-600">Visual slider balancing and fractional equivalence.</p>
                </div>
                <div className="p-4 bg-[#E8F8F5] rounded-xl border border-slate-200">
                  <div className="text-2xl mb-2">📐</div>
                  <h4 className="font-bold text-slate-900 mb-1">Pre-Algebra</h4>
                  <p className="text-xs text-slate-600">Solving for x, exponents, and order of operations.</p>
                </div>
                <div className="p-4 bg-[#E8F8F5] rounded-xl border border-slate-200">
                  <div className="text-2xl mb-2">⏱️</div>
                  <h4 className="font-bold text-slate-900 mb-1">Speed Drills</h4>
                  <p className="text-xs text-slate-600">Time-trial challenges to build instant mental reflex.</p>
                </div>
              </div>
            </div>

          </motion.div>

        </section>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-4 sm:p-6 bg-[#E8F8F5] relative overflow-x-hidden font-sans text-slate-800">
      {/* Crisp mathematical coordinate grids */}
      <div 
        className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
        style={{ 
          backgroundImage: `linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)`,
          backgroundSize: "40px 40px" 
        }}
      />
      <div className="w-full flex-1 flex flex-col items-center justify-center relative z-10">
{/* SEALED COMPONENT CHECK: Render Developer Portal Dashboard if Dev Authenticated and developer tab active */}
      {isDevAuthenticated && loginTab === 'developer' ? (
        <motion.div 
          id="developer-dashboard"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-5xl bg-sunny-yellow backdrop-blur-xl border border-deep-navy border-4 p-6 md:p-8 rounded-[2.5rem] shadow-2xl relative z-10 space-y-8 text-left"
        >
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-tr from-cyan-500 to-indigo-600 rounded-2xl flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(6,182,212,0.3)] select-none border border-cyan-400">
                👑
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black text-deep-navy tracking-tight uppercase">Jesse Otobo's Developer Portal</h1>
                  <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded text-[9px] font-mono font-black text-amber-500 uppercase">
                    ELITE DEVELOPER
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded text-[9px] font-mono font-black text-emerald-400 uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> SESSION SECURE
                  </span>
                </div>
                <p className="text-xs text-deep-navy font-medium font-mono mt-0.5">Device ID Authentication Handshake Status: APPROVED</p>
              </div>
            </div>
            
            <button
              onClick={handleDevLogout}
              className="px-4 py-2 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/60 rounded-xl text-xs font-black uppercase text-rose-400 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <LogOut size={13} />
              <span>TERMINATE SESSION</span>
            </button>
          </div>

          {/* 4-Column Performance Metrics Layout Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1 */}
            <div className="bg-white backdrop-blur-md/45 border border-deep-navy border-4 p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-inner">
              <span className="text-[10px] font-black uppercase tracking-wider text-deep-navy font-mono">Dynamic Net Worth</span>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-[#10b981] font-mono">£{dynamicNetWorth.toLocaleString()}</span>
                <span className="text-[10px] text-emerald-500 font-mono font-bold">LIVE</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Starting base: £{BASE_NET_WORTH.toLocaleString()} + deployed modules</p>
            </div>

            {/* Metric 2 */}
            <div className="bg-white backdrop-blur-md/45 border border-deep-navy border-4 p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-inner">
              <span className="text-[10px] font-black uppercase tracking-wider text-deep-navy font-mono">Dynamic Asset Value</span>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-cyan-400 font-mono">£{dynamicAssetValue.toLocaleString()}</span>
                <span className="text-[10px] text-cyan-500 font-mono font-bold">SECURED</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Starting base: £{BASE_ASSET_VALUE.toLocaleString()} + deployed modules</p>
            </div>

            {/* Metric 3 */}
            <div className="bg-white backdrop-blur-md/45 border border-deep-navy border-4 p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-inner">
              <span className="text-[10px] font-black uppercase tracking-wider text-deep-navy font-mono">System Health / Latency</span>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-[#10b981] font-mono">{latency}ms</span>
                <span className="text-[10px] text-emerald-500 font-mono font-bold uppercase">HEALTHY</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Firestore connection sync active</p>
            </div>

            {/* Metric 4 */}
            <div className="bg-white backdrop-blur-md/45 border border-deep-navy border-4 p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-inner">
              <span className="text-[10px] font-black uppercase tracking-wider text-deep-navy font-mono">Active Observers</span>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-amber-500 font-mono">{visitorCount}</span>
                <span className="text-[10px] text-amber-500 font-mono font-bold uppercase animate-pulse">● LIVE</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Active client sockets synchronized</p>
            </div>
          </div>

          {/* Double Column Data Split Ledger */}
          <div className="grid lg:grid-cols-12 gap-6">
            
            {/* Left: Deployed modules & Live Database Logs Ledger */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Feature Deployment Module Controller */}
              <div className="bg-white backdrop-blur-md/45 border border-deep-navy border-4 rounded-2xl p-5 space-y-4 shadow-inner">
                <div>
                  <h3 className="text-xs font-black uppercase text-deep-navy tracking-wider font-mono">Module Configuration Engine</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Toggle mathematical modules to dynamically adjust valuation matrix, net worth, and asset value equations.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3.5">
                  {features.map((f, idx) => (
                    <div 
                      key={`${f.id}-${idx}`}
                      className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                        f.deployed 
                          ? 'bg-clean-white border-cyan-500/25 shadow-inner' 
                          : 'bg-white backdrop-blur-md/40 border-deep-navy border-4 opacity-60'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-deep-navy leading-snug">{f.name}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono uppercase font-black ${
                            f.deployed ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-800 text-slate-500'
                          }`}>
                            {f.deployed ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono mt-1">Driver: {f.logicDriver}</p>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-deep-navy border-4 mt-1">
                        <span className="text-[10px] font-mono font-black text-[#10b981]">+£{f.valueBoost.toLocaleString()}</span>
                        
                        {/* Custom switch slider */}
                        <button
                          type="button"
                          onClick={() => handleToggleFeature(f.id)}
                          className={`w-14 h-7 rounded-full p-1 transition-colors focus:outline-none cursor-pointer relative shrink-0 ${
                            f.deployed ? 'bg-cyan-500' : 'bg-slate-850'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white backdrop-blur-md rounded-full shadow-md transform transition-transform ${
                            f.deployed ? 'translate-x-7' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Scrolling Logs Ledger */}
              <div className="bg-white backdrop-blur-md/45 border border-deep-navy border-4 rounded-2xl p-5 space-y-3 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal size={14} className="text-cyan-400" />
                    <h3 className="text-xs font-black uppercase text-deep-navy tracking-wider font-mono">Live Sync Security Stream Ledger</h3>
                  </div>
                  <span className="text-[9px] font-mono font-medium text-slate-500">Key: {cloudKey}</span>
                </div>

                <div className="h-44 bg-white backdrop-blur-md/80 border border-deep-navy border-4 rounded-xl p-3.5 font-mono text-[10px] text-deep-navy overflow-y-auto space-y-2 select-text">
                  {systemLogs.map((log, i) => (
                    <div key={i} className="leading-relaxed hover:bg-white/5 p-0.5 rounded transition-colors">
                      <span className="text-cyan-500/90">&gt;</span> <span className={`${
                        log.includes('[ERROR]') ? 'text-rose-400' : 
                        log.includes('[TRIGGER]') ? 'text-amber-400' : 
                        log.includes('[SECURE]') || log.includes('[SUCCESS]') ? 'text-[#10b981]' : 'text-slate-350'
                      }`}>{log}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right: Engagement Metric Donut Chart */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white backdrop-blur-md/45 border border-deep-navy border-4 rounded-2xl p-5 flex flex-col items-center text-center justify-center space-y-4 shadow-inner">
                <div className="w-full text-left">
                  <h3 className="text-xs font-black uppercase text-deep-navy tracking-wider font-mono">Platform Deployment Metric</h3>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">Asset deployment utilization</p>
                </div>

                {/* Donut Chart SVG */}
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background Circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth="7"
                    />
                    {/* Progress Circle with calculated dynamic offsets */}
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="38" 
                      stroke="#3b82f6" 
                      strokeWidth="7" 
                      fill="transparent" 
                      strokeDasharray="238.76" 
                      strokeDashoffset={isNaN(dynamicAssetValue) ? 238.76 : (238.76 - (238.76 * (dynamicAssetValue / 12000)))}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  {/* Inside Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-deep-navy font-mono">{engagementPercentage || 0}%</span>
                    <span className="text-[9px] font-mono text-deep-navy font-black uppercase">DEPLOYED</span>
                  </div>
                </div>

                <div className="w-full space-y-2 border-t border-deep-navy border-4 pt-4">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-deep-navy">Deployed Boost:</span>
                    <span className="text-emerald-400 font-black">+£{deployedBoost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-deep-navy">Base Net Worth:</span>
                    <span className="text-deep-navy">£{BASE_NET_WORTH.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono font-bold border-t border-dashed border-deep-navy border-4 pt-2 mt-1">
                    <span className="text-deep-navy">Active Net Worth:</span>
                    <span className="text-cyan-400 font-black">£{dynamicNetWorth.toLocaleString()}</span>
                  </div>
                </div>
              </div>



            </div>

          </div>
        </motion.div>
      ) : (
        /* If Developer is NOT authorized or we are in another tab, show the main AuthGate view with the three-portal selector */
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm bg-white border border-slate-200 p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative z-10 space-y-8 text-center"
        >
          {/* Logo and Brand details */}
          <div className="space-y-4">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm border border-slate-200 mx-auto"
            >
              <img src="https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Farticles%2Fvk11iy6n5ppdp0j4nm46.png" alt="Jesse Math FC Logo" className="w-full h-full object-cover block" referrerPolicy="no-referrer" />
            </motion.div>
            
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 leading-none">
                Math Pitch
              </h1>
              <p className="text-sm text-slate-500 font-medium tracking-wide uppercase">
                Enterprise Education Portal
              </p>
            </div>
            
            <div className="py-1 px-3 bg-cyan-50 border border-cyan-100 text-cyan-700 rounded-full text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-1.5 justify-center mx-auto">
              <ShieldCheck size={12} /> Secure Access Verified
            </div>
          </div>

          {/* 4-Way Portal Selector: Classroom, Striker, Teacher, Parent */}
          <div className="grid grid-cols-4 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200 gap-1 shadow-inner">
            <button
              type="button"
              onClick={() => { setLoginTab('classroom'); setError(null); setSuccess(null); }}
              className={`py-2 px-1 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                loginTab === 'classroom'
                  ? 'bg-white text-cyan-800 shadow-sm border border-slate-200 ring-2 ring-cyan-500/20'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <School size={15} className={loginTab === 'classroom' ? 'text-cyan-600' : ''} />
              <span className="truncate w-full text-center">Classroom</span>
            </button>
            
            <button
              type="button"
              onClick={() => { setLoginTab('individual'); setError(null); setSuccess(null); }}
              className={`py-2 px-1 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                loginTab === 'individual'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200 ring-2 ring-cyan-500/20'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <User size={15} className={loginTab === 'individual' ? 'text-cyan-600' : ''} />
              <span className="truncate w-full text-center">Striker</span>
            </button>
            
            <button
              type="button"
              onClick={() => { setLoginTab('teacher'); setError(null); setSuccess(null); }}
              className={`py-2 px-1 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                loginTab === 'teacher'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200 ring-2 ring-cyan-500/20'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <GraduationCap size={15} className={loginTab === 'teacher' ? 'text-cyan-600' : ''} />
              <span className="truncate w-full text-center">Teacher</span>
            </button>

            <button
              type="button"
              onClick={() => { setLoginTab('parent'); setError(null); setSuccess(null); }}
              className={`py-2 px-1 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                loginTab === 'parent'
                  ? 'bg-white text-purple-900 shadow-sm border border-purple-200 ring-2 ring-purple-500/20'
                  : 'text-slate-500 hover:text-purple-700'
              }`}
            >
              <Users size={15} className={loginTab === 'parent' ? 'text-purple-600' : ''} />
              <span className="truncate w-full text-center">Parent</span>
            </button>
          </div>

          {/* Notifications and messages inside card */}
          {error && loginTab !== 'developer' && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold rounded-xl flex items-start gap-2 text-left"
            >
              <ShieldAlert size={14} className="shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && loginTab !== 'developer' && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold rounded-xl flex items-start gap-2 text-left"
            >
              <Check size={14} className="shrink-0 mt-0.5 text-emerald-600" />
              <span>{success}</span>
            </motion.div>
          )}

          {/* Tab: Classroom Portal (Join with Code, Sign In, or Self-Register) */}
          {loginTab === 'classroom' && (
            <div className="space-y-4 text-left">
              {/* Classroom Mode Sub-Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-[10px] font-bold uppercase tracking-wider gap-1">
                <button
                  type="button"
                  onClick={() => { setClassroomSubMode('join_code'); setError(null); setSuccess(null); }}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center flex items-center justify-center gap-1 ${
                    classroomSubMode === 'join_code'
                      ? 'bg-white text-cyan-800 shadow-sm border border-slate-200 font-black'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Zap size={11} className="text-cyan-600" />
                  <span>Join Code</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setClassroomSubMode('student_login'); setError(null); setSuccess(null); }}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center flex items-center justify-center gap-1 ${
                    classroomSubMode === 'student_login'
                      ? 'bg-white text-cyan-800 shadow-sm border border-slate-200 font-black'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <LogIn size={11} className="text-cyan-600" />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setClassroomSubMode('student_signup'); setError(null); setSuccess(null); }}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center flex items-center justify-center gap-1 ${
                    classroomSubMode === 'student_signup'
                      ? 'bg-white text-cyan-800 shadow-sm border border-slate-200 font-black'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <UserPlus size={11} className="text-cyan-600" />
                  <span>Register</span>
                </button>
              </div>

              {/* Submode 1: Join with Code */}
              {classroomSubMode === 'join_code' && (
                <div>
                  {classSessionStatus === 'removed' ? (
                    <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-3">
                      <div className="w-12 h-12 mx-auto flex items-center justify-center bg-rose-100 rounded-full text-rose-600 text-2xl">
                        🚫
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-xs font-black uppercase text-rose-700">Session Ended</h3>
                        <p className="text-[11px] text-slate-600 font-medium">
                          You have been removed from this classroom session by the teacher.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleLeaveClass}
                        className="w-full py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer"
                      >
                        Reset & Join Again
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleClassLoginSubmit} className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block ml-1">
                          Student Name / Handle
                        </label>
                        <div className="relative group">
                          <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
                          <input
                            type="text"
                            placeholder="e.g. Alex"
                            value={classStudentName}
                            onChange={(e) => setClassStudentName(e.target.value)}
                            className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs outline-none focus:bg-white focus:border-cyan-600 focus:ring-2 focus:ring-cyan-50 transition-all font-semibold"
                            autoComplete="off"
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block ml-1">
                          Teacher's Class Code
                        </label>
                        <div className="relative group">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full overflow-hidden border border-slate-200">
                            <img src="https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Farticles%2Fvk11iy6n5ppdp0j4nm46.png" alt="Logo" className="w-full h-full object-cover" />
                          </div>
                          <input
                            type="text"
                            placeholder="e.g. JESSE-123 or ABC789"
                            value={classCodeInput}
                            onChange={(e) => setClassCodeInput(e.target.value.toUpperCase())}
                            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs outline-none focus:bg-white focus:border-cyan-600 focus:ring-2 focus:ring-cyan-50 transition-all font-mono font-bold tracking-wider uppercase"
                            autoComplete="off"
                            disabled={loading}
                          />
                        </div>
                        <p className="text-[9px] text-slate-400 ml-1 font-medium">
                          Ask your teacher for the Class Code displayed on their board.
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold uppercase tracking-wider transition-all duration-200 rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md shadow-cyan-600/20"
                      >
                        {loading ? (
                          <>
                            <RefreshCw size={13} className="animate-spin" />
                            <span>Verifying Code...</span>
                          </>
                        ) : (
                          <>
                            <LogIn size={13} />
                            <span>Enter Classroom</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Submode 2: Student Account Sign In */}
              {classroomSubMode === 'student_login' && (
                <form onSubmit={handleStudentLoginSubmit} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block ml-1">
                      Student Username
                    </label>
                    <div className="relative group">
                      <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
                      <input
                        type="text"
                        placeholder="e.g. alex_math"
                        value={studentUsername}
                        onChange={(e) => setStudentUsername(e.target.value.replace(/\s/g, ''))}
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs outline-none focus:bg-white focus:border-cyan-600 focus:ring-2 focus:ring-cyan-50 transition-all font-semibold"
                        autoComplete="off"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block ml-1">
                      Student Passkey / PIN
                    </label>
                    <div className="relative group">
                      <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
                      <input
                        type={showStudentPassword ? "text" : "password"}
                        placeholder="••••"
                        value={studentPassword}
                        onChange={(e) => setStudentPassword(e.target.value)}
                        className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs outline-none focus:bg-white focus:border-cyan-600 focus:ring-2 focus:ring-cyan-50 transition-all font-semibold"
                        autoComplete="off"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowStudentPassword(!showStudentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      >
                        {showStudentPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-wider transition-all duration-200 rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md shadow-emerald-600/20"
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <LogIn size={13} />
                        <span>Sign In to Classroom</span>
                      </>
                    )}
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => { setClassroomSubMode('student_signup'); setError(null); }}
                      className="text-[10px] text-cyan-600 hover:text-cyan-700 font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Need to register? Sign up here
                    </button>
                  </div>
                </form>
              )}

              {/* Submode 3: Student Self-Registration */}
              {classroomSubMode === 'student_signup' && (
                <form onSubmit={handleStudentSignupSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block ml-1">
                      Real First Name
                    </label>
                    <div className="relative group">
                      <Contact size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
                      <input
                        type="text"
                        placeholder="e.g. Alex"
                        value={studentSignupRealName}
                        onChange={(e) => setStudentSignupRealName(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs outline-none focus:bg-white focus:border-cyan-600 focus:ring-2 focus:ring-cyan-50 transition-all font-semibold"
                        autoComplete="off"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block ml-1">
                      Create Username
                    </label>
                    <div className="relative group">
                      <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
                      <input
                        type="text"
                        placeholder="e.g. alex_math10"
                        value={studentSignupUsername}
                        onChange={(e) => setStudentSignupUsername(e.target.value.replace(/\s/g, ''))}
                        className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs outline-none focus:bg-white focus:border-cyan-600 focus:ring-2 focus:ring-cyan-50 transition-all font-semibold"
                        autoComplete="off"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block ml-1">
                      Create Secret PIN / Passkey
                    </label>
                    <div className="relative group">
                      <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
                      <input
                        type={showStudentSignupPassword ? "text" : "password"}
                        placeholder="e.g. 1234"
                        value={studentSignupPassword}
                        onChange={(e) => setStudentSignupPassword(e.target.value)}
                        className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs outline-none focus:bg-white focus:border-cyan-600 focus:ring-2 focus:ring-cyan-50 transition-all font-semibold"
                        autoComplete="off"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowStudentSignupPassword(!showStudentSignupPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      >
                        {showStudentSignupPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block ml-1">
                      Teacher's Class Code
                    </label>
                    <div className="relative group">
                      <School size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
                      <input
                        type="text"
                        placeholder="e.g. JESSE-123"
                        value={studentSignupClassCode}
                        onChange={(e) => setStudentSignupClassCode(e.target.value.toUpperCase())}
                        className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs outline-none focus:bg-white focus:border-cyan-600 focus:ring-2 focus:ring-cyan-50 transition-all font-mono font-bold uppercase tracking-wider"
                        autoComplete="off"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold uppercase tracking-wider transition-all duration-200 rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md shadow-cyan-600/20"
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        <span>Registering...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus size={13} />
                        <span>Create Account & Join</span>
                      </>
                    )}
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => { setClassroomSubMode('student_login'); setError(null); }}
                      className="text-[10px] text-slate-500 hover:text-slate-700 font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Already have an account? Sign in
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Tab 2: Solo Striker Login / Instant Registration */}
          {loginTab === 'individual' && (
            <div className="space-y-4 text-left">
              <form onSubmit={handleHomeLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest block font-sans ml-1">
                    Username
                  </label>
                  <div className="relative group">
                    <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
                    <input
                      type="text"
                      placeholder="MasterMind"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm outline-none focus:bg-white focus:border-cyan-600 focus:ring-4 focus:ring-cyan-50 transition-all font-semibold"
                      autoComplete="off"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest block font-sans ml-1">
                    Secret PIN
                  </label>
                  <div className="relative group">
                    <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm outline-none focus:bg-white focus:border-cyan-600 focus:ring-4 focus:ring-cyan-50 transition-all font-semibold"
                      autoComplete="off"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold uppercase tracking-widest transition-all duration-200 rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-lg shadow-cyan-600/20"
                >
                  {loading ? "Initializing..." : "Authorize Entry"}
                </button>

                {onGuestPlay && (
                  <button
                    type="button"
                    onClick={onGuestPlay}
                    disabled={loading}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    ⚽ Play as Guest (No Login)
                  </button>
                )}

                <p className="text-[10px] text-slate-400 text-center font-medium">
                  ⚡ New player? Enter a unique username & PIN to instantly create your account!
                </p>
              </form>
            </div>
          )}

          {/* Tab 2: Teacher Login or signup workspace */}
          {loginTab === 'teacher' && (
            <div className="space-y-4">
              {!isTeacherSignUp ? (
                /* Teacher SignIn Form */
                <form onSubmit={handleTeacherLoginSubmit} className="space-y-4 text-left">
                  {/* Google Workspace Sign-In with Domain Restriction */}
                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={handleTeacherGoogleLogin}
                      disabled={loading}
                      className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-300 hover:border-cyan-600 font-bold uppercase tracking-wider transition-all duration-200 rounded-xl flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 shadow-sm relative group"
                    >
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                      </svg>
                      <div className="flex flex-col items-start leading-tight">
                        <span className="text-xs font-black tracking-wide text-slate-900">Sign in with Google Workspace</span>
                        <span className="text-[9px] text-cyan-700 font-bold uppercase tracking-wider">
                          {teacherWorkspaceDomain ? `@${teacherWorkspaceDomain.replace(/^@/, '')} Domain Only` : 'Verified School Domain Only'}
                        </span>
                      </div>
                    </button>

                    {/* Google Workspace Domain Settings Toggle & Box */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-left text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-slate-700 font-bold text-[11px]">
                          <Shield size={12} className="text-emerald-600" />
                          <span>Google Workspace Domain Security</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowDomainSettings(!showDomainSettings)}
                          className="text-[10px] text-cyan-600 hover:text-cyan-700 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                        >
                          <Settings2 size={11} />
                          <span>{showDomainSettings ? "Hide Filter" : "Filter Domain"}</span>
                        </button>
                      </div>

                      {showDomainSettings ? (
                        <div className="space-y-2 pt-1 border-t border-slate-200">
                          <div>
                            <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
                              Restrict to School Domain (e.g. school.edu)
                            </label>
                            <div className="relative">
                              <Building2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                              <input
                                type="text"
                                placeholder="e.g. stmarys.edu or district.k12.us"
                                value={teacherWorkspaceDomain}
                                onChange={(e) => setTeacherWorkspaceDomain(e.target.value.trim().toLowerCase())}
                                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs font-mono font-medium outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-50"
                              />
                            </div>
                            <p className="text-[9px] text-slate-500 mt-1">
                              When specified, only Google accounts from this exact domain will be permitted to log in.
                            </p>
                          </div>

                          <label className="flex items-center gap-2 text-[10px] text-slate-700 font-medium cursor-pointer pt-0.5">
                            <input
                              type="checkbox"
                              checked={enforceWorkspaceDomain}
                              onChange={(e) => setEnforceWorkspaceDomain(e.target.checked)}
                              className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                            />
                            <span>Reject personal consumer accounts (e.g. @gmail.com)</span>
                          </label>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>Domain restriction: {teacherWorkspaceDomain ? `@${teacherWorkspaceDomain.replace(/^@/, '')}` : 'Any Verified Workspace'}</span>
                          <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                            <CheckCircle size={10} /> Active
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink mx-4 text-[10px] uppercase font-bold text-slate-400">or sign in with password</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest block font-sans ml-1">
                      Registered Email
                    </label>
                    <div className="relative group">
                      <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
                      <input
                        type="email"
                        placeholder="educator@school.edu"
                        value={teacherEmail}
                        onChange={(e) => setTeacherEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm outline-none focus:bg-white focus:border-cyan-600 focus:ring-4 focus:ring-cyan-50 transition-all font-semibold"
                        autoComplete="off"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest block font-sans ml-1">
                      Teacher Passkey
                    </label>
                    <div className="relative group">
                      <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
                      <input
                        type={showTeacherPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={teacherPassword}
                        onChange={(e) => setTeacherPassword(e.target.value)}
                        className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm outline-none focus:bg-white focus:border-cyan-600 focus:ring-4 focus:ring-cyan-50 transition-all font-semibold"
                        autoComplete="off"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowTeacherPassword(!showTeacherPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      >
                        {showTeacherPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-widest transition-all duration-200 rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-lg shadow-slate-900/10"
                  >
                    <LogIn size={14} />
                    <span>{loading ? "Authenticating..." : "Teacher Cabinet Login"}</span>
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => { setIsTeacherSignUp(true); setError(null); setSuccess(null); }}
                      className="text-[10px] text-cyan-600 hover:text-cyan-700 font-bold uppercase tracking-widest cursor-pointer"
                    >
                      New Educator? Create Workspace
                    </button>
                  </div>
                </form>
              ) : (
                /* Teacher Registration Form */
                <form onSubmit={handleTeacherSignupSubmit} className="space-y-4 text-left">
                  {/* Google Workspace Fast Sign-Up */}
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleTeacherGoogleLogin}
                      disabled={loading}
                      className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-300 hover:border-cyan-600 font-bold uppercase tracking-wider transition-all duration-200 rounded-xl flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 shadow-sm"
                    >
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                      </svg>
                      <div className="flex flex-col items-start leading-tight">
                        <span className="text-xs font-black tracking-wide text-slate-900">Sign up with Google Workspace</span>
                        <span className="text-[9px] text-cyan-700 font-bold uppercase tracking-wider">Instant Institutional Verification</span>
                      </div>
                    </button>
                  </div>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink mx-4 text-[10px] uppercase font-bold text-slate-400">or manual registration</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-deep-navy tracking-wider block font-mono">
                      Your Full Name
                    </label>
                    <div className="relative">
                      <Contact size={14} className="absolute left-3.5 top-3.5 text-deep-navy" />
                      <input
                        type="text"
                        placeholder="e.g. Jesse Striker"
                        value={teacherNameSignup}
                        onChange={(e) => setTeacherNameSignup(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-white backdrop-blur-md/40 border border-deep-navy border-4 rounded-xl text-deep-navy text-xs outline-none focus:border-violet-500 transition-all font-semibold"
                        autoComplete="off"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-deep-navy tracking-wider block font-mono">
                      Academic Email Address
                    </label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3.5 top-3.5 text-deep-navy" />
                      <input
                        type="email"
                        placeholder="teacher@jessemathfc.edu"
                        value={teacherEmailSignup}
                        onChange={(e) => setTeacherEmailSignup(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-white backdrop-blur-md/40 border border-deep-navy border-4 rounded-xl text-deep-navy text-xs outline-none focus:border-violet-500 transition-all font-semibold"
                        autoComplete="off"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-deep-navy tracking-wider block font-mono">
                      Register Password
                    </label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3.5 top-3.5 text-deep-navy" />
                      <input
                        type={showTeacherPassword ? "text" : "password"}
                        placeholder="Secret alphanumeric passcode"
                        value={teacherPasswordSignup}
                        onChange={(e) => setTeacherPasswordSignup(e.target.value)}
                        className="w-full pl-9 pr-9 py-2.5 bg-white backdrop-blur-md/40 border border-deep-navy border-4 rounded-xl text-deep-navy text-xs outline-none focus:border-violet-500 transition-all font-semibold"
                        autoComplete="off"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowTeacherPassword(!showTeacherPassword)}
                        className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-350 transition-colors cursor-pointer"
                      >
                        {showTeacherPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-black uppercase tracking-wider transform hover:scale-[1.02] active:scale-95 transition-all duration-200 shadow-[0_0_15px_rgba(236,72,153,0.3)] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <UserPlus size={13} />
                    <span>{loading ? "Creating..." : "REGISTER TEACHER CABINET"}</span>
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => { setIsTeacherSignUp(false); setError(null); setSuccess(null); }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-bold underline cursor-pointer"
                    >
                      Already have an account? Login here
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Tab: Parent Secret Portal (Google + Phone Number Registration/Login ONLY) */}
          {loginTab === 'parent' && (
            <div className="space-y-5 text-left">
              {/* Header Badge */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/80 p-3.5 rounded-2xl flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                    Parent & Guardian Portal
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-snug mt-0.5 font-medium">
                    Secure parent gateway. Register or sign in via Google or Mobile SMS verification.
                  </p>
                </div>
              </div>

              {/* OPTION 1: 1-Click Google Authentication */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleParentGoogleAuth}
                  disabled={loading || parentPhoneLoading}
                  className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-300 hover:border-purple-600 font-bold uppercase tracking-wider transition-all duration-200 rounded-xl flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 shadow-sm relative group"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <div className="flex flex-col items-start leading-tight">
                    <span className="text-xs font-black tracking-wide text-slate-900">Sign In with Google</span>
                    <span className="text-[9px] text-purple-700 font-bold uppercase tracking-wider">
                      Instant Guardian Access
                    </span>
                  </div>
                </button>
              </div>

              {/* Visual Divider */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-[10px] uppercase font-bold text-slate-400">
                  or sign in with phone number
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* OPTION 2: Mobile Phone Number SMS Registration / Login */}
              {parentOtpStep === 'input' ? (
                <form onSubmit={handleParentSendSMS} className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest block font-sans ml-1">
                      Parent / Guardian Name (Optional for New Registration)
                    </label>
                    <div className="relative group">
                      <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
                      <input
                        type="text"
                        placeholder="e.g. Sarah Jenkins"
                        value={parentFullName}
                        onChange={(e) => setParentFullName(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm outline-none focus:bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-50 transition-all font-semibold"
                        autoComplete="name"
                        disabled={loading || parentPhoneLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest block font-sans ml-1">
                      Mobile Phone Number
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={parentPhoneCountry}
                        onChange={(e) => setParentPhoneCountry(e.target.value)}
                        className="w-32 py-2.5 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-bold outline-none focus:bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-50 transition-all cursor-pointer shrink-0"
                        disabled={loading || parentPhoneLoading}
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code + c.country} value={c.code}>
                            {c.flag} {c.code}
                          </option>
                        ))}
                      </select>

                      <div className="relative flex-1 group">
                        <Smartphone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
                        <input
                          type="tel"
                          placeholder="7123 456789"
                          value={parentPhoneNumber}
                          onChange={(e) => setParentPhoneNumber(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-semibold outline-none focus:bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-50 transition-all"
                          autoComplete="tel"
                          disabled={loading || parentPhoneLoading}
                          required
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium ml-1">
                      We'll send a 6-digit SMS verification code to this phone number.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || parentPhoneLoading || !parentPhoneNumber.trim()}
                    className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase tracking-widest transition-all duration-200 rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-lg shadow-purple-600/20 text-xs"
                  >
                    {parentPhoneLoading ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Sending SMS Code...</span>
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        <span>Send SMS Verification Code</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* OTP Verification Step */
                <form onSubmit={handleParentVerifyCode} className="space-y-4">
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-left space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-purple-700 tracking-wider">
                        SMS Code Sent
                      </span>
                      <button
                        type="button"
                        onClick={() => { setParentOtpStep('input'); setParentOtpCode(''); setError(null); }}
                        className="text-[10px] text-purple-600 hover:text-purple-800 font-bold underline cursor-pointer"
                      >
                        Change Number
                      </button>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 font-mono">
                      {parentPhoneCountry} {parentPhoneNumber}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest block font-sans ml-1">
                      Enter 6-Digit SMS Code
                    </label>
                    <div className="relative group">
                      <KeyRound size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
                      <input
                        type="text"
                        placeholder="123456"
                        maxLength={6}
                        value={parentOtpCode}
                        onChange={(e) => setParentOtpCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-lg font-mono font-bold tracking-widest outline-none focus:bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-50 transition-all text-center"
                        autoComplete="one-time-code"
                        autoFocus
                        disabled={loading || parentPhoneLoading}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || parentPhoneLoading || parentOtpCode.length < 6}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-widest transition-all duration-200 rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-lg shadow-emerald-600/20 text-xs"
                  >
                    {parentPhoneLoading ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Verifying SMS Code...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={14} />
                        <span>Verify & Enter Parent Dashboard</span>
                      </>
                    )}
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={handleParentSendSMS}
                      disabled={parentPhoneLoading}
                      className="text-[11px] text-slate-500 hover:text-purple-600 font-semibold cursor-pointer"
                    >
                      Didn't receive code? Resend SMS
                    </button>
                  </div>
                </form>
              )}

              {/* Invisible reCAPTCHA container for Firebase Phone Auth */}
              <div id="parent-recaptcha-container"></div>
            </div>
          )}

          {/* Tab 3: Developer Portal Login Form */}
          {loginTab === 'developer' && (
            <form onSubmit={handleDevLoginSubmit} className="space-y-4 text-left">
              <div>
                <h3 className="text-sm font-black text-deep-navy uppercase tracking-wider flex items-center gap-2">
                  <Cpu size={14} className="text-cyan-400" />
                  <span>Developer Authorization Gate</span>
                </h3>
                <p className="text-[10px] text-deep-navy font-medium font-mono mt-1 leading-relaxed">
                  Enter master security key to configure real-time assets, monitor live Firestore synchronize status, and adjust engagement indices.
                </p>
              </div>

              {devError && (
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-3 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-[11px] font-bold rounded-xl flex items-start gap-2 text-left"
                >
                  <ShieldAlert size={14} className="shrink-0 mt-0.5" />
                  <span>{devError}</span>
                </motion.div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-deep-navy tracking-wider block font-mono">
                  Master Password
                </label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-3.5 text-deep-navy" />
                  <input
                    type={showDevPassword ? "text" : "password"}
                    placeholder="Enter Master Password"
                    value={devPassword}
                    onChange={(e) => setDevPassword(e.target.value)}
                    className="w-full pl-9 pr-9 py-2.5 bg-white backdrop-blur-md/40 border border-deep-navy border-4 rounded-xl text-deep-navy text-xs outline-none focus:border-cyan-500 transition-all font-semibold font-mono"
                    autoComplete="off"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowDevPassword(!showDevPassword)}
                    className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-350 transition-colors cursor-pointer"
                  >
                    {showDevPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-slate-950 font-black uppercase tracking-wider transform hover:scale-105 active:scale-95 transition-all duration-200 shadow-[0_0_15px_rgba(6,182,212,0.3)] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer text-xs"
              >
                <ShieldCheck size={14} />
                <span>AUTHORIZE GATEWAYS</span>
              </button>
            </form>
          )}

          {/* Universal Guest Play Button */}
          {onGuestPlay && loginTab !== 'developer' && (
            <div className="pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={onGuestPlay}
                disabled={loading}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-widest transition-all duration-200 rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs"
              >
                <Sparkles size={14} className="text-cyan-400" />
                Instant Guest Access
              </button>
              <p className="mt-2 text-[10px] text-slate-500 font-medium text-center italic">
                Enter immediately. Progress saved temporarily.
              </p>
            </div>
          )}

        </motion.div>
      )}
      </div>
      {/* Itch.io Embed */}
      <div className="flex justify-center mt-4 mb-0 w-full">
         <iframe frameBorder="0" src="https://itch.io/embed/4792376?linkback=true" width="552" height="167" className="rounded-xl shadow-xl max-w-full"><a href="https://jesse-otobo.itch.io/httpsjesse-math-rockstar-appvercelapp">Jesse mathstriker by Jesse otobo</a></iframe>
      </div>
    </div>
  );
}

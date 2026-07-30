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
  BookOpen
} from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, onSnapshot, deleteDoc } from 'firebase/firestore';
import { 
  authenticateSchoolStudent,
  authenticateSchoolTeacher,
  registerTeacher
} from '../lib/schoolDb';

interface AuthGateProps {
  onAuthSuccess: (username: string, uid: string) => void;
  onGuestPlay?: () => void;
}

export default function AuthGate({ onAuthSuccess, onGuestPlay }: AuthGateProps) {
  // Tabs: 'individual' for Rockstar/Student Login, 'teacher' for Teacher Login, 'developer' for Developer Login
  const [loginTab, setLoginTab] = useState<'individual' | 'teacher'>('individual');
  const [showLanding, setShowLanding] = useState(true);
  
  const backgroundEmojis = React.useMemo(() => {
    const emojis = ['🎸', '👑', '🚀', '➕', '✖️', '🎸', '👑', '🚀', '➖', '➗'];
    return Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      char: emojis[i % emojis.length],
      left: `${(i * 17) % 94 + 3}%`,
      size: `${18 + (i * 7) % 20}px`,
      duration: `${15 + (i * 9) % 20}s`,
      delay: `${-((i * 13) % 25)}s`
    }));
  }, []);

  // Individual login sub-mode: 'rockstar', 'student', or 'class_code'
  const [individualSubMode, setIndividualSubMode] = useState<'rockstar' | 'student' | 'class_code'>('rockstar');

  // Class Login States
  const [classCodeInput, setClassCodeInput] = useState('');
  const [classStudentName, setClassStudentName] = useState('');
  const [classSessionStatus, setClassSessionStatus] = useState<'idle' | 'active' | 'removed'>('idle');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Check for persistent Class Session on mount
  useEffect(() => {
    const savedSessionId = localStorage.getItem('jesse_class_session_id');
    const savedName = localStorage.getItem('jesse_class_request_name');
    const savedCode = localStorage.getItem('jesse_class_request_code');
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
          localStorage.removeItem('jesse_class_session_id');
        }
      } else {
        // Session doc deleted
        setClassSessionStatus('idle');
        setActiveSessionId(null);
        localStorage.removeItem('jesse_class_session_id');
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
    localStorage.removeItem('jesse_class_session_id');
    localStorage.removeItem('jesse_class_request_name');
    localStorage.removeItem('jesse_class_request_code');
    setError(null);
  };

  const handleClassLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const cleanName = classStudentName.trim().replace(/\s/g, '');
    const cleanCode = classCodeInput.trim().toUpperCase().replace(/\s/g, '');

    if (!cleanName) {
      setError("Please choose a cool name to enter the classroom!");
      return;
    }
    if (cleanName.length < 2) {
      setError("Your name must be at least 2 characters long.");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(cleanName)) {
      setError("Name can only contain letters, numbers, and underscores.");
      return;
    }

    if (!cleanCode) {
      setError("Please enter the unique Class Code shared by your teacher!");
      return;
    }

    setLoading(true);

    try {
      const teachersCol = collection(db, 'teachers');
      const q = query(teachersCol, where('class_code', '==', cleanCode));
      const snap = await getDocs(q);

      if (snap.empty) {
        setError(`Class Code "${cleanCode}" was not found! Please make sure you have the correct code from your teacher.`);
        setLoading(false);
        return;
      }

      const teacherDoc = snap.docs[0];
      const teacherId = teacherDoc.id;

      // Verify that the handle (username) was pre-registered/saved by this teacher
      const schoolStudentsCol = collection(db, 'school_students');
      const studentQuery = query(schoolStudentsCol, where('teacher_id', '==', teacherId));
      const studentSnap = await getDocs(studentQuery);

      let foundStudentDoc = null;
      studentSnap.forEach(doc => {
        const data = doc.data();
        if ((data.username_lower === cleanName.toLowerCase()) || 
            (data.username && data.username.toLowerCase() === cleanName.toLowerCase())) {
          foundStudentDoc = doc;
        }
      });

      if (!foundStudentDoc) {
        setError(`Error: The handle "@${cleanName}" is not registered inside your teacher's student roster. Please ask your teacher to add you first!`);
        setLoading(false);
        return;
      }

      // Read registered progress from teacher's roster
      const schoolStudentData = foundStudentDoc.data();
      const studentProgress = schoolStudentData.school_math_progress || {};
      const initialScore = studentProgress.highScore || 0;
      const initialXP = studentProgress.xp || 100;
      const initialLevel = studentProgress.currentLevel || 1;

      // Create a direct session
      const newDocRef = doc(collection(db, 'class_sessions'));
      const sessionId = newDocRef.id;

      await setDoc(newDocRef, {
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

      // Log in instantly!
      localStorage.setItem('jesse_rock_role', 'class_student');
      localStorage.setItem('jesse_rock_user_id', sessionId);
      localStorage.setItem('jesse_rock_my_username', cleanName);
      localStorage.setItem('jesse_rock_class_code', cleanCode);
      localStorage.setItem('jesse_class_session_id', sessionId);
      localStorage.setItem('jesse_class_request_name', cleanName);
      localStorage.setItem('jesse_class_request_code', cleanCode);

      setSuccess(`Authenticated! Welcome to ${teacherDoc.data().class_name || 'Classroom'}. Entering now...`);
      setTimeout(() => {
        onAuthSuccess(cleanName, sessionId);
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to enter classroom.");
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

  const [teacherNameSignup, setTeacherNameSignup] = useState('');
  const [teacherEmailSignup, setTeacherEmailSignup] = useState('');
  const [teacherPasswordSignup, setTeacherPasswordSignup] = useState('');

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
    { id: 'arena', name: 'Multiplayer Workout Arenas', valueBoost: 2000, deployed: true, logicDriver: 'firestore_lobby_sync' },
    { id: 'backend', name: 'Secure Backend Proxy (server.ts)', valueBoost: 800, deployed: true, logicDriver: 'express_ingress_node' }
  ]);

  // Handle local session storage and concurrent lock handshakes
  useEffect(() => {
    // Check if there's an existing valid developer session
    const activeToken = localStorage.getItem('jesse_dev_active_session_token');
    const mySavedToken = localStorage.getItem('jesse_dev_my_token');

    if (activeToken && mySavedToken && activeToken === mySavedToken) {
      setIsDevAuthenticated(true);
      setDevSessionToken(mySavedToken);
    }

    // Handshake event listener
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'jesse_dev_active_session_token') {
        const newValue = e.newValue;
        const currentLocalToken = localStorage.getItem('jesse_dev_my_token');
        if (newValue && currentLocalToken && newValue !== currentLocalToken) {
          // KICK-OUT! Another tab authenticated!
          setIsDevAuthenticated(false);
          setDevSessionToken(null);
          localStorage.removeItem('jesse_dev_my_token');
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

    if (devPassword === "321jesserockstar") {
      const newToken = `dev_token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Save locally and globally
      localStorage.setItem('jesse_dev_my_token', newToken);
      localStorage.setItem('jesse_dev_active_session_token', newToken);
      
      setDevSessionToken(newToken);
      setIsDevAuthenticated(true);
      setDevPassword('');
    } else {
      setDevError("Access Denied: Incorrect master developer password entered.");
    }
  };

  // Developer Log-out handler
  const handleDevLogout = () => {
    localStorage.removeItem('jesse_dev_my_token');
    // If we logout, we also clear the active session token so other tabs can login or clean up
    const activeToken = localStorage.getItem('jesse_dev_active_session_token');
    const myToken = localStorage.getItem('jesse_dev_my_token');
    if (activeToken === myToken) {
      localStorage.removeItem('jesse_dev_active_session_token');
    }
    setIsDevAuthenticated(false);
    setDevSessionToken(null);
  };

  // 1. Individual ("Home Login") Handler 
  const handleHomeLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setError("Please pick a beautiful Math identity username!");
      return;
    }

    if (cleanUsername.includes(' ')) {
      setError("Spaces are strictly forbidden in rockstar names! Use letters & numbers only.");
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
      setError("Please pick a legendary Math Rockstar Password to secure your account!");
      return;
    }

    if (cleanPassword.length < 4) {
      setError("Your secure password must be at least 4 characters long!");
      return;
    }

    setLoading(true);

    try {
      let uid = localStorage.getItem('jesse_rock_device_id');
      if (!uid) {
        uid = `dev_${Math.floor(100000 + Math.random() * 900000)}`;
      }
      localStorage.setItem('jesse_rock_device_id', uid);

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
        localStorage.setItem('jesse_rock_role', 'individual');
        localStorage.setItem('jesse_rock_device_id', correctUid);
        localStorage.setItem(`jesse_rock_uid_${cleanUsername.toLowerCase()}`, correctUid);
        localStorage.setItem('jesse_rock_my_username', existingData.username || cleanUsername);
        localStorage.setItem('jesse_rock_user_id', correctUid);
        
        setSuccess(`Welcome back, ${existingData.username || cleanUsername}! Loading progress...`);
        setTimeout(() => {
          onAuthSuccess(existingData.username || cleanUsername, correctUid);
        }, 1200);
        return;
      }

      try {
        await setDoc(nameDocRef, {
          uid: uid,
          username: cleanUsername,
          password: cleanPassword,
          createdAt: Date.now()
        });
      } catch (err) {
        console.error("Could not register username on Firestore:", err);
        throw new Error("Failed to reserve legendary username. Please try again!");
      }

      const userProfileRef = doc(db, "users", uid);
      try {
        await setDoc(userProfileRef, {
          uid: uid,
          username: cleanUsername,
          password: cleanPassword,
          xp: 100,
          streak: 1, 
          coins: 100,
          badges: ["Genius Debut"],
          createdAt: Date.now()
        });
      } catch (err) {
        console.warn("Could not save initial user profile doc, falling back securely:", err);
      }

      localStorage.setItem('jesse_rock_role', 'individual');
      localStorage.setItem('jesse_rock_device_id', uid);
      localStorage.setItem(`jesse_rock_uid_${cleanUsername.toLowerCase()}`, uid);
      localStorage.setItem('jesse_rock_my_username', cleanUsername);
      localStorage.setItem('jesse_rock_user_id', uid);

      setSuccess(`Congratulations! Username "${cleanUsername}" is now registered.`);
      setTimeout(() => {
        onAuthSuccess(cleanUsername, uid);
      }, 1200);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to enter Jesse Rock Math Arena. Check internet connection.");
    } finally {
      setLoading(false);
    }
  };

  // 2. School Student Login Handler
  const handleStudentLoginSubmit = async (e: React.FormEvent) => {
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

      localStorage.setItem('jesse_rock_role', 'student'); 
      localStorage.setItem('jesse_rock_user_id', freshStudent.id);
      localStorage.setItem('jesse_rock_my_username', freshStudent.username);
      localStorage.setItem('jesse_rock_real_name', freshStudent.real_first_name);
      localStorage.setItem('jesse_rock_teacher_id', freshStudent.teacher_id);

      setSuccess(`Verified Rockstar Student @${freshStudent.username}! Preparing your instruments...`);
      setTimeout(() => {
        onAuthSuccess(freshStudent.username, freshStudent.id);
      }, 1200);

    } catch (err: any) {
      setError(err.message || "Failed to log in student.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Teacher Login Handler
  const handleTeacherLoginSubmit = async (e: React.FormEvent) => {
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

      localStorage.setItem('jesse_rock_role', 'teacher');
      localStorage.setItem('jesse_rock_user_id', authenticatedTeacher.id);
      localStorage.setItem('jesse_rock_my_username', authenticatedTeacher.email);
      localStorage.setItem('jesse_rock_real_name', authenticatedTeacher.teacher_name);

      setSuccess(`Welcome back, Teacher ${authenticatedTeacher.teacher_name}! Synchronising...`);
      setTimeout(() => {
        onAuthSuccess(authenticatedTeacher.email, authenticatedTeacher.id);
      }, 1200);

    } catch (err: any) {
      setError(err.message || "Teacher login check failed.");
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

      localStorage.setItem('jesse_rock_role', 'teacher');
      localStorage.setItem('jesse_rock_user_id', freshlyTeacher.id);
      localStorage.setItem('jesse_rock_my_username', freshlyTeacher.email);
      localStorage.setItem('jesse_rock_real_name', freshlyTeacher.teacher_name);
      localStorage.setItem('jesse_rock_device_id', freshlyTeacher.id);

      setSuccess(`Teacher Workspace Registered Successfully! Launching Class ${freshlyTeacher.teacher_name}...`);
      setTimeout(() => {
        onAuthSuccess(freshlyTeacher.email, freshlyTeacher.id);
      }, 1200);

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
        
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 relative z-10">
          
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
                Jesse Math Rockstar
              </div>
              
              <h1 className="text-5xl md:text-7xl font-light tracking-tight text-slate-900 leading-[1.1]">
                Master mathematics.<br/>
                <span className="font-bold text-cyan-400">Zero hesitation.</span>
              </h1>
              
              <p className="text-lg md:text-xl text-slate-600 max-w-xl font-normal leading-relaxed">
                An elite educational platform engineered for mental acceleration. Replace anxiety with instant reflex through high-performance, live multiplayer calculation arenas.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                <button 
                  onClick={() => setShowLanding(false)}
                  className="w-full sm:w-auto px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded text-sm uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                >
                  <Zap size={18} /> Initialize Arena
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
                Jesse Rock Math was founded on June 20, 2026, by visionary educator and developer <strong>Jesse Otobo</strong>. Witnessing how standard timed drills paralyzed young learners with math anxiety, Jesse set out to bridge the gap between high-octane arcade gaming and rigorous mathematics.
              </p>
              <p className="text-slate-600 leading-relaxed text-base">
                What started as a simple mental arithmetic prototype rapidly evolved into an elite multiplayer EdTech arena trusted by classrooms worldwide, empowering thousands of students to rock their arithmetic, algebra, and fractions without fear.
              </p>
              <div className="flex items-center gap-4 pt-2">
                <div className="flex -space-x-2">
                  <span className="w-10 h-10 rounded-full bg-cyan-500 text-white font-bold flex items-center justify-center border-2 border-white shadow">JO</span>
                  <span className="w-10 h-10 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center border-2 border-white shadow">🎸</span>
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
              <div className="absolute -right-10 -bottom-10 text-9xl opacity-10 select-none">🎸</div>
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
                See Jesse Rock Math in Action
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed">
                Watch our official walkthrough video to see how live multiplayer battles, zero-lag mechanics, and adaptive speed drills transform math practice into an addictive rock show.
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
                Compete with students worldwide on live global and classroom leaderboards. Earn rock badges, level up your avatar, and celebrate math milestones together.
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
              <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center font-bold text-xl shadow-sm">🛡️</div>
              <h3 className="text-xl font-bold text-slate-900">Parent & Teacher Portal</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Monitor progress, assign tailored quiz modules, and export detailed performance reports with zero friction. Designed for modern classrooms.
              </p>
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
                  alt="Jesse Rock Math 8K Video Thumbnail" 
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
                    <span className="font-bold text-lg md:text-xl">Watch Jesse Rock Math on YouTube</span>
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
                  Jesse Rock Math is meticulously engineered to cover every essential pillar of early and intermediate mathematical proficiency, ensuring students develop intuition rather than rote memorization.
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
                Why Jesse Rock Math Changes Everything
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed">
                Traditional math education is plagued by slow drills, anxiety, and rigid testing. Jesse Rock Math transforms calculations into an electrifying, gamified experience that builds lifelong confidence and lightning-fast mental math reflexes.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white border border-slate-300 p-8 rounded-2xl shadow-sm space-y-4">
                <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center justify-center text-cyan-600 font-bold text-xl">
                  🧠
                </div>
                <h3 className="text-xl font-bold text-slate-900">Eradicating Math Anxiety</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  By framing practice as an interactive rock-and-roll arcade game rather than stressful testing, students drop their guard, embrace mistakes as learning moments, and build healthy mathematical resilience.
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
                  Challenge classmates or global peers in thrilling head-to-head calculation matches where speed, accuracy, and quick thinking crown the ultimate Math Rockstar.
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

        </div>
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
          className="w-full max-w-sm bg-clean-white backdrop-blur-xl border border-deep-navy border-4 p-6 md:p-8 rounded-[2.5rem] shadow-2xl relative z-10 space-y-6 text-center"
        >
          {/* Logo and Brand details */}
          <div className="space-y-2.5">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 12 }}
              className="w-16 h-16 rounded-[1.25rem] overflow-hidden shadow-[0_0_20px_rgba(236,72,153,0.3)] border border-deep-navy border-4 mx-auto cursor-pointer"
            >
              <img src="/jesse_rock_logo.jpg" alt="Jesse Rock Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </motion.div>
            
            <h1 className="text-2xl font-display font-black tracking-tight text-deep-navy leading-none mt-2">
              Welcome to Jesse Rock Math<br />
              <span className="bg-gradient-to-r from-yellow-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(244,63,94,0.4)] text-xl font-black tracking-widest uppercase">
                MATH ARENA 👑
              </span>
            </h1>
            
            <div className="py-1 px-2.5 bg-violet-600/10 border border-violet-500/20 text-violet-350 rounded-lg text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 justify-center mx-auto">
              <Lock size={10} className="text-violet-400 animate-pulse" /> Secure School Portal
            </div>
          </div>

          {/* 3-Way Portal Selector: Individual, Teacher, Developer Login */}
          <div className="flex bg-white backdrop-blur-md/60 p-1 rounded-2xl border border-deep-navy border-4 gap-1 shadow-inner">
            <button
              type="button"
              onClick={() => { setLoginTab('individual'); setError(null); setSuccess(null); }}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                loginTab === 'individual'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-deep-navy shadow-[0_0_10px_rgba(236,72,153,0.5)]'
                  : 'text-deep-navy hover:text-deep-navy hover:bg-white/5'
              }`}
            >
              <User size={12} />
              <span>Rockstar Student</span>
            </button>
            
            <button
              type="button"
              onClick={() => { setLoginTab('teacher'); setError(null); setSuccess(null); }}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                loginTab === 'teacher'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-deep-navy shadow-[0_0_10px_rgba(236,72,153,0.5)]'
                  : 'text-deep-navy hover:text-deep-navy hover:bg-white/5'
              }`}
            >
              <GraduationCap size={12} />
              <span>Math Teacher</span>
            </button>
          </div>

          {/* Notifications and messages inside card */}
          {error && loginTab !== 'developer' && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-bold rounded-xl flex items-start gap-2 text-left"
            >
              <ShieldAlert size={14} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && loginTab !== 'developer' && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-3 bg-[#10b981]/10 border border-[#10b981]/20 text-[#10b981] text-[11px] font-bold rounded-xl flex items-start gap-2 text-left"
            >
              <Check size={14} className="shrink-0 mt-0.5" />
              <span>{success}</span>
            </motion.div>
          )}

          {/* Tab 1: Individual Home Login Form */}
          {loginTab === 'individual' && (
            <div className="space-y-4 text-left">
              {/* Sub-tab toggle for Rockstar, Student, and Class Code inside Individual Login tab */}
              <div className="flex bg-white backdrop-blur-md/70 p-1 rounded-xl border border-deep-navy border-4 text-[10px] sm:text-xs font-mono uppercase font-black mb-4 gap-1">
                <button
                  type="button"
                  onClick={() => { setIndividualSubMode('rockstar'); setError(null); }}
                  className={`flex-1 py-2 rounded-lg transition-all cursor-pointer text-center ${
                    individualSubMode === 'rockstar' ? 'bg-deep-navy text-slate-900 shadow-md' : 'text-deep-navy hover:bg-slate-100'
                  }`}
                >
                  ⭐ Rockstar
                </button>
                <button
                  type="button"
                  onClick={() => { setIndividualSubMode('student'); setError(null); }}
                  className={`flex-1 py-2 rounded-lg transition-all cursor-pointer text-center ${
                    individualSubMode === 'student' ? 'bg-deep-navy text-slate-900 shadow-md' : 'text-deep-navy hover:bg-slate-100'
                  }`}
                >
                  🍏 PIN Login
                </button>
                <button
                  type="button"
                  onClick={() => { setIndividualSubMode('class_code'); setError(null); }}
                  className={`flex-1 py-2 rounded-lg transition-all cursor-pointer text-center ${
                    individualSubMode === 'class_code' ? 'bg-deep-navy text-slate-900 shadow-md' : 'text-deep-navy hover:bg-slate-100'
                  }`}
                >
                  🏫 Class Code
                </button>
              </div>

              {individualSubMode === 'rockstar' && (
                /* Rockstar Form */
                <form onSubmit={handleHomeLoginSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-deep-navy tracking-wider block font-mono">
                      Your Rockstar Username
                    </label>
                    <div className="relative">
                      <User size={14} className="absolute left-3.5 top-3.5 text-deep-navy" />
                      <input
                        type="text"
                        placeholder="GeniusMathMage"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))}
                        className="w-full pl-9 pr-3 py-2.5 bg-white backdrop-blur-md/40 border border-deep-navy border-4 rounded-xl text-deep-navy text-xs outline-none focus:border-violet-500 transition-all font-semibold"
                        autoComplete="off"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-deep-navy tracking-wider block font-mono">
                      Secure Login PIN
                    </label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3.5 top-3.5 text-deep-navy" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password or secret PIN"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-9 py-2.5 bg-white backdrop-blur-md/40 border border-deep-navy border-4 rounded-xl text-deep-navy text-xs outline-none focus:border-violet-500 transition-all font-semibold"
                        autoComplete="off"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-350 transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-deep-navy font-black uppercase tracking-wider transform hover:scale-105 active:scale-95 transition-all duration-200 shadow-[0_0_15px_rgba(236,72,153,0.3)] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? "Verifying..." : "ENTER INDIVIDUAL PLAY ✨"}
                  </button>
                </form>
              )}

              {individualSubMode === 'student' && (
                /* Student Form */
                <form onSubmit={handleStudentLoginSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-deep-navy tracking-wider block font-mono">
                      Student Username
                    </label>
                    <div className="relative">
                      <User size={14} className="absolute left-3.5 top-3.5 text-deep-navy" />
                      <input
                        type="text"
                        placeholder="e.g. mason_star"
                        value={studentUsername}
                        onChange={(e) => setStudentUsername(e.target.value.replace(/\s/g, ''))}
                        className="w-full pl-9 pr-3 py-2.5 bg-white backdrop-blur-md/40 border border-deep-navy border-4 rounded-xl text-deep-navy text-xs outline-none focus:border-violet-500 transition-all font-semibold"
                        autoComplete="off"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-deep-navy tracking-wider block font-mono">
                      Student Password PIN
                    </label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3.5 top-3.5 text-deep-navy" />
                      <input
                        type={showStudentPassword ? "text" : "password"}
                        placeholder="e.g. play123"
                        value={studentPassword}
                        onChange={(e) => setStudentPassword(e.target.value)}
                        className="w-full pl-9 pr-9 py-2.5 bg-white backdrop-blur-md/40 border border-deep-navy border-4 rounded-xl text-deep-navy text-xs outline-none focus:border-violet-500 transition-all font-semibold"
                        autoComplete="off"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowStudentPassword(!showStudentPassword)}
                        className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-350 transition-colors cursor-pointer"
                      >
                        {showStudentPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-deep-navy font-black uppercase tracking-wider transform hover:scale-105 active:scale-95 transition-all duration-200 shadow-[0_0_15px_rgba(236,72,153,0.3)] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? "Authenticating..." : "ENTER SCHOOL ARENA 🍏"}
                  </button>
                </form>
              )}

              {individualSubMode === 'class_code' && (
                /* Class Code Form */
                <div className="space-y-4">
                  {classSessionStatus === 'removed' ? (
                    <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-3xl text-center space-y-4">
                      <div className="w-16 h-16 mx-auto flex items-center justify-center bg-rose-500/20 rounded-full border-rose-500/30 text-rose-500 text-3xl">
                        🚫
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className="text-sm font-black uppercase text-rose-500">Session Terminated</h3>
                        <p className="text-[11px] text-slate-600 leading-relaxed font-bold">
                          You have been removed from this classroom session by the teacher.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleLeaveClass}
                        className="w-full py-2.5 bg-white hover:bg-slate-50 text-deep-navy border border-deep-navy border-4 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                      >
                        Back to Login
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleClassLoginSubmit} className="space-y-4">
                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-black uppercase text-deep-navy tracking-wider block font-mono">
                          Your Classroom Handle
                        </label>
                        <div className="relative">
                          <User size={14} className="absolute left-3.5 top-3.5 text-deep-navy" />
                          <input
                            type="text"
                            placeholder="e.g. MasonRock"
                            value={classStudentName}
                            onChange={(e) => setClassStudentName(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 bg-white border border-deep-navy border-4 rounded-xl text-deep-navy text-xs outline-none focus:border-violet-500 transition-all font-semibold"
                            autoComplete="off"
                            disabled={loading}
                          />
                        </div>
                        <p className="text-[9px] text-slate-500 font-medium">Use the username registered by your teacher.</p>
                      </div>

                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-black uppercase text-deep-navy tracking-wider block font-mono">
                          Teacher's Class Code
                        </label>
                        <div className="relative">
                          <Globe size={14} className="absolute left-3.5 top-3.5 text-deep-navy" />
                          <input
                            type="text"
                            placeholder="Enter 8-digit code"
                            value={classCodeInput}
                            onChange={(e) => setClassCodeInput(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 bg-white border border-deep-navy border-4 rounded-xl text-deep-navy text-xs outline-none focus:border-violet-500 transition-all font-mono font-black tracking-wider uppercase"
                            autoComplete="off"
                            disabled={loading}
                          />
                        </div>
                        <p className="text-[9px] text-slate-500 font-medium">The secure code shared by your teacher.</p>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-deep-navy font-black uppercase tracking-wider transform hover:scale-105 active:scale-95 transition-all duration-200 shadow-[0_0_15px_rgba(236,72,153,0.3)] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 text-xs"
                      >
                        {loading ? (
                          <>
                            <RefreshCw size={13} className="animate-spin" />
                            Verifying Class...
                          </>
                        ) : (
                          <>
                            <LogIn size={13} />
                            JOIN CLASSROOM 🚀
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Teacher Login or signup workspace */}
          {loginTab === 'teacher' && (
            <div className="space-y-4">
              {!isTeacherSignUp ? (
                /* Teacher SignIn Form */
                <form onSubmit={handleTeacherLoginSubmit} className="space-y-4 text-left">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-deep-navy tracking-wider block font-mono">
                      Teacher Registered Email
                    </label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3.5 top-3.5 text-deep-navy" />
                      <input
                        type="email"
                        placeholder="teacher@school.edu"
                        value={teacherEmail}
                        onChange={(e) => setTeacherEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-white backdrop-blur-md/40 border border-deep-navy border-4 rounded-xl text-deep-navy text-xs outline-none focus:border-violet-500 transition-all font-semibold"
                        autoComplete="off"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-deep-navy tracking-wider block font-mono">
                      Teacher Password
                    </label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3.5 top-3.5 text-deep-navy" />
                      <input
                        type={showTeacherPassword ? "text" : "password"}
                        placeholder="Your secret passcode"
                        value={teacherPassword}
                        onChange={(e) => setTeacherPassword(e.target.value)}
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
                    className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-deep-navy font-black uppercase tracking-wider transform hover:scale-105 active:scale-95 transition-all duration-200 shadow-[0_0_15px_rgba(236,72,153,0.3)] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <LogIn size={13} />
                    <span>{loading ? "Checking Database..." : "LOGIN TEACHER CABINET"}</span>
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => { setIsTeacherSignUp(true); setError(null); setSuccess(null); }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-bold underline cursor-pointer"
                    >
                      Don't have an account? Sign up here as a Teacher
                    </button>
                  </div>
                </form>
              ) : (
                /* Teacher Registration Form */
                <form onSubmit={handleTeacherSignupSubmit} className="space-y-4 text-left">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-deep-navy tracking-wider block font-mono">
                      Your Full Name
                    </label>
                    <div className="relative">
                      <Contact size={14} className="absolute left-3.5 top-3.5 text-deep-navy" />
                      <input
                        type="text"
                        placeholder="e.g. Jesse Rockstar"
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
                        placeholder="teacher@jesserock.edu"
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
                    className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-deep-navy font-black uppercase tracking-wider transform hover:scale-105 active:scale-95 transition-all duration-200 shadow-[0_0_15px_rgba(236,72,153,0.3)] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
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
            <div className="pt-2 border-t border-deep-navy border-4">
              <button
                type="button"
                onClick={onGuestPlay}
                disabled={loading}
                className="w-full py-3 bg-white text-deep-navy border border-gray-300 hover:bg-slate-100 font-black uppercase tracking-wider transform hover:scale-105 active:scale-95 transition-all duration-200 shadow-[0_0_15px_rgba(255,255,255,0.15)] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 text-xs"
              >
                <Zap size={14} className="text-amber-500" />
                QUICK PLAY AS GUEST ⚡
              </button>
            </div>
          )}

        </motion.div>
      )}
      </div>
      {/* Itch.io Embed */}
      <div className="flex justify-center mt-4 mb-0 w-full">
         <iframe frameBorder="0" src="https://itch.io/embed/4792376?linkback=true" width="552" height="167" className="rounded-xl shadow-xl max-w-full"><a href="https://jesse-otobo.itch.io/httpsjesse-math-rockstar-appvercelapp">Jesse mathrockstar by Jesse otobo</a></iframe>
      </div>
    </div>
  );
}

import { safeStorage } from "./lib/storage";
import React, { useState, useEffect, useTransition } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { startBGM, stopBGM } from './lib/audioUtils';
import { motion, AnimatePresence } from 'motion/react';
import SettingsModal from './components/SettingsModal';
import GuestFinishDialog from './components/GuestFinishDialog';
import AnniversaryDialog from './components/AnniversaryDialog';
import GiftDialog from './components/GiftDialog';
import { dispatchNotification, NotificationCategorySettings } from './lib/notificationManager';
import { 
  LayoutDashboard, 
  BookOpen, 
  Trophy, 
  Settings, 
  LogOut,
  Menu,
  X,
  Music,
  Award,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ExternalLink,
  Lock,
  Loader2,
  Home,
  FileText,
  HelpCircle,
  Star,
  Globe,
  User,
  Heart,
  ShoppingBag,
  Gamepad2,
  Flame,
  Smartphone,
  Download,
  GraduationCap,
  Brain,
  Bell
} from 'lucide-react';
import { UserStats, Difficulty, Lesson } from './types';
import { ExtendedUserStats } from './types/extendedTypes';
import { cn } from './lib/utils';
import { calculateLevel } from './lib/badges';
import { getWeeklyData } from './lib/dateUtils';
import { db, auth } from './lib/firebase';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, increment } from 'firebase/firestore';
import { onIdTokenChanged, signOut } from 'firebase/auth';
import { handleFirestoreError, OperationType } from './lib/firestoreUtils';

import AuthGate from './components/AuthGate';
import HomeLanding from './components/HomeLanding';
const ArenaMatches = React.lazy(() => import('./components/ArenaMatches'));
const RulesPage = React.lazy(() => import('./components/RulesPage'));
const TermsPage = React.lazy(() => import('./components/TermsPage'));
const ClassPlayground = React.lazy(() => import('./components/ClassPlayground'));
const DeveloperPage = React.lazy(() => import('./components/DeveloperPage'));
const LearnArena = React.lazy(() => import('./components/LearnArena'));
const SchoolDashboards = React.lazy(() => import('./components/SchoolDashboards'));
const ParentDashboard = React.lazy(() => import('./components/ParentDashboard'));
const CreatorPanel = React.lazy(() => import('./components/CreatorPanel'));
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const Leaderboard = React.lazy(() => import('./components/Leaderboard'));
const Quiz = React.lazy(() => import('./components/Quiz'));
const LearningHub = React.lazy(() => import('./components/LearningHub'));
const BadgesSection = React.lazy(() => import('./components/BadgesSection'));
const RockShop = React.lazy(() => import('./components/RockShop'));
const FunArcade = React.lazy(() => import('./components/FunArcade'));
const ConvertAccountModal = React.lazy(() => import('./components/ConvertAccountModal'));
const CertificateModal = React.lazy(() => import('./components/CertificateModal'));
const InstallGuideModal = React.lazy(() => import('./components/InstallGuideModal'));

import AvatarPreview from './components/AvatarPreview';
import NotificationToast from './components/NotificationToast';
import { updateSchoolStudentProgress } from './lib/schoolDb';
const SatsHub = React.lazy(() => import('./components/sats/SatsHub'));
const DiagnosticModal = React.lazy(() => import('./components/DiagnosticModal'));
const MistakeIntelligenceModal = React.lazy(() => import('./components/MistakeIntelligenceModal'));
const SmartNotificationsModal = React.lazy(() => import('./components/SmartNotificationsModal'));
const ChildSafetyModal = React.lazy(() => import('./components/ChildSafetyModal'));
const SpacedPracticeView = React.lazy(() => import('./components/SpacedPracticeView'));

const INITIAL_STATS: ExtendedUserStats = {
  totalSolved: 0,
  correctAnswers: 0,
  level: 1,
  xp: 0,
  streak: 0,
  bestStreak: 0,
  history: [],
  lastLoginDate: '',
  streakDays: []
};

export default function App() {
  console.log('[JesseMath] Rendering App component...');
  const location = useLocation();
  const navigate = useNavigate();
  const pathName = location.pathname.substring(1) || 'home';
  const validTabs = ['home', 'dashboard', 'leaderboard', 'hub', 'quiz', 'badges', 'rules', 'terms', 'seo', 'developer', 'learn', 'shop', 'creator', 'arcade', 'arena', 'sats', 'spaced_practice'];
  const activeTab = validTabs.includes(pathName) ? pathName : 'home';
  const setActiveTab = (tab: any) => {
    navigate(tab === 'home' ? '/' : `/${tab}`);
  };
  const [showDiagnosticModal, setShowDiagnosticModal] = useState(false);
  const [showMistakeModal, setShowMistakeModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [rewardTimer, setRewardTimer] = useState(300);
  const [isWorkspaceLocked, setIsWorkspaceLocked] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showGuestFinishDialog, setShowGuestFinishDialog] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showAnniversaryDialog, setShowAnniversaryDialog] = useState(false);
  const [showGiftDialog, setShowGiftDialog] = useState<{amount: number, isWeeklyWinner?: boolean} | null>(null);
  const [showGrandMasterCelebration, setShowGrandMasterCelebration] = useState(false);
  const [showGrandMasterCert, setShowGrandMasterCert] = useState(false);
  const [guestScore, setGuestScore] = useState({ score: 0, xp: 0 });
  const [liveEquipped, setLiveEquipped] = useState({
    hair: 'hair_default',
    body: 'body_default',
    instrument: 'instrument_default'
  });
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
  const [stats, setStats] = useState<ExtendedUserStats>(() => {
    try {
      const saved = safeStorage.getItem('math_rockstar_stats');
      return saved ? JSON.parse(saved) : INITIAL_STATS;
    } catch (err) {
      console.warn('[JesseMath] Could not load initial stats from storage:', err);
      return INITIAL_STATS;
    }
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNight, setIsNight] = useState(false);
  React.useEffect(() => {
    const hour = new Date().getHours();
    setIsNight(hour >= 18 || hour < 6);
  }, []);

  // Real-time proactive notification simulator & dispatcher
  React.useEffect(() => {
    const initialTimer = setTimeout(() => {
      dispatchNotification(
        'motivation',
        'peerUpdates',
        '⚡ Live Speed Duel Challenge!',
        'Alex just challenged you to a 60-second multiplication duel in the Multiplayer Arena!'
      );
    }, 6000);

    const recurringInterval = setInterval(() => {
      const scenarios: Array<{
        group: 'motivation' | 'learning' | 'progress' | 'discovery' | 'system';
        key: keyof NotificationCategorySettings;
        title: string;
        body: string;
      }> = [
        {
          group: 'motivation',
          key: 'streakReminders',
          title: '🔥 Streak & Daily Reminder',
          body: 'Your math rockstar streak is active! Complete one speed gig today to keep your crown.'
        },
        {
          group: 'learning',
          key: 'deadlines',
          title: '⏰ Assignment Deadline Alert',
          body: 'Mr. Otobo’s Year 6 KS2 Arithmetic assignment is due by Friday EOD. Tap to solve!'
        },
        {
          group: 'system',
          key: 'scheduleReminders',
          title: '🚨 Emergency Math Practice',
          body: 'Quick mental math check: What is 9 × 8? Tap to boost your arithmetic speed!'
        },
        {
          group: 'progress',
          key: 'praiseAndRewards',
          title: '🏆 Achievement Unlocked!',
          body: 'You earned a new badge for mastering long division with 100% accuracy!'
        },
        {
          group: 'discovery',
          key: 'dailyChallenges',
          title: '💡 Daily Challenge Ready',
          body: 'New fraction and algebra puzzles have dropped in the Learning Hub. Check them out!'
        }
      ];
      const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
      dispatchNotification(randomScenario.group, randomScenario.key, randomScenario.title, randomScenario.body);
    }, 60000); // Every 60 seconds a true real-time simulated notification pops up

    return () => {
      clearTimeout(initialTimer);
      clearInterval(recurringInterval);
    };
  }, []);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tab') === 'terms' || window.location.hash === '#terms' || params.has('terms')) {
        setActiveTab('terms');
      }
    }
  }, []);

  const handleNavigateToTermsSection = (section: 'privacy' | 'terms' | 'dual') => {
    setActiveTab('terms');
    if (typeof window !== 'undefined') {
      const newUrl = `${window.location.origin}${window.location.pathname}?tab=terms&section=${section}`;
      window.history.replaceState({ path: newUrl }, '', newUrl);
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('easy');


  // Custom configurations (Sound, avatars & speed)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [configSettings, setConfigSettings] = useState(() => {
    try {
      const saved = safeStorage.getItem('math_rockstar_config');
      return saved ? JSON.parse(saved) : {
        soundEffects: true,
        rockMusic: true,
        quietMode: false,
        selectedAvatar: '🎸 Math Rockstar',
        customSpeed: 'easy' as Difficulty
      };
    } catch (err) {
      console.warn('[JesseMath] Could not load configSettings from storage:', err);
      return {
        soundEffects: true,
        rockMusic: true,
        quietMode: false,
        selectedAvatar: '🎸 Math Rockstar',
        customSpeed: 'easy' as Difficulty
      };
    }
  });

  useEffect(() => {
    safeStorage.setItem('math_rockstar_config', JSON.stringify(configSettings));
    if (configSettings.quietMode) {
      document.body.classList.add('quiet-mode');
    } else {
      document.body.classList.remove('quiet-mode');
    }

    // BGM will only play in ArenaMatches and Quiz now.
    if (configSettings.quietMode || !configSettings.rockMusic) {
      stopBGM();
    }
  }, [configSettings.rockMusic, configSettings.quietMode]);

  // Interactive Authentication State
  const [authState, setAuthState] = useState<{
    isAuthenticated: boolean;
    isChecking: boolean;
    isCookieBlocked: boolean;
    message: string;
    username: string | null;
    role?: 'student' | 'teacher' | 'parent' | 'individual' | 'guest' | 'class_student';
    schoolId?: string | null;
    schoolName?: string | null;
    className?: string | null;
    classCode?: string | null;
    realName?: string | null;
    userId?: string | null;
  }>({
    isAuthenticated: false,
    isChecking: true,
    isCookieBlocked: false,
    message: "Initializing secure session...",
    username: null,
    role: 'individual'
  });

  const [userDeviceId, setUserDeviceId] = useState<string | null>(null);
  const [practiceLesson, setPracticeLesson] = useState<Lesson | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>((window as any).deferredPrompt || null);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      (window as any).deferredPrompt = e;
      console.log('beforeinstallprompt event was fired and saved');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Also check if it was set before this effect ran
    if ((window as any).deferredPrompt) {
      setDeferredPrompt((window as any).deferredPrompt);
    }

    const handleAppInstalled = () => {
      // Clear the deferredPrompt so it can be garbage collected
      setDeferredPrompt(null);
      (window as any).deferredPrompt = null;
      console.log('PWA was installed');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Show "Claim your account" modal every 5 minutes for guests to prevent them from losing their data
  React.useEffect(() => {
    if (authState.role === 'guest') {
      const interval = setInterval(() => {
        setShowConvertModal(true);
      }, 5 * 60 * 1000); // 5 minutes
      
      return () => clearInterval(interval);
    }
  }, [authState.role]);

  const fetchAndSyncProfile = async (uname: string, deviceId: string) => {
    const role = safeStorage.getItem('jesse_rock_role') as any || 'individual';
    const schoolId = safeStorage.getItem('jesse_rock_school_id');
    const schoolName = safeStorage.getItem('jesse_rock_school_name');
    const className = safeStorage.getItem('jesse_rock_class_name');
    const realName = safeStorage.getItem('jesse_rock_real_name');
    const userId = safeStorage.getItem('jesse_rock_user_id');

    // Notify backend to establish the server-verified secure session cookie
    try {
      await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId || deviceId,
          username: uname,
          role: role
        })
      });
    } catch (cookieErr) {
      console.warn("Could not synchronize secure HttpOnly cookie session with server:", cookieErr);
    }

    if (role !== 'individual') {
      const classCode = safeStorage.getItem('jesse_rock_class_code') || '';
      setAuthState({
        isAuthenticated: true,
        isChecking: false,
        isCookieBlocked: false,
        message: role === 'class_student'
          ? `Welcome to Class Playground, @${uname}!`
          : `Welcome back to the Math School Panel, ${realName || uname}!`,
        username: uname,
        role,
        schoolId,
        schoolName,
        className,
        realName,
        userId,
        classCode: role === 'class_student' ? classCode : undefined
      });

      if (role === 'student' && userId) {
        try {
          const studentDocRef = doc(db, 'school_students', userId);
          const studentDoc = await getDoc(studentDocRef);
          if (studentDoc.exists()) {
            const studentData = studentDoc.data();
            const prog = studentData.school_math_progress || studentData.math_progress_data || { highScore: 0, xp: 100, solved: 0, correctAnswers: 0 };
            setStats({
              totalSolved: prog.solved || 0,
              correctAnswers: prog.correctAnswers || 0,
              level: calculateLevel({ ...INITIAL_STATS, ...prog } as any),
              xp: prog.xp || 100,
              streak: 0,
              bestStreak: 0,
              history: [],
              unlockedBadges: ["School Rockstar"],
              weeklyProgress: undefined
            });
          }
        } catch (e) {
          console.warn("Failed to fetch student live math progress:", e);
        }
      } else if (role === 'class_student' && userId) {
        try {
          const reqDocRef = doc(db, 'class_requests', userId);
          const reqDoc = await getDoc(reqDocRef);
          if (reqDoc.exists()) {
            const reqData = reqDoc.data();
            setStats({
              totalSolved: reqData.score || 0,
              correctAnswers: reqData.score || 0,
              level: calculateLevel({ ...INITIAL_STATS, xp: reqData.xp || 100 } as any),
              xp: reqData.xp || 100,
              streak: 0,
              bestStreak: 0,
              history: [],
              unlockedBadges: ["Class Playground Explorer"]
            });
          }
        } catch (e) {
          console.warn("Failed to load class student stats:", e);
        }
      }
      return;
    }

    const userDocRef = doc(db, "users", deviceId);
    let userDoc;
    try {
      userDoc = await getDoc(userDocRef);
    } catch (e) {
      console.warn("Failed to fetch user document from Firestore, falling back:", e);
    }

    try {
      if (userDoc && userDoc.exists()) {
        const profile = userDoc.data();
        
        // --- Daily Streak Logic ---
        const today = new Date().toISOString().split('T')[0];
        let currentStreak = profile.streak || 0;
        let lastLogin = profile.lastLoginDate;
        let streakDays = profile.streakDays || [];
        
        if (lastLogin !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          if (lastLogin === yesterdayStr) {
            // Consecutive login! Grant 5 streak bonus as requested
            currentStreak += 5;
          } else {
            // Streak broken or first login in a while
            currentStreak = 1;
          }
          
          lastLogin = today;
          if (!streakDays.includes(today)) {
            streakDays = [...streakDays, today];
            if (streakDays.length > 31) streakDays.shift(); // Keep last month
          }
          
          // Update Firestore
          try {
            await updateDoc(userDocRef, {
              streak: currentStreak,
              lastLoginDate: lastLogin,
              streakDays: streakDays
            });
          } catch (e) {
            console.warn("Failed to update daily streak in Firestore:", e);
          }
        }

        setAuthState({
          isAuthenticated: true,
          isChecking: false,
          isCookieBlocked: false,
          message: `Logged in as ${profile.username}!`,
          username: profile.username,
          role: 'individual',
          userId: deviceId
        });
        // Map stats from Database
        setStats({
          totalSolved: profile.totalSolved || 0,
          correctAnswers: profile.correctAnswers || 0,
          level: calculateLevel({ ...INITIAL_STATS, ...profile } as any),
          xp: profile.xp || 100,
          streak: currentStreak,
          bestStreak: Math.max(profile.bestStreak || 0, currentStreak),
          completedLessons: profile.completedLessons || [],
          history: profile.history || [],
          unlockedBadges: profile.badges || ["Genius Debut"],
          weeklyProgress: profile.weeklyProgress || undefined,
          lastLoginDate: lastLogin,
          streakDays: streakDays
        });
      } else {
        // Save dynamically on Firestore if missing
        try {
          await setDoc(userDocRef, {
            uid: deviceId,
            username: uname,
            xp: 100,
            streak: 1,
            coins: 100,
            badges: ["Genius Debut"],
            createdAt: Date.now()
          });
        } catch (srvErr) {
          console.warn("Could not save profile record to database:", srvErr);
        }

        setAuthState({
          isAuthenticated: true,
          isChecking: false,
          isCookieBlocked: false,
          message: `Welcome to Jesse Rock, ${uname}!`,
          username: uname,
          role: 'individual',
          userId: deviceId
        });
      }
    } catch (e) {
      console.error("Error loading user profile:", e);
      setAuthState({
        isAuthenticated: true,
        isChecking: false,
        isCookieBlocked: false,
        message: "Logged in",
        username: uname,
        role: 'individual',
        userId: deviceId
      });
    }
  };

  useEffect(() => {
    // Check if there is an active logged-in math rockstar on this device
    const storedUsername = safeStorage.getItem('jesse_rock_my_username');
    let storedDeviceId = safeStorage.getItem('jesse_rock_device_id');
    
    if (!storedDeviceId) {
      storedDeviceId = 'user_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
      safeStorage.setItem('jesse_rock_device_id', storedDeviceId);
    }
    
    setUserDeviceId(storedDeviceId);

    if (storedUsername) {
      // Set initial state immediately for "instant" feel
      setAuthState({
        isAuthenticated: true,
        isChecking: false,
        isCookieBlocked: false,
        message: `Welcome back, @${storedUsername}`,
        username: storedUsername,
        role: (safeStorage.getItem('jesse_rock_role') as any) || 'individual',
        userId: storedDeviceId
      });
      fetchAndSyncProfile(storedUsername, storedDeviceId);
    } else {
      // If user is not stored/signed in, prompt sign in even when landing on a sitelink from Google Search
      setAuthState({
        isAuthenticated: false,
        isChecking: false,
        isCookieBlocked: false,
        message: "Please sign in to begin.",
        username: null
      });
    }

    // Actively monitor Firebase Auth for disabled or deleted accounts
    const unsubAuth = onIdTokenChanged(auth, async (user) => {
      if (user) {
        try {
          // Force token refresh to detect disabled state immediately
          await user.getIdToken(true);
        } catch (err: any) {
          if (err?.code === 'auth/user-disabled' || err?.code === 'auth/user-not-found' || err?.code === 'auth/user-token-expired') {
            console.warn("User has been disabled or deleted by admin. Forcing logout...");
            await signOut(auth);
            safeStorage.removeItem('jesse_rock_my_username');
            safeStorage.removeItem('jesse_rock_user_id');
            safeStorage.removeItem('jesse_rock_role');
            setAuthState({
              isAuthenticated: false,
              isChecking: false,
              isCookieBlocked: false,
              message: "Your account has been permanently disabled or blocked by the administration.",
              username: null
            });
            window.location.reload();
          }
        }
      }
    });

    return () => unsubAuth();
  }, []);

  // Real-time equipped avatar subscription hook
  useEffect(() => {
    const uid = authState.userId || userDeviceId;
    if (!uid || !authState.isAuthenticated) return;
    
    const colName = authState.role === 'student' ? 'school_students' : 'users';
    
    try {
      const unsub = onSnapshot(doc(db, colName, uid), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.equipped_items) {
            setLiveEquipped({
              hair: data.equipped_items.hair || 'hair_default',
              body: data.equipped_items.body || 'body_default',
              instrument: data.equipped_items.instrument || 'instrument_default'
            });
          }
          if (data.streak !== undefined || data.bestStreak !== undefined) {
             setStats(prev => ({
                ...prev,
                ...(data.streak !== undefined && { streak: data.streak }),
                ...(data.bestStreak !== undefined && { bestStreak: data.bestStreak })
             }));
          }
          if (data.jesse_gift && data.jesse_gift.type === 'streak') {
            const currentGiftId = data.jesse_gift.id;
            const lastSeenGift = safeStorage.getItem('jesse_last_seen_gift');
            if (currentGiftId !== lastSeenGift) {
               setShowGiftDialog({ 
                 amount: data.jesse_gift.amount, 
                 isWeeklyWinner: currentGiftId.startsWith('weekly_winner_')
               });
               safeStorage.setItem('jesse_last_seen_gift', currentGiftId);
            }
          }
        }
      }, (error) => {
        console.warn("Error in real-time progress subscription:", error);
      });
      return () => unsub();
    } catch (err) {
      console.warn("Avatar snap hook skipped:", err);
    }
  }, [authState.userId, userDeviceId, authState.role, authState.isAuthenticated]);

  const handleStandardLogin = () => {};
  const handlePopupLoginFallback = () => {};

  const handleSignOut = async () => {
    if (authState.role === 'guest') {
      const confirmLogOut = window.confirm("You are currently a Guest. If you log out without claiming your account, you will lose access to your progress on this device! Are you sure you want to log out?");
      if (!confirmLogOut) {
        setShowConvertModal(true);
        return;
      }
    }

    safeStorage.removeItem('jesse_rock_my_username');
    safeStorage.removeItem('jesse_rock_device_id');
    safeStorage.removeItem('jesse_rock_role');
    safeStorage.removeItem('jesse_rock_school_id');
    safeStorage.removeItem('jesse_rock_school_name');
    safeStorage.removeItem('jesse_rock_class_name');
    safeStorage.removeItem('jesse_rock_real_name');
    safeStorage.removeItem('jesse_rock_user_id');

    // Notify backend to clear the secure session cookie
    try {
      await fetch('/api/logout', { method: 'POST' });
    } catch (logoutErr) {
      console.warn("Could not clear secure HttpOnly session cookie on the server:", logoutErr);
    }

    const freshDeviceId = 'user_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
    safeStorage.setItem('jesse_rock_device_id', freshDeviceId);
    setUserDeviceId(freshDeviceId);
    
    setAuthState({
      isAuthenticated: false,
      isChecking: false,
      isCookieBlocked: false,
      message: "Please enter your name to begin.",
      username: null,
      role: 'individual'
    });
    navigate('/');
  };

  useEffect(() => {
    if (authState.role === 'guest') {
      safeStorage.setItem('guest_rockstar_stats', JSON.stringify(stats));
    } else {
      safeStorage.setItem('math_rockstar_stats', JSON.stringify(stats));
    }
  }, [stats, authState.role]);


  // Anniversary Reward Hook
  useEffect(() => {
    if (!authState.isAuthenticated || authState.role === 'guest' || !userDeviceId) return;
    
    // Check for June 20th Anniversary
    const today = new Date();
    if (today.getMonth() === 5 && today.getDate() === 20) {
      const currentYear = today.getFullYear();
      const claimedField = `anniversary_claimed_${currentYear}`;
      
      // We need the latest user data to check this
      const uid = authState.userId || userDeviceId;
      const colName = authState.role === 'student' ? 'school_students' : 'users';
      const userRef = doc(db, colName, uid);
      
      getDoc(userRef).then(snap => {
        if (snap.exists() && !snap.data()[claimedField]) {
             const amount = 100;
             const updateData: any = {
                streak: increment(amount),
                bestStreak: increment(amount),
                streakScore: increment(amount),
                coins: increment(amount),
                jesse_gift: { id: `anniversary_${currentYear}`, amount, type: 'streak' },
                [claimedField]: true
             };

             updateDoc(userRef, updateData).catch(console.warn);
         }
      });
    }
  }, [authState.isAuthenticated, userDeviceId, authState.role, authState.userId]);

  // MODULE 2 & 3: Active User Engine & 5-Minute Reward Loop
  useEffect(() => {
    if (!authState.isAuthenticated || !userDeviceId) return;

    let timerInterval: NodeJS.Timeout;
    const lastActiveRef = { current: Date.now() };

    // Reset inactivity timer on user activity (throttled to at most once per 2 seconds)
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastActiveRef.current > 2000) {
        lastActiveRef.current = now;
      }
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    timerInterval = setInterval(() => {
      // Pause if tab is hidden / minimized
      if (document.visibilityState !== 'visible') return;

      // Pause if idle for more than 30 seconds
      if (Date.now() - lastActiveRef.current > 30000) return;

      setRewardTimer((prev) => {
        if (prev <= 1) {
          // Trigger automated celebration sequence!
          triggerJackpotReward();
          return 300; // Reset countdown
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timerInterval);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, [authState.isAuthenticated, userDeviceId]);

  const triggerJackpotReward = async () => {
    if (!userDeviceId) return;

    // 1. Lock workspace for 2 seconds (flash a high-impact state)
    setIsWorkspaceLocked(true);
    setTimeout(() => {
      setIsWorkspaceLocked(false);
    }, 2000);

    // 2. Local update
    setStats((prev) => {
      const newStreak = prev.streak + 100;
      const best = Math.max(prev.bestStreak, newStreak);
      return {
        ...prev,
        streak: newStreak,
        bestStreak: best
      };
    });

    // 3. Database write
    try {
      const userRef = doc(db, "users", userDeviceId);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const userData = snap.data();
        const nextStreak = (userData.streak ?? 0) + 100;
        const nextBest = Math.max(userData.bestStreak ?? 0, nextStreak);
        await setDoc(userRef, {
          streak: nextStreak,
          bestStreak: nextBest,
          streakScore: nextBest, // Update the sorting attribute streakScore
          coins: (userData.coins ?? 0) + 100,
          jesse_gift: { id: `jackpot_${Date.now()}`, amount: 100, type: 'streak' }
        }, { merge: true });
      }
    } catch (err) {
      console.warn("Could not sync jackpot bonus to firestore:", err);
    }

    // 4. Trigger celebration modal displaying Jesse's official quote
    setShowGiftDialog({ amount: 100 });
  };

  const handleQuizFinish = async (score: number, total: number, xpGained: number) => {
    const { weekKey } = getWeeklyData();
    const formattedDate = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const newHistoryItem = {
      date: formattedDate,
      score: score,
      total: total,
      difficulty: selectedDifficulty,
      arenaType: 'Practice Quiz',
      sections: practiceLesson ? [practiceLesson.title] : ['Math Workout']
    };

    const newXP = stats.xp + xpGained;
    const currentStreak = score > 0 ? stats.streak + 1 : 0;
    const best = Math.max(stats.bestStreak, currentStreak);
    
    const prevWeekly = stats.weeklyProgress?.weekKey === weekKey 
      ? stats.weeklyProgress 
      : { weekKey, solvedThisWeek: 0, xpThisWeek: 0, claimedWeeklyBadge: false };
    
    const newWeekly = {
      ...prevWeekly,
      solvedThisWeek: (prevWeekly?.solvedThisWeek || 0) + score,
      xpThisWeek: (prevWeekly?.xpThisWeek || 0) + xpGained
    };
    
    const nextStats = {
      ...stats,
      totalSolved: stats.totalSolved + total,
      correctAnswers: stats.correctAnswers + score,
      xp: newXP,
      streak: currentStreak,
      bestStreak: best,
      weeklyProgress: newWeekly,
      unlockedBadges: stats.unlockedBadges || [],
      history: [...(stats.history || []), newHistoryItem]
    };
    
    // Auto-unlock Grand Master badge if solving 200 or more
    if (nextStats.totalSolved >= 200 && !nextStats.unlockedBadges.includes('grand_master')) {
      nextStats.unlockedBadges = [...nextStats.unlockedBadges, 'grand_master'];
    }

    nextStats.level = calculateLevel(nextStats);

    setStats(nextStats);

    // Trigger Grand Master Celebration Modal
    if (stats.totalSolved < 200 && nextStats.totalSolved >= 200) {
      setTimeout(() => setShowGrandMasterCelebration(true), 400);
    }

    if (authState.role === 'guest') {
      setGuestScore({ score, xp: xpGained });
      setShowGuestFinishDialog(true);
      return;
    }

    if (userDeviceId) {
      try {
        await setDoc(doc(db, "users", userDeviceId), {
          totalSolved: nextStats.totalSolved,
          correctAnswers: nextStats.correctAnswers,
          xp: nextStats.xp,
          level: nextStats.level,
          streak: nextStats.streak,
          bestStreak: nextStats.bestStreak,
          streakScore: nextStats.bestStreak,
          badges: nextStats.unlockedBadges,
          weeklyProgress: nextStats.weeklyProgress,
          history: nextStats.history
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${userDeviceId}`);
      }
    }

    if (authState.role === 'student' && authState.userId) {
      try {
        await updateSchoolStudentProgress(authState.userId, score, xpGained, score > 0);
        // Also sync the badges collection on Firestore for students
        await setDoc(doc(db, 'school_students', authState.userId), {
          badges: nextStats.unlockedBadges,
          totalSolved: nextStats.totalSolved
        }, { merge: true });
      } catch (err) {
        console.warn("School student progress update bypassed / failed:", err);
      }
    }

    if (authState.role === 'class_student' && authState.userId) {
      try {
        const classSessionRef = doc(db, 'class_sessions', authState.userId);
        const reqSnap = await getDoc(classSessionRef);
        if (reqSnap.exists()) {
          const reqData = reqSnap.data();
          const currentScore = reqData.score || 0;
          const currentXp = reqData.xp || 100;
          await updateDoc(classSessionRef, {
            score: currentScore + score,
            xp: currentXp + xpGained,
            last_active: Date.now()
          });
        }
      } catch (err) {
        console.warn("Failed to update class student playground progress (quiz):", err);
      }
    }
    
    setPracticeLesson(null);
    setActiveTab(authState.role === 'class_student' ? 'home' : 'dashboard');
  };

  const handleLearnArenaFinish = async (score: number, total: number, xpGained: number, difficulty: Difficulty, sections: string[]) => {
    const { weekKey } = getWeeklyData();
    const formattedDate = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const newHistoryItem = {
      date: formattedDate,
      score: score,
      total: total,
      difficulty: difficulty,
      arenaType: 'Learning Arena',
      sections: sections
    };

    const newXP = stats.xp + xpGained;
    
    const isLessonQuiz = !!practiceLesson;
    const isLessonPassed = isLessonQuiz && score >= 15;
    
    let currentStreak = stats.streak;
    if (isLessonQuiz) {
      if (isLessonPassed) {
        currentStreak += 10;
      }
    } else {
      currentStreak = score > 0 ? stats.streak + 1 : 0;
    }
    
    const best = Math.max(stats.bestStreak, currentStreak);
    
    const prevCompleted = stats.completedLessons || [];
    const completedLessons = (isLessonPassed && practiceLesson && !prevCompleted.includes(practiceLesson.id))
      ? [...prevCompleted, practiceLesson.id]
      : prevCompleted;
    
    const prevWeekly = stats.weeklyProgress?.weekKey === weekKey 
      ? stats.weeklyProgress 
      : { weekKey, solvedThisWeek: 0, xpThisWeek: 0, claimedWeeklyBadge: false };
    
    const newWeekly = {
      ...prevWeekly,
      solvedThisWeek: (prevWeekly?.solvedThisWeek || 0) + score,
      xpThisWeek: (prevWeekly?.xpThisWeek || 0) + xpGained
    };
    
    const nextStats = {
      ...stats,
      totalSolved: stats.totalSolved + total,
      correctAnswers: stats.correctAnswers + score,
      xp: newXP,
      streak: currentStreak,
      bestStreak: best,
      completedLessons,
      weeklyProgress: newWeekly,
      unlockedBadges: stats.unlockedBadges || [],
      history: [...(stats.history || []), {
        ...newHistoryItem,
        lessonId: practiceLesson?.id,
        lessonTitle: practiceLesson?.title,
        passed: isLessonQuiz ? isLessonPassed : undefined
      }]
    };

    // Auto-unlock Grand Master badge if solving 200 or more
    if (nextStats.totalSolved >= 200 && !nextStats.unlockedBadges.includes('grand_master')) {
      nextStats.unlockedBadges = [...nextStats.unlockedBadges, 'grand_master'];
    }

    nextStats.level = calculateLevel(nextStats);

    setStats(nextStats);

    // Trigger Grand Master Celebration Modal
    if (stats.totalSolved < 200 && nextStats.totalSolved >= 200) {
      setTimeout(() => setShowGrandMasterCelebration(true), 400);
    }

    if (authState.role === 'guest') {
      return;
    }

    if (userDeviceId) {
      try {
        await setDoc(doc(db, "users", userDeviceId), {
          totalSolved: nextStats.totalSolved,
          correctAnswers: nextStats.correctAnswers,
          xp: nextStats.xp,
          level: nextStats.level,
          streak: nextStats.streak,
          bestStreak: nextStats.bestStreak,
          streakScore: nextStats.bestStreak,
          completedLessons: nextStats.completedLessons,
          badges: nextStats.unlockedBadges,
          weeklyProgress: nextStats.weeklyProgress,
          history: nextStats.history
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${userDeviceId}`);
      }
    }

    if (authState.role === 'student' && authState.userId) {
      try {
        await updateSchoolStudentProgress(authState.userId, score, xpGained, score > 0);
        // Also sync the badges collection on Firestore for students
        await setDoc(doc(db, 'school_students', authState.userId), {
          badges: nextStats.unlockedBadges,
          totalSolved: nextStats.totalSolved
        }, { merge: true });
      } catch (err) {
        console.warn("School student progress update bypassed / failed:", err);
      }
    }

    if (authState.role === 'class_student' && authState.userId) {
      try {
        const classSessionRef = doc(db, 'class_sessions', authState.userId);
        const reqSnap = await getDoc(classSessionRef);
        if (reqSnap.exists()) {
          const reqData = reqSnap.data();
          const currentScore = reqData.score || 0;
          const currentXp = reqData.xp || 100;
          await updateDoc(classSessionRef, {
            score: currentScore + score,
            xp: currentXp + xpGained,
            last_active: Date.now()
          });
        }
      } catch (err) {
        console.warn("Failed to update class student playground progress (learn):", err);
      }
    }
  };

  const handlePlayArenaFinish = async (score: number, total: number, xpGained: number) => {
    const { weekKey } = getWeeklyData();
    const formattedDate = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const newHistoryItem = {
      date: formattedDate,
      score: score,
      total: total,
      difficulty: 'hard' as Difficulty,
      arenaType: 'Play Arena',
      sections: ['Addition', 'Subtraction', 'Multiplication']
    };

    const newXP = stats.xp + xpGained;
    const currentStreak = score > 0 ? stats.streak + 1 : 0;
    const best = Math.max(stats.bestStreak, currentStreak);
    
    const prevWeekly = stats.weeklyProgress?.weekKey === weekKey 
      ? stats.weeklyProgress 
      : { weekKey, solvedThisWeek: 0, xpThisWeek: 0, claimedWeeklyBadge: false };
    
    const newWeekly = {
      ...prevWeekly,
      solvedThisWeek: (prevWeekly?.solvedThisWeek || 0) + score,
      xpThisWeek: (prevWeekly?.xpThisWeek || 0) + xpGained
    };
    
    const nextStats = {
      ...stats,
      totalSolved: stats.totalSolved + total,
      correctAnswers: stats.correctAnswers + score,
      xp: newXP,
      streak: currentStreak,
      bestStreak: best,
      weeklyProgress: newWeekly,
      unlockedBadges: stats.unlockedBadges || [],
      history: [...(stats.history || []), newHistoryItem]
    };

    // Auto-unlock Grand Master badge if solving 200 or more
    if (nextStats.totalSolved >= 200 && !nextStats.unlockedBadges.includes('grand_master')) {
      nextStats.unlockedBadges = [...nextStats.unlockedBadges, 'grand_master'];
    }

    nextStats.level = calculateLevel(nextStats);

    setStats(nextStats);

    // Trigger Grand Master Celebration Modal
    if (stats.totalSolved < 200 && nextStats.totalSolved >= 200) {
      setTimeout(() => setShowGrandMasterCelebration(true), 400);
    }

    if (authState.role === 'guest') {
      return;
    }

    if (userDeviceId) {
      try {
        await setDoc(doc(db, "users", userDeviceId), {
          totalSolved: nextStats.totalSolved,
          correctAnswers: nextStats.correctAnswers,
          xp: nextStats.xp,
          level: nextStats.level,
          streak: nextStats.streak,
          bestStreak: nextStats.bestStreak,
          streakScore: nextStats.bestStreak,
          badges: nextStats.unlockedBadges,
          weeklyProgress: nextStats.weeklyProgress,
          history: nextStats.history
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${userDeviceId}`);
      }
    }

    if (authState.role === 'student' && authState.userId) {
      try {
        await updateSchoolStudentProgress(authState.userId, score, xpGained, score > 0);
        // Also sync the badges collection on Firestore for students
        await setDoc(doc(db, 'school_students', authState.userId), {
          badges: nextStats.unlockedBadges,
          totalSolved: nextStats.totalSolved
        }, { merge: true });
      } catch (err) {
        console.warn("School student progress update bypassed / failed:", err);
      }
    }

    if (authState.role === 'class_student' && authState.userId) {
      try {
        const classSessionRef = doc(db, 'class_sessions', authState.userId);
        const reqSnap = await getDoc(classSessionRef);
        if (reqSnap.exists()) {
          const reqData = reqSnap.data();
          const currentScore = reqData.score || 0;
          const currentXp = reqData.xp || 100;
          await updateDoc(classSessionRef, {
            score: currentScore + score,
            xp: currentXp + xpGained,
            last_active: Date.now()
          });
        }
      } catch (err) {
        console.warn("Failed to update class student playground progress (play):", err);
      }
    }
  };


  const handleClaimWeeklyBadge = async () => {
    const { currentChallenge, weekKey } = getWeeklyData();
    let updatedStats: any = null;

    setStats(prev => {
      const badges = prev.unlockedBadges || [];
      if (badges.includes(currentChallenge.id)) return prev;
      
      // Award 150 bonus XP to student instantly for claiming!
      const bonusXP = 150;
      const newXP = prev.xp + bonusXP;
      const next = {
        ...prev,
        xp: newXP,
        level: 1,
        unlockedBadges: [...badges, currentChallenge.id],
        weeklyProgress: {
          ...(prev.weeklyProgress || { weekKey, solvedThisWeek: 0, xpThisWeek: 0 }),
          weekKey,
          claimedWeeklyBadge: true
        }
      };
      next.level = calculateLevel(next);
      updatedStats = next;
      return next;
    });

    if (userDeviceId) {
      try {
        await setDoc(doc(db, "users", userDeviceId), {
          xp: updatedStats?.xp ?? (stats.xp + 150),
          level: updatedStats?.level ?? 1,
          badges: updatedStats?.unlockedBadges ?? [...(stats.unlockedBadges || []), currentChallenge.id],
          weeklyProgress: updatedStats?.weeklyProgress ?? {
            ...(stats.weeklyProgress || { weekKey, solvedThisWeek: 0, xpThisWeek: 0 }),
            weekKey,
            claimedWeeklyBadge: true
          }
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${userDeviceId}`);
      }
    }
  };

  if (!authState.isAuthenticated) {
    return (
      <AuthGate 
        onAuthSuccess={(uname, matchedUid) => {
          setUserDeviceId(matchedUid);
          fetchAndSyncProfile(uname, matchedUid);
        }}
        onGuestPlay={() => {
          const savedGuest = safeStorage.getItem('guest_rockstar_stats');
          if (savedGuest) {
            setStats(JSON.parse(savedGuest));
          } else {
            setStats(INITIAL_STATS);
          }
          setAuthState({
            isAuthenticated: true,
            isChecking: false,
            isCookieBlocked: false,
            message: "Guest session started",
            username: "Rockstar Guest",
            role: "guest",
            userId: null
          });
          setActiveTab('home');
        }}
      />
    );
  }

  if (authState.role === 'teacher') {
    return (
      <React.Suspense fallback={
        <div className="h-full flex items-center justify-center bg-slate-950 text-white">
          <Loader2 className="animate-spin text-brand-primary w-12 h-12" />
        </div>
      }>
        <SchoolDashboards 
          authState={authState as any} 
          onSignOut={handleSignOut} 
        />
      </React.Suspense>
    );
  }

  if (authState.role === 'parent') {
    return (
      <React.Suspense fallback={
        <div className="h-full flex items-center justify-center bg-slate-950 text-white">
          <Loader2 className="animate-spin text-brand-primary w-12 h-12" />
        </div>
      }>
        <ParentDashboard
          parentId={authState.userId || ''}
          parentName={authState.realName || authState.username || 'Parent'}
          onSignOut={handleSignOut}
        />
      </React.Suspense>
    );
  }

  const LogoIcon = ({ size }: { size?: number }) => (
    <div style={{ width: size, height: size }} className="rounded-full overflow-hidden border border-deep-navy/20">
      <img src="https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Farticles%2Fvk11iy6n5ppdp0j4nm46.png" alt="Logo" className="w-full h-full object-cover" />
    </div>
  );

  const navItems = authState.role === 'class_student'
    ? [
        { id: 'home', label: 'Classroom Playground', icon: Home },
        { id: 'notifications', label: '🔔 Notifications', icon: Bell },
        { id: 'quiz', label: 'Play Quiz Battle 🏆', icon: Trophy },
        { id: 'terms', label: 'Terms & Policies', icon: FileText }
      ]
    : [
        { id: 'home', label: 'Welcome Home', icon: Home },
        { id: 'notifications', label: '🔔 Notifications Hub', icon: Bell },
        { id: 'dashboard', label: 'My Progress Stats', icon: Award },
        { id: 'leaderboard', label: '🏆 Global Leaderboard', icon: Trophy },
        { id: 'shop', label: '🔥 Rock Shop', icon: ShoppingBag },
        { id: 'arcade', label: 'Fun Arcade 🕹️', icon: Gamepad2 },
        { id: 'hub', label: 'Learning Hub', icon: BookOpen },
        { id: 'sats', label: '🎓 KS2 SATs Prep Hub', icon: GraduationCap },
        { id: 'quiz', label: 'Play Arena', icon: Trophy },
        { id: 'learn', label: 'Learn Arena', icon: BookOpen },
        { id: 'arena', label: 'Multiplayer Arena', icon: LogoIcon },
        { id: 'badges', label: 'Badges & Quests', icon: Star },
        { id: 'rules', label: 'How It Works & Rules', icon: HelpCircle },
        { id: 'terms', label: 'Terms & Policies', icon: FileText },
        { id: 'developer', label: 'Meet Developer', icon: User },
        { id: 'creator', label: "Jesse's Desk 👑", icon: ShieldCheck }
      ];

  return (
    <div className="h-dvh w-screen overflow-hidden bg-daytime flex flex-col text-deep-navy font-sans selection:bg-pastel-pink selection:text-deep-navy relative z-10">
      {/* Dynamic Floating Emojis Background */}
      <div className="floating-bg-container fixed inset-0 pointer-events-none">
        {activeTab !== 'quiz' && backgroundEmojis.map((emoji, idx) => (
          <div
            key={`${emoji.id}-${idx}`}
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
      {/* Container for sidebar + content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-30 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 glass bg-clean-white text-deep-navy border-r border-deep-navy border-r-4 transition-transform lg:translate-x-0 lg:static shrink-0 flex flex-col",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex items-center justify-between gap-3 p-4 border-b border-deep-navy/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(0,230,118,0.5)] border border-pastel-green/50 shrink-0 block">
                <img src="https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Farticles%2Fvk11iy6n5ppdp0j4nm46.png" alt="Jesse Math Rockstar Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <h1 className="text-lg font-display font-black tracking-tight leading-tight text-deep-navy">JESSE ROCK<br />
                <span className="text-action-orange text-xs uppercase font-extrabold">MATH ARENA 👑</span>
              </h1>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)} 
              className="lg:hidden p-2 text-deep-navy hover:text-action-orange transition-colors"
              aria-label="Close menu"
            >
              <X size={24}/>
            </button>
          </div>
          
          
          <nav className="flex-1 overflow-y-auto space-y-1.5 p-4 scrollbar-thin-custom" role="navigation" aria-label="Main Navigation">
            {navItems.map((item, idx) => {
              if (item.id === 'notifications') {
                return (
                  <button
                    key={`${item.id}-${idx}`}
                    onClick={() => {
                      setIsSidebarOpen(false);
                      setShowNotificationsModal(true);
                    }}
                    aria-label={`Navigate to ${item.label}`}
                    className={cn(
                      "w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-xs font-bold transition-all border border-transparent min-h-[44px]",
                      activeTab === item.id 
                        ? "bg-deep-navy text-clean-white border-deep-navy shadow-md scale-[1.02]" 
                        : "text-deep-navy hover:bg-sky-blue/40 hover:border-deep-navy/20"
                    )}
                  >
                    <item.icon size={20} />
                    {item.label}
                  </button>
                );
              }

              return (
                <Link
                  key={`${item.id}-${idx}`}
                  to={item.id === 'home' ? '/' : `/${item.id}`}
                  onClick={() => setIsSidebarOpen(false)}
                  aria-label={`Navigate to ${item.label}`}
                  className={cn(
                    "w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-xs font-bold transition-all border border-transparent min-h-[44px]",
                    activeTab === item.id 
                      ? "bg-deep-navy text-clean-white border-deep-navy shadow-md scale-[1.02]" 
                      : "text-deep-navy hover:bg-sky-blue/40 hover:border-deep-navy/20"
                  )}
                  title={item.label}
                >
                  <item.icon size={20} />
                  {item.label}
                </Link>
              );
            })}
{deferredPrompt ? (
              <button
                onClick={() => {
                  deferredPrompt.prompt();
                  deferredPrompt.userChoice.then((choiceResult: any) => {
                    if (choiceResult.outcome === 'accepted') {
                      console.log('User accepted the install prompt');
                    } else {
                      console.log('User dismissed the install prompt');
                    }
                    setDeferredPrompt(null);
                  });
                }}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-[#ff4500] to-[#ff8c00] text-white font-black uppercase border-[3px] border-white rounded-full cursor-pointer shadow-[0_0_15px_rgba(255,69,0,0.6)] transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0_25px_rgba(255,69,0,0.9)] hover:from-[#ff5722] hover:to-[#ffb300] active:scale-95 py-3 mt-4 text-[13px]"
                style={{ fontFamily: "'Arial Black', sans-serif" }}
              >
                🎸 Download App
              </button>
            ) : (
              <button
                onClick={() => setShowInstallGuide(true)}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-[#ff4500] to-[#ff8c00] text-white font-black uppercase border-[3px] border-white rounded-full cursor-pointer shadow-[0_0_15px_rgba(255,69,0,0.6)] transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0_25px_rgba(255,69,0,0.9)] hover:from-[#ff5722] hover:to-[#ffb300] active:scale-95 py-3 mt-4 text-[13px]"
                style={{ fontFamily: "'Arial Black', sans-serif" }}
              >
                🎸 Download App
              </button>
            )}
            
            {authState.role === 'class_student' ? (
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider text-rose-600 hover:bg-rose-50 hover:border-rose-400 transition-all border border-transparent mt-4 cursor-pointer"
              >
                <LogOut size={18} />
                Leave Class
              </button>
            ) : (
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider text-rose-600 hover:bg-rose-50 hover:border-rose-400 transition-all border border-transparent mt-4 cursor-pointer"
              >
                <LogOut size={18} />
                Log Out
              </button>
            )}
          </nav>


          {/* Sidebar Footer with direct legal links */}
          <div className="p-4 border-t border-deep-navy/10 text-center space-y-1 bg-sunny-yellow/10 shrink-0">
            <p className="text-[9px] font-black uppercase text-deep-navy tracking-wider">Developed By: Jesse Otobo (11-year-old developer)</p>
            <div className="flex justify-center gap-3 text-[10px] font-bold text-slate-600">
              <button 
                onClick={() => {
                  setIsSidebarOpen(false);
                  handleNavigateToTermsSection('privacy');
                }}
                className="hover:text-emerald-800 underline cursor-pointer"
              >
                Privacy Policy
              </button>
              <span>•</span>
              <button 
                onClick={() => {
                  setIsSidebarOpen(false);
                  handleNavigateToTermsSection('terms');
                }}
                className="hover:text-indigo-800 underline cursor-pointer"
              >
                Terms of Service
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
        <Helmet>
          <title>
            {activeTab === 'home' ? 'Jesse Rock Math | Free Multiplayer Classroom Math Games' : 
             activeTab === 'arena' ? 'Math Arena | Multiplayer Speed Drills | Jesse Rock Math' :
             activeTab === 'sats' ? 'KS2 SATs Practice | Exam Simulator | Jesse Rock Math' :
             activeTab === 'hub' ? 'Learning Hub | Classroom Activities | Jesse Rock Math' :
             activeTab === 'dashboard' ? 'Student Dashboard | Track Progress | Jesse Rock Math' :
             activeTab === 'shop' ? 'Rock Shop | Customize Avatar | Jesse Rock Math' :
             'Jesse Rock Math | Educational Platform'}
          </title>
          <meta name="description" content={
             activeTab === 'home' ? 'Play Jesse Rock Math, a zero-lag free multiplayer math game for kids. Interactive classroom application featuring mental math calculation speed drills.' :
             activeTab === 'arena' ? 'Compete in real-time math speed drills. Our multiplayer arena helps students master calculations instantly.' :
             activeTab === 'sats' ? 'Practice for UK KS2 SATs with our free online exam simulator. Includes arithmetic and reasoning papers.' :
             'Explore Jesse Rock Math, a COPPA-compliant educational platform for primary school math.'
          } />
          <link rel="canonical" href={`https://jesse-math-rockstar-app.vercel.app/${activeTab === 'home' ? '' : activeTab}`} />
        </Helmet>

          {/* Header/Toggle */}
          <header className="p-3 sm:p-4 flex items-center justify-between gap-4 lg:hidden bg-clean-white/40 border-b border-deep-navy/10 backdrop-blur-md">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Toggle navigation menu"
              className="p-4 bg-gradient-to-r from-purple-500 via-slate-500 to-slate-600 hover:from-purple-600 hover:to-slate-700 rounded-2xl text-white shadow-md border-2 border-white/50 transition-all flex items-center gap-2 active:scale-95 min-h-[44px] min-w-[44px]"
            >
              <Menu size={24} />
              <span className="text-xs font-black uppercase tracking-wider">Jesse Math Menu</span>
            </button>
            
            <button
              onClick={() => setShowNotificationsModal(true)}
              aria-label="Open Notifications"
              className="p-3 bg-indigo-600 hover:bg-indigo-700 rounded-2xl text-amber-300 shadow-md border-2 border-white/50 transition-all flex items-center gap-1.5 active:scale-95 min-h-[44px] cursor-pointer"
            >
              <Bell size={20} />
              <span className="text-xs font-black uppercase tracking-wider text-white hidden sm:inline">Alerts</span>
            </button>
            {deferredPrompt ? (
              <button
                onClick={() => {
                  deferredPrompt.prompt();
                  deferredPrompt.userChoice.then((choiceResult: any) => {
                    if (choiceResult.outcome === 'accepted') {
                      console.log('User accepted the install prompt');
                    } else {
                      console.log('User dismissed the install prompt');
                    }
                    setDeferredPrompt(null);
                  });
                }}
                className="flex items-center justify-center gap-2 bg-gradient-to-br from-[#ff4500] to-[#ff8c00] text-white font-black uppercase border-[3px] border-white rounded-full cursor-pointer shadow-[0_0_15px_rgba(255,69,0,0.6)] transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0_25px_rgba(255,69,0,0.9)] hover:from-[#ff5722] hover:to-[#ffb300] active:scale-95 px-4 py-2 min-h-[44px]"
                style={{ fontFamily: "'Arial Black', sans-serif", fontSize: "14px" }}
              >
                <span className="hidden sm:inline">🎸 Download App</span>
                <span className="sm:hidden">🎸 App</span>
              </button>
            ) : (
              <button
                onClick={() => setShowInstallGuide(true)}
                className="flex items-center justify-center gap-2 bg-gradient-to-br from-[#ff4500] to-[#ff8c00] text-white font-black uppercase border-[3px] border-white rounded-full cursor-pointer shadow-[0_0_15px_rgba(255,69,0,0.6)] transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0_25px_rgba(255,69,0,0.9)] hover:from-[#ff5722] hover:to-[#ffb300] active:scale-95 px-4 py-2 min-h-[44px]"
                style={{ fontFamily: "'Arial Black', sans-serif", fontSize: "14px" }}
              >
                <span className="hidden sm:inline">🎸 Download App</span>
                <span className="sm:hidden">🎸 App</span>
              </button>
            )}
          </header>

          <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-8 scrollbar-thin-custom">
            <div className="max-w-6xl mx-auto min-h-full flex flex-col">
              {/* Dynamic Content */}
              <React.Suspense fallback={<div className="h-full flex items-center justify-center text-slate-500"><Loader2 className="animate-spin w-8 h-8" /></div>}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="min-h-full flex flex-col flex-1"
                  >
                  {activeTab === 'home' && (
                    authState.role === 'class_student' ? (
                      <ClassPlayground 
                        currentUser={{
                          uid: authState.userId || '',
                          username: authState.username || '',
                          classCode: authState.classCode || ''
                        }}
                        onSignOut={handleSignOut}
                        onNavigateToTab={(tab: string) => setActiveTab(tab as any)}
                      />
                    ) : (
                      <HomeLanding 
                        userId={authState.userId || userDeviceId || ''} 
                        username={authState.username || 'Guest'} 
                        userRole={authState.role as any} 
                        stats={stats} 
                        onNavigateToTab={setActiveTab} 
                        onNavigateToLesson={(l: any) => { setPracticeLesson(l); setActiveTab('learn'); }} 
                        onNavigateToTermsSection={handleNavigateToTermsSection}
                        onOpenNotifications={() => setShowNotificationsModal(true)}
                      />
                    )
                  )}
                  {activeTab === 'dashboard' && (
                    <Dashboard 
                      stats={stats} 
                      onStartQuiz={() => setActiveTab('quiz')} 
                      isGuest={authState.role === 'guest'} 
                      onConvertProgress={() => { setShowConvertModal(true); }} 
                      onStartDiagnostic={() => setShowDiagnosticModal(true)}
                      onStartSpacedPractice={() => setActiveTab('spaced_practice')}
                      onOpenMistakes={() => setShowMistakeModal(true)}
                      onOpenNotifications={() => setShowNotificationsModal(true)}
                      onOpenSafety={() => setShowSafetyModal(true)}
                    />
                  )}
                  {activeTab === 'spaced_practice' && (
                    <SpacedPracticeView 
                      stats={stats}
                      onUpdateStats={(updated) => setStats(updated)}
                      onExit={() => setActiveTab('dashboard')}
                    />
                  )}
                  {activeTab === 'leaderboard' && (
                    authState.role === 'guest' ? (
                      <div className="max-w-lg mx-auto my-16 p-8 bg-white border-2 border-amber-500/30 rounded-[3rem] shadow-2xl text-center space-y-6">
                        <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center mx-auto text-4xl shadow-inner">
                          🏆
                        </div>
                        <div className="space-y-3">
                          <h3 className="text-2xl font-display font-black text-deep-navy">Leaderboard Ranks Locked in Guest Mode</h3>
                          <p className="text-sm font-medium text-slate-600 leading-relaxed">
                            Hey Rockstar! Sign in or register to unlock global leaderboard rankings, compete against players worldwide, and save your permanent streak & rewards! 🎸
                          </p>
                        </div>
                        <button
                          onClick={() => setShowConvertModal(true)}
                          className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl transition-all cursor-pointer active:scale-95"
                        >
                          Sign In / Register to Unlock 🚀
                        </button>
                      </div>
                    ) : (
                      <React.Suspense fallback={<div className="h-full flex items-center justify-center bg-slate-950 text-white"><Loader2 className="animate-spin text-brand-primary w-12 h-12" /></div>}>
                        <Leaderboard currentUser={{ uid: authState.userId || null, username: authState.username || null, role: authState.role }} currentStreak={stats.streak} stats={stats} />
                      </React.Suspense>
                    )
                  )}
                  {activeTab === 'hub' && <LearningHub onStartLesson={(lesson) => { setPracticeLesson(lesson); setActiveTab('learn'); }} stats={stats} />}
                  {activeTab === 'arena' && (
                    authState.role === 'guest' ? (
                      <div className="max-w-lg mx-auto my-16 p-8 bg-white border-2 border-amber-500/30 rounded-[3rem] shadow-2xl text-center space-y-6">
                        <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center mx-auto text-4xl shadow-inner">
                          ⚔️
                        </div>
                        <div className="space-y-3">
                          <h3 className="text-2xl font-display font-black text-deep-navy">Multiplayer Arena Locked in Guest Mode</h3>
                          <p className="text-sm font-medium text-slate-600 leading-relaxed">
                            Hey Rockstar! Sign in or register to enter live 1v1 multiplayer math duels, challenge real opponents, and claim epic victory badges! 🎸
                          </p>
                        </div>
                        <button
                          onClick={() => setShowConvertModal(true)}
                          className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl transition-all cursor-pointer active:scale-95"
                        >
                          Sign In / Register to Unlock 🚀
                        </button>
                      </div>
                    ) : (
                      <ArenaMatches currentUser={{ uid: authState.userId || userDeviceId || 'guest', username: authState.username || 'Guest', classCode: authState.classCode }} onExit={() => setActiveTab('home')} soundEffectsEnabled={configSettings?.soundEffectsEnabled ?? true} onMatchFinished={handlePlayArenaFinish} />
                    )
                  )}
                  {activeTab === 'quiz' && <Quiz onFinish={handleQuizFinish} difficulty={selectedDifficulty} onExit={() => setActiveTab('home')} isGuest={authState.role === 'guest'} onConvertProgress={() => { setShowConvertModal(true); }} lesson={practiceLesson} />}
                  {activeTab === 'badges' && <BadgesSection stats={stats} username={authState.username || 'Guest'} onClaimWeeklyBadge={handleClaimWeeklyBadge} />}
                  {activeTab === 'rules' && <RulesPage onNavigateToTab={(tab: string) => setActiveTab(tab as any)} />}
                  {activeTab === 'terms' && <TermsPage />}
                  {activeTab === 'developer' && <DeveloperPage currentUser={{ uid: authState.userId || userDeviceId || 'guest', username: authState.username || 'Guest', role: authState.role || 'guest' }} />}
                  {activeTab === 'learn' && <LearnArena onFinish={handleLearnArenaFinish} onExit={() => setActiveTab('hub')} lesson={practiceLesson} />}
                  {activeTab === 'shop' && <RockShop userId={authState.userId || userDeviceId || ''} role={authState.role as any} onNavigateToTab={setActiveTab} />}
                  {activeTab === 'sats' && (
                    <SatsHub 
                      userId={authState.userId || userDeviceId || 'guest'} 
                      studentName={authState.username || 'Rockstar'} 
                      onExitToRockstarMode={() => setActiveTab('home')} 
                    />
                  )}
                  {activeTab === 'arcade' && <FunArcade stats={stats} onExit={() => setActiveTab('home')} />}
                  {activeTab === 'creator' && <CreatorPanel />}
                </motion.div>
              </AnimatePresence>
              </React.Suspense>
            </div>
          </div>
        </main>
      </div>


      <AnimatePresence>
        {isSettingsOpen && (
          <SettingsModal 
            isOpen={isSettingsOpen} 
            onClose={() => setIsSettingsOpen(false)} 
            config={configSettings} 
            setConfig={setConfigSettings}
            username={authState.username || 'Rockstar'}
            userRole={authState.role || 'Student'}
            stats={stats}
            onOpenNotifications={() => {
              setIsSettingsOpen(false);
              setShowNotificationsModal(true);
            }}
          />
        )}
        {showGuestFinishDialog && <GuestFinishDialog isOpen={showGuestFinishDialog} onClose={() => setShowGuestFinishDialog(false)} stats={stats} onConvert={() => { setShowGuestFinishDialog(false); setShowConvertModal(true); }} />}
        {showConvertModal && (
          <React.Suspense fallback={null}>
            <ConvertAccountModal isOpen={showConvertModal} onClose={() => setShowConvertModal(false)} guestStats={stats} userDeviceId={userDeviceId} onConvertSuccess={(uname, uid) => { fetchAndSyncProfile(uname, uid); setActiveTab('dashboard'); setShowConvertModal(false); }}/>
          </React.Suspense>
        )}
        {showAnniversaryDialog && <AnniversaryDialog isOpen={showAnniversaryDialog} onClose={() => setShowAnniversaryDialog(false)} />}
        {showGiftDialog && <GiftDialog isOpen={!!showGiftDialog} onClose={() => setShowGiftDialog(null)} amount={showGiftDialog.amount} />}
        
        {/* Grand Master Celebration Modal */}
        {showGrandMasterCelebration && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-md w-full bg-gradient-to-br from-slate-900 to-slate-950 border-4 border-amber-500 rounded-[2.5rem] p-8 text-center text-white shadow-2xl shadow-yellow-500/20"
            >
              {/* Floating crown */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-20 h-20 bg-gradient-to-tr from-yellow-400 to-amber-600 rounded-3xl border-4 border-amber-300 flex items-center justify-center text-4xl shadow-xl animate-bounce">
                👑
              </div>
              
              <div className="mt-8 space-y-4">
                <span className="text-xs uppercase tracking-[0.25em] font-black text-amber-400">UNBELIEVABLE! 🏆</span>
                <h3 className="text-3xl font-display font-black tracking-tight text-white leading-tight">
                  YOU ARE A <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-amber-400 uppercase">Legendary Math Rockstar!</span>
                </h3>
                
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  Outstanding work! You have reached the elite milestone of solving over **200 math problems** in the Jesse Math Rockstar Arena! 
                  You have unlocked the prestigious **Legendary Tier Badge** permanently shown on your profile.
                </p>

                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Unmatched Achievement</span>
                  <p className="text-sm font-black text-amber-400 flex items-center gap-1">
                    <Star size={14} className="fill-amber-500 text-amber-500" /> 200 Questions Solved Milestone ✓
                  </p>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowGrandMasterCelebration(false);
                      setShowGrandMasterCert(true);
                    }}
                    className="w-full py-3.5 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-slate-950 font-black rounded-xl text-center shadow-lg uppercase tracking-wider text-xs sm:text-sm cursor-pointer transition-all active:scale-95"
                  >
                    View & Print Certificate 📜
                  </button>
                  
                  <button
                    onClick={() => setShowGrandMasterCelebration(false)}
                    className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-center text-xs uppercase tracking-wider cursor-pointer transition-all"
                  >
                    Keep Rocking! 🎸
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Grand Master Certificate Modal */}
        {showGrandMasterCert && (
          <React.Suspense fallback={null}>
            <CertificateModal 
              isOpen={showGrandMasterCert} 
              onClose={() => setShowGrandMasterCert(false)} 
              username={authState.username || 'Guest Scholar'} 
              totalSolved={stats.totalSolved}
              correctAnswers={stats.correctAnswers}
            />
          </React.Suspense>
        )}

        {showInstallGuide && (
          <React.Suspense fallback={null}>
            <InstallGuideModal 
              isOpen={showInstallGuide} 
              onClose={() => setShowInstallGuide(false)} 
            />
          </React.Suspense>
        )}

        {/* Upgrade Modals */}
        {showDiagnosticModal && (
          <React.Suspense fallback={null}>
            <DiagnosticModal 
              isOpen={showDiagnosticModal}
              onClose={() => setShowDiagnosticModal(false)}
              onSaveResult={(res) => {
                setStats(prev => ({
                  ...prev,
                  diagnosticResult: res
                }));
              }}
            />
          </React.Suspense>
        )}

        {showMistakeModal && (
          <React.Suspense fallback={null}>
            <MistakeIntelligenceModal 
              isOpen={showMistakeModal}
              onClose={() => setShowMistakeModal(false)}
              misconceptions={stats.misconceptions || {}}
              onClearMistake={(tag) => {
                setStats(prev => {
                  const updated = { ...(prev.misconceptions || {}) };
                  delete updated[tag];
                  return { ...prev, misconceptions: updated };
                });
              }}
            />
          </React.Suspense>
        )}

        {showNotificationsModal && (
          <React.Suspense fallback={null}>
            <SmartNotificationsModal 
              isOpen={showNotificationsModal}
              onClose={() => setShowNotificationsModal(false)}
              stats={stats}
              onToggleNotifications={(enabled) => {
                setStats(prev => ({ ...prev, notificationsEnabled: enabled }));
              }}
            />
          </React.Suspense>
        )}

        {showSafetyModal && (
          <React.Suspense fallback={null}>
            <ChildSafetyModal 
              isOpen={showSafetyModal}
              onClose={() => setShowSafetyModal(false)}
              currentUsername={authState.username || 'RockstarMathPro'}
              onUpdateUsername={(newName) => {
                setAuthState(prev => ({ ...prev, username: newName }));
              }}
            />
          </React.Suspense>
        )}
        <NotificationToast onOpenHub={() => setShowNotificationsModal(true)} />
      </AnimatePresence>
      
      <div className="fixed inset-0 pointer-events-none z-0" />
    </div>
  );
}

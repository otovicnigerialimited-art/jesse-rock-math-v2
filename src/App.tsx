import React, { useState, useEffect, useTransition } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import SettingsModal from './components/SettingsModal';
import GuestFinishDialog from './components/GuestFinishDialog';
import AnniversaryDialog from './components/AnniversaryDialog';
import GiftDialog from './components/GiftDialog';
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
  Flame
} from 'lucide-react';
import { UserStats, Difficulty, Lesson } from './types';
import { cn } from './lib/utils';
import { calculateLevel } from './lib/badges';
import { getWeeklyData } from './lib/dateUtils';
import { db } from './lib/firebase';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, increment } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './lib/firestoreUtils';

const AuthGate = React.lazy(() => import('./components/AuthGate'));
const ArenaMatches = React.lazy(() => import('./components/ArenaMatches'));
const HomeLanding = React.lazy(() => import('./components/HomeLanding'));
const RulesPage = React.lazy(() => import('./components/RulesPage'));
const TermsPage = React.lazy(() => import('./components/TermsPage'));
const ClassPlayground = React.lazy(() => import('./components/ClassPlayground'));
const DeveloperPage = React.lazy(() => import('./components/DeveloperPage'));
const LearnArena = React.lazy(() => import('./components/LearnArena'));
const SchoolDashboards = React.lazy(() => import('./components/SchoolDashboards'));
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

import AvatarPreview from './components/AvatarPreview';
import { updateSchoolStudentProgress } from './lib/schoolDb';

const INITIAL_STATS: UserStats = {
  totalSolved: 0,
  correctAnswers: 0,
  level: 1,
  xp: 0,
  streak: 0,
  bestStreak: 0,
  history: []
};

export default function App() {
  const [activeTab, setActiveTab ] = useState<'home' | 'dashboard' | 'leaderboard' | 'hub' | 'quiz' | 'badges' | 'rules' | 'terms' | 'seo' | 'developer' | 'learn' | 'shop' | 'creator' | 'arcade'>('home');
  const [isSplashVisible, setIsSplashVisible] = useState(true);
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
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('math_rockstar_stats');
    return saved ? JSON.parse(saved) : INITIAL_STATS;
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNight, setIsNight] = useState(false);
  React.useEffect(() => {
    const hour = new Date().getHours();
    setIsNight(hour >= 18 || hour < 6);
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
    const saved = localStorage.getItem('math_rockstar_config');
    return saved ? JSON.parse(saved) : {
      soundEffects: true,
      rockMusic: true,
      quietMode: false,
      selectedAvatar: '🎸 Math Rockstar',
      customSpeed: 'easy' as Difficulty
    };
  });

  useEffect(() => {
    localStorage.setItem('math_rockstar_config', JSON.stringify(configSettings));
    if (configSettings.quietMode) {
      document.body.classList.add('quiet-mode');
    } else {
      document.body.classList.remove('quiet-mode');
    }
  }, [configSettings]);

  // Interactive Authentication State
  const [authState, setAuthState] = useState<{
    isAuthenticated: boolean;
    isChecking: boolean;
    isCookieBlocked: boolean;
    message: string;
    username: string | null;
    role?: 'student' | 'teacher' | 'admin' | 'individual' | 'guest';
    schoolId?: string | null;
    schoolName?: string | null;
    className?: string | null;
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

  // Show "Claim your account" modal every 5 minutes for guests to prevent them from losing their data
  React.useEffect(() => {
    if (authState.role === 'guest') {
      const interval = setInterval(() => {
        setShowConvertModal(true);
      }, 5 * 60 * 1000); // 5 minutes
      
      return () => clearInterval(interval);
    }
  }, [authState.role]);

  useEffect(() => {
    // Check if the user agent is a common search bot to bypass the splash screen for SEO
    const isBot = typeof navigator !== 'undefined' && /bot|googlebot|crawler|spider|robot|crawling/i.test(navigator.userAgent);
    if (isBot) {
      setIsSplashVisible(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsSplashVisible(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  const fetchAndSyncProfile = async (uname: string, deviceId: string) => {
    const role = localStorage.getItem('jesse_rock_role') as any || 'individual';
    const schoolId = localStorage.getItem('jesse_rock_school_id');
    const schoolName = localStorage.getItem('jesse_rock_school_name');
    const className = localStorage.getItem('jesse_rock_class_name');
    const realName = localStorage.getItem('jesse_rock_real_name');
    const userId = localStorage.getItem('jesse_rock_user_id');

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
      const classCode = localStorage.getItem('jesse_rock_class_code') || '';
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
          const studentDoc = await getDoc(doc(db, 'school_students', userId));
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
          const reqDoc = await getDoc(doc(db, 'class_requests', userId));
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
          streak: profile.streak || 0,
          bestStreak: Math.max(profile.bestStreak || 0, profile.streak || 0),
          completedLessons: profile.completedLessons || [],
          history: profile.history || [],
          unlockedBadges: profile.badges || ["Genius Debut"],
          weeklyProgress: profile.weeklyProgress || undefined
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
    const storedUsername = localStorage.getItem('jesse_rock_my_username');
    let storedDeviceId = localStorage.getItem('jesse_rock_device_id');
    
    if (!storedDeviceId) {
      storedDeviceId = 'user_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
      localStorage.setItem('jesse_rock_device_id', storedDeviceId);
    }
    
    setUserDeviceId(storedDeviceId);

    if (storedUsername) {
      fetchAndSyncProfile(storedUsername, storedDeviceId);
    } else {
      setAuthState({
        isAuthenticated: false,
        isChecking: false,
        isCookieBlocked: false,
        message: "Please register to begin.",
        username: null
      });
    }
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
            const lastSeenGift = localStorage.getItem('jesse_last_seen_gift');
            if (currentGiftId !== lastSeenGift) {
               setShowGiftDialog({ 
                 amount: data.jesse_gift.amount, 
                 isWeeklyWinner: currentGiftId.startsWith('weekly_winner_')
               });
               localStorage.setItem('jesse_last_seen_gift', currentGiftId);
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

    localStorage.removeItem('jesse_rock_my_username');
    localStorage.removeItem('jesse_rock_device_id');
    localStorage.removeItem('jesse_rock_role');
    localStorage.removeItem('jesse_rock_school_id');
    localStorage.removeItem('jesse_rock_school_name');
    localStorage.removeItem('jesse_rock_class_name');
    localStorage.removeItem('jesse_rock_real_name');
    localStorage.removeItem('jesse_rock_user_id');

    // Notify backend to clear the secure session cookie
    try {
      await fetch('/api/logout', { method: 'POST' });
    } catch (logoutErr) {
      console.warn("Could not clear secure HttpOnly session cookie on the server:", logoutErr);
    }

    const freshDeviceId = 'user_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
    localStorage.setItem('jesse_rock_device_id', freshDeviceId);
    setUserDeviceId(freshDeviceId);
    
    setAuthState({
      isAuthenticated: false,
      isChecking: false,
      isCookieBlocked: false,
      message: "Please enter your name to begin.",
      username: null,
      role: 'individual'
    });
  };

  useEffect(() => {
    if (authState.role === 'guest') {
      localStorage.setItem('guest_rockstar_stats', JSON.stringify(stats));
    } else {
      localStorage.setItem('math_rockstar_stats', JSON.stringify(stats));
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

    // Reset inactivity timer on user activity
    const handleActivity = () => {
      lastActiveRef.current = Date.now();
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
    let updatedStats: any = null;
    const formattedDate = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const newHistoryItem = {
      date: formattedDate,
      score: score,
      total: total,
      difficulty: selectedDifficulty,
      arenaType: 'Practice Quiz',
      sections: practiceLesson ? [practiceLesson.title] : ['Math Workout']
    };

    setStats(prev => {
      const newXP = prev.xp + xpGained;
      const currentStreak = score > 0 ? prev.streak + 1 : 0;
      const best = Math.max(prev.bestStreak, currentStreak);
      
      const prevWeekly = prev.weeklyProgress?.weekKey === weekKey 
        ? prev.weeklyProgress 
        : { weekKey, solvedThisWeek: 0, xpThisWeek: 0, claimedWeeklyBadge: false };
      
      const newWeekly = {
        ...prevWeekly,
        solvedThisWeek: (prevWeekly?.solvedThisWeek || 0) + score,
        xpThisWeek: (prevWeekly?.xpThisWeek || 0) + xpGained
      };
      
      const next = {
        ...prev,
        totalSolved: prev.totalSolved + total,
        correctAnswers: prev.correctAnswers + score,
        xp: newXP,
        level: 1,
        streak: currentStreak,
        bestStreak: best,
        weeklyProgress: newWeekly,
        unlockedBadges: prev.unlockedBadges || [],
        history: [...(prev.history || []), newHistoryItem]
      };
      
      // Auto-unlock Grand Master badge if solving 200 or more
      if (next.totalSolved >= 200 && !next.unlockedBadges.includes('grand_master')) {
        next.unlockedBadges = [...next.unlockedBadges, 'grand_master'];
      }

      next.level = calculateLevel(next);
      updatedStats = next;

      // Trigger Grand Master Celebration Modal
      if (prev.totalSolved < 200 && next.totalSolved >= 200) {
        setTimeout(() => setShowGrandMasterCelebration(true), 1200);
      }

      return next;
    });

    if (authState.role === 'guest') {
      setGuestScore({ score, xp: xpGained });
      setShowGuestFinishDialog(true);
      return;
    }

    if (userDeviceId) {
      try {
        const finalBest = Math.max(stats.bestStreak, updatedStats?.streak || 0);
        await setDoc(doc(db, "users", userDeviceId), {
          totalSolved: updatedStats?.totalSolved ?? (stats.totalSolved + total),
          correctAnswers: updatedStats?.correctAnswers ?? (stats.correctAnswers + score),
          xp: updatedStats?.xp ?? (stats.xp + xpGained),
          level: updatedStats?.level ?? 1,
          streak: updatedStats?.streak ?? (score > 0 ? stats.streak + 1 : 0),
          bestStreak: finalBest,
          streakScore: finalBest,
          badges: updatedStats?.unlockedBadges ?? (stats.unlockedBadges || []),
          weeklyProgress: updatedStats?.weeklyProgress ?? null,
          history: updatedStats?.history ?? (stats.history || [])
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
          badges: updatedStats?.unlockedBadges ?? (stats.unlockedBadges || []),
          totalSolved: updatedStats?.totalSolved ?? (stats.totalSolved + total)
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
    let updatedStats: any = null;
    const formattedDate = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const newHistoryItem = {
      date: formattedDate,
      score: score,
      total: total,
      difficulty: difficulty,
      arenaType: 'Learning Arena',
      sections: sections
    };

    setStats(prev => {
      const newXP = prev.xp + xpGained;
      
      const isLessonQuiz = !!practiceLesson;
      const isLessonPassed = isLessonQuiz && score >= 15;
      
      let currentStreak = prev.streak;
      if (isLessonQuiz) {
        if (isLessonPassed) {
          currentStreak += 10;
        }
      } else {
        currentStreak = score > 0 ? prev.streak + 1 : 0;
      }
      
      const best = Math.max(prev.bestStreak, currentStreak);
      
      const prevCompleted = prev.completedLessons || [];
      const completedLessons = (isLessonPassed && !prevCompleted.includes(practiceLesson.id))
        ? [...prevCompleted, practiceLesson.id]
        : prevCompleted;
      
      const prevWeekly = prev.weeklyProgress?.weekKey === weekKey 
        ? prev.weeklyProgress 
        : { weekKey, solvedThisWeek: 0, xpThisWeek: 0, claimedWeeklyBadge: false };
      
      const newWeekly = {
        ...prevWeekly,
        solvedThisWeek: (prevWeekly?.solvedThisWeek || 0) + score,
        xpThisWeek: (prevWeekly?.xpThisWeek || 0) + xpGained
      };
      
      const next = {
        ...prev,
        totalSolved: prev.totalSolved + total,
        correctAnswers: prev.correctAnswers + score,
        xp: newXP,
        level: 1,
        streak: currentStreak,
        bestStreak: best,
        completedLessons,
        weeklyProgress: newWeekly,
        unlockedBadges: prev.unlockedBadges || [],
        history: [...(prev.history || []), {
          ...newHistoryItem,
          lessonId: practiceLesson?.id,
          lessonTitle: practiceLesson?.title,
          passed: isLessonQuiz ? isLessonPassed : undefined
        }]
      };

      // Auto-unlock Grand Master badge if solving 200 or more
      if (next.totalSolved >= 200 && !next.unlockedBadges.includes('grand_master')) {
        next.unlockedBadges = [...next.unlockedBadges, 'grand_master'];
      }

      next.level = calculateLevel(next);
      updatedStats = next;

      // Trigger Grand Master Celebration Modal
      if (prev.totalSolved < 200 && next.totalSolved >= 200) {
        setTimeout(() => setShowGrandMasterCelebration(true), 1200);
      }

      return next;
    });

    if (authState.role === 'guest') {
      return;
    }

    if (userDeviceId) {
      try {
        const finalBest = Math.max(stats.bestStreak, updatedStats?.streak || 0);
        await setDoc(doc(db, "users", userDeviceId), {
          totalSolved: updatedStats?.totalSolved ?? (stats.totalSolved + total),
          correctAnswers: updatedStats?.correctAnswers ?? (stats.correctAnswers + score),
          xp: updatedStats?.xp ?? (stats.xp + xpGained),
          level: updatedStats?.level ?? 1,
          streak: updatedStats?.streak ?? stats.streak,
          bestStreak: finalBest,
          streakScore: finalBest,
          completedLessons: updatedStats?.completedLessons ?? (stats.completedLessons || []),
          badges: updatedStats?.unlockedBadges ?? (stats.unlockedBadges || []),
          weeklyProgress: updatedStats?.weeklyProgress ?? null,
          history: updatedStats?.history ?? (stats.history || [])
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
          badges: updatedStats?.unlockedBadges ?? (stats.unlockedBadges || []),
          totalSolved: updatedStats?.totalSolved ?? (stats.totalSolved + total)
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
    let updatedStats: any = null;
    const formattedDate = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const newHistoryItem = {
      date: formattedDate,
      score: score,
      total: total,
      difficulty: 'hard' as Difficulty,
      arenaType: 'Play Arena',
      sections: ['Addition', 'Subtraction', 'Multiplication']
    };

    setStats(prev => {
      const newXP = prev.xp + xpGained;
      const currentStreak = score > 0 ? prev.streak + 1 : 0;
      const best = Math.max(prev.bestStreak, currentStreak);
      
      const prevWeekly = prev.weeklyProgress?.weekKey === weekKey 
        ? prev.weeklyProgress 
        : { weekKey, solvedThisWeek: 0, xpThisWeek: 0, claimedWeeklyBadge: false };
      
      const newWeekly = {
        ...prevWeekly,
        solvedThisWeek: (prevWeekly?.solvedThisWeek || 0) + score,
        xpThisWeek: (prevWeekly?.xpThisWeek || 0) + xpGained
      };
      
      const next = {
        ...prev,
        totalSolved: prev.totalSolved + total,
        correctAnswers: prev.correctAnswers + score,
        xp: newXP,
        level: 1,
        streak: currentStreak,
        bestStreak: best,
        weeklyProgress: newWeekly,
        unlockedBadges: prev.unlockedBadges || [],
        history: [...(prev.history || []), newHistoryItem]
      };

      // Auto-unlock Grand Master badge if solving 200 or more
      if (next.totalSolved >= 200 && !next.unlockedBadges.includes('grand_master')) {
        next.unlockedBadges = [...next.unlockedBadges, 'grand_master'];
      }

      next.level = calculateLevel(next);
      updatedStats = next;

      // Trigger Grand Master Celebration Modal
      if (prev.totalSolved < 200 && next.totalSolved >= 200) {
        setTimeout(() => setShowGrandMasterCelebration(true), 1200);
      }

      return next;
    });

    if (authState.role === 'guest') {
      return;
    }

    if (userDeviceId) {
      try {
        const finalBest = Math.max(stats.bestStreak, updatedStats?.streak || 0);
        await setDoc(doc(db, "users", userDeviceId), {
          totalSolved: updatedStats?.totalSolved ?? (stats.totalSolved + total),
          correctAnswers: updatedStats?.correctAnswers ?? (stats.correctAnswers + score),
          xp: updatedStats?.xp ?? (stats.xp + xpGained),
          level: updatedStats?.level ?? 1,
          streak: updatedStats?.streak ?? (score > 0 ? stats.streak + 1 : 0),
          bestStreak: finalBest,
          streakScore: finalBest,
          badges: updatedStats?.unlockedBadges ?? (stats.unlockedBadges || []),
          weeklyProgress: updatedStats?.weeklyProgress ?? null,
          history: updatedStats?.history ?? (stats.history || [])
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
          badges: updatedStats?.unlockedBadges ?? (stats.unlockedBadges || []),
          totalSolved: updatedStats?.totalSolved ?? (stats.totalSolved + total)
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

  if (isSplashVisible) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin text-brand-primary w-12 h-12 mx-auto" strokeWidth={3} />
          <p className="text-sm font-black tracking-wider text-slate-400">CONNECTING TO JESSE ROCK MATH ARENA...</p>
        </div>
      </div>
    );
  }

  if (authState.isChecking) {
    return null;
  }

  if (!authState.isAuthenticated) {
    return (
      <React.Suspense fallback={
        <div className="h-screen w-screen flex items-center justify-center bg-slate-950 text-white">
          <div className="text-center space-y-4">
            <Loader2 className="animate-spin text-brand-primary w-12 h-12 mx-auto" strokeWidth={3} />
            <p className="text-sm font-black tracking-wider text-slate-400">LOADING ARENA...</p>
          </div>
        </div>
      }>
        <AuthGate 
          onAuthSuccess={(uname, matchedUid) => {
            setUserDeviceId(matchedUid);
            fetchAndSyncProfile(uname, matchedUid);
          }}
          onGuestPlay={() => {
            const savedGuest = localStorage.getItem('guest_rockstar_stats');
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
      </React.Suspense>
    );
  }

  if (authState.role === 'teacher' || authState.role === 'admin') {
    return (
      <React.Suspense fallback={
        <div className="h-full flex items-center justify-center bg-slate-950 text-white">
          <Loader2 className="animate-spin text-brand-primary w-12 h-12" />
        </div>
      }>
        <SchoolDashboards 
          authState={authState} 
          onSignOut={handleSignOut} 
        />
      </React.Suspense>
    );
  }

  const navItems = authState.role === 'class_student'
    ? [
        { id: 'home', label: 'Classroom Playground', icon: Home },
        { id: 'quiz', label: 'Play Quiz Battle 🏆', icon: Trophy },
        { id: 'terms', label: 'Terms & Policies', icon: FileText }
      ]
    : [
        { id: 'home', label: 'Welcome Home', icon: Home },
        { id: 'dashboard', label: 'My Progress Stats', icon: Award },
        { id: 'leaderboard', label: '🏆 Global Leaderboard', icon: Trophy },
        { id: 'shop', label: '🔥 Rock Shop', icon: ShoppingBag },
        { id: 'arcade', label: 'Fun Arcade 🕹️', icon: Gamepad2 },
        { id: 'hub', label: 'Learning Hub', icon: BookOpen },
        { id: 'quiz', label: 'Play Arena', icon: Trophy },
        { id: 'learn', label: 'Learn Arena', icon: BookOpen },
        { id: 'arena', label: 'Multiplayer Arena', icon: Globe },
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
        {activeTab !== 'quiz' && <div className={`landscape-overlay ${isNight ? 'landscape-night' : ''}`} />}
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
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(0,230,118,0.5)] border border-pastel-green/50 shrink-0">
                <img src="/jesse_rock_logo.jpg" alt="Jesse Rock Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <h1 className="text-lg font-display font-black tracking-tight leading-tight text-deep-navy">JESSE ROCK<br />
                <span className="text-action-orange text-xs uppercase font-extrabold">MATH ARENA 👑</span>
              </h1>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-deep-navy hover:text-action-orange"><X size={20}/></button>
          </div>
          
          <nav className="flex-1 overflow-y-auto space-y-1.5 p-4 scrollbar-thin-custom">
            {navItems.map((item, idx) => (
              <button
                key={`${item.id}-${idx}`}
                onClick={() => {
                  setIsSidebarOpen(false);
                  setActiveTab(item.id as any);
                }}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-xs font-bold transition-all border border-transparent",
                  activeTab === item.id 
                    ? "bg-deep-navy text-clean-white border-deep-navy shadow-md scale-[1.02]" 
                    : "text-deep-navy hover:bg-sky-blue/40 hover:border-deep-navy/20"
                )}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
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
          {/* Header/Toggle */}
          <header className="p-3 sm:p-4 flex items-center gap-4 lg:hidden bg-clean-white/40 border-b border-deep-navy/10 backdrop-blur-md">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-3 bg-gradient-to-r from-purple-500 via-slate-500 to-slate-600 hover:from-purple-600 hover:to-slate-700 rounded-2xl text-white shadow-md border-2 border-white/50 transition-all flex items-center gap-2 active:scale-95"
            >
              <Menu size={20} />
              <span className="text-xs font-black uppercase tracking-wider">Jesse Math Menu</span>
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-8 scrollbar-thin-custom">
            <div className="max-w-6xl mx-auto min-h-full flex flex-col">
              {/* Dynamic Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
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
                        onNavigateToTab={setActiveTab}
                      />
                    ) : (
                      <HomeLanding username={authState.username || 'Guest'} stats={stats} onNavigateToTab={setActiveTab} onNavigateToLesson={(l: any) => { setPracticeLesson(l); setActiveTab('learn'); }} onNavigateToTermsSection={handleNavigateToTermsSection} />
                    )
                  )}
                  {activeTab === 'dashboard' && <Dashboard stats={stats} onStartQuiz={() => setActiveTab('quiz')} isGuest={authState.role === 'guest'} onConvertProgress={() => { setShowConvertModal(true); }} />}
                  {activeTab === 'leaderboard' && (
                    <React.Suspense fallback={<div className="h-full flex items-center justify-center bg-slate-950 text-white"><Loader2 className="animate-spin text-brand-primary w-12 h-12" /></div>}>
                      <Leaderboard currentUser={{ uid: authState.userId || null, username: authState.username || null, role: authState.role }} currentStreak={stats.streak} stats={stats} />
                    </React.Suspense>
                  )}
                  {activeTab === 'hub' && <LearningHub onStartLesson={(lesson) => { setPracticeLesson(lesson); setActiveTab('learn'); }} stats={stats} />}
                  {activeTab === 'arena' && <ArenaMatches currentUser={{ uid: authState.userId || userDeviceId || 'guest', username: authState.username || 'Guest', classCode: authState.classCode }} onExit={() => setActiveTab('home')} soundEffectsEnabled={configSettings?.soundEffectsEnabled ?? true} onMatchFinished={handlePlayArenaFinish} />}
                  {activeTab === 'quiz' && <Quiz onFinish={handleQuizFinish} difficulty={selectedDifficulty} onExit={() => setActiveTab('home')} isGuest={authState.role === 'guest'} onConvertProgress={() => { setShowConvertModal(true); }} lesson={practiceLesson} />}
                  {activeTab === 'badges' && <BadgesSection stats={stats} username={authState.username || 'Guest'} onClaimWeeklyBadge={handleClaimWeeklyBadge} />}
                  {activeTab === 'rules' && <RulesPage />}
                  {activeTab === 'terms' && <TermsPage />}
                  {activeTab === 'developer' && <DeveloperPage currentUser={{ uid: authState.userId || userDeviceId || 'guest', username: authState.username || 'Guest', role: authState.role || 'guest' }} />}
                  {activeTab === 'learn' && <LearnArena onFinish={handleLearnArenaFinish} onExit={() => setActiveTab('hub')} lesson={practiceLesson} />}
                  {activeTab === 'shop' && <RockShop userId={authState.userId || userDeviceId || ''} role={authState.role as any} onNavigateToTab={setActiveTab} />}
                  {activeTab === 'arcade' && <FunArcade stats={stats} onExit={() => setActiveTab('home')} />}
                  {activeTab === 'creator' && <CreatorPanel />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>


      <AnimatePresence>
        {isSettingsOpen && <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} config={configSettings} setConfig={setConfigSettings} />}
        {showGuestFinishDialog && <GuestFinishDialog isOpen={showGuestFinishDialog} onClose={() => setShowGuestFinishDialog(false)} stats={stats} onConvert={() => { setShowGuestFinishDialog(false); setShowConvertModal(true); }} />}
        {showConvertModal && <ConvertAccountModal isOpen={showConvertModal} onClose={() => setShowConvertModal(false)} guestStats={stats} userDeviceId={userDeviceId} onConvertSuccess={(uname, uid) => { fetchAndSyncProfile(uname, uid); setActiveTab('dashboard'); setShowConvertModal(false); }}/>}
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
                  Outstanding work! You have reached the elite milestone of solving over **200 math problems** in the Jesse Rock Math Arena! 
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
          <CertificateModal 
            isOpen={showGrandMasterCert} 
            onClose={() => setShowGrandMasterCert(false)} 
            username={authState.username || 'Guest Scholar'} 
            totalSolved={stats.totalSolved}
            correctAnswers={stats.correctAnswers}
          />
        )}
      </AnimatePresence>
      
      <div className="fixed inset-0 pointer-events-none z-0" />
    </div>
  );
}

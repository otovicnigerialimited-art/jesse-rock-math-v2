import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, User, Lock, ArrowRight, Sparkles, Loader2, Flame } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserStats } from '../types';
import confetti from 'canvas-confetti';

interface ConvertAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  guestStats: UserStats;
  userDeviceId: string | null;
  onConvertSuccess: (username: string, uid: string) => void;
}

export default function ConvertAccountModal({
  isOpen,
  onClose,
  guestStats,
  userDeviceId,
  onConvertSuccess
}: ConvertAccountModalProps) {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const cleanUsername = usernameInput.trim();
    const cleanPassword = passwordInput.trim();

    if (!cleanUsername) {
      setError("Please enter a cool Rockstar Username!");
      return;
    }
    if (cleanUsername.length < 3) {
      setError("Your username must be at least 3 characters long!");
      return;
    }
    if (cleanUsername.length > 20) {
      setError("Your username cannot exceed 20 characters!");
      return;
    }
    if (!/^[a-zA-Z0-9_\s]+$/.test(cleanUsername)) {
      setError("Usernames can only contain letters, numbers, spaces, and underscores!");
      return;
    }
    if (cleanPassword.length < 4) {
      setError("Your secure password must be at least 4 characters long!");
      return;
    }

    setLoading(true);

    try {
      // 1. Resolve UID
      const uid = userDeviceId || `user_${Math.random().toString(36).substring(2, 11)}_${Date.now().toString(36)}`;

      // 2. Check if username is taken in Firestore
      const nameDocRef = doc(db, "usernames", cleanUsername.toLowerCase());
      const nameSnap = await getDoc(nameDocRef);

      if (nameSnap.exists()) {
        setError("This legendary username is already taken! Please try a different one.");
        setLoading(false);
        return;
      }

      // 3. Reserve username
      await setDoc(nameDocRef, {
        uid: uid,
        username: cleanUsername,
        password: cleanPassword,
        createdAt: Date.now()
      });

      // 4. Create user profile using existing guest stats
      const userProfileRef = doc(db, "users", uid);
      await setDoc(userProfileRef, {
        uid: uid,
        username: cleanUsername,
        xp: guestStats.xp || 100,
        streak: guestStats.streak || 0,
        bestStreak: Math.max(guestStats.bestStreak || 0, guestStats.streak || 0),
        streakScore: Math.max(guestStats.bestStreak || 0, guestStats.streak || 0),
        level: guestStats.level || 1,
        totalSolved: guestStats.totalSolved || 0,
        correctAnswers: guestStats.correctAnswers || 0,
        coins: guestStats.streak || 10,
        badges: guestStats.unlockedBadges || ["Genius Debut"],
        history: guestStats.history || [],
        completedLessons: guestStats.completedLessons || [],
        createdAt: Date.now()
      });

      // 5. Trigger celebration confetti
      confetti({
        particleCount: 180,
        spread: 100,
        origin: { y: 0.4 },
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6']
      });

      // 6. Success message & call parent
      setSuccess(`Success! Your account "${cleanUsername}" is registered and progress is saved.`);
      
      // Clean up guest local storage stats
      localStorage.removeItem('guest_rockstar_stats');

      // Update login cookies/keys
      localStorage.setItem('jesse_rock_role', 'individual');
      localStorage.setItem('jesse_rock_device_id', uid);
      localStorage.setItem(`jesse_rock_uid_${cleanUsername.toLowerCase()}`, uid);
      localStorage.setItem('jesse_rock_my_username', cleanUsername);
      localStorage.setItem('jesse_rock_user_id', uid);

      setTimeout(() => {
        onConvertSuccess(cleanUsername, uid);
        onClose();
      }, 1500);

    } catch (err: any) {
      console.error("Error during guest progress conversion:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={loading ? undefined : onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        className="relative w-full max-w-md bg-[#FFFDE7] border border-amber-900/30 border-4 rounded-3xl p-8 shadow-[0_0_50px_rgba(251,191,36,0.3)] space-y-6 z-10"
      >
        {/* Close Button */}
        {!loading && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 bg-amber-900/5 hover:bg-amber-900/10 rounded-xl text-[#3A2A18] hover:text-[#2A1D0F] transition-all cursor-pointer"
            title="Close"
          >
            <X size={18} />
          </button>
        )}

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-gradient-to-r from-amber-400 to-amber-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30">
            <Sparkles size={26} className="text-white animate-pulse" />
          </div>
          <h2 className="text-2xl font-display font-black text-[#2A1D0F] uppercase tracking-tight">
            Claim Your Account 👑
          </h2>
          <p className="text-[#3A2A18] text-xs font-semibold leading-relaxed px-4">
            Claim your account so you don't lose your progress! Save your guest stats permanently, secure your official rank, and play safely from any device.
          </p>
        </div>

        {/* Current Guest Stats Preview */}
        <div className="p-4 bg-amber-900/5 rounded-2xl border border-amber-900/20 border-4 grid grid-cols-3 gap-2 text-center">
          <div>
            <span className="text-[10px] text-amber-900 uppercase font-bold block">Current Streak</span>
            <span className="text-lg font-mono font-black text-orange-500 flex items-center justify-center gap-1">
              <Flame size={14} className="fill-orange-500 animate-pulse inline" />
              {guestStats.streak}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-amber-900 uppercase font-bold block">XP Accumulated</span>
            <span className="text-lg font-mono font-black text-violet-600">{guestStats.xp}</span>
          </div>
          <div>
            <span className="text-[10px] text-amber-900 uppercase font-bold block">Level reached</span>
            <span className="text-lg font-mono font-black text-emerald-600">{guestStats.level}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleConvert} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-[#2A1D0F] uppercase tracking-wider block">Choose Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-amber-900/50">
                <User size={16} />
              </span>
              <input
                type="text"
                placeholder="e.g. RockstarGamer"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                disabled={loading || success !== null}
                className="w-full pl-11 pr-4 py-3 bg-white border border-amber-900/20 border-4 rounded-2xl text-sm font-bold text-[#2A1D0F] placeholder:text-amber-900/40 focus:outline-none focus:border-amber-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-[#2A1D0F] uppercase tracking-wider block">Set Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-amber-900/50">
                <Lock size={16} />
              </span>
              <input
                type="password"
                placeholder="Min 4 characters"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                disabled={loading || success !== null}
                className="w-full pl-11 pr-4 py-3 bg-white border border-amber-900/20 border-4 rounded-2xl text-sm font-bold text-[#2A1D0F] placeholder:text-amber-900/40 focus:outline-none focus:border-amber-500 transition-all"
              />
            </div>
          </div>

          {/* Feedback Messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-rose-500/15 border border-rose-500/20 text-rose-600 text-xs font-bold rounded-2xl text-center"
            >
              ⚠️ {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-emerald-500/15 border border-emerald-500/20 text-emerald-600 text-xs font-bold rounded-2xl text-center"
            >
              🎉 {success}
            </motion.div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || success !== null}
            className="w-full py-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:from-slate-200 disabled:to-slate-300 disabled:text-slate-400 text-[#2A1D0F] rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-amber-500/25 cursor-pointer disabled:cursor-not-allowed border-b-4 border-amber-600 active:border-b-0 active:translate-y-1 disabled:border-b-0 disabled:translate-y-0"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin text-[#2A1D0F]" />
                Reserving username...
              </>
            ) : success ? (
              "Account Created! 🚀"
            ) : (
              <>
                CLAIM PERMANENT ACCOUNT <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <p className="text-[10px] text-[#3A2A18] text-center leading-normal font-semibold opacity-75">
          🛡️ Safe, direct password registration. No third-party search indexes or trackers. Developed By: Jesse Otobo (11-year-old developer).
        </p>
      </motion.div>
    </div>
  );
}

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
        className="relative w-full max-w-md bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-2xl space-y-8 z-10 overflow-hidden"
      >
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50 pointer-events-none" />
        
        {/* Close Button */}
        {!loading && (
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all cursor-pointer z-20"
            title="Close"
          >
            <X size={18} />
          </button>
        )}

        {/* Header */}
        <div className="text-center space-y-3 relative z-10">
          <div className="w-16 h-16 bg-cyan-50 border border-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
            <Sparkles size={28} className="text-cyan-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Claim Your Account
          </h2>
          <p className="text-slate-500 text-sm font-medium leading-relaxed px-2">
            Secure your official Rockstar identity and save your progress permanently to the global cloud.
          </p>
        </div>

        {/* Current Guest Stats Preview */}
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-3 gap-4 text-center relative z-10">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block">Streak</span>
            <span className="text-xl font-bold text-slate-900 flex items-center justify-center gap-1.5">
              <Flame size={16} className="text-orange-500 fill-orange-500" />
              {guestStats.streak}
            </span>
          </div>
          <div className="space-y-1 border-x border-slate-200">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block">XP</span>
            <span className="text-xl font-bold text-slate-900">{guestStats.xp}</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block">Level</span>
            <span className="text-xl font-bold text-slate-900">{guestStats.level}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleConvert} className="space-y-5 relative z-10">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block ml-1">Identity Username</label>
            <div className="relative group">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
              <input
                type="text"
                placeholder="MathChampion"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                disabled={loading || success !== null}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-cyan-600 focus:ring-4 focus:ring-cyan-50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block ml-1">Secure Passkey</label>
            <div className="relative group">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
              <input
                type="password"
                placeholder="••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                disabled={loading || success !== null}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-cyan-600 focus:ring-4 focus:ring-cyan-50 transition-all"
              />
            </div>
          </div>

          {/* Feedback Messages */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-2xl text-center"
              >
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold rounded-2xl text-center"
              >
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || success !== null}
            className="w-full py-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-2xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl shadow-slate-900/10 cursor-pointer disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Processing...
              </>
            ) : success ? (
              "Identity Secured"
            ) : (
              <>
                Confirm Identity <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <p className="text-[10px] text-slate-400 text-center leading-relaxed font-medium relative z-10">
          Your progress will be merged with your new permanent account.<br/>
          Secure cloud synchronization enabled.
        </p>
      </motion.div>
    </div>
  );
}

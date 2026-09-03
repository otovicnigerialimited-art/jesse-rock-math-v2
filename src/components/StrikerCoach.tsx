import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Music, Zap, Flame, Award } from 'lucide-react';

const ENCOURAGING_MESSAGES = [
  "You're shredding this math! ⚽⚡",
  "Lightning fast equations! Keep rocking!",
  "Absolute football legend in action! 🔥",
  "Finger-tapping speed on those numbers!",
  "Keep that rhythm going! You got this!",
  "Groovy math calculation! 🌟",
  "Epic streak! Let's hit the high notes!",
  "Math is your guitar solo—make it scream!"
];

export default function StrikerCoach({ isPlaying, isLargeSidePanel }: { isPlaying: boolean; isLargeSidePanel?: boolean }) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % ENCOURAGING_MESSAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  if (!isPlaying) return null;

  if (isLargeSidePanel) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-amber-500/15 via-violet-600/10 to-indigo-600/15 rounded-[2.5rem] border-2 border-amber-500/30 shadow-2xl relative overflow-hidden select-none">
        {/* Background ambient glow */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-violet-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Header Badge */}
        <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full mb-4">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Striker Coach & Hype Master</span>
        </div>

        {/* Large 3D Chubby Striker Mascot Avatar */}
        <motion.div
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, 3, -3, 0]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 2.2, 
            ease: "easeInOut" 
          }}
          className="relative w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center filter drop-shadow-2xl cursor-pointer group my-2"
          onClick={() => setMsgIndex((prev) => (prev + 1) % ENCOURAGING_MESSAGES.length)}
          title="Click for instant hype boost!"
        >
          {/* Glow halo */}
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/40 to-violet-500/40 rounded-full blur-2xl group-hover:scale-110 transition-transform" />

          {/* SVG Chubby Striker Character */}
          <svg viewBox="0 0 120 120" className="w-full h-full relative z-10">
            {/* Headphones band */}
            <path d="M 35 45 Q 60 15 85 45" fill="none" stroke="#6366f1" strokeWidth="6" strokeLinecap="round" />
            <circle cx="33" cy="50" r="8" fill="#4f46e5" />
            <circle cx="87" cy="50" r="8" fill="#4f46e5" />

            {/* Spiky Striker Hair */}
            <path d="M 40 38 L 45 22 L 55 35 L 60 18 L 68 34 L 78 22 L 82 38 Z" fill="#f59e0b" stroke="#d97706" strokeWidth="2" strokeLinejoin="round" />

            {/* Chubby Head / Face */}
            <circle cx="60" cy="55" r="22" fill="#fed7aa" stroke="#fb923c" strokeWidth="2.5" />

            {/* Sunglasses */}
            <rect x="44" y="47" width="14" height="10" rx="3" fill="#1e1b4b" />
            <rect x="62" y="47" width="14" height="10" rx="3" fill="#1e1b4b" />
            <line x1="58" y1="51" x2="62" y2="51" stroke="#1e1b4b" strokeWidth="3" />
            <path d="M 48 50 L 52 53 M 66 50 L 70 53" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />

            {/* Cheerful Striker Smile */}
            <path d="M 53 64 Q 60 70 67 64" fill="none" stroke="#c2410c" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="43" cy="60" r="3.5" fill="#f87171" opacity="0.6" />
            <circle cx="77" cy="60" r="3.5" fill="#f87171" opacity="0.6" />

            {/* Chubby Body / Jacket */}
            <path d="M 38 78 Q 30 100 42 110 L 78 110 Q 90 100 82 78 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="2.5" />
            {/* Jacket lapels / T-shirt */}
            <path d="M 52 78 L 60 92 L 68 78 Z" fill="#ffffff" />
            <path d="M 60 92 L 60 110" stroke="#b91c1c" strokeWidth="2" />

            {/* football boot across front */}
            <g transform="rotate(25 60 85)">
              <rect x="42" y="70" width="36" height="22" rx="6" fill="#8b5cf6" stroke="#6d28d9" strokeWidth="2" />
              <circle cx="60" cy="81" r="5" fill="#1e1b4b" />
              <rect x="58" y="45" width="4" height="30" fill="#cbd5e1" />
              <rect x="55" y="40" width="10" height="7" rx="2" fill="#334155" />
            </g>
          </svg>

          {/* Floating Musical Notes */}
          <motion.div
            animate={{ y: [-15, -30], x: [0, 15], opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeOut" }}
            className="absolute top-0 right-4 text-amber-500 font-black text-sm pointer-events-none"
          >
            ♫
          </motion.div>
          <motion.div
            animate={{ y: [-10, -28], x: [0, -15], opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 2.0, delay: 0.6, ease: "easeOut" }}
            className="absolute top-2 left-6 text-violet-500 font-black text-sm pointer-events-none"
          >
            ⚡
          </motion.div>
        </motion.div>

        {/* Large Speech Bubble */}
        <AnimatePresence mode="wait">
          <motion.div
            key={msgIndex}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="w-full bg-white/95 backdrop-blur-md border-2 border-amber-500/30 shadow-xl rounded-2xl p-4 text-center mt-3 relative"
          >
            <p className="text-sm font-black text-slate-800 leading-snug">
              "{ENCOURAGING_MESSAGES[msgIndex]}"
            </p>
          </motion.div>
        </AnimatePresence>

        <p className="text-[10px] text-slate-500 font-mono mt-3">
          Click mascot for instant coaching tips!
        </p>
      </div>
    );
  }

  // Fallback (unused now since we use side panel)
  return null;
}

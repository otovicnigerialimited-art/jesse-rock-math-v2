import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Music, Zap, Flame } from 'lucide-react';

const ENCOURAGING_MESSAGES = [
  "You're shredding this math! 🎸⚡",
  "Lightning fast equations! Keep rocking!",
  "Absolute rock legend in action! 🔥",
  "Finger-tapping speed on those numbers!",
  "Keep that rhythm going! You got this!",
  "Groovy math calculation! 🌟",
  "Epic streak! Let's hit the high notes!",
  "Math is your guitar solo—make it scream!"
];

export default function RockstarCoach({ isPlaying }: { isPlaying: boolean }) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % ENCOURAGING_MESSAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  if (!isPlaying) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-end gap-3 pointer-events-none select-none">
      {/* Speech Bubble */}
      <AnimatePresence mode="wait">
        <motion.div
          key={msgIndex}
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="bg-white/95 backdrop-blur-md border border-amber-500/30 shadow-2xl rounded-2xl p-4 max-w-[220px] pointer-events-auto relative mb-4"
        >
          <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-r border-b border-amber-500/35 transform rotate-45" />
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span className="text-[9px] font-black uppercase tracking-wider text-amber-600">Rockstar Coach</span>
          </div>
          <p className="text-xs font-black text-slate-800 leading-snug">
            {ENCOURAGING_MESSAGES[msgIndex]}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Chubby 3D Rockstar Mascot Avatar */}
      <motion.div
        animate={{ 
          y: [0, -8, 0],
          rotate: [0, 2, -2, 0]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 2.5, 
          ease: "easeInOut" 
        }}
        className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center filter drop-shadow-2xl pointer-events-auto group cursor-pointer"
        onClick={() => setMsgIndex((prev) => (prev + 1) % ENCOURAGING_MESSAGES.length)}
        title="Click me for instant hype!"
      >
        {/* Glow halo */}
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/30 to-violet-500/30 rounded-full blur-xl group-hover:scale-125 transition-transform" />

        {/* SVG Chubby Rockstar Character */}
        <svg viewBox="0 0 120 120" className="w-full h-full relative z-10">
          {/* Headphones band */}
          <path d="M 35 45 Q 60 15 85 45" fill="none" stroke="#6366f1" strokeWidth="6" strokeLinecap="round" />
          <circle cx="33" cy="50" r="8" fill="#4f46e5" />
          <circle cx="87" cy="50" r="8" fill="#4f46e5" />

          {/* Spiky Rockstar Hair */}
          <path d="M 40 38 L 45 22 L 55 35 L 60 18 L 68 34 L 78 22 L 82 38 Z" fill="#f59e0b" stroke="#d97706" strokeWidth="2" strokeLinejoin="round" />

          {/* Chubby Head / Face */}
          <circle cx="60" cy="55" r="22" fill="#fed7aa" stroke="#fb923c" strokeWidth="2.5" />

          {/* Sunglasses */}
          <rect x="44" y="47" width="14" height="10" rx="3" fill="#1e1b4b" />
          <rect x="62" y="47" width="14" height="10" rx="3" fill="#1e1b4b" />
          <line x1="58" y1="51" x2="62" y2="51" stroke="#1e1b4b" strokeWidth="3" />
          <path d="M 48 50 L 52 53 M 66 50 L 70 53" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />

          {/* Cheerful Rockstar Smile */}
          <path d="M 53 64 Q 60 70 67 64" fill="none" stroke="#c2410c" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="43" cy="60" r="3.5" fill="#f87171" opacity="0.6" />
          <circle cx="77" cy="60" r="3.5" fill="#f87171" opacity="0.6" />

          {/* Chubby Body / Jacket */}
          <path d="M 38 78 Q 30 100 42 110 L 78 110 Q 90 100 82 78 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="2.5" />
          {/* Jacket lapels / T-shirt */}
          <path d="M 52 78 L 60 92 L 68 78 Z" fill="#ffffff" />
          <path d="M 60 92 L 60 110" stroke="#b91c1c" strokeWidth="2" />

          {/* Electric Guitar across front */}
          <g transform="rotate(25 60 85)">
            <rect x="42" y="70" width="36" height="22" rx="6" fill="#8b5cf6" stroke="#6d28d9" strokeWidth="2" />
            <circle cx="60" cy="81" r="5" fill="#1e1b4b" />
            <rect x="58" y="45" width="4" height="30" fill="#cbd5e1" />
            <rect x="55" y="40" width="10" height="7" rx="2" fill="#334155" />
          </g>
        </svg>

        {/* Floating Musical Notes */}
        <motion.div
          animate={{ y: [-15, -30], x: [0, 10], opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeOut" }}
          className="absolute -top-3 right-2 text-amber-400 font-black text-xs pointer-events-none"
        >
          ♫
        </motion.div>
        <motion.div
          animate={{ y: [-10, -25], x: [0, -12], opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, delay: 0.8, ease: "easeOut" }}
          className="absolute -top-5 left-4 text-violet-400 font-black text-xs pointer-events-none"
        >
          ⚡
        </motion.div>
      </motion.div>
    </div>
  );
}

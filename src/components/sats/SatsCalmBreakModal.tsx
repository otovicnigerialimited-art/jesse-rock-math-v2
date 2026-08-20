import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, Check, ArrowRight, Sun, Coffee } from 'lucide-react';

interface SatsCalmBreakModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SatsCalmBreakModal({ isOpen, onClose }: SatsCalmBreakModalProps) {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [timer, setTimer] = useState(4);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev > 1) return prev - 1;

        // Transition breathing phase
        setPhase((currentPhase) => {
          if (currentPhase === 'inhale') return 'hold';
          if (currentPhase === 'hold') return 'exhale';
          // exhale finished -> next cycle
          setCyclesCompleted((c) => c + 1);
          return 'inhale';
        });

        return 4; // 4 second box
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-lg">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-lg bg-gradient-to-b from-indigo-900/90 via-slate-900/95 to-slate-950 text-white rounded-3xl p-8 border-4 border-indigo-400/40 shadow-2xl relative overflow-hidden text-center"
        >
          {/* Subtle Ambient Light */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-xs font-bold text-indigo-200 uppercase tracking-widest mb-6">
            <Heart size={14} className="text-pink-400 animate-pulse" /> Rockstar Calm Sanctuary
          </div>

          <h2 className="text-3xl font-display font-black text-white mb-2">
            Take a breath, Rockstar. 🎸
          </h2>
          <p className="text-slate-300 text-sm max-w-md mx-auto mb-8 font-medium">
            You don't have to solve everything at once. Rest is when your brain connects new knowledge.
          </p>

          {/* Interactive Breathing Sphere */}
          <div className="relative w-48 h-48 mx-auto flex items-center justify-center my-6">
            {/* Outer expanding ripple */}
            <motion.div
              animate={{
                scale: phase === 'inhale' ? [1, 1.4] : phase === 'hold' ? 1.4 : [1.4, 1],
                opacity: phase === 'inhale' ? [0.3, 0.7] : phase === 'hold' ? 0.7 : [0.7, 0.3]
              }}
              transition={{ duration: 4, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-400 to-indigo-500 blur-md pointer-events-none"
            />

            {/* Core sphere */}
            <div className="relative z-10 w-36 h-36 rounded-full bg-slate-900/90 border-4 border-indigo-300/60 flex flex-col items-center justify-center shadow-xl">
              <span className="text-xs uppercase font-black tracking-widest text-teal-300">
                {phase === 'inhale' && 'Inhale Slowly...'}
                {phase === 'hold' && 'Hold Gently...'}
                {phase === 'exhale' && 'Exhale Smoothly...'}
              </span>
              <span className="text-4xl font-display font-black text-white mt-1">
                {timer}s
              </span>
            </div>
          </div>

          {/* Calming Affirmation */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 my-6 text-xs text-indigo-200 leading-relaxed font-medium">
            💡 <span className="font-bold text-white">Remember:</span> You are not competing with anyone. Every single minute you invest builds genuine understanding and long-term confidence.
          </div>

          {/* Action button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-teal-400 to-emerald-500 hover:from-teal-300 hover:to-emerald-400 text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              I'M READY TO CONTINUE <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

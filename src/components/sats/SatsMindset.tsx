import React from 'react';
import { motion } from 'motion/react';
import { CHAMPION_MINDSET_QUOTES } from '../../data/satsData';
import { 
  Heart, 
  Sparkles, 
  Brain, 
  Shield, 
  Smile, 
  Sun, 
  Coffee, 
  ArrowRight 
} from 'lucide-react';

interface SatsMindsetProps {
  onOpenCalmBreathing: () => void;
}

export default function SatsMindset({ onOpenCalmBreathing }: SatsMindsetProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Banner */}
      <section className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white p-6 md:p-10 rounded-[2.5rem] border-4 border-indigo-700 shadow-2xl space-y-4">
        <div className="flex items-center gap-2 px-3.5 py-1.5 bg-pink-500/20 border border-pink-400/30 rounded-full text-xs font-bold text-pink-300 uppercase tracking-widest w-max">
          <Heart size={14} className="text-pink-400" /> Striker Mindset & Well-being
        </div>
        <h2 className="text-3xl sm:text-4xl font-display font-black text-white">
          Growth Mindset & Exam Confidence
        </h2>
        <p className="text-sm text-indigo-100/90 font-medium max-w-xl leading-relaxed">
          Confidence isn't about never making mistakes. It's about knowing that every mistake is just a stepping stone to understanding.
        </p>

        <div className="pt-2">
          <button
            onClick={onOpenCalmBreathing}
            className="px-6 py-3.5 bg-gradient-to-r from-teal-400 to-emerald-500 hover:from-teal-300 hover:to-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
          >
            🌿 Take a Guided 60s Breathing Breather <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* Mindset Affirmations Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CHAMPION_MINDSET_QUOTES.map((item, idx) => (
          <div
            key={idx}
            className="p-6 rounded-3xl bg-white border-3 border-indigo-900/30 hover:border-indigo-900 shadow-md space-y-3 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="px-3 py-0.5 bg-indigo-100 text-indigo-800 rounded-full text-[10px] font-black uppercase tracking-wider">
                {item.category}
              </span>
              <Sparkles size={16} className="text-amber-500" />
            </div>
            <p className="text-sm sm:text-base font-bold text-slate-800 leading-relaxed italic">
              «{item.quote}»
            </p>
          </div>
        ))}
      </section>

      {/* Safe Emotional Support Disclaimer */}
      <section className="p-6 rounded-3xl bg-indigo-50 border-2 border-indigo-200 flex items-start gap-4">
        <Shield size={22} className="text-indigo-600 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 leading-relaxed font-medium space-y-1">
          <h4 className="font-bold text-indigo-950 text-sm">Need someone to talk to?</h4>
          <p>
            If preparing for exams is ever feeling overwhelming, remember you are never alone. Talk openly with your teacher, parent, or school learning mentor. They are always there to support you.
          </p>
        </div>
      </section>

    </div>
  );
}

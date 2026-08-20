import React from 'react';
import { motion } from 'motion/react';
import { PersonalBests } from '../types/extendedTypes';
import { 
  Trophy, 
  Zap, 
  Target, 
  Clock, 
  Flame, 
  Sparkles,
  Award
} from 'lucide-react';

interface PersonalBestsSectionProps {
  bests?: PersonalBests;
}

export default function PersonalBestsSection({ bests }: PersonalBestsSectionProps) {
  const pb = bests || {
    highestQuizScore: 0,
    highestAccuracyPct: 0,
    fastestAnswerTimeSec: 0,
    longestStreak: 0,
    mostXpSingleSession: 0,
    lastUpdated: Date.now()
  };

  return (
    <div className="p-6 md:p-8 rounded-3xl bg-white border-4 border-indigo-900 shadow-lg space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-black text-amber-600 uppercase tracking-widest block">Real Verified Milestones</span>
          <h3 className="text-2xl font-display font-black text-slate-900 flex items-center gap-2">
            <Trophy size={22} className="text-amber-500" /> Personal Bests & Records
          </h3>
        </div>
        <Sparkles size={20} className="text-amber-500" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-200 space-y-1">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <Award size={18} />
          </div>
          <span className="text-[10px] font-extrabold uppercase text-slate-500 block">High Score</span>
          <span className="text-2xl font-display font-black text-slate-900">{pb.highestQuizScore}</span>
          <span className="text-[10px] text-amber-800 font-bold block">Correct answers</span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200 space-y-1">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <Target size={18} />
          </div>
          <span className="text-[10px] font-extrabold uppercase text-slate-500 block">Best Accuracy</span>
          <span className="text-2xl font-display font-black text-slate-900">{pb.highestAccuracyPct}%</span>
          <span className="text-[10px] text-emerald-800 font-bold block">Flawless precision</span>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-50 border-2 border-indigo-200 space-y-1">
          <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto">
            <Flame size={18} />
          </div>
          <span className="text-[10px] font-extrabold uppercase text-slate-500 block">Longest Streak</span>
          <span className="text-2xl font-display font-black text-slate-900">{pb.longestStreak} 🔥</span>
          <span className="text-[10px] text-indigo-800 font-bold block">Consecutive solved</span>
        </div>

        <div className="p-4 rounded-2xl bg-purple-50 border-2 border-purple-200 space-y-1">
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto">
            <Zap size={18} />
          </div>
          <span className="text-[10px] font-extrabold uppercase text-slate-500 block">Max XP Session</span>
          <span className="text-2xl font-display font-black text-slate-900">+{pb.mostXpSingleSession}</span>
          <span className="text-[10px] text-purple-800 font-bold block">Single run record</span>
        </div>

      </div>
    </div>
  );
}

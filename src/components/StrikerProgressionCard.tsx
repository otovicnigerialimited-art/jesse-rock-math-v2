import React from 'react';
import { motion } from 'motion/react';
import { STRIKER_TIERS, getCurrentStrikerTier, getNextStrikerTier } from '../lib/strikerTiers';
import { ExtendedUserStats } from '../types/extendedTypes';
import { 
  Award, 
  Sparkles, 
  Lock, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface StrikerProgressionCardProps {
  stats: ExtendedUserStats;
}

export default function StrikerProgressionCard({ stats }: StrikerProgressionCardProps) {
  const currentTier = getCurrentStrikerTier(stats.xp || 0, stats.level || 1);
  const nextTier = getNextStrikerTier(currentTier.tierNumber);

  const xpProgressInTier = stats.xp - currentTier.minXp;
  const xpNeededForNext = nextTier ? nextTier.minXp - currentTier.minXp : 1000;
  const pctToNext = nextTier ? Math.min(100, Math.round((xpProgressInTier / xpNeededForNext) * 100)) : 100;

  return (
    <div className="p-6 md:p-8 rounded-[2.5rem] bg-white border-4 border-indigo-900 shadow-xl space-y-6">
      
      {/* Active Tier Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white p-6 rounded-3xl border-3 border-indigo-700">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-4xl shadow-inner shrink-0">
            {currentTier.badgeEmoji}
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 block">
              Tier {currentTier.tierNumber} of 7 • Striker Status
            </span>
            <h3 className="text-2xl font-display font-black text-white">
              {currentTier.name}
            </h3>
            <p className="text-xs text-indigo-200 font-medium mt-0.5">{currentTier.title}</p>
          </div>
        </div>

        {/* Level XP Badge */}
        <div className="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center shrink-0">
          <span className="text-[10px] uppercase font-bold text-indigo-200 block">Total Experience</span>
          <span className="text-2xl font-black text-amber-300">{stats.xp || 0} XP</span>
        </div>
      </div>

      {/* Progress Bar to Next Tier */}
      {nextTier ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-700">Progress to {nextTier.badgeEmoji} {nextTier.name}</span>
            <span className="text-indigo-900 font-black">{pctToNext}% ({xpProgressInTier} / {xpNeededForNext} XP)</span>
          </div>
          <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div 
              className="h-full bg-gradient-to-r from-indigo-600 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${pctToNext}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-2xl text-xs font-bold text-center">
          👑 You have reached the ultimate pinnacle of Math Striker Progression!
        </div>
      )}

      {/* Tiers Roadmap */}
      <div className="space-y-3 pt-2">
        <h4 className="text-sm font-black uppercase tracking-wider text-slate-800">Striker Tier Roadmap</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {STRIKER_TIERS.map(t => {
            const isUnlocked = stats.xp >= t.minXp || stats.level >= t.minLevel;
            const isCurrent = t.tierNumber === currentTier.tierNumber;

            return (
              <div 
                key={t.id}
                className={`p-4 rounded-2xl border-2 transition-all space-y-1.5 ${
                  isCurrent
                    ? 'bg-amber-50 border-amber-500 shadow-md ring-2 ring-amber-400'
                    : isUnlocked
                    ? 'bg-indigo-50/60 border-indigo-200 text-slate-900'
                    : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">{t.badgeEmoji}</span>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    isCurrent ? 'bg-amber-400 text-slate-950' : isUnlocked ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {isCurrent ? 'Current' : isUnlocked ? 'Unlocked' : 'Locked'}
                  </span>
                </div>

                <h5 className="font-bold text-xs text-slate-900">{t.name}</h5>
                <p className="text-[10px] text-slate-500 font-medium leading-tight">{t.description}</p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

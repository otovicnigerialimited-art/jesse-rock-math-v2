import React from 'react';
import { motion } from 'motion/react';
import { ExtendedUserStats } from '../types/extendedTypes';
import { getDueSpacedItems } from '../lib/spacedRepetition';
import { 
  Sparkles, 
  ArrowRight, 
  Zap, 
  Brain, 
  Clock, 
  Trophy, 
  RotateCcw,
  Target
} from 'lucide-react';

interface NextGigCardProps {
  stats: ExtendedUserStats;
  onStartDiagnostic: () => void;
  onStartLesson: (topicId: string) => void;
  onStartSpacedPractice: () => void;
  onStartQuiz: () => void;
}

export default function NextGigCard({
  stats,
  onStartDiagnostic,
  onStartLesson,
  onStartSpacedPractice,
  onStartQuiz
}: NextGigCardProps) {
  const dueItems = getDueSpacedItems(stats.spacedItems);
  const diag = stats.diagnosticResult;

  let title = 'Take Diagnostic Assessment';
  let badge = 'Level Calibration';
  let desc = 'Complete a 6-question quick test to assess your baseline calculation ability and unlock personalized recommendations.';
  let ctaText = 'Start Diagnostic Test →';
  let actionFn = onStartDiagnostic;
  let bgGradient = 'from-indigo-900 to-slate-900';
  let icon = Brain;

  if (!diag) {
    // Default diagnostic prompt
  } else if (dueItems.length > 0) {
    title = `Spaced Practice: ${dueItems[0].skillName}`;
    badge = 'Memory Refresh';
    desc = `You have ${dueItems.length} topic(s) due for scheduled review to lock formulas into long-term memory.`;
    ctaText = 'Review Skill Now →';
    actionFn = onStartSpacedPractice;
    bgGradient = 'from-purple-900 to-slate-900';
    icon = RotateCcw;
  } else if (diag.weaknesses.length > 0) {
    const weakTopic = diag.weaknesses[0];
    title = `Focus Drill: ${weakTopic}`;
    badge = 'Weakness Recovery';
    desc = `Targeted practice to strengthen your understanding of ${weakTopic} based on recent diagnostic logs.`;
    ctaText = 'Start Target Practice →';
    actionFn = () => onStartLesson('1');
    bgGradient = 'from-amber-900 to-slate-900';
    icon = Target;
  } else {
    title = 'Live pitch Multiplication Battle';
    badge = 'High Performance';
    desc = 'Your accuracy is strong across all domains! Jump into the pitch to compete live against peers.';
    ctaText = 'Enter pitch Battle →';
    actionFn = onStartQuiz;
    bgGradient = 'from-emerald-900 to-slate-900';
    icon = Trophy;
  }

  const IconComp = icon;

  return (
    <div className={`p-6 md:p-8 rounded-[2.5rem] bg-gradient-to-br ${bgGradient} text-white border-4 border-indigo-500/50 shadow-xl space-y-4 relative overflow-hidden`}>
      <div className="flex items-center justify-between">
        <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-wider text-amber-300 border border-white/15">
          🎯 YOUR NEXT GIG
        </span>
        <span className="text-xs text-indigo-200 font-bold uppercase tracking-wider">{badge}</span>
      </div>

      <div className="space-y-1">
        <h3 className="text-2xl sm:text-3xl font-display font-black text-white flex items-center gap-2">
          <IconComp size={24} className="text-amber-400" />
          {title}
        </h3>
        <p className="text-xs text-indigo-100 font-medium leading-relaxed max-w-xl">
          {desc}
        </p>
      </div>

      <div className="pt-2">
        <button
          onClick={actionFn}
          className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
        >
          {ctaText}
        </button>
      </div>
    </div>
  );
}

import React from 'react';
import { motion } from 'motion/react';
import { 
  SatsStudentProgress, 
  RevisionPlanDay 
} from '../../types/sats';
import { SATS_TOPICS, SATS_DOMAINS } from '../../data/satsData';
import { generateDefaultRevisionPlan } from '../../lib/satsDb';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  RotateCcw, 
  BookOpen, 
  Zap, 
  Trophy,
  Coffee,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SatsRevisionPlanProps {
  progress: SatsStudentProgress;
  onUpdateProgress: (updated: SatsStudentProgress) => void;
  onStartLesson: (topicId: string) => void;
}

export const SatsRevisionPlan = ({
  progress,
  onUpdateProgress,
  onStartLesson
}: SatsRevisionPlanProps) => {
  const plan = progress.weeklyPlan || generateDefaultRevisionPlan();

  const handleToggleDay = (idx: number) => {
    const updated = { ...progress };
    const currentItem = updated.weeklyPlan[idx];
    if (!currentItem) return;

    currentItem.isCompleted = !currentItem.isCompleted;
    currentItem.status = currentItem.isCompleted ? 'completed' : 'pending';
    if (currentItem.isCompleted) {
      currentItem.completedAt = Date.now();
      updated.totalMinutesStudied += currentItem.durationMinutes;
      confetti({ particleCount: 50, spread: 50 });
    }

    onUpdateProgress(updated);
  };

  const handleRegeneratePlan = () => {
    const updated = { ...progress };
    updated.weeklyPlan = generateDefaultRevisionPlan();
    onUpdateProgress(updated);
  };

  const completedCount = plan.filter(p => p.isCompleted).length;
  const planCompletionPct = Math.round((completedCount / Math.max(1, plan.length)) * 100);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Banner */}
      <section className="bg-white p-6 md:p-8 rounded-3xl border-4 border-indigo-900 shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black text-amber-700 uppercase tracking-widest block mb-1">
              Balanced Weekly Study Rhythm
            </span>
            <h2 className="text-3xl font-display font-black text-slate-900">
              Personal Revision Plan
            </h2>
            <p className="text-xs text-slate-600 font-medium max-w-xl mt-1">
              Short, high-focus daily sessions (15–20 minutes) ensure steady retention without fatigue or cramming stress.
            </p>
          </div>

          {/* Completion Progress Gauge */}
          <div className="p-4 rounded-2xl bg-indigo-50 border-2 border-indigo-200 text-center min-w-[160px]">
            <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">Week Progress</span>
            <span className="text-2xl font-black text-indigo-950">{planCompletionPct}%</span>
            <span className="text-[10px] text-slate-500 font-medium block">{completedCount} of {plan.length} tasks done</span>
          </div>
        </div>
      </section>

      {/* Weekly Schedule Days List */}
      <section className="space-y-3">
        {plan.map((item, idx) => (
          <div
            key={idx}
            className={`p-5 rounded-3xl border-3 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
              item.isCompleted
                ? 'bg-emerald-50/70 border-emerald-400 shadow-sm'
                : 'bg-white border-indigo-900/30 hover:border-indigo-900 shadow-md'
            }`}
          >
            <div className="flex items-start sm:items-center gap-4">
              {/* Checkbox toggle */}
              <button
                onClick={() => handleToggleDay(idx)}
                className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all cursor-pointer shrink-0 mt-1 sm:mt-0 ${
                  item.isCompleted
                    ? 'bg-emerald-600 border-emerald-700 text-white'
                    : 'bg-slate-50 border-slate-300 hover:border-indigo-500 text-transparent'
                }`}
              >
                <Check size={16} className={item.isCompleted ? 'opacity-100' : 'opacity-0'} />
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-black text-slate-900 text-base">
                    {item.dayOfWeek}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    item.activityType === 'learn'
                      ? 'bg-indigo-100 text-indigo-800'
                      : item.activityType === 'practice'
                      ? 'bg-emerald-100 text-emerald-800'
                      : item.activityType === 'mock'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {item.activityType}
                  </span>
                </div>
                <h4 className="font-bold text-slate-800 text-sm mt-0.5">{item.topicTitle}</h4>
                <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                  <Clock size={12} /> {item.durationMinutes} mins • Domain: <span className="capitalize">{item.domain}</span>
                </p>
              </div>
            </div>

            {/* Action button */}
            <div className="w-full md:w-auto flex items-center gap-2">
              {item.activityType !== 'review' ? (
                <button
                  onClick={() => onStartLesson(item.topicId)}
                  className="w-full md:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Start Task <ArrowRight size={14} />
                </button>
              ) : (
                <span className="text-xs text-amber-800 font-bold bg-amber-100 px-3 py-1.5 rounded-xl flex items-center gap-1">
                  <Coffee size={14} /> Rest & Reflection
                </span>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* Reset / Adapt Plan */}
      <div className="text-center pt-4">
        <button
          onClick={handleRegeneratePlan}
          className="px-6 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-600 font-bold text-xs uppercase tracking-wider flex items-center gap-2 mx-auto cursor-pointer transition-all"
        >
          <RotateCcw size={14} /> Regenerate Adaptive Weekly Plan
        </button>
      </div>

    </div>
  );
};

export default SatsRevisionPlan;

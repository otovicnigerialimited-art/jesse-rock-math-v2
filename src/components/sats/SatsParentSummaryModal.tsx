import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SatsStudentProgress } from '../../types/sats';
import { 
  Users, 
  X, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  Award, 
  Flame,
  HelpCircle,
  Sparkles,
  Heart
} from 'lucide-react';

interface SatsParentSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: SatsStudentProgress;
}

export default function SatsParentSummaryModal({ isOpen, onClose, progress }: SatsParentSummaryModalProps) {
  if (!isOpen) return null;

  const latestMock = progress.mockHistory.length > 0
    ? progress.mockHistory[progress.mockHistory.length - 1]
    : null;

  // Identify top strengths & growth areas
  const domains = Object.entries(progress.domainMastery).map(([domain, score]) => ({ domain, score }));
  domains.sort((a, b) => b.score - a.score);

  const topStrengths = domains.slice(0, 2);
  const areasToEncourage = domains.slice(-2);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-2xl bg-white text-slate-900 rounded-3xl p-6 md:p-8 border-4 border-indigo-900 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <Users size={20} />
              </div>
              <div>
                <h3 className="text-xl font-display font-black text-slate-900">
                  Parent & Guardian Progress Summary
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {progress.studentName}'s KS2 SATs Preparation Overview
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-900 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Quick High-Level Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-center">
              <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">Readiness</span>
              <span className="text-2xl font-black text-indigo-950">{progress.readinessScore}%</span>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Practice Accuracy</span>
              <span className="text-2xl font-black text-emerald-950">
                {progress.totalPracticeSolved > 0 
                  ? Math.round((progress.totalCorrect / progress.totalPracticeSolved) * 100)
                  : 0}%
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-center">
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">Study Streak</span>
              <span className="text-2xl font-black text-amber-950">{progress.streakDays} Days 🔥</span>
            </div>
            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 text-center">
              <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block">Time Invested</span>
              <span className="text-2xl font-black text-purple-950">{progress.totalMinutesStudied} mins</span>
            </div>
          </div>

          {/* Recent Mock Paper Performance */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 mb-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-display font-black text-slate-900 flex items-center gap-2 text-sm">
                <Award size={16} className="text-amber-500" /> Recent Mock Paper Performance
              </h4>
              <span className="text-xs font-bold text-slate-500">{latestMock?.date || 'Recent'}</span>
            </div>
            {latestMock ? (
              <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200">
                <div>
                  <p className="font-bold text-slate-900 text-sm">{latestMock.paperName}</p>
                  <p className="text-xs text-slate-500">Score: {latestMock.score} / {latestMock.totalQuestions} questions</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-emerald-600">{latestMock.percentage}%</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">No mock tests completed yet.</p>
            )}
          </div>

          {/* Strengths & Growth Areas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
              <h5 className="font-bold text-emerald-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-600" /> Areas of Strong Mastery
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                {topStrengths.map(({ domain, score }) => (
                  <li key={domain} className="flex justify-between items-center capitalize">
                    <span>🟢 {domain}</span>
                    <span className="font-bold text-emerald-800">{score}%</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
              <h5 className="font-bold text-amber-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <TrendingUp size={14} className="text-amber-600" /> Key Revision Focus
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                {areasToEncourage.map(({ domain, score }) => (
                  <li key={domain} className="flex justify-between items-center capitalize">
                    <span>🟠 {domain}</span>
                    <span className="font-bold text-amber-800">{score}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Friendly Guidance for Home */}
          <div className="p-4 rounded-2xl bg-indigo-900 text-white flex items-start gap-3">
            <Heart size={20} className="text-pink-400 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <p className="font-bold text-indigo-100 mb-1">Parent Tip:</p>
              <p className="text-indigo-200">
                15–20 minutes of calm, regular practice each day produces far better retention and confidence than long, stressful weekend cramming sessions. Celebrate their consistency!
              </p>
            </div>
          </div>

          {/* Close button */}
          <div className="mt-6 text-center">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
            >
              Close Summary
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

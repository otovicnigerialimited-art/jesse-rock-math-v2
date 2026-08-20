import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, X, CheckCircle, AlertTriangle, Clock, BarChart2, Users } from 'lucide-react';

export interface WhyEvidence {
  metricTitle: string;
  metricValue: string;
  studentsAttempted: number;
  studentsMastered: number;
  mostCommonMistake: string;
  avgResponseTimeSecs: number;
  accuracyDistribution: {
    low: number; // <50%
    medium: number; // 50-80%
    high: number; // >80%
  };
  keyEvidenceNotes: string[];
}

interface WhyAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  evidence: WhyEvidence | null;
}

export default function WhyAnalyticsModal({ isOpen, onClose, evidence }: WhyAnalyticsModalProps) {
  if (!isOpen || !evidence) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full text-white shadow-2xl relative space-y-5"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-2xl">
              <HelpCircle size={24} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">WHY ANALYTICS EVIDENCE</span>
              <h3 className="text-xl font-display font-bold text-white">{evidence.metricTitle}: <span className="text-amber-400">{evidence.metricValue}</span></h3>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/60 p-3 rounded-xl border border-slate-700">
            This statistic is backed by real student activity and response data collected during class sessions, homework, and assessments.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-2xl flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                <Users size={14} className="text-cyan-400" /> Attempted
              </div>
              <span className="text-lg font-black text-white">{evidence.studentsAttempted} Students</span>
            </div>

            <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-2xl flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                <CheckCircle size={14} className="text-emerald-400" /> Reached Mastery
              </div>
              <span className="text-lg font-black text-emerald-400">{evidence.studentsMastered} Students</span>
            </div>
          </div>

          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <AlertTriangle size={15} /> Most Common Class Mistake
            </div>
            <p className="text-xs font-semibold text-slate-200">{evidence.mostCommonMistake}</p>
          </div>

          <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-2xl flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-2">
              <Clock size={15} className="text-indigo-400" /> Avg Response Time:
            </span>
            <span className="text-sm font-bold text-white">{evidence.avgResponseTimeSecs} seconds</span>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart2 size={14} className="text-brand-primary" /> Accuracy Distribution
            </span>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Secure (&gt;80%)</span>
                <span className="font-bold text-emerald-400">{evidence.accuracyDistribution.high} students</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Developing (50-80%)</span>
                <span className="font-bold text-amber-400">{evidence.accuracyDistribution.medium} students</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Support (&lt;50%)</span>
                <span className="font-bold text-rose-400">{evidence.accuracyDistribution.low} students</span>
              </div>
            </div>
          </div>

          {evidence.keyEvidenceNotes.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Key Evidence Signals:</span>
              <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                {evidence.keyEvidenceNotes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            Close Evidence Window
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

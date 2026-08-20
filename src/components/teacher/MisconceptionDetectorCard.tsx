import React, { useState } from 'react';
import { AlertTriangle, Lightbulb, Play, ArrowRight, CheckCircle2, HelpCircle } from 'lucide-react';
import WhyAnalyticsModal, { WhyEvidence } from './WhyAnalyticsModal';

interface MisconceptionDetectorCardProps {
  onBuildMiniLesson: (topic: string, skill: string) => void;
  onCreatePractice: (topic: string, skill: string) => void;
}

export default function MisconceptionDetectorCard({ onBuildMiniLesson, onCreatePractice }: MisconceptionDetectorCardProps) {
  const [showEvidence, setShowEvidence] = useState(false);

  const misconception = {
    title: "Equivalent Fractions Denominator Scaling",
    topic: "Fractions",
    skill: "Equivalent Fractions",
    affectedCount: 12,
    totalCount: 28,
    percentage: 43,
    exampleMistakes: [
      "Student calculated 3/4 = 3/8 (multiplied denominator 4*2, but kept numerator 3)",
      "Student calculated 2/5 = 4/5 (added 2 to numerator instead of multiplying)"
    ],
    evidence: [
      "12 students submitted incorrect scaling calculations in Live Quiz #3.",
      "Avg response time for failed attempts: 18.2 seconds.",
      "Misconception pattern detected across 43% of active class submissions."
    ]
  };

  const evidenceData: WhyEvidence = {
    metricTitle: "Class Misconception Evidence",
    metricValue: `${misconception.affectedCount} / ${misconception.totalCount} Students (${misconception.percentage}%)`,
    studentsAttempted: misconception.totalCount,
    studentsMastered: misconception.totalCount - misconception.affectedCount,
    mostCommonMistake: misconception.exampleMistakes[0],
    avgResponseTimeSecs: 18.2,
    accuracyDistribution: {
      low: misconception.affectedCount,
      medium: 10,
      high: misconception.totalCount - misconception.affectedCount - 10
    },
    keyEvidenceNotes: misconception.evidence
  };

  return (
    <div className="p-6 rounded-3xl bg-slate-900 border-2 border-rose-500/40 space-y-4 text-white relative overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-2xl">
            <AlertTriangle size={24} className="animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">REAL-TIME ERROR PATTERN RECOGNITION</span>
            <h3 className="text-xl font-display font-bold text-white">⚠️ CLASS MISCONCEPTION DETECTED</h3>
          </div>
        </div>

        <button
          onClick={() => setShowEvidence(true)}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
        >
          <HelpCircle size={14} className="text-amber-400" /> [WHY?]
        </button>
      </div>

      <div className="p-4 bg-slate-950 border border-rose-500/30 rounded-2xl space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-amber-400 uppercase">{misconception.topic} — {misconception.skill}</span>
          <span className="font-bold text-rose-400">{misconception.affectedCount} of {misconception.totalCount} students ({misconception.percentage}%)</span>
        </div>

        <h4 className="text-base font-bold text-white">{misconception.title}</h4>

        <div className="space-y-1 pt-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Example Student Submissions:</span>
          <ul className="text-xs text-rose-300 space-y-1 list-disc list-inside bg-rose-950/20 p-2 rounded-xl border border-rose-500/20">
            {misconception.exampleMistakes.map((m, idx) => (
              <li key={idx}>{m}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
        <button
          onClick={() => onBuildMiniLesson(misconception.topic, misconception.skill)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs uppercase flex items-center gap-1.5 cursor-pointer shadow-md"
        >
          <Lightbulb size={15} /> CREATE MINI LESSON
        </button>

        <button
          onClick={() => onCreatePractice(misconception.topic, misconception.skill)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs uppercase flex items-center gap-1.5 cursor-pointer shadow-md"
        >
          <Play size={15} /> CREATE TARGETED PRACTICE
        </button>
      </div>

      <WhyAnalyticsModal
        isOpen={showEvidence}
        onClose={() => setShowEvidence(false)}
        evidence={evidenceData}
      />
    </div>
  );
}

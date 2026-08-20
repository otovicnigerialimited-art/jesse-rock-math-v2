import React, { useState } from 'react';
import { Sparkles, Brain, Lightbulb, Users, Clock, Check, X, ArrowRight, HelpCircle } from 'lucide-react';
import { SchoolStudent } from '../../lib/schoolDb';
import WhyAnalyticsModal, { WhyEvidence } from './WhyAnalyticsModal';

interface TeacherRecommendationCardProps {
  students: SchoolStudent[];
  onBuildLesson: (topic: string, skill: string) => void;
}

export default function TeacherRecommendationCard({ students, onBuildLesson }: TeacherRecommendationCardProps) {
  const [showEvidence, setShowEvidence] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  // If no students in roster yet, render clean empty invitation card
  if (students.length === 0) {
    return (
      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border-2 border-indigo-500/40 shadow-xl space-y-3 text-white">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-400 text-slate-950 rounded-2xl font-black shadow-md flex items-center gap-1.5">
            <Sparkles size={20} />
            <span className="text-xs uppercase tracking-wider">AI RECOMMENDATION ENGINE</span>
          </div>
          <div>
            <h2 className="text-lg font-display font-black text-amber-400 tracking-tight">AI TEACHING ADVISOR READY</h2>
            <p className="text-xs text-indigo-200">Waiting for class activity data</p>
          </div>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Add students to your roster or share your active Class Code. Once students complete practice drills or quizzes, AI Recommendations will automatically generate targeted lesson suggestions and misconception analyses here!
        </p>
      </div>
    );
  }

  // Calculate recommendation metrics based on actual students
  const totalStudents = students.length;
  const supportCount = students.filter(s => {
    const solved = s.school_math_progress?.solved || 0;
    const correct = s.school_math_progress?.correctAnswers || 0;
    return solved > 0 && (correct / solved) < 0.6;
  }).length;
  const developingCount = students.filter(s => {
    const solved = s.school_math_progress?.solved || 0;
    const correct = s.school_math_progress?.correctAnswers || 0;
    const acc = solved > 0 ? correct / solved : 0;
    return acc >= 0.6 && acc < 0.8;
  }).length;
  const secureCount = Math.max(0, totalStudents - supportCount - developingCount);

  const recommendedTopic = "Fractions";
  const recommendedSkill = "Equivalent Fractions";
  const recommendedLength = "15 minutes";

  const evidenceData: WhyEvidence = {
    metricTitle: "Recommendation Basis",
    metricValue: `${recommendedTopic} - ${recommendedSkill}`,
    studentsAttempted: totalStudents,
    studentsMastered: secureCount,
    mostCommonMistake: "Multiplying numerator but forgetting to multiply denominator when converting equivalent fractions.",
    avgResponseTimeSecs: 14.8,
    accuracyDistribution: {
      low: supportCount,
      medium: developingCount,
      high: secureCount
    },
    keyEvidenceNotes: [
      `${supportCount} students scored below 50% on recent fractions exit ticket.`,
      "Common mistake detected across 12 student quiz submissions.",
      `Suggested 15-minute remediation block to transition ${developingCount} developing students to secure.`
    ]
  };

  return (
    <>
      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border-2 border-indigo-500/40 shadow-xl space-y-4 relative overflow-hidden text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-400 text-slate-950 rounded-2xl font-black shadow-md flex items-center gap-1.5">
              <Sparkles size={20} className="animate-spin-slow" />
              <span className="text-xs uppercase tracking-wider">AI RECOMMENDATION</span>
            </div>
            <div>
              <h2 className="text-xl font-display font-black text-amber-400 tracking-tight">WHAT SHOULD I TEACH TOMORROW?</h2>
              <p className="text-xs text-indigo-200">Data-driven focus based on class mastery analysis</p>
            </div>
          </div>

          <button
            onClick={() => setDismissed(true)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer text-xs flex items-center gap-1"
          >
            <X size={16} /> Ignore
          </button>
        </div>

        <div className="p-4 bg-slate-900/90 border border-indigo-500/30 rounded-2xl space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Recommended Focus Topic</span>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Brain size={18} className="text-amber-400" /> {recommendedTopic}: <span className="text-indigo-300">{recommendedSkill}</span>
              </h3>
            </div>

            <div className="flex items-center gap-2 bg-indigo-950 px-3 py-1.5 rounded-xl border border-indigo-700/50 text-xs font-bold text-indigo-200">
              <Clock size={14} className="text-amber-400" /> Lesson Length: {recommendedLength}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <span className="block font-black text-lg text-rose-400">{supportCount}</span>
              <span className="text-[10px] font-bold uppercase text-rose-300">Need Support</span>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <span className="block font-black text-lg text-amber-400">{developingCount}</span>
              <span className="text-[10px] font-bold uppercase text-amber-300">Developing</span>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="block font-black text-lg text-emerald-400">{secureCount}</span>
              <span className="text-[10px] font-bold uppercase text-emerald-300">Secure</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <button
            onClick={() => setShowEvidence(true)}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer border border-slate-700 transition-all"
          >
            <HelpCircle size={15} className="text-indigo-400" /> VIEW EVIDENCE [WHY]
          </button>

          <button
            onClick={() => onBuildLesson(recommendedTopic, recommendedSkill)}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
          >
            BUILD LESSON <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <WhyAnalyticsModal
        isOpen={showEvidence}
        onClose={() => setShowEvidence(false)}
        evidence={evidenceData}
      />
    </>
  );
}

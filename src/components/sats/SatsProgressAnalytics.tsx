import React from 'react';
import { motion } from 'motion/react';
import { SatsStudentProgress, SatsDomain } from '../../types/sats';
import { SATS_DOMAINS, SATS_TOPICS } from '../../data/satsData';
import { 
  TrendingUp, 
  Target, 
  Award, 
  Zap, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle,
  BarChart2,
  Calendar,
  Flame
} from 'lucide-react';

interface SatsProgressAnalyticsProps {
  progress: SatsStudentProgress;
  onStartTopic: (topicId: string) => void;
}

export default function SatsProgressAnalytics({
  progress,
  onStartTopic
}: SatsProgressAnalyticsProps) {
  const practiceAcc = progress.totalPracticeSolved > 0
    ? Math.round((progress.totalCorrect / progress.totalPracticeSolved) * 100)
    : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. READINESS BANNER & METRICS */}
      <section className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white p-6 md:p-10 rounded-[2.5rem] border-4 border-indigo-700 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="px-3.5 py-1 bg-indigo-500/30 text-indigo-300 rounded-full text-xs font-black uppercase tracking-widest inline-block mb-2">
              Performance Intelligence & Diagnostics
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-black text-white">
              SATs Readiness Breakdown
            </h2>
            <p className="text-xs text-indigo-200 font-medium max-w-lg mt-1">
              Holistic measurement across curriculum mastery, arithmetic speed, and reasoning problem-solving.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 text-center min-w-[180px]">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">SATs Readiness</span>
            <span className="text-4xl sm:text-5xl font-display font-black text-emerald-300">{progress.readinessScore}%</span>
            <span className="text-[10px] text-indigo-200 block mt-1">Strong foundation</span>
          </div>
        </div>

        {/* Disclaimer note */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-indigo-200/90 leading-relaxed font-medium">
          ℹ️ <span className="font-bold text-white">Transparency Disclaimer:</span> This readiness score is a progressive learning indicator calculated from your domain quizzes, mock papers, and practice accuracy. It is designed to guide revision and is not an official government assessment.
        </div>
      </section>

      {/* 2. CURRICULUM DOMAIN MASTERY GRID */}
      <section className="bg-white p-6 md:p-8 rounded-3xl border-4 border-indigo-900 shadow-lg space-y-6">
        <div>
          <h3 className="text-xl font-display font-black text-slate-900">
            Curriculum Domain Mastery
          </h3>
          <p className="text-xs text-slate-500 font-medium">All 8 KS2 National Curriculum Mathematics standards</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SATS_DOMAINS.map(d => {
            const mastery = progress.domainMastery[d.id] || 60;
            return (
              <div key={d.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-800 flex items-center gap-1.5 capitalize">
                    {d.title}
                  </span>
                  <span className={`font-black ${mastery >= 80 ? 'text-emerald-700' : mastery >= 65 ? 'text-indigo-700' : 'text-amber-700'}`}>
                    {mastery}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      mastery >= 80 ? 'bg-emerald-500' : mastery >= 65 ? 'bg-indigo-600' : 'bg-amber-500'
                    }`}
                    style={{ width: `${mastery}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. SPEED & ACCURACY COMPARISON */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="p-6 rounded-3xl bg-white border-3 border-indigo-900 shadow-md text-center space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center mx-auto">
            <Zap size={20} />
          </div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Arithmetic Accuracy</span>
          <span className="text-3xl font-display font-black text-slate-900">{practiceAcc}%</span>
          <p className="text-[11px] text-slate-500 font-medium">Paper 1 rapid calculation consistency</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border-3 border-emerald-900 shadow-md text-center space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
            <Clock size={20} />
          </div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Practice Time</span>
          <span className="text-3xl font-display font-black text-slate-900">{progress.totalMinutesStudied} mins</span>
          <p className="text-[11px] text-slate-500 font-medium">Accumulated high-focus preparation</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border-3 border-amber-900 shadow-md text-center space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
            <Target size={20} />
          </div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Questions Solved</span>
          <span className="text-3xl font-display font-black text-slate-900">{progress.totalPracticeSolved}</span>
          <p className="text-[11px] text-slate-500 font-medium">{progress.totalCorrect} correct answers</p>
        </div>

      </section>

      {/* 4. COMMON MISTAKES & WEAKNESS LOG */}
      {(progress?.weaknessTags || []).length > 0 && (
        <section className="bg-white p-6 md:p-8 rounded-3xl border-4 border-amber-500 shadow-lg space-y-4">
          <h3 className="text-xl font-display font-black text-slate-900 flex items-center gap-2">
            <AlertCircle size={20} className="text-amber-600" /> Detected Weakness Areas
          </h3>
          <p className="text-xs text-slate-600 font-medium">
            The platform automatically tags mistake patterns to help you target your revision efficiently.
          </p>

          <div className="space-y-3">
            {progress.weaknessTags.map((w, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-4">
                <div>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm capitalize block">
                    {w.tag}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Flagged {w.mistakeCount} times during recent practice
                  </span>
                </div>

                <button
                  onClick={() => onStartTopic(w.associatedTopicId)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all"
                >
                  Review Skill →
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. MILESTONES & ACHIEVEMENTS */}
      <section className="bg-white p-6 md:p-8 rounded-3xl border-4 border-indigo-900/40 shadow-lg space-y-4">
        <h3 className="text-xl font-display font-black text-slate-900 flex items-center gap-2">
          <Award size={20} className="text-indigo-600" /> SATs Preparation Milestones
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {progress.milestones.map(m => {
            const isUnlocked = !!m.unlockedAt || progress.readinessScore >= 80;
            return (
              <div 
                key={m.id}
                className={`p-4 rounded-2xl border-2 flex items-center gap-3 ${
                  isUnlocked 
                    ? 'bg-indigo-50 border-indigo-300 text-slate-900' 
                    : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                  isUnlocked ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-400'
                }`}>
                  {isUnlocked ? '✓' : '🔒'}
                </div>
                <div>
                  <h4 className="font-bold text-xs">{m.title}</h4>
                  <p className="text-[11px] text-slate-500 font-medium">{m.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}

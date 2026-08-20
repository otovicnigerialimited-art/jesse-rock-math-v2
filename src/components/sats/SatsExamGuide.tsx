import React, { useState } from 'react';
import { motion } from 'motion/react';
import { SATS_EXAM_GUIDE } from '../../data/satsData';
import { 
  FileText, 
  HelpCircle, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  BookOpen
} from 'lucide-react';

interface SatsExamGuideProps {
  onStartSpeedChallenge: (durationSeconds: number) => void;
}

export default function SatsExamGuide({ onStartSpeedChallenge }: SatsExamGuideProps) {
  const [activeTab, setActiveTab] = useState<'tips' | 'when_stuck' | 'time_drills'>('tips');

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Banner */}
      <section className="bg-white p-6 md:p-8 rounded-3xl border-4 border-indigo-900 shadow-lg space-y-4">
        <div>
          <span className="text-xs font-black text-indigo-700 uppercase tracking-widest block mb-1">
            Exam Strategy & Best Practices
          </span>
          <h2 className="text-3xl font-display font-black text-slate-900">
            KS2 SATs Exam Day Mastery Guide
          </h2>
          <p className="text-xs text-slate-600 font-medium max-w-xl mt-1">
            Knowledge is half the battle — the other half is exam technique, time management, and staying calm under pressure.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-2 pt-2">
          {[
            { id: 'tips', label: '📋 Exam Day Strategies', icon: FileText },
            { id: 'when_stuck', label: '💡 When You Get Stuck (5 Steps)', icon: HelpCircle },
            { id: 'time_drills', label: '⏱️ Time Management Training', icon: Clock }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === t.id
                  ? 'bg-indigo-900 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <t.icon size={15} />
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* TAB 1: EXAM DAY STRATEGIES */}
      {activeTab === 'tips' && (
        <section className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SATS_EXAM_GUIDE.sections.slice(0, 2).map((sec, idx) => (
              <div key={idx} className={`p-6 rounded-3xl border-3 ${sec.color} bg-white shadow-md space-y-4`}>
                <h3 className="text-xl font-display font-black text-slate-900 flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-indigo-600" /> {sec.title}
                </h3>
                <div className="space-y-4">
                  {sec.tips.map((tip, tIdx) => (
                    <div key={tIdx} className="space-y-1">
                      <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 inline-block" />
                        {tip.heading}
                      </h4>
                      <p className="text-xs text-slate-600 font-medium pl-3 leading-relaxed">{tip.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB 2: WHEN STUCK 5-STEP FRAMEWORK */}
      {activeTab === 'when_stuck' && (
        <section className="bg-white p-6 md:p-10 rounded-[2.5rem] border-4 border-amber-500 shadow-xl space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-black uppercase tracking-wider">
              Emergency Heuristic Framework
            </span>
            <h3 className="text-2xl font-display font-black text-slate-900 mt-2">
              What to Do When a Question Looks Impossible
            </h3>
            <p className="text-xs text-slate-600 font-medium mt-1">
              Do not freeze or guess randomly. Follow this systematic 5-step problem solving loop.
            </p>
          </div>

          <div className="space-y-4">
            {SATS_EXAM_GUIDE.sections[2].tips.map((step, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-amber-50/70 border-2 border-amber-200 flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div>
                  <h4 className="font-display font-black text-amber-950 text-sm">
                    {step.heading}
                  </h4>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed mt-1">
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB 3: TIME MANAGEMENT TRAINING */}
      {activeTab === 'time_drills' && (
        <section className="bg-white p-6 md:p-8 rounded-3xl border-4 border-indigo-900 shadow-lg space-y-6">
          <div>
            <h3 className="text-xl font-display font-black text-slate-900">
              Targeted Speed & Pacing Drills
            </h3>
            <p className="text-xs text-slate-600 font-medium mt-1">
              Train your internal exam clock with short, pressurized micro-challenges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="p-6 rounded-3xl bg-indigo-50 border-2 border-indigo-200 text-center space-y-3">
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider block">Sprint Drill</span>
              <h4 className="text-2xl font-black text-slate-900">60 Seconds</h4>
              <p className="text-xs text-slate-600 font-medium">Paper 1 Arithmetic Rapid Sprint (5 questions).</p>
              <button
                onClick={() => onStartSpeedChallenge(60)}
                className="w-full py-3 bg-indigo-700 hover:bg-indigo-600 text-white font-bold text-xs uppercase rounded-xl transition-all cursor-pointer"
              >
                Launch 60s Sprint →
              </button>
            </div>

            <div className="p-6 rounded-3xl bg-purple-50 border-2 border-purple-200 text-center space-y-3">
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wider block">Power Challenge</span>
              <h4 className="text-2xl font-black text-slate-900">5 Minutes</h4>
              <p className="text-xs text-slate-600 font-medium">Mixed Arithmetic & Reasoning quick burst.</p>
              <button
                onClick={() => onStartSpeedChallenge(300)}
                className="w-full py-3 bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs uppercase rounded-xl transition-all cursor-pointer"
              >
                Launch 5m Challenge →
              </button>
            </div>

            <div className="p-6 rounded-3xl bg-emerald-50 border-2 border-emerald-200 text-center space-y-3">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">Reasoning Focus</span>
              <h4 className="text-2xl font-black text-slate-900">10 Minutes</h4>
              <p className="text-xs text-slate-600 font-medium">Multi-step word problem pacing mastery.</p>
              <button
                onClick={() => onStartSpeedChallenge(600)}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs uppercase rounded-xl transition-all cursor-pointer"
              >
                Launch 10m Drill →
              </button>
            </div>

          </div>
        </section>
      )}

    </div>
  );
}

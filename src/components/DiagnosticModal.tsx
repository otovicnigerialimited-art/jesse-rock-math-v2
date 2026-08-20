import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SMART_QUESTION_BANK } from '../data/smartQuestions';
import { DiagnosticResult, ExtendedUserStats } from '../types/extendedTypes';
import { 
  CheckCircle2, 
  XCircle, 
  Award, 
  Sparkles, 
  ArrowRight, 
  X, 
  HelpCircle,
  Brain,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveResult: (result: DiagnosticResult) => void;
}

export default function DiagnosticModal({ isOpen, onClose, onSaveResult }: DiagnosticModalProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Array<{ questionId: string; topic: string; isCorrect: boolean }>>([]);
  const [isFinished, setIsFinished] = useState(false);

  if (!isOpen) return null;

  const currentQ = SMART_QUESTION_BANK[currentIdx % SMART_QUESTION_BANK.length];

  const handleOptionSelect = (option: string) => {
    if (selectedOption !== null) return;
    setSelectedOption(option);

    const isCorrect = String(option) === String(currentQ.answer);

    setTimeout(() => {
      const nextAnswers = [...answers, { questionId: currentQ.id, topic: currentQ.topic, isCorrect }];
      setAnswers(nextAnswers);
      setSelectedOption(null);

      if (currentIdx + 1 < 6) {
        setCurrentIdx(currentIdx + 1);
      } else {
        // Diagnostic completed
        finishDiagnostic(nextAnswers);
      }
    }, 1200);
  };

  const finishDiagnostic = (allAnswers: Array<{ questionId: string; topic: string; isCorrect: boolean }>) => {
    const total = allAnswers.length;
    const correctCount = allAnswers.filter(a => a.isCorrect).length;
    const accuracyPct = Math.round((correctCount / total) * 100);

    const topicStats: Record<string, { correct: number; total: number }> = {};
    allAnswers.forEach(a => {
      if (!topicStats[a.topic]) topicStats[a.topic] = { correct: 0, total: 0 };
      topicStats[a.topic].total += 1;
      if (a.isCorrect) topicStats[a.topic].correct += 1;
    });

    const strengths: string[] = [];
    const weaknesses: string[] = [];

    Object.entries(topicStats).forEach(([top, stat]) => {
      const acc = stat.correct / stat.total;
      if (acc >= 0.7) strengths.push(top);
      else weaknesses.push(top);
    });

    let overallLevel = 1;
    let tierName = 'Rookie';
    if (accuracyPct >= 85) { overallLevel = 8; tierName = 'Math Performer'; }
    else if (accuracyPct >= 65) { overallLevel = 5; tierName = 'Rising Star'; }
    else if (accuracyPct >= 40) { overallLevel = 3; tierName = 'Garage Rockstar'; }

    const result: DiagnosticResult = {
      completedAt: Date.now(),
      overallLevel,
      tierName,
      score: correctCount,
      total,
      accuracyPct,
      domainScores: {
        Arithmetic: Math.round(((topicStats['Arithmetic']?.correct || 0) / Math.max(1, topicStats['Arithmetic']?.total || 1)) * 100),
        Fractions: Math.round(((topicStats['Fractions']?.correct || 0) / Math.max(1, topicStats['Fractions']?.total || 1)) * 100),
        Decimals: Math.round(((topicStats['Decimals']?.correct || 0) / Math.max(1, topicStats['Decimals']?.total || 1)) * 100),
        Algebra: Math.round(((topicStats['Algebra']?.correct || 0) / Math.max(1, topicStats['Algebra']?.total || 1)) * 100),
        Geometry: Math.round(((topicStats['Geometry']?.correct || 0) / Math.max(1, topicStats['Geometry']?.total || 1)) * 100)
      },
      strengths: strengths.length > 0 ? strengths : ['Arithmetic'],
      weaknesses: weaknesses.length > 0 ? weaknesses : ['Fractions']
    };

    setIsFinished(true);
    onSaveResult(result);
    confetti({ particleCount: 70, spread: 60 });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative max-w-xl w-full bg-white rounded-3xl border-4 border-indigo-900 shadow-2xl overflow-hidden p-6 md:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-900 text-amber-400 flex items-center justify-center font-bold">
              <Brain size={22} />
            </div>
            <div>
              <h3 className="font-display font-black text-slate-900 text-lg">
                Maths Ability Diagnostic Test
              </h3>
              <p className="text-xs text-slate-500 font-medium">Real-time skill calibration across 5 domains</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        {!isFinished ? (
          <div className="space-y-6">
            {/* Progress counter */}
            <div className="flex items-center justify-between text-xs font-bold text-indigo-900">
              <span>Question {currentIdx + 1} of 6</span>
              <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full uppercase tracking-wider text-[10px]">
                Domain: {currentQ.topic}
              </span>
            </div>

            {/* Question Card */}
            <div className="p-6 rounded-2xl bg-indigo-50/70 border-2 border-indigo-200 text-center space-y-3">
              <span className="text-[11px] font-extrabold uppercase text-indigo-700 tracking-wider">Skill Check</span>
              <h4 className="text-2xl font-display font-black text-slate-900">{currentQ.question}</h4>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-2 gap-3">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === opt;
                const isCorrect = String(opt) === String(currentQ.answer);

                let btnStyle = 'bg-slate-50 hover:bg-indigo-50 border-slate-200 text-slate-800';
                if (isSelected) {
                  btnStyle = isCorrect
                    ? 'bg-emerald-600 text-white border-emerald-700'
                    : 'bg-rose-600 text-white border-rose-700';
                }

                return (
                  <button
                    key={idx}
                    disabled={selectedOption !== null}
                    onClick={() => handleOptionSelect(opt)}
                    className={`p-4 rounded-2xl border-2 font-display font-black text-base transition-all flex items-center justify-center gap-2 cursor-pointer ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {isSelected && (isCorrect ? <CheckCircle2 size={18} /> : <XCircle size={18} />)}
                  </button>
                );
              })}
            </div>

            {/* Explanation box on answer select */}
            {selectedOption !== null && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-slate-700 font-medium space-y-1">
                <p className="font-bold text-amber-900">💡 Explanation & Misconception Check:</p>
                <p>{currentQ.explanation}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center space-y-6 py-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-3xl font-bold shadow-md">
              🎯
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-emerald-700 block">Diagnostic Completed!</span>
              <h4 className="text-3xl font-display font-black text-slate-900 mt-1">
                Initial Placement Calibrated
              </h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
                Your performance data has been analyzed to customize your personalized learning roadmap.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer shadow-lg"
            >
              Continue to Dashboard →
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

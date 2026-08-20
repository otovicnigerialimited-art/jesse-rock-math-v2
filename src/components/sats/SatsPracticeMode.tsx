import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SatsQuestion, SatsStudentProgress, SatsDomain } from '../../types/sats';
import { SATS_QUESTION_BANK, SATS_TOPICS, SATS_DOMAINS } from '../../data/satsData';
import { 
  Zap, 
  Brain, 
  Target, 
  Shuffle, 
  AlertCircle, 
  Check, 
  X, 
  Clock, 
  HelpCircle, 
  ArrowRight, 
  RotateCcw, 
  Edit3,
  Lightbulb,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

type PracticeModeType = 'arithmetic' | 'reasoning' | 'topic' | 'mixed' | 'weakness';

interface SatsPracticeModeProps {
  initialTopicId?: string;
  initialMistakeTag?: string;
  progress: SatsStudentProgress;
  onUpdateProgress: (updated: SatsStudentProgress) => void;
}

export default function SatsPracticeMode({
  initialTopicId,
  initialMistakeTag,
  progress,
  onUpdateProgress
}: SatsPracticeModeProps) {
  const [mode, setMode] = useState<PracticeModeType>(initialMistakeTag ? 'weakness' : initialTopicId ? 'topic' : 'arithmetic');
  const [selectedTopicId, setSelectedTopicId] = useState<string>(initialTopicId || SATS_TOPICS[0].id);

  // Active question state
  const [questions, setQuestions] = useState<SatsQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [freeTextAnswer, setFreeTextAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [sessionScore, setSessionScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Scratchpad toggle
  const [showScratchpad, setShowScratchpad] = useState(false);
  const [scratchNotes, setScratchNotes] = useState('');

  // Load questions according to selected mode
  const initQuestions = (selectedMode: PracticeModeType, topicId?: string) => {
    let pool: SatsQuestion[] = [];
    if (selectedMode === 'arithmetic') {
      pool = SATS_QUESTION_BANK.filter(q => q.paperType === 'arithmetic');
    } else if (selectedMode === 'reasoning') {
      pool = SATS_QUESTION_BANK.filter(q => q.paperType === 'reasoning');
    } else if (selectedMode === 'topic') {
      pool = SATS_QUESTION_BANK.filter(q => q.topicId === (topicId || selectedTopicId));
      if (pool.length === 0) pool = SATS_QUESTION_BANK;
    } else if (selectedMode === 'weakness') {
      const primaryWeakness = progress.weaknessTags.length > 0 ? progress.weaknessTags[0] : null;
      if (primaryWeakness) {
        pool = SATS_QUESTION_BANK.filter(q => q.mistakeTag === primaryWeakness.tag || q.topicId === primaryWeakness.associatedTopicId);
      }
      if (pool.length === 0) {
        pool = SATS_QUESTION_BANK.filter(q => q.paperType === 'reasoning');
      }
    } else {
      // Mixed
      pool = [...SATS_QUESTION_BANK].sort(() => Math.random() - 0.5);
    }

    setQuestions(pool.length > 0 ? pool : SATS_QUESTION_BANK);
    setCurrentIndex(0);
    setSelectedAnswer('');
    setFreeTextAnswer('');
    setIsSubmitted(false);
    setSessionScore(0);
    setIsFinished(false);
    setScratchNotes('');
  };

  useEffect(() => {
    initQuestions(mode, selectedTopicId);
  }, [mode, selectedTopicId]);

  const currentQ = questions[currentIndex] || questions[0];

  const handleSubmitAnswer = () => {
    if (!currentQ || isSubmitted) return;

    const answer = (currentQ.options ? selectedAnswer : freeTextAnswer).trim().toLowerCase();
    const correct = currentQ.correctAnswer.trim().toLowerCase();
    const isCorrect = answer === correct;

    setIsSubmitted(true);

    const updated = { ...progress };
    updated.totalPracticeSolved += 1;
    if (isCorrect) {
      setSessionScore(prev => prev + currentQ.marks);
      updated.totalCorrect += 1;
      updated.domainMastery[currentQ.domain] = Math.min(100, (updated.domainMastery[currentQ.domain] || 60) + 2);
    } else {
      // Record mistake tag if available
      if (currentQ.mistakeTag) {
        const existing = updated.weaknessTags.find(w => w.tag === currentQ.mistakeTag);
        if (existing) {
          existing.mistakeCount += 1;
          existing.lastDetected = Date.now();
        } else {
          updated.weaknessTags.push({
            tag: currentQ.mistakeTag,
            mistakeCount: 1,
            lastDetected: Date.now(),
            associatedTopicId: currentQ.topicId
          });
        }
      }
    }

    onUpdateProgress(updated);
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer('');
      setFreeTextAnswer('');
      setIsSubmitted(false);
    } else {
      setIsFinished(true);
      confetti({ particleCount: 70, spread: 60 });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. PRACTICE MODE PICKER */}
      <section className="bg-white p-6 rounded-3xl border-4 border-indigo-900 shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black text-emerald-700 uppercase tracking-widest block mb-1">
              Interactive Diagnostic Engine
            </span>
            <h2 className="text-2xl font-display font-black text-slate-900">
              SATs Practice Arena
            </h2>
          </div>

          {/* Mode Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { id: 'arithmetic', label: '⚡ Arithmetic', desc: 'Paper 1 drills' },
              { id: 'reasoning', label: '🧠 Reasoning', desc: 'Paper 2/3 problems' },
              { id: 'topic', label: '🎯 Topic Focus', desc: 'Single skill' },
              { id: 'mixed', label: '🔀 Mixed', desc: 'All domains' },
              { id: 'weakness', label: '🔍 Weakness Fix', desc: 'Targeted drill' }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setMode(m.id as PracticeModeType)}
                className={`p-3 rounded-2xl text-xs font-bold text-left transition-all border cursor-pointer ${
                  mode === m.id 
                    ? 'bg-indigo-900 text-white border-indigo-950 shadow-md scale-102' 
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-indigo-50'
                }`}
              >
                <div className="font-display font-black">{m.label}</div>
                <div className="text-[10px] opacity-75 font-medium">{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Topic dropdown when in topic mode */}
        {mode === 'topic' && (
          <div className="pt-2 flex items-center gap-3">
            <span className="text-xs font-bold text-slate-600">Choose Topic:</span>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="p-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-800"
            >
              {SATS_TOPICS.map(t => (
                <option key={t.id} value={t.id}>{t.title} ({t.domain})</option>
              ))}
            </select>
          </div>
        )}
      </section>

      {/* 2. QUESTION ACTIVE ARENA */}
      {!isFinished && currentQ ? (
        <section className="bg-white p-6 md:p-10 rounded-[2.5rem] border-4 border-indigo-900 shadow-xl space-y-6">
          
          {/* Header info */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1 bg-indigo-100 text-indigo-900 rounded-full text-xs font-black uppercase tracking-wider">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="text-xs font-bold text-slate-500 capitalize">
                Domain: {currentQ.domain}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowScratchpad(!showScratchpad)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  showScratchpad ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Edit3 size={13} /> {showScratchpad ? 'Hide Working Box' : 'Show Working Box'}
              </button>
              <span className="text-xs font-black bg-slate-900 text-white px-3 py-1 rounded-xl">
                {currentQ.marks} {currentQ.marks > 1 ? 'Marks' : 'Mark'}
              </span>
            </div>
          </div>

          {/* Question Text Box */}
          <div className="p-6 md:p-8 rounded-3xl bg-slate-900 text-white shadow-inner">
            <h3 className="text-xl sm:text-2xl font-bold font-sans leading-relaxed">
              {currentQ.question}
            </h3>
          </div>

          {/* Scratchpad (Working Box) */}
          {showScratchpad && (
            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-2 animate-fade-in">
              <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                <span>📝 Working-out Scratchpad (Jot your intermediate steps here)</span>
                <button onClick={() => setScratchNotes('')} className="text-amber-700 underline text-[11px]">Clear</button>
              </div>
              <textarea
                value={scratchNotes}
                onChange={(e) => setScratchNotes(e.target.value)}
                placeholder="Write your calculations here... (e.g. 15 × 4 = 60, then 60 - 12 = 48)"
                className="w-full h-24 p-3 bg-white border border-amber-200 rounded-xl text-xs font-mono text-slate-800"
              />
            </div>
          )}

          {/* Answer Interface */}
          {currentQ.options ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {currentQ.options.map(opt => {
                const isSelected = selectedAnswer === opt;
                const isCorrect = opt.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();
                return (
                  <button
                    key={opt}
                    disabled={isSubmitted}
                    onClick={() => setSelectedAnswer(opt)}
                    className={`p-5 rounded-2xl border-3 text-left font-bold text-sm transition-all cursor-pointer ${
                      isSubmitted
                        ? isCorrect
                          ? 'bg-emerald-100 border-emerald-600 text-emerald-950 shadow'
                          : isSelected
                          ? 'bg-rose-100 border-rose-600 text-rose-950'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                        : isSelected
                        ? 'bg-indigo-100 border-indigo-700 text-indigo-950 shadow-md'
                        : 'bg-white border-slate-200 hover:border-indigo-400 text-slate-800'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex gap-3">
              <input
                type="text"
                disabled={isSubmitted}
                placeholder="Type your final answer..."
                value={freeTextAnswer}
                onChange={(e) => setFreeTextAnswer(e.target.value)}
                className="p-4 border-2 border-slate-300 rounded-2xl flex-1 font-bold text-base text-slate-900"
              />
            </div>
          )}

          {/* Detailed Solution on Submission */}
          {isSubmitted && (
            <div className="p-5 rounded-2xl bg-indigo-50 border-2 border-indigo-200 space-y-2 text-xs font-medium text-slate-800 animate-fade-in leading-relaxed">
              <div className="flex items-center gap-2">
                {(currentQ.options ? selectedAnswer : freeTextAnswer).trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase() ? (
                  <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-black text-xs">✓ Correct! +{currentQ.marks} Marks</span>
                ) : (
                  <span className="px-2.5 py-1 bg-rose-600 text-white rounded-lg font-black text-xs">✗ Review Method</span>
                )}
                <span className="font-bold text-slate-700">Correct Answer: {currentQ.correctAnswer}</span>
              </div>
              <p className="pt-1">{currentQ.explanation}</p>
            </div>
          )}

          {/* Action Bar */}
          <div className="border-t border-slate-200 pt-4 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              Session Score: {sessionScore} marks
            </span>

            {!isSubmitted ? (
              <button
                disabled={!selectedAnswer && !freeTextAnswer}
                onClick={handleSubmitAnswer}
                className="px-8 py-3.5 bg-indigo-700 hover:bg-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow cursor-pointer transition-all hover:scale-105"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
              >
                Next Question <ArrowRight size={16} />
              </button>
            )}
          </div>

        </section>
      ) : (
        /* PRACTICE SESSION COMPLETE */
        <section className="p-8 md:p-12 rounded-[2.5rem] bg-white border-4 border-indigo-900 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-2xl">
            🎉
          </div>

          <h3 className="text-3xl font-display font-black text-slate-900">
            Practice Session Complete!
          </h3>

          <p className="text-sm text-slate-600 max-w-md mx-auto font-medium">
            You scored <span className="font-bold text-indigo-700">{sessionScore} marks</span> in this session. Great job keeping up the practice rhythm!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={() => initQuestions(mode, selectedTopicId)}
              className="w-full sm:w-auto px-8 py-3.5 bg-indigo-700 hover:bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow cursor-pointer transition-all"
            >
              Practice Again <RotateCcw size={14} className="inline ml-1" />
            </button>
            <button
              onClick={() => setMode('weakness')}
              className="w-full sm:w-auto px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-2xl shadow cursor-pointer transition-all"
            >
              Target Weakness Skills →
            </button>
          </div>
        </section>
      )}

    </div>
  );
}

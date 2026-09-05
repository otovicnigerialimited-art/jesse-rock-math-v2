import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  ArrowLeft, 
  Lightbulb, 
  Sparkles, 
  Flame, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  BookOpen, 
  HelpCircle, 
  Zap, 
  TrendingUp, 
  TrendingDown,
  ChevronRight,
  GraduationCap,
  Award
} from 'lucide-react';
import { 
  AdaptiveProblem, 
  AdaptiveQuizSessionState, 
  getUnlockedProblemTypesFromHub, 
  getInitialAdaptiveLevel, 
  generateAdaptiveProblem, 
  getTierInfo, 
  getLearningHubRecommendations,
  ADAPTIVE_TIERS 
} from '../lib/adaptiveQuizEngine';
import { UserStats, Lesson } from '../types';
import { playCorrectSound, playWrongSound, startBGM, stopBGM } from '../lib/audioUtils';
import confetti from 'canvas-confetti';
import { cn } from '../lib/utils';
import StrikerKeypad from './StrikerKeypad';

interface AdaptiveQuizProps {
  stats?: UserStats;
  onFinish: (score: number, total: number, xpGained: number) => void;
  onExit: () => void;
  onNavigateToLesson?: (lessonId: string) => void;
  isGuest?: boolean;
  onConvertProgress?: () => void;
  initialLesson?: Lesson;
}

export default function AdaptiveQuiz({
  stats,
  onFinish,
  onExit,
  onNavigateToLesson,
  isGuest,
  onConvertProgress,
  initialLesson
}: AdaptiveQuizProps) {
  useEffect(() => {
    startBGM();
    return () => stopBGM();
  }, []);

  // Hub-synced allowed problem types
  const unlockedTypes = React.useMemo(() => {
    if (initialLesson?.problemTypes && initialLesson.problemTypes.length > 0) {
      return initialLesson.problemTypes;
    }
    return getUnlockedProblemTypesFromHub(stats);
  }, [stats, initialLesson]);

  const initialLevel = React.useMemo(() => {
    return getInitialAdaptiveLevel(stats);
  }, [stats]);

  // Session State
  const [currentLevel, setCurrentLevel] = useState<number>(initialLevel);
  const [session, setSession] = useState<AdaptiveQuizSessionState>({
    currentLevel: initialLevel,
    consecutiveCorrect: 0,
    consecutiveWrong: 0,
    totalAnswered: 0,
    totalCorrect: 0,
    totalXP: 0,
    history: [],
    topicStats: {}
  });

  const [currentProblem, setCurrentProblem] = useState<AdaptiveProblem>(() => 
    generateAdaptiveProblem(initialLevel, unlockedTypes)
  );

  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [usedHintOnCurrent, setUsedHintOnCurrent] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const maxQuestions = 15;

  useEffect(() => {
    if (!isFinished && feedback === null) {
      inputRef.current?.focus();
    }
  }, [currentProblem, feedback, isFinished]);

  const submitAnswer = () => {
    if (userInput.trim() === '' || isEvaluating) return;
    setIsEvaluating(true);

    if (userInput.length > 30) {
      alert("Input too long! Keep your math response short.");
      setIsEvaluating(false);
      return;
    }

    const badWords = ["ignore", "override", "system prompt", "instruction", "developer role"];
    const containsInjection = badWords.some(word => userInput.toLowerCase().includes(word));
    if (containsInjection) {
      setIsEvaluating(false);
      return;
    }

    const cleanInput = userInput.trim().split(' ').join('').toLowerCase();
    const cleanAnswer = String(currentProblem.answer).trim().split(' ').join('').toLowerCase();
    const isCorrect = cleanInput === cleanAnswer;

    let nextLevel = currentLevel;
    let nextConsecutiveCorrect = session.consecutiveCorrect;
    let nextConsecutiveWrong = session.consecutiveWrong;
    let xpEarned = 0;
    let cheerMsg = '';

    const currentTopic = currentProblem.topicTitle || 'Arithmetic';
    const existingTopicStat = session.topicStats[currentTopic] || { correct: 0, total: 0 };
    const updatedTopicStat = {
      correct: existingTopicStat.correct + (isCorrect ? 1 : 0),
      total: existingTopicStat.total + 1
    };

    if (isCorrect) {
      playCorrectSound();
      setFeedback('correct');
      nextConsecutiveCorrect += 1;
      nextConsecutiveWrong = 0;
      xpEarned = 15 * currentLevel + (nextConsecutiveCorrect >= 3 ? 10 : 0);

      // Adaptive Rule: If 2 consecutive correct answers or high tier performance, INCREASE DIFFICULTY
      if (nextConsecutiveCorrect >= 2 && nextLevel < 5) {
        nextLevel += 1;
        cheerMsg = `🚀 LEVEL UP! Promoted to ${getTierInfo(nextLevel).name}!`;
        confetti({
          particleCount: 25,
          spread: 45,
          origin: { y: 0.6 },
          colors: ['#00e676', '#fbbf24', '#38bdf8']
        });
      } else {
        const funTags = [
          "⚽ Sharp Striker calculation!",
          "🧠 Flawless math execution!",
          "⚡ Speed and accuracy combo!",
          "🌟 On target!",
          "🔥 Unstoppable streak!"
        ];
        cheerMsg = funTags[Math.floor(Math.random() * funTags.length)];
      }
    } else {
      playWrongSound();
      setFeedback('wrong');
      nextConsecutiveWrong += 1;
      nextConsecutiveCorrect = 0;

      // Adaptive Rule: If wrong, adjust difficulty downward or unlock hint
      if (nextLevel > 1) {
        nextLevel -= 1;
        cheerMsg = `💡 Difficulty adjusted to ${getTierInfo(nextLevel).name}. Check the hint breakdown below!`;
      } else {
        cheerMsg = `💡 Let's learn from this! Review the hint steps below.`;
      }
      setShowHint(true);
    }

    setFeedbackMessage(cheerMsg);
    setCurrentLevel(nextLevel);

    const updatedSession: AdaptiveQuizSessionState = {
      currentLevel: nextLevel,
      consecutiveCorrect: nextConsecutiveCorrect,
      consecutiveWrong: nextConsecutiveWrong,
      totalAnswered: session.totalAnswered + 1,
      totalCorrect: session.totalCorrect + (isCorrect ? 1 : 0),
      totalXP: session.totalXP + xpEarned,
      history: [
        ...session.history,
        {
          problem: currentProblem,
          userAnswer: userInput,
          isCorrect,
          level: currentLevel,
          usedHint: usedHintOnCurrent || showHint
        }
      ],
      topicStats: {
        ...session.topicStats,
        [currentTopic]: updatedTopicStat
      }
    };

    setSession(updatedSession);

    // If answer is incorrect, give a brief moment for the learner to see the hint and explanation
    const delay = isCorrect ? 900 : 1600;

    setTimeout(() => {
      if (updatedSession.totalAnswered >= maxQuestions) {
        setIsFinished(true);
        onFinish(updatedSession.totalCorrect, maxQuestions, updatedSession.totalXP);
      } else {
        setFeedback(null);
        setFeedbackMessage(null);
        setUserInput('');
        setShowHint(false);
        setUsedHintOnCurrent(false);
        setCurrentProblem(generateAdaptiveProblem(nextLevel, unlockedTypes));
      }
      setIsEvaluating(false);
    }, delay);
  };

  const handleRequestSimpler = () => {
    const simplerLevel = Math.max(1, currentLevel - 1);
    setCurrentLevel(simplerLevel);
    setCurrentProblem(generateAdaptiveProblem(simplerLevel, unlockedTypes, true));
    setUserInput('');
    setShowHint(false);
    setUsedHintOnCurrent(true);
    setFeedbackMessage("Switched to a gentler warmup problem! Give it a shot! 🌟");
    setTimeout(() => setFeedbackMessage(null), 2500);
  };

  // Keyboard navigation & inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFinished || feedback !== null || e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        submitAnswer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [userInput, isFinished, feedback, isEvaluating, currentProblem]);

  const currentTier = getTierInfo(currentLevel);
  const accuracyPercent = session.totalAnswered > 0 
    ? Math.round((session.totalCorrect / session.totalAnswered) * 100) 
    : 0;

  // Render Quiz Summary Screen
  if (isFinished) {
    const recommendations = getLearningHubRecommendations(session.topicStats);

    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in text-deep-navy">
        {/* Header Ribbon */}
        <div className="flex items-center justify-between">
          <button
            onClick={onExit}
            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-deep-navy rounded-xl text-deep-navy font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
          >
            <ArrowLeft size={16} /> Exit to Hub
          </button>
          <div className="flex items-center gap-2 px-4 py-1.5 bg-brand-secondary/20 border-2 border-deep-navy rounded-full">
            <GraduationCap size={16} className="text-brand-secondary" />
            <span className="text-xs font-black text-deep-navy uppercase tracking-wider">Adaptive Mastery Report</span>
          </div>
        </div>

        {/* Hero Card */}
        <div className="glass p-6 md:p-8 rounded-[2.5rem] border-4 border-deep-navy bg-clean-white shadow-xl text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-sunny-yellow border-4 border-deep-navy flex items-center justify-center text-4xl shadow-md animate-bounce">
            🏆
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-display font-black text-deep-navy">
              Adaptive Drill Complete!
            </h2>
            <p className="text-sm font-medium text-slate-600 max-w-md mx-auto leading-relaxed">
              Your math questions dynamically adapted based on your Learning Hub progress and live responses.
            </p>
          </div>

          {/* Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="p-4 bg-sunny-yellow/15 border-2 border-deep-navy rounded-2xl">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Score</span>
              <span className="text-2xl font-black text-deep-navy font-display">{session.totalCorrect} / {maxQuestions}</span>
            </div>
            <div className="p-4 bg-emerald-500/10 border-2 border-deep-navy rounded-2xl">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block">Accuracy</span>
              <span className="text-2xl font-black text-emerald-700 font-display">{accuracyPercent}%</span>
            </div>
            <div className="p-4 bg-sky-500/10 border-2 border-deep-navy rounded-2xl">
              <span className="text-[10px] font-black uppercase tracking-wider text-sky-700 block">Peak Tier</span>
              <span className="text-xl font-black text-sky-700 font-display">{currentTier.name}</span>
            </div>
            <div className="p-4 bg-amber-500/10 border-2 border-deep-navy rounded-2xl">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 block">XP Gained</span>
              <span className="text-2xl font-black text-amber-800 font-display">+{session.totalXP} XP</span>
            </div>
          </div>

          {/* Difficulty Progression Map */}
          <div className="p-5 bg-slate-50 border-2 border-deep-navy rounded-2xl text-left space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-deep-navy flex items-center gap-1.5">
                <TrendingUp size={14} className="text-brand-secondary" /> Dynamic Difficulty Timeline
              </h4>
              <span className="text-[10px] font-bold text-slate-500">15 Adaptive Questions</span>
            </div>

            <div className="flex items-end gap-1.5 h-16 pt-2 overflow-x-auto scrollbar-none">
              {session.history.map((h, idx) => {
                const heightPercent = (h.level / 5) * 100;
                return (
                  <div key={idx} className="flex-1 min-w-[20px] flex flex-col items-center gap-1 group relative">
                    <div 
                      style={{ height: `${heightPercent}%` }} 
                      className={cn(
                        "w-full rounded-t-md transition-all duration-300 border border-deep-navy",
                        h.isCorrect ? "bg-emerald-500 shadow-sm" : "bg-rose-400"
                      )}
                    />
                    <span className="text-[9px] font-bold text-slate-500">{idx + 1}</span>

                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:block z-20 bg-slate-900 text-white text-[10px] p-2 rounded-lg whitespace-nowrap shadow-lg">
                      <p className="font-bold">{h.problem.question} = {h.problem.answer}</p>
                      <p className="text-slate-300">Your Answer: {h.userAnswer} ({h.isCorrect ? 'Correct ✅' : 'Incorrect ❌'})</p>
                      <p className="text-amber-300">Tier {h.level}: {getTierInfo(h.level).name}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Personalized Learning Hub Next Steps */}
          <div className="p-5 bg-sunny-yellow/20 border-2 border-deep-navy rounded-2xl text-left space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen size={18} className="text-brand-secondary" />
              <h4 className="text-sm font-black text-deep-navy">Learning Hub Recommendations</h4>
            </div>
            <div className="grid gap-2">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="p-3 bg-white border border-deep-navy/30 rounded-xl flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <h5 className="text-xs font-black text-deep-navy">{rec.title}</h5>
                    <p className="text-[11px] text-slate-600">{rec.reason}</p>
                  </div>
                  {onNavigateToLesson && (
                    <button
                      onClick={() => onNavigateToLesson(rec.lessonId)}
                      className="px-3 py-1.5 bg-brand-secondary hover:bg-brand-secondary/90 text-deep-navy font-bold text-[10px] rounded-lg uppercase tracking-wider border border-deep-navy transition-all shrink-0 cursor-pointer"
                    >
                      Study Topic <ChevronRight size={10} className="inline ml-0.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setSession({
                  currentLevel: initialLevel,
                  consecutiveCorrect: 0,
                  consecutiveWrong: 0,
                  totalAnswered: 0,
                  totalCorrect: 0,
                  totalXP: 0,
                  history: [],
                  topicStats: {}
                });
                setCurrentLevel(initialLevel);
                setCurrentProblem(generateAdaptiveProblem(initialLevel, unlockedTypes));
                setIsFinished(false);
                setUserInput('');
                setShowHint(false);
              }}
              className="w-full sm:w-auto px-6 py-3.5 bg-brand-secondary hover:bg-brand-secondary/90 text-deep-navy font-black text-xs uppercase tracking-widest rounded-2xl border-2 border-deep-navy shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} /> Retake Adaptive Drill
            </button>
            <button
              onClick={onExit}
              className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-100 text-deep-navy font-black text-xs uppercase tracking-widest rounded-2xl border-2 border-deep-navy shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <BookOpen size={16} /> Return to Learning Hub
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Quiz View
  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-8 animate-fade-in text-deep-navy">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-2 sm:px-0">
        <button
          onClick={onExit}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/70 hover:bg-white border-2 border-deep-navy rounded-xl text-deep-navy font-bold text-xs transition-all cursor-pointer shadow-sm"
        >
          <ArrowLeft size={14} /> Exit
        </button>

        {/* Dynamic Tier Badge */}
        <div className={cn("px-4 py-1.5 rounded-full border-2 border-deep-navy font-black text-xs uppercase tracking-wider shadow-sm flex items-center gap-2", currentTier.bg)}>
          <span className="animate-pulse">{currentTier.badge}</span>
        </div>

        {/* Streak & Question Counter */}
        <div className="flex items-center gap-3">
          {session.consecutiveCorrect > 1 && (
            <div className="flex items-center gap-1 px-3 py-1 bg-amber-500 text-white rounded-full font-black text-xs border border-deep-navy shadow-sm animate-bounce">
              <Flame size={14} className="fill-white" />
              <span>{session.consecutiveCorrect}x Streak</span>
            </div>
          )}
          <span className="text-xs font-black text-deep-navy bg-white px-3 py-1.5 rounded-xl border-2 border-deep-navy">
            Q {session.totalAnswered + 1} / {maxQuestions}
          </span>
        </div>
      </div>

      {/* Adaptive Progression Meter */}
      <div className="p-3 bg-clean-white border-4 border-deep-navy rounded-2xl shadow-md space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-extrabold text-deep-navy flex items-center gap-1.5">
            <Zap size={14} className="text-brand-secondary" /> Adaptive Difficulty Meter:
          </span>
          <span className="font-bold text-slate-600">
            Current Tier: <strong className={currentTier.color}>{currentTier.name} (Level {currentLevel}/5)</strong>
          </span>
        </div>

        <div className="grid grid-cols-5 gap-1.5 h-3 bg-slate-100 p-0.5 rounded-lg border border-deep-navy/30">
          {ADAPTIVE_TIERS.map((tier) => {
            const isActive = tier.level <= currentLevel;
            return (
              <div 
                key={tier.level}
                className={cn(
                  "rounded transition-all duration-300",
                  isActive ? "bg-brand-secondary border border-deep-navy" : "bg-slate-200"
                )}
              />
            );
          })}
        </div>
      </div>

      {/* Dynamic Feedback Toast */}
      <AnimatePresence>
        {feedbackMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "p-3 rounded-2xl border-2 border-deep-navy text-center text-xs font-black uppercase tracking-wider shadow-md",
              feedback === 'correct' ? "bg-emerald-100 text-emerald-900 border-emerald-500" : "bg-amber-100 text-amber-950 border-amber-500"
            )}
          >
            {feedbackMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Math Question Card */}
      <div className="glass p-6 sm:p-8 rounded-[2.5rem] border-4 border-deep-navy bg-clean-white shadow-xl relative space-y-6">
        {/* Topic Tag */}
        <div className="flex items-center justify-between border-b-2 border-deep-navy/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-secondary animate-ping" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-600">{currentProblem.topicTitle}</span>
          </div>
          <button
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-1 px-3 py-1 rounded-xl bg-sunny-yellow/20 hover:bg-sunny-yellow/40 border border-deep-navy text-xs font-bold text-deep-navy transition-all cursor-pointer"
          >
            <Lightbulb size={14} className="text-amber-500" />
            <span>{showHint ? 'Hide Hint' : 'Need a Hint?'}</span>
          </button>
        </div>

        {/* Problem Display */}
        <div className="text-center py-4 space-y-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Solve the equation</span>
          <div className="text-4xl sm:text-5xl md:text-6xl font-black font-display text-deep-navy tracking-tight select-none">
            {currentProblem.question}
          </div>
        </div>

        {/* Interactive Hint Panel */}
        <AnimatePresence>
          {showHint && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-sunny-yellow/15 border-2 border-deep-navy rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black text-deep-navy">
                    <Lightbulb size={16} className="text-amber-500" />
                    <span>Step-by-Step Hint & Guidance:</span>
                  </div>
                  <button
                    onClick={handleRequestSimpler}
                    className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-white hover:bg-slate-100 rounded-lg border border-deep-navy text-deep-navy transition-all cursor-pointer"
                  >
                    🔄 Try Simpler Problem
                  </button>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  {currentProblem.hint}
                </p>
                {currentProblem.steps && currentProblem.steps.length > 0 && (
                  <div className="space-y-1 pt-1 border-t border-deep-navy/10">
                    <span className="text-[10px] font-bold uppercase text-slate-500">Breakdown:</span>
                    <ul className="text-xs space-y-0.5 list-disc pl-4 text-slate-700">
                      {currentProblem.steps.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Area */}
        <form 
          onSubmit={(e) => { e.preventDefault(); submitAnswer(); }}
          className="space-y-4 max-w-sm mx-auto"
        >
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Your answer..."
              disabled={isEvaluating}
              className={cn(
                "w-full text-center text-3xl font-black font-mono py-3.5 px-4 rounded-2xl border-4 outline-none transition-all",
                feedback === 'correct' 
                  ? "border-emerald-500 bg-emerald-50 text-emerald-800" 
                  : feedback === 'wrong'
                  ? "border-rose-500 bg-rose-50 text-rose-800"
                  : "border-deep-navy bg-slate-50 text-deep-navy focus:bg-white focus:shadow-md"
              )}
            />
          </div>

          <button
            type="submit"
            disabled={userInput.trim() === '' || isEvaluating}
            className={cn(
              "w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest border-2 border-deep-navy shadow-md transition-all cursor-pointer flex items-center justify-center gap-2",
              userInput.trim() !== '' && !isEvaluating
                ? "bg-brand-secondary hover:bg-brand-secondary/90 text-deep-navy active:scale-95"
                : "bg-slate-200 text-slate-400 cursor-not-allowed border-slate-300"
            )}
          >
            Submit Answer <ArrowRight size={16} />
          </button>
        </form>

        {/* Striker On-Screen Keypad for touch/mobile devices */}
        <div className="pt-2">
          <StrikerKeypad
            value={userInput}
            onChange={(val) => setUserInput(val)}
            onSubmit={submitAnswer}
          />
        </div>
      </div>
    </div>
  );
}

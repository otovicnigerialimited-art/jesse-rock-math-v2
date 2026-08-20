import React, { useState } from 'react';
import { motion } from 'motion/react';
import { getDueSpacedItems, updateSpacedItem, INITIAL_SPACED_SKILLS } from '../lib/spacedRepetition';
import { ExtendedUserStats, SpacedItem } from '../types/extendedTypes';
import { generateProblem } from '../lib/mathUtils';
import { Problem } from '../types';
import { 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  ArrowRight,
  Brain
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SpacedPracticeViewProps {
  stats: ExtendedUserStats;
  onUpdateStats: (updated: ExtendedUserStats) => void;
  onExit: () => void;
}

export default function SpacedPracticeView({ stats, onUpdateStats, onExit }: SpacedPracticeViewProps) {
  const dueItems = getDueSpacedItems(stats.spacedItems);
  const activeSkill = dueItems.length > 0 ? dueItems[0] : { skillId: 'addition', skillName: 'Addition & Carrying', category: 'Arithmetic', box: 1, lastReviewedAt: Date.now(), nextReviewDueAt: Date.now(), consecutiveCorrect: 0 };

  const [problem, setProblem] = useState<Problem>(() => generateProblem('medium', [activeSkill.skillId as any]));
  const [userAns, setUserAns] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [solvedCount, setSolvedCount] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAns.trim() || feedback !== null) return;

    const isCorrect = String(userAns.trim()) === String(problem.answer);
    setFeedback(isCorrect ? 'correct' : 'incorrect');

    if (isCorrect) {
      confetti({ particleCount: 30, spread: 40 });
    }

    setTimeout(() => {
      // Update spaced repetition item box
      const currentMap = stats.spacedItems || {};
      const updatedItem = updateSpacedItem(
        currentMap[activeSkill.skillId],
        activeSkill.skillId,
        activeSkill.skillName,
        activeSkill.category,
        isCorrect
      );

      const nextMap = {
        ...currentMap,
        [activeSkill.skillId]: updatedItem
      };

      const updatedStats: ExtendedUserStats = {
        ...stats,
        spacedItems: nextMap,
        totalSolved: stats.totalSolved + 1,
        correctAnswers: isCorrect ? stats.correctAnswers + 1 : stats.correctAnswers,
        xp: isCorrect ? stats.xp + 20 : stats.xp
      };

      onUpdateStats(updatedStats);
      setSolvedCount(solvedCount + 1);
      setUserAns('');
      setFeedback(null);
      setProblem(generateProblem('medium', [activeSkill.skillId as any]));
    }, 1200);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in p-4 sm:p-6">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white border-4 border-indigo-900 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-black uppercase tracking-wider">
            Spaced Repetition Review
          </span>
          <button onClick={onExit} className="text-xs font-bold text-slate-500 hover:text-slate-800 underline">
            Exit Review
          </button>
        </div>
        <h3 className="text-2xl font-display font-black text-slate-900">
          {activeSkill.skillName}
        </h3>
        <p className="text-xs text-slate-500 font-medium">
          Reinforcing formulas into long-term memory to prevent decay.
        </p>
      </div>

      {/* Problem Card */}
      <div className="p-8 rounded-3xl bg-indigo-900 text-white border-4 border-indigo-700 shadow-xl text-center space-y-6">
        <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest block">Solve Question</span>
        <h2 className="text-4xl sm:text-5xl font-display font-black text-white">{problem.question}</h2>

        <form onSubmit={handleSubmit} className="max-w-sm mx-auto space-y-4">
          <input 
            type="text"
            value={userAns}
            onChange={(e) => setUserAns(e.target.value)}
            placeholder="Type answer..."
            disabled={feedback !== null}
            className="w-full text-center py-4 bg-white text-slate-900 border-4 border-amber-400 rounded-2xl font-display font-black text-2xl outline-none focus:ring-4 ring-amber-300"
          />

          <button
            type="submit"
            disabled={feedback !== null || !userAns.trim()}
            className="w-full py-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-lg transition-all cursor-pointer"
          >
            Submit Answer →
          </button>
        </form>

        {feedback === 'correct' && (
          <div className="p-3 bg-emerald-500 text-white font-black text-sm rounded-xl animate-bounce">
            ✓ Correct! Box interval updated.
          </div>
        )}
        {feedback === 'incorrect' && (
          <div className="p-3 bg-rose-500 text-white font-black text-sm rounded-xl">
            ✗ Correct answer was: {problem.answer}
          </div>
        )}
      </div>

    </div>
  );
}

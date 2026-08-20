import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  SatsQuestion, 
  SatsStudentProgress, 
  MockTestResult, 
  SatsDomain 
} from '../../types/sats';
import { SATS_QUESTION_BANK, SATS_TOPICS, SATS_DOMAINS } from '../../data/satsData';
import { 
  Trophy, 
  Clock, 
  Flag, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  Play, 
  RotateCcw, 
  FileText,
  Award,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SatsMockTestsProps {
  progress: SatsStudentProgress;
  onUpdateProgress: (updated: SatsStudentProgress) => void;
  onNavigateToTopic: (topicId: string) => void;
}

export default function SatsMockTests({
  progress,
  onUpdateProgress,
  onNavigateToTopic
}: SatsMockTestsProps) {
  const [selectedPaper, setSelectedPaper] = useState<'arithmetic' | 'reasoning' | 'full_mixed'>('arithmetic');
  const [isExamActive, setIsExamActive] = useState(false);
  const [examQuestions, setExamQuestions] = useState<SatsQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  
  // User answers & flagged questions
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [flaggedIds, setFlaggedIds] = useState<Record<string, boolean>>({});

  // Timer
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(1800); // 30 mins
  const [timerActive, setTimerActive] = useState(false);
  const [examStartTime, setExamStartTime] = useState(0);

  // Result display
  const [latestResult, setLatestResult] = useState<MockTestResult | null>(null);

  // Start exam
  const handleStartExam = (paperType: 'arithmetic' | 'reasoning' | 'full_mixed') => {
    setSelectedPaper(paperType);
    let questions: SatsQuestion[] = [];
    let durationSeconds = 1800; // default 30 mins

    if (paperType === 'arithmetic') {
      questions = SATS_QUESTION_BANK.filter(q => q.paperType === 'arithmetic');
      durationSeconds = 1800; // 30 mins
    } else if (paperType === 'reasoning') {
      questions = SATS_QUESTION_BANK.filter(q => q.paperType === 'reasoning');
      durationSeconds = 2400; // 40 mins
    } else {
      questions = [...SATS_QUESTION_BANK].sort(() => Math.random() - 0.5);
      durationSeconds = 2700; // 45 mins
    }

    setExamQuestions(questions);
    setCurrentIdx(0);
    setUserAnswers({});
    setFlaggedIds({});
    setTimeRemainingSeconds(durationSeconds);
    setTimerActive(true);
    setExamStartTime(Date.now());
    setIsExamActive(true);
    setLatestResult(null);
  };

  // Timer effect
  useEffect(() => {
    if (!isExamActive || !timerActive) return;

    const interval = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isExamActive, timerActive]);

  const handleToggleFlag = (id: string) => {
    setFlaggedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleFinishExam = () => {
    setTimerActive(false);
    setIsExamActive(false);
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });

    // Calculate score
    let score = 0;
    let totalMarks = 0;
    const domainScores: Record<string, { correct: number; total: number }> = {};
    const weaknessTags: string[] = [];

    const answerLogs = examQuestions.map(q => {
      const uAns = (userAnswers[q.id] || '').trim().toLowerCase();
      const cAns = q.correctAnswer.trim().toLowerCase();
      const isCorrect = uAns === cAns;

      totalMarks += q.marks;
      if (!domainScores[q.domain]) {
        domainScores[q.domain] = { correct: 0, total: 0 };
      }
      domainScores[q.domain].total += q.marks;

      if (isCorrect) {
        score += q.marks;
        domainScores[q.domain].correct += q.marks;
      } else if (q.mistakeTag) {
        weaknessTags.push(q.mistakeTag);
      }

      return {
        questionId: q.id,
        questionText: q.question,
        domain: q.domain,
        userAnswer: userAnswers[q.id] || 'Not answered',
        correctAnswer: q.correctAnswer,
        isCorrect,
        marksAwarded: isCorrect ? q.marks : 0,
        maxMarks: q.marks
      };
    });

    const percentage = Math.round((score / Math.max(1, totalMarks)) * 100);
    const timeSpentSeconds = Math.round((Date.now() - examStartTime) / 1000);

    const strongDomains: SatsDomain[] = [];
    const weakDomains: SatsDomain[] = [];

    Object.entries(domainScores).forEach(([dom, data]) => {
      const pct = (data.correct / data.total) * 100;
      if (pct >= 75) strongDomains.push(dom as SatsDomain);
      else weakDomains.push(dom as SatsDomain);
    });

    // Recommend focus topic
    let recommendedTopicId = 'topic_equivalent_fractions';
    if (weakDomains.length > 0) {
      const weakDomain = weakDomains[0];
      const match = SATS_TOPICS.find(t => t.domain === weakDomain);
      if (match) recommendedTopicId = match.id;
    }

    const result: MockTestResult = {
      id: `mock_${Date.now()}`,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      timestamp: Date.now(),
      paperType: selectedPaper === 'full_mixed' ? 'mixed' : selectedPaper,
      paperName: selectedPaper === 'arithmetic' ? 'KS2 Paper 1: Arithmetic Mock' : selectedPaper === 'reasoning' ? 'KS2 Paper 2: Reasoning Mock' : 'Full KS2 Mixed Mock',
      totalQuestions: examQuestions.length,
      score,
      percentage,
      timeSpentSeconds,
      strongDomains,
      weakDomains,
      weaknessTags,
      recommendedFocusTopicId: recommendedTopicId,
      answers: answerLogs
    };

    setLatestResult(result);

    // Save into student progress
    const updated: SatsStudentProgress = { 
      ...progress,
      mockHistory: [...(progress?.mockHistory || []), result],
      domainMastery: { ...progress.domainMastery }
    };
    // update domain masteries
    strongDomains.forEach(d => {
      updated.domainMastery[d] = Math.min(100, (updated.domainMastery[d] || 60) + 5);
    });
    onUpdateProgress(updated);
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const currentQ = examQuestions[currentIdx];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* EXAM LOBBY (WHEN NOT IN ACTIVE EXAM AND NO RESULT DISPLAYED) */}
      {!isExamActive && !latestResult && (
        <div className="space-y-6">
          <section className="bg-white p-6 md:p-8 rounded-3xl border-4 border-indigo-900 shadow-lg space-y-4">
            <div>
              <span className="text-xs font-black text-purple-700 uppercase tracking-widest block mb-1">
                Authentic Standardized Test Simulator
              </span>
              <h2 className="text-3xl font-display font-black text-slate-900">
                KS2 SATs Mock Exams
              </h2>
              <p className="text-xs text-slate-600 font-medium max-w-xl mt-1">
                Experience realistic exam conditions, manage your time effectively, and receive actionable diagnostic breakdowns of your strengths and revision targets.
              </p>
            </div>

            {/* Paper Selection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              
              {/* Paper 1 Arithmetic */}
              <div className="p-6 rounded-3xl bg-indigo-50 border-3 border-indigo-300 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-all">
                <div>
                  <span className="px-3 py-1 bg-indigo-200 text-indigo-900 rounded-full text-xs font-black uppercase tracking-wider">
                    Paper 1
                  </span>
                  <h3 className="text-xl font-display font-black text-indigo-950 mt-2">
                    Arithmetic Mock
                  </h3>
                  <p className="text-xs text-slate-600 font-medium mt-1">
                    30 minutes • Rapid calculations, long multiplication, fractions & percentages.
                  </p>
                </div>
                <button
                  onClick={() => handleStartExam('arithmetic')}
                  className="w-full py-3.5 bg-indigo-700 hover:bg-indigo-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
                >
                  <Play size={14} /> Start Paper 1 Mock
                </button>
              </div>

              {/* Paper 2 & 3 Reasoning */}
              <div className="p-6 rounded-3xl bg-purple-50 border-3 border-purple-300 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-all">
                <div>
                  <span className="px-3 py-1 bg-purple-200 text-purple-900 rounded-full text-xs font-black uppercase tracking-wider">
                    Paper 2 & 3
                  </span>
                  <h3 className="text-xl font-display font-black text-purple-950 mt-2">
                    Reasoning Mock
                  </h3>
                  <p className="text-xs text-slate-600 font-medium mt-1">
                    40 minutes • Real-world word problems, geometry, ratios, algebra & charts.
                  </p>
                </div>
                <button
                  onClick={() => handleStartExam('reasoning')}
                  className="w-full py-3.5 bg-purple-700 hover:bg-purple-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
                >
                  <Play size={14} /> Start Reasoning Mock
                </button>
              </div>

              {/* Full Diagnostic Combined */}
              <div className="p-6 rounded-3xl bg-amber-50 border-3 border-amber-300 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-all">
                <div>
                  <span className="px-3 py-1 bg-amber-200 text-amber-900 rounded-full text-xs font-black uppercase tracking-wider">
                    Full Diagnostic
                  </span>
                  <h3 className="text-xl font-display font-black text-amber-950 mt-2">
                    Complete KS2 Mock
                  </h3>
                  <p className="text-xs text-slate-600 font-medium mt-1">
                    45 minutes • Comprehensive assessment across all 8 curriculum domains.
                  </p>
                </div>
                <button
                  onClick={() => handleStartExam('full_mixed')}
                  className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
                >
                  <Play size={14} /> Start Full Assessment
                </button>
              </div>

            </div>
          </section>

          {/* Previous Mock History Table */}
          {progress.mockHistory.length > 0 && (
            <section className="bg-white p-6 rounded-3xl border-4 border-indigo-900/40 shadow-lg space-y-4">
              <h3 className="text-lg font-display font-black text-slate-900 flex items-center gap-2">
                <FileText size={18} className="text-indigo-600" /> Past Mock Exam Attempts
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-medium">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold">
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Paper</th>
                      <th className="pb-3">Score</th>
                      <th className="pb-3">Accuracy</th>
                      <th className="pb-3">Focus Needed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {progress.mockHistory.map(mock => (
                      <tr key={mock.id} className="text-slate-800">
                        <td className="py-3 font-bold">{mock.date}</td>
                        <td className="py-3">{mock.paperName}</td>
                        <td className="py-3 font-bold">{mock.score} / {mock.totalQuestions}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full font-black text-[11px] ${
                            mock.percentage >= 80 ? 'bg-emerald-100 text-emerald-800' : mock.percentage >= 60 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {mock.percentage}%
                          </span>
                        </td>
                        <td className="py-3 capitalize text-indigo-700 font-bold">
                          {mock.weakDomains.length > 0 ? mock.weakDomains.join(', ') : 'None - Excellent!'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      )}

      {/* ACTIVE EXAM SIMULATION */}
      {isExamActive && currentQ && (
        <section className="bg-white p-6 md:p-10 rounded-[2.5rem] border-4 border-indigo-950 shadow-2xl space-y-6">
          
          {/* Top Exam Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1 bg-slate-900 text-white rounded-full text-xs font-black uppercase tracking-wider">
                Question {currentIdx + 1} of {examQuestions.length}
              </span>
              <button
                onClick={() => handleToggleFlag(currentQ.id)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  flaggedIds[currentQ.id] ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Flag size={13} /> {flaggedIds[currentQ.id] ? 'Flagged for Review' : 'Flag for Review'}
              </button>
            </div>

            {/* Exam Clock */}
            <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-4 py-2 rounded-2xl">
              <Clock size={16} className={timeRemainingSeconds < 300 ? 'text-rose-600 animate-pulse' : 'text-indigo-700'} />
              <span className={`text-sm font-black font-mono ${timeRemainingSeconds < 300 ? 'text-rose-600' : 'text-indigo-950'}`}>
                {formatTimer(timeRemainingSeconds)}
              </span>
            </div>
          </div>

          {/* Question Grid Navigator */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin-custom">
            {examQuestions.map((q, idx) => {
              const isAnswered = !!userAnswers[q.id];
              const isFlagged = !!flaggedIds[q.id];
              const isSelected = currentIdx === idx;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIdx(idx)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center justify-center cursor-pointer border ${
                    isSelected
                      ? 'bg-slate-950 text-white border-slate-950 shadow-md scale-110'
                      : isFlagged
                      ? 'bg-amber-300 text-amber-950 border-amber-400'
                      : isAnswered
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Question Box */}
          <div className="p-6 md:p-8 rounded-3xl bg-slate-900 text-white space-y-2">
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider block">
              KS2 Examination Paper • [{currentQ.marks} {currentQ.marks > 1 ? 'Marks' : 'Mark'}]
            </span>
            <p className="text-xl sm:text-2xl font-bold font-sans leading-relaxed">
              {currentQ.question}
            </p>
          </div>

          {/* Answering Options */}
          {currentQ.options ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {currentQ.options.map(opt => (
                <button
                  key={opt}
                  onClick={() => setUserAnswers(prev => ({ ...prev, [currentQ.id]: opt }))}
                  className={`p-5 rounded-2xl border-3 text-left font-bold text-sm transition-all cursor-pointer ${
                    userAnswers[currentQ.id] === opt 
                      ? 'bg-indigo-100 border-indigo-700 text-indigo-950 shadow' 
                      : 'bg-white border-slate-200 hover:border-indigo-400 text-slate-800'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <input
              type="text"
              placeholder="Type your final calculation answer here..."
              value={userAnswers[currentQ.id] || ''}
              onChange={(e) => setUserAnswers(prev => ({ ...prev, [currentQ.id]: e.target.value }))}
              className="w-full p-4 border-2 border-slate-300 rounded-2xl font-bold text-base text-slate-900"
            />
          )}

          {/* Navigation & Submit Controls */}
          <div className="border-t border-slate-200 pt-6 flex items-center justify-between">
            <button
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx(prev => prev - 1)}
              className="px-5 py-3 rounded-2xl border-2 border-slate-300 font-bold text-xs uppercase text-slate-700 disabled:opacity-30 flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft size={16} /> Previous
            </button>

            {currentIdx + 1 < examQuestions.length ? (
              <button
                onClick={() => setCurrentIdx(prev => prev + 1)}
                className="px-7 py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow flex items-center gap-1.5 cursor-pointer"
              >
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleFinishExam}
                className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg cursor-pointer transition-all hover:scale-105"
              >
                Finish & Grade Paper 🎓
              </button>
            )}
          </div>

        </section>
      )}

      {/* POST-MOCK DIAGNOSTIC RESULTS SCREEN */}
      {latestResult && (
        <section className="bg-white p-6 md:p-10 rounded-[2.5rem] border-4 border-indigo-900 shadow-2xl space-y-8 animate-fade-in">
          
          {/* Header Banner */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-950 to-slate-900 text-white text-center space-y-3">
            <span className="px-3.5 py-1 bg-amber-400 text-slate-950 rounded-full text-xs font-black uppercase tracking-widest inline-block">
              MOCK TEST COMPLETE 🎉
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-black text-white">
              {latestResult.paperName}
            </h2>
            <div className="flex items-center justify-center gap-6 pt-4">
              <div>
                <span className="text-xs text-indigo-300 uppercase block font-bold">Total Score</span>
                <span className="text-3xl font-black text-white">{latestResult.score} / {latestResult.totalQuestions}</span>
              </div>
              <div className="h-10 w-px bg-white/20" />
              <div>
                <span className="text-xs text-emerald-300 uppercase block font-bold">Accuracy</span>
                <span className="text-3xl font-black text-emerald-300">{latestResult.percentage}%</span>
              </div>
            </div>
          </div>

          {/* Diagnostic Breakdown: Strengths & Growth Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Strong Areas */}
            <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 space-y-2">
              <h4 className="font-display font-black text-emerald-950 text-sm uppercase flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" /> Strong Areas (🟢)
              </h4>
              {latestResult.strongDomains.length > 0 ? (
                <ul className="text-xs font-bold text-emerald-900 space-y-1">
                  {latestResult.strongDomains.map(d => (
                    <li key={d} className="capitalize">✓ {d}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-emerald-800">Keep practising across all topics to build consistency.</p>
              )}
            </div>

            {/* Areas to Improve */}
            <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-2">
              <h4 className="font-display font-black text-amber-950 text-sm uppercase flex items-center gap-2">
                <AlertCircle size={16} className="text-amber-600" /> Areas to Improve (🟠)
              </h4>
              {latestResult.weakDomains.length > 0 ? (
                <ul className="text-xs font-bold text-amber-900 space-y-1">
                  {latestResult.weakDomains.map(d => (
                    <li key={d} className="capitalize">• {d}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-amber-800">Outstanding accuracy across all assessed domains!</p>
              )}
            </div>

          </div>

          {/* Targeted Recommendation Callout */}
          <div className="p-6 rounded-3xl bg-indigo-50 border-3 border-indigo-300 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-black uppercase text-indigo-700 tracking-wider">
                🎯 Personalised Recommendation
              </span>
              <h4 className="text-lg font-display font-black text-slate-900 mt-1">
                Your next revision should focus on {SATS_TOPICS.find(t => t.id === latestResult.recommendedFocusTopicId)?.title || 'Fractions'}.
              </h4>
            </div>

            <button
              onClick={() => onNavigateToTopic(latestResult.recommendedFocusTopicId)}
              className="w-full sm:w-auto px-7 py-3.5 bg-indigo-700 hover:bg-indigo-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow cursor-pointer transition-all hover:scale-105"
            >
              START REVISION ON THIS TOPIC →
            </button>
          </div>

          {/* Detailed Question Review List */}
          <div className="space-y-3">
            <h4 className="font-display font-black text-slate-900 text-sm uppercase">
              Paper Item Analysis ({latestResult.answers.length} Questions)
            </h4>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
              {latestResult.answers.map((ans, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-medium">
                  <div>
                    <span className="font-bold text-slate-700 block">Q{i + 1}: {ans.questionText}</span>
                    <span className="text-slate-500">Your answer: {ans.userAnswer} • Correct: {ans.correctAnswer}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg font-black ${
                    ans.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {ans.isCorrect ? `+${ans.marksAwarded} Marks` : '0 Marks'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Exit / Return */}
          <div className="text-center pt-4 border-t border-slate-200">
            <button
              onClick={() => setLatestResult(null)}
              className="px-8 py-3 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
            >
              Return to Mock Exam Lobby
            </button>
          </div>

        </section>
      )}

    </div>
  );
}

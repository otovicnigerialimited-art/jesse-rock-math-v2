import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SatsTopicInfo, SatsStudentProgress, SatsDomain } from '../../types/sats';
import { SATS_TOPICS, SATS_DOMAINS } from '../../data/satsData';
import { 
  BookOpen, 
  CheckCircle2, 
  Lightbulb, 
  HelpCircle, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Award, 
  Check, 
  X, 
  Clock, 
  Target, 
  Brain,
  ChevronRight,
  Filter
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SatsLearnModeProps {
  initialTopicId?: string;
  progress: SatsStudentProgress;
  onUpdateProgress: (updated: SatsStudentProgress) => void;
  onNavigateToPractice: (topicId?: string) => void;
}

export default function SatsLearnMode({
  initialTopicId,
  progress,
  onUpdateProgress,
  onNavigateToPractice
}: SatsLearnModeProps) {
  const [selectedDomain, setSelectedDomain] = useState<SatsDomain | 'all'>('all');
  const [activeTopic, setActiveTopic] = useState<SatsTopicInfo>(() => {
    if (initialTopicId) {
      const found = SATS_TOPICS.find(t => t.id === initialTopicId);
      if (found) return found;
    }
    return SATS_TOPICS[0];
  });

  // 5 Steps: 1: Learn, 2: Example, 3: Try Together, 4: Try Yourself, 5: SATs Challenge
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Try Together state
  const [tryTogetherAnswer, setTryTogetherAnswer] = useState('');
  const [tryTogetherSubmitted, setTryTogetherSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Try Yourself state
  const [tryYourselfAnswers, setTryYourselfAnswers] = useState<Record<string, string>>({});
  const [tryYourselfSubmitted, setTryYourselfSubmitted] = useState(false);

  // SATs Challenge state
  const [challengeAnswer, setChallengeAnswer] = useState('');
  const [challengeSubmitted, setChallengeSubmitted] = useState(false);
  const [showWorkedSolution, setShowWorkedSolution] = useState(false);

  const filteredTopics = selectedDomain === 'all' 
    ? SATS_TOPICS 
    : SATS_TOPICS.filter(t => t.domain === selectedDomain);

  const handleSelectTopic = (topic: SatsTopicInfo) => {
    setActiveTopic(topic);
    setCurrentStep(1);
    setTryTogetherAnswer('');
    setTryTogetherSubmitted(false);
    setShowHint(false);
    setTryYourselfAnswers({});
    setTryYourselfSubmitted(false);
    setChallengeAnswer('');
    setChallengeSubmitted(false);
    setShowWorkedSolution(false);
  };

  const handleCompleteTopic = () => {
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    
    const updated = { ...progress };
    if (!updated.completedLessons.includes(activeTopic.id)) {
      updated.completedLessons.push(activeTopic.id);
    }
    updated.topicMastery[activeTopic.id] = Math.min(100, (updated.topicMastery[activeTopic.id] || 60) + 15);
    updated.domainMastery[activeTopic.domain] = Math.min(100, (updated.domainMastery[activeTopic.domain] || 60) + 10);
    updated.totalMinutesStudied += activeTopic.estimatedMinutes;
    onUpdateProgress(updated);
  };

  const { learnModule } = activeTopic;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. TOPIC & DOMAIN FILTER SELECTOR */}
      <section className="bg-white p-6 rounded-3xl border-4 border-indigo-900 shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black text-indigo-700 uppercase tracking-widest block mb-1">
              Structured KS2 Curriculum Pathway
            </span>
            <h2 className="text-2xl font-display font-black text-slate-900">
              5-Step SATs Learn Mode
            </h2>
          </div>

          {/* Domain Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedDomain('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedDomain === 'all' 
                  ? 'bg-slate-900 text-white shadow' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Topics ({SATS_TOPICS.length})
            </button>
            {SATS_DOMAINS.map(d => (
              <button
                key={d.id}
                onClick={() => setSelectedDomain(d.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer capitalize ${
                  selectedDomain === d.id 
                    ? 'bg-indigo-700 text-white shadow' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {d.title.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Topic Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin-custom">
          {filteredTopics.map(topic => {
            const isCompleted = progress.completedLessons.includes(topic.id);
            const isSelected = activeTopic.id === topic.id;
            return (
              <button
                key={topic.id}
                onClick={() => handleSelectTopic(topic)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-all border flex items-center gap-2 cursor-pointer ${
                  isSelected 
                    ? 'bg-indigo-900 text-white border-indigo-950 shadow-md scale-102' 
                    : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-indigo-50'
                }`}
              >
                {isCompleted && <CheckCircle2 size={14} className="text-emerald-400" />}
                {topic.title}
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. 5-STEP PEDAGOGICAL NAVIGATION PROGRESS BAR */}
      <section className="bg-slate-900 text-white p-4 md:p-6 rounded-3xl border-4 border-indigo-700 shadow-xl">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
          {[
            { step: 1, label: '1. Learn Concept', icon: BookOpen },
            { step: 2, label: '2. See Example', icon: Lightbulb },
            { step: 3, label: '3. Try Together', icon: HelpCircle },
            { step: 4, label: '4. Try Yourself', icon: Target },
            { step: 5, label: '5. SATs Challenge', icon: Award },
          ].map(s => {
            const isCurrent = currentStep === s.step;
            const isPassed = currentStep > s.step;
            return (
              <button
                key={s.step}
                onClick={() => setCurrentStep(s.step as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  isCurrent 
                    ? 'bg-amber-400 text-slate-950 shadow-lg scale-105' 
                    : isPassed 
                    ? 'bg-emerald-600/60 text-white' 
                    : 'bg-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <s.icon size={15} />
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. STEP CONTENT DISPLAY */}
      <section className="bg-white p-6 md:p-10 rounded-[2.5rem] border-4 border-indigo-900 shadow-xl min-h-[480px] flex flex-col justify-between space-y-8">
        
        {/* STEP 1: LEARN CONCEPT */}
        {currentStep === 1 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-black uppercase tracking-wider">
                Step 1 of 5: Core Concept
              </span>
              <h3 className="text-2xl sm:text-3xl font-display font-black text-slate-900 mt-2">
                {learnModule.concept.heading}
              </h3>
              <p className="text-xs text-indigo-700 font-bold uppercase tracking-wider mt-1">
                Domain: {activeTopic.domain} • Topic: {activeTopic.title}
              </p>
            </div>

            <div className="space-y-4 text-slate-700 text-sm md:text-base leading-relaxed font-medium">
              {learnModule.concept.explanation.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {/* Key Rules Callout Box */}
            <div className="p-6 rounded-3xl bg-indigo-50 border-3 border-indigo-300 space-y-3">
              <h4 className="font-display font-black text-indigo-950 text-sm uppercase tracking-wider flex items-center gap-2">
                <Sparkles size={16} className="text-amber-500" /> Key SATs Rules & Memorisation Points
              </h4>
              <ul className="space-y-2 text-xs md:text-sm text-indigo-900 font-medium">
                {learnModule.concept.keyRules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-black">✓</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}

        {/* STEP 2: SEE AN EXAMPLE */}
        {currentStep === 2 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-black uppercase tracking-wider">
                Step 2 of 5: Worked Example
              </span>
              <h3 className="text-2xl font-display font-black text-slate-900 mt-2">
                How to Solve Step-by-Step
              </h3>
            </div>

            {/* Question Box */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white font-medium text-base">
              <span className="text-amber-400 font-bold text-xs uppercase block mb-1">Example Problem:</span>
              «{learnModule.example.question}»
            </div>

            {/* Step by step walkthrough */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">Solution Steps:</h4>
              {learnModule.example.steps.map((step, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs md:text-sm font-medium text-slate-800">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold shrink-0 text-xs">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>

            {/* Final Answer & Pro Tip */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase block">Final Answer:</span>
                <span className="text-xl font-black text-emerald-950">{learnModule.example.finalAnswer}</span>
              </div>
              <div className="text-right text-xs text-emerald-700 max-w-xs italic">
                💡 {learnModule.example.tip}
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 3: TRY TOGETHER */}
        {currentStep === 3 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <span className="px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full text-xs font-black uppercase tracking-wider">
                Step 3 of 5: Guided Practice
              </span>
              <h3 className="text-2xl font-display font-black text-slate-900 mt-2">
                Let's Try One Together!
              </h3>
            </div>

            <div className="p-6 rounded-2xl bg-indigo-50 border-2 border-indigo-200 text-base font-bold text-slate-900">
              «{learnModule.tryTogether.question}»
            </div>

            {/* Hint toggle */}
            <div>
              <button
                onClick={() => setShowHint(!showHint)}
                className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1.5 cursor-pointer underline"
              >
                <Lightbulb size={14} className="text-amber-500" />
                {showHint ? 'Hide Hint' : 'Need a hint? Click here'}
              </button>
              {showHint && (
                <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium animate-fade-in">
                  💡 Hint: {learnModule.tryTogether.hint}
                </div>
              )}
            </div>

            {/* Multiple Choice Options or Free Text */}
            {learnModule.tryTogether.options ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {learnModule.tryTogether.options.map((opt, i) => (
                  <button
                    key={i}
                    disabled={tryTogetherSubmitted}
                    onClick={() => {
                      setTryTogetherAnswer(opt);
                      setTryTogetherSubmitted(true);
                    }}
                    className={`p-4 rounded-2xl border-3 text-left font-bold text-sm transition-all cursor-pointer ${
                      tryTogetherSubmitted
                        ? opt === learnModule.tryTogether.correctAnswer
                          ? 'bg-emerald-100 border-emerald-500 text-emerald-950'
                          : opt === tryTogetherAnswer
                          ? 'bg-rose-100 border-rose-500 text-rose-950'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                        : tryTogetherAnswer === opt
                        ? 'bg-indigo-100 border-indigo-600 text-indigo-950'
                        : 'bg-white border-slate-200 hover:border-indigo-400 text-slate-800'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter your answer..."
                  value={tryTogetherAnswer}
                  onChange={(e) => setTryTogetherAnswer(e.target.value)}
                  className="p-3.5 border-2 border-slate-300 rounded-xl flex-1 font-bold text-sm"
                />
                <button
                  onClick={() => setTryTogetherSubmitted(true)}
                  className="px-6 py-3.5 bg-indigo-700 text-white font-bold text-xs uppercase rounded-xl cursor-pointer"
                >
                  Check
                </button>
              </div>
            )}

            {/* Explanation on submission */}
            {tryTogetherSubmitted && (
              <div className="p-4 rounded-2xl bg-slate-900 text-white text-xs leading-relaxed font-medium space-y-1 animate-fade-in">
                <span className="text-amber-400 font-bold uppercase block">Explanation:</span>
                <p>{learnModule.tryTogether.solutionExplanation}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* STEP 4: TRY YOURSELF */}
        {currentStep === 4 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-black uppercase tracking-wider">
                Step 4 of 5: Independent Practice
              </span>
              <h3 className="text-2xl font-display font-black text-slate-900 mt-2">
                Test Your Independence
              </h3>
            </div>

            <div className="space-y-6">
              {learnModule.tryYourself.map((q, idx) => (
                <div key={q.id} className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase">Question {idx + 1} ({q.marks} Mark)</span>
                    {tryYourselfSubmitted && (
                      <span className="text-xs font-bold">
                        {tryYourselfAnswers[q.id] === q.correctAnswer ? '🟢 Correct' : '🔴 Review'}
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-slate-900 text-sm">{q.question}</p>

                  {q.options && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      {q.options.map(opt => (
                        <button
                          key={opt}
                          disabled={tryYourselfSubmitted}
                          onClick={() => setTryYourselfAnswers(prev => ({ ...prev, [q.id]: opt }))}
                          className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            tryYourselfAnswers[q.id] === opt 
                              ? 'bg-purple-700 text-white border-purple-800' 
                              : 'bg-white text-slate-800 border-slate-300 hover:bg-purple-50'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  {tryYourselfSubmitted && (
                    <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 mt-2 font-medium">
                      💡 <span className="font-bold">Correct Answer:</span> {q.correctAnswer} — {q.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {!tryYourselfSubmitted && (
              <button
                onClick={() => setTryYourselfSubmitted(true)}
                className="w-full py-3.5 bg-purple-700 hover:bg-purple-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md cursor-pointer transition-all"
              >
                Submit Independent Answers
              </button>
            )}
          </motion.div>
        )}

        {/* STEP 5: SATS CHALLENGE */}
        {currentStep === 5 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
              <div>
                <span className="px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-black uppercase tracking-wider">
                  Step 5 of 5: SATs Challenge Problem
                </span>
                <h3 className="text-2xl font-display font-black text-slate-900 mt-2">
                  Realistic KS2 Exam Question
                </h3>
              </div>
              <span className="text-xs font-black bg-slate-900 text-white px-3 py-1.5 rounded-xl">
                {learnModule.satsChallenge.marks} Marks
              </span>
            </div>

            <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950 to-slate-900 text-white border-4 border-indigo-600 shadow-xl space-y-4">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
                {learnModule.satsChallenge.context || 'KS2 SATs Paper 2/3 Style'}
              </span>
              <p className="text-base sm:text-lg font-medium leading-relaxed">
                {learnModule.satsChallenge.question}
              </p>
            </div>

            {learnModule.satsChallenge.options ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {learnModule.satsChallenge.options.map(opt => (
                  <button
                    key={opt}
                    disabled={challengeSubmitted}
                    onClick={() => setChallengeAnswer(opt)}
                    className={`p-4 rounded-2xl border-3 text-center font-bold text-sm transition-all cursor-pointer ${
                      challengeAnswer === opt 
                        ? 'bg-rose-700 text-white border-rose-900 shadow' 
                        : 'bg-white text-slate-800 border-slate-300 hover:border-rose-400'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <input
                type="text"
                placeholder="Write your answer..."
                value={challengeAnswer}
                onChange={(e) => setChallengeAnswer(e.target.value)}
                className="w-full p-4 border-2 border-slate-300 rounded-2xl font-bold text-base"
              />
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              {!challengeSubmitted ? (
                <button
                  onClick={() => {
                    setChallengeSubmitted(true);
                    handleCompleteTopic();
                  }}
                  className="w-full py-4 bg-gradient-to-r from-rose-600 to-indigo-700 hover:from-rose-500 hover:to-indigo-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg cursor-pointer transition-all hover:scale-102"
                >
                  Submit Challenge & Master Topic 🎓
                </button>
              ) : (
                <button
                  onClick={() => setShowWorkedSolution(!showWorkedSolution)}
                  className="px-6 py-3 bg-slate-900 text-white font-bold text-xs uppercase rounded-xl cursor-pointer"
                >
                  {showWorkedSolution ? 'Hide Worked Solution' : 'View Full Examiner Method'}
                </button>
              )}
            </div>

            {challengeSubmitted && showWorkedSolution && (
              <div className="p-5 rounded-2xl bg-indigo-50 border-2 border-indigo-200 space-y-2 text-xs text-slate-800 leading-relaxed animate-fade-in font-medium">
                <p className="font-bold text-indigo-950">Worked Solution:</p>
                <p>{learnModule.satsChallenge.workedSolution}</p>
                <p className="text-indigo-800 italic pt-1">💡 Examiner Tip: {learnModule.satsChallenge.examinerTip}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* BOTTOM STEP CONTROLS */}
        <div className="border-t border-slate-200 pt-6 flex items-center justify-between">
          <button
            disabled={currentStep === 1}
            onClick={() => setCurrentStep((s) => (s - 1) as any)}
            className="px-5 py-3 rounded-2xl border-2 border-slate-300 font-bold text-xs uppercase tracking-wider text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer transition-all"
          >
            <ArrowLeft size={16} /> Previous Step
          </button>

          {currentStep < 5 ? (
            <button
              onClick={() => setCurrentStep((s) => (s + 1) as any)}
              className="px-7 py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              Next Step <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={() => onNavigateToPractice(activeTopic.id)}
              className="px-7 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              Practice Drills on This Topic →
            </button>
          )}
        </div>

      </section>

    </div>
  );
}

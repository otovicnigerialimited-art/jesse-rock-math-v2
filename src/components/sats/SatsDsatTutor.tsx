import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  Sparkles, 
  BookOpen, 
  Calculator, 
  Send, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Zap, 
  RefreshCw, 
  Award, 
  Target, 
  Clock, 
  ChevronRight,
  MessageSquare,
  Flame,
  AlertTriangle,
  Lightbulb,
  FileText
} from 'lucide-react';

import { SatsStudentProgress } from '../../types/sats';

export interface DsatQuestion {
  id: string;
  section: 'math' | 'reading_writing';
  domain: string;
  passage?: string; // Short paragraph under 150 words for R&W
  question: string;
  isSpr?: boolean; // Student-Produced Response
  options?: string[]; // 4 options for MC
  correctAnswer: string; // "A", "B", "C", "D" or exact numerical string
  explanation: {
    clearAnswer: string;
    stepByStep: string[];
    desmosTip?: string;
    distractorAnalysis: { option: string; reason: string }[];
  };
}

interface SatsDsatTutorProps {
  progress?: SatsStudentProgress;
  onUpdateProgress?: (updated: SatsStudentProgress) => void;
}

const SAMPLE_DSAT_QUESTIONS: DsatQuestion[] = [
  {
    id: 'dsat_m_alg_1',
    section: 'math',
    domain: 'Algebra',
    question: 'If 3x + 7 = 22, what is the value of 6x + 5?',
    isSpr: false,
    options: ['A) 30', 'B) 35', 'C) 15', 'D) 49'],
    correctAnswer: 'B',
    explanation: {
      clearAnswer: 'B (35)',
      stepByStep: [
        'Step 1: Solve for x in the equation 3x + 7 = 22.',
        'Step 2: Subtract 7 from both sides: 3x = 15.',
        'Step 3: Divide by 3: x = 5.',
        'Step 4: Substitute x = 5 into the target expression 6x + 5.',
        'Step 5: 6(5) + 5 = 30 + 5 = 35.'
      ],
      desmosTip: 'Desmos Shortcut: Type 3x + 7 = 22 into Line 1. Desmos displays a vertical line at x = 5. On Line 2, type 6(5) + 5 to instantly get 35.',
      distractorAnalysis: [
        { option: 'A) 30', reason: 'Calculated 6x (which is 30) but forgot to add 5. Classic "didn\'t answer the exact question asked" trap.' },
        { option: 'B) 35', reason: 'Correct choice. Evaluated 6x + 5 accurately after solving x = 5.' },
        { option: 'C) 15', reason: 'Calculated 3x (15) instead of evaluating 6x + 5.' },
        { option: 'D) 49', reason: 'Substituted x = 7 or multiplied incorrectly during algebraic steps.' }
      ]
    }
  },
  {
    id: 'dsat_rw_trans_1',
    section: 'reading_writing',
    domain: 'Expression of Ideas',
    passage: 'For decades, deep-sea hydrothermal vents were assumed to be entirely barren environments unable to support complex organisms. ________, recent robotic submersibles discovered flourishing communities of giant tube worms and albino crabs thriving near superheated mineral plumes.',
    question: 'Which choice completes the passage with the most logical transition?',
    isSpr: false,
    options: [
      'A) However',
      'B) Furthermore',
      'C) Consequently',
      'D) Specifically'
    ],
    correctAnswer: 'A',
    explanation: {
      clearAnswer: 'A (However)',
      stepByStep: [
        'Step 1: Identify the relationship between Sentence 1 and Sentence 2.',
        'Step 2: Sentence 1 states vents were assumed to be barren (empty of life).',
        'Step 3: Sentence 2 states robotic submersibles found thriving animal communities (life present).',
        'Step 4: The contrast between "barren assumption" and "thriving reality" requires a contrast transition.',
        'Step 5: "However" signals contrast/contradiction.'
      ],
      distractorAnalysis: [
        { option: 'A) However', reason: 'Correct choice. Accurately signals the logical contrast between the former belief and recent discovery.' },
        { option: 'B) Furthermore', reason: 'Addition trap. "Furthermore" adds similar information rather than contrasting a false assumption with new evidence.' },
        { option: 'C) Consequently', reason: 'Cause-and-effect trap. The discovery of crabs was not caused by the previous assumption.' },
        { option: 'D) Specifically', reason: 'Exemplification trap. Sentence 2 contradicts Sentence 1 rather than elaborating on a specific detail of the assumption.' }
      ]
    }
  },
  {
    id: 'dsat_m_adv_1',
    section: 'math',
    domain: 'Advanced Math',
    question: 'The function f is defined by f(x) = (x - 4)^2 + 9. What is the minimum value of f(x)?',
    isSpr: true,
    correctAnswer: '9',
    explanation: {
      clearAnswer: '9',
      stepByStep: [
        'Step 1: Recognize that f(x) is written in vertex form: f(x) = a(x - h)^2 + k.',
        'Step 2: Here, a = 1 (positive, parabola opens upward), vertex (h, k) = (4, 9).',
        'Step 3: Since (x - 4)^2 is always greater than or equal to 0 for any real x, the smallest possible value for (x - 4)^2 is 0 (when x = 4).',
        'Step 4: Therefore, minimum value of f(x) = 0 + 9 = 9.'
      ],
      desmosTip: 'Desmos Shortcut: Type f(x) = (x - 4)^2 + 9. Click on the vertex point displayed on the graph. The point is (4, 9). The minimum value is the y-coordinate, 9.',
      distractorAnalysis: [
        { option: '4', reason: 'Trap: Inputting the x-value of the vertex (x = 4) instead of the minimum value of the function (y = 9).' },
        { option: '-4', reason: 'Trap: Misinterpreting the (x - 4) inside the parenthesis.' },
        { option: '25', reason: 'Trap: Expanding incorrectly or plugging in x = 0.' }
      ]
    }
  }
];

export default function SatsDsatTutor({ progress, onUpdateProgress }: SatsDsatTutorProps) {
  const [activeSection, setActiveSection] = useState<'all' | 'math' | 'reading_writing'>('all');
  const [selectedDomain, setSelectedDomain] = useState<string>('All Domains');
  const [currentQuestion, setCurrentQuestion] = useState<DsatQuestion>(SAMPLE_DSAT_QUESTIONS[0]);
  const [userChoice, setUserChoice] = useState<string>('');
  const [userSpr, setUserSpr] = useState<string>('');
  const [isGraded, setIsGraded] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // AI Tutor Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'tutor'; text: string; timestamp: string }>>([
    {
      sender: 'tutor',
      text: 'Welcome! I am your Digital SAT (DSAT) Expert AI Tutor. I strictly adhere to official College Board Bluebook test specifications. Select a domain or ask me any SAT strategy question, problem step-by-step breakdown, or Desmos calculator trick!',
      timestamp: 'Just now'
    }
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isChatTyping, setIsChatTyping] = useState<boolean>(false);

  const isCorrect = () => {
    if (currentQuestion.isSpr) {
      return userSpr.trim() === currentQuestion.correctAnswer.trim();
    }
    return userChoice.toUpperCase().startsWith(currentQuestion.correctAnswer.toUpperCase());
  };

  // Handle Question Answering
  const handleGradeAnswer = () => {
    setIsGraded(true);

    if (progress && onUpdateProgress) {
      const correct = isCorrect();
      const updated: SatsStudentProgress = {
        ...progress,
        totalPracticeSolved: (progress.totalPracticeSolved || 0) + 1,
        totalCorrect: (progress.totalCorrect || 0) + (correct ? 1 : 0),
        domainMastery: { ...progress.domainMastery }
      };
      onUpdateProgress(updated);
    }
  };

  // Generate Next / AI Question
  const handleGenerateQuestion = async () => {
    setIsGenerating(true);
    setIsGraded(false);
    setUserChoice('');
    setUserSpr('');

    try {
      const promptText = `You are a College Board Digital SAT (DSAT) Expert Tutor. Generate ONE authentic DSAT question.
Target Section: ${activeSection}
Target Domain: ${selectedDomain}

RULES:
1. For Reading & Writing: include a passage under 150 words and 1 question with 4 options (A, B, C, D).
2. For Math: 4 options (A, B, C, D) or SPR (Student-Produced Response with exact numerical answer).
3. Distractors MUST represent realistic student traps.
4. Output JSON with fields: section, domain, passage (optional), question, isSpr (boolean), options (array of 4 strings or omit if isSpr), correctAnswer ("A", "B", "C", or "D" or number string), explanation { clearAnswer, stepByStep (array of strings), desmosTip (optional string), distractorAnalysis (array of {option, reason}) }.`;

      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText })
      });

      const data = await res.json();
      if (data.success && data.text) {
        const jsonMatch = data.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setCurrentQuestion({
            id: `gen_${Date.now()}`,
            section: parsed.section || 'math',
            domain: parsed.domain || selectedDomain,
            passage: parsed.passage,
            question: parsed.question,
            isSpr: parsed.isSpr || false,
            options: parsed.options,
            correctAnswer: parsed.correctAnswer,
            explanation: parsed.explanation || {
              clearAnswer: parsed.correctAnswer,
              stepByStep: ['Solved according to College Board guidelines.'],
              distractorAnalysis: []
            }
          });
          setIsGenerating(false);
          return;
        }
      }
    } catch (e) {
      console.warn("AI generation fallback to pre-loaded sample.");
    }

    // Fallback: cycle samples
    const nextIdx = (SAMPLE_DSAT_QUESTIONS.findIndex(q => q.id === currentQuestion.id) + 1) % SAMPLE_DSAT_QUESTIONS.length;
    setCurrentQuestion(SAMPLE_DSAT_QUESTIONS[nextIdx]);
    setIsGenerating(false);
  };

  // AI Chat Handler
  const handleSendChatMessage = async (msgOverride?: string) => {
    const query = (msgOverride || chatInput).trim();
    if (!query) return;

    const userMsg = { sender: 'user' as const, text: query, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setChatMessages(prev => [...prev, userMsg]);
    if (!msgOverride) setChatInput('');
    setIsChatTyping(true);

    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `You are an elite Digital SAT (DSAT) Expert Tutor. The student asks: "${query}".
Answer encouragingly, analytically, and strategically. Highlight College Board traps, Desmos calculator shortcuts, process of elimination, or step-by-step logic.`
        })
      });

      const data = await res.json();
      if (data.success && data.text) {
        setChatMessages(prev => [
          ...prev,
          { sender: 'tutor', text: data.text, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]);
      } else {
        throw new Error('Fallback required');
      }
    } catch (e) {
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'tutor',
          text: `Great question! On the Digital SAT, always identify the specific trap before selecting your answer. For Math, leverage the Desmos graphing calculator to graph equations directly. For Reading & Writing, eliminate choices that insert unstated details or use misleading transition words.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsChatTyping(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border-2 border-indigo-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-400/10 via-indigo-500/10 to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow">
                <Sparkles size={14} /> Official DSAT Specs
              </span>
              <span className="px-3 py-1 rounded-full bg-indigo-900/80 text-indigo-200 border border-indigo-700 text-xs font-bold">
                College Board Aligned
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-display font-black text-white tracking-tight">
              Digital SAT (DSAT) AI Expert Tutor
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl mt-1 leading-relaxed">
              Generate test-aligned Reading, Writing, & Math practice questions, uncover distractor traps, and master Desmos shortcuts with step-by-step solutions.
            </p>
          </div>

          <div className="flex items-center gap-3 self-stretch md:self-auto bg-slate-800/80 backdrop-blur-md p-3.5 rounded-2xl border border-slate-700">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
              <Target size={22} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Target Score</div>
              <div className="text-lg font-black text-amber-300">1550+ Digital SAT</div>
            </div>
          </div>
        </div>
      </div>

      {/* DOMAIN FILTERS */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <button
            onClick={() => { setActiveSection('all'); setSelectedDomain('All Domains'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeSection === 'all' ? 'bg-indigo-900 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Sections
          </button>
          <button
            onClick={() => { setActiveSection('math'); setSelectedDomain('Algebra'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeSection === 'math' ? 'bg-indigo-900 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Calculator size={14} /> DSAT Math
          </button>
          <button
            onClick={() => { setActiveSection('reading_writing'); setSelectedDomain('Craft & Structure'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeSection === 'reading_writing' ? 'bg-indigo-900 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <BookOpen size={14} /> Reading & Writing
          </button>
        </div>

        {/* DOMAIN SUB-SELECTOR */}
        <div className="w-full md:w-auto flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500 whitespace-nowrap">Domain:</label>
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="w-full md:w-auto bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {activeSection === 'math' || activeSection === 'all' ? (
              <optgroup label="Math Domains">
                <option value="Algebra">Algebra (Linear equations & systems)</option>
                <option value="Advanced Math">Advanced Math (Quadratics & polynomials)</option>
                <option value="Problem-Solving">Problem-Solving & Data Analysis</option>
                <option value="Geometry & Trig">Geometry & Trigonometry</option>
              </optgroup>
            ) : null}
            {activeSection === 'reading_writing' || activeSection === 'all' ? (
              <optgroup label="Reading & Writing Domains">
                <option value="Craft & Structure">Craft & Structure (Words in Context)</option>
                <option value="Information & Ideas">Information & Ideas (Central Ideas & Evidence)</option>
                <option value="Standard English Conventions">Standard English Conventions (Grammar)</option>
                <option value="Expression of Ideas">Expression of Ideas (Transitions)</option>
              </optgroup>
            ) : null}
          </select>
        </div>
      </div>

      {/* MAIN TWO-COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: QUESTION CARD & EXPLANATION (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-md p-6 sm:p-8 space-y-6 relative">
            
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-lg text-xs font-black uppercase tracking-wider">
                  {currentQuestion.domain}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {currentQuestion.isSpr ? 'Student-Produced Response (SPR)' : '4-Option Multiple Choice'}
                </span>
              </div>

              <button
                onClick={handleGenerateQuestion}
                disabled={isGenerating}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm disabled:opacity-50"
              >
                <RefreshCw size={13} className={isGenerating ? 'animate-spin' : ''} />
                <span>{isGenerating ? 'Generating...' : 'New Question'}</span>
              </button>
            </div>

            {/* Passage if Reading & Writing */}
            {currentQuestion.passage && (
              <div className="bg-slate-50 border-l-4 border-indigo-600 p-4 rounded-r-xl text-slate-800 text-sm leading-relaxed font-serif italic">
                "{currentQuestion.passage}"
              </div>
            )}

            {/* Question Text */}
            <div className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {currentQuestion.question}
            </div>

            {/* Options or SPR Input */}
            {!currentQuestion.isSpr && currentQuestion.options ? (
              <div className="space-y-3 pt-2">
                {currentQuestion.options.map((opt, idx) => {
                  const letter = opt.charAt(0);
                  const isSelected = userChoice.startsWith(letter);
                  let optStyle = 'border-slate-200 hover:border-indigo-300 bg-white text-slate-800';

                  if (isGraded) {
                    if (letter === currentQuestion.correctAnswer) {
                      optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                    } else if (isSelected) {
                      optStyle = 'border-rose-500 bg-rose-50 text-rose-900 font-bold';
                    }
                  } else if (isSelected) {
                    optStyle = 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => !isGraded && setUserChoice(letter)}
                      disabled={isGraded}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between text-sm cursor-pointer ${optStyle}`}
                    >
                      <span>{opt}</span>
                      {isGraded && letter === currentQuestion.correctAnswer && (
                        <CheckCircle2 size={18} className="text-emerald-600" />
                      )}
                      {isGraded && isSelected && letter !== currentQuestion.correctAnswer && (
                        <XCircle size={18} className="text-rose-600" />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="pt-2 space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Enter Numerical / Fraction Answer:
                </label>
                <input
                  type="text"
                  value={userSpr}
                  onChange={(e) => !isGraded && setUserSpr(e.target.value)}
                  disabled={isGraded}
                  placeholder="e.g. 9 or 3/4"
                  className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl px-4 py-3 text-base font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>
            )}

            {/* Check / Submit Button */}
            {!isGraded ? (
              <button
                onClick={handleGradeAnswer}
                disabled={!userChoice && !userSpr}
                className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-2xl text-sm shadow-md transition-all uppercase tracking-wider cursor-pointer disabled:opacity-50"
              >
                Submit Answer
              </button>
            ) : (
              <div className={`p-4 rounded-2xl border-2 flex items-center gap-3 ${
                isCorrect() ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}>
                {isCorrect() ? <CheckCircle2 size={24} className="text-emerald-600 shrink-0" /> : <XCircle size={24} className="text-rose-600 shrink-0" />}
                <div>
                  <div className="font-black text-sm">
                    {isCorrect() ? 'Spot on! Correct answer.' : 'Not quite. Check the step-by-step breakdown below.'}
                  </div>
                  <div className="text-xs font-medium opacity-90">
                    Official DSAT Scaled Logic Applied.
                  </div>
                </div>
              </div>
            )}

            {/* EXPLANATION ARCHITECTURE (UNLOCKED WHEN GRADED OR ON DEMAND) */}
            {isGraded && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-t border-slate-200 pt-6 space-y-6"
              >
                {/* 1. Clear Answer */}
                <div className="bg-indigo-900 text-white rounded-2xl p-4 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Official Correct Choice</span>
                  <span className="text-base font-black text-amber-400">{currentQuestion.explanation.clearAnswer}</span>
                </div>

                {/* 2. Step-by-Step Solution */}
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-indigo-600" /> Step-by-Step Solution Architecture
                  </h3>
                  <div className="bg-slate-50 rounded-2xl p-4 space-y-2 border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed">
                    {currentQuestion.explanation.stepByStep.map((step, sIdx) => (
                      <div key={sIdx} className="flex items-start gap-2">
                        <span className="font-bold text-indigo-700 shrink-0">•</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Desmos Tip if Math */}
                {currentQuestion.explanation.desmosTip && (
                  <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start gap-3">
                    <Calculator size={20} className="text-amber-700 shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm text-amber-900 leading-relaxed font-medium">
                      <strong className="font-black text-amber-950 block mb-0.5">Desmos Calculator Shortcut:</strong>
                      {currentQuestion.explanation.desmosTip}
                    </div>
                  </div>
                )}

                {/* 3. Distractor Analysis */}
                {currentQuestion.explanation.distractorAnalysis && currentQuestion.explanation.distractorAnalysis.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <AlertTriangle size={14} className="text-rose-600" /> College Board Distractor & Trap Analysis
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      {currentQuestion.explanation.distractorAnalysis.map((d, dIdx) => (
                        <div key={dIdx} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs leading-relaxed">
                          <span className="font-black text-slate-900 mr-1.5">{d.option}:</span>
                          <span className="text-slate-700">{d.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

          </div>
        </div>

        {/* RIGHT COLUMN: AI TUTOR CHAT & PACING STRATEGY (5 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* AI TUTOR CHAT WINDOW */}
          <div className="bg-slate-900 text-white rounded-3xl border-2 border-indigo-900 shadow-xl p-6 flex flex-col h-[580px]">
            
            {/* Tutor Header */}
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                <Brain size={22} />
              </div>
              <div>
                <div className="text-sm font-black text-white flex items-center gap-1.5">
                  DSAT Expert AI Tutor <Sparkles size={14} className="text-amber-400" />
                </div>
                <div className="text-[10px] text-indigo-300 uppercase tracking-widest font-bold">
                  Bluebook Test Specialist
                </div>
              </div>
            </div>

            {/* Quick Prompt Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-2">
              <button
                onClick={() => handleSendChatMessage('How do I use Desmos for quadratic equations on the DSAT?')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-indigo-900 border border-slate-700 rounded-lg text-[10px] font-bold text-indigo-200 whitespace-nowrap cursor-pointer transition-colors"
              >
                ⚡ Desmos Quadratics
              </button>
              <button
                onClick={() => handleSendChatMessage('What is the best strategy for Reading Transitions questions?')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-indigo-900 border border-slate-700 rounded-lg text-[10px] font-bold text-indigo-200 whitespace-nowrap cursor-pointer transition-colors"
              >
                📖 R&W Transitions
              </button>
              <button
                onClick={() => handleSendChatMessage('How do I manage time in DSAT Math Module 2?')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-indigo-900 border border-slate-700 rounded-lg text-[10px] font-bold text-indigo-200 whitespace-nowrap cursor-pointer transition-colors"
              >
                ⏱️ Module 2 Pacing
              </button>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className={`p-3.5 rounded-2xl text-xs sm:text-sm max-w-[88%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono mt-1 px-1">{msg.timestamp}</span>
                </div>
              ))}
              {isChatTyping && (
                <div className="flex items-center gap-2 text-xs text-amber-400 font-bold p-2 bg-slate-800/50 rounded-xl w-max">
                  <Sparkles size={14} className="animate-spin" /> Analyzing College Board DSAT logic...
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="pt-4 border-t border-slate-800 mt-2 flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                placeholder="Ask DSAT Tutor a question or request a trap breakdown..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={() => handleSendChatMessage()}
                className="p-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl cursor-pointer transition-colors"
              >
                <Send size={16} />
              </button>
            </div>

          </div>

          {/* DSAT CHEAT SHEET CARD */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Lightbulb size={18} className="text-amber-500" /> High-Yield DSAT Traps
            </h3>
            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <strong className="text-amber-950 block font-bold mb-0.5">Math: Target Value Misread</strong>
                Don't calculate x and stop! If the question asks for 3x + 5 or (x + 2)^2, always re-read the exact variable expression requested.
              </div>
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                <strong className="text-indigo-950 block font-bold mb-0.5">R&W: Unstated Claims in Inferences</strong>
                Never pick an answer choice that sounds smart but introduces facts not explicitly supported in the text paragraph.
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

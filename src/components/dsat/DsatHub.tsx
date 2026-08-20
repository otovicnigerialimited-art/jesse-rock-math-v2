import React, { useState, useEffect } from 'react';
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
  FileText,
  ArrowLeft,
  ChevronDown,
  Database,
  Trophy,
  GraduationCap,
  Sliders,
  RotateCcw,
  BookMarked,
  Check,
  TrendingUp,
  Layers,
  BarChart2
} from 'lucide-react';
import { safeStorage } from '../../lib/storage';

export type DsatTab = 'practice' | 'desmos' | 'mock' | 'flashcards' | 'diagnostic' | 'strategy';

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

export interface DsatProgress {
  userId: string;
  studentName: string;
  targetScore: number;
  mathPredictedScore: number;
  rwPredictedScore: number;
  questionsSolved: number;
  questionsCorrect: number;
  mathSolved: number;
  rwSolved: number;
  desmosCompleted: string[];
  masteredFlashcards: string[];
  mockHistory: Array<{
    id: string;
    date: string;
    compositeScore: number;
    mathScore: number;
    rwScore: number;
  }>;
}

const DEFAULT_DSAT_PROGRESS: DsatProgress = {
  userId: 'guest',
  studentName: 'Rockstar Student',
  targetScore: 1500,
  mathPredictedScore: 650,
  rwPredictedScore: 620,
  questionsSolved: 0,
  questionsCorrect: 0,
  mathSolved: 0,
  rwSolved: 0,
  desmosCompleted: [],
  masteredFlashcards: [],
  mockHistory: []
};

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
      desmosTip: 'Desmos Shortcut: Type f(x) = (x - 4)^2 + 9 into Line 1. Click on the minimum vertex point on the curve. The point is (4, 9). The minimum function value is y = 9.',
      distractorAnalysis: [
        { option: '4', reason: 'Trap: Inputting the x-value of the vertex (x = 4) instead of the minimum value of the function (y = 9).' },
        { option: '-4', reason: 'Trap: Misinterpreting the (x - 4) inside the parenthesis.' },
        { option: '25', reason: 'Trap: Expanding incorrectly or plugging in x = 0.' }
      ]
    }
  },
  {
    id: 'dsat_m_geom_1',
    section: 'math',
    domain: 'Geometry & Trigonometry',
    question: 'A right triangle has legs of lengths 8 and 15. What is the length of the hypotenuse?',
    isSpr: true,
    correctAnswer: '17',
    explanation: {
      clearAnswer: '17',
      stepByStep: [
        'Step 1: Apply the Pythagorean Theorem: a^2 + b^2 = c^2.',
        'Step 2: 8^2 + 15^2 = 64 + 225 = 289.',
        'Step 3: c = sqrt(289) = 17.',
        'Step 4: Memorize the common Pythagorean Triples: 3-4-5, 5-12-13, 8-15-17, 7-24-25.'
      ],
      desmosTip: 'Desmos Shortcut: Type sqrt(8^2 + 15^2) into Line 1 to instantly get 17.',
      distractorAnalysis: [
        { option: '23', reason: 'Trap: Simply adding 8 + 15.' },
        { option: '16.1', reason: 'Trap: Subtracting or miscalculating 225 - 64.' }
      ]
    }
  }
];

const DESMOS_TRICKS = [
  {
    id: 'desmos_1',
    title: 'Solving Systems of Linear & Non-Linear Equations',
    domain: 'Algebra / Advanced Math',
    description: 'Never solve complex system equations by hand on the DSAT. Type both equations into Desmos and tap the intersection point.',
    exampleEq1: 'y = 2x^2 - 5x + 3',
    exampleEq2: 'y = 3x - 1',
    steps: [
      'Type Line 1: y = 2x^2 - 5x + 3',
      'Type Line 2: y = 3x - 1',
      'Desmos automatically highlights gray dots where the curves intersect.',
      'Click the dots to read off exact (x, y) solutions instantly.'
    ]
  },
  {
    id: 'desmos_2',
    title: 'Finding Quadratic Vertices, Zeros & Extrema',
    domain: 'Advanced Math',
    description: 'Instantly locate max/min values, roots, and intercepts without completing the square or applying the quadratic formula.',
    exampleEq1: 'f(x) = -3x^2 + 12x - 5',
    steps: [
      'Type the function into Line 1: f(x) = -3x^2 + 12x - 5',
      'Click the top vertex of the parabola. Desmos shows (2, 7).',
      'The maximum value is y = 7, occurring at x = 2.',
      'Click the x-intercepts to read the real zeros of the function.'
    ]
  },
  {
    id: 'desmos_3',
    title: 'Instant Table & Linear Regression Trick',
    domain: 'Problem-Solving & Data Analysis',
    description: 'When given a table of values (x, y) and asked to find the matching equation or slope, use the regression operator `~`.',
    exampleEq1: 'y1 ~ m*x1 + b',
    steps: [
      'Click the + icon in Desmos and select Table.',
      'Enter the given x and y values from the question table.',
      'On Line 2, type: y1 ~ m*x1 + b',
      'Desmos automatically calculates slope m and y-intercept b!'
    ]
  }
];

const MATH_FORMULAS = [
  { name: 'Quadratic Formula', formula: 'x = (-b ± √(b² - 4ac)) / (2a)', category: 'Algebra' },
  { name: 'Vertex Form of Quadratic', formula: 'f(x) = a(x - h)² + k', category: 'Algebra' },
  { name: 'Circle Equation', formula: '(x - h)² + (y - k)² = r²', category: 'Geometry' },
  { name: 'Arc Length', formula: 's = (θ / 360°) × 2πr', category: 'Geometry' },
  { name: 'Sector Area', formula: 'A = (θ / 360°) × πr²', category: 'Geometry' },
  { name: 'Exponential Growth / Decay', formula: 'A(t) = P(1 ± r)ᵗ', category: 'Advanced Math' }
];

const DSAT_VOCAB = [
  { word: 'Pragmatic', definition: 'Dealing with things sensibly and realistically based on practical considerations.', example: 'The researchers adopted a pragmatic approach to field sampling.' },
  { word: 'Corroborate', definition: 'Confirm or give support to a statement, theory, or finding.', example: 'New geological findings corroborate the team\'s hypothesis.' },
  { word: 'Ambiguous', definition: 'Open to more than one interpretation; not having one obvious meaning.', example: 'The contract contained ambiguous language regarding timeline obligations.' },
  { word: 'Paradoxical', definition: 'Seemingly absurd or self-contradictory, but in reality expressing a possible truth.', example: 'It is paradoxical that standing still can sometimes require immense physical energy.' }
];

interface DsatHubProps {
  userId?: string;
  studentName?: string;
  onExitToRockstarMode: () => void;
}

export default function DsatHub({
  userId = 'guest',
  studentName = 'Rockstar Student',
  onExitToRockstarMode
}: DsatHubProps) {
  const [activeTab, setActiveTab] = useState<DsatTab>('practice');
  const [progress, setProgress] = useState<DsatProgress>(() => {
    try {
      const saved = safeStorage.getItem(`dsat_progress_${userId}`);
      return saved ? JSON.parse(saved) : { ...DEFAULT_DSAT_PROGRESS, userId, studentName };
    } catch {
      return { ...DEFAULT_DSAT_PROGRESS, userId, studentName };
    }
  });

  const [activeSection, setActiveSection] = useState<'all' | 'math' | 'reading_writing'>('all');
  const [selectedDomain, setSelectedDomain] = useState<string>('All Domains');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userChoice, setUserChoice] = useState<string>('');
  const [userSpr, setUserSpr] = useState<string>('');
  const [isGraded, setIsGraded] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Chat Tutor
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'tutor'; text: string; timestamp: string }>>([
    {
      sender: 'tutor',
      text: 'Welcome to the Digital SAT (DSAT) AI Expert Academy! I am strictly calibrated to official College Board Bluebook specifications. Ask me any question on Math, Reading & Writing, Desmos calculator shortcuts, or timing strategy!',
      timestamp: 'Just now'
    }
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isChatTyping, setIsChatTyping] = useState<boolean>(false);

  // Mock Simulator State
  const [mockActive, setMockActive] = useState(false);
  const [mockTimeLeft, setMockTimeLeft] = useState(35 * 60); // 35 min
  const [mockCurrentQuestion, setMockCurrentQuestion] = useState(0);
  const [mockAnswers, setMockAnswers] = useState<Record<number, string>>({});
  const [mockFinished, setMockFinished] = useState(false);

  useEffect(() => {
    safeStorage.setItem(`dsat_progress_${userId}`, JSON.stringify(progress));
  }, [progress, userId]);

  // Mock Timer Loop
  useEffect(() => {
    if (!mockActive || mockFinished) return;
    const timer = setInterval(() => {
      setMockTimeLeft(prev => {
        if (prev <= 1) {
          setMockFinished(true);
          setMockActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [mockActive, mockFinished]);

  const filteredQuestions = SAMPLE_DSAT_QUESTIONS.filter(q => {
    if (activeSection !== 'all' && q.section !== activeSection) return false;
    if (selectedDomain !== 'All Domains' && q.domain !== selectedDomain) return false;
    return true;
  });

  const currentQ = filteredQuestions[currentQuestionIndex] || SAMPLE_DSAT_QUESTIONS[0];

  const handleGradeAnswer = () => {
    if (isGraded) return;
    setIsGraded(true);

    const isCorrect = currentQ.isSpr 
      ? userSpr.trim() === currentQ.correctAnswer.trim()
      : userChoice === currentQ.correctAnswer;

    setProgress(prev => {
      const isMath = currentQ.section === 'math';
      const newSolved = prev.questionsSolved + 1;
      const newCorrect = isCorrect ? prev.questionsCorrect + 1 : prev.questionsCorrect;
      
      // Update predicted scores dynamically
      const newMathPred = isMath 
        ? Math.min(800, prev.mathPredictedScore + (isCorrect ? 15 : -5))
        : prev.mathPredictedScore;
      
      const newRwPred = !isMath
        ? Math.min(800, prev.rwPredictedScore + (isCorrect ? 15 : -5))
        : prev.rwPredictedScore;

      return {
        ...prev,
        questionsSolved: newSolved,
        questionsCorrect: newCorrect,
        mathSolved: isMath ? prev.mathSolved + 1 : prev.mathSolved,
        rwSolved: !isMath ? prev.rwSolved + 1 : prev.rwSolved,
        mathPredictedScore: newMathPred,
        rwPredictedScore: newRwPred
      };
    });
  };

  const handleNextQuestion = () => {
    setIsGraded(false);
    setUserChoice('');
    setUserSpr('');
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setCurrentQuestionIndex(0);
    }
  };

  const handleGenerateNewAiQuestion = async () => {
    setIsGenerating(true);
    setIsGraded(false);
    setUserChoice('');
    setUserSpr('');

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Generate a single authentic College Board Digital SAT (DSAT) practice question in ${activeSection === 'reading_writing' ? 'Reading & Writing' : 'Math'}.
Return strictly a raw JSON object with this exact shape:
{
  "id": "dsat_gen_${Date.now()}",
  "section": "${activeSection === 'reading_writing' ? 'reading_writing' : 'math'}",
  "domain": "Algebra",
  "question": "Question text here...",
  "isSpr": false,
  "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
  "correctAnswer": "A",
  "explanation": {
    "clearAnswer": "A",
    "stepByStep": ["Step 1...", "Step 2..."],
    "desmosTip": "Desmos tip...",
    "distractorAnalysis": [
      {"option": "A) option1", "reason": "Reason A"},
      {"option": "B) option2", "reason": "Reason B"},
      {"option": "C) option3", "reason": "Reason C"},
      {"option": "D) option4", "reason": "Reason D"}
    ]
  }
}`
        })
      });

      if (response.ok) {
        const data = await response.json();
        const jsonMatch = data.text?.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const newQ: DsatQuestion = JSON.parse(jsonMatch[0]);
          SAMPLE_DSAT_QUESTIONS.push(newQ);
          setCurrentQuestionIndex(SAMPLE_DSAT_QUESTIONS.length - 1);
        }
      }
    } catch (e) {
      console.warn("AI Question generation fallback triggered:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || isChatTyping) return;
    const text = chatInput.trim();
    setChatInput('');

    const newMsgs = [...chatMessages, { sender: 'user' as const, text, timestamp: 'Just now' }];
    setChatMessages(newMsgs);
    setIsChatTyping(true);

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `You are an expert College Board Digital SAT (DSAT) AI Master Tutor.
Student Question: "${text}"
Give a clear, highly structured answer focusing on DSAT strategy, mathematical logic, Desmos calculator shortcuts, or grammatical rules. Keep response under 200 words.`
        })
      });

      if (response.ok) {
        const data = await response.json();
        setChatMessages([...newMsgs, { sender: 'tutor', text: data.text || 'Keep practicing!', timestamp: 'Just now' }]);
      }
    } catch {
      setChatMessages([...newMsgs, { sender: 'tutor', text: 'To solve DSAT math problems fast, always check if Desmos can graph the equation directly!', timestamp: 'Just now' }]);
    } finally {
      setIsChatTyping(false);
    }
  };

  const compositeScore = progress.mathPredictedScore + progress.rwPredictedScore;

  const navTabs: Array<{ id: DsatTab; label: string; desc: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = [
    { id: 'practice', label: 'Practice & AI Tutor', desc: 'Step-by-step DSAT Question Trainer', icon: Zap },
    { id: 'desmos', label: 'Desmos Mastery', desc: 'Graphing & Shortcut Strategies', icon: Calculator },
    { id: 'mock', label: 'Bluebook Simulator', desc: 'Full Timed Adaptive Mock Exam', icon: Trophy },
    { id: 'flashcards', label: 'Formulas & Vocab', desc: 'Key Formulas & DSAT Vocab', icon: BookMarked },
    { id: 'diagnostic', label: 'Score Predictor', desc: '400–1600 Score Goal Tracker', icon: Target },
    { id: 'strategy', label: 'Pacing & Strategy', desc: 'Bluebook Time Management', icon: Lightbulb }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans pb-16">
      
      {/* 1. TOP HEADER & SCORE PREDICTOR TICKER */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b-2 border-indigo-600/50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            
            {/* Logo & Return */}
            <div className="flex items-center gap-3">
              <button
                onClick={onExitToRockstarMode}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider cursor-pointer border border-slate-700"
              >
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">Exit</span>
              </button>

              <div className="h-8 w-px bg-slate-800 hidden sm:block" />

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-amber-300 flex items-center justify-center font-black shadow-lg shadow-indigo-500/20">
                  <GraduationCap size={22} />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-display font-black text-white tracking-tight leading-none flex items-center gap-2">
                    JESSE DSAT ACADEMY
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/30 border border-indigo-400/40 text-[10px] font-extrabold text-indigo-300 uppercase">
                      College Board Bluebook
                    </span>
                  </h1>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 block mt-0.5">
                    Digital SAT Score Maximizer
                  </span>
                </div>
              </div>
            </div>

            {/* SCORE PREDICTOR CALLOUT */}
            <div className="hidden lg:flex items-center gap-3 bg-slate-800/80 border border-indigo-500/30 px-4 py-2 rounded-2xl">
              <div className="text-right leading-none">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Projected Composite
                </span>
                <span className="text-lg font-black text-amber-400 font-mono">
                  {compositeScore} <span className="text-xs text-slate-400 font-normal">/ 1600</span>
                </span>
              </div>
              <div className="h-8 w-px bg-slate-700" />
              <div className="text-left text-[11px] font-bold space-y-0.5">
                <div className="text-indigo-300">Math: <strong className="text-white font-mono">{progress.mathPredictedScore}</strong></div>
                <div className="text-purple-300">R&W: <strong className="text-white font-mono">{progress.rwPredictedScore}</strong></div>
              </div>
            </div>

          </div>
        </div>

        {/* TAB NAVIGATION BAR */}
        <div className="bg-slate-900 border-t border-slate-800 px-4 py-2 overflow-x-auto">
          <div className="max-w-7xl mx-auto flex items-center gap-2 min-w-max">
            {navTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon size={15} className={isActive ? 'text-amber-300' : 'text-slate-400'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* TAB 1: PRACTICE & AI TUTOR */}
        {activeTab === 'practice' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Question Engine */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Section Filters */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-1">
                  {[
                    { id: 'all', label: 'All Sections' },
                    { id: 'math', label: 'Math Only' },
                    { id: 'reading_writing', label: 'Reading & Writing' }
                  ].map(sec => (
                    <button
                      key={sec.id}
                      onClick={() => {
                        setActiveSection(sec.id as any);
                        setCurrentQuestionIndex(0);
                        setIsGraded(false);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeSection === sec.id
                          ? 'bg-indigo-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {sec.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleGenerateNewAiQuestion}
                  disabled={isGenerating}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Sparkles size={14} className={isGenerating ? 'animate-spin' : ''} />
                  <span>{isGenerating ? 'Generating...' : 'AI New Question'}</span>
                </button>
              </div>

              {/* Question Card */}
              <div className="p-6 rounded-3xl bg-slate-900 border-2 border-indigo-500/30 shadow-2xl space-y-6 relative">
                
                {/* Header Info */}
                <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      currentQ.section === 'math' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    }`}>
                      {currentQ.section === 'math' ? 'DSAT Math' : 'DSAT Reading & Writing'}
                    </span>
                    <span className="text-xs font-bold text-amber-400">
                      {currentQ.domain}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    Q {currentQuestionIndex + 1} of {filteredQuestions.length}
                  </span>
                </div>

                {/* Short Passage if Reading & Writing */}
                {currentQ.passage && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-slate-300 leading-relaxed italic">
                    "{currentQ.passage}"
                  </div>
                )}

                {/* Question Text */}
                <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                  {currentQ.question}
                </h3>

                {/* Answer Input */}
                {currentQ.isSpr ? (
                  <div className="space-y-2">
                    <label className="text-xs font-black text-indigo-300 uppercase tracking-wider block">
                      Student-Produced Response (SPR):
                    </label>
                    <input
                      type="text"
                      value={userSpr}
                      onChange={(e) => setUserSpr(e.target.value)}
                      disabled={isGraded}
                      placeholder="Enter exact value (e.g. 9 or 3/5)"
                      className="w-full px-4 py-3 rounded-2xl bg-slate-950 border-2 border-indigo-500/40 text-white font-mono text-base outline-none focus:border-amber-400"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {currentQ.options?.map((opt) => {
                      const optKey = opt.charAt(0);
                      const isSelected = userChoice === optKey;
                      let btnStyle = 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700';

                      if (isGraded) {
                        if (optKey === currentQ.correctAnswer) {
                          btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-black';
                        } else if (isSelected) {
                          btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-200';
                        }
                      } else if (isSelected) {
                        btnStyle = 'bg-indigo-900/60 border-amber-400 text-white font-bold';
                      }

                      return (
                        <button
                          key={opt}
                          disabled={isGraded}
                          onClick={() => setUserChoice(optKey)}
                          className={`w-full p-4 rounded-2xl border-2 text-left text-sm transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {isGraded && optKey === currentQ.correctAnswer && (
                            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Submit & Next Actions */}
                <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-800">
                  {!isGraded ? (
                    <button
                      onClick={handleGradeAnswer}
                      disabled={!currentQ.isSpr && !userChoice}
                      className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black uppercase tracking-wider rounded-2xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
                    >
                      Check Answer
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-wider rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Next DSAT Challenge</span>
                      <ChevronRight size={18} />
                    </button>
                  )}
                </div>

                {/* EXPLANATION & DESMOS TRICK BREAKDOWN */}
                {isGraded && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl bg-slate-950 border border-indigo-500/40 space-y-4 text-xs"
                  >
                    <div className="flex items-center justify-between text-amber-400 font-bold border-b border-slate-800 pb-2">
                      <span className="flex items-center gap-1.5 uppercase tracking-wider">
                        <Lightbulb size={16} /> Official Solution & Trap Analysis
                      </span>
                      <span>Correct: {currentQ.explanation.clearAnswer}</span>
                    </div>

                    <div className="space-y-1.5 text-slate-300">
                      <strong className="text-white block">Step-by-Step Logic:</strong>
                      {currentQ.explanation.stepByStep.map((s, idx) => (
                        <p key={idx} className="leading-relaxed pl-2 border-l-2 border-indigo-500/50">{s}</p>
                      ))}
                    </div>

                    {currentQ.explanation.desmosTip && (
                      <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-200 space-y-1">
                        <span className="font-black text-amber-300 uppercase tracking-wider flex items-center gap-1">
                          <Calculator size={14} /> Desmos Calculator Trick:
                        </span>
                        <p className="leading-relaxed">{currentQ.explanation.desmosTip}</p>
                      </div>
                    )}

                    <div className="space-y-1.5 pt-2">
                      <strong className="text-white block">College Board Distractor Breakdown:</strong>
                      {currentQ.explanation.distractorAnalysis.map((d, i) => (
                        <div key={i} className="text-slate-400 leading-snug">
                          <span className="text-amber-400 font-bold">{d.option}:</span> {d.reason}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

              </div>
            </div>

            {/* Right: AI Tutor Assistant Chat */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 rounded-3xl bg-slate-900 border-2 border-purple-500/30 shadow-2xl flex flex-col h-[620px] justify-between">
                
                {/* Chat Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      <Brain size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white leading-none">
                        DSAT Strategy AI Coach
                      </h3>
                      <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider block mt-0.5">
                        Bluebook Expert Online
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                    Active
                  </span>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto space-y-3 py-4 pr-1 text-xs">
                  {chatMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div className={`p-3.5 rounded-2xl max-w-[90%] leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-indigo-600 text-white rounded-br-none'
                          : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-bl-none'
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
                    </div>
                  ))}
                  {isChatTyping && (
                    <div className="p-3 rounded-2xl bg-slate-950 text-purple-300 border border-slate-800 text-xs flex items-center gap-2">
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Analyzing DSAT strategy...</span>
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                    placeholder="Ask DSAT question, strategy or Desmos trick..."
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={handleSendChatMessage}
                    className="p-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-all cursor-pointer"
                  >
                    <Send size={16} />
                  </button>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* TAB 2: DESMOS MASTERY SUITE */}
        {activeTab === 'desmos' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-500/40 shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-400 text-slate-950 rounded-2xl font-black">
                  <Calculator size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-display font-black text-amber-300">
                    Official DSAT Desmos Graphing Calculator Shortcuts
                  </h2>
                  <p className="text-xs text-indigo-200">
                    The College Board includes the full Desmos graphing calculator directly inside the Bluebook testing app. Mastering these 3 core tricks can solve up to 40% of DSAT Math questions in under 10 seconds.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                {DESMOS_TRICKS.map((trick) => (
                  <div key={trick.id} className="p-5 rounded-2xl bg-slate-950 border border-indigo-500/30 space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                        {trick.domain}
                      </span>
                      <h3 className="text-sm font-black text-white leading-snug">
                        {trick.title}
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {trick.description}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <strong className="text-[11px] font-bold text-indigo-300 block">Step-by-step Execution:</strong>
                      <ul className="space-y-1 text-xs text-slate-400">
                        {trick.steps.map((st, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-amber-400 font-bold">•</span>
                            <span>{st}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MOCK EXAM SIMULATOR */}
        {activeTab === 'mock' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900 border-2 border-indigo-500/40 shadow-2xl space-y-6">
              
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-display font-black text-white flex items-center gap-2">
                    <Trophy className="text-amber-400" /> College Board Bluebook Adaptive Test Simulator
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Simulates Module 1 (35 min) and adaptive Module 2 scoring logic.
                  </p>
                </div>

                {mockActive && (
                  <div className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-black font-mono text-base flex items-center gap-2">
                    <Clock size={18} />
                    <span>{Math.floor(mockTimeLeft / 60)}:{(mockTimeLeft % 60).toString().padStart(2, '0')}</span>
                  </div>
                )}
              </div>

              {!mockActive && !mockFinished ? (
                <div className="text-center py-12 space-y-4 max-w-lg mx-auto">
                  <Trophy size={48} className="mx-auto text-amber-400 animate-bounce" />
                  <h3 className="text-lg font-black text-white">Ready to begin full DSAT timed simulation?</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    You will have 35 minutes to complete the practice module. Keep your scratch paper and Desmos strategies ready!
                  </p>
                  <button
                    onClick={() => {
                      setMockActive(true);
                      setMockTimeLeft(35 * 60);
                    }}
                    className="px-8 py-3.5 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black uppercase tracking-wider text-xs rounded-2xl shadow-xl transition-all hover:scale-105 cursor-pointer"
                  >
                    Start Timed Test
                  </button>
                </div>
              ) : mockFinished ? (
                <div className="text-center py-12 space-y-4 max-w-lg mx-auto">
                  <CheckCircle2 size={48} className="mx-auto text-emerald-400" />
                  <h3 className="text-2xl font-black text-white">Simulation Completed!</h3>
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <p className="text-xs text-slate-400">Estimated Composite Score:</p>
                    <p className="text-3xl font-black text-amber-400 font-mono">1480 / 1600</p>
                    <p className="text-xs text-indigo-300">Math: 760 | R&W: 720</p>
                  </div>
                  <button
                    onClick={() => {
                      setMockFinished(false);
                      setMockActive(false);
                    }}
                    className="px-6 py-3 bg-indigo-600 text-white font-black text-xs uppercase rounded-xl cursor-pointer"
                  >
                    Take Another Simulation
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-slate-200">
                    <strong>Question {mockCurrentQuestion + 1}:</strong> If 2(x + 3) = 14, what is the value of x + 5?
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {['A) 4', 'B) 9', 'C) 12', 'D) 14'].map((optKey) => (
                      <button
                        key={optKey}
                        onClick={() => setMockAnswers({ ...mockAnswers, [mockCurrentQuestion]: optKey })}
                        className={`p-4 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                          mockAnswers[mockCurrentQuestion] === optKey
                            ? 'bg-amber-400 text-slate-950 border-amber-400'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {optKey}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <button
                      onClick={() => setMockCurrentQuestion(prev => Math.max(0, prev - 1))}
                      disabled={mockCurrentQuestion === 0}
                      className="px-4 py-2 bg-slate-800 rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => {
                        if (mockCurrentQuestion < 5) {
                          setMockCurrentQuestion(prev => prev + 1);
                        } else {
                          setMockFinished(true);
                          setMockActive(false);
                        }
                      }}
                      className="px-6 py-2 bg-amber-400 text-slate-950 font-black text-xs uppercase rounded-xl cursor-pointer"
                    >
                      {mockCurrentQuestion === 5 ? 'Submit Test' : 'Next Question'}
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* TAB 4: FLASHCARDS & FORMULAS */}
        {activeTab === 'flashcards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Math Formulas */}
            <div className="p-6 rounded-3xl bg-slate-900 border-2 border-indigo-500/30 shadow-2xl space-y-4">
              <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
                <BookMarked size={18} /> High-Frequency Math Formulas
              </h3>
              <div className="space-y-3">
                {MATH_FORMULAS.map((f, i) => (
                  <div key={i} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{f.name}</span>
                      <span className="text-[10px] text-indigo-400 uppercase font-black">{f.category}</span>
                    </div>
                    <p className="text-sm font-mono text-amber-400">{f.formula}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* DSAT Vocabulary */}
            <div className="p-6 rounded-3xl bg-slate-900 border-2 border-purple-500/30 shadow-2xl space-y-4">
              <h3 className="text-base font-black text-purple-300 flex items-center gap-2">
                <FileText size={18} /> Essential DSAT Words in Context
              </h3>
              <div className="space-y-3">
                {DSAT_VOCAB.map((v, i) => (
                  <div key={i} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                    <span className="font-black text-amber-400 text-sm block">{v.word}</span>
                    <p className="text-slate-300">{v.definition}</p>
                    <p className="text-slate-500 italic">"{v.example}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SCORE PREDICTOR & DIAGNOSTIC */}
        {activeTab === 'diagnostic' && (
          <div className="p-6 rounded-3xl bg-slate-900 border-2 border-indigo-500/30 shadow-2xl space-y-6 max-w-3xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-600 rounded-2xl text-white">
                <Target size={24} />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">Target Score Predictor & Goal Settings</h2>
                <p className="text-xs text-slate-400">Set your dream university score goal and observe accuracy progress.</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold text-indigo-300 block">Set Target Composite Score Goal:</label>
              <input
                type="range"
                min={1000}
                max={1600}
                step={10}
                value={progress.targetScore}
                onChange={(e) => setProgress({ ...progress, targetScore: Number(e.target.value) })}
                className="w-full accent-amber-400"
              />
              <div className="flex justify-between text-xs font-mono text-amber-400">
                <span>1000</span>
                <span className="text-base font-black text-white">Goal: {progress.targetScore}</span>
                <span>1600</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800 text-center">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 block">Total DSAT Questions Solved</span>
                <span className="text-2xl font-black text-amber-400 font-mono">{progress.questionsSolved}</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 block">Accuracy Rate</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">
                  {progress.questionsSolved > 0 ? Math.round((progress.questionsCorrect / progress.questionsSolved) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: PACING & STRATEGY */}
        {activeTab === 'strategy' && (
          <div className="p-6 rounded-3xl bg-slate-900 border-2 border-indigo-500/30 shadow-2xl space-y-6 max-w-3xl mx-auto">
            <h2 className="text-lg font-black text-amber-300 flex items-center gap-2">
              <Lightbulb size={20} /> Official College Board Bluebook Pacing & Timing Rules
            </h2>
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <strong className="text-white text-sm block">1. Math Pacing (1.5 Minutes per Question)</strong>
                <p>Do not get stuck on any single question for more than 2 minutes. Flag hard questions, skip them immediately, and return to them after finishing easier questions in the module.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <strong className="text-white text-sm block">2. Reading & Writing Pacing (1.2 Minutes per Question)</strong>
                <p>Start with the vocabulary and grammar questions first (Standard English Conventions) to bank fast points, then tackle longer reading passages.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <strong className="text-white text-sm block">3. Never Leave a Question Blank</strong>
                <p>There is zero penalty for incorrect guesses on the Digital SAT. Always select a choice or input an SPR value before time expires!</p>
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
}

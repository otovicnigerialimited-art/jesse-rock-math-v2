import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Play, Star, ChevronRight, ArrowLeft, Plus, Minus, Check, HelpCircle, AlertTriangle, Globe, Sparkles, XCircle, Info } from 'lucide-react';
import { Lesson, Difficulty } from '../types';
import { cn } from '../lib/utils';

const LESSONS: Lesson[] = [
  {
    id: '1',
    title: 'Multiplication Mastery',
    description: 'Learn how multiplication works step-by-step with interactive grids.',
    content: 'Multiplication is just repeated addition. 3 x 4 means 3 + 3 + 3 + 3.',
    category: 'Arithmetic',
    difficulty: 'easy',
    problemTypes: ['multiplication']
  },
  {
    id: '2',
    title: 'Division Decoded',
    description: 'Understand how to split groups of items fairly with zero remainders.',
    content: 'Division is the inverse of multiplication. If 3 x 4 = 12, then 12 / 4 = 3.',
    category: 'Arithmetic',
    difficulty: 'medium',
    problemTypes: ['division']
  },
  {
    id: '4',
    title: 'Long Division Arena',
    description: 'Master step-by-step long division using the DMSB method.',
    content: 'Long division involves finding how many times a divisor fits into parts of a dividend, subtracting, and bringing down the next digit.',
    category: 'Arithmetic',
    difficulty: 'hard',
    problemTypes: ['long_division']
  },
  {
    id: '5',
    title: 'Fraction Fusion',
    description: 'Learn fraction parts with visual interactive pie blocks.',
    content: 'When adding fractions with the same denominator, add the numerators and keep the denominator. Always simplify your result!',
    category: 'Arithmetic',
    difficulty: 'extreme',
    problemTypes: ['fractions_addition']
  },
  {
    id: '3',
    title: 'Algebraic Basics',
    description: 'Introduction to balancing equations and finding the secret x.',
    content: 'Variables like "x" are placeholders for numbers we don\'t know yet.',
    category: 'Algebra',
    difficulty: 'hard',
    problemTypes: ['addition', 'subtraction', 'multiplication', 'division']
  },
  {
    id: 'elem1',
    title: 'Place Value & Sense',
    description: 'Learn the true value of numbers based on their position.',
    content: 'Understand ones, tens, hundreds, and thousands.',
    category: 'Arithmetic',
    difficulty: 'easy',
    problemTypes: ['place_value']
  },
  {
    id: 'elem2',
    title: 'Time & Clocks',
    description: 'Master time concepts from seconds to days.',
    content: 'How many seconds in a minute? Hours in a day?',
    category: 'Arithmetic',
    difficulty: 'easy',
    problemTypes: ['time']
  },
  {
    id: 'elem3',
    title: 'Money Math',
    description: 'Practice counting coins and calculating change.',
    content: 'Quarters, dimes, nickels, and making exact change.',
    category: 'Arithmetic',
    difficulty: 'medium',
    problemTypes: ['money']
  },
  {
    id: 'elem4',
    title: 'Number Patterns',
    description: 'Find the missing number in skip-counting patterns.',
    content: 'Recognize sequences and find the next logical step.',
    category: 'Arithmetic',
    difficulty: 'easy',
    problemTypes: ['number_patterns']
  },
  {
    id: 'jh1',
    title: 'Exponents',
    description: 'Multiply a number by itself multiple times.',
    content: 'Squares, cubes, and higher powers.',
    category: 'Algebra',
    difficulty: 'medium',
    problemTypes: ['exponents']
  },
  {
    id: 'jh2',
    title: 'Integers',
    description: 'Master operations with negative and positive numbers.',
    content: 'Adding, subtracting, and multiplying negative numbers.',
    category: 'Algebra',
    difficulty: 'medium',
    problemTypes: ['integers']
  },
  {
    id: 'jh3',
    title: 'Ratios',
    description: 'Compare quantities using ratios.',
    content: 'Understand proportions and dividing amounts by ratio.',
    category: 'Algebra',
    difficulty: 'hard',
    problemTypes: ['ratios']
  },
  {
    id: 'jh4',
    title: 'Geometry & Angles',
    description: 'Calculate complementary, supplementary, and triangle angles.',
    content: 'Triangles sum to 180 degrees. Complementary to 90.',
    category: 'Geometry',
    difficulty: 'hard',
    problemTypes: ['geometry_angles']
  },
  {
    id: 'jh5',
    title: 'Probability',
    description: 'Calculate the chances of events occurring.',
    content: 'Fractions representing likelihood out of total possibilities.',
    category: 'Arithmetic',
    difficulty: 'extreme',
    problemTypes: ['probability']
  }

];

interface LearningHubProps {
  onStartLesson: (lesson: Lesson) => void;
  stats?: any;
}

export default function LearningHub({ onStartLesson, stats }: LearningHubProps) {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [infoTab, setInfoTab] = useState<'concept' | 'realworld' | 'mistakes'>('concept');

  // Multiplication Interactive States
  const [multNum1, setMultNum1] = useState(4);
  const [multNum2, setMultNum2] = useState(5);

  // Division Interactive States
  const [divTotal, setDivTotal] = useState(12);
  const [divGroups, setDivGroups] = useState(3);

  // Long Division step state
  const [longDivStep, setLongDivStep] = useState(0);

  // Fraction interactive states
  const [fracNum1, setFracNum1] = useState(2);
  const [fracNum2, setFracNum2] = useState(1);
  const [fracDen, setFracDen] = useState(5);

  // Algebra interactive states
  const [algTarget, setAlgTarget] = useState(12);
  const [algConst, setAlgConst] = useState(4);
  const [algGuess, setAlgGuess] = useState(5);
  const [showAlgTip, setShowAlgTip] = useState(true);

  // Reset interactive parameters on lesson shift
  const handleSelectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setLongDivStep(0);
    setInfoTab('concept');
    // Preset states
    if (lesson.id === '1') {
      setMultNum1(4);
      setMultNum2(5);
    } else if (lesson.id === '2') {
      setDivTotal(12);
      setDivGroups(3);
    } else if (lesson.id === '4') {
      setLongDivStep(0);
    } else if (lesson.id === '5') {
      setFracNum1(2);
      setFracNum2(1);
      setFracDen(5);
    } else if (lesson.id === '3') {
      setAlgTarget(12);
      setAlgConst(4);
      setAlgGuess(5);
    }
  };

  const renderGuidePanel = (lessonId: string) => {
    return (
      <div className="flex flex-col h-full bg-white backdrop-blur-sm border border-deep-navy border-4 rounded-[2rem] p-5 shadow-lg space-y-4">
        {/* Striker Tab Controls */}
        <div className="flex border-b-4 border-deep-navy pb-2 overflow-x-auto whitespace-nowrap scrollbar-none gap-2">
          {(['concept', 'realworld', 'mistakes'] as const).map(tab => {
            const labels = {
              concept: '📖 Concept & Methods',
              realworld: '🌎 Real-World Links',
              mistakes: '⚠️ Common Mistakes'
            };
            const active = infoTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setInfoTab(tab)}
                className={cn(
                  "px-3 py-1.5 font-black text-[10px] uppercase tracking-wider border-2 border-deep-navy rounded-xl transition-all cursor-pointer",
                  active 
                    ? "bg-brand-secondary text-deep-navy shadow-[2px_2px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5" 
                    : "bg-white/40 text-deep-navy hover:bg-white/70"
                )}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto max-h-[360px] pr-1 space-y-4 scrollbar-thin text-deep-navy">
          {/* multiplication */}
          {lessonId === '1' && (
            <>
              {infoTab === 'concept' && (
                <div className="space-y-3">
                  <div className="bg-sunny-yellow/10 border border-deep-navy/30 p-3 rounded-2xl">
                    <h4 className="font-extrabold text-sm flex items-center gap-1.5"><Sparkles size={14} className="text-brand-secondary" /> What is Multiplication?</h4>
                    <p className="text-xs mt-1 leading-relaxed text-deep-navy">
                      Multiplication is just a super-fast way to do repeated addition! Instead of writing a long chain like <strong>4 + 4 + 4 + 4 + 4</strong>, you can write <strong>4 × 5</strong>. It calculates the total number of items when arranged in equal rows and columns.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-slate-500">3 Cool Methods to Solve It:</h5>
                    <div className="grid gap-2 text-xs">
                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="font-bold text-brand-secondary">1. Repeated Addition Method:</span>
                        <p className="text-[11px] mt-0.5 text-slate-700">Write down the number and add it to itself. For 4 × 3, add 4 three times: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200">4 + 4 + 4 = 12</code>.</p>
                      </div>
                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="font-bold text-violet-500">2. The Array/Grid Method:</span>
                        <p className="text-[11px] mt-0.5 text-slate-700">Arrange items in a grid. Count columns (width) and rows (height). Try adjusting the sliders in our grid tool on the left to see this live!</p>
                      </div>
                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="font-bold text-emerald-500">3. Skip Counting Method:</span>
                        <p className="text-[11px] mt-0.5 text-slate-700">Count up by that number. To find 5 × 3, count by 5 three times: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200">5, 10, 15</code>!</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-white border border-deep-navy/20 rounded-xl">
                    <h5 className="font-bold text-xs text-deep-navy">📝 Detailed Examples:</h5>
                    <ul className="list-disc pl-4 text-xs mt-1 space-y-1 text-slate-700 leading-relaxed">
                      <li><strong>3 × 6 = 18:</strong> 3 groups of 6 (6 + 6 + 6) or 3 rows of 6 stars.</li>
                      <li><strong>5 × 4 = 20:</strong> 5 groups of 4 (4 + 4 + 4 + 4 + 4) or 5 columns of 4 blocks.</li>
                    </ul>
                  </div>
                </div>
              )}

              {infoTab === 'realworld' && (
                <div className="space-y-3">
                  <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe size={18} className="text-sky-500 animate-pulse" />
                      <h4 className="font-extrabold text-sm text-sky-800">Setting up the Rock Concert Speakers! 🔊</h4>
                    </div>
                    <p className="text-xs leading-relaxed text-sky-950">
                      Imagine you are setting up a massive rock concert stage! You have huge concert speakers and want to stack them in <strong>4 columns</strong>, and make each column <strong>5 speakers high</strong>. 
                    </p>
                    <p className="text-xs leading-relaxed text-sky-950 mt-1">
                      Instead of walking around counting them one-by-one, you look at the grid layout and multiply: <br />
                      <strong className="text-sky-800 text-sm">4 Columns × 5 Speakers = 20 total speakers!</strong>
                    </p>
                  </div>

                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                    <h5 className="font-bold text-xs text-emerald-800 mb-1">Guitar Strings Check: ⚽</h5>
                    <p className="text-xs leading-relaxed text-emerald-950">
                      Each football boot has exactly <strong>6 strings</strong>. If you have <strong>3 striker football boots</strong> lined up on stage, how many strings do you need to tune? <br />
                      <strong className="text-emerald-800">3 football boots × 6 Strings = 18 total strings!</strong>
                    </p>
                  </div>
                </div>
              )}

              {infoTab === 'mistakes' && (
                <div className="space-y-3">
                  <h4 className="font-extrabold text-sm text-deep-navy">Watch out for these common slips!</h4>
                  
                  <div className="grid gap-3">
                    <div className="border border-deep-navy/20 rounded-xl overflow-hidden text-xs">
                      <div className="bg-rose-500/15 p-2 border-b border-deep-navy/20 font-bold text-rose-700 flex items-center gap-1">
                        <XCircle size={14} /> Mistake 1: Adding instead of multiplying!
                      </div>
                      <div className="p-3 bg-white space-y-1 text-slate-700 leading-normal">
                        <p className="text-[11px]"><strong className="text-rose-600">The Wrong Way:</strong> Thinking <code className="bg-rose-50 px-1 py-0.5 rounded font-mono text-rose-700">4 × 3</code> is <code className="bg-rose-50 px-1 py-0.5 rounded font-mono text-rose-700">4 + 3 = 7</code>. ❌</p>
                        <p className="text-[11px]"><strong className="text-emerald-600">The Right Way:</strong> <code className="bg-emerald-50 px-1 py-0.5 rounded font-mono text-emerald-700">4 × 3</code> means adding 4 three times: <code className="bg-emerald-50 px-1 py-0.5 rounded font-mono text-emerald-700">4 + 4 + 4 = 12</code>. ✅</p>
                      </div>
                    </div>

                    <div className="border border-deep-navy/20 rounded-xl overflow-hidden text-xs">
                      <div className="bg-rose-500/15 p-2 border-b border-deep-navy/20 font-bold text-rose-700 flex items-center gap-1">
                        <XCircle size={14} /> Mistake 2: Multiplying by 0 and keeping the number!
                      </div>
                      <div className="p-3 bg-white space-y-1 text-slate-700 leading-normal">
                        <p className="text-[11px]"><strong className="text-rose-600">The Wrong Way:</strong> Thinking <code className="bg-rose-50 px-1 py-0.5 rounded font-mono text-rose-700">7 × 0 = 7</code>. ❌</p>
                        <p className="text-[11px]"><strong className="text-emerald-600">The Right Way:</strong> Multiplying by 0 means you have zero groups of something, so the total is ALWAYS <code className="bg-emerald-50 px-1 py-0.5 rounded font-mono text-emerald-700">0</code>! <code className="bg-emerald-50 px-1 py-0.5 rounded font-mono text-emerald-700">7 × 0 = 0</code>. ✅</p>
                      </div>
                    </div>

                    <div className="border border-deep-navy/20 rounded-xl overflow-hidden text-xs">
                      <div className="bg-rose-500/15 p-2 border-b border-deep-navy/20 font-bold text-rose-700 flex items-center gap-1">
                        <XCircle size={14} /> Mistake 3: Multiplying by 1 and getting a wrong result!
                      </div>
                      <div className="p-3 bg-white space-y-1 text-slate-700 leading-normal">
                        <p className="text-[11px]"><strong className="text-rose-600">The Wrong Way:</strong> Thinking <code className="bg-rose-50 px-1 py-0.5 rounded font-mono text-rose-700">5 × 1 = 6</code> or <code className="bg-rose-50 px-1 py-0.5 rounded font-mono text-rose-700">1</code>. ❌</p>
                        <p className="text-[11px]"><strong className="text-emerald-600">The Right Way:</strong> Multiplying by 1 means you have exactly 1 group of that number, so the value stays exactly the same: <code className="bg-emerald-50 px-1 py-0.5 rounded font-mono text-emerald-700">5 × 1 = 5</code>. ✅</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* division */}
          {lessonId === '2' && (
            <>
              {infoTab === 'concept' && (
                <div className="space-y-3">
                  <div className="bg-sunny-yellow/10 border border-deep-navy/30 p-3 rounded-2xl">
                    <h4 className="font-extrabold text-sm flex items-center gap-1.5"><Sparkles size={14} className="text-brand-secondary" /> What is Division?</h4>
                    <p className="text-xs mt-1 leading-relaxed text-deep-navy">
                      Division is all about <strong>equal sharing</strong> or split-sorting items fairly into a set number of groups. It is the exact opposite of multiplication! If 3 × 4 = 12, then 12 ÷ 3 = 4.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-slate-500">3 Useful Methods to Split Numbers:</h5>
                    <div className="grid gap-2 text-xs">
                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="font-bold text-brand-secondary">1. Fair Sharing Method:</span>
                        <p className="text-[11px] mt-0.5 text-slate-700">Deal out items one-by-one into groups (like dealing cards) until they are all shared out. Play with the item slider on the left to see this visual deal-out in action!</p>
                      </div>
                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="font-bold text-violet-400">2. Repeated Subtraction:</span>
                        <p className="text-[11px] mt-0.5 text-slate-700">Subtract the divisor repeatedly from the total until you hit 0. For 12 ÷ 3: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200">12-3=9, 9-3=6, 6-3=3, 3-3=0</code>. We subtracted 3 exactly 4 times, so 12 ÷ 3 = 4!</p>
                      </div>
                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="font-bold text-emerald-500">3. Multiplication Inverse Check:</span>
                        <p className="text-[11px] mt-0.5 text-slate-700">Ask yourself: "What number multiplied by the divisor equals the total?" Since <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200">3 × 4 = 12</code>, we know <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200">12 ÷ 3 = 4</code>!</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-white border border-deep-navy/20 rounded-xl">
                    <h5 className="font-bold text-xs text-deep-navy">📝 Detailed Examples:</h5>
                    <ul className="list-disc pl-4 text-xs mt-1 space-y-1 text-slate-700 leading-relaxed">
                      <li><strong>15 ÷ 3 = 5:</strong> 15 items divided into 3 equal bins gives 5 items per bin.</li>
                      <li><strong>20 ÷ 5 = 4:</strong> 20 items split into 5 equal bins gives 4 items per bin.</li>
                    </ul>
                  </div>
                </div>
              )}

              {infoTab === 'realworld' && (
                <div className="space-y-3">
                  <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe size={18} className="text-sky-500 animate-pulse" />
                      <h4 className="font-extrabold text-sm text-sky-800">Sharing Band Equipment! 🥁</h4>
                    </div>
                    <p className="text-xs leading-relaxed text-sky-950">
                      Your rock band just finished a sold-out rehearsal, and the studio owner hands you a box of <strong>12 professional drumsticks</strong> to take home.
                    </p>
                    <p className="text-xs leading-relaxed text-sky-950 mt-1">
                      There are <strong>3 band members</strong> (Singer, Guitarist, and Drummer) who want to share them perfectly. How many drumsticks does each member get? <br />
                      <strong className="text-sky-800 text-sm">12 Drumsticks ÷ 3 Members = 4 sticks each!</strong>
                    </p>
                  </div>

                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                    <h5 className="font-bold text-xs text-emerald-800 mb-1">Classroom Concert VIP Passes: 🎫</h5>
                    <p className="text-xs leading-relaxed text-emerald-950">
                      You have <strong>24 backstage VIP wristbands</strong>. If you want to split them equally among <strong>6 eager fan clubs</strong>, how many does each club get? <br />
                      <strong className="text-emerald-800">24 Passes ÷ 6 Clubs = 4 passes per club!</strong>
                    </p>
                  </div>
                </div>
              )}

              {infoTab === 'mistakes' && (
                <div className="space-y-3">
                  <h4 className="font-extrabold text-sm text-deep-navy">Don't trip on these tricky rules!</h4>
                  
                  <div className="grid gap-3">
                    <div className="border border-deep-navy/20 rounded-xl overflow-hidden text-xs">
                      <div className="bg-rose-500/15 p-2 border-b border-deep-navy/20 font-bold text-rose-700 flex items-center gap-1">
                        <XCircle size={14} /> Mistake 1: Dividing by zero!
                      </div>
                      <div className="p-3 bg-white space-y-1 text-slate-700 leading-normal">
                        <p className="text-[11px]"><strong className="text-rose-600">The Wrong Way:</strong> Thinking <code className="bg-rose-50 px-1 py-0.5 rounded font-mono text-rose-700">8 ÷ 0 = 8</code> or <code className="bg-rose-50 px-1 py-0.5 rounded font-mono text-rose-700">0</code>. ❌</p>
                        <p className="text-[11px]"><strong className="text-emerald-600">The Right Way:</strong> Dividing by zero is <strong>impossible (undefined)</strong>! You cannot share 8 cookies among 0 people—there's no logical way to do it. ✅</p>
                      </div>
                    </div>

                    <div className="border border-deep-navy/20 rounded-xl overflow-hidden text-xs">
                      <div className="bg-rose-500/15 p-2 border-b border-deep-navy/20 font-bold text-rose-700 flex items-center gap-1">
                        <XCircle size={14} /> Mistake 2: Swapping the numbers backward!
                      </div>
                      <div className="p-3 bg-white space-y-1 text-slate-700 leading-normal">
                        <p className="text-[11px]"><strong className="text-rose-600">The Wrong Way:</strong> Thinking <code className="bg-rose-50 px-1 py-0.5 rounded font-mono text-rose-700">12 ÷ 3</code> is the same as <code className="bg-rose-50 px-1 py-0.5 rounded font-mono text-rose-700">3 ÷ 12</code>. ❌</p>
                        <p className="text-[11px]"><strong className="text-emerald-600">The Right Way:</strong> Order matters! <code className="bg-emerald-50 px-1 py-0.5 rounded font-mono text-emerald-700">12 ÷ 3 = 4</code> (12 toys shared with 3 kids). But <code className="bg-emerald-50 px-1 py-0.5 rounded font-mono text-emerald-700">3 ÷ 12 = 1/4</code> or <code className="bg-emerald-50 px-1 py-0.5 rounded font-mono text-emerald-700">0.25</code> (sharing 3 cookies among 12 people, so everyone gets a quarter!). ✅</p>
                      </div>
                    </div>

                    <div className="border border-deep-navy/20 rounded-xl overflow-hidden text-xs">
                      <div className="bg-rose-500/15 p-2 border-b border-deep-navy/20 font-bold text-rose-700 flex items-center gap-1">
                        <XCircle size={14} /> Mistake 3: Leaving a remainder bigger than the divisor!
                      </div>
                      <div className="p-3 bg-white space-y-1 text-slate-700 leading-normal">
                        <p className="text-[11px]"><strong className="text-rose-600">The Wrong Way:</strong> Saying <code className="bg-rose-50 px-1 py-0.5 rounded font-mono text-rose-700">14 ÷ 4 = 2 R 6</code>. ❌</p>
                        <p className="text-[11px]"><strong className="text-emerald-600">The Right Way:</strong> The remainder must ALWAYS be smaller than the number you are dividing by. If you have 6 leftover, you can fit another whole group of 4 inside it! <code className="bg-emerald-50 px-1 py-0.5 rounded font-mono text-emerald-700">14 ÷ 4 = 3 R 2</code>. ✅</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* long division */}
          {lessonId === '4' && (
            <>
              {infoTab === 'concept' && (
                <div className="space-y-3">
                  <div className="bg-sunny-yellow/10 border border-deep-navy/30 p-3 rounded-2xl">
                    <h4 className="font-extrabold text-sm flex items-center gap-1.5"><Sparkles size={14} className="text-brand-secondary" /> Master Long Division</h4>
                    <p className="text-xs mt-1 leading-relaxed text-deep-navy">
                      When numbers are too large to divide mentally, long division lets us slice and dice them into easy step-by-step pieces using place values!
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-slate-500">2 Popular Algorithms to Solve:</h5>
                    <div className="grid gap-2 text-xs">
                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="font-bold text-brand-secondary">1. DMSB Method (Traditional Standard):</span>
                        <p className="text-[11px] mt-0.5 text-slate-700">
                          Follow the steps of our family acronym: <br />
                          <strong>D</strong>ivide ➔ <strong>M</strong>ultiply ➔ <strong>S</strong>ubtract ➔ <strong>B</strong>ring Down. Repeat until nothing is left! Click through the steps in our Chalkboard Simulator on the left to see DMSB solve 148 ÷ 6.
                        </p>
                      </div>
                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="font-bold text-violet-400">2. Box Method (Area Model):</span>
                        <p className="text-[11px] mt-0.5 text-slate-700">
                          Draw a box for each digit of your dividend (Hundreds, Tens, Ones). Divide each digit, write the result on top, and carry over any subtraction leftovers to the next box on the right.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-white border border-deep-navy/20 rounded-xl">
                    <h5 className="font-bold text-xs text-deep-navy">📝 Walkthrough Example (148 ÷ 6):</h5>
                    <ul className="list-decimal pl-4 text-xs mt-1 space-y-1 text-slate-700 leading-relaxed">
                      <li><strong>Divide 14 by 6:</strong> fits 2 times. Put 2 on top.</li>
                      <li><strong>Multiply & Subtract:</strong> 2 × 6 = 12. 14 - 12 = 2 left.</li>
                      <li><strong>Bring Down:</strong> Drop the 8 to make 28.</li>
                      <li><strong>Divide 28 by 6:</strong> fits 4 times. Put 4 on top.</li>
                      <li><strong>Multiply & Subtract:</strong> 4 × 6 = 24. 28 - 24 = 4 remaining leftover.</li>
                      <li><strong>Result:</strong> 24 Remainder 4!</li>
                    </ul>
                  </div>
                </div>
              )}

              {infoTab === 'realworld' && (
                <div className="space-y-3">
                  <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe size={18} className="text-sky-500 animate-pulse" />
                      <h4 className="font-extrabold text-sm text-sky-800">Distributing Concert Wristbands! 🎟️</h4>
                    </div>
                    <p className="text-xs leading-relaxed text-sky-950">
                      Your band got sponsored to print exactly <strong>148 VIP backstage access passes</strong>. You want to hand them out to exactly <strong>6 school music clubs</strong> in your neighborhood.
                    </p>
                    <p className="text-xs leading-relaxed text-sky-950 mt-1">
                      To keep things completely fair, you want each school to get the exact same number of passes. How many does each school get, and how many leftover passes do you get to keep for your family?
                    </p>
                    <p className="text-xs leading-relaxed text-sky-950 mt-1.5 font-bold">
                      By running long division, 148 ÷ 6: <br />
                      • Each school gets exactly 24 passes! <br />
                      • You have exactly 4 leftover passes to hand-deliver to your siblings!
                    </p>
                  </div>
                </div>
              )}

              {infoTab === 'mistakes' && (
                <div className="space-y-3">
                  <h4 className="font-extrabold text-sm text-deep-navy">Avoid these common long division traps!</h4>
                  
                  <div className="grid gap-3">
                    <div className="border border-deep-navy/20 rounded-xl overflow-hidden text-xs">
                      <div className="bg-rose-500/15 p-2 border-b border-deep-navy/20 font-bold text-rose-700 flex items-center gap-1">
                        <XCircle size={14} /> Mistake 1: Forgetting the 0 placeholder up top!
                      </div>
                      <div className="p-3 bg-white space-y-1 text-slate-700 leading-normal">
                        <p className="text-[11px]"><strong className="text-rose-600">The Wrong Way:</strong> In <code className="bg-rose-50 px-1 py-0.5 rounded font-mono text-rose-700">412 ÷ 4</code>: 4÷4 is 1. Next, 1 is too small for 4, so you drop the 2 to make 12. 12÷4 is 3. You write the answer as <code className="font-bold">13</code>. ❌ (Double-check: 13 × 4 is only 52! Way off!)</p>
                        <p className="text-[11px]"><strong className="text-emerald-600">The Right Way:</strong> If a digit is too small to fit the divisor, you MUST write a <code className="bg-emerald-50 px-1 py-0.5 rounded font-mono text-emerald-700">0</code> up top before bringing down the next digit! <code className="bg-emerald-50 px-1 py-0.5 rounded font-mono text-emerald-700">412 ÷ 4 = 103</code>. ✅ (Double-check: 103 × 4 = 412! Perfect!)</p>
                      </div>
                    </div>

                    <div className="border border-deep-navy/20 rounded-xl overflow-hidden text-xs">
                      <div className="bg-rose-500/15 p-2 border-b border-deep-navy/20 font-bold text-rose-700 flex items-center gap-1">
                        <XCircle size={14} /> Mistake 2: Bringing down two numbers at the same time!
                      </div>
                      <div className="p-3 bg-white space-y-1 text-slate-700 leading-normal">
                        <p className="text-[11px]"><strong className="text-rose-600">The Wrong Way:</strong> Panicking when a digit doesn't fit, pulling down multiple digits instantly and losing track of the columns. ❌</p>
                        <p className="text-[11px]"><strong className="text-emerald-600">The Right Way:</strong> Bring down exactly ONE digit at a time. If the divisor does not fit, put a 0 up top, and only then bring down the next. ✅</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* fractions */}
          
          {/* Fallback for new elementary and junior high subjects */}
          {!['1', '2', '3', '4', '5'].includes(lessonId) && (
            <div className="space-y-4">
              <div className="bg-sunny-yellow/10 border border-deep-navy/30 p-4 rounded-2xl text-center space-y-2">
                <h4 className="font-black text-sm text-deep-navy">Rock on with this new topic!</h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  You're exploring advanced arenas. Take a moment to think critically about the mathematical concepts required here. There are no limits to what you can conquer in the Striker Arena!
                </p>
                <div className="text-4xl py-4 animate-bounce">⚽</div>
                <p className="text-xs font-bold text-brand-secondary">Ready to test your skills? Jump into the battle below!</p>
              </div>
            </div>
          )}

          {lessonId === '5' && (
            <>
              {infoTab === 'concept' && (
                <div className="space-y-3">
                  <div className="bg-sunny-yellow/10 border border-deep-navy/30 p-3 rounded-2xl">
                    <h4 className="font-extrabold text-sm flex items-center gap-1.5"><Sparkles size={14} className="text-brand-secondary" /> Master Fraction arithmetic</h4>
                    <p className="text-xs mt-1 leading-relaxed text-deep-navy">
                      Fractions are just equal portions of a single whole item (like slices of a circular pizza pie!).
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-slate-500">Understanding Fraction Anatomy:</h5>
                    <div className="grid gap-2 text-xs">
                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="font-bold text-brand-secondary">1. Denominator (The Bottom Number):</span>
                        <p className="text-[11px] mt-0.5 text-slate-700">
                          Tells you the total number of equal slices the entire pizza has been sliced into.
                        </p>
                      </div>
                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="font-bold text-violet-400">2. Numerator (The Top Number):</span>
                        <p className="text-[11px] mt-0.5 text-slate-700">
                          Tells you exactly how many of those equal slices you have in your hand.
                        </p>
                      </div>
                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="font-bold text-emerald-500">3. Adding Same-Denominator Fractions:</span>
                        <p className="text-[11px] mt-0.5 text-slate-700">
                          Since denominators match, the slice sizes are identical! Simply add the top numbers (numerators) together and keep the bottom number (denominator) exactly the same!
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-white border border-deep-navy/20 rounded-xl">
                    <h5 className="font-bold text-xs text-deep-navy">📝 Detailed Examples:</h5>
                    <ul className="list-disc pl-4 text-xs mt-1 space-y-1 text-slate-700 leading-relaxed">
                      <li><strong>2/5 + 1/5 = 3/5:</strong> You have 2 slices and your friend has 1 slice of a 5-slice pizza. Together you have 3 slices.</li>
                      <li><strong>4/10 + 2/10 = 6/10:</strong> Sum is 6/10. We can simplify this to <strong>3/5</strong> by dividing top and bottom by 2!</li>
                    </ul>
                  </div>
                </div>
              )}

              {infoTab === 'realworld' && (
                <div className="space-y-3">
                  <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe size={18} className="text-sky-500 animate-pulse" />
                      <h4 className="font-extrabold text-sm text-sky-800">Sharing the Band's Pizza Party! 🍕</h4>
                    </div>
                    <p className="text-xs leading-relaxed text-sky-950">
                      Your rock band orders a giant custom cheese pizza, cut into <strong>5 equal slices</strong> (the denominator is 5).
                    </p>
                    <p className="text-xs leading-relaxed text-sky-950 mt-1">
                      • The lead singer eats exactly 2 slices (<strong className="text-sky-800">2/5</strong> of the pizza). <br />
                      • The drummer eats exactly 1 slice (<strong className="text-sky-800">1/5</strong> of the pizza).
                    </p>
                    <p className="text-xs leading-relaxed text-sky-950 mt-1">
                      Together, how much of the pizza have they eaten? <br />
                      <strong className="text-sky-800 text-sm">2/5 + 1/5 = 3/5 of the total pizza!</strong> <br />
                      This leaves exactly 2/5 (2 slices) remaining for the guitarist!
                    </p>
                  </div>
                </div>
              )}

              {infoTab === 'mistakes' && (
                <div className="space-y-3">
                  <h4 className="font-extrabold text-sm text-deep-navy">Don't fall for these fraction errors!</h4>
                  
                  <div className="grid gap-3">
                    <div className="border border-deep-navy/20 rounded-xl overflow-hidden text-xs">
                      <div className="bg-rose-500/15 p-2 border-b border-deep-navy/20 font-bold text-rose-700 flex items-center gap-1">
                        <XCircle size={14} /> Mistake 1: Adding the denominators together!
                      </div>
                      <div className="p-3 bg-white space-y-1 text-slate-700 leading-normal">
                        <p className="text-[11px]"><strong className="text-rose-600">The Wrong Way:</strong> Calculating <code className="bg-rose-50 px-1 py-0.5 rounded font-mono text-rose-700">1/5 + 2/5 = 3/10</code>. ❌ (This is wrong because if you add two pieces of a 5-slice pizza, the pizza doesn't suddenly get sliced into 10 smaller parts!)</p>
                        <p className="text-[11px]"><strong className="text-emerald-600">The Right Way:</strong> Only add the top numerators! The denominator (the slice size) stays completely unchanged: <code className="bg-emerald-50 px-1 py-0.5 rounded font-mono text-emerald-700">1/5 + 2/5 = 3/5</code>. ✅</p>
                      </div>
                    </div>

                    <div className="border border-deep-navy/20 rounded-xl overflow-hidden text-xs">
                      <div className="bg-rose-500/15 p-2 border-b border-deep-navy/20 font-bold text-rose-700 flex items-center gap-1">
                        <XCircle size={14} /> Mistake 2: Thinking bigger denominator = bigger slice!
                      </div>
                      <div className="p-3 bg-white space-y-1 text-slate-700 leading-normal">
                        <p className="text-[11px]"><strong className="text-rose-600">The Wrong Way:</strong> Believing <code className="bg-rose-50 px-1 py-0.5 rounded font-mono text-rose-700">1/10</code> is larger than <code className="bg-rose-50 px-1 py-0.5 rounded font-mono text-rose-700">1/2</code> because 10 is bigger than 2. ❌</p>
                        <p className="text-[11px]"><strong className="text-emerald-600">The Right Way:</strong> The larger the bottom number, the more pieces the whole is divided into, meaning each slice is MUCH smaller! <code className="bg-emerald-50 px-1 py-0.5 rounded font-mono text-emerald-700">1/2</code> is half a pizza, while <code className="bg-emerald-50 px-1 py-0.5 rounded font-mono text-emerald-700">1/10</code> is a tiny sliver! ✅</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* algebra */}
          {lessonId === '3' && (
            <>
              {infoTab === 'concept' && (
                <div className="space-y-3">
                  <div className="bg-sunny-yellow/10 border border-deep-navy/30 p-3 rounded-2xl">
                    <h4 className="font-extrabold text-sm flex items-center gap-1.5"><Sparkles size={14} className="text-brand-secondary" /> Balancing Equations</h4>
                    <p className="text-xs mt-1 leading-relaxed text-deep-navy">
                      Algebra is just a fun secret mystery! A letter like <strong>x</strong> is an empty box 📦 waiting for you to discover what number is hidden inside.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-slate-500">The Golden Rule & Methods:</h5>
                    <div className="grid gap-2 text-xs">
                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="font-bold text-brand-secondary">1. Keep the Scale Balanced:</span>
                        <p className="text-[11px] mt-0.5 text-slate-700">
                          An equation is like a playground see-saw. Whatever operation you perform on the left side of the equal sign, you MUST perform the exact same operation on the right side!
                        </p>
                      </div>
                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="font-bold text-violet-400">2. Inverse Operations Method:</span>
                        <p className="text-[11px] mt-0.5 text-slate-700">
                          Do the exact opposite operation to isolate the variable x: <br />
                          • Opposite of addition (+) is subtraction (-). <br />
                          • Opposite of subtraction (-) is addition (+). <br />
                          • Opposite of multiplication (×) is division (÷).
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-white border border-deep-navy/20 rounded-xl">
                    <h5 className="font-bold text-xs text-deep-navy">📝 Detailed Examples:</h5>
                    <ul className="list-disc pl-4 text-xs mt-1 space-y-1 text-slate-700 leading-relaxed">
                      <li><strong>x + 4 = 12:</strong> Subtract 4 from both sides to isolate x: <code className="bg-white px-1 py-0.5 rounded border border-slate-200">x + 4 - 4 = 12 - 4</code>, so <strong>x = 8</strong>!</li>
                      <li><strong>x - 5 = 10:</strong> Add 5 to both sides to isolate x: <code className="bg-white px-1 py-0.5 rounded border border-slate-200">x - 5 + 5 = 10 + 5</code>, so <strong>x = 15</strong>!</li>
                    </ul>
                  </div>
                </div>
              )}

              {infoTab === 'realworld' && (
                <div className="space-y-3">
                  <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe size={18} className="text-sky-500 animate-pulse" />
                      <h4 className="font-extrabold text-sm text-sky-800">The Mystery Instrument Case! 📦</h4>
                    </div>
                    <p className="text-xs leading-relaxed text-sky-950">
                      You are loading a rock tour van. You have a heavy speaker accessory box that weighs exactly <strong>4 kg</strong>, and a mystery guitar road case which weighs <strong>x kg</strong>.
                    </p>
                    <p className="text-xs leading-relaxed text-sky-950 mt-1">
                      When you place them both on a scale together, the total weight is exactly <strong>12 kg</strong>. This means: <br />
                      <strong className="text-sky-800 text-sm">x + 4 = 12</strong>
                    </p>
                    <p className="text-xs leading-relaxed text-sky-950 mt-1">
                      To solve for the secret guitar weight (x), you subtract the 4 kg speaker weight from both sides: <br />
                      <strong className="text-sky-800 text-sm">x = 12 - 4 = 8 kg!</strong>
                    </p>
                  </div>
                </div>
              )}

              {infoTab === 'mistakes' && (
                <div className="space-y-3">
                  <h4 className="font-extrabold text-sm text-deep-navy">Watch out for these balancing slips!</h4>
                  
                  <div className="grid gap-3">
                    <div className="border border-deep-navy/20 rounded-xl overflow-hidden text-xs">
                      <div className="bg-rose-500/15 p-2 border-b border-deep-navy/20 font-bold text-rose-700 flex items-center gap-1">
                        <XCircle size={14} /> Mistake 1: Operating on only one side of the equation!
                      </div>
                      <div className="p-3 bg-white space-y-1 text-slate-700 leading-normal">
                        <p className="text-[11px]"><strong className="text-rose-600">The Wrong Way:</strong> In <code className="bg-rose-50 px-1 py-0.5 rounded font-mono text-rose-700">x + 4 = 12</code>, you subtract 4 from the left but forget the right, writing <code className="bg-rose-50 px-1 py-0.5 rounded font-mono text-rose-700">x = 12</code>. ❌ (The see-saw is now completely unbalanced!)</p>
                        <p className="text-[11px]"><strong className="text-emerald-600">The Right Way:</strong> Subtract 4 from BOTH sides of the equal sign to keep them perfectly balanced: <code className="bg-emerald-50 px-1 py-0.5 rounded font-mono text-emerald-700">x + 4 - 4 = 12 - 4</code>, resulting in <code className="bg-emerald-50 px-1 py-0.5 rounded font-mono text-emerald-700">x = 8</code>. ✅</p>
                      </div>
                    </div>

                    <div className="border border-deep-navy/20 rounded-xl overflow-hidden text-xs">
                      <div className="bg-rose-500/15 p-2 border-b border-deep-navy/20 font-bold text-rose-700 flex items-center gap-1">
                        <XCircle size={14} /> Mistake 2: Performing the wrong opposite operation!
                      </div>
                      <div className="p-3 bg-white space-y-1 text-slate-700 leading-normal">
                        <p className="text-[11px]"><strong className="text-rose-600">The Wrong Way:</strong> In <code className="bg-rose-50 px-1 py-0.5 rounded font-mono text-rose-700">x + 3 = 10</code>, trying to solve it by adding 3: <code className="bg-rose-50 px-1 py-0.5 rounded font-mono text-rose-700">x = 10 + 3 = 13</code>. ❌ (If you check: 13 + 3 = 16, which is not 10!)</p>
                        <p className="text-[11px]"><strong className="text-emerald-600">The Right Way:</strong> The opposite of addition is subtraction! Subtract 3 from both sides to isolate x: <code className="bg-emerald-50 px-1 py-0.5 rounded font-mono text-emerald-700">x = 10 - 3 = 7</code>. ✅ (Check: 7 + 3 = 10! Balanced!)</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Back Header if lesson selected */}
      {selectedLesson ? (
        <div className="space-y-6">
          <button 
            onClick={() => setSelectedLesson(null)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/15 rounded-xl text-deep-navy hover:text-deep-navy transition-all text-xs font-black uppercase tracking-wider cursor-pointer"
          >
            <ArrowLeft size={16} /> All Lessons
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 glass rounded-2xl border-brand-secondary/30 bg-gradient-to-r from-brand-secondary/15 to-transparent">
            <div className="space-y-1.5 max-w-2xl">
              <span className="text-[10px] font-black uppercase tracking-widest bg-brand-secondary/20 text-brand-secondary px-2.5 py-1 rounded-full mb-1 inline-block">
                Interactive Tutor Mode 🎓
              </span>
              <h2 className="text-3xl font-display font-black text-deep-navy">{selectedLesson.title}</h2>
              <p className="text-deep-navy text-sm">{selectedLesson.description}</p>
              <p className="text-deep-navy/80 text-[11px] font-medium italic flex items-center gap-1.5 pt-1">
                <Sparkles size={12} className="text-brand-secondary shrink-0" />
                <span>Pass the upcoming quiz with a score of <strong>15 or higher</strong> to unlock the next topic and earn <strong>+10 Streaks!</strong></span>
              </p>
            </div>
            
            <button 
              onClick={() => onStartLesson(selectedLesson)}
              className="px-6 py-3.5 bg-brand-secondary hover:bg-brand-secondary/90 text-deep-navy font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-brand-secondary/20 transition-all hover:scale-[1.03] shrink-0"
            >
              <Play size={14} fill="currentColor" /> Start Quiz Battle
            </button>
          </div>

          {/* Interactive Learning Playground */}
          <div className="glass p-6 md:p-8 rounded-[2.5rem] bg-sunny-yellow border-deep-navy border-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Interactive Sandbox Builder */}
              <div className="lg:col-span-5 space-y-6">
                {/* 1. Multiplication Mastery Teaching view */}
                {selectedLesson.id === '1' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-black text-deep-navy">🎛️ Interactive Grid Builder</h3>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center bg-white/40 p-3 rounded-xl border-2 border-deep-navy">
                        <span className="text-xs font-bold text-deep-navy">Columns (Width): <span className="text-brand-secondary font-black text-base ml-2">{multNum1}</span></span>
                        <div className="flex gap-1.5">
                          <button onClick={() => setMultNum1(Math.max(1, multNum1 - 1))} className="p-1 px-2.5 bg-white/50 hover:bg-white/80 border border-deep-navy rounded cursor-pointer"><Minus size={12} /></button>
                          <button onClick={() => setMultNum1(Math.min(10, multNum1 + 1))} className="p-1 px-2.5 bg-white/50 hover:bg-white/80 border border-deep-navy rounded cursor-pointer"><Plus size={12} /></button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center bg-white/40 p-3 rounded-xl border-2 border-deep-navy">
                        <span className="text-xs font-bold text-deep-navy">Rows (Height): <span className="text-brand-primary font-black text-base ml-2">{multNum2}</span></span>
                        <div className="flex gap-1.5">
                          <button onClick={() => setMultNum2(Math.max(1, multNum2 - 1))} className="p-1 px-2.5 bg-white/50 hover:bg-white/80 border border-deep-navy rounded cursor-pointer"><Minus size={12} /></button>
                          <button onClick={() => setMultNum2(Math.min(10, multNum2 + 1))} className="p-1 px-2.5 bg-white/50 hover:bg-white/80 border border-deep-navy rounded cursor-pointer"><Plus size={12} /></button>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-white border border-deep-navy border-4 rounded-2xl text-center">
                      <div className="text-xl font-bold tracking-tight text-deep-navy">
                        {multNum1} × {multNum2} = <span className="text-amber-800 font-black text-3xl">{multNum1 * multNum2}</span>
                      </div>
                      <div className="text-[10px] text-brand-secondary/80 font-mono mt-2 leading-relaxed">
                        Repeated Addition: {Array(multNum2).fill(multNum1).join(' + ')} = {multNum1 * multNum2}
                      </div>
                    </div>

                    {/* Grid Visualization */}
                    <div className="flex flex-col items-center justify-center p-4 bg-white/30 rounded-2xl border border-deep-navy border-4 min-h-[160px]">
                      <div className="grid gap-1.5 p-3 rounded-xl bg-white border-2 border-deep-navy" style={{ gridTemplateColumns: `repeat(${multNum1}, minmax(0, 1fr))` }}>
                        {Array.from({ length: multNum1 * multNum2 }).map((_, i) => (
                          <div 
                            key={i} 
                            className="w-5 h-5 md:w-6 md:h-6 rounded flex items-center justify-center bg-brand-secondary text-[8px] text-deep-navy font-black shadow-inner animate-pulse"
                          >
                            ⭐
                          </div>
                        ))}
                      </div>
                      <span className="text-[9px] uppercase font-black text-slate-500 mt-2 tracking-widest">{multNum1} Cols by {multNum2} Rows</span>
                    </div>
                  </div>
                )}

                {/* 2. Division Decoded Teaching view */}
                {selectedLesson.id === '2' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-black text-deep-navy">🍎 Fair Division Splitter</h3>

                    <div className="space-y-3">
                      <div className="bg-white/40 p-3 rounded-xl border-2 border-deep-navy space-y-1.5">
                        <label className="text-xs font-bold text-deep-navy flex justify-between">
                          <span>Total Items to Split:</span>
                          <span className="text-orange-700 font-extrabold">{divTotal}</span>
                        </label>
                        <input 
                          type="range" 
                          min={4} 
                          max={30} 
                          value={divTotal} 
                          onChange={(e) => setDivTotal(Number(e.target.value))}
                          className="w-full accent-orange-500 cursor-pointer h-1.5 bg-white rounded-lg border border-deep-navy/30"
                        />
                      </div>

                      <div className="bg-white/40 p-3 rounded-xl border-2 border-deep-navy space-y-1.5">
                        <label className="text-xs font-bold text-deep-navy flex justify-between">
                          <span>Groups count:</span>
                          <span className="text-orange-700 font-extrabold">{divGroups}</span>
                        </label>
                        <div className="grid grid-cols-5 gap-1">
                          {[2, 3, 4, 5, 6].map((num) => (
                            <button
                              key={num}
                              onClick={() => setDivGroups(num)}
                              className={cn(
                                "py-1.5 text-xs font-black transition-all rounded-lg cursor-pointer border border-deep-navy",
                                divGroups === num 
                                  ? "bg-orange-500 text-deep-navy font-extrabold shadow-[2px_2px_0px_rgba(0,0,0,1)]" 
                                  : "bg-white/50 text-deep-navy hover:bg-white"
                              )}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-white border border-deep-navy border-4 rounded-2xl text-center">
                      <div className="text-lg font-bold text-deep-navy">
                        {divTotal} ÷ {divGroups} = <span className="text-orange-700 font-black text-2xl">{Math.floor(divTotal / divGroups)}</span> {divTotal % divGroups > 0 && <span className="text-amber-800 font-bold text-md">R {divTotal % divGroups}</span>}
                      </div>
                      <div className="text-[10px] text-deep-navy leading-normal mt-1">
                        Each group gets {Math.floor(divTotal / divGroups)} red tokens. Leftovers: {divTotal % divGroups}.
                      </div>
                    </div>

                    {/* Division Visualization Boxes */}
                    <div className="p-3 bg-white/30 rounded-2xl border border-deep-navy border-4 flex flex-col justify-between space-y-3">
                      <span className="text-[9px] uppercase font-black text-deep-navy tracking-wider">Visual Split:</span>
                      <div className="grid gap-2 grid-cols-2">
                        {Array.from({ length: divGroups }).map((_, gIdx) => {
                          const itemsInThisGroup = Math.floor(divTotal / divGroups);
                          return (
                            <div key={gIdx} className="bg-white border border-orange-500/20 p-2 rounded-xl flex flex-col items-center">
                              <span className="text-[8px] font-bold text-orange-800 mb-1 bg-orange-500/10 px-1.5 py-0.5 rounded-full">Group #{gIdx+1}</span>
                              <div className="flex flex-wrap gap-0.5 justify-center">
                                {Array.from({ length: itemsInThisGroup }).map((_, idx) => (
                                  <span key={idx} className="text-xs">🔴</span>
                                ))}
                                {itemsInThisGroup === 0 && <span className="text-[8px] text-slate-700">Empty</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {divTotal % divGroups > 0 && (
                        <div className="p-2 bg-yellow-500/10 border-2 border-deep-navy rounded-xl flex items-center justify-between">
                          <span className="text-[10px] font-bold text-yellow-700">Remainder leftovers:</span>
                          <div className="flex gap-0.5">
                            {Array.from({ length: divTotal % divGroups }).map((_, idx) => (
                              <span key={idx} className="text-xs animate-bounce">🍎</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. Long Division Arena Teaching view */}
                {selectedLesson.id === '4' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-black text-deep-navy">🚀 DMSB Simulator</h3>
                    
                    <div className="space-y-2">
                      {[
                        { title: 'START: Layout', desc: '6 ) 1 4 8' },
                        { title: 'STEP 1: Divide', desc: '14 ÷ 6 = 2' },
                        { title: 'STEP 2: Subtract', desc: '14 - 12 = 2' },
                        { title: 'STEP 3: Bring Down', desc: 'Bring down 8 to make 28' },
                        { title: 'STEP 4: final minus', desc: '28 - 24 = 4' },
                        { title: 'RESULT: Finished!', desc: '24 Remainder 4' }
                      ].map((step, idx) => (
                        <button
                          key={idx}
                          onClick={() => setLongDivStep(idx)}
                          className={cn(
                            "w-full p-2 text-left rounded-xl transition-all border cursor-pointer border-deep-navy flex gap-2 items-center justify-between",
                            longDivStep === idx 
                              ? "bg-white text-deep-navy shadow-[2px_2px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5" 
                              : "bg-white/40 text-deep-navy hover:bg-white"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black shrink-0 border border-deep-navy",
                              longDivStep === idx ? "bg-brand-secondary text-deep-navy" : "bg-white/40"
                            )}>
                              {idx + 1}
                            </div>
                            <span className="text-[10px] font-black tracking-tight">{step.title}</span>
                          </div>
                          <span className="text-[10px] font-mono opacity-80">{step.desc}</span>
                        </button>
                      ))}
                    </div>

                    {/* Math Blackboard graphic */}
                    <div className="p-4 bg-white border border-deep-navy border-4 rounded-3xl min-h-[220px] flex flex-col justify-between font-mono relative">
                      <span className="text-[8px] tracking-widest text-cyan-800 uppercase font-black absolute top-2 right-3">CHALKBOARD</span>
                      
                      <div className="space-y-2 text-center py-4">
                        {longDivStep === 0 && (
                          <div className="text-xl font-black text-rose-500 whitespace-pre leading-relaxed">
                            {"   \n"}
                            {"6 )  1 4 8\n"}
                            {"    -------\n"}
                          </div>
                        )}
                        
                        {longDivStep === 1 && (
                          <div className="text-xl font-black text-cyan-700 whitespace-pre leading-relaxed">
                            {"     2\n"}
                            {"6 )  1 4 8\n"}
                            {"    -------\n"}
                          </div>
                        )}

                        {longDivStep === 2 && (
                          <div className="text-xl font-black text-emerald-700 whitespace-pre leading-relaxed">
                            {"     2\n"}
                            {"6 )  1 4 8\n"}
                            {"   - 1 2\n"}
                            {"    -----\n"}
                            {"     2\n"}
                          </div>
                        )}

                        {longDivStep === 3 && (
                          <div className="text-xl font-black text-amber-700 whitespace-pre leading-relaxed">
                            {"     2  4\n"}
                            {"6 )  1 4 8\n"}
                            {"   - 1 2 |\n"}
                            {"    ---- v\n"}
                            {"     2  8\n"}
                          </div>
                        )}

                        {longDivStep === 4 && (
                          <div className="text-xl font-black text-violet-700 whitespace-pre leading-relaxed">
                            {"     2  4\n"}
                            {"6 )  1 4 8\n"}
                            {"   - 1 2\n"}
                            {"    -----\n"}
                            {"     2  8\n"}
                            {"   - 2  4\n"}
                            {"    -----\n"}
                            {"        4\n"}
                          </div>
                        )}

                        {longDivStep === 5 && (
                          <div className="text-xl font-black text-yellow-700 whitespace-pre leading-relaxed animate-pulse">
                            {"     2  4   R 4\n"}
                            {"6 )  1 4 8   👑\n"}
                            {"   - 1 2\n"}
                            {"    -----\n"}
                            {"     2  8\n"}
                            {"   - 2  4\n"}
                            {"    -----\n"}
                            {"        4\n"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. Fraction Fusion Teaching view */}
                {selectedLesson.id === '5' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-black text-deep-navy">🍕 Pizza fraction mixer</h3>

                    <div className="space-y-3">
                      <div className="bg-white/40 p-3 rounded-xl border-2 border-deep-navy space-y-1">
                        <label className="text-xs font-bold text-deep-navy flex justify-between">
                          <span>Denominator (Total Slices):</span>
                          <span className="text-yellow-700 font-extrabold">{fracDen} slices</span>
                        </label>
                        <input 
                          type="range" 
                          min={3} 
                          max={10} 
                          value={fracDen} 
                          onChange={(e) => {
                            const d = Number(e.target.value);
                            setFracDen(d);
                            setFracNum1(Math.min(fracNum1, d - 1));
                            setFracNum2(Math.min(fracNum2, d - 1));
                          }}
                          className="w-full accent-yellow-400 cursor-pointer h-1.5 bg-white rounded-lg border border-deep-navy/30"
                        />
                      </div>

                      <div className="bg-white/40 p-3 rounded-xl border-2 border-deep-navy space-y-2">
                        <span className="text-xs font-bold text-deep-navy block">Add Slices:</span>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2 bg-white rounded-lg text-center border border-deep-navy">
                            <span className="text-[9px] text-zinc-600 block mb-1">Slice A</span>
                            <div className="flex justify-center items-center gap-1.5">
                              <button onClick={() => setFracNum1(Math.max(1, fracNum1 - 1))} className="p-0.5 px-1.5 bg-slate-100 hover:bg-slate-200 rounded border border-deep-navy"><Minus size={10} /></button>
                              <span className="text-xs font-bold text-deep-navy font-mono">{fracNum1}/{fracDen}</span>
                              <button onClick={() => setFracNum1(Math.min(fracDen - 1, fracNum1 + 1))} className="p-0.5 px-1.5 bg-slate-100 hover:bg-slate-200 rounded border border-deep-navy"><Plus size={10} /></button>
                            </div>
                          </div>

                          <div className="p-2 bg-white rounded-lg text-center border border-deep-navy">
                            <span className="text-[9px] text-zinc-600 block mb-1">Slice B</span>
                            <div className="flex justify-center items-center gap-1.5">
                              <button onClick={() => setFracNum2(Math.max(1, fracNum2 - 1))} className="p-0.5 px-1.5 bg-slate-100 hover:bg-slate-200 rounded border border-deep-navy"><Minus size={10} /></button>
                              <span className="text-xs font-bold text-deep-navy font-mono">{fracNum2}/{fracDen}</span>
                              <button onClick={() => setFracNum2(Math.min(fracDen - 1, fracNum2 + 1))} className="p-0.5 px-1.5 bg-slate-100 hover:bg-slate-200 rounded border border-deep-navy"><Plus size={10} /></button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-white border border-deep-navy border-4 rounded-2xl">
                      <div className="text-lg font-bold text-center text-deep-navy flex items-center justify-center gap-2">
                        <span className="font-mono">{fracNum1}/{fracDen}</span>
                        <span className="text-slate-700 font-extrabold">+</span>
                        <span className="font-mono">{fracNum2}/{fracDen}</span>
                        <span className="text-slate-700 font-extrabold">=</span>
                        <span className="text-emerald-700 font-extrabold font-mono text-xl">{(fracNum1 + fracNum2)}/{fracDen}</span>
                      </div>
                    </div>

                    {/* Pie Visuals */}
                    <div className="p-4 bg-white/30 border border-deep-navy border-4 rounded-3xl min-h-[180px] flex flex-col justify-center items-center space-y-2">
                      <div className="relative w-24 h-24 bg-white rounded-full border-4 border-slate-700 overflow-hidden flex items-center justify-center animate-spin-slow">
                        {Array.from({ length: fracDen }).map((_, idx) => (
                          <div 
                            key={idx} 
                            className="absolute w-px h-full bg-slate-800" 
                            style={{ transform: `rotate(${(360 / fracDen) * idx}deg)` }} 
                          />
                        ))}
                        
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="text-center font-black bg-white/95 px-2 py-1 rounded border border-deep-navy border-2 z-10">
                            <p className="text-emerald-700 text-sm font-mono leading-none">{(fracNum1 + fracNum2)}/{fracDen}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Algebraic Basics Teaching view */}
                
                {/* Fallback Playground for new elementary and junior high subjects */}
                {!['1', '2', '3', '4', '5'].includes(selectedLesson.id) && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-black text-deep-navy">🎛️ Interactive Exploration</h3>
                    <div className="p-8 bg-white/40 border border-deep-navy border-4 rounded-3xl text-center space-y-4">
                      <div className="text-6xl animate-bounce">🚀</div>
                      <h4 className="font-black text-xl text-deep-navy">Ready for {selectedLesson.title}?</h4>
                      <p className="text-sm font-medium text-slate-700 max-w-sm mx-auto leading-relaxed">
                        Mastering {selectedLesson.category.toLowerCase()} concepts requires focus. The Striker Arena awaits your arrival. Press the "Start Quiz Battle" button to begin your journey!
                      </p>
                    </div>
                  </div>
                )}

                {selectedLesson.id === '3' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-black text-deep-navy">⚖️ Interactive Balance Scale</h3>

                    <div className="space-y-3 bg-white/40 p-3 rounded-xl border-2 border-deep-navy">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-deep-navy block">The Equation:</span>
                        <div className="text-lg font-black text-center text-deep-navy py-1 bg-white rounded-lg border border-deep-navy">
                          x + <span className="text-cyan-700 font-extrabold">{algConst}</span> = <span className="text-amber-800 font-extrabold">{algTarget}</span>
                        </div>
                      </div>

                      <div className="space-y-1 pt-1">
                        <label className="text-xs font-bold text-deep-navy flex justify-between">
                          <span>Guess value of x:</span>
                          <span className="text-brand-secondary font-black text-sm">{algGuess}</span>
                        </label>
                        <input 
                          type="range" 
                          min={1} 
                          max={25} 
                          value={algGuess} 
                          onChange={(e) => setAlgGuess(Number(e.target.value))}
                          className="w-full accent-brand-secondary cursor-pointer h-1.5 bg-white rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-white border border-deep-navy border-4 rounded-2xl text-center">
                      <p className="text-[10px] text-deep-navy font-bold">Sum (Guess + {algConst}):</p>
                      <p className="text-md font-black mt-0.5">
                        {algGuess} + {algConst} = <span className={cn(
                          "text-lg",
                          algGuess + algConst === algTarget ? "text-green-700 font-black" : "text-amber-800"
                        )}>{algGuess + algConst}</span>
                      </p>
                    </div>

                    {/* Balance Scale graphic */}
                    <div className="p-4 bg-white/30 border border-deep-navy border-4 rounded-3xl min-h-[160px] flex flex-col justify-center items-center relative">
                      {showAlgTip && (
                        <div className="absolute -top-12 z-10 bg-sunny-yellow p-3 rounded-xl border border-deep-navy shadow-lg text-xs w-64 max-w-full">
                          <p className="font-bold text-deep-navy flex items-start justify-between">
                            <span>💡 Tip: Why does the scale move?</span>
                            <button onClick={() => setShowAlgTip(false)} className="text-deep-navy hover:text-rose-500 font-bold ml-2">✕</button>
                          </p>
                          <p className="text-deep-navy/80 leading-tight mt-1 text-[11px]">
                            When you add weight (by guessing a larger <strong className="font-mono">x</strong>), the Left side becomes heavier! If Left is greater than Right, the scale tips to the left. Try to balance it so both sides equal <strong className="font-mono">{algTarget}</strong>!
                          </p>
                        </div>
                      )}
                      <div className="w-full max-w-[180px] space-y-3">
                        <div 
                          className="h-1.5 bg-gradient-to-r from-cyan-500 to-amber-500 rounded-full transition-transform duration-500 relative flex items-center justify-between px-3"
                          style={{ 
                            transform: `rotate(${Math.min(15, Math.max(-15, ((algGuess + algConst) - algTarget) * 2))}deg)` 
                          }}
                        >
                          <div className="absolute top-0.5 left-0.5 text-[8px]">⚖️</div>
                          <div className="absolute top-0.5 right-0.5 text-[8px]">⚖️</div>
                        </div>

                        <div className="flex justify-between">
                          <div className="bg-cyan-500/10 border border-cyan-500/20 p-1 rounded text-center min-w-[60px]">
                            <span className="text-[8px] text-cyan-700 font-extrabold block">Left</span>
                            <span className="text-xs font-black text-deep-navy">{algGuess + algConst}</span>
                          </div>

                          <div className="bg-amber-500/10 border border-amber-500/20 p-1 rounded text-center min-w-[60px]">
                            <span className="text-[8px] text-amber-800 font-extrabold block">Right</span>
                            <span className="text-xs font-black text-deep-navy">{algTarget}</span>
                          </div>
                        </div>
                      </div>

                      {algGuess + algConst === algTarget ? (
                        <div className="mt-3 p-1 px-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-700 font-black text-[9px] uppercase tracking-wider flex items-center gap-1 animate-pulse">
                          <Check size={10} /> Balanced! x = {algGuess}
                        </div>
                      ) : (
                        <div className="mt-3 p-1 px-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-800 font-black text-[9px] uppercase tracking-wider flex items-center gap-1 font-mono">
                          <HelpCircle size={10} /> Balance Scale
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Striker Tab Guide */}
              <div className="lg:col-span-7 h-full">
                {renderGuidePanel(selectedLesson.id)}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Lesson Directory view */
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-display font-black text-deep-navy">Genius Hub 🎓</h2>
              <p className="text-deep-navy text-sm">Master brand new math logic with zero stress!</p>
            </div>
            <div className="p-3 bg-brand-secondary/20 rounded-2xl">
              <BookOpen className="text-brand-secondary" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {LESSONS.map((lesson, index) => {
              const unlocked = index === 0 || !!stats?.completedLessons?.includes(LESSONS[index - 1].id);
              const completed = !!stats?.completedLessons?.includes(lesson.id);
              
              return (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className={cn(
                    "glass p-6 rounded-[2rem] border-deep-navy border-4 bg-clean-white group transition-all flex flex-col justify-between",
                    unlocked 
                      ? "hover:border-brand-secondary/50 hover:bg-sunny-yellow cursor-pointer" 
                      : "opacity-60 cursor-not-allowed bg-slate-100 border-slate-300"
                  )}
                  onClick={() => {
                    if (unlocked) {
                      handleSelectLesson(lesson);
                    }
                  }}
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-2">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider",
                          lesson.difficulty === 'easy' ? "bg-green-500/20 text-green-700" :
                          lesson.difficulty === 'medium' ? "bg-yellow-500/20 text-yellow-700" :
                          "bg-rose-500/20 text-rose-700"
                        )}>
                          {lesson.difficulty}
                        </span>
                        {completed && (
                          <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-700 flex items-center gap-1">
                            <Check size={8} /> Completed
                          </span>
                        )}
                      </div>
                      {unlocked ? (
                        <Star className="text-brand-accent w-4 h-4 fill-brand-accent/20" />
                      ) : (
                        <div className="text-slate-400 font-extrabold text-xs">🔒 LOCKED</div>
                      )}
                    </div>
                    
                    <h3 className={cn(
                      "text-lg font-black mb-1.5 transition-colors",
                      unlocked ? "text-deep-navy group-hover:text-brand-secondary" : "text-slate-400"
                    )}>
                      {lesson.title}
                    </h3>
                    <p className={cn(
                      "text-xs mb-6 leading-relaxed line-clamp-3",
                      unlocked ? "text-deep-navy" : "text-slate-400"
                    )}>
                      {lesson.description}
                    </p>
                  </div>

                  <div className={cn(
                    "flex items-center justify-between pt-4 border-t border-4",
                    unlocked ? "border-deep-navy" : "border-slate-200"
                  )}>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                      <span className={cn("w-1.5 h-1.5 rounded-full", unlocked ? "bg-brand-secondary" : "bg-slate-300")} />
                      {lesson.category}
                    </div>
                    {unlocked ? (
                      <div className="p-2 bg-white/5 rounded-xl group-hover:bg-brand-secondary group-hover:text-deep-navy transition-all text-xs font-black flex items-center gap-1">
                        Study Topic <ChevronRight size={14} />
                      </div>
                    ) : (
                      <div className="p-2 text-slate-400 text-[10px] font-bold">
                        Unlock previous first
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Rules and Earning Hub Information Section */}
          <div className="glass p-8 rounded-[2rem] border-deep-navy border-4 bg-sunny-yellow/15 space-y-6">
            <div className="flex items-center gap-3 border-b-4 border-deep-navy pb-4">
              <span className="text-2xl">🏆</span>
              <div>
                <h3 className="text-xl font-display font-black text-deep-navy">Earning Hub & Learning Rules</h3>
                <p className="text-xs text-deep-navy/80 font-bold">Learn how the system works and how to unlock the next levels!</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* How it works card */}
              <div className="bg-clean-white border-4 border-deep-navy p-5 rounded-2xl space-y-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border-2 border-deep-navy shrink-0">
                  <BookOpen size={20} className="text-cyan-600" />
                </div>
                <h4 className="text-sm font-black text-deep-navy">1. Study & Visualize 📚</h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Select any unlocked topic from the grid above. Immerse yourself in the interactive visualizer, use the balance scale models, play with slider graphics, and read the "Common Mistakes" warning board to prime your brain!
                </p>
              </div>

              {/* Quiz battle card */}
              <div className="bg-clean-white border-4 border-deep-navy p-5 rounded-2xl space-y-3">
                <div className="w-10 h-10 rounded-xl bg-brand-secondary/20 flex items-center justify-center border-2 border-deep-navy shrink-0">
                  <Play size={18} fill="currentColor" className="text-brand-secondary" />
                </div>
                <h4 className="text-sm font-black text-deep-navy">2. Quiz Battle Arena ⚔️</h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Ready to prove your skills? Click the <strong>"Start Quiz Battle"</strong> button inside a topic to launch a targeted 20-question mental battle designed to lock in your math muscle memory.
                </p>
              </div>

              {/* Unlocking next topics card */}
              <div className="bg-clean-white border-4 border-deep-navy p-5 rounded-2xl space-y-3 md:col-span-2 lg:col-span-1">
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center border-2 border-deep-navy shrink-0">
                  <Star size={18} fill="currentColor" className="text-rose-500" />
                </div>
                <h4 className="text-sm font-black text-deep-navy">3. Unlock Next Topics 🔑</h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  To advance to the next locked level, you must pass the current topic quiz with a score of <strong>15 or higher (75% correct answers)</strong>. This ensures you master each building block before moving up!
                </p>
              </div>
            </div>

            {/* Earning rewards details banner */}
            <div className="bg-gradient-to-r from-brand-secondary/20 to-brand-secondary/5 border-4 border-deep-navy p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-black text-deep-navy flex items-center gap-1.5">
                  <Sparkles size={16} className="text-brand-secondary" /> Earning Rewards Hub: What do you win?
                </h4>
                <ul className="text-xs text-slate-700 space-y-1 list-disc pl-4 leading-relaxed font-medium">
                  <li><strong>+10 Streaks Booster:</strong> Awarded instantly upon passing any topic quiz with 15+ score!</li>
                  <li><strong>Rock Tokens:</strong> Earn golden tokens to spend in the official <strong>Club Shop</strong> for premium avatar cases and badge themes.</li>
                  <li><strong>Experience Points (XP):</strong> Accumulate XP with every correct answer to skyrocket up the global school leaderboards.</li>
                </ul>
              </div>
              <div className="bg-sunny-yellow text-deep-navy text-xs font-black px-4 py-2 rounded-xl border-2 border-deep-navy shadow-md shrink-0">
                🚀 Earning is Active!
              </div>
            </div>
          </div>

          <div className="glass p-8 rounded-[2rem] bg-gradient-to-br from-brand-secondary/10 to-transparent border-brand-secondary/20 shadow-lg">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 space-y-4 text-center md:text-left">
                <h3 className="text-2xl font-black text-deep-navy">Do you have deep questions? 🧠</h3>
                <p className="text-deep-navy text-sm">
                  Choose a topic from the interactive grid cards above to study with visual helpers, slider models, balance lines, and animations before jumping into battles!
                </p>
              </div>
              <div className="w-40 h-40 bg-brand-secondary/15 rounded-full flex items-center justify-center animate-pulse shrink-0">
                <BookOpen size={48} className="text-brand-secondary animate-bounce" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

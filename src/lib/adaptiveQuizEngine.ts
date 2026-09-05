import { Problem, Difficulty, UserStats, Lesson } from '../types';
import { LESSONS } from '../data/lessons';

export interface AdaptiveProblem extends Problem {
  hint: string;
  steps: string[];
  explanation: string;
  topicTitle: string;
  difficultyLevel: number; // 1 to 5
}

export interface AdaptiveQuizSessionState {
  currentLevel: number; // 1 to 5
  consecutiveCorrect: number;
  consecutiveWrong: number;
  totalAnswered: number;
  totalCorrect: number;
  totalXP: number;
  history: {
    problem: AdaptiveProblem;
    userAnswer: string;
    isCorrect: boolean;
    level: number;
    usedHint: boolean;
  }[];
  topicStats: Record<string, { correct: number; total: number }>;
}

export const ADAPTIVE_TIERS = [
  { level: 1, name: 'Warmup Striker', color: 'text-emerald-600', bg: 'bg-emerald-500/10 border-emerald-500/30', badge: '🟢 Tier 1: Rookie' },
  { level: 2, name: 'Rising Striker', color: 'text-sky-600', bg: 'bg-sky-500/10 border-sky-500/30', badge: '🔵 Tier 2: Striker' },
  { level: 3, name: 'Master Tactician', color: 'text-amber-600', bg: 'bg-amber-500/10 border-amber-500/30', badge: '🟡 Tier 3: Tactician' },
  { level: 4, name: 'Pitch Champion', color: 'text-orange-600', bg: 'bg-orange-500/10 border-orange-500/30', badge: '🟠 Tier 4: Master' },
  { level: 5, name: 'Math Grandmaster', color: 'text-purple-600', bg: 'bg-purple-500/10 border-purple-500/30', badge: '🟣 Tier 5: Grandmaster' },
];

export function getTierInfo(level: number) {
  const clamped = Math.min(5, Math.max(1, level));
  return ADAPTIVE_TIERS[clamped - 1];
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function simplify(num: number, den: number): string {
  const common = gcd(Math.abs(num), Math.abs(den));
  const sNum = num / common;
  const sDen = den / common;
  return sDen === 1 ? `${sNum}` : `${sNum}/${sDen}`;
}

/**
 * Extracts allowed problem types dynamically from the user's progress in the Learning Hub.
 */
export function getUnlockedProblemTypesFromHub(stats?: UserStats): Problem['type'][] {
  const completedIds = new Set(stats?.completedLessons || []);
  const activeTypes = new Set<Problem['type']>(['addition', 'subtraction', 'multiplication']);

  // Add all types from completed lessons
  LESSONS.forEach((lesson) => {
    if (completedIds.has(lesson.id) && lesson.problemTypes) {
      lesson.problemTypes.forEach(t => activeTypes.add(t as Problem['type']));
    }
  });

  // Also include the currently unlocked (next available) lesson's types
  const nextLesson = LESSONS.find(l => !completedIds.has(l.id));
  if (nextLesson && nextLesson.problemTypes) {
    nextLesson.problemTypes.forEach(t => activeTypes.add(t as Problem['type']));
  }

  // Elementary warmups if low count
  if (activeTypes.size < 4) {
    activeTypes.add('place_value');
    activeTypes.add('number_patterns');
    activeTypes.add('time');
  }

  return Array.from(activeTypes);
}

/**
 * Calculates initial starting tier based on Learning Hub completion and user level.
 */
export function getInitialAdaptiveLevel(stats?: UserStats): number {
  const completedCount = stats?.completedLessons?.length || 0;
  const userLevel = stats?.level || 1;

  if (completedCount >= 8 || userLevel >= 15) return 3;
  if (completedCount >= 4 || userLevel >= 8) return 2;
  return 1;
}

/**
 * Generates an adaptive problem with rich hints and multi-level difficulty calibration.
 */
export function generateAdaptiveProblem(
  level: number,
  allowedTypes: Problem['type'][],
  isSimplerFallback: boolean = false
): AdaptiveProblem {
  const safeLevel = isSimplerFallback ? Math.max(1, level - 1) : Math.min(5, Math.max(1, level));
  const id = `adp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const type = allowedTypes[Math.floor(Math.random() * allowedTypes.length)] || 'addition';

  let question = '';
  let answer: string | number = 0;
  let hint = '';
  let steps: string[] = [];
  let explanation = '';
  let topicTitle = 'Arithmetic Mastery';

  switch (type) {
    case 'addition': {
      topicTitle = 'Addition Dynamics';
      if (safeLevel === 1) {
        const a = Math.floor(Math.random() * 8) + 2;
        const b = Math.floor(Math.random() * 8) + 1;
        question = `${a} + ${b}`;
        answer = a + b;
        hint = `Count up from ${a}: add ${b} more.`;
        steps = [`Start at ${a}`, `Add ${b} to reach ${a + b}`];
        explanation = `${a} + ${b} = ${a + b}`;
      } else if (safeLevel === 2) {
        const a = Math.floor(Math.random() * 40) + 12;
        const b = Math.floor(Math.random() * 40) + 11;
        question = `${a} + ${b}`;
        answer = a + b;
        const tens = Math.floor(a / 10) * 10 + Math.floor(b / 10) * 10;
        const ones = (a % 10) + (b % 10);
        hint = `Add tens first: (${Math.floor(a/10)*10} + ${Math.floor(b/10)*10} = ${tens}), then ones: (${a%10} + ${b%10} = ${ones}).`;
        steps = [`Tens: ${tens}`, `Ones: ${ones}`, `Combine: ${tens + ones}`];
        explanation = `${a} + ${b} = ${a + b}`;
      } else if (safeLevel === 3) {
        const a = Math.floor(Math.random() * 200) + 100;
        const b = Math.floor(Math.random() * 200) + 100;
        question = `${a} + ${b}`;
        answer = a + b;
        hint = `Break it down: add hundreds, then tens, then units.`;
        steps = [`Hundreds: ${Math.floor(a/100)*100} + ${Math.floor(b/100)*100}`, `Remaining: ${a%100} + ${b%100}`, `Total: ${a + b}`];
        explanation = `${a} + ${b} = ${a + b}`;
      } else if (safeLevel === 4) {
        const a = Math.floor(Math.random() * 8) + 3;
        const b = Math.floor(Math.random() * 8) + 3;
        const c = Math.floor(Math.random() * 50) + 20;
        question = `(${a} × ${b}) + ${c}`;
        answer = (a * b) + c;
        hint = `BODMAS rule: Multiply (${a} × ${b} = ${a * b}) first, then add ${c}.`;
        steps = [`Step 1: Multiply ${a} × ${b} = ${a * b}`, `Step 2: Add ${c} to ${a * b} = ${(a * b) + c}`];
        explanation = `(${a} × ${b}) + ${c} = ${a * b} + ${c} = ${(a * b) + c}`;
      } else {
        const a = Math.floor(Math.random() * 450) + 250;
        const b = Math.floor(Math.random() * 450) + 250;
        const c = Math.floor(Math.random() * 150) + 50;
        question = `${a} + ${b} + ${c}`;
        answer = a + b + c;
        hint = `Combine friendly numbers first: ${a} + ${b} = ${a + b}, then add ${c}.`;
        steps = [`${a} + ${b} = ${a + b}`, `${a + b} + ${c} = ${a + b + c}`];
        explanation = `${a} + ${b} + ${c} = ${a + b + c}`;
      }
      break;
    }

    case 'subtraction': {
      topicTitle = 'Subtraction Dynamics';
      if (safeLevel === 1) {
        const a = Math.floor(Math.random() * 10) + 5;
        const b = Math.floor(Math.random() * (a - 1)) + 1;
        question = `${a} - ${b}`;
        answer = a - b;
        hint = `Think: What number added to ${b} gives ${a}?`;
        steps = [`${b} + ? = ${a}`, `Difference is ${a - b}`];
        explanation = `${a} - ${b} = ${a - b}`;
      } else if (safeLevel === 2) {
        const a = Math.floor(Math.random() * 60) + 30;
        const b = Math.floor(Math.random() * 25) + 5;
        question = `${a} - ${b}`;
        answer = a - b;
        hint = `Subtract the tens first (${a} - ${Math.floor(b/10)*10} = ${a - Math.floor(b/10)*10}), then subtract ${b%10}.`;
        steps = [`Subtract tens: ${a} - ${Math.floor(b/10)*10} = ${a - Math.floor(b/10)*10}`, `Subtract units: ${(a - Math.floor(b/10)*10)} - ${b%10} = ${a - b}`];
        explanation = `${a} - ${b} = ${a - b}`;
      } else if (safeLevel === 3) {
        const a = Math.floor(Math.random() * 300) + 150;
        const b = Math.floor(Math.random() * 120) + 40;
        question = `${a} - ${b}`;
        answer = a - b;
        hint = `Use standard column subtraction or jump backwards on a number line.`;
        steps = [`${a} - 100 = ${a - 100}`, `Adjust for remaining amount`];
        explanation = `${a} - ${b} = ${a - b}`;
      } else {
        const a = Math.floor(Math.random() * 10) + 4;
        const b = Math.floor(Math.random() * 9) + 3;
        const c = Math.floor(Math.random() * 15) + 5;
        const prod = a * b;
        const safeC = Math.min(c, prod - 1);
        question = `(${a} × ${b}) - ${safeC}`;
        answer = prod - safeC;
        hint = `Multiply ${a} × ${b} to get ${prod}, then subtract ${safeC}.`;
        steps = [`Step 1: ${a} × ${b} = ${prod}`, `Step 2: ${prod} - ${safeC} = ${prod - safeC}`];
        explanation = `(${a} × ${b}) - ${safeC} = ${prod} - ${safeC} = ${prod - safeC}`;
      }
      break;
    }

    case 'multiplication': {
      topicTitle = 'Multiplication Mastery';
      if (safeLevel === 1) {
        const a = Math.floor(Math.random() * 5) + 2;
        const b = Math.floor(Math.random() * 5) + 2;
        question = `${a} × ${b}`;
        answer = a * b;
        hint = `Repeated addition: add ${a} a total of ${b} times.`;
        steps = [`${Array(b).fill(a).join(' + ')} = ${a * b}`];
        explanation = `${a} × ${b} = ${a * b}`;
      } else if (safeLevel === 2) {
        const a = Math.floor(Math.random() * 8) + 4;
        const b = Math.floor(Math.random() * 8) + 3;
        question = `${a} × ${b}`;
        answer = a * b;
        hint = `Times table trick: ${a} × ${b} is same as ${b} × ${a}.`;
        steps = [`Recall times table for ${a} × ${b}`, `Result is ${a * b}`];
        explanation = `${a} × ${b} = ${a * b}`;
      } else if (safeLevel === 3) {
        const a = Math.floor(Math.random() * 6) + 11; // 11 to 16
        const b = Math.floor(Math.random() * 7) + 3;  // 3 to 9
        question = `${a} × ${b}`;
        answer = a * b;
        hint = `Distributive rule: (10 × ${b} = ${10 * b}) + (${a - 10} × ${b} = ${(a - 10) * b}).`;
        steps = [`10 × ${b} = ${10 * b}`, `${a - 10} × ${b} = ${(a - 10) * b}`, `Sum: ${10 * b + (a - 10) * b}`];
        explanation = `${a} × ${b} = (10 × ${b}) + (${a - 10} × ${b}) = ${a * b}`;
      } else if (safeLevel === 4) {
        const a = Math.floor(Math.random() * 12) + 12; // 12 to 23
        const b = Math.floor(Math.random() * 8) + 6;  // 6 to 13
        question = `${a} × ${b}`;
        answer = a * b;
        hint = `Split ${a} into tens and units, multiply both by ${b}, and sum together.`;
        steps = [`${Math.floor(a/10)*10} × ${b} = ${Math.floor(a/10)*10 * b}`, `${a%10} × ${b} = ${(a%10) * b}`, `Total = ${a * b}`];
        explanation = `${a} × ${b} = ${a * b}`;
      } else {
        const a = Math.floor(Math.random() * 25) + 15;
        const b = Math.floor(Math.random() * 20) + 12;
        question = `${a} × ${b}`;
        answer = a * b;
        hint = `Double-digit multiplication: multiply by ones, then tens, then add.`;
        steps = [`${a} × ${b % 10} = ${a * (b % 10)}`, `${a} × ${Math.floor(b/10)*10} = ${a * Math.floor(b/10)*10}`, `Sum = ${a * b}`];
        explanation = `${a} × ${b} = ${a * b}`;
      }
      break;
    }

    case 'division': {
      topicTitle = 'Division Decoded';
      if (safeLevel <= 2) {
        const divisor = Math.floor(Math.random() * 7) + 2;
        const quotient = Math.floor(Math.random() * 6) + 2;
        const dividend = divisor * quotient;
        question = `${dividend} ÷ ${divisor}`;
        answer = quotient;
        hint = `Inverse multiplication: what number times ${divisor} equals ${dividend}?`;
        steps = [`? × ${divisor} = ${dividend}`, `Since ${quotient} × ${divisor} = ${dividend}, answer is ${quotient}`];
        explanation = `${dividend} ÷ ${divisor} = ${quotient}`;
      } else if (safeLevel === 3) {
        const divisor = Math.floor(Math.random() * 9) + 3;
        const quotient = Math.floor(Math.random() * 10) + 5;
        const dividend = divisor * quotient;
        question = `${dividend} ÷ ${divisor}`;
        answer = quotient;
        hint = `How many ${divisor}s fit inside ${dividend}?`;
        steps = [`${divisor} × 10 = ${divisor * 10}`, `Remaining ${dividend - divisor * 10} ÷ ${divisor} = ${quotient - 10}`, `Quotient is ${quotient}`];
        explanation = `${dividend} ÷ ${divisor} = ${quotient}`;
      } else {
        const divisor = Math.floor(Math.random() * 12) + 4;
        const quotient = Math.floor(Math.random() * 15) + 8;
        const dividend = divisor * quotient;
        question = `${dividend} ÷ ${divisor}`;
        answer = quotient;
        hint = `Estimate: ${dividend} ÷ ${divisor}. Test chunks of 10s.`;
        steps = [`${divisor} × ${quotient} = ${dividend}`, `Quotient = ${quotient}`];
        explanation = `${dividend} ÷ ${divisor} = ${quotient}`;
      }
      break;
    }

    case 'long_division': {
      topicTitle = 'Long Division Pitch';
      const divisor = safeLevel <= 2 ? Math.floor(Math.random() * 6) + 4 : Math.floor(Math.random() * 9) + 7;
      const quotient = safeLevel <= 2 ? Math.floor(Math.random() * 15) + 11 : Math.floor(Math.random() * 30) + 15;
      const dividend = divisor * quotient;
      question = `${dividend} ÷ ${divisor}`;
      answer = quotient;
      hint = `DMSB method: Divide → Multiply → Subtract → Bring down.`;
      steps = [`Divide leading digits by ${divisor}`, `Subtract and bring down remaining digits`, `Result is ${quotient}`];
      explanation = `${dividend} ÷ ${divisor} = ${quotient}`;
      break;
    }

    case 'fractions_addition': {
      topicTitle = 'Fraction Fusion';
      if (safeLevel <= 2) {
        const den = Math.floor(Math.random() * 5) + 3; // 3 to 7
        const num1 = Math.floor(Math.random() * (den - 2)) + 1;
        const num2 = Math.floor(Math.random() * (den - 1 - num1)) + 1;
        question = `${num1}/${den} + ${num2}/${den}`;
        answer = simplify(num1 + num2, den);
        hint = `Same denominators! Simply add numerators: (${num1} + ${num2} = ${num1 + num2}) over ${den}, then simplify if possible.`;
        steps = [`Keep denominator ${den}`, `Add numerators: ${num1} + ${num2} = ${num1 + num2}`, `Simplify: ${simplify(num1 + num2, den)}`];
        explanation = `${num1}/${den} + ${num2}/${den} = ${(num1 + num2)}/${den} = ${simplify(num1 + num2, den)}`;
      } else {
        // Different denominators
        const d1 = 2;
        const d2 = 4;
        question = `1/2 + 1/4`;
        answer = '3/4';
        hint = `Convert 1/2 into equivalent fourths: 2/4 + 1/4.`;
        steps = [`Convert 1/2 to 2/4`, `Add 2/4 + 1/4 = 3/4`];
        explanation = `1/2 + 1/4 = 2/4 + 1/4 = 3/4`;
      }
      break;
    }

    case 'integers': {
      topicTitle = 'Integers & Negatives';
      if (safeLevel <= 2) {
        const a = -Math.floor(Math.random() * 8) - 2;
        const b = Math.floor(Math.random() * 12) + 3;
        question = `${a} + ${b}`;
        answer = a + b;
        hint = `Start at ${a} on the number line and move right ${b} steps.`;
        steps = [`Start at ${a}`, `Moving right by ${b} lands on ${a + b}`];
        explanation = `${a} + ${b} = ${a + b}`;
      } else {
        const a = -Math.floor(Math.random() * 6) - 2;
        const b = -Math.floor(Math.random() * 6) - 2;
        question = `${a} × (${b})`;
        answer = a * b;
        hint = `Negative multiplied by negative gives a positive result! ( - × - = + )`;
        steps = [`Signs: (-) × (-) = (+)`, `Values: ${Math.abs(a)} × ${Math.abs(b)} = ${a * b}`];
        explanation = `${a} × (${b}) = ${a * b}`;
      }
      break;
    }

    case 'exponents': {
      topicTitle = 'Exponents & Powers';
      const base = safeLevel <= 2 ? Math.floor(Math.random() * 4) + 2 : Math.floor(Math.random() * 6) + 2;
      const exp = safeLevel <= 2 ? 2 : 3;
      question = exp === 2 ? `${base}²` : `${base}³`;
      answer = Math.pow(base, exp);
      hint = `Exponent ${exp} means multiply ${base} by itself ${exp} times.`;
      steps = [exp === 2 ? `${base} × ${base} = ${base * base}` : `${base} × ${base} × ${base} = ${base * base * base}`];
      explanation = `${base}^${exp} = ${Math.pow(base, exp)}`;
      break;
    }

    case 'geometry_angles': {
      topicTitle = 'Geometry & Angles';
      if (safeLevel <= 2) {
        const angle = Math.floor(Math.random() * 7) * 10 + 10;
        question = `Complement of ${angle}°?`;
        answer = 90 - angle;
        hint = `Complementary angles always add up to 90°. (90 - ${angle})`;
        steps = [`Complementary sum = 90°`, `90° - ${angle}° = ${90 - angle}°`];
        explanation = `Complement = 90° - ${angle}° = ${90 - angle}°`;
      } else {
        const a1 = Math.floor(Math.random() * 5) * 10 + 30;
        const a2 = Math.floor(Math.random() * 4) * 10 + 30;
        question = `Triangle angles: ${a1}°, ${a2}°, ?°`;
        answer = 180 - (a1 + a2);
        hint = `All 3 angles inside a triangle add up to 180°. (180 - (${a1} + ${a2}))`;
        steps = [`Sum known angles: ${a1}° + ${a2}° = ${a1 + a2}°`, `180° - ${a1 + a2}° = ${180 - (a1 + a2)}°`];
        explanation = `180° - (${a1}° + ${a2}°) = ${180 - (a1 + a2)}°`;
      }
      break;
    }

    case 'ratios': {
      topicTitle = 'Ratios & Proportions';
      const a = Math.floor(Math.random() * 4) + 1;
      const b = Math.floor(Math.random() * 4) + 2;
      const mult = safeLevel <= 2 ? 2 : Math.floor(Math.random() * 4) + 2;
      question = `${a}:${b} = ${a * mult}:?`;
      answer = b * mult;
      hint = `Find the scale factor: ${a * mult} ÷ ${a} = ${mult}. Multiply ${b} by ${mult}.`;
      steps = [`Ratio multiplied by ${mult}`, `${b} × ${mult} = ${b * mult}`];
      explanation = `${a}:${b} = ${a * mult}:${b * mult}`;
      break;
    }

    case 'place_value': {
      topicTitle = 'Place Value & Sense';
      const thousands = Math.floor(Math.random() * 8) + 1;
      const hundreds = Math.floor(Math.random() * 8) + 1;
      const tens = Math.floor(Math.random() * 8) + 1;
      const ones = Math.floor(Math.random() * 8) + 1;
      question = `Value of digit ${hundreds} in ${thousands}${hundreds}${tens}${ones}?`;
      answer = hundreds * 100;
      hint = `Look at position: thousands, HUNDREDS, tens, ones.`;
      steps = [`${hundreds} is in hundreds place`, `${hundreds} × 100 = ${hundreds * 100}`];
      explanation = `Digit ${hundreds} in hundreds place = ${hundreds * 100}`;
      break;
    }

    case 'number_patterns': {
      topicTitle = 'Number Sequences';
      const start = Math.floor(Math.random() * 15) + 2;
      const step = Math.floor(Math.random() * 4) + 2;
      question = `Pattern: ${start}, ${start + step}, ${start + step * 2}, ?`;
      answer = start + step * 3;
      hint = `Find the jump between numbers: adding +${step} each time.`;
      steps = [`Step difference is +${step}`, `${start + step * 2} + ${step} = ${start + step * 3}`];
      explanation = `Next number is ${start + step * 3}`;
      break;
    }

    default: {
      const a = Math.floor(Math.random() * 8) + 2;
      const b = Math.floor(Math.random() * 8) + 2;
      question = `${a} + ${b}`;
      answer = a + b;
      hint = `Count up ${b} steps from ${a}.`;
      steps = [`${a} + ${b} = ${a + b}`];
      explanation = `${a} + ${b} = ${a + b}`;
    }
  }

  return {
    id,
    question,
    answer,
    type,
    hint,
    steps,
    explanation,
    topicTitle,
    difficultyLevel: safeLevel
  };
}

/**
 * Recommends specific lessons in the Learning Hub based on performance weaknesses.
 */
export function getLearningHubRecommendations(
  topicStats: Record<string, { correct: number; total: number }>
): { lessonId: string; title: string; reason: string }[] {
  const recommendations: { lessonId: string; title: string; reason: string }[] = [];

  Object.entries(topicStats).forEach(([topic, stat]) => {
    const accuracy = stat.total > 0 ? (stat.correct / stat.total) : 1;
    if (accuracy < 0.75 && stat.total >= 1) {
      // Find matching lesson
      const matched = LESSONS.find(l => 
        l.title.toLowerCase().includes(topic.toLowerCase()) || 
        l.problemTypes.some(pt => topic.toLowerCase().includes(pt))
      );
      if (matched && !recommendations.some(r => r.lessonId === matched.id)) {
        recommendations.push({
          lessonId: matched.id,
          title: matched.title,
          reason: `Accuracy was ${Math.round(accuracy * 100)}% on ${topic}. Review interactive models in the Learning Hub!`
        });
      }
    }
  });

  // Default fallback recommendation if all passed or none found
  if (recommendations.length === 0) {
    recommendations.push({
      lessonId: '1',
      title: 'Multiplication Mastery & Advanced Hub',
      reason: 'Strong performance across all tested topics! Keep leveling up in the Learning Hub.'
    });
  }

  return recommendations;
}

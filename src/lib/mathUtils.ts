import { Problem, Difficulty } from '../types';

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function simplify(num: number, den: number): string {
  const common = gcd(num, den);
  const sNum = num / common;
  const sDen = den / common;
  return sDen === 1 ? `${sNum}` : `${sNum}/${sDen}`;
}

const operators = {
  addition: '+',
  subtraction: '-',
  multiplication: '×',
  division: '÷',
  long_division: '÷',
  fractions_addition: '+'
};

export function generateProblem(difficulty: Difficulty | number, allowedTypes?: Problem['type'][]): Problem {
  const id = Math.random().toString(36).substring(2, 9);
  let level = 1;
  
  if (typeof difficulty === 'number') {
    level = Math.min(3, Math.max(1, difficulty));
  } else {
    switch (difficulty) {
      case 'easy':
        level = 1;
        break;
      case 'medium':
        level = 2;
        break;
      case 'hard':
      case 'extreme':
        level = 3;
        break;
      default:
        level = 1;
    }
  }

  let type: Problem['type'] = 'addition';
  
  if (allowedTypes && allowedTypes.length > 0) {
    type = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
  } else {
    // Broadened selection based on level
    const easyTypes: Problem['type'][] = ['addition', 'subtraction', 'place_value', 'time', 'money', 'number_patterns'];
    const mediumTypes: Problem['type'][] = ['addition', 'subtraction', 'multiplication', 'division', 'ratios', 'probability', 'integers'];
    const hardTypes: Problem['type'][] = ['multiplication', 'division', 'long_division', 'fractions_addition', 'exponents', 'geometry_angles', 'ratios', 'probability', 'integers'];
    
    if (level === 1) {
      type = easyTypes[Math.floor(Math.random() * easyTypes.length)];
    } else if (level === 2) {
      type = mediumTypes[Math.floor(Math.random() * mediumTypes.length)];
    } else {
      type = hardTypes[Math.floor(Math.random() * hardTypes.length)];
    }
  }

  let question = '';
  let answer: string | number = 0;

  if (type === 'addition') {
    if (level === 1) {
      const num1 = Math.floor(Math.random() * 9) + 1;
      const num2 = Math.floor(Math.random() * 9) + 1;
      question = `${num1} + ${num2}`;
      answer = num1 + num2;
    } else if (level === 2) {
      const num1 = Math.floor(Math.random() * 90) + 10;
      const num2 = Math.floor(Math.random() * 90) + 10;
      question = `${num1} + ${num2}`;
      answer = num1 + num2;
    } else {
      const isTwoStep = Math.random() > 0.5;
      if (isTwoStep) {
        const a = Math.floor(Math.random() * 8) + 2;
        const b = Math.floor(Math.random() * 8) + 2;
        const c = Math.floor(Math.random() * 15) + 1;
        question = `(${a} × ${b}) + ${c}`;
        answer = (a * b) + c;
      } else {
        const num1 = Math.floor(Math.random() * 300) + 100;
        const num2 = Math.floor(Math.random() * 300) + 100;
        question = `${num1} + ${num2}`;
        answer = num1 + num2;
      }
    }
  } else if (type === 'subtraction') {
    if (level === 1) {
      const num1 = Math.floor(Math.random() * 9) + 1;
      const num2 = Math.floor(Math.random() * 9) + 1;
      const max = Math.max(num1, num2);
      const min = Math.min(num1, num2);
      question = `${max} - ${min}`;
      answer = max - min;
    } else if (level === 2) {
      const num1 = Math.floor(Math.random() * 90) + 10;
      const num2 = Math.floor(Math.random() * 90) + 10;
      const max = Math.max(num1, num2);
      const min = Math.min(num1, num2);
      question = `${max} - ${min}`;
      answer = max - min;
    } else {
      const isTwoStep = Math.random() > 0.5;
      if (isTwoStep) {
        const a = Math.floor(Math.random() * 8) + 2;
        const b = Math.floor(Math.random() * 8) + 2;
        const c = Math.floor(Math.random() * 15) + 1;
        const product = a * b;
        const safeC = Math.min(c, product - 1);
        question = `(${a} × ${b}) - ${safeC}`;
        answer = product - safeC;
      } else {
        const num1 = Math.floor(Math.random() * 400) + 100;
        const num2 = Math.floor(Math.random() * 300) + 50;
        const max = Math.max(num1, num2);
        const min = Math.min(num1, num2);
        question = `${max} - ${min}`;
        answer = max - min;
      }
    }
  } else if (type === 'multiplication') {
    if (level === 1) {
      const num1 = Math.floor(Math.random() * 9) + 1;
      const num2 = Math.floor(Math.random() * 9) + 1;
      question = `${num1} × ${num2}`;
      answer = num1 * num2;
    } else if (level === 2) {
      const num1 = Math.floor(Math.random() * 10) + 3; // 3 to 12
      const num2 = Math.floor(Math.random() * 9) + 2;  // 2 to 10
      question = `${num1} × ${num2}`;
      answer = num1 * num2;
    } else {
      const num1 = Math.floor(Math.random() * 8) + 12; // 12 to 19
      const num2 = Math.floor(Math.random() * 11) + 2; // 2 to 12
      question = `${num1} × ${num2}`;
      answer = num1 * num2;
    }
  } else if (type === 'division') {
    if (level === 1) {
      const divisor = Math.floor(Math.random() * 8) + 2; // 2-9
      const quotient = Math.floor(Math.random() * 5) + 2; // 2-6
      const dividend = divisor * quotient;
      question = `${dividend} ÷ ${divisor}`;
      answer = quotient;
    } else if (level === 2) {
      const divisor = Math.floor(Math.random() * 11) + 2; // 2-12
      const quotient = Math.floor(Math.random() * 8) + 2; // 2-9
      const dividend = divisor * quotient;
      question = `${dividend} ÷ ${divisor}`;
      answer = quotient;
    } else {
      const divisor = Math.floor(Math.random() * 11) + 2; // 2-12
      const quotient = Math.floor(Math.random() * 11) + 2; // 2-12
      const dividend = divisor * quotient;
      question = `${dividend} ÷ ${divisor}`;
      answer = quotient;
    }
  } else if (type === 'long_division') {
    if (level === 1) {
      const divisor = Math.floor(Math.random() * 8) + 2; // 2-9
      const quotient = Math.floor(Math.random() * 20) + 11; // 11-30
      const dividend = divisor * quotient;
      question = `${dividend} ÷ ${divisor}`;
      answer = quotient;
    } else if (level === 2) {
      const divisor = Math.floor(Math.random() * 9) + 11; // 11-19
      const quotient = Math.floor(Math.random() * 15) + 11; // 11-25
      const dividend = divisor * quotient;
      question = `${dividend} ÷ ${divisor}`;
      answer = quotient;
    } else {
      const divisor = Math.floor(Math.random() * 20) + 11; // 11-30
      const quotient = Math.floor(Math.random() * 25) + 12; // 12-36
      const dividend = divisor * quotient;
      question = `${dividend} ÷ ${divisor}`;
      answer = quotient;
    }
  } else if (type === 'fractions_addition') {
    if (level === 1) {
      const den = Math.floor(Math.random() * 4) + 3; // 3 to 6
      const num1 = Math.floor(Math.random() * (den - 2)) + 1;
      const num2 = Math.floor(Math.random() * (den - 1 - num1)) + 1;
      question = `${num1}/${den} + ${num2}/${den}`;
      answer = simplify(num1 + num2, den);
    } else if (level === 2) {
      const den = Math.floor(Math.random() * 6) + 5; // 5 to 10
      const num1 = Math.floor(Math.random() * (den - 2)) + 1;
      const num2 = Math.floor(Math.random() * (den - 1 - num1)) + 1;
      question = `${num1}/${den} + ${num2}/${den}`;
      answer = simplify(num1 + num2, den);
    } else {
      const den = Math.floor(Math.random() * 8) + 5; // 5 to 12
      const num1 = Math.floor(Math.random() * (den - 2)) + 1;
      const num2 = Math.floor(Math.random() * (den - 1)) + 1; // can exceed 1
      question = `${num1}/${den} + ${num2}/${den}`;
      answer = simplify(num1 + num2, den);
    }
  } else if (type === 'ratios') {
    if (level === 1) {
      const a = Math.floor(Math.random() * 5) + 1;
      const b = Math.floor(Math.random() * 5) + 1;
      const multiplier = Math.floor(Math.random() * 4) + 2;
      question = `${a}:${b} = ${a * multiplier}:?`;
      answer = b * multiplier;
    } else if (level === 2) {
      const a = Math.floor(Math.random() * 5) + 1;
      const b = Math.floor(Math.random() * 5) + 1;
      const multiplier = Math.floor(Math.random() * 6) + 2;
      question = `${a}:${b} = ?:${b * multiplier}`;
      answer = a * multiplier;
    } else {
      const partsA = Math.floor(Math.random() * 4) + 1;
      const partsB = Math.floor(Math.random() * 4) + 1;
      const totalParts = partsA + partsB;
      const multiplier = Math.floor(Math.random() * 5) + 2;
      const total = totalParts * multiplier;
      question = `Divide ${total} in ratio ${partsA}:${partsB}. Larger part?`;
      answer = Math.max(partsA, partsB) * multiplier;
    }
  } else if (type === 'geometry_angles') {
    if (level === 1) {
      const angle = Math.floor(Math.random() * 8) * 10 + 10;
      question = `Complement of ${angle}°?`;
      answer = 90 - angle;
    } else if (level === 2) {
      const angle = Math.floor(Math.random() * 15) * 10 + 10;
      question = `Supplement of ${angle}°?`;
      answer = 180 - angle;
    } else {
      const a1 = Math.floor(Math.random() * 8) * 10 + 20;
      const a2 = Math.floor(Math.random() * (140 - a1)/10) * 10 + 10;
      question = `Triangle angles: ${a1}°, ${a2}°, ?°`;
      answer = 180 - (a1 + a2);
    }
  } else if (type === 'probability') {
    if (level === 1) {
      const total = Math.floor(Math.random() * 5) + 5;
      const target = Math.floor(Math.random() * 3) + 1;
      question = `Prob: ${target} wins out of ${total}. (format: x/y)`;
      answer = simplify(target, total);
    } else if (level === 2) {
      const red = Math.floor(Math.random() * 5) + 2;
      const blue = Math.floor(Math.random() * 5) + 2;
      question = `Bag: ${red} red, ${blue} blue. Prob of red? (x/y)`;
      answer = simplify(red, red + blue);
    } else {
      question = `Roll a 6-sided die. Prob of rolling an even number? (x/y)`;
      answer = "1/2";
    }
  } else if (type === 'integers') {
    if (level === 1) {
      const a = -Math.floor(Math.random() * 10) - 1;
      const b = Math.floor(Math.random() * 10) + 1;
      question = `${a} + ${b}`;
      answer = a + b;
    } else if (level === 2) {
      const a = -Math.floor(Math.random() * 15) - 1;
      const b = -Math.floor(Math.random() * 15) - 1;
      question = `${a} - (${b})`;
      answer = a - b;
    } else {
      const a = -Math.floor(Math.random() * 10) - 1;
      const b = -Math.floor(Math.random() * 5) - 1;
      question = `${a} × (${b})`;
      answer = a * b;
    }
  } else if (type === 'exponents') {
    if (level === 1) {
      const base = Math.floor(Math.random() * 5) + 2;
      question = `${base}²`;
      answer = base * base;
    } else if (level === 2) {
      const base = Math.floor(Math.random() * 4) + 2;
      question = `${base}³`;
      answer = base * base * base;
    } else {
      const base = Math.floor(Math.random() * 3) + 2;
      const exp = Math.floor(Math.random() * 2) + 3;
      question = `${base}^${exp}`;
      answer = Math.pow(base, exp);
    }
  } else if (type === 'place_value') {
    if (level === 1) {
      const hundreds = Math.floor(Math.random() * 9) + 1;
      const tens = Math.floor(Math.random() * 9) + 1;
      const ones = Math.floor(Math.random() * 9) + 1;
      question = `Value of ${tens} in ${hundreds}${tens}${ones}?`;
      answer = tens * 10;
    } else if (level === 2) {
      const thousands = Math.floor(Math.random() * 9) + 1;
      const hundreds = Math.floor(Math.random() * 9) + 1;
      const tens = Math.floor(Math.random() * 9) + 1;
      const ones = Math.floor(Math.random() * 9) + 1;
      question = `Value of ${hundreds} in ${thousands}${hundreds}${tens}${ones}?`;
      answer = hundreds * 100;
    } else {
      const thousands = Math.floor(Math.random() * 9) + 1;
      const hundreds = Math.floor(Math.random() * 9) + 1;
      const tens = Math.floor(Math.random() * 9) + 1;
      const ones = Math.floor(Math.random() * 9) + 1;
      question = `Value of ${thousands} in ${thousands}${hundreds}${tens}${ones}?`;
      answer = thousands * 1000;
    }
  } else if (type === 'number_patterns') {
    if (level === 1) {
      const start = Math.floor(Math.random() * 10) + 2;
      const step = Math.floor(Math.random() * 3) + 2;
      question = `Next in pattern: ${start}, ${start+step}, ${start+step*2}, ?`;
      answer = start + step * 3;
    } else if (level === 2) {
      const start = Math.floor(Math.random() * 20) + 10;
      const step = Math.floor(Math.random() * 5) + 3;
      question = `Next in pattern: ${start}, ${start-step}, ${start-step*2}, ?`;
      answer = start - step * 3;
    } else {
      const start = Math.floor(Math.random() * 5) + 2;
      const mult = 2;
      question = `Next in pattern: ${start}, ${start*mult}, ${start*mult*mult}, ?`;
      answer = start * Math.pow(mult, 3);
    }
  } else if (type === 'time') {
    if (level === 1) {
      const days = Math.floor(Math.random() * 3) + 2;
      question = `Hours in ${days} days?`;
      answer = days * 24;
    } else if (level === 2) {
      const mins = Math.floor(Math.random() * 3) + 2;
      question = `Seconds in ${mins} minutes?`;
      answer = mins * 60;
    } else {
      const h = Math.floor(Math.random() * 3) + 1;
      const m = Math.floor(Math.random() * 30) + 15;
      question = `Minutes in ${h}h ${m}m?`;
      answer = h * 60 + m;
    }
  } else if (type === 'money') {
    if (level === 1) {
      const q = Math.floor(Math.random() * 4) + 1;
      const d = Math.floor(Math.random() * 4) + 1;
      question = `Value (cents): ${q} quarters, ${d} dimes`;
      answer = q * 25 + d * 10;
    } else if (level === 2) {
      const price = (Math.floor(Math.random() * 8) + 2) * 10;
      const paid = 100;
      question = `Change from 100¢ if you spend ${price}¢?`;
      answer = paid - price;
    } else {
      const price = Math.floor(Math.random() * 40) + 10;
      const amount = Math.floor(Math.random() * 3) + 2;
      const paid = 200;
      question = `Change from 200¢ for ${amount} items at ${price}¢ each?`;
      answer = paid - (amount * price);
    }
  }

  return {
    id,
    question,
    answer,
    type
  };
}

export function calculateXP(correct: boolean, difficulty: Difficulty): number {
  if (!correct) return 0;
  const base = 10;
  const multipliers = { easy: 1, medium: 2, hard: 4, extreme: 8 };
  return base * multipliers[difficulty];
}

export function generateArenaQuestions(): { question: string, answer: string, id: string }[] {
  const list = [];
  const ops = ['+', '-', '×'];
  for (let i = 0; i < 20; i++) {
    const op = ops[Math.floor(Math.random() * ops.length)];
    let num1 = 0, num2 = 0;
    
    if (i < 5) {
      if (op === '×') {
        num1 = Math.floor(Math.random() * 5) + 1;
        num2 = Math.floor(Math.random() * 5) + 1; 
      } else if (op === '+') {
        num1 = Math.floor(Math.random() * 15) + 5;
        num2 = Math.floor(Math.random() * 15) + 5;
      } else {
        num1 = Math.floor(Math.random() * 20) + 5;
        num2 = Math.floor(Math.random() * 10) + 1;
      }
    } else if (i < 10) {
      if (op === '×') {
        num1 = Math.floor(Math.random() * 8) + 4;
        num2 = Math.floor(Math.random() * 8) + 4;
      } else if (op === '+') {
        num1 = Math.floor(Math.random() * 80) + 20;
        num2 = Math.floor(Math.random() * 80) + 20;
      } else {
        num1 = Math.floor(Math.random() * 100) + 30;
        num2 = Math.floor(Math.random() * 60) + 10;
      }
    } else {
      if (op === '×') {
        num1 = Math.floor(Math.random() * 15) + 7;
        num2 = Math.floor(Math.random() * 13) + 6;
      } else if (op === '+') {
        num1 = Math.floor(Math.random() * 380) + 60;
        num2 = Math.floor(Math.random() * 380) + 60;
      } else {
        num1 = Math.floor(Math.random() * 450) + 100;
        num2 = Math.floor(Math.random() * 380) + 40;
      }
    }
    
    if (op === '-' && num1 < num2) {
      [num1, num2] = [num2, num1];
    }
    
    let answer = '';
    if (op === '+') answer = String(num1 + num2);
    else if (op === '-') answer = String(num1 - num2);
    else if (op === '×') answer = String(num1 * num2);
    
    list.push({
      id: `arena-q-${i}-${Math.random().toString(36).substring(2, 6)}`,
      question: `${num1} ${op} ${num2}`,
      answer
    });
  }
  return list;
}

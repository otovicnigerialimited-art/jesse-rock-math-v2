import { SmartQuestion } from '../types/extendedTypes';

export const SMART_QUESTION_BANK: SmartQuestion[] = [
  {
    id: 'sq_1',
    question: 'What is 3/4 + 2/5?',
    type: 'fractions_addition',
    answer: '23/20',
    options: ['5/9', '23/20', '6/20', '1/2'],
    explanation: 'Find a common denominator for 4 and 5 (which is 20). 3/4 = 15/20 and 2/5 = 8/20. Adding them together gives 15/20 + 8/20 = 23/20 (or 1 3/20).',
    misconception: 'Common error: Adding numerators and denominators directly (3+2 / 4+5 = 5/9). Always find a common denominator first!',
    topic: 'Fractions',
    skill: 'Fractions Addition',
    difficulty: 'hard',
    level: 3
  },
  {
    id: 'sq_2',
    question: 'Solve for x: 3x + 7 = 22',
    type: 'integers',
    answer: '5',
    options: ['3', '5', '7', '15'],
    explanation: 'Subtract 7 from both sides: 3x = 15. Then divide both sides by 3: x = 5.',
    misconception: 'Common error: Adding 7 instead of subtracting (3x = 29) or forgetting to balance both sides of the equals sign.',
    topic: 'Algebra',
    skill: 'Linear Equations',
    difficulty: 'medium',
    level: 2
  },
  {
    id: 'sq_3',
    question: 'What is 15.4 - 6.85?',
    type: 'addition',
    answer: '8.55',
    options: ['8.55', '8.65', '9.45', '8.15'],
    explanation: 'Align decimal points: 15.40 - 6.85. Borrow from the tenths place: 10 - 5 = 5, 13 - 8 = 5, 14 - 6 = 8. Result is 8.55.',
    misconception: 'Common error: Subtracting 5 from 0 in reverse (thinking 5 - 0 = 5) without regrouping tenths and hundredths.',
    topic: 'Decimals',
    skill: 'Decimal Subtraction',
    difficulty: 'medium',
    level: 2
  },
  {
    id: 'sq_4',
    question: 'Find the missing angle in a triangle with angles 65° and 45°.',
    type: 'geometry_angles',
    answer: '70°',
    options: ['60°', '70°', '80°', '90°'],
    explanation: 'Angles in a triangle always sum to 180°. 65° + 45° = 110°. 180° - 110° = 70°.',
    misconception: 'Common error: Confusing triangle angle sum (180°) with quadrilateral angle sum (360°).',
    topic: 'Geometry',
    skill: 'Triangle Angles',
    difficulty: 'medium',
    level: 2
  },
  {
    id: 'sq_5',
    question: 'What is 480 ÷ 60?',
    type: 'division',
    answer: '8',
    options: ['6', '8', '80', '800'],
    explanation: 'Cancel the trailing zeros: 48 ÷ 6 = 8. So 480 ÷ 60 = 8.',
    misconception: 'Common error: Place value overflow (selecting 80 or 800) by not cancelling zeros equally on both numbers.',
    topic: 'Arithmetic',
    skill: 'Mental Division',
    difficulty: 'easy',
    level: 1
  },
  {
    id: 'sq_6',
    question: 'Calculate: 8 + 2 × (5 - 2)',
    type: 'integers',
    answer: '14',
    options: ['14', '30', '24', '18'],
    explanation: 'Use BODMAS/BIDMAS order of operations: Parentheses first (5-2 = 3), then Multiplication (2 × 3 = 6), then Addition (8 + 6 = 14).',
    misconception: 'Common error: Calculating left-to-right without respecting operator precedence (8+2 = 10, 10 × 3 = 30).',
    topic: 'Arithmetic',
    skill: 'Order of Operations',
    difficulty: 'medium',
    level: 2
  }
];

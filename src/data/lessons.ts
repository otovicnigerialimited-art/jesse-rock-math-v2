export interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  problemTypes: string[];
}

export const LESSONS: Lesson[] = [
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
    title: 'Long Division Pitch',
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

import fs from 'fs';
let code = fs.readFileSync('src/components/LearningHub.tsx', 'utf-8');

const additionalLessons = `
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
`;

code = code.replace(/problemTypes: \['addition', 'subtraction', 'multiplication', 'division'\]\n\s*\}\n\];/, "problemTypes: ['addition', 'subtraction', 'multiplication', 'division']\n  }," + additionalLessons + "\n];");

fs.writeFileSync('src/components/LearningHub.tsx', code);

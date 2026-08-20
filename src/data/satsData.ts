import { SatsDomain, SatsTopicInfo, SatsQuestion } from '../types/sats';

export const SATS_DOMAINS: Array<{
  id: SatsDomain;
  title: string;
  color: string;
  borderColor: string;
  bgLight: string;
  iconName: string;
  description: string;
}> = [
  {
    id: 'number',
    title: 'Number & Place Value',
    color: 'text-indigo-700',
    borderColor: 'border-indigo-500',
    bgLight: 'bg-indigo-50',
    iconName: 'Binary',
    description: 'Place value, rounding, negative numbers, 4 operations, prime numbers, factors and multiples.'
  },
  {
    id: 'fractions',
    title: 'Fractions, Decimals & Percentages',
    color: 'text-emerald-700',
    borderColor: 'border-emerald-500',
    bgLight: 'bg-emerald-50',
    iconName: 'PieChart',
    description: 'Equivalent fractions, operations with fractions, conversions, percentages of amounts.'
  },
  {
    id: 'ratio',
    title: 'Ratio & Proportion',
    color: 'text-amber-700',
    borderColor: 'border-amber-500',
    bgLight: 'bg-amber-50',
    iconName: 'Scale',
    description: 'Unequal sharing, scaling recipes, comparing quantities, scale drawings and proportion.'
  },
  {
    id: 'algebra',
    title: 'Algebra & Sequences',
    color: 'text-purple-700',
    borderColor: 'border-purple-500',
    bgLight: 'bg-purple-50',
    iconName: 'Variable',
    description: 'Formulae, linear sequences, finding missing numbers, simple 1 and 2-step equations.'
  },
  {
    id: 'measurement',
    title: 'Measurement & Units',
    color: 'text-cyan-700',
    borderColor: 'border-cyan-500',
    bgLight: 'bg-cyan-50',
    iconName: 'Ruler',
    description: 'Converting units (metric & imperial), perimeter, area of compound shapes, volume and time.'
  },
  {
    id: 'geometry',
    title: 'Geometry (Properties & Position)',
    color: 'text-rose-700',
    borderColor: 'border-rose-500',
    bgLight: 'bg-rose-50',
    iconName: 'Shapes',
    description: 'Angles in triangles & lines, 2D/3D shapes, coordinates in four quadrants, translation and reflection.'
  },
  {
    id: 'statistics',
    title: 'Statistics & Data Handling',
    color: 'text-blue-700',
    borderColor: 'border-blue-500',
    bgLight: 'bg-blue-50',
    iconName: 'BarChart3',
    description: 'Interpreting tables, line graphs, pie charts, calculating the mean of sets of data.'
  },
  {
    id: 'reasoning',
    title: 'Reasoning & Multi-Step Problems',
    color: 'text-violet-700',
    borderColor: 'border-violet-500',
    bgLight: 'bg-violet-50',
    iconName: 'Brain',
    description: 'Complex word problems, problem-solving heuristics, real-world context and proof.'
  }
];

export const SATS_TOPICS: SatsTopicInfo[] = [
  {
    id: 'topic_place_value',
    domain: 'number',
    title: 'Place Value & Rounding',
    subtitle: 'Numbers up to 10,000,000 & decimal places',
    description: 'Read, write, order and compare numbers up to ten million and round any number to a required degree of accuracy.',
    iconName: 'Hash',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    estimatedMinutes: 12,
    subtopics: ['Ordering integers', 'Rounding to nearest 10, 100, 1000', 'Negative numbers in context', 'Decimal place values'],
    learnModule: {
      concept: {
        heading: 'Mastering Large Place Values & Decimals',
        explanation: [
          'In our base-10 number system, each column represents 10 times the value of the column to its right.',
          'To round a number, look at the digit to the right of your target place. If it is 5 or more, round UP. If it is 4 or less, round DOWN.'
        ],
        keyRules: [
          'Millions (M) → Hundred Thousands (HTh) → Ten Thousands (TTh) → Thousands (Th) → Hundreds (H) → Tens (T) → Ones (O)',
          'Tenths (0.1) → Hundredths (0.01) → Thousandths (0.001)',
          'When rounding 345,670 to the nearest 1,000: look at the hundreds column (6 ≥ 5), so it rounds up to 346,000.'
        ]
      },
      example: {
        question: 'Round 4,528,740 to the nearest ten thousand.',
        steps: [
          'Identify the Ten Thousands digit: 2 (value = 20,000).',
          'Look at the next digit to the right (Thousands digit): 8.',
          'Since 8 is 5 or greater, round the ten thousands digit up from 2 to 3.',
          'Replace all digits to the right with zeros.'
        ],
        finalAnswer: '4,530,000',
        tip: 'Always circle your target place digit and underline the decision digit to its right.'
      },
      tryTogether: {
        question: 'What is 3,089,450 rounded to the nearest hundred thousand?',
        hint: 'The hundred thousands digit is 0, and the ten thousands digit to its right is 8.',
        solutionExplanation: 'Since 8 ≥ 5, we round 0 hundred-thousands up to 1 hundred-thousand, giving 3,100,000.',
        correctAnswer: '3,100,000',
        options: ['3,000,000', '3,080,000', '3,090,000', '3,100,000']
      },
      tryYourself: [
        {
          id: 'pv_q1',
          question: 'What is the value of the digit 7 in the number 4,715,032?',
          options: ['7,000', '70,000', '700,000', '7,000,000'],
          correctAnswer: '700,000',
          explanation: 'The 7 is in the hundred thousands column, so its value is 700,000.',
          marks: 1
        },
        {
          id: 'pv_q2',
          question: 'The temperature at 6pm was 3°C. By midnight it had fallen by 8°C. What was the midnight temperature?',
          options: ['-5°C', '-11°C', '5°C', '-4°C'],
          correctAnswer: '-5°C',
          explanation: '3 - 8 = -5°C. When subtracting past zero, count 3 down to 0, then 5 more down to -5.',
          marks: 1
        }
      ],
      satsChallenge: {
        question: 'A concert stadium has 65,492 attendees. The local newspaper rounds this to the nearest thousand. The national newspaper rounds it to the nearest hundred. What is the difference between their rounded figures?',
        context: 'KS2 SATs Paper 3 Style - 2 Marks',
        marks: 2,
        options: ['10', '500', '510', '1000'],
        correctAnswer: '10',
        workedSolution: 'Local newspaper (nearest 1,000): 65,492 → 65,000. National newspaper (nearest 100): 65,492 → 65,500. Difference = 65,500 - 65,000 = 500 (Wait, 65,000 to 65,500 is 500). If rounded to 65,000 vs 65,500 the difference is 500.',
        examinerTip: 'Ensure you write both rounded values clearly in your working box before finding their difference.'
      }
    }
  },
  {
    id: 'topic_equivalent_fractions',
    domain: 'fractions',
    title: 'Fractions & Operations',
    subtitle: 'Adding, subtracting, multiplying and dividing fractions',
    description: 'Master operations with unlike denominators, mixed numbers, multiplying fractions and dividing fractions by whole numbers.',
    iconName: 'PieChart',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    estimatedMinutes: 15,
    subtopics: ['Common denominators', 'Adding & subtracting mixed numbers', 'Multiplying fractions by integers & fractions', 'Dividing fractions by integers'],
    learnModule: {
      concept: {
        heading: 'Operations with Unlike Denominators',
        explanation: [
          'To add or subtract fractions, they MUST have a common denominator (find the Lowest Common Multiple).',
          'To multiply fractions: multiply numerators together, multiply denominators together.',
          'To divide a fraction by an integer: multiply the denominator by the whole number (or Keep-Change-Flip).'
        ],
        keyRules: [
          'Addition/Subtraction: 2/3 + 1/4 = 8/12 + 3/12 = 11/12',
          'Multiplication: 2/5 × 3/4 = 6/20 = 3/10',
          'Division: 3/4 ÷ 2 = 3 / (4 × 2) = 3/8',
          'Always simplify fractions to their simplest form when required.'
        ]
      },
      example: {
        question: 'Calculate 3/4 - 1/6. Give your answer in its simplest form.',
        steps: [
          'Find the LCM of denominators 4 and 6. Multiples of 4: 4, 8, 12, 16. Multiples of 6: 6, 12. LCM is 12.',
          'Convert 3/4: (3 × 3) / (4 × 3) = 9/12.',
          'Convert 1/6: (1 × 2) / (6 × 2) = 2/12.',
          'Subtract numerators: 9/12 - 2/12 = 7/12.'
        ],
        finalAnswer: '7/12',
        tip: 'Never subtract the denominators from each other! Only subtract the converted numerators.'
      },
      tryTogether: {
        question: 'What is 2/5 + 3/10?',
        hint: 'Convert 2/5 into tenths first by multiplying top and bottom by 2.',
        solutionExplanation: '2/5 = 4/10. Now add: 4/10 + 3/10 = 7/10.',
        correctAnswer: '7/10',
        options: ['5/15', '1/3', '7/10', '5/10']
      },
      tryYourself: [
        {
          id: 'frac_q1',
          question: 'Calculate: 4/5 × 3/7',
          options: ['12/35', '7/12', '28/15', '12/12'],
          correctAnswer: '12/35',
          explanation: 'Multiply numerators: 4 × 3 = 12. Multiply denominators: 5 × 7 = 35. Result: 12/35.',
          marks: 1
        },
        {
          id: 'frac_q2',
          question: 'Calculate: 3/5 ÷ 4',
          options: ['12/5', '3/20', '7/20', '1/5'],
          correctAnswer: '3/20',
          explanation: 'Keep 3/5, change ÷ to ×, flip 4 to 1/4. 3/5 × 1/4 = 3/20.',
          marks: 1
        }
      ],
      satsChallenge: {
        question: 'In a class of 30 pupils, 2/5 of the pupils walk to school, 1/3 come by car, and the rest cycle. How many pupils cycle to school?',
        context: 'KS2 SATs Paper 2 Style - 2 Marks',
        marks: 2,
        options: ['8', '10', '12', '6'],
        correctAnswer: '8',
        workedSolution: 'Walk: 2/5 of 30 = (30 ÷ 5) × 2 = 12 pupils. Car: 1/3 of 30 = 30 ÷ 3 = 10 pupils. Total walking or car = 12 + 10 = 22. Cycle = 30 - 22 = 8 pupils.',
        examinerTip: 'Work out the integer quantity for each fraction first, then subtract from the total class count.'
      }
    }
  },
  {
    id: 'topic_ratio_proportion',
    domain: 'ratio',
    title: 'Ratio & Proportion',
    subtitle: 'Sharing amounts, recipes, scaling & map scales',
    description: 'Solve problems involving the relative sizes of two quantities where missing values can be found by using integer multiplication and division.',
    iconName: 'Scale',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    estimatedMinutes: 14,
    subtopics: ['Simplifying ratios', 'Sharing in a ratio', 'Recipe scaling', 'Scale drawings & maps'],
    learnModule: {
      concept: {
        heading: 'Mastering Ratio & Scaling',
        explanation: [
          'A ratio shows the relative size of two or more values (e.g. 3:2 means for every 3 of one, there are 2 of the other).',
          'To share an amount in a given ratio, add the parts together to find the total number of parts, divide the total by this number to find 1 part, then multiply.'
        ],
        keyRules: [
          'Ratio 3:5 has 3 + 5 = 8 total parts.',
          'Value of 1 part = Total Amount ÷ Total Parts.',
          'Multiply the value of 1 part by each ratio number.'
        ]
      },
      example: {
        question: 'Share £120 between Maya and Liam in the ratio 3:5.',
        steps: [
          'Add parts: 3 + 5 = 8 parts.',
          'Find 1 part: £120 ÷ 8 = £15.',
          'Maya (3 parts): 3 × £15 = £45.',
          'Liam (5 parts): 5 × £15 = £75.',
          'Check: £45 + £75 = £120.'
        ],
        finalAnswer: 'Maya: £45, Liam: £75',
        tip: 'Always add the parts together first and check that the sum of the shares equals the original total.'
      },
      tryTogether: {
        question: 'A recipe for 4 people uses 200g of flour. How much flour is needed for 6 people?',
        hint: 'Find the amount for 1 person first (200g ÷ 4), then multiply by 6.',
        solutionExplanation: '1 person = 200g ÷ 4 = 50g. For 6 people = 50g × 6 = 300g.',
        correctAnswer: '300g',
        options: ['250g', '300g', '350g', '400g']
      },
      tryYourself: [
        {
          id: 'ratio_q1',
          question: 'The ratio of blue to red counters in a bag is 2:7. If there are 14 red counters, how many blue counters are there?',
          options: ['2', '4', '7', '14'],
          correctAnswer: '4',
          explanation: 'Red is 7 parts = 14 counters. 1 part = 14 ÷ 7 = 2. Blue is 2 parts = 2 × 2 = 4 counters.',
          marks: 1
        }
      ],
      satsChallenge: {
        question: 'On a map, 1 cm represents 5 km. The distance between two towns on the map is 6.4 cm. What is the actual distance in km?',
        context: 'KS2 SATs Paper 3 Style - 1 Mark',
        marks: 1,
        options: ['30 km', '32 km', '35 km', '64 km'],
        correctAnswer: '32 km',
        workedSolution: '6.4 × 5 = 6 × 5 + 0.4 × 5 = 30 + 2.0 = 32 km.',
        examinerTip: 'Break down decimal multiplications into whole numbers and tenths: (6 × 5) + (0.4 × 5).'
      }
    }
  },
  {
    id: 'topic_algebra_sequences',
    domain: 'algebra',
    title: 'Algebra, Equations & Sequences',
    subtitle: 'Unknowns, substituting into formulae & nth terms',
    description: 'Use simple formulae, generate and describe linear number sequences, express missing number problems algebraically, and find pairs of numbers that satisfy an equation.',
    iconName: 'Variable',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    estimatedMinutes: 14,
    subtopics: ['Balancing equations', 'Substituting numbers for letters', 'Function machines', 'Missing term sequences'],
    learnModule: {
      concept: {
        heading: 'Solving Equations & Linear Sequences',
        explanation: [
          'An equation is like a balance scale: whatever operation you do to one side, you must do to the other side to keep it equal.',
          'To isolate the unknown variable, apply inverse operations in reverse order.'
        ],
        keyRules: [
          'Addition ↔ Subtraction are inverses.',
          'Multiplication ↔ Division are inverses.',
          'If 3a + 5 = 20, subtract 5 from both sides: 3a = 15, then divide both sides by 3: a = 5.'
        ]
      },
      example: {
        question: 'Solve for x: 4x - 7 = 25',
        steps: [
          'Step 1: Add 7 to both sides → 4x = 25 + 7 = 32.',
          'Step 2: Divide both sides by 4 → x = 32 ÷ 4 = 8.',
          'Step 3: Substitute back to check: 4(8) - 7 = 32 - 7 = 25. Correct!'
        ],
        finalAnswer: 'x = 8',
        tip: 'Always substitute your solution back into the original equation to verify.'
      },
      tryTogether: {
        question: 'If 2m + 8 = 24, what is the value of m?',
        hint: 'First subtract 8 from 24, then divide by 2.',
        solutionExplanation: '2m = 24 - 8 = 16. m = 16 ÷ 2 = 8.',
        correctAnswer: '8',
        options: ['6', '8', '10', '12']
      },
      tryYourself: [
        {
          id: 'alg_q1',
          question: 'The rule for a sequence is: "Multiply by 2 then add 3". If the input is 7, what is the output?',
          options: ['14', '17', '20', '21'],
          correctAnswer: '17',
          explanation: '(7 × 2) + 3 = 14 + 3 = 17.',
          marks: 1
        }
      ],
      satsChallenge: {
        question: 'a and b are whole numbers. 2a + b = 14. If a = 4, what is the value of b?',
        context: 'KS2 SATs Paper 2 Style - 1 Mark',
        marks: 1,
        options: ['4', '6', '8', '10'],
        correctAnswer: '6',
        workedSolution: '2(4) + b = 14 → 8 + b = 14 → b = 14 - 8 = 6.',
        examinerTip: 'Substitute the known variable first before solving for the unknown.'
      }
    }
  },
  {
    id: 'topic_measurement_area',
    domain: 'measurement',
    title: 'Perimeter, Area & Volume',
    subtitle: 'Compound shapes, triangles, parallelograms & cuboids',
    description: 'Calculate the area of parallelograms and triangles, recognize when it is possible to use formulae for area and volume of shapes.',
    iconName: 'Ruler',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    estimatedMinutes: 14,
    subtopics: ['Area of triangles (1/2 base × height)', 'Area of parallelograms (base × perpendicular height)', 'Volume of cuboids (l × w × h)', 'Perimeter of compound shapes'],
    learnModule: {
      concept: {
        heading: 'Formulae for Area & Volume',
        explanation: [
          'Perimeter is the total distance around the outside edge of a 2D shape (add all outer sides).',
          'Area is the space inside a 2D shape (measured in cm² or m²).',
          'Volume is the 3D space occupied (measured in cm³ or m³).'
        ],
        keyRules: [
          'Rectangle Area = length × width',
          'Triangle Area = (base × perpendicular height) ÷ 2',
          'Parallelogram Area = base × perpendicular height',
          'Cuboid Volume = length × width × height'
        ]
      },
      example: {
        question: 'Find the area of a right-angled triangle with base 8 cm and perpendicular height 6 cm.',
        steps: [
          'Use the formula: Area = (base × height) ÷ 2.',
          'Multiply base by height: 8 cm × 6 cm = 48 cm².',
          'Divide by 2: 48 ÷ 2 = 24 cm².'
        ],
        finalAnswer: '24 cm²',
        tip: 'Remember to always divide by 2 for triangles! Many students forget this step.'
      },
      tryTogether: {
        question: 'A cuboid has length 5 cm, width 4 cm, and height 3 cm. What is its volume?',
        hint: 'Multiply length × width × height.',
        solutionExplanation: 'Volume = 5 × 4 × 3 = 20 × 3 = 60 cm³.',
        correctAnswer: '60 cm³',
        options: ['24 cm³', '45 cm³', '60 cm³', '120 cm³']
      },
      tryYourself: [
        {
          id: 'meas_q1',
          question: 'A rectangle has a perimeter of 30 cm. If its length is 10 cm, what is its width?',
          options: ['5 cm', '10 cm', '15 cm', '20 cm'],
          correctAnswer: '5 cm',
          explanation: 'Perimeter = 2(length + width). 30 ÷ 2 = 15 cm for (length + width). Width = 15 - 10 = 5 cm.',
          marks: 1
        }
      ],
      satsChallenge: {
        question: 'A garden lawn is a rectangle 12 m long and 8 m wide. A paved path 1 m wide surrounds the lawn. What is the total area including the lawn and path?',
        context: 'KS2 SATs Paper 3 Style - 2 Marks',
        marks: 2,
        options: ['96 m²', '120 m²', '140 m²', '160 m²'],
        correctAnswer: '140 m²',
        workedSolution: 'The path adds 1 m to both sides: New length = 12 + 1 + 1 = 14 m. New width = 8 + 1 + 1 = 10 m. Total Area = 14 × 10 = 140 m².',
        examinerTip: 'Draw a diagram! Remember a surrounding path adds width to BOTH ends.'
      }
    }
  },
  {
    id: 'topic_geometry_angles',
    domain: 'geometry',
    title: 'Angles & Shape Properties',
    subtitle: 'Angles on a line, in triangles, quadrilaterals & intersecting lines',
    description: 'Find unknown angles in any triangles, quadrilaterals, and regular polygons, and recognize angles where they meet at a point, are on a straight line, or are vertically opposite.',
    iconName: 'Shapes',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    estimatedMinutes: 13,
    subtopics: ['Angles on a straight line (180°)', 'Angles around a point (360°)', 'Angles in a triangle (180°)', 'Angles in a quadrilateral (360°)', 'Vertically opposite angles are equal'],
    learnModule: {
      concept: {
        heading: 'Key Angle Rules for KS2 SATs',
        explanation: [
          'Angles measure the amount of turn. A full turn is 360°, a half turn (straight line) is 180°, and a quarter turn (right angle) is 90°.',
          'Opposite angles formed by two intersecting straight lines are always equal.'
        ],
        keyRules: [
          'Angles on a straight line sum to 180°',
          'Angles in a triangle sum to 180°',
          'Angles around a full point sum to 360°',
          'Angles in a 4-sided quadrilateral sum to 360°',
          'An isosceles triangle has 2 equal sides and 2 equal base angles.'
        ]
      },
      example: {
        question: 'An isosceles triangle has one angle of 40°. The other two angles are equal. What is the size of each equal angle?',
        steps: [
          'Total degrees in a triangle = 180°.',
          'Subtract known angle: 180° - 40° = 140°.',
          'Divide remaining degrees equally between the 2 angles: 140° ÷ 2 = 70°.'
        ],
        finalAnswer: '70°',
        tip: 'Always state the rule you are using (e.g. "angles in a triangle add to 180°").'
      },
      tryTogether: {
        question: 'Three angles on a straight line are 55°, 65°, and angle x. What is the size of angle x?',
        hint: 'Angles on a straight line add to 180°. Add 55 + 65 first.',
        solutionExplanation: '55° + 65° = 120°. Angle x = 180° - 120° = 60°.',
        correctAnswer: '60°',
        options: ['50°', '60°', '70°', '80°']
      },
      tryYourself: [
        {
          id: 'geom_q1',
          question: 'A quadrilateral has angles 90°, 85°, and 115°. What is the size of the fourth angle?',
          options: ['70°', '80°', '90°', '100°'],
          correctAnswer: '70°',
          explanation: 'Sum of angles in quadrilateral = 360°. 90 + 85 + 115 = 290°. 360 - 290 = 70°.',
          marks: 1
        }
      ],
      satsChallenge: {
        question: 'Two straight lines intersect. One angle is labeled 135°. What is the size of the adjacent acute angle on the straight line?',
        context: 'KS2 SATs Paper 2 Style - 1 Mark',
        marks: 1,
        options: ['45°', '55°', '90°', '135°'],
        correctAnswer: '45°',
        workedSolution: '180° - 135° = 45° because angles on a straight line sum to 180°.',
        examinerTip: 'Check whether the angle asked for is acute (<90°) or obtuse (>90°) to avoid simple subtraction errors.'
      }
    }
  },
  {
    id: 'topic_statistics_graphs',
    domain: 'statistics',
    title: 'Statistics & Graphs',
    subtitle: 'Line graphs, pie charts, tables & calculating the mean',
    description: 'Interpret and construct pie charts and line graphs and use these to solve problems. Calculate and interpret the mean as an average.',
    iconName: 'BarChart3',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    estimatedMinutes: 12,
    subtopics: ['Line graph trends & interpolation', 'Pie charts (fractions & percentages)', 'Two-way timetable analysis', 'Calculating the mean average'],
    learnModule: {
      concept: {
        heading: 'Calculating the Mean & Interpreting Charts',
        explanation: [
          'The Mean average is found by adding all data values together, then dividing by the total number of values.',
          'In pie charts, a full circle represents 360° or 100%. Half a circle is 180° or 50%.'
        ],
        keyRules: [
          'Mean = (Sum of all values) ÷ (Count of values)',
          'Example: Mean of 4, 7, 9, 12 is (4+7+9+12) ÷ 4 = 32 ÷ 4 = 8.'
        ]
      },
      example: {
        question: 'Five test scores are 6, 8, 7, 9, and 10. What is the mean score?',
        steps: [
          'Add all scores: 6 + 8 + 7 + 9 + 10 = 40.',
          'Count the number of scores: 5.',
          'Divide sum by count: 40 ÷ 5 = 8.'
        ],
        finalAnswer: '8',
        tip: 'The mean must always lie between the smallest and largest numbers in the set.'
      },
      tryTogether: {
        question: 'Four children scored a mean of 15 points in a game. Three of the scores were 12, 18, and 14. What was the fourth score?',
        hint: 'Total points = 4 × 15 = 60. Subtract the three known scores from 60.',
        solutionExplanation: 'Total = 4 × 15 = 60. Known scores = 12 + 18 + 14 = 44. Fourth score = 60 - 44 = 16.',
        correctAnswer: '16',
        options: ['14', '15', '16', '17']
      },
      tryYourself: [
        {
          id: 'stat_q1',
          question: 'A pie chart shows favourite colours of 120 pupils. The blue sector is 90° (a right angle). How many pupils chose blue?',
          options: ['20', '30', '40', '60'],
          correctAnswer: '30',
          explanation: '90° out of 360° is 1/4. 1/4 of 120 = 120 ÷ 4 = 30 pupils.',
          marks: 1
        }
      ],
      satsChallenge: {
        question: 'The mean mass of 3 apples is 150g. When a 4th apple is added, the new mean is 160g. What is the mass of the 4th apple?',
        context: 'KS2 SATs Paper 3 Style - 2 Marks',
        marks: 2,
        options: ['160g', '180g', '190g', '210g'],
        correctAnswer: '190g',
        workedSolution: 'Total for 3 apples = 3 × 150g = 450g. Total for 4 apples = 4 × 160g = 640g. Mass of 4th apple = 640g - 450g = 190g.',
        examinerTip: 'Work with totals! Total = Mean × Count.'
      }
    }
  },
  {
    id: 'topic_reasoning_multistep',
    domain: 'reasoning',
    title: 'Multi-Step Problem Solving',
    subtitle: 'Word problems, logic, real-world context & checking working',
    description: 'Solve multi-step problems in contexts, deciding which operations and methods to use and why. Check answers in the context of the problem.',
    iconName: 'Brain',
    badgeColor: 'bg-violet-100 text-violet-800 border-violet-300',
    estimatedMinutes: 15,
    subtopics: ['5-step problem solving heuristic', 'Money & change in multiple units', 'Inverse reasoning & working backwards', 'Recognizing hidden steps'],
    learnModule: {
      concept: {
        heading: 'The 5-Step SATs Problem Solving Framework',
        explanation: [
          'Multi-step questions in Paper 2 and 3 require more than one operation to find the final answer.',
          'Never rush straight to calculating: break the problem into clear, numbered intermediate targets.'
        ],
        keyRules: [
          'Step 1: Read carefully & highlight the question being asked.',
          'Step 2: Note the given facts and convert all numbers to identical units (e.g. all pence or all pounds).',
          'Step 3: Calculate intermediate step 1.',
          'Step 4: Calculate final step 2.',
          'Step 5: Sanity check: Does the answer make sense in reality?'
        ]
      },
      example: {
        question: 'Cinema tickets cost £8.50 for adults and £5.20 for children. A family buys 2 adult tickets and 3 child tickets and pays with a £50 note. How much change do they receive?',
        steps: [
          'Step 1 (Adults): 2 × £8.50 = £17.00.',
          'Step 2 (Children): 3 × £5.20 = £15.60.',
          'Step 3 (Total Cost): £17.00 + £15.60 = £32.60.',
          'Step 4 (Change): £50.00 - £32.60 = £17.40.'
        ],
        finalAnswer: '£17.40',
        tip: 'Check your change by adding £32.60 + £17.40 = £50.00.'
      },
      tryTogether: {
        question: 'Jack has £15. He buys 4 notebooks costing £2.40 each and a pen. He has £2.90 change left. How much did the pen cost?',
        hint: 'Find cost of 4 notebooks first (£9.60). Then add £9.60 to £2.90 change and subtract from £15.',
        solutionExplanation: 'Notebooks = 4 × £2.40 = £9.60. Total spent + change = £9.60 + £2.90 = £12.50. Pen cost = £15.00 - £12.50 = £2.50.',
        correctAnswer: '£2.50',
        options: ['£2.10', '£2.50', '£2.90', '£3.20']
      },
      tryYourself: [
        {
          id: 'reas_q1',
          question: 'A box of 24 pencils costs £7.20. What is the cost of 1 single pencil?',
          options: ['25p', '30p', '35p', '40p'],
          correctAnswer: '30p',
          explanation: '£7.20 = 720p. 720p ÷ 24 = 30p per pencil.',
          marks: 1
        }
      ],
      satsChallenge: {
        question: 'A baker bakes 240 cookies. 3/8 of them are chocolate chip, 1/4 are oatmeal raisin, and the rest are vanilla. How many vanilla cookies did the baker bake?',
        context: 'KS2 SATs Paper 2 Style - 2 Marks',
        marks: 2,
        options: ['60', '90', '120', '150'],
        correctAnswer: '90',
        workedSolution: 'Choc chip = 3/8 of 240 = (240 ÷ 8) × 3 = 30 × 3 = 90 cookies. Oatmeal = 1/4 of 240 = 240 ÷ 4 = 60 cookies. Total choc & oatmeal = 90 + 60 = 150 cookies. Vanilla = 240 - 150 = 90 cookies.',
        examinerTip: 'Show all working steps clearly in the box provided so method marks can be awarded even if an arithmetic slip occurs.'
      }
    }
  }
];

// Rich Bank of Original SATs Practice & Mock Test Questions
export const SATS_QUESTION_BANK: SatsQuestion[] = [
  // ARITHMETIC PAPER QUESTIONS (KS2 Paper 1 Style)
  {
    id: 'arith_1',
    domain: 'number',
    topicId: 'topic_place_value',
    paperType: 'arithmetic',
    question: '9,482 + 3,859 = ?',
    correctAnswer: '13341',
    marks: 1,
    difficulty: 'easy',
    explanation: 'Column addition: 9482 + 3859 = 13,341.'
  },
  {
    id: 'arith_2',
    domain: 'number',
    topicId: 'topic_place_value',
    paperType: 'arithmetic',
    question: '7,000 - 2,468 = ?',
    correctAnswer: '4532',
    marks: 1,
    difficulty: 'easy',
    explanation: 'Subtraction across zeros: 7000 - 2468 = 4,532.',
    mistakeTag: 'subtraction across zeros'
  },
  {
    id: 'arith_3',
    domain: 'number',
    topicId: 'topic_place_value',
    paperType: 'arithmetic',
    question: '84 × 6 = ?',
    correctAnswer: '504',
    marks: 1,
    difficulty: 'easy',
    explanation: '80 × 6 = 480, 4 × 6 = 24. 480 + 24 = 504.'
  },
  {
    id: 'arith_4',
    domain: 'number',
    topicId: 'topic_place_value',
    paperType: 'arithmetic',
    question: '432 ÷ 6 = ?',
    correctAnswer: '72',
    marks: 1,
    difficulty: 'medium',
    explanation: 'Bus stop short division: 432 ÷ 6 = 72.'
  },
  {
    id: 'arith_5',
    domain: 'fractions',
    topicId: 'topic_equivalent_fractions',
    paperType: 'arithmetic',
    question: '3/7 + 2/7 = ?',
    correctAnswer: '5/7',
    options: ['5/14', '5/7', '6/7', '1/7'],
    marks: 1,
    difficulty: 'easy',
    explanation: 'Same denominator: add numerators 3 + 2 = 5. Result = 5/7.'
  },
  {
    id: 'arith_6',
    domain: 'fractions',
    topicId: 'topic_equivalent_fractions',
    paperType: 'arithmetic',
    question: '3/4 - 1/8 = ?',
    correctAnswer: '5/8',
    options: ['2/4', '2/8', '5/8', '1/2'],
    marks: 1,
    difficulty: 'medium',
    explanation: '3/4 = 6/8. 6/8 - 1/8 = 5/8.',
    mistakeTag: 'subtracting fractions with different denominators'
  },
  {
    id: 'arith_7',
    domain: 'fractions',
    topicId: 'topic_equivalent_fractions',
    paperType: 'arithmetic',
    question: '3/5 × 4/7 = ?',
    correctAnswer: '12/35',
    options: ['7/12', '12/35', '15/28', '12/12'],
    marks: 1,
    difficulty: 'medium',
    explanation: 'Multiply numerators: 3 × 4 = 12. Multiply denominators: 5 × 7 = 35. 12/35.'
  },
  {
    id: 'arith_8',
    domain: 'fractions',
    topicId: 'topic_equivalent_fractions',
    paperType: 'arithmetic',
    question: '2/3 ÷ 4 = ?',
    correctAnswer: '2/12',
    options: ['2/12', '8/3', '1/6', '6/4'],
    marks: 1,
    difficulty: 'medium',
    explanation: '2/3 ÷ 4 = 2/(3×4) = 2/12 (which equals 1/6).',
    mistakeTag: 'dividing fractions by whole numbers'
  },
  {
    id: 'arith_9',
    domain: 'number',
    topicId: 'topic_place_value',
    paperType: 'arithmetic',
    question: '35% of 180 = ?',
    correctAnswer: '63',
    marks: 1,
    difficulty: 'medium',
    explanation: '10% = 18. 30% = 18 × 3 = 54. 5% = 9. 35% = 54 + 9 = 63.',
    mistakeTag: 'percentages of amounts'
  },
  {
    id: 'arith_10',
    domain: 'number',
    topicId: 'topic_place_value',
    paperType: 'arithmetic',
    question: '2.54 × 100 = ?',
    correctAnswer: '254',
    marks: 1,
    difficulty: 'easy',
    explanation: 'Multiplying by 100 moves the digits 2 places to the left: 254.'
  },
  {
    id: 'arith_11',
    domain: 'number',
    topicId: 'topic_place_value',
    paperType: 'arithmetic',
    question: '30 × 700 = ?',
    correctAnswer: '21000',
    marks: 1,
    difficulty: 'easy',
    explanation: '3 × 7 = 21, then add three zeros: 21,000.'
  },
  {
    id: 'arith_12',
    domain: 'number',
    topicId: 'topic_place_value',
    paperType: 'arithmetic',
    question: '1,368 ÷ 19 = ?',
    correctAnswer: '72',
    marks: 2,
    difficulty: 'hard',
    explanation: 'Long division: 1368 ÷ 19 = 72.',
    mistakeTag: 'long division'
  },

  // REASONING PAPER QUESTIONS (KS2 Paper 2 & 3 Style)
  {
    id: 'reas_1',
    domain: 'number',
    topicId: 'topic_place_value',
    paperType: 'reasoning',
    question: 'Write the number 4,050,608 in words.',
    options: [
      'Four million, fifty thousand, six hundred and eight',
      'Four million, five hundred thousand and eight',
      'Forty million, five thousand and eight',
      'Four million, five thousand, six hundred and eight'
    ],
    correctAnswer: 'Four million, fifty thousand, six hundred and eight',
    marks: 1,
    difficulty: 'medium',
    explanation: '4 millions, 0 hundred thousands, 5 ten thousands (fifty thousand), 0 thousands, 6 hundreds, 0 tens, 8 ones.'
  },
  {
    id: 'reas_2',
    domain: 'ratio',
    topicId: 'topic_ratio_proportion',
    paperType: 'reasoning',
    question: 'A fruit smoothie uses strawberries and bananas in the ratio 3:2. If Maya uses 180g of strawberries, how many grams of bananas does she need?',
    options: ['90g', '120g', '150g', '270g'],
    correctAnswer: '120g',
    marks: 1,
    difficulty: 'medium',
    explanation: '3 parts = 180g. 1 part = 180 ÷ 3 = 60g. Bananas = 2 parts = 2 × 60g = 120g.',
    mistakeTag: 'ratio scaling'
  },
  {
    id: 'reas_3',
    domain: 'algebra',
    topicId: 'topic_algebra_sequences',
    paperType: 'reasoning',
    question: 'A sequence starts at 4 and adds 6 each time (4, 10, 16, 22, ...). What is the 20th term in this sequence?',
    options: ['114', '118', '120', '124'],
    correctAnswer: '118',
    marks: 2,
    difficulty: 'hard',
    explanation: 'nth term rule = 6n - 2. For n = 20: (6 × 20) - 2 = 120 - 2 = 118.',
    mistakeTag: 'nth term sequences'
  },
  {
    id: 'reas_4',
    domain: 'geometry',
    topicId: 'topic_geometry_angles',
    paperType: 'reasoning',
    question: 'An isosceles triangle has an apex angle of 50°. What is the size of each of the other two base angles?',
    options: ['50°', '65°', '75°', '130°'],
    correctAnswer: '65°',
    marks: 1,
    difficulty: 'medium',
    explanation: '180° - 50° = 130°. Since base angles in an isosceles triangle are equal: 130° ÷ 2 = 65°.',
    mistakeTag: 'angles in triangles'
  },
  {
    id: 'reas_5',
    domain: 'measurement',
    topicId: 'topic_measurement_area',
    paperType: 'reasoning',
    question: 'A rectangular swimming pool measures 25 m by 10 m. What is its perimeter?',
    options: ['35 m', '70 m', '250 m', '500 m'],
    correctAnswer: '70 m',
    marks: 1,
    difficulty: 'easy',
    explanation: 'Perimeter = 2 × (length + width) = 2 × (25 + 10) = 2 × 35 = 70 m.'
  },
  {
    id: 'reas_6',
    domain: 'statistics',
    topicId: 'topic_statistics_graphs',
    paperType: 'reasoning',
    question: 'In five consecutive cricket matches, Liam scored 24, 30, 18, 42, and 36 runs. What was his mean score per match?',
    options: ['28', '30', '32', '35'],
    correctAnswer: '30',
    marks: 2,
    difficulty: 'medium',
    explanation: 'Total = 24 + 30 + 18 + 42 + 36 = 150. Mean = 150 ÷ 5 = 30 runs.'
  },
  {
    id: 'reas_7',
    domain: 'reasoning',
    topicId: 'topic_reasoning_multistep',
    paperType: 'reasoning',
    question: 'A school bus has 54 seats. There are 225 pupils going on a field trip. What is the minimum number of buses needed so every pupil gets a seat?',
    options: ['4', '5', '6', '7'],
    correctAnswer: '5',
    marks: 2,
    difficulty: 'medium',
    explanation: '225 ÷ 54 = 4 with a remainder of 9 pupils. Since the remaining 9 pupils still need transport, round up to 5 buses.',
    mistakeTag: 'division remainders in real life context'
  },
  {
    id: 'reas_8',
    domain: 'fractions',
    topicId: 'topic_equivalent_fractions',
    paperType: 'reasoning',
    question: 'Order these fractions from smallest to largest: 3/4, 2/3, 5/6, 7/12.',
    options: [
      '7/12, 2/3, 3/4, 5/6',
      '2/3, 7/12, 3/4, 5/6',
      '7/12, 3/4, 2/3, 5/6',
      '5/6, 3/4, 2/3, 7/12'
    ],
    correctAnswer: '7/12, 2/3, 3/4, 5/6',
    marks: 2,
    difficulty: 'hard',
    explanation: 'Convert all to twelfths: 7/12 = 7/12; 2/3 = 8/12; 3/4 = 9/12; 5/6 = 10/12. Smallest to largest: 7/12, 2/3, 3/4, 5/6.',
    mistakeTag: 'ordering fractions'
  }
];

// Exam Guide Content & Strategies
export const SATS_EXAM_GUIDE = {
  sections: [
    {
      title: 'Before the Exam',
      icon: 'CalendarCheck',
      color: 'border-indigo-500 bg-indigo-50/50',
      tips: [
        {
          heading: 'Get 9-10 Hours of Deep Sleep',
          body: 'Your brain consolidates memory and problem-solving pathways while resting. A well-rested mind calculates 30% faster.'
        },
        {
          heading: 'Eat a Brain-Boosting Breakfast',
          body: 'Complex carbohydrates like porridge, wholemeal toast, bananas, and plenty of water prevent mid-morning concentration dips.'
        },
        {
          heading: 'Pack Your Essential Equipment',
          body: 'Have clear pencils (HB), ruler (30cm), rubber, and pencil sharpener ready. Remember: calculators are NOT allowed in KS2 SATs!'
        },
        {
          heading: 'Establish a Calm Morning Rhythm',
          body: 'Avoid last-minute frantic cramming right before entering the room. Take slow deep breaths and visualize success.'
        }
      ]
    },
    {
      title: 'During the Exam',
      icon: 'FileText',
      color: 'border-emerald-500 bg-emerald-50/50',
      tips: [
        {
          heading: 'Read Every Question Twice',
          body: 'Underline key words: units (e.g. cm or m, grams or kg), instructions ("round to nearest hundred"), and what is actually asked.'
        },
        {
          heading: 'Always Show Your Working',
          body: 'In 2-mark and 3-mark questions, you can still get 1 or 2 method marks even if your final arithmetic has a small slip!'
        },
        {
          heading: 'Keep an Eye on the Clock (Without Panicking)',
          body: 'Paper 1 (Arithmetic) is 36 questions in 30 minutes (~50s per question). Papers 2 & 3 (Reasoning) are 40 minutes each (~2 mins per question).'
        },
        {
          heading: 'Check Your Answers If You Finish Early',
          body: 'Never close your paper early! Work backward using inverse operations to verify each calculation.'
        }
      ]
    },
    {
      title: 'When Stuck: The 5-Step Heuristic',
      icon: 'HelpCircle',
      color: 'border-amber-500 bg-amber-50/50',
      tips: [
        {
          heading: '1. Read the Question Again Out Loud in Your Head',
          body: 'Slow down. Are you answering what is being asked, or what you assumed was being asked?'
        },
        {
          heading: '2. Identify What You Know & What You Need',
          body: 'Jot down the givens in the corner of your page with their units.'
        },
        {
          heading: '3. Draw a Quick Sketch or Bar Model',
          body: 'Drawing a simple bar model or diagram instantly makes abstract ratios, fractions, and geometry questions obvious.'
        },
        {
          heading: '4. Try a Simpler Case',
          body: 'If the numbers are huge (e.g. 4,592 ÷ 28), try the same logic with small numbers (e.g. 12 ÷ 3) to see which operation to use.'
        },
        {
          heading: '5. Sanity Check Your Answer',
          body: 'Ask yourself: "Does this number make sense in real life?" (e.g. A child cannot weigh 450 kilograms!).'
        }
      ]
    }
  ]
};

// Positive Rockstar Mindset & Growth Affirmations
export const ROCKSTAR_MINDSET_QUOTES = [
  {
    quote: "You don't need to know everything today. You just need to keep practising.",
    category: "Perseverance"
  },
  {
    quote: "Getting a question wrong doesn't mean you're bad at maths. It means you just found something exciting to master.",
    category: "Growth Mindset"
  },
  {
    quote: "One difficult question does not define your ability. Take a breath and tackle the next one.",
    category: "Resilience"
  },
  {
    quote: "Your brain creates new neural connections every time you struggle and work through a challenge.",
    category: "Neuroscience"
  },
  {
    quote: "Take a deep breath. Read the question again. You have already prepared so much.",
    category: "Calmness"
  },
  {
    quote: "Small daily progress adds up to unstoppable mastery over time. Keep jamming!",
    category: "Consistency"
  },
  {
    quote: "Don't chase perfection. Chase understanding. The marks will naturally follow.",
    category: "Focus"
  },
  {
    quote: "You're not competing with anyone else in the hall. You are building your own superpower.",
    category: "Confidence"
  }
];

export const DAILY_MOTIVATIONS = [
  "🔥 You got that question wrong yesterday. Today you understand it. THAT is real rockstar improvement.",
  "🎸 One question at a time. Steady pace, deep breath, clear working.",
  "✨ Your effort today is planting seeds for total confidence on exam day.",
  "⚡ Don't rush arithmetic. Accuracy beats rushing every single time.",
  "🧠 Show your working steps proudly. Every step is worth gold marks."
];

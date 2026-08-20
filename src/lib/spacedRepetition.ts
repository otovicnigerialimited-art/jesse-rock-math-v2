import { SpacedItem } from '../types/extendedTypes';

export const INITIAL_SPACED_SKILLS = [
  { id: 'addition', name: 'Addition & Carrying', category: 'Arithmetic' },
  { id: 'subtraction', name: 'Subtraction & Borrowing', category: 'Arithmetic' },
  { id: 'multiplication', name: 'Times Tables Speed', category: 'Arithmetic' },
  { id: 'division', name: 'Long & Short Division', category: 'Arithmetic' },
  { id: 'fractions', name: 'Fractions Operations', category: 'Fractions' },
  { id: 'decimals', name: 'Decimals & Place Value', category: 'Decimals' },
  { id: 'algebra', name: 'Algebra & Equations', category: 'Algebra' },
  { id: 'geometry', name: 'Angles & Shapes', category: 'Geometry' }
];

const BOX_INTERVAL_DAYS: Record<number, number> = {
  1: 1,   // Review daily
  2: 3,   // Review every 3 days
  3: 7,   // Review every week
  4: 14,  // Review every 2 weeks
  5: 30   // Mastered (Review monthly)
};

export function updateSpacedItem(
  current: SpacedItem | undefined,
  skillId: string,
  skillName: string,
  category: string,
  isCorrect: boolean
): SpacedItem {
  const now = Date.now();
  const existingBox = current ? current.box : 1;
  const existingConsecutive = current ? current.consecutiveCorrect : 0;

  let newBox = existingBox;
  let newConsecutive = existingConsecutive;

  if (isCorrect) {
    newConsecutive += 1;
    if (newConsecutive >= 2 && newBox < 5) {
      newBox += 1;
      newConsecutive = 0;
    }
  } else {
    newConsecutive = 0;
    newBox = Math.max(1, newBox - 1); // Drop down a box on error
  }

  const intervalDays = BOX_INTERVAL_DAYS[newBox] || 1;
  const nextDue = now + (intervalDays * 24 * 60 * 60 * 1000);

  return {
    skillId,
    skillName,
    category,
    box: newBox,
    lastReviewedAt: now,
    nextReviewDueAt: nextDue,
    consecutiveCorrect: newConsecutive
  };
}

export function getDueSpacedItems(spacedMap?: Record<string, SpacedItem>): SpacedItem[] {
  if (!spacedMap) return [];
  const now = Date.now();
  return Object.values(spacedMap).filter(item => item.nextReviewDueAt <= now);
}

export function calculateMasteryScore(spacedMap?: Record<string, SpacedItem>): number {
  if (!spacedMap || Object.keys(spacedMap).length === 0) return 50;
  const items = Object.values(spacedMap);
  const totalBoxes = items.reduce((sum, item) => sum + item.box, 0);
  const maxPossible = items.length * 5;
  return Math.round((totalBoxes / maxPossible) * 100);
}

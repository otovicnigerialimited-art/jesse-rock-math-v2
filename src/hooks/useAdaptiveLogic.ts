import { useState, useRef, useCallback } from 'react';

export interface AdaptiveLogicResult {
  level: number;
  winStreak: number;
  wrongStreak: number;
  message: string | null;
}

export function useAdaptiveLogic(initialLevel: number = 1) {
  // Clamp initial level to [1, 3] based on user constraints
  const [currentLevel, setCurrentLevel] = useState(() => Math.min(3, Math.max(1, initialLevel)));
  const [winStreak, setWinStreak] = useState(0);
  const [wrongStreak, setWrongStreak] = useState(0);
  
  // Track the last up to 5 response times in seconds
  const responseTimesRef = useRef<number[]>([]);
  
  // Track when the current question was shown
  const questionStartTimeRef = useRef<number>(Date.now());

  // Call this right when a new question is displayed to the user
  const startQuestionTimer = useCallback(() => {
    questionStartTimeRef.current = Date.now();
  }, []);

  const reset = useCallback(() => {
    setCurrentLevel(Math.min(3, Math.max(1, initialLevel)));
    setWinStreak(0);
    setWrongStreak(0);
    responseTimesRef.current = [];
    questionStartTimeRef.current = Date.now();
  }, [initialLevel]);

  // Call this when the user submits their answer
  const evaluateAnswer = useCallback((isCorrect: boolean): AdaptiveLogicResult => {
    let newLevel = currentLevel;
    let newWinStreak = winStreak;
    let message: string | null = isCorrect ? "Correct!" : "Incorrect!";

    if (isCorrect) {
      newWinStreak += 1;
      
      // If streak is a multiple of 5 and difficulty < 3, increase difficulty by 1
      if (newWinStreak % 5 === 0 && newLevel < 3) {
        newLevel += 1;
        message = "LEVEL UP! 🔥 Great job!";
      }
    } else {
      newWinStreak = 0;
      // If wrong, decrease difficulty if it is greater than 1
      if (newLevel > 1) {
        newLevel -= 1;
        message = "Difficulty Adjusted";
      }
    }

    // Update state
    setCurrentLevel(newLevel);
    setWinStreak(newWinStreak);
    setWrongStreak(isCorrect ? 0 : 1);
    
    return {
      level: newLevel,
      winStreak: newWinStreak,
      wrongStreak: isCorrect ? 0 : 1,
      message
    };
  }, [currentLevel, winStreak]);

  return {
    currentLevel,
    winStreak,
    wrongStreak,
    evaluateAnswer,
    startQuestionTimer,
    setCurrentLevel,
    reset
  };
}


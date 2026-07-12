import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Timer, Zap, ArrowRight, RefreshCcw, LogOut, ArrowLeft, Loader2, Search, Volume2, VolumeX } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';
import { generateArenaQuestions } from '../lib/mathUtils';
import { playCorrectSound, playWrongSound, setGlobalMuted } from '../lib/audioUtils';
import { cn } from '../lib/utils';
import confetti from 'canvas-confetti';

interface ArenaMatchesProps {
  currentUser: {
    uid: string;
    username: string;
    classCode?: string;
  };
  onExit: () => void;
  soundEffectsEnabled: boolean;
  onMatchFinished?: (score: number, total: number, xpGained: number) => void;
}

export default function ArenaMatches({ currentUser, onExit, soundEffectsEnabled, onMatchFinished }: ArenaMatchesProps) {
  // Game states: 'idle' | 'searching' | 'playing' | 'ended'
  const [gameState, setGameState] = useState<'idle' | 'searching' | 'playing' | 'ended'>('idle');
  const [isSolo, setIsSolo] = useState(false);
  const [soloStreak, setSoloStreak] = useState(0);
  const [gameId, setGameId] = useState<string>('');
  const [isPlayer1, setIsPlayer1] = useState(true);
  
  // Real-time Matchmaking/Game variables
  const [p1Name, setP1Name] = useState('');
  const [p2Name, setP2Name] = useState('');
  const [p1Progress, setP1Progress] = useState(0);
  const [p2Progress, setP2Progress] = useState(0);
  const [p1Correct, setP1Correct] = useState(0);
  const [p2Correct, setP2Correct] = useState(0);
  const [p1Finished, setP1Finished] = useState(false);
  const [p2Finished, setP2Finished] = useState(false);
  const [winnerId, setWinnerId] = useState<string>('');
  const [winnerName, setWinnerName] = useState<string>('');
  const [questions, setQuestions] = useState<{ id: string, question: string, answer: string }[]>([]);

  // Current solving variables
  const [questionIndex, setQuestionIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [userCorrectCount, setUserCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes (300 seconds)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [activeFeedbackTag, setActiveFeedbackTag] = useState<string | null>(null);
  const [streakAwarded, setStreakAwarded] = useState(false);
  const [onlineUsersCount, setOnlineUsersCount] = useState(0);
  const [isCanceled, setIsCanceled] = useState(false);
  const [onlinePlayers, setOnlinePlayers] = useState<any[]>([]);
  const [isMuted, setIsMuted] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const queueDocRef = doc(db, "matchmaking_queue", currentUser.uid);

  // Resize Observer for responsive scaling
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        if (containerRef.current) {
          containerRef.current.style.setProperty('--arena-width', `${width}px`);
          containerRef.current.style.setProperty('--arena-height', `${height}px`);
        }
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Real-time online real players registry scanner
  useEffect(() => {
    const usersCollection = collection(db, "users");

    const unsubscribe = onSnapshot(usersCollection, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((snap) => {
        const data = snap.data();
        list.push({
          id: snap.id,
          username: data.username || "Challenger Genius",
          xp: data.xp || 100,
          streak: data.streak || 0
        });
      });
      setOnlinePlayers(list);
      setOnlineUsersCount(list.length);
    }, (err) => {
      console.warn("Real-time active scan warning:", err);
    });

    return () => unsubscribe();
  }, []);

  // Focus input automatically
  useEffect(() => {
    if (gameState === 'playing') {
      inputRef.current?.focus();
    }
  }, [gameState, questionIndex]);

  // Clean queue on component disposal
  useEffect(() => {
    return () => {
      // Clean queue ref if player quits
      deleteDoc(queueDocRef).catch(() => {});
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Timer logic
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeExpiry();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [gameState, timeLeft]);

  const handleStartSoloWarmup = () => {
    if (audioRef.current && !isMuted) {
      audioRef.current.play().catch(() => {});
    }

    setIsSolo(true);
    setGameState('playing');
    setQuestionIndex(0);
    setUserCorrectCount(0);
    setSoloStreak(0);
    setTimeLeft(300); // 5 minutes warm-up just like multiplayer
    setQuestions(generateArenaQuestions());
    setP1Name(currentUser.username);
    setP2Name("Confidence Helper Engine");
    setP1Progress(0);
    setP2Progress(0);
    setP1Correct(0);
    setP2Correct(0);
    setP1Finished(false);
    setP2Finished(false);
  };

  const handleSoloFinished = async (finalCorrectCount: number) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setGameState('ended');
    if (timerRef.current) clearInterval(timerRef.current);

    const xpGained = finalCorrectCount * 5 + 30;
    const coinsGained = Math.floor(finalCorrectCount / 2);

    try {
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap && userSnap.exists()) {
        const stats = userSnap.data();
        const curXp = stats.xp || 0;
        const curCoins = stats.coins || 0;
        await updateDoc(userRef, {
          xp: curXp + xpGained,
          coins: curCoins + coinsGained
        });
      }
    } catch (err) {
      console.warn("Could not save solo stats on Firebase:", err);
    }

    confetti({
      particleCount: 100,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#00d2ff', '#f43f5e', '#34d399']
    });

    onMatchFinished?.(finalCorrectCount, 20, xpGained);
  };

  // Start searching logic
  const handleStartMatchmaking = async () => {
    if (audioRef.current && !isMuted) {
      audioRef.current.play().catch(() => {});
    }

    setIsCanceled(false);
    setGameState('searching');
    setQuestionIndex(0);
    setUserCorrectCount(0);
    setTimeLeft(300);
    setStreakAwarded(false);

    try {
      // 1. Fetch other online players in queue who are 'waiting'
      // If we have a class code, we only want to match with classmates for a "Private" experience
      const constraints = [where("status", "==", "waiting")];
      if (currentUser.classCode) {
        constraints.push(where("classCode", "==", currentUser.classCode));
      } else {
        // Global queue: only match with players who also DON'T have a classCode (to keep them separate)
        // Actually, let's allow global players to match with anyone who isn't in a private class
        constraints.push(where("classCode", "==", ""));
      }

      const queueQuery = query(
        collection(db, "matchmaking_queue"), 
        ...constraints
      );
      let querySnapshot;
      try {
        querySnapshot = await getDocs(queueQuery);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, "matchmaking_queue");
        return;
      }
      
      let opponentDoc = null;
      // Seek a fresh participant (joined in past 5 minutes)
      const now = Date.now();
      const docsToCheck = querySnapshot.docs.filter(d => d.id !== currentUser.uid);
      for (const d of docsToCheck) {
        const data = d.data();
        if (data.timestamp > now - 300000) {
          opponentDoc = d;
          break;
        }
      }

      if (opponentDoc) {
        // MATCH FOUND! We act as Player 2, they are Player 1
        const oppData = opponentDoc.data();
        const activeGameId = `arena_room_${opponentDoc.id}_${currentUser.uid}_${Date.now()}`;
        
        setIsPlayer1(false);
        setGameId(activeGameId);
        setP1Name(oppData.username);
        setP2Name(currentUser.username);

        const arenaQuestions = generateArenaQuestions();
        setQuestions(arenaQuestions);

        // Create the official active arena match document
        const gameRoomRef = doc(db, "arena_games", activeGameId);
        try {
          await setDoc(gameRoomRef, {
            gameId: activeGameId,
            classCode: currentUser.classCode || "",
            player1Id: oppData.uid,
            player1Name: oppData.username,
            player1Progress: 0,
            player1Correct: 0,
            player1Finished: false,
            player2Id: currentUser.uid,
            player2Name: currentUser.username,
            player2Progress: 0,
            player2Correct: 0,
            player2Finished: false,
            questions: arenaQuestions,
            status: "playing",
            winnerId: "",
            winnerName: "",
            createdAt: Date.now()
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `arena_games/${activeGameId}`);
        }

        // Update opponent's queue status immediately to notify them!
        try {
          await setDoc(doc(db, "matchmaking_queue", oppData.uid), {
            uid: oppData.uid,
            username: oppData.username,
            status: "matched",
            matchedRoomId: activeGameId,
            timestamp: Date.now()
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `matchmaking_queue/${oppData.uid}`);
        }

        // Clean up our own queue record if any
        try {
          await deleteDoc(queueDocRef);
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `matchmaking_queue/${currentUser.uid}`);
        }
        
        // Start listening to the game room
        listenToGameRoom(activeGameId);
      } else {
        // NO CHANNELS IN QUEUE. We must enter "waiting" queue
        setIsPlayer1(true);
        setP1Name(currentUser.username);
        
        try {
          await setDoc(queueDocRef, {
            uid: currentUser.uid,
            username: currentUser.username,
            classCode: currentUser.classCode || "",
            status: "waiting",
            matchedRoomId: "",
            timestamp: Date.now()
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `matchmaking_queue/${currentUser.uid}`);
        }

        // Listen for another match to claim our room!
        const unsubQueue = onSnapshot(queueDocRef, async (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            if (data.status === 'matched') {
              unsubQueue(); // stop listening queue
              setGameId(data.matchedRoomId);
              listenToGameRoom(data.matchedRoomId);
            }
          }
        }, (err) => {
          handleFirestoreError(err, OperationType.GET, `matchmaking_queue/${currentUser.uid}`);
        });
      }
    } catch (e) {
      console.error(e);
      setGameState('idle');
    }
  };

  // Listen to Game Room updates
  const listenToGameRoom = (activeGameId: string) => {
    setGameState('playing');
    const gameDocRef = doc(db, "arena_games", activeGameId);

    const unsubRoom = onSnapshot(gameDocRef, async (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        
        setP1Name(data.player1Name);
        setP2Name(data.player2Name);
        setP1Progress(data.player1Progress);
        setP2Progress(data.player2Progress);
        setP1Correct(data.player1Correct);
        setP2Correct(data.player2Correct);
        setP1Finished(data.player1Finished);
        setP2Finished(data.player2Finished);
        setQuestions(data.questions);

        // Check if both players are finished
        if ((data.player1Finished && data.player2Finished) || data.status === 'ended') {
          unsubRoom(); // close subscription
          handleMatchFinished(data);
        }
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, `arena_games/${activeGameId}`);
    });
  };

  // Handle game termination manually (Time expired)
  const handleTimeExpiry = async () => {
    if (!gameId) return;
    try {
      const field = isPlayer1 ? "player1Finished" : "player2Finished";
      await updateDoc(doc(db, "arena_games", gameId), {
        [field]: true
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `arena_games/${gameId}`);
    }
  };

  // Submit Answer
  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim() === '' || questionIndex >= 20) return;

    if (userInput.length > 30) {
      alert("Input too long! Keep your math response short.");
      return;
    }

    const badWords = ["ignore", "override", "system prompt", "instruction", "developer role"];
    const containsInjection = badWords.some(word => userInput.toLowerCase().includes(word));
    if (containsInjection) {
      console.log("Potential prompt injection blocked!");
      return;
    }

    const currentQ = questions[questionIndex];
    const isCorrect = userInput.trim() === String(currentQ.answer);
    
    let nextCorrectCount = userCorrectCount;
    if (isCorrect) {
      nextCorrectCount += 1;
      setUserCorrectCount(nextCorrectCount);
      if (isSolo) {
        setSoloStreak(prev => prev + 1);
      }
      setFeedback('correct');

      const funnyTaglines = [
        "🧠 Brainpower Overdrive!",
        "🎸 Unstoppable Math Rock Star!",
        "🚀 To Infinity and Beyond!",
        "🍌 That answer was bananas!",
        "🍕 You earn 100 virtual pizza slices!"
      ];
      const randomTag = funnyTaglines[Math.floor(Math.random() * funnyTaglines.length)];
      setActiveFeedbackTag(randomTag);

      if (soundEffectsEnabled) {
        playCorrectSound();
      }
    } else {
      setFeedback('wrong');
      if (isSolo) {
        setSoloStreak(0);
        
        // Confidence Reset Rule: dial down difficulty of the next question
        const nextIdx = questionIndex + 1;
        if (nextIdx < 20) {
          const ops = ['+', '-', '×'];
          const op = ops[Math.floor(Math.random() * ops.length)];
          let num1 = 0, num2 = 0;
          if (op === '×') {
            num1 = Math.floor(Math.random() * 5) + 1; // 1 to 5
            num2 = Math.floor(Math.random() * 5) + 1;
          } else {
            num1 = Math.floor(Math.random() * 9) + 1;  // 1 to 9
            num2 = Math.floor(Math.random() * 9) + 1;
          }
          if (op === '-' && num1 < num2) {
            [num1, num2] = [num2, num1];
          }
          let ans = '';
          if (op === '+') ans = String(num1 + num2);
          else if (op === '-') ans = String(num1 - num2);
          else if (op === '×') ans = String(num1 * num2);

          const easyQ = {
            id: `solo-easy-${nextIdx}-${Date.now()}`,
            question: `${num1} ${op} ${num2}`,
            answer: ans
          };

          const updatedQuestions = [...questions];
          updatedQuestions[nextIdx] = easyQ;
          setQuestions(updatedQuestions);
        }
      }

      if (soundEffectsEnabled) {
        playWrongSound();
      }
    }

    const nextIndex = questionIndex + 1;
    const finished = nextIndex >= 20;

    if (isSolo) {
      setP1Progress(nextIndex);
      setP1Correct(nextCorrectCount);
      // Advance simulated helper pacing
      const helperAdvance = Math.random() > 0.4 ? 1 : 0;
      setP2Progress(Math.min(20, p2Progress + 1));
      setP2Correct(prev => Math.min(20, prev + helperAdvance));
    } else {
      // Save our stats instantly in firestore only if game is finished!
      if (finished) {
        try {
          const fieldsToUpdate: any = {};
          if (isPlayer1) {
            fieldsToUpdate.player1Progress = nextIndex;
            fieldsToUpdate.player1Correct = nextCorrectCount;
            fieldsToUpdate.player1Finished = finished;
          } else {
            fieldsToUpdate.player2Progress = nextIndex;
            fieldsToUpdate.player2Correct = nextCorrectCount;
            fieldsToUpdate.player2Finished = finished;
          }
          await updateDoc(doc(db, "arena_games", gameId), fieldsToUpdate);
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `arena_games/${gameId}`);
        }
      }
    }

    setTimeout(() => {
      setFeedback(null);
      setUserInput('');
      setActiveFeedbackTag(null);
      if (finished) {
        if (isSolo) {
          handleSoloFinished(nextCorrectCount);
        } else {
          // We finished multiplayer! Lock UI, wait for the other player
        }
      } else {
        setQuestionIndex(nextIndex);
      }
    }, 1300);
  };

  // Determine game results
  const handleMatchFinished = async (finalData: any) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setGameState('ended');
    if (timerRef.current) clearInterval(timerRef.current);

    let winnerUID = '';
    let winner = 'Draw';

    const p1Score = finalData.player1Correct;
    const p2Score = finalData.player2Correct;

    if (p1Score > p2Score) {
      winnerUID = finalData.player1Id;
      winner = finalData.player1Name;
    } else if (p2Score > p1Score) {
      winnerUID = finalData.player2Id;
      winner = finalData.player2Name;
    } else {
      // Tie score - whoever reached that score first or with higher index
      winner = "Tie";
    }

    setWinnerId(winnerUID);
    setWinnerName(winner);

    // Clean up queue
    try {
      await deleteDoc(queueDocRef);
    } catch (err) {
      // Ignore if already deleted or fails silently on cleanup
    }

    // Award +40 Streak points to the real winner on Firebase
    if (winnerUID === currentUser.uid && !streakAwarded) {
      setStreakAwarded(true);
      try {
        // Get existing user stats on firestore
        const userRef = doc(db, "users", currentUser.uid);
        let userSnap;
        try {
          userSnap = await getDoc(userRef);
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `users/${currentUser.uid}`);
        }
        if (userSnap && userSnap.exists()) {
          const stats = userSnap.data();
          const curStreak = stats.streak || 0;
          const nextStreakVal = curStreak + 20;
          const nextBestVal = Math.max(stats.bestStreak || 0, nextStreakVal);
          try {
            await updateDoc(userRef, {
              streak: nextStreakVal,
              bestStreak: nextBestVal,
              streakScore: nextBestVal,
              xp: (stats.xp || 0) + 200, // custom XP reward
              coins: nextStreakVal // Math balance (coins) is now the same as streak
            });
          } catch (err) {
            handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
          }
        }
        
        // Trigger confetti!
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#FFD700', '#f43f5e', '#a855f7']
        });
      } catch (err) {
        console.error(err);
      }
    }

    const localScore = isPlayer1 ? finalData.player1Correct : finalData.player2Correct;
    const isLocalWinner = winnerUID === currentUser.uid;
    const isTie = winner === 'Tie' || winner === 'Draw';
    let localXpGained = localScore * 10;
    if (isLocalWinner) {
      localXpGained += 150;
    } else if (isTie) {
      localXpGained += 50;
    }
    
    onMatchFinished?.(localScore, 20, localXpGained);
  };

  // Cancel matchmaking search
  const handleCancelSearch = async () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setIsCanceled(true);
    setGameState('idle');
    try {
      await deleteDoc(queueDocRef);
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `matchmaking_queue/${currentUser.uid}`);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto" ref={containerRef}>
      {/* 1. Header Row */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-display font-black text-deep-navy flex items-center gap-2">
            <Trophy className="text-amber-400" /> MULTIPLAYER ARENA 🏟️
          </h2>
          <div className="flex flex-col gap-2">
            <p className="text-slate-700 text-xs">Real-time competitive math battle ground by Jesse Rock Math!</p>
            <div className="bg-white/5 border border-slate-200 p-4 rounded-xl mt-2 text-left max-w-xl">
              <h3 className="font-bold text-deep-navy mb-2">Play Arena Rules</h3>
              <ul className="text-sm text-deep-navy/70 space-y-4 font-bold list-decimal pl-4">
                <li>
                  <strong>Speed Scoring:</strong> In the Arena, speed is just as critical as accuracy. While getting the correct answer is required, the time taken to submit that answer directly influences your performance rating and score for that specific problem. Aim to solve and submit as rapidly as possible to maximize your score.
                </li>
                <li>
                  <strong>Streak Chains:</strong> The secret to massive experience point (XP) growth lies in building 'Streak Chains'. Every consecutive correct answer you submit adds to your streak and increases your score multiplier. However, be careful—a single incorrect answer will immediately break your streak, resetting your multiplier back to the base value and forcing you to start building your chain again.
                </li>
                <li>
                  <strong>Advanced Modes:</strong> To progress through the ranks and accumulate XP at the highest possible rate, test your skills in the advanced difficulty modes (Hard and Extreme). These modes significantly increase the complexity of the math problems but reward you with substantial XP multipliers. While these modes are inherently more challenging and carry a higher risk of breaking your streak, they are the most effective way to demonstrate your mastery, climb the levels rapidly, and unlock high-tier badges.
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const newMutedState = !isMuted;
              setIsMuted(newMutedState);
              setGlobalMuted(newMutedState);
              if (audioRef.current) {
                audioRef.current.muted = newMutedState;
              }
            }}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-700 hover:text-deep-navy transition-all cursor-pointer"
            title={isMuted ? "Unmute Music" : "Mute Music"}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          {gameState === 'idle' && (
            <button 
              onClick={onExit}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-700 hover:text-deep-navy transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft size={14} /> Exit Arena
            </button>
          )}
        </div>
      </div>

      {/* State views */}
      <AnimatePresence mode="wait">
        
        {/* VIEW A: IDLE ENTRY PORTAL */}
        {gameState === 'idle' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Play Arena Custom Welcome Box */}
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-6 sm:p-8 rounded-[2rem] border-deep-navy border-4 bg-brand-primary/10 space-y-4 text-left"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-brand-primary/20 flex items-center justify-center border-2 border-deep-navy shrink-0 shadow-sm animate-pulse">
                    <Zap className="text-brand-primary animate-bounce" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-display font-black text-deep-navy">Welcome to the Play Arena! 🏟️</h3>
                    <p className="text-xs font-black text-slate-700 italic">"Fire up your fingers and sharpen your mental math reflexes!"</p>
                  </div>
                </div>
                <button
                  onClick={handleStartSoloWarmup}
                  className="flex items-center gap-2 px-5 py-3 bg-brand-secondary hover:bg-brand-secondary/90 text-deep-navy font-black text-xs uppercase tracking-wider rounded-xl border-2 border-deep-navy shadow-md hover:scale-[1.03] transition-all cursor-pointer shrink-0"
                >
                  ⚡ Start Instant Warm-up Session
                </button>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">
                The <strong>Play Arena</strong> is your lightning-fast, high-octane math warm-up ground! Built for maximum speed, this arena throws a rapid-fire mix of random equations at you to test your accuracy and calculation pacing. Whether you are jumping into a live, real-time classroom duel with your friends or conditioning your brain in solo training, the arena forces you to think fast on your feet.
              </p>

              <div className="p-4 bg-white/60 border-2 border-deep-navy rounded-2xl space-y-1">
                <h4 className="text-xs font-black text-deep-navy flex items-center gap-1.5">
                  🛡️ Smart Confidence Reset Rule Active!
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Don't worry about making mistakes—our smart <strong>Confidence Reset Rule</strong> is fully active here! If you break your streak, the engine instantly dials down the question difficulty to help you comfortably rebuild your momentum. Choose your entry path below, jump onto the stage, and see how fast you can solve!
                </p>
              </div>
            </motion.div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Matchmaking Core Action */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="lg:col-span-7 glass p-8 sm:p-10 rounded-[2.5rem] bg-gradient-to-br from-violet-600/10 to-indigo-600/10 border border-violet-500/15 text-center space-y-8"
            >
              <div className="w-20 h-20 bg-gradient-to-tr from-brand-primary to-brand-secondary rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-brand-primary/25 animate-bounce">
                <Trophy size={40} className="text-deep-navy" />
              </div>

              <div className="space-y-3 max-w-lg mx-auto">
                <h3 className="text-2xl font-black text-slate-100">Claim the Rockstar Spotlight!</h3>
                <p className="text-slate-700 text-xs leading-relaxed">
                  Step up to test your arithmetic speed against other real human math scholars. Both competitors receive the exact same **20 progressive problems (5 easy, 5 medium, 10 hard)** under a **5-minute timer**.
                </p>
                <div className="py-2.5 px-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-[10px] font-black uppercase tracking-wider inline-block">
                  ★ Winner Reward: +40 Brain Streak & 150 gold coins!
                </div>
              </div>

              <div className="max-w-xs mx-auto">
                <button
                  onClick={handleStartMatchmaking}
                  className="w-full py-4 bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-deep-navy font-black rounded-2xl text-xs tracking-widest uppercase cursor-pointer shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  🎮 Find Real Challenger
                </button>
              </div>
            </motion.div>

            {/* Right Column: Dynamic Real logged-in Player scanning list */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="lg:col-span-5 glass p-6 rounded-[2.5rem] bg-white/40 border border-slate-200 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-deep-navy">Online Scholars</h4>
                  <p className="text-[10px] text-slate-500 font-medium">Live scanning of logged-in players.</p>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/25 rounded-full">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                  <span className="text-[9px] font-mono font-black text-emerald-450 uppercase">{onlinePlayers.length} Active</span>
                </div>
              </div>

              {/* Player list */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {onlinePlayers.map((player) => {
                  const isMe = player.id === currentUser.uid;
                  return (
                    <div 
                      key={`${player.id}-${idx}`}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                        isMe 
                          ? "bg-violet-600/10 border-violet-500/25" 
                          : "bg-white backdrop-blur-sm/60 border-slate-200 hover:border-slate-200"
                      }`}
                    >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-xs font-bold border border-slate-200">
                              🎓
                            </div>
                            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-black text-deep-navy block max-w-[120px] truncate">
                                {player.username}
                              </span>
                              {isMe && (
                                <span className="text-[8px] bg-brand-primary/20 text-brand-accent px-1.5 py-0.2 rounded font-black uppercase">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[9px] text-slate-500 font-mono">
                              Level {Math.floor(player.xp / 1000) + 1} • {player.xp} XP
                            </span>
                          </div>
                        </div>

                        <div className="text-right font-mono">
                          <span className="text-[9px] text-slate-500 block">Streak</span>
                          <span className="text-xs font-black text-amber-450">🔥 {player.streak}</span>
                        </div>
                      </div>
                    );
                })}
              </div>

              <p className="text-[9px] text-slate-500 leading-relaxed text-center pt-2 border-t border-slate-200 font-mono">
                🛡️ Verified active sessions only. Simulated bots or synthetic installations have been disabled for security.
              </p>
            </motion.div>

          </div></div>
        )}

        {/* VIEW B: QUEUE SEARCHING STATE */}
        {gameState === 'searching' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass p-10 rounded-[2.5rem] border-slate-200 text-center space-y-8 py-14"
          >
            <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 bg-brand-primary/20 rounded-full animate-ping" />
              <div className="absolute inset-4 bg-violet-600/30 rounded-full animate-pulse" />
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border border-slate-200 shadow-lg relative z-10">
                <Loader2 className="animate-spin text-brand-primary" size={32} />
              </div>
            </div>

            <div className="space-y-3 max-w-md mx-auto">
              <span className="text-[10px] uppercase font-black bg-white/5 px-3 py-1 rounded-full text-brand-accent tracking-widest animate-pulse">
                PLUGGING INTO THE CLOUD CORES...
              </span>
              <h3 className="text-xl font-black text-deep-navy">Searching Arena for a live Challenger</h3>
              <p className="text-slate-700 text-xs leading-normal">
                Connecting to Jesse Rock Math servers. If no one else is currently in the matchmaking queue, we'll keep your lobby active until a challenger enters!
              </p>
            </div>

            <div className="p-4 bg-zinc-950/60 rounded-2xl max-w-sm mx-auto border border-slate-200 font-mono text-[10px] text-zinc-500 text-left space-y-1">
              <p>📍 Queue ID: {currentUser.uid.substring(0, 8)}...</p>
              <p>🟢 Status: {isPlayer1 ? "Holding Lobby (Player 1)" : "Scanning wait lists..."}</p>
              <p>🎛️ Match type: 20 Hard Arithmetic Battles</p>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={handleCancelSearch}
                className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-slate-700 hover:text-deep-navy rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancel Search
              </button>
            </div>
          </motion.div>
        )}

        {/* VIEW C: PLAYING COMPETITION */}
        {gameState === 'playing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Split Opponent Progress Hub */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Player 1 card */}
              <div className={cn(
                "p-4 rounded-2xl border transition-all flex items-center justify-between",
                isPlayer1 
                  ? "bg-brand-primary/10 border-brand-primary/20 text-deep-navy" 
                  : "bg-white/5 border-slate-200 text-deep-navy"
              )}>
                <div>
                  <span className="text-[9px] uppercase font-black text-slate-700 block tracking-wider">Player 1 {isPlayer1 && "(YOU)"}</span>
                  <span className="text-md font-black">{p1Name || "Loading..."}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-700 block font-bold">Solved: {p1Progress}/20</span>
                  <span className="text-sm font-black text-brand-primary" style={{ willChange: 'transform', transform: 'translate3d(0,0,0)' }}>{p1Correct} Pts Correct</span>
                </div>
              </div>

              {/* Player 2 card */}
              <div className={cn(
                "p-4 rounded-2xl border transition-all flex items-center justify-between",
                !isPlayer1 
                  ? "bg-violet-600/10 border-violet-500/20 text-deep-navy" 
                  : "bg-white/5 border-slate-200 text-deep-navy"
              )}>
                <div>
                  <span className="text-[9px] uppercase font-black text-slate-700 block tracking-wider">Player 2 {!isPlayer1 && "(YOU)"}</span>
                  <span className="text-md font-black">{p2Name || "Loading..."}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-700 block font-bold">Solved: {p2Progress}/20</span>
                  <span className="text-sm font-black text-violet-400" style={{ willChange: 'transform', transform: 'translate3d(0,0,0)' }}>{p2Correct} Pts Correct</span>
                </div>
              </div>
            </div>

            {/* Timer & Global match stats */}
            <div className="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-2xl">
              <div className="flex items-center gap-2">
                <Timer size={18} className="text-[#00d2ff]" />
                <span className={cn(
                  "font-mono text-xl font-black",
                  timeLeft < 30 ? "text-red-500 animate-pulse" : "text-deep-navy"
                )} style={{ willChange: 'transform', transform: 'translate3d(0,0,0)' }}>
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Limit: 5 min</span>
              </div>

              {/* Progress visual connector */}
              <div className="hidden sm:flex flex-1 mx-8 h-2 bg-white backdrop-blur-sm rounded-full overflow-hidden relative">
                <div 
                  className="absolute left-0 top-0 h-full bg-brand-primary transition-all duration-300" 
                  style={{ width: `${(p1Progress / 20) * 100}%` }}
                />
                <div 
                  className="absolute left-0 top-0 h-full bg-violet-500 transition-all duration-300 opacity-65" 
                  style={{ width: `${(p2Progress / 20) * 100}%` }}
                />
              </div>

              <div className="text-right">
                <span className="text-xs font-black text-yellow-400">HARD MODE ARENA</span>
              </div>
            </div>

            {/* Main Interactive battlefield */}
            {((isPlayer1 && p1Finished) || (!isPlayer1 && p2Finished)) ? (
              // Our player has finished and is waiting for opponent
              <div className="glass p-12 rounded-[3.5rem] border-slate-200 text-center space-y-6">
                <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 bg-amber-400/10 rounded-full animate-ping" />
                  <Loader2 className="animate-spin text-amber-400" size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-deep-navy">Wonderful Session Completed! ⚡</h3>
                  <p className="text-slate-700 text-xs max-w-sm mx-auto leading-relaxed">
                    You have finished your 20 problems. Hold standard position while your challenger completes theirs to trigger the winner validation!
                  </p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl max-w-xs mx-auto border border-slate-200">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Your Finished Record</p>
                  <p className="text-2xl font-black text-emerald-400 mt-1">{userCorrectCount} / 20 Correct</p>
                </div>
              </div>
            ) : (
              // Active Problem Solving Card
              <motion.div
                key={questions[questionIndex]?.id || 'loading'}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "glass p-10 md:p-14 rounded-[3.5rem] text-center space-y-8 duration-300 transition-colors border",
                  feedback === 'correct' ? "bg-green-500/10 border-green-500/30" : 
                  feedback === 'wrong' ? "bg-red-500/10 border-red-500/30" : "border-slate-200"
                )}
              >
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-black bg-white/10 px-3 py-1 rounded-full text-zinc-400 tracking-wider">
                    PROBLEM #{questionIndex + 1} OF 20
                  </span>
                  <p className="text-6xl md:text-8xl font-black text-deep-navy font-display tracking-tighter">
                    {questions[questionIndex]?.question || 'Generating...'}
                  </p>
                </div>

                <form onSubmit={handleAnswerSubmit} className="max-w-xs mx-auto space-y-4">
                  <input
                    ref={inputRef}
                    type="text"
                    value={userInput}
                    onChange={(e) => {
                      // restrict to clean numeric & fraction digits
                      const val = e.target.value.replace(/[^0-9-\/]/g, '');
                      setUserInput(val);
                    }}
                    placeholder="Type result..."
                    className="w-full text-center py-4 bg-white backdrop-blur-sm/80 border border-slate-200 rounded-2xl font-black font-mono text-3xl text-deep-navy outline-none focus:border-brand-primary placeholder:text-zinc-700 transition-all shadow-inner"
                    autoComplete="off"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-deep-navy font-black text-xs uppercase tracking-widest rounded-2xl transition-all cursor-pointer"
                  >
                    SUBMIT ANSWER
                  </button>
                </form>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* VIEW D: CONCLUDED MATCH RESULTS */}
        {gameState === 'ended' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-8 md:p-10 rounded-[3rem] border-slate-200 text-center space-y-8"
          >
            <div className="space-y-2">
              <div className="w-20 h-20 bg-amber-400/10 rounded-full flex items-center justify-center mx-auto text-amber-400 animate-pulse border border-amber-500/10">
                <Trophy size={40} />
              </div>
              <h3 className="text-3xl font-display font-black tracking-tight text-deep-navy mt-4 uppercase">
                {isSolo ? "SOLO WARM-UP CONCLUDED" : "ARENA BATTLE CONCLUDED"}
              </h3>
              <p className="text-slate-700 text-xs">
                {isSolo ? "You completed a high-octane mental math speed warm-up!" : "A grand competition took place between real mathematicians."}
              </p>
            </div>

            {isSolo ? (
              /* Solo Mode Results Panel */
              <div className="p-6 bg-white backdrop-blur-sm/80 rounded-[2.5rem] border border-slate-200 max-w-md mx-auto space-y-4 text-left">
                <div className="text-center">
                  <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider">WARM-UP SCORE</span>
                  <h4 className="text-3xl font-display font-black text-emerald-400 uppercase">🎯 {userCorrectCount} / 20 CORRECT!</h4>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed text-center">
                  Outstanding job! Firing up your mathematical reflexes with random speed questions prepares you perfectly for competitive classroom duels or tricky topics.
                </p>
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 rounded-2xl text-xs font-bold text-center">
                  ✨ Rewarded: +{userCorrectCount * 5 + 30} XP & +{Math.floor(userCorrectCount / 2)} Rock Coins!
                </div>
              </div>
            ) : (
              /* Multiplayer Winner Display Panel */
              <div className="p-6 bg-white backdrop-blur-sm/80 rounded-[2.5rem] border border-slate-200 max-w-md mx-auto space-y-4">
                <div>
                  <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider">ARENA CHAMPION</span>
                  {winnerName === 'Draw' || winnerName === 'Tie' ? (
                    <h4 className="text-3xl font-display font-black text-amber-400">IT'S A DRAW! ⚡</h4>
                  ) : (
                    <h4 className="text-3xl font-display font-black text-emerald-400 uppercase">👑 {winnerName} WINS!</h4>
                  )}
                </div>

                {winnerId === currentUser.uid ? (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-xs font-bold leading-normal">
                    🏆 Victory! You matched your opponent and claimed the crown. <br />
                    <span className="font-black text-sm uppercase tracking-wide mt-1.5 block">+40 Streak Points awarded to your high scores!</span>
                  </div>
                ) : winnerName === 'Draw' || winnerName === 'Tie' ? (
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-2xl text-xs font-bold">
                    🤝 Outstanding draw match! Both performers were exceptional math rockers. Keep rocking!
                  </div>
                ) : (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-xs font-bold">
                    ⚡ Good game! Your opponent took the crown. Keep practicing with custom visual helpers inside the Genius Hub!
                  </div>
                )}
              </div>
            )}

            {/* Scoreboard stats */}
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="p-4 bg-white/5 rounded-2xl text-center border border-slate-200">
                <p className="text-slate-700 text-[10px] uppercase font-black">{p1Name}</p>
                <p className="text-2xl font-black text-brand-primary mt-1">{p1Correct} / 20</p>
                <span className="text-[10px] text-slate-500 font-bold block mt-0.5">Correct</span>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl text-center border border-slate-200">
                <p className="text-slate-700 text-[10px] uppercase font-black">{p2Name}</p>
                <p className="text-2xl font-black text-violet-400 mt-1">{p2Correct} / 20</p>
                <span className="text-[10px] text-slate-500 font-bold block mt-0.5">Correct</span>
              </div>
            </div>

            <div className="flex gap-4 max-w-xs mx-auto">
              <button
                onClick={isSolo ? handleStartSoloWarmup : handleStartMatchmaking}
                className="flex-1 py-3.5 btn-3d-pink text-deep-navy font-black text-xs tracking-wider uppercase rounded-xl cursor-pointer text-center flex items-center justify-center"
              >
                {isSolo ? "Warm Up Again" : "Challenge Again"}
              </button>
              <button
                onClick={onExit}
                className="flex-1 py-3.5 btn-3d-blue text-deep-navy font-bold text-xs uppercase rounded-xl cursor-pointer text-center flex items-center justify-center"
              >
                Return Home
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Styled Popup Random Feedback Overlay */}
      <AnimatePresence>
        {activeFeedbackTag && (
          <motion.div
            initial={{ scale: 0.3, opacity: 0, rotate: -15 }}
            animate={{ scale: [1, 1.15, 1], opacity: 1, rotate: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: -50 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div 
              className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 border-4 border-white text-deep-navy font-extrabold px-8 py-5 rounded-3xl shadow-[0_12px_24px_rgba(0,0,0,0.6)] text-center max-w-sm mx-auto"
              style={{ boxShadow: "0 8px 0 #993300, 0 16px 30px rgba(0,0,0,0.6)" }}
            >
              <div className="text-3xl mb-1">⭐ MATH BLAST ⭐</div>
              <div className="text-xl font-black text-deep-navy drop-shadow-md">
                {activeFeedbackTag}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <audio ref={audioRef} src="/rock-bgm.mp3" loop />
    </div>
  );
}

/**
 * Date and time utilities for math application tracking.
 */

export function getWeeklyData() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const weekNumber = Math.ceil((dayOfYear + startOfYear.getDay() + 1) / 7);
  const weekKey = `${now.getFullYear()}-W${weekNumber}`;
  
  // Rotating themes for weekly accomplishments
  const weekThemes = [
    {
      id: "weekly_arithmetic_master",
      title: "Arithmetic Champion 👑",
      description: "Solve 15 correct problems this week to claim your crown!",
      requirement: 15,
      emoji: "🏆",
      color: "from-amber-400 via-orange-500 to-yellow-500",
      accent: "text-amber-400"
    },
    {
      id: "weekly_accuracy_legend",
      title: "Mind Marvel 🧠",
      description: "Solve 10 correct problems this week to unlock the brain key!",
      requirement: 10,
      emoji: "🧠",
      color: "from-cyan-400 via-blue-500 to-indigo-500",
      accent: "text-cyan-400"
    },
    {
      id: "weekly_speed_racer",
      title: "Thunder Genius ⚡️",
      description: "Solve 12 correct problems this week to unlock the speed spark!",
      requirement: 12,
      emoji: "⚡️",
      color: "from-yellow-400 via-amber-500 to-orange-400",
      accent: "text-yellow-400"
    },
    {
      id: "weekly_explorer_pioneer",
      title: "Galactic Explorer 🚀",
      description: "Solve 8 correct problems this week to launch your star badge!",
      requirement: 8,
      emoji: "🚀",
      color: "from-emerald-400 via-teal-500 to-cyan-500",
      accent: "text-emerald-400"
    }
  ];

  // Modulo calculation to cycle week themes
  const themeIndex = (weekNumber - 1) % weekThemes.length;
  const currentChallenge = weekThemes[themeIndex];
  
  // Calculate days remaining in the week (until next Monday)
  const currentDay = now.getDay() === 0 ? 7 : now.getDay();
  const daysLeft = 7 - currentDay;
  
  return {
    weekKey,
    currentChallenge,
    daysLeft: daysLeft || 7,
    daysRemaining: daysLeft || 7,
    weekNumber
  };
}

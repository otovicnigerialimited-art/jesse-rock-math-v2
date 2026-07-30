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
    { title: "Arithmetic Adventure", color: "from-blue-500 to-indigo-500", icon: "➕" },
    { title: "Fraction Frenzy", color: "from-purple-500 to-pink-500", icon: "➗" },
    { title: "Algebraic Quest", color: "from-orange-500 to-red-500", icon: "✖️" },
    { title: "Geometry Journey", color: "from-emerald-500 to-teal-500", icon: "📐" }
  ];
  
  return {
    weekKey,
    theme: weekThemes[weekNumber % weekThemes.length]
  };
}

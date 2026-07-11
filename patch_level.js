const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace handleQuizFinish
code = code.replace(/const newLevel = Math\.floor\(newXP \/ 1000\) \+ 1;\s*const currentStreak/g, 'const currentStreak');
code = code.replace(/level: newLevel,/g, 'level: 1,');

// Also update where updatedStats is saved to firestore (often it was Math.floor(stats.xp + ... / 1000) + 1)
code = code.replace(/level: updatedStats\?\.level \?\? \(Math\.floor\(\(stats\.xp \+ [^)]+\) \/ 1000\) \+ 1\),/g, 'level: updatedStats?.level ?? 1,');

// Update next object return to inject the correct level
code = code.replace(/(history: \[\.\.\.\(prev\.history \|\| \[\]\), newHistoryItem\]\s*\};\s*)(updatedStats = next;)/g, '$1next.level = calculateLevel(next);\n      $2');

// In handleClaimWeeklyBadge
code = code.replace(/level: newLevel,/g, 'level: 1,');
code = code.replace(/(weekKey,\s*claimedWeeklyBadge: true\s*\}\s*\};\s*)(updatedStats = next;)/g, '$1next.level = calculateLevel(next);\n      $2');

// In initial load
code = code.replace(/level: Math\.floor\(\(prog\.xp \|\| 100\) \/ 1000\) \+ 1,/g, 'level: calculateLevel({ ...INITIAL_STATS, ...prog } as any),');
code = code.replace(/level: Math\.floor\(\(profile\.xp \|\| 100\) \/ 1000\) \+ 1,/g, 'level: calculateLevel({ ...INITIAL_STATS, ...profile } as any),');

fs.writeFileSync('src/App.tsx', code);

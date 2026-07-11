import fs from 'fs';
let code = fs.readFileSync('src/components/FunArcade.tsx', 'utf-8');
code = code.replace("width: \\`\\${Math.min(100, (currentStreak / 200) * 100)}%`", "width: `${Math.min(100, (currentStreak / 200) * 100)}%`");
fs.writeFileSync('src/components/FunArcade.tsx', code);

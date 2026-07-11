const fs = require('fs');
let content = fs.readFileSync('src/components/ArenaMatches.tsx', 'utf8');

// Replace dark colors with lighter pastel versions or high contrast
content = content.replace(/bg-slate-950/g, 'bg-white/80 backdrop-blur-sm');
content = content.replace(/bg-slate-900\/50/g, 'bg-white/90');
content = content.replace(/bg-slate-900/g, 'bg-white');
content = content.replace(/text-slate-400/g, 'text-slate-600');
content = content.replace(/text-slate-300/g, 'text-slate-700');
content = content.replace(/text-white/g, 'text-slate-900');
content = content.replace(/border-white\/10/g, 'border-slate-200');
content = content.replace(/border-white\/5/g, 'border-slate-200');

fs.writeFileSync('src/components/ArenaMatches.tsx', content);

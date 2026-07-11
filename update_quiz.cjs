const fs = require('fs');

let content = fs.readFileSync('src/components/Quiz.tsx', 'utf8');

// Replace dark colors with lighter pastel versions or high contrast
content = content.replace(/bg-slate-950/g, 'bg-white/80 backdrop-blur-sm');
content = content.replace(/bg-slate-900\/50/g, 'bg-white/90');
content = content.replace(/bg-slate-900/g, 'bg-white');
content = content.replace(/text-slate-400/g, 'text-slate-600');
content = content.replace(/text-slate-300/g, 'text-slate-700');
content = content.replace(/text-white/g, 'text-slate-900');
content = content.replace(/border-white\/10/g, 'border-slate-200');
content = content.replace(/border-white\/5/g, 'border-slate-200');

// Fix numbers high contrast
content = content.replace(/text-5xl md:text-7xl font-display font-black text-white/g, 'text-5xl md:text-7xl font-display font-black text-slate-900');
content = content.replace(/text-4xl font-display font-black text-white/g, 'text-4xl font-display font-black text-slate-900');

fs.writeFileSync('src/components/Quiz.tsx', content);

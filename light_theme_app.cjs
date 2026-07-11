const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Sidebar
content = content.replace(/bg-slate-950\/95/g, 'bg-white/95');
content = content.replace(/text-slate-400 hover:text-white/g, 'text-slate-700 hover:text-slate-900');
content = content.replace(/text-slate-400 hover:bg-bubblegum-pink\/20 hover:text-white/g, 'text-slate-700 hover:bg-bubblegum-pink/20 hover:text-slate-900');
content = content.replace(/bg-white\/5 hover:bg-white\/10 text-white/g, 'bg-slate-200 hover:bg-slate-300 text-slate-800');

fs.writeFileSync('src/App.tsx', content);

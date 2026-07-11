const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

content = content.replace(/text-white/g, 'text-slate-900');
content = content.replace(/text-slate-400/g, 'text-slate-700');
content = content.replace(/text-slate-300/g, 'text-slate-800');
content = content.replace(/border-bubblegum-pink\/20/g, 'border-slate-300');
content = content.replace(/border-white\/10/g, 'border-slate-300');

fs.writeFileSync('src/components/Dashboard.tsx', content);

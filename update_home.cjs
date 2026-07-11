const fs = require('fs');
let content = fs.readFileSync('src/components/HomeLanding.tsx', 'utf8');

// Themed changes
content = content.replace(/text-white/g, 'text-slate-900');
content = content.replace(/text-slate-400/g, 'text-slate-700');
content = content.replace(/text-slate-300/g, 'text-slate-800');
content = content.replace(/btn-3d-pink/g, 'btn-matte-pink text-white'); // Matte buttons usually need white text
content = content.replace(/btn-3d-blue/g, 'btn-matte-blue text-white');
content = content.replace(/border-white\/10/g, 'border-slate-300');
content = content.replace(/border-white\/5/g, 'border-slate-300');
content = content.replace(/bg-cosmic-purple\/20 backdrop-blur-md border-bubblegum-pink\/20/g, 'bg-white/50 backdrop-blur-md border-slate-300');

fs.writeFileSync('src/components/HomeLanding.tsx', content);

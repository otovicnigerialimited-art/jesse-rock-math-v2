const fs = require('fs');

function replaceInFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');
  for (const [search, replace] of Object.entries(replacements)) {
    content = content.replace(new RegExp(search, 'g'), replace);
  }
  fs.writeFileSync(filePath, content);
}

replaceInFile('src/components/Dashboard.tsx', {
  'bg-slate-900/40': 'bg-ocean-blue/10 backdrop-blur-sm',
  'border-white/5': 'border-bubblegum-pink/20',
  'text-indigo-400': 'text-ocean-blue',
  'text-indigo-300': 'text-laser-green',
  'text-emerald-400': 'text-laser-green',
  'bg-emerald-500/20': 'bg-laser-green/20',
  'text-amber-400': 'text-sunburst-yellow',
  'bg-amber-500/20': 'bg-sunburst-yellow/20',
  'text-violet-400': 'text-bubblegum-pink',
  'bg-violet-500/20': 'bg-bubblegum-pink/20',
});

console.log('Dashboard colors replaced!');

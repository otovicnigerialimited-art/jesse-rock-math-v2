const fs = require('fs');

function replaceInFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');
  for (const [search, replace] of Object.entries(replacements)) {
    content = content.replace(new RegExp(search, 'g'), replace);
  }
  fs.writeFileSync(filePath, content);
}

replaceInFile('src/components/HomeLanding.tsx', {
  'from-violet-400 to-indigo-400': 'from-bubblegum-pink to-sunburst-yellow',
  'text-violet-300': 'text-laser-green',
  'bg-violet-500/10': 'bg-bubblegum-pink/20',
  'border-violet-500/20': 'border-bubblegum-pink/40',
  'text-sunburst-yellow': 'text-bubblegum-pink', // revert some
  'text-emerald-400': 'text-laser-green',
  'bg-emerald-600/10': 'bg-laser-green/20',
  'hover:border-emerald-500/20': 'hover:border-laser-green/40',
  'text-emerald-300': 'text-slime-green',
  'text-amber-400': 'text-sunburst-yellow',
  'bg-amber-600/10': 'bg-sunburst-yellow/20',
  'hover:border-amber-500/20': 'hover:border-sunburst-yellow/40',
  'text-amber-300': 'text-sunburst-yellow',
  'bg-slate-900/40': 'bg-ocean-blue/10 backdrop-blur-sm',
  'bg-slate-950': 'bg-cosmic-purple/20 backdrop-blur-md border-bubblegum-pink/20',
  'text-indigo-400': 'text-ocean-blue',
  'text-indigo-200': 'text-white',
  'bg-indigo-500': 'bg-laser-green',
  'hover:bg-indigo-400': 'hover:bg-slime-green text-slate-900',
  'from-indigo-900/40 to-violet-900/40': 'from-ocean-blue/30 to-cosmic-purple/30',
  'border-indigo-500/20': 'border-ocean-blue/40'
});

replaceInFile('src/App.tsx', {
  'bg-slate-900': 'bg-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cosmic-purple/20 via-slate-900 to-slate-900',
  'bg-slate-950/95': 'bg-cosmic-purple/40 backdrop-blur-xl',
  'text-brand-accent': 'text-sunburst-yellow',
  'hover:bg-white/5': 'hover:bg-bubblegum-pink/20 hover:text-white',
  'bg-brand-primary': 'bg-bubblegum-pink',
  'shadow-\\[0_0_15px_rgba\\(34,211,238,0\\.5\\)\\]': 'shadow-[0_0_15px_rgba(0,230,118,0.5)]',
  'border-cyan-500/50': 'border-laser-green/50',
});

console.log('Colors replaced!');

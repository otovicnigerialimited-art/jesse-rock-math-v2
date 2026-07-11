const fs = require('fs');
const path = require('path');

const dir = 'src/components';
let files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));
files = files.map(f => path.join(dir, f));
files.push('src/App.tsx');

for (const filePath of files) {
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace colors for text contrast (Deep Blue)
  content = content.replace(/text-slate-900/g, 'text-deep-blue');
  content = content.replace(/text-slate-800/g, 'text-deep-blue');
  content = content.replace(/text-slate-700/g, 'text-slate-800'); // Keep some variation
  content = content.replace(/text-slate-600/g, 'text-slate-700');

  // Replace background elements with 30% soft flat colors
  content = content.replace(/bg-white\/50/g, 'bg-warm-yellow/90');
  content = content.replace(/bg-white\/60/g, 'bg-warm-yellow/90');
  content = content.replace(/bg-white\/70/g, 'bg-panel-blue/90');
  content = content.replace(/bg-white\/80/g, 'bg-white');
  content = content.replace(/bg-white\/90/g, 'bg-white');
  content = content.replace(/bg-white\/95/g, 'bg-white');
  
  // Replace buttons and accents with 10% loud colors
  // Ensure that dynamic day/night stays working (isNight checks logic)
  content = content.replace(/text-pastel-pink/g, 'text-energetic-red');
  content = content.replace(/text-pastel-yellow/g, 'text-vibrant-yellow');
  content = content.replace(/text-pastel-green/g, 'text-emerald-500');
  content = content.replace(/text-pastel-blue/g, 'text-blue-500');
  
  content = content.replace(/bg-pastel-pink\/20/g, 'bg-energetic-red/10');
  content = content.replace(/border-pastel-pink\/40/g, 'border-energetic-red/20');
  
  content = content.replace(/bg-pastel-blue\/10/g, 'bg-panel-blue/30');
  
  // Re-fix specific buttons or specific items if needed
  content = content.replace(/bg-laser-green/g, 'bg-vibrant-yellow text-deep-blue'); // e.g. "Play Now" button
  content = content.replace(/hover:bg-slime-green/g, 'hover:bg-warm-yellow text-deep-blue');
  
  // Ensure we don't mess up the bg-daytime / bg-nighttime classes
  // We keep them as is since they are correctly implemented in CSS.

  fs.writeFileSync(filePath, content);
}

console.log('App components updated for 60-30-10 theme');

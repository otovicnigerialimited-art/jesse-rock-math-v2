const fs = require('fs');
const path = require('path');

const dir = 'src/components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  content = content.replace(/text-white/g, 'text-slate-900');
  content = content.replace(/text-slate-400/g, 'text-slate-700');
  content = content.replace(/text-slate-300/g, 'text-slate-800');
  content = content.replace(/text-slate-200/g, 'text-slate-900');
  content = content.replace(/bg-slate-900\/40/g, 'bg-white/60');
  content = content.replace(/bg-slate-900\/50/g, 'bg-white/70');
  content = content.replace(/bg-slate-900/g, 'bg-white');
  content = content.replace(/bg-slate-950\/95/g, 'bg-white/90');
  content = content.replace(/bg-slate-950/g, 'bg-white/80 backdrop-blur-md');
  content = content.replace(/border-white\/5/g, 'border-slate-300');
  content = content.replace(/border-white\/10/g, 'border-slate-300');
  content = content.replace(/border-white\/20/g, 'border-slate-300');
  
  // Re-fix matte buttons where text should stay white
  content = content.replace(/btn-matte-blue text-slate-900/g, 'btn-matte-blue text-white');
  content = content.replace(/btn-matte-pink text-slate-900/g, 'btn-matte-pink text-white');
  content = content.replace(/text-slate-900 text-\[10px\] uppercase font-bold/g, 'text-white text-[10px] uppercase font-bold'); // For small badges

  fs.writeFileSync(filePath, content);
}
console.log('Light theme applied to all components.');

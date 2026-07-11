const fs = require('fs');
const path = require('path');

const dir = 'src/components';
let files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));
files = files.map(f => path.join(dir, f));
files.push('src/App.tsx');

for (const filePath of files) {
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf8');

  // Colors
  content = content.replace(/text-black/g, 'text-deep-navy');
  content = content.replace(/bg-warm-yellow\/90/g, 'bg-clean-white');
  content = content.replace(/bg-panel-blue\/90/g, 'bg-sunny-yellow');
  content = content.replace(/bg-panel-blue\/30/g, 'bg-sky-blue/50');
  content = content.replace(/text-deep-blue/g, 'text-deep-navy');
  content = content.replace(/text-energetic-red/g, 'text-action-orange');
  
  // Buttons
  content = content.replace(/btn-matte-blue/g, 'btn-action');
  content = content.replace(/btn-matte-pink/g, 'btn-action');
  content = content.replace(/btn-accent-yellow/g, 'btn-secondary');
  
  // Borders
  content = content.replace(/border-slate-300/g, 'border-deep-navy border-4');
  
  // Custom sidebar background
  if (filePath.includes('App.tsx')) {
    content = content.replace(/bg-\[\#8D6E63\]\/90/g, 'bg-clean-white');
    content = content.replace(/border-\[\#5D4037\]/g, 'border-deep-navy border-r-4');
  }

  fs.writeFileSync(filePath, content);
}
console.log('Components updated with Educational theme.');

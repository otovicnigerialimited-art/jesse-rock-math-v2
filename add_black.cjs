const fs = require('fs');
const path = require('path');

// Update CSS
let css = fs.readFileSync('src/index.css', 'utf8');
css = css.replace(/--color-deep-blue: #0F172A;/g, '--color-deep-blue: #0F172A;\n  --color-pure-black: #000000;');
fs.writeFileSync('src/index.css', css);

// Update components and App.tsx
const dir = 'src/components';
let files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));
files = files.map(f => path.join(dir, f));
files.push('src/App.tsx');

for (const filePath of files) {
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace text colors with black
  content = content.replace(/text-deep-blue/g, 'text-black');
  content = content.replace(/text-slate-900/g, 'text-black');
  content = content.replace(/text-slate-800/g, 'text-black');

  fs.writeFileSync(filePath, content);
}
console.log('Black text added to theme and components');

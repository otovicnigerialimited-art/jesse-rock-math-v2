const fs = require('fs');
const path = require('path');

const dir = 'src/components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));
files.push('../App.tsx');

for (const file of files) {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf8');

  content = content.replace(/cosmic-purple/g, 'pastel-purple');
  content = content.replace(/ocean-blue/g, 'pastel-blue');
  content = content.replace(/laser-green/g, 'pastel-green');
  content = content.replace(/sunburst-yellow/g, 'pastel-yellow');
  content = content.replace(/bubblegum-pink/g, 'pastel-pink');
  content = content.replace(/slime-green/g, 'pastel-green');

  fs.writeFileSync(filePath, content);
}
console.log('Pastel names applied.');

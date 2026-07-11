const fs = require('fs');

let cssContent = fs.readFileSync('src/index.css', 'utf8');

// Update body backgrounds to blue/brown mixed
cssContent = cssContent.replace(
  /\.bg-daytime \{[\s\S]*?\}/,
  `.bg-daytime {
  background: linear-gradient(135deg, #A7C7E7 0%, #8D6E63 100%);
  color: #000000;
}`
);

cssContent = cssContent.replace(
  /\.bg-nighttime \{[\s\S]*?\}/,
  `.bg-nighttime {
  background: linear-gradient(135deg, #2C3E50 0%, #5D4037 100%);
  color: #000000;
}`
);

fs.writeFileSync('src/index.css', cssContent);
console.log('CSS backgrounds updated.');

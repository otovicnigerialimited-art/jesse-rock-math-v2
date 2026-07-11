const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');
css = css.replace(
  /--color-brand-primary: #ff0055;\n  --color-brand-secondary: #00d2ff;\n  --color-brand-accent: #fbbf24;/g,
  `/* Kids Gamified Theme Colors */
  --color-bubblegum-pink: #FF1053;
  --color-laser-green: #00E676;
  --color-cosmic-purple: #6200EA;
  --color-sunburst-yellow: #FFD600;
  --color-mario-red: #FF1744;
  --color-ocean-blue: #00B0FF;
  --color-slime-green: #AEEA00;

  --color-brand-primary: var(--color-bubblegum-pink);
  --color-brand-secondary: var(--color-ocean-blue);
  --color-brand-accent: var(--color-sunburst-yellow);`
);
fs.writeFileSync('src/index.css', css);

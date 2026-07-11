const fs = require('fs');

let cssContent = fs.readFileSync('src/index.css', 'utf8');

cssContent = cssContent.replace(/@theme \{[\s\S]*?\}[\s]*@layer base/g, `@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Outfit", sans-serif;
  
  /* 60-30-10 Kids Educational Theme */
  --color-sky-blue: #E1F5FE;    /* 60% Dominant Background */
  --color-sunny-yellow: #FFF9C4; /* 30% Secondary Panel */
  --color-clean-white: #FFFFFF;  /* 30% Secondary Panel */
  --color-action-orange: #FF6D00; /* 10% Accent / Buttons */
  --color-deep-navy: #1A237E;    /* Text / Contour lines */
  --color-pure-black: #000000;
  
  --color-brand-primary: var(--color-sky-blue);
  --color-brand-secondary: var(--color-sunny-yellow);
  --color-brand-accent: var(--color-action-orange);
}

@layer base`);

// Update backgrounds
cssContent = cssContent.replace(/\.bg-daytime \{[\s\S]*?\}/, `.bg-daytime {
  background-color: var(--color-sky-blue);
  color: var(--color-deep-navy);
}`);

cssContent = cssContent.replace(/\.bg-nighttime \{[\s\S]*?\}/, `.bg-nighttime {
  background-color: #283593;
  color: #FFFFFF;
}`);

// Add contour buttons
const buttonStyles = `
/* Interactive Elements with Contour Lines */
.btn-action {
  background-color: var(--color-action-orange);
  border: 4px solid var(--color-deep-navy);
  color: #FFFFFF;
  font-weight: 900;
  text-transform: uppercase;
  border-radius: 1.25rem;
  box-shadow: 0 6px 0 var(--color-deep-navy);
  transition: transform 0.05s ease, box-shadow 0.05s ease;
  user-select: none;
}
.btn-action:active {
  transform: translateY(6px);
  box-shadow: 0 0 0 var(--color-deep-navy);
}

.btn-secondary {
  background-color: var(--color-sunny-yellow);
  border: 4px solid var(--color-deep-navy);
  color: var(--color-deep-navy);
  font-weight: 900;
  text-transform: uppercase;
  border-radius: 1.25rem;
  box-shadow: 0 6px 0 var(--color-deep-navy);
  transition: transform 0.05s ease, box-shadow 0.05s ease;
  user-select: none;
}
.btn-secondary:active {
  transform: translateY(6px);
  box-shadow: 0 0 0 var(--color-deep-navy);
}

.glass {
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border: 4px solid var(--color-deep-navy); /* Contour line */
  border-radius: 1.5rem;
  color: var(--color-deep-navy);
}
`;

cssContent = cssContent.replace(/\.btn-matte-blue \{[\s\S]*?\.btn-accent-yellow:active \{[\s\S]*?\}/, buttonStyles);

// Remove the old button styles if they are still there
cssContent = cssContent.replace(/\.btn-matte-pink \{[\s\S]*?\.btn-matte-pink:active \{[\s\S]*?\}/, '');
cssContent = cssContent.replace(/\.btn-accent \{[\s\S]*?\.btn-accent:active \{[\s\S]*?\}/, '');

fs.writeFileSync('src/index.css', cssContent);
console.log('CSS updated with Educational theme.');

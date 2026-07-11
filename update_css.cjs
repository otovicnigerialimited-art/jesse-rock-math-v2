const fs = require('fs');

let css = `@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Outfit", sans-serif;
  
  /* Kids Pastel Theme Colors */
  --color-pastel-blue: #A7C7E7;
  --color-pastel-green: #B5EAD7;
  --color-pastel-yellow: #FFF8CD;
  --color-pastel-pink: #FFDAC1;
  --color-pastel-purple: #C7CEEA;
  --color-matte-dark: #2C3E50;
  
  --color-brand-primary: var(--color-pastel-blue);
  --color-brand-secondary: var(--color-pastel-green);
  --color-brand-accent: var(--color-pastel-yellow);
}

@layer base {
  body {
    background-color: #A7C7E7; 
    color: #2C3E50;
    @apply antialiased;
    transition: background-color 1s ease, color 1s ease;
  }
}

.glass {
  @apply bg-white/60 backdrop-blur-md border border-white/40 shadow-sm rounded-3xl text-slate-800;
}

/* Matte buttons */
.btn-matte-blue {
  background-color: #6495ED;
  border: 4px solid #4169E1;
  color: #ffffff;
  font-weight: 900;
  text-transform: uppercase;
  border-radius: 1.25rem;
  box-shadow: 0 4px 0 #4169E1;
  transition: transform 0.05s ease, box-shadow 0.05s ease;
  user-select: none;
}
.btn-matte-blue:active {
  transform: translateY(4px);
  box-shadow: 0 0 0 #4169E1;
}

.btn-matte-pink {
  background-color: #FF6B6B;
  border: 4px solid #C0392B;
  color: #ffffff;
  font-weight: 900;
  text-transform: uppercase;
  border-radius: 1.25rem;
  box-shadow: 0 4px 0 #C0392B;
  transition: transform 0.05s ease, box-shadow 0.05s ease;
  user-select: none;
}
.btn-matte-pink:active {
  transform: translateY(4px);
  box-shadow: 0 0 0 #C0392B;
}

/* Wiggle animation & hover effect */
@keyframes wiggle {
  0%, 100% { transform: scale(1.1) rotate(-4deg); }
  50% { transform: scale(1.1) rotate(4deg); }
}
.wiggle-hover {
  display: inline-block;
  transition: transform 0.2s ease;
}
.wiggle-hover:hover {
  animation: wiggle 0.15s infinite;
}

/* Day/Night backgrounds */
.bg-daytime {
  background: linear-gradient(180deg, #A7C7E7 0%, #E0F7FA 100%);
  color: #2C3E50;
}
.bg-nighttime {
  background: linear-gradient(180deg, #2C3E50 0%, #1A252F 100%);
  color: #ECF0F1;
}

/* Landscape overlay */
.landscape-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 250px;
  background-image: url('data:image/svg+xml;utf8,<svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg"><path fill="%23B5EAD7" fill-opacity="1" d="M0,256L48,229.3C96,203,192,149,288,154.7C384,160,480,224,576,218.7C672,213,768,139,864,128C960,117,1056,171,1152,197.3C1248,224,1344,224,1392,224L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: bottom;
  pointer-events: none;
  z-index: 0;
  transition: opacity 1s ease;
}
.landscape-night {
  background-image: url('data:image/svg+xml;utf8,<svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg"><path fill="%2334495E" fill-opacity="1" d="M0,256L48,229.3C96,203,192,149,288,154.7C384,160,480,224,576,218.7C672,213,768,139,864,128C960,117,1056,171,1152,197.3C1248,224,1344,224,1392,224L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>');
}

/* Floating emojis under active elements */
@keyframes floatUp {
  0% { transform: translateY(110vh) rotate(0deg); opacity: 0; }
  10% { opacity: 0.25; }
  90% { opacity: 0.25; }
  100% { transform: translateY(-20vh) rotate(360deg); opacity: 0; }
}
.floating-bg-container {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  pointer-events: none; overflow: hidden; z-index: 0;
}
.floating-emoji-item {
  position: absolute; bottom: -50px; user-select: none; pointer-events: none;
  animation: floatUp linear infinite; opacity: 0; will-change: transform, opacity;
}
.scrollbar-thin-custom::-webkit-scrollbar { width: 4px; }
.scrollbar-thin-custom::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.05); }
.scrollbar-thin-custom::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.2); border-radius: 4px; }
.scrollbar-thin-custom::-webkit-scrollbar-thumb:hover { background: rgba(0, 0, 0, 0.3); }

/* Remove shiny effects */
.shadow-neon, .rock-shadow {
  box-shadow: none !important;
}
`;
fs.writeFileSync('src/index.css', css);

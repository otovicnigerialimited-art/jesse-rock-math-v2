const fs = require('fs');

let cssContent = `@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Outfit", sans-serif;
  
  /* 60-30-10 Kids Educational Theme */
  --color-soft-blue: #E3F2FD;    /* 60% Dominant Background */
  --color-panel-blue: #BBDEFB;   /* 30% Secondary Panel */
  --color-warm-yellow: #FFF9C4;  /* 30% Secondary Panel */
  --color-vibrant-yellow: #FFCA28; /* 10% Accent / Buttons */
  --color-energetic-red: #FF5252;  /* 10% Accent / Buttons */
  --color-deep-blue: #0F172A;    /* Text color for high contrast */
  
  --color-brand-primary: var(--color-soft-blue);
  --color-brand-secondary: var(--color-warm-yellow);
  --color-brand-accent: var(--color-energetic-red);
}

@layer base {
  body {
    background-color: #E3F2FD;
    color: #0F172A;
    @apply antialiased;
    transition: background-color 0.5s ease, color 0.5s ease;
  }
}

.glass {
  @apply bg-white/80 backdrop-blur-md border-2 border-white/60 shadow-sm rounded-3xl text-deep-blue;
}

/* Flat matte buttons for accents (10%) */
.btn-matte-blue {
  background-color: #42A5F5;
  border: 4px solid #1E88E5;
  color: #ffffff;
  font-weight: 900;
  text-transform: uppercase;
  border-radius: 1.25rem;
  box-shadow: 0 4px 0 #1E88E5;
  transition: transform 0.05s ease, box-shadow 0.05s ease;
  user-select: none;
}
.btn-matte-blue:active {
  transform: translateY(4px);
  box-shadow: 0 0 0 #1E88E5;
}

.btn-matte-pink, .btn-accent {
  background-color: #FF5252;
  border: 4px solid #D50000;
  color: #ffffff;
  font-weight: 900;
  text-transform: uppercase;
  border-radius: 1.25rem;
  box-shadow: 0 4px 0 #D50000;
  transition: transform 0.05s ease, box-shadow 0.05s ease;
  user-select: none;
}
.btn-matte-pink:active, .btn-accent:active {
  transform: translateY(4px);
  box-shadow: 0 0 0 #D50000;
}

.btn-accent-yellow {
  background-color: #FFCA28;
  border: 4px solid #FF8F00;
  color: #0F172A;
  font-weight: 900;
  text-transform: uppercase;
  border-radius: 1.25rem;
  box-shadow: 0 4px 0 #FF8F00;
  transition: transform 0.05s ease, box-shadow 0.05s ease;
  user-select: none;
}
.btn-accent-yellow:active {
  transform: translateY(4px);
  box-shadow: 0 0 0 #FF8F00;
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
  background-color: #E3F2FD;
  color: #0F172A;
}
.bg-nighttime {
  background-color: #1E293B;
  color: #F8FAFC;
}

/* Landscape overlay */
.landscape-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 250px;
  background-image: url('data:image/svg+xml;utf8,<svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg"><path fill="%23BBDEFB" fill-opacity="1" d="M0,256L48,229.3C96,203,192,149,288,154.7C384,160,480,224,576,218.7C672,213,768,139,864,128C960,117,1056,171,1152,197.3C1248,224,1344,224,1392,224L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: bottom;
  pointer-events: none;
  z-index: 0;
  transition: opacity 1s ease;
}
.landscape-night {
  background-image: url('data:image/svg+xml;utf8,<svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg"><path fill="%23334155" fill-opacity="1" d="M0,256L48,229.3C96,203,192,149,288,154.7C384,160,480,224,576,218.7C672,213,768,139,864,128C960,117,1056,171,1152,197.3C1248,224,1344,224,1392,224L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>');
}

/* Floating emojis under active elements */
@keyframes floatUp {
  0% { transform: translateY(110vh) rotate(0deg); opacity: 0; }
  10% { opacity: 0.15; }
  90% { opacity: 0.15; }
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

fs.writeFileSync('src/index.css', cssContent);
console.log('CSS updated');

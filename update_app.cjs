const fs = require('fs');

let appContent = fs.readFileSync('src/App.tsx', 'utf8');

// Replace dark colors with day/night logic
appContent = appContent.replace(
  'bg-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cosmic-purple/20 via-slate-900 to-slate-900',
  '${isNight ? "bg-nighttime" : "bg-daytime"}'
);

appContent = appContent.replace(
  'bg-cosmic-purple/40 backdrop-blur-xl',
  'bg-white/40 backdrop-blur-md border-r border-white/20'
);

appContent = appContent.replace(
  'text-slate-50',
  '${isNight ? "text-slate-100" : "text-slate-800"}'
);

// We need to inject isNight state
if (!appContent.includes('isNight')) {
  appContent = appContent.replace(
    'const [isSidebarOpen, setIsSidebarOpen] = useState(false);',
    `const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNight, setIsNight] = useState(false);
  React.useEffect(() => {
    const hour = new Date().getHours();
    setIsNight(hour >= 18 || hour < 6);
  }, []);`
  );
}

// Ensure the container div has the correct template literal if we replaced it
appContent = appContent.replace(
  /<div className="h-dvh w-screen overflow-hidden \$\{isNight \? "bg-nighttime" : "bg-daytime"\} flex flex-col \$\{isNight \? "text-slate-100" : "text-slate-800"\} font-sans selection:bg-pink-500 selection:text-white relative z-10">/g,
  `<div className={\`h-dvh w-screen overflow-hidden \${isNight ? "bg-nighttime" : "bg-daytime"} flex flex-col \${isNight ? "text-slate-100" : "text-slate-800"} font-sans selection:bg-pastel-pink selection:text-slate-900 relative z-10\`}>`
);

// Landscape overlay and hide floating emojis in quiz mode
appContent = appContent.replace(
  /{backgroundEmojis.map\(\(emoji\) => \(/g,
  `{activeTab !== 'quiz' && <div className={\`landscape-overlay \${isNight ? 'landscape-night' : ''}\`} />}
        {activeTab !== 'quiz' && backgroundEmojis.map((emoji) => (`
);

appContent = appContent.replace(
  /<\/div>\s*\{\/\* Container for sidebar \+ content \*\/\}/,
  `{activeTab !== 'quiz' && '}'}
      </div>
      {/* Container for sidebar + content */}`
);


fs.writeFileSync('src/App.tsx', appContent);

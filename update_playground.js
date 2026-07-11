import fs from 'fs';
let code = fs.readFileSync('src/components/LearningHub.tsx', 'utf-8');

const playgroundFallback = `
                {/* Fallback Playground for new elementary and junior high subjects */}
                {!['1', '2', '3', '4', '5'].includes(selectedLesson.id) && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-black text-deep-navy">🎛️ Interactive Exploration</h3>
                    <div className="p-8 bg-white/40 border border-deep-navy border-4 rounded-3xl text-center space-y-4">
                      <div className="text-6xl animate-bounce">🚀</div>
                      <h4 className="font-black text-xl text-deep-navy">Ready for {selectedLesson.title}?</h4>
                      <p className="text-sm font-medium text-slate-700 max-w-sm mx-auto leading-relaxed">
                        Mastering {selectedLesson.category.toLowerCase()} concepts requires focus. The Rockstar Arena awaits your arrival. Press the "Start Quiz Battle" button to begin your journey!
                      </p>
                    </div>
                  </div>
                )}
`;

code = code.replace(/\{selectedLesson.id === '3' && \(\n\s*<div className="space-y-6">/, playgroundFallback + "\n                {selectedLesson.id === '3' && (\n                  <div className=\"space-y-6\">");

fs.writeFileSync('src/components/LearningHub.tsx', code);

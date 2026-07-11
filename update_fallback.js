import fs from 'fs';
let code = fs.readFileSync('src/components/LearningHub.tsx', 'utf-8');

// The switch/if block goes on and on. I'll just add a catch all at the end of the content area.
// Need to find where the fractions block ends. 
const fallback = `
          {/* Fallback for new elementary and junior high subjects */}
          {!['1', '2', '3', '4', '5'].includes(lessonId) && (
            <div className="space-y-4">
              <div className="bg-sunny-yellow/10 border border-deep-navy/30 p-4 rounded-2xl text-center space-y-2">
                <h4 className="font-black text-sm text-deep-navy">Rock on with this new topic!</h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  You're exploring advanced arenas. Take a moment to think critically about the mathematical concepts required here. There are no limits to what you can conquer in the Rockstar Arena!
                </p>
                <div className="text-4xl py-4 animate-bounce">🎸</div>
                <p className="text-xs font-bold text-brand-secondary">Ready to test your skills? Jump into the battle below!</p>
              </div>
            </div>
          )}
`;

code = code.replace(/\{lessonId === '5' && \(\n\s*<>\n\s*\{infoTab === 'concept' && \(/, fallback + "\n          {lessonId === '5' && (\n            <>\n              {infoTab === 'concept' && (");

fs.writeFileSync('src/components/LearningHub.tsx', code);

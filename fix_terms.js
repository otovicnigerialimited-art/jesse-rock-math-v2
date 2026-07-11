import fs from 'fs';
let code = fs.readFileSync('src/components/TermsPage.tsx', 'utf-8');

// I will fix the broken section
const brokenSection = `                <Server className="text-pink-600" size={16} /> C. Data Portability & The Conversion Pipeline
                  </h3>`;

const fixedSection = `                {/* C */}
                <div className="p-6 rounded-3xl bg-clean-white border border-deep-navy border-4 space-y-3">
                  <h3 className="text-sm font-black font-mono uppercase text-deep-navy border-b border-deep-navy/10 pb-2 flex items-center gap-2">
                    <Server className="text-pink-600" size={16} /> C. Data Portability & The Conversion Pipeline
                  </h3>`;

code = code.replace(brokenSection, fixedSection);
fs.writeFileSync('src/components/TermsPage.tsx', code);

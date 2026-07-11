import fs from 'fs';
let code = fs.readFileSync('src/components/TermsPage.tsx', 'utf-8');

const badSectionStart = `                {/* C */}
                <div className="p-6 rounded-3xl bg-clean-white border border-deep-navy border-4 space-y-3">
                  <h3 className="text-sm font-black font-mono uppercase text-deep-navy border-b border-deep-navy/10 pb-2 flex items-center gap-2">
                    
                {/* D */}
                <div className="p-6 rounded-3xl bg-clean-white border border-deep-navy border-4 space-y-3">
                  <h3 className="text-sm font-black font-mono uppercase text-deep-navy border-b border-deep-navy/10 pb-2 flex items-center gap-2">
                    <Globe className="text-blue-600" size={16} /> D. Third-Party Educational Integrations (Google Interland)
                  </h3>
                  <p className="text-xs text-slate-800 font-bold leading-relaxed">
                    To reward students with high streaks, we unlock the <strong>Fun Arcade</strong>, which provides direct links to highly vetted, educational games produced by Google (e.g., Kind Kingdom, Reality River).
                  </p>
                  <ul className="space-y-2 pl-4 text-[11px] text-slate-800 font-semibold leading-relaxed list-disc">
                    <li><strong>COPPA Compliance Maintained:</strong> These games are hosted directly on Google Interland (Be Internet Awesome), which is a COPPA-compliant, kid-safe environment designed to teach digital citizenship.</li>
                    <li><strong>No Data Sharing:</strong> Jesse Rock Math does not transmit any student data, IDs, or tracking pixels to Google. We merely provide a hyperlink to their public educational resources.</li>
                    <li><strong>Zero Trackers:</strong> Our application does not embed external third-party ad networks or hidden tracking cookies alongside these games.</li>
                  </ul>
                </div>`;

const goodSection = `                {/* D */}
                <div className="p-6 rounded-3xl bg-clean-white border border-deep-navy border-4 space-y-3">
                  <h3 className="text-sm font-black font-mono uppercase text-deep-navy border-b border-deep-navy/10 pb-2 flex items-center gap-2">
                    <Globe className="text-blue-600" size={16} /> D. Third-Party Educational Integrations (Google Interland)
                  </h3>
                  <p className="text-xs text-slate-800 font-bold leading-relaxed">
                    To reward students with high streaks, we unlock the <strong>Fun Arcade</strong>, which provides direct links to highly vetted, educational games produced by Google (e.g., Kind Kingdom, Reality River).
                  </p>
                  <ul className="space-y-2 pl-4 text-[11px] text-slate-800 font-semibold leading-relaxed list-disc">
                    <li><strong>COPPA Compliance Maintained:</strong> These games are hosted directly on Google Interland (Be Internet Awesome), which is a COPPA-compliant, kid-safe environment designed to teach digital citizenship.</li>
                    <li><strong>No Data Sharing:</strong> Jesse Rock Math does not transmit any student data, IDs, or tracking pixels to Google. We merely provide a hyperlink to their public educational resources.</li>
                    <li><strong>Zero Trackers:</strong> Our application does not embed external third-party ad networks or hidden tracking cookies alongside these games.</li>
                  </ul>
                </div>`;

code = code.replace(badSectionStart, goodSection);
fs.writeFileSync('src/components/TermsPage.tsx', code);

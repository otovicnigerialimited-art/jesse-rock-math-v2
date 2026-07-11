const fs = require('fs');
let code = fs.readFileSync('src/components/BadgesSection.tsx', 'utf8');

// Add username prop
code = code.replace(/stats: UserStats;/, 'stats: UserStats;\n  username: string;');
code = code.replace(/export default function BadgesSection\(\{ stats, onClaimWeeklyBadge \}: BadgesSectionProps\) \{/, 'export default function BadgesSection({ stats, username, onClaimWeeklyBadge }: BadgesSectionProps) {\n  const [showCert, setShowCert] = React.useState(false);\n  const hasGrandMaster = CORE_BADGES.find(b => b.id === "grand_master")?.checkUnlocked(stats) || false;');

// Add certificate render and button next to Badges Collection Shelf Grid
code = code.replace(/\{CORE_BADGES\.filter\(b => b\.checkUnlocked\(stats\)\)\.length\} \/ \{CORE_BADGES\.length\}/, '{CORE_BADGES.filter(b => b.checkUnlocked(stats)).length} / {CORE_BADGES.length}\n            {hasGrandMaster && (\n              <button onClick={() => setShowCert(true)} className="ml-4 px-3 py-1.5 bg-amber-500 text-amber-950 font-bold rounded-lg text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:scale-105 transition-all flex items-center gap-1"><Download size={14} /> Grand Master Certificate</button>\n            )}');

// Add CertificateModal at the end
code = code.replace(/<\/div>\n  \);\n\}\n$/, '      <CertificateModal isOpen={showCert} onClose={() => setShowCert(false)} username={username} />\n    </div>\n  );\n}\n');

fs.writeFileSync('src/components/BadgesSection.tsx', code);

const fs = require('fs');
let code = fs.readFileSync('src/lib/badges.ts', 'utf8');
code = code.replace(/id: `scholar_\$\{i \+ 1\}`/, 'id: i === 193 ? "grand_master" : `scholar_${i + 1}`');
code = code.replace(/Achieved the ultimate Grand Master rank by solving 194 problems!/, 'Achieved the ultimate Grand Master rank by solving 200 problems!');
fs.writeFileSync('src/lib/badges.ts', code);

const fs = require('fs');
let content = fs.readFileSync('src/components/HomeLanding.tsx', 'utf8');

content = content.replace(
  /WELCOME TO <br \/>[\s\S]*?<\/span>/,
  'WELCOME TO <br />\n            <span className="text-black drop-shadow-md">\n              JESSE MATH ROCK STAR\n            </span>'
);

fs.writeFileSync('src/components/HomeLanding.tsx', content);
console.log('HomeLanding updated.');

const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /"fixed inset-y-0 left-0 z-40 w-72 glass bg-[^"]*"/,
  '"fixed inset-y-0 left-0 z-40 w-72 glass bg-[#8D6E63]/90 text-white border-r border-[#5D4037] transition-transform lg:translate-x-0 lg:static shrink-0 flex flex-col"'
);

fs.writeFileSync('src/App.tsx', content);
console.log('Sidebar updated to brown.');

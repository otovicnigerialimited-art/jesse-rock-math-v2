const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      if (!dirFile.includes('node_modules') && !dirFile.includes('.git')) {
        filelist = walkSync(dirFile, filelist);
      }
    } else {
      if (dirFile.endsWith('.tsx') || dirFile.endsWith('.html') || dirFile.endsWith('.json') || dirFile.endsWith('.ts')) {
        filelist.push(dirFile);
      }
    }
  });
  return filelist;
};

const files = walkSync('.');

const replacements = [
  { regex: /Rockstar Scholar/g, replacement: "Football Scholar" },
  { regex: /Rockstar/g, replacement: "Striker" },
  { regex: /rockstar/g, replacement: "striker" },
  { regex: /Rock Tour/g, replacement: "Football Career" },
  { regex: /Rock Shop/g, replacement: "Club Shop" },
  { regex: /Rock Shop/g, replacement: "Club Shop" }, // case insensitive next
  { regex: /rock shop/gi, replacement: "Club Shop" },
  { regex: /rock coins/gi, replacement: "match coins" },
  { regex: /Rock Coins/gi, replacement: "Match Coins" },
  { regex: /Rock Streak/gi, replacement: "Goal Streak" },
  { regex: /Rock God/gi, replacement: "World Cup Legend" },
  { regex: /World Icon/gi, replacement: "Ballon d'Or Winner" },
  { regex: /Rock Hall of Fame/gi, replacement: "Golden Boot" },
  { regex: /Stadium Legend/gi, replacement: "European Elite" },
  { regex: /Arena Tour/gi, replacement: "League Champion" },
  { regex: /Festival Icon/gi, replacement: "Cup Winner" },
  { regex: /Headline Act/gi, replacement: "First Team" },
  { regex: /Support Act/gi, replacement: "Reserves" },
  { regex: /Local Pub/gi, replacement: "Sunday League Pro" },
  { regex: /Garage Band/gi, replacement: "Youth Academy" },
  { regex: /Street Busker/gi, replacement: "Sunday League" },
  { regex: /Busker/gi, replacement: "Sunday League" },
  { regex: /gig progression/gi, replacement: "match progression" },
  { regex: /Gigs/g, replacement: "Matches" },
  { regex: /gigs/g, replacement: "matches" },
  { regex: /electric guitar/gi, replacement: "football boot" },
  { regex: /guitars/gi, replacement: "football boots" },
  { regex: /stage outfits/gi, replacement: "football kits" },
  { regex: /stage pyrotechnics/gi, replacement: "stadium celebrations" },
  { regex: /🎸/g, replacement: "⚽" },
  { regex: /🤘/g, replacement: "🏆" },
  { regex: /Jesse Math Rockstar/g, replacement: "Jesse Math FC" }, // just to be safe
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  replacements.forEach(({regex, replacement}) => {
    content = content.replace(regex, replacement);
  });

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});

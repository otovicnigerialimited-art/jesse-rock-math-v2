import fs from 'fs';
let code = fs.readFileSync('src/components/RulesPage.tsx', 'utf-8');

const funArcadeRule = `,
    {
      icon: <Trophy className="text-brand-secondary" size={24} />,
      title: "The Fun Arcade (200 Streak Rule)",
      desc: "Only the most elite Rockstars can enter the Fun Arcade! Once you achieve a massive streak of 200 or more correct answers, you break the locks to the secret Arcade Zone. Here, you get exclusive access to play high-quality, fun educational games from Google Interland."
    }`;

code = code.replace(/Teacher account!"\n\s*\}\n\s*\];/, "Teacher account!\"\n    }" + funArcadeRule + "\n  ];");
fs.writeFileSync('src/components/RulesPage.tsx', code);

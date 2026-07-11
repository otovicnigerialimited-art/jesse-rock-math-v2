import fs from 'fs';
let code = fs.readFileSync('index.html', 'utf-8');

const funArcadeFaq = `
          <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
            <h3 itemprop="name">What is the Fun Arcade and how does it follow COPPA rules?</h3>
            <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
              <p itemprop="text">
                The <strong>Fun Arcade</strong> is a secret, ultra-exclusive reward zone in Jesse Rock Math. When a student achieves a massive <strong>streak of 200 or more correct answers</strong>, they break open a locked door to the Arcade Zone. Inside, they earn the exclusive right to play high-quality, educational games focused on internet safety and digital citizenship, directly linked from <strong>Google Interland (Be Internet Awesome)</strong>. These games include <em>Kind Kingdom</em>, <em>Reality River</em>, <em>Mindful Mountain</em>, and <em>Tower of Treasure</em>. Because these games are provided via direct outgoing links to Google's official educational Interland platform, which is itself fully COPPA-compliant and designed for kids, our integration remains strictly secure and adheres to all COPPA regulations, ensuring a completely safe, tracker-free environment for children.
              </p>
            </div>
          </div>
`;

code = code.replace(/<div itemscope itemprop="mainEntity" itemtype="https:\/\/schema.org\/Question">\n\s*<h3 itemprop="name">Who is on the Jesse Rock Math Board/, funArcadeFaq + '\n          <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">\n            <h3 itemprop="name">Who is on the Jesse Rock Math Board');
fs.writeFileSync('index.html', code);

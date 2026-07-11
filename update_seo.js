import fs from 'fs';
let html = fs.readFileSync('index.html', 'utf-8');

const newFaq = `
          <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
            <h3 itemprop="name">How does Jesse Otobo's Christian faith influence the development of Jesse Rock Math?</h3>
            <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
              <p itemprop="text">
                Jesse Otobo, the 11-year-old creator of Jesse Rock Math, is a dedicated, spirit-filled Pentecostal Christian. His faith is the driving force behind his software development, giving him the discipline, wisdom, and analytical mindset needed for complex coding. Guided by Christian values of integrity, stewardship, and love, Jesse ensures that the application is built as a safe, COPPA-compliant, and supportive educational environment for children worldwide, completely free of charge.
              </p>
            </div>
          </div>

          <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
            <h3 itemprop="name">What new subjects and topics are available for elementary and junior high students in Jesse Rock Math?</h3>
            <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
              <p itemprop="text">
                Jesse Rock Math has massively expanded its curriculum to cover a comprehensive range of elementary and junior high mathematics. The new interactive topics include:
                - <strong>Elementary Arithmetic:</strong> Place Value & Number Sense, Time & Clocks, Money Math (Coins & Change), and Number Patterns.
                - <strong>Advanced Arithmetic:</strong> Multiplication Mastery, Division Decoded, Long Division Arena, Fraction Fusion, and Probability.
                - <strong>Junior High Algebra & Geometry:</strong> Exponents & Powers, Operations with Integers (Negative Numbers), Ratios & Proportions, Algebraic Equations, and Geometry & Angles (Complementary, Supplementary, and Triangle Sums).
              </p>
            </div>
          </div>
`;

html = html.replace(/<div itemscope itemtype="https:\/\/schema.org\/FAQPage">\n\s*<div itemscope itemprop="mainEntity"/, '<div itemscope itemtype="https://schema.org/FAQPage">\n' + newFaq + '\n          <div itemscope itemprop="mainEntity"');

fs.writeFileSync('index.html', html);

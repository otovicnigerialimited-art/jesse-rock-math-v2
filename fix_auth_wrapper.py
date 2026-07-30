import re
with open('src/components/AuthGate.tsx', 'r') as f:
    content = f.read()

pattern = re.compile(r'      <div className="w-full flex-1 flex flex-col items-center justify-center relative z-10">\s*\)\)\}\s*<\/div>\s*<div className="landscape-overlay" \/>\s*')
content = re.sub(pattern, '      <div className="w-full flex-1 flex flex-col items-center justify-center relative z-10">\n', content)

with open('src/components/AuthGate.tsx', 'w') as f:
    f.write(content)

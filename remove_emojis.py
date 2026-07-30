import re

with open('src/components/AuthGate.tsx', 'r') as f:
    content = f.read()

# Replace the JSX for the floating emojis
pattern = re.compile(r'\{\/\* Floating Emojis Background \*\/\}.*?<\/div>', re.DOTALL)
content = re.sub(pattern, '', content)

with open('src/components/AuthGate.tsx', 'w') as f:
    f.write(content)

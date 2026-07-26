import re

with open('src/components/AuthGate.tsx', 'r') as f:
    content = f.read()

# Make the outer container justify-between instead of justify-center
content = content.replace(
    '<div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-tr from-purple-900 via-indigo-950 to-pink-900 relative overflow-x-hidden font-sans text-deep-navy">',
    '<div className="min-h-screen flex flex-col items-center justify-between p-4 sm:p-6 bg-gradient-to-tr from-purple-900 via-indigo-950 to-pink-900 relative overflow-x-hidden font-sans text-deep-navy">\n      <div className="w-full flex-1 flex flex-col items-center justify-center">'
)

content = content.replace(
    '      {/* Itch.io Embed */}',
    '      </div>\n      {/* Itch.io Embed */}'
)

with open('src/components/AuthGate.tsx', 'w') as f:
    f.write(content)


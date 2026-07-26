import re

with open('src/components/HomeLanding.tsx', 'r') as f:
    content = f.read()

# Replace outer wrapper
content = content.replace('<div className="space-y-12">', '<div className="flex flex-col min-h-full justify-between">\n      <div className="space-y-12 flex-1">')

# Replace the footer area to close the flex-1 wrapper right before it
content = content.replace('      {/* Itch.io Embed */}', '      </div>\n\n      {/* Itch.io Embed */}')

# also the footer itself has "mt-12" which we might want to change to "mt-auto" or remove.
content = content.replace('<footer className="border-t border-deep-navy/10 pt-8 pb-4 mt-12 text-center space-y-4">', '<footer className="border-t border-deep-navy/10 pt-6 pb-2 mt-8 text-center space-y-4">')

with open('src/components/HomeLanding.tsx', 'w') as f:
    f.write(content)

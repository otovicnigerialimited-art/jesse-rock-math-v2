import re

with open('src/components/AuthGate.tsx', 'r') as f:
    content = f.read()

# I will replace the wrapper min-h-screen of the return.
old_wrapper = '    <div className="min-h-screen flex flex-col items-center justify-between p-4 sm:p-6 bg-gradient-to-tr from-purple-900 via-indigo-950 to-pink-900 relative overflow-x-hidden font-sans text-deep-navy">'
new_wrapper = '    <div className="min-h-screen flex flex-col items-center justify-between p-4 sm:p-6 bg-sky-200 relative overflow-x-hidden font-sans text-slate-900">'

content = content.replace(old_wrapper, new_wrapper)

content = content.replace(
    '      {/* Background radial soft lights */}\n      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />\n      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />',
    '      <div className="landscape-overlay" />'
)

# Replace the text colors in AuthGate tab titles to slate-900 or white where appropriate.
# Since it's a login modal, the modal itself is white usually. Let's see the login box.
content = content.replace('bg-white/5 backdrop-blur-xl border border-white/10', 'bg-white border-4 border-slate-900 shadow-[8px_8px_0_0_#0f172a]')

with open('src/components/AuthGate.tsx', 'w') as f:
    f.write(content)

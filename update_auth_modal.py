with open('src/components/AuthGate.tsx', 'r') as f:
    content = f.read()

# Replace the sky-200 background
old_wrapper = '    <div className="min-h-screen flex flex-col items-center justify-between p-4 sm:p-6 bg-sky-200 relative overflow-x-hidden font-sans text-slate-900">'
new_wrapper = '    <div className="min-h-screen flex flex-col items-center justify-between p-4 sm:p-6 bg-slate-950 relative overflow-x-hidden font-sans text-slate-200">'
content = content.replace(old_wrapper, new_wrapper)

# Update the coordinate grids for the auth page too
content = content.replace(
    '      <div className="w-full flex-1 flex flex-col items-center justify-center">',
    '      {/* Crisp mathematical coordinate grids */}\n      <div \n        className="absolute inset-0 z-0 opacity-10 pointer-events-none" \n        style={{ \n          backgroundImage: `linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)`,\n          backgroundSize: "40px 40px" \n        }}\n      />\n      <div className="w-full flex-1 flex flex-col items-center justify-center relative z-10">'
)

# And the auth card background
old_card = 'bg-white border-4 border-slate-900 shadow-[8px_8px_0_0_#0f172a]'
new_card = 'bg-slate-900 border border-slate-800 shadow-xl'
content = content.replace(old_card, new_card)

with open('src/components/AuthGate.tsx', 'w') as f:
    f.write(content)

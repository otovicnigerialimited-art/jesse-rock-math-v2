import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# For the initial loading states in App.tsx that happen before authentication,
# they are returning a full div. We can use h-screen instead of min-h-full.
# We also have the suspense fallbacks inside the authenticated view, which should be min-h-full.
content = content.replace('className="min-h-full flex items-center justify-center bg-slate-950 text-white"', 'className="h-full flex items-center justify-center bg-slate-950 text-white"')
content = content.replace('      <div className="h-full flex items-center justify-center bg-slate-950 text-white">\n        <div className="text-center space-y-4">\n          <Loader2 className="animate-spin text-brand-primary w-12 h-12 mx-auto" strokeWidth={3} />\n          <p className="text-sm font-black tracking-wider text-slate-400">CONNECTING TO JESSE ROCK MATH ARENA...</p>', '      <div className="h-screen w-screen flex items-center justify-center bg-slate-950 text-white">\n        <div className="text-center space-y-4">\n          <Loader2 className="animate-spin text-brand-primary w-12 h-12 mx-auto" strokeWidth={3} />\n          <p className="text-sm font-black tracking-wider text-slate-400">CONNECTING TO JESSE ROCK MATH ARENA...</p>')
content = content.replace('        <div className="h-full flex items-center justify-center bg-slate-950 text-white">\n          <div className="text-center space-y-4">\n            <Loader2 className="animate-spin text-brand-primary w-12 h-12 mx-auto" strokeWidth={3} />\n            <p className="text-sm font-black tracking-wider text-slate-400">LOADING ARENA...</p>', '        <div className="h-screen w-screen flex items-center justify-center bg-slate-950 text-white">\n          <div className="text-center space-y-4">\n            <Loader2 className="animate-spin text-brand-primary w-12 h-12 mx-auto" strokeWidth={3} />\n            <p className="text-sm font-black tracking-wider text-slate-400">LOADING ARENA...</p>')

with open('src/App.tsx', 'w') as f:
    f.write(content)

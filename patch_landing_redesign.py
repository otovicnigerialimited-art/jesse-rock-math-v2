import re

with open('src/components/AuthGate.tsx', 'r') as f:
    content = f.read()

start_idx = content.find("if (showLanding) {")
end_idx = content.find("  return (\n    <div className=\"min-h-screen flex flex-col items-center", start_idx + 1)

new_landing = """  if (showLanding) {
    return (
      <div className="min-h-screen bg-amber-200 text-slate-900 overflow-y-auto font-sans relative">
         
         <div className="max-w-6xl mx-auto px-6 py-12 md:py-20 relative z-10 flex flex-col items-center text-center space-y-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-4xl">
              <span className="px-6 py-2 rounded-full bg-white border-4 border-slate-900 shadow-[4px_4px_0_0_#0f172a] text-pink-600 text-sm font-black uppercase tracking-widest inline-block mb-4 transform -rotate-2">
                🎮 The Ultimate Math Arena
              </span>
              <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 leading-tight">
                Eliminate Math Anxiety.<br/>
                <span className="text-cyan-500">Accelerate Mental Speed!</span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-800 max-w-2xl mx-auto font-bold leading-relaxed">
                Jesse Rock Math is a gamified educational platform designed to make math practice super fun! Live multiplayer duels and zero-lag performance!
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
                <button 
                  onClick={() => setShowLanding(false)}
                  className="px-10 py-5 bg-pink-500 hover:bg-pink-400 text-white font-black rounded-3xl text-xl uppercase tracking-wider transform hover:scale-105 active:scale-95 transition-all shadow-[6px_6px_0_0_#0f172a] border-4 border-slate-900 flex items-center justify-center gap-3"
                >
                  <Zap size={28} /> Start Playing Now!
                </button>
                <button 
                  onClick={() => setShowLanding(false)}
                  className="px-10 py-5 bg-white hover:bg-slate-100 text-slate-900 font-black rounded-3xl text-xl uppercase tracking-wider transform hover:scale-105 active:scale-95 transition-all shadow-[6px_6px_0_0_#0f172a] border-4 border-slate-900 flex items-center justify-center gap-3"
                >
                  <User size={28} /> Login / Sign Up
                </button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="grid md:grid-cols-3 gap-8 w-full max-w-5xl mt-16 text-left">
              <div className="bg-white border-4 border-slate-900 p-8 rounded-3xl space-y-4 shadow-[8px_8px_0_0_#0f172a] transform hover:-translate-y-2 transition-transform">
                <div className="w-16 h-16 bg-rose-400 rounded-2xl flex items-center justify-center border-4 border-slate-900 shadow-[4px_4px_0_0_#0f172a]">
                  <ShieldAlert className="text-white" size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-900">The Problem</h3>
                <p className="text-slate-700 text-base font-bold">Most math apps are slow, track your data, or only focus on one subject. Kids get bored quickly and the fear of math remains.</p>
              </div>
              
              <div className="bg-cyan-300 border-4 border-slate-900 p-8 rounded-3xl space-y-4 shadow-[8px_8px_0_0_#0f172a] transform hover:-translate-y-2 transition-transform">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border-4 border-slate-900 shadow-[4px_4px_0_0_#0f172a]">
                  <Sparkles className="text-cyan-500" size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-900">Our Solution</h3>
                <p className="text-slate-800 text-base font-bold">A zero-lag, vibrant arena covering arithmetic to algebra! Fast-paced, competitive, and designed to turn hesitation into instant reflex.</p>
              </div>
              
              <div className="bg-white border-4 border-slate-900 p-8 rounded-3xl space-y-4 shadow-[8px_8px_0_0_#0f172a] transform hover:-translate-y-2 transition-transform">
                <div className="w-16 h-16 bg-emerald-400 rounded-2xl flex items-center justify-center border-4 border-slate-900 shadow-[4px_4px_0_0_#0f172a]">
                  <ShieldCheck className="text-white" size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-900">Safe & Secure</h3>
                <p className="text-slate-700 text-base font-bold">100% COPPA-compliant. No tracking cookies, no creepy ads, and automated filters block bad words. Built for schools.</p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="w-full max-w-5xl mt-16 text-left border-t-8 border-slate-900 pt-16">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-black text-slate-900">Why Jesse Rock Math?</h2>
                <p className="text-slate-800 mt-4 max-w-2xl mx-auto font-bold text-xl">We've reimagined how math is taught. Discover the awesome features!</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="flex gap-4 bg-white p-6 rounded-3xl border-4 border-slate-900 shadow-[6px_6px_0_0_#0f172a]">
                  <div className="w-16 h-16 shrink-0 bg-blue-400 rounded-2xl flex items-center justify-center border-4 border-slate-900 shadow-[4px_4px_0_0_#0f172a]">
                    <TrendingUp className="text-white" size={32} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-slate-900 mb-2">Adaptive Learning Engine</h4>
                    <p className="text-slate-700 text-sm font-bold">Our intelligent system dynamically adjusts the difficulty based on real-time performance. Never too easy, never too hard!</p>
                  </div>
                </div>

                <div className="flex gap-4 bg-white p-6 rounded-3xl border-4 border-slate-900 shadow-[6px_6px_0_0_#0f172a]">
                  <div className="w-16 h-16 shrink-0 bg-purple-400 rounded-2xl flex items-center justify-center border-4 border-slate-900 shadow-[4px_4px_0_0_#0f172a]">
                    <Globe className="text-white" size={32} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-slate-900 mb-2">Global Leaderboards</h4>
                    <p className="text-slate-700 text-sm font-bold">Compete safely with students worldwide. Turn practice into an exciting challenge!</p>
                  </div>
                </div>

                <div className="flex gap-4 bg-white p-6 rounded-3xl border-4 border-slate-900 shadow-[6px_6px_0_0_#0f172a]">
                  <div className="w-16 h-16 shrink-0 bg-pink-400 rounded-2xl flex items-center justify-center border-4 border-slate-900 shadow-[4px_4px_0_0_#0f172a]">
                    <GraduationCap className="text-white" size={32} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-slate-900 mb-2">Teacher & Classroom Ready</h4>
                    <p className="text-slate-700 text-sm font-bold">Educators can easily manage rosters, assign specific topics, and monitor live progress metrics.</p>
                  </div>
                </div>

                <div className="flex gap-4 bg-white p-6 rounded-3xl border-4 border-slate-900 shadow-[6px_6px_0_0_#0f172a]">
                  <div className="w-16 h-16 shrink-0 bg-amber-400 rounded-2xl flex items-center justify-center border-4 border-slate-900 shadow-[4px_4px_0_0_#0f172a]">
                    <Award className="text-white" size={32} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-slate-900 mb-2">Grand Master Certification</h4>
                    <p className="text-slate-700 text-sm font-bold">Students who solve 200 questions earn an official printable certificate to celebrate their math milestone!</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-20 text-center pb-20">
                <h2 className="text-4xl font-black text-slate-900 mb-8 transform -rotate-1">Ready to Rock? 🎸</h2>
                <button 
                  onClick={() => setShowLanding(false)}
                  className="px-12 py-6 bg-cyan-400 hover:bg-cyan-300 text-slate-900 font-black rounded-3xl text-2xl uppercase tracking-widest transform hover:scale-105 active:scale-95 transition-all shadow-[8px_8px_0_0_#0f172a] border-4 border-slate-900"
                >
                  Enter The Arena!
                </button>
              </div>
            </motion.div>
         </div>
      </div>
    );
  }
"""

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + new_landing + content[end_idx:]
    with open('src/components/AuthGate.tsx', 'w') as f:
        f.write(content)
    print("Patched successfully")
else:
    print("Not found")


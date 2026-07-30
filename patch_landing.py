import re

with open('src/components/AuthGate.tsx', 'r') as f:
    content = f.read()

# 1. Add state showLanding
state_hook = "  const [loginTab, setLoginTab] = useState<'individual' | 'teacher'>('individual');\n  const [showLanding, setShowLanding] = useState(true);"
content = content.replace("  const [loginTab, setLoginTab] = useState<'individual' | 'teacher'>('individual');", state_hook)

# 2. Add marketing landing page before the main return
landing_component = """
  if (showLanding) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-purple-900 via-indigo-950 to-pink-900 text-slate-100 overflow-y-auto font-sans relative">
         <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
         <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
         
         <div className="max-w-6xl mx-auto px-6 py-12 md:py-20 relative z-10 flex flex-col items-center text-center space-y-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-4xl">
              <span className="px-4 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-sm font-bold uppercase tracking-widest inline-block mb-2">The Ultimate Math Arena</span>
              <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white drop-shadow-lg leading-tight">
                Eliminate Math Anxiety.<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-500">Accelerate Mental Speed.</span>
              </h1>
              <p className="text-lg md:text-xl text-indigo-200 max-w-2xl mx-auto font-medium leading-relaxed">
                Jesse Rock Math is a gamified, full-stack educational platform designed to make math practice addictive. Say goodbye to boring drills and hello to live multiplayer duels, zero-lag performance, and an adaptive learning curve.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                <button 
                  onClick={() => setShowLanding(false)}
                  className="px-8 py-4 bg-amber-400 hover:bg-amber-300 text-deep-navy font-black rounded-2xl text-lg uppercase tracking-wider transform hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(251,191,36,0.4)] flex items-center justify-center gap-2"
                >
                  <Zap size={20} /> Start Playing Now
                </button>
                <button 
                  onClick={() => setShowLanding(false)}
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-black rounded-2xl text-lg uppercase tracking-wider backdrop-blur-md border border-white/20 transform hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <User size={20} /> Login / Sign Up
                </button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="grid md:grid-cols-3 gap-6 w-full max-w-5xl mt-12 text-left">
              <div className="bg-white/10 backdrop-blur-lg border border-white/10 p-8 rounded-3xl space-y-4 shadow-xl">
                <div className="w-12 h-12 bg-rose-500/20 rounded-2xl flex items-center justify-center border border-rose-500/30">
                  <ShieldAlert className="text-rose-400" size={24} />
                </div>
                <h3 className="text-xl font-bold text-white">The Problem</h3>
                <p className="text-indigo-200 text-sm leading-relaxed font-medium">Most math apps are slow, track your data, or only focus on one subject (like times tables). Kids get bored quickly and the fear of math remains.</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-lg border border-white/10 p-8 rounded-3xl space-y-4 shadow-xl relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-cyan-500/20 rounded-full blur-2xl" />
                <div className="w-12 h-12 bg-cyan-500/20 rounded-2xl flex items-center justify-center border border-cyan-500/30">
                  <Sparkles className="text-cyan-400" size={24} />
                </div>
                <h3 className="text-xl font-bold text-white">Our Solution</h3>
                <p className="text-indigo-200 text-sm leading-relaxed font-medium">A zero-lag, vibrant arena covering arithmetic to algebra. Fast-paced, competitive, and designed to turn hesitation into instant reflex.</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-lg border border-white/10 p-8 rounded-3xl space-y-4 shadow-xl">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30">
                  <ShieldCheck className="text-emerald-400" size={24} />
                </div>
                <h3 className="text-xl font-bold text-white">Safe & Secure</h3>
                <p className="text-indigo-200 text-sm leading-relaxed font-medium">100% COPPA-compliant. No tracking cookies, no creepy ads, and automated filters block all inappropriate names. Built for schools.</p>
              </div>
            </motion.div>
         </div>
      </div>
    );
  }
"""

content = content.replace("  return (\n    <div className=\"min-h-screen flex flex-col items-center", landing_component + "\n  return (\n    <div className=\"min-h-screen flex flex-col items-center")

with open('src/components/AuthGate.tsx', 'w') as f:
    f.write(content)

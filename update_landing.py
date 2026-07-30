import re

with open('src/components/AuthGate.tsx', 'r') as f:
    content = f.read()

start_idx = content.find("  if (showLanding) {")
end_idx = content.find("  return (\n    <div className=\"min-h-screen flex flex-col items-center justify-between", start_idx + 1)

new_landing = """  if (showLanding) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 overflow-y-auto font-sans relative">
        {/* Crisp mathematical coordinate grids */}
        <div 
          className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
          style={{ 
            backgroundImage: `
              linear-gradient(to right, #334155 1px, transparent 1px),
              linear-gradient(to bottom, #334155 1px, transparent 1px)
            `, 
            backgroundSize: '40px 40px' 
          }}
        />
        {/* Geometric equations layered subtly */}
        <div className="absolute top-20 right-20 z-0 opacity-5 pointer-events-none font-mono text-4xl select-none">
          ∑(x² + y²) = r²
        </div>
        <div className="absolute bottom-40 left-20 z-0 opacity-5 pointer-events-none font-mono text-4xl select-none">
          ∫ e^x dx = e^x + C
        </div>
        <div className="absolute top-1/2 left-1/3 z-0 opacity-5 pointer-events-none font-mono text-3xl select-none transform rotate-45">
          f'(x) = lim(h→0) [f(x+h) - f(x)] / h
        </div>
        
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 relative z-10">
          
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Asymmetric Grid & Typography */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="lg:col-span-7 space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-slate-800 bg-slate-900 rounded text-xs font-semibold uppercase tracking-widest text-slate-400">
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
                Jesse Math Rockstar
              </div>
              
              <h1 className="text-5xl md:text-7xl font-light tracking-tight text-white leading-[1.1]">
                Master mathematics.<br/>
                <span className="font-bold text-cyan-400">Zero hesitation.</span>
              </h1>
              
              <p className="text-lg md:text-xl text-slate-400 max-w-xl font-normal leading-relaxed">
                An elite educational platform engineered for mental acceleration. Replace anxiety with instant reflex through high-performance, live multiplayer calculation arenas.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                <button 
                  onClick={() => setShowLanding(false)}
                  className="w-full sm:w-auto px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded text-sm uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                >
                  <Zap size={18} /> Initialize Arena
                </button>
                <button 
                  onClick={() => setShowLanding(false)}
                  className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded text-sm uppercase tracking-widest border border-slate-700 transition-colors flex items-center justify-center gap-2"
                >
                  <User size={18} /> Authenticate
                </button>
              </div>
            </motion.div>

            {/* Right Column: Visual representation (SaaS dashboard interface trend) */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="lg:col-span-5 relative"
            >
              <div className="border border-slate-800 bg-slate-900/50 p-6 rounded-lg relative overflow-hidden backdrop-blur-sm">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                  <div className="text-xs font-mono text-slate-400">SYSTEM_STATUS</div>
                  <div className="text-xs font-mono text-cyan-400">OPTIMAL</div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="text-cyan-500" size={16} />
                      <span className="text-sm font-medium text-slate-300">Adaptive Engine</span>
                    </div>
                    <span className="text-xs font-mono text-slate-500">ACTIVE</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded">
                    <div className="flex items-center gap-3">
                      <Globe className="text-cyan-500" size={16} />
                      <span className="text-sm font-medium text-slate-300">Global Network</span>
                    </div>
                    <span className="text-xs font-mono text-slate-500">12ms LATENCY</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="text-cyan-500" size={16} />
                      <span className="text-sm font-medium text-slate-300">COPPA Shield</span>
                    </div>
                    <span className="text-xs font-mono text-slate-500">VERIFIED</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            className="mt-32 pt-16 border-t border-slate-800"
          >
            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="w-10 h-10 bg-slate-900 border border-slate-700 flex items-center justify-center rounded">
                  <Database className="text-cyan-400" size={20} />
                </div>
                <h3 className="text-lg font-semibold text-white">Absolute Precision</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Engineered with strict algorithmic bounds. Every problem set is dynamically generated for perfect difficulty scaling without repetitive fatigue.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="w-10 h-10 bg-slate-900 border border-slate-700 flex items-center justify-center rounded">
                  <Terminal className="text-cyan-400" size={20} />
                </div>
                <h3 className="text-lg font-semibold text-white">Zero Latency Architecture</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Built on a modern stack ensuring immediate input validation and real-time multiplayer synchronization. No lag, just pure mental speed.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="w-10 h-10 bg-slate-900 border border-slate-700 flex items-center justify-center rounded">
                  <Award className="text-cyan-400" size={20} />
                </div>
                <h3 className="text-lg font-semibold text-white">Quantifiable Mastery</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Transparent metrics and verified progression. Achieve Grand Master certification backed by rigorous, time-bound testing parameters.
                </p>
              </div>
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


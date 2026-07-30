import re

with open('src/components/AuthGate.tsx', 'r') as f:
    content = f.read()

cta = """
              <div className="mt-16 text-center border-t border-white/10 pt-12">
                <h2 className="text-3xl font-black text-white mb-6">Ready to Transform Your Math Skills?</h2>
                <button 
                  onClick={() => setShowLanding(false)}
                  className="px-10 py-4 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-deep-navy font-black rounded-2xl text-xl uppercase tracking-widest transform hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                >
                  Enter The Arena
                </button>
              </div>
"""

content = content.replace("              </div>\n            </motion.div>\n         </div>\n      </div>", "              </div>\n" + cta + "            </motion.div>\n         </div>\n      </div>")

with open('src/components/AuthGate.tsx', 'w') as f:
    f.write(content)

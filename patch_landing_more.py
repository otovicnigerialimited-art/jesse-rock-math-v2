import re

with open('src/components/AuthGate.tsx', 'r') as f:
    content = f.read()

additional_info = """
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="w-full max-w-5xl mt-16 text-left border-t border-white/10 pt-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-black text-white">Why Jesse Rock Math?</h2>
                <p className="text-indigo-200 mt-4 max-w-2xl mx-auto font-medium">We've reimagined how math is taught. Discover the unique features that make our platform the best choice for students and teachers alike.</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="flex gap-4">
                  <div className="w-12 h-12 shrink-0 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
                    <TrendingUp className="text-blue-400" size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-2">Adaptive Learning Engine</h4>
                    <p className="text-indigo-200 text-sm leading-relaxed font-medium">Our intelligent system dynamically adjusts the difficulty based on real-time performance. Never too easy to be boring, never too hard to be frustrating.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 shrink-0 bg-purple-500/20 rounded-2xl flex items-center justify-center border border-purple-500/30">
                    <Globe className="text-purple-400" size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-2">Global Leaderboards</h4>
                    <p className="text-indigo-200 text-sm leading-relaxed font-medium">Compete safely with students worldwide. Our moderated leaderboards reward accuracy and consistency, turning practice into an exciting challenge.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 shrink-0 bg-pink-500/20 rounded-2xl flex items-center justify-center border border-pink-500/30">
                    <GraduationCap className="text-pink-400" size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-2">Teacher & Classroom Ready</h4>
                    <p className="text-indigo-200 text-sm leading-relaxed font-medium">Educators can easily manage rosters, assign specific topics, and monitor live progress metrics. The ultimate zero-friction tool for math labs.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 shrink-0 bg-amber-500/20 rounded-2xl flex items-center justify-center border border-amber-500/30">
                    <Award className="text-amber-400" size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-2">Grand Master Certification</h4>
                    <p className="text-indigo-200 text-sm leading-relaxed font-medium">Students who solve 200 questions earn an official, high-resolution printable certificate to celebrate their mathematical milestone.</p>
                  </div>
                </div>
              </div>
            </motion.div>
"""

content = content.replace("            </motion.div>\n         </div>\n      </div>", additional_info + "            </motion.div>\n         </div>\n      </div>")

with open('src/components/AuthGate.tsx', 'w') as f:
    f.write(content)

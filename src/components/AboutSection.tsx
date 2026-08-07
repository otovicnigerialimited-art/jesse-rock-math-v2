import React from 'react';
import { motion } from 'motion/react';
import { Target, Sparkles, BookOpen, Trophy, ShieldCheck, Zap } from 'lucide-react';

export default function AboutSection() {
  return (
    <section className="space-y-12 py-12 border-t border-deep-navy/10">
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <h2 className="text-3xl md:text-5xl font-display font-black text-deep-navy uppercase tracking-tighter">
          About the <span className="text-brand-primary">Jesse Rock Academy</span>
        </h2>
        <p className="text-lg text-slate-700 font-bold max-w-2xl mx-auto leading-relaxed">
          Founded by 11-year-old innovator Jesse Otobo, we are on a mission to eliminate math anxiety through the power of competitive play and high-octane engineering.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <AboutCard 
          icon={<Zap className="text-brand-primary" />}
          title="The Pedagogy"
          description="We use 'Vibe Coding' architecture to deliver sub-100ms response times. This enables a flow state where students solve 3x more problems than traditional platforms."
        />
        <AboutCard 
          icon={<ShieldCheck className="text-emerald-500" />}
          title="Safe by Design"
          description="100% COPPA compliant. We use anonymous device identifiers and positive-only emoji interactions. No tracking cookies, no ads, no distractions."
        />
        <AboutCard 
          icon={<Target className="text-brand-secondary" />}
          title="Adaptive Engine"
          description="Our 'Confidence Reset' logic detects frustration in real-time. If you break a streak, the engine instantly dials down difficulty to help you rebuild momentum."
        />
      </div>

      <div className="glass p-8 md:p-12 rounded-[3rem] bg-gradient-to-br from-indigo-600/5 to-brand-primary/10 border-2 border-deep-navy space-y-6">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-deep-navy shrink-0 shadow-xl rotate-3">
            <img src="/logo.jpg" alt="Jesse Otobo" className="w-full h-full object-cover" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-deep-navy uppercase tracking-tight">The Vision of Jesse Otobo</h3>
            <p className="text-sm text-slate-700 font-semibold leading-relaxed">
              "I built Jesse Rock Math because I wanted a place where my friends and I could play math like a rock concert. Most math apps are slow and feel like homework. In the Arena, math feels like a sport. We are young genius, and our goal is to show the world that math isn't scary—it's empowering."
            </p>
            <div className="flex gap-4 pt-2">
               <div className="text-[10px] font-black bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full border border-brand-primary/20">FOUNDER & CEO</div>
               <div className="text-[10px] font-black bg-indigo-500/10 text-indigo-600 px-3 py-1 rounded-full border border-indigo-500/20">11 YEARS OLD</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-8 rounded-[2rem] bg-white border border-deep-navy border-4 space-y-4 shadow-xl"
    >
      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border-2 border-deep-navy shadow-sm">
        {icon}
      </div>
      <h3 className="text-xl font-black text-deep-navy uppercase tracking-tight">{title}</h3>
      <p className="text-xs text-slate-600 font-bold leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}

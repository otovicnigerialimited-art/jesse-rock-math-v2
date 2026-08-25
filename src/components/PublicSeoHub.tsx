import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Users, School, ShieldCheck, Award, Sparkles, ExternalLink } from 'lucide-react';

export default function PublicSeoHub() {
  return (
    <div className="space-y-12 py-8 max-w-5xl mx-auto px-4 select-none">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border-2 border-amber-500/30 rounded-full text-xs font-black uppercase text-amber-700 tracking-wider">
          <Sparkles size={14} /> Public Educator & Scholar Knowledge Hub
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-black text-deep-navy tracking-tight">
          Jesse Rock Math: Public <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Curriculum & Lobby Index</span>
        </h1>
        <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Welcome to the public architectural and curriculum index for Jesse Rock Math. Designed for primary school teachers, school district administrators, parents, and young scholars to explore our multiplayer math platform and educational standards.
        </p>
      </div>

      {/* Grid of Indexable Public Portals */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Teacher Classroom Management & Lobbies */}
        <div className="bg-white border-4 border-slate-200 rounded-[2.5rem] p-8 shadow-xl space-y-4 hover:border-amber-500 transition-all">
          <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600 text-2xl font-black">
            👩‍🏫
          </div>
          <h2 className="text-2xl font-display font-black text-deep-navy">Teacher Classroom Management & Lobbies</h2>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
            Our teacher portal provides educators with secure classroom lobby creation, student roster monitoring, automated homework assignment dispatching, and real-time misconception analysis. 
          </p>
          <ul className="space-y-2 text-xs font-bold text-slate-700">
            <li className="flex items-center gap-2">✅ Secure Class Roster & Access Codes</li>
            <li className="flex items-center gap-2">✅ Real-Time Student Speed & Accuracy Tracking</li>
            <li className="flex items-center gap-2">✅ Automated Homework Dispatch & Exit Tickets</li>
          </ul>
        </div>

        {/* School District EdTech Platform */}
        <div className="bg-white border-4 border-slate-200 rounded-[2.5rem] p-8 shadow-xl space-y-4 hover:border-violet-500 transition-all">
          <div className="w-14 h-14 bg-violet-500/10 rounded-2xl flex items-center justify-center text-violet-600 text-2xl font-black">
            🏫
          </div>
          <h2 className="text-2xl font-display font-black text-deep-navy">School District EdTech & Curriculum Engine</h2>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
            Built for primary and elementary schools looking for zero-lag, browser-native math speed drill solutions aligned with national curriculum standards and KS2/Common Core requirements.
          </p>
          <ul className="space-y-2 text-xs font-bold text-slate-700">
            <li className="flex items-center gap-2">✅ Zero-Lag HTML5 / WebAssembly Performance</li>
            <li className="flex items-center gap-2">✅ COPPA & GDPR-K Privacy Compliant</li>
            <li className="flex items-center gap-2">✅ Multi-Device Support (Chromebooks, iPads, PC/Mac)</li>
          </ul>
        </div>

        {/* Parent Progress Tracker */}
        <div className="bg-white border-4 border-slate-200 rounded-[2.5rem] p-8 shadow-xl space-y-4 hover:border-emerald-500 transition-all">
          <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 text-2xl font-black">
            👨‍👩‍👦
          </div>
          <h2 className="text-2xl font-display font-black text-deep-navy">Parent Progress Tracking & Homeschool Drills</h2>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
            Parents can monitor weekly milestone reports, encourage daily times table streaks, and support homework mastery through interactive arcade practice and tailored multiplication drills.
          </p>
          <ul className="space-y-2 text-xs font-bold text-slate-700">
            <li className="flex items-center gap-2">✅ Weekly Milestone Email Summaries</li>
            <li className="flex items-center gap-2">✅ Custom Difficulty & Multiplication Tables Selection</li>
            <li className="flex items-center gap-2">✅ Safe, Distraction-Free Learning Environment</li>
          </ul>
        </div>

        {/* Kids Multiplayer Arena */}
        <div className="bg-white border-4 border-slate-200 rounded-[2.5rem] p-8 shadow-xl space-y-4 hover:border-rose-500 transition-all">
          <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-600 text-2xl font-black">
            🎮
          </div>
          <h2 className="text-2xl font-display font-black text-deep-navy">Kids Multiplayer Math Game & Speed Drills</h2>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
            Engage children with rockstar-themed avatars, tactile on-screen keypads, streak multipliers, and exciting 1v1 multiplayer math duels that make learning multiplication tables thrilling.
          </p>
          <ul className="space-y-2 text-xs font-bold text-slate-700">
            <li className="flex items-center gap-2">✅ 1v1 Live Multiplayer Battles</li>
            <li className="flex items-center gap-2">✅ Unlockable Rockstar Badges & Trophies</li>
            <li className="flex items-center gap-2">✅ Arcade Keypad & Sound Effects</li>
          </ul>
        </div>
      </div>

      {/* Authoritative Outbound Standards & References (Solving Zero Backlink / Authority Warning) */}
      <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 md:p-12 space-y-6 shadow-2xl border-4 border-amber-500/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-400 font-black">
            📚
          </div>
          <div>
            <h3 className="text-xl font-display font-black">Authoritative Educational Standards & Compliance</h3>
            <p className="text-xs text-slate-400">Our commitment to open educational standards and student data privacy.</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-bold">
          <a 
            href="https://schema.org" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl border border-slate-700 flex items-center justify-between transition-all group"
          >
            <span>Schema.org Standards</span>
            <ExternalLink size={14} className="text-amber-400 group-hover:scale-110 transition-transform" />
          </a>
          <a 
            href="https://www.ftc.gov/legal-library/browse/rules/childrens-online-privacy-protection-rule-coppa" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl border border-slate-700 flex items-center justify-between transition-all group"
          >
            <span>COPPA Privacy (FTC)</span>
            <ExternalLink size={14} className="text-amber-400 group-hover:scale-110 transition-transform" />
          </a>
          <a 
            href="https://www.w3.org/WAI/standards-guidelines/wcag/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl border border-slate-700 flex items-center justify-between transition-all group"
          >
            <span>W3C WCAG Accessibility</span>
            <ExternalLink size={14} className="text-amber-400 group-hover:scale-110 transition-transform" />
          </a>
          <a 
            href="https://www.nctm.org" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl border border-slate-700 flex items-center justify-between transition-all group"
          >
            <span>NCTM Math Standards</span>
            <ExternalLink size={14} className="text-amber-400 group-hover:scale-110 transition-transform" />
          </a>
        </div>
      </div>
    </div>
  );
}

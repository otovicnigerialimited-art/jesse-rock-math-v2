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

      {/* YOUTUBE PROMO VIDEO AD SPLITLIGHT */}
      <div className="bg-slate-950 border-4 border-amber-400 rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="text-center space-y-4 mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-500/20 border border-amber-500/40 rounded-full text-xs font-black uppercase text-amber-400 tracking-wider">
            🎬 Featured Promo Trailer
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-black text-white">
            See Jesse Rock Math in Action!
          </h2>
          <p className="text-xs md:text-sm text-slate-300 max-w-xl mx-auto">
            Discover how we turn times tables, mental calculation drills, and 1v1 multiplayer arenas into a legendary rockstar journey.
          </p>
        </div>
        <div className="aspect-video w-full max-w-3xl mx-auto rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-800 bg-black">
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/kBjfLeranG4"
            title="Jesse Rock Math Promo Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>
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

        {/* Kids Multiplayer Arena & Gig Modes */}
        <div className="bg-white border-4 border-slate-200 rounded-[2.5rem] p-8 shadow-xl space-y-4 hover:border-rose-500 transition-all">
          <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-600 text-2xl font-black">
            🎸
          </div>
          <h2 className="text-2xl font-display font-black text-deep-navy">Kids Multiplayer Arena & Rockstar Gig Modes</h2>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
            Engage children with rockstar-themed avatars, tactile on-screen keypads, streak multipliers, immersive Gig progression career modes, and exciting 1v1 multiplayer math duels that make learning multiplication tables thrilling.
          </p>
          <ul className="space-y-2 text-xs font-bold text-slate-700">
            <li className="flex items-center gap-2">✅ 1v1 Live Multiplayer Battles & Arena Duels</li>
            <li className="flex items-center gap-2">✅ Career Gig Progression & Stage Tours</li>
            <li className="flex items-center gap-2">✅ Unlockable Rockstar Badges & Trophies</li>
          </ul>
        </div>

        {/* Reward Systems & Coin Shop */}
        <div className="bg-white border-4 border-slate-200 rounded-[2.5rem] p-8 shadow-xl space-y-4 hover:border-amber-500 transition-all">
          <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600 text-2xl font-black">
            🪙
          </div>
          <h2 className="text-2xl font-display font-black text-deep-navy">Reward Systems, Coin Shop & Daily Streaks</h2>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
            Our gamified economy rewards students with coins, XP, and collectible avatar items in the Rock Shop as they maintain daily practice streaks and solve arithmetic challenges correctly.
          </p>
          <ul className="space-y-2 text-xs font-bold text-slate-700">
            <li className="flex items-center gap-2">✅ Coin Shop & Avatar Customization</li>
            <li className="flex items-center gap-2">✅ Daily Practice Streaks & XP Multipliers</li>
            <li className="flex items-center gap-2">✅ Mystery Box Rewards & Milestone Trophies</li>
          </ul>
        </div>

        {/* SATs Revision & Hub */}
        <div className="bg-white border-4 border-slate-200 rounded-[2.5rem] p-8 shadow-xl space-y-4 hover:border-violet-500 transition-all">
          <div className="w-14 h-14 bg-violet-500/10 rounded-2xl flex items-center justify-center text-violet-600 text-2xl font-black">
            📝
          </div>
          <h2 className="text-2xl font-display font-black text-deep-navy">SATs Revision Hub & Advanced Curriculum</h2>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
            Targeted preparation modules covering National Curriculum KS1 & KS2 SATs math papers, arithmetic practice, reasoning tests, and structured learning hubs for exam success.
          </p>
          <ul className="space-y-2 text-xs font-bold text-slate-700">
            <li className="flex items-center gap-2">✅ KS1 & KS2 SATs Practice Papers</li>
            <li className="flex items-center gap-2">✅ Timed Arithmetic & Reasoning Drills</li>
            <li className="flex items-center gap-2">✅ Spaced Repetition & Misconception Analysis</li>
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

      {/* FAQ Section for SEO and Users */}
      <div className="bg-white border-4 border-slate-200 rounded-[2.5rem] p-8 md:p-12 space-y-8 shadow-xl">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border-2 border-amber-500/30 rounded-full text-xs font-black uppercase text-amber-700 tracking-wider">
            ❓ Frequently Asked Questions
          </div>
          <h2 className="text-3xl font-display font-black text-deep-navy">Everything You Need to Know About Jesse Rock Math</h2>
          <p className="text-xs md:text-sm text-slate-600 max-w-xl mx-auto">
            Clear answers for teachers, school administrators, parents, and young rockstar students.
          </p>
        </div>

        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl space-y-2">
            <h3 className="text-base font-black text-deep-navy">What is Jesse Rock Math?</h3>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
              Jesse Rock Math is a zero-lag interactive EdTech math learning platform and game engine designed for primary and elementary schools, teachers, parents, and students. It features 1v1 multiplayer math arenas, gig progression career modes, unlockable reward systems, coin shops, daily streaks, and KS1/KS2 SATs revision hubs.
            </p>
          </div>

          <div className="p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl space-y-2">
            <h3 className="text-base font-black text-deep-navy">Is Jesse Rock Math free for teachers and classrooms?</h3>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
              Yes! Teachers can create secure classroom lobbies, generate student access codes, assign homework, and monitor real-time speed and accuracy analytics completely free of charge.
            </p>
          </div>

          <div className="p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl space-y-2">
            <h3 className="text-base font-black text-deep-navy">How does the Multiplayer Arena work?</h3>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
              The Multiplayer Arena enables students to engage in live 1v1 math duels with zero-lag synchronization. Registered players race against opponents while solving multiplication and arithmetic problems to climb the leaderboard.
            </p>
          </div>

          <div className="p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl space-y-2">
            <h3 className="text-base font-black text-deep-navy">Can parents track their child's math progress?</h3>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
              Yes, parents have access to progress trackers, weekly milestone email summaries, and customizable practice drills to support homework mastery at home.
            </p>
          </div>

          <div className="p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl space-y-2">
            <h3 className="text-base font-black text-deep-navy">Is Jesse Rock Math COPPA and GDPR-K compliant?</h3>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
              Absolutely. Jesse Rock Math adheres strictly to child data privacy standards, offering secure guest modes and protected student accounts without unauthorized data sharing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

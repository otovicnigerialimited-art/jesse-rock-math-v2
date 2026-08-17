import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ShieldCheck, Zap, Heart, GraduationCap, Trophy, Users, Target, Rocket } from 'lucide-react';

export default function AboutSection() {
  return (
    <section className="space-y-10 py-12 border-t border-deep-navy/10">
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-violet-100 border border-violet-200 rounded-full text-xs font-black text-violet-800 uppercase tracking-widest">
          <Sparkles size={13} className="text-amber-500" /> Story, Purpose & Vision
        </div>
        <h2 className="text-3xl md:text-4xl font-display font-black text-deep-navy tracking-tight">
          About Jesse Math Rockstar
        </h2>
        <p className="text-sm md:text-base text-slate-700 font-medium leading-relaxed">
          Created to make math practice engaging, interactive, and rewarding for students everywhere.
        </p>
      </div>

      {/* The Story / Creator Highlight Card */}
      <div className="p-8 md:p-10 rounded-[2.5rem] bg-gradient-to-br from-violet-600 via-indigo-700 to-slate-900 text-white border-4 border-deep-navy shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="w-24 h-24 rounded-3xl bg-white/10 border-2 border-white/20 p-2 shrink-0 backdrop-blur-md shadow-inner flex items-center justify-center">
            <img src="/logo.png" alt="Jesse Math Rockstar Logo" className="w-full h-full object-contain rounded-2xl" />
          </div>

          <div className="space-y-3 text-center md:text-left">
            <span className="px-3 py-1 bg-amber-400 text-slate-950 font-black text-[10px] uppercase rounded-full tracking-wider inline-block">
              Created by Jesse Otobo
            </span>
            <h3 className="text-2xl md:text-3xl font-display font-black tracking-tight">
              The Story Behind the Platform
            </h3>
            <p className="text-sm md:text-base text-slate-200 font-medium leading-relaxed">
              Jesse Math Rockstar was created by Jesse Otobo, an 11-year-old developer who wanted to transform daily math practice from repetitive homework into an exciting game. Seeing classmates struggle with math anxiety inspired the idea of an interactive space where solving equations earns rewards, unlocks avatar gear, and fosters friendly competition.
            </p>
          </div>
        </div>
      </div>

      {/* Mission & Vision Statements */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-7 rounded-3xl bg-white border-4 border-deep-navy space-y-3 shadow-md">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 font-black">
            <Target size={20} />
          </div>
          <h3 className="text-lg font-black text-deep-navy">Our Core Mission</h3>
          <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed">
            To help students build mental calculation speed, math fluency, and consistent practice habits through positive reinforcement, gamified feedback, and interactive challenges.
          </p>
        </div>

        <div className="p-7 rounded-3xl bg-white border-4 border-deep-navy space-y-3 shadow-md">
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 border border-indigo-300 flex items-center justify-center text-indigo-700 font-black">
            <Rocket size={20} />
          </div>
          <h3 className="text-lg font-black text-deep-navy">The Vision</h3>
          <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed">
            To create an educational platform where math isn't feared, but celebrated—giving every student the tools to practice at their own pace, gain confidence, and feel like a math rockstar.
          </p>
        </div>
      </div>

      {/* Experience Pillars / What Makes It Unique */}
      <div className="space-y-4">
        <div className="text-center space-y-1">
          <h3 className="text-xl font-black text-deep-navy">Designed for Student Engagement</h3>
          <p className="text-xs text-slate-600 font-medium">Focused entirely on a positive, motivating user experience.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <PillarCard 
            icon={<Zap className="text-amber-500" />}
            title="Gamified Practice"
            description="Earn XP, maintain daily streaks, and level up your status as accuracy improves over time."
          />
          <PillarCard 
            icon={<Users className="text-indigo-600" />}
            title="Multiplayer Battles"
            description="Compete in real-time speed duels against peers on global and classroom leaderboards."
          />
          <PillarCard 
            icon={<GraduationCap className="text-emerald-600" />}
            title="Curriculum Topics"
            description="Covers essential topics from basic addition to fractions, decimals, algebra, and geometry."
          />
          <PillarCard 
            icon={<ShieldCheck className="text-violet-600" />}
            title="Safe & Ad-Free"
            description="A focused environment with student privacy controls and zero intrusive advertisements."
          />
        </div>
      </div>

      {/* Educator & Parent Reassurance */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-50 border-2 border-deep-navy/20 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <h4 className="text-base font-black text-deep-navy flex items-center justify-center md:justify-start gap-2">
            <Heart size={18} className="text-rose-500" /> Free for Students & Classrooms
          </h4>
          <p className="text-xs text-slate-600 font-medium max-w-xl">
            Jesse Math Rockstar is completely free to use for students, parents, and teachers with no subscriptions or paywalls.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="px-4 py-2 bg-white border-2 border-deep-navy/20 text-deep-navy font-black text-xs rounded-xl shadow-sm">
            Student Safe
          </span>
          <span className="px-4 py-2 bg-indigo-600 text-white font-black text-xs rounded-xl shadow-sm">
            Classroom Ready
          </span>
        </div>
      </div>
    </section>
  );
}

function PillarCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -3 }}
      className="p-5 rounded-2xl bg-white border-2 border-deep-navy/20 space-y-2 shadow-sm"
    >
      <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200">
        {icon}
      </div>
      <h4 className="text-sm font-black text-deep-navy">{title}</h4>
      <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}

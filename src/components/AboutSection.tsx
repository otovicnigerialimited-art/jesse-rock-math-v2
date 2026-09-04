import React from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Heart, 
  GraduationCap, 
  Trophy, 
  Users, 
  Target, 
  Rocket, 
  Lock, 
  Compass, 
  BookOpen, 
  CheckCircle2, 
  Flame, 
  LayoutDashboard, 
  UserCheck, 
  BarChart3, 
  Clock, 
  FileText,
  School
} from 'lucide-react';

export default function AboutSection() {
  return (
    <section className="space-y-12 py-12 border-t border-deep-navy/10">
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-violet-100 border border-violet-200 rounded-full text-xs font-black text-violet-800 uppercase tracking-widest">
          <Sparkles size={13} className="text-amber-500" /> Platform Architecture & Curriculum Overview
        </div>
        <h2 className="text-3xl md:text-5xl font-display font-black text-deep-navy tracking-tight">
          About Jesse Math FC
        </h2>
        <p className="text-sm md:text-base text-slate-700 font-medium leading-relaxed">
          An enterprise-grade, gamified math learning ecosystem built for students, teachers, and parents—featuring age-appropriate learning hubs, standardized exam preparation, and classroom analytics.
        </p>
      </div>

      {/* The Story / Creator Highlight Card */}
      <div className="p-8 md:p-10 rounded-[2.5rem] bg-gradient-to-br from-violet-600 via-indigo-700 to-slate-900 text-white border-4 border-deep-navy shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="w-24 h-24 rounded-3xl bg-white/10 border-2 border-white/20 p-2 shrink-0 backdrop-blur-md shadow-inner flex items-center justify-center">
            <img src="https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Farticles%2Fvk11iy6n5ppdp0j4nm46.png" alt="Jesse Math FC Logo" className="w-full h-full object-contain rounded-2xl" />
          </div>

          <div className="space-y-3 text-center md:text-left">
            <span className="px-3 py-1 bg-amber-400 text-slate-950 font-black text-[10px] uppercase rounded-full tracking-wider inline-block">
              Created by Jesse Otobo
            </span>
            <h3 className="text-2xl md:text-3xl font-display font-black tracking-tight">
              The Story Behind the Platform
            </h3>
            <p className="text-sm md:text-base text-slate-200 font-medium leading-relaxed">
              Jesse Math FC was created by Jesse Otobo, an 11-year-old developer who wanted to transform daily math practice from repetitive homework into an exciting game. Seeing classmates struggle with math anxiety inspired the creation of an interactive space where solving equations earns rewards, unlocks avatar gear, and fosters friendly competition.
            </p>
          </div>
        </div>
      </div>

      {/* 1. AGE DISTINCTIONS & CHILD PRIVACY SAFETY (FOLLOWS COPPA RULES) */}
      <div className="bg-slate-900 text-white p-8 md:p-10 rounded-3xl border-4 border-deep-navy space-y-6 shadow-lg">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <ShieldCheck size={22} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest block">Safety & Privacy Standards</span>
            <h3 className="text-xl md:text-2xl font-black text-white">Age Distinctions & Child Privacy Protections</h3>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Lock size={16} /> Under 13 Years Old (Primary & Middle School)
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Engineered following <strong>COPPA &amp; GDPR Child Privacy</strong> rules. Primary students require <strong>no email address</strong> to play and can log in via teacher-generated visual class cards. Contains zero public chatrooms, direct messaging, or external link exposure.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-2.5 py-1 bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[10px] font-bold rounded-lg">Follows COPPA Rules</span>
              <span className="px-2.5 py-1 bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[10px] font-bold rounded-lg">Level Matches</span>
              <span className="px-2.5 py-1 bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[10px] font-bold rounded-lg">KS2 SATs Prep</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <ShieldCheck size={16} /> Follows COPPA & GDPR Privacy Rules (Under 13 Safe)
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Child privacy and safety are built into every layer. Students under 13 log in securely with visual avatars and simple PIN codes without providing email addresses, phone numbers, or personal identifying data.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-2.5 py-1 bg-emerald-400/10 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold rounded-lg">Zero Tracking</span>
              <span className="px-2.5 py-1 bg-emerald-400/10 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold rounded-lg">No Email Required</span>
              <span className="px-2.5 py-1 bg-emerald-400/10 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold rounded-lg">School Approved</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. GAMIFIED LEVEL GIGS & PROGRESSION ENGINE */}
      <div className="p-8 rounded-3xl bg-white border-4 border-deep-navy space-y-6 shadow-md">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700">
            <Flame size={22} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-amber-600 tracking-widest block">Gamification Architecture</span>
            <h3 className="text-xl md:text-2xl font-black text-deep-navy">Level "Matches" Progression &amp; Avatar Customization</h3>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <GigLevelCard stage="Youth Academy Debut" levels="Levels 1 – 3" desc="Primary calculation speed, basic addition, subtraction, and place value fundamentals." />
          <GigLevelCard stage="Local Legend" levels="Levels 4 – 7" desc="Times tables fluency, division, decimals, fractions, and mental word problems." />
          <GigLevelCard stage="Main Stage Striker" levels="Levels 8 – 12" desc="Multi-step reasoning, algebra, geometry, ratios, and percentage conversions." />
          <GigLevelCard stage="Hall of Famer" levels="Levels 13+" desc="Advanced problem-solving, SATs mastery, and global multiplayer pitch leadership." />
        </div>

        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider">Club Shop Economy</h4>
            <p className="text-xs text-amber-800 font-medium">Students earn match coins through accuracy streaks and level completion to customize rocker avatars with stage jackets, neon hairstyles, and football boots.</p>
          </div>
          <div className="px-4 py-2 bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-sm shrink-0">
            Completely Free Virtual Economy
          </div>
        </div>
      </div>

      {/* 3. EXAM HUBS & CURRICULUM LEARNING */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* KS2 SATs */}
        <div className="p-7 rounded-3xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 border-4 border-deep-navy space-y-4 shadow-md">
          <div className="inline-block px-3 py-1 bg-slate-950 text-amber-400 font-black text-[10px] uppercase rounded-full tracking-wider">
            Under 13 Primary School Hub
          </div>
          <h3 className="text-2xl font-black font-display tracking-tight">UK Key Stage 2 (KS2) SATs Exam Hub</h3>
          <p className="text-xs font-medium leading-relaxed text-slate-900">
            Tailored specifically for Year 6 UK students preparing for national assessments:
          </p>
          <ul className="space-y-2 text-xs font-bold text-slate-950">
            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-slate-950 shrink-0" /> Paper 1: Timed 36-question Arithmetic drills</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-slate-950 shrink-0" /> Papers 2 &amp; 3: Reasoning word problem challenges</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-slate-950 shrink-0" /> Automated Scaled Score Conversion (80–120 Range)</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-slate-950 shrink-0" /> Calm Breathing Break tool for test anxiety reduction</li>
          </ul>
        </div>

        {/* Visual Learning Models & Spaced Repetition */}
        <div className="p-7 rounded-3xl bg-gradient-to-br from-indigo-900 to-slate-950 text-white border-4 border-deep-navy space-y-4 shadow-md">
          <div className="inline-block px-3 py-1 bg-indigo-500 text-white font-black text-[10px] uppercase rounded-full tracking-wider">
            Visual Math &amp; Spaced Repetition
          </div>
          <h3 className="text-2xl font-black font-display tracking-tight">Interactive Visual Models &amp; Lesson Hub</h3>
          <p className="text-xs font-medium leading-relaxed text-slate-300">
            Empowering students to truly visualize mathematics through step-by-step conceptual modeling:
          </p>
          <ul className="space-y-2 text-xs font-bold text-slate-200">
            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-indigo-400 shrink-0" /> Dynamic Fraction Bars, Pie Visualizers &amp; Place Value Charts</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-indigo-400 shrink-0" /> Step-by-step worked examples with guided self-check exercises</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-indigo-400 shrink-0" /> Spaced repetition diagnostic engine that targets personal weak spots</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-indigo-400 shrink-0" /> Real-time multiplayer striker speed duels and live pitch matches</li>
          </ul>
        </div>
      </div>

      {/* 4. TEACHER DASHBOARD, LESSON PREPARATION & PARENT PORTAL */}
      <div className="p-8 rounded-3xl bg-white border-4 border-deep-navy space-y-6 shadow-md">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
          <div className="w-10 h-10 rounded-xl bg-violet-100 border border-violet-300 flex items-center justify-center text-violet-700">
            <School size={22} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-violet-600 tracking-widest block">Pedagogical Tools</span>
            <h3 className="text-xl md:text-2xl font-black text-deep-navy">Teacher Dashboard, Lesson Preparation &amp; Parent Tracking</h3>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-deep-navy font-bold text-sm">
              <LayoutDashboard size={16} className="text-violet-600" /> Classroom Management
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Teachers can set up class rosters, generate student join codes, print visual login cards, and assign targeted homework or end-of-lesson exit tickets.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-deep-navy font-bold text-sm">
              <BarChart3 size={16} className="text-indigo-600" /> AI Misconception Detector
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Analyzes class-wide incorrect answers and alerts teachers to specific mathematical friction points (e.g., fraction addition vs multiplication errors).
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-deep-navy font-bold text-sm">
              <UserCheck size={16} className="text-emerald-600" /> Parent Portal &amp; Progress
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Parents monitor child accuracy, completed homework, test readiness, and practice streak consistency with linked security PINs.
            </p>
          </div>
        </div>
      </div>

      {/* Educator & Parent Reassurance */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-50 border-2 border-deep-navy/20 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <h4 className="text-base font-black text-deep-navy flex items-center justify-center md:justify-start gap-2">
            <Heart size={18} className="text-rose-500" /> Free for Students, Teachers &amp; Schools
          </h4>
          <p className="text-xs text-slate-600 font-medium max-w-xl">
            Jesse Math FC is completely free to use with zero subscriptions, paywalls, or advertisements.
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

function GigLevelCard({ stage, levels, desc }: { stage: string, levels: string, desc: string }) {
  return (
    <div className="p-5 rounded-2xl bg-slate-50 border-2 border-deep-navy/20 space-y-2 shadow-sm">
      <span className="px-2.5 py-0.5 bg-amber-400 text-slate-950 font-black text-[9px] uppercase rounded-full tracking-wider inline-block">
        {levels}
      </span>
      <h4 className="text-sm font-black text-deep-navy">{stage}</h4>
      <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
        {desc}
      </p>
    </div>
  );
}


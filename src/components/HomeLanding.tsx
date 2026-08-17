import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  BookOpen, 
  Award, 
  Search, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  HelpCircle, 
  Flame, 
  Compass,
  ChevronRight,
  Target,
  Users,
  GraduationCap,
  Zap,
  CheckCircle2,
  Gamepad2,
  Github,
  ExternalLink,
  Smartphone
} from 'lucide-react';
import AboutSection from './AboutSection';
import ReviewSection from './ReviewSection';

interface HomeLandingProps {
  userId?: string;
  username: string;
  userRole?: 'student' | 'kid' | 'individual' | 'teacher' | 'parent' | 'admin' | 'guest';
  stats: {
    level: number;
    streak: number;
    correctAnswers: number;
    totalSolved: number;
    xp?: number;
  };
  onNavigateToTab: (tab: any) => void;
  onNavigateToLesson: (lessonId: string) => void;
  onNavigateToTermsSection?: (section: 'privacy' | 'terms' | 'dual') => void;
}

const SUPPORTED_SKILLS = [
  { id: '1', name: 'Multiplication', cat: 'Arithmetic', desc: 'Master times tables with interactive drills', lessonId: '1' },
  { id: '2', name: 'Division', cat: 'Arithmetic', desc: 'Practice splitting numbers and inverse operations', lessonId: '2' },
  { id: '3', name: 'Addition', cat: 'Arithmetic', desc: 'Build mental calculation speed and fluency', lessonId: '1' },
  { id: '4', name: 'Subtraction', cat: 'Arithmetic', desc: 'Practice quick mental subtraction challenges', lessonId: '1' },
  { id: '5', name: 'Fractions', cat: 'Fractions', desc: 'Understand parts of a whole with visual models', lessonId: '5' },
  { id: '6', name: 'Decimals', cat: 'Decimals', desc: 'Practice place values, conversions, and decimals', lessonId: '5' },
  { id: '7', name: 'Algebra', cat: 'Algebra', desc: 'Solve equations and find unknown variables', lessonId: '3' },
  { id: '8', name: 'Geometry', cat: 'Geometry', desc: 'Explore angles, shapes, perimeter, and area', lessonId: '3' },
];

const FAQ_ITEMS = [
  {
    q: "Is Jesse Math Rockstar free?",
    a: "Yes, Jesse Math Rockstar is 100% free to play with no hidden paywalls, subscription fees, or intrusive advertisements."
  },
  {
    q: "What math skills can students practice?",
    a: "Students can practice core skills across addition, subtraction, multiplication, division, fractions, decimals, algebra basics, and geometry."
  },
  {
    q: "Can students play multiplayer match games?",
    a: "Yes! Students can enter the Play Arena to join live multiplayer math challenges against peers, build streaks, and climb global leaderboards."
  },
  {
    q: "Is Jesse Math Rockstar suitable for classrooms and teachers?",
    a: "Absolutely. Teachers can set up class rosters, track student performance, view progress diagnostics, and run interactive class activities."
  },
  {
    q: "What age or grade level is it designed for?",
    a: "It is designed primarily for primary and middle school students, but adaptable for any student looking to improve mental calculation speed."
  },
  {
    q: "Do I need an account to start playing?",
    a: "No account is required to start practicing immediately! You can enter a nickname and jump straight into challenges."
  },
  {
    q: "Can I play on a mobile phone or tablet?",
    a: "Yes, Jesse Math Rockstar is fully responsive and optimized for phones, tablets, Chromebooks, and desktop computers."
  }
];

export default function HomeLanding({ 
  userId,
  username, 
  userRole, 
  stats, 
  onNavigateToTab, 
  onNavigateToLesson, 
  onNavigateToTermsSection 
}: HomeLandingProps) {
  if (!stats) return null;
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const filteredSuggestions = SUPPORTED_SKILLS.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.cat.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const accuracy = stats.totalSolved > 0 
    ? Math.round((stats.correctAnswers / stats.totalSolved) * 100) 
    : 0;

  return (
    <div className="flex flex-col flex-1 justify-between w-full h-full space-y-12">
      
      {/* 1. HERO SECTION - ELECTRIC ROCKSTAR CONCERT STAGE */}
      <section className="relative overflow-hidden p-8 md:p-14 rounded-[3rem] bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-white border-4 border-pink-500/40 shadow-2xl rockstar-card animate-rock-pulse">
        {/* Stage Spotlights & Background Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 space-y-6 max-w-3xl">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-pink-500/20 border border-pink-500/40 rounded-full text-xs font-black text-pink-300 uppercase tracking-widest shadow-lg">
            <Sparkles size={14} className="text-yellow-400 animate-spin" /> 🎸 Electric Rockstar Math Concert Stage
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-black tracking-tight leading-none rockstar-text-glow">
            Jesse Math Rockstar
          </h1>

          <p className="text-xl md:text-2xl font-bold text-amber-400 tracking-tight flex items-center gap-2">
            <span>🔥 Turn Math Practice into an Unstoppable Rock Concert!</span>
          </p>

          <p className="text-sm md:text-base text-slate-200 font-medium leading-relaxed max-w-2xl">
            Master math speed drills, solo guitar solos, multiplayer arena duels, rockstar avatars, streaks, and trophies. Jam to calculation mastery!
          </p>

          {/* Supported Skills Pills */}
          <div className="flex flex-wrap gap-2 pt-1">
            {['Addition', 'Subtraction', 'Multiplication', 'Division', 'Fractions', 'Decimals', 'Algebra', 'Geometry'].map((skill) => (
              <span key={skill} className="px-3.5 py-1 bg-slate-900/80 border border-purple-500/30 rounded-full text-xs font-bold text-pink-200 shadow-sm flex items-center gap-1">
                <span className="text-amber-400 text-[10px]">⚡</span> {skill}
              </span>
            ))}
          </div>

          {/* Primary & Secondary CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <button
              onClick={() => onNavigateToTab('quiz')}
              className="w-full sm:w-auto px-8 py-4 rockstar-btn-gold font-black text-sm tracking-wider uppercase rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-amber-500/20"
            >
              🎸 Play Free Rock Concert <ArrowRight size={18} />
            </button>
            <button
              onClick={() => onNavigateToTab('arena')}
              className="w-full sm:w-auto px-8 py-4 rockstar-btn-primary font-black text-sm tracking-wider uppercase rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              ⚡ Rock Arena Battle
            </button>
            <button
              onClick={() => onNavigateToTab('hub')}
              className="w-full sm:w-auto px-8 py-4 bg-slate-900/80 hover:bg-slate-800 text-cyan-300 font-black text-sm tracking-wider uppercase rounded-2xl border border-cyan-500/40 backdrop-blur-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <BookOpen size={18} /> Learning Hub
            </button>
          </div>
        </div>
      </section>

      {/* 2. QUICK EXPLORER & SEARCH */}
      <section className="relative">
        <div className="p-4 md:p-6 rounded-3xl bg-white/60 border-4 border-deep-navy backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
              <Compass size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-deep-navy">Explore Math Topics</h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Quick Skill Finder</p>
            </div>
          </div>

          <div className="relative w-full md:max-w-md">
            <Search size={16} className="absolute left-4 top-3.5 text-slate-400" />
            <input 
              type="text"
              placeholder="Search multiplication, fractions, algebra..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full pl-11 pr-4 py-3 bg-white border-2 border-deep-navy/20 rounded-2xl text-xs text-deep-navy placeholder:text-slate-400 outline-none focus:border-indigo-600 font-semibold transition-all shadow-sm"
            />

            <AnimatePresence>
              {showSuggestions && searchQuery.trim().length > 0 && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowSuggestions(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 right-0 top-full mt-2 bg-white border-2 border-deep-navy rounded-2xl shadow-2xl p-3 z-20 max-h-60 overflow-y-auto space-y-1"
                  >
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider px-2 pb-1.5 border-b border-slate-100">Math Topics</p>
                    {filteredSuggestions.length > 0 ? (
                      filteredSuggestions.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => {
                            onNavigateToLesson(s.lessonId);
                            setSearchQuery('');
                            setShowSuggestions(false);
                          }}
                          className="w-full text-left p-2 hover:bg-indigo-50 rounded-xl transition-all flex items-center justify-between group cursor-pointer"
                        >
                          <div>
                            <p className="text-xs font-black text-deep-navy group-hover:text-indigo-600">{s.name}</p>
                            <p className="text-[10px] text-slate-500 font-medium">{s.desc}</p>
                          </div>
                          <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded uppercase">
                            {s.cat}
                          </span>
                        </button>
                      ))
                    ) : (
                      <p className="p-3 text-[11px] text-slate-500 italic text-center">No matching math topics found.</p>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-display font-black text-deep-navy">
            How It Works
          </h2>
          <p className="text-xs md:text-sm text-slate-600 font-medium">
            Start practicing math in three simple steps.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border-4 border-deep-navy space-y-3 shadow-md relative">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 font-black text-lg flex items-center justify-center shadow">
              1
            </div>
            <h3 className="text-base font-black text-deep-navy">Choose a Challenge</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Pick the math skill you want to practice, from multiplication tables to algebraic equations.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border-4 border-deep-navy space-y-3 shadow-md relative">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center shadow">
              2
            </div>
            <h3 className="text-base font-black text-deep-navy">Solve and Compete</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Answer math questions, build streaks, and compete in interactive single-player or multiplayer games.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border-4 border-deep-navy space-y-3 shadow-md relative">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white font-black text-lg flex items-center justify-center shadow">
              3
            </div>
            <h3 className="text-base font-black text-deep-navy">Become a Rockstar</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Earn rewards, unlock avatar gear in the Rock Shop, and climb the leaderboard as your skills improve.
            </p>
          </div>
        </div>
      </section>

      {/* 4. MATH SKILLS SECTION */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-black text-deep-navy">
              Math Skills You Can Practice
            </h2>
            <p className="text-xs md:text-sm text-slate-600 font-medium mt-1">
              Explore essential curriculum math topics with interactive drills.
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('hub')}
            className="px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1 shrink-0"
          >
            Explore All Lessons <ChevronRight size={14} />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {SUPPORTED_SKILLS.map((skill) => (
            <div 
              key={skill.id}
              className="p-5 rounded-2xl bg-white border-2 border-deep-navy/20 hover:border-indigo-600 transition-all space-y-2 flex flex-col justify-between shadow-sm group"
            >
              <div className="space-y-1.5">
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-bold rounded uppercase inline-block">
                  {skill.cat}
                </span>
                <h3 className="text-sm font-black text-deep-navy group-hover:text-indigo-600 transition-colors">
                  {skill.name}
                </h3>
                <p className="text-[11px] text-slate-600 font-medium leading-snug">
                  {skill.desc}
                </p>
              </div>
              <button
                onClick={() => onNavigateToLesson(skill.lessonId)}
                className="pt-2 text-[11px] font-black text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer mt-auto"
              >
                Practice Skill <ChevronRight size={12} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 5. MULTIPLAYER MATH SECTION */}
      <section className="p-8 md:p-12 rounded-[2.5rem] bg-gradient-to-r from-indigo-900 to-slate-900 text-white border-4 border-deep-navy space-y-6 shadow-xl">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-xs font-black uppercase tracking-wider">
            <Users size={14} /> Real-Time Battle Arena
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-black tracking-tight">
            Turn math practice into a competition.
          </h2>
          <p className="text-sm md:text-base text-slate-300 font-medium leading-relaxed">
            Challenge yourself, compete with others, earn points, build streaks, and climb the leaderboard while practicing real math skills.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigateToTab('arena')}
              className="px-8 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow transition-all flex items-center gap-2 cursor-pointer"
            >
              Enter Battle Arena <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* 6. TEACHER & CLASSROOM FEATURES */}
      <section className="p-8 md:p-10 rounded-[2.5rem] bg-emerald-50 border-4 border-emerald-300 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-200/80 text-emerald-900 rounded-full text-xs font-black uppercase tracking-wider">
              <GraduationCap size={14} /> Classroom Ready
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-black text-deep-navy">
              Math practice for classrooms, too.
            </h2>
            <p className="text-xs md:text-sm text-slate-700 font-medium leading-relaxed max-w-2xl">
              Teachers can use Jesse Math Rockstar to give students interactive math activities, track class progress, and make practice more engaging in computer labs or at home.
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('school')}
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            Explore Teacher Tools <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* 7. PARENT & STUDENT VALUE PROPOSITION */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-display font-black text-deep-navy">
            Why Students Love Practicing
          </h2>
          <p className="text-xs md:text-sm text-slate-600 font-medium">
            Designed to build confidence and fluency through positive reinforcement.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          <ValueCard 
            title="Interactive Practice"
            desc="Solve math problems through quick games that keep learning active and engaging."
          />
          <ValueCard 
            title="Progress & Streaks"
            desc="Track streaks and level up as accuracy improves over time."
          />
          <ValueCard 
            title="Custom Avatar Gear"
            desc="Earn coins by solving equations and unlock rockstar items in the Rock Shop."
          />
          <ValueCard 
            title="Student Friendly"
            desc="Focused practice with zero ads, simple controls, and anonymous usernames."
          />
        </div>
      </section>

      {/* 8. SHORT CREATOR STORY */}
      <section className="p-8 rounded-3xl bg-slate-50 border-2 border-deep-navy/20 space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-black text-2xl flex items-center justify-center shrink-0 shadow">
            JO
          </div>
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-black text-deep-navy">Created by Jesse Otobo</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-2xl">
              Jesse Math Rockstar was created by Jesse Otobo, an 11-year-old developer who wanted to make math practice more engaging for classmates and students worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* 9. USER-FOCUSED FAQ SECTION */}
      <section className="p-8 md:p-10 rounded-[2.5rem] bg-white border-4 border-deep-navy space-y-6 shadow-md">
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-display font-black text-deep-navy flex items-center gap-2">
            <HelpCircle size={24} className="text-indigo-600" /> Frequently Asked Questions
          </h2>
          <p className="text-xs md:text-sm text-slate-600 font-medium">
            Everything you need to know about playing and using Jesse Math Rockstar.
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, idx) => (
            <div key={idx} className="border-b border-slate-200 pb-3">
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                className="w-full text-left flex items-center justify-between gap-4 font-black text-sm text-deep-navy hover:text-indigo-600 transition-colors py-1 cursor-pointer"
              >
                <span>{item.q}</span>
                <ChevronRight size={18} className={`shrink-0 transition-transform ${openFaqIndex === idx ? 'rotate-90 text-indigo-600' : 'text-slate-400'}`} />
              </button>
              <AnimatePresence>
                {openFaqIndex === idx && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs text-slate-600 font-medium mt-2 leading-relaxed"
                  >
                    {item.a}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* 10. FINAL CALL TO ACTION */}
      <section className="p-8 md:p-12 rounded-[2.5rem] bg-gradient-to-r from-indigo-600 to-violet-700 text-white text-center space-y-5 shadow-xl border-4 border-deep-navy">
        <h2 className="text-3xl md:text-4xl font-display font-black tracking-tight">
          Ready to Practice Math?
        </h2>
        <p className="text-sm md:text-base text-indigo-100 font-medium max-w-md mx-auto">
          Start playing interactive math challenges today and build your skills!
        </p>
        <button
          onClick={() => onNavigateToTab('quiz')}
          className="px-10 py-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl transition-all hover:scale-105 inline-flex items-center gap-2 cursor-pointer"
        >
          Play Free Now <ArrowRight size={18} />
        </button>
      </section>

      {/* Review Section */}
      <ReviewSection 
        userRole={userRole} 
        userId={userId}
        username={username}
        stats={stats}
      />

      {/* About Section */}
      <AboutSection />

      {/* 11. FOOTER */}
      <footer className="border-t border-deep-navy/10 pt-6 pb-2 mt-8 space-y-4 text-center">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-deep-navy/20 shrink-0">
              <img src="/logo.png" alt="Jesse Math Rockstar Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-xs font-black text-deep-navy uppercase">Jesse Math Rockstar</p>
              <p className="text-[10px] text-slate-500 font-medium">Free Interactive Math Game</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-xs font-bold text-slate-600">
            <button 
              onClick={() => onNavigateToTermsSection?.('privacy')}
              className="hover:text-indigo-800 underline transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => onNavigateToTermsSection?.('terms')}
              className="hover:text-indigo-800 underline transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <button 
              onClick={() => onNavigateToTab('school')}
              className="hover:text-indigo-800 underline transition-colors cursor-pointer"
            >
              Teacher Tools
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-deep-navy/5 pt-4 text-[10px] text-slate-500 font-medium font-mono">
          <p>© 2026 Jesse Math Rockstar. Created by Jesse Otobo.</p>
          <p>Educational Math Practice Platform</p>
        </div>
      </footer>

    </div>
  );
}

function ValueCard({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="p-5 rounded-2xl bg-white border-2 border-deep-navy/15 space-y-2 shadow-sm">
      <CheckCircle2 size={18} className="text-emerald-500" />
      <h3 className="text-sm font-black text-deep-navy">{title}</h3>
      <p className="text-[11px] text-slate-600 font-medium leading-relaxed">{desc}</p>
    </div>
  );
}

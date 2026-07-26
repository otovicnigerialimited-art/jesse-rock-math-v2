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
  Globe,
  ExternalLink,
  ChevronRight,
  Target,
  Github
} from 'lucide-react';

interface HomeLandingProps {
  username: string;
  stats: {
    level: number;
    streak: number;
    correctAnswers: number;
    totalSolved: number;
  };
  onNavigateToTab: (tab: any) => void;
  onNavigateToLesson: (lessonId: string) => void;
  onNavigateToTermsSection?: (section: 'privacy' | 'terms' | 'dual') => void;
}

const SITE_LESSONS = [
  { id: '1', title: 'Multiplication Mastery', cat: 'Arithmetic', desc: 'Step-by-step interactive array grids' },
  { id: '2', title: 'Division Decoded', cat: 'Arithmetic', desc: 'Splitting groups fairly with inverse math' },
  { id: '4', title: 'Long Division Arena', cat: 'Arithmetic', desc: 'Step-by-step long division workouts' },
  { id: '5', title: 'Fraction Fusion', cat: 'Arithmetic', desc: 'Learn parts with visual pie sectors' },
  { id: '3', title: 'Algebraic Basics', cat: 'Algebra', desc: 'Introducing dynamic equations and solving X' }
];

export default function HomeLanding({ username, stats, onNavigateToTab, onNavigateToLesson, onNavigateToTermsSection }: HomeLandingProps) {
  if (!stats) return null;
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filter lessons based on query
  const filteredSuggestions = SITE_LESSONS.filter(l => 
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    l.cat.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const accuracy = stats.totalSolved > 0 
    ? Math.round((stats.correctAnswers / stats.totalSolved) * 100) 
    : 0;

  return (
    <div className="flex flex-col flex-1 justify-between w-full h-full">
      <div className="space-y-12 flex-1">
      <div className="flex justify-center pt-8 pb-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="relative inline-block"
        >
          <img 
            src="/jesse_rock_logo.jpg" 
            alt="Jesse Rock Math Official Logo" 
            className="w-48 h-48 md:w-64 md:h-64 object-contain drop-shadow-2xl rounded-3xl border border-deep-navy/10"
            referrerPolicy="no-referrer"
          />
        </motion.div>
      </div>

      {/* Search & Site Explorer - Sleek Sticky feel */}
      <div className="relative">
        <div className="p-4 md:p-6 rounded-3xl bg-white/30 border border-deep-navy border-4 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 bg-pastel-green/10 rounded-xl flex items-center justify-center text-blue-500">
              <Compass size={20} className="animate-spin-slow" />
            </div>
            <div>
              <h4 className="text-sm font-black text-deep-navy">Interactive Site Explorer</h4>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold">Instant Lesson Finder</p>
            </div>
          </div>

          {/* Search bar inputs */}
          <div className="relative w-full md:max-w-md">
            <Search size={16} className="absolute left-4 top-3.5 text-deep-navy" />
            <input 
              type="text"
              placeholder="Search multiplication, fractions, algebraic equations..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full pl-11 pr-4 py-3 bg-clean-white backdrop-blur-md border-deep-navy border-4 border border-deep-navy border-4 rounded-2xl text-xs text-deep-navy placeholder:text-slate-700 outline-none focus:border-indigo-500 font-semibold transition-all"
            />

            {/* Suggestions Overlay dropdown */}
            <AnimatePresence>
              {showSuggestions && searchQuery.trim().length > 0 && (
                <>
                  {/* Click trigger to dismiss suggestions */}
                  <div className="fixed inset-0 z-10" onClick={() => setShowSuggestions(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 right-0 top-full mt-2 bg-white border border-deep-navy border-4 rounded-2xl shadow-2xl p-3 z-20 max-h-60 overflow-y-auto space-y-1"
                  >
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider px-2 pb-1.5 border-b border-deep-navy border-4">Website Search Results</p>
                    {filteredSuggestions.length > 0 ? (
                      filteredSuggestions.map((l) => (
                        <button
                          key={l.id}
                          onClick={() => {
                            onNavigateToLesson(l.id);
                            setSearchQuery('');
                            setShowSuggestions(false);
                          }}
                          className="w-full text-left p-2 hover:bg-white/5 rounded-xl transition-all flex items-center justify-between group cursor-pointer"
                        >
                          <div>
                            <p className="text-xs font-black text-deep-navy group-hover:text-blue-500 transition-colors">{l.title}</p>
                            <p className="text-[10px] text-slate-550 italic font-medium">{l.desc}</p>
                          </div>
                          <span className="text-[10px] bg-slate-800 text-deep-navy font-bold px-2 py-0.5 rounded uppercase group-hover:bg-indigo-600/20 group-hover:text-blue-500">
                            {l.cat}
                          </span>
                        </button>
                      ))
                    ) : (
                      <p className="p-3 text-[11px] text-slate-500 italic text-center">No math topics found. Try typing 'division' or 'fraction'</p>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Main Hero Section */}
      <div className="relative overflow-hidden p-8 md:p-14 rounded-[3.5rem] bg-gradient-to-br from-pastel-purple/60 via-pastel-blue/30 to-transparent border border-deep-navy border-4 shadow-2xl relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-energetic-red/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 space-y-6 max-w-2xl text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-energetic-red/10 border border-energetic-red/20 rounded-full text-xs font-black text-action-orange uppercase tracking-widest leading-none mx-auto md:mx-0">
            <Sparkles size={12} className="text-yellow-400 animate-pulse" /> ROCKSTAR PORTAL IS LIVE
          </div>
          
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-black tracking-tight leading-none text-deep-navy">
            WELCOME TO <br />
            <span className="text-deep-navy drop-shadow-md">
              JESSE MATH ROCK STAR
            </span>
          </h1>

          <p className="text-deep-navy text-sm sm:text-base leading-relaxed max-w-xl font-medium">
            {"Hey "} <span className="text-emerald-500 font-extrabold">{username}</span>{", you are currently level "} <span className="text-emerald-500 font-extrabold">{stats.level}</span>{"! "} 
            {"Challenge global duelists in real-time online battles, earn math tokens, master multi-grade math lessons, and climb the scoreboard! No third-party sign-ins, pure educational power."}
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap items-center gap-5 pt-4">
            <button
              onClick={() => onNavigateToTab('quiz')}
              className="w-full sm:w-auto px-8 py-4 btn-action rounded-2xl font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2 hover:scale-105 transition-transform"
            >
              Enter Play Arena <ArrowRight size={18} />
            </button>
            <button
              onClick={() => onNavigateToTab('shop')}
              className="w-full sm:w-auto px-8 py-4 btn-secondary rounded-2xl font-black text-sm tracking-wide uppercase flex items-center justify-center gap-2 hover:scale-105 transition-transform"
            >
              🎸 Rock Shop & Customize
            </button>
            <button
              onClick={() => onNavigateToTab('rules')}
              className="w-full sm:w-auto px-8 py-4 btn-secondary rounded-2xl font-black text-sm tracking-wide uppercase flex items-center justify-center gap-2 hover:scale-105 transition-transform"
            >
              <HelpCircle size={17} /> Rules Page
            </button>
          </div>
        </div>
      </div>

      {/* Website Core Feature Highlights */}
      <div className="space-y-6">
        <div className="text-center md:text-left space-y-1">
          <h2 className="text-xl font-black uppercase tracking-wider text-deep-navy">Website Features & Hub Highlights</h2>
          <p className="text-xs text-slate-500 leading-normal font-medium">Explore the diverse features of Jesse Rock Math Hub in sequential pages</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="p-6 rounded-3xl bg-sky-blue/50 backdrop-blur-sm border border-deep-navy border-4 space-y-4 hover:border-energetic-red/20 transition-all flex flex-col justify-between group">
            <div className="space-y-2">
              <div className="w-10 h-10 bg-violet-600/10 rounded-xl flex items-center justify-center text-action-orange">
                <Trophy size={18} />
              </div>
              <h3 className="text-sm font-black text-deep-navy group-hover:text-emerald-500 transition-colors">1. Quick Match Play Arena</h3>
              <p className="text-[11px] text-deep-navy leading-relaxed font-semibold">
                Engage in fast real-time matches against other players using direct Firestore synchronization. No restrictive Google popups!
              </p>
            </div>
            <button 
              onClick={() => onNavigateToTab('quiz')}
              className="text-[10px] text-action-orange hover:text-emerald-500 font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer pt-2 mt-auto"
            >
              Start matchmaking now <ChevronRight size={12} />
            </button>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-3xl bg-sky-blue/50 backdrop-blur-sm border border-deep-navy border-4 space-y-4 hover:border-pastel-green/40 transition-all flex flex-col justify-between group">
            <div className="space-y-2">
              <div className="w-10 h-10 bg-pastel-green/20 rounded-xl flex items-center justify-center text-emerald-500">
                <BookOpen size={18} />
              </div>
              <h3 className="text-sm font-black text-deep-navy group-hover:text-emerald-500 transition-colors">2. Interactive Learning Hub</h3>
              <p className="text-[11px] text-deep-navy leading-relaxed font-semibold">
                Access custom worksheets and visual generators for Arithmetic, Fraction Pie Fusion, Algebraic Basics, and step-by-step Division.
              </p>
            </div>
            <button 
              onClick={() => onNavigateToTab('hub')}
              className="text-[10px] text-emerald-500 hover:text-emerald-500 font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer pt-2 mt-auto"
            >
              Browse curricula worksheets <ChevronRight size={12} />
            </button>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-3xl bg-sky-blue/50 backdrop-blur-sm border border-deep-navy border-4 space-y-4 hover:border-pastel-yellow/40 transition-all flex flex-col justify-between group">
            <div className="space-y-2">
              <div className="w-10 h-10 bg-pastel-yellow/20 rounded-xl flex items-center justify-center text-amber-700">
                <Award size={18} />
              </div>
              <h3 className="text-sm font-black text-deep-navy group-hover:text-amber-700 transition-colors">3. Digital Medal Store</h3>
              <p className="text-[11px] text-deep-navy leading-relaxed font-semibold">
                Unlock weekly math challenges to earn ultra-rare elite badges (e.g. Genius Debut, Table Titan, Long Solver) to display on your global profile!
              </p>
            </div>
            <button 
              onClick={() => onNavigateToTab('badges')}
              className="text-[10px] text-amber-700 hover:text-amber-800 font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer pt-2 mt-auto"
            >
              View unlocked trophies <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Mini Profile Sync Ticker banner */}
      <div className="p-5 rounded-2xl bg-clean-white backdrop-blur-md border border-deep-navy border-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px]">
        <div className="flex items-center gap-2 text-deep-navy font-semibold">
          <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
          <span>Active Device-Bound Username: <strong className="text-deep-navy">{username}</strong></span>
        </div>
        <div className="text-slate-500 font-semibold">
          Level {stats.level} Rank • Accuracy: {accuracy}% • Solved: {stats.totalSolved}
        </div>
      </div>

      {/* SEO & Educational Growth Hub Showcases */}
      <div className="p-8 md:p-10 rounded-[2.5rem] bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-deep-navy border-4 space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] font-black text-amber-700 uppercase tracking-wider">
            <Sparkles size={11} className="text-amber-500" /> Educational Growth Portal
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-black tracking-tight text-deep-navy uppercase">
            Jesse Rock Math: A Game-Changing Multiplayer Math Game for Kids
          </h2>
          <p className="text-xs md:text-sm text-slate-700 font-medium leading-relaxed max-w-4xl">
            <strong>{"\"Jesse Math Rockstar\" is an educational web application developed by Jesse, an 11-year-old developer."}</strong> {"Designed as a highly interactive "} <strong>{"multiplayer math game for kids"}</strong>{", Jesse has engineered "} 
            {"a blazing-fast, real-time Firestore synchronization hub, creating a premium playground where children can race, challenge global peers, and learn math in "} 
            {"a frictionless, safe, and highly visual environment."}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-deep-navy/10">
          <div className="space-y-3">
            <h3 className="text-sm font-black text-deep-navy uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Real-Time Adaptive Learning Algorithm
            </h3>
            <p className="text-xs text-slate-700 font-medium leading-relaxed">
              Every student progresses differently. Our intelligent engine delivers <strong>real-time adaptive math drills</strong> 
              that scale dynamically in response to answer streaks. As students construct flawless winning streaks, the 
              difficulty rises, keeping students engaged and challenged at precisely the perfect moment to boost their 
              <strong>mental math calculation speed</strong>.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-black text-deep-navy uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Friction-Free Classroom Times Tables Alternative
            </h3>
            <p className="text-xs text-slate-700 font-medium leading-relaxed">
              Designed as a modern <strong>classroom times tables alternative</strong>, our platform offers an immediate, 
              zero-friction solution for school computer labs:
            </p>
            <ul className="text-xs text-slate-700 font-semibold space-y-1.5 list-disc list-inside">
              <li><strong>No-Account Setup:</strong> Students simply provide a nickname and start learning within seconds.</li>
              <li><strong>Zero Friction:</strong> No email logins, passwords, or complex onboarding to handle.</li>
              <li><strong>Safe Local-Bound Progress:</strong> High-performance offline local-bound storage keeps achievements secure.</li>
              <li><strong>Free Elementary Math App:</strong> Zero cost, zero ads, and pure educational power designed for computer labs.</li>
            </ul>
          </div>
        </div>
      </div>

            </div>

      {/* Itch.io Embed */}
      <div className="flex justify-center mt-4 mb-0 w-full">
         <iframe frameBorder="0" src="https://itch.io/embed/4792376?linkback=true" width="552" height="167" className="rounded-xl shadow-xl max-w-full"><a href="https://jesse-otobo.itch.io/httpsjesse-math-rockstar-appvercelapp">Jesse mathrockstar by Jesse otobo</a></iframe>
      </div>

      {/* Sleek Professional Footer */}
      <footer className="border-t border-deep-navy/10 pt-6 pb-2 mt-8 text-center space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-deep-navy/20 shrink-0">
              <img src="/jesse_rock_logo.jpg" alt="Jesse Rock Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div>
              <p className="text-xs font-black text-deep-navy tracking-tight leading-none uppercase">Young Genius Studios</p>
              <p className="text-[10px] text-slate-500 font-bold mt-0.5 font-mono">EDUCATIONAL ARCHITECTURE FRAMEWORK</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-xs font-bold text-slate-600">
            <button 
              onClick={() => onNavigateToTermsSection?.('privacy')}
              className="hover:text-emerald-800 underline transition-colors cursor-pointer"
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
              onClick={() => onNavigateToTermsSection?.('dual')}
              className="hover:text-amber-800 transition-colors cursor-pointer"
            >
              Legal Compliance Center
            </button>
            <a 
              href="https://sites.google.com/view/jesse-rock-math-the-ultimate-m/home" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-blue-800 underline transition-colors cursor-pointer flex items-center gap-1"
            >
              <Globe size={11} /> Official Project Site
            </a>
            <a 
              href="https://github.com/otovicnigerialimited-art" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-slate-900 underline transition-colors cursor-pointer flex items-center gap-1"
            >
              <Github size={11} /> GitHub Profile
            </a>
            <a 
              href="https://www.producthunt.com/@jesse_otobo" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-orange-600 underline transition-colors cursor-pointer flex items-center gap-1"
            >
              <ExternalLink size={11} /> Product Hunt
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-deep-navy/5 pt-4 text-[10px] text-slate-500 font-semibold font-mono">
          <p>© 2026 Young Genius Studios. Developed By: Jesse Otobo (11-year-old developer). Crafted under Young Genius Educational Standard Code.</p>
          <p>Approved by Lead Architect Jesse Otobo</p>
        </div>
      </footer>
    </div>
  );
}

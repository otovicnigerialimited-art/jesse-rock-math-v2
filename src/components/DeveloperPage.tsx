import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Heart, 
  Send, 
  Rocket, 
  Sparkles, 
  Lock, 
  ShieldCheck, 
  GraduationCap,
  Github,
  ExternalLink,
  Globe,
  BookOpen,
  Terminal,
  ShieldAlert,
  Youtube,
  Award,
  Star
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { db } from '../lib/firebase';
import { collection, addDoc, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

interface DeveloperPageProps {
  currentUser: { uid: string; username: string; role?: string };
}

export default function DeveloperPage({ currentUser }: DeveloperPageProps) {
  // Guestbook states
  const [commentText, setCommentText] = useState('');
  const [avatarIcon, setAvatarIcon] = useState('👑');
  const [guestbookLogs, setGuestbookLogs] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Custom star rating states for kids, students, guests, and individuals
  const [starRating, setStarRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  // Load real-time guestbook comments on mount
  useEffect(() => {
    const q = query(
      collection(db, "developer_guestbook"),
      orderBy("timestamp", "desc"),
      limit(30)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs: any[] = [];
      snapshot.forEach((doc) => {
        logs.push({ id: doc.id, ...doc.data() });
      });
      setGuestbookLogs(logs);
    }, (err) => {
      console.warn("[GUESTBOOK] Loading offline/mock sync:", err);
      // Fallback fallback mock comments
      setGuestbookLogs([
        { id: 'mock1', username: 'Alex Multiplier', text: 'Jesse, this application is elite! The play battles are so slick.', avatar: '🎯', role: 'kid', timestamp: Date.now() - 3600000 },
        { id: 'mock2', username: 'TableTitan', text: 'I love how times table accuracy increases XP. Thank you Jesse Otobo!', avatar: '⚡', role: 'adult', timestamp: Date.now() - 7200000 }
      ]);
    });

    return () => unsubscribe();
  }, []);

  const userRole = currentUser?.role || 'guest';
  const isStarRatingOnly = userRole !== 'teacher' && userRole !== 'parent';
  const isGuest = !currentUser || currentUser.uid === 'guest' || currentUser.username === 'Genius Scholar' || currentUser.role === 'guest';
  const isAdult = currentUser?.role === 'teacher' || currentUser?.role === 'parent';

  const sanitizeGuestbookText = (text: string): string => {
    return text
      .trim()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;");
  };

  const handlePostStarRating = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    // Generate a beautiful, dynamic message based on rating value
    let ratingComment = '';
    switch (starRating) {
      case 5:
        ratingComment = "Rated 5 out of 5 stars! ⭐⭐⭐⭐⭐ Jesse Math FC is awesome! ⚡";
        break;
      case 4:
        ratingComment = "Rated 4 out of 5 stars! ⭐⭐⭐⭐ Really fun and exciting!";
        break;
      case 3:
        ratingComment = "Rated 3 out of 5 stars! ⭐⭐⭐ Good math practice!";
        break;
      case 2:
        ratingComment = "Rated 2 out of 5 stars! ⭐⭐ I will keep practicing!";
        break;
      case 1:
        ratingComment = "Rated 1 out of 5 stars! ⭐ Needs more rock!";
        break;
      default:
        ratingComment = `Rated ${starRating} out of 5 stars!`;
    }

    try {
      await addDoc(collection(db, "developer_guestbook"), {
        username: currentUser?.username || "Guest Striker",
        text: ratingComment,
        avatar: avatarIcon,
        role: 'kid',
        rating: starRating,
        timestamp: Date.now()
      });
      
      confetti({
        particleCount: 85,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#00d2ff', '#f43f5e', '#34d399']
      });
      
      setStarRating(5);
    } catch (err: any) {
      console.error("Error writing star rating to database:", err);
      setErrorMessage("Could not post rating. Please check your internet connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    if (isGuest) {
      setErrorMessage("You don't have an account yet, register one");
      setIsSubmitting(false);
      return;
    }

    if (!isAdult) {
      setErrorMessage("To protect children's safety and online privacy, individual players and students are not allowed to send messages in Jesse's guestbook. Only Adult or Teacher accounts can post.");
      setIsSubmitting(false);
      return;
    }

    const sanitizedComment = sanitizeGuestbookText(commentText);

    try {
      await addDoc(collection(db, "developer_guestbook"), {
        username: currentUser?.username || "Verified Striker",
        text: sanitizedComment,
        avatar: avatarIcon,
        role: currentUser?.role === 'teacher' || currentUser?.role === 'admin' ? 'adult' : 'kid',
        timestamp: Date.now()
      });
      setCommentText('');
    } catch (err: any) {
      console.error("Error writing comment to database:", err);
      setErrorMessage("Could not post comment. Please check your internet connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-full py-8 px-4 sm:px-6 lg:px-8 text-deep-navy space-y-12">
      
      {/* 1. HERO HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 max-w-3xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-500/10 border-2 border-pink-500/30 rounded-full text-xs font-black uppercase text-pink-700 tracking-wider">
          <Sparkles size={13} className="animate-spin-slow" /> MEET THE BRAIN BEHIND THE GAME
        </div>
        <h1 className="text-4xl sm:text-5xl font-display font-black tracking-tight leading-none mt-2 text-deep-navy">
          MEET THE <span className="bg-gradient-to-r from-cyan-600 via-pink-600 to-amber-600 bg-clip-text text-transparent">DEVELOPER</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-850 max-w-2xl mx-auto font-bold leading-relaxed">
          Jesse Math FC Arena was designed, coded, and deployed by Jesse Otobo (11-year-old developer). Learn about Jesse's journey and leave an encouraging word below!
        </p>
      </motion.div>

      {/* 2. FEATURED ARTICLE CARD */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="p-8 md:p-10 rounded-[2.5rem] bg-sunny-yellow/15 border-deep-navy border-4 shadow-lg relative overflow-hidden max-w-4xl mx-auto"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 justify-between">
          <div className="space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-550/15 border border-emerald-500/30 rounded-full text-[10px] font-black uppercase text-emerald-800 tracking-wider animate-pulse">
              <Sparkles size={11} /> FEATURED ON DEV.TO COMMUNITY
            </div>
            <h3 className="text-2xl sm:text-3xl font-display font-black text-deep-navy tracking-tight leading-snug">
              How I Built, Deployed, and Google-Indexed a Full-Stack AI App in Under 24 Hours
            </h3>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed max-w-2xl font-bold">
              In this acclaimed article, 11-year-old software pioneer Jesse Otobo explains how he designed high-speed client lobbies, integrated firestore real-time state, and achieved top Google indexation in less than 24 hours!
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2.5">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-550/25 font-mono text-[9px] text-emerald-850 font-bold uppercase">
                ⚡ 24-Hour Challenge
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-550/25 font-mono text-[9px] text-indigo-850 font-bold uppercase">
                🌐 Real-Time Sync
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-550/25 font-mono text-[9px] text-violet-850 font-bold uppercase">
                🏆 Search Engine Indexing
              </span>
            </div>
          </div>
          <div className="shrink-0">
            <a 
              href="https://dev.to/jesse_otobo_/how-i-built-deployed-and-google-indexed-a-full-stack-ai-app-in-under-24-hourspublished-true-h5g"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-clean-white font-black uppercase tracking-wider text-xs rounded-2xl shadow-xl hover:shadow-emerald-550/10 active:scale-95 transition-all cursor-pointer border-deep-navy border-4"
            >
              <Rocket size={14} /> Read Full Article
            </a>
          </div>
        </div>
      </motion.div>

      {/* 3. FOUNDER BIOGRAPHY SECTION */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mx-auto w-full max-w-4xl p-8 rounded-[2.5rem] bg-clean-white border-deep-navy border-4 shadow-xl text-deep-navy relative"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-pink-500/5 rounded-full blur-[60px] pointer-events-none" />
        
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-pink-600/10 border border-pink-500 border-4 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-3">
            👑
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-deep-navy tracking-tight">Meet the Founder</h2>
          <div className="text-sm font-bold uppercase tracking-widest text-pink-600 font-mono mt-2 animate-pulse">
            "We Are Young Genius" 👑
          </div>
        </div>

        {/* Anniversary Celebration Banner */}
        <div className="mb-8 p-6 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-pink-500/5 border border-pink-500/30 rounded-3xl text-left relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-pink-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <span className="px-2.5 py-0.5 bg-pink-500 text-clean-white font-mono text-[9px] font-black rounded-full uppercase tracking-wider animate-pulse inline-block">
                🎂 Official Birth & Anniversary Date
              </span>
              <h4 className="text-lg font-black text-deep-navy mt-1">
                📅 June 20th — Made, Published & Indexed!
              </h4>
              <p className="text-xs text-slate-800 leading-relaxed font-bold">
                Jesse Math FC was made, published, and completely indexed on Google on <strong>June 20, 2026</strong>! To celebrate this special milestone, every single year on <strong>June 20th</strong>, all players receive an automatic <strong>+100 Free Streak Booster</strong> and special community gifts when they log in!
              </p>
            </div>
            <div className="shrink-0 text-3xl animate-bounce hidden sm:block">
              🎁
            </div>
          </div>
        </div>

        <div className="space-y-6 text-sm leading-relaxed text-deep-navy font-sans">
          <p className="text-base font-bold">Hello! I am Jesse, the founder of Jesse Math FC, an application designed to help children enjoy practicing mathematics.</p>
          
          <div className="space-y-2">
            <h3 className="text-lg font-black text-pink-600 border-b-2 border-deep-navy pb-1 flex items-center gap-1.5">
              ⚽ The Inspiration
            </h3>
            <p className="font-semibold text-slate-850">
              I got inspired to create a unique platform that makes education extremely engaging and fun. By combining gaming elements with mathematics, my friends and peers can practice math and naturally improve their speed and accuracy.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-black text-pink-600 border-b-2 border-deep-navy pb-1 flex items-center gap-1.5">
              🚀 The Evolution: From Blocks to Advanced Coding
            </h3>
            <p className="font-semibold text-slate-850">
              I started coding at age 8, using visual, block-based tools like Scratch to understand logical statements, loops, and conditions. Over time, I grew passionate about building software and transitioned to full text-based coding, mastering responsive frontends, Firestore real-time databases, and full-stack integrations.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-black text-[#0D9488] border-b-2 border-deep-navy pb-1 flex items-center gap-1.5">
              🛠️ The Developer Tech Stack
            </h3>
            <p className="font-semibold text-slate-850">After creating and testing over 50 applications, I mastered advanced web structures, real-time sync systems, and hosting deployments. For this project, I utilize:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-deep-navy font-bold">
              <li><strong>UI Framework:</strong> Modern React with TypeScript and Vite.</li>
              <li><strong>Styling engine:</strong> Tailwind CSS utility classes with native animation support.</li>
              <li><strong>Database Layer:</strong> Firestore real-time state listeners.</li>
              <li><strong>Cloud Deployment:</strong> Secure server routing with CORS supervision.</li>
            </ul>
          </div>


          {/* Educational Platform Highlights */}
          <div className="mt-8 p-6 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 border-4 border-deep-navy rounded-[2rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <div className="text-6xl rotate-12">🎓</div>
            </div>
            <h3 className="text-xl font-black text-deep-navy mb-4 uppercase tracking-tight flex items-center gap-2">
              <span className="text-2xl">🎓</span> Interactive Learning Platform
            </h3>
            <div className="space-y-4 text-[13px] font-bold text-slate-850 leading-relaxed">
              <p>
                {"Jesse Math FC is designed to transform the way students engage with mathematics. By creating an interactive, game-based environment, we move beyond passive learning to active participation, helping learners master essential concepts through play."}
              </p>
              <p>
                {"Our platform leverages real-time feedback, adaptive challenges, and rewarding progress tracking to ensure every student remains motivated and challenged at their appropriate level, making math both accessible and enjoyable."}
              </p>
              <p className="bg-white/50 p-3 rounded-xl border-2 border-deep-navy/10">
                {"We believe that technology should empower educators and inspire students. By bridging the gap between traditional curriculum requirements and modern gamified interaction, we are building a foundation for lifelong mathematical confidence."}
              </p>
            </div>
          </div>

          {/* Football Story Section */}
          <div className="mt-8 p-6 bg-gradient-to-br from-green-500/10 via-yellow-500/5 to-blue-500/10 border-4 border-deep-navy rounded-[2rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <div className="text-6xl rotate-12">⚽</div>
            </div>
            <h3 className="text-xl font-black text-deep-navy mb-4 uppercase tracking-tight flex items-center gap-2">
              <span className="text-2xl">🇧🇷</span> My Favourite Iconic Football Player
            </h3>
            <div className="space-y-4 text-[13px] font-bold text-slate-850 leading-relaxed">
              <p>
                {"It is hard to think of a modern footballing story quite as brilliant, yet completely devastating, as Neymar Jr.’s relationship with the FIFA World Cup. For over a decade, he carried the hopes, dreams, and immense pressure of over 200 million Brazilians on his back. Every time he stepped onto the pitch wearing that iconic number 10 shirt, he wasn't just playing a game—he was carrying the legacy of Pelé, Garrincha, and Ronaldo, trying to bring the sixth star home."}
              </p>
              <p>
                {"But the World Cup has often been staggeringly cruel to him. We all remember 2014. A young, joyful Neymar was taking the tournament by storm on home soil, playing with the weight of an entire nation on his shoulders. Then came that horrific fractured vertebra against Colombia. In an instant, his dream was shattered, and the images of him being carried off the pitch in tears will forever be etched into football history."}
              </p>
              <p>
                {"When 2018 arrived, he fought through rushed injury recoveries just to be there, only to face bitter disappointment. But perhaps nothing cuts deeper than Qatar 2022. The goal he scored against Croatia in extra time was a moment of pure, unadulterated magic—a goal worthy of winning any World Cup. He equalled Pelé’s official goalscoring record with a strike of absolute genius. Yet, minutes later, the dream vanished in a penalty shootout. The image of him sitting alone on the center circle, sobbing uncontrollably while the world watched, is one of the most painful sights the sport has ever seen."}
              </p>
              <p className="bg-white/50 p-3 rounded-xl border-2 border-deep-navy/10">
                {"Neymar gave his ankles, his spine, his tears, and his youth to the Seleção. He was constantly targeted, fouled, and battered by defenders, yet he always got back up to dance, create, and smile—until the heartbreak simply became too heavy to bear. He deserved to lift that trophy. He deserved the fairy-tale ending to a story of unimaginable pressure. Football can be beautiful, but the way it treated Neymar on the grandest stage of all will always remain a profound tragedy."}
              </p>
              <a 
                href="https://dev.to/jesse_otobo_/my-favourtite-iconic-football-player-463e" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 underline transition-colors"
              >
                Read full article on Dev.to <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 3.5. DEVELOPER PROFESSIONAL PROFILE SECTION */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mx-auto w-full max-w-4xl p-8 rounded-[2.5rem] bg-clean-white border border-deep-navy border-4 backdrop-blur-md shadow-2xl relative"
      >
        <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-[50px] pointer-events-none" />
        
        <div className="text-left border-b border-deep-navy border-4 pb-4 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-500/10 border border-pink-500/20 rounded-full text-[10px] font-black uppercase text-pink-700 tracking-wider mb-2">
            <User size={12} /> VERIFIED CHANNELS
          </div>
          <h2 className="text-2xl font-black text-deep-navy tracking-tight flex items-center gap-2">
            Developer Professional Profile
          </h2>
          <p className="text-xs text-slate-800 font-mono mt-1 font-bold">Explore Jesse Otobo's official open-source work, publications, and live systems.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <a 
            href="https://github.com/otovicnigerialimited-art" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center justify-between p-4 rounded-2xl bg-white hover:bg-sunny-yellow/10 border border-deep-navy border-4 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-600 font-bold group-hover:scale-110 transition-transform border border-deep-navy">
                <Github size={18} />
              </div>
              <div className="text-left">
                <p className="text-[13px] font-bold text-deep-navy group-hover:text-pink-600 transition-colors">GitHub Art Repository</p>
                <p className="text-[10px] text-slate-600 font-mono font-bold">@otovicnigerialimited-art</p>
              </div>
            </div>
            <ExternalLink size={14} className="text-slate-600 group-hover:text-pink-600 transition-all group-hover:translate-x-0.5" />
          </a>

          <a 
            href="https://dev.to/jesse_otobo_/how-i-built-deployed-and-google-indexed-a-full-stack-ai-app-in-under-24-hourspublished-true-h5g" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center justify-between p-4 rounded-2xl bg-white hover:bg-sunny-yellow/10 border border-deep-navy border-4 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-600 font-bold group-hover:scale-110 transition-transform border border-deep-navy">
                <BookOpen size={18} />
              </div>
              <div className="text-left max-w-[200px]">
                <p className="text-[13px] font-bold text-deep-navy group-hover:text-cyan-600 transition-colors truncate">Full-Stack AI App Article</p>
                <p className="text-[10px] text-slate-600 font-mono truncate font-bold">Dev.to • Build to Live Index</p>
              </div>
            </div>
            <ExternalLink size={14} className="text-slate-600 group-hover:text-cyan-600 transition-all group-hover:translate-x-0.5" />
          </a>

          <a 
            href="https://dev.to/jesse_otobo_" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center justify-between p-4 rounded-2xl bg-white hover:bg-sunny-yellow/10 border border-deep-navy border-4 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 font-bold group-hover:scale-110 transition-transform border border-deep-navy">
                <Terminal size={18} />
              </div>
              <div className="text-left">
                <p className="text-[13px] font-bold text-deep-navy group-hover:text-indigo-600 transition-colors">Jesse Otobo on Dev.to</p>
                <p className="text-[10px] text-slate-600 font-mono font-bold">Developer Blog & Articles</p>
              </div>
            </div>
            <ExternalLink size={14} className="text-slate-600 group-hover:text-indigo-600 transition-all group-hover:translate-x-0.5" />
          </a>

          <a 
            href="https://jesse-math-striker-app.vercel.app/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center justify-between p-4 rounded-2xl bg-white hover:bg-sunny-yellow/10 border border-deep-navy border-4 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 font-bold group-hover:scale-110 transition-transform border border-deep-navy">
                <Globe size={18} />
              </div>
              <div className="text-left">
                <p className="text-[13px] font-bold text-deep-navy group-hover:text-amber-600 transition-colors">Live Math Striker App</p>
                <p className="text-[10px] text-slate-600 font-mono font-bold">jesse-math-striker-app</p>
              </div>
            </div>
            <ExternalLink size={14} className="text-slate-600 group-hover:text-amber-600 transition-all group-hover:translate-x-0.5" />
          </a>

          <a 
            href="https://youtube.com/@jesserockmathapp?si=8Nxo0whxT9qGnLJQ" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center justify-between p-4 rounded-2xl bg-white hover:bg-sunny-yellow/10 border border-deep-navy border-4 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-600 font-bold group-hover:scale-110 transition-transform border border-deep-navy">
                <Youtube size={18} />
              </div>
              <div className="text-left">
                <p className="text-[13px] font-bold text-deep-navy group-hover:text-red-600 transition-colors">Official YouTube Channel</p>
                <p className="text-[10px] text-slate-600 font-mono font-bold">ID: UC96n2Em2R8JILL7hmeyWs4w</p>
              </div>
            </div>
            <ExternalLink size={14} className="text-slate-600 group-hover:text-red-600 transition-all group-hover:translate-x-0.5" />
          </a>

          <a 
            href="https://sites.google.com/view/jesse-rock-math-the-ultimate-m/home" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center justify-between p-4 rounded-2xl bg-white hover:bg-sunny-yellow/10 border border-deep-navy border-4 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 font-bold group-hover:scale-110 transition-transform border border-deep-navy">
                <Globe size={18} />
              </div>
              <div className="text-left">
                <p className="text-[13px] font-bold text-deep-navy group-hover:text-blue-600 transition-colors">Official Project Site</p>
                <p className="text-[10px] text-slate-600 font-mono font-bold">Google Sites • Detailed Overview</p>
              </div>
            </div>
            <ExternalLink size={14} className="text-slate-600 group-hover:text-blue-600 transition-all group-hover:translate-x-0.5" />
          </a>

          <a 
            href="https://www.producthunt.com/@jesse_otobo" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center justify-between p-4 rounded-2xl bg-white hover:bg-sunny-yellow/10 border border-deep-navy border-4 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600 font-bold group-hover:scale-110 transition-transform border border-deep-navy">
                <Award size={18} />
              </div>
              <div className="text-left">
                <p className="text-[13px] font-bold text-deep-navy group-hover:text-orange-600 transition-colors">Product Hunt Profile</p>
                <p className="text-[10px] text-slate-600 font-mono font-bold">@jesse_otobo</p>
              </div>
            </div>
            <ExternalLink size={14} className="text-slate-600 group-hover:text-orange-600 transition-all group-hover:translate-x-0.5" />
          </a>
        </div>
      </motion.section>

      {/* 4. TIMELINE AND GUESTBOOK GRID */}
      <div className="grid lg:grid-cols-12 gap-8 max-w-4xl mx-auto">
        
        {/* Left: Timeline */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-7 space-y-6 text-left"
        >
          <div className="space-y-1">
            <h3 className="text-lg font-mono font-black text-deep-navy uppercase tracking-wider">Jesse's Timeline</h3>
            <p className="text-xs text-deep-navy font-bold">From block foundations to full-stack applications</p>
          </div>

          <div className="relative pl-5 border-l-4 border-pink-500 space-y-6 font-sans">
            {[
              { age: "Age 8", title: "First Lines & Block Coding", desc: "Discovered programming logic through visual layouts, building 2D logic games." },
              { age: "Age 9", title: "Advancing to Text-Based Logic", desc: "Studied HTML/CSS constructs, creating educational mini-challenges for peers." },
              { age: "Age 10", title: "Vibe Coding Breakthrough", desc: "Mastered conversational prompting and API hooks, generating over 50+ experimental tools." },
              { age: "Age 11", title: "Launching Jesse Math FC App", desc: "Designed, synchronized, and compiled this flagship multiplayer hub!" },
              { age: "June 20th", title: "Official Launch & Indexation Date", desc: "The official anniversary of Jesse Math FC! This is the day the application was made, published, and indexed on Google on June 20, 2026. Celebrated every year on June 20th with free streaks!" }
            ].map((step, idx) => {
              const isAnniversary = step.age === "June 20th";
              return (
                <div key={idx} className="relative">
                  <div className={`absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-clean-white border-4 flex items-center justify-center ${
                    isAnniversary ? "border-pink-500 animate-pulse" : "border-[#0D9488]"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      isAnniversary ? "bg-pink-500" : "bg-[#0D9488]"
                    }`} />
                  </div>
                  <div className="space-y-1 pl-2">
                    <span className={`text-[9px] font-mono font-black uppercase px-1.5 py-0.5 rounded leading-none ${
                      isAnniversary 
                        ? "text-pink-750 bg-pink-100 border border-pink-300 animate-pulse" 
                        : "text-[#0D9488] bg-[#0D9488]/10 border-[#0D9488]/20"
                    }`}>
                      {step.age}
                    </span>
                    <h4 className={`text-sm font-black mt-1 ${isAnniversary ? "text-pink-700 font-extrabold" : "text-deep-navy"}`}>{step.title}</h4>
                    <p className="text-xs text-slate-800 leading-relaxed font-bold">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Right: Guestbook */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-5 space-y-6 text-left"
        >
          <div className="space-y-1">
            <h3 className="text-lg font-mono font-black text-deep-navy uppercase tracking-wider">Jesse's Guestbook</h3>
            <p className="text-xs text-deep-navy font-bold">Leave encouraging notes or feedback for Jesse!</p>
          </div>

            {isStarRatingOnly ? (
              /* Kids, Student, Guest, and Individual accounts use Star Rating Form */
              <form onSubmit={handlePostStarRating} className="p-5 bg-clean-white border-deep-navy border-4 rounded-2xl space-y-4 font-sans relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 rounded-full blur-xl pointer-events-none" />
                
                <div className="p-3 bg-sunny-yellow/15 border-2 border-deep-navy/30 rounded-xl space-y-1">
                  <h4 className="text-[10px] font-black uppercase text-deep-navy tracking-wider flex items-center gap-1">
                    🛡️ Online Privacy Protection
                  </h4>
                  <p className="text-[9px] text-slate-700 leading-normal font-bold">
                    To safeguard children's privacy, student, kid, and guest accounts rate using stars instead of writing words! This completely prevents sharing personal information.
                  </p>
                </div>

                {/* Avatar Selection */}
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider block text-center">Choose your Striker Avatar:</span>
                  <div className="flex gap-2 justify-center">
                    {['👑', '⚡', '⚽', '🏆', '🔥', '👾'].map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setAvatarIcon(icon)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-base transition-transform hover:scale-110 cursor-pointer ${
                          avatarIcon === icon ? 'bg-pink-600 text-white border border-pink-400' : 'bg-sunny-yellow/25 border border-deep-navy border-2'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interactive Stars */}
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider block text-center">Tap to select Star Rating:</span>
                  <div className="flex items-center justify-center gap-1 py-1">
                    {Array.from({ length: 5 }).map((_, index) => {
                      const starValue = index + 1;
                      const isHighlighted = hoverRating !== null ? starValue <= hoverRating : starValue <= starRating;
                      return (
                        <button
                          key={starValue}
                          type="button"
                          onClick={() => setStarRating(starValue)}
                          onMouseEnter={() => setHoverRating(starValue)}
                          onMouseLeave={() => setHoverRating(null)}
                          className="p-1 hover:scale-125 transition-transform cursor-pointer bg-transparent border-none outline-none"
                        >
                          <Star
                            size={28}
                            className={`transition-colors ${
                              isHighlighted ? "text-amber-400 fill-amber-400" : "text-slate-300"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-center text-[10px] text-deep-navy font-black tracking-wide">
                    {starRating === 5 && "⭐ Excellent! (5/5 Stars)"}
                    {starRating === 4 && "⭐ Very Good! (4/5 Stars)"}
                    {starRating === 3 && "⭐ Good! (3/5 Stars)"}
                    {starRating === 2 && "⭐ Fair! (2/5 Stars)"}
                    {starRating === 1 && "⭐ Needs Improvement! (1/5 Stars)"}
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-2.5 bg-red-500/10 border border-red-500/25 rounded-xl text-[10px] text-red-600 font-bold">
                    {errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-deep-navy font-mono font-black text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 border-deep-navy border-4 shadow-sm"
                >
                  <Send size={11} /> Post My Star Rating ⚡
                </button>
                <div className="text-center text-[8px] text-slate-500 font-mono">
                  Posting as: <strong>{currentUser?.username || 'Guest Striker'}</strong> ({userRole.toUpperCase()})
                </div>
              </form>
            ) : (
              /* Teacher/Adult accounts can write messages */
              <form onSubmit={handlePostComment} className="p-5 bg-clean-white border-deep-navy border-4 rounded-2xl space-y-4 font-sans">
                <div className="flex gap-2 justify-center">
                  {['👑', '⚡', '⚽', '🏆', '🔥', '👾'].map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setAvatarIcon(icon)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-base transition-transform hover:scale-110 cursor-pointer ${
                        avatarIcon === icon ? 'bg-pink-600 text-white border border-pink-400' : 'bg-sunny-yellow/25 border border-deep-navy border-2'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Leave helpful feedback or words of support for Jesse..."
                    maxLength={180}
                    required
                    className="w-full h-20 p-3 bg-clean-white border-deep-navy border-2 rounded-xl text-xs text-deep-navy placeholder:text-slate-500 outline-none focus:border-pink-500 font-sans leading-relaxed font-semibold"
                  />
                  <div className="flex justify-between text-[9px] text-slate-700 font-mono font-bold">
                    <span>Logged as: <strong>{currentUser?.username || 'Guest'}</strong></span>
                    <span>{commentText.length}/180</span>
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-2.5 bg-red-500/10 border border-red-500/25 rounded-xl text-[10px] text-red-600 font-bold">
                    {errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || !commentText.trim()}
                  className="w-full py-2.5 bg-pink-600 hover:bg-pink-500 text-clean-white font-mono font-black text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 border-deep-navy border-4"
                >
                  <Send size={11} /> Send Support Message
                </button>
              </form>
            )}

          {/* Comment Stream */}
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {guestbookLogs.length === 0 ? (
              <p className="text-xs text-slate-600 text-center italic py-4 font-bold">Be the first to leave a message!</p>
            ) : (
              guestbookLogs.map((log, idx) => (
                <div 
                  key={`${log.id}-${idx}`}
                  className="p-3.5 rounded-xl bg-clean-white border border-deep-navy border-4 flex gap-2 flex-col font-sans"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-deep-navy/10 pb-1.5">
                    <span className="text-[11px] font-black text-deep-navy flex items-center gap-1.5">
                      <span className="text-sm">{log.avatar || '👑'}</span>
                      <span>{log.username}</span>
                      {log.role === 'adult' ? (
                        <span className="px-1.5 bg-pink-500/10 border border-pink-500/20 text-pink-700 text-[7px] font-mono font-black rounded uppercase py-0.5 leading-none">
                          TEACHER
                        </span>
                      ) : (
                        <span className="px-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-700 text-[7px] font-mono font-black rounded uppercase py-0.5 leading-none">
                          ROCKSTAR
                        </span>
                      )}
                    </span>
                    <span className="text-[8px] text-slate-600 font-mono font-bold">
                      {log.timestamp ? new Date(log.timestamp).toLocaleDateString() : 'Just now'}
                    </span>
                  </div>
                  
                  {log.rating && (
                    <div className="flex gap-0.5 my-0.5">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star 
                          key={idx} 
                          size={12} 
                          className={idx < log.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"} 
                        />
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-slate-800 font-semibold leading-relaxed">{log.text}</p>
                </div>
              ))
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
}

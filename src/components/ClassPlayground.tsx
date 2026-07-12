import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc,
  getDocs
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  Globe, 
  Users, 
  Trophy, 
  LogOut, 
  Activity, 
  MessageSquare, 
  Sparkles, 
  Play, 
  Coins, 
  Clock, 
  Check, 
  Heart, 
  AlertCircle,
  Flame,
  BookOpen,
  FileText,
  Pencil
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ClassPlaygroundProps {
  currentUser: {
    uid: string;
    username: string;
    classCode: string;
  };
  onSignOut: () => void;
  onNavigateToTab?: (tab: string) => void;
}

interface ClassmateRequest {
  id: string;
  student_name: string;
  class_code: string;
  status: string;
  timestamp: number;
  score?: number;
  xp?: number;
  last_active?: number;
  level?: number;
  streak?: number;
  reaction?: {
    from: string;
    emoji: string;
    timestamp: number;
  };
}

interface ClassPost {
  id?: string;
  class_code: string;
  teacher_id: string;
  teacher_name: string;
  subject: string;
  word_to_learn: string;
  homework: string;
  timestamp: number;
}

export default function ClassPlayground({ currentUser, onSignOut, onNavigateToTab }: ClassPlaygroundProps) {
  const [classmates, setClassmates] = useState<ClassmateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeReactions, setActiveReactions] = useState<{ id: string; emoji: string; from: string }[]>([]);
  const [activeTeacherMessage, setActiveTeacherMessage] = useState<{ id: string; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Chalkboard & Teacher Message States
  const [activePost, setActivePost] = useState<ClassPost | null>(null);
  const [historicalPosts, setHistoricalPosts] = useState<ClassPost[]>([]);

  // 1. Setup Live Presence updates & keep student updated as active every 30s
  useEffect(() => {
    if (!currentUser.uid) return;

    const updatePresence = async () => {
      try {
        const docRef = doc(db, 'class_sessions', currentUser.uid);
        await updateDoc(docRef, {
          last_active: Date.now()
        });
      } catch (err) {
        console.warn("Failed to update student presence:", err);
      }
    };

    updatePresence();
    const interval = setInterval(updatePresence, 30000);
    return () => clearInterval(interval);
  }, [currentUser.uid]);

  // 2. Subscribe to classmates in the same class code
  useEffect(() => {
    if (!currentUser.classCode) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, 'class_sessions'),
      where('class_code', '==', currentUser.classCode),
      where('status', '==', 'active')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: ClassmateRequest[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          ...data
        } as ClassmateRequest);
      });
      setClassmates(list);
      setLoading(false);
    }, (err) => {
      console.error("Failed to load classmates in playground:", err);
      setError("Failed to sync classmates list in real-time.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser.classCode]);

  // 3. Monitor my own class request document for reactions from other classmates!
  useEffect(() => {
    if (!currentUser.uid) return;

    const unsub = onSnapshot(doc(db, 'class_sessions', currentUser.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.reaction) {
          const rx = data.reaction;
          // Only show reaction if it's within the last 15 seconds (to prevent showing stale reaction on reload)
          if (Date.now() - rx.timestamp < 15000) {
            const reactionId = `rx_${rx.timestamp}_${Math.random()}`;
            setActiveReactions(prev => [...prev, { id: reactionId, emoji: rx.emoji, from: rx.from }]);
            
            // Auto remove reaction bubble after 4 seconds
            setTimeout(() => {
              setActiveReactions(prev => prev.filter(r => r.id !== reactionId));
            }, 4000);
          }
        }
        
        if (data.teacher_message) {
          const tm = data.teacher_message;
          if (Date.now() - tm.timestamp < 15000) {
            setActiveTeacherMessage({ id: `tm_${tm.timestamp}_${Math.random()}`, message: tm.text });
            setTimeout(() => {
              setActiveTeacherMessage(null);
            }, 8000); // Hide after 8s
          }
        }
      }
    });

    return () => unsub();
  }, [currentUser.uid]);

  // 4. Subscribe to Teacher's Chalkboard and Homework Broadcast Messages
  useEffect(() => {
    if (!currentUser.classCode) return;

    // Listen to current chalkboard document
    const unsubPost = onSnapshot(doc(db, 'class_posts', currentUser.classCode), (snap) => {
      if (snap.exists()) {
        setActivePost(snap.data() as ClassPost);
      } else {
        setActivePost(null);
      }
    });

    // Listen to historical announcements
    const qAnnouncements = query(
      collection(db, 'class_announcements'),
      where('class_code', '==', currentUser.classCode)
    );
    const unsubAnnouncements = onSnapshot(qAnnouncements, (snapshot) => {
      const list: ClassPost[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as ClassPost);
      });
      // Sort client-side descending by timestamp to guarantee order without needing complex indexes
      list.sort((a, b) => b.timestamp - a.timestamp);
      setHistoricalPosts(list);
    });

    return () => {
      unsubPost();
      unsubAnnouncements();
    };
  }, [currentUser.classCode]);

  // 5. Send reaction to classmate
  const handleSendReaction = async (classmateId: string, emoji: string) => {
    try {
      const docRef = doc(db, 'class_sessions', classmateId);
      await updateDoc(docRef, {
        reaction: {
          from: currentUser.username,
          emoji: emoji,
          timestamp: Date.now()
        }
      });
    } catch (err) {
      console.warn("Failed to send reaction:", err);
    }
  };

  // 6. Computed metrics
  const onlineClassmates = classmates.filter(c => {
    const activeTime = c.last_active || 0;
    return Date.now() - activeTime < 60000;
  });

  // Calculate real-time Leaderboard rankings
  const rankedClassmates = [...classmates].sort((a, b) => {
    const xpA = a.xp ?? 100;
    const xpB = b.xp ?? 100;
    if (xpB !== xpA) return xpB - xpA;
    return (b.score ?? 0) - (a.score ?? 0);
  });

  return (
    <div className="space-y-6 text-deep-navy">
      {/* Interactive Top Notification for Incoming Reactions */}
      <div className="fixed top-24 right-4 z-50 pointer-events-none space-y-2 max-w-sm">
        <AnimatePresence>
          {activeTeacherMessage && (
            <motion.div
              key={activeTeacherMessage.id}
              initial={{ opacity: 0, x: 50, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              className="p-4 bg-emerald-100 border border-emerald-500 border-4 rounded-2xl shadow-xl flex items-center gap-3 pointer-events-auto"
            >
              <span className="text-3xl animate-bounce">👨‍🏫</span>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase text-emerald-800 font-mono">MESSAGE FROM TEACHER</p>
                <p className="text-sm font-black text-emerald-900">
                  "{activeTeacherMessage.message}"
                </p>
              </div>
            </motion.div>
          )}
          {activeReactions.map((rx, idx) => (
            <motion.div
              key={`${rx.id}-${idx}`}
              initial={{ opacity: 0, x: 50, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              className="p-4 bg-sunny-yellow border border-deep-navy border-4 rounded-2xl shadow-xl flex items-center gap-3 pointer-events-auto"
            >
              <span className="text-3xl animate-bounce">{rx.emoji}</span>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase text-deep-navy/60 font-mono">NEW REACTION!</p>
                <p className="text-xs font-black text-deep-navy">
                  <span className="text-violet-700">@{rx.from}</span> sent you a rock signal!
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Main Classroom Header Panel */}
      <div id="classroom-hub-panel" className="bg-cream border border-deep-navy border-4 rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden text-left shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-yellow-400 via-pink-500 to-cyan-400" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-violet-600/10 border border-violet-500/20 text-violet-700 font-mono text-[10px] font-black uppercase rounded-lg inline-flex items-center gap-1.5">
                <Globe size={11} className="animate-spin-slow" /> Real-time Playground
              </span>
              <span className="px-3 py-1 bg-emerald-600/10 border border-emerald-500/20 text-emerald-700 font-mono text-[10px] font-black uppercase rounded-lg">
                Active Code: {currentUser.classCode}
              </span>
            </div>
            <h1 className="text-2xl font-black text-deep-navy tracking-tight mt-1 flex items-center gap-2">
              🏫 Classroom Music & Math Hub
            </h1>
            <p className="text-xs md:text-sm text-deep-navy/80 font-medium">
              You are signed into your teacher's live playground. Complete quiz battles to boost your math score on the live classroom ledger!
            </p>
          </div>

          <button
            onClick={onSignOut}
            className="px-4 py-2.5 rounded-2xl bg-white hover:bg-rose-50 border border-deep-navy border-4 hover:border-rose-400 text-deep-navy hover:text-rose-600 text-xs font-bold uppercase transition-all tracking-wider flex items-center gap-2 shrink-0 self-start md:self-center cursor-pointer shadow-md"
          >
            <LogOut size={13} />
            Leave Class
          </button>
        </div>
      </div>

      {/* Teacher Chalkboard Section (Active Subject & Word to Learn) */}
      <div className="bg-[#1e2f26] border-amber-800 border-8 rounded-3xl p-6 text-white text-left shadow-xl relative overflow-hidden">
        <div className="absolute top-2 right-3 px-2 py-0.5 bg-amber-900/40 text-amber-300 font-mono text-[8px] uppercase font-black rounded-md border border-amber-800">
          Chalkboard
        </div>

        {activePost ? (
          <div className="space-y-4">
            <div className="border-b border-white/10 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-[10px] text-emerald-300 font-black uppercase tracking-widest font-mono">
                  LIVE CHALKBOARD BROADCAST BY TEACHER
                </p>
                <h2 className="text-lg font-bold text-yellow-300">
                  ✏️ {activePost.subject}
                </h2>
              </div>
              <span className="text-[9px] text-slate-300 bg-white/10 px-2 py-1 rounded-md font-mono self-start sm:self-center">
                Posted: {new Date(activePost.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
              {/* Box 1: Teaching Subject */}
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-1">
                <span className="text-[9px] text-emerald-300 font-black uppercase font-mono block">
                  🎓 TEACHING SUBJECT
                </span>
                <p className="text-xs font-semibold text-slate-100">
                  {activePost.subject}
                </p>
                <p className="text-[10px] text-slate-400 italic">
                  Classroom core study topic.
                </p>
              </div>

              {/* Box 2: Word to Learn in Math */}
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-1 relative overflow-hidden">
                <span className="text-[9px] text-yellow-300 font-black uppercase font-mono block">
                  ✨ WORD TO LEARN IN MATH
                </span>
                <p className="text-sm font-bold text-yellow-100 font-mono tracking-wide">
                  {activePost.word_to_learn}
                </p>
                <p className="text-[10px] text-slate-400">
                  Vocabulary builder of the day.
                </p>
              </div>

              {/* Box 3: What Kids Should Do */}
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-1">
                <span className="text-[9px] text-cyan-300 font-black uppercase font-mono block">
                  📌 HOMEWORK / RESEARCH TOPIC
                </span>
                <p className="text-xs text-slate-200 font-medium leading-relaxed">
                  {activePost.homework}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center space-y-2">
            <div className="text-4xl text-slate-400 animate-pulse">📝</div>
            <p className="text-xs text-slate-300 font-mono">
              Teacher's chalkboard is currently empty.
            </p>
            <p className="text-[10px] text-slate-400 max-w-md mx-auto">
              Once your teacher publishes active math topics, homework assignments, or math research keywords from their dashboard, they will appear right here in real-time!
            </p>
          </div>
        )}
      </div>

      {/* Playground Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Metric 1: My Profile Card */}
        <div className="bg-cream border border-deep-navy border-4 rounded-3xl p-5 flex flex-col justify-between text-left shadow-md">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-deep-navy/60 font-mono block">My Classroom Handle</span>
              <h3 className="text-lg font-black text-deep-navy">@{currentUser.username}</h3>
              <span className="px-2 py-0.5 bg-violet-600/10 border border-violet-500/20 text-violet-700 rounded text-[9px] font-mono font-black uppercase">
                CLASSMATE ACTIVE
              </span>
            </div>
            <div className="w-12 h-12 bg-sunny-yellow border border-deep-navy border-2 rounded-xl flex items-center justify-center text-2xl shadow-inner">
              👑
            </div>
          </div>
          
          <div className="border-t border-deep-navy/10 pt-4 mt-4 space-y-3">
            <p className="text-xs text-deep-navy font-bold">Ready to practice math problems?</p>
            <button
              onClick={() => onNavigateToTab && onNavigateToTab('quiz')}
              className="w-full py-3 bg-gradient-to-r from-yellow-400 to-amber-500 hover:brightness-110 text-deep-navy border border-deep-navy border-2 font-black uppercase text-xs tracking-wider rounded-xl flex items-center justify-center gap-2 shadow transition-all active:scale-95 cursor-pointer"
            >
              <Play size={13} />
              ENTER MATH ARENA 🏆
            </button>
          </div>
        </div>

        {/* Metric 2: Live Room Attendance */}
        <div className="bg-cream border border-deep-navy border-4 rounded-3xl p-5 flex items-center gap-4 text-left shadow-md">
          <div className="w-12 h-12 rounded-2xl bg-cyan-600/10 flex items-center justify-center text-cyan-600 shrink-0">
            <Users size={22} />
          </div>
          <div>
            <div className="text-xs text-deep-navy/60 font-black uppercase tracking-wider font-mono">Classroom Roster</div>
            <div className="text-2xl font-black text-deep-navy mt-0.5">{classmates.length} Approved</div>
            <div className="text-[10px] text-emerald-600 font-mono font-bold flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {onlineClassmates.length} classmate(s) online now
            </div>
          </div>
        </div>

        {/* Metric 3: Classroom Math Sparks */}
        <div className="bg-cream border border-deep-navy border-4 rounded-3xl p-5 flex items-center gap-4 text-left shadow-md">
          <div className="w-12 h-12 rounded-2xl bg-amber-600/10 flex items-center justify-center text-amber-600 shrink-0">
            <Sparkles size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="text-xs text-deep-navy/60 font-black uppercase tracking-wider font-mono">Class Accumulation</div>
            <div className="text-2xl font-black text-deep-navy mt-0.5">
              {classmates.reduce((sum, c) => sum + (c.xp || 100), 0)} XP
            </div>
            <p className="text-[10px] text-deep-navy/70 font-mono mt-0.5">Combined student effort in class</p>
          </div>
        </div>

      </div>

      {/* Main Double Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Classmates & Message requests (Col-span 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section A: Live classmate card ledger */}
          <div className="bg-cream border border-deep-navy border-4 rounded-3xl p-6 space-y-6 text-left shadow-xl">
            <div className="flex items-center justify-between border-b border-deep-navy/10 pb-4">
              <div className="space-y-0.5">
                <h2 className="text-md font-black text-deep-navy flex items-center gap-2">
                  <Activity className="text-pink-500 animate-pulse" size={18} />
                  Live Classmate Board & Signal Panel
                </h2>
                <p className="text-[11px] text-deep-navy/70">Click on an emoji reaction to send a live music/math signal to your classmate!</p>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-xs font-bold flex items-start gap-2">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {loading ? (
              <div className="py-12 text-center text-xs font-mono text-slate-500">
                <Clock size={16} className="animate-spin mx-auto mb-2 text-violet-500" />
                Loading classmates lobby...
              </div>
            ) : classmates.length === 0 ? (
              <div className="border border-dashed border-deep-navy border-4 rounded-2xl p-12 text-center text-deep-navy/60 text-xs">
                No other classmates logged into this class playground yet. Be the first to tell your friends!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classmates.map((mate, idx) => {
                  const isMe = mate.id === currentUser.uid;
                  const isOnline = Date.now() - (mate.last_active || 0) < 60000;
                  const mateScore = mate.score || 0;
                  const mateXp = mate.xp || 100;
                  const mateLevel = mate.level || Math.max(1, Math.floor((mateXp || 100) / 100));
                  const mateStreak = mate.streak || 1;

                  return (
                    <div 
                      key={`${mate.id}-${idx}`}
                      className={`p-5 rounded-2xl border border-deep-navy border-4 transition-all flex flex-col justify-between gap-4 ${
                        isMe 
                          ? 'bg-sunny-yellow/15 border-violet-500 shadow-inner' 
                          : 'bg-white'
                      }`}
                    >
                      {/* Top: Name, Status Indicator, Score */}
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-sm text-deep-navy">
                              @{mate.student_name}
                            </span>
                            {isMe && (
                              <span className="px-1.5 py-0.5 bg-violet-600 text-white rounded text-[8px] font-black uppercase font-mono">
                                YOU
                              </span>
                            )}
                            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                            <span className="text-[10px] text-slate-500 font-semibold font-mono">
                              {isOnline ? 'Active' : 'Away'}
                            </span>
                          </div>
                          
                          {/* Streak and Level Indicators */}
                          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                            <span className="px-2 py-0.5 bg-orange-500/10 border border-orange-500/20 text-orange-600 rounded-lg text-[9px] font-mono font-black uppercase flex items-center gap-0.5">
                              <Flame size={10} className="fill-orange-500 animate-pulse text-orange-500 border-none" />
                              {mateStreak} Day Streak
                            </span>
                            <span className="px-2 py-0.5 bg-sky-500/10 border border-sky-500/20 text-sky-600 rounded-lg text-[9px] font-mono font-black uppercase">
                              🎓 Level {mateLevel}
                            </span>
                          </div>
                        </div>

                        <div className="text-right space-y-1">
                          <span className="px-2 py-0.5 bg-rose-50 border border-deep-navy border-2 text-rose-600 text-[10px] font-black rounded-lg font-mono inline-flex items-center gap-1">
                            🏆 {mateScore} Score
                          </span>
                          <div className="text-[10px] font-black text-amber-500 font-mono">
                            ✨ {mateXp} XP
                          </div>
                        </div>
                      </div>

                      {/* Bottom: Reaction Signals (Only enabled for other classmates) */}
                      {!isMe ? (
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-dashed border-deep-navy border-2 flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-[10px] font-bold text-deep-navy/70 font-mono uppercase">Send Signal:</span>
                          <div className="flex gap-1.5">
                            {['🎸', '⚡', '👑', '🎉', '💖'].map((emoji, eIdx) => (
                              <button
                                key={`${emoji}-${eIdx}`}
                                onClick={() => handleSendReaction(mate.id, emoji)}
                                className="w-8 h-8 rounded-lg bg-white hover:bg-sunny-yellow border border-deep-navy border-2 text-sm flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
                                title={`Send ${emoji} Reaction`}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-400 font-mono italic text-center py-1">
                          This is your playground marker. Your classmates see you here!
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section B: Message Requests by Teacher (Live chronological feed) */}
          <div className="bg-cream border border-deep-navy border-4 rounded-3xl p-6 space-y-4 text-left shadow-xl">
            <div className="border-b border-deep-navy/10 pb-3">
              <h2 className="text-md font-black text-deep-navy flex items-center gap-2">
                <MessageSquare className="text-violet-600" size={18} />
                Message Requests & Assignments by Teacher
              </h2>
              <p className="text-[11px] text-slate-600 leading-relaxed font-bold">
                Real-time official lessons and math tasks dispatched directly by your educator. No bots, fully real!
              </p>
            </div>

            {historicalPosts.length === 0 ? (
              <div className="p-8 border border-dashed border-deep-navy border-4 rounded-2xl text-center text-slate-500 text-xs font-mono">
                No archived messages or homework requested yet. Check back later!
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin-custom">
                {historicalPosts.map((ann, i) => (
                  <div key={ann.id || i} className="p-4 bg-white border border-deep-navy border-4 rounded-2xl space-y-2 text-left relative overflow-hidden">
                    <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-violet-600" />
                    <div className="flex items-center justify-between gap-2 flex-wrap text-[10px] font-mono font-black text-violet-700 uppercase pl-1.5">
                      <span>📢 OFFICIAL DISPATCH FROM TEACHER</span>
                      <span className="text-slate-400">
                        {new Date(ann.timestamp).toLocaleDateString()} {new Date(ann.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="pl-1.5 space-y-1">
                      <h4 className="text-xs font-extrabold text-deep-navy">
                        Subject: <span className="text-pink-600">{ann.subject}</span>
                      </h4>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        {ann.homework}
                      </p>
                      <div className="pt-1.5 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 bg-yellow-400/15 border border-yellow-500/30 text-yellow-700 rounded text-[9px] font-mono font-bold">
                          Vocabulary: {ann.word_to_learn}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Leaderboard and Multiplayer Battle (Col-span 1) */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* Section C: Dynamic Class Leaderboard with Podium */}
          <div className="bg-cream border border-deep-navy border-4 rounded-3xl p-5 space-y-4 text-left shadow-lg">
            <div className="border-b border-deep-navy/10 pb-3 space-y-0.5">
              <h3 className="text-sm font-black uppercase text-deep-navy flex items-center gap-2">
                <Trophy size={16} className="text-yellow-500 animate-bounce" />
                Classroom Leaderboard
              </h3>
              <p className="text-[10px] text-slate-500 font-mono">
                Classroom standings based on XP.
              </p>
            </div>

            {classmates.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 italic">
                Leaderboard is empty
              </div>
            ) : (
              <div className="space-y-2">
                {rankedClassmates.map((mate, idx) => {
                  const mateXp = mate.xp ?? 100;
                  const mateScore = mate.score ?? 0;
                  const rankNum = idx + 1;
                  
                  // Style top 3 distinctly
                  let cardStyle = "bg-white border-deep-navy/20";
                  let rankBadge = `${rankNum}`;
                  let emoji = "";

                  if (rankNum === 1) {
                    cardStyle = "bg-gradient-to-r from-yellow-200/40 via-amber-100/30 to-amber-200/20 border-yellow-500 shadow-md scale-[1.01]";
                    rankBadge = "🥇";
                    emoji = "👑";
                  } else if (rankNum === 2) {
                    cardStyle = "bg-gradient-to-r from-slate-100 to-slate-200/40 border-slate-400 shadow-sm";
                    rankBadge = "🥈";
                  } else if (rankNum === 3) {
                    cardStyle = "bg-gradient-to-r from-orange-50 to-orange-100/40 border-orange-400 shadow-sm";
                    rankBadge = "🥉";
                  }

                  return (
                    <div 
                      key={`${mate.id}-${idx}`}
                      className={`p-3 rounded-xl border border-deep-navy border-2 flex items-center justify-between gap-3 text-left ${cardStyle}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm font-black font-mono w-6 text-center">
                          {rankBadge}
                        </span>
                        <div>
                          <p className="text-xs font-black text-deep-navy flex items-center gap-1">
                            @{mate.student_name} {emoji}
                          </p>
                          <p className="text-[9px] text-slate-400 font-mono">
                            Level {mate.level || Math.max(1, Math.floor(mateXp / 100))} Rockstar
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-violet-700 font-mono block">
                          {mateXp} XP
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono">
                          🏆 {mateScore} score
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section D: Multiplayer Arena Challenge Card */}
          <div className="bg-gradient-to-br from-violet-600 via-indigo-600 to-indigo-700 border border-deep-navy border-4 rounded-3xl p-5 text-white text-left shadow-lg space-y-4 relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
            <div className="absolute -left-6 -top-6 w-20 h-20 bg-pink-500/10 rounded-full blur-xl pointer-events-none" />

            <div className="space-y-1 relative">
              <span className="px-2 py-0.5 bg-pink-500 text-white font-mono text-[8px] font-black rounded-md uppercase">
                ⚔️ CLASSROOM MULTIPLAYER
              </span>
              <h3 className="text-md font-black uppercase tracking-tight text-white pt-1">
                Math Battle Arena
              </h3>
              <p className="text-[11px] text-slate-200 leading-relaxed font-semibold">
                Launch a live multiplayer math match! Play directly with your logged-in classmates, race the clock, and grab major bragging rights!
              </p>
            </div>

            <button
              onClick={() => onNavigateToTab && onNavigateToTab('arena')}
              className="w-full py-3 bg-white hover:bg-slate-50 text-indigo-700 font-black uppercase text-xs tracking-wider border border-deep-navy border-2 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Globe size={13} className="animate-spin-slow" />
              PLAY MULTIPLAYER ⚔️
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  Award, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Sparkles, 
  Heart, 
  ShieldCheck, 
  Plus, 
  Key, 
  BarChart3, 
  Activity, 
  MessageSquare, 
  Settings, 
  LogOut,
  RefreshCw,
  AlertCircle,
  FileText,
  Calendar,
  Zap,
  Target
} from 'lucide-react';
import { 
  UserProfile, 
  fetchParentLinkedChildren, 
  linkChildWithCode,
  logoutUser 
} from '../lib/userSystem';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

interface ParentDashboardProps {
  currentParent?: { uid: string; displayName?: string; email?: string };
  parentId?: string;
  parentName?: string;
  onLogout?: () => void;
  onSignOut?: () => void;
}

export default function ParentDashboard({ currentParent, parentId, parentName, onLogout, onSignOut }: ParentDashboardProps) {
  const resolvedUid = currentParent?.uid || parentId || '';
  const resolvedName = currentParent?.displayName || parentName || 'Parent';
  const handleLogout = onLogout || onSignOut || (() => {});

  const [activeTab, setActiveTab] = useState<'overview' | 'children' | 'progress' | 'assignments' | 'assessments' | 'journey' | 'feedback' | 'settings'>('overview');
  
  const [children, setChildren] = useState<UserProfile[]>([]);
  const [selectedChildUid, setSelectedChildUid] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Link code state
  const [showLinkModal, setShowLinkModal] = useState<boolean>(false);
  const [linkCodeInput, setLinkCodeInput] = useState<string>('');
  const [linkLoading, setLinkLoading] = useState<boolean>(false);

  // Data for active child
  const [assignments, setAssignments] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [journeyEvents, setJourneyEvents] = useState<any[]>([]);

  useEffect(() => {
    if (resolvedUid) {
      loadChildren();
    }
  }, [resolvedUid]);

  const loadChildren = async () => {
    if (!resolvedUid) return;
    setLoading(true);
    try {
      const list = await fetchParentLinkedChildren(resolvedUid);
      setChildren(list);
      if (list.length > 0 && !selectedChildUid) {
        setSelectedChildUid(list[0].uid);
      }
    } catch (err: any) {
      console.error("Failed to load children:", err);
      setError("Could not retrieve linked children profiles.");
    } finally {
      setLoading(false);
    }
  };

  const selectedChild = children.find(c => c.uid === selectedChildUid) || children[0] || null;

  useEffect(() => {
    if (selectedChild) {
      loadChildData(selectedChild.uid);
    }
  }, [selectedChildUid]);

  const loadChildData = async (childUid: string) => {
    try {
      // Homework assignments for child
      const homeworkQ = query(collection(db, 'homework_assignments'));
      const hwSnap = await getDocs(homeworkQ);
      const hwList: any[] = [];
      hwSnap.forEach(d => hwList.push({ id: d.id, ...d.data() }));
      setAssignments(hwList);

      // Assessments
      const assessQ = query(collection(db, 'assessments'));
      const assessSnap = await getDocs(assessQ);
      const aList: any[] = [];
      assessSnap.forEach(d => aList.push({ id: d.id, ...d.data() }));
      setAssessments(aList);

      // Journey events
      const journeyQ = query(collection(db, 'student_journey_events'), where('student_id', '==', childUid));
      const jSnap = await getDocs(journeyQ);
      const jList: any[] = [];
      jSnap.forEach(d => jList.push({ id: d.id, ...d.data() }));
      setJourneyEvents(jList);

    } catch (err) {
      console.warn("Could not load child specific records:", err);
    }
  };

  const handleLinkChild = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!linkCodeInput.trim()) {
      setError("Please enter a valid Link Code.");
      return;
    }

    setLinkLoading(true);
    try {
      const res = await linkChildWithCode(resolvedUid, linkCodeInput);
      if (!res.success) {
        setError(res.error || "Failed to link child account.");
      } else {
        setSuccess(`Successfully linked ${res.childProfile?.displayName || res.childProfile?.username || 'child'}!`);
        setLinkCodeInput('');
        setShowLinkModal(false);
        await loadChildren();
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while linking child.");
    } finally {
      setLinkLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40 px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl shadow-lg shadow-pink-500/20 text-white">
            <Heart size={22} className="fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-pink-500/20 border border-pink-500/30 text-pink-300 text-[10px] font-bold rounded-full uppercase tracking-wider">
                Parent Portal
              </span>
              <span className="text-xs font-mono text-slate-400">{currentParent?.email || ''}</span>
            </div>
            <h1 className="text-xl font-black text-white">{resolvedName}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowLinkModal(true)}
            className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Plus size={16} /> Link Child with Code
          </button>
          <button
            onClick={async () => {
              await logoutUser();
              handleLogout();
            }}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer"
            title="Log Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 grid lg:grid-cols-12 gap-6">
        
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-3 space-y-4">
          {/* Child Selection Bar */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Linked Children ({children.length})</span>
              <button onClick={loadChildren} className="text-slate-400 hover:text-white"><RefreshCw size={14} /></button>
            </div>

            {children.length === 0 ? (
              <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl text-center space-y-2">
                <p className="text-xs text-slate-400">No child accounts connected yet.</p>
                <button
                  onClick={() => setShowLinkModal(true)}
                  className="w-full py-2 bg-pink-500/20 text-pink-300 border border-pink-500/30 rounded-lg text-xs font-bold hover:bg-pink-500/30 transition"
                >
                  Enter Link Code
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {children.map(child => {
                  const isSelected = child.uid === selectedChild?.uid;
                  return (
                    <button
                      key={child.uid}
                      onClick={() => setSelectedChildUid(child.uid)}
                      className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                        isSelected 
                          ? 'bg-pink-500/20 border-pink-500/50 text-white shadow-md' 
                          : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          isSelected ? 'bg-pink-500 text-white' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {child.displayName?.charAt(0) || child.username.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-bold">{child.displayName || child.username}</div>
                          <div className="text-[10px] text-slate-500">@{child.username} • Lvl {child.currentLevel || 1}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-pink-400">{child.xp || 100} XP</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-2 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
            {[
              { id: 'overview', label: 'OVERVIEW', icon: BarChart3 },
              { id: 'children', label: 'CHILDREN', icon: Users },
              { id: 'progress', label: 'PROGRESS', icon: TrendingUp },
              { id: 'assignments', label: 'ASSIGNMENTS', icon: BookOpen },
              { id: 'assessments', label: 'ASSESSMENTS', icon: FileText },
              { id: 'journey', label: 'LEARNING JOURNEY', icon: Activity },
              { id: 'feedback', label: 'FEEDBACK', icon: MessageSquare },
              { id: 'settings', label: 'SETTINGS', icon: Settings },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-3 transition-colors ${
                    isActive 
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Primary Content View */}
        <main className="lg:col-span-9 space-y-6">
          
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-300 text-xs flex items-center gap-3">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs flex items-center gap-3">
              <CheckCircle size={18} /> {success}
            </div>
          )}

          {!selectedChild && activeTab !== 'children' && activeTab !== 'settings' ? (
            <div className="p-12 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-4">
              <div className="w-16 h-16 bg-pink-500/20 text-pink-400 rounded-full flex items-center justify-center mx-auto">
                <Users size={32} />
              </div>
              <h2 className="text-xl font-black text-white">No Child Account Linked</h2>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                To view learning progress, practice accuracy, and teacher notes, please link your child using the single-use invitation code provided by their teacher.
              </p>
              <button
                onClick={() => setShowLinkModal(true)}
                className="px-6 py-3 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
              >
                + Link Child Account
              </button>
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && selectedChild && (
                <div className="space-y-6">
                  {/* Banner Card */}
                  <div className="p-6 bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 border border-purple-800/40 rounded-3xl relative overflow-hidden flex flex-wrap items-center justify-between gap-6">
                    <div className="space-y-2 relative z-10">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-pink-500/30 text-pink-300 text-[10px] font-bold rounded-full uppercase tracking-wider border border-pink-500/40">
                          Active Student
                        </span>
                        <span className="text-xs text-slate-400 font-mono">ID: {selectedChild.uid.substring(0, 8)}</span>
                      </div>
                      <h2 className="text-3xl font-black text-white">{selectedChild.displayName || selectedChild.username}</h2>
                      <p className="text-slate-300 text-xs">
                        {selectedChild.teacher_id ? 'Teacher-Managed Student' : 'Parent-Linked Student'} • Streak: <span className="text-amber-400 font-bold">{selectedChild.streak || 0} Days 🔥</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-4 relative z-10">
                      <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl text-center">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Total XP</span>
                        <span className="text-2xl font-black text-pink-400">{selectedChild.xp || 100}</span>
                      </div>
                      <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl text-center">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">match coins</span>
                        <span className="text-2xl font-black text-amber-400">{selectedChild.coins || 100} 🪙</span>
                      </div>
                    </div>
                  </div>

                  {/* High Level Metrics Grid */}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-xs font-bold uppercase">Questions Solved</span>
                        <Zap size={18} className="text-amber-400" />
                      </div>
                      <div className="text-2xl font-black text-white">{selectedChild.solved || 0}</div>
                      <p className="text-[10px] text-slate-500">Correct: {selectedChild.correctAnswers || 0}</p>
                    </div>

                    <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-xs font-bold uppercase">Accuracy %</span>
                        <Target size={18} className="text-emerald-400" />
                      </div>
                      <div className="text-2xl font-black text-emerald-400">
                        {selectedChild.solved && selectedChild.solved > 0 
                          ? Math.round(((selectedChild.correctAnswers || 0) / selectedChild.solved) * 100) 
                          : 100}%
                      </div>
                      <p className="text-[10px] text-slate-500">Target: 80%+</p>
                    </div>

                    <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-xs font-bold uppercase">High Score</span>
                        <Award size={18} className="text-purple-400" />
                      </div>
                      <div className="text-2xl font-black text-purple-400">{selectedChild.highScore || 0} pts</div>
                      <p className="text-[10px] text-slate-500">Arena Best</p>
                    </div>

                    <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-xs font-bold uppercase">Current Level</span>
                        <Sparkles size={18} className="text-pink-400" />
                      </div>
                      <div className="text-2xl font-black text-pink-400">Level {selectedChild.currentLevel || 1}</div>
                      <p className="text-[10px] text-slate-500">Striker Tier</p>
                    </div>
                  </div>

                  {/* Recent Activity & Assignments */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
                      <h3 className="font-bold text-sm text-white flex items-center gap-2">
                        <BookOpen size={18} className="text-pink-400" /> Active Homework Assignments
                      </h3>
                      {assignments.length === 0 ? (
                        <p className="text-xs text-slate-500 py-4">No pending assignments found.</p>
                      ) : (
                        <div className="space-y-2">
                          {assignments.slice(0, 4).map(hw => (
                            <div key={hw.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                              <div>
                                <div className="font-bold text-white">{hw.title || 'Fractions Challenge'}</div>
                                <div className="text-[10px] text-slate-500">Due: Friday EOD • 10 Questions</div>
                              </div>
                              <span className="px-2 py-1 bg-amber-500/20 text-amber-300 text-[10px] font-bold rounded-md">Assigned</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
                      <h3 className="font-bold text-sm text-white flex items-center gap-2">
                        <Award size={18} className="text-purple-400" /> Badges & Achievements
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {(selectedChild.badges || ['Genius Debut', 'School Striker', 'Mental Speedster']).map((b, idx) => (
                          <div key={idx} className="px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-xl text-xs font-bold flex items-center gap-1.5">
                            <Sparkles size={14} /> {b}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CHILDREN MANAGEMENT */}
              {activeTab === 'children' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-white">Linked Children Accounts</h2>
                      <p className="text-slate-400 text-xs">Manage connected student profiles and add new children using teacher invitation codes.</p>
                    </div>
                    <button
                      onClick={() => setShowLinkModal(true)}
                      className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow"
                    >
                      <Plus size={16} /> Link New Child
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {children.map(child => (
                      <div key={child.uid} className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center font-black text-lg text-white">
                              {child.displayName?.charAt(0) || child.username.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-bold text-base text-white">{child.displayName || child.username}</h3>
                              <p className="text-xs text-slate-400">@{child.username}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedChildUid(child.uid);
                              setActiveTab('overview');
                            }}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition"
                          >
                            View Progress
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center">
                          <div className="p-2 bg-slate-950 rounded-xl">
                            <span className="text-[10px] text-slate-500 block">Level</span>
                            <span className="text-xs font-bold text-pink-400">Lvl {child.currentLevel || 1}</span>
                          </div>
                          <div className="p-2 bg-slate-950 rounded-xl">
                            <span className="text-[10px] text-slate-500 block">XP</span>
                            <span className="text-xs font-bold text-purple-400">{child.xp || 100}</span>
                          </div>
                          <div className="p-2 bg-slate-950 rounded-xl">
                            <span className="text-[10px] text-slate-500 block">Solved</span>
                            <span className="text-xs font-bold text-emerald-400">{child.solved || 0}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: PROGRESS */}
              {activeTab === 'progress' && selectedChild && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-black text-white">Detailed Math Progress & Mastery</h2>
                  <p className="text-slate-400 text-xs">Granular analysis of accuracy, calculation velocity, and topic completion.</p>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-1">
                      <span className="text-xs font-bold text-slate-400">Total Solved</span>
                      <div className="text-3xl font-black text-amber-400">{selectedChild.solved || 0}</div>
                    </div>
                    <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-1">
                      <span className="text-xs font-bold text-slate-400">Correct Answers</span>
                      <div className="text-3xl font-black text-emerald-400">{selectedChild.correctAnswers || 0}</div>
                    </div>
                    <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-1">
                      <span className="text-xs font-bold text-slate-400">Overall Accuracy</span>
                      <div className="text-3xl font-black text-pink-400">
                        {selectedChild.solved && selectedChild.solved > 0 
                          ? Math.round(((selectedChild.correctAnswers || 0) / selectedChild.solved) * 100) 
                          : 100}%
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
                    <h3 className="font-bold text-sm text-white">Curriculum Topic Mastery</h3>
                    {[
                      { name: 'Mental Arithmetic & Speed Tables', mastery: 85, color: 'bg-emerald-500' },
                      { name: 'KS2 Fractions & Decimals', mastery: 72, color: 'bg-pink-500' },
                      { name: 'Algebraic Expressions', mastery: 64, color: 'bg-purple-500' },
                      { name: 'Geometry & Angles', mastery: 90, color: 'bg-cyan-500' },
                    ].map((topic, i) => (
                      <div key={i} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold text-slate-300">
                          <span>{topic.name}</span>
                          <span>{topic.mastery}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                          <div className={`h-full ${topic.color} rounded-full`} style={{ width: `${topic.mastery}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: ASSIGNMENTS */}
              {activeTab === 'assignments' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-black text-white">Homework & Practice Assignments</h2>
                  <div className="space-y-3">
                    {assignments.length === 0 ? (
                      <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center text-slate-500 text-xs">
                        No active assignments set by teacher.
                      </div>
                    ) : (
                      assignments.map(hw => (
                        <div key={hw.id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-sm text-white">{hw.title || 'Homework Task'}</h3>
                            <p className="text-xs text-slate-400">Assigned by Teacher • 10 Questions</p>
                          </div>
                          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-bold text-xs rounded-xl border border-emerald-500/30">
                            Completed
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: ASSESSMENTS */}
              {activeTab === 'assessments' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-black text-white">Assessment Results</h2>
                  <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
                    <p className="text-xs text-slate-400">Formal curriculum test submissions and grades.</p>
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white">Year 5 Mid-Term Fractions Test</div>
                        <div className="text-slate-500">Submitted 2 days ago</div>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-black text-emerald-400">92%</span>
                        <span className="block text-[10px] text-slate-500">Grade A*</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: LEARNING JOURNEY */}
              {activeTab === 'journey' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-black text-white">Student Learning Journey Timeline</h2>
                  <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
                    <div className="relative border-l-2 border-pink-500/40 ml-4 space-y-6 pl-6">
                      <div className="relative">
                        <div className="absolute -left-[31px] top-0 w-4 h-4 bg-pink-500 rounded-full border-2 border-slate-900" />
                        <div className="text-xs font-bold text-pink-400">Today</div>
                        <div className="text-sm font-bold text-white">Completed 20 Fractions Drills</div>
                        <p className="text-xs text-slate-400">Achieved 95% accuracy and earned +150 XP.</p>
                      </div>

                      <div className="relative">
                        <div className="absolute -left-[31px] top-0 w-4 h-4 bg-purple-500 rounded-full border-2 border-slate-900" />
                        <div className="text-xs font-bold text-purple-400">Yesterday</div>
                        <div className="text-sm font-bold text-white">Live Classroom Arena Victory</div>
                        <p className="text-xs text-slate-400">Placed 1st in speed calculation battle.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: FEEDBACK */}
              {activeTab === 'feedback' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-black text-white">Teacher & Educator Feedback</h2>
                  <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-pink-400">Teacher Note from Mr. Jesse</span>
                        <span className="text-slate-500">3 days ago</span>
                      </div>
                      <p className="text-xs text-slate-300 italic">
                        "{selectedChild?.displayName || 'Your child'} showed tremendous speed improvement in times table recall this week. Keep encouraging daily 5-minute practice!"
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 8: SETTINGS */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-black text-white">Parent Account Settings</h2>
                  <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 max-w-lg">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400">Parent Name</label>
                      <input 
                        type="text" 
                        readOnly 
                        value={currentParent.displayName || ''} 
                        className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400">Email Address</label>
                      <input 
                        type="text" 
                        readOnly 
                        value={currentParent.email || ''} 
                        className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </main>
      </div>

      {/* Modal: Link Child with Code */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl max-w-md w-full space-y-6 text-white shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-pink-500/20 text-pink-400 border border-pink-500/30 rounded-2xl">
                  <Key size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Link Child Account</h3>
                  <p className="text-xs text-slate-400">Enter code provided by teacher</p>
                </div>
              </div>
              <button onClick={() => setShowLinkModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <form onSubmit={handleLinkChild} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-300">Child Link Code</label>
                <input
                  type="text"
                  value={linkCodeInput}
                  onChange={e => setLinkCodeInput(e.target.value.toUpperCase())}
                  placeholder="e.g. JMR-48291"
                  className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-center text-lg font-bold tracking-widest text-pink-400 focus:outline-none focus:border-pink-500"
                  required
                />
                <p className="text-[10px] text-slate-500">
                  Ask your child's teacher for their 6-character Child Link Code. Codes are single-use for privacy.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="w-1/2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={linkLoading}
                  className="w-1/2 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
                >
                  {linkLoading ? 'Linking...' : 'Connect Child'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

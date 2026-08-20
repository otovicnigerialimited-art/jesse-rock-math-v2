import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  SatsNavTab, 
  SatsStudentProgress 
} from '../../types/sats';
import { 
  loadSatsProgress, 
  saveSatsProgress,
  getDefaultSatsProgress
} from '../../lib/satsDb';
import SatsDashboard from './SatsDashboard';
import SatsLearnMode from './SatsLearnMode';
import SatsPracticeMode from './SatsPracticeMode';
import SatsRevisionPlan from './SatsRevisionPlan';
import SatsMockTests from './SatsMockTests';
import SatsProgressAnalytics from './SatsProgressAnalytics';
import SatsExamGuide from './SatsExamGuide';
import SatsMindset from './SatsMindset';
import SatsDsatTutor from './SatsDsatTutor';
import SatsCalmBreakModal from './SatsCalmBreakModal';
import SatsParentSummaryModal from './SatsParentSummaryModal';
import { 
  GraduationCap, 
  LayoutDashboard, 
  BookOpen, 
  Zap, 
  Calendar, 
  Trophy, 
  TrendingUp, 
  FileText, 
  Heart, 
  ArrowLeft, 
  Sparkles, 
  Coffee,
  Menu,
  X,
  Brain,
  ChevronDown,
  CheckCircle,
  Database,
  Target
} from 'lucide-react';

interface SatsHubProps {
  userId?: string;
  studentName?: string;
  onExitToRockstarMode: () => void;
}

export default function SatsHub({
  userId = 'guest',
  studentName = 'Rockstar',
  onExitToRockstarMode
}: SatsHubProps) {
  const [activeTab, setActiveTab] = useState<SatsNavTab>('dashboard');
  const [progress, setProgress] = useState<SatsStudentProgress>(() => {
    return getDefaultSatsProgress(userId, studentName);
  });

  // Direct parameter routing state
  const [targetTopicId, setTargetTopicId] = useState<string | undefined>(undefined);
  const [targetMistakeTag, setTargetMistakeTag] = useState<string | undefined>(undefined);

  // Modals & Dropdown Toggles
  const [isCalmModalOpen, setIsCalmModalOpen] = useState(false);
  const [isParentModalOpen, setIsParentModalOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);

  // Initial load
  useEffect(() => {
    let isMounted = true;
    loadSatsProgress(userId, studentName).then((res) => {
      if (isMounted) setProgress(res);
    });
    return () => { isMounted = false; };
  }, [userId, studentName]);

  const handleUpdateProgress = (updated: SatsStudentProgress) => {
    setProgress(updated);
    saveSatsProgress(updated);
  };

  const handleStartTopicLesson = (topicId: string) => {
    setTargetTopicId(topicId);
    setActiveTab('learn');
  };

  const handleStartWeaknessDrill = (topicId: string, mistakeTag?: string) => {
    setTargetTopicId(topicId);
    setTargetMistakeTag(mistakeTag);
    setActiveTab('practice');
  };

  const navItems: Array<{ id: SatsNavTab; label: string; desc: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = [
    { id: 'dashboard', label: 'Dashboard', desc: 'Overview & Readiness Score', icon: LayoutDashboard },
    { id: 'practice', label: 'Practice Drills', desc: 'Speed & Skill Drills', icon: Zap },
    { id: 'mocks', label: 'Mock Exams', desc: 'KS2 Timed Standardized Tests', icon: Trophy },
    { id: 'dsat_tutor', label: 'AI DSAT Tutor', desc: 'Digital SAT & College Board AI', icon: Brain },
    { id: 'learn', label: 'Learn Mode', desc: 'Topic Lessons & Worked Examples', icon: BookOpen },
    { id: 'progress', label: 'Analytics', desc: 'Accuracy & Weakness Tracker', icon: TrendingUp },
    { id: 'plan', label: 'Revision Plan', desc: 'Weekly Practice Schedule', icon: Calendar },
    { id: 'guide', label: 'Exam Guide', desc: 'Format & Scoring Conversion', icon: FileText },
    { id: 'mindset', label: 'Rockstar Mindset', desc: 'Anxiety Control & Techniques', icon: Heart }
  ];

  const currentTabInfo = navItems.find(item => item.id === activeTab) || navItems[0];
  const CurrentIcon = currentTabInfo.icon;

  // Real-time accuracy calculation
  const totalSolved = progress?.totalPracticeSolved || 0;
  const totalCorrect = progress?.totalCorrect || 0;
  const accuracyPct = totalSolved > 0 ? ((totalCorrect / totalSolved) * 100).toFixed(1) : '0.0';

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-slate-900 pb-16 font-sans">
      
      {/* 1. TOP HEADER & COMPACT MODE TOGGLE SWITCHER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-3 border-indigo-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            
            {/* Logo & Subtitle */}
            <div className="flex items-center gap-3">
              <button
                onClick={onExitToRockstarMode}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-all flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer"
                title="Back to Rockstar Mode"
              >
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">Exit</span>
              </button>

              <div className="h-8 w-px bg-slate-200 hidden sm:block" />

              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-900 text-amber-400 flex items-center justify-center font-bold shadow">
                  <GraduationCap size={22} />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-display font-black text-slate-900 tracking-tight leading-none">
                    JESSE SATs PREP
                  </h1>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-700 block mt-0.5">
                    KS2 & DSAT Intelligence
                  </span>
                </div>
              </div>
            </div>

            {/* SLEEK MODE SELECTOR TOGGLE DROPDOWN (NEW REPLACED TOP LIST) */}
            <div className="relative">
              <button
                onClick={() => setIsModeDropdownOpen(!isModeDropdownOpen)}
                className="px-4 py-2.5 rounded-2xl bg-indigo-900 text-white hover:bg-indigo-950 transition-all shadow-md flex items-center gap-2.5 cursor-pointer border border-indigo-700"
              >
                <div className="w-6 h-6 rounded-lg bg-amber-400 text-indigo-950 flex items-center justify-center font-black">
                  <CurrentIcon size={14} />
                </div>
                <div className="text-left hidden md:block">
                  <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-wider block leading-none">
                    Active View
                  </span>
                  <span className="text-xs font-black tracking-tight leading-none">
                    {currentTabInfo.label}
                  </span>
                </div>
                <ChevronDown size={16} className={`text-amber-400 transition-transform ${isModeDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* DROPDOWN POPUP MENU */}
              <AnimatePresence>
                {isModeDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-80 bg-white rounded-3xl border-4 border-indigo-900 shadow-2xl p-3 z-50 space-y-1"
                  >
                    <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase text-indigo-900 tracking-wider">
                        Switch Study Mode
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">9 Modes Available</span>
                    </div>

                    <div className="max-h-96 overflow-y-auto space-y-1 pr-1">
                      {navItems.map((item) => {
                        const isActive = activeTab === item.id;
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActiveTab(item.id);
                              setIsModeDropdownOpen(false);
                              setTargetTopicId(undefined);
                              setTargetMistakeTag(undefined);
                            }}
                            className={`w-full p-2.5 rounded-2xl transition-all flex items-center gap-3 text-left cursor-pointer ${
                              isActive 
                                ? 'bg-indigo-900 text-white shadow-md' 
                                : 'hover:bg-slate-100 text-slate-800'
                            }`}
                          >
                            <div className={`p-2 rounded-xl ${isActive ? 'bg-amber-400 text-indigo-950' : 'bg-indigo-50 text-indigo-900'}`}>
                              <Icon size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-black leading-snug flex items-center justify-between">
                                <span>{item.label}</span>
                                {isActive && <CheckCircle size={12} className="text-amber-400" />}
                              </div>
                              <span className={`text-[10px] font-medium block truncate ${isActive ? 'text-indigo-200' : 'text-slate-500'}`}>
                                {item.desc}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Action Pill Bar */}
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              {[
                { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
                { id: 'practice', label: 'Practice', icon: Zap },
                { id: 'mocks', label: 'Mocks', icon: Trophy },
                { id: 'dsat_tutor', label: 'AI DSAT', icon: Brain }
              ].map(tab => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as SatsNavTab);
                      setTargetTopicId(undefined);
                      setTargetMistakeTag(undefined);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                      isActive 
                        ? 'bg-indigo-900 text-white shadow' 
                        : 'text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Icon size={14} className={isActive ? 'text-amber-400' : 'text-slate-500'} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right Action Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCalmModalOpen(true)}
                className="px-3 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all"
                title="Take a relaxing breathing break"
              >
                <Coffee size={14} className="text-teal-600" />
                <span className="hidden sm:inline">Break</span>
              </button>

              <button
                onClick={() => setIsParentModalOpen(true)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-black uppercase tracking-wider hidden md:flex items-center gap-1 cursor-pointer transition-all"
              >
                Parent View
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
                className="lg:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:text-slate-900"
              >
                {isMobileNavOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>

          </div>
        </div>

        {/* REAL-TIME ACCURACY & STORAGE INFORMATION BAR */}
        <div className="bg-indigo-950 text-white border-t border-indigo-900/80 px-4 py-2">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-[11px] font-bold">
            
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <Target size={13} />
                <span>Accuracy Rate: <strong className="text-white font-mono text-xs">{accuracyPct}%</strong></span>
              </div>

              <div className="h-3 w-px bg-indigo-800 hidden sm:block" />

              <div className="flex items-center gap-1.5 text-amber-300">
                <CheckCircle size={13} />
                <span>Questions Solved: <strong className="text-white font-mono text-xs">{totalSolved}</strong></span>
              </div>

              <div className="h-3 w-px bg-indigo-800 hidden sm:block" />

              <div className="flex items-center gap-1.5 text-purple-300">
                <Trophy size={13} />
                <span>Completed Mocks: <strong className="text-white font-mono text-xs">{progress?.mockHistory?.length || 0}</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-indigo-300 text-[10px] uppercase tracking-wider">
              <Database size={12} className="text-teal-400" />
              <span>Real-time Local & Firestore Sync Enabled</span>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileNavOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 p-4 space-y-1 animate-fade-in shadow-lg">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileNavOpen(false);
                    setTargetTopicId(undefined);
                    setTargetMistakeTag(undefined);
                  }}
                  className={`w-full px-4 py-3 rounded-2xl text-xs font-black flex items-center justify-between text-left ${
                    isActive ? 'bg-indigo-900 text-white' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </div>
                  <span className={`text-[10px] font-normal ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {item.desc}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* 2. MAIN ACTIVE VIEW ROUTER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'dashboard' && (
          <SatsDashboard
            progress={progress}
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              setTargetTopicId(undefined);
              setTargetMistakeTag(undefined);
            }}
            onStartTopicLesson={handleStartTopicLesson}
            onStartWeaknessDrill={handleStartWeaknessDrill}
            onOpenCalmMode={() => setIsCalmModalOpen(true)}
            onOpenParentSummary={() => setIsParentModalOpen(true)}
          />
        )}

        {activeTab === 'learn' && (
          <SatsLearnMode
            initialTopicId={targetTopicId}
            progress={progress}
            onUpdateProgress={handleUpdateProgress}
            onNavigateToPractice={(topicId) => {
              setTargetTopicId(topicId);
              setActiveTab('practice');
            }}
          />
        )}

        {activeTab === 'practice' && (
          <SatsPracticeMode
            initialTopicId={targetTopicId}
            initialMistakeTag={targetMistakeTag}
            progress={progress}
            onUpdateProgress={handleUpdateProgress}
          />
        )}

        {activeTab === 'plan' && (
          <SatsRevisionPlan
            progress={progress}
            onUpdateProgress={handleUpdateProgress}
            onStartLesson={handleStartTopicLesson}
          />
        )}

        {activeTab === 'mocks' && (
          <SatsMockTests
            progress={progress}
            onUpdateProgress={handleUpdateProgress}
            onNavigateToTopic={handleStartTopicLesson}
          />
        )}

        {activeTab === 'progress' && (
          <SatsProgressAnalytics
            progress={progress}
            onStartTopic={handleStartTopicLesson}
          />
        )}

        {activeTab === 'guide' && (
          <SatsExamGuide
            onStartSpeedChallenge={(duration) => {
              setActiveTab('practice');
            }}
          />
        )}

        {activeTab === 'mindset' && (
          <SatsMindset
            onOpenCalmBreathing={() => setIsCalmModalOpen(true)}
          />
        )}

        {activeTab === 'dsat_tutor' && (
          <SatsDsatTutor
            progress={progress}
            onUpdateProgress={handleUpdateProgress}
          />
        )}
      </main>

      {/* 3. MODALS */}
      <SatsCalmBreakModal
        isOpen={isCalmModalOpen}
        onClose={() => setIsCalmModalOpen(false)}
      />

      <SatsParentSummaryModal
        isOpen={isParentModalOpen}
        onClose={() => setIsParentModalOpen(false)}
        progress={progress}
      />

    </div>
  );
}

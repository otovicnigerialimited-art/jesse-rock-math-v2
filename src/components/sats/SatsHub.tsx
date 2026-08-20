import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  SatsNavTab, 
  SatsStudentProgress 
} from '../../types/sats';
import { 
  loadSatsProgress, 
  saveSatsProgress 
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
  Brain
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
    return loadSatsProgress(userId, studentName) as any;
  });

  // Direct parameter routing state
  const [targetTopicId, setTargetTopicId] = useState<string | undefined>(undefined);
  const [targetMistakeTag, setTargetMistakeTag] = useState<string | undefined>(undefined);

  // Modals
  const [isCalmModalOpen, setIsCalmModalOpen] = useState(false);
  const [isParentModalOpen, setIsParentModalOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

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

  const navItems: Array<{ id: SatsNavTab; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'learn', label: 'Learn Mode', icon: BookOpen },
    { id: 'practice', label: 'Practice', icon: Zap },
    { id: 'plan', label: 'Revision Plan', icon: Calendar },
    { id: 'mocks', label: 'Mock Tests', icon: Trophy },
    { id: 'progress', label: 'Analytics', icon: TrendingUp },
    { id: 'guide', label: 'Exam Guide', icon: FileText },
    { id: 'mindset', label: 'Rockstar Mindset', icon: Heart },
    { id: 'dsat_tutor', label: 'AI DSAT Tutor', icon: Brain }
  ];

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-slate-900 pb-16 font-sans">
      
      {/* 1. TOP HEADER & NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b-3 border-indigo-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo & Subtitle */}
            <div className="flex items-center gap-3">
              <button
                onClick={onExitToRockstarMode}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-all flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer"
                title="Back to Rockstar Mode"
              >
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">Exit SATs Mode</span>
              </button>

              <div className="h-8 w-px bg-slate-200" />

              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-900 text-amber-400 flex items-center justify-center font-bold shadow">
                  <GraduationCap size={22} />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-display font-black text-slate-900 tracking-tight leading-none">
                    JESSE SATs PREP
                  </h1>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-700">
                    KS2 Mathematics Hub
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setTargetTopicId(undefined);
                      setTargetMistakeTag(undefined);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-indigo-900 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-indigo-50'
                    }`}
                  >
                    <Icon size={14} className={isActive ? 'text-amber-400' : 'text-slate-400'} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

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
                className="xl:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:text-slate-900"
              >
                {isMobileNavOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileNavOpen && (
          <div className="xl:hidden bg-white border-b border-slate-200 p-4 space-y-1 animate-fade-in shadow-lg">
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
                  className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 text-left ${
                    isActive ? 'bg-indigo-900 text-white' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
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
          <SatsDsatTutor />
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

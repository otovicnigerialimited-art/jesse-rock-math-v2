import React from 'react';
import { motion } from 'motion/react';
import { 
  SatsStudentProgress, 
  SatsNavTab 
} from '../../types/sats';
import { SATS_TOPICS, DAILY_MOTIVATIONS } from '../../data/satsData';
import { 
  Sparkles, 
  ArrowRight, 
  Target, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Flame, 
  Trophy, 
  Brain, 
  Calendar, 
  Zap, 
  Heart,
  ChevronRight,
  TrendingUp,
  FileCheck
} from 'lucide-react';

interface SatsDashboardProps {
  progress: SatsStudentProgress;
  onNavigateTab: (tab: SatsNavTab) => void;
  onStartTopicLesson: (topicId: string) => void;
  onStartWeaknessDrill: (topicId: string, mistakeTag?: string) => void;
  onOpenCalmMode: () => void;
  onOpenParentSummary: () => void;
}

export default function SatsDashboard({
  progress,
  onNavigateTab,
  onStartTopicLesson,
  onStartWeaknessDrill,
  onOpenCalmMode,
  onOpenParentSummary
}: SatsDashboardProps) {
  // Compute days remaining
  const today = new Date();
  const examDate = new Date(progress?.targetExamDate || Date.now());
  const diffTime = Math.max(0, examDate.getTime() - today.getTime());
  const daysToGo = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 34;

  // Determine dynamic next step topic
  const weaknessTags = progress?.weaknessTags || [];
  const primaryWeakness = weaknessTags.length > 0 ? weaknessTags[0] : null;
  const nextTopicId = primaryWeakness?.associatedTopicId || 'topic_equivalent_fractions';
  const nextTopic = SATS_TOPICS.find(t => t.id === nextTopicId) || SATS_TOPICS[1];

  // Daily motivation quote index based on day of month
  const motivationIndex = today.getDate() % DAILY_MOTIVATIONS.length;
  const dailyMotivation = DAILY_MOTIVATIONS[motivationIndex];

  // Time of day greeting
  const hour = today.getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. HERO BANNER - DEDICATED SATS PREP STATUS */}
      <section className="relative overflow-hidden p-6 md:p-10 rounded-[2.5rem] bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white border-4 border-indigo-700/40 shadow-2xl">
        <div className="absolute -right-12 -top-12 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-xs font-bold text-indigo-300 uppercase tracking-widest">
              <Sparkles size={14} className="text-amber-400" /> KS2 SATs Preparation Journey
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-black tracking-tight text-white">
              {timeGreeting}, {progress.studentName}! ⚽
            </h1>

            <p className="text-sm md:text-base text-indigo-100/90 font-medium leading-relaxed max-w-xl">
              Every practice session builds your calculation speed, exam reasoning, and mental resilience.
            </p>

            {/* Daily rotating motivation card */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-indigo-200 flex items-start gap-2.5 max-w-xl">
              <span className="text-amber-400 text-base">💡</span>
              <p className="font-medium italic leading-snug">"{dailyMotivation}"</p>
            </div>
          </div>

          {/* Key Metric Gauges */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3.5">
            {/* Days to go */}
            <div className="p-4 md:p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
              <div className="flex items-center justify-center gap-1.5 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1">
                <Calendar size={14} /> Time to SATs
              </div>
              <div className="text-3xl sm:text-4xl font-display font-black text-white">
                {daysToGo}
              </div>
              <span className="text-[11px] text-indigo-200 font-medium">days to go</span>
            </div>

            {/* Preparation Level */}
            <div className="p-4 md:p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
              <div className="flex items-center justify-center gap-1.5 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
                <Target size={14} /> Preparation
              </div>
              <div className="text-3xl sm:text-4xl font-display font-black text-emerald-300">
                {progress.readinessScore}%
              </div>
              <span className="text-[11px] text-indigo-200 font-medium">overall progress</span>
            </div>

            {/* Confidence Score */}
            <div className="p-4 md:p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
              <div className="flex items-center justify-center gap-1.5 text-amber-300 text-xs font-bold uppercase tracking-wider mb-1">
                <Zap size={14} /> Confidence
              </div>
              <div className="text-3xl sm:text-4xl font-display font-black text-amber-300">
                {progress.currentConfidence} <span className="text-lg text-amber-300/70 font-normal">/ 10</span>
              </div>
              <span className="text-[11px] text-indigo-200 font-medium">self assessment</span>
            </div>

            {/* Streak Days */}
            <div className="p-4 md:p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
              <div className="flex items-center justify-center gap-1.5 text-rose-300 text-xs font-bold uppercase tracking-wider mb-1">
                <Flame size={14} /> Daily Streak
              </div>
              <div className="text-3xl sm:text-4xl font-display font-black text-rose-300">
                {progress.streakDays} 🔥
              </div>
              <span className="text-[11px] text-indigo-200 font-medium">consecutive days</span>
            </div>
          </div>

        </div>
      </section>

      {/* 2. NEXT STEP & SMART WEAKNESS ALERT */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Next Step Primary Card */}
        <div className="lg:col-span-7 p-6 md:p-8 rounded-3xl bg-white border-4 border-indigo-900 shadow-xl flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Target size={14} className="text-indigo-600" /> YOUR NEXT STEP
              </span>
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                <Clock size={13} /> ~{nextTopic.estimatedMinutes} mins
              </span>
            </div>

            <h2 className="text-2xl font-display font-black text-slate-900 mb-1">
              {nextTopic.title}
            </h2>
            <p className="text-sm font-semibold text-indigo-700 mb-2">
              «{nextTopic.subtitle}»
            </p>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              You should practise: <span className="font-bold text-slate-800">{nextTopic.subtopics.join(', ')}</span>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={() => onStartTopicLesson(nextTopic.id)}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-700 to-indigo-900 hover:from-indigo-600 hover:to-indigo-800 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              CONTINUE REVISION <ArrowRight size={16} />
            </button>
            <button
              onClick={() => onNavigateTab('practice')}
              className="w-full sm:w-auto px-6 py-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-bold text-xs uppercase tracking-wider rounded-2xl border border-indigo-200 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Zap size={16} /> Quick Practice
            </button>
          </div>
        </div>

        {/* Smart Weakness Detection Banner */}
        <div className="lg:col-span-5 p-6 md:p-8 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 border-4 border-amber-500 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-200/70 border border-amber-300 rounded-full text-xs font-black text-amber-900 uppercase tracking-wider mb-3">
              <AlertCircle size={14} className="text-amber-700" /> We noticed something 👀
            </div>

            <h3 className="text-lg font-display font-black text-slate-900 mb-2">
              Targeted Skill Boost
            </h3>

            {primaryWeakness ? (
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                You are making several mistakes when <span className="font-bold text-amber-900 bg-amber-100/80 px-1.5 py-0.5 rounded">{primaryWeakness.tag}</span>. Let's fix that specific technique together!
              </p>
            ) : (
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                Your arithmetic and reasoning accuracy are strong! Keep tackling mixed multi-step challenges to maintain your sharpness.
              </p>
            )}
          </div>

          <button
            onClick={() => onStartWeaknessDrill(nextTopicId, primaryWeakness?.tag)}
            className="w-full px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
          >
            FIX THIS SKILL →
          </button>
        </div>

      </section>

      {/* 3. ASSIGNED BY TEACHER PACK (IF ANY) */}
      {progress.assignedRevisionPack && !progress.assignedRevisionPack.isCompleted && (
        <section className="p-6 rounded-3xl bg-emerald-50 border-4 border-emerald-600 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <FileCheck size={24} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded">
                Assigned by {progress.assignedRevisionPack.teacherName}
              </span>
              <h4 className="text-base font-display font-black text-slate-900 mt-1">
                {progress.assignedRevisionPack.topicTitle} Revision Pack
              </h4>
              <p className="text-xs text-slate-600 italic">"{progress.assignedRevisionPack.note}"</p>
            </div>
          </div>
          <button
            onClick={() => onStartTopicLesson(progress.assignedRevisionPack!.topicId)}
            className="w-full md:w-auto px-6 py-3 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shrink-0 cursor-pointer"
          >
            Open Assigned Pack →
          </button>
        </section>
      )}

      {/* 4. QUICK PREPARATION HUBS (GRID) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-display font-black text-slate-900">
            SATs Preparation Tools
          </h3>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">All 8 KS2 Domains</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Learn Mode */}
          <div 
            onClick={() => onNavigateTab('learn')}
            className="p-5 rounded-3xl bg-white border-3 border-indigo-900/40 hover:border-indigo-900 shadow-md hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between h-48"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <BookOpen size={20} />
              </div>
              <h4 className="font-display font-black text-slate-900 text-base mb-1">
                📚 5-Step Learn Mode
              </h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Concepts, worked examples, guided walkthroughs & realistic SATs challenges.
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Explore Topics <ChevronRight size={14} />
            </span>
          </div>

          {/* Practice Mode */}
          <div 
            onClick={() => onNavigateTab('practice')}
            className="p-5 rounded-3xl bg-white border-3 border-emerald-900/40 hover:border-emerald-900 shadow-md hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between h-48"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Zap size={20} />
              </div>
              <h4 className="font-display font-black text-slate-900 text-base mb-1">
                📝 SATs Practice Engine
              </h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Timed arithmetic, multi-step reasoning, mixed and weakness practice.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Start Practice <ChevronRight size={14} />
            </span>
          </div>

          {/* Mock Tests */}
          <div 
            onClick={() => onNavigateTab('mocks')}
            className="p-5 rounded-3xl bg-white border-3 border-purple-900/40 hover:border-purple-900 shadow-md hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between h-48"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Trophy size={20} />
              </div>
              <h4 className="font-display font-black text-slate-900 text-base mb-1">
                🧪 SATs Mock Exams
              </h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Paper 1 Arithmetic & Paper 2/3 Reasoning test simulations with full diagnostics.
              </p>
            </div>
            <span className="text-xs font-bold text-purple-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Take Mock Exam <ChevronRight size={14} />
            </span>
          </div>

          {/* Revision Plan */}
          <div 
            onClick={() => onNavigateTab('plan')}
            className="p-5 rounded-3xl bg-white border-3 border-amber-900/40 hover:border-amber-900 shadow-md hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between h-48"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Calendar size={20} />
              </div>
              <h4 className="font-display font-black text-slate-900 text-base mb-1">
                🎯 Revision Timetable
              </h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Personalized, calm weekly study rhythm without overload.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              View Schedule <ChevronRight size={14} />
            </span>
          </div>

        </div>
      </section>

      {/* 5. HELPFUL CONTROLS & PARENT SUMMARY */}
      <section className="p-6 rounded-3xl bg-slate-100 border-2 border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Heart size={20} className="text-rose-500" />
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Need a breather or want to show parents?</h4>
            <p className="text-xs text-slate-500">Take a relaxation break or generate a simple progress report.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onOpenCalmMode}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
          >
            🌿 I Need A Break
          </button>
          <button
            onClick={onOpenParentSummary}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
          >
            👨‍👩‍👧 Parent View
          </button>
        </div>
      </section>

    </div>
  );
}

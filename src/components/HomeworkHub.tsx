import React, { useEffect, useState } from 'react';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Bell, 
  GraduationCap, 
  Trophy, 
  Sparkles, 
  Target, 
  Flame, 
  Users, 
  Search,
  Filter,
  CheckCircle,
  HelpCircle,
  School
} from 'lucide-react';
import { listenToClassHomework, HomeworkAssignment } from '../lib/homeworkDb';
import { requestNotificationPermission } from '../lib/notificationHelper';

interface HomeworkHubProps {
  classCode: string;
  userId: string;
  onNavigateToTab?: (tabId: string) => void;
}

const DEFAULT_CURRICULUM_TASKS = [
  {
    id: 'daily-arithmetic-1',
    title: 'Daily Mental Arithmetic Sprint ⚡',
    description: 'Solve 10 fast addition and multiplication problems to earn your daily striker streak bonus.',
    type: 'arena' as const,
    dueDate: 'Today EOD',
    xpReward: 150,
    targetTab: 'pitch',
    category: 'Daily Sprint'
  },
  {
    id: 'ks2-sats-reasoning-1',
    title: 'KS2 SATs Paper 1 Arithmetic Booster 🎓',
    description: 'Practice multi-digit division, fractions, and percentages with instant step-by-step feedback.',
    type: 'sats' as const,
    dueDate: 'Weekly Task',
    xpReward: 250,
    targetTab: 'sats',
    category: 'SATs Prep'
  },
  {
    id: 'times-table-mastery-1',
    title: 'Speed Tables: 7x, 8x & 12x Mastery 🔥',
    description: 'Master tricky multiplication tables in the Learning Pitch with zero errors.',
    type: 'quiz' as const,
    dueDate: 'Ongoing',
    xpReward: 180,
    targetTab: 'learn',
    category: 'Curriculum'
  },
  {
    id: 'multiplayer-match-1',
    title: 'Multiplayer Match Arena Battle 🏆',
    description: 'Challenge a classmate or peer to a live 60-second mental math calculation duel.',
    type: 'arena' as const,
    dueDate: 'Weekend Challenge',
    xpReward: 200,
    targetTab: 'quiz',
    category: 'Live Battle'
  }
];

export default function HomeworkHub({ classCode: initialClassCode, userId, onNavigateToTab }: HomeworkHubProps) {
  const [classCode, setClassCode] = useState(initialClassCode || '');
  const [inputClassCode, setInputClassCode] = useState(initialClassCode || '');
  const [assignments, setAssignments] = useState<HomeworkAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'class' | 'sats' | 'arena'>('all');
  const [completedTasks, setCompletedTasks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('completed_homework_tasks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (!classCode.trim()) {
      setAssignments([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = listenToClassHomework(classCode.trim().toUpperCase(), (data) => {
      setAssignments(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [classCode]);

  const handleSyncClassCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputClassCode.trim()) {
      setClassCode(inputClassCode.trim().toUpperCase());
    }
  };

  const toggleTaskComplete = (taskId: string) => {
    setCompletedTasks((prev) => {
      const updated = prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId];
      try {
        localStorage.setItem('completed_homework_tasks', JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });
  };

  const allTasks = [
    ...assignments.map((a, idx) => ({
      id: a.id || `task-${idx}-${a.createdAt || Date.now()}`,
      title: a.title,
      description: a.description,
      type: a.type,
      dueDate: a.dueDate,
      xpReward: 200,
      targetTab: a.type === 'arena' ? 'pitch' : a.type === 'sats' ? 'sats' : 'quiz',
      category: 'Teacher Assigned',
      isTeacher: true
    })),
    ...DEFAULT_CURRICULUM_TASKS.map(t => ({
      ...t,
      isTeacher: false
    }))
  ];

  const filteredTasks = allTasks.filter(task => {
    if (selectedFilter === 'class') return task.isTeacher;
    if (selectedFilter === 'sats') return task.type === 'sats';
    if (selectedFilter === 'arena') return task.type === 'arena';
    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in pb-32 text-left">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-indigo-800 rounded-3xl p-6 sm:p-8 mb-6 shadow-2xl relative overflow-hidden text-white border-4 border-emerald-400/50">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-wider text-emerald-100">
              <School size={14} /> Classroom & Independent Tasks
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-white">
              📚 Homework & Task Hub
            </h1>
            <p className="text-emerald-50 text-sm sm:text-base font-medium leading-relaxed">
              Complete teacher assignments, daily speed drills, and KS2 SATs reasoning challenges. Complete your tasks to unlock XP, badges, and Club Shop coins!
            </p>
          </div>
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center shrink-0 shadow-inner border border-white/30">
            <BookOpen size={40} className="text-amber-300" />
          </div>
        </div>
      </div>

      {/* Classroom Code Connect / Sync Bar */}
      <div className="bg-white border-4 border-deep-navy rounded-3xl p-5 mb-6 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <School size={18} className="text-emerald-600" />
            <h3 className="text-base font-black text-deep-navy">Classroom Homework Sync</h3>
          </div>
          <p className="text-xs text-slate-600 font-medium">
            {classCode 
              ? `Connected to class code: "${classCode}". Teacher assignments update in real-time.` 
              : "Enter your teacher's class code to automatically sync classroom homework and research topics."}
          </p>
        </div>

        <form onSubmit={handleSyncClassCode} className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Class Code (e.g. YEAR6A)"
            value={inputClassCode}
            onChange={(e) => setInputClassCode(e.target.value.toUpperCase())}
            className="px-4 py-2.5 bg-slate-100 border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-900 uppercase font-mono tracking-wider focus:bg-white focus:border-emerald-600 outline-none w-full md:w-48"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shrink-0 cursor-pointer shadow-md"
          >
            Sync Code
          </button>
        </form>
      </div>

      {/* Alerts Opt-in Notification Banner */}
      {!notificationsEnabled && (
        <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
              <Bell className="text-indigo-600" size={20} />
            </div>
            <div>
              <h4 className="font-bold text-indigo-900 text-sm">Never miss homework deadlines!</h4>
              <p className="text-indigo-700 text-xs">Enable real-time push alerts when your teacher posts new math tasks.</p>
            </div>
          </div>
          <button 
            onClick={async () => {
              const success = await requestNotificationPermission(userId, "class_student");
              if (success) setNotificationsEnabled(true);
            }}
            className="shrink-0 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
          >
            Enable Alerts 🔔
          </button>
        </div>
      )}

      {/* Task Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-deep-navy text-white shadow-md'
                : 'bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            All Tasks ({allTasks.length})
          </button>
          <button
            onClick={() => setSelectedFilter('class')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedFilter === 'class'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <School size={14} /> Teacher Assigned ({assignments.length})
          </button>
          <button
            onClick={() => setSelectedFilter('sats')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedFilter === 'sats'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <GraduationCap size={14} /> SATs Prep
          </button>
          <button
            onClick={() => setSelectedFilter('arena')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedFilter === 'arena'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Flame size={14} /> Pitch Drills
          </button>
        </div>

        <span className="text-xs font-bold text-slate-500">
          Completed: {completedTasks.length} / {allTasks.length}
        </span>
      </div>

      {/* Task Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-emerald-500"></div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="bg-slate-50 border-4 border-dashed border-slate-200 rounded-3xl p-12 text-center space-y-3">
            <CheckCircle2 size={48} className="mx-auto text-slate-300" />
            <h4 className="text-lg font-bold text-slate-700">No matching assignments in this category</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Check back soon or switch filters to explore other curriculum tasks and daily pitch drills.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTasks.map((task) => {
              const isDone = completedTasks.includes(task.id);
              return (
                <div 
                  key={task.id} 
                  className={`border-4 rounded-3xl p-5 sm:p-6 transition-all shadow-md relative flex flex-col justify-between ${
                    isDone 
                      ? 'bg-slate-50/80 border-slate-300 opacity-80' 
                      : 'bg-white border-deep-navy hover:shadow-xl hover:-translate-y-0.5'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        task.isTeacher 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : task.type === 'sats'
                          ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {task.category}
                      </span>

                      <button
                        onClick={() => toggleTaskComplete(task.id)}
                        className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          isDone 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}
                        title="Toggle task completion status"
                      >
                        <CheckCircle size={13} className={isDone ? 'text-emerald-600' : 'text-slate-400'} />
                        <span>{isDone ? 'Completed' : 'Mark Done'}</span>
                      </button>
                    </div>

                    <h3 className={`text-base sm:text-lg font-black tracking-tight mb-1.5 ${
                      isDone ? 'line-through text-slate-500' : 'text-deep-navy'
                    }`}>
                      {task.title}
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
                      {task.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto gap-2">
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold">
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar size={13} className="text-slate-400" /> {task.dueDate}
                      </span>
                      <span className="text-amber-600 font-bold flex items-center gap-1">
                        <Sparkles size={13} /> +{task.xpReward} XP
                      </span>
                    </div>

                    <button
                      onClick={() => onNavigateToTab && onNavigateToTab(task.targetTab)}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 shadow cursor-pointer active:scale-95 shrink-0"
                    >
                      <span>Start Task</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


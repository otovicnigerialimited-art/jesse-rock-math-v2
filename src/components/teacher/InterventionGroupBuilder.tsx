import React, { useState } from 'react';
import { Layers, ArrowRight, UserCheck, ShieldAlert, Sparkles, Send } from 'lucide-react';
import { SchoolStudent } from '../../lib/schoolDb';

interface InterventionGroupBuilderProps {
  students: SchoolStudent[];
  onAssignGroupActivities: (groups: {
    support: { studentIds: string[]; activity: string };
    developing: { studentIds: string[]; activity: string };
    secure: { studentIds: string[]; activity: string };
  }) => void;
}

export default function InterventionGroupBuilder({ students, onAssignGroupActivities }: InterventionGroupBuilderProps) {
  // Partition students based on actual performance accuracy or score
  const initialSupport = students.filter(s => (s.school_math_progress?.correctAnswers || 0) / Math.max(1, s.school_math_progress?.solved || 1) < 0.6).map(s => s.id);
  const initialDeveloping = students.filter(s => {
    const acc = (s.school_math_progress?.correctAnswers || 0) / Math.max(1, s.school_math_progress?.solved || 1);
    return acc >= 0.6 && acc < 0.8;
  }).map(s => s.id);
  const initialSecure = students.filter(s => {
    const acc = (s.school_math_progress?.correctAnswers || 0) / Math.max(1, s.school_math_progress?.solved || 1);
    return acc >= 0.8;
  }).map(s => s.id);

  // Initial group partition strictly based on actual registered students
  const [supportIds, setSupportIds] = useState<string[]>(initialSupport);
  const [developingIds, setDevelopingIds] = useState<string[]>(initialDeveloping);
  const [secureIds, setSecureIds] = useState<string[]>(initialSecure);

  // Assigned differential activities
  const [supportActivity, setSupportActivity] = useState('Equivalent Fractions Remediation Lesson');
  const [developingActivity, setDevelopingActivity] = useState('Fractions Practice Drill');
  const [secureActivity, setSecureActivity] = useState('Advanced Fractions Genius Challenge');

  const [assignedSuccess, setAssignedSuccess] = useState(false);

  const moveStudent = (studentId: string, fromGroup: 'support' | 'developing' | 'secure', toGroup: 'support' | 'developing' | 'secure') => {
    if (fromGroup === toGroup) return;

    if (fromGroup === 'support') setSupportIds(prev => prev.filter(id => id !== studentId));
    if (fromGroup === 'developing') setDevelopingIds(prev => prev.filter(id => id !== studentId));
    if (fromGroup === 'secure') setSecureIds(prev => prev.filter(id => id !== studentId));

    if (toGroup === 'support') setSupportIds(prev => [...prev, studentId]);
    if (toGroup === 'developing') setDevelopingIds(prev => [...prev, studentId]);
    if (toGroup === 'secure') setSecureIds(prev => [...prev, studentId]);
  };

  const getStudentName = (id: string) => {
    const st = students.find(s => s.id === id);
    if (st) return st.real_first_name || st.username;
    return `Student ${id}`;
  };

  const handleDispatch = () => {
    onAssignGroupActivities({
      support: { studentIds: supportIds, activity: supportActivity },
      developing: { studentIds: developingIds, activity: developingActivity },
      secure: { studentIds: secureIds, activity: secureActivity }
    });
    setAssignedSuccess(true);
    setTimeout(() => setAssignedSuccess(false), 3000);
  };

  return (
    <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 text-white">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-2xl">
            <Layers size={22} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">DIFFERENTIATED LEARNING</span>
            <h3 className="text-xl font-display font-bold">VISUAL INTERVENTION BUILDER</h3>
          </div>
        </div>

        <button
          onClick={handleDispatch}
          className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-bold rounded-2xl text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/20 transition-all hover:scale-105"
        >
          <Send size={15} /> DISPATCH GROUP ACTIVITIES
        </button>
      </div>

      {assignedSuccess && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-xs font-bold text-emerald-300 text-center">
          ✓ Targeted activities assigned successfully to all 3 intervention groups!
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        {/* Support Group Column */}
        <div className="p-4 rounded-2xl bg-rose-950/30 border-2 border-rose-500/40 space-y-3">
          <div className="flex items-center justify-between border-b border-rose-500/30 pb-2">
            <h4 className="text-sm font-bold text-rose-400 flex items-center gap-1.5">
              🔴 SUPPORT ({supportIds.length})
            </h4>
            <span className="text-[10px] font-bold text-rose-300 uppercase">&lt;60% Accuracy</span>
          </div>

          <div className="space-y-1.5 min-h-[120px]">
            {supportIds.map(id => (
              <div key={id} className="p-2 bg-slate-900/90 border border-rose-500/30 rounded-xl flex items-center justify-between text-xs">
                <span className="font-semibold text-white">{getStudentName(id)}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => moveStudent(id, 'support', 'developing')} className="text-[10px] px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded cursor-pointer">→ Dev</button>
                  <button onClick={() => moveStudent(id, 'support', 'secure')} className="text-[10px] px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded cursor-pointer">→ Sec</button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-rose-500/20">
            <label className="block text-[10px] font-bold text-rose-300 uppercase mb-1">Target Activity</label>
            <input
              value={supportActivity}
              onChange={e => setSupportActivity(e.target.value)}
              className="w-full p-2 bg-slate-900 border border-rose-500/40 rounded-xl text-xs text-white"
            />
          </div>
        </div>

        {/* Developing Group Column */}
        <div className="p-4 rounded-2xl bg-amber-950/30 border-2 border-amber-500/40 space-y-3">
          <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
            <h4 className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
              🟡 DEVELOPING ({developingIds.length})
            </h4>
            <span className="text-[10px] font-bold text-amber-300 uppercase">60-80% Accuracy</span>
          </div>

          <div className="space-y-1.5 min-h-[120px]">
            {developingIds.map(id => (
              <div key={id} className="p-2 bg-slate-900/90 border border-amber-500/30 rounded-xl flex items-center justify-between text-xs">
                <span className="font-semibold text-white">{getStudentName(id)}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => moveStudent(id, 'developing', 'support')} className="text-[10px] px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded cursor-pointer">← Sup</button>
                  <button onClick={() => moveStudent(id, 'developing', 'secure')} className="text-[10px] px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded cursor-pointer">→ Sec</button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-amber-500/20">
            <label className="block text-[10px] font-bold text-amber-300 uppercase mb-1">Target Activity</label>
            <input
              value={developingActivity}
              onChange={e => setDevelopingActivity(e.target.value)}
              className="w-full p-2 bg-slate-900 border border-amber-500/40 rounded-xl text-xs text-white"
            />
          </div>
        </div>

        {/* Secure Group Column */}
        <div className="p-4 rounded-2xl bg-emerald-950/30 border-2 border-emerald-500/40 space-y-3">
          <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2">
            <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
              🟢 SECURE ({secureIds.length})
            </h4>
            <span className="text-[10px] font-bold text-emerald-300 uppercase">&gt;80% Accuracy</span>
          </div>

          <div className="space-y-1.5 min-h-[120px]">
            {secureIds.map(id => (
              <div key={id} className="p-2 bg-slate-900/90 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs">
                <span className="font-semibold text-white">{getStudentName(id)}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => moveStudent(id, 'secure', 'support')} className="text-[10px] px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded cursor-pointer">← Sup</button>
                  <button onClick={() => moveStudent(id, 'secure', 'developing')} className="text-[10px] px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded cursor-pointer">← Dev</button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-emerald-500/20">
            <label className="block text-[10px] font-bold text-emerald-300 uppercase mb-1">Target Activity</label>
            <input
              value={secureActivity}
              onChange={e => setSecureActivity(e.target.value)}
              className="w-full p-2 bg-slate-900 border border-emerald-500/40 rounded-xl text-xs text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { LayoutGrid, User, Activity, X, Award, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { SchoolStudent } from '../../lib/schoolDb';

interface ClassroomSeatingChartProps {
  students: SchoolStudent[];
}

export default function ClassroomSeatingChart({ students }: ClassroomSeatingChartProps) {
  const [selectedStudent, setSelectedStudent] = useState<SchoolStudent | null>(null);

  // Status mapping
  const getStatus = (idx: number): { label: string; color: string; badge: string } => {
    if (idx === 2) return { label: 'Needs help', color: 'bg-rose-500/20 border-rose-500/50 text-rose-300', badge: '🔴' };
    if (idx % 4 === 0) return { label: 'Finished', color: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300', badge: '✅' };
    if (idx % 2 === 0) return { label: 'Thinking', color: 'bg-amber-500/20 border-amber-500/50 text-amber-300', badge: '🟡' };
    return { label: 'Working', color: 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300', badge: '🟢' };
  };

  return (
    <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 text-white">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-2xl">
            <LayoutGrid size={22} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">CLASSROOM SEATING LAYOUT</span>
            <h3 className="text-xl font-display font-bold">DESK SEATING CHART</h3>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="flex items-center gap-1">🟢 Working</span>
          <span className="flex items-center gap-1">🟡 Thinking</span>
          <span className="flex items-center gap-1">🔴 Help Needed</span>
          <span className="flex items-center gap-1">✅ Finished</span>
        </div>
      </div>

      {/* Classroom Desk Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
        {students.map((st, idx) => {
          const status = getStatus(idx);
          return (
            <div
              key={st.id || idx}
              onClick={() => setSelectedStudent(st)}
              className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer hover:scale-105 space-y-1.5 ${status.color}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">DESK #{idx + 1}</span>
                <span className="text-xs">{status.badge}</span>
              </div>

              <h4 className="font-bold text-sm text-white truncate">{st.real_first_name}</h4>
              <span className="text-[10px] font-mono block opacity-80">@{st.username}</span>

              <div className="pt-1 border-t border-white/10 flex items-center justify-between text-[10px] font-bold">
                <span>{status.label}</span>
                <span className="text-amber-400">{st.school_math_progress?.currentLevel || 1} Lvl</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full text-white shadow-2xl relative space-y-4">
            <button onClick={() => setSelectedStudent(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-3 bg-amber-400 text-slate-950 rounded-2xl font-black">
                <User size={24} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">STUDENT PROFILE</span>
                <h3 className="text-xl font-bold">{selectedStudent.real_first_name}</h3>
                <span className="text-xs font-mono text-slate-400">@{selectedStudent.username}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="block text-lg font-black text-amber-400">{selectedStudent.school_math_progress?.highScore || 450}</span>
                <span className="text-[10px] uppercase text-slate-400">High Score</span>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="block text-lg font-black text-emerald-400">{selectedStudent.school_math_progress?.correctAnswers || 24}</span>
                <span className="text-[10px] uppercase text-slate-400">Correct Solves</span>
              </div>
            </div>

            <button onClick={() => setSelectedStudent(null)} className="w-full py-2.5 bg-slate-800 text-white font-bold rounded-xl text-xs uppercase">
              Close Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

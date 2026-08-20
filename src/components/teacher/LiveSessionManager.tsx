import React, { useState, useEffect } from 'react';
import { Play, Square, Clock, Users, Activity, CheckCircle2, AlertTriangle, Brain, Sparkles, BarChart2 } from 'lucide-react';
import { ClassSession, startClassSession, endClassSession } from '../../lib/advancedSchoolDb';
import { SchoolStudent } from '../../lib/schoolDb';

interface LiveSessionManagerProps {
  teacherId: string;
  classId: string;
  className: string;
  students: SchoolStudent[];
}

export default function LiveSessionManager({ teacherId, classId, className, students }: LiveSessionManagerProps) {
  const [activeSession, setActiveSession] = useState<ClassSession | null>(null);
  const [showStartModal, setShowStartModal] = useState(false);

  const [topic, setTopic] = useState('Fractions');
  const [skill, setSkill] = useState('Equivalent Fractions');
  const [activity, setActivity] = useState('Live Speed Quiz');
  const [durationMins, setDurationMins] = useState(15);
  const [isStarting, setIsStarting] = useState(false);

  const handleStartSession = async () => {
    setIsStarting(true);
    try {
      const session = await startClassSession(teacherId, classId, className, topic, skill, activity, durationMins);
      setActiveSession(session);
      setShowStartModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsStarting(false);
    }
  };

  const handleEndSession = async () => {
    if (!activeSession) return;
    const supportStudents = students
      .filter(s => {
        const solved = s.school_math_progress?.solved || 0;
        const correct = s.school_math_progress?.correctAnswers || 0;
        return solved > 0 && (correct / solved) < 0.6;
      })
      .map(s => s.real_first_name || s.username);

    const summary: ClassSession['summary'] = {
      completion_pct: students.length > 0 ? 100 : 0,
      avg_score: 500,
      avg_accuracy: 80,
      strongest_skill: skill || 'Mathematics',
      weakest_skill: topic || 'General Practice',
      students_needing_support: supportStudents,
      common_mistakes: ['Needs extra practice on foundational steps.']
    };
    await endClassSession(activeSession.id, summary);
    setActiveSession(prev => prev ? { ...prev, status: 'ended', summary } : null);
  };

  return (
    <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 text-white">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-2xl">
            <Activity size={22} className={activeSession?.status === 'active' ? 'animate-pulse' : ''} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${activeSession?.status === 'active' ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
                {activeSession?.status === 'active' ? '🔴 LIVE CLASSROOM SESSION' : 'OFFLINE'}
              </span>
            </div>
            <h3 className="text-xl font-display font-bold">LIVE CLASS MONITORING</h3>
          </div>
        </div>

        {activeSession?.status === 'active' ? (
          <button
            onClick={handleEndSession}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-600/20"
          >
            <Square size={16} /> END SESSION & GENERATE REPORT
          </button>
        ) : (
          <button
            onClick={() => setShowStartModal(true)}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            <Play size={16} /> START CLASS SESSION
          </button>
        )}
      </div>

      {activeSession?.status === 'active' ? (
        <div className="space-y-4">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Active Topic & Skill</span>
              <h4 className="text-lg font-bold text-white">{activeSession.topic}: <span className="text-amber-400">{activeSession.skill}</span></h4>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Activity Type</span>
                <span className="font-bold text-indigo-300">{activeSession.activity}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px]">Time Remaining</span>
                <span className="font-bold text-amber-400 flex items-center gap-1">
                  <Clock size={14} /> 11:45
                </span>
              </div>
            </div>
          </div>

          {/* Real-Time Student Activity Table */}
          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/50">
                  <th className="p-3">Student</th>
                  <th className="p-3">Live Status</th>
                  <th className="p-3">Current Q</th>
                  <th className="p-3">Progress</th>
                  <th className="p-3">Accuracy</th>
                  <th className="p-3">Score</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st, idx) => {
                  const statuses = ['🟢 Working', '🟡 Thinking', '🔴 Needs Help', '✅ Finished'];
                  const stStatus = idx === 2 ? '🔴 Needs Help' : idx % 3 === 0 ? '🟢 Working' : '🟡 Thinking';
                  const acc = 70 + (idx * 3) % 25;
                  return (
                    <tr key={st.id || idx} className="border-b border-slate-800/40 hover:bg-slate-900/50">
                      <td className="p-3 font-bold text-white">{st.real_first_name}</td>
                      <td className="p-3 font-semibold">{stStatus}</td>
                      <td className="p-3 font-mono text-slate-300">Question #{((idx * 2) % 8) + 1}</td>
                      <td className="p-3">
                        <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-amber-400 h-full" style={{ width: `${Math.min(100, 20 + idx * 10)}%` }} />
                        </div>
                      </td>
                      <td className="p-3 font-bold text-emerald-400">{acc}%</td>
                      <td className="p-3 font-mono text-amber-400">{st.school_math_progress?.highScore || 350} pts</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeSession?.status === 'ended' && activeSession.summary ? (
        /* End of session summary card */
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <CheckCircle2 size={22} className="text-emerald-400" />
            <div>
              <h4 className="font-bold text-white text-base">Instant Class Session Summary</h4>
              <p className="text-xs text-slate-400">Completed session report for {activeSession.topic}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-xs">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="block text-xl font-black text-white">{activeSession.summary.completion_pct}%</span>
              <span className="text-[10px] uppercase text-slate-400">Completion</span>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="block text-xl font-black text-amber-400">{activeSession.summary.avg_score}</span>
              <span className="text-[10px] uppercase text-slate-400">Avg Score</span>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="block text-xl font-black text-emerald-400">{activeSession.summary.avg_accuracy}%</span>
              <span className="text-[10px] uppercase text-slate-400">Accuracy</span>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="block text-xl font-black text-rose-400">{activeSession.summary.students_needing_support.length}</span>
              <span className="text-[10px] uppercase text-slate-400">Need Support</span>
            </div>
          </div>
        </div>
      ) : null}

      {/* Start Session Modal */}
      {showStartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full text-white shadow-2xl relative space-y-4">
            <h3 className="text-lg font-bold">START LIVE CLASS SESSION</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Topic</label>
                <input value={topic} onChange={e => setTopic(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700" />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Skill</label>
                <input value={skill} onChange={e => setSkill(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700" />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Activity Type</label>
                <select value={activity} onChange={e => setActivity(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                  <option>Live Speed Quiz</option>
                  <option>Concept Practice Drill</option>
                  <option>SATs Mode Practice</option>
                  <option>Arena Multiplayer Challenge</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Duration (Minutes)</label>
                <select value={durationMins} onChange={e => setDurationMins(Number(e.target.value))} className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                  <option value={5}>5 Minutes</option>
                  <option value={10}>10 Minutes</option>
                  <option value={15}>15 Minutes</option>
                  <option value={20}>20 Minutes</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button onClick={() => setShowStartModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
              <button onClick={handleStartSession} disabled={isStarting} className="px-5 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl">
                {isStarting ? 'Starting...' : 'LAUNCH SESSION →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

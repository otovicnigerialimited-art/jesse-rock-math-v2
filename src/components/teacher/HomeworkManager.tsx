import React, { useState } from 'react';
import { BookOpen, Plus, Clock, CheckCircle2, AlertCircle, Users, Send, X } from 'lucide-react';
import { HomeworkAssignment, createHomeworkAssignment } from '../../lib/advancedSchoolDb';
import { SchoolStudent } from '../../lib/schoolDb';

interface HomeworkManagerProps {
  teacherId: string;
  classId: string;
  students: SchoolStudent[];
}

export default function HomeworkManager({ teacherId, classId, students }: HomeworkManagerProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('Fractions Practice Homework');
  const [topic, setTopic] = useState('Fractions');
  const [skill, setSkill] = useState('Equivalent Fractions');
  const [questionCount, setQuestionCount] = useState(10);
  const [dueDate, setDueDate] = useState('2026-08-25');

  const [activeHomework, setActiveHomework] = useState<HomeworkAssignment | null>({
    id: 'hw_demo_1',
    teacher_id: teacherId,
    class_id: classId,
    title: 'Fractions Practice Homework',
    topic: 'Fractions',
    skill: 'Equivalent Fractions',
    question_count: 10,
    difficulty: 'KS2 Standard',
    due_date: '2026-08-25',
    created_at: Date.now()
  });

  const handleCreateHomework = async () => {
    try {
      const hw = await createHomeworkAssignment(teacherId, classId, title, topic, skill, questionCount, 'KS2 Standard', dueDate);
      setActiveHomework(hw);
      setShowCreateModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 text-white">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-2xl">
            <BookOpen size={22} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">INDEPENDENT HOME LEARNING</span>
            <h3 className="text-xl font-display font-bold">HOMEWORK MANAGEMENT</h3>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md"
        >
          <Plus size={16} /> ASSIGN HOMEWORK
        </button>
      </div>

      {activeHomework ? (
        <div className="space-y-4">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Active Assignment</span>
              <h4 className="text-lg font-bold text-white">{activeHomework.title}</h4>
              <p className="text-xs text-indigo-300">{activeHomework.topic} — {activeHomework.skill} ({activeHomework.question_count} Qs)</p>
            </div>

            <div className="text-right text-xs">
              <span className="text-slate-400 block text-[10px]">Due Date</span>
              <span className="font-bold text-amber-400 flex items-center gap-1 justify-end">
                <Clock size={14} /> {activeHomework.due_date}
              </span>
            </div>
          </div>

          {/* Student Progress Table */}
          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/50">
                  <th className="p-3">Student</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Accuracy</th>
                  <th className="p-3">Skill Mastery</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st, idx) => {
                  const status = idx % 3 === 0 ? 'Completed' : idx % 2 === 0 ? 'In Progress' : 'Not Started';
                  const acc = status === 'Not Started' ? 0 : 75 + (idx * 4) % 20;
                  return (
                    <tr key={st.id || idx} className="border-b border-slate-800/40 hover:bg-slate-900/50">
                      <td className="p-3 font-bold text-white">{st.real_first_name}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400' :
                          status === 'In Progress' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-amber-400">{status === 'Not Started' ? '-' : `${((idx * 10) % 80) + 20}/100`}</td>
                      <td className="p-3 font-bold text-emerald-400">{status === 'Not Started' ? '-' : `${acc}%`}</td>
                      <td className="p-3 font-semibold text-slate-300">
                        {acc >= 80 ? '⭐ Mastered' : acc >= 60 ? '🟡 Developing' : status === 'Not Started' ? '⚪ Pending' : '🔴 Needs Practice'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-slate-950 border border-dashed border-slate-800 rounded-2xl space-y-2">
          <BookOpen size={32} className="mx-auto text-slate-600" />
          <p className="text-sm font-semibold text-slate-400">No homework currently assigned. Create an assignment to assign independent practice.</p>
        </div>
      )}

      {/* Create Homework Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full text-white shadow-2xl relative space-y-4">
            <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold">ASSIGN HOMEWORK</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Homework Title</label>
                <input value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700" />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Topic</label>
                <input value={topic} onChange={e => setTopic(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700" />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Skill</label>
                <input value={skill} onChange={e => setSkill(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Question Count</label>
                  <input type="number" value={questionCount} onChange={e => setQuestionCount(Number(e.target.value))} className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700" />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Due Date</label>
                  <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700" />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
              <button onClick={handleCreateHomework} className="px-5 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl">ASSIGN →</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

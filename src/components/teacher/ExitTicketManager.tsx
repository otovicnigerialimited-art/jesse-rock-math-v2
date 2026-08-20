import React, { useState } from 'react';
import { Ticket, Plus, CheckCircle2, AlertCircle, Users, BarChart3, ArrowRight, X, Play } from 'lucide-react';
import { ExitTicket, createExitTicket } from '../../lib/advancedSchoolDb';
import { SchoolStudent } from '../../lib/schoolDb';

interface ExitTicketManagerProps {
  teacherId: string;
  classId: string;
  students: SchoolStudent[];
  onAssignPractice: (skill: string) => void;
}

export default function ExitTicketManager({ teacherId, classId, students, onAssignPractice }: ExitTicketManagerProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [topic, setTopic] = useState('Fractions');
  const [skill, setSkill] = useState('Equivalent Fractions');
  const [numQuestions, setNumQuestions] = useState(3);
  const [difficulty, setDifficulty] = useState('Medium');
  const [isCreating, setIsCreating] = useState(false);

  // Active ticket state (starts clean with null)
  const [activeTicket, setActiveTicket] = useState<ExitTicket | null>(null);

  const totalStudents = students.length;
  const completedCount = students.filter(s => (s.school_math_progress?.solved || 0) > 0).length;
  const understoodCount = students.filter(s => {
    const solved = s.school_math_progress?.solved || 0;
    const correct = s.school_math_progress?.correctAnswers || 0;
    return solved > 0 && (correct / solved) >= 0.7;
  }).length;
  const supportCount = Math.max(0, completedCount - understoodCount);

  const handleCreateTicket = async () => {
    setIsCreating(true);
    try {
      const ticket = await createExitTicket(
        teacherId,
        classId,
        topic,
        skill,
        numQuestions,
        difficulty,
        [
          { id: 1, question: `Sample ${skill} Q1`, options: ['Option A', 'Option B', 'Option C'], answer: 'Option A', explanation: 'Basic concept rule' },
          { id: 2, question: `Sample ${skill} Q2`, options: ['Option A', 'Option B'], answer: 'Option A', explanation: 'Core calculation' },
          { id: 3, question: `Sample ${skill} Q3`, options: ['Option A', 'Option B', 'Option C'], answer: 'Option B', explanation: 'Application' }
        ]
      );
      setActiveTicket(ticket);
      setShowCreateModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 text-white">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-2xl">
            <Ticket size={22} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">LESSON CLOSURE ASSESSMENT</span>
            <h3 className="text-xl font-display font-bold">EXIT TICKETS</h3>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
        >
          <Plus size={16} /> CREATE EXIT TICKET
        </button>
      </div>

      {activeTicket ? (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-bold uppercase">ACTIVE TICKET</span>
                <span className="text-xs text-slate-400 font-semibold">{activeTicket.topic} — {activeTicket.skill}</span>
              </div>
              <h4 className="text-base font-bold text-white mt-1">{activeTicket.question_count} Questions ({activeTicket.difficulty})</h4>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400">Class Progress</span>
              <p className="text-lg font-black text-amber-400">{completedCount} / {totalStudents} Completed</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <span className="block text-2xl font-black text-white">{completedCount} / {totalStudents}</span>
              <span className="text-[10px] uppercase font-bold text-slate-400">Completed</span>
            </div>

            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <span className="block text-2xl font-black text-emerald-400">{understoodCount}</span>
              <span className="text-[10px] uppercase font-bold text-emerald-300">Understood Concept</span>
            </div>

            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
              <span className="block text-2xl font-black text-rose-400">{supportCount}</span>
              <span className="text-[10px] uppercase font-bold text-rose-300">Needs Support</span>
            </div>
          </div>

          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Common Mistake Skill: <strong className="text-amber-400">Equivalent Fractions Denominator Scaling</strong></span>
            <span className="text-rose-400 font-bold">{supportCount} students failed Q2</span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => onAssignPractice(activeTicket.skill)}
              className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <ArrowRight size={14} /> ASSIGN FOLLOW-UP PRACTICE
            </button>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-slate-950 border border-dashed border-slate-800 rounded-2xl space-y-2">
          <Ticket size={32} className="mx-auto text-slate-600" />
          <p className="text-sm font-semibold text-slate-400">No active exit ticket. Create one to test student understanding at lesson end.</p>
        </div>
      )}

      {/* Create Exit Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full text-white shadow-2xl relative space-y-4">
            <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold">CREATE LESSON EXIT TICKET</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Topic</label>
                <select value={topic} onChange={e => setTopic(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                  <option>Fractions</option>
                  <option>Decimals</option>
                  <option>Algebra</option>
                  <option>Geometry</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Skill</label>
                <input value={skill} onChange={e => setSkill(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Number of Questions</label>
                  <select value={numQuestions} onChange={e => setNumQuestions(Number(e.target.value))} className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                    <option value={3}>3 Questions</option>
                    <option value={4}>4 Questions</option>
                    <option value={5}>5 Questions</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Difficulty</label>
                  <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-3 flex gap-2">
              <button
                onClick={handleCreateTicket}
                disabled={isCreating}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs uppercase cursor-pointer"
              >
                {isCreating ? 'Generating...' : 'LAUNCH EXIT TICKET'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

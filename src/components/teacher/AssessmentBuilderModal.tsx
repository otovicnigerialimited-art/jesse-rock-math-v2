import React, { useState } from 'react';
import { FileCheck, Plus, Trash2, Edit3, Calculator, Clock, CheckCircle2, Save, Send, X, Eye } from 'lucide-react';
import { Assessment, createAssessment } from '../../lib/advancedSchoolDb';

interface AssessmentBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherId: string;
  classId: string;
  onAssignAssessment: (assessment: Assessment) => void;
}

export default function AssessmentBuilderModal({ isOpen, onClose, teacherId, classId, onAssignAssessment }: AssessmentBuilderModalProps) {
  const [title, setTitle] = useState('KS2 Math Mid-Term Assessment');
  const [topic, setTopic] = useState('Fractions & Decimals');
  const [difficulty, setDifficulty] = useState('Medium');
  const [timeLimitMins, setTimeLimitMins] = useState(20);
  const [calculatorAllowed, setCalculatorAllowed] = useState(false);

  const [questions, setQuestions] = useState<Assessment['questions']>([
    {
      id: 'q1',
      type: 'multiple_choice',
      text: 'What is 3/5 expressed as a percentage?',
      options: ['30%', '50%', '60%', '75%'],
      correctAnswer: '60%',
      skill: 'Fractions to Percentages',
      points: 1
    },
    {
      id: 'q2',
      type: 'short_answer',
      text: 'Calculate 0.75 + 1.45',
      correctAnswer: '2.2',
      skill: 'Decimal Addition',
      points: 2
    },
    {
      id: 'q3',
      type: 'word_problem',
      text: 'Sarah has 24 apples. She gives 1/3 to Tom and 1/4 to Mia. How many apples does she have left?',
      correctAnswer: '10 apples',
      skill: 'Fraction Word Problems',
      points: 3
    }
  ]);

  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionType, setNewQuestionType] = useState<'multiple_choice' | 'short_answer' | 'word_problem'>('multiple_choice');
  const [newCorrectAnswer, setNewCorrectAnswer] = useState('');

  if (!isOpen) return null;

  const handleAddQuestion = () => {
    if (!newQuestionText.trim() || !newCorrectAnswer.trim()) return;
    const newQ = {
      id: `q_${Date.now()}`,
      type: newQuestionType,
      text: newQuestionText.trim(),
      options: newQuestionType === 'multiple_choice' ? ['Option A', 'Option B', newCorrectAnswer.trim(), 'Option D'] : undefined,
      correctAnswer: newCorrectAnswer.trim(),
      skill: topic,
      points: newQuestionType === 'word_problem' ? 3 : 1
    };
    setQuestions(prev => [...prev, newQ]);
    setNewQuestionText('');
    setNewCorrectAnswer('');
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const handleSaveAndAssign = async () => {
    try {
      const assessment = await createAssessment(
        teacherId,
        classId,
        title,
        topic,
        [topic],
        difficulty,
        questions.length,
        timeLimitMins,
        calculatorAllowed,
        questions
      );
      onAssignAssessment(assessment);
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-3xl w-full text-white shadow-2xl relative max-h-[90vh] flex flex-col space-y-4">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <div className="p-3 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-2xl">
            <FileCheck size={24} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">CLASSROOM EVALUATION ENGINE</span>
            <h3 className="text-xl font-display font-bold">PROFESSIONAL ASSESSMENT BUILDER</h3>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 pr-2 space-y-4 text-xs">
          {/* Settings Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Assessment Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl font-semibold" />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Topic</label>
              <input value={topic} onChange={e => setTopic(e.target.value)} className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl" />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Time Limit (mins)</label>
              <input type="number" value={timeLimitMins} onChange={e => setTimeLimitMins(Number(e.target.value))} className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl" />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Calculator Allowed</label>
              <button
                type="button"
                onClick={() => setCalculatorAllowed(!calculatorAllowed)}
                className={`w-full p-2 rounded-xl border font-bold flex items-center justify-center gap-1.5 ${calculatorAllowed ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
              >
                <Calculator size={14} /> {calculatorAllowed ? 'YES (Allowed)' : 'NO (Disabled)'}
              </button>
            </div>
          </div>

          {/* Question List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-200">Question Item Bank ({questions.length} Items)</h4>
              <span className="text-amber-400 font-bold">Total Points: {questions.reduce((acc, q) => acc + q.points, 0)} pts</span>
            </div>

            {questions.map((q, idx) => (
              <div key={q.id} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-800 rounded text-[10px] font-bold text-amber-400 uppercase">Q{idx + 1} • {q.type.replace('_', ' ')}</span>
                    <span className="text-[10px] text-slate-400">{q.points} pt{q.points > 1 ? 's' : ''}</span>
                  </div>
                  <p className="font-semibold text-white">{q.text}</p>
                  <p className="text-[11px] text-emerald-400 font-mono">Answer: {q.correctAnswer}</p>
                </div>

                <button onClick={() => handleRemoveQuestion(q.id)} className="p-2 text-rose-400 hover:text-rose-300">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Add New Question Form */}
          <div className="p-4 bg-slate-950 border border-dashed border-slate-800 rounded-2xl space-y-3">
            <h5 className="font-bold text-slate-300 flex items-center gap-1.5">
              <Plus size={16} className="text-amber-400" /> Add Custom Question
            </h5>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <input
                  placeholder="Enter question text..."
                  value={newQuestionText}
                  onChange={e => setNewQuestionText(e.target.value)}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <select
                  value={newQuestionType}
                  onChange={e => setNewQuestionType(e.target.value as any)}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl"
                >
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="short_answer">Short Answer</option>
                  <option value="word_problem">Word Problem</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                placeholder="Exact correct answer..."
                value={newCorrectAnswer}
                onChange={e => setNewCorrectAnswer(e.target.value)}
                className="flex-1 p-2 bg-slate-900 border border-slate-700 rounded-xl"
              />
              <button
                type="button"
                onClick={handleAddQuestion}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 font-bold rounded-xl text-amber-400 cursor-pointer"
              >
                + Add Item
              </button>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs">
            Cancel
          </button>
          <button
            onClick={handleSaveAndAssign}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
          >
            <Send size={15} /> SAVE & ASSIGN ASSESSMENT
          </button>
        </div>
      </div>
    </div>
  );
}

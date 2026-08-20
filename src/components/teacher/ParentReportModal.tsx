import React from 'react';
import { Printer, X, Award, TrendingUp, CheckCircle, Lightbulb, Heart, BookOpen } from 'lucide-react';
import { SchoolStudent } from '../../lib/schoolDb';

interface ParentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: SchoolStudent | null;
  className?: string;
}

export default function ParentReportModal({ isOpen, onClose, student, className = 'Year 5A' }: ParentReportModalProps) {
  if (!isOpen || !student) return null;

  const handlePrint = () => {
    window.print();
  };

  const progress = student.school_math_progress || {
    solved: 0,
    correctAnswers: 0,
    highScore: 0,
    currentLevel: 1
  };

  const accuracy = progress.solved > 0 ? Math.round((progress.correctAnswers / progress.solved) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-2xl w-full text-white shadow-2xl relative max-h-[90vh] flex flex-col space-y-4 print:bg-white print:text-black print:border-none print:shadow-none">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white print:hidden">
          <X size={18} />
        </button>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 print:border-slate-300 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-400 text-slate-950 rounded-2xl font-black">
              <Heart size={24} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">FAMILY ENGAGEMENT REPORT</span>
              <h3 className="text-xl font-display font-bold">PARENT PROGRESS REPORT</h3>
            </div>
          </div>

          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
          >
            <Printer size={16} /> PRINT PARENT REPORT
          </button>
        </div>

        {/* Printable Parent Report Sheet */}
        <div className="overflow-y-auto flex-1 space-y-5 p-2 font-sans">
          <div className="p-5 bg-slate-950 print:bg-slate-100 rounded-2xl border border-slate-800 print:border-slate-300 space-y-2 text-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 print:text-indigo-600">JESSE MATH ROCKSTAR • CLASSROOM REPORT</span>
            <h2 className="text-2xl font-black text-white print:text-black">{student.real_first_name}'s Math Learning Summary</h2>
            <p className="text-xs text-slate-400 print:text-slate-600">Class: {className} • Date: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="p-3 bg-slate-950 print:bg-slate-50 border border-slate-800 print:border-slate-300 rounded-xl">
              <span className="block text-2xl font-black text-amber-400 print:text-black">{progress.currentLevel}</span>
              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600">Rockstar Level</span>
            </div>

            <div className="p-3 bg-slate-950 print:bg-slate-50 border border-slate-800 print:border-slate-300 rounded-xl">
              <span className="block text-2xl font-black text-emerald-400 print:text-black">{accuracy}%</span>
              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600">Overall Accuracy</span>
            </div>

            <div className="p-3 bg-slate-950 print:bg-slate-50 border border-slate-800 print:border-slate-300 rounded-xl">
              <span className="block text-2xl font-black text-indigo-400 print:text-black">{progress.solved}</span>
              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600">Math Problems Solved</span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            {/* Key Strengths */}
            <div className="p-4 bg-emerald-500/10 print:bg-emerald-50 border border-emerald-500/30 print:border-emerald-300 rounded-2xl space-y-1">
              <h4 className="font-bold text-emerald-400 print:text-emerald-800 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <CheckCircle size={15} /> Key Strengths & Concepts Mastered
              </h4>
              <ul className="list-disc list-inside text-slate-300 print:text-slate-800 space-y-1">
                <li>Demonstrates high speed and confidence in 2D Shape Properties and Symmetry.</li>
                <li>Consistently achieves 90%+ accuracy on Mental Addition and Subtraction.</li>
                <li>Excellent effort and engagement during live classroom speed sessions.</li>
              </ul>
            </div>

            {/* Focus Areas */}
            <div className="p-4 bg-amber-500/10 print:bg-amber-50 border border-amber-500/30 print:border-amber-300 rounded-2xl space-y-1">
              <h4 className="font-bold text-amber-400 print:text-amber-800 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <TrendingUp size={15} /> Current Focus & Improvement Area
              </h4>
              <p className="text-slate-300 print:text-slate-800 leading-relaxed">
                Currently focusing on <strong>Equivalent Fractions</strong> (scaling numerators and denominators equally). Extra practice with visual fraction bars at home will build fluency.
              </p>
            </div>

            {/* Suggested Home Practice */}
            <div className="p-4 bg-indigo-500/10 print:bg-indigo-50 border border-indigo-500/30 print:border-indigo-300 rounded-2xl space-y-1">
              <h4 className="font-bold text-indigo-300 print:text-indigo-800 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <BookOpen size={15} /> Suggested Home Practice Tips
              </h4>
              <p className="text-slate-300 print:text-slate-800 leading-relaxed">
                Log into Jesse Math Rockstar for 10 minutes, 3 times a week. Try playing "Fractions Speed Challenge" together to earn new Rockstar cosmetic avatar unlocks!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

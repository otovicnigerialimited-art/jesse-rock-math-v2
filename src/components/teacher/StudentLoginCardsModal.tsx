import React from 'react';
import { Printer, Download, X, QrCode, Lock, GraduationCap } from 'lucide-react';
import { SchoolStudent } from '../../lib/schoolDb';

interface StudentLoginCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: SchoolStudent[];
  className?: string;
}

export default function StudentLoginCardsModal({ isOpen, onClose, students, className = 'Year 5A' }: StudentLoginCardsModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-4xl w-full text-white shadow-2xl relative max-h-[90vh] flex flex-col space-y-4">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white print:hidden">
          <X size={18} />
        </button>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-2xl">
              <GraduationCap size={24} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">PRINTABLE STUDENT ACCESS CARDS</span>
              <h3 className="text-xl font-display font-bold">STUDENT LOGIN CARDS ({students.length})</h3>
            </div>
          </div>

          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
          >
            <Printer size={16} /> PRINT ALL LOGIN CARDS
          </button>
        </div>

        {/* Printable Cards Grid */}
        <div className="overflow-y-auto flex-1 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
          {students.map((st, idx) => (
            <div
              key={st.id || idx}
              className="p-5 rounded-2xl bg-slate-950 border-2 border-indigo-500/40 space-y-3 relative overflow-hidden print:border-black print:text-black print:bg-white"
            >
              <div className="flex items-center justify-between border-b border-slate-800 print:border-slate-300 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎸</span>
                  <span className="font-black text-xs uppercase tracking-wider text-amber-400 print:text-black">JESSE MATH ROCKSTAR</span>
                </div>
                <span className="text-[10px] font-bold bg-slate-800 print:bg-slate-200 px-2 py-0.5 rounded text-slate-300 print:text-black">
                  {className}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold print:text-slate-600">Student Name</span>
                <h4 className="text-lg font-black text-white print:text-black uppercase tracking-tight">{st.real_first_name}</h4>
              </div>

              <div className="p-3 bg-slate-900 print:bg-slate-100 rounded-xl space-y-1 font-mono text-xs border border-slate-800 print:border-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400 print:text-slate-600 font-sans">Username:</span>
                  <strong className="text-amber-400 print:text-black font-bold">@{st.username}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 print:text-slate-600 font-sans">Temp Pass/PIN:</span>
                  <strong className="text-emerald-400 print:text-black font-bold">{st.password || 'star123'}</strong>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 print:text-slate-600">
                <span>https://jesse-math-rockstar-app.vercel.app</span>
                <QrCode size={20} className="text-indigo-400 print:text-black" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

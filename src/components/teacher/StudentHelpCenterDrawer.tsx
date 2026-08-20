import React, { useState, useEffect } from 'react';
import { HelpCircle, Bell, CheckCircle, Clock, FileText, AlertCircle, X, ChevronRight, Check } from 'lucide-react';
import { StudentHelpRequest, resolveHelpRequest } from '../../lib/advancedSchoolDb';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface StudentHelpCenterDrawerProps {
  teacherId: string;
}

export default function StudentHelpCenterDrawer({ teacherId }: StudentHelpCenterDrawerProps) {
  const [requests, setRequests] = useState<StudentHelpRequest[]>([
    {
      id: 'req_1',
      student_id: 's1',
      student_name: 'Alex Smith',
      class_id: 'c1',
      teacher_id: teacherId,
      topic: 'Fractions',
      skill: 'Equivalent Fractions',
      question_index: 7,
      question_text: 'Find an equivalent fraction for 3/4 with denominator 12.',
      student_answer: '3/12',
      working_notes: 'Multiplied bottom by 3, forgot to multiply top.',
      attempts: 2,
      time_spent_seconds: 145,
      status: 'pending',
      timestamp: Date.now() - 120000
    }
  ]);

  const [selectedReq, setSelectedReq] = useState<StudentHelpRequest | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Live Firestore listener on help requests
  useEffect(() => {
    if (!teacherId) return;
    const q = query(
      collection(db, 'student_help_requests'),
      where('teacher_id', '==', teacherId),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: StudentHelpRequest[] = [];
      snapshot.forEach(d => list.push({ id: d.id, ...d.data() } as StudentHelpRequest));
      if (list.length > 0) {
        setRequests(list);
      }
    });

    return () => unsubscribe();
  }, [teacherId]);

  const pendingRequests = requests.filter(r => r.status === 'pending');

  const handleResolve = async (id: string) => {
    try {
      await resolveHelpRequest(id);
    } catch (err) {
      console.warn(err);
    }
    setRequests(prev => prev.filter(r => r.id !== id));
    if (selectedReq?.id === id) setSelectedReq(null);
  };

  return (
    <>
      {/* Floating Notification Badge Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 px-4 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-full shadow-2xl flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
      >
        <Bell size={20} className={pendingRequests.length > 0 ? 'animate-bounce' : ''} />
        <span className="text-xs uppercase tracking-wider font-display">STUDENT HELP REQUESTS</span>
        {pendingRequests.length > 0 && (
          <span className="w-6 h-6 rounded-full bg-white text-rose-600 font-black text-xs flex items-center justify-center shadow-inner">
            {pendingRequests.length}
          </span>
        )}
      </button>

      {/* Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-slate-900 border-l border-slate-700 w-full max-w-md h-full text-white p-6 shadow-2xl flex flex-col space-y-4 overflow-y-auto relative">
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-3 bg-rose-500/20 text-rose-400 rounded-2xl border border-rose-500/30">
                <HelpCircle size={24} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">CLASSROOM HELP DESK</span>
                <h3 className="text-xl font-display font-bold">STUDENT ASSISTANCE</h3>
              </div>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <CheckCircle size={40} className="mx-auto text-emerald-400" />
                <p className="text-sm font-semibold text-slate-300">All student help requests resolved!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map(req => (
                  <div
                    key={req.id}
                    onClick={() => setSelectedReq(req)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${selectedReq?.id === req.id ? 'bg-slate-800 border-rose-500' : 'bg-slate-950 border-slate-800 hover:bg-slate-900'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm flex items-center gap-1.5">
                        <AlertCircle size={16} className="text-rose-400" /> {req.student_name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Q#{req.question_index}</span>
                    </div>

                    <p className="text-xs text-indigo-300 font-medium">{req.topic} — {req.skill}</p>

                    <div className="p-2 bg-slate-900 rounded-xl text-xs text-slate-300 border border-slate-800">
                      "{req.question_text}"
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-rose-400 font-mono font-bold">Entered Answer: {req.student_answer}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleResolve(req.id); }}
                        className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg flex items-center gap-1 text-[10px]"
                      >
                        <Check size={12} /> Resolve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

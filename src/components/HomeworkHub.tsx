import React, { useEffect, useState } from 'react';
import { BookOpen, Calendar, Clock, CheckCircle2, ArrowRight, Bell } from 'lucide-react';
import { listenToClassHomework, HomeworkAssignment } from '../lib/homeworkDb';
import { requestNotificationPermission } from '../lib/notificationHelper';

interface HomeworkHubProps {
  classCode: string;
  userId: string;
  onNavigateToTab?: (tabId: string) => void;
}

export default function HomeworkHub({ classCode, userId, onNavigateToTab }: HomeworkHubProps) {
  const [assignments, setAssignments] = useState<HomeworkAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    if (!classCode) {
      setLoading(false);
      return;
    }
    const unsubscribe = listenToClassHomework(classCode, (data) => {
      setAssignments(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [classCode]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in pb-32">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden text-white">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-display font-black mb-2 tracking-tight">Homework & Task Hub</h2>
            <p className="text-emerald-50 text-lg max-w-xl">
              Complete assignments posted by your teacher to earn massive XP and climb the ranks!
            </p>
          </div>
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
            <BookOpen size={40} className="text-white" />
          </div>
        </div>
      </div>

      {!notificationsEnabled && (
        <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-4 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
              <Bell className="text-indigo-600" size={20} />
            </div>
            <div>
              <h4 className="font-bold text-indigo-900">Never miss an assignment!</h4>
              <p className="text-indigo-700 text-sm">Enable real-time push notifications for new homework.</p>
            </div>
          </div>
          <button 
            onClick={async () => {
              const success = await requestNotificationPermission(userId, "class_student");
              if (success) setNotificationsEnabled(true);
            }}
            className="shrink-0 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-colors"
          >
            Enable Alerts
          </button>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-bold text-deep-navy mb-4">Active Assignments</h3>
        {loading ? (
          <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div></div>
        ) : assignments.length === 0 ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
            <CheckCircle2 size={48} className="mx-auto text-slate-300 mb-4" />
            <h4 className="text-lg font-bold text-slate-700 mb-2">No active assignments!</h4>
            <p className="text-slate-500">You're all caught up. Jump into the Pitch to practice your skills.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignments.map(assignment => (
              <div key={assignment.id} className="bg-white border-2 border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-bold text-lg text-deep-navy">{assignment.title}</h4>
                  <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                    {assignment.type === 'arena' ? 'PITCH DRILL' : assignment.type === 'sats' ? 'SATS PREP' : 'QUIZ'}
                  </span>
                </div>
                <p className="text-slate-600 text-sm mb-4 line-clamp-2">{assignment.description}</p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center text-xs font-medium text-slate-500 gap-3">
                    <span className="flex items-center gap-1"><Calendar size={14} /> Due: {assignment.dueDate}</span>
                  </div>
                  <button 
                    onClick={() => onNavigateToTab && onNavigateToTab(assignment.type === 'arena' ? 'pitch' : assignment.type === 'sats' ? 'sats' : 'quiz')}
                    className="flex items-center gap-1 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    Start Task <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { ExtendedUserStats } from '../types/extendedTypes';
import { 
  Bell, 
  BellOff, 
  Flame, 
  RotateCcw, 
  Trophy, 
  X, 
  CheckCircle2, 
  Sparkles
} from 'lucide-react';

interface SmartNotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: ExtendedUserStats;
  onToggleNotifications: (enabled: boolean) => void;
}

export default function SmartNotificationsModal({
  isOpen,
  onClose,
  stats,
  onToggleNotifications
}: SmartNotificationsModalProps) {
  const [enabled, setEnabled] = useState(!!stats.notificationsEnabled);

  if (!isOpen) return null;

  const handleToggle = () => {
    const nextState = !enabled;
    setEnabled(nextState);
    onToggleNotifications(nextState);

    if (nextState && 'Notification' in window) {
      Notification.requestPermission();
    }
  };

  const notificationsList = [
    {
      id: '1',
      title: '🔥 Active Streak Reminder',
      body: `You are on a ${stats.streak || 0}-day streak! Solve 1 question today to keep your streak alive.`,
      time: 'Just now',
      type: 'streak'
    },
    {
      id: '2',
      title: '🧠 Spaced Practice Scheduled',
      body: '2 math topics are due for spaced repetition review.',
      time: '2 hours ago',
      type: 'practice'
    },
    {
      id: '3',
      title: '🏆 Personal Best Achieved!',
      body: `Your verified high score stands at ${stats.personalBests?.highestQuizScore || 0} questions solved.`,
      time: '1 day ago',
      type: 'record'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative max-w-md w-full bg-white rounded-3xl border-4 border-indigo-900 shadow-2xl overflow-hidden p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-900 text-amber-400 flex items-center justify-center font-bold">
              <Bell size={22} />
            </div>
            <div>
              <h3 className="font-display font-black text-slate-900 text-lg">
                Smart Reminders & Alerts
              </h3>
              <p className="text-xs text-slate-500 font-medium">Activity notifications & streak defense</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        {/* Toggle option */}
        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="font-bold text-xs text-indigo-950">In-App & Browser Reminders</h4>
            <p className="text-[11px] text-slate-500 font-medium">Notify me about streaks and personal bests</p>
          </div>
          <button
            onClick={handleToggle}
            className={`w-12 h-7 rounded-full transition-all relative p-1 cursor-pointer ${
              enabled ? 'bg-indigo-600' : 'bg-slate-300'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-all shadow ${
              enabled ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>

        {/* Notifications Feed */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">Recent Activity Alerts</h4>
          {notificationsList.map(n => (
            <div key={n.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                <span>{n.title}</span>
                <span className="text-[10px] text-slate-400 font-normal">{n.time}</span>
              </div>
              <p className="text-xs text-slate-600 font-medium">{n.body}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

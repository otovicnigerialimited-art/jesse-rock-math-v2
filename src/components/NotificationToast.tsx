import React, { useState, useEffect } from 'react';
import { Bell, X, ExternalLink } from 'lucide-react';
import { NotificationLogItem } from '../lib/notificationManager';

interface NotificationToastProps {
  onOpenHub: () => void;
}

export default function NotificationToast({ onOpenHub }: NotificationToastProps) {
  const [activeToast, setActiveToast] = useState<NotificationLogItem | null>(null);

  useEffect(() => {
    const handleNotificationEvent = (e: Event) => {
      const customEvent = e as CustomEvent<NotificationLogItem>;
      if (customEvent.detail) {
        setActiveToast(customEvent.detail);
        // Auto dismiss after 6 seconds
        const timer = setTimeout(() => {
          setActiveToast(null);
        }, 6000);
        return () => clearTimeout(timer);
      }
    };

    window.addEventListener('jesse-math-notification', handleNotificationEvent as EventListener);
    return () => {
      window.removeEventListener('jesse-math-notification', handleNotificationEvent as EventListener);
    };
  }, []);

  if (!activeToast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-bounce-short">
      <div className="bg-slate-950 text-white p-4 rounded-2xl border-2 border-amber-400 shadow-2xl flex items-start gap-3 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-400" />
        
        <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-400/30">
          <Bell size={20} className="animate-pulse" />
        </div>

        <div className="flex-1 pr-6">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
              New Real Alert
            </span>
            <span className="text-[10px] text-slate-400">Just now</span>
          </div>
          <h4 className="text-xs font-bold text-white mt-0.5 line-clamp-1">{activeToast.title}</h4>
          <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed font-medium">{activeToast.body}</p>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => {
                setActiveToast(null);
                onOpenHub();
              }}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-[11px] font-black rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ExternalLink size={13} /> View in Hub
            </button>
          </div>
        </div>

        <button
          onClick={() => setActiveToast(null)}
          className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
          aria-label="Close notification toast"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

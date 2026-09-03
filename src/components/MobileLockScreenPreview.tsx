import React, { useState } from 'react';
import { Smartphone, Bell, Shield, CheckCircle2, Zap, ArrowRight, Play, Volume2 } from 'lucide-react';
import { dispatchNotification } from '../lib/notificationManager';

export default function MobileLockScreenPreview() {
  const [deviceType, setDeviceType] = useState<'ios' | 'android'>('android');
  const [simulatedBanner, setSimulatedBanner] = useState<{
    title: string;
    body: string;
    time: string;
    app: string;
  } | null>({
    title: '🔥 Jesse Math FC Streak Alert',
    body: 'Your math striker streak is active! Complete one speed gig today to keep your crown.',
    time: 'Just now',
    app: 'Jesse Math FC'
  });

  const triggerLockScreenBanner = (title: string, body: string) => {
    setSimulatedBanner({
      title,
      body,
      time: 'Just now',
      app: 'Jesse Math FC'
    });
    dispatchNotification('motivation', 'streakReminders', title, body);

    setTimeout(() => {
      setSimulatedBanner(null);
    }, 8000);
  };

  return (
    <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white border-2 border-indigo-500/30 shadow-2xl space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
            <Smartphone size={16} /> Mobile Lock Screen & Banner Simulator
          </div>
          <h3 className="text-lg font-black text-white mt-1">iOS & Android Push Banner Preview</h3>
          <p className="text-xs text-slate-300 font-medium">Test how push notifications display as native lock screen cards and drop-down notification banners.</p>
        </div>

        <div className="flex items-center bg-white/10 p-1 rounded-xl border border-white/15">
          <button
            onClick={() => setDeviceType('android')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              deviceType === 'android' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            Android (Material)
          </button>
          <button
            onClick={() => setDeviceType('ios')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              deviceType === 'ios' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            iOS (Apple)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        {/* SIMULATED PHONE LOCK SCREEN */}
        <div className="relative mx-auto w-full max-w-[280px] h-[520px] bg-slate-950 rounded-[40px] border-4 border-slate-700 shadow-2xl p-4 flex flex-col justify-between overflow-hidden">
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
          </div>

          <div className="pt-10 text-center space-y-1">
            <div className="text-3xl font-light font-mono tracking-tight text-white">10:42</div>
            <div className="text-[11px] font-medium text-slate-300">Monday, August 24</div>
          </div>

          <div className="my-auto space-y-2">
            {simulatedBanner ? (
              <div className={`p-3.5 rounded-2xl backdrop-blur-xl border shadow-2xl transition-all ${
                deviceType === 'ios' 
                  ? 'bg-slate-900/85 border-white/20 text-white' 
                  : 'bg-slate-900/95 border-indigo-500/40 text-white'
              }`}>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                    {simulatedBanner.app}
                  </div>
                  <span>{simulatedBanner.time}</span>
                </div>
                <h5 className="text-xs font-bold text-white line-clamp-1">{simulatedBanner.title}</h5>
                <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">{simulatedBanner.body}</p>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs italic">
                No active notifications on lock screen.<br/>Tap a test trigger below!
              </div>
            )}
          </div>

          <div className="pb-2 text-center">
            <div className="w-32 h-1 bg-white/30 rounded-full mx-auto" />
            <span className="text-[9px] text-slate-400 mt-1.5 block">Swipe up to unlock</span>
          </div>
        </div>

        {/* TEST TRIGGERS & CONTROLS */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
            <Zap size={16} /> Live Push Lock Screen Triggers
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Click any trigger below to dispatch a real-time push notification. On supported mobile browsers (Chrome Android & Safari iOS installed to home screen), this triggers native lock-screen cards with vibration and persistent alert banners.
          </p>

          <div className="space-y-2.5">
            <button
              onClick={() => triggerLockScreenBanner('🔥 URGENT: Streak Warning', 'Your math streak is about to expire! Solve 3 quick equations now.')}
              className="w-full p-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-left transition-all flex items-center justify-between cursor-pointer"
            >
              <div>
                <span className="text-xs font-bold block text-white">🔥 Streak & Urgency Warning</span>
                <span className="text-[10px] text-slate-300">Lock screen persistent alert</span>
              </div>
              <Play size={14} className="text-amber-400" />
            </button>

            <button
              onClick={() => triggerLockScreenBanner('⚡ Live Speed Duel Challenge', 'Alex challenged you to a 60-second multiplication showdown!')}
              className="w-full p-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-left transition-all flex items-center justify-between cursor-pointer"
            >
              <div>
                <span className="text-xs font-bold block text-white">⚡ Multiplayer Duel Invitation</span>
                <span className="text-[10px] text-slate-300">High priority lock screen banner</span>
              </div>
              <Play size={14} className="text-amber-400" />
            </button>

            <button
              onClick={() => triggerLockScreenBanner('🏆 Reward Unlocked: Gold Badge!', 'You earned the Grand Master Mathematician award with 100% accuracy.')}
              className="w-full p-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-left transition-all flex items-center justify-between cursor-pointer"
            >
              <div>
                <span className="text-xs font-bold block text-white">🏆 Achievement & Badge Reward</span>
                <span className="text-[10px] text-slate-300">Rich media lock screen notification</span>
              </div>
              <Play size={14} className="text-amber-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Volume2, 
  Music, 
  EyeOff, 
  Bell, 
  BellOff, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  User, 
  Sparkles,
  ChevronRight,
  Sliders
} from 'lucide-react';
import { 
  getBrowserNotificationPermission, 
  requestNotificationPermission, 
  dispatchNotification 
} from '../lib/notificationManager';
import { ExtendedUserStats } from '../types/extendedTypes';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: any;
  setConfig: (config: any) => void;
  username?: string;
  userRole?: string;
  stats?: ExtendedUserStats;
  onOpenNotifications?: () => void;
}

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  config, 
  setConfig,
  username = 'Striker',
  userRole = 'Student',
  stats,
  onOpenNotifications
}: SettingsModalProps) {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(getBrowserNotificationPermission());
  const [pushEnabled, setPushEnabled] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const currentPerm = getBrowserNotificationPermission();
      setPermission(currentPerm);
      setPushEnabled(currentPerm === 'granted');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleWebPushToggle = async () => {
    setStatusMessage(null);

    if (!pushEnabled) {
      // Request permission from Browser Notification Web API
      const result = await requestNotificationPermission();
      setPermission(result);

      if (result === 'granted') {
        setPushEnabled(true);
        setStatusMessage('✅ Web Push Notifications enabled! Test alert sent.');
        dispatchNotification(
          'motivation',
          'streakReminders',
          '🔔 Web Push Notifications Enabled!',
          'You will now receive real-time streak warnings, assignment deadlines, and milestone rewards.'
        );
      } else if (result === 'denied') {
        setPushEnabled(false);
        setStatusMessage('⚠️ Browser permission denied. Please enable notifications in your browser address bar.');
      } else {
        setPushEnabled(false);
        setStatusMessage('Notice: Browser permission request was not granted.');
      }
    } else {
      // Toggle off locally
      setPushEnabled(false);
      setStatusMessage('Web Push notifications paused for this browser session.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white border-4 border-deep-navy p-6 md:p-8 rounded-3xl w-full max-w-lg shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 border border-indigo-300 flex items-center justify-center text-indigo-700 font-bold">
              <Sliders size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-deep-navy">User Profile &amp; Settings</h2>
              <p className="text-xs text-slate-500 font-medium">Manage preferences &amp; web push alerts</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={20}/>
          </button>
        </div>

        {/* User Identity Chip */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center text-lg">
              {username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">{username}</h3>
              <p className="text-[11px] text-indigo-200 font-medium capitalize">
                {userRole.replace('_', ' ')} {stats?.level ? `• Level ${stats.level} Striker` : ''}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-indigo-500/30 border border-indigo-400/30 text-amber-300 font-bold text-[10px] rounded-lg uppercase tracking-wider">
            Active Profile
          </span>
        </div>

        {/* Status Toast Message */}
        {statusMessage && (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* SECTION 1: WEB PUSH NOTIFICATIONS SETTINGS */}
        <div className="p-5 rounded-2xl bg-slate-50 border-2 border-indigo-100 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-950 font-black text-sm">
              <Bell size={18} className="text-indigo-600" />
              <span>Web Push Notifications</span>
            </div>
            
            {/* Status Badge */}
            {permission === 'granted' && pushEnabled ? (
              <span className="px-2.5 py-0.5 bg-emerald-100 border border-emerald-300 text-emerald-800 font-extrabold text-[10px] rounded-full flex items-center gap-1">
                <CheckCircle2 size={11} /> Granted
              </span>
            ) : permission === 'denied' ? (
              <span className="px-2.5 py-0.5 bg-rose-100 border border-rose-300 text-rose-800 font-extrabold text-[10px] rounded-full">
                Denied
              </span>
            ) : (
              <span className="px-2.5 py-0.5 bg-amber-100 border border-amber-300 text-amber-800 font-extrabold text-[10px] rounded-full">
                Prompt Needed
              </span>
            )}
          </div>

          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            Receive real-time web push alerts for daily streak warnings, teacher assignment deadlines, and level celebrations.
          </p>

          {/* User Toggle Switch calling Browser Permission API */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold text-slate-800">
              {pushEnabled ? 'Push Alerts Enabled' : 'Enable Web Push Alerts'}
            </span>
            <button 
              type="button"
              onClick={handleWebPushToggle}
              className={`w-12 h-7 rounded-full transition-all relative p-1 cursor-pointer ${
                pushEnabled ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
              aria-label="Toggle Web Push Notifications"
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-all shadow ${
                pushEnabled ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Granular Categories Button */}
          {onOpenNotifications && (
            <button
              type="button"
              onClick={onOpenNotifications}
              className="w-full mt-2 py-2.5 px-4 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-900 font-bold text-xs rounded-xl flex items-center justify-between transition-colors cursor-pointer shadow-sm"
            >
              <span className="flex items-center gap-1.5">
                <Sliders size={14} className="text-indigo-600" />
                <span>Customize Notification Categories &amp; View History</span>
              </span>
              <ChevronRight size={16} className="text-indigo-400" />
            </button>
          )}
        </div>

        {/* SECTION 2: AUDIO & DISPLAY PREFERENCES */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Audio &amp; Display Preferences</h4>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-deep-navy text-sm font-bold">
              <Volume2 size={18} className="text-amber-500" />
              <span>Sound Effects</span>
            </div>
            <button 
              type="button"
              onClick={() => setConfig({...config, soundEffects: !config.soundEffects})}
              className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 cursor-pointer ${config.soundEffects ? 'bg-indigo-600' : 'bg-slate-300'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${config.soundEffects ? 'translate-x-6' : ''}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-deep-navy text-sm font-bold">
              <Music size={18} className="text-indigo-500" />
              <span>Stadium Atmosphere</span>
            </div>
            <button 
              type="button"
              onClick={() => setConfig({...config, rockMusic: !config.rockMusic})}
              className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 cursor-pointer ${config.rockMusic ? 'bg-indigo-600' : 'bg-slate-300'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${config.rockMusic ? 'translate-x-6' : ''}`} />
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 text-deep-navy text-sm font-bold">
              <EyeOff size={18} className="text-amber-600" />
              <span>Quiet Mode (Low Stimulation)</span>
            </div>
            <button 
              type="button"
              onClick={() => setConfig({...config, quietMode: !config.quietMode})}
              className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 cursor-pointer ${config.quietMode ? 'bg-amber-500' : 'bg-slate-300'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${config.quietMode ? 'translate-x-6' : ''}`} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <ShieldCheck size={14} className="text-emerald-500" /> COPPA Safe &amp; Privacy Compliant
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}


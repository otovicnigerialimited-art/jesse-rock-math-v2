import React, { useState, useEffect } from 'react';
import { ExtendedUserStats } from '../types/extendedTypes';
import { 
  Bell, 
  BellOff, 
  Flame, 
  Trophy, 
  X, 
  CheckCircle2, 
  Sparkles,
  ShieldCheck,
  Clock,
  Calendar,
  BarChart3,
  Lightbulb,
  Settings2,
  Send,
  AlertCircle,
  BookOpen,
  Award,
  HelpCircle,
  GraduationCap,
  MessageSquare,
  Lock,
  Wrench,
  Check,
  Smartphone
} from 'lucide-react';
import {
  getNotificationPreferences,
  saveNotificationPreferences,
  getBrowserNotificationPermission,
  requestNotificationPermission,
  dispatchNotification,
  getNotificationLogs,
  markNotificationsAsRead,
  NotificationCategorySettings,
  NotificationLogItem
} from '../lib/notificationManager';
import MobileLockScreenPreview from './MobileLockScreenPreview';

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
  const [activeTab, setActiveTab] = useState<'preferences' | 'feed' | 'testing' | 'mobile'>('preferences');
  const [enabled, setEnabled] = useState(!!stats.notificationsEnabled);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(getBrowserNotificationPermission());
  const [settings, setSettings] = useState<NotificationCategorySettings>(getNotificationPreferences());
  const [logs, setLogs] = useState<NotificationLogItem[]>([]);
  const [testSuccessMessage, setTestSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPermission(getBrowserNotificationPermission());
      setSettings(getNotificationPreferences());
      setLogs(getNotificationLogs());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMasterToggle = () => {
    const nextState = !enabled;
    setEnabled(nextState);
    onToggleNotifications(nextState);

    if (nextState) {
      requestNotificationPermission().then(res => setPermission(res));
    }
  };

  const handleGrantBrowserPermission = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
    if (result === 'granted') {
      setEnabled(true);
      onToggleNotifications(true);
      dispatchNotification(
        'motivation',
        'streakReminders',
        '🔔 Real Web Push Notifications Active!',
        'You successfully allowed browser notifications. Real-time alerts, streak warnings, and rewards are now active!'
      );
      setTestSuccessMessage('✅ Notifications allowed & real test alert dispatched!');
      setTimeout(() => setTestSuccessMessage(null), 4000);
    }
  };

  const handleCategoryToggle = (key: keyof NotificationCategorySettings) => {
    const updated = saveNotificationPreferences({ [key]: !settings[key] });
    setSettings(updated);
  };

  const triggerTestAlert = (
    group: 'motivation' | 'learning' | 'progress' | 'discovery' | 'system',
    key: keyof NotificationCategorySettings,
    title: string,
    body: string
  ) => {
    const sent = dispatchNotification(group, key, title, body);
    setLogs(getNotificationLogs());
    if (sent) {
      setTestSuccessMessage(`Notification sent: "${title}"`);
      setTimeout(() => setTestSuccessMessage(null), 3500);
    } else {
      setTestSuccessMessage(`Category "${String(key)}" is currently toggled OFF in settings.`);
      setTimeout(() => setTestSuccessMessage(null), 3500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative max-w-2xl w-full bg-white rounded-3xl border-4 border-indigo-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between border-b border-indigo-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 border border-indigo-400 text-amber-300 flex items-center justify-center font-bold shadow-lg shadow-indigo-600/30">
              <Bell size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-white text-lg sm:text-xl tracking-tight">
                  Smart Notifications Hub
                </h3>
                {permission === 'granted' && (
                  <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-bold text-[10px] rounded-full flex items-center gap-1">
                    <CheckCircle2 size={12} /> Active
                  </span>
                )}
              </div>
              <p className="text-xs text-indigo-200 font-medium">Customize streak alerts, learning updates, and progress reports</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl text-indigo-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* BROWSER PERMISSION BANNER */}
        {permission !== 'granted' && permission !== 'unsupported' && (
          <div className="p-4 bg-amber-500/10 border-b border-amber-500/30 px-6 flex items-center justify-between flex-wrap gap-3 shrink-0">
            <div className="flex items-center gap-2.5 text-xs font-semibold text-amber-900">
              <AlertCircle size={18} className="text-amber-600 shrink-0" />
              <span>Allow browser notifications to receive live streak warnings and homework alerts on your device.</span>
            </div>
            <button
              onClick={handleGrantBrowserPermission}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow transition-all cursor-pointer"
            >
              Enable Browser Alerts
            </button>
          </div>
        )}

        {/* MASTER SWITCH & NAVIGATION TABS */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1 bg-slate-200 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('preferences')}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                activeTab === 'preferences' 
                  ? 'bg-white text-indigo-950 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Category Settings
            </button>
            <button
              onClick={() => {
                setActiveTab('feed');
                markNotificationsAsRead();
              }}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'feed' 
                  ? 'bg-white text-indigo-950 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Recent Feed</span>
              {logs.filter(l => !l.read).length > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('testing')}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                activeTab === 'testing' 
                  ? 'bg-white text-indigo-950 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Test Notifications
            </button>
            <button
              onClick={() => setActiveTab('mobile')}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'mobile' 
                  ? 'bg-white text-indigo-950 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone size={13} /> Mobile Lock Screen
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700">Master Notifications Switch</span>
            <button
              onClick={handleMasterToggle}
              className={`w-12 h-7 rounded-full transition-all relative p-1 cursor-pointer ${
                enabled ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-all shadow ${
                enabled ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>

        {/* FEEDBACK TOAST MESSAGE */}
        {testSuccessMessage && (
          <div className="bg-emerald-50 border-b border-emerald-200 text-emerald-900 text-xs font-bold px-6 py-2.5 flex items-center gap-2 animate-fade-in shrink-0">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{testSuccessMessage}</span>
          </div>
        )}

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="p-6 overflow-y-auto space-y-8 flex-1">

          {/* TAB 1: GRANULAR CATEGORY PREFERENCES */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">

              {/* 1. Motivation & Engagement */}
              <CategoryGroupCard
                icon={<Flame className="text-amber-500" />}
                title="Motivation & Engagement"
                subtitle="Streak warnings, micro-celebrations & inactivity reminders"
              >
                <ToggleItem
                  title="Streak Reminders"
                  desc="Duolingo-style warnings to maintain daily math practice streaks."
                  checked={settings.streakReminders}
                  onChange={() => handleCategoryToggle('streakReminders')}
                />
                <ToggleItem
                  title="Praise & Rewards"
                  desc="Micro-celebrations for completing lessons, earning badges, or level Gigs."
                  checked={settings.praiseAndRewards}
                  onChange={() => handleCategoryToggle('praiseAndRewards')}
                />
                <ToggleItem
                  title="Inactivity Nudges"
                  desc="Gentle reminders when you haven't opened the math app for a few days."
                  checked={settings.inactivityNudges}
                  onChange={() => handleCategoryToggle('inactivityNudges')}
                />
              </CategoryGroupCard>

              {/* 2. Learning Management */}
              <CategoryGroupCard
                icon={<Calendar className="text-indigo-600" />}
                title="Learning Management"
                subtitle="Assignments, class updates & scheduled study blocks"
              >
                <ToggleItem
                  title="Deadlines & Quizzes"
                  desc="Reminders for upcoming teacher homework, quizzes, or exam dates."
                  checked={settings.deadlines}
                  onChange={() => handleCategoryToggle('deadlines')}
                />
                <ToggleItem
                  title="Class Updates"
                  desc="Alerts about live session changes, new announcements, or syllabus updates."
                  checked={settings.classUpdates}
                  onChange={() => handleCategoryToggle('classUpdates')}
                />
                <ToggleItem
                  title="Schedule Reminders"
                  desc="Automated alerts sent shortly before scheduled study blocks or live classes."
                  checked={settings.scheduleReminders}
                  onChange={() => handleCategoryToggle('scheduleReminders')}
                />
              </CategoryGroupCard>

              {/* 3. Progress & Feedback */}
              <CategoryGroupCard
                icon={<BarChart3 className="text-emerald-600" />}
                title="Progress & Feedback"
                subtitle="Weekly summaries, grading alerts & leaderboard shifts"
              >
                <ToggleItem
                  title="Performance Reports"
                  desc="Weekly or monthly summaries of time spent and concepts mastered."
                  checked={settings.performanceReports}
                  onChange={() => handleCategoryToggle('performanceReports')}
                />
                <ToggleItem
                  title="Grading Alerts"
                  desc="Immediate updates when a teacher scores an assignment or provides feedback."
                  checked={settings.gradingAlerts}
                  onChange={() => handleCategoryToggle('gradingAlerts')}
                />
                <ToggleItem
                  title="Peer & Leaderboard Updates"
                  desc="Notifications when classmates pass your score or top the leaderboard."
                  checked={settings.peerUpdates}
                  onChange={() => handleCategoryToggle('peerUpdates')}
                />
              </CategoryGroupCard>

              {/* 4. Content & Discovery */}
              <CategoryGroupCard
                icon={<Lightbulb className="text-amber-600" />}
                title="Content & Discovery"
                subtitle="Daily math puzzles, AI recommendations & new feature unlocks"
              >
                <ToggleItem
                  title="Daily Challenges"
                  desc="Short, bite-sized daily puzzles, flashcards, or formula prompts."
                  checked={settings.dailyChallenges}
                  onChange={() => handleCategoryToggle('dailyChallenges')}
                />
                <ToggleItem
                  title="AI Recommendations"
                  desc="AI-driven suggestions for lessons based on weak areas or past performance."
                  checked={settings.recommendations}
                  onChange={() => handleCategoryToggle('recommendations')}
                />
                <ToggleItem
                  title="New Content Alerts"
                  desc="Announcements when new courses, level Gigs, or features are unlocked."
                  checked={settings.newContentAlerts}
                  onChange={() => handleCategoryToggle('newContentAlerts')}
                />
              </CategoryGroupCard>

              {/* 5. System & Transactional */}
              <CategoryGroupCard
                icon={<ShieldCheck className="text-violet-600" />}
                title="System & Transactional"
                subtitle="Account security, PIN updates & technical support"
              >
                <ToggleItem
                  title="Account Security"
                  desc="Immediate alerts for PIN/password updates, login card generation, or profile changes."
                  checked={settings.accountSecurity}
                  onChange={() => handleCategoryToggle('accountSecurity')}
                />
                <ToggleItem
                  title="Technical Support & Maintenance"
                  desc="Direct updates regarding app features, customer service, or scheduled maintenance."
                  checked={settings.technicalSupport}
                  onChange={() => handleCategoryToggle('technicalSupport')}
                />
              </CategoryGroupCard>

            </div>
          )}

          {/* TAB 2: RECENT NOTIFICATION FEED */}
          {activeTab === 'feed' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                  Notification History &amp; Alerts ({logs.length})
                </h4>
                <button
                  onClick={markNotificationsAsRead}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  Mark all as read
                </button>
              </div>

              {logs.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 space-y-2">
                  <BellOff className="w-8 h-8 mx-auto text-slate-400" />
                  <p className="text-xs font-bold">No notifications recorded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {logs.map((item) => (
                    <div 
                      key={item.id} 
                      className={`p-4 rounded-2xl border transition-all ${
                        item.read 
                          ? 'bg-slate-50 border-slate-200' 
                          : 'bg-indigo-50/70 border-indigo-200 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">{item.title}</span>
                            {!item.read && (
                              <span className="px-2 py-0.5 bg-indigo-600 text-white font-bold text-[9px] rounded-full uppercase">New</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 font-medium leading-relaxed">{item.body}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium shrink-0">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LIVE NOTIFICATION TESTER */}
          {activeTab === 'testing' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-medium space-y-1">
                <h4 className="font-bold text-sm flex items-center gap-1.5 text-indigo-950">
                  <Send size={16} /> Test Live Web Push Alerts
                </h4>
                <p>
                  Click any button below to trigger an immediate browser notification or in-app preview for that specific category.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <TestButton
                  title="Streak Reminder"
                  category="streakReminders"
                  onClick={() => triggerTestAlert(
                    'motivation',
                    'streakReminders',
                    '🔥 Streak Warning!',
                    `Maintain your ${stats.streak || 3}-day streak! Solve 1 question today.`
                  )}
                />
                <TestButton
                  title="Praise & Reward"
                  category="praiseAndRewards"
                  onClick={() => triggerTestAlert(
                    'motivation',
                    'praiseAndRewards',
                    '🏆 Milestone Achieved!',
                    'You earned 150 Rock Coins for completing the Level 5 Gig!'
                  )}
                />
                <TestButton
                  title="Assignment Deadline"
                  category="deadlines"
                  onClick={() => triggerTestAlert(
                    'learning',
                    'deadlines',
                    '⏰ Homework Due Tomorrow',
                    'Year 6 Paper 1 Arithmetic assignment is due at 5:00 PM.'
                  )}
                />
                <TestButton
                  title="Class Announcement"
                  category="classUpdates"
                  onClick={() => triggerTestAlert(
                    'learning',
                    'classUpdates',
                    '📢 Live Class Arena Scheduled',
                    'Your teacher scheduled a live math arena duel for tomorrow!'
                  )}
                />
                <TestButton
                  title="Teacher Grading Alert"
                  category="gradingAlerts"
                  onClick={() => triggerTestAlert(
                    'progress',
                    'gradingAlerts',
                    '📝 Homework Scored: 100%',
                    'Your teacher reviewed your fractions exit ticket with full marks!'
                  )}
                />
                <TestButton
                  title="Daily Math Challenge"
                  category="dailyChallenges"
                  onClick={() => triggerTestAlert(
                    'discovery',
                    'dailyChallenges',
                    '💡 Daily Challenge Ready',
                    'What is 25% of 160? Solve today\'s puzzle for double XP!'
                  )}
                />
                <TestButton
                  title="Account Security Alert"
                  category="accountSecurity"
                  onClick={() => triggerTestAlert(
                    'system',
                    'accountSecurity',
                    '🔒 Security Alert: Class Login',
                    'Your classroom login card was safely synchronized.'
                  )}
                />
                <TestButton
                  title="Support & Maintenance"
                  category="technicalSupport"
                  onClick={() => triggerTestAlert(
                    'system',
                    'technicalSupport',
                    '⚙️ App Update Applied',
                    'Jesse Math Rockstar v3.2 updated with fresh SATs drills.'
                  )}
                />
              </div>
            </div>
          )}

          {/* TAB 4: MOBILE LOCK SCREEN PREVIEW */}
          {activeTab === 'mobile' && (
            <div className="p-6 space-y-4 overflow-y-auto">
              <MobileLockScreenPreview />
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium shrink-0">
          <span className="flex items-center gap-1">
            <ShieldCheck size={15} className="text-emerald-500" /> Safe, COPPA-compliant educational alerts
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}

function CategoryGroupCard({
  icon,
  title,
  subtitle,
  children
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-5 rounded-2xl bg-white border-2 border-slate-200 space-y-4 shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div>
          <h4 className="text-sm font-black text-slate-900">{title}</h4>
          <p className="text-[11px] text-slate-500 font-medium">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}

function ToggleItem({
  title,
  desc,
  checked,
  onChange
}: {
  title: string;
  desc: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 p-2 rounded-xl hover:bg-slate-50 transition-colors">
      <div className="space-y-0.5">
        <h5 className="text-xs font-bold text-slate-900">{title}</h5>
        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{desc}</p>
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`w-10 h-6 rounded-full transition-all relative p-0.5 shrink-0 mt-0.5 cursor-pointer ${
          checked ? 'bg-indigo-600' : 'bg-slate-300'
        }`}
      >
        <div className={`w-5 h-5 bg-white rounded-full transition-all shadow ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`} />
      </button>
    </div>
  );
}

function TestButton({
  title,
  category,
  onClick
}: {
  title: string;
  category: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-left transition-all group flex items-center justify-between cursor-pointer shadow-sm"
    >
      <div className="space-y-0.5">
        <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-900">{title}</span>
        <span className="text-[10px] text-slate-400 block font-mono">{category}</span>
      </div>
      <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center text-slate-500 transition-colors">
        <Send size={14} />
      </div>
    </button>
  );
}

// Utility module for handling browser Notification permissions, granular preferences, and dispatching multi-category web push & in-app alerts.

export interface NotificationCategorySettings {
  // Motivation & Engagement
  streakReminders: boolean;
  praiseAndRewards: boolean;
  inactivityNudges: boolean;

  // Learning Management
  deadlines: boolean;
  classUpdates: boolean;
  scheduleReminders: boolean;

  // Progress & Feedback
  performanceReports: boolean;
  gradingAlerts: boolean;
  peerUpdates: boolean;

  // Content & Discovery
  dailyChallenges: boolean;
  recommendations: boolean;
  newContentAlerts: boolean;

  // System & Transactional
  accountSecurity: boolean;
  technicalSupport: boolean;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationCategorySettings = {
  streakReminders: true,
  praiseAndRewards: true,
  inactivityNudges: true,

  deadlines: true,
  classUpdates: true,
  scheduleReminders: true,

  performanceReports: true,
  gradingAlerts: true,
  peerUpdates: true,

  dailyChallenges: true,
  recommendations: true,
  newContentAlerts: true,

  accountSecurity: true,
  technicalSupport: true,
};

const STORAGE_KEY_SETTINGS = 'jesse_math_notification_settings_v1';
const STORAGE_KEY_LOGS = 'jesse_math_notification_logs_v1';

export interface NotificationLogItem {
  id: string;
  category: string;
  categoryGroup: 'motivation' | 'learning' | 'progress' | 'discovery' | 'system';
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
  icon?: string;
}

// Load notification category preferences
export function getNotificationPreferences(): NotificationCategorySettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (saved) {
      return { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (err) {
    console.error('Error reading notification preferences:', err);
  }
  return DEFAULT_NOTIFICATION_SETTINGS;
}

// Save notification category preferences
export function saveNotificationPreferences(settings: Partial<NotificationCategorySettings>): NotificationCategorySettings {
  const current = getNotificationPreferences();
  const updated = { ...current, ...settings };
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));
  } catch (err) {
    console.error('Error saving notification preferences:', err);
  }
  return updated;
}

// Check current browser notification permission
export function getBrowserNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

// Request permission from the user
export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    const result = await Notification.requestPermission();
    return result;
  } catch (err) {
    console.error('Failed to request notification permission:', err);
    return Notification.permission;
  }
}

// Dispatch a notification (Browser Native Notification + In-App Log)
export function dispatchNotification(
  group: 'motivation' | 'learning' | 'progress' | 'discovery' | 'system',
  settingKey: keyof NotificationCategorySettings,
  title: string,
  body: string,
  icon: string = 'https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Farticles%2Fvk11iy6n5ppdp0j4nm46.png'
): boolean {
  const prefs = getNotificationPreferences();

  // Check if user disabled this category
  if (prefs[settingKey] === false) {
    console.log(`Notification skipped: Category '${settingKey}' is disabled in settings.`);
    return false;
  }

  // Create log entry for in-app feed
  const newLog: NotificationLogItem = {
    id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    category: String(settingKey),
    categoryGroup: group,
    title,
    body,
    timestamp: Date.now(),
    read: false,
    icon
  };

  saveNotificationLog(newLog);

  // Dispatch real-time window event for floating toast banner and play audio chime
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('jesse-math-notification', { detail: newLog }));

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const audioCtx = new AudioContextClass();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      }
    } catch (e) {
      console.warn('Audio/event dispatch warning:', e);
    }
  }

  // Send Browser Web Push Notification or Service Worker Notification if permission granted
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_NOTIFICATION',
          title,
          options: {
            body,
            icon,
            tag: settingKey,
            data: { url: '/' }
          }
        });
      } else {
        new Notification(title, {
          body,
          icon,
          badge: 'https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Farticles%2Fvk11iy6n5ppdp0j4nm46.png',
          tag: settingKey,
          requireInteraction: true,
          renotify: true
        } as any);
      }
    } catch (e) {
      console.warn('Native/SW notification trigger warning:', e);
    }
  }

  return true;
}

// Store in-app notification history
export function getNotificationLogs(): NotificationLogItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOGS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse notification logs:', e);
  }
  return getSampleSeedNotifications();
}

export function saveNotificationLog(item: NotificationLogItem) {
  const logs = getNotificationLogs();
  const updated = [item, ...logs].slice(0, 50); // Keep last 50
  try {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save notification log:', e);
  }
}

export function markNotificationsAsRead() {
  const logs = getNotificationLogs();
  const updated = logs.map(l => ({ ...l, read: true }));
  try {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to mark notifications as read:', e);
  }
}

// Pre-populated realistic sample notifications covering all requested user categories
export function getSampleSeedNotifications(): NotificationLogItem[] {
  const now = Date.now();
  return [
    {
      id: 'sample_1',
      categoryGroup: 'motivation',
      category: 'streakReminders',
      title: '🔥 Streak Warning: Don\'t Lose Your Progress!',
      body: 'Your 5-day math practice streak is expiring soon. Solve 1 quick question to keep it alive!',
      timestamp: now - 1000 * 60 * 15,
      read: false
    },
    {
      id: 'sample_2',
      categoryGroup: 'motivation',
      category: 'praiseAndRewards',
      title: '🏆 Micro-Celebration: Badge Unlocked!',
      body: 'Congratulations! You completed the "Fractions Master" level and earned 250 match coins!',
      timestamp: now - 1000 * 60 * 60 * 2,
      read: false
    },
    {
      id: 'sample_3',
      categoryGroup: 'learning',
      category: 'deadlines',
      title: '⏰ Assignment Deadline: Paper 1 Arithmetic',
      body: 'Your teacher assigned Year 6 Paper 1 Arithmetic Practice due tomorrow at 5:00 PM.',
      timestamp: now - 1000 * 60 * 60 * 5,
      read: true
    },
    {
      id: 'sample_4',
      categoryGroup: 'learning',
      category: 'classUpdates',
      title: '📢 Class Announcement: Live Math Arena',
      body: 'Mr. Jenkins scheduled a Class Arena speed duel battle for Friday at 10:00 AM.',
      timestamp: now - 1000 * 60 * 60 * 24,
      read: true
    },
    {
      id: 'sample_5',
      categoryGroup: 'progress',
      category: 'gradingAlerts',
      title: '📝 Homework Scored: 100% Accuracy!',
      body: 'Your teacher reviewed your "Decimals & Percentages" assignment and gave feedback.',
      timestamp: now - 1000 * 60 * 60 * 30,
      read: true
    },
    {
      id: 'sample_6',
      categoryGroup: 'progress',
      category: 'peerUpdates',
      title: '⚡ Leaderboard Alert: High Score Surpassed!',
      body: 'Alex M. reached Level 8 Gig on the Class Leaderboard! Reclaim your spot in the Arena.',
      timestamp: now - 1000 * 60 * 60 * 48,
      read: true
    },
    {
      id: 'sample_7',
      categoryGroup: 'discovery',
      category: 'dailyChallenges',
      title: '💡 Daily Math Challenge Ready!',
      body: 'Solve today\'s speed puzzle: "What is 15% of 240?" to earn bonus double XP.',
      timestamp: now - 1000 * 60 * 60 * 52,
      read: true
    },
    {
      id: 'sample_8',
      categoryGroup: 'discovery',
      category: 'recommendations',
      title: '🎯 Target Review Suggested',
      body: 'AI practice engine detected friction in "Long Division". 5-minute review available.',
      timestamp: now - 1000 * 60 * 60 * 72,
      read: true
    },
    {
      id: 'sample_9',
      categoryGroup: 'system',
      category: 'accountSecurity',
      title: '🔒 Security Alert: Class Login Card Updated',
      body: 'Your student account access PIN was updated safely by your class administrator.',
      timestamp: now - 1000 * 60 * 60 * 96,
      read: true
    }
  ];
}

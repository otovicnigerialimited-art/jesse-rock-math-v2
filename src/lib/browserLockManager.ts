import { db } from './firebase';
import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { safeStorage } from './storage';

export interface ActiveSessionInfo {
  sessionId: string;
  browser: string;
  lastHeartbeat: number;
  trackedKey: string;
}

export type SessionLockCallback = (isBlocked: boolean, otherSession?: ActiveSessionInfo) => void;

/**
 * Parses user-agent to provide human-readable browser & OS identification.
 */
export function getBrowserDisplayName(): string {
  if (typeof window === 'undefined') return 'Web Browser';
  const ua = navigator.userAgent;
  let browser = 'Browser';
  let os = 'Device';

  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('SamsungBrowser')) browser = 'Samsung Internet';
  else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
  else if (ua.includes('Edge') || ua.includes('Edg')) browser = 'Microsoft Edge';
  else if (ua.includes('Chrome')) browser = 'Google Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';

  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Macintosh') || ua.includes('Mac OS')) os = 'macOS';
  else if (ua.includes('iPhone')) os = 'iPhone';
  else if (ua.includes('iPad')) os = 'iPad';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('Linux')) os = 'Linux';

  return `${browser} on ${os}`;
}

/**
 * Returns or creates a distinct session ID for this specific browser tab/window.
 */
export function getTabSessionId(): string {
  if (typeof window === 'undefined') return 'ssr_session';
  try {
    let sId = sessionStorage.getItem('jesse_tab_session_id');
    if (!sId) {
      sId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem('jesse_tab_session_id', sId);
    }
    return sId;
  } catch {
    return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

class BrowserSessionGuard {
  private currentSessionId: string;
  private currentBrowser: string;
  private trackedKey: string | null = null;
  private isBlocked: boolean = false;
  private otherSessionInfo: ActiveSessionInfo | null = null;
  private listeners: Set<SessionLockCallback> = new Set();
  private broadcastChannel: BroadcastChannel | null = null;
  private firestoreUnsub: (() => void) | null = null;
  private heartbeatInterval: any = null;

  constructor() {
    this.currentSessionId = getTabSessionId();
    this.currentBrowser = getBrowserDisplayName();
    this.initBroadcastChannel();
    this.initLocalStorageListener();
  }

  private initBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('jesse_browser_session_channel');
        this.broadcastChannel.onmessage = (event) => {
          const { type, sessionId, browser, trackedKey } = event.data || {};
          
          // Only respond to events matching the tracked user/device
          if (this.trackedKey && trackedKey && this.trackedKey !== trackedKey) return;

          if (type === 'CLAIM_SESSION' || type === 'HEARTBEAT') {
            if (sessionId && sessionId !== this.currentSessionId) {
              // Another browser tab or window has claimed the session
              this.setBlockedState(true, {
                sessionId,
                browser: browser || 'Another Browser/Tab',
                lastHeartbeat: Date.now(),
                trackedKey: trackedKey || this.trackedKey || ''
              });
            }
          } else if (type === 'FORCE_TAKEOVER') {
            if (sessionId && sessionId !== this.currentSessionId) {
              this.setBlockedState(true, {
                sessionId,
                browser: browser || 'Another Browser/Tab',
                lastHeartbeat: Date.now(),
                trackedKey: trackedKey || this.trackedKey || ''
              });
            }
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel not available:', err);
      }
    }
  }

  private initLocalStorageListener() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'jesse_active_session_claim' && e.newValue) {
          try {
            const data = JSON.parse(e.newValue);
            if (data.trackedKey === this.trackedKey && data.sessionId !== this.currentSessionId) {
              this.setBlockedState(true, {
                sessionId: data.sessionId,
                browser: data.browser || 'Another Browser Window',
                lastHeartbeat: data.timestamp || Date.now(),
                trackedKey: data.trackedKey
              });
            }
          } catch (err) {}
        }
      });
    }
  }

  /**
   * Starts monitoring active sessions for a specific user ID or guest device ID.
   */
  public startGuarding(trackedKey: string) {
    if (!trackedKey) return;
    
    // If the tracked key changed, reset Firestore listener
    if (this.trackedKey !== trackedKey) {
      this.stopGuarding();
      this.trackedKey = trackedKey;
    }

    // 1. Claim session locally
    this.broadcastClaim();

    // 2. Initialize Firestore real-time listener for cross-browser synchronization
    try {
      const sessionDocRef = doc(db, 'active_browser_sessions', trackedKey);
      
      this.firestoreUnsub = onSnapshot(sessionDocRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const remoteSessionId = data.activeSessionId;
          const remoteHeartbeat = data.lastHeartbeat || 0;
          const remoteBrowser = data.browser || 'Another Browser';
          
          const now = Date.now();
          // If heartbeat is fresh (within 35 seconds) and from a different browser session
          if (remoteSessionId && remoteSessionId !== this.currentSessionId && (now - remoteHeartbeat < 35000)) {
            this.setBlockedState(true, {
              sessionId: remoteSessionId,
              browser: remoteBrowser,
              lastHeartbeat: remoteHeartbeat,
              trackedKey
            });
          }
        }
      }, (err) => {
        console.warn('Firestore session guard subscription note:', err.message);
      });

      // 3. Register initial claim in Firestore if not already blocked
      this.claimInFirestore();

      // 4. Start heartbeat loop (every 10 seconds)
      if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = setInterval(() => {
        if (!this.isBlocked && this.trackedKey) {
          this.claimInFirestore();
          this.broadcastHeartbeat();
        }
      }, 10000);

    } catch (err) {
      console.warn('Session guard initialization warning:', err);
    }
  }

  private broadcastClaim() {
    if (!this.trackedKey) return;
    const payload = {
      type: 'CLAIM_SESSION',
      sessionId: this.currentSessionId,
      browser: this.currentBrowser,
      trackedKey: this.trackedKey,
      timestamp: Date.now()
    };

    if (this.broadcastChannel) {
      try { this.broadcastChannel.postMessage(payload); } catch (e) {}
    }

    try {
      localStorage.setItem('jesse_active_session_claim', JSON.stringify(payload));
    } catch (e) {}
  }

  private broadcastHeartbeat() {
    if (!this.trackedKey) return;
    const payload = {
      type: 'HEARTBEAT',
      sessionId: this.currentSessionId,
      browser: this.currentBrowser,
      trackedKey: this.trackedKey,
      timestamp: Date.now()
    };

    if (this.broadcastChannel) {
      try { this.broadcastChannel.postMessage(payload); } catch (e) {}
    }
  }

  private async claimInFirestore() {
    if (!this.trackedKey) return;
    try {
      const sessionDocRef = doc(db, 'active_browser_sessions', this.trackedKey);
      await setDoc(sessionDocRef, {
        activeSessionId: this.currentSessionId,
        browser: this.currentBrowser,
        lastHeartbeat: Date.now(),
        updatedAt: Date.now(),
        trackedKey: this.trackedKey
      }, { merge: true });
    } catch (err) {
      // Non-blocking in offline scenarios
    }
  }

  /**
   * Forces a session takeover, declaring THIS browser as the single authoritative active session.
   */
  public async takeOverSession(): Promise<void> {
    if (!this.trackedKey) return;
    
    this.isBlocked = false;
    this.otherSessionInfo = null;

    // 1. Update Firestore
    await this.claimInFirestore();

    // 2. Broadcast force takeover to disconnect all other tabs/browsers
    const payload = {
      type: 'FORCE_TAKEOVER',
      sessionId: this.currentSessionId,
      browser: this.currentBrowser,
      trackedKey: this.trackedKey,
      timestamp: Date.now()
    };

    if (this.broadcastChannel) {
      try { this.broadcastChannel.postMessage(payload); } catch (e) {}
    }

    try {
      localStorage.setItem('jesse_active_session_claim', JSON.stringify(payload));
    } catch (e) {}

    this.notifyListeners();
  }

  private setBlockedState(blocked: boolean, otherSession?: ActiveSessionInfo) {
    if (this.isBlocked !== blocked || (blocked && this.otherSessionInfo?.sessionId !== otherSession?.sessionId)) {
      this.isBlocked = blocked;
      this.otherSessionInfo = otherSession || null;
      this.notifyListeners();
    }
  }

  private notifyListeners() {
    this.listeners.forEach((cb) => {
      try {
        cb(this.isBlocked, this.otherSessionInfo || undefined);
      } catch (err) {
        console.error('Session listener error:', err);
      }
    });
  }

  public subscribe(cb: SessionLockCallback): () => void {
    this.listeners.add(cb);
    // Emit initial status immediately
    cb(this.isBlocked, this.otherSessionInfo || undefined);
    return () => {
      this.listeners.delete(cb);
    };
  }

  public stopGuarding() {
    if (this.firestoreUnsub) {
      this.firestoreUnsub();
      this.firestoreUnsub = null;
    }
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    this.trackedKey = null;
    this.isBlocked = false;
    this.otherSessionInfo = null;
    this.notifyListeners();
  }

  public getStatus() {
    return {
      isBlocked: this.isBlocked,
      currentSessionId: this.currentSessionId,
      currentBrowser: this.currentBrowser,
      otherSession: this.otherSessionInfo
    };
  }
}

export const sessionGuard = new BrowserSessionGuard();

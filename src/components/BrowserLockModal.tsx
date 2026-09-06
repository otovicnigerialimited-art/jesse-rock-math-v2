import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Globe, ArrowRight, Laptop, AlertTriangle, RefreshCw, Lock } from 'lucide-react';
import { sessionGuard, ActiveSessionInfo, getBrowserDisplayName } from '../lib/browserLockManager';

interface BrowserLockModalProps {
  isBlocked: boolean;
  otherSession?: ActiveSessionInfo;
}

export const BrowserLockModal: React.FC<BrowserLockModalProps> = ({ isBlocked, otherSession }) => {
  const [isClaiming, setIsClaiming] = useState(false);
  const currentBrowser = getBrowserDisplayName();

  if (!isBlocked) return null;

  const handleTakeOver = async () => {
    setIsClaiming(true);
    try {
      await sessionGuard.takeOverSession();
    } catch (e) {
      console.error('Failed to claim browser session:', e);
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <AnimatePresence>
      <div 
        id="browser-session-lock-overlay"
        className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-xl bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-white relative overflow-hidden"
        >
          {/* Background Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6 text-center">
            {/* Security Icon Badge */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 text-amber-400 shadow-inner">
              <ShieldAlert className="w-10 h-10 animate-pulse" />
            </div>

            {/* Primary Core Directive */}
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <Lock className="w-3.5 h-3.5" /> Concurrent Session Detected
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                You can only pick one browser
              </h2>
              <p className="text-sm sm:text-base text-amber-200/90 font-medium">
                This is to protect API usage and secure your active gameplay data.
              </p>
            </div>

            {/* Information Comparison Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <Laptop className="w-4 h-4 text-emerald-400" />
                  This Browser
                </div>
                <div className="font-bold text-slate-100 text-sm truncate">
                  {currentBrowser}
                </div>
                <div className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Ready to switch
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/80 border border-amber-500/30 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  <Globe className="w-4 h-4 text-amber-400" />
                  Active In Another Browser
                </div>
                <div className="font-bold text-slate-100 text-sm truncate">
                  {otherSession?.browser || 'Other Browser Instance'}
                </div>
                <div className="text-xs text-amber-400/80 font-medium">
                  Currently running calculations
                </div>
              </div>
            </div>

            {/* Explanatory Safe Usage Alert */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/80 flex items-start gap-2.5 text-left leading-relaxed">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Simultaneous sessions consume double API capacity and may corrupt live leaderboard streaks. To continue in this browser, claim your session below.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                id="btn-takeover-browser-session"
                onClick={handleTakeOver}
                disabled={isClaiming}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-base shadow-lg shadow-amber-500/25 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isClaiming ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Claiming Single Session...</span>
                  </>
                ) : (
                  <>
                    <span>Switch & Use This Browser Only</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="text-xs text-slate-400">
                Or simply close this tab/window to keep playing on your other browser.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

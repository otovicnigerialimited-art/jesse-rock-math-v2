import React, { useState } from 'react';
import { generateSafeStrikerUsername, SAFE_QUICK_CHATS } from '../lib/safetyUtils';
import { 
  ShieldCheck, 
  Lock, 
  UserCheck, 
  MessageSquare, 
  X, 
  Sparkles,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface ChildSafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUsername: string;
  onUpdateUsername: (newName: string) => void;
}

export default function ChildSafetyModal({
  isOpen,
  onClose,
  currentUsername,
  onUpdateUsername
}: ChildSafetyModalProps) {
  const [safeName, setSafeName] = useState(currentUsername);

  if (!isOpen) return null;

  const handleGenerate = () => {
    const fresh = generateSafeStrikerUsername();
    setSafeName(fresh);
  };

  const handleApplyName = () => {
    onUpdateUsername(safeName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative max-w-lg w-full bg-white rounded-3xl border-4 border-indigo-900 shadow-2xl overflow-hidden p-6 md:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="font-display font-black text-slate-900 text-lg">
                Child Safety & Privacy Center
              </h3>
              <p className="text-xs text-slate-500 font-medium">Zero-PII protection framework following COPPA rules</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        {/* 1. Safe Username Generator */}
        <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-200 space-y-3">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
            Safe Striker Handle Generator
          </span>
          <p className="text-xs text-slate-600 font-medium">
            Keep your real identity completely private. Generate a fun, safe striker username!
          </p>

          <div className="flex items-center gap-2">
            <input 
              type="text"
              readOnly
              value={safeName}
              className="flex-1 py-2.5 px-4 bg-white border border-slate-300 rounded-xl font-bold text-sm text-slate-900 shadow-sm"
            />
            <button
              onClick={handleGenerate}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-bold shrink-0"
              title="Generate new safe handle"
            >
              <RefreshCw size={16} /> New Name
            </button>
          </div>

          <button
            onClick={handleApplyName}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
          >
            Use Safe Handle →
          </button>
        </div>

        {/* 2. Multiplayer Quick Chat Policy */}
        <div className="space-y-2">
          <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
            <MessageSquare size={14} className="text-indigo-600" /> Presets-Only Multiplayer Chat
          </h4>
          <p className="text-xs text-slate-500 font-medium">
            To prevent inappropriate text or sharing of personal data, public Match Arenaes strictly allow pre-approved safe quick chat messages:
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {SAFE_QUICK_CHATS.map((msg, idx) => (
              <span key={idx} className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700">
                {msg}
              </span>
            ))}
          </div>
        </div>

        {/* 3. Privacy Guarantees */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs text-slate-600 font-medium">
          <p className="font-bold text-slate-900">🛡️ Our Safety Commitments:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>No personal location, real names, or contact info requested.</li>
            <li>No ads, tracking cookies, or third-party data selling.</li>
            <li>Educational workspace designed to follow COPPA and GDPR-K privacy rules.</li>
          </ul>
        </div>

      </div>
    </div>
  );
}

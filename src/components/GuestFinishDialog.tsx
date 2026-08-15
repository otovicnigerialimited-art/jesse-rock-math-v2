import React from 'react';
import { Trophy } from 'lucide-react';

export default function GuestFinishDialog({ isOpen, onClose, stats, onConvert }: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm " onClick={onClose} />
      <div className="relative bg-white border border-deep-navy border-4 p-6 rounded-2xl w-full max-w-sm text-center shadow-xl">
        <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-deep-navy mb-2">Great Session!</h2>
        <p className="text-deep-navy mb-6">You've earned {stats.xp} XP as a guest. Want to save your progress permanently?</p>
        <button 
          onClick={onConvert}
          className="w-full bg-brand-primary text-deep-navy py-3 rounded-xl font-bold hover:bg-opacity-90"
        >
          Claim Account & Save
        </button>
      </div>
    </div>
  );
}

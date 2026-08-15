import React from 'react';
import { Gift } from 'lucide-react';

export default function GiftDialog({ isOpen, onClose, amount }: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm " onClick={onClose} />
      <div className="relative bg-white border border-emerald-500/30 p-6 rounded-2xl w-full max-w-sm text-center shadow-xl">
        <Gift className="w-16 h-16 text-emerald-400 mx-auto mb-4 animate-bounce" />
        <h2 className="text-2xl font-black text-deep-navy mb-2">You Got a Gift!</h2>
        <p className="text-deep-navy mb-6">You've received {amount} bonus coins!</p>
        <button 
          onClick={onClose}
          className="w-full bg-emerald-600 text-deep-navy py-3 rounded-xl font-bold hover:bg-emerald-700"
        >
          Collect
        </button>
      </div>
    </div>
  );
}

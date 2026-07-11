import React from 'react';
import { Sparkles } from 'lucide-react';

export default function AnniversaryDialog({ isOpen, onClose }: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-white backdrop-blur-md/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white border border-pink-500/30 p-6 rounded-2xl w-full max-w-sm text-center shadow-xl">
        <Sparkles className="w-16 h-16 text-pink-400 mx-auto mb-4 animate-pulse" />
        <h2 className="text-2xl font-black text-deep-navy mb-2">Happy Anniversary!</h2>
        <p className="text-deep-navy mb-6">Thanks for playing with us for another year. Enjoy a special anniversary gift!</p>
        <button 
          onClick={onClose}
          className="w-full bg-pink-600 text-deep-navy py-3 rounded-xl font-bold hover:bg-pink-700"
        >
          Claim Gift
        </button>
      </div>
    </div>
  );
}

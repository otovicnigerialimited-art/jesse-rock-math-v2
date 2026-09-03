import React, { useState } from 'react';
import { MisconceptionRecord } from '../types/extendedTypes';
import { 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle, 
  X, 
  ArrowRight, 
  Sparkles,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MistakeIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  misconceptions: Record<string, MisconceptionRecord>;
  onClearMistake: (tag: string) => void;
}

export default function MistakeIntelligenceModal({
  isOpen,
  onClose,
  misconceptions,
  onClearMistake
}: MistakeIntelligenceModalProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [drillCompleted, setDrillCompleted] = useState(false);

  if (!isOpen) return null;

  const records = Object.values(misconceptions).filter(r => r.failCount > 0);

  const handleResolveDrill = (tag: string) => {
    onClearMistake(tag);
    setDrillCompleted(true);
    confetti({ particleCount: 50, spread: 50 });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative max-w-xl w-full bg-white rounded-3xl border-4 border-amber-500 shadow-2xl overflow-hidden p-6 md:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <AlertCircle size={22} />
            </div>
            <div>
              <h3 className="font-display font-black text-slate-900 text-lg">
                Mistake Intelligence Engine
              </h3>
              <p className="text-xs text-slate-500 font-medium">Automatic detection of misconception patterns</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        {records.length > 0 ? (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 font-medium">
              We detected repeated calculation friction points. Select a topic to review the underlying concept and resolve the error pattern.
            </p>

            <div className="space-y-3">
              {records.map(rec => (
                <div key={rec.tag} className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{rec.skillName}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-black uppercase">
                      Flagged {rec.failCount}x
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    💡 <span className="font-bold">Misconception:</span> {rec.misconceptionDescription}
                  </p>
                  <p className="text-xs text-indigo-900 font-bold">
                    ✨ <span className="font-black">How to fix:</span> {rec.explanationTip}
                  </p>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => handleResolveDrill(rec.tag)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                    >
                      Resolve Misconception →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-2xl font-bold">
              ✓
            </div>
            <h4 className="text-xl font-display font-black text-slate-900">No Repeat Mistakes Detected!</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your calculation accuracy is clean. Keep practicing in the pitch or SATs Mode!
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

import React from 'react';
import { X, Volume2, Music, EyeOff } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: any;
  setConfig: (config: any) => void;
}

export default function SettingsModal({ isOpen, onClose, config, setConfig }: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-white backdrop-blur-md/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white border border-deep-navy border-4 p-6 rounded-2xl w-full max-w-sm shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-black text-deep-navy">Settings</h2>
          <button onClick={onClose} className="text-deep-navy hover:text-deep-navy"><X size={20}/></button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-deep-navy">
                <Volume2 size={18}/>
                <span>Sound Effects</span>
            </div>
            <button 
                onClick={() => setConfig({...config, soundEffects: !config.soundEffects})}
                className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${config.soundEffects ? 'bg-brand-primary' : 'bg-slate-300'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${config.soundEffects ? 'translate-x-6' : ''}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-deep-navy">
                <Music size={18}/>
                <span>Rock Music</span>
            </div>
            <button 
                onClick={() => setConfig({...config, rockMusic: !config.rockMusic})}
                className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${config.rockMusic ? 'bg-brand-primary' : 'bg-slate-300'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${config.rockMusic ? 'translate-x-6' : ''}`} />
            </button>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 text-deep-navy">
                <EyeOff size={18}/>
                <span className="text-sm font-semibold">Quiet Mode (Low Stimulation)</span>
            </div>
            <button 
                onClick={() => setConfig({...config, quietMode: !config.quietMode})}
                className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${config.quietMode ? 'bg-amber-500' : 'bg-slate-300'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${config.quietMode ? 'translate-x-6' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

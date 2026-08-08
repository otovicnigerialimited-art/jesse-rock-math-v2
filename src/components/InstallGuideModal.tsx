import React, { useState } from 'react';
import { X, Smartphone, Monitor, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface InstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InstallGuideModal({ isOpen, onClose }: InstallGuideModalProps) {
  const [activeTab, setActiveTab] = useState<'ios' | 'android' | 'desktop'>('desktop');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative bg-white border border-deep-navy border-4 p-6 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="flex justify-between items-center mb-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-deep-navy">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-xl font-black text-deep-navy leading-none">Install App</h2>
              <p className="text-xs text-slate-500 font-bold mt-1">Play fullscreen, anywhere.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-600 hover:text-deep-navy hover:bg-slate-200 transition-colors">
            <X size={20}/>
          </button>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl mb-6 shrink-0 gap-1">
          <button 
            onClick={() => setActiveTab('desktop')}
            className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${activeTab === 'desktop' ? 'bg-white shadow-sm text-brand-primary' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Monitor size={14} /> PC/Mac
          </button>
          <button 
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${activeTab === 'ios' ? 'bg-white shadow-sm text-brand-primary' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Smartphone size={14} /> iPhone
          </button>
          <button 
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${activeTab === 'android' ? 'bg-white shadow-sm text-brand-primary' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Smartphone size={14} /> Android
          </button>
        </div>
        
        <div className="overflow-y-auto pr-2 scrollbar-thin-custom space-y-4">
          <AnimatePresence mode="wait">
            {activeTab === 'desktop' && (
              <motion.div key="desktop" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                  <h3 className="font-black text-blue-900 mb-3 flex items-center gap-2">
                    <img src="https://www.google.com/chrome/static/images/chrome-logo.svg" alt="Chrome" className="w-5 h-5" /> Google Chrome
                  </h3>
                  <ol className="space-y-3">
                    <li className="flex items-start gap-3 text-sm text-blue-800 font-medium">
                      <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">1</span>
                      Look at the right side of the address bar at the top of your screen.
                    </li>
                    <li className="flex items-start gap-3 text-sm text-blue-800 font-medium">
                      <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">2</span>
                      Click the "Install" icon (it looks like a screen with a down arrow).
                    </li>
                    <li className="flex items-start gap-3 text-sm text-blue-800 font-medium">
                      <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">3</span>
                      Click <strong>Install</strong> to add Jesse Math Rockstar to your PC.
                    </li>
                  </ol>
                </div>
                
                <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4">
                  <h3 className="font-black text-sky-900 mb-3">Microsoft Edge</h3>
                  <ol className="space-y-3">
                    <li className="flex items-start gap-3 text-sm text-sky-800 font-medium">
                      <span className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold shrink-0">1</span>
                      Look at the right side of the address bar.
                    </li>
                    <li className="flex items-start gap-3 text-sm text-sky-800 font-medium">
                      <span className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold shrink-0">2</span>
                      Click the "App available" icon (three squares and a plus sign).
                    </li>
                    <li className="flex items-start gap-3 text-sm text-sky-800 font-medium">
                      <span className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold shrink-0">3</span>
                      Click <strong>Install</strong>.
                    </li>
                  </ol>
                </div>
              </motion.div>
            )}

            {activeTab === 'ios' && (
              <motion.div key="ios" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <h3 className="font-black text-slate-900 mb-3 flex items-center gap-2">
                    Apple Safari
                  </h3>
                  <ol className="space-y-4">
                    <li className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                      <span className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold shrink-0">1</span>
                      Tap the <strong>Share</strong> button at the bottom of the screen (the square with an arrow pointing up).
                    </li>
                    <li className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                      <span className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold shrink-0">2</span>
                      Scroll down and tap <strong>Add to Home Screen</strong>.
                    </li>
                    <li className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                      <span className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold shrink-0">3</span>
                      Tap <strong>Add</strong> in the top right corner. The app will now appear on your home screen!
                    </li>
                  </ol>
                </div>
              </motion.div>
            )}

            {activeTab === 'android' && (
              <motion.div key="android" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                  <h3 className="font-black text-emerald-900 mb-3 flex items-center gap-2">
                    Chrome for Android
                  </h3>
                  <ol className="space-y-4">
                    <li className="flex items-start gap-3 text-sm text-emerald-800 font-medium">
                      <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">1</span>
                      Tap the <strong>Menu</strong> icon (three dots) in the top right corner.
                    </li>
                    <li className="flex items-start gap-3 text-sm text-emerald-800 font-medium">
                      <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">2</span>
                      Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>.
                    </li>
                    <li className="flex items-start gap-3 text-sm text-emerald-800 font-medium">
                      <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">3</span>
                      Follow the on-screen prompts to confirm installation.
                    </li>
                  </ol>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

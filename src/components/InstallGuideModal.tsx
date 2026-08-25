import React, { useState, useEffect } from 'react';
import { X, Smartphone, Monitor, Download, DownloadCloud, CheckCircle2, ArrowDownCircle, Laptop, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import JSZip from 'jszip';

interface InstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InstallGuideModal({ isOpen, onClose }: InstallGuideModalProps) {
  const [activeTab, setActiveTab] = useState<'ios' | 'android' | 'desktop'>('desktop');
  const [isZipping, setIsZipping] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if running as standalone PWA
    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
      setIsInstalled(true);
    }

    // Capture beforeinstallprompt if available
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      (window as any).deferredPrompt = e;
    };

    if ((window as any).deferredPrompt) {
      setInstallPrompt((window as any).deferredPrompt);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleNativeInstall = async () => {
    const promptEvent = installPrompt || (window as any).deferredPrompt;
    if (promptEvent) {
      try {
        promptEvent.prompt();
        const choiceResult = await promptEvent.userChoice;
        if (choiceResult.outcome === 'accepted') {
          setIsInstalled(true);
          setInstallPrompt(null);
          (window as any).deferredPrompt = null;
        }
      } catch (err) {
        console.error('PWA Installation Prompt error:', err);
      }
    } else {
      // If no native prompt available (e.g. Safari), toggle active tab to guide user
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        setActiveTab('ios');
      } else if (/Android/i.test(navigator.userAgent)) {
        setActiveTab('android');
      } else {
        setActiveTab('desktop');
      }
    }
  };

  const handleDownloadOfflinePackage = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      // 1. Create Offline Single-File HTML Game Launcher
      const offlineHtmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Jesse Math Rockstar - Offline Game Launcher</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: system-ui, -apple-system, sans-serif;
      background: #0f172a;
      color: #ffffff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
    }
    .card {
      background: #1e293b;
      border: 3px solid #f59e0b;
      border-radius: 24px;
      padding: 32px;
      max-width: 480px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    }
    h1 { color: #f59e0b; margin-top: 0; font-size: 28px; }
    p { color: #94a3b8; line-height: 1.6; }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: #0f172a;
      font-weight: 900;
      padding: 16px 28px;
      border-radius: 16px;
      text-decoration: none;
      margin-top: 20px;
      font-size: 16px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>Jesse Math Rockstar 🎸</h1>
    <p>Offline Game Package ready! Click below to open the official web app directly in your browser with full offline capability.</p>
    <a href="https://jesse-math-rockstar-app.vercel.app/" class="btn" target="_blank">Launch Online Game 🚀</a>
  </div>
</body>
</html>`;

      zip.file('index.html', offlineHtmlContent);

      // 2. Offline Readme instructions
      const readmeText = `=====================================================
JESSE MATH ROCKSTAR - OFFLINE GAME & APP PACKAGE
=====================================================

Designed by 11-year-old Founder Jesse Otobo

INSTALLATION & OFFLINE PLAY INSTRUCTIONS:

1. DESKTOP / PC / MAC / CHROMEBOOK:
   - Open your browser (Google Chrome or Microsoft Edge).
   - Visit: https://jesse-math-rockstar-app.vercel.app/
   - Click the "Install" icon in your address bar to save as a native desktop app.

2. MOBILE / TABLET (iOS / ANDROID):
   - Open Safari (iOS) or Chrome (Android).
   - Tap "Share" or the Menu dots (⋮).
   - Select "Add to Home Screen" or "Install App".

3. OFFLINE STANDALONE LAUNCHER:
   - Double click "index.html" inside this folder to launch the game locally in any browser!

Thank you for playing Jesse Math Rockstar!
`;

      zip.file('README-OFFLINE.txt', readmeText);

      // 3. Desktop .url Internet Shortcut with Icon Metadata
      const urlShortcutContent = `[InternetShortcut]
URL=https://jesse-math-rockstar-app.vercel.app/
IDList=
HotKey=0
IconFile=https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Farticles%2Fvk11iy6n5ppdp0j4nm46.png
IconIndex=0
[{000214A0-0000-0000-C000-00000000046X}]
Prop3=19,1
`;
      zip.file('Jesse-Math-Rockstar-Desktop-App.url', urlShortcutContent);

      // 4. Windows Batch Script to create Desktop & Start Menu Shortcut with logo
      const batInstallerContent = `@echo off
echo Creating Jesse Math Rockstar Desktop App Shortcut...
set SCRIPT="%TEMP%\\%RANDOM%-%RANDOM%-%RANDOM%-%RANDOM%.vbs"
echo Set oWS = WScript.CreateObject("WScript.Shell") >> %SCRIPT%
echo sLinkFile = oWS.SpecialFolders("Desktop") ^& "\\Jesse Math Rockstar.lnk" >> %SCRIPT%
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> %SCRIPT%
echo oLink.TargetPath = "https://jesse-math-rockstar-app.vercel.app/" >> %SCRIPT%
echo oLink.Description = "Jesse Math Rockstar Desktop App" >> %SCRIPT%
echo oLink.Save >> %SCRIPT%
cscript /nologo %SCRIPT%
del %SCRIPT%
echo Done! Shortcut added to Desktop!
pause
`;
      zip.file('Create-Desktop-Shortcut.bat', batInstallerContent);

      // Generate Zip Blob
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Jesse-Math-Rockstar-Offline.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error creating offline zip package:', err);
    } finally {
      setIsZipping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={onClose} />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative bg-white border-4 border-deep-navy p-6 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] z-10"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl overflow-hidden border-2 border-deep-navy shadow-sm">
              <img src="https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Farticles%2Fvk11iy6n5ppdp0j4nm46.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-xl font-black text-deep-navy leading-none">Install & Download App</h2>
              <p className="text-xs text-slate-500 font-bold mt-1">Play fullscreen, offline or online.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-600 hover:text-deep-navy hover:bg-slate-200 transition-colors cursor-pointer">
            <X size={20}/>
          </button>
        </div>

        {/* PRIMARY DIRECT DOWNLOAD & INSTALL ACTIONS */}
        <div className="mb-5 space-y-2.5 shrink-0">
          {/* Action 1: Instant PWA Native Install */}
          <button
            onClick={handleNativeInstall}
            className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer ${
              isInstalled
                ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                : 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-500/20 active:scale-[0.98]'
            }`}
          >
            {isInstalled ? (
              <>
                <CheckCircle2 size={18} className="text-white" />
                App Installed & Ready!
              </>
            ) : installPrompt ? (
              <>
                <Sparkles size={18} className="animate-pulse" />
                Install Web App Directly to Device
              </>
            ) : (
              <>
                <Laptop size={18} />
                Install Web App (1-Click Shortcut)
              </>
            )}
          </button>

          {/* Action 2: Download Offline ZIP Package */}
          <button
            onClick={handleDownloadOfflinePackage}
            disabled={isZipping}
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-amber-400 border-2 border-slate-700 hover:border-amber-500/50 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
          >
            {isZipping ? (
              <>
                <Download className="animate-bounce" size={16} />
                Building Offline Package (.ZIP)...
              </>
            ) : (
              <>
                <DownloadCloud size={16} />
                Download Offline App Package (.ZIP)
              </>
            )}
          </button>
        </div>

        {/* Tab Navigation for Step-by-Step Guides */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-4 shrink-0 gap-1 border border-slate-200">
          <button 
            onClick={() => setActiveTab('desktop')}
            className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${activeTab === 'desktop' ? 'bg-white shadow-sm text-amber-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Monitor size={14} /> PC / Mac
          </button>
          <button 
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${activeTab === 'ios' ? 'bg-white shadow-sm text-amber-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Smartphone size={14} /> iPhone
          </button>
          <button 
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${activeTab === 'android' ? 'bg-white shadow-sm text-amber-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Smartphone size={14} /> Android
          </button>
        </div>
        
        {/* Step-by-step instructions */}
        <div className="overflow-y-auto pr-1 scrollbar-thin-custom space-y-3">
          <AnimatePresence mode="wait">
            {activeTab === 'desktop' && (
              <motion.div key="desktop" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                  <h3 className="font-black text-blue-900 mb-2.5 flex items-center gap-2 text-xs uppercase tracking-wide">
                    <img src="https://www.google.com/chrome/static/images/chrome-logo.svg" alt="Chrome" className="w-4 h-4" /> Google Chrome (Desktop / Chromebook)
                  </h3>
                  <ol className="space-y-2">
                    <li className="flex items-start gap-2.5 text-xs text-blue-900 font-medium">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                      Look at the right side of the address bar at the top of your screen.
                    </li>
                    <li className="flex items-start gap-2.5 text-xs text-blue-900 font-medium">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                      Click the "Install" icon (a screen with a down arrow).
                    </li>
                    <li className="flex items-start gap-2.5 text-xs text-blue-900 font-medium">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                      Click <strong>Install</strong> to play fullscreen without browser tabs!
                    </li>
                  </ol>
                  <button
                    onClick={handleNativeInstall}
                    className="mt-3 w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    <Sparkles size={14} /> Trigger Chrome Desktop Install Prompt Now
                  </button>
                </div>
                
                <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4">
                  <h3 className="font-black text-sky-900 mb-2.5 text-xs uppercase tracking-wide">Microsoft Edge</h3>
                  <ol className="space-y-2">
                    <li className="flex items-start gap-2.5 text-xs text-sky-900 font-medium">
                      <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                      Look at the right side of the address bar.
                    </li>
                    <li className="flex items-start gap-2.5 text-xs text-sky-900 font-medium">
                      <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                      Click the "App available" icon (three squares with a plus sign).
                    </li>
                    <li className="flex items-start gap-2.5 text-xs text-sky-900 font-medium">
                      <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                      Click <strong>Install</strong>.
                    </li>
                  </ol>
                  <button
                    onClick={handleNativeInstall}
                    className="mt-3 w-full py-2.5 px-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    <Sparkles size={14} /> Trigger Edge Desktop Install Prompt Now
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'ios' && (
              <motion.div key="ios" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <h3 className="font-black text-slate-900 mb-2.5 text-xs uppercase tracking-wide">
                    Apple Safari (iPhone / iPad)
                  </h3>
                  <ol className="space-y-3">
                    <li className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                      Tap the <strong>Share</strong> button at the bottom of the screen (the square with an arrow pointing up).
                    </li>
                    <li className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                      Scroll down and tap <strong>Add to Home Screen</strong>.
                    </li>
                    <li className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                      Tap <strong>Add</strong>. Jesse Math Rockstar will appear on your home screen!
                    </li>
                  </ol>
                  <button
                    onClick={handleDownloadOfflinePackage}
                    className="mt-3 w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    <DownloadCloud size={14} /> Download iPhone App Shortcut Package (.ZIP)
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'android' && (
              <motion.div key="android" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                  <h3 className="font-black text-emerald-900 mb-2.5 text-xs uppercase tracking-wide">
                    Chrome for Android
                  </h3>
                  <ol className="space-y-3">
                    <li className="flex items-start gap-2.5 text-xs text-emerald-800 font-medium">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                      Tap the <strong>Menu</strong> icon (three dots) in the top right corner.
                    </li>
                    <li className="flex items-start gap-2.5 text-xs text-emerald-800 font-medium">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                      Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>.
                    </li>
                    <li className="flex items-start gap-2.5 text-xs text-emerald-800 font-medium">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                      Confirm installation to complete setup.
                    </li>
                  </ol>
                  <button
                    onClick={handleNativeInstall}
                    className="mt-3 w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    <Sparkles size={14} /> Trigger Android 1-Click Install Prompt Now
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}


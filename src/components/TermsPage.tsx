import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Scale, 
  Lock, 
  FileText, 
  Eye, 
  Server, 
  Database, 
  Heart,
  Layers,
  CheckCircle,
  Copy,
  Check,
  Globe,
  Award,
  BookOpen,
  UserCheck,
  Cpu,
  Key,
  Flame,
  AlertTriangle,
  Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function TermsPage() {
  const [activeTab, setActiveTab] = useState<'dual' | 'privacy' | 'terms'>('dual');
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  // Handle URL matching on mount and browser navigation/popstate events
  useEffect(() => {
    const handleUrlSync = () => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const section = params.get('section');
        if (section === 'privacy' || section === 'terms' || section === 'dual') {
          setActiveTab(section as any);
        }
      }
    };

    handleUrlSync();
    window.addEventListener('popstate', handleUrlSync);
    return () => window.removeEventListener('popstate', handleUrlSync);
  }, []);

  // Update shareUrl on activeTab change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}${window.location.pathname}?tab=terms&section=${activeTab}`;
      setShareUrl(url);
    }
  }, [activeTab]);

  const handleTabChange = (tabName: 'dual' | 'privacy' | 'terms') => {
    setActiveTab(tabName);
    if (typeof window !== 'undefined') {
      const newUrl = `${window.location.origin}${window.location.pathname}?tab=terms&section=${tabName}`;
      window.history.replaceState({ path: newUrl }, '', newUrl);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback in case of iframe browser permission restrictions
      const tempInput = document.createElement('input');
      tempInput.value = shareUrl;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const trustBadges = [
    { title: "COPPA Compliant", desc: "No PII collected under age 13", icon: <ShieldCheck className="text-emerald-800" size={16} /> },
    { title: "FERPA Aligned", desc: "No central student databases", icon: <Lock className="text-pink-800" size={16} /> },
    { title: "GDPR Compliant", desc: "Strict data minimization model", icon: <Shield className="text-indigo-800" size={16} /> },
    { title: "Child Digital Safety", desc: "You own your educational milestones", icon: <Heart className="text-rose-800" size={16} /> }
  ];

  return (
    <div className="space-y-8 py-4 max-w-7xl mx-auto px-4 sm:px-6 text-deep-navy">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-deep-navy/25 pb-8">
        <div className="space-y-3 max-w-2xl text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-full text-[10px] font-black uppercase text-emerald-800 tracking-wider font-mono">
            <Shield size={12} /> SECURE LEGAL COMPLIANCE CENTER
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-black text-deep-navy tracking-tight leading-tight">
            Official Legal Framework & <span className="text-[#0D9488]">Privacy Architecture</span>
          </h1>
          <p className="text-deep-navy text-xs sm:text-sm font-semibold leading-relaxed">
            Operated under the Young Genius Studios Educational Architecture Framework. Effective Date: July 5, 2026.
          </p>
        </div>

        {/* Share Link Card */}
        <div className="bg-clean-white border border-deep-navy border-4 p-4 rounded-3xl shrink-0 md:max-w-sm w-full space-y-3 shadow-md text-left">
          <div className="flex items-center gap-2 text-xs font-black uppercase font-mono tracking-wider">
            <Globe size={14} className="text-[#0D9488]" />
            <span>Public Shareable Link</span>
          </div>
          <p className="text-[10px] font-semibold text-slate-700 leading-normal">
            Share this live, verifiable legal document with school districts, parents, or compliance officers:
          </p>
          <div className="flex gap-2">
            <input 
              type="text" 
              readOnly 
              value={shareUrl}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              className="flex-1 bg-slate-100 border border-deep-navy border-2 px-3 py-1.5 rounded-xl font-mono text-[10px] font-bold text-slate-800 focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className={`px-3 py-1.5 border border-deep-navy border-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-1 shrink-0 ${
                copied 
                  ? 'bg-green-600 text-clean-white border-green-700' 
                  : 'bg-sunny-yellow hover:bg-sunny-yellow/80 text-deep-navy'
              }`}
            >
              {copied ? (
                <>
                  <Check size={12} /> Copied
                </>
              ) : (
                <>
                  <Copy size={12} /> Copy
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {trustBadges.map((badge, idx) => (
          <div key={idx} className="p-4 rounded-3xl bg-clean-white border border-deep-navy border-4 text-left shadow-sm flex items-start gap-3">
            <div className="p-2 bg-slate-100 border border-deep-navy border-2 rounded-xl shrink-0">
              {badge.icon}
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider font-mono block">{badge.title}</span>
              <p className="text-[10px] text-slate-700 font-bold mt-0.5 leading-normal">{badge.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* View Switcher / Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-sunny-yellow/20 p-2 border border-deep-navy border-4 rounded-2xl">
        <div className="flex p-1 bg-white border border-deep-navy border-4 rounded-xl w-full sm:w-auto gap-1">
          <button
            onClick={() => handleTabChange('dual')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              activeTab === 'dual'
                ? 'bg-deep-navy text-clean-white shadow-md'
                : 'text-deep-navy hover:bg-sky-blue/40'
            }`}
          >
            <Layers size={12} />
            Dual-Pane (See All)
          </button>
          <button
            onClick={() => handleTabChange('privacy')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              activeTab === 'privacy'
                ? 'bg-deep-navy text-clean-white shadow-md'
                : 'text-deep-navy hover:bg-sky-blue/40'
            }`}
          >
            <Eye size={12} />
            1. Privacy Policy
          </button>
          <button
            onClick={() => handleTabChange('terms')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              activeTab === 'terms'
                ? 'bg-deep-navy text-clean-white shadow-md'
                : 'text-deep-navy hover:bg-sky-blue/40'
            }`}
          >
            <FileText size={12} />
            2. Terms of Service
          </button>
          <button
            onClick={() => handleTabChange('why-us' as any)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              activeTab as any === 'why-us'
                ? 'bg-deep-navy text-clean-white shadow-md'
                : 'text-deep-navy hover:bg-sky-blue/40'
            }`}
          >
            <Flame size={12} />
            3. Why Choose Us?
          </button>
        </div>

        <div className="text-[10px] text-deep-navy font-mono flex items-center gap-1.5 px-2 font-bold">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
          <span>Official Legal Blueprint</span>
        </div>
      </div>

      {/* Content Viewer */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
          className="w-full text-left"
        >
          {activeTab as any === 'why-us' && (
            <div className="space-y-8 max-w-4xl mx-auto">
              <div className="p-8 rounded-[2rem] bg-gradient-to-br from-sunny-yellow/10 to-orange-500/10 border border-deep-navy border-4 space-y-4 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                  <Flame size={14} className="animate-pulse" /> Platform Comparison Guide
                </div>
                <h2 className="text-3xl md:text-5xl font-display font-black text-deep-navy leading-none">
                  Jesse Rock Math vs. The World: <br />
                  <span className="text-orange-600 italic">Why Our App Wins</span>
                </h2>
                <div className="p-4 bg-white/50 border-2 border-deep-navy rounded-2xl text-[11px] font-bold text-deep-navy uppercase tracking-wider leading-relaxed">
                  <span className="text-orange-600">Originality Notice:</span> This application is not a replica or clone of any teaching application, but a fully independent, next-generation educational tech engine built from the ground up for high-speed mastery.
                </div>
                <p className="text-slate-700 font-bold max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
                  There are over 10,000 math apps out there today, but Jesse Rock Math is designed to be better than 90% of them. 
                  Here is the brutal truth about why our indie code beats the corporate giants:
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-clean-white border border-deep-navy border-4 space-y-4 shadow-xl hover:translate-y-[-4px] transition-all">
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center border-2 border-deep-navy">
                    <Layers className="text-blue-700" size={24} />
                  </div>
                  <h3 className="text-xl font-black text-deep-navy leading-tight">We Beat 5,000+ <br/> "One-Trick" Apps</h3>
                  <p className="text-sm text-slate-700 font-semibold leading-relaxed">
                    Most apps only teach one thing, like just times tables. If you finish them, you have to download a completely new app. 
                    <strong> Jesse Rock Math</strong> has 7 massive modules in a single place—taking you smoothly from simple addition all the way to fractions, algebra (PEMDAS), and 3D geometry.
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-clean-white border border-deep-navy border-4 space-y-4 shadow-xl hover:translate-y-[-4px] transition-all">
                  <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center border-2 border-deep-navy">
                    <Cpu className="text-emerald-700" size={24} />
                  </div>
                  <h3 className="text-xl font-black text-deep-navy leading-tight">We Beat 3,000+ <br/> "Slow & Laggy" Web Apps</h3>
                  <p className="text-sm text-slate-700 font-semibold leading-relaxed">
                    Free school game sites are packed with heavy animations and tracking cookies that cause massive lag on school tablets. 
                    <strong> Jesse Rock Math</strong> is built with advanced Zero-Loading Time architecture. No lag means students can solve up to 3x more problems in the exact same amount of time.
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-clean-white border border-deep-navy border-4 space-y-4 shadow-xl hover:translate-y-[-4px] transition-all">
                  <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center border-2 border-deep-navy">
                    <Trophy className="text-amber-700" size={24} />
                  </div>
                  <h3 className="text-xl font-black text-deep-navy leading-tight">We Beat 1,000+ <br/> "Boring Reward" Apps</h3>
                  <p className="text-sm text-slate-700 font-semibold leading-relaxed">
                    Most apps just give you a digital sticker or a boring coin. <strong>Jesse Rock Math</strong> uses high-stakes gaming psychology. 
                    Hitting a massive 200+ answer streak unlocks an entire hidden Secret Arcade Zone. Plus, our engine instantly builds a personalized, printable PDF certificate with your unique username on it.
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-clean-white border border-deep-navy border-4 space-y-4 shadow-xl hover:translate-y-[-4px] transition-all">
                  <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center border-2 border-deep-navy">
                    <CheckCircle className="text-indigo-700" size={24} />
                  </div>
                  <h3 className="text-xl font-black text-deep-navy leading-tight">We Even Beat Giants <br/> Like TTRS on Features</h3>
                  <p className="text-sm text-slate-700 font-semibold leading-relaxed">
                    Big corporate apps like Times Tables Rock Stars lock you into multiplication and division forever. 
                    <strong> Jesse Rock Math</strong> matches the high-octane rockstar vibe but gives you a full math curriculum campaign.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-deep-navy text-white border-4 border-deep-navy space-y-4">
                <p className="text-xs font-mono font-black uppercase tracking-[0.2em] text-sunny-yellow">Verified Result</p>
                <p className="text-lg md:text-xl font-black italic">
                  "I built this app because I was bored of the standard school math games. I wanted something that actually feels like a game but teaches everything."
                </p>
                <div className="flex items-center gap-3 border-t border-white/20 pt-4">
                  <div className="w-10 h-10 rounded-full bg-sunny-yellow border-2 border-white flex items-center justify-center text-deep-navy font-black">JO</div>
                  <div className="text-left">
                    <p className="text-sm font-black">Jesse Otobo</p>
                    <p className="text-[10px] font-mono text-sunny-yellow/80">Lead Developer & Founder</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dual' && (
            <div className="grid lg:grid-cols-2 gap-8 items-start">
              
              {/* Privacy Column */}
              <div className="space-y-6">
                <div className="p-5 rounded-3xl bg-emerald-50 border border-deep-navy border-4 space-y-2">
                  <span className="text-[9px] font-mono text-emerald-800 font-black tracking-widest uppercase">REGULATORY DECAL PRIV-100</span>
                  <h2 className="text-xl font-black text-deep-navy font-mono flex items-center gap-2">
                    <Eye size={20} className="text-[#0D9488]" />
                    1. PRIVACY & DATA GOVERNANCE
                  </h2>
                  <p className="text-[11px] text-slate-800 font-bold">Comprehensive data minimization models & global statutory compliance structures.</p>
                </div>

                {/* Privacy Content Modules */}
                <div className="space-y-4">
                  
                  {/* Core Commitment */}
                  <div className="p-6 rounded-3xl bg-clean-white border border-deep-navy border-4 space-y-3 shadow-sm hover:scale-[1.01] transition-transform">
                    <div className="flex items-center gap-2.5 text-emerald-800 font-black text-xs font-mono uppercase tracking-wider border-b border-deep-navy/10 pb-2">
                      <Heart size={14} className="text-red-600" />
                      Core Commitment & Transparency
                    </div>
                    <p className="text-xs text-slate-800 font-bold leading-relaxed">
                      Jesse Math Rockstar is designed to follow strict data minimization practices. We prioritize student privacy by avoiding unnecessary tracking cookies or commercial ad networks. While no digital platform can claim absolute infallibility, we maintain robust encryption in transit (HTTPS/TLS 1.3) and secure Firestore data storage via Google Cloud to safeguard user records.
                    </p>
                  </div>

                  {/* A. Statutory Compliance */}
                  <div className="p-6 rounded-3xl bg-clean-white border border-deep-navy border-4 space-y-3 shadow-sm hover:scale-[1.01] transition-transform">
                    <div className="flex items-center gap-2.5 text-emerald-800 font-black text-xs font-mono uppercase tracking-wider border-b border-deep-navy/10 pb-2">
                      <ShieldAlert size={14} className="text-[#0D9488]" />
                      A. Statutory Frameworks & Educational Alignment
                    </div>
                    <p className="text-xs text-slate-800 font-semibold leading-relaxed">
                      This platform is structured to support school districts and educators in meeting major student data privacy guidelines:
                    </p>
                    <ul className="space-y-3.5 pl-1 pt-1 text-xs">
                      <li className="flex items-start gap-2.5 text-slate-800 font-bold">
                        <span className="mt-1 font-mono text-[9px] px-1.5 py-0.5 bg-emerald-100 border border-deep-navy rounded">COPPA</span>
                        <p className="font-semibold leading-relaxed">
                          <strong>Children's Online Privacy Protection Act:</strong> We design our application flow to minimize personal data collection from minors under 13, relying on anonymous nicknames and local device storage unless school accounts are explicitly provisioned.
                        </p>
                      </li>
                      <li className="flex items-start gap-2.5 text-slate-800 font-bold">
                        <span className="mt-1 font-mono text-[9px] px-1.5 py-0.5 bg-indigo-100 border border-deep-navy rounded">FERPA</span>
                        <p className="font-semibold leading-relaxed">
                          <strong>FERPA Compliance Alignment:</strong> Educational records generated by students remain under teacher review and administrative oversight, with secure authentication safeguards.
                        </p>
                      </li>
                      <li className="flex items-start gap-2.5 text-slate-800 font-bold">
                        <span className="mt-1 font-mono text-[9px] px-1.5 py-0.5 bg-pink-100 border border-deep-navy rounded">GDPR</span>
                        <p className="font-semibold leading-relaxed">
                          <strong>Data Protection Principles:</strong> We adhere to data minimization, limiting stored records to necessary academic metrics (scores, streaks, and custom display names).
                        </p>
                      </li>
                    </ul>
                  </div>

                  {/* B. Information Architecture */}
                  <div className="p-6 rounded-3xl bg-clean-white border border-deep-navy border-4 space-y-4 shadow-sm hover:scale-[1.01] transition-transform">
                    <div className="flex items-center gap-2.5 text-emerald-800 font-black text-xs font-mono uppercase tracking-wider border-b border-deep-navy/10 pb-2">
                      <Database size={14} className="text-indigo-600" />
                      B. Information Architecture: What We Process
                    </div>
                    <p className="text-xs text-slate-800 font-semibold leading-relaxed">
                      To deliver a high-speed, gamified experience without compromising identity security, our data layout is explicitly divided:
                    </p>
                    
                    <div className="grid gap-3 pt-1">
                      <div className="p-3 border border-deep-navy border-2 bg-slate-50 rounded-2xl space-y-1">
                        <span className="text-[10px] font-mono font-black uppercase text-pink-800 block">1. Identity Information</span>
                        <p className="text-[11px] text-slate-800 font-bold"><strong>Processed:</strong> Custom Display Nicknames Only (e.g., SpeedDemon88). Real names and email addresses are prohibited.</p>
                        <p className="text-[10px] text-slate-700 font-semibold"><strong>Storage:</strong> Local Device & Cloud Database | <strong>Retention:</strong> Volatile / Cleared at user request or cache wipe.</p>
                      </div>

                      <div className="p-3 border border-deep-navy border-2 bg-slate-50 rounded-2xl space-y-1">
                        <span className="text-[10px] font-mono font-black uppercase text-[#0D9488] block">2. Progression Analytics</span>
                        <p className="text-[11px] text-slate-800 font-bold"><strong>Processed:</strong> Earned Math Tokens, active answer streaks, accuracy percentages, unlocked cosmetic badges.</p>
                        <p className="text-[10px] text-slate-700 font-semibold"><strong>Storage:</strong> Browser localStorage | <strong>Retention:</strong> Persistent until browser cache is cleared.</p>
                      </div>

                      <div className="p-3 border border-deep-navy border-2 bg-slate-50 rounded-2xl space-y-1">
                        <span className="text-[10px] font-mono font-black uppercase text-violet-850 text-violet-800 block">3. Optional Account Cloud-Sync</span>
                        <p className="text-[11px] text-slate-800 font-bold"><strong>Processed:</strong> Secure, unique cryptographic UID tokens mapped through Firebase Authentication.</p>
                        <p className="text-[10px] text-slate-700 font-semibold"><strong>Storage:</strong> Encrypted Firestore Database | <strong>Retention:</strong> Indefinite until account closure requested.</p>
                      </div>

                      <div className="p-3 border border-deep-navy border-2 bg-slate-50 rounded-2xl space-y-1">
                        <span className="text-[10px] font-mono font-black uppercase text-red-800 block">4. Tracking & Telemetry</span>
                        <p className="text-[11px] text-slate-800 font-bold"><strong>Processed:</strong> Strictly zero third-party advertising cookies, marketing tracking pixels, or cross-site telemetry.</p>
                        <p className="text-[10px] text-slate-700 font-semibold"><strong>Storage:</strong> Non-Existent | <strong>Retention:</strong> N/A</p>
                      </div>
                    </div>
                  </div>

                  
                  {/* D. Third-Party Integrations */}
                  <div className="p-6 rounded-3xl bg-clean-white border border-deep-navy border-4 space-y-3 shadow-sm hover:scale-[1.01] transition-transform">
                    <div className="flex items-center gap-2.5 text-blue-800 font-black text-xs font-mono uppercase tracking-wider border-b border-deep-navy/10 pb-2">
                      <Globe size={14} className="text-blue-600" />
                      D. Third-Party Educational Integrations (Google Interland)
                    </div>
                    <p className="text-xs text-slate-800 font-semibold leading-relaxed">
                      To reward students with high streaks, we unlock the <strong>Fun Arcade</strong>, which provides direct links to highly vetted, educational games produced by Google (e.g., Kind Kingdom, Reality River). 
                    </p>
                    <ul className="space-y-3 pl-1 text-xs text-slate-800 font-semibold leading-relaxed list-disc ml-4">
                      <li><strong>COPPA Compliance Maintained:</strong> These games are hosted directly on Google Interland (Be Internet Awesome), which is a COPPA-compliant, kid-safe environment designed to teach digital citizenship.</li>
                      <li><strong>No Data Sharing:</strong> Jesse Rock Math does not transmit any student data, IDs, or tracking pixels to Google. We merely provide a hyperlink to their public educational resources.</li>
                      <li><strong>Zero Trackers:</strong> Our application does not embed external third-party ad networks or hidden tracking cookies alongside these games.</li>
                    </ul>
                  </div>

                  {/* C. Data Portability */}
                  <div className="p-6 rounded-3xl bg-clean-white border border-deep-navy border-4 space-y-3 shadow-sm hover:scale-[1.01] transition-transform">
                    <div className="flex items-center gap-2.5 text-emerald-800 font-black text-xs font-mono uppercase tracking-wider border-b border-deep-navy/10 pb-2">
                      <Server size={14} className="text-[#0D9488]" />
                      C. Data Portability & The Conversion Pipeline
                    </div>
                    <p className="text-xs text-slate-800 font-bold leading-relaxed">
                      For students migrating their offline, browser-bound progress (localStorage) to a cloud-saved framework for home learning, data security is handled entirely via secure Firebase tokens. All cloud traffic is encrypted in transit using industry-standard HTTPS/TLS 1.3.
                    </p>
                    <p className="text-xs text-slate-800 font-bold leading-relaxed">
                      <strong>Data Erasure (Right to be Forgotten):</strong> Because player profiles are tied entirely to anonymous local tokens, users, parents, or educators can permanently purge all data and cloud-linked history instantly by clearing their browser cache or selecting the "Reset Profile" utility directly inside the application settings. No email contact or administrative request is required.
                    </p>
                  </div>

                </div>
              </div>

              {/* Terms Column */}
              <div className="space-y-6">
                <div className="p-5 rounded-3xl bg-indigo-50 border border-deep-navy border-4 space-y-2">
                  <span className="text-[9px] font-mono text-indigo-800 font-black tracking-widest uppercase">REGULATORY DECAL TERM-200</span>
                  <h2 className="text-xl font-black text-deep-navy font-mono flex items-center gap-2">
                    <FileText size={20} className="text-indigo-800" />
                    2. TERMS & FAIR PLAY AGREEMENT
                  </h2>
                  <p className="text-[11px] text-slate-800 font-bold">Acceptable educational use cases, fair play codes, and server performance bounds.</p>
                </div>

                {/* Terms Content Modules */}
                <div className="space-y-4">
                  
                  {/* A. Authorized Use Case */}
                  <div className="p-6 rounded-3xl bg-clean-white border border-deep-navy border-4 space-y-3 shadow-sm hover:scale-[1.01] transition-transform">
                    <div className="flex items-center gap-2.5 text-indigo-800 font-black text-xs font-mono uppercase tracking-wider border-b border-deep-navy/10 pb-2">
                      <BookOpen size={14} className="text-[#0D9488]" />
                      A. Authorized Use Case
                    </div>
                    <p className="text-xs text-slate-800 font-bold leading-relaxed">
                      Jesse Math Rockstar is a 100% free, un-monetized educational utility provided open-access to school computer labs, classroom environments, and residential homes. Commercial extraction, white-labeling, or paid distribution of this platform without explicit written authorization is legally actionable.
                    </p>
                  </div>

                  {/* B. Behavioral Code of Conduct */}
                  <div className="p-6 rounded-3xl bg-clean-white border border-deep-navy border-4 space-y-3 shadow-sm hover:scale-[1.01] transition-transform">
                    <div className="flex items-center gap-2.5 text-indigo-800 font-black text-xs font-mono uppercase tracking-wider border-b border-deep-navy/10 pb-2">
                      <UserCheck size={14} className="text-orange-600" />
                      B. Behavioral Code & System Moderation
                    </div>
                    <ul className="space-y-3 pl-1 text-xs font-semibold leading-relaxed text-slate-800">
                      <li>
                        <strong>Nickname Integrity:</strong> The system automatically flags and scrubs profane, personally identifiable, or offensive language from global real-time leaderboards.
                      </li>
                      <li>
                        <strong>Algorithmic Fair Play:</strong> The Adaptive Math Engine is explicitly designed to measure human cognitive memory. The deployment of automated query scripts, browser extension macros, or API-injection bots to falsely generate Math Tokens constitutes a breach of service and will result in a permanent hardware/IP ban from the global leaderboards.
                      </li>
                    </ul>
                  </div>

                  {/* C. System Warranties */}
                  <div className="p-6 rounded-3xl bg-clean-white border border-deep-navy border-4 space-y-3 shadow-sm hover:scale-[1.01] transition-transform">
                    <div className="flex items-center gap-2.5 text-indigo-800 font-black text-xs font-mono uppercase tracking-wider border-b border-deep-navy/10 pb-2">
                      <Server size={14} className="text-pink-600" />
                      C. System Warranties & Server Infrastructure
                    </div>
                    <p className="text-xs text-slate-800 font-bold leading-relaxed">
                      This software is deployed utilizing enterprise-grade server frameworks via Vercel and Google Cloud Architecture. While we maintain optimized server uptime, the platform is provided on an "as-is" basis. Young Genius Studios is not liable for data loss occurring from hardware malfunctions, local browser profile clearing, or regional institutional web filters.
                    </p>
                  </div>

                </div>
              </div>

            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="p-6 rounded-3xl bg-emerald-50 border border-deep-navy border-4 space-y-2">
                <span className="text-[10px] font-mono text-emerald-800 font-bold">OFFICIAL DIRECTIVE</span>
                <h2 className="text-2xl font-black text-deep-navy font-mono">1. Privacy Policy & Data Governance</h2>
                <p className="text-xs text-slate-800 font-bold">Comprehensive disclosure regarding static and volatile information structures.</p>
              </div>

              <div className="space-y-4">
                {/* Core */}
                <div className="p-6 rounded-3xl bg-clean-white border border-deep-navy border-4 space-y-3">
                  <h3 className="text-sm font-black font-mono uppercase text-deep-navy border-b border-deep-navy/10 pb-2 flex items-center gap-2">
                    <Heart className="text-red-600" size={16} /> Core Commitment
                  </h3>
                  <p className="text-xs text-slate-800 font-bold leading-relaxed">
                    Jesse Math Rockstar is engineered natively to uphold the highest global standards of data minimization, guaranteeing absolute child digital safety. We believe student data should belong to the student—not corporate databases.
                  </p>
                </div>

                {/* A */}
                <div className="p-6 rounded-3xl bg-clean-white border border-deep-navy border-4 space-y-3">
                  <h3 className="text-sm font-black font-mono uppercase text-deep-navy border-b border-deep-navy/10 pb-2 flex items-center gap-2">
                    <ShieldCheck className="text-emerald-700" size={16} /> A. Statutory Compliance & Legal Frameworks
                  </h3>
                  <p className="text-xs text-slate-800 font-bold leading-relaxed">
                    Young Genius Studios engineered this platform to structurally align with and enforce major global student privacy statutes. Because our architecture intentionally avoids harvesting personal identifiers, schools can deploy this application without executing complex data sharing agreements (DPAs):
                  </p>
                  <div className="grid md:grid-cols-3 gap-4 pt-2">
                    <div className="p-4 bg-slate-50 border border-deep-navy border-2 rounded-2xl space-y-1">
                      <span className="text-[10px] font-mono font-black text-emerald-800 block">COPPA</span>
                      <p className="text-[10px] text-slate-800 font-semibold leading-normal">
                        <strong>Children&apos;s Online Privacy Protection Act:</strong> We strictly adhere to FTC guidelines. The platform does not collect, track, or maintain personal information from children under the age of 13.
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 border border-deep-navy border-2 rounded-2xl space-y-1">
                      <span className="text-[10px] font-mono font-black text-indigo-800 block">FERPA</span>
                      <p className="text-[10px] text-slate-800 font-semibold leading-normal">
                        <strong>FERPA (Federal Educational Rights and Privacy Act):</strong> This application does not maintain student educational records on central servers, ensuring absolute compliance with school district operational guidelines.
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 border border-deep-navy border-2 rounded-2xl space-y-1">
                      <span className="text-[10px] font-mono font-black text-pink-850 text-pink-800 block">UK & EU GDPR</span>
                      <p className="text-[10px] text-slate-800 font-semibold leading-normal">
                        <strong>Data Protection Act 2018:</strong> Young Genius Studios functions entirely within a data-minimization model. We do not act as a traditional "Data Controller" because we do not capture personal user profiles.
                      </p>
                    </div>
                  </div>
                </div>

                {/* B */}
                <div className="p-6 rounded-3xl bg-clean-white border border-deep-navy border-4 space-y-3">
                  <h3 className="text-sm font-black font-mono uppercase text-deep-navy border-b border-deep-navy/10 pb-2 flex items-center gap-2">
                    <Database className="text-indigo-600" size={16} /> B. Information Architecture: What We Process
                  </h3>
                  <p className="text-xs text-slate-800 font-bold leading-relaxed mb-4">
                    To deliver a high-speed, gamified experience without compromising identity security, our data layout is explicitly divided:
                  </p>
                  <div className="space-y-3">
                    <div className="p-4 bg-slate-50 border border-deep-navy border-2 rounded-2xl">
                      <span className="text-xs font-black text-pink-800 font-mono">1. IDENTITY INFORMATION</span>
                      <p className="text-xs text-slate-800 font-semibold leading-relaxed mt-1">
                        <strong>Data Elements Processed:</strong> Custom Display Nicknames Only (e.g., SpeedDemon88). Real names and email addresses are prohibited.
                      </p>
                      <p className="text-[11px] text-slate-700 font-medium mt-1">
                        <strong>Storage:</strong> Local Device & Cloud Database | <strong>Retention Protocol:</strong> Volatile / Cleared at user request or local browser cache wipe.
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 border border-deep-navy border-2 rounded-2xl">
                      <span className="text-xs font-black text-[#0D9488] font-mono">2. PROGRESSION ANALYTICS</span>
                      <p className="text-xs text-slate-800 font-semibold leading-relaxed mt-1">
                        <strong>Data Elements Processed:</strong> Earned Math Tokens, active answer streaks, accuracy percentages, unlocked cosmetic badges.
                      </p>
                      <p className="text-[11px] text-slate-700 font-medium mt-1">
                        <strong>Storage:</strong> Browser localStorage | <strong>Retention Protocol:</strong> Persistent on device until browser cache is cleared.
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 border border-deep-navy border-2 rounded-2xl">
                      <span className="text-xs font-black text-violet-850 text-violet-800 font-mono">3. OPTIONAL ACCOUNT CLOUD-SYNC</span>
                      <p className="text-xs text-slate-800 font-semibold leading-relaxed mt-1">
                        <strong>Data Elements Processed:</strong> Secure, unique cryptographic UID tokens mapped through Firebase Authentication.
                      </p>
                      <p className="text-[11px] text-slate-700 font-medium mt-1">
                        <strong>Storage:</strong> Encrypted Firestore Database | <strong>Retention Protocol:</strong> Indefinite until account closure is requested.
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 border border-deep-navy border-2 rounded-2xl">
                      <span className="text-xs font-black text-red-850 text-red-800 font-mono">4. TRACKING & TELEMETRY</span>
                      <p className="text-xs text-slate-800 font-semibold leading-relaxed mt-1">
                        <strong>Data Elements Processed:</strong> Strictly zero third-party advertising cookies, marketing tracking pixels, or cross-site telemetry.
                      </p>
                      <p className="text-[11px] text-slate-700 font-medium mt-1">
                        <strong>Storage:</strong> Non-Existent | <strong>Retention Protocol:</strong> N/A
                      </p>
                    </div>
                  </div>
                </div>

                {/* D */}
                <div className="p-6 rounded-3xl bg-clean-white border border-deep-navy border-4 space-y-3">
                  <h3 className="text-sm font-black font-mono uppercase text-deep-navy border-b border-deep-navy/10 pb-2 flex items-center gap-2">
                    <Globe className="text-blue-600" size={16} /> D. Third-Party Educational Integrations (Google Interland)
                  </h3>
                  <p className="text-xs text-slate-800 font-bold leading-relaxed">
                    To reward students with high streaks, we unlock the <strong>Fun Arcade</strong>, which provides direct links to highly vetted, educational games produced by Google (e.g., Kind Kingdom, Reality River).
                  </p>
                  <ul className="space-y-2 pl-4 text-[11px] text-slate-800 font-semibold leading-relaxed list-disc">
                    <li><strong>COPPA Compliance Maintained:</strong> These games are hosted directly on Google Interland (Be Internet Awesome), which is a COPPA-compliant, kid-safe environment designed to teach digital citizenship.</li>
                    <li><strong>No Data Sharing:</strong> Jesse Rock Math does not transmit any student data, IDs, or tracking pixels to Google. We merely provide a hyperlink to their public educational resources.</li>
                    <li><strong>Zero Trackers:</strong> Our application does not embed external third-party ad networks or hidden tracking cookies alongside these games.</li>
                  </ul>
                  <p className="text-[10px] text-slate-600 font-bold italic mt-2">
                    <strong>Note on App Access:</strong> Jesse Rock Math is a web-based application (Progressive Web Hub) deployed via secure cloud infrastructure. It requires no downloads or invasive local installations, maintaining a sandboxed environment that respects all modern privacy and safety standards for young learners.
                  </p>
                </div>

                {/* C */}
                <div className="p-6 rounded-3xl bg-clean-white border border-deep-navy border-4 space-y-3">
                  <h3 className="text-sm font-black font-mono uppercase text-deep-navy border-b border-deep-navy/10 pb-2 flex items-center gap-2">
                    <Server className="text-pink-600" size={16} /> C. Data Portability & The Conversion Pipeline
                  </h3>
                  <p className="text-xs text-slate-800 font-bold leading-relaxed">
                    For students migrating their offline, browser-bound progress (localStorage) to a cloud-saved framework for home learning, data security is handled entirely via secure Firebase tokens. All cloud traffic is encrypted in transit using industry-standard HTTPS/TLS 1.3.
                  </p>
                  <p className="text-xs text-slate-800 font-bold leading-relaxed">
                    <strong>Data Erasure (Right to be Forgotten):</strong> Because player profiles are tied entirely to anonymous local tokens, users, parents, or educators can permanently purge all data and cloud-linked history instantly by clearing their browser cache or selecting the "Reset Profile" utility directly inside the application settings. No email contact or administrative request is required.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="p-6 rounded-3xl bg-indigo-50 border border-deep-navy border-4 space-y-2">
                <span className="text-[10px] font-mono text-indigo-800 font-bold">OFFICIAL DIRECTIVE</span>
                <h2 className="text-2xl font-black text-deep-navy font-mono">2. Terms of Service & Fair Play Agreement</h2>
                <p className="text-xs text-slate-800 font-bold">Authorized use policy, anti-cheat codes, and operational limits.</p>
              </div>

              <div className="space-y-4">
                {/* A */}
                <div className="p-6 rounded-3xl bg-clean-white border border-deep-navy border-4 space-y-3">
                  <h3 className="text-sm font-black font-mono uppercase text-deep-navy border-b border-deep-navy/10 pb-2 flex items-center gap-2">
                    <BookOpen className="text-indigo-800" size={16} /> A. Authorized Use Case
                  </h3>
                  <p className="text-xs text-slate-800 font-bold leading-relaxed">
                    Jesse Math Rockstar is a 100% free, un-monetized educational utility provided open-access to school computer labs, classroom environments, and residential homes. Commercial extraction, white-labeling, or paid distribution of this platform without explicit written authorization is legally actionable.
                  </p>
                </div>

                {/* B */}
                <div className="p-6 rounded-3xl bg-clean-white border border-deep-navy border-4 space-y-3">
                  <h3 className="text-sm font-black font-mono uppercase text-deep-navy border-b border-deep-navy/10 pb-2 flex items-center gap-2">
                    <UserCheck className="text-orange-600" size={16} /> B. Behavioral Code of Conduct & System Moderation
                  </h3>
                  <p className="text-xs text-slate-800 font-bold leading-relaxed">
                    To preserve a healthy, encouraging environment for young learners, the following operational bounds are actively enforced:
                  </p>
                  <ul className="space-y-3 pl-1 pt-1 text-xs">
                                        <li className="flex items-start gap-2 text-slate-800 font-bold">
                      <span className="mt-1 w-2 h-2 rounded-full bg-deep-navy shrink-0"></span>
                      <p className="font-semibold leading-relaxed">
                        <strong>Nickname Integrity & Automated Filters:</strong> The platform explicitly blocks users from signing in or registering with usernames containing swear words, slurs, or inappropriate language. The system incorporates a robust real-time profanity filter to actively intercept, block, and scrub any offensive submissions. Failure to abide by clean naming conventions will result in account creation denial or immediate removal from global real-time leaderboards.
                      </p>

                    </li>
                    <li className="flex items-start gap-2 text-slate-800 font-bold">
                      <span className="mt-1 w-2 h-2 rounded-full bg-deep-navy shrink-0"></span>
                      <p className="font-semibold leading-relaxed">
                        <strong>Algorithmic Fair Play:</strong> The Adaptive Math Engine is explicitly designed to measure human cognitive memory. The deployment of automated query scripts, browser extension macros, or API-injection bots to falsely generate Math Tokens constitutes a breach of service and will result in a permanent hardware/IP ban from the global leaderboards.
                      </p>
                    </li>
                  </ul>
                </div>

                {/* C */}
                <div className="p-6 rounded-3xl bg-clean-white border border-deep-navy border-4 space-y-3">
                  <h3 className="text-sm font-black font-mono uppercase text-deep-navy border-b border-deep-navy/10 pb-2 flex items-center gap-2">
                    <Server className="text-pink-600" size={16} /> C. System Warranties & Server Infrastructure
                  </h3>
                  <p className="text-xs text-slate-800 font-bold leading-relaxed">
                    This software is deployed utilizing enterprise-grade server frameworks via Vercel and Google Cloud Architecture. While we maintain optimized server uptime, the platform is provided on an "as-is" basis. Young Genius Studios is not liable for data loss occurring from hardware malfunctions, local browser profile clearing, or regional institutional web filters.
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Disclaimers Panel */}
      <div className="p-6 rounded-3xl bg-white border border-deep-navy border-4 space-y-3 text-left">
        <div className="flex items-center gap-2 text-rose-800 font-black text-xs uppercase tracking-wider font-mono">
          <AlertTriangle size={14} className="text-rose-600 shrink-0" />
          Critical Platform Disclaimer
        </div>
        <p className="text-[11px] text-deep-navy leading-relaxed font-bold">
          THIS SOFTWARE IS PROVIDED "AS IS" BY THE YOUNG GENIUS STUDIOS TEAM WITHOUT ANY EXPRESSED OR IMPLIED WARRANTIES. WE ARE NOT LIABLE FOR TRANSITIONAL DATA DROPS OR LOCAL REGISTRY EXPIRES. MATCH RECORDS ARE KEPT ON SECURE MULTI-REGION REALTIME FIREBASE REPOSITORIES TO PRESERVE MAXIMUM STRETCHES OF HISTORY.
        </p>
        <p className="text-[10px] text-slate-700 font-mono font-bold">
          Last Revision: July 5, 2026. Approved under Young Genius Educational Standard Code. Authorized by Lead Architect Jesse Otobo.
        </p>
      </div>

    </div>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Bug, 
  Zap, 
  CheckCircle2, 
  ShoppingBag, 
  Sliders, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  BarChart3, 
  ShieldAlert,
  Flame,
  Star
} from 'lucide-react';
import { 
  SurveyAnswer, 
  saveSurveySubmission, 
  markSurveyCompleted 
} from '../lib/surveyManager';

interface SurveyPopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToSurveyHub: () => void;
}

export default function SurveyPopupModal({
  isOpen,
  onClose,
  onNavigateToSurveyHub
}: SurveyPopupModalProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Form State strictly constrained to 5 structured, non-spam questions
  const [bugsEncountered, setBugsEncountered] = useState<SurveyAnswer['bugsEncountered']>('none');
  const [performanceRating, setPerformanceRating] = useState<SurveyAnswer['performanceRating']>('lightning_fast');
  const [topMissingFeature, setTopMissingFeature] = useState<SurveyAnswer['topMissingFeature']>('zen_mode');
  const [shopFeedback, setShopFeedback] = useState<SurveyAnswer['shopFeedback']>('love_rewards');
  const [developerPriority, setDeveloperPriority] = useState<SurveyAnswer['developerPriority']>('tablet_touch_fix');

  if (!isOpen) return null;

  const handleDismiss = () => {
    markSurveyCompleted();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveSurveySubmission({
      bugsEncountered,
      performanceRating,
      topMissingFeature,
      shopFeedback,
      developerPriority
    });
    setIsSubmitted(true);
  };

  const handleViewAnalytics = () => {
    onClose();
    onNavigateToSurveyHub();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 15 }}
        className="bg-white border-4 border-deep-navy rounded-[2.5rem] p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 relative overflow-hidden max-h-[92vh] flex flex-col justify-between"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                  1-Time Feedback Survey
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  {isSubmitted ? 'Completed' : `Question ${currentStep} of 5`}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-display font-black text-deep-navy">
                Help Improve Jesse Math Rockstar 🎸
              </h2>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            aria-label="Close and do not show again"
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-black cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Success / Analytics Redirection Screen */}
        {isSubmitted ? (
          <div className="py-6 text-center space-y-5 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={36} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-display font-black text-deep-navy">
                Thank You for Your Feedback!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-md mx-auto leading-relaxed">
                Your answers have been processed into our real-time <strong>Survey Analytics Engine</strong>. We will never show this survey popup again.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-left text-xs space-y-1.5">
              <p className="font-black text-slate-800 flex items-center gap-1.5">
                <BarChart3 size={15} className="text-indigo-600" />
                Live Anonymized Processing
              </p>
              <p className="text-slate-500 text-[11px] font-medium">
                Your submission is 100% private. No usernames or personal identifiers are stored or shown on the analytical dashboard.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={handleViewAnalytics}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all hover:scale-105 cursor-pointer flex items-center justify-center gap-2"
              >
                <BarChart3 size={15} /> View Survey Analytics Hub
              </button>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs uppercase tracking-wider rounded-2xl transition-colors cursor-pointer"
              >
                Continue Playing
              </button>
            </div>
          </div>
        ) : (
          /* Multi-step 5-Question Survey Form */
          <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1">
            {/* Step Progress Bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-emerald-500 transition-all duration-300"
                style={{ width: `${(currentStep / 5) * 100}%` }}
              />
            </div>

            {/* Question 1: Bugs & Errors Encountered */}
            {currentStep === 1 && (
              <div className="space-y-3 animate-fade-in">
                <div className="space-y-1">
                  <span className="text-[11px] font-black text-rose-600 uppercase tracking-wider flex items-center gap-1">
                    <Bug size={13} /> Question 1 of 5 • Bug & Error Detection
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">
                    Did you experience any bugs, glitches, or errors while playing?
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-2 pt-1">
                  {[
                    { id: 'none', label: '✅ Zero Bugs — Ran 100% buttery smooth', tag: 'Smooth' },
                    { id: 'touch_delay', label: '📱 Keypad Touch Latency on iPad / Tablet', tag: 'Touch Delay' },
                    { id: 'accidental_purchase', label: '🛒 Accidental Rock Shop item purchase (Need confirm dialog)', tag: 'Shop UX' },
                    { id: 'audio_overlap', label: '🔊 Guitar solo audio overlapped round timer buzzer', tag: 'Audio' },
                    { id: 'avatar_reset', label: '🎨 Avatar rocker hair / skin color reset on reload', tag: 'Cosmetics' },
                    { id: 'multiplayer_sync', label: '⚔️ 1v1 Battle match synchronization hiccup', tag: 'Multiplayer' }
                  ].map((opt) => (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => setBugsEncountered(opt.id as any)}
                      className={`w-full p-3 rounded-2xl border-2 text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                        bugsEncountered === opt.id
                          ? 'bg-amber-50 border-amber-500 text-slate-950 shadow-sm scale-[1.01]'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span>{opt.label}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold ml-2 shrink-0">
                        {opt.tag}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Question 2: Performance & Responsiveness */}
            {currentStep === 2 && (
              <div className="space-y-3 animate-fade-in">
                <div className="space-y-1">
                  <span className="text-[11px] font-black text-amber-600 uppercase tracking-wider flex items-center gap-1">
                    <Zap size={13} /> Question 2 of 5 • Speed & Smoothness
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">
                    How responsive and fast was the app on your device?
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-2 pt-1">
                  {[
                    { id: 'lightning_fast', label: '⚡ Lightning Fast (60 FPS, instant math calculation response)', desc: 'Zero lag or stutter' },
                    { id: 'good_playable', label: '👍 Good & Playable (Smooth everyday classroom experience)', desc: 'Occasional normal frame drop' },
                    { id: 'minor_lag', label: '⏳ Noticeable Input Delay on Number Pad', desc: 'Numbers register a fraction late' },
                    { id: 'slow_loading', label: '🐌 Heavy Resource / Slow Initial Asset Load', desc: 'Takes long to open modules' }
                  ].map((opt) => (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => setPerformanceRating(opt.id as any)}
                      className={`w-full p-3 rounded-2xl border-2 text-left text-xs font-bold transition-all flex flex-col gap-0.5 cursor-pointer ${
                        performanceRating === opt.id
                          ? 'bg-amber-50 border-amber-500 text-slate-950 shadow-sm scale-[1.01]'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-slate-900 font-black">{opt.label}</span>
                      <span className="text-slate-500 text-[11px] font-medium">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Question 3: Top Missing Feature Needed */}
            {currentStep === 3 && (
              <div className="space-y-3 animate-fade-in">
                <div className="space-y-1">
                  <span className="text-[11px] font-black text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles size={13} /> Question 3 of 5 • Missing Features
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">
                    What top missing feature or curriculum topic do you need most?
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-2 pt-1">
                  {[
                    { id: 'zen_mode', label: '🧘 Untimed Zen Practice Mode (Low-stress, customizable timers)', badge: 'Anxiety-Free' },
                    { id: 'bulk_csv', label: '📂 Bulk CSV Student Roster Upload for Teachers', badge: 'Educator Tool' },
                    { id: 'advanced_curriculum', label: '📐 Fractions, Decimals, Percentages & Negative Numbers', badge: 'Grades 5-8' },
                    { id: 'printable_pdf', label: '🖨️ Printable 1-Page PDF Diagnostic Reports for Parents', badge: 'Reports' },
                    { id: 'more_modes', label: '🕹️ More Arcade Mini-Games & Boss Battle Duels', badge: 'Fun' }
                  ].map((opt) => (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => setTopMissingFeature(opt.id as any)}
                      className={`w-full p-3 rounded-2xl border-2 text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                        topMissingFeature === opt.id
                          ? 'bg-amber-50 border-amber-500 text-slate-950 shadow-sm scale-[1.01]'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span>{opt.label}</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold ml-2 shrink-0">
                        {opt.badge}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Question 4: Rock Shop & Reward Economy UX */}
            {currentStep === 4 && (
              <div className="space-y-3 animate-fade-in">
                <div className="space-y-1">
                  <span className="text-[11px] font-black text-purple-600 uppercase tracking-wider flex items-center gap-1">
                    <ShoppingBag size={13} /> Question 4 of 5 • Shop & Rewards
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">
                    How would you improve the Rock Shop and Reward Experience?
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-2 pt-1">
                  {[
                    { id: 'love_rewards', label: '🎸 Love it — Unlocking instruments & badges is awesome!' },
                    { id: 'needs_confirm_popup', label: '⚠️ Add an "Are you sure?" confirmation before spending coins' },
                    { id: 'more_outfits', label: '👕 Want more customizable rocker outfits, hairstyles & guitars' },
                    { id: 'coins_too_hard', label: '💰 Increase match reward coins so younger kids can buy gear faster' }
                  ].map((opt) => (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => setShopFeedback(opt.id as any)}
                      className={`w-full p-3 rounded-2xl border-2 text-left text-xs font-bold transition-all cursor-pointer ${
                        shopFeedback === opt.id
                          ? 'bg-amber-50 border-amber-500 text-slate-950 shadow-sm scale-[1.01]'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Question 5: Developer Priority Area */}
            {currentStep === 5 && (
              <div className="space-y-3 animate-fade-in">
                <div className="space-y-1">
                  <span className="text-[11px] font-black text-indigo-600 uppercase tracking-wider flex items-center gap-1">
                    <Sliders size={13} /> Question 5 of 5 • Dev Priority
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">
                    Which single improvement should Jesse and the team build next?
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-2 pt-1">
                  {[
                    { id: 'tablet_touch_fix', label: '🚀 Tablet Touch Screen & Keypad Latency Optimization', prio: 'Speed' },
                    { id: 'untimed_mode', label: '🧘 Untimed Zen Mode & Anxiety-Free Practice Rounds', prio: 'Inclusivity' },
                    { id: 'teacher_csv_tools', label: '👩‍🏫 Teacher Bulk CSV Roster Import & Class Management', prio: 'Schools' },
                    { id: 'grades_5_8_math', label: '📚 Upper Grade Arithmetic (Fractions, Decimals, Algebra)', prio: 'Curriculum' },
                    { id: 'offline_polish', label: '💾 Offline Mode Asset Caching & Sound Polish', prio: 'Reliability' }
                  ].map((opt) => (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => setDeveloperPriority(opt.id as any)}
                      className={`w-full p-3 rounded-2xl border-2 text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                        developerPriority === opt.id
                          ? 'bg-indigo-50 border-indigo-500 text-slate-950 shadow-sm scale-[1.01]'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span>{opt.label}</span>
                      <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-bold ml-2 shrink-0">
                        {opt.prio}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft size={14} /> Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="text-xs text-slate-400 hover:text-slate-600 font-bold underline cursor-pointer"
                >
                  Skip & don't show again
                </button>
              )}

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => prev + 1)}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer ml-auto"
                >
                  Next <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer ml-auto hover:scale-105 transition-all"
                >
                  <CheckCircle2 size={15} /> Submit Feedback
                </button>
              )}
            </div>
          </form>
        )}

        {/* Footer Note */}
        <div className="pt-2 text-center text-[11px] text-slate-400 font-medium">
          🔒 Responses are completely anonymous and feed into the public <strong>Survey Hub</strong> analytics.
        </div>
      </motion.div>
    </div>
  );
}

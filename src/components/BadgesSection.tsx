import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Award, Calendar, Sparkles, Lock, Flame, Target, Zap, Clock, Download, FileText } from 'lucide-react';
import { UserStats, Difficulty } from '../types';
import { cn } from '../lib/utils';
import { Badge, CORE_BADGES } from '../lib/badges';
import { getWeeklyData } from '../lib/dateUtils';
const CertificateModal = React.lazy(() => import('./CertificateModal'));

// Helper to calculate the current calendar week data key (e.g. "2026-W25")
const weeklyData = getWeeklyData();
const { weekKey, currentChallenge, daysLeft, weekNumber } = weeklyData;

interface BadgesSectionProps {
  stats: UserStats;
  username: string;
  onClaimWeeklyBadge: () => void;
}

export default function BadgesSection({ stats, username, onClaimWeeklyBadge }: BadgesSectionProps) {
  if (!stats) return null;
  const [showCert, setShowCert] = React.useState(false);
  const hasGrandMaster = stats.totalSolved >= 200 || (stats.unlockedBadges && stats.unlockedBadges.includes('grand_master')) || (CORE_BADGES.find(b => b.id === "grand_master")?.checkUnlocked(stats)) || false;
  const { weekKey, currentChallenge, daysLeft } = getWeeklyData();
  
  // Calculate weekly stats
  const weeklyProgress = stats.weeklyProgress?.weekKey === weekKey 
    ? stats.weeklyProgress 
    : { weekKey, solvedThisWeek: 0, xpThisWeek: 0, claimedWeeklyBadge: false };

  const currentSolved = weeklyProgress.solvedThisWeek;
  const targetSolved = currentChallenge.requirement;
  const percentComplete = Math.min(100, Math.round((currentSolved / targetSolved) * 100));
  const canClaim = currentSolved >= targetSolved && !weeklyProgress.claimedWeeklyBadge;
  const isClaimed = !!weeklyProgress.claimedWeeklyBadge;

  // Track unlocked core badges
  const unlockedCoreIDs = stats.unlockedBadges || [];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-brand-accent">
          <Sparkles className="animate-pulse" size={20} />
          <span className="text-xs uppercase tracking-wider font-bold">Rewards & Achievements</span>
        </div>
        <h2 className="text-4xl font-display font-black tracking-tight">
          GENIUS BADGES <span className="text-brand-primary">SHELF</span>
        </h2>
        <div className="bg-white/5 border border-deep-navy border-4 p-4 rounded-xl mt-4 text-left">
          <h3 className="font-bold text-deep-navy mb-2">Badges & Quests Rules</h3>
          <ul className="text-sm text-deep-navy/70 space-y-4 font-bold list-decimal pl-4">
            <li>
              <strong>Earning Badges:</strong> Badges are prestigious rewards earned by achieving specific milestones within the Jesse Math FC pitch. These milestones cover various categories such as maintaining long streaks of correct answers, achieving perfect accuracy in sessions, or solving problems in advanced difficulty modes (Hard/Extreme). Each badge represents a specific type of mastery.
            </li>
            <li>
              <strong>Weekly Quests:</strong> Weekly Quests represent dynamic, time-sensitive challenges that refresh on a weekly basis. These tasks are specifically designed to test different skills and encourage consistent practice. Successfully completing all objectives within a Weekly Quest awards a significant bonus to your experience points (XP), allowing you to level up much faster than through standard play alone.
            </li>
            <li>
              <strong>Legendary Striker Title:</strong> The 'Legendary Striker' title is the pinnacle of the Jesse Math FC pitch journey. This exclusive rank is reserved only for players who have demonstrated complete mastery of the system by solving 200 individual math problems. As a testament to your unparalleled dedication and skill, achieving this status unlocks a custom, printable PDF certificate signed by Jesse Math FC, commemorating your mathematical mastery.
            </li>
          </ul>
        </div>
        <p className="text-deep-navy text-sm max-w-lg">
          We are young genius! Tackle weekly accomplishments and perfect your math score to unlock sparkly awards for your trophy room.
        </p>
      </div>

      {/* Grid of accomplishments */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Weekly Quest Card */}
        <div className="lg:col-span-1 glass relative overflow-hidden rounded-3xl border border-deep-navy border-4 p-6 flex flex-col justify-between bg-gradient-to-b from-brand-secondary/15 via-transparent to-brand-primary/10">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-brand-secondary/20 rounded-full text-[10px] font-black tracking-widest text-brand-secondary uppercase border border-brand-secondary/30">
                Weekly Quest ⚡️
              </span>
              <div className="flex items-center gap-1.5 text-xs text-deep-navy font-bold bg-white/5 py-1 px-2.5 rounded-full">
                <Clock size={12} className="text-brand-accent" />
                <span>{daysLeft} days left</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-4xl font-black">{currentChallenge.emoji}</div>
              <h3 className="text-xl font-display font-black tracking-tight">{currentChallenge.title}</h3>
              <p className="text-deep-navy text-xs leading-relaxed font-medium">
                {currentChallenge.description}
              </p>
            </div>

            {/* Progress Meter */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-deep-navy">Weekly Solve Progress</span>
                <span className="text-brand-accent">{currentSolved} / {targetSolved} Solved</span>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-deep-navy border-4">
                <div 
                  style={{ width: `${percentComplete}%` }} 
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    percentComplete >= 100 
                      ? "bg-gradient-to-r from-emerald-400 to-teal-500" 
                      : "bg-gradient-to-r from-brand-secondary to-brand-accent"
                  )}
                />
              </div>
            </div>
          </div>

          <div className="pt-6">
            {isClaimed ? (
              <div className="w-full py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl font-black text-xs text-center uppercase tracking-wider flex items-center justify-center gap-2">
                🏆 Badge Claimed & Added to Shelf!
              </div>
            ) : canClaim ? (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onClaimWeeklyBadge}
                className="w-full py-3.5 bg-gradient-to-r from-brand-primary to-brand-secondary text-deep-navy font-black rounded-xl text-center shadow-lg shadow-brand-primary/20 hover:shadow-brand-secondary/30 cursor-pointer text-sm tracking-wide uppercase flex items-center justify-center gap-2"
              >
                <Sparkles size={16} /> Claim Weekly Badge!
              </motion.button>
            ) : (
              <div className="w-full py-3 bg-white/5 border border-deep-navy border-4 text-slate-500 rounded-xl font-bold text-xs text-center uppercase tracking-wider">
                🔒 Keep Solving in pitch to Unlock
              </div>
            )}
          </div>
        </div>

        {/* Badges Collection Shelf Grid */}
        <div className="lg:col-span-2 glass rounded-3xl border border-deep-navy border-4 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-deep-navy border-4 pb-4">
            <h3 className="font-display font-black text-lg tracking-tight flex items-center gap-2">
              <Award className="text-brand-primary" /> Core Achievements
            </h3>
            <span className="text-xs text-deep-navy font-bold">
              Unlocked: {CORE_BADGES.filter(b => b.checkUnlocked(stats)).length} / {CORE_BADGES.length}
            {hasGrandMaster && (
              <button onClick={() => setShowCert(true)} className="ml-4 px-3 py-1.5 bg-amber-500 text-amber-950 font-bold rounded-lg text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:scale-105 transition-all flex items-center gap-1"><FileText size={14} /> Legendary Striker Certificate</button>
            )}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {CORE_BADGES.map((badge) => {
              const isUnlocked = badge.checkUnlocked(stats);
              
              return (
                <div 
                  key={badge.id}
                  className={cn(
                    "relative p-4 rounded-2xl flex items-center gap-4 border transition-all",
                    isUnlocked 
                      ? "bg-white/5 border-deep-navy border-4 hover:bg-white/[0.08]" 
                      : "bg-black/20 border-deep-navy border-4 opacity-60"
                  )}
                >
                  {/* Badge Circle Visual */}
                  <div className={cn(
                    "w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center text-3xl shadow-md",
                    isUnlocked 
                      ? `bg-gradient-to-tr ${badge.color} text-deep-navy` 
                      : "bg-white/5 text-slate-700"
                  )}>
                    {isUnlocked ? badge.emoji : <Lock size={20} />}
                  </div>

                  {/* Badge Label and Goal */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <p className={cn(
                        "font-display font-black text-sm",
                        isUnlocked ? "text-slate-100" : "text-slate-500"
                      )}>{badge.title}</p>
                      {isUnlocked && (
                        <span className="text-[9px] bg-brand-primary/20 text-brand-primary px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
                          Earned
                        </span>
                      )}
                    </div>
                    <p className="text-deep-navy text-[11px] leading-relaxed font-medium">
                      {badge.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Dynamic Celebration Modal or Banner when claiming a Weekly Badge */}
      <div className="glass p-6 rounded-3xl border border-deep-navy border-4 bg-gradient-to-r from-teal-500/5 to-cyan-500/5 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center sm:text-left">
          <h4 className="font-bold text-lg flex items-center justify-center sm:justify-start gap-2">
            🥇 Looking for more accomplishments?
          </h4>
          <p className="text-xs text-deep-navy font-medium max-w-xl">
            You earn **100 XP** instantly for every badge unlocked! Earn badges to jump multiple levels and unlock special crown symbols in the Young Genius pitch.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 py-2 px-4 rounded-2xl border border-deep-navy border-4">
          <Zap className="text-yellow-400 animate-bounce" size={20} />
          <span className="text-xs font-black text-deep-navy">Level Boost Factor: x1.5 active</span>
        </div>
      </div>
          <CertificateModal 
            isOpen={showCert} 
            onClose={() => setShowCert(false)} 
            username={username} 
            totalSolved={stats.totalSolved}
            correctAnswers={stats.correctAnswers}
          />
    </div>
  );
}

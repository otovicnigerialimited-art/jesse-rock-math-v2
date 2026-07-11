import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Gamepad2, Lock, ArrowLeft, Trophy } from 'lucide-react';
import { UserStats } from '../types';

interface FunArcadeProps {
  stats: UserStats | undefined;
  onExit: () => void;
}

const ARCADE_GAMES = [
  { 
    id: '1', 
    title: 'Kind Kingdom', 
    url: 'https://beinternetawesome.withgoogle.com/en_uk/interland/kind-kingdom',
    description: 'It’s cool to be kind. Spread good vibes and block bullies on your way to the top of the kingdom.',
    rating: 'Everyone',
    source: 'Google Interland'
  },
  { 
    id: '2', 
    title: 'Reality River', 
    url: 'https://beinternetawesome.withgoogle.com/en_uk/interland/reality-river',
    description: 'Don’t fall for fake! Cross the river by answering questions about phishing and scams.',
    rating: 'Everyone',
    source: 'Google Interland'
  },
  { 
    id: '5', 
    title: 'Canoe Penguins', 
    url: 'https://www.arcademics.com/games/canoe-penguins',
    description: 'A high-speed arithmetic canoe race! Answer correctly to power your team to the finish line.',
    rating: 'Everyone',
    source: 'Arcademics'
  },
  { 
    id: '6', 
    title: 'Toad Hop', 
    url: 'https://www.arcademics.com/games/toad',
    description: 'Help your toad hop across the pond by solving math problems faster than your opponents.',
    rating: 'Everyone',
    source: 'Arcademics'
  },
  { 
    id: '7', 
    title: 'Snow Sprint', 
    url: 'https://www.arcademics.com/games/snow-sprint',
    description: 'Rev up your snowmobile! Solve math equations to boost your speed in this icy race.',
    rating: 'Everyone',
    source: 'Arcademics'
  },
  { 
    id: '8', 
    title: 'Speedway', 
    url: 'https://www.arcademics.com/games/speedway',
    description: 'Formula 1 math racing! Precision and speed are key to winning the Grand Prix.',
    rating: 'Everyone',
    source: 'Arcademics'
  },
  { 
    id: '3', 
    title: 'Mindful Mountain', 
    url: 'https://beinternetawesome.withgoogle.com/en_uk/interland/mindful-mountain',
    description: 'Share with care. Learn to share posts only with the right people to protect your privacy.',
    rating: 'Everyone',
    source: 'Google Interland'
  },
  { 
    id: '4', 
    title: 'Tower of Treasure', 
    url: 'https://beinternetawesome.withgoogle.com/en_uk/interland/tower-of-treasure',
    description: 'Secure your secrets. Build strong passwords to protect your treasure from hackers.',
    rating: 'Everyone',
    source: 'Google Interland'
  }
];

export default function FunArcade({ stats, onExit }: FunArcadeProps) {
  const currentStreak = stats?.streak || 0;
  const isUnlocked = currentStreak >= 200;

  if (!isUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative"
        >
          <div className="absolute -inset-4 bg-red-500/20 blur-xl rounded-full" />
          <Lock size={80} className="text-red-500 relative z-10" />
        </motion.div>
        
        <h2 className="text-3xl font-display font-black text-deep-navy uppercase">Arcade Locked</h2>
        <p className="text-sm font-medium text-slate-600 max-w-md mx-auto">
          The Fun Arcade is a highly classified, ultra-exclusive zone. Only Rockstars with a 
          <strong className="text-action-orange text-lg mx-1">200</strong> 
          current correct answer streak can break open these doors.
        </p>
        
        <div className="bg-white/80 p-6 rounded-3xl border-4 border-deep-navy shadow-hard mt-8 max-w-xs w-full">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-deep-navy">Current Streak</span>
            <span className="text-sm font-black text-brand-secondary">{currentStreak} / 200</span>
          </div>
          <div className="h-4 bg-slate-200 rounded-full border-2 border-deep-navy overflow-hidden">
            <div 
              className="h-full bg-brand-secondary transition-all duration-500"
              style={{ width: `${Math.min(100, (currentStreak / 200) * 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 font-bold mt-3 uppercase tracking-wider">Keep pushing!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-action-orange to-amber-500 p-8 rounded-[2rem] border-4 border-deep-navy shadow-[8px_8px_0px_rgba(15,23,42,1)] text-white relative overflow-hidden">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -right-10 -top-10 opacity-20"
        >
          <Gamepad2 size={200} />
        </motion.div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Trophy className="text-white" size={24} />
            </div>
            <h2 className="text-3xl font-display font-black uppercase tracking-tight">The Fun Arcade</h2>
          </div>
          <p className="font-medium max-w-xl text-white/90 leading-relaxed text-sm">
            Welcome to the secret zone! Your massive 200+ streak has unlocked this exclusive area. 
            Kick back, relax, and play some epic games to celebrate your genius math skills!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {ARCADE_GAMES.map((game) => (
          <motion.a
            href={game.url}
            target="_blank"
            rel="noopener noreferrer"
            key={game.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex flex-col p-8 bg-white border-4 border-deep-navy rounded-3xl shadow-[4px_4px_0px_rgba(15,23,42,1)] hover:shadow-[8px_8px_0px_rgba(15,23,42,1)] hover:-translate-y-1 transition-all group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-sky-blue/20 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-action-orange/20 transition-colors">
                <Gamepad2 size={32} className="text-deep-navy group-hover:text-action-orange transition-colors" />
              </div>
              <div>
                <h3 className="font-black text-deep-navy text-xl">{game.title}</h3>
                <span className="inline-block bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 uppercase tracking-wider border border-slate-200">
                  Rated: {game.rating}
                </span>
              </div>
            </div>
            <p className="text-sm font-medium text-slate-600 leading-relaxed flex-1 mb-4">
              {game.description}
            </p>
            <span className="text-xs font-bold text-action-orange uppercase tracking-wider flex items-center gap-1 group-hover:gap-2 transition-all">
              Play on {game.source} <ArrowLeft size={14} className="rotate-180" />
            </span>
          </motion.a>
        ))}
      </div>
    </div>
  );
}

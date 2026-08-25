import React from 'react';
import { motion } from 'motion/react';
import { Delete, Check, Star } from 'lucide-react';
import { cn } from '../lib/utils';

interface RockstarKeypadProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  showFraction?: boolean;
}

export default function RockstarKeypad({ value, onChange, onSubmit, showFraction = true }: RockstarKeypadProps) {
  const handleDigit = (digit: string) => {
    if (value.length < 8) {
      onChange(value + digit);
    }
  };

  const handleDelete = () => {
    if (value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <div className="bg-slate-950 border-4 border-amber-400 rounded-[2rem] p-5 shadow-[0_16px_32px_rgba(0,0,0,0.8),0_0_20px_rgba(245,158,11,0.2)] max-w-sm mx-auto select-none relative overflow-hidden">
      {/* Decorative Rockstar Decals */}
      <div className="absolute top-1 left-2 text-amber-500/20 rotate-12">
        <Star size={24} fill="currentColor" />
      </div>
      <div className="absolute bottom-1 right-2 text-amber-500/20 -rotate-12">
        <Star size={24} fill="currentColor" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Row 1-3: Numbers 1-9 */}
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <motion.button
            key={num}
            type="button"
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.03 }}
            onClick={() => handleDigit(String(num))}
            className="h-16 bg-gradient-to-b from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-display font-black text-3xl rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-[0_4px_0_#9a3412] active:translate-y-[2px] active:shadow-[0_2px_0_#9a3412] border border-amber-300/40 touch-manipulation"
          >
            {num}
          </motion.button>
        ))}

        {/* Row 4: Custom controls */}
        {/* CLEAR button */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.03 }}
          onClick={handleClear}
          className="h-16 bg-gradient-to-b from-rose-500 to-red-700 hover:from-rose-400 hover:to-red-600 text-white font-display font-black text-sm rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-[0_4px_0_#991b1b] active:translate-y-[2px] active:shadow-[0_2px_0_#991b1b] border border-rose-400/40 touch-manipulation uppercase tracking-wider"
        >
          Clear
        </motion.button>

        {/* 0 digit */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.03 }}
          onClick={() => handleDigit('0')}
          className="h-16 bg-gradient-to-b from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-display font-black text-3xl rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-[0_4px_0_#9a3412] active:translate-y-[2px] active:shadow-[0_2px_0_#9a3412] border border-amber-300/40 touch-manipulation"
        >
          0
        </motion.button>

        {/* Backspace/Delete button */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.03 }}
          onClick={handleDelete}
          className="h-16 bg-gradient-to-b from-slate-600 to-slate-800 hover:from-slate-500 hover:to-slate-700 text-white font-display font-black rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-[0_4px_0_#1e293b] active:translate-y-[2px] active:shadow-[0_2px_0_#1e293b] border border-slate-600/40 touch-manipulation"
        >
          <Delete size={24} />
        </motion.button>
      </div>

      {/* Row 5: Large interactive action block */}
      <div className="grid grid-cols-4 gap-3 mt-3">
        {/* Fraction symbol '/' */}
        {showFraction ? (
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.03 }}
            onClick={() => handleDigit('/')}
            className="h-16 bg-gradient-to-b from-violet-500 to-indigo-600 hover:from-violet-400 hover:to-indigo-500 text-white font-display font-black text-2xl rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-[0_4px_0_#3730a3] active:translate-y-[2px] active:shadow-[0_2px_0_#3730a3] border border-violet-400/40 touch-manipulation"
          >
            /
          </motion.button>
        ) : (
          <div className="h-16" />
        )}

        {/* Submit GO! button */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.03 }}
          onClick={onSubmit}
          className={cn(
            "h-16 bg-gradient-to-b from-emerald-400 to-teal-600 hover:from-emerald-300 hover:to-teal-500 text-slate-950 font-display font-black text-2xl rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-[0_4px_0_#065f46] active:translate-y-[2px] active:shadow-[0_2px_0_#065f46] border border-emerald-300/40 touch-manipulation",
            showFraction ? "col-span-3" : "col-span-4"
          )}
        >
          <span className="mr-1.5 font-black uppercase tracking-widest text-lg">ENTER</span>
          <Check size={24} strokeWidth={3} />
        </motion.button>
      </div>
    </div>
  );
}

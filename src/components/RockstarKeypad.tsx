import React from 'react';
import { motion } from 'motion/react';
import { Delete, Check } from 'lucide-react';

interface RockstarKeypadProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
}

export default function RockstarKeypad({ value, onChange, onSubmit }: RockstarKeypadProps) {
  const handleDigit = (digit: string) => {
    if (value.length < 6) {
      onChange(value + digit);
    }
  };

  const handleDelete = () => {
    if (value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="bg-slate-900 border-4 border-amber-500/40 rounded-[2.5rem] p-4 shadow-2xl max-w-xs mx-auto select-none">
      <div className="grid grid-cols-3 gap-2.5">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'DEL', 'OK'].map((key) => {
          if (key === 'DEL') {
            return (
              <motion.button
                key={key}
                type="button"
                whileTap={{ scale: 1.25 }}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                onClick={handleDelete}
                className="h-14 bg-rose-600/90 hover:bg-rose-600 text-white font-black rounded-2xl flex items-center justify-center transition-colors shadow-lg cursor-pointer text-sm"
              >
                <Delete size={20} />
              </motion.button>
            );
          }
          if (key === 'OK') {
            return (
              <motion.button
                key={key}
                type="button"
                whileTap={{ scale: 1.25 }}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                onClick={onSubmit}
                className="h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl flex items-center justify-center transition-colors shadow-lg cursor-pointer text-sm"
              >
                <Check size={22} />
              </motion.button>
            );
          }
          return (
            <motion.button
              key={key}
              type="button"
              whileTap={{ scale: 1.25, backgroundColor: "#f59e0b", color: "#0f172a" }}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              onClick={() => handleDigit(key)}
              className="h-14 bg-slate-800 hover:bg-slate-700 text-white font-display font-black text-2xl rounded-2xl flex items-center justify-center shadow-md cursor-pointer border border-slate-700"
            >
              {key}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

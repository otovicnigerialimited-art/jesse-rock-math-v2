import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface InfoCardProps {
  title: string;
  rules: string[];
}

export default function InfoCard({ title, rules }: InfoCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-brand-primary text-xs font-bold uppercase tracking-widest bg-brand-primary/10 px-3 py-1.5 rounded-lg hover:bg-brand-primary/20 transition-all"
      >
        <HelpCircle size={14} />
        {isOpen ? "Hide Rules" : "Show Rules"}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 mt-2 z-20 w-72 glass p-4 rounded-2xl shadow-xl border border-deep-navy border-4"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-deep-navy">{title}</h3>
              <button onClick={() => setIsOpen(false)} className="text-deep-navy/50 hover:text-deep-navy"><X size={16} /></button>
            </div>
            <ul className="space-y-2">
              {rules.map((rule, idx) => (
                <li key={idx} className="text-xs text-deep-navy/70 leading-relaxed flex gap-2">
                  <span className="text-brand-primary font-bold">•</span>
                  {rule}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

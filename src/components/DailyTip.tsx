import React from 'react';
import { Lightbulb, Sparkles } from 'lucide-react';

const TIPS = [
  "Did you know? Multiplying by 5 is the same as multiplying by 10 and then dividing by 2!",
  "Pro Tip: To multiply a number by 11, add the two digits and put the sum in the middle!",
  "Strategy: When adding large numbers, try rounding them to the nearest 10 to estimate first.",
  "Math Fact: A 'googol' is a 1 followed by 100 zeros!",
  "Genius Move: Solving math problems daily is like a workout for your brain muscles.",
  "Fun Fact: The only number that has the same number of letters as its value is FOUR.",
  "Mystery: A 'Prime Number' can only be divided by 1 and itself. Can you find one?"
];

export default function DailyTip() {
  const [tip, setTip] = React.useState('');

  React.useEffect(() => {
    const randomTip = TIPS[Math.floor(Math.random() * TIPS.length)];
    setTip(randomTip);
  }, []);

  return (
    <div className="p-4 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-brand-primary/20 flex items-center justify-center text-brand-primary shrink-0">
        <Lightbulb size={18} />
      </div>
      <div className="space-y-1">
        <h4 className="text-[10px] font-black text-brand-primary uppercase tracking-widest flex items-center gap-1">
          <Sparkles size={10} /> Genius Tip of the Day
        </h4>
        <p className="text-xs text-deep-navy font-bold leading-tight">
          {tip}
        </p>
      </div>
    </div>
  );
}

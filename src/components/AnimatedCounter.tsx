import React, { useEffect, useRef } from 'react';
import { useMotionValue, useSpring, animate } from 'motion/react';

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export default function AnimatedCounter({ value, suffix = '', prefix = '', className = '' }: AnimatedCounterProps) {
  const motionValue = useMotionValue(0);
  
  // Set up a physical spring for delightful elastic motion when updating scores
  const springValue = useSpring(motionValue, {
    damping: 25,
    stiffness: 120,
    mass: 0.8
  });
  
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Smoothly animate the underlying motion value to the new target
    const controls = animate(motionValue, value, {
      duration: 1.0,
      ease: 'easeOut'
    });
    return () => controls.stop();
  }, [value, motionValue]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      if (spanRef.current) {
        spanRef.current.textContent = `${prefix}${Math.floor(latest).toLocaleString()}${suffix}`;
      }
    });
    return () => unsubscribe();
  }, [springValue, prefix, suffix]);

  return (
    <span ref={spanRef} className={className}>
      {prefix}{value.toLocaleString()}{suffix}
    </span>
  );
}

'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

interface ThemeToggleProps {
  className?: string;
  variant?: 'minimal' | 'immersive' | 'default';
}

export default function ThemeToggle({ className = '', variant = 'default' }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div 
        className={`w-10 h-10 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] opacity-50 ${className}`} 
        aria-hidden="true" 
      />
    );
  }

  const isDark = resolvedTheme === 'dark';
  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={`relative w-10 h-10 rounded-full flex items-center justify-center border border-[var(--border-subtle)] hover:border-[var(--border-strong)] bg-[var(--bg-surface)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] transition-all duration-300 shadow-sm hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] active:scale-95 group ${className}`}
    >
      <div className="relative w-5 h-5 flex items-center justify-center overflow-hidden">
        {/* Sun Icon */}
        <motion.div
          initial={false}
          animate={{
            scale: isDark ? 0 : 1,
            rotate: isDark ? 90 : 0,
            opacity: isDark ? 0 : 1,
          }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { type: 'spring', stiffness: 300, damping: 20 }
          }
          className="absolute inset-0 flex items-center justify-center"
        >
          <Sun className="w-4 h-4 text-amber-500 transition-transform group-hover:rotate-45 duration-300" />
        </motion.div>

        {/* Moon Icon */}
        <motion.div
          initial={false}
          animate={{
            scale: isDark ? 1 : 0,
            rotate: isDark ? 0 : -90,
            opacity: isDark ? 1 : 0,
          }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { type: 'spring', stiffness: 300, damping: 20 }
          }
          className="absolute inset-0 flex items-center justify-center"
        >
          <Moon className="w-4 h-4 text-zinc-200 transition-transform group-hover:-rotate-12 duration-300" />
        </motion.div>
      </div>
      
      {/* Subtle hover glow / halo */}
      <span 
        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none -z-10 blur-[6px] bg-[var(--glow-color)]" 
      />
    </button>
  );
}

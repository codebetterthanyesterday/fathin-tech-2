'use client';

import { Suspense, useTransition } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';

interface LanguageSwitcherProps {
  variant?: 'minimal' | 'immersive';
  compact?: boolean;
}

function LanguageSwitcherContent({
  variant = 'minimal',
  compact = false,
}: LanguageSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const prefersReducedMotion = useReducedMotion();

  const switchLocale = (nextLocale: 'id' | 'en') => {
    if (nextLocale === locale) return;

    startTransition(() => {
      // Reconstruct query parameters if any exist
      const queryString = searchParams?.toString();
      const target = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(target, { locale: nextLocale });
    });
  };

  return (
    <div
      className={`inline-flex items-center rounded-full p-0.5 border border-[var(--border-subtle)] bg-[var(--bg-surface)] backdrop-blur-md shadow-sm transition-opacity ${
        isPending ? 'opacity-70 pointer-events-none' : ''
      }`}
      role="group"
      aria-label="Language selection"
    >
      <button
        type="button"
        onClick={() => switchLocale('id')}
        className={`relative px-2.5 py-1 text-xs font-semibold rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] ${
          locale === 'id'
            ? 'text-[var(--text-primary)] font-bold'
            : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
        }`}
        aria-pressed={locale === 'id'}
        aria-label="Ganti ke Bahasa Indonesia"
      >
        {locale === 'id' && (
          <motion.div
            layoutId="lang-pill"
            className="absolute inset-0 rounded-full bg-[var(--bg-card-hover)] border border-[var(--border-strong)] shadow-sm"
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { type: 'spring', stiffness: 500, damping: 35 }
            }
          />
        )}
        <span className="relative z-10 font-mono tracking-wide">ID</span>
      </button>

      <button
        type="button"
        onClick={() => switchLocale('en')}
        className={`relative px-2.5 py-1 text-xs font-semibold rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] ${
          locale === 'en'
            ? 'text-[var(--text-primary)] font-bold'
            : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
        }`}
        aria-pressed={locale === 'en'}
        aria-label="Switch to English"
      >
        {locale === 'en' && (
          <motion.div
            layoutId="lang-pill"
            className="absolute inset-0 rounded-full bg-[var(--bg-card-hover)] border border-[var(--border-strong)] shadow-sm"
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { type: 'spring', stiffness: 500, damping: 35 }
            }
          />
        )}
        <span className="relative z-10 font-mono tracking-wide">EN</span>
      </button>
    </div>
  );
}

export default function LanguageSwitcher(props: LanguageSwitcherProps) {
  return (
    <Suspense
      fallback={
        <div className="inline-flex items-center rounded-full p-0.5 border border-[var(--border-subtle)] bg-[var(--bg-surface)] h-7 w-16 animate-pulse" />
      }
    >
      <LanguageSwitcherContent {...props} />
    </Suspense>
  );
}

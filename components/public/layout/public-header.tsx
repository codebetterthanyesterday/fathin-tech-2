'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Menu, X } from 'lucide-react';
import ThemeToggle from './theme-toggle';
import LanguageSwitcher from './language-switcher';
import { motion, AnimatePresence } from 'framer-motion';

import SearchTrigger from '../search/search-trigger';

interface PublicHeaderProps {
  profileName?: string;
  tagline?: string;
  themeTemplate?: 'minimal' | 'immersive';
}

export default function PublicHeader({
  profileName = 'Portfolio',
  tagline,
  themeTemplate = 'minimal',
}: PublicHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = useTranslations('nav');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: t('articles'), href: '/articles' },
    { label: t('contact'), href: '#contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'py-3 bg-[var(--bg-elevated)]/85 backdrop-blur-xl border-b border-[var(--border-subtle)] shadow-sm'
          : 'py-5 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-12 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 text-[var(--text-primary)] font-bold tracking-tight text-lg sm:text-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] rounded-lg py-1 px-1.5"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-color)] group-hover:scale-125 transition-transform" />
          <span className="group-hover:opacity-80 transition-opacity">{profileName}</span>
        </Link>

        {/* Desktop Nav Actions */}
        <nav className="hidden md:flex items-center gap-5" aria-label="Main Navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] rounded-md"
            >
              {link.label}
            </Link>
          ))}

          {/* Search Trigger Button */}
          <SearchTrigger variant="compact" />

          {/* Language Switcher */}
          <LanguageSwitcher variant={themeTemplate} />

          {/* Divider */}
          <div className="h-4 w-px bg-[var(--border-subtle)]" />

          {/* Dark / Light Mode Toggle */}
          <ThemeToggle variant={themeTemplate} />
        </nav>

        {/* Mobile Actions */}
        <div className="flex md:hidden items-center gap-2">
          <SearchTrigger variant="icon" />
          <LanguageSwitcher variant={themeTemplate} compact />
          <ThemeToggle variant={themeTemplate} />

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 rounded-full flex items-center justify-center border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)]"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open navigation menu'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)] backdrop-blur-2xl px-6 py-6 overflow-hidden"
          >
            <div className="flex flex-col gap-4">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-[var(--text-primary)] py-2 border-b border-[var(--border-subtle)]"
              >
                {t('home')}
              </Link>
              <Link
                href="/articles"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] py-2 border-b border-[var(--border-subtle)]"
              >
                {t('articlesAndThoughts')}
              </Link>
              <Link
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] py-2"
              >
                {t('initiateContact')}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

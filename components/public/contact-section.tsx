'use client';

import { useState, useRef, useTransition, useEffect } from 'react';
import { motion, useReducedMotion, useInView } from 'framer-motion';
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { submitContact } from '@/app/actions/contact';
import { useTranslations } from 'next-intl';

// ==========================================
// Abstract Particle Effect (CSS/Framer)
// ==========================================
const Embers = () => {
  const prefersReducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted || prefersReducedMotion) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-[var(--text-primary)]/20 dark:bg-white/20 rounded-full blur-[0.5px]"
          initial={{
            opacity: 0,
            x: `${Math.random() * 100}%`,
            y: "100%",
            scale: Math.random() * 0.5 + 0.5,
          }}
          animate={{
            opacity: [0, 0.6, 0],
            y: ["100%", "-10%"],
            x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 8,
          }}
        />
      ))}
    </div>
  );
};

// ==========================================
// Main Contact Component
// ==========================================
export default function ContactSection() {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const t = useTranslations('contact');
  
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const handleSubmit = async (formData: FormData) => {
    setStatus('idle');
    setErrorMessage(null);
    setValidationErrors({});
    
    startTransition(async () => {
      const result = await submitContact(formData);
      
      if (result.success) {
        setStatus('success');
      } else {
        setStatus('error');
        if (result.error) setErrorMessage(result.error);
        if (result.validationErrors) setValidationErrors(result.validationErrors);
      }
    });
  };

  return (
    <section 
      id="contact"
      ref={sectionRef}
      className="relative min-h-[80vh] flex items-center justify-center py-28 px-4 sm:px-8 bg-[var(--bg-primary)] border-t border-[var(--border-subtle)] overflow-hidden"
    >
      {/* Background Metallic Gradient & Shield Lines */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-80"
        style={{ backgroundImage: 'var(--metallic-gradient)' }}
      />
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04] bg-[linear-gradient(45deg,transparent_25%,currentColor_25%,currentColor_50%,transparent_50%,transparent_75%,currentColor_75%,currentColor_100%)] bg-[length:4px_4px] pointer-events-none text-[var(--text-primary)]" />
      
      {/* Abstract Shield Decoration (SVG) */}
      <div className="absolute inset-0 flex justify-center items-center pointer-events-none opacity-15 dark:opacity-20" aria-hidden="true">
        <svg width="800" height="800" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-150 sm:scale-100 stroke-[var(--text-primary)]">
          <path d="M400 100L700 250V550L400 700L100 550V250L400 100Z" stroke="url(#paint0_linear)" strokeWidth="1" strokeDasharray="4 8"/>
          <path d="M400 50V750" stroke="url(#paint1_linear)" strokeWidth="1" strokeDasharray="4 8"/>
          <defs>
            <linearGradient id="paint0_linear" x1="400" y1="100" x2="400" y2="700" gradientUnits="userSpaceOnUse">
              <stop stopColor="currentColor" stopOpacity="0"/>
              <stop offset="0.5" stopColor="currentColor" stopOpacity="0.5"/>
              <stop offset="1" stopColor="currentColor" stopOpacity="0"/>
            </linearGradient>
            <linearGradient id="paint1_linear" x1="400" y1="50" x2="400" y2="750" gradientUnits="userSpaceOnUse">
              <stop stopColor="currentColor" stopOpacity="0"/>
              <stop offset="0.5" stopColor="currentColor" stopOpacity="0.3"/>
              <stop offset="1" stopColor="currentColor" stopOpacity="0"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

      <Embers />

      <motion.div 
        initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-xl mx-auto"
      >
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-[var(--text-primary)] to-[var(--text-secondary)] mb-4 uppercase">
            {t('title')}
          </h2>
          <p className="text-[var(--text-secondary)] font-medium tracking-wide">
            {t('subtitle')}
          </p>
        </div>

        {/* Success State */}
        {status === 'success' ? (
          <motion.div 
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-12 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-strong)] text-center flex flex-col items-center justify-center shadow-2xl relative overflow-hidden backdrop-blur-2xl"
          >
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--border-strong)] to-transparent" />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
            >
              <div className="w-20 h-20 bg-[var(--bg-surface)] rounded-full flex items-center justify-center mb-6 ring-1 ring-[var(--border-strong)] shadow-lg text-[var(--text-primary)]">
                <CheckCircle className="w-10 h-10" />
              </div>
            </motion.div>
            <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">{t('successTitle')}</h3>
            <p className="text-[var(--text-secondary)]">
              {t('successMessage')}
            </p>
            <button
              onClick={() => setStatus('idle')}
              className="mt-8 px-6 py-2.5 rounded-full text-sm font-medium bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-colors shadow-sm"
            >
              {t('newTransmission')}
            </button>
          </motion.div>
        ) : (
          <form 
            action={handleSubmit}
            className="p-6 sm:p-10 rounded-3xl bg-[var(--bg-card)] backdrop-blur-2xl border border-[var(--border-subtle)] shadow-2xl relative"
          >
            {/* Edge highlights */}
            <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-[var(--border-strong)] to-transparent" />
            <div className="absolute bottom-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-[var(--border-subtle)] to-transparent" />

            {errorMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-500 dark:text-red-300 leading-relaxed">{errorMessage}</p>
              </motion.div>
            )}

            <div className="space-y-6">
              {/* Honeypot Field - Visually hidden but focusable by bots */}
              <div className="absolute left-[-9999px]" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-xs font-bold tracking-widest text-[var(--text-tertiary)] uppercase mb-2">
                  {t('nameLabel')}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  disabled={isPending}
                  className={`w-full bg-[var(--bg-surface)] border ${validationErrors.name ? 'border-red-500/50 focus:border-red-500' : 'border-[var(--border-subtle)] focus:border-[var(--accent-color)]'} rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none transition-colors duration-300 shadow-inner focus:ring-1 focus:ring-[var(--accent-color)]`}
                  placeholder={t('namePlaceholder')}
                />
                {validationErrors.name && (
                  <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full" /> {validationErrors.name[0]}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-xs font-bold tracking-widest text-[var(--text-tertiary)] uppercase mb-2">
                  {t('emailLabel')}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  disabled={isPending}
                  className={`w-full bg-[var(--bg-surface)] border ${validationErrors.email ? 'border-red-500/50 focus:border-red-500' : 'border-[var(--border-subtle)] focus:border-[var(--accent-color)]'} rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none transition-colors duration-300 shadow-inner focus:ring-1 focus:ring-[var(--accent-color)]`}
                  placeholder={t('emailPlaceholder')}
                />
                {validationErrors.email && (
                  <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full" /> {validationErrors.email[0]}
                  </p>
                )}
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-xs font-bold tracking-widest text-[var(--text-tertiary)] uppercase mb-2">
                  {t('messageLabel')}
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  disabled={isPending}
                  className={`w-full bg-[var(--bg-surface)] border ${validationErrors.message ? 'border-red-500/50 focus:border-red-500' : 'border-[var(--border-subtle)] focus:border-[var(--accent-color)]'} rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none transition-colors duration-300 resize-none shadow-inner focus:ring-1 focus:ring-[var(--accent-color)]`}
                  placeholder={t('messagePlaceholder')}
                />
                {validationErrors.message && (
                  <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full" /> {validationErrors.message[0]}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isPending}
                className="group relative w-full overflow-hidden rounded-xl bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold uppercase tracking-widest text-sm py-4 transition-transform active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 shadow-lg hover:shadow-xl"
              >
                {/* Button Sheen Animation */}
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 dark:via-white/50 to-transparent skew-x-12 pointer-events-none" />
                
                <span className="relative flex items-center justify-center gap-2">
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('processing')}
                    </>
                  ) : (
                    <>
                      {t('sendPayload')}
                      <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </section>
  );
}

'use client';

import { useState, useRef, useTransition } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { submitContact } from '@/app/actions/contact';
import { useTranslations } from 'next-intl';

export default function MinimalContactSection() {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const t = useTranslations('contact');
  const prefersReducedMotion = useReducedMotion();

  const handleSubmit = async (formData: FormData) => {
    setStatus('idle');
    setErrorMessage(null);
    setValidationErrors({});

    startTransition(async () => {
      const result = await submitContact(formData);

      if (result.success) {
        setStatus('success');
        if (formRef.current) formRef.current.reset();
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
      className="py-24 px-4 sm:px-8 bg-[var(--bg-primary)] border-t border-[var(--border-subtle)] relative"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-14 max-w-2xl">
          <p className="text-xs font-mono uppercase tracking-widest text-[var(--text-tertiary)] mb-3">
            {t('minimalTitle')}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--text-primary)] tracking-tight">
            {t('minimalTitle')}
          </h2>
          <p className="text-[var(--text-secondary)] mt-4 text-base sm:text-lg leading-relaxed">
            {t('minimalSubtitle')}
          </p>
        </div>

        {/* Content Box */}
        {status === 'success' ? (
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="p-8 sm:p-12 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-left shadow-sm flex flex-col items-start gap-4 max-w-2xl"
          >
            <div className="w-12 h-12 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-text)] shadow-sm">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
              {t('minimalSuccessTitle')}
            </h3>
            <p className="text-[var(--text-secondary)] leading-relaxed max-w-xl">
              {t('minimalSuccessMessage')}
            </p>
            <button
              onClick={() => setStatus('idle')}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)]"
            >
              <span>{t('minimalNewMessage')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            {errorMessage && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-500 dark:text-red-400">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed">{errorMessage}</p>
              </div>
            )}

            <form ref={formRef} action={handleSubmit} className="space-y-6">
              {/* Honeypot Field */}
              <div className="absolute left-[-9999px]" aria-hidden="true">
                <label htmlFor="website-min">Website</label>
                <input type="text" id="website-min" name="website" tabIndex={-1} autoComplete="off" />
              </div>

              {/* Name Field */}
              <div>
                <label
                  htmlFor="name-min"
                  className="block text-sm font-medium text-[var(--text-primary)] mb-2"
                >
                  {t('minimalNameLabel')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name-min"
                  name="name"
                  required
                  disabled={isPending}
                  placeholder={t('minimalNamePlaceholder')}
                  className={`w-full px-4 py-3 rounded-xl bg-[var(--bg-surface)] border ${
                    validationErrors.name
                      ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500/20'
                      : 'border-[var(--border-subtle)] focus:border-[var(--border-strong)]'
                  } text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none transition-colors duration-200 text-sm shadow-sm focus:ring-2 focus:ring-[var(--accent-color)]/20`}
                />
                {validationErrors.name && (
                  <p className="mt-1.5 text-xs text-red-500">{validationErrors.name[0]}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email-min"
                  className="block text-sm font-medium text-[var(--text-primary)] mb-2"
                >
                  {t('minimalEmailLabel')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email-min"
                  name="email"
                  required
                  disabled={isPending}
                  placeholder={t('minimalEmailPlaceholder')}
                  className={`w-full px-4 py-3 rounded-xl bg-[var(--bg-surface)] border ${
                    validationErrors.email
                      ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500/20'
                      : 'border-[var(--border-subtle)] focus:border-[var(--border-strong)]'
                  } text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none transition-colors duration-200 text-sm shadow-sm focus:ring-2 focus:ring-[var(--accent-color)]/20`}
                />
                {validationErrors.email && (
                  <p className="mt-1.5 text-xs text-red-500">{validationErrors.email[0]}</p>
                )}
              </div>

              {/* Message Field */}
              <div>
                <label
                  htmlFor="message-min"
                  className="block text-sm font-medium text-[var(--text-primary)] mb-2"
                >
                  {t('minimalMessageLabel')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message-min"
                  name="message"
                  rows={5}
                  required
                  disabled={isPending}
                  placeholder={t('minimalMessagePlaceholder')}
                  className={`w-full px-4 py-3 rounded-xl bg-[var(--bg-surface)] border ${
                    validationErrors.message
                      ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500/20'
                      : 'border-[var(--border-subtle)] focus:border-[var(--border-strong)]'
                  } text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none transition-colors duration-200 text-sm resize-none shadow-sm focus:ring-2 focus:ring-[var(--accent-color)]/20`}
                />
                {validationErrors.message && (
                  <p className="mt-1.5 text-xs text-red-500">{validationErrors.message[0]}</p>
                )}
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[var(--text-primary)] text-[var(--bg-primary)] text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)]"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('processing')}</span>
                    </>
                  ) : (
                    <>
                      <span>{t('minimalSubmit')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </section>
  );
}

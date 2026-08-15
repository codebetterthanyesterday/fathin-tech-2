'use client';

import { useState, useRef, useTransition, useEffect } from 'react';
import { motion, useReducedMotion, useInView } from 'framer-motion';
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { submitContact } from '@/app/actions/contact';

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
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/20 rounded-full blur-[1px]"
          initial={{
            opacity: 0,
            x: `${Math.random() * 100}%`,
            y: "100%",
            scale: Math.random() * 0.5 + 0.5,
          }}
          animate={{
            opacity: [0, 0.8, 0],
            y: ["100%", "-10%"],
            x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 10,
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
      ref={sectionRef}
      className="relative min-h-[80vh] flex items-center justify-center py-24 px-4 sm:px-8 bg-[#050505] overflow-hidden"
    >
      {/* Background Metallic Gradient & Shield Lines */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/20 via-[#050505] to-[#050505] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(45deg,transparent_25%,white_25%,white_50%,transparent_50%,transparent_75%,white_75%,white_100%)] bg-[length:4px_4px] pointer-events-none" />
      
      {/* Abstract Shield Decoration (SVG) */}
      <div className="absolute inset-0 flex justify-center items-center pointer-events-none opacity-20" aria-hidden="true">
        <svg width="800" height="800" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-150 sm:scale-100">
          <path d="M400 100L700 250V550L400 700L100 550V250L400 100Z" stroke="url(#paint0_linear)" strokeWidth="1" strokeDasharray="4 8"/>
          <path d="M400 50V750" stroke="url(#paint1_linear)" strokeWidth="1" strokeDasharray="4 8"/>
          <defs>
            <linearGradient id="paint0_linear" x1="400" y1="100" x2="400" y2="700" gradientUnits="userSpaceOnUse">
              <stop stopColor="white" stopOpacity="0"/>
              <stop offset="0.5" stopColor="white" stopOpacity="0.5"/>
              <stop offset="1" stopColor="white" stopOpacity="0"/>
            </linearGradient>
            <linearGradient id="paint1_linear" x1="400" y1="50" x2="400" y2="750" gradientUnits="userSpaceOnUse">
              <stop stopColor="white" stopOpacity="0"/>
              <stop offset="0.5" stopColor="white" stopOpacity="0.3"/>
              <stop offset="1" stopColor="white" stopOpacity="0"/>
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
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 mb-4 uppercase">
            Initiate Contact
          </h2>
          <p className="text-zinc-400 font-medium tracking-wide">
            Open a secure channel. I usually respond within 24 hours.
          </p>
        </div>

        {/* Success State */}
        {status === 'success' ? (
          <motion.div 
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-12 rounded-2xl bg-gradient-to-b from-zinc-900 to-black border border-white/10 ring-1 ring-white/5 text-center flex flex-col items-center justify-center shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
            >
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 ring-1 ring-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
            </motion.div>
            <h3 className="text-2xl font-bold text-white mb-2">Message Transmitted</h3>
            <p className="text-zinc-400">
              The signal has been received. I will be in touch shortly.
            </p>
            <button
              onClick={() => setStatus('idle')}
              className="mt-8 px-6 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Send another message
            </button>
          </motion.div>
        ) : (
          <form 
            action={handleSubmit}
            className="p-6 sm:p-10 rounded-2xl bg-zinc-950/50 backdrop-blur-xl border border-white/5 shadow-2xl relative"
          >
            {/* Edge highlights */}
            <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="absolute bottom-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />

            {errorMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-lg bg-red-950/30 border border-red-900/50 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-500/80 shrink-0 mt-0.5" />
                <p className="text-sm text-red-200/80 leading-relaxed">{errorMessage}</p>
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
                <label htmlFor="name" className="block text-xs font-bold tracking-widest text-zinc-500 uppercase mb-2">
                  Identification
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  disabled={isPending}
                  className={`w-full bg-black/50 border ${validationErrors.name ? 'border-red-900/50 focus:border-red-500/50' : 'border-white/10 focus:border-[var(--accent-color)]/70'} rounded-none px-4 py-3 text-white placeholder:text-zinc-700 outline-none transition-colors duration-300 shadow-inner`}
                  placeholder="John Doe"
                />
                {validationErrors.name && (
                  <p className="mt-2 text-xs text-red-500/80 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500/80 rounded-full" /> {validationErrors.name[0]}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-xs font-bold tracking-widest text-zinc-500 uppercase mb-2">
                  Return Frequency (Email)
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  disabled={isPending}
                  className={`w-full bg-black/50 border ${validationErrors.email ? 'border-red-900/50 focus:border-red-500/50' : 'border-white/10 focus:border-[var(--accent-color)]/70'} rounded-none px-4 py-3 text-white placeholder:text-zinc-700 outline-none transition-colors duration-300 shadow-inner`}
                  placeholder="john@example.com"
                />
                {validationErrors.email && (
                  <p className="mt-2 text-xs text-red-500/80 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500/80 rounded-full" /> {validationErrors.email[0]}
                  </p>
                )}
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-xs font-bold tracking-widest text-zinc-500 uppercase mb-2">
                  Transmission payload
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  disabled={isPending}
                  className={`w-full bg-black/50 border ${validationErrors.message ? 'border-red-900/50 focus:border-red-500/50' : 'border-white/10 focus:border-[var(--accent-color)]/70'} rounded-none px-4 py-3 text-white placeholder:text-zinc-700 outline-none transition-colors duration-300 resize-none shadow-inner`}
                  placeholder="Specify the parameters of your inquiry..."
                />
                {validationErrors.message && (
                  <p className="mt-2 text-xs text-red-500/80 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500/80 rounded-full" /> {validationErrors.message[0]}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isPending}
                className="group relative w-full overflow-hidden bg-white text-black font-bold uppercase tracking-widest text-sm py-4 transition-transform active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
              >
                {/* Button Sheen Animation */}
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12" />
                
                <span className="relative flex items-center justify-center gap-2">
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Encrypting...
                    </>
                  ) : (
                    <>
                      Transmit
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

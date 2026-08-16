'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { forgotPassword, AuthActionState } from '@/app/actions/auth';
import { Loader2, ArrowRight, ArrowLeft, Mail, CheckCircle2, AlertCircle } from 'lucide-react';

const initialState: AuthActionState = {
  success: '',
  error: '',
};

export default function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(forgotPassword, initialState);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="w-full max-w-md p-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden group">
      {/* Subtle background glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      <div className="relative z-10">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-white transition-colors mb-6 group/back"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover/back:-translate-x-1 transition-transform" />
          Return to Authentication
        </Link>

        {state?.success ? (
          /* Success State */
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Reset Token Dispatched
              </h1>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {state.success}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400 space-y-1">
              <p className="font-semibold text-zinc-300">Security Protocol:</p>
              <p>Token valid for 60 minutes. Single-use only.</p>
            </div>

            <div className="pt-2">
              <Link
                href="/login"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white text-black font-semibold text-sm rounded-lg hover:bg-zinc-200 transition-colors shadow-sm"
              >
                Return to Authentication Interface
              </Link>
            </div>
          </div>
        ) : (
          /* Request Form */
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                Reset Credentials
              </h1>
              <p className="text-zinc-400 text-sm">
                Enter your administrative email to receive a secure recovery token.
              </p>
            </div>

            {state?.error && (
              <div className="flex items-center gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{state.error}</span>
              </div>
            )}

            <form action={formAction} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
                  Administrative Email
                </label>
                <div className="relative group/input">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-300"
                    placeholder="Enter registered address..."
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 active:scale-[0.98]"
              >
                {isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    <span>Dispatch Recovery Token</span>
                    <ArrowRight
                      className={`w-4 h-4 transition-transform duration-300 ${
                        isHovered ? 'translate-x-1' : ''
                      }`}
                    />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useActionState, useState, useMemo } from 'react';
import Link from 'next/link';
import { resetPassword, AuthActionState } from '@/app/actions/auth';
import {
  Loader2,
  ArrowRight,
  Lock,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';

const initialState: AuthActionState = {
  success: '',
  error: '',
};

interface ResetPasswordFormProps {
  token: string;
  isValid: boolean;
  email?: string;
  errorMessage?: string;
}

export default function ResetPasswordForm({
  token,
  isValid,
  email,
  errorMessage,
}: ResetPasswordFormProps) {
  const [state, formAction, isPending] = useActionState(resetPassword, initialState);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Monochromatic password strength calculation
  const strength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score; // 0 to 4
  }, [password]);

  const strengthLabel = useMemo(() => {
    if (password.length === 0) return '';
    if (strength <= 1) return 'Lemah (min 8 karakter)';
    if (strength === 2) return 'Cukup';
    if (strength === 3) return 'Kuat';
    return 'Sangat Kuat';
  }, [password, strength]);

  // If token is invalid or expired
  if (!isValid) {
    return (
      <div className="w-full max-w-md p-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mx-auto mb-6">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
          Tautan Tidak Valid
        </h1>
        <p className="text-zinc-400 text-sm leading-relaxed mb-8">
          {errorMessage ||
            'Tautan pemulihan kata sandi ini sudah kedaluwarsa (berlaku 1 jam) atau sudah pernah digunakan sebelumnya.'}
        </p>

        <div className="space-y-3">
          <Link
            href="/forgot-password"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white text-black font-semibold text-sm rounded-lg hover:bg-zinc-200 transition-colors shadow-sm"
          >
            Minta Tautan Baru
          </Link>
          <Link
            href="/login"
            className="w-full block py-2.5 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            Kembali ke Login
          </Link>
        </div>
      </div>
    );
  }

  // If password was successfully reset
  if (state?.success) {
    return (
      <div className="w-full max-w-md p-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto mb-6">
          <CheckCircle2 className="w-7 h-7" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
          Kata Sandi Berhasil Diubah!
        </h1>
        <p className="text-zinc-400 text-sm leading-relaxed mb-8">
          {state.success}
        </p>

        <Link
          href="/login"
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white text-black font-semibold text-sm rounded-lg hover:bg-zinc-200 transition-colors shadow-sm"
        >
          Masuk ke Dashboard
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  // Active form state (Token is valid)
  return (
    <div className="w-full max-w-md p-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      <div className="relative z-10">
        <div className="mb-6">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white mb-4">
            <KeyRound className="w-5 h-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1.5">
            Atur Ulang Password
          </h1>
          <p className="text-zinc-400 text-sm">
            {email ? `Memperbarui kata sandi untuk akun ${email}` : 'Masukkan kata sandi baru Anda.'}
          </p>
        </div>

        {state?.error && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-5">
          <input type="hidden" name="token" value={token} />

          {/* New Password */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-zinc-300">
              Password Baru (Min. 8 Karakter)
            </label>
            <div className="relative group/input">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-11 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-300"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                title={showPassword ? 'Sembunyikan' : 'Lihat'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Monochromatic Strength Meter */}
            {password.length > 0 && (
              <div className="pt-1.5 space-y-1.5 animate-in fade-in duration-300">
                <div className="flex gap-1.5 h-1">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`flex-1 rounded-full transition-all duration-500 ${
                        step <= strength
                          ? step === 4
                            ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]'
                            : 'bg-zinc-300'
                          : 'bg-zinc-800'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex justify-between items-center text-[11px] font-mono text-zinc-400">
                  <span>Kekuatan:</span>
                  <span className="text-zinc-300 font-semibold">{strengthLabel}</span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-300">
              Konfirmasi Password Baru
            </label>
            <div className="relative group/input">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-300"
                placeholder="••••••••"
              />
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-red-400 pt-0.5">Konfirmasi password belum cocok.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending || (password.length > 0 && password !== confirmPassword)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 active:scale-[0.98] mt-2"
          >
            {isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Simpan Password Baru</span>
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
    </div>
  );
}

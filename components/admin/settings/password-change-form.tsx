'use client';

import { useActionState, useState, useEffect } from 'react';
import { changePassword, AuthActionState } from '@/app/actions/auth';
import {
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';

const initialState: AuthActionState = {
  success: '',
  error: '',
  fieldErrors: {},
};

export default function PasswordChangeForm() {
  const [state, formAction, isPending] = useActionState(changePassword, initialState);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Clear fields on successful update
  useEffect(() => {
    if (state?.success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  }, [state?.success]);

  // Real-time strength calculator
  const calculateStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-zinc-800' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (pass.length >= 12) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score: 1, label: 'Lemah', color: 'bg-red-500' };
    if (score <= 3) return { score: 2, label: 'Cukup', color: 'bg-amber-500' };
    if (score <= 4) return { score: 3, label: 'Bagus', color: 'bg-blue-500' };
    return { score: 4, label: 'Sangat Kuat', color: 'bg-emerald-500' };
  };

  const strength = calculateStrength(newPassword);
  const isMatch = newPassword.length > 0 && confirmPassword.length > 0 && newPassword === confirmPassword;
  const isMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  return (
    <div className="p-8 bg-zinc-950/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden group">
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

      <div className="flex items-center gap-3 pb-6 border-b border-zinc-800">
        <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white">
          <KeyRound className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide">Security & Credentials</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Perbarui kata sandi akun admin untuk menjaga keamanan portal sistem.
          </p>
        </div>
      </div>

      {/* Global Alerts */}
      <div className="mt-6 space-y-3">
        {state?.error && (
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{state.error}</p>
          </div>
        )}

        {state?.success && (
          <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <p>{state.success}</p>
          </div>
        )}
      </div>

      <form action={formAction} className="mt-6 space-y-5">
        {/* Current Password */}
        <div className="space-y-2">
          <label htmlFor="currentPassword" className="block text-sm font-medium text-zinc-300">
            Password Saat Ini *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="currentPassword"
              name="currentPassword"
              type={showCurrentPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full pl-10 pr-10 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all text-sm font-mono"
              placeholder="Masukkan password Anda saat ini..."
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
              aria-label={showCurrentPassword ? 'Sembunyikan password' : 'Lihat password'}
            >
              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {state?.fieldErrors?.currentPassword && (
            <p className="text-red-400 text-xs mt-1">{state.fieldErrors.currentPassword[0]}</p>
          )}
        </div>

        {/* New Password */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="newPassword" className="block text-sm font-medium text-zinc-300">
              Password Baru *
            </label>
            {newPassword && (
              <span className="text-xs font-medium text-zinc-400">
                Kekuatan: <span className="font-semibold text-white">{strength.label}</span>
              </span>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
              <KeyRound className="w-4 h-4" />
            </div>
            <input
              id="newPassword"
              name="newPassword"
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="w-full pl-10 pr-10 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all text-sm font-mono"
              placeholder="Minimal 8 karakter (kombinasi huruf, angka, simbol)..."
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
              aria-label={showNewPassword ? 'Sembunyikan password' : 'Lihat password'}
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Strength Meter Bar */}
          {newPassword && (
            <div className="space-y-1.5 pt-1">
              <div className="flex gap-1.5 h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                <div className={`flex-1 transition-all duration-300 ${strength.score >= 1 ? strength.color : 'bg-zinc-800'}`} />
                <div className={`flex-1 transition-all duration-300 ${strength.score >= 2 ? strength.color : 'bg-zinc-800'}`} />
                <div className={`flex-1 transition-all duration-300 ${strength.score >= 3 ? strength.color : 'bg-zinc-800'}`} />
                <div className={`flex-1 transition-all duration-300 ${strength.score >= 4 ? strength.color : 'bg-zinc-800'}`} />
              </div>
            </div>
          )}

          {state?.fieldErrors?.newPassword && (
            <p className="text-red-400 text-xs mt-1">{state.fieldErrors.newPassword[0]}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-300">
              Konfirmasi Password Baru *
            </label>
            {isMatch && (
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" /> Cocok
              </span>
            )}
            {isMismatch && (
              <span className="flex items-center gap-1 text-xs text-red-400">
                <ShieldAlert className="w-3.5 h-3.5" /> Belum cocok
              </span>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className={`w-full pl-10 pr-10 py-2.5 bg-zinc-900/50 border rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 transition-all text-sm font-mono ${
                isMismatch
                  ? 'border-red-500/50 focus:ring-red-500/20 focus:border-red-500'
                  : isMatch
                  ? 'border-emerald-500/50 focus:ring-emerald-500/20 focus:border-emerald-500'
                  : 'border-zinc-800 focus:ring-white/20 focus:border-white/30'
              }`}
              placeholder="Ulangi password baru Anda..."
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
              aria-label={showConfirmPassword ? 'Sembunyikan password' : 'Lihat password'}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {state?.fieldErrors?.confirmPassword && (
            <p className="text-red-400 text-xs mt-1">{state.fieldErrors.confirmPassword[0]}</p>
          )}
        </div>

        {/* Submit Action */}
        <div className="flex justify-end pt-4 border-t border-zinc-800">
          <button
            type="submit"
            disabled={isPending || !currentPassword || !newPassword || !confirmPassword || isMismatch}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition-all duration-300 shadow-lg shadow-white/5 active:scale-95 disabled:opacity-50 disabled:pointer-events-none text-sm"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Memperbarui...
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                Simpan Password Baru
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

import ForgotPasswordForm from '@/components/admin/forgot-password-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lupa Password — Admin',
  description: 'Atur ulang kata sandi admin portfolio',
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative">
      {/* Background gradient/texture matching /login */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/40 via-black to-black pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 w-full flex justify-center">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}

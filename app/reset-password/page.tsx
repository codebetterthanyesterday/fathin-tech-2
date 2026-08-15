import { Metadata } from 'next';
import { verifyResetToken } from '@/app/actions/auth';
import ResetPasswordForm from '@/components/admin/reset-password-form';

export const metadata: Metadata = {
  title: 'Atur Ulang Password — Admin',
  description: 'Atur ulang kata sandi admin portfolio',
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const resolvedParams = await searchParams;
  const token = resolvedParams.token || '';

  const verification = await verifyResetToken(token);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative">
      {/* Background gradient/texture matching /login */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/40 via-black to-black pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 w-full flex justify-center">
        <ResetPasswordForm
          token={token}
          isValid={verification.valid}
          email={verification.email}
          errorMessage={verification.error}
        />
      </div>
    </div>
  );
}

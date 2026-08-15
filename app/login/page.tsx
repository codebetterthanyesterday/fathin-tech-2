import LoginForm from '@/components/admin/login-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Login',
  description: 'Login to access the admin dashboard',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative">
      {/* Very subtle background texture/gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/40 via-black to-black pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10 w-full flex justify-center">
        <LoginForm />
      </div>
    </div>
  );
}

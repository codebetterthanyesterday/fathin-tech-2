import { getProfile } from '@/app/actions/profile';
import { Metadata } from 'next';
import ThemeSettingsForm from '@/components/admin/settings/theme-settings-form';
import PasswordChangeForm from '@/components/admin/settings/password-change-form';

export const metadata: Metadata = {
  title: 'Settings — Admin',
  description: 'Manage website appearance, theme colors, typography, security, and credentials.',
};

export default async function SettingsPage() {
  const { profile, error } = await getProfile();

  if (error) {
    return (
      <div className="p-8 text-red-400">
        <p>Fetch failed: {error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-10 pb-12">
      <header className="border-b border-zinc-800 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-white">System Settings</h1>
        <p className="text-zinc-400 mt-1">
          Kelola preferensi tampilan publik, tema visual, serta kredensial keamanan akun admin.
        </p>
      </header>

      <main className="space-y-12">
        {/* Security & Password Section */}
        <section aria-labelledby="security-heading">
          <PasswordChangeForm />
        </section>

        {/* Visual Appearance & Theme Configuration Section */}
        <section aria-labelledby="theme-heading">
          <ThemeSettingsForm initialData={profile} />
        </section>
      </main>
    </div>
  );
}


import { getProfile } from '@/app/actions/profile';
import { Metadata } from 'next';
import ThemeSettingsForm from '@/components/admin/settings/theme-settings-form';

export const metadata: Metadata = {
  title: 'Settings — Admin',
  description: 'Manage website appearance, theme colors, typography, and templates.',
};

export default async function SettingsPage() {
  const { profile, error } = await getProfile();

  if (error) {
    return (
      <div className="p-8 text-red-400">
        <p>Error loading settings data: {error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-8">
      <header className="border-b border-zinc-800 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-white">Settings</h1>
        <p className="text-zinc-400 mt-1">
          Kelola konfigurasi tampilan visual, warna aksen, font, dan template layout situs portofolio Anda.
        </p>
      </header>

      <main>
        <ThemeSettingsForm initialData={profile} />
      </main>
    </div>
  );
}

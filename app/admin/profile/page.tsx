import { getProfile } from '@/app/actions/profile';
import ProfileForm from '@/components/admin/profile-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit Profile - Admin',
};

export default async function AdminProfilePage() {
  const { profile, error } = await getProfile();

  if (error) {
    return (
      <div className="p-8 text-red-400">
        <p>Error loading profile data: {error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      <header className="border-b border-zinc-800 pb-6">
        <h1 className="text-3xl font-bold tracking-tight">Public Profile</h1>
        <p className="text-zinc-400 mt-1">
          Update your portfolio's public identity.
        </p>
      </header>

      <main className="flex justify-start">
        <ProfileForm initialData={profile || {}} />
      </main>
    </div>
  );
}

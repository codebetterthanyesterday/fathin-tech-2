import { getCertifications, getCertificationCategories } from '@/app/actions/certification';
import { Metadata } from 'next';
import CertificationListClient from '@/components/admin/certifications/certification-list';

export const metadata: Metadata = {
  title: 'Manage Certifications - Admin',
};

export default async function AdminCertificationsPage() {
  const [{ certifications, error }, { categories }] = await Promise.all([
    getCertifications(),
    getCertificationCategories(),
  ]);

  if (error) {
    return (
      <div className="p-8 text-red-400">
        <p>Fetch failed: {error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-8">
      <header className="border-b border-zinc-800 pb-6">
        <h1 className="text-3xl font-bold tracking-tight">Certifications</h1>
        <p className="text-zinc-400 mt-1">
          Manage your professional certifications, credentials, and awards.
        </p>
      </header>

      <main>
        <CertificationListClient initialCertifications={certifications || []} />
      </main>
    </div>
  );
}

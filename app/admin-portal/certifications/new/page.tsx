import { getCertificationCategories } from '@/app/actions/certification';
import { Metadata } from 'next';
import CertificationForm from '@/components/admin/certifications/certification-form';

export const metadata: Metadata = {
  title: 'New Certification - Admin',
};

export default async function NewCertificationPage() {
  const { categories } = await getCertificationCategories();

  const existingCategories = (categories || []).map((c) => ({
    id: c.id,
    name: c.name,
    dimension: c.dimension as 'SKILL' | 'ISSUER' | 'TYPE',
  }));

  return (
    <div className="max-w-2xl space-y-8">
      <header className="border-b border-zinc-800 pb-6">
        <h1 className="text-3xl font-bold tracking-tight">New Certification</h1>
        <p className="text-zinc-400 mt-1">Add a new professional certification or credential.</p>
      </header>

      <main>
        <CertificationForm existingCategories={existingCategories} />
      </main>
    </div>
  );
}

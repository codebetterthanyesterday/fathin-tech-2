import { getCertificationById, getCertificationCategories } from '@/app/actions/certification';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CertificationForm from '@/components/admin/certifications/certification-form';

export const metadata: Metadata = {
  title: 'Edit Certification - Admin',
};

export default async function EditCertificationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [{ certification, error }, { categories }] = await Promise.all([
    getCertificationById(id),
    getCertificationCategories(),
  ]);

  if (error || !certification) {
    notFound();
  }

  const existingCategories = (categories || []).map((c) => ({
    id: c.id,
    name: c.name,
    dimension: c.dimension as 'SKILL' | 'ISSUER' | 'TYPE',
  }));

  return (
    <div className="max-w-2xl space-y-8">
      <header className="border-b border-zinc-800 pb-6">
        <h1 className="text-3xl font-bold tracking-tight">Edit Certification</h1>
        <p className="text-zinc-400 mt-1">
          {certification.translations?.find((t: any) => t.locale === 'id')?.title || certification.title}
        </p>
      </header>

      <main>
        <CertificationForm initialData={certification} existingCategories={existingCategories} />
      </main>
    </div>
  );
}

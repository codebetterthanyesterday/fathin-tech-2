import { getExperiences } from '@/app/actions/experience';
import { Metadata } from 'next';
import ExperienceList from '@/components/admin/experience/experience-list';

export const metadata: Metadata = {
  title: 'Manage Experience - Admin',
};

export default async function AdminExperiencePage() {
  const { work, education, error } = await getExperiences();

  if (error) {
    return (
      <div className="p-8 text-red-400">
        <p>Fetch failed: {error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-8">
      <header className="border-b border-zinc-800 pb-6">
        <h1 className="text-3xl font-bold tracking-tight">Experience</h1>
        <p className="text-zinc-400 mt-1">
          Career and education history.
        </p>
      </header>

      <main>
        <ExperienceList work={work || []} education={education || []} />
      </main>
    </div>
  );
}

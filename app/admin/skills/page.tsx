import { getSkills } from '@/app/actions/skill';
import { Metadata } from 'next';
import SkillListClient from '@/components/admin/skills/skill-list';

export const metadata: Metadata = {
  title: 'Manage Skills - Admin',
};

export default async function AdminSkillsPage() {
  const { skills, error } = await getSkills();

  if (error) {
    return (
      <div className="p-8 text-red-400">
        <p>Error loading skills data: {error}</p>
      </div>
    );
  }

  // Group skills by category for the initial state
  const groupedSkills = (skills || []).reduce((acc: any, skill: any) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {});

  return (
    <div className="max-w-5xl space-y-8">
      <header className="border-b border-zinc-800 pb-6">
        <h1 className="text-3xl font-bold tracking-tight">Skills & Competencies</h1>
        <p className="text-zinc-400 mt-1">
          Manage your technical and soft skills, organize them by category, and adjust their levels.
        </p>
      </header>

      <main>
        <SkillListClient initialGroupedSkills={groupedSkills} />
      </main>
    </div>
  );
}

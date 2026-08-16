import { getProjects } from '@/app/actions/project';
import { Metadata } from 'next';
import ProjectListClient from '@/components/admin/projects/project-list';

export const metadata: Metadata = {
  title: 'Manage Projects - Admin',
};

export default async function AdminProjectsPage() {
  const { projects, error } = await getProjects();

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
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        <p className="text-zinc-400 mt-1">
          Manage portfolio entries and display order.
        </p>
      </header>

      <main>
        <ProjectListClient initialProjects={projects || []} />
      </main>
    </div>
  );
}

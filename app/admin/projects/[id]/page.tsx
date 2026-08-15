import { getProject } from '@/app/actions/project';
import { Metadata } from 'next';
import ProjectForm from '@/components/admin/projects/project-form';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Edit Project - Admin',
};

export default async function EditProjectPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { project, error } = await getProject(params.id);

  if (error) {
    return (
      <div className="p-8 text-red-400">
        <p>Error loading project data: {error}</p>
      </div>
    );
  }

  if (!project) {
    notFound();
  }

  return (
    <div className="max-w-4xl space-y-8">
      <header className="border-b border-zinc-800 pb-6">
        <h1 className="text-3xl font-bold tracking-tight">Edit Project</h1>
        <p className="text-zinc-400 mt-1">
          Update the details, media, and settings for this project.
        </p>
      </header>

      <main>
        <ProjectForm project={project} />
      </main>
    </div>
  );
}

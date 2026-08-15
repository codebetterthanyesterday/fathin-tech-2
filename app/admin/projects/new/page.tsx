import { Metadata } from 'next';
import ProjectForm from '@/components/admin/projects/project-form';

export const metadata: Metadata = {
  title: 'Add New Project - Admin',
};

export default function NewProjectPage() {
  return (
    <div className="max-w-4xl space-y-8">
      <header className="border-b border-zinc-800 pb-6">
        <h1 className="text-3xl font-bold tracking-tight">Add New Project</h1>
        <p className="text-zinc-400 mt-1">
          Create a new showcase for your portfolio.
        </p>
      </header>

      <main>
        <ProjectForm />
      </main>
    </div>
  );
}

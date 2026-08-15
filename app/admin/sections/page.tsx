import { getAllSections } from '@/lib/data';
import SectionList from '@/components/admin/sections/section-list';
import { Metadata } from 'next';
import { LayoutList } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Page Sections — Admin',
};

export default async function AdminSectionsPage() {
  const { sections } = await getAllSections();

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <header className="border-b border-zinc-800 pb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            <LayoutList className="w-4 h-4 text-zinc-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Page Sections</h1>
        </div>
        <p className="text-zinc-400 mt-2 text-sm leading-relaxed">
          Control which sections appear on your public homepage and in what order.
          Use the arrows to reorder, the eye icon to show/hide, and <strong className="text-zinc-300">Edit</strong> to configure each section's content.
        </p>
      </header>

      {/* Seed hint if empty */}
      {sections.length === 0 && (
        <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg text-sm text-amber-400">
          <strong>No sections found.</strong> Run the one-time seed script to populate initial sections:
          <code className="block mt-2 text-xs bg-zinc-900 text-zinc-300 px-3 py-2 rounded font-mono">
            npx tsx prisma/seed-sections.ts
          </code>
        </div>
      )}

      <SectionList sections={sections} />
    </div>
  );
}

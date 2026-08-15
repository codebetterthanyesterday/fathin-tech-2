
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
};

export default async function AdminDashboardPage() {
  return (
    <div className="max-w-4xl space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <a 
          href="/admin/profile" 
          className="block p-6 border border-zinc-800 rounded-xl bg-zinc-900/30 hover:bg-zinc-800/50 transition-colors group"
        >
          <h2 className="text-xl font-semibold mb-2 group-hover:text-white text-zinc-200 transition-colors">Manage Profile</h2>
          <p className="text-zinc-400 text-sm">
            Update your personal details, bio, and social links.
          </p>
        </a>

        <a 
          href="/admin/skills" 
          className="block p-6 border border-zinc-800 rounded-xl bg-zinc-900/30 hover:bg-zinc-800/50 transition-colors group"
        >
          <h2 className="text-xl font-semibold mb-2 group-hover:text-white text-zinc-200 transition-colors">Manage Skills</h2>
          <p className="text-zinc-400 text-sm">
            Add or update your technical and soft skills.
          </p>
        </a>

        <a 
          href="/admin/projects" 
          className="block p-6 border border-zinc-800 rounded-xl bg-zinc-900/30 hover:bg-zinc-800/50 transition-colors group"
        >
          <h2 className="text-xl font-semibold mb-2 group-hover:text-white text-zinc-200 transition-colors">Manage Projects</h2>
          <p className="text-zinc-400 text-sm">
            Add, edit, or reorder your portfolio projects.
          </p>
        </a>

        <a 
          href="/admin/experience" 
          className="block p-6 border border-zinc-800 rounded-xl bg-zinc-900/30 hover:bg-zinc-800/50 transition-colors group"
        >
          <h2 className="text-xl font-semibold mb-2 group-hover:text-white text-zinc-200 transition-colors">Manage Experience</h2>
          <p className="text-zinc-400 text-sm">
            Update your work history and education timeline.
          </p>
        </a>

        <a 
          href="/admin/sections" 
          className="block p-6 border border-zinc-800 rounded-xl bg-zinc-900/30 hover:bg-zinc-800/50 transition-colors group"
        >
          <h2 className="text-xl font-semibold mb-2 group-hover:text-white text-zinc-200 transition-colors">Manage Sections</h2>
          <p className="text-zinc-400 text-sm">
            Control which sections appear on your homepage and their order.
          </p>
        </a>

        <div className="p-6 border border-zinc-800 rounded-xl bg-zinc-900/30">
          <h2 className="text-xl font-semibold mb-2 text-zinc-500">Portfolio Analytics (Coming Soon)</h2>
          <p className="text-zinc-600 text-sm">
            View visitor statistics and engagement.
          </p>
        </div>
      </div>
    </div>
  );
}

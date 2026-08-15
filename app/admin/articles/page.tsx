import { getArticles } from '@/app/actions/article';
import { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import ArticleListClient from '@/components/admin/articles/article-list';

export const metadata: Metadata = {
  title: 'Manage Articles - Admin',
};

export default async function AdminArticlesPage() {
  const { articles, error } = await getArticles();

  if (error) {
    return (
      <div className="p-8 text-red-400">
        <p>Error loading articles: {error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Articles & Notes</h1>
          <p className="text-zinc-400 mt-1">
            Write technical articles and notes to build your personal brand and share knowledge.
          </p>
        </div>

        <Link
          href="/admin/articles/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-black font-semibold text-sm rounded-lg hover:bg-zinc-200 transition-colors shrink-0 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Write Article
        </Link>
      </header>

      <main>
        <ArticleListClient initialArticles={articles || []} />
      </main>
    </div>
  );
}

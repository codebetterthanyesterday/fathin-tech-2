'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  FileText,
  Edit2,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { deleteArticle, toggleArticlePublished } from '@/app/actions/article';
import DeleteConfirmModal from '@/components/admin/skills/delete-confirm-modal';
import { getAdminPath } from '@/lib/routes';

type ArticleItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  contentMd: string;
  coverImage: string | null;
  isPublished: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export default function ArticleListClient({ initialArticles }: { initialArticles: ArticleItem[] }) {
  const [articles, setArticles] = useState<ArticleItem[]>(initialArticles);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [isProcessingId, setIsProcessingId] = useState<string | null>(null);

  // Delete modal state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingArticle, setDeletingArticle] = useState<ArticleItem | null>(null);

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (article.excerpt && article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === 'published') return article.isPublished;
    if (statusFilter === 'draft') return !article.isPublished;
    return true;
  });

  const publishedCount = articles.filter((a) => a.isPublished).length;
  const draftCount = articles.filter((a) => !a.isPublished).length;

  const handleTogglePublish = async (article: ArticleItem) => {
    setIsProcessingId(article.id);
    const newStatus = !article.isPublished;
    const res = await toggleArticlePublished(article.id, newStatus);

    if (res.success) {
      setArticles((prev) =>
        prev.map((a) => {
          if (a.id === article.id) {
            return {
              ...a,
              isPublished: newStatus,
              publishedAt: a.publishedAt || (newStatus ? new Date() : null),
            };
          }
          return a;
        })
      );
    }
    setIsProcessingId(null);
  };

  const handleDeleteClick = (article: ArticleItem) => {
    setDeletingArticle(article);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingArticle) {
      await deleteArticle(deletingArticle.id);
      setArticles((prev) => prev.filter((a) => a.id !== deletingArticle.id));
      setDeletingArticle(null);
      setIsDeleteOpen(false);
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'Not published yet';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar: Search & Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles by title, slug, or excerpt..."
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/60 border border-zinc-800 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/30 transition-colors"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-zinc-900/60 border border-zinc-800 p-1 rounded-lg">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              statusFilter === 'all'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All ({articles.length})
          </button>
          <button
            onClick={() => setStatusFilter('published')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              statusFilter === 'published'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Published ({publishedCount})
          </button>
          <button
            onClick={() => setStatusFilter('draft')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              statusFilter === 'draft'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Drafts ({draftCount})
          </button>
        </div>
      </div>

      {/* Articles List */}
      {filteredArticles.length === 0 ? (
        <div className="text-center py-16 border border-zinc-800/80 border-dashed rounded-2xl bg-zinc-950/40">
          <FileText className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-medium text-white mb-1">No entries found</h3>
          <p className="text-sm text-zinc-500 max-w-sm mx-auto mb-6">
            {searchQuery || statusFilter !== 'all'
              ? 'No matching entries found for the current query.'
              : 'Action required: Create an entry.'}
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <Link
              href={getAdminPath('articles/new')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black font-semibold text-xs rounded-lg hover:bg-zinc-200 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Create Entry
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              className={`flex flex-col md:flex-row gap-4 md:items-center justify-between p-5 rounded-2xl border transition-all duration-200 ${
                article.isPublished
                  ? 'bg-zinc-900/40 border-zinc-800/60 hover:border-zinc-700'
                  : 'bg-zinc-900/20 border-zinc-800/30 opacity-75 hover:opacity-100 hover:border-zinc-700'
              }`}
            >
              {/* Left: Thumbnail & Info */}
              <div className="flex items-start gap-4 min-w-0 flex-1">
                {/* Thumbnail */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden flex-shrink-0 relative flex items-center justify-center">
                  {article.coverImage ? (
                    <Image
                      src={article.coverImage}
                      alt={article.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <FileText className="w-6 h-6 text-zinc-600" />
                  )}
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Status Badge */}
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        article.isPublished
                          ? 'bg-white/10 text-white border-white/20'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          article.isPublished ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-zinc-500'
                        }`}
                      />
                      {article.isPublished ? 'Published' : 'Draft'}
                    </span>

                    <span className="text-xs text-zinc-500 font-mono">
                      /articles/{article.slug}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-semibold text-white truncate">
                    {article.title}
                  </h3>

                  {article.excerpt && (
                    <p className="text-sm text-zinc-400 line-clamp-1">{article.excerpt}</p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-zinc-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {article.isPublished ? `Published ${formatDate(article.publishedAt)}` : `Created ${formatDate(article.createdAt)}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-800/60">
                {/* View Public Button */}
                {article.isPublished && (
                  <Link
                    href={`/articles/${article.slug}`}
                    target="_blank"
                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                    title="View live article"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                )}

                {/* Toggle Publish */}
                <button
                  onClick={() => handleTogglePublish(article)}
                  disabled={isProcessingId === article.id}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    article.isPublished
                      ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800'
                      : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                  }`}
                  title={article.isPublished ? 'Unpublish to Draft' : 'Publish Article'}
                >
                  {article.isPublished ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      Unpublish
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      Publish
                    </>
                  )}
                </button>

                {/* Edit */}
                <Link
                  href={getAdminPath(`articles/${article.id}`)}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                  title="Edit article"
                >
                  <Edit2 className="w-4 h-4" />
                </Link>

                {/* Delete */}
                <button
                  onClick={() => handleDeleteClick(article)}
                  disabled={isProcessingId === article.id}
                  className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  title="Delete article"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Entry"
        description={`Confirm deletion of "${deletingArticle?.title}". This action is irreversible.`}
      />
    </div>
  );
}

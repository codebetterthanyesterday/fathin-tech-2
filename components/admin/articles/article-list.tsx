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
  Globe,
} from 'lucide-react';
import { deleteArticle, toggleArticlePublished } from '@/app/actions/article';
import DeleteConfirmModal from '@/components/admin/skills/delete-confirm-modal';
import { getAdminPath } from '@/lib/routes';
import { resolveArticle } from '@/lib/translations';

export default function ArticleListClient({ initialArticles }: { initialArticles: any[] }) {
  const [articles, setArticles] = useState<any[]>(initialArticles);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [isProcessingId, setIsProcessingId] = useState<string | null>(null);

  // Delete modal state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingArticle, setDeletingArticle] = useState<any | null>(null);

  const filteredArticles = articles.filter((rawArticle) => {
    const article = resolveArticle(rawArticle, 'id') || rawArticle;
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rawArticle.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (article.excerpt && article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === 'published') return rawArticle.isPublished;
    if (statusFilter === 'draft') return !rawArticle.isPublished;
    return true;
  });

  const publishedCount = articles.filter((a) => a.isPublished).length;
  const draftCount = articles.filter((a) => !a.isPublished).length;

  const handleTogglePublish = async (article: any) => {
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

  const handleDeleteClick = (article: any) => {
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
    if (!date) return 'Belum dipublikasikan';
    const d = new Date(date);
    return d.toLocaleDateString('id-ID', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Action and Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Cari judul, ringkasan, atau slug artikel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-700"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-900/60 border border-zinc-800 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Semua ({articles.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('published')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'published'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50 font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Publik ({publishedCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('draft')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'draft'
                ? 'bg-zinc-800 text-amber-300 font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Draf ({draftCount})
          </button>
        </div>
      </div>

      {/* Article List Cards */}
      <div className="space-y-3">
        {filteredArticles.map((rawArticle) => {
          const article = resolveArticle(rawArticle, 'id') || rawArticle;
          const hasId = rawArticle.translations?.some((t: any) => t.locale === 'id');
          const hasEn = rawArticle.translations?.some((t: any) => t.locale === 'en');

          return (
            <div
              key={rawArticle.id}
              className="p-5 bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700/80 rounded-2xl transition-all duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 group"
            >
              {/* Left Details */}
              <div className="flex items-start gap-4 flex-1 min-w-0">
                {/* Cover Thumbnail */}
                <div className="relative w-20 h-16 sm:w-28 sm:h-20 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800/80 shrink-0">
                  {rawArticle.coverImage ? (
                    <Image
                      src={rawArticle.coverImage}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-700">
                      <FileText className="w-6 h-6" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-base font-bold text-white group-hover:text-zinc-200 transition-colors truncate">
                      {article.title}
                    </h3>
                    
                    {/* Status Badge */}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        rawArticle.isPublished
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}
                    >
                      {rawArticle.isPublished ? 'Publik' : 'Draf'}
                    </span>

                    {/* Language Badges */}
                    <div className="inline-flex items-center gap-1.5 ml-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${hasId ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60' : 'bg-zinc-800 text-zinc-500'}`}>
                        ID
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${hasEn ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60' : 'bg-amber-950/60 text-amber-300 border border-amber-800/60'}`}>
                        EN {hasEn ? '' : '(Belum Diterjemahkan)'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400 mt-1 line-clamp-1">
                    {article.excerpt || 'Tidak ada ringkasan tertulis.'}
                  </p>

                  <div className="flex items-center gap-4 mt-2 text-[11px] text-zinc-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(rawArticle.publishedAt)}
                    </span>
                    <span>•</span>
                    <span>/{rawArticle.slug}</span>
                  </div>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => handleTogglePublish(rawArticle)}
                  disabled={isProcessingId === rawArticle.id}
                  className={`p-2 rounded-xl text-xs font-medium border transition-colors ${
                    rawArticle.isPublished
                      ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-amber-400 hover:border-amber-500/30'
                      : 'bg-emerald-950/30 border-emerald-800/50 text-emerald-400 hover:bg-emerald-950/60'
                  }`}
                  title={rawArticle.isPublished ? 'Alihkan ke Draf' : 'Publikasikan Sekarang'}
                >
                  {rawArticle.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>

                <Link
                  href={getAdminPath(`articles/${rawArticle.id}`)}
                  className="p-2 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 rounded-xl transition-colors"
                  title="Edit Artikel"
                >
                  <Edit2 className="w-4 h-4" />
                </Link>

                <button
                  type="button"
                  onClick={() => handleDeleteClick(rawArticle)}
                  className="p-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-500/30 rounded-xl transition-colors"
                  title="Hapus Artikel"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredArticles.length === 0 && (
          <div className="text-center py-20 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-2xl">
            <p className="text-zinc-500 mb-4">Tidak ada artikel yang sesuai dengan filter pencarian.</p>
            <Link
              href={getAdminPath('articles/new')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition-colors text-sm"
            >
              Tulis Artikel Baru
            </Link>
          </div>
        )}
      </div>

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Hapus Artikel"
        description={`Konfirmasi penghapusan naskah "${deletingArticle?.translations?.[0]?.title || deletingArticle?.slug}". Artikel dan translasi terkait akan dihapus secara permanen.`}
      />
    </div>
  );
}

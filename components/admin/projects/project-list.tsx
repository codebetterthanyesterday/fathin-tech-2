'use client';

import { useState, useEffect, useTransition } from 'react';
import { Plus, Edit2, Trash2, Star, Image as ImageIcon } from 'lucide-react';
import { reorderProjects, deleteProject } from '@/app/actions/project';
import DeleteConfirmModal from '../skills/delete-confirm-modal';
import Link from 'next/link';
import { getAdminPath } from '@/lib/routes';
import { resolveProject } from '@/lib/translations';
import {
  ReorderableList,
  useReorderableItem,
  ReorderableDragHandle,
  ReorderableFallbackControls,
} from '@/components/admin/shared/reorderable-list';

function ProjectRow({
  rawProject,
  isFirst,
  isLast,
  onMove,
  onDelete,
  isDragOverlay = false,
}: {
  rawProject: any;
  isFirst: boolean;
  isLast: boolean;
  onMove: (id: string, dir: 'up' | 'down') => void;
  onDelete: (project: any) => void;
  isDragOverlay?: boolean;
}) {
  const [isPending] = useTransition();
  const { attributes, listeners, setNodeRef, style, isDragging } = useReorderableItem(rawProject.id);

  const project = resolveProject(rawProject, 'id') || rawProject;
  const hasId = rawProject.translations?.some((t: any) => t.locale === 'id');
  const hasEn = rawProject.translations?.some((t: any) => t.locale === 'en');

  if (isDragging && !isDragOverlay) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-32 rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02]"
        aria-hidden
      />
    );
  }

  return (
    <div
      ref={isDragOverlay ? undefined : setNodeRef}
      style={isDragOverlay ? undefined : style}
      className={`flex flex-col sm:flex-row gap-6 p-4 rounded-xl border transition-all duration-300 overflow-hidden group ${
        isDragOverlay
          ? 'bg-zinc-800 border-zinc-600 shadow-2xl scale-[1.02] z-50 relative'
          : 'bg-zinc-900/40 border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900/80'
      }`}
    >
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className="hidden sm:block">
          <ReorderableDragHandle
            attributes={isDragOverlay ? {} : attributes}
            listeners={isDragOverlay ? {} : listeners}
            isDragging={isDragging && !isDragOverlay}
          />
        </div>

        {/* Thumbnail */}
        <div className="relative w-full sm:w-48 h-32 bg-black rounded-lg overflow-hidden border border-zinc-800 flex-shrink-0">
          {rawProject.images && rawProject.images.length > 0 ? (
            <img
              src={rawProject.images[0].url}
              alt={project.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-700 bg-zinc-950">
              <ImageIcon className="w-6 h-6 mb-2 opacity-50" />
              <span className="text-xs font-medium uppercase tracking-widest opacity-50">No Image</span>
            </div>
          )}
          {rawProject.isFeatured && (
            <div className="absolute top-2 left-2 bg-yellow-500 text-black p-1.5 rounded-md shadow-lg">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col py-1">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-white group-hover:text-zinc-200 transition-colors">
                {project.title}
              </h3>
              {/* Language Badges */}
              <div className="inline-flex items-center gap-1.5 ml-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                    hasId ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60' : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  ID
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                    hasEn ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60' : 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                  }`}
                >
                  EN {hasEn ? '' : '(Belum Diterjemahkan)'}
                </span>
              </div>
            </div>
            <p className="text-zinc-500 text-xs font-mono mt-1">/projects/{rawProject.slug}</p>
          </div>

          {/* Actions (Desktop) */}
          <div className="hidden sm:flex items-center gap-2">
            <ReorderableFallbackControls
              onMoveUp={() => onMove(rawProject.id, 'up')}
              onMoveDown={() => onMove(rawProject.id, 'down')}
              isFirst={isFirst}
              isLast={isLast}
              isProcessing={isPending}
            />
            <div className="w-px h-6 bg-zinc-800 mx-1"></div>
            <Link
              href={getAdminPath(`projects/${rawProject.id}`)}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
              aria-label="Edit project"
            >
              <Edit2 className="w-4 h-4" />
            </Link>
            <button
              onClick={() => onDelete(rawProject)}
              className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
              aria-label="Delete project"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-sm text-zinc-400 mt-3 line-clamp-2">{project.summary}</p>

        <div className="flex items-center gap-2 mt-auto pt-4 flex-wrap">
          {rawProject.techStack?.slice(0, 3).map((tech: string) => (
            <span
              key={tech}
              className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-zinc-800 text-zinc-300 rounded border border-zinc-700/50"
            >
              {tech}
            </span>
          ))}
          {rawProject.techStack?.length > 3 && (
            <span className="px-2 py-0.5 text-[10px] font-medium text-zinc-500">+{rawProject.techStack.length - 3} more</span>
          )}
        </div>

        {/* Mobile Actions */}
        <div className="sm:hidden flex items-center gap-2 mt-6 border-t border-zinc-800/50 pt-4">
          <ReorderableDragHandle
            attributes={isDragOverlay ? {} : attributes}
            listeners={isDragOverlay ? {} : listeners}
            isDragging={isDragging && !isDragOverlay}
          />
          <div className="ml-auto flex items-center gap-2">
            <ReorderableFallbackControls
              onMoveUp={() => onMove(rawProject.id, 'up')}
              onMoveDown={() => onMove(rawProject.id, 'down')}
              isFirst={isFirst}
              isLast={isLast}
              isProcessing={isPending}
            />
            <Link
              href={getAdminPath(`projects/${rawProject.id}`)}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </Link>
            <button
              onClick={() => onDelete(rawProject)}
              className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProjectListClient({ initialProjects }: { initialProjects: any[] }) {
  const [projects, setProjects] = useState(initialProjects);
  const [isMounted, setIsMounted] = useState(false);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingProject, setDeletingProject] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  const handleReorder = async (newProjects: any[]) => {
    setProjects(newProjects);
    const updates = newProjects.map((item: any, index: number) => ({
      id: item.id,
      order: index,
    }));
    await reorderProjects(updates);
  };

  const handleKeyboardMove = async (id: string, dir: 'up' | 'down') => {
    const idx = projects.findIndex((s) => s.id === id);
    if (idx === -1) return;
    if (dir === 'up' && idx === 0) return;
    if (dir === 'down' && idx === projects.length - 1) return;

    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    const items = [...projects];
    const temp = items[idx];
    items[idx] = items[swapIdx];
    items[swapIdx] = temp;
    
    handleReorder(items);
  };

  const handleDelete = (project: any) => {
    setDeletingProject(project);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingProject) {
      await deleteProject(deletingProject.id);
      setDeletingProject(null);
      setIsDeleteOpen(false);
    }
  };

  if (!isMounted) return null; // Avoid hydration mismatch for DND

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Daftar Proyek Portofolio</h2>
          <p className="text-xs text-zinc-400 mt-0.5">Kelola showcase proyek, drag & drop untuk mengubah urutan tampilan.</p>
        </div>
        <Link
          href={getAdminPath('projects/new')}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition-colors text-sm shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Tambah Proyek
        </Link>
      </div>

      <ReorderableList
        items={projects}
        onReorder={handleReorder}
        renderOverlay={(activeId) => {
          const activeItem = projects.find(p => p.id === activeId);
          if (!activeItem) return null;
          return (
            <ProjectRow
              rawProject={activeItem}
              isFirst={false}
              isLast={false}
              onMove={() => {}}
              onDelete={() => {}}
              isDragOverlay
            />
          );
        }}
      >
        {projects.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-2xl">
            <p className="text-zinc-500 mb-4">Belum ada proyek yang terdaftar.</p>
            <Link
              href={getAdminPath('projects/new')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Tambah Proyek
            </Link>
          </div>
        ) : (
          projects.map((rawProject: any, index: number) => (
            <ProjectRow
              key={rawProject.id}
              rawProject={rawProject}
              isFirst={index === 0}
              isLast={index === projects.length - 1}
              onMove={handleKeyboardMove}
              onDelete={handleDelete}
            />
          ))
        )}
      </ReorderableList>

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Hapus Proyek"
        description={`Konfirmasi penghapusan proyek "${deletingProject?.translations?.[0]?.title || deletingProject?.slug}". Gambar dan translasi terkait akan dihapus secara permanen.`}
      />
    </div>
  );
}

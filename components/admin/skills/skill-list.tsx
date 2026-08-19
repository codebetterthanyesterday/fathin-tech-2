'use client';

import { useState, useEffect, useTransition } from 'react';
import { Plus, Edit2, Trash2, Code2 } from 'lucide-react';
import { reorderSkills, deleteSkill } from '@/app/actions/skill';
import SkillFormModal from './skill-form-modal';
import DeleteConfirmModal from './delete-confirm-modal';
import {
  ReorderableList,
  useReorderableItem,
  ReorderableDragHandle,
  ReorderableFallbackControls,
} from '@/components/admin/shared/reorderable-list';

const CATEGORIES = ['LANGUAGE', 'FRAMEWORK', 'TOOL', 'SOFT_SKILL', 'OTHER'];

function SkillRow({
  skill,
  isFirst,
  isLast,
  onMove,
  onEdit,
  onDelete,
  isDragOverlay = false,
}: {
  skill: any;
  isFirst: boolean;
  isLast: boolean;
  onMove: (id: string, dir: 'up' | 'down') => void;
  onEdit: (skill: any) => void;
  onDelete: (skill: any) => void;
  isDragOverlay?: boolean;
}) {
  const [isPending] = useTransition();
  const { attributes, listeners, setNodeRef, style, isDragging } = useReorderableItem(skill.id);

  if (isDragging && !isDragOverlay) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-16 rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02]"
        aria-hidden
      />
    );
  }

  return (
    <div
      ref={isDragOverlay ? undefined : setNodeRef}
      style={isDragOverlay ? undefined : style}
      className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all duration-200 gap-4 sm:gap-0 ${
        isDragOverlay
          ? 'bg-zinc-800 border-zinc-600 shadow-2xl scale-[1.02] z-50 relative'
          : 'bg-zinc-900/40 border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900/60'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="hidden sm:block">
          <ReorderableDragHandle
            attributes={isDragOverlay ? {} : attributes}
            listeners={isDragOverlay ? {} : listeners}
            isDragging={isDragging && !isDragOverlay}
          />
        </div>
        <div>
          <h4 className="text-white font-medium">{skill.name}</h4>
          {skill.level !== null && (
            <div className="flex items-center gap-1 mt-1.5">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`w-1.5 h-1.5 rounded-full ${level <= skill.level ? 'bg-white' : 'bg-zinc-800'}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 sm:mt-0 border-t sm:border-t-0 border-zinc-800/50 pt-4 sm:pt-0">
        <div className="sm:hidden mr-auto">
          <ReorderableDragHandle
            attributes={isDragOverlay ? {} : attributes}
            listeners={isDragOverlay ? {} : listeners}
            isDragging={isDragging && !isDragOverlay}
          />
        </div>
        <ReorderableFallbackControls
          onMoveUp={() => onMove(skill.id, 'up')}
          onMoveDown={() => onMove(skill.id, 'down')}
          isFirst={isFirst}
          isLast={isLast}
          isProcessing={isPending}
        />
        <div className="w-px h-6 bg-zinc-800 mx-1 hidden sm:block"></div>
        <button
          onClick={() => onEdit(skill)}
          className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          aria-label="Edit skill"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(skill)}
          className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
          aria-label="Delete skill"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function SkillListClient({ initialGroupedSkills }: { initialGroupedSkills: any }) {
  const [groupedSkills, setGroupedSkills] = useState(initialGroupedSkills);
  const [isMounted, setIsMounted] = useState(false);
  
  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<any>(null);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingSkill, setDeletingSkill] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync state if props change (after server revalidate)
  useEffect(() => {
    setGroupedSkills(initialGroupedSkills);
  }, [initialGroupedSkills]);

  const handleReorder = async (category: string, newItems: any[]) => {
    // Optimistic UI update
    const newGrouped = { ...groupedSkills, [category]: newItems };
    setGroupedSkills(newGrouped);

    // Prepare updates for backend
    const updates = newItems.map((item: any, index: number) => ({
      id: item.id,
      order: index,
    }));

    await reorderSkills(updates);
  };

  const handleKeyboardMove = async (category: string, id: string, dir: 'up' | 'down') => {
    const items = [...(groupedSkills[category] || [])];
    const idx = items.findIndex((s) => s.id === id);
    if (idx === -1) return;
    if (dir === 'up' && idx === 0) return;
    if (dir === 'down' && idx === items.length - 1) return;

    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    const temp = items[idx];
    items[idx] = items[swapIdx];
    items[swapIdx] = temp;
    
    await handleReorder(category, items);
  };

  const handleEdit = (skill: any) => {
    setEditingSkill(skill);
    setIsFormOpen(true);
  };

  const handleDelete = (skill: any) => {
    setDeletingSkill(skill);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingSkill) {
      await deleteSkill(deletingSkill.id);
      setDeletingSkill(null);
      setIsDeleteOpen(false);
    }
  };

  if (!isMounted) return null; // Avoid hydration mismatch for DND

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Skill Index</h2>
        <button
          onClick={() => {
            setEditingSkill(null);
            setIsFormOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Entry
        </button>
      </div>

      {!CATEGORIES.some(cat => (groupedSkills[cat] || []).length > 0) ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
          <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
            <Code2 className="w-6 h-6 text-zinc-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No entries found</h3>
          <p className="text-zinc-400 max-w-sm mb-6">
            Action required: Create an entry.
          </p>
          <button
            onClick={() => {
              setEditingSkill(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Entry
          </button>
        </div>
      ) : (
        CATEGORIES.map((cat) => {
          const items = groupedSkills[cat] || [];
          if (items.length === 0) return null;

          return (
            <div key={cat} className="space-y-4">
              <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">{cat.replace('_', ' ')}</h3>
              
              <ReorderableList
                items={items}
                onReorder={(newItems) => handleReorder(cat, newItems)}
                renderOverlay={(activeId) => {
                  const activeItem = items.find((s: any) => s.id === activeId);
                  if (!activeItem) return null;
                  return (
                    <SkillRow
                      skill={activeItem}
                      isFirst={false}
                      isLast={false}
                      onMove={() => {}}
                      onEdit={() => {}}
                      onDelete={() => {}}
                      isDragOverlay
                    />
                  );
                }}
              >
                {items.map((skill: any, index: number) => (
                  <SkillRow
                    key={skill.id}
                    skill={skill}
                    isFirst={index === 0}
                    isLast={index === items.length - 1}
                    onMove={(id, dir) => handleKeyboardMove(cat, id, dir)}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </ReorderableList>
            </div>
          );
        })
      )}

      <SkillFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        skill={editingSkill} 
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Entry"
        description={`Confirm deletion of "${deletingSkill?.name}". This action is irreversible.`}
      />
    </div>
  );
}

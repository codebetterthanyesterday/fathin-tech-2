'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, GripVertical, Edit2, Trash2, Code2 } from 'lucide-react';
import { reorderSkills, deleteSkill } from '@/app/actions/skill';
import SkillFormModal from './skill-form-modal';
import DeleteConfirmModal from './delete-confirm-modal';

const CATEGORIES = ['LANGUAGE', 'FRAMEWORK', 'TOOL', 'SOFT_SKILL', 'OTHER'];

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

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;

    const sourceCat = result.source.droppableId;
    const destCat = result.destination.droppableId;

    if (sourceCat !== destCat) {
      // For this PBI, we only allow reordering within the same category to keep UX simple.
      // Changing category is done via Edit modal.
      return;
    }

    const items = Array.from(groupedSkills[sourceCat] || []);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Optimistic UI update
    const newGrouped = { ...groupedSkills, [sourceCat]: items };
    setGroupedSkills(newGrouped);

    // Prepare updates for backend
    const updates = items.map((item: any, index: number) => ({
      id: item.id,
      order: index,
    }));

    await reorderSkills(updates);
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
        <DragDropContext onDragEnd={onDragEnd}>
        {CATEGORIES.map((cat) => {
          const items = groupedSkills[cat] || [];
          if (items.length === 0) return null;

          return (
            <div key={cat} className="space-y-4">
              <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">{cat.replace('_', ' ')}</h3>
              
              <Droppable droppableId={cat}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2"
                  >
                    {items.map((skill: any, index: number) => (
                      <Draggable key={skill.id} draggableId={skill.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                              snapshot.isDragging 
                                ? 'bg-zinc-800 border-zinc-600 shadow-2xl scale-[1.02] z-50 relative' 
                                : 'bg-zinc-900/40 border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900/60'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div 
                                {...provided.dragHandleProps}
                                className="p-2 text-zinc-600 hover:text-white cursor-grab active:cursor-grabbing transition-colors"
                              >
                                <GripVertical className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="text-white font-medium">{skill.name}</h4>
                                {skill.level !== null && (
                                  <div className="flex items-center gap-1 mt-1.5">
                                    {[1, 2, 3, 4, 5].map((level) => (
                                      <div
                                        key={level}
                                        className={`w-1.5 h-1.5 rounded-full ${
                                          level <= skill.level ? 'bg-white' : 'bg-zinc-800'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEdit(skill)}
                                className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                                aria-label="Edit skill"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(skill)}
                                className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                aria-label="Delete skill"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </DragDropContext>
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

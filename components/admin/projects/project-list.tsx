'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, GripVertical, Edit2, Trash2, Star, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { reorderProjects, deleteProject } from '@/app/actions/project';
import DeleteConfirmModal from '../skills/delete-confirm-modal';
import Link from 'next/link';
import Image from 'next/image';

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

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(projects);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Optimistic UI update
    setProjects(items);

    // Prepare updates for backend
    const updates = items.map((item: any, index: number) => ({
      id: item.id,
      order: index,
    }));

    await reorderProjects(updates);
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
        <h2 className="text-xl font-semibold">Your Projects</h2>
        <Link
          href="/admin/projects/new"
          className="flex items-center gap-2 px-4 py-2 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Project
        </Link>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="projects" direction="vertical">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {projects.map((project: any, index: number) => (
                <Draggable key={project.id} draggableId={project.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`flex flex-col sm:flex-row gap-6 p-4 rounded-xl border transition-all duration-300 overflow-hidden group ${
                        snapshot.isDragging 
                          ? 'bg-zinc-800 border-zinc-600 shadow-2xl scale-[1.02] z-50 relative' 
                          : 'bg-zinc-900/40 border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900/80'
                      }`}
                    >
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div 
                          {...provided.dragHandleProps}
                          className="p-2 text-zinc-600 hover:text-white cursor-grab active:cursor-grabbing transition-colors hidden sm:block"
                        >
                          <GripVertical className="w-5 h-5" />
                        </div>
                        
                        {/* Thumbnail */}
                        <div className="relative w-full sm:w-48 h-32 bg-black rounded-lg overflow-hidden border border-zinc-800 flex-shrink-0">
                          {project.images && project.images.length > 0 ? (
                            <img 
                              src={project.images[0].url} 
                              alt={project.title} 
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-700 bg-zinc-950">
                              <ImageIcon className="w-6 h-6 mb-2 opacity-50" />
                              <span className="text-xs font-medium uppercase tracking-widest opacity-50">No Image</span>
                            </div>
                          )}
                          {project.isFeatured && (
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
                            <h3 className="text-lg font-bold text-white group-hover:text-zinc-200 transition-colors">{project.title}</h3>
                            <p className="text-zinc-500 text-xs font-mono mt-1">/{project.slug}</p>
                          </div>
                          
                          {/* Actions (Desktop) */}
                          <div className="hidden sm:flex items-center gap-2">
                            <Link
                              href={`/admin/projects/${project.id}`}
                              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                              aria-label="Edit project"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(project)}
                              className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                              aria-label="Delete project"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <p className="text-sm text-zinc-400 mt-3 line-clamp-2">{project.summary}</p>
                        
                        <div className="flex items-center gap-2 mt-auto pt-4 flex-wrap">
                          {project.techStack.slice(0, 3).map((tech: string) => (
                            <span key={tech} className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-zinc-800 text-zinc-300 rounded border border-zinc-700/50">
                              {tech}
                            </span>
                          ))}
                          {project.techStack.length > 3 && (
                            <span className="px-2 py-0.5 text-[10px] font-medium text-zinc-500">
                              +{project.techStack.length - 3} more
                            </span>
                          )}
                        </div>
                        
                        {/* Mobile Actions */}
                        <div className="sm:hidden flex items-center gap-2 mt-6 border-t border-zinc-800/50 pt-4">
                          <div 
                            {...provided.dragHandleProps}
                            className="p-2 text-zinc-600 hover:text-white mr-auto"
                          >
                            <GripVertical className="w-5 h-5" />
                          </div>
                          <Link
                            href={`/admin/projects/${project.id}`}
                            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(project)}
                            className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              
              {projects.length === 0 && (
                <div className="text-center py-20 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-2xl">
                  <p className="text-zinc-500 mb-4">No projects found.</p>
                  <Link
                    href="/admin/projects/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create First Project
                  </Link>
                </div>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Project"
        description={`Are you sure you want to delete "${deletingProject?.title}"? All associated images will also be removed. This action cannot be undone.`}
      />
    </div>
  );
}

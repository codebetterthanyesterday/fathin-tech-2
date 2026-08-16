'use client';

import { useState, useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { upsertProject } from '@/app/actions/project';
import { getAdminPath } from '@/lib/routes';
import { Loader2, Save, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import TagInput from './tag-input';
import ImageGallery, { ProjectImage } from './image-gallery';

export default function ProjectForm({ project }: { project?: any }) {
  const router = useRouter();
  
  const [techStack, setTechStack] = useState<string[]>(project?.techStack || []);
  const [images, setImages] = useState<ProjectImage[]>(project?.images || []);
  const [isFeatured, setIsFeatured] = useState<boolean>(project?.isFeatured || false);

  const initialState: { success?: string; error?: string; fieldErrors?: Record<string, string[]> } = { success: '', error: '', fieldErrors: {} };
  const actionToRun = project ? upsertProject.bind(null, project.id) : upsertProject.bind(null, null);
  const [state, formAction, isPending] = useActionState(actionToRun as any, initialState);

  // Redirect on success
  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => {
        router.push(getAdminPath('projects'));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state?.success, router]);

  return (
    <div className="w-full max-w-4xl p-6 sm:p-10 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden">
      
      {/* Global Feedback */}
      {state?.error && (
        <div className="flex items-center gap-3 p-4 mb-8 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm animate-in fade-in slide-in-from-top-2 duration-500">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{state.error}</p>
        </div>
      )}
      {state?.success && (
        <div className="flex items-center gap-3 p-4 mb-8 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm animate-in fade-in slide-in-from-top-2 duration-500">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <p>{state.success}</p>
        </div>
      )}

      <form action={formAction} className="space-y-10">
        
        {/* Hidden inputs to pass complex state to Server Action */}
        <input type="hidden" name="techStack" value={JSON.stringify(techStack)} />
        <input type="hidden" name="images" value={JSON.stringify(images)} />
        <input type="hidden" name="isFeatured" value={isFeatured.toString()} />

        {/* Basic Info Section */}
        <section className="space-y-6">
          <h3 className="text-lg font-semibold text-white border-b border-zinc-800 pb-2">Basic Information</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="title" className="block text-sm font-medium text-zinc-300">Title *</label>
              <input
                id="title"
                name="title"
                type="text"
                defaultValue={project?.title || ''}
                required
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                placeholder="System Architecture Overview"
              />
              {state?.fieldErrors?.title && <p className="text-red-400 text-xs">{state.fieldErrors.title[0]}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="slug" className="block text-sm font-medium text-zinc-300">Slug (Optional)</label>
              <input
                id="slug"
                name="slug"
                type="text"
                defaultValue={project?.slug || ''}
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all font-mono text-sm"
                placeholder="Auto-generated if empty"
              />
              {state?.fieldErrors?.slug && <p className="text-red-400 text-xs">{state.fieldErrors.slug[0]}</p>}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="summary" className="block text-sm font-medium text-zinc-300">Short Summary *</label>
              <input
                id="summary"
                name="summary"
                type="text"
                defaultValue={project?.summary || ''}
                required
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                placeholder="Concise overview (1-2 sentences)."
              />
              {state?.fieldErrors?.summary && <p className="text-red-400 text-xs">{state.fieldErrors.summary[0]}</p>}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-zinc-300">Description (Markdown Supported)</label>
              <textarea
                id="description"
                name="description"
                rows={8}
                defaultValue={project?.description || ''}
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all font-mono text-sm resize-y"
                placeholder="Enter technical case study..."
              />
            </div>
          </div>
        </section>

        {/* Tech & Links Section */}
        <section className="space-y-6">
          <h3 className="text-lg font-semibold text-white border-b border-zinc-800 pb-2">Tech & Links</h3>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-300">Tech Stack</label>
              <TagInput 
                tags={techStack} 
                onChange={setTechStack} 
                placeholder="Enter technology (e.g. Next.js)..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="demoUrl" className="block text-sm font-medium text-zinc-300">Live Demo URL</label>
                <input
                  id="demoUrl"
                  name="demoUrl"
                  type="url"
                  defaultValue={project?.demoUrl || ''}
                  className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                  placeholder="https://..."
                />
                {state?.fieldErrors?.demoUrl && <p className="text-red-400 text-xs">{state.fieldErrors.demoUrl[0]}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="repoUrl" className="block text-sm font-medium text-zinc-300">Repository URL</label>
                <input
                  id="repoUrl"
                  name="repoUrl"
                  type="url"
                  defaultValue={project?.repoUrl || ''}
                  className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                  placeholder="https://github.com/..."
                />
                {state?.fieldErrors?.repoUrl && <p className="text-red-400 text-xs">{state.fieldErrors.repoUrl[0]}</p>}
              </div>
            </div>
          </div>
        </section>

        {/* Media & Display Section */}
        <section className="space-y-6">
          <h3 className="text-lg font-semibold text-white border-b border-zinc-800 pb-2">Media & Display</h3>
          
          <div className="space-y-8">
            <div className="flex items-center justify-between p-4 bg-zinc-900/40 border border-zinc-800 rounded-xl">
              <div>
                <h4 className="text-white font-medium">Featured Project</h4>
                <p className="text-sm text-zinc-500 mt-0.5">Highlight this project on your main portfolio page.</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isFeatured}
                onClick={() => setIsFeatured(!isFeatured)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/30 ${
                  isFeatured ? 'bg-white' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform ${
                    isFeatured ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-300 mb-4">Project Gallery</label>
              <ImageGallery images={images} onChange={setImages} />
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="pt-8 border-t border-zinc-800 flex flex-col-reverse sm:flex-row items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push(getAdminPath('projects'))}
            disabled={isPending}
            className="w-full sm:w-auto px-6 py-3 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="group/btn relative w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-8 bg-white text-black font-semibold rounded-lg overflow-hidden disabled:opacity-50 transition-all duration-300 active:scale-[0.98]"
          >
            <div className="absolute inset-0 bg-zinc-200 translate-y-[100%] group-hover/btn:translate-y-0 transition-transform duration-300 pointer-events-none" />
            <div className="relative z-10 flex items-center gap-2">
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-4 h-4 transition-transform duration-300 group-hover/btn:-translate-y-0.5" />
              )}
              <span>{project ? 'Update Entry' : 'Create Entry'}</span>
            </div>
          </button>
        </div>
      </form>
    </div>
  );
}

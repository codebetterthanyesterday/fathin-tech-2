'use client';

import { useState, useActionState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { upsertProject, getExistingTechStacks, checkProjectSlug } from '@/app/actions/project';
import { getAdminPath } from '@/lib/routes';
import { Loader2, Save, ArrowLeft, CheckCircle, AlertCircle, Link as LinkIcon, Edit3, Eye, Video } from 'lucide-react';
import TagInput from './tag-input';
import ImageGallery, { ProjectImage } from './image-gallery';
import MarkdownEditor from '../markdown-editor';

export default function ProjectForm({ project }: { project?: any }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  
  // Basic states
  const [title, setTitle] = useState(project?.title || '');
  const [slug, setSlug] = useState(project?.slug || '');
  const [isAutoSlug, setIsAutoSlug] = useState(!project?.id);
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [summary, setSummary] = useState(project?.summary || '');
  const [description, setDescription] = useState(project?.description || '');
  
  // New enrich fields
  const [role, setRole] = useState(project?.role || '');
  const [duration, setDuration] = useState(project?.duration || '');
  const [teamSize, setTeamSize] = useState<string>(project?.teamSize?.toString() || '');
  const [challenges, setChallenges] = useState(project?.challenges || '');
  const [solutions, setSolutions] = useState(project?.solutions || '');
  
  // Links & Media
  const [demoUrl, setDemoUrl] = useState(project?.demoUrl || '');
  const [repoUrl, setRepoUrl] = useState(project?.repoUrl || '');
  const [videoUrl, setVideoUrl] = useState(project?.videoUrl || '');
  const [techStack, setTechStack] = useState<string[]>(project?.techStack || []);
  const [categories, setCategories] = useState<string[]>(project?.categories || []);
  const [keyMetrics, setKeyMetrics] = useState<string[]>(project?.keyMetrics || []);
  const [images, setImages] = useState<ProjectImage[]>(project?.images || []);
  const [isFeatured, setIsFeatured] = useState<boolean>(project?.isFeatured || false);

  // Editor states
  const [existingTags, setExistingTags] = useState<string[]>([]);
  const [demoPreview, setDemoPreview] = useState<any>(null);
  const [repoPreview, setRepoPreview] = useState<any>(null);

  // Drafts & unsaved changes
  const [isDirty, setIsDirty] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);

  // Form action
  const initialState: { success?: string; error?: string; fieldErrors?: Record<string, string[]> } = { success: '', error: '', fieldErrors: {} };
  const actionToRun = project ? upsertProject.bind(null, project.id) : upsertProject.bind(null, null);
  const [state, formAction, isPending] = useActionState(actionToRun as any, initialState);

  // Fetch tags
  useEffect(() => {
    getExistingTechStacks().then(res => {
      if (res.tags) setExistingTags(res.tags);
    });
  }, []);

  // Draft Auto-saving
  const draftKey = `project-draft-${project?.id || 'new'}`;
  
  useEffect(() => {
    if (!draftRestored) {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        if (confirm('A draft of this project was found. Do you want to restore it?')) {
          try {
            const data = JSON.parse(saved);
            setTitle(data.title || '');
            setSlug(data.slug || '');
            setSummary(data.summary || '');
            setDescription(data.description || '');
            setRole(data.role || '');
            setDuration(data.duration || '');
            setTeamSize(data.teamSize || '');
            setChallenges(data.challenges || '');
            setSolutions(data.solutions || '');
            setDemoUrl(data.demoUrl || '');
            setRepoUrl(data.repoUrl || '');
            setVideoUrl(data.videoUrl || '');
            if (data.techStack) setTechStack(data.techStack);
            if (data.categories) setCategories(data.categories);
            if (data.keyMetrics) setKeyMetrics(data.keyMetrics);
            if (data.isFeatured !== undefined) setIsFeatured(data.isFeatured);
            setIsDirty(true);
          } catch (e) {
            console.error('Failed to parse draft');
          }
        } else {
          localStorage.removeItem(draftKey);
        }
      }
      setDraftRestored(true);
    }
  }, [draftKey, draftRestored]);

  // Auto-save interval
  useEffect(() => {
    if (!isDirty || !draftRestored) return;
    const interval = setInterval(() => {
      localStorage.setItem(draftKey, JSON.stringify({
        title, slug, summary, description, role, duration, teamSize, challenges, solutions, demoUrl, repoUrl, videoUrl, techStack, categories, keyMetrics, isFeatured
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, [title, slug, summary, description, role, duration, teamSize, challenges, solutions, demoUrl, repoUrl, videoUrl, techStack, categories, keyMetrics, isFeatured, isDirty, draftKey, draftRestored]);

  // Unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (formRef.current) formRef.current.requestSubmit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (confirm('Are you sure you want to cancel? Unsaved changes may be lost.')) {
          router.push(getAdminPath('projects'));
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  // Live Slug Preview & Validation
  useEffect(() => {
    if (isAutoSlug) {
      const generated = title
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generated);
    }
  }, [title, isAutoSlug]);

  useEffect(() => {
    if (!slug) {
      setSlugStatus('idle');
      return;
    }
    setSlugStatus('checking');
    const timer = setTimeout(async () => {
      const res = await checkProjectSlug(slug, project?.id);
      if (res.isAvailable) setSlugStatus('available');
      else setSlugStatus('taken');
    }, 500);
    return () => clearTimeout(timer);
  }, [slug, project?.id]);

  // Link Previews
  const fetchLinkPreview = async (url: string, setter: (data: any) => void) => {
    if (!url || !url.startsWith('http')) {
      setter(null);
      return;
    }
    try {
      const res = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
      if (res.ok) {
        const data = await res.json();
        setter(data);
      } else {
        setter(null);
      }
    } catch {
      setter(null);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchLinkPreview(demoUrl, setDemoPreview), 1000);
    return () => clearTimeout(timer);
  }, [demoUrl]);

  useEffect(() => {
    const timer = setTimeout(() => fetchLinkPreview(repoUrl, setRepoPreview), 1000);
    return () => clearTimeout(timer);
  }, [repoUrl]);

  // Handle successful submit
  useEffect(() => {
    if (state?.success) {
      setIsDirty(false);
      localStorage.removeItem(draftKey);
      const timer = setTimeout(() => {
        router.push(getAdminPath('projects'));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state?.success, router, draftKey]);

  return (
    <div className="w-full max-w-6xl p-6 sm:p-10 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden">
      
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

      {isDirty && (
        <div className="absolute top-4 right-6 flex items-center gap-2 text-amber-400 text-xs font-medium bg-amber-400/10 px-3 py-1.5 rounded-full border border-amber-400/20">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          Unsaved changes
        </div>
      )}

      <form ref={formRef} action={formAction} className="space-y-12" onChange={() => setIsDirty(true)}>
        
        {/* Hidden inputs to pass complex state to Server Action */}
        <input type="hidden" name="techStack" value={JSON.stringify(techStack)} />
        <input type="hidden" name="categories" value={JSON.stringify(categories)} />
        <input type="hidden" name="keyMetrics" value={JSON.stringify(keyMetrics)} />
        <input type="hidden" name="images" value={JSON.stringify(images)} />
        <input type="hidden" name="isFeatured" value={isFeatured.toString()} />

        {/* Basic Info Section */}
        <section className="space-y-6">
          <h3 className="text-lg font-semibold text-white border-b border-zinc-800 pb-2">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="title" className="block text-sm font-medium text-zinc-300">Title *</label>
              <input
                id="title"
                name="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                placeholder="System Architecture Overview"
              />
              {state?.fieldErrors?.title && <p className="text-red-400 text-xs">{state.fieldErrors.title[0]}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="slug" className="block text-sm font-medium text-zinc-300">Slug</label>
                <button
                  type="button"
                  onClick={() => setIsAutoSlug(!isAutoSlug)}
                  className="text-[11px] text-zinc-400 hover:text-white transition-colors"
                >
                  {isAutoSlug ? 'Custom Slug' : 'Auto-Generate'}
                </button>
              </div>
              <div className="relative">
                <input
                  id="slug"
                  name="slug"
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setIsAutoSlug(false);
                  }}
                  className={`w-full px-4 py-3 bg-zinc-900/50 border rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all font-mono text-sm ${
                    slugStatus === 'taken' ? 'border-red-500/50 focus:ring-red-500/20' : 
                    slugStatus === 'available' ? 'border-emerald-500/50 focus:ring-emerald-500/20' : 
                    'border-zinc-800'
                  }`}
                  placeholder="auto-generated-slug"
                />
                {slugStatus === 'checking' && <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-zinc-500" />}
                {slugStatus === 'available' && <CheckCircle className="absolute right-3 top-3 w-4 h-4 text-emerald-400" />}
                {slugStatus === 'taken' && <AlertCircle className="absolute right-3 top-3 w-4 h-4 text-red-400" />}
              </div>
              {slugStatus === 'taken' && <p className="text-red-400 text-xs">This slug is already taken.</p>}
              {state?.fieldErrors?.slug && <p className="text-red-400 text-xs">{state.fieldErrors.slug[0]}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <label htmlFor="summary" className="block text-sm font-medium text-zinc-300">Short Summary *</label>
                <span className={`text-xs font-mono ${summary.length > 150 ? 'text-amber-400' : 'text-zinc-500'}`}>
                  {summary.length}/150
                </span>
              </div>
              <input
                id="summary"
                name="summary"
                type="text"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                required
                maxLength={200}
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                placeholder="Concise overview (1-2 sentences)."
              />
              {state?.fieldErrors?.summary && <p className="text-red-400 text-xs">{state.fieldErrors.summary[0]}</p>}
            </div>
          </div>
        </section>

        {/* Project Details Section (New) */}
        <section className="space-y-6">
          <h3 className="text-lg font-semibold text-white border-b border-zinc-800 pb-2">Project Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label htmlFor="role" className="block text-sm font-medium text-zinc-300">My Role</label>
              <input
                id="role"
                name="role"
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                placeholder="e.g. Lead Frontend"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="duration" className="block text-sm font-medium text-zinc-300">Duration</label>
              <input
                id="duration"
                name="duration"
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                placeholder="e.g. 3 Months"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="teamSize" className="block text-sm font-medium text-zinc-300">Team Size</label>
              <input
                id="teamSize"
                name="teamSize"
                type="number"
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                placeholder="e.g. 4"
                min="1"
              />
            </div>
          </div>
        </section>

        {/* Content Markdown Editors */}
        <section className="space-y-12">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-zinc-800 pb-2">Description</h3>
            <input type="hidden" name="description" value={description} />
            <MarkdownEditor 
              value={description} 
              onChange={(val) => { setDescription(val); setIsDirty(true); }}
              placeholder="Write project description in Markdown..."
              minHeight="350px"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-zinc-800 pb-2">Challenges</h3>
            <input type="hidden" name="challenges" value={challenges} />
            <MarkdownEditor 
              value={challenges} 
              onChange={(val) => { setChallenges(val); setIsDirty(true); }}
              placeholder="What were the biggest technical hurdles?"
              minHeight="250px"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-zinc-800 pb-2">Solutions & Architecture</h3>
            <input type="hidden" name="solutions" value={solutions} />
            <MarkdownEditor 
              value={solutions} 
              onChange={(val) => { setSolutions(val); setIsDirty(true); }}
              placeholder="How did you solve the challenges? System design..."
              minHeight="250px"
            />
          </div>
        </section>

        {/* Tech & Categories Section */}
        <section className="space-y-6">
          <h3 className="text-lg font-semibold text-white border-b border-zinc-800 pb-2">Classification</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-300">Tech Stack</label>
              <TagInput 
                tags={techStack} 
                onChange={(t) => { setTechStack(t); setIsDirty(true); }}
                existingTags={existingTags}
                placeholder="Enter technology (e.g. Next.js)..."
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-300">Categories / Domains</label>
              <TagInput 
                tags={categories} 
                onChange={(t) => { setCategories(t); setIsDirty(true); }}
                placeholder="e.g. E-Commerce, AI, FinTech..."
              />
            </div>
          </div>
        </section>

        {/* Key Metrics */}
        <section className="space-y-6">
          <h3 className="text-lg font-semibold text-white border-b border-zinc-800 pb-2">Key Metrics (Impact)</h3>
          <div className="space-y-2">
            <p className="text-xs text-zinc-400 mb-2">Highlight the impact of this project. Press enter to add a metric.</p>
            <TagInput 
              tags={keyMetrics} 
              onChange={(m) => { setKeyMetrics(m); setIsDirty(true); }}
              placeholder="e.g. Reduced latency by 50%"
            />
          </div>
        </section>

        {/* URLs */}
        <section className="space-y-6">
          <h3 className="text-lg font-semibold text-white border-b border-zinc-800 pb-2">Links & Demo</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Demo URL */}
            <div className="space-y-2">
              <label htmlFor="demoUrl" className="block text-sm font-medium text-zinc-300">Live Demo URL</label>
              <input
                id="demoUrl"
                name="demoUrl"
                type="url"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                onBlur={(e) => {
                  const val = e.target.value;
                  if (val && !val.startsWith('http')) setDemoUrl('https://' + val);
                }}
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                placeholder="https://..."
              />
              {state?.fieldErrors?.demoUrl && <p className="text-red-400 text-xs">{state.fieldErrors.demoUrl[0]}</p>}
              
              {demoPreview && (
                <div className="mt-3 p-3 flex items-center gap-3 bg-zinc-950/80 border border-zinc-800 rounded-lg animate-in fade-in slide-in-from-top-2">
                  {demoPreview.favicon ? (
                    <img src={demoPreview.favicon} alt="Favicon" className="w-8 h-8 rounded bg-white/10" onError={(e) => e.currentTarget.style.display = 'none'} />
                  ) : (
                    <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center">
                      <LinkIcon className="w-4 h-4 text-zinc-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{demoPreview.title || 'Live Demo'}</p>
                    <p className="text-xs text-zinc-500 truncate">{demoPreview.description || demoUrl}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Repo URL */}
            <div className="space-y-2">
              <label htmlFor="repoUrl" className="block text-sm font-medium text-zinc-300">Repository URL</label>
              <input
                id="repoUrl"
                name="repoUrl"
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                onBlur={(e) => {
                  const val = e.target.value;
                  if (val && !val.startsWith('http')) setRepoUrl('https://' + val);
                }}
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                placeholder="https://github.com/..."
              />
              {state?.fieldErrors?.repoUrl && <p className="text-red-400 text-xs">{state.fieldErrors.repoUrl[0]}</p>}

              {repoPreview && (
                <div className="mt-3 p-3 flex items-center gap-3 bg-zinc-950/80 border border-zinc-800 rounded-lg animate-in fade-in slide-in-from-top-2">
                  {repoPreview.favicon ? (
                    <img src={repoPreview.favicon} alt="Favicon" className="w-8 h-8 rounded bg-white/10" onError={(e) => e.currentTarget.style.display = 'none'} />
                  ) : (
                    <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center">
                      <LinkIcon className="w-4 h-4 text-zinc-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{repoPreview.title || 'Repository'}</p>
                    <p className="text-xs text-zinc-500 truncate">{repoPreview.description || repoUrl}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Video URL */}
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="videoUrl" className="block text-sm font-medium text-zinc-300">Video Walkthrough URL</label>
              <div className="relative">
                <Video className="absolute left-3 top-3.5 w-5 h-5 text-zinc-500" />
                <input
                  id="videoUrl"
                  name="videoUrl"
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                  placeholder="https://youtube.com/..."
                />
              </div>
              {state?.fieldErrors?.videoUrl && <p className="text-red-400 text-xs">{state.fieldErrors.videoUrl[0]}</p>}
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
              <ImageGallery images={images} onChange={(newImages) => {
                setImages(newImages);
                setIsDirty(true);
              }} />
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="pt-8 border-t border-zinc-800 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-500 font-mono">
            <span className="px-2 py-1 bg-zinc-900 rounded border border-zinc-800">⌘S</span> to save, 
            <span className="px-2 py-1 bg-zinc-900 rounded border border-zinc-800">Esc</span> to cancel
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                if (!isDirty || confirm('Are you sure you want to cancel? Unsaved changes may be lost.')) {
                  router.push(getAdminPath('projects'));
                }
              }}
              disabled={isPending}
              className="w-full sm:w-auto px-6 py-3 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || slugStatus === 'taken'}
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
        </div>
      </form>
    </div>
  );
}

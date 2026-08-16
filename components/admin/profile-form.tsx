'use client';

import { useActionState, useState, useRef } from 'react';
import { upsertProfile, ProfileActionState } from '@/app/actions/profile';
import { uploadImage } from '@/app/actions/upload';
import {
  Loader2,
  Save,
  UploadCloud,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  GripVertical,
} from 'lucide-react';
import Image from 'next/image';

const initialState: ProfileActionState = {
  success: '',
  error: '',
  fieldErrors: {},
};

export default function ProfileForm({ initialData }: { initialData: any }) {
  const [state, formAction, isPending] = useActionState(upsertProfile, initialState);
  const [photoUrl, setPhotoUrl] = useState(initialData?.photoUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setIsUploading(true);

    // Create local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPhotoUrl(localUrl);

    // Upload to Supabase
    const formData = new FormData();
    formData.append('file', file);

    const result = await uploadImage(formData);

    if (result.error) {
      setUploadError(result.error);
      setPhotoUrl(initialData?.photoUrl || ''); // Revert on failure
    } else if (result.url) {
      setPhotoUrl(result.url); // Set to actual public URL
    }

    setIsUploading(false);
  };

  const parseInitialSocials = (socials: any) => {
    if (!socials) return [];
    if (Array.isArray(socials)) {
      return socials.map((s) => ({
        platform: s.platform || '',
        url: typeof s === 'string' ? s : s.url || '',
        iconClass: s.iconClass || 'fa-solid fa-link',
      }));
    }
    if (typeof socials === 'object') {
      return Object.entries(socials).map(([key, value]) => ({
        platform: key.charAt(0).toUpperCase() + key.slice(1),
        url: value as string,
        iconClass: `fa-brands fa-${key.toLowerCase()}`,
      }));
    }
    return [];
  };

  const [socialLinks, setSocialLinks] = useState<{ platform: string; url: string; iconClass: string }[]>(
    parseInitialSocials(initialData?.socialLinks)
  );

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleSort = () => {
    if (
      dragItem.current !== null &&
      dragOverItem.current !== null &&
      dragItem.current !== dragOverItem.current
    ) {
      const _socialLinks = [...socialLinks];
      const draggedItemContent = _socialLinks.splice(dragItem.current, 1)[0];
      _socialLinks.splice(dragOverItem.current, 0, draggedItemContent);
      setSocialLinks(_socialLinks);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: '', url: '', iconClass: 'fa-solid fa-link' }]);
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const updateSocialLink = (index: number, field: string, value: string) => {
    const newLinks = [...socialLinks];
    (newLinks[index] as any)[field] = value;
    setSocialLinks(newLinks);
  };

  return (
    <div className="w-full max-w-3xl p-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

      <div className="relative z-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-white">System Profile Data</h2>
          <p className="text-zinc-400 text-sm mt-1">Configure identity credentials and public metadata.</p>
        </div>

        {/* Global Feedback Messages */}
        <div className="mb-6 space-y-3">
          {state?.error && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm animate-in fade-in slide-in-from-top-2 duration-500">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{state.error}</p>
            </div>
          )}
          {state?.success && (
            <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm animate-in fade-in slide-in-from-top-2 duration-500">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <p>{state.success}</p>
            </div>
          )}
          {uploadError && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm animate-in fade-in slide-in-from-top-2 duration-500">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>Image Upload: {uploadError}</p>
            </div>
          )}
        </div>

        <form action={formAction} className="space-y-6">
          <input type="hidden" name="photoUrl" value={photoUrl} />
          <input type="hidden" name="socialLinks" value={JSON.stringify(socialLinks)} />

          {/* Photo Upload Area */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-zinc-800">
            <div
              className="relative w-24 h-24 rounded-full overflow-hidden border border-zinc-700 bg-zinc-900 group/avatar cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity z-10">
                <UploadCloud className="text-white w-6 h-6" />
              </div>
              {isUploading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 z-10">
                  <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
                </div>
              ) : null}
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Profile Preview"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover/avatar:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600">
                  No Image
                </div>
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium text-zinc-200">Avatar Image</h3>
              <p className="text-xs text-zinc-500 mb-3 mt-1">Constraint: Square aspect ratio, &lt;5MB limit.</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                disabled={isUploading}
              >
                Update Avatar
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-zinc-300">
                Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                defaultValue={initialData?.name || ''}
                required
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-300"
                placeholder="Enter full name..."
              />
              {state?.fieldErrors?.name && (
                <p className="text-red-400 text-xs mt-1">{state.fieldErrors.name[0]}</p>
              )}
            </div>

            {/* Tagline */}
            <div className="space-y-2">
              <label htmlFor="tagline" className="block text-sm font-medium text-zinc-300">
                Tagline
              </label>
              <input
                id="tagline"
                name="tagline"
                type="text"
                defaultValue={initialData?.tagline || ''}
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-300"
                placeholder="Enter designation..."
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
                Public Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                defaultValue={initialData?.email || ''}
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-300"
                placeholder="Enter contact email..."
              />
              {state?.fieldErrors?.email && (
                <p className="text-red-400 text-xs mt-1">{state.fieldErrors.email[0]}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-zinc-300">
                Phone
              </label>
              <input
                id="phone"
                name="phone"
                type="text"
                defaultValue={initialData?.phone || ''}
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-300"
                placeholder="Enter contact number..."
              />
            </div>

            {/* Location */}
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="location" className="block text-sm font-medium text-zinc-300">
                Location
              </label>
              <input
                id="location"
                name="location"
                type="text"
                defaultValue={initialData?.location || ''}
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-300"
                placeholder="Enter primary location..."
              />
            </div>

            {/* Bio */}
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="bio" className="block text-sm font-medium text-zinc-300">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                defaultValue={initialData?.bio || ''}
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-300 resize-none"
                placeholder="Enter profile biography..."
              />
            </div>

            {/* Social Links GUI */}
            <div className="space-y-4 sm:col-span-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-zinc-300">Social Links</label>
                <button
                  type="button"
                  onClick={addSocialLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md text-xs font-medium transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create Entry
                </button>
              </div>

              {socialLinks.length === 0 ? (
                <div className="text-center py-6 bg-zinc-900/30 border border-zinc-800/50 rounded-lg border-dashed">
                  <p className="text-sm text-zinc-500">No entries found. Action required: Create an entry.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {socialLinks.map((link, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row gap-3 p-4 pl-10 bg-zinc-900/40 border border-zinc-800 rounded-lg relative group/item transition-all hover:border-zinc-700 cursor-move"
                      draggable
                      onDragStart={() => (dragItem.current = idx)}
                      onDragEnter={() => (dragOverItem.current = idx)}
                      onDragEnd={handleSort}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-hover/item:text-zinc-400">
                        <GripVertical className="w-4 h-4" />
                      </div>

                      {/* Platform */}
                      <div className="flex-1 space-y-1">
                        <label className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">
                          Platform
                        </label>
                        <input
                          type="text"
                          value={link.platform}
                          onChange={(e) => updateSocialLink(idx, 'platform', e.target.value)}
                          placeholder="Enter platform identifier..."
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/30"
                        />
                      </div>

                      {/* URL */}
                      <div className="flex-[2] space-y-1">
                        <label className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">
                          URL
                        </label>
                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) => updateSocialLink(idx, 'url', e.target.value)}
                          placeholder="Enter target URI..."
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/30"
                        />
                      </div>

                      {/* Font Awesome Icon */}
                      <div className="flex-1 space-y-1">
                        <label className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">
                          FontAwesome Class
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={link.iconClass}
                            onChange={(e) => updateSocialLink(idx, 'iconClass', e.target.value)}
                            placeholder="fa-brands fa-github"
                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/30"
                          />
                          <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center bg-zinc-800 rounded-md border border-zinc-700">
                            <i className={`${link.iconClass} text-white`}></i>
                          </div>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeSocialLink(idx)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-all border border-red-500/20"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Resume URL */}
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="resumeUrl" className="block text-sm font-medium text-zinc-300">
                Resume URL
              </label>
              <input
                id="resumeUrl"
                name="resumeUrl"
                type="url"
                defaultValue={initialData?.resumeUrl || ''}
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-300"
                placeholder="Enter document URI..."
              />
              {state?.fieldErrors?.resumeUrl && (
                <p className="text-red-400 text-xs mt-1">{state.fieldErrors.resumeUrl[0]}</p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800">
            <button
              type="submit"
              disabled={isPending || isUploading}
              className="group/btn relative w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-8 bg-white text-black font-semibold rounded-lg overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-zinc-200 translate-y-[100%] group-hover/btn:translate-y-0 transition-transform duration-300 pointer-events-none" />
              <div className="relative z-10 flex items-center gap-2">
                {isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 transition-transform duration-300 group-hover/btn:-translate-y-0.5" />
                )}
                <span>Update Configuration</span>
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

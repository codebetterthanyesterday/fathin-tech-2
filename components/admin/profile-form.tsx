'use client';

import { useActionState, useState, useRef, useEffect } from 'react';
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
import LocaleTabSelector from './layout/locale-tab-selector';
import { ReorderableList, ReorderableDragHandle, ReorderableFallbackControls, useReorderableItem } from './shared/reorderable-list';

function SocialLinkItem({
  link,
  index,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onUpdate,
  onRemove,
}: {
  link: any;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onUpdate: (field: string, value: string) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, style, isDragging } = useReorderableItem(link.id);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 bg-zinc-900/30 border border-zinc-800/80 rounded-lg group/item ${
        isDragging ? 'shadow-xl shadow-black/50 border-white/20' : ''
      }`}
    >
      <ReorderableDragHandle attributes={attributes} listeners={listeners} isDragging={isDragging} />

      {/* Icon Selector / Preview */}
      <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-zinc-300 flex-shrink-0">
        <i className={link.iconClass || 'fa-solid fa-link'}></i>
      </div>

      <input
        type="text"
        placeholder="Platform (e.g. GitHub)"
        value={link.platform}
        onChange={(e) => onUpdate('platform', e.target.value)}
        className="w-1/4 px-3 py-1.5 bg-zinc-900 border border-zinc-700/50 rounded-md text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/20"
      />

      <input
        type="text"
        placeholder="Icon Class (fa-brands fa-github)"
        value={link.iconClass}
        onChange={(e) => onUpdate('iconClass', e.target.value)}
        className="w-1/4 px-3 py-1.5 bg-zinc-900 border border-zinc-700/50 rounded-md text-xs font-mono text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/20"
      />

      <input
        type="text"
        placeholder="https://... atau url profil"
        value={link.url}
        onChange={(e) => onUpdate('url', e.target.value)}
        className="flex-1 px-3 py-1.5 bg-zinc-900 border border-zinc-700/50 rounded-md text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/20"
      />

      <ReorderableFallbackControls
        isFirst={isFirst}
        isLast={isLast}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
      />

      <button
        type="button"
        onClick={onRemove}
        className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

const initialState: ProfileActionState = {
  success: '',
  error: '',
  fieldErrors: {},
};

export default function ProfileForm({ initialData }: { initialData: any }) {
  const [state, formAction, isPending] = useActionState(upsertProfile, initialState);
  const [photoUrl, setPhotoUrl] = useState(initialData?.photoUrl || '');
  const [name, setName] = useState(initialData?.name || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [resumeUrl, setResumeUrl] = useState(initialData?.resumeUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Translation states
  const idTrans = initialData?.translations?.find((t: any) => t.locale === 'id');
  const enTrans = initialData?.translations?.find((t: any) => t.locale === 'en');

  const [activeLocale, setActiveLocale] = useState<'id' | 'en'>('id');
  const [translations, setTranslations] = useState({
    id: {
      tagline: idTrans?.tagline || initialData?.tagline || '',
      bio: idTrans?.bio || initialData?.bio || '',
      location: idTrans?.location || initialData?.location || '',
    },
    en: {
      tagline: enTrans?.tagline || '',
      bio: enTrans?.bio || '',
      location: enTrans?.location || '',
    },
  });

  // Sync state when initialData updates (e.g. after revalidation)
  useEffect(() => {
    if (initialData) {
      const idT = initialData?.translations?.find((t: any) => t.locale === 'id');
      const enT = initialData?.translations?.find((t: any) => t.locale === 'en');
      setName(initialData?.name || '');
      setEmail(initialData?.email || '');
      setPhone(initialData?.phone || '');
      setResumeUrl(initialData?.resumeUrl || '');
      setPhotoUrl(initialData?.photoUrl || '');
      setTranslations({
        id: {
          tagline: idT?.tagline || initialData?.tagline || '',
          bio: idT?.bio || initialData?.bio || '',
          location: idT?.location || initialData?.location || '',
        },
        en: {
          tagline: enT?.tagline || '',
          bio: enT?.bio || '',
          location: enT?.location || '',
        },
      });
      setSocialLinks(parseInitialSocials(initialData?.socialLinks));
    }
  }, [initialData]);

  const handleTranslationChange = (field: 'tagline' | 'bio' | 'location', value: string) => {
    setTranslations((prev) => ({
      ...prev,
      [activeLocale]: {
        ...prev[activeLocale],
        [field]: value,
      },
    }));
  };

  const isIdComplete = !!translations.id.tagline?.trim() || !!translations.id.bio?.trim() || !!translations.id.location?.trim();
  const isEnComplete = !!translations.en.tagline?.trim() && !!translations.en.bio?.trim();

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setIsUploading(true);

    const localUrl = URL.createObjectURL(file);
    setPhotoUrl(localUrl);

    const formData = new FormData();
    formData.append('file', file);

    const result = await uploadImage(formData);

    if (result.error) {
      setUploadError(result.error);
      setPhotoUrl(initialData?.photoUrl || '');
    } else if (result.url) {
      setPhotoUrl(result.url);
    }

    setIsUploading(false);
  };

  const parseInitialSocials = (socials: any) => {
    if (!socials) return [];
    if (Array.isArray(socials)) {
      return socials.map((s) => ({
        id: crypto.randomUUID(),
        platform: s.platform || '',
        url: typeof s === 'string' ? s : s.url || '',
        iconClass: s.iconClass || 'fa-solid fa-link',
      }));
    }
    if (typeof socials === 'object') {
      return Object.entries(socials).map(([key, value]) => ({
        id: crypto.randomUUID(),
        platform: key.charAt(0).toUpperCase() + key.slice(1),
        url: value as string,
        iconClass: `fa-brands fa-${key.toLowerCase()}`,
      }));
    }
    return [];
  };

  const [socialLinks, setSocialLinks] = useState<{ id: string; platform: string; url: string; iconClass: string }[]>(
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
    setSocialLinks([...socialLinks, { id: crypto.randomUUID(), platform: '', url: '', iconClass: 'fa-solid fa-link' }]);
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
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">System Profile Data</h2>
            <p className="text-zinc-400 text-sm mt-1">Configure identity credentials, language translations, and public metadata.</p>
          </div>
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

        <form action={formAction} className="space-y-8">
          <input type="hidden" name="photoUrl" value={photoUrl} />
          <input type="hidden" name="socialLinks" value={JSON.stringify(socialLinks.map(({ id, ...rest }) => rest))} />

          {/* Hidden inputs to submit all locales */}
          <input type="hidden" name="tagline_id" value={translations.id.tagline} />
          <input type="hidden" name="bio_id" value={translations.id.bio} />
          <input type="hidden" name="location_id" value={translations.id.location} />
          <input type="hidden" name="tagline_en" value={translations.en.tagline} />
          <input type="hidden" name="bio_en" value={translations.en.bio} />
          <input type="hidden" name="location_en" value={translations.en.location} />

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
              <p className="text-xs text-zinc-500 mb-3 mt-1">Constraint: Square aspect ratio, &lt;10MB limit.</p>
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

          {/* Non-Translatable Core Identity: Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-zinc-300">
              Full Name * <span className="text-xs text-zinc-500 font-normal">(Shared across all languages)</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-300"
              placeholder="Enter full name..."
            />
            {state?.fieldErrors?.name && (
              <p className="text-red-400 text-xs mt-1">{state.fieldErrors.name[0]}</p>
            )}
          </div>

          {/* TRANSLATABLE FIELDS (Tagline, Bio & Location) WITH LOCALE TABS */}
          <div className="p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
              <div>
                <h3 className="text-sm font-bold tracking-wide uppercase text-zinc-300">
                  Translatable Content
                </h3>
                <p className="text-xs text-zinc-500">
                  Tagline, Bio, dan Lokasi dalam Bahasa Indonesia dan English.
                </p>
              </div>

              <LocaleTabSelector
                activeLocale={activeLocale}
                onLocaleChange={setActiveLocale}
                status={{
                  id: { isComplete: isIdComplete },
                  en: { isComplete: isEnComplete },
                }}
              />
            </div>

            {/* Tagline */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor={`tagline_${activeLocale}`} className="block text-sm font-medium text-zinc-300">
                  Tagline ({activeLocale.toUpperCase()})
                </label>
                <span className="text-xs text-zinc-500 font-mono">
                  {activeLocale === 'id' ? 'Bahasa Indonesia' : 'English'}
                </span>
              </div>
              <input
                id={`tagline_${activeLocale}`}
                type="text"
                value={translations[activeLocale].tagline}
                onChange={(e) => handleTranslationChange('tagline', e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-300"
                placeholder={activeLocale === 'id' ? 'cth. Full-Stack Engineer & System Architect' : 'e.g. Full-Stack Engineer & System Architect'}
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor={`location_${activeLocale}`} className="block text-sm font-medium text-zinc-300">
                  Location ({activeLocale.toUpperCase()})
                </label>
                <span className="text-xs text-zinc-500 font-mono">
                  {activeLocale === 'id' ? 'Bahasa Indonesia' : 'English'}
                </span>
              </div>
              <input
                id={`location_${activeLocale}`}
                type="text"
                value={translations[activeLocale].location}
                onChange={(e) => handleTranslationChange('location', e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-300"
                placeholder={activeLocale === 'id' ? 'cth. Bandung, Jawa Barat, Indonesia' : 'e.g. Bandung, West Java, Indonesia'}
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor={`bio_${activeLocale}`} className="block text-sm font-medium text-zinc-300">
                  Bio / Summary ({activeLocale.toUpperCase()})
                </label>
                <span className="text-xs text-zinc-500 font-mono">
                  {activeLocale === 'id' ? 'Bahasa Indonesia' : 'English'}
                </span>
              </div>
              <textarea
                id={`bio_${activeLocale}`}
                rows={5}
                value={translations[activeLocale].bio}
                onChange={(e) => handleTranslationChange('bio', e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-300 resize-y"
                placeholder={activeLocale === 'id' ? 'Tuliskan ringkasan bio profil Anda...' : 'Write your profile bio summary in English...'}
              />
            </div>
          </div>

          {/* Contact Details (Language Invariant) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
                Public Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-300"
                placeholder="Enter contact number..."
              />
            </div>

            {/* Resume URL */}
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="resumeUrl" className="block text-sm font-medium text-zinc-300">
                Resume/CV URL
              </label>
              <input
                id="resumeUrl"
                name="resumeUrl"
                type="text"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-300"
                placeholder="https://... atau tautan Google Drive / Dropbox"
              />
              {state?.fieldErrors?.resumeUrl && (
                <p className="text-red-400 text-xs mt-1">{state.fieldErrors.resumeUrl[0]}</p>
              )}
            </div>
          </div>

          {/* Social Links Manager */}
          <div className="pt-6 border-t border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-zinc-200">Social Media Connections</h3>
                <p className="text-xs text-zinc-500">Configure external profiles and platform references.</p>
              </div>
              <button
                type="button"
                onClick={addSocialLink}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-md text-xs font-medium text-zinc-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Link
              </button>
            </div>

            <div className="space-y-3">
              <ReorderableList
                items={socialLinks}
                onReorder={setSocialLinks}
                renderOverlay={(activeId) => {
                  const link = socialLinks.find(s => s.id === activeId);
                  if (!link) return null;
                  return (
                    <SocialLinkItem
                      link={link}
                      index={0}
                      isFirst={false}
                      isLast={false}
                      onMoveUp={() => {}}
                      onMoveDown={() => {}}
                      onUpdate={() => {}}
                      onRemove={() => {}}
                    />
                  );
                }}
              >
                {socialLinks.map((link, index) => (
                  <SocialLinkItem
                    key={link.id}
                    link={link}
                    index={index}
                    isFirst={index === 0}
                    isLast={index === socialLinks.length - 1}
                    onMoveUp={() => {
                      const newLinks = [...socialLinks];
                      const temp = newLinks[index - 1];
                      newLinks[index - 1] = newLinks[index];
                      newLinks[index] = temp;
                      setSocialLinks(newLinks);
                    }}
                    onMoveDown={() => {
                      const newLinks = [...socialLinks];
                      const temp = newLinks[index + 1];
                      newLinks[index + 1] = newLinks[index];
                      newLinks[index] = temp;
                      setSocialLinks(newLinks);
                    }}
                    onUpdate={(field, value) => updateSocialLink(index, field, value)}
                    onRemove={() => removeSocialLink(index)}
                  />
                ))}
              </ReorderableList>

              {socialLinks.length === 0 && (
                <div className="text-center py-6 border border-dashed border-zinc-800 rounded-lg text-zinc-600 text-sm">
                  No social links configured yet.
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-zinc-800">
            <button
              type="submit"
              disabled={isPending || isUploading}
              className="flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition-all duration-300 shadow-lg shadow-white/5 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

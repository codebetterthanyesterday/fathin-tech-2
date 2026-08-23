'use client';

import { useState, useActionState, useEffect, useRef, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import { upsertCertification } from '@/app/actions/certification';
import { getAdminPath } from '@/lib/routes';
import { Loader2, Save, Image as ImageIcon, Link as LinkIcon, Star, Eye, CalendarDays } from 'lucide-react';
import LocaleTabSelector from '../layout/locale-tab-selector';
import CategoryInput, { CategoryItem } from './category-input';

export default function CertificationForm({
  initialData,
  existingCategories = [],
}: {
  initialData?: any;
  existingCategories?: CategoryItem[];
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const idTrans = initialData?.translations?.find((t: any) => t.locale === 'id');
  const enTrans = initialData?.translations?.find((t: any) => t.locale === 'en');

  const [activeLocale, setActiveLocale] = useState<'id' | 'en'>('id');
  const [translations, setTranslations] = useState({
    id: {
      title: idTrans?.title || initialData?.title || '',
      issuingOrg: idTrans?.issuingOrg || initialData?.issuingOrg || '',
    },
    en: {
      title: enTrans?.title || '',
      issuingOrg: enTrans?.issuingOrg || '',
    },
  });

  const [issueDate, setIssueDate] = useState(
    initialData?.issueDate
      ? new Date(initialData.issueDate).toISOString().split('T')[0]
      : ''
  );
  const [expiryDate, setExpiryDate] = useState(
    initialData?.expiryDate
      ? new Date(initialData.expiryDate).toISOString().split('T')[0]
      : ''
  );
  const [neverExpires, setNeverExpires] = useState(!initialData?.expiryDate);
  const [credentialId, setCredentialId] = useState(initialData?.credentialId || '');
  const [credentialUrl, setCredentialUrl] = useState(initialData?.credentialUrl || '');
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '');
  const [isVisible, setIsVisible] = useState(initialData?.isVisible ?? true);
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured ?? false);

  const initialCategories: CategoryItem[] = (initialData?.categories || []).map((c: any) => ({
    id: c.category?.id || c.categoryId,
    name: c.category?.name || '',
    dimension: c.category?.dimension || 'SKILL',
  }));
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);

  const [state, formAction, isPending] = useActionState(upsertCertification, {});

  useEffect(() => {
    if (state.success) {
      router.push(getAdminPath('certifications'));
    }
  }, [state.success, router]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData();
    if (initialData?.id) fd.append('id', initialData.id);
    fd.append('title_id', translations.id.title);
    fd.append('issuingOrg_id', translations.id.issuingOrg);
    fd.append('title_en', translations.en.title);
    fd.append('issuingOrg_en', translations.en.issuingOrg);
    fd.append('issueDate', issueDate);
    fd.append('expiryDate', neverExpires ? '' : expiryDate);
    fd.append('credentialId', credentialId);
    fd.append('credentialUrl', credentialUrl);
    fd.append('imageUrl', imageUrl);
    fd.append('isVisible', String(isVisible));
    fd.append('isFeatured', String(isFeatured));
    fd.append('categoriesJson', JSON.stringify(categories));
    startTransition(() => {
      formAction(fd);
    });
  };

  const inputClass =
    'w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors';
  const labelClass = 'block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5';

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
      {state.error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {state.error}
        </div>
      )}

      {/* Locale tabs */}
      <LocaleTabSelector activeLocale={activeLocale} onLocaleChange={setActiveLocale} />

      {/* Core fields */}
      <div className="space-y-5">
        <div>
          <label className={labelClass}>
            Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={translations[activeLocale].title}
            onChange={(e) =>
              setTranslations((prev) => ({
                ...prev,
                [activeLocale]: { ...prev[activeLocale], title: e.target.value },
              }))
            }
            placeholder={activeLocale === 'id' ? 'Nama sertifikasi...' : 'Certification name...'}
            className={inputClass}
            required={activeLocale === 'id'}
          />
          {state.fieldErrors?.title_id && activeLocale === 'id' && (
            <p className="mt-1 text-xs text-red-400">{state.fieldErrors.title_id[0]}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>
            Issuing Organization <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={translations[activeLocale].issuingOrg}
            onChange={(e) =>
              setTranslations((prev) => ({
                ...prev,
                [activeLocale]: { ...prev[activeLocale], issuingOrg: e.target.value },
              }))
            }
            placeholder={activeLocale === 'id' ? 'Nama penerbit...' : 'Organization name...'}
            className={inputClass}
            required={activeLocale === 'id'}
          />
          {state.fieldErrors?.issuingOrg_id && activeLocale === 'id' && (
            <p className="mt-1 text-xs text-red-400">{state.fieldErrors.issuingOrg_id[0]}</p>
          )}
        </div>
      </div>

      {/* Dates */}
      <div className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800/80 space-y-4">
        <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
          <CalendarDays className="w-4 h-4" /> Dates
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              Issue Date <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className={inputClass}
              required
            />
            {state.fieldErrors?.issueDate && (
              <p className="mt-1 text-xs text-red-400">{state.fieldErrors.issueDate[0]}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Expiry Date</label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              disabled={neverExpires}
              className={`${inputClass} disabled:opacity-40 disabled:cursor-not-allowed`}
            />
            {state.fieldErrors?.expiryDate && (
              <p className="mt-1 text-xs text-red-400">{state.fieldErrors.expiryDate[0]}</p>
            )}
          </div>
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer group">
          <div className="relative flex items-center justify-center">
            <input
              type="checkbox"
              checked={neverExpires}
              onChange={(e) => {
                setNeverExpires(e.target.checked);
                if (e.target.checked) setExpiryDate('');
              }}
              className="peer sr-only"
            />
            <div className="w-5 h-5 border-2 border-zinc-600 rounded bg-transparent peer-checked:bg-white peer-checked:border-white transition-colors" />
            <svg
              className="absolute w-3.5 h-3.5 text-black opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
              viewBox="0 0 14 10"
              fill="none"
            >
              <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-sm text-zinc-400 group-hover:text-zinc-200 transition-colors">
            Never expires
          </span>
        </label>
      </div>

      {/* Credential fields */}
      <div className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800/80 space-y-4">
        <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
          <LinkIcon className="w-4 h-4" /> Credential
        </h3>

        <div>
          <label className={labelClass}>Credential ID</label>
          <input
            type="text"
            value={credentialId}
            onChange={(e) => setCredentialId(e.target.value)}
            placeholder="e.g. AWS-12345..."
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Credential URL</label>
          <input
            type="url"
            value={credentialUrl}
            onChange={(e) => setCredentialUrl(e.target.value)}
            placeholder="https://..."
            className={inputClass}
          />
          {state.fieldErrors?.credentialUrl && (
            <p className="mt-1 text-xs text-red-400">{state.fieldErrors.credentialUrl[0]}</p>
          )}
        </div>
      </div>

      {/* Image */}
      <div className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800/80 space-y-4">
        <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
          <ImageIcon className="w-4 h-4" /> Badge / Certificate Image
        </h3>

        <div>
          <label className={labelClass}>Image URL</label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
            className={inputClass}
          />
        </div>

        {imageUrl && (
          <div className="w-24 h-24 rounded-xl overflow-hidden border border-zinc-700 bg-zinc-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="preview" className="w-full h-full object-contain p-2" />
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800/80 space-y-4">
        <h3 className="text-sm font-semibold text-zinc-300">Categories</h3>
        <CategoryInput
          value={categories}
          onChange={setCategories}
          existingCategories={existingCategories}
        />
      </div>

      {/* Settings */}
      <div className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800/80 space-y-4">
        <h3 className="text-sm font-semibold text-zinc-300">Settings</h3>

        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative flex items-center justify-center mt-0.5">
            <input
              type="checkbox"
              checked={isVisible}
              onChange={(e) => setIsVisible(e.target.checked)}
              className="peer sr-only"
            />
            <div className="w-5 h-5 border-2 border-zinc-600 rounded bg-transparent peer-checked:bg-white peer-checked:border-white transition-colors" />
            <svg
              className="absolute w-3.5 h-3.5 text-black opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
              viewBox="0 0 14 10"
              fill="none"
            >
              <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-medium text-white group-hover:text-zinc-200 transition-colors flex items-center gap-2">
              <Eye className="w-4 h-4" /> Publish
            </div>
            <div className="text-xs text-zinc-500 mt-0.5">
              Visible on the public site.
            </div>
          </div>
        </label>

        <label className="flex items-start gap-3 cursor-pointer group pt-3 border-t border-white/5">
          <div className="relative flex items-center justify-center mt-0.5">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="peer sr-only"
            />
            <div className="w-5 h-5 border-2 border-zinc-600 rounded bg-transparent peer-checked:bg-white peer-checked:border-white transition-colors" />
            <svg
              className="absolute w-3.5 h-3.5 text-black opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
              viewBox="0 0 14 10"
              fill="none"
            >
              <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-medium text-white group-hover:text-zinc-200 transition-colors flex items-center gap-2">
              <Star className="w-4 h-4" /> Feature on Homepage
            </div>
            <div className="text-xs text-zinc-500 mt-0.5">
              Shown in the certifications teaser section on the homepage.
            </div>
          </div>
        </label>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-black text-sm font-semibold rounded-lg hover:bg-zinc-200 disabled:opacity-50 transition-colors"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isPending ? 'Saving...' : 'Save Certification'}
        </button>
        <button
          type="button"
          onClick={() => router.push(getAdminPath('certifications'))}
          className="px-5 py-2.5 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

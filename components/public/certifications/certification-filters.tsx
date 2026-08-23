'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { useTransition } from 'react';

interface FilterCategory {
  id: string;
  name: string;
  dimension: 'SKILL' | 'ISSUER' | 'TYPE';
  count?: number;
}

interface CertificationFiltersProps {
  allCategories: FilterCategory[];
  selectedCategoryIds: string[];
  locale: string;
}

export default function CertificationFilters({
  allCategories,
  selectedCategoryIds,
  locale,
}: CertificationFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('certifications');
  const [isPending, startTransition] = useTransition();

  const skillCats = allCategories.filter((c) => c.dimension === 'SKILL');
  const issuerCats = allCategories.filter((c) => c.dimension === 'ISSUER');
  const typeCats = allCategories.filter((c) => c.dimension === 'TYPE');

  const toggleCategory = (id: string) => {
    const newSelected = selectedCategoryIds.includes(id)
      ? selectedCategoryIds.filter((s) => s !== id)
      : [...selectedCategoryIds, id];

    const params = new URLSearchParams();
    newSelected.forEach((catId) => params.append('cat', catId));
    params.set('page', '1');

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const clearFilters = () => {
    startTransition(() => {
      router.push(pathname);
    });
  };

  const hasFilters = selectedCategoryIds.length > 0;

  if (allCategories.length === 0) return null;

  function DimensionGroup({ cats, label }: { cats: FilterCategory[]; label: string }) {
    if (cats.length === 0) return null;
    return (
      <div className="space-y-2">
        <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
          {label}
        </p>
        <div className="flex flex-wrap gap-2">
          {cats.map((cat) => {
            const active = selectedCategoryIds.includes(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                disabled={isPending}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--text-primary)]/40 ${
                  active
                    ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] border-[var(--text-primary)]'
                    : 'bg-transparent text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'
                } ${isPending ? 'opacity-60' : ''}`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-5 transition-opacity ${isPending ? 'opacity-60' : ''}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[var(--text-primary)]">{t('categories')}</p>
        {hasFilters && (
          <button
            onClick={clearFilters}
            disabled={isPending}
            className="flex items-center gap-1 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            {t('clearFilters')}
          </button>
        )}
      </div>

      <DimensionGroup cats={skillCats} label={t('filterSkill')} />
      <DimensionGroup cats={issuerCats} label={t('filterIssuer')} />
      <DimensionGroup cats={typeCats} label={t('filterType')} />
    </div>
  );
}

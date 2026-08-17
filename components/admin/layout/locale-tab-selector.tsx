'use client';

import React from 'react';
import { Globe, CheckCircle2, AlertCircle } from 'lucide-react';

export interface LocaleStatus {
  isComplete: boolean;
  emptyFieldsCount?: number;
}

interface LocaleTabSelectorProps {
  activeLocale: 'id' | 'en';
  onLocaleChange: (locale: 'id' | 'en') => void;
  status?: {
    id?: LocaleStatus;
    en?: LocaleStatus;
  };
  className?: string;
}

export default function LocaleTabSelector({
  activeLocale,
  onLocaleChange,
  status = {
    id: { isComplete: true },
    en: { isComplete: false },
  },
  className = '',
}: LocaleTabSelectorProps) {
  const tabs: Array<{
    code: 'id' | 'en';
    label: string;
    flag: string;
  }> = [
    { code: 'id', label: 'Bahasa Indonesia (Default)', flag: '🇮🇩' },
    { code: 'en', label: 'English (EN)', flag: '🇬🇧' },
  ];

  return (
    <div className={`p-1.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl border border-zinc-200 dark:border-zinc-700/60 inline-flex flex-wrap items-center gap-1.5 shadow-sm ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeLocale === tab.code;
        const currentStatus = status[tab.code];
        const isComplete = currentStatus?.isComplete ?? false;

        return (
          <button
            key={tab.code}
            type="button"
            onClick={() => onLocaleChange(tab.code)}
            className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 select-none ${
              isActive
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm border border-zinc-200/80 dark:border-zinc-700 font-semibold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
            }`}
          >
            <span className="text-base leading-none">{tab.flag}</span>
            <span>{tab.label}</span>

            {/* Translation Completeness Status Badge */}
            {isComplete ? (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50"
                title="Semua field bahasa ini terisi"
              >
                <CheckCircle2 className="w-3 h-3" />
                <span className="hidden sm:inline">Terisi</span>
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 animate-pulse"
                title="Belum diterjemahkan atau belum lengkap"
              >
                <AlertCircle className="w-3 h-3" />
                <span>Belum Diterjemahkan</span>
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

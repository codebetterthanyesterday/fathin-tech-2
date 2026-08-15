'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { generateThemeColorTokens } from '@/lib/theme/colors';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PreviewSyncListener() {
  const { setTheme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Only listen for messages if we are in an iframe
    if (window === window.parent) return;

    // Notify parent that the listener is ready
    window.parent.postMessage({ type: 'PREVIEW_LISTENER_READY' }, '*');

    const handleMessage = (event: MessageEvent) => {
      // Basic security check (allow same origin)
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === 'THEME_PREVIEW_SYNC') {
        const { themeAccentColor, themeFont, themeTemplate, previewMode } = event.data.payload;

        // 1. Update Dark/Light Mode
        if (previewMode) {
          document.documentElement.setAttribute('data-theme', previewMode);
          // Also set style directly to overwrite any next-themes transitions temporarily if needed, though this should be enough
        }

        // 2. Update Font
        if (themeFont) {
          const FONT_VARIABLES: Record<string, string> = {
            'Geist': 'var(--font-geist-sans)',
            'Inter': 'var(--font-inter)',
            'Space Grotesk': 'var(--font-space-grotesk)',
            'Playfair Display': 'var(--font-playfair)',
            'JetBrains Mono': 'var(--font-jetbrains-mono)',
          };
          const fontVar = FONT_VARIABLES[themeFont] || 'var(--font-geist-sans)';
          document.documentElement.style.setProperty('--theme-font', fontVar);
        }

        // 3. Update Accent Color
        if (themeAccentColor) {
          const themeTokens = generateThemeColorTokens(themeAccentColor);
          Object.entries(themeTokens).forEach(([key, value]) => {
            document.documentElement.style.setProperty(key, value as string);
          });
        }

        // 4. Update Template (only if changed)
        const currentTemplate = searchParams.get('template');
        if (themeTemplate && currentTemplate !== themeTemplate) {
          const params = new URLSearchParams(searchParams.toString());
          params.set('template', themeTemplate);
          router.replace(`/?${params.toString()}`, { scroll: false });
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [setTheme, router, searchParams]);

  return null;
}

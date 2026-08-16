'use client';

import { useActionState, useState, useEffect, useRef } from 'react';
import { updateThemeSettings, SettingsActionState } from '@/app/actions/settings';
import { useTheme } from 'next-themes';
import {
  Paintbrush,
  RotateCcw,
  Monitor,
  LayoutTemplate,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Sun,
  Moon,
  X,
  Tablet,
  Smartphone,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { generateThemeColorTokens } from '@/lib/theme/colors';
import { createPortal } from 'react-dom';

const AccentColorPicker = dynamic(() => import('./accent-color-picker'), {
  loading: () => <div className="h-10 w-full animate-pulse bg-zinc-800 rounded-xl" />,
  ssr: false,
});

const initialState: SettingsActionState = {
  success: '',
  error: '',
  fieldErrors: {},
};

const PRESET_FONTS = [
  { name: 'Geist', varName: 'var(--font-geist-sans)' },
  { name: 'Inter', varName: 'var(--font-inter)' },
  { name: 'Space Grotesk', varName: 'var(--font-space-grotesk)' },
  { name: 'Playfair Display', varName: 'var(--font-playfair)' },
  { name: 'JetBrains Mono', varName: 'var(--font-jetbrains-mono)' },
];

export default function ThemeSettingsForm({ initialData }: { initialData: any }) {
  const [state, formAction, isPending] = useActionState(updateThemeSettings, initialState);
  const [themeAccentColor, setThemeAccentColor] = useState(initialData?.themeAccentColor || '#ffffff');
  const [themeFont, setThemeFont] = useState(initialData?.themeFont || 'Geist');
  const [themeTemplate, setThemeTemplate] = useState(initialData?.themeTemplate || 'minimal');
  
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [mounted, setMounted] = useState(false);

  const { resolvedTheme } = useTheme();
  const [previewMode, setPreviewMode] = useState<'dark' | 'light'>('dark');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync state to iframe when changed
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'THEME_PREVIEW_SYNC',
        payload: {
          themeAccentColor,
          themeFont,
          themeTemplate,
          previewMode,
        }
      }, '*');
    }
  }, [themeAccentColor, themeFont, themeTemplate, previewMode]);

  // Listen for handshake from iframe to send initial state
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'PREVIEW_LISTENER_READY') {
        if (iframeRef.current && iframeRef.current.contentWindow) {
          iframeRef.current.contentWindow.postMessage({
            type: 'THEME_PREVIEW_SYNC',
            payload: {
              themeAccentColor,
              themeFont,
              themeTemplate,
              previewMode,
            }
          }, '*');
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [themeAccentColor, themeFont, themeTemplate, previewMode]);

  // Sync initial preview mode with resolved system/client theme
  useEffect(() => {
    if (resolvedTheme === 'light' || resolvedTheme === 'dark') {
      setPreviewMode(resolvedTheme);
    }
  }, [resolvedTheme]);

  const handleReset = () => {
    setThemeAccentColor('#ffffff');
    setThemeFont('Geist');
    setThemeTemplate('minimal');
  };

  const modalContent = isPreviewModalOpen ? (
    <div data-theme="dark" className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-md">
      {/* Modal Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-black">
        <div className="flex flex-wrap items-center gap-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Monitor className="w-5 h-5 text-zinc-400" />
            Live Theme Preview
          </h3>
          
          {/* Device Switcher */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-xs shadow-inner">
            <button
              type="button"
              onClick={() => setPreviewDevice('desktop')}
              className={`flex items-center justify-center p-1.5 rounded-md transition-all ${
                previewDevice === 'desktop' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Desktop"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice('tablet')}
              className={`flex items-center justify-center p-1.5 rounded-md transition-all ${
                previewDevice === 'tablet' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Tablet"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice('mobile')}
              className={`flex items-center justify-center p-1.5 rounded-md transition-all ${
                previewDevice === 'mobile' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Mobile"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
          
          {/* Dark / Light Switcher */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-xs shadow-inner">
            <button
              type="button"
              onClick={() => setPreviewMode('dark')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                previewMode === 'dark'
                  ? 'bg-zinc-800 text-white font-medium shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Dark</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('light')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                previewMode === 'light'
                  ? 'bg-zinc-200 text-zinc-900 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Light</span>
            </button>
          </div>
          
          <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider hidden sm:inline ml-2">
            Template: {themeTemplate}
          </span>
        </div>
        
        <button
          type="button"
          onClick={() => setIsPreviewModalOpen(false)}
          className="text-zinc-400 hover:text-white transition-colors p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          <span className="text-sm font-medium">Close</span>
        </button>
      </div>
      
      {/* Modal Body / iframe */}
      <div className={`flex-1 w-full bg-zinc-950 overflow-hidden relative flex justify-center ${previewDevice === 'desktop' ? '' : 'items-center py-8'}`}>
        <div 
          className={`relative overflow-hidden transition-all duration-500 ease-in-out flex flex-col bg-[var(--bg-primary)] ${
            previewDevice === 'mobile' 
              ? 'w-[375px] h-[812px] max-h-full rounded-[2.5rem] ring-8 ring-zinc-900 shadow-2xl'
              : previewDevice === 'tablet'
              ? 'w-[768px] h-[1024px] max-h-full rounded-[2rem] ring-8 ring-zinc-900 shadow-2xl'
              : 'w-full h-full'
          }`}
        >
          {previewDevice !== 'desktop' && (
            <div className="absolute top-0 inset-x-0 h-7 bg-zinc-900 z-10 flex justify-center items-center pointer-events-none rounded-t-[2.5rem]">
              <div className="w-16 h-4 bg-black rounded-full" />
            </div>
          )}
          
          <iframe
            ref={iframeRef}
            src={`/?template=${themeTemplate}`}
            className={`w-full h-full border-none transition-all duration-300 ${previewDevice !== 'desktop' ? 'pt-7' : ''}`}
            title="Live Preview"
            onLoad={() => {
              if (iframeRef.current && iframeRef.current.contentWindow) {
                iframeRef.current.contentWindow.postMessage({
                  type: 'THEME_PREVIEW_SYNC',
                  payload: { themeAccentColor, themeFont, themeTemplate, previewMode }
                }, '*');
              }
            }}
          />
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="w-full max-w-5xl p-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden group">
      {mounted && createPortal(modalContent, document.body)}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

      <div className="relative z-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <Paintbrush className="w-6 h-6 text-zinc-300" />
              Theme Configuration
            </h2>
            <p className="text-zinc-400 text-sm mt-1">
              Configure global color tokens, primary typography, and application layout architecture.
            </p>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium transition-colors group/reset self-start sm:self-auto shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 transition-transform group-active/reset:-rotate-180 duration-500" />
            Restore Defaults
          </button>
        </div>

        {/* Global Feedback Messages */}
        {state?.error && (
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{state.error}</p>
          </div>
        )}
        {state?.success && (
          <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <p>{state.success}</p>
          </div>
        )}

        <form action={formAction} className="space-y-8">
          <input type="hidden" name="themeAccentColor" value={themeAccentColor} />
          <input type="hidden" name="themeFont" value={themeFont} />
          <input type="hidden" name="themeTemplate" value={themeTemplate} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
            {/* 1. Accent Color */}
            <div className="space-y-3.5">
              <div>
                <label className="block text-sm font-semibold text-zinc-200">
                  1. Accent Color
                </label>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Primary brand color utilized for CTAs, active states, and interactive element borders.
                </p>
              </div>

              <div className="pt-1">
                <AccentColorPicker
                  color={themeAccentColor}
                  onChange={(newColor) => setThemeAccentColor(newColor)}
                />
              </div>
            </div>

            <div className="space-y-10">
              {/* 2. Typography Font Selector */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-sm font-semibold text-zinc-200">
                    2. Primary Typography
                  </label>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Global font family applied to all public-facing text, headers, and navigation.
                  </p>
                </div>

                <div className="space-y-2 pt-1">
                  {PRESET_FONTS.map((f) => (
                    <button
                      key={f.name}
                      type="button"
                      onClick={() => setThemeFont(f.name)}
                      style={{ fontFamily: f.varName }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 text-left ${
                        themeFont === f.name
                          ? 'bg-zinc-800/80 border-zinc-500 text-white shadow-md'
                          : 'bg-zinc-900/40 border-zinc-800/60 text-zinc-400 hover:bg-zinc-900 hover:border-zinc-700'
                      }`}
                    >
                      <span className="text-base">{f.name}</span>
                      {themeFont === f.name && <CheckCircle className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Layout Template Selector */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-sm font-semibold text-zinc-200">
                    3. Layout Template
                  </label>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Select the visual architecture and interaction model for the public site.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-1">
                  <button
                    type="button"
                    onClick={() => setThemeTemplate('minimal')}
                    className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all duration-300 text-center ${
                      themeTemplate === 'minimal'
                        ? 'bg-zinc-800/90 border-white text-white shadow-xl shadow-white/5 ring-1 ring-white/20'
                        : 'bg-zinc-900/40 border-zinc-800/60 text-zinc-400 hover:bg-zinc-800/60 hover:border-zinc-700'
                    }`}
                  >
                    <LayoutTemplate
                      className={`w-8 h-8 mb-3 ${themeTemplate === 'minimal' ? 'text-white' : 'text-zinc-500'}`}
                    />
                    <span className="font-bold text-sm">Minimal</span>
                    <span className="text-xs text-zinc-400 mt-1">Quiet confidence & clean vertical flow</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setThemeTemplate('immersive')}
                    className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all duration-300 text-center ${
                      themeTemplate === 'immersive'
                        ? 'bg-zinc-800/90 border-white text-white shadow-xl shadow-white/5 ring-1 ring-white/20'
                        : 'bg-zinc-900/40 border-zinc-800/60 text-zinc-400 hover:bg-zinc-800/60 hover:border-zinc-700'
                    }`}
                  >
                    <LayoutTemplate
                      className={`w-8 h-8 mb-3 ${themeTemplate === 'immersive' ? 'text-white' : 'text-zinc-500'}`}
                    />
                    <span className="font-bold text-sm">Immersive</span>
                    <span className="text-xs text-zinc-400 mt-1">Bold statement & dynamic interactions</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button & Preview Toggle */}
          <div className="pt-6 mt-8 border-t border-zinc-800 flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
            <button
              type="button"
              onClick={() => setIsPreviewModalOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 bg-zinc-800 text-zinc-200 font-semibold rounded-xl hover:bg-zinc-700 hover:text-white transition-all shadow-sm"
            >
              <Monitor className="w-4 h-4" />
              <span>Launch Live Preview</span>
            </button>

            <button
              type="submit"
              disabled={isPending}
              className="group/btn relative w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-8 bg-white text-black font-semibold rounded-xl overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-zinc-200 translate-y-[100%] group-hover/btn:translate-y-0 transition-transform duration-300 pointer-events-none" />
              <div className="relative z-10 flex items-center gap-2">
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
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

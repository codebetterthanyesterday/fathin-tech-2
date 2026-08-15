'use client';

import { useActionState, useState } from 'react';
import { updateThemeSettings, SettingsActionState } from '@/app/actions/settings';
import {
  Paintbrush,
  RotateCcw,
  Monitor,
  LayoutTemplate,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Plus,
} from 'lucide-react';
import MinimalHeroSection from '@/components/public/templates/minimal/hero-section';
import ImmersiveHeroSection from '@/components/public/templates/immersive/hero-section';

const initialState: SettingsActionState = {
  success: '',
  error: '',
  fieldErrors: {},
};

const PRESET_COLORS = [
  { name: 'Monochrome White', value: '#ffffff' },
  { name: 'Silver', value: '#a1a1aa' },
  { name: 'Muted Gold', value: '#d4af37' },
  { name: 'Ice Blue', value: '#88c0d0' },
  { name: 'Emerald Muted', value: '#34d399' },
];

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

  const handleReset = () => {
    setThemeAccentColor('#ffffff');
    setThemeFont('Geist');
    setThemeTemplate('minimal');
  };

  return (
    <div className="w-full max-w-5xl p-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

      <div className="relative z-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <Paintbrush className="w-6 h-6 text-zinc-300" />
              Tampilan & Tema
            </h2>
            <p className="text-zinc-400 text-sm mt-1">
              Personalisasi palet warna aksen, tipografi utama, dan layout template portofolio Anda.
            </p>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium transition-colors group/reset self-start sm:self-auto shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 transition-transform group-active/reset:-rotate-180 duration-500" />
            Reset ke Default
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Controls Left Column */}
            <div className="lg:col-span-6 space-y-8">
              {/* 1. Accent Color */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-sm font-semibold text-zinc-200">
                    1. Warna Aksen (Accent Color)
                  </label>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Digunakan untuk glowing accents, highlights, border aktif, dan link CTA.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setThemeAccentColor(c.value)}
                      title={c.name}
                      className={`w-10 h-10 rounded-full border-2 transition-all duration-200 hover:scale-110 shadow-lg ${
                        themeAccentColor.toLowerCase() === c.value.toLowerCase()
                          ? 'border-white scale-110 ring-2 ring-white/30'
                          : 'border-zinc-700/50 hover:border-zinc-400'
                      }`}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}

                  <div className="w-px h-8 bg-zinc-800 mx-1" />

                  {/* Custom Color Input */}
                  <div className="relative group/color">
                    <input
                      type="color"
                      value={themeAccentColor}
                      onChange={(e) => setThemeAccentColor(e.target.value)}
                      className="absolute opacity-0 w-full h-full cursor-pointer z-10"
                      title="Pilih Warna Hex Custom"
                    />
                    <div className="w-10 h-10 rounded-full border-2 border-dashed border-zinc-600 flex items-center justify-center bg-zinc-900 group-hover/color:border-zinc-400 group-hover/color:bg-zinc-800 transition-colors">
                      <Plus className="w-4 h-4 text-zinc-400" />
                    </div>
                  </div>

                  <div className="text-xs text-zinc-400 font-mono bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
                    {themeAccentColor.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* 2. Typography Font Selector */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-sm font-semibold text-zinc-200">
                    2. Tipografi (Font Utama)
                  </label>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Font ini diterapkan ke seluruh teks, judul, dan navigasi di situs publik.
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
                    Pilih arsitektur visual dan struktur animasi portofolio Anda.
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

            {/* Live Preview Right Column */}
            <div className="lg:col-span-6 space-y-3 relative h-full">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-zinc-400" />
                  Scaled Live Preview
                </label>
                <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                  Template: {themeTemplate}
                </span>
              </div>

              <div
                className="w-full aspect-[4/5] sm:aspect-auto sm:h-[620px] rounded-2xl border border-zinc-800 bg-[#050505] flex flex-col justify-start relative overflow-hidden transition-all duration-300 shadow-2xl"
                style={{
                  fontFamily:
                    PRESET_FONTS.find((f) => f.name === themeFont)?.varName ||
                    'var(--font-geist-sans)',
                  '--color-accent': themeAccentColor,
                } as any}
              >
                <div
                  className="absolute inset-0 origin-top-left pointer-events-none"
                  style={{
                    transform: 'scale(0.35)',
                    width: '285.7%',
                    height: '285.7%',
                  }}
                >
                  <div className="w-full h-full pointer-events-none [&>section]:min-h-0 [&>section]:h-[1000px]">
                    {themeTemplate === 'minimal' ? (
                      <MinimalHeroSection
                        profile={{
                          name: initialData?.name || 'John Doe',
                          tagline: initialData?.tagline || 'Software Engineer',
                          bio: initialData?.bio || 'Building scalable things for the web.',
                          photoUrl: initialData?.photoUrl,
                          resumeUrl: initialData?.resumeUrl,
                          socialLinks: initialData?.socialLinks,
                        }}
                      />
                    ) : (
                      <ImmersiveHeroSection
                        profile={{
                          name: initialData?.name || 'John Doe',
                          tagline: initialData?.tagline || 'Software Engineer',
                          bio: initialData?.bio || 'Building scalable things for the web.',
                          photoUrl: initialData?.photoUrl,
                          resumeUrl: initialData?.resumeUrl,
                          socialLinks: initialData?.socialLinks,
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t border-zinc-800 flex justify-end">
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
                <span>Simpan Pengaturan Tema</span>
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

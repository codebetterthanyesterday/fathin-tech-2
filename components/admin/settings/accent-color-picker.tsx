'use client';

import { useState, useRef, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Pipette, Sparkles, Check, ChevronDown } from 'lucide-react';
import { hexToRgb, getRelativeLuminance } from '@/lib/theme/colors';

interface AccentColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  presets?: { name: string; value: string }[];
}

const DEFAULT_PRESETS = [
  { name: 'Monochrome White', value: '#ffffff' },
  { name: 'Silver Slate', value: '#a1a1aa' },
  { name: 'Muted Gold', value: '#d4af37' },
  { name: 'Ice Blue', value: '#88c0d0' },
  { name: 'Emerald', value: '#34d399' },
  { name: 'Amethyst', value: '#a855f7' },
  { name: 'Coral Amber', value: '#f97316' },
  { name: 'Rose', value: '#fb7185' },
];

export default function AccentColorPicker({
  color,
  onChange,
  presets = DEFAULT_PRESETS,
}: AccentColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hexInput, setHexInput] = useState(color.toUpperCase());
  const [hasEyeDropper, setHasEyeDropper] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Sync external color changes to internal input
  useEffect(() => {
    setHexInput(color.toUpperCase());
  }, [color]);

  // Check EyeDropper API support
  useEffect(() => {
    if (typeof window !== 'undefined' && 'EyeDropper' in window) {
      setHasEyeDropper(true);
    }
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const handleHexInputChange = (val: string) => {
    setHexInput(val);
    let cleaned = val.startsWith('#') ? val : `#${val}`;
    if (/^#[0-9A-Fa-f]{6}$/.test(cleaned)) {
      onChange(cleaned.toLowerCase());
    }
  };

  const handleEyeDropper = async () => {
    try {
      // @ts-expect-error EyeDropper API
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      if (result?.sRGBHex) {
        onChange(result.sRGBHex.toLowerCase());
      }
    } catch {
      // User cancelled
    }
  };

  // Calculate contrast ratios against #050505 (dark) and #F5F4F2 (light)
  const rgb = hexToRgb(color);
  const lum = getRelativeLuminance(rgb);
  const darkBgLum = getRelativeLuminance({ r: 5, g: 5, b: 5 });
  const lightBgLum = getRelativeLuminance({ r: 245, g: 244, b: 242 });

  const darkContrast = ((Math.max(lum, darkBgLum) + 0.05) / (Math.min(lum, darkBgLum) + 0.05)).toFixed(1);
  const lightContrast = ((Math.max(lum, lightBgLum) + 0.05) / (Math.min(lum, lightBgLum) + 0.05)).toFixed(1);

  return (
    <div className="space-y-4 relative" ref={popoverRef}>
      {/* Preset Swatches + Trigger Row */}
      <div className="flex flex-wrap items-center gap-3">
        {presets.map((p) => {
          const isSelected = color.toLowerCase() === p.value.toLowerCase();
          return (
            <button
              key={p.value}
              type="button"
              onClick={() => onChange(p.value)}
              title={p.name}
              className={`relative w-10 h-10 rounded-full border-2 transition-all duration-200 hover:scale-110 shadow-md ${
                isSelected
                  ? 'border-white scale-110 ring-2 ring-white/40 ring-offset-2 ring-offset-black'
                  : 'border-zinc-700/60 hover:border-zinc-400'
              }`}
              style={{ backgroundColor: p.value }}
            >
              {isSelected && (
                <Check
                  className={`w-4 h-4 absolute inset-0 m-auto ${
                    lum > 0.5 ? 'text-black' : 'text-white'
                  }`}
                />
              )}
            </button>
          );
        })}

        <div className="w-px h-8 bg-zinc-800 mx-1 hidden sm:block" />

        {/* Custom Color Popover Trigger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 text-zinc-200 text-xs font-mono transition-all shadow-sm group"
        >
          <span
            className="w-4 h-4 rounded-full border border-white/20 shadow-inner"
            style={{ backgroundColor: color }}
          />
          <span className="font-semibold tracking-wider uppercase">{color}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Floating Canvas Popover */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-3 z-50 p-5 rounded-2xl bg-zinc-950 border border-zinc-700 shadow-2xl backdrop-blur-2xl w-[320px] animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800 text-xs text-zinc-400">
            <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Accent Spectrum Picker
            </span>
            {hasEyeDropper && (
              <button
                type="button"
                onClick={handleEyeDropper}
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 transition-colors"
                title="Eyedropper: Pick color from screen"
              >
                <Pipette className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* react-colorful Canvas */}
          <div className="custom-color-picker rounded-xl overflow-hidden shadow-inner border border-zinc-800 mb-4">
            <HexColorPicker color={color} onChange={onChange} />
          </div>

          {/* Hex Input Field */}
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-xs">
                #
              </span>
              <input
                type="text"
                value={hexInput.replace(/^#/, '')}
                onChange={(e) => handleHexInputChange(e.target.value)}
                maxLength={6}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 rounded-xl pl-7 pr-3 py-2 text-xs font-mono text-white uppercase outline-none transition-colors"
                placeholder="FFFFFF"
              />
            </div>

            <div
              className="w-10 h-8 rounded-xl border border-zinc-800 shadow-inner"
              style={{ backgroundColor: color }}
            />
          </div>

          {/* Real-time WCAG Contrast Readout */}
          <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800/80 space-y-1.5">
            <div className="text-[11px] font-semibold text-zinc-300">Live Contrast Readout</div>
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-zinc-400">Dark Mode (#050505):</span>
              <span className="font-bold text-zinc-200">{darkContrast}:1</span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-zinc-400">Light Mode (#F5F4F2):</span>
              <span className="font-bold text-zinc-200">{lightContrast}:1</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

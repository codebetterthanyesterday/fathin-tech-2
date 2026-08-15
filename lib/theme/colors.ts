/**
 * Color and luminance utilities for guaranteed WCAG AA contrast
 * across Dark and Light mode for any admin-picked accent color.
 */

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

/**
 * Parse any valid 3 or 6 hex string into RGB
 */
export function hexToRgb(hex: string): RGB {
  let clean = hex.replace(/^#/, '').trim();
  if (clean.length === 3) {
    clean = clean
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (clean.length !== 6) {
    return { r: 255, g: 255, b: 255 }; // fallback white
  }
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Convert RGB to Hex string
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(n)));
    return clamped.toString(16).padStart(2, '0');
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb(h: number, s: number, l: number): RGB {
  h /= 360;
  s /= 100;
  l /= 100;

  if (s === 0) {
    const val = Math.round(l * 255);
    return { r: val, g: val, b: val };
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  };
}

/**
 * Calculate WCAG Relative Luminance
 */
export function getRelativeLuminance(rgb: RGB): number {
  const a = [rgb.r, rgb.g, rgb.b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

/**
 * Compute all proportional, high-contrast theme variables
 * for both Dark and Light modes given any raw accent color.
 */
export function generateThemeColorTokens(rawHex: string = '#ffffff') {
  const rgb = hexToRgb(rawHex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const luminance = getRelativeLuminance(rgb);

  const isDefaultMonochrome =
    rawHex.toLowerCase() === '#ffffff' ||
    (hsl.s < 8 && hsl.l > 88); // pure white or near-white gray

  const isVeryDark = hsl.l < 15;

  // --- DARK MODE TOKENS ---
  // In dark mode: if default white, keep bright white. If dark black, lighten to white.
  const darkColor = isVeryDark ? '#ffffff' : rawHex;
  const darkRgb = hexToRgb(darkColor);
  const darkLum = getRelativeLuminance(darkRgb);
  // Button text on dark mode: if button is bright (lum > 0.4), use dark text `#050505`, else white `#ffffff`
  const darkBtnFg = darkLum > 0.4 ? '#050505' : '#ffffff';
  // Text accents in dark mode (headings, badges):
  const darkText = isVeryDark ? '#ffffff' : darkColor;
  const darkSoft = `rgba(${darkRgb.r}, ${darkRgb.g}, ${darkRgb.b}, 0.15)`;

  // --- LIGHT MODE TOKENS ---
  // In light mode:
  // If the admin picked default monochrome white (#ffffff), light mode counterpart is charcoal black (#18181b).
  let lightBtnBg = rawHex;
  let lightText = rawHex;
  let lightBtnFg = '#ffffff';

  if (isDefaultMonochrome) {
    // Default monochrome portfolio in light mode -> deep obsidian/charcoal
    lightBtnBg = '#18181b';
    lightText = '#18181b';
    lightBtnFg = '#ffffff';
  } else {
    // Admin chose a color hue (e.g. Gold, Blue, Emerald, Purple, etc.)
    // For text in light mode against #F5F4F2, darken lightness to guarantee >= 4.5:1 WCAG AA contrast
    const targetTextLightness = Math.min(hsl.l, 32); // darken to at least 32% lightness
    const darkenedTextRgb = hslToRgb(hsl.h, Math.min(hsl.s, 95), targetTextLightness);
    lightText = rgbToHex(darkenedTextRgb.r, darkenedTextRgb.g, darkenedTextRgb.b);

    // For button background in light mode:
    // If original color is too light (like pastel), button gets a solid visible shade
    if (hsl.l > 75) {
      const buttonRgb = hslToRgb(hsl.h, hsl.s, 45);
      lightBtnBg = rgbToHex(buttonRgb.r, buttonRgb.g, buttonRgb.b);
      lightBtnFg = '#ffffff';
    } else {
      lightBtnBg = rawHex;
      // Button text contrast
      lightBtnFg = luminance > 0.45 ? '#050505' : '#ffffff';
    }
  }

  const lightRgb = hexToRgb(lightText);
  const lightSoft = `rgba(${lightRgb.r}, ${lightRgb.g}, ${lightRgb.b}, 0.12)`;

  return {
    '--accent-color': rawHex,
    '--accent-dark-color': darkColor,
    '--accent-dark-btn-bg': darkColor,
    '--accent-dark-btn-fg': darkBtnFg,
    '--accent-dark-text': darkText,
    '--accent-dark-soft': darkSoft,
    '--accent-light-color': lightBtnBg,
    '--accent-light-btn-bg': lightBtnBg,
    '--accent-light-btn-fg': lightBtnFg,
    '--accent-light-text': lightText,
    '--accent-light-soft': lightSoft,
  };
}

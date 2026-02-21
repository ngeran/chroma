/**
 * Perceptual Color Utilities
 * Advanced color space conversions and perceptual color generation using OKLAB.
 * 
 * OKLAB is a perceptually uniform color space designed for better color relationships
 * and more predictable color mixing in digital applications.
 */

// Color interfaces
export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface OKLAB {
  L: number;  // Lightness (0-1)
  a: number;  // green-red axis (-1 to 1)
  b: number;  // blue-yellow axis (-1 to 1)
}

export interface OKLCH {
  L: number;  // Lightness (0-1)
  C: number;  // Chroma (0-0.4)
  h: number;  // Hue (0-360)
}

// ── RGB ↔ OKLAB Conversions ─────────────────────────────────────────────────────

/**
 * Convert RGB to OKLAB color space
 * Uses the standard sRGB to OKLAB conversion matrix
 */
export function rgbToOKLAB(r: number, g: number, b: number): OKLAB {
  // Normalize RGB to 0-1 range
  const r_lin = linearizeRGB(r / 255);
  const g_lin = linearizeRGB(g / 255);
  const b_lin = linearizeRGB(b / 255);

  // Convert to LMS (using the standard sRGB to LMS matrix)
  const l = 0.4122214708 * r_lin + 0.5363325363 * g_lin + 0.0514459929 * b_lin;
  const m = 0.2119034982 * r_lin + 0.6806995451 * g_lin + 0.1073969566 * b_lin;
  const s = 0.0883024619 * r_lin + 0.2817188376 * g_lin + 0.6299787005 * b_lin;

  // Apply non-linear transformation (cube root)
  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  // Convert to OKLAB
  return {
    L: 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_,
  };
}

/**
 * Convert OKLAB to RGB color space
 * Reverse of the above conversion
 */
export function oklabToRGB(L: number, a: number, b: number): RGB {
  // Convert OKLAB to LMS
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  // Apply inverse non-linear transformation (cube)
  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  // Convert from LMS to RGB (inverse matrix)
  const r_lin = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g_lin = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const b_lin = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

  // Apply gamma correction (inverse linearization)
  return {
    r: Math.round(255 * delinearizeRGB(Math.max(0, Math.min(1, r_lin)))),
    g: Math.round(255 * delinearizeRGB(Math.max(0, Math.min(1, g_lin)))),
    b: Math.round(255 * delinearizeRGB(Math.max(0, Math.min(1, b_lin)))),
  };
}

// ── Linear RGB transformations ───────────────────────────────────────────────────

function linearizeRGB(value: number): number {
  if (value <= 0.04045) {
    return value / 12.92;
  } else {
    return Math.pow((value + 0.055) / 1.055, 2.4);
  }
}

function delinearizeRGB(value: number): number {
  if (value <= 0.0031308) {
    return 12.92 * value;
  } else {
    return 1.055 * Math.pow(value, 1 / 2.4) - 0.055;
  }
}

// ── OKLAB ↔ OKLCH Conversions ───────────────────────────────────────────────────

/**
 * Convert OKLAB to OKLCH (polar form)
 * Easier for color manipulation and harmony generation
 */
export function oklabToOKLCH(L: number, a: number, b: number): OKLCH {
  const C = Math.sqrt(a * a + b * b);
  let h = Math.atan2(b, a) * (180 / Math.PI);
  
  // Normalize hue to 0-360 range
  if (h < 0) h += 360;
  
  return { L, C, h };
}

/**
 * Convert OKLCH to OKLAB
 */
export function oklchToOKLAB(L: number, C: number, h: number): OKLAB {
  const radians = h * (Math.PI / 180);
  return {
    L,
    a: C * Math.cos(radians),
    b: C * Math.sin(radians),
  };
}

// ── HSL ↔ OKLCH Conversions (for compatibility) ────────────────────────────────

/**
 * Convert HSL to OKLCH via RGB
 * Provides bridge between old and new color systems
 */
export function hslToOKLCH(h: number, s: number, l: number): OKLCH {
  // First convert HSL to RGB
  const rgb = hslToRGB(h, s, l);
  
  // Then convert RGB to OKLAB
  const oklab = rgbToOKLAB(rgb.r, rgb.g, rgb.b);
  
  // Finally convert OKLAB to OKLCH
  return oklabToOKLCH(oklab.L, oklab.a, oklab.b);
}

/**
 * Convert OKLCH to HSL via RGB
 */
export function oklchToHSL(L: number, C: number, h: number): { h: number; s: number; l: number } {
  const oklab = oklchToOKLAB(L, C, h);
  const rgb = oklabToRGB(oklab.L, oklab.a, oklab.b);
  return rgbToHSL(rgb.r, rgb.g, rgb.b);
}

// ── Helper functions ───────────────────────────────────────────────────────────

/**
 * Convert HSL to RGB (legacy helper)
 */
function hslToRGB(h: number, s: number, l: number): RGB {
  h = ((h % 360) + 360) % 360;
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

/**
 * Convert RGB to HSL (legacy helper)
 */
function rgbToHSL(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert OKLCH to hex string
 */
export function oklchToHex(L: number, C: number, h: number): string {
  const oklab = oklchToOKLAB(L, C, h);
  const rgb = oklabToRGB(oklab.L, oklab.a, oklab.b);
  return `#${rgb.r.toString(16).padStart(2, '0')}${rgb.g.toString(16).padStart(2, '0')}${rgb.b.toString(16).padStart(2, '0')}`;
}

// ── Perceptual color distance ───────────────────────────────────────────────────

/**
 * Calculate Delta E 2000 color difference (perceptual distance)
 * Returns a value where 1.0 is the minimum perceptible difference
 */
export function deltaE2000(color1: OKLAB, color2: OKLAB): number {
  // Convert to OKLCH for easier calculation
  const lch1 = oklabToOKLCH(color1.L, color1.a, color1.b);
  const lch2 = oklabToOKLCH(color2.L, color2.a, color2.b);

  // Simplified Delta E calculation (full CIEDE2000 is quite complex)
  const deltaL = lch1.L - lch2.L;
  const deltaC = lch1.C - lch2.C;
  const deltaH = Math.sqrt(
    Math.pow(color1.a - color2.a, 2) + 
    Math.pow(color1.b - color2.b, 2) - 
    Math.pow(deltaC, 2)
  );

  const meanC = (lch1.C + lch2.C) / 2;
  const kL = 1.0, kC = 1.0, kH = 1.0;
  const SL = 1.0, SC = 1.0 + 0.045 * meanC, SH = 1.0 + 0.015 * meanC;

  return Math.sqrt(
    Math.pow(deltaL / (kL * SL), 2) +
    Math.pow(deltaC / (kC * SC), 2) +
    Math.pow(deltaH / (kH * SH), 2)
  );
}
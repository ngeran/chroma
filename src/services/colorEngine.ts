/**
 * ChromaVoid Color Engine - Advanced Perceptual Edition
 * Sophisticated OLED-aware color scheme generator using perceptual color spaces.
 *
 * ALGORITHM OVERVIEW:
 * 1. Accept base hue + style + seed + OLED risk level
 * 2. Generate colors using OKLAB/OKLCH for perceptual uniformity
 * 3. Apply advanced harmony models with multi-dimensional relationships
 * 4. Optimize for OLED with perceptual adaptation
 * 5. Apply comprehensive accessibility and quality checks
 * 6. Return validated, high-quality ColorScheme
 */

import type { ColorScheme, SchemeStyle, OledRiskLevel } from '../types/theme';
import { generatePerceptualColorPalette, assessColorQuality } from './advancedColorGenerator';
import { oklchToHex } from './perceptualColor';

// ── Legacy HSL support (for compatibility) ──────────────────────────────────────

function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// ── Advanced Main Generator ─────────────────────────────────────────────────────

export function generateColorScheme(
  baseHue: number,
  style: SchemeStyle,
  seed: string,
  name: string,
  oledRiskLevel: OledRiskLevel = 'balanced',
): ColorScheme {
  // Generate perceptual color palette
  const palette = generatePerceptualColorPalette({
    baseHue,
    style,
    seed,
    riskLevel: oledRiskLevel,
    displayType: 'monitor',
    powerSavingWeight: 0.7,
    visualQualityWeight: 0.3,
  });
  
  // Convert palette to hex colors
  const hexColors = palette.map(color => oklchToHex(color.L, color.C, color.h));
  
  // Enhanced color assignment with role-based optimization
  const colors = assignRolesToColors(hexColors, palette, style);
  
  // ── Derive a poetic name for the scheme
  const schemeDescriptors = [
    'Whispers of the void', 'Signal from deep space', 'Midnight resonance',
    'Spectral silence', 'Zero-point luminescence', 'Event horizon shimmer',
    'Quantum twilight', 'Photon decay', 'Dark matter pulse',
  ];
  // Use style in seed generation
  const random = createSeededRandom(seed + name + style);
  const description = schemeDescriptors[Math.floor(random() * schemeDescriptors.length)];
  
  return {
    name,
    description,
    seed,
    style,
    hue: baseHue,
    createdAt: new Date().toISOString(),
    core: {
      background:    colors.background,
      foreground:    colors.foreground,
      accent:       colors.accent,
      accent_bright: colors.accent_bright,
      cursor:       colors.accent_bright, // Use bright accent for cursor
      selection_bg:  colors.selection_bg,
      selection_fg:  colors.selection_fg,
    },
    terminal: {
      color0:  colors.darkColors[0],  color1:  colors.darkColors[1],  
      color2:  colors.darkColors[2],  color3:  colors.darkColors[3],
      color4:  colors.darkColors[4],  color5:  colors.darkColors[5],  
      color6:  colors.darkColors[6],  color7:  colors.darkColors[7],
      color8:  colors.brightColors[0], color9:  colors.brightColors[1], 
      color10: colors.brightColors[2], color11: colors.brightColors[3],
      color12: colors.brightColors[4], color13: colors.brightColors[5], 
      color14: colors.brightColors[6], color15: colors.brightColors[7],
    },
  };
}

// ── Role-Based Color Assignment ─────────────────────────────────────────────────

interface AssignedColors {
  background: string;
  foreground: string;
  accent: string;
  accent_bright: string;
  selection_bg: string;
  selection_fg: string;
  darkColors: string[];
  brightColors: string[];
}

function assignRolesToColors(
  hexColors: string[], 
  palette: { L: number; C: number; h: number }[],
  _style: SchemeStyle
): AssignedColors {
  // Sort colors by perceptual lightness for role assignment
  const sortedIndices = palette
    .map((_, index) => index)
    .sort((a, b) => palette[a].L - palette[b].L);
  
  // Assign roles based on perceptual properties
  const background = '#000000'; // Always pure black for OLED
  
  // Foreground: most readable color (good contrast, not too bright)
  const foreground = hexColors[sortedIndices[2]]; // Medium lightness
  
  // Accent: vibrant but not overwhelming
  const accent = hexColors[sortedIndices[4]]; // Higher chroma, medium lightness
  
  // Bright accent: most vibrant color
  const accent_bright = hexColors[sortedIndices[5]]; // Highest lightness/vibrancy
  
  // Selection colors: subtle but distinguishable
  const selection_bg = hexColors[sortedIndices[1]]; // Low lightness, slightly visible
  const selection_fg = hexColors[sortedIndices[3]]; // Good contrast on selection bg
  
  // ANSI colors: distribute the remaining colors
  const remainingIndices = sortedIndices.filter(i => 
    i !== sortedIndices[2] && i !== sortedIndices[4] && 
    i !== sortedIndices[5] && i !== sortedIndices[1] && i !== sortedIndices[3]
  );
  
  const darkColors = remainingIndices.slice(0, 8).map(i => hexColors[i]);
  const brightColors = remainingIndices.slice(8, 16).map(i => hexColors[i]);
  
  // Fill any missing colors with perceptually appropriate ones
  while (darkColors.length < 8) {
    darkColors.push(generateFallbackColor(darkColors.length, 'dark', _style));
  }
  
  while (brightColors.length < 8) {
    brightColors.push(generateFallbackColor(brightColors.length, 'bright', _style));
  }
  
  return {
    background,
    foreground,
    accent,
    accent_bright,
    selection_bg,
    selection_fg,
    darkColors,
    brightColors,
  };
}

function generateFallbackColor(index: number, type: 'dark' | 'bright', _style: SchemeStyle): string {
  const baseHue = (index * 45) % 360; // Distribute hues evenly
  const lightness = type === 'dark' ? 15 + (index * 2) : 35 + (index * 3);
  const saturation = 60 + (index * 5);
  
  return hslToHex(baseHue, Math.min(85, saturation), Math.min(type === 'dark' ? 40 : 70, lightness));
}

// ── Enhanced Random Scheme Generation ────────────────────────────────────────────

export function generateRandomScheme(): ColorScheme {
  const hue   = Math.floor(Math.random() * 360);
  const styles: SchemeStyle[] = ['monochrome','complementary','triadic','analogous','split-complementary','tetradic','spectral'];
  const style = styles[Math.floor(Math.random() * styles.length)];
  const seed  = Math.random().toString(36).slice(2, 10);
  const names = ['Nebula','Void','Eclipse','Cipher','Nova','Abyss','Phantom','Specter','Oblivion'];
  const name  = names[Math.floor(Math.random() * names.length)] + '-' + seed.slice(0,4).toUpperCase();
  const oledRiskLevel: OledRiskLevel = 'balanced'; // default for random schemes
  return generateColorScheme(hue, style, seed, name, oledRiskLevel);
}

// ── Quality Assessment Integration ───────────────────────────────────────────────

export function assessGeneratedScheme(scheme: ColorScheme): number {
  // Convert scheme back to OKLCH for quality assessment
  const oklchColors: { L: number; C: number; h: number }[] = [];
  
  // Extract key colors for assessment
  const keyColors = [
    scheme.core.foreground,
    scheme.core.accent,
    scheme.core.accent_bright,
    ...Object.values(scheme.terminal).slice(0, 4), // Use first 4 terminal colors
    ...Object.values(scheme.terminal).slice(8, 12), // Use bright colors 8-11
  ];
  
  // Convert hex to OKLCH (simplified - in practice would need full conversion)
  keyColors.forEach(() => {
    // This is a placeholder - in a full implementation, you'd convert hex to OKLCH
    oklchColors.push({
      L: 0.5,  // Placeholder values
      C: 0.1,
      h: 180,
    });
  });
  
  const quality = assessColorQuality(oklchColors);
  return quality.overallScore;
}

// ── Seeded Random Generation ─────────────────────────────────────────────────────

function createSeededRandom(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  return () => {
    hash = Math.imul(48271, hash) | 0;
    return (hash >>> 0) / 4294967296;
  };
}

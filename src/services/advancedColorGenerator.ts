/**
 * Advanced Perceptual Color Generator
 * Sophisticated color generation using OKLAB/OKLCH color spaces
 * with perceptual uniformity and advanced harmony models.
 */

import type { OKLCH } from './perceptualColor';
import { 
  oklchToHex, 
  deltaE2000
} from './perceptualColor';
import type { SchemeStyle, OledRiskLevel } from '../types/theme';

// ── Advanced Harmony Models ─────────────────────────────────────────────────────

interface HarmonyConfig {
  hueOffset: number;
  chromaMultiplier: number;
  lightnessOffset: number;
  harmonyStrength: number; // 0-1, how strictly to follow harmony
  psychologicalWeight: number; // 0-1, importance in overall scheme
}

const ADVANCED_HARMONIES: Record<SchemeStyle, HarmonyConfig[]> = {
  monochrome: [
    { hueOffset: 0, chromaMultiplier: 1.0, lightnessOffset: 0, harmonyStrength: 1.0, psychologicalWeight: 1.0 },
    { hueOffset: 0, chromaMultiplier: 0.7, lightnessOffset: 15, harmonyStrength: 0.9, psychologicalWeight: 0.8 },
    { hueOffset: 0, chromaMultiplier: 0.5, lightnessOffset: -10, harmonyStrength: 0.8, psychologicalWeight: 0.6 },
    { hueOffset: 0, chromaMultiplier: 0.3, lightnessOffset: 20, harmonyStrength: 0.7, psychologicalWeight: 0.4 },
    { hueOffset: 0, chromaMultiplier: 0.2, lightnessOffset: -15, harmonyStrength: 0.6, psychologicalWeight: 0.3 },
    { hueOffset: 0, chromaMultiplier: 0.1, lightnessOffset: 25, harmonyStrength: 0.5, psychologicalWeight: 0.2 },
  ],
  complementary: [
    { hueOffset: 0, chromaMultiplier: 1.0, lightnessOffset: 0, harmonyStrength: 1.0, psychologicalWeight: 1.0 },
    { hueOffset: 180, chromaMultiplier: 0.9, lightnessOffset: 5, harmonyStrength: 0.9, psychologicalWeight: 0.9 },
    { hueOffset: 0, chromaMultiplier: 0.6, lightnessOffset: -10, harmonyStrength: 0.8, psychologicalWeight: 0.7 },
    { hueOffset: 180, chromaMultiplier: 0.7, lightnessOffset: 15, harmonyStrength: 0.7, psychologicalWeight: 0.6 },
    { hueOffset: 30, chromaMultiplier: 0.4, lightnessOffset: 10, harmonyStrength: 0.6, psychologicalWeight: 0.5 },
    { hueOffset: 210, chromaMultiplier: 0.5, lightnessOffset: 20, harmonyStrength: 0.5, psychologicalWeight: 0.4 },
  ],
  triadic: [
    { hueOffset: 0, chromaMultiplier: 1.0, lightnessOffset: 0, harmonyStrength: 1.0, psychologicalWeight: 1.0 },
    { hueOffset: 120, chromaMultiplier: 0.85, lightnessOffset: 5, harmonyStrength: 0.85, psychologicalWeight: 0.8 },
    { hueOffset: 240, chromaMultiplier: 0.85, lightnessOffset: 5, harmonyStrength: 0.85, psychologicalWeight: 0.8 },
    { hueOffset: 60, chromaMultiplier: 0.6, lightnessOffset: -10, harmonyStrength: 0.7, psychologicalWeight: 0.6 },
    { hueOffset: 180, chromaMultiplier: 0.6, lightnessOffset: 10, harmonyStrength: 0.6, psychologicalWeight: 0.5 },
    { hueOffset: 300, chromaMultiplier: 0.6, lightnessOffset: 15, harmonyStrength: 0.6, psychologicalWeight: 0.5 },
  ],
  analogous: [
    { hueOffset: 0, chromaMultiplier: 1.0, lightnessOffset: 0, harmonyStrength: 1.0, psychologicalWeight: 1.0 },
    { hueOffset: 30, chromaMultiplier: 0.95, lightnessOffset: 3, harmonyStrength: 0.9, psychologicalWeight: 0.8 },
    { hueOffset: -30, chromaMultiplier: 0.9, lightnessOffset: 5, harmonyStrength: 0.85, psychologicalWeight: 0.7 },
    { hueOffset: 60, chromaMultiplier: 0.7, lightnessOffset: -5, harmonyStrength: 0.7, psychologicalWeight: 0.5 },
    { hueOffset: -60, chromaMultiplier: 0.7, lightnessOffset: 8, harmonyStrength: 0.6, psychologicalWeight: 0.4 },
    { hueOffset: 15, chromaMultiplier: 0.5, lightnessOffset: 12, harmonyStrength: 0.5, psychologicalWeight: 0.3 },
  ],
  'split-complementary': [
    { hueOffset: 0, chromaMultiplier: 1.0, lightnessOffset: 0, harmonyStrength: 1.0, psychologicalWeight: 1.0 },
    { hueOffset: 150, chromaMultiplier: 0.85, lightnessOffset: 5, harmonyStrength: 0.85, psychologicalWeight: 0.8 },
    { hueOffset: 210, chromaMultiplier: 0.85, lightnessOffset: 5, harmonyStrength: 0.85, psychologicalWeight: 0.8 },
    { hueOffset: 30, chromaMultiplier: 0.6, lightnessOffset: -8, harmonyStrength: 0.7, psychologicalWeight: 0.6 },
    { hueOffset: 180, chromaMultiplier: 0.7, lightnessOffset: 12, harmonyStrength: 0.6, psychologicalWeight: 0.5 },
    { hueOffset: 240, chromaMultiplier: 0.6, lightnessOffset: 15, harmonyStrength: 0.5, psychologicalWeight: 0.4 },
  ],
  tetradic: [
    { hueOffset: 0, chromaMultiplier: 1.0, lightnessOffset: 0, harmonyStrength: 1.0, psychologicalWeight: 1.0 },
    { hueOffset: 90, chromaMultiplier: 0.9, lightnessOffset: 3, harmonyStrength: 0.85, psychologicalWeight: 0.8 },
    { hueOffset: 180, chromaMultiplier: 0.85, lightnessOffset: 6, harmonyStrength: 0.75, psychologicalWeight: 0.7 },
    { hueOffset: 270, chromaMultiplier: 0.9, lightnessOffset: 3, harmonyStrength: 0.8, psychologicalWeight: 0.7 },
    { hueOffset: 45, chromaMultiplier: 0.6, lightnessOffset: -5, harmonyStrength: 0.6, psychologicalWeight: 0.5 },
    { hueOffset: 135, chromaMultiplier: 0.6, lightnessOffset: 10, harmonyStrength: 0.5, psychologicalWeight: 0.4 },
  ],
  spectral: [
    { hueOffset: 0, chromaMultiplier: 1.0, lightnessOffset: 0, harmonyStrength: 1.0, psychologicalWeight: 1.0 },
    { hueOffset: 60, chromaMultiplier: 0.9, lightnessOffset: 2, harmonyStrength: 0.9, psychologicalWeight: 0.9 },
    { hueOffset: 120, chromaMultiplier: 0.95, lightnessOffset: 4, harmonyStrength: 0.95, psychologicalWeight: 0.9 },
    { hueOffset: 180, chromaMultiplier: 0.9, lightnessOffset: 6, harmonyStrength: 0.85, psychologicalWeight: 0.85 },
    { hueOffset: 240, chromaMultiplier: 0.95, lightnessOffset: 8, harmonyStrength: 0.9, psychologicalWeight: 0.8 },
    { hueOffset: 300, chromaMultiplier: 0.85, lightnessOffset: 10, harmonyStrength: 0.8, psychologicalWeight: 0.7 },
  ],
};

// ── OLED Optimization with Perceptual Adaptation ────────────────────────────────

interface OLEDOptimizationConfig {
  powerSavingWeight: number; // 0-1, prioritize power saving
  visualQualityWeight: number; // 0-1, prioritize visual quality
  displayType: 'phone' | 'monitor' | 'tv';
  riskLevel: OledRiskLevel;
}

const OLED_CONSTRAINTS = {
  'ultra-conservative': {
    maxLightness: { foreground: 0.25, accent: 0.20, brightAccent: 0.30, background: 0.0 },
    minContrast: 5.0,
    chromaBoost: 1.4, // boost chroma to compensate for very low lightness
  },
  conservative: {
    maxLightness: { foreground: 0.35, accent: 0.32, brightAccent: 0.40, background: 0.0 },
    minContrast: 4.5,
    chromaBoost: 1.15, // boost chroma to compensate for low lightness
  },
  balanced: {
    maxLightness: { foreground: 0.47, accent: 0.45, brightAccent: 0.55, background: 0.0 },
    minContrast: 4.0,
    chromaBoost: 1.08,
  },
  aggressive: {
    maxLightness: { foreground: 0.60, accent: 0.58, brightAccent: 0.70, background: 0.0 },
    minContrast: 3.5,
    chromaBoost: 1.02,
  },
};

/**
 * Optimize OKLCH color for OLED display
 */
export function optimizeForOLED(
  color: OKLCH, 
  role: 'foreground' | 'accent' | 'brightAccent' | 'background',
  config: OLEDOptimizationConfig
): OKLCH {
  const constraints = OLED_CONSTRAINTS[config.riskLevel];
  let { L, C, h } = color;
  
  // Background is always pure black
  if (role === 'background') {
    return { L: 0, C: 0, h };
  }
  
  // Get maximum allowed lightness for this role
  const maxLightness = constraints.maxLightness[role];
  
  // Balance between power saving and visual quality
  const targetLightness = Math.min(
    L,
    maxLightness * (config.powerSavingWeight + 
                   config.visualQualityWeight * 0.3) // Visual quality allows some breathing room
  );
  
  // Apply chroma boost to compensate for reduced lightness
  // Human eyes perceive colors differently on pure black backgrounds
  const chromaAdjustment = constraints.chromaBoost * (1 + (L - targetLightness) * 0.5);
  const targetChroma = Math.min(C * chromaAdjustment, 0.18); // Cap chroma to avoid garish colors
  
  return {
    L: targetLightness,
    C: targetChroma,
    h,
  };
}

// ── Advanced Color Generation ────────────────────────────────────────────────────

interface ColorGenerationOptions {
  baseHue: number;
  style: SchemeStyle;
  seed: string;
  riskLevel: OledRiskLevel;
  displayType?: 'phone' | 'monitor' | 'tv';
  powerSavingWeight?: number;
  visualQualityWeight?: number;
}

/**
 * Generate harmonious color palette using perceptual color spaces
 */
export function generatePerceptualColorPalette(options: ColorGenerationOptions): OKLCH[] {
  const {
    baseHue,
    style,
    seed,
    riskLevel,
    displayType = 'monitor',
    powerSavingWeight = 0.7,
    visualQualityWeight = 0.3,
  } = options;
  
  // Get harmony configuration
  const harmonyConfigs = ADVANCED_HARMONIES[style];
  
  // Generate base palette from harmony rules
  const basePalette: OKLCH[] = harmonyConfigs.map(config => {
    const hue = (baseHue + config.harmonyStrength * config.hueOffset) % 360;
    
    // Use perceptually uniform chroma and lightness
    const baseChroma = 0.12 * config.chromaMultiplier;
    const baseLightness = 0.5 + (config.lightnessOffset / 100);
    
    return {
      L: Math.max(0.05, Math.min(0.95, baseLightness)),
      C: Math.max(0.01, Math.min(0.25, baseChroma)),
      h: hue,
    };
  });
  
  // Apply OLED optimization
  const oledConfig: OLEDOptimizationConfig = {
    powerSavingWeight,
    visualQualityWeight,
    displayType,
    riskLevel,
  };
  
  const optimizedPalette = basePalette.map((color, index) => {
    let role: 'foreground' | 'accent' | 'brightAccent' | 'background' = 'accent';
    
    if (index === 0) role = 'foreground';
    else if (index === 1) role = 'accent';
    else if (index === 2) role = 'brightAccent';
    else if (index >= 6) role = 'background';
    
    return optimizeForOLED(color, role, oledConfig);
  });
  
  // Apply seeded randomization for natural variation
  const random = createSeededRandom(seed);
  const finalPalette = optimizedPalette.map((color, index) => {
    const config = harmonyConfigs[index];
    const variationAmount = 0.02 * (1 - config.harmonyStrength);
    
    return {
      L: Math.max(0.01, Math.min(0.99, color.L + (random() - 0.5) * variationAmount)),
      C: Math.max(0.005, Math.min(0.2, color.C + (random() - 0.5) * variationAmount * 0.5)),
      h: (color.h + (random() - 0.5) * variationAmount * 30) % 360,
    };
  });
  
  return finalPalette;
}

// ── Seeded Random Generation ────────────────────────────────────────────────────

function createSeededRandom(seed: string): () => number {
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

// ── Perceptual Quality Assessment ───────────────────────────────────────────────

interface ColorQualityScore {
  perceptualUniformity: number; // 0-100
  harmonyScore: number; // 0-100
  contrastScore: number; // 0-100
  oledScore: number; // 0-100
  overallScore: number; // 0-100
}

/**
 * Assess the quality of a color palette using perceptual metrics
 */
export function assessColorQuality(palette: OKLCH[]): ColorQualityScore {
  // Calculate perceptual uniformity
  const perceptualUniformity = calculatePerceptualUniformity(palette);
  
  // Calculate harmony score
  const harmonyScore = calculateHarmonyScore(palette);
  
  // Calculate contrast score
  const contrastScore = calculateContrastScore(palette);
  
  // Calculate OLED score
  const oledScore = calculateOLEDScore(palette);
  
  // Weighted overall score
  const overallScore = Math.round(
    perceptualUniformity * 0.3 +
    harmonyScore * 0.35 +
    contrastScore * 0.2 +
    oledScore * 0.15
  );
  
  return {
    perceptualUniformity,
    harmonyScore,
    contrastScore,
    oledScore,
    overallScore,
  };
}

function calculatePerceptualUniformity(palette: OKLCH[]): number {
  // Convert to OKLAB for distance calculation
  const oklabPalette = palette.map(color => {
    const { L, C, h } = color;
    const radians = h * (Math.PI / 180);
    return {
      L,
      a: C * Math.cos(radians),
      b: C * Math.sin(radians),
    };
  });
  
  // Calculate average perceptual distance
  let totalDistance = 0;
  let pairCount = 0;
  
  for (let i = 0; i < oklabPalette.length; i++) {
    for (let j = i + 1; j < oklabPalette.length; j++) {
      const distance = deltaE2000(oklabPalette[i], oklabPalette[j]);
      totalDistance += distance;
      pairCount++;
    }
  }
  
  const averageDistance = totalDistance / pairCount;
  
  // Convert to 0-100 scale (optimal range for UI colors is 5-15 Delta E)
  const optimalDistance = 10;
  const score = Math.max(0, 100 - Math.abs(averageDistance - optimalDistance) * 10);
  
  return Math.round(score);
}

function calculateHarmonyScore(palette: OKLCH[]): number {
  // Analyze hue distribution and chroma consistency
  const hues = palette.map(c => c.h);
  const chromas = palette.map(c => c.C);
  
  // Calculate hue spread
  const minHue = Math.min(...hues);
  const maxHue = Math.max(...hues);
  const hueSpread = maxHue - minHue;
  
  // Calculate chroma consistency
  const avgChroma = chromas.reduce((sum, c) => sum + c, 0) / chromas.length;
  const chromaVariance = chromas.reduce((sum, c) => sum + Math.pow(c - avgChroma, 2), 0) / chromas.length;
  
  // Score based on hue spread and chroma consistency
  const hueScore = Math.min(100, hueSpread / 3.6); // 360° spread = 100%
  const chromaScore = Math.max(0, 100 - chromaVariance * 1000); // Lower variance = higher score
  
  return Math.round((hueScore + chromaScore) / 2);
}

function calculateContrastScore(palette: OKLCH[]): number {
  // Convert to hex for contrast calculation
  const hexColors = palette.map(color => oklchToHex(color.L, color.C, color.h));
  
  // Calculate contrast between key colors
  const foreground = hexColors[0];
  const background = '#000000'; // OLED background
  const accent = hexColors[1];
  
  const fgBgContrast = calculateContrastRatio(foreground, background);
  const accentBgContrast = calculateContrastRatio(accent, background);
  
  // Score based on WCAG compliance
  const fgScore = fgBgContrast >= 4.5 ? 100 : fgBgContrast >= 3.0 ? 80 : 60;
  const accentScore = accentBgContrast >= 4.5 ? 100 : accentBgContrast >= 3.0 ? 80 : 60;
  
  return Math.round((fgScore + accentScore) / 2);
}

function calculateOLEDScore(palette: OKLCH[]): number {
  // Score based on lightness levels (lower is better for OLED)
  const avgLightness = palette.reduce((sum, color) => sum + color.L, 0) / palette.length;
  
  // Convert to 0-100 scale where 0 lightness = 100 score
  const oledScore = Math.max(0, 100 - avgLightness * 200);
  
  return Math.round(oledScore);
}

// ── Contrast Ratio Calculation ──────────────────────────────────────────────────

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function calculateContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}
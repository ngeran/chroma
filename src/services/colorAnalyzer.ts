/**
 * ChromaVoid Color Analyzer - Improved Perceptual Edition
 * Uses OKLAB/OKLCH for accurate perceptual analysis, WCAG contrast,
 * real harmony analysis, and proper OLED risk assessment.
 */

import type { ColorScheme, AnalysisResult, SchemeStyle } from '../types/theme';
import { 
  hexToOKLAB, 
  oklabToOKLCH, 
  deltaE2000, 
  type OKLCH 
} from './perceptualColor';

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map(v => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function wcagLevel(ratio: number): 'AAA' | 'AA' | 'fail' {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  return 'fail';
}

function hexToOKLCH(hex: string): OKLCH {
  const oklab = hexToOKLAB(hex);
  return oklabToOKLCH(oklab.L, oklab.a, oklab.b);
}

function hueDistance(h1: number, h2: number): number {
  const diff = Math.abs(h1 - h2);
  return Math.min(diff, 360 - diff);
}

interface HarmonyMatch {
  type: string;
  score: number;
  description: string;
}

function analyzeHarmony(hues: number[], style: SchemeStyle): HarmonyMatch {
  if (hues.length < 2) {
    return { type: 'single', score: 100, description: 'Single hue scheme' };
  }

  const baseHue = hues[0];
  const avgHueDistance = hues.slice(1).reduce((sum, h) => sum + hueDistance(baseHue, h), 0) / (hues.length - 1);
  
  const harmonies: Record<string, { targetDistance: number; tolerance: number; description: string }> = {
    monochrome: { targetDistance: 0, tolerance: 15, description: 'Monochromatic - single hue with lightness variations' },
    complementary: { targetDistance: 180, tolerance: 30, description: 'Complementary - opposite hues on color wheel' },
    analogous: { targetDistance: 30, tolerance: 20, description: 'Analogous - adjacent hues for subtle harmony' },
    'split-complementary': { targetDistance: 150, tolerance: 30, description: 'Split complementary - balanced contrast' },
    triadic: { targetDistance: 120, tolerance: 25, description: 'Triadic - three evenly spaced hues' },
    tetradic: { targetDistance: 90, tolerance: 25, description: 'Tetradic - four hues in square pattern' },
    spectral: { targetDistance: 180, tolerance: 90, description: 'Spectral - full rainbow coverage' },
  };

  let bestMatch: HarmonyMatch = { type: 'unknown', score: 0, description: 'Unusual color relationships' };

  for (const [type, config] of Object.entries(harmonies)) {
    let score = 0;
    
    if (type === 'monochrome') {
      const maxDist = Math.max(...hues.map(h => hueDistance(baseHue, h)));
      score = Math.max(0, 100 - maxDist * 2);
    } else if (type === 'spectral') {
      const hueSpread = calculateHueSpread(hues);
      score = Math.min(100, hueSpread / 2);
    } else {
      const deviation = Math.abs(avgHueDistance - config.targetDistance);
      score = Math.max(0, 100 - deviation * (100 / config.tolerance));
    }

    if (score > bestMatch.score) {
      bestMatch = { type, score: Math.round(score), description: config.description };
    }
  }

  if (style && harmonies[style]) {
    const targetDistance = harmonies[style].targetDistance;
    const tolerance = harmonies[style].tolerance;
    
    if (style === 'monochrome') {
      const maxDist = Math.max(...hues.map(h => hueDistance(baseHue, h)));
      bestMatch.score = Math.max(0, 100 - maxDist * 2);
    } else {
      const deviation = Math.abs(avgHueDistance - targetDistance);
      bestMatch.score = Math.max(0, 100 - deviation * (100 / tolerance));
    }
    bestMatch.description = harmonies[style].description;
  }

  return bestMatch;
}

function calculateHueSpread(hues: number[]): number {
  if (hues.length < 2) return 0;
  
  const sortedHues = [...hues].sort((a, b) => a - b);
  let maxGap = 0;
  
  for (let i = 0; i < sortedHues.length - 1; i++) {
    maxGap = Math.max(maxGap, sortedHues[i + 1] - sortedHues[i]);
  }
  maxGap = Math.max(maxGap, (360 - sortedHues[sortedHues.length - 1]) + sortedHues[0]);
  
  return 360 - maxGap;
}

function calculateDistinctiveness(oklchColors: OKLCH[]): number {
  if (oklchColors.length < 2) return 100;
  
  const oklabColors = oklchColors.map(c => ({
    L: c.L,
    a: c.C * Math.cos(c.h * Math.PI / 180),
    b: c.C * Math.sin(c.h * Math.PI / 180),
  }));

  let totalDistance = 0;
  let pairs = 0;
  let tooClose = 0;

  for (let i = 0; i < oklabColors.length; i++) {
    for (let j = i + 1; j < oklabColors.length; j++) {
      const distance = deltaE2000(oklabColors[i], oklabColors[j]);
      totalDistance += distance;
      pairs++;
      if (distance < 5) tooClose++;
    }
  }

  const avgDistance = pairs > 0 ? totalDistance / pairs : 0;
  const penalty = tooClose > 0 ? (tooClose / pairs) * 30 : 0;
  
  const score = Math.min(100, (avgDistance / 20) * 100) - penalty;
  return Math.max(0, Math.round(score));
}

function assessOLEDRisk(oklchColors: OKLCH[]): {
  score: number;
  riskLevel: 'low' | 'medium' | 'high';
  avgLightness: number;
  maxLightness: number;
  brightColorCount: number;
} {
  const lightnessValues = oklchColors.map(c => c.L);
  const avgLightness = lightnessValues.reduce((a, b) => a + b, 0) / lightnessValues.length;
  const maxLightness = Math.max(...lightnessValues);
  const brightColorCount = lightnessValues.filter(l => l > 0.4).length;
  const veryBrightCount = lightnessValues.filter(l => l > 0.6).length;

  let riskScore = 0;
  
  riskScore += avgLightness * 100;
  riskScore += (maxLightness - 0.5) * 50;
  riskScore += brightColorCount * 3;
  riskScore += veryBrightCount * 10;
  
  riskScore = Math.min(100, Math.max(0, riskScore));
  
  const oledScore = Math.round(100 - riskScore);
  
  let riskLevel: 'low' | 'medium' | 'high';
  if (riskScore <= 30) riskLevel = 'low';
  else if (riskScore <= 60) riskLevel = 'medium';
  else riskLevel = 'high';

  return {
    score: oledScore,
    riskLevel,
    avgLightness,
    maxLightness,
    brightColorCount,
  };
}

export function analyzeColorScheme(scheme: ColorScheme): AnalysisResult {
  const bg = scheme.core.background;
  const allHexColors = [
    ...Object.values(scheme.core),
    ...Object.values(scheme.terminal),
  ].filter((v): v is string => typeof v === 'string' && v.startsWith('#'));

  const allOklch = allHexColors.map(hexToOKLCH);
  const nonBlackOklch = allOklch.filter((_, i) => allHexColors[i] !== '#000000');

  const oledAssessment = assessOLEDRisk(nonBlackOklch);
  const oledScore = oledAssessment.score;

  const fgRatio = contrastRatio(scheme.core.foreground, bg);
  const accentRatio = contrastRatio(scheme.core.accent, bg);
  const abRatio = contrastRatio(scheme.core.accent_bright, bg);

  const wcagCompliance = {
    foregroundOnBg: wcagLevel(fgRatio),
    accentOnBg: wcagLevel(accentRatio),
    accentBrightOnBg: wcagLevel(abRatio),
  };

  const wcagScores = [fgRatio, accentRatio, abRatio].map(r => Math.min(r / 7, 1));
  const contrastScore = Math.round((wcagScores.reduce((a, b) => a + b, 0) / 3) * 100);

  const hues = nonBlackOklch.map(c => c.h);
  const harmonyMatch = analyzeHarmony(hues, scheme.style);
  const harmonyScore = harmonyMatch.score;

  const distinctiveness = calculateDistinctiveness(nonBlackOklch);

  const overallScore = Math.round(
    oledScore * 0.30 +
    contrastScore * 0.30 +
    harmonyScore * 0.20 +
    distinctiveness * 0.20
  );

  const terminalColors = Object.values(scheme.terminal) as string[];
  const luminanceProfile = terminalColors.map(c => Math.round(relativeLuminance(c) * 1000) / 10);

  const darkColors = nonBlackOklch.filter(c => c.L < 0.2).length;
  const brightColors = nonBlackOklch.filter(c => c.L > 0.5).length;
  const neutralColors = nonBlackOklch.length - darkColors - brightColors;

  const insights: string[] = [];
  const warnings: string[] = [];

  if (oledScore >= 80) {
    insights.push(`Excellent OLED efficiency (${oledScore}/100) — minimal power draw on AMOLED displays.`);
  } else if (oledScore >= 60) {
    insights.push(`Good OLED optimization (${oledScore}/100) with acceptable luminance levels.`);
  } else if (oledScore >= 40) {
    warnings.push(`Moderate OLED risk (${oledScore}/100) — consider darkening bright colors.`);
  } else {
    warnings.push(`High OLED risk (${oledScore}/100) — ${oledAssessment.brightColorCount} colors exceed safe brightness.`);
  }

  if (contrastScore >= 80) {
    insights.push(`Excellent contrast (${contrastScore}/100) — strong readability across UI elements.`);
  } else if (contrastScore >= 60) {
    insights.push(`Good contrast (${contrastScore}/100) — readable with room for accessibility improvement.`);
  } else {
    warnings.push(`Low contrast (${contrastScore}/100) — some colors may be hard to read on black.`);
  }

  insights.push(`Harmony: ${harmonyMatch.description} (${harmonyScore}/100).`);

  if (distinctiveness >= 70) {
    insights.push(`Colors are well-differentiated (${distinctiveness}/100) — easy to distinguish.`);
  } else if (distinctiveness >= 50) {
    insights.push(`Moderate color distinctiveness (${distinctiveness}/100).`);
  } else {
    warnings.push(`Low distinctiveness (${distinctiveness}/100) — some colors may appear too similar.`);
  }

  if (oledAssessment.riskLevel === 'low') {
    insights.push('Low burn-in risk — safe for extended OLED use.');
  } else if (oledAssessment.riskLevel === 'medium') {
    warnings.push('Medium burn-in risk — avoid static display of bright colors for long periods.');
  } else {
    warnings.push('High burn-in risk — bright colors should not be displayed statically.');
  }

  if (wcagCompliance.foregroundOnBg === 'AAA') {
    insights.push(`Foreground achieves WCAG AAA (ratio: ${fgRatio.toFixed(1)}:1).`);
  } else if (wcagCompliance.foregroundOnBg === 'AA') {
    insights.push(`Foreground passes WCAG AA (ratio: ${fgRatio.toFixed(1)}:1).`);
  } else {
    warnings.push(`Foreground fails WCAG (ratio: ${fgRatio.toFixed(1)}:1) — needs more contrast.`);
  }

  if (wcagCompliance.accentBrightOnBg === 'AAA') {
    insights.push(`Bright accent achieves WCAG AAA (ratio: ${abRatio.toFixed(1)}:1).`);
  }

  return {
    overallScore,
    oledScore,
    contrastScore,
    harmonyScore,
    burnInRisk: oledAssessment.riskLevel,
    wcagCompliance,
    luminanceProfile,
    distinctiveness,
    colorCount: { darkColors, brightColors, neutralColors },
    insights,
    warnings,
  };
}

export function getColorMetrics(hex: string): {
  luminance: number;
  oklch: OKLCH;
  wcagLuminance: number;
} {
  const oklch = hexToOKLCH(hex);
  const wcagLum = relativeLuminance(hex);
  
  return {
    luminance: oklch.L,
    oklch,
    wcagLuminance: wcagLum,
  };
}

export function suggestImprovements(scheme: ColorScheme): string[] {
  const suggestions: string[] = [];
  const analysis = analyzeColorScheme(scheme);

  if (analysis.contrastScore < 70) {
    const fgLum = relativeLuminance(scheme.core.foreground);
    if (fgLum < 0.4) {
      suggestions.push('Lighten foreground color to improve text readability');
    }
    
    const accentLum = relativeLuminance(scheme.core.accent);
    if (accentLum < 0.3) {
      suggestions.push('Increase accent brightness for better visibility');
    }
  }

  if (analysis.oledScore < 60) {
    suggestions.push('Reduce overall luminance to protect OLED displays');
    suggestions.push('Consider switching to "Conservative" or "Ultra-Conservative" OLED mode');
  }

  if (analysis.distinctiveness < 60) {
    suggestions.push('Increase color variation — some terminal colors are too similar');
  }

  if (analysis.wcagCompliance.foregroundOnBg !== 'AAA') {
    suggestions.push(`Foreground contrast: ${contrastRatio(scheme.core.foreground, scheme.core.background).toFixed(1)}:1 — aim for 7:1 (AAA)`);
  }

  return suggestions;
}

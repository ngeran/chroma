/**
 * ChromaVoid Color Analyzer
 * WCAG contrast, enhanced OLED risk assessment, harmony analysis.
 */

import type { ColorScheme, AnalysisResult } from '../types/theme';
import { assessEnhancedOLERRisk } from './enhancedOLERRiskControl';

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
  const darker  = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function wcagLevel(ratio: number): 'AAA' | 'AA' | 'fail' {
  if (ratio >= 7)   return 'AAA';
  if (ratio >= 4.5) return 'AA';
  return 'fail';
}

function pixelBrightness(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return (r + g + b) / 765; // 0 = pure black, 1 = pure white
}

export function analyzeColorScheme(scheme: ColorScheme): AnalysisResult {
  const bg = scheme.core.background; // always #000000
  const allColors = [
    ...Object.values(scheme.core),
    ...Object.values(scheme.terminal),
  ].filter(v => typeof v === 'string' && v.startsWith('#'));

  // ── Enhanced OLED Risk Assessment
  // Convert hex colors to OKLCH format for risk assessment (simplified)
  const colorMap: Record<string, { L: number; C: number; h: number }> = {};
  allColors.forEach(color => {
    // Simplified conversion for risk assessment
    const brightness = pixelBrightness(color);
    colorMap[color] = {
      L: brightness,
      C: 0.1, // Simplified chroma
      h: 180,  // Simplified hue
    };
  });
  
  const riskAssessment = assessEnhancedOLERRisk(colorMap, 'balanced');
  const oledScore = Math.round((100 - riskAssessment.overallScore) * 0.8); // Convert to 0-100 scale
  const burnInRisk = riskAssessment.overallRisk;

  // ── WCAG Contrast
  const fgRatio     = contrastRatio(scheme.core.foreground,    bg);
  const accentRatio = contrastRatio(scheme.core.accent,        bg);
  const abRatio     = contrastRatio(scheme.core.accent_bright, bg);

  const wcagCompliance = {
    foregroundOnBg:  wcagLevel(fgRatio),
    accentOnBg:      wcagLevel(accentRatio),
    accentBrightOnBg: wcagLevel(abRatio),
  };

  const wcagScore = [fgRatio, accentRatio, abRatio]
    .map(r => Math.min(r / 7, 1))
    .reduce((a, b) => a + b, 0) / 3 * 100;

  const contrastScore = Math.round(wcagScore);

  // ── Harmony: measure hue diversity and perceptual spread
  function hexToHue(hex: string): number {
    const [r, g, b] = hexToRgb(hex).map(v => v / 255);
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    if (max === min) return 0;
    const d = max - min;
    let h = 0;
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
    return h * 360;
  }

  const hues = allColors.filter(c => c !== '#000000').map(hexToHue);
  const hueSpread = hues.length > 1
    ? Math.min(hues.reduce((a, b) => a + b, 0) / hues.length / 360 * 100, 100)
    : 50;
  const harmonyScore = Math.round(hueSpread);

  // ── Distinctiveness: are colors different enough from each other?
  const luminances = allColors.map(relativeLuminance);
  const lumRange = Math.max(...luminances) - Math.min(...luminances);
  const distinctiveness = Math.round(Math.min(lumRange * 300, 100));

  // ── Overall score
  const overallScore = Math.round(
    oledScore * 0.35 +
    contrastScore * 0.35 +
    harmonyScore * 0.15 +
    distinctiveness * 0.15
  );

  // ── Luminance profile (for visualization)
  const terminalColors = Object.values(scheme.terminal).filter(v => typeof v === 'string') as string[];
  const luminanceProfile = terminalColors.map(c => Math.round(relativeLuminance(c) * 1000) / 10);

  // ── Count categories
  const darkColors   = allColors.filter(c => pixelBrightness(c) < 0.15).length;
  const brightColors = allColors.filter(c => pixelBrightness(c) > 0.4).length;
  const neutralColors = allColors.length - darkColors - brightColors;

  // ── Human insights
  const insights: string[] = [];
  const warnings: string[] = [];

  if (oledScore >= 85)    insights.push('Excellent OLED efficiency — minimal power draw on AMOLED displays.');
  else if (oledScore >= 70) insights.push('Good OLED optimization with acceptable luminance levels.');
  else warnings.push('High average luminance detected — consider darkening bright colors.');

  if (contrastScore >= 80) insights.push('Strong readability with high contrast ratios across key UI elements.');
  else if (contrastScore >= 60) insights.push('Moderate contrast — usable but could be improved for accessibility.');
  else warnings.push('Some colors may be difficult to read against the black background.');

  if (burnInRisk === 'low')    insights.push('Low burn-in risk — safe for extended OLED use.');
  else if (burnInRisk === 'medium') warnings.push('Medium burn-in risk — avoid static display of bright colors.');
  else warnings.push('High burn-in risk — bright accent colors should not be displayed statically for long periods.');

  if (fgRatio >= 4.5) insights.push(`Foreground passes WCAG AA (ratio: ${fgRatio.toFixed(1)}:1).`);
  if (abRatio >= 7)   insights.push(`Bright accent achieves WCAG AAA contrast (ratio: ${abRatio.toFixed(1)}:1).`);

  return {
    overallScore,
    oledScore,
    contrastScore,
    harmonyScore,
    burnInRisk,
    wcagCompliance,
    luminanceProfile,
    distinctiveness,
    colorCount: { darkColors, brightColors, neutralColors },
    insights,
    warnings,
  };
}

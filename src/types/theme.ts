export interface ColorScheme {
  name: string;
  description: string;
  seed: string;
  style: SchemeStyle;
  hue: number; // 0–360 base hue
  createdAt: string;

  // CORE UI
  core: {
    background: string;    // always "#000000"
    foreground: string;
    accent: string;
    accent_bright: string;
    cursor: string;
    selection_bg: string;
    selection_fg: string;
  };

  // ANSI 16 TERMINAL COLORS
  terminal: {
    // Dark spectrum (0–7)
    color0: string;
    color1: string;
    color2: string;
    color3: string;
    color4: string;
    color5: string;
    color6: string;
    color7: string;
    // Bright spectrum (8–15)
    color8: string;
    color9: string;
    color10: string;
    color11: string;
    color12: string;
    color13: string;
    color14: string;
    color15: string;
  };
}

export type SchemeStyle =
  | 'monochrome'
  | 'complementary'
  | 'triadic'
  | 'analogous'
  | 'split-complementary'
  | 'tetradic'
  | 'spectral';

export type OledRiskLevel = 'ultra-conservative' | 'conservative' | 'balanced' | 'aggressive';

export interface AnalysisResult {
  overallScore: number;        // 0–100
  oledScore: number;           // 0–100 (pixel savings)
  contrastScore: number;       // 0–100 (WCAG compliance)
  harmonyScore: number;        // 0–100 (perceptual harmony)
  burnInRisk: 'low' | 'medium' | 'high';
  wcagCompliance: {
    foregroundOnBg: 'AA' | 'AAA' | 'fail';
    accentOnBg: 'AA' | 'AAA' | 'fail';
    accentBrightOnBg: 'AA' | 'AAA' | 'fail';
  };
  luminanceProfile: number[];  // per-color luminance array
  distinctiveness: number;     // how unique/differentiated colors are
  colorCount: {
    darkColors: number;
    brightColors: number;
    neutralColors: number;
  };
  insights: string[];          // human-readable analysis strings
  warnings: string[];
}

export interface AppTheme {
  mode: 'dark' | 'light';
}

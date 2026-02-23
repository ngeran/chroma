import { OKLAB, hexToOKLAB, oklabToHex, oklabToOKLCH } from './perceptualColor';
import type { ColorPalette, ColorScheme, OledRiskLevel } from '../types/theme';
import { getPaletteById } from './predefinedPalettes';

interface PaletteOptimizationOptions {
  oledRiskLevel: OledRiskLevel;
  preserveSaturation: number;
  preserveBrightness: number;
  contrastBoost: number;
}

interface OLEDThresholds {
  maxForegroundL: number;
  maxAccentL: number;
  maxBrightAccentL: number;
  maxDarkColorsL: number;
  maxBrightColorsL: number;
  maxChroma: number;
  minContrastRatio: number;
}

const OLED_THRESHOLDS: Record<OledRiskLevel, OLEDThresholds> = {
  'ultra-conservative': {
    maxForegroundL: 0.35,
    maxAccentL: 0.25,
    maxBrightAccentL: 0.35,
    maxDarkColorsL: 0.15,
    maxBrightColorsL: 0.25,
    maxChroma: 0.12,
    minContrastRatio: 5.0,
  },
  conservative: {
    maxForegroundL: 0.45,
    maxAccentL: 0.35,
    maxBrightAccentL: 0.45,
    maxDarkColorsL: 0.20,
    maxBrightColorsL: 0.35,
    maxChroma: 0.18,
    minContrastRatio: 4.5,
  },
  balanced: {
    maxForegroundL: 0.55,
    maxAccentL: 0.45,
    maxBrightAccentL: 0.55,
    maxDarkColorsL: 0.25,
    maxBrightColorsL: 0.45,
    maxChroma: 0.22,
    minContrastRatio: 4.0,
  },
  aggressive: {
    maxForegroundL: 0.65,
    maxAccentL: 0.55,
    maxBrightAccentL: 0.70,
    maxDarkColorsL: 0.30,
    maxBrightColorsL: 0.55,
    maxChroma: 0.30,
    minContrastRatio: 3.5,
  },
};

export class PaletteOptimizer {
  private static DEFAULT_OPTIONS: PaletteOptimizationOptions = {
    oledRiskLevel: 'balanced',
    preserveSaturation: 0.8,
    preserveBrightness: 0.5,
    contrastBoost: 0.2,
  };

  static async optimizePalette(
    paletteId: string,
    options: Partial<PaletteOptimizationOptions> = {}
  ): Promise<ColorScheme> {
    const palette = getPaletteById(paletteId);
    if (!palette) {
      throw new Error(`Palette "${paletteId}" not found`);
    }

    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    const thresholds = OLED_THRESHOLDS[opts.oledRiskLevel];

    const convertedColors = this.convertPaletteToOKLAB(palette);
    const optimizedColors = this.applyOLEDOptimizations(convertedColors, thresholds, opts);
    const terminalColors = this.generateTerminalColors(optimizedColors, thresholds);

    const colorScheme: ColorScheme = {
      name: `${palette.name} OLED`,
      description: `${palette.description} — ${opts.oledRiskLevel} OLED optimization`,
      seed: palette.name.toLowerCase().replace(/\s+/g, '-'),
      style: palette.harmony,
      hue: palette.baseHue,
      createdAt: new Date().toISOString(),

      core: {
        background: '#000000',
        foreground: oklabToHex(optimizedColors.foreground.L, optimizedColors.foreground.a, optimizedColors.foreground.b),
        accent: oklabToHex(optimizedColors.accent.L, optimizedColors.accent.a, optimizedColors.accent.b),
        accent_bright: oklabToHex(optimizedColors.accent_bright.L, optimizedColors.accent_bright.a, optimizedColors.accent_bright.b),
        cursor: oklabToHex(optimizedColors.accent.L, optimizedColors.accent.a, optimizedColors.accent.b),
        selection_bg: oklabToHex(optimizedColors.selection_bg.L, optimizedColors.selection_bg.a, optimizedColors.selection_bg.b),
        selection_fg: oklabToHex(optimizedColors.foreground.L, optimizedColors.foreground.a, optimizedColors.foreground.b),
      },

      terminal: terminalColors,
    };

    return colorScheme;
  }

  private static convertPaletteToOKLAB(palette: ColorPalette): Record<string, OKLAB> {
    const converted: Record<string, OKLAB> = {};

    Object.entries(palette.colors).forEach(([key, hex]) => {
      try {
        converted[key] = hexToOKLAB(hex);
      } catch {
        converted[key] = { L: 0.5, a: 0, b: 0 };
      }
    });

    return converted;
  }

  private static applyOLEDOptimizations(
    colors: Record<string, OKLAB>,
    thresholds: OLEDThresholds,
    options: PaletteOptimizationOptions
  ): Record<string, OKLAB> {
    const optimized: Record<string, OKLAB> = {};

    const clampColor = (color: OKLAB, maxL: number, maxC: number): OKLAB => {
      const lch = oklabToOKLCH(color.L, color.a, color.b);
      const newL = Math.min(lch.L, maxL);
      const newC = Math.min(lch.C * options.preserveSaturation, maxC);
      const radians = lch.h * (Math.PI / 180);
      return {
        L: newL,
        a: newC * Math.cos(radians),
        b: newC * Math.sin(radians),
      };
    };

    optimized.foreground = clampColor(
      colors.foreground || colors.fg || { L: 0.6, a: 0, b: 0 },
      thresholds.maxForegroundL,
      thresholds.maxChroma
    );

    optimized.accent = clampColor(
      colors.accent || colors.primary || { L: 0.4, a: 0.1, b: 0.1 },
      thresholds.maxAccentL,
      thresholds.maxChroma * 1.2
    );

    const brightAccentSource = colors.accent || colors.primary || { L: 0.5, a: 0.1, b: 0.1 };
    optimized.accent_bright = clampColor(
      { ...brightAccentSource, L: brightAccentSource.L * 1.15 },
      thresholds.maxBrightAccentL,
      thresholds.maxChroma * 1.3
    );

    optimized.background = { L: 0, a: 0, b: 0 };

    const selectionSource = optimized.accent;
    optimized.selection_bg = {
      L: Math.min(selectionSource.L * 0.15, 0.08),
      a: selectionSource.a * 0.3,
      b: selectionSource.b * 0.3,
    };

    optimized.error = clampColor(
      colors.error || { L: 0.35, a: 0.15, b: 0.08 },
      thresholds.maxDarkColorsL * 1.5,
      thresholds.maxChroma
    );
    optimized.warning = clampColor(
      colors.warning || { L: 0.35, a: 0.1, b: 0.12 },
      thresholds.maxDarkColorsL * 1.5,
      thresholds.maxChroma
    );
    optimized.success = clampColor(
      colors.success || { L: 0.35, a: -0.08, b: 0.1 },
      thresholds.maxDarkColorsL * 1.5,
      thresholds.maxChroma
    );
    optimized.info = clampColor(
      colors.info || colors.primary || { L: 0.35, a: 0.05, b: 0.12 },
      thresholds.maxDarkColorsL * 1.5,
      thresholds.maxChroma
    );
    optimized.primary = clampColor(
      colors.primary || { L: 0.35, a: 0.08, b: 0.1 },
      thresholds.maxDarkColorsL * 1.5,
      thresholds.maxChroma
    );
    optimized.secondary = clampColor(
      colors.secondary || { L: 0.3, a: 0.05, b: 0.08 },
      thresholds.maxDarkColorsL,
      thresholds.maxChroma
    );
    optimized.dim = clampColor(
      colors.dim || { L: 0.25, a: 0, b: 0 },
      thresholds.maxDarkColorsL * 0.8,
      thresholds.maxChroma * 0.5
    );
    optimized.layer = clampColor(
      colors.layer || { L: 0.15, a: 0, b: 0 },
      thresholds.maxDarkColorsL * 0.6,
      thresholds.maxChroma * 0.3
    );
    optimized.surface = clampColor(
      colors.surface || { L: 0.1, a: 0, b: 0 },
      thresholds.maxDarkColorsL * 0.5,
      0
    );

    return optimized;
  }

  private static generateTerminalColors(
    colors: Record<string, OKLAB>,
    thresholds: OLEDThresholds
  ): ColorScheme['terminal'] {
    const darkBase = [
      colors.background || { L: 0.02, a: 0, b: 0 },
      colors.error || { L: 0.25, a: 0.12, b: 0.06 },
      colors.success || { L: 0.25, a: -0.06, b: 0.08 },
      colors.warning || { L: 0.25, a: 0.08, b: 0.1 },
      colors.primary || { L: 0.25, a: 0.06, b: 0.1 },
      colors.accent || { L: 0.25, a: 0.1, b: 0.08 },
      colors.info || { L: 0.25, a: 0.04, b: 0.1 },
      colors.foreground || { L: 0.4, a: 0, b: 0 },
    ];

    const clampDark = (c: OKLAB): OKLAB => ({
      L: Math.min(c.L, thresholds.maxDarkColorsL),
      a: c.a,
      b: c.b,
    });

    const clampBright = (c: OKLAB): OKLAB => ({
      L: Math.min(c.L + 0.08, thresholds.maxBrightColorsL),
      a: c.a,
      b: c.b,
    });

    const darkColors = darkBase.map(clampDark);
    const brightColors = darkBase.map(clampBright);

    const toHex = (c: OKLAB) => oklabToHex(c.L, c.a, c.b);

    return {
      color0: toHex(darkColors[0]),
      color1: toHex(darkColors[1]),
      color2: toHex(darkColors[2]),
      color3: toHex(darkColors[3]),
      color4: toHex(darkColors[4]),
      color5: toHex(darkColors[5]),
      color6: toHex(darkColors[6]),
      color7: toHex(darkColors[7]),
      color8: toHex(brightColors[0]),
      color9: toHex(brightColors[1]),
      color10: toHex(brightColors[2]),
      color11: toHex(brightColors[3]),
      color12: toHex(brightColors[4]),
      color13: toHex(brightColors[5]),
      color14: toHex(brightColors[6]),
      color15: toHex(brightColors[7]),
    };
  }

  static async optimizeMultiplePalettes(
    paletteIds: string[],
    options: Partial<PaletteOptimizationOptions> = {}
  ): Promise<ColorScheme[]> {
    const schemes: ColorScheme[] = [];
    for (const paletteId of paletteIds) {
      try {
        const scheme = await this.optimizePalette(paletteId, options);
        schemes.push(scheme);
      } catch (error) {
        console.warn(`Failed to optimize palette ${paletteId}:`, error);
      }
    }
    return schemes;
  }

  static getAvailablePaletteIds(): string[] {
    return ['nord', 'tokyo_night', 'gruvbox', 'catppuccin', 'monokai', 'dracula'];
  }
}

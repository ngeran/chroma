import { OKLAB, hexToOKLAB, oklabToHex, oklabToOKLCH } from './perceptualColor';
import { ColorPalette, ColorScheme, SchemeStyle } from '@/types/theme';
import { getPaletteById } from './predefinedPalettes';

interface PaletteOptimizationOptions {
  oledRiskLevel: 'ultra-conservative' | 'conservative' | 'balanced' | 'aggressive';
  preserveSaturation: number; // 0-1, how much to preserve original saturation
  preserveBrightness: number; // 0-1, how much to preserve original brightness
  contrastBoost: number; // 0-1, how much to boost contrast
}

export class PaletteOptimizer {
  private static DEFAULT_OPTIONS: PaletteOptimizationOptions = {
    oledRiskLevel: 'balanced',
    preserveSaturation: 0.7,
    preserveBrightness: 0.6,
    contrastBoost: 0.3
  };

  /**
   * Optimize a predefined palette for OLED displays
   */
  static async optimizePalette(
    paletteId: string, 
    options: Partial<PaletteOptimizationOptions> = {}
  ): Promise<ColorScheme> {
    const palette = getPaletteById(paletteId);
    if (!palette) {
      throw new Error(`Palette "${paletteId}" not found`);
    }

    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    
    // Convert palette colors to OKLAB for processing
    const convertedColors = this.convertPaletteToOKLAB(palette);
    
    // Apply OLED optimizations
    const optimizedColors = this.applyOLEDOptimizations(convertedColors, opts);
    
    // Generate terminal colors from the optimized palette
    const terminalColors = this.generateTerminalColors(optimizedColors, palette.harmony);
    
    // Convert to ColorScheme format
    const colorScheme: ColorScheme = {
      name: `${palette.name} OLED`,
      description: `${palette.description} - OLED optimized`,
      seed: palette.name.toLowerCase().replace(/\s+/g, '-'),
      style: palette.harmony,
      hue: palette.baseHue,
      createdAt: new Date().toISOString(),
      
      core: {
        background: '#000000', // Always pure black for OLED
        foreground: oklabToHex(optimizedColors.foreground.L, optimizedColors.foreground.a, optimizedColors.foreground.b),
        accent: oklabToHex(optimizedColors.accent.L, optimizedColors.accent.a, optimizedColors.accent.b),
        accent_bright: this.createBrightAccent(optimizedColors.accent),
        cursor: oklabToHex(optimizedColors.accent.L, optimizedColors.accent.a, optimizedColors.accent.b),
        selection_bg: oklabToHex(this.createSelectionBg(optimizedColors).L, this.createSelectionBg(optimizedColors).a, this.createSelectionBg(optimizedColors).b),
        selection_fg: oklabToHex(optimizedColors.foreground.L, optimizedColors.foreground.a, optimizedColors.foreground.b)
      },
      
      terminal: terminalColors
    };
    
    return colorScheme;
  }

  /**
   * Convert all palette colors to OKLAB format
   */
  private static convertPaletteToOKLAB(palette: ColorPalette): Record<string, OKLAB> {
    const converted: Record<string, OKLAB> = {};
    
    Object.entries(palette.colors).forEach(([key, hex]) => {
      try {
        converted[key] = hexToOKLAB(hex);
      } catch (error) {
        console.warn(`Failed to convert color ${key}: ${hex}`, error);
        // Fallback to a reasonable default
        converted[key] = { L: 0.7, a: 0, b: 0 };
      }
    });
    
    return converted;
  }

  /**
   * Apply OLED-specific optimizations to the color palette
   */
  private static applyOLEDOptimizations(
    colors: Record<string, OKLAB>, 
    options: PaletteOptimizationOptions
  ): Record<string, OKLAB> {
    const optimized: Record<string, OKLAB> = {};
    
    // Optimization thresholds based on risk level
    const thresholds = this.getOptimizationThresholds(options.oledRiskLevel);
    
    Object.entries(colors).forEach(([key, color]) => {
      let optimizedColor = { ...color };
      
      // 1. Reduce luminance for dark colors to prevent burn-in
      if (this.isDarkColor(color)) {
        optimizedColor.L = Math.max(color.L * (1 - thresholds.luminanceReduction), thresholds.minLuminance);
      }
      
      // 2. Adjust chroma to balance saturation and OLED safety
      if (options.preserveSaturation > 0) {
        const lch = oklabToOKLCH(color.L, color.a, color.b);
        const chromaFactor = Math.min(lch.C, thresholds.maxChroma) / Math.max(lch.C, 0.01);
        const newChroma = lch.C * (options.preserveSaturation + (1 - options.preserveSaturation) * chromaFactor);
        
        // Convert back to OKLAB with adjusted chroma
        const radians = lch.h * (Math.PI / 180);
        optimizedColor.a = newChroma * Math.cos(radians);
        optimizedColor.b = newChroma * Math.sin(radians);
      }
      
      // 3. Boost contrast for important colors
      if (['foreground', 'primary', 'accent'].includes(key) && options.contrastBoost > 0) {
        optimizedColor.L = Math.min(optimizedColor.L + (options.contrastBoost * 0.1), 0.95);
      }
      
      // 4. Ensure minimum visibility for all colors
      optimizedColor = this.ensureMinimumVisibility(optimizedColor, key);
      
      optimized[key] = optimizedColor;
    });
    
    return optimized;
  }

  /**
   * Get optimization thresholds based on OLED risk level
   */
  private static getOptimizationThresholds(riskLevel: string) {
    const thresholds = {
      'ultra-conservative': {
        luminanceReduction: 0.4,
        minLuminance: 0.05,
        maxChroma: 0.15,
        minContrast: 4.5
      },
      'conservative': {
        luminanceReduction: 0.25,
        minLuminance: 0.08,
        maxChroma: 0.2,
        minContrast: 3.5
      },
      'balanced': {
        luminanceReduction: 0.15,
        minLuminance: 0.1,
        maxChroma: 0.25,
        minContrast: 3
      },
      'aggressive': {
        luminanceReduction: 0.05,
        minLuminance: 0.12,
        maxChroma: 0.3,
        minContrast: 2.5
      }
    };
    
    return thresholds[riskLevel as keyof typeof thresholds] || thresholds.balanced;
  }

  /**
   * Check if a color is dark (low luminance)
   */
  private static isDarkColor(color: OKLAB): boolean {
    return color.L < 0.3;
  }

  /**
   * Ensure minimum visibility for colors
   */
  private static ensureMinimumVisibility(color: OKLAB, role: string): OKLAB {
    const minLuminance = role === 'foreground' ? 0.7 : 
                        role === 'accent' ? 0.5 : 
                        role === 'background' ? 0.02 : 0.1;
    
    const maxChroma = role === 'foreground' ? 0.2 : 
                     role === 'accent' ? 0.3 : 0.25;
    
    // Convert to OKLCH to check and adjust chroma
    const lch = oklabToOKLCH(color.L, color.a, color.b);
    const adjustedChroma = Math.min(lch.C, maxChroma);
    
    // Convert back to OKLAB with adjusted chroma
    const radians = lch.h * (Math.PI / 180);
    const adjustedA = adjustedChroma * Math.cos(radians);
    const adjustedB = adjustedChroma * Math.sin(radians);
    
    return {
      L: Math.max(color.L, minLuminance),
      a: adjustedA,
      b: adjustedB
    };
  }

  /**
   * Generate 16-color terminal palette from optimized colors
   */
  private static generateTerminalColors(
    colors: Record<string, OKLAB>, 
    _harmony: SchemeStyle
  ) {
    // Dark colors (0-7)
    const color0 = oklabToHex((colors.background || { L: 0.05, a: 0, b: 0 }).L, (colors.background || { L: 0.05, a: 0, b: 0 }).a, (colors.background || { L: 0.05, a: 0, b: 0 }).b);
    const color1 = oklabToHex((colors.error || { L: 0.3, a: 0.2, b: 0.1 }).L, (colors.error || { L: 0.3, a: 0.2, b: 0.1 }).a, (colors.error || { L: 0.3, a: 0.2, b: 0.1 }).b);
    const color2 = oklabToHex((colors.success || { L: 0.3, a: -0.1, b: 0.2 }).L, (colors.success || { L: 0.3, a: -0.1, b: 0.2 }).a, (colors.success || { L: 0.3, a: -0.1, b: 0.2 }).b);
    const color3 = oklabToHex((colors.warning || { L: 0.3, a: 0.15, b: 0.1 }).L, (colors.warning || { L: 0.3, a: 0.15, b: 0.1 }).a, (colors.warning || { L: 0.3, a: 0.15, b: 0.1 }).b);
    const color4 = oklabToHex((colors.primary || { L: 0.3, a: 0, b: 0.2 }).L, (colors.primary || { L: 0.3, a: 0, b: 0.2 }).a, (colors.primary || { L: 0.3, a: 0, b: 0.2 }).b);
    const color5 = oklabToHex((colors.accent || { L: 0.3, a: 0.15, b: 0.1 }).L, (colors.accent || { L: 0.3, a: 0.15, b: 0.1 }).a, (colors.accent || { L: 0.3, a: 0.15, b: 0.1 }).b);
    const color6 = oklabToHex((colors.info || { L: 0.3, a: 0, b: 0.15 }).L, (colors.info || { L: 0.3, a: 0, b: 0.15 }).a, (colors.info || { L: 0.3, a: 0, b: 0.15 }).b);
    const color7 = oklabToHex((colors.foreground || { L: 0.8, a: 0, b: 0 }).L, (colors.foreground || { L: 0.8, a: 0, b: 0 }).a, (colors.foreground || { L: 0.8, a: 0, b: 0 }).b);
    
    // Bright colors (8-15) - increased luminance
    const brighten = (color: OKLAB) => ({ ...color, L: Math.min(color.L + 0.2, 0.95) });
    
    const bgBright = brighten(colors.background || { L: 0.05, a: 0, b: 0 });
    const errorBright = brighten(colors.error || { L: 0.3, a: 0.2, b: 0.1 });
    const successBright = brighten(colors.success || { L: 0.3, a: -0.1, b: 0.2 });
    const warningBright = brighten(colors.warning || { L: 0.3, a: 0.15, b: 0.1 });
    const primaryBright = brighten(colors.primary || { L: 0.3, a: 0, b: 0.2 });
    const accentBright = brighten(colors.accent || { L: 0.3, a: 0.15, b: 0.1 });
    const infoBright = brighten(colors.info || { L: 0.3, a: 0, b: 0.15 });
    const fgBright = brighten(colors.foreground || { L: 0.8, a: 0, b: 0 });
    
    const color8 = oklabToHex(bgBright.L, bgBright.a, bgBright.b);
    const color9 = oklabToHex(errorBright.L, errorBright.a, errorBright.b);
    const color10 = oklabToHex(successBright.L, successBright.a, successBright.b);
    const color11 = oklabToHex(warningBright.L, warningBright.a, warningBright.b);
    const color12 = oklabToHex(primaryBright.L, primaryBright.a, primaryBright.b);
    const color13 = oklabToHex(accentBright.L, accentBright.a, accentBright.b);
    const color14 = oklabToHex(infoBright.L, infoBright.a, infoBright.b);
    const color15 = oklabToHex(fgBright.L, fgBright.a, fgBright.b);
    
    return {
      color0, color1, color2, color3, color4, color5, color6, color7,
      color8, color9, color10, color11, color12, color13, color14, color15
    };
  }

  /**
   * Create a bright version of accent color
   */
  private static createBrightAccent(accent: OKLAB): string {
    const brightAccent = { ...accent, L: Math.min(accent.L + 0.15, 0.95) };
    return oklabToHex(brightAccent.L, brightAccent.a, brightAccent.b);
  }

  /**
   * Create selection background color
   */
  private static createSelectionBg(colors: Record<string, OKLAB>): OKLAB {
    // Create a subtle selection background using the accent color
    const selectionL = Math.max(colors.foreground.L * 0.1, 0.05);
    const selectionA = colors.accent.a * 0.3;
    const selectionB = colors.accent.b * 0.3;
    
    return { L: selectionL, a: selectionA, b: selectionB };
  }

  /**
   * Batch optimize multiple palettes
   */
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

  /**
   * Get available palette IDs
   */
  static getAvailablePaletteIds(): string[] {
    return ['nord', 'tokyo_night', 'gruvbox', 'catppuccin', 'monokai', 'dracula'];
  }
}
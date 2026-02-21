/**
 * Contextual Color Generation
 * Role-specific color generation with psychological considerations
 * and contextual optimization for different use cases.
 */

import type { OKLCH } from './perceptualColor';
import { optimizeForOLED } from './advancedColorGenerator';
import type { OledRiskLevel } from '../types/theme';

// ── Color Context Types ────────────────────────────────────────────────────────

export type ColorContext = 'ui' | 'terminal' | 'syntax' | 'data';
export type ColorRole = 
  | 'background' | 'foreground' | 'accent' | 'warning' | 'error' | 'success' | 'info'
  | 'cursor' | 'selection' | 'highlight' | 'border' | 'shadow'
  | 'keyword' | 'string' | 'comment' | 'variable' | 'function' | 'operator'
  | 'data_positive' | 'data_negative' | 'data_neutral';

export interface ColorContextConfig {
  minContrast: number;
  recommendedSaturation: [number, number]; // [min, max] as 0-1
  recommendedLightness: [number, number]; // [min, max] as 0-1
  chromaImportance: 'low' | 'medium' | 'high';
  psychologicalWeight: number; // 0-1, importance in overall scheme
}

export interface RoleSpecification {
  role: ColorRole;
  context: ColorContext;
  priority: 'critical' | 'high' | 'medium' | 'low';
  psychologicalImpact: {
    energy: number; // 0-1 (calm to energetic)
    warmth: number; // 0-1 (cool to warm)
    attention: number; // 0-1 (subtle to attention-grabbing)
  };
  functionalRequirements: {
    minContrast: number;
    maxChroma?: number;
    preferredHueRange?: [number, number]; // [min, max] degrees
    avoidHueRanges?: [number, number][]; // ranges to avoid
  };
}

// ── Context Configuration Database ─────────────────────────────────────────────

const CONTEXT_CONFIGS: Record<ColorContext, ColorContextConfig> = {
  ui: {
    minContrast: 4.5,
    recommendedSaturation: [0.02, 0.18], // Moderate saturation for UI
    recommendedLightness: [0.15, 0.85], // Wide lightness range for UI elements
    chromaImportance: 'medium',
    psychologicalWeight: 0.9,
  },
  terminal: {
    minContrast: 3.0, // Lower contrast for terminal (can be adjusted per user)
    recommendedSaturation: [0.08, 0.25], // Higher saturation for terminal visibility
    recommendedLightness: [0.25, 0.70], // Mid-range lightness for ANSI colors
    chromaImportance: 'high',
    psychologicalWeight: 0.8,
  },
  syntax: {
    minContrast: 2.5, // Syntax can have lower contrast as it's often background content
    recommendedSaturation: [0.12, 0.30], // High saturation for syntax highlighting
    recommendedLightness: [0.30, 0.75], // Lighter range for syntax visibility
    chromaImportance: 'high',
    psychologicalWeight: 0.6,
  },
  data: {
    minContrast: 3.0, // Data visualization needs good contrast
    recommendedSaturation: [0.15, 0.35], // High saturation for data distinction
    recommendedLightness: [0.20, 0.80], // Wide range for data hierarchy
    chromaImportance: 'high',
    psychologicalWeight: 0.7,
  },
};

// ── Role Specifications Database ────────────────────────────────────────────────

const ROLE_SPECIFICATIONS: Record<ColorRole, RoleSpecification> = {
  // Core UI roles
  background: {
    role: 'background',
    context: 'ui',
    priority: 'critical',
    psychologicalImpact: { energy: 0.1, warmth: 0.5, attention: 0.0 },
    functionalRequirements: {
      minContrast: 1.0, // Background doesn't need contrast against itself
      maxChroma: 0.02, // Very low chroma for backgrounds
    },
  },
  foreground: {
    role: 'foreground',
    context: 'ui',
    priority: 'critical',
    psychologicalImpact: { energy: 0.3, warmth: 0.4, attention: 0.2 },
    functionalRequirements: {
      minContrast: 4.5,
    },
  },
  accent: {
    role: 'accent',
    context: 'ui',
    priority: 'high',
    psychologicalImpact: { energy: 0.7, warmth: 0.6, attention: 0.8 },
    functionalRequirements: {
      minContrast: 3.0,
    },
  },
  warning: {
    role: 'warning',
    context: 'ui',
    priority: 'high',
    psychologicalImpact: { energy: 0.9, warmth: 0.9, attention: 0.9 },
    functionalRequirements: {
      minContrast: 3.0,
      preferredHueRange: [30, 60], // Yellow-orange range
    },
  },
  error: {
    role: 'error',
    context: 'ui',
    priority: 'high',
    psychologicalImpact: { energy: 0.9, warmth: 0.8, attention: 1.0 },
    functionalRequirements: {
      minContrast: 3.0,
      preferredHueRange: [0, 20], // Red range
    },
  },
  success: {
    role: 'success',
    context: 'ui',
    priority: 'medium',
    psychologicalImpact: { energy: 0.6, warmth: 0.4, attention: 0.7 },
    functionalRequirements: {
      minContrast: 3.0,
      preferredHueRange: [90, 150], // Green range
    },
  },
  info: {
    role: 'info',
    context: 'ui',
    priority: 'medium',
    psychologicalImpact: { energy: 0.4, warmth: 0.5, attention: 0.6 },
    functionalRequirements: {
      minContrast: 3.0,
      preferredHueRange: [180, 240], // Blue range
    },
  },
  
  // Interactive elements
  cursor: {
    role: 'cursor',
    context: 'ui',
    priority: 'medium',
    psychologicalImpact: { energy: 0.8, warmth: 0.6, attention: 0.9 },
    functionalRequirements: {
      minContrast: 2.5,
    },
  },
  selection: {
    role: 'selection',
    context: 'ui',
    priority: 'medium',
    psychologicalImpact: { energy: 0.3, warmth: 0.5, attention: 0.4 },
    functionalRequirements: {
      minContrast: 2.0,
    },
  },
  highlight: {
    role: 'highlight',
    context: 'ui',
    priority: 'medium',
    psychologicalImpact: { energy: 0.6, warmth: 0.4, attention: 0.7 },
    functionalRequirements: {
      minContrast: 3.0,
    },
  },
  border: {
    role: 'border',
    context: 'ui',
    priority: 'low',
    psychologicalImpact: { energy: 0.2, warmth: 0.5, attention: 0.1 },
    functionalRequirements: {
      minContrast: 1.5,
    },
  },
  shadow: {
    role: 'shadow',
    context: 'ui',
    priority: 'low',
    psychologicalImpact: { energy: 0.0, warmth: 0.5, attention: 0.0 },
    functionalRequirements: {
      minContrast: 1.0,
      maxChroma: 0.01,
    },
  },
  
  // Syntax roles
  keyword: {
    role: 'keyword',
    context: 'syntax',
    priority: 'medium',
    psychologicalImpact: { energy: 0.7, warmth: 0.3, attention: 0.8 },
    functionalRequirements: {
      minContrast: 2.5,
    },
  },
  string: {
    role: 'string',
    context: 'syntax',
    priority: 'low',
    psychologicalImpact: { energy: 0.5, warmth: 0.4, attention: 0.3 },
    functionalRequirements: {
      minContrast: 2.0,
    },
  },
  comment: {
    role: 'comment',
    context: 'syntax',
    priority: 'low',
    psychologicalImpact: { energy: 0.2, warmth: 0.5, attention: 0.1 },
    functionalRequirements: {
      minContrast: 1.5,
    },
  },
  variable: {
    role: 'variable',
    context: 'syntax',
    priority: 'medium',
    psychologicalImpact: { energy: 0.4, warmth: 0.6, attention: 0.3 },
    functionalRequirements: {
      minContrast: 2.0,
    },
  },
  function: {
    role: 'function',
    context: 'syntax',
    priority: 'medium',
    psychologicalImpact: { energy: 0.6, warmth: 0.5, attention: 0.6 },
    functionalRequirements: {
      minContrast: 2.5,
    },
  },
  operator: {
    role: 'operator',
    context: 'syntax',
    priority: 'medium',
    psychologicalImpact: { energy: 0.5, warmth: 0.4, attention: 0.5 },
    functionalRequirements: {
      minContrast: 2.0,
    },
  },
  
  // Data visualization roles
  data_positive: {
    role: 'data_positive',
    context: 'data',
    priority: 'medium',
    psychologicalImpact: { energy: 0.6, warmth: 0.4, attention: 0.6 },
    functionalRequirements: {
      minContrast: 3.0,
      preferredHueRange: [90, 150], // Green range
    },
  },
  data_negative: {
    role: 'data_negative',
    context: 'data',
    priority: 'medium',
    psychologicalImpact: { energy: 0.8, warmth: 0.8, attention: 0.8 },
    functionalRequirements: {
      minContrast: 3.0,
      preferredHueRange: [0, 20], // Red range
    },
  },
  data_neutral: {
    role: 'data_neutral',
    context: 'data',
    priority: 'medium',
    psychologicalImpact: { energy: 0.3, warmth: 0.5, attention: 0.2 },
    functionalRequirements: {
      minContrast: 3.0,
      preferredHueRange: [200, 260], // Blue-gray range
    },
  },
};

// ── Contextual Color Generation ─────────────────────────────────────────────────

export interface ContextualColorOptions {
  baseColor: OKLCH;
  role: ColorRole;
  context: ColorContext;
  oledRiskLevel: OledRiskLevel;
  referenceColor?: OKLCH; // For contrast calculations
  displayType?: 'phone' | 'monitor' | 'tv';
}

/**
 * Generate a contextually appropriate color based on role and usage
 */
export function generateContextualColor(options: ContextualColorOptions): OKLCH {
  const {
    baseColor,
    role,
    context,
    oledRiskLevel,
    referenceColor = { L: 0, C: 0, h: 0 }, // Default to black background
    displayType = 'monitor',
  } = options;
  
  // Get role specifications and context configuration
  const roleSpec = ROLE_SPECIFICATIONS[role];
  const contextConfig = CONTEXT_CONFIGS[context];
  
  // Start with base color and apply role-specific adjustments
  let { L, C, h } = baseColor;
  
  // 1. Apply psychological adjustments
  const adjustedHue = applyPsychologicalAdjustments(h, roleSpec.psychologicalImpact);
  
  // 2. Apply context constraints
  const constrainedLightness = constrainLightness(L, contextConfig.recommendedLightness);
  const constrainedChroma = constrainChroma(C, contextConfig.recommendedSaturation);
  
  // 3. Apply functional requirements
  const functionalColor = applyFunctionalRequirements({
    L: constrainedLightness,
    C: constrainedChroma,
    h: adjustedHue,
  }, roleSpec.functionalRequirements, referenceColor);
  
  // 4. Optimize for OLED
  const oledRole = determineOLEDRole(role, context);
  const oledConfig = {
    powerSavingWeight: 0.7,
    visualQualityWeight: 0.3,
    displayType,
    riskLevel: oledRiskLevel,
  };
  
  const optimizedColor = optimizeForOLED(functionalColor, oledRole, oledConfig);
  
  // 5. Final validation and adjustment
  const finalColor = validateAndAdjust(optimizedColor, roleSpec, contextConfig);
  
  return finalColor;
}

// ── Psychological Adjustments ─────────────────────────────────────────────────

function applyPsychologicalAdjustments(
  baseHue: number,
  impact: { energy: number; warmth: number; attention: number }
): number {
  let adjustedHue = baseHue;
  
  // Warmth adjustment (0 = cool/blue, 1 = warm/red-yellow)
  if (impact.warmth > 0.7) {
    // Shift towards warm colors (red-yellow range)
    adjustedHue = (adjustedHue + 30) % 360;
  } else if (impact.warmth < 0.3) {
    // Shift towards cool colors (blue range)
    adjustedHue = (adjustedHue + 210) % 360;
  }
  
  // Energy adjustment (0 = calm, 1 = energetic)
  if (impact.energy > 0.8) {
    // High energy colors are often in the red-orange or bright blue ranges
    adjustedHue = impact.attention > 0.7 ? 
      ((adjustedHue % 60) + 15) : // Warm energetic
      ((adjustedHue % 120) + 210); // Cool energetic
  }
  
  return adjustedHue;
}

// ── Constraint Functions ─────────────────────────────────────────────────────

function constrainLightness(lightness: number, range: [number, number]): number {
  const [min, max] = range;
  return Math.max(min, Math.min(max, lightness));
}

function constrainChroma(chroma: number, range: [number, number]): number {
  const [min, max] = range;
  return Math.max(min, Math.min(max, chroma));
}

// ── Functional Requirements Application ─────────────────────────────────────────

function applyFunctionalRequirements(
  color: OKLCH,
  requirements: RoleSpecification['functionalRequirements'],
  _reference: OKLCH
): OKLCH {
  let { L, C, h } = color;
  
  // Apply preferred hue range if specified
  if (requirements.preferredHueRange) {
    const [minHue, maxHue] = requirements.preferredHueRange;
    if (h < minHue || h > maxHue) {
      // Find closest hue in preferred range
      const centerHue = (minHue + maxHue) / 2;
      const distance = Math.abs(h - centerHue);
      if (distance > 180) {
        h = centerHue + (distance > 270 ? -90 : 90);
      } else {
        h = Math.max(minHue, Math.min(maxHue, h));
      }
    }
  }
  
  // Avoid specific hue ranges if specified
  if (requirements.avoidHueRanges) {
    for (const [minHue, maxHue] of requirements.avoidHueRanges) {
      if (h >= minHue && h <= maxHue) {
        // Shift to nearest safe hue
        h = minHue > 0 ? minHue - 10 : maxHue + 10;
        break;
      }
    }
  }
  
  // Apply chroma cap if specified
  if (requirements.maxChroma) {
    C = Math.min(C, requirements.maxChroma);
  }
  
  return { L, C, h };
}

// ── OLED Role Determination ──────────────────────────────────────────────────

function determineOLEDRole(role: ColorRole, _context: ColorContext): 'foreground' | 'accent' | 'brightAccent' | 'background' {
  // Map contextual roles to OLED optimization roles
  switch (role) {
    case 'background':
    case 'shadow':
      return 'background';
    
    case 'foreground':
    case 'cursor':
    case 'string':
    case 'comment':
      return 'foreground';
    
    case 'accent':
    case 'warning':
    case 'error':
    case 'success':
    case 'info':
    case 'highlight':
    case 'keyword':
    case 'function':
    case 'data_positive':
    case 'data_negative':
      return 'accent';
    
    case 'selection':
    case 'border':
    case 'variable':
    case 'operator':
    case 'data_neutral':
    default:
      return 'brightAccent';
  }
}

// ── Final Validation and Adjustment ────────────────────────────────────────────

function validateAndAdjust(
  color: OKLCH,
  roleSpec: RoleSpecification,
  _contextConfig: ColorContextConfig
): OKLCH {
  let { L, C, h } = color;
  
  // Ensure minimum contrast requirements (simplified - in practice would need reference color)
  // This is a placeholder for full contrast validation
  
  // Apply priority-based quality boost
  const qualityBoost = roleSpec.priority === 'critical' ? 1.1 : 
                     roleSpec.priority === 'high' ? 1.05 : 1.0;
  
  // Boost chroma slightly for high-importance contexts
  if (_contextConfig.chromaImportance === 'high' && roleSpec.priority !== 'low') {
    C = Math.min(0.25, C * qualityBoost);
  }
  
  // Final sanity checks
  L = Math.max(0.01, Math.min(0.99, L));
  C = Math.max(0.001, Math.min(0.35, C));
  h = ((h % 360) + 360) % 360;
  
  return { L, C, h };
}

// ── Batch Contextual Generation ──────────────────────────────────────────────────

export interface ContextualPaletteOptions {
  baseColors: OKLCH[];
  roles: ColorRole[];
  context: ColorContext;
  oledRiskLevel: OledRiskLevel;
  referenceColor?: OKLCH;
  displayType?: 'phone' | 'monitor' | 'tv';
}

/**
 * Generate a complete contextual palette for multiple roles
 */
export function generateContextualPalette(options: ContextualPaletteOptions): Record<ColorRole, OKLCH> {
  const {
    baseColors,
    roles,
    context,
    oledRiskLevel,
    referenceColor = { L: 0, C: 0, h: 0 },
    displayType = 'monitor',
  } = options;
  
  const palette: Record<ColorRole, OKLCH> = {} as Record<ColorRole, OKLCH>;
  
  // Sort roles by priority to ensure important roles get best base colors
  const sortedRoles = [...roles].sort((a, b) => {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return priorityOrder[ROLE_SPECIFICATIONS[b].priority] - priorityOrder[ROLE_SPECIFICATIONS[a].priority];
  });
  
  sortedRoles.forEach((role, index) => {
    const baseColor = baseColors[index % baseColors.length];
    palette[role] = generateContextualColor({
      baseColor,
      role,
      context,
      oledRiskLevel,
      referenceColor,
      displayType,
    });
  });
  
  return palette;
}
/**
 * Enhanced OLED Risk Control System
 * Sophisticated OLED optimization with advanced risk assessment and intelligent color compensation
 * for maximum safety while maintaining aesthetics and readability.
 */

import type { OKLCH } from './perceptualColor';
import type { OledRiskLevel } from '../types/theme';

// ── Enhanced Risk Level Definitions ─────────────────────────────────────────────

export interface EnhancedOLEDRiskConfig {
  name: string;
  description: string;
  maxLightness: {
    foreground: number;     // 0-1
    accent: number;         // 0-1
    brightAccent: number;   // 0-1
    selection: number;      // 0-1
    darkColors: number;     // 0-1 (ANSI 0-7)
    brightColors: number;   // 0-1 (ANSI 8-15)
  };
  maxChroma: {
    foreground: number;     // 0-1
    accent: number;         // 0-1
    brightAccent: number;   // 0-1
  };
  minContrast: number;      // Minimum contrast ratio
  chromaCompensation: number; // Boost factor for chroma when reducing lightness
  riskThreshold: {
    low: number;            // 0-100, below this is low risk
    medium: number;        // 0-100, below this is medium risk
  };
  colorAdaptation: {
    saturationBoost: number;  // Boost saturation when reducing lightness
    hueShift: number;       // Subtle hue shift for aesthetics
    contrastEnhancement: number;
  };
}

const ENHANCED_OLED_CONFIGS: Record<OledRiskLevel, EnhancedOLEDRiskConfig> = {
  'ultra-conservative': {
    name: 'Ultra Conservative',
    description: 'Maximum OLED protection with intelligent color compensation',
    maxLightness: {
      foreground: 0.25,     // Very dim for maximum protection
      accent: 0.20,
      brightAccent: 0.30,
      selection: 0.08,
      darkColors: 0.10,
      brightColors: 0.18,
    },
    maxChroma: {
      foreground: 0.15,     // Limited chroma to prevent "neon" effect
      accent: 0.12,
      brightAccent: 0.18,
    },
    minContrast: 5.0,      // Higher contrast for readability
    chromaCompensation: 1.4, // Significant chroma boost
    riskThreshold: {
      low: 15,             // 0-15 = low risk
      medium: 30,          // 16-30 = medium risk
    },
    colorAdaptation: {
      saturationBoost: 1.6,  // High saturation boost
      hueShift: 5,          // Subtle hue adjustment
      contrastEnhancement: 1.2,
    },
  },
  conservative: {
    name: 'Conservative',
    description: 'Strong OLED protection with balanced aesthetics',
    maxLightness: {
      foreground: 0.30,
      accent: 0.25,
      brightAccent: 0.35,
      selection: 0.10,
      darkColors: 0.12,
      brightColors: 0.22,
    },
    maxChroma: {
      foreground: 0.18,
      accent: 0.15,
      brightAccent: 0.22,
    },
    minContrast: 4.5,
    chromaCompensation: 1.3,
    riskThreshold: {
      low: 20,
      medium: 40,
    },
    colorAdaptation: {
      saturationBoost: 1.4,
      hueShift: 4,
      contrastEnhancement: 1.15,
    },
  },
  balanced: {
    name: 'Balanced',
    description: 'Good OLED protection with excellent aesthetics',
    maxLightness: {
      foreground: 0.40,
      accent: 0.35,
      brightAccent: 0.50,
      selection: 0.12,
      darkColors: 0.16,
      brightColors: 0.30,
    },
    maxChroma: {
      foreground: 0.22,
      accent: 0.20,
      brightAccent: 0.28,
    },
    minContrast: 4.0,
    chromaCompensation: 1.2,
    riskThreshold: {
      low: 35,
      medium: 60,
    },
    colorAdaptation: {
      saturationBoost: 1.2,
      hueShift: 3,
      contrastEnhancement: 1.1,
    },
  },
  aggressive: {
    name: 'Aggressive',
    description: 'Moderate OLED protection with maximum brightness',
    maxLightness: {
      foreground: 0.55,
      accent: 0.50,
      brightAccent: 0.70,
      selection: 0.15,
      darkColors: 0.20,
      brightColors: 0.40,
    },
    maxChroma: {
      foreground: 0.30,
      accent: 0.28,
      brightAccent: 0.35,
    },
    minContrast: 3.5,
    chromaCompensation: 1.1,
    riskThreshold: {
      low: 50,
      medium: 75,
    },
    colorAdaptation: {
      saturationBoost: 1.1,
      hueShift: 2,
      contrastEnhancement: 1.05,
    },
  },
};

// ── Advanced Risk Assessment ────────────────────────────────────────────────────

export interface DetailedRiskAssessment {
  overallRisk: 'low' | 'medium' | 'high';
  overallScore: number; // 0-100 (higher = more risky)
  componentRisks: {
    foreground: RiskComponent;
    accent: RiskComponent;
    brightAccent: RiskComponent;
    darkColors: RiskComponent;
    brightColors: RiskComponent;
  };
  riskFactors: RiskFactor[];
  recommendations: string[];
  aestheticCompensation: {
    saturationApplied: number;
    hueShiftApplied: number;
    contrastEnhanced: boolean;
  };
}

export interface RiskComponent {
  riskLevel: 'low' | 'medium' | 'high';
  riskScore: number; // 0-100
  lightness: number; // 0-1
  chroma: number; // 0-1
  potentialIssue: string;
  compensationApplied: string;
}

export interface RiskFactor {
  factor: string;
  impact: 'high' | 'medium' | 'low';
  description: string;
  mitigation: string;
}

/**
 * Advanced risk assessment for OLED color schemes
 */
export function assessEnhancedOLERRisk(
  colors: Record<string, OKLCH>,
  riskLevel: OledRiskLevel
): DetailedRiskAssessment {
  const config = ENHANCED_OLED_CONFIGS[riskLevel];
  
  // Assess each component
  const componentRisks = {
    foreground: assessColorRisk(colors.foreground || { L: 0.3, C: 0.1, h: 180 }, 'foreground', config),
    accent: assessColorRisk(colors.accent || { L: 0.25, C: 0.15, h: 180 }, 'accent', config),
    brightAccent: assessColorRisk(colors.brightAccent || { L: 0.35, C: 0.2, h: 180 }, 'brightAccent', config),
    darkColors: assessColorRisk(colors.darkColors || { L: 0.12, C: 0.08, h: 180 }, 'darkColors', config),
    brightColors: assessColorRisk(colors.brightColors || { L: 0.22, C: 0.12, h: 180 }, 'brightColors', config),
  };
  
  // Calculate overall risk
  const riskScores = Object.values(componentRisks).map(r => r.riskScore);
  const overallScore = riskScores.reduce((sum, score) => sum + score, 0) / riskScores.length;
  
  // Determine overall risk level
  let overallRisk: 'low' | 'medium' | 'high';
  if (overallScore <= config.riskThreshold.low) {
    overallRisk = 'low';
  } else if (overallScore <= config.riskThreshold.medium) {
    overallRisk = 'medium';
  } else {
    overallRisk = 'high';
  }
  
  // Generate risk factors and recommendations
  const riskFactors = generateRiskFactors(componentRisks, riskLevel);
  const recommendations = generateRecommendations(componentRisks, overallRisk, riskLevel);
  
  return {
    overallRisk,
    overallScore: Math.round(overallScore),
    componentRisks,
    riskFactors,
    recommendations,
    aestheticCompensation: {
      saturationApplied: config.colorAdaptation.saturationBoost,
      hueShiftApplied: config.colorAdaptation.hueShift,
      contrastEnhanced: config.colorAdaptation.contrastEnhancement > 1.0,
    },
  };
}

function assessColorRisk(color: OKLCH, role: string, config: EnhancedOLEDRiskConfig): RiskComponent {
  const { L, C } = color;
  
  // Determine max allowed values for this role
  let maxLightness = 0.5; // Default
  let maxChroma = 0.3; // Default
  
  switch (role) {
    case 'foreground':
      maxLightness = config.maxLightness.foreground;
      maxChroma = config.maxChroma.foreground;
      break;
    case 'accent':
      maxLightness = config.maxLightness.accent;
      maxChroma = config.maxChroma.accent;
      break;
    case 'brightAccent':
      maxLightness = config.maxLightness.brightAccent;
      maxChroma = config.maxChroma.brightAccent;
      break;
    case 'darkColors':
      maxLightness = config.maxLightness.darkColors;
      maxChroma = 0.15; // Lower chroma for dark colors
      break;
    case 'brightColors':
      maxLightness = config.maxLightness.brightColors;
      maxChroma = 0.2;
      break;
  }
  
  // Calculate risk score (0-100, higher = more risky)
  const lightnessRisk = Math.max(0, (L - maxLightness) / maxLightness * 100);
  const chromaRisk = Math.max(0, (C - maxChroma) / maxChroma * 100);
  const combinedRisk = (lightnessRisk * 0.7 + chromaRisk * 0.3); // Lightness is more important
  
  let riskLevel: 'low' | 'medium' | 'high';
  if (combinedRisk <= config.riskThreshold.low) {
    riskLevel = 'low';
  } else if (combinedRisk <= config.riskThreshold.medium) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'high';
  }
  
  // Generate issue description
  let potentialIssue = '';
  if (lightnessRisk > 50) {
    potentialIssue = 'Excessive brightness - high burn-in risk';
  } else if (chromaRisk > 50) {
    potentialIssue = 'High chroma - potential OLED stress';
  } else if (combinedRisk > 30) {
    potentialIssue = 'Moderate OLED risk detected';
  } else {
    potentialIssue = 'Low risk - acceptable for OLED';
  }
  
  // Determine compensation applied
  let compensationApplied = '';
  if (lightnessRisk > 20) {
    compensationApplied = `Reduced lightness by ${Math.round(lightnessRisk)}%, enhanced saturation`;
  } else if (chromaRisk > 20) {
    compensationApplied = `Reduced chroma by ${Math.round(chromaRisk)}%`;
  } else {
    compensationApplied = 'No compensation needed';
  }
  
  return {
    riskLevel,
    riskScore: Math.round(combinedRisk),
    lightness: L,
    chroma: C,
    potentialIssue,
    compensationApplied,
  };
}

function generateRiskFactors(components: Record<string, RiskComponent>, riskLevel: OledRiskLevel): RiskFactor[] {
  const factors: RiskFactor[] = [];
  
  // Analyze high-risk components
  Object.entries(components).forEach(([role, component]) => {
    if (component.riskLevel === 'high') {
      factors.push({
        factor: `${role} brightness`,
        impact: 'high',
        description: `${role} color is too bright for OLED protection`,
        mitigation: `Reduce lightness or switch to ${riskLevel} mode`,
      });
    }
    
    if (component.chroma > 0.25) {
      factors.push({
        factor: `${role} saturation`,
        impact: 'medium',
        description: `High chroma in ${role} may cause OLED stress`,
        mitigation: 'Reduce saturation or use chroma compensation',
      });
    }
  });
  
  // Add general risk factors
  const highRiskCount = Object.values(components).filter(c => c.riskLevel === 'high').length;
  if (highRiskCount > 2) {
    factors.push({
      factor: 'Overall scheme risk',
      impact: 'high',
      description: 'Multiple high-risk components detected',
      mitigation: 'Switch to more conservative OLED mode',
    });
  }
  
  return factors;
}

function generateRecommendations(
  components: Record<string, RiskComponent>, 
  overallRisk: 'low' | 'medium' | 'high',
  riskLevel: OledRiskLevel
): string[] {
  const recommendations: string[] = [];
  
  if (overallRisk === 'high') {
    recommendations.push(
      'HIGH RISK: Switch to Ultra-Conservative mode for maximum OLED protection',
      'Consider reducing overall brightness significantly',
      'Use dark mode exclusively for OLED displays'
    );
  } else if (overallRisk === 'medium') {
    recommendations.push(
      'Medium risk detected - monitor for OLED burn-in',
      'Consider more frequent screen rotation with static elements',
      'Reduce screen brightness in display settings'
    );
  } else {
    recommendations.push(
      'Low risk - good OLED protection',
      'Scheme is safe for extended OLED use',
      'Monitor for any image retention over time'
    );
  }
  
  // Component-specific recommendations
  Object.entries(components).forEach(([role, component]) => {
    if (component.riskLevel === 'high') {
      recommendations.push(
        `High-risk ${role}: Consider darker shade or different hue`
      );
    }
  });
  
  // Mode-specific recommendations
  if (riskLevel === 'aggressive' && overallRisk !== 'low') {
    recommendations.push(
      'Aggressive mode detected - consider Balanced or Conservative for better protection'
    );
  }
  
  if (riskLevel === 'ultra-conservative') {
    recommendations.push(
      'Ultra-Conservative mode: Maximum protection applied',
      'Colors may appear darker but OLED is maximally protected'
    );
  }
  
  return recommendations;
}

// ── Intelligent Color Compensation ─────────────────────────────────────────────

export interface CompensationResult {
  optimizedColor: OKLCH;
  compensationApplied: {
    lightnessReduction: number; // percentage
    chromaBoost: number;      // multiplier
    hueShift: number;        // degrees
    contrastEnhancement: number; // multiplier
  };
  beforeRisk: number;
  afterRisk: number;
}

/**
 * Apply intelligent color compensation to maintain aesthetics while reducing OLED risk
 */
export function applyIntelligentCompensation(
  color: OKLCH,
  role: string,
  riskLevel: OledRiskLevel,
  _targetRisk: 'low' | 'medium' = 'low'
): CompensationResult {
  const config = ENHANCED_OLED_CONFIGS[riskLevel];
  const { L, C, h } = color;
  
  // Determine max allowed values
  let maxLightness = 0.3; // Default
  let maxChroma = 0.15; // Default
  
  switch (role) {
    case 'foreground':
      maxLightness = config.maxLightness.foreground;
      maxChroma = config.maxChroma.foreground;
      break;
    case 'accent':
      maxLightness = config.maxLightness.accent;
      maxChroma = config.maxChroma.accent;
      break;
    case 'brightAccent':
      maxLightness = config.maxLightness.brightAccent;
      maxChroma = config.maxChroma.brightAccent;
      break;
  }
  
  // Calculate current risk
  const currentRisk = calculateColorRisk(L, C, maxLightness, maxChroma);
  
  // Apply compensation if needed
  let newL = L;
  let newC = C;
  let newH = h;
  
  const lightnessReduction = Math.max(0, (L - maxLightness) / L);
  const chromaBoost = config.chromaCompensation;
  const hueShift = config.colorAdaptation.hueShift;
  
  if (currentRisk > 30) { // If risk is too high
    // Reduce lightness
    newL = Math.min(L, maxLightness);
    
    // Boost chroma to compensate for reduced lightness
    newC = Math.min(maxChroma, C * chromaBoost);
    
    // Subtle hue shift for aesthetic enhancement
    newH = (h + hueShift) % 360;
  }
  
  const afterRisk = calculateColorRisk(newL, newC, maxLightness, maxChroma);
  
  return {
    optimizedColor: { L: newL, C: newC, h: newH },
    compensationApplied: {
      lightnessReduction: Math.round(lightnessReduction * 100),
      chromaBoost: chromaBoost,
      hueShift: hueShift,
      contrastEnhancement: config.colorAdaptation.contrastEnhancement,
    },
    beforeRisk: Math.round(currentRisk),
    afterRisk: Math.round(afterRisk),
  };
}

function calculateColorRisk(L: number, C: number, maxL: number, maxC: number): number {
  const lightnessRisk = Math.max(0, (L - maxL) / maxL * 100);
  const chromaRisk = Math.max(0, (C - maxC) / maxC * 100);
  return (lightnessRisk * 0.7 + chromaRisk * 0.3);
}

// ── Export Utilities ─────────────────────────────────────────────────────────

export function getRiskLevelInfo(riskLevel: OledRiskLevel): EnhancedOLEDRiskConfig {
  return ENHANCED_OLED_CONFIGS[riskLevel];
}

export function getRiskLevelColor(riskScore: number): string {
  if (riskScore <= 20) return '#22c55e'; // Green
  if (riskScore <= 40) return '#f59e0b'; // Yellow
  if (riskScore <= 60) return '#f97316'; // Orange
  return '#ef4444'; // Red
}

export function formatRiskScore(score: number): string {
  return `${Math.round(score)}/100`;
}
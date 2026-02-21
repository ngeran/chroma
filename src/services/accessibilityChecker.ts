/**
 * Enhanced Accessibility Features
 * Comprehensive accessibility checking including color blindness simulation,
 * contextual contrast requirements, and accessibility scoring.
 */

// Import utility functions directly (they're not exported)
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

// ── Color Vision Types ─────────────────────────────────────────────────────────

export type ColorVisionType = 'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';

export interface ColorVisionMatrix {
  r: [number, number, number];
  g: [number, number, number];
  b: [number, number, number];
}

// Color vision deficiency simulation matrices
const COLOR_VISION_MATRICES: Record<ColorVisionType, ColorVisionMatrix> = {
  // Normal vision
  normal: {
    r: [1.0, 0.0, 0.0],
    g: [0.0, 1.0, 0.0],
    b: [0.0, 0.0, 1.0],
  },
  // Protanopia (red-blind)
  protanopia: {
    r: [0.567, 0.433, 0.0],
    g: [0.558, 0.442, 0.0],
    b: [0.242, 0.758, 0.0],
  },
  // Deuteranopia (green-blind)
  deuteranopia: {
    r: [0.625, 0.375, 0.0],
    g: [0.7, 0.3, 0.0],
    b: [0.3, 0.7, 0.0],
  },
  // Tritanopia (blue-blind)
  tritanopia: {
    r: [0.95, 0.05, 0.0],
    g: [0.433, 0.567, 0.0],
    b: [0.475, 0.525, 0.0],
  },
  // Achromatopsia (complete color blindness)
  achromatopsia: {
    r: [0.299, 0.587, 0.114],
    g: [0.299, 0.587, 0.114],
    b: [0.299, 0.587, 0.114],
  },
};

// ── Color Blindness Simulation ──────────────────────────────────────────────────

/**
 * Simulate how a color appears to someone with color vision deficiency
 */
export function simulateColorBlindness(hex: string, visionType: ColorVisionType): string {
  const rgb = hexToRgb(hex);
  const matrix = COLOR_VISION_MATRICES[visionType];
  
  // Apply transformation matrix
  const r = Math.round(
    Math.max(0, Math.min(255, 
      rgb.r * matrix.r[0] + rgb.g * matrix.r[1] + rgb.b * matrix.r[2]
    ))
  );
  const g = Math.round(
    Math.max(0, Math.min(255, 
      rgb.r * matrix.g[0] + rgb.g * matrix.g[1] + rgb.b * matrix.g[2]
    ))
  );
  const b = Math.round(
    Math.max(0, Math.min(255, 
      rgb.r * matrix.b[0] + rgb.g * matrix.b[1] + rgb.b * matrix.b[2]
    ))
  );
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// ── Enhanced Accessibility Assessment ────────────────────────────────────────────

export interface AccessibilityScore {
  overall: number; // 0-100
  normalVision: {
    contrast: number;
    wcagCompliance: 'AAA' | 'AA' | 'fail';
    colorBlindSafe: boolean;
  };
  colorBlindness: {
    protanopia: AccessibilityResult;
    deuteranopia: AccessibilityResult;
    tritanopia: AccessibilityResult;
    achromatopsia: AccessibilityResult;
  };
  contextual: {
    text: AccessibilityResult;
    interface: AccessibilityResult;
    data: AccessibilityResult;
  };
  recommendations: string[];
}

export interface AccessibilityResult {
  contrast: number;
  compliance: 'AAA' | 'AA' | 'fail';
  score: number; // 0-100
  issues: string[];
}

/**
 * Comprehensive accessibility assessment for a color scheme
 */
export function assessAccessibility(
  foreground: string,
  background: string,
  context: 'text' | 'interface' | 'data' = 'text'
): AccessibilityScore {
  // Normal vision assessment
  const normalContrast = calculateContrastRatio(foreground, background);
  const normalResult = createAccessibilityResult(normalContrast, context);
  
  // Color blindness assessments
  const colorBlindness = {
    protanopia: assessColorBlindContrast(foreground, background, 'protanopia', context),
    deuteranopia: assessColorBlindContrast(foreground, background, 'deuteranopia', context),
    tritanopia: assessColorBlindContrast(foreground, background, 'tritanopia', context),
    achromatopsia: assessColorBlindContrast(foreground, background, 'achromatopsia', context),
  };
  
  // Contextual assessments
  const contextual = {
    text: assessContextualRequirements(foreground, background, 'text'),
    interface: assessContextualRequirements(foreground, background, 'interface'),
    data: assessContextualRequirements(foreground, background, 'data'),
  };
  
  // Calculate overall score
  const scores = [
    normalResult.score,
    ...Object.values(colorBlindness).map(cb => cb.score),
    contextual.text.score,
    contextual.interface.score,
    contextual.data.score,
  ];
  
  const overall = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  
  // Generate recommendations
  const recommendations = generateAccessibilityRecommendations(
    normalResult,
    colorBlindness,
    contextual
  );
  
  return {
    overall,
    normalVision: {
      contrast: normalContrast,
      wcagCompliance: normalResult.compliance,
      colorBlindSafe: Object.values(colorBlindness).every(cb => cb.compliance !== 'fail'),
    },
    colorBlindness,
    contextual,
    recommendations,
  };
}

function assessColorBlindContrast(
  foreground: string,
  background: string,
  visionType: ColorVisionType,
  context: 'text' | 'interface' | 'data'
): AccessibilityResult {
  const cbForeground = simulateColorBlindness(foreground, visionType);
  const cbBackground = simulateColorBlindness(background, visionType);
  const contrast = calculateContrastRatio(cbForeground, cbBackground);
  
  return createAccessibilityResult(contrast, context);
}

function assessContextualRequirements(
  foreground: string,
  background: string,
  context: 'text' | 'interface' | 'data'
): AccessibilityResult {
  const contrast = calculateContrastRatio(foreground, background);
  let requiredRatio = 4.5; // Default
  
  switch (context) {
    case 'text':
      requiredRatio = 4.5; // WCAG AA for normal text
      break;
    case 'interface':
      requiredRatio = 3.0; // WCAG AA for large text and UI components
      break;
    case 'data':
      requiredRatio = 3.0; // Charts and data visualization
      break;
  }
  
  return createAccessibilityResult(contrast, context, requiredRatio);
}

function createAccessibilityResult(
  contrast: number,
  context: 'text' | 'interface' | 'data',
  requiredRatio?: number
): AccessibilityResult {
  if (!requiredRatio) {
    switch (context) {
      case 'text':
        requiredRatio = 4.5;
        break;
      case 'interface':
      case 'data':
        requiredRatio = 3.0;
        break;
    }
  }
  
  const aaaThreshold = requiredRatio * 1.5; // AAA is 1.5x AA requirements
  
  let compliance: 'AAA' | 'AA' | 'fail';
  if (contrast >= aaaThreshold) {
    compliance = 'AAA';
  } else if (contrast >= requiredRatio) {
    compliance = 'AA';
  } else {
    compliance = 'fail';
  }
  
  const score = Math.min(100, Math.round((contrast / requiredRatio) * 100));
  
  const issues: string[] = [];
  if (compliance === 'fail') {
    issues.push(`Contrast ratio ${contrast.toFixed(1)}:1 is below minimum requirement of ${requiredRatio}:1`);
  }
  
  return {
    contrast,
    compliance,
    score,
    issues,
  };
}

function generateAccessibilityRecommendations(
  normal: AccessibilityResult,
  colorBlindness: Record<string, AccessibilityResult>,
  contextual: Record<string, AccessibilityResult>
): string[] {
  const recommendations: string[] = [];
  
  // Check for color blindness issues
  const colorBlindFailures = Object.entries(colorBlindness)
    .filter(([_, result]) => result.compliance === 'fail')
    .map(([type, _]) => type);
  
  if (colorBlindFailures.length > 0) {
    recommendations.push(
      `Poor contrast for users with ${colorBlindFailures.join(', ')} color vision`,
      'Consider using higher contrast colors or additional visual cues'
    );
  }
  
  // Check for contextual issues
  const contextualFailures = Object.entries(contextual)
    .filter(([_, result]) => result.compliance === 'fail')
    .map(([context, _]) => context);
  
  if (contextualFailures.length > 0) {
    recommendations.push(
      `Poor contrast for ${contextualFailures.join(', ')} elements`,
      'Increase contrast or use alternative visual indicators'
    );
  }
  
  // General recommendations
  if (normal.score < 80) {
    recommendations.push('Consider increasing overall contrast for better readability');
  }
  
  if (Object.values(colorBlindness).some(cb => cb.score < normal.score * 0.8)) {
    recommendations.push(
      'Colors may appear differently to color blind users',
      'Test with color blindness simulators and ensure usability'
    );
  }
  
  return recommendations;
}

// ── Accessibility Utilities ───────────────────────────────────────────────────

/**
 * Check if two colors provide sufficient contrast for a given use case
 */
export function isAccessible(
  foreground: string,
  background: string,
  context: 'text' | 'interface' | 'data' = 'text',
  minimumCompliance: 'AA' | 'AAA' = 'AA'
): boolean {
  const assessment = assessAccessibility(foreground, background, context);
  const requiredCompliance = minimumCompliance === 'AAA' ? 'AAA' : 'AA';
  
  return assessment.normalVision.wcagCompliance === requiredCompliance &&
         Object.values(assessment.colorBlindness).every(cb => cb.compliance !== 'fail');
}

/**
 * Generate accessible color variants by adjusting lightness or saturation
 */
export function generateAccessibleVariant(
  baseColor: string,
  backgroundColor: string,
  targetContext: 'text' | 'interface' | 'data' = 'text',
  targetCompliance: 'AA' | 'AAA' = 'AA'
): string {
  const rgb = hexToRgb(baseColor);
  const bgLuminance = getLuminance(
    hexToRgb(backgroundColor).r,
    hexToRgb(backgroundColor).g,
    hexToRgb(backgroundColor).b
  );
  
  let currentColor = baseColor;
  let currentLuminance = getLuminance(rgb.r, rgb.g, rgb.b);
  let attempts = 0;
  const maxAttempts = 20;
  
  // Determine if we need to make it lighter or darker
  const currentContrast = calculateContrastRatio(currentColor, backgroundColor);
  const requiredRatio = targetCompliance === 'AAA' ? 
    (targetContext === 'text' ? 7 : 4.5) : 
    (targetContext === 'text' ? 4.5 : 3);
  
  let adjustmentDirection = currentContrast < requiredRatio ? 
    (currentLuminance > bgLuminance ? 1 : -1) : 0;
  
  while (attempts < maxAttempts) {
    const contrast = calculateContrastRatio(currentColor, backgroundColor);
    
    if (contrast >= requiredRatio) {
      return currentColor;
    }
    
    // Adjust lightness
    const newRgb = {
      r: Math.max(0, Math.min(255, rgb.r + (adjustmentDirection * 10))),
      g: Math.max(0, Math.min(255, rgb.g + (adjustmentDirection * 10))),
      b: Math.max(0, Math.min(255, rgb.b + (adjustmentDirection * 10))),
    };
    
    currentColor = `#${newRgb.r.toString(16).padStart(2, '0')}${newRgb.g.toString(16).padStart(2, '0')}${newRgb.b.toString(16).padStart(2, '0')}`;
    attempts++;
    
    // If we've gone too far, try the other direction
    if (currentColor === '#ffffff' || currentColor === '#000000') {
      adjustmentDirection *= -1;
    }
  }
  
  // Return the best attempt if we couldn't reach the target
  return currentColor;
}

// ── Bulk Accessibility Assessment ───────────────────────────────────────────────

export interface SchemeAccessibilityReport {
  overallScore: number;
  colorPairs: {
    [pairName: string]: AccessibilityScore;
  };
  criticalIssues: string[];
  recommendations: string[];
}

/**
 * Assess accessibility of an entire color scheme
 */
export function assessSchemeAccessibility(
  _colorMap: { [key: string]: string },
  criticalPairs: Array<{ foreground: string; background: string; name: string; context: 'text' | 'interface' | 'data' }>
): SchemeAccessibilityReport {
  const colorPairs: { [pairName: string]: AccessibilityScore } = {};
  const allScores: number[] = [];
  const criticalIssues: string[] = [];
  const recommendations: string[] = [];
  
  for (const pair of criticalPairs) {
    const assessment = assessAccessibility(pair.foreground, pair.background, pair.context);
    colorPairs[pair.name] = assessment;
    allScores.push(assessment.overall);
    
    if (assessment.normalVision.wcagCompliance === 'fail') {
      criticalIssues.push(`${pair.name}: WCAG compliance failed`);
    }
    
    if (!assessment.normalVision.colorBlindSafe) {
      criticalIssues.push(`${pair.name}: Poor color blindness support`);
    }
  }
  
  // Aggregate recommendations
  Object.values(colorPairs).forEach(assessment => {
    assessment.recommendations.forEach(rec => {
      if (!recommendations.includes(rec)) {
        recommendations.push(rec);
      }
    });
  });
  
  const overallScore = allScores.length > 0 ? 
    Math.round(allScores.reduce((sum, score) => sum + score, 0) / allScores.length) : 0;
  
  return {
    overallScore,
    colorPairs,
    criticalIssues,
    recommendations,
  };
}
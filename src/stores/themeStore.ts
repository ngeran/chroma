import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ColorScheme, AnalysisResult, SchemeStyle, OledRiskLevel } from '../types/theme';
import { DEFAULT_SCHEME } from '../constants/defaults';
import { generateColorScheme, generateRandomScheme } from '../services/colorEngine';
import { analyzeColorScheme } from '../services/colorAnalyzer';

interface ThemeStore {
  // State
  scheme: ColorScheme;
  analysis: AnalysisResult | null;
  savedSchemes: ColorScheme[];
  darkMode: boolean;
  isGenerating: boolean;
  activeTab: 'generator' | 'analysis' | 'export';

  // Generator params
  baseHue: number;
  style: SchemeStyle;
  seed: string;
  schemeName: string;
  oledRiskLevel: OledRiskLevel;

  // Actions
  setBaseHue: (hue: number) => void;
  setStyle: (style: SchemeStyle) => void;
  setSeed: (seed: string) => void;
  setSchemeName: (name: string) => void;
  setOledRiskLevel: (level: OledRiskLevel) => void;
  generate: () => void;
  generateRandom: () => void;
  toggleDarkMode: () => void;
  saveScheme: () => void;
  loadScheme: (scheme: ColorScheme) => void;
  deleteScheme: (name: string) => void;
  setActiveTab: (tab: 'generator' | 'analysis' | 'export') => void;
  runAnalysis: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      scheme: DEFAULT_SCHEME,
      analysis: analyzeColorScheme(DEFAULT_SCHEME),
      savedSchemes: [DEFAULT_SCHEME],
      darkMode: true,
      isGenerating: false,
      activeTab: 'generator',
      baseHue: 180,
      style: 'monochrome',
      seed: 'singularity',
      schemeName: 'Singularity',
      oledRiskLevel: 'balanced',

      setBaseHue: (hue) => set({ baseHue: hue }),
      setStyle:   (style) => set({ style }),
      setSeed:    (seed) => set({ seed }),
      setSchemeName: (schemeName) => set({ schemeName }),
      setOledRiskLevel: (oledRiskLevel) => set({ oledRiskLevel }),

      generate: () => {
        const { baseHue, style, seed, schemeName, oledRiskLevel } = get();
        set({ isGenerating: true });
        setTimeout(() => {
          const scheme = generateColorScheme(baseHue, style, seed, schemeName || 'MyTheme', oledRiskLevel);
          const analysis = analyzeColorScheme(scheme);
          set({ scheme, analysis, isGenerating: false });
        }, 400); // artificial delay for UX
      },

      generateRandom: () => {
        set({ isGenerating: true });
        setTimeout(() => {
          const scheme = generateRandomScheme();
          const analysis = analyzeColorScheme(scheme);
          set({
            scheme, analysis, isGenerating: false,
            baseHue: scheme.hue, style: scheme.style,
            seed: scheme.seed, schemeName: scheme.name,
            oledRiskLevel: 'balanced', // reset to balanced for random
          });
        }, 400);
      },

      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),

      saveScheme: () => {
        const { scheme, savedSchemes } = get();
        const exists = savedSchemes.find(s => s.name === scheme.name);
        if (!exists) set({ savedSchemes: [...savedSchemes, scheme] });
      },

      loadScheme: (scheme) => {
        const analysis = analyzeColorScheme(scheme);
        set({ scheme, analysis, baseHue: scheme.hue, style: scheme.style, seed: scheme.seed, schemeName: scheme.name });
      },

      deleteScheme: (name) => set((s) => ({
        savedSchemes: s.savedSchemes.filter(sc => sc.name !== name),
      })),

      setActiveTab: (activeTab) => set({ activeTab }),

      runAnalysis: () => {
        const { scheme } = get();
        const analysis = analyzeColorScheme(scheme);
        set({ analysis });
      },
    }),
    { name: 'chromavoid-store', partialize: (s) => ({ savedSchemes: s.savedSchemes, darkMode: s.darkMode }) }
  )
);

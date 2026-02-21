import type { ColorPalette } from '@/types/theme';

// Predefined beautiful palettes that will be OLED-optimized
export const PREDEFINED_PALETTES: Record<string, ColorPalette> = {
  nord: {
    name: 'Nord',
    description: 'An arctic, north-bluish color palette',
    baseHue: 220,
    colors: {
      primary: '#5E81AC',      // Polar Night
      secondary: '#81A1C1',    // Snow Storm
      accent: '#88C0D0',       // Ice
      surface: '#2E3440',      // Polar Night dark
      background: '#3B4252',   // Polar Night lighter
      foreground: '#D8DEE9',   // Snow Storm light
      dim: '#4C566A',          // Polar Night lightest
      error: '#BF616A',        // Aurora red
      warning: '#D08770',      // Aurora orange
      success: '#A3BE8C',      // Aurora green
      info: '#81A1C1',         // Aurora blue
      layer: '#434C5E',        // Border color
    },
    harmony: 'analogous',
    contrast: 'medium',
    mood: 'calm'
  },
  
  tokyo_night: {
    name: 'Tokyo Night',
    description: 'A dark theme inspired by Tokyo at night',
    baseHue: 240,
    colors: {
      primary: '#7AA2F7',      // Blue
      secondary: '#9ABDF5',    // Light blue
      accent: '#7DCFFF',       // Cyan
      surface: '#1A1B26',      // Dark background
      background: '#16161E',   // Darker background
      foreground: '#C0CAF5',   // Light text
      dim: '#565F89',          // Dimmed text
      error: '#F7768E',        // Red
      warning: '#FF9E64',      // Orange
      success: '#9ECE6A',      // Green
      info: '#7AA2F7',         // Blue
      layer: '#292E42',        // Border/separator
    },
    harmony: 'analogous',
    contrast: 'high',
    mood: 'modern'
  },

  gruvbox: {
    name: 'Gruvbox',
    description: 'Retro groove color scheme',
    baseHue: 40,
    colors: {
      primary: '#83A598',      // Neutral blue
      secondary: '#8EC07C',    // Neutral green
      accent: '#FABD2F',       // Yellow
      surface: '#282828',      // Hard dark background
      background: '#3C3836',   // Dark background
      foreground: '#EBDBB2',   // Light foreground
      dim: '#665C54',          // Dimmed foreground
      error: '#FB4934',        // Bright red
      warning: '#FE8019',      // Bright orange
      success: '#B8BB26',      // Bright green
      info: '#83A598',         // Blue
      layer: '#504945',        // Gray background
    },
    harmony: 'analogous',
    contrast: 'medium',
    mood: 'retro'
  },

  catppuccin: {
    name: 'Catppuccin',
    description: 'Soothing pastel theme for the high-spirited',
    baseHue: 320,
    colors: {
      primary: '#F5C2E7',      // Pink
      secondary: '#FAB387',    // Peach
      accent: '#F9E2AF',      // Yellow
      surface: '#1E1E2E',      // Base
      background: '#181825',   // Mantle
      foreground: '#CDD6F4',   // Text
      dim: '#6C7086',          // Overlay 0
      error: '#F38BA8',        // Red
      warning: '#FAB387',      // Peach
      success: '#A6E3A1',      // Green
      info: '#74C7EC',         // Blue
      layer: '#313244',        // Surface 0
    },
    harmony: 'analogous',
    contrast: 'medium',
    mood: 'soft'
  },

  monokai: {
    name: 'Monokai',
    description: 'Professional color scheme',
    baseHue: 280,
    colors: {
      primary: '#AE81FF',      // Purple
      secondary: '#66D9EF',    // Cyan
      accent: '#FD971F',       // Orange
      surface: '#272822',      // Background
      background: '#1E1F1C',   // Darker background
      foreground: '#F8F8F2',   // Foreground
      dim: '#75715E',          // Comment
      error: '#F92672',        // Red
      warning: '#FD971F',      // Orange
      success: '#A6E22A',      // Green
      info: '#66D9EF',         // Cyan
      layer: '#49483E',        // Line highlight
    },
    harmony: 'complementary',
    contrast: 'high',
    mood: 'professional'
  },

  dracula: {
    name: 'Dracula',
    description: 'Dark theme for a great cause',
    baseHue: 290,
    colors: {
      primary: '#BD93F9',      // Purple
      secondary: '#8BE9FD',    // Cyan
      accent: '#FFB86C',       // Orange
      surface: '#282A36',      // Background
      background: '#1E1F29',   // Current line
      foreground: '#F8F8F2',   // Foreground
      dim: '#6272A4',          // Comment
      error: '#FF5555',        // Red
      warning: '#FFB86C',      // Orange
      success: '#50FA7B',      // Green
      info: '#8BE9FD',         // Cyan
      layer: '#44475A',        // Selection
    },
    harmony: 'complementary',
    contrast: 'high',
    mood: 'vibrant'
  }
};

// Palette categories for organization
export const PALETTE_CATEGORIES = {
  dark: ['nord', 'tokyo_night', 'gruvbox', 'catppuccin', 'monokai', 'dracula'],
  popular: ['tokyo_night', 'nord', 'catppuccin', 'gruvbox'],
  retro: ['gruvbox'],
  modern: ['tokyo_night', 'catppuccin', 'monokai'],
  vibrant: ['dracula', 'monokai'],
  soft: ['catppuccin', 'nord']
};

// Palette metadata for UI display
export const PALETTE_METADATA = [
  {
    id: 'nord',
    name: 'Nord',
    category: 'dark',
    description: 'Arctic, north-bluish palette with calm aesthetics',
    author: 'Arctic Ice Studio',
    year: 2016
  },
  {
    id: 'tokyo_night',
    name: 'Tokyo Night',
    category: 'dark',
    description: 'Modern theme inspired by Tokyo neon lights',
    author: 'Enkia',
    year: 2021
  },
  {
    id: 'gruvbox',
    category: 'retro',
    description: 'Retro groove color scheme with warm tones',
    author: 'Pavel Pertsev',
    year: 2012
  },
  {
    id: 'catppuccin',
    name: 'Catppuccin',
    category: 'modern',
    description: 'Soothing pastel theme with soft colors',
    author: 'Catppuccin Org',
    year: 2021
  },
  {
    id: 'monokai',
    name: 'Monokai',
    category: 'modern',
    description: 'Professional color scheme for developers',
    author: 'Wimer Hazenberg',
    year: 2011
  },
  {
    id: 'dracula',
    name: 'Dracula',
    category: 'vibrant',
    description: 'Dark theme supporting many editors and terminals',
    author: 'Zeno Rocha',
    year: 2013
  }
];

// Helper functions
export function getPaletteById(id: string): ColorPalette | undefined {
  return PREDEFINED_PALETTES[id];
}

export function getPalettesByCategory(category: string): ColorPalette[] {
  const ids = PALETTE_CATEGORIES[category as keyof typeof PALETTE_CATEGORIES] || [];
  return ids.map(id => PREDEFINED_PALETTES[id]).filter(Boolean);
}

export function getAllPalettes(): ColorPalette[] {
  return Object.values(PREDEFINED_PALETTES);
}

export function getRandomPalette(): ColorPalette {
  const palettes = getAllPalettes();
  return palettes[Math.floor(Math.random() * palettes.length)];
}
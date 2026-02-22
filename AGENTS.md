# Agent Guidelines for Chromavoid

## Build & Development Commands

```bash
npm run dev          # Development server with hot reload (localhost:5173)
npm run build        # Production build (includes TypeScript check)
npm run preview      # Preview production build locally
npx tsc --noEmit     # TypeScript type check without emitting files
# No tests configured yet - consider: npx vitest run src/path/to/test.test.ts
```

## Project Overview

React + TypeScript application for generating OLED-optimized terminal color schemes. Uses Vite, Tailwind CSS, Zustand state management, and Framer Motion. Core features: perceptual color generation (OKLAB/OKLCH), accessibility analysis, theme export.

## Code Style Guidelines

### TypeScript Configuration
- Strict mode with `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- Target: ES2020, module: ESNext, JSX: react-jsx
- Path alias `@/*` maps to `./src/*`

### Import Organization
Group imports in this order, separated by blank lines:
1. React and third-party libraries
2. Internal stores and services
3. Internal components
4. Types (use `type` keyword for type-only imports)
5. Constants

```typescript
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, Zap } from 'lucide-react';

import { useThemeStore } from '../stores/themeStore';
import { generateColorScheme } from '../services/colorEngine';
import { ColorSwatch } from '../components/ui/ColorSwatch';
import type { ColorScheme, SchemeStyle } from '../types/theme';
import { SCHEME_STYLES } from '../constants/defaults';
```

### Component Structure
- Named exports: `export function ComponentName()`
- Hooks at the top, then render logic

```typescript
export function GeneratorPage() {
  const { scheme, baseHue, setBaseHue } = useThemeStore();
  const [localState, setLocalState] = useState('initial');
  return <div className="space-y-6">{/* content */}</div>;
}
```

### State Management (Zustand)
- Define interface with State section first, then Actions section
- Use `persist` middleware for localStorage persistence
- Keep actions simple; complex logic belongs in services

```typescript
interface ThemeStore {
  // State
  scheme: ColorScheme;
  isGenerating: boolean;
  // Actions
  setBaseHue: (hue: number) => void;
  generate: () => void;
}
```

### Styling (Tailwind CSS)
- Use CSS custom properties via Tailwind theme extension
- Primary palette: `void`, `surface`, `base`, `layer`, `dim`, `dim-brt`, `fg`, `cyan`, `accent`
- Semantic colors: `success`, `warning`, `error` (with `-dim` variants)
- Dark mode via `.dark` class on `<html>` element

```typescript
<div className="border border-layer rounded-xl p-5 bg-surface">
  <h2 className="font-mono text-xs tracking-[0.2em] text-cyan uppercase">// Title</h2>
</div>
```

### Typography
- Fonts: `font-sans` (DM Sans), `font-mono` (Space Mono), `font-display` (Orbitron)
- Labels: `font-mono text-[10px] text-dim-brt uppercase tracking-widest`
- Section headers: `font-mono text-xs tracking-[0.2em] text-cyan uppercase`

### File Organization
```
src/
├── components/
│   ├── layout/          # Header, Footer
│   └── ui/              # Logo, ColorSwatch, ThemeToggle, PaletteSelector
├── pages/               # GeneratorPage, AnalysisPage, ExportPage
├── services/            # colorEngine, colorAnalyzer, themeExporters, perceptualColor
├── stores/              # themeStore (Zustand)
├── types/               # theme.ts (ColorScheme, AnalysisResult, etc.)
├── constants/           # defaults.ts (DEFAULT_SCHEME, SCHEME_STYLES)
├── main.tsx             # Entry point
├── App.tsx              # Root component
└── index.css            # Tailwind base + CSS custom properties
```

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `GeneratorPage`, `ColorSwatch` |
| Services | camelCase.ts | `colorEngine.ts` |
| Stores | camelCase + Store | `themeStore.ts` |
| Types/Interfaces | PascalCase | `ColorScheme` |
| Constants | UPPER_SNAKE_CASE | `DEFAULT_SCHEME` |
| CSS custom properties | kebab-case | `--accent-dim` |
| Local state | camelCase with `set` prefix | `[baseHue, setBaseHue]` |

### Animation (Framer Motion)
- Use `AnimatePresence` for page transitions with `mode="wait"`
- Page transitions: `initial={{ opacity: 0, y: 12 }}`, `animate={{ opacity: 1, y: 0 }}`
- Interactive elements: `whileTap={{ scale: 0.97 }}`
- Layout animations: `layoutId` for shared elements

### Error Handling
- Leverage TypeScript strict mode to catch errors at compile time
- UI components handle loading states with `isGenerating` pattern
- User feedback via disabled states and status text

### Performance Guidelines
- Use Vite's automatic code splitting
- Memoize expensive calculations with `useMemo` when needed
- Keep store subscriptions minimal (destructure only needed values)
- Artificial delays for UX (e.g., 400ms generation) go in store actions

### Git Conventions
- Commit messages: present tense ("Add feature" not "Added feature")
- No secrets in commits
- Run `npx tsc --noEmit` before committing

## Key Domain Concepts

### Color Scheme Structure
- `core`: UI colors (background, foreground, accent, cursor, selection)
- `terminal`: ANSI 16-color palette (color0-color15)
- Background is always `#000000` for OLED optimization

### OLED Risk Levels
`ultra-conservative` → `conservative` → `balanced` → `aggressive`

### Scheme Styles
`monochrome`, `complementary`, `triadic`, `analogous`, `split-complementary`, `tetradic`, `spectral`

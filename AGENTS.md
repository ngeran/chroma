# Agent Guidelines for Chromavoid

## Build & Development Commands

### Core Commands
```bash
# Development server with hot reload
npm run dev

# Build for production (includes TypeScript check)
npm run build

# Preview production build
npm run preview
```

### Linting & Type Checking
```bash
# TypeScript type checking (integrated into build)
npx tsc --noEmit

# No linting configured yet - add ESLint/Prettier if needed
```

### Testing
```bash
# No tests configured yet - add test framework when needed
# Consider adding Vitest for unit/integration tests
```

## Project Overview
This is a React + TypeScript application for generating and analyzing color schemes, particularly focused on OLED-optimized themes. The project uses Vite for building, Tailwind CSS for styling, and Zustand for state management.

## Code Style Guidelines

### TypeScript & Imports
- **Strict TypeScript**: Project uses strict mode with noUnusedLocals, noUnusedParameters
- **Import organization**: Group imports in this order:
  1. React and third-party libraries
  2. Relative imports (../, ./)
  3. Type imports (if separate)
- **Type imports**: Use `type` keyword for type-only imports when possible
- **Path aliases**: Use `@/` alias for src directory imports (configured in tsconfig.json)

```typescript
// ✅ Good import organization
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useThemeStore } from '@/stores/themeStore';
import type { ColorScheme } from '@/types/theme';
import { Header } from './Header';
```

### Component Structure
- **Functional components**: Use function declarations or const arrow functions
- **TypeScript**: Always type component props and return types
- **Naming**: Use PascalCase for component names, camelCase for variables and functions
- **File naming**: Use PascalCase for component files (Header.tsx), camelCase for utilities

```typescript
// ✅ Component example
export function Header(): JSX.Element {
  const { activeTab, setActiveTab } = useThemeStore();
  
  return (
    <header className="sticky top-0 z-50 bg-void/90 backdrop-blur-md border-b border-layer">
      {/* content */}
    </header>
  );
}
```

### State Management (Zustand)
- **Store structure**: Define clear interface with state and actions sections
- **Type safety**: Full TypeScript typing for store state and actions
- **Persistence**: Use Zustand's persist middleware for localStorage
- **Actions**: Keep actions simple and focused

```typescript
interface ThemeStore {
  // State
  scheme: ColorScheme;
  darkMode: boolean;
  
  // Actions
  setBaseHue: (hue: number) => void;
  toggleDarkMode: () => void;
}
```

### Styling (Tailwind CSS)
- **Custom colors**: Use CSS custom properties defined in index.css
- **Color palette**: Stick to the theme colors (void, surface, base, layer, dim, fg, cyan, accent, etc.)
- **Dark mode**: Use `dark:` variants and the `dark` class
- **Responsive**: Use Tailwind's responsive utilities (md:, lg:, etc.)
- **Animation**: Use Framer Motion for UI animations

```typescript
// ✅ Using theme colors
<div className="bg-void text-fg border border-layer">
  <h2 className="text-cyan">Accent Heading</h2>
</div>
```

### Error Handling
- **Type safety**: Rely on TypeScript's strict mode to prevent runtime errors
- **Validation**: Add runtime validation for external data/API responses
- **Error boundaries**: Consider adding React Error Boundaries for component error handling
- **User feedback**: Show loading states and error messages for async operations

### File Organization
```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout components (Header, Footer)
│   └── ui/             # Basic UI components (Logo, ThemeToggle)
├── pages/              # Page-level components
├── services/           # Business logic and API calls
├── stores/             # Zustand state stores
├── types/              # TypeScript type definitions
├── constants/          # Constants and default values
├── main.tsx            # App entry point
├── App.tsx             # Main app component
└── index.css           # Global styles and Tailwind base
```

### Naming Conventions
- **Components**: PascalCase (Header, ThemeToggle)
- **Variables/Functions**: camelCase (baseHue, setDarkMode)
- **Constants**: UPPER_SNAKE_CASE (DEFAULT_SCHEME, NAV_ITEMS)
- **Types/Interfaces**: PascalCase (ColorScheme, AnalysisResult)
- **CSS classes**: kebab-case (bg-void, text-fg)

### Performance Considerations
- **Code splitting**: Vite automatically handles code splitting
- **Lazy loading**: Consider lazy loading heavy components with React.lazy()
- **Memoization**: Use React.memo() and useMemo() for expensive operations
- **Bundle size**: Monitor bundle size and avoid large dependencies

### Git & Collaboration
- **Commit messages**: Use clear, descriptive commit messages
- **Branching**: Follow git-flow or similar branching strategy
- **Code reviews**: All changes should be reviewed before merging
- **Testing**: Add tests for new features and bug fixes

### Development Notes
- **Hot reload**: Development server supports hot reload for quick iteration
- **Theme switching**: App supports light/dark mode switching
- **Color generation**: Core feature is generating and analyzing color schemes
- **OLED optimization**: Focus on black backgrounds and high contrast for OLED displays
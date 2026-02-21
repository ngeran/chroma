import { Logo } from '../ui/Logo';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useThemeStore } from '../../stores/themeStore';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { id: 'generator', label: 'Generator' },
  { id: 'analysis',  label: 'Analysis'  },
  { id: 'export',    label: 'Export'    },
] as const;

export function Header() {
  const { activeTab, setActiveTab } = useThemeStore();

  return (
    <header className="sticky top-0 z-50 bg-void/90 backdrop-blur-md border-b border-layer">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo — left */}
        <Logo />

        {/* Nav — center */}
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map(({ id, label }) => (
            <motion.button
              key={id}
              onClick={() => setActiveTab(id as 'generator' | 'analysis' | 'export')}
              className={`relative px-5 py-2 font-mono text-xs tracking-[0.15em] uppercase transition-colors ${
                activeTab === id ? 'text-cyan' : 'text-dim-brt hover:text-fg'
              }`}
              whileTap={{ scale: 0.97 }}
            >
              {label}
              {activeTab === id && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute bottom-0 left-0 right-0 h-px bg-cyan"
                />
              )}
            </motion.button>
          ))}
        </nav>

        {/* Theme toggle — right */}
        <ThemeToggle />
      </div>
    </header>
  );
}

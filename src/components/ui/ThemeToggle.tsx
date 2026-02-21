import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useThemeStore } from '../../stores/themeStore';

export function ThemeToggle() {
  const { darkMode, toggleDarkMode } = useThemeStore();

  return (
    <motion.button
      onClick={toggleDarkMode}
      className="relative w-14 h-7 rounded-full border border-accent-dim bg-layer flex items-center px-1 cursor-pointer"
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="w-5 h-5 rounded-full bg-cyan flex items-center justify-center"
        animate={{ x: darkMode ? 0 : 28 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        {darkMode
          ? <Moon size={10} className="text-void" />
          : <Sun  size={10} className="text-void" />
        }
      </motion.div>
    </motion.button>
  );
}

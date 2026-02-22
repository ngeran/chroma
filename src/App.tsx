import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { GeneratorPage } from './pages/GeneratorPage';
import { ReaderPage } from './pages/ReaderPage';
import { AnalysisPage }  from './pages/AnalysisPage';
import { ExportPage }    from './pages/ExportPage';
import { useThemeStore } from './stores/themeStore';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';

export default function App() {
  const { activeTab, darkMode } = useThemeStore();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const pages: Record<string, React.ReactNode> = {
    generator: <GeneratorPage />,
    reader:    <ReaderPage    />,
    analysis:  <AnalysisPage  />,
    export:    <ExportPage    />,
  };

  return (
    <div className="flex flex-col min-h-screen bg-void text-fg font-sans">
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {pages[activeTab]}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

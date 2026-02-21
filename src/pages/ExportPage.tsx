import { useThemeStore } from '../stores/themeStore';
import { ExportFormat, exporters, generateExportFile, downloadExportFile, downloadZipExport } from '../services/themeExporters';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Copy, Check, ChevronDown, Archive } from 'lucide-react';
import { useState } from 'react';

export function ExportPage() {
  const { scheme, savedSchemes, loadScheme, deleteScheme } = useThemeStore();
  const [copied, setCopied] = useState(false);
  const [format, setFormat] = useState<ExportFormat>('toml');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);
  
  const currentExporter = exporters.find(e => e.id === format)!;
  const content = generateExportFile(scheme, format);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleZipExport = async () => {
    setIsExportingZip(true);
    try {
      await downloadZipExport(scheme);
    } catch (error) {
      console.error('Failed to export zip:', error);
    } finally {
      setIsExportingZip(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
      {/* Export Preview */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          
          {/* Format Selector */}
          <div className="relative">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 font-mono text-xs tracking-[0.2em] text-cyan uppercase hover:text-white transition-colors"
            >
              // {currentExporter.name}
              <ChevronDown size={14} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute top-full left-0 mt-2 w-48 bg-surface border border-layer rounded flex flex-col z-10 overflow-hidden"
                >
                  {exporters.map(e => (
                    <button
                      key={e.id}
                      onClick={() => { setFormat(e.id); setDropdownOpen(false); }}
                      className={`text-left px-3 py-2 font-mono text-xs transition-colors ${
                        format === e.id ? 'bg-[#0d1a1a] text-cyan' : 'text-fg hover:bg-[#0a1515] hover:text-cyan'
                      }`}
                    >
                      {e.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopy}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 border border-accent-dim text-fg font-mono text-xs px-3 py-1.5 rounded hover:border-cyan hover:text-cyan transition-colors"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={() => downloadExportFile(scheme, format)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-base border border-cyan text-cyan font-mono text-xs px-4 py-1.5 rounded hover:bg-[#0d2020] transition-colors"
            >
              <Download size={12} />
              Export {currentExporter.ext}
            </button>
            <button
              onClick={handleZipExport}
              disabled={isExportingZip}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 border border-layer text-fg font-mono text-xs px-3 py-1.5 rounded hover:border-cyan hover:text-cyan transition-colors disabled:opacity-40"
              title="Export all files as ZIP"
            >
              <Archive size={12} />
              {isExportingZip ? 'Zipping…' : 'ZIP'}
            </button>
          </div>
        </div>

        <div className="border border-layer rounded-xl overflow-hidden relative">
          <div className="bg-surface px-4 py-2 border-b border-layer flex items-center justify-between gap-2">
            <span className="font-mono text-[10px] text-dim">
              ~/.config/theme/{currentExporter.filename(scheme)}
            </span>
          </div>
          <pre className="p-5 font-mono text-xs text-accent bg-void leading-loose overflow-x-auto whitespace-pre max-h-[60vh] overflow-y-auto">
            {content}
          </pre>
        </div>
      </div>

      {/* Saved library */}
      <aside className="space-y-4">
        <h3 className="font-mono text-[10px] tracking-widest text-accent-dim uppercase">// Saved Schemes</h3>
        <div className="space-y-2">
          {savedSchemes.map(s => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                s.name === scheme.name ? 'border-cyan/30 bg-base' : 'border-layer hover:border-accent-dim'
              }`}
              onClick={() => loadScheme(s)}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-fg">{s.name}</span>
                <button
                  onClick={e => { e.stopPropagation(); deleteScheme(s.name); }}
                  className="font-mono text-[10px] text-dim hover:text-error transition-colors"
                >
                  ×
                </button>
              </div>
              <div className="flex gap-1 mt-2">
                {[s.core.foreground, s.core.accent, s.core.accent_bright, s.terminal.color9, s.terminal.color10, s.terminal.color12].map((c, i) => (
                  <div key={i} className="w-4 h-4 rounded" style={{ backgroundColor: c }} />
                ))}
              </div>
              <span className="font-mono text-[9px] text-dim mt-1 block capitalize">{s.style}</span>
            </motion.div>
          ))}
        </div>
      </aside>
    </div>
  );
}

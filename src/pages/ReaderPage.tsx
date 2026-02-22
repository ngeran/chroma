import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, RotateCcw, Zap } from 'lucide-react';
import {
  extractColors,
  detectFileType,
  fileTypeLabel,
  relativeLuminance,
  roleColor,
  type ExtractedColor,
  type FileType,
} from '../services/colorConfigParser';

interface GroupedColors {
  backgrounds: ExtractedColor[];
  coreUI: ExtractedColor[];
  ansiDark: ExtractedColor[];
  ansiBright: ExtractedColor[];
}

function groupColors(colors: ExtractedColor[]): GroupedColors {
  const backgrounds = colors.filter(
    (c) => c.role === 'background' || relativeLuminance(c.hex) < 0.012
  );
  const coreUI = colors.filter(
    (c) =>
      !c.role.startsWith('background') &&
      c.role !== 'ansi' &&
      c.role !== 'bright' &&
      !c.key.includes('palette')
  );
  const ansiDark = colors.filter((c) => c.role === 'ansi' || (c.key.includes('palette') && parseInt(c.key.replace('palette=', '')) < 8));
  const ansiBright = colors.filter((c) => c.role === 'bright' || (c.key.includes('palette') && parseInt(c.key.replace('palette=', '')) >= 8));

  const bgHexes = new Set(backgrounds.map((c) => c.hex));
  const coreFiltered = coreUI.filter(
    (c) => !bgHexes.has(c.hex) || c.role === 'cursor' || c.role === 'selection'
  );

  return { backgrounds, coreUI: coreFiltered, ansiDark, ansiBright };
}

function SwatchGrid({ colors }: { colors: ExtractedColor[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1">
      {colors.map((c, i) => (
        <Swatch key={i} color={c} />
      ))}
    </div>
  );
}

function Swatch({ color: c }: { color: ExtractedColor }) {
  const lum = relativeLuminance(c.hex);
  const lumPct = Math.min(lum * 400, 100).toFixed(0);
  const isBlack = lum < 0.002;
  const isOledSafe = lum < 0.04;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-layer overflow-hidden cursor-default hover:border-cyan transition-colors"
      whileHover={{ y: -2 }}
    >
      <div className="h-16 relative flex items-end justify-end p-1" style={{ backgroundColor: c.hex }}>
        {isBlack && (
          <span className="text-[8px] px-1 py-0.5 border border-layer bg-void/70 text-dim uppercase tracking-wider">
            PIXELS OFF
          </span>
        )}
        {!isBlack && isOledSafe && (
          <span className="text-[8px] px-1 py-0.5 border border-success bg-void/70 text-success uppercase tracking-wider">
            OLED SAFE
          </span>
        )}
        <div className="absolute bottom-0 left-0 h-0.5 bg-white/15" style={{ width: `${lumPct}%` }} />
      </div>
      <div className="bg-base/50 p-2">
        <div className="text-[9px] tracking-wider uppercase" style={{ color: roleColor(c.role) }}>
          {c.key}
        </div>
        <div className="text-xs font-mono text-fg font-semibold">{c.hex}</div>
        {c.comment && <div className="text-[9px] text-dim mt-0.5 truncate">{c.comment}</div>}
      </div>
    </motion.div>
  );
}

function SpectrumBar({ colors }: { colors: ExtractedColor[] }) {
  if (colors.length < 2) return null;
  const stops = colors.map((c) => c.hex).join(',');

  return (
    <div className="mb-8">
      <h3 className="font-mono text-[10px] tracking-[0.2em] text-accent-dim uppercase mb-3">
        // Full Spectrum
      </h3>
      <div
        className="h-6 border border-layer rounded"
        style={{ background: `linear-gradient(90deg, ${stops})` }}
      />
      <div className="flex mt-1">
        {colors.map((c, i) => (
          <div key={i} className="flex-1 text-center text-[8px] text-dim truncate">
            {c.key}
          </div>
        ))}
      </div>
    </div>
  );
}

function LuminanceChart({ colors }: { colors: ExtractedColor[] }) {
  const lumColors = colors.filter((c) => c.hex !== '#000000');
  if (lumColors.length < 2) return null;

  const maxLum = Math.max(...lumColors.map((c) => relativeLuminance(c.hex)));
  const sorted = [...lumColors].sort((a, b) => relativeLuminance(b.hex) - relativeLuminance(a.hex));

  return (
    <div className="mb-8">
      <h3 className="font-mono text-[10px] tracking-[0.2em] text-accent-dim uppercase mb-3">
        // Luminance Chart — OLED Burn-in Risk
      </h3>
      <div className="space-y-1">
        {sorted.map((c, i) => {
          const lum = relativeLuminance(c.hex);
          const pct = (lum / (maxLum || 1)) * 100;
          const riskIcon = lum < 0.02 ? '🔵' : lum < 0.1 ? '🟢' : lum < 0.3 ? '🟡' : '🔴';

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              className="flex items-center gap-2"
            >
              <div className="w-24 text-[9px] text-dim-brt truncate">{c.key}</div>
              <div className="flex-1 h-4 bg-base border border-layer relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct.toFixed(1)}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="h-full"
                  style={{ backgroundColor: c.hex }}
                />
              </div>
              <div className="w-16 text-right text-[9px] text-dim">
                {riskIcon} {(lum * 100).toFixed(1)}%
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="mt-2 text-[9px] text-dim tracking-wider">
        🔵 &lt;2% · 🟢 &lt;10% · 🟡 &lt;30% · 🔴 30%+ relative luminance
      </div>
    </div>
  );
}

function SyntaxPreview({ colors, filename }: { colors: ExtractedColor[]; filename: string }) {
  const findColor = (roles: string[]) => {
    for (const role of roles) {
      const found = colors.find((c) => c.role === role);
      if (found) return found.hex;
    }
    return '#94a8a8';
  };

  const fg = findColor(['foreground']);
  const bg = findColor(['background']);
  const acc = findColor(['accent', 'accent-cyan']);
  const err = findColor(['error']);
  const suc = findColor(['success']);
  const warn = findColor(['warning']);
  const cmt = findColor(['comment']);
  const info = findColor(['info']);
  const mag = findColor(['accent-magenta']);
  const cur = findColor(['cursor', 'accent']);

  return (
    <div className="mb-8">
      <h3 className="font-mono text-[10px] tracking-[0.2em] text-accent-dim uppercase mb-3">
        // Syntax Preview
      </h3>
      <div
        className="border border-layer rounded-lg p-4 font-mono text-sm leading-relaxed"
        style={{ backgroundColor: bg }}
      >
        <div style={{ color: cmt, fontStyle: 'italic' }}># {filename} — color preview</div>
        <div>
          <span style={{ color: err, fontWeight: 700 }}>def</span>{' '}
          <span style={{ color: info, fontWeight: 700 }}>render</span>(
          <span style={{ color: acc }}>display</span>=
          <span style={{ color: suc }}>"QD-OLED"</span>,{' '}
          <span style={{ color: acc }}>depth</span>=
          <span style={{ color: mag }}>4096</span>):
        </div>
        <div>
          &nbsp;&nbsp;<span style={{ color: acc }}>cursor</span> ={' '}
          <span style={{ color: cur, fontWeight: 600 }}>"{cur}"</span>{' '}
          <span style={{ color: cmt, fontStyle: 'italic' }}># active color</span>
        </div>
        <div>
          &nbsp;&nbsp;<span style={{ color: err, fontWeight: 700 }}>if</span>{' '}
          <span style={{ color: acc }}>display</span> =={' '}
          <span style={{ color: suc }}>"QD-OLED"</span>:
        </div>
        <div>
          &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: acc }}>bg</span> ={' '}
          <span style={{ color: suc }}>"{bg}"</span>{' '}
          <span style={{ color: cmt, fontStyle: 'italic' }}># pixels off</span>
        </div>
        <div>
          &nbsp;&nbsp;<span style={{ color: warn }}>OLED_SAFE</span> ={' '}
          <span style={{ color: mag }}>True</span>
        </div>
        <div style={{ color: fg }}>
          _<span className="inline-block w-0.5 h-4 align-middle animate-pulse" style={{ backgroundColor: cur }} />
        </div>
      </div>
    </div>
  );
}

export function ReaderPage() {
  const [content, setContent] = useState('');
  const [filename, setFilename] = useState('');
  const [colors, setColors] = useState<ExtractedColor[]>([]);
  const [fileType, setFileType] = useState<FileType>('generic');
  const [error, setError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processContent = useCallback((text: string, name: string) => {
    if (!text.trim()) return;

    const type = detectFileType(text, name);
    const extracted = extractColors(text, type);

    if (extracted.length === 0) {
      setError(true);
      return;
    }

    setColors(extracted);
    setFileType(type);
    setFilename(name || 'pasted-config');
    setError(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        processContent(ev.target?.result as string, file.name);
      };
      reader.readAsText(file);
    },
    [processContent]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        processContent(ev.target?.result as string, file.name);
      };
      reader.readAsText(file);
      e.target.value = '';
    },
    [processContent]
  );

  const handleParse = useCallback(() => {
    processContent(content, 'pasted-config');
  }, [content, processContent]);

  const handleReset = useCallback(() => {
    setColors([]);
    setContent('');
    setFilename('');
    setError(false);
  }, []);

  const grouped = groupColors(colors);

  return (
    <div className="h-full">
      <AnimatePresence mode="wait">
        {colors.length === 0 ? (
          <motion.div
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <div
              className={`w-full max-w-xl border rounded-xl p-8 text-center transition-colors ${
                isDragging ? 'border-cyan bg-cyan/5' : 'border-layer border-dashed'
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <Upload className="w-10 h-10 mx-auto mb-4 text-dim" />
              <h2 className="font-display text-xl text-fg mb-2">Drop your config file</h2>
              <p className="font-mono text-xs text-dim-brt uppercase tracking-wider mb-4">
                or click to browse
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {['.conf', '.toml', '.lua', '.css', '.txt'].map((fmt) => (
                  <span
                    key={fmt}
                    className="text-[10px] px-2 py-1 border border-dim text-dim uppercase tracking-wider"
                  >
                    {fmt}
                  </span>
                ))}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2 border border-cyan text-cyan font-mono text-xs uppercase tracking-wider hover:bg-cyan/10 transition-colors"
              >
                Browse File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <div className="flex items-center gap-4 w-full max-w-xl my-6">
              <div className="flex-1 h-px bg-layer" />
              <span className="font-mono text-[10px] text-dim uppercase tracking-wider">or paste content</span>
              <div className="flex-1 h-px bg-layer" />
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your ghostty.conf, waybar style.css, nightfox.lua, color.toml..."
              className="w-full max-w-xl h-32 bg-surface border border-layer rounded-lg p-4 font-mono text-xs text-fg placeholder:text-dim focus:border-cyan focus:outline-none transition-colors resize-none"
            />

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-xl mt-3 border border-error text-error p-3 text-xs"
              >
                No color values found in this content.
              </motion.div>
            )}

            <button
              onClick={handleParse}
              disabled={!content.trim()}
              className="w-full max-w-xl mt-4 flex items-center justify-center gap-2 border border-cyan text-cyan font-mono text-xs uppercase tracking-wider py-3 hover:bg-cyan/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Zap size={14} />
              Generate Color Map
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="output"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="font-display text-2xl text-cyan tracking-wider">{filename}</h1>
                <p className="font-mono text-xs text-dim-brt mt-1">
                  {fileTypeLabel(fileType)} · {colors.length} colors extracted
                </p>
              </div>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 border border-dim text-dim font-mono text-xs uppercase tracking-wider hover:border-error hover:text-error transition-colors"
              >
                <RotateCcw size={12} />
                Load Another
              </button>
            </div>

            {grouped.backgrounds.length > 0 && (
              <div className="mb-8">
                <h3 className="font-mono text-[10px] tracking-[0.2em] text-accent-dim uppercase mb-3">
                  // Background & UI Base
                </h3>
                <SwatchGrid colors={grouped.backgrounds} />
              </div>
            )}

            {grouped.coreUI.length > 0 && (
              <div className="mb-8">
                <h3 className="font-mono text-[10px] tracking-[0.2em] text-accent-dim uppercase mb-3">
                  // Core UI & Accents
                </h3>
                <SwatchGrid colors={grouped.coreUI} />
              </div>
            )}

            <SpectrumBar colors={[...grouped.ansiDark, ...grouped.ansiBright]} />

            {grouped.ansiDark.length > 0 && (
              <div className="mb-8">
                <h3 className="font-mono text-[10px] tracking-[0.2em] text-accent-dim uppercase mb-3">
                  // ANSI — Dark Spectrum (0–7)
                </h3>
                <SwatchGrid colors={grouped.ansiDark} />
              </div>
            )}

            {grouped.ansiBright.length > 0 && (
              <div className="mb-8">
                <h3 className="font-mono text-[10px] tracking-[0.2em] text-accent-dim uppercase mb-3">
                  // ANSI — Bright Spectrum (8–15)
                </h3>
                <SwatchGrid colors={grouped.ansiBright} />
              </div>
            )}

            <LuminanceChart colors={colors} />
            <SyntaxPreview colors={colors} filename={filename} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

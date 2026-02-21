import { useState } from 'react';
import { useThemeStore } from '../stores/themeStore';
import { SCHEME_STYLES } from '../constants/defaults';
import { ColorSwatch } from '../components/ui/ColorSwatch';
import { PaletteSelector } from '../components/ui/PaletteSelector';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, Zap } from 'lucide-react';
import { ANSI_ROLE_LABELS } from '../constants/defaults';

export function GeneratorPage() {
  const {
    scheme, baseHue, style, seed, schemeName, oledRiskLevel, isGenerating,
    setBaseHue, setStyle, setSeed, setSchemeName, setOledRiskLevel,
    generate, generateRandom, saveScheme, loadScheme,
  } = useThemeStore();
  
  const [generationMode, setGenerationMode] = useState<'scratch' | 'palette'>('scratch');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
      {/* ── Controls Panel ─────────────────────────────────────── */}
      <aside className="space-y-6">
        {/* Generation Mode Toggle */}
        <div className="border border-layer rounded-xl p-5 bg-surface">
          <h2 className="font-mono text-xs tracking-[0.2em] text-cyan uppercase mb-4">// Generation Mode</h2>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setGenerationMode('scratch')}
              className={`px-4 py-3 rounded-lg border text-center transition-colors ${
                generationMode === 'scratch'
                  ? 'border-cyan bg-cyan/10 text-cyan'
                  : 'border-layer text-fg hover:border-dim hover:bg-layer/10'
              }`}
            >
              <div className="font-mono text-sm">From Scratch</div>
              <div className="text-xs text-dim">Generate with algorithms</div>
            </button>
            <button
              onClick={() => setGenerationMode('palette')}
              className={`px-4 py-3 rounded-lg border text-center transition-colors ${
                generationMode === 'palette'
                  ? 'border-cyan bg-cyan/10 text-cyan'
                  : 'border-layer text-fg hover:border-dim hover:bg-layer/10'
              }`}
            >
              <div className="font-mono text-sm">From Palette</div>
              <div className="text-xs text-dim">Optimize existing themes</div>
            </button>
          </div>
        </div>

        {/* Dynamic Controls Based on Mode */}
        {generationMode === 'scratch' && (
          <div className="border border-layer rounded-xl p-5 bg-surface space-y-5">
            <h2 className="font-mono text-xs tracking-[0.2em] text-cyan uppercase">// Parameters</h2>

          {/* Name */}
          <div className="space-y-2">
            <label className="font-mono text-[10px] text-dim-brt uppercase tracking-widest">Scheme Name</label>
            <input
              className="w-full bg-transparent border border-layer rounded px-3 py-2 font-mono text-sm text-fg focus:border-cyan focus:outline-none transition-colors placeholder-[#203030]"
              value={schemeName}
              onChange={e => setSchemeName(e.target.value)}
              placeholder="e.g. Nebula-001"
            />
          </div>

          {/* Base Hue */}
          <div className="space-y-2">
            <label className="font-mono text-[10px] text-dim-brt uppercase tracking-widest flex justify-between">
              Base Hue
              <span className="text-cyan">{baseHue}°</span>
            </label>
            <div className="relative h-8">
              {/* Hue gradient strip */}
              <div
                className="w-full h-3 rounded-full"
                style={{ background: 'linear-gradient(to right, hsl(0,70%,25%), hsl(60,70%,25%), hsl(120,70%,25%), hsl(180,70%,25%), hsl(240,70%,25%), hsl(300,70%,25%), hsl(360,70%,25%))' }}
              />
              <input
                type="range" min={0} max={359} value={baseHue}
                onChange={e => setBaseHue(Number(e.target.value))}
                className="absolute inset-0 w-full opacity-0 cursor-pointer h-3"
              />
            </div>
          </div>

          {/* Style */}
          <div className="space-y-2">
            <label className="font-mono text-[10px] text-dim-brt uppercase tracking-widest">Harmony Style</label>
            <div className="grid grid-cols-2 gap-1.5">
              {SCHEME_STYLES.map(s => (
                <button
                  key={s.value}
                  onClick={() => setStyle(s.value as any)}
                  className={`text-left px-3 py-2 rounded border text-[10px] font-mono transition-colors ${
                    style === s.value
                      ? 'border-cyan text-cyan bg-base'
                      : 'border-layer text-dim-brt hover:border-accent-dim hover:text-fg'
                  }`}
                >
                  <div className="font-medium">{s.label}</div>
                  <div className="text-[9px] opacity-60 mt-0.5">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* OLED Risk Level */}
          <div className="space-y-2">
            <label className="font-mono text-[10px] text-dim-brt uppercase tracking-widest">OLED Risk Level</label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { value: 'ultra-conservative', label: 'Ultra Conservative', desc: 'Maximum OLED protection' },
                { value: 'conservative', label: 'Conservative', desc: 'Low burn-in risk' },
                { value: 'balanced', label: 'Balanced', desc: 'Default safety' },
                { value: 'aggressive', label: 'Aggressive', desc: 'Higher brightness' },
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setOledRiskLevel(option.value as any)}
                  className={`text-left px-3 py-2 rounded border text-[10px] font-mono transition-colors ${
                    oledRiskLevel === option.value
                      ? 'border-cyan text-cyan bg-base'
                      : 'border-layer text-dim-brt hover:border-accent-dim hover:text-fg'
                  }`}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-[9px] opacity-60 mt-0.5">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Seed */}
          <div className="space-y-2">
            <label className="font-mono text-[10px] text-dim-brt uppercase tracking-widest">Entropy Seed</label>
            <input
              className="w-full bg-transparent border border-layer rounded px-3 py-2 font-mono text-sm text-fg focus:border-cyan focus:outline-none transition-colors"
              value={seed}
              onChange={e => setSeed(e.target.value)}
              placeholder="any string"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={generate}
              disabled={isGenerating}
              className="flex-1 flex items-center justify-center gap-2 bg-base border border-cyan text-cyan font-mono text-xs tracking-widest uppercase px-4 py-3 rounded hover:bg-[#0d2020] transition-colors disabled:opacity-40"
            >
              <Zap size={14} />
              {isGenerating ? 'Generating…' : 'Generate'}
            </button>
            <button
              onClick={generateRandom}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 border border-accent-dim text-fg font-mono text-xs px-4 py-3 rounded hover:border-cyan hover:text-cyan transition-colors disabled:opacity-40"
              title="Random scheme"
            >
              <Shuffle size={14} />
            </button>
          </div>

          <button
            onClick={saveScheme}
            className="w-full border border-layer text-dim-brt font-mono text-xs tracking-widest uppercase px-4 py-2 rounded hover:border-accent-dim hover:text-fg transition-colors"
          >
            Save to Library
          </button>
        </div>
        )}

        {generationMode === 'palette' && (
          <div className="border border-layer rounded-xl p-5 bg-surface">
            <PaletteSelector 
              onPaletteOptimized={(optimizedScheme) => {
                loadScheme(optimizedScheme);
              }}
            />
          </div>
        )}
      </aside>

      {/* ── Preview Panel ───────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={scheme.name}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Scheme name & description */}
          <div>
            <h1 className="font-display text-3xl text-cyan tracking-wider">{scheme.name}</h1>
            <p className="font-mono text-sm text-dim-brt mt-1 italic">{scheme.description}</p>
          </div>

          {/* CORE UI palette */}
          <section className="border border-layer rounded-xl p-5 bg-surface">
            <h3 className="font-mono text-[10px] tracking-[0.2em] text-accent-dim uppercase mb-4">// Core UI</h3>
            <div className="flex flex-wrap gap-4">
              {Object.entries(scheme.core).map(([key, value]) => (
                <ColorSwatch key={key} color={value} label={key.replace(/_/g, ' ')} size="md" />
              ))}
            </div>
          </section>

          {/* Terminal mockup */}
          <section className="border border-layer rounded-xl overflow-hidden">
            <div className="bg-[#0a0a0a] px-4 py-2 flex items-center gap-2 border-b border-layer">
              <div className="w-2.5 h-2.5 rounded-full bg-[#523333]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#524833]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#335240]" />
              <span className="font-mono text-[10px] text-dim ml-2">omarchy ~ terminal</span>
            </div>
            <div className="bg-void p-6 font-mono text-sm leading-loose" style={{ color: scheme.core.foreground }}>
              <div><span style={{ color: scheme.core.accent }}>❯</span> ls <span style={{ color: scheme.terminal.color6 }}>--color</span></div>
              <div style={{ color: scheme.terminal.color2 }}>  src/  dist/  node_modules/</div>
              <div><span style={{ color: scheme.core.accent }}>❯</span> git status</div>
              <div>On branch <span style={{ color: scheme.terminal.color4 }}>main</span></div>
              <div style={{ color: scheme.terminal.color2 }}>  nothing to commit, working tree clean</div>
              <div><span style={{ color: scheme.core.accent }}>❯</span> <span style={{ color: scheme.core.accent_bright, animation: 'blink 1s step-end infinite' }}>█</span></div>
            </div>
          </section>

          {/* ANSI palette grid */}
          <section className="border border-layer rounded-xl p-5 bg-surface">
            <h3 className="font-mono text-[10px] tracking-[0.2em] text-accent-dim uppercase mb-4">// Terminal Palette (ANSI 16)</h3>
            <div className="space-y-4">
              <div>
                <span className="font-mono text-[9px] text-dim uppercase tracking-widest">Dark Spectrum</span>
                <div className="flex flex-wrap gap-3 mt-2">
                  {(Object.entries(scheme.terminal) as [string, string][]).slice(0, 8).map(([key, value]) => (
                    <ColorSwatch key={key} color={value as string} label={key} sublabel={ANSI_ROLE_LABELS[key]} size="sm" />
                  ))}
                </div>
              </div>
              <div>
                <span className="font-mono text-[9px] text-dim uppercase tracking-widest">Bright Spectrum</span>
                <div className="flex flex-wrap gap-3 mt-2">
                  {(Object.entries(scheme.terminal) as [string, string][]).slice(8).map(([key, value]) => (
                    <ColorSwatch key={key} color={value as string} label={key} sublabel={ANSI_ROLE_LABELS[key]} size="sm" />
                  ))}
                </div>
              </div>
            </div>
          </section>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

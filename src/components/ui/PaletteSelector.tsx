import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Palette } from 'lucide-react';
import { PREDEFINED_PALETTES, PALETTE_METADATA } from '../../services/predefinedPalettes';
import { PaletteOptimizer } from '../../services/paletteOptimizer';
import { useThemeStore } from '../../stores/themeStore';
import type { ColorScheme, ColorPalette } from '../../types/theme';

interface PaletteSelectorProps {
  onPaletteOptimized?: (colorScheme: ColorScheme) => void;
}

function PaletteCard({
  palette,
  metadata,
  isSelected,
  onSelect,
}: {
  palette: ColorPalette;
  metadata: { name: string; description: string; author: string; year: number };
  isSelected: boolean;
  onSelect: () => void;
}) {
  const colors = [
    { key: 'bg', color: palette.colors.background },
    { key: 'surface', color: palette.colors.surface },
    { key: 'fg', color: palette.colors.foreground },
    { key: 'accent', color: palette.colors.accent },
    { key: 'primary', color: palette.colors.primary },
    { key: 'error', color: palette.colors.error },
    { key: 'warning', color: palette.colors.warning },
    { key: 'success', color: palette.colors.success },
  ];

  return (
    <motion.button
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-lg border transition-all ${
        isSelected
          ? 'border-cyan bg-cyan/10 ring-1 ring-cyan'
          : 'border-layer hover:border-dim hover:bg-layer/10'
      }`}
      whileHover={{ scale: isSelected ? 1 : 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-display text-sm text-fg tracking-wide">{metadata.name}</h3>
          <p className="text-[10px] text-dim mt-0.5">{metadata.author} · {metadata.year}</p>
        </div>
        <div className="w-6 h-6 rounded-full border border-layer overflow-hidden flex">
          <div className="w-1/2 h-full" style={{ backgroundColor: palette.colors.primary }} />
          <div className="w-1/2 h-full" style={{ backgroundColor: palette.colors.accent }} />
        </div>
      </div>

      <div className="grid grid-cols-8 gap-0.5 mb-3">
        {colors.map(({ key, color }) => (
          <div
            key={key}
            className="h-5 first:rounded-l last:rounded-r"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      <p className="text-[10px] text-dim-brt leading-relaxed">{metadata.description}</p>

      {isSelected && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 pt-3 border-t border-cyan/30"
        >
          <div className="flex items-center gap-2 text-[10px] text-cyan">
            <Palette size={12} />
            <span>Selected for OLED optimization</span>
          </div>
        </motion.div>
      )}
    </motion.button>
  );
}

export function PaletteSelector({ onPaletteOptimized }: PaletteSelectorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const { oledRiskLevel, setOledRiskLevel } = useThemeStore();

  const handleOptimize = async () => {
    if (!selectedId) return;

    setIsOptimizing(true);
    try {
      const scheme = await PaletteOptimizer.optimizePalette(selectedId, {
        oledRiskLevel,
        preserveSaturation: 0.7,
        preserveBrightness: 0.6,
        contrastBoost: 0.3,
      });
      onPaletteOptimized?.(scheme);
    } catch (error) {
      console.error('Failed to optimize palette:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const selectedPalette = selectedId ? PREDEFINED_PALETTES[selectedId] : null;
  const selectedMetadata = selectedId
    ? PALETTE_METADATA.find((m) => m.id === selectedId)
    : null;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-lg text-cyan tracking-wide mb-1">Choose a Base Palette</h2>
        <p className="font-mono text-[10px] text-dim-brt uppercase tracking-widest">
          Popular themes optimized for OLED displays
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {PALETTE_METADATA.map((meta) => {
          const palette = PREDEFINED_PALETTES[meta.id];
          if (!palette) return null;

          return (
            <PaletteCard
              key={meta.id}
              palette={palette}
              metadata={meta}
              isSelected={selectedId === meta.id}
              onSelect={() => setSelectedId(meta.id)}
            />
          );
        })}
      </div>

      {selectedPalette && selectedMetadata && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 pt-4 border-t border-layer"
        >
          <div className="p-4 rounded-lg border border-layer bg-surface">
            <h4 className="font-mono text-[10px] text-dim-brt uppercase tracking-widest mb-3">
              Color Roles — {selectedMetadata.name}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(selectedPalette.colors).map(([key, hex]) => (
                <div key={key} className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded border border-layer flex-shrink-0"
                    style={{ backgroundColor: hex }}
                  />
                  <span className="text-[10px] text-fg truncate">{key}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="font-mono text-[10px] text-dim-brt uppercase tracking-widest block mb-2">
              OLED Risk Level
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { value: 'ultra-conservative', label: 'Ultra Safe', desc: 'Max protection' },
                { value: 'conservative', label: 'Conservative', desc: 'Low burn-in risk' },
                { value: 'balanced', label: 'Balanced', desc: 'Default' },
                { value: 'aggressive', label: 'Aggressive', desc: 'Higher brightness' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setOledRiskLevel(opt.value as typeof oledRiskLevel)}
                  className={`text-left px-3 py-2 rounded border text-[10px] font-mono transition-colors ${
                    oledRiskLevel === opt.value
                      ? 'border-cyan text-cyan bg-base'
                      : 'border-layer text-dim-brt hover:border-dim'
                  }`}
                >
                  <div className="font-medium">{opt.label}</div>
                  <div className="text-[9px] opacity-60">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleOptimize}
            disabled={isOptimizing}
            className="w-full flex items-center justify-center gap-2 bg-base border border-cyan text-cyan font-mono text-xs tracking-widest uppercase px-4 py-3 rounded hover:bg-cyan/10 transition-colors disabled:opacity-40"
          >
            <Zap size={14} />
            {isOptimizing ? 'Optimizing...' : `Optimize ${selectedMetadata.name} for OLED`}
          </button>
        </motion.div>
      )}

      <div className="p-4 rounded-lg border border-layer bg-surface/50">
        <h3 className="font-mono text-[10px] text-dim-brt uppercase tracking-widest mb-2">
          About Palette Optimization
        </h3>
        <p className="text-[10px] text-dim leading-relaxed">
          Takes beautiful, proven color palettes and adapts them for OLED displays.
          The optimization ensures pure black backgrounds, protected accent colors,
          enhanced contrast, and reduced burn-in risk while preserving the original aesthetic.
        </p>
      </div>
    </div>
  );
}

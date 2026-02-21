import { useState } from 'react';
import { PALETTE_METADATA, PALETTE_CATEGORIES, getPalettesByCategory, PREDEFINED_PALETTES } from '@/services/predefinedPalettes';
import { PaletteOptimizer } from '@/services/paletteOptimizer';
import { useThemeStore } from '@/stores/themeStore';

interface PaletteSelectorProps {
  onPaletteSelect?: (paletteId: string) => void;
  onPaletteOptimized?: (colorScheme: any) => void;
}

export function PaletteSelector({ onPaletteSelect, onPaletteOptimized }: PaletteSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('dark');
  const [selectedPalette, setSelectedPalette] = useState<string>('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const { oledRiskLevel } = useThemeStore();

  const categories = Object.keys(PALETTE_CATEGORIES);
  const palettes = getPalettesByCategory(selectedCategory);

  const handlePaletteSelect = (paletteId: string) => {
    setSelectedPalette(paletteId);
    onPaletteSelect?.(paletteId);
  };

  const handleOptimizePalette = async () => {
    if (!selectedPalette) return;
    
    setIsOptimizing(true);
    try {
      const optimizedScheme = await PaletteOptimizer.optimizePalette(selectedPalette, {
        oledRiskLevel,
        preserveSaturation: 0.7,
        preserveBrightness: 0.6,
        contrastBoost: 0.3
      });
      
      onPaletteOptimized?.(optimizedScheme);
    } catch (error) {
      console.error('Failed to optimize palette:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const getPalettePreview = (paletteId: string) => {
    const metadata = PALETTE_METADATA.find(m => m.id === paletteId);
    if (!metadata) return null;

    return (
      <div
        key={paletteId}
        className={`p-4 rounded-lg border cursor-pointer transition-all ${
          selectedPalette === paletteId
            ? 'border-cyan bg-cyan/10'
            : 'border-layer hover:border-dim hover:bg-layer/10'
        }`}
        onClick={() => handlePaletteSelect(paletteId)}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-fg">{metadata.name}</h3>
          <span className="text-xs px-2 py-1 rounded bg-layer text-dim">
            {metadata.category}
          </span>
        </div>
        
        <p className="text-sm text-dim mb-3">{metadata.description}</p>
        
        {/* Color preview */}
        <div className="grid grid-cols-6 gap-1">
          {['primary', 'secondary', 'accent', 'error', 'warning', 'success'].map(colorType => (
            <div
              key={colorType}
              className="w-6 h-6 rounded"
              style={{
                backgroundColor: getPaletteColor(paletteId, colorType)
              }}
              title={colorType}
            />
          ))}
        </div>
        
        <div className="text-xs text-dim mt-2">
          by {metadata.author} • {metadata.year}
        </div>
      </div>
    );
  };

  const getPaletteColor = (paletteId: string, colorType: string): string => {
    try {
      const palette = PREDEFINED_PALETTES[paletteId as keyof typeof PREDEFINED_PALETTES];
      return palette?.colors[colorType as keyof typeof palette.colors] || '#666666';
    } catch {
      return '#666666';
    }
  };

  return (
    <div className="space-y-6">
      {/* Category selector */}
      <div>
        <h2 className="text-xl font-bold text-fg mb-4">Choose a Palette</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedCategory === category
                  ? 'bg-cyan text-void'
                  : 'bg-layer text-fg hover:bg-dim'
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Palette grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {palettes.map(palette => palette.name).map(paletteId => 
          getPalettePreview(paletteId)
        )}
      </div>

      {/* Action buttons */}
      {selectedPalette && (
        <div className="flex gap-3 pt-4 border-t border-layer">
          <button
            className="px-4 py-2 bg-cyan text-void rounded-lg font-medium hover:bg-cyan/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleOptimizePalette}
            disabled={isOptimizing}
          >
            {isOptimizing ? 'Optimizing...' : 'Optimize for OLED'}
          </button>
          
          <button
            className="px-4 py-2 border border-layer text-fg rounded-lg font-medium hover:bg-layer/10 transition-colors"
            onClick={() => setSelectedPalette('')}
          >
            Clear Selection
          </button>
        </div>
      )}

      {/* Info panel */}
      <div className="p-4 rounded-lg bg-layer/20 border border-layer">
        <h3 className="font-semibold text-fg mb-2">About Palette Optimization</h3>
        <p className="text-sm text-dim">
          This system takes beautiful, proven color palettes and optimizes them for OLED displays 
          while preserving their aesthetic appeal. The optimization process ensures:
        </p>
        <ul className="text-sm text-dim mt-2 space-y-1">
          <li>• Pure black background for OLED efficiency</li>
          <li>• Protected accent colors for visual identity</li>
          <li>• Enhanced contrast for readability</li>
          <li>• Burn-in risk reduction</li>
          <li>• Preserved color harmony</li>
        </ul>
      </div>
    </div>
  );
}
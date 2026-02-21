import { useThemeStore } from '../stores/themeStore';
import { RatingBadge } from '../components/ui/RatingBadge';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export function AnalysisPage() {
  const { scheme, analysis } = useThemeStore();
  if (!analysis) return null;

  return (
    <div className="space-y-8">
      {/* Score overview */}
      <div>
        <h2 className="font-mono text-xs tracking-[0.2em] text-cyan uppercase mb-4">// Analysis: {scheme.name}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <RatingBadge score={analysis.overallScore}    label="Overall"    />
          <RatingBadge score={analysis.oledScore}       label="OLED"       />
          <RatingBadge score={analysis.contrastScore}   label="Contrast"   />
          <RatingBadge score={analysis.harmonyScore}    label="Harmony"    />
        </div>
      </div>

      {/* WCAG table */}
      <section className="border border-layer rounded-xl p-5 bg-surface">
        <h3 className="font-mono text-[10px] tracking-widest text-accent-dim uppercase mb-4">// WCAG Compliance</h3>
        <div className="space-y-3">
          {Object.entries(analysis.wcagCompliance).map(([key, level]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="font-mono text-xs text-dim-brt">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              <span className={`font-mono text-xs px-2 py-0.5 rounded border ${
                level === 'AAA' ? 'border-success text-success' :
                level === 'AA'  ? 'border-[#334052] text-[#4a5c7a]' :
                                  'border-error text-error'
              }`}>{level}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Burn-in risk */}
      <section className="border border-layer rounded-xl p-5 bg-surface">
        <h3 className="font-mono text-[10px] tracking-widest text-accent-dim uppercase mb-3">// OLED Burn-in Risk</h3>
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-mono text-sm ${
          analysis.burnInRisk === 'low'    ? 'bg-success-dim text-success border border-success' :
          analysis.burnInRisk === 'medium' ? 'bg-warning-dim text-warning border border-warning' :
                                             'bg-error-dim text-error border border-error'
        }`}>
          {analysis.burnInRisk === 'low' ? '●' : analysis.burnInRisk === 'medium' ? '◐' : '○'}
          &nbsp;{analysis.burnInRisk.toUpperCase()} RISK
        </div>
      </section>

      {/* Luminance bar chart */}
      <section className="border border-layer rounded-xl p-5 bg-surface">
        <h3 className="font-mono text-[10px] tracking-widest text-accent-dim uppercase mb-4">// Luminance Profile (ANSI 16)</h3>
        <div className="flex items-end gap-1.5 h-24">
          {analysis.luminanceProfile.map((lum, i) => {
            const terminalColors = Object.values(scheme.terminal) as string[];
            return (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(lum * 4, 2)}%` }}
                transition={{ delay: i * 0.04, type: 'spring', stiffness: 200 }}
                className="flex-1 rounded-t min-h-[2px]"
                style={{ backgroundColor: terminalColors[i] ?? '#333', minHeight: 2 }}
                title={`color${i}: ${lum.toFixed(1)}%`}
              />
            );
          })}
        </div>
        <div className="flex justify-between font-mono text-[9px] text-dim mt-1">
          <span>color0</span><span>color7</span><span>color8</span><span>color15</span>
        </div>
      </section>

      {/* Insights & Warnings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="border border-layer rounded-xl p-5 bg-surface">
          <h3 className="font-mono text-[10px] tracking-widest text-[#335240] uppercase mb-3">// Insights</h3>
          <ul className="space-y-2">
            {analysis.insights.map((insight, i) => (
              <li key={i} className="flex gap-2 font-mono text-xs text-success">
                <CheckCircle size={12} className="mt-0.5 shrink-0" />
                {insight}
              </li>
            ))}
          </ul>
        </section>

        <section className="border border-layer rounded-xl p-5 bg-surface">
          <h3 className="font-mono text-[10px] tracking-widest text-[#524833] uppercase mb-3">// Warnings</h3>
          <ul className="space-y-2">
            {analysis.warnings.length === 0
              ? <li className="font-mono text-xs text-dim-brt">No warnings detected.</li>
              : analysis.warnings.map((w, i) => (
                  <li key={i} className="flex gap-2 font-mono text-xs text-warning">
                    <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                    {w}
                  </li>
                ))
            }
          </ul>
        </section>
      </div>

      {/* Color stats */}
      <section className="border border-layer rounded-xl p-5 bg-surface">
        <h3 className="font-mono text-[10px] tracking-widest text-accent-dim uppercase mb-3">// Color Distribution</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          {Object.entries(analysis.colorCount).map(([key, val]) => (
            <div key={key}>
              <div className="font-mono text-2xl text-fg">{val as React.ReactNode}</div>
              <div className="font-mono text-[10px] text-dim uppercase tracking-wider mt-1">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

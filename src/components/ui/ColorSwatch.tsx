import { motion } from 'framer-motion';
import { useState } from 'react';

interface Props {
  color: string;
  label: string;
  sublabel?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ColorSwatch({ color, label, sublabel, size = 'md' }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(color);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <motion.div
      className="flex flex-col items-center gap-1 cursor-pointer group"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      onClick={copy}
      title={`Click to copy ${color}`}
    >
      <div
        className={`${sizeClasses[size]} rounded border border-white/10 relative overflow-hidden`}
        style={{ backgroundColor: color, boxShadow: `0 0 12px ${color}40` }}
      >
        {copied && (
          <div className="absolute inset-0 flex items-center justify-center bg-void/60 text-[10px] text-white font-mono">
            ✓
          </div>
        )}
      </div>
      <span className="font-mono text-[10px] text-fg group-hover:text-cyan transition-colors">
        {color}
      </span>
      <span className="text-[10px] text-dim-brt text-center leading-tight">{label}</span>
      {sublabel && <span className="text-[9px] text-dim">{sublabel}</span>}
    </motion.div>
  );
}

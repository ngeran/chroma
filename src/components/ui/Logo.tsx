import { motion } from 'framer-motion';

export function Logo() {
  return (
    <motion.div
      className="flex items-center gap-2 select-none"
      whileHover={{ scale: 1.03 }}
    >
      {/* OLED-aware icon: minimal lit pixels */}
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="14" stroke="#33ffff" strokeWidth="1.5" strokeDasharray="4 2" />
        <circle cx="16" cy="16" r="6"  fill="#33ffff" fillOpacity="0.15" />
        <circle cx="16" cy="16" r="2"  fill="#33ffff" />
      </svg>
      <div className="flex flex-col leading-none">
        <span className="font-display text-lg tracking-[0.2em] text-cyan uppercase">Chroma</span>
        <span className="font-display text-lg tracking-[0.2em] text-fg uppercase -mt-1">Void</span>
      </div>
    </motion.div>
  );
}

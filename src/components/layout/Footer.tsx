export function Footer() {
  return (
    <footer className="border-t border-layer py-8 text-center">
      <p className="font-mono text-xs text-dim">
        ChromaVoid — OLED Color Engine for Omarchy ·{' '}
        <span className="text-cyan/50">Pure Black. Infinite Palette.</span>
      </p>
      <p className="font-mono text-[10px] text-[#202a2a] mt-1">
        background = "#000000" is immutable · All colors OLED-optimized
      </p>
    </footer>
  );
}

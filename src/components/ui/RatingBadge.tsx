interface Props {
  score: number;  // 0–100
  label: string;
}

export function RatingBadge({ score, label }: Props) {
  const color = score >= 80 ? '#33ffff'
              : score >= 60 ? '#7a6a4a'
              : score >= 40 ? '#7a4a4a'
              : '#523333';

  const stars = Math.round(score / 20); // 0–5

  return (
    <div className="flex flex-col items-center gap-1 p-3 border border-white/5 rounded bg-white/2">
      <div className="font-mono text-2xl font-bold" style={{ color }}>
        {score}
        <span className="text-xs text-dim-brt">/100</span>
      </div>
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className="text-xs" style={{ color: i < stars ? color : '#1a2222' }}>★</span>
        ))}
      </div>
      <span className="text-[10px] font-mono text-dim-brt uppercase tracking-widest">{label}</span>
    </div>
  );
}

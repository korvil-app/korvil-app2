interface Props {
  remainingMs: number;
  totalMs: number;
  size?: number;
  paused?: boolean;
}

export function TimerRing({ remainingMs, totalMs, size = 160, paused }: Props) {
  const stroke = Math.max(8, size * 0.08);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = totalMs > 0 ? remainingMs / totalMs : 0;
  const secs = Math.ceil(remainingMs / 1000);
  const color = pct > 0.5 ? '#4ADE80' : pct > 0.25 ? '#FBBF24' : '#F87171';
  const urgent = secs <= 5 && remainingMs > 0 && !paused;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="timer" aria-label={`${secs} seconds left`}>
      {urgent && <div className="absolute inset-0 animate-pulse-ring rounded-full" style={{ boxShadow: `0 0 0 4px ${color}` }} />}
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgb(255 255 255 / 0.1)" strokeWidth={stroke} fill="rgb(14 10 42 / 0.6)" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ transition: 'stroke-dashoffset 0.1s linear, stroke 0.3s' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="font-display font-bold tabular-nums" style={{ fontSize: size * 0.36, color: urgent ? color : 'white' }}>
          {paused ? '||' : secs}
        </span>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';

export function useCountUp(to: number, from: number, durationMs = 900, enabled = true): number {
  const [value, setValue] = useState(enabled ? from : to);
  const raf = useRef(0);

  useEffect(() => {
    if (!enabled || from === to) {
      setValue(to);
      return;
    }
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / durationMs);
      const eased = 1 - (1 - p) ** 3;
      setValue(Math.round(from + (to - from) * eased));
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [to, from, durationMs, enabled]);

  return value;
}

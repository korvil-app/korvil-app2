import type { CSSProperties } from 'react';

interface Props {
  shape: 'triangle' | 'diamond' | 'circle' | 'square';
  className?: string;
  style?: CSSProperties;
}

export function AnswerShape({ shape, className = '', style }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden="true" fill="currentColor">
      {shape === 'triangle' && <path d="M12 3 22 20H2z" />}
      {shape === 'diamond' && <path d="M12 2 22 12 12 22 2 12z" />}
      {shape === 'circle' && <circle cx="12" cy="12" r="10" />}
      {shape === 'square' && <rect x="3" y="3" width="18" height="18" rx="2" />}
    </svg>
  );
}

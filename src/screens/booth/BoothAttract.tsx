import { useEffect, useState } from 'react';
import { Hand, Trophy } from 'lucide-react';
import type { BoothPlay } from '@/types';
import { BrandMark } from '@/components/BrandMark';
import { ANSWER_STYLES } from '@/lib/constants';
import { AnswerShape } from '@/components/AnswerShape';

const TAGLINES = ['5 quick questions', 'Beat today\u2019s high score', 'Takes under a minute', 'Get on the leaderboard'];

export function BoothAttract({ packTitle, today, onStart }: { packTitle: string; today: BoothPlay[]; onStart: () => void }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % TAGLINES.length), 2600);
    return () => clearInterval(t);
  }, []);
  const top = [...today].filter((p) => p.name).sort((a, b) => b.score - a.score).slice(0, 3);

  return (
    <button onClick={onStart} className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-6 text-center" aria-label="Tap to play">
      {ANSWER_STYLES.map((s, idx) => (
        <AnswerShape
          key={s.letter}
          shape={s.shape}
          className="pointer-events-none absolute h-24 w-24 animate-float opacity-25 sm:h-36 sm:w-36"
          style={{ color: s.bg, top: `${[12, 70, 18, 74][idx]}%`, left: `${[8, 12, 80, 78][idx]}%`, animationDelay: `${idx * 0.7}s` }}
        />
      ))}
      <BrandMark size="lg" />
      <div className="mt-6 text-lg text-stage-300 sm:text-xl">{packTitle}</div>
      <h1 className="mt-10 font-display text-6xl font-bold leading-none tracking-tight sm:text-8xl lg:text-9xl">
        Tap to play!
      </h1>
      <div key={i} className="mt-6 h-10 animate-fade-up font-display text-2xl font-bold text-primary-light sm:text-3xl">
        {TAGLINES[i]}
      </div>
      <div className="relative mt-14 grid h-24 w-24 place-items-center">
        <span className="absolute inset-0 animate-pulse-ring rounded-full bg-primary" />
        <span className="relative grid h-24 w-24 place-items-center rounded-full bg-primary text-primary-ink shadow-2xl shadow-primary/50">
          <Hand className="h-10 w-10" />
        </span>
      </div>
      {top.length > 0 && (
        <div className="mt-14 w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="mb-3 flex items-center justify-center gap-2 text-sm font-medium uppercase tracking-widest text-stage-300">
            <Trophy className="h-4 w-4 text-warning-400" /> Today&apos;s top players
          </div>
          {top.map((p, idx) => (
            <div key={p.id} className="flex items-center justify-between py-1.5 text-lg">
              <span className="truncate">
                <span className="mr-3 font-display font-bold text-stage-400">{idx + 1}</span>
                {p.name}
              </span>
              <span className="font-display font-bold tabular-nums">{p.score}</span>
            </div>
          ))}
        </div>
      )}
    </button>
  );
}

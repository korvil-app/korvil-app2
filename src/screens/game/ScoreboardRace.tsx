import { useEffect, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUp, Flame } from 'lucide-react';
import type { GameState, TeamState } from '@/lib/game';
import { STREAK_THRESHOLD } from '@/lib/constants';
import { Button } from '@/components/Button';
import { BrandMark } from '@/components/BrandMark';
import { useCountUp } from '@/hooks/useCountUp';
import { useApp } from '@/context/AppContext';

function ranks(teams: TeamState[], scores: Record<string, number>) {
  const sorted = [...teams].sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0) || teams.indexOf(a) - teams.indexOf(b));
  return Object.fromEntries(sorted.map((t, i) => [t.id, i]));
}

export function ScoreboardRace({ state, onNext }: { state: GameState; onNext: () => void }) {
  const { reducedMotion } = useApp();
  const [go, setGo] = useState(false);
  const from = state.scoreboardFrom;
  const to = state.snapshot;
  const fromRank = ranks(state.teams, from);
  const toRank = ranks(state.teams, to);
  const max = Math.max(1, ...Object.values(to));
  const nextIsFinal = state.index + 1 === state.finalStart;
  const n = state.teams.length;

  useEffect(() => {
    const t = setTimeout(() => setGo(true), reducedMotion ? 50 : 700);
    return () => clearTimeout(t);
  }, [reducedMotion]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="font-display text-[max(1.2vw,14px)] font-bold uppercase tracking-[0.25em] text-primary-light">
            After {state.index + 1} questions
          </div>
          <h1 className="mt-2 font-display text-[clamp(32px,4.4vw,6rem)] font-bold leading-none tracking-tight">Scoreboard</h1>
        </div>
        <div className="flex flex-col items-end gap-4">
          <BrandMark size="sm" />
          <Button size="xl" onClick={onNext} className={`transition-opacity duration-500 ${go ? 'opacity-100' : 'opacity-0'}`}>
            {nextIsFinal ? 'Final round' : 'Next question'} <ArrowRight className="h-6 w-6" />
            <kbd className="ml-1 rounded-md bg-black/20 px-2 py-0.5 font-sans text-xs">Space</kbd>
          </Button>
        </div>
      </div>

      <div className="relative mt-[4vh] flex-1">
        {state.teams.map((t) => {
          const rank = go ? toRank[t.id] : fromRank[t.id];
          const score = go ? to[t.id] : from[t.id];
          const delta = fromRank[t.id] - toRank[t.id];
          return (
            <div
              key={t.id}
              className="absolute inset-x-0 flex items-center gap-[1.4vw] transition-[top] duration-[1200ms] ease-[cubic-bezier(.4,0,.2,1)]"
              style={{ top: `${(rank * 100) / n}%`, height: `${100 / n}%`, paddingBottom: '1.2vh' }}
            >
              <div className="w-[3vw] shrink-0 text-right font-display text-[max(2.4vw,24px)] font-bold tabular-nums text-stage-300">{rank + 1}</div>
              <div className="relative h-full flex-1 overflow-hidden rounded-[1vw] bg-white/5">
                <div
                  className="absolute inset-y-0 left-0 rounded-[1vw] transition-[width] duration-[1200ms] ease-[cubic-bezier(.4,0,.2,1)]"
                  style={{ width: `${Math.max(14, (score / max) * 100)}%`, background: `linear-gradient(90deg, ${t.color}cc, ${t.color})` }}
                />
                <div className="relative flex h-full items-center justify-between gap-4 px-[1.4vw] text-stage-900">
                  <span className="flex min-w-0 items-center gap-3 truncate font-display text-[clamp(16px,1.9vw,3rem)] font-bold">
                    {t.name}
                    {t.streak >= STREAK_THRESHOLD && <Flame className="h-[1.6vw] min-h-4 w-[1.6vw] min-w-4 shrink-0 fill-warning-400 text-warning-600" />}
                  </span>
                </div>
              </div>
              <div className="w-[10vw] shrink-0 text-right">
                <Score to={to[t.id]} from={from[t.id]} go={go} />
              </div>
              <div className="w-[4vw] shrink-0">
                {go && delta !== 0 && (
                  <span
                    className={`flex animate-pop-up items-center gap-0.5 font-display text-[max(1.2vw,14px)] font-bold ${delta > 0 ? 'text-success-400' : 'text-danger-400'}`}
                    style={{ animationDelay: '1100ms' }}
                  >
                    {delta > 0 ? <ArrowUp className="h-[1.4vw] min-h-4 w-[1.4vw] min-w-4" /> : <ArrowDown className="h-[1.4vw] min-h-4 w-[1.4vw] min-w-4" />}
                    {Math.abs(delta)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Score({ from, to, go }: { from: number; to: number; go: boolean }) {
  const { reducedMotion } = useApp();
  const value = useCountUp(go ? to : from, from, 1200, !reducedMotion);
  return <span className="font-display text-[clamp(20px,2.6vw,4rem)] font-bold tabular-nums">{value.toLocaleString()}</span>;
}

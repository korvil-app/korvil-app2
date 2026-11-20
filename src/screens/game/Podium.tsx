import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Crown, Download, Flame, Home, RotateCcw, Target, Timer } from 'lucide-react';
import type { GameState, TeamState } from '@/lib/game';
import { gameStats, rankTeams } from '@/lib/game';
import { sfx } from '@/lib/sound';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/Button';
import { BrandMark } from '@/components/BrandMark';

interface Props {
  state: GameState;
  onExport: () => void;
  onPlayAgain: () => void;
  onHome: () => void;
}

const PLACES = [
  { place: 1, label: '1st', height: '58%', order: 'order-2' },
  { place: 2, label: '2nd', height: '42%', order: 'order-1' },
  { place: 3, label: '3rd', height: '30%', order: 'order-3' },
];

export function Podium({ state, onExport, onPlayAgain, onHome }: Props) {
  const { reducedMotion } = useApp();
  const ranked = rankTeams(state.teams);
  const podiumCount = Math.min(3, ranked.length);
  const [revealed, setRevealed] = useState(0);
  const fired = useRef(false);
  const winner = ranked[0];
  const done = revealed >= podiumCount;
  const stats = gameStats(state);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const speed = reducedMotion ? 0.4 : 1;
    sfx.drumroll(2.4 * speed);
    let t = 2400 * speed;
    for (let i = 0; i < podiumCount; i++) {
      const lastBeforeWinner = i === podiumCount - 2;
      timers.push(
        setTimeout(() => {
          setRevealed(i + 1);
          if (lastBeforeWinner) sfx.drumroll(1.6);
          if (i < podiumCount - 1) sfx.whoosh();
        }, t),
      );
      t += (lastBeforeWinner ? 2200 : 1400) * speed;
    }
    return () => timers.forEach(clearTimeout);
  }, [podiumCount, reducedMotion]);

  useEffect(() => {
    if (!done || fired.current) return;
    fired.current = true;
    sfx.fanfare();
    if (reducedMotion) return;
    const colors = [winner.color, '#FFFFFF', winner.color, '#FFE08A'];
    confetti({ particleCount: 160, spread: 90, origin: { y: 0.55 }, colors, disableForReducedMotion: true });
    const end = Date.now() + 2200;
    const frame = () => {
      confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors, disableForReducedMotion: true });
      confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors, disableForReducedMotion: true });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, [done, reducedMotion, winner.color]);

  // Reveal order: 3rd, 2nd, then 1st.
  const isShown = (place: number) => revealed >= podiumCount - place + 1;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-display text-[max(1.2vw,14px)] font-bold uppercase tracking-[0.25em] text-primary-light">Final results</div>
          <h1 className="mt-2 font-display text-[clamp(32px,4.4vw,6rem)] font-bold leading-none tracking-tight">
            {done ? `${winner.name} win!` : revealed === 0 ? 'Drumroll please\u2026' : 'And the winner is\u2026'}
          </h1>
        </div>
        <BrandMark size="sm" />
      </div>

      <div className="flex min-h-0 flex-1 gap-[3vw] pt-[3vh]">
        <div className="flex flex-1 items-end justify-center gap-[1.5vw]">
          {PLACES.slice(0, podiumCount).map(({ place, label, height, order }) => {
            const team = ranked[place - 1];
            const shown = isShown(place);
            return (
              <div key={place} className={`flex h-full w-[16vw] max-w-xs flex-col items-center justify-end ${order}`}>
                <div className={`mb-[1.5vh] text-center transition-all duration-700 ${shown ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
                  {place === 1 && <Crown className="mx-auto h-[3.5vw] min-h-8 w-[3.5vw] min-w-8 animate-float fill-warning-400 text-warning-400" />}
                  <div className="font-display text-[clamp(18px,2.2vw,3.4rem)] font-bold leading-tight">{team.name}</div>
                  <div className="font-display text-[clamp(16px,1.8vw,2.6rem)] font-bold tabular-nums text-stage-200">{team.score.toLocaleString()} pts</div>
                </div>
                <div
                  className={`relative w-full origin-bottom rounded-t-[1.2vw] transition-transform duration-[900ms] ease-[cubic-bezier(.2,.9,.3,1)] ${shown ? 'scale-y-100' : 'scale-y-[0.04]'}`}
                  style={{ height, background: shown ? `linear-gradient(180deg, ${team.color}, ${team.color}aa)` : 'rgb(255 255 255 / 0.1)' }}
                >
                  <div className="absolute inset-x-0 top-[1.5vw] text-center font-display text-[clamp(28px,4vw,6rem)] font-bold text-stage-900/80">{label}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className={`flex w-[30%] flex-col gap-[1.2vh] transition-all duration-700 ${done ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-8 opacity-0'}`}>
          <StatCard icon={Target} label="Most accurate" team={stats.accurate?.team} value={stats.accurate ? `${stats.accurate.pct}% correct` : '—'} />
          <StatCard icon={Flame} label="Longest streak" team={stats.streak?.team} value={stats.streak ? `${stats.streak.value} in a row` : 'No streaks'} />
          <StatCard icon={Timer} label="Fastest answer" team={stats.fastest?.team} value={stats.fastest ? `${(stats.fastest.ms / 1000).toFixed(1)}s` : '—'} />
          {ranked.length > 3 && (
            <div className="panel px-5 py-3">
              {ranked.slice(3).map((t, i) => (
                <div key={t.id} className="flex items-center gap-3 py-1 text-[max(1vw,13px)]">
                  <span className="w-6 text-stage-400">{i + 4}</span>
                  <span className="h-3 w-3 rounded-full" style={{ background: t.color }} />
                  <span className="flex-1 truncate">{t.name}</span>
                  <span className="font-display font-bold tabular-nums">{t.score.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-auto grid gap-2">
            <Button size="lg" onClick={onPlayAgain}>
              <RotateCcw className="h-5 w-5" /> Play again with same teams
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button size="lg" variant="secondary" onClick={onExport}>
                <Download className="h-5 w-5" /> Export CSV
              </Button>
              <Button size="lg" variant="secondary" onClick={onHome}>
                <Home className="h-5 w-5" /> Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, team, value }: { icon: typeof Target; label: string; team?: TeamState; value: string }) {
  return (
    <div className="panel flex items-center gap-4 px-5 py-4">
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl" style={{ background: team?.color ?? 'rgb(255 255 255 / 0.1)', color: '#1B1446' }}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <div className="text-[max(0.85vw,12px)] uppercase tracking-wider text-stage-300">{label}</div>
        <div className="truncate font-display text-[max(1.3vw,16px)] font-bold">{team?.name ?? '—'}</div>
        <div className="text-[max(0.95vw,13px)] text-stage-200">{value}</div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Medal, RotateCcw, Trophy, UserPlus } from 'lucide-react';
import type { BoothPlay } from '@/types';
import { Button } from '@/components/Button';
import { BOOTH_IDLE_MS } from '@/lib/constants';

interface ResultProps {
  score: number;
  correct: number;
  total: number;
  beaten: number | null;
  onAddName: (name: string) => void;
  onSkip: () => void;
}

export function BoothResult({ score, correct, total, beaten, onAddName, onSkip }: ResultProps) {
  const [name, setName] = useState('');
  const clean = name.trim();

  return (
    <div className="flex h-full flex-col items-center justify-center p-6 text-center">
      <div className="text-lg font-medium uppercase tracking-[0.25em] text-primary-light">Your score</div>
      <div className="mt-2 animate-pop-up font-display text-8xl font-bold leading-none tabular-nums sm:text-9xl">{score}</div>
      <div className="mt-4 text-xl text-stage-200">
        {correct} of {total} correct
      </div>
      <div className="mt-8 max-w-xl animate-fade-up rounded-2xl bg-primary/20 px-8 py-5 font-display text-2xl font-bold sm:text-3xl" style={{ animationDelay: '300ms' }}>
        {beaten === null ? 'You\u2019re today\u2019s first player!' : `You beat ${beaten}% of today\u2019s players`}
      </div>

      <form
        className="mt-10 w-full max-w-md"
        onSubmit={(e) => {
          e.preventDefault();
          if (clean) onAddName(clean);
        }}
      >
        <label htmlFor="booth-name" className="label text-center text-base">Add your name to today&apos;s leaderboard (optional)</label>
        <div className="flex gap-2">
          <input id="booth-name" className="field h-14 text-lg" maxLength={16} value={name} onChange={(e) => setName(e.target.value)} placeholder="First name or nickname" autoComplete="off" />
          <Button type="submit" size="lg" disabled={!clean}>
            <UserPlus className="h-5 w-5" /> Save
          </Button>
        </div>
      </form>
      <Button variant="ghost" size="lg" className="mt-4" onClick={onSkip}>
        No thanks, show the leaderboard
      </Button>
    </div>
  );
}

export function BoothLeaderboard({ plays, highlightId, onPlayAgain }: { plays: BoothPlay[]; highlightId: string | null; onPlayAgain: () => void }) {
  const ranked = [...plays].filter((p) => p.name || p.id === highlightId).sort((a, b) => b.score - a.score);
  const top = ranked.slice(0, 10);
  const mineIdx = ranked.findIndex((p) => p.id === highlightId);

  return (
    <div className="flex h-full flex-col items-center justify-center p-6">
      <Trophy className="h-14 w-14 text-warning-400" />
      <h1 className="mt-4 font-display text-5xl font-bold tracking-tight">Today&apos;s leaderboard</h1>
      <ol className="mt-8 w-full max-w-lg space-y-2">
        {top.map((p, i) => (
          <li
            key={p.id}
            className={`flex animate-fade-up items-center gap-4 rounded-2xl px-5 py-3 text-xl ${p.id === highlightId ? 'bg-primary text-primary-ink' : 'bg-white/5'}`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span className="w-8 font-display font-bold">{i < 3 ? <Medal className={`h-6 w-6 ${['text-warning-400', 'text-stage-200', 'text-[#E3A574]'][i]}`} /> : i + 1}</span>
            <span className="flex-1 truncate">{p.name || 'You'}</span>
            <span className="font-display font-bold tabular-nums">{p.score}</span>
          </li>
        ))}
        {top.length === 0 && <li className="rounded-2xl bg-white/5 px-5 py-6 text-center text-stage-300">No names yet today. Be the first!</li>}
      </ol>
      {mineIdx >= 10 && <div className="mt-4 text-lg text-stage-200">You&apos;re #{mineIdx + 1} today</div>}
      <Button size="xl" className="mt-10" onClick={onPlayAgain}>
        <RotateCcw className="h-6 w-6" /> Play again
      </Button>
      <p className="mt-6 text-sm text-stage-400">Returns to the start screen after {BOOTH_IDLE_MS / 1000} seconds</p>
    </div>
  );
}

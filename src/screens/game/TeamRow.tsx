import { Check, Flame, X } from 'lucide-react';
import type { TeamResult, TeamState } from '@/lib/game';
import { STREAK_THRESHOLD } from '@/lib/constants';
import { useCountUp } from '@/hooks/useCountUp';
import { useApp } from '@/context/AppContext';

interface Props {
  teams: TeamState[];
  selectedId?: string | null;
  submittedIds?: Set<string>;
  results?: TeamResult[];
  onSelect?: (id: string) => void;
}

export function TeamRow({ teams, selectedId, submittedIds, results, onSelect }: Props) {
  return (
    <div className="grid gap-[1vw]" style={{ gridTemplateColumns: `repeat(${teams.length}, minmax(0, 1fr))` }}>
      {teams.map((t, i) => (
        <TeamTile
          key={t.id}
          team={t}
          index={i}
          selected={selectedId === t.id}
          submitted={!!submittedIds?.has(t.id)}
          result={results?.find((r) => r.teamId === t.id)}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

function TeamTile({
  team,
  index,
  selected,
  submitted,
  result,
  onSelect,
}: {
  team: TeamState;
  index: number;
  selected: boolean;
  submitted: boolean;
  result?: TeamResult;
  onSelect?: (id: string) => void;
}) {
  const { reducedMotion } = useApp();
  const score = useCountUp(team.score, result ? team.score - result.points : team.score, 1000, !reducedMotion);
  const hot = team.streak >= STREAK_THRESHOLD;
  const dim = result && !result.correct;

  return (
    <button
      type="button"
      onClick={() => onSelect?.(team.id)}
      disabled={!onSelect}
      aria-pressed={selected}
      aria-label={`${team.name}, ${team.score} points${submitted ? ', answer locked in' : ''}`}
      className={`relative flex min-w-0 flex-col justify-between rounded-[1.2vw] px-[1.1vw] py-[0.9vw] text-left text-stage-900 transition-all duration-300 disabled:cursor-default ${
        selected ? '-translate-y-[0.8vw] shadow-2xl ring-[0.3vw] ring-white' : ''
      } ${dim ? 'opacity-55 saturate-50' : ''}`}
      style={{ background: team.color, boxShadow: selected ? `0 0 3vw ${team.color}88` : undefined }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="grid h-[1.9vw] min-h-6 w-[1.9vw] min-w-6 place-items-center rounded-md bg-stage-900/15 font-display text-[max(0.9vw,12px)] font-bold">
          {index + 1}
        </span>
        <div className="flex items-center gap-1">
          {hot && (
            <span className="flex items-center gap-0.5 rounded-full bg-stage-900 px-[0.6vw] py-[0.15vw] text-[max(0.85vw,11px)] font-bold text-warning-300">
              <Flame className="h-[1.1vw] min-h-3 w-[1.1vw] min-w-3 animate-flicker fill-warning-400" /> {team.streak}
            </span>
          )}
          {submitted && !result && (
            <span className="flex items-center gap-1 rounded-full bg-stage-900 px-[0.6vw] py-[0.15vw] text-[max(0.8vw,11px)] font-bold text-white animate-scale-in">
              <Check className="h-[1vw] min-h-3 w-[1vw] min-w-3" /> In
            </span>
          )}
          {result && !result.correct && <X className="h-[1.6vw] min-h-4 w-[1.6vw] min-w-4" />}
        </div>
      </div>
      <div className="mt-[0.4vw] truncate font-display text-[max(1.15vw,14px)] font-bold leading-tight">{team.name}</div>
      <div className="font-display text-[max(2.2vw,22px)] font-bold leading-none tabular-nums">{score.toLocaleString()}</div>
      {result?.correct && (
        <div
          className="absolute -top-[2.6vw] left-1/2 -translate-x-1/2 animate-pop-up whitespace-nowrap rounded-full bg-white px-[1vw] py-[0.3vw] font-display text-[max(1.6vw,16px)] font-bold text-stage-900 shadow-xl"
          style={{ animationDelay: `${index * 90}ms` }}
        >
          +{result.points}
        </div>
      )}
      {selected && <div className="absolute inset-x-0 -bottom-[1.6vw] text-center text-[max(0.8vw,11px)] font-medium text-white">Choose an answer</div>}
    </button>
  );
}

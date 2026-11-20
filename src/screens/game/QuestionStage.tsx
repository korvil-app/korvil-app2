import { Hash, Pause } from 'lucide-react';
import type { GameState } from '@/lib/game';
import { isFinalQuestion, questionTimeMs } from '@/lib/game';
import { TimerRing } from '@/components/TimerRing';
import { QuestionHeader } from '@/screens/game/QuestionHeader';
import { AnswerGrid } from '@/screens/game/AnswerGrid';
import { TeamRow } from '@/screens/game/TeamRow';

interface Props {
  state: GameState;
  selectedId: string | null;
  onSelectTeam: (id: string) => void;
  onPick: (index: number) => void;
  hint: string | null;
}

export function QuestionStage({ state, selectedId, onSelectTeam, onPick, hint }: Props) {
  const q = state.questions[state.index];
  const total = questionTimeMs(q, state.rules);
  const submitted = new Set(Object.keys(state.submissions));
  const allIn = submitted.size === state.teams.length;

  return (
    <div className="flex h-full flex-col gap-[2vh]">
      <QuestionHeader
        question={q}
        number={state.index + 1}
        total={state.questions.length}
        double={isFinalQuestion(state)}
        right={<TimerRing remainingMs={state.remainingMs} totalMs={total} paused={state.paused} size={Math.max(96, Math.min(window.innerWidth * 0.09, 200))} />}
      />

      <div className={`relative flex min-h-0 flex-1 gap-[2vw] transition ${state.paused ? 'blur-sm' : ''}`}>
        {q.image && (
          <div className="flex w-[34%] shrink-0 items-center justify-center overflow-hidden rounded-[1.4vw] bg-stage-950/50">
            <img src={q.image} alt="" className="h-full w-full object-cover animate-scale-in" />
          </div>
        )}
        <div className="min-h-0 flex-1">
          {q.type === 'number' ? (
            <div className="flex h-full flex-col items-center justify-center rounded-[1.4vw] border-2 border-dashed border-white/15 bg-white/[0.03] text-center">
              <Hash className="h-[5vw] min-h-10 w-[5vw] min-w-10 text-primary-light" />
              <div className="mt-[1vw] font-display text-[clamp(22px,2.8vw,4rem)] font-bold">Closest number wins</div>
              <div className="mt-[0.5vw] text-[max(1.2vw,14px)] text-stage-300">Whisper or write down your guess for the host</div>
            </div>
          ) : (
            <AnswerGrid question={q} onPick={onPick} />
          )}
        </div>
        {state.paused && (
          <div className="absolute inset-0 grid place-items-center">
            <div className="flex items-center gap-4 rounded-3xl bg-stage-950/90 px-[3vw] py-[2vw] font-display text-[clamp(28px,4vw,5rem)] font-bold shadow-2xl">
              <Pause className="h-[4vw] min-h-8 w-[4vw] min-w-8 fill-current" /> Paused
            </div>
          </div>
        )}
      </div>

      <div className="relative pt-[2.4vw]">
        <div className="absolute inset-x-0 top-0 flex h-[2vw] items-center justify-center text-[max(0.95vw,12px)] font-medium">
          {hint ? (
            <span className="animate-fade-up rounded-full bg-warning-400 px-4 py-1 text-stage-900">{hint}</span>
          ) : allIn ? (
            <span className="animate-fade-up rounded-full bg-success-500 px-4 py-1 text-stage-900">All answers in · Press L to reveal</span>
          ) : (
            <span className="text-stage-300">
              {submitted.size} of {state.teams.length} teams locked in
            </span>
          )}
        </div>
        <TeamRow teams={state.teams} selectedId={selectedId} submittedIds={submitted} onSelect={onSelectTeam} />
      </div>
    </div>
  );
}

import { ArrowRight, Lightbulb, Target } from 'lucide-react';
import type { GameState, TeamState } from '@/lib/game';
import { isFinalQuestion } from '@/lib/game';
import { Button } from '@/components/Button';
import { QuestionHeader } from '@/screens/game/QuestionHeader';
import { AnswerGrid } from '@/screens/game/AnswerGrid';
import { TeamRow } from '@/screens/game/TeamRow';

export function RevealStage({ state, onNext }: { state: GameState; onNext: () => void }) {
  const q = state.questions[state.index];
  const last = state.index === state.questions.length - 1;
  const pickedBy: Record<number, TeamState[]> = {};
  for (const t of state.teams) {
    const i = state.submissions[t.id]?.optionIndex;
    if (i !== undefined) (pickedBy[i] ??= []).push(t);
  }
  const winners = state.lastResults.filter((r) => r.correct).length;

  return (
    <div className="flex h-full flex-col gap-[2vh]">
      <QuestionHeader
        question={q}
        number={state.index + 1}
        total={state.questions.length}
        double={isFinalQuestion(state)}
        right={
          <Button size="xl" onClick={onNext} className="animate-fade-up">
            {last ? 'Final results' : 'Next'} <ArrowRight className="h-6 w-6" />
            <kbd className="ml-1 rounded-md bg-black/20 px-2 py-0.5 font-sans text-xs">Space</kbd>
          </Button>
        }
      />

      <div className="flex min-h-0 flex-1 gap-[2vw]">
        {q.image && (
          <div className="w-[28%] shrink-0 overflow-hidden rounded-[1.4vw]">
            <img src={q.image} alt="" className="h-full w-full object-cover" />
          </div>
        )}
        <div className="min-h-0 flex-1">
          {q.type === 'number' ? <NumberReveal state={state} /> : <AnswerGrid question={q} revealed pickedBy={pickedBy} />}
        </div>
        {q.fact && (
          <div className="flex w-[24%] shrink-0 animate-fade-up flex-col justify-center rounded-[1.4vw] border border-warning-400/30 bg-warning-400/10 p-[1.6vw]" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center gap-2 font-display text-[max(1.2vw,14px)] font-bold text-warning-300">
              <Lightbulb className="h-[1.5vw] min-h-4 w-[1.5vw] min-w-4" /> Did you know?
            </div>
            <p className="mt-[0.8vw] text-[clamp(14px,1.35vw,2rem)] leading-normal text-stage-100">{q.fact}</p>
          </div>
        )}
      </div>

      <div className="pt-[3vw]">
        <div className="mb-[0.6vw] text-center text-[max(0.95vw,12px)] text-stage-300">
          {winners === 0 ? 'Nobody got that one!' : winners === state.teams.length ? 'Everyone got it right!' : `${winners} of ${state.teams.length} teams got it right`}
        </div>
        <TeamRow teams={state.teams} results={state.lastResults} />
      </div>
    </div>
  );
}

function NumberReveal({ state }: { state: GameState }) {
  const q = state.questions[state.index];
  const answer = q.answerNumber ?? 0;
  const guesses = state.teams
    .map((t) => ({ team: t, guess: state.submissions[t.id]?.number, result: state.lastResults.find((r) => r.teamId === t.id) }))
    .sort((a, b) => (a.guess === undefined ? 1 : b.guess === undefined ? -1 : Math.abs(a.guess - answer) - Math.abs(b.guess - answer)));

  return (
    <div className="flex h-full gap-[2vw]">
      <div className="flex w-[40%] animate-scale-in flex-col items-center justify-center rounded-[1.4vw] bg-success-500 text-stage-900">
        <Target className="h-[3vw] min-h-8 w-[3vw] min-w-8" />
        <div className="mt-[0.5vw] text-[max(1.1vw,14px)] font-medium">The answer is</div>
        <div className="font-display text-[clamp(48px,7vw,10rem)] font-bold leading-none tabular-nums">{answer.toLocaleString()}</div>
      </div>
      <div className="flex flex-1 flex-col justify-center gap-[0.6vw]">
        {guesses.map(({ team, guess, result }, i) => (
          <div
            key={team.id}
            className={`flex animate-fade-up items-center gap-[1vw] rounded-[0.9vw] px-[1.2vw] py-[0.6vw] ${result?.correct ? 'bg-white/15 ring-2 ring-success-400' : 'bg-white/5'}`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <span className="h-[1.4vw] min-h-4 w-[1.4vw] min-w-4 shrink-0 rounded-full" style={{ background: team.color }} />
            <span className="flex-1 truncate font-display text-[max(1.3vw,15px)] font-bold">{team.name}</span>
            <span className="font-display text-[max(1.6vw,18px)] font-bold tabular-nums">{guess === undefined ? '—' : guess.toLocaleString()}</span>
            <span className="w-[7vw] text-right text-[max(0.9vw,12px)] text-stage-300">
              {guess === undefined ? 'no guess' : result?.correct ? 'Closest!' : `off by ${Math.abs(guess - answer).toLocaleString()}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

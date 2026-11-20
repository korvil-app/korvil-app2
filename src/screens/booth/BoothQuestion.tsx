import { useEffect, useRef, useState } from 'react';
import { Check, Flame, X } from 'lucide-react';
import type { Question } from '@/types';
import type { TeamResult } from '@/lib/game';
import { ANSWER_STYLES } from '@/lib/constants';
import { AnswerShape } from '@/components/AnswerShape';
import { TimerRing } from '@/components/TimerRing';

interface Props {
  question: Question;
  number: number;
  total: number;
  remainingMs: number;
  totalMs: number;
  score: number;
  result: TeamResult | null;
  picked: number | null;
  onPick: (i: number) => void;
}

export function BoothQuestion({ question, number, total, remainingMs, totalMs, score, result, picked, onPick }: Props) {
  const revealed = result !== null;
  const prevScore = useRef(score);
  const [bump, setBump] = useState(false);

  useEffect(() => {
    if (score !== prevScore.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 400);
      prevScore.current = score;
      return () => clearTimeout(t);
    }
  }, [score]);

  return (
    <div className="flex h-full flex-col gap-5 p-5 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <span key={i} className={`h-2.5 rounded-full transition-all ${i < number - 1 ? 'w-8 bg-primary' : i === number - 1 ? 'w-12 bg-white' : 'w-8 bg-white/15'}`} />
          ))}
        </div>
        <div className={`font-display text-3xl font-bold tabular-nums transition-transform ${bump ? 'scale-125 text-success-400' : ''}`}>{score} pts</div>
      </div>

      <div className="flex items-start gap-5">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium uppercase tracking-widest text-primary-light">
            Question {number} of {total} · {question.category}
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl [text-wrap:balance]">{question.prompt}</h1>
        </div>
        <TimerRing remainingMs={remainingMs} totalMs={totalMs} size={96} />
      </div>

      {question.image && (
        <div className="min-h-0 flex-1 overflow-hidden rounded-2xl landscape:hidden">
          <img src={question.image} alt="" className="h-full max-h-[32vh] w-full object-cover" />
        </div>
      )}

      <div className="flex min-h-0 flex-1 gap-5">
        {question.image && (
          <div className="hidden w-2/5 shrink-0 overflow-hidden rounded-2xl landscape:block">
            <img src={question.image} alt="" className="h-full w-full object-cover" />
          </div>
        )}
        <div className={`grid flex-1 auto-rows-fr gap-3 sm:gap-4 ${question.options.length > 2 ? 'grid-cols-1 landscape:grid-cols-2' : 'grid-cols-2'}`}>
          {question.options.map((opt, i) => {
            const s = ANSWER_STYLES[i];
            const isCorrect = revealed && i === question.correctIndex;
            const isWrongPick = revealed && picked === i && !isCorrect;
            const faded = revealed && !isCorrect && !isWrongPick;
            return (
              <button
                key={i}
                disabled={revealed}
                onClick={() => onPick(i)}
                className={`relative flex min-h-[72px] items-center gap-4 rounded-2xl px-5 py-4 text-left text-white shadow-lg transition-all duration-300 active:scale-[0.97] ${
                  isCorrect ? 'scale-[1.02] ring-4 ring-white' : ''
                } ${isWrongPick ? 'animate-shake ring-4 ring-danger-300' : ''} ${faded ? 'opacity-25' : ''}`}
                style={{ background: s.bg }}
              >
                <AnswerShape shape={s.shape} className="h-8 w-8 shrink-0 opacity-90" />
                <span className="font-display text-2xl font-bold leading-tight sm:text-3xl">{opt}</span>
                {isCorrect && <Check className="ml-auto h-9 w-9 shrink-0 animate-pop-up" strokeWidth={3} />}
                {isWrongPick && <X className="ml-auto h-9 w-9 shrink-0" strokeWidth={3} />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-14 text-center">
        {result && (
          <div className={`inline-flex animate-pop-up items-center gap-3 rounded-full px-6 py-3 font-display text-2xl font-bold ${result.correct ? 'bg-success-500 text-stage-900' : 'bg-white/10 text-white'}`}>
            {result.correct ? (
              <>
                +{result.points}
                {result.streakBonus > 0 && (
                  <span className="flex items-center gap-1 text-lg">
                    <Flame className="h-5 w-5 fill-current" /> streak!
                  </span>
                )}
              </>
            ) : picked === null ? (
              "Time's up!"
            ) : (
              'Not quite!'
            )}
          </div>
        )}
      </div>
    </div>
  );
}

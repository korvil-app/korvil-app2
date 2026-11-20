import { Check } from 'lucide-react';
import type { Question } from '@/types';
import type { TeamState } from '@/lib/game';
import { ANSWER_STYLES } from '@/lib/constants';
import { AnswerShape } from '@/components/AnswerShape';

interface Props {
  question: Question;
  onPick?: (index: number) => void;
  revealed?: boolean;
  pickedBy?: Record<number, TeamState[]>;
  compact?: boolean;
}

export function AnswerGrid({ question, onPick, revealed, pickedBy, compact }: Props) {
  const two = question.options.length <= 2;
  return (
    <div className={`grid h-full grid-cols-2 gap-[1.2vw] ${compact ? '' : 'auto-rows-fr'}`}>
      {question.options.map((opt, i) => {
        const style = ANSWER_STYLES[i];
        const correct = revealed && i === question.correctIndex;
        const wrong = revealed && i !== question.correctIndex;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onPick?.(i)}
            disabled={!onPick}
            className={`group relative flex min-h-0 items-center gap-[1.2vw] overflow-hidden rounded-[1.2vw] px-[1.6vw] py-[1.2vw] text-left text-white shadow-lg transition-all duration-500 disabled:cursor-default enabled:hover:brightness-110 enabled:active:scale-[0.98] ${
              correct ? 'scale-[1.02] ring-[0.35vw] ring-white' : ''
            } ${wrong ? 'opacity-25 saturate-50' : ''} ${two ? 'justify-center' : ''}`}
            style={{ background: style.bg, boxShadow: correct ? `0 0 4vw ${style.bg}` : undefined }}
          >
            <div className="flex shrink-0 items-center gap-[0.6vw]">
              <AnswerShape shape={style.shape} className="h-[2.4vw] min-h-6 w-[2.4vw] min-w-6 opacity-90" />
              <span className="font-display text-[max(1.6vw,18px)] font-bold opacity-80">{style.letter}</span>
            </div>
            <span className="font-display text-[clamp(18px,2.3vw,3.4rem)] font-bold leading-tight">{opt}</span>
            {correct && (
              <span className="ml-auto grid h-[3vw] min-h-8 w-[3vw] min-w-8 shrink-0 animate-pop-up place-items-center rounded-full bg-white text-stage-900">
                <Check className="h-2/3 w-2/3" strokeWidth={3} />
              </span>
            )}
            {pickedBy?.[i]?.length ? (
              <div className="absolute bottom-[0.6vw] right-[0.8vw] flex gap-[0.3vw]">
                {pickedBy[i].map((t) => (
                  <span key={t.id} className="h-[1.4vw] min-h-4 w-[1.4vw] min-w-4 rounded-full border-2 border-white animate-scale-in" style={{ background: t.color }} title={t.name} />
                ))}
              </div>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

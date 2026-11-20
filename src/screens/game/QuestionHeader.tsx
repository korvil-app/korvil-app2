import type { ReactNode } from 'react';
import { Zap } from 'lucide-react';
import type { Question } from '@/types';
import { BrandMark } from '@/components/BrandMark';
import { TYPE_LABELS } from '@/lib/constants';

interface Props {
  question: Question;
  number: number;
  total: number;
  double: boolean;
  right?: ReactNode;
}

export function QuestionHeader({ question, number, total, double, right }: Props) {
  return (
    <div className="flex items-start justify-between gap-[2vw]">
      <div className="min-w-0 flex-1">
        <div className="mb-[1.2vw] flex flex-wrap items-center gap-[0.8vw]">
          <span className="font-display text-[max(1.2vw,14px)] font-bold text-stage-200">
            Question {number}
            <span className="text-stage-400"> / {total}</span>
          </span>
          <span className="rounded-full bg-primary/25 px-[1vw] py-[0.3vw] text-[max(0.95vw,12px)] font-medium text-primary-light">
            {question.category || TYPE_LABELS[question.type]}
          </span>
          {question.type !== 'mc' && (
            <span className="rounded-full border border-white/15 px-[1vw] py-[0.3vw] text-[max(0.95vw,12px)] text-stage-200">{TYPE_LABELS[question.type]}</span>
          )}
          {double && (
            <span className="flex items-center gap-1 rounded-full bg-warning-400 px-[1vw] py-[0.3vw] text-[max(0.95vw,12px)] font-bold text-stage-900">
              <Zap className="h-[1vw] min-h-3 w-[1vw] min-w-3 fill-current" /> Double points
            </span>
          )}
        </div>
        <h1 className="font-display text-[clamp(26px,3.6vw,5.5rem)] font-bold leading-[1.12] tracking-tight [text-wrap:balance]">{question.prompt}</h1>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-[1vw]">
        <div className="opacity-80">
          <BrandMark size="sm" />
        </div>
        {right}
      </div>
    </div>
  );
}

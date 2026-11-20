import type { BoothPlay, Question } from '@/types';
import { shuffle, isSameDay } from '@/lib/utils';
import { BOOTH_QUESTIONS } from '@/lib/constants';

export function pickBoothQuestions(questions: Question[], rand: () => number = Math.random): Question[] {
  const tappable = questions.filter((q) => q.type !== 'number');
  return shuffle(tappable, rand).slice(0, BOOTH_QUESTIONS);
}

export function todaysPlays(plays: BoothPlay[], now = Date.now()): BoothPlay[] {
  return plays.filter((p) => isSameDay(p.date, now));
}

export function percentBeaten(score: number, otherScores: number[]): number | null {
  if (otherScores.length === 0) return null;
  const beaten = otherScores.filter((s) => s < score).length;
  return Math.round((beaten / otherScores.length) * 100);
}

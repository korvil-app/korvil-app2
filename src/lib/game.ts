import type { GameRules, Question, TeamConfig } from '@/types';
import { BASE_POINTS, FINAL_ROUND_SIZE, MAX_SPEED_BONUS, SCOREBOARD_EVERY, STREAK_BONUS, STREAK_THRESHOLD } from '@/lib/constants';

export interface TeamState extends TeamConfig {
  score: number;
  streak: number;
  bestStreak: number;
  correct: number;
  fastestMs: number | null;
}

export interface Submission {
  optionIndex?: number;
  number?: number;
  remainingMs: number;
  totalMs: number;
}

export interface TeamResult {
  teamId: string;
  submitted: boolean;
  correct: boolean;
  base: number;
  speed: number;
  streakBonus: number;
  multiplier: number;
  points: number;
  responseMs: number | null;
  newStreak: number;
  answerLabel: string;
}

export type Phase = 'question' | 'reveal' | 'scoreboard' | 'final-intro' | 'podium';

export interface GameState {
  questions: Question[];
  rules: GameRules;
  teams: TeamState[];
  index: number;
  phase: Phase;
  submissions: Record<string, Submission>;
  remainingMs: number;
  paused: boolean;
  lastResults: TeamResult[];
  snapshot: Record<string, number>;
  scoreboardFrom: Record<string, number>;
  finalStart: number;
  log: { question: Question; results: TeamResult[]; skipped: boolean }[];
}

export type GameAction =
  | { type: 'submit'; teamId: string; optionIndex?: number; number?: number }
  | { type: 'clear'; teamId: string }
  | { type: 'tick'; ms: number }
  | { type: 'pause' }
  | { type: 'lock' }
  | { type: 'skip' }
  | { type: 'next' };

export const questionTimeMs = (q: Question, rules: Pick<GameRules, 'timer'>) => (q.timeLimit ?? rules.timer) * 1000;

export function computeFinalStart(count: number, doubleFinal: boolean): number {
  if (!doubleFinal) return Number.POSITIVE_INFINITY;
  return Math.max(1, count - FINAL_ROUND_SIZE);
}

export function isFinalQuestion(state: Pick<GameState, 'index' | 'finalStart'>, index = state.index) {
  return index >= state.finalStart;
}

function answerLabel(q: Question, s?: Submission): string {
  if (!s) return '—';
  if (q.type === 'number') return s.number === undefined ? '—' : String(s.number);
  return s.optionIndex === undefined ? '—' : 'ABCD'[s.optionIndex];
}

export function scoreQuestion(
  question: Question,
  teams: Pick<TeamState, 'id' | 'streak'>[],
  submissions: Record<string, Submission>,
  rules: Pick<GameRules, 'speedBonus' | 'streakBonus'>,
  multiplier: number,
): TeamResult[] {
  let closest = Number.POSITIVE_INFINITY;
  if (question.type === 'number' && question.answerNumber !== undefined) {
    for (const t of teams) {
      const n = submissions[t.id]?.number;
      if (n !== undefined) closest = Math.min(closest, Math.abs(n - question.answerNumber));
    }
  }

  return teams.map((team) => {
    const sub = submissions[team.id];
    const submitted = !!sub && (question.type === 'number' ? sub.number !== undefined : sub.optionIndex !== undefined);
    let correct = false;
    if (submitted && sub) {
      correct =
        question.type === 'number'
          ? question.answerNumber !== undefined && Math.abs((sub.number as number) - question.answerNumber) === closest
          : sub.optionIndex === question.correctIndex;
    }
    const newStreak = correct ? team.streak + 1 : 0;
    const base = correct ? BASE_POINTS : 0;
    const speed =
      correct && rules.speedBonus && question.type !== 'number' && sub
        ? Math.round((MAX_SPEED_BONUS * Math.max(0, sub.remainingMs)) / sub.totalMs)
        : 0;
    const streakBonus = correct && rules.streakBonus && newStreak >= STREAK_THRESHOLD ? STREAK_BONUS : 0;
    const points = (base + speed + streakBonus) * multiplier;
    return {
      teamId: team.id,
      submitted,
      correct,
      base,
      speed,
      streakBonus,
      multiplier,
      points,
      responseMs: submitted && sub && question.type !== 'number' ? sub.totalMs - sub.remainingMs : null,
      newStreak,
      answerLabel: answerLabel(question, sub),
    };
  });
}

export function createGame(questions: Question[], teams: TeamConfig[], rules: GameRules): GameState {
  const snapshot = Object.fromEntries(teams.map((t) => [t.id, 0]));
  return {
    questions,
    rules,
    teams: teams.map((t) => ({ ...t, score: 0, streak: 0, bestStreak: 0, correct: 0, fastestMs: null })),
    index: 0,
    phase: 'question',
    submissions: {},
    remainingMs: questionTimeMs(questions[0], rules),
    paused: false,
    lastResults: [],
    snapshot,
    scoreboardFrom: snapshot,
    finalStart: computeFinalStart(questions.length, rules.doubleFinal),
    log: [],
  };
}

function startQuestion(state: GameState, index: number): GameState {
  return {
    ...state,
    index,
    phase: 'question',
    submissions: {},
    paused: false,
    lastResults: [],
    remainingMs: questionTimeMs(state.questions[index], state.rules),
  };
}

function scores(state: GameState) {
  return Object.fromEntries(state.teams.map((t) => [t.id, t.score]));
}

function advance(state: GameState): GameState {
  const next = state.index + 1;
  if (next >= state.questions.length) return { ...state, phase: 'podium', paused: false };
  const finalStartsNext = next === state.finalStart;
  if (finalStartsNext || next % SCOREBOARD_EVERY === 0) {
    const current = scores(state);
    return { ...state, phase: 'scoreboard', scoreboardFrom: state.snapshot, snapshot: current, paused: false };
  }
  return startQuestion(state, next);
}

function lock(state: GameState): GameState {
  const q = state.questions[state.index];
  const multiplier = isFinalQuestion(state) ? 2 : 1;
  const results = scoreQuestion(q, state.teams, state.submissions, state.rules, multiplier);
  const teams = state.teams.map((t) => {
    const r = results.find((x) => x.teamId === t.id)!;
    const fastest =
      r.correct && r.responseMs !== null ? Math.min(r.responseMs, t.fastestMs ?? Number.POSITIVE_INFINITY) : t.fastestMs;
    return {
      ...t,
      score: t.score + r.points,
      streak: r.newStreak,
      bestStreak: Math.max(t.bestStreak, r.newStreak),
      correct: t.correct + (r.correct ? 1 : 0),
      fastestMs: fastest,
    };
  });
  return {
    ...state,
    teams,
    phase: 'reveal',
    paused: false,
    lastResults: results,
    log: [...state.log, { question: q, results, skipped: false }],
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'submit': {
      if (state.phase !== 'question') return state;
      const q = state.questions[state.index];
      const totalMs = questionTimeMs(q, state.rules);
      return {
        ...state,
        submissions: {
          ...state.submissions,
          [action.teamId]: { optionIndex: action.optionIndex, number: action.number, remainingMs: state.remainingMs, totalMs },
        },
      };
    }
    case 'clear': {
      if (state.phase !== 'question') return state;
      const rest = { ...state.submissions };
      delete rest[action.teamId];
      return { ...state, submissions: rest };
    }
    case 'tick': {
      if (state.phase !== 'question' || state.paused) return state;
      const remainingMs = Math.max(0, state.remainingMs - action.ms);
      const ticked = { ...state, remainingMs };
      return remainingMs === 0 ? lock(ticked) : ticked;
    }
    case 'pause':
      return state.phase === 'question' ? { ...state, paused: !state.paused } : state;
    case 'lock':
      return state.phase === 'question' ? lock(state) : state;
    case 'skip':
      if (state.phase !== 'question') return state;
      return advance({ ...state, log: [...state.log, { question: state.questions[state.index], results: [], skipped: true }] });
    case 'next':
      if (state.phase === 'reveal') return advance(state);
      if (state.phase === 'scoreboard') {
        const next = state.index + 1;
        return next === state.finalStart ? { ...state, phase: 'final-intro' } : startQuestion(state, next);
      }
      if (state.phase === 'final-intro') return startQuestion(state, state.index + 1);
      return state;
  }
}

export function rankTeams<T extends { id: string; score: number }>(teams: T[]): T[] {
  return [...teams].sort((a, b) => b.score - a.score);
}

export function gameStats(state: GameState) {
  const played = state.log.filter((l) => !l.skipped).length || 1;
  const pick = <K>(fn: (t: TeamState) => K, better: (a: K, b: K) => boolean) =>
    state.teams.reduce<TeamState | null>((best, t) => (best === null || better(fn(t), fn(best)) ? t : best), null);
  const accurate = pick((t) => t.correct, (a, b) => a > b);
  const streak = pick((t) => t.bestStreak, (a, b) => a > b);
  const withFast = state.teams.filter((t) => t.fastestMs !== null);
  const fastest = withFast.length ? withFast.reduce((a, b) => ((b.fastestMs as number) < (a.fastestMs as number) ? b : a)) : null;
  return {
    accurate: accurate ? { team: accurate, pct: Math.round((accurate.correct / played) * 100) } : null,
    streak: streak && streak.bestStreak > 0 ? { team: streak, value: streak.bestStreak } : null,
    fastest: fastest ? { team: fastest, ms: fastest.fastestMs as number } : null,
  };
}

export function resultsCsv(state: GameState, packTitle: string, company: string): string {
  const esc = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const ranked = rankTeams(state.teams);
  const rows: (string | number)[][] = [
    ['Company', company],
    ['Quiz pack', packTitle],
    ['Date', new Date().toLocaleString()],
    [],
    ['Rank', 'Team', 'Score', 'Correct', 'Longest streak', 'Fastest correct (s)'],
    ...ranked.map((t, i) => [i + 1, t.name, t.score, t.correct, t.bestStreak, t.fastestMs === null ? '' : (t.fastestMs / 1000).toFixed(1)]),
    [],
    ['#', 'Question', 'Correct answer', ...state.teams.flatMap((t) => [`${t.name} answer`, `${t.name} points`])],
    ...state.log.map((l, i) => {
      const q = l.question;
      const correct = q.type === 'number' ? String(q.answerNumber ?? '') : `${'ABCD'[q.correctIndex]}: ${q.options[q.correctIndex] ?? ''}`;
      return [
        i + 1,
        q.prompt,
        l.skipped ? 'Skipped' : correct,
        ...state.teams.flatMap((t) => {
          const r = l.results.find((x) => x.teamId === t.id);
          return [r?.answerLabel ?? '—', r?.points ?? 0];
        }),
      ];
    }),
  ];
  return rows.map((r) => r.map(esc).join(',')).join('\n');
}

export const TEAM_COLORS = [
  { name: 'Coral', hex: '#FF7A6B' },
  { name: 'Amber', hex: '#FFB020' },
  { name: 'Lime', hex: '#A3E635' },
  { name: 'Teal', hex: '#2DD4BF' },
  { name: 'Sky', hex: '#38BDF8' },
  { name: 'Pink', hex: '#F472B6' },
];

export const ANSWER_STYLES = [
  { letter: 'A', bg: '#E11D48', shape: 'triangle' },
  { letter: 'B', bg: '#2563EB', shape: 'diamond' },
  { letter: 'C', bg: '#C2410C', shape: 'circle' },
  { letter: 'D', bg: '#047857', shape: 'square' },
] as const;

export const COVER_COLORS = ['#7C3AED', '#2563EB', '#0D9488', '#DC2626', '#D97706', '#DB2777', '#059669', '#0F172A'];

export const TYPE_LABELS: Record<string, string> = {
  mc: 'Multiple choice',
  tf: 'True / False',
  number: 'Closest number wins',
  image: 'Image round',
};

export const BASE_POINTS = 100;
export const MAX_SPEED_BONUS = 50;
export const STREAK_BONUS = 50;
export const STREAK_THRESHOLD = 3;
export const FINAL_ROUND_SIZE = 3;
export const SCOREBOARD_EVERY = 5;
export const BOOTH_QUESTIONS = 5;
export const BOOTH_TIMER = 15;
export const BOOTH_IDLE_MS = 20000;

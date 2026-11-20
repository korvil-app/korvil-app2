export type QuestionType = 'mc' | 'tf' | 'number' | 'image';

export interface Question {
  id: string;
  type: QuestionType;
  category: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  answerNumber?: number;
  image?: string;
  fact?: string;
  timeLimit?: number;
  draft?: boolean;
}

export interface QuizPack {
  id: string;
  title: string;
  description: string;
  coverColor: string;
  questions: Question[];
  builtIn?: boolean;
  updatedAt: number;
}

export interface Settings {
  companyName: string;
  logo?: string;
  primaryColor: string;
  sound: boolean;
  reducedMotion: boolean;
  boothPackId?: string;
}

export interface TeamConfig {
  id: string;
  name: string;
  color: string;
}

export interface GameRules {
  timer: 10 | 20 | 30;
  speedBonus: boolean;
  streakBonus: boolean;
  questionCount: number;
  doubleFinal: boolean;
  shuffle: boolean;
}

export interface GameRecord {
  id: string;
  date: number;
  packId: string;
  packTitle: string;
  teams: { name: string; color: string; score: number }[];
}

export interface BoothPlay {
  id: string;
  date: number;
  score: number;
  name?: string;
  packTitle: string;
}

export type Route =
  | { name: 'home' }
  | { name: 'setup'; packId?: string; teams?: TeamConfig[]; rules?: GameRules }
  | { name: 'game'; packId: string; teams: TeamConfig[]; rules: GameRules }
  | { name: 'booth' }
  | { name: 'packs' }
  | { name: 'editor'; packId: string }
  | { name: 'settings' };

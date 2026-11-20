import type { BoothPlay, GameRecord, QuizPack, Settings } from '@/types';
import { DEMO_PACKS } from '@/data/packs';

const KEYS = {
  packs: 'huddle.packs.v1',
  settings: 'huddle.settings.v1',
  history: 'huddle.history.v1',
  booth: 'huddle.booth.v1',
};

export const DEFAULT_SETTINGS: Settings = {
  companyName: 'Huddle Trivia',
  primaryColor: '#7C3AED',
  sound: true,
  reducedMotion: false,
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function loadPacks(): QuizPack[] {
  const stored = read<QuizPack[] | null>(KEYS.packs, null);
  if (!Array.isArray(stored)) return structuredClone(DEMO_PACKS);
  return stored;
}

export const savePacks = (packs: QuizPack[]) => write(KEYS.packs, packs);

export function loadSettings(): Settings {
  return { ...DEFAULT_SETTINGS, ...read<Partial<Settings>>(KEYS.settings, {}) };
}

export const saveSettings = (s: Settings) => write(KEYS.settings, s);

export const loadHistory = () => read<GameRecord[]>(KEYS.history, []);
export const saveHistory = (h: GameRecord[]) => write(KEYS.history, h.slice(0, 30));

export const loadBoothPlays = () => read<BoothPlay[]>(KEYS.booth, []);
export const saveBoothPlays = (p: BoothPlay[]) => write(KEYS.booth, p.slice(-500));

export function resetAllData() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
}

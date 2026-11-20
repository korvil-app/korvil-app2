import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { BoothPlay, GameRecord, QuizPack, Route, Settings } from '@/types';
import {
  loadBoothPlays,
  loadHistory,
  loadPacks,
  loadSettings,
  resetAllData,
  saveBoothPlays,
  saveHistory,
  savePacks,
  saveSettings,
} from '@/lib/storage';
import { applyBrandColor } from '@/lib/utils';
import { setSoundEnabled } from '@/lib/sound';
import { DEMO_PACKS } from '@/data/packs';

interface Toast {
  id: number;
  message: string;
  tone: 'success' | 'error' | 'info';
}

interface AppContextValue {
  route: Route;
  navigate: (r: Route) => void;
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
  packs: QuizPack[];
  upsertPack: (pack: QuizPack) => void;
  deletePack: (id: string) => void;
  history: GameRecord[];
  addHistory: (r: GameRecord) => void;
  boothPlays: BoothPlay[];
  addBoothPlay: (p: BoothPlay) => void;
  updateBoothPlay: (id: string, patch: Partial<BoothPlay>) => void;
  resetAll: () => void;
  reducedMotion: boolean;
  toasts: Toast[];
  notify: (message: string, tone?: Toast['tone']) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function useSystemReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>({ name: 'home' });
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [packs, setPacks] = useState<QuizPack[]>(loadPacks);
  const [history, setHistory] = useState<GameRecord[]>(loadHistory);
  const [boothPlays, setBoothPlays] = useState<BoothPlay[]>(loadBoothPlays);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const systemReduced = useSystemReducedMotion();
  const reducedMotion = settings.reducedMotion || systemReduced;

  const notify = useCallback((message: string, tone: Toast['tone'] = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  }, []);

  const persist = useCallback(
    (ok: boolean) => {
      if (!ok) notify('Your browser storage is full. Try removing large images from packs.', 'error');
    },
    [notify],
  );

  useEffect(() => {
    applyBrandColor(settings.primaryColor);
    setSoundEnabled(settings.sound);
    document.documentElement.classList.toggle('reduce-motion', settings.reducedMotion);
    persist(saveSettings(settings));
  }, [settings, persist]);

  useEffect(() => persist(savePacks(packs)), [packs, persist]);
  useEffect(() => persist(saveHistory(history)), [history, persist]);
  useEffect(() => persist(saveBoothPlays(boothPlays)), [boothPlays, persist]);

  const navigate = useCallback((r: Route) => {
    setRoute(r);
    window.scrollTo({ top: 0 });
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      route,
      navigate,
      settings,
      updateSettings: (patch) => setSettings((s) => ({ ...s, ...patch })),
      packs,
      upsertPack: (pack) =>
        setPacks((list) => {
          const updated = { ...pack, updatedAt: Date.now() };
          return list.some((p) => p.id === pack.id) ? list.map((p) => (p.id === pack.id ? updated : p)) : [...list, updated];
        }),
      deletePack: (id) => setPacks((list) => list.filter((p) => p.id !== id)),
      history,
      addHistory: (r) => setHistory((h) => [r, ...h]),
      boothPlays,
      addBoothPlay: (p) => setBoothPlays((list) => [...list, p]),
      updateBoothPlay: (id, patch) => setBoothPlays((list) => list.map((p) => (p.id === id ? { ...p, ...patch } : p))),
      resetAll: () => {
        resetAllData();
        setSettings(loadSettings());
        setPacks(structuredClone(DEMO_PACKS));
        setHistory([]);
        setBoothPlays([]);
      },
      reducedMotion,
      toasts,
      notify,
    }),
    [route, navigate, settings, packs, history, boothPlays, reducedMotion, toasts, notify],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

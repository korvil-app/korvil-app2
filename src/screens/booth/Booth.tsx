import { useEffect, useRef, useState } from 'react';
import { LogOut, Settings2 } from 'lucide-react';
import type { Question } from '@/types';
import type { Submission, TeamResult } from '@/lib/game';
import { scoreQuestion } from '@/lib/game';
import { percentBeaten, pickBoothQuestions, todaysPlays } from '@/lib/booth';
import { BOOTH_IDLE_MS, BOOTH_TIMER } from '@/lib/constants';
import { sfx } from '@/lib/sound';
import { toggleFullscreen, uid } from '@/lib/utils';
import { useApp } from '@/context/AppContext';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';
import { BoothAttract } from '@/screens/booth/BoothAttract';
import { BoothQuestion } from '@/screens/booth/BoothQuestion';
import { BoothLeaderboard, BoothResult } from '@/screens/booth/BoothResult';

type Phase = 'attract' | 'play' | 'result' | 'board';

interface Run {
  questions: Question[];
  index: number;
  remainingMs: number;
  result: TeamResult | null;
  picked: number | null;
  score: number;
  streak: number;
  correct: number;
}

const TOTAL_MS = BOOTH_TIMER * 1000;
const SOLO = 'solo';

export function Booth() {
  const { packs, settings, updateSettings, boothPlays, addBoothPlay, updateBoothPlay, navigate, notify } = useApp();
  const playable = packs.filter((p) => p.questions.some((q) => q.type !== 'number'));
  const pack = playable.find((p) => p.id === settings.boothPackId) ?? playable.find((p) => p.id === 'demo_coffee') ?? playable[0];
  const [phase, setPhase] = useState<Phase>('attract');
  const [run, setRun] = useState<Run | null>(null);
  const [playId, setPlayId] = useState<string | null>(null);
  const [beaten, setBeaten] = useState<number | null>(null);
  const [menu, setMenu] = useState(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout>>();
  const lastActivity = useRef(Date.now());
  const today = todaysPlays(boothPlays);

  const start = () => {
    if (!pack) return notify('Add a quiz pack with multiple choice questions to use booth mode.', 'error');
    void toggleFullscreen(true);
    sfx.lock();
    setRun({ questions: pickBoothQuestions(pack.questions), index: 0, remainingMs: TOTAL_MS, result: null, picked: null, score: 0, streak: 0, correct: 0 });
    setPhase('play');
  };

  const answer = (picked: number | null) => {
    if (!run || run.result) return;
    const q = run.questions[run.index];
    const subs: Record<string, Submission> = picked === null ? {} : { [SOLO]: { optionIndex: picked, remainingMs: run.remainingMs, totalMs: TOTAL_MS } };
    const [result] = scoreQuestion(q, [{ id: SOLO, streak: run.streak }], subs, { speedBonus: true, streakBonus: true }, 1);
    if (result.correct) sfx.correct();
    else if (picked === null) sfx.timeUp();
    else sfx.wrong();
    setRun({ ...run, result, picked, score: run.score + result.points, streak: result.newStreak, correct: run.correct + (result.correct ? 1 : 0) });
  };

  useEffect(() => {
    if (phase !== 'play' || !run || run.result) return;
    let last = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      const dt = now - last;
      last = now;
      setRun((r) => (r && !r.result ? { ...r, remainingMs: Math.max(0, r.remainingMs - dt) } : r));
    }, 100);
    return () => clearInterval(id);
  }, [phase, run?.index, run?.result]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (phase === 'play' && run && !run.result && run.remainingMs === 0) answer(null);
  }, [phase, run]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (phase !== 'play' || !run?.result) return;
    const t = setTimeout(() => {
      if (run.index + 1 < run.questions.length) {
        setRun({ ...run, index: run.index + 1, remainingMs: TOTAL_MS, result: null, picked: null });
        return;
      }
      const id = uid('play');
      setBeaten(percentBeaten(run.score, today.map((p) => p.score)));
      addBoothPlay({ id, date: Date.now(), score: run.score, packTitle: pack?.title ?? '' });
      setPlayId(id);
      setPhase('result');
      sfx.fanfare();
    }, 1900);
    return () => clearTimeout(t);
  }, [run?.result]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    lastActivity.current = Date.now();
    if (phase !== 'result' && phase !== 'board') return;
    const mark = () => (lastActivity.current = Date.now());
    window.addEventListener('pointerdown', mark);
    window.addEventListener('keydown', mark);
    const id = setInterval(() => {
      if (Date.now() - lastActivity.current >= BOOTH_IDLE_MS) {
        setPhase('attract');
        setRun(null);
        setPlayId(null);
      }
    }, 1000);
    return () => {
      clearInterval(id);
      window.removeEventListener('pointerdown', mark);
      window.removeEventListener('keydown', mark);
    };
  }, [phase]);

  const q = run?.questions[run.index];

  return (
    <div className="stage-bg fixed inset-0 select-none overflow-hidden">
      <div className="stage-grid h-full">
        {phase === 'attract' && <BoothAttract packTitle={pack?.title ?? 'No playable pack'} today={today} onStart={start} />}
        {phase === 'play' && run && q && (
          <BoothQuestion
            key={run.index}
            question={q}
            number={run.index + 1}
            total={run.questions.length}
            remainingMs={run.remainingMs}
            totalMs={TOTAL_MS}
            score={run.score}
            result={run.result}
            picked={run.picked}
            onPick={(i) => answer(i)}
          />
        )}
        {phase === 'result' && run && (
          <BoothResult
            score={run.score}
            correct={run.correct}
            total={run.questions.length}
            beaten={beaten}
            onAddName={(name) => {
              if (playId) updateBoothPlay(playId, { name });
              setPhase('board');
            }}
            onSkip={() => setPhase('board')}
          />
        )}
        {phase === 'board' && <BoothLeaderboard plays={today} highlightId={playId} onPlayAgain={start} />}
      </div>

      <button
        className="absolute left-0 top-0 grid h-16 w-16 place-items-center text-white/10 transition hover:text-white/40"
        aria-label="Host menu (press and hold)"
        onPointerDown={() => (holdTimer.current = setTimeout(() => setMenu(true), 1200))}
        onPointerUp={() => clearTimeout(holdTimer.current)}
        onPointerLeave={() => clearTimeout(holdTimer.current)}
        onKeyDown={(e) => e.key === 'Enter' && setMenu(true)}
        onClick={(e) => e.stopPropagation()}
      >
        <Settings2 className="h-5 w-5" />
      </button>

      <Modal
        open={menu}
        onClose={() => setMenu(false)}
        title="Booth host menu"
        footer={
          <Button
            variant="danger"
            onClick={() => {
              void toggleFullscreen(false);
              navigate({ name: 'home' });
            }}
          >
            <LogOut className="h-4 w-4" /> Exit booth mode
          </Button>
        }
      >
        <label className="label" htmlFor="booth-pack">Quiz pack for booth visitors</label>
        <select
          id="booth-pack"
          className="field"
          value={pack?.id ?? ''}
          onChange={(e) => {
            updateSettings({ boothPackId: e.target.value });
            setPhase('attract');
            setRun(null);
          }}
        >
          {playable.map((p) => (
            <option key={p.id} value={p.id} className="bg-stage-900">
              {p.title}
            </option>
          ))}
        </select>
        <p className="mt-3 text-sm text-stage-300">
          Each player gets {Math.min(5, pack?.questions.filter((x) => x.type !== 'number').length ?? 0)} random questions, {BOOTH_TIMER} seconds each. Today: {today.length} plays.
        </p>
        <p className="mt-2 text-sm text-stage-400">Tip: press and hold the top-left corner to open this menu.</p>
      </Modal>
    </div>
  );
}

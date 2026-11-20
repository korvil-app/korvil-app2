import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { ArrowRight, Zap } from 'lucide-react';
import type { GameRules, QuizPack, TeamConfig } from '@/types';
import { createGame, gameReducer, rankTeams, resultsCsv } from '@/lib/game';
import { sfx } from '@/lib/sound';
import { downloadFile, shuffle, slugify, toggleFullscreen, uid } from '@/lib/utils';
import { FINAL_ROUND_SIZE } from '@/lib/constants';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { QuestionStage } from '@/screens/game/QuestionStage';
import { RevealStage } from '@/screens/game/RevealStage';
import { ScoreboardRace } from '@/screens/game/ScoreboardRace';
import { Podium } from '@/screens/game/Podium';
import { HostBar } from '@/screens/game/HostBar';
import { ShortcutsOverlay } from '@/screens/game/ShortcutsOverlay';
import { NumberEntry } from '@/screens/game/NumberEntry';

interface Props {
  packId: string;
  teams: TeamConfig[];
  rules: GameRules;
}

export function GameShow(props: Props) {
  const { packs, navigate } = useApp();
  const pack = packs.find((p) => p.id === props.packId);
  if (!pack || pack.questions.length === 0) {
    return (
      <div className="stage-bg grid min-h-screen place-items-center p-8 text-center">
        <div>
          <h1 className="font-display text-3xl font-bold">This quiz pack is no longer available</h1>
          <Button className="mt-6" onClick={() => navigate({ name: 'setup' })}>Choose another pack</Button>
        </div>
      </div>
    );
  }
  return <Show {...props} pack={pack} />;
}

function buildQuestions(pack: QuizPack, rules: GameRules) {
  const list = rules.shuffle ? shuffle(pack.questions) : pack.questions;
  return list.slice(0, Math.max(1, Math.min(rules.questionCount, list.length)));
}

function Show({ pack, teams, rules }: Props & { pack: QuizPack }) {
  const { settings, updateSettings, navigate, addHistory, notify } = useApp();
  const [state, dispatch] = useReducer(gameReducer, null, () => createGame(buildQuestions(pack, rules), teams, rules));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [numberTeamId, setNumberTeamId] = useState<string | null>(null);
  const [help, setHelp] = useState(false);
  const [quit, setQuit] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const hintTimer = useRef<ReturnType<typeof setTimeout>>();
  const saved = useRef(false);
  const q = state.questions[state.index];
  const secs = Math.ceil(state.remainingMs / 1000);

  const flash = useCallback((msg: string) => {
    setHint(msg);
    clearTimeout(hintTimer.current);
    hintTimer.current = setTimeout(() => setHint(null), 1800);
  }, []);

  useEffect(() => {
    if (state.phase !== 'question' || state.paused) return;
    let last = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      dispatch({ type: 'tick', ms: now - last });
      last = now;
    }, 100);
    return () => clearInterval(id);
  }, [state.phase, state.paused, state.index]);

  const prevSecs = useRef(secs);
  useEffect(() => {
    if (state.phase === 'question' && !state.paused && secs < prevSecs.current && secs > 0) {
      if (secs <= 5) sfx.tickUrgent();
      else if (secs <= 10) sfx.tick();
    }
    prevSecs.current = secs;
  }, [secs, state.phase, state.paused]);

  useEffect(() => {
    setSelectedId(null);
    setNumberTeamId(null);
    if (state.phase === 'reveal') {
      const anyCorrect = state.lastResults.some((r) => r.correct);
      const delay = state.remainingMs === 0 ? 450 : 0;
      if (delay) sfx.timeUp();
      const t = setTimeout(() => (anyCorrect ? sfx.correct() : sfx.wrong()), delay);
      return () => clearTimeout(t);
    }
    if (state.phase === 'scoreboard') sfx.whoosh();
    if (state.phase === 'final-intro') sfx.fanfare();
    if (state.phase === 'podium' && !saved.current) {
      saved.current = true;
      addHistory({
        id: uid('game'),
        date: Date.now(),
        packId: pack.id,
        packTitle: pack.title,
        teams: rankTeams(state.teams).map((t) => ({ name: t.name, color: t.color, score: t.score })),
      });
    }
    // Only react to phase/question transitions, not every score tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, state.index]);

  const selectTeam = (id: string) => {
    if (state.phase !== 'question') return;
    sfx.select();
    if (q.type === 'number') {
      setSelectedId(id);
      setNumberTeamId(id);
      return;
    }
    setSelectedId((cur) => (cur === id ? null : id));
  };

  const pick = (optionIndex: number) => {
    if (state.phase !== 'question') return;
    if (optionIndex >= q.options.length) return;
    if (!selectedId) return flash('Select a team first (keys 1–6 or click a team)');
    dispatch({ type: 'submit', teamId: selectedId, optionIndex });
    sfx.lock();
    setSelectedId(null);
  };

  const exit = () => {
    void toggleFullscreen(false);
    navigate({ name: 'home' });
  };

  const keyHandler = useRef<(e: KeyboardEvent) => void>(() => {});
  keyHandler.current = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('input, textarea, select, [role="dialog"]') && !help) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const key = e.key.toLowerCase();
    if (key === 'enter' && target.tagName === 'BUTTON') return;
    if (help) {
      if (key === 'escape' || key === '?') setHelp(false);
      return;
    }
    if (quit || numberTeamId) return;

    if (key === '?') return setHelp(true);
    if (key === 'm') return updateSettings({ sound: !settings.sound });
    if (key === 'f') return void toggleFullscreen();
    if (key === 'q') return setQuit(true);

    if (state.phase === 'question') {
      if (/^[1-6]$/.test(key)) {
        const team = state.teams[Number(key) - 1];
        if (team) selectTeam(team.id);
        return;
      }
      if (['a', 'b', 'c', 'd'].includes(key) && q.type !== 'number') {
        e.preventDefault();
        return pick('abcd'.indexOf(key));
      }
      if ((key === 'backspace' || key === 'delete') && selectedId) {
        dispatch({ type: 'clear', teamId: selectedId });
        setSelectedId(null);
        return;
      }
      if (key === 'escape') return setSelectedId(null);
      if (key === 'l' || key === 'enter') {
        e.preventDefault();
        return dispatch({ type: 'lock' });
      }
      if (key === 's') return dispatch({ type: 'skip' });
      if (key === 'p') return dispatch({ type: 'pause' });
    }
    if (key === ' ' && ['reveal', 'scoreboard', 'final-intro'].includes(state.phase)) {
      e.preventDefault();
      dispatch({ type: 'next' });
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => keyHandler.current(e);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const numberTeam = state.teams.find((t) => t.id === numberTeamId);

  return (
    <div className="stage-bg flex h-screen w-screen flex-col overflow-hidden">
      <div className="stage-grid flex min-h-0 flex-1 flex-col px-[2.4vw] pt-[2.2vw]">
        <div key={`${state.phase}-${state.index}`} className="min-h-0 flex-1 animate-fade-up">
          {state.phase === 'question' && <QuestionStage state={state} selectedId={selectedId} onSelectTeam={selectTeam} onPick={pick} hint={hint} />}
          {state.phase === 'reveal' && <RevealStage state={state} onNext={() => dispatch({ type: 'next' })} />}
          {state.phase === 'scoreboard' && <ScoreboardRace state={state} onNext={() => dispatch({ type: 'next' })} />}
          {state.phase === 'final-intro' && <FinalIntro count={state.questions.length - state.finalStart} onNext={() => dispatch({ type: 'next' })} />}
          {state.phase === 'podium' && (
            <Podium
              state={state}
              onExport={() => {
                downloadFile(`${slugify(settings.companyName)}-${slugify(pack.title)}-results.csv`, resultsCsv(state, pack.title, settings.companyName), 'text/csv');
                notify('Results exported', 'success');
              }}
              onPlayAgain={() => navigate({ name: 'setup', packId: pack.id, teams, rules })}
              onHome={exit}
            />
          )}
        </div>
        <div className="py-[0.8vw]">
          <HostBar
            phase={state.phase}
            paused={state.paused}
            sound={settings.sound}
            onLock={() => dispatch({ type: 'lock' })}
            onSkip={() => dispatch({ type: 'skip' })}
            onPause={() => dispatch({ type: 'pause' })}
            onMute={() => updateSettings({ sound: !settings.sound })}
            onHelp={() => setHelp(true)}
            onFullscreen={() => void toggleFullscreen()}
            onQuit={() => setQuit(true)}
          />
        </div>
      </div>

      {numberTeam && state.phase === 'question' && (
        <NumberEntry
          team={numberTeam}
          initial={state.submissions[numberTeam.id]?.number}
          onSubmit={(n) => {
            dispatch({ type: 'submit', teamId: numberTeam.id, number: n });
            sfx.lock();
            setNumberTeamId(null);
            setSelectedId(null);
          }}
          onClear={() => {
            dispatch({ type: 'clear', teamId: numberTeam.id });
            setNumberTeamId(null);
            setSelectedId(null);
          }}
          onCancel={() => {
            setNumberTeamId(null);
            setSelectedId(null);
          }}
        />
      )}
      {help && <ShortcutsOverlay onClose={() => setHelp(false)} />}
      <Modal
        open={quit}
        onClose={() => setQuit(false)}
        title="Quit this show?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setQuit(false)}>Keep playing</Button>
            <Button variant="danger" onClick={exit}>Quit to home</Button>
          </>
        }
      >
        <p className="text-stage-200">Scores from this game won&apos;t be saved to your recent games.</p>
      </Modal>
    </div>
  );
}

function FinalIntro({ count, onNext }: { count: number; onNext: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="grid h-[12vw] min-h-24 w-[12vw] min-w-24 animate-pop-up place-items-center rounded-full bg-warning-400 text-stage-900 shadow-[0_0_8vw_rgba(251,191,36,0.5)]">
        <Zap className="h-1/2 w-1/2 fill-current" />
      </div>
      <div className="mt-[3vh] font-display text-[max(1.4vw,16px)] font-bold uppercase tracking-[0.3em] text-warning-300">Final round</div>
      <h1 className="mt-2 font-display text-[clamp(40px,7vw,9rem)] font-bold leading-none tracking-tight">Double points!</h1>
      <p className="mt-[2vh] max-w-3xl text-[clamp(16px,1.8vw,2.4rem)] text-stage-200">
        The last {Math.min(count, FINAL_ROUND_SIZE)} questions are worth twice as much. Anything can happen.
      </p>
      <Button size="xl" className="mt-[5vh]" onClick={onNext}>
        Let&apos;s go <ArrowRight className="h-6 w-6" />
        <kbd className="ml-1 rounded-md bg-black/20 px-2 py-0.5 font-sans text-xs">Space</kbd>
      </Button>
    </div>
  );
}

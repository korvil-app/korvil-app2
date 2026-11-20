import { useMemo, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Check, Dices, Flame, Gauge, Layers, Minus, Play, Plus, Shuffle, Timer, Users, X, Zap } from 'lucide-react';
import type { GameRules, Route, TeamConfig } from '@/types';
import { useApp } from '@/context/AppContext';
import { PageShell } from '@/components/PageShell';
import { Button } from '@/components/Button';
import { TEAM_COLORS, FINAL_ROUND_SIZE } from '@/lib/constants';
import { randomTeamName } from '@/lib/names';
import { toggleFullscreen, uid } from '@/lib/utils';
import { PackCover } from '@/screens/packs/PackCover';

const STEPS = [
  { label: 'Quiz pack', icon: Layers },
  { label: 'Teams', icon: Users },
  { label: 'Rules', icon: Gauge },
];

function defaultTeams(): TeamConfig[] {
  const a = randomTeamName();
  return [
    { id: uid('team'), name: a, color: TEAM_COLORS[0].hex },
    { id: uid('team'), name: randomTeamName([a]), color: TEAM_COLORS[1].hex },
  ];
}

export function Setup({ initial }: { initial: Extract<Route, { name: 'setup' }> }) {
  const { packs, navigate } = useApp();
  const [step, setStep] = useState(initial.teams ? 2 : 0);
  const [packId, setPackId] = useState<string | undefined>(initial.packId ?? packs[0]?.id);
  const [teams, setTeams] = useState<TeamConfig[]>(initial.teams ?? defaultTeams);
  const pack = packs.find((p) => p.id === packId);
  const maxQ = pack?.questions.length ?? 0;
  const [rules, setRules] = useState<GameRules>(
    initial.rules ?? { timer: 20, speedBonus: true, streakBonus: true, questionCount: Math.min(maxQ, 12), doubleFinal: true, shuffle: false },
  );
  const count = Math.min(rules.questionCount || maxQ, maxQ);

  const teamError = useMemo(() => {
    if (teams.length < 2) return 'Add at least 2 teams.';
    if (teams.some((t) => !t.name.trim())) return 'Every team needs a name.';
    const names = teams.map((t) => t.name.trim().toLowerCase());
    if (new Set(names).size !== names.length) return 'Team names must be different.';
    return null;
  }, [teams]);
  const packError = !pack ? 'Choose a quiz pack.' : pack.questions.length < 3 ? 'This pack needs at least 3 questions.' : null;

  const updateTeam = (id: string, patch: Partial<TeamConfig>) => setTeams((list) => list.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const setColor = (id: string, color: string) =>
    setTeams((list) => {
      const current = list.find((t) => t.id === id)!.color;
      return list.map((t) => (t.id === id ? { ...t, color } : t.color === color ? { ...t, color: current } : t));
    });

  const addTeam = () => {
    const used = teams.map((t) => t.color);
    const color = TEAM_COLORS.find((c) => !used.includes(c.hex))!.hex;
    setTeams((list) => [...list, { id: uid('team'), name: randomTeamName(list.map((t) => t.name)), color }]);
  };

  const start = () => {
    if (!pack || packError || teamError) return;
    void toggleFullscreen(true);
    navigate({ name: 'game', packId: pack.id, teams: teams.map((t) => ({ ...t, name: t.name.trim() })), rules: { ...rules, questionCount: count } });
  };

  const canNext = step === 0 ? !packError : step === 1 ? !teamError : true;

  return (
    <PageShell title="Set up your show" back={() => (step === 0 ? navigate({ name: 'home' }) : setStep(step - 1))}>
      <ol className="mb-8 flex flex-wrap gap-2">
        {STEPS.map((s, i) => (
          <li key={s.label}>
            <button
              onClick={() => (i < step || canNext ? setStep(i) : undefined)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                i === step ? 'bg-primary text-primary-ink' : i < step ? 'bg-white/10 text-white' : 'bg-white/5 text-stage-400'
              }`}
            >
              {i < step ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
              {i + 1}. {s.label}
            </button>
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="grid animate-fade-up gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {packs.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setPackId(p.id);
                setRules((r) => ({ ...r, questionCount: Math.min(p.questions.length, 12) }));
              }}
              className={`panel group overflow-hidden text-left transition hover:-translate-y-1 ${p.id === packId ? 'border-primary ring-2 ring-primary' : 'hover:border-white/25'}`}
            >
              <PackCover pack={p} />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="font-display text-lg font-bold leading-tight">{p.title}</div>
                  {p.id === packId && <Check className="h-5 w-5 shrink-0 text-primary-light" />}
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-stage-300">{p.description}</p>
                <div className="mt-3 text-sm text-stage-400">{p.questions.length} questions</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {step === 1 && (
        <div className="animate-fade-up space-y-3">
          {teams.map((t, i) => (
            <div key={t.id} className="panel flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl font-display text-xl font-bold text-stage-900" style={{ background: t.color }}>
                  {i + 1}
                </div>
                <input
                  className="field font-display text-lg"
                  value={t.name}
                  maxLength={24}
                  onChange={(e) => updateTeam(t.id, { name: e.target.value })}
                  aria-label={`Team ${i + 1} name`}
                />
                <Button variant="secondary" size="md" className="shrink-0" onClick={() => updateTeam(t.id, { name: randomTeamName(teams.map((x) => x.name)) })} title="Random fun name">
                  <Dices className="h-4 w-4" /> <span className="hidden md:inline">Random</span>
                </Button>
              </div>
              <div className="flex items-center gap-2">
                {TEAM_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => setColor(t.id, c.hex)}
                    className={`h-8 w-8 rounded-full transition hover:scale-110 ${t.color === c.hex ? 'ring-[3px] ring-white ring-offset-2 ring-offset-stage-900' : ''}`}
                    style={{ background: c.hex }}
                    aria-label={`${c.name} for ${t.name}`}
                  />
                ))}
                <button
                  onClick={() => setTeams((list) => list.filter((x) => x.id !== t.id))}
                  disabled={teams.length <= 2}
                  className="ml-2 rounded-lg p-2 text-stage-400 transition hover:bg-white/10 hover:text-white disabled:opacity-30"
                  aria-label={`Remove ${t.name}`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
          {teams.length < 6 && (
            <button onClick={addTeam} className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/15 py-5 text-stage-300 transition hover:border-primary hover:text-white">
              <Plus className="h-5 w-5" /> Add team ({teams.length}/6)
            </button>
          )}
        </div>
      )}

      {step === 2 && pack && (
        <div className="grid animate-fade-up gap-4 lg:grid-cols-2">
          <RuleCard icon={Timer} title="Time per question" desc="Questions with their own time limit keep it.">
            <div className="flex gap-2">
              {([10, 20, 30] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setRules({ ...rules, timer: s })}
                  className={`h-12 flex-1 rounded-xl font-display text-lg font-bold transition ${rules.timer === s ? 'bg-primary text-primary-ink' : 'bg-white/10 hover:bg-white/20'}`}
                >
                  {s}s
                </button>
              ))}
            </div>
          </RuleCard>
          <RuleCard icon={Layers} title="Number of questions" desc={`This pack has ${maxQ}.`}>
            <div className="flex items-center gap-3">
              <Button variant="secondary" onClick={() => setRules({ ...rules, questionCount: Math.max(3, count - 1) })} aria-label="Fewer questions">
                <Minus className="h-4 w-4" />
              </Button>
              <div className="w-16 text-center font-display text-3xl font-bold tabular-nums">{count}</div>
              <Button variant="secondary" onClick={() => setRules({ ...rules, questionCount: Math.min(maxQ, count + 1) })} aria-label="More questions">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </RuleCard>
          <RuleToggle icon={Zap} title="Speed bonus" desc="100 points for a correct answer, plus up to +50 for answering fast." value={rules.speedBonus} onChange={(v) => setRules({ ...rules, speedBonus: v })} />
          <RuleToggle icon={Flame} title="Streak bonus" desc="+50 on every correct answer once a team gets 3 or more in a row." value={rules.streakBonus} onChange={(v) => setRules({ ...rules, streakBonus: v })} />
          <RuleToggle icon={Play} title="Double points final round" desc={`The last ${Math.min(FINAL_ROUND_SIZE, count - 1)} questions are worth double.`} value={rules.doubleFinal} onChange={(v) => setRules({ ...rules, doubleFinal: v })} />
          <RuleToggle icon={Shuffle} title="Shuffle questions" desc="Play questions in a random order." value={rules.shuffle} onChange={(v) => setRules({ ...rules, shuffle: v })} />
        </div>
      )}

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
        <div className="text-sm text-danger-300">{step === 0 ? packError : step === 1 ? teamError : null}</div>
        <div className="flex gap-3">
          {step > 0 && (
            <Button variant="ghost" size="lg" onClick={() => setStep(step - 1)}>
              <ArrowLeft className="h-5 w-5" /> Back
            </Button>
          )}
          {step < 2 ? (
            <Button size="lg" disabled={!canNext} onClick={() => setStep(step + 1)}>
              Continue <ArrowRight className="h-5 w-5" />
            </Button>
          ) : (
            <Button size="xl" onClick={start} disabled={!!packError || !!teamError}>
              <Play className="h-6 w-6 fill-current" /> Start show
            </Button>
          )}
        </div>
      </div>
    </PageShell>
  );
}

function RuleCard({ icon: Icon, title, desc, children }: { icon: typeof Timer; title: string; desc: string; children: ReactNode }) {
  return (
    <div className="panel flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <Icon className="mt-1 h-6 w-6 shrink-0 text-primary-light" />
        <div>
          <div className="font-display text-lg font-bold">{title}</div>
          <div className="text-sm text-stage-300">{desc}</div>
        </div>
      </div>
      <div className="sm:w-56">{children}</div>
    </div>
  );
}

function RuleToggle({ icon, title, desc, value, onChange }: { icon: typeof Timer; title: string; desc: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <RuleCard icon={icon} title={title} desc={desc}>
      <div className="flex rounded-xl bg-white/10 p-1">
        {[true, false].map((v) => (
          <button
            key={String(v)}
            onClick={() => onChange(v)}
            className={`h-10 flex-1 rounded-lg text-sm font-medium transition ${value === v ? 'bg-primary text-primary-ink' : 'text-stage-200 hover:text-white'}`}
          >
            {v ? 'On' : 'Off'}
          </button>
        ))}
      </div>
    </RuleCard>
  );
}

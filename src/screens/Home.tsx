import { BookOpen, Clock, MonitorPlay, Play, Settings as SettingsIcon, Tablet, Trophy } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { PageShell } from '@/components/PageShell';
import { Button } from '@/components/Button';

export function Home() {
  const { navigate, history, packs, settings } = useApp();

  const tiles = [
    { label: 'Booth mode', desc: 'Solo touchscreen play for trade shows', icon: Tablet, onClick: () => navigate({ name: 'booth' }) },
    { label: 'Quiz packs', desc: `${packs.length} packs ready to play or edit`, icon: BookOpen, onClick: () => navigate({ name: 'packs' }) },
    { label: 'Settings', desc: 'Branding, sound and motion', icon: SettingsIcon, onClick: () => navigate({ name: 'settings' }) },
  ];

  return (
    <PageShell>
      <section className="relative mt-6 grid items-center gap-12 lg:mt-12 lg:grid-cols-[1.2fr_1fr]">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-stage-200">
            <MonitorPlay className="h-4 w-4 text-primary-light" /> Big-screen team quiz show
          </span>
          <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl">
            Get the whole room
            <span className="block bg-gradient-to-r from-primary-light via-[#F472B6] to-[#FFB020] bg-clip-text text-transparent">playing together.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-stage-300 sm:text-xl">
            Run a {settings.companyName === 'Huddle Trivia' ? '' : `${settings.companyName} `}game show from one laptop. Up to six teams, timed questions, streak bonuses and a podium finale.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button size="xl" onClick={() => navigate({ name: 'setup' })}>
              <Play className="h-6 w-6 fill-current" /> New game
            </Button>
            <Button size="xl" variant="secondary" onClick={() => navigate({ name: 'booth' })}>
              <Tablet className="h-6 w-6" /> Booth mode (solo)
            </Button>
          </div>
        </div>
        <HeroArt />
      </section>

      <section className="mt-20 grid gap-4 sm:grid-cols-3">
        {tiles.map((t, i) => (
          <button
            key={t.label}
            onClick={t.onClick}
            className="panel group flex animate-fade-up items-center gap-4 p-6 text-left transition hover:-translate-y-1 hover:border-primary/50 hover:bg-white/[0.07]"
            style={{ animationDelay: `${100 + i * 80}ms` }}
          >
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/20 text-primary-light transition group-hover:bg-primary group-hover:text-primary-ink">
              <t.icon className="h-6 w-6" />
            </div>
            <div>
              <div className="font-display text-lg font-bold">{t.label}</div>
              <div className="text-sm text-stage-300">{t.desc}</div>
            </div>
          </button>
        ))}
      </section>

      <section className="mt-16">
        <h2 className="flex items-center gap-2 font-display text-2xl font-bold">
          <Clock className="h-5 w-5 text-stage-300" /> Recent games
        </h2>
        {history.length === 0 ? (
          <div className="panel mt-4 p-8 text-center text-stage-300">No games yet. Your finished shows will appear here.</div>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {history.slice(0, 6).map((g) => {
              const winner = g.teams[0];
              return (
                <div key={g.id} className="panel flex items-center gap-4 p-5">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl" style={{ background: winner?.color, color: '#1B1446' }}>
                    <Trophy className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{g.packTitle}</div>
                    <div className="truncate text-sm text-stage-300">
                      {winner?.name} won with {winner?.score.toLocaleString()} pts · {g.teams.length} teams
                    </div>
                  </div>
                  <div className="shrink-0 text-right text-sm text-stage-400">
                    {new Date(g.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </PageShell>
  );
}

function HeroArt() {
  const colors = ['#FF7A6B', '#FFB020', '#A3E635', '#2DD4BF', '#38BDF8', '#F472B6'];
  const heights = [52, 78, 64, 100, 70, 44];
  return (
    <div className="relative mx-auto hidden aspect-square w-full max-w-md lg:block" aria-hidden="true">
      <div className="absolute inset-8 rounded-[40px] border border-white/10 bg-stage-800/60 shadow-2xl shadow-primary/20" />
      <div className="absolute inset-x-16 top-16 animate-float rounded-2xl bg-white/5 p-5 backdrop-blur">
        <div className="h-3 w-24 rounded-full bg-primary-light/60" />
        <div className="mt-3 h-4 w-full rounded-full bg-white/30" />
        <div className="mt-2 h-4 w-2/3 rounded-full bg-white/30" />
      </div>
      <div className="absolute inset-x-16 bottom-16 flex h-40 items-end gap-3">
        {colors.map((c, i) => (
          <div
            key={c}
            className="flex-1 origin-bottom animate-rise rounded-t-xl"
            style={{ background: c, height: `${heights[i]}%`, animationDelay: `${300 + i * 120}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

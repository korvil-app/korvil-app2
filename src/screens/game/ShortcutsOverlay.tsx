import { Keyboard } from 'lucide-react';

const GROUPS: { title: string; items: [string, string][] }[] = [
  {
    title: 'Answering',
    items: [
      ['1 – 6', 'Select a team'],
      ['A – D', 'Lock in the selected team\u2019s answer'],
      ['Backspace', 'Clear the selected team\u2019s answer'],
      ['Esc', 'Deselect team / close'],
    ],
  },
  {
    title: 'Show flow',
    items: [
      ['L or Enter', 'Lock answers and reveal'],
      ['Space', 'Next question / continue'],
      ['P', 'Pause or resume the timer'],
      ['S', 'Skip this question'],
    ],
  },
  {
    title: 'Display',
    items: [
      ['M', 'Mute or unmute sound'],
      ['F', 'Toggle full screen'],
      ['Q', 'Quit the show'],
      ['?', 'Show this help'],
    ],
  },
];

export function ShortcutsOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-stage-950/85 p-6 backdrop-blur" onClick={onClose} role="dialog" aria-modal="true" aria-label="Keyboard shortcuts">
      <div className="w-full max-w-4xl animate-scale-in rounded-3xl border border-white/10 bg-stage-800 p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          <Keyboard className="h-7 w-7 text-primary-light" />
          <h2 className="font-display text-3xl font-bold">Host shortcuts</h2>
        </div>
        <p className="mt-2 text-stage-300">Tip: you can also click a team tile, then click an answer tile. For closest-number questions, selecting a team opens a number box.</p>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {GROUPS.map((g) => (
            <div key={g.title}>
              <div className="mb-3 text-sm font-medium uppercase tracking-wider text-stage-400">{g.title}</div>
              <ul className="space-y-3">
                {g.items.map(([k, d]) => (
                  <li key={k} className="flex items-start gap-3">
                    <kbd className="min-w-[4.5rem] shrink-0 rounded-lg border border-white/20 bg-stage-950 px-2 py-1 text-center font-display text-sm font-bold">{k}</kbd>
                    <span className="text-sm text-stage-100">{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center text-sm text-stage-400">Press Esc or ? to close</div>
      </div>
    </div>
  );
}

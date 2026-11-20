import { useEffect, useRef, useState } from 'react';
import type { TeamState } from '@/lib/game';
import { Button } from '@/components/Button';

interface Props {
  team: TeamState;
  initial?: number;
  onSubmit: (n: number) => void;
  onClear: () => void;
  onCancel: () => void;
}

export function NumberEntry({ team, initial, onSubmit, onClear, onCancel }: Props) {
  const [value, setValue] = useState(initial === undefined ? '' : String(initial));
  const input = useRef<HTMLInputElement>(null);
  const n = Number(value);
  const valid = value.trim() !== '' && Number.isFinite(n);

  useEffect(() => input.current?.focus(), []);

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-stage-950/70 p-6 backdrop-blur-sm" onClick={onCancel}>
      <form
        className="w-full max-w-md animate-scale-in rounded-3xl border-2 bg-stage-800 p-6 shadow-2xl"
        style={{ borderColor: team.color }}
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) onSubmit(n);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onCancel();
          e.stopPropagation();
        }}
      >
        <div className="flex items-center gap-3">
          <span className="h-4 w-4 rounded-full" style={{ background: team.color }} />
          <h2 className="font-display text-xl font-bold">{team.name}&apos;s guess</h2>
        </div>
        <input
          ref={input}
          type="password"
          inputMode="decimal"
          autoComplete="off"
          value={value}
          onChange={(e) => setValue(e.target.value.replace(/[^0-9.,-]/g, '').replace(/,/g, ''))}
          className="field mt-4 h-20 text-center font-display text-4xl font-bold"
          placeholder="0"
          aria-label={`${team.name} number guess`}
        />
        <p className="mt-2 text-center text-xs text-stage-400">Digits stay hidden on screen until the reveal</p>
        <div className="mt-5 flex gap-2">
          {initial !== undefined && (
            <Button type="button" variant="ghost" onClick={onClear}>
              Clear
            </Button>
          )}
          <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={!valid}>
            Lock in
          </Button>
        </div>
      </form>
    </div>
  );
}

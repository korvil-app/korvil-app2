import type { ReactNode } from 'react';
import { Keyboard, Lock, Maximize, Pause, Play, SkipForward, Volume2, VolumeX, X } from 'lucide-react';
import type { Phase } from '@/lib/game';

interface Props {
  phase: Phase;
  paused: boolean;
  sound: boolean;
  onLock: () => void;
  onSkip: () => void;
  onPause: () => void;
  onMute: () => void;
  onHelp: () => void;
  onFullscreen: () => void;
  onQuit: () => void;
}

function HostButton({ onClick, label, kbd, children, active }: { onClick: () => void; label: string; kbd?: string; children: ReactNode; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      title={kbd ? `${label} (${kbd})` : label}
      aria-label={label}
      className={`flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition ${
        active ? 'bg-warning-400 text-stage-900' : 'bg-white/[0.07] text-stage-200 hover:bg-white/15 hover:text-white'
      }`}
    >
      {children}
      {kbd && <kbd className="rounded bg-black/25 px-1.5 py-0.5 font-sans text-[10px] opacity-80">{kbd}</kbd>}
    </button>
  );
}

export function HostBar({ phase, paused, sound, onLock, onSkip, onPause, onMute, onHelp, onFullscreen, onQuit }: Props) {
  const q = phase === 'question';
  return (
    <div className="flex h-11 items-center justify-between gap-3 opacity-70 transition-opacity hover:opacity-100 focus-within:opacity-100">
      <button onClick={onHelp} className="flex items-center gap-2 text-xs text-stage-400 transition hover:text-white">
        <Keyboard className="h-4 w-4" /> Press <kbd className="rounded bg-white/10 px-1.5 py-0.5">?</kbd> for host shortcuts
      </button>
      <div className="flex items-center gap-1.5">
        {q && (
          <>
            <HostButton onClick={onLock} label="Lock answers" kbd="L">
              <Lock className="h-3.5 w-3.5" /> Lock answers
            </HostButton>
            <HostButton onClick={onSkip} label="Skip question" kbd="S">
              <SkipForward className="h-3.5 w-3.5" /> Skip
            </HostButton>
            <HostButton onClick={onPause} label={paused ? 'Resume' : 'Pause'} kbd="P" active={paused}>
              {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />} {paused ? 'Resume' : 'Pause'}
            </HostButton>
            <span className="mx-1 h-5 w-px bg-white/10" />
          </>
        )}
        <HostButton onClick={onMute} label={sound ? 'Mute' : 'Unmute'} kbd="M">
          {sound ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
        </HostButton>
        <HostButton onClick={onFullscreen} label="Full screen" kbd="F">
          <Maximize className="h-3.5 w-3.5" />
        </HostButton>
        <HostButton onClick={onQuit} label="Quit show" kbd="Q">
          <X className="h-3.5 w-3.5" />
        </HostButton>
      </div>
    </div>
  );
}

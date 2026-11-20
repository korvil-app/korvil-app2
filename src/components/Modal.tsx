import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'md' | 'lg' | 'xl';
  side?: boolean;
}

const WIDTHS = { md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

export function Modal({ open, onClose, title, children, footer, size = 'md', side = false }: Props) {
  const panel = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        closeRef.current();
      }
    };
    window.addEventListener('keydown', onKey, true);
    requestAnimationFrame(() => panel.current?.querySelector<HTMLElement>('input, textarea, select, button')?.focus());
    return () => {
      window.removeEventListener('keydown', onKey, true);
      prev?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className={`fixed inset-0 z-50 flex ${side ? 'justify-end' : 'items-center justify-center p-4'}`} role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-stage-950/80 backdrop-blur-sm animate-fade-up" onClick={onClose} />
      <div
        ref={panel}
        className={`relative flex w-full flex-col border border-white/10 bg-stage-800 shadow-2xl ${
          side ? 'h-full max-w-2xl animate-fade-up' : `max-h-[90vh] ${WIDTHS[size]} rounded-3xl animate-scale-in`
        }`}
      >
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-4">
          <h2 className="font-display text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-stage-300 transition hover:bg-white/10 hover:text-white" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="scrollbar-thin flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex flex-wrap items-center justify-end gap-3 border-t border-white/10 px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}

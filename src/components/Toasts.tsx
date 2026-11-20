import { CheckCircle2, Info, XCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export function Toasts() {
  const { toasts } = useApp();
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 flex-col items-center gap-2" aria-live="polite">
      {toasts.map((t) => {
        const Icon = t.tone === 'success' ? CheckCircle2 : t.tone === 'error' ? XCircle : Info;
        const color = t.tone === 'success' ? 'text-success-400' : t.tone === 'error' ? 'text-danger-400' : 'text-sky-300';
        return (
          <div key={t.id} className="flex animate-fade-up items-center gap-3 rounded-xl border border-white/10 bg-stage-800 px-4 py-3 text-sm shadow-2xl">
            <Icon className={`h-5 w-5 shrink-0 ${color}`} />
            <span>{t.message}</span>
          </div>
        );
      })}
    </div>
  );
}

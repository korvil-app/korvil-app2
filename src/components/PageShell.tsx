import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { BrandMark } from '@/components/BrandMark';
import { useApp } from '@/context/AppContext';

interface Props {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  back?: () => void;
  children: ReactNode;
}

export function PageShell({ title, subtitle, actions, back, children }: Props) {
  const { navigate } = useApp();
  return (
    <div className="stage-bg min-h-screen">
      <div className="stage-grid min-h-screen">
        <header className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-8">
          <button onClick={() => navigate({ name: 'home' })} className="min-w-0 rounded-xl transition hover:opacity-80" aria-label="Home">
            <BrandMark />
          </button>
          {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </header>
        <main className="mx-auto max-w-7xl px-4 pb-24 sm:px-8">
          {(title || back) && (
            <div className="mb-8 mt-4 animate-fade-up">
              {back && (
                <button onClick={back} className="mb-4 inline-flex items-center gap-2 text-sm text-stage-300 transition hover:text-white">
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
              )}
              {title && <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>}
              {subtitle && <p className="mt-3 max-w-2xl text-lg text-stage-300">{subtitle}</p>}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}

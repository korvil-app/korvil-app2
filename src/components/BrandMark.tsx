import { Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export function BrandMark({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const { settings } = useApp();
  const dims = { sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-16 w-16' }[size];
  const text = { sm: 'text-base', md: 'text-lg', lg: 'text-3xl' }[size];
  return (
    <div className="flex min-w-0 items-center gap-3">
      {settings.logo ? (
        <img src={settings.logo} alt="" className={`${dims} shrink-0 rounded-xl bg-white/5 object-contain`} />
      ) : (
        <div className={`${dims} grid shrink-0 place-items-center rounded-xl bg-primary text-primary-ink shadow-lg shadow-primary/40`}>
          <Sparkles className="h-1/2 w-1/2" />
        </div>
      )}
      <span className={`truncate font-display font-bold tracking-tight ${text}`}>{settings.companyName || 'Huddle Trivia'}</span>
    </div>
  );
}

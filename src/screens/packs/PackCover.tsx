import { Sparkles } from 'lucide-react';
import type { QuizPack } from '@/types';

export function PackCover({ pack, height = 'h-28' }: { pack: QuizPack; height?: string }) {
  return (
    <div
      className={`relative ${height} overflow-hidden`}
      style={{ background: `linear-gradient(135deg, ${pack.coverColor}, ${pack.coverColor}99 60%, #1B1446)` }}
    >
      <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
      <div className="absolute -bottom-10 right-16 h-24 w-24 rounded-full bg-white/10" />
      <div className="absolute bottom-4 left-5 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-white/90">
        <Sparkles className="h-3.5 w-3.5" /> {pack.questions.length} questions
      </div>
    </div>
  );
}

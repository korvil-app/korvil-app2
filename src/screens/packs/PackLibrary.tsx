import { useRef, useState, type ReactNode } from 'react';
import { Copy, Download, FileUp, Pencil, Play, Plus, Trash2 } from 'lucide-react';
import type { QuizPack } from '@/types';
import { useApp } from '@/context/AppContext';
import { PageShell } from '@/components/PageShell';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { PackCover } from '@/screens/packs/PackCover';
import { exportPackJson, importPackJson } from '@/lib/packIO';
import { COVER_COLORS } from '@/lib/constants';
import { downloadFile, slugify, uid } from '@/lib/utils';

export function PackLibrary() {
  const { packs, navigate, upsertPack, deletePack, notify } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const [toDelete, setToDelete] = useState<QuizPack | null>(null);

  const createPack = () => {
    const pack: QuizPack = {
      id: uid('pack'),
      title: 'Untitled quiz pack',
      description: '',
      coverColor: COVER_COLORS[packs.length % COVER_COLORS.length],
      questions: [],
      updatedAt: Date.now(),
    };
    upsertPack(pack);
    navigate({ name: 'editor', packId: pack.id });
  };

  const duplicate = (p: QuizPack) => {
    upsertPack({ ...structuredClone(p), id: uid('pack'), builtIn: false, title: `${p.title} (copy)`, questions: p.questions.map((q) => ({ ...q, id: uid('q') })) });
    notify('Pack duplicated', 'success');
  };

  const onImport = async (file?: File) => {
    if (!file) return;
    try {
      const pack = importPackJson(await file.text());
      upsertPack(pack);
      notify(`Imported "${pack.title}" with ${pack.questions.length} questions`, 'success');
    } catch (e) {
      notify((e as Error).message, 'error');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <PageShell
      title="Quiz packs"
      subtitle="Build question sets for onboarding, training, parties or your booth. Everything is saved in this browser."
      back={() => navigate({ name: 'home' })}
      actions={
        <>
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            <FileUp className="h-4 w-4" /> Import JSON
          </Button>
          <Button onClick={createPack}>
            <Plus className="h-4 w-4" /> New pack
          </Button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => onImport(e.target.files?.[0])} />
        </>
      }
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {packs.map((p, i) => (
          <article key={p.id} className="panel group flex animate-fade-up flex-col overflow-hidden transition hover:-translate-y-1 hover:border-white/25" style={{ animationDelay: `${i * 50}ms` }}>
            <button onClick={() => navigate({ name: 'editor', packId: p.id })} className="text-left">
              <PackCover pack={p} />
            </button>
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-display text-lg font-bold leading-tight">{p.title}</h2>
                {p.builtIn && <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-xs text-stage-300">Demo</span>}
              </div>
              <p className="mt-2 line-clamp-2 flex-1 text-sm text-stage-300">{p.description || 'No description yet.'}</p>
              {p.questions.some((q) => q.draft) && (
                <div className="mt-3 text-xs font-medium text-warning-300">{p.questions.filter((q) => q.draft).length} draft questions to review</div>
              )}
              <div className="mt-4 flex items-center gap-1 border-t border-white/10 pt-4">
                <Button size="sm" onClick={() => navigate({ name: 'editor', packId: p.id })}>
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button size="sm" variant="ghost" onClick={() => navigate({ name: 'setup', packId: p.id })} disabled={p.questions.length < 3} title="Play">
                  <Play className="h-3.5 w-3.5" /> Play
                </Button>
                <div className="ml-auto flex">
                  <IconBtn label="Duplicate" onClick={() => duplicate(p)}><Copy className="h-4 w-4" /></IconBtn>
                  <IconBtn label="Export JSON" onClick={() => downloadFile(`${slugify(p.title)}.json`, exportPackJson(p), 'application/json')}><Download className="h-4 w-4" /></IconBtn>
                  <IconBtn label="Delete" onClick={() => setToDelete(p)}><Trash2 className="h-4 w-4" /></IconBtn>
                </div>
              </div>
            </div>
          </article>
        ))}
        <button onClick={createPack} className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-white/15 text-stage-300 transition hover:border-primary hover:text-white">
          <Plus className="h-8 w-8" />
          <span className="font-display text-lg font-bold">Create a new pack</span>
        </button>
      </div>

      <Modal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Delete this pack?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setToDelete(null)}>Cancel</Button>
            <Button
              variant="danger"
              onClick={() => {
                if (toDelete) deletePack(toDelete.id);
                setToDelete(null);
                notify('Pack deleted', 'success');
              }}
            >
              Delete pack
            </Button>
          </>
        }
      >
        <p className="text-stage-200">
          &ldquo;{toDelete?.title}&rdquo; and its {toDelete?.questions.length} questions will be removed from this browser. Export it first if you might need it again.
        </p>
      </Modal>
    </PageShell>
  );
}

function IconBtn({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick} title={label} aria-label={label} className="rounded-lg p-2 text-stage-300 transition hover:bg-white/10 hover:text-white">
      {children}
    </button>
  );
}

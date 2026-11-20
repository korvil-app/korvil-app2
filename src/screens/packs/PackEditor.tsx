import { useState } from 'react';
import { ArrowDown, ArrowUp, Copy, Download, FileSpreadsheet, Image as ImageIcon, Pencil, Play, Plus, Sparkles, Trash2 } from 'lucide-react';
import type { Question, QuizPack } from '@/types';
import { useApp } from '@/context/AppContext';
import { PageShell } from '@/components/PageShell';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { QuestionForm } from '@/screens/packs/QuestionForm';
import { DraftModal } from '@/screens/packs/DraftModal';
import { CsvImportModal } from '@/screens/packs/CsvImportModal';
import { COVER_COLORS, TYPE_LABELS } from '@/lib/constants';
import { exportPackJson } from '@/lib/packIO';
import { downloadFile, slugify, uid } from '@/lib/utils';

const blankQuestion = (): Question => ({ id: uid('q'), type: 'mc', category: '', prompt: '', options: ['', '', '', ''], correctIndex: 0 });

export function PackEditor({ packId }: { packId: string }) {
  const { packs, upsertPack, navigate, notify } = useApp();
  const pack = packs.find((p) => p.id === packId);
  const [editing, setEditing] = useState<{ question: Question; isNew: boolean } | null>(null);
  const [drafting, setDrafting] = useState(false);
  const [csvOpen, setCsvOpen] = useState(false);

  if (!pack) {
    return (
      <PageShell title="Pack not found" back={() => navigate({ name: 'packs' })}>
        <Button onClick={() => navigate({ name: 'packs' })}>Back to quiz packs</Button>
      </PageShell>
    );
  }

  const update = (patch: Partial<QuizPack>) => upsertPack({ ...pack, ...patch });
  const setQuestions = (questions: Question[]) => update({ questions });

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= pack.questions.length) return;
    const list = [...pack.questions];
    [list[i], list[j]] = [list[j], list[i]];
    setQuestions(list);
  };

  const saveQuestion = (q: Question) => {
    const exists = pack.questions.some((x) => x.id === q.id);
    setQuestions(exists ? pack.questions.map((x) => (x.id === q.id ? q : x)) : [...pack.questions, q]);
    setEditing(null);
    notify(exists ? 'Question saved' : 'Question added', 'success');
  };

  const drafts = pack.questions.filter((q) => q.draft).length;

  return (
    <PageShell
      back={() => navigate({ name: 'packs' })}
      actions={
        <>
          <Button variant="secondary" onClick={() => downloadFile(`${slugify(pack.title)}.json`, exportPackJson(pack), 'application/json')}>
            <Download className="h-4 w-4" /> Export JSON
          </Button>
          <Button onClick={() => navigate({ name: 'setup', packId: pack.id })} disabled={pack.questions.length < 3}>
            <Play className="h-4 w-4" /> Play this pack
          </Button>
        </>
      }
    >
      <section className="panel overflow-hidden">
        <div className="h-3" style={{ background: pack.coverColor }} />
        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_auto]">
          <div className="space-y-4">
            <input
              className="w-full bg-transparent font-display text-3xl font-bold tracking-tight outline-none placeholder:text-stage-500 sm:text-4xl"
              value={pack.title}
              maxLength={80}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="Pack title"
              aria-label="Pack title"
            />
            <textarea
              className="field resize-none"
              rows={2}
              maxLength={300}
              value={pack.description}
              onChange={(e) => update({ description: e.target.value })}
              placeholder="What is this pack for? e.g. New-starter week quiz"
              aria-label="Pack description"
            />
          </div>
          <div>
            <span className="label">Cover colour</span>
            <div className="grid grid-cols-4 gap-2">
              {COVER_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => update({ coverColor: c })}
                  className={`h-9 w-9 rounded-full border border-white/20 transition hover:scale-110 ${pack.coverColor === c ? 'ring-[3px] ring-white ring-offset-2 ring-offset-stage-800' : ''}`}
                  style={{ background: c }}
                  aria-label={`Cover colour ${c}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-bold">
          Questions <span className="text-stage-400">({pack.questions.length})</span>
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setCsvOpen(true)}>
            <FileSpreadsheet className="h-4 w-4" /> Import CSV
          </Button>
          <Button variant="secondary" onClick={() => setDrafting(true)} className="border-primary/50">
            <Sparkles className="h-4 w-4 text-primary-light" /> Draft questions with AI
          </Button>
          <Button onClick={() => setEditing({ question: blankQuestion(), isNew: true })}>
            <Plus className="h-4 w-4" /> Add question
          </Button>
        </div>
      </div>

      {drafts > 0 && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-warning-400/30 bg-warning-400/10 px-4 py-3 text-sm text-warning-300">
          <Sparkles className="h-4 w-4 shrink-0" />
          {drafts} draft {drafts === 1 ? 'question needs' : 'questions need'} a quick review. Open each one to check the answer and approve it.
        </div>
      )}

      {pack.questions.length === 0 ? (
        <div className="panel mt-6 flex flex-col items-center p-12 text-center">
          <Sparkles className="h-10 w-10 text-primary-light" />
          <h3 className="mt-4 font-display text-xl font-bold">No questions yet</h3>
          <p className="mt-2 max-w-md text-stage-300">Add your own, import a spreadsheet, or let the AI drafter give you a head start. You need at least 3 questions to play.</p>
        </div>
      ) : (
        <ol className="mt-6 space-y-2">
          {pack.questions.map((q, i) => (
            <li key={q.id} className={`panel group flex items-center gap-4 p-4 transition hover:border-white/20 ${q.draft ? 'border-warning-400/40' : ''}`}>
              <div className="flex flex-col">
                <button onClick={() => move(i, -1)} disabled={i === 0} className="rounded p-1 text-stage-400 transition hover:bg-white/10 hover:text-white disabled:opacity-20" aria-label="Move up">
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button onClick={() => move(i, 1)} disabled={i === pack.questions.length - 1} className="rounded p-1 text-stage-400 transition hover:bg-white/10 hover:text-white disabled:opacity-20" aria-label="Move down">
                  <ArrowDown className="h-4 w-4" />
                </button>
              </div>
              <div className="w-8 shrink-0 font-display text-xl font-bold text-stage-400">{i + 1}</div>
              {q.image ? (
                <img src={q.image} alt="" className="hidden h-14 w-20 shrink-0 rounded-lg object-cover sm:block" />
              ) : (
                <div className="hidden h-14 w-20 shrink-0 place-items-center rounded-lg bg-white/5 text-stage-500 sm:grid">
                  <ImageIcon className="h-5 w-5" />
                </div>
              )}
              <button onClick={() => setEditing({ question: q, isNew: false })} className="min-w-0 flex-1 text-left">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-stage-200">{TYPE_LABELS[q.type]}</span>
                  {q.category && <span className="text-stage-400">{q.category}</span>}
                  {q.timeLimit && <span className="text-stage-400">· {q.timeLimit}s</span>}
                  {q.draft && <span className="rounded-full bg-warning-400 px-2 py-0.5 font-medium text-stage-900">Draft</span>}
                </div>
                <div className="mt-1 truncate font-medium">{q.prompt || 'Untitled question'}</div>
                <div className="mt-0.5 truncate text-sm text-success-300">
                  {q.type === 'number' ? `Answer: ${q.answerNumber ?? '?'}` : `Answer: ${q.options[q.correctIndex] ?? '?'}`}
                </div>
              </button>
              <div className="flex shrink-0 opacity-70 transition group-hover:opacity-100">
                <button onClick={() => setEditing({ question: q, isNew: false })} className="rounded-lg p-2 text-stage-300 hover:bg-white/10 hover:text-white" aria-label="Edit">
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    const list = [...pack.questions];
                    list.splice(i + 1, 0, { ...q, id: uid('q') });
                    setQuestions(list);
                  }}
                  className="rounded-lg p-2 text-stage-300 hover:bg-white/10 hover:text-white"
                  aria-label="Duplicate"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button onClick={() => setQuestions(pack.questions.filter((x) => x.id !== q.id))} className="rounded-lg p-2 text-stage-300 hover:bg-danger-500/20 hover:text-danger-300" aria-label="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.isNew ? 'New question' : editing?.question.draft ? 'Review draft question' : 'Edit question'} side>
        {editing && <QuestionForm key={editing.question.id} initial={editing.question} onSave={saveQuestion} onCancel={() => setEditing(null)} onError={(m) => notify(m, 'error')} />}
      </Modal>
      <DraftModal
        open={drafting}
        onClose={() => setDrafting(false)}
        onAdd={(qs) => {
          setQuestions([...pack.questions, ...qs]);
          notify(`${qs.length} draft questions added. Review them below.`, 'success');
        }}
      />
      <CsvImportModal
        open={csvOpen}
        onClose={() => setCsvOpen(false)}
        onAdd={(qs) => {
          setQuestions([...pack.questions, ...qs]);
          notify(`${qs.length} questions imported`, 'success');
        }}
      />
    </PageShell>
  );
}

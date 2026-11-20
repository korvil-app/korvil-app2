import { useState } from 'react';
import { CheckSquare, Loader2, Sparkles, Square, Wand2 } from 'lucide-react';
import type { Question } from '@/types';
import { draftQuestions } from '@/lib/draftQuestions';
import { TYPE_LABELS } from '@/lib/constants';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (questions: Question[]) => void;
}

export function DraftModal({ open, onClose, onAdd }: Props) {
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(8);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Question[]>([]);
  const [chosen, setChosen] = useState<Set<string>>(new Set());

  const close = () => {
    setDrafts([]);
    setError(null);
    onClose();
  };

  const generate = async () => {
    if (!topic.trim()) return setError('Enter a topic first.');
    setLoading(true);
    setError(null);
    try {
      const result = await draftQuestions({ topic: topic.trim(), count });
      if (!result.length) throw new Error('No questions came back. Try a different topic.');
      setDrafts(result);
      setChosen(new Set(result.map((q) => q.id)));
    } catch (e) {
      setError((e as Error).message || 'Could not draft questions.');
    } finally {
      setLoading(false);
    }
  };

  const toggle = (id: string) =>
    setChosen((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <Modal
      open={open}
      onClose={close}
      title="Draft questions with AI"
      size="lg"
      footer={
        drafts.length > 0 ? (
          <>
            <Button variant="ghost" onClick={() => setDrafts([])}>Start over</Button>
            <Button
              disabled={chosen.size === 0}
              onClick={() => {
                onAdd(drafts.filter((d) => chosen.has(d.id)));
                close();
              }}
            >
              Add {chosen.size} as drafts
            </Button>
          </>
        ) : (
          <Button onClick={generate} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            {loading ? 'Drafting\u2026' : 'Generate drafts'}
          </Button>
        )
      }
    >
      {drafts.length === 0 ? (
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-xl bg-primary/15 p-4 text-sm text-stage-100">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary-light" />
            Describe what the quiz is about. You&apos;ll get a starting set of questions to review. Always check answers before your event: drafts are clearly marked until you approve them.
          </div>
          <div>
            <label className="label" htmlFor="draft-topic">Topic</label>
            <input
              id="draft-topic"
              className="field"
              value={topic}
              maxLength={80}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && generate()}
              placeholder="e.g. Our Q3 product launch"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {['Our Q3 product launch', 'Welcome to the team', 'Data privacy basics', 'Customer support week'].map((t) => (
                <button key={t} onClick={() => setTopic(t)} className="rounded-full bg-white/10 px-3 py-1 text-xs text-stage-200 transition hover:bg-white/20">
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label" htmlFor="draft-count">How many questions? <span className="font-display text-white">{count}</span></label>
            <input id="draft-count" type="range" min={3} max={15} value={count} onChange={(e) => setCount(Number(e.target.value))} className="w-full accent-[rgb(var(--primary))]" />
          </div>
          {error && <div className="rounded-xl bg-danger-500/15 px-4 py-3 text-sm text-danger-300">{error}</div>}
        </div>
      ) : (
        <div className="space-y-2">
          <p className="mb-3 text-sm text-stage-300">
            {drafts.length} drafts ready{drafts.length < count ? ` (that's all we could write for this topic)` : ''}. Untick any you don&apos;t want; you can edit everything after adding.
          </p>
          {drafts.map((d) => {
            const on = chosen.has(d.id);
            return (
              <button key={d.id} onClick={() => toggle(d.id)} className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${on ? 'border-primary/60 bg-primary/10' : 'border-white/10 opacity-60'}`}>
                {on ? <CheckSquare className="mt-0.5 h-5 w-5 shrink-0 text-primary-light" /> : <Square className="mt-0.5 h-5 w-5 shrink-0 text-stage-400" />}
                <div className="min-w-0">
                  <div className="text-xs font-medium uppercase tracking-wider text-stage-400">{TYPE_LABELS[d.type]}</div>
                  <div className="mt-1 font-medium">{d.prompt}</div>
                  <div className="mt-1 text-sm text-stage-300">
                    Answer: {d.type === 'number' ? d.answerNumber : d.options[d.correctIndex]}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </Modal>
  );
}

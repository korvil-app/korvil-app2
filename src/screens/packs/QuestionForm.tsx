import { useRef, useState } from 'react';
import { CheckCircle2, Circle, ImagePlus, Plus, Trash2 } from 'lucide-react';
import type { Question, QuestionType } from '@/types';
import { ANSWER_STYLES, TYPE_LABELS } from '@/lib/constants';
import { readFileAsDataUrl } from '@/lib/utils';
import { Button } from '@/components/Button';
import { AnswerShape } from '@/components/AnswerShape';

interface Props {
  initial: Question;
  onSave: (q: Question) => void;
  onCancel: () => void;
  onError: (msg: string) => void;
}

const TYPES: QuestionType[] = ['mc', 'tf', 'number', 'image'];
const TIMES = [undefined, 10, 20, 30, 45, 60];

function validate(q: Question): string | null {
  if (!q.prompt.trim()) return 'Write the question text.';
  if (q.type === 'number') return q.answerNumber === undefined || Number.isNaN(q.answerNumber) ? 'Enter the correct number.' : null;
  if (q.type === 'image' && !q.image) return 'Image rounds need an image.';
  const filled = q.options.filter((o) => o.trim());
  if (filled.length !== q.options.length) return 'Fill in every answer option or remove empty ones.';
  if (q.options.length < 2) return 'Add at least two answers.';
  if (q.correctIndex < 0 || q.correctIndex >= q.options.length) return 'Mark the correct answer.';
  return null;
}

export function QuestionForm({ initial, onSave, onCancel, onError }: Props) {
  const [q, setQ] = useState<Question>(initial);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const set = (patch: Partial<Question>) => setQ((cur) => ({ ...cur, ...patch }));

  const changeType = (type: QuestionType) => {
    if (type === 'tf') return set({ type, options: ['True', 'False'], correctIndex: Math.min(q.correctIndex, 1) });
    if (type === 'number') return set({ type });
    const options = q.type === 'tf' || q.options.length < 2 ? ['', '', '', ''] : q.options;
    set({ type, options, correctIndex: q.type === 'tf' ? 0 : q.correctIndex });
  };

  const onImage = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return onError('Please choose an image file.');
    try {
      set({ image: await readFileAsDataUrl(file) });
    } catch (e) {
      onError((e as Error).message);
    }
  };

  const submit = () => {
    const cleaned: Question = {
      ...q,
      prompt: q.prompt.trim(),
      category: q.category.trim() || 'General',
      fact: q.fact?.trim() || undefined,
      options: q.type === 'number' ? [] : q.options.map((o) => o.trim()),
      draft: false,
    };
    const err = validate(cleaned);
    if (err) return setError(err);
    onSave(cleaned);
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="label">Question type</span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => changeType(t)}
              className={`rounded-xl px-3 py-2.5 text-sm font-medium transition ${q.type === t ? 'bg-primary text-primary-ink' : 'bg-white/10 text-stage-200 hover:bg-white/15'}`}
            >
              {TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
        <div>
          <label className="label" htmlFor="qf-cat">Category</label>
          <input id="qf-cat" className="field" maxLength={30} value={q.category} onChange={(e) => set({ category: e.target.value })} placeholder="e.g. Values" />
        </div>
        <div>
          <label className="label" htmlFor="qf-time">Time limit</label>
          <select id="qf-time" className="field" value={q.timeLimit ?? ''} onChange={(e) => set({ timeLimit: e.target.value ? Number(e.target.value) : undefined })}>
            {TIMES.map((t) => (
              <option key={t ?? 'd'} value={t ?? ''} className="bg-stage-900">
                {t ? `${t} seconds` : 'Game default'}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="qf-prompt">Question</label>
        <textarea id="qf-prompt" rows={3} maxLength={200} className="field resize-none font-display text-lg" value={q.prompt} onChange={(e) => set({ prompt: e.target.value })} placeholder="Type your question" />
        <div className="mt-1 text-right text-xs text-stage-400">{q.prompt.length}/200 · shorter reads better on a big screen</div>
      </div>

      {q.type === 'number' ? (
        <div>
          <label className="label" htmlFor="qf-num">Correct number</label>
          <input
            id="qf-num"
            type="number"
            step="any"
            className="field font-display text-2xl"
            value={q.answerNumber ?? ''}
            onChange={(e) => set({ answerNumber: e.target.value === '' ? undefined : Number(e.target.value) })}
          />
          <p className="mt-2 text-sm text-stage-400">The team (or teams) with the closest guess win the points.</p>
        </div>
      ) : (
        <div>
          <span className="label">Answers · click the circle to mark the correct one</span>
          <div className="space-y-2">
            {q.options.map((opt, i) => {
              const s = ANSWER_STYLES[i];
              const correct = q.correctIndex === i;
              return (
                <div key={i} className={`flex items-center gap-2 rounded-xl border p-1.5 pl-3 transition ${correct ? 'border-success-400 bg-success-500/10' : 'border-white/10'}`}>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white" style={{ background: s.bg }}>
                    <AnswerShape shape={s.shape} className="h-4 w-4" />
                  </span>
                  <input
                    className="min-w-0 flex-1 bg-transparent px-2 py-2 outline-none placeholder:text-stage-500 disabled:text-stage-200"
                    value={opt}
                    disabled={q.type === 'tf'}
                    maxLength={60}
                    placeholder={`Answer ${s.letter}`}
                    onChange={(e) => set({ options: q.options.map((o, j) => (j === i ? e.target.value : o)) })}
                    aria-label={`Answer ${s.letter}`}
                  />
                  <button type="button" onClick={() => set({ correctIndex: i })} className="rounded-lg p-2 transition hover:bg-white/10" aria-label={`Mark ${s.letter} correct`} aria-pressed={correct}>
                    {correct ? <CheckCircle2 className="h-5 w-5 text-success-400" /> : <Circle className="h-5 w-5 text-stage-400" />}
                  </button>
                  {q.type !== 'tf' && q.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() =>
                        set({
                          options: q.options.filter((_, j) => j !== i),
                          correctIndex: q.correctIndex === i ? 0 : q.correctIndex > i ? q.correctIndex - 1 : q.correctIndex,
                        })
                      }
                      className="rounded-lg p-2 text-stage-400 transition hover:bg-white/10 hover:text-white"
                      aria-label={`Remove answer ${s.letter}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })}
            {q.type !== 'tf' && q.options.length < 4 && (
              <Button variant="ghost" size="sm" onClick={() => set({ options: [...q.options, ''] })}>
                <Plus className="h-4 w-4" /> Add answer
              </Button>
            )}
          </div>
        </div>
      )}

      <div>
        <span className="label">Image {q.type === 'image' ? '(required)' : '(optional)'}</span>
        {q.image ? (
          <div className="relative overflow-hidden rounded-xl border border-white/10">
            <img src={q.image} alt="Question" className="max-h-56 w-full object-cover" />
            <div className="absolute right-2 top-2 flex gap-2">
              <Button size="sm" variant="secondary" className="bg-stage-900/80" onClick={() => fileRef.current?.click()}>Replace</Button>
              <Button size="sm" variant="secondary" className="bg-stage-900/80" onClick={() => set({ image: undefined })}>Remove</Button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => fileRef.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/15 py-8 text-stage-300 transition hover:border-primary hover:text-white">
            <ImagePlus className="h-5 w-5" /> Upload an image
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onImage(e.target.files?.[0])} />
      </div>

      <div>
        <label className="label" htmlFor="qf-fact">&ldquo;Did you know?&rdquo; fact (optional)</label>
        <textarea id="qf-fact" rows={2} maxLength={240} className="field resize-none" value={q.fact ?? ''} onChange={(e) => set({ fact: e.target.value })} placeholder="Shown on the reveal screen" />
      </div>

      {error && <div className="rounded-xl bg-danger-500/15 px-4 py-3 text-sm text-danger-300">{error}</div>}

      <div className="sticky bottom-0 -mx-6 -mb-5 flex justify-end gap-3 border-t border-white/10 bg-stage-800 px-6 py-4">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button onClick={submit}>{initial.draft ? 'Approve & save' : 'Save question'}</Button>
      </div>
    </div>
  );
}

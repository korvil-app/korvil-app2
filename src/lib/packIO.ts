import type { Question, QuestionType, QuizPack } from '@/types';
import { uid } from '@/lib/utils';
import { COVER_COLORS } from '@/lib/constants';

const CSV_HEADERS = ['type', 'category', 'question', 'option_a', 'option_b', 'option_c', 'option_d', 'correct', 'number_answer', 'fact', 'time_limit'];

export const CSV_TEMPLATE = [
  CSV_HEADERS.join(','),
  'mc,Geography,What is the capital of Japan?,Seoul,Tokyo,Beijing,Bangkok,B,,Tokyo is the most populous metro area on Earth.,20',
  'tf,Science,The Sun is a star.,,,,,true,,,',
  'number,Company,How many offices do we have?,,,,,,12,,30',
  'image,Landmarks,Which city is shown?,Paris,Rome,London,Berlin,A,,,',
].join('\n');

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') {
      row.push(cell);
      cell = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else cell += c;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

export interface ImportResult {
  questions: Question[];
  errors: string[];
}

export function questionsFromCsv(text: string): ImportResult {
  const rows = parseCsv(text.replace(/^\uFEFF/, ''));
  if (!rows.length) return { questions: [], errors: ['The file is empty.'] };
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const col = (name: string) => header.indexOf(name);
  if (col('question') === -1) return { questions: [], errors: ['Missing a "question" column. Download the template to see the format.'] };

  const questions: Question[] = [];
  const errors: string[] = [];
  rows.slice(1).forEach((r, i) => {
    const line = i + 2;
    const get = (name: string) => (col(name) >= 0 ? (r[col(name)] ?? '').trim() : '');
    const type = (get('type').toLowerCase() || 'mc') as QuestionType;
    const prompt = get('question');
    if (!['mc', 'tf', 'number', 'image'].includes(type)) return errors.push(`Row ${line}: unknown type "${type}".`);
    if (!prompt) return errors.push(`Row ${line}: question text is missing.`);
    const time = Number(get('time_limit'));
    const base = {
      id: uid('q'),
      type,
      category: get('category') || 'General',
      prompt,
      fact: get('fact') || undefined,
      timeLimit: [10, 20, 30, 45, 60].includes(time) ? time : undefined,
    };
    if (type === 'number') {
      const n = Number(get('number_answer'));
      if (!get('number_answer') || Number.isNaN(n)) return errors.push(`Row ${line}: number_answer must be a number.`);
      questions.push({ ...base, options: [], correctIndex: 0, answerNumber: n });
    } else if (type === 'tf') {
      const c = get('correct').toLowerCase();
      if (!['true', 'false', 'a', 'b'].includes(c)) return errors.push(`Row ${line}: correct must be true or false.`);
      questions.push({ ...base, options: ['True', 'False'], correctIndex: c === 'true' || c === 'a' ? 0 : 1 });
    } else {
      const options = ['option_a', 'option_b', 'option_c', 'option_d'].map(get).filter(Boolean);
      const idx = 'ABCD'.indexOf(get('correct').toUpperCase());
      if (options.length < 2) return errors.push(`Row ${line}: needs at least two options.`);
      if (idx < 0 || idx >= options.length) return errors.push(`Row ${line}: correct must be a letter A-D matching an option.`);
      questions.push({ ...base, options, correctIndex: idx });
    }
  });
  return { questions, errors };
}

export function exportPackJson(pack: QuizPack): string {
  const rest: Partial<QuizPack> = { ...pack };
  delete rest.builtIn;
  return JSON.stringify({ format: 'huddle-trivia-pack', version: 1, pack: rest }, null, 2);
}

function sanitizeQuestion(raw: unknown): Question | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const type = r.type as QuestionType;
  if (!['mc', 'tf', 'number', 'image'].includes(type) || typeof r.prompt !== 'string' || !r.prompt.trim()) return null;
  const options = Array.isArray(r.options) ? r.options.filter((o): o is string => typeof o === 'string').slice(0, 4) : [];
  const correctIndex = typeof r.correctIndex === 'number' ? r.correctIndex : 0;
  if (type !== 'number' && (options.length < 2 || correctIndex < 0 || correctIndex >= options.length)) return null;
  if (type === 'number' && typeof r.answerNumber !== 'number') return null;
  return {
    id: uid('q'),
    type,
    category: typeof r.category === 'string' ? r.category : 'General',
    prompt: r.prompt,
    options: type === 'tf' ? ['True', 'False'] : options,
    correctIndex,
    answerNumber: typeof r.answerNumber === 'number' ? r.answerNumber : undefined,
    image: typeof r.image === 'string' && /^(data:image\/|https:\/\/)/.test(r.image) ? r.image : undefined,
    fact: typeof r.fact === 'string' ? r.fact : undefined,
    timeLimit: typeof r.timeLimit === 'number' ? r.timeLimit : undefined,
  };
}

export function importPackJson(text: string): QuizPack {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('That file is not valid JSON.');
  }
  const pack = (data as { pack?: unknown })?.pack ?? data;
  if (!pack || typeof pack !== 'object') throw new Error('No quiz pack found in that file.');
  const p = pack as Record<string, unknown>;
  if (typeof p.title !== 'string' || !Array.isArray(p.questions)) throw new Error('The pack needs a title and a list of questions.');
  const questions = p.questions.map(sanitizeQuestion).filter((x): x is Question => x !== null);
  if (!questions.length) throw new Error('None of the questions in that pack could be read.');
  return {
    id: uid('pack'),
    title: p.title.slice(0, 120),
    description: typeof p.description === 'string' ? p.description.slice(0, 400) : '',
    coverColor: typeof p.coverColor === 'string' && /^#[0-9a-f]{6}$/i.test(p.coverColor) ? p.coverColor : COVER_COLORS[0],
    questions,
    updatedAt: Date.now(),
  };
}

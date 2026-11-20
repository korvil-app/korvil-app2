import type { Question, QuestionType } from '@/types';
import { uid } from '@/lib/utils';

export interface DraftRequest {
  topic: string;
  count: number;
}

type Template = (subject: string, rand: () => number) => Omit<Question, 'id' | 'draft'>;

const THEMES: { match: RegExp; category: string; templates: Template[] }[] = [
  {
    match: /launch|product|release|feature|roadmap|app|platform/i,
    category: 'Launch',
    templates: [
      (s) => mc(`What was the primary goal of ${s}?`, ['Reach new customers', 'Cut internal costs', 'Rename the company', 'Close an office'], 0, 'Check that this matches the launch brief.'),
      (s) => mc(`In which quarter did ${s} go live?`, ['Q1', 'Q2', 'Q3', 'Q4'], 2),
      (s) => tf(`${s} included a beta programme with early customers.`, true),
      (s) => mc(`Which team led the go-to-market plan for ${s}?`, ['Marketing', 'Finance', 'Legal', 'Facilities'], 0),
      (s) => num(`How many weeks did the ${s} project take from kickoff to launch?`, 12),
      (s) => mc(`Which metric best shows whether ${s} succeeded?`, ['Active users', 'Office temperature', 'Number of meetings', 'Lines of code'], 0),
      (s) => tf(`Customer feedback directly shaped at least one feature in ${s}.`, true),
      (s) => mc(`What is the best way to share feedback about ${s}?`, ['The product feedback form', 'Shout across the office', 'Keep it to yourself', 'Post on social media'], 0),
    ],
  },
  {
    match: /onboard|culture|value|company|team|welcome|history|hr|people/i,
    category: 'Culture',
    templates: [
      (s) => mc(`Which of these best describes the spirit of ${s}?`, ['Collaboration first', 'Every person for themselves', 'Silence is golden', 'Rules over results'], 0),
      (s) => tf(`${s} encourages new starters to book intro chats with other teams.`, true),
      (s) => mc(`Who should you ask first if you have a question about ${s}?`, ['Your buddy or manager', 'A random customer', 'Nobody', 'The vending machine'], 0),
      (s) => num(`How many people are part of ${s} today?`, 120),
      (s) => mc(`What happens during the first week of ${s}?`, ['Welcome sessions and tool setup', 'Annual review', 'Office move', 'Quarter-end close'], 0),
      (s) => tf(`Feedback about ${s} can be shared anonymously.`, true),
      (s) => mc(`Which tool is the home for documents about ${s}?`, ['The company wiki', 'A USB stick', 'Personal email', 'A paper notebook'], 0),
    ],
  },
  {
    match: /safety|security|compliance|privacy|policy|gdpr|risk/i,
    category: 'Compliance',
    templates: [
      (s) => mc(`What is the first thing to do if you spot a problem related to ${s}?`, ['Report it right away', 'Wait and see', 'Fix it secretly', 'Ignore it'], 0),
      (s) => tf(`Everyone, not just one team, is responsible for ${s}.`, true),
      (s) => mc(`How often is training on ${s} refreshed?`, ['Every year', 'Never', 'Every ten years', 'Only on request'], 0),
      (s) => tf(`It is fine to share passwords with close colleagues under ${s} rules.`, false),
      (s) => num(`Within how many hours should an incident about ${s} be reported?`, 24),
      (s) => mc(`Where can you find the latest guidelines on ${s}?`, ['The policy hub', 'An old printout', 'A rumour', 'Social media'], 0),
    ],
  },
  {
    match: /sales|customer|client|market|revenue|support|service/i,
    category: 'Customers',
    templates: [
      (s) => mc(`What do customers value most in ${s}?`, ['Fast, friendly help', 'Long hold times', 'Complicated pricing', 'Silence'], 0),
      (s) => num(`What customer satisfaction score (out of 100) did ${s} reach last quarter?`, 87),
      (s) => tf(`${s} tracks every customer conversation in the CRM.`, true),
      (s) => mc(`Which region grew fastest for ${s} this year?`, ['Europe', 'North America', 'Asia-Pacific', 'Latin America'], 2),
      (s) => mc(`What is the target first-response time for ${s}?`, ['Under 1 hour', '1 week', '1 month', 'No target'], 0),
      (s) => tf(`Referrals are one of the biggest sources of new business for ${s}.`, true),
    ],
  },
];

const GENERIC: Template[] = [
  (s) => mc(`Which word is most closely associated with ${s}?`, ['Teamwork', 'Chaos', 'Boredom', 'Secrecy'], 0),
  (s) => tf(`${s} is something everyone in the room has heard of.`, true),
  (s) => mc(`What is the best first step when learning about ${s}?`, ['Ask an expert', 'Guess', 'Skip it', 'Wait a year'], 0),
  (s) => num(`In what year did ${s} first become a big deal?`, 2015),
  (s) => mc(`Which of these is NOT related to ${s}?`, ['A key fact about it', 'A common myth about it', 'A famous example of it', 'Underwater basket weaving'], 3),
  (s) => tf(`There is more than one right way to approach ${s}.`, true),
  (s) => mc(`Where would you go to find out more about ${s}?`, ['A trusted guide or resource', 'A fortune cookie', 'A random billboard', 'Nowhere'], 0),
  (s) => num(`On a scale of 1 to 10, how familiar is the average person with ${s}?`, 6),
  (s) => mc(`Who benefits most from understanding ${s}?`, ['Everyone involved', 'Nobody', 'Only robots', 'Only the CEO'], 0),
  (s) => tf(`${s} has changed a lot over the last five years.`, true),
  (s) => mc(`What is the most common misconception about ${s}?`, ['That it is only for experts', 'That it exists', 'That it is a vegetable', 'That it is illegal'], 0),
  (s) => tf(`You need special equipment to get started with ${s}.`, false),
];

function mc(prompt: string, options: string[], correctIndex: number, fact?: string) {
  return { type: 'mc' as QuestionType, category: '', prompt, options, correctIndex, fact };
}
function tf(prompt: string, isTrue: boolean) {
  return { type: 'tf' as QuestionType, category: '', prompt, options: ['True', 'False'], correctIndex: isTrue ? 0 : 1 };
}
function num(prompt: string, answer: number) {
  return { type: 'number' as QuestionType, category: '', prompt, options: [], correctIndex: 0, answerNumber: answer };
}

function seeded(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

function shuffleOptions(item: Omit<Question, 'id' | 'draft'>, rand: () => number) {
  if (item.type !== 'mc') return item;
  const order = item.options.map((_, i) => i).sort(() => rand() - 0.5);
  return { ...item, options: order.map((i) => item.options[i]), correctIndex: order.indexOf(item.correctIndex) };
}

function subjectFrom(topic: string) {
  const t = topic.trim().replace(/[.?!]+$/, '');
  return /^(our|the|my|a|an)\s/i.test(t) ? t.charAt(0).toLowerCase() + t.slice(1) : t;
}

// Local stand-in for an AI writer: replace the body with a real API call and keep the signature.
export async function draftQuestions({ topic, count }: DraftRequest): Promise<Question[]> {
  const subject = subjectFrom(topic) || 'this topic';
  const rand = seeded(`${topic}|${Date.now()}`);
  const matched = THEMES.filter((t) => t.match.test(topic));
  const pool = [
    ...matched.flatMap((t) => t.templates.map((tpl) => ({ tpl, category: t.category }))),
    ...GENERIC.map((tpl) => ({ tpl, category: 'General' })),
  ];
  const picked = [...pool].sort(() => rand() - 0.5).slice(0, Math.min(count, pool.length));
  const label = topic.trim().length <= 24 ? topic.trim() : picked[0]?.category;

  await new Promise((r) => setTimeout(r, 900 + rand() * 700));

  return picked.map(({ tpl, category }) => {
    const base = shuffleOptions(tpl(subject, rand), rand);
    const prompt = base.prompt.charAt(0).toUpperCase() + base.prompt.slice(1);
    return { ...base, prompt, category: label || category, id: uid('q'), draft: true };
  });
}

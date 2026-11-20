import type { Question, QuestionType, QuizPack } from '@/types';

let counter = 0;
function q(
  type: QuestionType,
  category: string,
  prompt: string,
  options: string[],
  correct: number,
  extra: Partial<Question> = {},
): Question {
  counter += 1;
  return { id: `demo_q${counter}`, type, category, prompt, options, correctIndex: correct, ...extra };
}
const tf = (category: string, prompt: string, isTrue: boolean, extra: Partial<Question> = {}) =>
  q('tf', category, prompt, ['True', 'False'], isTrue ? 0 : 1, extra);
const num = (category: string, prompt: string, answer: number, extra: Partial<Question> = {}) =>
  q('number', category, prompt, [], 0, { answerNumber: answer, ...extra });

const onboarding: QuizPack = {
  id: 'demo_onboarding',
  title: 'Company Onboarding: Northwind Co.',
  description: 'Values, tools and who-does-what at Northwind Co., the fictional logistics company. Great for new-starter week.',
  coverColor: '#2563EB',
  builtIn: true,
  updatedAt: 0,
  questions: [
    q('mc', 'Values', 'Which of these is one of Northwind\u2019s three core values?', ['Ship it Friday', 'Own the outcome', 'Move fast, break things', 'Always be closing'], 1, {
      fact: 'Northwind\u2019s three values are Own the outcome, Default to kindness and Leave it better.',
    }),
    q('mc', 'Tools', 'Where should you log a request for a new laptop?', ['Email the CEO', 'The #random channel', 'The IT Helpdesk portal', 'Sticky note on the fridge'], 2, {
      fact: 'The Helpdesk portal routes requests to the right team and most are resolved within 1 business day.',
    }),
    q('mc', 'People', 'Who is Northwind\u2019s Head of People?', ['Priya Raman', 'Marcus Lee', 'Elena Costa', 'Tom Becker'], 0, {
      fact: 'Priya hosts a "coffee with People" drop-in every Thursday at 10am.',
    }),
    tf('Policies', 'Northwind offers every employee two paid volunteering days per year.', true, {
      fact: 'Last year Northwinders volunteered a combined 1,140 hours.',
    }),
    num('Company', 'In what year was Northwind Co. founded?', 2009, { fact: 'Northwind started with three people and one borrowed van.' }),
    q('mc', 'Tools', 'Which tool does Northwind use for team chat?', ['Carrier pigeons', 'Slack', 'Fax', 'Smoke signals'], 1),
    q('mc', 'Who does what', 'Which team owns the customer delivery-tracking app?', ['Finance', 'Fleet Ops', 'Product & Engineering', 'Facilities'], 2, {
      fact: 'Product & Engineering ship an update to the tracking app roughly every two weeks.',
    }),
    tf('Policies', 'Expense claims must be submitted within 90 days of purchase.', false, {
      fact: 'The window is 30 days, so submit receipts promptly.',
    }),
    num('Company', 'Roughly how many delivery hubs does Northwind operate?', 42, { fact: 'The newest hub opened in Rotterdam this spring.' }),
    q('mc', 'Values', '"Leave it better" most closely means\u2026', ['Tidy your desk once a year', 'Improve processes you touch', 'Never change anything', 'Delete old files'], 1),
    q('mc', 'Security', 'You receive an unexpected email asking for your password. What do you do?', ['Reply with it', 'Forward to the Security team', 'Ignore and delete', 'Post it in chat'], 1, {
      fact: 'Reporting phishing helps the Security team block it for everyone.',
    }),
    tf('Who does what', 'The Facilities team handles office access badges.', true),
  ],
};

const lumi: QuizPack = {
  id: 'demo_lumi',
  title: 'Product Training: Lumi Smart Lamp',
  description: 'Features, specs and FAQs for the Lumi Smart Lamp, the fictional connected desk lamp. Perfect for sales and support training.',
  coverColor: '#D97706',
  builtIn: true,
  updatedAt: 0,
  questions: [
    q('mc', 'Features', 'What does Lumi\u2019s "Focus Mode" do?', ['Plays white noise', 'Sets a cool 5000K light for 25 minutes', 'Turns off notifications on your phone', 'Dims to 10%'], 1, {
      fact: 'Focus Mode follows the Pomodoro rhythm and gently pulses when it\u2019s time for a break.',
    }),
    num('Specs', 'What is Lumi\u2019s maximum brightness in lumens?', 800),
    q('mc', 'Specs', 'How does Lumi connect to the companion app?', ['Bluetooth only', 'Wi-Fi and Bluetooth', 'USB cable', 'Infrared'], 1),
    tf('FAQ', 'Lumi can be controlled with voice assistants.', true, { fact: 'Lumi works with the three most popular voice assistants out of the box.' }),
    q('image', 'Design', 'Lumi\u2019s design was inspired by which kind of workspace shown here?', ['Industrial loft', 'Minimal studio', 'Victorian library', 'Space station'], 1, {
      image: 'https://images.pexels.com/photos/7439754/pexels-photo-7439754.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    }),
    q('mc', 'FAQ', 'A customer says Lumi is flashing amber. What does that mean?', ['Battery is low', 'Firmware update in progress', 'Wi-Fi setup mode', 'The lamp is overheating'], 2, {
      fact: 'Amber flashing means pairing mode; holding the button for 5 seconds also triggers it.',
    }),
    num('Warranty', 'How many years of warranty come with Lumi?', 3),
    tf('Specs', 'Lumi\u2019s base includes a wireless phone charger.', true),
    q('mc', 'Features', 'Which feature mimics a sunrise to wake you up?', ['Dawn Glow', 'Sun Salute', 'Wake Wave', 'Morning Mode'], 0),
    q('mc', 'Sales', 'Which customer group is Lumi\u2019s primary target?', ['Professional photographers', 'Hybrid and remote workers', 'Restaurants', 'Gamers only'], 1),
    tf('FAQ', 'Lumi needs a subscription for its core features.', false, { fact: 'All core features are free forever; "Lumi Plus" adds optional extras.' }),
    num('Specs', 'How many colour temperature presets does Lumi have?', 6),
  ],
};

const holiday: QuizPack = {
  id: 'demo_holiday',
  title: 'Holiday Party: General Knowledge',
  description: 'A festive mix of geography, pop culture and science to warm up any end-of-year party.',
  coverColor: '#DC2626',
  builtIn: true,
  updatedAt: 0,
  questions: [
    q('mc', 'Geography', 'What is the capital of Canada?', ['Toronto', 'Vancouver', 'Ottawa', 'Montreal'], 2),
    q('image', 'Landmarks', 'In which city would you find this landmark?', ['Rome', 'Paris', 'Madrid', 'Vienna'], 1, {
      image: 'https://images.pexels.com/photos/16496484/pexels-photo-16496484.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      fact: 'The Eiffel Tower grows by up to 15 cm in summer as the iron expands.',
    }),
    tf('Science', 'Lightning never strikes the same place twice.', false, { fact: 'The Empire State Building is struck about 20 times a year.' }),
    num('Pop culture', 'How many reindeer pull Santa\u2019s sleigh, including Rudolph?', 9),
    q('mc', 'Food', 'Which country gave the world the Christmas tradition of the gingerbread house?', ['France', 'Germany', 'USA', 'Japan'], 1),
    q('mc', 'Science', 'What is the chemical symbol for gold?', ['Go', 'Gd', 'Au', 'Ag'], 2),
    tf('Animals', 'A group of flamingos is called a "flamboyance".', true),
    num('Geography', 'How many countries are there in Africa?', 54),
    q('mc', 'Music', 'Which instrument has 88 keys?', ['Organ', 'Piano', 'Accordion', 'Harpsichord'], 1),
    q('mc', 'Space', 'Which planet is known as the Red Planet?', ['Venus', 'Jupiter', 'Mars', 'Mercury'], 2),
    tf('History', 'The Great Wall of China is visible from the Moon with the naked eye.', false),
    num('Science', 'At what temperature in Celsius does water boil at sea level?', 100),
    q('mc', 'Movies', 'In "Home Alone", where are the McCallisters flying to?', ['London', 'Paris', 'Rome', 'Miami'], 1),
    q('mc', 'Language', 'What does "Feliz Navidad" mean?', ['Happy New Year', 'Merry Christmas', 'Happy Birthday', 'Good Night'], 1),
  ],
};

const coffee: QuizPack = {
  id: 'demo_coffee',
  title: 'Trade Show Booth: Fun Facts about Coffee',
  description: 'Quick-fire coffee trivia designed for booth visitors. Short, snappy and perfect for solo play.',
  coverColor: '#0D9488',
  builtIn: true,
  updatedAt: 0,
  questions: [
    q('mc', 'Origins', 'In which country is coffee believed to have been discovered?', ['Brazil', 'Ethiopia', 'Colombia', 'Italy'], 1, {
      fact: 'Legend says a goat herder named Kaldi noticed his goats dancing after eating coffee cherries.',
    }),
    q('image', 'Beans', 'Coffee "beans" like these are actually what part of the plant?', ['Nuts', 'Seeds', 'Leaves', 'Roots'], 1, {
      image: 'https://images.pexels.com/photos/19162213/pexels-photo-19162213.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      fact: 'Each coffee cherry usually contains two seeds, the beans we roast.',
    }),
    tf('Science', 'A dark roast has more caffeine than a light roast.', false, {
      fact: 'Light roasts keep slightly more caffeine by weight because roasting breaks it down.',
    }),
    q('mc', 'Drinks', 'What is the main difference between a latte and a cappuccino?', ['Type of bean', 'Amount of milk foam', 'Water temperature', 'Sugar'], 1),
    num('Stats', 'Roughly how many billion cups of coffee are drunk worldwide every day?', 2, {
      fact: 'That is over 23,000 cups every second.',
    }),
    q('mc', 'Origins', 'Which country is the world\u2019s largest coffee producer?', ['Vietnam', 'Brazil', 'Indonesia', 'Kenya'], 1),
    q('image', 'Barista', 'The design in this cup is known as\u2026', ['Foam painting', 'Latte art', 'Crema print', 'Milk carving'], 1, {
      image: 'https://images.pexels.com/photos/459489/pexels-photo-459489.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    }),
    tf('Fun facts', 'Espresso means "pressed out" in Italian.', true),
    q('mc', 'Drinks', 'What is a "flat white" originally from?', ['Italy', 'Australia or New Zealand', 'France', 'USA'], 1, {
      fact: 'Both Australia and New Zealand still claim to have invented it.',
    }),
    q('mc', 'Science', 'Which two species of coffee dominate the market?', ['Arabica and Robusta', 'Mocha and Java', 'Kona and Liberica', 'Excelsa and Typica'], 0),
    tf('Fun facts', 'Finland drinks the most coffee per person in the world.', true),
    num('Science', 'At about what temperature (Celsius) should water be for brewing coffee?', 93),
  ],
};

export const DEMO_PACKS: QuizPack[] = [onboarding, lumi, holiday, coffee];

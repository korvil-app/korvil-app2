const ADJ = ['Quantum', 'Turbo', 'Mighty', 'Caffeinated', 'Cosmic', 'Sneaky', 'Galactic', 'Fearless', 'Spicy', 'Electric', 'Witty', 'Golden', 'Ninja', 'Rocket', 'Jolly', 'Synergy'];
const NOUN = ['Quokkas', 'Llamas', 'Spreadsheets', 'Waffles', 'Penguins', 'Owls', 'Pixels', 'Narwhals', 'Meeples', 'Bagels', 'Pandas', 'Otters', 'Dynamos', 'Brainstorms', 'Walruses', 'Squirrels'];

export function randomTeamName(taken: string[] = []): string {
  for (let i = 0; i < 30; i++) {
    const name = `${ADJ[Math.floor(Math.random() * ADJ.length)]} ${NOUN[Math.floor(Math.random() * NOUN.length)]}`;
    if (!taken.includes(name)) return name;
  }
  return `Team ${taken.length + 1}`;
}

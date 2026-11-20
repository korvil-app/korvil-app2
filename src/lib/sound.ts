let ctx: AudioContext | null = null;
let enabled = true;

export function setSoundEnabled(on: boolean) {
  enabled = on;
}

function audio(): AudioContext | null {
  if (!enabled) return null;
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, duration: number, type: OscillatorType = 'sine', gain = 0.18) {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime + start;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(g).connect(ac.destination);
  osc.start(t);
  osc.stop(t + duration + 0.05);
}

function noise(start: number, duration: number, gain = 0.12, freq = 1200) {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime + start;
  const buffer = ac.createBuffer(1, Math.ceil(ac.sampleRate * duration), ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource();
  src.buffer = buffer;
  const filter = ac.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = freq;
  const g = ac.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  src.connect(filter).connect(g).connect(ac.destination);
  src.start(t);
}

export const sfx = {
  tick: () => tone(880, 0, 0.08, 'square', 0.06),
  tickUrgent: () => {
    tone(1320, 0, 0.1, 'square', 0.09);
  },
  select: () => tone(660, 0, 0.06, 'triangle', 0.1),
  lock: () => {
    tone(523, 0, 0.12, 'triangle', 0.14);
    tone(784, 0.06, 0.16, 'triangle', 0.12);
  },
  correct: () => {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.08, 0.3, 'triangle', 0.16));
  },
  wrong: () => {
    tone(220, 0, 0.25, 'sawtooth', 0.1);
    tone(165, 0.18, 0.4, 'sawtooth', 0.1);
  },
  whoosh: () => noise(0, 0.35, 0.08, 2400),
  timeUp: () => {
    tone(440, 0, 0.18, 'square', 0.1);
    tone(330, 0.2, 0.35, 'square', 0.1);
  },
  drumroll: (seconds = 2.4) => {
    const hits = Math.floor(seconds / 0.05);
    for (let i = 0; i < hits; i++) noise(i * 0.05, 0.06, 0.05 + (i / hits) * 0.1, 180);
    noise(seconds, 0.5, 0.25, 120);
    tone(98, seconds, 0.6, 'sine', 0.3);
  },
  fanfare: () => {
    const notes: [number, number, number][] = [
      [523, 0, 0.18],
      [523, 0.2, 0.12],
      [523, 0.34, 0.12],
      [698, 0.5, 0.5],
      [659, 1.0, 0.18],
      [698, 1.2, 0.18],
      [880, 1.4, 0.9],
    ];
    notes.forEach(([f, s, d]) => {
      tone(f, s, d, 'sawtooth', 0.07);
      tone(f / 2, s, d, 'triangle', 0.1);
    });
  },
};

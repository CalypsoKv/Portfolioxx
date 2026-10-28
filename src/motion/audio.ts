// Procedural sound only: nothing to download, nothing plays until the visitor turns it on (M or the HUD button).
let ctx: AudioContext | null = null;
let on = false;
const listeners = new Set<() => void>();

export const soundOn = () => on;
export const onSound = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};
export function setSound(next: boolean) {
  on = next;
  if (on) {
    try {
      ctx ??= new AudioContext();
      void ctx.resume();
      tick();
    } catch {
      on = false;
    }
  }
  listeners.forEach((cb) => cb());
}

/** A short dial click. */
export function tick() {
  if (!on || !ctx) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(880, t);
  osc.frequency.exponentialRampToValueAtTime(240, t + 0.05);
  gain.gain.setValueAtTime(0.03, t);
  gain.gain.exponentialRampToValueAtTime(0.0008, t + 0.07);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.08);
}

/** A burst of filtered static for a channel change. */
export function staticBurst(ms = 220) {
  if (!on || !ctx) return;
  const len = Math.floor((ctx.sampleRate * ms) / 1000);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 2400;
  const gain = ctx.createGain();
  gain.gain.value = 0.05;
  src.connect(filter).connect(gain).connect(ctx.destination);
  src.start();
}

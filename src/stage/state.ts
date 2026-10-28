import { gsap } from "../motion/clock";
import { prefersReducedMotion } from "../motion/capability";
import { HOME_PLATE, REGISTERS, hexToRgb, type RegId } from "./registers";

/** Plain mutable state the render reads every frame. Motion code writes numbers here; the Stage never animates on its own. */
export const S = {
  plate: HOME_PLATE, // the still: used by the static screen and as the fallback for a loop
  src: HOME_PLATE, // what the WebGL screen is showing: the still or a video loop
  reg: "natural" as RegId,
  prog: 0, // scroll progress for the home journey
  progS: 0, // eased progress
  glitch: 0,
  crt: 1,
  duo: 0,
  dim: 0,
  q: 1,
  mx: 0.5, // pointer, 0..1 with y up
  my: 0.5,
  mv: 0, // pointer activity, decays to 0 when the pointer rests
  c0: hexToRgb(REGISTERS.natural.c[0]),
  c1: hexToRgb(REGISTERS.natural.c[1]),
  c2: hexToRgb(REGISTERS.natural.c[2]),
  quality: "high" as "high" | "medium" | "low",
  mode: "full" as "full" | "lite" | "static",
  tick: 0,
};

type Hooks = { load: (url: string) => Promise<void>; apply: (url: string) => void };
let hooks: Hooks | null = null;
let lastReq: SceneRequest | null = null;
/** When the WebGL screen arrives after the first scene was set, it replays that scene so a loop can start. */
export const registerStageHooks = (h: Hooks | null) => {
  hooks = h;
  if (h && lastReq) {
    const req = lastReq;
    queueMicrotask(() => requestScene(req));
  }
};

const listeners = new Set<() => void>();
export const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
export const getTick = () => S.tick;
export const notify = () => emit();
const emit = () => {
  S.tick++;
  listeners.forEach((cb) => cb());
};

let seq = 0;
/** plate is always required; video/lite are loops for the full and lite screens. */
export type SceneRequest = { plate: string; reg: RegId; dim?: number; video?: string; lite?: string };
const isVideo = (url: string) => /\.(mp4|webm)$/.test(url);
export const sourceFor = (req: SceneRequest) => (S.mode === "static" ? req.plate : (S.mode === "lite" ? req.lite : req.video) ?? req.plate);

function apply(req: SceneRequest, src: string, instant: boolean) {
  const r = REGISTERS[req.reg];
  S.plate = req.plate;
  S.src = src;
  S.reg = req.reg;
  hooks?.apply(src);
  const dur = instant ? 0 : 0.5;
  const to = [hexToRgb(r.c[0]), hexToRgb(r.c[1]), hexToRgb(r.c[2])];
  [S.c0, S.c1, S.c2].forEach((arr, i) => gsap.to(arr, { 0: to[i][0], 1: to[i][1], 2: to[i][2], duration: dur }));
  gsap.to(S, { duo: r.duo, dim: req.dim ?? 0, duration: dur });
  emit();
}

/** Tune the screen to a still or a loop and a register: glitch up, swap once the source is ready, glitch down. */
export function requestScene(req: SceneRequest) {
  lastReq = req;
  const want = sourceFor(req);
  if (want === S.src && req.plate === S.plate && req.reg === S.reg) {
    gsap.to(S, { dim: req.dim ?? 0, duration: 0.4 });
    return;
  }
  const id = ++seq;
  if (prefersReducedMotion() || S.mode === "static" || !hooks) {
    apply(req, req.plate, true);
    if (hooks && want !== req.plate) void hooks.load(want).then(() => id === seq && apply(req, want, true), () => {});
    return;
  }
  gsap.killTweensOf(S, "glitch");
  gsap.to(S, {
    glitch: 1,
    duration: 0.14,
    ease: "none",
    onComplete: () => {
      const load = (url: string) => hooks?.load(url) ?? Promise.resolve();
      // A loop that fails to load (or to play) falls back to the channel's still.
      void load(want)
        .then(() => want, () => (isVideo(want) ? load(req.plate).then(() => req.plate) : Promise.reject()))
        .then((src) => {
          if (id !== seq) return;
          apply(req, src, false);
          gsap.to(S, { glitch: 0, duration: 0.6, ease: "power2.out" });
        }, () => {
          if (id === seq) gsap.to(S, { glitch: 0, duration: 0.3 });
        });
    },
  });
}

/** A glitch burst with no scene change (section boundaries). */
export function pulse(amount = 0.55) {
  if (prefersReducedMotion() || S.mode === "static") return;
  gsap.killTweensOf(S, "glitch");
  S.glitch = amount;
  gsap.to(S, { glitch: 0, duration: 0.55, ease: "power2.out" });
}

/** Ramp the glitch up before a route change. Resolves when the screen is "between channels". */
export function outPhase(): Promise<void> {
  if (prefersReducedMotion() || S.mode === "static") return Promise.resolve();
  return new Promise((resolve) => {
    gsap.killTweensOf(S, "glitch");
    gsap.to(S, { glitch: 1, duration: 0.18, ease: "none", onComplete: resolve });
  });
}

export const setCrt = (on: boolean) => gsap.to(S, { crt: on ? 1 : 0, duration: prefersReducedMotion() ? 0 : 0.6 });
export const setProgress = (p: number) => {
  S.prog = p;
};
/** The screen bends and splits colour around the pointer; activity decays in the render loop. */
export function pointAt(x: number, y: number) {
  const nx = x / window.innerWidth, ny = 1 - y / window.innerHeight;
  S.mv = Math.min(1, S.mv + Math.hypot(nx - S.mx, ny - S.my) * 6);
  S.mx = nx;
  S.my = ny;
}

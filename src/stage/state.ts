import { gsap } from "../motion/clock";
import { prefersReducedMotion } from "../motion/capability";
import { HOME_PLATE, REGISTERS, hexToRgb, type RegId } from "./registers";

/** Plain mutable state the render reads every frame. Motion code writes numbers here; the Stage never animates on its own. */
export const S = {
  plate: HOME_PLATE,
  reg: "natural" as RegId,
  prog: 0, // scroll progress for the home journey
  progS: 0, // eased progress
  glitch: 0,
  crt: 1,
  duo: 0,
  dim: 0,
  q: 1,
  c0: hexToRgb(REGISTERS.natural.c[0]),
  c1: hexToRgb(REGISTERS.natural.c[1]),
  c2: hexToRgb(REGISTERS.natural.c[2]),
  quality: "high" as "high" | "medium" | "low",
  mode: "full" as "full" | "lite" | "static",
  tick: 0,
};


type Hooks = { load: (url: string) => Promise<void>; apply: (url: string) => void };
let hooks: Hooks | null = null;
export const registerStageHooks = (h: Hooks | null) => {
  hooks = h;
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
export type SceneRequest = { plate: string; reg: RegId; dim?: number };

function apply(req: SceneRequest, instant: boolean) {
  const r = REGISTERS[req.reg];
  S.plate = req.plate;
  S.reg = req.reg;
  hooks?.apply(req.plate);
  const dur = instant ? 0 : 0.5;
  const to = [hexToRgb(r.c[0]), hexToRgb(r.c[1]), hexToRgb(r.c[2])];
  [S.c0, S.c1, S.c2].forEach((arr, i) => gsap.to(arr, { 0: to[i][0], 1: to[i][1], 2: to[i][2], duration: dur }));
  gsap.to(S, { duo: r.duo, dim: req.dim ?? 0, duration: dur });
  emit();
}

/** Tune the screen to a plate and register: glitch up, swap once the texture is ready, glitch down. */
export function requestScene(req: SceneRequest) {
  if (req.plate === S.plate && req.reg === S.reg) {
    gsap.to(S, { dim: req.dim ?? 0, duration: 0.4 });
    return;
  }
  const id = ++seq;
  if (prefersReducedMotion() || S.mode === "static" || !hooks) {
    apply(req, true);
    return;
  }
  gsap.killTweensOf(S, "glitch");
  gsap.to(S, {
    glitch: 1,
    duration: 0.14,
    ease: "none",
    onComplete: () => {
      void (hooks?.load(req.plate) ?? Promise.resolve()).then(() => {
        if (id !== seq) return;
        apply(req, false);
        gsap.to(S, { glitch: 0, duration: 0.6, ease: "power2.out" });
      });
    },
  });
}

/** A glitch burst with no scene change (section boundaries, the Glitch button). */
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

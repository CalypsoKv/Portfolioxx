import { gsap } from "../motion/clock";

/**
 * The cut between pages: the picture collapses to a bright line, the line to a dot, the dot goes out (a CRT
 * switching off); the next page switches on the same way in reverse. The overlay sits above everything, so it
 * works the same over the WebGL screen and the HTML pages.
 */
let el: HTMLElement | null = null;
let off = false;
export const registerPower = (node: HTMLElement | null) => {
  el = node;
};
const parts = () => {
  const q = (c: string) => el!.querySelector<HTMLElement>(c)!;
  return { top: q(".pc-top"), bot: q(".pc-bot"), line: q(".pc-line") };
};

export function powerOff(): Promise<void> {
  if (!el) return Promise.resolve();
  off = true;
  const { top, bot, line } = parts();
  return new Promise((resolve) => {
    gsap.killTweensOf([top, bot, line, el]);
    gsap.timeline({ onComplete: resolve })
      .set(el, { autoAlpha: 1 })
      .set([top, bot], { scaleY: 0 })
      .set(line, { scaleX: 1, scaleY: 1, opacity: 0 })
      .to([top, bot], { scaleY: 1, duration: 0.2, ease: "power3.in" }, 0)
      .to(line, { opacity: 1, duration: 0.08, ease: "none" }, 0.12)
      .to(line, { scaleX: 0.006, duration: 0.16, ease: "power2.in" }, 0.2)
      .to(line, { scaleY: 3, opacity: 0, duration: 0.12, ease: "power1.in" }, 0.36);
  });
}

export function powerOn(): Promise<void> {
  if (!el || !off) return Promise.resolve();
  off = false;
  const { top, bot, line } = parts();
  return new Promise((resolve) => {
    gsap.killTweensOf([top, bot, line, el]);
    gsap.timeline({ onComplete: resolve })
      .set(line, { scaleX: 0.006, scaleY: 1, opacity: 1 })
      .to(line, { scaleX: 1, duration: 0.16, ease: "power2.out" }, 0.04)
      .to([top, bot], { scaleY: 0, duration: 0.34, ease: "expo.out" }, 0.18)
      .to(line, { opacity: 0, duration: 0.2, ease: "none" }, 0.22)
      .set(el, { autoAlpha: 0 });
  });
}

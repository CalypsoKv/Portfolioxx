import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, Draggable, InertiaPlugin, SplitText, ScrambleTextPlugin);

let lenis: Lenis | null = null;
let started = false;

/**
 * One clock for the whole site: the GSAP ticker drives Lenis, ScrollTrigger and (via Stage) the render.
 * Smooth scrolling is optional; without it native scrolling is used and ScrollTrigger reads it directly.
 */
export function startClock({ smooth }: { smooth: boolean }) {
  if (started) return;
  started = true;
  gsap.ticker.lagSmoothing(0);
  if (!smooth) return;
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true, autoRaf: false });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
}

export const getLenis = () => lenis;
export const pauseScroll = () => lenis?.stop();
export const resumeScroll = () => lenis?.start();

export function scrollToY(y: number, { immediate = false } = {}) {
  if (lenis) lenis.scrollTo(y, immediate ? { immediate: true } : { duration: 1.4 });
  else window.scrollTo({ top: y, behavior: immediate ? "instant" : "smooth" });
}

export { gsap, ScrollTrigger, Draggable, SplitText };

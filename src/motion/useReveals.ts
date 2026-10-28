import { useLayoutEffect, type RefObject } from "react";
import { gsap, ScrollTrigger } from "./clock";
import { prefersReducedMotion } from "./capability";

/**
 * Hard-edged reveals: anything marked data-reveal wipes in from the left in six mechanical steps as it enters.
 * Content is visible by default; the wipe only arms when motion is allowed, and only before the first paint.
 */
export function useReveals(root: RefObject<HTMLElement | null>, key: string, enabled: boolean) {
  useLayoutEffect(() => {
    const el = root.current;
    if (!el || !enabled || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>("[data-reveal]", el);
      if (!items.length) return;
      gsap.set(items, { clipPath: "inset(0 100% 0 0)" });
      ScrollTrigger.batch(items, {
        start: "top 92%",
        once: true,
        onEnter: (batch) => gsap.to(batch, { clipPath: "inset(0 0% 0 0)", duration: 0.5, ease: "steps(6)", stagger: 0.07, overwrite: true }),
      });
      ScrollTrigger.refresh();
    }, el);
    return () => ctx.revert();
  }, [root, key, enabled]);
}

export type Tier = "full" | "lite" | "static";

export const prefersReducedMotion = () =>
  typeof matchMedia === "function" &&
  matchMedia("(prefers-reduced-motion: reduce)").matches;

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

type Nav = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

/** Picks the render tier once at boot. Non-production builds accept ?tier=full|lite|static for tests. */
export function detectTier(): { tier: Tier; reason: string } {
  if (!import.meta.env.PROD) {
    const forced = new URLSearchParams(location.search).get("tier");
    if (forced === "full" || forced === "lite" || forced === "static")
      return { tier: forced, reason: "forced" };
  }
  const nav = navigator as Nav;
  if (prefersReducedMotion()) return { tier: "static", reason: "reduced-motion" };
  if (nav.connection?.saveData) return { tier: "static", reason: "save-data" };
  if (!hasWebGL()) return { tier: "static", reason: "no-webgl" };
  const coarse = matchMedia("(pointer: coarse)").matches;
  const lowPower =
    (nav.deviceMemory !== undefined && nav.deviceMemory <= 4) ||
    (navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= 4);
  if (coarse || lowPower) return { tier: "lite", reason: coarse ? "touch" : "low-power" };
  return { tier: "full", reason: "desktop" };
}

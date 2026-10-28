import { createContext, useContext } from "react";
import type { Tier } from "../motion/capability";

export type Shell = {
  tier: Tier;
  openContact: (service?: string) => void;
  openGuide: () => void;
  /** Navigate with the channel-change transition (skipped for reduced motion and the static tier). */
  tune: (to: string) => void;
};
export const ShellContext = createContext<Shell | null>(null);
export const useShell = () => {
  const v = useContext(ShellContext);
  if (!v) throw new Error("useShell must be used inside TvShell");
  return v;
};

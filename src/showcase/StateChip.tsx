import type { ReactNode } from "react";

/** The evidence mark: solid for checkable or owned work, half for reported or read, dashed for the archive. */
export function State({ kind, children }: { kind: "ph" | "dr" | "vf"; children: ReactNode }) {
  return (
    <span className={`state ${kind}`}>
      <i aria-hidden="true" />
      {children}
    </span>
  );
}

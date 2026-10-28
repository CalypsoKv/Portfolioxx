import { useEffect } from "react";
import type { RegId } from "./registers";
import { requestScene } from "./state";

/** Tunes the persistent screen to this route's plate and register. */
export function useScene(plate: string, reg: RegId, dim = 0) {
  useEffect(() => {
    requestScene({ plate, reg, dim });
  }, [plate, reg, dim]);
}

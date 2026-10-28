import { Suspense, lazy, useEffect, useState, useSyncExternalStore, type CSSProperties } from "react";
import { REGISTERS } from "./registers";
import { S, getTick, subscribe } from "./state";

const Stage = lazy(() => import("./Stage"));

/** The CSS version of the screen: used for the static tier, before the WebGL chunk is ready, and if the context is lost. */
function StaticBackdrop() {
  useSyncExternalStore(subscribe, getTick);
  const r = REGISTERS[S.reg];
  return (
    <div
      className="stage-static"
      style={{ backgroundImage: `url(${S.plate})`, "--wash": r.wash, "--wash-mix": r.duo ? 0.55 : 0, "--dim": S.dim } as CSSProperties}
    />
  );
}

export default function StageHost({ mode, onFirstFrame }: { mode: "full" | "lite" | "static"; onFirstFrame: () => void }) {
  const [lost, setLost] = useState(false);
  const live = mode !== "static" && !lost;
  useEffect(() => {
    S.mode = lost ? "static" : mode;
    if (!live) onFirstFrame();
  }, [mode, lost, live, onFirstFrame]);
  return (
    <div className="stage-host" aria-hidden="true">
      <StaticBackdrop />
      {live && (
        <Suspense fallback={null}>
          <Stage mode={mode as "full" | "lite"} onLost={() => setLost(true)} onReady={onFirstFrame} />
        </Suspense>
      )}
    </div>
  );
}

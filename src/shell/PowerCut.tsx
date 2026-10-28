import { useEffect, useRef } from "react";
import { registerPower } from "./power";

export default function PowerCut() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    registerPower(ref.current);
    return () => registerPower(null);
  }, []);
  return (
    <div ref={ref} className="powercut" aria-hidden="true">
      <i className="pc-top" />
      <i className="pc-bot" />
      <i className="pc-line" />
    </div>
  );
}

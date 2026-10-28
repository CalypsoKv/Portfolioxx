import { Link, type LinkProps } from "react-router-dom";
import { useShell } from "./context";

/** A router link that plays the channel-change transition first. Modified clicks fall through to the browser. */
export default function TuneLink({ to, onClick, ...rest }: LinkProps) {
  const { tune } = useShell();
  return (
    <Link
      to={to}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if (typeof to !== "string" || to.startsWith("#")) return;
        e.preventDefault();
        tune(to);
      }}
    />
  );
}

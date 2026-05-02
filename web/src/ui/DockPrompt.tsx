import { useEffect } from "react";
import { useGameStore } from "../state/useGameStore";

export function DockPrompt() {
  const near = useGameStore((s) => s.nearPlanet);
  const mode = useGameStore((s) => s.mode);
  const beginLanding = useGameStore((s) => s.beginLanding);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "d" || e.key === "D") && mode === "approaching") {
        beginLanding();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, beginLanding]);

  if (mode !== "approaching" || !near) return null;

  return (
    <div className="dock-prompt">
      <div className="dock-prompt-eyebrow">LANDING RANGE</div>
      <div className="dock-prompt-title">{near.name}</div>
      <div className="dock-prompt-tagline">{near.tagline}</div>
      <button className="cta-primary" onClick={beginLanding}>
        LAND HERE <kbd>D</kbd>
      </button>
    </div>
  );
}

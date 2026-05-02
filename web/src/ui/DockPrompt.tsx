import { useEffect } from "react";
import { useGameStore } from "../state/useGameStore";

export function DockPrompt() {
  const near = useGameStore((s) => s.nearPlanet);
  const mode = useGameStore((s) => s.mode);
  const requestDock = useGameStore((s) => s.requestDock);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "d" || e.key === "D") && mode === "approaching") {
        requestDock();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, requestDock]);

  if (mode !== "approaching" || !near) return null;

  return (
    <div className="dock-prompt">
      <div className="dock-prompt-eyebrow">DOCKING RANGE</div>
      <div className="dock-prompt-title">{near.name}</div>
      <div className="dock-prompt-tagline">{near.tagline}</div>
      <button className="cta-primary" onClick={requestDock}>
        DOCK HERE <kbd>D</kbd>
      </button>
    </div>
  );
}

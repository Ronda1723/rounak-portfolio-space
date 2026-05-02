import { useEffect } from "react";
import { useGameStore } from "../state/useGameStore";

export function SatelliteDockPrompt() {
  const near = useGameStore((s) => s.nearSatellite);
  const nearPlanet = useGameStore((s) => s.nearPlanet);
  const active = useGameStore((s) => s.activeSatellite);
  const open = useGameStore((s) => s.openSatellite);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "f" || e.key === "F") && near && !active) {
        open(near);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [near, active, open]);

  // Hide if a planet dock prompt is already showing or modal already open
  if (!near || nearPlanet || active) return null;

  return (
    <div className="dock-prompt" style={{ borderColor: near.accent }}>
      <div className="dock-prompt-eyebrow" style={{ color: near.accent }}>
        SATELLITE IN RANGE
      </div>
      <div className="dock-prompt-title">{near.name}</div>
      <div className="dock-prompt-tagline">{near.tagline}</div>
      <button
        className="cta-primary"
        onClick={() => open(near)}
        style={{ borderColor: near.accent, color: near.accent }}
      >
        DOCK HERE <kbd>F</kbd>
      </button>
    </div>
  );
}

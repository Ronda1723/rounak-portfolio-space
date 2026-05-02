import { useGameStore } from "../state/useGameStore";

export function SatelliteTooltip() {
  const hovered = useGameStore((s) => s.hoveredSatellite);
  const active = useGameStore((s) => s.activeSatellite);
  if (!hovered || active) return null;

  return (
    <div className="planet-tooltip" style={{ borderColor: hovered.accent }}>
      <div className="planet-tooltip-eyebrow" style={{ color: hovered.accent }}>
        SATELLITE
      </div>
      <div className="planet-tooltip-title">{hovered.name}</div>
      <div className="planet-tooltip-tagline">{hovered.tagline}</div>
      <div className="planet-tooltip-footer">CLICK TO OPEN</div>
    </div>
  );
}

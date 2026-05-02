import { useGameStore } from "../state/useGameStore";

export function PlanetTooltip() {
  const hovered = useGameStore((s) => s.hoveredPlanet);
  const mode = useGameStore((s) => s.mode);

  if (!hovered) return null;
  if (mode === "docked" || mode === "exploring" || mode === "warping") return null;

  return (
    <div className="planet-tooltip">
      <div className="planet-tooltip-eyebrow">PLANETARY DATA</div>
      <div className="planet-tooltip-title">{hovered.name}</div>
      <div className="planet-tooltip-tagline">{hovered.tagline}</div>

      <div className="planet-tooltip-stats">
        <div className="tooltip-stat">
          <span className="tooltip-stat-label">TEMP</span>
          <span className="tooltip-stat-value">{hovered.stats.temperature}</span>
        </div>
        <div className="tooltip-stat">
          <span className="tooltip-stat-label">ATMOS</span>
          <span className="tooltip-stat-value">{hovered.stats.atmosphere}</span>
        </div>
        <div className="tooltip-stat">
          <span className="tooltip-stat-label">DAY</span>
          <span className="tooltip-stat-value">{hovered.stats.dayLength}</span>
        </div>
        <div className="tooltip-stat">
          <span className="tooltip-stat-label">GRAV</span>
          <span className="tooltip-stat-value">{hovered.stats.gravity}</span>
        </div>
      </div>

      <div className="planet-tooltip-footer">CLICK TO ENGAGE AUTOPILOT</div>
    </div>
  );
}

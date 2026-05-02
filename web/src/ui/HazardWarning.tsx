import { useGameStore } from "../state/useGameStore";

const DEATH_AT = 5.0;

export function HazardWarning() {
  const hazard = useGameStore((s) => s.hazard);
  const dist = useGameStore((s) => s.hazardDistance);
  const dangerTime = useGameStore((s) => s.sunDangerTime);

  if (hazard === "none") return null;

  const isCritical = hazard === "critical";
  const remaining = Math.max(0, DEATH_AT - dangerTime);
  const progress = Math.min(1, dangerTime / DEATH_AT);
  const stage = isCritical
    ? remaining < 1.5
      ? "imminent"
      : remaining < 3
      ? "severe"
      : "critical"
    : "caution";

  return (
    <div className={`hazard-warning ${stage}`}>
      <div className="hazard-bar">
        <span className="hazard-icon">▲</span>
        <span className="hazard-eyebrow">
          {isCritical ? "RESTRICTED ZONE" : "PROXIMITY ALERT"}
        </span>
      </div>
      <div className="hazard-title">
        {stage === "imminent"
          ? "DESTRUCTION IMMINENT"
          : stage === "severe"
          ? "HULL FAILURE NEAR"
          : isCritical
          ? "ROCKET WILL BE DESTROYED"
          : "APPROACHING SOLAR HAZARD"}
      </div>
      <div className="hazard-body">
        {isCritical
          ? "Reverse thrust now. Move away from the star."
          : "Maintain safe distance from the star."}
      </div>
      {isCritical && (
        <div className="hazard-countdown">
          <div className="hazard-countdown-bar">
            <span style={{ width: `${progress * 100}%` }} />
          </div>
          <div className="hazard-countdown-meta">
            <span>T-{remaining.toFixed(1)}s</span>
            <span>{dist.toFixed(2)} u</span>
          </div>
        </div>
      )}
      {!isCritical && (
        <div className="hazard-meter">
          <span className="hazard-meter-label">DIST</span>
          <span className="hazard-meter-value">{dist.toFixed(2)} u</span>
        </div>
      )}
    </div>
  );
}

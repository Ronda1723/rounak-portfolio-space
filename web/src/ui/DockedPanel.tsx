import { useGameStore } from "../state/useGameStore";

export function DockedPanel() {
  const docked = useGameStore((s) => s.dockedPlanet);
  const mode = useGameStore((s) => s.mode);
  const undock = useGameStore((s) => s.undock);
  const startExplore = useGameStore((s) => s.startExplore);

  if (mode !== "docked" || !docked) return null;

  const b = docked.briefing;
  const s = docked.stats;

  return (
    <aside className="docked-panel">
      <div className="docked-panel-header">
        <div className="docked-panel-eyebrow">DOCKED · {b.period.toUpperCase()}</div>
        <h2 className="docked-panel-title">{docked.name}</h2>
        <div className="docked-panel-tagline">{docked.tagline}</div>
      </div>

      <div className="docked-panel-body">
        <div className="docked-panel-section">
          <div className="section-heading">Planetary Data</div>
          <div className="docked-panel-stats">
            <div className="stat-cell">
              <span className="stat-label">TEMPERATURE</span>
              <span className="stat-value">{s.temperature}</span>
            </div>
            <div className="stat-cell">
              <span className="stat-label">ATMOSPHERE</span>
              <span className="stat-value">{s.atmosphere}</span>
            </div>
            <div className="stat-cell">
              <span className="stat-label">DAY LENGTH</span>
              <span className="stat-value">{s.dayLength}</span>
            </div>
            <div className="stat-cell">
              <span className="stat-label">GRAVITY</span>
              <span className="stat-value">{s.gravity}</span>
            </div>
          </div>
        </div>

        <div className="docked-panel-section">
          <div className="section-heading">Project File</div>
          <div className="meta-row">
            <span className="meta-label">ROLE</span>
            <span className="meta-value">{b.role}</span>
          </div>
        </div>

        <p className="docked-panel-summary">{b.summary}</p>

        <div className="docked-panel-stack">
          {b.stack.map((s) => (
            <span key={s} className="stack-pill">{s}</span>
          ))}
        </div>
      </div>

      <div className="docked-panel-footer">
        <button className="cta-primary block" onClick={startExplore}>
          EXPLORE PROJECT →
        </button>
        <button className="cta-secondary block" onClick={undock}>
          ↩ RETURN TO SPACE
        </button>
      </div>
    </aside>
  );
}

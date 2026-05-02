import { useEffect } from "react";
import { useGameStore } from "../state/useGameStore";

export function ProjectModal() {
  const mode = useGameStore((s) => s.mode);
  const docked = useGameStore((s) => s.dockedPlanet);
  const stopExplore = useGameStore((s) => s.stopExplore);

  useEffect(() => {
    if (mode !== "exploring") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") stopExplore();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, stopExplore]);

  if (mode !== "exploring" || !docked) return null;

  const b = docked.briefing;

  return (
    <div className="project-modal" onClick={stopExplore}>
      <div className="project-modal-inner" onClick={(e) => e.stopPropagation()}>
        <button className="project-modal-close" onClick={stopExplore}>
          × CLOSE
        </button>

        <div className="project-modal-cover" style={{ background: `radial-gradient(ellipse at center, ${docked.color}33 0%, transparent 70%)` }}>
          <div className="project-modal-eyebrow">CASE STUDY</div>
          <h1 className="project-modal-title">{docked.name}</h1>
          <div className="project-modal-tagline">{docked.tagline}</div>
        </div>

        <div className="project-modal-body">
          <div className="project-modal-meta">
            <div>
              <div className="meta-label">ROLE</div>
              <div className="meta-value">{b.role}</div>
            </div>
            <div>
              <div className="meta-label">PERIOD</div>
              <div className="meta-value">{b.period}</div>
            </div>
            <div>
              <div className="meta-label">STACK</div>
              <div className="meta-value">{b.stack.join(", ")}</div>
            </div>
          </div>

          <h3 className="section-heading">Overview</h3>
          <p className="project-modal-summary">{b.summary}</p>

          <h3 className="section-heading">Highlights</h3>
          <ul className="project-modal-bullets">
            {b.bullets.map((bullet, i) => (
              <li key={i}>{bullet}</li>
            ))}
          </ul>

          {b.link && (
            <a className="project-modal-link" href={b.link.url} target="_blank" rel="noreferrer">
              {b.link.label} →
            </a>
          )}

          <div className="project-modal-footer">
            <button className="cta-primary" onClick={stopExplore}>
              ↩ BACK TO COCKPIT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

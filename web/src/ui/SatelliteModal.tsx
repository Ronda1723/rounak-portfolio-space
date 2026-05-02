import { useEffect } from "react";
import { useGameStore } from "../state/useGameStore";

export function SatelliteModal() {
  const sat = useGameStore((s) => s.activeSatellite);
  const close = useGameStore((s) => s.closeSatellite);

  useEffect(() => {
    if (!sat) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sat, close]);

  if (!sat) return null;

  return (
    <div className="project-modal" onClick={close}>
      <div className="project-modal-inner" onClick={(e) => e.stopPropagation()}>
        <button className="project-modal-close" onClick={close}>
          × CLOSE
        </button>

        <div
          className="project-modal-cover"
          style={{
            background: `radial-gradient(ellipse at center, ${sat.accent}33 0%, transparent 70%)`,
          }}
        >
          <div className="project-modal-eyebrow">SATELLITE</div>
          <h1 className="project-modal-title">{sat.name}</h1>
          <div className="project-modal-tagline">{sat.tagline}</div>
        </div>

        <div className="project-modal-body">
          <p className="project-modal-summary">{sat.intro}</p>

          <h3 className="section-heading">
            {sat.id === "research" ? "Threads" : "Pieces"}
          </h3>
          <ul className="satellite-list">
            {sat.entries.map((e, i) => (
              <li key={i} className="satellite-entry">
                <div className="satellite-entry-head">
                  <span className="satellite-entry-title">
                    {e.url ? (
                      <a href={e.url} target="_blank" rel="noreferrer">
                        {e.title} →
                      </a>
                    ) : (
                      e.title
                    )}
                  </span>
                  {e.date && <span className="satellite-entry-date">{e.date}</span>}
                </div>
                <p className="satellite-entry-blurb">{e.blurb}</p>
              </li>
            ))}
          </ul>

          <div className="project-modal-footer">
            <button className="cta-primary" onClick={close}>
              ↩ BACK TO COCKPIT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

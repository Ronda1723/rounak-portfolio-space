import { useEffect } from "react";
import { useGameStore } from "../state/useGameStore";

export function ArtifactPanel() {
  const artifact = useGameStore((s) => s.activeArtifact);
  const close = useGameStore((s) => s.closeArtifact);

  useEffect(() => {
    if (!artifact) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [artifact, close]);

  if (!artifact) return null;

  return (
    <aside
      className="artifact-panel"
      style={{ borderLeftColor: artifact.color }}
    >
      <button className="artifact-panel-close" onClick={close}>
        × CLOSE
      </button>

      <div className="artifact-panel-eyebrow" style={{ color: artifact.color }}>
        ARTIFACT
      </div>
      <h2 className="artifact-panel-title">{artifact.name}</h2>

      <div
        className="artifact-panel-divider"
        style={{ background: artifact.color }}
      />

      <p className="artifact-panel-blurb">{artifact.blurb}</p>

      {artifact.detail && (
        <p className="artifact-panel-detail">{artifact.detail}</p>
      )}
    </aside>
  );
}

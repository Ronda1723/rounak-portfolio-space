import { useEffect } from "react";
import { useGameStore } from "../state/useGameStore";

export function RoomHUD() {
  const mode = useGameStore((s) => s.mode);
  const docked = useGameStore((s) => s.dockedPlanet);
  const leaveRoom = useGameStore((s) => s.leaveRoom);
  const activeArtifact = useGameStore((s) => s.activeArtifact);

  useEffect(() => {
    if (mode !== "exploring") return;
    const onKey = (e: KeyboardEvent) => {
      // Only treat ESC as "leave room" when no artifact panel is open
      // (ArtifactPanel handles its own ESC to close itself first).
      if (e.key === "Escape" && !activeArtifact) {
        leaveRoom();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, leaveRoom, activeArtifact]);

  if (mode !== "exploring" || !docked) return null;

  return (
    <div className="room-hud">
      <div className="room-hud-meta">
        <div className="room-hud-eyebrow">MUSEUM · {docked.name.toUpperCase()}</div>
        <div className="room-hud-tagline">{docked.tagline}</div>
      </div>
      <button className="room-hud-leave" onClick={leaveRoom}>
        ↩ RETURN TO COCKPIT <kbd>ESC</kbd>
      </button>
    </div>
  );
}

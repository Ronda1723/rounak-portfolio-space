import { useGameStore } from "../state/useGameStore";
import { Speedometer } from "./Speedometer";

export function HUD() {
  const target = useGameStore((s) => s.targetPlanet);
  const autopilot = useGameStore((s) => s.isAutopiloting);
  const listening = useGameStore((s) => s.voiceListening);
  const transcript = useGameStore((s) => s.voiceTranscript);
  const mode = useGameStore((s) => s.mode);
  const docked = useGameStore((s) => s.dockedPlanet);
  const near = useGameStore((s) => s.nearPlanet);
  const nosActive = useGameStore((s) => s.nosActive);

  const status = (() => {
    if (mode === "exploded") return { text: "VESSEL DESTROYED", kind: "abort" };
    if (autopilot && target) return { text: `AUTOPILOT → ${target.name}`, kind: "autopilot" };
    if (mode === "docked" && docked) return { text: `DOCKED · ${docked.name}`, kind: "landed" };
    if (mode === "approaching" && near) return { text: `APPROACHING ${near.name}`, kind: "landed" };
    if (nosActive) return { text: "NOS · BOOST", kind: "autopilot" };
    return { text: "CRUISE", kind: "idle" };
  })();

  return (
    <div className="hud">
      <div className="hud-corner top-left">
        <div className="hud-block">
          <div className="hud-stack">
            <span className="hud-label">MISSION CONTROL</span>
            <span className="hud-value">ROUNAK · SPACEX PORTFOLIO</span>
          </div>
        </div>
      </div>

      <div className="hud-center-top">
        <div className={`hud-pill ${status.kind}`}>
          <span className="dot" /> {status.text.toUpperCase()}
        </div>
      </div>

      <div className="hud-corner bottom-left">
        <Speedometer />
        {mode !== "exploring" && mode !== "docked" && mode !== "exploded" && (
          <div className="hud-controls">
            <kbd>W</kbd> thrust &nbsp; <kbd>S</kbd> reverse &nbsp;
            <kbd>SHIFT</kbd> NOS &nbsp; <kbd>SPACE</kbd> brake &nbsp;
            <kbd>← →</kbd> / right-drag yaw &nbsp;
            <kbd>click</kbd> planet · <kbd>D</kbd> dock · <kbd>V</kbd> voice
          </div>
        )}
      </div>

      <div className="hud-corner bottom-right">
        {listening ? (
          <div className="voice-panel listening">
            <span className="voice-led" /> LISTENING
            <div className="voice-text">{transcript || "speak…"}</div>
          </div>
        ) : transcript && mode !== "docked" && mode !== "exploring" ? (
          <div className="voice-panel">
            <span className="voice-led off" /> {transcript}
          </div>
        ) : null}
      </div>
    </div>
  );
}

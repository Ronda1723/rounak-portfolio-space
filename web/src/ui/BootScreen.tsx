import { useEffect, useState } from "react";

const STEPS = [
  { label: "POWER", value: "NOMINAL" },
  { label: "GUIDANCE", value: "LOCK" },
  { label: "TELEMETRY", value: "ONLINE" },
  { label: "VOICE LINK", value: "READY" },
  { label: "MISSION", value: "AUTHORIZED" },
];

export function BootScreen() {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const start = performance.now();
    const DUR = 2400;
    let raf = 0;
    const tick = () => {
      const t = Math.min(1, (performance.now() - start) / DUR);
      setProgress(t);
      if (t < 1) raf = requestAnimationFrame(tick);
      else {
        setDone(true);
        setTimeout(() => setHidden(true), 700);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (hidden) return null;

  const stepUnlocked = (i: number) => progress >= (i + 1) / (STEPS.length + 1);

  return (
    <div className={`boot ${done ? "boot--done" : ""}`}>
      <div className="boot-grid" />
      <div className="boot-inner">
        <div className="boot-eyebrow">MISSION CONTROL · CAPE CANAVERAL</div>
        <h1 className="boot-title">
          ROUNAK<span className="boot-title-accent">·</span>LENKA
        </h1>
        <div className="boot-sub">
          DESIGNER & ENGINEER · INTERACTIVE PORTFOLIO ARRAY
        </div>

        <div className="boot-checklist">
          {STEPS.map((s, i) => (
            <div
              key={s.label}
              className={`boot-row ${stepUnlocked(i) ? "ok" : ""}`}
            >
              <span className="boot-row-label">{s.label}</span>
              <span className="boot-row-leader" />
              <span className="boot-row-value">
                {stepUnlocked(i) ? s.value : "··· "}
              </span>
              <span className="boot-row-status">
                {stepUnlocked(i) ? "✓" : "○"}
              </span>
            </div>
          ))}
        </div>

        <div className="boot-progress">
          <div className="boot-progress-bar">
            <span style={{ width: `${progress * 100}%` }} />
          </div>
          <div className="boot-progress-meta">
            <span>SYSTEMS: {Math.floor(progress * 100)}%</span>
            <span>T-MINUS {Math.max(0, (2.4 - progress * 2.4)).toFixed(1)}s</span>
          </div>
        </div>

        {done && <div className="boot-cta">CLEARED FOR FLIGHT</div>}
      </div>
    </div>
  );
}

import { useGameStore } from "../state/useGameStore";

const MAX = 28;
const SIZE = 130;
const STROKE = 8;
const RADIUS = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * RADIUS;
// Show only ~280° of arc for racing-gauge feel.
const ARC_FRAC = 0.78;
const ROTATION = 90 + (1 - ARC_FRAC) * 180;

function arc(value: number): { dasharray: string; dashoffset: number } {
  const len = CIRC * ARC_FRAC * value;
  return {
    dasharray: `${len} ${CIRC}`,
    dashoffset: 0,
  };
}

export function Speedometer() {
  const speed = useGameStore((s) => s.speed);
  const nosFuel = useGameStore((s) => s.nosFuel);
  const nosActive = useGameStore((s) => s.nosActive);

  const speedNorm = Math.max(0, Math.min(1, speed / MAX));
  const nosNorm = Math.max(0, Math.min(1, nosFuel));

  const speedArc = arc(speedNorm);

  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const innerR = RADIUS - STROKE - 2;

  // Tick marks every 5 m/s
  const ticks: { x1: number; y1: number; x2: number; y2: number; major: boolean }[] = [];
  const tickStart = ROTATION;
  const tickEnd = ROTATION + ARC_FRAC * 360;
  for (let v = 0; v <= MAX; v += 2) {
    const t = v / MAX;
    const a = (tickStart + (tickEnd - tickStart) * t) * (Math.PI / 180);
    const major = v % 10 === 0;
    const len = major ? 9 : 5;
    const r2 = RADIUS - STROKE / 2 - 4;
    const r1 = r2 - len;
    ticks.push({
      x1: cx + Math.cos(a) * r1,
      y1: cy + Math.sin(a) * r1,
      x2: cx + Math.cos(a) * r2,
      y2: cy + Math.sin(a) * r2,
      major,
    });
  }

  return (
    <div className={`speedometer ${nosActive ? "nos-active" : ""}`}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <g transform={`rotate(${ROTATION} ${cx} ${cy})`}>
          {/* Speed track */}
          <circle
            cx={cx}
            cy={cy}
            r={RADIUS}
            fill="none"
            stroke="rgba(91, 192, 235, 0.16)"
            strokeWidth={STROKE}
            strokeDasharray={`${CIRC * ARC_FRAC} ${CIRC}`}
            strokeLinecap="round"
          />
          {/* Speed value arc */}
          <circle
            cx={cx}
            cy={cy}
            r={RADIUS}
            fill="none"
            stroke={nosActive ? "url(#nosGrad)" : "url(#speedGrad)"}
            strokeWidth={STROKE}
            strokeDasharray={speedArc.dasharray}
            strokeDashoffset={speedArc.dashoffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.12s linear" }}
          />
          {/* Inner NOS track */}
          <circle
            cx={cx}
            cy={cy}
            r={innerR}
            fill="none"
            stroke="rgba(255, 179, 0, 0.1)"
            strokeWidth={3}
            strokeDasharray={`${2 * Math.PI * innerR * ARC_FRAC} ${2 * Math.PI * innerR}`}
            strokeLinecap="round"
          />
          {/* Inner NOS value arc */}
          <circle
            cx={cx}
            cy={cy}
            r={innerR}
            fill="none"
            stroke="url(#nosFuelGrad)"
            strokeWidth={3}
            strokeDasharray={`${2 * Math.PI * innerR * ARC_FRAC * nosNorm} ${2 * Math.PI * innerR}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.15s linear" }}
          />
        </g>

        {/* Tick marks */}
        <g>
          {ticks.map((t, i) => (
            <line
              key={i}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke="rgba(91, 192, 235, 0.45)"
              strokeWidth={t.major ? 1.2 : 0.6}
            />
          ))}
        </g>

        <defs>
          <linearGradient id="speedGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5BC0EB" />
            <stop offset="100%" stopColor="#00E5FF" />
          </linearGradient>
          <linearGradient id="nosGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFB300" />
            <stop offset="100%" stopColor="#FF3B30" />
          </linearGradient>
          <linearGradient id="nosFuelGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFB300" />
            <stop offset="100%" stopColor="#FFD58B" />
          </linearGradient>
        </defs>
      </svg>

      <div className="speedometer-readout">
        <div className="speedometer-value">{speed.toFixed(1)}</div>
        <div className="speedometer-unit">m/s</div>
      </div>

      <div className="speedometer-nos">
        <span className="nos-label">NOS</span>
        <span className="nos-bar">
          <span
            className={`nos-fill ${nosActive ? "active" : ""}`}
            style={{ width: `${nosNorm * 100}%` }}
          />
        </span>
        <span className="nos-key">
          <kbd>SHIFT</kbd> + <kbd>W</kbd>
        </span>
      </div>
    </div>
  );
}

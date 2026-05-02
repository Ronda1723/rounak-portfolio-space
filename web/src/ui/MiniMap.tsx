import { useEffect, useRef } from "react";
import { PLANETS } from "../config/planets";
import { planetWorldPositions } from "../scene/planetWorldPositions";
import { rocketTracker } from "../scene/rocketTracker";
import { useGameStore } from "../state/useGameStore";

const SIZE = 200;
const MAX_RADIUS = 32; // world units that map to map edge
const SCALE = SIZE / 2 / MAX_RADIUS;

export function MiniMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const target = useGameStore((s) => s.targetPlanet);
  const docked = useGameStore((s) => s.dockedPlanet);
  const near = useGameStore((s) => s.nearPlanet);
  const hovered = useGameStore((s) => s.hoveredPlanet);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = SIZE * ratio;
    canvas.height = SIZE * ratio;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(ratio, ratio);

    let rafId = 0;

    const cx = SIZE / 2;
    const cy = SIZE / 2;

    const w2m = (x: number, z: number) => ({
      x: cx + x * SCALE,
      y: cy + z * SCALE,
    });

    const draw = () => {
      ctx.clearRect(0, 0, SIZE, SIZE);

      // Frame
      ctx.strokeStyle = "rgba(91, 192, 235, 0.18)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, SIZE / 2 - 1, 0, Math.PI * 2);
      ctx.stroke();

      // Crosshairs
      ctx.strokeStyle = "rgba(91, 192, 235, 0.08)";
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(SIZE, cy);
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, SIZE);
      ctx.stroke();

      // Orbital rings
      ctx.strokeStyle = "rgba(91, 192, 235, 0.18)";
      ctx.lineWidth = 0.6;
      for (const p of PLANETS) {
        ctx.beginPath();
        ctx.arc(cx, cy, p.orbitRadius * SCALE, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Sun
      const sunGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 12);
      sunGrad.addColorStop(0, "#ffd58b");
      sunGrad.addColorStop(1, "rgba(255, 200, 100, 0)");
      ctx.fillStyle = sunGrad;
      ctx.fillRect(cx - 14, cy - 14, 28, 28);
      ctx.fillStyle = "#ffd58b";
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();

      // Planets
      for (const p of PLANETS) {
        const wp = planetWorldPositions.get(p.id);
        if (!wp) continue;
        const m = w2m(wp.x, wp.z);
        const isSelected =
          docked?.id === p.id ||
          near?.id === p.id ||
          target?.id === p.id ||
          hovered?.id === p.id;
        const r = isSelected ? 5 : 3.5;
        if (isSelected) {
          ctx.fillStyle = "rgba(91, 192, 235, 0.18)";
          ctx.beginPath();
          ctx.arc(m.x, m.y, r * 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(m.x, m.y, r, 0, Math.PI * 2);
        ctx.fill();
        if (isSelected) {
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Rocket — triangle pointing in heading direction
      const rp = rocketTracker.position;
      const rm = w2m(rp.x, rp.z);
      // Forward in world from yaw: rocket forward = -Z rotated by yaw -> (sin(y)*-1, 0, cos(y)*-1)
      const yaw = rocketTracker.yaw;
      const fx = -Math.sin(yaw);
      const fz = -Math.cos(yaw);
      ctx.save();
      ctx.translate(rm.x, rm.y);
      ctx.rotate(Math.atan2(fz, fx) - Math.PI / 2);
      // Glow under rocket
      ctx.fillStyle = "rgba(122, 255, 173, 0.28)";
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();
      // Triangle
      ctx.fillStyle = "#7AFFAD";
      ctx.beginPath();
      ctx.moveTo(0, -7);
      ctx.lineTo(5, 5);
      ctx.lineTo(0, 2.5);
      ctx.lineTo(-5, 5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      rafId = requestAnimationFrame(draw);
    };
    rafId = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(rafId);
  }, [target, docked, near, hovered]);

  return (
    <div className="minimap">
      <div className="minimap-label">
        <span>NAV · ORBITAL PLANE</span>
        <span className="minimap-coord">
          X{rocketTracker.position.x.toFixed(0)} Z{rocketTracker.position.z.toFixed(0)}
        </span>
      </div>
      <div className="minimap-canvas-wrap">
        <canvas
          ref={canvasRef}
          style={{ width: SIZE, height: SIZE, display: "block" }}
        />
        <span className="minimap-corner tl" />
        <span className="minimap-corner tr" />
        <span className="minimap-corner bl" />
        <span className="minimap-corner br" />
      </div>
    </div>
  );
}

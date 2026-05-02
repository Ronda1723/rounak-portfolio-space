import { useEffect, useRef } from "react";
import { useGameStore } from "../state/useGameStore";

const STREAK_COUNT = 220;

export function WarpOverlay() {
  const mode = useGameStore((s) => s.mode);
  const setMode = useGameStore((s) => s.setMode);
  const setWarp = useGameStore((s) => s.setWarpProgress);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (mode !== "warping") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    type Streak = { angle: number; radius: number; speed: number; len: number };
    const streaks: Streak[] = [];
    for (let i = 0; i < STREAK_COUNT; i++) {
      streaks.push({
        angle: Math.random() * Math.PI * 2,
        radius: Math.random() * 60,
        speed: 1 + Math.random() * 2,
        len: 8 + Math.random() * 30,
      });
    }

    const start = performance.now();
    const DURATION = 1800;

    const tick = () => {
      const now = performance.now();
      const t = Math.min(1, (now - start) / DURATION);
      setWarp(t);

      // background tint that ramps
      ctx.fillStyle = `rgba(5, 7, 10, ${0.18 + t * 0.5})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // streaks
      const accel = 1 + t * 14;
      ctx.lineCap = "round";
      for (const s of streaks) {
        s.radius += s.speed * accel;
        if (s.radius > Math.max(canvas.width, canvas.height)) {
          s.radius = 0;
          s.angle = Math.random() * Math.PI * 2;
        }
        const x1 = cx + Math.cos(s.angle) * s.radius;
        const y1 = cy + Math.sin(s.angle) * s.radius;
        const x2 = cx + Math.cos(s.angle) * (s.radius + s.len * accel * 0.4);
        const y2 = cy + Math.sin(s.angle) * (s.radius + s.len * accel * 0.4);
        const alpha = Math.min(1, 0.2 + t);
        ctx.strokeStyle = `rgba(180, 220, 255, ${alpha})`;
        ctx.lineWidth = 1 + t * 1.4;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // flash near end
      if (t > 0.78) {
        const f = (t - 0.78) / 0.22;
        ctx.fillStyle = `rgba(255, 255, 255, ${f * 0.8})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        setMode("exploring");
        setWarp(0);
      }
    };
    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [mode, setMode, setWarp]);

  if (mode !== "warping") return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        pointerEvents: "none",
      }}
    />
  );
}

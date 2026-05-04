import { useEffect, useRef, useState } from "react";
import { useGameStore } from "../state/useGameStore";

const DURATION = 1100;

type Particle = { x: number; y: number; vx: number; vy: number; life: number; ttl: number; size: number; hue: number };

export function Explosion() {
  const mode = useGameStore((s) => s.mode);
  const resetSession = useGameStore((s) => s.resetSession);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    if (mode !== "exploded") {
      setShowText(false);
      return;
    }
    setShowText(true);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);
    const W = window.innerWidth;
    const H = window.innerHeight;
    const cx = W / 2;
    const cy = H / 2;

    const particles: Particle[] = [];
    for (let i = 0; i < 240; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 540;
      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        ttl: 0.6 + Math.random() * 1.4,
        size: 1 + Math.random() * 3,
        hue: 18 + Math.random() * 30,
      });
    }

    const start = performance.now();
    let raf = 0;

    const tick = () => {
      let t = 1;
      try {
      const now = performance.now();
      t = Math.min(1, (now - start) / DURATION);
      const dt = 1 / 60;

      ctx.clearRect(0, 0, W, H);

      // Background heat tint
      const tintAlpha = t < 0.15 ? 0.85 : Math.max(0, 0.65 - t * 0.7);
      ctx.fillStyle = `rgba(255, ${100 + (1 - t) * 80}, 30, ${tintAlpha})`;
      ctx.fillRect(0, 0, W, H);

      // White core flash
      if (t < 0.18) {
        const f = 1 - t / 0.18;
        ctx.fillStyle = `rgba(255, 255, 255, ${f * 0.95})`;
        ctx.fillRect(0, 0, W, H);
      }

      // Shockwave ring
      if (t < 0.6) {
        const r = t * 700;
        ctx.strokeStyle = `rgba(255, 200, 90, ${(1 - t / 0.6) * 0.7})`;
        ctx.lineWidth = 6 * (1 - t / 0.6);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Particles
      for (const p of particles) {
        if (p.life >= p.ttl) continue;
        p.life += dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.985;
        p.vy *= 0.985;
        const lf = Math.max(0, 1 - p.life / p.ttl);
        const r = p.size * lf;
        if (r <= 0) continue;
        ctx.fillStyle = `hsla(${p.hue}, 90%, ${50 + lf * 40}%, ${lf})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Fade to black at the end
      if (t > 0.7) {
        const f = (t - 0.7) / 0.3;
        ctx.fillStyle = `rgba(5, 7, 10, ${Math.min(1, f)})`;
        ctx.fillRect(0, 0, W, H);
      }

      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        resetSession();
      }
      } catch (err) {
        console.error("Explosion render failed", err);
        resetSession();
      }
    };
    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [mode, resetSession]);

  if (mode !== "exploded") return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 300,
          pointerEvents: "none",
        }}
      />
      {showText && (
        <div className="explosion-text">
          <div className="explosion-eyebrow">VESSEL DESTROYED</div>
          <div className="explosion-title">CONTACT WITH STAR</div>
          <div className="explosion-sub">REINITIALIZING SESSION…</div>
        </div>
      )}
    </>
  );
}

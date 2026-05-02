import { useEffect, useRef } from "react";
import { useGameStore } from "../state/useGameStore";

export function useEngineAudio() {
  const ctxRef = useRef<AudioContext | null>(null);
  const rumbleGainRef = useRef<GainNode | null>(null);
  const ambientGainRef = useRef<GainNode | null>(null);
  const alarmGainRef = useRef<GainNode | null>(null);
  const alarmOscRef = useRef<OscillatorNode | null>(null);
  const lpRef = useRef<BiquadFilterNode | null>(null);
  const speed = useGameStore((s) => s.speed);
  const thrust = useGameStore((s) => s.thrust);
  const hazard = useGameStore((s) => s.hazard);
  const sunDangerTime = useGameStore((s) => s.sunDangerTime);
  const mode = useGameStore((s) => s.mode);

  useEffect(() => {
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctor();
      ctxRef.current = ctx;

      // Engine rumble
      const bufferSize = 2 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 3.5;
      }
      const rumble = ctx.createBufferSource();
      rumble.buffer = buffer;
      rumble.loop = true;
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass"; lp.frequency.value = 220;
      const rGain = ctx.createGain();
      rGain.gain.value = 0;
      rumble.connect(lp).connect(rGain).connect(ctx.destination);
      rumble.start();
      rumbleGainRef.current = rGain;
      lpRef.current = lp;

      // Ambient drone
      const droneGain = ctx.createGain();
      droneGain.gain.value = 0.06;
      droneGain.connect(ctx.destination);
      const o1 = ctx.createOscillator();
      o1.type = "sine"; o1.frequency.value = 55;
      const o2 = ctx.createOscillator();
      o2.type = "sine"; o2.frequency.value = 55.4;
      const o3 = ctx.createOscillator();
      o3.type = "triangle"; o3.frequency.value = 110;
      const o3g = ctx.createGain();
      o3g.gain.value = 0.18;
      o1.connect(droneGain);
      o2.connect(droneGain);
      o3.connect(o3g).connect(droneGain);
      o1.start(); o2.start(); o3.start();
      ambientGainRef.current = droneGain;

      // Alarm
      const alarmOsc = ctx.createOscillator();
      alarmOsc.type = "square";
      alarmOsc.frequency.value = 880;
      const alarmGain = ctx.createGain();
      alarmGain.gain.value = 0;
      alarmOsc.connect(alarmGain).connect(ctx.destination);
      alarmOsc.start();
      alarmOscRef.current = alarmOsc;
      alarmGainRef.current = alarmGain;
    };

    const onFirst = () => {
      start();
      window.removeEventListener("keydown", onFirst);
      window.removeEventListener("pointerdown", onFirst);
    };
    window.addEventListener("keydown", onFirst);
    window.addEventListener("pointerdown", onFirst);
    return () => {
      window.removeEventListener("keydown", onFirst);
      window.removeEventListener("pointerdown", onFirst);
    };
  }, []);

  // Engine rumble + lp filter
  useEffect(() => {
    const ctx = ctxRef.current;
    const rGain = rumbleGainRef.current;
    const lp = lpRef.current;
    if (!ctx || !rGain || !lp) return;
    const target = Math.min(1, thrust * 0.6 + speed * 0.012);
    rGain.gain.linearRampToValueAtTime(target * 0.4, ctx.currentTime + 0.12);
    lp.frequency.linearRampToValueAtTime(180 + speed * 8, ctx.currentTime + 0.15);
  }, [thrust, speed]);

  // Alarm pattern — escalates with sunDangerTime in critical zone.
  useEffect(() => {
    const ctx = ctxRef.current;
    const aGain = alarmGainRef.current;
    const aOsc = alarmOscRef.current;
    if (!ctx || !aGain || !aOsc) return;

    if (mode === "exploded") {
      aGain.gain.cancelScheduledValues(ctx.currentTime);
      aGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.08);
      return;
    }

    if (hazard === "none") {
      aGain.gain.cancelScheduledValues(ctx.currentTime);
      aGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
      return;
    }

    let period = 0.7;
    let pulse = 0.18;
    let peak = 0.06;
    let pitch = 740;
    if (hazard === "critical") {
      // Closer to death = faster + higher.
      const t = Math.min(1, sunDangerTime / 5);
      period = 0.32 - t * 0.22; // 0.32 → 0.10
      pulse = 0.16 - t * 0.08;
      peak = 0.18 + t * 0.18; // 0.18 → 0.36
      pitch = 1100 + t * 600; // 1100 → 1700 Hz
    }
    aOsc.frequency.value = pitch;

    aGain.gain.cancelScheduledValues(ctx.currentTime);
    aGain.gain.setValueAtTime(0, ctx.currentTime);
    for (let i = 0; i < 6; i++) {
      const t0 = ctx.currentTime + i * period;
      aGain.gain.setValueAtTime(0, t0);
      aGain.gain.linearRampToValueAtTime(peak, t0 + 0.02);
      aGain.gain.linearRampToValueAtTime(peak, t0 + pulse);
      aGain.gain.linearRampToValueAtTime(0, t0 + pulse + 0.04);
    }
  }, [hazard, sunDangerTime, mode]);

  // Boom on explosion.
  useEffect(() => {
    if (mode !== "exploded") return;
    const ctx = ctxRef.current;
    if (!ctx) return;
    // White-noise burst with falling pitch.
    const bufferSize = ctx.sampleRate * 1.6;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.45));
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(2000, ctx.currentTime);
    lp.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 1.2);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.85, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.4);
    src.connect(lp).connect(g).connect(ctx.destination);
    src.start();

    // Sub-bass hit
    const sub = ctx.createOscillator();
    sub.type = "sine";
    sub.frequency.setValueAtTime(140, ctx.currentTime);
    sub.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.7);
    const sg = ctx.createGain();
    sg.gain.setValueAtTime(0.6, ctx.currentTime);
    sg.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
    sub.connect(sg).connect(ctx.destination);
    sub.start();
    sub.stop(ctx.currentTime + 1);
  }, [mode]);
}

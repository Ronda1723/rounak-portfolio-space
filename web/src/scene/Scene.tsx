import { Canvas } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { ACESFilmicToneMapping, Group } from "three";
import { Environment } from "@react-three/drei";
import { Rocket } from "./Rocket";
import { Planet } from "./Planet";
import { Sun } from "./Sun";
import { OrbitRing } from "./OrbitRing";
import { StarField } from "./StarField";
import { PostFX } from "./PostFX";
import { Pilot } from "./Pilot";
import { Autopilot } from "./Autopilot";
import { DockController } from "./DockController";
import { ProximityDetector } from "./ProximityDetector";
import { EnginePlume } from "./EnginePlume";
import { CameraFollow } from "./CameraFollow";
import { SunHazard } from "./SunHazard";
import { RespawnHandler } from "./RespawnHandler";
import { PLANETS } from "../config/planets";

export function Scene() {
  const keys = useRef<Record<string, boolean>>({});
  const rocketRef = useRef<Group | null>(null);
  const thrustRef = useRef<number>(0);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keys.current[e.key] = true;
    };
    const up = (e: KeyboardEvent) => {
      keys.current[e.key] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 8, 40], fov: 55, near: 0.1, far: 600 }}
      gl={{ antialias: true, toneMapping: ACESFilmicToneMapping }}
      style={{ background: "#05070A" }}
      dpr={[1, 1.25]}
    >
      <color attach="background" args={["#05070A"]} />
      <Environment preset="night" environmentIntensity={0.7} background={false} />
      <ambientLight intensity={0.08} />

      <StarField />

      <Sun />

      {PLANETS.map((p) => (
        <OrbitRing key={`ring-${p.id}`} radius={p.orbitRadius} />
      ))}

      {PLANETS.map((p) => (
        <Planet key={p.id} planet={p} />
      ))}

      <Rocket ref={rocketRef} initialPosition={[0, 0, 32]} />
      <RespawnHandler rocketRef={rocketRef} initialPosition={[0, 0, 32]} />
      <EnginePlume rocketRef={rocketRef} thrustRef={thrustRef} />

      <Pilot rocketRef={rocketRef} keys={keys} thrustRef={thrustRef} />
      <Autopilot rocketRef={rocketRef} />
      <DockController rocketRef={rocketRef} />
      <ProximityDetector rocketRef={rocketRef} />
      <SunHazard rocketRef={rocketRef} />
      <CameraFollow rocketRef={rocketRef} />

      <PostFX />
    </Canvas>
  );
}

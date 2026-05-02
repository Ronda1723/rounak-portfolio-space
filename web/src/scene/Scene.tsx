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
import { LandingSequence } from "./LandingSequence";
import { Room } from "./Room";
import { RoomCamera } from "./RoomCamera";
import { useGameStore } from "../state/useGameStore";
import { SunHazard } from "./SunHazard";
import { RespawnHandler } from "./RespawnHandler";
import { PLANETS } from "../config/planets";
import { SATELLITES } from "../config/satellites";
import { Satellite } from "./Satellite";

export function Scene() {
  const keys = useRef<Record<string, boolean>>({});
  const rocketRef = useRef<Group | null>(null);
  const thrustRef = useRef<number>(0);
  const mode = useGameStore((s) => s.mode);
  const docked = useGameStore((s) => s.dockedPlanet);
  const inRoom = mode === "exploring" || mode === "landing";

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

      <group visible={!inRoom}>
        <StarField />

        <Sun />

        {PLANETS.map((p) => (
          <OrbitRing key={`ring-${p.id}`} radius={p.orbitRadius} />
        ))}

        {PLANETS.map((p) => (
          <Planet key={p.id} planet={p} />
        ))}

        {SATELLITES.map((s) => (
          <Satellite key={s.id} satellite={s} />
        ))}

        <Rocket ref={rocketRef} initialPosition={[0, 0, 32]} thrustRef={thrustRef} />
        <EnginePlume rocketRef={rocketRef} thrustRef={thrustRef} />
      </group>
      <RespawnHandler rocketRef={rocketRef} initialPosition={[0, 0, 32]} />

      <Pilot rocketRef={rocketRef} keys={keys} thrustRef={thrustRef} />
      <Autopilot rocketRef={rocketRef} />
      <DockController rocketRef={rocketRef} />
      <ProximityDetector rocketRef={rocketRef} />
      <SunHazard rocketRef={rocketRef} />
      <CameraFollow rocketRef={rocketRef} />
      <LandingSequence rocketRef={rocketRef} />

      {(mode === "exploring" || mode === "landing") && docked && (
        <Room planet={docked} />
      )}
      <RoomCamera />

      <PostFX />
    </Canvas>
  );
}

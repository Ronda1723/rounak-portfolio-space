import { useEffect, useRef, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Color, Group, Vector3 } from "three";
import { useGameStore } from "../state/useGameStore";
import { planetWorldPositions } from "./planetWorldPositions";

const LANDING_DURATION = 3.2;

const tmpTarget = new Vector3();
const tmpLook = new Vector3();
const tmpDir = new Vector3();
const tmpColor = new Color();
const SPACE_BG = new Color("#05070A");

type Props = {
  rocketRef: RefObject<Group | null>;
};

export function LandingSequence({ rocketRef }: Props) {
  const { camera, scene } = useThree();
  const elapsed = useRef(0);
  const haveStart = useRef(false);
  const startCam = useRef(new Vector3());
  const startRocket = useRef(new Vector3());

  const mode = useGameStore((s) => s.mode);
  const docked = useGameStore((s) => s.dockedPlanet);
  const setProgress = useGameStore((s) => s.setLandingProgress);
  const arrive = useGameStore((s) => s.arriveInRoom);

  // Reset on entering landing mode
  useEffect(() => {
    if (mode === "landing") {
      elapsed.current = 0;
      haveStart.current = false;
    }
    if (mode !== "landing" && mode !== "exploring") {
      // Restore space background when not landing/in-room
      scene.background = SPACE_BG;
    }
  }, [mode, scene]);

  useFrame((_, dt) => {
    if (mode !== "landing" || !docked) return;
    const planetPos = planetWorldPositions.get(docked.id);
    if (!planetPos) return;

    if (!haveStart.current) {
      startCam.current.copy(camera.position);
      if (rocketRef.current) startRocket.current.copy(rocketRef.current.position);
      haveStart.current = true;
    }

    elapsed.current += dt;
    const t = Math.min(1, elapsed.current / LANDING_DURATION);
    const eased = t * t * (3 - 2 * t); // smoothstep
    setProgress(eased);

    // Approach direction: from rocket's start point toward the planet
    tmpDir.subVectors(startCam.current, planetPos).normalize();

    // Camera target — just outside the planet's atmosphere, behind/above the
    // landing site. We don't dive *to* the surface (Phase C will swap to the
    // room interior); we end the dive at a hover point.
    const hoverDist = docked.size * 1.6 + 0.8;
    tmpTarget.copy(planetPos).addScaledVector(tmpDir, hoverDist);
    // Slight downward arc so it feels like a descent rather than a straight push
    tmpTarget.y += (1 - eased) * 1.2;

    camera.position.copy(startCam.current).lerp(tmpTarget, eased);

    // Pull the rocket along (it lands with us)
    if (rocketRef.current) {
      // Rocket sits slightly below + behind the camera target
      const rocketTarget = tmpTarget.clone().addScaledVector(tmpDir, 0.5);
      rocketTarget.y -= 0.5;
      rocketRef.current.position.copy(startRocket.current).lerp(rocketTarget, eased);
    }

    tmpLook.copy(planetPos);
    camera.lookAt(tmpLook);

    // Sky/atmosphere color shift toward planet's signature color
    tmpColor.copy(SPACE_BG).lerp(new Color(docked.color), eased * 0.55);
    scene.background = tmpColor.clone();

    if (t >= 1) {
      arrive();
    }
  });

  return null;
}

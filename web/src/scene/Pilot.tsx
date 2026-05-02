import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, type RefObject } from "react";
import { Group, Vector3 } from "three";
import { useGameStore } from "../state/useGameStore";
import { rocketTracker } from "./rocketTracker";

type Props = {
  rocketRef: RefObject<Group | null>;
  keys: RefObject<Record<string, boolean>>;
  thrustRef: RefObject<number>;
};

const ROT_SPEED = 1.2;
const BASE_ACC = 8;
const NOS_ACC = 22;
const DRAG = 0.985;
const BASE_MAX_SPEED = 14;
const NOS_MAX_SPEED = 28;
const MOUSE_SENS = 0.0028;
const NOS_DRAIN_PER_SEC = 0.32; // ~3.1s at full
const NOS_RECHARGE_PER_SEC = 0.16; // ~6.2s to refill

export function Pilot({ rocketRef, keys, thrustRef }: Props) {
  const velocity = useRef(new Vector3());
  const tmpFwd = useRef(new Vector3());
  const setSpeed = useGameStore((s) => s.setSpeed);
  const setThrust = useGameStore((s) => s.setThrust);
  const setNosFuel = useGameStore((s) => s.setNosFuel);
  const setNosActive = useGameStore((s) => s.setNosActive);
  const isAutopiloting = useGameStore((s) => s.isAutopiloting);
  const mode = useGameStore((s) => s.mode);
  const speedFrame = useRef(0);
  const thrustFrame = useRef(0);
  const nosFuel = useRef(1);
  const nosActiveLocal = useRef(false);

  const mouseDelta = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);

  const inputLocked =
    isAutopiloting ||
    mode === "docked" ||
    mode === "exploring" ||
    mode === "warping" ||
    mode === "landing" ||
    mode === "exploded";

  useEffect(() => {
    const onContext = (e: MouseEvent) => e.preventDefault();
    const onDown = (e: MouseEvent) => {
      if (e.button === 2) dragging.current = true;
    };
    const onUp = (e: MouseEvent) => {
      if (e.button === 2) dragging.current = false;
    };
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      mouseDelta.current.x += e.movementX;
      mouseDelta.current.y += e.movementY;
    };
    window.addEventListener("contextmenu", onContext);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("contextmenu", onContext);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  useEffect(() => {
    if (inputLocked) {
      velocity.current.set(0, 0, 0);
      mouseDelta.current.x = 0;
      mouseDelta.current.y = 0;
    }
  }, [inputLocked]);

  useFrame((_, dt) => {
    const rocket = rocketRef.current;
    if (!rocket) return;

    if (inputLocked) {
      thrustRef.current = Math.max(0, thrustRef.current - dt * 1.5);
      // Recharge NOS while locked.
      if (nosFuel.current < 1) {
        nosFuel.current = Math.min(1, nosFuel.current + NOS_RECHARGE_PER_SEC * dt);
        setNosFuel(nosFuel.current);
      }
      if (nosActiveLocal.current) {
        nosActiveLocal.current = false;
        setNosActive(false);
      }
      return;
    }

    const k = keys.current;
    const r = ROT_SPEED * dt;

    if (k["ArrowLeft"]) rocket.rotation.y += r;
    if (k["ArrowRight"]) rocket.rotation.y -= r;

    if (mouseDelta.current.x !== 0) {
      rocket.rotation.y -= mouseDelta.current.x * MOUSE_SENS;
      mouseDelta.current.x = 0;
    }
    mouseDelta.current.y = 0;

    rocket.rotation.x = 0;
    rocket.rotation.z = 0;

    const wantNos = (k["Shift"] || k["ShiftLeft"] || k["ShiftRight"]) === true;
    const canNos = wantNos && nosFuel.current > 0.02 && (k["w"] || k["W"]);
    const isNos = canNos;

    if (isNos !== nosActiveLocal.current) {
      nosActiveLocal.current = isNos;
      setNosActive(isNos);
    }

    const acc = isNos ? NOS_ACC : BASE_ACC;
    const maxSpd = isNos ? NOS_MAX_SPEED : BASE_MAX_SPEED;

    let thrustInput = 0;
    if (k["w"] || k["W"]) {
      tmpFwd.current.set(0, 0, -1).applyEuler(rocket.rotation);
      velocity.current.addScaledVector(tmpFwd.current, acc * dt);
      thrustInput = isNos ? 1.5 : 1;
    }
    if (k["s"] || k["S"]) {
      tmpFwd.current.set(0, 0, 1).applyEuler(rocket.rotation);
      velocity.current.addScaledVector(tmpFwd.current, BASE_ACC * 0.5 * dt);
      thrustInput = Math.max(thrustInput, 0.5);
    }
    if (k[" "]) {
      velocity.current.multiplyScalar(0.92);
    }

    velocity.current.multiplyScalar(DRAG);
    if (velocity.current.length() > maxSpd) {
      velocity.current.setLength(maxSpd);
    }

    velocity.current.y = 0;
    rocket.position.addScaledVector(velocity.current, dt);
    rocket.position.y = 0;

    // NOS fuel drain / recharge
    if (isNos) {
      nosFuel.current = Math.max(0, nosFuel.current - NOS_DRAIN_PER_SEC * dt);
    } else {
      nosFuel.current = Math.min(1, nosFuel.current + NOS_RECHARGE_PER_SEC * dt);
    }
    setNosFuel(nosFuel.current);

    thrustRef.current += (thrustInput - thrustRef.current) * Math.min(1, dt * 6);

    speedFrame.current += dt;
    if (speedFrame.current > 0.08) {
      setSpeed(velocity.current.length());
      speedFrame.current = 0;
    }
    thrustFrame.current += dt;
    if (thrustFrame.current > 0.05) {
      setThrust(thrustRef.current);
      thrustFrame.current = 0;
    }

    rocketTracker.position.copy(rocket.position);
    rocketTracker.yaw = rocket.rotation.y;
  });

  return null;
}

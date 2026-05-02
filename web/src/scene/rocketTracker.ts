import { Vector3 } from "three";

/**
 * Latest rocket world position + yaw, written by Scene/Pilot each frame
 * and read by external React UI (mini-map, compass, etc.) without
 * causing re-renders.
 */
export const rocketTracker = {
  position: new Vector3(),
  yaw: 0,
};

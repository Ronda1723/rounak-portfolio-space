import { Vector3 } from "three";

/** Shared map of current world-space positions for each planet (updated per frame). */
export const planetWorldPositions = new Map<string, Vector3>();

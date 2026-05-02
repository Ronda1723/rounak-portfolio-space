import { create } from "zustand";
import type { Artifact, Planet } from "../config/planets";
import type { Satellite } from "../config/satellites";

export type Mode =
  | "cruising"
  | "approaching"
  | "docked"
  | "warping"
  | "landing"
  | "exploring"
  | "exploded";
export type HazardLevel = "none" | "caution" | "critical";

type GameState = {
  mode: Mode;
  targetPlanet: Planet | null;
  nearPlanet: Planet | null;
  dockedPlanet: Planet | null;
  hoveredPlanet: Planet | null;
  isAutopiloting: boolean;
  voiceListening: boolean;
  voiceTranscript: string;
  speed: number;
  thrust: number;
  warpProgress: number;
  hazard: HazardLevel;
  hazardDistance: number;
  /** seconds the rocket has been in the critical (sun-hazard) zone */
  sunDangerTime: number;
  /** seconds remaining before vessel destruction (5s countdown) */
  sunDeathDeadline: number;
  /** 0..1 progress of landing animation */
  landingProgress: number;
  setLandingProgress: (p: number) => void;
  beginLanding: () => void;
  arriveInRoom: () => void;
  leaveRoom: () => void;
  /** NOS boost fuel 0..1 */
  nosFuel: number;
  /** is NOS currently being applied */
  nosActive: boolean;
  /** increments on resetSession so scene listeners can respawn the rocket */
  respawnCount: number;
  /** satellite currently being viewed in modal, if any */
  activeSatellite: Satellite | null;
  /** satellite currently being hovered (for tooltip) */
  hoveredSatellite: Satellite | null;
  /** satellite the rocket is currently within docking range of */
  nearSatellite: Satellite | null;
  /** artifact stone currently being inspected in the museum room */
  activeArtifact: Artifact | null;
  openArtifact: (a: Artifact) => void;
  closeArtifact: () => void;
  openSatellite: (s: Satellite) => void;
  closeSatellite: () => void;
  setHoveredSatellite: (s: Satellite | null) => void;
  setNearSatellite: (s: Satellite | null) => void;
  setHazard: (level: HazardLevel, distance: number) => void;
  setSunDangerTime: (t: number) => void;
  setSunDeathDeadline: (t: number) => void;
  setNosFuel: (n: number) => void;
  setNosActive: (a: boolean) => void;
  triggerExplosion: () => void;
  resetSession: () => void;
  setMode: (m: Mode) => void;
  setTarget: (p: Planet | null) => void;
  setNear: (p: Planet | null) => void;
  setDocked: (p: Planet | null) => void;
  setHovered: (p: Planet | null) => void;
  setAutopilot: (v: boolean) => void;
  setVoiceListening: (v: boolean) => void;
  setVoiceTranscript: (t: string) => void;
  setSpeed: (s: number) => void;
  setThrust: (t: number) => void;
  setWarpProgress: (p: number) => void;
  requestDock: () => void;
  undock: () => void;
  startExplore: () => void;
  stopExplore: () => void;
};

export const useGameStore = create<GameState>((set, get) => ({
  mode: "cruising",
  targetPlanet: null,
  nearPlanet: null,
  dockedPlanet: null,
  hoveredPlanet: null,
  isAutopiloting: false,
  voiceListening: false,
  voiceTranscript: "",
  speed: 0,
  thrust: 0,
  warpProgress: 0,
  hazard: "none",
  hazardDistance: 999,
  sunDangerTime: 0,
  sunDeathDeadline: 5,
  nosFuel: 1,
  nosActive: false,
  respawnCount: 0,
  landingProgress: 0,
  activeSatellite: null,
  hoveredSatellite: null,
  nearSatellite: null,
  activeArtifact: null,

  setLandingProgress: (p) => set({ landingProgress: Math.max(0, Math.min(1, p)) }),
  beginLanding: () => {
    const { nearPlanet } = get();
    if (!nearPlanet) return;
    set({
      mode: "landing",
      dockedPlanet: nearPlanet,
      nearPlanet: null,
      landingProgress: 0,
    });
  },
  arriveInRoom: () => set({ mode: "exploring", landingProgress: 1 }),
  leaveRoom: () =>
    set({
      mode: "cruising",
      dockedPlanet: null,
      nearPlanet: null,
      landingProgress: 0,
    }),

  setHazard: (level, distance) => set({ hazard: level, hazardDistance: distance }),
  setSunDangerTime: (t) => set({ sunDangerTime: t }),
  setSunDeathDeadline: (t) => set({ sunDeathDeadline: t }),
  setNosFuel: (n) => set({ nosFuel: Math.max(0, Math.min(1, n)) }),
  setNosActive: (a) => set({ nosActive: a }),

  triggerExplosion: () =>
    set({
      mode: "exploded",
      targetPlanet: null,
      nearPlanet: null,
      dockedPlanet: null,
      isAutopiloting: false,
    }),

  resetSession: () =>
    set((state) => ({
      mode: "cruising",
      targetPlanet: null,
      nearPlanet: null,
      dockedPlanet: null,
      hoveredPlanet: null,
      isAutopiloting: false,
      hazard: "none",
      hazardDistance: 999,
      sunDangerTime: 0,
      nosFuel: 1,
      nosActive: false,
      thrust: 0,
      speed: 0,
      respawnCount: state.respawnCount + 1,
    })),

  setMode: (m) => set({ mode: m }),
  setTarget: (p) => set({ targetPlanet: p }),
  setNear: (p) => {
    const { mode } = get();
    if (
      mode === "docked" ||
      mode === "exploring" ||
      mode === "warping" ||
      mode === "landing" ||
      mode === "exploded"
    )
      return;
    set({ nearPlanet: p, mode: p ? "approaching" : "cruising" });
  },
  setDocked: (p) => set({ dockedPlanet: p, mode: p ? "docked" : "cruising" }),
  setHovered: (p) => set({ hoveredPlanet: p }),
  setAutopilot: (v) => set({ isAutopiloting: v }),
  setVoiceListening: (v) => set({ voiceListening: v }),
  setVoiceTranscript: (t) => set({ voiceTranscript: t }),
  setSpeed: (s) => set({ speed: s }),
  setThrust: (t) => set({ thrust: t }),
  setWarpProgress: (p) => set({ warpProgress: p }),
  requestDock: () => {
    const { nearPlanet } = get();
    if (!nearPlanet) return;
    set({ dockedPlanet: nearPlanet, nearPlanet: null, mode: "docked" });
  },
  undock: () =>
    set({
      dockedPlanet: null,
      nearPlanet: null,
      mode: "cruising",
      targetPlanet: null,
    }),
  startExplore: () => {
    const { dockedPlanet } = get();
    if (!dockedPlanet) return;
    set({ mode: "warping", warpProgress: 0 });
  },
  stopExplore: () => {
    const { dockedPlanet } = get();
    set({ mode: dockedPlanet ? "docked" : "cruising", warpProgress: 0 });
  },
  openSatellite: (s) => set({ activeSatellite: s }),
  closeSatellite: () => set({ activeSatellite: null }),
  setHoveredSatellite: (s) => set({ hoveredSatellite: s }),
  setNearSatellite: (s) => set({ nearSatellite: s }),
  openArtifact: (a) => set({ activeArtifact: a }),
  closeArtifact: () => set({ activeArtifact: null }),
}));

export type Planet = {
  id: string;
  name: string;
  tagline: string;
  texture: string;
  cloudsTexture?: string;
  nightTexture?: string;
  ringTexture?: string;
  hasAtmosphere?: boolean;
  size: number;
  /** orbital radius from sun (scene units) */
  orbitRadius: number;
  /** initial angle on orbit in radians */
  orbitAngle: number;
  /** angular velocity in radians per second (slow) */
  orbitSpeed: number;
  /** axial spin speed in radians per second */
  spinSpeed: number;
  /** axial tilt in radians (saturn etc.) */
  axialTilt: number;
  color: string;
  landRadius: number;
  voiceAliases: string[];
  /** Real-world stats of the planet body this is rendered on (NASA fact sheet). */
  stats: {
    temperature: string;
    atmosphere: string;
    dayLength: string;
    gravity: string;
  };
  briefing: {
    role: string;
    period: string;
    summary: string;
    bullets: string[];
    stack: string[];
    link?: { label: string; url: string };
  };
};

export const SUN_RADIUS = 2.5;

export const PLANETS: Planet[] = [
  {
    id: "open-source",
    name: "Open Source",
    tagline: "Scattered contributions, the inner ring",
    texture: "/assets/textures/2k_mercury.jpg",
    size: 0.45,
    orbitRadius: 6,
    orbitAngle: Math.PI * 0.2,
    orbitSpeed: 0.06,
    spinSpeed: 0.05,
    axialTilt: 0,
    color: "#a08672",
    landRadius: 1.5,
    voiceAliases: ["open source", "mercury", "open", "first"],
    stats: {
      temperature: "−180 to 430 °C",
      atmosphere: "Trace exosphere",
      dayLength: "59 Earth days",
      gravity: "0.38 g",
    },
    briefing: {
      role: "Maintainer / contributor",
      period: "ongoing",
      summary:
        "Small contributions to libraries I depend on. Fixes, docs, the occasional feature.",
      bullets: [
        "Bug reports with reproductions, not vibes",
        "Docs PRs for things I had to figure out",
        "Plugins for tools that needed one more thing",
      ],
      stack: ["various"],
    },
  },
  {
    id: "voicechef",
    name: "VoiceChef",
    tagline: "Hands-free cooking copilot",
    texture: "/assets/textures/2k_mars.jpg",
    size: 0.65,
    orbitRadius: 9,
    orbitAngle: Math.PI * 1.1,
    orbitSpeed: 0.045,
    spinSpeed: 0.04,
    axialTilt: 0.41,
    color: "#d65d3a",
    landRadius: 2.0,
    voiceAliases: ["voicechef", "voice chef", "mars", "red planet"],
    stats: {
      temperature: "−63 °C avg",
      atmosphere: "95% CO₂, thin",
      dayLength: "24 h 37 m",
      gravity: "0.38 g",
    },
    briefing: {
      role: "Solo build",
      period: "2024",
      summary:
        "A hands-free cooking assistant. Recipes voice-narrated, timers triggered by name, no greasy phone screens.",
      bullets: [
        "Voice-driven recipe walkthroughs with named timers",
        "Local-first: works offline once a recipe is loaded",
        "Designed for kitchen ergonomics, not phone ergonomics",
      ],
      stack: ["React Native", "Expo", "Whisper"],
    },
  },
  {
    id: "miniflow",
    name: "MiniFlow",
    tagline: "Workflow automation, terraformed",
    texture: "/assets/textures/2k_earth_daymap.jpg",
    cloudsTexture: "/assets/textures/2k_earth_clouds.jpg",
    nightTexture: "/assets/textures/2k_earth_nightmap.jpg",
    hasAtmosphere: true,
    size: 0.75,
    orbitRadius: 12,
    orbitAngle: Math.PI * 0.55,
    orbitSpeed: 0.035,
    spinSpeed: 0.06,
    axialTilt: 0.41,
    color: "#5BC0EB",
    landRadius: 2.4,
    voiceAliases: ["miniflow", "mini flow", "earth", "blue planet"],
    stats: {
      temperature: "+15 °C avg",
      atmosphere: "78% N₂ · 21% O₂",
      dayLength: "24 hours",
      gravity: "1.00 g",
    },
    briefing: {
      role: "Founding designer + engineer",
      period: "2024 — present",
      summary:
        "MiniFlow turns recurring spreadsheet ops into one-click automations. The desktop app reads your raw inputs, runs the pipeline, and ships the result.",
      bullets: [
        "Designed the canvas-first authoring UX from scratch",
        "Shipped MacOS + Windows desktop builds via Tauri",
        "Built the runner engine and the visual pipeline graph",
      ],
      stack: ["Tauri", "React", "TypeScript", "Rust", "SQLite"],
    },
  },
  {
    id: "smallest",
    name: "Smallest AI",
    tagline: "Realtime speech for production",
    texture: "/assets/textures/2k_jupiter.jpg",
    size: 1.45,
    orbitRadius: 17,
    orbitAngle: Math.PI * 1.7,
    orbitSpeed: 0.022,
    spinSpeed: 0.08,
    axialTilt: 0.05,
    color: "#d8ad6a",
    landRadius: 3.4,
    voiceAliases: ["smallest", "smallest ai", "jupiter", "gas giant"],
    stats: {
      temperature: "−110 °C cloud tops",
      atmosphere: "H₂ · He · CH₄",
      dayLength: "9 h 56 m",
      gravity: "2.53 g",
    },
    briefing: {
      role: "Design lead",
      period: "2023 — 2024",
      summary:
        "Production speech infrastructure for voice agents. Owned the design system, the dashboard, and the developer-facing surface.",
      bullets: [
        "Built the design system from zero",
        "Shipped dashboard, playground, and docs surfaces",
        "Drove DX for the speech APIs and SDKs",
      ],
      stack: ["Next.js", "Figma", "TypeScript"],
    },
  },
  {
    id: "uxie",
    name: "Uxie",
    tagline: "Voice-first desktop assistant",
    texture: "/assets/textures/2k_saturn.jpg",
    ringTexture: "/assets/textures/2k_saturn_ring_alpha.png",
    size: 1.2,
    orbitRadius: 22,
    orbitAngle: Math.PI * 0.85,
    orbitSpeed: 0.016,
    spinSpeed: 0.07,
    axialTilt: 0.46,
    color: "#e6c98a",
    landRadius: 3.2,
    voiceAliases: ["uxie", "saturn", "ring", "ringed"],
    stats: {
      temperature: "−140 °C avg",
      atmosphere: "H₂ · He, banded clouds",
      dayLength: "10 h 42 m",
      gravity: "1.07 g",
    },
    briefing: {
      role: "Designer + iOS/MacOS engineer",
      period: "2025 — present",
      summary:
        "A voice copilot that lives behind a global hotkey. Hold to talk, release to ship — sub-second STT through a custom Railway pipeline.",
      bullets: [
        "Hold-to-talk MacOS app with global hotkey + dictation",
        "Sub-1s STT latency via Deepgram Nova-3 + interim cache",
        "Single-tag releases for Mac DMG + Windows EXE",
      ],
      stack: ["SwiftUI", "FastAPI", "Deepgram", "Railway"],
    },
  },
  {
    id: "side-quest",
    name: "Side Quest",
    tagline: "An experiment that grew",
    texture: "/assets/textures/2k_neptune.jpg",
    size: 0.95,
    orbitRadius: 27,
    orbitAngle: Math.PI * 1.4,
    orbitSpeed: 0.011,
    spinSpeed: 0.05,
    axialTilt: 0.49,
    color: "#3a5fd8",
    landRadius: 2.6,
    voiceAliases: ["side quest", "side", "neptune", "blue", "experiment"],
    stats: {
      temperature: "−200 °C avg",
      atmosphere: "H₂ · He · CH₄",
      dayLength: "16 h 6 m",
      gravity: "1.14 g",
    },
    briefing: {
      role: "Solo experiment",
      period: "2025",
      summary:
        "A weekend hack that turned into something more. Half-finished, half-shipped, fully learned-from.",
      bullets: [
        "Started as a constraint-driven generative system",
        "Pivoted twice; kept the parts that worked",
        "Open-sourced once it stopped embarrassing me",
      ],
      stack: ["TBD"],
    },
  },
];

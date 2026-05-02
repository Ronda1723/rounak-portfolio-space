export type Artifact = {
  id: string;
  name: string;
  /** Stone color (used by the museum scene, also as accent in the modal) */
  color: string;
  /** One-line description shown when the stone is selected */
  blurb: string;
  /** Optional longer body */
  detail?: string;
};

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
  /** Theme keyword used by the landing/room scene (e.g. "desert", "verdant") */
  terrainTheme: string;
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
  /** Museum stones shown when you land on this planet. */
  artifacts: Artifact[];
};

export const SUN_RADIUS = 2.5;

export const PLANETS: Planet[] = [
  {
    id: "lazyvoice",
    name: "LazyVoice",
    tagline: "Voice dictation, co-founded",
    texture: "/assets/textures/2k_mars.jpg",
    size: 0.7,
    orbitRadius: 10,
    orbitAngle: Math.PI * 0.2,
    orbitSpeed: 0.05,
    spinSpeed: 0.05,
    axialTilt: 0.41,
    color: "#d65d3a",
    landRadius: 2.2,
    voiceAliases: ["lazyvoice", "lazy voice", "lazy", "dictation", "mars"],
    terrainTheme: "desert",
    stats: {
      temperature: "−63 °C avg",
      atmosphere: "95% CO₂, thin",
      dayLength: "24 h 37 m",
      gravity: "0.38 g",
    },
    briefing: {
      role: "Co-founder",
      period: "ongoing",
      summary:
        "A voice dictation app I'm co-founding alongside the work at Smallest.ai. Hold-to-talk on macOS, sub-second transcription, and a deliberately small surface area.",
      bullets: [
        "Co-founded the venture, leading product + engineering",
        "Sub-1s transcription pipeline with interim caching",
        "Mac-first; Windows on deck",
      ],
      stack: ["SwiftUI", "FastAPI", "Deepgram", "Railway"],
    },
    artifacts: [
      {
        id: "engine",
        name: "Dictation Engine",
        color: "#ff6b3d",
        blurb: "The core STT pipeline — Nova-3 + interim cache + dispatch-on-release.",
      },
      {
        id: "hotkey",
        name: "Global Hotkey",
        color: "#ffd089",
        blurb: "Hold-to-talk anywhere on macOS. The whole UX hangs on this one gesture.",
      },
      {
        id: "latency",
        name: "Sub-Second Latency",
        color: "#ffaa55",
        blurb: "What it took to get end-to-end under a second on real networks.",
      },
      {
        id: "launch",
        name: "Launch",
        color: "#d94432",
        blurb: "Going from internal build to the first paying users.",
      },
    ],
  },
  {
    id: "smallest",
    name: "Smallest.ai",
    tagline: "Realtime speech for production",
    texture: "/assets/textures/2k_jupiter.jpg",
    size: 1.5,
    orbitRadius: 15,
    orbitAngle: Math.PI * 0.55,
    orbitSpeed: 0.03,
    spinSpeed: 0.08,
    axialTilt: 0.05,
    color: "#d8ad6a",
    landRadius: 3.4,
    voiceAliases: ["smallest", "smallest ai", "jupiter", "main"],
    terrainTheme: "industrial",
    stats: {
      temperature: "−110 °C cloud tops",
      atmosphere: "H₂ · He · CH₄",
      dayLength: "9 h 56 m",
      gravity: "2.53 g",
    },
    briefing: {
      role: "Design lead",
      period: "2023 — present",
      summary:
        "Production speech infrastructure for voice agents. Owned the design system, the dashboard, and the developer-facing surface — plus a handful of products that shipped during this chapter.",
      bullets: [
        "Built the design system from zero across docs, dashboard, playground",
        "Drove DX for the speech APIs and SDKs",
        "Shipped multiple products inside the company arc",
      ],
      stack: ["Next.js", "Figma", "TypeScript"],
    },
    artifacts: [
      {
        id: "atoms",
        name: "Atoms",
        color: "#ffd089",
        blurb: "The design-system primitives that everything in the surface area is built from.",
      },
      {
        id: "website",
        name: "Smallest Website",
        color: "#5BC0EB",
        blurb: "The marketing site — narrative, structure, and the bones it sits on.",
      },
      {
        id: "voicechef",
        name: "VoiceChef",
        color: "#d65d3a",
        blurb: "Hands-free cooking copilot. Voice-driven recipes, named timers, kitchen-first.",
      },
      {
        id: "lazyvoice-stone",
        name: "LazyVoice",
        color: "#ff6b3d",
        blurb: "The dictation app spun out from this chapter — its own planet now.",
      },
    ],
  },
  {
    id: "uxie",
    name: "Uxie",
    tagline: "Voice-first desktop assistant",
    texture: "/assets/textures/2k_saturn.jpg",
    ringTexture: "/assets/textures/2k_saturn_ring_alpha.png",
    size: 1.2,
    orbitRadius: 20,
    orbitAngle: Math.PI * 0.85,
    orbitSpeed: 0.018,
    spinSpeed: 0.07,
    axialTilt: 0.46,
    color: "#e6c98a",
    landRadius: 3.0,
    voiceAliases: ["uxie", "saturn", "ringed"],
    terrainTheme: "stone",
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
    artifacts: [
      {
        id: "design",
        name: "Design",
        color: "#e6c98a",
        blurb: "The interface vocabulary — hold-to-talk gestures, the menubar surface, the modes.",
      },
      {
        id: "implementation",
        name: "Implementation",
        color: "#9aa3aa",
        blurb: "SwiftUI on the front, FastAPI + Deepgram + Railway on the back. Single-tag releases for Mac + Windows.",
      },
      {
        id: "problem",
        name: "What I'm Solving For",
        color: "#5BC0EB",
        blurb: "The wedge between fast-thinking and slow-typing — and why dictation is a small piece of it.",
      },
    ],
  },
  {
    id: "growth",
    name: "Growth",
    tagline: "Distribution and revenue",
    texture: "/assets/textures/2k_earth_daymap.jpg",
    cloudsTexture: "/assets/textures/2k_earth_clouds.jpg",
    nightTexture: "/assets/textures/2k_earth_nightmap.jpg",
    hasAtmosphere: true,
    size: 0.95,
    orbitRadius: 26,
    orbitAngle: Math.PI * 1.4,
    orbitSpeed: 0.013,
    spinSpeed: 0.06,
    axialTilt: 0.41,
    color: "#5BC0EB",
    landRadius: 2.6,
    voiceAliases: ["growth", "revenue", "earth", "blue planet"],
    terrainTheme: "verdant",
    stats: {
      temperature: "+15 °C avg",
      atmosphere: "78% N₂ · 21% O₂",
      dayLength: "24 hours",
      gravity: "1.00 g",
    },
    briefing: {
      role: "Growth + revenue",
      period: "ongoing",
      summary:
        "The work that turned products into revenue. Distribution, content, partnerships, and the metrics that came out the other end.",
      bullets: [
        "Owned distribution + content for the company surface",
        "Drove the funnels that compounded into ARR",
        "Built the partnership pipeline from outbound first contact",
      ],
      stack: ["GTM", "Content", "Partnerships"],
    },
    artifacts: [
      {
        id: "content",
        name: "Content & SEO",
        color: "#7AFFAD",
        blurb: "The writing and the search surface — what brought people in cold.",
      },
      {
        id: "partnerships",
        name: "Partnerships",
        color: "#5BC0EB",
        blurb: "Outbound to deal — the relationships that compounded into channels.",
      },
      {
        id: "revenue",
        name: "Revenue",
        color: "#ffd089",
        blurb: "The dollars at the end of the funnel and what they came from.",
      },
      {
        id: "playbook",
        name: "Playbook",
        color: "#a08672",
        blurb: "What I'd do again, what I wouldn't, and the order I'd do it in.",
      },
    ],
  },
];

export type SatelliteEntry = {
  title: string;
  date?: string;
  blurb: string;
  url?: string;
};

export type Satellite = {
  id: string;
  name: string;
  /** short label shown in tooltip */
  tagline: string;
  /** orbital radius from sun (scene units) */
  orbitRadius: number;
  /** initial angle in radians */
  orbitAngle: number;
  /** angular velocity in rad/sec */
  orbitSpeed: number;
  /** vertical offset above the orbital plane */
  inclination: number;
  /** main body accent color (also sets the dish indicator) */
  accent: string;
  intro: string;
  entries: SatelliteEntry[];
};

export const SATELLITES: Satellite[] = [
  {
    id: "research",
    name: "Research",
    tagline: "Notes, experiments, side investigations",
    orbitRadius: 14.5,
    orbitAngle: Math.PI * 0.35,
    orbitSpeed: 0.05,
    inclination: 1.6,
    accent: "#6affd1",
    intro:
      "Working notes from the projects above. Things I built to answer a specific question, prototypes that didn't ship, and the writeups that came out of them.",
    entries: [
      {
        title: "Sub-second STT through interim caching",
        date: "2025",
        blurb:
          "Why Deepgram interim results + a key cache outperform a 'just-wait-for-final' loop in real-world dictation.",
      },
      {
        title: "Voice-first interaction patterns",
        date: "2024",
        blurb:
          "A taxonomy of hold-to-talk vs. wake-word vs. tap-to-talk, and where each one quietly fails.",
      },
      {
        title: "Constraint-driven generative systems",
        date: "2025",
        blurb:
          "Notes from Side Quest — what survives when you replace prompts with constraints.",
      },
    ],
  },
  {
    id: "articles",
    name: "Articles",
    tagline: "Writing, mostly",
    orbitRadius: 24.5,
    orbitAngle: Math.PI * 1.2,
    orbitSpeed: 0.028,
    inclination: -1.4,
    accent: "#ffb347",
    intro:
      "Longer-form pieces I've published. Mostly about voice, design systems, and the messy middle of building things.",
    entries: [
      {
        title: "Designing for the kitchen, not the phone",
        date: "2024",
        blurb:
          "The ergonomic gap between phone-first and hands-free apps, and what changed when I built VoiceChef.",
      },
      {
        title: "The first design system at Smallest",
        date: "2024",
        blurb:
          "Going from zero tokens to a shipped library across docs, dashboard, and playground.",
      },
      {
        title: "Why we stopped amending commits",
        date: "2025",
        blurb:
          "A small workflow rule that prevented two near-disasters in a single quarter.",
      },
    ],
  },
];

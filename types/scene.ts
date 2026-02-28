// Particle formation presets — each page picks one
export type ParticleFormation =
  | 'cosmic'     // Home: swirling torus-knot clusters, expansive
  | 'scattered'  // Work: loose drifting constellation
  | 'orbit'      // About: slow concentric orbital rings
  | 'grid'       // Services: geometric lattice that breathes
  | 'pulse'      // Team: organic blob that pulses outward
  | 'converge'   // Contact: particles draw inward to a center point
  | 'default'    // Fallback: gentle drift, no strong formation

// Color temperature mapped from weather + time, or per-page override
export type ColorTemp =
  | 'cool'    // Electric cyan/blue — night clear, crisp
  | 'warm'    // Amber/orange — dusk, golden hour
  | 'purple'  // Ethereal violet — dawn, mystical
  | 'gold'    // Sacred gold — rare, CTA moments
  | 'ice'     // Cold blue/white — snow, day clear
  | 'storm'   // Near-dark with electric bursts — storm
  | 'rose'    // Soft pink/mauve — intimate, team page

export interface SceneConfig {
  formation: ParticleFormation
  density: number           // 0–1: multiplied by max particle count (30k / 8k mobile)
  colorTemp: ColorTemp
  cameraZ: number           // Camera z-position. Closer to 0 = further from void
  particleSize: number      // 0–1: relative size multiplier
  speed: number             // 0–1: animation speed of curl noise / formation drift
  cursorInfluence: number   // px radius of cursor repulsion field (0 to disable)
  transitionDuration: number // ms: how long to lerp between config states
}

// Default scene — used when no page has called useScene()
export const DEFAULT_SCENE_CONFIG: SceneConfig = {
  formation: 'default',
  density: 0.5,
  colorTemp: 'cool',
  cameraZ: -10,
  particleSize: 0.5,
  speed: 0.3,
  cursorInfluence: 120,
  transitionDuration: 1200,
}

// Per-page presets — pages can use these directly or extend them
export const SCENE_PRESETS: Record<string, SceneConfig> = {
  home: {
    formation: 'cosmic',
    density: 1.0,
    colorTemp: 'cool',
    cameraZ: -5,
    particleSize: 0.6,
    speed: 0.4,
    cursorInfluence: 140,
    transitionDuration: 1500,
  },
  work: {
    formation: 'scattered',
    density: 0.6,
    colorTemp: 'warm',
    cameraZ: -20,
    particleSize: 0.4,
    speed: 0.25,
    cursorInfluence: 100,
    transitionDuration: 1000,
  },
  about: {
    formation: 'orbit',
    density: 0.4,
    colorTemp: 'purple',
    cameraZ: -12,
    particleSize: 0.5,
    speed: 0.2,
    cursorInfluence: 80,
    transitionDuration: 1800,
  },
  services: {
    formation: 'grid',
    density: 0.5,
    colorTemp: 'ice',
    cameraZ: -15,
    particleSize: 0.35,
    speed: 0.15,
    cursorInfluence: 120,
    transitionDuration: 1200,
  },
  team: {
    formation: 'pulse',
    density: 0.45,
    colorTemp: 'rose',
    cameraZ: -10,
    particleSize: 0.55,
    speed: 0.35,
    cursorInfluence: 160,
    transitionDuration: 1400,
  },
  contact: {
    formation: 'converge',
    density: 0.3,
    colorTemp: 'gold',
    cameraZ: -8,
    particleSize: 0.5,
    speed: 0.3,
    cursorInfluence: 200,
    transitionDuration: 1000,
  },
}

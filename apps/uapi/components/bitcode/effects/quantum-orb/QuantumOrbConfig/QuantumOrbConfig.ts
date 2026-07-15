
export interface QuantumOrbConfig {
  backgroundColors: readonly string[];
  glowColor: string;
  particleColor: string;
  coreGlowIntensity: number;
  showBackground: boolean;
  showWavyBlobs: boolean;
  showParticles: boolean;
  showGlowEffects: boolean;
  showShadow: boolean;
  speed: number;
}

// ---------------------------------------------------------------------------
//                             Shared performance constants
// ---------------------------------------------------------------------------

// Target frame budget for rAF-driven canvas layers (30 fps).  All animation
// throttling logic references this value so tweaking the cadence is a single
// change.
export const FRAME_BUDGET_MS = 1000 / 30;

// Preset configurations
export const quantumPreset: QuantumOrbConfig = {
  backgroundColors: ['#67feb7', '#4ade80', '#0f766e'],
  glowColor: '#67feb7',
  particleColor: '#ffffff',
  coreGlowIntensity: 1.2,
  showBackground: true,
  showWavyBlobs: true,
  showParticles: true,
  showGlowEffects: true,
  showShadow: true,
  speed: 60
};

export const cosmicPreset: QuantumOrbConfig = {
  backgroundColors: ['#8b5cf6', '#d946ef', '#3b82f6'],
  glowColor: '#d946ef',
  particleColor: '#ffffff',
  coreGlowIntensity: 1.5,
  showBackground: true,
  showWavyBlobs: true,
  showParticles: true,
  showGlowEffects: true,
  showShadow: true,
  speed: 90
};

export const minimalPreset: QuantumOrbConfig = {
  backgroundColors: ['#67feb7', '#4ade80', '#0f766e'],
  glowColor: '#67feb7',
  particleColor: '#ffffff',
  coreGlowIntensity: 0.8,
  showBackground: true,
  showWavyBlobs: false,
  showParticles: false,
  showGlowEffects: true,
  showShadow: true,
  speed: 30
};

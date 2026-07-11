
import { QuantumOrbConfig, quantumPreset, cosmicPreset, minimalPreset, FRAME_BUDGET_MS } from './QuantumOrbConfig';
import '@/styles/quantum-orb.css';
import QuantumOrbDefault from './QuantumOrb';

// Re-export the default export as a named export
export const QuantumOrb = QuantumOrbDefault;
export type { QuantumOrbConfig } from './QuantumOrbConfig';
export { quantumPreset, cosmicPreset, minimalPreset, FRAME_BUDGET_MS };
export type { QuantumOrbState } from './QuantumOrb';


import { QuantumOrbConfig, quantumPreset, cosmicPreset, minimalPreset, FRAME_BUDGET_MS } from '@/components/bitcode/effects/quantum-orb/QuantumOrbConfig/QuantumOrbConfig';
import '@/styles/quantum-orb.css';
import QuantumOrbDefault from '@/components/bitcode/effects/quantum-orb/QuantumOrb/QuantumOrb';

// Re-export the default export as a named export
export const QuantumOrb = QuantumOrbDefault;
export type { QuantumOrbConfig } from '@/components/bitcode/effects/quantum-orb/QuantumOrbConfig/QuantumOrbConfig';
export { quantumPreset, cosmicPreset, minimalPreset, FRAME_BUDGET_MS };
export type { QuantumOrbState } from '@/components/bitcode/effects/quantum-orb/QuantumOrb/QuantumOrb';

/**
 * Docs content module: sections terminal actions.
 */
import type { DocsGuideCard } from '../bitcode-docs-types';
import { TERMINAL_WORKSPACE_EXPLAINERS } from '@/components/bitcode/pipeline/models/workspace-explainers';

const TERMINAL_SURFACE_EXPLAINERS_ALIAS = TERMINAL_WORKSPACE_EXPLAINERS;

export const productActionSections = [
  {
    id: 'controls',
    eyebrow: TERMINAL_SURFACE_EXPLAINERS_ALIAS.controls.kicker ?? 'Controls',
    title: TERMINAL_SURFACE_EXPLAINERS_ALIAS.controls.title,
    summary: TERMINAL_SURFACE_EXPLAINERS_ALIAS.controls.summary,
    detail: TERMINAL_SURFACE_EXPLAINERS_ALIAS.controls.detail ?? '',
    reason:
      'Controls are not generic preferences. Scenario, projection, branch mode, and guide state decide what Bitcode will measure, materialize, and prove on product routes.',
    points: TERMINAL_SURFACE_EXPLAINERS_ALIAS.controls.points,
  },
  {
    id: 'supply',
    eyebrow: TERMINAL_WORKSPACE_EXPLAINERS.supplyInventory.kicker ?? 'Supply',
    title: TERMINAL_WORKSPACE_EXPLAINERS.supplyInventory.title,
    summary: TERMINAL_WORKSPACE_EXPLAINERS.supplyInventory.summary,
    detail: TERMINAL_WORKSPACE_EXPLAINERS.supplyInventory.detail ?? '',
    reason:
      'Supply search is the first filter on what permitted source can become AssetPack commodity.',
    points: TERMINAL_WORKSPACE_EXPLAINERS.supplyInventory.points,
  },
  {
    id: 'deposit',
    eyebrow: TERMINAL_WORKSPACE_EXPLAINERS.depositComposer.kicker ?? 'Deposit',
    title: TERMINAL_WORKSPACE_EXPLAINERS.depositComposer.title,
    summary: TERMINAL_WORKSPACE_EXPLAINERS.depositComposer.summary,
    detail: TERMINAL_WORKSPACE_EXPLAINERS.depositComposer.detail ?? '',
    reason:
      'Deposit provenance keeps useful source attributable and auditable after listing.',
    points: TERMINAL_WORKSPACE_EXPLAINERS.depositComposer.points,
  },
  {
    id: 'closure',
    eyebrow: TERMINAL_WORKSPACE_EXPLAINERS.closureControls.kicker ?? 'Closure',
    title: TERMINAL_WORKSPACE_EXPLAINERS.closureControls.title,
    summary: TERMINAL_WORKSPACE_EXPLAINERS.closureControls.summary,
    detail: TERMINAL_WORKSPACE_EXPLAINERS.closureControls.detail ?? '',
    reason:
      'Closure is where reviewable Reading, verification, materialization, proof, and settlement become one consequence chain rereadable on /packs.',
    points: TERMINAL_WORKSPACE_EXPLAINERS.closureControls.points,
  },
] as const satisfies readonly DocsGuideCard[];

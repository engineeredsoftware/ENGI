/**
 * Docs content module: sections terminal actions.
 */
import type { DocsGuideCard } from '../bitcode-docs-types';
import { PRODUCT_WORKSPACE_EXPLAINERS } from '@/components/bitcode/pipeline/models/workspace-explainers';

const PRODUCT_SURFACE_EXPLAINERS_ALIAS = PRODUCT_WORKSPACE_EXPLAINERS;

export const productActionSections = [
  {
    id: 'controls',
    eyebrow: PRODUCT_SURFACE_EXPLAINERS_ALIAS.controls.kicker ?? 'Controls',
    title: PRODUCT_SURFACE_EXPLAINERS_ALIAS.controls.title,
    summary: PRODUCT_SURFACE_EXPLAINERS_ALIAS.controls.summary,
    detail: PRODUCT_SURFACE_EXPLAINERS_ALIAS.controls.detail ?? '',
    reason:
      'Controls are not generic preferences. Scenario, projection, branch mode, and guide state decide what Bitcode will measure, materialize, and prove on product routes.',
    points: PRODUCT_SURFACE_EXPLAINERS_ALIAS.controls.points,
  },
  {
    id: 'supply',
    eyebrow: PRODUCT_WORKSPACE_EXPLAINERS.supplyInventory.kicker ?? 'Supply',
    title: PRODUCT_WORKSPACE_EXPLAINERS.supplyInventory.title,
    summary: PRODUCT_WORKSPACE_EXPLAINERS.supplyInventory.summary,
    detail: PRODUCT_WORKSPACE_EXPLAINERS.supplyInventory.detail ?? '',
    reason:
      'Supply search is the first filter on what permitted source can become AssetPack commodity.',
    points: PRODUCT_WORKSPACE_EXPLAINERS.supplyInventory.points,
  },
  {
    id: 'deposit',
    eyebrow: PRODUCT_WORKSPACE_EXPLAINERS.depositComposer.kicker ?? 'Deposit',
    title: PRODUCT_WORKSPACE_EXPLAINERS.depositComposer.title,
    summary: PRODUCT_WORKSPACE_EXPLAINERS.depositComposer.summary,
    detail: PRODUCT_WORKSPACE_EXPLAINERS.depositComposer.detail ?? '',
    reason:
      'Deposit provenance keeps useful source attributable and auditable after listing.',
    points: PRODUCT_WORKSPACE_EXPLAINERS.depositComposer.points,
  },
  {
    id: 'closure',
    eyebrow: PRODUCT_WORKSPACE_EXPLAINERS.closureControls.kicker ?? 'Closure',
    title: PRODUCT_WORKSPACE_EXPLAINERS.closureControls.title,
    summary: PRODUCT_WORKSPACE_EXPLAINERS.closureControls.summary,
    detail: PRODUCT_WORKSPACE_EXPLAINERS.closureControls.detail ?? '',
    reason:
      'Closure is where reviewable Reading, verification, materialization, proof, and settlement become one consequence chain rereadable on /packs.',
    points: PRODUCT_WORKSPACE_EXPLAINERS.closureControls.points,
  },
] as const satisfies readonly DocsGuideCard[];

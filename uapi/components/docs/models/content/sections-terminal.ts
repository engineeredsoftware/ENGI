/**
 * Docs content module: sections terminal.
 */
import type { DocsGuideCard } from '../bitcode-docs-types';
import { TERMINAL_INLINE_EXPLAINERS, TERMINAL_WORKSPACE_EXPLAINERS } from '@/components/bitcode/pipeline/models/workspace-explainers';

export const terminalSections = [
  {
    id: 'experience-map',
    eyebrow: TERMINAL_WORKSPACE_EXPLAINERS.experienceMap.kicker ?? 'Terminal',
    title: TERMINAL_WORKSPACE_EXPLAINERS.experienceMap.title,
    summary: TERMINAL_WORKSPACE_EXPLAINERS.experienceMap.summary,
    detail: TERMINAL_WORKSPACE_EXPLAINERS.experienceMap.detail ?? '',
    reason:
      'The Terminal keeps the product understandable by making the activity ledger primary and treating deeper modes as deliberate follow-through.',
    points: TERMINAL_WORKSPACE_EXPLAINERS.experienceMap.points,
  },
  {
    id: 'read-window',
    eyebrow: 'Read',
    title: TERMINAL_INLINE_EXPLAINERS.readWindow.title,
    summary: TERMINAL_INLINE_EXPLAINERS.readWindow.summary,
    detail: TERMINAL_INLINE_EXPLAINERS.readWindow.detail ?? '',
    reason:
      'The read window is where users learn whether a Bitcode action actually changed state.',
  },
  {
    id: 'write-posture',
    eyebrow: 'Write',
    title: TERMINAL_INLINE_EXPLAINERS.writePosture.title,
    summary: TERMINAL_INLINE_EXPLAINERS.writePosture.summary,
    detail: TERMINAL_INLINE_EXPLAINERS.writePosture.detail ?? '',
    reason:
      'Writes must stay bounded because Bitcode has proof, wallet, repository, and disclosure consequences.',
  },
  {
    id: 'mode-rail',
    eyebrow: TERMINAL_WORKSPACE_EXPLAINERS.railModes.kicker ?? 'Modes',
    title: TERMINAL_WORKSPACE_EXPLAINERS.railModes.title,
    summary: TERMINAL_WORKSPACE_EXPLAINERS.railModes.summary,
    detail: TERMINAL_WORKSPACE_EXPLAINERS.railModes.detail ?? '',
    reason:
      'Mode changes are useful only when the reader never loses the active /packs activity context.',
    points: TERMINAL_WORKSPACE_EXPLAINERS.railModes.points,
  },
  {
    id: 'repository-supply',
    eyebrow: TERMINAL_WORKSPACE_EXPLAINERS.repositorySupply.kicker ?? 'Source',
    title: TERMINAL_WORKSPACE_EXPLAINERS.repositorySupply.title,
    summary: TERMINAL_WORKSPACE_EXPLAINERS.repositorySupply.summary,
    detail: TERMINAL_WORKSPACE_EXPLAINERS.repositorySupply.detail ?? '',
    reason:
      'Repository scope is the deposit-side boundary; every deposit and downstream proof depends on it staying explicit.',
    points: TERMINAL_WORKSPACE_EXPLAINERS.repositorySupply.points,
  },
] as const satisfies readonly DocsGuideCard[];

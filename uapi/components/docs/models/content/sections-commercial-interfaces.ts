/**
 * Docs content module: sections commercial interfaces.
 */
import type { DocsGuideCard } from '../bitcode-docs-types';

export const commercialInterfaceSections = [
  {
    id: 'interface-model',
    eyebrow: 'Interfaces',
    title: 'Commercial interfaces read and write route state under Protocol rules',
    summary:
      'GitHub, webhooks, ChatGPT App, Bitcode MCP, storage, compute, and future partner surfaces can admit inputs or deliver outputs, but they must not become parallel product owners.',
    detail:
      'An interface is healthy when its write admission is explicit, its read result can be found in /packs, and its boundary posture is source-safe before settlement, BTD rights transfer, and repository delivery.',
    reason:
      'This prevents interface sprawl from diluting the Bitcode AssetPack contract.',
    points: [
      'Ingress surfaces attach source, Read, or destination context.',
      'Delivery surfaces provide Shippables backed by AssetPack evidence.',
      'Every interface must preserve proof, disclosure, and fail-closed boundaries.',
    ],
  },
  {
    id: 'github-webhooks',
    eyebrow: 'GitHub + webhooks',
    title: 'GitHub and webhooks are connected-interface delivery and ingress surfaces',
    summary:
      'GitHub can bind repository supply and deliver the Protocol-backed Shippable as a pull request. Webhooks can schedule AssetPack automation and record ingress basis.',
    detail:
      'Neither GitHub nor webhooks own product canon. Their job is to feed or receive Bitcode-controlled state and leave evidence behind.',
    reason:
      'This keeps repository automation commercially useful without turning external provider behavior into unprovable product truth.',
  },
  {
    id: 'compute-storage',
    eyebrow: 'Runtime',
    title: 'Compute and storage are hardened runtime surfaces',
    summary:
      'Compute-container execution, storage publication/retrieval, telemetry, and reconciliation must be visible when they affect proof, source, settlement, or disclosure posture.',
    detail:
      'Users do not read every runtime detail by default. They do read to know what is live, what is modeled, what is boundary-only, and what is blocked.',
    reason:
      'Runtime honesty is the difference between a trusted commercial interface and a black-box automation demo.',
  },
] as const satisfies readonly DocsGuideCard[];

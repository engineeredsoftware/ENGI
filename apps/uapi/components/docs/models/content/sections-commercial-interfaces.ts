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
      'GitHub, webhooks, ChatGPT App, MCP, storage, compute, and partner surfaces may admit inputs or deliver outputs — they must not become parallel product owners.',
    detail:
      'An interface is healthy when write admission is explicit, results are rereadable in /exchange, and boundary posture stays source-safe before settlement, BTD rights transfer, and delivery.',
    reason:
      'Interface sprawl must not dilute the DataPack contract or invent a second ledger.',
    points: [
      'Ingress attaches permitted source, Reading, or destination context.',
      'Delivery surfaces ship knowledge backed by DataPack evidence.',
      'Every interface preserves proof, disclosure, and fail-closed boundaries.',
    ],
  },
  {
    id: 'github-webhooks',
    eyebrow: 'GitHub + webhooks',
    title: 'GitHub and webhooks are connected-interface delivery and ingress surfaces',
    summary:
      'GitHub can bind repository supply and deliver the Protocol-backed Shippable as a pull request. Webhooks can schedule DataPack automation and record ingress basis.',
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

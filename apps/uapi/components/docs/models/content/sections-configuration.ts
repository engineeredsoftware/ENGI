/**
 * Docs: configuration, launch mode, fail-closed honesty.
 */
import type { DocsGuideCard } from '../bitcode-docs-types';

export const configurationSections = [
  {
    id: 'environment-modes',
    eyebrow: 'Modes',
    title: 'Environment mode and feature flags explain what is live',
    summary:
      'Production, staging, development, and mock postures must stay explicit. Feature flags can keep controls visible but disabled until the connected implementation is ready.',
    detail:
      'A disabled control should still teach what it will do. That keeps operators oriented and avoids implying that missing connectivity is accidental breakage.',
    reason:
      'Honest configuration language is essential while the commercial product advances from review-only readiness toward full live connectivity.',
    points: [
      'Disabled controls remain visible with clear explainer copy.',
      'Product routes (/exchange, /reads, /deposits) are the active commercial center.',
      'Boundary truth should be readable before any proof or settlement trust decision.',
    ],
  },
  {
    id: 'preferences',
    eyebrow: 'Preferences',
    title: 'Configuration should be rich but consequence-oriented',
    summary:
      'Auxillary configuration includes repository connections, interface defaults, profile identity, wallet posture, organization roles, BTD settings, and future connected-interface options.',
    detail:
      'Each preference should explain the operational consequence: what it changes in route detail, settlement, delivery, or proof visibility.',
    reason:
      'Configuration is not a settings dump; it is the control plane around DataPacks.',
  },
  {
    id: 'fail-closed',
    eyebrow: 'Safety',
    title: 'Every blocked configuration path should fail closed',
    summary:
      'Wallet verification drift, missing repository scope, stale connection state, projection overexposure, or unadmitted interface writes should block the risky action while preserving safe reads and learning.',
    detail:
      'The product can still show review-only or mocked posture, but it must be honest about what cannot yet transact or deliver.',
    reason:
      'Fail-closed behavior makes launch UX useful without weakening production standards.',
  },
] as const satisfies readonly DocsGuideCard[];

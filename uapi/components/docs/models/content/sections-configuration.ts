/**
 * Docs content module: sections configuration.
 */
import type { DocsGuideCard } from '../bitcode-docs-types';

export const configurationSections = [
  {
    id: 'environment-modes',
    eyebrow: 'Modes',
    title: 'Environment mode, feature flags, and boundary state explain what is live',
    summary:
      'Production, staging, development, and mock postures must stay explicit. Feature flags can keep launch-mode controls visible but disabled until the connected implementation is ready.',
    detail:
      'A disabled control should still teach what it will do. That keeps users oriented and avoids implying that missing connectivity is accidental breakage.',
    reason:
      'This is especially important while Terminal is active and advancing from mocked state toward commercial readiness.',
    points: [
      'Disabled controls remain visible with clear tooltip copy.',
      'Product routes are active; compatibility and Auxillaries surfaces can remain gated by launch flags.',
      'Boundary truth should be readable before any proof or settlement trust decision.',
    ],
  },
  {
    id: 'preferences',
    eyebrow: 'Preferences',
    title: 'Configuration should be rich but consequence-oriented',
    summary:
      'Auxillary configuration includes repository connections, interface defaults, profile identity, wallet posture, organization roles, $BTD settings, and future connected-interface options.',
    detail:
      'Each preference should explain the operational consequence: what it changes in route detail, settlement, delivery, or proof visibility.',
    reason:
      'Configuration is not a settings dump; it is the user-facing control plane around AssetPacks.',
  },
  {
    id: 'fail-closed',
    eyebrow: 'Safety',
    title: 'Every blocked configuration path should fail closed',
    summary:
      'Wallet verification drift, missing repository scope, stale connection state, projection overexposure, or unadmitted interface writes should block the risky action while preserving safe reads and learning.',
    detail:
      'The product can still show mocked or review-only state, but it must be honest about what cannot yet transact or deliver.',
    reason:
      'Fail-closed behavior makes launch-mode UX useful without weakening the production standard.',
  },
] as const satisfies readonly DocsGuideCard[];

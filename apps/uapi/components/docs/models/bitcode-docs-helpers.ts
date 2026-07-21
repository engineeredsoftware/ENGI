/**
 * Docs content helpers: disclosure limit injection and page construction.
 */
import type { BitcodeDocsPage, DocsGuideCard } from './bitcode-docs-types';

const PUBLIC_DISCLOSURE_LIMIT_SECTION = {
  id: 'public-disclosure-limits',
  eyebrow: 'Disclosure limits',
  title: 'Public docs expose guidance and proof posture, not protected source',
  summary:
    'Public Bitcode docs derive from the active Protocol, package-owned catalogs, route contracts, and source-safe generated artifacts. They can explain usage, measurements, event ids, proof roots, docs links, runbook links, redaction posture, testnet rollout readiness, fee boundaries, and settlement posture.',
  detail:
    'They must not reveal protected source payloads, raw protected prompts, secret values, provider tokens, wallet private material, or unpaid DataPack source. Source-bearing DataPack contents cross to the reader only after settlement and rights transfer.',
  reason:
    'This keeps the public product understandable while preserving the boundary that makes DataPacks economically and operationally safe.',
  points: [
    'Allowed: usage guidance, route links, state labels, source-safe measurements, proof roots, dashboard/runbook ids, redacted incident posture, testnet rollout readiness, LocalStagingTelemetryDocumentationRehearsal evidence, and fee/right boundaries.',
    'Interface docs may surface event ids, proof roots, docs links, runbook links, and redaction posture from TelemetryDocumentationInterfaceIntegration without revealing source-bearing payloads.',
    'Local and staging-testnet rehearsal docs may surface documentation discovery, telemetry event emission, dashboard/runbook lookup, docs QA, incident drill, source-safe proof-root review, and blocked value-bearing mainnet posture.',
    'Blocked: secrets, provider tokens, wallet private material, raw protected prompts, protected source payloads, and unpaid DataPack source.',
    'Docs QA fails closed when public docs, internal docs, route docs, interface docs, generated artifacts, proof posture, or workflow checks drift.',
    'Compatibility boundaries stay explicit: /exchange redirects to /exchange and does not create a parallel current product surface.',
  ],
} as const satisfies DocsGuideCard;

export function withPublicDisclosureLimit(sections: readonly DocsGuideCard[]): readonly DocsGuideCard[] {
  if (sections.some((section) => section.id === PUBLIC_DISCLOSURE_LIMIT_SECTION.id)) return sections;
  return [...sections, PUBLIC_DISCLOSURE_LIMIT_SECTION];
}

export function docsPage(page: Omit<BitcodeDocsPage, 'href'>): BitcodeDocsPage {
  return {
    ...page,
    href: `/docs/${page.slug}`,
    sections: withPublicDisclosureLimit(page.sections),
  };
}

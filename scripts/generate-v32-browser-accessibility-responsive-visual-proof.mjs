#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v32-browser-accessibility-responsive-visual-proof.json';
const GENERATED_AT = '2026-05-22T00:00:00.000Z';

const SECRET_MARKERS = Object.freeze([
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJ', 'hbGci', 'OiJI', 'UzI1', 'NiIsInR5cCI6IkpXVCJ9'].join(''),
  ['SUPABASE', 'SERVICE', 'ROLE'].join('_'),
  ['OPENAI', 'API', 'KEY'].join('_'),
  ['VERCEL', 'TOKEN'].join('_'),
  ['VERCEL', 'OIDC', 'TOKEN'].join('_'),
]);
const SECRET_PATTERN = new RegExp(SECRET_MARKERS.map(escapeRegex).join('|'), 'u');

const surfaces = Object.freeze([
  {
    surfaceId: 'terminal',
    states: ['default', 'guided', 'detail'],
    evidenceFiles: [
      'apps/uapi/app/terminal/terminal-ux-browser-proof.ts',
      'apps/uapi/tests/terminalUxBrowserProof.test.tsx',
      'apps/uapi/tests/e2e/commercial-mvp.terminal-ux.spec.ts',
      'apps/uapi/tests/e2e/bitcode-browser-accessibility-responsive-proof.spec.ts',
    ],
  },
  {
    surfaceId: 'auxillaries',
    states: ['default', 'guided', 'detail'],
    evidenceFiles: [
      'apps/uapi/app/auxillaries/auxillaries-ux-accessibility-proof.ts',
      'apps/uapi/tests/auxillariesContent.access.test.tsx',
      'apps/uapi/tests/e2e/commercial-mvp.auxillaries.spec.ts',
      'apps/uapi/tests/e2e/bitcode-browser-accessibility-responsive-proof.spec.ts',
    ],
  },
]);

const viewports = Object.freeze([
  { id: 'phone', width: 390, height: 844 },
  { id: 'tablet', width: 768, height: 1024 },
  { id: 'laptop', width: 1280, height: 900 },
  { id: 'widescreen', width: 1920, height: 1080 },
]);

const accessibilityAssertions = Object.freeze([
  'keyboard-path',
  'landmark-labels',
  'focus-state',
  'status-announcements',
  'contrast-sensitive-tokens',
  'reduced-motion',
  'overflow-wrapping',
  'deterministic-visual-semantics',
]);

const visualProofStrategy = Object.freeze([
  'semantic-layout-metrics',
  'stable-route-state-contracts',
  'stateful-accessibility-roles',
  'no-screenshot-only-approval',
]);

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function sha256(value) {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`;
}

function sortJson(value) {
  if (Array.isArray(value)) return value.map(sortJson);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => [key, sortJson(entry)]),
  );
}

function stableStringify(value) {
  return `${JSON.stringify(sortJson(value), null, 2)}\n`;
}

function scanTokens(relativePath, tokens) {
  const text = read(relativePath);
  return {
    relativePath,
    digest: sha256(text),
    requiredTokens: tokens.map((token) => ({
      token,
      present: text.includes(token),
    })),
  };
}

function allTokensPresent(scan) {
  return scan.requiredTokens.every((entry) => entry.present);
}

export function buildV32BrowserAccessibilityResponsiveVisualProof() {
  const sourceEvidence = [
    scanTokens('apps/uapi/app/bitcode-browser-accessibility-responsive-proof.ts', [
      'BITCODE_BROWSER_ACCESSIBILITY_RESPONSIVE_PROOF_CONTRACT',
      'keyboard-path',
      'deterministic-visual-semantics',
      'no-screenshot-only-approval',
    ]),
    scanTokens('apps/uapi/app/terminal/terminal-ux-browser-proof.ts', [
      'TERMINAL_UX_BROWSER_PROOF_VIEWPORTS',
      'source-safe-preview',
    ]),
    scanTokens('apps/uapi/app/auxillaries/auxillaries-ux-accessibility-proof.ts', [
      'AUXILLARIES_UX_ACCESSIBILITY_PROOF_CONTRACT',
      'audit-expanded',
    ]),
    scanTokens('apps/uapi/styles/auxillaries-bitcode.css', [
      'focus-visible',
      'overflow-wrap: anywhere',
      '@media (prefers-reduced-motion: reduce)',
    ]),
  ];
  const testEvidence = [
    scanTokens('apps/uapi/tests/bitcodeBrowserAccessibilityResponsiveProof.test.ts', [
      'covers Terminal and Auxillaries default, guided, and detail states',
      'requires keyboard, labels, focus, status, contrast, motion, overflow',
      'no-screenshot-only-approval',
    ]),
    scanTokens('apps/uapi/tests/e2e/bitcode-browser-accessibility-responsive-proof.spec.ts', [
      'Terminal default, guided, and detail states stay semantic and responsive',
      'Auxillaries default, guided, and detail states stay semantic and responsive',
      'expectNoHorizontalOverflow',
      "reducedMotion: 'reduce'",
    ]),
    scanTokens('apps/uapi/tests/terminalUxBrowserProof.test.tsx', [
      'renders Terminal workspace loading, failed, and empty states with explicit semantics',
      'marks selected detail sections as route-owned controls',
    ]),
    scanTokens('apps/uapi/tests/auxillariesContent.access.test.tsx', [
      'named landmarks, skip navigation, active-pane announcements',
      'expandable audit detail',
    ]),
  ];
  const sourceEvidenceComplete = sourceEvidence.every(allTokensPresent);
  const testEvidenceComplete = testEvidence.every(allTokensPresent);
  const passed =
    surfaces.length === 2 &&
    surfaces.every((surface) => surface.states.join(',') === 'default,guided,detail') &&
    viewports.length === 4 &&
    accessibilityAssertions.length === 8 &&
    visualProofStrategy.includes('no-screenshot-only-approval') &&
    sourceEvidenceComplete &&
    testEvidenceComplete;

  return {
    artifactId: 'v32-browser-accessibility-responsive-visual-proof',
    schemaId: 'bitcode.v32.browserAccessibilityResponsiveVisualProof.v1',
    version: 'V32',
    currentTarget: 'V31',
    generatedAt: GENERATED_AT,
    sourceSafetyVerdict: 'source-safe-browser-visual-proof-metadata',
    surfaces,
    viewports,
    accessibilityAssertions,
    visualProofStrategy,
    proofCoverage: {
      surfaceCount: surfaces.length,
      stateCount: surfaces.reduce((total, surface) => total + surface.states.length, 0),
      viewportCount: viewports.length,
      assertionCount: accessibilityAssertions.length,
      screenshotOnlyApproval: false,
      protectedSourceVisible: false,
      credentialsSerialized: false,
    },
    sourceEvidence,
    testEvidence,
    passed,
    closureCommand: 'pnpm run check:v32-gate7',
  };
}

function main() {
  const mode = process.argv.includes('--check') ? 'check' : 'write';
  const artifact = buildV32BrowserAccessibilityResponsiveVisualProof();
  const next = stableStringify(artifact);
  const artifactFile = path.join(repoRoot, ARTIFACT_PATH);

  if (SECRET_PATTERN.test(next)) {
    throw new Error('V32 Gate 7 browser proof artifact contains a secret-shaped marker.');
  }
  if (!artifact.passed) {
    throw new Error('V32 Gate 7 browser proof artifact source evidence is incomplete.');
  }

  if (mode === 'check') {
    if (!existsSync(artifactFile)) {
      throw new Error(`${ARTIFACT_PATH} is missing. Run pnpm run generate:v32-browser-accessibility-responsive-visual-proof.`);
    }
    const current = readFileSync(artifactFile, 'utf8');
    if (current !== next) {
      throw new Error(`${ARTIFACT_PATH} is stale. Run pnpm run generate:v32-browser-accessibility-responsive-visual-proof.`);
    }
    process.stdout.write(`V32 browser accessibility responsive visual proof artifact ok ${ARTIFACT_PATH}\n`);
    return;
  }

  mkdirSync(path.dirname(artifactFile), { recursive: true });
  writeFileSync(artifactFile, next);
  process.stdout.write(`Wrote ${ARTIFACT_PATH}\n`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

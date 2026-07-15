#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v33-interface-consumer-ux-regression-proof.json';
const GENERATED_AT = '2026-05-22T00:00:00.000Z';

const requiredSurfaces = Object.freeze([
  'public_api',
  'mcp_api',
  'chatgpt_app',
  'terminal_handoff',
  'package_consumer',
]);
const requiredPostures = Object.freeze(['success_readable', 'denied_readable', 'blocked_preview']);
const requiredCapabilities = Object.freeze([
  'action_label',
  'source_safe_summary',
  'proof_roots',
  'repair_steps',
  'fee_rights_preview',
  'denial_readability',
]);
const rows = Object.freeze([
  row({
    rowId: 'interface.consumer.public-api-read-access-denied',
    surface: 'public_api',
    consumerPath: '/api/btd/read-access',
    actionLabel: 'Read access decision',
    posture: 'denied_readable',
    visibilityBoundary: 'denied_state',
    summary:
      'Public API consumers receive a structured denial with proof roots, repair steps, and no source disclosure.',
    proofRoots: ['authority-root:public-api-read-access', 'license-root:public-api-read-access'],
    repairSteps: ['refresh-read-license', 'replay-public-api-read-access'],
    previewId: 'public-api-read-access',
    previewState: 'blocked_until_rights',
    rightsPosture: 'missing',
    fixturePath: 'packages/api/src/routes/__tests__/btd-crypto.test.ts',
    replayCommand:
      'pnpm --filter @bitcode/api exec jest --config jest.config.cjs --runTestsByPath src/routes/__tests__/btd-crypto.test.ts --runInBand',
    readableDenial: 'Read license or organization authority is required before protected AssetPack delivery.',
    denialCode: 'READ_LICENSE_OR_AUTHORITY_MISSING',
  }),
  row({
    rowId: 'interface.consumer.mcp-finding-fits-readable',
    surface: 'mcp_api',
    consumerPath: 'bitcode://pipelines/asset-pack/create',
    actionLabel: 'Request Finding Fits',
    posture: 'success_readable',
    visibilityBoundary: 'source_safe_preview',
    summary:
      'MCP consumers can see queued Finding Fits admission, source-safe roots, and next repair replay command.',
    proofRoots: ['execution-root:mcp-reading-pipeline', 'generated-proof-root:mcp-reading-pipeline'],
    repairSteps: ['replay-mcp-pipeline-ingress', 'inspect-queued-pipeline-roots'],
    previewId: 'mcp-finding-fits',
    previewState: 'preview_admitted',
    rightsPosture: 'preview_only_locked',
    fixturePath:
      'apps/mcp/src/__tests__/unit/pipeline-ingress-contract.test.ts',
    replayCommand:
      'pnpm --dir apps/mcp run test:mcp -- --runTestsByPath src/__tests__/unit/pipeline-ingress-contract.test.ts --runInBand',
    successSummary: 'Finding Fits request is queued with source-safe proof roots and rights preview.',
  }),
  row({
    rowId: 'interface.consumer.chatgpt-delivery-blocked',
    surface: 'chatgpt_app',
    consumerPath: 'chatgpt://actions/bitcode_deliver_asset_pack',
    actionLabel: 'Deliver AssetPack',
    posture: 'blocked_preview',
    visibilityBoundary: 'blocked_until_settlement',
    summary:
      'ChatGPT App consumers see confirmation, settlement, and rights blockers before delivery can expose source.',
    proofRoots: ['confirmation-root:chatgpt-delivery', 'rights-root:chatgpt-delivery'],
    repairSteps: ['confirm-reader-action', 'settle-btc-fee-before-delivery'],
    previewId: 'chatgpt-delivery',
    previewState: 'blocked_until_rights',
    rightsPosture: 'settlement_pending',
    fixturePath: 'apps/chatgpt/src/__tests__/tools.test.ts',
    replayCommand:
      'pnpm --dir packages/chatgptapp exec jest --runTestsByPath src/__tests__/tools.test.ts --runInBand',
    readableDenial: 'Reader confirmation and paid AssetPack rights are required before delivery.',
    denialCode: 'CONFIRMATION_OR_SETTLEMENT_REQUIRED',
  }),
  row({
    rowId: 'interface.consumer.terminal-preview-blocked',
    surface: 'terminal_handoff',
    consumerPath: 'terminal://reading/asset-pack-preview',
    actionLabel: 'Review AssetPack preview',
    posture: 'blocked_preview',
    visibilityBoundary: 'blocked_until_settlement',
    summary:
      'product handoff shows AssetPack measurements, fee posture, proof roots, and settlement repair steps only.',
    proofRoots: ['preview-root:terminal-reading', 'settlement-root:terminal-reading'],
    repairSteps: ['review-source-safe-preview', 'settle-btc-fee-to-unlock-rights'],
    previewId: 'terminal-preview',
    previewState: 'blocked_until_rights',
    rightsPosture: 'settlement_pending',
    fixturePath: 'apps/uapi/tests/terminalOrganizationAuthority.test.ts',
    replayCommand:
      'pnpm --dir apps/uapi exec jest --runTestsByPath tests/terminalOrganizationAuthority.test.ts --runInBand',
    readableDenial: 'AssetPack source remains locked until BTC settlement and BTD rights transfer are admitted.',
    denialCode: 'ASSETPACK_SOURCE_LOCKED_UNTIL_SETTLEMENT',
  }),
  row({
    rowId: 'interface.consumer.package-contract-readback',
    surface: 'package_consumer',
    consumerPath: 'package://@bitcode/btd/interface-consumer-ux-regression-proof',
    actionLabel: 'Read interface consumer UX proof',
    posture: 'success_readable',
    visibilityBoundary: 'package_contract_readback',
    summary: 'Package consumers replay the same consumer UX rows without route-local reinterpretation.',
    proofRoots: ['package-root:interface-consumer-ux', 'registry-root:interface-consumer-ux'],
    repairSteps: ['regenerate-interface-consumer-ux-artifact', 'rerun-package-proof-test'],
    previewId: 'package-consumer',
    previewState: 'source_safe_catalog',
    rightsPosture: 'not_required',
    fixturePath: 'packages/btd/__tests__/interface-consumer-ux-regression-proof.test.ts',
    replayCommand:
      'pnpm --filter @bitcode/btd test -- --runTestsByPath __tests__/interface-consumer-ux-regression-proof.test.ts',
    successSummary: 'Package consumer can replay source-safe UX proof rows.',
  }),
]);

const secretMarkers = Object.freeze([
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['SUPABASE', 'SERVICE', 'ROLE'].join('_'),
  ['OPENAI', 'API', 'KEY'].join('_'),
  ['VERCEL', 'TOKEN'].join('_'),
  ['VERCEL', 'OIDC', 'TOKEN'].join('_'),
  ['eyJhbGciOi', 'JIUzI1NiIsInR5cCI6IkpXVCJ9'].join(''),
]);

function row({
  rowId,
  surface,
  consumerPath,
  actionLabel,
  posture,
  visibilityBoundary,
  summary,
  proofRoots,
  repairSteps,
  previewId,
  previewState,
  rightsPosture,
  fixturePath,
  replayCommand,
  readableDenial,
  denialCode,
  successSummary,
}) {
  const feeRightsPreview = {
    previewState,
    feeQuoteRoot: `fee-quote-root:${previewId}`,
    rightsPosture,
    protectedSourceVisible: false,
    previewRoot: stableRoot('btd-interface-consumer-ux-fee-rights-preview', [
      previewState,
      `fee-quote-root:${previewId}`,
      rightsPosture,
      rightsPosture === 'not_required'
        ? 'Package contract readback does not transfer BTD rights.'
        : 'Reader can review measurements and rights posture before BTC settlement unlocks source delivery.',
    ]),
  };

  return {
    rowId,
    surface,
    consumerPath,
    actionLabel,
    posture,
    visibilityBoundary,
    sourceSafeSummary: summary,
    proofRoots,
    repairSteps,
    feeRightsPreview,
    fixturePath,
    replayCommand,
    capabilities: requiredCapabilities,
    readableDenial,
    denialCode,
    successSummary,
    protectedSourceVisible: false,
    promptBodyVisible: false,
    brittleDemonstrationFixture: false,
    rowRoot: stableRoot('btd-interface-consumer-ux-regression-row', [
      rowId,
      surface,
      consumerPath,
      actionLabel,
      posture,
      visibilityBoundary,
      summary,
      proofRoots.join(','),
      repairSteps.join(','),
      feeRightsPreview.previewRoot,
      fixturePath,
      replayCommand,
    ]),
  };
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function sha256(value) {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`;
}

function stableRoot(prefix, parts) {
  return `${prefix}:${createHash('sha256').update(parts.join('\u001f')).digest('hex').slice(0, 24)}`;
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

function hasBrittleDemonstrationFixture(entry) {
  return /protocol-demonstration|demo-only|mock-only/iu.test(entry.fixturePath)
    || /demo-only|mock-only/iu.test(entry.consumerPath);
}

export function buildV33InterfaceConsumerUxRegressionProofArtifact() {
  const sourceEvidence = [
    scanTokens('packages/btd/src/interface-consumer-ux-regression-proof.ts', [
      'buildBtdInterfaceConsumerUxRegressionProof',
      'BTD_INTERFACE_CONSUMER_UX_REGRESSION_REQUIRED_CAPABILITIES',
      'interface.consumer.public-api-read-access-denied',
      'interface.consumer.terminal-preview-blocked',
      'brittleDemonstrationFixture',
    ]),
    scanTokens('packages/btd/src/index.ts', ['interface-consumer-ux-regression-proof']),
    scanTokens('packages/btd/package.json', ['./interface-consumer-ux-regression-proof']),
  ];
  const testEvidence = [
    scanTokens('packages/btd/__tests__/interface-consumer-ux-regression-proof.test.ts', [
      'publishes source-safe consumer rows for every required surface, posture, and capability',
      'records readable summaries, proof roots, repair steps, and fee or rights previews',
      'rejects secrets, prompt bodies, protected payloads, and demonstration-only fixtures',
    ]),
    scanTokens('packages/api/src/routes/__tests__/btd-crypto.test.ts', [
      'shares the package-owned InterfaceConsumerUxRegressionProof for public API denied states',
      'interface.consumer.public-api-read-access-denied',
    ]),
    scanTokens('apps/mcp/src/__tests__/unit/pipeline-ingress-contract.test.ts', [
      'shares the package-owned InterfaceConsumerUxRegressionProof for MCP Finding Fits readability',
      'interface.consumer.mcp-finding-fits-readable',
    ]),
    scanTokens('apps/chatgpt/src/__tests__/tools.test.ts', [
      'shares the package-owned InterfaceConsumerUxRegressionProof for ChatGPT App blocked delivery',
      'interface.consumer.chatgpt-delivery-blocked',
    ]),
    scanTokens('apps/uapi/tests/terminalOrganizationAuthority.test.ts', [
      'shares the package-owned InterfaceConsumerUxRegressionProof for product handoff readability',
      'interface.consumer.terminal-preview-blocked',
    ]),
  ];
  const docsEvidence = [
    scanTokens('.specifications/BITCODE_SPEC_V33.md', ['InterfaceConsumerUxRegressionProof', 'Gate 9']),
    scanTokens('.specifications/BITCODE_SPEC_V33_DELTA.md', ['Interface Consumer UX Regression Proof']),
    scanTokens('.specifications/BITCODE_SPEC_V33_NOTES.md', ['Gate 9 closure notes']),
    scanTokens('.specifications/BITCODE_SPEC_V33_PARITY_MATRIX.md', ['Interface consumer UX regression proof']),
    scanTokens('.specifications/SPECIFICATIONS_ROADMAP.md', ['V33 Gate 9 Interface Consumer UX Regression Proof']),
  ];
  const observedSurfaces = Array.from(new Set(rows.map((entry) => entry.surface))).sort();
  const observedPostures = Array.from(new Set(rows.map((entry) => entry.posture))).sort();
  const observedCapabilities = Array.from(new Set(rows.flatMap((entry) => entry.capabilities))).sort();
  const missingSurfaces = requiredSurfaces.filter((surface) => !observedSurfaces.includes(surface));
  const missingPostures = requiredPostures.filter((posture) => !observedPostures.includes(posture));
  const missingCapabilities = requiredCapabilities.filter(
    (capability) => !observedCapabilities.includes(capability),
  );
  const serializedRows = stableStringify(rows);
  const credentialsSerialized = secretMarkers.some((marker) => serializedRows.includes(marker));
  const protectedSourceVisible = rows.some((entry) => entry.protectedSourceVisible);
  const promptBodyVisible = rows.some((entry) => entry.promptBodyVisible);
  const brittleDemonstrationFixture = rows.some(hasBrittleDemonstrationFixture);
  const allRowsHaveReadableShape = rows.every((entry) =>
    entry.actionLabel &&
    entry.sourceSafeSummary &&
    entry.proofRoots.length > 0 &&
    entry.repairSteps.length > 0 &&
    entry.feeRightsPreview?.previewRoot &&
    entry.replayCommand &&
    (entry.posture === 'success_readable' ? entry.successSummary : entry.readableDenial && entry.denialCode),
  );

  return {
    artifactId: 'v33-interface-consumer-ux-regression-proof',
    schemaId: 'bitcode.v33.interfaceConsumerUxRegressionProof.v1',
    version: 'V33',
    currentTarget: 'V32',
    generatedAt: GENERATED_AT,
    sourceSafetyVerdict: 'source-safe-consumer-ux-regression-proof',
    requiredSurfaces,
    observedSurfaces,
    missingSurfaces,
    requiredPostures,
    observedPostures,
    missingPostures,
    requiredCapabilities,
    observedCapabilities,
    missingCapabilities,
    rows,
    coverage: {
      actionLabelsReadable: rows.every((entry) => Boolean(entry.actionLabel)),
      sourceSafeSummariesReadable: rows.every((entry) => Boolean(entry.sourceSafeSummary)),
      proofRootsReadable: rows.every((entry) => entry.proofRoots.length > 0),
      repairStepsReadable: rows.every((entry) => entry.repairSteps.length > 0),
      feeRightsPreviewReadable: rows.every((entry) => Boolean(entry.feeRightsPreview?.previewRoot)),
      deniedStatesReadable: rows.some((entry) => entry.posture === 'denied_readable' && entry.readableDenial),
      blockedPreviewsReadable: rows.some((entry) => entry.posture === 'blocked_preview' && entry.readableDenial),
      protectedSourceVisible,
      promptBodyVisible,
      brittleDemonstrationFixture,
      credentialsSerialized,
      allRowsHaveReadableShape,
    },
    sourceEvidence,
    testEvidence,
    docsEvidence,
    sourceEvidenceComplete: sourceEvidence.every(allTokensPresent),
    testEvidenceComplete: testEvidence.every(allTokensPresent),
    docsEvidenceComplete: docsEvidence.every(allTokensPresent),
    artifactRoot: stableRoot('v33-interface-consumer-ux-regression-proof-artifact', [
      observedSurfaces.join(','),
      observedPostures.join(','),
      observedCapabilities.join(','),
      rows.map((entry) => entry.rowRoot).join(','),
      'consumer-ux-regression',
    ]),
    passed:
      missingSurfaces.length === 0 &&
      missingPostures.length === 0 &&
      missingCapabilities.length === 0 &&
      allRowsHaveReadableShape &&
      !protectedSourceVisible &&
      !promptBodyVisible &&
      !brittleDemonstrationFixture &&
      !credentialsSerialized &&
      sourceEvidence.every(allTokensPresent) &&
      testEvidence.every(allTokensPresent) &&
      docsEvidence.every(allTokensPresent),
  };
}

function main() {
  const check = process.argv.includes('--check');
  const artifact = buildV33InterfaceConsumerUxRegressionProofArtifact();
  const output = stableStringify(artifact);
  const target = path.join(repoRoot, ARTIFACT_PATH);

  if (check) {
    if (!existsSync(target)) {
      throw new Error(`${ARTIFACT_PATH} does not exist.`);
    }
    const current = readFileSync(target, 'utf8');
    if (current !== output) {
      throw new Error(`${ARTIFACT_PATH} is stale. Run pnpm run generate:v33-interface-consumer-ux-regression-proof.`);
    }
    if (!artifact.passed) {
      throw new Error(`${ARTIFACT_PATH} did not pass source/test/docs coverage.`);
    }
    return;
  }

  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, output);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main();
}

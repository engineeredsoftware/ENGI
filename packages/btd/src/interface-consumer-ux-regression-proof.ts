import { createHash } from 'crypto';
import { assertNonEmptyString } from './constants';
import type { BtdProtocolTelemetrySourceSafety } from './telemetry';

export const BTD_INTERFACE_CONSUMER_UX_REGRESSION_SURFACES = [
  'public_api',
  'mcp_api',
  'chatgpt_app',
  'terminal_handoff',
  'package_consumer',
] as const;

export type BtdInterfaceConsumerUxRegressionSurface =
  (typeof BTD_INTERFACE_CONSUMER_UX_REGRESSION_SURFACES)[number];

export const BTD_INTERFACE_CONSUMER_UX_REGRESSION_POSTURES = [
  'success_readable',
  'denied_readable',
  'blocked_preview',
] as const;

export type BtdInterfaceConsumerUxRegressionPosture =
  (typeof BTD_INTERFACE_CONSUMER_UX_REGRESSION_POSTURES)[number];

export const BTD_INTERFACE_CONSUMER_UX_REGRESSION_REQUIRED_CAPABILITIES = [
  'action_label',
  'source_safe_summary',
  'proof_roots',
  'repair_steps',
  'fee_rights_preview',
  'denial_readability',
] as const;

export type BtdInterfaceConsumerUxRegressionCapability =
  (typeof BTD_INTERFACE_CONSUMER_UX_REGRESSION_REQUIRED_CAPABILITIES)[number];

export type BtdInterfaceConsumerUxVisibilityBoundary =
  | 'source_safe_preview'
  | 'denied_state'
  | 'blocked_until_settlement'
  | 'package_contract_readback';

export interface BtdInterfaceConsumerUxFeeRightsPreviewInput {
  previewState: 'preview_admitted' | 'blocked_until_rights' | 'source_safe_catalog';
  feeQuoteRoot: string;
  rightsPosture: 'preview_only_locked' | 'missing' | 'settlement_pending' | 'not_required';
  btdRightsSummary: string;
}

export interface BtdInterfaceConsumerUxRegressionInput {
  rowId: string;
  surface: BtdInterfaceConsumerUxRegressionSurface;
  consumerPath: string;
  actionLabel: string;
  posture: BtdInterfaceConsumerUxRegressionPosture;
  visibilityBoundary: BtdInterfaceConsumerUxVisibilityBoundary;
  sourceSafeSummary: string;
  proofRoots: readonly string[];
  repairSteps: readonly string[];
  feeRightsPreview: BtdInterfaceConsumerUxFeeRightsPreviewInput;
  fixturePath: string;
  replayCommand: string;
  capabilities: readonly BtdInterfaceConsumerUxRegressionCapability[];
  readableDenial?: string;
  denialCode?: string;
  successSummary?: string;
}

export interface BtdInterfaceConsumerUxFeeRightsPreview {
  previewState: BtdInterfaceConsumerUxFeeRightsPreviewInput['previewState'];
  feeQuoteRoot: string;
  rightsPosture: BtdInterfaceConsumerUxFeeRightsPreviewInput['rightsPosture'];
  btdRightsSummary: string;
  protectedSourceVisible: false;
  previewRoot: string;
}

export interface BtdInterfaceConsumerUxRegressionRow {
  kind: 'btd.interface_consumer_ux_regression_row';
  rowId: string;
  surface: BtdInterfaceConsumerUxRegressionSurface;
  consumerPath: string;
  actionLabel: string;
  posture: BtdInterfaceConsumerUxRegressionPosture;
  visibilityBoundary: BtdInterfaceConsumerUxVisibilityBoundary;
  sourceSafeSummary: string;
  proofRoots: string[];
  repairSteps: string[];
  feeRightsPreview: BtdInterfaceConsumerUxFeeRightsPreview;
  fixturePath: string;
  replayCommand: string;
  capabilities: BtdInterfaceConsumerUxRegressionCapability[];
  readableDenial: string | null;
  denialCode: string | null;
  successSummary: string | null;
  protectedSourceVisible: false;
  promptBodyVisible: false;
  brittleDemonstrationFixture: false;
  sourceSafety: BtdProtocolTelemetrySourceSafety;
  rowRoot: string;
}

export interface BtdInterfaceConsumerUxRegressionProofInput {
  rows?: readonly BtdInterfaceConsumerUxRegressionInput[];
  requiredSurfaces?: readonly BtdInterfaceConsumerUxRegressionSurface[];
  requiredPostures?: readonly BtdInterfaceConsumerUxRegressionPosture[];
  requiredCapabilities?: readonly BtdInterfaceConsumerUxRegressionCapability[];
}

export interface BtdInterfaceConsumerUxRegressionProof {
  kind: 'btd.interface_consumer_ux_regression_proof';
  schemaId: 'bitcode.interfaceConsumerUxRegressionProof.v1';
  proofRoot: string;
  rowCount: number;
  requiredSurfaces: BtdInterfaceConsumerUxRegressionSurface[];
  observedSurfaces: BtdInterfaceConsumerUxRegressionSurface[];
  missingSurfaces: BtdInterfaceConsumerUxRegressionSurface[];
  requiredPostures: BtdInterfaceConsumerUxRegressionPosture[];
  observedPostures: BtdInterfaceConsumerUxRegressionPosture[];
  missingPostures: BtdInterfaceConsumerUxRegressionPosture[];
  requiredCapabilities: BtdInterfaceConsumerUxRegressionCapability[];
  observedCapabilities: BtdInterfaceConsumerUxRegressionCapability[];
  missingCapabilities: BtdInterfaceConsumerUxRegressionCapability[];
  rows: BtdInterfaceConsumerUxRegressionRow[];
  protectedSourceVisible: false;
  promptBodyVisible: false;
  brittleDemonstrationFixture: false;
  sourceSafety: BtdProtocolTelemetrySourceSafety;
}

const SOURCE_SAFETY: BtdProtocolTelemetrySourceSafety = {
  sourceSafe: true,
  protectedSourceVisible: false,
  containsProtectedSource: false,
  containsSecret: false,
};

const SECRET_OR_SOURCE_PATTERNS = [
  new RegExp(`${['sb', 'secret'].join('_')}__`, 'iu'),
  /\bsk-(?:proj|live|test)?[-_A-Za-z0-9]{16,}\b/u,
  /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/u,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/u,
  /\bprivate\s+source\b/iu,
  /\braw\s+source\b/iu,
  /\bprotected\s+source\s+(?:contents?|payload|text)\b/iu,
  /\bprompt\s+(?:body|contents?|text)\b/iu,
];

const BRITTLE_DEMONSTRATION_PATTERNS = [
  /\bprotocol-demonstration\b/iu,
  /\bdemo-only\b/iu,
  /\bmock-only\b/iu,
];

const DEFAULT_CAPABILITIES = [
  ...BTD_INTERFACE_CONSUMER_UX_REGRESSION_REQUIRED_CAPABILITIES,
] as const;

export function buildBtdInterfaceConsumerUxRegressionInputs(): BtdInterfaceConsumerUxRegressionInput[] {
  return [
    {
      rowId: 'interface.consumer.public-api-read-access-denied',
      surface: 'public_api',
      consumerPath: '/api/btd/read-access',
      actionLabel: 'Read access decision',
      posture: 'denied_readable',
      visibilityBoundary: 'denied_state',
      sourceSafeSummary:
        'Public API consumers receive a structured denial with proof roots, repair steps, and no source disclosure.',
      proofRoots: ['authority-root:public-api-read-access', 'license-root:public-api-read-access'],
      repairSteps: ['refresh-read-license', 'replay-public-api-read-access'],
      feeRightsPreview: feeRightsPreview('public-api-read-access', 'blocked_until_rights', 'missing'),
      fixturePath: 'packages/api/src/routes/__tests__/btd-crypto.test.ts',
      replayCommand:
        'pnpm --filter @bitcode/api exec jest --config jest.config.cjs --runTestsByPath src/routes/__tests__/btd-crypto.test.ts --runInBand',
      capabilities: DEFAULT_CAPABILITIES,
      readableDenial: 'Read license or organization authority is required before protected AssetPack delivery.',
      denialCode: 'READ_LICENSE_OR_AUTHORITY_MISSING',
    },
    {
      rowId: 'interface.consumer.mcp-finding-fits-readable',
      surface: 'mcp_api',
      consumerPath: 'bitcode://pipelines/asset-pack/create',
      actionLabel: 'Request Finding Fits',
      posture: 'success_readable',
      visibilityBoundary: 'source_safe_preview',
      sourceSafeSummary:
        'MCP consumers can see queued Finding Fits admission, source-safe roots, and next repair replay command.',
      proofRoots: ['execution-root:mcp-reading-pipeline', 'generated-proof-root:mcp-reading-pipeline'],
      repairSteps: ['replay-mcp-pipeline-ingress', 'inspect-queued-pipeline-roots'],
      feeRightsPreview: feeRightsPreview('mcp-finding-fits', 'preview_admitted', 'preview_only_locked'),
      fixturePath:
        'packages/generic-mcps/bitcode/src/__tests__/unit/pipeline-ingress-contract.test.ts',
      replayCommand:
        'pnpm --dir packages/generic-mcps/bitcode run test:mcp -- --runTestsByPath src/__tests__/unit/pipeline-ingress-contract.test.ts --runInBand',
      capabilities: DEFAULT_CAPABILITIES,
      successSummary: 'Finding Fits request is queued with source-safe proof roots and rights preview.',
    },
    {
      rowId: 'interface.consumer.chatgpt-delivery-blocked',
      surface: 'chatgpt_app',
      consumerPath: 'chatgpt://actions/bitcode_deliver_asset_pack',
      actionLabel: 'Deliver AssetPack',
      posture: 'blocked_preview',
      visibilityBoundary: 'blocked_until_settlement',
      sourceSafeSummary:
        'ChatGPT App consumers see confirmation, settlement, and rights blockers before delivery can expose source.',
      proofRoots: ['confirmation-root:chatgpt-delivery', 'rights-root:chatgpt-delivery'],
      repairSteps: ['confirm-reader-action', 'settle-btc-fee-before-delivery'],
      feeRightsPreview: feeRightsPreview('chatgpt-delivery', 'blocked_until_rights', 'settlement_pending'),
      fixturePath: 'packages/external-apps/chatgpt/src/__tests__/tools.test.ts',
      replayCommand:
        'pnpm --dir packages/chatgptapp exec jest --runTestsByPath src/__tests__/tools.test.ts --runInBand',
      capabilities: DEFAULT_CAPABILITIES,
      readableDenial: 'Reader confirmation and paid AssetPack rights are required before delivery.',
      denialCode: 'CONFIRMATION_OR_SETTLEMENT_REQUIRED',
    },
    {
      rowId: 'interface.consumer.terminal-preview-blocked',
      surface: 'terminal_handoff',
      consumerPath: 'terminal://reading/asset-pack-preview',
      actionLabel: 'Review AssetPack preview',
      posture: 'blocked_preview',
      visibilityBoundary: 'blocked_until_settlement',
      sourceSafeSummary:
        'Terminal handoff shows AssetPack measurements, fee posture, proof roots, and settlement repair steps only.',
      proofRoots: ['preview-root:terminal-reading', 'settlement-root:terminal-reading'],
      repairSteps: ['review-source-safe-preview', 'settle-btc-fee-to-unlock-rights'],
      feeRightsPreview: feeRightsPreview('terminal-preview', 'blocked_until_rights', 'settlement_pending'),
      fixturePath: 'uapi/tests/terminalOrganizationAuthority.test.ts',
      replayCommand:
        'pnpm --dir uapi exec jest --runTestsByPath tests/terminalOrganizationAuthority.test.ts --runInBand',
      capabilities: DEFAULT_CAPABILITIES,
      readableDenial: 'AssetPack source remains locked until BTC settlement and BTD rights transfer are admitted.',
      denialCode: 'ASSETPACK_SOURCE_LOCKED_UNTIL_SETTLEMENT',
    },
    {
      rowId: 'interface.consumer.package-contract-readback',
      surface: 'package_consumer',
      consumerPath: 'package://@bitcode/btd/interface-consumer-ux-regression-proof',
      actionLabel: 'Read interface consumer UX proof',
      posture: 'success_readable',
      visibilityBoundary: 'package_contract_readback',
      sourceSafeSummary:
        'Package consumers replay the same consumer UX rows without route-local reinterpretation.',
      proofRoots: ['package-root:interface-consumer-ux', 'registry-root:interface-consumer-ux'],
      repairSteps: ['regenerate-interface-consumer-ux-artifact', 'rerun-package-proof-test'],
      feeRightsPreview: feeRightsPreview('package-consumer', 'source_safe_catalog', 'not_required'),
      fixturePath: 'packages/btd/__tests__/interface-consumer-ux-regression-proof.test.ts',
      replayCommand:
        'pnpm --filter @bitcode/btd test -- --runTestsByPath __tests__/interface-consumer-ux-regression-proof.test.ts',
      capabilities: DEFAULT_CAPABILITIES,
      successSummary: 'Package consumer can replay source-safe UX proof rows.',
    },
  ];
}

export function buildBtdInterfaceConsumerUxRegressionRow(
  input: BtdInterfaceConsumerUxRegressionInput,
): BtdInterfaceConsumerUxRegressionRow {
  const rowId = assertSourceSafeConsumerString(input.rowId, 'rowId');
  const surface = assertSurface(input.surface);
  const consumerPath = assertSourceSafeConsumerString(input.consumerPath, 'consumerPath');
  const actionLabel = assertSourceSafeConsumerString(input.actionLabel, 'actionLabel');
  const posture = assertPosture(input.posture);
  const visibilityBoundary = assertVisibilityBoundary(input.visibilityBoundary);
  const sourceSafeSummary = assertSourceSafeConsumerString(input.sourceSafeSummary, 'sourceSafeSummary');
  const proofRoots = assertNonEmptySourceSafeList(input.proofRoots, 'proofRoot');
  const repairSteps = assertNonEmptySourceSafeList(input.repairSteps, 'repairStep');
  const feeRightsPreviewValue = buildFeeRightsPreview(input.feeRightsPreview);
  const fixturePath = assertSourceSafeConsumerString(input.fixturePath, 'fixturePath');
  const replayCommand = assertSourceSafeConsumerString(input.replayCommand, 'replayCommand');
  const capabilities = assertCapabilities(input.capabilities);
  const readableDenial = input.readableDenial
    ? assertSourceSafeConsumerString(input.readableDenial, 'readableDenial')
    : null;
  const denialCode = input.denialCode
    ? assertSourceSafeConsumerString(input.denialCode, 'denialCode')
    : null;
  const successSummary = input.successSummary
    ? assertSourceSafeConsumerString(input.successSummary, 'successSummary')
    : null;

  if (posture === 'success_readable' && !successSummary) {
    throw new Error(`${rowId} success_readable rows must include successSummary.`);
  }

  if ((posture === 'denied_readable' || posture === 'blocked_preview') && (!readableDenial || !denialCode)) {
    throw new Error(`${rowId} ${posture} rows must include readableDenial and denialCode.`);
  }

  const missingCapabilities = BTD_INTERFACE_CONSUMER_UX_REGRESSION_REQUIRED_CAPABILITIES.filter(
    (capability) => !capabilities.includes(capability),
  );
  if (missingCapabilities.length > 0) {
    throw new Error(`${rowId} is missing UX regression capabilities: ${missingCapabilities.join(', ')}`);
  }

  if (!/^(?:pnpm|npm|node)\b/u.test(replayCommand)) {
    throw new Error(`${rowId} replayCommand must start with a maintained package command.`);
  }

  if (BRITTLE_DEMONSTRATION_PATTERNS.some((pattern) => pattern.test(fixturePath) || pattern.test(consumerPath))) {
    throw new Error(`${rowId} must not depend on brittle demonstration-only fixtures.`);
  }

  const rowRoot = stableRoot('btd-interface-consumer-ux-regression-row', [
    rowId,
    surface,
    consumerPath,
    actionLabel,
    posture,
    visibilityBoundary,
    sourceSafeSummary,
    proofRoots.join(','),
    repairSteps.join(','),
    feeRightsPreviewValue.previewRoot,
    fixturePath,
    replayCommand,
  ]);

  return {
    kind: 'btd.interface_consumer_ux_regression_row',
    rowId,
    surface,
    consumerPath,
    actionLabel,
    posture,
    visibilityBoundary,
    sourceSafeSummary,
    proofRoots,
    repairSteps,
    feeRightsPreview: feeRightsPreviewValue,
    fixturePath,
    replayCommand,
    capabilities,
    readableDenial,
    denialCode,
    successSummary,
    protectedSourceVisible: false,
    promptBodyVisible: false,
    brittleDemonstrationFixture: false,
    sourceSafety: { ...SOURCE_SAFETY },
    rowRoot,
  };
}

export function buildBtdInterfaceConsumerUxRegressionProof(
  input: BtdInterfaceConsumerUxRegressionProofInput = {},
): BtdInterfaceConsumerUxRegressionProof {
  const rows = (input.rows ?? buildBtdInterfaceConsumerUxRegressionInputs()).map(
    buildBtdInterfaceConsumerUxRegressionRow,
  );
  const requiredSurfaces = [...(input.requiredSurfaces ?? BTD_INTERFACE_CONSUMER_UX_REGRESSION_SURFACES)];
  const requiredPostures = [...(input.requiredPostures ?? BTD_INTERFACE_CONSUMER_UX_REGRESSION_POSTURES)];
  const requiredCapabilities = [
    ...(input.requiredCapabilities ?? BTD_INTERFACE_CONSUMER_UX_REGRESSION_REQUIRED_CAPABILITIES),
  ];
  const observedSurfaces = Array.from(new Set(rows.map((row) => row.surface))).sort();
  const observedPostures = Array.from(new Set(rows.map((row) => row.posture))).sort();
  const observedCapabilities = Array.from(new Set(rows.flatMap((row) => row.capabilities))).sort();
  const missingSurfaces = requiredSurfaces.filter((surface) => !observedSurfaces.includes(surface));
  const missingPostures = requiredPostures.filter((posture) => !observedPostures.includes(posture));
  const missingCapabilities = requiredCapabilities.filter(
    (capability) => !observedCapabilities.includes(capability),
  );

  if (missingSurfaces.length > 0) {
    throw new Error(`InterfaceConsumerUxRegressionProof missing surfaces: ${missingSurfaces.join(', ')}`);
  }

  if (missingPostures.length > 0) {
    throw new Error(`InterfaceConsumerUxRegressionProof missing postures: ${missingPostures.join(', ')}`);
  }

  if (missingCapabilities.length > 0) {
    throw new Error(`InterfaceConsumerUxRegressionProof missing capabilities: ${missingCapabilities.join(', ')}`);
  }

  if (rows.some((row) => row.protectedSourceVisible || row.promptBodyVisible)) {
    throw new Error('InterfaceConsumerUxRegressionProof must not expose protected source or prompt bodies.');
  }

  if (rows.some((row) => row.brittleDemonstrationFixture)) {
    throw new Error('InterfaceConsumerUxRegressionProof must not depend on brittle demonstration-only fixtures.');
  }

  return {
    kind: 'btd.interface_consumer_ux_regression_proof',
    schemaId: 'bitcode.interfaceConsumerUxRegressionProof.v1',
    proofRoot: stableRoot('btd-interface-consumer-ux-regression-proof', [
      observedSurfaces.join(','),
      observedPostures.join(','),
      observedCapabilities.join(','),
      rows.map((row) => row.rowRoot).join(','),
    ]),
    rowCount: rows.length,
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
    protectedSourceVisible: false,
    promptBodyVisible: false,
    brittleDemonstrationFixture: false,
    sourceSafety: { ...SOURCE_SAFETY },
  };
}

export function getBtdInterfaceConsumerUxRegressionRow(
  rowId: string,
): BtdInterfaceConsumerUxRegressionRow {
  const proof = buildBtdInterfaceConsumerUxRegressionProof();
  const row = proof.rows.find((candidate) => candidate.rowId === rowId);

  if (!row) {
    throw new Error(`Unknown interface consumer UX regression row: ${rowId}`);
  }

  return row;
}

function feeRightsPreview(
  id: string,
  previewState: BtdInterfaceConsumerUxFeeRightsPreviewInput['previewState'],
  rightsPosture: BtdInterfaceConsumerUxFeeRightsPreviewInput['rightsPosture'],
): BtdInterfaceConsumerUxFeeRightsPreviewInput {
  return {
    previewState,
    feeQuoteRoot: `fee-quote-root:${id}`,
    rightsPosture,
    btdRightsSummary:
      rightsPosture === 'not_required'
        ? 'Package contract readback does not transfer BTD rights.'
        : 'Reader can review measurements and rights posture before BTC settlement unlocks source delivery.',
  };
}

function buildFeeRightsPreview(
  input: BtdInterfaceConsumerUxFeeRightsPreviewInput,
): BtdInterfaceConsumerUxFeeRightsPreview {
  const previewState = assertFeePreviewState(input.previewState);
  const rightsPosture = assertRightsPosture(input.rightsPosture);
  const feeQuoteRoot = assertSourceSafeConsumerString(input.feeQuoteRoot, 'feeQuoteRoot');
  const btdRightsSummary = assertSourceSafeConsumerString(input.btdRightsSummary, 'btdRightsSummary');

  return {
    previewState,
    feeQuoteRoot,
    rightsPosture,
    btdRightsSummary,
    protectedSourceVisible: false,
    previewRoot: stableRoot('btd-interface-consumer-ux-fee-rights-preview', [
      previewState,
      feeQuoteRoot,
      rightsPosture,
      btdRightsSummary,
    ]),
  };
}

function assertSurface(value: string): BtdInterfaceConsumerUxRegressionSurface {
  if (!BTD_INTERFACE_CONSUMER_UX_REGRESSION_SURFACES.includes(value as BtdInterfaceConsumerUxRegressionSurface)) {
    throw new Error(`Unsupported interface consumer UX surface: ${value}.`);
  }

  return value as BtdInterfaceConsumerUxRegressionSurface;
}

function assertPosture(value: string): BtdInterfaceConsumerUxRegressionPosture {
  if (!BTD_INTERFACE_CONSUMER_UX_REGRESSION_POSTURES.includes(value as BtdInterfaceConsumerUxRegressionPosture)) {
    throw new Error(`Unsupported interface consumer UX posture: ${value}.`);
  }

  return value as BtdInterfaceConsumerUxRegressionPosture;
}

function assertVisibilityBoundary(value: string): BtdInterfaceConsumerUxVisibilityBoundary {
  const allowed: readonly BtdInterfaceConsumerUxVisibilityBoundary[] = [
    'source_safe_preview',
    'denied_state',
    'blocked_until_settlement',
    'package_contract_readback',
  ];
  if (!allowed.includes(value as BtdInterfaceConsumerUxVisibilityBoundary)) {
    throw new Error(`Unsupported interface consumer UX visibility boundary: ${value}.`);
  }

  return value as BtdInterfaceConsumerUxVisibilityBoundary;
}

function assertFeePreviewState(
  value: string,
): BtdInterfaceConsumerUxFeeRightsPreviewInput['previewState'] {
  const allowed: readonly BtdInterfaceConsumerUxFeeRightsPreviewInput['previewState'][] = [
    'preview_admitted',
    'blocked_until_rights',
    'source_safe_catalog',
  ];
  if (!allowed.includes(value as BtdInterfaceConsumerUxFeeRightsPreviewInput['previewState'])) {
    throw new Error(`Unsupported interface consumer UX fee preview state: ${value}.`);
  }

  return value as BtdInterfaceConsumerUxFeeRightsPreviewInput['previewState'];
}

function assertRightsPosture(
  value: string,
): BtdInterfaceConsumerUxFeeRightsPreviewInput['rightsPosture'] {
  const allowed: readonly BtdInterfaceConsumerUxFeeRightsPreviewInput['rightsPosture'][] = [
    'preview_only_locked',
    'missing',
    'settlement_pending',
    'not_required',
  ];
  if (!allowed.includes(value as BtdInterfaceConsumerUxFeeRightsPreviewInput['rightsPosture'])) {
    throw new Error(`Unsupported interface consumer UX rights posture: ${value}.`);
  }

  return value as BtdInterfaceConsumerUxFeeRightsPreviewInput['rightsPosture'];
}

function assertCapabilities(
  values: readonly BtdInterfaceConsumerUxRegressionCapability[],
): BtdInterfaceConsumerUxRegressionCapability[] {
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error('Interface consumer UX capabilities must be a non-empty list.');
  }

  return values.map((value) => {
    if (!BTD_INTERFACE_CONSUMER_UX_REGRESSION_REQUIRED_CAPABILITIES.includes(value)) {
      throw new Error(`Unsupported interface consumer UX capability: ${value}.`);
    }

    return value;
  });
}

function assertNonEmptySourceSafeList(values: readonly string[], label: string): string[] {
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error(`${label} list must be non-empty.`);
  }

  return values.map((value, index) => assertSourceSafeConsumerString(value, `${label}[${index}]`));
}

function assertSourceSafeConsumerString(value: unknown, label: string): string {
  const text = assertNonEmptyString(value, label).trim();

  if (SECRET_OR_SOURCE_PATTERNS.some((pattern) => pattern.test(text))) {
    throw new Error(`${label} must not contain secrets, protected source payloads, or prompt bodies.`);
  }

  if (BRITTLE_DEMONSTRATION_PATTERNS.some((pattern) => pattern.test(text))) {
    throw new Error(`${label} must not depend on brittle demonstration-only behavior.`);
  }

  return text;
}

function stableRoot(prefix: string, parts: readonly string[]): string {
  return `${prefix}:${createHash('sha256').update(parts.join('\u001f')).digest('hex').slice(0, 24)}`;
}

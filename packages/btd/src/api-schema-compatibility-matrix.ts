import { createHash } from 'crypto';
import { assertNonEmptyString } from './constants';
import type { BtdProtocolTelemetrySourceSafety } from './telemetry';

export const BTD_API_SCHEMA_COMPATIBILITY_CONSUMER_SURFACES = [
  'public_api',
  'mcp_api',
  'chatgpt_app',
  'terminal_handoff',
  'package_consumer',
] as const;

export type BtdApiSchemaCompatibilityConsumerSurface =
  (typeof BTD_API_SCHEMA_COMPATIBILITY_CONSUMER_SURFACES)[number];

export const BTD_API_SCHEMA_COMPATIBILITY_EXAMPLE_POSTURES = [
  'success',
  'denied',
  'blocked',
  'stale',
  'deferred',
] as const;

export type BtdApiSchemaCompatibilityExamplePosture =
  (typeof BTD_API_SCHEMA_COMPATIBILITY_EXAMPLE_POSTURES)[number];

export type BtdApiSchemaCompatibilityStatus =
  | 'compatible'
  | 'breaking_change_denied'
  | 'blocked_until_rights'
  | 'stale_rejected'
  | 'deferred_not_admitted';

export type BtdApiSchemaCompatibilityBreakingChangePolicy =
  | 'additive_only'
  | 'gate_review_required'
  | 'deferred_until_gate';

export type BtdApiSchemaCompatibilitySourceSafetyClass =
  | 'source-safe-public'
  | 'source-safe-internal'
  | 'protected-source-locked'
  | 'deferred-blocker';

export interface BtdApiSchemaCompatibilityExampleEnvelope {
  request: Record<string, unknown>;
  response: Record<string, unknown>;
}

export interface BtdApiSchemaCompatibilityRowInput {
  rowId: string;
  consumerSurface: BtdApiSchemaCompatibilityConsumerSurface;
  routeId: string;
  method: string;
  path: string;
  schemaId: string;
  requestSchemaId: string;
  responseSchemaId: string;
  sourceSafetyClass: BtdApiSchemaCompatibilitySourceSafetyClass;
  compatibilityStatus: BtdApiSchemaCompatibilityStatus;
  breakingChangePolicy: BtdApiSchemaCompatibilityBreakingChangePolicy;
  examplePosture: BtdApiSchemaCompatibilityExamplePosture;
  exampleId: string;
  examplePath: string;
  fixturePath: string;
  validationCommand: string;
  protectedSourceVisible?: boolean;
  deferredReason?: string;
  example: BtdApiSchemaCompatibilityExampleEnvelope;
}

export interface BtdApiSchemaCompatibilityRow
  extends Omit<BtdApiSchemaCompatibilityRowInput, 'protectedSourceVisible'> {
  kind: 'btd.api_schema_compatibility_matrix.row';
  protectedSourceVisible: boolean;
  requestExampleRoot: string;
  responseExampleRoot: string;
  rowRoot: string;
  sourceSafety: BtdProtocolTelemetrySourceSafety;
}

export interface BtdApiSchemaCompatibilityMatrixInput {
  rows?: readonly BtdApiSchemaCompatibilityRowInput[];
  requiredConsumerSurfaces?: readonly BtdApiSchemaCompatibilityConsumerSurface[];
  requiredExamplePostures?: readonly BtdApiSchemaCompatibilityExamplePosture[];
}

export interface BtdApiSchemaCompatibilityMatrix {
  kind: 'btd.api_schema_compatibility_matrix';
  schemaId: 'bitcode.apiSchemaCompatibilityMatrix.v1';
  matrixRoot: string;
  rowCount: number;
  requiredConsumerSurfaces: BtdApiSchemaCompatibilityConsumerSurface[];
  observedConsumerSurfaces: BtdApiSchemaCompatibilityConsumerSurface[];
  missingConsumerSurfaces: BtdApiSchemaCompatibilityConsumerSurface[];
  requiredExamplePostures: BtdApiSchemaCompatibilityExamplePosture[];
  observedExamplePostures: BtdApiSchemaCompatibilityExamplePosture[];
  missingExamplePostures: BtdApiSchemaCompatibilityExamplePosture[];
  rows: BtdApiSchemaCompatibilityRow[];
  versionlessPathDiscipline: 'enforced';
  protectedSourceSerialized: false;
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
  /\bprotected\s+source\s+contents?\b/iu,
];

const API_ROUTE_PREFIXES = ['/api/', 'bitcode://', 'chatgpt://', 'terminal://', 'package://'] as const;

export function buildBtdApiSchemaCompatibilityRows(): BtdApiSchemaCompatibilityRowInput[] {
  return [
    {
      rowId: 'public-api-btd-registry-success',
      consumerSurface: 'public_api',
      routeId: 'api.btd.registry.snapshot',
      method: 'GET',
      path: '/api/btd/registry',
      schemaId: 'bitcode.api.btdRegistrySnapshot.v1',
      requestSchemaId: 'bitcode.api.btdRegistrySnapshot.request.v1',
      responseSchemaId: 'bitcode.api.btdRegistrySnapshot.response.v1',
      sourceSafetyClass: 'source-safe-internal',
      compatibilityStatus: 'compatible',
      breakingChangePolicy: 'additive_only',
      examplePosture: 'success',
      exampleId: 'api-btd-registry-success',
      examplePath: 'packages/api/src/routes/__tests__/btd-crypto.test.ts#returns-btd-registry-snapshot',
      fixturePath: 'packages/api/src/routes/__tests__/btd-crypto.test.ts',
      validationCommand:
        'pnpm --filter @bitcode/api exec jest --config jest.config.cjs --runTestsByPath src/routes/__tests__/btd-crypto.test.ts --runInBand',
      example: {
        request: { assetPackId: 'asset-pack-schema-success' },
        response: {
          status: 'success',
          registryRoot: 'registry-root-schema-success',
          entryCount: 1,
          protectedSourceVisible: false,
        },
      },
    },
    {
      rowId: 'public-api-btd-mint-draft-denied',
      consumerSurface: 'public_api',
      routeId: 'api.btd.mintDraft',
      method: 'POST',
      path: '/api/btd/mint-draft',
      schemaId: 'bitcode.api.btdMintDraft.v1',
      requestSchemaId: 'bitcode.api.btdMintDraft.request.v1',
      responseSchemaId: 'bitcode.api.btdMintDraft.response.v1',
      sourceSafetyClass: 'source-safe-internal',
      compatibilityStatus: 'breaking_change_denied',
      breakingChangePolicy: 'gate_review_required',
      examplePosture: 'denied',
      exampleId: 'api-btd-mint-draft-denied',
      examplePath: 'packages/api/src/routes/__tests__/btd-crypto.test.ts#rejects-invalid-mint-draft-schema',
      fixturePath: 'packages/api/src/routes/__tests__/btd-crypto.test.ts',
      validationCommand:
        'pnpm --filter @bitcode/api exec jest --config jest.config.cjs --runTestsByPath src/routes/__tests__/btd-crypto.test.ts --runInBand',
      example: {
        request: { assetPackId: 'asset-pack-schema-denied', exchangeSequence: null },
        response: {
          status: 'denied',
          error: 'Invalid schema-compatible request body',
          repairPosture: 'repair-request-to-package-owned-schema',
          protectedSourceVisible: false,
        },
      },
    },
    {
      rowId: 'public-api-organization-authority-stale',
      consumerSurface: 'public_api',
      routeId: 'api.btd.organizationInterfaceAuthority',
      method: 'POST',
      path: '/api/btd/organization-interface-authority',
      schemaId: 'bitcode.api.organizationInterfaceAuthority.v1',
      requestSchemaId: 'bitcode.api.organizationInterfaceAuthority.request.v1',
      responseSchemaId: 'bitcode.api.organizationInterfaceAuthority.response.v1',
      sourceSafetyClass: 'source-safe-internal',
      compatibilityStatus: 'stale_rejected',
      breakingChangePolicy: 'gate_review_required',
      examplePosture: 'stale',
      exampleId: 'api-organization-authority-stale',
      examplePath: 'packages/api/src/routes/__tests__/btd-crypto.test.ts#renders-stale-authority-denial',
      fixturePath: 'packages/api/src/routes/__tests__/btd-crypto.test.ts',
      validationCommand:
        'pnpm --filter @bitcode/api exec jest --config jest.config.cjs --runTestsByPath src/routes/__tests__/btd-crypto.test.ts --runInBand',
      example: {
        request: {
          interfaceSurface: 'terminal',
          action: 'deliver_asset_pack',
          authorityObservedAt: '2026-05-21T00:00:00.000Z',
        },
        response: {
          status: 'denied',
          code: 'STALE_AUTHORITY',
          repairActions: ['refresh-interface-authentication'],
          protectedSourceVisible: false,
        },
      },
    },
    {
      rowId: 'mcp-api-asset-pack-create-success',
      consumerSurface: 'mcp_api',
      routeId: 'mcp.tool.assetPackCreate',
      method: 'TOOL_CALL',
      path: 'bitcode://pipelines/asset-pack/create',
      schemaId: 'bitcode.mcp.assetPackCreate.v1',
      requestSchemaId: 'bitcode.mcp.assetPackCreate.input.v1',
      responseSchemaId: 'bitcode.mcp.assetPackCreate.output.v1',
      sourceSafetyClass: 'protected-source-locked',
      compatibilityStatus: 'compatible',
      breakingChangePolicy: 'additive_only',
      examplePosture: 'success',
      exampleId: 'mcp-asset-pack-create-success',
      examplePath:
        'packages/generic-mcps/bitcode/src/__tests__/unit/pipeline-ingress-contract.test.ts#queues-asset-pack-create',
      fixturePath: 'packages/generic-mcps/bitcode/src/__tests__/unit/pipeline-ingress-contract.test.ts',
      validationCommand:
        'pnpm --dir packages/generic-mcps/bitcode run test:mcp -- --runTestsByPath src/__tests__/unit/pipeline-ingress-contract.test.ts --runInBand',
      example: {
        request: {
          task: 'Synthesize a source-safe AssetPack preview for a reviewed ReadNeed.',
          repository: { provider: 'github', owner: 'engineeredsoftware', name: 'ENGI' },
        },
        response: {
          status: 'queued',
          runId: 'run-schema-mcp-success',
          writeAdmission: 'source-safe-preview-only',
          protectedSourceVisible: false,
        },
      },
    },
    {
      rowId: 'chatgpt-app-deliver-assetpack-blocked',
      consumerSurface: 'chatgpt_app',
      routeId: 'chatgpt.action.deliverAssetPack',
      method: 'ACTION',
      path: 'chatgpt://actions/bitcode_deliver_asset_pack',
      schemaId: 'bitcode.chatgpt.deliverAssetPack.v1',
      requestSchemaId: 'bitcode.chatgpt.deliverAssetPack.input.v1',
      responseSchemaId: 'bitcode.chatgpt.deliverAssetPack.output.v1',
      sourceSafetyClass: 'protected-source-locked',
      compatibilityStatus: 'blocked_until_rights',
      breakingChangePolicy: 'gate_review_required',
      examplePosture: 'blocked',
      exampleId: 'chatgpt-deliver-assetpack-blocked',
      examplePath: 'packages/external-apps/chatgpt/src/__tests__/tools.test.ts#denies-unpaid-assetpack-delivery',
      fixturePath: 'packages/external-apps/chatgpt/src/__tests__/tools.test.ts',
      validationCommand:
        'pnpm --dir packages/chatgptapp exec jest --runTestsByPath src/__tests__/tools.test.ts --runInBand',
      example: {
        request: { assetPackId: 'asset-pack-schema-blocked', confirmed: true },
        response: {
          status: 'denied',
          code: 'SETTLEMENT_REQUIRED',
          repairActions: ['quote-and-settle-btc-fee'],
          protectedSourceVisible: false,
        },
      },
    },
    {
      rowId: 'terminal-handoff-preview-blocked',
      consumerSurface: 'terminal_handoff',
      routeId: 'terminal.reading.assetPackPreview',
      method: 'HANDOFF',
      path: 'terminal://reading/asset-pack-preview',
      schemaId: 'bitcode.terminal.assetPackPreview.v1',
      requestSchemaId: 'bitcode.terminal.assetPackPreview.request.v1',
      responseSchemaId: 'bitcode.terminal.assetPackPreview.response.v1',
      sourceSafetyClass: 'protected-source-locked',
      compatibilityStatus: 'blocked_until_rights',
      breakingChangePolicy: 'gate_review_required',
      examplePosture: 'blocked',
      exampleId: 'terminal-assetpack-preview-blocked',
      examplePath: 'uapi/tests/terminalOrganizationAuthority.test.ts#terminal-paid-delivery-rights-fixture',
      fixturePath: 'uapi/tests/terminalOrganizationAuthority.test.ts',
      validationCommand:
        'pnpm --dir uapi exec jest --runTestsByPath tests/terminalOrganizationAuthority.test.ts --runInBand',
      example: {
        request: { transactionId: 'terminal-schema-preview', assetPackId: 'asset-pack-schema-preview' },
        response: {
          status: 'blocked',
          previewVisible: true,
          fullAssetPackSourceVisible: false,
          nextAction: 'settle-before-delivery',
        },
      },
    },
    {
      rowId: 'package-consumer-exchange-hook-deferred',
      consumerSurface: 'package_consumer',
      routeId: 'package.exchangeHook.deferred',
      method: 'PACKAGE_EXPORT',
      path: 'package://@bitcode/btd/exchange-hook',
      schemaId: 'bitcode.package.exchangeHook.v1',
      requestSchemaId: 'bitcode.package.exchangeHook.request.v1',
      responseSchemaId: 'bitcode.package.exchangeHook.response.v1',
      sourceSafetyClass: 'deferred-blocker',
      compatibilityStatus: 'deferred_not_admitted',
      breakingChangePolicy: 'deferred_until_gate',
      examplePosture: 'deferred',
      exampleId: 'package-exchange-hook-deferred',
      examplePath: 'packages/btd/__tests__/api-schema-compatibility-matrix.test.ts#deferred-package-hook',
      fixturePath: 'packages/btd/__tests__/api-schema-compatibility-matrix.test.ts',
      validationCommand:
        'pnpm --filter @bitcode/btd test -- --runTestsByPath __tests__/api-schema-compatibility-matrix.test.ts',
      deferredReason:
        'Exchange package hook schema compatibility is recorded as source-safe metadata only until an Exchange product-depth gate admits the surface.',
      example: {
        request: { surface: 'exchange_hook', admission: 'not_requested' },
        response: {
          status: 'deferred',
          reason: 'exchange-product-depth-gate-required',
          protectedSourceVisible: false,
        },
      },
    },
  ];
}

export function buildBtdApiSchemaCompatibilityRow(
  input: BtdApiSchemaCompatibilityRowInput,
): BtdApiSchemaCompatibilityRow {
  const rowId = assertSourceSafeString(input.rowId, 'rowId');
  const consumerSurface = assertConsumerSurface(input.consumerSurface);
  const examplePosture = assertExamplePosture(input.examplePosture);
  const compatibilityStatus = assertCompatibilityStatus(input.compatibilityStatus);
  const breakingChangePolicy = assertBreakingChangePolicy(input.breakingChangePolicy);
  const sourceSafetyClass = assertSourceSafetyClass(input.sourceSafetyClass);
  const protectedSourceVisible = Boolean(input.protectedSourceVisible);
  const path = assertVersionlessPath(input.path);
  const example = assertSourceSafeExample(input.example);

  if (protectedSourceVisible) {
    throw new Error(`${rowId} must not expose protected source in schema compatibility examples.`);
  }
  if (compatibilityStatus === 'deferred_not_admitted' && breakingChangePolicy !== 'deferred_until_gate') {
    throw new Error(`${rowId} deferred rows must use deferred_until_gate breaking-change policy.`);
  }
  if (compatibilityStatus === 'deferred_not_admitted' && !input.deferredReason) {
    throw new Error(`${rowId} deferred rows require a deferred reason.`);
  }
  if (compatibilityStatus !== 'deferred_not_admitted' && breakingChangePolicy === 'deferred_until_gate') {
    throw new Error(`${rowId} non-deferred rows must not use deferred_until_gate policy.`);
  }

  const withoutRoot = {
    kind: 'btd.api_schema_compatibility_matrix.row' as const,
    rowId,
    consumerSurface,
    routeId: assertSourceSafeString(input.routeId, 'routeId'),
    method: assertSourceSafeString(input.method, 'method'),
    path,
    schemaId: assertSourceSafeString(input.schemaId, 'schemaId'),
    requestSchemaId: assertSourceSafeString(input.requestSchemaId, 'requestSchemaId'),
    responseSchemaId: assertSourceSafeString(input.responseSchemaId, 'responseSchemaId'),
    sourceSafetyClass,
    compatibilityStatus,
    breakingChangePolicy,
    examplePosture,
    exampleId: assertSourceSafeString(input.exampleId, 'exampleId'),
    examplePath: assertSourceSafeString(input.examplePath, 'examplePath'),
    fixturePath: assertSourceSafeString(input.fixturePath, 'fixturePath'),
    validationCommand: assertSourceSafeString(input.validationCommand, 'validationCommand'),
    protectedSourceVisible,
    deferredReason: input.deferredReason
      ? assertSourceSafeString(input.deferredReason, 'deferredReason')
      : undefined,
    example,
    requestExampleRoot: stableRoot('api-schema-request-example', example.request),
    responseExampleRoot: stableRoot('api-schema-response-example', example.response),
    sourceSafety: SOURCE_SAFETY,
  };

  return {
    ...withoutRoot,
    rowRoot: stableRoot('api-schema-compatibility-row', withoutRoot),
  };
}

export function buildBtdApiSchemaCompatibilityMatrix(
  input: BtdApiSchemaCompatibilityMatrixInput = {},
): BtdApiSchemaCompatibilityMatrix {
  const rows = (input.rows ?? buildBtdApiSchemaCompatibilityRows()).map(buildBtdApiSchemaCompatibilityRow);
  const requiredConsumerSurfaces = [
    ...(input.requiredConsumerSurfaces ?? BTD_API_SCHEMA_COMPATIBILITY_CONSUMER_SURFACES),
  ];
  const requiredExamplePostures = [
    ...(input.requiredExamplePostures ?? BTD_API_SCHEMA_COMPATIBILITY_EXAMPLE_POSTURES),
  ];
  const observedConsumerSurfaces = Array.from(new Set(rows.map((row) => row.consumerSurface))).sort() as
    BtdApiSchemaCompatibilityConsumerSurface[];
  const observedExamplePostures = Array.from(new Set(rows.map((row) => row.examplePosture))).sort() as
    BtdApiSchemaCompatibilityExamplePosture[];
  const missingConsumerSurfaces = requiredConsumerSurfaces.filter(
    (surface) => !observedConsumerSurfaces.includes(surface),
  );
  const missingExamplePostures = requiredExamplePostures.filter(
    (posture) => !observedExamplePostures.includes(posture),
  );

  if (missingConsumerSurfaces.length) {
    throw new Error(`API schema compatibility matrix missing consumer surfaces: ${missingConsumerSurfaces.join(', ')}.`);
  }
  if (missingExamplePostures.length) {
    throw new Error(`API schema compatibility matrix missing example postures: ${missingExamplePostures.join(', ')}.`);
  }

  const withoutRoot = {
    kind: 'btd.api_schema_compatibility_matrix' as const,
    schemaId: 'bitcode.apiSchemaCompatibilityMatrix.v1' as const,
    rowCount: rows.length,
    requiredConsumerSurfaces,
    observedConsumerSurfaces,
    missingConsumerSurfaces,
    requiredExamplePostures,
    observedExamplePostures,
    missingExamplePostures,
    rows,
    versionlessPathDiscipline: 'enforced' as const,
    protectedSourceSerialized: false as const,
    sourceSafety: SOURCE_SAFETY,
  };

  return {
    ...withoutRoot,
    matrixRoot: stableRoot('api-schema-compatibility-matrix', withoutRoot),
  };
}

export function getBtdApiSchemaCompatibilityRow(rowId: string): BtdApiSchemaCompatibilityRow {
  const row = buildBtdApiSchemaCompatibilityMatrix().rows.find((candidate) => candidate.rowId === rowId);
  if (!row) {
    throw new Error(`Unknown API schema compatibility row: ${rowId}.`);
  }
  return row;
}

function assertSourceSafeExample(
  example: BtdApiSchemaCompatibilityExampleEnvelope,
): BtdApiSchemaCompatibilityExampleEnvelope {
  assertSourceSafeValue(example, 'example');
  return {
    request: assertPlainRecord(example.request, 'example.request'),
    response: assertPlainRecord(example.response, 'example.response'),
  };
}

function assertPlainRecord(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be a source-safe object.`);
  }
  return value as Record<string, unknown>;
}

function assertSourceSafeValue(value: unknown, label: string): void {
  const serialized = JSON.stringify(value);
  if (!serialized) {
    throw new Error(`${label} must be JSON serializable.`);
  }
  if (SECRET_OR_SOURCE_PATTERNS.some((pattern) => pattern.test(serialized))) {
    throw new Error(`${label} must not contain secrets or protected source.`);
  }
}

function assertSourceSafeString(value: string, label: string): string {
  const text = assertNonEmptyString(value, label);
  if (SECRET_OR_SOURCE_PATTERNS.some((pattern) => pattern.test(text))) {
    throw new Error(`${label} must not contain secrets or protected source.`);
  }
  return text;
}

function assertVersionlessPath(value: string): string {
  const path = assertSourceSafeString(value, 'path');
  if (!API_ROUTE_PREFIXES.some((prefix) => path.startsWith(prefix))) {
    throw new Error(`${path} must use a known interface path prefix.`);
  }
  if (/(?:^|\/)v\d+(?:\/|$)/iu.test(path) || /\bgate-\d+\b/iu.test(path) || /\bwip\b/iu.test(path)) {
    throw new Error(`${path} must remain versionless and gate-neutral.`);
  }
  return path;
}

function assertConsumerSurface(
  value: BtdApiSchemaCompatibilityConsumerSurface,
): BtdApiSchemaCompatibilityConsumerSurface {
  if (!BTD_API_SCHEMA_COMPATIBILITY_CONSUMER_SURFACES.includes(value)) {
    throw new Error(`Unsupported API schema compatibility consumer surface: ${value}.`);
  }
  return value;
}

function assertExamplePosture(
  value: BtdApiSchemaCompatibilityExamplePosture,
): BtdApiSchemaCompatibilityExamplePosture {
  if (!BTD_API_SCHEMA_COMPATIBILITY_EXAMPLE_POSTURES.includes(value)) {
    throw new Error(`Unsupported API schema compatibility example posture: ${value}.`);
  }
  return value;
}

function assertCompatibilityStatus(value: BtdApiSchemaCompatibilityStatus): BtdApiSchemaCompatibilityStatus {
  if (
    ![
      'compatible',
      'breaking_change_denied',
      'blocked_until_rights',
      'stale_rejected',
      'deferred_not_admitted',
    ].includes(value)
  ) {
    throw new Error(`Unsupported API schema compatibility status: ${value}.`);
  }
  return value;
}

function assertBreakingChangePolicy(
  value: BtdApiSchemaCompatibilityBreakingChangePolicy,
): BtdApiSchemaCompatibilityBreakingChangePolicy {
  if (!['additive_only', 'gate_review_required', 'deferred_until_gate'].includes(value)) {
    throw new Error(`Unsupported API schema compatibility breaking-change policy: ${value}.`);
  }
  return value;
}

function assertSourceSafetyClass(
  value: BtdApiSchemaCompatibilitySourceSafetyClass,
): BtdApiSchemaCompatibilitySourceSafetyClass {
  if (
    ![
      'source-safe-public',
      'source-safe-internal',
      'protected-source-locked',
      'deferred-blocker',
    ].includes(value)
  ) {
    throw new Error(`Unsupported API schema compatibility source-safety class: ${value}.`);
  }
  return value;
}

function stableRoot(prefix: string, value: unknown): string {
  return `${prefix}:${createHash('sha256').update(stableStringify(value)).digest('hex').slice(0, 32)}`;
}

function stableStringify(value: unknown): string {
  return JSON.stringify(sortJson(value));
}

function sortJson(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortJson);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => [key, sortJson(entry)]),
  );
}

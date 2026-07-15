import { createHash } from 'crypto';
import { assertNonEmptyString } from './constants';
import {
  BTD_INTERFACE_INTEGRATION_REQUIRED_OBJECT_FAMILIES,
  BTD_INTERFACE_INTEGRATION_REQUIRED_SURFACES,
  type BtdInterfaceIntegrationObjectFamily,
  type BtdInterfaceIntegrationSurface,
} from './interface-integration-contract';
import type { BtdProtocolTelemetrySourceSafety } from './telemetry';

export type BtdInterfaceContractRegressionStatus =
  | 'active_contract'
  | 'deferred_blocked';

export type BtdInterfaceContractSourceSafetyClass =
  | 'source-safe-internal'
  | 'protected-source-locked'
  | 'deferred-blocker';

export type BtdInterfaceContractAuthBoundary =
  | 'authenticated_route'
  | 'confirmed_connected_write'
  | 'pipeline_permission'
  | 'support_plane_policy'
  | 'deferred_not_admitted';

export type BtdInterfaceContractBoundaryKind =
  | 'api_route'
  | 'mcp_tool'
  | 'chatgpt_tool'
  | 'terminal_ui'
  | 'auxillaries_ui'
  | 'deferred_interface_hook';

export interface BtdInterfaceContractRegressionFixtureInput {
  surface: BtdInterfaceIntegrationSurface;
  status: BtdInterfaceContractRegressionStatus;
  boundaryKind: BtdInterfaceContractBoundaryKind;
  contractOwner: string;
  fixturePath: string;
  authBoundary: BtdInterfaceContractAuthBoundary;
  policyDenial: string;
  sourceSafetyClass: BtdInterfaceContractSourceSafetyClass;
  objectFamilies: readonly BtdInterfaceIntegrationObjectFamily[];
  sharedPrimitiveIds: readonly string[];
  assertions: readonly string[];
  deferredReason?: string;
}

export interface BtdInterfaceContractRegressionFixture {
  kind: 'btd.interface_contract_regression_fixture';
  surface: BtdInterfaceIntegrationSurface;
  status: BtdInterfaceContractRegressionStatus;
  boundaryKind: BtdInterfaceContractBoundaryKind;
  contractOwner: string;
  fixturePath: string;
  authBoundary: BtdInterfaceContractAuthBoundary;
  policyDenial: string;
  sourceSafetyClass: BtdInterfaceContractSourceSafetyClass;
  objectFamilies: BtdInterfaceIntegrationObjectFamily[];
  sharedPrimitiveIds: string[];
  assertions: string[];
  deferredReason?: string;
  sourceSafety: BtdProtocolTelemetrySourceSafety;
  fixtureRoot: string;
}

export interface BtdInterfaceContractRegressionProofInput {
  fixtures?: readonly BtdInterfaceContractRegressionFixtureInput[];
  requiredSurfaces?: readonly BtdInterfaceIntegrationSurface[];
  requiredObjectFamilies?: readonly BtdInterfaceIntegrationObjectFamily[];
}

export interface BtdInterfaceContractRegressionProof {
  kind: 'btd.interface_contract_regression_proof';
  proofRoot: string;
  fixtureCount: number;
  activeContractCount: number;
  deferredBlockedCount: number;
  requiredSurfaces: BtdInterfaceIntegrationSurface[];
  observedSurfaces: BtdInterfaceIntegrationSurface[];
  missingSurfaces: BtdInterfaceIntegrationSurface[];
  requiredObjectFamilies: BtdInterfaceIntegrationObjectFamily[];
  observedObjectFamilies: BtdInterfaceIntegrationObjectFamily[];
  missingObjectFamilies: BtdInterfaceIntegrationObjectFamily[];
  fixtures: BtdInterfaceContractRegressionFixture[];
  sourceSafety: BtdProtocolTelemetrySourceSafety;
}

const SOURCE_SAFETY: BtdProtocolTelemetrySourceSafety = {
  sourceSafe: true,
  protectedSourceVisible: false,
  containsProtectedSource: false,
  containsSecret: false,
};

const REQUIRED_DEFERRED_SURFACES: readonly BtdInterfaceIntegrationSurface[] = [
  'exchange_hook',
  'conversations_hook',
];

const SECRET_OR_SOURCE_PATTERNS = [
  new RegExp(`sb_${'secret'}__`, 'iu'),
  /\bsk-(?:proj|live|test)?[-_A-Za-z0-9]{16,}\b/u,
  /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/u,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/u,
  /\bprotected\s+source\b/iu,
  /\bprivate\s+source\b/iu,
  /\braw\s+source\b/iu,
];

const DEFAULT_ASSERTIONS = [
  'auth-boundary-asserted',
  'policy-denial-asserted',
  'source-safety-class-asserted',
  'protected-source-nondisclosure-asserted',
] as const;

export const BTD_INTERFACE_CONTRACT_REGRESSION_REQUIRED_ASSERTIONS = [
  ...DEFAULT_ASSERTIONS,
] as const;

export const BTD_INTERFACE_CONTRACT_REGRESSION_DEFERRED_SURFACES = [
  ...REQUIRED_DEFERRED_SURFACES,
] as const;

export function buildBtdInterfaceContractRegressionFixtures(): BtdInterfaceContractRegressionFixtureInput[] {
  return [
    {
      surface: 'terminal',
      status: 'active_contract',
      boundaryKind: 'terminal_ui',
      contractOwner: 'apps/uapi/components/bitcode/pipeline',
      fixturePath: 'apps/uapi/tests/terminalInterfaceIntegrationRegression.test.ts',
      authBoundary: 'authenticated_route',
      policyDenial: 'terminal-detail-denies-protected-source-before-paid-unlock',
      sourceSafetyClass: 'protected-source-locked',
      objectFamilies: ['btd_registry', 'read_access', 'terminal_journal', 'protocol_telemetry'],
      sharedPrimitiveIds: ['TerminalTransactionReadModel', 'BtdReadAccessDecision'],
      assertions: DEFAULT_ASSERTIONS,
    },
    {
      surface: 'api',
      status: 'active_contract',
      boundaryKind: 'api_route',
      contractOwner: 'packages/api/src/routes',
      fixturePath: 'packages/api/src/routes/__tests__/btd-crypto.test.ts',
      authBoundary: 'authenticated_route',
      policyDenial: 'btd-routes-return-401-or-400-before-settlement-admission',
      sourceSafetyClass: 'source-safe-internal',
      objectFamilies: ['btd_receipts', 'btc_fee_operation', 'ledger_projection', 'protocol_telemetry'],
      sharedPrimitiveIds: ['BtdInterfaceIntegrationRegressionSettlement', 'BtdReadAccessDecision'],
      assertions: DEFAULT_ASSERTIONS,
    },
    {
      surface: 'mcp',
      status: 'active_contract',
      boundaryKind: 'mcp_tool',
      contractOwner: 'apps/mcp',
      fixturePath: 'apps/mcp/src/__tests__/unit/pipeline-ingress-contract.test.ts',
      authBoundary: 'pipeline_permission',
      policyDenial: 'mcp-pipeline-write-denies-missing-pipelines-create',
      sourceSafetyClass: 'source-safe-internal',
      objectFamilies: ['source_to_shares_proof', 'organization_authority', 'protocol_telemetry'],
      sharedPrimitiveIds: ['MCPAuthContext', 'pipeline write admission receipt'],
      assertions: DEFAULT_ASSERTIONS,
    },
    {
      surface: 'chatgpt_app',
      status: 'active_contract',
      boundaryKind: 'chatgpt_tool',
      contractOwner: 'packages/chatgptapp',
      fixturePath: 'apps/chatgpt/src/__tests__/tools.test.ts',
      authBoundary: 'confirmed_connected_write',
      policyDenial: 'chatgpt-app-write-denies-missing-confirmation-read-access-or-authority',
      sourceSafetyClass: 'source-safe-internal',
      objectFamilies: ['read_access', 'organization_authority', 'protocol_telemetry'],
      sharedPrimitiveIds: ['ChatGPT App write admission receipt', 'BtdReadAccessDecision'],
      assertions: DEFAULT_ASSERTIONS,
    },
    {
      surface: 'auxillaries_hook',
      status: 'active_contract',
      boundaryKind: 'auxillaries_ui',
      contractOwner: 'apps/uapi/app/auxillaries',
      fixturePath: 'apps/uapi/tests/auxillariesContent.access.test.tsx',
      authBoundary: 'support_plane_policy',
      policyDenial: 'auxillaries-support-plane-denies-protected-actions-without-interface-admission',
      sourceSafetyClass: 'source-safe-internal',
      objectFamilies: ['btd_registry', 'organization_authority', 'read_access'],
      sharedPrimitiveIds: ['AuxillariesInterfaceAdmission', 'BtdOrganizationPolicyAuthority'],
      assertions: DEFAULT_ASSERTIONS,
    },
    {
      surface: 'exchange_hook',
      status: 'deferred_blocked',
      boundaryKind: 'deferred_interface_hook',
      contractOwner: 'apps/uapi/app/exchange',
      fixturePath: 'apps/uapi/tests/terminalInterfaceIntegrationRegression.test.ts',
      authBoundary: 'deferred_not_admitted',
      policyDenial: 'exchange-hook-remains-blocked-until-exchange-product-depth-gate',
      sourceSafetyClass: 'deferred-blocker',
      objectFamilies: ['btd_receipts', 'btc_fee_operation', 'ledger_projection'],
      sharedPrimitiveIds: ['deferred Exchange interface admission blocker'],
      assertions: DEFAULT_ASSERTIONS,
      deferredReason: 'Exchange product depth is outside V32 Gate 6; only source-safe blocked contract posture is admitted.',
    },
    {
      surface: 'conversations_hook',
      status: 'deferred_blocked',
      boundaryKind: 'deferred_interface_hook',
      contractOwner: 'apps/uapi/app/conversations',
      fixturePath: 'apps/uapi/tests/api/conversationsRouteRead.test.ts',
      authBoundary: 'deferred_not_admitted',
      policyDenial: 'conversations-hook-remains-blocked-until-conversations-product-depth-gate',
      sourceSafetyClass: 'deferred-blocker',
      objectFamilies: ['read_access', 'organization_authority', 'protocol_telemetry'],
      sharedPrimitiveIds: ['deferred Conversations interface admission blocker'],
      assertions: DEFAULT_ASSERTIONS,
      deferredReason: 'Conversations product depth is outside V32 Gate 6; only source-safe blocked contract posture is admitted.',
    },
  ];
}

export function buildBtdInterfaceContractRegressionFixture(
  input: BtdInterfaceContractRegressionFixtureInput,
): BtdInterfaceContractRegressionFixture {
  const surface = assertSurface(input.surface);
  const objectFamilies = assertObjectFamilies(input.objectFamilies);
  const assertions = assertRequiredAssertions(input.assertions);
  const status = assertStatus(input.status);
  const authBoundary = assertAuthBoundary(input.authBoundary);
  const sourceSafetyClass = assertSourceSafetyClass(input.sourceSafetyClass);
  const boundaryKind = assertBoundaryKind(input.boundaryKind);
  const isDeferredSurface = REQUIRED_DEFERRED_SURFACES.includes(surface);

  if (isDeferredSurface !== (status === 'deferred_blocked')) {
    throw new Error(`${surface} must remain a deferred blocked interface contract row in V32 Gate 6.`);
  }
  if ((status === 'deferred_blocked') !== (authBoundary === 'deferred_not_admitted')) {
    throw new Error(`${surface} deferred status and auth boundary must agree.`);
  }
  if ((status === 'deferred_blocked') !== (sourceSafetyClass === 'deferred-blocker')) {
    throw new Error(`${surface} deferred status and source-safety class must agree.`);
  }
  if (status === 'deferred_blocked' && !input.deferredReason) {
    throw new Error(`${surface} deferred contract rows require a deferred reason.`);
  }

  const fixture = {
    kind: 'btd.interface_contract_regression_fixture' as const,
    surface,
    status,
    boundaryKind,
    contractOwner: assertSourceSafeString(input.contractOwner, 'contractOwner'),
    fixturePath: assertSourceSafeString(input.fixturePath, 'fixturePath'),
    authBoundary,
    policyDenial: assertSourceSafeString(input.policyDenial, 'policyDenial'),
    sourceSafetyClass,
    objectFamilies,
    sharedPrimitiveIds: input.sharedPrimitiveIds.map((entry) =>
      assertSourceSafeString(entry, 'sharedPrimitiveId'),
    ),
    assertions,
    deferredReason: input.deferredReason
      ? assertSourceSafeString(input.deferredReason, 'deferredReason')
      : undefined,
    sourceSafety: { ...SOURCE_SAFETY },
  };

  return {
    ...fixture,
    fixtureRoot: stableRoot('btd-interface-contract-fixture', [
      fixture.surface,
      fixture.status,
      fixture.boundaryKind,
      fixture.contractOwner,
      fixture.fixturePath,
      fixture.authBoundary,
      fixture.policyDenial,
      fixture.sourceSafetyClass,
      fixture.objectFamilies.join(','),
      fixture.sharedPrimitiveIds.join(','),
      fixture.assertions.join(','),
      fixture.deferredReason ?? 'active',
    ]),
  };
}

export function buildBtdInterfaceContractRegressionProof(
  input: BtdInterfaceContractRegressionProofInput = {},
): BtdInterfaceContractRegressionProof {
  const fixtures = (input.fixtures ?? buildBtdInterfaceContractRegressionFixtures()).map(
    buildBtdInterfaceContractRegressionFixture,
  );
  const requiredSurfaces = [
    ...(input.requiredSurfaces ?? BTD_INTERFACE_INTEGRATION_REQUIRED_SURFACES),
  ];
  const requiredObjectFamilies = [
    ...(input.requiredObjectFamilies ?? BTD_INTERFACE_INTEGRATION_REQUIRED_OBJECT_FAMILIES),
  ];
  const observedSurfaces = Array.from(new Set(fixtures.map((fixture) => fixture.surface))).sort();
  const observedObjectFamilies = Array.from(
    new Set(fixtures.flatMap((fixture) => fixture.objectFamilies)),
  ).sort();
  const missingSurfaces = requiredSurfaces.filter((surface) => !observedSurfaces.includes(surface));
  const missingObjectFamilies = requiredObjectFamilies.filter(
    (family) => !observedObjectFamilies.includes(family),
  );

  if (missingSurfaces.length) {
    throw new Error(`Interface contract regression proof missing surfaces: ${missingSurfaces.join(', ')}.`);
  }
  if (missingObjectFamilies.length) {
    throw new Error(
      `Interface contract regression proof missing object families: ${missingObjectFamilies.join(', ')}.`,
    );
  }

  const deferredBlockedCount = fixtures.filter(
    (fixture) => fixture.status === 'deferred_blocked',
  ).length;
  if (deferredBlockedCount !== REQUIRED_DEFERRED_SURFACES.length) {
    throw new Error('Interface contract regression proof must keep only Exchange and Conversations deferred.');
  }

  const proofRoot = stableRoot('btd-interface-contract-regression-proof', [
    ...fixtures.map((fixture) => fixture.fixtureRoot),
    requiredSurfaces.join(','),
    requiredObjectFamilies.join(','),
  ]);

  return {
    kind: 'btd.interface_contract_regression_proof',
    proofRoot,
    fixtureCount: fixtures.length,
    activeContractCount: fixtures.length - deferredBlockedCount,
    deferredBlockedCount,
    requiredSurfaces,
    observedSurfaces,
    missingSurfaces,
    requiredObjectFamilies,
    observedObjectFamilies,
    missingObjectFamilies,
    fixtures,
    sourceSafety: { ...SOURCE_SAFETY },
  };
}

function assertSurface(surface: string): BtdInterfaceIntegrationSurface {
  if (!BTD_INTERFACE_INTEGRATION_REQUIRED_SURFACES.includes(surface as BtdInterfaceIntegrationSurface)) {
    throw new Error(`Unsupported interface contract surface: ${surface}.`);
  }

  return surface as BtdInterfaceIntegrationSurface;
}

function assertObjectFamilies(
  objectFamilies: readonly BtdInterfaceIntegrationObjectFamily[],
): BtdInterfaceIntegrationObjectFamily[] {
  if (!Array.isArray(objectFamilies) || objectFamilies.length === 0) {
    throw new Error('Interface contract fixture requires at least one object family.');
  }

  const deduped = Array.from(new Set(objectFamilies));
  for (const family of deduped) {
    if (!BTD_INTERFACE_INTEGRATION_REQUIRED_OBJECT_FAMILIES.includes(family)) {
      throw new Error(`Unsupported interface contract object family: ${family}.`);
    }
  }

  return deduped.sort();
}

function assertRequiredAssertions(assertions: readonly string[]): string[] {
  const deduped = Array.from(new Set(assertions.map((entry) => assertSourceSafeString(entry, 'assertion')))).sort();
  const missing = BTD_INTERFACE_CONTRACT_REGRESSION_REQUIRED_ASSERTIONS.filter(
    (assertion) => !deduped.includes(assertion),
  );
  if (missing.length) {
    throw new Error(`Interface contract fixture missing assertions: ${missing.join(', ')}.`);
  }

  return deduped;
}

function assertStatus(status: string): BtdInterfaceContractRegressionStatus {
  if (status !== 'active_contract' && status !== 'deferred_blocked') {
    throw new Error(`Unsupported interface contract status: ${status}.`);
  }

  return status;
}

function assertAuthBoundary(authBoundary: string): BtdInterfaceContractAuthBoundary {
  const allowed: readonly BtdInterfaceContractAuthBoundary[] = [
    'authenticated_route',
    'confirmed_connected_write',
    'pipeline_permission',
    'support_plane_policy',
    'deferred_not_admitted',
  ];
  if (!allowed.includes(authBoundary as BtdInterfaceContractAuthBoundary)) {
    throw new Error(`Unsupported interface contract auth boundary: ${authBoundary}.`);
  }

  return authBoundary as BtdInterfaceContractAuthBoundary;
}

function assertSourceSafetyClass(
  sourceSafetyClass: string,
): BtdInterfaceContractSourceSafetyClass {
  const allowed: readonly BtdInterfaceContractSourceSafetyClass[] = [
    'source-safe-internal',
    'protected-source-locked',
    'deferred-blocker',
  ];
  if (!allowed.includes(sourceSafetyClass as BtdInterfaceContractSourceSafetyClass)) {
    throw new Error(`Unsupported interface contract source-safety class: ${sourceSafetyClass}.`);
  }

  return sourceSafetyClass as BtdInterfaceContractSourceSafetyClass;
}

function assertBoundaryKind(boundaryKind: string): BtdInterfaceContractBoundaryKind {
  const allowed: readonly BtdInterfaceContractBoundaryKind[] = [
    'api_route',
    'mcp_tool',
    'chatgpt_tool',
    'terminal_ui',
    'auxillaries_ui',
    'deferred_interface_hook',
  ];
  if (!allowed.includes(boundaryKind as BtdInterfaceContractBoundaryKind)) {
    throw new Error(`Unsupported interface contract boundary kind: ${boundaryKind}.`);
  }

  return boundaryKind as BtdInterfaceContractBoundaryKind;
}

function assertSourceSafeString(value: unknown, label: string): string {
  const text = assertNonEmptyString(value, label);
  if (SECRET_OR_SOURCE_PATTERNS.some((pattern) => pattern.test(text))) {
    throw new Error(`${label} must not contain secrets or protected source.`);
  }

  return text;
}

function stableRoot(prefix: string, parts: string[]): string {
  const hash = createHash('sha256').update(parts.join('\u001f')).digest('hex').slice(0, 24);
  return `${prefix}:${hash}`;
}

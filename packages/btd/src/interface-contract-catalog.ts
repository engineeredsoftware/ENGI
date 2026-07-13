import { createHash } from 'crypto';
import { assertNonEmptyString } from './constants';
import type { BtdProtocolTelemetrySourceSafety } from './telemetry';

export const BTD_INTERFACE_CONTRACT_CATALOG_INTERFACE_IDS = [
  'terminal_handoff',
  'public_api',
  'mcp_api',
  'chatgpt_app',
  'package_consumer',
  'exchange_hook',
  'conversations_hook',
] as const;

export type BtdInterfaceContractCatalogInterfaceId =
  (typeof BTD_INTERFACE_CONTRACT_CATALOG_INTERFACE_IDS)[number];

export type BtdInterfaceContractCatalogStatus =
  | 'active_contract'
  | 'deferred_blocked';

export type BtdInterfaceContractCatalogBindingKind =
  | 'terminal_handoff'
  | 'api_route'
  | 'mcp_tool'
  | 'chatgpt_action'
  | 'package_export'
  | 'deferred_hook';

export type BtdInterfaceContractCatalogSourceSafetyClass =
  | 'source-safe-public'
  | 'source-safe-internal'
  | 'protected-source-locked'
  | 'deferred-blocker';

export type BtdInterfaceContractCatalogCompatibilityStatus =
  | 'compatible'
  | 'deferred_not_admitted';

export interface BtdInterfaceContractCatalogRowInput {
  interfaceId: BtdInterfaceContractCatalogInterfaceId;
  status: BtdInterfaceContractCatalogStatus;
  bindingKind: BtdInterfaceContractCatalogBindingKind;
  ownerPackage: string;
  actionId: string;
  schemaId: string;
  authPolicyId: string;
  sourceSafetyClass: BtdInterfaceContractCatalogSourceSafetyClass;
  exampleFixturePath: string;
  validationCommand: string;
  compatibilityStatus: BtdInterfaceContractCatalogCompatibilityStatus;
  failureMode: string;
  repairPosture: string;
  telemetryProofHookId: string;
  proofRootBasis: readonly string[];
  deferredReason?: string;
}

export interface BtdInterfaceContractCatalogRow {
  kind: 'btd.interface_contract_catalog.row';
  interfaceId: BtdInterfaceContractCatalogInterfaceId;
  status: BtdInterfaceContractCatalogStatus;
  bindingKind: BtdInterfaceContractCatalogBindingKind;
  ownerPackage: string;
  actionId: string;
  schemaId: string;
  authPolicyId: string;
  sourceSafetyClass: BtdInterfaceContractCatalogSourceSafetyClass;
  exampleFixturePath: string;
  validationCommand: string;
  compatibilityStatus: BtdInterfaceContractCatalogCompatibilityStatus;
  failureMode: string;
  repairPosture: string;
  telemetryProofHookId: string;
  proofRootBasis: string[];
  deferredReason?: string;
  rowRoot: string;
  sourceSafety: BtdProtocolTelemetrySourceSafety;
}

export interface BtdInterfaceContractCatalogInput {
  rows?: readonly BtdInterfaceContractCatalogRowInput[];
  requiredInterfaceIds?: readonly BtdInterfaceContractCatalogInterfaceId[];
}

export interface BtdInterfaceContractCatalog {
  kind: 'btd.interface_contract_catalog';
  schemaId: 'bitcode.interfaceContractCatalog.v1';
  catalogRoot: string;
  rowCount: number;
  activeContractCount: number;
  deferredBlockedCount: number;
  requiredInterfaceIds: BtdInterfaceContractCatalogInterfaceId[];
  observedInterfaceIds: BtdInterfaceContractCatalogInterfaceId[];
  missingInterfaceIds: BtdInterfaceContractCatalogInterfaceId[];
  rows: BtdInterfaceContractCatalogRow[];
  sourceSafety: BtdProtocolTelemetrySourceSafety;
}

const SOURCE_SAFETY: BtdProtocolTelemetrySourceSafety = {
  sourceSafe: true,
  protectedSourceVisible: false,
  containsProtectedSource: false,
  containsSecret: false,
};

const DEFERRED_INTERFACE_IDS: readonly BtdInterfaceContractCatalogInterfaceId[] = [
  'exchange_hook',
  'conversations_hook',
];

const REQUIRED_ROW_FIELDS = [
  'ownerPackage',
  'actionId',
  'schemaId',
  'authPolicyId',
  'exampleFixturePath',
  'validationCommand',
  'failureMode',
  'repairPosture',
  'telemetryProofHookId',
] as const;

const SECRET_OR_SOURCE_PATTERNS = [
  new RegExp(`${['sb', 'secret'].join('_')}__`, 'iu'),
  /\bsk-(?:proj|live|test)?[-_A-Za-z0-9]{16,}\b/u,
  /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/u,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/u,
  /\bprotected\s+source\b/iu,
  /\bprivate\s+source\b/iu,
  /\braw\s+source\b/iu,
];

export const BTD_INTERFACE_CONTRACT_CATALOG_DEFERRED_INTERFACE_IDS = [
  ...DEFERRED_INTERFACE_IDS,
] as const;

export const BTD_INTERFACE_CONTRACT_CATALOG_REQUIRED_ROW_FIELDS = [
  ...REQUIRED_ROW_FIELDS,
] as const;

export function buildBtdInterfaceContractCatalogRows(): BtdInterfaceContractCatalogRowInput[] {
  return [
    {
      interfaceId: 'terminal_handoff',
      status: 'active_contract',
      bindingKind: 'terminal_handoff',
      ownerPackage: 'uapi/components/bitcode/pipeline',
      actionId: 'terminal.reading.handoff',
      schemaId: 'bitcode.interface.terminalReadingHandoff.v1',
      authPolicyId: 'interface.authorization.reader-session',
      sourceSafetyClass: 'protected-source-locked',
      exampleFixturePath: 'uapi/tests/terminalInterfaceIntegrationRegression.test.ts',
      validationCommand:
        'pnpm --dir uapi exec jest --runTestsByPath tests/terminalInterfaceIntegrationRegression.test.ts --runInBand',
      compatibilityStatus: 'compatible',
      failureMode: 'terminal-handoff-denies-protected-assetpack-source-before-settlement',
      repairPosture: 'review-source-safe-preview-and-settle-before-full-delivery',
      telemetryProofHookId: 'interface.telemetry.terminal-reading-handoff',
      proofRootBasis: ['TerminalTransactionReadModel', 'BtdReadAccessDecision'],
    },
    {
      interfaceId: 'public_api',
      status: 'active_contract',
      bindingKind: 'api_route',
      ownerPackage: 'packages/api/src/routes',
      actionId: 'api.reading.interface',
      schemaId: 'bitcode.interface.publicApiReading.v1',
      authPolicyId: 'interface.authorization.authenticated-route',
      sourceSafetyClass: 'source-safe-internal',
      exampleFixturePath: 'packages/api/src/routes/__tests__/btd-crypto.test.ts',
      validationCommand:
        'pnpm --filter @bitcode/api exec jest --config jest.config.cjs --runTestsByPath src/routes/__tests__/btd-crypto.test.ts --runInBand',
      compatibilityStatus: 'compatible',
      failureMode: 'public-api-denies-missing-auth-or-stale-read-license',
      repairPosture: 'authenticate-refresh-license-or-request-source-safe-preview',
      telemetryProofHookId: 'interface.telemetry.public-api-reading',
      proofRootBasis: ['BtdInterfaceIntegrationRegressionSettlement', 'BtdReadAccessDecision'],
    },
    {
      interfaceId: 'mcp_api',
      status: 'active_contract',
      bindingKind: 'mcp_tool',
      ownerPackage: 'packages/generic-mcps/bitcode',
      actionId: 'mcp.reading.pipeline',
      schemaId: 'bitcode.interface.mcpReadingTool.v1',
      authPolicyId: 'interface.authorization.pipeline-permission',
      sourceSafetyClass: 'source-safe-internal',
      exampleFixturePath:
        'packages/generic-mcps/bitcode/src/__tests__/unit/pipeline-ingress-contract.test.ts',
      validationCommand:
        'pnpm --dir packages/generic-mcps/bitcode run test:mcp -- --runTestsByPath src/__tests__/unit/pipeline-ingress-contract.test.ts --runInBand',
      compatibilityStatus: 'compatible',
      failureMode: 'mcp-tool-denies-missing-pipelines-create-permission',
      repairPosture: 'grant-pipeline-permission-or-use-source-safe-readonly-tool',
      telemetryProofHookId: 'interface.telemetry.mcp-reading-tool',
      proofRootBasis: ['MCPAuthContext', 'pipeline write admission receipt'],
    },
    {
      interfaceId: 'chatgpt_app',
      status: 'active_contract',
      bindingKind: 'chatgpt_action',
      ownerPackage: 'packages/chatgptapp',
      actionId: 'chatgpt.reading.action',
      schemaId: 'bitcode.interface.chatGptReadingAction.v1',
      authPolicyId: 'interface.authorization.confirmed-connected-write',
      sourceSafetyClass: 'source-safe-internal',
      exampleFixturePath: 'packages/chatgptapp/src/__tests__/tools.test.ts',
      validationCommand:
        'pnpm --dir packages/chatgptapp exec jest --runTestsByPath src/__tests__/tools.test.ts --runInBand',
      compatibilityStatus: 'compatible',
      failureMode: 'chatgpt-action-denies-missing-confirmation-read-access-or-authority',
      repairPosture: 'confirm-action-refresh-read-access-or-repair-organization-authority',
      telemetryProofHookId: 'interface.telemetry.chatgpt-reading-action',
      proofRootBasis: ['ChatGPT App write admission receipt', 'BtdReadAccessDecision'],
    },
    {
      interfaceId: 'package_consumer',
      status: 'active_contract',
      bindingKind: 'package_export',
      ownerPackage: 'packages/btd',
      actionId: 'package.interface.contract-catalog',
      schemaId: 'bitcode.interface.packageConsumerCatalog.v1',
      authPolicyId: 'interface.authorization.package-consumer-source-safe',
      sourceSafetyClass: 'source-safe-public',
      exampleFixturePath: 'packages/btd/__tests__/interface-contract-catalog.test.ts',
      validationCommand:
        'pnpm --filter @bitcode/btd test -- --runTestsByPath __tests__/interface-contract-catalog.test.ts',
      compatibilityStatus: 'compatible',
      failureMode: 'package-consumer-denies-route-local-contract-reimplementation',
      repairPosture: 'consume-package-export-and-regenerate-contract-artifact',
      telemetryProofHookId: 'interface.telemetry.package-contract-catalog',
      proofRootBasis: ['InterfaceContractCatalog', 'package-owned schema export'],
    },
    {
      interfaceId: 'exchange_hook',
      status: 'deferred_blocked',
      bindingKind: 'deferred_hook',
      ownerPackage: 'uapi/app/exchange',
      actionId: 'exchange.reading.hook',
      schemaId: 'bitcode.interface.exchangeHook.v1',
      authPolicyId: 'interface.authorization.deferred-not-admitted',
      sourceSafetyClass: 'deferred-blocker',
      exampleFixturePath: 'uapi/tests/terminalInterfaceIntegrationRegression.test.ts',
      validationCommand:
        'pnpm --dir uapi exec jest --runTestsByPath tests/terminalInterfaceIntegrationRegression.test.ts --runInBand',
      compatibilityStatus: 'deferred_not_admitted',
      failureMode: 'exchange-hook-remains-blocked-until-exchange-product-depth-gate',
      repairPosture: 'wait-for-exchange-depth-gate-before-interface-admission',
      telemetryProofHookId: 'interface.telemetry.exchange-hook-blocker',
      proofRootBasis: ['deferred Exchange interface admission blocker'],
      deferredReason: 'Exchange product depth is deferred beyond V33 interface cataloging.',
    },
    {
      interfaceId: 'conversations_hook',
      status: 'deferred_blocked',
      bindingKind: 'deferred_hook',
      ownerPackage: 'uapi/app/conversations',
      actionId: 'conversations.reading.hook',
      schemaId: 'bitcode.interface.conversationsHook.v1',
      authPolicyId: 'interface.authorization.deferred-not-admitted',
      sourceSafetyClass: 'deferred-blocker',
      exampleFixturePath: 'uapi/tests/api/conversationsRouteRead.test.ts',
      validationCommand:
        'pnpm --dir uapi exec jest --runTestsByPath tests/api/conversationsRouteRead.test.ts --runInBand',
      compatibilityStatus: 'deferred_not_admitted',
      failureMode: 'conversations-hook-remains-blocked-until-conversations-product-depth-gate',
      repairPosture: 'wait-for-conversations-depth-gate-before-interface-admission',
      telemetryProofHookId: 'interface.telemetry.conversations-hook-blocker',
      proofRootBasis: ['deferred Conversations interface admission blocker'],
      deferredReason: 'Website Conversations product depth is deferred beyond V33 interface cataloging.',
    },
  ];
}

export function buildBtdInterfaceContractCatalogRow(
  input: BtdInterfaceContractCatalogRowInput,
): BtdInterfaceContractCatalogRow {
  const interfaceId = assertInterfaceId(input.interfaceId);
  const status = assertStatus(input.status);
  const bindingKind = assertBindingKind(input.bindingKind);
  const sourceSafetyClass = assertSourceSafetyClass(input.sourceSafetyClass);
  const compatibilityStatus = assertCompatibilityStatus(input.compatibilityStatus);
  const isDeferred = DEFERRED_INTERFACE_IDS.includes(interfaceId);

  if (isDeferred !== (status === 'deferred_blocked')) {
    throw new Error(`${interfaceId} deferred posture must match its contract status.`);
  }
  if ((status === 'deferred_blocked') !== (bindingKind === 'deferred_hook')) {
    throw new Error(`${interfaceId} deferred status and binding kind must agree.`);
  }
  if ((status === 'deferred_blocked') !== (sourceSafetyClass === 'deferred-blocker')) {
    throw new Error(`${interfaceId} deferred status and source-safety class must agree.`);
  }
  if ((status === 'deferred_blocked') !== (compatibilityStatus === 'deferred_not_admitted')) {
    throw new Error(`${interfaceId} deferred status and compatibility status must agree.`);
  }
  if (status === 'deferred_blocked' && !input.deferredReason) {
    throw new Error(`${interfaceId} deferred contract rows require a deferred reason.`);
  }

  const row = {
    kind: 'btd.interface_contract_catalog.row' as const,
    interfaceId,
    status,
    bindingKind,
    ownerPackage: assertSourceSafeString(input.ownerPackage, 'ownerPackage'),
    actionId: assertSourceSafeString(input.actionId, 'actionId'),
    schemaId: assertSourceSafeString(input.schemaId, 'schemaId'),
    authPolicyId: assertSourceSafeString(input.authPolicyId, 'authPolicyId'),
    sourceSafetyClass,
    exampleFixturePath: assertSourceSafeString(input.exampleFixturePath, 'exampleFixturePath'),
    validationCommand: assertSourceSafeString(input.validationCommand, 'validationCommand'),
    compatibilityStatus,
    failureMode: assertSourceSafeString(input.failureMode, 'failureMode'),
    repairPosture: assertSourceSafeString(input.repairPosture, 'repairPosture'),
    telemetryProofHookId: assertSourceSafeString(input.telemetryProofHookId, 'telemetryProofHookId'),
    proofRootBasis: assertProofRootBasis(input.proofRootBasis),
    deferredReason: input.deferredReason
      ? assertSourceSafeString(input.deferredReason, 'deferredReason')
      : undefined,
    sourceSafety: { ...SOURCE_SAFETY },
  };

  return {
    ...row,
    rowRoot: stableRoot('btd-interface-contract-catalog-row', [
      row.interfaceId,
      row.status,
      row.bindingKind,
      row.ownerPackage,
      row.actionId,
      row.schemaId,
      row.authPolicyId,
      row.sourceSafetyClass,
      row.exampleFixturePath,
      row.validationCommand,
      row.compatibilityStatus,
      row.failureMode,
      row.repairPosture,
      row.telemetryProofHookId,
      row.proofRootBasis.join(','),
      row.deferredReason ?? 'active',
    ]),
  };
}

export function buildBtdInterfaceContractCatalog(
  input: BtdInterfaceContractCatalogInput = {},
): BtdInterfaceContractCatalog {
  const rows = (input.rows ?? buildBtdInterfaceContractCatalogRows()).map(
    buildBtdInterfaceContractCatalogRow,
  );
  const requiredInterfaceIds = [
    ...(input.requiredInterfaceIds ?? BTD_INTERFACE_CONTRACT_CATALOG_INTERFACE_IDS),
  ];
  const observedInterfaceIds = Array.from(new Set(rows.map((row) => row.interfaceId))).sort();
  const missingInterfaceIds = requiredInterfaceIds.filter(
    (interfaceId) => !observedInterfaceIds.includes(interfaceId),
  );
  const duplicateInterfaceIds = findDuplicates(rows.map((row) => row.interfaceId));

  if (missingInterfaceIds.length) {
    throw new Error(`Interface contract catalog missing interface ids: ${missingInterfaceIds.join(', ')}.`);
  }
  if (duplicateInterfaceIds.length) {
    throw new Error(`Interface contract catalog contains duplicate interface ids: ${duplicateInterfaceIds.join(', ')}.`);
  }

  const deferredBlockedCount = rows.filter((row) => row.status === 'deferred_blocked').length;
  if (deferredBlockedCount !== DEFERRED_INTERFACE_IDS.length) {
    throw new Error('Interface contract catalog must keep only Exchange and Conversations deferred.');
  }

  const catalogRoot = stableRoot('btd-interface-contract-catalog', [
    ...rows.map((row) => row.rowRoot),
    requiredInterfaceIds.join(','),
  ]);

  return {
    kind: 'btd.interface_contract_catalog',
    schemaId: 'bitcode.interfaceContractCatalog.v1',
    catalogRoot,
    rowCount: rows.length,
    activeContractCount: rows.length - deferredBlockedCount,
    deferredBlockedCount,
    requiredInterfaceIds,
    observedInterfaceIds,
    missingInterfaceIds,
    rows,
    sourceSafety: { ...SOURCE_SAFETY },
  };
}

function assertInterfaceId(interfaceId: string): BtdInterfaceContractCatalogInterfaceId {
  if (!BTD_INTERFACE_CONTRACT_CATALOG_INTERFACE_IDS.includes(interfaceId as BtdInterfaceContractCatalogInterfaceId)) {
    throw new Error(`Unsupported interface contract catalog id: ${interfaceId}.`);
  }

  return interfaceId as BtdInterfaceContractCatalogInterfaceId;
}

function assertStatus(status: string): BtdInterfaceContractCatalogStatus {
  if (status !== 'active_contract' && status !== 'deferred_blocked') {
    throw new Error(`Unsupported interface contract catalog status: ${status}.`);
  }

  return status;
}

function assertBindingKind(bindingKind: string): BtdInterfaceContractCatalogBindingKind {
  const allowed: readonly BtdInterfaceContractCatalogBindingKind[] = [
    'terminal_handoff',
    'api_route',
    'mcp_tool',
    'chatgpt_action',
    'package_export',
    'deferred_hook',
  ];
  if (!allowed.includes(bindingKind as BtdInterfaceContractCatalogBindingKind)) {
    throw new Error(`Unsupported interface contract catalog binding kind: ${bindingKind}.`);
  }

  return bindingKind as BtdInterfaceContractCatalogBindingKind;
}

function assertSourceSafetyClass(
  sourceSafetyClass: string,
): BtdInterfaceContractCatalogSourceSafetyClass {
  const allowed: readonly BtdInterfaceContractCatalogSourceSafetyClass[] = [
    'source-safe-public',
    'source-safe-internal',
    'protected-source-locked',
    'deferred-blocker',
  ];
  if (!allowed.includes(sourceSafetyClass as BtdInterfaceContractCatalogSourceSafetyClass)) {
    throw new Error(`Unsupported interface contract catalog source-safety class: ${sourceSafetyClass}.`);
  }

  return sourceSafetyClass as BtdInterfaceContractCatalogSourceSafetyClass;
}

function assertCompatibilityStatus(
  compatibilityStatus: string,
): BtdInterfaceContractCatalogCompatibilityStatus {
  if (compatibilityStatus !== 'compatible' && compatibilityStatus !== 'deferred_not_admitted') {
    throw new Error(`Unsupported interface contract catalog compatibility status: ${compatibilityStatus}.`);
  }

  return compatibilityStatus as BtdInterfaceContractCatalogCompatibilityStatus;
}

function assertProofRootBasis(proofRootBasis: readonly string[]): string[] {
  if (!Array.isArray(proofRootBasis) || proofRootBasis.length === 0) {
    throw new Error('Interface contract catalog rows require proof-root basis.');
  }

  return Array.from(
    new Set(proofRootBasis.map((entry) => assertSourceSafeString(entry, 'proofRootBasis'))),
  ).sort();
}

function assertSourceSafeString(value: unknown, label: string): string {
  const text = assertNonEmptyString(value, label);
  if (SECRET_OR_SOURCE_PATTERNS.some((pattern) => pattern.test(text))) {
    throw new Error(`${label} must not contain secrets or protected source.`);
  }

  return text;
}

function findDuplicates(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const duplicate = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicate.add(value);
    seen.add(value);
  }

  return [...duplicate].sort();
}

function stableRoot(prefix: string, parts: string[]): string {
  const hash = createHash('sha256').update(parts.join('\u001f')).digest('hex').slice(0, 24);
  return `${prefix}:${hash}`;
}

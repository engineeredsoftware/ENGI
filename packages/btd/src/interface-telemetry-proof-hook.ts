import { createHash } from 'crypto';
import { assertNonEmptyString } from './constants';
import type { BtdProtocolTelemetrySourceSafety } from './telemetry';

export const BTD_INTERFACE_TELEMETRY_PROOF_HOOK_INTERFACE_IDS = [
  'product_handoff',
  'public_api',
  'mcp_api',
  'chatgpt_app',
  'package_consumer',
] as const;

export type BtdInterfaceTelemetryProofHookInterfaceId =
  (typeof BTD_INTERFACE_TELEMETRY_PROOF_HOOK_INTERFACE_IDS)[number];

export const BTD_INTERFACE_TELEMETRY_PROOF_HOOK_POSTURES = [
  'success',
  'denied',
  'blocked',
] as const;

export type BtdInterfaceTelemetryProofHookPosture =
  (typeof BTD_INTERFACE_TELEMETRY_PROOF_HOOK_POSTURES)[number];

export type BtdInterfaceTelemetryProofHookRootKind =
  | 'request'
  | 'response'
  | 'ledger'
  | 'database'
  | 'object_storage'
  | 'generated_proof'
  | 'root_set';

export interface BtdInterfaceTelemetryProofRootSetInput {
  requestRoot: string;
  responseRoot: string;
  ledgerRoot: string;
  databaseRoot: string;
  objectStorageRoot: string;
  generatedProofRoot: string;
}

export interface BtdInterfaceTelemetryProofRootSet
  extends BtdInterfaceTelemetryProofRootSetInput {
  rootSetRoot: string;
}

export interface BtdInterfaceTelemetryProofHookInput {
  hookId: string;
  interfaceId: BtdInterfaceTelemetryProofHookInterfaceId;
  actionId: string;
  executionId: string;
  roots: BtdInterfaceTelemetryProofRootSetInput;
  posture: BtdInterfaceTelemetryProofHookPosture;
  replayCommand: string;
  theoremIds: readonly string[];
  replayStepIds: readonly string[];
  witnessArtifactPaths: readonly string[];
  denialReason?: string;
  successSummary?: string;
  repairPosture: string;
}

export interface BtdInterfaceTelemetryProofHook {
  kind: 'btd.interface_telemetry_proof_hook';
  hookId: string;
  interfaceId: BtdInterfaceTelemetryProofHookInterfaceId;
  actionId: string;
  executionId: string;
  roots: BtdInterfaceTelemetryProofRootSet;
  posture: BtdInterfaceTelemetryProofHookPosture;
  replayCommand: string;
  theoremIds: string[];
  replayStepIds: string[];
  witnessArtifactPaths: string[];
  denialReason?: string;
  successSummary?: string;
  repairPosture: string;
  sourceSafety: BtdProtocolTelemetrySourceSafety;
  hookRoot: string;
}

export interface BtdInterfaceTelemetryProofHookRegistryInput {
  hooks?: readonly BtdInterfaceTelemetryProofHookInput[];
  requiredInterfaceIds?: readonly BtdInterfaceTelemetryProofHookInterfaceId[];
  requiredPostures?: readonly BtdInterfaceTelemetryProofHookPosture[];
}

export interface BtdInterfaceTelemetryProofHookRegistry {
  kind: 'btd.interface_telemetry_proof_hook_registry';
  schemaId: 'bitcode.interfaceTelemetryProofHookRegistry.v1';
  registryRoot: string;
  hookCount: number;
  requiredInterfaceIds: BtdInterfaceTelemetryProofHookInterfaceId[];
  observedInterfaceIds: BtdInterfaceTelemetryProofHookInterfaceId[];
  missingInterfaceIds: BtdInterfaceTelemetryProofHookInterfaceId[];
  requiredPostures: BtdInterfaceTelemetryProofHookPosture[];
  observedPostures: BtdInterfaceTelemetryProofHookPosture[];
  missingPostures: BtdInterfaceTelemetryProofHookPosture[];
  hooks: BtdInterfaceTelemetryProofHook[];
  rootKinds: BtdInterfaceTelemetryProofHookRootKind[];
  protectedPayloadSerialized: false;
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

export function buildBtdInterfaceTelemetryProofHookInputs(): BtdInterfaceTelemetryProofHookInput[] {
  return [
    {
      hookId: 'interface.telemetry.terminal-reading-handoff',
      interfaceId: 'product_handoff',
      actionId: 'terminal.reading.assetPackPreview',
      executionId: 'execution-terminal-reading-preview',
      roots: rootSet('terminal-preview'),
      posture: 'blocked',
      replayCommand:
        'pnpm --dir apps/uapi exec jest --runTestsByPath tests/terminalOrganizationAuthority.test.ts --runInBand',
      theoremIds: ['interface-preview-not-source', 'interface-denial-readable'],
      replayStepIds: ['terminal-read-model', 'terminal-preview-blocked-readback'],
      witnessArtifactPaths: ['apps/uapi/tests/terminalOrganizationAuthority.test.ts'],
      denialReason: 'assetpack-source-locked-until-settlement',
      repairPosture: 'settle-btc-fee-before-full-assetpack-delivery',
    },
    {
      hookId: 'interface.telemetry.public-api-reading',
      interfaceId: 'public_api',
      actionId: 'api.btd.readAccess',
      executionId: 'execution-public-api-read-access',
      roots: rootSet('public-api-read-access'),
      posture: 'denied',
      replayCommand:
        'pnpm --filter @bitcode/api exec jest --config jest.config.cjs --runTestsByPath src/routes/__tests__/btd-crypto.test.ts --runInBand',
      theoremIds: ['interface-auth-fail-closed', 'interface-denial-readable'],
      replayStepIds: ['api-read-access-check', 'api-denial-readback'],
      witnessArtifactPaths: ['packages/api/src/routes/__tests__/btd-crypto.test.ts'],
      denialReason: 'read-license-or-authority-missing',
      repairPosture: 'refresh-read-license-and-organization-authority-before-delivery',
    },
    {
      hookId: 'interface.telemetry.mcp-reading-tool',
      interfaceId: 'mcp_api',
      actionId: 'mcp.reading.pipeline',
      executionId: 'execution-mcp-reading-pipeline',
      roots: rootSet('mcp-reading-pipeline'),
      posture: 'success',
      replayCommand:
        'pnpm --dir apps/mcp run test:mcp -- --runTestsByPath src/__tests__/unit/pipeline-ingress-contract.test.ts --runInBand',
      theoremIds: ['interface-execution-rooted', 'interface-proof-replayable'],
      replayStepIds: ['mcp-auth-context', 'mcp-pipeline-queue-readback'],
      witnessArtifactPaths: [
        'apps/mcp/src/__tests__/unit/pipeline-ingress-contract.test.ts',
      ],
      successSummary: 'mcp-reading-pipeline-queued-with-source-safe-roots',
      repairPosture: 'replay-mcp-pipeline-ingress-before-investigating-downstream-hosts',
    },
    {
      hookId: 'interface.telemetry.chatgpt-reading-action',
      interfaceId: 'chatgpt_app',
      actionId: 'chatgpt.reading.action',
      executionId: 'execution-chatgpt-reading-action',
      roots: rootSet('chatgpt-reading-action'),
      posture: 'blocked',
      replayCommand:
        'pnpm --dir packages/chatgptapp exec jest --runTestsByPath src/__tests__/tools.test.ts --runInBand',
      theoremIds: ['interface-confirmation-required', 'interface-preview-not-source'],
      replayStepIds: ['chatgpt-confirmation-check', 'chatgpt-assetpack-delivery-blocked'],
      witnessArtifactPaths: ['apps/chatgpt/src/__tests__/tools.test.ts'],
      denialReason: 'reader-confirmation-or-paid-rights-missing',
      repairPosture: 'confirm-action-and-settle-before-full-delivery',
    },
    {
      hookId: 'interface.telemetry.package-contract-catalog',
      interfaceId: 'package_consumer',
      actionId: 'package.interface.contract-catalog',
      executionId: 'execution-package-contract-catalog',
      roots: rootSet('package-contract-catalog'),
      posture: 'success',
      replayCommand:
        'pnpm --filter @bitcode/btd test -- --runTestsByPath __tests__/interface-telemetry-proof-hook.test.ts',
      theoremIds: ['interface-package-owned-contract', 'interface-proof-replayable'],
      replayStepIds: ['package-build-hook-registry', 'package-root-readback'],
      witnessArtifactPaths: ['packages/btd/__tests__/interface-telemetry-proof-hook.test.ts'],
      successSummary: 'package-consumer-can-replay-interface-proof-hooks',
      repairPosture: 'regenerate-hook-registry-from-package-source',
    },
  ];
}

export function buildBtdInterfaceTelemetryProofHook(
  input: BtdInterfaceTelemetryProofHookInput,
): BtdInterfaceTelemetryProofHook {
  const interfaceId = assertInterfaceId(input.interfaceId);
  const posture = assertPosture(input.posture);
  const roots = buildRootSet(input.roots);
  const theoremIds = assertNonEmptySourceSafeList(input.theoremIds, 'theoremId');
  const replayStepIds = assertNonEmptySourceSafeList(input.replayStepIds, 'replayStepId');
  const witnessArtifactPaths = assertNonEmptySourceSafeList(
    input.witnessArtifactPaths,
    'witnessArtifactPath',
  );
  const actionId = assertSourceSafeString(input.actionId, 'actionId');
  const executionId = assertSourceSafeString(input.executionId, 'executionId');
  const hookId = assertSourceSafeString(input.hookId, 'hookId');
  const replayCommand = assertReplayCommand(input.replayCommand);
  const repairPosture = assertSourceSafeString(input.repairPosture, 'repairPosture');
  const denialReason = input.denialReason
    ? assertSourceSafeString(input.denialReason, 'denialReason')
    : undefined;
  const successSummary = input.successSummary
    ? assertSourceSafeString(input.successSummary, 'successSummary')
    : undefined;

  if (posture === 'success' && !successSummary) {
    throw new Error('Successful interface telemetry proof hooks require successSummary.');
  }
  if (posture !== 'success' && !denialReason) {
    throw new Error('Denied or blocked interface telemetry proof hooks require denialReason.');
  }
  if (posture === 'success' && denialReason) {
    throw new Error('Successful interface telemetry proof hooks must not carry denialReason.');
  }

  return {
    kind: 'btd.interface_telemetry_proof_hook',
    hookId,
    interfaceId,
    actionId,
    executionId,
    roots,
    posture,
    replayCommand,
    theoremIds,
    replayStepIds,
    witnessArtifactPaths,
    denialReason,
    successSummary,
    repairPosture,
    sourceSafety: { ...SOURCE_SAFETY },
    hookRoot: stableRoot('btd-interface-telemetry-proof-hook', [
      hookId,
      interfaceId,
      actionId,
      executionId,
      roots.rootSetRoot,
      posture,
      replayCommand,
      theoremIds.join(','),
      replayStepIds.join(','),
      witnessArtifactPaths.join(','),
      denialReason ?? '',
      successSummary ?? '',
      repairPosture,
    ]),
  };
}

export function buildBtdInterfaceTelemetryProofHookRegistry(
  input: BtdInterfaceTelemetryProofHookRegistryInput = {},
): BtdInterfaceTelemetryProofHookRegistry {
  const hooks = (input.hooks ?? buildBtdInterfaceTelemetryProofHookInputs()).map(
    buildBtdInterfaceTelemetryProofHook,
  );
  const requiredInterfaceIds = [
    ...(input.requiredInterfaceIds ?? BTD_INTERFACE_TELEMETRY_PROOF_HOOK_INTERFACE_IDS),
  ];
  const requiredPostures = [
    ...(input.requiredPostures ?? BTD_INTERFACE_TELEMETRY_PROOF_HOOK_POSTURES),
  ];
  const observedInterfaceIds = Array.from(new Set(hooks.map((hook) => hook.interfaceId))).sort();
  const observedPostures = Array.from(new Set(hooks.map((hook) => hook.posture))).sort();
  const missingInterfaceIds = requiredInterfaceIds.filter(
    (interfaceId) => !observedInterfaceIds.includes(interfaceId),
  );
  const missingPostures = requiredPostures.filter((posture) => !observedPostures.includes(posture));
  const duplicateHookIds = findDuplicates(hooks.map((hook) => hook.hookId));

  if (missingInterfaceIds.length) {
    throw new Error(`Interface telemetry proof hooks missing interface ids: ${missingInterfaceIds.join(', ')}.`);
  }
  if (missingPostures.length) {
    throw new Error(`Interface telemetry proof hooks missing postures: ${missingPostures.join(', ')}.`);
  }
  if (duplicateHookIds.length) {
    throw new Error(`Interface telemetry proof hooks contain duplicate ids: ${duplicateHookIds.join(', ')}.`);
  }

  const registryRoot = stableRoot('btd-interface-telemetry-proof-hook-registry', [
    ...hooks.map((hook) => hook.hookRoot),
    requiredInterfaceIds.join(','),
    requiredPostures.join(','),
  ]);

  return {
    kind: 'btd.interface_telemetry_proof_hook_registry',
    schemaId: 'bitcode.interfaceTelemetryProofHookRegistry.v1',
    registryRoot,
    hookCount: hooks.length,
    requiredInterfaceIds,
    observedInterfaceIds,
    missingInterfaceIds,
    requiredPostures,
    observedPostures,
    missingPostures,
    hooks,
    rootKinds: [
      'request',
      'response',
      'ledger',
      'database',
      'object_storage',
      'generated_proof',
      'root_set',
    ],
    protectedPayloadSerialized: false,
    sourceSafety: { ...SOURCE_SAFETY },
  };
}

export function getBtdInterfaceTelemetryProofHook(
  hookId: string,
): BtdInterfaceTelemetryProofHook {
  const hook = buildBtdInterfaceTelemetryProofHookRegistry().hooks.find(
    (entry) => entry.hookId === hookId,
  );
  if (!hook) {
    throw new Error(`Unknown interface telemetry proof hook: ${hookId}.`);
  }

  return hook;
}

function rootSet(rootId: string): BtdInterfaceTelemetryProofRootSetInput {
  const safeRootId = assertSourceSafeString(rootId, 'rootId');
  return {
    requestRoot: `request-root:${safeRootId}`,
    responseRoot: `response-root:${safeRootId}`,
    ledgerRoot: `ledger-root:${safeRootId}`,
    databaseRoot: `database-root:${safeRootId}`,
    objectStorageRoot: `object-storage-root:${safeRootId}`,
    generatedProofRoot: `generated-proof-root:${safeRootId}`,
  };
}

function buildRootSet(
  input: BtdInterfaceTelemetryProofRootSetInput,
): BtdInterfaceTelemetryProofRootSet {
  const requestRoot = assertSourceSafeString(input.requestRoot, 'requestRoot');
  const responseRoot = assertSourceSafeString(input.responseRoot, 'responseRoot');
  const ledgerRoot = assertSourceSafeString(input.ledgerRoot, 'ledgerRoot');
  const databaseRoot = assertSourceSafeString(input.databaseRoot, 'databaseRoot');
  const objectStorageRoot = assertSourceSafeString(input.objectStorageRoot, 'objectStorageRoot');
  const generatedProofRoot = assertSourceSafeString(input.generatedProofRoot, 'generatedProofRoot');

  return {
    requestRoot,
    responseRoot,
    ledgerRoot,
    databaseRoot,
    objectStorageRoot,
    generatedProofRoot,
    rootSetRoot: stableRoot('btd-interface-telemetry-root-set', [
      requestRoot,
      responseRoot,
      ledgerRoot,
      databaseRoot,
      objectStorageRoot,
      generatedProofRoot,
    ]),
  };
}

function assertInterfaceId(interfaceId: string): BtdInterfaceTelemetryProofHookInterfaceId {
  if (!BTD_INTERFACE_TELEMETRY_PROOF_HOOK_INTERFACE_IDS.includes(interfaceId as BtdInterfaceTelemetryProofHookInterfaceId)) {
    throw new Error(`Unsupported interface telemetry proof hook interface id: ${interfaceId}.`);
  }

  return interfaceId as BtdInterfaceTelemetryProofHookInterfaceId;
}

function assertPosture(posture: string): BtdInterfaceTelemetryProofHookPosture {
  if (!BTD_INTERFACE_TELEMETRY_PROOF_HOOK_POSTURES.includes(posture as BtdInterfaceTelemetryProofHookPosture)) {
    throw new Error(`Unsupported interface telemetry proof hook posture: ${posture}.`);
  }

  return posture as BtdInterfaceTelemetryProofHookPosture;
}

function assertReplayCommand(command: unknown): string {
  const replayCommand = assertSourceSafeString(command, 'replayCommand');
  if (!/^(?:pnpm|npm|node)\b/u.test(replayCommand)) {
    throw new Error('Interface telemetry proof hook replayCommand must be a maintained replay command.');
  }

  return replayCommand;
}

function assertNonEmptySourceSafeList(values: readonly string[], label: string): string[] {
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error(`Interface telemetry proof hooks require at least one ${label}.`);
  }

  return Array.from(new Set(values.map((value) => assertSourceSafeString(value, label)))).sort();
}

function assertSourceSafeString(value: unknown, label: string): string {
  const text = assertNonEmptyString(value, label);
  if (SECRET_OR_SOURCE_PATTERNS.some((pattern) => pattern.test(text))) {
    throw new Error(`${label} must not contain secrets, prompt bodies, or protected source payloads.`);
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

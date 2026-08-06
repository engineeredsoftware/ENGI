import { createHash } from 'crypto';
import { assertNonEmptyString } from './constants';
import type { BtdProtocolTelemetrySourceSafety } from './telemetry';

/**
 * Product MCP tools (exactly eight):
 * measure, synthesize-asset-packs-for-deposit|reads, packs,
 * auxiliary-profile|wallet|interfaces|externals.
 */
export const BTD_MCP_TOOL_CONTRACT_IDS = [
  'bitcode://measure',
  'bitcode://synthesize-asset-packs-for-deposit',
  'bitcode://synthesize-asset-packs-for-reads',
  'bitcode://packs',
  'bitcode://auxiliary-profile',
  'bitcode://auxiliary-wallet',
  'bitcode://auxiliary-interfaces',
  'bitcode://auxiliary-externals',
] as const;

export type BtdMcpToolContractId = (typeof BTD_MCP_TOOL_CONTRACT_IDS)[number];

export type BtdMcpToolContractSourceSafetyClass =
  | 'source-safe-public'
  | 'source-safe-internal'
  | 'protected-source-locked';

export type BtdMcpToolDeniedStateCode =
  | 'MISSING_API_KEY'
  | 'INSUFFICIENT_PERMISSIONS'
  | 'PROVIDER_BINDING_REQUIRED'
  | 'SCHEMA_VALIDATION_FAILED'
  | 'RATE_LIMITED'
  | 'UNKNOWN_TOOL';

export type BtdMcpToolExamplePosture =
  | 'success_queued'
  | 'denied_auth'
  | 'denied_permission'
  | 'denied_provider_binding';

export interface BtdMcpToolDeniedStateInput {
  code: BtdMcpToolDeniedStateCode;
  statusCode: number;
  reason: string;
  repairPosture: string;
}

export interface BtdMcpToolDeniedState extends BtdMcpToolDeniedStateInput {
  deniedStateRoot: string;
}

export interface BtdMcpToolExampleInput {
  exampleId: string;
  posture: BtdMcpToolExamplePosture;
  fixturePath: string;
  validationCommand: string;
  sourceSafetyClass: BtdMcpToolContractSourceSafetyClass;
}

export interface BtdMcpToolExample extends BtdMcpToolExampleInput {
  exampleRoot: string;
}

export interface BtdMcpToolContractInput {
  toolId: BtdMcpToolContractId;
  category: string;
  summary: string;
  description: string;
  inputSchemaId: string;
  outputSchemaId: string;
  authPolicyId: string;
  requiredPermissions: readonly string[];
  sourceSafetyClass: BtdMcpToolContractSourceSafetyClass;
  protectedSourcePolicy: string;
  proofRootFields: readonly string[];
  requestRootFields: readonly string[];
  responseRootFields: readonly string[];
  deniedStates: readonly BtdMcpToolDeniedStateInput[];
  examples: readonly BtdMcpToolExampleInput[];
}

export interface BtdMcpToolContract {
  kind: 'btd.mcp_tool_contract';
  toolId: BtdMcpToolContractId;
  category: string;
  summary: string;
  description: string;
  inputSchemaId: string;
  outputSchemaId: string;
  authPolicyId: string;
  requiredPermissions: string[];
  sourceSafetyClass: BtdMcpToolContractSourceSafetyClass;
  protectedSourcePolicy: string;
  proofRootFields: string[];
  requestRootFields: string[];
  responseRootFields: string[];
  deniedStates: BtdMcpToolDeniedState[];
  examples: BtdMcpToolExample[];
  contractRoot: string;
  sourceSafety: BtdProtocolTelemetrySourceSafety;
}

export interface BtdMcpToolContractRegistryInput {
  tools?: readonly BtdMcpToolContractInput[];
  requiredToolIds?: readonly BtdMcpToolContractId[];
}

export interface BtdMcpToolContractRegistry {
  kind: 'btd.mcp_tool_contract_registry';
  schemaId: 'bitcode.mcpToolContractRegistry.v1';
  registryRoot: string;
  toolCount: number;
  requiredToolIds: BtdMcpToolContractId[];
  observedToolIds: BtdMcpToolContractId[];
  missingToolIds: BtdMcpToolContractId[];
  tools: BtdMcpToolContract[];
  sourceSafety: BtdProtocolTelemetrySourceSafety;
}

const SOURCE_SAFETY: BtdProtocolTelemetrySourceSafety = {
  sourceSafe: true,
  protectedSourceVisible: false,
  containsProtectedSource: false,
  containsSecret: false,
};

const REQUIRED_PROOF_ROOT_FIELDS = [
  'toolId',
  'inputSchemaId',
  'outputSchemaId',
  'authPolicyId',
  'requestRoot',
  'responseRoot',
  'writeAdmission',
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

export const BTD_MCP_TOOL_CONTRACT_REQUIRED_PROOF_ROOT_FIELDS = [
  ...REQUIRED_PROOF_ROOT_FIELDS,
] as const;

const PIPELINE_INGRESS_FIXTURE =
  'apps/mcp/src/__tests__/unit/pipeline-ingress-contract.test.ts';
const PIPELINE_INGRESS_VALIDATION =
  'pnpm --dir apps/mcp run test:mcp -- --runTestsByPath src/__tests__/unit/pipeline-ingress-contract.test.ts --runInBand';
const AUTH_FIXTURE = 'apps/mcp/src/__tests__/unit/auth.test.ts';
const AUTH_VALIDATION =
  'pnpm --dir apps/mcp run test:mcp -- --runTestsByPath src/__tests__/unit/auth.test.ts --runInBand';
const MCP_CONTRACT_FIXTURE = 'packages/btd/__tests__/mcp-tool-contract.test.ts';
const MCP_CONTRACT_VALIDATION =
  'pnpm --dir packages/btd exec jest --runTestsByPath __tests__/mcp-tool-contract.test.ts --runInBand';

const SHARED_PIPELINE_DENIED_STATES: readonly BtdMcpToolDeniedStateInput[] = [
  {
    code: 'MISSING_API_KEY',
    statusCode: 401,
    reason: 'MCP request did not include an admissible Bearer API key.',
    repairPosture: 'supply-bearer-api-key',
  },
  {
    code: 'INSUFFICIENT_PERMISSIONS',
    statusCode: 403,
    reason: 'MCP context lacks pipelines.create permission.',
    repairPosture: 'grant-pipelines-create-or-use-readonly-tool',
  },
  {
    code: 'PROVIDER_BINDING_REQUIRED',
    statusCode: 403,
    reason: 'MCP write admission lacks repository-scoped provider binding.',
    repairPosture: 'provide-matching-repository-connection-or-provider-credential',
  },
  {
    code: 'SCHEMA_VALIDATION_FAILED',
    statusCode: 400,
    reason: 'MCP tool arguments failed package-owned input schema validation.',
    repairPosture: 'repair-tool-arguments-to-match-input-schema',
  },
  {
    code: 'RATE_LIMITED',
    statusCode: 429,
    reason: 'MCP user or pipeline creation limit is temporarily exceeded.',
    repairPosture: 'retry-after-rate-limit-reset',
  },
  {
    code: 'UNKNOWN_TOOL',
    statusCode: 404,
    reason: 'MCP tool id is not present in the package-owned registry.',
    repairPosture: 'refresh-tool-discovery-from-registry',
  },
];

const SHARED_PIPELINE_EXAMPLES: readonly BtdMcpToolExampleInput[] = [
  {
    exampleId: 'mcp-pipeline-success-queued',
    posture: 'success_queued',
    fixturePath: PIPELINE_INGRESS_FIXTURE,
    validationCommand: PIPELINE_INGRESS_VALIDATION,
    sourceSafetyClass: 'source-safe-internal',
  },
  {
    exampleId: 'mcp-pipeline-denied-permission',
    posture: 'denied_permission',
    fixturePath: PIPELINE_INGRESS_FIXTURE,
    validationCommand: PIPELINE_INGRESS_VALIDATION,
    sourceSafetyClass: 'source-safe-internal',
  },
  {
    exampleId: 'mcp-pipeline-denied-auth',
    posture: 'denied_auth',
    fixturePath: AUTH_FIXTURE,
    validationCommand: AUTH_VALIDATION,
    sourceSafetyClass: 'source-safe-internal',
  },
  {
    exampleId: 'mcp-pipeline-denied-provider-binding',
    posture: 'denied_provider_binding',
    fixturePath: PIPELINE_INGRESS_FIXTURE,
    validationCommand: PIPELINE_INGRESS_VALIDATION,
    sourceSafetyClass: 'source-safe-internal',
  },
];

const PIPELINE_RESPONSE_ROOT_FIELDS = [
  'runId',
  'assetPackEvidenceId',
  'status',
  'interfaceSurface',
  'writeAdmission',
  'outputMeaning',
  'monitoringUrl',
] as const;

export function buildBtdMcpToolContractInputs(): BtdMcpToolContractInput[] {
  const writeDenied = SHARED_PIPELINE_DENIED_STATES;
  const writeExamples = SHARED_PIPELINE_EXAMPLES;
  const readDenied: readonly BtdMcpToolDeniedStateInput[] = [
    {
      code: 'MISSING_API_KEY',
      statusCode: 401,
      reason: 'MCP request did not include an admissible Bearer API key.',
      repairPosture: 'supply-bearer-api-key',
    },
    {
      code: 'INSUFFICIENT_PERMISSIONS',
      statusCode: 403,
      reason: 'MCP context lacks product.read permission.',
      repairPosture: 'grant-product-read-permission',
    },
    {
      code: 'SCHEMA_VALIDATION_FAILED',
      statusCode: 400,
      reason: 'MCP tool arguments failed package-owned input schema validation.',
      repairPosture: 'repair-tool-arguments-to-match-input-schema',
    },
    {
      code: 'RATE_LIMITED',
      statusCode: 429,
      reason: 'MCP user limit is temporarily exceeded.',
      repairPosture: 'retry-after-rate-limit-reset',
    },
    {
      code: 'UNKNOWN_TOOL',
      statusCode: 404,
      reason: 'MCP tool id is not present in the package-owned registry.',
      repairPosture: 'refresh-tool-discovery-from-registry',
    },
  ];
  const readExamples: readonly BtdMcpToolExampleInput[] = [
    {
      exampleId: 'mcp-product-read-success',
      posture: 'success_queued',
      fixturePath: MCP_CONTRACT_FIXTURE,
      validationCommand: MCP_CONTRACT_VALIDATION,
      sourceSafetyClass: 'source-safe-public',
    },
    {
      exampleId: 'mcp-product-read-denied-auth',
      posture: 'denied_auth',
      fixturePath: AUTH_FIXTURE,
      validationCommand: AUTH_VALIDATION,
      sourceSafetyClass: 'source-safe-internal',
    },
    {
      exampleId: 'mcp-product-read-denied-permission',
      posture: 'denied_permission',
      fixturePath: MCP_CONTRACT_FIXTURE,
      validationCommand: MCP_CONTRACT_VALIDATION,
      sourceSafetyClass: 'source-safe-internal',
    },
  ];

  const auxiliary = (pane: string): BtdMcpToolContractInput => ({
    toolId: `bitcode://auxiliary-${pane}` as BtdMcpToolContractId,
    category: 'auxiliary',
    summary: `Open or reread Auxillaries ${pane} posture (source-safe).`,
    description: [
      `Product Auxillaries ${pane} pane via MCP.`,
      `Returns source-safe open posture and productRoute /packs?auxillary-open-to=${pane}.`,
      'Does not expose credentials, wallet private material, or unsettled AssetPack bodies.',
    ].join(' '),
    inputSchemaId: `bitcode.mcp.auxiliary${pane[0].toUpperCase()}${pane.slice(1)}.input.v1`,
    outputSchemaId: `bitcode.mcp.auxiliary${pane[0].toUpperCase()}${pane.slice(1)}.output.v1`,
    authPolicyId: 'interface.authorization.product-read',
    requiredPermissions: ['product.read'],
    sourceSafetyClass: 'source-safe-public',
    protectedSourcePolicy: 'source-safe-auxillary-posture-only',
    proofRootFields: REQUIRED_PROOF_ROOT_FIELDS,
    requestRootFields: ['organizationId', 'confirmOpen'],
    responseRootFields: [
      'toolId',
      'pane',
      'productRoute',
      'status',
      'writeAdmission',
      'outputMeaning',
    ],
    deniedStates: readDenied,
    examples: readExamples.map((example) => ({
      ...example,
      exampleId: example.exampleId.replace('mcp-product-read-', `mcp-auxiliary-${pane}-`),
    })),
  });

  return [
    {
      toolId: 'bitcode://measure',
      category: 'measure',
      summary: 'Measure a repository for product measurement dimensions (source-safe).',
      description: [
        'Single product measure tool for Deposit/Read measurement law.',
        'Returns source-safe measurement evidence: metrics, confidence, and measure roots only.',
        'Measure types: architecture, dependencies, security, performance, quality, complexity, patterns, technical_debt.',
      ].join(' '),
      inputSchemaId: 'bitcode.mcp.measure.input.v1',
      outputSchemaId: 'bitcode.mcp.measure.output.v1',
      authPolicyId: 'interface.authorization.measure-permission',
      requiredPermissions: ['measure.read'],
      sourceSafetyClass: 'source-safe-public',
      protectedSourcePolicy: 'source-safe-metrics-and-roots-only',
      proofRootFields: REQUIRED_PROOF_ROOT_FIELDS,
      requestRootFields: [
        'repository',
        'measureType',
        'depth',
        'includeMetrics',
        'outputFormat',
      ],
      responseRootFields: [
        'repository',
        'branch',
        'measureType',
        'results',
        'metadata',
        'writeAdmission',
        'outputMeaning',
      ],
      deniedStates: [
        {
          code: 'MISSING_API_KEY',
          statusCode: 401,
          reason: 'MCP request did not include an admissible Bearer API key.',
          repairPosture: 'supply-bearer-api-key',
        },
        {
          code: 'INSUFFICIENT_PERMISSIONS',
          statusCode: 403,
          reason: 'MCP context lacks measure.read permission.',
          repairPosture: 'grant-measure-read-permission',
        },
        {
          code: 'SCHEMA_VALIDATION_FAILED',
          statusCode: 400,
          reason: 'MCP tool arguments failed package-owned input schema validation.',
          repairPosture: 'repair-tool-arguments-to-match-input-schema',
        },
        {
          code: 'RATE_LIMITED',
          statusCode: 429,
          reason: 'MCP user measure limit is temporarily exceeded.',
          repairPosture: 'retry-after-rate-limit-reset',
        },
        {
          code: 'UNKNOWN_TOOL',
          statusCode: 404,
          reason: 'MCP tool id is not present in the package-owned registry.',
          repairPosture: 'refresh-tool-discovery-from-registry',
        },
      ],
      examples: readExamples.map((example) => ({
        ...example,
        exampleId: example.exampleId.replace('mcp-product-read-', 'mcp-measure-'),
      })),
    },
    {
      toolId: 'bitcode://synthesize-asset-packs-for-deposit',
      category: 'pipelines',
      summary:
        'Synthesize Deposit AssetPack options from a repository with obfuscations configuration.',
      description: [
        'Synthesize Deposit AssetPack options from a repository with obfuscations configuration.',
        'Product equivalent of website /deposits Synthesize AssetPacks.',
        'Empty obfuscations skips Setup obfuscation LLM. Returns source-safe run/admission metadata for Packs reread.',
      ].join(' '),
      inputSchemaId: 'bitcode.mcp.synthesizeAssetPacksForDeposit.input.v1',
      outputSchemaId: 'bitcode.mcp.synthesizeAssetPacksForDeposit.output.v1',
      authPolicyId: 'interface.authorization.pipeline-permission',
      requiredPermissions: ['pipelines.create'],
      sourceSafetyClass: 'protected-source-locked',
      protectedSourcePolicy: 'source-safe-preview-and-metadata-before-settlement',
      proofRootFields: REQUIRED_PROOF_ROOT_FIELDS,
      requestRootFields: [
        'repository',
        'obfuscations',
        'permissibleSources',
        'impermissibleSources',
        'streaming',
        'attachments',
        'connections',
      ],
      responseRootFields: [...PIPELINE_RESPONSE_ROOT_FIELDS],
      deniedStates: writeDenied,
      examples: writeExamples.map((example) => ({
        ...example,
        exampleId: example.exampleId.replace('mcp-pipeline-', 'mcp-deposit-synthesize-'),
      })),
    },
    {
      toolId: 'bitcode://synthesize-asset-packs-for-reads',
      category: 'pipelines',
      summary:
        'Synthesize Read AssetPack options from Need configuration and repository context.',
      description: [
        'Synthesize Read AssetPack options from Need configuration and repository context.',
        'Product equivalent of website /reads Synthesize AssetPacks.',
        'Requires Need.prompt. Returns source-safe run/admission metadata for Packs reread.',
      ].join(' '),
      inputSchemaId: 'bitcode.mcp.synthesizeAssetPacksForReads.input.v1',
      outputSchemaId: 'bitcode.mcp.synthesizeAssetPacksForReads.output.v1',
      authPolicyId: 'interface.authorization.pipeline-permission',
      requiredPermissions: ['pipelines.create'],
      sourceSafetyClass: 'protected-source-locked',
      protectedSourcePolicy: 'source-safe-preview-and-metadata-before-settlement',
      proofRootFields: REQUIRED_PROOF_ROOT_FIELDS,
      requestRootFields: [
        'repository',
        'need',
        'streaming',
        'attachments',
        'connections',
      ],
      responseRootFields: [...PIPELINE_RESPONSE_ROOT_FIELDS],
      deniedStates: writeDenied,
      examples: writeExamples.map((example) => ({
        ...example,
        exampleId: example.exampleId.replace('mcp-pipeline-', 'mcp-read-synthesize-'),
      })),
    },
    {
      toolId: 'bitcode://packs',
      category: 'packs',
      summary: 'Reread Packs activity (source-safe options, measurements, settlement posture).',
      description: [
        'Product Packs surface via MCP.',
        'Returns source-safe pack/activity posture for /packs reread. Never unpaid AssetPack bodies or credentials.',
      ].join(' '),
      inputSchemaId: 'bitcode.mcp.packs.input.v1',
      outputSchemaId: 'bitcode.mcp.packs.output.v1',
      authPolicyId: 'interface.authorization.product-read',
      requiredPermissions: ['product.read'],
      sourceSafetyClass: 'source-safe-public',
      protectedSourcePolicy: 'source-safe-pack-activity-only',
      proofRootFields: REQUIRED_PROOF_ROOT_FIELDS,
      requestRootFields: ['activityId', 'limit', 'organizationId'],
      responseRootFields: [
        'toolId',
        'productRoute',
        'activityId',
        'status',
        'writeAdmission',
        'outputMeaning',
        'packs',
      ],
      deniedStates: readDenied,
      examples: readExamples.map((example) => ({
        ...example,
        exampleId: example.exampleId.replace('mcp-product-read-', 'mcp-packs-'),
      })),
    },
    auxiliary('profile'),
    auxiliary('wallet'),
    auxiliary('interfaces'),
    auxiliary('externals'),
  ];
}

export function buildBtdMcpToolContract(
  input: BtdMcpToolContractInput,
): BtdMcpToolContract {
  const toolId = assertToolId(input.toolId);
  const deniedStates = input.deniedStates.map(buildDeniedState);
  const examples = input.examples.map(buildExample);
  const proofRootFields = assertProofRootFields(input.proofRootFields);
  const requestRootFields = assertStringList(input.requestRootFields, 'requestRootField');
  const responseRootFields = assertStringList(input.responseRootFields, 'responseRootField');

  const isWriteSynthesize =
    input.category === 'pipelines' ||
    toolId === 'bitcode://synthesize-asset-packs-for-deposit' ||
    toolId === 'bitcode://synthesize-asset-packs-for-reads';
  const isMeasureTool = input.category === 'measure' || toolId === 'bitcode://measure';
  const isProductReadTool =
    input.category === 'packs' ||
    input.category === 'auxiliary' ||
    toolId === 'bitcode://packs' ||
    toolId.startsWith('bitcode://auxiliary-');
  if (isWriteSynthesize && !input.requiredPermissions.includes('pipelines.create')) {
    throw new Error(`${toolId} must require pipelines.create permission.`);
  }
  if (isMeasureTool && !input.requiredPermissions.includes('measure.read')) {
    throw new Error(`${toolId} must require measure.read permission.`);
  }
  if (isProductReadTool && !input.requiredPermissions.includes('product.read')) {
    throw new Error(`${toolId} must require product.read permission.`);
  }
  if (input.requiredPermissions.length === 0) {
    throw new Error(`${toolId} must declare at least one required permission.`);
  }
  if (!deniedStates.some((state) => state.code === 'INSUFFICIENT_PERMISSIONS')) {
    throw new Error(`${toolId} must carry an insufficient-permissions denied state.`);
  }
  if (!deniedStates.some((state) => state.code === 'SCHEMA_VALIDATION_FAILED')) {
    throw new Error(`${toolId} must carry a schema-validation denied state.`);
  }
  if (!examples.some((example) => example.posture === 'success_queued')) {
    throw new Error(`${toolId} must carry a queued-success example.`);
  }
  if (!examples.some((example) => example.posture.startsWith('denied_'))) {
    throw new Error(`${toolId} must carry at least one denied-state example.`);
  }

  const contract = {
    kind: 'btd.mcp_tool_contract' as const,
    toolId,
    category: assertSourceSafeString(input.category, 'category'),
    summary: assertSourceSafeString(input.summary, 'summary'),
    description: assertSourceSafeString(input.description, 'description'),
    inputSchemaId: assertSourceSafeString(input.inputSchemaId, 'inputSchemaId'),
    outputSchemaId: assertSourceSafeString(input.outputSchemaId, 'outputSchemaId'),
    authPolicyId: assertSourceSafeString(input.authPolicyId, 'authPolicyId'),
    requiredPermissions: assertStringList(input.requiredPermissions, 'requiredPermission'),
    sourceSafetyClass: assertSourceSafetyClass(input.sourceSafetyClass),
    protectedSourcePolicy: assertSourceSafeString(input.protectedSourcePolicy, 'protectedSourcePolicy'),
    proofRootFields,
    requestRootFields,
    responseRootFields,
    deniedStates,
    examples,
    sourceSafety: { ...SOURCE_SAFETY },
  };

  return {
    ...contract,
    contractRoot: stableRoot('btd-mcp-tool-contract', [
      contract.toolId,
      contract.category,
      contract.summary,
      contract.description,
      contract.inputSchemaId,
      contract.outputSchemaId,
      contract.authPolicyId,
      contract.requiredPermissions.join(','),
      contract.sourceSafetyClass,
      contract.protectedSourcePolicy,
      contract.proofRootFields.join(','),
      contract.requestRootFields.join(','),
      contract.responseRootFields.join(','),
      contract.deniedStates.map((state) => state.deniedStateRoot).join(','),
      contract.examples.map((example) => example.exampleRoot).join(','),
    ]),
  };
}

export function buildBtdMcpToolContractRegistry(
  input: BtdMcpToolContractRegistryInput = {},
): BtdMcpToolContractRegistry {
  const tools = (input.tools ?? buildBtdMcpToolContractInputs()).map(buildBtdMcpToolContract);
  const requiredToolIds = [...(input.requiredToolIds ?? BTD_MCP_TOOL_CONTRACT_IDS)];
  const observedToolIds = Array.from(new Set(tools.map((tool) => tool.toolId))).sort();
  const missingToolIds = requiredToolIds.filter((toolId) => !observedToolIds.includes(toolId));
  const duplicates = findDuplicates(tools.map((tool) => tool.toolId));

  if (missingToolIds.length) {
    throw new Error(`MCP tool contract registry missing tool ids: ${missingToolIds.join(', ')}.`);
  }
  if (duplicates.length) {
    throw new Error(`MCP tool contract registry contains duplicate tool ids: ${duplicates.join(', ')}.`);
  }

  return {
    kind: 'btd.mcp_tool_contract_registry',
    schemaId: 'bitcode.mcpToolContractRegistry.v1',
    registryRoot: stableRoot('btd-mcp-tool-contract-registry', [
      ...tools.map((tool) => tool.contractRoot),
      requiredToolIds.join(','),
    ]),
    toolCount: tools.length,
    requiredToolIds,
    observedToolIds,
    missingToolIds,
    tools,
    sourceSafety: { ...SOURCE_SAFETY },
  };
}

export function getBtdMcpToolContract(toolId: BtdMcpToolContractId): BtdMcpToolContract {
  const contract = buildBtdMcpToolContractRegistry().tools.find((tool) => tool.toolId === toolId);
  if (!contract) {
    throw new Error(`MCP tool contract not found: ${toolId}.`);
  }

  return contract;
}

function buildDeniedState(input: BtdMcpToolDeniedStateInput): BtdMcpToolDeniedState {
  const state = {
    code: assertDeniedStateCode(input.code),
    statusCode: assertStatusCode(input.statusCode),
    reason: assertSourceSafeString(input.reason, 'deniedStateReason'),
    repairPosture: assertSourceSafeString(input.repairPosture, 'deniedStateRepairPosture'),
  };

  return {
    ...state,
    deniedStateRoot: stableRoot('btd-mcp-tool-denied-state', [
      state.code,
      String(state.statusCode),
      state.reason,
      state.repairPosture,
    ]),
  };
}

function buildExample(input: BtdMcpToolExampleInput): BtdMcpToolExample {
  const example = {
    exampleId: assertSourceSafeString(input.exampleId, 'exampleId'),
    posture: assertExamplePosture(input.posture),
    fixturePath: assertSourceSafeString(input.fixturePath, 'fixturePath'),
    validationCommand: assertSourceSafeString(input.validationCommand, 'validationCommand'),
    sourceSafetyClass: assertSourceSafetyClass(input.sourceSafetyClass),
  };

  return {
    ...example,
    exampleRoot: stableRoot('btd-mcp-tool-example', [
      example.exampleId,
      example.posture,
      example.fixturePath,
      example.validationCommand,
      example.sourceSafetyClass,
    ]),
  };
}

function assertToolId(toolId: string): BtdMcpToolContractId {
  if (!BTD_MCP_TOOL_CONTRACT_IDS.includes(toolId as BtdMcpToolContractId)) {
    throw new Error(`Unsupported MCP tool contract id: ${toolId}.`);
  }

  return toolId as BtdMcpToolContractId;
}

function assertDeniedStateCode(code: string): BtdMcpToolDeniedStateCode {
  const allowed: readonly BtdMcpToolDeniedStateCode[] = [
    'MISSING_API_KEY',
    'INSUFFICIENT_PERMISSIONS',
    'PROVIDER_BINDING_REQUIRED',
    'SCHEMA_VALIDATION_FAILED',
    'RATE_LIMITED',
    'UNKNOWN_TOOL',
  ];
  if (!allowed.includes(code as BtdMcpToolDeniedStateCode)) {
    throw new Error(`Unsupported MCP denied state code: ${code}.`);
  }

  return code as BtdMcpToolDeniedStateCode;
}

function assertExamplePosture(posture: string): BtdMcpToolExamplePosture {
  const allowed: readonly BtdMcpToolExamplePosture[] = [
    'success_queued',
    'denied_auth',
    'denied_permission',
    'denied_provider_binding',
  ];
  if (!allowed.includes(posture as BtdMcpToolExamplePosture)) {
    throw new Error(`Unsupported MCP example posture: ${posture}.`);
  }

  return posture as BtdMcpToolExamplePosture;
}

function assertSourceSafetyClass(
  sourceSafetyClass: string,
): BtdMcpToolContractSourceSafetyClass {
  const allowed: readonly BtdMcpToolContractSourceSafetyClass[] = [
    'source-safe-public',
    'source-safe-internal',
    'protected-source-locked',
  ];
  if (!allowed.includes(sourceSafetyClass as BtdMcpToolContractSourceSafetyClass)) {
    throw new Error(`Unsupported MCP source-safety class: ${sourceSafetyClass}.`);
  }

  return sourceSafetyClass as BtdMcpToolContractSourceSafetyClass;
}

function assertStatusCode(statusCode: number): number {
  if (!Number.isInteger(statusCode) || statusCode < 400 || statusCode > 599) {
    throw new Error(`Unsupported MCP denied state status code: ${statusCode}.`);
  }

  return statusCode;
}

function assertProofRootFields(fields: readonly string[]): string[] {
  const deduped = assertStringList(fields, 'proofRootField');
  const missing = REQUIRED_PROOF_ROOT_FIELDS.filter((field) => !deduped.includes(field));
  if (missing.length) {
    throw new Error(`MCP tool contract missing proof-root fields: ${missing.join(', ')}.`);
  }

  return deduped;
}

function assertStringList(values: readonly string[], label: string): string[] {
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error(`${label} requires at least one value.`);
  }

  return Array.from(new Set(values.map((value) => assertSourceSafeString(value, label)))).sort();
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

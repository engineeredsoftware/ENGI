import { createHash } from 'crypto';
import { assertNonEmptyString } from './constants';
import type { BtdProtocolTelemetrySourceSafety } from './telemetry';

export const BTD_CHATGPT_APP_ACTION_CONTRACT_IDS = [
  'bitcode_request_read',
  'bitcode_review_read_need',
  'bitcode_request_finding_fits',
  'bitcode_review_asset_pack_preview',
  'bitcode_quote_asset_pack_fee',
  'bitcode_settle_asset_pack',
  'bitcode_deliver_asset_pack',
] as const;

export type BtdChatGptAppActionId = (typeof BTD_CHATGPT_APP_ACTION_CONTRACT_IDS)[number];

export type BtdChatGptAppActionFlowObject =
  | 'read_request'
  | 'read_need'
  | 'finding_fits_result'
  | 'asset_pack_preview'
  | 'btc_fee_quote'
  | 'settlement_unlock'
  | 'asset_pack_delivery';

export type BtdChatGptAppActionSourceSafetyClass =
  | 'source-safe-public'
  | 'source-safe-internal'
  | 'locked-assetpack-delivery';

export type BtdChatGptAppActionDeniedStateCode =
  | 'SCHEMA_VALIDATION_FAILED'
  | 'MISSING_READER_SESSION'
  | 'READ_NEED_REQUIRED'
  | 'FINDING_FITS_REQUIRED'
  | 'ASSET_PACK_PREVIEW_REQUIRED'
  | 'FEE_QUOTE_REQUIRED'
  | 'SETTLEMENT_REQUIRED'
  | 'READ_LICENSE_REQUIRED'
  | 'ORGANIZATION_AUTHORITY_REQUIRED'
  | 'CONFIRMATION_REQUIRED';

export type BtdChatGptAppActionExamplePosture =
  | 'success_source_safe'
  | 'denied_schema'
  | 'denied_repair'
  | 'denied_settlement'
  | 'denied_delivery';

export interface BtdChatGptAppActionDeniedStateInput {
  code: BtdChatGptAppActionDeniedStateCode;
  readableMessage: string;
  repairAction: string;
}

export interface BtdChatGptAppActionDeniedState extends BtdChatGptAppActionDeniedStateInput {
  deniedStateRoot: string;
}

export interface BtdChatGptAppActionExampleInput {
  exampleId: string;
  posture: BtdChatGptAppActionExamplePosture;
  fixturePath: string;
  validationCommand: string;
  sourceSafetyClass: BtdChatGptAppActionSourceSafetyClass;
}

export interface BtdChatGptAppActionExample extends BtdChatGptAppActionExampleInput {
  exampleRoot: string;
}

export interface BtdChatGptAppActionContractInput {
  actionId: BtdChatGptAppActionId;
  flowObject: BtdChatGptAppActionFlowObject;
  summary: string;
  description: string;
  uiResponseFamily: string;
  inputSchemaId: string;
  outputSchemaId: string;
  authPolicyId: string;
  requiredPermissions: readonly string[];
  sourceSafetyClass: BtdChatGptAppActionSourceSafetyClass;
  sourceSafeRendererId: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  proofRootFields: readonly string[];
  requestRootFields: readonly string[];
  responseRootFields: readonly string[];
  deniedStates: readonly BtdChatGptAppActionDeniedStateInput[];
  examples: readonly BtdChatGptAppActionExampleInput[];
}

export interface BtdChatGptAppActionContract {
  kind: 'btd.chatgpt_app_action_contract';
  actionId: BtdChatGptAppActionId;
  flowObject: BtdChatGptAppActionFlowObject;
  summary: string;
  description: string;
  uiResponseFamily: string;
  inputSchemaId: string;
  outputSchemaId: string;
  authPolicyId: string;
  requiredPermissions: string[];
  sourceSafetyClass: BtdChatGptAppActionSourceSafetyClass;
  sourceSafeRendererId: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  proofRootFields: string[];
  requestRootFields: string[];
  responseRootFields: string[];
  deniedStates: BtdChatGptAppActionDeniedState[];
  examples: BtdChatGptAppActionExample[];
  contractRoot: string;
  sourceSafety: BtdProtocolTelemetrySourceSafety;
}

export interface BtdChatGptAppActionContractRegistryInput {
  actions?: readonly BtdChatGptAppActionContractInput[];
  requiredActionIds?: readonly BtdChatGptAppActionId[];
}

export interface BtdChatGptAppActionContractRegistry {
  kind: 'btd.chatgpt_app_action_contract_registry';
  schemaId: 'bitcode.chatGptAppActionContractRegistry.v1';
  registryRoot: string;
  actionCount: number;
  requiredActionIds: BtdChatGptAppActionId[];
  observedActionIds: BtdChatGptAppActionId[];
  missingActionIds: BtdChatGptAppActionId[];
  actions: BtdChatGptAppActionContract[];
  sourceSafety: BtdProtocolTelemetrySourceSafety;
}

export interface BtdChatGptAppSourceSafeResponseInput {
  actionId: BtdChatGptAppActionId;
  status: 'accepted' | 'denied';
  requestRoot: string;
  responseRoot?: string;
  summary?: string;
  visibleFields?: Record<string, unknown>;
  deniedStateCode?: BtdChatGptAppActionDeniedStateCode;
  proofRootProjection?: Record<string, string>;
}

export interface BtdChatGptAppSourceSafeResponse {
  kind: 'btd.chatgpt_app_source_safe_response';
  actionId: BtdChatGptAppActionId;
  flowObject: BtdChatGptAppActionFlowObject;
  uiResponseFamily: string;
  status: 'accepted' | 'denied';
  summary: string;
  visibleFields: Record<string, unknown>;
  repairActions: string[];
  deniedState?: BtdChatGptAppActionDeniedState;
  proofRootProjection: Record<string, string>;
  responseRoot: string;
  sourceSafety: BtdProtocolTelemetrySourceSafety;
}

const SOURCE_SAFETY: BtdProtocolTelemetrySourceSafety = {
  sourceSafe: true,
  protectedSourceVisible: false,
  containsProtectedSource: false,
  containsSecret: false,
};

const REQUIRED_PROOF_ROOT_FIELDS = [
  'actionId',
  'inputSchemaId',
  'outputSchemaId',
  'authPolicyId',
  'requestRoot',
  'responseRoot',
  'sourceSafeRendererId',
  'writeAdmission',
] as const;

const REQUIRED_FLOW_OBJECTS: readonly BtdChatGptAppActionFlowObject[] = [
  'read_request',
  'read_need',
  'finding_fits_result',
  'asset_pack_preview',
  'btc_fee_quote',
  'settlement_unlock',
  'asset_pack_delivery',
];

const SECRET_OR_SOURCE_PATTERNS = [
  new RegExp(`${['sb', 'secret'].join('_')}__`, 'iu'),
  /\bsk-(?:proj|live|test)?[-_A-Za-z0-9]{16,}\b/u,
  /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/u,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/u,
  /\bprivate\s+source\b/iu,
  /\braw\s+source\b/iu,
];

export const BTD_CHATGPT_APP_ACTION_REQUIRED_PROOF_ROOT_FIELDS = [
  ...REQUIRED_PROOF_ROOT_FIELDS,
] as const;

export const BTD_CHATGPT_APP_REQUIRED_FLOW_OBJECTS = [...REQUIRED_FLOW_OBJECTS] as const;

export function buildBtdChatGptAppActionContractInputs(): BtdChatGptAppActionContractInput[] {
  return [
    buildActionInput({
      actionId: 'bitcode_request_read',
      flowObject: 'read_request',
      summary: 'Request a Bitcode Read from ChatGPT with source-safe repository intent.',
      description:
        'Captures the user Read request, repository anchor, and requested work shape for ReadNeedComprehensionSynthesis without exposing AssetPack contents.',
      uiResponseFamily: 'read-request-admission',
      requiredFields: ['readerId', 'repository', 'readRequest'],
      optionalFields: ['requestId', 'interfaceSessionId', 'attachmentsRoot'],
      responseFields: ['readRequestRoot', 'readinessState', 'nextAction'],
      deniedStates: baseDeniedStates(),
    }),
    buildActionInput({
      actionId: 'bitcode_review_read_need',
      flowObject: 'read_need',
      summary: 'Review, accept, or request regeneration of a synthesized ReadNeed.',
      description:
        'Binds a reviewed ReadNeed root to the ChatGPT App conversation so Finding Fits can only run from user-approved need comprehension.',
      uiResponseFamily: 'read-need-review',
      requiredFields: ['readRequestRoot', 'readNeedRoot', 'decision'],
      optionalFields: ['feedback'],
      responseFields: ['acceptedNeedRoot', 'reviewState', 'nextAction'],
      deniedStates: [
        ...baseDeniedStates(),
        {
          code: 'READ_NEED_REQUIRED',
          readableMessage: 'A synthesized ReadNeed must be present before review can continue.',
          repairAction: 'run-read-need-comprehension-or-provide-read-need-root',
        },
      ],
    }),
    buildActionInput({
      actionId: 'bitcode_request_finding_fits',
      flowObject: 'finding_fits_result',
      summary: 'Request plural Finding Fits over the Depository from an accepted ReadNeed.',
      description:
        'Admits ReadFitsFindingSynthesis from an accepted ReadNeed root and returns source-safe candidate and fit-quality metadata only.',
      uiResponseFamily: 'finding-fits-admission',
      requiredFields: ['acceptedNeedRoot', 'depositoryScope'],
      optionalFields: ['minimumFitConfidence', 'candidateLimit'],
      responseFields: ['findingFitsResultRoot', 'candidateCount', 'nextAction'],
      deniedStates: [
        ...baseDeniedStates(),
        {
          code: 'READ_NEED_REQUIRED',
          readableMessage: 'Finding Fits requires an accepted ReadNeed root.',
          repairAction: 'accept-read-need-before-requesting-finding-fits',
        },
      ],
    }),
    buildActionInput({
      actionId: 'bitcode_review_asset_pack_preview',
      flowObject: 'asset_pack_preview',
      summary: 'Review a source-safe AssetPack preview produced from Finding Fits.',
      description:
        'Surfaces AssetPack measurements, fit score, and preview metadata while locked AssetPack contents remain unavailable before settlement.',
      uiResponseFamily: 'assetpack-preview-review',
      requiredFields: ['findingFitsResultRoot', 'assetPackPreviewRoot'],
      optionalFields: ['previewDecision'],
      responseFields: ['assetPackPreviewRoot', 'fitQuality', 'nextAction'],
      deniedStates: [
        ...baseDeniedStates(),
        {
          code: 'FINDING_FITS_REQUIRED',
          readableMessage: 'An accepted Finding Fits result is required before preview review.',
          repairAction: 'request-finding-fits-before-preview-review',
        },
        {
          code: 'ASSET_PACK_PREVIEW_REQUIRED',
          readableMessage: 'A source-safe AssetPack preview root is required for preview review.',
          repairAction: 'synthesize-source-safe-assetpack-preview',
        },
      ],
    }),
    buildActionInput({
      actionId: 'bitcode_quote_asset_pack_fee',
      flowObject: 'btc_fee_quote',
      summary: 'Quote the BTC fee for a source-safe AssetPack preview.',
      description:
        'Projects deterministic measurement-vector fee inputs and BTC payment posture without disclosing locked AssetPack contents.',
      uiResponseFamily: 'assetpack-fee-quote',
      requiredFields: ['assetPackPreviewRoot', 'measurementVectorRoot'],
      optionalFields: ['feePolicyId'],
      responseFields: ['feeQuoteRoot', 'btcAmountSats', 'nextAction'],
      deniedStates: [
        ...baseDeniedStates(),
        {
          code: 'ASSET_PACK_PREVIEW_REQUIRED',
          readableMessage: 'A source-safe AssetPack preview is required before fee quoting.',
          repairAction: 'review-source-safe-assetpack-preview-before-fee-quote',
        },
      ],
    }),
    buildActionInput({
      actionId: 'bitcode_settle_asset_pack',
      flowObject: 'settlement_unlock',
      summary: 'Admit settlement for a quoted AssetPack fee.',
      description:
        'Records settlement intent and BTC finality posture for the quoted AssetPack fee while keeping delivery locked until settlement and read-license evidence agree.',
      uiResponseFamily: 'assetpack-settlement',
      requiredFields: ['feeQuoteRoot', 'walletId', 'confirmationState', 'confirmed'],
      optionalFields: ['btcPaymentIntentId'],
      responseFields: ['settlementRoot', 'finalityState', 'nextAction'],
      deniedStates: [
        ...baseDeniedStates(),
        {
          code: 'FEE_QUOTE_REQUIRED',
          readableMessage: 'A fee quote root is required before settlement.',
          repairAction: 'quote-assetpack-fee-before-settlement',
        },
        {
          code: 'CONFIRMATION_REQUIRED',
          readableMessage: 'Settlement requires explicit user confirmation in ChatGPT.',
          repairAction: 'confirm-settlement-intent-before-continuing',
        },
      ],
    }),
    buildActionInput({
      actionId: 'bitcode_deliver_asset_pack',
      flowObject: 'asset_pack_delivery',
      summary: 'Admit full AssetPack delivery only after settlement and read-license evidence.',
      description:
        'Projects source-safe delivery admission for the paid AssetPack; ChatGPT receives delivery status, proof roots, and repair posture, not locked contents.',
      uiResponseFamily: 'assetpack-delivery',
      requiredFields: ['settlementRoot', 'readLicenseId', 'deliveryTarget', 'confirmed'],
      optionalFields: ['organizationAuthorityRoot'],
      responseFields: ['deliveryRoot', 'deliveryState', 'nextAction'],
      sourceSafetyClass: 'locked-assetpack-delivery',
      deniedStates: [
        ...baseDeniedStates(),
        {
          code: 'SETTLEMENT_REQUIRED',
          readableMessage: 'Settlement finality is required before full AssetPack delivery.',
          repairAction: 'wait-for-settlement-finality-and-readback-synchronization',
        },
        {
          code: 'READ_LICENSE_REQUIRED',
          readableMessage: 'A paid read license is required before delivery admission.',
          repairAction: 'refresh-read-license-evidence-after-settlement',
        },
        {
          code: 'ORGANIZATION_AUTHORITY_REQUIRED',
          readableMessage: 'Organization authority evidence is required for connected-interface delivery.',
          repairAction: 'refresh-organization-role-wallet-and-delivery-permission-evidence',
        },
        {
          code: 'CONFIRMATION_REQUIRED',
          readableMessage: 'Delivery requires explicit user confirmation in ChatGPT.',
          repairAction: 'confirm-delivery-target-before-continuing',
        },
      ],
    }),
  ];
}

export function buildBtdChatGptAppActionContract(
  input: BtdChatGptAppActionContractInput,
): BtdChatGptAppActionContract {
  const actionId = assertActionId(input.actionId);
  const deniedStates = input.deniedStates.map(buildDeniedState);
  const examples = input.examples.map(buildExample);
  const proofRootFields = assertProofRootFields(input.proofRootFields);
  const requestRootFields = assertStringList(input.requestRootFields, 'requestRootField');
  const responseRootFields = assertStringList(input.responseRootFields, 'responseRootField');
  const inputSchema = assertSourceSafeRecord(input.inputSchema, 'inputSchema');
  const outputSchema = assertSourceSafeRecord(input.outputSchema, 'outputSchema');

  if (!input.requiredPermissions.includes('chatgpt.reading.invoke')) {
    throw new Error(`${actionId} must require chatgpt.reading.invoke permission.`);
  }
  if (!deniedStates.some((state) => state.code === 'SCHEMA_VALIDATION_FAILED')) {
    throw new Error(`${actionId} must carry a schema-validation denied state.`);
  }
  if (!examples.some((example) => example.posture === 'success_source_safe')) {
    throw new Error(`${actionId} must carry a source-safe success example.`);
  }
  if (!examples.some((example) => example.posture.startsWith('denied_'))) {
    throw new Error(`${actionId} must carry at least one denied-state example.`);
  }

  const contract = {
    kind: 'btd.chatgpt_app_action_contract' as const,
    actionId,
    flowObject: assertFlowObject(input.flowObject),
    summary: assertSourceSafeString(input.summary, 'summary'),
    description: assertSourceSafeString(input.description, 'description'),
    uiResponseFamily: assertSourceSafeString(input.uiResponseFamily, 'uiResponseFamily'),
    inputSchemaId: assertSourceSafeString(input.inputSchemaId, 'inputSchemaId'),
    outputSchemaId: assertSourceSafeString(input.outputSchemaId, 'outputSchemaId'),
    authPolicyId: assertSourceSafeString(input.authPolicyId, 'authPolicyId'),
    requiredPermissions: assertStringList(input.requiredPermissions, 'requiredPermission'),
    sourceSafetyClass: assertSourceSafetyClass(input.sourceSafetyClass),
    sourceSafeRendererId: assertSourceSafeString(input.sourceSafeRendererId, 'sourceSafeRendererId'),
    inputSchema,
    outputSchema,
    proofRootFields,
    requestRootFields,
    responseRootFields,
    deniedStates,
    examples,
    sourceSafety: { ...SOURCE_SAFETY },
  };

  return {
    ...contract,
    contractRoot: stableRoot('btd-chatgpt-app-action-contract', [
      contract.actionId,
      contract.flowObject,
      contract.summary,
      contract.description,
      contract.uiResponseFamily,
      contract.inputSchemaId,
      contract.outputSchemaId,
      contract.authPolicyId,
      contract.requiredPermissions.join(','),
      contract.sourceSafetyClass,
      contract.sourceSafeRendererId,
      stableJson(contract.inputSchema),
      stableJson(contract.outputSchema),
      contract.proofRootFields.join(','),
      contract.requestRootFields.join(','),
      contract.responseRootFields.join(','),
      contract.deniedStates.map((state) => state.deniedStateRoot).join(','),
      contract.examples.map((example) => example.exampleRoot).join(','),
    ]),
  };
}

export function buildBtdChatGptAppActionContractRegistry(
  input: BtdChatGptAppActionContractRegistryInput = {},
): BtdChatGptAppActionContractRegistry {
  const actions = (input.actions ?? buildBtdChatGptAppActionContractInputs()).map(
    buildBtdChatGptAppActionContract,
  );
  const requiredActionIds = [...(input.requiredActionIds ?? BTD_CHATGPT_APP_ACTION_CONTRACT_IDS)];
  const observedActionIds = Array.from(new Set(actions.map((action) => action.actionId))).sort();
  const missingActionIds = requiredActionIds.filter((actionId) => !observedActionIds.includes(actionId));
  const duplicates = findDuplicates(actions.map((action) => action.actionId));
  const observedFlowObjects = Array.from(new Set(actions.map((action) => action.flowObject)));
  const missingFlowObjects = REQUIRED_FLOW_OBJECTS.filter((flowObject) => !observedFlowObjects.includes(flowObject));

  if (missingActionIds.length) {
    throw new Error(`ChatGPT App action contract registry missing action ids: ${missingActionIds.join(', ')}.`);
  }
  if (duplicates.length) {
    throw new Error(`ChatGPT App action contract registry contains duplicate action ids: ${duplicates.join(', ')}.`);
  }
  if (missingFlowObjects.length) {
    throw new Error(`ChatGPT App action contract registry missing flow objects: ${missingFlowObjects.join(', ')}.`);
  }

  return {
    kind: 'btd.chatgpt_app_action_contract_registry',
    schemaId: 'bitcode.chatGptAppActionContractRegistry.v1',
    registryRoot: stableRoot('btd-chatgpt-app-action-contract-registry', [
      ...actions.map((action) => action.contractRoot),
      requiredActionIds.join(','),
    ]),
    actionCount: actions.length,
    requiredActionIds,
    observedActionIds,
    missingActionIds,
    actions,
    sourceSafety: { ...SOURCE_SAFETY },
  };
}

export function getBtdChatGptAppActionContract(
  actionId: BtdChatGptAppActionId,
): BtdChatGptAppActionContract {
  const contract = buildBtdChatGptAppActionContractRegistry().actions.find(
    (action) => action.actionId === actionId,
  );
  if (!contract) {
    throw new Error(`ChatGPT App action contract not found: ${actionId}.`);
  }

  return contract;
}

export function renderBtdChatGptAppSourceSafeResponse(
  input: BtdChatGptAppSourceSafeResponseInput,
): BtdChatGptAppSourceSafeResponse {
  const contract = getBtdChatGptAppActionContract(input.actionId);
  const requestRoot = assertSourceSafeString(input.requestRoot, 'requestRoot');
  const visibleFields = assertSourceSafeRecord(input.visibleFields ?? {}, 'visibleFields');
  const proofRootProjection = assertProofRootProjection(input.proofRootProjection ?? {});
  const deniedState = input.status === 'denied'
    ? findDeniedState(contract, input.deniedStateCode)
    : undefined;
  const summary = assertSourceSafeString(
    input.summary ??
      (input.status === 'denied'
        ? deniedState?.readableMessage
        : contract.summary),
    'summary',
  );
  const responseRoot = input.responseRoot
    ? assertSourceSafeString(input.responseRoot, 'responseRoot')
    : stableRoot('btd-chatgpt-app-source-safe-response', [
        contract.actionId,
        input.status,
        requestRoot,
        summary,
        stableJson(visibleFields),
        stableJson(proofRootProjection),
        deniedState?.deniedStateRoot ?? 'accepted',
      ]);

  return {
    kind: 'btd.chatgpt_app_source_safe_response',
    actionId: contract.actionId,
    flowObject: contract.flowObject,
    uiResponseFamily: contract.uiResponseFamily,
    status: input.status,
    summary,
    visibleFields,
    repairActions: deniedState ? [deniedState.repairAction] : [],
    deniedState,
    proofRootProjection: {
      ...proofRootProjection,
      actionId: contract.actionId,
      inputSchemaId: contract.inputSchemaId,
      outputSchemaId: contract.outputSchemaId,
      authPolicyId: contract.authPolicyId,
      requestRoot,
      responseRoot,
      sourceSafeRendererId: contract.sourceSafeRendererId,
      writeAdmission: proofRootProjection.writeAdmission ?? 'not-required-for-source-safe-chatgpt-render',
    },
    responseRoot,
    sourceSafety: { ...SOURCE_SAFETY },
  };
}

function buildActionInput(input: {
  actionId: BtdChatGptAppActionId;
  flowObject: BtdChatGptAppActionFlowObject;
  summary: string;
  description: string;
  uiResponseFamily: string;
  requiredFields: string[];
  optionalFields: string[];
  responseFields: string[];
  deniedStates: BtdChatGptAppActionDeniedStateInput[];
  sourceSafetyClass?: BtdChatGptAppActionSourceSafetyClass;
}): BtdChatGptAppActionContractInput {
  const allInputFields = [...input.requiredFields, ...input.optionalFields];

  return {
    actionId: input.actionId,
    flowObject: input.flowObject,
    summary: input.summary,
    description: input.description,
    uiResponseFamily: input.uiResponseFamily,
    inputSchemaId: `bitcode.chatgpt.${input.actionId}.input.v1`,
    outputSchemaId: `bitcode.chatgpt.${input.actionId}.output.v1`,
    authPolicyId: 'interface.authorization.chatgpt-reading-action',
    requiredPermissions: ['chatgpt.reading.invoke'],
    sourceSafetyClass: input.sourceSafetyClass ?? 'source-safe-internal',
    sourceSafeRendererId: `chatgpt.sourceSafeRenderer.${input.actionId}`,
    inputSchema: objectSchemaFromFields(allInputFields, input.requiredFields),
    outputSchema: objectSchemaFromFields(input.responseFields, input.responseFields),
    proofRootFields: REQUIRED_PROOF_ROOT_FIELDS,
    requestRootFields: allInputFields,
    responseRootFields: input.responseFields,
    deniedStates: input.deniedStates,
    examples: [
      {
        exampleId: `${input.actionId}-success-source-safe`,
        posture: 'success_source_safe',
        fixturePath: 'packages/external-apps/chatgpt/src/__tests__/chatgpt-action-contract.test.ts',
        validationCommand:
          'pnpm --dir packages/chatgptapp exec jest --runTestsByPath src/__tests__/chatgpt-action-contract.test.ts --runInBand',
        sourceSafetyClass: input.sourceSafetyClass ?? 'source-safe-internal',
      },
      {
        exampleId: `${input.actionId}-denied-readable-repair`,
        posture: input.actionId === 'bitcode_deliver_asset_pack' ? 'denied_delivery' : 'denied_repair',
        fixturePath: 'packages/external-apps/chatgpt/src/__tests__/chatgpt-action-contract.test.ts',
        validationCommand:
          'pnpm --dir packages/chatgptapp exec jest --runTestsByPath src/__tests__/chatgpt-action-contract.test.ts --runInBand',
        sourceSafetyClass: 'source-safe-internal',
      },
    ],
  };
}

function baseDeniedStates(): BtdChatGptAppActionDeniedStateInput[] {
  return [
    {
      code: 'SCHEMA_VALIDATION_FAILED',
      readableMessage: 'The ChatGPT App action input did not match the package-owned schema.',
      repairAction: 'repair-action-arguments-to-package-schema',
    },
    {
      code: 'MISSING_READER_SESSION',
      readableMessage: 'The ChatGPT App action requires a reader session root.',
      repairAction: 'refresh-reader-session-before-continuing',
    },
  ];
}

function objectSchemaFromFields(fields: readonly string[], required: readonly string[]): Record<string, unknown> {
  const properties = Object.fromEntries(
    fields.map((field) => [
      field,
      {
        type: field === 'candidateLimit' ? 'integer' : field === 'minimumFitConfidence' ? 'number' : field === 'confirmed' ? 'boolean' : 'string',
        description: `${field} bound to the package-owned ChatGPT App action contract.`,
      },
    ]),
  );

  return {
    type: 'object',
    additionalProperties: false,
    properties,
    required: [...required],
  };
}

function buildDeniedState(
  input: BtdChatGptAppActionDeniedStateInput,
): BtdChatGptAppActionDeniedState {
  const state = {
    code: assertDeniedStateCode(input.code),
    readableMessage: assertSourceSafeString(input.readableMessage, 'readableMessage'),
    repairAction: assertSourceSafeString(input.repairAction, 'repairAction'),
  };

  return {
    ...state,
    deniedStateRoot: stableRoot('btd-chatgpt-app-denied-state', [
      state.code,
      state.readableMessage,
      state.repairAction,
    ]),
  };
}

function buildExample(input: BtdChatGptAppActionExampleInput): BtdChatGptAppActionExample {
  const example = {
    exampleId: assertSourceSafeString(input.exampleId, 'exampleId'),
    posture: assertExamplePosture(input.posture),
    fixturePath: assertSourceSafeString(input.fixturePath, 'fixturePath'),
    validationCommand: assertSourceSafeString(input.validationCommand, 'validationCommand'),
    sourceSafetyClass: assertSourceSafetyClass(input.sourceSafetyClass),
  };

  return {
    ...example,
    exampleRoot: stableRoot('btd-chatgpt-app-action-example', [
      example.exampleId,
      example.posture,
      example.fixturePath,
      example.validationCommand,
      example.sourceSafetyClass,
    ]),
  };
}

function findDeniedState(
  contract: BtdChatGptAppActionContract,
  code: BtdChatGptAppActionDeniedStateCode | undefined,
): BtdChatGptAppActionDeniedState {
  const resolvedCode = code ?? 'SCHEMA_VALIDATION_FAILED';
  const deniedState = contract.deniedStates.find((state) => state.code === resolvedCode);
  if (!deniedState) {
    throw new Error(`${contract.actionId} does not define ChatGPT denied state ${resolvedCode}.`);
  }

  return deniedState;
}

function assertActionId(actionId: string): BtdChatGptAppActionId {
  if (!BTD_CHATGPT_APP_ACTION_CONTRACT_IDS.includes(actionId as BtdChatGptAppActionId)) {
    throw new Error(`Unsupported ChatGPT App action contract id: ${actionId}.`);
  }

  return actionId as BtdChatGptAppActionId;
}

function assertFlowObject(flowObject: string): BtdChatGptAppActionFlowObject {
  if (!REQUIRED_FLOW_OBJECTS.includes(flowObject as BtdChatGptAppActionFlowObject)) {
    throw new Error(`Unsupported ChatGPT App flow object: ${flowObject}.`);
  }

  return flowObject as BtdChatGptAppActionFlowObject;
}

function assertDeniedStateCode(code: string): BtdChatGptAppActionDeniedStateCode {
  const allowed: readonly BtdChatGptAppActionDeniedStateCode[] = [
    'SCHEMA_VALIDATION_FAILED',
    'MISSING_READER_SESSION',
    'READ_NEED_REQUIRED',
    'FINDING_FITS_REQUIRED',
    'ASSET_PACK_PREVIEW_REQUIRED',
    'FEE_QUOTE_REQUIRED',
    'SETTLEMENT_REQUIRED',
    'READ_LICENSE_REQUIRED',
    'ORGANIZATION_AUTHORITY_REQUIRED',
    'CONFIRMATION_REQUIRED',
  ];
  if (!allowed.includes(code as BtdChatGptAppActionDeniedStateCode)) {
    throw new Error(`Unsupported ChatGPT App denied state code: ${code}.`);
  }

  return code as BtdChatGptAppActionDeniedStateCode;
}

function assertExamplePosture(posture: string): BtdChatGptAppActionExamplePosture {
  const allowed: readonly BtdChatGptAppActionExamplePosture[] = [
    'success_source_safe',
    'denied_schema',
    'denied_repair',
    'denied_settlement',
    'denied_delivery',
  ];
  if (!allowed.includes(posture as BtdChatGptAppActionExamplePosture)) {
    throw new Error(`Unsupported ChatGPT App example posture: ${posture}.`);
  }

  return posture as BtdChatGptAppActionExamplePosture;
}

function assertSourceSafetyClass(
  sourceSafetyClass: string,
): BtdChatGptAppActionSourceSafetyClass {
  const allowed: readonly BtdChatGptAppActionSourceSafetyClass[] = [
    'source-safe-public',
    'source-safe-internal',
    'locked-assetpack-delivery',
  ];
  if (!allowed.includes(sourceSafetyClass as BtdChatGptAppActionSourceSafetyClass)) {
    throw new Error(`Unsupported ChatGPT App source-safety class: ${sourceSafetyClass}.`);
  }

  return sourceSafetyClass as BtdChatGptAppActionSourceSafetyClass;
}

function assertProofRootFields(fields: readonly string[]): string[] {
  const deduped = assertStringList(fields, 'proofRootField');
  const missing = REQUIRED_PROOF_ROOT_FIELDS.filter((field) => !deduped.includes(field));
  if (missing.length) {
    throw new Error(`ChatGPT App action contract missing proof-root fields: ${missing.join(', ')}.`);
  }

  return deduped;
}

function assertStringList(values: readonly string[], label: string): string[] {
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error(`${label} requires at least one value.`);
  }

  return Array.from(new Set(values.map((value) => assertSourceSafeString(value, label)))).sort();
}

function assertProofRootProjection(values: Record<string, unknown>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [
      assertSourceSafeString(key, 'proofRootProjectionKey'),
      assertSourceSafeString(value, 'proofRootProjectionValue'),
    ]),
  );
}

function assertSourceSafeRecord(value: Record<string, unknown>, label: string): Record<string, unknown> {
  const text = stableJson(value);
  if (SECRET_OR_SOURCE_PATTERNS.some((pattern) => pattern.test(text))) {
    throw new Error(`${label} must not contain secrets or locked source contents.`);
  }

  return value;
}

function assertSourceSafeString(value: unknown, label: string): string {
  const text = assertNonEmptyString(value, label);
  if (SECRET_OR_SOURCE_PATTERNS.some((pattern) => pattern.test(text))) {
    throw new Error(`${label} must not contain secrets or locked source contents.`);
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

function stableJson(value: unknown): string {
  return JSON.stringify(sortJson(value));
}

function sortJson(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortJson);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, entry]) => [key, sortJson(entry)]),
    );
  }

  return value;
}

function stableRoot(prefix: string, parts: string[]): string {
  const hash = createHash('sha256').update(parts.join('\u001f')).digest('hex').slice(0, 24);
  return `${prefix}:${hash}`;
}

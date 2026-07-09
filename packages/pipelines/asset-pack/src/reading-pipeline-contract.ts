export const READ_NEED_COMPREHENSION_SYNTHESIS = 'ReadNeedComprehensionSynthesis' as const;
export const READ_FITS_FINDING_SYNTHESIS = 'ReadFitsFindingSynthesis' as const;

export type ReadingPipelineName =
  | typeof READ_NEED_COMPREHENSION_SYNTHESIS
  | typeof READ_FITS_FINDING_SYNTHESIS;

export type ReadingPipelinePtrrStepName = 'plan' | 'try' | 'refine' | 'retry';

export type ReadingPipelineThinkingsFailsafe =
  | 'prepare-concise-context'
  | 'chunk-then-sum'
  | 'stitch-until-complete';

export type ReadingPipelinePtrrStepKind =
  | 'deterministic'
  | 'model-structured'
  | 'tool'
  | 'review'
  | 'settlement';

export type ReadingPipelinePromptContract = {
  templateId: string;
  template: string;
  interpolatedContextKeys: string[];
};

export type ReadingPipelineToolContract = {
  toolId: string;
  inputType: string;
  outputType: string;
};

export type ReadingPipelineThinkingsGenerationContract = {
  thinkingsGenerationId: string;
  failsafe: ReadingPipelineThinkingsFailsafe;
  reasonPromptId: string;
  judgePromptId: string;
  structuredOutputPromptId: string;
  returnTypes: {
    reason: 'Reasoning';
    judge: 'Judgment';
    structuredOutput: string;
  };
  stores: string[];
  telemetry: string[];
};

export type ReadingPipelinePtrrStepContract = {
  ptrrStepName: ReadingPipelinePtrrStepName;
  ptrrStepId: string;
  purpose: string;
  thinkingsGenerationIds: string[];
  thinkingsGenerations: ReadingPipelineThinkingsGenerationContract[];
  kind: ReadingPipelinePtrrStepKind;
  prompt?: ReadingPipelinePromptContract;
  tools: ReadingPipelineToolContract[];
  inputType: string;
  outputType: string;
  stores: string[];
  telemetry: string[];
};

export type ReadingPipelineAgentContract = {
  kind: 'ptrr-agent';
  agentId: string;
  objectiveId: string;
  returnType: string;
  promptRegistry: {
    factory: 'factoryAgentWithPTRR';
    carrier: 'prompt+stepPrompts';
    agentPromptId: string;
    ptrrStepPromptIds: Record<ReadingPipelinePtrrStepName, string>;
    promptPartNamespaces: {
      agent: 'agent/*';
      ptrrStep: 'ptrr/*/purpose';
      generation: 'generation:*';
      failsafe: 'failsafe:*';
    };
  };
  ptrrSteps: ReadingPipelinePtrrStepContract[];
};

export type ReadingPipelinePhaseContract = {
  phaseId: string;
  stores: string[];
  agents: ReadingPipelineAgentContract[];
};

export type ReadingPipelineContract = {
  pipelineName: ReadingPipelineName;
  purpose: string;
  uxStepIds: string[];
  phases: ReadingPipelinePhaseContract[];
};

export type ReadingPipelineContractSummary = {
  pipelineName: ReadingPipelineName;
  phaseCount: number;
  agentCount: number;
  ptrrAgentCount: number;
  ptrrStepCount: number;
  modelStructuredPtrrStepCount: number;
  thinkingsGenerationCount: number;
  toolCount: number;
  returnTypes: string[];
};

export type ReadingPipelineTelemetryTraceEntry = {
  pipelineName: ReadingPipelineName;
  phaseId: string;
  agentId: string;
  ptrrStepId: string;
  ptrrStepName: ReadingPipelinePtrrStepName;
  kind: ReadingPipelinePtrrStepKind;
  inputType: string;
  outputType: string;
  returnType: string;
  toolIds: string[];
  thinkingsGenerationIds: string[];
  thinkingsGenerations: ReadingPipelineThinkingsGenerationContract[];
  stores: string[];
  telemetry: string[];
};

const READ_NEED_PROMPT_TEMPLATE = [
  'You are the ReadNeedComprehensionSynthesis Need-framing agent.',
  'Synthesize exactly what the reader asked Bitcode to read, no more and no less.',
  'Return requirements, closure criteria, failure modes, target artifact kinds, source constraints, proof expectations, and pricing measurement inputs.',
  'Do not search deposits, reveal protected source, quote final settlement, or claim a fit before user Need acceptance.',
].join('\n');

const READ_FITS_FINDING_PROMPT_TEMPLATE = [
  'You are the ReadFitsFindingSynthesis AssetPack synthesis agent.',
  'Use only the accepted Read-Need, many-candidate Depository search evidence, selected fit deposit asset ids, source revision, and source-safe proof/readback roots.',
  'Return worthy_fit, no_worthy_fit, or blocked_readiness with query synthesis, search breadth, ranking, selected-fit provenance, synthesis, validation, preview, quote, and settlement-readiness evidence.',
  'Before settlement expose only AssetPack measurements, fit provenance, quote, and source-safe preview metadata; do not expose unpaid AssetPack source.',
  'Do not claim BTC finality, BTD rights transfer, ledger settlement, or source-bearing delivery without readback and delivery unlock.',
].join('\n');

const readNeedTelemetry = (suffix: string) => `${READ_NEED_COMPREHENSION_SYNTHESIS}.telemetry.${suffix}`;
const readFitsFindingTelemetry = (suffix: string) => `${READ_FITS_FINDING_SYNTHESIS}.telemetry.${suffix}`;

const PTRR_STEP_NAMES: ReadingPipelinePtrrStepName[] = ['plan', 'try', 'refine', 'retry'];
const THINKINGS_FAILSAFES: ReadingPipelineThinkingsFailsafe[] = [
  'prepare-concise-context',
  'chunk-then-sum',
  'stitch-until-complete',
];

const PTRR_STEP_PURPOSE: Record<ReadingPipelinePtrrStepName, string> = {
  plan: 'Plan the typed result and evidence path before attempting the agent objective.',
  try: 'Attempt the agent objective with the registered prompt, tools, and typed output schema.',
  refine: 'Judge and improve the attempted result against the objective, context, and schema.',
  retry: 'Recover from failed or incomplete attempts and return the safest typed result.',
};

type PTRRAgentConfig = {
  pipelineName: ReadingPipelineName;
  phaseKey: string;
  agentKey: string;
  objectiveId: string;
  kind: ReadingPipelinePtrrStepKind;
  returnType: string;
  inputType: string;
  outputType?: string;
  prompt?: ReadingPipelinePromptContract;
  tools?: ReadingPipelineToolContract[];
  stores: string[];
  telemetry: string[];
};

function ptrrPromptRegistry(
  pipelineName: ReadingPipelineName,
  phaseKey: string,
  agentKey: string,
): ReadingPipelineAgentContract['promptRegistry'] {
  const promptPrefix = `${pipelineName}.prompt.${phaseKey}.${agentKey}`;
  return {
    factory: 'factoryAgentWithPTRR',
    carrier: 'prompt+stepPrompts',
    agentPromptId: `${promptPrefix}.agent`,
    ptrrStepPromptIds: {
      plan: `${promptPrefix}.plan`,
      try: `${promptPrefix}.try`,
      refine: `${promptPrefix}.refine`,
      retry: `${promptPrefix}.retry`,
    },
    promptPartNamespaces: {
      agent: 'agent/*',
      ptrrStep: 'ptrr/*/purpose',
      generation: 'generation:*',
      failsafe: 'failsafe:*',
    },
  };
}

function thinkingsGenerationsForPtrrStep(
  config: PTRRAgentConfig,
  ptrrStepName: ReadingPipelinePtrrStepName,
  outputType: string,
): ReadingPipelineThinkingsGenerationContract[] {
  return THINKINGS_FAILSAFES.map((failsafe) => {
    const baseId = `${config.pipelineName}.thinkings-generation.${config.phaseKey}.${config.agentKey}.${ptrrStepName}.${failsafe}`;
    const promptBaseId = `${config.pipelineName}.prompt.${config.phaseKey}.${config.agentKey}.${ptrrStepName}.${failsafe}`;
    return {
      thinkingsGenerationId: baseId,
      failsafe,
      reasonPromptId: `${promptBaseId}.reason`,
      judgePromptId: `${promptBaseId}.judge`,
      structuredOutputPromptId: `${promptBaseId}.structured-output`,
      returnTypes: {
        reason: 'Reasoning',
        judge: 'Judgment',
        structuredOutput: outputType,
      },
      stores: [
        ...config.stores,
        `${baseId}.reasoning`,
        `${baseId}.judgment`,
        `${baseId}.typed-output`,
      ],
      telemetry: [
        ...config.telemetry,
        `${config.pipelineName}.telemetry.${config.phaseKey}.${config.agentKey}.${ptrrStepName}.${failsafe}.reasoning`,
        `${config.pipelineName}.telemetry.${config.phaseKey}.${config.agentKey}.${ptrrStepName}.${failsafe}.judgment`,
        `${config.pipelineName}.telemetry.${config.phaseKey}.${config.agentKey}.${ptrrStepName}.${failsafe}.typed-output`,
      ],
    };
  });
}

function ptrrAgent(config: PTRRAgentConfig): ReadingPipelineAgentContract {
  const agentId = `${config.pipelineName}.${config.phaseKey}.${config.agentKey}`;
  const outputType = config.outputType || config.returnType;
  return {
    kind: 'ptrr-agent',
    agentId,
    objectiveId: config.objectiveId,
    returnType: config.returnType,
    promptRegistry: ptrrPromptRegistry(config.pipelineName, config.phaseKey, config.agentKey),
    ptrrSteps: PTRR_STEP_NAMES.map((ptrrStepName) => {
      // Step outputs validate against STEP schemas, not the full agent
      // schema: the plan step returns the canonical plan shape
      // (PlanStepOutput); try/refine/retry return the agent's output type.
      const stepOutputType = ptrrStepName === 'plan' ? 'PlanStepOutput' : outputType;
      const thinkingsGenerations = thinkingsGenerationsForPtrrStep(config, ptrrStepName, stepOutputType);
      return {
        ptrrStepName,
        ptrrStepId: `${agentId}.${ptrrStepName}`,
        purpose: PTRR_STEP_PURPOSE[ptrrStepName],
        thinkingsGenerationIds: thinkingsGenerations.map((generation) => generation.thinkingsGenerationId),
        thinkingsGenerations,
        kind: config.kind,
        prompt: config.prompt,
        tools: ptrrStepName === 'try' ? config.tools || [] : [],
        inputType: config.inputType,
        outputType: stepOutputType,
        stores: config.stores,
        telemetry: config.telemetry,
      };
    }),
  };
}

export const READ_NEED_COMPREHENSION_SYNTHESIS_CONTRACT: ReadingPipelineContract = {
  pipelineName: READ_NEED_COMPREHENSION_SYNTHESIS,
  purpose:
    'Turn an enterprise Read Request into a reviewed, measured, source-constrained Need before ReadFitsFindingSynthesis can run.',
  uxStepIds: ['request-read', 'review-synthesized-need'],
  phases: [
    {
      phaseId: 'ReadNeedComprehensionSynthesis.request',
      stores: ['read/request.raw', 'read/source-revision.input'],
      agents: [
        ptrrAgent({
          pipelineName: READ_NEED_COMPREHENSION_SYNTHESIS,
          phaseKey: 'request',
          agentKey: 'normalize',
          objectiveId: 'ReadNeedComprehensionSynthesis.request.normalize.objective',
          kind: 'deterministic',
          returnType: 'ReadNeedSourceInput',
          inputType: 'TerminalReadRequest',
          stores: ['read/request.normalized', 'read/source-revision.normalized'],
          telemetry: [
            readNeedTelemetry('prompt-input'),
            readNeedTelemetry('source-revision'),
            readNeedTelemetry('target-artifact-kinds'),
          ],
        }),
      ],
    },
    {
      phaseId: 'ReadNeedComprehensionSynthesis.comprehend',
      stores: ['read/need.prompt-template', 'read/need.interpolated-context'],
      agents: [
        ptrrAgent({
          pipelineName: READ_NEED_COMPREHENSION_SYNTHESIS,
          phaseKey: 'comprehend',
          agentKey: 'need-synthesizer',
          objectiveId: 'ReadNeedComprehensionSynthesis.comprehend.need-synthesizer.objective',
          kind: 'model-structured',
          prompt: {
            templateId: 'ReadNeedComprehensionSynthesis.prompt.need-synthesis',
            template: READ_NEED_PROMPT_TEMPLATE,
            interpolatedContextKeys: [
              'read.prompt',
              'sourceConstraints',
              'targetArtifactKinds',
              'closureCriteria',
              'feedbackHistory',
            ],
          },
          returnType: 'ReadNeed',
          inputType: 'ReadNeedSourceInput',
          stores: ['read/need.current', 'read/need.measurementRoot', 'read/need.reviewState'],
          telemetry: [
            readNeedTelemetry('prompt-template'),
            readNeedTelemetry('interpolated-prompt'),
            readNeedTelemetry('raw-model-response'),
            readNeedTelemetry('parsed-typed-output'),
            readNeedTelemetry('schema-name'),
          ],
        }),
      ],
    },
    {
      phaseId: 'ReadNeedComprehensionSynthesis.measure',
      stores: ['read/need.measurement-vector', 'read/need.pricing-inputs'],
      agents: [
        ptrrAgent({
          pipelineName: READ_NEED_COMPREHENSION_SYNTHESIS,
          phaseKey: 'measure',
          agentKey: 'need-measurement',
          objectiveId: 'ReadNeedComprehensionSynthesis.measure.need-measurement.objective',
          kind: 'deterministic',
          returnType: 'ReadNeedPricingMeasurementInputs',
          inputType: 'ReadNeed',
          stores: ['read/need.measurementVector', 'read/need.weightedRequestedVolume'],
          telemetry: [
            readNeedTelemetry('measurement-vector'),
            readNeedTelemetry('weighted-requested-volume'),
            readNeedTelemetry('measurement-root'),
          ],
        }),
      ],
    },
    {
      phaseId: 'ReadNeedComprehensionSynthesis.review',
      stores: ['read/need.feedback-history', 'read/need.acceptance-root', 'read/need.rejection-root'],
      agents: [
        ptrrAgent({
          pipelineName: READ_NEED_COMPREHENSION_SYNTHESIS,
          phaseKey: 'review',
          agentKey: 'operator-review',
          objectiveId: 'ReadNeedComprehensionSynthesis.review.operator-review.objective',
          kind: 'review',
          returnType: 'ReadNeedReviewState',
          inputType: 'ReadNeed',
          outputType: 'AcceptedReadNeed | RejectedReadNeed | ResynthesisRequestedReadNeed',
          stores: ['read/need.accepted', 'read/need.rejected', 'read/need.feedbackHistory', 'read/need.acceptanceRoot', 'read/need.rejectionRoot'],
          telemetry: [
            readNeedTelemetry('review-state'),
            readNeedTelemetry('accepted-at'),
            readNeedTelemetry('acceptance-root'),
            readNeedTelemetry('rejected-at'),
            readNeedTelemetry('rejection-root'),
            readNeedTelemetry('feedback-history'),
          ],
        }),
      ],
    },
  ],
};

export const READ_FITS_FINDING_SYNTHESIS_CONTRACT: ReadingPipelineContract = {
  pipelineName: READ_FITS_FINDING_SYNTHESIS,
  purpose:
    'Search the Bitcode Depository with an accepted Need, synthesize a source-safe AssetPack preview, and prepare settlement-bound delivery evidence.',
  uxStepIds: ['request-fit', 'review-synthesized-asset-pack', 'buy-asset-pack-settle'],
  phases: [
    {
      phaseId: 'ReadFitsFindingSynthesis.admit',
      stores: ['read/need.accepted', 'fit/admission'],
      agents: [
        ptrrAgent({
          pipelineName: READ_FITS_FINDING_SYNTHESIS,
          phaseKey: 'admit',
          agentKey: 'accepted-need-gate',
          objectiveId: 'ReadFitsFindingSynthesis.admit.accepted-need-gate.objective',
          kind: 'deterministic',
          returnType: 'ReadFitsFindingAdmission',
          inputType: 'AcceptedReadNeed',
          stores: ['fit/admission.result'],
          telemetry: [
            readFitsFindingTelemetry('need-id'),
            readFitsFindingTelemetry('measurement-root'),
            readFitsFindingTelemetry('blockers'),
            readFitsFindingTelemetry('admitted'),
          ],
        }),
      ],
    },
    {
      phaseId: 'ReadFitsFindingSynthesis.prepare',
      stores: ['setup.plan', 'setup/read-comprehension.model', 'setup/danger-wall.result'],
      agents: [
        ptrrAgent({
          pipelineName: READ_FITS_FINDING_SYNTHESIS,
          phaseKey: 'prepare',
          agentKey: 'setup-plan',
          objectiveId: 'ReadFitsFindingSynthesis.prepare.setup-plan.objective',
          kind: 'model-structured',
          prompt: {
            templateId: 'ReadFitsFindingSynthesis.prompt.setup-plan',
            template:
              'Produce one concise source-bound plan for the accepted Need to Finding Fits run: many-candidate Depository search, ranking, selected-fit provenance, source-safe AssetPack preview, quote, and settlement readiness. Do not claim settlement, delivery, or finality.',
            interpolatedContextKeys: ['acceptedReadNeed', 'read', 'repository', 'sourceRevision', 'fitResult', 'searchObjectives'],
          },
          returnType: 'PlanSchema',
          inputType: 'AcceptedReadNeed + SourceRevision',
          stores: ['setup.plan', 'setup/plan.result'],
          telemetry: [
            readFitsFindingTelemetry('prompt-template'),
            readFitsFindingTelemetry('interpolated-prompt'),
            readFitsFindingTelemetry('raw-model-response'),
            readFitsFindingTelemetry('parsed-typed-output'),
          ],
        }),
        ptrrAgent({
          pipelineName: READ_FITS_FINDING_SYNTHESIS,
          phaseKey: 'prepare',
          agentKey: 'read-comprehension',
          objectiveId: 'ReadFitsFindingSynthesis.prepare.read-comprehension.objective',
          kind: 'model-structured',
          prompt: {
            templateId: 'ReadFitsFindingSynthesis.prompt.read-comprehension',
            template:
              'Translate the accepted Need and expressed Read into one auditable model for Finding Fits search, ranking, and AssetPack synthesis context. Return source-bound evidence only.',
            interpolatedContextKeys: ['acceptedReadNeed', 'read', 'definitionOfRead', 'repository', 'sourceRevision', 'sourceConstraints', 'deposit', 'fitResult'],
          },
          returnType: 'BoundedReadComprehensionSchema',
          inputType: 'AcceptedReadNeed + DepositorySearchBaseline',
          stores: ['setup/read-comprehension.model', 'setup/read-comprehension.riskAdmissionInput'],
          telemetry: [
            readFitsFindingTelemetry('prompt-template'),
            readFitsFindingTelemetry('interpolated-prompt'),
            readFitsFindingTelemetry('raw-model-response'),
            readFitsFindingTelemetry('parsed-typed-output'),
          ],
        }),
      ],
    },
    {
      phaseId: 'ReadFitsFindingSynthesis.discovery',
      stores: ['depository/search.result', 'fit/result'],
      agents: [
        ptrrAgent({
          pipelineName: READ_FITS_FINDING_SYNTHESIS,
          phaseKey: 'discovery',
          agentKey: 'finding-fits',
          objectiveId: 'ReadFitsFindingSynthesis.discovery.finding-fits.objective',
          kind: 'tool',
          tools: [
            {
              toolId: 'ReadFitsFindingSynthesis.tool.lexical-depository-search',
              inputType: 'DepositorySearchRead',
              outputType: 'DepositorySearchResult',
            },
            {
              toolId: 'ReadFitsFindingSynthesis.tool.vector-depository-search',
              inputType: 'EmbeddingSearchRequest',
              outputType: 'EmbeddingSearchResult',
            },
          ],
          returnType: 'DepositoryFitsResult',
          inputType: 'AcceptedReadNeed',
          stores: [
            'depository/search.result',
            'depository/search.queryRoot',
            'depository/search.rankingRoot',
            'fit/deposits',
            'fit/depositAssetIds',
          ],
          telemetry: [
            readFitsFindingTelemetry('tool-input'),
            readFitsFindingTelemetry('tool-output'),
            readFitsFindingTelemetry('query-root'),
            readFitsFindingTelemetry('ranking-root'),
            readFitsFindingTelemetry('fit-deposit-ranking'),
          ],
        }),
      ],
    },
    {
      phaseId: 'ReadFitsFindingSynthesis.implementation',
      stores: ['implementation.assetPack', 'implementation.assetPackSynthesisArtifacts'],
      agents: [
        ptrrAgent({
          pipelineName: READ_FITS_FINDING_SYNTHESIS,
          phaseKey: 'implementation',
          agentKey: 'asset-pack',
          objectiveId: 'ReadFitsFindingSynthesis.implementation.asset-pack.objective',
          kind: 'model-structured',
          prompt: {
            templateId: 'ReadFitsFindingSynthesis.prompt.asset-pack-synthesis',
            template: READ_FITS_FINDING_PROMPT_TEMPLATE,
            interpolatedContextKeys: [
              'acceptedReadNeed',
              'depositorySearchResult',
              'fitDepositAssetIds',
              'fitDeposits',
              'selectedFitProvenanceRoot',
              'sourceRevision',
              'sourceSafeBoundary',
              'deliveryMechanismTemplate',
            ],
          },
          returnType: 'AssetPackSynthesisOutput',
          inputType: 'AcceptedReadNeed + DepositoryFitsResult',
          stores: ['implementation.assetPack', 'implementation.writtenAssets'],
          telemetry: [
            readFitsFindingTelemetry('prompt-template'),
            readFitsFindingTelemetry('interpolated-prompt'),
            readFitsFindingTelemetry('raw-model-response'),
            readFitsFindingTelemetry('parsed-typed-output'),
            readFitsFindingTelemetry('usage'),
          ],
        }),
      ],
    },
    {
      phaseId: 'ReadFitsFindingSynthesis.validate',
      stores: ['validation.discovery.issues', 'validation.implementation.issues', 'validation.readyToFinish'],
      agents: [
        ptrrAgent({
          pipelineName: READ_FITS_FINDING_SYNTHESIS,
          phaseKey: 'validate',
          agentKey: 'fit-quality',
          objectiveId: 'ReadFitsFindingSynthesis.validate.fit-quality.objective',
          kind: 'model-structured',
          prompt: {
            templateId: 'ReadFitsFindingSynthesis.prompt.fit-quality-validation',
            template:
              'Validate the source-bound AssetPack synthesized from qualifying fit deposits against the accepted Need, many-candidate search proof, selected-fit provenance, disclosure policy, quote posture, and finish-readiness gates.',
            interpolatedContextKeys: [
              'acceptedReadNeed',
              'depositorySearchResult',
              'assetPackSynthesisOutput',
              'sourceSafePreview',
            ],
          },
          tools: [
            {
              toolId: 'ReadFitsFindingSynthesis.tool.verification-evidence',
              inputType: 'AssetPackVerificationEvidenceInput',
              outputType: 'AssetPackVerificationEvidenceResult',
            },
          ],
          returnType: 'ReadyToFinishOutput',
          inputType: 'AssetPackSynthesisOutput',
          stores: ['validation.readyToFinish', 'validation.selfInstruction'],
          telemetry: [
            readFitsFindingTelemetry('prompt-template'),
            readFitsFindingTelemetry('interpolated-prompt'),
            readFitsFindingTelemetry('raw-model-response'),
            readFitsFindingTelemetry('validation-issues'),
            readFitsFindingTelemetry('tool-input'),
            readFitsFindingTelemetry('tool-output'),
            readFitsFindingTelemetry('parsed-typed-output'),
          ],
        }),
      ],
    },
    {
      phaseId: 'ReadFitsFindingSynthesis.preview',
      stores: ['asset-pack/preview.sourceSafe', 'asset-pack/preview.feeQuote'],
      agents: [
        ptrrAgent({
          pipelineName: READ_FITS_FINDING_SYNTHESIS,
          phaseKey: 'preview',
          agentKey: 'source-safe-preview',
          objectiveId: 'ReadFitsFindingSynthesis.preview.source-safe-preview.objective',
          kind: 'deterministic',
          returnType: 'AssetPackSourceSafePreview',
          inputType: 'ReadNeed + DepositoryFitResultEvidence',
          stores: ['asset-pack/preview.sourceSafe', 'asset-pack/preview.feeQuote'],
          telemetry: [
            readFitsFindingTelemetry('fee-quote'),
            readFitsFindingTelemetry('range-projection'),
            readFitsFindingTelemetry('disclosure-policy'),
            readFitsFindingTelemetry('access-policy'),
          ],
        }),
      ],
    },
    {
      phaseId: 'ReadFitsFindingSynthesis.settle',
      stores: ['ledger.settlement', 'finish.deliveryMechanism', 'finish.asset_pack_completion'],
      agents: [
        ptrrAgent({
          pipelineName: READ_FITS_FINDING_SYNTHESIS,
          phaseKey: 'settle',
          agentKey: 'buy-deliver',
          objectiveId: 'ReadFitsFindingSynthesis.settle.buy-deliver.objective',
          kind: 'settlement',
          tools: [
            {
              toolId: 'ReadFitsFindingSynthesis.tool.vcs-create-pull-request',
              inputType: 'PullRequestDeliveryInput',
              outputType: 'PullRequestDeliveryResult',
            },
          ],
          returnType: 'AssetPackCompletionOutput',
          inputType: 'AssetPackSourceSafePreview',
          stores: ['ledger.settlement', 'finish.pullRequestUrl', 'finish.asset_pack_completion.result'],
          telemetry: [
            readFitsFindingTelemetry('btc-fee-receipt'),
            readFitsFindingTelemetry('range-readback'),
            readFitsFindingTelemetry('license-readback'),
            readFitsFindingTelemetry('journal-entry-ids'),
            readFitsFindingTelemetry('tool-input'),
            readFitsFindingTelemetry('tool-output'),
            readFitsFindingTelemetry('pull-request'),
          ],
        }),
      ],
    },
  ],
};

export const READING_PIPELINE_CONTRACTS = [
  READ_NEED_COMPREHENSION_SYNTHESIS_CONTRACT,
  READ_FITS_FINDING_SYNTHESIS_CONTRACT,
] as const;

export function summarizeReadingPipelineContract(
  contract: ReadingPipelineContract,
): ReadingPipelineContractSummary {
  const agents = contract.phases.flatMap((phase) => phase.agents);
  const steps = agents.flatMap((agent) => agent.ptrrSteps);
  const thinkingsGenerations = steps.flatMap((step) => step.thinkingsGenerations);
  const tools = steps.flatMap((step) => step.tools);
  const returnTypes = [...new Set(agents.map((agent) => agent.returnType).concat(steps.map((step) => step.outputType)))].sort();
  return {
    pipelineName: contract.pipelineName,
    phaseCount: contract.phases.length,
    agentCount: agents.length,
    ptrrAgentCount: agents.filter((agent) => agent.kind === 'ptrr-agent').length,
    ptrrStepCount: steps.length,
    modelStructuredPtrrStepCount: steps.filter((step) => step.kind === 'model-structured').length,
    thinkingsGenerationCount: thinkingsGenerations.length,
    toolCount: tools.length,
    returnTypes,
  };
}

export function listReadingPipelineContractSummaries(): ReadingPipelineContractSummary[] {
  return READING_PIPELINE_CONTRACTS.map((contract) => summarizeReadingPipelineContract(contract));
}

export function listReadingPipelineTelemetryTrace(
  contract: ReadingPipelineContract,
): ReadingPipelineTelemetryTraceEntry[] {
  return contract.phases.flatMap((phase) =>
    phase.agents.flatMap((agent) =>
      agent.ptrrSteps.map((ptrrStep) => ({
        pipelineName: contract.pipelineName,
        phaseId: phase.phaseId,
        agentId: agent.agentId,
        ptrrStepId: ptrrStep.ptrrStepId,
        ptrrStepName: ptrrStep.ptrrStepName,
        kind: ptrrStep.kind,
        inputType: ptrrStep.inputType,
        outputType: ptrrStep.outputType,
        returnType: agent.returnType,
        toolIds: ptrrStep.tools.map((tool) => tool.toolId),
        thinkingsGenerationIds: ptrrStep.thinkingsGenerationIds,
        thinkingsGenerations: ptrrStep.thinkingsGenerations,
        stores: [...new Set([...phase.stores, ...ptrrStep.stores])],
        telemetry: [...new Set(ptrrStep.telemetry)],
      })),
    ),
  );
}

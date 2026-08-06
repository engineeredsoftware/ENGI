import {
  READ_FITS_FINDING_SYNTHESIS,
  READ_NEED_COMPREHENSION_SYNTHESIS,
  READING_PIPELINE_CONTRACTS,
  type ReadingPipelineName,
  type ReadingPipelinePtrrStepContract,
  type ReadingPipelinePtrrStepName,
  type ReadingPipelineTelemetryTraceEntry,
  type ReadingPipelineThinkingsFailsafe,
  type ReadingPipelineToolContract,
  listReadingPipelineContractSummaries,
  listReadingPipelineTelemetryTrace,
} from './reading-pipeline-contract';

export const READING_PIPELINE_TELEMETRY_LEVELS = [
  'execution',
  'phase',
  'ptrr-agent',
  'ptrr-step',
  'thinkings-generation',
  'prompt',
  'tool',
  'raw-output',
  'parsed-output',
] as const;

export type ReadingPipelineTelemetryLevel = (typeof READING_PIPELINE_TELEMETRY_LEVELS)[number];

export type ReadingPipelineTelemetryProjection = {
  schema: 'bitcode.reading.pipeline.telemetry.projection';
  pipelineName: ReadingPipelineName | null;
  level: ReadingPipelineTelemetryLevel;
  phaseId: string | null;
  agentId: string | null;
  ptrrStepId: string | null;
  ptrrStepName: ReadingPipelinePtrrStepName | null;
  thinkingsGenerationId: string | null;
  thinkingsFailsafe: ReadingPipelineThinkingsFailsafe | null;
  promptTemplateId: string | null;
  generationPromptIds: {
    reasonPromptId: string | null;
    judgePromptId: string | null;
    structuredOutputPromptId: string | null;
  };
  toolId: string | null;
  inputType: string | null;
  outputType: string | null;
  returnType: string | null;
  outputSchema: string | null;
  stores: string[];
  telemetry: string[];
  evidence: {
    promptTemplatePresent: boolean;
    interpolatedPromptPresent: boolean;
    reasoningPresent: boolean;
    judgmentPresent: boolean;
    rawModelResponsePresent: boolean;
    parsedTypedOutputPresent: boolean;
    toolInputPresent: boolean;
    toolOutputPresent: boolean;
    toolErrorPresent: boolean;
  };
  matched: boolean;
};

export type ReadingPipelineObservabilityInventory = {
  schema: 'bitcode.reading.pipeline.observability.inventory';
  pipelineNames: ReadingPipelineName[];
  telemetryLevels: ReadingPipelineTelemetryLevel[];
  summaries: ReturnType<typeof listReadingPipelineContractSummaries>;
  totals: {
    pipelines: number;
    phases: number;
    ptrrAgents: number;
    ptrrSteps: number;
    thinkingsGenerations: number;
    promptTemplates: number;
    thinkingsGenerationPrompts: number;
    tools: number;
  };
  traceEntries: ReadingPipelineTelemetryTraceEntry[];
};

export type ReadingPipelineObservabilityCoverage = {
  schema: 'bitcode.reading.pipeline.observability.coverage';
  eventCount: number;
  matchedEventCount: number;
  pipelineNames: ReadingPipelineName[];
  levelCounts: Record<ReadingPipelineTelemetryLevel, number>;
  missingRequiredLevels: ReadingPipelineTelemetryLevel[];
  promptTelemetryReady: boolean;
  toolTelemetryReady: boolean;
  rawOutputTelemetryReady: boolean;
  parsedOutputTelemetryReady: boolean;
};

type IndexedTrace = ReadingPipelineTelemetryTraceEntry & {
  agentKey: string;
  phaseKey: string;
  ptrrStep: ReadingPipelinePtrrStepContract | null;
};

type ProjectionSource = {
  data: Record<string, unknown> | null;
  executionState: Record<string, unknown> | null;
  executionPath: string[];
  textCandidates: string[];
  explicitPipelineName: ReadingPipelineName | null;
  explicitPhaseId: string | null;
  explicitAgentId: string | null;
  explicitPtrrStepId: string | null;
  explicitThinkingsGenerationId: string | null;
  explicitToolId: string | null;
};

const TRACE_INDEX: IndexedTrace[] = READING_PIPELINE_CONTRACTS.flatMap((contract) =>
  listReadingPipelineTelemetryTrace(contract).map((trace) => {
    const phaseKey = trace.phaseId.split('.').pop() || trace.phaseId;
    const agentKey = trace.agentId.split('.').pop() || trace.agentId;
    const phase = contract.phases.find((candidatePhase) => candidatePhase.phaseId === trace.phaseId);
    const agent = phase?.agents.find((candidateAgent) => candidateAgent.agentId === trace.agentId);
    const ptrrStep = agent?.ptrrSteps.find((candidateStep) => candidateStep.ptrrStepId === trace.ptrrStepId) || null;
    return {
      ...trace,
      phaseKey,
      agentKey,
      ptrrStep,
    };
  }),
);

const READING_PIPELINE_NAMES = [
  READ_NEED_COMPREHENSION_SYNTHESIS,
  READ_FITS_FINDING_SYNTHESIS,
] as const;

export function buildReadingPipelineObservabilityInventory(): ReadingPipelineObservabilityInventory {
  const phases = READING_PIPELINE_CONTRACTS.flatMap((contract) => contract.phases);
  const agents = phases.flatMap((phase) => phase.agents);
  const ptrrSteps = agents.flatMap((agent) => agent.ptrrSteps);
  const thinkingsGenerations = ptrrSteps.flatMap((step) => step.thinkingsGenerations);
  const promptTemplateIds = new Set(ptrrSteps.map((step) => step.prompt?.templateId).filter(Boolean));
  const thinkingsGenerationPromptIds = new Set(
    thinkingsGenerations.flatMap((generation) => [
      generation.reasonPromptId,
      generation.judgePromptId,
      generation.structuredOutputPromptId,
    ]),
  );
  const toolIds = new Set(ptrrSteps.flatMap((step) => step.tools.map((tool) => tool.toolId)));

  return {
    schema: 'bitcode.reading.pipeline.observability.inventory',
    pipelineNames: [...READING_PIPELINE_NAMES],
    telemetryLevels: [...READING_PIPELINE_TELEMETRY_LEVELS],
    summaries: listReadingPipelineContractSummaries(),
    totals: {
      pipelines: READING_PIPELINE_CONTRACTS.length,
      phases: phases.length,
      ptrrAgents: agents.length,
      ptrrSteps: ptrrSteps.length,
      thinkingsGenerations: thinkingsGenerations.length,
      promptTemplates: promptTemplateIds.size,
      thinkingsGenerationPrompts: thinkingsGenerationPromptIds.size,
      tools: toolIds.size,
    },
    traceEntries: TRACE_INDEX.map(({ agentKey, phaseKey, ptrrStep, ...trace }) => trace),
  };
}

export function resolveReadingPipelineTelemetryProjection(
  eventLike: unknown,
): ReadingPipelineTelemetryProjection {
  const source = normalizeProjectionSource(eventLike);
  const matchedTrace = findMatchingTrace(source);
  const generation = findMatchingThinkingsGeneration(source, matchedTrace);
  const tool = findMatchingTool(source, matchedTrace);
  const ptrrStep = matchedTrace?.ptrrStep || null;
  const pipelineName = source.explicitPipelineName || matchedTrace?.pipelineName || inferPipelineName(source) || null;
  const level = resolveTelemetryLevel(source, Boolean(matchedTrace), Boolean(generation), Boolean(tool));

  return {
    schema: 'bitcode.reading.pipeline.telemetry.projection',
    pipelineName,
    level,
    phaseId: source.explicitPhaseId || matchedTrace?.phaseId || null,
    agentId: source.explicitAgentId || matchedTrace?.agentId || null,
    ptrrStepId: source.explicitPtrrStepId || matchedTrace?.ptrrStepId || null,
    ptrrStepName: matchedTrace?.ptrrStepName || stepNameFromId(source.explicitPtrrStepId),
    thinkingsGenerationId:
      source.explicitThinkingsGenerationId ||
      generation?.thinkingsGenerationId ||
      null,
    thinkingsFailsafe: generation?.failsafe || failsafeFromId(source.explicitThinkingsGenerationId),
    promptTemplateId: valueAsString(source.data?.promptTemplateId) || ptrrStep?.prompt?.templateId || null,
    generationPromptIds: {
      reasonPromptId: generation?.reasonPromptId || null,
      judgePromptId: generation?.judgePromptId || null,
      structuredOutputPromptId: generation?.structuredOutputPromptId || null,
    },
    toolId: source.explicitToolId || tool?.toolId || null,
    inputType: tool?.inputType || matchedTrace?.inputType || null,
    outputType: tool?.outputType || matchedTrace?.outputType || null,
    returnType: matchedTrace?.returnType || null,
    outputSchema: matchedTrace?.outputType || tool?.outputType || matchedTrace?.returnType || null,
    stores: matchedTrace?.stores || [],
    telemetry: matchedTrace?.telemetry || [],
    evidence: {
      promptTemplatePresent: booleanFlag(source.data?.promptTemplatePresent) || Boolean(source.data?.promptTemplate),
      interpolatedPromptPresent:
        booleanFlag(source.data?.interpolatedPromptPresent) ||
        Boolean(source.data?.interpolatedPrompt || source.data?.messages),
      reasoningPresent: booleanFlag(source.data?.reasoningPresent) || Boolean(source.data?.reasoning),
      judgmentPresent: booleanFlag(source.data?.judgmentPresent) || Boolean(source.data?.judgment),
      rawModelResponsePresent:
        booleanFlag(source.data?.rawModelResponsePresent) ||
        Boolean(source.data?.rawResponse || source.data?.content),
      parsedTypedOutputPresent:
        booleanFlag(source.data?.parsedTypedOutputPresent) ||
        booleanFlag(source.data?.parsedOutputPresent) ||
        Boolean(source.data?.parsedTypedOutput || source.data?.parsed),
      toolInputPresent: booleanFlag(source.data?.toolInputPresent) || Boolean(source.data?.input),
      toolOutputPresent: booleanFlag(source.data?.toolOutputPresent) || Boolean(source.data?.output),
      toolErrorPresent: booleanFlag(source.data?.toolErrorPresent) || Boolean(source.data?.error),
    },
    matched: Boolean(pipelineName || matchedTrace || generation || tool),
  };
}

export function summarizeReadingPipelineObservabilityCoverage(
  events: unknown[],
): ReadingPipelineObservabilityCoverage {
  const projections = events.map((event) => {
    const record = asRecord(event);
    return asRecord(record?.readingPipelineTelemetry) || resolveReadingPipelineTelemetryProjection(event);
  });
  const levelCounts = Object.fromEntries(
    READING_PIPELINE_TELEMETRY_LEVELS.map((level) => [level, 0]),
  ) as Record<ReadingPipelineTelemetryLevel, number>;
  const pipelineNames = new Set<ReadingPipelineName>();

  for (const projection of projections) {
    const level = projection.level as ReadingPipelineTelemetryLevel;
    if (READING_PIPELINE_TELEMETRY_LEVELS.includes(level)) {
      levelCounts[level] += 1;
    }
    if (isReadingPipelineName(projection.pipelineName)) {
      pipelineNames.add(projection.pipelineName);
    }
  }

  const missingRequiredLevels = READING_PIPELINE_TELEMETRY_LEVELS.filter(
    (level) => levelCounts[level] === 0,
  );

  return {
    schema: 'bitcode.reading.pipeline.observability.coverage',
    eventCount: events.length,
    matchedEventCount: projections.filter((projection) => projection.matched).length,
    pipelineNames: [...pipelineNames].sort(),
    levelCounts,
    missingRequiredLevels,
    promptTelemetryReady: levelCounts.prompt > 0,
    toolTelemetryReady: levelCounts.tool > 0,
    rawOutputTelemetryReady: levelCounts['raw-output'] > 0,
    parsedOutputTelemetryReady: levelCounts['parsed-output'] > 0,
  };
}

function normalizeProjectionSource(eventLike: unknown): ProjectionSource {
  const eventRecord = asRecord(eventLike);
  const data = asRecord(eventRecord?.data) || eventRecord;
  const telemetryEvent = asRecord(data?.telemetryEvent) || null;
  const projection = asRecord(data?.readingPipelineTelemetry) || asRecord(eventRecord?.readingPipelineTelemetry);
  const normalizedData = {
    ...(telemetryEvent || {}),
    ...(data || {}),
    ...(projection || {}),
  };
  const executionState =
    asRecord(normalizedData.executionState) ||
    asRecord(telemetryEvent?.executionState) ||
    asRecord(data?.executionState);
  const executionPath = asStringArray(
    normalizedData.executionPath ||
      telemetryEvent?.executionPath ||
      data?.executionPath ||
      executionState?.path,
  );
  const explicitToolId =
    valueAsString(normalizedData.toolId) ||
    valueAsString(normalizedData.tool) ||
    valueAsString(normalizedData.toolName) ||
    null;
  const explicitThinkingsGenerationId =
    valueAsString(normalizedData.thinkingsGenerationId) ||
    valueAsString(normalizedData.generationId) ||
    valueAsString(executionState?.thinkingsGenerationId) ||
    null;
  const textCandidates = [
    valueAsString(normalizedData.pipelineName),
    valueAsString(normalizedData.phaseId),
    valueAsString(normalizedData.agentId),
    valueAsString(normalizedData.ptrrStepId),
    valueAsString(normalizedData.ptrrStepName),
    valueAsString(normalizedData.thinkingsGenerationId),
    valueAsString(normalizedData.promptTemplateId),
    valueAsString(normalizedData.namespace),
    valueAsString(normalizedData.key),
    valueAsString(normalizedData.stage),
    valueAsString(normalizedData.streamEventType),
    valueAsString(normalizedData.type),
    valueAsString(normalizedData.message),
    valueAsString(executionState?.phase),
    valueAsString(executionState?.agent),
    valueAsString(executionState?.step),
    valueAsString(executionState?.generation),
    explicitToolId,
    explicitThinkingsGenerationId,
    ...executionPath,
  ].filter(Boolean) as string[];

  return {
    data: normalizedData,
    executionState: executionState || null,
    executionPath,
    textCandidates,
    explicitPipelineName: isReadingPipelineName(normalizedData.pipelineName)
      ? normalizedData.pipelineName
      : inferPipelineName({ textCandidates } as ProjectionSource),
    explicitPhaseId: valueAsString(normalizedData.phaseId) || valueAsString(executionState?.phaseId) || null,
    explicitAgentId: valueAsString(normalizedData.agentId) || valueAsString(executionState?.agentId) || null,
    explicitPtrrStepId:
      valueAsString(normalizedData.ptrrStepId) ||
      valueAsString(executionState?.ptrrStepId) ||
      null,
    explicitThinkingsGenerationId,
    explicitToolId,
  };
}

function findMatchingTrace(source: ProjectionSource): IndexedTrace | null {
  if (source.explicitPtrrStepId) {
    const directStep = TRACE_INDEX.find((trace) => trace.ptrrStepId === source.explicitPtrrStepId);
    if (directStep) return directStep;
  }
  if (source.explicitAgentId) {
    const directAgent = TRACE_INDEX.find((trace) => trace.agentId === source.explicitAgentId);
    if (directAgent) return directAgent;
  }
  if (source.explicitPhaseId) {
    const directPhase = TRACE_INDEX.find((trace) => trace.phaseId === source.explicitPhaseId);
    if (directPhase) return directPhase;
  }

  if (source.explicitToolId) {
    const byTool = TRACE_INDEX.find((trace) => trace.toolIds.includes(source.explicitToolId as string));
    if (byTool) return byTool;
  }

  const candidateText = normalizeText(source.textCandidates.join(' '));
  const scopedTraces = source.explicitPipelineName
    ? TRACE_INDEX.filter((trace) => trace.pipelineName === source.explicitPipelineName)
    : TRACE_INDEX;
  const byGeneration = source.explicitThinkingsGenerationId
    ? scopedTraces.find((trace) => trace.thinkingsGenerationIds.includes(source.explicitThinkingsGenerationId as string))
    : null;
  if (byGeneration) return byGeneration;

  return (
    scopedTraces.find((trace) => {
      const phaseMatch =
        candidateText.includes(normalizeText(trace.phaseId)) ||
        candidateText.includes(normalizeText(trace.phaseKey));
      const agentMatch =
        candidateText.includes(normalizeText(trace.agentId)) ||
        candidateText.includes(normalizeText(trace.agentKey)) ||
        candidateText.includes(normalizeText(trace.returnType));
      const stepMatch =
        candidateText.includes(normalizeText(trace.ptrrStepId)) ||
        candidateText.includes(normalizeText(trace.ptrrStepName));
      return phaseMatch && (agentMatch || stepMatch);
    }) ||
    scopedTraces.find((trace) => candidateText.includes(normalizeText(trace.phaseId))) ||
    null
  );
}

function findMatchingThinkingsGeneration(
  source: ProjectionSource,
  trace: IndexedTrace | null,
): IndexedTrace['thinkingsGenerations'][number] | null {
  if (!trace) return null;
  if (source.explicitThinkingsGenerationId) {
    const direct = trace.thinkingsGenerations.find(
      (generation) => generation.thinkingsGenerationId === source.explicitThinkingsGenerationId,
    );
    if (direct) return direct;
  }
  const candidateText = normalizeText(source.textCandidates.join(' '));
  return (
    trace.thinkingsGenerations.find((generation) =>
      candidateText.includes(normalizeText(generation.thinkingsGenerationId)) ||
      candidateText.includes(normalizeText(generation.failsafe)),
    ) || null
  );
}

function findMatchingTool(
  source: ProjectionSource,
  trace: IndexedTrace | null,
): ReadingPipelineToolContract | null {
  if (!trace) return null;
  if (source.explicitToolId) {
    return trace.ptrrStep?.tools.find((tool) => tool.toolId === source.explicitToolId) || null;
  }
  const candidateText = normalizeText(source.textCandidates.join(' '));
  return trace.ptrrStep?.tools.find((tool) => candidateText.includes(normalizeText(tool.toolId))) || null;
}

function resolveTelemetryLevel(
  source: ProjectionSource,
  hasTrace: boolean,
  hasGeneration: boolean,
  hasTool: boolean,
): ReadingPipelineTelemetryLevel {
  const data = source.data || {};
  const namespace = String(data.namespace || '').toLowerCase();
  const key = String(data.key || '').toLowerCase();
  const streamEventType = String(data.streamEventType || data.type || '').toLowerCase();
  if (
    booleanFlag(data.parsedTypedOutputPresent) ||
    booleanFlag(data.parsedOutputPresent) ||
    key.includes('parsed')
  ) {
    return 'parsed-output';
  }
  if (booleanFlag(data.rawModelResponsePresent) || Boolean(data.rawResponse || data.content)) {
    return 'raw-output';
  }
  if (
    booleanFlag(data.promptTemplatePresent) ||
    booleanFlag(data.interpolatedPromptPresent) ||
    Boolean(data.promptTemplate || data.interpolatedPrompt || data.messages) ||
    key.includes('prompt')
  ) {
    return 'prompt';
  }
  if (hasTool || streamEventType.includes('tool') || namespace.includes('tool')) return 'tool';
  if (hasGeneration || namespace === 'llm' || streamEventType.includes('generation')) return 'thinkings-generation';
  if (source.explicitPtrrStepId) return 'ptrr-step';
  if (source.explicitAgentId) return 'ptrr-agent';
  if (source.explicitPhaseId) return 'phase';
  if (hasTrace) return 'ptrr-step';
  return 'execution';
}

function inferPipelineName(source: ProjectionSource): ReadingPipelineName | null {
  const text = source.textCandidates.map(normalizeText).join(' ');
  for (const pipelineName of READING_PIPELINE_NAMES) {
    if (text.includes(normalizeText(pipelineName))) return pipelineName;
  }
  return null;
}

function stepNameFromId(value: unknown): ReadingPipelinePtrrStepName | null {
  const text = String(value || '').split('.').pop() || '';
  return ['plan', 'try', 'retry', 'refine'].includes(text)
    ? (text as ReadingPipelinePtrrStepName)
    : null;
}

function failsafeFromId(value: unknown): ReadingPipelineThinkingsFailsafe | null {
  const text = String(value || '');
  if (text.includes('prepare-concise-context')) return 'prepare-concise-context';
  if (text.includes('chunk-then-sum')) return 'chunk-then-sum';
  if (text.includes('stitch-until-complete')) return 'stitch-until-complete';
  return null;
}

function isReadingPipelineName(value: unknown): value is ReadingPipelineName {
  return value === READ_NEED_COMPREHENSION_SYNTHESIS || value === READ_FITS_FINDING_SYNTHESIS;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function valueAsString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map((entry) => String(entry)).filter(Boolean)
    : [];
}

function booleanFlag(value: unknown): boolean {
  return value === true;
}

function normalizeText(value: unknown): string {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

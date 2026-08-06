import {
  READ_FITS_FINDING_SYNTHESIS,
  READ_NEED_COMPREHENSION_SYNTHESIS,
} from '../reading-pipeline-contract';
import {
  buildReadingPipelineObservabilityInventory,
  resolveReadingPipelineTelemetryProjection,
  summarizeReadingPipelineObservabilityCoverage,
} from '../reading-pipeline-observability';

describe('Reading pipeline observability projection', () => {
  it('indexes the complete Reading pipeline observability inventory', () => {
    const inventory = buildReadingPipelineObservabilityInventory();

    expect(inventory.pipelineNames).toEqual([
      READ_NEED_COMPREHENSION_SYNTHESIS,
      READ_FITS_FINDING_SYNTHESIS,
    ]);
    expect(inventory.telemetryLevels).toEqual([
      'execution',
      'phase',
      'ptrr-agent',
      'ptrr-step',
      'thinkings-generation',
      'prompt',
      'tool',
      'raw-output',
      'parsed-output',
    ]);
    expect(inventory.totals).toEqual({
      pipelines: 2,
      phases: 11,
      ptrrAgents: 12,
      ptrrSteps: 48,
      thinkingsGenerations: 144,
      promptTemplates: 5,
      thinkingsGenerationPrompts: 432,
      tools: 4,
    });
    expect(inventory.traceEntries).toHaveLength(48);
  });

  it('projects LLM prompt telemetry onto the precise PTRR and ThinkingsGeneration contract', () => {
    const projection = resolveReadingPipelineTelemetryProjection({
      type: 'pipeline-stream-event',
      streamEventType: 'store',
      namespace: 'llm',
      key: 'prompt',
      pipelineName: READ_FITS_FINDING_SYNTHESIS,
      phaseId: 'ReadFitsFindingSynthesis.implementation',
      agentId: 'ReadFitsFindingSynthesis.implementation.asset-pack',
      ptrrStepId: 'ReadFitsFindingSynthesis.implementation.asset-pack.try',
      thinkingsGenerationId:
        'ReadFitsFindingSynthesis.thinkings-generation.implementation.asset-pack.try.prepare-concise-context',
      promptTemplatePresent: true,
      interpolatedPromptPresent: true,
    });

    expect(projection).toMatchObject({
      pipelineName: READ_FITS_FINDING_SYNTHESIS,
      level: 'prompt',
      phaseId: 'ReadFitsFindingSynthesis.implementation',
      agentId: 'ReadFitsFindingSynthesis.implementation.asset-pack',
      ptrrStepId: 'ReadFitsFindingSynthesis.implementation.asset-pack.try',
      ptrrStepName: 'try',
      thinkingsGenerationId:
        'ReadFitsFindingSynthesis.thinkings-generation.implementation.asset-pack.try.prepare-concise-context',
      thinkingsFailsafe: 'prepare-concise-context',
      promptTemplateId: 'ReadFitsFindingSynthesis.prompt.asset-pack-synthesis',
      returnType: 'AssetPackSynthesisOutput',
      outputSchema: 'AssetPackSynthesisOutput',
      evidence: {
        promptTemplatePresent: true,
        interpolatedPromptPresent: true,
      },
      matched: true,
    });
    expect(projection.generationPromptIds).toEqual({
      reasonPromptId:
        'ReadFitsFindingSynthesis.prompt.implementation.asset-pack.try.prepare-concise-context.reason',
      judgePromptId:
        'ReadFitsFindingSynthesis.prompt.implementation.asset-pack.try.prepare-concise-context.judge',
      structuredOutputPromptId:
        'ReadFitsFindingSynthesis.prompt.implementation.asset-pack.try.prepare-concise-context.structured-output',
    });
  });

  it('projects depository tool telemetry onto Finding Fits discovery', () => {
    const projection = resolveReadingPipelineTelemetryProjection({
      type: 'pipeline-stream-event',
      streamEventType: 'tool-use',
      namespace: 'tools',
      key: 'result',
      tool: 'ReadFitsFindingSynthesis.tool.vector-depository-search',
      toolInputPresent: true,
      toolOutputPresent: true,
    });

    expect(projection).toMatchObject({
      pipelineName: READ_FITS_FINDING_SYNTHESIS,
      level: 'tool',
      phaseId: 'ReadFitsFindingSynthesis.discovery',
      agentId: 'ReadFitsFindingSynthesis.discovery.finding-fits',
      ptrrStepId: 'ReadFitsFindingSynthesis.discovery.finding-fits.try',
      ptrrStepName: 'try',
      toolId: 'ReadFitsFindingSynthesis.tool.vector-depository-search',
      inputType: 'EmbeddingSearchRequest',
      outputType: 'EmbeddingSearchResult',
      returnType: 'DepositoryFitsResult',
      evidence: {
        toolInputPresent: true,
        toolOutputPresent: true,
      },
      matched: true,
    });
  });

  it('summarizes coverage from projected live stream events', () => {
    const coverage = summarizeReadingPipelineObservabilityCoverage([
      {
        pipelineName: READ_NEED_COMPREHENSION_SYNTHESIS,
      },
      {
        pipelineName: READ_FITS_FINDING_SYNTHESIS,
        phaseId: 'ReadFitsFindingSynthesis.discovery',
      },
      {
        pipelineName: READ_FITS_FINDING_SYNTHESIS,
        agentId: 'ReadFitsFindingSynthesis.discovery.finding-fits',
      },
      {
        pipelineName: READ_FITS_FINDING_SYNTHESIS,
        ptrrStepId: 'ReadFitsFindingSynthesis.discovery.finding-fits.try',
      },
      {
        pipelineName: READ_FITS_FINDING_SYNTHESIS,
        thinkingsGenerationId:
          'ReadFitsFindingSynthesis.thinkings-generation.discovery.finding-fits.try.prepare-concise-context',
      },
      {
        pipelineName: READ_FITS_FINDING_SYNTHESIS,
        ptrrStepId: 'ReadFitsFindingSynthesis.implementation.asset-pack.try',
        promptTemplatePresent: true,
      },
      {
        tool: 'ReadFitsFindingSynthesis.tool.lexical-depository-search',
      },
      {
        pipelineName: READ_FITS_FINDING_SYNTHESIS,
        ptrrStepId: 'ReadFitsFindingSynthesis.implementation.asset-pack.try',
        rawModelResponsePresent: true,
      },
      {
        pipelineName: READ_FITS_FINDING_SYNTHESIS,
        ptrrStepId: 'ReadFitsFindingSynthesis.implementation.asset-pack.try',
        parsedTypedOutputPresent: true,
      },
    ]);

    expect(coverage.pipelineNames).toEqual([
      READ_FITS_FINDING_SYNTHESIS,
      READ_NEED_COMPREHENSION_SYNTHESIS,
    ]);
    expect(coverage.missingRequiredLevels).toEqual([]);
    expect(coverage.promptTelemetryReady).toBe(true);
    expect(coverage.toolTelemetryReady).toBe(true);
    expect(coverage.rawOutputTelemetryReady).toBe(true);
    expect(coverage.parsedOutputTelemetryReady).toBe(true);
  });
});

import {
  READ_FITS_FINDING_SYNTHESIS,
  READ_FITS_FINDING_SYNTHESIS_CONTRACT,
  READ_NEED_COMPREHENSION_SYNTHESIS,
  READ_NEED_COMPREHENSION_SYNTHESIS_CONTRACT,
  READING_PIPELINE_CONTRACTS,
  listReadingPipelineTelemetryTrace,
  listReadingPipelineContractSummaries,
} from '../reading-pipeline-contract';

describe('Reading pipeline contracts', () => {
  it('names the two V28 Reading pipelines and prefixes every contract id under the pipeline name', () => {
    expect(READING_PIPELINE_CONTRACTS.map((contract) => contract.pipelineName)).toEqual([
      READ_NEED_COMPREHENSION_SYNTHESIS,
      READ_FITS_FINDING_SYNTHESIS,
    ]);

    for (const contract of READING_PIPELINE_CONTRACTS) {
      for (const phase of contract.phases) {
        expect(phase.phaseId.startsWith(`${contract.pipelineName}.`)).toBe(true);
        for (const agent of phase.agents) {
          expect(agent.kind).toBe('ptrr-agent');
          expect(agent.agentId.startsWith(`${contract.pipelineName}.`)).toBe(true);
          expect(agent.objectiveId.startsWith(`${contract.pipelineName}.`)).toBe(true);
          expect(agent.promptRegistry.factory).toBe('factoryPTRRAgent');
          expect(agent.promptRegistry.carrier).toBe('prompt+stepPrompts');
          expect(agent.promptRegistry.agentPromptId.startsWith(`${contract.pipelineName}.prompt.`)).toBe(true);
          expect(agent.promptRegistry.promptPartNamespaces).toEqual({
            agent: 'agent/*',
            ptrrStep: 'ptrr/*/purpose',
            generation: 'generation:*',
            failsafe: 'failsafe:*',
          });
          expect(agent.ptrrSteps.map((step) => step.ptrrStepName)).toEqual(['plan', 'try', 'refine', 'retry']);
          for (const promptId of Object.values(agent.promptRegistry.ptrrStepPromptIds)) {
            expect(promptId.startsWith(`${contract.pipelineName}.prompt.`)).toBe(true);
          }
          for (const ptrrStep of agent.ptrrSteps) {
            expect(ptrrStep.ptrrStepId.startsWith(`${contract.pipelineName}.`)).toBe(true);
            expect(ptrrStep.thinkingsGenerations).toHaveLength(3);
            for (const thinkingsGenerationId of ptrrStep.thinkingsGenerationIds) {
              expect(thinkingsGenerationId.startsWith(`${contract.pipelineName}.thinkings-generation.`)).toBe(true);
            }
            for (const thinkingsGeneration of ptrrStep.thinkingsGenerations) {
              expect(thinkingsGeneration.thinkingsGenerationId.startsWith(`${contract.pipelineName}.thinkings-generation.`)).toBe(true);
              expect(thinkingsGeneration.reasonPromptId.startsWith(`${contract.pipelineName}.prompt.`)).toBe(true);
              expect(thinkingsGeneration.judgePromptId.startsWith(`${contract.pipelineName}.prompt.`)).toBe(true);
              expect(thinkingsGeneration.structuredOutputPromptId.startsWith(`${contract.pipelineName}.prompt.`)).toBe(true);
              expect(thinkingsGeneration.returnTypes).toEqual({
                reason: 'Reasoning',
                judge: 'Judgment',
                structuredOutput: ptrrStep.outputType,
              });
            }
            for (const telemetry of ptrrStep.telemetry) {
              expect(telemetry.startsWith(`${contract.pipelineName}.telemetry.`)).toBe(true);
            }
            for (const tool of ptrrStep.tools) {
              // Settlement PR shipping is settle-asset-pack-pipeline; other tools
              // stay under the reading pipeline name prefix.
              const allowed =
                tool.toolId.startsWith(`${contract.pipelineName}.tool.`) ||
                tool.toolId.startsWith('settle-asset-pack-pipeline.tool.');
              expect(allowed).toBe(true);
            }
          }
        }
      }
    }
  });

  it('locks ReadNeedComprehensionSynthesis to request, comprehend, measure, and review contracts', () => {
    expect(READ_NEED_COMPREHENSION_SYNTHESIS_CONTRACT.uxStepIds).toEqual([
      'request-read',
      'review-synthesized-need',
    ]);
    expect(READ_NEED_COMPREHENSION_SYNTHESIS_CONTRACT.phases.map((phase) => phase.phaseId)).toEqual([
      'ReadNeedComprehensionSynthesis.request',
      'ReadNeedComprehensionSynthesis.comprehend',
      'ReadNeedComprehensionSynthesis.measure',
      'ReadNeedComprehensionSynthesis.review',
    ]);
    const modelSteps = READ_NEED_COMPREHENSION_SYNTHESIS_CONTRACT.phases
      .flatMap((phase) => phase.agents)
      .flatMap((agent) => agent.ptrrSteps)
      .filter((step) => step.kind === 'model-structured');
    expect(modelSteps).toHaveLength(4);
    for (const modelStep of modelSteps) {
      expect(modelStep.prompt?.templateId).toBe('ReadNeedComprehensionSynthesis.prompt.need-synthesis');
      // Step outputs validate against STEP schemas: the plan step returns the
      // canonical plan shape; try/refine/retry return the agent output type.
      expect(modelStep.outputType).toBe(modelStep.ptrrStepName === 'plan' ? 'PlanStepOutput' : 'ReadNeed');
    }
  });

  it('locks ReadFitsFindingSynthesis to accepted-Need admission, depository search, synthesis, preview, and settlement contracts', () => {
    expect(READ_FITS_FINDING_SYNTHESIS_CONTRACT.uxStepIds).toEqual([
      'request-fit',
      'review-synthesized-asset-pack',
      'buy-asset-pack-settle',
    ]);
    expect(READ_FITS_FINDING_SYNTHESIS_CONTRACT.phases.map((phase) => phase.phaseId)).toEqual([
      'ReadFitsFindingSynthesis.admit',
      'ReadFitsFindingSynthesis.prepare',
      'ReadFitsFindingSynthesis.discovery',
      'ReadFitsFindingSynthesis.implementation',
      'ReadFitsFindingSynthesis.validate',
      'ReadFitsFindingSynthesis.preview',
      'ReadFitsFindingSynthesis.settle',
    ]);
    const allSteps = READ_FITS_FINDING_SYNTHESIS_CONTRACT.phases
      .flatMap((phase) => phase.agents)
      .flatMap((agent) => agent.ptrrSteps);
    expect(allSteps.filter((step) => step.kind === 'model-structured')).toHaveLength(16);
    expect(allSteps.flatMap((step) => step.tools).map((tool) => tool.toolId)).toEqual(
      expect.arrayContaining([
        'ReadFitsFindingSynthesis.tool.lexical-depository-search',
        'ReadFitsFindingSynthesis.tool.vector-depository-search',
        'ReadFitsFindingSynthesis.tool.verification-evidence',
        'settle-asset-pack-pipeline.tool.vcs-create-pull-request',
      ]),
    );
  });

  it('summarizes counts used by V28 promotion proof and product telemetry QA', () => {
    expect(listReadingPipelineContractSummaries()).toEqual([
      expect.objectContaining({
        pipelineName: READ_NEED_COMPREHENSION_SYNTHESIS,
        phaseCount: 4,
        agentCount: 4,
        ptrrAgentCount: 4,
        ptrrStepCount: 16,
        modelStructuredPtrrStepCount: 4,
        thinkingsGenerationCount: 48,
        toolCount: 0,
      }),
      expect.objectContaining({
        pipelineName: READ_FITS_FINDING_SYNTHESIS,
        phaseCount: 7,
        agentCount: 8,
        ptrrAgentCount: 8,
        ptrrStepCount: 32,
        modelStructuredPtrrStepCount: 16,
        thinkingsGenerationCount: 96,
        toolCount: 4,
      }),
    ]);
  });

  it('lists every PTRR step as telemetry-ready trace entries with ThinkingsGeneration substeps', () => {
    const readNeedTrace = listReadingPipelineTelemetryTrace(READ_NEED_COMPREHENSION_SYNTHESIS_CONTRACT);
    const fitsFindingTrace = listReadingPipelineTelemetryTrace(READ_FITS_FINDING_SYNTHESIS_CONTRACT);

    expect(readNeedTrace).toHaveLength(16);
    expect(fitsFindingTrace).toHaveLength(32);
    expect(readNeedTrace.map((entry) => entry.ptrrStepId)).toContain(
      'ReadNeedComprehensionSynthesis.comprehend.need-synthesizer.try',
    );

    for (const entry of [...readNeedTrace, ...fitsFindingTrace]) {
      expect(entry.agentId.startsWith(`${entry.pipelineName}.`)).toBe(true);
      expect(entry.thinkingsGenerationIds).toHaveLength(3);
      expect(entry.thinkingsGenerations).toHaveLength(3);
      expect(entry.telemetry.every((telemetry) => telemetry.startsWith(`${entry.pipelineName}.telemetry.`))).toBe(true);
    }
  });
});

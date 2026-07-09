import {
  READ_FITS_FINDING_SYNTHESIS_CONTRACT,
  READ_NEED_COMPREHENSION_SYNTHESIS_CONTRACT,
  READING_PIPELINE_CONTRACTS,
} from '../reading-pipeline-contract';

describe('V32 Reading pipeline proof coverage', () => {
  it('keeps every Reading agent as a PTRR agent with four typed steps and three ThinkingsGeneration substeps', () => {
    for (const contract of READING_PIPELINE_CONTRACTS) {
      for (const phase of contract.phases) {
        for (const agent of phase.agents) {
          expect(agent.kind).toBe('ptrr-agent');
          expect(agent.ptrrSteps.map((step) => step.ptrrStepName)).toEqual(['plan', 'try', 'refine', 'retry']);
          for (const step of agent.ptrrSteps) {
            expect(step.inputType).toBeTruthy();
            expect(step.outputType).toBeTruthy();
            expect(step.thinkingsGenerations).toHaveLength(3);
            for (const generation of step.thinkingsGenerations) {
              const expectedPromptBaseId = generation.thinkingsGenerationId.replace(
                '.thinkings-generation.',
                '.prompt.',
              );
              expect(generation.returnTypes).toEqual({
                reason: 'Reasoning',
                judge: 'Judgment',
                structuredOutput: step.outputType,
              });
              expect(generation.reasonPromptId).toBe(`${expectedPromptBaseId}.reason`);
              expect(generation.judgePromptId).toBe(`${expectedPromptBaseId}.judge`);
              expect(generation.structuredOutputPromptId).toBe(`${expectedPromptBaseId}.structured-output`);
              expect(generation.stores.some((store) => store.endsWith('.typed-output'))).toBe(true);
              expect(generation.telemetry.some((telemetry) => telemetry.endsWith('.typed-output'))).toBe(true);
            }
          }
        }
      }
    }
  });

  it('requires every model-structured PTRR step to expose prompt template, interpolated context, raw response, and typed output telemetry', () => {
    const modelStructuredSteps = READING_PIPELINE_CONTRACTS.flatMap((contract) =>
      contract.phases.flatMap((phase) =>
        phase.agents.flatMap((agent) =>
          agent.ptrrSteps.filter((step) => step.kind === 'model-structured').map((step) => ({
            pipelineName: contract.pipelineName,
            agentId: agent.agentId,
            step,
          })),
        ),
      ),
    );

    expect(modelStructuredSteps).toHaveLength(20);
    for (const { pipelineName, agentId, step } of modelStructuredSteps) {
      expect(step.prompt?.templateId.startsWith(`${pipelineName}.prompt.`)).toBe(true);
      expect(step.prompt?.template).toBeTruthy();
      expect(step.prompt?.interpolatedContextKeys.length).toBeGreaterThan(0);
      expect(step.telemetry).toEqual(
        expect.arrayContaining([
          `${pipelineName}.telemetry.prompt-template`,
          `${pipelineName}.telemetry.interpolated-prompt`,
          `${pipelineName}.telemetry.raw-model-response`,
          `${pipelineName}.telemetry.parsed-typed-output`,
        ]),
      );
      expect(agentId.startsWith(`${pipelineName}.`)).toBe(true);
    }
  });

  it('preserves Finding Fits plural discovery and AssetPack synthesis context boundaries', () => {
    const discoveryAgent = READ_FITS_FINDING_SYNTHESIS_CONTRACT.phases
      .find((phase) => phase.phaseId === 'ReadFitsFindingSynthesis.discovery')!
      .agents.find((agent) => agent.agentId === 'ReadFitsFindingSynthesis.discovery.finding-fits')!;
    const discoveryTry = discoveryAgent.ptrrSteps.find((step) => step.ptrrStepName === 'try')!;

    expect(discoveryTry.tools.map((tool) => tool.toolId)).toEqual([
      'ReadFitsFindingSynthesis.tool.lexical-depository-search',
      'ReadFitsFindingSynthesis.tool.vector-depository-search',
    ]);
    expect(discoveryTry.stores).toEqual(expect.arrayContaining(['fit/deposits', 'fit/depositAssetIds']));
    expect(discoveryTry.outputType).toBe('DepositoryFitsResult');

    const implementationTry = READ_FITS_FINDING_SYNTHESIS_CONTRACT.phases
      .find((phase) => phase.phaseId === 'ReadFitsFindingSynthesis.implementation')!
      .agents[0]
      .ptrrSteps.find((step) => step.ptrrStepName === 'try')!;
    expect(implementationTry.prompt?.interpolatedContextKeys).toEqual(
      expect.arrayContaining(['depositorySearchResult', 'fitDepositAssetIds', 'fitDeposits']),
    );
    expect(implementationTry.outputType).toBe('AssetPackSynthesisOutput');
  });

  it('keeps source-safe preview before paid settlement and pull-request delivery', () => {
    const reviewAgent = READ_NEED_COMPREHENSION_SYNTHESIS_CONTRACT.phases
      .find((phase) => phase.phaseId === 'ReadNeedComprehensionSynthesis.review')!
      .agents[0];
    expect(reviewAgent.returnType).toBe('ReadNeedReviewState');
    // Step outputs validate against STEP schemas: plan returns the canonical
    // plan shape; try/refine/retry return the agent output type.
    expect(
      reviewAgent.ptrrSteps.every((step) =>
        step.outputType ===
        (step.ptrrStepName === 'plan'
          ? 'PlanStepOutput'
          : 'AcceptedReadNeed | RejectedReadNeed | ResynthesisRequestedReadNeed'),
      ),
    ).toBe(true);

    const admitTry = READ_FITS_FINDING_SYNTHESIS_CONTRACT.phases
      .find((phase) => phase.phaseId === 'ReadFitsFindingSynthesis.admit')!
      .agents[0]
      .ptrrSteps.find((step) => step.ptrrStepName === 'try')!;
    expect(admitTry.inputType).toBe('AcceptedReadNeed');

    const previewTry = READ_FITS_FINDING_SYNTHESIS_CONTRACT.phases
      .find((phase) => phase.phaseId === 'ReadFitsFindingSynthesis.preview')!
      .agents[0]
      .ptrrSteps.find((step) => step.ptrrStepName === 'try')!;
    expect(previewTry.outputType).toBe('AssetPackSourceSafePreview');
    expect(previewTry.tools).toHaveLength(0);
    expect(previewTry.stores).toEqual(expect.arrayContaining(['asset-pack/preview.sourceSafe', 'asset-pack/preview.feeQuote']));

    const settleTry = READ_FITS_FINDING_SYNTHESIS_CONTRACT.phases
      .find((phase) => phase.phaseId === 'ReadFitsFindingSynthesis.settle')!
      .agents[0]
      .ptrrSteps.find((step) => step.ptrrStepName === 'try')!;
    expect(settleTry.inputType).toBe('AssetPackSourceSafePreview');
    expect(settleTry.tools.map((tool) => tool.toolId)).toEqual(['ReadFitsFindingSynthesis.tool.vcs-create-pull-request']);
  });
});

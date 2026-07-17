#!/usr/bin/env ts-node

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import {
  READ_FITS_FINDING_SYNTHESIS,
  READ_NEED_COMPREHENSION_SYNTHESIS,
  READING_PIPELINE_CONTRACTS,
  type ReadingPipelineContract,
  type ReadingPipelinePtrrStepContract,
  listReadingPipelineContractSummaries,
  listReadingPipelineTelemetryTrace,
} from '../src/reading-pipeline-contract';
import { buildReadingPipelineObservabilityInventory } from '../src/reading-pipeline-observability';

const GENERATED_AT = '2026-05-22T00:00:00.000Z';
const RELATIVE_ARTIFACT_PATH = '.proofs/v32/reading-pipeline-proof-coverage.json';
const repoRoot = path.resolve(__dirname, '../../../..');
const artifactPath = path.join(repoRoot, RELATIVE_ARTIFACT_PATH);

const SECRET_MARKERS = Object.freeze([
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJhbGciOiJI', 'UzI1NiIsInR5cCI6IkpXVCJ9'].join(''),
  ['SUPABASE', 'SERVICE', 'ROLE'].join('_'),
  ['OPENAI', 'API', 'KEY'].join('_'),
  ['VERCEL', 'TOKEN'].join('_'),
  ['VERCEL', 'OIDC', 'TOKEN'].join('_'),
]);

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}

const SECRET_PATTERN = new RegExp(SECRET_MARKERS.map(escapeRegex).join('|'), 'u');

type ReadingPipelineProofCoverageArtifact = {
  artifactId: 'v32-reading-pipeline-proof-coverage';
  schemaId: 'bitcode.v32.readingPipelineProofCoverage.v1';
  version: 'V32';
  currentTarget: 'V31';
  sourceCommit: 'draft-gate-4-source-derived';
  generatedAt: string;
  sourceSafetyVerdict: 'source-safe-contract-metadata';
  pipelineNames: string[];
  uxStepIds: string[];
  totals: ReturnType<typeof buildReadingPipelineObservabilityInventory>['totals'] & {
    modelStructuredPtrrSteps: number;
    reviewSteps: number;
    deterministicSteps: number;
    toolSteps: number;
    settlementSteps: number;
  };
  expectedCounts: {
    readNeed: {
      phases: number;
      ptrrAgents: number;
      ptrrSteps: number;
      modelStructuredPtrrSteps: number;
      thinkingsGenerations: number;
      tools: number;
    };
    readFitsFinding: {
      phases: number;
      ptrrAgents: number;
      ptrrSteps: number;
      modelStructuredPtrrSteps: number;
      thinkingsGenerations: number;
      tools: number;
    };
  };
  pipelineSummaries: ReturnType<typeof listReadingPipelineContractSummaries>;
  phaseCoverage: Array<{
    pipelineName: string;
    phaseId: string;
    agentIds: string[];
    stores: string[];
  }>;
  ptrrAgentCoverage: Array<{
    pipelineName: string;
    phaseId: string;
    agentId: string;
    returnType: string;
    ptrrStepIds: string[];
    promptRegistry: {
      factory: string;
      carrier: string;
      agentPromptId: string;
      ptrrStepPromptIds: string[];
    };
  }>;
  modelStructuredStepCoverage: Array<{
    pipelineName: string;
    phaseId: string;
    agentId: string;
    ptrrStepId: string;
    promptTemplateId: string;
    promptTemplateDigest: string;
    interpolatedContextKeys: string[];
    outputType: string;
    telemetryReady: {
      promptTemplate: boolean;
      interpolatedPrompt: boolean;
      rawModelResponse: boolean;
      parsedTypedOutput: boolean;
    };
  }>;
  thinkingsGenerationCoverage: Array<{
    pipelineName: string;
    phaseId: string;
    agentId: string;
    ptrrStepId: string;
    thinkingsGenerationId: string;
    failsafe: string;
    reasonPromptId: string;
    judgePromptId: string;
    structuredOutputPromptId: string;
    structuredOutputType: string;
    storesTypedOutput: boolean;
    telemetryTypedOutput: boolean;
  }>;
  toolCoverage: Array<{
    pipelineName: string;
    phaseId: string;
    agentId: string;
    ptrrStepId: string;
    toolId: string;
    inputType: string;
    outputType: string;
    tryStepOnly: boolean;
    telemetryReady: {
      toolInput: boolean;
      toolOutput: boolean;
    };
  }>;
  boundaryCoverage: Array<{
    assertionId: string;
    passed: boolean;
    evidence: string;
  }>;
  validationCommands: string[];
  passed: boolean;
};

function stable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, stable(entry)]),
    );
  }
  return value;
}

function stableStringify(value: unknown): string {
  return `${JSON.stringify(stable(value), null, 2)}\n`;
}

function sha256(value: string): string {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`;
}

function allPtrrSteps(contract: ReadingPipelineContract): Array<{
  pipelineName: string;
  phaseId: string;
  agentId: string;
  returnType: string;
  step: ReadingPipelinePtrrStepContract;
}> {
  return contract.phases.flatMap((phase) =>
    phase.agents.flatMap((agent) =>
      agent.ptrrSteps.map((step) => ({
        pipelineName: contract.pipelineName,
        phaseId: phase.phaseId,
        agentId: agent.agentId,
        returnType: agent.returnType,
        step,
      })),
    ),
  );
}

function allContractsPtrrSteps() {
  return READING_PIPELINE_CONTRACTS.flatMap(allPtrrSteps);
}

function coverageByKind(kind: ReadingPipelinePtrrStepContract['kind']): number {
  return allContractsPtrrSteps().filter(({ step }) => step.kind === kind).length;
}

function findStep(ptrrStepId: string) {
  return allContractsPtrrSteps().find(({ step }) => step.ptrrStepId === ptrrStepId) || null;
}

function toolTryStepOnly(ptrrStepId: string, toolId: string): boolean {
  const stepsWithTool = allContractsPtrrSteps()
    .filter(({ step }) => step.tools.some((tool) => tool.toolId === toolId))
    .map(({ step }) => step.ptrrStepId);
  return stepsWithTool.length === 1 && stepsWithTool[0] === ptrrStepId && ptrrStepId.endsWith('.try');
}

export function buildV32ReadingPipelineProofCoverage(): ReadingPipelineProofCoverageArtifact {
  const observabilityInventory = buildReadingPipelineObservabilityInventory();
  const allSteps = allContractsPtrrSteps();
  const phaseCoverage = READING_PIPELINE_CONTRACTS.flatMap((contract) =>
    contract.phases.map((phase) => ({
      pipelineName: contract.pipelineName,
      phaseId: phase.phaseId,
      agentIds: phase.agents.map((agent) => agent.agentId),
      stores: phase.stores,
    })),
  );
  const ptrrAgentCoverage = READING_PIPELINE_CONTRACTS.flatMap((contract) =>
    contract.phases.flatMap((phase) =>
      phase.agents.map((agent) => ({
        pipelineName: contract.pipelineName,
        phaseId: phase.phaseId,
        agentId: agent.agentId,
        returnType: agent.returnType,
        ptrrStepIds: agent.ptrrSteps.map((step) => step.ptrrStepId),
        promptRegistry: {
          factory: agent.promptRegistry.factory,
          carrier: agent.promptRegistry.carrier,
          agentPromptId: agent.promptRegistry.agentPromptId,
          ptrrStepPromptIds: Object.values(agent.promptRegistry.ptrrStepPromptIds),
        },
      })),
    ),
  );
  const modelStructuredStepCoverage = allSteps
    .filter(({ step }) => step.kind === 'model-structured')
    .map(({ pipelineName, phaseId, agentId, step }) => ({
      pipelineName,
      phaseId,
      agentId,
      ptrrStepId: step.ptrrStepId,
      promptTemplateId: step.prompt?.templateId || 'missing',
      promptTemplateDigest: sha256(step.prompt?.template || ''),
      interpolatedContextKeys: step.prompt?.interpolatedContextKeys || [],
      outputType: step.outputType,
      telemetryReady: {
        promptTemplate: step.telemetry.some((entry) => entry.includes('prompt-template')),
        interpolatedPrompt: step.telemetry.some((entry) => entry.includes('interpolated-prompt')),
        rawModelResponse: step.telemetry.some((entry) => entry.includes('raw-model-response')),
        parsedTypedOutput: step.telemetry.some((entry) => entry.includes('parsed-typed-output')),
      },
    }));
  const thinkingsGenerationCoverage = READING_PIPELINE_CONTRACTS.flatMap((contract) =>
    listReadingPipelineTelemetryTrace(contract).flatMap((trace) =>
      trace.thinkingsGenerations.map((generation) => ({
        pipelineName: trace.pipelineName,
        phaseId: trace.phaseId,
        agentId: trace.agentId,
        ptrrStepId: trace.ptrrStepId,
        thinkingsGenerationId: generation.thinkingsGenerationId,
        failsafe: generation.failsafe,
        reasonPromptId: generation.reasonPromptId,
        judgePromptId: generation.judgePromptId,
        structuredOutputPromptId: generation.structuredOutputPromptId,
        structuredOutputType: generation.returnTypes.structuredOutput,
        storesTypedOutput: generation.stores.some((entry) => entry.endsWith('.typed-output')),
        telemetryTypedOutput: generation.telemetry.some((entry) => entry.endsWith('.typed-output')),
      })),
    ),
  );
  const toolCoverage = allSteps.flatMap(({ pipelineName, phaseId, agentId, step }) =>
    step.tools.map((tool) => ({
      pipelineName,
      phaseId,
      agentId,
      ptrrStepId: step.ptrrStepId,
      toolId: tool.toolId,
      inputType: tool.inputType,
      outputType: tool.outputType,
      tryStepOnly: toolTryStepOnly(step.ptrrStepId, tool.toolId),
      telemetryReady: {
        toolInput: step.telemetry.some((entry) => entry.includes('tool-input')),
        toolOutput: step.telemetry.some((entry) => entry.includes('tool-output')),
      },
    })),
  );
  const discoveryStep = findStep('ReadFitsFindingSynthesis.discovery.finding-fits.try');
  const implementationStep = findStep('ReadFitsFindingSynthesis.implementation.asset-pack.try');
  const previewStep = findStep('ReadFitsFindingSynthesis.preview.source-safe-preview.try');
  const settleStep = findStep('ReadFitsFindingSynthesis.settle.ship-asset-pack-patch-pr.try');
  const admissionStep = findStep('ReadFitsFindingSynthesis.admit.accepted-need-gate.try');

  const boundaryCoverage = [
    {
      assertionId: 'accepted-need-gates-finding-fits',
      passed: admissionStep?.step.inputType === 'AcceptedReadNeed',
      evidence: admissionStep?.step.inputType || 'missing',
    },
    {
      assertionId: 'discovery-returns-plural-fit-deposits',
      passed:
        Boolean(discoveryStep?.step.stores.includes('fit/deposits')) &&
        Boolean(discoveryStep?.step.stores.includes('fit/depositAssetIds')),
      evidence: discoveryStep?.step.stores.join(', ') || 'missing',
    },
    {
      assertionId: 'implementation-requires-discovered-fits-context',
      passed:
        Boolean(implementationStep?.step.prompt?.interpolatedContextKeys.includes('fitDeposits')) &&
        Boolean(implementationStep?.step.prompt?.interpolatedContextKeys.includes('fitDepositAssetIds')) &&
        Boolean(implementationStep?.step.prompt?.interpolatedContextKeys.includes('depositorySearchResult')),
      evidence: implementationStep?.step.prompt?.interpolatedContextKeys.join(', ') || 'missing',
    },
    {
      assertionId: 'preview-is-source-safe-before-settlement',
      passed:
        previewStep?.step.outputType === 'AssetPackSourceSafePreview' &&
        previewStep?.step.stores.includes('asset-pack/preview.sourceSafe') &&
        previewStep?.step.tools.length === 0,
      evidence: `${previewStep?.step.outputType || 'missing'}; tools=${previewStep?.step.tools.length ?? 'missing'}`,
    },
    {
      assertionId: 'delivery-tool-runs-only-on-settle-pipeline-ship-stage',
      passed:
        settleStep?.step.inputType === 'SettleAssetPackInput' &&
        settleStep?.step.tools.some(
          (tool) => tool.toolId === 'settle-asset-pack-pipeline.tool.vcs-create-pull-request',
        ) &&
        toolTryStepOnly(
          'ReadFitsFindingSynthesis.settle.ship-asset-pack-patch-pr.try',
          'settle-asset-pack-pipeline.tool.vcs-create-pull-request',
        ),
      evidence: `${settleStep?.step.inputType || 'missing'}; ${settleStep?.step.tools.map((tool) => tool.toolId).join(', ')}`,
    },
  ];

  const artifact: ReadingPipelineProofCoverageArtifact = {
    artifactId: 'v32-reading-pipeline-proof-coverage',
    schemaId: 'bitcode.v32.readingPipelineProofCoverage.v1',
    version: 'V32',
    currentTarget: 'V31',
    sourceCommit: 'draft-gate-4-source-derived',
    generatedAt: GENERATED_AT,
    sourceSafetyVerdict: 'source-safe-contract-metadata',
    pipelineNames: [READ_NEED_COMPREHENSION_SYNTHESIS, READ_FITS_FINDING_SYNTHESIS],
    uxStepIds: [...new Set(READING_PIPELINE_CONTRACTS.flatMap((contract) => contract.uxStepIds))],
    totals: {
      ...observabilityInventory.totals,
      modelStructuredPtrrSteps: coverageByKind('model-structured'),
      reviewSteps: coverageByKind('review'),
      deterministicSteps: coverageByKind('deterministic'),
      toolSteps: coverageByKind('tool'),
      settlementSteps: coverageByKind('settlement'),
    },
    expectedCounts: {
      readNeed: {
        phases: 4,
        ptrrAgents: 4,
        ptrrSteps: 16,
        modelStructuredPtrrSteps: 4,
        thinkingsGenerations: 48,
        tools: 0,
      },
      readFitsFinding: {
        phases: 7,
        ptrrAgents: 8,
        ptrrSteps: 32,
        modelStructuredPtrrSteps: 16,
        thinkingsGenerations: 96,
        tools: 4,
      },
    },
    pipelineSummaries: listReadingPipelineContractSummaries(),
    phaseCoverage,
    ptrrAgentCoverage,
    modelStructuredStepCoverage,
    thinkingsGenerationCoverage,
    toolCoverage,
    boundaryCoverage,
    validationCommands: [
      'pnpm --filter @bitcode/asset-packs-pipelines-domain exec jest --config jest.config.cjs --runTestsByPath src/__tests__/reading-pipeline-contract.test.ts src/__tests__/reading-pipeline-observability.test.ts src/__tests__/v32-reading-pipeline-proof-coverage.test.ts --runInBand',
      'pnpm run check:v32-reading-pipeline-proof-coverage',
      'pnpm run check:v32-gate4',
    ],
    passed: true,
  };

  artifact.passed = validateV32ReadingPipelineProofCoverage(artifact).length === 0;
  return artifact;
}

function validateV32ReadingPipelineProofCoverage(artifact: ReadingPipelineProofCoverageArtifact): string[] {
  const failures: string[] = [];
  const content = stableStringify(artifact);
  if (SECRET_PATTERN.test(content)) failures.push('artifact must not contain secret-like material');
  if (artifact.pipelineNames.join(',') !== `${READ_NEED_COMPREHENSION_SYNTHESIS},${READ_FITS_FINDING_SYNTHESIS}`) {
    failures.push('artifact must name both Reading pipelines in order');
  }
  if (artifact.totals.pipelines !== 2) failures.push('expected exactly two Reading pipelines');
  if (artifact.totals.phases !== 11) failures.push('expected eleven Reading phases');
  if (artifact.totals.ptrrAgents !== 12) failures.push('expected twelve PTRR agents');
  if (artifact.totals.ptrrSteps !== 48) failures.push('expected forty-eight PTRR steps');
  if (artifact.totals.thinkingsGenerations !== 144) failures.push('expected one hundred forty-four ThinkingsGenerations');
  if (artifact.totals.promptTemplates !== 5) failures.push('expected five prompt templates');
  if (artifact.totals.tools !== 4) failures.push('expected four tools');
  if (artifact.modelStructuredStepCoverage.length !== 20) failures.push('expected twenty model-structured PTRR steps');
  if (artifact.thinkingsGenerationCoverage.length !== 144) failures.push('expected every ThinkingsGeneration to be inventoried');
  if (artifact.toolCoverage.length !== 4) failures.push('expected every Reading tool to be inventoried once');
  if (artifact.boundaryCoverage.some((boundary) => boundary.passed !== true)) {
    failures.push('all Reading disclosure and delivery boundary assertions must pass');
  }
  for (const step of artifact.modelStructuredStepCoverage) {
    if (!step.promptTemplateId || step.promptTemplateId === 'missing') failures.push(`${step.ptrrStepId} missing prompt template`);
    if (!step.promptTemplateDigest.startsWith('sha256:')) failures.push(`${step.ptrrStepId} missing prompt digest`);
    if (step.interpolatedContextKeys.length === 0) failures.push(`${step.ptrrStepId} missing interpolated context keys`);
    if (!Object.values(step.telemetryReady).every(Boolean)) failures.push(`${step.ptrrStepId} missing model telemetry`);
  }
  for (const generation of artifact.thinkingsGenerationCoverage) {
    if (!generation.storesTypedOutput) failures.push(`${generation.thinkingsGenerationId} missing typed-output storage`);
    if (!generation.telemetryTypedOutput) failures.push(`${generation.thinkingsGenerationId} missing typed-output telemetry`);
  }
  for (const tool of artifact.toolCoverage) {
    if (!tool.tryStepOnly) failures.push(`${tool.toolId} must be bound to exactly one try step`);
    if (!tool.telemetryReady.toolInput || !tool.telemetryReady.toolOutput) failures.push(`${tool.toolId} missing tool telemetry`);
  }
  return failures;
}

function writeArtifact(): void {
  const artifact = buildV32ReadingPipelineProofCoverage();
  mkdirSync(path.dirname(artifactPath), { recursive: true });
  writeFileSync(artifactPath, stableStringify(artifact), 'utf8');
  process.stdout.write(`Generated ${RELATIVE_ARTIFACT_PATH}\n`);
}

function checkArtifact(): void {
  const expected = stableStringify(buildV32ReadingPipelineProofCoverage());
  if (!existsSync(artifactPath)) {
    throw new Error(`${RELATIVE_ARTIFACT_PATH} is missing. Run pnpm run generate:v32-reading-pipeline-proof-coverage.`);
  }
  const actual = readFileSync(artifactPath, 'utf8');
  if (actual !== expected) {
    throw new Error(`${RELATIVE_ARTIFACT_PATH} is stale. Run pnpm run generate:v32-reading-pipeline-proof-coverage.`);
  }
  const parsed = JSON.parse(actual) as ReadingPipelineProofCoverageArtifact;
  const failures = validateV32ReadingPipelineProofCoverage(parsed);
  if (failures.length > 0) {
    throw new Error(`V32 Reading pipeline proof coverage failed:\n- ${failures.join('\n- ')}`);
  }
  process.stdout.write(`V32 Reading pipeline proof coverage ok artifact=${RELATIVE_ARTIFACT_PATH}\n`);
}

function main(): void {
  const mode = process.argv.includes('--write') ? 'write' : 'check';
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    process.stdout.write(
      [
        'Usage: ts-node scripts/v32-reading-pipeline-proof-coverage.ts [--write|--check]',
        '',
        'Generates or checks the source-safe V32 Reading pipeline proof coverage artifact.',
      ].join('\n'),
    );
    process.stdout.write('\n');
    return;
  }
  if (mode === 'write') writeArtifact();
  else checkArtifact();
}

main();

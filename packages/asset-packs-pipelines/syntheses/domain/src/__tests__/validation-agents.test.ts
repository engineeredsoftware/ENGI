// Inference is non-configurable: the ready-to-finish validator ALWAYS runs the
// formal PTRR core with real generation. Determinism comes from mocking the LLM
// provider at the boundary (F26-A); the old deterministic-fallback branch (and
// its source-overlay warning logic) was removed with the inference profiles.
jest.mock('@bitcode/generic-llms', () => require('./support/generic-llms-mock').makeGenericLLMsMock());

import { Execution } from '@bitcode/execution-generics';
import { AssetPackValidationReadyToFinishAgent } from '../agents/validation-agents';
import { registerValidationAgentsForType } from '../phases/validation';
import { setBoundaryLLMOutput, resetBoundaryLLMOutput } from './support/generic-llms-mock';

describe('AssetPackValidationReadyToFinishAgent (boundary-mocked PTRR)', () => {
  afterEach(() => resetBoundaryLLMOutput());

  it('runs the PTRR core and returns the boundary-mocked typed assessment', async () => {
    setBoundaryLLMOutput({
      finalApproval: true,
      overallConfidence: 0.9,
      qualityScore: 0.92,
      criticalChecks: {
        requirementsMet: true,
        testsPass: true,
        noSecurityIssues: true,
        documentationComplete: true,
        performanceAcceptable: true,
      },
      finalBlockers: [],
      finalWarnings: ['BTC fee and BTD ledger rows must be read back before settlement trust.'],
      recommendation: 'finish',
      summary: 'Boundary-mock approved AssetPack finish readiness.',
    });

    const exec = new Execution('pipeline:asset-pack');
    const result = await AssetPackValidationReadyToFinishAgent({}, exec);

    expect(result.finalApproval).toBe(true);
    expect(result.recommendation).toBe('finish');
    expect(result.summary).toBe('Boundary-mock approved AssetPack finish readiness.');
    expect(result.criticalChecks.requirementsMet).toBe(true);

    // The agent stores its typed assessment for downstream Finish readiness checks.
    expect(exec.get('validation', 'readyToFinish')).toMatchObject({
      finalApproval: true,
      recommendation: 'finish',
      summary: 'Boundary-mock approved AssetPack finish readiness.',
    });
  }, 30000);

  it('surfaces a blocking assessment when the boundary output recommends review', async () => {
    setBoundaryLLMOutput({
      finalApproval: false,
      overallConfidence: 0.55,
      qualityScore: 0.5,
      criticalChecks: {
        requirementsMet: false,
        testsPass: true,
        noSecurityIssues: true,
        documentationComplete: true,
        performanceAcceptable: true,
      },
      finalBlockers: ['AssetPack proof evidence incomplete.'],
      finalWarnings: [],
      recommendation: 'review',
      summary: 'Boundary-mock found blockers that require review before finish.',
    });

    const exec = new Execution('pipeline:asset-pack');
    const result = await AssetPackValidationReadyToFinishAgent({}, exec);

    expect(result.finalApproval).toBe(false);
    expect(result.recommendation).toBe('review');
    expect(result.finalBlockers).toContain('AssetPack proof evidence incomplete.');
  }, 30000);
});

describe('registerValidationAgentsForType (mode-conditional Validation registry)', () => {
  function captureRegistry() {
    const registrations = new Map<string, any>();
    return {
      registrations,
      registry: {
        registerAgent: (key: string, handler: any) => registrations.set(key, handler),
      },
    };
  }

  it('deposit mode registers exactly one ready-to-finish Validation agent (no quality alias)', async () => {
    const { registrations, registry } = captureRegistry();

    registerValidationAgentsForType('read-satisfaction-asset-pack', registry, 'deposit');

    expect([...registrations.keys()].sort()).toEqual([
      'validation:ready-to-finish-asset-packs-synthesis-deposit-pipeline',
    ]);

    const loader = registrations.get(
      'validation:ready-to-finish-asset-packs-synthesis-deposit-pipeline',
    );
    const resolved = await loader();
    const readyToFinish = (
      await import('../agents/validation/deposit-ready-to-finish-agent')
    ).default;
    expect(resolved).toBe(readyToFinish);
  });

  it('read mode (no deposit) registers the canonical validator roster and no deposit Validation keys', () => {
    const { registrations, registry } = captureRegistry();

    registerValidationAgentsForType('read-satisfaction-asset-pack', registry);

    expect([...registrations.keys()].sort()).toEqual([
      'validation:asset-pack-ready-to-finish-agent',
      'validation:validate-asset-pack-synthesis-artifacts',
      'validation:validate-discovery-phase',
      'validation:validate-last-iterations-validation-phase',
    ]);
    expect(registrations.has('validation:deposit-quality')).toBe(false);
    expect(
      registrations.has('validation:ready-to-finish-asset-packs-synthesis-deposit-pipeline'),
    ).toBe(false);
    expect(registrations.get('validation:asset-pack-ready-to-finish-agent')).toBe(
      AssetPackValidationReadyToFinishAgent,
    );
  });
});

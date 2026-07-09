// @ts-nocheck
//
// Inference is non-configurable (F26-A): the setup adapters ALWAYS run their
// formal agents. Determinism comes from boundary mocks, never from in-agent
// branches.
//  - The setup-plan default runner keeps a NODE_ENV==='test' lifecycle stub, so
//    it never reaches a live provider in unit tests.
//  - Read comprehension delegates to the generic read-comprehension agent; we
//    mock that module boundary and assert the adapter's stored evidence.
//  - Danger-wall delegates to the generic risk-admission agent; we mock only that
//    agent export (keeping the real result schema so normalizeRiskAdmissionResult
//    and the envelope tests below are unaffected).
jest.mock('@bitcode/generic-agents-read-comprehension', () => ({
  bitcodeSetupReadComprehensionAgent: jest.fn(async () => ({
    read: {
      expressed_read: 'Determine whether the deposited repository satisfies Terminal Read/Fit QA.',
      primary_intent: 'Find a source-bound AssetPack fit for the admitted Read.',
      satisfaction_criteria: ['Source revision evidence must match the admitted Read.'],
    },
    read_satisfaction_criteria: 'Boundary-mock setup Read comprehension satisfaction criteria.',
    written_asset_types: ['read-satisfaction-asset-pack'],
    comprehension: { intent: 'Synthesize a Read-satisfying AssetPack.' },
    entities: { files: [], concepts: ['Read', 'Fit'], technologies: [] },
    riskAdmissionInput: {
      read: 'Determine whether the deposited repository satisfies Terminal Read/Fit QA.',
      assetPackIntent: 'Read-satisfaction AssetPack synthesis',
      writtenAssetType: 'read-satisfaction-asset-pack',
      writtenAssetRequest: 'read-satisfaction-asset-pack',
    },
    asset_pack_context: {
      repository: { fullName: 'engineeredsoftware/ENGI' },
      fitState: 'worthy_fit',
      selectedCandidateAssetIds: ['manual-deposit-qa'],
    },
    toolEvidence: { semanticAnalysis: {} },
    success: true,
  })),
}));

jest.mock('@bitcode/generic-agents-danger-wall', () => {
  const actual = jest.requireActual('@bitcode/generic-agents-danger-wall');
  return {
    ...actual,
    bitcodeReadRiskAdmissionAgent: jest.fn(async () => ({
      finalAssessment: {
        safe: true,
        maxSeverity: 'none',
        confidence: 0.91,
        verdict: {
          approved: true,
          reason: 'Boundary-mock full risk admission passed.',
          flags: [],
          recommendations: [],
        },
        auditTrail: [
          { check: 'read boundary', result: true, details: ['source-bound read'], severity: 'none' },
        ],
      },
      riskInsights: {
        riskProfile: 'bounded',
        threatLevel: 'minimal',
        riskRecommendations: [],
        proofObligations: [],
        admissionBoundary: 'setup',
      },
      readAlignment: {
        alignmentScore: 0.94,
        readSafeToMeasure: true,
        assetPackSafeToSynthesize: true,
        deliveryMechanismSafeToAttempt: true,
      },
      recommendations: ['continue'],
      success: true,
      validationMessage: 'passed',
    })),
  };
});

import cloneRepositoryAgent from '../agents/setup/asset-pack-clone-vcs-repository-agent';
import runReadFitsFindingSynthesisSetupPlanAgent from '../agents/setup/read-fits-finding-synthesis-setup-plan-agent';
import runReadFitsFindingSynthesisReadComprehensionAgent from '../agents/setup/read-fits-finding-synthesis-read-comprehension-agent';
import dangerWallAgent, {
  normalizeRiskAdmissionResult,
} from '../agents/setup/asset-pack-danger-wall-agent';

function executionStub() {
  const stores: Array<{ namespace: string; key: string; value: unknown }> = [];
  const values = new Map<string, unknown>();
  return {
    stores,
    children: new Map(),
    getPath: () => ['pipeline:test'],
    store: (namespace: string, key: string, value: unknown) => {
      stores.push({ namespace, key, value });
      values.set(`${namespace}:${key}`, value);
    },
    get: (namespace: string, key: string) => values.get(`${namespace}:${key}`),
  };
}

describe('AssetPack setup agents', () => {
  it('normalizes a Vercel Sandbox source checkout without invoking clone PTRR', async () => {
    const execution = executionStub();
    const result = await cloneRepositoryAgent(
      {
        repository: {
          fullName: 'engineeredsoftware/ENGI',
          branch: 'main',
          commit: '07de275b3d97679321f1f596c16e48105d81d51b',
        },
        sourceRevision: {
          repositoryFullName: 'engineeredsoftware/ENGI',
          branch: 'main',
          commit: '07de275b3d97679321f1f596c16e48105d81d51b',
        },
        harness: { harnessMode: 'asset_pack_pipeline' },
      },
      execution
    );

    expect(result).toMatchObject({
      success: true,
      repository: { owner: 'engineeredsoftware', name: 'ENGI', ref: 'main' },
      status: 'source-revision-present',
    });
    expect(execution.stores).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ namespace: 'repository', key: 'owner', value: 'engineeredsoftware' }),
        expect.objectContaining({ namespace: 'repository', key: 'name', value: 'ENGI' }),
        expect.objectContaining({ namespace: 'repository', key: 'commit', value: '07de275b3d97679321f1f596c16e48105d81d51b' }),
      ])
    );
  });

  it('returns the NODE_ENV test stub plan and stores setup-plan evidence', async () => {
    const execution = executionStub();
    const result = await runReadFitsFindingSynthesisSetupPlanAgent(
      {
        read: 'Determine whether the deposited repository satisfies Terminal Read/Fit QA.',
        repository: {
          fullName: 'engineeredsoftware/ENGI',
          branch: 'main',
          commit: '07de275b3d97679321f1f596c16e48105d81d51b',
        },
        fitResult: {
          resultState: 'worthy_fit',
          selectedCandidateAssetIds: ['manual-deposit-qa'],
        },
      },
      execution
    );

    // Unit tests run under NODE_ENV==='test', so the agent returns its fast
    // lifecycle stub instead of reaching a live provider.
    expect(result.plan).toBe('Prepare concise context; Reason about setup; Return minimal plan.');
    expect(execution.stores).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ namespace: 'setup', key: 'plan', value: result.plan }),
        expect.objectContaining({ namespace: 'setup/plan', key: 'result' }),
      ])
    );
  });

  it('stores Read comprehension evidence from the boundary-mocked generic agent', async () => {
    const execution = executionStub();
    const result = await runReadFitsFindingSynthesisReadComprehensionAgent(
      {
        read: 'Determine whether the deposited repository satisfies Terminal Read/Fit QA.',
        repository: {
          fullName: 'engineeredsoftware/ENGI',
          branch: 'main',
          commit: '07de275b3d97679321f1f596c16e48105d81d51b',
        },
        fitResult: {
          resultState: 'worthy_fit',
          selectedCandidateAssetIds: ['manual-deposit-qa'],
        },
      },
      execution
    );

    expect(result.read.expressed_read).toContain('Terminal Read/Fit QA');
    expect(result.asset_pack_context).toMatchObject({
      repository: { fullName: 'engineeredsoftware/ENGI' },
      fitState: 'worthy_fit',
      selectedCandidateAssetIds: ['manual-deposit-qa'],
    });
    expect(result.riskAdmissionInput).toMatchObject({
      writtenAssetType: 'read-satisfaction-asset-pack',
    });
    expect(execution.stores).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ namespace: 'setup/read', key: 'model' }),
        expect.objectContaining({ namespace: 'setup/read-comprehension', key: 'riskAdmissionInput' }),
      ])
    );
  });

  it('runs the full risk-admission agent and stores typed setup evidence', async () => {
    const execution = executionStub();
    execution.store('setup/read-comprehension', 'riskAdmissionInput', {
      read: 'Fit the deposited repository.',
      assetPackIntent: 'Read-satisfaction AssetPack synthesis',
      writtenAssetType: 'read-satisfaction-asset-pack',
      writtenAssetRequest: 'read-satisfaction-asset-pack',
    });

    const result = await dangerWallAgent({}, execution);

    expect(result.finalAssessment.safe).toBe(true);
    expect(result.finalAssessment.maxSeverity).toBe('none');
    expect(execution.stores).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ namespace: 'setup/danger-wall', key: 'result' }),
        expect.objectContaining({ namespace: 'setup/risk-admission', key: 'result' }),
      ])
    );
  });

  it('normalizes the full PTRR risk admission envelope before checking setup safety', () => {
    const result = normalizeRiskAdmissionResult({
      context: {},
      output: {
        finalAssessment: {
          safe: true,
          maxSeverity: 'none',
          confidence: 0.91,
          verdict: {
            approved: true,
            reason: 'Full risk admission passed.',
            flags: [],
            recommendations: [],
          },
          auditTrail: [
            {
              check: 'read boundary',
              result: true,
              details: ['source-bound read'],
              severity: 'none',
            },
          ],
        },
        riskInsights: {
          riskProfile: 'bounded',
          threatLevel: 'minimal',
          riskRecommendations: [],
          proofObligations: [],
          admissionBoundary: 'setup',
        },
        readAlignment: {
          alignmentScore: 0.94,
          readSafeToMeasure: true,
          assetPackSafeToSynthesize: true,
          deliveryMechanismSafeToAttempt: true,
        },
        recommendations: ['continue'],
        success: true,
        validationMessage: 'passed',
      },
      finalOutput: {},
    });

    expect(result.finalAssessment.safe).toBe(true);
    expect(result.finalAssessment.maxSeverity).toBe('none');
    expect(result.readAlignment.assetPackSafeToSynthesize).toBe(true);
  });

  it('fails closed when risk admission returns an untyped output shape', () => {
    const result = normalizeRiskAdmissionResult({
      step: 'Retry',
      agent: 'bitcode-read-risk-admission',
      phase: 'setup',
    });

    expect(result.finalAssessment.safe).toBe(false);
    expect(result.finalAssessment.maxSeverity).toBe('high');
    expect(result.finalAssessment.verdict.flags).toContain(
      'risk-admission-output-missing-final-assessment',
    );
  });
});

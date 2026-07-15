import {
  buildDeploymentReadinessRehearsalRows,
  buildDeploymentReadinessRehearsalSet,
  type DeploymentReadinessRehearsalInput,
} from '../src/deployment-readiness-rehearsal';

describe('DeploymentReadinessRehearsal', () => {
  it('builds local, staging-testnet, and blocked mainnet rehearsal records', () => {
    const set = buildDeploymentReadinessRehearsalSet();

    expect(set.kind).toBe('bitcode.deployment_readiness_rehearsal_set');
    expect(set.schemaId).toBe('bitcode.deploymentReadinessRehearsalSet.v1');
    expect(set.rehearsalCount).toBe(3);
    expect(set.missingRehearsalIds).toEqual([]);
    expect(set.localRehearsalCovered).toBe(true);
    expect(set.stagingTestnetRehearsalCovered).toBe(true);
    expect(set.valueBearingMainnetBlocked).toBe(true);
    expect(set.rehearsals.map((rehearsal) => rehearsal.laneId)).toEqual([
      'local',
      'staging-testnet',
      'value-bearing-mainnet',
    ]);
    expect(set.rehearsals.every((rehearsal) => /^deployment-readiness-rehearsal:[a-f0-9]{24}$/.test(rehearsal.rehearsalRoot))).toBe(true);
  });

  it('covers every interface, pipeline, settlement, storage, and repair surface for local and staging-testnet', () => {
    const set = buildDeploymentReadinessRehearsalSet();
    const localAndStaging = set.rehearsals.filter((rehearsal) =>
      rehearsal.laneId === 'local' || rehearsal.laneId === 'staging-testnet',
    );

    expect(set.terminalCovered).toBe(true);
    expect(set.publicApiCovered).toBe(true);
    expect(set.mcpApiCovered).toBe(true);
    expect(set.chatGptAppCovered).toBe(true);
    expect(set.readingPipelineExecutionReceiptsCovered).toBe(true);
    expect(set.settlementFinalitySimulationCovered).toBe(true);
    expect(set.storagePostureCovered).toBe(true);
    expect(set.repairPostureCovered).toBe(true);

    for (const rehearsal of localAndStaging) {
      expect(rehearsal.exercisedSurfaces).toEqual(
        expect.arrayContaining([
          'terminal',
          'public_api',
          'mcp_api',
          'chatgpt_app',
          'reading_pipeline_execution_receipts',
          'settlement_finality_simulation',
          'storage_posture',
          'repair_posture',
        ]),
      );
      expect(rehearsal.runtimeReceiptIds.length).toBeGreaterThanOrEqual(7);
      expect(rehearsal.validationCommands).toEqual(expect.arrayContaining([
        'pnpm --dir apps/uapi run test:e2e:terminal-ux',
        'pnpm run qa:pipeline-readback',
      ]));
      expect(rehearsal.sourceSafeLogKinds.every((logKind) => /log-root/.test(logKind))).toBe(true);
      expect(rehearsal.proofRootBasis).toEqual(expect.arrayContaining([
        'DeploymentHostCapabilityCatalog',
        'DistributedExecutionRuntimeReceipt',
        'DeploymentStoragePosture',
      ]));
    }
  });

  it('keeps value-bearing mainnet blocked', () => {
    const set = buildDeploymentReadinessRehearsalSet();
    const mainnet = set.rehearsals.find((rehearsal) => rehearsal.laneId === 'value-bearing-mainnet');

    expect(mainnet).toMatchObject({
      rehearsalId: 'value_bearing_mainnet_blocked_rehearsal',
      valueBearingMainnetAdmission: false,
      admissionVerdict: 'blocked_value_bearing_mainnet',
    });
    expect(mainnet?.failClosedResult).toMatch(/remains blocked/);
    expect(mainnet?.runtimeReceiptIds).toContain('receipt.value-bearing-mainnet.blocked-admission');
  });

  it('fails closed when a required rehearsal is missing', () => {
    const rehearsals = buildDeploymentReadinessRehearsalRows().filter(
      (rehearsal) => rehearsal.rehearsalId !== 'staging_testnet_full_stack_rehearsal',
    );

    expect(() => buildDeploymentReadinessRehearsalSet({ rehearsals })).toThrow(
      /missing required rehearsals: staging_testnet_full_stack_rehearsal/,
    );
  });

  it('fails closed when a rehearsal is duplicated', () => {
    const rows = buildDeploymentReadinessRehearsalRows();

    expect(() => buildDeploymentReadinessRehearsalSet({ rehearsals: [...rows, rows[0]] })).toThrow(
      /duplicate rehearsal ids: local_full_stack_rehearsal/,
    );
  });

  it('fails closed when staging-testnet does not cover a required surface', () => {
    const rows = buildDeploymentReadinessRehearsalRows();
    const mutated: DeploymentReadinessRehearsalInput = {
      ...rows[1],
      exercisedSurfaces: rows[1].exercisedSurfaces.filter((surface) => surface !== 'mcp_api'),
    };

    expect(() => buildDeploymentReadinessRehearsalSet({ rehearsals: [rows[0], mutated, rows[2]] })).toThrow(
      /local and staging-testnet coverage for mcp_api/,
    );
  });

  it('fails closed when proof-rooted logs are missing', () => {
    const rows = buildDeploymentReadinessRehearsalRows();
    const mutated: DeploymentReadinessRehearsalInput = {
      ...rows[0],
      screenshotOrLogRoots: [],
    };

    expect(() => buildDeploymentReadinessRehearsalSet({ rehearsals: [mutated, ...rows.slice(1)] })).toThrow(
      /proof-rooted screenshots or logs/,
    );
  });

  it('fails closed when mainnet is not explicitly blocked', () => {
    const rows = buildDeploymentReadinessRehearsalRows();
    const mutated: DeploymentReadinessRehearsalInput = {
      ...rows[2],
      admissionVerdict: 'admitted_non_value_rehearsal',
    };

    expect(() => buildDeploymentReadinessRehearsalSet({ rehearsals: [...rows.slice(0, 2), mutated] })).toThrow(
      /must keep value-bearing mainnet blocked/,
    );
  });

  it('fails closed on serialized secret-shaped values', () => {
    const rows = buildDeploymentReadinessRehearsalRows();
    const mutated: DeploymentReadinessRehearsalInput = {
      ...rows[1],
      screenshotOrLogRoots: ['staging leak sb_secret__not_allowed_here'],
    };

    expect(() => buildDeploymentReadinessRehearsalSet({ rehearsals: [rows[0], mutated, rows[2]] })).toThrow(
      /source-safe deployment readiness rehearsal metadata/,
    );
  });
});

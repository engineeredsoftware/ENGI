import {
  buildDeploymentPromotionReadinessReport,
  buildDeploymentPromotionReadinessReportInput,
  DEPLOYMENT_PROMOTION_READINESS_ARTIFACT_PATHS,
  type DeploymentPromotionReadinessReportInput,
} from '../src/deployment-promotion-readiness-report';

describe('DeploymentPromotionReadinessReport', () => {
  it('builds a V34 promotion readiness report over all deployment artifacts', () => {
    const report = buildDeploymentPromotionReadinessReport();

    expect(report.kind).toBe('bitcode.deployment_promotion_readiness_report');
    expect(report.schemaId).toBe('bitcode.deploymentPromotionReadinessReport.v1');
    expect(report.reportId).toBe('v34-promotion-readiness-report');
    expect(report.version).toBe('V34');
    expect(report.currentTarget).toBe('V33');
    expect(report.prePromotionPosture).toBe('V33 active / V34 draft');
    expect(report.postPromotionPosture).toBe('V34 active / V35 draft');
    expect(report.gateArtifactPaths).toEqual([...DEPLOYMENT_PROMOTION_READINESS_ARTIFACT_PATHS]);
    expect(report.allGateArtifactsCovered).toBe(true);
    expect(report.promotionWorkflowCovered).toBe(true);
    expect(report.gateQualityWorkflowCovered).toBe(true);
    expect(report.canonQualityWorkflowCovered).toBe(true);
    expect(report.promotionScriptCovered).toBe(true);
    expect(report.generatedProofOutputsCovered).toBe(true);
    expect(report.valueBearingMainnetBlocked).toBe(true);
    expect(report.reportRoot).toMatch(/^deployment-promotion-readiness-report:[a-f0-9]{24}$/);
  });

  it('names the promotion commands, workflows, and generated proof outputs', () => {
    const report = buildDeploymentPromotionReadinessReport();

    expect(report.promotionValidationCommands).toEqual(expect.arrayContaining([
      'pnpm run check:v34-gate10',
      'node scripts/promote-bitcode-canon.mjs --version V34 --commit HEAD --dry-run',
    ]));
    expect(report.generatedProofOutputs).toEqual(expect.arrayContaining([
      '.specifications/BITCODE_SPEC_V34_PROVEN.md',
      '.proofs/v34/spec-family-report.json',
      '.proofs/v34/canonical-input-report.json',
      '.proofs/v34/canon-posture-drift-report.json',
      '.proofs/v34/promotion-readiness-report.json',
    ]));
    expect(report.promotionWorkflowPath).toBe('.github/workflows/v34-canon-promotion.yml');
    expect(report.promotionScriptPath).toBe('scripts/promote-bitcode-canon.mjs');
  });

  it('keeps mainnet value, protected source, and secret serialization blocked', () => {
    const report = buildDeploymentPromotionReadinessReport();

    expect(report.valueBearingMainnetAdmission).toBe(false);
    expect(report.protectedSourceSerialized).toBe(false);
    expect(report.secretValuesSerialized).toBe(false);
    expect(report.failClosedResult).toMatch(/blocked|missing/);
    expect(report.sourceSafety).toMatchObject({
      sourceSafe: true,
      containsProtectedSource: false,
      containsSecret: false,
    });
  });

  it('fails closed when a required deployment artifact is missing', () => {
    const input = buildDeploymentPromotionReadinessReportInput();
    const mutated: DeploymentPromotionReadinessReportInput = {
      ...input,
      gateArtifactPaths: input.gateArtifactPaths.filter(
        (artifactPath) => artifactPath !== '.proofs/v34/local-staging-testnet-deployment-rehearsal.json',
      ),
    };

    expect(() => buildDeploymentPromotionReadinessReport(mutated)).toThrow(
      /missing gate artifacts: .proofs\/v34\/local-staging-testnet-deployment-rehearsal.json/,
    );
  });

  it('fails closed when gate artifact paths are duplicated', () => {
    const input = buildDeploymentPromotionReadinessReportInput();

    expect(() => buildDeploymentPromotionReadinessReport({
      ...input,
      gateArtifactPaths: [...input.gateArtifactPaths, input.gateArtifactPaths[0]],
    })).toThrow(/gate artifact paths must be unique/);
  });

  it('fails closed when V34 promotion commands are missing', () => {
    const input = buildDeploymentPromotionReadinessReportInput();

    expect(() => buildDeploymentPromotionReadinessReport({
      ...input,
      promotionValidationCommands: input.promotionValidationCommands.filter(
        (command) => !command.includes('promote-bitcode-canon.mjs'),
      ),
    })).toThrow(/requires the V34 canonical promotion dry run/);
  });

  it('fails closed when protected source or secrets would be serialized', () => {
    const input = buildDeploymentPromotionReadinessReportInput();

    expect(() => buildDeploymentPromotionReadinessReport({
      ...input,
      protectedSourceSerialized: true as unknown as false,
    })).toThrow(/must not serialize protected source/);
    expect(() => buildDeploymentPromotionReadinessReport({
      ...input,
      secretValuesSerialized: true as unknown as false,
    })).toThrow(/must not serialize secret values/);
  });

  it('fails closed on secret-shaped metadata', () => {
    const input = buildDeploymentPromotionReadinessReportInput();

    expect(() => buildDeploymentPromotionReadinessReport({
      ...input,
      generatedProofOutputs: [`${['sb', 'secret'].join('_')}__not_allowed_here`],
    })).toThrow(/source-safe deployment promotion readiness metadata/);
  });
});

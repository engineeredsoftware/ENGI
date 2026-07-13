import {
  applyPlanImplementationSemanticMirrors,
  applyResearchApproachSemanticMirrors,
} from '../agents/discovery-agents';

describe('AssetPack discovery semantic mirrors', () => {
  it('mirrors AssetPack synthesis artifacts into written assets', () => {
    const output = applyResearchApproachSemanticMirrors({
      approach: {
        methodology: 'parallel analysis',
        phases: [
          {
            name: 'finish',
            description: 'materialize the AssetPack evidence',
            assetPackSynthesisArtifacts: ['source patch evidence'],
            shippables: ['pull request'],
          },
        ],
        tools: ['git'],
        estimatedEffort: 'medium',
      },
      alternatives: [],
      risks: [],
      recommendation: 'finish with a pull request delivery mechanism',
    });

    expect(output.approach.phases[0].writtenAssets).toEqual(['source patch evidence']);
  });

  it('preserves explicit research approach written asset mirrors', () => {
    const output = applyResearchApproachSemanticMirrors({
      approach: {
        methodology: 'parallel analysis',
        phases: [
          {
            name: 'finish',
            description: 'materialize the AssetPack evidence',
            assetPackSynthesisArtifacts: ['source patch evidence'],
            shippables: ['pull request'],
            writtenAssets: ['draft pull request'],
          },
        ],
        tools: ['git'],
        estimatedEffort: 'medium',
      },
      alternatives: [],
      risks: [],
      recommendation: 'finish with a pull request delivery mechanism',
    });

    expect(output.approach.phases[0].writtenAssets).toEqual(['draft pull request']);
  });

  it('normalizes PTRR envelope research outputs before mirroring', () => {
    const output = applyResearchApproachSemanticMirrors({
      output: {
        approach: {
          methodology: 'parallel analysis',
          phases: [
            {
              name: 'finish',
              description: 'materialize the AssetPack evidence',
              assetPackSynthesisArtifacts: ['source patch evidence'],
            },
          ],
          tools: ['git'],
          estimatedEffort: 'medium',
        },
        alternatives: [],
        risks: [],
        recommendation: 'finish with an AssetPack',
      },
    } as any);

    expect(output.approach.phases[0].writtenAssets).toEqual(['source patch evidence']);
  });

  it('fails softly when PTRR research output omits approach phases', () => {
    const output = applyResearchApproachSemanticMirrors({ output: { recommendation: 'continue' } } as any);

    expect(output.approach.phases).toEqual([]);
    expect(output.recommendation).toBe('continue');
  });

  it('mirrors definition of read into read satisfaction criteria', () => {
    const output = applyPlanImplementationSemanticMirrors({
      implementationPlan: {
        overview: 'deliver the requested change',
        milestones: [],
        dependencies: [],
      },
      testingStrategy: {
        approach: 'targeted regression',
        testTypes: ['unit'],
        coverage: 'focused',
      },
      validationCriteria: ['tests pass'],
      definitionOfRead: ['pull request merged'],
    });

    expect(output.readSatisfactionCriteria).toEqual(['pull request merged']);
  });

  it('preserves explicit read satisfaction criteria', () => {
    const output = applyPlanImplementationSemanticMirrors({
      implementationPlan: {
        overview: 'deliver the requested change',
        milestones: [],
        dependencies: [],
      },
      testingStrategy: {
        approach: 'targeted regression',
        testTypes: ['unit'],
        coverage: 'focused',
      },
      validationCriteria: ['tests pass'],
      definitionOfRead: ['pull request merged'],
      readSatisfactionCriteria: ['asset pack accepted'],
    });

    expect(output.readSatisfactionCriteria).toEqual(['asset pack accepted']);
  });

  it('normalizes PTRR envelope plan outputs before mirroring', () => {
    const output = applyPlanImplementationSemanticMirrors({
      finalOutput: {
        implementationPlan: {
          overview: 'deliver the requested change',
          milestones: [],
          dependencies: [],
        },
        testingStrategy: {
          approach: 'targeted regression',
          testTypes: ['unit'],
          coverage: 'focused',
        },
        validationCriteria: ['tests pass'],
        definitionOfRead: ['asset pack accepted'],
      },
    } as any);

    expect(output.readSatisfactionCriteria).toEqual(['asset pack accepted']);
  });
});

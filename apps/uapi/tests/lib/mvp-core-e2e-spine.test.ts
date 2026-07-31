/**
 * @jest-environment node
 *
 * MVP-E2E L4: CI-fast commercial spine (non-UI).
 */

import { runMvpCoreE2eSpine } from '@/lib/mvp-core-e2e-spine';

describe('MVP-E2E L4 core spine', () => {
  it('runs deposit→admit→index projection→search→needinesses→quote with source-safe checks', async () => {
    const result = await runMvpCoreE2eSpine({
      repositoryFullName: 'octocat/Spoon-Knife',
      needText: 'I need session refresh and token rotation for OAuth clients.',
      includePathOnlyNoise: true,
    });

    expect(result.schema).toBe('bitcode.mvp-core-e2e-spine');
    expect(result.errors).toEqual([]);
    expect(result.ok).toBe(true);

    expect(result.steps.depositSynthesis.optionCount).toBeGreaterThanOrEqual(1);
    expect(result.steps.admission.admittedCount).toBeGreaterThanOrEqual(1);
    expect(result.steps.admission.depositoryAssetPackId).toMatch(/depository-assetpack/i);
    expect(result.steps.admission.sourceSafe).toBe(true);
    expect(result.steps.admission.packsActivityRoute).toBe('/packs');

    expect(result.steps.indexProjection.embedTextHasCommercialNlSection).toBe(true);
    expect(result.steps.indexProjection.commercialTitle).toMatch(/session refresh/i);

    expect(result.steps.search.hitCount).toBeGreaterThanOrEqual(1);
    expect(result.steps.search.nlRankedAbovePathNoise).toBe(true);

    expect(result.steps.readNeedinesses.rowCount).toBeGreaterThan(0);
    expect(result.steps.readNeedinesses.allFitSuffix).toBe(true);
    expect(result.steps.readNeedinesses.needFitVolume).toBeGreaterThan(0);

    expect(result.steps.quote.ok).toBe(true);
    expect(result.steps.quote.optionCount).toBeGreaterThan(0);
    expect(result.steps.quote.needFitVolume).toBeGreaterThan(0);

    expect(result.steps.sourceSafety.admissionSourceSafe).toBe(true);
    expect(result.steps.sourceSafety.unpaidSearchHitsHaveNoFileBodies).toBe(true);
  }, 60000);
});

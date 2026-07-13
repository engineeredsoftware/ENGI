import {
  assertAssetPackDisclosureSourceSafe,
  buildAssetPackDisclosureReview,
  reviewAssetPackProtectedSourceLeakage,
  summarizeAssetPackDisclosureReview,
} from '../asset-pack-disclosure';
import {
  acceptReadNeed,
  buildAssetPackSourceSafePreview,
  synthesizeReadNeedForPipelineInput,
} from '../read-need';

const acceptedNeed = acceptReadNeed(
  synthesizeReadNeedForPipelineInput({
    read: {
      prompt: 'Find a source-safe AssetPack fit for Terminal settlement proof.',
    },
    sourceRevision: {
      repositoryFullName: 'engineeredsoftware/ENGI',
      branch: 'main',
      commit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
    },
  }),
  '2026-05-20T00:00:00.000Z',
);

const preview = buildAssetPackSourceSafePreview({
  need: acceptedNeed,
  fitResult: {
    schema: 'bitcode.asset-pack.fit-result',
    resultState: 'worthy_fit',
    resultReasons: ['worthy source-bound fit'],
    fitDepositAssetIds: ['deposit-1'],
    selectedCandidateAssetIds: ['deposit-1'],
    queryRoot: 'sha256:query',
    rankingRoot: 'sha256:ranking',
    searchedAssetCount: 1,
    embeddingPolicy: { provider: 'openai', model: 'text-embedding-3-small' },
    selectionTrace: {
      selectedCandidates: [
        {
          assetId: 'deposit-1',
          scores: { finalScore: 0.92 },
          proofEvidence: { proofRoot: 'sha256:proof' },
        },
      ],
      fitDeposits: [],
      blockedCandidates: [],
      candidateRanking: [],
      rejectedCandidateCount: 0,
    },
  },
  rangeStart: 42,
  tokenCount: 7,
  pullRequestTarget: 'https://github.com/engineeredsoftware/ENGI/pull/29',
  createdAt: '2026-05-20T00:00:00.000Z',
});

describe('AssetPack disclosure review', () => {
  it('projects source-safe preview policy into a reviewable paid-unlock posture', () => {
    const review = buildAssetPackDisclosureReview({ preview });

    expect(review).toMatchObject({
      schema: 'bitcode.asset-pack.disclosure-review',
      assetPackId: preview.assetPackId,
      previewId: preview.previewId,
      access: {
        readRightState: 'pending_settlement',
        sourceVisibility: 'withheld_before_settlement',
        readerAction: 'pay_to_unlock',
        sourceAvailable: false,
      },
      policy: {
        protectedSourceDisclosure: 'forbidden_before_settlement',
      },
      range: {
        rangeStart: 42,
        rangeEndExclusive: 49,
        tokenCount: 7,
      },
    });
    expect(review.policy.visibleBeforeSettlement).toContain('BTC quote');
    expect(review.policy.withheldBeforeSettlement).toContain('protected source content');
    expect(review.roots.reviewRoot).toMatch(/^sha256:/);
    expect(review.sourceLeakage.protectedSourceDetected).toBe(false);
    expect(summarizeAssetPackDisclosureReview(review)).toContain('no protected-source leakage');
  });

  it('distinguishes owner, licensed, and denied read-right states', () => {
    expect(buildAssetPackDisclosureReview({
      preview,
      readRightState: 'owner_read',
      sourceAvailable: true,
    }).access).toMatchObject({
      sourceVisibility: 'available_after_settlement',
      readerAction: 'read_as_owner',
    });
    expect(buildAssetPackDisclosureReview({
      preview,
      readRightState: 'licensed_read',
      sourceAvailable: true,
    }).access).toMatchObject({
      sourceVisibility: 'available_after_settlement',
      readerAction: 'read_as_licensee',
    });
    expect(buildAssetPackDisclosureReview({
      preview,
      readRightState: 'denied',
      sourceAvailable: false,
      reason: 'policy mismatch',
    }).access).toMatchObject({
      sourceVisibility: 'denied',
      readerAction: 'blocked',
      reason: 'policy mismatch',
    });
  });

  it('fails closed when preview metadata carries protected source markers', () => {
    const leakage = reviewAssetPackProtectedSourceLeakage({
      ...preview,
      protectedSourceContent: 'diff --git a/app.ts b/app.ts\n@@ -1 +1 @@\n-secret\n+secret',
    });

    expect(leakage.protectedSourceDetected).toBe(true);
    expect(leakage.findings.map((finding) => finding.reason)).toEqual(
      expect.arrayContaining(['forbidden_source_field', 'source_patch_marker']),
    );

    expect(() => assertAssetPackDisclosureSourceSafe({
      ...buildAssetPackDisclosureReview({ preview }),
      sourceLeakage: leakage,
    })).toThrow(/protected source/);
  });
});

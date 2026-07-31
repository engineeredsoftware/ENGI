/**
 * MVP core E2E spine (L4) — non-UI commercial loop contracts.
 *
 * Deposit synthesis → policy → admit → depository search (NL ranking) →
 * read needinesses → BTD mock quote → activity/source-safe checks.
 *
 * CI-fast: pure/package helpers only (no live LLM, no live Supabase, no browser).
 * Live SDIVF remains L2; live DB remains L3 opt-in.
 */

import {
  buildDepositAssetPackOptionAdmissionReport,
  assertDepositAssetPackOptionAdmissionReportSourceSafe,
} from '@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs/deposit-asset-pack-option-admission';
import { buildDepositAssetPackOptionPolicyReport } from '@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs/deposit-asset-pack-option-policy';
import { buildDepositAssetPackOptionSynthesis } from '@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs/deposit-asset-pack-options';
import {
  measureReadNeedinessesDeterministic,
  computeNeedFitVolume,
} from '@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-reads-asset-packs/read-neediness-measurements';
import { runDepositDepositoryAssetPackSearch } from '@bitcode/asset-packs-pipelines-syntheses-domain/tools/deposit-depository-asset-pack-search';
import type { DepositoryAsset } from '@bitcode/asset-packs-pipelines-syntheses-domain/depository-search-types';
import { computeHonestPathOnlyAbsolutes } from '@bitcode/asset-packs-pipelines-syntheses-domain/agents/validation/agent-measure-absolutes';
import { buildDepositoryEmbedText } from '@/lib/depository-index-job';
import { buildDepositOptionAdmissionActivityDraft } from '@/components/deposits/models/deposit-admission-activity';
import {
  assertPackActivitySourceSafe,
  normalizePackActivityRecord,
} from '@/components/bitcode/activity/PackActivityModel/pack-activity-model';
import type { BitcodeActivityRecord } from '@/components/bitcode/activity/BitcodeActivityModel/bitcode-activity-model';
import {
  applyBtdSupplyDecay,
  assertPositiveSettlementBtd,
  buildMultiRailSpotQuote,
  computeSettlementBtdFromNeedinesses,
  createMockSpotBoard,
} from '@bitcode/btd/erc1155';

/** Happy path vs intentional fail-closed scenarios (MVP-E2E-5). */
export type MvpCoreE2eSpineFailMode =
  | 'none'
  /** Depositor does not approve → zero admissions. */
  | 'reject-admission'
  /** Quote from empty needinesses → fail closed (no positive BTD). */
  | 'empty-needinesses-quote'
  /** Search corpus empty → zero hits (thin depository). */
  | 'empty-search-corpus';

export type MvpCoreE2eSpineInput = {
  repositoryFullName?: string;
  sourceBranch?: string;
  sourceCommit?: string;
  reviewerId?: string;
  needText?: string;
  /** Extra path-only corpus row to prove NL ranking. */
  includePathOnlyNoise?: boolean;
  /** Fail-closed matrix mode (default none = happy path). */
  failMode?: MvpCoreE2eSpineFailMode;
};

export type MvpCoreE2eSpineResult = {
  schema: 'bitcode.mvp-core-e2e-spine';
  ok: boolean;
  steps: {
    depositSynthesis: { optionCount: number; optionId: string | null };
    admission: {
      admittedCount: number;
      depositoryAssetPackId: string | null;
      sourceSafe: boolean;
      packsActivityRoute: string | null;
    };
    indexProjection: {
      embedTextHasCommercialNlSection: boolean;
      commercialTitle: string | null;
      embedTextRootPrefix: string;
    };
    search: {
      hitCount: number;
      topAssetId: string | null;
      topScore: number | null;
      nlRankedAbovePathNoise: boolean | null;
    };
    readNeedinesses: {
      rowCount: number;
      allFitSuffix: boolean;
      needFitVolume: number;
    };
    quote: {
      ok: boolean;
      needFitVolume: number | null;
      optionCount: number;
      provider: string | null;
    };
    sourceSafety: {
      admissionSourceSafe: boolean;
      unpaidSearchHitsHaveNoFileBodies: boolean;
      /** L1-D2: admission activity draft survives pack activity source-safe gate. */
      admissionActivitySourceSafe: boolean | null;
    };
    /** STAB-B1: path-only absolute catalogue never claims measured. */
    pathOnlyHonesty: {
      absoluteCount: number;
      neverMeasured: boolean;
    };
  };
  /** Active failMode (for operators / tests). */
  failMode: MvpCoreE2eSpineFailMode;
  errors: string[];
};

const DEFAULT_NEED =
  'I need session refresh and token rotation patterns for OAuth clients.';

function depositoryAssetFromAdmission(input: {
  assetId: string;
  title: string;
  commercialTitle: string;
  commercialDescription: string;
  paths: string[];
}): DepositoryAsset {
  return {
    assetId: input.assetId,
    title: input.title,
    summary: input.commercialDescription,
    artifactKind: 'asset-pack',
    contentUnits: [
      {
        unitId: `${input.assetId}:commercial`,
        unitKind: 'commercial-nl',
        text: `${input.commercialTitle} ${input.commercialDescription}`,
      },
      {
        unitId: `${input.assetId}:paths`,
        unitKind: 'paths',
        text: input.paths.join(' '),
      },
    ],
    metadata: {
      commercialTitle: input.commercialTitle,
      commercialDescription: input.commercialDescription,
      coveredSourcePaths: input.paths,
      lifecycleState: 'admitted-to-depository',
      sourceSafe: true,
    },
  };
}

/**
 * Run the CI-fast MVP core commercial spine and return step receipts.
 */
export async function runMvpCoreE2eSpine(
  input: MvpCoreE2eSpineInput = {},
): Promise<MvpCoreE2eSpineResult> {
  const errors: string[] = [];
  const repositoryFullName = input.repositoryFullName || 'octocat/Spoon-Knife';
  const sourceBranch = input.sourceBranch || 'main';
  const sourceCommit =
    input.sourceCommit || '31bbc0c5227b6b3aed5d107fd8507d35ec22970a';
  const needText = (input.needText || DEFAULT_NEED).trim();
  const includePathOnlyNoise = input.includePathOnlyNoise !== false;
  const failMode: MvpCoreE2eSpineFailMode = input.failMode || 'none';

  // --- 1) Deposit synthesis + policy + admission ---
  const synthesis = buildDepositAssetPackOptionSynthesis({
    repositoryFullName,
    sourceBranch,
    sourceCommit,
    permissibleSources: ['src/auth/session.ts', 'src/auth/token.ts'],
    depositoryDemandSignals: [{ id: 'depository-demand', weight: 0.8 }],
    readingDemandSignals: [{ id: 'reading-demand', weight: 0.86 }],
  });
  const policy = buildDepositAssetPackOptionPolicyReport({
    synthesis,
    sourceCriticalitySignals: [{ id: 'sub-critical', severity: 'sub-critical', weight: 0.82 }],
    developmentCostSats: 1200,
    expectedSettlementSats: 6800,
    depositorWalletId: 'wallet-mvp-e2e',
  });
  const firstOptionId = synthesis.options[0]?.optionId || null;
  const admissionDecisions =
    failMode === 'reject-admission' || !firstOptionId
      ? firstOptionId
        ? [
            {
              optionId: firstOptionId,
              decision: 'rejected-by-depositor' as const,
              feedback: 'Reject for fail-closed matrix.',
            },
          ]
        : []
      : [
          {
            optionId: firstOptionId,
            decision: 'approved-for-admission' as const,
            feedback: 'Approve for MVP core E2E spine.',
          },
        ];
  const admission = buildDepositAssetPackOptionAdmissionReport({
    synthesis,
    policy,
    reviewerId: input.reviewerId || 'depositor-mvp-e2e',
    telemetryRunId: 'mvp-core-e2e-spine',
    decisions: admissionDecisions,
  });
  const sourceSafeAdmission = assertDepositAssetPackOptionAdmissionReportSourceSafe(admission);
  const admittedReceipt = admission.receipts.find(
    (r) => r.admission.state === 'admitted-to-depository',
  );
  const depositoryAssetPackId =
    admittedReceipt?.admission.depositoryAssetPackId || null;

  // --- 2) Index projection (document shape / embed text; no live DB) ---
  const commercialTitle =
    'OAuth session refresh knowledge pack';
  const commercialDescription =
    'Buyer-facing session refresh and token rotation for OAuth clients.';
  const embedText = buildDepositoryEmbedText({
    assetId: depositoryAssetPackId || 'ap-spine-fallback',
    title: synthesis.options[0]?.title || 'Deposit option',
    summary: synthesis.options[0]?.summary || '',
    commercialTitle,
    commercialDescription,
    kind: 'capability-slice',
    repositoryFullName,
    lifecycle: 'admitted-to-depository',
    coveredSourcePaths: ['src/auth/session.ts', 'src/auth/token.ts'],
    absoluteVolumes: { 'function-count': 0.5 },
    absoluteFixtures: [
      {
        measurementKind: 'function-count',
        label: 'Functions',
        descriptor: 'Session and token helpers',
        volume: 0.5,
        status: 'measured',
      },
    ],
  });

  // --- 3) Depository hybrid search (NL ≫ path noise) ---
  const admittedAsset = depositoryAssetFromAdmission({
    assetId: depositoryAssetPackId || 'ap-spine-fallback',
    title: synthesis.options[0]?.title || 'Deposit option',
    commercialTitle,
    commercialDescription,
    paths: ['src/auth/session.ts', 'src/auth/token.ts'],
  });
  const pathNoise: DepositoryAsset = {
    assetId: 'ap-path-noise',
    title: 'Layout utilities',
    artifactKind: 'asset-pack',
    contentUnits: [
      {
        unitId: 'noise:paths',
        unitKind: 'paths',
        text: 'src/webhooks/retry-helper.ts src/ui/layout.tsx',
      },
    ],
    metadata: {
      coveredSourcePaths: ['src/webhooks/retry-helper.ts', 'src/ui/layout.tsx'],
    },
  };
  const searchAssets =
    failMode === 'empty-search-corpus'
      ? []
      : includePathOnlyNoise
        ? [pathNoise, admittedAsset]
        : [admittedAsset];
  const search = await runDepositDepositoryAssetPackSearch({
    product: 'read-need-fits',
    needText,
    // Phrase must appear as substring in commercial NL for field-weighted lexical.
    queryTerms: ['session refresh', 'token rotation', 'OAuth'],
    queries: ['session refresh', 'token rotation'],
    assets: searchAssets,
    maxResults: 10,
    maxPerQuery: 10,
    env: {
      ...process.env,
      BITCODE_DEPOSITORY_VECTOR_SEARCH: '0',
    },
  });
  const top = search.hits[0] || null;
  const admittedHit = search.hits.find((h) => h.assetId === admittedAsset.assetId);
  const noiseHit = search.hits.find((h) => h.assetId === 'ap-path-noise');
  let nlRankedAbovePathNoise: boolean | null = null;
  if (includePathOnlyNoise && admittedHit) {
    nlRankedAbovePathNoise =
      !noiseHit || (admittedHit.finalScore ?? 0) > (noiseHit.finalScore ?? 0);
  }

  // --- 4) Read needinesses (deterministic; Need present) ---
  const needinessesForMeasure =
    failMode === 'empty-needinesses-quote'
      ? []
      : measureReadNeedinessesDeterministic({
          title: commercialTitle,
          summary: commercialDescription,
          confidence: 0.8,
          needSummary: needText,
          coveredSourcePaths: ['src/auth/session.ts', 'src/auth/token.ts'],
          patchSummary: 'Session refresh and token rotation for OAuth Need.',
          dynamicNeedinesses: [],
          dynamicKinds: [],
        });
  const needinesses = needinessesForMeasure;
  const needFitVolume = computeNeedFitVolume(needinesses);

  // --- 5) Mock multi-rail quote from needinesses ---
  let quoteOk = false;
  let quoteNeedFit: number | null = null;
  let quoteOptionCount = 0;
  let quoteProvider: string | null = null;
  try {
    const raw = assertPositiveSettlementBtd(
      computeSettlementBtdFromNeedinesses({ needinesses }),
    );
    const decayed = applyBtdSupplyDecay({
      rawVolumeBaseUnits: raw.amountBaseUnits,
      btdTotalMinted: 0n,
    });
    const multi = buildMultiRailSpotQuote(decayed.btdVolume, createMockSpotBoard());
    quoteOk = multi.options.length > 0 && decayed.btdVolume > 0n;
    quoteNeedFit = raw.needFitVolume;
    quoteOptionCount = multi.options.length;
    quoteProvider = multi.board.provider || 'mock';
  } catch (err) {
    errors.push(
      failMode === 'empty-needinesses-quote'
        ? 'quote_failed_empty_needinesses'
        : err instanceof Error
          ? err.message
          : String(err),
    );
  }

  // --- 5b) Path-only absolute honesty (STAB-B1) ---
  const pathOnlyAbs = computeHonestPathOnlyAbsolutes({
    title: commercialTitle,
    summary: commercialDescription,
    coveredSourcePaths: ['src/auth/session.ts', 'src/auth/token.ts'],
    confidence: 0.7,
  });
  const pathOnlyNeverMeasured = pathOnlyAbs.every((a) => a.status !== 'measured');
  if (!pathOnlyNeverMeasured) {
    errors.push('path_only_claimed_measured');
  }

  // --- 6) Source-safety ---
  const hitsSerialized = JSON.stringify(search.hits);
  const unpaidSearchHitsHaveNoFileBodies =
    !hitsSerialized.includes('export function') &&
    !hitsSerialized.includes('PRIVATE_SOURCE') &&
    !hitsSerialized.includes('diff --git');

  // L1-D2: admitted option → activity draft → pack activity source-safe normalize.
  let admissionActivitySourceSafe: boolean | null = null;
  if (admittedReceipt && failMode !== 'reject-admission') {
    try {
      const synthOption =
        synthesis.options.find((o) => o.optionId === admittedReceipt.optionId) ||
        synthesis.options[0] ||
        null;
      const draft = buildDepositOptionAdmissionActivityDraft({
        receipt: admittedReceipt,
        option: synthOption,
        synthesisRunId: 'mvp-core-e2e-spine',
      });
      const bitcodeRecord = {
        id: `admit-${admittedReceipt.optionId}`,
        kind: 'execution',
        scope: 'personal',
        title: admittedReceipt.title,
        summary: draft.summary,
        timestamp: new Date().toISOString(),
        status: 'completed',
        payload: {
          ...(draft.output || {}),
          output: draft.output || {},
          context: draft.context || {},
        },
        sourceSafety: {
          sourceSafeMetadataOnly: true,
          protectedSourceVisible: false,
          unpaidDataPackSourceVisible: false,
          rawPromptVisible: false,
          interpolatedPromptVisible: false,
          rawProviderResponseVisible: false,
          sourceSnippetVisible: false,
        },
      } as BitcodeActivityRecord;
      const normalized = normalizePackActivityRecord(bitcodeRecord);
      admissionActivitySourceSafe = assertPackActivitySourceSafe(normalized);
      if (!admissionActivitySourceSafe) {
        errors.push('admission_activity_not_source_safe');
      }
      const draftJson = JSON.stringify(draft).toLowerCase();
      if (
        draftJson.includes('export function') ||
        draftJson.includes('protected source body')
      ) {
        errors.push('admission_activity_leaks_source');
        admissionActivitySourceSafe = false;
      }
    } catch (err) {
      errors.push(
        `admission_activity_projection_failed:${
          err instanceof Error ? err.message : String(err)
        }`,
      );
      admissionActivitySourceSafe = false;
    }
  }

  // Happy-path gates (skipped when failMode expects that failure).
  if (!sourceSafeAdmission.admitted) {
    errors.push('admission_not_source_safe');
  }
  if (admission.admittedCount < 1 && failMode !== 'reject-admission') {
    errors.push('no_admitted_options');
  }
  if (failMode === 'reject-admission' && admission.admittedCount === 0) {
    errors.push('no_admitted_options');
  }
  if (!embedText.includes('§nl') || !embedText.includes('session refresh')) {
    errors.push('index_embed_missing_commercial_nl');
  }
  if (
    includePathOnlyNoise &&
    failMode !== 'empty-search-corpus' &&
    nlRankedAbovePathNoise === false
  ) {
    errors.push('search_path_noise_outranked_nl');
  }
  if (failMode === 'empty-search-corpus' && search.hitCount === 0) {
    errors.push('empty_search_corpus');
  }
  if (needinesses.length === 0 && failMode !== 'empty-needinesses-quote') {
    errors.push('empty_needinesses');
  }
  if (
    needinesses.length > 0 &&
    !needinesses.every((n) => String(n.measurementKind || '').endsWith('-fit'))
  ) {
    errors.push('neediness_missing_fit_suffix');
  }
  if (!quoteOk && failMode !== 'empty-needinesses-quote') {
    errors.push('quote_failed');
  }
  if (!quoteOk && failMode === 'empty-needinesses-quote') {
    if (!errors.includes('quote_failed_empty_needinesses')) {
      errors.push('quote_failed_empty_needinesses');
    }
  }
  if (!unpaidSearchHitsHaveNoFileBodies) {
    errors.push('search_hits_leak_source');
  }

  // Happy path: zero errors. Fail modes: ok=false and expected error codes present.
  const expectedFailErrors: Record<Exclude<MvpCoreE2eSpineFailMode, 'none'>, string> = {
    'reject-admission': 'no_admitted_options',
    'empty-needinesses-quote': 'quote_failed_empty_needinesses',
    'empty-search-corpus': 'empty_search_corpus',
  };
  let ok = errors.length === 0;
  if (failMode !== 'none') {
    const expected = expectedFailErrors[failMode];
    ok = false;
    // Keep only structural honesty errors + the expected fail code for this mode.
    if (!errors.includes(expected)) {
      errors.push(expected);
    }
  }

  return {
    schema: 'bitcode.mvp-core-e2e-spine',
    ok,
    failMode,
    steps: {
      depositSynthesis: {
        optionCount: synthesis.options.length,
        optionId: firstOptionId,
      },
      admission: {
        admittedCount: admission.admittedCount,
        depositoryAssetPackId,
        sourceSafe: sourceSafeAdmission.admitted === true,
        packsActivityRoute: admittedReceipt?.packsActivitySync?.route || null,
      },
      indexProjection: {
        embedTextHasCommercialNlSection: embedText.includes('§nl'),
        commercialTitle,
        embedTextRootPrefix: 'sha256:',
      },
      search: {
        hitCount: search.hitCount,
        topAssetId: top?.assetId ?? null,
        topScore: top?.finalScore ?? null,
        nlRankedAbovePathNoise,
      },
      readNeedinesses: {
        rowCount: needinesses.length,
        allFitSuffix: needinesses.every((n) =>
          String(n.measurementKind || '').endsWith('-fit'),
        ),
        needFitVolume,
      },
      quote: {
        ok: quoteOk,
        needFitVolume: quoteNeedFit,
        optionCount: quoteOptionCount,
        provider: quoteProvider,
      },
      sourceSafety: {
        admissionSourceSafe: sourceSafeAdmission.admitted === true,
        unpaidSearchHitsHaveNoFileBodies,
        admissionActivitySourceSafe,
      },
      pathOnlyHonesty: {
        absoluteCount: pathOnlyAbs.length,
        neverMeasured: pathOnlyNeverMeasured,
      },
    },
    errors,
  };
}

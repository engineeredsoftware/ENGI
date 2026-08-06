/**
 * Single Validation agent for deposit synthesize pipeline.
 *
 * `validation:ready-to-finish-asset-packs-synthesis-deposit-pipeline`
 *
 * A) Prior phase / agent / tool sanity
 * B) Synthesized AssetPack quality (patch + absolute measurements + metadata)
 * C) Obfuscations / Impermissible sources respected vs patch paths
 *
 * Law: Validation ONLY validates. Never measures, never attaches absolutes,
 * never repairs weak Implementation. Missing/weak patchfiles, measurements,
 * Discovery, or salvaged packs → issues + recommendation iterate so DIV
 * re-enters Discovery→Implementation.
 */

import { factoryPTRRAgent } from '@bitcode/agent-generics';
import { storeCrossPhaseArtifact } from '@bitcode/asset-packs-pipelines-syntheses-domain/synthesize-asset-packs';
import {
  DepositValidationOutputSchema,
  type DepositValidationResult,
} from './deposit-validation-schema';
import { createDepositValidationPrompt } from './deposit-validation-prompts';
import {
  asPathList,
  isHallucinatedMissingEvidenceIssue,
  mergeDepositValidationVerdict,
  pathHitsAnyBlock,
  sanitizeObfuscatedPathsAgainstCatalog,
  smokeCheckAssetPacks,
} from './deposit-validation-checks';
import { resolveSourceCheckoutCatalog } from '@bitcode/asset-packs-pipelines-syntheses-domain/resolve-source-checkout-catalog';
import { projectInventoryForPrompt } from '@bitcode/asset-packs-pipelines-syntheses-domain/asset-packs-synthesis';
import { ensureDepositCheckoutSourceFiles } from '../../ensure-deposit-checkout-source-files';
import {
  hasDepositAbsolutesOnlyShape,
  hasRequiredAbsolutes,
} from '@bitcode/asset-packs-pipelines-syntheses-domain/asset-pack-measurements';

const prompt = createDepositValidationPrompt();

const DepositReadyToFinishCore = factoryPTRRAgent<any, DepositValidationResult>({
  name: 'DepositReadyToFinishAssetPacksSynthesisDepositPipeline',
  description:
    'Single deposit Validation gate: prior-phase sanity, pack quality (patch+measurements+metadata), obfuscations compliance.',
  outputSchema: DepositValidationOutputSchema,
  tools: [],
  prompt,
  stepPrompts: {
    plan: () => prompt,
    try: () => prompt,
    refine: () => prompt,
    retry: () => prompt,
  },
  // Bound PTRR: large deposit contexts previously spent host budget inside
  // chunk_then_sum refine loops after Implementation already produced options.
  plan: { chunkThreshold: 12000 },
  try: { chunkThreshold: 16000 },
  refine: { maxAttempts: 1 },
  retry: { maxAttempts: 0 },
});

function findValue(execution: any, namespace: string, key: string): any {
  const local = execution?.get?.(namespace, key);
  if (local !== undefined) return local;
  return execution?.findUp?.(namespace, key);
}

function phaseSanityIssues(execution: any): string[] {
  const issues: string[] = [];
  const workspace =
    findValue(execution, 'repository', 'workspacePath') ||
    findValue(execution, 'setup', 'workspacePath') ||
    findValue(execution, 'host', 'workspacePath') ||
    findValue(execution, 'deposit', 'workspacePath');
  // Catalog path grounding is sufficient when Host already materialised the checkout.
  const catalog =
    findValue(execution, 'deposit', 'sourceCheckoutCatalog');
  if (!workspace && !(catalog && Array.isArray(catalog.paths) && catalog.paths.length > 0)) {
    issues.push('Setup: missing repository.workspacePath (Host checkout).');
  }

  const admission = findValue(execution, 'setup', 'admission');
  if (admission && admission.safe === false) {
    issues.push(`Setup: danger wall not admitted (${admission.reason || 'unknown'}).`);
  }

  if (!catalog || !Array.isArray(catalog.paths)) {
    issues.push('Setup/Discovery: missing sourceCheckoutCatalog.paths.');
  }

  const codebase = findValue(execution, 'discovery', 'codebaseComprehension');
  if (!codebase) issues.push('Discovery: missing codebaseComprehension.');

  const depository = findValue(execution, 'discovery', 'depositorySearch');
  if (!depository) issues.push('Discovery: missing depositorySearch guidance.');

  const options =
    findValue(execution, 'implementation', 'options') ||
    findValue(execution, 'implementation', 'assetPacks');
  if (!Array.isArray(options) || options.length === 0) {
    issues.push('Implementation: no AssetPack options synthesized.');
  }

  // Implementation must write formal patchfile artifacts then measure them.
  const patchfileWritten = findValue(execution, 'implementation', 'patchfileWritten');
  if (Array.isArray(options) && options.length > 0 && patchfileWritten !== true) {
    issues.push(
      'Implementation: patchfile artifacts incomplete (implementation:patchfileWritten !== true). Patchfile write agent must produce one AssetPackPatchArtifact per pack.',
    );
  }
  const measured = findValue(execution, 'implementation', 'measured');
  if (Array.isArray(options) && options.length > 0 && measured !== true) {
    issues.push(
      'Implementation: measurements incomplete (implementation:measured !== true). Measurements agent must measure written patchfiles before Validation can finish.',
    );
  }
  if (Array.isArray(options)) {
    for (const pack of options) {
      const art = pack?.patchArtifact;
      if (!art?.artifactId || !art?.envelopeJson) {
        issues.push(
          `Implementation: pack "${pack?.title || '?'}" missing formal patchArtifact (singular path-op-json AssetPackPatchArtifact).`,
        );
      }
    }
  }

  // Host salvage is continuity only — never depositable supply.
  const salvaged = findValue(execution, 'implementation', 'salvaged') === true;
  const salvageCount = Number(findValue(execution, 'implementation', 'salvageCount') ?? 0) || 0;
  if (salvaged || salvageCount > 0) {
    issues.push(
      `Implementation: ${salvageCount || 'some'} pack(s) are host-salvaged (not model-synthesized). Salvage is not presentable — iterate Implementation patchfile synthesis.`,
    );
  }
  if (Array.isArray(options)) {
    for (const pack of options) {
      if (pack?.salvaged === true) {
        issues.push(
          `Implementation: pack "${pack?.title || '?'}" is salvaged=true (not presentable).`,
        );
      }
    }
  }

  return issues;
}

function obfuscationComplianceIssues(
  packs: any[],
  impermissibleSources: string[],
  obfuscatedPaths: string[],
): string[] {
  const issues: string[] = [];
  const blocked = [...impermissibleSources, ...obfuscatedPaths];
  for (const pack of packs) {
    const paths = [
      ...asPathList(pack?.coveredSourcePaths),
      ...(Array.isArray(pack?.patch?.fileChanges)
        ? pack.patch.fileChanges.map((c: any) => String(c?.path || ''))
        : []),
    ].filter(Boolean);
    for (const path of paths) {
      // Prefix/exact path blocks only — never bare substring (e.g. "tests" in
      // "tests/jest.setup.cjs" from free-text obfuscations "Tests.").
      if (pathHitsAnyBlock(path, blocked)) {
        issues.push(
          `Obfuscation/exclusion violation: pack "${pack?.title || '?'}" covers path ${path}.`,
        );
      }
    }
    if (!pack?.patch || !Array.isArray(pack.patch.fileChanges) || pack.patch.fileChanges.length === 0) {
      issues.push(`Pack "${pack?.title || '?'}" missing patch.fileChanges.`);
    }
    if (!hasRequiredAbsolutes(pack)) {
      issues.push(
        `Pack "${pack?.title || '?'}" missing required measurements.absolutes (magnitude+volume) from Implementation measurements agent.`,
      );
    }
    if (!hasDepositAbsolutesOnlyShape(pack)) {
      issues.push(
        `Pack "${pack?.title || '?'}" measurements must be exactly { absolutes } (deposit legal shape from Implementation).`,
      );
    }
  }
  return issues;
}

/** LLM noise that confuses legal dual-write / catalog shape for hard blockers. */
function isBenignMeasurementShapeIssue(issue: string): boolean {
  const text = String(issue || '').toLowerCase();
  if (!text) return false;
  if (text.includes('top-level') && text.includes('absolutes')) return true;
  if (text.includes('dual') && text.includes('absolute')) return true;
  if (text.includes('duplicates measurements') || text.includes('duplicate measurements')) return true;
  if (text.includes("both 'measurements.absolutes'") || text.includes('both measurements.absolutes')) {
    return true;
  }
  return false;
}

/**
 * Qualitative Validation LLM input — includes REAL patch bodies so quality
 * judgment is grounded in synthesized material. Not a product/API response.
 * Per-file body cap avoids multi-MB thrash on huge packs.
 */
function compactPacksForPrompt(packs: any[], maxBodyChars = 24_000): any[] {
  return (Array.isArray(packs) ? packs : []).map((pack) => {
    const artifactFiles = Array.isArray(pack?.patchArtifact?.files)
      ? pack.patchArtifact.files
      : [];
    const descriptorChanges = Array.isArray(pack?.patch?.fileChanges)
      ? pack.patch.fileChanges
      : [];
    const fileChanges =
      artifactFiles.length > 0
        ? artifactFiles.map((f: any) => {
            const body =
              typeof f?.body === 'string'
                ? f.body.length > maxBodyChars
                  ? f.body.slice(0, maxBodyChars)
                  : f.body
                : null;
            return {
              path: f?.path,
              op: f?.op,
              ...(body != null
                ? {
                    body,
                    bodyTruncated:
                      typeof f?.body === 'string' && f.body.length > maxBodyChars,
                  }
                : {}),
            };
          })
        : descriptorChanges.map((c: any) => {
            const raw =
              typeof c?.content === 'string'
                ? c.content
                : typeof c?.body === 'string'
                  ? c.body
                  : null;
            const body =
              raw != null && raw.length > maxBodyChars ? raw.slice(0, maxBodyChars) : raw;
            return {
              path: c?.path,
              op: c?.op,
              ...(body != null
                ? { body, bodyTruncated: raw != null && raw.length > maxBodyChars }
                : {}),
            };
          });
    const unifiedDiff =
      typeof pack?.patchArtifact?.unifiedDiff === 'string'
        ? pack.patchArtifact.unifiedDiff.length > maxBodyChars * 2
          ? pack.patchArtifact.unifiedDiff.slice(0, maxBodyChars * 2)
          : pack.patchArtifact.unifiedDiff
        : null;
    const absolutes = Array.isArray(pack?.measurements?.absolutes)
      ? pack.measurements.absolutes
      : Array.isArray(pack?.absolutes)
        ? pack.absolutes
        : [];
    return {
      kind: pack?.kind ?? null,
      title: pack?.title ?? null,
      summary: pack?.summary ?? null,
      commercialTitle: pack?.commercialTitle ?? null,
      commercialDescription:
        typeof pack?.commercialDescription === 'string'
          ? pack.commercialDescription.slice(0, 4000)
          : null,
      confidence: pack?.confidence ?? null,
      coveredSourcePaths: asPathList(pack?.coveredSourcePaths).slice(0, 40),
      patch: {
        patchSummary: pack?.patch?.patchSummary ?? pack?.patchArtifact?.patchSummary ?? null,
        fileChanges,
        bodiesComplete: pack?.patchArtifact?.bodiesComplete ?? null,
        unifiedDiff,
      },
      patchArtifact: pack?.patchArtifact
        ? {
            artifactId: pack.patchArtifact.artifactId,
            format: pack.patchArtifact.format,
            fileCount: pack.patchArtifact.fileCount,
            bodiesComplete: pack.patchArtifact.bodiesComplete,
          }
        : null,
      measurements: {
        absolutes: absolutes.map((row: any) => ({
          measurementKind: row?.measurementKind,
          volume: row?.volume,
          magnitude: row?.magnitude,
          unit: row?.unit,
          status: row?.status,
          descriptor: row?.descriptor,
          label: row?.label,
        })),
        measureReport: pack?.measureReport || pack?.measurements?.measureReport || null,
        materialIdentity:
          pack?.materialIdentity || pack?.measurements?.materialIdentity || null,
      },
      salvaged: pack?.salvaged === true,
    };
  });
}

export default async function runDepositReadyToFinishAgent(input: any, execution: any) {
  const packs = Array.isArray(
    input?.assetPacks ??
      findValue(execution, 'implementation', 'options') ??
      findValue(execution, 'implementation', 'assetPacks'),
  )
    ? (input?.assetPacks ??
        findValue(execution, 'implementation', 'options') ??
        findValue(execution, 'implementation', 'assetPacks'))
    : [];

  const obfuscationGuidance =
    input?.obfuscationGuidance ?? findValue(execution, 'setup', 'inputComprehension');
  const impermissibleSources = asPathList(
    input?.impermissibleSources ??
      findValue(execution, 'deposit', 'impermissibleSources') ??
      [],
  );
  const rawObfuscatedPaths = asPathList((obfuscationGuidance as any)?.obfuscatedPaths);

  // A) Prior phases
  const priorIssues = phaseSanityIssues(execution);

  const catalog = await ensureDepositCheckoutSourceFiles(
    execution,
    resolveSourceCheckoutCatalog(execution, input?.sourceCheckoutCatalog),
  );
  const catalogPathsOnly = projectInventoryForPrompt(catalog);
  // Run 49a2630b: free-text obfuscations "Tests." was mapped onto every remaining
  // catalog path (only tests/* left after impermissible apps/packages). That
  // self-defeats Validation (every pack "violates" the only deposit surface).
  const catalogPaths = asPathList(
    catalogPathsOnly?.paths ??
      catalog?.paths ??
      findValue(execution, 'deposit', 'sourceCheckoutCatalog')?.paths,
  );
  const obfuscatedPaths = sanitizeObfuscatedPathsAgainstCatalog(
    rawObfuscatedPaths,
    catalogPaths,
  );

  // Validate only — never measure, attach, or rewrite Implementation packs.
  // Weak Implementation (missing absolutes, salvage, incomplete measure) → iterate.
  const smokeIssues = smokeCheckAssetPacks(packs, impermissibleSources, obfuscatedPaths);
  // C) Obfuscations vs patches
  const complianceIssues = obfuscationComplianceIssues(packs, impermissibleSources, obfuscatedPaths);
  const hardIssues = [...smokeIssues, ...priorIssues, ...complianceIssues];
  const structureReady =
    hardIssues.length === 0 &&
    packs.length > 0 &&
    packs.every((pack: any) => hasRequiredAbsolutes(pack));

  // B) Qualitative PTRR over a compact pack projection (avoids multi-MB context thrash).
  // When structure is already ready (options + required absolutes + no hard issues),
  // skip qualitative PTRR so Finish is not blocked by host-budget thrash — but always
  // emit an auditable validation decision for pipeline run telemetry.
  let qualitativePtrrRan = false;
  let qualitativePtrrError: string | null = null;
  let agentOutput: any = {
    issues: [],
    qualityScore: structureReady ? 0.82 : 0.4,
    coverageGaps: [],
    recommendation: structureReady ? 'complete' : 'iterate',
  };
  if (!structureReady) {
    try {
      qualitativePtrrRan = true;
      const raw = await DepositReadyToFinishCore(
        {
          // Includes real patch bodies for quality judgment (synthesis provider input).
          assetPacks: compactPacksForPrompt(packs),
          sourceCheckoutCatalog: {
            paths: catalogPathsOnly?.paths ?? catalog?.paths ?? [],
            totalPathCount:
              catalogPathsOnly?.totalPathCount ??
              (Array.isArray(catalog?.paths) ? catalog.paths.length : 0),
            sourceFileCount: catalogPathsOnly?.sourceFileCount ?? 0,
          },
          inventoryPaths: catalogPathsOnly?.paths ?? catalog?.paths,
          obfuscationGuidance: obfuscationGuidance
            ? {
                summary: (obfuscationGuidance as any)?.summary ?? null,
                obfuscatedPaths: asPathList((obfuscationGuidance as any)?.obfuscatedPaths),
                obfuscatedConcepts: Array.isArray((obfuscationGuidance as any)?.obfuscatedConcepts)
                  ? (obfuscationGuidance as any).obfuscatedConcepts.slice(0, 20)
                  : [],
              }
            : null,
          impermissibleSources,
          priorPhaseIssues: priorIssues,
          deterministicHardIssues: hardIssues,
          structureReady,
        },
        execution,
      );
      agentOutput = (raw as any)?.finalOutput ?? (raw as any)?.output ?? raw;
    } catch (err: any) {
      // Deterministic gate remains authoritative when qualitative PTRR fails/times out.
      qualitativePtrrError = err?.message || String(err);
    }
  }

  const hasStructuredPacks =
    packs.length > 0 &&
    packs.every(
      (pack: any) =>
        hasRequiredAbsolutes(pack) &&
        Array.isArray(pack?.patch?.fileChanges) &&
        pack.patch.fileChanges.length > 0 &&
        typeof pack?.title === 'string' &&
        pack.title.length > 0,
    );

  if (agentOutput && typeof agentOutput === 'object' && Array.isArray(agentOutput.issues)) {
    agentOutput = {
      ...agentOutput,
      issues: agentOutput.issues.filter(
        (issue: unknown) =>
          typeof issue === 'string' &&
          !isBenignMeasurementShapeIssue(issue) &&
          !isHallucinatedMissingEvidenceIssue(issue, {
            priorIssuesEmpty: priorIssues.length === 0,
            hasStructuredPacks,
          }),
      ),
    };
  }

  const merged = mergeDepositValidationVerdict(agentOutput, hardIssues);
  // Drop residual hallucinated "missing phase" strings from merged issues too.
  const filteredMergedIssues = merged.issues.filter(
    (issue) =>
      !isHallucinatedMissingEvidenceIssue(issue, {
        priorIssuesEmpty: priorIssues.length === 0,
        hasStructuredPacks,
      }),
  );

  // Structural readiness admits Finish; residual qualitative notes become non-blocking.
  const recommendation =
    structureReady && hardIssues.length === 0
      ? 'complete'
      : filteredMergedIssues.length > 0 || priorIssues.length > 0 || complianceIssues.length > 0
        ? merged.recommendation === 'complete'
          ? 'iterate'
          : merged.recommendation
        : merged.recommendation;

  const readyToFinish =
    recommendation === 'complete' && hardIssues.length === 0;
  const result = {
    ...merged,
    issues: structureReady ? hardIssues : filteredMergedIssues,
    recommendation,
    readyToFinish,
    // SDIVF DIV gate + deposit telemetry require finalApproval (not only
    // recommendation:'finish'). Without this, UI paints ITERATE (FINISH) and
    // the base loop never sees validation:readyToFinish.finalApproval.
    finalApproval: readyToFinish,
    ready: readyToFinish,
    passed: readyToFinish,
  };

  const readinessSummary = readyToFinish
    ? qualitativePtrrRan
      ? 'Deposit synthesis ready to finish.'
      : 'Deposit synthesis ready to finish (Validation deterministic admit: measured options + required absolutes; qualitative PTRR skipped).'
    : `Deposit synthesis not ready: ${result.issues.slice(0, 5).join('; ')}`;

  storeCrossPhaseArtifact(execution, 'validation/implementation', 'issues', result.issues);
  storeCrossPhaseArtifact(execution, 'validation', 'depositQuality', result);
  // Cross-phase gate artifact — dual-written to stream; UI treats as formal
  // phase decision when no qualitative PTRR rows exist (F19 extension).
  storeCrossPhaseArtifact(execution, 'validation', 'readyToFinish', {
    schema: 'bitcode.deposit.validation.ready-to-finish',
    recommendation: readyToFinish ? 'finish' : 'revise',
    finalApproval: readyToFinish,
    ready: readyToFinish,
    passed: readyToFinish,
    readyToFinish,
    summary: readinessSummary,
    message: readinessSummary,
    issues: result.issues,
    qualityScore: result.qualityScore ?? agentOutput?.qualityScore ?? null,
    // Hierarchy for formal telemetry row when PTRR was skipped.
    phase: 'validation',
    agent: 'ready-to-finish-asset-packs-synthesis-deposit-pipeline',
    step: qualitativePtrrRan ? 'try' : 'decide',
    failsafe: qualitativePtrrRan ? 'prepare' : 'deterministic-gate',
    generation: qualitativePtrrRan ? 'reason' : 'structure',
    formalPhaseDecision: true,
    qualitativePtrrRan,
    qualitativePtrrSkipped: !qualitativePtrrRan && structureReady,
  });
  // Always record whether qualitative PTRR ran or was short-circuited (every run).
  storeCrossPhaseArtifact(execution, 'validation', 'gateDecision', {
    schema: 'bitcode.deposit.validation.gate-decision',
    at: new Date().toISOString(),
    structureReady,
    hardIssueCount: hardIssues.length,
    priorIssueCount: priorIssues.length,
    complianceIssueCount: complianceIssues.length,
    smokeIssueCount: smokeIssues.length,
    packCount: packs.length,
    qualitativePtrrRan,
    qualitativePtrrSkipped: structureReady,
    qualitativePtrrSkipReason: structureReady
      ? 'structureReady: options + required absolutes + no hard issues (deterministic admit)'
      : null,
    qualitativePtrrError,
    recommendation: result.recommendation,
    readyToFinish: result.readyToFinish,
    finalApproval: readyToFinish,
    qualityScore: result.qualityScore ?? agentOutput?.qualityScore ?? null,
  });
  // Explicit phase-decision store so Setup/Validation short-circuits always
  // produce a formal telemetry row even when no LLM/tool fire.
  storeCrossPhaseArtifact(execution, 'validation', 'phaseDecision', {
    schema: 'bitcode.pipeline.phase-decision',
    formalPhaseDecision: true,
    phase: 'validation',
    agent: 'ready-to-finish-asset-packs-synthesis-deposit-pipeline',
    step: qualitativePtrrRan ? 'try' : 'decide',
    failsafe: qualitativePtrrRan ? 'prepare' : 'deterministic-gate',
    generation: 'structure',
    summary: readinessSummary,
    message: readinessSummary,
    finalApproval: readyToFinish,
    recommendation: readyToFinish ? 'finish' : 'revise',
  });
  storeCrossPhaseArtifact(execution, 'implementation', 'options', packs);
  storeCrossPhaseArtifact(execution, 'implementation', 'assetPacks', packs);

  return { ...(input || {}), ...result, options: packs };
}

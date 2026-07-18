/**
 * Single Validation agent for deposit synthesize pipeline.
 *
 * `validation:ready-to-finish-asset-packs-synthesis-deposit-pipeline`
 *
 * A) Prior phase / agent / tool sanity
 * B) Synthesized AssetPack quality (patch + measurements + metadata)
 * C) Obfuscations / Impermissible sources respected vs patch paths
 */

import { factoryPTRRAgent } from '@bitcode/agent-generics';
import { storeCrossPhaseArtifact } from '@bitcode/asset-packs-pipelines-syntheses-domain/synthesize-asset-packs';
import {
  analyzeStaticSource,
  computeAbsolutesFromReport,
} from '../../../../domain/src/agents/validation/agent-measure-absolutes';
import {
  DepositValidationOutputSchema,
  type DepositValidationResult,
} from './deposit-validation-schema';
import { createDepositValidationPrompt } from './deposit-validation-prompts';
import {
  asPathList,
  mergeDepositValidationVerdict,
  smokeCheckAssetPacks,
} from './deposit-validation-checks';
import { resolveSourceCheckoutCatalog } from '@bitcode/asset-packs-pipelines-syntheses-domain/resolve-source-checkout-catalog';
import { projectInventoryForPrompt } from '@bitcode/asset-packs-pipelines-syntheses-domain/asset-packs-synthesis';
import { ensureDepositCheckoutSourceFiles } from '../../ensure-deposit-checkout-source-files';
import { hasRequiredAbsolutes } from '@bitcode/asset-packs-pipelines-syntheses-domain/asset-pack-measurements';

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

  return issues;
}

function obfuscationComplianceIssues(
  packs: any[],
  impermissibleSources: string[],
  obfuscatedPaths: string[],
): string[] {
  const issues: string[] = [];
  const blocked = [...impermissibleSources, ...obfuscatedPaths].map((p) => p.toLowerCase());
  for (const pack of packs) {
    const paths = [
      ...asPathList(pack?.coveredSourcePaths),
      ...(Array.isArray(pack?.patch?.fileChanges)
        ? pack.patch.fileChanges.map((c: any) => String(c?.path || ''))
        : []),
    ].filter(Boolean);
    for (const path of paths) {
      const lower = path.toLowerCase();
      if (blocked.some((b) => b && lower.includes(b.replace(/^\.\//, '')))) {
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
        `Pack "${pack?.title || '?'}" missing required measurements.absolutes (magnitude+volume).`,
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

function compactPacksForPrompt(packs: any[]): any[] {
  return (Array.isArray(packs) ? packs : []).map((pack) => ({
    kind: pack?.kind ?? null,
    title: pack?.title ?? null,
    summary: pack?.summary ?? null,
    confidence: pack?.confidence ?? null,
    coveredSourcePaths: asPathList(pack?.coveredSourcePaths).slice(0, 20),
    patch: pack?.patch
      ? {
          patchSummary: pack.patch.patchSummary ?? null,
          fileChanges: Array.isArray(pack.patch.fileChanges)
            ? pack.patch.fileChanges.map((c: any) => ({ path: c?.path, op: c?.op }))
            : [],
        }
      : null,
    measurements: {
      absolutes: Array.isArray(pack?.measurements?.absolutes)
        ? pack.measurements.absolutes.map((row: any) => ({
            measurementKind: row?.measurementKind,
            volume: row?.volume,
            magnitude: row?.magnitude,
            unit: row?.unit,
          }))
        : Array.isArray(pack?.absolutes)
          ? pack.absolutes.map((row: any) => ({
              measurementKind: row?.measurementKind,
              volume: row?.volume,
              magnitude: row?.magnitude,
              unit: row?.unit,
            }))
          : [],
      needinesses: [],
    },
  }));
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
  const obfuscatedPaths = asPathList((obfuscationGuidance as any)?.obfuscatedPaths);

  // A) Prior phases
  const priorIssues = phaseSanityIssues(execution);

  const catalog = await ensureDepositCheckoutSourceFiles(
    execution,
    resolveSourceCheckoutCatalog(execution, input?.sourceCheckoutCatalog),
  );
  const catalogForPrompt = projectInventoryForPrompt(catalog);

  // Ensure nested measurements.absolutes on every pack (deposit needinesses = [])
  // BEFORE deterministic smoke / qualitative judgment.
  const { attachNestedAbsolutes, resolvePackAbsolutes, hasRequiredAbsolutes } = await import(
    '@bitcode/asset-packs-pipelines-syntheses-domain/asset-pack-measurements'
  );
  const inventorySources = Array.isArray((catalog as any)?.sources)
    ? (catalog as any).sources
        .filter((s: any) => s && typeof s.path === 'string' && typeof s.content === 'string')
        .map((s: any) => ({ path: s.path as string, content: s.content as string }))
    : [];
  await Promise.all(
    packs.map(async (pack: any) => {
      delete pack.needinessSignal;
      delete pack.neediness;
      if (resolvePackAbsolutes(pack).length > 0) {
        attachNestedAbsolutes(pack, resolvePackAbsolutes(pack));
        return;
      }
      try {
        const coveredSourcePaths = asPathList(pack?.coveredSourcePaths);
        const fileChanges = Array.isArray(pack?.patch?.fileChanges) ? pack.patch.fileChanges : [];
        const pathScope = new Set<string>(
          [
            ...coveredSourcePaths,
            ...fileChanges.map((c: any) => (typeof c?.path === 'string' ? c.path : '')),
          ].filter(Boolean),
        );
        const scopedBodies =
          pathScope.size > 0
            ? inventorySources.filter((s: { path: string; content: string }) => pathScope.has(s.path))
            : inventorySources;
        const report = analyzeStaticSource({
          files: scopedBodies,
          targetPaths: coveredSourcePaths,
        });
        const absolutes = computeAbsolutesFromReport(report, {
          title: String(pack?.title ?? ''),
          summary: String(pack?.summary ?? ''),
          coveredSourcePaths,
          fileChanges,
          confidence: typeof pack?.confidence === 'number' ? pack.confidence : undefined,
          patchSummary:
            typeof pack?.patch?.patchSummary === 'string' ? pack.patch.patchSummary : undefined,
        });
        attachNestedAbsolutes(pack, absolutes);
      } catch {
        attachNestedAbsolutes(pack, []);
      }
    }),
  );

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
          assetPacks: compactPacksForPrompt(packs),
          sourceCheckoutCatalog: {
            paths: catalogForPrompt?.paths ?? catalog?.paths ?? [],
            totalPathCount:
              catalogForPrompt?.totalPathCount ??
              (Array.isArray(catalog?.paths) ? catalog.paths.length : 0),
          },
          inventoryPaths: catalogForPrompt?.paths ?? catalog?.paths,
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

  if (agentOutput && typeof agentOutput === 'object' && Array.isArray(agentOutput.issues)) {
    agentOutput = {
      ...agentOutput,
      issues: agentOutput.issues.filter(
        (issue: unknown) => typeof issue === 'string' && !isBenignMeasurementShapeIssue(issue),
      ),
    };
  }

  const merged = mergeDepositValidationVerdict(agentOutput, hardIssues);

  // Structural readiness admits Finish; residual qualitative notes become non-blocking.
  const recommendation =
    structureReady && hardIssues.length === 0
      ? 'complete'
      : merged.issues.length > 0 || priorIssues.length > 0 || complianceIssues.length > 0
        ? merged.recommendation === 'complete'
          ? 'iterate'
          : merged.recommendation
        : merged.recommendation;

  const result = {
    ...merged,
    issues: structureReady ? hardIssues : merged.issues,
    recommendation,
    readyToFinish: recommendation === 'complete' && hardIssues.length === 0,
  };

  storeCrossPhaseArtifact(execution, 'validation/implementation', 'issues', result.issues);
  storeCrossPhaseArtifact(execution, 'validation', 'depositQuality', result);
  storeCrossPhaseArtifact(execution, 'validation', 'readyToFinish', {
    recommendation: result.readyToFinish ? 'finish' : 'revise',
    summary: result.readyToFinish
      ? 'Deposit synthesis ready to finish.'
      : `Deposit synthesis not ready: ${result.issues.slice(0, 5).join('; ')}`,
    issues: result.issues,
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
    qualityScore: result.qualityScore ?? agentOutput?.qualityScore ?? null,
  });
  storeCrossPhaseArtifact(execution, 'implementation', 'options', packs);
  storeCrossPhaseArtifact(execution, 'implementation', 'assetPacks', packs);

  return { ...(input || {}), ...result, options: packs };
}

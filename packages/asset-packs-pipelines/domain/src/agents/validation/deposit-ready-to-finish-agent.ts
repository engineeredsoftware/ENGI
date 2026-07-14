/**
 * Single Validation agent for deposit synthesize pipeline.
 *
 * `validation:ready-to-finish-asset-packs-synthesis-deposit-pipeline`
 *
 * A) Prior phase / agent / tool sanity
 * B) Synthesized AssetPack quality (patch + measurements + metadata)
 * C) Obfuscations / Forced Exclusions respected vs patch paths
 */

import { factoryPTRRAgent } from '@bitcode/agent-generics';
import { storeCrossPhaseArtifact } from '../../synthesize-asset-packs';
import { measureAssetPackAbsolutes } from './agent-measure-absolutes';
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
import { resolveSourceCheckoutCatalog } from '../../resolve-source-checkout-catalog';
import { projectInventoryForPrompt } from '../../asset-packs-synthesis';
import { ensureDepositCheckoutSourceFiles } from '../../ensure-deposit-checkout-source-files';
import { hasRequiredAbsolutes } from '../../asset-pack-measurements';

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
  plan: { chunkThreshold: 2000 },
  try: { chunkThreshold: 4000 },
  refine: { maxAttempts: 2 },
  retry: { maxAttempts: 1 },
});

function findValue(execution: any, namespace: string, key: string): any {
  const local = execution?.get?.(namespace, key);
  if (local !== undefined) return local;
  return execution?.findUp?.(namespace, key);
}

function phaseSanityIssues(execution: any): string[] {
  const issues: string[] = [];
  const workspace = findValue(execution, 'repository', 'workspacePath');
  if (!workspace) issues.push('Setup: missing repository.workspacePath (Host checkout).');

  const admission = findValue(execution, 'setup', 'admission');
  if (admission && admission.safe === false) {
    issues.push(`Setup: danger wall not admitted (${admission.reason || 'unknown'}).`);
  }

  const catalog =
    findValue(execution, 'deposit', 'sourceCheckoutCatalog') ||
    findValue(execution, 'deposit', 'inventory');
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
  forcedExclusions: string[],
  obfuscatedPaths: string[],
): string[] {
  const issues: string[] = [];
  const blocked = [...forcedExclusions, ...obfuscatedPaths].map((p) => p.toLowerCase());
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
  const forcedExclusions = asPathList(
    input?.forcedExclusions ??
      findValue(execution, 'deposit', 'forcedExclusions') ??
      findValue(execution, 'deposit', 'protectedIpExclusions') ??
      [],
  );
  const obfuscatedPaths = asPathList((obfuscationGuidance as any)?.obfuscatedPaths);

  // A) Prior phases
  const priorIssues = phaseSanityIssues(execution);

  const catalog = await ensureDepositCheckoutSourceFiles(
    execution,
    resolveSourceCheckoutCatalog(execution, input?.sourceCheckoutCatalog ?? input?.inventory),
  );
  const catalogForPrompt = projectInventoryForPrompt(catalog);

  // B) Qualitative PTRR + smoke
  const raw = await DepositReadyToFinishCore(
    {
      ...input,
      assetPacks: packs,
      sourceCheckoutCatalog: catalogForPrompt,
      inventory: catalogForPrompt, // dual-write for legacy stream filters
      inventoryPaths: catalogForPrompt?.paths ?? catalog?.paths,
      obfuscationGuidance,
      forcedExclusions,
      priorPhaseIssues: priorIssues,
    },
    execution,
  );
  const agentOutput = (raw as any)?.finalOutput ?? (raw as any)?.output ?? raw;
  const smokeIssues = smokeCheckAssetPacks(packs, forcedExclusions, obfuscatedPaths);

  // Ensure nested measurements.absolutes on every pack (deposit needinesses = []).
  const { attachNestedAbsolutes, resolvePackAbsolutes } = await import(
    '../../asset-pack-measurements'
  );
  const inventorySources = Array.isArray((catalog as any)?.sources)
    ? (catalog as any).sources
        .filter((s: any) => s && typeof s.path === 'string' && typeof s.content === 'string')
        .map((s: any) => ({ path: s.path as string, content: s.content as string }))
    : [];
  const discoveryMeasurements = findValue(execution, 'discovery', 'sourceMeasurements');
  await Promise.all(
    packs.map(async (pack: any) => {
      delete pack.needinessSignal;
      delete pack.neediness;
      if (resolvePackAbsolutes(pack).length > 0) {
        attachNestedAbsolutes(pack, resolvePackAbsolutes(pack));
        return;
      }
      try {
        let absolutes: any[];
        if (Array.isArray(discoveryMeasurements) && discoveryMeasurements.length > 0) {
          absolutes = discoveryMeasurements;
        } else {
          absolutes = await measureAssetPackAbsolutes(
            {
              title: String(pack?.title ?? ''),
              summary: String(pack?.summary ?? ''),
              coveredSourcePaths: asPathList(pack?.coveredSourcePaths),
              fileChanges: Array.isArray(pack?.patch?.fileChanges) ? pack.patch.fileChanges : undefined,
              confidence: typeof pack?.confidence === 'number' ? pack.confidence : undefined,
              patchSummary:
                typeof pack?.patch?.patchSummary === 'string' ? pack.patch.patchSummary : undefined,
            },
            { lens: 'deposit', execution, sources: inventorySources },
          );
        }
        attachNestedAbsolutes(pack, absolutes);
      } catch {
        attachNestedAbsolutes(pack, []);
      }
    }),
  );

  // C) Obfuscations vs patches
  const complianceIssues = obfuscationComplianceIssues(packs, forcedExclusions, obfuscatedPaths);

  const merged = mergeDepositValidationVerdict(agentOutput, [
    ...smokeIssues,
    ...priorIssues,
    ...complianceIssues,
  ]);

  const recommendation =
    merged.issues.length > 0 || priorIssues.length > 0 || complianceIssues.length > 0
      ? merged.recommendation === 'complete'
        ? 'iterate'
        : merged.recommendation
      : merged.recommendation;

  const result = {
    ...merged,
    recommendation,
    readyToFinish: recommendation === 'complete' && merged.issues.length === 0,
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
  storeCrossPhaseArtifact(execution, 'implementation', 'options', packs);
  storeCrossPhaseArtifact(execution, 'implementation', 'assetPacks', packs);

  return { ...(input || {}), ...result, options: packs };
}

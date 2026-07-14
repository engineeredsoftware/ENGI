/**
 * Read Validation ready-to-finish — deposit twin + needinesses *-fit checks.
 *
 * A) Prior phases
 * B) Pack quality: patch + measurements.absolutes + measurements.needinesses (*-fit)
 * C) Need guidance honored (topics present; no empty needinesses)
 */

import { factoryPTRRAgent } from '@bitcode/agent-generics';
import { storeCrossPhaseArtifact } from '../../synthesize-asset-packs';
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
import { hasRequiredAbsolutes, resolvePackAbsolutes, resolvePackNeedinesses } from '../../asset-pack-measurements';
import { assertNeedinessKindSuffix } from '../../read-neediness-measurements';
import { resolveSourceCheckoutCatalog } from '../../resolve-source-checkout-catalog';
import { projectInventoryForPrompt } from '../../asset-packs-synthesis';
import { ensureDepositCheckoutSourceFiles } from '../../ensure-deposit-checkout-source-files';

const prompt = createDepositValidationPrompt();

const ReadReadyToFinishCore = factoryPTRRAgent<any, DepositValidationResult>({
  name: 'ReadReadyToFinishAssetPacksSynthesisReadPipeline',
  description:
    'Read Validation gate: prior-phase sanity, pack quality (patch+absolutes+*-fit needinesses), Need compliance.',
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
  if (!findValue(execution, 'repository', 'workspacePath')) {
    issues.push('Setup: missing repository.workspacePath (Host checkout).');
  }
  const admission = findValue(execution, 'setup', 'admission');
  if (admission && admission.safe === false) {
    issues.push(`Setup: danger wall not admitted (${admission.reason || 'unknown'}).`);
  }
  if (!findValue(execution, 'discovery', 'codebaseComprehension')) {
    issues.push('Discovery: missing codebaseComprehension.');
  }
  if (!findValue(execution, 'discovery', 'depositorySearch')) {
    issues.push('Discovery: missing depositorySearch guidance.');
  }
  const options =
    findValue(execution, 'implementation', 'options') ||
    findValue(execution, 'implementation', 'assetPacks');
  if (!Array.isArray(options) || options.length === 0) {
    issues.push('Implementation: no AssetPack options synthesized.');
  }
  return issues;
}

function needinessIssues(packs: any[]): string[] {
  const issues: string[] = [];
  for (const pack of packs) {
    if (!hasRequiredAbsolutes(pack)) {
      issues.push(
        `Pack "${pack?.title || '?'}" missing required measurements.absolutes (magnitude+volume).`,
      );
    }
    const needinesses = resolvePackNeedinesses(pack);
    if (needinesses.length === 0) {
      issues.push(
        `Pack "${pack?.title || '?'}" missing measurements.needinesses (*-fit readings required on read).`,
      );
    } else {
      for (const row of needinesses) {
        if (!assertNeedinessKindSuffix(String(row.measurementKind || ''))) {
          issues.push(
            `Pack "${pack?.title || '?'}" neediness "${row.measurementKind}" must end with -fit.`,
          );
        }
      }
    }
    if (!pack?.patch?.fileChanges?.length) {
      issues.push(`Pack "${pack?.title || '?'}" missing patch.fileChanges.`);
    }
  }
  return issues;
}

export default async function runReadReadyToFinishAgent(input: any, execution: any) {
  const packs = Array.isArray(
    input?.assetPacks ??
      findValue(execution, 'implementation', 'options') ??
      findValue(execution, 'implementation', 'assetPacks'),
  )
    ? (input?.assetPacks ??
        findValue(execution, 'implementation', 'options') ??
        findValue(execution, 'implementation', 'assetPacks'))
    : [];

  const priorIssues = phaseSanityIssues(execution);
  const catalog = await ensureDepositCheckoutSourceFiles(
    execution,
    resolveSourceCheckoutCatalog(execution, input?.sourceCheckoutCatalog ?? input?.inventory),
  );
  const catalogForPrompt = projectInventoryForPrompt(catalog);

  const raw = await ReadReadyToFinishCore(
    {
      ...input,
      assetPacks: packs,
      sourceCheckoutCatalog: catalogForPrompt,
      priorPhaseIssues: priorIssues,
    },
    execution,
  );
  const agentOutput = (raw as any)?.finalOutput ?? (raw as any)?.output ?? raw;
  const smokeIssues = smokeCheckAssetPacks(packs, [], []);
  const nIssues = needinessIssues(packs);

  const merged = mergeDepositValidationVerdict(agentOutput, [
    ...smokeIssues,
    ...priorIssues,
    ...nIssues,
  ]);

  const recommendation =
    merged.issues.length > 0 || priorIssues.length > 0 || nIssues.length > 0
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
  storeCrossPhaseArtifact(execution, 'validation', 'readQuality', result);
  storeCrossPhaseArtifact(execution, 'validation', 'readyToFinish', {
    recommendation: result.readyToFinish ? 'finish' : 'revise',
    summary: result.readyToFinish
      ? 'Read synthesis ready to finish (options for settle selection).'
      : `Read synthesis not ready: ${result.issues.slice(0, 5).join('; ')}`,
    issues: result.issues,
  });
  storeCrossPhaseArtifact(execution, 'implementation', 'options', packs);
  storeCrossPhaseArtifact(execution, 'implementation', 'assetPacks', packs);

  return { ...(input || {}), ...result, options: packs, absolutesSample: resolvePackAbsolutes(packs[0]) };
}

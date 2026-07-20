/**
 * Deposit-mode Validation agent (compat export).
 *
 * Prefer deposit-ready-to-finish-agent (validation:ready-to-finish-asset-packs-
 * synthesis-deposit-pipeline) — the single A/B/C gate.
 *
 * Law: Validation ONLY validates. It never measures, never attaches absolutes,
 * never repairs weak Implementation. Weak patchfiles / measurements / Discovery
 * → issues + recommendation iterate (DIV re-enters Discovery→Implementation).
 */

import { factoryPTRRAgent } from '@bitcode/agent-generics';
import { storeCrossPhaseArtifact } from '@bitcode/asset-packs-pipelines-syntheses-domain/synthesize-asset-packs';
import {
  DepositValidationOutputSchema,
  type DepositValidationInput,
  type DepositValidationResult,
} from './deposit-validation-schema';
import { createDepositValidationPrompt } from './deposit-validation-prompts';
import {
  asPathList,
  mergeDepositValidationVerdict,
  smokeCheckAssetPacks,
} from './deposit-validation-checks';

export type { DepositValidationResult } from './deposit-validation-schema';
export {
  DepositValidationInputSchema,
  DepositValidationOutputSchema,
} from './deposit-validation-schema';
export {
  asPathList,
  dedupeIssues,
  isNum01,
  mergeDepositValidationVerdict,
  pathViolates,
  smokeCheckAssetPacks,
} from './deposit-validation-checks';

const prompt = createDepositValidationPrompt();

export const DepositValidationAgent = factoryPTRRAgent<
  DepositValidationInput,
  DepositValidationResult
>({
  name: 'DepositValidationAgent',
  description:
    'Validates deposit AssetPacks (patch + absolute measurements + metadata). Never measures or repairs — weak Implementation → iterate.',
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

export default async function runDepositValidationAgent(input: any, execution: any) {
  const assetPacks =
    input?.assetPacks ??
    findValue(execution, 'implementation', 'options') ??
    findValue(execution, 'implementation', 'assetPacks') ??
    [];
  const obfuscationGuidance =
    input?.obfuscationGuidance ?? findValue(execution, 'setup', 'inputComprehension');
  const impermissibleSources = asPathList(
    input?.impermissibleSources ??
      findValue(execution, 'deposit', 'impermissibleSources') ??
      [],
  );
  const obfuscatedPaths = asPathList((obfuscationGuidance as any)?.obfuscatedPaths);
  const packs = Array.isArray(assetPacks) ? assetPacks : [];

  const { ensureDepositCheckoutSourceFiles } = await import(
    '../../ensure-deposit-checkout-source-files'
  );
  const { resolveSourceCheckoutCatalog } = await import(
    '@bitcode/asset-packs-pipelines-syntheses-domain/resolve-source-checkout-catalog'
  );
  const { projectInventoryForPrompt } = await import(
    '@bitcode/asset-packs-pipelines-syntheses-domain/asset-packs-synthesis'
  );
  const catalog = await ensureDepositCheckoutSourceFiles(
    execution,
    resolveSourceCheckoutCatalog(execution, input?.sourceCheckoutCatalog),
  );
  const catalogForPrompt = projectInventoryForPrompt(catalog);
  const raw = await DepositValidationAgent(
    {
      ...input,
      assetPacks: packs,
      sourceCheckoutCatalog: catalogForPrompt,
      inventoryPaths: catalogForPrompt?.paths ?? catalog?.paths,
      obfuscationGuidance,
      impermissibleSources,
    },
    execution,
  );
  const agentOutput = (raw as any)?.finalOutput ?? (raw as any)?.output ?? raw;

  const smokeIssues = smokeCheckAssetPacks(packs, impermissibleSources, obfuscatedPaths);
  const result = mergeDepositValidationVerdict(agentOutput, smokeIssues);

  // Validate only — never attach/measure/rewrite Implementation packs.
  storeCrossPhaseArtifact(execution, 'validation/implementation', 'issues', result.issues);
  storeCrossPhaseArtifact(execution, 'validation', 'depositQuality', result);

  return { ...(input || {}), ...result };
}

/**
 * Read Implementation agent 3/4 — measurements (product re-implementation).
 *
 * Registry: implementation:read-implementation-agent-asset-packs-measurements-synthesis
 * Sequence: patch-plan → patchfile → THIS → commercial-nl
 *
 * Domain base runs absolute measurements (productLens=read). Read then attaches
 * needinesses (*-fit) + needFit. Never imports the deposit product package.
 */

import { storeCrossPhaseArtifact } from '@bitcode/asset-packs-pipelines-syntheses-domain/synthesize-asset-packs';
import { attachNestedAbsolutes } from '@bitcode/asset-packs-pipelines-syntheses-domain/asset-pack-measurements';

function findValue(execution: any, namespace: string, key: string): any {
  const local = execution?.get?.(namespace, key);
  if (local !== undefined) return local;
  return execution?.findUp?.(namespace, key);
}

export default async function runReadImplementationAgentAssetPacksMeasurementsSynthesis(
  input: any,
  execution: any,
) {
  try {
    execution?.store?.('implementation', 'productLens', 'read');
  } catch {
    /* optional */
  }

  const { default: runBaseMeasurements } = await import(
    '@bitcode/asset-packs-pipelines-syntheses-domain/agents/implementation/implementation-agent-asset-packs-measurements-synthesis'
  );
  const measured = await runBaseMeasurements(input, execution);

  const options = Array.isArray((measured as any)?.options)
    ? (measured as any).options
    : Array.isArray(findValue(execution, 'implementation', 'options'))
      ? findValue(execution, 'implementation', 'options')
      : [];

  const needText =
    findValue(execution, 'read', 'need') ??
    findValue(execution, 'implementation', 'need') ??
    input?.need ??
    '';
  const needComprehension =
    findValue(execution, 'setup', 'needComprehension') ??
    findValue(execution, 'setup', 'inputComprehension');
  const dynamicKinds = Array.isArray(needComprehension?.dynamicNeedinessKinds)
    ? needComprehension.dynamicNeedinessKinds
    : [];
  const dynamicNeedinesses = Array.isArray(needComprehension?.dynamicNeedinesses)
    ? needComprehension.dynamicNeedinesses
    : null;
  const needSummary = needComprehension?.summary || String(needText || '');
  const needTopics = Array.isArray(needComprehension?.needTopics)
    ? needComprehension.needTopics
    : [];
  const acceptanceCriteria = Array.isArray(needComprehension?.acceptanceCriteria)
    ? needComprehension.acceptanceCriteria
    : [];

  const { measureReadNeedinesses, computeNeedFitVolume, planDynamicNeedinessesFromContext } =
    await import('../../read-neediness-measurements');

  for (const option of options) {
    if (!option || typeof option !== 'object') continue;
    delete (option as any).needinessSignal;

    const existingAbsolutes = Array.isArray((option as any).measurements?.absolutes)
      ? (option as any).measurements.absolutes
      : Array.isArray((option as any).absolutes)
        ? (option as any).absolutes
        : [];
    const materialIdentity =
      (option as any).measurements?.materialIdentity ??
      (option as any).materialIdentity ??
      null;
    const measureReport =
      (option as any).measurements?.measureReport ??
      (option as any).measureReport ??
      null;

    const coveredSourcePaths = Array.isArray((option as any).coveredSourcePaths)
      ? ((option as any).coveredSourcePaths as string[])
      : [];
    const patchSummary =
      (option as any).patchArtifact?.patchSummary ||
      (option as any).patch?.patchSummary ||
      null;
    const commercialDescription =
      typeof (option as any).commercialDescription === 'string'
        ? (option as any).commercialDescription
        : null;

    // STAB-B2: when Need exists but Setup plan empty, ground dynamic plan here.
    let planForOption = dynamicNeedinesses;
    if (
      needSummary &&
      (!Array.isArray(planForOption) || planForOption.length === 0) &&
      (!Array.isArray(dynamicKinds) || dynamicKinds.length === 0)
    ) {
      planForOption = planDynamicNeedinessesFromContext({
        needText: needSummary,
        needTopics,
        acceptanceCriteria,
        pathHints: coveredSourcePaths,
      });
    }

    const needinesses = await measureReadNeedinesses({
      title: String((option as any)?.title ?? ''),
      summary: String((option as any)?.summary ?? ''),
      confidence: (option as any)?.confidence,
      needSummary,
      dynamicKinds,
      dynamicNeedinesses: planForOption,
      needTopics,
      acceptanceCriteria,
      patchSummary,
      coveredSourcePaths,
      commercialDescription,
      execution,
    });
    const needFit = computeNeedFitVolume(needinesses);

    attachNestedAbsolutes(option as any, existingAbsolutes, {
      withNeedinesses: needinesses,
      materialIdentity,
      measureReport,
    });
    (option as any).needFit = needFit;
  }

  const summary = `Measured ${options.length} read DataPack(s) (absolutes + *-fit needinesses + needFit).`;
  storeCrossPhaseArtifact(execution, 'implementation', 'options', options);
  storeCrossPhaseArtifact(execution, 'implementation', 'assetPacks', options);
  storeCrossPhaseArtifact(execution, 'implementation', 'summary', summary);

  return {
    ...(typeof measured === 'object' && measured ? measured : {}),
    success: true,
    semanticKind: 'asset-pack-written-asset' as const,
    options,
    summary,
  };
}

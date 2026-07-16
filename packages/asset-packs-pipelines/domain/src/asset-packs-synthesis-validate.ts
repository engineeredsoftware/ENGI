/**
 * Fail-closed validation of raw synthesis candidates into AssetPackCandidates.
 *
 * Drops options with unknown/excluded covered paths or missing formal absolutes;
 * maps neediness signals; attaches source-safe patch descriptors. Used by the
 * deposit route and by synthesizeAssetPackCandidates post-inference checks.
 */

import type {
  AssetPackCandidate,
  AssetPackCandidateMeasurement,
  AssetPackPatchDescriptor,
  SynthesizeAssetPacksMode,
  AssetPacksSynthesisSourceInventory,
  DepositSynthesisRawOption,
} from './asset-packs-synthesis-types';
import { isPathImpermissible } from './asset-packs-synthesis-inventory';
import { buildNeedinessFromSignal, clampVolume } from './asset-packs-synthesis-neediness';

/**
 * Defense-in-depth source-safety assertion: if any non-trivial source line
 * (>= 40 chars) from inventory excerpts appears verbatim in candidate prose,
 * source leaked and synthesis fails closed.
 */
export function assertSourceSafeCandidates(
  candidates: AssetPackCandidate[],
  inventory: AssetPacksSynthesisSourceInventory,
): void {
  const needles = [
    ...new Set(
      inventory.samples
        .flatMap((sample) => sample.excerpt.split(/\r?\n/))
        .map((line) => line.trim())
        .filter((line) => line.length >= 40),
    ),
  ];
  if (needles.length === 0) return;
  for (const candidate of candidates) {
    const haystack = `${candidate.title}\n${candidate.summary}\n${candidate.measurementRationale}`;
    for (const needle of needles) {
      if (haystack.includes(needle)) {
        throw new Error(
          `AssetPacksSynthesis source-safety assertion failed: candidate "${candidate.title}" leaked raw source.`,
        );
      }
    }
  }
}

/**
 * Validate raw synthesized candidate options into source-safe AssetPackCandidates.
 * Prefer formal absolutes from Validation; never silently project legacy
 * DEPOSIT_MEASUREMENT_CATALOG placeholders onto deposit cards.
 */
export function validateDepositSynthesisOptions(
  rawOptions: DepositSynthesisRawOption[],
  context: {
    lens: SynthesizeAssetPacksMode;
    inventoryPaths: string[];
    impermissibleSources: string[];
    candidateKinds: string[];
  },
): { candidates: AssetPackCandidate[]; droppedCandidateCount: number; exclusionViolations: string[] } {
  const inventoryPathSet = new Set(context.inventoryPaths);
  const allowedKinds = new Set(context.candidateKinds);
  const exclusionViolations: string[] = [];
  const candidates: AssetPackCandidate[] = [];
  for (const option of rawOptions || []) {
    const coveredSourcePaths = [
      ...new Set((option.coveredSourcePaths || []).map((path) => String(path).trim()).filter(Boolean)),
    ];
    const unknownPaths = coveredSourcePaths.filter((path) => !inventoryPathSet.has(path));
    const excludedPaths = coveredSourcePaths.filter((path) =>
      isPathImpermissible(path, context.impermissibleSources),
    );
    if (unknownPaths.length > 0 || excludedPaths.length > 0 || coveredSourcePaths.length === 0) {
      exclusionViolations.push(
        `${option.title}: ${excludedPaths.length ? `excluded paths ${excludedPaths.join(', ')}` : ''}${
          unknownPaths.length ? ` unknown paths ${unknownPaths.join(', ')}` : ''
        }`.trim(),
      );
      continue;
    }
    const formalAbsolutes = Array.isArray(option.absolutes) ? option.absolutes : null;
    if (!formalAbsolutes || formalAbsolutes.length === 0) {
      exclusionViolations.push(
        `${option.title}: missing formal absolute measurements (Validation measure-agent)`,
      );
      continue;
    }
    const measurements: AssetPackCandidateMeasurement[] = formalAbsolutes.map((m) => ({
      measurementKind: String(m.measurementKind),
      label: String(m.label ?? m.measurementKind),
      weight: Number.isFinite(m.weight) ? Number(m.weight) : 0,
      volume: clampVolume(Number(m.volume) || 0),
      category: m.category === 'neediness' ? 'neediness' : 'absolute',
      ...(Number.isFinite(m.magnitude as number)
        ? { magnitude: Math.max(0, Math.round(Number(m.magnitude))) }
        : {}),
      ...(m.unit ? { unit: String(m.unit) } : {}),
    }));
    const rawFileChanges = Array.isArray(option.patch?.fileChanges) ? option.patch!.fileChanges! : [];
    const patch: AssetPackPatchDescriptor | undefined = rawFileChanges.length
      ? {
          fileChanges: rawFileChanges
            .map((fc) => ({
              path: String((fc as { path?: unknown })?.path ?? '').trim(),
              op: String((fc as { op?: unknown })?.op ?? '').trim(),
            }))
            .filter((fc) => fc.path),
          patchSummary: String(option.patch?.patchSummary ?? '').trim(),
        }
      : undefined;
    candidates.push({
      kind: allowedKinds.has(option.kind) ? option.kind : context.candidateKinds[0],
      title: String(option.title).trim(),
      summary: String(option.summary).trim(),
      coveredSourcePaths,
      measurements,
      measurementRationale: String(option.measurementRationale).trim(),
      confidence: clampVolume(option.confidence),
      patch,
      neediness: context.lens === 'deposit' ? buildNeedinessFromSignal(option.needinessSignal) : undefined,
    });
  }
  return {
    candidates,
    droppedCandidateCount: (rawOptions?.length || 0) - candidates.length,
    exclusionViolations,
  };
}

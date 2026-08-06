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
  AssetPacksSynthesisSourceInventory,
  DepositSynthesisRawOption,
} from './asset-packs-synthesis-types';
import type { SynthesizeAssetPacksMode } from './synthesize-asset-packs';
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
 * Fail-closed product projection of raw synthesized options into AssetPackCandidates.
 *
 * Formal absolute measurements are produced at the end of **Implementation**
 * (measure-agent / measure-absolutes path) — not by Validation. Validation
 * only gates readiness; this function is the route-side projection check.
 * Prefer formal absolutes; never silently project DEPOSIT_SYNTHESIS_POLICY_CATALOG
 * placeholders onto deposit cards.
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
    // Formal absolutes from Implementation measure path: top-level option.absolutes
    // or nested measurements.absolutes (Finish selectionEnvelope product shape —
    // run 36858f68 dropped 3 measured packs by reading only top-level).
    const nestedAbsolutes =
      option.measurements &&
      typeof option.measurements === 'object' &&
      !Array.isArray(option.measurements) &&
      Array.isArray((option.measurements as { absolutes?: unknown }).absolutes)
        ? ((option.measurements as { absolutes: NonNullable<DepositSynthesisRawOption['absolutes']> })
            .absolutes as NonNullable<DepositSynthesisRawOption['absolutes']>)
        : null;
    const formalAbsolutes =
      Array.isArray(option.absolutes) && option.absolutes.length > 0
        ? option.absolutes
        : nestedAbsolutes && nestedAbsolutes.length > 0
          ? nestedAbsolutes
          : null;
    if (!formalAbsolutes || formalAbsolutes.length === 0) {
      exclusionViolations.push(
        `${option.title}: missing formal absolute measurements (Implementation measure path)`,
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
      // Preserve honesty + commercial measure prose for depositor UI.
      ...(typeof (m as { descriptor?: unknown }).descriptor === 'string'
        ? { descriptor: String((m as { descriptor: string }).descriptor) }
        : {}),
      ...(typeof (m as { status?: unknown }).status === 'string'
        ? {
            status: String((m as { status: string }).status) as AssetPackCandidateMeasurement['status'],
          }
        : {}),
    }));
    // Prefer formal patchArtifact.files (authoritative bodies) when descriptor lacks content.
    const artifactFiles = Array.isArray(option.patchArtifact?.files)
      ? option.patchArtifact!.files!
      : [];
    const rawFileChanges = Array.isArray(option.patch?.fileChanges)
      ? option.patch!.fileChanges!
      : [];
    const bodyByPath = new Map<string, string>();
    for (const f of artifactFiles) {
      if (typeof f?.body === 'string' && typeof f?.path === 'string') {
        bodyByPath.set(String(f.path).trim(), f.body);
      }
    }
    for (const fc of rawFileChanges) {
      const path = String((fc as { path?: unknown })?.path ?? '').trim();
      if (!path || bodyByPath.has(path)) continue;
      const content =
        typeof (fc as { content?: unknown })?.content === 'string'
          ? String((fc as { content: string }).content)
          : typeof (fc as { body?: unknown })?.body === 'string'
            ? String((fc as { body: string }).body)
            : undefined;
      if (content !== undefined) bodyByPath.set(path, content);
    }
    const changeSource =
      rawFileChanges.length > 0
        ? rawFileChanges
        : artifactFiles.map((f) => ({
            path: f?.path,
            op: f?.op,
            body: f?.body,
          }));
    const patch: AssetPackPatchDescriptor | undefined = changeSource.length
      ? {
          fileChanges: changeSource
            .map((fc) => {
              const path = String((fc as { path?: unknown })?.path ?? '').trim();
              const opRaw = String((fc as { op?: unknown })?.op ?? 'modify')
                .trim()
                .toLowerCase();
              const op = opRaw === 'create' ? 'create' : opRaw === 'delete' ? 'delete' : 'modify';
              const content = bodyByPath.get(path);
              return {
                path,
                op,
                ...(typeof content === 'string' ? { content } : {}),
              };
            })
            .filter((fc) => fc.path && fc.op !== 'delete'),
          patchSummary: String(
            option.patch?.patchSummary ??
              option.patchArtifact?.patchSummary ??
              '',
          ).trim(),
        }
      : undefined;
    const patchArtifact =
      option.patchArtifact && typeof option.patchArtifact === 'object'
        ? {
            artifactId:
              typeof option.patchArtifact.artifactId === 'string'
                ? option.patchArtifact.artifactId
                : undefined,
            format:
              typeof option.patchArtifact.format === 'string'
                ? option.patchArtifact.format
                : undefined,
            fileCount:
              typeof option.patchArtifact.fileCount === 'number'
                ? option.patchArtifact.fileCount
                : undefined,
            patchSummary:
              typeof option.patchArtifact.patchSummary === 'string'
                ? option.patchArtifact.patchSummary
                : undefined,
            bodiesComplete:
              typeof option.patchArtifact.bodiesComplete === 'boolean'
                ? option.patchArtifact.bodiesComplete
                : undefined,
            unifiedDiff:
              typeof option.patchArtifact.unifiedDiff === 'string'
                ? option.patchArtifact.unifiedDiff
                : null,
            files: artifactFiles.map((f) => ({
              path: String(f?.path ?? ''),
              op: String(f?.op ?? 'modify'),
              ...(typeof f?.body === 'string' ? { body: f.body } : {}),
            })),
            envelopeJson:
              typeof option.patchArtifact.envelopeJson === 'string'
                ? option.patchArtifact.envelopeJson
                : undefined,
          }
        : undefined;
    candidates.push({
      kind: allowedKinds.has(option.kind) ? option.kind : context.candidateKinds[0],
      title: String(option.title).trim(),
      summary: String(option.summary).trim(),
      coveredSourcePaths,
      measurements,
      measurementRationale: String(option.measurementRationale ?? '').trim(),
      confidence: clampVolume(option.confidence),
      patch,
      ...(patchArtifact ? { patchArtifact } : {}),
      ...(typeof option.commercialTitle === 'string'
        ? { commercialTitle: option.commercialTitle }
        : {}),
      ...(typeof option.commercialDescription === 'string'
        ? { commercialDescription: option.commercialDescription }
        : {}),
      ...(() => {
        const nested =
          option.measurements &&
          typeof option.measurements === 'object' &&
          !Array.isArray(option.measurements)
            ? (option.measurements as {
                materialIdentity?: unknown;
                measureReport?: unknown;
              })
            : null;
        const materialIdentity =
          (option.materialIdentity && typeof option.materialIdentity === 'object'
            ? option.materialIdentity
            : null) ||
          (nested?.materialIdentity && typeof nested.materialIdentity === 'object'
            ? (nested.materialIdentity as Record<string, unknown>)
            : null);
        const measureReport =
          (option.measureReport && typeof option.measureReport === 'object'
            ? option.measureReport
            : null) ||
          (nested?.measureReport && typeof nested.measureReport === 'object'
            ? (nested.measureReport as Record<string, unknown>)
            : null);
        return {
          ...(materialIdentity ? { materialIdentity } : {}),
          ...(measureReport ? { measureReport } : {}),
        };
      })(),
      // Neediness is entirely a Read-pipeline concept — never synthesize for deposit.
      neediness: undefined,
    });
  }
  return {
    candidates,
    droppedCandidateCount: (rawOptions?.length || 0) - candidates.length,
    exclusionViolations,
  };
}

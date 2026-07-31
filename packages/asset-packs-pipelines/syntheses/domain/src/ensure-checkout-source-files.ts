/**
 * Ensure the depositor **checkout source catalog** has in-memory file bodies.
 *
 * Setup's clone-repository agent already cloned the **complete working tree
 * for this pipeline run**. This helper only loads file contents into the
 * catalog for measurement — it does not clone and must not read any path
 * outside that run's checkout. Discovery is the first caller; later phases
 * are idempotent.
 *
 * Loader: `deposit:loadCheckoutSourceFiles` (bound to the run workspace in Setup).
 * Store key: `deposit:sourceCheckoutCatalog`.
 */

import { storeCrossPhaseArtifact } from '@bitcode/asset-packs-pipelines-syntheses-domain/synthesize-asset-packs';
import type { AssetPacksSynthesisSourceInventory } from '@bitcode/asset-packs-pipelines-syntheses-domain/asset-packs-synthesis-types';

/** Execution key for the Host checkout file-body loader (function). */
export const DEPOSIT_LOAD_CHECKOUT_SOURCE_FILES_KEY = 'loadCheckoutSourceFiles';

function findValue(execution: any, namespace: string, key: string): any {
  const local = execution?.get?.(namespace, key);
  if (local !== undefined) return local;
  return execution?.findUp?.(namespace, key);
}

/**
 * Resolve the checkout source catalog and load full file bodies if still empty.
 * Idempotent when `sources` is already populated.
 */
export async function ensureDepositCheckoutSourceFiles(
  execution: any,
  inputCatalog?: AssetPacksSynthesisSourceInventory | null,
): Promise<AssetPacksSynthesisSourceInventory | null | undefined> {
  let sourceCatalog =
    inputCatalog ??
    (findValue(execution, 'deposit', 'sourceCheckoutCatalog') as
      | AssetPacksSynthesisSourceInventory
      | undefined);

  if (sourceCatalog && Array.isArray(sourceCatalog.sources) && sourceCatalog.sources.length > 0) {
    return sourceCatalog;
  }

  const loadSourceFiles =
    findValue(execution, 'deposit', 'loadSourceCheckoutFileBodies') ??
    findValue(execution, 'deposit', DEPOSIT_LOAD_CHECKOUT_SOURCE_FILES_KEY) ??
    // Back-compat with the short-lived materializeInventorySources key.
    findValue(execution, 'deposit', 'materializeInventorySources');
  if (typeof loadSourceFiles !== 'function') {
    return sourceCatalog;
  }

  const sources = await loadSourceFiles();
  if (!Array.isArray(sources)) {
    return sourceCatalog;
  }

  // Cap path list kept on the catalog object (bodies already bounded by loader).
  // Huge path arrays alone pressure sandbox heap on monorepo deposits.
  const maxPaths = (() => {
    const raw = Number(process.env.BITCODE_DEPOSIT_MAX_CATALOG_PATHS);
    return Number.isFinite(raw) && raw > 0 ? Math.min(50_000, Math.floor(raw)) : 8_000;
  })();
  const rawPaths =
    Array.isArray(sourceCatalog?.paths) && sourceCatalog!.paths.length > 0
      ? sourceCatalog!.paths
      : sources.map((file: { path: string }) => file.path);
  const paths =
    rawPaths.length > maxPaths ? rawPaths.slice(0, maxPaths) : rawPaths;

  sourceCatalog = {
    paths,
    samples: Array.isArray(sourceCatalog?.samples) ? sourceCatalog!.samples : [],
    sources,
    totalPathCount: sourceCatalog?.totalPathCount ?? rawPaths.length,
    excludedPathCount:
      (sourceCatalog?.excludedPathCount ?? 0) +
      Math.max(0, rawPaths.length - paths.length),
  };

  storeCrossPhaseArtifact(execution, 'deposit', 'sourceCheckoutCatalog', sourceCatalog);
  try {
    execution?.store?.('deposit', 'sourceBodiesBounded', true);
    execution?.store?.('deposit', 'sourceBodiesCount', sources.length);
  } catch {
    /* ignore */
  }
  return sourceCatalog;
}


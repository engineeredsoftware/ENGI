/**
 * Resolve the depositor **sourceCheckoutCatalog** for this pipeline run.
 *
 * Canonical store only: `deposit:sourceCheckoutCatalog`.
 */

import type { AssetPacksSynthesisSourceInventory } from './asset-packs-synthesis-types';

export type SourceCheckoutCatalog = AssetPacksSynthesisSourceInventory;

function findValue(execution: any, namespace: string, key: string): any {
  const local = execution?.get?.(namespace, key);
  if (local !== undefined) return local;
  return execution?.findUp?.(namespace, key);
}

export function resolveSourceCheckoutCatalog(
  execution: any,
  inputCatalog?: SourceCheckoutCatalog | null,
): SourceCheckoutCatalog | null | undefined {
  if (inputCatalog && typeof inputCatalog === 'object') return inputCatalog;
  return findValue(execution, 'deposit', 'sourceCheckoutCatalog') as
    | SourceCheckoutCatalog
    | undefined;
}

export function storeSourceCheckoutCatalog(
  store: (ns: string, key: string, value: unknown) => void,
  catalog: SourceCheckoutCatalog,
): void {
  store('deposit', 'sourceCheckoutCatalog', catalog);
}

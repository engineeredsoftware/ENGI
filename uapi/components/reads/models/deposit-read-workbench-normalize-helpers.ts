/**
 * Pure value helpers for deposit-read workbench normalization.
 */
import type { TerminalRepositoryContextState } from '@/components/bitcode/pipeline/models/repository-context';
import type {
  DepositReadWorkbenchShellSnapshot,
  TerminalDepositReadWorkbench,
} from '@/components/reads/models/deposit-read-workbench-types';

export function numberValue(value: number | null | undefined) {
  return typeof value === 'number' ? String(value) : '0';
}

export function textValue(value: string | null | undefined) {
  return String(value || '').trim();
}

export function listValue(values: (string | null | undefined)[] | null | undefined, fallback = '—') {
  const resolved = (values || []).map((value) => String(value || '').trim()).filter(Boolean);
  return resolved.length ? resolved.join(', ') : fallback;
}

export function normalizeFitResultState(value?: string | null) {
  const resultState = textValue(value);
  if (resultState === 'worthy_fit' || resultState === 'no_worthy_fit' || resultState === 'blocked_readiness') {
    return resultState;
  }

  return 'blocked_readiness';
}

export function countLabels(counts: Record<string, number> | null | undefined) {
  return Object.entries(counts || {})
    .filter(([, count]) => typeof count === 'number' && count > 0)
    .sort((left, right) => right[1] - left[1])
    .map(([label, count]) => `${label} (${count})`);
}

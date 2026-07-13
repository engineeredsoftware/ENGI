/**
 * Deposit/read workbench public model surface.
 * Stable import path: re-exports types, live snapshot builder, and normalizer.
 */

export {
  TERMINAL_ENTERPRISE_READING_STEPS,
  type TerminalEnterpriseReadingStepId,
} from '@/components/reads/models/enterprise-reading-ux-state';

export type {
  DepositReadWorkbenchShellSnapshot,
  InventoryEntrySnapshot,
  TerminalDepositedSourceRevision,
  TerminalDepositReadWorkbench,
  TerminalSourceRevision,
} from '@/components/reads/models/deposit-read-workbench-types';

export { buildLiveTerminalDepositReadWorkbenchSnapshot } from '@/components/reads/models/deposit-read-workbench-snapshot';
export { normalizeTerminalDepositReadWorkbench } from '@/components/reads/models/deposit-read-workbench-normalize';

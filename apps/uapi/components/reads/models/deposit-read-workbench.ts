/**
 * Deposit/read workbench public model surface.
 * Stable import path for types still used by pipeline activity drafts and host
 * clients. UI workbench shell/normalize/snapshot/evidence rows were removed with
 * the Terminal multi-step workbench; route UX lives on ReadPageClient.
 */

export {
  TERMINAL_ENTERPRISE_READING_STEPS,
  type EnterpriseReadingStepId,
} from '@/components/reads/models/enterprise-reading-ux-state';

export type {
  DepositReadWorkbenchShellSnapshot,
  InventoryEntrySnapshot,
  TerminalDepositedSourceRevision,
  TerminalDepositReadWorkbench,
  TerminalSourceRevision,
} from '@/components/reads/models/deposit-read-workbench-types';

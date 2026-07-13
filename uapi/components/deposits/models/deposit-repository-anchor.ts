/**
 * Previously anchored repository·branch·commit snapshot for deposit reload.
 * Pure type — no React. Built from activity ledger anchors.
 */

export interface DepositRepositoryAnchor {
  id: string;
  repositoryFullName: string;
  branch: string | null;
  commit: string | null;
}

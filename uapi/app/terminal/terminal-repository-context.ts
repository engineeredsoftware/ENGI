/**
 * @deprecated Compatibility shim. Import from
 * `@/components/bitcode/pipeline/models/repository-context` instead.
 */
export {
  type RepositoryInventorySource,
  type TerminalRepositoryInventorySource,
  type RepositoryConnectionStatus,
  type TerminalRepositoryConnectionStatus,
  type RepositoryContextState,
  type TerminalRepositoryContextState,
  REPOSITORY_PROVIDERS,
  TERMINAL_REPOSITORY_PROVIDERS,
  normalizeRepositoryProvider,
  deriveSelectedRepository,
  deriveSelectedBranch,
  DEPOSIT_COMMIT_LATEST_REF,
  isLatestCommitRef,
  deriveSelectedCommit,
  getProviderLabel,
  getRepositoryInventorySourceLabel,
} from '@/components/bitcode/pipeline/models/repository-context';

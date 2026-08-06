/**
 * Persisted state hook for executions page
 */
import { useCallback } from 'react';
import { createPersistedState } from '@bitcode/browser-storage';

const STORAGE_KEY = 'bitcode_execution_state_v1';
const SAVE_DEBOUNCE_MS = 3000;

export interface PersistedExecutionState {
  definitionOfRead: string;
  modelSelection: string;
  vcs: {
    provider: string | null;
    account: string | null;
    repo: string | null;
    branch: string | null;
    commit: string | null;
    issuesOrPRs: string[];
  };
  attachments: {
    urls: Array<{ url: string; title: string; content: string; error?: string }>;
    files: Array<{ name: string; size: number; type: string; lastModified: number }>;
    externals: Array<{ type: string; id: string; name: string; metadata?: any }>;
  };
  toggles: { iterations: number };
  timestamp: number;
  version: string;
}

const usePersistedStateBase = createPersistedState<PersistedExecutionState>({
  key: STORAGE_KEY,
  version: 'v1',
  debounceMs: SAVE_DEBOUNCE_MS,
  syncAcrossTabs: true,
  defaultValue: {
    definitionOfRead: '',
    modelSelection: '',
    vcs: { provider: null, account: null, repo: null, branch: null, commit: null, issuesOrPRs: [] },
    attachments: { urls: [], files: [], externals: [] },
    toggles: { iterations: 3 },
    timestamp: Date.now(),
    version: 'v1'
  },
  migrations: []
});

export function usePersistedState() {
  const [state, setState, clearStateBase] = usePersistedStateBase();
  const updateDefinitionOfNeed = useCallback((definitionOfRead: string) => { setState(prev => ({ ...prev, definitionOfRead })); }, [setState]);
  const updateModelSelection = useCallback((modelSelection: string) => { setState(prev => ({ ...prev, modelSelection })); }, [setState]);
  const updateVCS = useCallback((vcs: Partial<PersistedExecutionState['vcs']>) => { setState(prev => ({ ...prev, vcs: { ...prev.vcs, ...vcs } })); }, [setState]);
  const updateAttachments = useCallback((updater: (prev: PersistedExecutionState['attachments']) => PersistedExecutionState['attachments']) => { setState(prev => ({ ...prev, attachments: updater(prev.attachments) })); }, [setState]);
  const updateToggles = useCallback((toggles: Partial<PersistedExecutionState['toggles']>) => { setState(prev => ({ ...prev, toggles: { ...prev.toggles, ...toggles } })); }, [setState]);
  const clearState = useCallback(() => { clearStateBase(); }, [clearStateBase]);
  return { state, updateDefinitionOfNeed, updateModelSelection, updateVCS, updateAttachments, updateToggles, clearState, setState };
}

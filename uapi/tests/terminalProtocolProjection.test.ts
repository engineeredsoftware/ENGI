import {
  buildProtocolProjectedRunDetail,
  buildProtocolProjectedWorkspaceRun,
  mergeProtocolProjectedRun,
} from '@/app/terminal/terminal-protocol-projection';
import type { TerminalRepositoryContextState } from '@/app/terminal/terminal-repository-context';
import type { WorkspaceRun } from '@/components/bitcode/pipeline/models/pipeline-run-data';

describe('terminal-protocol-projection', () => {
  const repositoryContext: TerminalRepositoryContextState = {
    provider: 'github',
    connectionStatus: {
      connected: true,
      provider: 'github',
      valid: true,
      username: 'garrett',
      metadata: {
        account: 'bitcode',
      },
    },
    inventorySource: 'stored_repository_inventory',
    repositories: [],
    selectedRepository: {
      id: 'repo-1',
      name: 'terminal',
      fullName: 'bitcode/terminal',
      private: true,
      defaultBranch: 'main',
      url: 'https://github.com/bitcode/terminal',
      cloneUrl: 'https://github.com/bitcode/terminal.git',
      owner: {
        id: 'owner-1',
        username: 'bitcode',
        type: 'organization',
      },
    },
  };

  it('builds a canonical projected workspace run from live protocol posture', () => {
    const snapshot = {
      scenario: {
        scenarioId: 'scenario-1',
        scenarioFamily: 'auth-remediation',
        repo: 'bitcode/terminal',
        profileShortLabel: 'Targeted deposit',
      },
      scenarios: [
        {
          scenarioId: 'scenario-1',
          scenarioFamily: 'auth-remediation',
          repo: 'bitcode/terminal',
          profileShortLabel: 'Targeted deposit',
          selected: true,
        },
      ],
      selection: {
        projectionPrincipal: 'depositor',
        branchMode: 'patch',
        authSessionId: 'session-1',
        selectedInventoryEntryIds: ['entry-1'],
      },
      readingSurface: {
        readSummary: 'Measure issuer-auth drift against the active repository boundary.',
        parserKind: 'benchmark-parser',
        closureCriteria: ['bound issuer auth'],
        targetArtifactKinds: ['runbook'],
      },
      inventory: {
        selectedCount: 3,
        filteredCount: 5,
        totalFilteredEntries: 12,
        kind: 'all',
        searchTerm: 'auth',
        kindOptions: ['all', 'runbook'],
        selectedEntries: [{ inventoryEntryId: 'entry-1', title: 'rollback runbook' }],
        filteredEntries: [
          {
            inventoryEntryId: 'entry-1',
            title: 'rollback runbook',
            artifactKind: 'runbook',
            selected: true,
            tags: ['auth'],
          },
        ],
      },
      authSessions: [
        {
          authSessionId: 'session-1',
          repo: 'bitcode/terminal',
          installationId: 42,
          selected: true,
        },
      ],
      authSession: {
        authSessionId: 'session-1',
        repo: 'bitcode/terminal',
        installationId: 42,
        installationAccountLogin: 'bitcode',
        defaultRef: 'main',
      },
      repoSupplySummary: {
        repoCount: 1,
        inventoryEntryCount: 3,
        scenarioCount: 1,
        candidateAssetCount: 3,
      },
      depositingSurface: {
        depositIntentSummary: 'Prepare the active repository supply into a Bitcode share posture.',
        selectedArtifactKindCounts: { runbook: 1 },
        selectedOriginKindCounts: { repo: 1 },
        repoSupplyRef: 'bitcode/terminal',
      },
    } as any;
    const projectedRun = buildProtocolProjectedWorkspaceRun(snapshot, repositoryContext);

    expect(projectedRun).toMatchObject({
      type: 'agentic-execution:read-measurement',
      status: 'running',
      sourceModel: 'protocol-projection',
      repository: 'bitcode/terminal',
      branch: 'main',
      participant: 'garrett',
      itemCount: 3,
      summary: 'Measure issuer-auth drift against the active repository boundary.',
    });
    expect(projectedRun?.id).toContain('protocol-live-posture::');
    expect(projectedRun?.protocolProjectionDetail).toMatchObject({
      repoSnapshot: {
        org: 'bitcode',
        repo: 'terminal',
        branch: 'main',
      },
      bitcodeActivityState: {
        depositWorkbench: {
          projectionPrincipal: 'depositor',
          scenarioLabel: 'auth-remediation',
        },
        readMeasurement: {
          parserKind: 'benchmark-parser',
          targetKindCount: 1,
        },
        supplySelection: {
          authSessionLabel: 'bitcode/terminal · 42',
          selectedCount: 3,
        },
        repositoryAnchor: {
          providerAccount: 'garrett',
          repository: {
            fullName: 'bitcode/terminal',
          },
        },
      },
    });
  });

  it('builds a projected detail snapshot directly from live protocol posture', () => {
    const projectedDetail = buildProtocolProjectedRunDetail(
      {
        scenario: {
          scenarioId: 'scenario-1',
          scenarioFamily: 'auth-remediation',
          repo: 'bitcode/terminal',
          profileShortLabel: 'Targeted deposit',
        },
        scenarios: [
          {
            scenarioId: 'scenario-1',
            scenarioFamily: 'auth-remediation',
            repo: 'bitcode/terminal',
            profileShortLabel: 'Targeted deposit',
            selected: true,
          },
        ],
        selection: {
          projectionPrincipal: 'reader',
          branchMode: 'patch',
        },
        readingSurface: {
          readSummary: 'Measure issuer-auth drift against the active repository boundary.',
          parserKind: 'benchmark-parser',
          closureCriteria: ['bound issuer auth'],
          targetArtifactKinds: ['runbook'],
        },
        inventory: {
          selectedCount: 1,
          filteredCount: 2,
          totalFilteredEntries: 2,
          kind: 'all',
          searchTerm: '',
          kindOptions: ['all', 'runbook'],
          filteredEntries: [],
        },
        repoSupplySummary: {
          repoCount: 1,
          inventoryEntryCount: 3,
          scenarioCount: 1,
          candidateAssetCount: 3,
        },
      } as any,
      repositoryContext,
    );

    expect(projectedDetail).toMatchObject({
      summary: 'Measure issuer-auth drift against the active repository boundary.',
      proofStatus: 'read-measurement witness in flight',
      closureFocus: 'read measurement + verification posture',
      bitcodeActivityState: {
        readMeasurement: {
          parserKind: 'benchmark-parser',
          closureCriteriaCount: 1,
        },
        repositoryAnchor: {
          repository: {
            fullName: 'bitcode/terminal',
          },
        },
        interfaceIntegrationRegression: {
          surfaceCount: 7,
          objectFamilyCount: 9,
          recordCount: 7,
          lowDetailSourceSafe: true,
          routeLocalReimplementation: false,
          transactionCockpitRegression: false,
        },
      },
    });
  });

  it('prefers a projected protocol row ahead of persisted execution history rows', () => {
    const projectedRun = {
      id: 'protocol-live-posture::bitcode-terminal',
      created_at: '2026-04-21T18:00:00.000Z',
      type: 'agentic-execution:proof-refresh',
      status: 'running',
      sourceModel: 'protocol-projection',
    } satisfies WorkspaceRun;
    const historyRun = {
      id: 'run-123',
      created_at: '2026-04-21T17:00:00.000Z',
      type: 'agentic-execution:asset-pack',
      status: 'completed',
      sourceModel: 'execution-history',
    } satisfies WorkspaceRun;

    expect(mergeProtocolProjectedRun([historyRun], projectedRun)).toEqual([projectedRun, historyRun]);
  });
});

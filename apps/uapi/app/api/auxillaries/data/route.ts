import { buildGetAuxillaryDataRoute } from '@bitcode/api/src/routes/auxillaries';
import { buildMockAuxillariesData, isAuxillariesMockMode } from '@/lib/mock-review-mode';
import { bitcodeServerTelemetry } from '@/lib/bitcode-server-telemetry';
import { readBitcodeWalletConnectionStatus } from '@/app/api/wallet/_shared';
import {
  buildDisconnectedConnectionStatus,
  buildStoredConnectionStatus,
  getStoredConnection,
  listBitcodeRepositoriesForConnection,
  validateStoredConnection,
} from '@/app/api/vcs/_shared';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const getAuxillaryData = buildGetAuxillaryDataRoute({
  isMockMode: isAuxillariesMockMode,
  mockAuxillaryData: buildMockAuxillariesData,
  resolveWalletConnectionStatus: async ({ supabase, userId, profile }) => {
    return readBitcodeWalletConnectionStatus({
      supabase,
      userId,
      profile: (profile as Record<string, unknown> | null | undefined) ?? null,
    });
  },
  resolveRepositoryInventory: async ({ supabase, userId }) => {
    const { manager, connection } = await getStoredConnection(supabase, userId, 'github');
    if (!connection) {
      return {
        repositoryConnectionStatus: buildDisconnectedConnectionStatus('github'),
        repositories: [],
        repositoryInventorySource: null,
      };
    }

    const valid = await validateStoredConnection(manager, 'github', connection).catch(() => false);

    // Invalid / uninstalled GitHub App sessions must not attempt live inventory
    // (provider 404s used to 500 this route and crash Auxillaries Externals).
    const { repositories, inventorySource } = await listBitcodeRepositoriesForConnection({
      supabase,
      userId,
      manager,
      provider: 'github',
      connection,
      allowLiveInventory: valid,
    });

    // Prefer post-validation connection row (may include regeneration diagnostics).
    // getConnection is optional on lightweight managers in tests — never throw.
    let refreshedConnection = connection;
    try {
      if (manager && typeof manager.getConnection === 'function') {
        refreshedConnection =
          (await manager.getConnection(userId, 'github')) || connection;
      }
    } catch {
      refreshedConnection = connection;
    }

    return {
      repositoryConnectionStatus: buildStoredConnectionStatus(
        'github',
        refreshedConnection,
        valid,
      ),
      repositories: valid ? repositories : [],
      repositoryInventorySource: inventorySource,
    };
  },
});

export async function GET(request: Request) {
  bitcodeServerTelemetry('info', 'auxillaries-data', 'read-start', {
    mockMode: isAuxillariesMockMode(),
  });

  try {
    const response = await getAuxillaryData(request);
    bitcodeServerTelemetry('info', 'auxillaries-data', 'read-finish', {
      status: response.status,
      mockMode: isAuxillariesMockMode(),
    });
    return response;
  } catch (error) {
    bitcodeServerTelemetry('error', 'auxillaries-data', 'read-failed', {
      message: error instanceof Error ? error.message : String(error),
      mockMode: isAuxillariesMockMode(),
    });
    throw error;
  }
}

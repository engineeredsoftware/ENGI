import { traceRoute } from '@bitcode/observability';
import { createAdminClient, type BtdRegistryModel } from '@bitcode/orm';
import { createClient } from '@bitcode/supabase/ssr/server';
import { createJsonResponse } from '@bitcode/api/responses';
import {
  type AssetPackExchangeOrder,
  type AssetPackLedgerAnchor,
  type AssetPackRightsTransferReceipt,
  type BtdAccessPolicy,
  type BtdAncestryReviewInput,
  type BtdAncestryReviewSettlement,
  type BtdAssetPackExchangeInput,
  type BtdAssetPackExchangeSettlement,
  type BtdAssetPackLedgerAnchorInput,
  type BtdAssetPackLedgerAnchorSettlement,
  type BtdBridgeReadinessResearchInput,
  type BtdBridgeReadinessResearchSettlement,
  type BtdBtcFeeTransactionInput,
  type BtdBtcFeeTransactionSettlement,
  type BtdDeploymentReadinessInput,
  type BtdDeploymentReadinessSettlement,
  type BtdInterfaceIntegrationRegressionInput,
  type BtdInterfaceIntegrationRegressionSettlement,
  type BtdLedgerDatabaseReconciliationInput,
  type BtdLedgerDatabaseReconciliationSettlement,
  type BtdLicensedReadRevenueInput,
  type BtdLicensedReadRevenueSettlement,
  type BtdMintDraft,
  type BtdMintDraftInput,
  type BtdOrganizationInterfaceAuthorityRouteInput,
  type BtdProtocolTelemetryBoundaryInput,
  type BtdProtocolTelemetrySettlement,
  type BtdReadAccessInput,
  type BtdReadAccessDecision,
  type BtdReadLicense,
  type BtdOwnershipClaim,
  type BtdSourceToSharesProofInput,
  type BtdSourceToSharesProofSettlement,
  type BtdTerminalJournalInput,
  type BtdTerminalJournalSettlement,
  type TerminalJournalEntry,
  type BtcFeeTransactionReceipt,
  type ProjectionRepairReceipt,
  type V27CryptoTelemetryRecord,
  type BtdProtocolUpgradeReceipt,
  buildBtdAncestryReviewSettlement,
  buildBtdAssetPackExchangeSettlement,
  buildBtdAssetPackLedgerAnchorSettlement,
  buildBtdBridgeReadinessResearchSettlement,
  buildBtdBtcFeeTransactionSettlement,
  buildBtdDeploymentReadinessSettlement,
  buildBtdInterfaceIntegrationRegressionSettlement,
  buildBtdLedgerDatabaseReconciliationSettlement,
  buildBtdLicensedReadRevenueSettlement,
  buildBtdMintDraft,
  buildBtdOrganizationInterfaceAuthorityDecision,
  buildBtdProtocolTelemetrySettlement,
  buildBtdReadAccessDecision,
  buildBtdRegistrySnapshot,
  buildBtdSourceToSharesProofSettlement,
  buildBtdStableId as stableId,
  buildBtdTerminalJournalSettlement,
  buildLicensedReadRevenueRoute,
  parseBtdOptionalBigInt,
  parseBtdRequiredBigInt,
  reviewBtdAncestorEdges,
  toBtdJsonSafe as toJsonSafe,
} from '@bitcode/btd';

export {
  buildBtdAncestryReviewSettlement,
  buildBtdAssetPackExchangeSettlement,
  buildBtdAssetPackLedgerAnchorSettlement,
  buildBtdBridgeReadinessResearchSettlement,
  buildBtdBtcFeeTransactionSettlement,
  buildBtdDeploymentReadinessSettlement,
  buildBtdInterfaceIntegrationRegressionSettlement,
  buildBtdLedgerDatabaseReconciliationSettlement,
  buildBtdLicensedReadRevenueSettlement,
  buildBtdMintDraft,
  buildBtdOrganizationInterfaceAuthorityDecision,
  buildBtdProtocolTelemetrySettlement,
  buildBtdReadAccessDecision,
  buildBtdRegistrySnapshot,
  buildBtdSourceToSharesProofSettlement,
  buildBtdTerminalJournalSettlement,
};

type AuthenticatedUser = {
  userId: string;
};

type BtdRouteAuthResolver = (request: Request) => Promise<AuthenticatedUser | null>;

type BtdRouteOptions = {
  registry?: BtdRegistryModel;
  resolveAuthenticatedUser?: BtdRouteAuthResolver;
};

type BtdReadAccessRouteInput = Omit<BtdReadAccessInput, 'accessPolicy'> & {
  accessPolicy?: BtdAccessPolicy;
};

let defaultRegistry: BtdRegistryModel | null = null;

function getDefaultRegistry() {
  if (!defaultRegistry) {
    defaultRegistry = createAdminClient().btdRegistry;
  }

  return defaultRegistry;
}

async function defaultResolveAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!user || error) {
    return null;
  }

  return { userId: user.id };
}

export function buildGetBtdRegistrySnapshotRoute(options: BtdRouteOptions = {}) {
  return traceRoute('/btd/registry', async (request: Request) => {
    const user = await (options.resolveAuthenticatedUser ?? defaultResolveAuthenticatedUser)(
      request,
    );
    if (!user) {
      return createJsonResponse({ error: 'Unauthorized' }, 401);
    }

    const url = new URL(request.url);
    const snapshot = await buildBtdRegistrySnapshot({
      registry: options.registry ?? getDefaultRegistry(),
      assetPackId: url.searchParams.get('assetPackId'),
    });

    return createJsonResponse(toJsonSafe(snapshot));
  });
}

export function buildPostBtdMintDraftRoute(options: BtdRouteOptions = {}) {
  return traceRoute('/btd/mint-draft', async (request: Request) => {
    const user = await (options.resolveAuthenticatedUser ?? defaultResolveAuthenticatedUser)(
      request,
    );
    if (!user) {
      return createJsonResponse({ error: 'Unauthorized' }, 401);
    }

    let body: Omit<BtdMintDraftInput, 'actorId' | 'exchangeSequence'> & {
      exchangeSequence: string | number;
    };
    try {
      body = await request.json();
    } catch {
      return createJsonResponse({ error: 'Invalid JSON body' }, 400);
    }

    let draft: BtdMintDraft;
    try {
      draft = buildBtdMintDraft({
        ...body,
        actorId: user.userId,
        exchangeSequence: parseBtdRequiredBigInt(body.exchangeSequence, 'exchangeSequence'),
      });
    } catch (error) {
      return createJsonResponse({ error: toBadRequestMessage(error) }, 400);
    }

    return createJsonResponse(toJsonSafe(draft));
  });
}

export function buildPostBtdReadAccessRoute(options: BtdRouteOptions = {}) {
  return traceRoute('/btd/read-access', async (request: Request) => {
    const user = await (options.resolveAuthenticatedUser ?? defaultResolveAuthenticatedUser)(
      request,
    );
    if (!user) {
      return createJsonResponse({ error: 'Unauthorized' }, 401);
    }

    let body: BtdReadAccessRouteInput;
    try {
      body = await request.json();
    } catch {
      return createJsonResponse({ error: 'Invalid JSON body' }, 400);
    }

    let decision: BtdReadAccessDecision;
    try {
      const registry = options.registry;
      const accessPolicy =
        body.accessPolicy ?? (await resolveRegistryAccessPolicy(registry, body.assetPackId));
      const ownershipClaims =
        body.ownershipClaims ??
        (registry
          ? mapRegistryOwnershipClaims(
              await registry.listOwnershipClaims({
                walletId: body.walletId,
                assetPackId: body.assetPackId,
              }),
            )
          : undefined);
      const licenses =
        body.licenses ??
        (registry
          ? mapRegistryReadLicenses(
              await registry.listReadLicenses({
                walletId: body.walletId,
                assetPackId: body.assetPackId,
              }),
            )
          : undefined);

      decision = buildBtdReadAccessDecision({
        ...body,
        accessPolicy,
        ownershipClaims,
        licenses,
        actorId: user.userId,
      });
    } catch (error) {
      return createJsonResponse({ error: toBadRequestMessage(error) }, 400);
    }

    return createJsonResponse(toJsonSafe(decision));
  });
}

export function buildPostBtdOrganizationInterfaceAuthorityRoute(
  options: BtdRouteOptions = {},
) {
  return traceRoute('/btd/organization-interface-authority', async (request: Request) => {
    const user = await (options.resolveAuthenticatedUser ?? defaultResolveAuthenticatedUser)(
      request,
    );
    if (!user) {
      return createJsonResponse({ error: 'Unauthorized' }, 401);
    }

    let body: BtdOrganizationInterfaceAuthorityRouteInput;
    try {
      body = await request.json();
    } catch {
      return createJsonResponse({ error: 'Invalid JSON body' }, 400);
    }

    try {
      const decision = buildBtdOrganizationInterfaceAuthorityDecision({
        ...body,
        actorId: user.userId,
      });

      return createJsonResponse(toJsonSafe(decision));
    } catch (error) {
      return createJsonResponse({ error: toBadRequestMessage(error) }, 400);
    }
  });
}

export function buildPostBtdLicensedReadRevenueRoute(options: BtdRouteOptions = {}) {
  return traceRoute('/btd/licensed-read-revenue', async (request: Request) => {
    const user = await (options.resolveAuthenticatedUser ?? defaultResolveAuthenticatedUser)(
      request,
    );
    if (!user) {
      return createJsonResponse({ error: 'Unauthorized' }, 401);
    }

    let body: Omit<BtdLicensedReadRevenueInput, 'actorId' | 'exchangeSequence'> & {
      exchangeSequence: string | number;
    };
    try {
      body = await request.json();
    } catch {
      return createJsonResponse({ error: 'Invalid JSON body' }, 400);
    }

    let settlement: BtdLicensedReadRevenueSettlement;
    try {
      const draft = buildBtdLicensedReadRevenueSettlement({
        ...body,
        actorId: user.userId,
        exchangeSequence: parseBtdRequiredBigInt(body.exchangeSequence, 'exchangeSequence'),
      });
      const registry =
        body.commitToRegistry === true ? options.registry ?? getDefaultRegistry() : undefined;
      const registryWrite = registry
        ? await registry.insertLicensedReadRevenueRoute(toRevenueRegistryRow(draft.receipt))
        : undefined;

      settlement = {
        ...draft,
        registryWrite,
        committed: Boolean(registryWrite),
      };
    } catch (error) {
      return createJsonResponse({ error: toBadRequestMessage(error) }, 400);
    }

    return createJsonResponse(toJsonSafe(settlement));
  });
}

export function buildPostBtdAncestryReviewRoute(options: BtdRouteOptions = {}) {
  return traceRoute('/btd/ancestry-review', async (request: Request) => {
    const user = await (options.resolveAuthenticatedUser ?? defaultResolveAuthenticatedUser)(
      request,
    );
    if (!user) {
      return createJsonResponse({ error: 'Unauthorized' }, 401);
    }

    let body: Omit<BtdAncestryReviewInput, 'actorId' | 'exchangeSequence'> & {
      exchangeSequence: string | number;
    };
    try {
      body = await request.json();
    } catch {
      return createJsonResponse({ error: 'Invalid JSON body' }, 400);
    }

    let settlement: BtdAncestryReviewSettlement;
    try {
      const draft = buildBtdAncestryReviewSettlement({
        ...body,
        actorId: user.userId,
        exchangeSequence: parseBtdRequiredBigInt(body.exchangeSequence, 'exchangeSequence'),
      });
      const registry =
        body.commitToRegistry === true ? options.registry ?? getDefaultRegistry() : undefined;
      const registryWrites = registry
        ? await Promise.all(
            draft.receipt.edges.map((edge, index) =>
              registry.insertAncestorEdge(toAncestorEdgeRegistryRow(draft.receipt, edge, index)),
            ),
          )
        : undefined;

      settlement = {
        ...draft,
        registryWrites,
        committed: Boolean(registryWrites),
      };
    } catch (error) {
      return createJsonResponse({ error: toBadRequestMessage(error) }, 400);
    }

    return createJsonResponse(toJsonSafe(settlement));
  });
}

export function buildPostBtdBtcFeeTransactionRoute(options: BtdRouteOptions = {}) {
  return traceRoute('/btd/btc-fee-transaction', async (request: Request) => {
    const user = await (options.resolveAuthenticatedUser ?? defaultResolveAuthenticatedUser)(
      request,
    );
    if (!user) {
      return createJsonResponse({ error: 'Unauthorized' }, 401);
    }

    let body: BtdBtcFeeTransactionInput;
    try {
      body = await request.json();
    } catch {
      return createJsonResponse({ error: 'Invalid JSON body' }, 400);
    }

    let settlement: BtdBtcFeeTransactionSettlement;
    try {
      const draft = buildBtdBtcFeeTransactionSettlement({
        ...body,
        actorId: user.userId,
        exchangeSequence: parseBtdOptionalBigInt(body.exchangeSequence, 'exchangeSequence'),
      });
      const registry =
        body.commitToRegistry === true ? options.registry ?? getDefaultRegistry() : undefined;
      const registryWrite = registry
        ? await registry.insertBtcFeeTransaction(toBtcFeeTransactionRegistryRow(draft.receipt))
        : undefined;

      settlement = {
        ...draft,
        registryWrite,
        committed: Boolean(registryWrite),
      };
    } catch (error) {
      return createJsonResponse({ error: toBadRequestMessage(error) }, 400);
    }

    return createJsonResponse(toJsonSafe(settlement));
  });
}

export function buildPostBtdAssetPackLedgerAnchorRoute(options: BtdRouteOptions = {}) {
  return traceRoute('/btd/asset-pack-ledger-anchor', async (request: Request) => {
    const user = await (options.resolveAuthenticatedUser ?? defaultResolveAuthenticatedUser)(
      request,
    );
    if (!user) {
      return createJsonResponse({ error: 'Unauthorized' }, 401);
    }

    let body: BtdAssetPackLedgerAnchorInput;
    try {
      body = await request.json();
    } catch {
      return createJsonResponse({ error: 'Invalid JSON body' }, 400);
    }

    let settlement: BtdAssetPackLedgerAnchorSettlement;
    try {
      const draft = buildBtdAssetPackLedgerAnchorSettlement({
        ...body,
        actorId: user.userId,
        exchangeSequence: parseBtdRequiredBigInt(body.exchangeSequence, 'exchangeSequence'),
      });
      const registry =
        body.commitToRegistry === true ? options.registry ?? getDefaultRegistry() : undefined;
      const registryWrite = registry
        ? await registry.insertLedgerAnchor(toAssetPackLedgerAnchorRegistryRow(draft.anchor))
        : undefined;

      settlement = {
        ...draft,
        registryWrite,
        committed: Boolean(registryWrite),
      };
    } catch (error) {
      return createJsonResponse({ error: toBadRequestMessage(error) }, 400);
    }

    return createJsonResponse(toJsonSafe(settlement));
  });
}

export function buildPostBtdAssetPackExchangeRoute(options: BtdRouteOptions = {}) {
  return traceRoute('/btd/asset-pack-exchange', async (request: Request) => {
    const user = await (options.resolveAuthenticatedUser ?? defaultResolveAuthenticatedUser)(
      request,
    );
    if (!user) {
      return createJsonResponse({ error: 'Unauthorized' }, 401);
    }

    let body: BtdAssetPackExchangeInput;
    try {
      body = await request.json();
    } catch {
      return createJsonResponse({ error: 'Invalid JSON body' }, 400);
    }

    let settlement: BtdAssetPackExchangeSettlement;
    try {
      const draft = buildBtdAssetPackExchangeSettlement({
        ...body,
        actorId: user.userId,
        createdAtExchangeSequence:
          parseBtdOptionalBigInt(body.createdAtExchangeSequence, 'createdAtExchangeSequence'),
        settledAtExchangeSequence:
          parseBtdOptionalBigInt(body.settledAtExchangeSequence, 'settledAtExchangeSequence'),
      });
      const registry =
        body.commitToRegistry === true ? options.registry ?? getDefaultRegistry() : undefined;
      const registryWrite = registry
        ? await commitAssetPackExchangeSettlement(registry, draft)
        : undefined;

      settlement = {
        ...draft,
        registryWrite,
        committed: Boolean(registryWrite),
      };
    } catch (error) {
      return createJsonResponse({ error: toBadRequestMessage(error) }, 400);
    }

    return createJsonResponse(toJsonSafe(settlement));
  });
}

export function buildPostBtdTerminalJournalRoute(options: BtdRouteOptions = {}) {
  return traceRoute('/btd/terminal-journal', async (request: Request) => {
    const user = await (options.resolveAuthenticatedUser ?? defaultResolveAuthenticatedUser)(
      request,
    );
    if (!user) {
      return createJsonResponse({ error: 'Unauthorized' }, 401);
    }

    let body: BtdTerminalJournalInput;
    try {
      body = await request.json();
    } catch {
      return createJsonResponse({ error: 'Invalid JSON body' }, 400);
    }

    let settlement: BtdTerminalJournalSettlement;
    try {
      const draft = buildBtdTerminalJournalSettlement({
        ...body,
        actorId: user.userId,
        exchangeSequence: parseBtdOptionalBigInt(body.exchangeSequence, 'exchangeSequence'),
      });
      const registry =
        body.commitToRegistry === true && draft.entry
          ? options.registry ?? getDefaultRegistry()
          : undefined;
      const registryWrite = registry
        ? await registry.insertTerminalJournalEntry(toTerminalJournalRegistryRow(draft.entry!))
        : undefined;

      settlement = {
        ...draft,
        registryWrite,
        committed: Boolean(registryWrite),
      };
    } catch (error) {
      return createJsonResponse({ error: toBadRequestMessage(error) }, 400);
    }

    return createJsonResponse(toJsonSafe(settlement));
  });
}

export function buildPostBtdLedgerDatabaseReconciliationRoute(options: BtdRouteOptions = {}) {
  return traceRoute('/btd/ledger-database-reconciliation', async (request: Request) => {
    const user = await (options.resolveAuthenticatedUser ?? defaultResolveAuthenticatedUser)(
      request,
    );
    if (!user) {
      return createJsonResponse({ error: 'Unauthorized' }, 401);
    }

    let body: BtdLedgerDatabaseReconciliationInput;
    try {
      body = await request.json();
    } catch {
      return createJsonResponse({ error: 'Invalid JSON body' }, 400);
    }

    let settlement: BtdLedgerDatabaseReconciliationSettlement;
    try {
      const draft = buildBtdLedgerDatabaseReconciliationSettlement({
        ...body,
        actorId: user.userId,
      });
      const registry =
        body.commitToRegistry === true ? options.registry ?? getDefaultRegistry() : undefined;
      const registryWrites = registry
        ? await Promise.all(
            draft.report.repairs.map((repair) =>
              registry.insertReconciliationRepair(
                toLedgerDatabaseReconciliationRepairRegistryRow(
                  draft.report.reconciliationId,
                  repair,
                ),
              ),
            ),
          )
        : undefined;

      settlement = {
        ...draft,
        registryWrites,
        committed: Boolean(registryWrites),
      };
    } catch (error) {
      return createJsonResponse({ error: toBadRequestMessage(error) }, 400);
    }

    return createJsonResponse(toJsonSafe(settlement));
  });
}

export function buildPostBtdSourceToSharesProofRoute(options: BtdRouteOptions = {}) {
  return traceRoute('/btd/source-to-shares-proof', async (request: Request) => {
    const user = await (options.resolveAuthenticatedUser ?? defaultResolveAuthenticatedUser)(
      request,
    );
    if (!user) {
      return createJsonResponse({ error: 'Unauthorized' }, 401);
    }

    let body: Omit<BtdSourceToSharesProofInput, 'actorId' | 'exchangeSequence'> & {
      exchangeSequence: string | number;
    };
    try {
      body = await request.json();
    } catch {
      return createJsonResponse({ error: 'Invalid JSON body' }, 400);
    }

    let settlement: BtdSourceToSharesProofSettlement;
    try {
      settlement = buildBtdSourceToSharesProofSettlement({
        ...body,
        actorId: user.userId,
        exchangeSequence: parseBtdRequiredBigInt(body.exchangeSequence, 'exchangeSequence'),
      });
    } catch (error) {
      return createJsonResponse({ error: toBadRequestMessage(error) }, 400);
    }

    return createJsonResponse(toJsonSafe(settlement));
  });
}

export function buildPostBtdBridgeReadinessResearchRoute(options: BtdRouteOptions = {}) {
  return traceRoute('/btd/bridge-readiness-research', async (request: Request) => {
    const user = await (options.resolveAuthenticatedUser ?? defaultResolveAuthenticatedUser)(
      request,
    );
    if (!user) {
      return createJsonResponse({ error: 'Unauthorized' }, 401);
    }

    let body: Omit<BtdBridgeReadinessResearchInput, 'actorId' | 'exchangeSequence'> & {
      exchangeSequence: string | number;
    };
    try {
      body = await request.json();
    } catch {
      return createJsonResponse({ error: 'Invalid JSON body' }, 400);
    }

    let settlement: BtdBridgeReadinessResearchSettlement;
    try {
      settlement = buildBtdBridgeReadinessResearchSettlement({
        ...body,
        actorId: user.userId,
        exchangeSequence: parseBtdRequiredBigInt(body.exchangeSequence, 'exchangeSequence'),
      });
    } catch (error) {
      return createJsonResponse({ error: toBadRequestMessage(error) }, 400);
    }

    return createJsonResponse(toJsonSafe(settlement));
  });
}

export function buildPostBtdProtocolTelemetryRoute(options: BtdRouteOptions = {}) {
  return traceRoute('/btd/protocol-telemetry', async (request: Request) => {
    const user = await (options.resolveAuthenticatedUser ?? defaultResolveAuthenticatedUser)(
      request,
    );
    if (!user) {
      return createJsonResponse({ error: 'Unauthorized' }, 401);
    }

    let body: Omit<BtdProtocolTelemetryBoundaryInput, 'actorId' | 'exchangeSequence'> & {
      exchangeSequence: string | number;
    };
    try {
      body = await request.json();
    } catch {
      return createJsonResponse({ error: 'Invalid JSON body' }, 400);
    }

    let settlement: BtdProtocolTelemetrySettlement;
    try {
      settlement = buildBtdProtocolTelemetrySettlement({
        ...body,
        actorId: user.userId,
        exchangeSequence: parseBtdRequiredBigInt(body.exchangeSequence, 'exchangeSequence'),
      });
    } catch (error) {
      return createJsonResponse({ error: toBadRequestMessage(error) }, 400);
    }

    return createJsonResponse(toJsonSafe(settlement));
  });
}

export function buildPostBtdInterfaceIntegrationRegressionRoute(options: BtdRouteOptions = {}) {
  return traceRoute('/btd/interface-integration-regression', async (request: Request) => {
    const user = await (options.resolveAuthenticatedUser ?? defaultResolveAuthenticatedUser)(
      request,
    );
    if (!user) {
      return createJsonResponse({ error: 'Unauthorized' }, 401);
    }

    let body: Omit<BtdInterfaceIntegrationRegressionInput, 'actorId' | 'exchangeSequence'> & {
      exchangeSequence: string | number;
    };
    try {
      body = await request.json();
    } catch {
      return createJsonResponse({ error: 'Invalid JSON body' }, 400);
    }

    let settlement: BtdInterfaceIntegrationRegressionSettlement;
    try {
      settlement = buildBtdInterfaceIntegrationRegressionSettlement({
        ...body,
        actorId: user.userId,
        exchangeSequence: parseBtdRequiredBigInt(body.exchangeSequence, 'exchangeSequence'),
      });
    } catch (error) {
      return createJsonResponse({ error: toBadRequestMessage(error) }, 400);
    }

    return createJsonResponse(toJsonSafe(settlement));
  });
}

export function buildPostBtdDeploymentReadinessRoute(options: BtdRouteOptions = {}) {
  return traceRoute('/btd/deployment-readiness', async (request: Request) => {
    const user = await (options.resolveAuthenticatedUser ?? defaultResolveAuthenticatedUser)(
      request,
    );
    if (!user) {
      return createJsonResponse({ error: 'Unauthorized' }, 401);
    }

    let body: BtdDeploymentReadinessInput;
    try {
      body = await request.json();
    } catch {
      return createJsonResponse({ error: 'Invalid JSON body' }, 400);
    }

    let settlement: BtdDeploymentReadinessSettlement;
    try {
      const draft = buildBtdDeploymentReadinessSettlement({
        ...body,
        actorId: user.userId,
      });
      const registry =
        body.commitToRegistry === true ? options.registry ?? getDefaultRegistry() : undefined;
      const registryWrite =
        registry && draft.telemetry
          ? await registry.insertCryptoTelemetryEvent(toCryptoTelemetryRegistryRow(draft.telemetry))
          : registry && draft.upgradeReceipt
            ? await registry.insertProtocolUpgradeReceipt(
                toProtocolUpgradeRegistryRow(draft.upgradeReceipt),
              )
            : undefined;

      settlement = {
        ...draft,
        registryWrite,
        committed: Boolean(registryWrite),
      };
    } catch (error) {
      return createJsonResponse({ error: toBadRequestMessage(error) }, 400);
    }

    return createJsonResponse(toJsonSafe(settlement));
  });
}

export const getBtdRegistrySnapshot = buildGetBtdRegistrySnapshotRoute();
export const postBtdMintDraft = buildPostBtdMintDraftRoute();
export const postBtdReadAccess = buildPostBtdReadAccessRoute();
export const postBtdOrganizationInterfaceAuthority =
  buildPostBtdOrganizationInterfaceAuthorityRoute();
export const postBtdLicensedReadRevenue = buildPostBtdLicensedReadRevenueRoute();
export const postBtdAncestryReview = buildPostBtdAncestryReviewRoute();
export const postBtdBtcFeeTransaction = buildPostBtdBtcFeeTransactionRoute();
export const postBtdAssetPackLedgerAnchor = buildPostBtdAssetPackLedgerAnchorRoute();
export const postBtdAssetPackExchange = buildPostBtdAssetPackExchangeRoute();
export const postBtdTerminalJournal = buildPostBtdTerminalJournalRoute();
export const postBtdLedgerDatabaseReconciliation =
  buildPostBtdLedgerDatabaseReconciliationRoute();
export const postBtdSourceToSharesProof = buildPostBtdSourceToSharesProofRoute();
export const postBtdBridgeReadinessResearch = buildPostBtdBridgeReadinessResearchRoute();
export const postBtdProtocolTelemetry = buildPostBtdProtocolTelemetryRoute();
export const postBtdInterfaceIntegrationRegression =
  buildPostBtdInterfaceIntegrationRegressionRoute();
export const postBtdDeploymentReadiness = buildPostBtdDeploymentReadinessRoute();

function toBadRequestMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Invalid BTD route input';
}

function toRevenueRegistryRow(
  receipt: ReturnType<typeof buildLicensedReadRevenueRoute>,
): Record<string, unknown> {
  return {
    payment_id: receipt.paymentId,
    asset_pack_id: receipt.assetPackId,
    price_asset: receipt.priceAsset,
    gross_sats: receipt.grossSats.toString(),
    direct_sats: receipt.directSats.toString(),
    ancestor_sats: receipt.ancestorSats.toString(),
    treasury_sats: receipt.treasurySats.toString(),
    dispute_holdback_sats: receipt.disputeHoldbackSats.toString(),
    direct_routes: toJsonSafe(receipt.directRoutes),
    ancestor_routes: toJsonSafe(receipt.ancestorRoutes),
    treasury_routes: toJsonSafe(receipt.treasuryRoutes),
    treasury_wallet_id: receipt.treasuryWalletId,
    dispute_holdback_wallet_id: receipt.disputeHoldbackWalletId ?? null,
    pending_routes: toJsonSafe(receipt.pendingRoutes),
    failed_routes: toJsonSafe(receipt.failedRoutes),
    route_state: receipt.routeState,
    exchange_sequence: receipt.exchangeSequence.toString(),
    receipt: toJsonSafe(receipt),
    issued_at: receipt.issuedAt,
  };
}

function toAncestorEdgeRegistryRow(
  receipt: ReturnType<typeof reviewBtdAncestorEdges>,
  edge: ReturnType<typeof reviewBtdAncestorEdges>['edges'][number],
  index: number,
): Record<string, unknown> {
  return {
    edge_id: stableId('btd-ancestor-edge', [
      receipt.reviewId,
      String(index),
      edge.parentAssetPackId,
      edge.childAssetPackId,
      edge.edgeKind,
    ]),
    review_id: receipt.reviewId,
    parent_asset_pack_id: edge.parentAssetPackId,
    child_asset_pack_id: edge.childAssetPackId,
    edge_kind: edge.edgeKind,
    evidence_root: edge.evidenceRoot,
    source_fingerprint_root: edge.sourceFingerprintRoot ?? null,
    reviewer_receipt_root: edge.reviewerReceiptRoot ?? null,
    claimant_id: edge.claimantId ?? null,
    reviewer_id: edge.reviewerId ?? null,
    confidence_bps: edge.confidenceBps,
    timelessness_bps: edge.timelessnessBps,
    depth: edge.depth,
    status: edge.status,
    rejection_reason: edge.rejectionReason ?? null,
    risk_flags: toJsonSafe(edge.riskFlags),
    route_weight: edge.routeWeight,
    created_after_child_fit: edge.createdAfterChildFit,
    conflict_disclosure: toJsonSafe(edge.conflictDisclosure),
    supply_effect: edge.supplyEffect,
    mint_count_delta: edge.mintCountDelta,
    receipt: toJsonSafe(receipt),
    issued_at: receipt.issuedAt,
  };
}

function toBtcFeeTransactionRegistryRow(
  receipt: BtcFeeTransactionReceipt,
): Record<string, unknown> {
  return {
    receipt_id: receipt.receiptId,
    fee_purpose: receipt.feePurpose,
    payer_wallet_id: receipt.payerWalletId,
    wallet_session_id: receipt.walletSessionId,
    network: receipt.network,
    wallet_authorization_proof: toJsonSafe(receipt.walletAuthorizationProof),
    txid: receipt.txid,
    vout: receipt.vout ?? null,
    psbt: receipt.psbt,
    sats_paid: receipt.satsPaid.toString(),
    sats_per_vbyte: receipt.satsPerVbyte ?? null,
    exchange_sequence: receipt.exchangeSequence.toString(),
    terminal_journal_root: receipt.terminalJournalRoot,
    related_asset_pack_id: receipt.relatedAssetPackId ?? null,
    related_order_id: receipt.relatedOrderId ?? null,
    finality_state: receipt.finalityState,
    confirmations: receipt.confirmations,
    fee_asset: receipt.feeAsset,
    server_custody: receipt.serverCustody,
    receipt: toJsonSafe(receipt),
    issued_at: receipt.issuedAt,
  };
}

function toAssetPackLedgerAnchorRegistryRow(
  anchor: AssetPackLedgerAnchor,
): Record<string, unknown> {
  return {
    anchor_id: anchor.anchorId,
    asset_pack_id: anchor.assetPackId,
    chain: anchor.chain,
    network: anchor.network,
    txid_or_hash: anchor.txidOrHash,
    output_index: anchor.outputIndex ?? null,
    contract_address: anchor.contractAddress ?? null,
    token_id: anchor.tokenId ?? null,
    commitment_method: anchor.commitmentMethod ?? null,
    commitment_root: anchor.commitmentRoot,
    source_manifest_root: anchor.sourceManifestRoot,
    proof_root: anchor.proofRoot,
    access_policy_hash: anchor.accessPolicyHash,
    btd_range_start: anchor.btdRangeStart,
    btd_range_end_exclusive: anchor.btdRangeEndExclusive,
    finality_state: anchor.finalityState,
    confirmations: anchor.confirmations,
    receipt: toJsonSafe(anchor),
    issued_at: anchor.anchoredAt ?? new Date().toISOString(),
  };
}

async function commitAssetPackExchangeSettlement(
  registry: BtdRegistryModel,
  settlement: Omit<BtdAssetPackExchangeSettlement, 'registryWrite' | 'committed'>,
) {
  if (settlement.rightsTransfer) {
    return registry.insertRightsTransferReceipt(
      toAssetPackRightsTransferRegistryRow(settlement.rightsTransfer),
    );
  }

  if (!settlement.order) {
    throw new Error('AssetPack Exchange commit requires order or rightsTransfer.');
  }

  const row = toAssetPackExchangeOrderRegistryRow(settlement.order);
  if (settlement.action === 'create_order') {
    return registry.insertExchangeOrder(row);
  }

  return registry.updateExchangeOrder(settlement.order.orderId, row);
}

function toAssetPackExchangeOrderRegistryRow(
  order: AssetPackExchangeOrder,
): Record<string, unknown> {
  return {
    order_id: order.orderId,
    order_kind: order.orderKind,
    asset_pack_id: order.assetPackId,
    range_start: order.rangeStart,
    range_end_exclusive: order.rangeEndExclusive,
    maker_wallet_id: order.makerWalletId,
    taker_wallet_id: order.takerWalletId ?? null,
    price_asset: order.priceAsset,
    price_sats: order.priceSats.toString(),
    access_policy_hash: order.accessPolicyHash,
    order_state: order.orderState,
    created_at_exchange_sequence: order.createdAtExchangeSequence.toString(),
    settled_at_exchange_sequence: order.settledAtExchangeSequence?.toString() ?? null,
    ledger_anchor_id: order.ledgerAnchorId ?? null,
    receipt: toJsonSafe(order),
  };
}

function toAssetPackRightsTransferRegistryRow(
  receipt: AssetPackRightsTransferReceipt,
): Record<string, unknown> {
  return {
    receipt_id: receipt.receiptId,
    order_id: receipt.orderId,
    asset_pack_id: receipt.assetPackId,
    range_start: receipt.rangeStart,
    range_end_exclusive: receipt.rangeEndExclusive,
    from_wallet_id: receipt.fromWalletId,
    to_wallet_id: receipt.toWalletId,
    price_asset: receipt.priceAsset,
    price_sats: receipt.priceSats.toString(),
    access_policy_hash: receipt.accessPolicyHash,
    btc_fee_receipt_id: receipt.btcFeeReceiptId,
    ledger_anchor_id: receipt.ledgerAnchorId ?? null,
    exchange_sequence: receipt.exchangeSequence.toString(),
    receipt: toJsonSafe(receipt),
    issued_at: receipt.issuedAt,
  };
}

function toTerminalJournalRegistryRow(entry: TerminalJournalEntry): Record<string, unknown> {
  return {
    journal_entry_id: entry.journalEntryId,
    transaction_kind: entry.transactionKind,
    actor_id: entry.actorId,
    pre_state_root: entry.preStateRoot,
    post_state_root: entry.postStateRoot,
    receipt_roots: toJsonSafe(entry.receiptRoots),
    ledger_anchor_ids: toJsonSafe(entry.ledgerAnchorIds),
    exchange_sequence: entry.exchangeSequence.toString(),
    issued_at: entry.issuedAt,
  };
}

function toLedgerDatabaseReconciliationRepairRegistryRow(
  reconciliationId: string,
  repair: ProjectionRepairReceipt,
): Record<string, unknown> {
  return {
    repair_id: repair.repairId,
    reconciliation_id: reconciliationId,
    fact_id: repair.factId,
    repair_kind: repair.repairKind,
    before_value: repair.before,
    after_value: repair.after,
    blocking: repair.blocking,
    issued_at: repair.issuedAt,
  };
}

function toCryptoTelemetryRegistryRow(record: V27CryptoTelemetryRecord): Record<string, unknown> {
  return {
    event: record.event,
    severity: record.severity,
    subject_id: record.subjectId,
    receipt_root: record.receiptRoot ?? null,
    ledger_anchor_id: record.ledgerAnchorId ?? null,
    issued_at: record.issuedAt,
  };
}

function toProtocolUpgradeRegistryRow(receipt: BtdProtocolUpgradeReceipt): Record<string, unknown> {
  return {
    upgrade_id: receipt.upgradeId,
    from_version: receipt.fromVersion,
    to_version: receipt.toVersion,
    network: receipt.network,
    migration_root: receipt.migrationRoot,
    pre_state_root: receipt.preStateRoot,
    post_state_root: receipt.postStateRoot,
    approval_receipt_root: receipt.approvalReceiptRoot,
    rollback_plan_root: receipt.rollbackPlanRoot,
    ledger_anchor_id: receipt.ledgerAnchorId ?? null,
    upgrade_state: receipt.upgradeState,
    receipt: toJsonSafe(receipt),
    issued_at: receipt.issuedAt,
  };
}

async function resolveRegistryAccessPolicy(
  registry: BtdRegistryModel | undefined,
  assetPackId: string,
): Promise<BtdAccessPolicy> {
  if (!registry) {
    throw new Error('accessPolicy is required when no registry projection is supplied.');
  }

  const [range] = await registry.listAssetPackRanges(assetPackId);
  if (!range) {
    throw new Error('No registry range found for AssetPack access policy.');
  }

  return {
    accessPolicyId: readStringField(range, 'access_policy_id', 'accessPolicyId'),
    accessPolicyHash: readStringField(range, 'access_policy_hash', 'accessPolicyHash'),
    ownerRead: readBooleanField(range, true, 'owner_read', 'ownerRead'),
    licensedRead: readBooleanField(range, true, 'licensed_read', 'licensedRead'),
    derivativeUse: readBooleanField(range, false, 'derivative_use', 'derivativeUse'),
    redistributionAllowed: readBooleanField(
      range,
      false,
      'redistribution_allowed',
      'redistributionAllowed',
    ),
    confidentiality: readConfidentiality(range),
  };
}

function mapRegistryOwnershipClaims(rows: Record<string, unknown>[]): BtdOwnershipClaim[] {
  return rows.map((row) => ({
    walletId: readStringField(row, 'to_wallet_id', 'walletId'),
    assetPackId: readStringField(row, 'asset_pack_id', 'assetPackId'),
    rangeStart: readNumberField(row, 'range_start', 'rangeStart'),
    rangeEndExclusive: readNumberField(row, 'range_end_exclusive', 'rangeEndExclusive'),
    accessPolicyHash: readStringField(row, 'access_policy_hash', 'accessPolicyHash'),
  }));
}

function mapRegistryReadLicenses(rows: Record<string, unknown>[]): BtdReadLicense[] {
  return rows.map((row) => ({
    licenseId: readStringField(row, 'license_id', 'licenseId'),
    walletId: readStringField(row, 'wallet_id', 'walletId'),
    assetPackId: readStringField(row, 'asset_pack_id', 'assetPackId'),
    accessPolicyHash: readStringField(row, 'access_policy_hash', 'accessPolicyHash'),
    validFrom: readStringField(row, 'valid_from', 'validFrom'),
    expiresAt: readOptionalStringField(row, 'expires_at', 'expiresAt'),
    revokedAt: readOptionalStringField(row, 'revoked_at', 'revokedAt'),
  }));
}

function readStringField(row: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  throw new Error(`${keys[0]} must be a non-empty string.`);
}

function readOptionalStringField(
  row: Record<string, unknown>,
  ...keys: string[]
): string | undefined {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  return undefined;
}

function readNumberField(row: Record<string, unknown>, ...keys: string[]): number {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'number' && Number.isSafeInteger(value)) {
      return value;
    }
    if (typeof value === 'string' && /^-?\d+$/.test(value)) {
      return Number(value);
    }
  }

  throw new Error(`${keys[0]} must be a safe integer.`);
}

function readBooleanField(
  row: Record<string, unknown>,
  fallback: boolean,
  ...keys: string[]
): boolean {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'boolean') {
      return value;
    }
  }

  return fallback;
}

function readConfidentiality(row: Record<string, unknown>): BtdAccessPolicy['confidentiality'] {
  const value = readOptionalStringField(row, 'confidentiality');
  if (value === 'public' || value === 'private' || value === 'public_proof_private_source') {
    return value;
  }

  return 'public_proof_private_source';
}

/**
 * Discovery phase registration for AssetPack SDIVF product pipelines.
 *
 * Topology (deposit and read — same shape, product-specific search agent):
 *
 *   sequential(
 *     parallel(
 *       discovery:comprehend-codebase,
 *       discovery:inherent-regurgitation,
 *     ),
 *     discovery:search-depository-for-{deposit-relevants|read-need-fits},
 *   )
 *
 * Wave 1 builds grounded checkout understanding. Wave 2 builds Depository
 * search queries from that comprehension (and product steering) and runs
 * search — never racing wave 1.
 *
 *   Deposit search: find **relevant** settled supply / demand alignment.
 *   Read search: find **fits to Need**.
 *
 * The historical five-agent Engi sequence is deleted.
 */

/** Shared wave-1 Discovery agent keys (deposit and read). */
export const DISCOVERY_COMPREHEND_CODEBASE = 'discovery:comprehend-codebase';
export const DISCOVERY_INHERENT_REGURGITATION = 'discovery:inherent-regurgitation';

/** Deposit: Depository search for relevants (after wave 1). */
export const DISCOVERY_SEARCH_DEPOSITORY_FOR_DEPOSIT_RELEVANTS =
  'discovery:search-depository-for-deposit-relevants';

/** Read: Depository search for Need-fits (after wave 1). */
export const DISCOVERY_SEARCH_DEPOSITORY_FOR_READ_NEED_FITS =
  'discovery:search-depository-for-read-need-fits';

/**
 * Register Discovery agents for one product pipeline.
 * Registers wave-1 agents plus the product-specific search agent only.
 */
export function registerDiscoveryAgents(
  agentRegistry: any,
  mode?: 'deposit' | 'read' | string,
): void {
  agentRegistry.registerAgent(DISCOVERY_COMPREHEND_CODEBASE, () =>
    import('../agents/discovery/deposit-codebase-comprehension-agent').then((m) => m.default),
  );
  agentRegistry.registerAgent(DISCOVERY_INHERENT_REGURGITATION, () =>
    import('../agents/discovery/deposit-inherent-regurgitation-agent').then((m) => m.default),
  );

  const isRead = mode === 'read';
  if (isRead) {
    agentRegistry.registerAgent(DISCOVERY_SEARCH_DEPOSITORY_FOR_READ_NEED_FITS, () =>
      import('../agents/discovery/read-depository-search-for-need-fits-agent').then((m) => m.default),
    );
  } else {
    // deposit (default) and any non-read product path
    agentRegistry.registerAgent(DISCOVERY_SEARCH_DEPOSITORY_FOR_DEPOSIT_RELEVANTS, () =>
      import('../agents/discovery/deposit-depository-search-agent').then((m) => m.default),
    );
  }
}

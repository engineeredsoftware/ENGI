/**
 * Discovery phase registration for AssetPack SDIVF pipelines.
 *
 * Product law (deposit and read): parallel three-agent Discovery —
 *   comprehend-codebase | search-depository | inherent-regurgitation
 *
 * The historical five-agent Engi sequence (gather → understand → research →
 * plan → assess) is deleted; it is not registered for any mode.
 */

/**
 * Register product Discovery agents (same roster for deposit and read).
 * Implementation differs by Implementation agents, not Discovery shape.
 */
export function registerDiscoveryAgents(
  agentRegistry: any,
  _mode?: 'deposit' | 'read' | string,
): void {
  agentRegistry.registerAgent('discovery:comprehend-codebase', () =>
    import('../agents/discovery/deposit-codebase-comprehension-agent').then((m) => m.default),
  );
  agentRegistry.registerAgent('discovery:search-depository', () =>
    import('../agents/discovery/deposit-depository-search-agent').then((m) => m.default),
  );
  agentRegistry.registerAgent('discovery:inherent-regurgitation', () =>
    import('../agents/discovery/deposit-inherent-regurgitation-agent').then((m) => m.default),
  );
}

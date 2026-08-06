/**
 * DataPack commodity wire dual-compat (AssetPack → DataPack migration).
 *
 * dual-compat: readers accept both legacy AssetPack wire ids and canon
 * DataPack ids; writers still emit legacy until the write cutover (HTTP/DB
 * dual PRs). Short UI form "Packs" and `/api/packs/*` stay intentionally.
 *
 * Law: `.docs/BITCODE_SOURCE_LAYOUT.md` §2.2 dual-compat migration.
 * Frozen SQL migrations and on-chain Solidity ABIs are out of scope here.
 */

/** One dual-compat wire id family: legacy (persisted) + canon (target write). */
export interface DataPackWireIdPair {
  /** Canon DataPack wire id (write target after cutover). */
  readonly canon: string;
  /** Legacy AssetPack wire id (historical rows + current writers). */
  readonly legacy: string;
}

/**
 * Activity / packActivityType / activityType families stored on executions
 * and filtered on /exchange.
 */
export const DATA_PACK_ACTIVITY_WIRE = {
  depository: {
    canon: 'depository-datapack',
    legacy: 'depository-assetpack',
  },
  settled: {
    canon: 'settled-datapack',
    legacy: 'settled-assetpack',
  },
  needFitSynthesized: {
    canon: 'need-fit-datapack-synthesized',
    legacy: 'need-fit-assetpack-synthesized',
  },
  needFitQuoted: {
    canon: 'need-fit-datapack-quoted',
    legacy: 'need-fit-assetpack-quoted',
  },
  depositoryAdmitted: {
    canon: 'depository-datapack-admitted',
    legacy: 'depository-assetpack-admitted',
  },
} as const satisfies Record<string, DataPackWireIdPair>;

/** Synthetic ownership filter query params (My DataPacks lenses). */
export const DATA_PACK_OWNERSHIP_FILTER_WIRE = {
  myPacks: {
    canon: 'my-datapacks',
    legacy: 'my-assetpacks',
  },
} as const satisfies Record<string, DataPackWireIdPair>;

/** Host / sandbox pipeline mode. */
export const DATA_PACK_HOST_MODE_WIRE = {
  pipeline: {
    canon: 'data_pack_pipeline',
    legacy: 'asset_pack_pipeline',
  },
} as const satisfies Record<string, DataPackWireIdPair>;

/** executions.type default for commodity pipelines. */
export const DATA_PACK_EXECUTION_TYPE_WIRE = {
  agentic: {
    canon: 'agentic-execution:data-pack',
    legacy: 'agentic-execution:asset-pack',
  },
} as const satisfies Record<string, DataPackWireIdPair>;

/** Read UX step ids (session contract). */
export const DATA_PACK_READ_STEP_WIRE = {
  reviewSynthesized: {
    canon: 'review-synthesized-data-pack',
    legacy: 'review-synthesized-asset-pack',
  },
  buySettle: {
    canon: 'buy-data-pack-settle',
    legacy: 'buy-asset-pack-settle',
  },
} as const satisfies Record<string, DataPackWireIdPair>;

/** Env prefix dual-compat (host allowlists accept both). */
export const DATA_PACK_ENV_PREFIX = {
  canon: 'BITCODE_DATA_PACK_',
  legacy: 'BITCODE_ASSET_PACK_',
} as const;

/**
 * Whether `value` matches a wire pair (legacy or canon), case-sensitive
 * on the stored form; empty/null is never a match.
 */
export function matchesDataPackWireId(
  value: string | null | undefined,
  pair: DataPackWireIdPair,
): boolean {
  if (value == null || value === '') return false;
  return value === pair.legacy || value === pair.canon;
}

/**
 * All wire id strings for a pair (legacy first — current writers).
 * Use for PostgREST `.in.(…)` / dual filters.
 */
export function dataPackWireIdAlternates(pair: DataPackWireIdPair): readonly [string, string] {
  return [pair.legacy, pair.canon];
}

/**
 * Normalize a dual-compat activity type to the **legacy** PackActivityType
 * surface used by current product code until the symbol rename cutover.
 * Unknown values pass through unchanged.
 */
export function normalizeDataPackActivityTypeToLegacy(
  value: string | null | undefined,
): string {
  const raw = String(value || '').trim();
  if (!raw) return raw;
  for (const pair of Object.values(DATA_PACK_ACTIVITY_WIRE)) {
    if (raw === pair.canon || raw === pair.legacy) return pair.legacy;
  }
  return raw;
}

/**
 * Normalize dual-compat activity type to the **canon** DataPack wire id.
 * Unknown values pass through unchanged.
 */
export function normalizeDataPackActivityTypeToCanon(
  value: string | null | undefined,
): string {
  const raw = String(value || '').trim();
  if (!raw) return raw;
  for (const pair of Object.values(DATA_PACK_ACTIVITY_WIRE)) {
    if (raw === pair.canon || raw === pair.legacy) return pair.canon;
  }
  return raw;
}

/** True when value is a depository commodity activity type (either wire form). */
export function isDepositoryDataPackActivityType(
  value: string | null | undefined,
): boolean {
  return matchesDataPackWireId(value, DATA_PACK_ACTIVITY_WIRE.depository);
}

/** True when value is a settled commodity activity type (either wire form). */
export function isSettledDataPackActivityType(
  value: string | null | undefined,
): boolean {
  return matchesDataPackWireId(value, DATA_PACK_ACTIVITY_WIRE.settled);
}

/** True when filter is the My DataPacks ownership lens (either wire form). */
export function isMyDataPacksOwnershipFilter(
  value: string | null | undefined,
): boolean {
  return matchesDataPackWireId(value, DATA_PACK_OWNERSHIP_FILTER_WIRE.myPacks);
}

/**
 * Expand a type filter query param into the dual-compat set used for matching
 * stored activity types. Unknown filters return `[value]` only.
 */
export function expandDataPackTypeFilterAlternates(
  filter: string | null | undefined,
): string[] {
  const raw = String(filter || '').trim();
  if (!raw || raw === 'all') return raw ? [raw] : [];
  for (const pair of Object.values(DATA_PACK_ACTIVITY_WIRE)) {
    if (raw === pair.legacy || raw === pair.canon) {
      return [...dataPackWireIdAlternates(pair)];
    }
  }
  if (matchesDataPackWireId(raw, DATA_PACK_OWNERSHIP_FILTER_WIRE.myPacks)) {
    return [...dataPackWireIdAlternates(DATA_PACK_OWNERSHIP_FILTER_WIRE.myPacks)];
  }
  return [raw];
}

/**
 * PostgREST `or` fragment for `type.eq.*` dual-read on executions.type
 * or context activity fields. Returns comma-joined `type.eq.x,type.eq.y`.
 */
export function postgrestTypeEqAlternates(pair: DataPackWireIdPair): string {
  return dataPackWireIdAlternates(pair)
    .map((id) => `type.eq.${id}`)
    .join(',');
}

/**
 * Whether host mode is the commodity pipeline (legacy or canon).
 */
export function isDataPackPipelineHostMode(
  value: string | null | undefined,
): boolean {
  return matchesDataPackWireId(value, DATA_PACK_HOST_MODE_WIRE.pipeline);
}

/**
 * Map `BITCODE_DATA_PACK_*` env key to legacy `BITCODE_ASSET_PACK_*` key
 * (and identity for already-legacy keys). Used by host allowlist dual-read.
 */
export function legacyDataPackEnvKey(key: string): string {
  if (key.startsWith(DATA_PACK_ENV_PREFIX.canon)) {
    return `${DATA_PACK_ENV_PREFIX.legacy}${key.slice(DATA_PACK_ENV_PREFIX.canon.length)}`;
  }
  return key;
}

/**
 * Map legacy env key to canon `BITCODE_DATA_PACK_*` form.
 */
export function canonDataPackEnvKey(key: string): string {
  if (key.startsWith(DATA_PACK_ENV_PREFIX.legacy)) {
    return `${DATA_PACK_ENV_PREFIX.canon}${key.slice(DATA_PACK_ENV_PREFIX.legacy.length)}`;
  }
  return key;
}

/**
 * Read process env with dual-compat: prefer canon key, fall back to legacy.
 */
export function readDataPackEnv(
  env: NodeJS.ProcessEnv | Record<string, string | undefined>,
  /** Suffix after BITCODE_{DATA|ASSET}_PACK_ (e.g. REAL_INFERENCE). */
  suffix: string,
): string | undefined {
  const canonKey = `${DATA_PACK_ENV_PREFIX.canon}${suffix}`;
  const legacyKey = `${DATA_PACK_ENV_PREFIX.legacy}${suffix}`;
  const canon = env[canonKey];
  if (canon != null && String(canon).length > 0) return String(canon);
  const legacy = env[legacyKey];
  if (legacy != null && String(legacy).length > 0) return String(legacy);
  return undefined;
}

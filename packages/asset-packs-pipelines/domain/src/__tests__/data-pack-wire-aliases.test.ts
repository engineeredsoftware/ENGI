/**
 * Core dual-compat contracts for AssetPack → DataPack wire ids.
 * dual-compat: readers accept both; normalize maps to legacy until cutover.
 */

import {
  DATA_PACK_ACTIVITY_WIRE,
  DATA_PACK_ENV_PREFIX,
  DATA_PACK_HOST_MODE_WIRE,
  DATA_PACK_OWNERSHIP_FILTER_WIRE,
  canonDataPackEnvKey,
  dataPackWireIdAlternates,
  expandDataPackTypeFilterAlternates,
  isDepositoryDataPackActivityType,
  isMyDataPacksOwnershipFilter,
  isSettledDataPackActivityType,
  legacyDataPackEnvKey,
  matchesDataPackWireId,
  normalizeDataPackActivityTypeToCanon,
  normalizeDataPackActivityTypeToLegacy,
  postgrestTypeEqAlternates,
  readDataPackEnv,
} from '../data-pack-wire-aliases';

describe('data-pack-wire-aliases (core dual-compat)', () => {
  it('matches both legacy and canon activity wire ids', () => {
    expect(
      matchesDataPackWireId('depository-assetpack', DATA_PACK_ACTIVITY_WIRE.depository),
    ).toBe(true);
    expect(
      matchesDataPackWireId('depository-datapack', DATA_PACK_ACTIVITY_WIRE.depository),
    ).toBe(true);
    expect(
      matchesDataPackWireId('settled-assetpack', DATA_PACK_ACTIVITY_WIRE.settled),
    ).toBe(true);
    expect(
      matchesDataPackWireId('settled-datapack', DATA_PACK_ACTIVITY_WIRE.settled),
    ).toBe(true);
    expect(
      matchesDataPackWireId('deposit-option', DATA_PACK_ACTIVITY_WIRE.settled),
    ).toBe(false);
  });

  it('normalizes dual activity types to legacy PackActivityType surface', () => {
    expect(normalizeDataPackActivityTypeToLegacy('depository-datapack')).toBe(
      'depository-assetpack',
    );
    expect(normalizeDataPackActivityTypeToLegacy('settled-datapack')).toBe(
      'settled-assetpack',
    );
    expect(normalizeDataPackActivityTypeToLegacy('depository-assetpack')).toBe(
      'depository-assetpack',
    );
    expect(normalizeDataPackActivityTypeToLegacy('deposit-option')).toBe(
      'deposit-option',
    );
  });

  it('normalizes dual activity types to canon DataPack surface', () => {
    expect(normalizeDataPackActivityTypeToCanon('depository-assetpack')).toBe(
      'depository-datapack',
    );
    expect(normalizeDataPackActivityTypeToCanon('settled-assetpack')).toBe(
      'settled-datapack',
    );
  });

  it('exposes depository / settled / my-packs helpers', () => {
    expect(isDepositoryDataPackActivityType('depository-datapack')).toBe(true);
    expect(isSettledDataPackActivityType('settled-datapack')).toBe(true);
    expect(isMyDataPacksOwnershipFilter('my-datapacks')).toBe(true);
    expect(isMyDataPacksOwnershipFilter('my-assetpacks')).toBe(true);
    expect(isMyDataPacksOwnershipFilter('my-read-bought')).toBe(false);
  });

  it('expands type filters to dual-compat alternates', () => {
    expect(expandDataPackTypeFilterAlternates('settled-datapack')).toEqual([
      'settled-assetpack',
      'settled-datapack',
    ]);
    expect(expandDataPackTypeFilterAlternates('depository-assetpack')).toEqual([
      'depository-assetpack',
      'depository-datapack',
    ]);
    expect(expandDataPackTypeFilterAlternates('my-datapacks')).toEqual([
      DATA_PACK_OWNERSHIP_FILTER_WIRE.myPacks.legacy,
      DATA_PACK_OWNERSHIP_FILTER_WIRE.myPacks.canon,
    ]);
    expect(expandDataPackTypeFilterAlternates('deposit-option')).toEqual([
      'deposit-option',
    ]);
  });

  it('builds PostgREST type.eq dual fragments', () => {
    expect(postgrestTypeEqAlternates(DATA_PACK_ACTIVITY_WIRE.settled)).toBe(
      'type.eq.settled-assetpack,type.eq.settled-datapack',
    );
  });

  it('maps env prefixes both directions and dual-reads process env', () => {
    expect(legacyDataPackEnvKey('BITCODE_DATA_PACK_REAL_INFERENCE')).toBe(
      'BITCODE_ASSET_PACK_REAL_INFERENCE',
    );
    expect(canonDataPackEnvKey('BITCODE_ASSET_PACK_REAL_INFERENCE')).toBe(
      'BITCODE_DATA_PACK_REAL_INFERENCE',
    );
    expect(DATA_PACK_ENV_PREFIX.canon).toBe('BITCODE_DATA_PACK_');
    expect(DATA_PACK_ENV_PREFIX.legacy).toBe('BITCODE_ASSET_PACK_');

    expect(
      readDataPackEnv({ BITCODE_DATA_PACK_REAL_INFERENCE: '1' }, 'REAL_INFERENCE'),
    ).toBe('1');
    expect(
      readDataPackEnv({ BITCODE_ASSET_PACK_REAL_INFERENCE: '1' }, 'REAL_INFERENCE'),
    ).toBe('1');
    expect(
      readDataPackEnv(
        {
          BITCODE_DATA_PACK_REAL_INFERENCE: 'canon',
          BITCODE_ASSET_PACK_REAL_INFERENCE: 'legacy',
        },
        'REAL_INFERENCE',
      ),
    ).toBe('canon');
  });

  it('lists host mode alternates', () => {
    expect(dataPackWireIdAlternates(DATA_PACK_HOST_MODE_WIRE.pipeline)).toEqual([
      'asset_pack_pipeline',
      'data_pack_pipeline',
    ]);
  });
});

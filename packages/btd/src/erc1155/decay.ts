/**
 * Scarcity decay: Needinesses raw volume → BTD Volume V as residual 21M shrinks.
 *
 * V0: linear decay = remainingMintable / BTD_MAX_SUPPLY
 * V = floor(rawV * decay)
 */

import { BTD_MAX_SUPPLY_BASE_UNITS } from './types';

export interface DecayInput {
  /** Needinesses-only base units before decay. */
  rawVolumeBaseUnits: bigint;
  /** Lifetime minted so far. */
  btdTotalMinted: bigint;
}

export interface DecayResult {
  schema: 'bitcode.settle.btd-decay';
  rawVolumeBaseUnits: bigint;
  btdTotalMinted: bigint;
  remainingMintable: bigint;
  /** ∈ [0, 1] */
  decay: number;
  /** decay * 1e6 for quote audit field */
  decayMicro: number;
  /** Decayed BTD volume (mint notional cap this settle). */
  btdVolume: bigint;
}

/**
 * Linear residual-supply decay.
 * When fully minted, decay = 0 and btdVolume = 0.
 */
export function applyBtdSupplyDecay(input: DecayInput): DecayResult {
  const minted =
    input.btdTotalMinted < 0n
      ? 0n
      : input.btdTotalMinted > BTD_MAX_SUPPLY_BASE_UNITS
        ? BTD_MAX_SUPPLY_BASE_UNITS
        : input.btdTotalMinted;
  const remaining = BTD_MAX_SUPPLY_BASE_UNITS - minted;
  const raw =
    input.rawVolumeBaseUnits < 0n ? 0n : input.rawVolumeBaseUnits;

  // decay as number in [0,1] using micro precision to avoid float blowups.
  const remainingMicro =
    BTD_MAX_SUPPLY_BASE_UNITS === 0n
      ? 0n
      : (remaining * 1_000_000n) / BTD_MAX_SUPPLY_BASE_UNITS;
  const decay = Number(remainingMicro) / 1_000_000;
  const decayMicro = Number(remainingMicro);

  const btdVolume =
    remainingMicro === 0n || raw === 0n
      ? 0n
      : (raw * remainingMicro) / 1_000_000n;

  // Never exceed remaining mintable.
  const capped = btdVolume > remaining ? remaining : btdVolume;

  return {
    schema: 'bitcode.settle.btd-decay',
    rawVolumeBaseUnits: raw,
    btdTotalMinted: minted,
    remainingMintable: remaining,
    decay,
    decayMicro,
    btdVolume: capped,
  };
}

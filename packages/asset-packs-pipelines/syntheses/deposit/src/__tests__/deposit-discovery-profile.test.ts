/**
 * @jest-environment node
 *
 * STAB-C2 product Discovery budget law:
 * - Default **bounded**: codebase PTRR only; skip regurgitation + depository search
 *   so Implementation/Validation/Finish fit host maxDuration.
 * - Opt-in **full**: all three Discovery agents (BITCODE_DEPOSIT_DISCOVERY_PROFILE=full
 *   or BITCODE_DEBUG_FAST_DISCOVERY=0).
 * Host seeds bounded when unset (pipeline-host-command-env).
 */
import { resolveDepositDiscoveryProfile } from '../phases/execution-pipeline-sdivf-execution-phase-discovery-synthesis-deposit-asset-packs';

describe('resolveDepositDiscoveryProfile (STAB-C2)', () => {
  it('defaults to bounded (skip regurgitation + search)', () => {
    const r = resolveDepositDiscoveryProfile({});
    expect(r.profile).toBe('bounded');
    expect(r.skipRegurgitation).toBe(true);
    expect(r.skipSearch).toBe(true);
    expect(r.reason).toMatch(/bounded|Implementation|budget/i);
  });

  it('honors BITCODE_DEPOSIT_DISCOVERY_PROFILE=full', () => {
    const r = resolveDepositDiscoveryProfile({
      BITCODE_DEPOSIT_DISCOVERY_PROFILE: 'full',
    } as NodeJS.ProcessEnv);
    expect(r.profile).toBe('full');
    expect(r.skipRegurgitation).toBe(false);
    expect(r.skipSearch).toBe(false);
    expect(r.reason).toMatch(/full/i);
  });

  it('BITCODE_DEBUG_FAST_DISCOVERY=0 forces full even when profile=bounded', () => {
    const r = resolveDepositDiscoveryProfile({
      BITCODE_DEBUG_FAST_DISCOVERY: '0',
      BITCODE_DEPOSIT_DISCOVERY_PROFILE: 'bounded',
    } as NodeJS.ProcessEnv);
    expect(r.profile).toBe('full');
    expect(r.skipRegurgitation).toBe(false);
    expect(r.skipSearch).toBe(false);
  });

  it('aliases complete|all → full', () => {
    expect(
      resolveDepositDiscoveryProfile({
        BITCODE_DEPOSIT_DISCOVERY_PROFILE: 'complete',
      } as NodeJS.ProcessEnv).profile,
    ).toBe('full');
    expect(
      resolveDepositDiscoveryProfile({
        BITCODE_DEPOSIT_DISCOVERY_PROFILE: 'all',
      } as NodeJS.ProcessEnv).profile,
    ).toBe('full');
  });
});

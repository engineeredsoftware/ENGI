/**
 * @jest-environment node
 *
 * Product Discovery profile: bounded default vs full three-agent Discovery.
 */
import { resolveDepositDiscoveryProfile } from '../phases/execution-pipeline-sdivf-execution-phase-discovery-synthesis-deposit-asset-packs';

describe('resolveDepositDiscoveryProfile', () => {
  it('defaults to bounded (skip regurgitation + search)', () => {
    const r = resolveDepositDiscoveryProfile({});
    expect(r.profile).toBe('bounded');
    expect(r.skipRegurgitation).toBe(true);
    expect(r.skipSearch).toBe(true);
  });

  it('honors BITCODE_DEPOSIT_DISCOVERY_PROFILE=full', () => {
    const r = resolveDepositDiscoveryProfile({
      BITCODE_DEPOSIT_DISCOVERY_PROFILE: 'full',
    } as NodeJS.ProcessEnv);
    expect(r.profile).toBe('full');
    expect(r.skipRegurgitation).toBe(false);
    expect(r.skipSearch).toBe(false);
  });

  it('BITCODE_DEBUG_FAST_DISCOVERY=0 forces full', () => {
    const r = resolveDepositDiscoveryProfile({
      BITCODE_DEBUG_FAST_DISCOVERY: '0',
      BITCODE_DEPOSIT_DISCOVERY_PROFILE: 'bounded',
    } as NodeJS.ProcessEnv);
    expect(r.profile).toBe('full');
    expect(r.skipRegurgitation).toBe(false);
    expect(r.skipSearch).toBe(false);
  });
});

// @ts-nocheck
/**
 * Finish/validation variants under test-mode SDIVF stubs.
 * Success is synthesis completion — not a Finish-opened PR.
 */
import assetPack from '../index';
import { Execution } from '@bitcode/execution-generics';

describe('AssetPack pipeline - Finish and validation variants (test-mode stubs)', () => {
  const base = {
    definitionOfRead: 'Finish feature Z',
    repository: { url: 'https://github.com/acme/repo', branch: 'main' },
    deliveryTarget: 'pr' as const,
  };

  it('finishes successfully with minimal inputs', async () => {
    const res = await assetPack(base, new Execution('finish:minimal'));
    expect(res?.success).toBe(true);
    expect(res?.shippable?.prUrl).toBeUndefined();
  });

  it('finishes with permissive validation (stubbed)', async () => {
    const input = {
      ...base,
      acceptanceCriteria: {
        functionality: 'Works',
        tests: { mustPass: true, coverageMin: 50 },
      },
    };
    const res = await assetPack(input, new Execution('finish:valid'));
    expect(res?.success).toBe(true);
  });

  it('finishes even when validation criteria are weak (enforced by agents in full run)', async () => {
    const input = {
      ...base,
      acceptanceCriteria: {
        functionality: 'Partial',
        tests: { mustPass: false, coverageMin: 0 },
      },
    };
    const res = await assetPack(input, new Execution('finish:weak'));
    expect(res?.success).toBe(true);
  });
});

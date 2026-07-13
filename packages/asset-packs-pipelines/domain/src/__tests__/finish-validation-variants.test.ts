// @ts-nocheck
import assetPack from '../index';
import { Execution } from '@bitcode/execution-generics';

describe('AssetPack pipeline - Finish/Delivering and validation variants (test-mode stubs)', () => {
  const base = {
    definitionOfRead: 'Finish feature Z',
    repository: { url: 'https://github.com/acme/repo', branch: 'main' },
    deliveryTarget: 'pr' as const,
  };

  it('finishes successfully with minimal inputs', async () => {
    const res = await assetPack(base, new Execution('finish:minimal'));
    expect(res?.shippable?.prUrl || res?.deliveryMechanism?.prUrl || '').toContain('/pull/');
  });

  it('finishes with permissive validation (stubbed)', async () => {
    const input = {
      ...base,
      acceptanceCriteria: {
        functionality: 'Works',
        tests: { mustPass: true, coverageMin: 50 },
      }
    };
    const res = await assetPack(input, new Execution('finish:valid'));
    expect(res?.shippable?.prUrl || res?.deliveryMechanism?.prUrl || '').toContain('/pull/');
  });

  it('finishes even when validation criteria are weak (enforced by agents in full run)', async () => {
    const input = {
      ...base,
      acceptanceCriteria: {
        functionality: 'Partial',
        tests: { mustPass: false, coverageMin: 0 },
      }
    };
    const res = await assetPack(input, new Execution('finish:weak'));
    expect(res?.shippable?.prUrl || res?.deliveryMechanism?.prUrl || '').toContain('/pull/');
  });
});

// @ts-nocheck
import assetPack from '../index';
import { Execution } from '@bitcode/execution-generics';

describe('AssetPack pipeline - formal Definition of Read acceptance criteria (pending full SDIVF enablement)', () => {
  const base = {
    definitionOfRead: 'Implement feature Y',
    repository: { url: 'https://github.com/acme/repo', branch: 'main' },
    deliveryTarget: 'pr' as const,
  };

  it('accepts good acceptanceCriteria', async () => {
    const input = {
      ...base,
      acceptanceCriteria: {
        functionality: 'Feature works as described',
        tests: { mustPass: true, coverageMin: 80 },
        documentation: { required: true },
        security: { scanRequired: true, severityThreshold: 'high' }
      }
    };
    const res = await assetPack(input, new Execution('definition-of-read:good'));
    expect(res.success).toBe(true);
    expect(res.shippable.prUrl).toContain('/pull/');
    expect(res.shippables.pullRequest.url).toContain('/pull/');
    expect(res.deliveryMechanism.prUrl).toContain('/pull/');
  });

  it('accepts bad acceptanceCriteria (pipeline still runs; validation agents enforce)', async () => {
    const input = {
      ...base,
      acceptanceCriteria: {
        functionality: 'Partial',
        tests: { mustPass: false, coverageMin: 0 },
        documentation: { required: false },
        security: { scanRequired: false, severityThreshold: 'critical' }
      }
    };
    const res = await assetPack(input, new Execution('definition-of-read:bad'));
    expect(res.success).toBe(true);
    expect(typeof res.summary).toBe('string');
  });
});

import os from 'node:os';
import path from 'node:path';

import { resolveBitcodeAppContextOptions } from '@/lib/bitcode-app-context-options';

describe('resolveBitcodeAppContextOptions', () => {
  it('uses an explicit Bitcode state path when configured', () => {
    expect(
      resolveBitcodeAppContextOptions({
        BITCODE_DATA_PATH: '/tmp/custom-bitcode-state.json',
        VERCEL: '1',
      }),
    ).toEqual({ dataPath: '/tmp/custom-bitcode-state.json' });
  });

  it('keeps the protocol package default outside serverless runtimes', () => {
    expect(resolveBitcodeAppContextOptions({})).toEqual({});
  });

  it('moves mutable Bitcode state to tmp in Vercel/serverless runtimes', () => {
    expect(resolveBitcodeAppContextOptions({ VERCEL: '1' })).toEqual({
      dataPath: path.join(os.tmpdir(), 'bitcode-uapi-state.json'),
    });
  });
});

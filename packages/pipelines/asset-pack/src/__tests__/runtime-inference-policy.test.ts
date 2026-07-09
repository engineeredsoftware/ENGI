import { isAssetPackRealInferenceEnabled } from '../runtime-inference-policy';

describe('AssetPack runtime inference policy', () => {
  it('reports the master real-inference switch as disabled by default', () => {
    expect(isAssetPackRealInferenceEnabled({} as NodeJS.ProcessEnv)).toBe(false);
  });

  it('enables the master real-inference switch through the commercial flag', () => {
    const env = { BITCODE_ASSET_PACK_REAL_INFERENCE: '1' } as NodeJS.ProcessEnv;
    expect(isAssetPackRealInferenceEnabled(env)).toBe(true);
  });

  it('accepts the documented truthy spellings for the master switch', () => {
    for (const value of ['1', 'true', 'yes', 'on', 'TRUE', 'On']) {
      expect(
        isAssetPackRealInferenceEnabled({ BITCODE_ASSET_PACK_REAL_INFERENCE: value } as NodeJS.ProcessEnv)
      ).toBe(true);
    }
    for (const value of ['0', 'false', 'no', 'off', '']) {
      expect(
        isAssetPackRealInferenceEnabled({ BITCODE_ASSET_PACK_REAL_INFERENCE: value } as NodeJS.ProcessEnv)
      ).toBe(false);
    }
  });
});

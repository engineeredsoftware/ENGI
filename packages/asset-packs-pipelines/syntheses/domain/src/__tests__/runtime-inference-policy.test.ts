import { isAssetPackRealInferenceEnabled } from '../runtime-inference-policy';

describe('AssetPack runtime inference policy', () => {
  it('defaults real inference on when the flag is unset (host/Pipeliner owns config)', () => {
    expect(isAssetPackRealInferenceEnabled({} as NodeJS.ProcessEnv)).toBe(true);
  });

  it('keeps real inference on for the commercial truthy flag', () => {
    const env = { BITCODE_ASSET_PACK_REAL_INFERENCE: '1' } as NodeJS.ProcessEnv;
    expect(isAssetPackRealInferenceEnabled(env)).toBe(true);
  });

  it('accepts documented truthy spellings and explicit opt-out spellings', () => {
    for (const value of ['1', 'true', 'yes', 'on', 'TRUE', 'On', '']) {
      expect(
        isAssetPackRealInferenceEnabled({ BITCODE_ASSET_PACK_REAL_INFERENCE: value } as NodeJS.ProcessEnv)
      ).toBe(true);
    }
    for (const value of ['0', 'false', 'no', 'off']) {
      expect(
        isAssetPackRealInferenceEnabled({ BITCODE_ASSET_PACK_REAL_INFERENCE: value } as NodeJS.ProcessEnv)
      ).toBe(false);
    }
  });
});

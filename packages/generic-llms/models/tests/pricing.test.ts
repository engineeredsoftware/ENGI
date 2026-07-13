import { describe, test, expect } from '@jest/globals';
import {
  SUPPORTED_LLM_MODELS,
  getApiIdFromFriendlyId,
  getFriendlyIdFromApiId,
  getUsdPricingForApiModel,
  ProviderId,
} from '../src/pricing';

describe('Model catalog and pricing', () => {
  test('friendly ↔ api id mapping is consistent', () => {
    for (const prov of SUPPORTED_LLM_MODELS) {
      for (const m of prov.models) {
        const api = getApiIdFromFriendlyId(m.id);
        expect(api).toBeDefined();
        expect(api!.provider).toBe(prov.provider);
        expect(api!.apiId).toBe(m.apiId);

        const friendly = getFriendlyIdFromApiId(prov.provider as ProviderId, m.apiId);
        expect(friendly).toBe(m.id);
      }
    }
  });

  test('USD pricing lookup returns values for known models', () => {
    const sample = SUPPORTED_LLM_MODELS.flatMap((p) => p.models).find((m) => m.inputPriceUSDPerMTok && m.outputPriceUSDPerMTok);
    expect(sample).toBeDefined();
    const pricing = getUsdPricingForApiModel(sample!.apiId);
    expect(pricing).toBeDefined();
    expect(pricing!.input).toBeGreaterThan(0);
    expect(pricing!.output).toBeGreaterThan(0);
  });
});


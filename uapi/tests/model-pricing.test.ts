import {
  SUPPORTED_LLM_MODELS,
  DEFAULT_PROVIDER,
  DEFAULT_MODEL_API,
  getUsdPricingForApiModel,
} from '@bitcode/generic-llms-models';

describe('Model catalog and defaults', () => {
  it('default provider/model appear in catalog', () => {
    const providerEntry = SUPPORTED_LLM_MODELS.find(p => p.provider === DEFAULT_PROVIDER);
    expect(providerEntry).toBeDefined();
    const modelEntry = providerEntry?.models.find(m => m.apiId === DEFAULT_MODEL_API);
    expect(modelEntry).toBeDefined();
  });

  it('usd pricing is available for known api model when provided', () => {
    // Pick any model that has USD pricing specified in catalog
    const sample = SUPPORTED_LLM_MODELS.flatMap(p => p.models).find(m => m.inputPriceUSDPerMTok && m.outputPriceUSDPerMTok);
    expect(sample).toBeDefined();
    if (sample) {
      const usd = getUsdPricingForApiModel(sample.apiId);
      expect(usd).toBeDefined();
      expect(usd!.input).toBeGreaterThan(0);
      expect(usd!.output).toBeGreaterThan(0);
    }
  });
});

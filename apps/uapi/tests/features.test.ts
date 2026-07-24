type FeatureFlagOverrides = {
  pipelineDebugWidget?: string;
  bitcodeEnv?: string;
  disableExchangeLink?: string;
  disableExchangeRoute?: string;
  disableConversationsRoute?: string;
  disableAuxillaries?: string;
  disableCreateAccount?: string;
};

function loadFeatureFlags(nodeEnv: string, overrides: FeatureFlagOverrides = {}) {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousDebugWidget = process.env.NEXT_PUBLIC_PIPELINE_DEBUG_WIDGET;
  const previousBitcodeEnv = process.env.NEXT_PUBLIC_BITCODE_ENV;
  const previousDisableExchangeLink = process.env.NEXT_PUBLIC_DISABLE_EXCHANGE_LINK;
  const previousDisableExchangeRoute = process.env.NEXT_PUBLIC_DISABLE_EXCHANGE_ROUTE;
  const previousDisableConversationsRoute = process.env.NEXT_PUBLIC_DISABLE_CONVERSATIONS_ROUTE;
  const previousDisableAuxillaries = process.env.NEXT_PUBLIC_DISABLE_AUXILLARIES;
  const previousDisableCreateAccount = process.env.NEXT_PUBLIC_DISABLE_CREATE_ACCOUNT;

  process.env.NODE_ENV = nodeEnv;
  if (overrides.pipelineDebugWidget === undefined) {
    delete process.env.NEXT_PUBLIC_PIPELINE_DEBUG_WIDGET;
  } else {
    process.env.NEXT_PUBLIC_PIPELINE_DEBUG_WIDGET = overrides.pipelineDebugWidget;
  }
  if (overrides.bitcodeEnv === undefined) delete process.env.NEXT_PUBLIC_BITCODE_ENV;
  else process.env.NEXT_PUBLIC_BITCODE_ENV = overrides.bitcodeEnv;
  if (overrides.disableExchangeLink === undefined) delete process.env.NEXT_PUBLIC_DISABLE_EXCHANGE_LINK;
  else process.env.NEXT_PUBLIC_DISABLE_EXCHANGE_LINK = overrides.disableExchangeLink;
  if (overrides.disableExchangeRoute === undefined) delete process.env.NEXT_PUBLIC_DISABLE_EXCHANGE_ROUTE;
  else process.env.NEXT_PUBLIC_DISABLE_EXCHANGE_ROUTE = overrides.disableExchangeRoute;
  if (overrides.disableConversationsRoute === undefined) delete process.env.NEXT_PUBLIC_DISABLE_CONVERSATIONS_ROUTE;
  else process.env.NEXT_PUBLIC_DISABLE_CONVERSATIONS_ROUTE = overrides.disableConversationsRoute;
  if (overrides.disableAuxillaries === undefined) delete process.env.NEXT_PUBLIC_DISABLE_AUXILLARIES;
  else process.env.NEXT_PUBLIC_DISABLE_AUXILLARIES = overrides.disableAuxillaries;
  if (overrides.disableCreateAccount === undefined) delete process.env.NEXT_PUBLIC_DISABLE_CREATE_ACCOUNT;
  else process.env.NEXT_PUBLIC_DISABLE_CREATE_ACCOUNT = overrides.disableCreateAccount;

  let featureFlags: typeof import('@/config/features').FEATURE_FLAGS | null = null;
  jest.isolateModules(() => {
    featureFlags = require('@/config/features').FEATURE_FLAGS;
  });

  process.env.NODE_ENV = previousNodeEnv;
  if (previousDebugWidget === undefined) {
    delete process.env.NEXT_PUBLIC_PIPELINE_DEBUG_WIDGET;
  } else {
    process.env.NEXT_PUBLIC_PIPELINE_DEBUG_WIDGET = previousDebugWidget;
  }
  if (previousBitcodeEnv === undefined) delete process.env.NEXT_PUBLIC_BITCODE_ENV;
  else process.env.NEXT_PUBLIC_BITCODE_ENV = previousBitcodeEnv;
  if (previousDisableExchangeLink === undefined) delete process.env.NEXT_PUBLIC_DISABLE_EXCHANGE_LINK;
  else process.env.NEXT_PUBLIC_DISABLE_EXCHANGE_LINK = previousDisableExchangeLink;
  if (previousDisableExchangeRoute === undefined) delete process.env.NEXT_PUBLIC_DISABLE_EXCHANGE_ROUTE;
  else process.env.NEXT_PUBLIC_DISABLE_EXCHANGE_ROUTE = previousDisableExchangeRoute;
  if (previousDisableConversationsRoute === undefined) delete process.env.NEXT_PUBLIC_DISABLE_CONVERSATIONS_ROUTE;
  else process.env.NEXT_PUBLIC_DISABLE_CONVERSATIONS_ROUTE = previousDisableConversationsRoute;
  if (previousDisableAuxillaries === undefined) delete process.env.NEXT_PUBLIC_DISABLE_AUXILLARIES;
  else process.env.NEXT_PUBLIC_DISABLE_AUXILLARIES = previousDisableAuxillaries;
  if (previousDisableCreateAccount === undefined) delete process.env.NEXT_PUBLIC_DISABLE_CREATE_ACCOUNT;
  else process.env.NEXT_PUBLIC_DISABLE_CREATE_ACCOUNT = previousDisableCreateAccount;

  return featureFlags;
}

describe('FEATURE_FLAGS', () => {
  it('defaults the product debug widget on locally and off in production', () => {
    expect(loadFeatureFlags('development')?.PIPELINE_DEBUG_WIDGET).toBe(true);
    expect(loadFeatureFlags('production')?.PIPELINE_DEBUG_WIDGET).toBe(false);
  });

  it('lets NEXT_PUBLIC_PIPELINE_DEBUG_WIDGET override the environment default', () => {
    expect(loadFeatureFlags('production', { pipelineDebugWidget: 'true' })?.PIPELINE_DEBUG_WIDGET).toBe(true);
    expect(loadFeatureFlags('development', { pipelineDebugWidget: 'false' })?.PIPELINE_DEBUG_WIDGET).toBe(false);
  });

  it('keeps Exchange open by default in every environment (live product surface)', () => {
    expect(loadFeatureFlags('development')?.DISABLE_EXCHANGE_LINK).toBe(false);
    expect(loadFeatureFlags('development')?.DISABLE_EXCHANGE_ROUTE).toBe(false);
    expect(loadFeatureFlags('production')?.DISABLE_EXCHANGE_LINK).toBe(false);
    expect(loadFeatureFlags('production')?.DISABLE_EXCHANGE_ROUTE).toBe(false);
    expect(loadFeatureFlags('production', { bitcodeEnv: 'testnet' })?.DISABLE_EXCHANGE_LINK).toBe(false);
    expect(loadFeatureFlags('production', { bitcodeEnv: 'testnet' })?.DISABLE_EXCHANGE_ROUTE).toBe(false);

    expect(loadFeatureFlags('development')?.DISABLE_CONVERSATIONS_ROUTE).toBe(false);
    expect(loadFeatureFlags('development')?.DISABLE_AUXILLARIES).toBe(false);
    expect(loadFeatureFlags('development')?.DISABLE_CREATE_ACCOUNT).toBe(false);
  });

  it('keeps auxillaries/create-account launch-gated in production; Exchange stays open unless opted out', () => {
    expect(loadFeatureFlags('production')?.DISABLE_AUXILLARIES).toBe(true);
    expect(loadFeatureFlags('production')?.DISABLE_CREATE_ACCOUNT).toBe(true);
    expect(loadFeatureFlags('production')?.DISABLE_EXCHANGE_LINK).toBe(false);
    expect(loadFeatureFlags('production')?.DISABLE_EXCHANGE_ROUTE).toBe(false);

    expect(loadFeatureFlags('production', { disableExchangeLink: 'true' })?.DISABLE_EXCHANGE_LINK).toBe(true);
    expect(loadFeatureFlags('production', { disableExchangeRoute: 'true' })?.DISABLE_EXCHANGE_ROUTE).toBe(true);
    expect(loadFeatureFlags('development', { disableConversationsRoute: 'true' })?.DISABLE_CONVERSATIONS_ROUTE).toBe(true);
  });

  it('uses the conversations route disable as a hard-disable for conversation widgets', () => {
    const flags = loadFeatureFlags('production', {
      disableConversationsRoute: 'true',
    });

    expect(flags?.DISABLE_CONVERSATIONS_ROUTE).toBe(true);
    expect(flags?.CONVERSATIONS_WIDGET).toBe(false);
  });
});

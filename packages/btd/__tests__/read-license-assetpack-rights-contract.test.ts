import {
  buildBtdAssetPackRightsInterfaceContract,
  buildBtdReadLicenseAssetPackRightsInterfaceFixtures,
  buildBtdReadLicenseAssetPackRightsInterfaceRegistry,
  buildBtdReadLicenseInterfaceContract,
  getBtdReadLicenseAssetPackRightsInterfaceFixture,
} from '../src/read-license-assetpack-rights-contract';

describe('ReadLicense and AssetPackRights interface contracts', () => {
  it('publishes shared fixtures across API, MCP, ChatGPT App, and product', () => {
    const registry = buildBtdReadLicenseAssetPackRightsInterfaceRegistry();

    expect(registry.observedSurfaces).toEqual(['api', 'chatgpt_app', 'mcp', 'product']);
    expect(registry.missingSurfaces).toEqual([]);
    expect(registry.readLicenseContracts).toHaveLength(4);
    expect(registry.assetPackRightsContracts).toHaveLength(4);
    expect(registry.registryRoot).toMatch(/^read-license-assetpack-rights-interface-registry:/);
  });

  it('admits source-safe preview before settlement without protected source visibility', () => {
    const fixture = getBtdReadLicenseAssetPackRightsInterfaceFixture(
      'api-read-license-source-safe-preview',
    );
    const readLicense = buildBtdReadLicenseInterfaceContract(fixture.readLicenseInput);
    const rights = buildBtdAssetPackRightsInterfaceContract(fixture.assetPackRightsInput);

    expect(readLicense).toMatchObject({
      decision: 'source_safe_preview_admitted',
      licensePosture: 'preview_only_not_required',
      protectedSourceVisible: false,
    });
    expect(rights).toMatchObject({
      decision: 'preview_admitted',
      rightsPosture: 'preview_only_locked',
      protectedSourceVisible: false,
    });
    expect(rights.feeQuoteRoot).toBe('fee-quote-root-api-read-license-source-safe-preview');
  });

  it('denies locked AssetPack delivery when license, settlement, and rights transfer are missing', () => {
    const fixture = getBtdReadLicenseAssetPackRightsInterfaceFixture(
      'chatgpt-unpaid-delivery-denied',
    );
    const readLicense = buildBtdReadLicenseInterfaceContract(fixture.readLicenseInput);
    const rights = buildBtdAssetPackRightsInterfaceContract(fixture.assetPackRightsInput);

    expect(readLicense.decision).toBe('locked_source_denied');
    expect(readLicense.denialCodes).toContain('INTERFACE_AUTHORIZATION_DENIED');
    expect(rights.decision).toBe('rights_delivery_denied');
    expect(rights.denialCodes).toEqual(
      expect.arrayContaining([
        'INTERFACE_AUTHORIZATION_DENIED',
        'SETTLEMENT_REQUIRED',
        'READ_LICENSE_REQUIRED',
        'RIGHTS_TRANSFER_REQUIRED',
        'DELIVERY_ADMISSION_REQUIRED',
        'LOCKED_SOURCE_UNPAID',
      ]),
    );
    expect(rights.protectedSourceVisible).toBe(false);
  });

  it('admits paid delivery only after confirmed BTC finality and rights transfer', () => {
    const fixture = getBtdReadLicenseAssetPackRightsInterfaceFixture(
      'product-paid-rights-delivery',
    );
    const readLicense = buildBtdReadLicenseInterfaceContract(fixture.readLicenseInput);
    const rights = buildBtdAssetPackRightsInterfaceContract(fixture.assetPackRightsInput);

    expect(readLicense).toMatchObject({
      decision: 'paid_unlock_admitted',
      licensePosture: 'licensed_read',
      protectedSourceVisible: true,
    });
    expect(rights).toMatchObject({
      decision: 'rights_delivery_admitted',
      rightsPosture: 'rights_transferred',
      btcSettlementFinality: 'confirmed',
      deliveryAdmissionState: 'admitted',
      protectedSourceVisible: true,
    });
    expect(rights.rightsTransferReceiptRoot).toMatch(/^btd-rights-transfer-receipt-root_/);
  });

  it('fails closed when required surface fixtures are missing', () => {
    const fixtures = buildBtdReadLicenseAssetPackRightsInterfaceFixtures().filter(
      (fixture) => fixture.interfaceSurface !== 'product',
    );

    expect(() =>
      buildBtdReadLicenseAssetPackRightsInterfaceRegistry({ fixtures }),
    ).toThrow(/missing surfaces: product/);
  });

  it('rejects secret-shaped fixture strings', () => {
    const fixture = getBtdReadLicenseAssetPackRightsInterfaceFixture(
      'mcp-finding-fits-source-safe-preview',
    );

    expect(() =>
      buildBtdReadLicenseInterfaceContract({
        ...fixture.readLicenseInput,
        contractId: ['sk', 'proj', 'thisShouldNeverBeSerialized123456'].join('-'),
      }),
    ).toThrow(/must not contain secrets or protected source/);
  });

  it('rejects paid delivery contracts without rights transfer receipt', () => {
    const fixture = getBtdReadLicenseAssetPackRightsInterfaceFixture(
      'product-paid-rights-delivery',
    );
    const rights = buildBtdAssetPackRightsInterfaceContract({
      ...fixture.assetPackRightsInput,
      rightsTransferReceipt: null,
    });

    expect(rights.decision).toBe('rights_delivery_denied');
    expect(rights.denialCodes).toEqual(
      expect.arrayContaining(['RIGHTS_TRANSFER_REQUIRED', 'LOCKED_SOURCE_UNPAID']),
    );
    expect(rights.protectedSourceVisible).toBe(false);
  });
});

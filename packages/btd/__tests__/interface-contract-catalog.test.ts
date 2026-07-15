import {
  BTD_INTERFACE_CONTRACT_CATALOG_DEFERRED_INTERFACE_IDS,
  BTD_INTERFACE_CONTRACT_CATALOG_INTERFACE_IDS,
  BTD_INTERFACE_CONTRACT_CATALOG_REQUIRED_ROW_FIELDS,
  buildBtdInterfaceContractCatalog,
  buildBtdInterfaceContractCatalogRow,
  buildBtdInterfaceContractCatalogRows,
} from '../src/interface-contract-catalog';

describe('interface contract catalog', () => {
  it('catalogs product handoff, public API, MCP API, ChatGPT App, package consumers, and deferred hooks', () => {
    const catalog = buildBtdInterfaceContractCatalog();

    expect(catalog.kind).toBe('btd.interface_contract_catalog');
    expect(catalog.schemaId).toBe('bitcode.interfaceContractCatalog.v1');
    expect(catalog.rowCount).toBe(7);
    expect(catalog.activeContractCount).toBe(5);
    expect(catalog.deferredBlockedCount).toBe(2);
    expect(catalog.missingInterfaceIds).toEqual([]);
    expect(catalog.observedInterfaceIds).toEqual([...BTD_INTERFACE_CONTRACT_CATALOG_INTERFACE_IDS].sort());
    expect(catalog.rows.map((row) => row.interfaceId)).toEqual([
      'product_handoff',
      'public_api',
      'mcp_api',
      'chatgpt_app',
      'package_consumer',
      'exchange_hook',
      'conversations_hook',
    ]);
    expect(catalog.rows.every((row) => row.sourceSafety.sourceSafe)).toBe(true);
    expect(catalog.rows.every((row) => !row.sourceSafety.containsSecret)).toBe(true);
    expect(catalog.rows.every((row) => !row.sourceSafety.containsProtectedSource)).toBe(true);
  });

  it('requires package owners, action ids, schema ids, auth policies, fixtures, validation commands, failure modes, repair posture, and proof hooks', () => {
    const catalog = buildBtdInterfaceContractCatalog();

    for (const row of catalog.rows) {
      for (const field of BTD_INTERFACE_CONTRACT_CATALOG_REQUIRED_ROW_FIELDS) {
        expect(row[field]).toBeTruthy();
      }
      expect(row.rowRoot).toMatch(/^btd-interface-contract-catalog-row:[a-f0-9]{24}$/);
      expect(row.telemetryProofHookId).toMatch(/^interface\.telemetry\./);
    }
    expect(catalog.catalogRoot).toMatch(/^btd-interface-contract-catalog:[a-f0-9]{24}$/);
  });

  it('keeps Exchange and Conversations represented only as deferred blocked rows', () => {
    const catalog = buildBtdInterfaceContractCatalog();
    const deferredRows = catalog.rows.filter((row) => row.status === 'deferred_blocked');

    expect(deferredRows.map((row) => row.interfaceId)).toEqual([
      ...BTD_INTERFACE_CONTRACT_CATALOG_DEFERRED_INTERFACE_IDS,
    ]);
    for (const row of deferredRows) {
      expect(row.bindingKind).toBe('deferred_hook');
      expect(row.authPolicyId).toBe('interface.authorization.deferred-not-admitted');
      expect(row.sourceSafetyClass).toBe('deferred-blocker');
      expect(row.compatibilityStatus).toBe('deferred_not_admitted');
      expect(row.deferredReason).toMatch(/deferred beyond V33 interface cataloging/);
    }
  });

  it('fails closed when a required interface catalog row is missing', () => {
    const rows = buildBtdInterfaceContractCatalogRows().filter(
      (row) => row.interfaceId !== 'mcp_api',
    );

    expect(() => buildBtdInterfaceContractCatalog({ rows })).toThrow(/missing interface ids: mcp_api/);
  });

  it('fails closed when deferred hooks are accidentally admitted as compatible active contracts', () => {
    const rows = buildBtdInterfaceContractCatalogRows().map((row) =>
      row.interfaceId === 'exchange_hook'
        ? {
            ...row,
            status: 'active_contract' as const,
            bindingKind: 'api_route' as const,
            sourceSafetyClass: 'source-safe-internal' as const,
            compatibilityStatus: 'compatible' as const,
          }
        : row,
    );

    expect(() => buildBtdInterfaceContractCatalog({ rows })).toThrow(
      /exchange_hook deferred posture must match its contract status/,
    );
  });

  it('fails closed on duplicate interface ids', () => {
    const rows = buildBtdInterfaceContractCatalogRows();

    expect(() => buildBtdInterfaceContractCatalog({ rows: [...rows, rows[0]] })).toThrow(
      /duplicate interface ids: product_handoff/,
    );
  });

  it('fails closed on secret-shaped or protected-source catalog text', () => {
    const [firstRow] = buildBtdInterfaceContractCatalogRows();

    expect(() =>
      buildBtdInterfaceContractCatalogRow({
        ...firstRow,
        failureMode: 'raw source can be read before settlement',
      }),
    ).toThrow(/must not contain secrets or protected source/);
  });
});

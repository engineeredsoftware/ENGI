import {
  BTD_API_SCHEMA_COMPATIBILITY_CONSUMER_SURFACES,
  BTD_API_SCHEMA_COMPATIBILITY_EXAMPLE_POSTURES,
  buildBtdApiSchemaCompatibilityMatrix,
  buildBtdApiSchemaCompatibilityRow,
  buildBtdApiSchemaCompatibilityRows,
  getBtdApiSchemaCompatibilityRow,
} from '../src/api-schema-compatibility-matrix';

describe('API schema compatibility matrix', () => {
  it('publishes source-safe rows for every required consumer surface and example posture', () => {
    const matrix = buildBtdApiSchemaCompatibilityMatrix();

    expect(matrix.observedConsumerSurfaces).toEqual(
      [...BTD_API_SCHEMA_COMPATIBILITY_CONSUMER_SURFACES].sort(),
    );
    expect(matrix.observedExamplePostures).toEqual(
      [...BTD_API_SCHEMA_COMPATIBILITY_EXAMPLE_POSTURES].sort(),
    );
    expect(matrix.missingConsumerSurfaces).toEqual([]);
    expect(matrix.missingExamplePostures).toEqual([]);
    expect(matrix.versionlessPathDiscipline).toBe('enforced');
    expect(matrix.protectedSourceSerialized).toBe(false);
    expect(matrix.matrixRoot).toMatch(/^api-schema-compatibility-matrix:/);
  });

  it('records package-owned success, denied, blocked, stale, and deferred examples', () => {
    const matrix = buildBtdApiSchemaCompatibilityMatrix();

    expect(matrix.rows.map((row) => row.examplePosture)).toEqual(
      expect.arrayContaining(['success', 'denied', 'blocked', 'stale', 'deferred']),
    );
    expect(getBtdApiSchemaCompatibilityRow('public-api-btd-registry-success')).toMatchObject({
      consumerSurface: 'public_api',
      routeId: 'api.btd.registry.snapshot',
      compatibilityStatus: 'compatible',
      examplePosture: 'success',
      protectedSourceVisible: false,
    });
    expect(getBtdApiSchemaCompatibilityRow('package-consumer-exchange-hook-deferred')).toMatchObject({
      consumerSurface: 'package_consumer',
      compatibilityStatus: 'deferred_not_admitted',
      breakingChangePolicy: 'deferred_until_gate',
      examplePosture: 'deferred',
    });
  });

  it('enforces versionless paths and gate-neutral source identifiers', () => {
    const row = buildBtdApiSchemaCompatibilityRows()[0];

    expect(() =>
      buildBtdApiSchemaCompatibilityRow({
        ...row,
        path: '/api/v1/btd/registry',
      }),
    ).toThrow(/versionless/);

    expect(() =>
      buildBtdApiSchemaCompatibilityRow({
        ...row,
        path: '/api/gate-7/btd/registry',
      }),
    ).toThrow(/versionless/);
  });

  it('fails closed when required example postures are missing', () => {
    const rows = buildBtdApiSchemaCompatibilityRows().map((row) =>
      row.examplePosture === 'deferred'
        ? {
            ...row,
            examplePosture: 'success' as const,
            compatibilityStatus: 'compatible' as const,
            breakingChangePolicy: 'additive_only' as const,
            deferredReason: undefined,
          }
        : row,
    );

    expect(() => buildBtdApiSchemaCompatibilityMatrix({ rows })).toThrow(
      /missing example postures: deferred/,
    );
  });

  it('fails closed when required consumer surfaces are missing', () => {
    const rows = buildBtdApiSchemaCompatibilityRows().filter(
      (row) => row.consumerSurface !== 'product_handoff',
    );

    expect(() => buildBtdApiSchemaCompatibilityMatrix({ rows })).toThrow(
      /missing consumer surfaces: product_handoff/,
    );
  });

  it('rejects secret-shaped examples and protected source visibility', () => {
    const row = buildBtdApiSchemaCompatibilityRows()[0];

    expect(() =>
      buildBtdApiSchemaCompatibilityRow({
        ...row,
        protectedSourceVisible: true,
      }),
    ).toThrow(/must not expose protected source/);

    expect(() =>
      buildBtdApiSchemaCompatibilityRow({
        ...row,
        example: {
          ...row.example,
          response: {
            ...row.example.response,
            token: ['sk', 'proj', 'thisShouldNeverBeSerialized123456'].join('-'),
          },
        },
      }),
    ).toThrow(/must not contain secrets or protected source/);
  });
});

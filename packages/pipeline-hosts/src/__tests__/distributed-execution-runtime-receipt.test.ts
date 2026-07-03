import {
  DISTRIBUTED_EXECUTION_RUNTIME_WORK_KINDS,
  buildDistributedExecutionRuntimeReceipt,
  buildDistributedExecutionRuntimeReceiptCatalog,
  buildDistributedExecutionRuntimeReceiptFixtures,
} from '../distributed-execution-runtime-receipt';

const OPENAI_SECRET_PREFIX = `${['sk', 'proj'].join('-')}-`;

describe('distributed execution runtime receipts', () => {
  it('catalogs pipeline runs, PTRR agents, ThinkingsGenerations, tool calls, ledger operations, wallet operations, proof generation, object-storage writes, and repair jobs', () => {
    const catalog = buildDistributedExecutionRuntimeReceiptCatalog();

    expect(catalog.kind).toBe('bitcode.distributed_execution_runtime_receipt_catalog');
    expect(catalog.schemaId).toBe('bitcode.distributedExecutionRuntimeReceiptCatalog.v1');
    expect(catalog.requiredWorkKinds).toEqual([...DISTRIBUTED_EXECUTION_RUNTIME_WORK_KINDS]);
    expect(catalog.observedWorkKinds).toEqual([...DISTRIBUTED_EXECUTION_RUNTIME_WORK_KINDS].sort());
    expect(catalog.missingWorkKinds).toEqual([]);
    expect(catalog.receiptCount).toBe(DISTRIBUTED_EXECUTION_RUNTIME_WORK_KINDS.length);
    expect(catalog.requestResponseCompletionRequired).toBe(false);
    expect(catalog.credentialsSerialized).toBe(false);
    expect(catalog.protectedSourceVisible).toBe(false);
    expect(catalog.sourceSafety.sourceSafe).toBe(true);
  });

  it('keeps long-running runtime work detached from request/response route handler completion', () => {
    const catalog = buildDistributedExecutionRuntimeReceiptCatalog();

    expect(catalog.receipts.every((receipt) => receipt.routeHandlerBoundary)).toBe(true);
    expect(
      catalog.receipts.every(
        (receipt) => receipt.routeHandlerBoundary === 'request_response_not_required',
      ),
    ).toBe(true);
  });

  it('covers required roots for pipeline, tool, ledger, wallet, proof, storage, and repair receipts', () => {
    const catalog = buildDistributedExecutionRuntimeReceiptCatalog();
    const byKind = Object.fromEntries(
      catalog.receipts.map((receipt) => [receipt.workKind, receipt]),
    );

    for (const receipt of catalog.receipts) {
      expect(receipt.inputRoot).toMatch(/^sha256:/);
      expect(receipt.outputRoot).toMatch(/^sha256:/);
      expect(receipt.logRoot).toMatch(/^sha256:/);
      expect(receipt.databaseProjectionRoot).toMatch(/^sha256:/);
      expect(receipt.repairPosture).toBeTruthy();
      expect(receipt.receiptRoot).toMatch(/^distributed-execution-runtime-receipt:/);
      expect(JSON.stringify(receipt)).not.toContain(OPENAI_SECRET_PREFIX);
      expect(JSON.stringify(receipt)).not.toContain('raw source');
    }

    expect(byKind.pipeline_run.objectStorageRoot).toMatch(/^sha256:/);
    expect(byKind.pipeline_run.ledgerProjectionRoot).toMatch(/^sha256:/);
    expect(byKind.pipeline_run.proofRoot).toMatch(/^sha256:/);
    expect(byKind.ptrr_agent.agentId).toBe('ReadFitsFindingSynthesisDiscoveryAgent');
    expect(byKind.ptrr_agent.ptrrStep).toBe('plan');
    expect(byKind.thinkings_generation.agentId).toBe(
      'ReadFitsFindingSynthesisDiscoveryAgent',
    );
    expect(byKind.thinkings_generation.ptrrStep).toBe('plan');
    expect(byKind.thinkings_generation.thinkingsGenerationStep).toBe('reason');
    expect(byKind.tool_call.toolId).toBe('AssetPackLexicalDepositorySearchTool');
    expect(byKind.ledger_operation.ledgerProjectionRoot).toMatch(/^sha256:/);
    expect(byKind.wallet_operation.walletOperationRoot).toMatch(/^sha256:/);
    expect(byKind.proof_generation.proofRoot).toMatch(/^sha256:/);
    expect(byKind.object_storage_write.objectStorageRoot).toMatch(/^sha256:/);
    expect(byKind.repair_job.status).toBe('repaired');
    expect(byKind.repair_job.ledgerProjectionRoot).toMatch(/^sha256:/);
  });

  it('allows only short local blocking route handler work', () => {
    const [fixture] = buildDistributedExecutionRuntimeReceiptFixtures();

    expect(() =>
      buildDistributedExecutionRuntimeReceipt({
        ...fixture,
        laneId: 'local',
        workKind: 'tool_call',
        routeHandlerBoundary: 'blocking_allowed_for_short_local_work',
        toolId: 'LocalSmokeTool',
      }),
    ).not.toThrow();

    expect(() =>
      buildDistributedExecutionRuntimeReceipt({
        ...fixture,
        routeHandlerBoundary: 'blocking_allowed_for_short_local_work',
      }),
    ).toThrow(/only allowed for short local work/);
  });

  it('fails closed when a work kind is missing from the catalog', () => {
    const receipts = buildDistributedExecutionRuntimeReceiptFixtures().filter(
      (receipt) => receipt.workKind !== 'wallet_operation',
    );

    expect(() => buildDistributedExecutionRuntimeReceiptCatalog({ receipts })).toThrow(
      /missing work kinds: wallet_operation/,
    );
  });

  it('fails closed when successful runtime receipts omit output roots', () => {
    const [fixture] = buildDistributedExecutionRuntimeReceiptFixtures();

    expect(() =>
      buildDistributedExecutionRuntimeReceipt({
        ...fixture,
        outputRoot: undefined,
      }),
    ).toThrow(/require outputRoot/);
  });

  it('fails closed when terminal runtime receipts omit completedAt', () => {
    const [fixture] = buildDistributedExecutionRuntimeReceiptFixtures();

    expect(() =>
      buildDistributedExecutionRuntimeReceipt({
        ...fixture,
        completedAt: undefined,
      }),
    ).toThrow(/require completedAt/);
  });

  it('fails closed when PTRR and ThinkingsGeneration receipts omit formal step data', () => {
    const ptrrAgent = buildDistributedExecutionRuntimeReceiptFixtures().find(
      (receipt) => receipt.workKind === 'ptrr_agent',
    );
    const generation = buildDistributedExecutionRuntimeReceiptFixtures().find(
      (receipt) => receipt.workKind === 'thinkings_generation',
    );

    expect(ptrrAgent).toBeTruthy();
    expect(generation).toBeTruthy();
    expect(() =>
      buildDistributedExecutionRuntimeReceipt({
        ...ptrrAgent!,
        agentId: undefined,
      }),
    ).toThrow(/PTRR agent receipts require agentId/);
    expect(() =>
      buildDistributedExecutionRuntimeReceipt({
        ...generation!,
        thinkingsGenerationStep: undefined,
      }),
    ).toThrow(/ThinkingsGeneration receipts require/);
  });

  it('fails closed when tool, ledger, wallet, proof, storage, and repair receipts omit their owned roots', () => {
    const fixtures = buildDistributedExecutionRuntimeReceiptFixtures();
    const byKind = Object.fromEntries(fixtures.map((receipt) => [receipt.workKind, receipt]));

    expect(() =>
      buildDistributedExecutionRuntimeReceipt({
        ...byKind.tool_call,
        toolId: undefined,
      }),
    ).toThrow(/Tool call receipts require toolId/);
    expect(() =>
      buildDistributedExecutionRuntimeReceipt({
        ...byKind.ledger_operation,
        ledgerProjectionRoot: undefined,
      }),
    ).toThrow(/Ledger operation receipts require ledgerProjectionRoot/);
    expect(() =>
      buildDistributedExecutionRuntimeReceipt({
        ...byKind.wallet_operation,
        walletOperationRoot: undefined,
      }),
    ).toThrow(/Wallet operation receipts require walletOperationRoot/);
    expect(() =>
      buildDistributedExecutionRuntimeReceipt({
        ...byKind.proof_generation,
        proofRoot: undefined,
      }),
    ).toThrow(/Proof generation receipts require proofRoot/);
    expect(() =>
      buildDistributedExecutionRuntimeReceipt({
        ...byKind.object_storage_write,
        objectStorageRoot: undefined,
      }),
    ).toThrow(/Object storage write receipts require objectStorageRoot/);
    expect(() =>
      buildDistributedExecutionRuntimeReceipt({
        ...byKind.repair_job,
        outputRoot: undefined,
      }),
    ).toThrow(/require outputRoot/);
  });

  it('fails closed on secret-shaped or protected-source receipt text', () => {
    const [fixture] = buildDistributedExecutionRuntimeReceiptFixtures();

    expect(() =>
      buildDistributedExecutionRuntimeReceipt({
        ...fixture,
        repairPosture: `${OPENAI_SECRET_PREFIX}abcdefghijklmnop1234567890`,
      }),
    ).toThrow(/must not contain secrets or non-disclosable source/);
  });
});

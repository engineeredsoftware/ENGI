import {
  BTD_INTERFACE_TELEMETRY_PROOF_HOOK_INTERFACE_IDS,
  BTD_INTERFACE_TELEMETRY_PROOF_HOOK_POSTURES,
  buildBtdInterfaceTelemetryProofHook,
  buildBtdInterfaceTelemetryProofHookInputs,
  buildBtdInterfaceTelemetryProofHookRegistry,
  getBtdInterfaceTelemetryProofHook,
} from '../src/interface-telemetry-proof-hook';

describe('Interface telemetry proof hooks', () => {
  it('publishes source-safe hooks for every required interface and posture', () => {
    const registry = buildBtdInterfaceTelemetryProofHookRegistry();

    expect(registry.observedInterfaceIds).toEqual(
      [...BTD_INTERFACE_TELEMETRY_PROOF_HOOK_INTERFACE_IDS].sort(),
    );
    expect(registry.observedPostures).toEqual(
      [...BTD_INTERFACE_TELEMETRY_PROOF_HOOK_POSTURES].sort(),
    );
    expect(registry.missingInterfaceIds).toEqual([]);
    expect(registry.missingPostures).toEqual([]);
    expect(registry.protectedPayloadSerialized).toBe(false);
    expect(registry.sourceSafety).toEqual({
      sourceSafe: true,
      protectedSourceVisible: false,
      containsProtectedSource: false,
      containsSecret: false,
    });
    expect(registry.rootKinds).toEqual([
      'request',
      'response',
      'ledger',
      'database',
      'object_storage',
      'generated_proof',
      'root_set',
    ]);
  });

  it('records execution and replay roots for Terminal, API, MCP, ChatGPT App, and package consumers', () => {
    const terminal = getBtdInterfaceTelemetryProofHook('interface.telemetry.terminal-reading-handoff');
    const publicApi = getBtdInterfaceTelemetryProofHook('interface.telemetry.public-api-reading');
    const mcp = getBtdInterfaceTelemetryProofHook('interface.telemetry.mcp-reading-tool');
    const chatgpt = getBtdInterfaceTelemetryProofHook('interface.telemetry.chatgpt-reading-action');
    const packageConsumer = getBtdInterfaceTelemetryProofHook(
      'interface.telemetry.package-contract-catalog',
    );

    expect(terminal).toMatchObject({
      interfaceId: 'product_handoff',
      actionId: 'terminal.reading.assetPackPreview',
      posture: 'blocked',
      denialReason: 'assetpack-source-locked-until-settlement',
    });
    expect(publicApi).toMatchObject({
      interfaceId: 'public_api',
      posture: 'denied',
      denialReason: 'read-license-or-authority-missing',
    });
    expect(mcp).toMatchObject({
      interfaceId: 'mcp_api',
      posture: 'success',
      successSummary: 'mcp-reading-pipeline-queued-with-source-safe-roots',
    });
    expect(chatgpt).toMatchObject({
      interfaceId: 'chatgpt_app',
      posture: 'blocked',
      denialReason: 'reader-confirmation-or-paid-rights-missing',
    });
    expect(packageConsumer).toMatchObject({
      interfaceId: 'package_consumer',
      posture: 'success',
      successSummary: 'package-consumer-can-replay-interface-proof-hooks',
    });

    for (const hook of [terminal, publicApi, mcp, chatgpt, packageConsumer]) {
      expect(hook.executionId).toMatch(/^execution-/);
      expect(hook.roots.requestRoot).toMatch(/^request-root:/);
      expect(hook.roots.responseRoot).toMatch(/^response-root:/);
      expect(hook.roots.ledgerRoot).toMatch(/^ledger-root:/);
      expect(hook.roots.databaseRoot).toMatch(/^database-root:/);
      expect(hook.roots.objectStorageRoot).toMatch(/^object-storage-root:/);
      expect(hook.roots.generatedProofRoot).toMatch(/^generated-proof-root:/);
      expect(hook.roots.rootSetRoot).toMatch(/^btd-interface-telemetry-root-set:/);
      expect(hook.replayCommand).toMatch(/^(pnpm|npm|node)\b/);
      expect(hook.theoremIds.length).toBeGreaterThan(0);
      expect(hook.replayStepIds.length).toBeGreaterThan(0);
      expect(hook.witnessArtifactPaths.length).toBeGreaterThan(0);
    }
  });

  it('fails closed when interface coverage is missing', () => {
    const hooks = buildBtdInterfaceTelemetryProofHookInputs().filter(
      (hook) => hook.interfaceId !== 'chatgpt_app',
    );

    expect(() => buildBtdInterfaceTelemetryProofHookRegistry({ hooks })).toThrow(
      /missing interface ids: chatgpt_app/,
    );
  });

  it('fails closed when success and denial postures are malformed', () => {
    const successHook = buildBtdInterfaceTelemetryProofHookInputs().find(
      (hook) => hook.posture === 'success',
    );
    const deniedHook = buildBtdInterfaceTelemetryProofHookInputs().find(
      (hook) => hook.posture === 'denied',
    );

    expect(successHook).toBeDefined();
    expect(deniedHook).toBeDefined();

    expect(() =>
      buildBtdInterfaceTelemetryProofHook({
        ...successHook!,
        successSummary: undefined,
      }),
    ).toThrow(/successSummary/);

    expect(() =>
      buildBtdInterfaceTelemetryProofHook({
        ...deniedHook!,
        denialReason: undefined,
      }),
    ).toThrow(/denialReason/);
  });

  it('rejects secrets, prompt bodies, and protected payloads', () => {
    const hook = buildBtdInterfaceTelemetryProofHookInputs()[0];

    expect(() =>
      buildBtdInterfaceTelemetryProofHook({
        ...hook,
        executionId: ['sk', 'proj', 'thisShouldNeverBeSerialized123456'].join('-'),
      }),
    ).toThrow(/must not contain secrets/);

    expect(() =>
      buildBtdInterfaceTelemetryProofHook({
        ...hook,
        roots: {
          ...hook.roots,
          requestRoot: 'prompt body must never be serialized here',
        },
      }),
    ).toThrow(/prompt bodies/);

    expect(() =>
      buildBtdInterfaceTelemetryProofHook({
        ...hook,
        roots: {
          ...hook.roots,
          responseRoot: 'protected source contents must never be serialized here',
        },
      }),
    ).toThrow(/protected source payloads/);
  });
});

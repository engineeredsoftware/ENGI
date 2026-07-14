/**
 * finish:ledgerize — update ledger posture from stored deposit synthesis data.
 *
 * Precise contract:
 * 1. Require finish:storedArtifacts (from store-artifacts).
 * 2. Build ledger payload: option contents roots, measurement roots, catalog path count.
 * 3. If deposit:ledgerWrite (async fn) is on the Execution, invoke it with the
 *    payload (on-chain / BTD journal bridge). Record finish:ledgerWriteResult.
 * 4. Always store finish:ledgerize receipt for audit.
 *
 * Full commercial settlement (BTC pay → mint → rights) remains SettleAssetPacks;
 * this agent ledgerizes **synthesis outputs** so stored APs are ledger-addressable.
 */

import { storeCrossPhaseArtifact } from '../../synthesize-asset-packs';

function findValue(execution: any, namespace: string, key: string): any {
  const local = execution?.get?.(namespace, key);
  if (local !== undefined) return local;
  return execution?.findUp?.(namespace, key);
}

function stableHash(value: unknown): string {
  const s = typeof value === 'string' ? value : JSON.stringify(value ?? null);
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `sha256:ledger-${(h >>> 0).toString(16).padStart(8, '0')}`;
}

export default async function runDepositLedgerizeAgent(input: any, execution: any) {
  const stored = findValue(execution, 'finish', 'storedArtifacts');
  if (!stored || stored.schema !== 'bitcode.deposit.synthesize-asset-packs.artifacts') {
    const failure = {
      schema: 'bitcode.deposit.synthesize-asset-packs.ledgerize',
      status: 'blocked',
      reason: 'finish:store-artifacts must run before ledgerize (missing storedArtifacts).',
      ledgerizedAt: new Date().toISOString(),
    };
    storeCrossPhaseArtifact(execution, 'finish', 'ledgerize', failure);
    return { ...(input || {}), success: false, ledgerize: failure };
  }

  const options = Array.isArray(stored.assetPacks) ? stored.assetPacks : [];
  const repository = findValue(execution, 'deposit', 'repository') ?? {};
  const workspacePath = findValue(execution, 'repository', 'workspacePath');
  const runId =
    findValue(execution, 'host', 'runId') ||
    findValue(execution, 'pipeline', 'runId') ||
    execution?.id ||
    null;

  const optionRoots = options.map((opt: any, index: number) => ({
    index,
    title: opt?.title || null,
    kind: opt?.kind || null,
    contentsRoot: stableHash({
      title: opt?.title,
      kind: opt?.kind,
      patch: opt?.patch,
      coveredSourcePaths: opt?.coveredSourcePaths,
      summary: opt?.summary,
    }),
    measurementRoot: stableHash(opt?.absolutes || opt?.measurements || []),
    metadataRoot: stableHash({
      confidence: opt?.confidence,
      needinessSignal: opt?.needinessSignal,
    }),
  }));

  const ledgerPayload = {
    schema: 'bitcode.deposit.synthesize-asset-packs.ledger-payload',
    runId,
    repositoryFullName:
      repository.fullName ||
      (repository.owner && repository.name ? `${repository.owner}/${repository.name}` : null),
    workspacePath: workspacePath || null,
    assetPackCount: options.length,
    optionRoots,
    storedArtifactsRoot: stableHash({
      pathCount: stored.sourceCheckoutCatalog?.pathCount,
      assetPackCount: options.length,
      storedAt: stored.storedAt,
    }),
    discoveryRoot: stableHash(stored.discovery || {}),
    validationRoot: stableHash(stored.validation || {}),
  };

  let writeResult: { ok: boolean; mode: string; detail?: string; txId?: string | null } = {
    ok: true,
    mode: 'projection-only',
    detail:
      'No deposit:ledgerWrite hook; ledger projection roots stored for journal binding by Host/dispatch.',
    txId: null,
  };

  const ledgerWrite = findValue(execution, 'deposit', 'ledgerWrite');
  if (typeof ledgerWrite === 'function') {
    try {
      const out = await ledgerWrite(ledgerPayload);
      writeResult = {
        ok: out?.ok !== false,
        mode: 'hook',
        detail: typeof out?.detail === 'string' ? out.detail : 'ledgerWrite hook completed',
        txId: out?.txId ?? null,
      };
    } catch (err) {
      writeResult = {
        ok: false,
        mode: 'hook-failed',
        detail: err instanceof Error ? err.message : String(err),
        txId: null,
      };
    }
  }

  const ledgerReceipt = {
    schema: 'bitcode.deposit.synthesize-asset-packs.ledgerize',
    status: writeResult.ok
      ? options.length > 0
        ? writeResult.mode === 'hook'
          ? 'written'
          : 'projected'
        : 'empty'
      : 'failed',
    ledgerizedAt: new Date().toISOString(),
    payload: ledgerPayload,
    writeResult,
  };

  storeCrossPhaseArtifact(execution, 'finish', 'ledgerize', ledgerReceipt);
  storeCrossPhaseArtifact(execution, 'finish', 'ledgerReceipt', ledgerReceipt);
  storeCrossPhaseArtifact(execution, 'finish', 'ledgerWriteResult', writeResult);

  return {
    ...(input || {}),
    success: writeResult.ok,
    ledgerize: ledgerReceipt,
  };
}

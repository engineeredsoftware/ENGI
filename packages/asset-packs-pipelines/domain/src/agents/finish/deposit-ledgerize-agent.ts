/**
 * finish:ledgerize — bind stored deposit synthesis artifacts to ledger posture.
 *
 * After store-artifacts, record ledgerization intent/receipt for the run.
 * Full on-chain settlement remains Gate-6 SettleAssetPacks; this agent records
 * the synthesis-side ledger projection roots from stored APs + measurements.
 */

import { storeCrossPhaseArtifact } from '../../synthesize-asset-packs';

function findValue(execution: any, namespace: string, key: string): any {
  const local = execution?.get?.(namespace, key);
  if (local !== undefined) return local;
  return execution?.findUp?.(namespace, key);
}

function shaLike(value: unknown): string {
  const s = typeof value === 'string' ? value : JSON.stringify(value || {});
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return `sha256:synth-${(h >>> 0).toString(16).padStart(8, '0')}`;
}

export default async function runDepositLedgerizeAgent(input: any, execution: any) {
  const stored = findValue(execution, 'finish', 'storedArtifacts');
  const options =
    stored?.assetPacks ??
    findValue(execution, 'implementation', 'options') ??
    [];
  const repository = findValue(execution, 'deposit', 'repository') ?? {};
  const workspacePath = findValue(execution, 'repository', 'workspacePath');

  const ledgerReceipt = {
    schema: 'bitcode.deposit.synthesize-asset-packs.ledgerize',
    status: Array.isArray(options) && options.length > 0 ? 'projected' : 'empty',
    ledgerizedAt: new Date().toISOString(),
    repositoryFullName:
      repository.fullName ||
      (repository.owner && repository.name ? `${repository.owner}/${repository.name}` : null),
    workspacePath: workspacePath || null,
    assetPackCount: Array.isArray(options) ? options.length : 0,
    optionRoots: (Array.isArray(options) ? options : []).map((opt: any, index: number) => ({
      index,
      title: opt?.title || null,
      kind: opt?.kind || null,
      contentsRoot: shaLike({
        title: opt?.title,
        patch: opt?.patch,
        absolutes: opt?.absolutes,
        coveredSourcePaths: opt?.coveredSourcePaths,
      }),
      measurementRoot: shaLike(opt?.absolutes || []),
    })),
    storedArtifactsRoot: shaLike({
      pathCount: stored?.sourceCheckoutCatalog?.pathCount,
      assetPackCount: Array.isArray(options) ? options.length : 0,
    }),
    note:
      'Synthesis-side ledger projection roots. Value-bearing on-chain settlement is SettleAssetPacks (post-admission).',
  };

  storeCrossPhaseArtifact(execution, 'finish', 'ledgerize', ledgerReceipt);
  storeCrossPhaseArtifact(execution, 'finish', 'ledgerReceipt', ledgerReceipt);

  return {
    ...(input || {}),
    success: true,
    ledgerize: ledgerReceipt,
  };
}

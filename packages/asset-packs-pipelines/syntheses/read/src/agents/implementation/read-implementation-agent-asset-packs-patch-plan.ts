/**
 * Read Implementation agent 1/4 — patch plan (deposit host twin + Need steering).
 *
 * Registry: implementation:read-implementation-agent-asset-packs-patch-plan
 * Sequence: THIS → patchfile → measurements → commercial-nl
 *
 * Reuses deposit plan host (catalog gate, salvage, store contract). Injects Need
 * + Relevant/Irrelevant as demandContext / impermissibleSources.
 */

function findValue(execution: any, namespace: string, key: string): any {
  const local = execution?.get?.(namespace, key);
  if (local !== undefined) return local;
  return execution?.findUp?.(namespace, key);
}

export default async function runReadImplementationAgentAssetPacksPatchPlan(
  input: any,
  execution: any,
) {
  const repository =
    input?.repository ??
    findValue(execution, 'read', 'repository') ??
    findValue(execution, 'deposit', 'repository') ??
    {};
  const needText = findValue(execution, 'read', 'need') ?? input?.need ?? '';
  const needComprehension =
    findValue(execution, 'setup', 'needComprehension') ??
    findValue(execution, 'setup', 'inputComprehension');
  const relevantPaths =
    findValue(execution, 'read', 'relevantPaths') ?? input?.relevantPaths ?? [];
  const irrelevantPaths =
    findValue(execution, 'read', 'irrelevantPaths') ??
    input?.irrelevantPaths ??
    [];

  const demandContext = Array.isArray(input?.demandContext)
    ? input.demandContext
    : [
        {
          topic: 'reader-need',
          summary: needComprehension?.summary || String(needText || ''),
        },
      ];

  try {
    execution?.store?.('deposit', 'repository', repository);
    execution?.store?.('deposit', 'demandContext', demandContext);
    if (Array.isArray(irrelevantPaths) && irrelevantPaths.length) {
      execution?.store?.('deposit', 'impermissibleSources', irrelevantPaths);
    }
    if (Array.isArray(relevantPaths) && relevantPaths.length) {
      execution?.store?.('deposit', 'permissibleSources', relevantPaths);
    }
    execution?.store?.('implementation', 'productLens', 'read');
    if (needText) execution?.store?.('implementation', 'need', needText);
  } catch {
    /* store optional */
  }

  const depositPlan = await import(
    '../../../../deposit/src/agents/implementation/deposit-implementation-agent-asset-packs-patch-plan'
  );
  return depositPlan.default(
    {
      ...input,
      repository,
      demandContext,
      impermissibleSources: irrelevantPaths,
      permissibleSources: relevantPaths,
      instructions: needText || input?.instructions,
    },
    execution,
  );
}

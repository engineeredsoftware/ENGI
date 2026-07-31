/**
 * Read Implementation agent 1/4 — patch plan (product re-implementation).
 *
 * Registry: implementation:read-implementation-agent-asset-packs-patch-plan
 * Sequence: THIS → patchfile → measurements → commercial-nl
 *
 * Uses domain base host only — never imports the deposit product package.
 * Product deltas: Need + Relevant/Irrelevant paths as demand/impermissible steering.
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

  const { default: runBasePatchPlan } = await import(
    '@bitcode/asset-packs-pipelines-syntheses-domain/agents/implementation/implementation-agent-asset-packs-patch-plan'
  );
  return runBasePatchPlan(
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

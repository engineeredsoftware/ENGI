/**
 * Read Implementation agent 4/4 — commercial NL (product re-implementation).
 *
 * Registry: implementation:read-implementation-agent-asset-packs-commercial-nl
 * Sequence: patch-plan → patchfile → measurements → THIS
 *
 * Domain base host only — never imports the deposit product package.
 * Product delta: Need as demandContext for buyer framing.
 */

function findValue(execution: any, namespace: string, key: string): any {
  const local = execution?.get?.(namespace, key);
  if (local !== undefined) return local;
  return execution?.findUp?.(namespace, key);
}

export default async function runReadImplementationAgentAssetPacksCommercialNl(
  input: any,
  execution: any,
) {
  const needText =
    findValue(execution, 'read', 'need') ??
    findValue(execution, 'implementation', 'need') ??
    input?.need ??
    '';
  try {
    execution?.store?.('implementation', 'productLens', 'read');
    if (needText) {
      execution?.store?.('implementation', 'need', needText);
      execution?.store?.('deposit', 'demandContext', [
        { topic: 'reader-need', summary: String(needText) },
      ]);
    }
  } catch {
    /* optional */
  }

  const { default: runBaseCommercialNl } = await import(
    '@bitcode/asset-packs-pipelines-syntheses-domain/agents/implementation/implementation-agent-asset-packs-commercial-nl'
  );
  return runBaseCommercialNl(
    {
      ...input,
      need: needText,
      demandContext: [{ topic: 'reader-need', summary: String(needText) }],
    },
    execution,
  );
}

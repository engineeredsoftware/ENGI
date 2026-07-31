/**
 * Read Implementation agent 4/4 — commercial NL (deposit host twin + Need).
 *
 * Registry: implementation:read-implementation-agent-asset-packs-commercial-nl
 * Sequence: patch-plan → patchfile → measurements → THIS
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
      // Deposit commercial NL may read demandContext for buyer framing.
      execution?.store?.('deposit', 'demandContext', [
        { topic: 'reader-need', summary: String(needText) },
      ]);
    }
  } catch {
    /* optional */
  }

  const depositCommercial = await import(
    '../../../../deposit/src/agents/implementation/deposit-implementation-agent-asset-packs-commercial-nl'
  );
  return depositCommercial.default(
    {
      ...input,
      need: needText,
      demandContext: [{ topic: 'reader-need', summary: String(needText) }],
    },
    execution,
  );
}

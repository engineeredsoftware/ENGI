/**
 * AssetPackPatchWriteTool — formal code-edit (patch) materialization tool (V48 Gate 3).
 *
 * Per spec, a completely synthesized AssetPack is a MEASURED PATCH:
 * patch + measurements + metadata. This formal ExecutionTool is the code-edit
 * primitive for the patch half of that artifact: it RECORDS the patch the
 * AssetPack contributes as a tool-tracked materialization that renders on the
 * SDIVF telemetry spine, exactly like AssetPackInventoryTool records the
 * exclusion-filtered source inventory.
 *
 * Source-safety (the hard constraint): this tool records the SOURCE-SAFE patch
 * DESCRIPTOR only — the set of file changes as (path + change op) — and NOTHING
 * ELSE. It never accepts, holds, or returns raw patch code, file contents, diffs,
 * or secrets. Because ExecutionTool persists both the call args and the return
 * value into the tool's child execution (which streams to execution_events),
 * keeping the descriptor path/op-only is what preserves the pre-settlement
 * source-safety invariant.
 *
 * It RECORDS, it does not fs-write: the returned `materialized: false` marks that
 * no physical workspace write happened here. Physical materialization of the
 * patch into a workspace is the delivery/sandbox context and is explicitly OUT
 * OF SCOPE. The descriptor recorded here is the artifact the depositor reviews
 * before admission.
 */

import { ExecutionTool } from '@bitcode/agent-generics';

export type AssetPackPatchWriteArgs = {
  fileChanges: Array<{ path: string; op: 'create' | 'modify' | 'delete' }>;
  assetPackTitle?: string;
};

export type AssetPackPatchWriteDescriptor = {
  materialized: boolean;
  fileChanges: Array<{ path: string; op: string }>;
};

export class AssetPackPatchWriteTool extends ExecutionTool<
  (args: AssetPackPatchWriteArgs) => Promise<AssetPackPatchWriteDescriptor>
> {
  use = async (args: AssetPackPatchWriteArgs): Promise<AssetPackPatchWriteDescriptor> => ({
    // Records, does not fs-write: physical workspace materialization is the
    // delivery context (out of scope). Returns ONLY the source-safe descriptor.
    materialized: false,
    fileChanges: (args.fileChanges || []).map((fc) => ({ path: fc.path, op: fc.op })),
  });
}

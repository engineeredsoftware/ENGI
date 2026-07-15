# Bitcode Agentic Execution Notes

Status: non-canonical internal note. Promote only precise requirements into `BITCODE_SPEC_V26.md`, `BITCODE_SPEC_V26_PARITY_MATRIX.md`, or V26 proof-surface documents.

## Canonical Execution Meaning

Bitcode agentic execution is source-to-shares inference over explicit phases, registries, prompts, tools, state, and proof receipts.

The V26 execution baseline is:
- Setup: bind source, repository, attachments, model/tool defaults, and execution state.
- Discovery: gather source-grounded evidence, including web research when useful for Read synthesis.
- Implementation: synthesize the AssetPack or connected-interface written asset.
- Validation: assess implementation, evidence, and readiness.
- Finish: save results, write proof/state, and deliver AssetPack outputs through selected delivery mechanisms.

`SDIVF` is the canonical phased implementation name for the current Bitcode phase sequence. `Simple` remains the other admissible execution shape where a full phase loop is unnecessary.

## Registry Requirements

Every execution layer must use typed registries instead of ad hoc wiring:
- Prompt registries own prompt instances and PromptPart composition.
- Tool registries expose only tools admitted for the current phase or agent.
- LLM registries resolve provider/model defaults.
- Agent registries resolve local agent implementations.
- Execution state registries preserve namespaced proof-bearing values.

Prompt-type implementation practice:
- `_generic_` PromptParts describe reusable base behavior.
- `_specific_` PromptParts describe concrete implementation owners.
- Package-local prompts import raw PromptParts from `packages/prompts` and stay close to their usage in package/interface code.

## Computer-Use Boundary

Computer-use support is only admitted as internal Read-measurement evidence in V26.

Implementation rule:
- The only server flag is `BITCODE_ENABLE_COMPUTER_USE_READ_MEASUREMENT`.
- Registry admission is scoped to `read-measurement:computer-use-evidence-agent`.
- Implementation, validation, Finish, and product action controls must not expose computer-use as a general execution option.

Full computer-using agent ability is beyond V26.

## Removed Execution Concepts

The following old execution ideas are not live V26 product concepts:
- public orchestration selection,
- public output-selection pipeline controls,
- public compute controls,
- pre-Finish final-phase naming,
- work-item-first product naming.

If compatibility code paths remain, they must read as AssetPack, Read, fit, settlement, Finish, and delivery-mechanism implementations.

## State Namespaces

Preferred active namespaces:
- `execution`: id, correlation id, stream carrier.
- `pipeline`: normalized input and written-asset type.
- `source`: provider, owner, repository, branch, commit, connection id.
- `read`: measured and accepted Read state.
- `config`: iteration count, MCP config, internal computer-use measurement flag.
- `attachments`: source evidence.
- `route/preprocessed`: route-owned snapshot and AssetPack written-asset snapshot.
- `finish/asset_pack_completion`: saved AssetPack summary and PR Shippable evidence.
- `postprocessed`: normalized AssetPack result.

Compatibility state names should be treated as corridors until renamed, removed, or bounded by explicit proof.

## Verification

Representative checks:
- `pnpm -C apps/uapi exec tsc --noEmit --project tsconfig.json --pretty false`
- `node --test protocol-demonstration/test/v26-active-product-naming.test.js`
- `node scripts/check-bitcode-spec-family.mjs --version V26 --mode draft`
- `node scripts/generate-bitcode-proven.mjs --version V26 --allow-dirty --check`

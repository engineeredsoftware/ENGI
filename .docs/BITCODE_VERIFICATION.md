# Bitcode Verification Notes

Status: non-canonical internal note.

## Purpose

Verification must prove that the active implementation matches V26 source-to-shares requirements.

Required proof areas:
- canonical spec family checks,
- active product naming checks,
- TypeScript compilation for admitted app/package corridors,
- route parity tests,
- Read review and fit review tests,
- prompt-system and prompt-space proof generation,
- schema/ORM/persistence proof generation,
- generated `.proofs/*` proof artifacts.

## Representative Commands

- `pnpm -C apps/uapi exec tsc --noEmit --project tsconfig.json --pretty false`
- `node --test protocol-demonstration/test/v26-active-product-naming.test.js`
- `node scripts/check-bitcode-spec-family.mjs --version V26 --mode draft`
- `node scripts/generate-bitcode-proven.mjs --version V26 --allow-dirty`
- `node scripts/generate-bitcode-proven.mjs --version V26 --allow-dirty --check`
- `git diff --check`

## Acceptance

Verification is insufficient if it only proves names. Fifth-gate proof must also show:
- Packs and Exchange read/write coherence,
- Read review before fit search,
- AssetPack and settlement receipt persistence,
- connected-interface write admission,
- removed execution control proof,
- internal-only computer-use admission.

# Bitcode V31 QA Ledger

## Status

- Version: `V31`
- Active canon during gate work: `V30`
- Draft target: `V31`
- QA posture: source-safe Auxillaries support/control proof ledger for V31 closure

## Gate 10 Promotion Readiness QA

V31 Gate 10 closes only when the version branch can be promoted without operator memory.
The QA surface is source-safe and includes:

- V31 gate checks 1 through 10 in Gate Quality CI;
- V31 promotion workflow validation for `version/v31` pull requests into `main`;
- `node scripts/promote-bitcode-canon.mjs --version V31 --commit HEAD --dry-run`;
- generated `.bitcode/v31-spec-family-report.json`, `.bitcode/v31-canonical-input-report.json`, `.bitcode/v31-canon-posture-drift-report.json`, and `.bitcode/v31-auxillaries-telemetry-proof-hooks.json`;
- `BITCODE_SPEC_V31_PROVEN.md` generation and check-mode replay during promotion;
- runtime posture rewrite from V30 active / V31 draft to V31 active / V32 draft;
- staging-testnet readback posture named without committed credentials, provider tokens, wallet secrets, database secrets, OpenAI keys, private prompts, or protected AssetPack source.

## Source-Safety Boundary

The V31 QA ledger may record proof roots, telemetry roots, route names, checker names, workflow names, and readiness summaries.
It must not record secrets, raw credentials, raw protected source, private prompts, or buyer-visible AssetPack contents before paid unlock.

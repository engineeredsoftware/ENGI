# Bitcode V32 QA Ledger

## Status

- Version: `V32`
- Active canon during QA: `V31`
- Draft target during QA: `V32`
- Promotion posture after formal workflow: `V32` active, `V33` draft
- Source-safety posture: source-safe evidence only; no secrets, protected source, provider payloads, wallet material, service-role keys, database credentials, or raw private prompts are serialized here.

## Gate 10 Promotion Readiness QA

V32 Gate 10 closes the provation/testing version by proving that the V32 branch
can promote through pull request automation without bypassing branch protection.
The gate binds local source checks, generated artifacts, workflow health, and
post-promotion runtime posture.

Required checks:

- `pnpm run generate:v32-promotion-readiness`
- `pnpm run check:v32-promotion-readiness`
- `pnpm run check:v32-gate10`
- `node scripts/promote-bitcode-canon.mjs --version V32 --commit HEAD --dry-run`
- `node scripts/generate-bitcode-proven.mjs --version V32 --commit HEAD --dry-run --allow-dirty`
- `node scripts/check-bitcode-spec-family.mjs --version V32 --mode draft --current-target V31`
- `node scripts/check-bitcode-canonical-inputs.mjs --current-target V31`
- `node scripts/check-bitcode-canon-posture-drift.mjs --active-canon V31 --draft-target V32`
- `pnpm --filter @bitcode/protocol typecheck`
- `pnpm --filter @bitcode/protocol test`
- `git diff --check`

Promotion workflow proof:

- `.github/workflows/v32-canon-promotion.yml` runs only for `version/v32` pull
  requests into `main` or manual workflow dispatch.
- Before promotion, it validates V31 active / V32 draft posture and every V32
  gate checker.
- The workflow invokes `npm run promote:canon -- --version V32 --commit
  <proof-source-commit>` only on the version branch.
- The promotion command rewrites the hand-authored V32 family status truth,
  prepares runtime posture for V32 active / V33 draft, writes
  `BITCODE_SPEC_V32_PROVEN.md`, writes `.bitcode/v32-*` generated artifacts,
  and validates the promoted V32 family.
- Direct pushes to `main` remain inadmissible.

Generated source-safe proof artifacts:

- `.bitcode/v32-promotion-readiness-report.json`
- `.bitcode/v32-promotion-proof-generation-hardening.json`
- `.bitcode/v32-testnet-mainnet-readiness-rehearsal.json`
- `.bitcode/v32-browser-accessibility-responsive-visual-proof.json`
- `.bitcode/v32-interface-contract-regression-suite.json`
- `.bitcode/v32-ledger-btd-settlement-failure-state-coverage.json`
- `.bitcode/v32-reading-pipeline-proof-coverage.json`
- `.bitcode/v32-deterministic-replay-report.json`
- `.bitcode/v32-artifact-volatility-inventory.json`
- `.bitcode/v32-proof-coverage-matrix.json`

Accepted boundaries:

- Gate 10 does not itself promote `BITCODE_SPEC.txt`; the promotion workflow
  performs that standalone canonical pointer change.
- Gate 10 does not approve production-mainnet value-bearing settlement.
- Gate 10 does not expose protected source, unreleased AssetPack contents,
  private prompts, raw provider responses, or environment values.

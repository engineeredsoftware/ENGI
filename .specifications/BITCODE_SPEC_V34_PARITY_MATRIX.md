# Bitcode Spec V34 Parity Matrix

## Status

- Version: `V34`
- V34 state: canonical promotion complete; V34 parity truth, generated deployment artifacts, gate closure, and promotion automation are aligned
- Current canonical/latest target: `V34`
- Canonical proof-source commit: `cb339f0407231855043dcf7174c384f1ab6bd16c`
- Prior canonical anchor: `BITCODE_SPEC_V33.md`
- Prior generated proof appendix: `BITCODE_SPEC_V33_PROVEN.md`
- Generated structured artifact inventory: active canonical `.bitcode/v34-spec-family-report.json`, `.bitcode/v34-canonical-input-report.json`, `.bitcode/v34-canon-posture-drift-report.json`, `.bitcode/v34-deployment-host-capability-catalog.json`, `.bitcode/v34-environment-lane-contracts.json`, `.bitcode/v34-distributed-execution-runtime-receipts.json`, `.bitcode/v34-deployment-storage-posture.json`, `.bitcode/v34-secret-rotation-boundary-operations.json`, `.bitcode/v34-migration-cicd-approval-gates.json`, `.bitcode/v34-runtime-observers-broadcasters-repair-jobs.json`, `.bitcode/v34-rollback-upgrade-data-repair-playbooks.json`, `.bitcode/v34-local-staging-testnet-deployment-rehearsal.json`, `.bitcode/v34-promotion-readiness-report.json`, V34 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V34_PROVEN.md` as the generated proof appendix for V34 promotion
- Source parity state: V34 source-side deployment host capability catalog, environment lane contracts, distributed execution runtime receipts, storage posture, secret rotation, migration CI/CD approval gates, runtime observer and repair jobs, rollback/upgrade/data repair playbooks, local/staging-testnet deployment rehearsal, workflow, and promotion surfaces are canonicalized in the promoted V34 file family
- Spec companion: `BITCODE_SPEC_V34.md`
- Notes companion: `BITCODE_SPEC_V34_NOTES.md`
- Delta companion: `BITCODE_SPEC_V34_DELTA.md`
- Generated proof appendix: `BITCODE_SPEC_V34_PROVEN.md` only after V34 promotion
- Scope: V34 canonical parity ledger for deployment depth over promoted V33 commercial interface canon
- Last fully realized canonical target preserved in source: `V34`

## Purpose

The V34 parity matrix prevents deployment work from becoming dashboard-only assumptions or environment folklore.
Every V34 gate must name the package-owned deployment object, runtime host, environment lane, storage carrier, secret boundary, runtime receipt, approval gate, repair posture, generated artifact, validation command, and source-safe proof required for closure.

## Audit basis

Gate 1 audit basis:

- `BITCODE_SPEC.txt`
- `BITCODE_SPEC_V33.md`
- `BITCODE_SPEC_V33_PROVEN.md`
- `BITCODE_SPEC_V34.md`
- `BITCODE_SPEC_V34_DELTA.md`
- `BITCODE_SPEC_V34_NOTES.md`
- `BITCODE_SPEC_V34_PARITY_MATRIX.md`
- `SPECIFICATIONS_ROADMAP.md`
- `README.md`
- `AGENTS.md`
- `.github/pull_request_template.md`
- `.github/workflows/bitcode-gate-quality.yml`
- `.github/workflows/bitcode-canon-quality.yml`
- `package.json`
- `packages/protocol/README.md`
- `protocol-demonstration/README.md`
- `packages/protocol/src/canon-posture.js`
- `protocol-demonstration/src/canon-posture.js`
- `packages/protocol/data/state.json`
- `scripts/check-v34-gate1-deployment-roadmap-opening.mjs`

No `_legacy/` source is active source truth.

## V34 implementation matrix

| Area | Gate | Source evidence | Judgment | Closure requirement |
| --- | --- | --- | --- | --- |
| Draft family and branch posture | Gate 1 | `BITCODE_SPEC_V34.md`, DELTA, NOTES, PARITY, `BITCODE_SPEC.txt`, branch `v34/gate-1-deployment-roadmap-opening` | closed | V34 family validates in draft mode over active V33 and `check:v34-gate1` passes. |
| Roadmap truth | Gate 1 | `SPECIFICATIONS_ROADMAP.md`, README, PR template, workflow posture | closed | Roadmap states V33 active, V34 draft, and coherent V35-V37 responsibilities. |
| Host capability and environment lane catalog | Gate 2 | `packages/btd/src/deployment-host-capability-catalog.ts`, `.bitcode/v34-deployment-host-capability-catalog.json`, `.bitcode/v34-environment-lane-contracts.json`, `packages/btd/__tests__/deployment-host-capability-catalog.test.ts`, and `check:v34-gate2` | closed | Hosts, services, lanes, storage carriers, and value-bearing blockers have package-owned rows. |
| Distributed execution runtime contracts | Gate 3 | `packages/pipeline-hosts/src/distributed-execution-runtime-receipt.ts`, `.bitcode/v34-distributed-execution-runtime-receipts.json`, `packages/pipeline-hosts/src/__tests__/distributed-execution-runtime-receipt.test.ts`, and `check:v34-gate3` | closed | Pipeline, PTRR agent, ThricifiedGeneration, tool, ledger, wallet, proof, object-storage, and repair work emits typed receipts. |
| Ledger/database/object-storage posture | Gate 4 | `packages/btd/src/deployment-storage-posture.ts`, `.bitcode/v34-deployment-storage-posture.json`, `packages/btd/__tests__/deployment-storage-posture.test.ts`, and `check:v34-gate4` | closed | ledger-derived state, database projection, object storage, proof artifacts, audit logs, backups, and rollback material are durable and repairable; source-bearing AssetPack storage remains locked before settlement. |
| Secret rotation and credential boundaries | Gate 5 | `packages/btd/src/secret-rotation-plan.ts`, `.bitcode/v34-secret-rotation-boundary-operations.json`, `packages/btd/__tests__/secret-rotation-plan.test.ts`, and `check:v34-gate5` | closed | OpenAI, Supabase, Vercel, GitHub, wallet, object storage, webhook, MCP, and ChatGPT App families have rotation, masking, leak response, runtime availability, and no secret values serialization coverage. |
| Migration CI/CD deployment approval gates | Gate 6 | `packages/btd/src/migration-approval-gate.ts`, `.bitcode/v34-migration-cicd-approval-gates.json`, `packages/btd/__tests__/migration-approval-gate.test.ts`, workflow wiring, and `check:v34-gate6` | closed | schema migration approval, generated type refresh, route scans, build/test gates, generated artifact freshness, Vercel/Supabase lane checks, promotion commit approval, reviewer approval, rollback, dry-runs, proof roots, and no secret values serialization fail closed. |
| Runtime observers, broadcasters, and repair jobs | Gate 7 | `packages/btd/src/runtime-observer-repair-job.ts`, `.bitcode/v34-runtime-observers-broadcasters-repair-jobs.json`, `packages/btd/__tests__/runtime-observer-repair-job.test.ts`, workflow wiring, and `check:v34-gate7` | closed | settlement observers, ledger broadcasters, finality watchers, database projection repair, object-storage repair, generated proof jobs, and queue consumers have receipts, replay commands, repair commands, non-value lanes, and unsafe drift blockers. |
| Rollback, upgrade, and data repair playbooks | Gate 8 | `packages/btd/src/rollback-upgrade-repair-playbook.ts`, `.bitcode/v34-rollback-upgrade-data-repair-playbooks.json`, `packages/btd/__tests__/rollback-upgrade-repair-playbook.test.ts`, workflow wiring, and `check:v34-gate8` | closed | Rollback, upgrade, migration rollback, object-storage repair, database repair, ledger projection repair, secret rotation incident response, and generated artifact repair are commandable, approval-gated, verification-backed, and proof-rooted. |
| Local and staging-testnet deployment rehearsal | Gate 9 | `packages/btd/src/deployment-readiness-rehearsal.ts`, `.bitcode/v34-local-staging-testnet-deployment-rehearsal.json`, `packages/btd/__tests__/deployment-readiness-rehearsal.test.ts`, workflow wiring, and `check:v34-gate9` | closed | local full-stack deployment rehearsal and staging-testnet full-stack deployment rehearsal exercise Terminal, public API, MCP API, ChatGPT App, Reading pipeline execution receipts, settlement/finality simulation, storage posture, repair posture, source-safe logs, and proof-rooted screenshots or logs; value-bearing mainnet blocked rehearsal remains denied. |
| Promotion readiness | Gate 10 | `packages/btd/src/deployment-promotion-readiness-report.ts`, `.bitcode/v34-promotion-readiness-report.json`, `packages/btd/__tests__/deployment-promotion-readiness-report.test.ts`, `scripts/promote-bitcode-canon.mjs`, `packages/protocol/src/canonical/proven-generator.js`, `.github/workflows/v34-canon-promotion.yml`, and `check:v34-gate10` | closed | V34 can promote only after all deployment gates pass and generated canon is source-safe. |

## V34 implementation checklist

| Area | Required V34 result | Judgment |
| --- | --- | --- |
| Active canon pointer | `BITCODE_SPEC.txt` remains `V33` during V34 gate work | closed |
| Gate branch pattern | V34 work happens on `version/v34` or `v34/gate-N-*` branches | closed |
| Spec-family shape | V34 SPEC, DELTA, NOTES, and PARITY satisfy the full spec-family checker | closed |
| Gate 1 script | `pnpm run check:v34-gate1` fails closed on stale posture, missing roadmap truth, or missing deployment-depth scope | closed |
| Gate-quality workflow | Gate workflow validates V33 active / V34 draft posture and the V34 Gate 1 checker | closed |
| Canon-quality workflow | Canon workflow validates promoted V33 canon, V34 draft family when present, and V33/V34 posture | closed |
| Package docs | README, protocol package README, demonstration README, and PR template state V33 active / V34 draft workflow | closed |
| Deployment vocabulary | V34 spec family names `DeploymentHostCapabilityCatalog`, `EnvironmentLaneContract`, `DistributedExecutionRuntimeReceipt`, `DeploymentStoragePosture`, `MigrationApprovalGate`, `SecretRotationPlan`, `RuntimeObserverRepairJob`, `RollbackUpgradeRepairPlaybook`, and `DeploymentReadinessRehearsal` | closed |
| Host/lane catalog package source | `packages/btd/src/deployment-host-capability-catalog.ts` owns `DeploymentHostCapabilityCatalog` and `EnvironmentLaneContract` builders | closed |
| Gate 2 generated artifacts | `.bitcode/v34-deployment-host-capability-catalog.json` and `.bitcode/v34-environment-lane-contracts.json` are deterministic and source-safe | closed |
| Value-bearing mainnet blocker | `value-bearing-mainnet` remains `blocked_future_canon_required` and admits no hosts | closed |
| Gate 3 generated artifact | `.bitcode/v34-distributed-execution-runtime-receipts.json` is deterministic and source-safe | closed |
| Runtime route boundary | Long-running `DistributedExecutionRuntimeReceipt` rows use `request_response_not_required` instead of request/response completion | closed |
| Gate 4 generated artifact | `.bitcode/v34-deployment-storage-posture.json` is deterministic and source-safe | closed |
| Storage disclosure boundary | `DeploymentStoragePosture` blocks protected AssetPack object storage, rollback material, and encrypted backups before settlement | closed |
| Gate 5 generated artifact | `.bitcode/v34-secret-rotation-boundary-operations.json` is deterministic and source-safe | closed |
| Secret family coverage | `SecretRotationPlan` covers OpenAI, Supabase, Vercel, GitHub, wallet, object storage, webhook, MCP, and ChatGPT App families with no secret values in generated artifacts or logs | closed |
| Promotion readiness report | `DeploymentPromotionReadinessReport` covers all V34 deployment artifacts, V34 promotion command planning, generated proof outputs, workflows, branch protection, source safety, and active V34 / draft V35 post-promotion posture | closed |
| Promotion workflow and generated appendix support | `.github/workflows/v34-canon-promotion.yml`, `scripts/promote-bitcode-canon.mjs`, `scripts/prepare-bitcode-spec-family-promotion.mjs`, and `packages/protocol/src/canonical/proven-generator.js` support V34 promotion and generated proof output | closed |

## Gate 1 Parity

| Requirement | Source evidence | Current V34 judgment |
| --- | --- | --- |
| Active canon remains V33 during V34 draft opening | `BITCODE_SPEC.txt` contains `V33` | drafted |
| Runtime draft target is V34 | `packages/protocol/src/canon-posture.js` and `protocol-demonstration/src/canon-posture.js` declare V33 active and V34 draft | drafted |
| V34 SPEC family exists as draft | `BITCODE_SPEC_V34.md`, DELTA, NOTES, and PARITY | drafted |
| Roadmap is current | `SPECIFICATIONS_ROADMAP.md` states V33 active canon, V34 active draft target, and V35-V37 scopes | drafted |
| Gate-quality workflow is V34-aware | `.github/workflows/bitcode-gate-quality.yml` | drafted |
| Canon-quality workflow is V34-aware | `.github/workflows/bitcode-canon-quality.yml` | drafted |
| README reflects V33/V34 posture | `README.md` | drafted |
| PR template reflects V34 gate titles | `.github/pull_request_template.md` | drafted |
| V34 Gate 1 checker exists | `scripts/check-v34-gate1-deployment-roadmap-opening.mjs` and package script | drafted |

## Gate 2 Parity

| Requirement | Source evidence | Current V34 judgment |
| --- | --- | --- |
| Package-owned host capability catalog exists | `packages/btd/src/deployment-host-capability-catalog.ts`, `packages/btd/src/index.ts`, `packages/btd/package.json` | closed |
| Environment lanes are explicit | `EnvironmentLaneContract`, `ENVIRONMENT_LANE_CONTRACT_IDS`, and `.bitcode/v34-environment-lane-contracts.json` | closed |
| Value-bearing mainnet is blocked | `value-bearing-mainnet` lane fixture, `blocked_future_canon_required`, focused tests, and checker assertions | closed |
| Generated artifacts are source-safe and deterministic | `.bitcode/v34-deployment-host-capability-catalog.json`, `.bitcode/v34-environment-lane-contracts.json`, and `pnpm run check:v34-host-capability-environment-lanes` | closed |

## Gate 3 Parity

| Requirement | Source evidence | Current V34 judgment |
| --- | --- | --- |
| Distributed execution runtime receipt exists | `packages/pipeline-hosts/src/distributed-execution-runtime-receipt.ts`, `packages/pipeline-hosts/src/index.ts`, and `.bitcode/v34-distributed-execution-runtime-receipts.json` | closed |
| Long-running route boundary is respected | `request_response_not_required` fixtures, focused tests, generated artifact coverage, and `check:v34-gate3` | closed |
| Pipeline, tool, ledger, wallet, proof, storage, and repair receipt roots are covered | `.bitcode/v34-distributed-execution-runtime-receipts.json` covers input roots, output roots, log roots, object-storage roots, ledger/database roots, wallet roots, proof roots, and repair posture | closed |
| PTRR and ThricifiedGeneration receipt precision | `ptrr_agent` and `thricified_generation` receipt rows include PTRR step and ThricifiedGeneration step data without protected prompt or source payloads | closed |
| Storage and repair receipt precision | `object_storage_write` and `repair_job` receipt rows carry source-safe roots, replay commands, and repair posture without serializing protected source | closed |
| Source-safety boundary | Gate 3 tests and checker reject secret-shaped text and protected source markers in receipt fields and generated artifact output | closed |

## Gate 4 Parity

| Requirement | Source evidence | Current V34 judgment |
| --- | --- | --- |
| Storage posture object exists | `packages/btd/src/deployment-storage-posture.ts`, `.bitcode/v34-deployment-storage-posture.json`, `packages/btd/__tests__/deployment-storage-posture.test.ts`, `pnpm run check:v34-gate4` | closed |
| Ledger/database/object-storage drift is repairable | `DeploymentStoragePosture` drift fixtures cover ledger/database projection drift and database/object storage projection drift with blocking repair commands | closed |
| Source-bearing AssetPack storage remains locked before settlement | protected AssetPack object storage, rollback material, and encrypted backups use `blocked_before_settlement`; source-bearing AssetPack storage remains locked before settlement | closed |
| Retention, encryption, backups, rollback material, and audit logs are covered | Gate 4 carriers include retention, encryption, backup posture, rollback material, audit log stream, and validation commands | closed |

## Gate 5 Parity

| Requirement | Source evidence | Current V34 judgment |
| --- | --- | --- |
| Secret family catalog exists without values | `packages/btd/src/secret-rotation-plan.ts`, `.bitcode/v34-secret-rotation-boundary-operations.json`, and required family rows | closed |
| Rotation and leak-response commands are specified | `SecretRotationPlan` rows include rotation command, cadence, leak response, blast-radius note, runtime availability, and audit event fields | closed |
| CI and logs reject secret-shaped payloads | `packages/btd/__tests__/secret-rotation-plan.test.ts` and `scripts/check-v34-gate5-secret-rotation-boundary-operations.mjs` reject secret-shaped values and require no secret values serialization | closed |

## Gate 6 Parity

| Requirement | Source evidence | Current V34 judgment |
| --- | --- | --- |
| Migration approval gate exists | `packages/btd/src/migration-approval-gate.ts` owns `MigrationApprovalGate`, required gate ids, and package builders | closed |
| CI/CD validates generated artifacts and promotion posture | `.github/workflows/bitcode-gate-quality.yml`, `.github/workflows/bitcode-canon-quality.yml`, `.github/workflows/v33-canon-promotion.yml`, and `.bitcode/v34-migration-cicd-approval-gates.json` bind generated artifact freshness, promotion commit approval, reviewer approval, rollback, and no secret values checks | closed |
| Vercel/Supabase lane checks are fail-closed | `vercel_lane_check` and `supabase_lane_check` rows in `.bitcode/v34-migration-cicd-approval-gates.json` carry dry-run, reviewer approval, rollback, proof roots, Vercel/Supabase lane posture, and value-bearing mainnet blocking | closed |

## Gate 7 Parity

| Requirement | Source evidence | Current V34 judgment |
| --- | --- | --- |
| Observers and broadcasters have runtime receipts | `RuntimeObserverRepairJob` rows in `.bitcode/v34-runtime-observers-broadcasters-repair-jobs.json` carry receipt work kinds and proof roots | closed |
| Repair jobs have lane contracts and replay commands | `database_projection_repair`, `object_storage_repair`, `generated_proof_job`, and `queue_consumer` rows bind non-value lane contracts, replay commands, and repair commands | closed |
| Unsafe drift blocks unlock | `packages/btd/__tests__/runtime-observer-repair-job.test.ts` proves unsafe drift failure and every row uses blocking posture | closed |

## Gate 8 Parity

| Requirement | Source evidence | Current V34 judgment |
| --- | --- | --- |
| Rollback, upgrade, and repair playbooks exist | `RollbackUpgradeRepairPlaybook`, required playbook ids, and `.bitcode/v34-rollback-upgrade-data-repair-playbooks.json` | closed |
| Playbooks name commands, operator approval, verification, and proof roots | generated artifact rows, `packages/btd/__tests__/rollback-upgrade-repair-playbook.test.ts`, and `pnpm run check:v34-gate8` | closed |
| Incident recovery remains source-safe | checker coverage rejects secret-shaped values, protected source markers, and value-bearing mainnet admission | closed |

## Gate 9 Parity

| Requirement | Source evidence | Current V34 judgment |
| --- | --- | --- |
| Local rehearsal is proof-rooted | `DeploymentReadinessRehearsal`, local full-stack row, source-safe log roots, proof bundle paths, runtime receipts, and `.bitcode/v34-local-staging-testnet-deployment-rehearsal.json` | closed |
| Staging-testnet rehearsal is proof-rooted | `DeploymentReadinessRehearsal`, staging-testnet full-stack row, source-safe log roots, proof bundle paths, runtime receipts, and `.bitcode/v34-local-staging-testnet-deployment-rehearsal.json` | closed |
| Value-bearing mainnet remains blocked | `value_bearing_mainnet_blocked_rehearsal`, focused tests, artifact coverage, and `pnpm run check:v34-gate9` | closed |

## Gate 10 Parity

| Requirement | Source evidence | Current V34 judgment |
| --- | --- | --- |
| Promotion readiness report exists | `.bitcode/v34-promotion-readiness-report.json`, `scripts/generate-v34-promotion-readiness-report.mjs`, and `pnpm run check:v34-promotion-readiness` | closed |
| All V34 deployment artifacts are covered | `DEPLOYMENT_PROMOTION_READINESS_ARTIFACT_PATHS`, generated gate artifact evidence, and `check:v34-gate10` coverage | closed |
| Promotion command supports V34 | `scripts/promote-bitcode-canon.mjs` includes V34 gate command planning, dry-run, generated proof output, and `buildDerivedV34CommitMessageBody` | closed |
| Generated appendix supports V34 | `packages/protocol/src/canonical/proven-generator.js` includes `buildV34ProvenPackage`, `buildV34PromotionReadinessReport`, and `.bitcode/v34-promotion-readiness-report.json` | closed |
| Runtime posture advances to V34 active / V35 draft | `scripts/prepare-bitcode-runtime-canon-promotion.mjs`, `.github/workflows/v34-canon-promotion.yml`, gate-quality, and canon-quality validate the post-promotion posture | closed |

## V34 accepted boundaries

- V34 owns deployment-depth and deployment-owned proof hooks.
- V35 owns broad telemetry/documentation programs, dashboards, docs, incidents, operator guides, and rollout material.
- V36 owns deeper Exchange.
- V37 owns website Conversations.
- V34 does not authorize value-bearing production-mainnet launch.
- V34 does not expose protected AssetPack source before settlement through any runtime carrier, generated proof, log, or interface.

## V34 completion condition

V34 parity is complete when each deployment-depth gate row has source evidence, tests, generated artifacts where required, workflow/checker support, and closed parity judgment, and when V34 promotion can rewrite `BITCODE_SPEC.txt` from `V33` to `V34` only after promotion-grade validations pass.

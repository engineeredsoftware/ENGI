# Bitcode Spec V31 Parity Matrix

## Status

- Version: `V31`
- V31 state: canonical promotion complete; V31 parity truth, Auxillaries gate closure, generated proof, and promotion automation are aligned
- Current canonical/latest target: `V31`
- Canonical proof-source commit: `8c711604600afe1d1e477d3c180d653602203d0f`
- Prior canonical anchor: `BITCODE_SPEC_V30.md`
- Prior generated proof appendix: `BITCODE_SPEC_V30_PROVEN.md`
- Generated structured artifact inventory: active canonical `.bitcode/v31-spec-family-report.json`, `.bitcode/v31-canonical-input-report.json`, `.bitcode/v31-canon-posture-drift-report.json`, `.bitcode/v31-auxillaries-telemetry-proof-hooks.json`, V31 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V31_PROVEN.md` as the generated proof appendix for V31 promotion
- Source parity state: V31 source-side Auxillaries package contracts, route data, client hooks, panes, organization authority, recovery runs, telemetry/proof hooks, UX/accessibility, workflow, and promotion surfaces are canonicalized in the promoted V31 file family
- State: draft target parity matrix opened
- Active canonical pointer during draft opening: `BITCODE_SPEC.txt` -> `V30`
- Scope: V31 canonical parity ledger for Auxillaries support/control surfaces, source-safe recovery and telemetry proof hooks, UX proof, local/staging readiness, and promotion automation over V30
- Spec companion: `BITCODE_SPEC_V31.md`
- Notes companion: `BITCODE_SPEC_V31_NOTES.md`
- Delta companion: `BITCODE_SPEC_V31_DELTA.md`
- Generated proof appendix: none until V31 promotion
- Last fully realized canonical target preserved in source: `V31`

## Purpose

The V31 parity matrix prevents Auxillaries deepening from becoming settings-page prose.
Every V31 gate must name the package/API/UI surfaces, data objects, tests, generated/proof evidence, accepted boundaries, and promotion posture required before the gate closes.

## Audit basis

Gate 1 audit basis:

- `BITCODE_SPEC.txt`
- `BITCODE_SPEC_V30.md`
- `BITCODE_SPEC_V30_DELTA.md`
- `BITCODE_SPEC_V30_NOTES.md`
- `BITCODE_SPEC_V30_PARITY_MATRIX.md`
- `BITCODE_SPEC_V30_PROVEN.md`
- `BITCODE_SPEC_V31.md`
- `BITCODE_SPEC_V31_DELTA.md`
- `BITCODE_SPEC_V31_NOTES.md`
- `BITCODE_SPEC_V31_PARITY_MATRIX.md`
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

No `_legacy/` source is active source truth.

## V31 implementation matrix

| Area | Gate | Source evidence | Judgment | Closure requirement |
| --- | --- | --- | --- | --- |
| Draft family and branch posture | Gate 1 | `BITCODE_SPEC_V31.md`, DELTA, NOTES, PARITY, `BITCODE_SPEC.txt`, branch `v31/gate-1-spec-roadmap-opening` | closed | V31 family validates in draft mode over active V30 and `check:v31-gate1` passes. |
| Roadmap truth | Gate 1 | `SPECIFICATIONS_ROADMAP.md`, README, PR template, workflow posture | closed | Roadmap states V30 active, V31 draft, and coherent V32-V37 responsibilities. |
| Auxillaries package and route contracts | Gate 2 | `packages/api/src/routes/auxillaries-contract.ts`, `packages/api/src/routes/auxillaries.ts`, package docs, route tests | closed | Shared Profile, Connects, Interfaces, Wallet, BTD, organization, readiness, and recovery objects are package-owned and JSON-safe. |
| Profile and account state | Gate 3 | `packages/api/src/routes/auxillaries-contract.ts`, `packages/api/src/routes/auxillaries.ts`, `apps/uapi/app/auxillaries/components/AuxillariesProfilePane.tsx`, route/pane tests | closed | Profile, account identity, wallet binding, preferences, notification posture, and completeness blockers are typed and recoverable. |
| Connects provider readiness and recovery | Gate 4 | Provider packages, connection routes, readiness/recovery tests | closed | Provider readiness names credential posture without secrets, scopes class, readback status, blocker, repair action, and before/after roots. |
| Wallet and BTD pane readiness | Gate 5 | `packages/btd`, Wallet/BTD panes, settlement/read-right tests | closed | Wallet and BTD panes consume V30 no-custody, signer, read-right, treasury, and settlement-readiness primitives. |
| Organization team role policy authority | Gate 6 | `packages/btd/src/authority.ts`, `packages/api/src/routes/auxillaries-contract.ts`, `apps/uapi/app/auxillaries/components/AuxillariesProfilePane.tsx`, `apps/uapi/app/terminal/terminal-organization-authority.ts`, focused BTD/API/UI tests | closed | Organization, team, role, grants, multi-sig readiness, policy decisions, denials, and recovery routes are typed and fail closed. |
| Interfaces pane admission and cross-surface contracts | Gate 7 | Interfaces pane, API/MCP/ChatGPT App interface records, tests | closed | Interface admission records name auth mode, supported actions, policy constraints, source-safety class, blockers, and readiness. |
| Auxillaries UX accessibility and responsive proof | Gate 8 | Auxillaries components, focused Jest/Playwright/a11y evidence | closed | Guided low-detail and expandable audit UX works across Profile, Connects, Interfaces, Wallet/BTD, and organization panes. |
| Auxillaries telemetry proof and recovery runs | Gate 9 | `packages/api/src/routes/auxillaries-contract.ts`, `/api/auxillaries/data`, `useUserData`, Externals UI, route/API/UI tests, Gate 9 checker | closed | Profile, connection, interface, wallet, BTD, organization, policy, readiness, and recovery events emit source-safe proof hooks. |
| Promotion readiness | Gate 10 | V31 promotion workflow, generated `.bitcode/v31-*`, `BITCODE_SPEC_V31_PROVEN.md` | closed | `version/v31` can promote to `main` only after all V31 gates pass and promotion automation commits generated canon. |

## V31 implementation checklist

| Area | Required V31 result | Judgment |
| --- | --- | --- |
| Active canon pointer | `BITCODE_SPEC.txt` remains `V30` during V31 gate work | closed |
| Gate branch pattern | V31 work happens on `version/v31` or `v31/gate-N-*` branches | closed |
| Spec-family shape | V31 SPEC, DELTA, NOTES, and PARITY satisfy the full spec-family checker | closed |
| Gate 1 script | `pnpm run check:v31-gate1` fails closed on stale posture, missing roadmap truth, or missing Auxillaries scope | closed |
| Gate-quality workflow | Gate workflow validates V30 active / V31 draft posture and V31 Gates 1 through 10 | closed |
| Canon-quality workflow | Canon workflow validates V30 active / V31 draft posture and promoted V31 / draft V32 posture | closed |

## Gate 1 Parity

| Requirement | Source evidence | Current V31 judgment |
| --- | --- | --- |
| Active canon remains V30 during V31 draft opening | `BITCODE_SPEC.txt` contains `V30` | drafted |
| Runtime draft target is V31 | `packages/protocol/src/canon-posture.js` and `protocol-demonstration/src/canon-posture.js` declare V30 active and V31 draft | drafted |
| V31 SPEC family exists as draft | `BITCODE_SPEC_V31.md`, DELTA, NOTES, and PARITY | drafted |
| Roadmap is current | `SPECIFICATIONS_ROADMAP.md` states V30 active canon, V31 active draft target, and V32-V37 scopes | drafted |
| Gate-quality workflow is V31-aware | `.github/workflows/bitcode-gate-quality.yml` | drafted |
| Canon-quality workflow is V31-aware | `.github/workflows/bitcode-canon-quality.yml` | drafted |
| README reflects V30/V31 posture | `README.md` | drafted |
| PR template reflects V31 gate titles | `.github/pull_request_template.md` | drafted |
| V31 Gate 1 checker exists | `scripts/check-v31-gate1-spec-roadmap-opening.mjs` and package script | drafted |

## Gate 2 Parity

| Requirement | Source evidence | Current V31 judgment |
| --- | --- | --- |
| Package-owned Auxillaries contracts exist | `packages/api/src/routes/auxillaries-contract.ts` owns `AuxillariesContractSnapshot`, `AuxillariesProfileState`, `AuxillariesConnectionReadiness`, `AuxillariesInterfaceAdmission`, `AuxillariesWalletBtdPaneState`, `OrganizationPolicyAuthority`, `AuxillariesReadinessDiagnostic`, and `AuxillariesRecoveryRun` | drafted |
| Routes delegate readiness and policy derivation | `packages/api/src/routes/auxillaries.ts` delegates live and mock data through `buildAuxillaryDataPayload` / `buildAuxillaryDataPayloadFromUnknown`; `apps/uapi/app/api/auxillaries/data/route.ts` remains a thin interface binding | drafted |
| JSON-safe serializers redact secrets and protected source | `packages/api/src/routes/__tests__/auxillaries-contract.test.ts` covers provider tokens, service-role keys, wallet secrets, private prompts, protected source, validation, diagnostics, and recovery-run roots | drafted |
| Commercial runtime avoids standalone demonstration imports | `scripts/check-v31-gate2-auxillaries-package-route-contracts.mjs` scans tracked commercial runtime source and fails on `protocol-demonstration/src/*` imports | drafted |

## Gate 3 Parity

| Requirement | Source evidence | Current V31 judgment |
| --- | --- | --- |
| Profile/account state is typed | `AuxillariesAccountIdentity`, `AuxillariesProfileCompletenessIssue`, `AuxillariesPreferencePosture`, `AuxillariesNotificationPosture`, and `AuxillariesDataSharingPosture` in `packages/api/src/routes/auxillaries-contract.ts` | drafted |
| Wallet binding and preferences are recoverable support state | `buildAuxillariesProfileState` emits wallet, model, and template repair issues; `/api/auxillaries/data` hydrates model and template preferences before `buildAuxillaryDataPayload` | drafted |
| Incomplete state names blockers and repair routes | `packages/api/src/routes/__tests__/auxillaries-contract.test.ts`, `apps/uapi/tests/userDataRoute.test.ts`, and `apps/uapi/tests/profileStep.test.tsx` cover issues, blockers, repair routes, and Profile pane projection | drafted |

## Gate 4 Parity

| Requirement | Source evidence | Current V31 judgment |
| --- | --- | --- |
| Provider readiness is source-safe | `AuxillariesConnectionReadiness` in `packages/api/src/routes/auxillaries-contract.ts` carries provider id/name, token presence class, scopes class, last readback, blocker, repair action, source-safe metadata, and `providerReadinessRoot` | drafted |
| Recovery runs record before/after readiness roots | `apps/uapi/app/api/vcs/[provider]/connection/route.ts`, `apps/uapi/app/api/auxillaries/connections/github/route.ts`, and `apps/uapi/tests/api/auxillariesGithubConnectionRoute.test.ts` emit and test before/after readiness roots | drafted |
| Tokens and credentials never enter telemetry/UI metadata | `packages/api/src/routes/__tests__/auxillaries-contract.test.ts`, `apps/uapi/tests/api/vcsRoutes.test.ts`, `apps/uapi/tests/api/auxillariesGithubConnectionRoute.test.ts`, and `apps/uapi/tests/auxillariesExternalsPane.test.tsx` cover response/UI redaction and source-safe projection | drafted |

## Gate 5 Parity

| Requirement | Source evidence | Current V31 judgment |
| --- | --- | --- |
| Wallet panes consume no-custody signer posture | `packages/btd/src/auxillaries-support.ts`, `packages/api/src/routes/auxillaries-contract.ts`, and `apps/uapi/tests/auxillariesWalletPane.test.tsx` project no-custody capability, signer readiness, signer actions, roots, and UI readout | drafted |
| BTD panes consume range/read-right/treasury summaries | `BtdWalletBtdSupportProjection`, `AuxillariesWalletBtdPaneState`, `packages/btd/__tests__/btd.test.ts`, and `packages/api/src/routes/__tests__/auxillaries-contract.test.ts` cover range counts, read-right counts, BTC fee treasury, and protected-source invisibility | drafted |
| Settlement-readiness state remains distinct from Exchange market state | Wallet pane and package tests assert account-scoped treasury posture, settlement blockers, and `not_exchange_market_state` classification | drafted |

## Gate 6 Parity

| Requirement | Source evidence | Current V31 judgment |
| --- | --- | --- |
| Organization authority is package-owned | `BtdOrganizationPolicyAuthority` and `buildBtdOrganizationPolicyAuthority` in `packages/btd/src/authority.ts`; `OrganizationPolicyAuthority` aliases that object in `packages/api/src/routes/auxillaries-contract.ts` | closed |
| Role, grants, policy, wallet binding, and denial reasons are typed | BTD tests cover allowed settlement-adjacent policy authority and protected-source denial; API tests assert organization/team/member/grant/policy/multi-sig route emission; Profile pane tests render the shared authority object | closed |
| Protected actions fail closed unless all authority inputs admit them | `packages/btd/__tests__/btd.test.ts` covers missing grant, wallet, policy, interface admission, multi-sig, settlement, read access, and confirmation denial reasons with blocked source visibility | closed |
| Terminal and Auxillaries consume one authority object | `apps/uapi/hooks/useUserData.ts`, `apps/uapi/app/auxillaries/components/AuxillariesSurface.tsx`, `apps/uapi/app/auxillaries/components/AuxillariesProfilePane.tsx`, and `apps/uapi/app/terminal/terminal-organization-authority.ts` consume/project `organizationAuthority` without route-local policy rederivation | closed |

## Gate 7 Parity

| Requirement | Source evidence | Current V31 judgment |
| --- | --- | --- |
| Interfaces pane exposes admitted surfaces | `AuxillariesInterfaceAdmission` records in `packages/api/src/routes/auxillaries-contract.ts` enumerate Terminal, API, MCP, ChatGPT App, Exchange hook, Conversations hook, and future interface hooks; `apps/uapi/app/auxillaries/components/AuxillariesInterfacesPane.tsx` renders the catalog | closed |
| Each surface names auth, actions, policy, source-safety, blockers, and readiness | `packages/api/src/routes/__tests__/auxillaries-contract.test.ts` asserts auth mode, `supportedActions`, current `allowedActions`, `policyRequirements`, `sourceSafetyClass`, blockers, readiness, and roots | closed |
| Deferred Exchange and Conversations remain explicitly out of scope | Exchange and Conversations hook records are blocked with `deferredProductDepth` values and deferred blockers; `apps/uapi/tests/orbitalsInterfacesPane.test.tsx` reads those blockers in the catalog | closed |

## Gate 8 Parity

| Requirement | Source evidence | Current V31 judgment |
| --- | --- | --- |
| Guided low-detail UX is default | `apps/uapi/app/auxillaries/components/AuxillariesContent.tsx` renders the contained active-pane summary and readiness chips before audit expansion; `apps/uapi/tests/auxillariesContent.access.test.tsx` asserts the named main, active pane, status, ready/loading state, and skip link | closed |
| Audit detail is expandable without layout breakage | `apps/uapi/app/auxillaries/components/AuxillariesContent.tsx` renders source-safe `details` audit metadata; `apps/uapi/styles/auxillaries-bitcode.css` keeps audit grids responsive at desktop/tablet/mobile breakpoints | closed |
| Keyboard, focus, labels, state announcements, contrast, and reduced motion are tested | `apps/uapi/app/auxillaries/auxillaries-ux-accessibility-proof.ts`, `apps/uapi/tests/auxillariesContent.access.test.tsx`, and `apps/uapi/tests/auxillariesWorkspacePanels.access.test.tsx` cover landmarks, labels, `aria-current`, `aria-disabled`, status announcements, evidence files, and viewport posture; route CSS covers focus-visible rings, contrast chips, wrapping, and `prefers-reduced-motion` | closed |

## Gate 9 Parity

| Requirement | Source evidence | Current V31 judgment |
| --- | --- | --- |
| Auxillaries telemetry subjects are typed | `AuxillariesTelemetrySubject` and `AuxillariesTelemetryProofHook` in `packages/api/src/routes/auxillaries-contract.ts`; `packages/api/src/routes/__tests__/auxillaries-contract.test.ts` asserts all required subjects | closed |
| Recovery runs are executions with source-safe before/after evidence | `AuxillariesRecoveryRun` carries blocker id, retry policy, before/after roots, execution id, evidence root, telemetry root, outcome, and source-safety class; route/UI tests read those records | closed |
| Proof hooks bind theorem, replay, evidence, telemetry, blocker, and repair outcome roots | `buildAuxillariesTelemetryProofHooks` derives hooks from profile, account, provider, interface, wallet, BTD, organization, policy, readiness, and recovery objects; Externals renders compact source-safe hook readback | closed |

## Gate 10 Parity

| Requirement | Source evidence | Current V31 judgment |
| --- | --- | --- |
| V31 promotion checker exists | `scripts/check-v31-gate10-promotion-readiness.mjs` | closed |
| V31 promotion workflow exists | `.github/workflows/v31-canon-promotion.yml` | closed |
| Promotion command supports V31 generated artifacts and runtime posture rewriting | `scripts/promote-bitcode-canon.mjs`, `scripts/prepare-bitcode-spec-family-promotion.mjs`, `scripts/prepare-bitcode-runtime-canon-promotion.mjs`, `packages/protocol/src/canonical/proven-generator.js` | closed |
| `BITCODE_SPEC_V31_PROVEN.md` is generated during promotion only | `scripts/generate-bitcode-proven.mjs`, V31 promotion workflow, generated `.bitcode/v31-*` proof artifacts | closed |

## accepted boundaries

- Gate 1 does not implement Auxillaries package contracts or UI behavior.
- Gate 1 does not create `BITCODE_SPEC_V31_PROVEN.md`.
- Gate 1 does not promote `BITCODE_SPEC.txt` to V31.
- Gate 1 may retarget workflows to active V30 / draft V31 so later gates are greenable.
- Gate 1 may update V31-V37 roadmap scope to align with promoted V30 and current enterprise-readiness goals.
- V31 does not redefine V30 Reading, Finding Fits, AssetPack preview, settlement, delivery, BTC fee, or BTD tokenomics law.

## completion condition

Gate 1 is complete when the V31 draft family validates, `check:v31-gate1` passes, workflow posture is V31-aware, README and roadmap reflect V31 initiation, V31-V37 scopes are current enough to guide future gates, diff hygiene passes, and the gate branch is committed, pushed, and pull-requested for review into `version/v31`.

Gate 10 completion condition: V31 is complete when `check:v31-gate10` passes in
draft and promotion modes, Gate Quality invokes V31 Gates 1 through 10,
Canon Quality accepts promoted V31 / draft V32 posture, `v31-canon-promotion.yml`
validates `version/v31` pull requests into `main`, the canonical promotion
script supports `--version V31`, the generated V31 appendix writes
`.bitcode/v31-*` artifacts, and no source-safe QA ledger or generated artifact
contains credentials, protected source, private prompts, or pre-settlement
AssetPack contents.

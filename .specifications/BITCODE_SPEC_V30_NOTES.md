# Bitcode Spec V30 Notes

## Status

- Version: `V30`
- V30 state: canonical promotion complete; V30 notes record the accepted Protocol/BTD hardening, local/staging, and promotion-readiness evidence
- Current canonical/latest target: `V30`
- Canonical proof-source commit: `c5b238b9958430c4611ef396ac8cea248c1aecf4`
- Current active draft target: `V30`
- Canonical pointer: `BITCODE_SPEC.txt` -> `V29`
- Active canonical anchor: `BITCODE_SPEC_V29.md`
- Active generated proof appendix: `BITCODE_SPEC_V29_PROVEN.md`
- Prior canonical anchor: `BITCODE_SPEC_V29.md`
- Prior generated proof appendix: `BITCODE_SPEC_V29_PROVEN.md`
- Generated structured artifact inventory: active canonical `.bitcode/v30-spec-family-report.json`, `.bitcode/v30-canonical-input-report.json`, `.bitcode/v30-canon-posture-drift-report.json`, `.bitcode/v30-protocol-telemetry-proof-hooks.json`, V30 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V30_PROVEN.md` as the generated proof appendix for V30 promotion
- Source parity state: V30 source-side Protocol/BTD package APIs, Bitcoin/PSBT, receipts, ledger projection, source-to-shares, bridge-readiness, telemetry/proof hooks, interface regression, workflow, and promotion surfaces are canonicalized in the promoted V30 file family
- Scope: V30 canonical notes for Protocol/BTD hardening, local/staging readiness, and promotion automation over V29
- Last fully realized canonical target preserved in source: `V30`

This NOTES file does not promote V30.
Gate 1 opens V30 implementation discipline from promoted V29 without rediscovering deferred Protocol/BTD hardening pressure.

## Notes companion rule

This file is a required companion to `BITCODE_SPEC_V30.md`.
It may carry planning detail, QA observations, and simplified reading, but it must not override the main V30 SPEC.
Binding V30 requirements must be reflected in SPEC, DELTA, and PARITY before a gate closes.

## Concise current-system reading

V29 is active canon.
V30 hardens Protocol/BTD surfaces after V28/V29 revealed implementation pressure.
Exchange is not V30 work.

## Simplified-spec reading rule

For a simplified reading of V30:

1. V29 is the current law.
2. V30 does not change `$BTD` supply, BTC fee asset, source-safe paid unlock, or the five-step Reading journey.
3. V30 makes the underlying Protocol/BTD rails more precise: packages, Bitcoin fee flow, receipts, ledger projection, source-to-shares accounting, bridge boundaries, telemetry, and proof hooks.
4. If a Protocol/BTD fact matters for money, source visibility, rights, proof, delivery, or repair, it must be typed, stored, testable, and source-safe.
5. `BITCODE_SPEC.txt` remains `V29` until V30 promotion automation advances canon.

## Deferred from V29

V29 canonically closes deeper Terminal transaction depth, local/staging promotion readiness, and promotion automation.
V30 inherits deferred hardening pressure around Bitcoin fee boundaries, GitHub delivery evidence, compute/runtime capability truth, storage/readback posture, and build/process proof surfaces.

## Candidate V30 workstreams

V30 owns Protocol/BTD hardening:

- follow-up package extraction and narrower package APIs after V28 removes commercial dependencies on `protocol-demonstration/`;
- Bitcoin/Taproot/PSBT rigor after V28 testnet use;
- BTD-AssetPack mint/read receipt hardening after V28 synthetic measurement and ledgerized journal proof;
- testnet ledger, database projection, and reconciliation hardening;
- bridge-readiness research notes for Taproot, BitVM, BSC/opBNB, Binance Web3 Wallet, and future distribution paths without treating them as current `$BTD` chain-of-record truth;
- source-to-shares proof cleanup revealed by V28/V29;
- Protocol/BTD-specific tests, proofs, and telemetry hooks needed before Exchange returns beyond V35.

## V30 gate plan

1. **Gate 1: V30 Roadmap And Gating**
   - Open the V30 spec family.
   - Refresh `SPECIFICATIONS_ROADMAP.md` to current V29 active / V30 draft truth and V31-V37 progressive scopes.
   - Wire V30 Gate 1 checks, README posture, PR title guidance, gate-quality, and canon-quality posture.

2. **Gate 2: Protocol Package API Boundaries**
   - Narrow package APIs for shared Protocol/BTD objects used by API, Terminal, MCP, ChatGPT App, and future Auxillaries/Exchange work.
   - Require package-owned builders, validators, parsers, tests, and JSON-safe serialization before cross-interface use.

## Gate 2 protocol package API boundary notes

Gate 2 moves reusable BTD route-facing construction into
`packages/btd/src/api-boundaries.ts`. `packages/api/src/routes/btd-crypto.ts`
remains the route owner: it authenticates requests, parses request bodies,
resolves registry projections, commits explicit persistence writes, and returns
JSON responses. It no longer owns BTD mint draft admission, registry snapshot
construction, read-access policy derivation, BTC-fee settlement receipts,
AssetPack ledger anchors, Exchange settlement receipts, Terminal journal
settlements, reconciliation reports, deployment-readiness receipts, BigInt
parsing, or JSON-safe conversion.

The package test `packages/btd/__tests__/api-boundaries.test.ts` is the local
contract for package-owned builders/parsers/serialization. The API route test
imports those builders from `@bitcode/btd` and keeps route-handler coverage in
the API package. `pnpm run check:v30-gate2` closes the gate by checking this
seam, package README ownership language, and commercial runtime avoidance of
standalone demonstration imports.

3. **Gate 3: Bitcoin Taproot PSBT Fee Rigor**
   - Harden BTC fee quote, signer recovery, PSBT, Taproot/script posture, broadcast, replacement, reorg, finality, and testnet/mainnet boundaries.

## Gate 3 Bitcoin Taproot PSBT fee rigor notes

Gate 3 makes BTC fee operation inspectable before any later BTD receipt,
projection, or interface depends on it. `BtcFeeOperationPosture` now carries the
network policy, Taproot/PSBT posture, PSBT handoff state, and broadcast
observation state beside quote, signer, receipt, and blocked-readiness data.

The network policy deliberately treats staging-testnet as the operational lane
for current QA. Production-mainnet value-bearing settlement is not admitted by
default. It must carry explicit operational approval before the posture leaves
blocked-readiness, and that approval state contributes to the policy proof root.

The PSBT path distinguishes prepared unsigned PSBT, signed ready-to-broadcast
PSBT, broadcast submission, finality observation, replacement/reorg repair, and
failure. Signed receipt advancement requires a signed PSBT. Broadcast,
confirmed, replaced, and reorged observations require transaction id evidence.
Server-custody signer posture remains rejected before PSBT handoff.

## Gate 4 BTD AssetPack mint and read receipt notes

Gate 4 moves BTD receipt posture from route/runtime convention into package
owned primitives:

- `BtdAssetPackMintReceipt` binds the deposited AssetPack id, BTD range,
  depositor wallet, source manifest root, source-safe preview root, Finding
  Fits result root, proof root, settlement conservation root, access policy,
  and ledger projection root. It is always source-safe and never exposes
  protected source.
- `BtdReadReceipt` binds the Reader wallet, Depositor wallet, accepted Need
  root, Finding Fits root, source-safe preview root, paid unlock state, read
  right state, delivery admission state, and ledger projection root. It rejects
  protected source visibility unless the read is paid-unlocked.
- `BtdRightsTransferReceipt` binds the settled BTD range and read license to a
  confirmed BTC fee receipt, paid unlock root, delivery admission root, ledger
  anchor, ledger projection root, and Reader/Depositor identities. It is the
  receipt boundary where protected source can become visible to the paying
  Reader.

The package API boundary exposes builders for mint receipts, read-receipt
settlements, and rights-transfer receipts so API routes and harness code do not
reimplement receipt policy. The Sandbox harness emits mint/read receipt payloads
and receipt roots inside ledger settlement evidence; rights-transfer receipts
remain absent until BTC fee finality is confirmed. Terminal detail snapshots
coerce receipt payloads under camelCase or database-style snake_case keys, and
the transaction read model counts receipt payloads in closure and journal
availability.

## Gate 5 testnet ledger projection notes

Gate 5 extends the V29 reconciliation cockpit from ledger/database/private-root
separation into a four-fact projection model:

- ledger observed facts remain fee, anchor, journal, range, ownership, license,
  and finality observations;
- database projected facts remain Supabase rows and projected roots/finality;
- object-storage artifact facts now carry source-safe preview, evidence,
  telemetry, delivery, and ledger-projection roots separately from database
  rows;
- private metaphysical facts remain root-only protected source and policy
  context.

Object storage may prove a durable artifact exists, but it may not leak
protected source before settlement. Unencrypted protected source artifacts are
rejected. Encrypted protected source artifacts are admissible only as roots and
encrypted posture, not visible source.

Supabase staging-testnet readback is an explicit receipt. It records project
ref, REST host, optional DB host, admin credential presence state, table readback
counts, synchronized-or-blocked state, and proof root. It rejects secret-shaped
values so tracked files, telemetry, and persisted proof payloads cannot carry
service-role JWTs, `sb_secret__` keys, OpenAI keys, or database passwords.

Gate 5 keeps the existing registry table shape for repair rows. The API
persists schema-compatible repair receipts; richer drift classes, repair
actions, readback receipts, and proof roots remain in the report payload until a
future schema expansion admits more columns.

## Gate 6 source-to-shares cleanup notes

Gate 6 moves settlement-source-to-shares accounting into the BTD package instead
of relying on older protocol-local artifact builders. The package primitive
normalizes accepted fit deposits into contribution weights through a deterministic
largest-remainder method, allocates BTD range slices with zero-cell/refit-tail
posture when a fit receives no cell, allocates BTC fee credits exactly by the
same contribution weights, and emits one proof root that binds the fee quote,
payment observation, measurements, fit deposits, range slices, allocation roots,
settlement conservation, and ancestry evidence.

The proof intentionally keeps no-overpayment and no-underpayment as distinct
theorem verdicts. This lets a repair cockpit distinguish a Reader overpayment
from an inadmissible underpayment instead of collapsing both into generic
conservation drift. The same proof emits a reconciliation-compatible settlement
conservation check so Gate 5 ledger/database repair can pause unlock or delivery
from the source-to-shares proof directly.

The source-to-shares API route does not write a new registry table in Gate 6.
It returns a JSON-safe proof settlement and a Terminal journal entry. Later
Exchange work may persist richer proof rows after schema admission, but it must
reuse the package proof rather than recomputing contribution weights, range
slices, or BTC fee allocations.

4. **Gate 4: BTD AssetPack Mint And Read Receipts**
   - Make BTD mint, read, and rights-transfer receipts typed, proof-rooted, stored, streamed, and source-safe.

5. **Gate 5: Testnet Ledger Projection Hardening**
   - Harden ledger/database/object-storage projection, repair, proof roots, and staging-testnet readback.

6. **Gate 6: Source-To-Shares Proof Cleanup**
   - Clean contribution measurements, settlement conservation, zero-cell/refit tail, ancestry, and no-overpayment/no-underpayment proof surfaces.

7. **Gate 7: Bridge Readiness Research Boundaries**
   - Document Taproot, BitVM, BSC/opBNB, Binance Web3 Wallet, and future bridge postures without admitting any as current chain-of-record truth.

8. **Gate 8: Protocol Telemetry And Proof Hooks**
   - Add typed Protocol/BTD telemetry and proof hooks needed by V32 provation, V34 deployment, and V35 documentation/observability.

9. **Gate 9: Interface Integration And Regression Proof**
   - Prove existing interfaces consume package-owned Protocol/BTD objects without regressing V29 Terminal transaction behavior.

10. **Gate 10: V30 Promotion Readiness**
    - Close local/staging proof, generated artifacts, V30 promotion workflow, and post-promotion V30 active / V31 draft posture.

## Gate 7 bridge-readiness research notes

Gate 7 keeps bridge work honest by making bridge candidates typed research
posture instead of latent implementation claims.
Taproot, BitVM, BSC/opBNB, Binance Web3 Wallet, and future distribution paths
are all represented as records with feasibility, risks, rereview triggers,
required proof, and required policy, but every record remains
`research_only`.

The accepted implementation is package-owned:
`packages/btd/src/bridge-readiness.ts` builds
`BridgeReadinessResearchPosture`; `packages/btd/src/api-boundaries.ts` wraps it
in a Terminal journal `proof_admission` settlement; and
`packages/api/src/routes/btd-crypto.ts` exposes the source-safe
`/btd/bridge-readiness-research` route.
No Gate 7 code may mint, wrap, transfer, settle, or unlock BTD through a bridge.
The only current chain-of-record posture is `bitcoin_btd_registry` plus
`no_bridge_chain_of_record`.

## Gate 8 Protocol telemetry notes

Gate 8 turns Protocol/BTD observability into package-owned typed telemetry
instead of leaving receipts, fee states, ledger projections, source-to-shares
proofs, and bridge-readiness posture as unrelated payload fragments.

The accepted implementation is `BtdProtocolTelemetryEnvelope` in
`packages/btd/src/telemetry.ts`. It contains source-safe telemetry records and
`BtdProtocolProofHook` rows that name theorem ids, replay step ids, witness
artifact paths, generated artifact paths, evidence roots, and telemetry roots.
The envelope is compatible with V32 provation and V35 documentation/
observability because it carries replayable source-safe proof facts without
requiring protected source.

Gate 8 rejects event/subject mismatches and secret-shaped metadata before a row
can reach Terminal, API, generated proof, or persistence surfaces. The API
boundary exposes `/btd/protocol-telemetry` as a JSON-safe proof-admission route;
it does not commit source-bearing artifacts, and it does not replace existing
crypto telemetry rows used for deployment readiness health. Gate 10 carries
that same source-safety rule into generated promotion artifacts.

## Gate 10 promotion-readiness notes

Gate 10 is the V30 promotion-control closure. It does not change the active
pointer directly; it makes the version branch ready for the V30 promotion
workflow to do so from a clean `version/v30` pull request into `main`.

The promotion-readiness implementation must validate four layers:

- local proof: every V30 gate checker, Protocol package checks, BTD package
  checks, pipeline package checks, UAPI route/Terminal tests, browser cockpit
  proof, pipeline readback, and protocol demonstration QA;
- generated proof: `.bitcode/v30-spec-family-report.json`,
  `.bitcode/v30-canonical-input-report.json`,
  `.bitcode/v30-canon-posture-drift-report.json`,
  `.bitcode/v30-protocol-telemetry-proof-hooks.json`, and
  `BITCODE_SPEC_V30_PROVEN.md`;
- workflow proof: gate-quality accepts V29/V30 draft state and V30/V31 promoted
  state, canon-quality accepts V30 after promotion, and
  `v30-canon-promotion.yml` commits the generated canon artifacts;
- staging-testnet readback: evidence is source-safe and names environment
  readiness, Terminal cockpit readback, ledger/database/object-storage
  reconciliation, package posture, and promotion dry-run status without
  committing secrets.

After promotion, runtime posture carriers must report V30 active and V31 as the
next draft target. V31's full draft family is opened by V31 Gate 1; V30 Gate 10
only prepares the post-promotion pointer and runtime posture.

## Gate 9 interface integration notes

Gate 9 makes interface reuse explicit. The accepted package shape is
`BtdInterfaceIntegrationRegressionProof` plus the browser-safe
`@bitcode/btd/interface-integration-contract` subpath. Terminal uses the
contract without importing storage-backed BTD entry points into the client.
API uses `buildBtdInterfaceIntegrationRegressionSettlement` and exposes
`/btd/interface-integration-regression` as a JSON-safe proof-admission route.
MCP and ChatGPT App expose small adapter records that name their package-owned
BTD object consumption.

The proof is not a new user journey. It is regression evidence that the V30
rails can be consumed by current interfaces without losing low-detail source
safety, reintroducing route-local BTD policy copies, or changing the selected
Terminal transaction behavior promoted in V29.

## Gate 1 working notes

Gate 1 is complete only when the V30 family exists, validates in draft mode over active V29, and makes the roadmap truthful enough to drive V31 through V37 without stale V27/V28/V29 posture.
Gate 1 does not implement Protocol/BTD product hardening; it creates the exact gate map, checks, and documentation needed to do that hardening safely.

## Non-goals during V30 opening

V30 must not redefine `$BTD` supply, BTC fee separation, AssetPack range identity, owner-read/licensed-read law, measureminting, or ancestry.
V30 must not absorb V31 Auxillaries expansion, V32 provation/testing depth, V33 interface depth, V34 deployment depth, or V35 telemetry/documenting depth except for narrow Protocol/BTD-owned hooks.
V30 must not absorb Exchange or website Conversations; those return beyond V35.

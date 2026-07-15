Promote Bitcode V27 tokenomics and crypto-commercial rails

Promotes the repository canon from V26 to V27 and closes the V27 `$BTD`
tokenomics and cryptographic-commercialization gate set.

V27 defines `$BTD` as a capped 21,000,000-cell non-fungible
source-share/read-right registry, with AssetPack ranges as the commercial
transfer object and BTC as the fee asset. It implements fixed-supply
measureminting decay, zero-cell/refit tail receipts, Read-Fit-Prove-Settle
mint admission, replayable mint receipts, contributor allocation, owner-read
versus licensed-read access, licensed-read revenue routing, and late-bound
non-supply ancestry.

Adds and proves the V27 crypto package/API/database surfaces:

- supply, semantic-volume, measuremint, range, receipt, replay, allocation,
  access, ancestry, revenue, wallet, BTC fee, ledger-anchor, Exchange,
  Terminal journal, reconciliation, telemetry, deployment-lane, and upgrade
  primitives under `packages/btd`;
- authenticated unversioned `/api/btd/*` route builders and Next route
  wrappers for registry, mint draft, read access, licensed-read revenue,
  ancestry review, BTC fee transactions, AssetPack ledger anchors, minimal
  AssetPack Exchange, Terminal journal, ledger/database reconciliation, and
  deployment readiness;
- V27 registry/projection migration and ORM boundary for supply state,
  semantic measurements, measuremint receipts, AssetPack ranges, cells,
  ownership events, read licenses, mint receipts, allocations, ancestry,
  revenue routes, BTC fee transactions, ledger anchors, Exchange orders,
  rights-transfer receipts, Terminal journal entries, reconciliation repairs,
  upgrade receipts, and crypto telemetry events;
- protocol-demonstration V27 receipt schemas and crypto primitive witness
  tests for semantic volume, measureminting, replay, access, BTC fees,
  ledger anchors, allocation, ancestry, revenue, reconciliation, and upgrades.

Closes the later V27 gates for practical cryptographic operation:

- wallet authorization proof and fail-closed signer sessions;
- BTC-only PSBT-style fee receipt lifecycle;
- Taproot-selected Bitcoin AssetPack anchor posture with explicit secondary
  Ethereum registry/event anchors;
- BTC-priced buy/sell/bid/ask, cancellation, acceptance, settlement, and
  ledger-anchored rights-transfer receipts;
- required Terminal transaction-family coverage and journal projection diffing;
- ledger/database reconciliation where confirmed/reorged/failed ledger facts
  override stale projections and private/metaphysical database facts remain
  hash-bound;
- deployment lanes for local, regtest, signet, public testnet, mainnet-ready,
  and mainnet-value-bearing configurations with approval-root gating;
- crypto telemetry classification and versioned protocol upgrade receipts.

Promotes the specification family:

- updates `BITCODE_SPEC.txt` to `V27`;
- updates `BITCODE_SPEC_V27.md`, DELTA, NOTES, and PARITY to promoted state;
- adds `BITCODE_SPEC_V27_PROVEN.md`;
- adds V27 Gate 16, crypto-library research, total-closure, and promotion
  review proof artifacts;
- binds official-source crypto research in
  `.docs/BITCODE_V27_CRYPTO_RESEARCH_REBINDING.md`.

Updates product and route surfaces:

- marks Terminal Read minting and minimal Exchange range acquisition as V27;
- adds unversioned `/btd/[assetPackId]` AssetPack range disclosure for range,
  access policy id/hash, read branch, proof root, and source manifest root;
- removes versioned UAPI API route paths and ports external-realization plus
  local-executor corridors to `/api/external-realization` and
  `/api/executors/[interfaceId]`;
- updates application/tests/protocol-demonstration route references.

Prepares V28 by adding `BITCODE_SPEC_V28_NOTES.md`, which defers the
promotion-tail findings that should not reopen V27: Terminal wallet UX,
regtest/signet broadcaster and observer rollout, generated DB type refresh,
Terminal journal/reconciliation productization, organization/read-license
usage, registry-derived MCP gates, access-policy/legal templates, historical
V26/V24 documentation cleanup, GitHub-only VCS readiness disclosure with
broader provider rollout staged for V30, and broader Exchange depth for V29.

Validation:

- `pnpm -C packages/api build`
- `pnpm -C packages/orm build`
- `pnpm -C protocol-demonstration test:v27-crypto`
- `node --test --test-force-exit protocol-demonstration/test/api.test.js`
- focused package/API Jest: 62 tests
- focused ORM Jest: 3 tests
- focused UAPI external-realization route Jest: 2 tests
- `pnpm -C apps/uapi build`
- `jq empty .proofs/v27/*.json .proofs/_shared/environment-mode-coherence-proof.json`
- `find apps/uapi/app/api -path '*v[0-9]*' -print | sort`
- `git diff --check`

Value-bearing mainnet launch remains separately gated by operational approval.

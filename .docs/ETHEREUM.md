# Ethereum in Bitcode

**Role:** EVM settlement **token law** for commercial read settle via a dual-maintained
**BitcodeERC1155** (fungible BTD + AssetPack co-ownership NFTs), plus optional
**ledger-anchor** commitment posture on Ethereum networks (e.g. Sepolia research /
registry events). Bitcoin remains the fee rail; Ethereum is not the primary
product UX host.

Related: [`packages/btd/README.md`](../packages/btd/README.md),
[`ASSET_PACKS.md`](./ASSET_PACKS.md), active SPEC under `.specifications/`.

---

## 1. Settlement token law (BitcodeERC1155)

Commercial **read settle** uses a **single ERC1155** contract family:

| Token | ID | Kind | Cap / behavior |
| --- | --- | --- | --- |
| **BTD (Bitcode)** | `0` | Fungible | Max **21,000,000** whole tokens (18 decimals). Minted from **needinesses-only** weighted scalar after BTC settle → master, then transferred to buyer. |
| **AssetPack** | `≥ 1` | NFT co-ownership | Add-only co-owners; depositor retains; burn forbidden. |

### Dual maintain (not codegen)

| Path | Language | Role |
| --- | --- | --- |
| `packages/btd/contracts/BitcodeERC1155.sol` | Solidity | On-chain deployable contract: supply cap, mint-to-master, settle-to-buyer, add-only co-own, burn ban |
| `packages/btd/src/erc1155/` | TypeScript | Executable mirror + needinesses mint math for tests, receipts, pipelines without solc |

**Package export:** `@bitcode/btd` / `@bitcode/btd/erc1155`

| TS module | Role |
| --- | --- |
| `bitcode-erc1155.ts` | State machine: mint / transfer / co-own |
| `settlement-btd-from-needinesses.ts` | Off-chain amount: needinesses-weighted scalar × 10¹⁸ |
| `types.ts` | Token identity, event kinds (`btd.erc1155.*`, `asset-pack.erc1155.co-own`) |
| `__tests__/bitcode-erc1155.test.ts` | Unit coverage of the mirror |

**Why dual:** product runs in Node/Next; chain runs under EVM. Needinesses
weighting is off-chain; Solidity enforces supply/transfers only. Do not treat
`contracts/` as build output of `src/erc1155/`—edit both when token law changes.

**Pipeline consumer:** `@bitcode/asset-packs-pipelines-execution-pipeline-simple-settle-asset-pack`
(and related settle/read product paths).

---

## 2. Ledger chain taxonomy

From `packages/btd/src/constants.ts`:

```ts
LEDGER_CHAINS = ['bitcoin', 'ethereum', 'bitcode-internal-ledger']
```

Networks include research/staging labels such as **`sepolia`** among Bitcoin and
internal ledger networks.

### Ledger anchors

`packages/btd/src/ledger-anchor.ts`:

- `chain: 'ethereum'` requires / defaults commitment method when anchoring.
- Commitment methods include **`ethereum_registry_event`** (alongside Bitcoin
  methods and `internal_journal`).
- ORM data-health checks validate `commitment_method` includes
  `ethereum_registry_event`.

Tests: `packages/btd/__tests__/v27-crypto-primitives.test.ts` (ethereum + sepolia
+ `ethereum_registry_event` fixtures).

**Important:** bridge-readiness research (Taproot, BitVM, BSC/opBNB, Web3
wallets, etc.) is documented in BTD as **research-only** and must not become
current `$BTD` chain-of-record without explicit future proof and policy.

---

## 3. Product surfaces that consume ERC1155 law

| Area | How Ethereum law appears |
| --- | --- |
| **Reads settle** | Settlement receipts / rights delivery project BTD mint + AssetPack co-own via TS mirror before/without live deploy |
| **Packs** | Activity/detail may show settlement/token posture sourced from BTD packages |
| **API** | BTD crypto routes under `packages/api` / `apps/uapi/app/api/btd/*` for journal, mint, rights—token math from `@bitcode/btd` |
| **Journal** | BTD journal entries can reference proof/settlement roots tied to token ops |

Live chain RPC deployment of `BitcodeERC1155.sol` is operationally separate from
the always-on product path that uses the TypeScript mirror for fail-closed
receipts.

---

## 4. Wallet UI: do not confuse chains

`apps/uapi/app/tps/README.md` (and wallet authorize flow):

- Browser wallet proof returns an authorization code toward **Supabase** session.
- **`window.ethereum` is never treated as a Bitcoin wallet.**

Bitcoin fee/PSBT paths live in BTD wallet/BTC modules; Ethereum injection is
out of band for BTC fee rails.

---

## 5. What is **not** Ethereum usage

| Topic | Owner |
| --- | --- |
| Postgres / auth / Storage | Supabase (`SUPABASE.md`) |
| Next deploy / Sandbox VMs / Blob / Analytics | Vercel (`VERCEL.md`) |
| BTC fees, PSBT, Taproot fee rails | `packages/btd` Bitcoin primitives |
| Internal journal-only projection | `bitcode-internal-ledger` chain id |

---

## 6. Environment / deploy notes

There is **no** single monorepo-wide “Ethereum RPC env” required for ordinary
local product work—the TS mirror is enough for unit tests and projected settle.

When deploying the Solidity contract (operator-owned):

- Configure network RPC, deployer keys, and verification **outside** casual app
  `.env` templates unless a dedicated deploy path is admitted.
- Keep chain addresses / deployment receipts out of source-safe public proofs
  unless SPEC explicitly allows them.
- Align any on-chain address config with dual-maintain review of
  `BitcodeERC1155.sol` ↔ `src/erc1155/`.

---

## 7. Maintenance checklist

When changing Ethereum settlement law:

1. Update **both** `packages/btd/contracts/BitcodeERC1155.sol` and
   `packages/btd/src/erc1155/*`.
2. Keep needinesses → amount formula only in TS (+ SPEC).
3. Extend unit tests (`bitcode-erc1155.test.ts`, crypto primitives).
4. Revisit settle pipeline consumers and API serializers.
5. Do not reintroduce product cockpit as the place to “view Ethereum”; use
   Packs/Reads/BTD package surfaces.

### Quick test

```bash
pnpm --filter @bitcode/btd exec jest --config jest.config.cjs --runInBand \
  __tests__/bitcode-erc1155.test.ts
```

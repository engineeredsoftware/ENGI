# Ethereum in Bitcode

**Role:** Primary chain for commercial settlement:

- **BitcodeERC1155** — fungible **BTD** (earn on settle) + **AssetPack** co-ownership NFTs  
- Buyers **pay ETH** (on-chain) or **BTC / SOL** (attested external rails) at **spot vs BTD**  
- **Never pay in BTD**; depositors **earn BTD** via mint on settle  

Related: [`packages/btd/README.md`](../packages/btd/README.md),
[`packages/btd/contracts/README.md`](../packages/btd/contracts/README.md),
active SPEC under `.specifications/`.

---

## 1. Settlement token law (BitcodeERC1155)

| Token | ID | Kind | Cap / behavior |
| --- | --- | --- | --- |
| **BTD (Bitcode)** | `0` | Fungible | Max **21,000,000** whole tokens (18 decimals). Minted on settle to depositor **btdBps** slices only. Freely transferable (external markets). |
| **AssetPack** | `≥ 1` | NFT co-ownership | Add-only co-owners; depositor retains; burn forbidden. |

### Pay rails

| Rail | On-chain | Notes |
| --- | --- | --- |
| **ETH** | `settleReadWithEth{value}` | Atomic pay + mint + co-own |
| **BTC** | `settleReadWithExternalPay` + attestor proof | Payment observed off-chain |
| **SOL** | same | Payment observed off-chain |

### BTD Volume

```
rawV = floor(needFitVolume × 10^18)     // needinesses *-fit only
V    = floor(rawV × decay)              // residual 21M supply decay
// Absolutes never set V
```

Depositor payout: `btdBps` (mint, 0 fee) + `coinBps` (external coin, `coinFeeBps` fee) = 10000.  
Unchosen BTD is **not minted**.

### Dual maintain (not codegen)

| Path | Language | Role |
| --- | --- | --- |
| `packages/btd/contracts/BitcodeERC1155.sol` | Solidity | Deployable contract |
| `packages/btd/src/erc1155/` | TypeScript | Mirror + needinesses + decay + spot math |

**Package export:** `@bitcode/btd` / `@bitcode/btd/erc1155`

| TS module | Role |
| --- | --- |
| `bitcode-erc1155.ts` | `finalizeSettle`, co-own, BTD transfer |
| `settlement-btd-from-needinesses.ts` | rawV from needinesses |
| `decay.ts` | residual supply decay |
| `spot-quote.ts` | ETH/BTC/SOL pay amounts (mock default) |
| `types.ts` | Quote, SharePayout, PayAsset |

**Pipeline:** `@bitcode/asset-packs-pipelines-execution-pipeline-simple-settle-asset-pack`

---

## 2. Spot / FX quoting

Buy UI shows three options with **spot vs BTD**. Server signs `payAmount`; browser never authors rates.

| Mode | Env | Use |
| --- | --- | --- |
| **mock** | `BITCODE_SPOT_PROVIDER=mock` (default testnet/CI) | Deterministic fixtures; real EIP-712 path |
| **http** | CoinGecko/CMC/exchange REST | Production-shaped adapter |
| **chainlink** | Aggregator feeds + BTD reference/TWAP | Optional on-chain USD legs |

Access checklist (testnet mock needs only RPC + deploy keys + operator signer):

- Sepolia RPC, `BITCODE_ERC1155_ADDRESS`, quote signer / payment attestor keys  
- Optional: spot HTTP API key, Chainlink feed addresses, BTD/WETH pool  

See plan section “Spot / FX quoting” and `spot-quote.ts` header for full env list.

---

## 3. Wallets

- **Product identity:** popular **Ethereum** wallets (MetaMask, WalletConnect, Coinbase, Rainbow) via Auxillaries Wallet  
- **BTC / SOL:** pay rails only (not Auxillaries identity in P0)  
- SIWE / domain message for Supabase session; no server custody  

---

## 4. What is **not** Ethereum usage

| Topic | Owner |
| --- | --- |
| Postgres / auth / Storage | Supabase |
| Next deploy | Vercel |
| Internal journal projection | `bitcode-internal-ledger` / BTD journal modules |

---

## 5. Maintenance checklist

1. Update **both** `BitcodeERC1155.sol` and `src/erc1155/*`.  
2. Needinesses → rawV only in TS; decay + spot off-chain; Solidity enforces signed quote + cap.  
3. Extend unit tests (`bitcode-erc1155.test.ts`) and settle pipeline tests.  
4. Revisit settle consumers and API serializers.  
5. Keep Auxillaries Wallet Ethereum-first.

### Quick test

```bash
pnpm --filter @bitcode/btd exec jest --config jest.config.cjs --runInBand \
  __tests__/bitcode-erc1155.test.ts
pnpm --filter @bitcode/asset-packs-pipelines-execution-pipeline-simple-settle-asset-pack test
```

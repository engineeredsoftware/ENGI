# BitcodeERC1155

Single multi-token contract for commercial settle on Ethereum:

| Token | ID | Kind | Law |
| --- | --- | --- | --- |
| **BTD (Bitcode)** | `0` | Fungible | Max **21,000,000** whole tokens (18 decimals). **Minted only on settle** to depositor BTD payout slices. Freely transferable (external markets). |
| **AssetPack** | `≥ 1` | NFT co-ownership | Depositor first; buyer **added** on settle; **burn forbidden**. |

## Economics

- **Never pay in BTD.** Buyers pay **ETH** (on-chain) or **BTC / SOL** (attested external rails) at spot vs BTD.
- **Always earn BTD** via mint on settle (depositors who elect `btdBps`).
- **BTD Volume V** = needinesses fits → rawV → **supply decay** (residual 21M). Absolutes never set V.
- Depositor split: `btdBps` (mint, 0 fee) + `coinBps` (external coin, `coinFeeBps` fee) = 10000.
- Unchosen BTD slice is **not minted**.

## Entry points

| Function | Rail |
| --- | --- |
| `settleReadWithEth(quote, opSig)` payable | ETH — `msg.value == quote.payAmount` |
| `settleReadWithExternalPay(quote, opSig, proof, payProofSig)` | BTC / SOL after attestor proof |
| `registerAssetPack` | Supply-side AP id (no BTD mint) |
| `safeTransferFrom` | **BTD only** (markets) |

Quotes and payment proofs are **EIP-712** signed (`settlementOperator` / `paymentAttestor`).

## Dual maintain (not generated)

| Path | Role |
| --- | --- |
| `packages/btd/contracts/BitcodeERC1155.sol` | On-chain deployable law |
| `packages/btd/src/erc1155/` | TS mirror + needinesses rawV + decay + spot math |

Edit **both** when settlement token law changes.

## Spot quotes (off-chain)

Testnet/CI: `BITCODE_SPOT_PROVIDER=mock` via `@bitcode/btd/erc1155` `MockSpotQuoteProvider`.  
Production-shaped: `http` / `chainlink` adapters + env (see plan / `.docs/ETHEREUM.md`).

## Deploy (testnet)

```text
solc >= 0.8.20
constructor(master, operator, attestor, coinFeeBps=250, "Bitcode", "BTD")
```

Env after deploy: `BITCODE_ERC1155_ADDRESS`, `BITCODE_ETHEREUM_RPC_URL`, `BITCODE_ETHEREUM_CHAIN_ID`.

## Tests

```bash
pnpm --filter @bitcode/btd exec jest --config jest.config.cjs --runInBand \
  __tests__/bitcode-erc1155.test.ts
```

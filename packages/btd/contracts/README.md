# BitcodeERC1155

Single multi-token contract for V48 settlement:

| Token | ID | Kind | Law |
| --- | --- | --- | --- |
| **BTD (Bitcode)** | `0` | Fungible | Max supply **21,000,000** whole tokens (18 decimals). Minted only after BTC settlement from **needinesses-weighted** scalar. Mint destination = **master** account; `settleBtdToBuyer` transfers to buyer. |
| **AssetPack** | `≥ 1` | NFT co-ownership | `registerAssetPack` mints depositor as first co-owner. `addAssetPackCoOwner` **adds** buyer; prior owners always retain. **Burn forbidden.** |

## Settlement pipeline (1:1 AssetPack : pipeline run)

SynthesizeRead produces **multiple** options. Each **bought** option starts its own `SettleAssetPacksSimplePipeline`:

1. `validate-settlement-readiness`
2. `settle-btc` — BTC-testnet payment observation / finality
3. `mint-btd` — needinesses-only weighted scalar → mint BTD to master
4. `settle-btd` — master → buyer BTD transfer
5. `settle-asset-pack` — ERC1155 add co-ownership
6. `ship-asset-pack-patch-pr` — open PR with `.patch` on read repo
7. `journal-and-pack-activity` — `/packs` row

## Needinesses → BTD mint amount

Off-chain (TypeScript authority for measurement):

```
weightedNeedinessesSum = Σ (w_i × clamp01(volume_i))   // needinesses only
needFitVolume          = weightedNeedinessesSum / Σ w_i
amountBaseUnits        = floor(needFitVolume × 10^18)
```

Absolutes **never** mint BTD. On-chain enforces supply cap and master destination.

## Behavior mirror (dual maintain — not generated)

Executable TypeScript mirror (tests + projected receipts):

`packages/btd/src/erc1155/`

**This `contracts/` tree is not auto-built from `src/erc1155/`.** Both are
hand-maintained sources of the same settlement token law. See
`packages/btd/README.md` § “Dual maintain” for why (chain vs Node runtime,
off-chain needinesses mint math, no silent codegen drift).

When changing mint/transfer/co-own/burn rules: update **both** this Solidity
and the TS mirror, then run `@bitcode/btd` erc1155 tests.

Deploy with `solc >= 0.8.20`. No OpenZeppelin dependency in-repo.

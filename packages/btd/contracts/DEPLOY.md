# BitcodeERC1155 testnet deploy scaffolding

## Prerequisites

- `solc` ≥ 0.8.20 **or** Foundry (`forge`)
- Funded Sepolia deployer key
- Operator + payment attestor addresses (can be same on testnet)
- Master/treasury payable address

## Env (app)

```bash
BITCODE_ETHEREUM_CHAIN_ID=11155111
BITCODE_ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/<key>
BITCODE_ERC1155_ADDRESS=0x…          # after deploy
BITCODE_QUOTE_SIGNER_KEY=0x…         # settlementOperator (server only)
BITCODE_PAYMENT_ATTESTOR_KEY=0x…     # optional; defaults to operator
BITCODE_SPOT_PROVIDER=mock           # testnet default
BITCODE_MASTER_ACCOUNT=0x…           # treasury
```

## Constructor

```text
BitcodeERC1155(
  payable masterAccount,
  settlementOperator,
  paymentAttestor,
  uint16 coinFeeBps,   // 250 = 2.5% (legacy coin-leg fee; seller finalize uses inverse split)
  "Bitcode",
  "BTD"
)
```

## Example (Foundry)

```bash
cd packages/btd/contracts
forge create BitcodeERC1155 \
  --rpc-url "$BITCODE_ETHEREUM_RPC_URL" \
  --private-key "$DEPLOYER_KEY" \
  --constructor-args \
    "$BITCODE_MASTER_ACCOUNT" \
    "$OPERATOR_ADDRESS" \
    "$ATTESTOR_ADDRESS" \
    250 \
    "Bitcode" \
    "BTD"
```

## Example (solc + cast)

```bash
solc --bin --abi --optimize -o out BitcodeERC1155.sol
# deploy with cast send --create …
```

## Smoke

1. Register AssetPack (operator): `registerAssetPack(key, depositor, metadataRoot)`
2. Build EIP-712 quote off-chain (needinesses → V, mock spot → payAmount ETH)
3. Buyer: `settleReadWithEth{value: payAmount}(quote, opSig)`
4. Product: seller finalizes BTD/ETH split via `/api/packs/payout/finalize` (projected until on-chain finalize is wired)

## Notes

- Testnet may run settle + payout as **projected** TS mirror while RPC is optional.
- Live ETH path requires funded buyer wallet on Sepolia and correct chain id in wallet UI.
- Do not commit private keys. Use Vercel/server env only.

# BitcodeERC1155 (Foundry)

On-chain multi-token for commercial settle:

| Token | ID | Kind |
| --- | --- | --- |
| BTD | `0` | Fungible (21M cap, 18 decimals) |
| AssetPack | `≥ 1` | Co-ownership NFT (add-only; burn forbidden) |

## Layout

```
src/BitcodeERC1155.sol
script/DeployBitcodeERC1155.s.sol
test/BitcodeERC1155.t.sol
foundry.toml
DEPLOY.md
```

Dual-maintain TS: `packages/btd/src/erc1155/`.

## Setup (once per clone)

```bash
cd packages/btd/contracts
forge install foundry-rs/forge-std
```

`lib/` is local (see `.gitignore`).

## Build / test

```bash
cd packages/btd/contracts
forge build
forge test -vv
```

## Deploy Sepolia

```bash
export BITCODE_ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
export BITCODE_DEPLOYER_PRIVATE_KEY=0x…
export BITCODE_MASTER_ACCOUNT=0x…
export BITCODE_SETTLEMENT_OPERATOR=0x…
export BITCODE_PAYMENT_ATTESTOR=$BITCODE_SETTLEMENT_OPERATOR
export BITCODE_COIN_FEE_BPS=250

cd packages/btd/contracts
forge script script/DeployBitcodeERC1155.s.sol:DeployBitcodeERC1155 \
  --rpc-url "$BITCODE_ETHEREUM_RPC_URL" \
  --broadcast \
  -vvvv
```

After deploy:

```bash
# App / server
BITCODE_ETHEREUM_CHAIN_ID=11155111
BITCODE_ETHEREUM_RPC_URL=…
BITCODE_ERC1155_ADDRESS=0x…          # printed by script
BITCODE_MASTER_ACCOUNT=0x…
BITCODE_QUOTE_SIGNER_KEY=0x…         # key for SETTLEMENT_OPERATOR
BITCODE_SPOT_PROVIDER=mock
```

Never commit private keys. Full runbook: `DEPLOY.md`.

## Smoke

1. `registerAssetPack` as operator  
2. EIP-712 quote + `settleReadWithEth{value}` as buyer  
3. Seller payout finalize via product API until on-chain finalize is wired  

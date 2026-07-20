# BitcodeERC1155 (Foundry)

On-chain multi-token for commercial settle:

| Token | ID | Kind |
| --- | --- | --- |
| BTD | `0` | Fungible (21M cap, 18 decimals) |
| AssetPack | `≥ 1` | Co-ownership NFT (add-only; burn forbidden) |

## Layout

```
src/BitcodeERC1155.sol       # contract
script/DeployBitcodeERC1155.s.sol
test/BitcodeERC1155.t.sol
foundry.toml
DEPLOY.md                    # env + smoke checklist
```

Dual-maintain TS mirror: `packages/btd/src/erc1155/`.

## Setup (once)

```bash
cd packages/btd/contracts
forge install foundry-rs/forge-std --no-commit
```

`lib/` is gitignored — each machine installs forge-std locally.

## Build / test

```bash
cd packages/btd/contracts
forge build
forge test -vv
```

## Deploy Sepolia

```bash
export BITCODE_ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/<key>
export PRIVATE_KEY=0x…                 # funded Sepolia deployer
export BITCODE_MASTER_ACCOUNT=0x…      # treasury (payable)
export BITCODE_SETTLEMENT_OPERATOR=0x… # quote signer address
# optional:
export BITCODE_PAYMENT_ATTESTOR=0x…   # defaults to operator
export BITCODE_COIN_FEE_BPS=250
export ETHERSCAN_API_KEY=…             # for --verify

forge script script/DeployBitcodeERC1155.s.sol:DeployBitcodeERC1155 \
  --rpc-url "$BITCODE_ETHEREUM_RPC_URL" \
  --broadcast \
  -vvvv
# add --verify when ETHERSCAN_API_KEY is set
```

After deploy, set app env:

```bash
BITCODE_ERC1155_ADDRESS=0x…   # printed by script
BITCODE_ETHEREUM_CHAIN_ID=11155111
BITCODE_SPOT_PROVIDER=mock
```

Never commit private keys.

## Smoke (post-deploy)

1. `registerAssetPack` as operator  
2. EIP-712 quote + `settleReadWithEth{value}` as buyer  
3. Seller finalize payout (product API projected until on-chain finalize is wired)  

See `DEPLOY.md`.

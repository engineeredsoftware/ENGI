# BitcodeERC1155 testnet deploy

## Prerequisites

- Foundry (`forge`, `cast`) — installed at `~/.foundry/bin`
- Funded **Sepolia** deployer key
- Addresses:
  - **master** — Bitcode treasury (receives residual ETH + escrow BTD until seller finalize)
  - **settlementOperator** — signs EIP-712 settle quotes (can be a dedicated EO A; server holds key)
  - **paymentAttestor** — BTC/SOL proofs later; set = operator on ETH-only testnet

## 1. Compile & unit test (local)

```bash
cd packages/btd/contracts
forge build
forge test -vv
```

## 2. Deploy Sepolia

```bash
export BITCODE_ETHEREUM_RPC_URL="https://sepolia.infura.io/v3/<KEY>"   # or Alchemy
export PRIVATE_KEY="0x…"                  # deployer; needs Sepolia ETH
export BITCODE_MASTER_ACCOUNT="0x…"       # treasury
export BITCODE_SETTLEMENT_OPERATOR="0x…"  # quote signer address
export BITCODE_PAYMENT_ATTESTOR="$BITCODE_SETTLEMENT_OPERATOR"
export BITCODE_COIN_FEE_BPS=250

cd packages/btd/contracts
forge script script/DeployBitcodeERC1155.s.sol:DeployBitcodeERC1155 \
  --rpc-url "$BITCODE_ETHEREUM_RPC_URL" \
  --broadcast \
  -vvvv
```

Optional verify:

```bash
export ETHERSCAN_API_KEY="…"
forge script script/DeployBitcodeERC1155.s.sol:DeployBitcodeERC1155 \
  --rpc-url "$BITCODE_ETHEREUM_RPC_URL" \
  --broadcast --verify -vvvv
```

Script logs:

```text
BitcodeERC1155: 0x…
Set app env: BITCODE_ERC1155_ADDRESS=0x…
```

Broadcast artifacts: `broadcast/DeployBitcodeERC1155.s.sol/<chainId>/`.

## 3. App / server env (after deploy)

```bash
BITCODE_ETHEREUM_CHAIN_ID=11155111
BITCODE_ETHEREUM_RPC_URL=…
BITCODE_ERC1155_ADDRESS=0x…          # from step 2
BITCODE_MASTER_ACCOUNT=0x…
BITCODE_QUOTE_SIGNER_KEY=0x…         # private key of settlementOperator (server only)
BITCODE_PAYMENT_ATTESTOR_KEY=0x…    # optional
BITCODE_SPOT_PROVIDER=mock
```

Wire into `apps/uapi` / Vercel env — **never commit keys**.

## 4. On-chain smoke (cast)

```bash
export C=$BITCODE_ERC1155_ADDRESS
export RPC=$BITCODE_ETHEREUM_RPC_URL

# views
cast call $C "name()(string)" --rpc-url $RPC
cast call $C "symbol()(string)" --rpc-url $RPC
cast call $C "BTD_MAX_SUPPLY()(uint256)" --rpc-url $RPC
cast call $C "remainingMintable()(uint256)" --rpc-url $RPC

# register AssetPack (as operator)
cast send $C "registerAssetPack(bytes32,address,string)" \
  $(cast --format-bytes32-string "demo-pack-1") \
  $DEPOSITOR_ADDRESS \
  "meta:demo" \
  --rpc-url $RPC --private-key $OPERATOR_KEY
```

Full settle (`settleReadWithEth`) needs a correctly EIP-712-signed `Quote` from the TS dual-maintain / quote service — do not hand-roll hashes in cast without the same domain + typehash as the contract.

## 5. Product path today

| Step | Live chain | Projected (works without deploy) |
| --- | --- | --- |
| Needinesses → V + decay | off-chain | TS `erc1155` |
| Spot ETH/BTC/SOL | off-chain mock | `spot-quote` |
| Escrow mint + co-own | `settleReadWithEth` | settle pipeline `finalizeSettle` |
| Seller BTD/ETH slider | future on-chain finalize | `POST /api/packs/payout/finalize` |

Until the app builds and submits the signed quote + `eth_sendTransaction`, use **projected settle** for product QA; deploy still proves the contract is on Sepolia and register/views work.

## Security

- Deployer ≠ necessarily operator; operator key must stay off client bundles.
- Buyer pays only via `settleReadWithEth` (bare ETH reverts).
- Do not use mainnet keys/RPC for this scaffolding.

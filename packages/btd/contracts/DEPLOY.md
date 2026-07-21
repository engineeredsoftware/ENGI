# BitcodeERC1155 testnet deploy

## Prerequisites

- Foundry (`forge`, `cast`) — e.g. `~/.foundry/bin` on PATH
- Funded **Sepolia** deployer wallet
- Sepolia **RPC URL** (Infura / Alchemy / …)
- Role addresses (can be one EOA on a simple testnet):

| Env | Role |
| --- | --- |
| `BITCODE_DEPLOYER_PRIVATE_KEY` | Pays gas to deploy (secret) |
| `BITCODE_MASTER_ACCOUNT` | Treasury address (payable) |
| `BITCODE_SETTLEMENT_OPERATOR` | On-chain quote signer **address** |
| `BITCODE_PAYMENT_ATTESTOR` | BTC/SOL proofs later; usually = operator |

## 1. Compile & unit test

```bash
cd packages/btd/contracts
forge install foundry-rs/forge-std   # once per clone
forge build
forge test -vv
```

## 2. Deploy-only shell env

```bash
export BITCODE_ETHEREUM_RPC_URL="https://sepolia.infura.io/v3/YOUR_PROJECT_ID"
export BITCODE_DEPLOYER_PRIVATE_KEY="0x…"

export BITCODE_MASTER_ACCOUNT="0x…"
export BITCODE_SETTLEMENT_OPERATOR="0x…"
export BITCODE_PAYMENT_ATTESTOR="$BITCODE_SETTLEMENT_OPERATOR"
export BITCODE_COIN_FEE_BPS=250

# optional Etherscan verify
export ETHERSCAN_API_KEY="…"
```

Same-wallet testnet shortcut:

```bash
export BITCODE_DEPLOYER_PRIVATE_KEY="0x…"
export ADDR=$(cast wallet address --private-key "$BITCODE_DEPLOYER_PRIVATE_KEY")
export BITCODE_MASTER_ACCOUNT="$ADDR"
export BITCODE_SETTLEMENT_OPERATOR="$ADDR"
export BITCODE_PAYMENT_ATTESTOR="$ADDR"
```

Check deployer balance:

```bash
cast balance "$(cast wallet address --private-key "$BITCODE_DEPLOYER_PRIVATE_KEY")" \
  --rpc-url "$BITCODE_ETHEREUM_RPC_URL"
```

## 3. Broadcast

```bash
cd packages/btd/contracts

forge script script/DeployBitcodeERC1155.s.sol:DeployBitcodeERC1155 \
  --rpc-url "$BITCODE_ETHEREUM_RPC_URL" \
  --broadcast \
  -vvvv
```

With verify:

```bash
forge script script/DeployBitcodeERC1155.s.sol:DeployBitcodeERC1155 \
  --rpc-url "$BITCODE_ETHEREUM_RPC_URL" \
  --broadcast \
  --verify \
  -vvvv
```

Copy from logs:

```text
BitcodeERC1155: 0x…
Set app env: BITCODE_ERC1155_ADDRESS=0x…
```

```bash
export BITCODE_ERC1155_ADDRESS="0x…"
```

Artifacts (gitignored): `broadcast/DeployBitcodeERC1155.s.sol/11155111/`.

## 4. App / server env (after deploy)

Do **not** put the deployer key in the app if deploy is finished.

```bash
# Network + contract
BITCODE_ETHEREUM_CHAIN_ID=11155111
BITCODE_ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
BITCODE_ERC1155_ADDRESS=0x…              # from step 3
BITCODE_MASTER_ACCOUNT=0x…
BITCODE_SPOT_PROVIDER=mock

# Server-only (never NEXT_PUBLIC_*)
BITCODE_QUOTE_SIGNER_KEY=0x…             # private key of SETTLEMENT_OPERATOR
# BITCODE_PAYMENT_ATTESTOR_KEY=0x…      # optional; ETH-only testnet can omit
```

Restart Next / redeploy after saving.

## 5. On-chain smoke (cast)

```bash
export C="$BITCODE_ERC1155_ADDRESS"
export RPC="$BITCODE_ETHEREUM_RPC_URL"

cast call "$C" "name()(string)" --rpc-url "$RPC"
cast call "$C" "symbol()(string)" --rpc-url "$RPC"
cast call "$C" "remainingMintable()(uint256)" --rpc-url "$RPC"
cast call "$C" "masterAccount()(address)" --rpc-url "$RPC"
cast call "$C" "settlementOperator()(address)" --rpc-url "$RPC"
```

Register a pack as operator (operator key = signer for `SETTLEMENT_OPERATOR`):

```bash
export OPERATOR_KEY="$BITCODE_QUOTE_SIGNER_KEY"   # or deployer key if same wallet
export DEPOSITOR_ADDRESS="0x…"

cast send "$C" "registerAssetPack(bytes32,address,string)" \
  $(cast keccak "demo-pack-1") \
  "$DEPOSITOR_ADDRESS" \
  "meta:demo" \
  --rpc-url "$RPC" \
  --private-key "$OPERATOR_KEY"
```

Full `settleReadWithEth` needs an EIP-712 quote from the dual-maintain quote path — do not hand-roll hashes in cast without matching domain/typehash.

## 6. Product path

| Step | Live chain | Projected |
| --- | --- | --- |
| Needinesses → V + decay | off-chain | TS `@bitcode/btd/erc1155` |
| Spot ETH/BTC/SOL | off-chain mock | `BITCODE_SPOT_PROVIDER=mock` |
| Escrow mint + co-own | `settleReadWithEth` | settle pipeline |
| Seller BTD/ETH slider | future on-chain | `POST /api/packs/payout/finalize` |

## Security

- Never commit keys or paste them into tracked files.
- `BITCODE_DEPLOYER_PRIVATE_KEY` = deploy shell only.
- `BITCODE_QUOTE_SIGNER_KEY` = server only; not the browser.
- Sepolia only for this scaffold; no mainnet value claims.

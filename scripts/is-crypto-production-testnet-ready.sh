#!/usr/bin/env bash
# =============================================================================
# scripts/is-crypto-production-testnet-ready.sh
#
# Bitcode monorepo: progress board for crypto testnet readiness
# (BTD / ERC1155 / settle / payout). Re-run as work lands. Does not print secrets.
#
# Usage (from monorepo root or any cwd):
#   ./scripts/is-crypto-production-testnet-ready.sh
#   pnpm run crypto:testnet-ready
#   BITCODE_ROOT=/path/to/bitcode ./scripts/is-crypto-production-testnet-ready.sh
#   ./scripts/is-crypto-production-testnet-ready.sh --full     # forge + jest
#   ./scripts/is-crypto-production-testnet-ready.sh --onchain  # cast RPC checks
#   ./scripts/is-crypto-production-testnet-ready.sh --json
#
# Optional env (also loaded from apps/uapi/.env.local if present):
#   BITCODE_ETHEREUM_RPC_URL, BITCODE_ERC1155_ADDRESS, BITCODE_MASTER_ACCOUNT,
#   BITCODE_SETTLEMENT_OPERATOR, BITCODE_QUOTE_SIGNER_KEY (presence only),
#   BITCODE_DEPLOYER_PRIVATE_KEY (presence only), BITCODE_SPOT_PROVIDER
# =============================================================================

set -uo pipefail

FULL=0
ONCHAIN=0
JSON=0
for arg in "$@"; do
  case "$arg" in
    --full) FULL=1 ;;
    --onchain) ONCHAIN=1 ;;
    --json) JSON=1 ;;
    -h|--help)
      sed -n '2,24p' "$0"
      exit 0
      ;;
  esac
done

# --- colors (TTY only) -------------------------------------------------------
if [[ -t 1 && "$JSON" -eq 0 ]]; then
  C_OK=$'\033[32m'
  C_BAD=$'\033[31m'
  C_WARN=$'\033[33m'
  C_DIM=$'\033[2m'
  C_BOLD=$'\033[1m'
  C_RST=$'\033[0m'
else
  C_OK=; C_BAD=; C_WARN=; C_DIM=; C_BOLD=; C_RST=
fi

# --- resolve monorepo root ---------------------------------------------------
# Prefer: BITCODE_ROOT env → directory containing this script/../ → walk cwd
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BITCODE_ROOT="${BITCODE_ROOT:-}"
if [[ -z "$BITCODE_ROOT" || ! -d "$BITCODE_ROOT/packages/btd" ]]; then
  candidate="$(cd "$SCRIPT_DIR/.." && pwd)"
  if [[ -d "$candidate/packages/btd" ]]; then
    BITCODE_ROOT="$candidate"
  fi
fi
if [[ -z "${BITCODE_ROOT:-}" || ! -d "$BITCODE_ROOT/packages/btd" ]]; then
  probe="${PWD:-.}"
  while [[ "$probe" != "/" ]]; do
    if [[ -d "$probe/packages/btd" ]]; then
      BITCODE_ROOT="$probe"
      break
    fi
    probe="$(dirname "$probe")"
  done
fi
if [[ -z "${BITCODE_ROOT:-}" || ! -d "$BITCODE_ROOT/packages/btd" ]]; then
  printf 'error: cannot find Bitcode monorepo (packages/btd). Set BITCODE_ROOT.\n' >&2
  exit 2
fi

CONTRACTS="$BITCODE_ROOT/packages/btd/contracts"
ERC1155_TS="$BITCODE_ROOT/packages/btd/src/erc1155"
SETTLE_PKG="$BITCODE_ROOT/packages/asset-packs-pipelines/settle"
UAPI="$BITCODE_ROOT/apps/uapi"

# --- load .env.local safely (export KEY=VAL only; no print) ------------------
load_env_file() {
  local f="$1"
  [[ -f "$f" ]] || return 0
  while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line%%#*}"
    line="$(echo "$line" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
    [[ -z "$line" ]] && continue
    if [[ "$line" =~ ^([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
      local k="${BASH_REMATCH[1]}"
      local v="${BASH_REMATCH[2]}"
      v="${v%\"}"; v="${v#\"}"
      v="${v%\'}"; v="${v#\'}"
      # only Bitcode crypto keys — do not clobber whole shell
      case "$k" in
        BITCODE_*|ETHERSCAN_API_KEY|PRIVATE_KEY)
          export "$k=$v"
          ;;
      esac
    fi
  done < "$f"
}

load_env_file "$UAPI/.env.local"
load_env_file "$BITCODE_ROOT/.env.local"
load_env_file "$CONTRACTS/.env"

PASS=0
FAIL=0
WARN=0
declare -a PASSED=()
declare -a FAILED=()
declare -a WARNINGS=()
declare -a REMAINING=()

ok() {
  PASS=$((PASS + 1))
  PASSED+=("$1")
  if [[ "$JSON" -eq 0 ]]; then
    printf '  %s✓%s %s\n' "$C_OK" "$C_RST" "$1"
  fi
}

bad() {
  FAIL=$((FAIL + 1))
  FAILED+=("$1")
  REMAINING+=("$1")
  if [[ "$JSON" -eq 0 ]]; then
    printf '  %s✗%s %s\n' "$C_BAD" "$C_RST" "$1"
  fi
}

warn() {
  WARN=$((WARN + 1))
  WARNINGS+=("$1")
  REMAINING+=("~$1")
  if [[ "$JSON" -eq 0 ]]; then
    printf '  %s!%s %s\n' "$C_WARN" "$C_RST" "$1"
  fi
}

section() {
  if [[ "$JSON" -eq 0 ]]; then
    printf '\n%s%s%s\n' "$C_BOLD" "$1" "$C_RST"
  fi
}

has_cmd() { command -v "$1" >/dev/null 2>&1; }

env_set_nonempty() {
  local n="$1"
  local v="${!n:-}"
  [[ -n "$v" && "$v" != "0x…" && "$v" != "0xYOUR"* && "$v" != *"YOUR_"* && "$v" != *"<"* ]]
}

looks_like_address() {
  [[ "${1:-}" =~ ^0x[a-fA-F0-9]{40}$ ]]
}

looks_like_key() {
  [[ "${1:-}" =~ ^0x[a-fA-F0-9]{64}$ ]]
}

# --- header ------------------------------------------------------------------
if [[ "$JSON" -eq 0 ]]; then
  printf '%sBitcode crypto testnet readiness%s\n' "$C_BOLD" "$C_RST"
  printf '%srepo%s  %s\n' "$C_DIM" "$C_RST" "$BITCODE_ROOT"
  printf '%sdate%s  %s\n' "$C_DIM" "$C_RST" "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  printf '%sflags%s full=%s onchain=%s\n' "$C_DIM" "$C_RST" "$FULL" "$ONCHAIN"
fi

# =============================================================================
# 1. Repository surface
# =============================================================================
section "1. Repository surface"

if [[ -d "$BITCODE_ROOT/packages/btd" ]]; then
  ok "BITCODE_ROOT resolves (packages/btd present)"
else
  bad "BITCODE_ROOT missing packages/btd — set BITCODE_ROOT=/path/to/bitcode"
fi

[[ -f "$CONTRACTS/src/BitcodeERC1155.sol" ]] \
  && ok "Solidity BitcodeERC1155.sol" \
  || bad "Missing contracts/src/BitcodeERC1155.sol"

[[ -f "$CONTRACTS/script/DeployBitcodeERC1155.s.sol" ]] \
  && ok "Deploy script DeployBitcodeERC1155.s.sol" \
  || bad "Missing deploy script"

[[ -f "$CONTRACTS/foundry.lock" ]] \
  && ok "foundry.lock tracked (deps pin)" \
  || bad "Missing foundry.lock"

[[ -f "$CONTRACTS/foundry.toml" ]] \
  && ok "foundry.toml" \
  || bad "Missing foundry.toml"

[[ -f "$CONTRACTS/DEPLOY.md" ]] \
  && ok "DEPLOY.md runbook" \
  || warn "DEPLOY.md missing"

for f in bitcode-erc1155.ts decay.ts spot-quote.ts payout-split.ts settlement-btd-from-needinesses.ts types.ts; do
  [[ -f "$ERC1155_TS/$f" ]] \
    && ok "TS dual-maintain erc1155/$f" \
    || bad "Missing erc1155/$f"
done

[[ -f "$SETTLE_PKG/src/index.ts" ]] \
  && ok "Settle pipeline package" \
  || bad "Missing settle pipeline"

[[ -f "$UAPI/app/api/read/settle/route.ts" ]] \
  && ok "API POST /api/read/settle" \
  || bad "Missing /api/read/settle"

[[ -f "$UAPI/app/api/read/settle/quote/route.ts" ]] \
  && ok "API POST /api/read/settle/quote" \
  || bad "Missing /api/read/settle/quote"

[[ -f "$UAPI/app/api/packs/payout/finalize/route.ts" ]] \
  && ok "API packs payout finalize" \
  || bad "Missing /api/packs/payout/finalize"

[[ -f "$BITCODE_ROOT/packages/auth/src/ethereum-wallet-client.ts" ]] \
  && ok "Ethereum wallet client" \
  || bad "Missing ethereum-wallet-client.ts"

if [[ -f "$BITCODE_ROOT/packages/auth/package.json" ]] \
  && grep -q 'ethereum-wallet-client' "$BITCODE_ROOT/packages/auth/package.json"; then
  ok "auth package exports ethereum-wallet-client"
else
  bad "auth package.json missing ethereum-wallet-client export"
fi

if grep -q 'BITCODE_DEPLOYER_PRIVATE_KEY' "$CONTRACTS/script/DeployBitcodeERC1155.s.sol" 2>/dev/null; then
  ok "Deploy script uses BITCODE_DEPLOYER_PRIVATE_KEY"
else
  bad "Deploy script still expects bare PRIVATE_KEY (or missing)"
fi

# Tokenomics cues in sources (soft correctness signals)
if grep -q 'settleReadWithEth' "$CONTRACTS/src/BitcodeERC1155.sol" 2>/dev/null; then
  ok "Contract exposes settleReadWithEth"
else
  bad "Contract missing settleReadWithEth"
fi

if grep -q 'finalizeSellerPayout\|computePayoutSplit' "$ERC1155_TS/bitcode-erc1155.ts" "$ERC1155_TS/payout-split.ts" 2>/dev/null; then
  ok "TS seller payout split present"
else
  bad "TS seller payout finalize/split missing"
fi

if grep -q 'applyBtdSupplyDecay' "$ERC1155_TS/decay.ts" 2>/dev/null; then
  ok "TS supply decay present"
else
  bad "TS supply decay missing"
fi

# =============================================================================
# 2. Tooling
# =============================================================================
section "2. Tooling"

export PATH="${HOME}/.foundry/bin:${PATH}"

if has_cmd forge; then ok "forge available ($(forge --version 2>/dev/null | head -1))"
else bad "forge not on PATH"; fi

if has_cmd cast; then ok "cast available"
else bad "cast not on PATH"; fi

if has_cmd pnpm; then ok "pnpm available"
else warn "pnpm not on PATH (TS tests skipped even with --full)"; fi

# forge-std install state
if [[ -f "$CONTRACTS/lib/forge-std/src/Test.sol" ]]; then
  ok "lib/forge-std installed locally"
else
  warn "lib/forge-std missing — run: cd packages/btd/contracts && forge install foundry-rs/forge-std@v1.16.2 --no-git"
fi

# =============================================================================
# 3. Environment configuration (presence / shape only)
# =============================================================================
section "3. Environment (no secrets printed)"

if env_set_nonempty BITCODE_ETHEREUM_RPC_URL; then
  ok "BITCODE_ETHEREUM_RPC_URL set"
else
  bad "BITCODE_ETHEREUM_RPC_URL unset or placeholder"
fi

if env_set_nonempty BITCODE_ERC1155_ADDRESS && looks_like_address "${BITCODE_ERC1155_ADDRESS:-}"; then
  ok "BITCODE_ERC1155_ADDRESS looks valid (0x…40)"
elif env_set_nonempty BITCODE_ERC1155_ADDRESS; then
  bad "BITCODE_ERC1155_ADDRESS set but not a 40-hex address"
else
  bad "BITCODE_ERC1155_ADDRESS unset — deploy first"
fi

if env_set_nonempty BITCODE_MASTER_ACCOUNT && looks_like_address "${BITCODE_MASTER_ACCOUNT:-}"; then
  ok "BITCODE_MASTER_ACCOUNT address set"
else
  bad "BITCODE_MASTER_ACCOUNT unset or invalid"
fi

if env_set_nonempty BITCODE_SETTLEMENT_OPERATOR && looks_like_address "${BITCODE_SETTLEMENT_OPERATOR:-}"; then
  ok "BITCODE_SETTLEMENT_OPERATOR address set"
else
  bad "BITCODE_SETTLEMENT_OPERATOR unset or invalid"
fi

# secrets: presence only
if env_set_nonempty BITCODE_QUOTE_SIGNER_KEY; then
  if looks_like_key "${BITCODE_QUOTE_SIGNER_KEY:-}"; then
    ok "BITCODE_QUOTE_SIGNER_KEY present (shape OK)"
  else
    warn "BITCODE_QUOTE_SIGNER_KEY present but shape unexpected"
  fi
else
  warn "BITCODE_QUOTE_SIGNER_KEY unset (needed for live EIP-712 quotes)"
fi

if env_set_nonempty BITCODE_DEPLOYER_PRIVATE_KEY; then
  ok "BITCODE_DEPLOYER_PRIVATE_KEY present in env (deploy shell)"
else
  warn "BITCODE_DEPLOYER_PRIVATE_KEY not in env (only needed when deploying)"
fi

SPOT="${BITCODE_SPOT_PROVIDER:-}"
if [[ -z "$SPOT" ]]; then
  warn "BITCODE_SPOT_PROVIDER unset (default mock recommended for testnet)"
elif [[ "$SPOT" == "mock" || "$SPOT" == "http" || "$SPOT" == "chainlink" ]]; then
  ok "BITCODE_SPOT_PROVIDER=$SPOT"
else
  warn "BITCODE_SPOT_PROVIDER=$SPOT (expected mock|http|chainlink)"
fi

CHAIN="${BITCODE_ETHEREUM_CHAIN_ID:-}"
if [[ "$CHAIN" == "11155111" ]]; then
  ok "BITCODE_ETHEREUM_CHAIN_ID=11155111 (Sepolia)"
elif [[ -n "$CHAIN" ]]; then
  warn "BITCODE_ETHEREUM_CHAIN_ID=$CHAIN (expected 11155111 for Sepolia testnet)"
else
  warn "BITCODE_ETHEREUM_CHAIN_ID unset (use 11155111 for Sepolia)"
fi

# =============================================================================
# 4. On-chain (cast) — if address+rpc and --onchain or auto when both set
# =============================================================================
DO_CHAIN=0
if [[ "$ONCHAIN" -eq 1 ]]; then
  DO_CHAIN=1
elif env_set_nonempty BITCODE_ERC1155_ADDRESS && env_set_nonempty BITCODE_ETHEREUM_RPC_URL && looks_like_address "${BITCODE_ERC1155_ADDRESS:-}"; then
  DO_CHAIN=1
fi

section "4. On-chain (cast)"

if [[ "$DO_CHAIN" -eq 0 ]]; then
  warn "Skipping on-chain checks (set address+RPC, or pass --onchain)"
elif ! has_cmd cast; then
  bad "cast missing — cannot validate chain"
else
  C="$BITCODE_ERC1155_ADDRESS"
  RPC="$BITCODE_ETHEREUM_RPC_URL"
  # name
  name_out="$(cast call "$C" "name()(string)" --rpc-url "$RPC" 2>/dev/null || true)"
  if [[ "$name_out" == *"Bitcode"* ]]; then
    ok "On-chain name() contains Bitcode"
  else
    bad "On-chain name() failed or unexpected (got: ${name_out:-empty})"
  fi
  sym_out="$(cast call "$C" "symbol()(string)" --rpc-url "$RPC" 2>/dev/null || true)"
  if [[ "$sym_out" == *"BTD"* ]]; then
    ok "On-chain symbol() is BTD"
  else
    bad "On-chain symbol() failed or unexpected"
  fi
  rem_out="$(cast call "$C" "remainingMintable()(uint256)" --rpc-url "$RPC" 2>/dev/null || true)"
  if [[ -n "$rem_out" ]]; then
    ok "On-chain remainingMintable() responds"
  else
    bad "On-chain remainingMintable() failed — wrong address or RPC?"
  fi
  if env_set_nonempty BITCODE_MASTER_ACCOUNT; then
    master_out="$(cast call "$C" "masterAccount()(address)" --rpc-url "$RPC" 2>/dev/null | tr '[:upper:]' '[:lower:]' || true)"
    expect="$(echo "$BITCODE_MASTER_ACCOUNT" | tr '[:upper:]' '[:lower:]')"
    if [[ "$master_out" == *"$expect"* ]]; then
      ok "On-chain masterAccount matches env"
    else
      warn "On-chain masterAccount may not match BITCODE_MASTER_ACCOUNT"
    fi
  fi
  if env_set_nonempty BITCODE_SETTLEMENT_OPERATOR; then
    op_out="$(cast call "$C" "settlementOperator()(address)" --rpc-url "$RPC" 2>/dev/null | tr '[:upper:]' '[:lower:]' || true)"
    expect="$(echo "$BITCODE_SETTLEMENT_OPERATOR" | tr '[:upper:]' '[:lower:]')"
    if [[ "$op_out" == *"$expect"* ]]; then
      ok "On-chain settlementOperator matches env"
    else
      warn "On-chain settlementOperator may not match BITCODE_SETTLEMENT_OPERATOR"
    fi
  fi
fi

# =============================================================================
# 5. Optional heavy tests (--full)
# =============================================================================
section "5. Automated tests"

if [[ "$FULL" -eq 0 ]]; then
  warn "Skipping forge/jest (--full to run)"
else
  if has_cmd forge && [[ -f "$CONTRACTS/lib/forge-std/src/Test.sol" ]]; then
    if (cd "$CONTRACTS" && forge test -q); then
      ok "forge test passed"
    else
      bad "forge test failed"
    fi
  else
    warn "forge test skipped (no forge or lib/forge-std)"
  fi
  if has_cmd pnpm && [[ -d "$BITCODE_ROOT/packages/btd" ]]; then
    if (cd "$BITCODE_ROOT" && pnpm --filter @bitcode/btd exec jest --config jest.config.cjs --runInBand __tests__/bitcode-erc1155.test.ts --silent >/dev/null 2>&1); then
      ok "Jest bitcode-erc1155 passed"
    else
      bad "Jest bitcode-erc1155 failed"
    fi
    if (cd "$BITCODE_ROOT" && pnpm --filter @bitcode/asset-packs-pipelines-execution-pipeline-simple-settle-asset-pack test --silent >/dev/null 2>&1); then
      ok "Jest settle pipeline passed"
    else
      bad "Jest settle pipeline failed"
    fi
  else
    warn "pnpm tests skipped"
  fi
fi

# =============================================================================
# 6. Live settle completeness (code-path probes — not full E2E)
# =============================================================================
section "6. Live settle completeness (code probes)"

# EIP-712 / eth_sendTransaction wiring still the main gap
if rg -q 'eth_sendTransaction|settleReadWithEth' "$UAPI" --glob '*.{ts,tsx}' 2>/dev/null; then
  if rg -q 'settleReadWithEth' "$UAPI" --glob '*.{ts,tsx}' 2>/dev/null; then
    ok "App references settleReadWithEth somewhere"
  else
    warn "No settleReadWithEth in apps/uapi yet (live MetaMask pay incomplete)"
  fi
else
  warn "No eth_sendTransaction / settleReadWithEth in apps/uapi (live pay incomplete)"
fi

if rg -q 'eip712|EIP712|signTypedData' "$BITCODE_ROOT/packages/btd" "$UAPI" --glob '*.{ts,tsx}' 2>/dev/null; then
  ok "EIP-712 / signTypedData references found"
else
  warn "No EIP-712 signTypedData wiring found (live quotes incomplete)"
fi

if [[ -f "$BITCODE_ROOT/Whitepaper.md" ]] && grep -q '\$BTD' "$BITCODE_ROOT/Whitepaper.md"; then
  ok "Whitepaper documents \$BTD"
else
  warn "Whitepaper \$BTD section missing or not greppable"
fi

# =============================================================================
# Summary
# =============================================================================
TOTAL=$((PASS + FAIL + WARN))
# Score: pass full credit, warn half, fail none — of (pass+fail+warn)
# Ready bar: only hard fails block "deployed usable projected path"
SCORE_NUM=$((PASS * 2 + WARN))
SCORE_DEN=$((TOTAL * 2))
if [[ "$SCORE_DEN" -eq 0 ]]; then
  PCT=0
else
  PCT=$((SCORE_NUM * 100 / SCORE_DEN))
fi

# Binary gates for "phases"
phase_repo=0
phase_env=0
phase_chain=0
[[ $FAIL -eq 0 ]] || true

# Heuristic phases
REPO_OK=1
[[ -f "$CONTRACTS/src/BitcodeERC1155.sol" && -f "$CONTRACTS/foundry.lock" && -f "$ERC1155_TS/bitcode-erc1155.ts" ]] || REPO_OK=0
ENV_OK=0
env_set_nonempty BITCODE_ETHEREUM_RPC_URL && env_set_nonempty BITCODE_ERC1155_ADDRESS && looks_like_address "${BITCODE_ERC1155_ADDRESS:-}" && ENV_OK=1
CHAIN_OK=0
if [[ "$DO_CHAIN" -eq 1 ]] && has_cmd cast && env_set_nonempty BITCODE_ERC1155_ADDRESS; then
  name_chk="$(cast call "$BITCODE_ERC1155_ADDRESS" "name()(string)" --rpc-url "${BITCODE_ETHEREUM_RPC_URL:-}" 2>/dev/null || true)"
  [[ "$name_chk" == *"Bitcode"* ]] && CHAIN_OK=1
fi

if [[ "$JSON" -eq 1 ]]; then
  # shellcheck disable=SC2016
  python3 - <<PY
import json, os
print(json.dumps({
  "repo": os.environ.get("BITCODE_ROOT", "$BITCODE_ROOT"),
  "pass": $PASS,
  "fail": $FAIL,
  "warn": $WARN,
  "score_pct": $PCT,
  "phases": {
    "repo_surface": bool($REPO_OK),
    "env_configured": bool($ENV_OK),
    "onchain_responds": bool($CHAIN_OK),
  },
  "passed": $(printf '%s\n' "${PASSED[@]+"${PASSED[@]}"}" | python3 -c 'import json,sys; print(json.dumps([l.strip() for l in sys.stdin if l.strip()]))'),
  "failed": $(printf '%s\n' "${FAILED[@]+"${FAILED[@]}"}" | python3 -c 'import json,sys; print(json.dumps([l.strip() for l in sys.stdin if l.strip()]))'),
  "warnings": $(printf '%s\n' "${WARNINGS[@]+"${WARNINGS[@]}"}" | python3 -c 'import json,sys; print(json.dumps([l.strip() for l in sys.stdin if l.strip()]))'),
}, indent=2))
PY
  exit $([[ "$FAIL" -eq 0 ]] && echo 0 || echo 1)
fi

printf '\n%s════════ progress ════════%s\n' "$C_BOLD" "$C_RST"
printf '  pass %s%d%s  fail %s%d%s  warn %s%d%s  score %s%d%%%s\n' \
  "$C_OK" "$PASS" "$C_RST" \
  "$C_BAD" "$FAIL" "$C_RST" \
  "$C_WARN" "$WARN" "$C_RST" \
  "$C_BOLD" "$PCT" "$C_RST"

# bar
filled=$((PCT / 5))
empty=$((20 - filled))
bar="$(printf '%0.s█' $(seq 1 $filled 2>/dev/null) 2>/dev/null || true)"
pad="$(printf '%0.s░' $(seq 1 $empty 2>/dev/null) 2>/dev/null || true)"
printf '  [%s%s%s%s]\n' "$C_OK" "${bar:-}" "$C_DIM" "${pad:-}$C_RST"

printf '\n%sphases%s\n' "$C_BOLD" "$C_RST"
[[ "$REPO_OK" -eq 1 ]] && printf '  %s✓%s repo / dual-maintain surface\n' "$C_OK" "$C_RST" || printf '  %s✗%s repo / dual-maintain surface\n' "$C_BAD" "$C_RST"
[[ "$ENV_OK" -eq 1 ]] && printf '  %s✓%s env (RPC + contract address)\n' "$C_OK" "$C_RST" || printf '  %s✗%s env (RPC + contract address) — deploy + set BITCODE_ERC1155_ADDRESS\n' "$C_BAD" "$C_RST"
[[ "$CHAIN_OK" -eq 1 ]] && printf '  %s✓%s on-chain contract responds\n' "$C_OK" "$C_RST" || printf '  %s○%s on-chain contract responds — deploy + cast smoke\n' "$C_DIM" "$C_RST"

printf '\n%sremaining (priority)%s\n' "$C_BOLD" "$C_RST"
if [[ ${#REMAINING[@]} -eq 0 ]]; then
  printf '  %sNone flagged — re-run with --full for test gates; live MetaMask settle may still be incomplete.%s\n' "$C_DIM" "$C_RST"
else
  i=1
  for r in "${REMAINING[@]}"; do
    printf '  %2d. %s\n' "$i" "$r"
    i=$((i + 1))
  done
fi

printf '\n%snext actions (crypto)%s\n' "$C_BOLD" "$C_RST"
if [[ "$REPO_OK" -eq 0 ]]; then
  printf '  • Fix missing dual-maintain / contract files under packages/btd\n'
fi
if [[ ! -f "$CONTRACTS/lib/forge-std/src/Test.sol" ]]; then
  printf '  • cd packages/btd/contracts && forge install foundry-rs/forge-std@v1.16.2 --no-git\n'
fi
if [[ "$ENV_OK" -eq 0 ]]; then
  printf '  • Deploy: forge script …DeployBitcodeERC1155 --broadcast (see packages/btd/contracts/DEPLOY.md)\n'
  printf '  • Set BITCODE_ERC1155_ADDRESS + BITCODE_ETHEREUM_RPC_URL in apps/uapi/.env.local\n'
fi
if [[ "$ENV_OK" -eq 1 && "$CHAIN_OK" -eq 0 ]]; then
  printf '  • Verify address/RPC with cast call name() / remainingMintable()\n'
fi
if ! env_set_nonempty BITCODE_QUOTE_SIGNER_KEY; then
  printf '  • Set BITCODE_QUOTE_SIGNER_KEY (server) for EIP-712 settle quotes\n'
fi
printf '  • Projected path: settle API + packs payout finalize\n'
printf '  • Live path still TODO: signTypedData quote + eth_sendTransaction settleReadWithEth\n'
printf '  • Re-run: %s--full%s after code changes; %s--onchain%s after deploy\n' "$C_DIM" "$C_RST" "$C_DIM" "$C_RST"
printf '\n'

exit $([[ "$FAIL" -eq 0 ]] && echo 0 || echo 1)

#!/usr/bin/env bash
# Post-build / pre-push host boot smoke.
# Runs the materialized live runner inside the candidate Pipeliner image with a
# deposit manifest — the same entry the Vercel Sandbox host invokes.
#
# Pass criteria (strict):
# - process may exit non-zero later (clone/token/etc.)
# - MUST NOT fail with: asset is not defined, Cannot find module, Cannot resolve
#   monorepo package labels from importMonorepoModule
# - evidence.json must exist
# - if error.message is set, it must not match import-boot failure patterns
#
# Usage:
#   ./containers/images/pipeliner/scripts/smoke-deposit-host-boot.sh <image-ref>

set -euo pipefail

IMAGE="${1:?image ref required}"
WORKDIR="$(mktemp -d)"
cleanup() { rm -rf "$WORKDIR"; }
trap cleanup EXIT

mkdir -p "$WORKDIR/.proofs/pipeline-host"
cp containers/images/pipeliner/dist/run-live-asset-pack-pipeline.mjs \
  "$WORKDIR/.proofs/pipeline-host/run-live-asset-pack-pipeline.mjs"

cat > "$WORKDIR/.proofs/pipeline-host/manifest.json" <<'JSON'
{
  "hostMode": "asset_pack_pipeline",
  "synthesizeMode": "deposit",
  "sourceRevision": {
    "repositoryFullName": "advancedengineeredsoftware/Bitcode",
    "branch": "version/v48",
    "commit": "8222272f76e717fd4f5e9f92a9cda02ba2338855"
  },
  "deposit": {
    "id": "smoke-deposit-host-boot",
    "userId": "00000000-0000-4000-8000-000000000000"
  },
  "read": { "prompt": "Deposit measured AssetPack options." },
  "requireAcceptedReadNeed": false
}
JSON

# Guard: runner source must not contain the free-var regex form.
if grep -F '/syntheses/|asset-packs-pipelines/domain/i' \
  "$WORKDIR/.proofs/pipeline-host/run-live-asset-pack-pipeline.mjs" >/dev/null; then
  echo "FAIL: runner embeds broken looksLikeMissingPath regex (asset free-var)" >&2
  exit 1
fi

set +e
docker run --rm --platform linux/amd64 \
  -v "$WORKDIR:/vercel/sandbox" \
  -e BITCODE_MONOREPO_ROOT=/opt/bitcode \
  -e BITCODE_PIPELINE_HOST_MANIFEST=/vercel/sandbox/.proofs/pipeline-host/manifest.json \
  -e BITCODE_PIPELINE_HOST_ARTIFACT_DIR=/vercel/sandbox/.proofs/pipeline-host \
  -e BITCODE_PIPELINE_RUN_ID=smoke-deposit-host-boot \
  -e BITCODE_PIPELINE_USER_ID=00000000-0000-4000-8000-000000000000 \
  -e BITCODE_PIPELINE_STREAM_TO_DATABASE=0 \
  -e BITCODE_PIPELINE_HOST_MAX_RUNTIME_MS=120000 \
  -e BITCODE_DEBUG_FAST_SETUP=1 \
  -w /opt/bitcode \
  --entrypoint bash \
  "$IMAGE" \
  -lc 'LOADER=packages/pipeline-hosts/node_modules/tsx/dist/loader.mjs; node --import "./$LOADER" /vercel/sandbox/.proofs/pipeline-host/run-live-asset-pack-pipeline.mjs' \
  >"$WORKDIR/stdout.log" 2>"$WORKDIR/stderr.log"
code=$?
set -e

EVIDENCE="$WORKDIR/.proofs/pipeline-host/evidence.json"
if [[ ! -f "$EVIDENCE" ]]; then
  echo "FAIL: no evidence.json (exit=$code)" >&2
  echo "--- stderr ---" >&2
  tail -80 "$WORKDIR/stderr.log" >&2 || true
  exit 1
fi

python3 - "$EVIDENCE" "$WORKDIR/stderr.log" <<'PY'
import json, re, sys
from pathlib import Path
evidence = json.loads(Path(sys.argv[1]).read_text())
stderr = Path(sys.argv[2]).read_text(errors="replace") if Path(sys.argv[2]).exists() else ""
err = evidence.get("error") or {}
msg = str(err.get("message") or "")
stack = str(err.get("stack") or "")
blob = "\n".join([msg, stack, stderr, json.dumps(evidence.get("resultReasons") or [])])

# Import-boot failure patterns that mean the image/runner is not production-ready.
boot_patterns = [
    r"ReferenceError:\s*asset is not defined",
    r"Cannot resolve asset-packs-pipelines",
    r"Cannot find module ['\"]zod['\"]",
    r"Cannot find module ['\"]@bitcode/",
    r"smoke import failed",
    r"ERR_MODULE_NOT_FOUND",
]
for pat in boot_patterns:
    if re.search(pat, blob):
        print(f"FAIL: boot-class failure matched /{pat}/", file=sys.stderr)
        print(msg[:1200] or stack[:1200] or blob[:1200], file=sys.stderr)
        sys.exit(1)

print("PASS: deposit host boot past monorepo import graph")
print(f"  resultState={evidence.get('resultState')}")
print(f"  exit_error={msg[:200] if msg else '(none — runner may still be mid-pipeline or later fail)'}")
sys.exit(0)
PY

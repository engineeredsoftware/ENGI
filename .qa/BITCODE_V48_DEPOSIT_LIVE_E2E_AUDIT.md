# V48 Deposit — Live E2E Audit (pre-deploy)

**Date:** 2026-07-18  
**Posture:** Keep **xAI** (`grok-3-mini`) as live deposit default.  
**Purpose:** Telemetry depth, residual bugs/gaps, prompt/refurbish notes before live deposit against arbitrary repos.

---

## Defaults (live)

| Surface | Provider default | Model default |
| --- | --- | --- |
| `qa:deposit:local` | `xai` | `grok-3-mini` |
| `qa:deposit:debug-first-llm` | `xai` | `grok-3-mini` |
| Sandbox host env normalize | prefers `XAI_API_KEY` | `grok-3-mini` |
| `resolveDefaultLLMProvider` | prefers xAI when key present | `grok-3-mini` |

Override: `BITCODE_LLM_PROVIDER` / `BITCODE_LLM_MODEL`.

---

## Telemetry (required for live)

| Artifact | Path / signal | Notes |
| --- | --- | --- |
| Host evidence | `.proofs/pipeline-host/evidence.json` | `resultState`, options, envelope |
| Host stream | `telemetry.jsonl` | pipeline stream events |
| Measurements | `options-measurements.json` | full absolute catalog check |
| Wire LLM ledger | `.tmp/llm-call-debug/pipeline-synthesize_deposit_asset_packs/` | request/response/abort |
| Human report | `RUN_REPORT.md` + `run-summary.json` | provider, agents, packs |
| Validation gate | `validation:gateDecision` store | structureReady / PTRR skip reason |
| Finish | `finish:completion.validation` | gateDecision + qualityScore |

Local defaults now force:

- `BITCODE_LLM_CALL_DEBUG=1`
- prompt/step/raw I/O write flags
- `BITCODE_LLM_CALL_TIMEOUT_MS=180000` (avoid hung providers)
- `BITCODE_DEBUG_STOP_AFTER_FIRST_REASON=0` (full pipeline)
- serial Setup/Discovery; FAST_SETUP=1; FAST_DISCOVERY=0

---

## Closed bugs (this arc)

1. **PCC multi-`#` key paths** emptied Refine `selectedContext` → expand candidates in `execution-generics/state-keys`.
2. **Empty `needinessSignal.rationale`** failed deposit schema → stitch death-spiral; residual schema lenient.
3. **Refine maxAttempts / fake stitch paths** (`#host:…`) → bound refine; host path salvage.
4. **Validation qualitative PTRR** skipped silently when structureReady → now stores `gateDecision` telemetry.
5. **Provider billing** Anthropic/OpenAI quota → xAI live path.

---

## Residual gaps / refurbish backlog

| Priority | Item | Risk |
| --- | --- | --- |
| P1 | Deposit package unit tests: missing module mapper for `@bitcode/generic-tools-editing/*`; some agents still mock-path fragile | CI green for deposit package |
| P1 | Validation qualitative PTRR often **skipped** when structureReady — good for latency; for high-stakes live, optional env force qualitative | Quality bar variance |
| P2 | Host `telemetry.jsonl` is mostly flat stream events — little phase/agent indexing; rely on llm-call-debug + RUN_REPORT | Ops triage |
| P2 | DIV max-iterations under low validation score not fully live-proven | Partial packs / iterate loop |
| P2 | Depository search often **zero hits** (empty/thin depository) — valid under-supply signal | Guidance quality |
| P3 | Implementation still can emit residual measurements/neediness keys (stripped host-side) | Schema noise |
| P3 | Full Setup (no FAST_SETUP) not re-run every live pass | Obfuscations/LSP residual |
| P3 | Multi-repo fixtures beyond micro-libs | Scale |

---

## Prompt improvements applied

- Try: omit measurements/neediness; prefer `modify` for existing catalog paths; summary substance.
- Refine: never empty options; no `#namespace#key`; no `#host:…` pseudo-paths; distinct slices.
- Validation: auditable skip reason when structureReady.

---

## Live command (random public repo)

```bash
export BITCODE_DEPOSIT_REPO_URL='https://github.com/<org>/<repo>.git'
export BITCODE_DEPOSIT_WORK_DIR=".tmp/local-deposit-run-$(basename "$BITCODE_DEPOSIT_REPO_URL" .git)"
export BITCODE_LLM_PROVIDER=xai
export BITCODE_LLM_MODEL=grok-3-mini
pnpm --filter @bitcode/pipeline-hosts run qa:deposit:local
# inspect:
#   $BITCODE_DEPOSIT_WORK_DIR/RUN_REPORT.md
#   $BITCODE_DEPOSIT_WORK_DIR/evidence.summary.json
#   .tmp/llm-call-debug/pipeline-synthesize_deposit_asset_packs/
```

**Admissibility:** exit 0 + `resultState=worthy_deposit_candidates` + options with full absolute catalog (8 kinds).

---

## Prior successful proof

- Repo: `sindresorhus/is-plain-obj`
- Provider: xAI `grok-3-mini`
- Outcome: 3 measured packs, `worthy_deposit_candidates`, exit 0
- Wire: Discovery agents 24 responses each; Implementation 24; stitch 0 after fixes

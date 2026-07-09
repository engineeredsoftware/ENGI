# Bitcode Specification V48

**Status:** Draft version canon for the `version/v48` line (notes-backed opening through Gate 3).  
**Active pointer on `main`:** remains the promoted prior version until V48 promotion.  
**This document** is the **single V48 system specification** for all V48 draft work. V48 is complete Bitcode law for this version line — not an addendum that defers binding meaning to earlier version files.

---

## 1. Canon posture

1. **One active draft canon for V48.** All V48 implementation, tests, QA, and gate PRs derive from this document family (`BITCODE_SPEC_V48.md`, `BITCODE_SPEC_V48_NOTES.md`, `BITCODE_V48_QA.md`). Do not treat superseded version specs as live law for V48 work.
2. **Complete Implementation Derivability.** Every committed change declares `(specification-only)` | `(implementation-only)` | `(specification-implementation)` so specification ↔ implementation stays auditable commit by commit.
3. **Source-safety.** Raw source, unpaid AssetPack source, secrets, wallet private material, raw prompts, and raw provider responses are never product-visible. Telemetry withholds content by metadata allowlist.
4. **Fail-closed honesty.** Estimates that cannot be grounded (e.g. settled Depository demand) say **Unestimatable** rather than invent placeholders.

---

## 2. Product surfaces (V48)

| Surface | Route | Role |
|---|---|---|
| Packs / ledgerized activity | `/packs` | Master-detail activity, Depository readback |
| Reads | `/reads` | Need → Finding Fits → settlement (later gates) |
| Deposits | `/deposits` | Synthesize measured AssetPack options → review → admission |
| Identity / Auxillaries | panes over product routes | Wallet + GitHub; no legacy email auth as root identity |

Wallet (Bitcoin testnet message signature) plus GitHub are the identity root for depositing.

---

## 3. SynthesizeAssetPacks — the unified SDIVF pipeline

### 3.1 Law

- **One pipeline:** `SynthesizeAssetPacks` = Setup → Discovery → Implementation → Validation → Finish (SDIVF).
- **Modes:** `deposit` | `read`. Mode is stored on the **shared pipeline execution** (parent of all phase children), never only on a preprocess sibling (mode resolution walks ancestors only).
- **Conditional runtime registries** select agents/tools/prompts per mode under stable phase keys.
- **Inference is non-configurable.** Full formal hierarchy always; real generation at the leaf. Tests mock the LLM provider boundary only — no in-agent “bounded/deterministic” product profiles.
- **Harness-decoupled execution.** Route validates + dispatches `runId`; host runs the pipeline (inline process or Vercel Sandbox); client loads synthesis from execution output on completion.
- **DIV iterations:** **max 1** for Gate 3 product deposit (single D→I→V pass). Further iteration is deferred.
- **Default LLM (xAI):** provider `xai`, model **`grok-build-0.1`** when `XAI_API_KEY` / Grok is configured (override via `BITCODE_LLM_MODEL`).
- **Per-call timeout:** `BITCODE_LLM_CALL_TIMEOUT_MS` (default **180000**). Clean reject; no indefinite hang.

### 3.2 Deposit lens (Gate 3 full-stack)

**Inputs**

| Input | Law |
|---|---|
| Repository · branch · commit | GitHub-connected source |
| **Obfuscations** | Free-text withhold guidance. **Empty → skip Setup input-comprehension LLM**; empty guidance stored; Forced Exclusions remain fail-closed. |
| **Forced Inclusions** | When non-empty, only those path roots are in-scope for measure/prompt. |
| **Forced Exclusions** | Fail-closed: excluded paths never enter inventory sources/samples/paths. |

**Setup (deposit):** clone → input-comprehension (Obfuscations) → MCP init. Read-only Setup-plan and danger-wall are **punted** (no-LLM passthrough).

**Discovery (deposit):** codebase comprehension · depository-search · inherent regurgitation.

**Implementation (deposit):** synthesize 2–4 measured patch options (`implementation:deposit-asset-pack-synthesis`).

**Validation (deposit):** formal **absolutes** measure-agent + static analysis; fail-closed if no admissible candidates.

**Finish (deposit):** upload-for-review (no PR in synthesis; settlement/PR → future SettleAssetPacks).

### 3.3 AssetPack model

An AssetPack is **always a synthesized artifact** (patch + measurements + metadata), never a raw source slice.

- **Deposit packs:** absolute measurements only (size/quality material properties). Neediness is a **preview** of read demand, not part of the absolute composite.
- **Absolutes catalog (Gate 3):** quantity + quality measures with weights summing to 1; sizes carry `magnitude` + `unit` + `category: 'absolute'`.
- **Neediness (v0):** `neediness = clamp01(demand × (0.5 + 0.5 × (1 − saturation)))`. Grounded from settled Depository AssetPack search when estimatable; otherwise **Unestimatable**.

### 3.4 Deposit option full-stack (route session)

For each synthesized option the deposit route builds, in order:

1. **Synthesis** — source-safe option cards (kind, title, summary, measurements, contents, neediness).
2. **Policy** — criticality · demand · ROI · BTD potential · compensation route · policy decision.
3. **Admission** — review decisions → Depository projection receipts (when approved).
4. **Earning supply intelligence** — likely demand · unfit need · compensation ranges · supply recommendations.
5. **Organization policy + wallet authority** — required actions for `/deposits`.

**Full-stack completeness law (Gate 3):**

| Stat | Completeness rule |
|---|---|
| Option roots | = synthesis option count |
| Positive ROI options | Measurement-ranked ROI may be positive even when **demand is Unestimatable** (provisional settlement for ranking only). Earnings **display** stays Unestimatable when demand is not grounded. |
| Admitted options | Increments only after depositor approval → admission receipts |
| Required denials | Must not permanently sit at 2 solely because `depositApproved` is false pre-review. Sub-critical + under limit ⇒ deposit authority `sub-critical-approved` so approve/submit are allowlisted when grants + wallet + role admit. |

**Demand estimation law:**

- Search **settled / admitted** Depository AssetPacks only.
- Below minimum settled pack floor, or no topic match → `estimatable: false`, UI **Unestimatable**.
- Never hardcode demand weights in the product client.

### 3.5 Telemetry contract

Exactly two formal log-line kinds:

1. **LLM calls** (generation leaf) — Phase → Agent → Step → Failsafe → Thinkings pills + source-safe summary.
2. **Tool uses** — Phase → Agent → Step + tool name.

Informational status is not a row. Content withheld as `[content withheld — source-safe]`. Auto-follow log unless user scrolls away. Failed/cancelled rows expose last call-chain + error on hover.

### 3.6 Hosts + cancel

| Host | Role |
|---|---|
| Inline | Dev / default in-process |
| Vercel Sandbox | Prod durable; deposit boxes `persistent: false` |

Cooperative cancel: `POST /api/executions/[runId]/cancel`; row authority; background must not overwrite `cancelled` with `failed`/`completed`.

---

## 4. Gate map (V48)

| Gate | Focus | Status |
|---|---|---|
| 1 | Identity / wallet auth interactive QA | Closed |
| 2 | Depositing interactive QA foundations | Closed into version line |
| **3** | Synthesis pipeline algorithmic + telemetric correctness; deposit full-stack SDIVF | **This gate — closing** |
| 4+ | Reading lens product, settlement, org, etc. | Deferred |

Gate 3 acceptance is: parity matrix rows implemented + tested + one live scoped deposit proof + source-safety + CI green on the gate PR into `version/v48`.

---

## 5. Explicit non-goals (V48 Gate 3)

- Value-bearing mainnet settlement  
- Read-lens full product migration (later gate)  
- Neediness v1 embedding supply index  
- Multi-iteration DIV product loops  
- Treating prior version markdown as binding V48 law  

---

## 6. Environment (product defaults)

| Variable | Default / law |
|---|---|
| `BITCODE_LLM_PROVIDER` | `xai` when `XAI_API_KEY` present |
| `BITCODE_LLM_MODEL` | `grok-build-0.1` for xAI |
| `BITCODE_LLM_CALL_TIMEOUT_MS` | `180000` |
| `BITCODE_ASSET_PACK_REAL_INFERENCE` | `true` for live deposit |
| `BITCODE_PIPELINE_HOST` | unset → inline; `sandbox` for in-box |

---

## 7. Proof artifacts

- Package tests: `@bitcode/pipeline-asset-pack`, `@bitcode/agent-generics`, `@bitcode/pipeline-hosts`, uapi deposit/route suites  
- QA ledger: `BITCODE_V48_QA.md` (Gate 3 findings F17–F38 family)  
- Working notes: `BITCODE_SPEC_V48_NOTES.md` (architecture decisions + parity matrix)

---

*End of V48 single-canon specification (Gate 3 full-stack included).*

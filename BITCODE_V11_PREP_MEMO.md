# Bitcode V11 Prep Memo

Status: historical prep memo for the V11 draft + implementation pass
Date: 2026-04-03
Baseline preserved: `(removed monorepo path, formerly _legacy/)ENGI_SPEC_V10.md`
Historical pointer note: this memo was authored before the Bitcode root-family cut-over, when the canonical pointer still remained on `V8`

## Purpose

This memo records the audit that drives the first V11 draft and implementation pass.

V10 is good enough as a boundary-quality prototype.
V11 exists because the system is now structurally present but still not yet operationally inevitable.

The remaining weakness is not missing metadata.
It is system shape:

1. repo-bound intake exists, but still reads like a feature attached to a demo form,
2. artifact kinds exist, but the repo supply picture is still too flat to feel native,
3. identity, signing, GitHub App auth, authorization, proof, and settlement exist, but they still read as separate artifacts rather than one spine,
4. local-vs-remote honesty exists, but mostly as branch artifacts instead of as an always-legible operating boundary,
5. the golden path from repo selection to settlement is present, but spread across panels in a way that still feels inspect-y.

## Audit summary

### 1. V10 has the right primitives, but not yet the right operating picture

Observed in the local demo:

- `protocol-demonstration/src/bitcode-demo.js` already models GitHub App sessions, repo artifact inventory, addressing, signing, GitHub App auth, identity bindings, proofs, and settlement.
- `protocol-demonstration/public/app.js` renders those surfaces faithfully.
- `protocol-demonstration/public/index.html` and the client shell still present them mostly as an artifact browser with actions, rather than as the default operational story of the system.

Result:

- the system is inspectable,
- the system is not yet visually or conceptually unavoidable.

### 2. Repo supply is real, but still under-expressed

Observed in the local demo:

- the inventory picker is selection-first,
- individual inventory entries are rich,
- the operator still lacks a strong repo-level supply summary:
  - per repo,
  - per artifact kind,
  - per origin kind,
  - per scenario coverage boundary.

Result:

- artifact kinds are available,
- artifact-kind-native supply still does not feel like the system's natural substrate.

### 3. Identity/auth is explicit, but still reads as scattered proof furniture

Observed in the local demo:

- candidate assets expose selection, addressing, signing, and GitHub App auth surfaces,
- branch artifacts expose identity bindings, authorization decisions, GitHub boundary surfaces, and proofs,
- these surfaces are strong individually,
- they are not yet composed into one operator-legible spine from repo auth to branch authority to bounded proof to settlement.

Result:

- V10 proves identity/auth structure,
- V11 must make identity/auth feel like the system backbone.

### 4. Boundary honesty is correct, but not prominent enough

Observed in the local demo:

- Profile A vs Profile B distinctions are present,
- external boundary manifests explain what is modeled locally vs what would be live,
- those distinctions are still buried too deep in the inspectable artifact stack.

Result:

- the demo is honest,
- but the operator must still work to understand where the live seam actually is.

### 5. The golden flow exists, but does not yet stage itself

Observed in the local demo:

- the user can select repo artifacts,
- create candidate assets,
- run read measurement, ranking, branch materialization, proof generation, and settlement,
- but the flow is not yet summarized as a stage-by-stage operating path.

Result:

- the pipeline works,
- the demonstration path still feels like "inspect all the internals" rather than "watch the system operate."

## V11 priorities

Priority order for this pass:

### A. Repo-authenticated artifact intake must feel operationally native

Requirements:

- expose repo supply before freeform override details,
- summarize supply by repo, artifact kind, and origin kind,
- make inventory browsing feel like first-class intake rather than a long selectable list.

### B. Artifact-kind-native parity must become legible

Requirements:

- show that proof, patch, runbook, config, and incident-note supply all belong to the same intake model,
- make mixed bundles legible without turning mixed into the default blur.

### C. Identity/auth must read as one coherent spine

Requirements:

- connect GitHub App session, selected inventory, signer attestation, buyer authority, Bitcode system authority, bounded proof authority, and settlement authority into one surface,
- keep addressing, signing, auth payloads, authorization, and proof distinct while also making their chain obvious.

### D. Local/remote boundary realism must be stronger and simpler

Requirements:

- distinguish clearly between:
  - modeled local structure,
  - executed local effects,
  - external production-required effects,
- do this near the operating story, not only deep inside branch artifacts.

### E. The golden flow must stage itself

Requirements:

- make the path from repo selection -> read -> asset -> branch -> proof -> settlement visible as a default surface,
- preserve deep artifact inspection without making it the only way to understand the system.

## Recommended first implementation slice

The highest-value coherent V11 slice is:

1. add a repo supply surface that summarizes authenticated repo inventory by repo and artifact kind,
2. add a golden flow surface that stages the executed pipeline end to end,
3. add an identity/auth spine surface that ties repo auth, signer attestation, branch authority, proof authority, and settlement authority together,
4. add a boundary reality surface that makes modeled-local vs executed-local vs external-required immediately legible,
5. recenter the demo UI around those V11 surfaces while keeping the existing artifact/proof detail stack intact.

## Profile A / Profile B boundary for this pass

Profile A MAY:

- summarize repo supply locally,
- express identity/auth as a coherent chain,
- materialize local branch/proof/settlement surfaces,
- stage executed-vs-modeled-vs-external boundaries clearly.

Profile A MUST NOT:

- fake live installation-token exchange,
- fake live GitHub fetch refresh,
- fake live branch or PR writes,
- fake network-backed settlement or signer verification.

## Artifacts for this pass

Required outputs:

1. `/Users/garrettmaring/Developer/ENGI/BITCODE_V11_PREP_MEMO.md`
2. `(removed monorepo path, formerly _legacy/)ENGI_SPEC_V11.md`
3. `(removed monorepo path, formerly _legacy/)ENGI_SPEC_V11_NOTES.md`
4. `/Users/garrettmaring/Developer/ENGI/protocol-demonstration/SPEC_V11_IMPLEMENTATION_MATRIX.md`
5. initial V11 implementation in `protocol-demonstration`
6. tests run
7. exact landed-vs-next summary

## Non-goals for this pass

This pass should not:

- repoint the root canonical pointer,
- delete or rewrite V10 artifacts in place,
- fake production GitHub/network behavior,
- do a broad architectural breakup of the demo code unless a tiny helper materially improves clarity.

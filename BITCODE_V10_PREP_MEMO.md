# Bitcode V10 Prep Memo

Status: historical prep memo for the V10 draft + implementation pass
Date: 2026-04-03
Baseline preserved: `(removed monorepo path, formerly _legacy/)ENGI_SPEC_V9.md`
Historical pointer note: this memo was authored before the Bitcode root-family cut-over, when the canonical pointer still remained on `V8`

## Purpose

This memo records the audit that drives the first V10 draft and implementation pass.

V9 is complete.
This pass does not rewrite or undo V9.
V10 exists because two surfaces that V9 made visible are still too shallow to count as a strong canonical implementation:

1. artifact intake still behaves like a raw textarea-first deposit flow,
2. identity/auth is separated in principle but not yet finalized as a coherent address + signing + GitHub App auth cluster.

## Audit summary

### 1. Current artifact intake is still textarea-dominant

Observed in the local demo:

- `protocol-demonstration/public/index.html` still centers the deposit UX on freeform fields plus `content` textarea.
- `protocol-demonstration/public/app.js` posts those form values directly to `POST /api/deposits`.
- `protocol-demonstration/server.js` requires `title`, `author`, and `content`, which structurally privileges raw pasted payloads over repo-bound artifact selection.
- `protocol-demonstration/src/bitcode-demo.js` already models `artifactKind`, `artifactType`, `uploadSurface`, and GitHub references, but the intake boundary still begins from user-entered text rather than from authenticated repository artifact inventory.

Result:

- all artifact kinds are not equally first-class at intake time,
- the UX effectively stops at “paste the private source material here,”
- the GitHub boundary is present as metadata, not as the primary selection surface.

### 2. Identity/auth surfaces are visible but still too shallow

Observed in the local demo:

- candidate assets expose `identitySurface.signerAddress` and `githubBoundary.sourceRepo/workflowRunId`,
- branch artifacts persist `.bitcode/identity-bindings.json`, `.bitcode/github-boundary.json`, and `.bitcode/artifact-upload-manifest.json`,
- `buildIdentityBindings()` and `buildIdentityAuthorizationProof()` prove basic principal/action closure.

But the current shape still leaves gaps:

- addressing is not a distinct canonical surface,
- signing is reduced mostly to signer address + attestation booleans,
- GitHub App auth payloads do not carry a strong installation-scoped structure beyond a few strings,
- installation id exists, but not as part of a more complete GitHub App auth payload surface,
- repo selection, repository ids, account ids, installation permissions, and token-boundary semantics are not carried together clearly.

Result:

- the implementation is legible, but not yet final enough for identity/auth canon quality,
- the operator can describe the boundary, but the demo does not yet show the whole cluster together.

### 3. Additional V10 frontier work became obvious after auditing A and B

Once artifact intake and auth were audited together, the next frontier became clearer:

- repo-bound inventory should become a seeded local capability rather than only a future Profile B sentence,
- the intake manifest should preserve which inventory artifacts were selected, not just the final deposited summary,
- UI copy should explicitly distinguish selection from authenticated repo inventory vs raw fallback content,
- proof/auth surfaces should verify that selected artifacts were addressed, signed, and installation-scoped coherently,
- the demo should expose local Profile A truth honestly:
  live GitHub App auth is still out of scope, but V10 should still show the exact payload shapes it would consume.

## V10 priorities

Priority order for this pass:

### A. All artifact-kind uploads

V10 should make artifact intake selection-first, not textarea-first.

Requirements:

- the demo should move toward selection from an authenticated repo / repo-bound artifact inventory,
- all artifact kinds should be part of the visible V10 surface,
- raw pasted content remains allowed as fallback, not as the main model.

### B. Full identity/auth finalization together

V10 should treat the following as one explicit cluster:

- addressing
- signing
- GitHub App authentication payloads
- installation id and related auth payload fields

Requirements:

- use clear, specific names,
- avoid vague umbrella labels,
- thread the surfaces through candidate assets, manifests, branch artifacts, and proofs.

### C. Frontier work after V9

V10 should also capture the next obvious work, even if not all of it lands in this pass:

- richer repo artifact inventory sources,
- stronger modeled permissions and auth decisions,
- branch/delivery action payloads,
- future live GitHub boundary switch-over requirements.

## Recommended first implementation slice

The highest-value coherent V10 slice is:

1. seed authenticated repo sessions and repo-bound artifact inventory in the local demo,
2. upgrade the deposit UX to select inventory artifacts first and only optionally add raw notes/content,
3. strengthen candidate asset and manifest payloads with explicit:
   - artifact selection surface,
   - addressing surface,
   - signing surface,
   - GitHub App auth surface,
4. extend identity/auth proofs and bindings to account for the stronger auth payload shape.

## Profile A / Profile B boundary for this pass

Profile A MAY:

- model GitHub App auth payloads locally,
- seed repo artifact inventory locally,
- simulate installation-scoped permissions locally.

Profile A MUST NOT:

- fake live token minting,
- pretend a real installation access token was fetched,
- pretend a real GitHub repository was queried live.

Therefore V10 should make the live boundary explicit while still improving the local canonical surfaces substantially.

## Artifacts for this pass

Required outputs:

1. `/Users/garrettmaring/Developer/ENGI/BITCODE_V10_PREP_MEMO.md`
2. `(removed monorepo path, formerly _legacy/)ENGI_SPEC_V10.md`
3. `(removed monorepo path, formerly _legacy/)ENGI_SPEC_V10_NOTES.md`
4. `/Users/garrettmaring/Developer/ENGI/protocol-demonstration/SPEC_V10_IMPLEMENTATION_MATRIX.md`
5. initial V10 implementation in `protocol-demonstration`
6. tests run
7. exact landed-vs-next summary

## Non-goals for this pass

This pass should not:

- repoint the root canonical pointer,
- delete or rewrite V9 artifacts in place,
- do speculative repo-wide modularization,
- fake live GitHub auth/network effects.

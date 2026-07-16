<!-- Lives at scripts/specifying (repo metadevelopment tooling, not a product package). -->

# @bitcode/specifying

> **Placement law (V48):** product **core systems** live under `packages/*`.
> This package lives under **`scripts/specifying/`** as the specifying *machine*
> (gate proof generators, canon posture, promotion helpers). It is **not** a
> product package, not website measurement canon, and not a “protocol” product
> owner — the monorepo is protocol canon. Specifying *law* lives in
> `.specifications/BITCODE_SPECIFYING.md`.

Bitcode specifying tooling (`scripts/`): gate generators, canon posture, and
promotion helpers used by commercial workflows and proof generation.

**Meta specifying (historical freeze — §4.3 / §13.1):**

- Promoted version specs, proofs, and version-bound checks are **immutable
  canon-at-that-time** — **never edit** them after promotion to chase later
  tree moves (renames, package layout, demo-tree removal, etc.).
- It is **expected** that a new draft will **break** prior-era checks. Leave
  those checks **untouched** and **do not re-run them as required green**.
- **Only active canon + draft target** execute as living required gates
  (today: **V47 + V48** via `ACTIVE_CANON_VERSION` / `DRAFT_TARGET_VERSION`).
- The living full-system check for that pair must be **exhaustive** for
  present sole-canon — new suites restate total obligation; they do not
  patch old suites.
- Compatibility re-exports (e.g. `bitcode-demo.js` → `specifying-runtime.js`)
  may keep frozen importers resolving **without editing** promoted-era files.

**Active/draft posture (V47 Gate 10 promotion readiness):** `V47` active, `V48` draft.
Living required gates for this pointer pair only — see V47 Gate 10 and
`.specifications/BITCODE_SPECIFYING.md` §4.3 and §13.1.

Commercial scripts, API/runtime code, and workflow checks must import canon
posture, spec-family checks, canonical-input checks, canon-drift checks, and
proven-generation helpers from `@bitcode/specifying` or
`scripts/specifying/src/index.js` — not from any removed standalone witness tree.

**Removed (do not reintroduce):** standalone `protocol-demonstration/` product
tree and any commercial UAPI bridge that embedded a demonstration shell.
Historical specs may still mention that tree; living checks must not require it.
Product systems belong in `packages/*`. Specifying harness code that remains
under `scripts/specifying/` is **scripts tooling** only.

Current exported helpers include:

- active/draft canon posture;
- spec-family and canonical-input validation helpers;
- canon-posture drift reporting;
- documentation/telemetry/exchange/conversation proof catalogs and generators
  used by gate workflows;
- proven-generation helpers for `.proofs/*` artifacts.

Internal harness modules used only by those generators (for example
`specifying-runtime.js` for deterministic proof matrices) are **specifying
tooling under `scripts/`**, not product packages.

## Tests

```bash
pnpm --filter @bitcode/specifying test
pnpm --filter @bitcode/specifying typecheck
```

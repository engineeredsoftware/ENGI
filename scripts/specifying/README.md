<!-- Lives at scripts/specifying (repo metadevelopment tooling, not a product package). -->

# @bitcode/specifying

> **Placement law (V48):** product **core systems** live under `packages/*`.
> This package lives under **`scripts/specifying/`** as the specifying *machine*
> (gate proof generators, canon posture, promotion helpers). It is **not** a
> product package, not website measurement canon, and not a “protocol” product
> owner — the monorepo is protocol canon. Specifying *law* lives in root
> `BITCODE_SPECIFYING.md`.

Bitcode specifying tooling (`scripts/`): gate generators, canon posture, and
promotion helpers used by commercial workflows and proof generation.

**Meta specifying (historical freeze):** promoted version specs, proofs, and
version-bound checks are **immutable canon-at-that-time** — they must not be
edited to chase later tree moves. The **living full-system check** is only for
the current draft/active pointer and must be all-encompassing and completely
correct for present sole-canon. See `BITCODE_SPECIFYING.md` §4.3 and §13.1.
Era-pin shims under `test/era-pinned-*.js` skip superseded historical package
proofs with reason; they do not rewrite those proofs.

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

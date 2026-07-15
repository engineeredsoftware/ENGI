# Codemod — temporary code-modification scripts

**Home for temporary, one-off codemodification scripts for the Bitcode
repository.** This directory lives at the **repo root** (`codemod/`), not under
`apps/uapi` or any single app package.

## When to put a script here

Use `codemod/` for **ephemeral, mechanical refactors** that:

- rename identifiers, paths, or import prefixes across many files
- apply a bounded AST transform (e.g. jscodeshift) once or a few times
- are safe to delete after the migration lands and is verified

Do **not** put durable repo automation here. Ongoing gate checkers, promotion
verifiers, CI helpers, and long-lived maintenance tools belong under
`scripts/` (see `scripts/check-bitcode-*.mjs`, gate scripts, etc.).

| Location | Purpose |
| --- | --- |
| **`codemod/`** (this folder) | Temporary / one-off codemods for Bitcode |
| **`scripts/`** | Durable automation: gates, canon checks, promotion, tooling |

## Conventions

1. **One concern per script** — name it for the transform, e.g.
   `migrate-ui-imports-to-base-shadcn.js`.
2. **Document usage at the top of the file** — dry-run vs apply, target globs,
   required tools (`node`, `npx jscodeshift`, …).
3. **Prefer dry-run first** — never apply on a dirty tree without review.
4. **Delete when done** — after the migration is merged and verified, remove the
   script (or leave only historical notes in this README if useful). Do not let
   `codemod/` become a second `scripts/` tree.
5. **No product runtime** — nothing under `codemod/` is imported by apps,
   packages, or CI required paths unless a human intentionally runs it.

## Layout

```
codemod/
├── README.md                              # this file
└── <transform-name>.js|.mjs|.ts           # one-off scripts (add as needed)
```

## Current scripts

### `migrate-ui-imports-to-base-shadcn.js`

jscodeshift transform: `@/components/ui/<mod>` → `@/components/shadcn/<mod>`.

```sh
# Dry-run
npx jscodeshift -d -p -t codemod/migrate-ui-imports-to-base-shadcn.js \
  'apps/uapi/app/**/*.tsx' 'apps/uapi/components/**/*.tsx'

# Apply
npx jscodeshift -t codemod/migrate-ui-imports-to-base-shadcn.js \
  'apps/uapi/app/**/*.tsx' 'apps/uapi/components/**/*.tsx'
```

After `--apply` / non-dry runs: `git diff`, then lint/typecheck/tests for the
touched apps.

## Adding a new temporary codemod

1. Create `codemod/<name>.js` (or `.mjs`) with a short header comment and usage.
2. List it under **Current scripts** in this README (or remove the entry when
   you delete the script after the migration).
3. Run dry-run → apply → review → test → commit the **result** of the codemod
   with product/source changes; keep the script only while still useful.

## Related docs

- Repo layout contract: `docs/BITCODE_SOURCE_LAYOUT.md` (§ monorepo roots
  and tooling homes).
- Agents: temporary codemods are **implementation tooling**, not product
  surface; do not version-prefix them (`v48-codemod-*`).

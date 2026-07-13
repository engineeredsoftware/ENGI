# @bitcode/pipeline-hosts

**Status:** retained AssetPack host orchestration barrel.

Prefer host primitives/bases:
- `@bitcode/host-generics`
- `@bitcode/generic-hosts-local` (`packages/generic-hosts/Local`)
- `@bitcode/generic-hosts-vercel-sandbox` (`packages/generic-hosts/VercelSandbox`)

This package keeps AssetPack-specific host plan/runners (`asset-pack-host-*`)
and thin re-exports of local/vercel sandbox hosts for pipeline callers.
New host implementations belong under `generic-hosts/*`, not here.

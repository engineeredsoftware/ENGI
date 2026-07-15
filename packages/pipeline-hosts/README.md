# @bitcode/pipeline-hosts

**Status:** retained AssetPack host orchestration barrel.

Prefer host primitives/bases:
- `@bitcode/host-generics`
- `@bitcode/generic-hosts-local` (`packages/generic-hosts/Local`)
- `@bitcode/generic-hosts-vercel-sandbox` (`packages/generic-hosts/VercelSandbox`)

This package keeps AssetPack-specific host plan/runners (`asset-pack-host-*`)
and thin re-exports of local/vercel sandbox hosts for pipeline callers.
New host implementations belong under `generic-hosts/*`, not here.

## Pipeline appliance image (Production)

Set `BITCODE_PIPELINE_SANDBOX_IMAGE` (and `BITCODE_PIPELINE_HOST=sandbox`) so
`buildAssetPackSandboxHostPlan` uses `Sandbox.create({ image })` with the VCR
pipeline appliance from `@bitcode/pipeline-image` instead of stock `node24` +
in-box monorepo install. See `packages/pipeline-image/README.md`.

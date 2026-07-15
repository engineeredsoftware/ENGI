# @bitcode/pipeline-hosts

**Status:** retained AssetPack host orchestration barrel.

Prefer host primitives/bases:
- `@bitcode/host-generics`
- `@bitcode/generic-hosts-local` (`packages/generic-hosts/Local`)
- `@bitcode/generic-hosts-vercel-sandbox` (`packages/generic-hosts/VercelSandbox`)

This package keeps AssetPack-specific host plan/runners (`asset-pack-host-*`)
and thin re-exports of local/vercel sandbox hosts for pipeline callers.
New host implementations belong under `generic-hosts/*`, not here.

## Pipeliner image (Production)

**Pipeliner** VCR repo: `vcr.vercel.com/gerald-davis-projects/bitcode/pipeliner`

Set `BITCODE_PIPELINE_SANDBOX_IMAGE` to that image (sha tag preferred) so
`buildAssetPackSandboxHostPlan` uses `Sandbox.create({ image })` instead of
stock `node24` + in-box monorepo install. Serverless always selects sandbox
host; LocalHost is local-machine only. See `packages/pipeline-image/README.md`.

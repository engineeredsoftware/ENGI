# Images

OCI / appliance images built from the monorepo. Images may depend on
`/packages` and materialize runners from host packages; they do not reverse
import from `/apps`.

| Image | Path | Package name | Role |
|-------|------|--------------|------|
| **pipeliner** | `images/pipeliner` | `@bitcode/pipeline-image` | Vercel Sandbox pipeline appliance (VCR) |

## Pipeliner

```bash
pnpm --filter @bitcode/pipeline-image run materialize
docker build -f images/pipeliner/Dockerfile \
  -t vcr.vercel.com/gerald-davis-projects/bitcode/pipeliner:latest \
  .
```

See `images/pipeliner/README.md`.

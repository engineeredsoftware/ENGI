# Images

OCI / appliance images built from the monorepo. Images may depend on
`/packages` and materialize runners from host packages; they do not reverse
import from `/apps`.

| Image | Path | Package name | Role |
|-------|------|--------------|------|
| **pipeliner** | `containers/images/pipeliner` | `@bitcode/pipeline-image` | Vercel Sandbox pipeline appliance (VCR) |

## Pipeliner

```bash
pnpm --filter @bitcode/pipeline-image run materialize
docker build -f containers/images/pipeliner/Dockerfile \
  -t vcr.vercel.com/gerald-davis-projects/bitcode/pipeliner:latest \
  .
```

See `containers/images/pipeliner/README.md`.

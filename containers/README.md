# Containers

OCI images and cluster manifests for Bitcode runtime packaging.

| Path | Role |
| --- | --- |
| `containers/images/` | OCI / appliance images (e.g. Pipeliner VCR) |
| `containers/k8/` | Kubernetes manifests (long-runner fleet, …) |

Images may depend on `/packages` and materialize runners from host packages;
they do not reverse-import from `/apps`.

See `containers/images/README.md` and `containers/k8/README.md`.

# Long-Runner Kubernetes Deployment (MVP)

This folder contains minimal manifests to run the **long-runner worker fleet**
on any vanilla Kubernetes cluster.  It deliberately stays lightweight – once
the pattern is proven we can switch to Helm/Kustomize and Karpenter-managed
node pools.

## Components

| File | Purpose |
|------|---------|
| `long-runner.yaml` | Namespace, ConfigMap, Secret, Worker `Deployment`, HPA, Service & ServiceMonitor |

### Scaling
The HPA references a custom pod metric `queued_jobs` which must be generated
by Prometheus (or another metrics backend).  A simple approach is a Prometheus
`ServiceMonitor` that queries:

```sql
select count(*) from run_jobs where status = 'queued';
```

and exposes it via the [Postgres Exporter].  Once the metric is available the
Prometheus → k8s-adapter makes it visible to autoscaling.

Additionally, each worker pod exposes a `/metrics` endpoint (port 9090)
containing:

* `queued_jobs` – cluster-wide queue depth (the worker fetches this on every
  polling cycle).
* `running_jobs` – number of jobs currently executed by **this** pod.

The manifest already defines a `Service` and `ServiceMonitor` so Prometheus
scrapes the endpoint automatically.

## Deployment steps (outline)

```bash
# 1. Create namespace & config/secret (fill in real values)
envsubst < long-runner.yaml | kubectl apply -f -

# 2. Ensure nodes have enough disk and Docker layer cache (AMI bake).

# 3. Verify
kubectl -n long-runner get pods

# 4. Toggle traffic from edge
kubectl set env deploy/long-runner-worker -n long-runner LONG_RUNNER_QUEUE=true

# 5. Remove inline execution path once stable.
```

> For production we will migrate to a Helm chart with:
> * Separate PodDisruptionBudget
> * Karpenter `nodePools` (on-demand & spot)
> * Secret management via AWS Secrets Manager / SOPS

# @bitcode/kubernetes (BC)

**Compatibility re-export.** Full implementation lives at:

```
packages/containerizations/kubernetes/   →  @bitcode/containerizations-kubernetes
```

```ts
// Prefer hierarchy name in new code
import { … } from '@bitcode/containerizations-kubernetes';

// BC (still supported)
import { … } from '@bitcode/kubernetes';
```

Kubernetes cluster management tools for the Bitcode platform. Provides essential
cluster introspection and resource management capabilities. Designed for
integration with Bitcode pipeline monitoring and infrastructure management.

See `packages/containerizations/kubernetes/README.md` for the full package surface.

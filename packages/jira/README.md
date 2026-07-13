# @bitcode/jira (BC)

**Compatibility re-export.** Full implementation lives at:

```
packages/externals/jira/   →  @bitcode/externals-jira
```

```ts
// Prefer hierarchy name in new code
import { … } from '@bitcode/externals-jira';

// BC (still supported)
import { … } from '@bitcode/jira';
```

Jira Cloud API integration for the Bitcode platform (OAuth client, issues, projects, JQL).
See `packages/externals/jira/README.md` for the full package surface.

# Global constants

Single-value constants live as plain text files. **One variable per file.**

## Naming

| Piece | Rule | Example |
| --- | --- | --- |
| Variable | `GLOBAL_CONSTANT_<SLUG>` | `GLOBAL_CONSTANT_BITCODE_WHITEPAPER_URL` |
| File | `global-constant-<slug>.txt` | `global-constant-bitcode-whitepaper-url.txt` |
| File body | **Only** the value (no quotes, no key, no trailing prose) | URL or scalar string |

Current constants: whitepaper URL, repository URL, X (`bitcodehq`) URL.

## Sync

```bash
node constants/sync-global-constants.mjs
```

Writes `global-constants.ts` for TypeScript import (client + server). The `.txt` files remain the editable source of truth.

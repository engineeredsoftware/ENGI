# @bitcode/obfuscation

Privacy-preserving code transformation primitives for deposit obfuscations
and related withhold paths.


## Naming

This package is **not** `*-generics`: there is no parallel `generic-obfuscate/*`
implementor family. Path and package name are plain `obfuscation`.

## Surface

| Module | Role |
| --- | --- |
| `primitives` | Signatures, levels, reversibility modes, rules |
| `generics` | Execution context and composition helpers (historical name inside package) |
| `tools` | Operational transform tools |

```ts
import { /* primitives / tools */ } from '@bitcode/obfuscation';
// or from '@bitcode/obfuscation'
```

Product deposit UI “Obfuscations” input maps to these transforms when non-empty;
empty obfuscations skip Setup LLM per V48 Gate 3 law.

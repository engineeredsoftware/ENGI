# UAPI Components

V48 component architecture (see `BITCODE_SPEC_V48.md` and
`internal-docs/BITCODE_FRONTEND_ARCHITECTURE.md`):

```
Shadcn*  →  Bitcode*  →  Experience*
```

| Directory | Role |
| --- | --- |
| `shadcn/` | Root primitives exported as `Shadcn*` |
| `bitcode/` | Shared Bitcode base (`Bitcode*`, pipeline, layout, auth) |
| `marketing/` | Landing / public marketing |
| `packs/` | `/packs` experience |
| `reads/` | `/reads` experience |
| `deposits/` | `/deposits` experience |
| `docs/` | `/docs` experience |
| `conversations/` | Conversations (structure; full UX deferred) |
| `auxillaries/` | Auxillaries experience |

**Import rules:** experiences import Bitcode only; Bitcode imports Shadcn only;
pages compose experiences/Bitcode. No experience imports another experience.

**Migration:** Phase 1 moved shadcn/bitcode out of `base/` into these trees.
Experience directories hold READMEs until page-local components relocate
(Phase 4). Prefer new files under the target directories above.

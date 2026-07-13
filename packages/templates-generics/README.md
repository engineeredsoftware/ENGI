# @bitcode/templates-generics

**Not prompt templating.** Exchange/Shippable template CRUD: user-saved PR shippable
templates and evidence-document templates stored in Supabase.

| Concern | Package |
| --- | --- |
| Shippable / evidence document templates | **this package** (`TemplatesService`) |
| Prompt formatting / promptparts | `@bitcode/prompts` |

**Decision (V48):** keep. Not removable without losing template persistence API.
Do **not** move into prompts — domain is shippable product templates, not LLM prompts.
If more template domains appear later, split as `template-generics` + `generic-templates/*`.

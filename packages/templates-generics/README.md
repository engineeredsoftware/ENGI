# @bitcode/templates-generics

**Not prompt templating.** Delivery template CRUD: user-saved PR delivery
templates and evidence-document templates stored in Supabase.

| Concern | Package |
| --- | --- |
| Delivery / evidence document templates | **this package** (`TemplatesService`) |
| Prompt formatting / promptparts | `@bitcode/prompts` |

**Decision (V48):** keep. Not removable without losing template persistence API.
Do **not** move into prompts — domain is product delivery templates, not LLM prompts.
Physical DB columns may still say `deliverable_templates` / `shippable_type`;
app-facing API uses `delivery_templates` / delivery types.

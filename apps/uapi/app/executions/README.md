# `/app/executions` Bitcode Pipeline Executions route

`/executions` is the product surface for pipeline run history, settle delivery
panels, AssetPack synthesis evidence, and execution logs.

Protocol law:
- Deposit/Read synthesis = SDIVF (Finish closes evidence; does not open buyer PRs)
- Buyer-repo PR shipping = settle Simple (`ship-asset-pack-patch-pr`) → `settleDelivery`

Current owners:
- `page.tsx` / `[runId]/page.tsx` — route shells
- `components/bitcode/pipeline/*` — Executions UI (header, complete, settle delivery panels)
- `../api/executions/route.ts` — live SDIVF synthesis (`asset-pack-pipeline` handlers)
- `../api/executions/history/*` — history reread JSON
- `../api/templates/delivery/route.ts` — delivery template CRUD
- `../api/auxillaries/template-preferences/route.ts` — `delivery_templates` prefs

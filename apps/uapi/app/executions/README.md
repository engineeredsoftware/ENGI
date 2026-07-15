# `/app/executions` retained Bitcode Executions route

`/executions` remains the retained execution route during V26 fourth-gate convergence.

It is not the final Bitcode product topology.
Merged-world V26 keeps this retained route explicit as `executions`, where Bitcode execution primitives, pipelines, and measured-read follow-through remain inspectable while the broader `activity` family grows around transactions, executions, and notifications.
The retained execution route must remain explicit and healthy while the strongest execution, Shippable, and inspection patterns continue porting inward to `/terminal`.

Current owners:
- `page.tsx`
  Direct route metadata for the retained executions surface.
- `[runId]/page.tsx`
  Direct retained execution-detail route for one run.
- `components/ExecutionsPage.tsx`
  Route-level shell for the main retained executions read.
- `components/ExecutionsPageClient.tsx`
  The active retained runs, Shippables, AssetPack evidence, and execution-log composition owner.
- `components/ExecutionsDetailsView.tsx`
  Shared retained execution-detail carrier used by direct route and converged application reads.
- `../api/executions/route.ts`
  Active app-owned `/api/executions` route mounted from the canonical Shippables business-logic owner.
- `../api/executions/history/*`
  App-owned retained history JSON carriers for selected-run hydration.
- `../api/vcs/route.ts`
  Retained support carrier for provider/account/repository/branch/commit/issue reads required by the execution selectors.
- `../api/templates/shippables/route.ts`
  Active Shippable template reads and writes used by the execution composer.
- `../api/auxillaries/template-preferences/route.ts`
  Retained support storage carrier for saved Shippable-template preferences used by the execution composer.

This route should stay explicit about:
- retained executions, measured-read runs, pipeline continuity, and execution-primitives naming,
- the broader `activity` family above transactions, executions, and notifications,
- Shippable, AssetPack evidence, and execution inspection semantics,
- retained support API ownership required to keep the route healthy during inward convergence,
- direct route/API ownership during fourth-gate,
- and inward convergence toward `/terminal` plus merged-world `activity` ownership rather than peer-product permanence.

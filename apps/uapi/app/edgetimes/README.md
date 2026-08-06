# `/app/edgetimes` Bitcode Edgetimes

`/edgetimes` is the fourth-gate storage and API read for Bitcode V26.

It exists so PostgreSQL/Supabase persistence, the retained ORM/query layer, generated database types, and package admissions stop living only in draft prose.

Current owners:
- `edgetimes-topology.ts`
  Shared fourth-gate ownership map consumed by the route and API.
- `EdgetimesPageContent.tsx`
  Public/docs-branded read surface for storage, schema, package, and next-obligation posture.
- `page.tsx`
  Route metadata and mounted public-shell composition.

API:
- `/api/edgetimes`
  JSON witness for the same ownership topology used by the route.

This route should stay explicit about:
- migration baseline ownership,
- generated types and ORM/query boundaries,
- retained package admissions,
- unresolved schema/table carriers,
- and the next obligations before fourth-gate can be considered closed.

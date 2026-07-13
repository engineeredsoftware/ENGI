/**
 * @bitcode/api — route-level orchestration + shared API primitives.
 *
 * Owns: HTTP route handlers, pipeline control helpers, and co-located primitives
 * under `responses/` and `streams/` (also exported as `@bitcode/api/responses`
 * and `@bitcode/api/streams`; BC packages `@bitcode/responses` / `@bitcode/streams`).
 *
 * Does not own: product domain law (prefer `btd`, `pipeline-asset-pack`,
 * `conversations`, `vcs-generics`, …). Next `uapi/app/api/*` bindings stay thin.
 *
 * Key principles:
 * - Route ownership lives here; FS interface bindings stay thin
 * - Deeper functionality stays in narrower packages
 * - Database via `@bitcode/orm`; auth via `@bitcode/auth`
 * - Prefer `@bitcode/vcs-generics` / `generic-vcs-*` in new VCS code
 * - User scoping is enforced at the route-orchestration layer
 */

// Conversations - Message-centric with attachments
export * from './conversations';
export * from './routes/conversations';
export * from './routes/auxillaries';
export * from './routes/auxillaries-contract';
export * from './routes/btd-crypto';
export * from './routes/executions';
export * from './pipelines/branch';

// VCS - Version control system operations
export * from './vcs';
export * from './routes/auth';
export * as shippables from './routes/shippables';

// Additional business logic modules will be added here as they're migrated
// from routes to this package

export * from './pipelines/cancel';
export * from './pipelines/orphan-sweep';

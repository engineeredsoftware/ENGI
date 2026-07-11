/**
 * Bitcode API - Kitchen sink of route-level API orchestration
 *
 * This package contains route handlers and orchestration logic for the Bitcode
 * system. Interface owners such as the Next.js App Router or the ChatGPT app
 * import handlers from here, while narrower subsystem behavior remains in the
 * appropriate packages and is consumed by these route handlers.
 *
 * Key principles:
 * - Route ownership lives here; FS interface bindings stay thin
 * - Deeper functionality stays in narrower packages
 * - All database operations use @bitcode/orm
 * - All auth uses @bitcode/auth
 * - All VCS operations use @bitcode/vcs
 *
 * Architecture:
 * - Route modules export interface-ready handlers
 * - Lower-level modules export framework-agnostic business logic
 * - All handlers have comprehensive error handling
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

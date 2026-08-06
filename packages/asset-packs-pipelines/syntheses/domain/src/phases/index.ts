/**
 * AssetPack Pipeline Phases
 *
 * Deposit and read synthesis are SEPARATE specific pipelines (no lens/mode).
 * Prefer importing executionPipelineSDIVFExecutionPhaseSynthesisDepositAssetPacks / executionPipelineSDIVFExecutionPhaseSynthesisReadAssetPacks from the product packages directly.
 *
 * This barrel intentionally does **not** statically import product packages
 * (that creates a cycle: syntheses-domain → deposit/read → syntheses-domain).
 * Shared phase helpers (setup/discovery/implementation/validation/finish modules)
 * are exported from their own paths on this package.
 */

export type { } from './setup'; // keep as phases package root; product rosters live on deposit/read

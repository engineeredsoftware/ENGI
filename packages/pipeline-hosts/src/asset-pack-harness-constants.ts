/**
 * AssetPack sandbox harness path and timeout constants.
 * Shared by harness plan builder and in-box runner templates.
 */

export const HARNESS_DIRECTORY = '.bitcode/pipeline-harness';
export const MANIFEST_PATH = `${HARNESS_DIRECTORY}/manifest.json`;
export const HOST_SMOKE_RUNNER_PATH = `${HARNESS_DIRECTORY}/run-host-smoke.mjs`;
export const LIVE_PIPELINE_RUNNER_PATH = `${HARNESS_DIRECTORY}/run-live-asset-pack-pipeline.ts`;
export const SOURCE_OVERLAY_PATCH_PATH = `${HARNESS_DIRECTORY}/source-overlay.patch`;
export const EVIDENCE_PATH = `${HARNESS_DIRECTORY}/evidence.json`;
export const TELEMETRY_PATH = `${HARNESS_DIRECTORY}/telemetry.jsonl`;
export const TSCONFIG_PATHS_REGISTER_PATH = `${HARNESS_DIRECTORY}/node_modules/tsconfig-paths/register`;
export const PIPELINE_STDOUT_PATH = `${HARNESS_DIRECTORY}/pipeline.stdout.log`;
export const PIPELINE_STDERR_PATH = `${HARNESS_DIRECTORY}/pipeline.stderr.log`;
export const PIPELINE_EXIT_CODE_PATH = `${HARNESS_DIRECTORY}/pipeline.exit-code`;
export const SANDBOX_WORKING_DIRECTORY = '/vercel/sandbox' as const;
export const DEFAULT_LONG_TIMEOUT_MS = 45 * 60 * 1000;
export const SANDBOX_PNPM_VERSION = '10.33.0';

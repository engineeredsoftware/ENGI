/**
 * AssetPack sandbox host path and timeout constants.
 * Shared by host plan builder and in-box runner templates.
 */

export const HOST_RUN_DIRECTORY = '.bitcode/pipeline-host';
export const MANIFEST_PATH = `${HOST_RUN_DIRECTORY}/manifest.json`;
export const HOST_SMOKE_RUNNER_PATH = `${HOST_RUN_DIRECTORY}/run-host-smoke.mjs`;
export const LIVE_PIPELINE_RUNNER_PATH = `${HOST_RUN_DIRECTORY}/run-live-asset-pack-pipeline.ts`;
export const SOURCE_OVERLAY_PATCH_PATH = `${HOST_RUN_DIRECTORY}/source-overlay.patch`;
export const EVIDENCE_PATH = `${HOST_RUN_DIRECTORY}/evidence.json`;
export const TELEMETRY_PATH = `${HOST_RUN_DIRECTORY}/telemetry.jsonl`;
export const TSCONFIG_PATHS_REGISTER_PATH = `${HOST_RUN_DIRECTORY}/node_modules/tsconfig-paths/register`;
export const PIPELINE_STDOUT_PATH = `${HOST_RUN_DIRECTORY}/pipeline.stdout.log`;
export const PIPELINE_STDERR_PATH = `${HOST_RUN_DIRECTORY}/pipeline.stderr.log`;
export const PIPELINE_EXIT_CODE_PATH = `${HOST_RUN_DIRECTORY}/pipeline.exit-code`;
export const SANDBOX_WORKING_DIRECTORY = '/vercel/sandbox' as const;
export const DEFAULT_LONG_TIMEOUT_MS = 45 * 60 * 1000;
export const SANDBOX_PNPM_VERSION = '10.33.0';

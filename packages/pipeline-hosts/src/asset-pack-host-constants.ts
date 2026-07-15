/**
 * AssetPack sandbox host path and timeout constants.
 * Shared by host plan builder and in-box runner templates.
 */

export const HOST_RUN_DIRECTORY = '.proofs/pipeline-host';
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

/**
 * Pipeliner — VCR pipeline appliance image.
 * Purpose: run deposit/read AssetPack synthesis inside Vercel Sandbox microVMs
 * (and local Docker) with Bitcode packages preinstalled — never LocalHost on
 * serverless.
 */
export const PIPELINER_VCR_REPOSITORY =
  'vcr.vercel.com/gerald-davis-projects/bitcode/pipeliner';
/** Prefer a git-sha tag in Production; :latest is convenience for push/dev. */
export const PIPELINER_IMAGE_DEFAULT = `${PIPELINER_VCR_REPOSITORY}:latest`;

/** In-image dispatcher entry (Pipeliner image layout). */
export const PIPELINE_IMAGE_ENTRY_DEFAULT = '/opt/bitcode/pipeline/run-pipeline.mjs';
export const PIPELINE_IMAGE_MONOREPO_ROOT_DEFAULT = '/opt/bitcode';

/** Env: when set, host plans use Sandbox.create({ image }) instead of runtime. */
export const PIPELINE_SANDBOX_IMAGE_ENV = 'BITCODE_PIPELINE_SANDBOX_IMAGE';
export const PIPELINE_IMAGE_ENTRY_ENV = 'BITCODE_PIPELINE_IMAGE_ENTRY';

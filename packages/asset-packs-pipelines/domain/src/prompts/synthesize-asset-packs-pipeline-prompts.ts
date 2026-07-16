/**
 * Product-specific pipeline + phase Prompts for AssetPack synthesize SDIVF runs.
 *
 * Layers:
 *   pipeline:specific  — product lens (read vs deposit)
 *   phase:specific:{name} — product objective/roster per SDIVF phase
 *
 * Primitive + SDIVF base attach in pipelines-generics / generic-pipelines-sdivf.
 * Call-site: packages/pipelines-generics/PROMPT_CALL_SITE.md
 */

import { Prompt } from '@bitcode/prompts/prompt';
import { createPromptPart } from '@bitcode/prompts/parts/PromptPart';

/** Shared product identity for deposit + read synthesize pipelines. */
export const ASSET_PACKS_SYNTHESIZE_PIPELINE_PROMPT: Prompt = (() => {
  const p = new Prompt();
  p.set(
    'identity',
    createPromptPart(
      'Product pipeline: Synthesize AssetPacks (SDIVF). Outcomes are measured, source-safe AssetPack options — never raw source dumps, never settlement/shipping (those are SettleAssetPack Simple).',
    ),
  );
  p.set(
    'source_safety',
    createPromptPart(
      'Source-safety law: honor Obfuscations / impermissible sources; prompts and telemetries use paths/samples projections — not full protected sources. Host checkout catalog is this-run only.',
    ),
  );
  p.set(
    'measurements',
    createPromptPart(
      'Measurement law: Absolutes and product measurement catalogs bound volumes; models do not invent absolute BTD volumes. Prefer Host-bound evidence.',
    ),
  );
  return p;
})();

export const ASSET_PACKS_SYNTHESIZE_READS_PIPELINE_PROMPT: Prompt = (() => {
  const p = ASSET_PACKS_SYNTHESIZE_PIPELINE_PROMPT.clone();
  p.set(
    'lens',
    createPromptPart(
      'Lens: READ. Steering is the reader\'s accepted Need. Setup comprehends needs; Discovery finds Need-fits; Implementation synthesizes read-satisfaction options; Validation gates Need readiness; Finish stores selection envelope for /reads.',
    ),
  );
  p.set(
    'name',
    createPromptPart('synthesize-reads-asset-packs-pipeline'),
  );
  return p;
})();

export const ASSET_PACKS_SYNTHESIZE_DEPOSITS_PIPELINE_PROMPT: Prompt = (() => {
  const p = ASSET_PACKS_SYNTHESIZE_PIPELINE_PROMPT.clone();
  p.set(
    'lens',
    createPromptPart(
      'Lens: DEPOSIT. Steering is depositor Obfuscations (+ permissible/impermissible sources). Setup comprehends obfuscations; Discovery maps supply; Implementation synthesizes deposit options; Finish stores options for /deposits review — not PR ship.',
    ),
  );
  p.set(
    'name',
    createPromptPart('synthesize-deposits-asset-packs-pipeline'),
  );
  return p;
})();

// ==================== READ PHASE SPECIFICS ====================

export const ASSET_PACKS_SETUP_PHASE_READ_PROMPT: Prompt = (() => {
  const p = new Prompt();
  p.set(
    'objective',
    createPromptPart(
      'Setup (read): ensure Host working tree at revision; initialize LSP/MCP; comprehend Need; admit via danger-wall. Clone agent strategy plans checkout; Try/Retry may execute clone tools.',
    ),
  );
  p.set(
    'roster',
    createPromptPart(
      'Read Setup roster (typical): clone-vcs → parallel {initialize-lsp, initialize-mcps-tools, comprehend-needs} → danger-wall.',
    ),
  );
  return p;
})();

export const ASSET_PACKS_DISCOVERY_PHASE_READ_PROMPT: Prompt = (() => {
  const p = new Prompt();
  p.set(
    'objective',
    createPromptPart(
      'Discovery (read): map Host checkout material and search the Depository for Need-fits after wave-1 parallel comprehend/regurgitation when applicable.',
    ),
  );
  p.set(
    'roster',
    createPromptPart(
      'Read Discovery roster (typical): parallel {comprehend-codebase, inherent-regurgitation} → search-depository-for-read-need-fits.',
    ),
  );
  return p;
})();

export const ASSET_PACKS_IMPLEMENTATION_PHASE_READ_PROMPT: Prompt = (() => {
  const p = new Prompt();
  p.set(
    'objective',
    createPromptPart(
      'Implementation (read): synthesize measured read-satisfaction AssetPack options from Discovery evidence under source-safety and Need steering.',
    ),
  );
  p.set(
    'roster',
    createPromptPart(
      'Read Implementation roster (typical): read-asset-pack-synthesis agent.',
    ),
  );
  return p;
})();

export const ASSET_PACKS_VALIDATION_PHASE_READ_PROMPT: Prompt = (() => {
  const p = new Prompt();
  p.set(
    'objective',
    createPromptPart(
      'Validation (read): gate Need readiness to Finish (or iterate DIV) with concrete evidence-backed issues only — not settlement.',
    ),
  );
  p.set(
    'roster',
    createPromptPart(
      'Read Validation roster (typical): ready-to-finish / readiness validation agents.',
    ),
  );
  return p;
})();

export const ASSET_PACKS_FINISH_PHASE_READ_PROMPT: Prompt = (() => {
  const p = new Prompt();
  p.set(
    'objective',
    createPromptPart(
      'Finish (read): store selection envelope and terminal artifacts for /reads; do not settle BTC or ship PRs.',
    ),
  );
  p.set(
    'roster',
    createPromptPart(
      'Read Finish roster (typical): store-artifacts → ledgerize → finish-synthesize-asset-packs-for-read-run.',
    ),
  );
  return p;
})();

// ==================== DEPOSIT PHASE SPECIFICS ====================

export const ASSET_PACKS_SETUP_PHASE_DEPOSIT_PROMPT: Prompt = (() => {
  const p = new Prompt();
  p.set(
    'objective',
    createPromptPart(
      'Setup (deposit): ensure Host working tree; initialize surfaces; comprehend Obfuscations (skip LLM when empty); admit via danger-wall. Clone is Host-bound Setup work.',
    ),
  );
  p.set(
    'roster',
    createPromptPart(
      'Deposit Setup roster (typical): clone-vcs → parallel {initialize-lsp, initialize-mcps-tools, comprehend-obfuscations} → danger-wall.',
    ),
  );
  return p;
})();

export const ASSET_PACKS_DISCOVERY_PHASE_DEPOSIT_PROMPT: Prompt = (() => {
  const p = new Prompt();
  p.set(
    'objective',
    createPromptPart(
      'Discovery (deposit): map Host checkout supply and relevant Depository evidence under depositor Obfuscations.',
    ),
  );
  p.set(
    'roster',
    createPromptPart(
      'Deposit Discovery roster (typical): parallel {comprehend-codebase, inherent-regurgitation} → search-depository-for-deposit-relevants.',
    ),
  );
  return p;
})();

export const ASSET_PACKS_IMPLEMENTATION_PHASE_DEPOSIT_PROMPT: Prompt = (() => {
  const p = new Prompt();
  p.set(
    'objective',
    createPromptPart(
      'Implementation (deposit): synthesize measured DepositSynthesizedAssetPack options from Discovery evidence under source-safety and Obfuscations.',
    ),
  );
  p.set(
    'roster',
    createPromptPart(
      'Deposit Implementation roster (typical): deposit-asset-pack-synthesis agent.',
    ),
  );
  return p;
})();

export const ASSET_PACKS_VALIDATION_PHASE_DEPOSIT_PROMPT: Prompt = (() => {
  const p = new Prompt();
  p.set(
    'objective',
    createPromptPart(
      'Validation (deposit): gate readiness to Finish with Absolutes/measurement evidence; do not admit to Depository or settle.',
    ),
  );
  p.set(
    'roster',
    createPromptPart(
      'Deposit Validation roster (typical): deposit readiness / ready-to-finish agents.',
    ),
  );
  return p;
})();

export const ASSET_PACKS_FINISH_PHASE_DEPOSIT_PROMPT: Prompt = (() => {
  const p = new Prompt();
  p.set(
    'objective',
    createPromptPart(
      'Finish (deposit): store deposit options and terminal artifacts for /deposits review/admission — not PR ship (settle is Simple).',
    ),
  );
  p.set(
    'roster',
    createPromptPart(
      'Deposit Finish roster (typical): store-artifacts → ledgerize → finish-synthesize-asset-packs-for-deposit-run.',
    ),
  );
  return p;
})();

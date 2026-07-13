import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';

const finishSpec = readFileSync(new URL('../V26_PIPELINE_FINISH_REFORM.md', import.meta.url), 'utf8');
const shippableSpec = readFileSync(new URL('../V26_SHIPPABLE_REFORM.md', import.meta.url), 'utf8');
const canonicalSpec = readFileSync(new URL('../../BITCODE_SPEC_V26.md', import.meta.url), 'utf8');
const sdivFactorySource = readFileSync(
  new URL('../../packages/pipelines-generics/src/phases/sdivf-factory.ts', import.meta.url),
  'utf8'
);
const phaseFactorySource = readFileSync(
  new URL('../../packages/pipelines-generics/src/phases/phase-factory.ts', import.meta.url),
  'utf8'
);
const pipelineFactorySource = readFileSync(
  new URL('../../packages/pipelines-generics/src/pipeline-factory.ts', import.meta.url),
  'utf8'
);
const primitivesSource = readFileSync(
  new URL('../../packages/pipelines-generics/src/types/primitives.ts', import.meta.url),
  'utf8'
);
const assetPackIndexSource = readFileSync(
  new URL('../../packages/asset-packs-pipelines/domain/src/index.ts', import.meta.url),
  'utf8'
);
const assetPackPackageSource = readFileSync(
  new URL('../../packages/asset-packs-pipelines/domain/package.json', import.meta.url),
  'utf8'
);
const assetPackReadmeSource = readFileSync(
  new URL('../../packages/asset-packs-pipelines/domain/README.md', import.meta.url),
  'utf8'
);
const rootTsconfigSource = readFileSync(new URL('../../tsconfig.json', import.meta.url), 'utf8');
const uapiNextConfigSource = readFileSync(new URL('../../uapi/next.config.mjs', import.meta.url), 'utf8');
const pnpmLockSource = readFileSync(new URL('../../pnpm-lock.yaml', import.meta.url), 'utf8');
const assetPackPhasesSource = readFileSync(
  new URL('../../packages/asset-packs-pipelines/domain/src/phases/index.ts', import.meta.url),
  'utf8'
);
const finishPhaseSource = readFileSync(
  new URL('../../packages/asset-packs-pipelines/domain/src/phases/finish.ts', import.meta.url),
  'utf8'
);
const deliverAgentSource = readFileSync(
  new URL('../../packages/asset-packs-pipelines/domain/src/agents/finish/deliver-asset-pack-to-destination-agent.ts', import.meta.url),
  'utf8'
);
const assetPackNamedDeliverAgentSource = readFileSync(
  new URL('../../packages/asset-packs-pipelines/domain/src/agents/finish/asset-pack-finish-deliver-asset-pack-to-destination-agent.ts', import.meta.url),
  'utf8'
);
const assetPackCompletionSource = readFileSync(
  new URL('../../packages/asset-packs-pipelines/domain/src/agents/finish/asset-pack-completion-agent.ts', import.meta.url),
  'utf8'
);
const assetPackNamedCompletionSource = readFileSync(
  new URL('../../packages/asset-packs-pipelines/domain/src/agents/finish/asset-pack-finish-asset-pack-completion-agent.ts', import.meta.url),
  'utf8'
);
const postprocessSource = readFileSync(
  new URL('../../packages/asset-packs-pipelines/domain/src/postprocess.ts', import.meta.url),
  'utf8'
);
const promptBuilderDir = new URL('../../packages/asset-packs-pipelines/domain/src/agents/prompts/', import.meta.url);
const readyToFinishPromptSource = readFileSync(new URL('../../packages/asset-packs-pipelines/domain/src/agents/prompts/asset-pack-validation-ready-to-finish-prompt.ts', import.meta.url), 'utf8');
const finalizeDeliveryEvidencePromptSource = readFileSync(new URL('../../packages/asset-packs-pipelines/domain/src/agents/prompts/finalize-delivery-evidence-prompt.ts', import.meta.url), 'utf8');
const validationReadyAgentSource = readFileSync(
  new URL('../../packages/asset-packs-pipelines/domain/src/agents/validation/asset-pack-ready-to-finish-agent.ts', import.meta.url),
  'utf8'
);
const finishDeliveryAgentsSource = readFileSync(
  new URL('../../packages/asset-packs-pipelines/domain/src/agents/finish-delivery-agents.ts', import.meta.url),
  'utf8'
);

function listFiles(dirUrl) {
  return readdirSync(dirUrl, { withFileTypes: true }).flatMap((entry) => {
    const child = new URL(entry.name + (entry.isDirectory() ? '/' : ''), dirUrl);
    return entry.isDirectory() ? listFiles(child) : [child.pathname];
  });
}

test('V26 specifies Finish as the broad final phase and Delivering as destination handoff', () => {
  assert.match(finishSpec, /The broad final phase of a phased Bitcode agentic pipeline is `Finish`/);
  assert.match(finishSpec, /`Delivering` owns connected-interface Shippables/);
  assert.match(finishSpec, /`SDIVF` is the canonical retained phased pipeline implementation/);
  assert.match(shippableSpec, /active AssetPack phase, registry, tool, and store code must use `SDIVF` \/ `finish` behavior directly/);
  assert.match(canonicalSpec, /`SDIVF` is the canonical phased implementation/);
});

test('pipeline generics expose canonical SDIVF APIs without active SDIVS wrappers', () => {
  assert.match(phaseFactorySource, /export enum SDIVFPhase/);
  assert.match(phaseFactorySource, /FINISH = 'finish'/);
  assert.match(phaseFactorySource, /export function factorySDIVFPhaseDelegators/);
  assert.doesNotMatch(phaseFactorySource, /factorySDIVSPhaseDelegators/);
  assert.match(sdivFactorySource, /export interface SDIVFConfig/);
  assert.match(sdivFactorySource, /export function factorySDIVFPipeline/);
  assert.match(sdivFactorySource, /pipelineExec\.store\('pipeline', 'pattern', 'SDIVF'\)/);
  assert.match(sdivFactorySource, /pipelineExec\.store\('phase', 'current', 'finish'\)/);
  assert.doesNotMatch(sdivFactorySource, /factorySDIVSPipeline|factorySDIVSExecutorPipeline|SDIVSConfig|SDIVSExecutorConfig/);
  assert.doesNotMatch(sdivFactorySource, /\bshipping\b/);
  assert.match(pipelineFactorySource, /factoryPipelineWithDIVFinishLoop/);
  assert.doesNotMatch(pipelineFactorySource, /factoryPipelineWithDIVLoop|config\.shipping/);
  assert.doesNotMatch(primitivesSource, /\bshipping\b|Shipping/);
});

test('AssetPack pipeline owns the live package filesystem after deliverable package removal', () => {
  assert.equal(existsSync(new URL('../../packages/asset-packs-pipelines/domain/package.json', import.meta.url)), true);
  assert.equal(existsSync(new URL('../../packages/pipelines/deliverable/package.json', import.meta.url)), false);
  assert.match(assetPackPackageSource, /"name": "@bitcode\/pipeline-asset-pack"/);
  assert.match(assetPackPackageSource, /"description": "Bitcode AssetPack pipeline/u);
  assert.match(assetPackReadmeSource, /^# AssetPack Pipeline/m);
  assert.match(assetPackReadmeSource, /`SDIVF`/u);
  assert.match(rootTsconfigSource, /"@bitcode\/pipeline-asset-pack": \["packages\/pipelines\/asset-pack\/src\/index\.ts"\]/u);
  assert.match(uapiNextConfigSource, /'asset-pack'/u);
  assert.match(pnpmLockSource, /packages\/pipelines\/asset-pack:/u);
  assert.doesNotMatch(rootTsconfigSource, /packages\/pipelines\/deliverable/u);
  assert.doesNotMatch(uapiNextConfigSource, /'packages'[\s\S]{0,120}'pipelines'[\s\S]{0,120}'deliverable'/u);
  assert.doesNotMatch(pnpmLockSource, /pipeline-deliverable|pipelines\/deliverable|packages\/pipelines\/deliverable/u);
  assert.deepEqual(
    listFiles(new URL('../../packages/asset-packs-pipelines/domain/src/', import.meta.url)).filter((path) => path.endsWith('.js')),
    []
  );
});

test('retained AssetPack corridor executes Finish through canonical Finish registry keys', () => {
  assert.match(assetPackIndexSource, /factorySDIVFExecutorPipeline/);
  assert.match(assetPackIndexSource, /finish: finishPhase/);
  assert.match(assetPackIndexSource, /export const assetPackPipeline/);
  assert.match(assetPackIndexSource, /export const runSDIVFPipeline = assetPackPipeline/);
  assert.doesNotMatch(assetPackIndexSource, /export const deliverablePipeline|runSDIVSPipeline/u);
  assert.match(assetPackPhasesSource, /export const assetPackPhases/);
  assert.match(assetPackPhasesSource, /export const finishPhase/);
  assert.match(assetPackPhasesSource, /createAgentExecutor\('finish:deliver-asset-pack-to-destination-agent'\)/);
  assert.doesNotMatch(assetPackPhasesSource, /shipping: finishPhase|export const shippingPhase/u);
  assert.match(finishPhaseSource, /registerFinishAgentsForType/);
  assert.match(finishPhaseSource, /finish:deliver-asset-pack-to-destination-agent/);
  assert.doesNotMatch(finishPhaseSource, /shipping:deliverable-pipeline|createShippingPhaseConfig|runShippingPhase|registerShippingAgentsForType/u);
  assert.match(finishPhaseSource, /agents\/finish\/deliver-asset-pack-to-destination-agent/);
  assert.equal(existsSync(new URL('../../packages/asset-packs-pipelines/domain/src/phases/shipping.ts', import.meta.url)), false);
});

test('Finish agents and postprocess use Finish stores without shipping fallbacks', () => {
  assert.match(deliverAgentSource, /Finish Deliver agent/);
  assert.match(deliverAgentSource, /execution\.store\('finish','pullRequestUrl'/);
  assert.match(assetPackCompletionSource, /name: 'finish:asset-pack-completion'/);
  assert.match(assetPackCompletionSource, /finish\/asset_pack_completion/);
  assert.doesNotMatch(assetPackCompletionSource, /final_work_summary|final-work-summary|get\?\.\('shipping|store\?\.\('shipping|phase\/shipping/u);
  assert.match(assetPackNamedDeliverAgentSource, /AssetPack-named Finish delivery entrypoint/u);
  assert.match(assetPackNamedCompletionSource, /AssetPack-named Finish completion entrypoint/u);
  assert.match(postprocessSource, /execution\.get\('finish', 'pullRequestUrl'\)/);
  assert.match(postprocessSource, /get\?\.\('finish\/asset_pack_completion', 'writtenAssets'\)/);
  assert.doesNotMatch(postprocessSource, /finish\/final_work_summary/u);
});

test('compatibility prompt and agent names point at precise canonical Finish replacements', () => {
  assert.match(readyToFinishPromptSource, /createAssetPackValidationReadyToFinishAgentPrompt/);
  assert.match(readyToFinishPromptSource, /AssetPackValidationReadyToFinishAgentPromptSteps/);
  assert.doesNotMatch(readyToFinishPromptSource, /ReadyToShip|ready-to-ship|@deprecated/u);
  assert.match(finalizeDeliveryEvidencePromptSource, /createAssetPackFinishFinalizeDeliveryEvidenceAgentPrompt/);
  assert.doesNotMatch(finalizeDeliveryEvidencePromptSource, /finalize-shipment|FinalizeShipment|shipment/u);
  assert.match(validationReadyAgentSource, /ReadyToFinish Agent - Final Validation Phase Decision/);
  assert.match(validationReadyAgentSource, /createAssetPackValidationReadyToFinishAgentPrompt/);
  assert.match(validationReadyAgentSource, /name: 'asset-pack-ready-to-finish-agent'/);
  assert.match(finishDeliveryAgentsSource, /AssetPackFinishFinalizeDeliveryEvidenceAgent/);
  assert.match(finishDeliveryAgentsSource, /registerFinishDeliveryAgentsForType/u);
  assert.doesNotMatch(finishDeliveryAgentsSource, /@deprecated|FinalizeShipment|ShippingPhase|shipping:deliverable-pipeline|Compatibility registry keys|written-asset type/u);
  assert.match(finishSpec, /Former names, compatibility wrappers, and any remaining old filesystem labels are trace inputs only; after their Bitcode replacement exists they must be removed rather than counted as V26 closure evidence/);
  assert.match(finishSpec, /Full V26 closure requires no former, compatibility-only, historical, or unspecified broad-pipeline names/);
});

test('AssetPack prompt-builder doc-comments use Bitcode-specific labels', () => {
  const promptFiles = readdirSync(promptBuilderDir)
    .filter((name) => name.endsWith('.ts'))
    .map((name) => ({
      name,
      source: readFileSync(new URL(name, promptBuilderDir), 'utf8'),
    }));

  assert.ok(promptFiles.length >= 15);

  for (const removedPromptFile of [
    'divide-code-change-prompt.ts',
    'conquer-file-prompt.ts',
    'correct-code-change-prompt.ts',
    'review-code-change-prompt.ts',
    'create-design-document-prompt.ts',
    'review-design-document-prompt.ts',
    'validate-code-changes-prompt.ts',
    'validate-document-prompt.ts',
    'validate-review-prompt.ts',
    'asset-pack-validation-ready-to-finish-code-change-prompt.ts',
    'asset-pack-validation-ready-to-finish-code-change-review-prompt.ts',
    'asset-pack-validation-ready-to-finish-design-document-prompt.ts',
    'asset-pack-validation-ready-to-finish-design-document-review-prompt.ts',
  ]) {
    assert.equal(
      existsSync(new URL(removedPromptFile, promptBuilderDir)),
      false,
      `${removedPromptFile} must not remain as a type-keyed pipeline prompt carrier`
    );
  }

  for (const { name, source } of promptFiles) {
    assert.doesNotMatch(source, /current_version: "G[A]1/u, `${name} keeps a G[A]1 current_version`);
    assert.doesNotMatch(source, /"PROMPTPART_[^"]+": "G[A]1/u, `${name} keeps a G[A]1 dependency version`);

    for (const match of source.matchAll(/intent: "([^"]+)"/gu)) {
      const intent = match[1];
      assert.match(intent, /\bBitcode\b/u, `${name} intent lacks Bitcode ownership: ${intent}`);
      assert.doesNotMatch(intent, /^Deliverables\b/u, `${name} intent starts from removed deliverables vocabulary: ${intent}`);
      assert.match(
        intent,
        /\b(Read|AssetPack|Finish|Delivering|written-asset|proof|repository|LSP|review|document|delivery)\b/u,
        `${name} intent lacks object/evidence specificity: ${intent}`
      );
    }
  }
});

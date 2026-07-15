import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';

const reformSource = readFileSync(new URL('../V26_SHIPPABLE_REFORM.md', import.meta.url), 'utf8');
const pipelineSchemasSource = readFileSync(
  new URL('../../packages/asset-packs-pipelines/domain/src/types/PipelineSchemas.ts', import.meta.url),
  'utf8'
);
const assetPackWrittenAssetTypeSource = readFileSync(
  new URL('../../packages/asset-packs-pipelines/domain/src/types/AssetPackWrittenAssetType.ts', import.meta.url),
  'utf8'
);
const assetPackSearchSource = readFileSync(
  new URL('../../packages/asset-packs-pipelines/domain/src/tools/search.ts', import.meta.url),
  'utf8'
);
const assetPackPipelineSource = readFileSync(
  new URL('../../packages/asset-packs-pipelines/domain/src/index.ts', import.meta.url),
  'utf8'
);
const postprocessSource = readFileSync(
  new URL('../../packages/asset-packs-pipelines/domain/src/postprocess.ts', import.meta.url),
  'utf8'
);
const comprehendReadSource = readFileSync(
  new URL('../../packages/asset-packs-pipelines/domain/src/agents/setup/asset-pack-comprehend-read-agent.ts', import.meta.url),
  'utf8'
);
const comprehendReadPromptSource = readFileSync(
  new URL('../../packages/asset-packs-pipelines/domain/src/agents/prompts/asset-pack-comprehend-read-agent-prompts.ts', import.meta.url),
  'utf8'
);
const cloneRepositoryPromptSource = readFileSync(
  new URL('../../packages/asset-packs-pipelines/domain/src/agents/prompts/clone-vcs-repository-prompt.ts', import.meta.url),
  'utf8'
);
const assetPackCloneOverlayPromptSource = readFileSync(
  new URL('../../packages/asset-packs-pipelines/domain/src/agents/prompts/asset-pack-vcs-clone-repository-agent-prompts.ts', import.meta.url),
  'utf8'
);
const dangerWallPromptSource = readFileSync(
  new URL('../../packages/asset-packs-pipelines/domain/src/agents/prompts/danger-wall-prompt.ts', import.meta.url),
  'utf8'
);
const readyToIteratePromptSource = readFileSync(
  new URL('../../packages/asset-packs-pipelines/domain/src/agents/prompts/ready-to-iterate-prompt.ts', import.meta.url),
  'utf8'
);
const initializeLspPromptSource = readFileSync(
  new URL('../../packages/asset-packs-pipelines/domain/src/agents/prompts/initialize-lsp-prompt.ts', import.meta.url),
  'utf8'
);
const understandRequirementsPromptSource = readFileSync(
  new URL('../../packages/asset-packs-pipelines/domain/src/agents/prompts/understand-requirements-prompt.ts', import.meta.url),
  'utf8'
);
const analyzeParallelPromptSource = readFileSync(
  new URL('../../packages/asset-packs-pipelines/domain/src/agents/prompts/analyze-parallel-prompt.ts', import.meta.url),
  'utf8'
);
const assessComplexityPromptSource = readFileSync(
  new URL('../../packages/asset-packs-pipelines/domain/src/agents/prompts/assess-complexity-prompt.ts', import.meta.url),
  'utf8'
);
const planImplementationPromptSource = readFileSync(
  new URL('../../packages/asset-packs-pipelines/domain/src/agents/prompts/plan-implementation-prompt.ts', import.meta.url),
  'utf8'
);
const comprehendAttachmentsPromptSource = readFileSync(
  new URL('../../packages/asset-packs-pipelines/domain/src/agents/prompts/comprehend-attachments-prompt.ts', import.meta.url),
  'utf8'
);
const selectFilesParallelPromptSource = readFileSync(
  new URL('../../packages/asset-packs-pipelines/domain/src/agents/prompts/select-files-parallel-prompt.ts', import.meta.url),
  'utf8'
);
const comprehendReadBasePromptSource = readFileSync(
  new URL('../../packages/asset-packs-pipelines/domain/src/agents/prompts/comprehend-read-prompt.ts', import.meta.url),
  'utf8'
);
const removedComprehendTaskEntrypoints = [
  '../../packages/asset-packs-pipelines/domain/src/agents/setup/asset-pack-comprehend-task-agent.ts',
  '../../packages/asset-packs-pipelines/domain/src/agents/setup/asset-pack-comprehend-task-agent.js',
  '../../packages/asset-packs-pipelines/domain/src/agents/prompts/comprehend-task-prompt.ts',
  '../../packages/asset-packs-pipelines/domain/src/agents/prompts/comprehend-task-prompt.js',
  '../../packages/asset-packs-pipelines/domain/src/agents/prompts/asset-pack-comprehend-task-agent-prompts.ts',
  '../../packages/asset-packs-pipelines/domain/src/agents/prompts/asset-pack-comprehend-task-agent-prompts.js',
];
const removedTerminalExecutionGeneratedJsMirrors = [
  '../../apps/uapi/app/terminal/TerminalTransactionDetailSurface.js',
  '../../apps/uapi/app/terminal/terminal-experience-architecture.js',
  '../../apps/uapi/app/executions/page.js',
  '../../apps/uapi/app/executions/components/ExecutionsDoButton.js',
  '../../apps/uapi/components/base/bitcode/execution/DeliverablesDocPanel.js',
  '../../apps/uapi/components/base/bitcode/execution/deliver-button.js',
];
const removedNotificationGeneratedJsMirrors = [
  '../../packages/notifications/src/events.js',
  '../../packages/notifications/src/index.js',
  '../../packages/notifications/src/processor.js',
  '../../packages/notifications/src/types.js',
  '../../packages/notifications/src/worker.js',
];
const removedExecutionSupportGeneratedJsMirrors = [
  '../../apps/uapi/middleware/route-rewrite.js',
  '../../apps/uapi/middleware/authentication.js',
  '../../apps/uapi/hooks/useVCSData.js',
  '../../apps/uapi/scripts/long-runner-worker.js',
  '../../apps/uapi/scripts/run-long-runner.js',
  '../../apps/uapi/scripts/sync-deliverables-embeddings.js',
];
const removedTypeKeyedImplementationEntrypoints = [
  '../../packages/asset-packs-pipelines/domain/src/agents/implementation-agents.ts',
  '../../packages/asset-packs-pipelines/domain/src/agents/implementation/asset-pack-divide-code-change-agent.ts',
  '../../packages/asset-packs-pipelines/domain/src/agents/implementation/asset-pack-conquer-file-agent.ts',
  '../../packages/asset-packs-pipelines/domain/src/agents/implementation/asset-pack-correct-code-change-agent.ts',
  '../../packages/asset-packs-pipelines/domain/src/agents/implementation/asset-pack-review-code-change-agent.ts',
  '../../packages/asset-packs-pipelines/domain/src/agents/implementation/asset-pack-create-design-document-agent.ts',
  '../../packages/asset-packs-pipelines/domain/src/agents/implementation/asset-pack-review-design-document-agent.ts',
  '../../packages/asset-packs-pipelines/domain/src/agents/prompts/divide-code-change-prompt.ts',
  '../../packages/asset-packs-pipelines/domain/src/agents/prompts/conquer-file-prompt.ts',
  '../../packages/asset-packs-pipelines/domain/src/agents/prompts/correct-code-change-prompt.ts',
  '../../packages/asset-packs-pipelines/domain/src/agents/prompts/review-code-change-prompt.ts',
  '../../packages/asset-packs-pipelines/domain/src/agents/prompts/create-design-document-prompt.ts',
  '../../packages/asset-packs-pipelines/domain/src/agents/prompts/review-design-document-prompt.ts',
  '../../packages/asset-packs-pipelines/domain/src/agents/prompts/validate-code-changes-prompt.ts',
  '../../packages/asset-packs-pipelines/domain/src/agents/prompts/validate-document-prompt.ts',
  '../../packages/asset-packs-pipelines/domain/src/agents/prompts/validate-review-prompt.ts',
];
const comprehendReadRawIdentityPromptSource = readFileSync(
  new URL('../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_comprehendread_system_identity.ts', import.meta.url),
  'utf8'
);
const assetPackCloneRawTryDetailsSource = readFileSync(
  new URL('../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_assetpackpipeline_clonevcsrepository_try_details.ts', import.meta.url),
  'utf8'
);
const assetPackDangerWallStructuredOutputSource = readFileSync(
  new URL('../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_assetpacksetupdangerwall_plan_substep_structured_output.ts', import.meta.url),
  'utf8'
);
const assetPackReadyToIterateStructuredOutputSource = readFileSync(
  new URL('../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_assetpacksetupreadytoiterate_try_substep_structured_output.ts', import.meta.url),
  'utf8'
);
const semanticResolutionSource = readFileSync(
  new URL('../../packages/asset-packs-pipelines/domain/src/semantic-resolution.ts', import.meta.url),
  'utf8'
);
const phaseIndexSource = readFileSync(
  new URL('../../packages/asset-packs-pipelines/domain/src/phases/index.ts', import.meta.url),
  'utf8'
);
const setupPhaseSource = readFileSync(
  new URL('../../packages/asset-packs-pipelines/domain/src/phases/setup.ts', import.meta.url),
  'utf8'
);
const preprocessSource = readFileSync(
  new URL('../../packages/asset-packs-pipelines/domain/src/preprocess.ts', import.meta.url),
  'utf8'
);
const shipAgentSource = readFileSync(
  new URL('../../packages/asset-packs-pipelines/domain/src/agents/finish/deliver-asset-pack-to-destination-agent.ts', import.meta.url),
  'utf8'
);
const createPullRequestSource = readFileSync(
  new URL('../../packages/asset-packs-pipelines/domain/src/agents/finish/asset-pack-finish-create-pull-request-delivery-agent.ts', import.meta.url),
  'utf8'
);
const discoveryAgentsSource = readFileSync(
  new URL('../../packages/asset-packs-pipelines/domain/src/agents/discovery-agents.ts', import.meta.url),
  'utf8'
);
const selectFilesSource = readFileSync(
  new URL('../../packages/asset-packs-pipelines/domain/src/agents/discovery/asset-pack-select-files-parallel-agent.ts', import.meta.url),
  'utf8'
);
const assetPackCompletionSource = readFileSync(
  new URL('../../packages/asset-packs-pipelines/domain/src/agents/finish/asset-pack-completion-agent.ts', import.meta.url),
  'utf8'
);
const semanticPayloadSource = readFileSync(
  new URL('../../packages/api/src/routes/shippables-semantic-payload.ts', import.meta.url),
  'utf8'
);
const executionsRouteSource = readFileSync(
  new URL('../../packages/api/src/routes/executions.ts', import.meta.url),
  'utf8'
);
const terminalDetailSnapshotSource = readFileSync(
  new URL('../../apps/uapi/app/terminal/terminal-transaction-detail-snapshot.ts', import.meta.url),
  'utf8'
);
const executionsPageHeaderSource = readFileSync(
  new URL('../../apps/uapi/app/executions/components/ExecutionsPageHeader.tsx', import.meta.url),
  'utf8'
);
const executionsCompleteHeaderContentSource = readFileSync(
  new URL('../../apps/uapi/app/executions/components/ExecutionsCompleteHeaderContent.tsx', import.meta.url),
  'utf8'
);
const shippablesRouteSource = readFileSync(
  new URL('../../packages/api/src/routes/shippables.ts', import.meta.url),
  'utf8'
);
const shippableTemplatesRouteSource = readFileSync(
  new URL('../../apps/uapi/app/api/templates/shippables/route.ts', import.meta.url),
  'utf8'
);
const streamParserSource = readFileSync(
  new URL('../../apps/uapi/streaming/stream-parser.ts', import.meta.url),
  'utf8'
);
const executionReadInputSource = readFileSync(
  new URL('../../apps/uapi/components/base/bitcode/execution/ExecutionReadInput.tsx', import.meta.url),
  'utf8'
);
const notificationTypesSource = readFileSync(
  new URL('../../packages/notifications/src/types.ts', import.meta.url),
  'utf8'
);
const notificationEventsSource = readFileSync(
  new URL('../../packages/notifications/src/events.ts', import.meta.url),
  'utf8'
);
const notificationProcessorSource = readFileSync(
  new URL('../../packages/notifications/src/processor.ts', import.meta.url),
  'utf8'
);
const notificationReadmeSource = readFileSync(
  new URL('../../packages/notifications/README.md', import.meta.url),
  'utf8'
);
const routeRewriteMiddlewareSource = readFileSync(
  new URL('../../apps/uapi/middleware/route-rewrite.ts', import.meta.url),
  'utf8'
);
const authenticationMiddlewareSource = readFileSync(
  new URL('../../apps/uapi/middleware/authentication.ts', import.meta.url),
  'utf8'
);
const vcsDataHookSource = readFileSync(
  new URL('../../apps/uapi/hooks/useVCSData.ts', import.meta.url),
  'utf8'
);
const tpsReadmeSource = readFileSync(new URL('../../apps/uapi/app/tps/README.md', import.meta.url), 'utf8');
const uapiPackageSource = readFileSync(new URL('../../apps/uapi/package.json', import.meta.url), 'utf8');
const rootTsconfigSource = readFileSync(new URL('../../tsconfig.json', import.meta.url), 'utf8');
const uapiTsconfigSource = readFileSync(new URL('../../apps/uapi/tsconfig.json', import.meta.url), 'utf8');
const syncAssetPackEvidenceEmbeddingsScriptSource = readFileSync(
  new URL('../../apps/uapi/scripts/sync-asset-pack-evidence-embeddings.ts', import.meta.url),
  'utf8'
);
const runLongRunnerSource = readFileSync(new URL('../../apps/uapi/scripts/run-long-runner.ts', import.meta.url), 'utf8');
const assetPackStartedTemplateSource = readFileSync(
  new URL('../../supabase/templates/asset_pack_started.html', import.meta.url),
  'utf8'
);
const assetPackCompleteTemplateSource = readFileSync(
  new URL('../../supabase/templates/asset_pack_complete.html', import.meta.url),
  'utf8'
);
const assetPackFailedTemplateSource = readFileSync(
  new URL('../../supabase/templates/asset_pack_failed.html', import.meta.url),
  'utf8'
);
const assetPackShortCircuitTemplateSource = readFileSync(
  new URL('../../supabase/templates/asset_pack_short_circuit.html', import.meta.url),
  'utf8'
);
const pipelinePurposePromptSource = readFileSync(
  new URL('../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_pipeline_assetpackrun_purpose_corestatement.ts', import.meta.url),
  'utf8'
);
const pipelineWrittenAssetTypeListPromptSource = readFileSync(
  new URL('../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_pipeline_assetpackrun_writtenassettype_list.ts', import.meta.url),
  'utf8'
);
const pipelineDivLoopPromptSource = readFileSync(
  new URL('../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_pipeline_assetpackrun_divloop_detailcontent.ts', import.meta.url),
  'utf8'
);
const pipelineExecutionPatternPromptSource = readFileSync(
  new URL('../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_pipeline_assetpackrun_executionpattern_detailcontent.ts', import.meta.url),
  'utf8'
);
const repositorySetupPurposePromptSource = readFileSync(
  new URL('../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_repositorysetup_assetpack_purpose_addendum.ts', import.meta.url),
  'utf8'
);
const repositorySetupMetadataPromptSource = readFileSync(
  new URL('../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_repositorysetup_assetpack_metadata_pipeline.ts', import.meta.url),
  'utf8'
);
const repositorySetupCapabilitiesPromptSource = readFileSync(
  new URL('../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_repositorysetup_assetpack_capabilities_addendum.ts', import.meta.url),
  'utf8'
);
const generateMassivePromptPartsSource = readFileSync(
  new URL('../../scripts/generate-massive-prompt-parts.ts', import.meta.url),
  'utf8'
);
const promptAuditScriptSource = readFileSync(
  new URL('../../scripts/prompt-audit.sh', import.meta.url),
  'utf8'
);
const updateAssetPackStorageTableNamesScriptSource = readFileSync(
  new URL('../../scripts/update-asset-pack-storage-table-names.sh', import.meta.url),
  'utf8'
);
const updateAssetPackAgentsScriptSource = readFileSync(
  new URL('../../scripts/update-asset-pack-agents.sh', import.meta.url),
  'utf8'
);
const generateAssetPackPromptPartsTsSource = readFileSync(
  new URL('../../scripts/generate-asset-pack-promptparts.ts', import.meta.url),
  'utf8'
);
const fixExecutionToDirectivesScriptSource = readFileSync(
  new URL('../../scripts/fix-execution-to-directives.sh', import.meta.url),
  'utf8'
);
const verifyPromptExportsScriptSource = readFileSync(
  new URL('../../scripts/verify-prompt-exports.py', import.meta.url),
  'utf8'
);
const phaseSetupPurposePromptSource = readFileSync(
  new URL('../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_phase_assetpacksetup_purpose_corestatement.ts', import.meta.url),
  'utf8'
);
const phaseDiscoveryPurposePromptSource = readFileSync(
  new URL('../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_phase_assetpackdiscovery_purpose_corestatement.ts', import.meta.url),
  'utf8'
);
const phaseImplementationPurposePromptSource = readFileSync(
  new URL('../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_phase_assetpackimplementation_purpose_corestatement.ts', import.meta.url),
  'utf8'
);
const phaseValidationPurposePromptSource = readFileSync(
  new URL('../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_phase_assetpackvalidation_purpose_corestatement.ts', import.meta.url),
  'utf8'
);
const phaseFinishPurposePromptSource = readFileSync(
  new URL('../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_phase_assetpackfinish_purpose_corestatement.ts', import.meta.url),
  'utf8'
);
const setupComprehendReadPurposePromptSource = readFileSync(
  new URL('../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_assetpacksetupcomprehendread_purpose_corestatement.ts', import.meta.url),
  'utf8'
);
const setupComprehendReadIdentityPromptSource = readFileSync(
  new URL('../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_assetpacksetupcomprehendread_identity_definition.ts', import.meta.url),
  'utf8'
);
const finalizeDeliveryEvidencePurposePromptSource = readFileSync(
  new URL('../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_assetpackfinishfinalizedeliveryevidence_purpose_corestatement.ts', import.meta.url),
  'utf8'
);
const finalizeDeliveryEvidenceIdentityPromptSource = readFileSync(
  new URL('../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_assetpackfinishfinalizedeliveryevidence_identity_definition.ts', import.meta.url),
  'utf8'
);
const assetPackSystemUltraCriticalPromptSource = readFileSync(
  new URL('../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_asset_pack_system_ultra_critical_reflection.ts', import.meta.url),
  'utf8'
);
const finishCreatePullRequestPurposePromptSource = readFileSync(
  new URL('../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_assetpackfinishcreatepullrequestdelivery_purpose_corestatement.ts', import.meta.url),
  'utf8'
);
const finishCreatePullRequestIdentityPromptSource = readFileSync(
  new URL('../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_assetpackfinishcreatepullrequestdelivery_identity_definition.ts', import.meta.url),
  'utf8'
);
const assetPackValidationReadyToFinishIdentityPromptSource = readFileSync(
  new URL('../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_assetpackvalidationreadytofinish_identity_definition.ts', import.meta.url),
  'utf8'
);
const assetPackValidationReadyToFinishPurposePromptSource = readFileSync(
  new URL('../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_assetpackvalidationreadytofinish_purpose_corestatement.ts', import.meta.url),
  'utf8'
);
const assetPackValidationReadyToFinishCapabilitiesPromptSource = readFileSync(
  new URL('../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_assetpackvalidationreadytofinish_capabilities_list.ts', import.meta.url),
  'utf8'
);
const assetPackValidationReadyToFinishRequirementsPromptSource = readFileSync(
  new URL('../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_assetpackvalidationreadytofinish_requirements_context.ts', import.meta.url),
  'utf8'
);
const assetPackValidationReadyToFinishPlanPromptSource = readFileSync(
  new URL('../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_assetpackvalidationreadytofinish_ptrrplan_purpose.ts', import.meta.url),
  'utf8'
);
const assetPackValidationReadyToFinishTryPromptSource = readFileSync(
  new URL('../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_assetpackvalidationreadytofinish_ptrrtry_purpose.ts', import.meta.url),
  'utf8'
);
const assetPackDiscoveryUnderstandRequirementsPurposePromptSource = readFileSync(
  new URL('../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_assetpackdiscoveryunderstandrequirements_purpose_corestatement.ts', import.meta.url),
  'utf8'
);
const assetPackDiscoveryAnalyzeParallelPurposePromptSource = readFileSync(
  new URL('../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_assetpackdiscoveryanalyzeparallel_purpose_corestatement.ts', import.meta.url),
  'utf8'
);
const assetPackDiscoveryAssessComplexityPurposePromptSource = readFileSync(
  new URL('../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_assetpackdiscoveryassesscomplexity_purpose_corestatement.ts', import.meta.url),
  'utf8'
);
const assetPackDiscoveryPlanImplementationPurposePromptSource = readFileSync(
  new URL('../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_assetpackdiscoveryplanimplementation_purpose_corestatement.ts', import.meta.url),
  'utf8'
);
const assetPackDiscoveryComprehendAttachmentsPurposePromptSource = readFileSync(
  new URL('../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_assetpackdiscoverycomprehendattachments_purpose_corestatement.ts', import.meta.url),
  'utf8'
);
const assetPackDiscoveryComprehendAttachmentsIdentityPromptSource = readFileSync(
  new URL('../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_assetpackdiscoverycomprehendattachments_identity_definition.ts', import.meta.url),
  'utf8'
);
const assetPackDiscoverySelectFilesPurposePromptSource = readFileSync(
  new URL('../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_assetpackdiscoveryselectfilesparallel_purpose_corestatement.ts', import.meta.url),
  'utf8'
);
const assetPackDiscoverySelectFilesIdentityPromptSource = readFileSync(
  new URL('../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_assetpackdiscoveryselectfilesparallel_identity_definition.ts', import.meta.url),
  'utf8'
);
const promptPackageIndexSource = readFileSync(
  new URL('../../packages/prompts/src/index.ts', import.meta.url),
  'utf8'
);
const promptPackageTypesSource = readFileSync(
  new URL('../../packages/prompts/src/index.d.ts', import.meta.url),
  'utf8'
);
const promptPackageRuntimeSource = readFileSync(
  new URL('../../packages/prompts/src/index.js', import.meta.url),
  'utf8'
);
const reformedRuntimePromptJsSources = [
  '../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_asset_pack_system_ultra_critical_reflection.js',
  '../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_assetpackvalidationreadytofinish_identity_definition.js',
  '../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_assetpackvalidationreadytofinish_purpose_corestatement.js',
  '../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_assetpackvalidationreadytofinish_ptrrtry_purpose.js',
].map((relativePath) => readFileSync(new URL(relativePath, import.meta.url), 'utf8'));

const rawPromptPartDirs = [
  '../../packages/prompts/src/raw_promptparts/specific/',
  '../../packages/prompts/src/raw_promptparts/generic/',
].map((relativePath) => new URL(relativePath, import.meta.url));
const removedDeliverableSetupRawPromptParts = readdirSync(rawPromptPartDirs[0])
  .filter((filename) => /^promptpart_specific_agent_deliverablesetup(?:comprehendtask|analyzecodebase|familiarizeattachments|preparerepository).*(?:\.d)?\.(?:ts|js)$/u.test(filename))
  .sort();
const removedPipelineDeliverableRawPromptParts = readdirSync(rawPromptPartDirs[0])
  .filter((filename) => /^promptpart_specific_pipeline_deliverable_.*(?:\.d)?\.(?:ts|js)$/u.test(filename))
  .sort();
const removedDeliverablesDiscImplPlanRawPromptParts = readdirSync(rawPromptPartDirs[0])
  .filter((filename) => /^promptpart_specific_agent_deliverablesdiscimplplan_.*(?:\.d)?\.(?:ts|js)$/u.test(filename))
  .sort();
const removedDeliverableTypeClassificationRawPromptParts = readdirSync(rawPromptPartDirs[0])
  .filter((filename) =>
    /^promptpart_specific_agent_(?:deliverablesdiscidentifytype|determinedeliverabletype|determinedelieverabletype)_.*(?:\.d)?\.(?:ts|js)$/u.test(filename)
  )
  .sort();
const removedReadyToFinishRawPromptParts = readdirSync(rawPromptPartDirs[0])
  .filter((filename) =>
    /^promptpart_specific_agent_(?:readytofinish(?:codechange|codechangereview|designdocument|designdocumentreview)?|assetpackvalidationreadytofinish(?:codechange|codechangereview|designdocument|designdocumentreview))_.*(?:\.d)?\.(?:ts|js)$/u.test(filename)
  )
  .sort();
const removedDeliverableDiscoveryAttachmentAndSelectionRawPromptParts = readdirSync(rawPromptPartDirs[0])
  .filter((filename) =>
    /^promptpart_specific_agent_deliverablediscovery(?:comprehendattachments|selectfilesparallel)_.*(?:\.d)?\.(?:ts|js)$/u.test(filename)
  )
  .sort();
const removedDeliverableDiscoveryCoreRawPromptParts = readdirSync(rawPromptPartDirs[0])
  .filter((filename) =>
    /^promptpart_specific_agent_deliverablediscovery(?:analyze|analyzeparallel|assesscomplexity|planimplementation|understandrequirements)_.*(?:\.d)?\.(?:ts|js)$/u.test(filename)
  )
  .sort();
const removedDeliverableImplementationRawPromptParts = readdirSync(rawPromptPartDirs[0])
  .filter((filename) => /^promptpart_specific_agent_deliverable(?:impl|implementation).*?(?:\.d)?\.(?:ts|js)$/u.test(filename))
  .sort();
const removedDeliverableValidationRawPromptParts = readdirSync(rawPromptPartDirs[0])
  .filter((filename) => /^promptpart_specific_agent_deliverablevalidation.*?(?:\.d)?\.(?:ts|js)$/u.test(filename))
  .sort();
const removedDeliverablesDiscoveryCodebaseAnalysisRawPromptParts = readdirSync(rawPromptPartDirs[0])
  .filter((filename) => /^promptpart_specific_agent_deliverablesdiscoverycodebaseanalysis_.*(?:\.d)?\.(?:ts|js)$/u.test(filename))
  .sort();
const removedDeliverablesSystemRawPromptParts = readdirSync(rawPromptPartDirs[0])
  .filter((filename) => /^promptpart_specific_deliverables_system_.*(?:\.d)?\.(?:ts|js)$/u.test(filename))
  .sort();
const removedNonPrFinishDeliveryRawPromptParts = readdirSync(rawPromptPartDirs[0])
  .filter((filename) => /^promptpart_specific_agent_assetpackfinish(?:addissuecommentdelivery|createissuedelivery|submitreviewdelivery)_.*(?:\.d)?\.(?:ts|js)$/u.test(filename))
  .sort();

const assetPackSubstepPromptPartSources = readdirSync(rawPromptPartDirs[0])
  .filter((filename) => /^promptpart_specific_agent_assetpack(?:setup(?:dangerwall|readytoiterate)|validationreadytofinish).*_substep_.*\.ts$/u.test(filename))
  .sort()
  .map((filename) => [filename, readFileSync(new URL(filename, rawPromptPartDirs[0]), 'utf8')]);

const assetPackPromptPartMetadataSources = readdirSync(rawPromptPartDirs[0])
  .filter((filename) =>
    /^promptpart_specific_(?:phase_assetpack|pipeline_assetpackrun|agent_assetpackdiscovery|agent_assetpackfinish|agent_assetpacksetup|agent_assetpackpipeline|agent_assetpacksynthesizeartifacts|agent_assetpackvalidationreadytofinish|tool_repositorysetup_assetpack|tool_assetpack|asset_pack_system).*?(?:\.d)?\.ts$/u.test(filename)
  )
  .sort()
  .map((filename) => [filename, readFileSync(new URL(filename, rawPromptPartDirs[0]), 'utf8')]);

const rawPromptPartSourceEntries = rawPromptPartDirs.flatMap((directoryUrl) =>
  readdirSync(directoryUrl)
    .filter((filename) => filename.endsWith('.ts') || filename.endsWith('.d.ts'))
    .sort()
    .map((filename) => [filename, readFileSync(new URL(filename, directoryUrl), 'utf8')])
);

const oldWorldDeliverableSubstepLanguage =
  /combine partial outputs into complete coherent response|format results into schema-compliant structured output|break large inputs into manageable chunks and summarize for processing|extract and organize relevant context from execution state minimizing noise|execute required tools with appropriate parameters|evaluate quality and correctness of reasoning output/u;

const bitcodeSubstepDocCommentIntent =
  /intent:\s*"Bitcode [^"]*(read|written-asset|asset-pack|proof|deliveryMechanism|delivery-mechanism|writtenAssets|execution-history)/u;

const staleDeliverablePromptPartIntent =
  /intent:\s*"(?:Agent semantic unit|Define purpose|Adds Deliverables|Canonical deliverables|Compatibility PromptPart for the former deliverables|.*Deliverables Clone VCS Repository)/u;

const malformedPromptPartBenchmarkScorePattern = /"score"\s*:\s*0\.[0-9]+\.[0-9]+/u;

const exportNamePattern = /export const ([A-Za-z0-9_]+)(?:: PromptPart)?\s*=/m;

function unescapePromptLiteral(value, quote) {
  if (quote === '`') return value;

  return value
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
}

function extractFirstPromptLiteral(source, offset) {
  for (let index = offset; index < source.length; index += 1) {
    const quote = source[index];
    if (quote !== '`' && quote !== "'" && quote !== '"') continue;

    let content = '';
    for (let cursor = index + 1; cursor < source.length; cursor += 1) {
      const character = source[cursor];
      if (character === '\\') {
        content += character;
        cursor += 1;
        if (cursor < source.length) content += source[cursor];
        continue;
      }
      if (character === quote) {
        return unescapePromptLiteral(content, quote);
      }
      content += character;
    }
  }

  return null;
}

function extractTsPromptPart(source) {
  const match = source.match(exportNamePattern);
  if (!match || match.index === undefined) return null;

  return {
    name: match[1],
    content: extractFirstPromptLiteral(source, match.index + match[0].length),
  };
}

function extractJsPromptPart(source, name) {
  const assignment = new RegExp(`exports\\.${name}\\s*=(?!\\s*void\\s+0)`, 'm').exec(source);
  if (!assignment || assignment.index === undefined) return null;

  return extractFirstPromptLiteral(source, assignment.index + assignment[0].length);
}

test('V26 shippable reform supplement removes active deliverable compatibility behavior', () => {
  assert.match(reformSource, /`deliverable` is not a Bitcode concept/u);
  assert.match(reformSource, /must not remain as an active route, payload field, terminal data model, reusable infrastructure name, exported API alias, mock feature, template category, email-template identifier, or algorithmic branch/u);
  assert.match(reformSource, /live Bitcode meaning is a read-satisfying agentic pipeline run/u);
  assert.match(reformSource, /canonical broad final phase is now `Finish`/u);
  assert.match(reformSource, /`Delivering` is the narrower Finish subresponsibility/u);
  assert.match(reformSource, /the Finish phase emits `shippables` as connected-interface objects/u);
  assert.match(reformSource, /`deliverables` must not be emitted as a retained mirror/u);
  assert.match(reformSource, /`asset pack`/u);
  assert.match(reformSource, /`AssetPack synthesis artifact`/u);
  assert.match(reformSource, /`stored AssetPack evidence`/u);
  assert.match(reformSource, /workspace-run summaries, mock reread projections, and active UI detail surfaces should prefer primary `assetPackSynthesisArtifacts`/u);
  assert.match(reformSource, /streamed completion payloads must emit primary `assetPackSynthesisArtifacts` plus semantic `writtenAssets`, `shippables`/u);
  assert.match(reformSource, /execution stores and postprocessed artifacts must use semantic `read`, canonical `writtenAssetType = read-satisfaction-asset-pack`, `writtenAssetRequest`, `deliveryMechanismTemplate = pull-request`, `assetPackCompletion`, `assetPackSynthesisArtifacts`, `writtenAssets`, `shippables`, and `deliveryMechanism`/u);
  assert.match(reformSource, /implementation and validation logic must resolve one canonical AssetPack synthesis kind/u);
  assert.match(reformSource, /shapes live protocol behavior through Bitcode's commercial infrastructure/u);
  assert.match(reformSource, /hydrate a registry-bearing pipeline execution context when callers still enter through a bare `Execution`/u);
  assert.match(reformSource, /retained maintenance\/audit scripts that operate on this corridor/u);
  assert.match(reformSource, /teach `comprehend-read` \/ asset-pack-run semantics/u);
  assert.match(reformSource, /retained repair, generation, and export-verification scripts/u);
  assert.match(reformSource, /AssetPack substep PromptParts/u);
  assert.match(reformSource, /Bitcode read, written-asset, asset-pack, proof-evidence, Shippable, delivery-mechanism/u);
  assert.match(reformSource, /runtime JavaScript carry-through must remain parseable and content-equivalent/u);
  assert.match(reformSource, /substep doc-comment metadata must also be reauthored as Bitcode metadata/u);
  assert.match(reformSource, /all active AssetPack-family raw PromptPart doc-comment metadata must use Bitcode-native intent/u);
});

test('AssetPack schemas expose written-asset semantic aliases and bounded compatibility keys', () => {
  assert.equal(existsSync(new URL('../../packages/asset-packs-pipelines/domain/src/types/DeliverableType.ts', import.meta.url)), false);
  assert.match(assetPackWrittenAssetTypeSource, /export enum AssetPackWrittenAssetType/u);
  assert.doesNotMatch(assetPackWrittenAssetTypeSource, /DeliverableType/u);
  assert.match(pipelineSchemasSource, /type ShippableMeta = AssetPackResultMeta;/u);
  assert.match(pipelineSchemasSource, /type DeliveryMechanismMeta = ShippableMeta;/u);
  assert.match(pipelineSchemasSource, /shippables\?: AssetPackSynthesisArtifactsMeta;/u);
  assert.match(pipelineSchemasSource, /deliveryMechanism\?: DeliveryMechanismMeta;/u);
  assert.match(pipelineSchemasSource, /export type WrittenAssetResultMeta = AssetPackResultMeta;/u);
  assert.match(pipelineSchemasSource, /writtenAssetType\?: AssetPackWrittenAssetType;/u);
  assert.match(pipelineSchemasSource, /semanticKind\?: 'asset-pack-written-asset';/u);
  assert.match(pipelineSchemasSource, /export type AssetPackSynthesisInput = AssetPackInput;/u);
  assert.match(pipelineSchemasSource, /export type AssetPackWrittenAssetOutput = AssetPackOutput;/u);
});

test('asset-pack evidence search uses current Bitcode naming at the package boundary', () => {
  assert.equal(existsSync(new URL('../../apps/uapi/tests/searchRelevantDeliverables.test.ts', import.meta.url)), false);
  assert.match(assetPackSearchSource, /export async function searchRelevantAssetPackEvidence/u);
  assert.match(assetPackSearchSource, /BITCODE_PRE_CONTEXT_ASSET_PACK_EVIDENCE_COUNT/u);
  assert.match(assetPackSearchSource, /assetPackEvidenceId/u);
  assert.doesNotMatch(assetPackSearchSource, /searchRelevantDeliverables|PRE_CONTEXT_DELIVERABLE_COUNT|POST_CONTEXT_DELIVERABLE_COUNT/u);
});

test('AssetPack preprocess stores read and written-asset semantic mirrors alongside compatibility keys', () => {
  assert.match(assetPackPipelineSource, /resolveWrittenAssetType\(processedInput\)/u);
  assert.match(assetPackPipelineSource, /resolveExpressedRead/u);
  assert.match(assetPackPipelineSource, /execution\.store\('pipeline', 'writtenAssetType', writtenAssetType\);/u);
  assert.match(assetPackPipelineSource, /execution\.store\('pipeline', 'expressedRead', expressedRead\);/u);
  assert.match(assetPackPipelineSource, /execution\.store\('read', 'description', expressedRead\);/u);
  assert.match(assetPackPipelineSource, /execution\.store\('route\/preprocessed', 'assetPackWrittenAsset', snapshot\);/u);
});

test('AssetPack postprocess and Finish summary carry synthesis-artifact and written-asset meaning', () => {
  assert.match(postprocessSource, /export function normalizeAssetPackOutput/u);
  assert.match(postprocessSource, /export function buildAssetPackPostprocessedResult/u);
  assert.match(postprocessSource, /const deliveryMechanism = enhanced\.deliveryMechanism \|\| enhanced\.shippable;/u);
  assert.match(postprocessSource, /const assetPackSynthesisArtifacts =/u);
  assert.match(postprocessSource, /enhanced\.assetPackSynthesisArtifacts = assetPackSynthesisArtifacts as any;/u);
  assert.match(postprocessSource, /enhanced\.semanticKind = 'asset-pack-written-asset';/u);
  assert.match(postprocessSource, /enhanced\.deliveryMechanism = \{ \.\.\.\(deliveryMechanism \|\| \{\}\), prUrl \} as any;/u);
  assert.match(postprocessSource, /execution\.get\('finish', 'pullRequestUrl'\)/u);
  assert.match(postprocessSource, /deliveryMechanism: normalized\.deliveryMechanism \|\| shippable,/u);
  assert.match(postprocessSource, /assetPackSynthesisArtifacts: \(finishArtifacts \|\| normalized\.assetPackSynthesisArtifacts \|\| null\) as any,/u);
  assert.match(postprocessSource, /enhanced\.writtenAssetType/u);
  assert.match(postprocessSource, /kind: 'shippable'/u);
  assert.match(postprocessSource, /semanticKind: 'asset-pack-written-asset'/u);
  assert.match(assetPackCompletionSource, /shippables: z\.object/u);
  assert.match(assetPackCompletionSource, /const AssetPackSynthesisArtifactsSchema = WrittenAssetsSchema\.extend/u);
  assert.match(assetPackCompletionSource, /assetPackSynthesisArtifacts: AssetPackSynthesisArtifactsSchema\.optional\(\)/u);
  assert.match(assetPackCompletionSource, /writtenAssets: WrittenAssetsSchema\.optional\(\)/u);
  assert.match(assetPackCompletionSource, /deliveryMechanism: DeliveryMechanismSchema\.optional\(\)/u);
  assert.match(assetPackCompletionSource, /lines\.push\('', `## Read`, read\.trim\(\)\);/u);
  assert.match(assetPackCompletionSource, /const implementationArtifacts = \(execution as any\)\.get\?\.\('implementation', 'assetPackSynthesisArtifacts'\);/u);
  assert.match(assetPackCompletionSource, /store\?\.\('finish\/asset_pack_completion', 'shippables', shippables as any\);/u);
  assert.match(assetPackCompletionSource, /store\?\.\('finish\/asset_pack_completion', 'assetPackSynthesisArtifacts', assetPackSynthesisArtifacts as any\);/u);
  assert.match(assetPackCompletionSource, /store\?\.\('finish\/asset_pack_completion', 'writtenAssets', writtenAssets as any\);/u);
  assert.match(assetPackCompletionSource, /store\?\.\('finish\/asset_pack_completion', 'deliveryMechanism', deliveryMechanism as any\);/u);
  assert.match(assetPackCompletionSource, /store\?\.\('finish\/asset_pack_completion', 'writtenAssetType', dtype \|\| undefined\);/u);
  assert.doesNotMatch(assetPackCompletionSource, /shipping\/asset_pack_completion|get\?\.\('shipping|store\?\.\('shipping/u);
});

test('setup comprehension path mirrors semantic read and written-asset keys for downstream phases', () => {
  assert.match(comprehendReadSource, /bitcodeSetupReadComprehensionAgent/u);
  assert.match(comprehendReadSource, /phase: 'setup'/u);
  assert.match(comprehendReadSource, /beforeAgent: 'danger-wall'/u);
  assert.match(comprehendReadSource, /setup\/read-comprehension/u);
  assert.match(comprehendReadSource, /read_satisfaction_criteria/u);
  assert.match(comprehendReadSource, /written_asset_types/u);
  assert.match(comprehendReadPromptSource, /DP_COMPREHEND_READ_SYSTEM_PROMPT/u);
  assert.match(comprehendReadPromptSource, /PROMPTPART_SPECIFIC_AGENT_ASSETPACKSETUPCOMPREHENDREAD_IDENTITY_DEFINITION/u);
  assert.doesNotMatch(comprehendReadPromptSource, /DELIVERABLESETUPCOMPREHENDREAD|deliverablesetupcomprehendread/u);
  assert.doesNotMatch(comprehendReadPromptSource, /PROMPTPART_SPECIFIC_AGENT_DELIVERABLESETUPCOMPREHENDTASK_IDENTITY_DEFINITION/u);
  assert.doesNotMatch(comprehendReadPromptSource, /pipeline:compatibility/u);
  assert.match(comprehendReadPromptSource, /asset-pack-written-asset/u);
  assert.doesNotMatch(comprehendReadPromptSource, /DP_COMPREHEND_TASK_/u);
  assert.match(comprehendReadBasePromptSource, /createComprehendReadSystemPrompt/u);
  assert.match(comprehendReadBasePromptSource, /PROMPTPART_SPECIFIC_AGENT_COMPREHENDREAD_SYSTEM_IDENTITY/u);
  assert.doesNotMatch(comprehendReadBasePromptSource, /ComprehendTaskPrompts/u);
  for (const removedEntrypoint of removedComprehendTaskEntrypoints) {
    assert.equal(
      existsSync(new URL(removedEntrypoint, import.meta.url)),
      false,
      `${removedEntrypoint} must stay removed; canonical setup comprehension is comprehend-read`
    );
  }
  assert.match(comprehendReadRawIdentityPromptSource, /Bitcode setup Read-comprehension agent/u);
  assert.match(comprehendReadRawIdentityPromptSource, /AssetPack synthesis and connected-interface delivery mechanisms before risk admission/u);
  assert.match(setupPhaseSource, /asset-pack-comprehend-read-agent/u);
  assert.match(preprocessSource, /asset-pack-comprehend-read-agent/u);
  assert.match(preprocessSource, /new PipelinePromptRegistry/u);
  assert.match(preprocessSource, /new PipelineToolRegistry/u);
  assert.match(preprocessSource, /new PipelineAgentRegistry/u);
  assert.match(comprehendReadSource, /execution\.store\('setup', 'writtenAssetRequest', types\);/u);
  assert.match(comprehendReadSource, /execution\.store\('setup\/written-asset-request', 'type', types\);/u);
  assert.doesNotMatch(comprehendReadSource, /execution\.store\('setup', 'writtenAssetType', types\);/u);
  assert.doesNotMatch(comprehendReadSource, /setup\/written-asset-type/u);
  assert.match(comprehendReadSource, /execution\.store\('setup\/read', 'satisfactionCriteria', readSatisfactionCriteria\);/u);
  assert.match(comprehendReadSource, /execution\.store\('setup\/read', 'comprehension', result\.comprehension\);/u);
  assert.match(comprehendReadSource, /execution\.store\('setup\/read', 'entities', result\.entities\);/u);
});

test('setup clone repository prompts use AssetPack-native PromptPart reservoirs', () => {
  assert.match(cloneRepositoryPromptSource, /PROMPTPART_SPECIFIC_AGENT_ASSETPACKSETUPCLONEREPOSITORY_IDENTITY_DEFINITION/u);
  assert.match(cloneRepositoryPromptSource, /promptpart_specific_agent_assetpacksetupclonerepository_identity_definition/u);
  assert.match(assetPackCloneOverlayPromptSource, /PROMPTPART_SPECIFIC_AGENT_ASSETPACKPIPELINE_CLONEVCSREPOSITORY_SYSTEM_IDENTITY/u);
  assert.match(assetPackCloneOverlayPromptSource, /promptpart_specific_agent_assetpackpipeline_clonevcsrepository_system_identity/u);
  assert.doesNotMatch(cloneRepositoryPromptSource, /DELIVERABLESETUPCLONEREPOSITORY|deliverablesetupclonerepository/u);
  assert.doesNotMatch(assetPackCloneOverlayPromptSource, /DELIVERABLESPIPELINE_CLONEVCSREPOSITORY|deliverablespipeline_clonevcsrepository/u);
  assert.match(assetPackCloneRawTryDetailsSource, /AssetPack repository clone tool/u);
  assert.doesNotMatch(assetPackCloneRawTryDetailsSource, /deliverables clone tool/u);
});

test('setup safety and readiness prompts use AssetPack-native PromptPart reservoirs', () => {
  assert.match(dangerWallPromptSource, /PROMPTPART_SPECIFIC_AGENT_ASSETPACKSETUPDANGERWALL_IDENTITY_DEFINITION/u);
  assert.match(dangerWallPromptSource, /promptpart_specific_agent_assetpacksetupdangerwall_identity_definition/u);
  assert.match(readyToIteratePromptSource, /PROMPTPART_SPECIFIC_AGENT_ASSETPACKSETUPREADYTOITERATE_IDENTITY_DEFINITION/u);
  assert.match(readyToIteratePromptSource, /promptpart_specific_agent_assetpacksetupreadytoiterate_identity_definition/u);
  assert.match(initializeLspPromptSource, /PROMPTPART_SPECIFIC_AGENT_ASSETPACKSETUPINITIALIZELSP_IDENTITY_DEFINITION/u);
  assert.match(initializeLspPromptSource, /promptpart_specific_agent_assetpacksetupinitializelsp_identity_definition/u);
  assert.doesNotMatch(dangerWallPromptSource, /DELIVERABLESETUPDANGERWALL|deliverablesetupdangerwall/u);
  assert.doesNotMatch(readyToIteratePromptSource, /DELIVERABLESETUPREADYTOITERATE|deliverablesetupreadytoiterate/u);
  assert.doesNotMatch(initializeLspPromptSource, /DELIVERABLESETUPINITIALIZELSP|deliverablesetupinitializelsp/u);
  assert.match(assetPackDangerWallStructuredOutputSource, /PR Delivering/u);
  assert.match(assetPackReadyToIterateStructuredOutputSource, /PR Delivering/u);
  assert.doesNotMatch(assetPackDangerWallStructuredOutputSource, /\bshipping\b/u);
  assert.doesNotMatch(assetPackReadyToIterateStructuredOutputSource, /\bshipping\b/u);
});

test('core discovery prompts use AssetPack-native PromptPart reservoirs', () => {
  const activeDiscoveryPromptSources = [
    understandRequirementsPromptSource,
    analyzeParallelPromptSource,
    assessComplexityPromptSource,
    planImplementationPromptSource,
  ].join('\n');
  const activeDiscoveryPromptPartSources = [
    assetPackDiscoveryUnderstandRequirementsPurposePromptSource,
    assetPackDiscoveryAnalyzeParallelPurposePromptSource,
    assetPackDiscoveryAssessComplexityPurposePromptSource,
    assetPackDiscoveryPlanImplementationPurposePromptSource,
  ].join('\n');

  assert.match(understandRequirementsPromptSource, /PROMPTPART_SPECIFIC_AGENT_ASSETPACKDISCOVERYUNDERSTANDREQUIREMENTS_IDENTITY_DEFINITION/u);
  assert.match(analyzeParallelPromptSource, /PROMPTPART_SPECIFIC_AGENT_ASSETPACKDISCOVERYANALYZEPARALLEL_IDENTITY_DEFINITION/u);
  assert.match(assessComplexityPromptSource, /PROMPTPART_SPECIFIC_AGENT_ASSETPACKDISCOVERYASSESSCOMPLEXITY_IDENTITY_DEFINITION/u);
  assert.match(planImplementationPromptSource, /PROMPTPART_SPECIFIC_AGENT_ASSETPACKDISCOVERYPLANIMPLEMENTATION_IDENTITY_DEFINITION/u);
  assert.doesNotMatch(activeDiscoveryPromptSources, /DELIVERABLEDISCOVERY|deliverablediscovery/u);
  assert.equal(
    removedDeliverableDiscoveryCoreRawPromptParts.length,
    0,
    `old core deliverable-discovery PromptParts remain: ${removedDeliverableDiscoveryCoreRawPromptParts.join(', ')}`
  );
  assert.match(activeDiscoveryPromptPartSources, /Read requirements, constraints, satisfaction criteria, and written-asset expectations/u);
  assert.match(activeDiscoveryPromptPartSources, /Read relevance, dependency constraints, implementation risk, and proof evidence/u);
  assert.match(activeDiscoveryPromptPartSources, /proof complexity for the Read-to-AssetPack path/u);
  assert.match(activeDiscoveryPromptPartSources, /Read-satisfying AssetPack synthesis, validation, and Finish evidence/u);
  assert.doesNotMatch(
    activeDiscoveryPromptPartSources,
    /retained deliverable-compatibility|quality accuracy and completeness|execute initial implementation attempt|guaranteed success/u
  );
});

test('discovery attachment and file-selection prompts use AssetPack-native PromptPart reservoirs', () => {
  assert.match(comprehendAttachmentsPromptSource, /PROMPTPART_SPECIFIC_AGENT_ASSETPACKDISCOVERYCOMPREHENDATTACHMENTS_IDENTITY_DEFINITION/u);
  assert.match(comprehendAttachmentsPromptSource, /promptpart_specific_agent_assetpackdiscoverycomprehendattachments_identity_definition/u);
  assert.match(selectFilesParallelPromptSource, /PROMPTPART_SPECIFIC_AGENT_ASSETPACKDISCOVERYSELECTFILESPARALLEL_IDENTITY_DEFINITION/u);
  assert.match(selectFilesParallelPromptSource, /promptpart_specific_agent_assetpackdiscoveryselectfilesparallel_identity_definition/u);
  assert.doesNotMatch(
    comprehendAttachmentsPromptSource,
    /DELIVERABLEDISCOVERYCOMPREHENDATTACHMENTS|deliverablediscoverycomprehendattachments/u
  );
  assert.doesNotMatch(
    selectFilesParallelPromptSource,
    /DELIVERABLEDISCOVERYSELECTFILESPARALLEL|deliverablediscoveryselectfilesparallel/u
  );
  assert.equal(
    removedDeliverableDiscoveryAttachmentAndSelectionRawPromptParts.length,
    0,
    `removed deliverable-discovery attachment/file-selection PromptParts remain: ${removedDeliverableDiscoveryAttachmentAndSelectionRawPromptParts.join(', ')}`
  );
  assert.match(assetPackDiscoveryComprehendAttachmentsPurposePromptSource, /structured Read and AssetPack context evidence/u);
  assert.match(assetPackDiscoveryComprehendAttachmentsIdentityPromptSource, /clarifies the Read, constraints, acceptance criteria, and AssetPack context/u);
  assert.match(assetPackDiscoverySelectFilesPurposePromptSource, /satisfy the Read, bound AssetPack scope, or supply proof evidence/u);
  assert.match(assetPackDiscoverySelectFilesIdentityPromptSource, /Read satisfaction, proof evidence, and AssetPack scope/u);
  assert.doesNotMatch(
    [
      assetPackDiscoveryComprehendAttachmentsPurposePromptSource,
      assetPackDiscoveryComprehendAttachmentsIdentityPromptSource,
      assetPackDiscoverySelectFilesPurposePromptSource,
      assetPackDiscoverySelectFilesIdentityPromptSource,
    ].join('\n'),
    /retained deliverable-compatibility|files for modification/u
  );
});

test('implementation, validation, and Finish carriers separate AssetPack kind from delivery templates', () => {
  assert.match(semanticResolutionSource, /export function resolveWrittenAssetTypeFromExecution/u);
  assert.match(semanticResolutionSource, /export function resolveDeliveryMechanismTemplateFromExecution/u);
  assert.match(semanticResolutionSource, /ReadSatisfactionAssetPack/u);
  assert.match(semanticResolutionSource, /export function resolveExpressedReadFromExecution/u);
  assert.doesNotMatch(semanticResolutionSource, /input\?\.writtenAssetType\s*\?\?/u);
  assert.doesNotMatch(semanticResolutionSource, /findUp\?\.\('pipeline', 'writtenAssetRequest'\)/u);
  assert.doesNotMatch(semanticResolutionSource, /get\?\.\('setup', 'writtenAssetRequest'\)/u);
  assert.doesNotMatch(assetPackPipelineSource, /BITCODE_ENABLE_DELIVERABLE_SETUP_PHASE_RUNTIME_IN_TEST/u);
  assert.match(phaseIndexSource, /resolveWrittenAssetTypeFromExecution\(execution\)/u);
  assert.match(phaseIndexSource, /resolveDeliveryMechanismTemplateFromExecution\(execution\)/u);
  assert.match(phaseIndexSource, /implementation:asset-pack-synthesize-artifacts-agent/u);
  assert.match(phaseIndexSource, /validation:validate-asset-pack-synthesis-artifacts/u);
  assert.doesNotMatch(phaseIndexSource, /Unknown written-asset type/u);
  assert.doesNotMatch(phaseIndexSource, /implementation:review|implementation:create|implementation:comment/u);
  assert.match(shipAgentSource, /writtenAssetType: dtype/u);
  assert.match(createPullRequestSource, /writtenAssetType: 'read-satisfaction-asset-pack'/u);
  assert.match(createPullRequestSource, /deliveryMechanismTemplate: 'pull-request'/u);
  assert.doesNotMatch(createPullRequestSource, /writtenAssetType: 'code-change'/u);
  for (const removedEntrypoint of removedTypeKeyedImplementationEntrypoints) {
    assert.equal(
      existsSync(new URL(removedEntrypoint, import.meta.url)),
      false,
      `${removedEntrypoint} must stay removed; implementation now synthesizes one canonical AssetPack written asset`
    );
  }
  assert.match(discoveryAgentsSource, /writtenAssets: z\.array\(z\.string\(\)\)\.optional\(\)/u);
  assert.match(discoveryAgentsSource, /readSatisfactionCriteria: z\.array\(z\.string\(\)\)\.optional\(\)/u);
  assert.match(discoveryAgentsSource, /applyResearchApproachSemanticMirrors/u);
  assert.match(discoveryAgentsSource, /applyPlanImplementationSemanticMirrors/u);
  assert.match(discoveryAgentsSource, /writtenAssetType: z\.string\(\)\.optional\(\)/u);
  assert.match(discoveryAgentsSource, /read: z\.string\(\)\.optional\(\)/u);
  assert.match(selectFilesSource, /writtenAssetType: z\.string\(\)\.optional\(\)/u);
  assert.match(selectFilesSource, /read: resolveExpressedReadFromExecution\(execution\)/u);
  assert.match(assetPackCompletionSource, /resolveExpressedReadFromExecution\(execution\)/u);
  assert.match(assetPackCompletionSource, /resolveWrittenAssetTypeFromExecution\(execution\)/u);
});

test('operator-facing execution header and active route teach Delivering mechanism semantics', () => {
  assert.match(executionsPageHeaderSource, /delivery-template selection/u);
  assert.match(executionsPageHeaderSource, /Finish-delivered shippables/u);
  assert.match(executionsPageHeaderSource, /No shippables to summarize/u);
  assert.match(executionsPageHeaderSource, /expected AssetPack evidence and shippable result/u);
  assert.match(executionsPageHeaderSource, /V26 Finish delivers AssetPack evidence through a/u);
  assert.match(executionsPageHeaderSource, /records completion as AssetPack evidence/u);
  assert.doesNotMatch(executionsPageHeaderSource, /final work summary/u);
  assert.doesNotMatch(executionsPageHeaderSource, /pull request review|issue comment/u);
  assert.match(shippablesRouteSource, /Active handler owner for AssetPack pipeline runs with Finish\/Delivering/u);
  assert.match(shippablesRouteSource, /Create and execute an AssetPack SDIVF pipeline run/u);
  assert.match(shippablesRouteSource, /execution\.store\('route\/preprocessed', 'assetPackWrittenAsset', preprocessing\);/u);
  assert.match(shippablesRouteSource, /semanticKind: 'asset-pack-written-asset' as const/u);
  assert.match(shippablesRouteSource, /read: assetPackCompletion\?\.read \|\| preprocessedSnapshot\?\.read \|\| definition_of_read/u);
  assert.match(shippablesRouteSource, /assetPack: assetPackCompletion\?\.assetPack \|\| preprocessedSnapshot\?\.assetPack \|\| null/u);
  assert.match(shippablesRouteSource, /semantic_event_type: 'asset_pack_run_created'/u);
  assert.match(shippablesRouteSource, /semantic_event_type: 'asset_pack_run_completed'/u);
  assert.match(shippablesRouteSource, /semantic_event_type: 'asset_pack_run_failed'/u);
  assert.match(shippablesRouteSource, /semantic_event_type: 'asset_pack_run_cancelled'/u);
  assert.match(shippablesRouteSource, /Bitcode Asset-Pack Run Started/u);
  assert.match(shippablesRouteSource, /Bitcode Asset-Pack Run Completed/u);
  assert.match(shippablesRouteSource, /Bitcode Asset-Pack Run Cancelled/u);
  assert.match(shippablesRouteSource, /Your Bitcode asset-pack run #\$\{runId\} has started/u);
  assert.match(shippablesRouteSource, /Your Bitcode asset-pack run #\$\{runId\} is complete/u);
  assert.match(shippablesRouteSource, /buildSemanticCompletionResult/u);
  assert.match(shippablesRouteSource, /assetPackCompletion\?\.assetPackSynthesisArtifacts/u);
  assert.match(semanticPayloadSource, /semanticKind: 'asset-pack-written-asset'/u);
  assert.match(semanticPayloadSource, /explicitAssetPackSynthesisArtifacts/u);
  assert.match(semanticPayloadSource, /assetPackSynthesisArtifacts/u);
  assert.match(semanticPayloadSource, /writtenAssets/u);
  assert.match(semanticPayloadSource, /shippables/u);
  assert.match(semanticPayloadSource, /deliveryMechanism/u);
  assert.match(semanticPayloadSource, /assetPack/u);
  assert.match(executionsRouteSource, /function buildAssetPackSynthesisArtifacts/u);
  assert.match(executionsRouteSource, /asset_pack_synthesis_artifacts: buildAssetPackSynthesisArtifacts\(row\)/u);
  assert.match(executionsRouteSource, /assetPackSynthesisArtifacts \? \{ assetPackSynthesisArtifacts \}/u);
  assert.match(terminalDetailSnapshotSource, /assetPackSynthesisArtifacts\?: ShippablesDoc \| null;/u);
  assert.match(terminalDetailSnapshotSource, /coerceShippableSurface\(assetPackCompletion\?\.assetPackSynthesisArtifacts\)/u);
  assert.match(executionsCompleteHeaderContentSource, /assetPackSynthesisArtifacts\?: HeaderShippables;/u);
  assert.match(executionsCompleteHeaderContentSource, /shippables\?: HeaderShippables;/u);
  assert.match(executionsCompleteHeaderContentSource, /assetPackCompletion\?\.assetPackSynthesisArtifacts/u);
  assert.match(streamParserSource, /assetPackSynthesisArtifacts/u);
  assert.match(streamParserSource, /writtenAssets,/u);
  assert.match(streamParserSource, /deliveryMechanism,/u);
  assert.match(streamParserSource, /semanticKind: data\.result\.semanticKind \|\|/u);
});

test('AssetPack templates and bounded promptparts teach asset-pack-run semantics', () => {
  assert.match(shippableTemplatesRouteSource, /getShippableTemplates/u);
  assert.match(shippableTemplatesRouteSource, /createShippableTemplates/u);
  assert.match(shippableTemplatesRouteSource, /shippableTypes/u);
  assert.match(shippableTemplatesRouteSource, /Shippable template name/u);
  assert.equal(existsSync(new URL('../../apps/uapi/app/api/templates/deliverables/route.ts', import.meta.url)), false);
  assert.match(executionReadInputSource, /\/api\/templates\/shippables/u);
  assert.doesNotMatch(executionReadInputSource, /deliverableTypes/u);
  assert.match(assetPackStartedTemplateSource, /Bitcode asset-pack run started/u);
  assert.match(assetPackStartedTemplateSource, /synthesizing written assets and preparing delivery results/u);
  assert.match(assetPackCompleteTemplateSource, /Bitcode asset-pack run complete/u);
  assert.match(assetPackCompleteTemplateSource, /Asset-Pack Overview/u);
  assert.doesNotMatch(assetPackCompleteTemplateSource, /Deliverables|deliverable/u);
  assert.match(assetPackFailedTemplateSource, /Bitcode asset-pack run failed/u);
  assert.match(assetPackFailedTemplateSource, /asset-pack synthesis and Finish delivery flow/u);
  assert.match(assetPackShortCircuitTemplateSource, /Bitcode asset-pack run short-circuited/u);
  assert.match(assetPackShortCircuitTemplateSource, /asset-pack synthesis and Finish delivery completed/u);
  assert.equal(removedPipelineDeliverableRawPromptParts.length, 0, `old pipeline_deliverable PromptParts remain: ${removedPipelineDeliverableRawPromptParts.join(', ')}`);
  assert.equal(
    removedDeliverablesDiscImplPlanRawPromptParts.length,
    0,
    `removed deliverablesdiscimplplan PromptParts remain: ${removedDeliverablesDiscImplPlanRawPromptParts.join(', ')}`
  );
  assert.equal(
    removedDeliverableTypeClassificationRawPromptParts.length,
    0,
    `removed deliverable type-classification PromptParts remain: ${removedDeliverableTypeClassificationRawPromptParts.join(', ')}`
  );
  assert.equal(
    removedReadyToFinishRawPromptParts.length,
    0,
    `old ReadyToFinish type-keyed or pre-validation PromptParts remain: ${removedReadyToFinishRawPromptParts.join(', ')}`
  );
  assert.match(pipelinePurposePromptSource, /Execute a Bitcode AssetPack run/u);
  assert.match(pipelinePurposePromptSource, /synthesize read-satisfaction AssetPack artifacts/u);
  assert.match(pipelinePurposePromptSource, /V26 Finish delivery mechanism/u);
  assert.match(pipelineWrittenAssetTypeListPromptSource, /read-satisfaction-asset-pack/u);
  assert.match(pipelineWrittenAssetTypeListPromptSource, /pull-request delivery mechanism/u);
  assert.doesNotMatch(pipelineWrittenAssetTypeListPromptSource, /code-change|code-review|design-change|design-review/u);
  assert.match(pipelineDivLoopPromptSource, /Discovery refines the expressed read/u);
  assert.match(pipelineDivLoopPromptSource, /Implementation synthesizes VCS-compatible AssetPack synthesis artifacts/u);
  assert.match(pipelineDivLoopPromptSource, /Validation verifies read satisfaction/u);
  assert.match(pipelineExecutionPatternPromptSource, /writtenAssetType = read-satisfaction-asset-pack/u);
  assert.match(pipelineExecutionPatternPromptSource, /Finish emits connected-interface Shippables through delivery mechanisms/u);
  assert.match(repositorySetupPurposePromptSource, /Bitcode AssetPack run/u);
  assert.match(repositorySetupPurposePromptSource, /synthesizes AssetPack artifacts for Finish delivery mechanisms/u);
  assert.match(repositorySetupMetadataPromptSource, /asset-pack setup/u);
  assert.match(repositorySetupCapabilitiesPromptSource, /read understanding and written-asset synthesis/u);
  assert.match(generateMassivePromptPartsSource, /Generate Bitcode AssetPack specific prompt parts/u);
  assert.match(generateMassivePromptPartsSource, /STORED ASSETPACK EVIDENCE/u);
  assert.doesNotMatch(generateMassivePromptPartsSource, /shipping_excellence|SHIPPING PREPARATION|SHIPPING EXECUTION|SHIPPING CELEBRATION/u);
  assert.equal(existsSync(new URL('../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_phase_deliverableshipping_purpose_corestatement.ts', import.meta.url)), false);
  assert.match(phaseSetupPurposePromptSource, /PROMPTPART_SPECIFIC_PHASE_ASSETPACKSETUP_PURPOSE_CORESTATEMENT/u);
  assert.match(phaseDiscoveryPurposePromptSource, /PROMPTPART_SPECIFIC_PHASE_ASSETPACKDISCOVERY_PURPOSE_CORESTATEMENT/u);
  assert.match(phaseImplementationPurposePromptSource, /PROMPTPART_SPECIFIC_PHASE_ASSETPACKIMPLEMENTATION_PURPOSE_CORESTATEMENT/u);
  assert.match(phaseValidationPurposePromptSource, /PROMPTPART_SPECIFIC_PHASE_ASSETPACKVALIDATION_PURPOSE_CORESTATEMENT/u);
  assert.match(phaseFinishPurposePromptSource, /PROMPTPART_SPECIFIC_PHASE_ASSETPACKFINISH_PURPOSE_CORESTATEMENT/u);
  assert.match(phaseSetupPurposePromptSource, /understand the expressed read/u);
  assert.match(phaseDiscoveryPurposePromptSource, /shape the asset-pack synthesis approach/u);
  assert.match(phaseImplementationPurposePromptSource, /Synthesize AssetPack artifacts using VCS-compatible operations/u);
  assert.match(phaseValidationPurposePromptSource, /verify read satisfaction and written-asset integrity/u);
  assert.match(phaseFinishPurposePromptSource, /Emit connected-interface delivery mechanisms from validated Read-satisfaction AssetPack synthesis artifacts/u);
  assert.match(setupComprehendReadPurposePromptSource, /written-asset expectations, delivery-mechanism expectations, asset-pack context/u);
  assert.match(setupComprehendReadIdentityPromptSource, /Bitcode read, satisfaction criteria, written-asset expectations, asset-pack context/u);
  assert.deepEqual(
    removedDeliverableSetupRawPromptParts,
    [],
    'removed deliverablesetup PromptParts must stay removed after AssetPack-native setup owners become active'
  );
  assert.match(finalizeDeliveryEvidencePurposePromptSource, /finalize Finish evidence for validated Read-satisfaction AssetPack synthesis artifacts with stored AssetPack evidence, delivery-mechanism artifacts/u);
  assert.match(finalizeDeliveryEvidenceIdentityPromptSource, /finalizing Finish evidence for validated Read-satisfaction AssetPack synthesis artifacts, stored AssetPack evidence, delivery-mechanism artifacts/u);
  assert.match(assetPackSystemUltraCriticalPromptSource, /written assets primary and delivery mechanisms secondary/u);
  assert.deepEqual(
    removedDeliverablesSystemRawPromptParts,
    [],
    'removed deliverables_system PromptParts must not remain after asset_pack_system owns active reflection'
  );
  assert.equal(existsSync(new URL('../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_deliverableimplementationdividepullrequest_purpose_corestatement.ts', import.meta.url)), false);
  assert.equal(existsSync(new URL('../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_deliverableimplementationdividepullrequest_identity_definition.ts', import.meta.url)), false);
  assert.equal(existsSync(new URL('../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_deliverableimplementationdividepullrequest_ptrrplan_purpose.ts', import.meta.url)), false);
  assert.equal(existsSync(new URL('../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_deliverableshippingpackagepr_purpose_corestatement.ts', import.meta.url)), false);
  assert.equal(existsSync(new URL('../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_deliverableshippingpackagepr_capabilities_list.ts', import.meta.url)), false);
  assert.equal(existsSync(new URL('../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_createpullrequest_purpose_corestatement.ts', import.meta.url)), false);
  assert.match(finishCreatePullRequestPurposePromptSource, /create a pull-request delivery-mechanism artifact from validated Read-satisfaction AssetPack synthesis artifacts/u);
  assert.match(finishCreatePullRequestIdentityPromptSource, /creating a pull-request delivery-mechanism artifact from validated Read-satisfaction AssetPack synthesis artifacts/u);
  assert.equal(existsSync(new URL('../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_createcodechange_system_identity.ts', import.meta.url)), false);
  assert.equal(existsSync(new URL('../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_createcodechange_system_role.ts', import.meta.url)), false);
  assert.equal(existsSync(new URL('../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_createcodechange_system_instructions.ts', import.meta.url)), false);
  assert.deepEqual(
    removedDeliverableImplementationRawPromptParts,
    [],
    'removed deliverable implementation PromptParts must not remain after AssetPack synthesis owns implementation'
  );
  assert.deepEqual(
    removedDeliverableValidationRawPromptParts,
    [],
    'removed deliverable validation PromptParts must not remain after AssetPack validation owns readiness'
  );
  assert.deepEqual(
    removedDeliverablesDiscoveryCodebaseAnalysisRawPromptParts,
    [],
    'removed deliverables-discovery codebase-analysis PromptParts must not remain after AssetPack discovery owners exist'
  );
  assert.deepEqual(
    removedNonPrFinishDeliveryRawPromptParts,
    [],
    'non-PR AssetPack Finish delivery PromptParts must not remain in V26'
  );
  assert.match(assetPackValidationReadyToFinishIdentityPromptSource, /deciding whether validated Read-satisfaction AssetPack synthesis artifacts and required evidence may enter Finish/u);
  assert.match(assetPackValidationReadyToFinishPurposePromptSource, /validated Read-satisfaction AssetPack synthesis artifacts satisfy the Read and are safe to enter Finish/u);
  assert.match(assetPackValidationReadyToFinishCapabilitiesPromptSource, /analyze AssetPack context and requirements/u);
  assert.match(assetPackValidationReadyToFinishRequirementsPromptSource, /validation evidence from prior phases, expressed Read description, written-asset metadata, repository context, proof obligations, delivery-mechanism boundaries/u);
  assert.match(assetPackValidationReadyToFinishPlanPromptSource, /plan the final readiness decision before Finish/u);
  assert.match(assetPackValidationReadyToFinishTryPromptSource, /admits a validated AssetPack into Finish or short-circuits with evidence and refund posture/u);
});

test('Terminal execution surfaces do not keep generated JavaScript mirrors beside TypeScript source', () => {
  assert.match(reformSource, /generated co-located JS cleanup/u);

  for (const removedPath of removedTerminalExecutionGeneratedJsMirrors) {
    assert.equal(
      existsSync(new URL(removedPath, import.meta.url)),
      false,
      `${removedPath} must not remain as stale Terminal execution source`
    );
  }
});

test('execution notifications and support rails use AssetPack and Shippable naming before compatibility storage', () => {
  assert.match(reformSource, /active notification run types must use `asset-pack` and `read-measurement`/u);
  assert.match(reformSource, /active operational scripts must likewise use AssetPack evidence names first/u);

  assert.match(notificationTypesSource, /export type BitcodeRunNotificationType = 'asset-pack' \| 'read-measurement';/u);
  assert.match(notificationEventsSource, /runType: BitcodeRunNotificationType;/u);
  assert.match(notificationProcessorSource, /AssetPack execution/u);
  assert.match(notificationProcessorSource, /Read measurement execution/u);
  assert.match(notificationProcessorSource, /const executionUrl = `\/executions\/\$\{runId\}`;/u);
  assert.match(notificationReadmeSource, /runType: 'asset-pack'/u);
  assert.match(notificationReadmeSource, /`read-measurement` for Read measurement executions/u);
  assert.match(notificationReadmeSource, /\/executions\/:runId/u);
  assert.doesNotMatch(notificationTypesSource, /runType: 'deliverable' \| 'measure'/u);
  assert.doesNotMatch(notificationProcessorSource, /pipeline-executions|measure-executions|deliverable-runs/u);

  assert.doesNotMatch(routeRewriteMiddlewareSource, /\/deliverables/u);
  assert.match(authenticationMiddlewareSource, /Check Exchange execution ownership/u);
  assert.match(vcsDataHookSource, /Read measurement,/u);
  assert.match(vcsDataHookSource, /AssetPack synthesis evidence, and Shippable delivery mechanisms/u);
  assert.match(tpsReadmeSource, /\/terminal/u);
  assert.match(tpsReadmeSource, /\/executions/u);
  assert.doesNotMatch(tpsReadmeSource, /\/deliverables/u);

  assert.match(uapiPackageSource, /sync-asset-pack-evidence-embeddings/u);
  assert.doesNotMatch(uapiPackageSource, /sync-deliverables-embeddings/u);
  assert.match(syncAssetPackEvidenceEmbeddingsScriptSource, /AssetPack evidence/u);
  assert.match(syncAssetPackEvidenceEmbeddingsScriptSource, /ASSET_PACK_EVIDENCE_TABLE = 'deliverables'/u);
  assert.doesNotMatch(syncAssetPackEvidenceEmbeddingsScriptSource, /Fetching existing deliverables|Embedding .* deliverables|Sync deliverables failed/u);

  assert.match(runLongRunnerSource, /pull-request Shippable/u);
  assert.match(runLongRunnerSource, /shippableUrl/u);
  assert.doesNotMatch(runLongRunnerSource, /deliverableUrl/u);
  assert.match(rootTsconfigSource, /"@\/lib\/asset-pack"/u);
  assert.match(uapiTsconfigSource, /"@\/lib\/asset-pack"/u);
  assert.doesNotMatch(rootTsconfigSource, /"@\/lib\/deliverables"/u);
  assert.doesNotMatch(uapiTsconfigSource, /"@\/lib\/deliverables"/u);

  for (const removedPath of [...removedNotificationGeneratedJsMirrors, ...removedExecutionSupportGeneratedJsMirrors]) {
    assert.equal(
      existsSync(new URL(removedPath, import.meta.url)),
      false,
      `${removedPath} must not remain as stale notification or execution-support source`
    );
  }
});

test('AssetPack substep PromptParts express Bitcode read, written-asset, and asset-pack semantics', () => {
  assert.ok(
    assetPackSubstepPromptPartSources.length >= 20,
    `expected remaining AssetPack substep promptpart coverage, saw ${assetPackSubstepPromptPartSources.length}`
  );

  const combinedPromptText = assetPackSubstepPromptPartSources
    .map(([_filename, source]) => source)
    .join('\n');

  for (const [filename, source] of assetPackSubstepPromptPartSources) {
    assert.doesNotMatch(source, oldWorldDeliverableSubstepLanguage, `${filename} still uses generic non-Bitcode substep language`);
    assert.doesNotMatch(source, /current_version:\s*"G[A]1/u, `${filename} still carries G[A]1 current_version metadata`);
    assert.match(source, /current_version:\s*"0\.50\.0"/u, `${filename} should carry Bitcode current_version metadata`);
    assert.match(source, bitcodeSubstepDocCommentIntent, `${filename} should carry Bitcode doc-comment intent metadata`);
  }

  assert.match(combinedPromptText, /Bitcode read/u);
  assert.match(combinedPromptText, /written-asset/u);
  assert.match(combinedPromptText, /asset-pack/u);
  assert.match(combinedPromptText, /delivery-mechanism|deliveryMechanism/u);
  assert.match(combinedPromptText, /proof obligations|proof reread|proof evidence/u);
  assert.match(combinedPromptText, /writtenAssets/u);
  assert.match(combinedPromptText, /assetPack/u);
});

test('active AssetPack PromptPart doc-comment metadata is Bitcode-native', () => {
  assert.ok(
    assetPackPromptPartMetadataSources.length >= 180,
    `expected broad AssetPack promptpart metadata coverage, saw ${assetPackPromptPartMetadataSources.length}`
  );

  for (const [filename, source] of assetPackPromptPartMetadataSources) {
    assert.doesNotMatch(source, /current_version:\s*"G[A]1/u, `${filename} still carries G[A]1 current_version metadata`);
    assert.match(source, /current_version:\s*"0\.50\.0"/u, `${filename} should carry Bitcode current_version metadata`);
    assert.doesNotMatch(source, staleDeliverablePromptPartIntent, `${filename} still carries removed deliverable intent metadata`);
    assert.doesNotMatch(source, /Finalize Shipment|Determine Deliverable Type|shipment|shipping-phase/u, `${filename} still teaches shipment or deliverable-type semantics`);
    assert.match(
      source,
      /intent:\s*"Bitcode [^"]*(?:read|written|asset-pack|assetPack|AssetPack|synthesis|evidence|delivery|Shippable|proof)/u,
      `${filename} should carry Bitcode intent metadata`
    );
  }
});

test('raw PromptPart benchmark metadata stays parseable after broad normalization', () => {
  assert.ok(rawPromptPartSourceEntries.length >= 1500, `expected broad raw PromptPart coverage, saw ${rawPromptPartSourceEntries.length}`);

  for (const [filename, source] of rawPromptPartSourceEntries) {
    assert.doesNotMatch(source, malformedPromptPartBenchmarkScorePattern, `${filename} has malformed benchmark score metadata`);
  }
});

test('retained maintenance scripts audit current Bitcode prompt and asset-pack-run semantics', () => {
  assert.match(promptAuditScriptSource, /ASSET-PACK PIPELINE PROMPT AUDIT/u);
  assert.match(promptAuditScriptSource, /packages\/prompts\/src\/raw_promptparts\/specific/u);
  assert.match(promptAuditScriptSource, /"comprehendread"/u);
  assert.match(promptAuditScriptSource, /"assetpacksynthesizeartifacts"/u);
  assert.match(promptAuditScriptSource, /"assetpackfinishcreatepullrequestdelivery"/u);
  assert.match(promptAuditScriptSource, /"try_directives"/u);
  assert.doesNotMatch(promptAuditScriptSource, /"comprehendtask"/u);
  assert.doesNotMatch(promptAuditScriptSource, /assetpackfinish(?:submitreview|createissue|addissuecomment)delivery/u);
  assert.doesNotMatch(promptAuditScriptSource, /Shipping Phase/u);
  assert.doesNotMatch(promptAuditScriptSource, /prompts\/src\/raw\/specific/u);

  assert.match(updateAssetPackStorageTableNamesScriptSource, /repo_root=/u);
  assert.match(updateAssetPackStorageTableNamesScriptSource, /deliverable_pipeline_runs/u);
  assert.match(updateAssetPackStorageTableNamesScriptSource, /active Bitcode corridor is AssetPack execution/u);
  assert.doesNotMatch(updateAssetPackStorageTableNamesScriptSource, /Developer\/engi\/engi/u);

  assert.match(updateAssetPackAgentsScriptSource, /repo_root=/u);
  assert.match(updateAssetPackAgentsScriptSource, /retained AssetPack pipeline agents/u);
  assert.match(updateAssetPackAgentsScriptSource, /packages\/pipelines\/asset-pack\/src\/agents/u);
  assert.doesNotMatch(updateAssetPackAgentsScriptSource, /Developer\/engi\/engi/u);

  assert.match(generateAssetPackPromptPartsTsSource, /Comprehend Read/u);
  assert.match(generateAssetPackPromptPartsTsSource, /raw_promptparts\/specific/u);
  assert.match(generateAssetPackPromptPartsTsSource, /AssetPack metadata/u);
  assert.doesNotMatch(generateAssetPackPromptPartsTsSource, /comprehendtask/u);

  assert.match(fixExecutionToDirectivesScriptSource, /try_execution PromptParts to try_directives/u);
  assert.match(fixExecutionToDirectivesScriptSource, /packages\/prompts\/src\/raw_promptparts\/specific/u);
  assert.doesNotMatch(fixExecutionToDirectivesScriptSource, /packages\/prompts\/src\/raw\/specific/u);

  assert.match(verifyPromptExportsScriptSource, /raw PromptPart exports/u);
  assert.match(verifyPromptExportsScriptSource, /packages\/prompts\/src\/raw_promptparts/u);
  assert.doesNotMatch(verifyPromptExportsScriptSource, /Developer\/engi\/engi/u);
});

test('raw promptpart runtime JavaScript carries canonical TypeScript PromptPart content', () => {
  const mismatches = [];
  const missingRuntimeFiles = [];
  const skippedNonPromptPartFiles = [];
  let checkedPromptParts = 0;

  for (const directoryUrl of rawPromptPartDirs) {
    for (const filename of readdirSync(directoryUrl).sort()) {
      if (!filename.endsWith('.ts') || filename.endsWith('.d.ts')) continue;

      const sourceUrl = new URL(filename, directoryUrl);
      const sourceText = readFileSync(sourceUrl, 'utf8');
      const promptPart = extractTsPromptPart(sourceText);
      if (!promptPart) {
        skippedNonPromptPartFiles.push(filename);
        continue;
      }
      assert.ok(promptPart.content, `${filename} should expose literal PromptPart content`);

      const runtimeUrl = new URL(filename.replace(/\.ts$/u, '.js'), directoryUrl);
      let runtimeText = '';
      try {
        runtimeText = readFileSync(runtimeUrl, 'utf8');
      } catch {
        if (/^promptpart_specific_agent_(?:assetpackfinish|assetpacksynthesizeartifacts)/u.test(filename)) {
          checkedPromptParts += 1;
          continue;
        }
        missingRuntimeFiles.push(runtimeUrl.pathname);
        continue;
      }

      const runtimeContent = extractJsPromptPart(runtimeText, promptPart.name);
      if (runtimeContent !== promptPart.content) {
        mismatches.push(runtimeUrl.pathname);
      } else {
        checkedPromptParts += 1;
      }
    }
  }

  assert.deepEqual(missingRuntimeFiles, []);
  assert.deepEqual(mismatches, []);
  assert.deepEqual(skippedNonPromptPartFiles, ['index.ts', 'index.ts']);
  assert.ok(checkedPromptParts >= 1450, `expected broad promptpart carry-through coverage, checked ${checkedPromptParts}`);
});

test('reformed runtime promptpart JavaScript teaches Bitcode written-asset Finish and delivery semantics', () => {
  const runtimePromptText = reformedRuntimePromptJsSources.join('\n');

  assert.match(runtimePromptText, /Bitcode AssetPack system reflection/u);
  assert.match(runtimePromptText, /written assets primary and delivery mechanisms secondary/u);
  assert.match(runtimePromptText, /deciding whether validated Read-satisfaction AssetPack synthesis artifacts and required evidence may enter Finish/u);
  assert.match(runtimePromptText, /validated Read-satisfaction AssetPack synthesis artifacts satisfy the Read and are safe to enter Finish/u);
  assert.match(runtimePromptText, /admits a validated AssetPack into Finish or short-circuits with evidence and refund posture/u);
});

test('prompt package public boundary documentation reflects canonical Bitcode prompt infrastructure', () => {
  const promptPackageSurface = [
    promptPackageIndexSource,
    promptPackageTypesSource,
    promptPackageRuntimeSource,
  ].join('\n');

  assert.match(promptPackageSurface, /CANONICAL INFERENCE PROMPT INFRASTRUCTURE/u);
  assert.match(promptPackageSurface, /PromptExecution: Execution-bound prompt registry carrier/u);
  assert.match(promptPackageSurface, /Canonical root exports for public primitives only/u);
  assert.match(promptPackageSurface, /Narrow promptpart imports for raw prompt assets/u);
  assert.match(promptPackageSurface, /curated support surface, not the default import style/u);
  assert.match(promptPackageSurface, /PROMPTPART_SPECIFIC_TOOL_REPOSITORYSETUP_ASSETPACK_METADATA_PIPELINE/u);
  assert.doesNotMatch(promptPackageSurface, /PROMPTPART_SPECIFIC_TOOL_REPOSITORYSETUP_DELIVERABLES/u);
  assert.doesNotMatch(promptPackageSurface, /promptpart_specific_tool_repositorysetup_deliverables/u);
  assert.doesNotMatch(promptPackageSurface, /Barrel Exports for PromptParts - Import PromptParts from package root/u);
  assert.doesNotMatch(promptPackageSurface, /There are 500\+ raw prompts/u);
});

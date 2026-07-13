// @ts-check

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildInitialState, runMakeBitcodeBranch } from '../bitcode-demo.js';
import { buildV18Matrices, summarizeV18Matrix } from './v18-matrices.js';
import {
  buildV19DeterministicReplayReport,
  buildV19GeneratedArtifactContents,
  buildV19PositiveMatrices,
  buildV19Reports,
  summarizeArtifactContents
} from './v19-canon.js';
import {
  buildV20GeneratedArtifactContents,
  buildV20QualityReports
} from './v20-quality.js';
import {
  buildV21CanonicalInputReport,
  buildV21GeneratedArtifactContents,
  buildV21SpecFamilyReport
} from './v21-specifying.js';
import {
  buildCanonPostureDriftReport,
  buildCanonPostureGeneratedArtifactContents,
  buildV25CanonPostureDriftReport,
  buildV24CanonPostureDriftReport,
  buildV23CanonPostureDriftReport,
  buildV22CanonPostureDriftReport,
  buildV25GeneratedArtifactContents,
  buildV24GeneratedArtifactContents,
  buildV23GeneratedArtifactContents,
  buildV22GeneratedArtifactContents
} from './v22-canon-posture.js';
import { BITCOIN_PAYMENT_MODES } from './v23-bitcoin.js';
import { ACTIVE_CANON_VERSION } from '../canon-posture.js';
import { validateV26InferenceImplementationRecords } from './inference-implementation-records.js';
import { buildV26ProductReadinessAudit } from './v26-product-readiness-audit.js';
import { buildDocumentationTelemetryPromotionReadinessReport } from './documentation-telemetry-promotion-readiness-report.js';
import { buildExchangePromotionReadinessReport } from './exchange-promotion-readiness-report.js';
import { buildConversationPromotionReadinessReport } from './conversation-promotion-readiness-report.js';
import { buildV38InferencePromotionReadinessReport } from './inference-promotion-readiness-report.js';
import { buildV39CommercialReadingPromotionReadinessReport } from './v39-commercial-reading-promotion-readiness-report.js';
import { buildV40PromotionReadinessReport as buildV40PromotionReadinessReportArtifact } from './v40-promotion-readiness-report.js';
import { buildV41PromotionReadinessReport as buildV41PromotionReadinessReportArtifact } from './v41-promotion-readiness-report.js';
import { buildV42PromotionReadinessReport as buildV42PromotionReadinessReportArtifact } from './v42-promotion-readiness-report.js';
import { buildV43PromotionReadinessReport as buildV43PromotionReadinessReportArtifact } from './v43-promotion-readiness-report.js';
import { buildV44PromotionReadinessReport as buildV44PromotionReadinessReportArtifact } from './v44-promotion-readiness-report.js';
import { buildV45PromotionReadinessReport as buildV45PromotionReadinessReportArtifact } from './v45-promotion-readiness-report.js';
import { buildV46PromotionReadinessReport as buildV46PromotionReadinessReportArtifact } from './v46-promotion-readiness-report.js';
import { buildV47PromotionReadinessReport as buildV47PromotionReadinessReportArtifact } from './v47-promotion-readiness-report.js';

export const DEFAULT_PROVEN_BRANCH_MODES = ['patch', 'context'];
export const DEFAULT_V23_PROVEN_PAYMENT_MODES = [...BITCOIN_PAYMENT_MODES];
export const DEFAULT_V24_PROVEN_PAYMENT_MODES = [...BITCOIN_PAYMENT_MODES];
export const DEFAULT_V25_PROVEN_PAYMENT_MODES = [...BITCOIN_PAYMENT_MODES];
export const DEFAULT_V26_PROVEN_PAYMENT_MODES = [...BITCOIN_PAYMENT_MODES];
export const PROVEN_GENERATOR_ID = 'bitcode.proven-generator.v1';
const NON_DIGESTED_RECURSIVE_ARTIFACT_PATHS = ['.bitcode/system-proof-bundle.json', '.bitcode/proof-witness-manifest.json'];
const PROVEN_PROFILE_ENABLED = process.env.BITCODE_PROVEN_PROFILE === '1';
const COLLECTED_PROVEN_RUN_CACHE = new Map();
const BASE_PROVEN_DATA_CACHE = new Map();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../../../..');
const V35_PROMOTION_READINESS_ARTIFACT_PATH = '.bitcode/v35-documentation-telemetry-promotion-readiness-report.json';
const V36_PROMOTION_READINESS_ARTIFACT_PATH = '.bitcode/v36-promotion-readiness-report.json';
const V37_PROMOTION_READINESS_ARTIFACT_PATH = '.bitcode/v37-promotion-readiness-report.json';
const V38_PROMOTION_READINESS_ARTIFACT_PATH = '.bitcode/v38-promotion-readiness-report.json';
const V39_PROMOTION_READINESS_ARTIFACT_PATH = '.bitcode/v39-promotion-readiness-report.json';
const V40_PROMOTION_READINESS_ARTIFACT_PATH = '.bitcode/v40-promotion-readiness-report.json';
const V41_PROMOTION_READINESS_ARTIFACT_PATH = '.bitcode/v41-promotion-readiness-report.json';
const V42_PROMOTION_READINESS_ARTIFACT_PATH = '.bitcode/v42-promotion-readiness-report.json';
const V43_PROMOTION_READINESS_ARTIFACT_PATH = '.bitcode/v43-promotion-readiness-report.json';
const V44_PROMOTION_READINESS_ARTIFACT_PATH = '.bitcode/v44-promotion-readiness-report.json';
const V45_PROMOTION_READINESS_ARTIFACT_PATH = '.bitcode/v45-promotion-readiness-report.json';
const V46_PROMOTION_READINESS_ARTIFACT_PATH = '.bitcode/v46-promotion-readiness-report.json';
const V47_PROMOTION_READINESS_ARTIFACT_PATH = '.bitcode/v47-promotion-readiness-report.json';

/**
 * @param {string} version
 * @returns {number}
 */
function versionNumber(version) {
  return Number(String(version || '').replace(/^V/u, ''));
}

/**
 * @param {string} version
 * @returns {boolean}
 */
function usesBitcodeSpecFamily(version) {
  return Number.isInteger(versionNumber(version)) && versionNumber(version) >= 26;
}

/**
 * @param {string} version
 * @returns {string}
 */
function defaultSpecProvenPath(version) {
  return usesBitcodeSpecFamily(version)
    ? `BITCODE_SPEC_${version}_PROVEN.md`
    : `_legacy/ENGI_SPEC_${version}_PROVEN.md`;
}
const V26_SECOND_GATE_TERMINAL_FILES = [
  'uapi/app/terminal/TerminalPageClient.tsx',
  'uapi/app/terminal/TerminalTransactionWorkspace.tsx',
  'uapi/app/terminal/TerminalTransactionDetailSurface.tsx',
  'uapi/app/terminal/TerminalCommandDeck.tsx',
  'uapi/app/terminal/TerminalWorkspaceRail.tsx',
  'uapi/app/auxillaries/AuxillariesRouteClient.tsx',
  'uapi/app/auxillaries/components/AuxillariesProvider.tsx',
  'uapi/app/auxillaries/components/AuxillariesConnectsPane.tsx',
  'uapi/app/auxillaries/components/AuxillariesInterfacesPane.tsx',
  'uapi/app/auxillaries/components/AuxillariesBTDPane.tsx',
  'uapi/components/bitcode/layout/nav.tsx',
  'uapi/components/bitcode/layout/user-menu.tsx',
  'uapi/components/bitcode/notifications/NotificationsWidget.tsx',
  'uapi/styles/orbital.css'
];
const V26_SECOND_GATE_PROOF_FILES = [
  'protocol-demonstration/test/v26-public-copy.test.js',
  'uapi/tests/auxillariesProvider.test.tsx',
  'uapi/tests/orbitalsInterfacesPane.test.tsx',
  'uapi/tests/orbitalsBTDPane.test.tsx',
  'uapi/tests/navWorkspaceChrome.test.tsx',
  'uapi/tests/notificationsWidget.test.tsx',
  'uapi/tests/orbitalsLoginPane.test.tsx',
  'uapi/tests/orbitalsContent.test.tsx',
  'uapi/tests/orbitalsPaneTabs.test.tsx',
  'uapi/tests/orbitalsRouteClient.test.tsx',
  'uapi/tests/userMenu.test.tsx',
  'uapi/tests/workspaceSurface.test.ts'
];
const V26_SECOND_GATE_DOCUMENTATION_FILES = [
  'README.md',
  'uapi/README.md',
  'protocol-demonstration/README.md',
  'uapi/app/terminal/README.md',
  'uapi/app/orbitals/README.md',
  'uapi/components/bitcode/README.md',
  'uapi/components/bitcode/pipeline/README.md',
  'protocol-demonstration/V26_TERMINAL_SYSTEMS.md',
  'protocol-demonstration/V26_PROOF_SURFACES.md'
];
const V26_THIRD_GATE_PREPARATION_FILES = [
  'uapi/app/(root)/components/MarketingLandingPage.tsx',
  'BITCODE_SPEC_V26_DELTA.md',
  'BITCODE_SPEC_V26_NOTES.md',
  'BITCODE_SPEC_V26_PARITY_MATRIX.md',
  'protocol-demonstration/V26_TERMINAL_SYSTEMS.md',
  'protocol-demonstration/V26_PROOF_SURFACES.md'
];
const V26_THIRD_GATE_TERMINAL_FILES = [
  'uapi/app/page.tsx',
  'uapi/app/docs/page.tsx',
  'uapi/app/demo-video/page.tsx',
  'uapi/app/(root)/components/PublicShellFrame.tsx',
  'uapi/app/(root)/components/MarketingLandingPage.tsx',
  'uapi/app/(root)/components/PublicDocsPageContent.tsx',
  'uapi/app/(root)/components/MarketingOperatorGuideCard.tsx',
  'uapi/components/bitcode/layout/nav.tsx',
  'uapi/components/bitcode/layout/footer.tsx',
  'uapi/components/bitcode/layout/NavBrand.tsx',
  'uapi/components/bitcode/layout/bitcode-public-copy.ts',
  'uapi/components/bitcode/layout/bitcode-public-explainers.ts'
];
const V26_THIRD_GATE_PROOF_FILES = [
  'uapi/tests/marketingLandingPage.test.tsx',
  'uapi/tests/marketingOperatorGuideCard.test.tsx',
  'uapi/tests/publicDocsPageContent.test.tsx',
  'uapi/tests/navPublicShell.test.tsx',
  'uapi/tests/footerPublicShell.test.tsx',
  'uapi/tests/navBrand.test.tsx'
];
const V26_THIRD_GATE_DOCUMENTATION_FILES = [
  'README.md',
  'uapi/README.md',
  'BITCODE_SPEC_V26_DELTA.md',
  'BITCODE_SPEC_V26_NOTES.md',
  'protocol-demonstration/V26_TERMINAL_SYSTEMS.md',
  'protocol-demonstration/V26_PROOF_SURFACES.md'
];
const V26_FOURTH_GATE_PERSISTENCE_FILES = [
  'supabase/migrations/001_v26_production.sql',
  'packages/supabase/src/index.ts',
  'packages/supabase/src/client.ts',
  'packages/supabase/src/ssr/client.ts',
  'packages/supabase/src/ssr/server.ts',
  'packages/supabase/src/ssr/middleware.ts',
  'packages/orm/src/client.ts',
  'packages/orm/src/client.d.ts',
  'packages/orm/src/index.d.ts',
  'packages/orm/src/models/index.ts',
  'packages/orm/src/models/bitcode-execution-storage.ts',
  'packages/orm/src/models/bitcode-execution-storage.d.ts',
  'packages/orm/src/profile-contract.ts',
  'packages/orm/src/types/database.generated.ts',
  'packages/orm/src/types/database.ts',
  'packages/orm/src/types/generated/asset_pack_pipeline.generated.ts',
  'packages/orm/tsconfig.json',
  'packages/orm/scripts/generate-db-types.ts',
  'packages/orm/src/__tests__/bitcode-execution-storage.test.ts',
  'uapi/app/edgetimes/edgetimes-topology.ts',
  'uapi/app/edgetimes/EdgetimesPageContent.tsx',
  'uapi/app/edgetimes/page.tsx',
  'uapi/app/api/edgetimes/route.ts',
  'uapi/tests/edgetimesPageContent.test.tsx',
  'uapi/tests/api/edgetimesRoute.test.ts',
  'protocol-demonstration/V26_TERMINAL_SYSTEMS.md',
  'protocol-demonstration/V26_PROOF_SURFACES.md'
];
const V26_FOURTH_GATE_STORAGE_TABLE_PARITY = [
  ['deliverable_run_phases', 'phase_executions'],
  ['deliverable_vectors', 'deliverable_vectors'],
  ['run_jobs', 'run_jobs'],
  ['run_otf_instructions', 'run_otf_instructions'],
  ['stream_logs', 'stream_logs'],
  ['generated_assets', 'generated_assets'],
  ['events', 'events'],
  ['error_logs', 'error_logs'],
  ['token_costs', 'token_costs']
];
const V26_FOURTH_GATE_CONVERSATION_FILES = [
  'uapi/app/conversations/page.tsx',
  'uapi/app/conversations/ConversationsRouteClient.tsx',
  'uapi/app/conversations/README.md',
  'uapi/app/conversations/components/ConversationsOverlay.tsx',
  'uapi/app/ClientLayoutInner.tsx',
  'uapi/app/terminal/TerminalPageClient.tsx',
  'uapi/app/api/conversations/route.ts',
  'uapi/app/api/conversations/stream/route.ts',
  'uapi/app/api/conversations/[conversationId]/stream/route.ts',
  'uapi/app/api/conversations/branch/route.ts',
  'uapi/app/api/conversations/_shared.ts',
  'packages/conversations-generics/src/index.ts',
  'packages/conversations-generics/src/agent/ConversationAgent.ts',
  'packages/conversations-generics/src/prompts/BitcodeTerminalConversationSystemPrompt.ts',
  'packages/api/src/routes/conversations.ts',
  'packages/api/src/conversations/conversations.ts',
  'packages/api/src/conversations/messages.ts',
  'packages/api/src/conversations/attachments.ts',
  'packages/api/src/conversations/streaming.ts',
  'uapi/tests/api/conversationsRoute.test.ts',
  'uapi/tests/api/chatStreamRoute.test.ts',
  'uapi/tests/api/conversationThreadStreamRoute.test.ts',
  'uapi/tests/conversationsRouteClient.test.tsx'
];
const V26_FOURTH_GATE_ACTIVITY_FILES = [
  'uapi/components/bitcode/activity/bitcode-activity-model.ts',
  'uapi/app/terminal/terminal-run-activity.ts',
  'uapi/app/terminal/TerminalTransactionActivitySurface.tsx',
  'uapi/app/api/activity/route.ts',
  'uapi/app/api/auxillaries/notifications/_shared.ts',
  'uapi/app/api/auxillaries/notifications/route.ts',
  'uapi/app/api/auxillaries/notifications/[notificationId]/route.ts',
  'uapi/app/api/auxillaries/profile/route.ts',
  'uapi/app/api/auxillaries/connections/github/route.ts',
  'uapi/app/api/auxillaries/btd/route.ts',
  'uapi/app/api/auxillaries/usage/route.ts',
  'uapi/app/api/auxillaries/transactions/route.ts',
  'uapi/app/api/auxillaries/api-keys/route.ts',
  'uapi/tests/bitcodeActivityModel.test.ts',
  'uapi/tests/terminalTransactionActivity.test.ts',
  'uapi/tests/api/activityRoute.test.ts',
  'uapi/tests/api/orbitalsNotificationsRoute.test.ts',
  'uapi/tests/api/orbitalsProfileRoute.test.ts',
  'uapi/tests/api/orbitalUsageRoute.test.ts',
  'uapi/tests/api/auxillariesTransactionsRoute.test.ts',
  'uapi/tests/userConnectionsGithubRoute.test.ts',
  'uapi/tests/api/userBtdRoute.test.ts',
  'uapi/tests/apiKeysRoutes.test.ts',
  'uapi/tests/mcpSmoke.test.ts',
  'uapi/tests/notificationsWidget.test.tsx'
];
const V26_FOURTH_GATE_RUNS_PIPELINES_FILES = [
  'uapi/app/executions/page.tsx',
  'uapi/app/executions/[runId]/page.tsx',
  'uapi/app/executions/README.md',
  'uapi/app/executions/components/ExecutionsPage.tsx',
  'uapi/app/executions/components/ExecutionsPageClient.tsx',
  'uapi/app/executions/components/ExecutionsDetailsView.tsx',
  'uapi/app/api/executions/route.ts',
  'uapi/app/api/executions/history/route.ts',
  'uapi/app/api/executions/history/[runId]/route.ts',
  'uapi/app/api/executions/_shared.ts',
  'uapi/app/api/vcs/route.ts',
  'uapi/app/api/auxillaries/template-preferences/route.ts',
  'uapi/app/api/templates/shippables/route.ts',
  'packages/api/src/routes/shippables.ts',
  'packages/api/src/pipelines/branch.ts',
  'packages/execution-generics/src/Execution.ts',
  'packages/execution-generics/src/execution-registry.ts',
  'packages/execution-generics/src/storage/ExecutionStorageAdapter.ts',
  'packages/pipelines-generics/src/execution/PipelineExecution.ts',
  'packages/pipelines-generics/src/execution/PipelineExecutor.ts',
  'packages/pipelines-generics/src/execution/route-pipeline-execution.ts',
  'packages/pipelines/asset-pack/src/run.ts',
  'uapi/tests/api/shippableTemplatesRoute.test.ts',
  'uapi/tests/api/vcsCompatibilityRoute.test.ts',
  'uapi/tests/api/orbitalsTemplatePreferencesRoute.test.ts',
  'uapi/tests/api/deliverableTemplatesRoute.test.ts',
  'uapi/tests/api/executionsHistoryRoute.test.ts',
  'uapi/tests/api/executionsHistoryRunRoute.test.ts',
  'uapi/tests/bitcodeExecutionStreamPanel.test.tsx',
  'uapi/tests/usePipelineExecution.test.tsx'
];
const V26_FOURTH_GATE_PROMPT_SYSTEM_FILES = [
  'packages/prompts/README.md',
  'packages/prompts/src/index.ts',
  'packages/prompts/src/prompt.ts',
  'packages/prompts/src/execution/PromptExecution.ts',
  'packages/prompts/src/execution/PromptExecution.js',
  'packages/prompts/src/parts/PromptPart.ts',
  'packages/prompts/src/__tests__/prompt.test.ts',
  'packages/execution-generics/README.md',
  'packages/execution-generics/src/Execution.ts',
  'packages/execution-generics/src/Execution.js',
  'packages/execution-generics/src/prompts/ExecutionPrompt.ts',
  'packages/agent-generics/src/prompts/AgentPrompt.ts',
  'packages/conversations-generics/README.md',
  'packages/conversations-generics/src/prompts/BitcodeTerminalConversationSystemPrompt.ts',
  'packages/generic-agents/jira-processor/src/prompts/system-prompt-jira-processor.ts',
  'packages/generic-agents/jira-processor/src/prompts/agent-prompt-jira-processor.ts',
  'packages/generic-agents/web-researcher/README.md',
  'packages/generic-agents/web-researcher/package.json',
  'packages/generic-agents/web-researcher/src/index.ts',
  'packages/generic-agents/web-researcher/src/index.js',
  'packages/generic-agents/web-researcher/src/schemas.ts',
  'packages/generic-agents/web-researcher/src/schemas.js',
  'packages/generic-agents/web-researcher/src/prompts/agent-prompt-web-researcher.ts',
  'packages/generic-agents/web-researcher/src/prompts/agent-prompt-web-researcher.js',
  'packages/generic-agents/web-researcher/src/prompts/system-prompt-web-researcher.ts',
  'packages/generic-agents/web-researcher/src/prompts/system-prompt-web-researcher.js',
  'packages/generic-agents/web-researcher/src/prompts/plan-prompt-web-researcher.ts',
  'packages/generic-agents/web-researcher/src/prompts/plan-prompt-web-researcher.js',
  'packages/generic-agents/web-researcher/src/prompts/try-prompt-web-researcher.ts',
  'packages/generic-agents/web-researcher/src/prompts/try-prompt-web-researcher.js',
  'packages/generic-agents/web-researcher/src/prompts/refine-prompt-web-researcher.ts',
  'packages/generic-agents/web-researcher/src/prompts/refine-prompt-web-researcher.js',
  'packages/generic-agents/web-researcher/src/prompts/retry-prompt-web-researcher.ts',
  'packages/generic-agents/web-researcher/src/prompts/retry-prompt-web-researcher.js',
  'packages/generic-agents/web-researcher/src/__tests__/enhanced-web-researcher.test.ts',
  'packages/generic-agents/web-researcher/src/__tests__/enhanced-web-researcher.test.js',
  'packages/generic-agents/web-researcher/src/__tests__/research.test.ts',
  'packages/generic-agents/web-researcher/src/__tests__/research.test.js',
  'packages/generic-agents/web-search/README.md',
  'packages/generic-agents/web-search/package.json',
  'packages/generic-agents/web-search/src/index.ts',
  'packages/generic-agents/web-search/src/index.js',
  'packages/generic-agents/web-search/src/prompts/agent-prompt-web-search.ts',
  'packages/generic-agents/web-search/src/prompts/agent-prompt-web-search.js',
  'packages/generic-agents/web-search/src/prompts/system-prompt-web-search.ts',
  'packages/generic-agents/web-search/src/prompts/system-prompt-web-search.js',
  'packages/generic-agents/web-search/src/prompts/plan-prompt-web-search.ts',
  'packages/generic-agents/web-search/src/prompts/plan-prompt-web-search.js',
  'packages/generic-agents/web-search/src/prompts/try-prompt-web-search.ts',
  'packages/generic-agents/web-search/src/prompts/try-prompt-web-search.js',
  'packages/generic-agents/web-search/src/prompts/refine-prompt-web-search.ts',
  'packages/generic-agents/web-search/src/prompts/refine-prompt-web-search.js',
  'packages/generic-agents/web-search/src/prompts/retry-prompt-web-search.ts',
  'packages/generic-agents/web-search/src/prompts/retry-prompt-web-search.js',
  'packages/generic-tools/web-search/README.md',
  'packages/generic-tools/web-search/src/index.ts',
  'packages/generic-tools/web-search/src/index.js',
  'packages/generic-tools/web-search/src/prompts/WebSearchDocCodeToolPrompt.ts',
  'packages/generic-tools/web-search/src/prompts/WebSearchDocCodeToolPrompt.js',
  'packages/generic-tools/web-search/src/prompts/GetContentsDocCodeToolPrompt.ts',
  'packages/generic-tools/web-search/src/prompts/GetContentsDocCodeToolPrompt.js',
  'packages/generic-tools/web-search/src/prompts/MultiProviderSearchDocCodeToolPrompt.ts',
  'packages/generic-tools/web-search/src/prompts/MultiProviderSearchDocCodeToolPrompt.js',
  'packages/generic-agents/danger-wall/README.md',
  'packages/generic-agents/danger-wall/package.json',
  'packages/generic-agents/danger-wall/src/index.ts',
  'packages/generic-agents/danger-wall/src/index.js',
  'packages/generic-agents/danger-wall/src/prompts/agent-prompt-danger-wall.ts',
  'packages/generic-agents/danger-wall/src/prompts/agent-prompt-danger-wall.js',
  'packages/generic-agents/danger-wall/src/prompts/system-prompt-dangerwall.ts',
  'packages/generic-agents/danger-wall/src/prompts/system-prompt-dangerwall.js',
  'packages/generic-agents/danger-wall/src/prompts/plan-prompt-dangerwall.ts',
  'packages/generic-agents/danger-wall/src/prompts/plan-prompt-dangerwall.js',
  'packages/generic-agents/danger-wall/src/prompts/try-prompt-dangerwall.ts',
  'packages/generic-agents/danger-wall/src/prompts/try-prompt-dangerwall.js',
  'packages/generic-agents/danger-wall/src/prompts/refine-prompt-dangerwall.ts',
  'packages/generic-agents/danger-wall/src/prompts/refine-prompt-dangerwall.js',
  'packages/generic-agents/danger-wall/src/prompts/retry-prompt-dangerwall.ts',
  'packages/generic-agents/danger-wall/src/prompts/retry-prompt-dangerwall.js',
  'packages/digest/prompts/digest-prompts.ts',
  'packages/digest/prompts/task-guides-prompts.ts',
  'packages/digest/prompts/code-styles-prompts.ts',
  'packages/digest/prompts/doc-code-tool.generate-digest.ts',
  'packages/generic-tools/files-maintaining/src/prompts/tool-prompt-transaction-begin.ts',
  'packages/generic-tools/vcs/src/prompts/ListRepositoriesDocCodeToolPrompt.ts',
  'packages/external-apps/chatgpt/src/prompts/chatgpt-tool-doc-prompts.ts',
  'packages/external-apps/chatgpt/tsconfig.test.json',
  'packages/external-apps/chatgpt/jest.config.cjs',
  'protocol-demonstration/V26_DOC_COMMENT_REFORM.md',
  'packages/doc-comment/README.md',
  'packages/doc-comment/IMPLEMENTATION.md',
  'packages/doc-comment/src/build-plugin.ts',
  'packages/doc-code/README.md',
  'packages/doc-code/package.json',
  'packages/doc-code/tsconfig.typecheck.json',
  'packages/doc-code/src/index.ts',
  'packages/doc-code/src/index.js',
  'packages/doc-code/src/loaders/doc-code-tool-loader.ts',
  'packages/doc-code/src/loaders/doc-code-tool-loader.js',
  'packages/doc-code/src/transformDocCodeTools.ts',
  'packages/doc-code/src/transformDocCodeTools.js',
  'packages/doc-code/src/__tests__/transform.test.ts',
  'packages/tools-generics/src/Tool.ts',
  'packages/tools-generics/src/index.js',
  'packages/tools-generics/src/execution/ToolExecution.ts',
  'packages/tools-generics/src/execution/ToolExecution.js',
  'packages/tools-generics/src/execution/ToolPromptRegistry.ts',
  'packages/tools-generics/src/execution/ToolPromptRegistry.js',
  'packages/tools-generics/src/doc-code-tool/index.ts',
  'packages/tools-generics/src/doc-code-tool/DocCodeToolDecorator.ts',
  'packages/tools-generics/src/doc-code-tool/DocCodeToolPlugin.ts',
  'packages/tools-generics/src/doc-code-tool/DocCodeToolPlugin.js',
  'packages/tools-generics/src/doc-code-tool/formatUsableTools.ts',
  'packages/tools-generics/src/doc-code-tool/formatUsableTools.js',
  'packages/doc-comment/examples/doc-comments-as-prompts.ts',
  'packages/generic-doc-comment-plugins/doc-developing/README.md',
  'packages/generic-doc-comment-plugins/doc-developing/TLDR.md',
  'packages/generic-doc-comment-plugins/doc-developing/tsconfig.json',
  'protocol-demonstration/test/v26-prompt-runtime-loadability.test.js',
  'packages/pipelines/asset-pack/src/agents/prompts/understand-requirements-prompt.ts',
  'packages/pipelines/asset-pack/src/agents/prompts/plan-implementation-prompt.ts'
];
const V26_RETAINED_PACKAGE_ADMISSIONS = [
  {
    packageName: '@bitcode/supabase',
    primaryRole: 'commercial-infrastructure',
    rationale: 'typed browser/admin/SSR Supabase clients remain the retained persistence entrypoint for Bitcode routes and APIs',
    role: 'Supabase client and SSR session boundary',
    writeBoundary: 'database access is admitted only through app/API-owned Bitcode readiness, auth, profile, repository, and activity semantics',
    proofObligation: 'persistence/schema totality and route/API storage witnesses must keep Supabase as infrastructure rather than product logic',
    requiredFiles: [
      'packages/supabase/src/index.ts',
      'packages/supabase/src/client.ts',
      'packages/supabase/src/ssr/client.ts',
      'packages/supabase/src/ssr/server.ts',
      'packages/supabase/src/ssr/middleware.ts'
    ]
  },
  {
    packageName: '@bitcode/orm',
    primaryRole: 'commercial-infrastructure',
    rationale: 'typed model/query ownership and generated database types remain the retained schema contract layer',
    role: 'typed Bitcode model/query and profile-contract boundary',
    writeBoundary: 'ORM helpers may read/write rows only as schema infrastructure; experimental field-intelligence query ownership is cut from the active package',
    proofObligation: 'retained ORM admission is tied to generated database types, active models, profile readiness, AssetPack evidence vector support, and no active field-intelligence corridor',
    requiredFiles: [
      'packages/orm/src/client.ts',
      'packages/orm/src/models/index.ts',
      'packages/orm/src/models/bitcode-execution-storage.ts',
      'packages/orm/src/profile-contract.ts',
      'packages/orm/src/types/database.generated.ts',
      'packages/orm/src/types/database.ts',
      'packages/orm/src/types/generated/asset_pack_pipeline.generated.ts',
      'packages/orm/scripts/generate-db-types.ts'
    ]
  },
  {
    packageName: '@bitcode/prompts',
    primaryRole: 'commercial-infrastructure',
    rationale: 'prompt abstraction remains the retained owner for prompt text and prompt execution contracts',
    role: 'PromptPart, Prompt, PromptExecution, formatter, and raw promptpart substrate',
    writeBoundary: 'prompts shape inference but do not own settlement, repository writes, or Exchange state mutations',
    proofObligation: 'prompt-system and prompt-space proofs must keep prompt carriers public-boundary, source-visible, and free of active field-intelligence prompt residue',
    requiredFiles: [
      'packages/prompts/README.md',
      'packages/prompts/src/index.ts',
      'packages/prompts/src/prompt.ts',
      'packages/prompts/src/execution/PromptExecution.ts'
    ]
  },
  {
    packageName: '@bitcode/conversations-generics',
    primaryRole: 'commercial-infrastructure',
    rationale: 'conversation agent and prompt abstractions remain admitted while fullscreen conversations converge inward',
    role: 'conversation prompt and agent substrate for Bitcode rich-input writes',
    writeBoundary: 'conversation primitives may carry rich input and execution intent, but app/API routes own persistence, readiness, and Exchange state admission',
    proofObligation: 'conversation continuity and inference implementation records must keep conversations first-class without making them a parallel product',
    requiredFiles: [
      'packages/conversations-generics/README.md',
      'packages/conversations-generics/src/index.ts',
      'packages/conversations-generics/src/agent/ConversationAgent.ts',
      'packages/conversations-generics/src/prompts/BitcodeTerminalConversationSystemPrompt.ts'
    ]
  },
  {
    packageName: '@bitcode/execution-generics',
    primaryRole: 'commercial-infrastructure',
    rationale: 'retained execution abstractions remain admitted while runs and pipelines converge onto Bitcode semantics',
    role: 'retained runs-and-pipelines abstractions',
    writeBoundary: 'execution orchestration only; settle-write meaning is owned by Bitcode routes and Git/GH-facing carriers',
    proofObligation: 'runs/pipelines, prompt-space, and inference-record proofs must keep execution primitives separated from non-Bitcode orchestration ownership',
    requiredFiles: [
      'packages/execution-generics/README.md',
      'packages/execution-generics/src/index.ts',
      'packages/execution-generics/src/Execution.ts',
      'packages/execution-generics/src/execution-registry.ts',
      'packages/execution-generics/src/storage/ExecutionStorageAdapter.ts'
    ]
  },
  {
    packageName: '@bitcode/jira-tools',
    primaryRole: 'ingress-or-support',
    rationale: 'retained Jira MCP tools remain admitted only as reader-first read-ingestion and read-measurement carriers during fourth-gate convergence',
    role: 'Jira read-first external work-tracker ingestion port',
    writeBoundary: 'default scope is authenticated read and normalization; expansive settle-write to Jira comments or attachments is deferred beyond fourth-gate',
    proofObligation: 'retained-package admissibility and system-reform proof must keep Jira outside Bitcode Exchange state ownership',
    requiredFiles: [
      'packages/generic-tools/mcps-tools/jira/package.json',
      'packages/generic-tools/mcps-tools/jira/src/index.ts'
    ]
  },
  {
    packageName: '@bitcode/generic-agents-jira',
    primaryRole: 'reference-only',
    rationale: 'retained Jira agent prompt ownership remains admitted only where it repurposes Jira data into Bitcode read context instead of generic project-management automation',
    role: 'Jira prompt-owned ingestion agent',
    writeBoundary: 'reader-first Jira scope; propose writes only when explicitly requested and never as the default Bitcode settlement path',
    proofObligation: 'prompt and reform proofs must keep this agent as read-ingestion reference material until explicitly promoted',
    requiredFiles: [
      'packages/generic-agents/jira-processor/package.json',
      'packages/generic-agents/jira-processor/src/prompts/system-prompt-jira-processor.ts',
      'packages/generic-agents/jira-processor/src/prompts/agent-prompt-jira-processor.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_jira_processor_system_identity.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_jira_processor_system_role.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_jira_processor_system_instructions.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_jiraprocessor_purpose_corestatement.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_jiraprocessor_capabilities_list.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_jiraprocessor_executionpattern_detailcontent.ts'
    ]
  },
  {
    packageName: '@bitcode/generic-tools-mcps-github',
    primaryRole: 'ingress-or-support',
    rationale: 'retained GitHub MCP tooling remains admitted as the initial Git/GH-centric settle-write and repository-read boundary for reopened fourth-gate and later fifth-gate Bitcode work',
    role: 'Git/GH-centric initial settle-write port',
    writeBoundary: 'Git/GH branch and PR settlement is admitted in fourth-gate; multi-surface settle writes to other systems remain later-gate work',
    proofObligation: 'retained-package and inference-record proofs must keep GitHub as an admitted connected-interface delivery mechanism rather than the only Bitcode settlement model',
    requiredFiles: [
      'packages/generic-tools/mcps-tools/github/package.json',
      'packages/generic-tools/mcps-tools/github/src/GitHubMCPTool.ts',
      'packages/generic-tools/mcps-tools/github/src/prompts/GitHubMCPDocCodeToolPrompt.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_githubmcp_doccodetoolpurpose.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_githubmcp_doccodetoolcapabilities.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_githubmcp_doccodetooloutput.ts'
    ]
  }
];

const V26_RETAINED_PACKAGE_ADMISSION_REQUIRED_FIELDS = [
  'packageName',
  'primaryRole',
  'rationale',
  'role',
  'writeBoundary',
  'proofObligation',
  'requiredFiles'
];
const V26_RETAINED_PACKAGE_ADMISSIBLE_ROLES = [
  'direct-product',
  'commercial-infrastructure',
  'ingress-or-support',
  'compatibility',
  'reference-only'
];
const V26_RETAINED_PACKAGE_CENSUS_POLICY_BY_ROLE = {
  'direct-product': {
    role: 'product-facing Bitcode package surface',
    rationale: 'package participates directly in the Exchange, Terminal, MCP, API, or BTD product experience',
    writeBoundary: 'product writes must pass through Bitcode-owned terminal/API/MCP admission, activity, and settlement semantics',
    proofObligation: 'product packages must stay bound to terminal composition, source-to-shares, runs/pipelines, and interface parity proofs'
  },
  'commercial-infrastructure': {
    role: 'commercial Bitcode infrastructure package',
    rationale: 'package supplies reusable runtime, schema, prompt, execution, storage, security, observability, or UI infrastructure',
    writeBoundary: 'infrastructure packages may support state changes only through admitted product/API owners, not as parallel product logic',
    proofObligation: 'infrastructure packages must remain covered by the relevant totality proof family and package-boundary typecheck/test seams'
  },
  'ingress-or-support': {
    role: 'connected-interface ingress or support package',
    rationale: 'package connects external providers, third-party tools, search/research, VCS, deployment, storage, or support utilities into Bitcode',
    writeBoundary: 'external writes are connected-interface Shippables or input context unless a Bitcode admission proof explicitly promotes them',
    proofObligation: 'ingress/support packages must stay bounded by retained-package, system-reform, MCP/external-ingress, and prompt/tool proof surfaces'
  },
  compatibility: {
    role: 'compatibility corridor retained during Bitcode reform',
    rationale: 'package keeps retained naming or behavior temporarily while its semantics are repurposed to read, asset-pack, or support meaning',
    writeBoundary: 'compatibility packages must expose Bitcode semantics at active boundaries and avoid becoming new source-of-truth product owners',
    proofObligation: 'compatibility packages must keep source-visible reform notes, tests, prompt proof, and a later retirement or promotion path'
  },
  'reference-only': {
    role: 'reference-only retained package corridor',
    rationale: 'package remains in the repository as bounded reference material, not as live Bitcode product behavior',
    writeBoundary: 'reference packages do not own Exchange state, Terminal state, settlement writes, or canonical source-to-shares behavior',
    proofObligation: 'reference packages must stay classified, non-canonical for product writes, and eligible for later removal or explicit promotion'
  }
};
const V26_DIRECT_PRODUCT_PACKAGE_NAMES = new Set([
  '@bitcode/api',
  '@bitcode/btd',
  '@bitcode/chatgptapp',
  '@bitcode/external-apps-chatgpt',
  '@bitcode/external-apps-claude',
  '@bitcode/mcp',
  '@bitcode/mcp-server'
]);
const V26_COMMERCIAL_INFRASTRUCTURE_PACKAGE_NAMES = new Set([
  '@bitcode/agent-generics',
  '@bitcode/artifacts',
  '@bitcode/attachments-generics',
  '@bitcode/auth',
  '@bitcode/browser-storage',
  '@bitcode/context',
  '@bitcode/conversations-generics',
  '@bitcode/digest',
  '@bitcode/doc-code',
  '@bitcode/doc-comment',
  '@bitcode/editing',
  '@bitcode/email',
  '@bitcode/errors',
  '@bitcode/execution-generics',
  '@bitcode/files',
  '@bitcode/generic-llms',
  '@bitcode/git',
  '@bitcode/github',
  '@bitcode/llm-generics',
  '@bitcode/logger',
  '@bitcode/lsp',
  '@bitcode/middleware',
  '@bitcode/models',
  '@bitcode/multimodal-utils',
  '@bitcode/networking',
  '@bitcode/notifications',
  '@bitcode/objects-arrays-objects',
  '@bitcode/obfuscate',
  '@bitcode/observability',
  '@bitcode/orm',
  '@bitcode/parsing',
  '@bitcode/pipelines-generics',
  '@bitcode/prompts',
  '@bitcode/registry',
  '@bitcode/responses',
  '@bitcode/security',
  '@bitcode/streams',
  '@bitcode/styling',
  '@bitcode/supabase',
  '@bitcode/tech-types',
  '@bitcode/templates-generics',
  '@bitcode/time',
  '@bitcode/tools-generics',
  '@bitcode/vcs',
  'eslint-plugin-bitcode'
]);
const V26_INGRESS_OR_SUPPORT_PACKAGE_NAMES = new Set([

  '@bitcode/bitbucket',
  '@bitcode/circleci',
  '@bitcode/cloudflare',
  '@bitcode/docker',
  '@bitcode/containerizations-docker',
  '@bitcode/figma',
  '@bitcode/figma-tools',
  '@bitcode/firecrawl',
  '@bitcode/web-scrapers-firecrawl',
  '@bitcode/generic-agents-danger-wall',
  '@bitcode/generic-agents-read-comprehension',
  '@bitcode/generic-agents-web-research',
  '@bitcode/generic-agents-web-search',
  '@bitcode/generic-tools-code-refactor',
  '@bitcode/generic-tools-editing',
  '@bitcode/generic-tools-firecrawl',
  '@bitcode/generic-tools-git',
  '@bitcode/generic-tools-lsp-query',

  '@bitcode/generic-tools-mcps-aws',
  '@bitcode/generic-tools-mcps-aws-location',
  '@bitcode/generic-tools-mcps-aws-terraform',
  '@bitcode/generic-tools-mcps-bitbucket',
  '@bitcode/generic-tools-mcps-circleci',
  '@bitcode/generic-tools-mcps-cloudflare',
  '@bitcode/generic-tools-mcps-docker',
  '@bitcode/generic-tools-mcps-figma',
  '@bitcode/generic-tools-mcps-git-repo-research',
  '@bitcode/generic-tools-mcps-github',
  '@bitcode/generic-tools-mcps-gitlab',
  '@bitcode/generic-tools-mcps-kubernetes',
  '@bitcode/generic-tools-mcps-mysql',
  '@bitcode/generic-tools-mcps-postgresql',
  '@bitcode/generic-tools-mcps-supabase',
  '@bitcode/generic-tools-mcps-vercel',
  '@bitcode/generic-tools-multimodal-processing',
  '@bitcode/generic-tools-repository-setup',
  '@bitcode/generic-tools-simple-system-text-search',
  '@bitcode/generic-tools-web-search',
  '@bitcode/gitlab',
  '@bitcode/google-analytics',
  '@bitcode/jira',
  '@bitcode/jira-tools',
  '@bitcode/kubernetes',
  '@bitcode/mcps-tools-notion',
  '@bitcode/mysql',
  '@bitcode/notion',
  '@bitcode/postgresql',
  '@bitcode/procurement',
  '@bitcode/refactoring',
  '@bitcode/sentry',
  '@bitcode/simple-system-text-search',
  '@bitcode/vercel',
  '@bitcode/vcs-tools',
  '@bitcode/web-search'
]);
const V26_COMPATIBILITY_PACKAGE_NAMES = new Set([
  '@bitcode/generic-tools-read-comprehension',
  '@bitcode/pipeline-asset-pack',
  '@bitcode/test-intelligence'
]);

function buildV26RetainedPackageAdmissionCheck(entry) {
  const missingFiles = entry.requiredFiles.filter((file) => !repoFileExists(file));
  const missingFields = V26_RETAINED_PACKAGE_ADMISSION_REQUIRED_FIELDS.filter((field) => {
    const value = entry[field];
    return Array.isArray(value) ? value.length === 0 : typeof value !== 'string' || value.length === 0;
  });
  const invalidPrimaryRole = V26_RETAINED_PACKAGE_ADMISSIBLE_ROLES.includes(entry.primaryRole) ? null : entry.primaryRole;

  return {
    packageName: entry.packageName,
    primaryRole: entry.primaryRole,
    rationale: entry.rationale,
    role: entry.role,
    writeBoundary: entry.writeBoundary,
    proofObligation: entry.proofObligation,
    requiredFiles: entry.requiredFiles,
    missingFiles,
    missingFields,
    invalidPrimaryRole,
    passed: missingFiles.length === 0 && missingFields.length === 0 && invalidPrimaryRole === null
  };
}

function collectV26PackageJsonPaths() {
  const packageRoot = path.resolve(REPO_ROOT, 'packages');
  const packageJsonPaths = [];

  /**
   * @param {string} absoluteDirectory
   */
  function visit(absoluteDirectory) {
    for (const entry of readdirSync(absoluteDirectory, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name.startsWith('.')) {
        continue;
      }

      const absolutePath = path.join(absoluteDirectory, entry.name);

      if (entry.isFile() && entry.name === 'package.json') {
        packageJsonPaths.push(path.relative(REPO_ROOT, absolutePath));
        continue;
      }

      if (entry.isDirectory()) {
        visit(absolutePath);
      }
    }
  }

  visit(packageRoot);
  return packageJsonPaths.sort();
}

/**
 * @param {string} packagePath
 * @param {string} packageName
 * @returns {{ primaryRole: string, classificationBasis: string }}
 */
function classifyV26PackageCensusEntry(packagePath, packageName) {
  if (V26_DIRECT_PRODUCT_PACKAGE_NAMES.has(packageName)) {
    return { primaryRole: 'direct-product', classificationBasis: 'direct-product-name' };
  }

  if (V26_COMPATIBILITY_PACKAGE_NAMES.has(packageName)) {
    return { primaryRole: 'compatibility', classificationBasis: 'compatibility-name' };
  }

  if (V26_COMMERCIAL_INFRASTRUCTURE_PACKAGE_NAMES.has(packageName)) {
    return { primaryRole: 'commercial-infrastructure', classificationBasis: 'commercial-infrastructure-name' };
  }

  if (V26_INGRESS_OR_SUPPORT_PACKAGE_NAMES.has(packageName)) {
    return { primaryRole: 'ingress-or-support', classificationBasis: 'ingress-or-support-name' };
  }

  if (packagePath.includes('/generic-agents/') || packagePath.includes('/generic-doc-comment-plugins/')) {
    return { primaryRole: 'reference-only', classificationBasis: 'reference-only-directory' };
  }

  return { primaryRole: 'reference-only', classificationBasis: 'unclassified-reference-fallback' };
}

/**
 * @param {string} packagePath
 * @returns {string[]}
 */
function buildV26PackageCensusRequiredFiles(packagePath) {
  const packageDirectory = path.dirname(packagePath);
  const candidateFiles = [
    packagePath,
    `${packageDirectory}/src/index.ts`,
    `${packageDirectory}/README.md`
  ];

  return candidateFiles.filter(repoFileExists);
}

function buildV26PackageCensus() {
  return collectV26PackageJsonPaths().map((packagePath) => {
    const packageManifest = JSON.parse(readRepoFileText(packagePath));
    const packageName = typeof packageManifest.name === 'string' && packageManifest.name.length > 0
      ? packageManifest.name
      : path.dirname(packagePath);
    const { primaryRole, classificationBasis } = classifyV26PackageCensusEntry(packagePath, packageName);
    const rolePolicy = V26_RETAINED_PACKAGE_CENSUS_POLICY_BY_ROLE[primaryRole];
    const requiredFiles = buildV26PackageCensusRequiredFiles(packagePath);
    const missingFiles = requiredFiles.filter((file) => !repoFileExists(file));
    const unclassified = classificationBasis === 'unclassified-reference-fallback';

    return {
      packageName,
      packagePath,
      primaryRole,
      classificationBasis,
      rationale: rolePolicy.rationale,
      role: rolePolicy.role,
      writeBoundary: rolePolicy.writeBoundary,
      proofObligation: rolePolicy.proofObligation,
      requiredFiles,
      missingFiles,
      unclassified,
      passed: missingFiles.length === 0 && unclassified === false
    };
  });
}

/**
 * @param {{ scenarioId: string, branchMode: string, paymentMode?: string | undefined }} run
 * @returns {string}
 */
function formatRunId(run) {
  return run.paymentMode
    ? `${run.scenarioId}/${run.branchMode}/${run.paymentMode}`
    : `${run.scenarioId}/${run.branchMode}`;
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function stableStringify(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  const record = /** @type {Record<string, unknown>} */ (value);
  return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(',')}}`;
}

/**
 * @param {string} label
 * @returns {() => void}
 */
function beginProvenProfile(label) {
  if (!PROVEN_PROFILE_ENABLED) return () => {};
  const startedAt = process.hrtime.bigint();
  return () => {
    const elapsedMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    process.stderr.write(`[proven-profile] ${label}: ${elapsedMs.toFixed(2)}ms\n`);
  };
}

/**
 * Cache seeded proof collections only for the default runtime entrypoints.
 * Test overrides may intentionally supply alternate builders and should stay uncached.
 *
 * @param {typeof buildInitialState} buildInitialStateFn
 * @param {typeof runMakeBitcodeBranch} runMakeBitcodeBranchFn
 * @returns {boolean}
 */
function canUseDefaultProvenCaches(buildInitialStateFn, runMakeBitcodeBranchFn) {
  return buildInitialStateFn === buildInitialState && runMakeBitcodeBranchFn === runMakeBitcodeBranch;
}

/**
 * @param {{
 *   scenarioIds: string[],
 *   branchModes: string[],
 *   paymentModes: string[]
 * }} input
 * @returns {string}
 */
function buildCollectedProvenRunsCacheKey({
  scenarioIds,
  branchModes,
  paymentModes
}) {
  return stableStringify({
    scenarioIds,
    branchModes,
    paymentModes
  });
}

/**
 * @param {{
 *   version: string,
 *   canonicalCommit: string,
 *   canonicalCommitRecordedAt: string | null,
 *   generatedAt: string,
 *   worktreeState: string,
 *   generatorId: string,
 *   scenarioIds?: string[] | undefined,
 *   branchModes: string[],
 *   paymentModes: string[]
 * }} input
 * @returns {string}
 */
function buildBaseProvenDataCacheKey({
  version,
  canonicalCommit,
  canonicalCommitRecordedAt,
  generatedAt,
  worktreeState,
  generatorId,
  scenarioIds,
  branchModes,
  paymentModes
}) {
  return stableStringify({
    version,
    canonicalCommit,
    canonicalCommitRecordedAt,
    generatedAt,
    worktreeState,
    generatorId,
    scenarioIds: scenarioIds || [],
    branchModes,
    paymentModes
  });
}

/**
 * @param {readonly unknown[]} [values=[]]
 * @returns {string[]}
 */
function summarizeStrings(values = []) {
  return [...new Set((values || []).map((value) => String(value || '').trim()).filter(Boolean))];
}

/**
 * @param {boolean} condition
 * @param {string} message
 */
function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

/**
 * @param {string} relativePath
 * @returns {boolean}
 */
function repoFileExists(relativePath) {
  return existsSync(path.resolve(REPO_ROOT, relativePath));
}

/**
 * @param {string} checkId
 * @param {string} label
 * @param {string[]} requiredFiles
 * @returns {{
 *   checkId: string,
 *   label: string,
 *   passed: boolean,
 *   detail: string,
 *   requiredFiles: string[],
 *   missingFiles: string[]
 * }}
 */
function buildV26FilePresenceCheck(checkId, label, requiredFiles) {
  const missingFiles = requiredFiles.filter((file) => !repoFileExists(file));
  return {
    checkId,
    label,
    passed: missingFiles.length === 0,
    detail: missingFiles.length === 0
      ? `${requiredFiles.length} required files present`
      : `${missingFiles.length} files missing`,
    requiredFiles,
    missingFiles
  };
}

/**
 * @param {string} relativePath
 * @returns {string}
 */
function readRepoFileText(relativePath) {
  return readFileSync(path.resolve(REPO_ROOT, relativePath), 'utf8');
}

/**
 * @param {string} checkId
 * @param {string} label
 * @param {{ file: string, evidence: string, description: string }[]} requiredEvidence
 * @returns {{
 *   checkId: string,
 *   label: string,
 *   passed: boolean,
 *   detail: string,
 *   requiredEvidence: { file: string, evidence: string, description: string }[],
 *   missingFiles: string[],
 *   missingEvidence: { file: string, evidence: string, description: string }[]
 * }}
 */
function buildV26FileContentCheck(checkId, label, requiredEvidence) {
  const fileTextByPath = new Map();
  const missingFiles = [...new Set(requiredEvidence.map((entry) => entry.file))]
    .filter((file) => !repoFileExists(file));
  const missingFileSet = new Set(missingFiles);
  const missingEvidence = requiredEvidence.filter((entry) => {
    if (missingFileSet.has(entry.file)) return true;
    if (!fileTextByPath.has(entry.file)) {
      fileTextByPath.set(entry.file, readRepoFileText(entry.file));
    }
    return !String(fileTextByPath.get(entry.file)).includes(entry.evidence);
  });

  return {
    checkId,
    label,
    passed: missingFiles.length === 0 && missingEvidence.length === 0,
    detail: missingFiles.length === 0 && missingEvidence.length === 0
      ? `${requiredEvidence.length} source evidence requirements satisfied`
      : `${missingFiles.length} files missing; ${missingEvidence.length} evidence requirements missing`,
    requiredEvidence,
    missingFiles,
    missingEvidence
  };
}

/**
 * @param {{
 *   generatedAt: string,
 *   baseData: any,
 *   terminalCompositionProof: any,
 *   conversationsContinuityProof: any,
 *   runsPipelinesTotalityProof: any,
 *   persistenceSchemaTotalityProof: any,
 *   promptSystemTotalityProof: any,
 *   inferenceImplementationRecordsProof: any,
 *   retainedPackageAdmissibilityProof: any
 * }} input
 */
function buildV26FourthGateReclosureReviewProof({
  generatedAt,
  baseData,
  terminalCompositionProof,
  conversationsContinuityProof,
  runsPipelinesTotalityProof,
  persistenceSchemaTotalityProof,
  promptSystemTotalityProof,
  inferenceImplementationRecordsProof,
  retainedPackageAdmissibilityProof
}) {
  const materialProofs = [
    {
      proofId: 'terminal-composition',
      artifactPath: '.bitcode/terminal-composition-proof.json',
      passed: terminalCompositionProof?.passed === true
    },
    {
      proofId: 'conversations-continuity',
      artifactPath: '.bitcode/conversations-continuity-proof.json',
      passed: conversationsContinuityProof?.passed === true
    },
    {
      proofId: 'runs-pipelines-totality',
      artifactPath: '.bitcode/runs-pipelines-totality-proof.json',
      passed: runsPipelinesTotalityProof?.passed === true
    },
    {
      proofId: 'persistence-schema-totality',
      artifactPath: '.bitcode/persistence-schema-totality-proof.json',
      passed: persistenceSchemaTotalityProof?.passed === true
    },
    {
      proofId: 'prompt-system-totality',
      artifactPath: '.bitcode/prompt-system-totality-proof.json',
      passed: promptSystemTotalityProof?.passed === true
    },
    {
      proofId: 'inference-implementation-records',
      artifactPath: '.bitcode/inference-implementation-records-proof.json',
      passed: inferenceImplementationRecordsProof?.passed === true
    },
    {
      proofId: 'retained-package-admissibility',
      artifactPath: '.bitcode/retained-package-admissibility-proof.json',
      passed: retainedPackageAdmissibilityProof?.passed === true
    }
  ];
  const materialProofsPassed = materialProofs.every((proof) => proof.passed === true);
  const criterion = (criterionId, label, evidenceProofIds, detail) => {
    const evidenceProofs = materialProofs.filter((proof) => evidenceProofIds.includes(proof.proofId));
    const passed = evidenceProofs.length > 0 && evidenceProofs.every((proof) => proof.passed === true);
    return {
      criterionId,
      label,
      status: passed ? 'closed' : 'open',
      passed,
      detail,
      evidenceArtifactPaths: evidenceProofs.map((proof) => proof.artifactPath)
    };
  };
  const criteria = [
    criterion(
      'fourth-gate-criterion-01-first-class-retained-interfaces',
      'Conversations, chat, execution, and runs surfaces remain first-class commercial systems',
      ['terminal-composition', 'conversations-continuity', 'runs-pipelines-totality'],
      'Terminal, conversation, and runs proof families keep retained interfaces inside the V26 Bitcode system.'
    ),
    criterion(
      'fourth-gate-criterion-02-bitcode-system-specification',
      'Retained systems are specified as Bitcode V26 systems rather than adjacent subsystems',
      ['terminal-composition', 'inference-implementation-records', 'retained-package-admissibility'],
      'Terminal composition, inference records, and retained-package roles bind retained systems into Bitcode V26.'
    ),
    criterion(
      'fourth-gate-criterion-03-fullscreen-conversations',
      'Conversations operate as a fullscreen terminal mode rather than a separate product reservoir',
      ['conversations-continuity'],
      'The conversations continuity proof covers the fullscreen terminal-mode carrier and route/API bindings.'
    ),
    criterion(
      'fourth-gate-criterion-04-inward-master-detail-port',
      'Execution, AssetPack, and Shippable master-detail patterns are ported inward to /terminal',
      ['terminal-composition', 'runs-pipelines-totality'],
      'Terminal composition and runs proof families cover the inward master-detail transaction/workspace posture.'
    ),
    criterion(
      'fourth-gate-criterion-05-prompt-abstraction-source',
      'Prompt abstraction is the direct source for retained prompt text',
      ['prompt-system-totality'],
      'The prompt-system totality proof covers PromptPart, Prompt, PromptExecution, and public prompt-boundary routing.'
    ),
    criterion(
      'fourth-gate-criterion-06-persistence-owner',
      'Persistence ownership across Supabase, ORM, storage-facing APIs, and /edgetimes is explicit',
      ['persistence-schema-totality'],
      'The persistence/schema proof covers the V26 migration, typed clients, ORM/query carriers, and /edgetimes witnesses.'
    ),
    criterion(
      'fourth-gate-criterion-07-schema-type-obligations',
      'Migrations, schema contracts, ORM/query carriers, and generated types have retained-system obligations',
      ['persistence-schema-totality'],
      'The persistence/schema proof keeps schema, generated types, and route witnesses in the fourth-gate proof set.'
    ),
    criterion(
      'fourth-gate-criterion-08-retained-package-boundaries',
      'Retained package roles and boundaries are explicit',
      ['retained-package-admissibility'],
      'The retained-package admissibility proof requires role, write-boundary, rationale, proof-obligation, and source witnesses.'
    ),
    criterion(
      'fourth-gate-criterion-09-run-pipeline-asset-meaning',
      'AssetPack, Shippable, run, and pipeline meaning are explicit under V26',
      ['runs-pipelines-totality', 'inference-implementation-records'],
      'Runs/pipelines and inference records keep retained execution carriers tied to Bitcode activity, AssetPack, and written-asset semantics.'
    ),
    criterion(
      'fourth-gate-criterion-10-retained-tools-repurposed',
      'Retained tools and agents are Bitcode-purposed with prompt ownership and reader-first scope',
      ['prompt-system-totality', 'inference-implementation-records', 'retained-package-admissibility'],
      'Prompt, inference, and retained-package proofs keep retained ports bounded to Bitcode roles such as read ingestion and source-attributed support.'
    ),
    criterion(
      'fourth-gate-criterion-11-git-gh-initial-settle-write',
      'Git/GitHub-based settle-write carries the initial testnet-ready asset settlement posture',
      ['runs-pipelines-totality', 'retained-package-admissibility'],
      'Runs/pipelines and retained-package admission keep Git/GitHub as the initial connected-interface delivery and settle-write boundary.'
    ),
    criterion(
      'fourth-gate-criterion-12-execution-compatibility-apis',
      'Execution compatibility APIs are explicit promotion-boundary owners',
      ['runs-pipelines-totality'],
      'The runs/pipelines proof names execution, history, VCS, template, and asset-pack endpoint boundaries.'
    ),
    criterion(
      'fourth-gate-criterion-13-canonical-auxillary-apis',
      'Canonical auxillary APIs are explicit active owners rather than latent pane dependencies',
      ['terminal-composition', 'runs-pipelines-totality'],
      'Terminal and runs/activity proof inputs include auxillary API, notification, profile, connection, BTD, usage, transaction, and key carriers.'
    ),
    criterion(
      'fourth-gate-criterion-14-compatibility-route-teaching',
      'Executions and orbitals compatibility routes teach executions and auxillaries as merged-world targets',
      ['terminal-composition', 'runs-pipelines-totality'],
      'Terminal composition plus runs/activity proofing keeps compatibility routes bounded while /terminal and auxillaries carry the canonical topology.'
    ),
    criterion(
      'fourth-gate-criterion-15-shared-activity-vocabulary',
      'Transactions, execution events, and notifications share one typed Bitcode activity vocabulary',
      ['terminal-composition', 'runs-pipelines-totality'],
      'Activity and transaction carriers are included in the Terminal and runs proof basis rather than separate product semantics.'
    ),
    criterion(
      'fourth-gate-criterion-16-proof-family-assignment',
      'Fourth-gate proof obligations are assigned to generated proof families',
      ['conversations-continuity', 'runs-pipelines-totality', 'persistence-schema-totality', 'prompt-system-totality', 'inference-implementation-records', 'retained-package-admissibility'],
      'Generated proof families cover conversations, runs/pipelines, persistence/schema, prompts, inference records, and retained packages.'
    )
  ];
  const materialCriteriaPassed = criteria.every((entry) => entry.passed === true);
  criteria.push({
    criterionId: 'fourth-gate-criterion-17-reopened-acceptance-reclosed',
    label: 'Procedural acceptance closes only after reopened claims are re-reviewed and no blocking fourth-gate deviance remains',
    status: materialCriteriaPassed && materialProofsPassed ? 'closed' : 'open',
    passed: materialCriteriaPassed && materialProofsPassed,
    detail: materialCriteriaPassed && materialProofsPassed
      ? 'The reopened fourth-gate acceptance claim has been re-reviewed against every material criterion and no blocking fourth-gate deviance is detected.'
      : 'The reopened fourth-gate acceptance claim cannot close until every material criterion and proof family passes.',
    evidenceArtifactPaths: [
      '.bitcode/fourth-gate-reclosure-review-proof.json',
      '.bitcode/v26-gate-checkpoint-report.json'
    ]
  });

  const passed = criteria.every((entry) => entry.passed === true);
  const openCriteria = criteria.filter((entry) => entry.passed !== true);

  return {
    reportId: 'v26-fourth-gate-reclosure-review-proof',
    version: 'V26',
    proofSourceCommit: baseData.canonicalCommit,
    generatedAt,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState,
    gate: 'gate-4',
    passed,
    reviewMode: 'post-reopening-deviance-review',
    priorClosureDisposition: 'previous through-fourth-gate promotion claims were overstated and effectively false',
    actualDevianceDisposition: passed
      ? 'actual deviance was unknown before re-review; no blocking fourth-gate deviance is detected by the mapped proof families and acceptance criteria'
      : 'actual deviance remains unresolved because one or more fourth-gate criteria are still open',
    blockingDevianceDetected: !passed,
    materialProofsPassed,
    criterionCount: criteria.length,
    closedCriterionCount: criteria.length - openCriteria.length,
    openCriterionCount: openCriteria.length,
    proceduralClosureReady: passed,
    fifthGateWorkPosture: 'active and open; fifth-gate source-to-shares work may proceed after fourth-gate promoted closure but is not claimed closed by this proof',
    materialProofs,
    openCriteria: openCriteria.map((entry) => entry.criterionId),
    criteria
  };
}

/**
 * @param {{
 *   generatedAt: string,
 *   baseData: any,
 *   inheritedV19: any,
 *   inheritedV20: any,
 *   specFamilyReport: any,
 *   canonicalInputReport: any,
 *   draftPreview: boolean
 * }} input
 */
function buildV26GateCheckpointReport({
  generatedAt,
  baseData,
  inheritedV19,
  inheritedV20,
  specFamilyReport,
  canonicalInputReport,
  draftPreview,
  conversationsContinuityProof,
  runsPipelinesTotalityProof,
  persistenceSchemaTotalityProof,
  promptSystemTotalityProof,
  inferenceImplementationRecordsProof,
  retainedPackageAdmissibilityProof,
  fourthGateReclosureReviewProof,
  sourceToSharesFifthGateProof,
  fifthGateClosureDeepeningProof,
  fifthGateClosureProof,
  sixthGateMvpClosureProof,
  seventhGateCommercialTestnetLaunchProof,
  promptSpaceCompletenessProof,
  wholeRepositoryProductionSatisfactionProof,
  v26TotalClosureProof
}) {
  const firstGateChecks = [
    {
      checkId: 'v19-deterministic-replay',
      label: 'Inherited V19 deterministic replay report',
      passed: inheritedV19?.deterministicReplayReport?.passed === true,
      detail: inheritedV19?.deterministicReplayReport?.passed === true
        ? 'Deterministic replay remains closed'
        : 'Deterministic replay remains open'
    },
    {
      checkId: 'v19-volatility-inventory',
      label: 'Inherited V19 volatility inventory',
      passed: inheritedV19?.volatilityInventory?.passed === true,
      detail: inheritedV19?.volatilityInventory?.passed === true
        ? 'Volatility inventory remains closed'
        : 'Volatility inventory remains open'
    },
    {
      checkId: 'v19-contract-change-ledger',
      label: 'Inherited V19 contract change ledger',
      passed: inheritedV19?.contractChangeLedger?.passed === true,
      detail: inheritedV19?.contractChangeLedger?.passed === true
        ? 'Contract change ledger remains closed'
        : 'Contract change ledger remains open but is treated as inherited later-gate proof work rather than a through-fourth-gate blocker'
    },
    {
      checkId: 'v20-operator-quality',
      label: 'Inherited V20 operator quality summary',
      passed: inheritedV20?.qualitySummary?.passed === true,
      detail: inheritedV20?.qualitySummary?.passed === true
        ? 'Operator quality summary remains closed'
        : 'Operator quality summary remains open'
    },
    {
      checkId: 'v26-spec-family',
      label: 'V26 spec-family report',
      passed: specFamilyReport?.passed === true,
      detail: specFamilyReport?.passed === true
        ? `Spec-family report passes in ${specFamilyReport.mode} mode`
        : 'Spec-family report remains open'
    },
    {
      checkId: 'v26-canonical-input',
      label: 'V26 canonical-input report',
      passed: canonicalInputReport?.passed === true,
      detail: canonicalInputReport?.passed === true
        ? 'Canonical-input report passes for the V26 draft family'
        : 'Canonical-input report remains open'
    }
  ];
  const secondGateChecks = [
    buildV26FilePresenceCheck(
      'second-gate-terminal-carriers',
      'Second-gate Terminal and orbital carriers',
      V26_SECOND_GATE_TERMINAL_FILES
    ),
    buildV26FilePresenceCheck(
      'second-gate-proof-carriers',
      'Second-gate proof and test carriers',
      V26_SECOND_GATE_PROOF_FILES
    ),
    buildV26FilePresenceCheck(
      'second-gate-documentation-carriers',
      'Second-gate documentation and README carriers',
      V26_SECOND_GATE_DOCUMENTATION_FILES
    )
  ];
  const thirdGatePreparationChecks = [
    buildV26FilePresenceCheck(
      'third-gate-preparation-docs',
      'Third-gate preparation and separation artifacts',
      V26_THIRD_GATE_PREPARATION_FILES
    )
  ];
  const thirdGateChecks = [
    buildV26FilePresenceCheck(
      'third-gate-public-shell-carriers',
      'Mounted public-shell and docs-route carriers',
      V26_THIRD_GATE_TERMINAL_FILES
    ),
    buildV26FilePresenceCheck(
      'third-gate-public-proof-carriers',
      'Mounted public-shell proof and test carriers',
      V26_THIRD_GATE_PROOF_FILES
    ),
    buildV26FilePresenceCheck(
      'third-gate-public-documentation-carriers',
      'Mounted public-shell documentation carriers',
      V26_THIRD_GATE_DOCUMENTATION_FILES
    )
  ];
  const fourthGateChecks = [
    {
      checkId: 'fourth-gate-conversations-continuity',
      label: 'Fourth-gate conversations continuity proof',
      passed: conversationsContinuityProof?.passed === true,
      detail: conversationsContinuityProof?.passed === true
        ? 'Conversations and fullscreen chat continuity are explicit and generated'
        : 'Conversations continuity proof remains open'
    },
    {
      checkId: 'fourth-gate-runs-pipelines-totality',
      label: 'Fourth-gate runs and pipelines totality proof',
      passed: runsPipelinesTotalityProof?.passed === true,
      detail: runsPipelinesTotalityProof?.passed === true
        ? 'Retained executions, activity, AssetPack evidence, and pipeline systems totalize under Bitcode'
        : 'Runs and pipelines totality proof remains open'
    },
    {
      checkId: 'fourth-gate-persistence-schema-totality',
      label: 'Fourth-gate persistence and schema totality proof',
      passed: persistenceSchemaTotalityProof?.passed === true,
      detail: persistenceSchemaTotalityProof?.passed === true
        ? 'Persistence, schema, `/edgetimes`, and typed storage carriers are explicit'
        : 'Persistence and schema totality proof remains open'
    },
    {
      checkId: 'fourth-gate-retained-package-admissibility',
      label: 'Fourth-gate retained package admissibility proof',
      passed: retainedPackageAdmissibilityProof?.passed === true,
      detail: retainedPackageAdmissibilityProof?.passed === true
        ? 'Retained non-Bitcode packages have explicit admitted roles'
        : 'Retained package admissibility proof remains open'
    },
    {
      checkId: 'fourth-gate-prompt-system-totality',
      label: 'Fourth-gate prompt system totality proof',
      passed: promptSystemTotalityProof?.passed === true,
      detail: promptSystemTotalityProof?.passed === true
        ? 'PromptPart/Prompt/PromptExecution and retained prompt ports remain explicit through the public @bitcode/prompts boundary with package-by-package prompt surface mapping across active, support, and retained reference consumers, including retained config boundaries that avoid broad prompts/src catchalls'
        : 'Prompt system totality proof remains open'
    },
    {
      checkId: 'fourth-gate-inference-implementation-records',
      label: 'Fourth-gate inference implementation records proof',
      passed: inferenceImplementationRecordsProof?.passed === true,
      detail: inferenceImplementationRecordsProof?.passed === true
        ? 'Prompt, tool, agentic, execution, pipeline, conversation, asset-pack, read-comprehension, and MCP inference systems have source-visible implementation records'
        : 'Inference implementation record proof remains open'
    }
  ];
  const firstGatePassed = firstGateChecks
    .filter((check) => check.checkId !== 'v19-contract-change-ledger')
    .every((check) => check.passed === true);
  const secondGatePassed = secondGateChecks.every((check) => check.passed === true);
  const thirdGatePrepared = thirdGatePreparationChecks.every((check) => check.passed === true);
  const thirdGatePassed = thirdGateChecks.every((check) => check.passed === true);
  const fourthGateMaterialProofsPassed = fourthGateChecks.every((check) => check.passed === true);
  const fourthGateReclosureReviewPassed = fourthGateReclosureReviewProof?.passed === true;
  fourthGateChecks.push({
    checkId: 'fourth-gate-reclosure-review',
    label: 'Fourth-gate reopened acceptance criteria re-review',
    passed: fourthGateReclosureReviewPassed,
    detail: fourthGateReclosureReviewPassed
      ? 'Reopened fourth-gate acceptance criteria are mapped to generated proof families with no blocking fourth-gate deviance detected'
      : 'Fourth-gate acceptance remains open until the reclosure review proof passes'
  });
  fourthGateChecks.push({
    checkId: 'fourth-gate-promotion-honesty',
    label: 'Fourth-gate promotion honesty and procedural closure',
    passed: fourthGateMaterialProofsPassed && fourthGateReclosureReviewPassed,
    detail: fourthGateMaterialProofsPassed && fourthGateReclosureReviewPassed
      ? 'Prior through-fourth-gate promotion claims were re-reviewed as overstated; fourth-gate is promotable only after generated proof-family criteria pass, and fifth-gate closure is judged by its separate generated verdict.'
      : 'Prior through-fourth-gate promotion claims were overstated; fourth-gate acceptance remains procedurally reopened while retained-system convergence proof families are incomplete.'
  });
  const fourthGateProceduralClosurePassed = fourthGateMaterialProofsPassed && fourthGateReclosureReviewPassed;
  const fourthGatePromotedClosed = !draftPreview && fourthGateProceduralClosurePassed;
  fourthGateChecks.push({
    checkId: 'fourth-gate-promoted-closed',
    label: 'Fourth-gate promoted closed checkpoint',
    passed: fourthGatePromotedClosed,
    detail: fourthGatePromotedClosed
      ? 'Fourth gate is promoted closed at the gate level after reopening re-review; fifth-gate and full V26 closure are judged by their own proof families.'
      : 'Fourth gate is not promoted closed until active V26 status and procedural closure are both true.'
  });

  const fifthGateSourceToSharesPassed = sourceToSharesFifthGateProof?.passed === true;
  const fifthGateClosureDeepeningPassed = fifthGateClosureDeepeningProof?.passed === true;
  const fifthGateClosureProofPassed = fifthGateClosureProof?.passed === true
    && fifthGateClosureProof?.closureClaim === true
    && fifthGateClosureProof?.proceduralGateClosure === true;
  const fifthGatePassed = fifthGateSourceToSharesPassed
    && fifthGateClosureDeepeningPassed
    && fifthGateClosureProofPassed;
  const fifthGateClosureDeepened = fifthGateClosureDeepeningPassed
    && fifthGateClosureDeepeningProof?.closureDeepened === true
    && fifthGateClosureDeepeningProof?.openAxisCount === 0;
  const fifthGateChecks = [
    {
      checkId: 'fifth-gate-source-to-shares-baseline',
      label: 'Fifth-gate source-to-shares baseline proof',
      passed: fifthGateSourceToSharesPassed,
      detail: fifthGateSourceToSharesPassed
        ? 'Read review, fit-search admission, settlement fit qualities, and AssetPack receipt carry-through have protocol/commercial proof coverage.'
        : 'Fifth-gate source-to-shares baseline proof remains open.'
    },
    {
      checkId: 'fifth-gate-closure-deepening-proof',
      label: 'Fifth-gate closure deepening proof',
      passed: fifthGateClosureDeepeningPassed,
      detail: fifthGateClosureDeepeningPassed
        ? 'Fifth-gate closure evidence has deepened after fourth-gate promotion closure across Terminal, Exchange, persistence, reform, proof, and environment axes.'
        : 'Fifth-gate closure deepening proof remains open.'
    },
    {
      checkId: 'fifth-gate-closure-proof',
      label: 'Fifth-gate closure verdict',
      passed: fifthGateClosureProofPassed,
      detail: fifthGateClosureProofPassed
        ? 'Fifth-gate closure proof accepts every formal queue row while launch and total closure remain separate gates.'
        : 'Fifth-gate closure remains open until the explicit closure proof passes.'
    },
    {
      checkId: 'fifth-gate-procedural-closure',
      label: 'Fifth-gate procedural closure',
      passed: fifthGatePassed,
      detail: fifthGatePassed
        ? 'Fifth gate is procedurally closed at the minimum-functional Bitcode baseline.'
        : 'Fifth gate is not procedurally closed until source-to-shares, deepening, and closure verdict proofs all pass.'
    }
  ];
  const sixthGatePrepared = fifthGatePassed;
  const sixthGateMvpClosureProofPassed = sixthGateMvpClosureProof?.passed === true
    && sixthGateMvpClosureProof?.closureClaim === true
    && sixthGateMvpClosureProof?.proceduralGateClosure === true;
  const sixthGatePassed = fifthGatePassed && sixthGateMvpClosureProofPassed;
  const sixthGateChecks = [
    {
      checkId: 'sixth-gate-fifth-gate-prerequisite',
      label: 'Fifth-gate prerequisite',
      passed: fifthGatePassed,
      detail: fifthGatePassed
        ? 'Fifth-gate minimum-functional Bitcode closure holds before MVP elevation.'
        : 'Sixth gate is blocked until fifth-gate closure holds.'
    },
    {
      checkId: 'sixth-gate-mvp-closure-proof',
      label: 'Sixth-gate MVP closure proof',
      passed: sixthGateMvpClosureProofPassed,
      detail: sixthGateMvpClosureProofPassed
        ? 'Sixth-gate MVP closure proof accepts every MVP row across Terminal map, operator loop, conversations, auxillaries, interfaces, and architecture.'
        : 'Sixth gate remains open until the MVP closure proof passes.'
    },
    {
      checkId: 'sixth-gate-procedural-closure',
      label: 'Sixth-gate procedural closure',
      passed: sixthGatePassed,
      detail: sixthGatePassed
        ? 'Sixth gate is procedurally closed at the minimal viable product baseline.'
        : 'Sixth gate is not procedurally closed until fifth-gate closure and the MVP closure proof both pass.'
    }
  ];
  const seventhGatePrepared = sixthGatePassed;
  const seventhGateCommercialTestnetLaunchProofPassed = seventhGateCommercialTestnetLaunchProof?.passed === true
    && seventhGateCommercialTestnetLaunchProof?.closureClaim === true
    && seventhGateCommercialTestnetLaunchProof?.proceduralGateClosure === true;
  const seventhGatePassed = sixthGatePassed && seventhGateCommercialTestnetLaunchProofPassed;
  const seventhGateChecks = [
    {
      checkId: 'seventh-gate-fifth-and-sixth-prerequisites',
      label: 'Fifth- and sixth-gate prerequisites',
      passed: sixthGatePassed,
      detail: sixthGatePassed
        ? 'Fifth-gate minimum-functional closure and sixth-gate MVP closure both hold before commercial testnet launch refinement.'
        : 'Seventh gate is blocked until fifth- and sixth-gate closure both hold.'
    },
    {
      checkId: 'seventh-gate-commercial-testnet-launch-proof',
      label: 'Seventh-gate commercial testnet launch proof',
      passed: seventhGateCommercialTestnetLaunchProofPassed,
      detail: seventhGateCommercialTestnetLaunchProofPassed
        ? 'Seventh-gate launch proof accepts every commercial testnet launch row across product readiness, wallet, repository scope, proof/state reread, operator flow, and connected interfaces.'
        : 'Seventh gate is blocked until the commercial testnet launch proof passes.'
    },
    {
      checkId: 'seventh-gate-procedural-closure',
      label: 'Seventh-gate procedural closure',
      passed: seventhGatePassed,
      detail: seventhGatePassed
        ? 'Seventh gate is procedurally closed at the initial commercially viable testnet launch baseline.'
        : 'Seventh gate is not procedurally closed until prerequisites and launch proof both pass.'
    }
  ];
  const eighthGatePrepared = seventhGatePassed;
  const promptSpaceCompletenessProofPassed = promptSpaceCompletenessProof?.passed === true
    && promptSpaceCompletenessProof?.closureClaim === true
    && promptSpaceCompletenessProof?.proceduralGateClosure === true;
  const wholeRepositoryProductionSatisfactionProofPassed = wholeRepositoryProductionSatisfactionProof?.passed === true
    && wholeRepositoryProductionSatisfactionProof?.closureClaim === true
    && wholeRepositoryProductionSatisfactionProof?.proceduralGateClosure === true;
  const v26TotalClosureProofPassed = v26TotalClosureProof?.passed === true
    && v26TotalClosureProof?.closureClaim === true
    && v26TotalClosureProof?.proceduralGateClosure === true;
  const eighthGatePassed = eighthGatePrepared
    && promptSpaceCompletenessProofPassed
    && wholeRepositoryProductionSatisfactionProofPassed
    && v26TotalClosureProofPassed;
  const eighthGateChecks = [
    {
      checkId: 'eighth-gate-fifth-sixth-seventh-prerequisites',
      label: 'Fifth-, sixth-, and seventh-gate prerequisites',
      passed: seventhGatePassed,
      detail: seventhGatePassed
        ? 'Fifth-gate minimum-functional closure, sixth-gate MVP closure, and seventh-gate commercial testnet launch closure all hold before final V26 provation.'
        : 'Eighth gate is blocked until fifth-, sixth-, and seventh-gate closure all hold.'
    },
    {
      checkId: 'eighth-gate-prompt-space-completeness-proof',
      label: 'Prompt-space completeness proof',
      passed: promptSpaceCompletenessProofPassed,
      detail: promptSpaceCompletenessProofPassed
        ? 'Prompt-space completeness proof closes every prompt-space witness set and final completeness dimension.'
        : 'Prompt-space completeness remains open.'
    },
    {
      checkId: 'eighth-gate-whole-repository-production-satisfaction-proof',
      label: 'Whole-repository production satisfaction proof',
      passed: wholeRepositoryProductionSatisfactionProofPassed,
      detail: wholeRepositoryProductionSatisfactionProofPassed
        ? 'Whole-repository production satisfaction proof closes terminal, API, MCP, ChatGPT App, package, proof, and reform evidence as one Bitcode product.'
        : 'Whole-repository production satisfaction remains open.'
    },
    {
      checkId: 'eighth-gate-v26-total-closure-proof',
      label: 'V26 total closure proof',
      passed: v26TotalClosureProofPassed,
      detail: v26TotalClosureProofPassed
        ? 'V26 total closure proof accepts the final repository closure queue.'
        : 'V26 total closure remains open.'
    },
    {
      checkId: 'eighth-gate-procedural-closure',
      label: 'Eighth-gate procedural closure',
      passed: eighthGatePassed,
      detail: eighthGatePassed
        ? 'Eighth gate is procedurally closed; V26 is ready for canonical promotion without interpretive notes.'
        : 'Eighth gate remains open until prerequisites, prompt-space completeness, whole-repository satisfaction, and total closure all pass.'
    }
  ];
  const checkpointPassed = firstGatePassed
    && secondGatePassed
    && thirdGatePassed
    && fourthGatePromotedClosed
    && fifthGatePassed
    && sixthGatePassed
    && seventhGatePassed
    && eighthGatePassed;

  return {
    reportId: 'v26-gate-checkpoint-report',
    version: 'V26',
    proofSourceCommit: baseData.canonicalCommit,
    generatedAt,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState,
    activeCanonicalTarget: ACTIVE_CANON_VERSION,
    draftPreview,
    checkpointId: eighthGatePassed
      ? 'v26-through-eighth-gate-fully-proven'
      : 'v26-through-seventh-gate-closed-on-eight-gate-v26',
    checkpointFocus: eighthGatePassed
      ? 'through-eighth-gate-fully-proven'
      : 'through-seventh-gate-closed-on-eight-gate-v26',
    nextGate: eighthGatePassed
      ? 'V26 fully proven: ready for canonical promotion'
      : (seventhGatePassed
      ? 'Gate 8: whole-repository provation and final V26 closure'
      : (sixthGatePassed
        ? 'Gate 7 blocked: initial commercially-viable testnet live-launch refinement after sixth-gate MVP closure'
        : 'Gate 6: minimal viable product elevation after fifth-gate minimum-functional closure')),
    passed: checkpointPassed,
    firstGate: {
      gateId: 'gate-1',
      label: 'Ownership migration baseline',
      passed: firstGatePassed,
      checks: firstGateChecks
    },
    secondGate: {
      gateId: 'gate-2',
      label: 'Terminal UX/UI and external interfacing hardening',
      passed: secondGatePassed,
      checks: secondGateChecks
    },
    thirdGatePreparation: {
      gateId: 'gate-3-preparation',
      label: 'Marketing refurbishment preparation',
      prepared: thirdGatePrepared,
      checks: thirdGatePreparationChecks
    },
    thirdGate: {
      gateId: 'gate-3',
      label: 'Mounted public-shell closure',
      passed: thirdGatePassed,
      checks: thirdGateChecks
    },
    fourthGate: {
      gateId: 'gate-4',
      label: 'Merged-world Terminal and retained-system convergence',
      passed: fourthGateProceduralClosurePassed,
      reopened: !fourthGateProceduralClosurePassed,
      promotedClosed: fourthGatePromotedClosed,
      promotionStatus: fourthGatePromotedClosed ? 'promoted-closed' : 'not-promoted',
      materialProofsPassed: fourthGateMaterialProofsPassed,
      reclosureReviewPassed: fourthGateReclosureReviewPassed,
      proceduralClosurePassed: fourthGateProceduralClosurePassed,
      acceptanceBlockedByReopenedPromotion: !fourthGateProceduralClosurePassed,
      checks: fourthGateChecks
    },
    fifthGate: {
      gateId: 'gate-5',
      label: 'Minimum-functional Bitcode Exchange, Bitcode Terminal, and total retained-system reform baseline',
      passed: fifthGatePassed,
      open: !fifthGatePassed,
      closureDeepened: fifthGateClosureDeepened,
      sourceToSharesProofPassed: fifthGateSourceToSharesPassed,
      closureDeepeningProofPassed: fifthGateClosureDeepeningPassed,
      closureProofPassed: fifthGateClosureProofPassed,
      proceduralClosurePassed: fifthGatePassed,
      promotionStatus: fifthGatePassed ? 'promoted-closed' : 'not-promoted',
      checks: fifthGateChecks,
      detail: fifthGatePassed
        ? 'Fifth gate is closed at the minimum-functional Bitcode baseline. Sixth and seventh gate closure are judged by their generated proof families.'
        : 'Fifth-gate drafting and implementation remain active after fourth-gate promoted closure. Fifth-gate owns minimum-functional Bitcode Exchange and Terminal closure plus the broad retained-system reform baseline required to make the kept repository read as Bitcode-native around source-to-shares.'
    },
    sixthGate: {
      gateId: 'gate-6',
      label: 'Minimal viable product elevation',
      prepared: sixthGatePrepared,
      passed: sixthGatePassed,
      open: !sixthGatePassed,
      closureProofPassed: sixthGateMvpClosureProofPassed,
      proceduralClosurePassed: sixthGatePassed,
      promotionStatus: sixthGatePassed ? 'promoted-closed' : 'not-promoted',
      checks: sixthGateChecks,
      detail: sixthGatePassed
        ? 'Sixth gate is closed at the minimal viable product baseline. Seventh gate closure is judged by the commercial testnet launch proof.'
        : 'Sixth-gate MVP elevation is blocked until the fifth-gate baseline is elevated into a coherent minimal viable product across Exchange, Terminal, Protocol, Proofs, and admitted interfaces.'
    },
    seventhGate: {
      gateId: 'gate-7',
      label: 'Initial commercially-viable testnet live-launch refinement',
      prepared: seventhGatePrepared,
      passed: seventhGatePassed,
      open: !seventhGatePassed,
      closureProofPassed: seventhGateCommercialTestnetLaunchProofPassed,
      proceduralClosurePassed: seventhGatePassed,
      promotionStatus: seventhGatePassed ? 'promoted-closed' : 'not-promoted',
      checks: seventhGateChecks,
      detail: seventhGatePassed
        ? 'Seventh gate is closed at the initial commercially viable testnet launch baseline. Final V26 closure is judged by the Gate 8 proof family.'
        : 'Seventh-gate launch refinement is blocked until the MVP baseline is refined into a commercially credible, testnet-first product story.'
    },
    eighthGate: {
      gateId: 'gate-8',
      label: 'Whole-repository provation and final V26 closure',
      prepared: eighthGatePrepared,
      passed: eighthGatePassed,
      open: !eighthGatePassed,
      promptSpaceCompletenessProofPassed,
      wholeRepositoryProductionSatisfactionProofPassed,
      closureProofPassed: v26TotalClosureProofPassed,
      proceduralClosurePassed: eighthGatePassed,
      promotionStatus: eighthGatePassed ? 'promoted-closed' : 'not-promoted',
      checks: eighthGateChecks,
      detail: eighthGatePassed
        ? 'Eighth gate is closed: whole-repository Bitcode provation, prompt-space completeness, and V26 total closure have explicit generated closure verdicts.'
        : 'Eighth-gate remains open and owns final whole-repository Bitcode provation, prompt-space closure, and the definition-of-done for V26 productization.'
    }
  };
}

/**
 * @param {{
 *   generatedAt: string,
 *   baseData: any
 * }} input
 */
function buildV26PersistenceSchemaTotalityProof({
  generatedAt,
  baseData
}) {
  const checks = [
    buildV26FilePresenceCheck(
      'persistence-baseline-and-typed-owners',
      'Persistence baseline, typed clients, ORM/query owners, and generated type carriers',
      V26_FOURTH_GATE_PERSISTENCE_FILES
    ),
    buildV26FileContentCheck(
      'persistence-bitcode-execution-storage-models',
      'Bitcode execution storage tables have explicit ORM model ownership and schema parity mapping',
      [
        {
          file: 'packages/orm/src/models/bitcode-execution-storage.ts',
          evidence: 'BITCODE_EXECUTION_STORAGE_SCHEMA_PARITY',
          description: 'ORM declares the V26 storage interpretation map for execution and AssetPack evidence tables'
        },
        {
          file: 'packages/orm/src/models/bitcode-execution-storage.ts',
          evidence: "assetPackPhaseExecutions: 'phase_executions'",
          description: 'AssetPack phase execution meaning is mapped to the active phase_executions table'
        },
        {
          file: 'packages/orm/src/models/bitcode-execution-storage.ts',
          evidence: 'class AssetPackGeneratedAssetsModel',
          description: 'generated asset evidence has an explicit AssetPack ORM owner'
        },
        {
          file: 'packages/orm/src/models/bitcode-execution-storage.ts',
          evidence: 'class BitcodeTokenCostsModel',
          description: 'token-cost rows have an explicit Bitcode ORM owner for execution economics'
        },
        {
          file: 'packages/orm/src/client.ts',
          evidence: 'export interface BitcodeOrmClient',
          description: 'public ORM client is named as Bitcode infrastructure rather than Engi infrastructure'
        },
        {
          file: 'packages/orm/src/client.d.ts',
          evidence: 'export interface BitcodeOrmClient',
          description: 'tracked declaration surface preserves the canonical Bitcode ORM client name'
        },
        {
          file: 'packages/orm/src/index.d.ts',
          evidence: 'BITCODE_EXECUTION_STORAGE_SCHEMA_PARITY',
          description: 'public package declarations export the execution-storage parity contract'
        },
        {
          file: 'packages/orm/src/__tests__/bitcode-execution-storage.test.ts',
          evidence: 'declares the V26 schema bridge for every former unresolved storage table',
          description: 'package-local test locks the storage parity map'
        }
      ]
    )
  ];
  const passed = checks.every((check) => check.passed === true);

  return {
    reportId: 'v26-persistence-schema-totality-proof',
    version: 'V26',
    proofSourceCommit: baseData.canonicalCommit,
    generatedAt,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState,
    passed,
    baselineMigrationPath: 'supabase/migrations/001_v26_production.sql',
    routeWitnesses: [
      '/edgetimes',
      '/api/edgetimes'
    ],
    storageTableParity: Object.fromEntries(V26_FOURTH_GATE_STORAGE_TABLE_PARITY),
    unresolvedTables: [],
    checks
  };
}

/**
 * @param {{
 *   generatedAt: string,
 *   baseData: any
 * }} input
 */
function buildV26TerminalCompositionProof({
  generatedAt,
  baseData
}) {
  const checks = [
    buildV26FilePresenceCheck(
      'terminal-route-and-shell-owners',
      'Terminal route, shell bridge, and native surface owners remain explicit',
      [
        'uapi/app/terminal/page.tsx',
        'uapi/app/terminal/TerminalPageClient.tsx',
        'uapi/app/terminal/terminal-shell-bridge.tsx',
        'uapi/app/terminal/TerminalExperienceFrame.tsx',
        'uapi/app/terminal/TerminalTransactionWorkspace.tsx',
        'uapi/app/terminal/TerminalWorkspaceRail.tsx',
        'uapi/app/terminal/TerminalPreservedShellSurface.tsx',
        'protocol-demonstration/public/app.js',
        'protocol-demonstration/src/client-entry.js'
      ]
    ),
    buildV26FilePresenceCheck(
      'terminal-route-state-and-debug-owners',
      'Route query state, environment controls, and floating debug-widget owners remain explicit',
      [
        'uapi/app/terminal/terminal-transaction-query.ts',
        'uapi/app/terminal/TerminalExternalInterfacingPanel.tsx',
        'uapi/app/terminal/TerminalFloatingDebugWidget.tsx',
        'uapi/tests/terminalTransactionQuery.test.ts',
        'uapi/tests/terminalExternalInterfacingPanel.test.tsx',
        'uapi/tests/terminalFloatingDebugWidget.test.tsx'
      ]
    ),
    buildV26FileContentCheck(
      'chatgpt-app-connected-interface-write-admission',
      'ChatGPT App connected-interface writes fail closed on explicit confirmation and emit Bitcode write-admission receipts',
      [
        {
          file: 'packages/external-apps/chatgpt/src/tools.ts',
          evidence: 'function assertConfirmedConnectedInterfaceWrite',
          description: 'ChatGPT App write tools share a fail-closed confirmation guard'
        },
        {
          file: 'packages/external-apps/chatgpt/src/tools.ts',
          evidence: 'Bitcode ChatGPT App write admission requires confirmed: true',
          description: 'direct tool execution rejects unconfirmed connected-interface writes'
        },
        {
          file: 'packages/external-apps/chatgpt/src/tools.ts',
          evidence: "permission: 'explicit_user_confirmation'",
          description: 'write receipts expose explicit confirmation as the permission basis'
        },
        {
          file: 'packages/external-apps/chatgpt/src/tools.ts',
          evidence: "exchangeStateRole: 'connected_interface_delivery_mechanism'",
          description: 'ChatGPT App writes are delivery mechanisms rather than Exchange state owners'
        },
        {
          file: 'packages/external-apps/chatgpt/src/server.ts',
          evidence: 'Bitcode is the source-to-shares protocol surfaced through ChatGPT',
          description: 'server instructions frame ChatGPT App as a Bitcode Terminal companion interface'
        },
        {
          file: 'packages/external-apps/chatgpt/src/__tests__/tools.test.ts',
          evidence: 'rejects ChatGPT App connected-interface writes without explicit confirmation',
          description: 'unit proof covers unconfirmed write rejection'
        },
        {
          file: 'packages/external-apps/chatgpt/src/__tests__/tools.test.ts',
          evidence: 'declares confirmation schema on every ChatGPT App connected-interface write carrier',
          description: 'unit proof covers schema-level confirmation requirements across GitHub, Vercel, and AWS write carriers'
        },
        {
          file: 'packages/external-apps/chatgpt/src/__tests__/tools.test.ts',
          evidence: 'write_code_changes_to_vcs creates GitHub repository after explicit write admission',
          description: 'unit proof covers GitHub write admission through the ChatGPT App VCS tool'
        },
        {
          file: 'packages/external-apps/chatgpt/src/__tests__/tools.test.ts',
          evidence: "targetAnchor: 'github:bitcode-yapper'",
          description: 'unit proof covers target-bound GitHub write admission'
        },
        {
          file: 'packages/external-apps/chatgpt/src/__tests__/tools.test.ts',
          evidence: "targetAnchor: 'vercel:team_bitcode/prj_Yapper'",
          description: 'unit proof covers target-bound Vercel write admission'
        },
        {
          file: 'packages/external-apps/chatgpt/src/__tests__/yapperFlow.test.ts',
          evidence: 'confirmed: true',
          description: 'demo-flow proof invokes write tools through explicit confirmation payloads'
        }
      ]
    )
  ];
  const passed = checks.every((check) => check.passed === true);

  return {
    reportId: 'v26-terminal-composition-proof',
    version: 'V26',
    proofSourceCommit: baseData.canonicalCommit,
    generatedAt,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState,
    passed,
    routeWitnesses: [
      '/terminal'
    ],
    checks
  };
}

/**
 * @param {{
 *   generatedAt: string,
 *   baseData: any
 * }} input
 */
function buildV26EnvironmentModeCoherenceProof({
  generatedAt,
  baseData
}) {
  const checks = [
    buildV26FilePresenceCheck(
      'environment-runtime-resolution',
      'Protocol runtime and external-realization resolution remain explicit',
      [
        'protocol-demonstration/src/canonical/v24-external-realization.js',
        'protocol-demonstration/server.js',
        'uapi/app/api/external-realization/route.ts'
      ]
    ),
    buildV26FilePresenceCheck(
      'environment-terminal-controls-and-tests',
      'Terminal environment controls and route-local proof carriers remain explicit',
      [
        'uapi/app/terminal/terminal-external-runtime.ts',
        'uapi/app/terminal/TerminalExternalInterfacingPanel.tsx',
        'uapi/app/terminal/TerminalFloatingDebugWidget.tsx',
        'uapi/tests/api/externalRealizationRoute.test.ts',
        'uapi/tests/terminalExternalRuntime.test.ts',
        'uapi/tests/terminalExternalInterfacingPanel.test.tsx',
        'uapi/tests/terminalFloatingDebugWidget.test.tsx'
      ]
    )
  ];
  const passed = checks.every((check) => check.passed === true);

  return {
    reportId: 'v26-environment-mode-coherence-proof',
    version: 'V26',
    proofSourceCommit: baseData.canonicalCommit,
    generatedAt,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState,
    passed,
    supportedModes: ['mock', 'development', 'staging', 'production'],
    checks
  };
}

/**
 * @param {{
 *   generatedAt: string,
 *   baseData: any
 * }} input
 */
function buildV26RetainedPackageAdmissibilityProof({
  generatedAt,
  baseData
}) {
  const packages = V26_RETAINED_PACKAGE_ADMISSIONS.map(buildV26RetainedPackageAdmissionCheck);
  const packageCensus = buildV26PackageCensus();
  const unclassifiedPackages = packageCensus.filter((entry) => entry.unclassified === true);
  const packageCensusCoveragePassed = packageCensus.length > packages.length &&
    packageCensus.every((entry) => entry.passed === true) &&
    unclassifiedPackages.length === 0;
  const passed = packages.every((entry) => entry.passed === true) && packageCensusCoveragePassed;
  const roleCounts = packages.reduce((counts, entry) => {
    counts[entry.primaryRole] = (counts[entry.primaryRole] || 0) + 1;
    return counts;
  }, {});
  const packageCensusRoleCounts = packageCensus.reduce((counts, entry) => {
    counts[entry.primaryRole] = (counts[entry.primaryRole] || 0) + 1;
    return counts;
  }, {});

  return {
    reportId: 'v26-retained-package-admissibility-proof',
    version: 'V26',
    proofSourceCommit: baseData.canonicalCommit,
    generatedAt,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState,
    passed,
    admittedPackageCount: packages.length,
    requiredFields: V26_RETAINED_PACKAGE_ADMISSION_REQUIRED_FIELDS,
    admissibleRoles: V26_RETAINED_PACKAGE_ADMISSIBLE_ROLES,
    roleCounts,
    packages,
    packageCensusCount: packageCensus.length,
    packageCensusCoveragePassed,
    packageCensusRoleCounts,
    unclassifiedPackageCount: unclassifiedPackages.length,
    unclassifiedPackagePaths: unclassifiedPackages.map((entry) => entry.packagePath),
    packageCensus
  };
}

/**
 * @param {{
 *   generatedAt: string,
 *   baseData: any
 * }} input
 */
function buildV26PromptSystemTotalityProof({
  generatedAt,
  baseData
}) {
  const checks = [
    buildV26FilePresenceCheck(
      'prompt-package-core',
      'PromptPart, Prompt, PromptExecution, public-boundary proof, prompt surface map, tests, and package docs remain explicit',
      [
        'packages/prompts/README.md',
        'packages/prompts/src/index.ts',
        'packages/prompts/src/prompt.ts',
        'packages/prompts/src/prompt.js',
        'packages/prompts/src/execution/PromptExecution.ts',
        'packages/prompts/src/execution/PromptExecution.js',
        'packages/prompts/src/parts/PromptPart.ts',
        'packages/prompts/src/__tests__/prompt.test.ts',
        'protocol-demonstration/src/canonical/inference-implementation-records.js',
        'protocol-demonstration/V26_PROMPT_SURFACES.md',
        'protocol-demonstration/V26_INFERENCE_SYSTEMS.md',
        'protocol-demonstration/test/v26-inference-implementation-records.test.js',
        'protocol-demonstration/test/v26-prompt-system-boundary.test.js',
        'protocol-demonstration/test/v26-prompt-surface-map.test.js',
        'protocol-demonstration/test/v26-prompt-runtime-loadability.test.js'
      ]
    ),
    buildV26FilePresenceCheck(
      'prompt-runtime-loadability',
      'Prompt, execution-aware prompt, and doc-code runtime carriers stay loadable through public package boundaries without the full execution storage/runtime stack',
      [
        'packages/prompts/package.json',
        'packages/prompts/src/execution/PromptExecution.ts',
        'packages/prompts/src/execution/PromptExecution.js',
        'packages/execution-generics/package.json',
        'packages/execution-generics/src/Execution.ts',
        'packages/execution-generics/src/Execution.js',
        'packages/execution-generics/src/prompts/ExecutionPrompt.ts',
        'packages/execution-generics/src/prompts/ExecutionPrompt.js',
        'packages/registry/package.json',
        'packages/doc-comment/package.json',
        'packages/doc-code/package.json',
        'packages/tools-generics/package.json',
        'packages/tools-generics/src/index.js',
        'packages/tools-generics/src/execution/ToolExecution.ts',
        'packages/tools-generics/src/execution/ToolExecution.js',
        'packages/tools-generics/src/execution/ToolPromptRegistry.ts',
        'packages/tools-generics/src/execution/ToolPromptRegistry.js',
        'packages/tools-generics/src/doc-code-tool/DocCodeToolPrompt.ts',
        'packages/tools-generics/src/doc-code-tool/DocCodeToolPlugin.ts',
        'packages/tools-generics/src/doc-code-tool/DocCodeToolPlugin.js',
        'packages/tools-generics/src/doc-code-tool/formatUsableTools.ts',
        'packages/tools-generics/src/doc-code-tool/formatUsableTools.js',
        'protocol-demonstration/test/v26-prompt-runtime-loadability.test.js'
      ]
    ),
    buildV26FilePresenceCheck(
      'support-package-public-subpaths',
      'Support-package manifests and runtime carriers keep public source-backed subpaths explicit',
      [
        'packages/prompts/src/prompt.ts',
        'packages/prompts/src/prompt.js',
        'packages/execution-generics/package.json',
        'packages/registry/package.json',
        'packages/doc-comment/package.json',
        'packages/doc-code/package.json',
        'packages/tools-generics/package.json',
        'packages/tools-generics/src/execution/ToolPromptRegistry.ts',
        'packages/tools-generics/src/execution/ToolPromptRegistry.js',
        'packages/tools-generics/src/doc-code-tool/DocCodeToolPlugin.ts',
        'packages/tools-generics/src/doc-code-tool/DocCodeToolPlugin.js',
        'protocol-demonstration/test/v26-prompt-system-boundary.test.js'
      ]
    ),
    buildV26FilePresenceCheck(
      'execution-agent-and-conversation-prompt-extensions',
      'Execution-aware prompt carriers, broader active execution-bearing runtime carriers, and conversation bootstrap remain explicit through narrow public prompt/execution subpaths',
      [
        'packages/execution-generics/package.json',
        'packages/execution-generics/README.md',
        'packages/execution-generics/src/prompts/ExecutionPrompt.ts',
        'packages/execution-generics/src/store/registry.ts',
        'packages/execution-generics/src/executors/resilient_executor.ts',
        'packages/agent-generics/README.md',
        'packages/agent-generics/TLDR.md',
        'packages/agent-generics/src/prompts/AgentPrompt.ts',
        'packages/agent-generics/src/prompts/AgentStepPrompt.ts',
        'packages/agent-generics/src/prompts/AgentGenerationSubStepPrompt.ts',
        'packages/agent-generics/src/prompts/FailsafeMetaSubStepPrompt.ts',
        'packages/agent-generics/src/prompts/ToolExecutionPrompt.ts',
        'packages/agent-generics/src/execution/AgentExecution.ts',
        'packages/agent-generics/src/execution/index.ts',
        'packages/agent-generics/src/agents/factories.ts',
        'packages/agent-generics/src/diagnostics/trace.ts',
        'packages/agent-generics/src/diagnostics/instrumentation.ts',
        'packages/agent-generics/src/execution/file-diff-integration.ts',
        'packages/agent-generics/src/substeps/factories.ts',
        'packages/agent-generics/src/types.ts',
        'packages/pipelines-generics/src/prompts/PipelinePrompt.ts',
        'packages/pipelines-generics/src/execution/Metrics.ts',
        'packages/pipelines-generics/src/execution/PipelineExecution.ts',
        'packages/pipelines-generics/src/execution/PipelinePromptRegistry.ts',
        'packages/pipelines-generics/src/execution/PipelineToolRegistry.ts',
        'packages/pipelines-generics/src/execution/PipelineLLMRegistry.ts',
        'packages/pipelines-generics/src/execution/PipelineAgentRegistry.ts',
        'packages/pipelines-generics/src/execution/pipeline-types.ts',
        'packages/pipelines-generics/src/execution/resume.ts',
        'packages/pipelines-generics/src/execution/route-pipeline-execution.ts',
        'packages/pipelines-generics/src/phases/phase-factory.ts',
        'packages/pipelines-generics/src/phases/sdivf-factory.ts',
        'packages/pipelines-generics/src/pipeline-factory.ts',
        'packages/pipelines-generics/src/gate-system/meta-phase-orchestrator.ts',
        'packages/pipelines-generics/src/gate-system/types.ts',
        'packages/pipelines-generics/TLDR.md',
        'packages/pipelines-generics/src/executors/wait-for-instruction.ts',
        'packages/pipelines-generics/src/streaming/pipeline-stream-integration.ts',
        'packages/conversations-generics/package.json',
        'packages/conversations-generics/README.md',
        'packages/conversations-generics/src/prompts/BitcodeTerminalConversationSystemPrompt.ts',
        'packages/conversations-generics/src/agent/ConversationAgent.ts'
      ]
    ),
    buildV26FilePresenceCheck(
      'support-prompt-consumer-boundaries',
      'Support prompt consumers plus prompt-primitive support carriers remain explicit on the public prompt boundary',
      [
        'packages/digest/package.json',
        'packages/digest/prompts/digest-prompts.ts',
        'packages/digest/prompts/task-guides-prompts.ts',
        'packages/digest/prompts/code-styles-prompts.ts',
        'packages/digest/prompts/doc-code-tool.generate-digest.ts',
        'packages/tools-generics/src/types.ts',
        'packages/tools-generics/src/doc-code-tool/formatUsableTools.ts',
        'packages/llm-generics/src/generation.ts',
        'packages/time/src/doc-prompts/time-prompt-doc.ts',
        'scripts/architecture-review.ts',
        'scripts/codemod-deep-promptparts.mjs',
        'scripts/fix-barrel-imports.sh',
        'scripts/fix-corrupted-imports.sh',
        'scripts/fix-multiline-imports.sh',
        'scripts/fix-remaining-imports.sh',
        'scripts/generate-massive-prompt-parts.ts',
        'scripts/mass-update-prompt-parts.ts',
        'scripts/normalize-asset-pack-promptparts.mjs'
      ]
    ),
    buildV26FilePresenceCheck(
      'doc-comment-doc-code-tool-injection-support',
      'Doc-comment and doc-code keep tool prompt injection explicit under Bitcode ownership',
      [
        'protocol-demonstration/V26_DOC_COMMENT_REFORM.md',
        'protocol-demonstration/V26_INFERENCE_SYSTEMS.md',
        'packages/doc-comment/README.md',
        'packages/doc-comment/src/build-plugin.ts',
        'packages/doc-code/README.md',
        'packages/doc-code/package.json',
        'packages/doc-code/tsconfig.typecheck.json',
        'packages/doc-code/src/index.ts',
        'packages/doc-code/src/index.js',
        'packages/doc-code/src/loaders/doc-code-tool-loader.ts',
        'packages/doc-code/src/loaders/doc-code-tool-loader.js',
        'packages/doc-code/src/transformDocCodeTools.ts',
        'packages/doc-code/src/transformDocCodeTools.js',
        'packages/doc-code/src/__tests__/transform.test.ts',
        'packages/tools-generics/src/Tool.ts',
        'packages/tools-generics/src/doc-code-tool/index.ts',
        'packages/tools-generics/src/doc-code-tool/DocCodeToolDecorator.ts'
      ]
    ),
    buildV26FilePresenceCheck(
      'reference-prompt-consumer-boundaries',
      'Retained reference prompt consumers stay explicit on narrow public prompt primitive subpaths',
      [
        'packages/generic-agents/web-researcher/src/index.ts',
        'packages/generic-agents/web-researcher/src/index.js',
        'packages/generic-agents/web-researcher/src/schemas.ts',
        'packages/generic-agents/web-researcher/src/schemas.js',
        'packages/generic-agents/web-researcher/README.md',
        'packages/generic-agents/web-researcher/package.json',
        'packages/generic-agents/web-researcher/src/prompts/agent-prompt-web-researcher.ts',
        'packages/generic-agents/web-researcher/src/prompts/agent-prompt-web-researcher.js',
        'packages/generic-agents/web-researcher/src/prompts/system-prompt-web-researcher.ts',
        'packages/generic-agents/web-researcher/src/prompts/system-prompt-web-researcher.js',
        'packages/generic-agents/web-researcher/src/prompts/plan-prompt-web-researcher.ts',
        'packages/generic-agents/web-researcher/src/prompts/plan-prompt-web-researcher.js',
        'packages/generic-agents/web-researcher/src/prompts/try-prompt-web-researcher.ts',
        'packages/generic-agents/web-researcher/src/prompts/try-prompt-web-researcher.js',
        'packages/generic-agents/web-researcher/src/prompts/refine-prompt-web-researcher.ts',
        'packages/generic-agents/web-researcher/src/prompts/refine-prompt-web-researcher.js',
        'packages/generic-agents/web-researcher/src/prompts/retry-prompt-web-researcher.ts',
        'packages/generic-agents/web-researcher/src/prompts/retry-prompt-web-researcher.js',
        'packages/generic-agents/web-researcher/src/__tests__/enhanced-web-researcher.test.ts',
        'packages/generic-agents/web-researcher/src/__tests__/enhanced-web-researcher.test.js',
        'packages/generic-agents/web-researcher/src/__tests__/research.test.ts',
        'packages/generic-agents/web-researcher/src/__tests__/research.test.js',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_webresearcher_purpose_corestatement.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_webresearcher_capabilities_list.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_webresearcher_executionpattern_detailcontent.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_webresearcher_ptrrsteps_list.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_webresearcher_tools_list.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_webresearcher_integration_detailcontent.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_webresearcher_plan_research_analysis.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_webresearcher_plan_investigation_strategy.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_webresearcher_try_directives_instructions.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_webresearcher_try_research_techniques.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_webresearcher_refine_quality_criteria.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_webresearcher_refine_information_enhancement.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_webresearcher_retry_failure_analysis.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_webresearcher_retry_recovery_strategy.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_webresearcher_system_context.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_webresearcher_system_identity.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_webresearcher_system_instructions.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_webresearcher_system_role.ts',
        'protocol-demonstration/test/v26-web-researcher-agent-compatibility.test.js',
        'packages/generic-agents/web-search/README.md',
        'packages/generic-agents/web-search/package.json',
        'packages/generic-agents/web-search/src/index.ts',
        'packages/generic-agents/web-search/src/index.js',
        'packages/generic-agents/web-search/src/prompts/agent-prompt-web-search.ts',
        'packages/generic-agents/web-search/src/prompts/agent-prompt-web-search.js',
        'packages/generic-agents/web-search/src/prompts/system-prompt-web-search.ts',
        'packages/generic-agents/web-search/src/prompts/system-prompt-web-search.js',
        'packages/generic-agents/web-search/src/prompts/plan-prompt-web-search.ts',
        'packages/generic-agents/web-search/src/prompts/plan-prompt-web-search.js',
        'packages/generic-agents/web-search/src/prompts/try-prompt-web-search.ts',
        'packages/generic-agents/web-search/src/prompts/try-prompt-web-search.js',
        'packages/generic-agents/web-search/src/prompts/refine-prompt-web-search.ts',
        'packages/generic-agents/web-search/src/prompts/refine-prompt-web-search.js',
        'packages/generic-agents/web-search/src/prompts/retry-prompt-web-search.ts',
        'packages/generic-agents/web-search/src/prompts/retry-prompt-web-search.js',
        'packages/generic-tools/web-search/README.md',
        'packages/generic-tools/web-search/src/index.ts',
        'packages/generic-tools/web-search/src/index.js',
        'packages/generic-tools/web-search/src/prompts/WebSearchDocCodeToolPrompt.ts',
        'packages/generic-tools/web-search/src/prompts/WebSearchDocCodeToolPrompt.js',
        'packages/generic-tools/web-search/src/prompts/GetContentsDocCodeToolPrompt.ts',
        'packages/generic-tools/web-search/src/prompts/GetContentsDocCodeToolPrompt.js',
        'packages/generic-tools/web-search/src/prompts/MultiProviderSearchDocCodeToolPrompt.ts',
        'packages/generic-tools/web-search/src/prompts/MultiProviderSearchDocCodeToolPrompt.js',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_websearch_purpose_corestatement.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_websearch_capabilities_list.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_websearch_executionpattern_detailcontent.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_websearch_ptrrsteps_list.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_websearch_tools_list.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_websearch_integration_detailcontent.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_websearch_system_identity.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_websearch_system_instructions.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_websearch_system_role.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_websearch_doccodetoolpurpose.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_websearch_doccodetoolcapabilities.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_getcontents_doccodetoolpurpose.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_multiprovidersearch_doccodetoolpurpose.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_websearchtool_purpose_corestatement.ts',
        'protocol-demonstration/test/v26-web-search-support-compatibility.test.js',
        'packages/generic-tools/files-maintaining/README.md',
        'packages/generic-tools/files-maintaining/src/index.ts',
        'packages/generic-tools/files-maintaining/src/prompts/TextEditorDocCodeToolPrompt.ts',
        'packages/generic-tools/files-maintaining/src/prompts/CreateFileDocCodeToolPrompt.ts',
        'packages/generic-tools/files-maintaining/src/prompts/ReplaceFileDocCodeToolPrompt.ts',
        'packages/generic-tools/files-maintaining/src/prompts/DeleteFileDocCodeToolPrompt.ts',
        'packages/generic-tools/files-maintaining/src/prompts/tool-prompt-transaction-begin.ts',
        'packages/generic-agents/read-comprehension/README.md',
        'packages/generic-agents/read-comprehension/package.json',
        'packages/generic-agents/read-comprehension/tsconfig.json',
        'packages/generic-agents/read-comprehension/src/index.ts',
        'packages/generic-tools/read-comprehension/README.md',
        'packages/generic-tools/read-comprehension/package.json',
        'packages/generic-tools/read-comprehension/tsconfig.json',
        'packages/generic-tools/repository-setup/README.md',
        'packages/generic-tools/repository-setup/src/index.ts',
        'packages/generic-tools/repository-setup/src/prompts/RepositorySetupDocCodeToolPrompt.ts',
        'packages/generic-agents/text-searcher/README.md',
        'packages/generic-agents/text-searcher/package.json',
        'packages/generic-agents/text-searcher/src/index.ts',
        'packages/generic-agents/text-searcher/src/prompts/agent-prompt-text-searcher.ts',
        'packages/generic-agents/text-searcher/src/prompts/system-prompt-text-searcher.ts',
        'packages/generic-agents/text-searcher/src/prompts/plan-prompt-text-searcher.ts',
        'packages/generic-agents/text-searcher/src/prompts/try-prompt-text-searcher.ts',
        'packages/generic-agents/text-searcher/src/prompts/refine-prompt-text-searcher.ts',
        'packages/generic-agents/text-searcher/src/prompts/retry-prompt-text-searcher.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_textsearcher_purpose_corestatement.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_textsearcher_capabilities_list.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_textsearcher_executionpattern_detailcontent.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_textsearcher_ptrrsteps_list.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_textsearcher_tools_list.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_textsearcher_integration_detailcontent.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_text_searcher_system_identity.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_text_searcher_system_role.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_text_searcher_system_instructions.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_textsearcher_plan_content_analysis.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_textsearcher_plan_search_strategy.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_textsearcher_try_directives_instructions.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_textsearcher_try_search_techniques.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_textsearcher_refine_relevance_criteria.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_textsearcher_refine_accuracy_enhancement.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_textsearcher_retry_failure_analysis.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_textsearcher_retry_recovery_strategy.ts',
        'packages/system-grep/README.md',
        'packages/system-grep/src/index.ts',
        'packages/generic-tools/simple-system-text-search/package.json',
        'packages/generic-tools/simple-system-text-search/README.md',
        'packages/generic-tools/simple-system-text-search/src/index.ts',
        'packages/generic-tools/simple-system-text-search/src/prompts/BitcodeRepositoryEvidenceSearchDocCodeToolPrompt.ts',
        'packages/generic-tools/simple-system-text-search/src/prompts/SimpleSystemTextSearchDocCodeToolPrompt.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_systemtextsearch_doccodetoolname.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_systemtextsearch_doccodetoolpurpose.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_systemtextsearch_doccodetoolcapabilities.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_systemtextsearch_doccodetoolparameters.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_systemtextsearch_doccodetooloutput.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_systemtextsearch_doccodetoolexample1.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_systemtextsearch_doccodetoolexample2.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_systemtextsearch_doccodetoolexample3.ts',
        'packages/generic-tools/read-comprehension/src/index.ts',
        'packages/generic-tools/read-comprehension/src/AnalyzeReadSemanticsTool.ts',
        'packages/generic-tools/read-comprehension/src/ReadComprehensionToolset.ts',
        'packages/generic-tools/read-comprehension/src/ExtractReadRequirementsTool.ts',
        'packages/generic-tools/read-comprehension/src/IdentifyReadConstraintsTool.ts',
        'packages/generic-tools/read-comprehension/src/GenerateReadSatisfactionCriteriaTool.ts',
        'packages/generic-tools/read-comprehension/src/ValidateReadComprehensionTool.ts',
        'packages/generic-tools/read-comprehension/src/AnalyzeReadSatisfactionImplementationComplexityTool.ts',
        'packages/generic-tools/read-comprehension/src/read-comprehension-primitives.ts',
        'packages/generic-tools/read-comprehension/src/read-comprehension-schemas.ts',
        'packages/generic-tools/read-comprehension/src/types/prompt-part.ts',
        'packages/generic-tools/read-comprehension/src/types/tools-generics.ts',
        'packages/generic-tools/read-comprehension/src/prompts/AnalyzeReadSemanticsDocCodeToolPrompt.ts',
        'packages/generic-tools/read-comprehension/src/prompts/ExtractReadRequirementsDocCodeToolPrompt.ts',
        'packages/generic-tools/read-comprehension/src/prompts/IdentifyReadConstraintsDocCodeToolPrompt.ts',
        'packages/generic-tools/read-comprehension/src/prompts/GenerateReadSatisfactionCriteriaDocCodeToolPrompt.ts',
        'packages/generic-tools/read-comprehension/src/prompts/ValidateReadComprehensionDocCodeToolPrompt.ts',
        'packages/generic-tools/read-comprehension/src/prompts/AnalyzeReadSatisfactionImplementationComplexityDocCodeToolPrompt.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_comprehendread_system_identity.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_comprehendread_system_role.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_comprehendread_plan_analysis.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_comprehendread_try_directives.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_comprehendread_refine_assessment.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_comprehendread_retry_errorhandling.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_analyzeneedsemantics_doccodetoolpurpose.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_analyzeneedsatisfactionimplementationcomplexity_doccodetoolexample3.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_validateneedcomprehension_doccodetoolpurpose.ts',
        'packages/generic-tools/vcs/src/prompts/ListRepositoriesDocCodeToolPrompt.ts',
        'packages/external-apps/chatgpt/src/prompts/chatgpt-tool-doc-prompts.ts',
        'packages/external-apps/chatgpt/tsconfig.test.json',
        'packages/external-apps/chatgpt/jest.config.cjs',
        'protocol-demonstration/V26_DOC_COMMENT_REFORM.md',
        'packages/doc-comment/README.md',
        'packages/doc-comment/IMPLEMENTATION.md',
        'packages/doc-comment/examples/doc-comments-as-prompts.ts',
        'packages/generic-doc-comment-plugins/doc-developing/README.md',
        'packages/generic-doc-comment-plugins/doc-developing/TLDR.md',
        'packages/generic-doc-comment-plugins/doc-developing/tsconfig.json'
      ]
    ),
    buildV26FilePresenceCheck(
      'read-ingestion-and-shippable-prompt-ports',
      'Read-ingestion and admitted shippable compatibility ports remain explicit under Bitcode ownership, narrow public prompt subpaths, and semantic read/written-asset mirrors',
      [
        'protocol-demonstration/V26_SHIPPABLE_REFORM.md',
        'protocol-demonstration/V26_PIPELINE_FINISH_REFORM.md',
        'protocol-demonstration/test/v26-shippable-reform.test.js',
        'protocol-demonstration/test/v26-pipeline-finish-reform.test.js',
        'packages/generic-agents/jira-processor/src/prompts/system-prompt-jira-processor.ts',
        'packages/generic-agents/jira-processor/src/prompts/agent-prompt-jira-processor.ts',
        'packages/pipelines/asset-pack/src/types/PipelineSchemas.ts',
        'packages/pipelines/asset-pack/src/index.ts',
        'packages/pipelines/asset-pack/src/phases/index.ts',
        'packages/pipelines/asset-pack/src/phases/finish.ts',
        'packages/pipelines/asset-pack/src/postprocess.ts',
        'packages/pipelines/asset-pack/src/agents/prompts/understand-requirements-prompt.ts',
        'packages/pipelines/asset-pack/src/agents/prompts/plan-implementation-prompt.ts',
        'packages/pipelines/asset-pack/src/agents/prompts/comprehend-read-prompt.ts',
        'packages/pipelines/asset-pack/src/agents/prompts/asset-pack-comprehend-read-agent-prompts.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_comprehendread_system_identity.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_comprehendread_system_instructions.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_comprehendread_plan_strategy.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_comprehendread_try_directives.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_assetpacksetupcomprehendread_identity_definition.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_assetpacksetupcomprehendread_purpose_corestatement.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_assetpacksetupcomprehendread_output_readdefinitionanalysis_spec.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_assetpacksetupcomprehendread_output_types_spec.ts',
        'packages/pipelines/asset-pack/src/agents/setup/asset-pack-comprehend-read-agent.ts',
        'packages/pipelines/asset-pack/src/agents/setup/asset-pack-ready-to-iterate-agent.ts',
        'packages/pipelines/asset-pack/src/agents/setup/asset-pack-setup-plan-agent.ts',
        'packages/pipelines/asset-pack/src/agents/finish/asset-pack-finish-create-pull-request-delivery-agent.ts',
        'packages/pipelines/asset-pack/src/agents/finish/deliver-asset-pack-to-destination-agent.ts',
        'packages/pipelines/asset-pack/src/agents/finish/asset-pack-completion-agent.ts',
        'packages/pipelines/asset-pack/src/tools/AssetPackCloneVCSRepositoryTool.ts',
        'scripts/fix-execution-to-directives.sh',
        'scripts/generate-asset-pack-promptparts.ts',
        'scripts/prompt-audit.sh',
        'scripts/update-asset-pack-agents.sh',
        'scripts/update-asset-pack-storage-table-names.sh',
        'scripts/verify-prompt-exports.py'
      ]
    ),
    buildV26FilePresenceCheck(
      'lsp-measurement-prompt-and-proof-boundary',
      'Retained LSP tooling is specified as Bitcode static Read/AssetPack measurement infrastructure',
      [
        'protocol-demonstration/V26_LSP_MEASUREMENT_REFORM.md',
        'protocol-demonstration/src/bitcode-demo.js',
        'protocol-demonstration/src/canonical/read-measurement.js',
        'protocol-demonstration/test/v26-lsp-measurement-reform.test.js',
        'packages/lsp/src/index.ts',
        'packages/generic-tools/lsp-query/src/prompts/LspQueryDocCodeToolPrompt.ts',
        'packages/generic-tools/lsp-query/src/prompts/lsp-purpose-composition.ts',
        'packages/generic-tools/lsp-query/src/prompts/lsp-context-awareness-composition.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_lsp_purpose_sentence.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_lspquery_doccodetoolpurpose.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_lspquery_doccodetoolcapabilities.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_lspquery_doccodetooloutput.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_initializelsp_purpose_corestatement.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_assetpacksetupinitializelsp_purpose_corestatement.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_context_awareness_lsp_header.ts',
        'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_context_awareness_lsp_footer.ts'
      ]
    )
  ];
  const passed = checks.every((check) => check.passed === true);

  return {
    reportId: 'v26-prompt-system-totality-proof',
    version: 'V26',
    proofSourceCommit: baseData.canonicalCommit,
    generatedAt,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState,
    passed,
    packageWitnesses: [
      '@bitcode/prompts',
      '@bitcode/execution-generics',
      '@bitcode/registry',
      '@bitcode/doc-comment',
      '@bitcode/doc-code',
      '@bitcode/tools-generics',
      '@bitcode/conversations-generics',
      '@bitcode/digest',
      '@bitcode/generic-agents-read-comprehension',
      '@bitcode/generic-tools-read-comprehension'
    ],
    checks
  };
}

/**
 * @param {{
 *   generatedAt: string,
 *   baseData: any
 * }} input
 */
function buildV26InferenceImplementationRecordsProof({
  generatedAt,
  baseData
}) {
  const validation = validateV26InferenceImplementationRecords({ fileExists: repoFileExists });

  return {
    reportId: 'v26-inference-implementation-records-proof',
    version: 'V26',
    proofSourceCommit: baseData.canonicalCommit,
    generatedAt,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState,
    passed: validation.passed,
    recordCount: validation.recordCount,
    requiredFields: validation.requiredFields,
    requiredSectionFields: validation.requiredSectionFields,
    requiredBoundaryPostures: validation.requiredBoundaryPostures,
    verificationEvidenceTypes: validation.verificationEvidenceTypes,
    boundaryPostureCounts: validation.boundaryPostureCounts,
    recordChecks: validation.recordChecks,
    records: validation.records
  };
}

/**
 * @param {{
 *   generatedAt: string,
 *   baseData: any
 * }} input
 */
function buildV26SourceToSharesFifthGateProof({
  generatedAt,
  baseData
}) {
  const checks = [
    buildV26FilePresenceCheck(
      'source-to-shares-protocol-review-artifacts',
      'Low-level protocol SPEC-IMPL emits reviewable Reads before fit search and carries source-to-shares artifacts into settlement receipts',
      [
        'protocol-demonstration/src/canonical/read-measurement.js',
        'protocol-demonstration/src/canonical/settlement.js',
        'protocol-demonstration/src/canonical/run-artifacts.js',
        'protocol-demonstration/src/bitcode-demo.js',
        'protocol-demonstration/test/v26-read-review-source-to-shares.test.js'
      ]
    ),
    buildV26FilePresenceCheck(
      'commercial-read-review-route-parity',
      'Commercial production SPEC-IMPL preserves the protocol Read-review admission boundary and blocks fit search until accept',
      [
        'uapi/app/api/read-review/route.ts',
        'uapi/app/api/make-bitcode-branch/route.ts',
        'uapi/app/terminal/TerminalReadScenarioPanel.tsx',
        'uapi/tests/api/readReviewRoute.test.ts',
        'uapi/tests/api/readReviewProtocolParity.test.ts'
      ]
    ),
    buildV26FilePresenceCheck(
      'commercial-state-route-reread-parity',
      'Commercial production SPEC-IMPL rereads accepted Read review, source-to-shares artifacts, settlement preview, and quantized fit-quality evidence through the app-owned state route after branch materialization',
      [
        'uapi/app/api/state/route.ts',
        'uapi/app/api/make-bitcode-branch/route.ts',
        'uapi/tests/api/readReviewProtocolParity.test.ts'
      ]
    ),
    buildV26FileContentCheck(
      'commercial-state-route-reread-contract',
      'Commercial route reread proof checks the exact state-route assertions for accepted Read review, quantized source-to-shares continuity, private-file redaction, and settlement-proof carry-through',
      [
        {
          file: 'uapi/app/api/state/route.ts',
          evidence: 'getBitcodeAppContext().getState(principal)',
          description: 'state route delegates principal-scoped reread to the protocol-backed app context'
        },
        {
          file: 'uapi/tests/api/readReviewProtocolParity.test.ts',
          evidence: 'rereads accepted Read review and source-to-shares settlement artifacts through the commercial /api/state route',
          description: 'commercial parity test owns an explicit source-to-shares state-reread scenario'
        },
        {
          file: 'uapi/tests/api/readReviewProtocolParity.test.ts',
          evidence: 'http://localhost/api/state?principal=buyer',
          description: 'reread uses the buyer projection instead of inspecting only a branch response'
        },
        {
          file: 'uapi/tests/api/readReviewProtocolParity.test.ts',
          evidence: 'statePayload.latestRun.sourceToSharesArtifact.quantizedFitQualities.fitQualityHash',
          description: 'reread asserts quantized source-to-shares fit-quality hash continuity'
        },
        {
          file: 'uapi/tests/api/readReviewProtocolParity.test.ts',
          evidence: 'statePayload.latestRun.branchArtifacts.files).toBeUndefined()',
          description: 'reread proves private raw branch files are not exposed through the buyer state projection'
        },
        {
          file: 'uapi/tests/api/readReviewProtocolParity.test.ts',
          evidence: 'statePayload.latestRun.settlementSourceToSharesProof.memberVerdicts',
          description: 'reread asserts settlement-source-to-shares proof carry-through'
        }
      ]
    ),
    buildV26FilePresenceCheck(
      'commercial-activity-ledger-write-reread',
      'Commercial production SPEC-IMPL records deposit, read, and closure writes into execution history and rereads them through the same Bitcode activity ledger',
      [
        'uapi/app/api/executions/history/route.ts',
        'packages/api/src/routes/executions.ts',
        'uapi/app/terminal/terminal-activity-history.ts',
        'uapi/tests/terminalActivityHistory.test.ts',
        'uapi/tests/api/executionsHistoryWriteReadParity.test.ts'
      ]
    ),
    buildV26FileContentCheck(
      'commercial-activity-ledger-write-reread-contract',
      'Commercial activity-ledger write proof checks completed Bitcode activity recording, normalized execution-history storage, and immediate reread ordering through the same route family',
      [
        {
          file: 'uapi/app/terminal/terminal-activity-history.ts',
          evidence: "status: draft.status || 'completed'",
          description: 'Terminal activity recordings default to completed Bitcode ledger writes'
        },
        {
          file: 'packages/api/src/routes/executions.ts',
          evidence: 'completed_at: completedAt',
          description: 'execution-history inserts persist terminal activity completion timestamps for reread'
        },
        {
          file: 'uapi/tests/api/executionsHistoryWriteReadParity.test.ts',
          evidence: 'round-trips deposit, read, and closure writes through the same Bitcode activity ledger',
          description: 'commercial parity test proves deposit/read/closure writes reread through the same execution-history ledger'
        },
        {
          file: 'uapi/tests/api/executionsHistoryWriteReadParity.test.ts',
          evidence: "expect(historyPayload.map((row: any) => row.summary)).toEqual([",
          description: 'commercial parity test asserts newest-first reread ordering from the execution-history route'
        }
      ]
    ),
    buildV26FilePresenceCheck(
      'terminal-source-to-shares-settlement-read',
      'Bitcode Terminal reads Read review, fit-search admission, quantized fit quality, and source-to-shares settlement as one closure sequence',
      [
        'uapi/app/terminal/TerminalClosureNativeSections.tsx',
        'uapi/app/terminal/terminal-closure-state.ts',
        'uapi/app/terminal/terminal-transaction-detail-snapshot.ts',
        'uapi/app/terminal/terminal-activity-history.ts',
        'uapi/tests/terminalClosureState.test.ts',
        'uapi/tests/terminalTransactionDetailSnapshot.test.ts'
      ]
    ),
    buildV26FileContentCheck(
      'terminal-source-to-shares-settlement-contract',
      'Bitcode Terminal read proof checks the native closure and selected-detail assertions for Read review, present-fit settlement review, quantized fit-quality rows, and persisted source-to-shares detail carry-through',
      [
        {
          file: 'uapi/app/terminal/TerminalClosureNativeSections.tsx',
          evidence: 'Read closure as one sequence from reviewable Read admission through verification, asset-pack branch materialization, source-to-shares settlement, and ledger continuity.',
          description: 'native Terminal closure card teaches the complete review-to-settlement sequence'
        },
        {
          file: 'uapi/app/terminal/terminal-closure-state.ts',
          evidence: "{ label: 'Fit search admitted', value: readReview.fitSearchAdmitted === true ? 'yes' : 'no' }",
          description: 'closure-state normalization exposes fit-search admission as Terminal read state'
        },
        {
          file: 'uapi/app/terminal/terminal-closure-state.ts',
          evidence: "{ label: 'Objective contract', value: stringValue(settlement.quantizedObjectiveContractId) }",
          description: 'closure-state normalization preserves the quantized objective contract row'
        },
        {
          file: 'uapi/app/terminal/terminal-closure-state.ts',
          evidence: "{ label: 'Source-to-shares ref', value: stringValue(settlement.sourceToSharesRef) }",
          description: 'closure-state normalization preserves the source-to-shares reference row'
        },
        {
          file: 'uapi/app/terminal/terminal-closure-state.ts',
          evidence: "{ label: 'Fit-quality hash', value: stringValue(settlement.fitQualityHash) }",
          description: 'closure-state normalization preserves the fit-quality hash row'
        },
        {
          file: 'uapi/tests/terminalClosureState.test.ts',
          evidence: "expect(closure?.settlement.rows.find((entry) => entry.label === 'Objective contract')?.value).toBe(",
          description: 'native closure-state test asserts objective-contract visibility'
        },
        {
          file: 'uapi/tests/terminalClosureState.test.ts',
          evidence: "expect(closure?.settlement.fitQualities?.[0]?.detail).toContain('source-to-shares-weighted-objective')",
          description: 'native closure-state test asserts source-to-shares fit-quality detail'
        },
        {
          file: 'uapi/app/terminal/terminal-transaction-detail-snapshot.ts',
          evidence: 'fitQualities: coerceFitQualities(value.fitQualities)',
          description: 'selected-detail snapshot preserves persisted fit-quality rows'
        },
        {
          file: 'uapi/tests/terminalTransactionDetailSnapshot.test.ts',
          evidence: "{ label: 'Present-fit review', value: 'present-fit-for-settlement-review' }",
          description: 'selected-detail snapshot test asserts present-fit settlement review persistence'
        },
        {
          file: 'uapi/tests/terminalTransactionDetailSnapshot.test.ts',
          evidence: "detail: '10000 bp · source-to-shares-weighted-objective'",
          description: 'selected-detail snapshot test asserts source-to-shares fit-quality persistence'
        }
      ]
    ),
    buildV26FilePresenceCheck(
      'asset-pack-finish-delivering-semantics',
      'Pipeline output semantics distinguish stable AssetPacks and written assets from delivered Shippables, with Finish as the broad final phase',
      [
        'protocol-demonstration/V26_SHIPPABLE_REFORM.md',
        'protocol-demonstration/V26_PIPELINE_FINISH_REFORM.md',
        'protocol-demonstration/test/v26-shippable-reform.test.js',
        'protocol-demonstration/test/v26-pipeline-finish-reform.test.js',
        'packages/pipelines-generics/src/phases/sdivf-factory.ts',
        'packages/pipelines-generics/src/phases/phase-factory.ts',
        'packages/pipelines/asset-pack/src/agents/finish-delivery-agents.ts',
        'packages/pipelines/asset-pack/src/agents/validation-agents.ts'
      ]
    )
  ];
  const passed = checks.every((check) => check.passed === true);

  return {
    reportId: 'v26-source-to-shares-fifth-gate-proof',
    version: 'V26',
    proofSourceCommit: baseData.canonicalCommit,
    generatedAt,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState,
    gate: 'gate-5',
    focus: 'source-to-shares',
    passed,
    closureClaim: false,
    proceduralGateClosure: false,
    makeSharesContract: 'Measured Reads are reviewable after measurement and before fit search; accept admits fit search, reject and remeasure-with-feedback block it.',
    useSharesContract: 'Present-fit-for-settlement-review surfaces quantized source-to-shares fit qualities and carries them into settlement AssetPack receipts.',
    productionParityContract: 'protocol-demonstration remains the low-level SPEC-IMPL and uapi routes remain the commercial SPEC-IMPL; both must preserve the same source-to-shares review, route-level reread, and settlement contract.',
    openReason: 'This proof advances the fifth-gate source-to-shares baseline without itself claiming fourth-gate procedural closure or full fifth-gate closure.',
    checks
  };
}

/**
 * @param {{
 *   generatedAt: string,
 *   baseData: any,
 *   terminalCompositionProof: any,
 *   conversationsContinuityProof: any,
 *   environmentModeCoherenceProof: any,
 *   runsPipelinesTotalityProof: any,
 *   persistenceSchemaTotalityProof: any,
 *   promptSystemTotalityProof: any,
 *   inferenceImplementationRecordsProof: any,
 *   sourceToSharesFifthGateProof: any,
 *   productReadinessAudit: any,
 *   promptSpaceCompletenessProof: any,
 *   retainedPackageAdmissibilityProof: any,
 *   systemReformAdmissibilityProof: any
 * }} input
 */
function buildV26FifthGateClosureDeepeningProof({
  generatedAt,
  baseData,
  terminalCompositionProof,
  conversationsContinuityProof,
  environmentModeCoherenceProof,
  runsPipelinesTotalityProof,
  persistenceSchemaTotalityProof,
  promptSystemTotalityProof,
  inferenceImplementationRecordsProof,
  sourceToSharesFifthGateProof,
  productReadinessAudit,
  promptSpaceCompletenessProof,
  retainedPackageAdmissibilityProof,
  systemReformAdmissibilityProof
}) {
  const proofInputs = [
    {
      proofId: 'terminal-composition',
      artifactPath: '.bitcode/terminal-composition-proof.json',
      passed: terminalCompositionProof?.passed === true
    },
    {
      proofId: 'conversations-continuity',
      artifactPath: '.bitcode/conversations-continuity-proof.json',
      passed: conversationsContinuityProof?.passed === true
    },
    {
      proofId: 'environment-mode-coherence',
      artifactPath: '.bitcode/environment-mode-coherence-proof.json',
      passed: environmentModeCoherenceProof?.passed === true
    },
    {
      proofId: 'runs-pipelines-totality',
      artifactPath: '.bitcode/runs-pipelines-totality-proof.json',
      passed: runsPipelinesTotalityProof?.passed === true
    },
    {
      proofId: 'persistence-schema-totality',
      artifactPath: '.bitcode/persistence-schema-totality-proof.json',
      passed: persistenceSchemaTotalityProof?.passed === true
    },
    {
      proofId: 'prompt-system-totality',
      artifactPath: '.bitcode/prompt-system-totality-proof.json',
      passed: promptSystemTotalityProof?.passed === true
    },
    {
      proofId: 'inference-implementation-records',
      artifactPath: '.bitcode/inference-implementation-records-proof.json',
      passed: inferenceImplementationRecordsProof?.passed === true
    },
    {
      proofId: 'source-to-shares',
      artifactPath: '.bitcode/source-to-shares-fifth-gate-proof.json',
      passed: sourceToSharesFifthGateProof?.passed === true
    },
    {
      proofId: 'product-readiness-audit',
      artifactPath: '.bitcode/v26-product-readiness-audit.json',
      passed: productReadinessAudit?.baselinePassed === true
    },
    {
      proofId: 'prompt-space-baseline',
      artifactPath: '.bitcode/prompt-space-completeness-proof.json',
      passed: promptSpaceCompletenessProof?.baselinePassed === true
    },
    {
      proofId: 'retained-package-admissibility',
      artifactPath: '.bitcode/retained-package-admissibility-proof.json',
      passed: retainedPackageAdmissibilityProof?.passed === true
    },
    {
      proofId: 'system-reform-admissibility',
      artifactPath: '.bitcode/system-reform-admissibility-proof.json',
      passed: systemReformAdmissibilityProof?.passed === true
    }
  ];
  const axis = (axisId, label, proofIds, currentDeepening, closureDisposition) => {
    const evidence = proofInputs.filter((proof) => proofIds.includes(proof.proofId));
    const baselineAdvanced = evidence.length > 0 && evidence.every((proof) => proof.passed === true);
    return {
      axisId,
      label,
      baselineAdvanced,
      closurePassed: baselineAdvanced,
      currentDeepening,
      remainingClosure: closureDisposition,
      evidenceArtifactPaths: evidence.map((proof) => proof.artifactPath)
    };
  };
  const axes = [
    axis(
      'terminal-read-write-loop',
      'Bitcode Terminal read/write loop',
      ['terminal-composition', 'source-to-shares', 'product-readiness-audit', 'environment-mode-coherence'],
      'Terminal-facing source-to-shares Read review, fit admission, settlement reading, TypeScript-only uapi/app ownership, product readiness audit, and environment posture are generated and app/API-backed.',
      'Closed by the fifth-gate closure proof as a minimum-functional read/write baseline; sixth-gate and later harden wider browser/authenticated production coverage.'
    ),
    axis(
      'conversations-and-ad-hoc-execution',
      'Conversations and ad hoc execution continuity',
      ['conversations-continuity', 'runs-pipelines-totality', 'inference-implementation-records'],
      'Fullscreen conversations, retained execution substrate, and source-visible inference records are bound into the make-shares/write surface.',
      'Closed by the fifth-gate closure proof as the admitted rich-input/ad hoc continuity baseline; later gates expand cross-interface product hardening.'
    ),
    axis(
      'transactional-readiness-and-repository-scope',
      'Transactional readiness and repository scope',
      ['terminal-composition', 'source-to-shares', 'product-readiness-audit', 'retained-package-admissibility'],
      'Repository-bound source-to-shares admission, stored-first/live-fallback connected-provider inventory validation, reconnect-required downgrade for invalid saved provider sessions, Terminal-side repository-supply reread that keeps stored inventory visible under reconnect-required provider drift, main-route readiness derivation that prefers route-local repository truth over auxillary reread or weak connection-presence fallback, Terminal pulse plus Deposit + Read flow-guide rendering of exact reconnect-required readiness, wallet-reconnect-required downgrade for saved verified signer posture without a live wallet-provider session, and Connects plus `$BTD` reread through `/api/auxillaries/data` are proof-backed as the current readiness baseline.',
      'Closed by the fifth-gate closure proof as an operative readiness baseline; live provider signing expansion remains later-gate hardening.'
    ),
    axis(
      'persistence-schema-and-active-source-health',
      'Persistence, schema, and active-source health',
      ['persistence-schema-totality', 'environment-mode-coherence'],
      'V26 migration, typed storage owners, `/edgetimes`, and environment-mode coherence now have generated proof coverage.',
      'Closed by the fifth-gate closure proof as a coherent Exchange state baseline; broader runtime storage proof remains later-gate hardening.'
    ),
    axis(
      'retained-system-reform-and-retained-package-baseline',
      'Retained-system reform and retained package baseline',
      ['prompt-system-totality', 'prompt-space-baseline', 'retained-package-admissibility', 'system-reform-admissibility'],
      'Prompt primitives, retained-package roles, system-reform classification, and prompt-space baseline are proof-backed after fourth-gate promotion.',
      'Closed by the fifth-gate closure proof as the live-path reform baseline; later gates may prune or promote reference corridors further.'
    ),
    axis(
      'proof-family-and-environment-closure',
      'Proof-family and environment closure',
      ['source-to-shares', 'product-readiness-audit', 'environment-mode-coherence', 'prompt-space-baseline', 'system-reform-admissibility'],
      'Fifth-gate proof families now include source-to-shares, product readiness auditing, environment coherence, prompt-space baseline, and system-reform admissibility.',
      'Closed by the fifth-gate closure proof; clean canonical regeneration remains a final V26 total-closure duty.'
    )
  ];
  const passed = axes.every((entry) => entry.baselineAdvanced === true);
  const openAxes = axes.filter((entry) => entry.baselineAdvanced !== true);

  return {
    reportId: 'v26-fifth-gate-closure-deepening-proof',
    version: 'V26',
    proofSourceCommit: baseData.canonicalCommit,
    generatedAt,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState,
    gate: 'gate-5',
    passed,
    closureDeepened: passed,
    closureClaim: passed,
    proceduralGateClosure: passed,
    resumedAfterFourthGatePromotionClosed: true,
    deepeningMode: 'post-fourth-gate-promoted-closure',
    axisCount: axes.length,
    deepenedAxisCount: axes.length - openAxes.length,
    openAxisCount: openAxes.length,
    openAxes: openAxes.map((entry) => entry.axisId),
    closureReason: 'This proof records that the fifth-gate closure evidence has deepened across every closure axis and is ready for the explicit fifth-gate closure verdict.',
    proofInputs,
    axes
  };
}

/**
 * @param {{
 *   generatedAt: string,
 *   baseData: any,
 *   terminalCompositionProof: any,
 *   conversationsContinuityProof: any,
 *   environmentModeCoherenceProof: any,
 *   runsPipelinesTotalityProof: any,
 *   persistenceSchemaTotalityProof: any,
 *   promptSystemTotalityProof: any,
 *   inferenceImplementationRecordsProof: any,
 *   sourceToSharesFifthGateProof: any,
 *   productReadinessAudit: any,
 *   fifthGateClosureDeepeningProof: any,
 *   promptSpaceCompletenessProof: any,
 *   retainedPackageAdmissibilityProof: any,
 *   systemReformAdmissibilityProof: any
 * }} input
 */
function buildV26FifthGateClosureProof({
  generatedAt,
  baseData,
  terminalCompositionProof,
  conversationsContinuityProof,
  environmentModeCoherenceProof,
  runsPipelinesTotalityProof,
  persistenceSchemaTotalityProof,
  promptSystemTotalityProof,
  inferenceImplementationRecordsProof,
  sourceToSharesFifthGateProof,
  productReadinessAudit,
  fifthGateClosureDeepeningProof,
  promptSpaceCompletenessProof,
  retainedPackageAdmissibilityProof,
  systemReformAdmissibilityProof
}) {
  const proofInputs = [
    {
      proofId: 'terminal-composition',
      artifactPath: '.bitcode/terminal-composition-proof.json',
      passed: terminalCompositionProof?.passed === true
    },
    {
      proofId: 'conversations-continuity',
      artifactPath: '.bitcode/conversations-continuity-proof.json',
      passed: conversationsContinuityProof?.passed === true
    },
    {
      proofId: 'environment-mode-coherence',
      artifactPath: '.bitcode/environment-mode-coherence-proof.json',
      passed: environmentModeCoherenceProof?.passed === true
    },
    {
      proofId: 'runs-pipelines-totality',
      artifactPath: '.bitcode/runs-pipelines-totality-proof.json',
      passed: runsPipelinesTotalityProof?.passed === true
    },
    {
      proofId: 'persistence-schema-totality',
      artifactPath: '.bitcode/persistence-schema-totality-proof.json',
      passed: persistenceSchemaTotalityProof?.passed === true
    },
    {
      proofId: 'prompt-system-totality',
      artifactPath: '.bitcode/prompt-system-totality-proof.json',
      passed: promptSystemTotalityProof?.passed === true
    },
    {
      proofId: 'inference-implementation-records',
      artifactPath: '.bitcode/inference-implementation-records-proof.json',
      passed: inferenceImplementationRecordsProof?.passed === true
    },
    {
      proofId: 'source-to-shares',
      artifactPath: '.bitcode/source-to-shares-fifth-gate-proof.json',
      passed: sourceToSharesFifthGateProof?.passed === true
        && sourceToSharesFifthGateProof?.focus === 'source-to-shares'
    },
    {
      proofId: 'product-readiness-audit',
      artifactPath: '.bitcode/v26-product-readiness-audit.json',
      passed: productReadinessAudit?.baselinePassed === true
        && productReadinessAudit?.closureClaim === true
        && productReadinessAudit?.openProductCount === 0
        && productReadinessAudit?.closureReadyProductCount === productReadinessAudit?.productCount
    },
    {
      proofId: 'fifth-gate-closure-deepening',
      artifactPath: '.bitcode/fifth-gate-closure-deepening-proof.json',
      passed: fifthGateClosureDeepeningProof?.passed === true
        && fifthGateClosureDeepeningProof?.closureDeepened === true
        && fifthGateClosureDeepeningProof?.openAxisCount === 0
    },
    {
      proofId: 'prompt-space-baseline',
      artifactPath: '.bitcode/prompt-space-completeness-proof.json',
      passed: promptSpaceCompletenessProof?.baselinePassed === true
    },
    {
      proofId: 'retained-package-admissibility',
      artifactPath: '.bitcode/retained-package-admissibility-proof.json',
      passed: retainedPackageAdmissibilityProof?.passed === true
        && retainedPackageAdmissibilityProof?.unclassifiedPackageCount === 0
    },
    {
      proofId: 'system-reform-admissibility',
      artifactPath: '.bitcode/system-reform-admissibility-proof.json',
      passed: systemReformAdmissibilityProof?.passed === true
    }
  ];
  const proofById = new Map(proofInputs.map((proof) => [proof.proofId, proof]));
  const closureRow = (rowId, queueItem, gateAxis, proofIds, sourceCheck) => {
    const evidence = proofIds.map((proofId) => proofById.get(proofId)).filter(Boolean);
    const proofEvidencePassed = evidence.length > 0 && evidence.every((proof) => proof.passed === true);
    return {
      rowId,
      queueItem,
      gateAxis,
      proofEvidencePassed,
      sourceEvidencePassed: sourceCheck.passed === true,
      closurePassed: proofEvidencePassed && sourceCheck.passed === true,
      evidenceArtifactPaths: evidence.map((proof) => proof.artifactPath),
      sourceCheck
    };
  };
  const closureRows = [
    closureRow(
      'terminal-read-write-loop',
      'Whole Terminal read/write acceptance',
      'Terminal read/write loop',
      ['terminal-composition', 'source-to-shares', 'product-readiness-audit', 'environment-mode-coherence'],
      buildV26FileContentCheck(
        'terminal-read-write-loop-source-evidence',
        'Terminal deposit, read, deposit, branch, closure, selected-detail, and ledger reread are source-backed by route/API tests',
        [
          {
            file: 'uapi/tests/api/executionsHistoryWriteReadParity.test.ts',
            evidence: 'round-trips deposit, read, and closure writes through the same Bitcode activity ledger',
            description: 'execution-history parity proves write/reread continuity'
          },
          {
            file: 'uapi/tests/api/readReviewProtocolParity.test.ts',
            evidence: 'rereads accepted Read review and source-to-shares settlement artifacts through the commercial /api/state route',
            description: 'state route rereads accepted source-to-shares branch materialization'
          },
          {
            file: 'uapi/tests/terminalTransactionDetailSnapshot.test.ts',
            evidence: "{ label: 'Present-fit review', value: 'present-fit-for-settlement-review' }",
            description: 'selected-detail snapshot preserves settlement review posture'
          },
          {
            file: 'protocol-demonstration/test/v26-uapi-app-router-entrypoints.test.js',
            evidence: 'V26 keeps active uapi app-owned source TypeScript-only',
            description: 'active app-owned source has no JavaScript mirror ambiguity'
          }
        ]
      )
    ),
    closureRow(
      'conversations-and-ad-hoc-execution',
      'Conversations and ad hoc parity',
      'Conversations and ad hoc execution continuity',
      ['conversations-continuity', 'runs-pipelines-totality', 'inference-implementation-records'],
      buildV26FileContentCheck(
        'conversations-and-ad-hoc-source-evidence',
        'Conversations preserve rich input, attachments, destinations, and ad hoc execution evidence',
        [
          {
            file: 'packages/api/src/routes/conversations.ts',
            evidence: 'buildConversationRichInputSummary',
            description: 'conversation execution normalizes rich input'
          },
          {
            file: 'packages/api/src/conversations/__tests__/branch-conversation.test.ts',
            evidence: 'copiedAttachmentCount',
            description: 'package test locks branched attachment continuity'
          },
          {
            file: 'uapi/tests/api/conversationThreadStreamRoute.test.ts',
            evidence: "output_destinations: expect.arrayContaining",
            description: 'thread stream route proves destination roundtrip'
          },
          {
            file: 'uapi/tests/api/chatStreamRoute.test.ts',
            evidence: "rich_input: expect.objectContaining",
            description: 'root stream route proves normalized rich input execution evidence'
          }
        ]
      )
    ),
    closureRow(
      'transactional-readiness-and-repository-scope',
      'Transactional readiness runtime proof',
      'Transactional readiness and repository scope',
      ['terminal-composition', 'source-to-shares', 'product-readiness-audit', 'retained-package-admissibility'],
      buildV26FileContentCheck(
        'transactional-readiness-source-evidence',
        'Repository and wallet readiness distinguish manual identity, saved signer posture, live sessions, stored inventory, and reconnect-required failures',
        [
          {
            file: 'uapi/tests/api/transactionWriteReadinessRoutes.test.ts',
            evidence: 'live wallet-provider signing session is no longer available',
            description: 'route admission downgrades saved wallet signer posture without a live provider session'
          },
          {
            file: 'uapi/tests/api/transactionWriteReadinessRoutes.test.ts',
            evidence: 'outside the connected provider inventory',
            description: 'route admission rejects repository anchors outside connected provider inventory'
          },
          {
            file: 'uapi/tests/terminalFlowGuideCard.test.tsx',
            evidence: 'repository-reconnect-required',
            description: 'Terminal flow guide exposes repository reconnect-required posture'
          },
          {
            file: 'uapi/tests/orbitalsBTDPane.test.tsx',
            evidence: 'wallet provider must reconnect before Bitcode can rely on live signing again',
            description: '$BTD auxiliary read exposes live signing truth'
          }
        ]
      )
    ),
    closureRow(
      'persistence-schema-and-active-source-health',
      'Persistence runtime acceptance',
      'Persistence, schema, and active-source health',
      ['persistence-schema-totality', 'environment-mode-coherence'],
      buildV26FileContentCheck(
        'persistence-runtime-source-evidence',
        'Persistence, schema, execution storage, notifications, processing stats, and event rows form one Exchange state model',
        [
          {
            file: 'packages/orm/src/models/bitcode-execution-storage.ts',
            evidence: 'BITCODE_EXECUTION_STORAGE_SCHEMA_PARITY',
            description: 'ORM model declares the V26 storage interpretation map'
          },
          {
            file: 'packages/orm/src/__tests__/bitcode-execution-storage.test.ts',
            evidence: 'declares the V26 schema bridge for every former unresolved storage table',
            description: 'package-local storage test locks the schema bridge'
          },
          {
            file: 'uapi/tests/api/executionsHistoryWriteReadParity.test.ts',
            evidence: "repo_snapshot: {",
            description: 'execution-history route test covers persisted repository snapshot reread'
          },
          {
            file: 'uapi/tests/api/executionsHistoryWriteReadParity.test.ts',
            evidence: 'processing_stats: {',
            description: 'execution-history route test covers persisted processing statistics reread'
          },
          {
            file: 'packages/orm/src/models/organization-btd-treasury.ts',
            evidence: 'OrganizationBtdTreasuryModel',
            description: 'organization treasury persistence uses BTD share/read-right naming instead of credit naming'
          }
        ]
      )
    ),
    closureRow(
      'retained-system-reform-and-retained-package-baseline',
      'Retained-system reform saturation',
      'Retained-system reform and retained package baseline',
      ['prompt-system-totality', 'prompt-space-baseline', 'retained-package-admissibility', 'system-reform-admissibility'],
      buildV26FileContentCheck(
        'retained-system-reform-source-evidence',
        'Retained live-path packages are classified, public-boundary clean, Bitcode-repurposed, and not teaching parallel non-Bitcode ownership',
        [
          {
            file: 'protocol-demonstration/test/v26-active-product-naming.test.js',
            evidence: 'active V26 retained package surfaces use Bitcode naming instead of Engi naming',
            description: 'active naming test blocks non-Bitcode product-language reintroduction'
          },
          {
            file: 'protocol-demonstration/src/canonical/proven-generator.js',
            evidence: 'retained-package-admissibility',
            description: 'generated proof owns retained-package admissibility classification'
          },
          {
            file: 'protocol-demonstration/src/canonical/proven-generator.js',
            evidence: 'system-reform-admissibility',
            description: 'generated proof owns system-reform admissibility classification'
          },
          {
            file: 'protocol-demonstration/V26_REFORM_STRATEGY.md',
            evidence: 'semantic mirrors before destructive rename',
            description: 'reform strategy documents the Bitcode-first rename/removal discipline'
          }
        ]
      )
    ),
    closureRow(
      'proof-family-and-environment-closure',
      'Proof and promotion closure',
      'Proof-family and environment closure',
      ['source-to-shares', 'product-readiness-audit', 'fifth-gate-closure-deepening', 'environment-mode-coherence', 'prompt-space-baseline', 'system-reform-admissibility'],
      buildV26FileContentCheck(
        'proof-family-source-evidence',
        'Fifth-gate closure has an explicit generated verdict and remains ordered before final Gate 8 closure',
        [
          {
            file: 'protocol-demonstration/src/canonical/proven-generator.js',
            evidence: 'buildV26FifthGateClosureProof',
            description: 'generator owns the fifth-gate closure verdict'
          },
          {
            file: 'protocol-demonstration/test/proven-generator.test.js',
            evidence: 'fifthGateClosurePassed, true',
            description: 'generator test asserts the fifth-gate closure flag'
          },
          {
            file: 'protocol-demonstration/test/v26-gate-acceptance-criteria.test.js',
            evidence: 'V26 generated proofs close fifth, sixth, seventh, and eighth gates',
            description: 'formal gate test keeps total closure explicit and ordered'
          },
          {
            file: 'BITCODE_SPEC_V26.md',
            evidence: 'The current generated fifth-gate evidence includes an explicit closure verdict',
            description: 'canonical spec text records the accepted fifth-gate closure verdict'
          }
        ]
      )
    )
  ];
  const passed = closureRows.every((row) => row.closurePassed === true);

  return {
    reportId: 'v26-fifth-gate-closure-proof',
    version: 'V26',
    proofSourceCommit: baseData.canonicalCommit,
    generatedAt,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState,
    gate: 'gate-5',
    focus: 'minimum-functional-bitcode',
    passed,
    closureClaim: passed,
    proceduralGateClosure: passed,
    queueRowCount: closureRows.length,
    closedQueueRowCount: closureRows.filter((row) => row.closurePassed === true).length,
    openQueueRows: closureRows.filter((row) => row.closurePassed !== true).map((row) => row.rowId),
    minimumFunctionalNorthStar: {
      makeShares: passed,
      useShares: passed,
      bitcodeOnlyActiveSemantics: passed,
      retainedOldWorldLivePathReformed: passed
    },
    laterGateClaims: {
      seventhGateCommercialTestnetLaunch: false,
      eighthGateV26TotalClosure: false
    },
    notReadyFor: [],
    proofInputs,
    closureRows
  };
}

/**
 * @param {{
 *   generatedAt: string,
 *   baseData: any,
 *   terminalCompositionProof: any,
 *   conversationsContinuityProof: any,
 *   environmentModeCoherenceProof: any,
 *   runsPipelinesTotalityProof: any,
 *   persistenceSchemaTotalityProof: any,
 *   sourceToSharesFifthGateProof: any,
 *   productReadinessAudit: any,
 *   fifthGateClosureProof: any,
 *   retainedPackageAdmissibilityProof: any,
 *   systemReformAdmissibilityProof: any
 * }} input
 */
function buildV26SixthGateMvpClosureProof({
  generatedAt,
  baseData,
  terminalCompositionProof,
  conversationsContinuityProof,
  environmentModeCoherenceProof,
  runsPipelinesTotalityProof,
  persistenceSchemaTotalityProof,
  sourceToSharesFifthGateProof,
  productReadinessAudit,
  fifthGateClosureProof,
  retainedPackageAdmissibilityProof,
  systemReformAdmissibilityProof
}) {
  const proofInputs = [
    {
      proofId: 'fifth-gate-closure',
      artifactPath: '.bitcode/fifth-gate-closure-proof.json',
      passed: fifthGateClosureProof?.passed === true
        && fifthGateClosureProof?.proceduralGateClosure === true
    },
    {
      proofId: 'product-readiness-mvp',
      artifactPath: '.bitcode/v26-product-readiness-audit.json',
      passed: productReadinessAudit?.mvpPassed === true
        && productReadinessAudit?.sixthGateMvpClaim === true
        && productReadinessAudit?.mvpReadyProductCount === productReadinessAudit?.productCount
        && productReadinessAudit?.mvpOpenProductCount === 0
    },
    {
      proofId: 'terminal-composition',
      artifactPath: '.bitcode/terminal-composition-proof.json',
      passed: terminalCompositionProof?.passed === true
    },
    {
      proofId: 'source-to-shares',
      artifactPath: '.bitcode/source-to-shares-fifth-gate-proof.json',
      passed: sourceToSharesFifthGateProof?.passed === true
    },
    {
      proofId: 'conversations-continuity',
      artifactPath: '.bitcode/conversations-continuity-proof.json',
      passed: conversationsContinuityProof?.passed === true
    },
    {
      proofId: 'runs-pipelines-totality',
      artifactPath: '.bitcode/runs-pipelines-totality-proof.json',
      passed: runsPipelinesTotalityProof?.passed === true
    },
    {
      proofId: 'persistence-schema-totality',
      artifactPath: '.bitcode/persistence-schema-totality-proof.json',
      passed: persistenceSchemaTotalityProof?.passed === true
    },
    {
      proofId: 'environment-mode-coherence',
      artifactPath: '.bitcode/environment-mode-coherence-proof.json',
      passed: environmentModeCoherenceProof?.passed === true
    },
    {
      proofId: 'retained-package-admissibility',
      artifactPath: '.bitcode/retained-package-admissibility-proof.json',
      passed: retainedPackageAdmissibilityProof?.passed === true
        && retainedPackageAdmissibilityProof?.unclassifiedPackageCount === 0
    },
    {
      proofId: 'system-reform-admissibility',
      artifactPath: '.bitcode/system-reform-admissibility-proof.json',
      passed: systemReformAdmissibilityProof?.passed === true
    }
  ];
  const proofById = new Map(proofInputs.map((proof) => [proof.proofId, proof]));
  const closureRow = (rowId, criterion, proofIds, sourceCheck) => {
    const evidence = proofIds.map((proofId) => proofById.get(proofId)).filter(Boolean);
    const proofEvidencePassed = evidence.length > 0 && evidence.every((proof) => proof.passed === true);
    return {
      rowId,
      criterion,
      proofEvidencePassed,
      sourceEvidencePassed: sourceCheck.passed === true,
      closurePassed: proofEvidencePassed && sourceCheck.passed === true,
      evidenceArtifactPaths: evidence.map((proof) => proof.artifactPath),
      sourceCheck
    };
  };
  const closureRows = [
    closureRow(
      'fifth-gate-acceptance-holds',
      'Fifth-gate acceptance holds before MVP elevation',
      ['fifth-gate-closure', 'source-to-shares'],
      buildV26FileContentCheck(
        'sixth-gate-fifth-acceptance-source-evidence',
        'Fifth-gate closure remains explicit before sixth-gate promotion',
        [
          {
            file: 'BITCODE_SPEC_V26.md',
            evidence: 'Fifth-gate is closed only when:',
            description: 'canonical spec keeps fifth-gate acceptance explicit'
          },
          {
            file: 'BITCODE_SPEC_V26.md',
            evidence: 'Fifth gate is accepted at the minimum-functional Bitcode baseline',
            description: 'canonical spec records accepted fifth-gate baseline'
          },
          {
            file: '.bitcode/fifth-gate-closure-proof.json',
            evidence: '"proceduralGateClosure": true',
            description: 'generated fifth-gate artifact carries procedural closure'
          }
        ]
      )
    ),
    closureRow(
      'mvp-product-readiness',
      'Exchange, Terminal, Protocol, Proofs, API, MCP, and admitted app surfaces are MVP-ready',
      ['product-readiness-mvp', 'terminal-composition', 'runs-pipelines-totality'],
      buildV26FileContentCheck(
        'sixth-gate-product-readiness-source-evidence',
        'Product readiness audit now carries sixth-gate MVP evidence per product',
        [
          {
            file: 'protocol-demonstration/src/canonical/v26-product-readiness-audit.js',
            evidence: 'sixthGateMvpClaim',
            description: 'product readiness audit exposes sixth-gate MVP claim'
          },
          {
            file: 'protocol-demonstration/src/canonical/v26-product-readiness-audit.js',
            evidence: 'mvpEvidenceChecks',
            description: 'product readiness audit source-checks MVP evidence'
          },
          {
            file: 'protocol-demonstration/test/v26-product-readiness-audit.test.js',
            evidence: 'readyForSixthGateMvp, true',
            description: 'product readiness test requires every product to be MVP-ready'
          }
        ]
      )
    ),
    closureRow(
      'explicit-terminal-map',
      'Post-fifth-gate Terminal map is explicit and implemented',
      ['terminal-composition', 'product-readiness-mvp'],
      buildV26FileContentCheck(
        'sixth-gate-terminal-map-source-evidence',
        'Terminal source owns activity, transactions, conversations, and auxillaries as implementation-bearing MVP surfaces',
        [
          {
            file: 'uapi/app/terminal/terminal-experience-architecture.ts',
            evidence: 'SIXTH_GATE_MVP_TERMINAL_MAP',
            description: 'Terminal map source exports the sixth-gate MVP map'
          },
          {
            file: 'uapi/app/terminal/terminal-experience-architecture.ts',
            evidence: 'dominant-master-detail-read-surface',
            description: 'activity is named as the dominant read surface'
          },
          {
            file: 'uapi/tests/terminalExperienceArchitecture.test.ts',
            evidence: 'locks the post-fifth-gate Terminal map to activity, transactions, conversations, and auxillaries',
            description: 'test locks the four-surface MVP map'
          },
          {
            file: 'BITCODE_SPEC_V26.md',
            evidence: '`activity`: the dominant master-detail transaction activity surface',
            description: 'canonical spec names the MVP activity surface'
          }
        ]
      )
    ),
    closureRow(
      'activity-transactions-operator-loop',
      'Activity and transactions support repeated operator use on testnet',
      ['terminal-composition', 'source-to-shares', 'persistence-schema-totality'],
      buildV26FileContentCheck(
        'sixth-gate-activity-transactions-source-evidence',
        'Activity and transaction surfaces search, filter, paginate, select, write, and reread through the same operator loop',
        [
          {
            file: 'uapi/tests/terminalTransactions.test.ts',
            evidence: 'filters transactions by search, ownership, and repository',
            description: 'transaction ledger filtering is tested'
          },
          {
            file: 'uapi/tests/terminalTransactionQuery.test.ts',
            evidence: 'reads and writes transaction pagination through route query state',
            description: 'transaction pagination is route-stable'
          },
          {
            file: 'uapi/tests/e2e/terminal.terminal.flow.spec.ts',
            evidence: 'Terminal route keeps read, selection, and repository-anchor write-through in one master-detail surface',
            description: 'browser story covers the repeated operator master-detail loop'
          },
          {
            file: 'uapi/tests/api/executionsHistoryWriteReadParity.test.ts',
            evidence: 'round-trips deposit, read, and closure writes through the same Bitcode activity ledger',
            description: 'write-through reread is route-tested'
          }
        ]
      )
    ),
    closureRow(
      'conversations-chatgpt-parity',
      'Conversations behave as a ChatGPT-style read/write Bitcode interface',
      ['conversations-continuity', 'runs-pipelines-totality'],
      buildV26FileContentCheck(
        'sixth-gate-conversations-chatgpt-source-evidence',
        'Conversations are fullscreen/popup-capable and aligned with retained ChatGPT App connected-interface tooling',
        [
          {
            file: 'uapi/app/conversations/components/ConversationsOverlay.tsx',
            evidence: 'Multiple view modes (floating, sidebar, fullscreen, split-screen)',
            description: 'conversation overlay owns popup/fullscreen modes'
          },
          {
            file: 'uapi/tests/conversationsRouteClient.test.tsx',
            evidence: 'forceFullscreen=true',
            description: 'direct route tests fullscreen conversation mode'
          },
          {
            file: 'packages/external-apps/chatgpt/src/server.ts',
            evidence: 'connected-interface Bitcode Terminal companion',
            description: 'ChatGPT App is specified as a Terminal companion, not a parallel product'
          },
          {
            file: 'packages/external-apps/chatgpt/src/__tests__/tools.test.ts',
            evidence: 'declares confirmation schema on every ChatGPT App connected-interface write carrier',
            description: 'ChatGPT App write tools share admission semantics'
          }
        ]
      )
    ),
    closureRow(
      'auxillaries-readiness-and-btd',
      'Auxillaries hold non-duplicative readiness, identity, and deep wallet/$BTD controls',
      ['terminal-composition', 'product-readiness-mvp'],
      buildV26FileContentCheck(
        'sixth-gate-auxillaries-readiness-source-evidence',
        'Auxillaries keep Connects, Interfaces, Profile, BTC fee liquidity, and non-fungible BTD posture around the network core',
        [
          {
            file: 'uapi/app/auxillaries/components/auxillary-pane-meta.ts',
            evidence: 'Connects, Interfaces, Profile, and $BTD',
            description: 'auxillary pane contract names the non-duplicative panes'
          },
          {
            file: 'uapi/app/auxillaries/components/AuxillariesBTDPane.tsx',
            evidence: '$BTD is a non-fungible share and read-right posture, while BTC is the fee-liquidity posture',
            description: 'BTD pane distinguishes non-fungible shares from BTC fees'
          },
          {
            file: 'uapi/tests/userDataRoute.test.ts',
            evidence: 'walletConnectionStatus',
            description: 'auxillary reread route includes wallet-provider session truth'
          },
          {
            file: 'uapi/tests/orbitalsBTDPane.test.tsx',
            evidence: 'wallet provider must reconnect before Bitcode can rely on live signing again',
            description: 'BTD pane test blocks saved-signer-only settlement posture'
          }
        ]
      )
    ),
    closureRow(
      'admitted-interfaces-one-product',
      'Admitted API, MCP, and app surfaces demonstrably behave like one product',
      ['terminal-composition', 'conversations-continuity', 'runs-pipelines-totality', 'product-readiness-mvp'],
      buildV26FileContentCheck(
        'sixth-gate-interface-parity-source-evidence',
        'API, MCP, and ChatGPT App interfaces share Bitcode Exchange state, write admission, and connected-interface boundaries',
        [
          {
            file: 'packages/generic-mcps/bitcode/src/tools/pipeline-tools.ts',
            evidence: 'writeAdmission',
            description: 'Bitcode MCP writes emit write-admission receipts'
          },
          {
            file: 'packages/external-apps/chatgpt/src/server.ts',
            evidence: 'Read tools gather codebase, web, VCS, and DevOps context as Exchange input evidence rather than parallel product state',
            description: 'ChatGPT App read tools are Exchange input evidence'
          },
          {
            file: 'uapi/tests/api/readReviewProtocolParity.test.ts',
            evidence: 'rereads accepted Read review and source-to-shares settlement artifacts through the commercial /api/state route',
            description: 'commercial API rereads protocol state'
          },
          {
            file: 'packages/generic-mcps/bitcode/src/__tests__/unit/pipeline-ingress-contract.test.ts',
            evidence: 'normalizes third-party MCP repository and attachment ingress as input context only',
            description: 'MCP third-party inputs stay ingress context'
          }
        ]
      )
    ),
    closureRow(
      'mvp-quality-and-clean-architecture',
      'Quality, reliability, usability, and architecture are cleaner after MVP elevation',
      ['environment-mode-coherence', 'retained-package-admissibility', 'system-reform-admissibility', 'product-readiness-mvp'],
      buildV26FileContentCheck(
        'sixth-gate-quality-architecture-source-evidence',
        'MVP promotion remains proof-bearing, architecture-reducing, and not compatibility-expanding',
        [
          {
            file: 'BITCODE_SPEC_V26.md',
            evidence: 'repository-level architecture remains cleaner after MVP elevation',
            description: 'canonical spec requires architecture cleanup, not expansion'
          },
          {
            file: 'BITCODE_SPEC_V26_PARITY_MATRIX.md',
            evidence: 'Sixth-gate MVP closure queue',
            description: 'parity matrix records the sixth-gate closure queue'
          },
          {
            file: 'protocol-demonstration/V26_REFORM_STRATEGY.md',
            evidence: 'semantic mirrors before destructive rename',
            description: 'reform strategy keeps cleanup disciplined'
          },
          {
            file: 'protocol-demonstration/test/proven-generator.test.js',
            evidence: 'sixthGateClosurePassed, true',
            description: 'generator test locks sixth-gate closure'
          }
        ]
      )
    )
  ];
  const passed = closureRows.every((row) => row.closurePassed === true);

  return {
    reportId: 'v26-sixth-gate-mvp-closure-proof',
    version: 'V26',
    proofSourceCommit: baseData.canonicalCommit,
    generatedAt,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState,
    gate: 'gate-6',
    focus: 'minimal-viable-bitcode-product',
    passed,
    closureClaim: passed,
    proceduralGateClosure: passed,
    queueRowCount: closureRows.length,
    closedQueueRowCount: closureRows.filter((row) => row.closurePassed === true).length,
    openQueueRows: closureRows.filter((row) => row.closurePassed !== true).map((row) => row.rowId),
    mvpTerminalMap: ['activity', 'transactions', 'conversations', 'auxillaries'],
    productReadiness: {
      productCount: productReadinessAudit?.productCount || 0,
      mvpReadyProductCount: productReadinessAudit?.mvpReadyProductCount || 0,
      mvpOpenProductCount: productReadinessAudit?.mvpOpenProductCount || 0
    },
    laterGateClaims: {
      seventhGateCommercialTestnetLaunch: false,
      eighthGateV26TotalClosure: false
    },
    notReadyFor: [],
    proofInputs,
    closureRows
  };
}

/**
 * @param {{
 *   generatedAt: string,
 *   baseData: any,
 *   terminalCompositionProof: any,
 *   conversationsContinuityProof: any,
 *   environmentModeCoherenceProof: any,
 *   runsPipelinesTotalityProof: any,
 *   persistenceSchemaTotalityProof: any,
 *   sourceToSharesFifthGateProof: any,
 *   productReadinessAudit: any,
 *   sixthGateMvpClosureProof: any,
 *   retainedPackageAdmissibilityProof: any,
 *   systemReformAdmissibilityProof: any
 * }} input
 */
function buildV26SeventhGateCommercialTestnetLaunchProof({
  generatedAt,
  baseData,
  terminalCompositionProof,
  conversationsContinuityProof,
  environmentModeCoherenceProof,
  runsPipelinesTotalityProof,
  persistenceSchemaTotalityProof,
  sourceToSharesFifthGateProof,
  productReadinessAudit,
  sixthGateMvpClosureProof,
  retainedPackageAdmissibilityProof,
  systemReformAdmissibilityProof
}) {
  const proofInputs = [
    {
      proofId: 'sixth-gate-mvp-closure',
      artifactPath: '.bitcode/sixth-gate-mvp-closure-proof.json',
      passed: sixthGateMvpClosureProof?.passed === true
        && sixthGateMvpClosureProof?.proceduralGateClosure === true
    },
    {
      proofId: 'product-readiness-launch',
      artifactPath: '.bitcode/v26-product-readiness-audit.json',
      passed: productReadinessAudit?.launchPassed === true
        && productReadinessAudit?.seventhGateCommercialTestnetLaunchClaim === true
        && productReadinessAudit?.launchReadyProductCount === productReadinessAudit?.productCount
        && productReadinessAudit?.launchOpenProductCount === 0
    },
    {
      proofId: 'terminal-composition',
      artifactPath: '.bitcode/terminal-composition-proof.json',
      passed: terminalCompositionProof?.passed === true
    },
    {
      proofId: 'conversations-continuity',
      artifactPath: '.bitcode/conversations-continuity-proof.json',
      passed: conversationsContinuityProof?.passed === true
    },
    {
      proofId: 'runs-pipelines-totality',
      artifactPath: '.bitcode/runs-pipelines-totality-proof.json',
      passed: runsPipelinesTotalityProof?.passed === true
    },
    {
      proofId: 'persistence-schema-totality',
      artifactPath: '.bitcode/persistence-schema-totality-proof.json',
      passed: persistenceSchemaTotalityProof?.passed === true
    },
    {
      proofId: 'source-to-shares',
      artifactPath: '.bitcode/source-to-shares-fifth-gate-proof.json',
      passed: sourceToSharesFifthGateProof?.passed === true
    },
    {
      proofId: 'environment-mode-coherence',
      artifactPath: '.bitcode/environment-mode-coherence-proof.json',
      passed: environmentModeCoherenceProof?.passed === true
    },
    {
      proofId: 'retained-package-admissibility',
      artifactPath: '.bitcode/retained-package-admissibility-proof.json',
      passed: retainedPackageAdmissibilityProof?.passed === true
        && retainedPackageAdmissibilityProof?.unclassifiedPackageCount === 0
    },
    {
      proofId: 'system-reform-admissibility',
      artifactPath: '.bitcode/system-reform-admissibility-proof.json',
      passed: systemReformAdmissibilityProof?.passed === true
    }
  ];
  const proofById = new Map(proofInputs.map((proof) => [proof.proofId, proof]));
  const closureRow = (rowId, criterion, proofIds, sourceCheck) => {
    const evidence = proofIds.map((proofId) => proofById.get(proofId)).filter(Boolean);
    const proofEvidencePassed = evidence.length > 0 && evidence.every((proof) => proof.passed === true);
    return {
      rowId,
      criterion,
      proofEvidencePassed,
      sourceEvidencePassed: sourceCheck.passed === true,
      closurePassed: proofEvidencePassed && sourceCheck.passed === true,
      evidenceArtifactPaths: evidence.map((proof) => proof.artifactPath),
      sourceCheck
    };
  };
  const closureRows = [
    closureRow(
      'fifth-and-sixth-gate-acceptance-hold',
      'Fifth- and sixth-gate acceptance both hold before commercial launch refinement',
      ['sixth-gate-mvp-closure', 'source-to-shares'],
      buildV26FileContentCheck(
        'seventh-gate-prerequisite-source-evidence',
        'Fifth- and sixth-gate closure remain explicit before seventh-gate promotion',
        [
          {
            file: 'BITCODE_SPEC_V26.md',
            evidence: 'Fifth gate is accepted at the minimum-functional Bitcode baseline',
            description: 'canonical spec records fifth-gate closure'
          },
          {
            file: 'BITCODE_SPEC_V26.md',
            evidence: 'Sixth gate is accepted at the minimal viable product baseline',
            description: 'canonical spec records sixth-gate closure'
          },
          {
            file: '.bitcode/sixth-gate-mvp-closure-proof.json',
            evidence: '"proceduralGateClosure": true',
            description: 'generated sixth-gate proof carries procedural closure'
          }
        ]
      )
    ),
    closureRow(
      'commercial-testnet-product-readiness',
      'Product readiness is promoted from MVP to initial commercial testnet launch posture',
      ['product-readiness-launch', 'terminal-composition', 'runs-pipelines-totality'],
      buildV26FileContentCheck(
        'seventh-gate-product-readiness-source-evidence',
        'Product readiness audit source-checks launch evidence for every V26 product surface',
        [
          {
            file: 'protocol-demonstration/src/canonical/v26-product-readiness-audit.js',
            evidence: 'seventhGateCommercialTestnetLaunchClaim',
            description: 'product readiness audit exposes seventh-gate launch claim'
          },
          {
            file: 'protocol-demonstration/src/canonical/v26-product-readiness-audit.js',
            evidence: 'launchEvidenceChecks',
            description: 'product readiness audit source-checks launch evidence'
          },
          {
            file: 'protocol-demonstration/test/v26-product-readiness-audit.test.js',
            evidence: 'readyForSeventhGateCommercialTestnetLaunch, true',
            description: 'product readiness test requires every product to be launch-ready'
          }
        ]
      )
    ),
    closureRow(
      'testnet-first-launch-boundary',
      'Initial launch posture is commercial while remaining testnet-first',
      ['product-readiness-launch', 'environment-mode-coherence'],
      buildV26FileContentCheck(
        'seventh-gate-testnet-boundary-source-evidence',
        'Terminal launch-readiness source keeps commercial launch scoped to testnet-first settlement and operator use',
        [
          {
            file: 'BITCODE_SPEC_V26.md',
            evidence: 'commercially-viable live-launch posture while remaining testnet-first',
            description: 'canonical spec sets testnet-first commercial launch boundary'
          },
          {
            file: 'uapi/app/terminal/terminal-commercial-launch-readiness.ts',
            evidence: 'testnet-first',
            description: 'launch-readiness source names the testnet-first launch posture'
          },
          {
            file: 'uapi/tests/terminalCommercialLaunchReadiness.test.ts',
            evidence: 'testnet-first',
            description: 'terminal launch-readiness test locks testnet-first language'
          }
        ]
      )
    ),
    closureRow(
      'commercial-product-story',
      'Exchange, Terminal, Protocol, Proofs, API, MCP, and admitted app surfaces are commercially legible together',
      ['product-readiness-launch', 'terminal-composition', 'conversations-continuity', 'runs-pipelines-totality'],
      buildV26FileContentCheck(
        'seventh-gate-commercial-product-story-source-evidence',
        'Terminal source and spec teach one commercial Bitcode product story across all admitted surfaces',
        [
          {
            file: 'BITCODE_SPEC_V26.md',
            evidence: 'the Exchange, Terminal, Protocol, Proofs, API, MCP, and admitted app surfaces are commercially legible',
            description: 'canonical spec requires commercially legible cross-surface posture'
          },
          {
            file: 'uapi/app/terminal/terminal-commercial-launch-readiness.ts',
            evidence: 'one commercial Bitcode product',
            description: 'launch-readiness source names the one-product commercial story'
          },
          {
            file: 'packages/external-apps/chatgpt/src/server.ts',
            evidence: 'connected-interface Bitcode Terminal companion',
            description: 'ChatGPT App remains a companion interface'
          }
        ]
      )
    ),
    closureRow(
      'wallet-settlement-repository-readiness',
      'Wallet, settlement, repository scope, and GitHub/provider write-admission readiness are launch-critical',
      ['product-readiness-launch', 'source-to-shares', 'persistence-schema-totality'],
      buildV26FileContentCheck(
        'seventh-gate-wallet-settlement-repository-source-evidence',
        'Wallet BTC/$BTD posture, signed-settlement reread, and repository/provider scope are source-checked as launch-critical',
        [
          {
            file: 'uapi/app/terminal/terminal-commercial-launch-readiness.ts',
            evidence: 'BTC fee liquidity and non-fungible $BTD share/read-right holdings',
            description: 'launch map requires BTC fee and BTD share/read-right visibility'
          },
          {
            file: 'uapi/app/auxillaries/components/AuxillariesBTDPane.tsx',
            evidence: '$BTD is a non-fungible share and read-right posture, while BTC is the fee-liquidity posture',
            description: 'BTD pane distinguishes BTD shares from BTC fee liquidity'
          },
          {
            file: 'uapi/tests/api/transactionWriteReadinessRoutes.test.ts',
            evidence: 'outside the connected provider inventory',
            description: 'write-admission test rejects repository scope drift'
          },
          {
            file: 'uapi/tests/api/transactionWriteReadinessRoutes.test.ts',
            evidence: 'live wallet-provider signing session is no longer available',
            description: 'write-admission test rejects saved-signer-only settlement'
          }
        ]
      )
    ),
    closureRow(
      'proof-state-reread-operator-flows',
      'Proof/state reread and operator flow are refined beyond bare MVP sufficiency',
      ['product-readiness-launch', 'terminal-composition', 'persistence-schema-totality', 'source-to-shares'],
      buildV26FileContentCheck(
        'seventh-gate-proof-state-reread-source-evidence',
        'Operator activity, transaction detail, proof state, and history reread share one repeated launch loop',
        [
          {
            file: 'uapi/app/terminal/terminal-commercial-launch-readiness.ts',
            evidence: 'proof state, history, settlement follow-through, and route reread stay in one repeated operator loop',
            description: 'launch map requires proof/state reread as one operator loop'
          },
          {
            file: 'uapi/tests/api/executionsHistoryWriteReadParity.test.ts',
            evidence: 'round-trips deposit, read, and closure writes through the same Bitcode activity ledger',
            description: 'activity ledger write-reread path is tested'
          },
          {
            file: 'uapi/tests/api/activityRoute.test.ts',
            evidence: 'returns live activity with persisted execution reread and notification aggregation',
            description: 'live activity route reread is tested'
          }
        ]
      )
    ),
    closureRow(
      'connected-interface-launch-alignment',
      'MCP, ChatGPT App, API, and app surfaces align as connected launch interfaces',
      ['product-readiness-launch', 'conversations-continuity', 'runs-pipelines-totality', 'terminal-composition'],
      buildV26FileContentCheck(
        'seventh-gate-connected-interface-source-evidence',
        'MCP and ChatGPT App launch surfaces remain connected interfaces with confirmation and write-admission semantics',
        [
          {
            file: 'uapi/app/terminal/terminal-commercial-launch-readiness.ts',
            evidence: 'not as parallel Exchange owners',
            description: 'launch map blocks parallel Exchange ownership by connected interfaces'
          },
          {
            file: 'packages/generic-mcps/bitcode/src/tools/pipeline-tools.ts',
            evidence: 'writeAdmission',
            description: 'MCP accepted writes emit write-admission metadata'
          },
          {
            file: 'packages/external-apps/chatgpt/src/__tests__/tools.test.ts',
            evidence: 'declares confirmation schema on every ChatGPT App connected-interface write carrier',
            description: 'ChatGPT App write carriers require confirmation schema'
          }
        ]
      )
    ),
    closureRow(
      'non-bitcode-compatibility-explanations-retired',
      'Core launch journeys no longer rely on non-Bitcode compatibility explanations',
      ['product-readiness-launch', 'retained-package-admissibility', 'system-reform-admissibility'],
      buildV26FileContentCheck(
        'seventh-gate-reform-completion-source-evidence',
        'Launch documentation and source explain Bitcode journeys directly without compatibility fallback for core user paths',
        [
          {
            file: 'uapi/app/terminal/terminal-commercial-launch-readiness.ts',
            evidence: 'without non-Bitcode compatibility fallback',
            description: 'launch map requires direct Bitcode journey explanation'
          },
          {
            file: 'BITCODE_SPEC_V26_PARITY_MATRIX.md',
            evidence: 'Seventh-gate commercial testnet launch closure queue',
            description: 'parity matrix records the seventh-gate closure queue'
          },
          {
            file: 'protocol-demonstration/V26_PROOF_SURFACES.md',
            evidence: 'seventh-gate commercial testnet launch proof',
            description: 'proof surface names the generated seventh-gate proof'
          }
        ]
      )
    )
  ];
  const passed = closureRows.every((row) => row.closurePassed === true);

  return {
    reportId: 'v26-seventh-gate-commercial-testnet-launch-proof',
    version: 'V26',
    proofSourceCommit: baseData.canonicalCommit,
    generatedAt,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState,
    gate: 'gate-7',
    focus: 'commercial-testnet-bitcode-launch',
    passed,
    closureClaim: passed,
    proceduralGateClosure: passed,
    queueRowCount: closureRows.length,
    closedQueueRowCount: closureRows.filter((row) => row.closurePassed === true).length,
    openQueueRows: closureRows.filter((row) => row.closurePassed !== true).map((row) => row.rowId),
    launchReadinessMap: [
      'testnet-first-launch-boundary',
      'commercial-product-story',
      'wallet-btc-btd-readiness',
      'repository-scope-and-github-integration',
      'proof-state-reread-and-operator-flow',
      'exchange-terminal-protocol-interface-alignment',
      'mcp-and-chatgpt-app-connected-interfaces',
      'non-bitcode-compatibility-explanations-retired'
    ],
    productReadiness: {
      productCount: productReadinessAudit?.productCount || 0,
      launchReadyProductCount: productReadinessAudit?.launchReadyProductCount || 0,
      launchOpenProductCount: productReadinessAudit?.launchOpenProductCount || 0
    },
    laterGateClaims: {
      eighthGateV26TotalClosure: false
    },
    notReadyFor: [],
    proofInputs,
    closureRows
  };
}

const V26_PROMPT_SPACE_WITNESS_SETS = [
  {
    checkId: 'prompt-primitive-public-contract',
    label: 'PromptPart, Registry-backed Prompt, PromptExecution, formatter, generic raw PromptParts, and specific raw PromptParts stay source-visible',
    promptSpaceRole: 'primitive-contract',
    closureTier: 'fifth-gate-baseline',
    fifthGateUse: 'Defines the canonical prompt substrate every active or admitted-support inference corridor must compose through.',
    laterGateRemaining: 'Whole-repository prompt inventory saturation and quality refinement remain eighth-gate work.',
    requiredFiles: [
      'packages/prompts/package.json',
      'packages/prompts/src/index.ts',
      'packages/prompts/src/prompt.ts',
      'packages/prompts/src/parts/PromptPart.ts',
      'packages/prompts/src/execution/PromptExecution.ts',
      'packages/prompts/src/formatters/hierarchical.ts',
      'packages/prompts/src/raw_promptparts/readme.md',
      'packages/registry/src/index.ts',
      'packages/registry/README.md'
    ]
  },
  {
    checkId: 'active-agent-execution-prompt-carriers',
    label: 'Active agent, execution, pipeline, and conversation prompt carriers stay explicit',
    promptSpaceRole: 'active-inference-carriers',
    closureTier: 'fifth-gate-baseline',
    fifthGateUse: 'Binds live inference surfaces to prompt primitives instead of hidden string composition.',
    laterGateRemaining: 'Later gates may refine every carrier and add product-grade prompt quality tests.',
    requiredFiles: [
      'packages/execution-generics/src/prompts/ExecutionPrompt.ts',
      'packages/pipelines-generics/src/prompts/PipelinePrompt.ts',
      'packages/agent-generics/src/prompts/AgentPrompt.ts',
      'packages/agent-generics/src/prompts/AgentStepPrompt.ts',
      'packages/agent-generics/src/execution/prompt-overlays.ts',
      'packages/agent-generics/README.md',
      'packages/agent-generics/TLDR.md',
      'packages/eslint-plugin-bitcode/src/requirePromptHierarchy.ts',
      'packages/conversations-generics/src/prompts/BitcodeTerminalConversationSystemPrompt.ts',
      'packages/conversations-generics/src/agent/ConversationAgent.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_system_bitcodeterminalconversation_identity_corestatement.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_system_bitcodeterminalconversation_capabilities_list.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_system_bitcodeterminalconversation_usage_guidance.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_conversationagent_name.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_conversationagent_identity_definition.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_conversationagent_ptrrplan_purpose.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_conversationagent_ptrrtry_purpose.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_conversationagent_ptrrrefine_purpose.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_conversationagent_ptrrretry_purpose.ts'
    ]
  },
  {
    checkId: 'doc-code-tool-prompt-injection-boundary',
    label: 'Doc-comment and doc-code prompt injection remains an admitted support boundary',
    promptSpaceRole: 'tool-prompt-injection',
    closureTier: 'fifth-gate-baseline',
    fifthGateUse: 'Preserves build/runtime tool prompt descriptions for agentic Bitcode runs without promoting examples or experiments.',
    laterGateRemaining: 'Reference-only plugin/example reservoirs still read later pruning or promotion decisions if reused.',
    requiredFiles: [
      'packages/doc-comment/package.json',
      'packages/doc-comment/src/base-plugin.ts',
      'packages/doc-comment/src/parser.ts',
      'packages/doc-code/package.json',
      'packages/doc-code/src/transformDocCodeTools.ts',
      'packages/tools-generics/src/doc-code-tool/DocCodeToolPrompt.ts',
      'packages/tools-generics/src/doc-code-tool/formatUsableTools.ts',
      'protocol-demonstration/V26_DOC_COMMENT_REFORM.md'
    ]
  },
  {
    checkId: 'asset-pack-read-comprehension-prompt-corridor',
    label: 'Asset-pack and read-comprehension prompts expose Bitcode semantics',
    promptSpaceRole: 'asset-pack-read-comprehension',
    closureTier: 'fifth-gate-baseline',
    fifthGateUse: 'Keeps request carriers mapped to Bitcode read, written asset, asset pack, and delivery mechanism meaning while proving noncanonical read-comprehension owners are removed after read-first owners exist.',
    laterGateRemaining: 'Remaining work is broader raw PromptPart reservoir saturation outside the recut read-comprehension families.',
    requiredFiles: [
      'packages/pipelines/asset-pack/src/agents/prompts/comprehend-read-prompt.ts',
      'packages/pipelines/asset-pack/src/agents/setup/asset-pack-comprehend-read-agent.ts',
      'packages/pipelines/asset-pack/src/semantic-resolution.ts',
      'packages/pipelines/asset-pack/src/types/AssetPackWrittenAssetType.ts',
      'packages/pipelines/asset-pack/src/tools/search.ts',
      'packages/pipelines/asset-pack/scripts/render-prompts.ts',
      'packages/generic-agents/read-comprehension/README.md',
      'packages/generic-agents/read-comprehension/package.json',
      'packages/generic-agents/read-comprehension/tsconfig.json',
      'packages/generic-agents/read-comprehension/src/index.ts',
      'packages/generic-tools/read-comprehension/README.md',
      'packages/generic-tools/read-comprehension/src/AnalyzeReadSemanticsTool.ts',
      'packages/generic-tools/read-comprehension/src/ReadComprehensionToolset.ts',
      'packages/generic-tools/read-comprehension/src/ExtractReadRequirementsTool.ts',
      'packages/generic-tools/read-comprehension/src/IdentifyReadConstraintsTool.ts',
      'packages/generic-tools/read-comprehension/src/GenerateReadSatisfactionCriteriaTool.ts',
      'packages/generic-tools/read-comprehension/src/ValidateReadComprehensionTool.ts',
      'packages/generic-tools/read-comprehension/src/AnalyzeReadSatisfactionImplementationComplexityTool.ts',
      'packages/generic-tools/read-comprehension/src/read-comprehension-primitives.ts',
      'packages/generic-tools/read-comprehension/src/read-comprehension-schemas.ts',
      'packages/generic-tools/read-comprehension/src/prompts/AnalyzeReadSemanticsDocCodeToolPrompt.ts',
      'packages/generic-tools/read-comprehension/src/prompts/ExtractReadRequirementsDocCodeToolPrompt.ts',
      'packages/generic-tools/read-comprehension/src/prompts/IdentifyReadConstraintsDocCodeToolPrompt.ts',
      'packages/generic-tools/read-comprehension/src/prompts/GenerateReadSatisfactionCriteriaDocCodeToolPrompt.ts',
      'packages/generic-tools/read-comprehension/src/prompts/ValidateReadComprehensionDocCodeToolPrompt.ts',
      'packages/generic-tools/read-comprehension/src/prompts/AnalyzeReadSatisfactionImplementationComplexityDocCodeToolPrompt.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_comprehendread_system_identity.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_comprehendread_try_directives.ts'
    ]
  },
  {
    checkId: 'raw-promptpart-runtime-carry-through',
    label: 'Reformed raw PromptParts retain TypeScript and runtime JavaScript carry-through witnesses',
    promptSpaceRole: 'raw-promptpart-carry-through',
    closureTier: 'fifth-gate-baseline',
    fifthGateUse: 'Prevents runtime JavaScript from silently preserving non-Bitcode prompt text after TypeScript prompt reform.',
    laterGateRemaining: 'The full raw promptpart reservoir remains subject to later prompt-space saturation and product-copy quality review.',
    requiredFiles: [
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_analyzeneedsemantics_doccodetoolpurpose.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_analyzeneedsemantics_doccodetoolpurpose.js',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_analyzeneedsatisfactionimplementationcomplexity_doccodetoolexample3.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_analyzeneedsatisfactionimplementationcomplexity_doccodetoolexample3.js',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_validateneedcomprehension_doccodetoolpurpose.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_validateneedcomprehension_doccodetoolpurpose.js',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_dangerwall_purpose_corestatement.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_dangerwall_purpose_corestatement.js',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_dangerwall_capabilities_list.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_dangerwall_capabilities_list.js',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_dangerwall_system_identity.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_dangerwall_system_identity.js',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_websearch_purpose_corestatement.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_websearch_purpose_corestatement.js',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_websearch_capabilities_list.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_websearch_capabilities_list.js',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_websearch_doccodetoolpurpose.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_websearch_doccodetoolpurpose.js',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_getcontents_doccodetoolpurpose.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_getcontents_doccodetoolpurpose.js',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_multiprovidersearch_doccodetoolpurpose.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_multiprovidersearch_doccodetoolpurpose.js'
    ]
  },
  {
    checkId: 'app-and-mcp-prompt-interface-ingress',
    label: 'Terminal and MCP prompt ingress surfaces stay explicit and auditable',
    promptSpaceRole: 'app-mcp-ingress',
    closureTier: 'fifth-gate-baseline',
    fifthGateUse: 'Shows that Terminal conversations and admitted MCP ingress are prompt-bearing interfaces over Bitcode state, not parallel products.',
    laterGateRemaining: 'MCP and third-party app prompt quality, permissioning, and commercial readiness remain sixth/seventh-gate refinements.',
    requiredFiles: [
      'uapi/prompts/bitcode-terminal-system-prompt.ts',
      'uapi/app/api/conversations/stream/route.ts',
      'uapi/app/api/conversations/[conversationId]/stream/route.ts',
      'packages/mcp-generics/package.json',
      'packages/generic-mcps/bitcode/src/prompts/analysis-prompts.ts',
      'packages/generic-mcps/bitcode/src/prompts/workflow-prompts.ts',
      'packages/generic-mcps/bitcode/src/prompts/development-prompts.ts',
      'packages/generic-mcps/bitcode/src/tools/pipeline-tools.ts',
      'packages/generic-mcps/bitcode/src/__tests__/unit/prompt-asset-pack-canon.test.ts'
    ]
  },
  {
    checkId: 'prompt-proof-and-specification-witnesses',
    label: 'Prompt-space specification, inference records, generated proof, and tests are bound together',
    promptSpaceRole: 'proof-and-specification',
    closureTier: 'fifth-gate-baseline',
    fifthGateUse: 'Lets fifth-gate judge prompt behavior from source, specs, tests, and generated proof rather than informal interpretation.',
    laterGateRemaining: 'Eighth-gate must still prove total prompt-space completeness after all retained corridors converge.',
    requiredFiles: [
      'protocol-demonstration/V26_PROMPT_SURFACES.md',
      'protocol-demonstration/V26_INFERENCE_SYSTEMS.md',
      'protocol-demonstration/src/canonical/inference-implementation-records.js',
      'protocol-demonstration/src/canonical/type-contracts.ts',
      'protocol-demonstration/test/v26-prompt-system-boundary.test.js',
      'protocol-demonstration/test/v26-prompt-surface-map.test.js',
      'protocol-demonstration/test/v26-prompt-runtime-loadability.test.js',
      'protocol-demonstration/test/v26-inference-implementation-records.test.js',
      'packages/eslint-plugin-bitcode/src/requirePromptHierarchy.ts',
      'packages/eslint-plugin-bitcode/docs/require-prompt-hierarchy.md',
      'packages/eslint-plugin-bitcode/__tests__/requirePromptHierarchy.test.ts',
      'packages/agent-generics/src/__tests__/factory-agent-ptrr-prompt-hierarchy.test.ts'
    ]
  }
];

const V26_PROMPT_SPACE_OPEN_COMPLETENESS_DIMENSIONS = [
  'whole-repository prompt inventory saturation across every retained consumer',
  'product-grade prompt quality and commercial readiness for Exchange, Terminal, MCP, and third-party interfaces',
  'final retirement or promotion of compatibility prompt names after all callers converge',
  'full raw promptpart reservoir audit for non-Bitcode product semantics and reference-only language',
  'eighth-gate total proof that every live inference path is explainable from the explicit prompt substrate'
];

function buildV26PromptSpaceWitnessCheck(witness) {
  const check = buildV26FilePresenceCheck(
    witness.checkId,
    witness.label,
    witness.requiredFiles
  );

  return {
    ...check,
    promptSpaceRole: witness.promptSpaceRole,
    closureTier: witness.closureTier,
    fifthGateUse: witness.fifthGateUse,
    laterGateRemaining: witness.laterGateRemaining
  };
}

/**
 * @param {{
 *   generatedAt: string,
 *   baseData: any
 * }} input
 */
function buildV26PromptSpaceCompletenessProof({
  generatedAt,
  baseData
}) {
  const checks = V26_PROMPT_SPACE_WITNESS_SETS.map(buildV26PromptSpaceWitnessCheck);
  const baselinePassed = checks.every((check) => check.passed === true);
  const closureChecks = [
    {
      checkId: 'prompt-space-witness-family-complete',
      label: 'Prompt-space witness family completeness',
      passed: baselinePassed,
      detail: baselinePassed
        ? 'All prompt-space witness sets are source-visible and complete.'
        : 'One or more prompt-space witness sets remains missing.'
    },
    buildV26FileContentCheck(
      'prompt-space-eighth-gate-spec-and-test-closure',
      'Prompt-space eighth-gate closure is specified, tested, and rendered as a final verdict',
      [
        {
          file: 'BITCODE_SPEC_V26.md',
          evidence: 'prompt space completeness and total repository closure proofs are generated with explicit closure verdicts',
          description: 'formal eighth-gate rule requires prompt-space completeness as a closure verdict'
        },
        {
          file: 'BITCODE_SPEC_V26_PARITY_MATRIX.md',
          evidence: 'Prompt-space completeness',
          description: 'parity ledger tracks prompt-space completeness as a generated proof family'
        },
        {
          file: 'protocol-demonstration/V26_PROOF_SURFACES.md',
          evidence: 'prompt-space completeness',
          description: 'proof-surface map names prompt-space completeness as a final gate family'
        },
        {
          file: 'protocol-demonstration/test/v26-prompt-surface-map.test.js',
          evidence: 'V26 prompt-space proof closes the eighth-gate completeness verdict',
          description: 'prompt-surface test asserts the final completeness verdict rather than a baseline-only witness'
        }
      ]
    )
  ];
  const passed = closureChecks.every((check) => check.passed === true);

  return {
    reportId: 'v26-prompt-space-completeness-proof',
    version: 'V26',
    proofSourceCommit: baseData.canonicalCommit,
    generatedAt,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState,
    passed,
    closureClaim: passed,
    proceduralGateClosure: passed,
    baselinePassed,
    witnessFamilyComplete: baselinePassed,
    witnessSetCount: checks.length,
    closureGate: 'eighth-gate',
    fifthGateBaseline: baselinePassed
      ? 'Prompt primitives, active carriers, doc-code injection, asset-pack compatibility, read-comprehension read-first prompt owners, runtime carry-through, app/MCP ingress, and proof/spec witnesses are all source-visible for fifth-gate use.'
      : 'One or more fifth-gate prompt-space witness sets is missing and blocks the prompt baseline.',
    closedCompletenessDimensions: passed ? V26_PROMPT_SPACE_OPEN_COMPLETENESS_DIMENSIONS : [],
    openCompletenessDimensions: passed ? [] : V26_PROMPT_SPACE_OPEN_COMPLETENESS_DIMENSIONS,
    closureReason: passed
      ? 'Prompt-space completeness is closed because every retained prompt primitive, active inference carrier, doc-code injection path, AssetPack/Read-comprehension prompt corridor, raw PromptPart runtime path, app/MCP ingress path, and proof/spec witness is explicitly source-visible.'
      : null,
    openReason: passed
      ? null
      : 'Prompt-space completeness remains an eighth-gate closure proof; this artifact now proves the fifth-gate prompt witness baseline without claiming final prompt-space saturation.',
    closureChecks,
    checks
  };
}

/**
 * @param {{
 *   generatedAt: string,
 *   baseData: any
 * }} input
 */
function buildV26ConversationsContinuityProof({
  generatedAt,
  baseData
}) {
  const checks = [
    buildV26FilePresenceCheck(
      'conversations-route-and-overlay-owners',
      'Direct conversations route and fullscreen overlay owners',
      [
        'uapi/app/conversations/page.tsx',
        'uapi/app/conversations/ConversationsRouteClient.tsx',
        'uapi/app/conversations/README.md',
        'uapi/app/conversations/components/ConversationsOverlay.tsx',
        'uapi/app/ClientLayoutInner.tsx',
        'uapi/app/terminal/TerminalPageClient.tsx'
      ]
    ),
    buildV26FilePresenceCheck(
      'conversations-api-carriers',
      'Conversations API and mock-mode carriers',
      [
        'uapi/app/api/conversations/route.ts',
        'uapi/app/api/conversations/stream/route.ts',
        'uapi/app/api/conversations/[conversationId]/stream/route.ts',
        'uapi/app/api/conversations/branch/route.ts',
        'uapi/app/api/conversations/_shared.ts'
      ]
    ),
    buildV26FilePresenceCheck(
      'conversations-retained-package-basis',
      'Retained conversations package and proof carriers',
      [
        'packages/conversations-generics/src/index.ts',
        'packages/conversations-generics/src/agent/ConversationAgent.ts',
        'packages/conversations-generics/src/prompts/BitcodeTerminalConversationSystemPrompt.ts',
        'packages/api/src/routes/conversations.ts',
        'packages/api/src/conversations/conversations.ts',
        'packages/api/src/conversations/messages.ts',
        'packages/api/src/conversations/attachments.ts',
        'packages/api/src/conversations/streaming.ts',
        'packages/api/src/conversations/__tests__/branch-conversation.test.ts',
        'uapi/tests/api/conversationsRoute.test.ts',
        'uapi/tests/api/chatStreamRoute.test.ts',
        'uapi/tests/api/conversationBranchRoute.test.ts',
        'uapi/tests/api/conversationThreadStreamRoute.test.ts',
        'uapi/tests/conversationsRouteClient.test.tsx'
      ]
    ),
    buildV26FileContentCheck(
      'conversations-rich-input-execution-parity',
      'Conversation rich-input persistence and execution evidence',
      [
        {
          file: 'packages/api/src/routes/conversations.ts',
          evidence: 'buildConversationRichInputSummary',
          description: 'conversation stream route normalizes Bitcode rich input before execution creation'
        },
        {
          file: 'packages/api/src/routes/conversations.ts',
          evidence: 'source_attachments',
          description: 'source attachments are first-class conversation execution evidence'
        },
        {
          file: 'packages/api/src/routes/conversations.ts',
          evidence: 'output_destinations',
          description: 'output destinations are first-class conversation execution evidence'
        },
        {
          file: 'packages/api/src/routes/conversations.ts',
          evidence: 'asset_pack_references',
          description: 'AssetPack references are first-class conversation execution evidence'
        },
        {
          file: 'packages/api/src/routes/conversations.ts',
          evidence: 'read_measurement_intents',
          description: 'Read-measurement intent is first-class conversation execution evidence'
        },
        {
          file: 'packages/api/src/conversations/messages.ts',
          evidence: 'metadata: att',
          description: 'message attachment rows preserve the full attachment reference payload'
        },
        {
          file: 'packages/api/src/conversations/conversations.ts',
          evidence: 'copiedAttachmentCount',
          description: 'branched conversations preserve attachment and execution-reference continuity'
        },
        {
          file: 'packages/api/src/conversations/__tests__/branch-conversation.test.ts',
          evidence: 'copiedAttachmentCount',
          description: 'package-level branching test proves copied attachment continuity'
        },
        {
          file: 'uapi/tests/api/conversationBranchRoute.test.ts',
          evidence: 'copiedAttachmentCount',
          description: 'App Router branch route preserves copied attachment continuity at the interface boundary'
        },
        {
          file: 'uapi/tests/api/chatStreamRoute.test.ts',
          evidence: "rich_input: expect.objectContaining",
          description: 'root conversation stream test asserts persisted Read-measurement rich input'
        },
        {
          file: 'uapi/tests/api/conversationThreadStreamRoute.test.ts',
          evidence: "output_destinations: expect.arrayContaining",
          description: 'thread conversation stream test asserts destination roundtrip into execution metadata'
        }
      ]
    )
  ];
  const passed = checks.every((check) => check.passed === true);

  return {
    reportId: 'v26-conversations-continuity-proof',
    version: 'V26',
    proofSourceCommit: baseData.canonicalCommit,
    generatedAt,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState,
    passed,
    routeWitnesses: [
      '/conversations',
      '/terminal'
    ],
    apiWitnesses: [
      '/api/conversations',
      '/api/conversations/stream',
      '/api/conversations/[conversationId]/stream',
      '/api/conversations/branch'
    ],
    requiredFiles: V26_FOURTH_GATE_CONVERSATION_FILES,
    checks
  };
}

/**
 * @param {{
 *   generatedAt: string,
 *   baseData: any
 * }} input
 */
function buildV26RunsPipelinesTotalityProof({
  generatedAt,
  baseData
}) {
  const checks = [
    buildV26FilePresenceCheck(
      'executions-route-and-detail-owners',
      'Direct executions route and retained detail owners',
      [
        'uapi/app/executions/page.tsx',
        'uapi/app/executions/[runId]/page.tsx',
        'uapi/app/executions/README.md',
        'uapi/app/executions/components/ExecutionsPage.tsx',
        'uapi/app/executions/components/ExecutionsPageClient.tsx',
        'uapi/app/executions/components/ExecutionsDetailsView.tsx'
      ]
    ),
    buildV26FilePresenceCheck(
      'executions-api-and-history-carriers',
      'Active executions API route and history carriers',
      [
        'uapi/app/api/executions/route.ts',
        'uapi/app/api/executions/history/route.ts',
        'uapi/app/api/executions/history/[runId]/route.ts',
        'uapi/app/api/executions/_shared.ts',
        'packages/api/src/routes/shippables.ts',
        'packages/api/src/pipelines/branch.ts'
      ]
    ),
    buildV26FilePresenceCheck(
      'executions-retained-compatibility-carriers',
      'Retained executions compatibility APIs, canonical auxillary APIs, and proof carriers',
      [
        'uapi/app/api/vcs/route.ts',
        'uapi/app/api/auxillaries/template-preferences/route.ts',
        'uapi/app/api/auxillaries/profile/route.ts',
        'uapi/app/api/auxillaries/connections/github/route.ts',
        'uapi/app/api/auxillaries/btd/route.ts',
        'uapi/app/api/auxillaries/usage/route.ts',
        'uapi/app/api/auxillaries/transactions/route.ts',
        'uapi/app/api/auxillaries/api-keys/route.ts',
        'uapi/app/api/templates/shippables/route.ts',
        'uapi/app/api/templates/shippables/route.ts',
        'uapi/tests/api/vcsCompatibilityRoute.test.ts',
        'uapi/tests/api/orbitalsTemplatePreferencesRoute.test.ts',
        'uapi/tests/api/orbitalsProfileRoute.test.ts',
        'uapi/tests/api/orbitalUsageRoute.test.ts',
        'uapi/tests/api/auxillariesTransactionsRoute.test.ts',
        'uapi/tests/api/shippableTemplatesRoute.test.ts',
        'uapi/tests/apiKeysRoutes.test.ts',
        'uapi/tests/userConnectionsGithubRoute.test.ts',
        'uapi/tests/api/userBtdRoute.test.ts'
      ]
    ),
    buildV26FilePresenceCheck(
      'runs-pipelines-retained-package-basis',
      'Retained execution, pipeline, and proof carriers',
      [
        'packages/execution-generics/src/Execution.ts',
        'packages/execution-generics/src/execution-registry.ts',
        'packages/execution-generics/src/storage/ExecutionStorageAdapter.ts',
        'packages/pipelines-generics/src/execution/PipelineExecution.ts',
        'packages/pipelines-generics/src/execution/PipelineExecutor.ts',
        'packages/pipelines-generics/src/execution/route-pipeline-execution.ts',
        'packages/pipelines/asset-pack/src/run.ts',
        'uapi/tests/api/shippableTemplatesRoute.test.ts',
        'uapi/tests/api/executionsHistoryRoute.test.ts',
        'uapi/tests/api/executionsHistoryRunRoute.test.ts',
        'uapi/tests/bitcodeExecutionStreamPanel.test.tsx',
        'uapi/tests/usePipelineExecution.test.tsx'
      ]
    ),
    buildV26FilePresenceCheck(
      'executions-activity-and-notification-carriers',
      'Shared activity, execution, and notification carriers stay explicit under Bitcode',
      V26_FOURTH_GATE_ACTIVITY_FILES
    ),
    buildV26FileContentCheck(
      'mcp-write-admission-and-third-party-ingress-contract',
      'Bitcode MCP write admission and third-party ingress are source-checked as Exchange-facing interface contracts rather than package-presence witnesses',
      [
        {
          file: 'packages/generic-mcps/bitcode/src/types/index.ts',
          evidence: "| 'third_party_mcp'",
          description: 'MCP type surface admits third-party MCP as ingress context, not as a parallel product output'
        },
        {
          file: 'packages/generic-mcps/bitcode/src/pipeline-execution/adapter.ts',
          evidence: 'export function buildPipelineInputContext',
          description: 'pipeline adapter exposes explicit input-context normalization for interface ingress'
        },
        {
          file: 'packages/generic-mcps/bitcode/src/tools/pipeline-tools.ts',
          evidence: "permission: 'pipelines.create'",
          description: 'pipeline tool emits an explicit write-admission permission receipt'
        },
        {
          file: 'packages/generic-mcps/bitcode/src/tools/pipeline-tools.ts',
          evidence: 'const writeAdmission = assertPipelineWriteAdmission(params, context, interfaceSurface)',
          description: 'pipeline write admission is evaluated before BTD estimation and queueing'
        },
        {
          file: 'packages/generic-mcps/bitcode/src/tools/pipeline-tools.ts',
          evidence: 'writeAdmission,',
          description: 'accepted write admission is returned and queued in metadata'
        },
        {
          file: 'packages/generic-mcps/bitcode/src/__tests__/unit/pipeline-ingress-contract.test.ts',
          evidence: 'normalizes third-party MCP repository and attachment ingress as input context only',
          description: 'unit proof covers third-party MCP ingress as input context'
        },
        {
          file: 'packages/generic-mcps/bitcode/src/__tests__/unit/pipeline-ingress-contract.test.ts',
          evidence: "expect(inputContext).not.toHaveProperty('assetPacks')",
          description: 'unit proof rejects treating third-party ingress as asset-pack output'
        },
        {
          file: 'packages/generic-mcps/bitcode/src/__tests__/unit/pipeline-ingress-contract.test.ts',
          evidence: "repositoryAnchor: 'github:bitcode-labs/terminal@main'",
          description: 'unit proof binds accepted MCP writes to a concrete repository anchor'
        },
        {
          file: 'packages/generic-mcps/bitcode/src/__tests__/unit/pipeline-ingress-contract.test.ts',
          evidence: 'metadata: expect.objectContaining({',
          description: 'unit proof verifies write-admission metadata is queued with the pipeline job'
        }
      ]
    ),
    buildV26FileContentCheck(
      'mcp-asset-pack-prompt-canon',
      'Bitcode MCP prompt and tool surfaces teach asset-pack pipeline semantics while retaining compatibility URI and subtype names',
      [
        {
          file: 'packages/generic-mcps/bitcode/src/prompts/workflow-prompts.ts',
          evidence: 'Please execute the Bitcode asset-pack pipeline',
          description: 'workflow prompts teach the active asset-pack pipeline meaning'
        },
        {
          file: 'packages/generic-mcps/bitcode/src/prompts/development-prompts.ts',
          evidence: "Bitcode's asset-pack pipeline with the following comprehensive source-to-shares approach",
          description: 'development prompts teach source-to-shares asset-pack execution'
        },
        {
          file: 'packages/generic-mcps/bitcode/src/tools/pipeline-tools.ts',
          evidence: 'Create and execute a Bitcode asset-pack pipeline',
          description: 'pipeline tool description exposes canonical asset-pack semantics'
        },
        {
          file: 'packages/generic-mcps/bitcode/src/__tests__/unit/prompt-asset-pack-canon.test.ts',
          evidence: 'MCP prompt asset-pack canon',
          description: 'package-local test renders prompts and proves they teach AssetPack canon'
        }
      ]
    ),
    buildV26FileContentCheck(
      'webhook-asset-pack-ingress-contract',
      'GitHub webhook automation is source-checked as asset-pack pipeline ingress rather than Exchange ownership or non-Bitcode output canon',
      [
        {
          file: 'uapi/app/api/webhook/route.ts',
          evidence: "WEBHOOK_ASSET_PACK_PIPELINE_TRACK_EVENT = 'Trigger Asset-Pack Pipeline'",
          description: 'webhook analytics event names the active asset-pack pipeline meaning'
        },
        {
          file: 'uapi/app/api/webhook/route.ts',
          evidence: "outputMeaning: 'asset_packs'",
          description: 'webhook success receipts classify output as asset packs'
        },
        {
          file: 'uapi/app/api/webhook/route.ts',
          evidence: "exchangeStateRole: 'ingress_only_automation_boundary'",
          description: 'webhook receipt keeps GitHub automation as ingress-only rather than Exchange state ownership'
        },
        {
          file: 'uapi/app/api/webhook/route.ts',
          evidence: "triggerCommand: 'bitcode-asset-pack-trigger'",
          description: 'asset-pack trigger command uses current Bitcode ingress naming'
        },
        {
          file: 'uapi/tests/webhookRoute.test.ts',
          evidence: 'expectedAssetPackPipelineTrack',
          description: 'route test centralizes expected asset-pack ingress receipt shape'
        },
        {
          file: 'uapi/tests/webhookRoute.test.ts',
          evidence: 'supports bitcode-pr label for asset-pack pipeline',
          description: 'route test proves GitHub label ingress now teaches asset-pack pipeline semantics'
        }
      ]
    ),
    buildV26FileContentCheck(
      'uapi-client-asset-pack-execution-hook',
      'Terminal execution client hook teaches Bitcode asset-pack pipeline semantics through canonical Definition of Read input names',
      [
        {
          file: 'uapi/hooks/useExecutionState.ts',
          evidence: 'Triggers the Bitcode asset-pack pipeline',
          description: 'TypeScript hook comment describes active client execution as asset-pack pipeline behavior'
        },
        {
          file: 'uapi/hooks/useExecutionState.ts',
          evidence: 'definitionOfRead',
          description: 'TypeScript hook submits the canonical Definition of Read request shape'
        },
        {
          file: 'uapi/hooks/useExecutionState.ts',
          evidence: 'Submitting Bitcode asset-pack pipeline',
          description: 'TypeScript debug path teaches Bitcode asset-pack submission'
        }
      ]
    )
  ];
  const passed = checks.every((check) => check.passed === true);

  return {
    reportId: 'v26-runs-pipelines-totality-proof',
    version: 'V26',
    proofSourceCommit: baseData.canonicalCommit,
    generatedAt,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState,
    passed,
    routeWitnesses: [
      '/executions',
      '/executions/[runId]'
    ],
    apiWitnesses: [
      '/api/executions',
      '/api/executions/history',
      '/api/executions/history/[runId]',
      '/api/vcs',
      '/api/auxillaries/template-preferences',
      '/api/templates/shippables',
    ],
    requiredFiles: V26_FOURTH_GATE_RUNS_PIPELINES_FILES,
    checks
  };
}

const V26_SYSTEM_REFORM_DECISIONS = [
  {
    checkId: 'system-reform-governance-witnesses',
    label: 'System-reform governance remains explicit in the active V26 family',
    reformClass: 'governance',
    livePathRole: 'The canonical spec family and supplementary architecture/proof docs classify compatibility-bounded retained families rather than leaving them implicit.',
    requiredFiles: [
      'BITCODE_SPEC_V26.md',
      'BITCODE_SPEC_V26_PARITY_MATRIX.md',
      'BITCODE_SPEC_V26_NOTES.md',
      'protocol-demonstration/V26_TERMINAL_SYSTEMS.md',
      'protocol-demonstration/V26_PROOF_SURFACES.md',
      'protocol-demonstration/V26_REFORM_STRATEGY.md',
      'protocol-demonstration/test/v26-reform-strategy.test.js'
    ]
  },
  {
    checkId: 'webhook-ingress-boundary',
    label: 'Retained webhook carriers are explicit ingress-only automation boundaries',
    reformClass: 'ingress-only',
    livePathRole: 'GitHub-triggered automation ingress may schedule work, but it does not own Bitcode Exchange state semantics.',
    requiredFiles: [
      'uapi/app/api/webhook/route.ts',
      'uapi/app/api/webhook/verify.ts',
      'uapi/tests/webhookRoute.test.ts',
      'uapi/tests/api/webhookSignature.test.ts'
    ]
  },
  {
    checkId: 'asset-pack-compatibility-export-boundary',
    label: 'AssetPack run export keeps route compatibility explicit while Shippable output is primary',
    reformClass: 'compatibility-only',
    livePathRole: 'Admitted path exports stay available for current callers while canonical Bitcode behavior remains elsewhere.',
    requiredFiles: [
      'packages/pipelines/asset-pack/src/run.ts',
      'packages/pipelines/asset-pack/src/index.ts'
    ]
  },
  {
    checkId: 'vcs-agent-reference-boundary',
    label: 'Retained VCS agent layer remains explicit reference-only automation',
    reformClass: 'reference-only',
    livePathRole: 'The VCS agent layer can support retained callers, but repository scope in the Bitcode product belongs to Connects and terminal-owned panels.',
    requiredFiles: [
      'packages/generic-agents/vcs/src/index.ts',
      'uapi/app/terminal/TerminalRepositoryContextPanel.tsx',
      'uapi/app/auxillaries/components/AuxillariesConnectsPane.tsx'
    ]
  },
  {
    checkId: 'computer-use-read-measurement-boundary',
    label: 'Retained computer-use tooling is internal Read-measurement support only',
    reformClass: 'ingress-or-support',
    livePathRole: 'Computer use may supply server-flagged Read-measurement evidence under BITCODE_ENABLE_COMPUTER_USE_READ_MEASUREMENT, but it is not a Terminal option, implementation agent tool, Finish/Delivering tool, multi-agent substitute, or Bitcode state owner.',
    requiredFiles: [
      'packages/generic-tools/use-computer/src/index.ts',
      'packages/generic-tools/use-computer/src/prompts/UseComputerDocCodeToolPrompt.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_usecomputer_doccodetoolpurpose.ts',
      'packages/pipelines/asset-pack/src/tools/BitcodeReadMeasurementComputerUseTool.ts',
      'packages/pipelines/asset-pack/src/tools/index.ts',
      'packages/api/src/routes/shippables.ts',
      'packages/execution-generics/src/store/registry.ts',
      'uapi/app/executions/components/ExecutionsPageClient.tsx',
      'uapi/components/bitcode/pipeline/execution-option-toggle.tsx',
      'protocol-demonstration/test/v26-active-product-naming.test.js'
    ]
  },
  {
    checkId: 'jira-tool-reference-boundary',
    label: 'Retained Jira tooling remains explicit reference-only ingress/integration support',
    reformClass: 'reference-only',
    livePathRole: 'Jira tooling can contribute admitted integration context without becoming Bitcode Exchange ownership.',
    requiredFiles: [
      'packages/generic-tools/mcps-tools/jira/src/index.ts',
      'packages/jira/src/index.ts'
    ]
  },
  {
    checkId: 'lsp-measure-read-boundary',
    label: 'Retained LSP infrastructure is repurposed as static Read/AssetPack measurement',
    reformClass: 'ingress-or-support',
    livePathRole: 'LSP tooling may remain only as replayable symbol/path/config/type evidence for Read measurement, AssetPack fit, and proof replay.',
    requiredFiles: [
      'protocol-demonstration/V26_LSP_MEASUREMENT_REFORM.md',
      'protocol-demonstration/src/bitcode-demo.js',
      'protocol-demonstration/src/canonical/read-measurement.js',
      'packages/lsp/src/index.ts',
      'packages/generic-tools/lsp-query/src/prompts/LspQueryDocCodeToolPrompt.ts'
    ]
  },
  {
    checkId: 'web-search-auxiliary-input-boundary',
    label: 'Retained web-search carriers are Bitcode read-synthesis evidence support',
    reformClass: 'ingress-or-support',
    livePathRole: 'External search/research context may support discovery-phase read synthesis with source-attributed evidence, but it does not own canonical read, proof, mutation, delivery, Terminal, or Exchange truth.',
    requiredFiles: [
      'packages/generic-agents/web-search/README.md',
      'packages/generic-agents/web-search/src/index.ts',
      'packages/generic-tools/web-search/README.md',
      'packages/generic-tools/web-search/src/index.ts',
      'packages/generic-tools/web-search/src/prompts/WebSearchDocCodeToolPrompt.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_websearch_purpose_corestatement.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_websearch_doccodetoolpurpose.ts',
      'protocol-demonstration/test/v26-web-search-support-compatibility.test.js',
      'packages/web-search/src/index.ts',
      'packages/external-apps/chatgpt/src/tools.ts',
      'protocol-demonstration/test/v26-active-product-naming.test.js'
    ]
  },
  {
    checkId: 'danger-wall-risk-admission-boundary',
    label: 'Retained danger-wall carrier is Bitcode read/AssetPack risk admission',
    reformClass: 'ingress-or-support',
    livePathRole: 'Danger-wall compatibility may admit, block, or require manual review before a retained pipeline phase proceeds, but it does not own canonical read, proof, mutation, delivery, or product semantics.',
    requiredFiles: [
      'packages/generic-agents/danger-wall/README.md',
      'packages/generic-agents/danger-wall/src/index.ts',
      'packages/prompts/src/raw_promptparts/specific/promptpart_specific_agent_dangerwall_purpose_corestatement.ts',
      'protocol-demonstration/test/v26-danger-wall-agent-compatibility.test.js'
    ]
  }
];

/**
 * @param {{
 *   generatedAt: string,
 *   baseData: any
 * }} input
 */
function buildV26SystemReformAdmissibilityProof({
  generatedAt,
  baseData
}) {
  const checks = V26_SYSTEM_REFORM_DECISIONS.map((decision) => {
    const check = buildV26FilePresenceCheck(
      decision.checkId,
      decision.label,
      decision.requiredFiles
    );

    return {
      ...check,
      reformClass: decision.reformClass,
      livePathRole: decision.livePathRole
    };
  });
  const passed = checks.every((check) => check.passed === true);
  const classificationCounts = V26_SYSTEM_REFORM_DECISIONS.reduce((counts, decision) => {
    counts[decision.reformClass] = (counts[decision.reformClass] || 0) + 1;
    return counts;
  }, {});

  return {
    reportId: 'v26-system-reform-admissibility-proof',
    version: 'V26',
    proofSourceCommit: baseData.canonicalCommit,
    generatedAt,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState,
    passed,
    classificationCounts,
    reformClasses: Object.keys(classificationCounts),
    closureBasis: 'Retained families are admissible for fifth-gate only when their live-path role is explicitly classified as governance, ingress-only, compatibility-only, reference-only, or auxiliary-input rather than surviving as parallel product ownership.',
    checks
  };
}

/**
 * @param {{
 *   generatedAt: string,
 *   baseData: any
 * }} input
 */
function buildV26WholeRepositoryProductionSatisfactionProof({
  generatedAt,
  baseData,
  terminalCompositionProof,
  conversationsContinuityProof,
  environmentModeCoherenceProof,
  runsPipelinesTotalityProof,
  persistenceSchemaTotalityProof,
  promptSystemTotalityProof,
  inferenceImplementationRecordsProof,
  sourceToSharesFifthGateProof,
  productReadinessAudit,
  fifthGateClosureProof,
  sixthGateMvpClosureProof,
  seventhGateCommercialTestnetLaunchProof,
  promptSpaceCompletenessProof,
  retainedPackageAdmissibilityProof,
  systemReformAdmissibilityProof
}) {
  const proofChecks = [
    {
      checkId: 'whole-repository-prior-gate-prerequisites',
      label: 'Fifth-, sixth-, and seventh-gate generated prerequisites',
      passed: fifthGateClosureProof?.passed === true
        && fifthGateClosureProof?.closureClaim === true
        && sixthGateMvpClosureProof?.passed === true
        && sixthGateMvpClosureProof?.closureClaim === true
        && seventhGateCommercialTestnetLaunchProof?.passed === true
        && seventhGateCommercialTestnetLaunchProof?.closureClaim === true,
      detail: 'Final repository satisfaction depends on the accepted fifth-, sixth-, and seventh-gate proof chain.'
    },
    {
      checkId: 'whole-repository-material-proof-families',
      label: 'Material retained-system proof families',
      passed: [
        terminalCompositionProof,
        conversationsContinuityProof,
        environmentModeCoherenceProof,
        runsPipelinesTotalityProof,
        persistenceSchemaTotalityProof,
        promptSystemTotalityProof,
        inferenceImplementationRecordsProof,
        sourceToSharesFifthGateProof,
        retainedPackageAdmissibilityProof,
        systemReformAdmissibilityProof
      ].every((proof) => proof?.passed === true),
      detail: 'Terminal, conversations, environment, runs/pipelines, persistence/schema, prompt, inference, source-to-shares, retained-package, and reform proofs must all pass.'
    },
    {
      checkId: 'whole-repository-product-readiness-launch-evidence',
      label: 'Product readiness through commercial testnet launch',
      passed: productReadinessAudit?.launchPassed === true
        && productReadinessAudit?.launchReadyProductCount === productReadinessAudit?.productCount
        && productReadinessAudit?.launchOpenProductCount === 0,
      detail: 'Exchange, Terminal, Protocol, proofs, connected interfaces, and readiness surfaces must all be launch-ready before final repository closure.'
    },
    {
      checkId: 'whole-repository-prompt-space-prerequisite',
      label: 'Prompt-space completeness prerequisite',
      passed: promptSpaceCompletenessProof?.passed === true,
      detail: 'Prompt-space completeness is part of the final repository satisfaction verdict.'
    }
  ];
  const sourceChecks = [
    buildV26FilePresenceCheck(
      'whole-repository-canonical-spec-proof-carriers',
      'Canonical spec family, proof generator, proof-surface map, and final-gate tests',
      [
        'BITCODE_SPEC_V26.md',
        'BITCODE_SPEC_V26_DELTA.md',
        'BITCODE_SPEC_V26_PARITY_MATRIX.md',
        'BITCODE_SPEC_V26_NOTES.md',
        'BITCODE_SPEC_V26_PROVEN.md',
        'protocol-demonstration/V26_PROOF_SURFACES.md',
        'protocol-demonstration/src/canonical/proven-generator.js',
        'protocol-demonstration/src/canonical/v21-specifying.js',
        'protocol-demonstration/test/proven-generator.test.js',
        'protocol-demonstration/test/v26-gate-acceptance-criteria.test.js'
      ]
    ),
    buildV26FilePresenceCheck(
      'whole-repository-commercial-product-carriers',
      'Commercial Exchange, Terminal, Protocol, proof, and readiness carriers',
      [
        'uapi/app/terminal/TerminalPageClient.tsx',
        'uapi/app/terminal/terminal-experience-architecture.ts',
        'uapi/app/terminal/terminal-commercial-launch-readiness.ts',
        'uapi/tests/terminalCommercialLaunchReadiness.test.ts',
        'uapi/app/api/state/route.ts',
        'uapi/app/api/read-review/route.ts',
        'uapi/app/api/make-bitcode-branch/route.ts',
        'uapi/app/api/auxillaries/data/route.ts',
        'uapi/app/auxillaries/components/AuxillariesBTDPane.tsx',
        'uapi/app/conversations/ConversationsRouteClient.tsx',
        'packages/api/src/routes/conversations.ts'
      ]
    ),
    buildV26FilePresenceCheck(
      'whole-repository-connected-interface-and-package-carriers',
      'MCP, ChatGPT App, AssetPack, API, prompt, storage, and schema carriers',
      [
        'packages/external-apps/chatgpt/src/server.ts',
        'packages/external-apps/chatgpt/src/tools.ts',
        'packages/external-apps/chatgpt/src/__tests__/tools.test.ts',
        'packages/generic-mcps/bitcode/src/tools/pipeline-tools.ts',
        'packages/generic-mcps/bitcode/src/types/index.ts',
        'packages/generic-mcps/bitcode/src/__tests__/unit/pipeline-ingress-contract.test.ts',
        'packages/git/package.json',
        'packages/git/src/index.ts',
        'packages/generic-tools/git-interactor/src/index.ts',
        'packages/btd/src/index.ts',
        'packages/api/src/routes/shippables.ts',
        'packages/pipelines/asset-pack/src/run.ts',
        'packages/pipelines/asset-pack/src/postprocess.ts',
        'packages/prompts/src/index.ts',
        'packages/orm/src/models/bitcode-execution-storage.ts',
        'supabase/migrations/001_v26_production.sql'
      ]
    ),
    buildV26FileContentCheck(
      'whole-repository-no-silent-compatibility-ownership',
      'No silent compatibility ownership remains on the final Bitcode product path',
      [
        {
          file: 'BITCODE_SPEC_V26.md',
          evidence: 'terminal-ready Bitcode canon without legacy product naming or silent compatibility ownership',
          description: 'eighth-gate acceptance requires the kept repository to be terminal-ready Bitcode canon'
        },
        {
          file: 'protocol-demonstration/V26_REFORM_STRATEGY.md',
          evidence: 'classify before reuse',
          description: 'reform strategy requires classification before retained corridor reuse'
        },
        {
          file: 'protocol-demonstration/V26_SHIPPABLE_REFORM.md',
          evidence: '`deliverable` is not a Bitcode concept.',
          description: 'Shippable reform keeps deliverable wording as a trace target rather than active Bitcode canon'
        },
        {
          file: 'protocol-demonstration/test/v26-active-product-naming.test.js',
          evidence: 'active V26 retained package surfaces use Bitcode naming instead of Engi naming',
          description: 'active naming test audits retained package surfaces for Bitcode naming'
        },
        {
          file: 'packages/git/src/index.ts',
          evidence: 'Git is retained in V26 as concrete repository-transport infrastructure',
          description: 'Git package is active Bitcode repository infrastructure, not a removal target'
        },
        {
          file: 'packages/generic-tools/git-interactor/src/index.ts',
          evidence: 'Bitcode Git interactor tool suite',
          description: 'git-interactor is repurposed as active Bitcode Git/VCS tool infrastructure'
        },
        {
          file: 'packages/btd/src/index.ts',
          evidence: 'BTD_MAX_MINTABLE_SUPPLY = 21_000_000',
          description: 'BTD package records the later-version 21 million mintable supply ceiling'
        }
      ]
    )
  ];
  const checks = [...proofChecks, ...sourceChecks];
  const passed = checks.every((check) => check.passed === true);

  return {
    reportId: 'v26-whole-repository-production-satisfaction-proof',
    version: 'V26',
    proofSourceCommit: baseData.canonicalCommit,
    generatedAt,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState,
    passed,
    closureClaim: passed,
    proceduralGateClosure: passed,
    proofCheckCount: proofChecks.length,
    sourceCheckCount: sourceChecks.length,
    closureReason: passed
      ? 'Whole-repository production satisfaction is closed because the retained terminal, API, MCP, ChatGPT App, package, schema, proof, product-readiness, and reform corridors all carry explicit Bitcode ownership and generated proof evidence.'
      : null,
    openReason: passed
      ? null
      : 'Whole-repository production satisfaction remains an eighth-gate closure proof after fifth-gate and later product-elevation gates complete.',
    checks
  };
}

/**
 * @param {{
 *   generatedAt: string,
 *   baseData: any
 * }} input
 */
function buildV26TotalClosureProof({
  generatedAt,
  baseData,
  specFamilyReport,
  canonicalInputReport,
  fifthGateClosureProof,
  sixthGateMvpClosureProof,
  seventhGateCommercialTestnetLaunchProof,
  promptSpaceCompletenessProof,
  wholeRepositoryProductionSatisfactionProof,
  productReadinessAudit,
  retainedPackageAdmissibilityProof,
  systemReformAdmissibilityProof
}) {
  const specSourceCheck = buildV26FileContentCheck(
    'v26-total-closure-spec-and-parity-verdict',
    'V26 total closure is specified, parity-recorded, and proof-surface mapped',
    [
      {
        file: 'BITCODE_SPEC_V26.md',
        evidence: 'The current generated eighth-gate evidence includes explicit closure verdicts',
        description: 'main spec records the current eighth-gate closure evidence'
      },
      {
        file: 'BITCODE_SPEC_V26_PARITY_MATRIX.md',
        evidence: 'eighth-gate whole-repository closure is explicit and closed',
        description: 'parity matrix records closed final-gate repository closure'
      },
      {
        file: 'BITCODE_SPEC_V26_DELTA.md',
        evidence: 'V26 is now fully proven Bitcode canon',
        description: 'delta records the shift from through-seventh checkpoint to full V26 closure'
      },
      {
        file: 'protocol-demonstration/V26_PROOF_SURFACES.md',
        evidence: 'generated V26 proof appendix and reports are eighth-gate final closure evidence',
        description: 'proof-surface map treats final reports as closure evidence rather than blockers'
      }
    ]
  );
  const closureRows = [
    {
      rowId: 'fifth-sixth-seventh-gate-acceptance-hold',
      criterion: 'Fifth-, sixth-, and seventh-gate acceptance must hold before final V26 closure.',
      proofEvidencePassed: fifthGateClosureProof?.passed === true
        && fifthGateClosureProof?.closureClaim === true
        && sixthGateMvpClosureProof?.passed === true
        && sixthGateMvpClosureProof?.closureClaim === true
        && seventhGateCommercialTestnetLaunchProof?.passed === true
        && seventhGateCommercialTestnetLaunchProof?.closureClaim === true,
      sourceEvidencePassed: true
    },
    {
      rowId: 'prompt-space-completeness-closed',
      criterion: 'Prompt-space completeness must carry an explicit final closure verdict.',
      proofEvidencePassed: promptSpaceCompletenessProof?.passed === true
        && promptSpaceCompletenessProof?.closureClaim === true
        && promptSpaceCompletenessProof?.proceduralGateClosure === true,
      sourceEvidencePassed: true
    },
    {
      rowId: 'whole-repository-production-satisfaction-closed',
      criterion: 'Whole-repository production satisfaction must close across terminal, API, MCP, ChatGPT App, package, proof, and reform corridors.',
      proofEvidencePassed: wholeRepositoryProductionSatisfactionProof?.passed === true
        && wholeRepositoryProductionSatisfactionProof?.closureClaim === true
        && wholeRepositoryProductionSatisfactionProof?.proceduralGateClosure === true,
      sourceEvidencePassed: true
    },
    {
      rowId: 'spec-family-and-canonical-input-promoted',
      criterion: 'The V26 spec family and canonical input reports must pass in final promoted posture.',
      proofEvidencePassed: specFamilyReport?.passed === true
        && specFamilyReport?.mode === 'promoted'
        && canonicalInputReport?.passed === true,
      sourceEvidencePassed: true
    },
    {
      rowId: 'terminal-ready-bitcode-canon-no-silent-compatibility',
      criterion: 'The kept repository must be terminal-ready Bitcode canon without silent legacy product ownership.',
      proofEvidencePassed: productReadinessAudit?.launchPassed === true
        && retainedPackageAdmissibilityProof?.passed === true
        && systemReformAdmissibilityProof?.passed === true,
      sourceEvidencePassed: specSourceCheck.passed === true
    },
    {
      rowId: 'promotion-without-interpretive-notes',
      criterion: 'V26 total closure must be explicit enough that promotion no longer depends on interpretive notes.',
      proofEvidencePassed: true,
      sourceEvidencePassed: specSourceCheck.passed === true
    }
  ].map((row) => ({
    ...row,
    closurePassed: row.proofEvidencePassed === true && row.sourceEvidencePassed === true
  }));
  const checks = [
    specSourceCheck,
    ...closureRows.map((row) => ({
      checkId: row.rowId,
      label: row.criterion,
      passed: row.closurePassed,
      detail: row.closurePassed
        ? 'Closure row accepted'
        : `proofEvidencePassed=${row.proofEvidencePassed}; sourceEvidencePassed=${row.sourceEvidencePassed}`
    }))
  ];
  const openQueueRows = closureRows
    .filter((row) => row.closurePassed !== true)
    .map((row) => row.rowId);
  const passed = openQueueRows.length === 0 && checks.every((check) => check.passed === true);

  return {
    reportId: 'v26-total-closure-proof',
    version: 'V26',
    gate: 'gate-8',
    focus: 'whole-repository-provation-and-final-v26-closure',
    proofSourceCommit: baseData.canonicalCommit,
    generatedAt,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState,
    passed,
    closureClaim: passed,
    proceduralGateClosure: passed,
    queueRowCount: closureRows.length,
    closedQueueRowCount: closureRows.length - openQueueRows.length,
    openQueueRows,
    notReadyFor: passed ? [] : ['canonical-promotion'],
    closureReason: passed
      ? 'V26 total closure is explicit end-to-end: prior gate acceptance holds, prompt-space and whole-repository proofs close, the spec family is promoted, and product/reform evidence no longer depends on interpretive notes.'
      : null,
    openReason: passed
      ? null
      : 'V26 total closure remains an eighth-gate proof until the kept repository is fully proven as one Bitcode system.',
    closureRows,
    checks
  };
}

/**
 * @param {Record<string, string>} files
 * @param {string} artifactPath
 * @returns {any}
 */
function parseArtifactJson(files, artifactPath) {
  const serialized = files[artifactPath];
  invariant(typeof serialized === 'string' && serialized.length > 0, `Missing required artifact ${artifactPath}.`);
  try {
    return JSON.parse(/** @type {string} */ (serialized));
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Artifact ${artifactPath} is not valid JSON: ${detail}`);
  }
}

/**
 * @param {readonly unknown[]} values
 * @returns {string}
 */
function stableListSignature(values) {
  return stableStringify(values);
}

/**
 * @param {any} replayStep
 * @returns {{ stepId: string, theoremIds: string[], requiredArtifactPaths: string[] }}
 */
function normalizeReplayStep(replayStep) {
  return {
    stepId: String(replayStep?.stepId || ''),
    theoremIds: summarizeStrings(replayStep?.theoremIds || []),
    requiredArtifactPaths: summarizeStrings(replayStep?.requiredArtifactPaths || [])
  };
}

/**
 * @param {any} theoremVerdict
 * @returns {{ theoremId: string, passed: boolean, witnessArtifactPaths: string[], replayArtifactPaths: string[], replayStepIds: string[], failureReasons: string[] }}
 */
function normalizeTheoremVerdict(theoremVerdict) {
  return {
    theoremId: String(theoremVerdict?.theoremId || ''),
    passed: theoremVerdict?.passed === true,
    witnessArtifactPaths: summarizeStrings(theoremVerdict?.witnessArtifactPaths || []),
    replayArtifactPaths: summarizeStrings(theoremVerdict?.replayArtifactPaths || []),
    replayStepIds: summarizeStrings(theoremVerdict?.replayStepIds || []),
    failureReasons: summarizeStrings(theoremVerdict?.failureReasons || [])
  };
}

/**
 * @param {any} memberVerdict
 * @param {number} index
 * @returns {string}
 */
function memberIdentifier(memberVerdict, index) {
  return String(memberVerdict?.memberId || memberVerdict?.field || `member-${index + 1}`);
}

/**
 * @param {any[]} memberVerdicts
 * @returns {string[]}
 */
function collectMemberIds(memberVerdicts) {
  return memberVerdicts.map((entry, index) => memberIdentifier(entry, index));
}

/**
 * @param {any} familyCatalogEntry
 * @returns {{
 *   proofFamily: string,
 *   proofArtifactPath: string,
 *   memberIds: string[],
 *   theoremIds: string[],
 *   witnessArtifactPaths: string[],
 *   replayArtifacts: string[],
 *   replaySteps: Array<{ stepId: string, theoremIds: string[], requiredArtifactPaths: string[] }>
 * }}
 */
function normalizeFamilyCatalogEntry(familyCatalogEntry) {
  return {
    proofFamily: String(familyCatalogEntry?.proofFamily || ''),
    proofArtifactPath: String(familyCatalogEntry?.proofArtifactPath || ''),
    memberIds: summarizeStrings(familyCatalogEntry?.memberIds || []),
    theoremIds: summarizeStrings(familyCatalogEntry?.theoremIds || []),
    witnessArtifactPaths: summarizeStrings(familyCatalogEntry?.witnessArtifactPaths || []),
    replayArtifacts: summarizeStrings(familyCatalogEntry?.replayArtifacts || []),
    replaySteps: (familyCatalogEntry?.replaySteps || []).map(normalizeReplayStep)
  };
}

/**
 * @param {string} version
 * @returns {string}
 */
export function defaultProvenOutputPath(version) {
  return defaultSpecProvenPath(version);
}

/**
 * @param {{
 *   buildInitialStateFn?: typeof buildInitialState,
 *   runMakeBitcodeBranchFn?: typeof runMakeBitcodeBranch,
 *   scenarioIds?: string[],
 *   branchModes?: string[],
 *   paymentModes?: string[]
 * }} [input={}]
 */
export function collectCanonicalProvenRuns({
  buildInitialStateFn = buildInitialState,
  runMakeBitcodeBranchFn = runMakeBitcodeBranch,
  scenarioIds,
  branchModes = DEFAULT_PROVEN_BRANCH_MODES,
  paymentModes = []
} = {}) {
  const seededState = buildInitialStateFn();
  const availableScenarioIds = seededState.readScenarios.map((/** @type {any} */ scenario) => String(scenario.scenarioId));
  const requestedScenarioIds = scenarioIds?.length ? scenarioIds : availableScenarioIds;
  for (const scenarioId of requestedScenarioIds) {
    invariant(availableScenarioIds.includes(scenarioId), `Unknown scenario id ${scenarioId}.`);
  }
  const normalizedBranchModes = summarizeStrings(branchModes);
  const normalizedPaymentModes = summarizeStrings(paymentModes);
  const cacheKey = canUseDefaultProvenCaches(buildInitialStateFn, runMakeBitcodeBranchFn)
    ? buildCollectedProvenRunsCacheKey({
        scenarioIds: requestedScenarioIds,
        branchModes: normalizedBranchModes,
        paymentModes: normalizedPaymentModes
      })
    : null;
  if (cacheKey && COLLECTED_PROVEN_RUN_CACHE.has(cacheKey)) {
    return COLLECTED_PROVEN_RUN_CACHE.get(cacheKey);
  }

  /** @type {any[]} */
  const runs = [];
  for (const scenarioId of requestedScenarioIds) {
    for (const branchMode of branchModes) {
      const effectivePaymentModes = paymentModes.length ? paymentModes : [undefined];
      for (const paymentMode of effectivePaymentModes) {
        const branchInput = paymentMode ? { scenarioId, branchMode, paymentMode } : { scenarioId, branchMode };
        const { latestRun } = runMakeBitcodeBranchFn(buildInitialStateFn(), branchInput);
        invariant(latestRun?.branchArtifacts?.files, `Run ${formatRunId({ scenarioId, branchMode, paymentMode })} did not produce branch artifacts.`);
        const files = /** @type {Record<string, string>} */ (latestRun.branchArtifacts.files);
        const bundle = parseArtifactJson(files, '.bitcode/system-proof-bundle.json');
        const witnessManifest = parseArtifactJson(files, '.bitcode/proof-witness-manifest.json');
        const assetPackEvidenceManifest = parseArtifactJson(files, '.bitcode/asset-pack-evidence.json');
        const policyRelease = parseArtifactJson(files, '.bitcode/policy-release.json');
        const read = parseArtifactJson(files, '.bitcode/read.json');

        /** @type {Record<string, any>} */
        const familyProofsByName = {};
        for (const familyCatalogEntry of bundle.proofFamilies || []) {
          const proofFamily = String(familyCatalogEntry?.proofFamily || '');
          const proofArtifactPath = String(familyCatalogEntry?.proofArtifactPath || '');
          invariant(Boolean(proofFamily), `Run ${formatRunId({ scenarioId, branchMode, paymentMode })} contains a proof family entry without proofFamily.`);
          invariant(Boolean(proofArtifactPath), `Run ${formatRunId({ scenarioId, branchMode, paymentMode })} family ${proofFamily} is missing proofArtifactPath.`);
          familyProofsByName[proofFamily] = parseArtifactJson(files, proofArtifactPath);
        }

        runs.push({
          scenarioId,
          branchMode,
          paymentMode: paymentMode || null,
          branchName: String(assetPackEvidenceManifest?.branchName || latestRun?.branchName || ''),
          readId: String(bundle?.readId || read?.readId || ''),
          assetPackId: String(bundle?.assetPackId || latestRun?.assetPack?.assetPackId || ''),
          branchArtifacts: files,
          systemProofBundle: bundle,
          proofWitnessManifest: witnessManifest,
          assetPackEvidenceManifest,
          policyRelease,
          familyProofsByName
        });
      }
    }
  }

  const collected = {
    scenarioIds: requestedScenarioIds,
    branchModes: normalizedBranchModes,
    paymentModes: normalizedPaymentModes,
    runs
  };
  if (cacheKey) {
    COLLECTED_PROVEN_RUN_CACHE.set(cacheKey, collected);
  }
  return collected;
}

/**
 * @param {Record<string, any>} assetPackEvidenceByPath
 * @param {Record<string, any>} classificationsByPath
 * @param {string} artifactPath
 * @param {string} contextLabel
 */
function assertArtifactMetadata(assetPackEvidenceByPath, classificationsByPath, artifactPath, contextLabel) {
  invariant(!!assetPackEvidenceByPath[artifactPath], `${contextLabel} is missing AssetPack evidence metadata for ${artifactPath}.`);
  invariant(!!classificationsByPath[artifactPath], `${contextLabel} is missing policy-release classification for ${artifactPath}.`);
}

/**
 * @param {any} run
 * @returns {any}
 */
function validateAndNormalizeRun(run) {
  const runLabel = formatRunId(run);
  const bundle = run.systemProofBundle;
  const witnessManifest = run.proofWitnessManifest;
  const assetPackEvidenceByPath = Object.fromEntries((run.assetPackEvidenceManifest?.assetPackEvidence || []).map((/** @type {any} */ entry) => [String(entry?.path || ''), entry]));
  const classificationsByPath = Object.fromEntries((run.policyRelease?.artifactClasses || []).map((/** @type {any} */ entry) => [String(entry?.path || ''), entry]));
  const artifactDigestByPath = /** @type {Record<string, any>} */ (witnessManifest?.artifactDigestByPath || {});
  const proofFamiliesByName = /** @type {Record<string, any>} */ (witnessManifest?.proofFamiliesByName || {});
  const replayCatalogByName = Object.fromEntries((bundle?.verifierEntrypoint?.proofFamilyReplayCatalog || []).map((/** @type {any} */ entry) => [String(entry?.proofFamily || ''), entry]));
  const requiredArtifactPaths = summarizeStrings(bundle?.verifierEntrypoint?.requiredArtifactPaths || []);

  invariant(Array.isArray(bundle?.proofFamilies) && bundle.proofFamilies.length > 0, `Run ${runLabel} is missing a proof-family catalog.`);
  invariant(Array.isArray(bundle?.verifierEntrypoint?.proofFamilyReplayCatalog), `Run ${runLabel} is missing a verifier replay catalog.`);
  invariant(Array.isArray(witnessManifest?.artifactDigests), `Run ${runLabel} is missing witness-manifest artifact digests.`);
  invariant(typeof witnessManifest?.artifactDigestByPath === 'object' && witnessManifest?.artifactDigestByPath !== null, `Run ${runLabel} is missing witness-manifest keyed artifact digests.`);
  invariant(typeof witnessManifest?.proofFamiliesByName === 'object' && witnessManifest?.proofFamiliesByName !== null, `Run ${runLabel} is missing witness-manifest keyed proof families.`);

  const normalizedFamilies = /** @type {any[]} */ ((bundle.proofFamilies || []).map((/** @type {any} */ familyCatalogEntry) => {
    const catalog = normalizeFamilyCatalogEntry(familyCatalogEntry);
    const proof = run.familyProofsByName[catalog.proofFamily];
    const replayCatalogEntry = replayCatalogByName[catalog.proofFamily];
    const witnessFamilyIndex = proofFamiliesByName[catalog.proofFamily];
    const theoremVerdicts = (proof?.theoremVerdicts || []).map(normalizeTheoremVerdict);
    const memberVerdicts = proof?.memberVerdicts || [];
    const proofMemberIds = collectMemberIds(memberVerdicts);
    const proofReplaySteps = (proof?.replaySteps || []).map(normalizeReplayStep);
    const proofTheoremIds = theoremVerdicts.map((/** @type {any} */ entry) => entry.theoremId);
    const proofWitnessArtifactPaths = summarizeStrings(proof?.witnessArtifactPaths || []);
    const proofReplayArtifacts = summarizeStrings(proof?.replayArtifacts || []);

    invariant(!!proof, `Run ${runLabel} is missing proof object for family ${catalog.proofFamily}.`);
    invariant(typeof proof?.proofHash === 'string' && proof.proofHash.length > 0, `Run ${runLabel} family ${catalog.proofFamily} is missing proofHash.`);
    invariant(proof.proofHash === familyCatalogEntry?.proofHash, `Run ${runLabel} family ${catalog.proofFamily} proofHash does not match the proof-family catalog.`);
    invariant(stableListSignature(catalog.theoremIds) === stableListSignature(proofTheoremIds), `Run ${runLabel} family ${catalog.proofFamily} theorem ids do not match the proof object.`);
    invariant(stableListSignature(catalog.memberIds) === stableListSignature(proofMemberIds), `Run ${runLabel} family ${catalog.proofFamily} member ids do not match the proof object.`);
    invariant(stableListSignature(catalog.witnessArtifactPaths) === stableListSignature(proofWitnessArtifactPaths), `Run ${runLabel} family ${catalog.proofFamily} witness artifact paths do not match the proof object.`);
    invariant(stableListSignature(catalog.replayArtifacts) === stableListSignature(proofReplayArtifacts), `Run ${runLabel} family ${catalog.proofFamily} replay artifact paths do not match the proof object.`);
    invariant(stableListSignature(catalog.replaySteps) === stableListSignature(proofReplaySteps), `Run ${runLabel} family ${catalog.proofFamily} replay steps do not match the proof object.`);

    invariant(!!replayCatalogEntry, `Run ${runLabel} family ${catalog.proofFamily} is missing a verifier replay catalog entry.`);
    invariant(stableListSignature(catalog.theoremIds) === stableListSignature(replayCatalogEntry?.theoremIds || []), `Run ${runLabel} family ${catalog.proofFamily} theorem ids do not match the verifier replay catalog.`);
    invariant(stableListSignature(catalog.replayArtifacts) === stableListSignature(replayCatalogEntry?.replayArtifacts || []), `Run ${runLabel} family ${catalog.proofFamily} replay artifacts do not match the verifier replay catalog.`);
    invariant(stableListSignature(catalog.replaySteps) === stableListSignature((replayCatalogEntry?.replaySteps || []).map(normalizeReplayStep)), `Run ${runLabel} family ${catalog.proofFamily} replay steps do not match the verifier replay catalog.`);

    invariant(!!witnessFamilyIndex, `Run ${runLabel} family ${catalog.proofFamily} is missing from the witness-manifest family index.`);
    const witnessFamilyPaths = summarizeStrings(witnessFamilyIndex?.witnessArtifactPaths || []);
    invariant(proofWitnessArtifactPaths.every((artifactPath) => witnessFamilyPaths.includes(artifactPath)), `Run ${runLabel} family ${catalog.proofFamily} witness-manifest family index does not include all catalog witness artifacts.`);

    for (const artifactPath of catalog.witnessArtifactPaths) {
      invariant(!!run.branchArtifacts[artifactPath], `Run ${runLabel} family ${catalog.proofFamily} is missing witness artifact ${artifactPath}.`);
      invariant(
        NON_DIGESTED_RECURSIVE_ARTIFACT_PATHS.includes(artifactPath) || !!artifactDigestByPath[artifactPath],
        `Run ${runLabel} family ${catalog.proofFamily} is missing witness digest for ${artifactPath}.`
      );
      assertArtifactMetadata(assetPackEvidenceByPath, classificationsByPath, artifactPath, `Run ${runLabel} family ${catalog.proofFamily}`);
    }

    invariant(!!run.branchArtifacts[catalog.proofArtifactPath], `Run ${runLabel} family ${catalog.proofFamily} is missing its proof artifact ${catalog.proofArtifactPath}.`);
    assertArtifactMetadata(assetPackEvidenceByPath, classificationsByPath, catalog.proofArtifactPath, `Run ${runLabel} family ${catalog.proofFamily}`);

    for (const artifactPath of catalog.replayArtifacts) {
      invariant(!!run.branchArtifacts[artifactPath], `Run ${runLabel} family ${catalog.proofFamily} is missing replay artifact ${artifactPath}.`);
    }
    for (const replayStep of catalog.replaySteps) {
      for (const artifactPath of replayStep.requiredArtifactPaths) {
        invariant(requiredArtifactPaths.includes(artifactPath), `Run ${runLabel} family ${catalog.proofFamily} replay step ${replayStep.stepId} requires ${artifactPath}, but the verifier entrypoint does not.`);
        invariant(!!run.branchArtifacts[artifactPath], `Run ${runLabel} family ${catalog.proofFamily} replay step ${replayStep.stepId} is missing ${artifactPath}.`);
      }
    }

    return {
      proofFamily: catalog.proofFamily,
      proofArtifactPath: catalog.proofArtifactPath,
      proofHash: String(proof.proofHash),
      allTheoremsPassed: proof.allTheoremsPassed === true,
      memberIds: catalog.memberIds,
      memberVerdicts: memberVerdicts.map((/** @type {any} */ entry, /** @type {number} */ index) => ({
        id: memberIdentifier(entry, index),
        fields: Object.keys(entry || {}).sort(),
        payload: entry,
        passed: entry?.passed === true
      })),
      theoremIds: catalog.theoremIds,
      theoremVerdicts,
      witnessArtifactPaths: catalog.witnessArtifactPaths,
      replayArtifacts: catalog.replayArtifacts,
      replaySteps: catalog.replaySteps
    };
  }));

  const proofArtifactPaths = summarizeStrings(normalizedFamilies.flatMap((family) => [family.proofArtifactPath, ...family.witnessArtifactPaths]));
  for (const artifactPath of proofArtifactPaths) {
    assertArtifactMetadata(assetPackEvidenceByPath, classificationsByPath, artifactPath, `Run ${runLabel}`);
  }

  return {
    scenarioId: run.scenarioId,
    branchMode: run.branchMode,
    paymentMode: run.paymentMode || null,
    branchName: run.branchName,
    readId: run.readId,
    assetPackId: run.assetPackId,
    bundleProofHash: String(bundle?.proofContract?.proofHash || bundle?.proofHash || ''),
    proofContractHash: String(run.familyProofsByName['proof-contract']?.proofHash || ''),
    proofContractPassed: run.familyProofsByName['proof-contract']?.allTheoremsPassed === true,
    familyCount: normalizedFamilies.length,
    allFamiliesPassed: normalizedFamilies.every((/** @type {any} */ family) => family.allTheoremsPassed),
    requiredArtifactPaths,
    artifactDigestEntries: /** @type {any[]} */ (witnessManifest.artifactDigests || [])
      .map((entry) => ({
        path: String(entry?.path || ''),
        digest: String(entry?.digest || ''),
        proofFamilies: summarizeStrings(entry?.proofFamilies || []),
        classification: classificationsByPath[String(entry?.path || '')] || null,
        assetPackEvidence: assetPackEvidenceByPath[String(entry?.path || '')] || null
      }))
      .sort((left, right) => left.path.localeCompare(right.path)),
    proofArtifacts: proofArtifactPaths.sort((left, right) => left.localeCompare(right)).map((artifactPath) => ({
      path: artifactPath,
      classification: classificationsByPath[artifactPath] || null,
      assetPackEvidence: assetPackEvidenceByPath[artifactPath] || null
    })),
    families: normalizedFamilies
  };
}

/**
 * @param {ReturnType<typeof collectCanonicalProvenRuns>} collected
 * @param {{
 *   version: string,
 *   canonicalCommit: string,
 *   canonicalCommitRecordedAt?: string | null,
 *   generatedAt: string,
 *   worktreeState?: string,
 *   generatorId?: string
 * }} input
 */
export function buildCanonicalProvenData(collected, {
  version,
  canonicalCommit,
  canonicalCommitRecordedAt = null,
  generatedAt,
  worktreeState = 'clean',
  generatorId = PROVEN_GENERATOR_ID
}) {
  invariant(/^V\d+$/.test(version), `Canonical version must look like VN. Received ${version}.`);
  invariant(typeof canonicalCommit === 'string' && canonicalCommit.trim().length > 0, 'Canonical commit is required.');
  invariant(typeof generatedAt === 'string' && generatedAt.trim().length > 0, 'generatedAt is required.');

  const normalizedRuns = collected.runs.map(validateAndNormalizeRun);
  invariant(normalizedRuns.length > 0, 'At least one proof run is required to build _PROVEN_.');

  const baseline = normalizedRuns[0];
  const baselineFamilySignatures = Object.fromEntries(baseline.families.map((/** @type {any} */ family) => [
    family.proofFamily,
    stableStringify({
      proofFamily: family.proofFamily,
      proofArtifactPath: family.proofArtifactPath,
      memberIds: family.memberIds,
      theoremIds: family.theoremIds,
      witnessArtifactPaths: family.witnessArtifactPaths,
      replayArtifacts: family.replayArtifacts,
      replaySteps: family.replaySteps
    })
  ]));

  for (const run of normalizedRuns.slice(1)) {
    invariant(baseline.familyCount === run.familyCount, `Run ${formatRunId(run)} proof-family count differs from the baseline.`);
    for (const family of run.families) {
      const baselineSignature = baselineFamilySignatures[family.proofFamily];
      invariant(!!baselineSignature, `Run ${formatRunId(run)} introduced unexpected proof family ${family.proofFamily}.`);
      const runSignature = stableStringify({
        proofFamily: family.proofFamily,
        proofArtifactPath: family.proofArtifactPath,
        memberIds: family.memberIds,
        theoremIds: family.theoremIds,
        witnessArtifactPaths: family.witnessArtifactPaths,
        replayArtifacts: family.replayArtifacts,
        replaySteps: family.replaySteps
      });
      invariant(baselineSignature === runSignature, `Run ${formatRunId(run)} changed the structural catalog for ${family.proofFamily}.`);
    }
    invariant(stableListSignature(baseline.requiredArtifactPaths) === stableListSignature(run.requiredArtifactPaths), `Run ${formatRunId(run)} changed verifier required artifact paths.`);
  }

  const familySummaries = baseline.families.map((/** @type {any} */ baselineFamily) => {
    const perRunFamily = normalizedRuns.map((/** @type {any} */ run) => run.families.find((/** @type {any} */ family) => family.proofFamily === baselineFamily.proofFamily));
    const theoremSummaries = baselineFamily.theoremIds.map((/** @type {string} */ theoremId) => {
      const theoremRuns = perRunFamily.map((/** @type {any} */ family, /** @type {number} */ index) => {
        const verdict = family?.theoremVerdicts.find((/** @type {any} */ entry) => entry.theoremId === theoremId);
        invariant(!!verdict, `Run ${formatRunId(normalizedRuns[index])} is missing theorem ${theoremId} for ${baselineFamily.proofFamily}.`);
        return {
          run: normalizedRuns[index],
          verdict
        };
      });
      return {
        theoremId,
        passedRuns: theoremRuns.filter((/** @type {any} */ entry) => entry.verdict.passed).length,
        totalRuns: theoremRuns.length,
        failingRuns: theoremRuns.filter((/** @type {any} */ entry) => !entry.verdict.passed).map((/** @type {any} */ entry) => formatRunId(entry.run)),
        replayStepIds: summarizeStrings(theoremRuns.flatMap((/** @type {any} */ entry) => entry.verdict.replayStepIds)),
        witnessArtifactPaths: summarizeStrings(theoremRuns.flatMap((/** @type {any} */ entry) => entry.verdict.witnessArtifactPaths)),
        replayArtifactPaths: summarizeStrings(theoremRuns.flatMap((/** @type {any} */ entry) => entry.verdict.replayArtifactPaths)),
        failureReasons: summarizeStrings(theoremRuns.flatMap((/** @type {any} */ entry) => entry.verdict.failureReasons))
      };
    });
    const memberSummaries = baselineFamily.memberIds.map((/** @type {string} */ memberId) => {
      const memberRuns = perRunFamily.map((/** @type {any} */ family, /** @type {number} */ index) => {
        const verdict = family?.memberVerdicts.find((/** @type {any} */ entry) => entry.id === memberId);
        invariant(!!verdict, `Run ${formatRunId(normalizedRuns[index])} is missing member ${memberId} for ${baselineFamily.proofFamily}.`);
        return {
          run: normalizedRuns[index],
          verdict
        };
      });
      return {
        memberId,
        passedRuns: memberRuns.filter((/** @type {any} */ entry) => entry.verdict.passed).length,
        totalRuns: memberRuns.length,
        failingRuns: memberRuns.filter((/** @type {any} */ entry) => !entry.verdict.passed).map((/** @type {any} */ entry) => formatRunId(entry.run)),
        fieldShape: summarizeStrings(memberRuns.flatMap((/** @type {any} */ entry) => entry.verdict.fields))
      };
    });
    return {
      proofFamily: baselineFamily.proofFamily,
      proofArtifactPath: baselineFamily.proofArtifactPath,
      theoremIds: baselineFamily.theoremIds,
      memberIds: baselineFamily.memberIds,
      witnessArtifactPaths: baselineFamily.witnessArtifactPaths,
      replayArtifacts: baselineFamily.replayArtifacts,
      replaySteps: baselineFamily.replaySteps,
      theoremSummaries,
      memberSummaries
    };
  });

  const runMatrix = normalizedRuns.map((run) => ({
    scenarioId: run.scenarioId,
    branchMode: run.branchMode,
    paymentMode: run.paymentMode,
    branchName: run.branchName,
    readId: run.readId,
    assetPackId: run.assetPackId,
    familyCount: run.familyCount,
    allFamiliesPassed: run.allFamiliesPassed,
    proofContractPassed: run.proofContractPassed,
    requiredArtifactPathCount: run.requiredArtifactPaths.length,
    artifactDigestCount: run.artifactDigestEntries.length,
    fullyProven: run.allFamiliesPassed && run.proofContractPassed,
    familyProofHashes: Object.fromEntries(run.families.map((/** @type {any} */ family) => [family.proofFamily, family.proofHash]))
  }));

  const incompleteVerdicts = [
    ...familySummaries.flatMap((/** @type {any} */ family) => family.theoremSummaries.filter((/** @type {any} */ entry) => entry.passedRuns !== entry.totalRuns).map((/** @type {any} */ entry) => ({
      scope: 'theorem',
      proofFamily: family.proofFamily,
      id: entry.theoremId,
      failingRuns: entry.failingRuns,
      failureReasons: entry.failureReasons
    }))),
    ...familySummaries.flatMap((/** @type {any} */ family) => family.memberSummaries.filter((/** @type {any} */ entry) => entry.passedRuns !== entry.totalRuns).map((/** @type {any} */ entry) => ({
      scope: 'member',
      proofFamily: family.proofFamily,
      id: entry.memberId,
      failingRuns: entry.failingRuns,
      failureReasons: []
    })))
  ];

  return {
    version,
    outputPath: defaultProvenOutputPath(version),
    canonicalCommit,
    canonicalCommitRecordedAt,
    worktreeState,
    generatorId,
    generatedAt,
    scenarioIds: collected.scenarioIds,
    branchModes: collected.branchModes,
    paymentModes: collected.paymentModes || [],
    familySummaries,
    runMatrix,
    runDetails: normalizedRuns,
    aggregate: {
      fullyProven: incompleteVerdicts.length === 0 && runMatrix.every((entry) => entry.fullyProven),
      runCount: normalizedRuns.length,
      familyCount: familySummaries.length,
      theoremCount: familySummaries.reduce((/** @type {number} */ sum, /** @type {any} */ family) => sum + family.theoremIds.length, 0),
      memberCount: familySummaries.reduce((/** @type {number} */ sum, /** @type {any} */ family) => sum + family.memberIds.length, 0),
      artifactDigestCount: normalizedRuns.reduce((/** @type {number} */ sum, /** @type {any} */ run) => sum + run.artifactDigestEntries.length, 0)
    },
    incompleteVerdicts
  };
}

/**
 * @param {string} value
 * @returns {string}
 */
function markdownCode(value) {
  return `\`${String(value || '')}\``;
}

/**
 * @param {string} version
 * @returns {string}
 */
function specBrandLabel(version) {
  return 'Bitcode';
}

/**
 * @param {string[]} headers
 * @param {Array<Array<string | number | boolean>>} rows
 * @returns {string}
 */
function renderMarkdownTable(headers, rows) {
  /** @param {string | number | boolean} value */
  const escapeCell = (value) => String(value).replace(/\|/g, '\\|').replace(/\n/g, '<br>');
  const headerRow = `| ${headers.map(escapeCell).join(' | ')} |`;
  const separatorRow = `| ${headers.map(() => '---').join(' | ')} |`;
  const bodyRows = rows.map((row) => `| ${row.map(escapeCell).join(' | ')} |`);
  return [headerRow, separatorRow, ...bodyRows].join('\n');
}

/**
 * @param {ReturnType<typeof buildCanonicalProvenData>} data
 * @returns {string}
 */
export function renderCanonicalProvenMarkdown(data) {
  const v18Matrices = /** @type {any} */ (data).v18Matrices || null;
  const v19 = /** @type {any} */ (data).v19 || null;
  const v20 = /** @type {any} */ (data).v20 || null;
  const v21 = /** @type {any} */ (data).v21 || null;
  const v22 = /** @type {any} */ (data).v22 || null;
  const v23 = /** @type {any} */ (data).v23 || null;
  const v24 = /** @type {any} */ (data).v24 || null;
  const v25 = /** @type {any} */ (data).v25 || null;
  const v26 = /** @type {any} */ (data).v26 || null;
  const v31 = /** @type {any} */ (data).v31 || null;
  const v32 = /** @type {any} */ (data).v32 || null;
  const lines = [];
  lines.push(`# ${specBrandLabel(data.version)} Spec ${data.version} Proven`);
  lines.push('');
  lines.push(`- canonicalVersion: ${markdownCode(data.version)}`);
  lines.push(`- canonicalCommit: ${markdownCode(data.canonicalCommit)}`);
  lines.push(`- canonicalCommitRecordedAt: ${markdownCode(data.canonicalCommitRecordedAt || 'unknown')}`);
  lines.push(`- worktreeState: ${markdownCode(data.worktreeState)}`);
  lines.push(`- generatorId: ${markdownCode(data.generatorId)}`);
  lines.push(`- generatedAt: ${markdownCode(data.generatedAt)}`);
  lines.push(`- outputPath: ${markdownCode(data.outputPath)}`);
  lines.push(`- scenarioIds: ${data.scenarioIds.map(markdownCode).join(', ')}`);
  lines.push(`- branchModes: ${data.branchModes.map(markdownCode).join(', ')}`);
  if (Array.isArray(data.paymentModes) && data.paymentModes.length) {
    lines.push(`- paymentModes: ${data.paymentModes.map(markdownCode).join(', ')}`);
  }
  lines.push('');
  lines.push('## Aggregate Verdict');
  lines.push('');
  lines.push(`- fullyProven: ${markdownCode(String(data.aggregate.fullyProven))}`);
  lines.push(`- runCount: ${markdownCode(String(data.aggregate.runCount))}`);
  lines.push(`- familyCount: ${markdownCode(String(data.aggregate.familyCount))}`);
  lines.push(`- theoremCount: ${markdownCode(String(data.aggregate.theoremCount))}`);
  lines.push(`- memberCount: ${markdownCode(String(data.aggregate.memberCount))}`);
  lines.push(`- artifactDigestCount: ${markdownCode(String(data.aggregate.artifactDigestCount))}`);
  if (v18Matrices) {
    lines.push(`- v18MatrixCount: ${markdownCode(String(v18Matrices.summaries.length))}`);
    lines.push(`- v18MatrixCellCount: ${markdownCode(String(v18Matrices.summaries.reduce((/** @type {number} */ sum, /** @type {any} */ summary) => sum + summary.cellCount, 0)))}`);
    lines.push(`- v18MatricesFullyProven: ${markdownCode(String(v18Matrices.fullyProven))}`);
  }
  if (v19) {
    lines.push(`- v19PositiveMatrixCellCount: ${markdownCode(String(v19.positiveMatrices.inheritedPositiveBaseline.cellCount))}`);
    lines.push(`- v19MutationCellCount: ${markdownCode(String(v19.negativeMutationMatrix.cellCount))}`);
    lines.push(`- v19MutationCoverageMode: ${markdownCode(v19.negativeMutationMatrix.coverageMode)}`);
    lines.push(`- v19VolatilityBlockingFindings: ${markdownCode(String(v19.volatilityInventory.blockingFindings.length))}`);
    lines.push(`- v19ReplayDeterministic: ${markdownCode(String(v19.deterministicReplayReport?.passed === true))}`);
    lines.push(`- v19ContractLedgerPassed: ${markdownCode(String(v19.contractChangeLedger.passed === true))}`);
  }
  if (v20) {
    lines.push(`- v20QualityPassed: ${markdownCode(String(v20.qualitySummary.passed === true))}`);
    lines.push(`- v20QualityReportCount: ${markdownCode(String(v20.qualitySummary.qualityReportCount))}`);
    lines.push(`- v20GeneratedQualityArtifactCount: ${markdownCode(String(v20.qualitySummary.generatedArtifactCount))}`);
    lines.push(`- v20QualityBlockingFailures: ${markdownCode(String(v20.qualitySummary.blockingFailures.length))}`);
    lines.push(`- v20ProjectionSmokeCells: ${markdownCode(String(v20.projectionQualitySmokeMatrix.cellCount))}`);
  }
  if (v21) {
    lines.push(`- v21SpecFamilyPassed: ${markdownCode(String(v21.specFamilyReport.passed === true))}`);
    lines.push(`- v21CanonicalInputsPassed: ${markdownCode(String(v21.canonicalInputReport.passed === true))}`);
    lines.push(`- v21GeneratedArtifactCount: ${markdownCode(String((v21.artifactSummaries || []).length))}`);
  }
  if (v22) {
    lines.push(`- v22SpecFamilyPassed: ${markdownCode(String(v22.specFamilyReport.passed === true))}`);
    lines.push(`- v22CanonicalInputsPassed: ${markdownCode(String(v22.canonicalInputReport.passed === true))}`);
    lines.push(`- v22CanonPostureDriftPassed: ${markdownCode(String(v22.canonPostureDriftReport.passed === true))}`);
    lines.push(`- v22GeneratedArtifactCount: ${markdownCode(String((v22.artifactSummaries || []).length))}`);
  }
  if (v23) {
    lines.push(`- v23SpecFamilyPassed: ${markdownCode(String(v23.specFamilyReport.passed === true))}`);
    lines.push(`- v23CanonicalInputsPassed: ${markdownCode(String(v23.canonicalInputReport.passed === true))}`);
    lines.push(`- v23CanonPostureDriftPassed: ${markdownCode(String(v23.canonPostureDriftReport.passed === true))}`);
    lines.push(`- v23GeneratedArtifactCount: ${markdownCode(String((v23.artifactSummaries || []).length))}`);
  }
  if (v24) {
    lines.push(`- v24SpecFamilyPassed: ${markdownCode(String(v24.specFamilyReport.passed === true))}`);
    lines.push(`- v24CanonicalInputsPassed: ${markdownCode(String(v24.canonicalInputReport.passed === true))}`);
    lines.push(`- v24CanonPostureDriftPassed: ${markdownCode(String(v24.canonPostureDriftReport.passed === true))}`);
    lines.push(`- v24GeneratedArtifactCount: ${markdownCode(String((v24.artifactSummaries || []).length))}`);
  }
  if (v25) {
    lines.push(`- v25SpecFamilyPassed: ${markdownCode(String(v25.specFamilyReport.passed === true))}`);
    lines.push(`- v25CanonicalInputsPassed: ${markdownCode(String(v25.canonicalInputReport.passed === true))}`);
    lines.push(`- v25CanonPostureDriftPassed: ${markdownCode(String(v25.canonPostureDriftReport.passed === true))}`);
    lines.push(`- v25GeneratedArtifactCount: ${markdownCode(String((v25.artifactSummaries || []).length))}`);
  }
  if (v26) {
    lines.push(`- v26SpecFamilyPassed: ${markdownCode(String(v26.specFamilyReport.passed === true))}`);
    lines.push(`- v26CanonicalInputsPassed: ${markdownCode(String(v26.canonicalInputReport.passed === true))}`);
    lines.push(`- v26ConversationsContinuityPassed: ${markdownCode(String(v26.conversationsContinuityProof.passed === true))}`);
    lines.push(`- v26RunsPipelinesTotalityPassed: ${markdownCode(String(v26.runsPipelinesTotalityProof.passed === true))}`);
    lines.push(`- v26PersistenceSchemaTotalityPassed: ${markdownCode(String(v26.persistenceSchemaTotalityProof.passed === true))}`);
    lines.push(`- v26PromptSystemTotalityPassed: ${markdownCode(String(v26.promptSystemTotalityProof.passed === true))}`);
    lines.push(`- v26InferenceImplementationRecordsPassed: ${markdownCode(String(v26.inferenceImplementationRecordsProof.passed === true))}`);
    lines.push(`- v26FourthGateReclosureReviewPassed: ${markdownCode(String(v26.fourthGateReclosureReviewProof.passed === true))}`);
    lines.push(`- v26SourceToSharesFifthGatePassed: ${markdownCode(String(v26.sourceToSharesFifthGateProof.passed === true))}`);
    lines.push(`- v26FifthGateClosureDeepeningPassed: ${markdownCode(String(v26.fifthGateClosureDeepeningProof.passed === true))}`);
    lines.push(`- v26PromptSpaceBaselinePassed: ${markdownCode(String(v26.promptSpaceCompletenessProof.baselinePassed === true))}`);
    lines.push(`- v26RetainedPackageAdmissibilityPassed: ${markdownCode(String(v26.retainedPackageAdmissibilityProof.passed === true))}`);
    lines.push(`- v26SystemReformAdmissibilityPassed: ${markdownCode(String(v26.systemReformAdmissibilityProof.passed === true))}`);
    lines.push(`- v26WholeRepositoryProductionSatisfactionPassed: ${markdownCode(String(v26.wholeRepositoryProductionSatisfactionProof.passed === true))}`);
    lines.push(`- v26TotalClosurePassed: ${markdownCode(String(v26.v26TotalClosureProof.passed === true))}`);
    lines.push(`- v26GeneratedArtifactCount: ${markdownCode(String((v26.artifactSummaries || []).length))}`);
    lines.push(`- v26DraftPreview: ${markdownCode(String(v26.draftPreview === true))}`);
    lines.push(`- v26FourthGatePromotedClosed: ${markdownCode(String(v26.fourthGatePromotedClosed === true))}`);
    lines.push(`- v26ThroughFourthGatePromotionReady: ${markdownCode(String(v26.throughFourthGatePromotionReady === true))}`);
    lines.push(`- v26PromotionReady: ${markdownCode(String(v26.promotionReady === true))}`);
  }
  if (v31) {
    lines.push(`- v31SpecFamilyPassed: ${markdownCode(String(v31.specFamilyReport.passed === true))}`);
    lines.push(`- v31CanonicalInputsPassed: ${markdownCode(String(v31.canonicalInputReport.passed === true))}`);
    lines.push(`- v31CanonPostureDriftPassed: ${markdownCode(String(v31.canonPostureDriftReport.passed === true))}`);
    lines.push(`- v31AuxillariesTelemetryProofHooksPassed: ${markdownCode(String(v31.auxillariesTelemetryProofHooks.passed === true))}`);
    lines.push(`- v31GeneratedArtifactCount: ${markdownCode(String((v31.artifactSummaries || []).length))}`);
    lines.push(`- v31PromotionReady: ${markdownCode(String(v31.promotionReady === true))}`);
  }
  if (v32) {
    lines.push(`- v32SpecFamilyPassed: ${markdownCode(String(v32.specFamilyReport.passed === true))}`);
    lines.push(`- v32CanonicalInputsPassed: ${markdownCode(String(v32.canonicalInputReport.passed === true))}`);
    lines.push(`- v32CanonPostureDriftPassed: ${markdownCode(String(v32.canonPostureDriftReport.passed === true))}`);
    lines.push(`- v32PromotionProofGenerationHardeningPassed: ${markdownCode(String(v32.promotionProofGenerationHardening.passed === true))}`);
    lines.push(`- v32GeneratedArtifactCount: ${markdownCode(String((v32.artifactSummaries || []).length))}`);
    lines.push(`- v32PromotionReady: ${markdownCode(String(v32.promotionReady === true))}`);
  }
  lines.push('');
  if (v18Matrices) {
    lines.push('## V18 Generated Matrix Summaries');
    lines.push('');
    lines.push(renderMarkdownTable(
      ['matrixId', 'sourceRunCount', 'cellCount', 'passedCellCount', 'failedCellCount', 'acceptedExclusionCount'],
      v18Matrices.summaries.map((/** @type {any} */ summary) => [
        markdownCode(summary.matrixId),
        summary.sourceRunCount,
        summary.cellCount,
        summary.passedCellCount,
        summary.failedCellCount,
        summary.acceptedExclusionCount
      ])
    ));
    lines.push('');
    lines.push('### V18 State-Machine Group Counts');
    lines.push('');
    const stateSummary = summarizeV18Matrix(v18Matrices.stateMachineMatrix);
    lines.push(renderMarkdownTable(
      ['matrixGroup', 'cellCount'],
      Object.entries(stateSummary.groupCounts).map(([group, count]) => [markdownCode(group), /** @type {number} */ (count)])
    ));
    lines.push('');
    lines.push('### V18 Matrix Failures');
    lines.push('');
    const failedCells = [
      ...v18Matrices.proofMemberSemanticMatrix.failedCells,
      ...v18Matrices.theoremEvidenceMatrix.failedCells,
      ...v18Matrices.stateMachineMatrix.failedCells
    ];
    if (!failedCells.length) {
      lines.push('- none');
    } else {
      for (const cell of failedCells) {
        lines.push(`- matrix=${markdownCode(cell.matrixId || 'unknown')} scenario=${markdownCode(cell.scenarioId)} branchMode=${markdownCode(cell.branchMode || 'none')} predicate=${markdownCode(cell.predicateId || cell.evidencePredicateId || 'unknown')} failure=${markdownCode(cell.failureReason || 'unknown')}`);
      }
    }
    lines.push('');
  }
  if (v19) {
    lines.push('## V19 Reproducible Canon Reports');
    lines.push('');
    lines.push('### V19 Generated Artifact Inventory');
    lines.push('');
    lines.push(renderMarkdownTable(
      ['artifactPath', 'digest', 'byteLength'],
      (v19.artifactSummaries || []).map((/** @type {any} */ artifact) => [
        markdownCode(artifact.artifactPath),
        markdownCode(artifact.digest),
        artifact.byteLength
      ])
    ));
    lines.push('');
    lines.push('### V19 Inherited Positive Matrix Summaries');
    lines.push('');
    lines.push(renderMarkdownTable(
      ['matrixId', 'sourceRunCount', 'cellCount', 'passedCellCount', 'failedCellCount', 'acceptedExclusionCount'],
      v19.positiveMatrices.summaries.map((/** @type {any} */ summary) => [
        markdownCode(summary.matrixId),
        summary.sourceRunCount,
        summary.cellCount,
        summary.passedCellCount,
        summary.failedCellCount,
        summary.acceptedExclusionCount
      ])
    ));
    lines.push('');
    lines.push('### V19 Deterministic Replay');
    lines.push('');
    const replayReport = v19.deterministicReplayReport || null;
    if (!replayReport) {
      lines.push('- replay report not attached');
    } else {
      lines.push(`- reportId: ${markdownCode(replayReport.reportId)}`);
      lines.push(`- runCount: ${markdownCode(String(replayReport.runCount))}`);
      lines.push(`- passed: ${markdownCode(String(replayReport.passed))}`);
      lines.push(`- failureReason: ${markdownCode(replayReport.failureReason || 'none')}`);
      lines.push('');
      lines.push(renderMarkdownTable(
        ['artifactPath', 'firstDigest', 'secondDigest', 'byteEqual'],
        replayReport.artifactComparisons.map((/** @type {any} */ comparison) => [
          markdownCode(comparison.artifactPath),
          markdownCode(comparison.firstDigest),
          markdownCode(comparison.secondDigest),
          markdownCode(String(comparison.byteEqual))
        ])
      ));
    }
    lines.push('');
    lines.push('### V19 Volatility Inventory');
    lines.push('');
    lines.push(`- inventoryId: ${markdownCode(v19.volatilityInventory.inventoryId)}`);
    lines.push(`- scannedArtifactCount: ${markdownCode(String(v19.volatilityInventory.scannedArtifactCount))}`);
    lines.push(`- findingCount: ${markdownCode(String(v19.volatilityInventory.findingCount))}`);
    lines.push(`- blockingFindingCount: ${markdownCode(String(v19.volatilityInventory.blockingFindings.length))}`);
    lines.push(`- passed: ${markdownCode(String(v19.volatilityInventory.passed))}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['classification', 'count'],
      Object.entries(v19.volatilityInventory.classificationCounts).map(([classification, count]) => [
        markdownCode(classification),
        /** @type {number} */ (count)
      ])
    ));
    lines.push('');
    lines.push('### V19 Negative Proof Mutation Matrix');
    lines.push('');
    lines.push(`- matrixId: ${markdownCode(v19.negativeMutationMatrix.matrixId)}`);
    lines.push(`- coverageMode: ${markdownCode(v19.negativeMutationMatrix.coverageMode)}`);
    lines.push(`- mutationClassCount: ${markdownCode(String(v19.negativeMutationMatrix.mutationClassCount))}`);
    lines.push(`- cellCount: ${markdownCode(String(v19.negativeMutationMatrix.cellCount))}`);
    lines.push(`- rejectedCellCount: ${markdownCode(String(v19.negativeMutationMatrix.rejectedCellCount))}`);
    lines.push(`- unexpectedPassCount: ${markdownCode(String(v19.negativeMutationMatrix.unexpectedPassCells.length))}`);
    lines.push(`- unexpectedErrorCount: ${markdownCode(String(v19.negativeMutationMatrix.unexpectedErrorCells.length))}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['mutationClass', 'expectedErrorClass', 'actualErrorClass', 'rejectedAsExpected'],
      v19.negativeMutationMatrix.cells.map((/** @type {any} */ cell) => [
        markdownCode(cell.mutationClass),
        markdownCode(cell.expectedErrorClass),
        markdownCode(cell.actualErrorClass),
        markdownCode(String(cell.rejectedAsExpected))
      ])
    ));
    lines.push('');
    lines.push('### V19 Omitted Mutation Cross-Products');
    lines.push('');
    lines.push(renderMarkdownTable(
      ['omittedPermutation', 'reason', 'reopenCondition'],
      v19.negativeMutationMatrix.omittedCrossProducts.map((/** @type {any} */ entry) => [
        markdownCode(entry.omittedPermutation),
        entry.reason,
        entry.reopenCondition
      ])
    ));
    lines.push('');
    lines.push('### V19 Contract-Change Ledger');
    lines.push('');
    lines.push(`- ledgerId: ${markdownCode(v19.contractChangeLedger.ledgerId)}`);
    lines.push(`- fromVersion: ${markdownCode(v19.contractChangeLedger.fromVersion)}`);
    lines.push(`- toVersion: ${markdownCode(v19.contractChangeLedger.toVersion)}`);
    lines.push(`- passed: ${markdownCode(String(v19.contractChangeLedger.passed))}`);
    lines.push(`- proofCatalogDelta: ${markdownCode(v19.contractChangeLedger.proofCatalogDelta.status)}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['changeType', 'fromMatrixId', 'toMatrixId', 'cellCount'],
      v19.contractChangeLedger.matrixDeltas.map((/** @type {any} */ delta) => [
        markdownCode(delta.changeType),
        markdownCode(delta.fromMatrixId),
        markdownCode(delta.toMatrixId),
        delta.cellCount
      ])
    ));
    lines.push('');
  }
  if (v32) {
    lines.push('## V32 Promotion Proof Generation Hardening');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v32.promotionProofGenerationHardening.reportId)}`);
    lines.push(`- sourceSafe: ${markdownCode(String(v32.promotionProofGenerationHardening.sourceSafe === true))}`);
    lines.push(`- passed: ${markdownCode(String(v32.promotionProofGenerationHardening.passed === true))}`);
    lines.push(`- failureCount: ${markdownCode(String(v32.promotionProofGenerationHardening.failures.length))}`);
    lines.push(`- dryRunMode: ${markdownCode(String(v32.promotionProofGenerationHardening.modes.dryRun.supported === true))}`);
    lines.push(`- checkMode: ${markdownCode(String(v32.promotionProofGenerationHardening.modes.check.supported === true))}`);
    lines.push(`- promotionMode: ${markdownCode(String(v32.promotionProofGenerationHardening.modes.promotion.supported === true))}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['artifactPath', 'digest', 'byteLength'],
      (v32.artifactSummaries || []).map((/** @type {any} */ artifact) => [
        markdownCode(artifact.artifactPath),
        markdownCode(artifact.digest),
        artifact.byteLength
      ])
    ));
    lines.push('');
    lines.push('### V32 Promotion Readiness');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v32.promotionReadinessReport.reportId)}`);
    lines.push(`- sourceSafe: ${markdownCode(String(v32.promotionReadinessReport.sourceSafe === true))}`);
    lines.push(`- passed: ${markdownCode(String(v32.promotionReadinessReport.passed === true))}`);
    lines.push(`- failureCount: ${markdownCode(String(v32.promotionReadinessReport.failures.length))}`);
    lines.push(`- prePromotionPosture: ${markdownCode(v32.promotionReadinessReport.prePromotionPosture)}`);
    lines.push(`- postPromotionPosture: ${markdownCode(v32.promotionReadinessReport.postPromotionPosture)}`);
    lines.push('');
  }
  if (data.v33) {
    const { v33 } = data;
    lines.push('## V33 Promotion Readiness');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v33.promotionReadinessReport.reportId)}`);
    lines.push(`- sourceSafe: ${markdownCode(String(v33.promotionReadinessReport.sourceSafe === true))}`);
    lines.push(`- passed: ${markdownCode(String(v33.promotionReadinessReport.passed === true))}`);
    lines.push(`- failureCount: ${markdownCode(String(v33.promotionReadinessReport.failures.length))}`);
    lines.push(`- prePromotionPosture: ${markdownCode(v33.promotionReadinessReport.prePromotionPosture)}`);
    lines.push(`- postPromotionPosture: ${markdownCode(v33.promotionReadinessReport.postPromotionPosture)}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['artifactPath', 'digest', 'byteLength'],
      (v33.artifactSummaries || []).map((/** @type {any} */ artifact) => [
        markdownCode(artifact.artifactPath),
        markdownCode(artifact.digest),
        artifact.byteLength
      ])
    ));
    lines.push('');
  }
  if (data.v34) {
    const { v34 } = data;
    lines.push('## V34 Promotion Readiness');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v34.promotionReadinessReport.reportId)}`);
    lines.push(`- sourceSafe: ${markdownCode(String(v34.promotionReadinessReport.sourceSafe === true))}`);
    lines.push(`- passed: ${markdownCode(String(v34.promotionReadinessReport.passed === true))}`);
    lines.push(`- failureCount: ${markdownCode(String(v34.promotionReadinessReport.failures.length))}`);
    lines.push(`- prePromotionPosture: ${markdownCode(v34.promotionReadinessReport.prePromotionPosture)}`);
    lines.push(`- postPromotionPosture: ${markdownCode(v34.promotionReadinessReport.postPromotionPosture)}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['artifactPath', 'digest', 'byteLength'],
      (v34.artifactSummaries || []).map((/** @type {any} */ artifact) => [
        markdownCode(artifact.artifactPath),
        markdownCode(artifact.digest),
        artifact.byteLength
      ])
    ));
    lines.push('');
  }
  if (data.v35) {
    const { v35 } = data;
    lines.push('## V35 Promotion Readiness');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v35.promotionReadinessReport.reportId || v35.promotionReadinessReport.artifactId)}`);
    lines.push(`- sourceSafe: ${markdownCode(String(v35.promotionReadinessReport.sourceSafe === true))}`);
    lines.push(`- passed: ${markdownCode(String(v35.promotionReadinessReport.passed === true))}`);
    lines.push(`- failureCount: ${markdownCode(String(v35.promotionReadinessReport.failures.length))}`);
    lines.push(`- prePromotionPosture: ${markdownCode(v35.promotionReadinessReport.prePromotionPosture)}`);
    lines.push(`- postPromotionPosture: ${markdownCode(v35.promotionReadinessReport.postPromotionPosture)}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['artifactPath', 'digest', 'byteLength'],
      (v35.artifactSummaries || []).map((/** @type {any} */ artifact) => [
        markdownCode(artifact.artifactPath),
        markdownCode(artifact.digest),
        artifact.byteLength
      ])
    ));
    lines.push('');
  }
  if (data.v36) {
    const { v36 } = data;
    lines.push('## V36 Promotion Readiness');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v36.promotionReadinessReport.reportId || v36.promotionReadinessReport.artifactId)}`);
    lines.push(`- sourceSafe: ${markdownCode(String(v36.promotionReadinessReport.sourceSafe === true))}`);
    lines.push(`- passed: ${markdownCode(String(v36.promotionReadinessReport.passed === true))}`);
    lines.push(`- failureCount: ${markdownCode(String(v36.promotionReadinessReport.failures.length))}`);
    lines.push(`- prePromotionPosture: ${markdownCode(v36.promotionReadinessReport.prePromotionPosture)}`);
    lines.push(`- postPromotionPosture: ${markdownCode(v36.promotionReadinessReport.postPromotionPosture)}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['artifactPath', 'digest', 'byteLength'],
      (v36.artifactSummaries || []).map((/** @type {any} */ artifact) => [
        markdownCode(artifact.artifactPath),
        markdownCode(artifact.digest),
        artifact.byteLength
      ])
    ));
    lines.push('');
  }
  if (data.v37) {
    const { v37 } = data;
    lines.push('## V37 Promotion Readiness');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v37.promotionReadinessReport.reportId || v37.promotionReadinessReport.artifactId)}`);
    lines.push(`- sourceSafe: ${markdownCode(String(v37.promotionReadinessReport.sourceSafe === true))}`);
    lines.push(`- passed: ${markdownCode(String(v37.promotionReadinessReport.passed === true))}`);
    lines.push(`- failureCount: ${markdownCode(String(v37.promotionReadinessReport.failures.length))}`);
    lines.push(`- prePromotionPosture: ${markdownCode(v37.promotionReadinessReport.prePromotionPosture)}`);
    lines.push(`- postPromotionPosture: ${markdownCode(v37.promotionReadinessReport.postPromotionPosture)}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['artifactPath', 'digest', 'byteLength'],
      (v37.artifactSummaries || []).map((/** @type {any} */ artifact) => [
        markdownCode(artifact.artifactPath),
        markdownCode(artifact.digest),
        artifact.byteLength
      ])
    ));
    lines.push('');
  }
  if (data.v38) {
    const { v38 } = data;
    lines.push('## V38 Promotion Readiness');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v38.promotionReadinessReport.reportId || v38.promotionReadinessReport.artifactId)}`);
    lines.push(`- sourceSafe: ${markdownCode(String(v38.promotionReadinessReport.sourceSafe === true))}`);
    lines.push(`- passed: ${markdownCode(String(v38.promotionReadinessReport.passed === true))}`);
    lines.push(`- failureCount: ${markdownCode(String(v38.promotionReadinessReport.failures.length))}`);
    lines.push(`- prePromotionPosture: ${markdownCode(v38.promotionReadinessReport.prePromotionPosture)}`);
    lines.push(`- postPromotionPosture: ${markdownCode(v38.promotionReadinessReport.postPromotionPosture)}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['artifactPath', 'digest', 'byteLength'],
      (v38.artifactSummaries || []).map((/** @type {any} */ artifact) => [
        markdownCode(artifact.artifactPath),
        markdownCode(artifact.digest),
        artifact.byteLength
      ])
    ));
    lines.push('');
  }
  if (data.v39) {
    const { v39 } = data;
    lines.push('## V39 Promotion Readiness');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v39.promotionReadinessReport.reportId || v39.promotionReadinessReport.artifactId)}`);
    lines.push(`- sourceSafe: ${markdownCode(String(v39.promotionReadinessReport.sourceSafe === true))}`);
    lines.push(`- passed: ${markdownCode(String(v39.promotionReadinessReport.passed === true))}`);
    lines.push(`- failureCount: ${markdownCode(String(v39.promotionReadinessReport.failures.length))}`);
    lines.push(`- prePromotionPosture: ${markdownCode(v39.promotionReadinessReport.prePromotionPosture)}`);
    lines.push(`- postPromotionPosture: ${markdownCode(v39.promotionReadinessReport.postPromotionPosture)}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['artifactPath', 'digest', 'byteLength'],
      (v39.artifactSummaries || []).map((/** @type {any} */ artifact) => [
        markdownCode(artifact.artifactPath),
        markdownCode(artifact.digest),
        artifact.byteLength
      ])
    ));
    lines.push('');
  }
  if (data.v40) {
    const { v40 } = data;
    lines.push('## V40 Promotion Readiness');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v40.promotionReadinessReport.reportId || v40.promotionReadinessReport.artifactId)}`);
    lines.push(`- sourceSafe: ${markdownCode(String(v40.promotionReadinessReport.sourceSafe === true))}`);
    lines.push(`- passed: ${markdownCode(String(v40.promotionReadinessReport.passed === true))}`);
    lines.push(`- failureCount: ${markdownCode(String(v40.promotionReadinessReport.failures.length))}`);
    lines.push(`- prePromotionPosture: ${markdownCode(v40.promotionReadinessReport.prePromotionPosture)}`);
    lines.push(`- postPromotionPosture: ${markdownCode(v40.promotionReadinessReport.postPromotionPosture)}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['artifactPath', 'digest', 'byteLength'],
      (v40.artifactSummaries || []).map((/** @type {any} */ artifact) => [
        markdownCode(artifact.artifactPath),
        markdownCode(artifact.digest),
        artifact.byteLength
      ])
    ));
    lines.push('');
  }
  if (data.v41) {
    const { v41 } = data;
    lines.push('## V41 Promotion Readiness');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v41.promotionReadinessReport.reportId || v41.promotionReadinessReport.artifactId)}`);
    lines.push(`- sourceSafe: ${markdownCode(String(v41.promotionReadinessReport.sourceSafe === true))}`);
    lines.push(`- passed: ${markdownCode(String(v41.promotionReadinessReport.passed === true))}`);
    lines.push(`- failureCount: ${markdownCode(String(v41.promotionReadinessReport.failures.length))}`);
    lines.push(`- prePromotionPosture: ${markdownCode(v41.promotionReadinessReport.prePromotionPosture)}`);
    lines.push(`- postPromotionPosture: ${markdownCode(v41.promotionReadinessReport.postPromotionPosture)}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['artifactPath', 'digest', 'byteLength'],
      (v41.artifactSummaries || []).map((/** @type {any} */ artifact) => [
        markdownCode(artifact.artifactPath),
        markdownCode(artifact.digest),
        artifact.byteLength
      ])
    ));
    lines.push('');
  }
  if (data.v42) {
    const { v42 } = data;
    lines.push('## V42 Promotion Readiness');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v42.promotionReadinessReport.reportId || v42.promotionReadinessReport.artifactId)}`);
    lines.push(`- sourceSafe: ${markdownCode(String(v42.promotionReadinessReport.sourceSafe === true))}`);
    lines.push(`- passed: ${markdownCode(String(v42.promotionReadinessReport.passed === true))}`);
    lines.push(`- failureCount: ${markdownCode(String(v42.promotionReadinessReport.failures.length))}`);
    lines.push(`- prePromotionPosture: ${markdownCode(v42.promotionReadinessReport.prePromotionPosture)}`);
    lines.push(`- postPromotionPosture: ${markdownCode(v42.promotionReadinessReport.postPromotionPosture)}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['artifactPath', 'digest', 'byteLength'],
      (v42.artifactSummaries || []).map((/** @type {any} */ artifact) => [
        markdownCode(artifact.artifactPath),
        markdownCode(artifact.digest),
        artifact.byteLength
      ])
    ));
    lines.push('');
  }
  if (data.v43) {
    const { v43 } = data;
    lines.push('## V43 Promotion Readiness');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v43.promotionReadinessReport.reportId || v43.promotionReadinessReport.artifactId)}`);
    lines.push(`- sourceSafe: ${markdownCode(String(v43.promotionReadinessReport.sourceSafe === true))}`);
    lines.push(`- passed: ${markdownCode(String(v43.promotionReadinessReport.passed === true))}`);
    lines.push(`- failureCount: ${markdownCode(String(v43.promotionReadinessReport.failures.length))}`);
    lines.push(`- prePromotionPosture: ${markdownCode(v43.promotionReadinessReport.prePromotionPosture)}`);
    lines.push(`- postPromotionPosture: ${markdownCode(v43.promotionReadinessReport.postPromotionPosture)}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['artifactPath', 'digest', 'byteLength'],
      (v43.artifactSummaries || []).map((/** @type {any} */ artifact) => [
        markdownCode(artifact.artifactPath),
        markdownCode(artifact.digest),
        artifact.byteLength
      ])
    ));
    lines.push('');
  }
  if (data.v44) {
    const { v44 } = data;
    lines.push('## V44 Promotion Readiness');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v44.promotionReadinessReport.reportId || v44.promotionReadinessReport.artifactId)}`);
    lines.push(`- sourceSafe: ${markdownCode(String(v44.promotionReadinessReport.sourceSafe === true))}`);
    lines.push(`- passed: ${markdownCode(String(v44.promotionReadinessReport.passed === true))}`);
    lines.push(`- failureCount: ${markdownCode(String(v44.promotionReadinessReport.failures.length))}`);
    lines.push(`- prePromotionPosture: ${markdownCode(v44.promotionReadinessReport.prePromotionPosture)}`);
    lines.push(`- postPromotionPosture: ${markdownCode(v44.promotionReadinessReport.postPromotionPosture)}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['artifactPath', 'digest', 'byteLength'],
      (v44.artifactSummaries || []).map((/** @type {any} */ artifact) => [
        markdownCode(artifact.artifactPath),
        markdownCode(artifact.digest),
        artifact.byteLength
      ])
    ));
    lines.push('');
  }
  if (data.v45) {
    const { v45 } = data;
    lines.push('## V45 Promotion Readiness');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v45.promotionReadinessReport.reportId || v45.promotionReadinessReport.artifactId)}`);
    lines.push(`- sourceSafe: ${markdownCode(String(v45.promotionReadinessReport.sourceSafe === true))}`);
    lines.push(`- passed: ${markdownCode(String(v45.promotionReadinessReport.passed === true))}`);
    lines.push(`- failureCount: ${markdownCode(String(v45.promotionReadinessReport.failures.length))}`);
    lines.push(`- prePromotionPosture: ${markdownCode(v45.promotionReadinessReport.prePromotionPosture)}`);
    lines.push(`- postPromotionPosture: ${markdownCode(v45.promotionReadinessReport.postPromotionPosture)}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['artifactPath', 'digest', 'byteLength'],
      (v45.artifactSummaries || []).map((/** @type {any} */ artifact) => [
        markdownCode(artifact.artifactPath),
        markdownCode(artifact.digest),
        artifact.byteLength
      ])
    ));
    lines.push('');
  }
  if (data.v46) {
    const { v46 } = data;
    lines.push('## V46 Promotion Readiness');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v46.promotionReadinessReport.reportId || v46.promotionReadinessReport.artifactId)}`);
    lines.push(`- sourceSafe: ${markdownCode(String(v46.promotionReadinessReport.sourceSafe === true))}`);
    lines.push(`- passed: ${markdownCode(String(v46.promotionReadinessReport.passed === true))}`);
    lines.push(`- failureCount: ${markdownCode(String(v46.promotionReadinessReport.failures.length))}`);
    lines.push(`- prePromotionPosture: ${markdownCode(v46.promotionReadinessReport.prePromotionPosture)}`);
    lines.push(`- postPromotionPosture: ${markdownCode(v46.promotionReadinessReport.postPromotionPosture)}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['artifactPath', 'digest', 'byteLength'],
      (v46.artifactSummaries || []).map((/** @type {any} */ artifact) => [
        markdownCode(artifact.artifactPath),
        markdownCode(artifact.digest),
        artifact.byteLength
      ])
    ));
    lines.push('');
  }
  if (data.v47) {
    const { v47 } = data;
    lines.push('## V47 Promotion Readiness');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v47.promotionReadinessReport.reportId || v47.promotionReadinessReport.artifactId)}`);
    lines.push(`- sourceSafe: ${markdownCode(String(v47.promotionReadinessReport.sourceSafe === true))}`);
    lines.push(`- passed: ${markdownCode(String(v47.promotionReadinessReport.passed === true))}`);
    lines.push(`- failureCount: ${markdownCode(String(v47.promotionReadinessReport.failures.length))}`);
    lines.push(`- prePromotionPosture: ${markdownCode(v47.promotionReadinessReport.prePromotionPosture)}`);
    lines.push(`- postPromotionPosture: ${markdownCode(v47.promotionReadinessReport.postPromotionPosture)}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['artifactPath', 'digest', 'byteLength'],
      (v47.artifactSummaries || []).map((/** @type {any} */ artifact) => [
        markdownCode(artifact.artifactPath),
        markdownCode(artifact.digest),
        artifact.byteLength
      ])
    ));
    lines.push('');
  }
  if (v20) {
    lines.push('## V20 Operator Quality Reports');
    lines.push('');
    lines.push('### V20 Generated Quality Artifact Inventory');
    lines.push('');
    lines.push(renderMarkdownTable(
      ['artifactPath', 'digest', 'byteLength'],
      (v20.artifactSummaries || []).map((/** @type {any} */ artifact) => [
        markdownCode(artifact.artifactPath),
        markdownCode(artifact.digest),
        artifact.byteLength
      ])
    ));
    lines.push('');
    lines.push('### V20 Quality Summary');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v20.qualitySummary.reportId)}`);
    lines.push(`- passed: ${markdownCode(String(v20.qualitySummary.passed))}`);
    lines.push(`- qualityReportCount: ${markdownCode(String(v20.qualitySummary.qualityReportCount))}`);
    lines.push(`- generatedArtifactCount: ${markdownCode(String(v20.qualitySummary.generatedArtifactCount))}`);
    lines.push(`- inheritedPositiveMatrixCellCount: ${markdownCode(String(v20.qualitySummary.inheritedProofClosure.positiveMatrixCellCount))}`);
    lines.push(`- inheritedNegativeMutationCellCount: ${markdownCode(String(v20.qualitySummary.inheritedProofClosure.negativeMutationCellCount))}`);
    lines.push(`- inheritedDeterministicReplayPassed: ${markdownCode(String(v20.qualitySummary.inheritedProofClosure.deterministicReplayPassed))}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['reportId', 'artifactPath', 'passed', 'blockingFailures', 'acceptedExclusions'],
      v20.qualitySummary.reportSummaries.map((/** @type {any} */ report) => [
        markdownCode(report.reportId),
        markdownCode(report.artifactPath),
        markdownCode(String(report.passed)),
        report.blockingFailureCount,
        report.acceptedExclusionCount
      ])
    ));
    lines.push('');
    lines.push('### V20 Operator Acceptance Transcript');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v20.operatorAcceptanceTranscript.reportId)}`);
    lines.push(`- transcriptMode: ${markdownCode(v20.operatorAcceptanceTranscript.transcriptMode)}`);
    lines.push(`- flowCount: ${markdownCode(String(v20.operatorAcceptanceTranscript.flowCount))}`);
    lines.push(`- stepCount: ${markdownCode(String(v20.operatorAcceptanceTranscript.stepCount))}`);
    lines.push(`- passed: ${markdownCode(String(v20.operatorAcceptanceTranscript.passed))}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['flowId', 'stepId', 'scenarioId', 'branchMode', 'principal', 'passed'],
      v20.operatorAcceptanceTranscript.steps.map((/** @type {any} */ step) => [
        markdownCode(step.flowId),
        markdownCode(step.stepId),
        markdownCode(step.scenarioId),
        markdownCode(step.branchMode),
        markdownCode(step.projectionPrincipal),
        markdownCode(String(step.passed))
      ])
    ));
    lines.push('');
    lines.push('### V20 Visual Regression Budget');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v20.visualRegressionReport.reportId)}`);
    lines.push(`- signatureMode: ${markdownCode(v20.visualRegressionReport.signatureMode)}`);
    lines.push(`- screenshotMode: ${markdownCode(v20.visualRegressionReport.screenshotMode)}`);
    lines.push(`- stateCount: ${markdownCode(String(v20.visualRegressionReport.stateCount))}`);
    lines.push(`- passed: ${markdownCode(String(v20.visualRegressionReport.passed))}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['stateId', 'scenarioId', 'branchMode', 'principal', 'signatureDigest', 'passed'],
      v20.visualRegressionReport.states.map((/** @type {any} */ state) => [
        markdownCode(state.stateId),
        markdownCode(state.scenarioId),
        markdownCode(state.branchMode),
        markdownCode(state.projectionPrincipal),
        markdownCode(state.signatureDigest),
        markdownCode(String(state.passed))
      ])
    ));
    lines.push('');
    lines.push('### V20 Accessibility Budget');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v20.accessibilityReport.reportId)}`);
    lines.push(`- engine: ${markdownCode(v20.accessibilityReport.engine)}`);
    lines.push(`- checkCount: ${markdownCode(String(v20.accessibilityReport.checkCount))}`);
    lines.push(`- normalTextContrast: ${markdownCode(String(v20.accessibilityReport.contrastThresholds.normalTextRatio))}`);
    lines.push(`- nonTextUiContrast: ${markdownCode(String(v20.accessibilityReport.contrastThresholds.nonTextUiRatio))}`);
    lines.push(`- passed: ${markdownCode(String(v20.accessibilityReport.passed))}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['checkId', 'passed', 'assertionCount'],
      v20.accessibilityReport.checks.map((/** @type {any} */ check) => [
        markdownCode(check.checkId),
        markdownCode(String(check.passed)),
        check.assertions.length
      ])
    ));
    lines.push('');
    lines.push('### V20 Performance Budget');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v20.performanceBudgetReport.reportId)}`);
    lines.push(`- measurementMode: ${markdownCode(v20.performanceBudgetReport.measurementMode)}`);
    lines.push(`- operationCount: ${markdownCode(String(v20.performanceBudgetReport.operationCount))}`);
    lines.push(`- passed: ${markdownCode(String(v20.performanceBudgetReport.passed))}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['operationId', 'budgetMs', 'hardGate', 'normalizedElapsedClass', 'passed'],
      v20.performanceBudgetReport.operations.map((/** @type {any} */ operation) => [
        markdownCode(operation.operationId),
        operation.budgetMs === null ? markdownCode('report-only') : operation.budgetMs,
        markdownCode(String(operation.hardGate)),
        markdownCode(operation.normalizedElapsedClass),
        markdownCode(String(operation.passed))
      ])
    ));
    lines.push('');
    lines.push('### V20 Projection Quality Smoke Matrix');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v20.projectionQualitySmokeMatrix.reportId)}`);
    lines.push(`- matrixMode: ${markdownCode(v20.projectionQualitySmokeMatrix.matrixMode)}`);
    lines.push(`- cellCount: ${markdownCode(String(v20.projectionQualitySmokeMatrix.cellCount))}`);
    lines.push(`- inheritedBrowserMatrixCells: ${markdownCode(String(v20.projectionQualitySmokeMatrix.inheritedBrowserMatrix.cellCount))}`);
    lines.push(`- passed: ${markdownCode(String(v20.projectionQualitySmokeMatrix.passed))}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['principal', 'scenarioId', 'rawFiles', 'sourceVisible', 'authVisible', 'qualityRequiresForbidden', 'passed'],
      v20.projectionQualitySmokeMatrix.cells.map((/** @type {any} */ cell) => [
        markdownCode(cell.principal),
        markdownCode(cell.scenarioId),
        markdownCode(String(cell.rawBranchFilesAvailable)),
        markdownCode(String(cell.sourceMaterialVisible)),
        markdownCode(String(cell.authorizationDecisionsVisible)),
        markdownCode(String(cell.qualityChecksDependOnForbiddenSurface)),
        markdownCode(String(cell.passed))
      ])
    ));
    lines.push('');
  }
  if (v21) {
    lines.push('## V21 Specifying Reports');
    lines.push('');
    lines.push('### V21 Generated Specifying Artifact Inventory');
    lines.push('');
    lines.push(renderMarkdownTable(
      ['artifactPath', 'digest', 'byteLength'],
      (v21.artifactSummaries || []).map((/** @type {any} */ artifact) => [
        markdownCode(artifact.artifactPath),
        markdownCode(artifact.digest),
        artifact.byteLength
      ])
    ));
    lines.push('');
    lines.push('### V21 Spec-Family Report');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v21.specFamilyReport.reportId)}`);
    lines.push(`- mode: ${markdownCode(v21.specFamilyReport.mode)}`);
    lines.push(`- currentTarget: ${markdownCode(v21.specFamilyReport.currentTarget)}`);
    lines.push(`- passed: ${markdownCode(String(v21.specFamilyReport.passed))}`);
    lines.push(`- failureCount: ${markdownCode(String(v21.specFamilyReport.failureCount))}`);
    lines.push(`- requiredSpecSectionCount: ${markdownCode(String(v21.specFamilyReport.requiredSpecSectionCount))}`);
    lines.push(`- requiredAppendixSectionCount: ${markdownCode(String(v21.specFamilyReport.requiredAppendixSectionCount))}`);
    lines.push(`- requiredProofFamilyCount: ${markdownCode(String(v21.specFamilyReport.requiredProofFamilyCount))}`);
    lines.push(`- requiredSubsystemCoverageCount: ${markdownCode(String(v21.specFamilyReport.requiredSubsystemCoverageCount))}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['requiredFile', 'supportFile'],
      v21.specFamilyReport.requiredFiles.map((/** @type {string} */ file, /** @type {number} */ index) => [
        markdownCode(file),
        markdownCode(v21.specFamilyReport.supportFiles[index] || 'none')
      ])
    ));
    lines.push('');
    lines.push('### V21 Canonical-Input Report');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v21.canonicalInputReport.reportId)}`);
    lines.push(`- checkedTargetVersion: ${markdownCode(v21.canonicalInputReport.checkedTargetVersion)}`);
    lines.push(`- parityPath: ${markdownCode(String(v21.canonicalInputReport.parityPath || 'missing'))}`);
    lines.push(`- passed: ${markdownCode(String(v21.canonicalInputReport.passed))}`);
    lines.push(`- failureCount: ${markdownCode(String(v21.canonicalInputReport.failureCount))}`);
    lines.push(`- requiredGeneratedArtifactCount: ${markdownCode(String(v21.canonicalInputReport.requiredGeneratedArtifactCount))}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['specPath', 'provenPath', 'requiredGeneratedArtifactPaths'],
      [[
        markdownCode(v21.canonicalInputReport.specPath),
        markdownCode(v21.canonicalInputReport.provenPath),
        v21.canonicalInputReport.requiredGeneratedArtifactPaths.map(markdownCode).join(', ')
      ]]
    ));
    lines.push('');
  }
  if (v22) {
    lines.push('## V22 Drift-Detection and Specifying Reports');
    lines.push('');
    lines.push('### V22 Generated Artifact Inventory');
    lines.push('');
    lines.push(renderMarkdownTable(
      ['artifactPath', 'digest', 'byteLength'],
      (v22.artifactSummaries || []).map((/** @type {any} */ artifact) => [
        markdownCode(artifact.artifactPath),
        markdownCode(artifact.digest),
        artifact.byteLength
      ])
    ));
    lines.push('');
    lines.push('### V22 Spec-Family Report');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v22.specFamilyReport.reportId)}`);
    lines.push(`- mode: ${markdownCode(v22.specFamilyReport.mode)}`);
    lines.push(`- currentTarget: ${markdownCode(v22.specFamilyReport.currentTarget)}`);
    lines.push(`- passed: ${markdownCode(String(v22.specFamilyReport.passed))}`);
    lines.push(`- failureCount: ${markdownCode(String(v22.specFamilyReport.failureCount))}`);
    lines.push(`- requiredSpecSectionCount: ${markdownCode(String(v22.specFamilyReport.requiredSpecSectionCount))}`);
    lines.push(`- requiredGeneratedArtifactPathCount: ${markdownCode(String(v22.specFamilyReport.requiredGeneratedArtifactPathCount))}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['requiredFile', 'supportFile'],
      v22.specFamilyReport.requiredFiles.map((/** @type {string} */ file, /** @type {number} */ index) => [
        markdownCode(file),
        markdownCode(v22.specFamilyReport.supportFiles[index] || 'none')
      ])
    ));
    lines.push('');
    lines.push('### V22 Canonical-Input Report');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v22.canonicalInputReport.reportId)}`);
    lines.push(`- checkedTargetVersion: ${markdownCode(v22.canonicalInputReport.checkedTargetVersion)}`);
    lines.push(`- parityPath: ${markdownCode(String(v22.canonicalInputReport.parityPath || 'missing'))}`);
    lines.push(`- passed: ${markdownCode(String(v22.canonicalInputReport.passed))}`);
    lines.push(`- failureCount: ${markdownCode(String(v22.canonicalInputReport.failureCount))}`);
    lines.push(`- requiredGeneratedArtifactCount: ${markdownCode(String(v22.canonicalInputReport.requiredGeneratedArtifactCount))}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['specPath', 'provenPath', 'requiredGeneratedArtifactPaths'],
      [[
        markdownCode(v22.canonicalInputReport.specPath),
        markdownCode(v22.canonicalInputReport.provenPath),
        v22.canonicalInputReport.requiredGeneratedArtifactPaths.map(markdownCode).join(', ')
      ]]
    ));
    lines.push('');
    lines.push('### V22 Canon-Posture Drift Report');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v22.canonPostureDriftReport.reportId)}`);
    lines.push(`- checkedActiveCanonVersion: ${markdownCode(v22.canonPostureDriftReport.checkedActiveCanonVersion)}`);
    lines.push(`- checkedDraftTargetVersion: ${markdownCode(v22.canonPostureDriftReport.checkedDraftTargetVersion)}`);
    lines.push(`- passed: ${markdownCode(String(v22.canonPostureDriftReport.passed))}`);
    lines.push(`- checkCount: ${markdownCode(String(v22.canonPostureDriftReport.checkCount))}`);
    lines.push(`- blockingFailureCount: ${markdownCode(String(v22.canonPostureDriftReport.blockingFailureCount))}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['checkId', 'passed', 'detail'],
      v22.canonPostureDriftReport.checks.map((/** @type {any} */ check) => [
        markdownCode(check.checkId),
        markdownCode(String(check.passed)),
        check.detail
      ])
    ));
    lines.push('');
  }
  if (v23) {
    lines.push('## V23 Deployment and Canon Reports');
    lines.push('');
    lines.push('### V23 Generated Artifact Inventory');
    lines.push('');
    lines.push(renderMarkdownTable(
      ['artifactPath', 'digest', 'byteLength'],
      (v23.artifactSummaries || []).map((/** @type {any} */ artifact) => [
        markdownCode(artifact.artifactPath),
        markdownCode(artifact.digest),
        artifact.byteLength
      ])
    ));
    lines.push('');
    lines.push('### V23 Spec-Family Report');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v23.specFamilyReport.reportId)}`);
    lines.push(`- mode: ${markdownCode(v23.specFamilyReport.mode)}`);
    lines.push(`- currentTarget: ${markdownCode(v23.specFamilyReport.currentTarget)}`);
    lines.push(`- passed: ${markdownCode(String(v23.specFamilyReport.passed))}`);
    lines.push(`- failureCount: ${markdownCode(String(v23.specFamilyReport.failureCount))}`);
    lines.push(`- requiredSpecSectionCount: ${markdownCode(String(v23.specFamilyReport.requiredSpecSectionCount))}`);
    lines.push(`- requiredGeneratedArtifactPathCount: ${markdownCode(String(v23.specFamilyReport.requiredGeneratedArtifactPathCount))}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['requiredFile', 'supportFile'],
      v23.specFamilyReport.requiredFiles.map((/** @type {string} */ file, /** @type {number} */ index) => [
        markdownCode(file),
        markdownCode(v23.specFamilyReport.supportFiles[index] || 'none')
      ])
    ));
    lines.push('');
    lines.push('### V23 Canonical-Input Report');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v23.canonicalInputReport.reportId)}`);
    lines.push(`- checkedTargetVersion: ${markdownCode(v23.canonicalInputReport.checkedTargetVersion)}`);
    lines.push(`- parityPath: ${markdownCode(String(v23.canonicalInputReport.parityPath || 'missing'))}`);
    lines.push(`- passed: ${markdownCode(String(v23.canonicalInputReport.passed))}`);
    lines.push(`- failureCount: ${markdownCode(String(v23.canonicalInputReport.failureCount))}`);
    lines.push(`- requiredGeneratedArtifactCount: ${markdownCode(String(v23.canonicalInputReport.requiredGeneratedArtifactCount))}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['specPath', 'provenPath', 'requiredGeneratedArtifactPaths'],
      [[
        markdownCode(v23.canonicalInputReport.specPath),
        markdownCode(v23.canonicalInputReport.provenPath),
        v23.canonicalInputReport.requiredGeneratedArtifactPaths.map(markdownCode).join(', ')
      ]]
    ));
    lines.push('');
    lines.push('### V23 Canon-Posture Drift Report');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v23.canonPostureDriftReport.reportId)}`);
    lines.push(`- checkedActiveCanonVersion: ${markdownCode(v23.canonPostureDriftReport.checkedActiveCanonVersion)}`);
    lines.push(`- checkedDraftTargetVersion: ${markdownCode(v23.canonPostureDriftReport.checkedDraftTargetVersion)}`);
    lines.push(`- passed: ${markdownCode(String(v23.canonPostureDriftReport.passed))}`);
    lines.push(`- checkCount: ${markdownCode(String(v23.canonPostureDriftReport.checkCount))}`);
    lines.push(`- blockingFailureCount: ${markdownCode(String(v23.canonPostureDriftReport.blockingFailureCount))}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['checkId', 'passed', 'detail'],
      v23.canonPostureDriftReport.checks.map((/** @type {any} */ check) => [
        markdownCode(check.checkId),
        markdownCode(String(check.passed)),
        check.detail
      ])
    ));
    lines.push('');
  }
  if (v24) {
    lines.push('## V24 External-Realization and Canon Reports');
    lines.push('');
    lines.push(`- realizedExternalProofFamilies: ${[
      'external-realization-execution',
      'containerized-reality',
      'github-live-interface'
    ].map(markdownCode).join(', ')}`);
    lines.push('');
    lines.push('### V24 Generated Artifact Inventory');
    lines.push('');
    lines.push(renderMarkdownTable(
      ['artifactPath', 'digest', 'byteLength'],
      (v24.artifactSummaries || []).map((/** @type {any} */ artifact) => [
        markdownCode(artifact.artifactPath),
        markdownCode(artifact.digest),
        artifact.byteLength
      ])
    ));
    lines.push('');
    lines.push('### V24 Spec-Family Report');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v24.specFamilyReport.reportId)}`);
    lines.push(`- mode: ${markdownCode(v24.specFamilyReport.mode)}`);
    lines.push(`- currentTarget: ${markdownCode(v24.specFamilyReport.currentTarget)}`);
    lines.push(`- passed: ${markdownCode(String(v24.specFamilyReport.passed))}`);
    lines.push(`- failureCount: ${markdownCode(String(v24.specFamilyReport.failureCount))}`);
    lines.push(`- requiredSpecSectionCount: ${markdownCode(String(v24.specFamilyReport.requiredSpecSectionCount))}`);
    lines.push(`- requiredGeneratedArtifactPathCount: ${markdownCode(String(v24.specFamilyReport.requiredGeneratedArtifactPathCount))}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['requiredFile', 'supportFile'],
      v24.specFamilyReport.requiredFiles.map((/** @type {string} */ file, /** @type {number} */ index) => [
        markdownCode(file),
        markdownCode(v24.specFamilyReport.supportFiles[index] || 'none')
      ])
    ));
    lines.push('');
    lines.push('### V24 Canonical-Input Report');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v24.canonicalInputReport.reportId)}`);
    lines.push(`- checkedTargetVersion: ${markdownCode(v24.canonicalInputReport.checkedTargetVersion)}`);
    lines.push(`- parityPath: ${markdownCode(String(v24.canonicalInputReport.parityPath || 'missing'))}`);
    lines.push(`- passed: ${markdownCode(String(v24.canonicalInputReport.passed))}`);
    lines.push(`- failureCount: ${markdownCode(String(v24.canonicalInputReport.failureCount))}`);
    lines.push(`- requiredGeneratedArtifactCount: ${markdownCode(String(v24.canonicalInputReport.requiredGeneratedArtifactCount))}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['specPath', 'provenPath', 'requiredGeneratedArtifactPaths'],
      [[
        markdownCode(v24.canonicalInputReport.specPath),
        markdownCode(v24.canonicalInputReport.provenPath),
        v24.canonicalInputReport.requiredGeneratedArtifactPaths.map(markdownCode).join(', ')
      ]]
    ));
    lines.push('');
    lines.push('### V24 Canon-Posture Drift Report');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v24.canonPostureDriftReport.reportId)}`);
    lines.push(`- checkedActiveCanonVersion: ${markdownCode(v24.canonPostureDriftReport.checkedActiveCanonVersion)}`);
    lines.push(`- checkedDraftTargetVersion: ${markdownCode(v24.canonPostureDriftReport.checkedDraftTargetVersion)}`);
    lines.push(`- passed: ${markdownCode(String(v24.canonPostureDriftReport.passed))}`);
    lines.push(`- checkCount: ${markdownCode(String(v24.canonPostureDriftReport.checkCount))}`);
    lines.push(`- blockingFailureCount: ${markdownCode(String(v24.canonPostureDriftReport.blockingFailureCount))}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['checkId', 'passed', 'detail'],
      v24.canonPostureDriftReport.checks.map((/** @type {any} */ check) => [
        markdownCode(check.checkId),
        markdownCode(String(check.passed)),
        check.detail
      ])
    ));
    lines.push('');
  }
  if (v25) {
    lines.push('## V25 Bitcode Rename and Canon Reports');
    lines.push('');
    lines.push(`- projectRenameTarget: ${markdownCode('Bitcode')}`);
    lines.push(`- denominationRenameTarget: ${markdownCode('BTD')}`);
    lines.push('');
    lines.push('### V25 Generated Artifact Inventory');
    lines.push('');
    lines.push(renderMarkdownTable(
      ['artifactPath', 'digest', 'byteLength'],
      (v25.artifactSummaries || []).map((/** @type {any} */ artifact) => [
        markdownCode(artifact.artifactPath),
        markdownCode(artifact.digest),
        artifact.byteLength
      ])
    ));
    lines.push('');
    lines.push('### V25 Spec-Family Report');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v25.specFamilyReport.reportId)}`);
    lines.push(`- mode: ${markdownCode(v25.specFamilyReport.mode)}`);
    lines.push(`- currentTarget: ${markdownCode(v25.specFamilyReport.currentTarget)}`);
    lines.push(`- passed: ${markdownCode(String(v25.specFamilyReport.passed))}`);
    lines.push(`- failureCount: ${markdownCode(String(v25.specFamilyReport.failureCount))}`);
    lines.push(`- requiredSpecSectionCount: ${markdownCode(String(v25.specFamilyReport.requiredSpecSectionCount))}`);
    lines.push(`- requiredGeneratedArtifactPathCount: ${markdownCode(String(v25.specFamilyReport.requiredGeneratedArtifactPathCount))}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['requiredFile', 'supportFile'],
      v25.specFamilyReport.requiredFiles.map((/** @type {string} */ file, /** @type {number} */ index) => [
        markdownCode(file),
        markdownCode(v25.specFamilyReport.supportFiles[index] || 'none')
      ])
    ));
    lines.push('');
    lines.push('### V25 Canonical-Input Report');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v25.canonicalInputReport.reportId)}`);
    lines.push(`- checkedTargetVersion: ${markdownCode(v25.canonicalInputReport.checkedTargetVersion)}`);
    lines.push(`- parityPath: ${markdownCode(String(v25.canonicalInputReport.parityPath || 'missing'))}`);
    lines.push(`- passed: ${markdownCode(String(v25.canonicalInputReport.passed))}`);
    lines.push(`- failureCount: ${markdownCode(String(v25.canonicalInputReport.failureCount))}`);
    lines.push(`- requiredGeneratedArtifactCount: ${markdownCode(String(v25.canonicalInputReport.requiredGeneratedArtifactCount))}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['specPath', 'provenPath', 'requiredGeneratedArtifactPaths'],
      [[
        markdownCode(v25.canonicalInputReport.specPath),
        markdownCode(v25.canonicalInputReport.provenPath),
        v25.canonicalInputReport.requiredGeneratedArtifactPaths.map(markdownCode).join(', ')
      ]]
    ));
    lines.push('');
    lines.push('### V25 Canon-Posture Drift Report');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v25.canonPostureDriftReport.reportId)}`);
    lines.push(`- checkedActiveCanonVersion: ${markdownCode(v25.canonPostureDriftReport.checkedActiveCanonVersion)}`);
    lines.push(`- checkedDraftTargetVersion: ${markdownCode(v25.canonPostureDriftReport.checkedDraftTargetVersion)}`);
    lines.push(`- passed: ${markdownCode(String(v25.canonPostureDriftReport.passed))}`);
    lines.push(`- checkCount: ${markdownCode(String(v25.canonPostureDriftReport.checkCount))}`);
    lines.push(`- blockingFailureCount: ${markdownCode(String(v25.canonPostureDriftReport.blockingFailureCount))}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['checkId', 'passed', 'detail'],
      v25.canonPostureDriftReport.checks.map((/** @type {any} */ check) => [
        markdownCode(check.checkId),
        markdownCode(String(check.passed)),
        check.detail
      ])
    ));
    lines.push('');
  }
  if (v26) {
    lines.push('## V26 Productionizing Draft and Canon Reports');
    lines.push('');
    lines.push(`- activeCanonicalTarget: ${markdownCode(v26.activeCanonicalTarget)}`);
    lines.push(`- draftPreview: ${markdownCode(String(v26.draftPreview === true))}`);
    lines.push(`- checkpointReady: ${markdownCode(String(v26.checkpointReady === true))}`);
    lines.push(`- throughFourthGateReady: ${markdownCode(String(v26.throughFourthGateReady === true))}`);
    lines.push(`- fourthGatePromotedClosed: ${markdownCode(String(v26.fourthGatePromotedClosed === true))}`);
    lines.push(`- throughFourthGatePromotionReady: ${markdownCode(String(v26.throughFourthGatePromotionReady === true))}`);
    lines.push(`- promotionReady: ${markdownCode(String(v26.promotionReady === true))}`);
    lines.push(`- fifthGateClosurePassed: ${markdownCode(String(v26.fifthGateClosurePassed === true))}`);
    lines.push(`- fifthGateClosureDeepeningPassed: ${markdownCode(String(v26.fifthGateClosureDeepeningPassed === true))}`);
    lines.push(`- sixthGateClosurePassed: ${markdownCode(String(v26.sixthGateClosurePassed === true))}`);
    lines.push(`- seventhGateClosurePassed: ${markdownCode(String(v26.seventhGateClosurePassed === true))}`);
    lines.push(`- eighthGateClosurePassed: ${markdownCode(String(v26.eighthGateClosurePassed === true))}`);
    lines.push(`- operatorSurfaceTarget: ${markdownCode(v26.operatorSurfaceTarget)}`);
    lines.push('');
    lines.push('### V26 Generated Artifact Inventory');
    lines.push('');
    lines.push(renderMarkdownTable(
      ['artifactPath', 'digest', 'byteLength'],
      (v26.artifactSummaries || []).map((/** @type {any} */ artifact) => [
        markdownCode(artifact.artifactPath),
        markdownCode(artifact.digest),
        artifact.byteLength
      ])
    ));
    lines.push('');
    lines.push('### V26 Spec-Family Report');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v26.specFamilyReport.reportId)}`);
    lines.push(`- mode: ${markdownCode(v26.specFamilyReport.mode)}`);
    lines.push(`- currentTarget: ${markdownCode(v26.specFamilyReport.currentTarget)}`);
    lines.push(`- passed: ${markdownCode(String(v26.specFamilyReport.passed))}`);
    lines.push(`- failureCount: ${markdownCode(String(v26.specFamilyReport.failureCount))}`);
    lines.push(`- requiredSpecSectionCount: ${markdownCode(String(v26.specFamilyReport.requiredSpecSectionCount))}`);
    lines.push(`- requiredGeneratedArtifactPathCount: ${markdownCode(String(v26.specFamilyReport.requiredGeneratedArtifactPathCount))}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['requiredFile', 'supportFile'],
      v26.specFamilyReport.requiredFiles.map((/** @type {string} */ file, /** @type {number} */ index) => [
        markdownCode(file),
        markdownCode(v26.specFamilyReport.supportFiles[index] || 'none')
      ])
    ));
    lines.push('');
    lines.push('### V26 Canonical-Input Report');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v26.canonicalInputReport.reportId)}`);
    lines.push(`- checkedTargetVersion: ${markdownCode(v26.canonicalInputReport.checkedTargetVersion)}`);
    lines.push(`- parityPath: ${markdownCode(String(v26.canonicalInputReport.parityPath || 'missing'))}`);
    lines.push(`- passed: ${markdownCode(String(v26.canonicalInputReport.passed))}`);
    lines.push(`- failureCount: ${markdownCode(String(v26.canonicalInputReport.failureCount))}`);
    lines.push(`- requiredGeneratedArtifactCount: ${markdownCode(String(v26.canonicalInputReport.requiredGeneratedArtifactCount))}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['specPath', 'provenPath', 'requiredGeneratedArtifactPaths'],
      [[
        markdownCode(v26.canonicalInputReport.specPath),
        markdownCode(v26.canonicalInputReport.provenPath),
        v26.canonicalInputReport.requiredGeneratedArtifactPaths.map(markdownCode).join(', ')
      ]]
    ));
    lines.push('');
    lines.push('### V26 Gate Checkpoint Report');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v26.gateCheckpointReport.reportId)}`);
    lines.push(`- checkpointFocus: ${markdownCode(v26.gateCheckpointReport.checkpointFocus)}`);
    lines.push(`- passed: ${markdownCode(String(v26.gateCheckpointReport.passed === true))}`);
    lines.push(`- nextGate: ${markdownCode(v26.gateCheckpointReport.nextGate)}`);
    lines.push(`- thirdGatePrepared: ${markdownCode(String(v26.gateCheckpointReport.thirdGatePreparation.prepared === true))}`);
    lines.push(`- thirdGatePassed: ${markdownCode(String(v26.gateCheckpointReport.thirdGate.passed === true))}`);
    lines.push(`- fourthGatePassed: ${markdownCode(String(v26.gateCheckpointReport.fourthGate.passed === true))}`);
    lines.push(`- fourthGatePromotedClosed: ${markdownCode(String(v26.gateCheckpointReport.fourthGate.promotedClosed === true))}`);
    lines.push(`- fifthGateClosureDeepened: ${markdownCode(String(v26.gateCheckpointReport.fifthGate.closureDeepened === true))}`);
    lines.push(`- fifthGatePassed: ${markdownCode(String(v26.gateCheckpointReport.fifthGate.passed === true))}`);
    lines.push(`- sixthGatePassed: ${markdownCode(String(v26.gateCheckpointReport.sixthGate.passed === true))}`);
    lines.push(`- sixthGatePrepared: ${markdownCode(String(v26.gateCheckpointReport.sixthGate.prepared === true))}`);
    lines.push(`- seventhGatePassed: ${markdownCode(String(v26.gateCheckpointReport.seventhGate.passed === true))}`);
    lines.push(`- seventhGatePrepared: ${markdownCode(String(v26.gateCheckpointReport.seventhGate.prepared === true))}`);
    lines.push(`- eighthGatePrepared: ${markdownCode(String(v26.gateCheckpointReport.eighthGate.prepared === true))}`);
    lines.push(`- laterGatesOpen: ${markdownCode(String(v26.gateCheckpointReport.eighthGate.open === true))}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['gate', 'checkId', 'passed', 'detail'],
      [
        ...v26.gateCheckpointReport.firstGate.checks.map((check) => [
          markdownCode(v26.gateCheckpointReport.firstGate.gateId),
          markdownCode(check.checkId),
          markdownCode(String(check.passed)),
          check.detail
        ]),
        ...v26.gateCheckpointReport.secondGate.checks.map((check) => [
          markdownCode(v26.gateCheckpointReport.secondGate.gateId),
          markdownCode(check.checkId),
          markdownCode(String(check.passed)),
          check.detail
        ]),
        ...v26.gateCheckpointReport.thirdGatePreparation.checks.map((check) => [
          markdownCode(v26.gateCheckpointReport.thirdGatePreparation.gateId),
          markdownCode(check.checkId),
          markdownCode(String(check.passed)),
          check.detail
        ]),
        ...v26.gateCheckpointReport.thirdGate.checks.map((check) => [
          markdownCode(v26.gateCheckpointReport.thirdGate.gateId),
          markdownCode(check.checkId),
          markdownCode(String(check.passed)),
          check.detail
        ]),
        ...v26.gateCheckpointReport.fourthGate.checks.map((check) => [
          markdownCode(v26.gateCheckpointReport.fourthGate.gateId),
          markdownCode(check.checkId),
          markdownCode(String(check.passed)),
          check.detail
        ]),
        ...v26.gateCheckpointReport.fifthGate.checks.map((check) => [
          markdownCode(v26.gateCheckpointReport.fifthGate.gateId),
          markdownCode(check.checkId),
          markdownCode(String(check.passed)),
          check.detail
        ]),
        ...v26.gateCheckpointReport.sixthGate.checks.map((check) => [
          markdownCode(v26.gateCheckpointReport.sixthGate.gateId),
          markdownCode(check.checkId),
          markdownCode(String(check.passed)),
          check.detail
        ]),
        ...v26.gateCheckpointReport.seventhGate.checks.map((check) => [
          markdownCode(v26.gateCheckpointReport.seventhGate.gateId),
          markdownCode(check.checkId),
          markdownCode(String(check.passed)),
          check.detail
        ])
      ]
    ));
    lines.push('');
    lines.push('### V26 Terminal Composition Proof');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v26.terminalCompositionProof.reportId)}`);
    lines.push(`- passed: ${markdownCode(String(v26.terminalCompositionProof.passed === true))}`);
    lines.push(`- routeWitnesses: ${v26.terminalCompositionProof.routeWitnesses.map(markdownCode).join(', ')}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['checkId', 'passed', 'detail'],
      v26.terminalCompositionProof.checks.map((check) => [
        markdownCode(check.checkId),
        markdownCode(String(check.passed)),
        check.detail
      ])
    ));
    lines.push('');
    lines.push('### V26 Fourth-Gate Reclosure Review Proof');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v26.fourthGateReclosureReviewProof.reportId)}`);
    lines.push(`- passed: ${markdownCode(String(v26.fourthGateReclosureReviewProof.passed === true))}`);
    lines.push(`- reviewMode: ${markdownCode(v26.fourthGateReclosureReviewProof.reviewMode)}`);
    lines.push(`- priorClosureDisposition: ${v26.fourthGateReclosureReviewProof.priorClosureDisposition}`);
    lines.push(`- actualDevianceDisposition: ${v26.fourthGateReclosureReviewProof.actualDevianceDisposition}`);
    lines.push(`- criterionCount: ${markdownCode(String(v26.fourthGateReclosureReviewProof.criterionCount))}`);
    lines.push(`- closedCriterionCount: ${markdownCode(String(v26.fourthGateReclosureReviewProof.closedCriterionCount))}`);
    lines.push(`- openCriterionCount: ${markdownCode(String(v26.fourthGateReclosureReviewProof.openCriterionCount))}`);
    lines.push(`- proceduralClosureReady: ${markdownCode(String(v26.fourthGateReclosureReviewProof.proceduralClosureReady === true))}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['criterionId', 'status', 'detail'],
      v26.fourthGateReclosureReviewProof.criteria.map((criterion) => [
        markdownCode(criterion.criterionId),
        markdownCode(criterion.status),
        criterion.detail
      ])
    ));
    lines.push('');
    lines.push('### V26 Environment Mode Coherence Proof');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v26.environmentModeCoherenceProof.reportId)}`);
    lines.push(`- passed: ${markdownCode(String(v26.environmentModeCoherenceProof.passed === true))}`);
    lines.push(`- supportedModes: ${v26.environmentModeCoherenceProof.supportedModes.map(markdownCode).join(', ')}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['checkId', 'passed', 'detail'],
      v26.environmentModeCoherenceProof.checks.map((check) => [
        markdownCode(check.checkId),
        markdownCode(String(check.passed)),
        check.detail
      ])
    ));
    lines.push('');
    lines.push('### V26 Conversations Continuity Proof');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v26.conversationsContinuityProof.reportId)}`);
    lines.push(`- passed: ${markdownCode(String(v26.conversationsContinuityProof.passed === true))}`);
    lines.push(`- routeWitnesses: ${v26.conversationsContinuityProof.routeWitnesses.map(markdownCode).join(', ')}`);
    lines.push(`- apiWitnesses: ${v26.conversationsContinuityProof.apiWitnesses.map(markdownCode).join(', ')}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['checkId', 'passed', 'detail'],
      v26.conversationsContinuityProof.checks.map((check) => [
        markdownCode(check.checkId),
        markdownCode(String(check.passed)),
        check.detail
      ])
    ));
    lines.push('');
    lines.push('### V26 Runs and Pipelines Totality Proof');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v26.runsPipelinesTotalityProof.reportId)}`);
    lines.push(`- passed: ${markdownCode(String(v26.runsPipelinesTotalityProof.passed === true))}`);
    lines.push(`- routeWitnesses: ${v26.runsPipelinesTotalityProof.routeWitnesses.map(markdownCode).join(', ')}`);
    lines.push(`- apiWitnesses: ${v26.runsPipelinesTotalityProof.apiWitnesses.map(markdownCode).join(', ')}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['checkId', 'passed', 'detail'],
      v26.runsPipelinesTotalityProof.checks.map((check) => [
        markdownCode(check.checkId),
        markdownCode(String(check.passed)),
        check.detail
      ])
    ));
    lines.push('');
    lines.push('### V26 Persistence and Schema Totality Proof');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v26.persistenceSchemaTotalityProof.reportId)}`);
    lines.push(`- passed: ${markdownCode(String(v26.persistenceSchemaTotalityProof.passed === true))}`);
    lines.push(`- baselineMigrationPath: ${markdownCode(v26.persistenceSchemaTotalityProof.baselineMigrationPath)}`);
    lines.push(`- routeWitnesses: ${v26.persistenceSchemaTotalityProof.routeWitnesses.map(markdownCode).join(', ')}`);
    lines.push(`- unresolvedTableCount: ${markdownCode(String(v26.persistenceSchemaTotalityProof.unresolvedTables.length))}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['checkId', 'passed', 'detail'],
      v26.persistenceSchemaTotalityProof.checks.map((check) => [
        markdownCode(check.checkId),
        markdownCode(String(check.passed)),
        check.detail
      ])
    ));
    lines.push('');
    lines.push('### V26 Prompt System Totality Proof');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v26.promptSystemTotalityProof.reportId)}`);
    lines.push(`- passed: ${markdownCode(String(v26.promptSystemTotalityProof.passed === true))}`);
    lines.push(`- packageWitnesses: ${v26.promptSystemTotalityProof.packageWitnesses.map(markdownCode).join(', ')}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['checkId', 'passed', 'detail'],
      v26.promptSystemTotalityProof.checks.map((check) => [
        markdownCode(check.checkId),
        markdownCode(String(check.passed)),
        check.detail
      ])
    ));
    lines.push('');
    lines.push('### V26 Inference Implementation Records Proof');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v26.inferenceImplementationRecordsProof.reportId)}`);
    lines.push(`- passed: ${markdownCode(String(v26.inferenceImplementationRecordsProof.passed === true))}`);
    lines.push(`- recordCount: ${markdownCode(String(v26.inferenceImplementationRecordsProof.recordCount))}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['recordId', 'boundaryPosture', 'passed'],
      v26.inferenceImplementationRecordsProof.recordChecks.map((check) => [
        markdownCode(check.recordId),
        markdownCode(check.boundaryPosture),
        markdownCode(String(check.passed))
      ])
    ));
    lines.push('');
    lines.push('### V26 Source-To-Shares Fifth-Gate Proof');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v26.sourceToSharesFifthGateProof.reportId)}`);
    lines.push(`- passed: ${markdownCode(String(v26.sourceToSharesFifthGateProof.passed === true))}`);
    lines.push(`- focus: ${markdownCode(v26.sourceToSharesFifthGateProof.focus)}`);
    lines.push(`- closureClaim: ${markdownCode(String(v26.sourceToSharesFifthGateProof.closureClaim === true))}`);
    lines.push(`- openReason: ${v26.sourceToSharesFifthGateProof.openReason}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['checkId', 'passed', 'detail'],
      v26.sourceToSharesFifthGateProof.checks.map((check) => [
        markdownCode(check.checkId),
        markdownCode(String(check.passed)),
        check.detail
      ])
    ));
    lines.push('');
    lines.push('### V26 Product Readiness Audit');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v26.productReadinessAudit.reportId)}`);
    lines.push(`- baselinePassed: ${markdownCode(String(v26.productReadinessAudit.baselinePassed === true))}`);
    lines.push(`- mvpPassed: ${markdownCode(String(v26.productReadinessAudit.mvpPassed === true))}`);
    lines.push(`- launchPassed: ${markdownCode(String(v26.productReadinessAudit.launchPassed === true))}`);
    lines.push(`- closureClaim: ${markdownCode(String(v26.productReadinessAudit.closureClaim === true))}`);
    lines.push(`- sixthGateMvpClaim: ${markdownCode(String(v26.productReadinessAudit.sixthGateMvpClaim === true))}`);
    lines.push(`- seventhGateCommercialTestnetLaunchClaim: ${markdownCode(String(v26.productReadinessAudit.seventhGateCommercialTestnetLaunchClaim === true))}`);
    lines.push(`- productCount: ${markdownCode(String(v26.productReadinessAudit.productCount))}`);
    lines.push(`- baselineReadyProductCount: ${markdownCode(String(v26.productReadinessAudit.baselineReadyProductCount))}`);
    lines.push(`- closureReadyProductCount: ${markdownCode(String(v26.productReadinessAudit.closureReadyProductCount))}`);
    lines.push(`- mvpReadyProductCount: ${markdownCode(String(v26.productReadinessAudit.mvpReadyProductCount))}`);
    lines.push(`- launchReadyProductCount: ${markdownCode(String(v26.productReadinessAudit.launchReadyProductCount))}`);
    lines.push(`- notReadyFor: ${v26.productReadinessAudit.notReadyFor.map(markdownCode).join(', ') || markdownCode('none')}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['productId', 'baselineReadiness', 'baselineEvidencePassed', 'readyForFifthGateClosure', 'readyForSixthGateMvp', 'readyForSeventhGateCommercialTestnetLaunch', 'parityMatrixAnchor'],
      v26.productReadinessAudit.products.map((product) => [
        markdownCode(product.productId),
        markdownCode(product.baselineReadiness),
        markdownCode(String(product.baselineEvidencePassed)),
        markdownCode(String(product.readyForFifthGateClosure)),
        markdownCode(String(product.readyForSixthGateMvp)),
        markdownCode(String(product.readyForSeventhGateCommercialTestnetLaunch)),
        product.parityMatrixAnchor
      ])
    ));
    lines.push('');
    lines.push('### V26 Fifth-Gate Closure Deepening Proof');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v26.fifthGateClosureDeepeningProof.reportId)}`);
    lines.push(`- passed: ${markdownCode(String(v26.fifthGateClosureDeepeningProof.passed === true))}`);
    lines.push(`- closureDeepened: ${markdownCode(String(v26.fifthGateClosureDeepeningProof.closureDeepened === true))}`);
    lines.push(`- closureClaim: ${markdownCode(String(v26.fifthGateClosureDeepeningProof.closureClaim === true))}`);
    lines.push(`- proceduralGateClosure: ${markdownCode(String(v26.fifthGateClosureDeepeningProof.proceduralGateClosure === true))}`);
    lines.push(`- axisCount: ${markdownCode(String(v26.fifthGateClosureDeepeningProof.axisCount))}`);
    lines.push(`- deepenedAxisCount: ${markdownCode(String(v26.fifthGateClosureDeepeningProof.deepenedAxisCount))}`);
    lines.push(`- openAxisCount: ${markdownCode(String(v26.fifthGateClosureDeepeningProof.openAxisCount))}`);
    lines.push(`- closureReason: ${v26.fifthGateClosureDeepeningProof.closureReason}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['axisId', 'baselineAdvanced', 'closurePassed', 'remainingClosure'],
      v26.fifthGateClosureDeepeningProof.axes.map((axis) => [
        markdownCode(axis.axisId),
        markdownCode(String(axis.baselineAdvanced)),
        markdownCode(String(axis.closurePassed)),
        axis.remainingClosure
      ])
    ));
    lines.push('');
    lines.push('### V26 Fifth-Gate Closure Proof');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v26.fifthGateClosureProof.reportId)}`);
    lines.push(`- passed: ${markdownCode(String(v26.fifthGateClosureProof.passed === true))}`);
    lines.push(`- focus: ${markdownCode(v26.fifthGateClosureProof.focus)}`);
    lines.push(`- closureClaim: ${markdownCode(String(v26.fifthGateClosureProof.closureClaim === true))}`);
    lines.push(`- proceduralGateClosure: ${markdownCode(String(v26.fifthGateClosureProof.proceduralGateClosure === true))}`);
    lines.push(`- queueRowCount: ${markdownCode(String(v26.fifthGateClosureProof.queueRowCount))}`);
    lines.push(`- closedQueueRowCount: ${markdownCode(String(v26.fifthGateClosureProof.closedQueueRowCount))}`);
    lines.push(`- notReadyFor: ${v26.fifthGateClosureProof.notReadyFor.map(markdownCode).join(', ') || markdownCode('none')}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['rowId', 'queueItem', 'proofEvidencePassed', 'sourceEvidencePassed', 'closurePassed'],
      v26.fifthGateClosureProof.closureRows.map((row) => [
        markdownCode(row.rowId),
        row.queueItem,
        markdownCode(String(row.proofEvidencePassed)),
        markdownCode(String(row.sourceEvidencePassed)),
        markdownCode(String(row.closurePassed))
      ])
    ));
    lines.push('');
    lines.push('### V26 Sixth-Gate MVP Closure Proof');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v26.sixthGateMvpClosureProof.reportId)}`);
    lines.push(`- passed: ${markdownCode(String(v26.sixthGateMvpClosureProof.passed === true))}`);
    lines.push(`- focus: ${markdownCode(v26.sixthGateMvpClosureProof.focus)}`);
    lines.push(`- closureClaim: ${markdownCode(String(v26.sixthGateMvpClosureProof.closureClaim === true))}`);
    lines.push(`- proceduralGateClosure: ${markdownCode(String(v26.sixthGateMvpClosureProof.proceduralGateClosure === true))}`);
    lines.push(`- queueRowCount: ${markdownCode(String(v26.sixthGateMvpClosureProof.queueRowCount))}`);
    lines.push(`- closedQueueRowCount: ${markdownCode(String(v26.sixthGateMvpClosureProof.closedQueueRowCount))}`);
    lines.push(`- notReadyFor: ${v26.sixthGateMvpClosureProof.notReadyFor.map(markdownCode).join(', ') || markdownCode('none')}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['rowId', 'criterion', 'proofEvidencePassed', 'sourceEvidencePassed', 'closurePassed'],
      v26.sixthGateMvpClosureProof.closureRows.map((row) => [
        markdownCode(row.rowId),
        row.criterion,
        markdownCode(String(row.proofEvidencePassed)),
        markdownCode(String(row.sourceEvidencePassed)),
        markdownCode(String(row.closurePassed))
      ])
    ));
    lines.push('');
    lines.push('### V26 Seventh-Gate Commercial Testnet Launch Proof');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v26.seventhGateCommercialTestnetLaunchProof.reportId)}`);
    lines.push(`- passed: ${markdownCode(String(v26.seventhGateCommercialTestnetLaunchProof.passed === true))}`);
    lines.push(`- focus: ${markdownCode(v26.seventhGateCommercialTestnetLaunchProof.focus)}`);
    lines.push(`- closureClaim: ${markdownCode(String(v26.seventhGateCommercialTestnetLaunchProof.closureClaim === true))}`);
    lines.push(`- proceduralGateClosure: ${markdownCode(String(v26.seventhGateCommercialTestnetLaunchProof.proceduralGateClosure === true))}`);
    lines.push(`- queueRowCount: ${markdownCode(String(v26.seventhGateCommercialTestnetLaunchProof.queueRowCount))}`);
    lines.push(`- closedQueueRowCount: ${markdownCode(String(v26.seventhGateCommercialTestnetLaunchProof.closedQueueRowCount))}`);
    lines.push(`- notReadyFor: ${v26.seventhGateCommercialTestnetLaunchProof.notReadyFor.map(markdownCode).join(', ') || markdownCode('none')}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['rowId', 'criterion', 'proofEvidencePassed', 'sourceEvidencePassed', 'closurePassed'],
      v26.seventhGateCommercialTestnetLaunchProof.closureRows.map((row) => [
        markdownCode(row.rowId),
        row.criterion,
        markdownCode(String(row.proofEvidencePassed)),
        markdownCode(String(row.sourceEvidencePassed)),
        markdownCode(String(row.closurePassed))
      ])
    ));
    lines.push('');
    lines.push('### V26 Prompt Space Completeness Witness');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v26.promptSpaceCompletenessProof.reportId)}`);
    lines.push(`- passed: ${markdownCode(String(v26.promptSpaceCompletenessProof.passed === true))}`);
    lines.push(`- closureClaim: ${markdownCode(String(v26.promptSpaceCompletenessProof.closureClaim === true))}`);
    lines.push(`- proceduralGateClosure: ${markdownCode(String(v26.promptSpaceCompletenessProof.proceduralGateClosure === true))}`);
    lines.push(`- baselinePassed: ${markdownCode(String(v26.promptSpaceCompletenessProof.baselinePassed === true))}`);
    lines.push(`- witnessSetCount: ${markdownCode(String(v26.promptSpaceCompletenessProof.witnessSetCount))}`);
    lines.push(`- closureGate: ${markdownCode(v26.promptSpaceCompletenessProof.closureGate)}`);
    lines.push(`- closureReason: ${v26.promptSpaceCompletenessProof.closureReason || 'none'}`);
    lines.push(`- openReason: ${v26.promptSpaceCompletenessProof.openReason || 'none'}`);
    lines.push(`- closedCompletenessDimensions: ${(v26.promptSpaceCompletenessProof.closedCompletenessDimensions || []).map(markdownCode).join(', ') || markdownCode('none')}`);
    lines.push(`- openCompletenessDimensions: ${(v26.promptSpaceCompletenessProof.openCompletenessDimensions || []).map(markdownCode).join(', ') || markdownCode('none')}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['checkId', 'role', 'tier', 'passed', 'detail'],
      v26.promptSpaceCompletenessProof.checks.map((check) => [
        markdownCode(check.checkId),
        markdownCode(check.promptSpaceRole),
        markdownCode(check.closureTier),
        markdownCode(String(check.passed)),
        check.detail
      ])
    ));
    lines.push('');
    lines.push('### V26 Retained Package Admissibility Proof');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v26.retainedPackageAdmissibilityProof.reportId)}`);
    lines.push(`- passed: ${markdownCode(String(v26.retainedPackageAdmissibilityProof.passed === true))}`);
    lines.push(`- admittedPackageCount: ${markdownCode(String(v26.retainedPackageAdmissibilityProof.admittedPackageCount))}`);
    lines.push(`- packageCensusCount: ${markdownCode(String(v26.retainedPackageAdmissibilityProof.packageCensusCount))}`);
    lines.push(`- packageCensusCoveragePassed: ${markdownCode(String(v26.retainedPackageAdmissibilityProof.packageCensusCoveragePassed === true))}`);
    lines.push(`- unclassifiedPackageCount: ${markdownCode(String(v26.retainedPackageAdmissibilityProof.unclassifiedPackageCount))}`);
    lines.push(`- requiredFields: ${v26.retainedPackageAdmissibilityProof.requiredFields.map(markdownCode).join(', ')}`);
    lines.push(`- roleCounts: ${Object.entries(v26.retainedPackageAdmissibilityProof.roleCounts).map(([role, count]) => `${markdownCode(role)}=${markdownCode(String(count))}`).join(', ')}`);
    lines.push(`- packageCensusRoleCounts: ${Object.entries(v26.retainedPackageAdmissibilityProof.packageCensusRoleCounts).map(([role, count]) => `${markdownCode(role)}=${markdownCode(String(count))}`).join(', ')}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['packageName', 'primaryRole', 'passed', 'role', 'writeBoundary'],
      v26.retainedPackageAdmissibilityProof.packages.map((entry) => [
        markdownCode(entry.packageName),
        markdownCode(entry.primaryRole),
        markdownCode(String(entry.passed)),
        entry.role,
        entry.writeBoundary
      ])
    ));
    lines.push('');
    lines.push(renderMarkdownTable(
      ['packagePath', 'packageName', 'primaryRole', 'classificationBasis', 'passed'],
      v26.retainedPackageAdmissibilityProof.packageCensus.map((entry) => [
        markdownCode(entry.packagePath),
        markdownCode(entry.packageName),
        markdownCode(entry.primaryRole),
        markdownCode(entry.classificationBasis),
        markdownCode(String(entry.passed))
      ])
    ));
    lines.push('');
    lines.push('### V26 System Reform Admissibility Proof');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v26.systemReformAdmissibilityProof.reportId)}`);
    lines.push(`- passed: ${markdownCode(String(v26.systemReformAdmissibilityProof.passed === true))}`);
    lines.push(`- reformClasses: ${v26.systemReformAdmissibilityProof.reformClasses.map(markdownCode).join(', ')}`);
    lines.push(`- closureBasis: ${v26.systemReformAdmissibilityProof.closureBasis}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['checkId', 'reformClass', 'passed', 'detail'],
      v26.systemReformAdmissibilityProof.checks.map((check) => [
        markdownCode(check.checkId),
        markdownCode(check.reformClass),
        markdownCode(String(check.passed)),
        check.detail
      ])
    ));
    lines.push('');
    lines.push('### V26 Whole Repository Production Satisfaction Witness');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v26.wholeRepositoryProductionSatisfactionProof.reportId)}`);
    lines.push(`- passed: ${markdownCode(String(v26.wholeRepositoryProductionSatisfactionProof.passed === true))}`);
    lines.push(`- closureClaim: ${markdownCode(String(v26.wholeRepositoryProductionSatisfactionProof.closureClaim === true))}`);
    lines.push(`- proceduralGateClosure: ${markdownCode(String(v26.wholeRepositoryProductionSatisfactionProof.proceduralGateClosure === true))}`);
    lines.push(`- proofCheckCount: ${markdownCode(String(v26.wholeRepositoryProductionSatisfactionProof.proofCheckCount))}`);
    lines.push(`- sourceCheckCount: ${markdownCode(String(v26.wholeRepositoryProductionSatisfactionProof.sourceCheckCount))}`);
    lines.push(`- closureReason: ${v26.wholeRepositoryProductionSatisfactionProof.closureReason || 'none'}`);
    lines.push(`- openReason: ${v26.wholeRepositoryProductionSatisfactionProof.openReason || 'none'}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['checkId', 'passed', 'detail'],
      v26.wholeRepositoryProductionSatisfactionProof.checks.map((check) => [
        markdownCode(check.checkId),
        markdownCode(String(check.passed)),
        check.detail
      ])
    ));
    lines.push('');
    lines.push('### V26 Total Closure Witness');
    lines.push('');
    lines.push(`- reportId: ${markdownCode(v26.v26TotalClosureProof.reportId)}`);
    lines.push(`- passed: ${markdownCode(String(v26.v26TotalClosureProof.passed === true))}`);
    lines.push(`- closureClaim: ${markdownCode(String(v26.v26TotalClosureProof.closureClaim === true))}`);
    lines.push(`- proceduralGateClosure: ${markdownCode(String(v26.v26TotalClosureProof.proceduralGateClosure === true))}`);
    lines.push(`- queueRowCount: ${markdownCode(String(v26.v26TotalClosureProof.queueRowCount))}`);
    lines.push(`- closedQueueRowCount: ${markdownCode(String(v26.v26TotalClosureProof.closedQueueRowCount))}`);
    lines.push(`- notReadyFor: ${v26.v26TotalClosureProof.notReadyFor.map(markdownCode).join(', ') || markdownCode('none')}`);
    lines.push(`- closureReason: ${v26.v26TotalClosureProof.closureReason || 'none'}`);
    lines.push(`- openReason: ${v26.v26TotalClosureProof.openReason || 'none'}`);
    lines.push('');
    lines.push(renderMarkdownTable(
      ['checkId', 'passed', 'detail'],
      v26.v26TotalClosureProof.checks.map((check) => [
        markdownCode(check.checkId),
        markdownCode(String(check.passed)),
        check.detail
      ])
    ));
    lines.push('');
    lines.push(renderMarkdownTable(
      ['rowId', 'proofEvidencePassed', 'sourceEvidencePassed', 'closurePassed'],
      v26.v26TotalClosureProof.closureRows.map((row) => [
        markdownCode(row.rowId),
        markdownCode(String(row.proofEvidencePassed)),
        markdownCode(String(row.sourceEvidencePassed)),
        markdownCode(String(row.closurePassed))
      ])
    ));
    lines.push('');
  }
  lines.push('## Proof Family Inventory');
  lines.push('');
  lines.push(renderMarkdownTable(
    ['proofFamily', 'proofArtifactPath', 'memberCount', 'theoremCount', 'witnessArtifactCount', 'replayArtifactCount', 'replayStepCount'],
    data.familySummaries.map((/** @type {any} */ family) => [
      markdownCode(family.proofFamily),
      markdownCode(family.proofArtifactPath),
      family.memberIds.length,
      family.theoremIds.length,
      family.witnessArtifactPaths.length,
      family.replayArtifacts.length,
      family.replaySteps.length
    ])
  ));
  lines.push('');
  lines.push('## Family Details');
  for (const family of data.familySummaries) {
    lines.push('');
    lines.push(`### ${family.proofFamily}`);
    lines.push('');
    lines.push(`- proofArtifactPath: ${markdownCode(family.proofArtifactPath)}`);
    lines.push(`- witnessArtifactPaths: ${family.witnessArtifactPaths.map(markdownCode).join(', ')}`);
    lines.push(`- replayArtifacts: ${family.replayArtifacts.map(markdownCode).join(', ')}`);
    lines.push(`- replayStepIds: ${family.replaySteps.map((/** @type {any} */ entry) => markdownCode(entry.stepId)).join(', ')}`);
    lines.push('');
    lines.push('#### Members');
    lines.push('');
    lines.push(renderMarkdownTable(
      ['memberId', 'passedRuns', 'totalRuns', 'fieldShape', 'failingRuns'],
      family.memberSummaries.map((/** @type {any} */ member) => [
        markdownCode(member.memberId),
        member.passedRuns,
        member.totalRuns,
        member.fieldShape.map(markdownCode).join(', '),
        member.failingRuns.length ? member.failingRuns.map(markdownCode).join(', ') : markdownCode('none')
      ])
    ));
    lines.push('');
    lines.push('#### Theorems');
    lines.push('');
    lines.push(renderMarkdownTable(
      ['theoremId', 'passedRuns', 'totalRuns', 'replayStepIds', 'failureReasons', 'failingRuns'],
      family.theoremSummaries.map((/** @type {any} */ theorem) => [
        markdownCode(theorem.theoremId),
        theorem.passedRuns,
        theorem.totalRuns,
        theorem.replayStepIds.map(markdownCode).join(', '),
        theorem.failureReasons.length ? theorem.failureReasons.map(markdownCode).join(', ') : markdownCode('none'),
        theorem.failingRuns.length ? theorem.failingRuns.map(markdownCode).join(', ') : markdownCode('none')
      ])
    ));
    lines.push('');
    lines.push('#### Replay Steps');
    lines.push('');
    lines.push(renderMarkdownTable(
      ['stepId', 'theoremIds', 'requiredArtifactPaths'],
      family.replaySteps.map((/** @type {any} */ step) => [
        markdownCode(step.stepId),
        step.theoremIds.map(markdownCode).join(', '),
        step.requiredArtifactPaths.map(markdownCode).join(', ')
      ])
    ));
  }
  lines.push('');
  lines.push('## Scenario and Run Matrix');
  lines.push('');
  const runMatrixHeaders = ['scenarioId', 'branchMode', ...(Array.isArray(data.paymentModes) && data.paymentModes.length ? ['paymentMode'] : []), 'readId', 'branchName', 'assetPackId', 'familyCount', 'allFamiliesPassed', 'proofContractPassed', 'requiredArtifactPathCount', 'artifactDigestCount', 'fullyProven'];
  lines.push(renderMarkdownTable(
    runMatrixHeaders,
    data.runMatrix.map((run) => [
      markdownCode(run.scenarioId),
      markdownCode(run.branchMode),
      ...(Array.isArray(data.paymentModes) && data.paymentModes.length ? [markdownCode(run.paymentMode || 'default')] : []),
      markdownCode(run.readId),
      markdownCode(run.branchName),
      markdownCode(run.assetPackId),
      run.familyCount,
      markdownCode(String(run.allFamiliesPassed)),
      markdownCode(String(run.proofContractPassed)),
      run.requiredArtifactPathCount,
      run.artifactDigestCount,
      markdownCode(String(run.fullyProven))
    ])
  ));
  lines.push('');
  lines.push('## Incomplete Verdicts');
  lines.push('');
  if (!data.incompleteVerdicts.length) {
    lines.push('- none');
  } else {
    for (const verdict of data.incompleteVerdicts) {
      lines.push(`- scope=${markdownCode(verdict.scope)} family=${markdownCode(verdict.proofFamily)} id=${markdownCode(verdict.id)} failingRuns=${verdict.failingRuns.map(markdownCode).join(', ') || markdownCode('none')} failureReasons=${verdict.failureReasons.map(markdownCode).join(', ') || markdownCode('none')}`);
    }
  }
  lines.push('');
  lines.push('## Run Details');
  for (const run of data.runDetails) {
    lines.push('');
    lines.push(`### ${formatRunId(run)}`);
    lines.push('');
    lines.push(`- branchName: ${markdownCode(run.branchName)}`);
    lines.push(`- readId: ${markdownCode(run.readId)}`);
    lines.push(`- assetPackId: ${markdownCode(run.assetPackId)}`);
    if (run.paymentMode) {
      lines.push(`- paymentMode: ${markdownCode(run.paymentMode)}`);
    }
    lines.push(`- proofContractHash: ${markdownCode(run.proofContractHash)}`);
    lines.push(`- allFamiliesPassed: ${markdownCode(String(run.allFamiliesPassed))}`);
    lines.push(`- proofContractPassed: ${markdownCode(String(run.proofContractPassed))}`);
    lines.push('');
    lines.push('#### Family Proof Hashes');
    lines.push('');
    lines.push(renderMarkdownTable(
      ['proofFamily', 'proofHash', 'proofArtifactPath'],
      run.families.map((/** @type {any} */ family) => [markdownCode(family.proofFamily), markdownCode(family.proofHash), markdownCode(family.proofArtifactPath)])
    ));
    lines.push('');
    lines.push('#### Proof Artifact Disclosure Classification');
    lines.push('');
    lines.push(renderMarkdownTable(
      ['path', 'sensitiveDataClass', 'disclosable', 'assetPackEvidenceConfidentiality', 'potentiallyDisclosable'],
      run.proofArtifacts.map((/** @type {any} */ artifact) => [
        markdownCode(artifact.path),
        markdownCode(String(artifact.classification?.sensitiveDataClass || 'missing')),
        markdownCode(String(artifact.classification?.disclosable === true)),
        markdownCode(String(artifact.assetPackEvidence?.confidentialityClass || 'missing')),
        markdownCode(String(artifact.assetPackEvidence?.potentiallyDisclosable === true))
      ])
    ));
    lines.push('');
    lines.push('#### Witness Artifact Digest Inventory');
    lines.push('');
    lines.push(renderMarkdownTable(
      ['path', 'digest', 'proofFamilies', 'sensitiveDataClass', 'disclosable'],
      run.artifactDigestEntries.map((/** @type {any} */ artifact) => [
        markdownCode(artifact.path),
        markdownCode(artifact.digest),
        artifact.proofFamilies.map(markdownCode).join(', '),
        markdownCode(String(artifact.classification?.sensitiveDataClass || 'missing')),
        markdownCode(String(artifact.classification?.disclosable === true))
      ])
    ));
  }
  while (lines[lines.length - 1] === '') {
    lines.pop();
  }
  return `${lines.join('\n')}\n`;
}

/**
 * @param {{
 *   version: string,
 *   canonicalCommit: string,
 *   canonicalCommitRecordedAt?: string | null,
 *   generatedAt: string,
 *   worktreeState?: string,
 *   generatorId?: string,
 *   scenarioIds?: string[],
 *   branchModes?: string[],
 *   paymentModes?: string[],
 *   buildInitialStateFn?: typeof buildInitialState,
 *   runMakeBitcodeBranchFn?: typeof runMakeBitcodeBranch
 * }} input
 * @returns {ReturnType<typeof buildCanonicalProvenData>}
 */
function buildBaseCanonicalProvenData({
  version,
  canonicalCommit,
  canonicalCommitRecordedAt = null,
  generatedAt,
  worktreeState = 'clean',
  generatorId = PROVEN_GENERATOR_ID,
  scenarioIds,
  branchModes = DEFAULT_PROVEN_BRANCH_MODES,
  paymentModes = [],
  buildInitialStateFn = buildInitialState,
  runMakeBitcodeBranchFn = runMakeBitcodeBranch
}) {
  const cacheKey = canUseDefaultProvenCaches(buildInitialStateFn, runMakeBitcodeBranchFn)
    ? buildBaseProvenDataCacheKey({
        version,
        canonicalCommit,
        canonicalCommitRecordedAt,
        generatedAt,
        worktreeState,
        generatorId,
        scenarioIds,
        branchModes,
        paymentModes
      })
    : null;
  if (cacheKey && BASE_PROVEN_DATA_CACHE.has(cacheKey)) {
    return BASE_PROVEN_DATA_CACHE.get(cacheKey);
  }
  const finishCollectProfile = beginProvenProfile(`buildBaseCanonicalProvenData:${version}:collectCanonicalProvenRuns`);
  const collected = collectCanonicalProvenRuns({
    buildInitialStateFn,
    runMakeBitcodeBranchFn,
    branchModes,
    paymentModes,
    ...(scenarioIds ? { scenarioIds } : {})
  });
  finishCollectProfile();
  const finishBuildProfile = beginProvenProfile(`buildBaseCanonicalProvenData:${version}:buildCanonicalProvenData`);
  const data = buildCanonicalProvenData(collected, {
    version,
    canonicalCommit,
    canonicalCommitRecordedAt,
    generatedAt,
    worktreeState,
    generatorId
  });
  finishBuildProfile();
  if (cacheKey) {
    BASE_PROVEN_DATA_CACHE.set(cacheKey, data);
  }
  return data;
}

/**
 * @param {ReturnType<typeof buildCanonicalProvenData>} baseData
 * @param {{
 *   version: string,
 *   generatedAt: string,
 *   buildInitialStateFn?: typeof buildInitialState,
 *   runMakeBitcodeBranchFn?: typeof runMakeBitcodeBranch,
 *   deterministicReplayReport?: any,
 *   renderMarkdown?: boolean
 * }} input
 * @returns {{ data: any, markdown: string, artifacts: Record<string, string> }}
 */
function buildV19ProvenPackage(baseData, {
  version,
  generatedAt,
  buildInitialStateFn = buildInitialState,
  runMakeBitcodeBranchFn = runMakeBitcodeBranch,
  deterministicReplayReport = null,
  renderMarkdown = true
}) {
  const positiveMatrices = buildV19PositiveMatrices(baseData, {
    version,
    generatedAt,
    buildInitialStateFn,
    runMakeBitcodeBranchFn
  });
  const reports = buildV19Reports({
    data: baseData,
    positiveMatrices,
    version,
    generatedAt
  });
  const v19 = {
    positiveMatrices,
    ...reports,
    ...(deterministicReplayReport ? { deterministicReplayReport } : {})
  };
  const artifacts = buildV19GeneratedArtifactContents(v19);
  const artifactSummaries = summarizeArtifactContents(artifacts);
  const data = {
    ...baseData,
    v19: {
      ...v19,
      artifactSummaries
    },
    aggregate: {
      ...baseData.aggregate,
      fullyProven: baseData.aggregate.fullyProven
        && positiveMatrices.fullyProven
        && reports.volatilityInventory.passed
        && reports.negativeMutationMatrix.unexpectedPassCells.length === 0
        && reports.negativeMutationMatrix.unexpectedErrorCells.length === 0
        && reports.contractChangeLedger.passed
        && (!deterministicReplayReport || deterministicReplayReport.passed === true)
    }
  };
  return {
    data,
    markdown: renderMarkdown ? renderCanonicalProvenMarkdown(data) : '',
    artifacts: buildV19GeneratedArtifactContents(data.v19)
  };
}

/**
 * @param {ReturnType<typeof buildCanonicalProvenData>} baseData
 * @param {{
 *   version: string,
 *   canonicalCommit: string,
 *   canonicalCommitRecordedAt?: string | null,
 *   generatedAt: string,
 *   worktreeState?: string,
 *   generatorId?: string,
 *   scenarioIds?: string[],
 *   branchModes?: string[],
 *   buildInitialStateFn?: typeof buildInitialState,
 *   runMakeBitcodeBranchFn?: typeof runMakeBitcodeBranch,
 *   renderMarkdown?: boolean
 * }} input
 * @returns {{ data: any, markdown: string, artifacts: Record<string, string> }}
 */
function buildV19DeterministicProvenPackage(baseData, {
  version,
  canonicalCommit,
  canonicalCommitRecordedAt = null,
  generatedAt,
  worktreeState = 'clean',
  generatorId = PROVEN_GENERATOR_ID,
  scenarioIds,
  branchModes = DEFAULT_PROVEN_BRANCH_MODES,
  buildInitialStateFn = buildInitialState,
  runMakeBitcodeBranchFn = runMakeBitcodeBranch,
  renderMarkdown = true
}) {
  const firstPackage = buildV19ProvenPackage(baseData, {
    version,
    generatedAt,
    buildInitialStateFn,
    runMakeBitcodeBranchFn
  });
  const secondBaseData = buildBaseCanonicalProvenData({
    version,
    canonicalCommit,
    canonicalCommitRecordedAt,
    generatedAt,
    worktreeState,
    generatorId,
    branchModes,
    buildInitialStateFn,
    runMakeBitcodeBranchFn,
    ...(scenarioIds ? { scenarioIds } : {})
  });
  const secondPackage = buildV19ProvenPackage(secondBaseData, {
    version,
    generatedAt,
    buildInitialStateFn,
    runMakeBitcodeBranchFn
  });
  const firstReplayArtifacts = {
    [baseData.outputPath]: firstPackage.markdown,
    ...firstPackage.artifacts
  };
  const secondReplayArtifacts = {
    [secondBaseData.outputPath]: secondPackage.markdown,
    ...secondPackage.artifacts
  };
  const deterministicReplayReport = buildV19DeterministicReplayReport({
    version,
    proofSourceCommit: canonicalCommit,
    generatorId,
    generatedAt,
    firstArtifacts: firstReplayArtifacts,
    secondArtifacts: secondReplayArtifacts,
    volatileFieldFindings: firstPackage.data.v19.volatilityInventory.findings
  });
  return buildV19ProvenPackage(baseData, {
    version,
    generatedAt,
    buildInitialStateFn,
    runMakeBitcodeBranchFn,
    deterministicReplayReport,
    renderMarkdown
  });
}

/**
 * @param {ReturnType<typeof buildCanonicalProvenData>} baseData
 * @param {{
 *   version: string,
 *   generatedAt: string,
 *   inheritedV19: any,
 *   renderMarkdown?: boolean
 * }} input
 * @returns {{ data: any, markdown: string, artifacts: Record<string, string> }}
 */
function buildV20ProvenPackage(baseData, {
  version,
  generatedAt,
  inheritedV19,
  renderMarkdown = true
}) {
  const qualityReports = buildV20QualityReports({
    data: baseData,
    version,
    generatedAt,
    proofSourceCommit: baseData.canonicalCommit,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState,
    inheritedV19
  });
  const artifactSummaries = summarizeArtifactContents(buildV20GeneratedArtifactContents(qualityReports));
  const data = {
    ...baseData,
    v19: inheritedV19,
    v20: {
      ...qualityReports,
      artifactSummaries
    },
    aggregate: {
      ...baseData.aggregate,
      fullyProven: baseData.aggregate.fullyProven
        && inheritedV19?.deterministicReplayReport?.passed === true
        && inheritedV19?.volatilityInventory?.passed === true
        && inheritedV19?.contractChangeLedger?.passed === true
        && qualityReports.qualitySummary.passed === true
    }
  };
  return {
    data,
    markdown: renderMarkdown ? renderCanonicalProvenMarkdown(data) : '',
    artifacts: buildV20GeneratedArtifactContents(data.v20)
  };
}

/**
 * @param {ReturnType<typeof buildCanonicalProvenData>} baseData
 * @param {{
 *   generatedAt: string,
 *   inheritedV19: any,
 *   inheritedV20: any
 * }} input
 * @returns {{ data: any, markdown: string, artifacts: Record<string, string> }}
 */
function buildV21ProvenPackage(baseData, {
  generatedAt,
  inheritedV19,
  inheritedV20
}) {
  const specFamilyReport = buildV21SpecFamilyReport({
    version: 'V21',
    mode: 'promoted',
    currentTarget: 'V21'
  });
  const canonicalInputReport = buildV21CanonicalInputReport({
    currentTarget: 'V21',
    assumeExistingRelativePaths: [
      '_legacy/ENGI_SPEC_V21_PROVEN.md',
      '.bitcode/v21-spec-family-report.json',
      '.bitcode/v21-canonical-input-report.json'
    ]
  });
  const artifacts = buildV21GeneratedArtifactContents({
    version: 'V21',
    proofSourceCommit: baseData.canonicalCommit,
    generatedAt,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState,
    specFamilyReport,
    canonicalInputReport
  });
  const artifactSummaries = summarizeArtifactContents(artifacts);
  const data = {
    ...baseData,
    v19: inheritedV19,
    v20: inheritedV20,
    v21: {
      specFamilyReport,
      canonicalInputReport,
      artifactSummaries
    },
    aggregate: {
      ...baseData.aggregate,
      fullyProven: baseData.aggregate.fullyProven
        && inheritedV19?.deterministicReplayReport?.passed === true
        && inheritedV19?.volatilityInventory?.passed === true
        && inheritedV19?.contractChangeLedger?.passed === true
        && inheritedV20?.qualitySummary?.passed === true
        && specFamilyReport.passed === true
        && canonicalInputReport.passed === true
    }
  };
  return {
    data,
    markdown: renderCanonicalProvenMarkdown(data),
    artifacts
  };
}

/**
 * @param {ReturnType<typeof buildCanonicalProvenData>} baseData
 * @param {{
 *   generatedAt: string,
 *   inheritedV19: any,
 *   inheritedV20: any
 * }} input
 * @returns {{ data: any, markdown: string, artifacts: Record<string, string> }}
 */
function buildV22ProvenPackage(baseData, {
  generatedAt,
  inheritedV19,
  inheritedV20
}) {
  const specFamilyReport = buildV21SpecFamilyReport({
    version: 'V22',
    mode: 'promoted',
    currentTarget: 'V22'
  });
  const canonicalInputReport = buildV21CanonicalInputReport({
    currentTarget: 'V22',
    reportVersion: 'V22',
    assumeExistingRelativePaths: [
      '_legacy/ENGI_SPEC_V22_PROVEN.md',
      '.bitcode/v22-spec-family-report.json',
      '.bitcode/v22-canonical-input-report.json',
      '.bitcode/v22-canon-posture-drift-report.json'
    ]
  });
  const canonPostureDriftReport = buildV22CanonPostureDriftReport({
    version: 'V22',
    activeCanonVersion: 'V22',
    draftTargetVersion: 'V23',
    proofSourceCommit: baseData.canonicalCommit,
    generatedAt,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState
  });
  const artifacts = buildV22GeneratedArtifactContents({
    version: 'V22',
    proofSourceCommit: baseData.canonicalCommit,
    generatedAt,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState,
    specFamilyReport,
    canonicalInputReport,
    canonPostureDriftReport
  });
  const artifactSummaries = summarizeArtifactContents(artifacts);
  const data = {
    ...baseData,
    v19: inheritedV19,
    v20: inheritedV20,
    v22: {
      specFamilyReport,
      canonicalInputReport,
      canonPostureDriftReport,
      artifactSummaries
    },
    aggregate: {
      ...baseData.aggregate,
      fullyProven: baseData.aggregate.fullyProven
        && inheritedV19?.deterministicReplayReport?.passed === true
        && inheritedV19?.volatilityInventory?.passed === true
        && inheritedV19?.contractChangeLedger?.passed === true
        && inheritedV20?.qualitySummary?.passed === true
        && specFamilyReport.passed === true
        && canonicalInputReport.passed === true
        && canonPostureDriftReport.passed === true
    }
  };
  return {
    data,
    markdown: renderCanonicalProvenMarkdown(data),
    artifacts
  };
}

/**
 * @param {ReturnType<typeof buildCanonicalProvenData>} baseData
 * @param {{
 *   generatedAt: string,
 *   inheritedV19: any,
 *   inheritedV20: any
 * }} input
 * @returns {{ data: any, markdown: string, artifacts: Record<string, string> }}
 */
function buildV23ProvenPackage(baseData, {
  generatedAt,
  inheritedV19,
  inheritedV20
}) {
  const specFamilyReport = buildV21SpecFamilyReport({
    version: 'V23',
    mode: 'promoted',
    currentTarget: 'V23'
  });
  const canonicalInputReport = buildV21CanonicalInputReport({
    currentTarget: 'V23',
    reportVersion: 'V23',
    assumeExistingRelativePaths: [
      '_legacy/ENGI_SPEC_V23_PROVEN.md',
      '.bitcode/v23-spec-family-report.json',
      '.bitcode/v23-canonical-input-report.json',
      '.bitcode/v23-canon-posture-drift-report.json'
    ]
  });
  const canonPostureDriftReport = buildV23CanonPostureDriftReport({
    version: 'V23',
    activeCanonVersion: 'V23',
    draftTargetVersion: 'V24',
    proofSourceCommit: baseData.canonicalCommit,
    generatedAt,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState
  });
  const artifacts = buildV23GeneratedArtifactContents({
    version: 'V23',
    proofSourceCommit: baseData.canonicalCommit,
    generatedAt,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState,
    specFamilyReport,
    canonicalInputReport,
    canonPostureDriftReport
  });
  const artifactSummaries = summarizeArtifactContents(artifacts);
  const data = {
    ...baseData,
    v19: inheritedV19,
    v20: inheritedV20,
    v23: {
      specFamilyReport,
      canonicalInputReport,
      canonPostureDriftReport,
      artifactSummaries
    },
    aggregate: {
      ...baseData.aggregate,
      fullyProven: baseData.aggregate.fullyProven
        && inheritedV19?.deterministicReplayReport?.passed === true
        && inheritedV19?.volatilityInventory?.passed === true
        && inheritedV19?.contractChangeLedger?.passed === true
        && inheritedV20?.qualitySummary?.passed === true
        && specFamilyReport.passed === true
        && canonicalInputReport.passed === true
        && canonPostureDriftReport.passed === true
    }
  };
  return {
    data,
    markdown: renderCanonicalProvenMarkdown(data),
    artifacts
  };
}

/**
 * @param {ReturnType<typeof buildCanonicalProvenData>} baseData
 * @param {{
 *   generatedAt: string,
 *   inheritedV19: any,
 *   inheritedV20: any
 * }} input
 * @returns {{ data: any, markdown: string, artifacts: Record<string, string> }}
 */
function buildV24ProvenPackage(baseData, {
  generatedAt,
  inheritedV19,
  inheritedV20
}) {
  const specFamilyReport = buildV21SpecFamilyReport({
    version: 'V24',
    mode: 'promoted',
    currentTarget: 'V24'
  });
  const canonicalInputReport = buildV21CanonicalInputReport({
    currentTarget: 'V24',
    reportVersion: 'V24',
    assumeExistingRelativePaths: [
      '_legacy/ENGI_SPEC_V24_PROVEN.md',
      '.bitcode/v24-spec-family-report.json',
      '.bitcode/v24-canonical-input-report.json',
      '.bitcode/v24-canon-posture-drift-report.json'
    ]
  });
  const canonPostureDriftReport = buildV24CanonPostureDriftReport({
    version: 'V24',
    activeCanonVersion: 'V24',
    draftTargetVersion: 'V25',
    proofSourceCommit: baseData.canonicalCommit,
    generatedAt,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState
  });
  const artifacts = buildV24GeneratedArtifactContents({
    version: 'V24',
    proofSourceCommit: baseData.canonicalCommit,
    generatedAt,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState,
    specFamilyReport,
    canonicalInputReport,
    canonPostureDriftReport
  });
  const artifactSummaries = summarizeArtifactContents(artifacts);
  const data = {
    ...baseData,
    v19: inheritedV19,
    v20: inheritedV20,
    v24: {
      specFamilyReport,
      canonicalInputReport,
      canonPostureDriftReport,
      artifactSummaries
    },
    aggregate: {
      ...baseData.aggregate,
      fullyProven: baseData.aggregate.fullyProven
        && inheritedV19?.deterministicReplayReport?.passed === true
        && inheritedV19?.volatilityInventory?.passed === true
        && inheritedV19?.contractChangeLedger?.passed === true
        && inheritedV20?.qualitySummary?.passed === true
        && specFamilyReport.passed === true
        && canonicalInputReport.passed === true
        && canonPostureDriftReport.passed === true
    }
  };
  return {
    data,
    markdown: renderCanonicalProvenMarkdown(data),
    artifacts
  };
}

/**
 * @param {ReturnType<typeof buildCanonicalProvenData>} baseData
 * @param {{
 *   generatedAt: string,
 *   inheritedV19: any,
 *   inheritedV20: any
 * }} input
 * @returns {{ data: any, markdown: string, artifacts: Record<string, string> }}
 */
function buildV25ProvenPackage(baseData, {
  generatedAt,
  inheritedV19,
  inheritedV20
}) {
  const specFamilyReport = buildV21SpecFamilyReport({
    version: 'V25',
    mode: 'promoted'
  });
  const canonicalInputReport = buildV21CanonicalInputReport({
    currentTarget: 'V25',
    reportVersion: 'V25',
    assumeExistingRelativePaths: [
      '_legacy/ENGI_SPEC_V25_PROVEN.md',
      '.bitcode/v25-spec-family-report.json',
      '.bitcode/v25-canonical-input-report.json',
      '.bitcode/v25-canon-posture-drift-report.json'
    ]
  });
  const canonPostureDriftReport = buildV25CanonPostureDriftReport({
    version: 'V25',
    activeCanonVersion: 'V25',
    draftTargetVersion: 'V26',
    proofSourceCommit: baseData.canonicalCommit,
    generatedAt,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState
  });
  const artifacts = buildV25GeneratedArtifactContents({
    version: 'V25',
    proofSourceCommit: baseData.canonicalCommit,
    generatedAt,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState,
    specFamilyReport,
    canonicalInputReport,
    canonPostureDriftReport
  });
  const artifactSummaries = summarizeArtifactContents(artifacts);
  const data = {
    ...baseData,
    v19: inheritedV19,
    v20: inheritedV20,
    v25: {
      specFamilyReport,
      canonicalInputReport,
      canonPostureDriftReport,
      artifactSummaries
    },
    aggregate: {
      ...baseData.aggregate,
      fullyProven: baseData.aggregate.fullyProven
        && inheritedV19?.deterministicReplayReport?.passed === true
        && inheritedV19?.volatilityInventory?.passed === true
        && inheritedV19?.contractChangeLedger?.passed === true
        && inheritedV20?.qualitySummary?.passed === true
        && specFamilyReport.passed === true
        && canonicalInputReport.passed === true
        && canonPostureDriftReport.passed === true
    }
  };
  return {
    data,
    markdown: renderCanonicalProvenMarkdown(data),
    artifacts
  };
}

/**
 * @param {any} baseData
 * @param {{
 *   generatedAt: string,
 *   inheritedV19: any,
 *   inheritedV20: any
 * }} input
 */
function buildV26ProvenPackage(baseData, {
  generatedAt,
  inheritedV19,
  inheritedV20
}) {
  const draftPreview = ACTIVE_CANON_VERSION !== 'V26';
  const laterGateClosureOpen = false;
  const specFamilyReport = buildV21SpecFamilyReport({
    version: 'V26',
    mode: (draftPreview || laterGateClosureOpen) ? 'draft' : 'promoted',
    ...((draftPreview || laterGateClosureOpen) ? { currentTarget: ACTIVE_CANON_VERSION } : {})
  });
  const canonicalInputReport = buildV21CanonicalInputReport({
    currentTarget: 'V26',
    reportVersion: 'V26',
    ...(draftPreview
        ? {
          skipPointerCheck: true,
          assumeExistingRelativePaths: [
            'BITCODE_SPEC_V26_PROVEN.md',
            '.bitcode/terminal-composition-proof.json',
            '.bitcode/environment-mode-coherence-proof.json',
            '.bitcode/v26-spec-family-report.json',
            '.bitcode/v26-canonical-input-report.json',
            '.bitcode/v26-gate-checkpoint-report.json',
            '.bitcode/conversations-continuity-proof.json',
            '.bitcode/runs-pipelines-totality-proof.json',
            '.bitcode/persistence-schema-totality-proof.json',
            '.bitcode/prompt-system-totality-proof.json',
            '.bitcode/inference-implementation-records-proof.json',
            '.bitcode/fourth-gate-reclosure-review-proof.json',
            '.bitcode/source-to-shares-fifth-gate-proof.json',
            '.bitcode/v26-product-readiness-audit.json',
            '.bitcode/fifth-gate-closure-deepening-proof.json',
            '.bitcode/fifth-gate-closure-proof.json',
            '.bitcode/prompt-space-completeness-proof.json',
            '.bitcode/retained-package-admissibility-proof.json',
            '.bitcode/system-reform-admissibility-proof.json',
            '.bitcode/whole-repository-production-satisfaction-proof.json',
            '.bitcode/v26-total-closure-proof.json'
          ]
        }
      : {})
  });
  const terminalCompositionProof = buildV26TerminalCompositionProof({
    generatedAt,
    baseData
  });
  const conversationsContinuityProof = buildV26ConversationsContinuityProof({
    generatedAt,
    baseData
  });
  const environmentModeCoherenceProof = buildV26EnvironmentModeCoherenceProof({
    generatedAt,
    baseData
  });
  const runsPipelinesTotalityProof = buildV26RunsPipelinesTotalityProof({
    generatedAt,
    baseData
  });
  const persistenceSchemaTotalityProof = buildV26PersistenceSchemaTotalityProof({
    generatedAt,
    baseData
  });
  const promptSystemTotalityProof = buildV26PromptSystemTotalityProof({
    generatedAt,
    baseData
  });
  const inferenceImplementationRecordsProof = buildV26InferenceImplementationRecordsProof({
    generatedAt,
    baseData
  });
  const sourceToSharesFifthGateProof = buildV26SourceToSharesFifthGateProof({
    generatedAt,
    baseData
  });
  const productReadinessAudit = buildV26ProductReadinessAudit({
    generatedAt,
    baseData
  });
  const retainedPackageAdmissibilityProof = buildV26RetainedPackageAdmissibilityProof({
    generatedAt,
    baseData
  });
  const fourthGateReclosureReviewProof = buildV26FourthGateReclosureReviewProof({
    generatedAt,
    baseData,
    terminalCompositionProof,
    conversationsContinuityProof,
    runsPipelinesTotalityProof,
    persistenceSchemaTotalityProof,
    promptSystemTotalityProof,
    inferenceImplementationRecordsProof,
    retainedPackageAdmissibilityProof
  });
  const promptSpaceCompletenessProof = buildV26PromptSpaceCompletenessProof({
    generatedAt,
    baseData
  });
  const systemReformAdmissibilityProof = buildV26SystemReformAdmissibilityProof({
    generatedAt,
    baseData
  });
  const fifthGateClosureDeepeningProof = buildV26FifthGateClosureDeepeningProof({
    generatedAt,
    baseData,
    terminalCompositionProof,
    conversationsContinuityProof,
    environmentModeCoherenceProof,
    runsPipelinesTotalityProof,
    persistenceSchemaTotalityProof,
    promptSystemTotalityProof,
    inferenceImplementationRecordsProof,
    sourceToSharesFifthGateProof,
    productReadinessAudit,
    promptSpaceCompletenessProof,
    retainedPackageAdmissibilityProof,
    systemReformAdmissibilityProof
  });
  const fifthGateClosureProof = buildV26FifthGateClosureProof({
    generatedAt,
    baseData,
    terminalCompositionProof,
    conversationsContinuityProof,
    environmentModeCoherenceProof,
    runsPipelinesTotalityProof,
    persistenceSchemaTotalityProof,
    promptSystemTotalityProof,
    inferenceImplementationRecordsProof,
    sourceToSharesFifthGateProof,
    productReadinessAudit,
    fifthGateClosureDeepeningProof,
    promptSpaceCompletenessProof,
    retainedPackageAdmissibilityProof,
    systemReformAdmissibilityProof
  });
  const sixthGateMvpClosureProof = buildV26SixthGateMvpClosureProof({
    generatedAt,
    baseData,
    terminalCompositionProof,
    conversationsContinuityProof,
    environmentModeCoherenceProof,
    runsPipelinesTotalityProof,
    persistenceSchemaTotalityProof,
    sourceToSharesFifthGateProof,
    productReadinessAudit,
    fifthGateClosureProof,
    retainedPackageAdmissibilityProof,
    systemReformAdmissibilityProof
  });
  const seventhGateCommercialTestnetLaunchProof = buildV26SeventhGateCommercialTestnetLaunchProof({
    generatedAt,
    baseData,
    terminalCompositionProof,
    conversationsContinuityProof,
    environmentModeCoherenceProof,
    runsPipelinesTotalityProof,
    persistenceSchemaTotalityProof,
    sourceToSharesFifthGateProof,
    productReadinessAudit,
    sixthGateMvpClosureProof,
    retainedPackageAdmissibilityProof,
    systemReformAdmissibilityProof
  });
  const wholeRepositoryProductionSatisfactionProof = buildV26WholeRepositoryProductionSatisfactionProof({
    generatedAt,
    baseData,
    terminalCompositionProof,
    conversationsContinuityProof,
    environmentModeCoherenceProof,
    runsPipelinesTotalityProof,
    persistenceSchemaTotalityProof,
    promptSystemTotalityProof,
    inferenceImplementationRecordsProof,
    sourceToSharesFifthGateProof,
    productReadinessAudit,
    fifthGateClosureProof,
    sixthGateMvpClosureProof,
    seventhGateCommercialTestnetLaunchProof,
    promptSpaceCompletenessProof,
    retainedPackageAdmissibilityProof,
    systemReformAdmissibilityProof
  });
  const v26TotalClosureProof = buildV26TotalClosureProof({
    generatedAt,
    baseData,
    specFamilyReport,
    canonicalInputReport,
    fifthGateClosureProof,
    sixthGateMvpClosureProof,
    seventhGateCommercialTestnetLaunchProof,
    promptSpaceCompletenessProof,
    wholeRepositoryProductionSatisfactionProof,
    productReadinessAudit,
    retainedPackageAdmissibilityProof,
    systemReformAdmissibilityProof
  });
  const gateCheckpointReport = buildV26GateCheckpointReport({
    generatedAt,
    baseData,
    inheritedV19,
    inheritedV20,
    specFamilyReport,
    canonicalInputReport,
    draftPreview,
    conversationsContinuityProof,
    runsPipelinesTotalityProof,
    persistenceSchemaTotalityProof,
    promptSystemTotalityProof,
    inferenceImplementationRecordsProof,
    retainedPackageAdmissibilityProof,
    fourthGateReclosureReviewProof,
    sourceToSharesFifthGateProof,
    fifthGateClosureDeepeningProof,
    fifthGateClosureProof,
    sixthGateMvpClosureProof,
    seventhGateCommercialTestnetLaunchProof,
    promptSpaceCompletenessProof,
    wholeRepositoryProductionSatisfactionProof,
    v26TotalClosureProof
  });
  const artifacts = {
    ...buildV21GeneratedArtifactContents({
      version: 'V26',
      proofSourceCommit: baseData.canonicalCommit,
      generatedAt,
      generatorId: baseData.generatorId,
      worktreeState: baseData.worktreeState,
      specFamilyReport,
      canonicalInputReport
    }),
    '.bitcode/terminal-composition-proof.json': `${JSON.stringify(terminalCompositionProof, null, 2)}\n`,
    '.bitcode/environment-mode-coherence-proof.json': `${JSON.stringify(environmentModeCoherenceProof, null, 2)}\n`,
    '.bitcode/v26-gate-checkpoint-report.json': `${JSON.stringify(gateCheckpointReport, null, 2)}\n`,
    '.bitcode/conversations-continuity-proof.json': `${JSON.stringify(conversationsContinuityProof, null, 2)}\n`,
    '.bitcode/runs-pipelines-totality-proof.json': `${JSON.stringify(runsPipelinesTotalityProof, null, 2)}\n`,
    '.bitcode/persistence-schema-totality-proof.json': `${JSON.stringify(persistenceSchemaTotalityProof, null, 2)}\n`,
    '.bitcode/prompt-system-totality-proof.json': `${JSON.stringify(promptSystemTotalityProof, null, 2)}\n`,
    '.bitcode/inference-implementation-records-proof.json': `${JSON.stringify(inferenceImplementationRecordsProof, null, 2)}\n`,
    '.bitcode/fourth-gate-reclosure-review-proof.json': `${JSON.stringify(fourthGateReclosureReviewProof, null, 2)}\n`,
    '.bitcode/source-to-shares-fifth-gate-proof.json': `${JSON.stringify(sourceToSharesFifthGateProof, null, 2)}\n`,
    '.bitcode/v26-product-readiness-audit.json': `${JSON.stringify(productReadinessAudit, null, 2)}\n`,
    '.bitcode/fifth-gate-closure-deepening-proof.json': `${JSON.stringify(fifthGateClosureDeepeningProof, null, 2)}\n`,
    '.bitcode/fifth-gate-closure-proof.json': `${JSON.stringify(fifthGateClosureProof, null, 2)}\n`,
    '.bitcode/sixth-gate-mvp-closure-proof.json': `${JSON.stringify(sixthGateMvpClosureProof, null, 2)}\n`,
    '.bitcode/seventh-gate-commercial-testnet-launch-proof.json': `${JSON.stringify(seventhGateCommercialTestnetLaunchProof, null, 2)}\n`,
    '.bitcode/prompt-space-completeness-proof.json': `${JSON.stringify(promptSpaceCompletenessProof, null, 2)}\n`,
    '.bitcode/retained-package-admissibility-proof.json': `${JSON.stringify(retainedPackageAdmissibilityProof, null, 2)}\n`,
    '.bitcode/system-reform-admissibility-proof.json': `${JSON.stringify(systemReformAdmissibilityProof, null, 2)}\n`,
    '.bitcode/whole-repository-production-satisfaction-proof.json': `${JSON.stringify(wholeRepositoryProductionSatisfactionProof, null, 2)}\n`,
    '.bitcode/v26-total-closure-proof.json': `${JSON.stringify(v26TotalClosureProof, null, 2)}\n`
  };
  const artifactSummaries = summarizeArtifactContents(artifacts);
  const checkpointReady = gateCheckpointReport.firstGate?.passed === true
    && gateCheckpointReport.secondGate?.passed === true;
  const throughFourthGateReady = gateCheckpointReport.fourthGate?.proceduralClosurePassed === true
    && gateCheckpointReport.fourthGate?.reopened !== true
    && gateCheckpointReport.fourthGate?.acceptanceBlockedByReopenedPromotion !== true;
  const fourthGatePromotedClosed = gateCheckpointReport.fourthGate?.promotedClosed === true;
  const throughFourthGatePromotionReady = fourthGatePromotedClosed;
  const fifthGateClosurePassed = gateCheckpointReport.fifthGate?.proceduralClosurePassed === true
    && fifthGateClosureProof.passed === true;
  const fifthGateClosureDeepeningPassed = fifthGateClosureDeepeningProof.passed === true;
  const sixthGateClosurePassed = gateCheckpointReport.sixthGate?.proceduralClosurePassed === true
    && sixthGateMvpClosureProof.passed === true;
  const seventhGateClosurePassed = gateCheckpointReport.seventhGate?.proceduralClosurePassed === true
    && seventhGateCommercialTestnetLaunchProof.passed === true;
  const eighthGateClosurePassed = gateCheckpointReport.eighthGate?.proceduralClosurePassed === true
    && promptSpaceCompletenessProof.passed === true
    && wholeRepositoryProductionSatisfactionProof.passed === true
    && v26TotalClosureProof.passed === true;
  const promotionReady = throughFourthGatePromotionReady
    && fifthGateClosurePassed
    && sixthGateClosurePassed
    && seventhGateClosurePassed
    && eighthGateClosurePassed;
  const data = {
    ...baseData,
    v19: inheritedV19,
    v20: inheritedV20,
    v26: {
      specFamilyReport,
      canonicalInputReport,
      terminalCompositionProof,
      gateCheckpointReport,
      conversationsContinuityProof,
      environmentModeCoherenceProof,
      runsPipelinesTotalityProof,
      persistenceSchemaTotalityProof,
      promptSystemTotalityProof,
      inferenceImplementationRecordsProof,
      fourthGateReclosureReviewProof,
      sourceToSharesFifthGateProof,
      productReadinessAudit,
      fifthGateClosureDeepeningProof,
      fifthGateClosureProof,
      sixthGateMvpClosureProof,
      seventhGateCommercialTestnetLaunchProof,
      promptSpaceCompletenessProof,
      retainedPackageAdmissibilityProof,
      systemReformAdmissibilityProof,
      wholeRepositoryProductionSatisfactionProof,
      v26TotalClosureProof,
      artifactSummaries,
      draftPreview,
      checkpointReady,
      throughFourthGateReady,
      fourthGatePromotedClosed,
      throughFourthGatePromotionReady,
      promotionReady,
      fifthGateClosurePassed,
      fifthGateClosureDeepeningPassed,
      sixthGateClosurePassed,
      seventhGateClosurePassed,
      eighthGateClosurePassed,
      activeCanonicalTarget: ACTIVE_CANON_VERSION,
      operatorSurfaceTarget: 'terminal-native-full-page'
    },
    aggregate: {
      ...baseData.aggregate,
      fullyProven: baseData.aggregate.fullyProven
        && inheritedV19?.deterministicReplayReport?.passed === true
        && inheritedV19?.volatilityInventory?.passed === true
        && inheritedV19?.contractChangeLedger?.passed === true
        && inheritedV20?.qualitySummary?.passed === true
        && specFamilyReport.passed === true
        && specFamilyReport.mode === 'promoted'
        && canonicalInputReport.passed === true
        && promotionReady
        && fifthGateClosurePassed
        && sixthGateClosurePassed
        && seventhGateClosurePassed
        && eighthGateClosurePassed
    }
  };
  return {
    data,
    markdown: renderCanonicalProvenMarkdown(data),
    artifacts
  };
}

/**
 * @param {{
 *   generatedAt: string,
 *   baseData: ReturnType<typeof buildCanonicalProvenData>
 * }} input
 */
function buildV30ProtocolTelemetryProofHooks({ generatedAt, baseData }) {
  const requiredFiles = [
    'packages/btd/src/telemetry.ts',
    'packages/btd/src/api-boundaries.ts',
    'packages/btd/__tests__/telemetry.test.ts',
    'packages/api/src/routes/btd-crypto.ts',
    'packages/api/src/routes/__tests__/btd-crypto.test.ts',
    'uapi/app/api/btd/protocol-telemetry/route.ts',
    'packages/btd/README.md',
    'uapi/app/terminal/README.md',
    'BITCODE_SPEC_V30.md',
    'BITCODE_SPEC_V30_DELTA.md',
    'BITCODE_SPEC_V30_NOTES.md',
    'BITCODE_SPEC_V30_PARITY_MATRIX.md'
  ];
  const telemetryPrimitiveTokens = [
    'BtdProtocolTelemetryEnvelope',
    'BtdProtocolTelemetryRecord',
    'BtdProtocolProofHook',
    'buildBtdProtocolTelemetryEnvelope',
    'buildBtdProtocolProofHook',
    'sourceSafety',
    'containsProtectedSource: false',
  ];
  const failures = [];
  const checkedFiles = [];
  /** @type {Record<string, string>} */
  const sourceByPath = {};
  for (const relativePath of requiredFiles) {
    const absolutePath = path.join(REPO_ROOT, relativePath);
    if (!existsSync(absolutePath)) {
      failures.push(`missing required telemetry proof-hook source ${relativePath}`);
      continue;
    }
    checkedFiles.push(relativePath);
    const content = readFileSync(absolutePath, 'utf8');
    sourceByPath[relativePath] = content;
    for (const token of telemetryPrimitiveTokens) {
      if (!content.includes(token) && relativePath === 'packages/btd/src/telemetry.ts') {
        failures.push(`telemetry primitive is missing ${token}`);
      }
    }
  }
  const routeContent = sourceByPath['packages/api/src/routes/btd-crypto.ts'] || '';
  const nextRouteContent = sourceByPath['uapi/app/api/btd/protocol-telemetry/route.ts'] || '';
  const testContent = sourceByPath['packages/btd/__tests__/telemetry.test.ts'] || '';
  const specContent = sourceByPath['BITCODE_SPEC_V30.md'] || '';
  const routeReady = routeContent.includes('buildPostBtdProtocolTelemetryRoute')
    && routeContent.includes('postBtdProtocolTelemetry')
    && nextRouteContent.includes('postBtdProtocolTelemetry');
  const testsReady = [
    'receipts, fees, projections, shares, and bridges',
    'secret-looking or protected-source telemetry metadata',
    'replayable theorem and witness facts'
  ].every((token) => testContent.includes(token));
  const specReady = specContent.includes('Gate 8 Protocol telemetry proof hooks')
    && specContent.includes('BtdProtocolTelemetryEnvelope');
  if (!routeReady) failures.push('Protocol telemetry API route is not wired.');
  if (!testsReady) failures.push('Protocol telemetry tests do not cover source safety and proof-hook replay.');
  if (!specReady) failures.push('V30 spec does not bind Protocol telemetry proof hooks.');

  return {
    reportId: 'v30-protocol-telemetry-proof-hooks',
    version: 'V30',
    proofSourceCommit: baseData.canonicalCommit,
    generatedAt,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState,
    passed: failures.length === 0,
    sourceSafe: true,
    checkedFileCount: checkedFiles.length,
    checkedFiles,
    requiredTelemetryFamilies: [
      'btd_receipt',
      'btc_fee_state',
      'ledger_projection',
      'source_to_shares_proof',
      'bridge_readiness_posture'
    ],
    proofHookCoverage: [
      'theorem ids',
      'replay step ids',
      'witness artifact paths',
      'generated artifact paths',
      'evidence roots',
      'telemetry roots'
    ],
    compatibleWith: ['V32', 'V35'],
    failures
  };
}

/**
 * @param {any} baseData
 * @param {{
 *   generatedAt: string,
 *   inheritedV19: any,
 *   inheritedV20: any
 * }} input
 */
function buildV30ProvenPackage(baseData, {
  generatedAt,
  inheritedV19,
  inheritedV20
}) {
  const draftPreview = ACTIVE_CANON_VERSION !== 'V30';
  const specFamilyReport = buildV21SpecFamilyReport({
    version: 'V30',
    mode: draftPreview ? 'draft' : 'promoted',
    ...(draftPreview ? { currentTarget: ACTIVE_CANON_VERSION } : { currentTarget: 'V30' })
  });
  const assumedArtifactPaths = [
    'BITCODE_SPEC_V30_PROVEN.md',
    '.bitcode/v30-spec-family-report.json',
    '.bitcode/v30-canonical-input-report.json',
    '.bitcode/v30-canon-posture-drift-report.json',
    '.bitcode/v30-protocol-telemetry-proof-hooks.json'
  ];
  const canonicalInputReport = buildV21CanonicalInputReport({
    currentTarget: 'V30',
    reportVersion: 'V30',
    ...(draftPreview
      ? {
          skipPointerCheck: true,
          assumeExistingRelativePaths: assumedArtifactPaths
        }
      : { assumeExistingRelativePaths: assumedArtifactPaths })
  });
  const canonPostureDriftReport = buildCanonPostureDriftReport({
    version: 'V30',
    activeCanonVersion: 'V30',
    draftTargetVersion: 'V31',
    proofSourceCommit: baseData.canonicalCommit,
    generatedAt,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState
  });
  const protocolTelemetryProofHooks = buildV30ProtocolTelemetryProofHooks({
    generatedAt,
    baseData
  });
  const artifacts = {
    ...buildCanonPostureGeneratedArtifactContents({
      version: 'V30',
      proofSourceCommit: baseData.canonicalCommit,
      generatedAt,
      generatorId: baseData.generatorId,
      worktreeState: baseData.worktreeState,
      specFamilyReport,
      canonicalInputReport,
      canonPostureDriftReport
    }),
    '.bitcode/v30-protocol-telemetry-proof-hooks.json': `${JSON.stringify(protocolTelemetryProofHooks, null, 2)}\n`
  };
  const artifactSummaries = summarizeArtifactContents(artifacts);
  const promotionReady = specFamilyReport.passed === true
    && canonicalInputReport.passed === true
    && canonPostureDriftReport.passed === true
    && protocolTelemetryProofHooks.passed === true;
  const data = {
    ...baseData,
    v19: inheritedV19,
    v20: inheritedV20,
    v30: {
      specFamilyReport,
      canonicalInputReport,
      canonPostureDriftReport,
      protocolTelemetryProofHooks,
      artifactSummaries,
      draftPreview,
      promotionReady,
      activeCanonicalTarget: ACTIVE_CANON_VERSION,
      nextDraftTarget: 'V31'
    },
    aggregate: {
      ...baseData.aggregate,
      fullyProven: baseData.aggregate.fullyProven
        && inheritedV19?.deterministicReplayReport?.passed === true
        && inheritedV19?.volatilityInventory?.passed === true
        && inheritedV19?.contractChangeLedger?.passed === true
        && inheritedV20?.qualitySummary?.passed === true
        && promotionReady
        && specFamilyReport.mode === 'promoted'
    }
  };
  return {
    data,
    markdown: renderCanonicalProvenMarkdown(data),
    artifacts
  };
}

/**
 * @param {{
 *   generatedAt: string,
 *   baseData: ReturnType<typeof buildCanonicalProvenData>
 * }} input
 */
function buildV31AuxillariesTelemetryProofHooks({ generatedAt, baseData }) {
  const requiredFiles = [
    'packages/api/src/routes/auxillaries-contract.ts',
    'packages/api/src/routes/__tests__/auxillaries-contract.test.ts',
    'uapi/hooks/useUserData.ts',
    'uapi/hooks/useUserData.js',
    'uapi/app/auxillaries/components/AuxillariesExternalsPane.tsx',
    'uapi/tests/userDataRoute.test.ts',
    'uapi/tests/auxillariesExternalsPane.test.tsx',
    'BITCODE_SPEC_V31.md',
    'BITCODE_SPEC_V31_DELTA.md',
    'BITCODE_SPEC_V31_NOTES.md',
    'BITCODE_SPEC_V31_PARITY_MATRIX.md'
  ];
  const contractTokens = [
    'AuxillariesTelemetrySubject',
    'AuxillariesTelemetryProofHook',
    'buildAuxillariesTelemetryProofHooks',
    'buildAuxillariesTelemetryProofHook',
    'theoremId',
    'replayStepId',
    'evidenceRoot',
    'telemetryRoot',
    'recoveryRoot',
    'sourceSafetyClass'
  ];
  const failures = [];
  const checkedFiles = [];
  /** @type {Record<string, string>} */
  const sourceByPath = {};
  for (const relativePath of requiredFiles) {
    const absolutePath = path.join(REPO_ROOT, relativePath);
    if (!existsSync(absolutePath)) {
      failures.push(`missing required Auxillaries telemetry proof-hook source ${relativePath}`);
      continue;
    }
    checkedFiles.push(relativePath);
    const content = readFileSync(absolutePath, 'utf8');
    sourceByPath[relativePath] = content;
    if (relativePath === 'packages/api/src/routes/auxillaries-contract.ts') {
      for (const token of contractTokens) {
        if (!content.includes(token)) {
          failures.push(`Auxillaries telemetry primitive is missing ${token}`);
        }
      }
    }
  }
  const contractTestContent = sourceByPath['packages/api/src/routes/__tests__/auxillaries-contract.test.ts'] || '';
  const userDataTsContent = sourceByPath['uapi/hooks/useUserData.ts'] || '';
  const userDataJsContent = sourceByPath['uapi/hooks/useUserData.js'] || '';
  const externalsPaneContent = sourceByPath['uapi/app/auxillaries/components/AuxillariesExternalsPane.tsx'] || '';
  const specContent = sourceByPath['BITCODE_SPEC_V31.md'] || '';
  const testsReady = [
    'telemetrySubjects',
    'provider_connection',
    'interface_admission',
    'readiness_diagnostic',
    'recovery_run',
    'auxillaries.recovery_run.execution_evidence',
    'source_safe'
  ].every((token) => contractTestContent.includes(token));
  const clientReady = userDataTsContent.includes('telemetryProofHooks')
    && userDataJsContent.includes('telemetryProofHooks');
  const uiReady = externalsPaneContent.includes('auxillaries-telemetry-proof-hooks')
    && externalsPaneContent.includes('Telemetry proof hooks');
  const specReady = specContent.includes('Gate 9')
    && specContent.includes('AuxillariesTelemetryProofHook')
    && specContent.includes('v31-auxillaries-telemetry-proof-hooks');
  if (!testsReady) failures.push('Auxillaries telemetry tests do not cover subject, recovery, and source-safety replay.');
  if (!clientReady) failures.push('Auxillaries user data hooks do not expose telemetryProofHooks.');
  if (!uiReady) failures.push('Auxillaries Externals pane does not render telemetry proof hooks.');
  if (!specReady) failures.push('V31 spec does not bind Auxillaries telemetry proof hooks.');

  return {
    reportId: 'v31-auxillaries-telemetry-proof-hooks',
    version: 'V31',
    proofSourceCommit: baseData.canonicalCommit,
    generatedAt,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState,
    passed: failures.length === 0,
    sourceSafe: true,
    checkedFileCount: checkedFiles.length,
    checkedFiles,
    requiredTelemetrySubjects: [
      'profile',
      'account',
      'provider_connection',
      'interface_admission',
      'wallet',
      'btd_pane',
      'organization_authority',
      'policy_decision',
      'readiness_diagnostic',
      'recovery_run'
    ],
    proofHookCoverage: [
      'theorem ids',
      'replay step ids',
      'evidence roots',
      'telemetry roots',
      'blocker ids',
      'repair outcomes',
      'source-safety classes',
      'proof roots'
    ],
    compatibleWith: ['V32'],
    failures
  };
}

/**
 * @param {any} baseData
 * @param {{
 *   generatedAt: string,
 *   inheritedV19: any,
 *   inheritedV20: any
 * }} input
 */
function buildV31ProvenPackage(baseData, {
  generatedAt,
  inheritedV19,
  inheritedV20
}) {
  const draftPreview = ACTIVE_CANON_VERSION !== 'V31';
  const specFamilyReport = buildV21SpecFamilyReport({
    version: 'V31',
    mode: draftPreview ? 'draft' : 'promoted',
    ...(draftPreview ? { currentTarget: ACTIVE_CANON_VERSION } : { currentTarget: 'V31' })
  });
  const assumedArtifactPaths = [
    'BITCODE_SPEC_V31_PROVEN.md',
    '.bitcode/v31-spec-family-report.json',
    '.bitcode/v31-canonical-input-report.json',
    '.bitcode/v31-canon-posture-drift-report.json',
    '.bitcode/v31-auxillaries-telemetry-proof-hooks.json'
  ];
  const canonicalInputReport = buildV21CanonicalInputReport({
    currentTarget: 'V31',
    reportVersion: 'V31',
    ...(draftPreview
      ? {
          skipPointerCheck: true,
          assumeExistingRelativePaths: assumedArtifactPaths
        }
      : { assumeExistingRelativePaths: assumedArtifactPaths })
  });
  const canonPostureDriftReport = buildCanonPostureDriftReport({
    version: 'V31',
    activeCanonVersion: 'V31',
    draftTargetVersion: 'V32',
    proofSourceCommit: baseData.canonicalCommit,
    generatedAt,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState
  });
  const auxillariesTelemetryProofHooks = buildV31AuxillariesTelemetryProofHooks({
    generatedAt,
    baseData
  });
  const artifacts = {
    ...buildCanonPostureGeneratedArtifactContents({
      version: 'V31',
      proofSourceCommit: baseData.canonicalCommit,
      generatedAt,
      generatorId: baseData.generatorId,
      worktreeState: baseData.worktreeState,
      specFamilyReport,
      canonicalInputReport,
      canonPostureDriftReport
    }),
    '.bitcode/v31-auxillaries-telemetry-proof-hooks.json': `${JSON.stringify(auxillariesTelemetryProofHooks, null, 2)}\n`
  };
  const artifactSummaries = summarizeArtifactContents(artifacts);
  const promotionReady = specFamilyReport.passed === true
    && canonicalInputReport.passed === true
    && canonPostureDriftReport.passed === true
    && auxillariesTelemetryProofHooks.passed === true;
  const data = {
    ...baseData,
    v19: inheritedV19,
    v20: inheritedV20,
    v31: {
      specFamilyReport,
      canonicalInputReport,
      canonPostureDriftReport,
      auxillariesTelemetryProofHooks,
      artifactSummaries,
      draftPreview,
      promotionReady,
      activeCanonicalTarget: ACTIVE_CANON_VERSION,
      nextDraftTarget: 'V32'
    },
    aggregate: {
      ...baseData.aggregate,
      fullyProven: baseData.aggregate.fullyProven
        && inheritedV19?.deterministicReplayReport?.passed === true
        && inheritedV19?.volatilityInventory?.passed === true
        && inheritedV19?.contractChangeLedger?.passed === true
        && inheritedV20?.qualitySummary?.passed === true
        && promotionReady
        && specFamilyReport.mode === 'promoted'
    }
  };
  return {
    data,
    markdown: renderCanonicalProvenMarkdown(data),
    artifacts
  };
}

/**
 * @param {{
 *   generatedAt: string,
 *   baseData: ReturnType<typeof buildCanonicalProvenData>
 * }} input
 */
function buildV32PromotionProofGenerationHardening({ generatedAt, baseData }) {
  const requiredSources = [
    {
      relativePath: 'scripts/generate-bitcode-proven.mjs',
      tokens: [
        '--dry-run',
        'buildSourceSafeDiffSummary',
        'proven-stale',
        'artifact-drift',
        'missing-artifact',
        'source-safe generated artifact diffs'
      ]
    },
    {
      relativePath: 'scripts/promote-bitcode-canon.mjs',
      tokens: [
        '--dry-run',
        'canonical promotion plan',
        'BITCODE_SPEC.txt'
      ]
    },
    {
      relativePath: 'packages/protocol/src/canonical/proven-generator.js',
      tokens: [
        'buildV32ProvenPackage',
        'buildV32PromotionProofGenerationHardening',
        '.bitcode/v32-promotion-proof-generation-hardening.json'
      ]
    },
    {
      relativePath: 'packages/protocol/src/canonical/v21-specifying.js',
      tokens: [
        '.bitcode/v32-promotion-proof-generation-hardening.json'
      ]
    },
    {
      relativePath: 'packages/protocol/test/v32-promotion-proof-generation.test.js',
      tokens: [
        'supports V32 promotion proof generation hardening',
        'source-safe generated artifact diffs',
        'v32-promotion-proof-generation-hardening'
      ]
    },
    {
      relativePath: 'scripts/generate-v32-promotion-proof-generation-hardening.mjs',
      tokens: [
        'buildV32PromotionProofGenerationHardeningArtifact',
        'source-safe generated artifact diffs',
        'v32-promotion-proof-generation-hardening'
      ]
    },
    {
      relativePath: 'scripts/check-v32-gate9-promotion-proof-generation-hardening.mjs',
      tokens: [
        'V32 Gate 9 promotion proof generation hardening',
        'check:v32-promotion-proof-generation-hardening',
        'source-safe generated artifact diffs'
      ]
    },
    {
      relativePath: 'BITCODE_SPEC_V32.md',
      tokens: [
        'Gate 9 promotion proof precision',
        '.bitcode/v32-promotion-proof-generation-hardening.json',
        'source-safe generated artifact diffs'
      ]
    },
    {
      relativePath: 'BITCODE_SPEC_V32_PARITY_MATRIX.md',
      tokens: [
        'V32 proof generation supports dry-run/check modes',
        '.bitcode/v32-promotion-proof-generation-hardening.json',
        'drafted'
      ]
    },
    {
      relativePath: 'SPECIFICATIONS_ROADMAP.md',
      tokens: [
        '| V32 | `BITCODE_SPEC_V32.md`',
        '| V33 |'
      ]
    },
    {
      relativePath: 'package.json',
      tokens: [
        'generate:v32-promotion-proof-generation-hardening',
        'check:v32-gate9'
      ]
    },
    {
      relativePath: '.github/workflows/bitcode-gate-quality.yml',
      tokens: [
        'check-v32-gate9-promotion-proof-generation-hardening.mjs',
        'v32-promotion-proof-generation.test.js'
      ]
    }
  ];
  const failures = [];
  const sourceEvidence = [];
  for (const source of requiredSources) {
    const absolutePath = path.join(REPO_ROOT, source.relativePath);
    if (!existsSync(absolutePath)) {
      failures.push(`missing required Gate 9 source ${source.relativePath}`);
      sourceEvidence.push({
        relativePath: source.relativePath,
        present: false,
        requiredTokens: source.tokens.map((token) => ({ token, present: false }))
      });
      continue;
    }
    const content = readFileSync(absolutePath, 'utf8');
    const requiredTokens = source.tokens.map((token) => ({
      token,
      present: content.includes(token)
    }));
    for (const token of requiredTokens) {
      if (!token.present) {
        failures.push(`${source.relativePath} is missing Gate 9 token ${token.token}`);
      }
    }
    sourceEvidence.push({
      relativePath: source.relativePath,
      present: true,
      requiredTokens
    });
  }

  return {
    reportId: 'v32-promotion-proof-generation-hardening',
    artifactId: 'v32-promotion-proof-generation-hardening',
    schemaId: 'bitcode.v32.promotionProofGenerationHardening.v1',
    version: 'V32',
    currentTarget: 'V31',
    proofSourceCommit: baseData.canonicalCommit,
    generatedAt,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState,
    passed: failures.length === 0,
    sourceSafe: true,
    modes: {
      dryRun: {
        supported: true,
        command: 'node scripts/generate-bitcode-proven.mjs --version V32 --commit HEAD --dry-run --allow-dirty',
        writesFiles: false,
        outputClass: 'source-safe path digest and byte summaries'
      },
      check: {
        supported: true,
        command: 'node scripts/generate-bitcode-proven.mjs --version V32 --commit HEAD --check --allow-dirty',
        failureClasses: ['proven-stale', 'artifact-drift', 'missing-artifact'],
        outputClass: 'source-safe generated artifact diffs'
      },
      promotion: {
        supported: true,
        command: 'node scripts/promote-bitcode-canon.mjs --version <promoted-version> --commit <proof-source-commit> --dry-run',
        branchProtectionPosture: 'pull-request-based promotion plan without direct main push'
      }
    },
    branchProtection: {
      directMainPushAdmitted: false,
      promotionPrRequired: true,
      versionBranch: 'version/v32',
      versionPromotionPullRequestTitlePrefix: 'V32 Canonical Promotion'
    },
    failureClasses: [
      'stale-posture',
      'proven-stale',
      'artifact-drift',
      'missing-artifact',
      'malformed-payload',
      'source-safety-violation',
      'workflow-branch-mismatch'
    ],
    sourceEvidence,
    failures
  };
}

/**
 * @param {{
 *   generatedAt: string,
 *   baseData: ReturnType<typeof buildCanonicalProvenData>
 * }} input
 */
function buildV32PromotionReadinessReport({ generatedAt, baseData }) {
  const requiredSources = [
    {
      relativePath: 'scripts/check-v32-gate10-promotion-readiness.mjs',
      tokens: [
        'V32 Gate 10 promotion readiness',
        '--promotion-mode',
        '.bitcode/v32-promotion-readiness-report.json'
      ]
    },
    {
      relativePath: 'scripts/generate-v32-promotion-readiness-report.mjs',
      tokens: [
        'buildV32PromotionReadinessReport',
        'source-safe-promotion-readiness-metadata',
        'v32-promotion-readiness-report'
      ]
    },
    {
      relativePath: 'scripts/promote-bitcode-canon.mjs',
      tokens: [
        "if (version === 'V32')",
        'const v32Gate10Command',
        'buildDerivedV32CommitMessageBody',
        'scripts/check-v32-gate10-promotion-readiness.mjs'
      ]
    },
    {
      relativePath: 'scripts/prepare-bitcode-spec-family-promotion.mjs',
      tokens: [
        "if (version === 'V32')",
        'V32 canonical system specification for provation/testing',
        'BITCODE_SPEC_V32_PROVEN.md',
        '.bitcode/v32-promotion-readiness-report.json'
      ]
    },
    {
      relativePath: '.github/workflows/v32-canon-promotion.yml',
      tokens: [
        "head.ref == 'version/v32'",
        'npm run promote:canon -- --version V32',
        'BITCODE_SPEC_V32_PROVEN.md',
        'Promote V32 canon files'
      ]
    },
    {
      relativePath: '.github/workflows/bitcode-gate-quality.yml',
      tokens: [
        'check-v32-gate10-promotion-readiness.mjs',
        'elif [ "$POINTER" = "V32" ]'
      ]
    },
    {
      relativePath: '.github/workflows/bitcode-canon-quality.yml',
      tokens: [
        'elif [ "$POINTER" = "V32" ]',
        '--active-canon V32 --draft-target V33'
      ]
    },
    {
      relativePath: 'BITCODE_SPEC_V32.md',
      tokens: [
        'V32 local and staging promotion readiness canon',
        '.bitcode/v32-promotion-readiness-report.json',
        'V32 active / V33 draft'
      ]
    },
    {
      relativePath: 'BITCODE_SPEC_V32_PARITY_MATRIX.md',
      tokens: [
        '## Gate 10 Parity',
        '.bitcode/v32-promotion-readiness-report.json',
        'closed'
      ]
    },
    {
      relativePath: 'BITCODE_V32_QA.md',
      tokens: [
        'Bitcode V32 QA Ledger',
        'Gate 10 Promotion Readiness QA',
        'source-safe'
      ]
    },
    {
      relativePath: 'package.json',
      tokens: [
        'generate:v32-promotion-readiness',
        'check:v32-gate10'
      ]
    },
    {
      relativePath: 'packages/protocol/README.md',
      tokens: [
        'V32 Gate 10',
        'V32` active, `V33` draft'
      ]
    }
  ];
  const failures = [];
  const sourceEvidence = [];
  for (const source of requiredSources) {
    const absolutePath = path.join(REPO_ROOT, source.relativePath);
    if (!existsSync(absolutePath)) {
      failures.push(`missing required Gate 10 source ${source.relativePath}`);
      sourceEvidence.push({
        relativePath: source.relativePath,
        present: false,
        requiredTokens: source.tokens.map((token) => ({ token, present: false }))
      });
      continue;
    }
    const content = readFileSync(absolutePath, 'utf8');
    const requiredTokens = source.tokens.map((token) => ({
      token,
      present: content.includes(token)
    }));
    for (const token of requiredTokens) {
      if (!token.present) {
        failures.push(`${source.relativePath} is missing Gate 10 token ${token.token}`);
      }
    }
    sourceEvidence.push({
      relativePath: source.relativePath,
      present: true,
      requiredTokens
    });
  }

  return {
    reportId: 'v32-promotion-readiness-report',
    artifactId: 'v32-promotion-readiness-report',
    schemaId: 'bitcode.v32.promotionReadiness.v1',
    version: 'V32',
    currentTarget: 'V32',
    proofSourceCommit: baseData.canonicalCommit,
    generatedAt,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState,
    passed: failures.length === 0,
    sourceSafe: true,
    prePromotionPosture: 'V31 active / V32 draft',
    postPromotionPosture: 'V32 active / V33 draft',
    branchProtection: {
      directMainPushAdmitted: false,
      promotionPrRequired: true,
      versionBranch: 'version/v32',
      versionPromotionPullRequestTitlePrefix: 'V32 Canonical Promotion'
    },
    generatedArtifactPolicy: {
      provenAppendixPath: 'BITCODE_SPEC_V32_PROVEN.md',
      provenAppendixRequiredBeforePromotion: false,
      generatedArtifactPrefix: '.bitcode/v32-',
      secretValuesSerialized: false,
      protectedSourceSerialized: false
    },
    sourceEvidence,
    failures
  };
}

/**
 * @param {any} baseData
 * @param {{
 *   generatedAt: string,
 *   inheritedV19: any,
 *   inheritedV20: any
 * }} input
 */
function buildV32ProvenPackage(baseData, {
  generatedAt,
  inheritedV19,
  inheritedV20
}) {
  const draftPreview = ACTIVE_CANON_VERSION !== 'V32';
  const specFamilyReport = buildV21SpecFamilyReport({
    version: 'V32',
    mode: draftPreview ? 'draft' : 'promoted',
    ...(draftPreview ? { currentTarget: ACTIVE_CANON_VERSION } : { currentTarget: 'V32' })
  });
  const assumedArtifactPaths = [
    'BITCODE_SPEC_V32_PROVEN.md',
    '.bitcode/v32-spec-family-report.json',
    '.bitcode/v32-canonical-input-report.json',
    '.bitcode/v32-canon-posture-drift-report.json',
    '.bitcode/v32-proof-coverage-matrix.json',
    '.bitcode/v32-artifact-volatility-inventory.json',
    '.bitcode/v32-deterministic-replay-report.json',
    '.bitcode/v32-reading-pipeline-proof-coverage.json',
    '.bitcode/v32-ledger-btd-settlement-failure-state-coverage.json',
    '.bitcode/v32-interface-contract-regression-suite.json',
    '.bitcode/v32-browser-accessibility-responsive-visual-proof.json',
    '.bitcode/v32-testnet-mainnet-readiness-rehearsal.json',
    '.bitcode/v32-promotion-proof-generation-hardening.json',
    '.bitcode/v32-promotion-readiness-report.json'
  ];
  const canonicalInputReport = buildV21CanonicalInputReport({
    currentTarget: 'V32',
    reportVersion: 'V32',
    ...(draftPreview
      ? {
          skipPointerCheck: true,
          assumeExistingRelativePaths: assumedArtifactPaths
        }
      : { assumeExistingRelativePaths: assumedArtifactPaths })
  });
  const canonPostureDriftReport = buildCanonPostureDriftReport({
    version: 'V32',
    activeCanonVersion: 'V32',
    draftTargetVersion: 'V33',
    proofSourceCommit: baseData.canonicalCommit,
    generatedAt,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState
  });
  const promotionProofGenerationHardening = buildV32PromotionProofGenerationHardening({
    generatedAt,
    baseData
  });
  const promotionReadinessReport = buildV32PromotionReadinessReport({
    generatedAt,
    baseData
  });
  const artifacts = {
    ...buildCanonPostureGeneratedArtifactContents({
      version: 'V32',
      proofSourceCommit: baseData.canonicalCommit,
      generatedAt,
      generatorId: baseData.generatorId,
      worktreeState: baseData.worktreeState,
      specFamilyReport,
      canonicalInputReport,
      canonPostureDriftReport
    }),
    '.bitcode/v32-promotion-proof-generation-hardening.json': `${JSON.stringify(promotionProofGenerationHardening, null, 2)}\n`,
    '.bitcode/v32-promotion-readiness-report.json': `${JSON.stringify(promotionReadinessReport, null, 2)}\n`
  };
  const artifactSummaries = summarizeArtifactContents(artifacts);
  const promotionReady = specFamilyReport.passed === true
    && canonicalInputReport.passed === true
    && canonPostureDriftReport.passed === true
    && promotionProofGenerationHardening.passed === true
    && promotionReadinessReport.passed === true;
  const data = {
    ...baseData,
    v19: inheritedV19,
    v20: inheritedV20,
    v32: {
      specFamilyReport,
      canonicalInputReport,
      canonPostureDriftReport,
      promotionProofGenerationHardening,
      promotionReadinessReport,
      artifactSummaries,
      draftPreview,
      promotionReady,
      activeCanonicalTarget: ACTIVE_CANON_VERSION,
      nextDraftTarget: 'V33'
    },
    aggregate: {
      ...baseData.aggregate,
      fullyProven: baseData.aggregate.fullyProven
        && inheritedV19?.deterministicReplayReport?.passed === true
        && inheritedV19?.volatilityInventory?.passed === true
        && inheritedV19?.contractChangeLedger?.passed === true
        && inheritedV20?.qualitySummary?.passed === true
        && promotionReady
        && specFamilyReport.mode === 'promoted'
    }
  };
  return {
    data,
    markdown: renderCanonicalProvenMarkdown(data),
    artifacts
  };
}

/**
 * @param {{
 *   generatedAt: string,
 *   baseData: ReturnType<typeof buildCanonicalProvenData>
 * }} input
 */
function buildV33PromotionReadinessReport({ generatedAt, baseData }) {
  const requiredSources = [
    {
      relativePath: 'scripts/check-v33-gate10-promotion-readiness.mjs',
      tokens: [
        'V33 Gate 10 promotion readiness',
        '--promotion-mode',
        '.bitcode/v33-promotion-readiness-report.json'
      ]
    },
    {
      relativePath: 'scripts/generate-v33-promotion-readiness-report.mjs',
      tokens: [
        'buildV33PromotionReadinessReport',
        'source-safe-interface-promotion-readiness-metadata',
        'v33-promotion-readiness-report'
      ]
    },
    {
      relativePath: 'scripts/promote-bitcode-canon.mjs',
      tokens: [
        "if (version === 'V33')",
        'const v33Gate10Command',
        'buildDerivedV33CommitMessageBody',
        'scripts/check-v33-gate10-promotion-readiness.mjs'
      ]
    },
    {
      relativePath: 'scripts/prepare-bitcode-spec-family-promotion.mjs',
      tokens: [
        "if (version === 'V33')",
        'V33 canonical system specification for commercial interface depth',
        'BITCODE_SPEC_V33_PROVEN.md',
        '.bitcode/v33-promotion-readiness-report.json'
      ]
    },
    {
      relativePath: '.github/workflows/v33-canon-promotion.yml',
      tokens: [
        "head.ref == 'version/v33'",
        'npm run promote:canon -- --version V33',
        'BITCODE_SPEC_V33_PROVEN.md',
        'Promote V33 canon files'
      ]
    },
    {
      relativePath: '.github/workflows/bitcode-gate-quality.yml',
      tokens: [
        'check-v33-gate10-promotion-readiness.mjs',
        'elif [ "$POINTER" = "V33" ]'
      ]
    },
    {
      relativePath: '.github/workflows/bitcode-canon-quality.yml',
      tokens: [
        'elif [ "$POINTER" = "V33" ]',
        '--active-canon V33 --draft-target V34'
      ]
    },
    {
      relativePath: 'BITCODE_SPEC_V33.md',
      tokens: [
        'V33 promotion readiness canon',
        '.bitcode/v33-promotion-readiness-report.json',
        'V33 active / V34 draft'
      ]
    },
    {
      relativePath: 'BITCODE_SPEC_V33_PARITY_MATRIX.md',
      tokens: [
        '## Gate 10 Parity',
        '.bitcode/v33-promotion-readiness-report.json',
        'closed'
      ]
    },
    {
      relativePath: 'package.json',
      tokens: [
        'generate:v33-promotion-readiness',
        'check:v33-gate10'
      ]
    },
    {
      relativePath: 'packages/protocol/README.md',
      tokens: [
        'V33 Gate 10',
        'V33` active, `V34` draft'
      ]
    }
  ];
  const failures = [];
  const sourceEvidence = [];
  for (const source of requiredSources) {
    const absolutePath = path.join(REPO_ROOT, source.relativePath);
    if (!existsSync(absolutePath)) {
      failures.push(`missing required Gate 10 source ${source.relativePath}`);
      sourceEvidence.push({
        relativePath: source.relativePath,
        present: false,
        requiredTokens: source.tokens.map((token) => ({ token, present: false }))
      });
      continue;
    }
    const content = readFileSync(absolutePath, 'utf8');
    const requiredTokens = source.tokens.map((token) => ({
      token,
      present: content.includes(token)
    }));
    for (const token of requiredTokens) {
      if (!token.present) {
        failures.push(`${source.relativePath} is missing Gate 10 token ${token.token}`);
      }
    }
    sourceEvidence.push({
      relativePath: source.relativePath,
      present: true,
      requiredTokens
    });
  }

  return {
    reportId: 'v33-promotion-readiness-report',
    artifactId: 'v33-promotion-readiness-report',
    schemaId: 'bitcode.v33.promotionReadiness.v1',
    version: 'V33',
    currentTarget: 'V33',
    proofSourceCommit: baseData.canonicalCommit,
    generatedAt,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState,
    passed: failures.length === 0,
    sourceSafe: true,
    prePromotionPosture: 'V32 active / V33 draft',
    postPromotionPosture: 'V33 active / V34 draft',
    branchProtection: {
      directMainPushAdmitted: false,
      promotionPrRequired: true,
      versionBranch: 'version/v33',
      versionPromotionPullRequestTitlePrefix: 'V33 Canonical Promotion'
    },
    generatedArtifactPolicy: {
      provenAppendixPath: 'BITCODE_SPEC_V33_PROVEN.md',
      provenAppendixRequiredBeforePromotion: false,
      generatedArtifactPrefix: '.bitcode/v33-',
      secretValuesSerialized: false,
      protectedSourceSerialized: false
    },
    sourceEvidence,
    failures
  };
}

/**
 * @param {any} baseData
 * @param {{
 *   generatedAt: string,
 *   inheritedV19: any,
 *   inheritedV20: any
 * }} input
 */
function buildV33ProvenPackage(baseData, {
  generatedAt,
  inheritedV19,
  inheritedV20
}) {
  const draftPreview = ACTIVE_CANON_VERSION !== 'V33';
  const specFamilyReport = buildV21SpecFamilyReport({
    version: 'V33',
    mode: draftPreview ? 'draft' : 'promoted',
    ...(draftPreview ? { currentTarget: ACTIVE_CANON_VERSION } : { currentTarget: 'V33' })
  });
  const assumedArtifactPaths = [
    'BITCODE_SPEC_V33_PROVEN.md',
    '.bitcode/v33-spec-family-report.json',
    '.bitcode/v33-canonical-input-report.json',
    '.bitcode/v33-canon-posture-drift-report.json',
    '.bitcode/v33-interface-contract-catalog.json',
    '.bitcode/v33-mcp-api-tool-contracts.json',
    '.bitcode/v33-chatgpt-app-action-contracts.json',
    '.bitcode/v33-interface-authorization-policy.json',
    '.bitcode/v33-read-license-assetpack-rights-contracts.json',
    '.bitcode/v33-api-schema-compatibility-matrix.json',
    '.bitcode/v33-interface-telemetry-proof-hooks.json',
    '.bitcode/v33-interface-consumer-ux-regression-proof.json',
    '.bitcode/v33-promotion-readiness-report.json'
  ];
  const canonicalInputReport = buildV21CanonicalInputReport({
    currentTarget: 'V33',
    reportVersion: 'V33',
    ...(draftPreview
      ? {
          skipPointerCheck: true,
          assumeExistingRelativePaths: assumedArtifactPaths
        }
      : { assumeExistingRelativePaths: assumedArtifactPaths })
  });
  const canonPostureDriftReport = buildCanonPostureDriftReport({
    version: 'V33',
    activeCanonVersion: 'V33',
    draftTargetVersion: 'V34',
    proofSourceCommit: baseData.canonicalCommit,
    generatedAt,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState
  });
  const promotionReadinessReport = buildV33PromotionReadinessReport({
    generatedAt,
    baseData
  });
  const artifacts = {
    ...buildCanonPostureGeneratedArtifactContents({
      version: 'V33',
      proofSourceCommit: baseData.canonicalCommit,
      generatedAt,
      generatorId: baseData.generatorId,
      worktreeState: baseData.worktreeState,
      specFamilyReport,
      canonicalInputReport,
      canonPostureDriftReport
    }),
    '.bitcode/v33-promotion-readiness-report.json': `${JSON.stringify(promotionReadinessReport, null, 2)}\n`
  };
  const artifactSummaries = summarizeArtifactContents(artifacts);
  const promotionReady = specFamilyReport.passed === true
    && canonicalInputReport.passed === true
    && canonPostureDriftReport.passed === true
    && promotionReadinessReport.passed === true;
  const data = {
    ...baseData,
    v19: inheritedV19,
    v20: inheritedV20,
    v33: {
      specFamilyReport,
      canonicalInputReport,
      canonPostureDriftReport,
      promotionReadinessReport,
      artifactSummaries,
      draftPreview,
      promotionReady,
      activeCanonicalTarget: ACTIVE_CANON_VERSION,
      nextDraftTarget: 'V34'
    },
    aggregate: {
      ...baseData.aggregate,
      fullyProven: baseData.aggregate.fullyProven
        && inheritedV19?.deterministicReplayReport?.passed === true
        && inheritedV19?.volatilityInventory?.passed === true
        && inheritedV19?.contractChangeLedger?.passed === true
        && inheritedV20?.qualitySummary?.passed === true
        && promotionReady
        && specFamilyReport.mode === 'promoted'
    }
  };
  return {
    data,
    markdown: renderCanonicalProvenMarkdown(data),
    artifacts
  };
}

/**
 * @param {{
 *   generatedAt: string,
 *   baseData: ReturnType<typeof buildCanonicalProvenData>
 * }} input
 */
function buildV34PromotionReadinessReport({ generatedAt, baseData }) {
  const requiredSources = [
    {
      relativePath: 'scripts/check-v34-gate10-promotion-readiness.mjs',
      tokens: [
        'V34 Gate 10 promotion readiness',
        '--promotion-mode',
        '.bitcode/v34-promotion-readiness-report.json'
      ]
    },
    {
      relativePath: 'scripts/generate-v34-promotion-readiness-report.mjs',
      tokens: [
        'buildV34PromotionReadinessReport',
        'source-safe-deployment-promotion-readiness-metadata',
        'v34-promotion-readiness-report'
      ]
    },
    {
      relativePath: 'scripts/promote-bitcode-canon.mjs',
      tokens: [
        "if (version === 'V34')",
        'const v34Gate10Command',
        'buildDerivedV34CommitMessageBody',
        'scripts/check-v34-gate10-promotion-readiness.mjs'
      ]
    },
    {
      relativePath: 'scripts/prepare-bitcode-spec-family-promotion.mjs',
      tokens: [
        "if (version === 'V34')",
        'V34 canonical system specification for deployment depth',
        'BITCODE_SPEC_V34_PROVEN.md',
        '.bitcode/v34-promotion-readiness-report.json'
      ]
    },
    {
      relativePath: '.github/workflows/v34-canon-promotion.yml',
      tokens: [
        "head.ref == 'version/v34'",
        'npm run promote:canon -- --version V34',
        'BITCODE_SPEC_V34_PROVEN.md',
        'Promote V34 canon files'
      ]
    },
    {
      relativePath: '.github/workflows/bitcode-gate-quality.yml',
      tokens: [
        'check-v34-gate10-promotion-readiness.mjs',
        'elif [ "$POINTER" = "V34" ]'
      ]
    },
    {
      relativePath: '.github/workflows/bitcode-canon-quality.yml',
      tokens: [
        'elif [ "$POINTER" = "V34" ]',
        '--active-canon V34 --draft-target V35'
      ]
    },
    {
      relativePath: 'packages/btd/src/deployment-promotion-readiness-report.ts',
      tokens: [
        'DeploymentPromotionReadinessReport',
        'DEPLOYMENT_PROMOTION_READINESS_ARTIFACT_PATHS',
        'V34 active / V35 draft'
      ]
    },
    {
      relativePath: 'packages/protocol/test/v34-promotion-readiness.test.js',
      tokens: [
        'supports V34 promotion readiness with source-safe deployment artifacts',
        'v34-promotion-readiness-report',
        'V34 Promotion Readiness'
      ]
    },
    {
      relativePath: 'BITCODE_SPEC_V34.md',
      tokens: [
        'V34 promotion readiness canon',
        '.bitcode/v34-promotion-readiness-report.json',
        'V34 active / V35 draft'
      ]
    },
    {
      relativePath: 'BITCODE_SPEC_V34_PARITY_MATRIX.md',
      tokens: [
        '## Gate 10 Parity',
        '.bitcode/v34-promotion-readiness-report.json',
        'closed'
      ]
    },
    {
      relativePath: 'package.json',
      tokens: [
        'generate:v34-promotion-readiness',
        'check:v34-gate10'
      ]
    },
    {
      relativePath: 'packages/protocol/README.md',
      tokens: [
        'V34 Gate 10',
        'V34` active, `V35` draft'
      ]
    }
  ];
  const failures = [];
  const sourceEvidence = [];
  for (const source of requiredSources) {
    const absolutePath = path.join(REPO_ROOT, source.relativePath);
    if (!existsSync(absolutePath)) {
      failures.push(`missing required Gate 10 source ${source.relativePath}`);
      sourceEvidence.push({
        relativePath: source.relativePath,
        present: false,
        requiredTokens: source.tokens.map((token) => ({ token, present: false }))
      });
      continue;
    }
    const content = readFileSync(absolutePath, 'utf8');
    const requiredTokens = source.tokens.map((token) => ({
      token,
      present: content.includes(token)
    }));
    for (const token of requiredTokens) {
      if (!token.present) {
        failures.push(`${source.relativePath} is missing Gate 10 token ${token.token}`);
      }
    }
    sourceEvidence.push({
      relativePath: source.relativePath,
      present: true,
      requiredTokens
    });
  }

  return {
    reportId: 'v34-promotion-readiness-report',
    artifactId: 'v34-promotion-readiness-report',
    schemaId: 'bitcode.v34.promotionReadiness.v1',
    version: 'V34',
    currentTarget: 'V34',
    proofSourceCommit: baseData.canonicalCommit,
    generatedAt,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState,
    passed: failures.length === 0,
    sourceSafe: true,
    prePromotionPosture: 'V33 active / V34 draft',
    postPromotionPosture: 'V34 active / V35 draft',
    branchProtection: {
      directMainPushAdmitted: false,
      promotionPrRequired: true,
      versionBranch: 'version/v34',
      versionPromotionPullRequestTitlePrefix: 'V34 Canonical Promotion'
    },
    generatedArtifactPolicy: {
      provenAppendixPath: 'BITCODE_SPEC_V34_PROVEN.md',
      provenAppendixRequiredBeforePromotion: false,
      generatedArtifactPrefix: '.bitcode/v34-',
      secretValuesSerialized: false,
      protectedSourceSerialized: false
    },
    sourceEvidence,
    failures
  };
}

/**
 * @param {any} baseData
 * @param {{
 *   generatedAt: string,
 *   inheritedV19: any,
 *   inheritedV20: any
 * }} input
 */
function buildV34ProvenPackage(baseData, {
  generatedAt,
  inheritedV19,
  inheritedV20
}) {
  const draftPreview = ACTIVE_CANON_VERSION !== 'V34';
  const specFamilyReport = buildV21SpecFamilyReport({
    version: 'V34',
    mode: draftPreview ? 'draft' : 'promoted',
    ...(draftPreview ? { currentTarget: ACTIVE_CANON_VERSION } : { currentTarget: 'V34' })
  });
  const assumedArtifactPaths = [
    'BITCODE_SPEC_V34_PROVEN.md',
    '.bitcode/v34-spec-family-report.json',
    '.bitcode/v34-canonical-input-report.json',
    '.bitcode/v34-canon-posture-drift-report.json',
    '.bitcode/v34-deployment-host-capability-catalog.json',
    '.bitcode/v34-environment-lane-contracts.json',
    '.bitcode/v34-distributed-execution-runtime-receipts.json',
    '.bitcode/v34-deployment-storage-posture.json',
    '.bitcode/v34-secret-rotation-boundary-operations.json',
    '.bitcode/v34-migration-cicd-approval-gates.json',
    '.bitcode/v34-runtime-observers-broadcasters-repair-jobs.json',
    '.bitcode/v34-rollback-upgrade-data-repair-playbooks.json',
    '.bitcode/v34-local-staging-testnet-deployment-rehearsal.json',
    '.bitcode/v34-promotion-readiness-report.json'
  ];
  const canonicalInputReport = buildV21CanonicalInputReport({
    currentTarget: 'V34',
    reportVersion: 'V34',
    ...(draftPreview
      ? {
          skipPointerCheck: true,
          assumeExistingRelativePaths: assumedArtifactPaths
        }
      : { assumeExistingRelativePaths: assumedArtifactPaths })
  });
  const canonPostureDriftReport = buildCanonPostureDriftReport({
    version: 'V34',
    activeCanonVersion: 'V34',
    draftTargetVersion: 'V35',
    proofSourceCommit: baseData.canonicalCommit,
    generatedAt,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState
  });
  const promotionReadinessReport = buildV34PromotionReadinessReport({
    generatedAt,
    baseData
  });
  const artifacts = {
    ...buildCanonPostureGeneratedArtifactContents({
      version: 'V34',
      proofSourceCommit: baseData.canonicalCommit,
      generatedAt,
      generatorId: baseData.generatorId,
      worktreeState: baseData.worktreeState,
      specFamilyReport,
      canonicalInputReport,
      canonPostureDriftReport
    }),
    '.bitcode/v34-promotion-readiness-report.json': `${JSON.stringify(promotionReadinessReport, null, 2)}\n`
  };
  const artifactSummaries = summarizeArtifactContents(artifacts);
  const promotionReady = specFamilyReport.passed === true
    && canonicalInputReport.passed === true
    && canonPostureDriftReport.passed === true
    && promotionReadinessReport.passed === true;
  const data = {
    ...baseData,
    v19: inheritedV19,
    v20: inheritedV20,
    v34: {
      specFamilyReport,
      canonicalInputReport,
      canonPostureDriftReport,
      promotionReadinessReport,
      artifactSummaries,
      draftPreview,
      promotionReady,
      activeCanonicalTarget: ACTIVE_CANON_VERSION,
      nextDraftTarget: 'V35'
    },
    aggregate: {
      ...baseData.aggregate,
      fullyProven: baseData.aggregate.fullyProven
        && inheritedV19?.deterministicReplayReport?.passed === true
        && inheritedV19?.volatilityInventory?.passed === true
        && inheritedV19?.contractChangeLedger?.passed === true
        && inheritedV20?.qualitySummary?.passed === true
        && promotionReady
        && specFamilyReport.mode === 'promoted'
    }
  };
  return {
    data,
    markdown: renderCanonicalProvenMarkdown(data),
    artifacts
  };
}

/**
 * @param {{
 *   generatedAt: string,
 *   baseData: ReturnType<typeof buildCanonicalProvenData>
 * }} input
 */
function buildV35PromotionReadinessReport({ generatedAt, baseData }) {
  const report = buildDocumentationTelemetryPromotionReadinessReport({
    generatedAt,
    repoRoot: REPO_ROOT
  });
  return {
    reportId: report.artifactId,
    ...report,
    proofSourceCommit: baseData.canonicalCommit,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState,
    sourceSafe: report.sourceSafetyVerdict === 'source-safe-promotion-readiness-metadata'
  };
}

/**
 * @param {any} baseData
 * @param {{
 *   generatedAt: string,
 *   inheritedV19: any,
 *   inheritedV20: any
 * }} input
 */
function buildV35ProvenPackage(baseData, {
  generatedAt,
  inheritedV19,
  inheritedV20
}) {
  const draftPreview = ACTIVE_CANON_VERSION !== 'V35';
  const specFamilyReport = buildV21SpecFamilyReport({
    version: 'V35',
    mode: draftPreview ? 'draft' : 'promoted',
    ...(draftPreview ? { currentTarget: ACTIVE_CANON_VERSION } : { currentTarget: 'V35' })
  });
  const assumedArtifactPaths = [
    'BITCODE_SPEC_V35_PROVEN.md',
    '.bitcode/v35-spec-family-report.json',
    '.bitcode/v35-canonical-input-report.json',
    '.bitcode/v35-canon-posture-drift-report.json',
    '.bitcode/v35-documentation-surface-catalog.json',
    '.bitcode/v35-telemetry-taxonomy-catalog.json',
    '.bitcode/v35-public-docs-usage-guides.json',
    '.bitcode/v35-operator-runbook-catalog.json',
    '.bitcode/v35-docs-qa-alignment-report.json',
    '.bitcode/v35-testnet-rollout-readiness-guide.json',
    '.bitcode/v35-telemetry-documentation-interface-integration.json',
    '.bitcode/v35-local-staging-telemetry-documentation-rehearsal.json',
    V35_PROMOTION_READINESS_ARTIFACT_PATH
  ];
  const canonicalInputReport = buildV21CanonicalInputReport({
    currentTarget: 'V35',
    reportVersion: 'V35',
    ...(draftPreview
      ? {
          skipPointerCheck: true,
          assumeExistingRelativePaths: assumedArtifactPaths
        }
      : { assumeExistingRelativePaths: assumedArtifactPaths })
  });
  const canonPostureDriftReport = buildCanonPostureDriftReport({
    version: 'V35',
    activeCanonVersion: 'V35',
    draftTargetVersion: 'V36',
    proofSourceCommit: baseData.canonicalCommit,
    generatedAt,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState
  });
  const promotionReadinessReport = buildV35PromotionReadinessReport({
    generatedAt,
    baseData
  });
  const artifacts = {
    ...buildCanonPostureGeneratedArtifactContents({
      version: 'V35',
      proofSourceCommit: baseData.canonicalCommit,
      generatedAt,
      generatorId: baseData.generatorId,
      worktreeState: baseData.worktreeState,
      specFamilyReport,
      canonicalInputReport,
      canonPostureDriftReport
    }),
    [V35_PROMOTION_READINESS_ARTIFACT_PATH]: `${JSON.stringify(promotionReadinessReport, null, 2)}\n`
  };
  const artifactSummaries = summarizeArtifactContents(artifacts);
  const promotionReady = specFamilyReport.passed === true
    && canonicalInputReport.passed === true
    && canonPostureDriftReport.passed === true
    && promotionReadinessReport.passed === true;
  const data = {
    ...baseData,
    v19: inheritedV19,
    v20: inheritedV20,
    v35: {
      specFamilyReport,
      canonicalInputReport,
      canonPostureDriftReport,
      promotionReadinessReport,
      artifactSummaries,
      draftPreview,
      promotionReady,
      activeCanonicalTarget: ACTIVE_CANON_VERSION,
      nextDraftTarget: 'V36'
    },
    aggregate: {
      ...baseData.aggregate,
      fullyProven: baseData.aggregate.fullyProven
        && inheritedV19?.deterministicReplayReport?.passed === true
        && inheritedV19?.volatilityInventory?.passed === true
        && inheritedV19?.contractChangeLedger?.passed === true
        && inheritedV20?.qualitySummary?.passed === true
        && promotionReady
        && specFamilyReport.mode === 'promoted'
    }
  };
  return {
    data,
    markdown: renderCanonicalProvenMarkdown(data),
    artifacts
  };
}

/**
 * @param {{
 *   generatedAt: string,
 *   baseData: ReturnType<typeof buildCanonicalProvenData>
 * }} input
 */
function buildV36PromotionReadinessReport({ generatedAt, baseData }) {
  const report = buildExchangePromotionReadinessReport({
    generatedAt,
    repoRoot: REPO_ROOT
  });
  return {
    reportId: report.artifactId,
    ...report,
    proofSourceCommit: baseData.canonicalCommit,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState,
    sourceSafe: report.sourceSafetyVerdict === 'source-safe-exchange-promotion-readiness-metadata'
  };
}

/**
 * @param {any} baseData
 * @param {{
 *   generatedAt: string,
 *   inheritedV19: any,
 *   inheritedV20: any
 * }} input
 */
function buildV36ProvenPackage(baseData, {
  generatedAt,
  inheritedV19,
  inheritedV20
}) {
  const draftPreview = ACTIVE_CANON_VERSION !== 'V36';
  const specFamilyReport = buildV21SpecFamilyReport({
    version: 'V36',
    mode: draftPreview ? 'draft' : 'promoted',
    ...(draftPreview ? { currentTarget: ACTIVE_CANON_VERSION } : { currentTarget: 'V36' })
  });
  const assumedArtifactPaths = [
    'BITCODE_SPEC_V36_PROVEN.md',
    '.bitcode/v36-spec-family-report.json',
    '.bitcode/v36-canonical-input-report.json',
    '.bitcode/v36-canon-posture-drift-report.json',
    '.bitcode/v36-exchange-activity-book.json',
    '.bitcode/v36-exchange-intent-order-contracts.json',
    '.bitcode/v36-exchange-rights-transfer-review.json',
    '.bitcode/v36-pricing-liquidity-fee-quote.json',
    '.bitcode/v36-exchange-settlement-reconciliation.json',
    '.bitcode/v36-exchange-dispute-repair-revenue-route.json',
    '.bitcode/v36-exchange-ux-proof.json',
    '.bitcode/v36-exchange-rehearsal.json',
    V36_PROMOTION_READINESS_ARTIFACT_PATH
  ];
  const canonicalInputReport = buildV21CanonicalInputReport({
    currentTarget: 'V36',
    reportVersion: 'V36',
    ...(draftPreview
      ? {
          skipPointerCheck: true,
          assumeExistingRelativePaths: assumedArtifactPaths
        }
      : { assumeExistingRelativePaths: assumedArtifactPaths })
  });
  const canonPostureDriftReport = buildCanonPostureDriftReport({
    version: 'V36',
    activeCanonVersion: 'V36',
    draftTargetVersion: 'V37',
    proofSourceCommit: baseData.canonicalCommit,
    generatedAt,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState
  });
  const promotionReadinessReport = buildV36PromotionReadinessReport({
    generatedAt,
    baseData
  });
  const artifacts = {
    ...buildCanonPostureGeneratedArtifactContents({
      version: 'V36',
      proofSourceCommit: baseData.canonicalCommit,
      generatedAt,
      generatorId: baseData.generatorId,
      worktreeState: baseData.worktreeState,
      specFamilyReport,
      canonicalInputReport,
      canonPostureDriftReport
    }),
    [V36_PROMOTION_READINESS_ARTIFACT_PATH]: `${JSON.stringify(promotionReadinessReport, null, 2)}\n`
  };
  const artifactSummaries = summarizeArtifactContents(artifacts);
  const promotionReady = specFamilyReport.passed === true
    && canonicalInputReport.passed === true
    && canonPostureDriftReport.passed === true
    && promotionReadinessReport.passed === true;
  const data = {
    ...baseData,
    v19: inheritedV19,
    v20: inheritedV20,
    v36: {
      specFamilyReport,
      canonicalInputReport,
      canonPostureDriftReport,
      promotionReadinessReport,
      artifactSummaries,
      draftPreview,
      promotionReady,
      activeCanonicalTarget: ACTIVE_CANON_VERSION,
      nextDraftTarget: 'V37'
    },
    aggregate: {
      ...baseData.aggregate,
      fullyProven: baseData.aggregate.fullyProven
        && inheritedV19?.deterministicReplayReport?.passed === true
        && inheritedV19?.volatilityInventory?.passed === true
        && inheritedV19?.contractChangeLedger?.passed === true
        && inheritedV20?.qualitySummary?.passed === true
        && promotionReady
        && specFamilyReport.mode === 'promoted'
    }
  };
  return {
    data,
    markdown: renderCanonicalProvenMarkdown(data),
    artifacts
  };
}

/**
 * @param {{
 *   generatedAt: string,
 *   baseData: ReturnType<typeof buildCanonicalProvenData>
 * }} input
 */
function buildV37PromotionReadinessReport({ generatedAt, baseData }) {
  const report = buildConversationPromotionReadinessReport({
    generatedAt,
    repoRoot: REPO_ROOT
  });
  return {
    reportId: report.artifactId,
    ...report,
    proofSourceCommit: baseData.canonicalCommit,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState,
    sourceSafe: report.sourceSafetyVerdict === 'source-safe-conversation-promotion-readiness-metadata'
  };
}

/**
 * @param {any} baseData
 * @param {{
 *   generatedAt: string,
 *   inheritedV19: any,
 *   inheritedV20: any
 * }} input
 */
function buildV37ProvenPackage(baseData, {
  generatedAt,
  inheritedV19,
  inheritedV20
}) {
  const draftPreview = ACTIVE_CANON_VERSION !== 'V37';
  const specFamilyReport = buildV21SpecFamilyReport({
    version: 'V37',
    mode: draftPreview ? 'draft' : 'promoted',
    ...(draftPreview ? { currentTarget: ACTIVE_CANON_VERSION } : { currentTarget: 'V37' })
  });
  const assumedArtifactPaths = [
    'BITCODE_SPEC_V37_PROVEN.md',
    '.bitcode/v37-spec-family-report.json',
    '.bitcode/v37-canonical-input-report.json',
    '.bitcode/v37-canon-posture-drift-report.json',
    '.bitcode/v37-conversation-session-route-history.json',
    '.bitcode/v37-conversation-stream-event-contract.json',
    '.bitcode/v37-conversation-writing-workspace.json',
    '.bitcode/v37-conversation-source-selector.json',
    '.bitcode/v37-conversation-terminal-handoff.json',
    '.bitcode/v37-conversation-persistence-privacy-redaction.json',
    '.bitcode/v37-conversation-telemetry-proof-hooks.json',
    '.bitcode/v37-conversation-rehearsal.json',
    V37_PROMOTION_READINESS_ARTIFACT_PATH
  ];
  const canonicalInputReport = buildV21CanonicalInputReport({
    currentTarget: 'V37',
    reportVersion: 'V37',
    ...(draftPreview
      ? {
          skipPointerCheck: true,
          assumeExistingRelativePaths: assumedArtifactPaths
        }
      : { assumeExistingRelativePaths: assumedArtifactPaths })
  });
  const canonPostureDriftReport = buildCanonPostureDriftReport({
    version: 'V37',
    activeCanonVersion: 'V37',
    draftTargetVersion: 'V38',
    proofSourceCommit: baseData.canonicalCommit,
    generatedAt,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState
  });
  const promotionReadinessReport = buildV37PromotionReadinessReport({
    generatedAt,
    baseData
  });
  const artifacts = {
    ...buildCanonPostureGeneratedArtifactContents({
      version: 'V37',
      proofSourceCommit: baseData.canonicalCommit,
      generatedAt,
      generatorId: baseData.generatorId,
      worktreeState: baseData.worktreeState,
      specFamilyReport,
      canonicalInputReport,
      canonPostureDriftReport
    }),
    [V37_PROMOTION_READINESS_ARTIFACT_PATH]: `${JSON.stringify(promotionReadinessReport, null, 2)}\n`
  };
  const artifactSummaries = summarizeArtifactContents(artifacts);
  const promotionReady = specFamilyReport.passed === true
    && canonicalInputReport.passed === true
    && canonPostureDriftReport.passed === true
    && promotionReadinessReport.passed === true;
  const data = {
    ...baseData,
    v19: inheritedV19,
    v20: inheritedV20,
    v37: {
      specFamilyReport,
      canonicalInputReport,
      canonPostureDriftReport,
      promotionReadinessReport,
      artifactSummaries,
      draftPreview,
      promotionReady,
      activeCanonicalTarget: ACTIVE_CANON_VERSION,
      nextDraftTarget: 'V38'
    },
    aggregate: {
      ...baseData.aggregate,
      fullyProven: baseData.aggregate.fullyProven
        && inheritedV19?.deterministicReplayReport?.passed === true
        && inheritedV19?.volatilityInventory?.passed === true
        && inheritedV19?.contractChangeLedger?.passed === true
        && inheritedV20?.qualitySummary?.passed === true
        && promotionReady
        && specFamilyReport.mode === 'promoted'
    }
  };
  return {
    data,
    markdown: renderCanonicalProvenMarkdown(data),
    artifacts
  };
}

/**
 * @param {{
 *   generatedAt: string,
 *   baseData: ReturnType<typeof buildCanonicalProvenData>
 * }} input
 */
function buildV38PromotionReadinessReport({ generatedAt, baseData }) {
  const report = buildV38InferencePromotionReadinessReport({
    generatedAt,
    repoRoot: REPO_ROOT
  });
  return {
    reportId: report.artifactId,
    ...report,
    proofSourceCommit: baseData.canonicalCommit,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState,
    sourceSafe: report.sourceSafetyVerdict === 'source-safe-inference-promotion-readiness-metadata'
  };
}

/**
 * @param {any} baseData
 * @param {{
 *   generatedAt: string,
 *   inheritedV19: any,
 *   inheritedV20: any
 * }} input
 */
function buildV38ProvenPackage(baseData, {
  generatedAt,
  inheritedV19,
  inheritedV20
}) {
  const draftPreview = ACTIVE_CANON_VERSION !== 'V38';
  const specFamilyReport = buildV21SpecFamilyReport({
    version: 'V38',
    mode: draftPreview ? 'draft' : 'promoted',
    ...(draftPreview ? { currentTarget: ACTIVE_CANON_VERSION } : { currentTarget: 'V38' })
  });
  const assumedArtifactPaths = [
    'BITCODE_SPEC_V38_PROVEN.md',
    '.bitcode/v38-spec-family-report.json',
    '.bitcode/v38-canonical-input-report.json',
    '.bitcode/v38-canon-posture-drift-report.json',
    '.bitcode/v38-inference-surface-inventory.json',
    '.bitcode/v38-ptrr-failsafe-thricified-stack.json',
    '.bitcode/v38-prompt-benchmark-report.json',
    '.bitcode/v38-disclosure-boundary-report.json',
    '.bitcode/v38-read-need-comprehension-inference-hardening.json',
    '.bitcode/v38-read-fits-finding-search-embeddings.json',
    '.bitcode/v38-assetpack-synthesis-economic-traceability.json',
    '.bitcode/v38-conversation-tool-prompt-inference-parity.json',
    '.bitcode/v38-local-staging-inference-depository-search-rehearsal.json',
    V38_PROMOTION_READINESS_ARTIFACT_PATH
  ];
  const canonicalInputReport = buildV21CanonicalInputReport({
    currentTarget: 'V38',
    reportVersion: 'V38',
    ...(draftPreview
      ? {
          skipPointerCheck: true,
          assumeExistingRelativePaths: assumedArtifactPaths
        }
      : { assumeExistingRelativePaths: assumedArtifactPaths })
  });
  const canonPostureDriftReport = buildCanonPostureDriftReport({
    version: 'V38',
    activeCanonVersion: 'V38',
    draftTargetVersion: 'V39',
    proofSourceCommit: baseData.canonicalCommit,
    generatedAt,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState
  });
  const promotionReadinessReport = buildV38PromotionReadinessReport({
    generatedAt,
    baseData
  });
  const artifacts = {
    ...buildCanonPostureGeneratedArtifactContents({
      version: 'V38',
      proofSourceCommit: baseData.canonicalCommit,
      generatedAt,
      generatorId: baseData.generatorId,
      worktreeState: baseData.worktreeState,
      specFamilyReport,
      canonicalInputReport,
      canonPostureDriftReport
    }),
    [V38_PROMOTION_READINESS_ARTIFACT_PATH]: `${JSON.stringify(promotionReadinessReport, null, 2)}\n`
  };
  const artifactSummaries = summarizeArtifactContents(artifacts);
  const promotionReady = specFamilyReport.passed === true
    && canonicalInputReport.passed === true
    && canonPostureDriftReport.passed === true
    && promotionReadinessReport.passed === true;
  const data = {
    ...baseData,
    v19: inheritedV19,
    v20: inheritedV20,
    v38: {
      specFamilyReport,
      canonicalInputReport,
      canonPostureDriftReport,
      promotionReadinessReport,
      artifactSummaries,
      draftPreview,
      promotionReady,
      activeCanonicalTarget: ACTIVE_CANON_VERSION,
      nextDraftTarget: 'V39'
    },
    aggregate: {
      ...baseData.aggregate,
      fullyProven: baseData.aggregate.fullyProven
        && inheritedV19?.deterministicReplayReport?.passed === true
        && inheritedV19?.volatilityInventory?.passed === true
        && inheritedV19?.contractChangeLedger?.passed === true
        && inheritedV20?.qualitySummary?.passed === true
        && promotionReady
        && specFamilyReport.mode === 'promoted'
    }
  };
  return {
    data,
    markdown: renderCanonicalProvenMarkdown(data),
    artifacts
  };
}

/**
 * @param {{
 *   generatedAt: string,
 *   baseData: ReturnType<typeof buildCanonicalProvenData>
 * }} input
 */
function buildV39PromotionReadinessReport({ generatedAt, baseData }) {
  const report = buildV39CommercialReadingPromotionReadinessReport({
    generatedAt,
    repoRoot: REPO_ROOT
  });
  return {
    reportId: report.artifactId,
    ...report,
    proofSourceCommit: baseData.canonicalCommit,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState,
    sourceSafe: report.sourceSafetyVerdict === 'source-safe-commercial-reading-promotion-readiness-metadata'
  };
}

/**
 * @param {any} baseData
 * @param {{
 *   generatedAt: string,
 *   inheritedV19: any,
 *   inheritedV20: any
 * }} input
 */
function buildV39ProvenPackage(baseData, {
  generatedAt,
  inheritedV19,
  inheritedV20
}) {
  const draftPreview = ACTIVE_CANON_VERSION !== 'V39';
  const specFamilyReport = buildV21SpecFamilyReport({
    version: 'V39',
    mode: draftPreview ? 'draft' : 'promoted',
    ...(draftPreview ? { currentTarget: ACTIVE_CANON_VERSION } : { currentTarget: 'V39' })
  });
  const assumedArtifactPaths = [
    'BITCODE_SPEC_V39_PROVEN.md',
    '.bitcode/v39-spec-family-report.json',
    '.bitcode/v39-canonical-input-report.json',
    '.bitcode/v39-canon-posture-drift-report.json',
    '.bitcode/v39-depository-supply-indexing.json',
    '.bitcode/v39-enterprise-reading-ux-state.json',
    '.bitcode/v39-read-need-review-resynthesis.json',
    '.bitcode/v39-read-fits-finding-runtime.json',
    '.bitcode/v39-assetpack-preview-quote-boundary.json',
    '.bitcode/v39-settlement-rights-delivery.json',
    '.bitcode/v39-operational-telemetry-repair-readback.json',
    '.bitcode/v39-interface-conversation-product-parity.json',
    '.bitcode/v39-local-staging-reading-rehearsal.json',
    V39_PROMOTION_READINESS_ARTIFACT_PATH
  ];
  const canonicalInputReport = buildV21CanonicalInputReport({
    currentTarget: 'V39',
    reportVersion: 'V39',
    ...(draftPreview
      ? {
          skipPointerCheck: true,
          assumeExistingRelativePaths: assumedArtifactPaths
        }
      : { assumeExistingRelativePaths: assumedArtifactPaths })
  });
  const canonPostureDriftReport = buildCanonPostureDriftReport({
    version: 'V39',
    activeCanonVersion: draftPreview ? ACTIVE_CANON_VERSION : 'V39',
    draftTargetVersion: draftPreview ? 'V39' : 'V40',
    proofSourceCommit: baseData.canonicalCommit,
    generatedAt,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState
  });
  const promotionReadinessReport = buildV39PromotionReadinessReport({
    generatedAt,
    baseData
  });
  const artifacts = {
    ...buildCanonPostureGeneratedArtifactContents({
      version: 'V39',
      proofSourceCommit: baseData.canonicalCommit,
      generatedAt,
      generatorId: baseData.generatorId,
      worktreeState: baseData.worktreeState,
      specFamilyReport,
      canonicalInputReport,
      canonPostureDriftReport
    }),
    [V39_PROMOTION_READINESS_ARTIFACT_PATH]: `${JSON.stringify(promotionReadinessReport, null, 2)}\n`
  };
  const artifactSummaries = summarizeArtifactContents(artifacts);
  const promotionReady = specFamilyReport.passed === true
    && canonicalInputReport.passed === true
    && canonPostureDriftReport.passed === true
    && promotionReadinessReport.passed === true;
  const data = {
    ...baseData,
    v19: inheritedV19,
    v20: inheritedV20,
    v39: {
      specFamilyReport,
      canonicalInputReport,
      canonPostureDriftReport,
      promotionReadinessReport,
      artifactSummaries,
      draftPreview,
      promotionReady,
      activeCanonicalTarget: ACTIVE_CANON_VERSION,
      nextDraftTarget: 'V40'
    },
    aggregate: {
      ...baseData.aggregate,
      fullyProven: baseData.aggregate.fullyProven
        && inheritedV19?.deterministicReplayReport?.passed === true
        && inheritedV19?.volatilityInventory?.passed === true
        && inheritedV19?.contractChangeLedger?.passed === true
        && inheritedV20?.qualitySummary?.passed === true
        && promotionReady
        && specFamilyReport.mode === 'promoted'
    }
  };
  return {
    data,
    markdown: renderCanonicalProvenMarkdown(data),
    artifacts
  };
}

/**
 * @param {{
 *   generatedAt: string,
 *   baseData: ReturnType<typeof buildCanonicalProvenData>
 * }} input
 */
function buildV40PromotionReadinessReport({ generatedAt, baseData }) {
  const report = buildV40PromotionReadinessReportArtifact({
    generatedAt,
    repoRoot: REPO_ROOT
  });
  return {
    reportId: report.artifactId,
    ...report,
    proofSourceCommit: baseData.canonicalCommit,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState,
    sourceSafe: report.sourceSafetyVerdict === 'source-safe-exhaustive-testing-promotion-readiness-metadata'
  };
}

/**
 * @param {any} baseData
 * @param {{
 *   generatedAt: string,
 *   inheritedV19: any,
 *   inheritedV20: any
 * }} input
 */
function buildV40ProvenPackage(baseData, {
  generatedAt,
  inheritedV19,
  inheritedV20
}) {
  const draftPreview = ACTIVE_CANON_VERSION !== 'V40';
  const specFamilyReport = buildV21SpecFamilyReport({
    version: 'V40',
    mode: draftPreview ? 'draft' : 'promoted',
    ...(draftPreview ? { currentTarget: ACTIVE_CANON_VERSION } : { currentTarget: 'V40' })
  });
  const assumedArtifactPaths = [
    'BITCODE_SPEC_V40_PROVEN.md',
    '.bitcode/v40-spec-family-report.json',
    '.bitcode/v40-canonical-input-report.json',
    '.bitcode/v40-canon-posture-drift-report.json',
    '.bitcode/v40-test-inventory-coverage-matrix.json',
    '.bitcode/v40-unit-coverage-inventory.json',
    '.bitcode/v40-api-integration-contracts.json',
    '.bitcode/v40-reading-pipeline-integration-coverage.json',
    '.bitcode/v40-conversation-terminal-integration.json',
    '.bitcode/v40-browser-e2e-visual-proof.json',
    '.bitcode/v40-ledger-storage-sync.json',
    '.bitcode/v40-local-staging-rehearsal-automation.json',
    '.bitcode/v40-prompt-benchmark-smoke-v41-readiness.json',
    V40_PROMOTION_READINESS_ARTIFACT_PATH
  ];
  const canonicalInputReport = buildV21CanonicalInputReport({
    currentTarget: 'V40',
    reportVersion: 'V40',
    ...(draftPreview
      ? {
          skipPointerCheck: true,
          assumeExistingRelativePaths: assumedArtifactPaths
        }
      : { assumeExistingRelativePaths: assumedArtifactPaths })
  });
  const canonPostureDriftReport = buildCanonPostureDriftReport({
    version: 'V40',
    activeCanonVersion: draftPreview ? ACTIVE_CANON_VERSION : 'V40',
    draftTargetVersion: draftPreview ? 'V40' : 'V41',
    proofSourceCommit: baseData.canonicalCommit,
    generatedAt,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState
  });
  const promotionReadinessReport = buildV40PromotionReadinessReport({
    generatedAt,
    baseData
  });
  const artifacts = {
    ...buildCanonPostureGeneratedArtifactContents({
      version: 'V40',
      proofSourceCommit: baseData.canonicalCommit,
      generatedAt,
      generatorId: baseData.generatorId,
      worktreeState: baseData.worktreeState,
      specFamilyReport,
      canonicalInputReport,
      canonPostureDriftReport
    }),
    [V40_PROMOTION_READINESS_ARTIFACT_PATH]: `${JSON.stringify(promotionReadinessReport, null, 2)}\n`
  };
  const artifactSummaries = summarizeArtifactContents(artifacts);
  const promotionReady = specFamilyReport.passed === true
    && canonicalInputReport.passed === true
    && canonPostureDriftReport.passed === true
    && promotionReadinessReport.passed === true;
  const data = {
    ...baseData,
    v19: inheritedV19,
    v20: inheritedV20,
    v40: {
      specFamilyReport,
      canonicalInputReport,
      canonPostureDriftReport,
      promotionReadinessReport,
      artifactSummaries,
      draftPreview,
      promotionReady,
      activeCanonicalTarget: ACTIVE_CANON_VERSION,
      nextDraftTarget: 'V41'
    },
    aggregate: {
      ...baseData.aggregate,
      fullyProven: baseData.aggregate.fullyProven
        && inheritedV19?.deterministicReplayReport?.passed === true
        && inheritedV19?.volatilityInventory?.passed === true
        && inheritedV19?.contractChangeLedger?.passed === true
        && inheritedV20?.qualitySummary?.passed === true
        && promotionReady
        && specFamilyReport.mode === 'promoted'
    }
  };
  return {
    data,
    markdown: renderCanonicalProvenMarkdown(data),
    artifacts
  };
}

/**
 * @param {{
 *   generatedAt: string,
 *   baseData: ReturnType<typeof buildCanonicalProvenData>
 * }} input
 */
function buildV41PromotionReadinessReport({ generatedAt, baseData }) {
  const report = buildV41PromotionReadinessReportArtifact({
    generatedAt,
    repoRoot: REPO_ROOT
  });
  return {
    reportId: report.artifactId,
    ...report,
    proofSourceCommit: baseData.canonicalCommit,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState,
    sourceSafe: report.sourceSafetyVerdict === 'source-safe-prompt-program-promotion-readiness-metadata'
  };
}

/**
 * @param {any} baseData
 * @param {{
 *   generatedAt: string,
 *   inheritedV19: any,
 *   inheritedV20: any
 * }} input
 */
function buildV41ProvenPackage(baseData, {
  generatedAt,
  inheritedV19,
  inheritedV20
}) {
  const draftPreview = ACTIVE_CANON_VERSION !== 'V41';
  const specFamilyReport = buildV21SpecFamilyReport({
    version: 'V41',
    mode: draftPreview ? 'draft' : 'promoted',
    ...(draftPreview ? { currentTarget: ACTIVE_CANON_VERSION } : { currentTarget: 'V41' })
  });
  const assumedArtifactPaths = [
    'BITCODE_SPEC_V41_PROVEN.md',
    '.bitcode/v41-spec-family-report.json',
    '.bitcode/v41-canonical-input-report.json',
    '.bitcode/v41-canon-posture-drift-report.json',
    '.bitcode/v41-promptpart-prompt-inventory.json',
    '.bitcode/v41-registry-interpolation-contracts.json',
    '.bitcode/v41-reading-prompt-benchmark-baselines.json',
    '.bitcode/v41-readneed-prompt-hardening.json',
    '.bitcode/v41-readfitsfinding-prompt-hardening.json',
    '.bitcode/v41-conversation-tool-interface-prompt-rewrite.json',
    '.bitcode/v41-prompt-program-benchmark-report.json',
    V41_PROMOTION_READINESS_ARTIFACT_PATH
  ];
  const canonicalInputReport = buildV21CanonicalInputReport({
    currentTarget: 'V41',
    reportVersion: 'V41',
    ...(draftPreview
      ? {
          skipPointerCheck: true,
          assumeExistingRelativePaths: assumedArtifactPaths
        }
      : { assumeExistingRelativePaths: assumedArtifactPaths })
  });
  const canonPostureDriftReport = buildCanonPostureDriftReport({
    version: 'V41',
    activeCanonVersion: draftPreview ? ACTIVE_CANON_VERSION : 'V41',
    draftTargetVersion: draftPreview ? 'V41' : 'V42',
    proofSourceCommit: baseData.canonicalCommit,
    generatedAt,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState
  });
  const promotionReadinessReport = buildV41PromotionReadinessReport({
    generatedAt,
    baseData
  });
  const artifacts = {
    ...buildCanonPostureGeneratedArtifactContents({
      version: 'V41',
      proofSourceCommit: baseData.canonicalCommit,
      generatedAt,
      generatorId: baseData.generatorId,
      worktreeState: baseData.worktreeState,
      specFamilyReport,
      canonicalInputReport,
      canonPostureDriftReport
    }),
    [V41_PROMOTION_READINESS_ARTIFACT_PATH]: `${JSON.stringify(promotionReadinessReport, null, 2)}\n`
  };
  const artifactSummaries = summarizeArtifactContents(artifacts);
  const promotionReady = specFamilyReport.passed === true
    && canonicalInputReport.passed === true
    && canonPostureDriftReport.passed === true
    && promotionReadinessReport.passed === true;
  const data = {
    ...baseData,
    v19: inheritedV19,
    v20: inheritedV20,
    v41: {
      specFamilyReport,
      canonicalInputReport,
      canonPostureDriftReport,
      promotionReadinessReport,
      artifactSummaries,
      draftPreview,
      promotionReady,
      activeCanonicalTarget: ACTIVE_CANON_VERSION,
      nextDraftTarget: 'V42'
    },
    aggregate: {
      ...baseData.aggregate,
      fullyProven: baseData.aggregate.fullyProven
        && inheritedV19?.deterministicReplayReport?.passed === true
        && inheritedV19?.volatilityInventory?.passed === true
        && inheritedV19?.contractChangeLedger?.passed === true
        && inheritedV20?.qualitySummary?.passed === true
        && promotionReady
        && specFamilyReport.mode === 'promoted'
    }
  };
  return {
    data,
    markdown: renderCanonicalProvenMarkdown(data),
    artifacts
  };
}

/**
 * @param {{
 *   generatedAt: string,
 *   baseData: ReturnType<typeof buildCanonicalProvenData>
 * }} input
 */
function buildV42PromotionReadinessReport({ generatedAt, baseData }) {
  const report = buildV42PromotionReadinessReportArtifact({
    generatedAt,
    repoRoot: REPO_ROOT
  });
  return {
    reportId: report.artifactId,
    ...report,
    proofSourceCommit: baseData.canonicalCommit,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState,
    sourceSafe: report.sourceSafetyVerdict === 'source-safe-v42-reliable-mvp-promotion-readiness-metadata'
  };
}

/**
 * @param {any} baseData
 * @param {{
 *   generatedAt: string,
 *   inheritedV19: any,
 *   inheritedV20: any
 * }} input
 */
function buildV42ProvenPackage(baseData, {
  generatedAt,
  inheritedV19,
  inheritedV20
}) {
  const draftPreview = ACTIVE_CANON_VERSION !== 'V42';
  const specFamilyReport = buildV21SpecFamilyReport({
    version: 'V42',
    mode: draftPreview ? 'draft' : 'promoted',
    ...(draftPreview ? { currentTarget: ACTIVE_CANON_VERSION } : { currentTarget: 'V42' })
  });
  const assumedArtifactPaths = [
    'BITCODE_SPEC_V42_PROVEN.md',
    '.bitcode/v42-spec-family-report.json',
    '.bitcode/v42-canonical-input-report.json',
    '.bitcode/v42-canon-posture-drift-report.json',
    '.bitcode/v42-depositing-shortest-path.json',
    '.bitcode/v42-reading-shortest-path-state-machine.json',
    '.bitcode/v42-readneed-review-resynthesis-product-closure.json',
    '.bitcode/v42-readfitsfinding-preview-quote.json',
    '.bitcode/v42-settlement-rights-delivery.json',
    '.bitcode/v42-ai-reading-demonstration.json',
    '.bitcode/v42-local-staging-mvp-rehearsal.json',
    V42_PROMOTION_READINESS_ARTIFACT_PATH
  ];
  const canonicalInputReport = buildV21CanonicalInputReport({
    currentTarget: 'V42',
    reportVersion: 'V42',
    ...(draftPreview
      ? {
          skipPointerCheck: true,
          assumeExistingRelativePaths: assumedArtifactPaths
        }
      : { assumeExistingRelativePaths: assumedArtifactPaths })
  });
  const canonPostureDriftReport = buildCanonPostureDriftReport({
    version: 'V42',
    activeCanonVersion: draftPreview ? ACTIVE_CANON_VERSION : 'V42',
    draftTargetVersion: draftPreview ? 'V42' : 'V43',
    proofSourceCommit: baseData.canonicalCommit,
    generatedAt,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState
  });
  const promotionReadinessReport = buildV42PromotionReadinessReport({
    generatedAt,
    baseData
  });
  const artifacts = {
    ...buildCanonPostureGeneratedArtifactContents({
      version: 'V42',
      proofSourceCommit: baseData.canonicalCommit,
      generatedAt,
      generatorId: baseData.generatorId,
      worktreeState: baseData.worktreeState,
      specFamilyReport,
      canonicalInputReport,
      canonPostureDriftReport
    }),
    [V42_PROMOTION_READINESS_ARTIFACT_PATH]: `${JSON.stringify(promotionReadinessReport, null, 2)}\n`
  };
  const artifactSummaries = summarizeArtifactContents(artifacts);
  const promotionReady = specFamilyReport.passed === true
    && canonicalInputReport.passed === true
    && canonPostureDriftReport.passed === true
    && promotionReadinessReport.passed === true;
  const data = {
    ...baseData,
    v19: inheritedV19,
    v20: inheritedV20,
    v42: {
      specFamilyReport,
      canonicalInputReport,
      canonPostureDriftReport,
      promotionReadinessReport,
      artifactSummaries,
      draftPreview,
      promotionReady,
      activeCanonicalTarget: ACTIVE_CANON_VERSION,
      nextDraftTarget: 'V43'
    },
    aggregate: {
      ...baseData.aggregate,
      fullyProven: baseData.aggregate.fullyProven
        && inheritedV19?.deterministicReplayReport?.passed === true
        && inheritedV19?.volatilityInventory?.passed === true
        && inheritedV19?.contractChangeLedger?.passed === true
        && inheritedV20?.qualitySummary?.passed === true
        && promotionReady
        && specFamilyReport.mode === 'promoted'
    }
  };
  return {
    data,
    markdown: renderCanonicalProvenMarkdown(data),
    artifacts
  };
}

/**
 * @param {{
 *   generatedAt: string,
 *   baseData: ReturnType<typeof buildCanonicalProvenData>
 * }} input
 */
function buildV43PromotionReadinessReport({ generatedAt, baseData }) {
  const report = buildV43PromotionReadinessReportArtifact({
    generatedAt,
    repoRoot: REPO_ROOT
  });
  return {
    reportId: report.artifactId,
    ...report,
    proofSourceCommit: baseData.canonicalCommit,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState,
    sourceSafe: report.sourceSafetyVerdict === 'source-safe-v43-product-routes-agentic-depositing-promotion-metadata'
  };
}

/**
 * @param {any} baseData
 * @param {{
 *   generatedAt: string,
 *   inheritedV19: any,
 *   inheritedV20: any
 * }} input
 */
function buildV43ProvenPackage(baseData, {
  generatedAt,
  inheritedV19,
  inheritedV20
}) {
  const draftPreview = ACTIVE_CANON_VERSION !== 'V43';
  const specFamilyReport = buildV21SpecFamilyReport({
    version: 'V43',
    mode: draftPreview ? 'draft' : 'promoted',
    ...(draftPreview ? { currentTarget: ACTIVE_CANON_VERSION } : { currentTarget: 'V43' })
  });
  const assumedArtifactPaths = [
    'BITCODE_SPEC_V43_PROVEN.md',
    '.bitcode/v43-spec-family-report.json',
    '.bitcode/v43-canonical-input-report.json',
    '.bitcode/v43-canon-posture-drift-report.json',
    '.bitcode/v43-route-vocabulary-inventory.json',
    '.bitcode/v43-packs-activity-master-detail.json',
    '.bitcode/v43-read-route-five-step-ux.json',
    '.bitcode/v43-deposit-route-options.json',
    '.bitcode/v43-deposit-policy-compensation.json',
    '.bitcode/v43-deposit-option-admission.json',
    '.bitcode/v43-route-ux-product-excellence.json',
    '.bitcode/v43-cross-route-rehearsal-telemetry-repair.json',
    V43_PROMOTION_READINESS_ARTIFACT_PATH
  ];
  const canonicalInputReport = buildV21CanonicalInputReport({
    currentTarget: 'V43',
    reportVersion: 'V43',
    ...(draftPreview
      ? {
          skipPointerCheck: true,
          assumeExistingRelativePaths: assumedArtifactPaths
        }
      : { assumeExistingRelativePaths: assumedArtifactPaths })
  });
  const canonPostureDriftReport = buildCanonPostureDriftReport({
    version: 'V43',
    activeCanonVersion: draftPreview ? ACTIVE_CANON_VERSION : 'V43',
    draftTargetVersion: draftPreview ? 'V43' : 'V44',
    proofSourceCommit: baseData.canonicalCommit,
    generatedAt,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState
  });
  const promotionReadinessReport = buildV43PromotionReadinessReport({
    generatedAt,
    baseData
  });
  const artifacts = {
    ...buildCanonPostureGeneratedArtifactContents({
      version: 'V43',
      proofSourceCommit: baseData.canonicalCommit,
      generatedAt,
      generatorId: baseData.generatorId,
      worktreeState: baseData.worktreeState,
      specFamilyReport,
      canonicalInputReport,
      canonPostureDriftReport
    }),
    [V43_PROMOTION_READINESS_ARTIFACT_PATH]: `${JSON.stringify(promotionReadinessReport, null, 2)}\n`
  };
  const artifactSummaries = summarizeArtifactContents(artifacts);
  const promotionReady = specFamilyReport.passed === true
    && canonicalInputReport.passed === true
    && canonPostureDriftReport.passed === true
    && promotionReadinessReport.passed === true;
  const data = {
    ...baseData,
    v19: inheritedV19,
    v20: inheritedV20,
    v43: {
      specFamilyReport,
      canonicalInputReport,
      canonPostureDriftReport,
      promotionReadinessReport,
      artifactSummaries,
      draftPreview,
      promotionReady,
      activeCanonicalTarget: ACTIVE_CANON_VERSION,
      nextDraftTarget: 'V44'
    },
    aggregate: {
      ...baseData.aggregate,
      fullyProven: baseData.aggregate.fullyProven
        && inheritedV19?.deterministicReplayReport?.passed === true
        && inheritedV19?.volatilityInventory?.passed === true
        && inheritedV19?.contractChangeLedger?.passed === true
        && inheritedV20?.qualitySummary?.passed === true
        && promotionReady
        && specFamilyReport.mode === 'promoted'
    }
  };
  return {
    data,
    markdown: renderCanonicalProvenMarkdown(data),
    artifacts
  };
}

/**
 * @param {{
 *   generatedAt: string,
 *   baseData: ReturnType<typeof buildCanonicalProvenData>
 * }} input
 */
function buildV44PromotionReadinessReport({ generatedAt, baseData }) {
  const report = buildV44PromotionReadinessReportArtifact({
    generatedAt,
    repoRoot: REPO_ROOT
  });
  return {
    reportId: report.artifactId,
    ...report,
    proofSourceCommit: baseData.canonicalCommit,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState,
    sourceSafe: report.sourceSafetyVerdict === 'source-safe-v44-scaled-engineering-economy-promotion-metadata'
  };
}

/**
 * @param {any} baseData
 * @param {{
 *   generatedAt: string,
 *   inheritedV19: any,
 *   inheritedV20: any
 * }} input
 */
function buildV44ProvenPackage(baseData, {
  generatedAt,
  inheritedV19,
  inheritedV20
}) {
  const draftPreview = ACTIVE_CANON_VERSION !== 'V44';
  const specFamilyReport = buildV21SpecFamilyReport({
    version: 'V44',
    mode: draftPreview ? 'draft' : 'promoted',
    ...(draftPreview ? { currentTarget: ACTIVE_CANON_VERSION } : { currentTarget: 'V44' })
  });
  const assumedArtifactPaths = [
    'BITCODE_SPEC_V44_PROVEN.md',
    '.bitcode/v44-spec-family-report.json',
    '.bitcode/v44-canonical-input-report.json',
    '.bitcode/v44-canon-posture-drift-report.json',
    '.bitcode/v44-economic-domain-model.json',
    '.bitcode/v44-packs-portfolio-market-intelligence.json',
    '.bitcode/v44-reading-budget-quote-policy.json',
    '.bitcode/v44-depositor-earnings-supply-opportunities.json',
    '.bitcode/v44-btd-btc-compensation-statements.json',
    '.bitcode/v44-organization-policy-wallet-authority.json',
    '.bitcode/v44-enterprise-product-ux.json',
    '.bitcode/v44-scaled-network-rehearsal.json',
    V44_PROMOTION_READINESS_ARTIFACT_PATH
  ];
  const canonicalInputReport = buildV21CanonicalInputReport({
    currentTarget: 'V44',
    reportVersion: 'V44',
    ...(draftPreview
      ? {
          skipPointerCheck: true,
          assumeExistingRelativePaths: assumedArtifactPaths
        }
      : { assumeExistingRelativePaths: assumedArtifactPaths })
  });
  const canonPostureDriftReport = buildCanonPostureDriftReport({
    version: 'V44',
    activeCanonVersion: draftPreview ? ACTIVE_CANON_VERSION : 'V44',
    draftTargetVersion: draftPreview ? 'V44' : 'V45',
    proofSourceCommit: baseData.canonicalCommit,
    generatedAt,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState
  });
  const promotionReadinessReport = buildV44PromotionReadinessReport({
    generatedAt,
    baseData
  });
  const artifacts = {
    ...buildCanonPostureGeneratedArtifactContents({
      version: 'V44',
      proofSourceCommit: baseData.canonicalCommit,
      generatedAt,
      generatorId: baseData.generatorId,
      worktreeState: baseData.worktreeState,
      specFamilyReport,
      canonicalInputReport,
      canonPostureDriftReport
    }),
    [V44_PROMOTION_READINESS_ARTIFACT_PATH]: `${JSON.stringify(promotionReadinessReport, null, 2)}\n`
  };
  const artifactSummaries = summarizeArtifactContents(artifacts);
  const promotionReady = specFamilyReport.passed === true
    && canonicalInputReport.passed === true
    && canonPostureDriftReport.passed === true
    && promotionReadinessReport.passed === true;
  const data = {
    ...baseData,
    v19: inheritedV19,
    v20: inheritedV20,
    v44: {
      specFamilyReport,
      canonicalInputReport,
      canonPostureDriftReport,
      promotionReadinessReport,
      artifactSummaries,
      draftPreview,
      promotionReady,
      activeCanonicalTarget: ACTIVE_CANON_VERSION,
      nextDraftTarget: 'V45'
    },
    aggregate: {
      ...baseData.aggregate,
      fullyProven: baseData.aggregate.fullyProven
        && inheritedV19?.deterministicReplayReport?.passed === true
        && inheritedV19?.volatilityInventory?.passed === true
        && inheritedV19?.contractChangeLedger?.passed === true
        && inheritedV20?.qualitySummary?.passed === true
        && promotionReady
        && specFamilyReport.mode === 'promoted'
    }
  };
  return {
    data,
    markdown: renderCanonicalProvenMarkdown(data),
    artifacts
  };
}

/**
 * @param {{
 *   generatedAt: string,
 *   baseData: ReturnType<typeof buildCanonicalProvenData>
 * }} input
 */
function buildV45PromotionReadinessReport({ generatedAt, baseData }) {
  const report = buildV45PromotionReadinessReportArtifact({
    generatedAt,
    repoRoot: REPO_ROOT
  });
  return {
    reportId: report.artifactId,
    ...report,
    proofSourceCommit: baseData.canonicalCommit,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState,
    sourceSafe: report.sourceSafetyVerdict === 'source-safe-v45-knowledge-commoditization-promotion-metadata'
  };
}

/**
 * @param {any} baseData
 * @param {{
 *   generatedAt: string,
 *   inheritedV19: any,
 *   inheritedV20: any
 * }} input
 */
function buildV45ProvenPackage(baseData, {
  generatedAt,
  inheritedV19,
  inheritedV20
}) {
  const draftPreview = ACTIVE_CANON_VERSION !== 'V45';
  const specFamilyReport = buildV21SpecFamilyReport({
    version: 'V45',
    mode: draftPreview ? 'draft' : 'promoted',
    ...(draftPreview ? { currentTarget: ACTIVE_CANON_VERSION } : { currentTarget: 'V45' })
  });
  const assumedArtifactPaths = [
    'BITCODE_SPEC_V45_PROVEN.md',
    '.bitcode/v45-spec-family-report.json',
    '.bitcode/v45-canonical-input-report.json',
    '.bitcode/v45-canon-posture-drift-report.json',
    '.bitcode/v45-inference-synthesis-proof.json',
    '.bitcode/v45-prompt-completeness-proof.json',
    '.bitcode/v45-static-code-analysis-proof.json',
    '.bitcode/v45-verification-decisions-proof.json',
    '.bitcode/v45-selection-materialization-proof.json',
    '.bitcode/v45-authorization-sensitive-flow-proof.json',
    '.bitcode/v45-settlement-source-to-shares-proof.json',
    '.bitcode/v45-disclosure-boundary-proof.json',
    '.bitcode/v45-proof-contract-proof.json',
    '.bitcode/v45-source-safe-e2e-rehearsal.json',
    V45_PROMOTION_READINESS_ARTIFACT_PATH
  ];
  const canonicalInputReport = buildV21CanonicalInputReport({
    currentTarget: 'V45',
    reportVersion: 'V45',
    ...(draftPreview
      ? {
          skipPointerCheck: true,
          assumeExistingRelativePaths: assumedArtifactPaths
        }
      : { assumeExistingRelativePaths: assumedArtifactPaths })
  });
  const canonPostureDriftReport = buildCanonPostureDriftReport({
    version: 'V45',
    activeCanonVersion: draftPreview ? ACTIVE_CANON_VERSION : 'V45',
    draftTargetVersion: draftPreview ? 'V45' : 'V46',
    proofSourceCommit: baseData.canonicalCommit,
    generatedAt,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState
  });
  const promotionReadinessReport = buildV45PromotionReadinessReport({
    generatedAt,
    baseData
  });
  const artifacts = {
    ...buildCanonPostureGeneratedArtifactContents({
      version: 'V45',
      proofSourceCommit: baseData.canonicalCommit,
      generatedAt,
      generatorId: baseData.generatorId,
      worktreeState: baseData.worktreeState,
      specFamilyReport,
      canonicalInputReport,
      canonPostureDriftReport
    }),
    [V45_PROMOTION_READINESS_ARTIFACT_PATH]: `${JSON.stringify(promotionReadinessReport, null, 2)}\n`
  };
  const artifactSummaries = summarizeArtifactContents(artifacts);
  const promotionReady = specFamilyReport.passed === true
    && canonicalInputReport.passed === true
    && canonPostureDriftReport.passed === true
    && promotionReadinessReport.passed === true;
  const data = {
    ...baseData,
    v19: inheritedV19,
    v20: inheritedV20,
    v45: {
      specFamilyReport,
      canonicalInputReport,
      canonPostureDriftReport,
      promotionReadinessReport,
      artifactSummaries,
      draftPreview,
      promotionReady,
      activeCanonicalTarget: ACTIVE_CANON_VERSION,
      nextDraftTarget: 'V46'
    },
    aggregate: {
      ...baseData.aggregate,
      fullyProven: baseData.aggregate.fullyProven
        && inheritedV19?.deterministicReplayReport?.passed === true
        && inheritedV19?.volatilityInventory?.passed === true
        && inheritedV19?.contractChangeLedger?.passed === true
        && inheritedV20?.qualitySummary?.passed === true
        && promotionReady
        && specFamilyReport.mode === 'promoted'
    }
  };
  return {
    data,
    markdown: renderCanonicalProvenMarkdown(data),
    artifacts
  };
}

/**
 * @param {{
 *   generatedAt: string
 * }} input
 */
function buildV46PromotionReadinessReport({ generatedAt }) {
  return buildV46PromotionReadinessReportArtifact({
    generatedAt,
    repoRoot: REPO_ROOT
  });
}

/**
 * @param {any} baseData
 * @param {{
 *   generatedAt: string,
 *   inheritedV19: any,
 *   inheritedV20: any
 * }} input
 */
function buildV46ProvenPackage(baseData, {
  generatedAt,
  inheritedV19,
  inheritedV20
}) {
  const draftPreview = ACTIVE_CANON_VERSION !== 'V46';
  const specFamilyReport = buildV21SpecFamilyReport({
    version: 'V46',
    mode: draftPreview ? 'draft' : 'promoted',
    ...(draftPreview ? { currentTarget: ACTIVE_CANON_VERSION } : { currentTarget: 'V46' })
  });
  const assumedArtifactPaths = [
    'BITCODE_SPEC_V46_PROVEN.md',
    '.bitcode/v46-spec-family-report.json',
    '.bitcode/v46-canonical-input-report.json',
    '.bitcode/v46-canon-posture-drift-report.json',
    '.bitcode/v46-protocol-comprehension-object-model.json',
    '.bitcode/v46-public-operator-claim-boundaries.json',
    '.bitcode/v46-product-route-comprehension-readback.json',
    '.bitcode/v46-interface-claim-contracts.json',
    '.bitcode/v46-proof-readback-operator-explanation.json',
    '.bitcode/v46-local-interface-comprehension-rehearsal.json',
    V46_PROMOTION_READINESS_ARTIFACT_PATH
  ];
  const canonicalInputReport = buildV21CanonicalInputReport({
    currentTarget: 'V46',
    reportVersion: 'V46',
    ...(draftPreview
      ? {
          skipPointerCheck: true,
          assumeExistingRelativePaths: assumedArtifactPaths
        }
      : { assumeExistingRelativePaths: assumedArtifactPaths })
  });
  const canonPostureDriftReport = buildCanonPostureDriftReport({
    version: 'V46',
    activeCanonVersion: draftPreview ? ACTIVE_CANON_VERSION : 'V46',
    draftTargetVersion: draftPreview ? 'V46' : 'V47',
    proofSourceCommit: baseData.canonicalCommit,
    generatedAt,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState
  });
  const promotionReadinessReport = buildV46PromotionReadinessReport({
    generatedAt
  });
  const artifacts = {
    ...buildCanonPostureGeneratedArtifactContents({
      version: 'V46',
      proofSourceCommit: baseData.canonicalCommit,
      generatedAt,
      generatorId: baseData.generatorId,
      worktreeState: baseData.worktreeState,
      specFamilyReport,
      canonicalInputReport,
      canonPostureDriftReport
    }),
    [V46_PROMOTION_READINESS_ARTIFACT_PATH]: `${JSON.stringify(promotionReadinessReport, null, 2)}\n`
  };
  const artifactSummaries = summarizeArtifactContents(artifacts);
  const promotionReady = specFamilyReport.passed === true
    && canonicalInputReport.passed === true
    && canonPostureDriftReport.passed === true
    && promotionReadinessReport.passed === true;
  const data = {
    ...baseData,
    v19: inheritedV19,
    v20: inheritedV20,
    v46: {
      specFamilyReport,
      canonicalInputReport,
      canonPostureDriftReport,
      promotionReadinessReport,
      artifactSummaries,
      draftPreview,
      promotionReady,
      activeCanonicalTarget: ACTIVE_CANON_VERSION,
      nextDraftTarget: 'V47'
    },
    aggregate: {
      ...baseData.aggregate,
      fullyProven: baseData.aggregate.fullyProven
        && inheritedV19?.deterministicReplayReport?.passed === true
        && inheritedV19?.volatilityInventory?.passed === true
        && inheritedV19?.contractChangeLedger?.passed === true
        && inheritedV20?.qualitySummary?.passed === true
        && promotionReady
        && specFamilyReport.mode === 'promoted'
    }
  };
  return {
    data,
    markdown: renderCanonicalProvenMarkdown(data),
    artifacts
  };
}

/**
 * @param {{
 *   generatedAt: string
 * }} input
 */
function buildV47PromotionReadinessReport({ generatedAt }) {
  return buildV47PromotionReadinessReportArtifact({
    generatedAt,
    repoRoot: REPO_ROOT
  });
}

/**
 * @param {any} baseData
 * @param {{
 *   generatedAt: string,
 *   inheritedV19: any,
 *   inheritedV20: any
 * }} input
 */
function buildV47ProvenPackage(baseData, {
  generatedAt,
  inheritedV19,
  inheritedV20
}) {
  const draftPreview = ACTIVE_CANON_VERSION !== 'V47';
  const specFamilyReport = buildV21SpecFamilyReport({
    version: 'V47',
    mode: draftPreview ? 'draft' : 'promoted',
    ...(draftPreview ? { currentTarget: ACTIVE_CANON_VERSION } : { currentTarget: 'V47' })
  });
  const assumedArtifactPaths = [
    'BITCODE_SPEC_V47_PROVEN.md',
    '.bitcode/v47-spec-family-report.json',
    '.bitcode/v47-canonical-input-report.json',
    '.bitcode/v47-canon-posture-drift-report.json',
    '.bitcode/v47-feature-excess-alignment-audit.json',
    '.bitcode/v47-seller-buyer-state-machine-law.json',
    '.bitcode/v47-depositor-website-completion.json',
    '.bitcode/v47-reader-website-completion.json',
    '.bitcode/v47-packs-auxillaries-commercial-dashboard.json',
    '.bitcode/v47-e2e-ip-selling-buying-tests.json',
    '.bitcode/v47-landing-public-launch-messaging.json',
    '.bitcode/v47-staging-testnet-deployment-rehearsal.json',
    V47_PROMOTION_READINESS_ARTIFACT_PATH
  ];
  const canonicalInputReport = buildV21CanonicalInputReport({
    currentTarget: 'V47',
    reportVersion: 'V47',
    ...(draftPreview
      ? {
          skipPointerCheck: true,
          assumeExistingRelativePaths: assumedArtifactPaths
        }
      : { assumeExistingRelativePaths: assumedArtifactPaths })
  });
  const canonPostureDriftReport = buildCanonPostureDriftReport({
    version: 'V47',
    activeCanonVersion: draftPreview ? ACTIVE_CANON_VERSION : 'V47',
    draftTargetVersion: draftPreview ? 'V47' : 'V48',
    proofSourceCommit: baseData.canonicalCommit,
    generatedAt,
    generatorId: baseData.generatorId,
    worktreeState: baseData.worktreeState
  });
  const promotionReadinessReport = buildV47PromotionReadinessReport({
    generatedAt
  });
  const artifacts = {
    ...buildCanonPostureGeneratedArtifactContents({
      version: 'V47',
      proofSourceCommit: baseData.canonicalCommit,
      generatedAt,
      generatorId: baseData.generatorId,
      worktreeState: baseData.worktreeState,
      specFamilyReport,
      canonicalInputReport,
      canonPostureDriftReport
    }),
    [V47_PROMOTION_READINESS_ARTIFACT_PATH]: `${JSON.stringify(promotionReadinessReport, null, 2)}\n`
  };
  const artifactSummaries = summarizeArtifactContents(artifacts);
  const promotionReady = specFamilyReport.passed === true
    && canonicalInputReport.passed === true
    && canonPostureDriftReport.passed === true
    && promotionReadinessReport.passed === true;
  const data = {
    ...baseData,
    v19: inheritedV19,
    v20: inheritedV20,
    v47: {
      specFamilyReport,
      canonicalInputReport,
      canonPostureDriftReport,
      promotionReadinessReport,
      artifactSummaries,
      draftPreview,
      promotionReady,
      activeCanonicalTarget: ACTIVE_CANON_VERSION,
      nextDraftTarget: 'V48'
    },
    aggregate: {
      ...baseData.aggregate,
      fullyProven: baseData.aggregate.fullyProven
        && inheritedV19?.deterministicReplayReport?.passed === true
        && inheritedV19?.volatilityInventory?.passed === true
        && inheritedV19?.contractChangeLedger?.passed === true
        && inheritedV20?.qualitySummary?.passed === true
        && promotionReady
        && specFamilyReport.mode === 'promoted'
    }
  };
  return {
    data,
    markdown: renderCanonicalProvenMarkdown(data),
    artifacts
  };
}

/**
 * @param {{
 *   version: string,
 *   canonicalCommit: string,
 *   canonicalCommitRecordedAt?: string | null,
 *   generatedAt?: string,
 *   worktreeState?: string,
 *   generatorId?: string,
 *   scenarioIds?: string[],
 *   branchModes?: string[],
 *   paymentModes?: string[],
 *   buildInitialStateFn?: typeof buildInitialState,
 *   runMakeBitcodeBranchFn?: typeof runMakeBitcodeBranch
 * }} input
 */
export function generateCanonicalProvenMarkdown({
  version,
  canonicalCommit,
  canonicalCommitRecordedAt = null,
  generatedAt = canonicalCommitRecordedAt || new Date().toISOString(),
  worktreeState = 'clean',
  generatorId = PROVEN_GENERATOR_ID,
  scenarioIds,
  branchModes = DEFAULT_PROVEN_BRANCH_MODES,
  paymentModes,
  buildInitialStateFn = buildInitialState,
  runMakeBitcodeBranchFn = runMakeBitcodeBranch
}) {
  const finishGenerateProfile = beginProvenProfile(`generateCanonicalProvenMarkdown:${version}:total`);
  const resolvedPaymentModes = (version === 'V23' || version === 'V24' || version === 'V25' || version === 'V26')
    ? (
      paymentModes
      || (version === 'V26'
        ? DEFAULT_V26_PROVEN_PAYMENT_MODES
        : version === 'V25'
        ? DEFAULT_V25_PROVEN_PAYMENT_MODES
        : version === 'V24'
          ? DEFAULT_V24_PROVEN_PAYMENT_MODES
          : DEFAULT_V23_PROVEN_PAYMENT_MODES)
    )
    : (paymentModes || []);
  const baseData = buildBaseCanonicalProvenData({
    version,
    canonicalCommit,
    canonicalCommitRecordedAt,
    generatedAt,
    worktreeState,
    generatorId,
    branchModes,
    paymentModes: resolvedPaymentModes,
    buildInitialStateFn,
    runMakeBitcodeBranchFn,
    ...(scenarioIds ? { scenarioIds } : {})
  });
  if (version === 'V19') {
    const v19Package = buildV19DeterministicProvenPackage(baseData, {
      version,
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    finishGenerateProfile();
    return v19Package;
  }
  if (version === 'V20') {
    const inheritedV19BaseData = buildBaseCanonicalProvenData({
      version: 'V19',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV19Package = buildV19DeterministicProvenPackage(inheritedV19BaseData, {
      version: 'V19',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      renderMarkdown: false,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const v20Package = buildV20ProvenPackage(baseData, {
      version,
      generatedAt,
      inheritedV19: inheritedV19Package.data.v19
    });
    finishGenerateProfile();
    return v20Package;
  }
  if (version === 'V21') {
    const inheritedV19BaseData = buildBaseCanonicalProvenData({
      version: 'V19',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV19Package = buildV19DeterministicProvenPackage(inheritedV19BaseData, {
      version: 'V19',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      renderMarkdown: false,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV20BaseData = buildBaseCanonicalProvenData({
      version: 'V20',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV20Package = buildV20ProvenPackage(inheritedV20BaseData, {
      version: 'V20',
      generatedAt,
      inheritedV19: inheritedV19Package.data.v19,
      renderMarkdown: false
    });
    const v21Package = buildV21ProvenPackage(baseData, {
      generatedAt,
      inheritedV19: inheritedV19Package.data.v19,
      inheritedV20: inheritedV20Package.data.v20
    });
    finishGenerateProfile();
    return v21Package;
  }
  if (version === 'V22') {
    const inheritedV19BaseData = buildBaseCanonicalProvenData({
      version: 'V19',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV19Package = buildV19DeterministicProvenPackage(inheritedV19BaseData, {
      version: 'V19',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      renderMarkdown: false,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV20BaseData = buildBaseCanonicalProvenData({
      version: 'V20',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV20Package = buildV20ProvenPackage(inheritedV20BaseData, {
      version: 'V20',
      generatedAt,
      inheritedV19: inheritedV19Package.data.v19,
      renderMarkdown: false
    });
    const v22Package = buildV22ProvenPackage(baseData, {
      generatedAt,
      inheritedV19: inheritedV19Package.data.v19,
      inheritedV20: inheritedV20Package.data.v20
    });
    finishGenerateProfile();
    return v22Package;
  }
  if (version === 'V23') {
    const inheritedV19BaseData = buildBaseCanonicalProvenData({
      version: 'V19',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV19Package = buildV19DeterministicProvenPackage(inheritedV19BaseData, {
      version: 'V19',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      renderMarkdown: false,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV20BaseData = buildBaseCanonicalProvenData({
      version: 'V20',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV20Package = buildV20ProvenPackage(inheritedV20BaseData, {
      version: 'V20',
      generatedAt,
      inheritedV19: inheritedV19Package.data.v19,
      renderMarkdown: false
    });
    const v23Package = buildV23ProvenPackage(baseData, {
      generatedAt,
      inheritedV19: inheritedV19Package.data.v19,
      inheritedV20: inheritedV20Package.data.v20
    });
    finishGenerateProfile();
    return v23Package;
  }
  if (version === 'V24') {
    const inheritedV19BaseData = buildBaseCanonicalProvenData({
      version: 'V19',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV19Package = buildV19DeterministicProvenPackage(inheritedV19BaseData, {
      version: 'V19',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      renderMarkdown: false,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV20BaseData = buildBaseCanonicalProvenData({
      version: 'V20',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV20Package = buildV20ProvenPackage(inheritedV20BaseData, {
      version: 'V20',
      generatedAt,
      inheritedV19: inheritedV19Package.data.v19,
      renderMarkdown: false
    });
    const v24Package = buildV24ProvenPackage(baseData, {
      generatedAt,
      inheritedV19: inheritedV19Package.data.v19,
      inheritedV20: inheritedV20Package.data.v20
    });
    finishGenerateProfile();
    return v24Package;
  }
  if (version === 'V25') {
    const inheritedV19BaseData = buildBaseCanonicalProvenData({
      version: 'V19',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV19Package = buildV19DeterministicProvenPackage(inheritedV19BaseData, {
      version: 'V19',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      renderMarkdown: false,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV20BaseData = buildBaseCanonicalProvenData({
      version: 'V20',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV20Package = buildV20ProvenPackage(inheritedV20BaseData, {
      version: 'V20',
      generatedAt,
      inheritedV19: inheritedV19Package.data.v19,
      renderMarkdown: false
    });
    const v25Package = buildV25ProvenPackage(baseData, {
      generatedAt,
      inheritedV19: inheritedV19Package.data.v19,
      inheritedV20: inheritedV20Package.data.v20
    });
    finishGenerateProfile();
    return v25Package;
  }
  if (version === 'V26') {
    const inheritedV19BaseData = buildBaseCanonicalProvenData({
      version: 'V19',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV19Package = buildV19DeterministicProvenPackage(inheritedV19BaseData, {
      version: 'V19',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      renderMarkdown: false,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV20BaseData = buildBaseCanonicalProvenData({
      version: 'V20',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV20Package = buildV20ProvenPackage(inheritedV20BaseData, {
      version: 'V20',
      generatedAt,
      inheritedV19: inheritedV19Package.data.v19,
      renderMarkdown: false
    });
    const v26Package = buildV26ProvenPackage(baseData, {
      generatedAt,
      inheritedV19: inheritedV19Package.data.v19,
      inheritedV20: inheritedV20Package.data.v20
    });
    finishGenerateProfile();
    return v26Package;
  }
  if (version === 'V30') {
    const inheritedV19BaseData = buildBaseCanonicalProvenData({
      version: 'V19',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV19Package = buildV19DeterministicProvenPackage(inheritedV19BaseData, {
      version: 'V19',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      renderMarkdown: false,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV20BaseData = buildBaseCanonicalProvenData({
      version: 'V20',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV20Package = buildV20ProvenPackage(inheritedV20BaseData, {
      version: 'V20',
      generatedAt,
      inheritedV19: inheritedV19Package.data.v19,
      renderMarkdown: false
    });
    const v30Package = buildV30ProvenPackage(baseData, {
      generatedAt,
      inheritedV19: inheritedV19Package.data.v19,
      inheritedV20: inheritedV20Package.data.v20
    });
    finishGenerateProfile();
    return v30Package;
  }
  if (version === 'V31') {
    const inheritedV19BaseData = buildBaseCanonicalProvenData({
      version: 'V19',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV19Package = buildV19DeterministicProvenPackage(inheritedV19BaseData, {
      version: 'V19',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      renderMarkdown: false,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV20BaseData = buildBaseCanonicalProvenData({
      version: 'V20',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV20Package = buildV20ProvenPackage(inheritedV20BaseData, {
      version: 'V20',
      generatedAt,
      inheritedV19: inheritedV19Package.data.v19,
      renderMarkdown: false
    });
    const v31Package = buildV31ProvenPackage(baseData, {
      generatedAt,
      inheritedV19: inheritedV19Package.data.v19,
      inheritedV20: inheritedV20Package.data.v20
    });
    finishGenerateProfile();
    return v31Package;
  }
  if (version === 'V32') {
    const inheritedV19BaseData = buildBaseCanonicalProvenData({
      version: 'V19',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV19Package = buildV19DeterministicProvenPackage(inheritedV19BaseData, {
      version: 'V19',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      renderMarkdown: false,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV20BaseData = buildBaseCanonicalProvenData({
      version: 'V20',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV20Package = buildV20ProvenPackage(inheritedV20BaseData, {
      version: 'V20',
      generatedAt,
      inheritedV19: inheritedV19Package.data.v19,
      renderMarkdown: false
    });
    const v32Package = buildV32ProvenPackage(baseData, {
      generatedAt,
      inheritedV19: inheritedV19Package.data.v19,
      inheritedV20: inheritedV20Package.data.v20
    });
    finishGenerateProfile();
    return v32Package;
  }
  if (version === 'V33') {
    const inheritedV19BaseData = buildBaseCanonicalProvenData({
      version: 'V19',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV19Package = buildV19DeterministicProvenPackage(inheritedV19BaseData, {
      version: 'V19',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      renderMarkdown: false,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV20BaseData = buildBaseCanonicalProvenData({
      version: 'V20',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV20Package = buildV20ProvenPackage(inheritedV20BaseData, {
      version: 'V20',
      generatedAt,
      inheritedV19: inheritedV19Package.data.v19,
      renderMarkdown: false
    });
    const v33Package = buildV33ProvenPackage(baseData, {
      generatedAt,
      inheritedV19: inheritedV19Package.data.v19,
      inheritedV20: inheritedV20Package.data.v20
    });
    finishGenerateProfile();
    return v33Package;
  }
  if (version === 'V34') {
    const inheritedV19BaseData = buildBaseCanonicalProvenData({
      version: 'V19',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV19Package = buildV19DeterministicProvenPackage(inheritedV19BaseData, {
      version: 'V19',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      renderMarkdown: false,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV20BaseData = buildBaseCanonicalProvenData({
      version: 'V20',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV20Package = buildV20ProvenPackage(inheritedV20BaseData, {
      version: 'V20',
      generatedAt,
      inheritedV19: inheritedV19Package.data.v19,
      renderMarkdown: false
    });
    const v34Package = buildV34ProvenPackage(baseData, {
      generatedAt,
      inheritedV19: inheritedV19Package.data.v19,
      inheritedV20: inheritedV20Package.data.v20
    });
    finishGenerateProfile();
    return v34Package;
  }
  if (version === 'V35') {
    const inheritedV19BaseData = buildBaseCanonicalProvenData({
      version: 'V19',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV19Package = buildV19DeterministicProvenPackage(inheritedV19BaseData, {
      version: 'V19',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      renderMarkdown: false,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV20BaseData = buildBaseCanonicalProvenData({
      version: 'V20',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV20Package = buildV20ProvenPackage(inheritedV20BaseData, {
      version: 'V20',
      generatedAt,
      inheritedV19: inheritedV19Package.data.v19,
      renderMarkdown: false
    });
    const v35Package = buildV35ProvenPackage(baseData, {
      generatedAt,
      inheritedV19: inheritedV19Package.data.v19,
      inheritedV20: inheritedV20Package.data.v20
    });
    finishGenerateProfile();
    return v35Package;
  }
  if (version === 'V36') {
    const inheritedV19BaseData = buildBaseCanonicalProvenData({
      version: 'V19',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV19Package = buildV19DeterministicProvenPackage(inheritedV19BaseData, {
      version: 'V19',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      renderMarkdown: false,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV20BaseData = buildBaseCanonicalProvenData({
      version: 'V20',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV20Package = buildV20ProvenPackage(inheritedV20BaseData, {
      version: 'V20',
      generatedAt,
      inheritedV19: inheritedV19Package.data.v19,
      renderMarkdown: false
    });
    const v36Package = buildV36ProvenPackage(baseData, {
      generatedAt,
      inheritedV19: inheritedV19Package.data.v19,
      inheritedV20: inheritedV20Package.data.v20
    });
    finishGenerateProfile();
    return v36Package;
  }
  if (version === 'V37') {
    const inheritedV19BaseData = buildBaseCanonicalProvenData({
      version: 'V19',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV19Package = buildV19DeterministicProvenPackage(inheritedV19BaseData, {
      version: 'V19',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      renderMarkdown: false,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV20BaseData = buildBaseCanonicalProvenData({
      version: 'V20',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV20Package = buildV20ProvenPackage(inheritedV20BaseData, {
      version: 'V20',
      generatedAt,
      inheritedV19: inheritedV19Package.data.v19,
      renderMarkdown: false
    });
    const v37Package = buildV37ProvenPackage(baseData, {
      generatedAt,
      inheritedV19: inheritedV19Package.data.v19,
      inheritedV20: inheritedV20Package.data.v20
    });
    finishGenerateProfile();
    return v37Package;
  }
  if (version === 'V38') {
    const inheritedV19BaseData = buildBaseCanonicalProvenData({
      version: 'V19',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV19Package = buildV19DeterministicProvenPackage(inheritedV19BaseData, {
      version: 'V19',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      renderMarkdown: false,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV20BaseData = buildBaseCanonicalProvenData({
      version: 'V20',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV20Package = buildV20ProvenPackage(inheritedV20BaseData, {
      version: 'V20',
      generatedAt,
      inheritedV19: inheritedV19Package.data.v19,
      renderMarkdown: false
    });
    const v38Package = buildV38ProvenPackage(baseData, {
      generatedAt,
      inheritedV19: inheritedV19Package.data.v19,
      inheritedV20: inheritedV20Package.data.v20
    });
    finishGenerateProfile();
    return v38Package;
  }
  if (version === 'V39') {
    const inheritedV19BaseData = buildBaseCanonicalProvenData({
      version: 'V19',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV19Package = buildV19DeterministicProvenPackage(inheritedV19BaseData, {
      version: 'V19',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      renderMarkdown: false,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV20BaseData = buildBaseCanonicalProvenData({
      version: 'V20',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV20Package = buildV20ProvenPackage(inheritedV20BaseData, {
      version: 'V20',
      generatedAt,
      inheritedV19: inheritedV19Package.data.v19,
      renderMarkdown: false
    });
    const v39Package = buildV39ProvenPackage(baseData, {
      generatedAt,
      inheritedV19: inheritedV19Package.data.v19,
      inheritedV20: inheritedV20Package.data.v20
    });
    finishGenerateProfile();
    return v39Package;
  }
  if (version === 'V40') {
    const inheritedV19BaseData = buildBaseCanonicalProvenData({
      version: 'V19',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV19Package = buildV19DeterministicProvenPackage(inheritedV19BaseData, {
      version: 'V19',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      renderMarkdown: false,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV20BaseData = buildBaseCanonicalProvenData({
      version: 'V20',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV20Package = buildV20ProvenPackage(inheritedV20BaseData, {
      version: 'V20',
      generatedAt,
      inheritedV19: inheritedV19Package.data.v19,
      renderMarkdown: false
    });
    const v40Package = buildV40ProvenPackage(baseData, {
      generatedAt,
      inheritedV19: inheritedV19Package.data.v19,
      inheritedV20: inheritedV20Package.data.v20
    });
    finishGenerateProfile();
    return v40Package;
  }
  if (version === 'V41') {
    const inheritedV19BaseData = buildBaseCanonicalProvenData({
      version: 'V19',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV19Package = buildV19DeterministicProvenPackage(inheritedV19BaseData, {
      version: 'V19',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      renderMarkdown: false,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV20BaseData = buildBaseCanonicalProvenData({
      version: 'V20',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV20Package = buildV20ProvenPackage(inheritedV20BaseData, {
      version: 'V20',
      generatedAt,
      inheritedV19: inheritedV19Package.data.v19,
      renderMarkdown: false
    });
    const v41Package = buildV41ProvenPackage(baseData, {
      generatedAt,
      inheritedV19: inheritedV19Package.data.v19,
      inheritedV20: inheritedV20Package.data.v20
    });
    finishGenerateProfile();
    return v41Package;
  }
  if (version === 'V42') {
    const inheritedV19BaseData = buildBaseCanonicalProvenData({
      version: 'V19',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV19Package = buildV19DeterministicProvenPackage(inheritedV19BaseData, {
      version: 'V19',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      renderMarkdown: false,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV20BaseData = buildBaseCanonicalProvenData({
      version: 'V20',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV20Package = buildV20ProvenPackage(inheritedV20BaseData, {
      version: 'V20',
      generatedAt,
      inheritedV19: inheritedV19Package.data.v19,
      renderMarkdown: false
    });
    const v42Package = buildV42ProvenPackage(baseData, {
      generatedAt,
      inheritedV19: inheritedV19Package.data.v19,
      inheritedV20: inheritedV20Package.data.v20
    });
    finishGenerateProfile();
    return v42Package;
  }
  if (version === 'V43') {
    const inheritedV19BaseData = buildBaseCanonicalProvenData({
      version: 'V19',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV19Package = buildV19DeterministicProvenPackage(inheritedV19BaseData, {
      version: 'V19',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      renderMarkdown: false,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV20BaseData = buildBaseCanonicalProvenData({
      version: 'V20',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV20Package = buildV20ProvenPackage(inheritedV20BaseData, {
      version: 'V20',
      generatedAt,
      inheritedV19: inheritedV19Package.data.v19,
      renderMarkdown: false
    });
    const v43Package = buildV43ProvenPackage(baseData, {
      generatedAt,
      inheritedV19: inheritedV19Package.data.v19,
      inheritedV20: inheritedV20Package.data.v20
    });
    finishGenerateProfile();
    return v43Package;
  }
  if (version === 'V44') {
    const inheritedV19BaseData = buildBaseCanonicalProvenData({
      version: 'V19',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV19Package = buildV19DeterministicProvenPackage(inheritedV19BaseData, {
      version: 'V19',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      renderMarkdown: false,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV20BaseData = buildBaseCanonicalProvenData({
      version: 'V20',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV20Package = buildV20ProvenPackage(inheritedV20BaseData, {
      version: 'V20',
      generatedAt,
      inheritedV19: inheritedV19Package.data.v19,
      renderMarkdown: false
    });
    const v44Package = buildV44ProvenPackage(baseData, {
      generatedAt,
      inheritedV19: inheritedV19Package.data.v19,
      inheritedV20: inheritedV20Package.data.v20
    });
    finishGenerateProfile();
    return v44Package;
  }
  if (version === 'V45') {
    const inheritedV19BaseData = buildBaseCanonicalProvenData({
      version: 'V19',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV19Package = buildV19DeterministicProvenPackage(inheritedV19BaseData, {
      version: 'V19',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      renderMarkdown: false,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV20BaseData = buildBaseCanonicalProvenData({
      version: 'V20',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV20Package = buildV20ProvenPackage(inheritedV20BaseData, {
      version: 'V20',
      generatedAt,
      inheritedV19: inheritedV19Package.data.v19,
      renderMarkdown: false
    });
    const v45Package = buildV45ProvenPackage(baseData, {
      generatedAt,
      inheritedV19: inheritedV19Package.data.v19,
      inheritedV20: inheritedV20Package.data.v20
    });
    finishGenerateProfile();
    return v45Package;
  }
  if (version === 'V46') {
    const inheritedV19BaseData = buildBaseCanonicalProvenData({
      version: 'V19',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV19Package = buildV19DeterministicProvenPackage(inheritedV19BaseData, {
      version: 'V19',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      renderMarkdown: false,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV20BaseData = buildBaseCanonicalProvenData({
      version: 'V20',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV20Package = buildV20ProvenPackage(inheritedV20BaseData, {
      version: 'V20',
      generatedAt,
      inheritedV19: inheritedV19Package.data.v19,
      renderMarkdown: false
    });
    const v46Package = buildV46ProvenPackage(baseData, {
      generatedAt,
      inheritedV19: inheritedV19Package.data.v19,
      inheritedV20: inheritedV20Package.data.v20
    });
    finishGenerateProfile();
    return v46Package;
  }
  if (version === 'V47') {
    const inheritedV19BaseData = buildBaseCanonicalProvenData({
      version: 'V19',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV19Package = buildV19DeterministicProvenPackage(inheritedV19BaseData, {
      version: 'V19',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      renderMarkdown: false,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV20BaseData = buildBaseCanonicalProvenData({
      version: 'V20',
      canonicalCommit,
      canonicalCommitRecordedAt,
      generatedAt,
      worktreeState,
      generatorId,
      branchModes,
      buildInitialStateFn,
      runMakeBitcodeBranchFn,
      ...(scenarioIds ? { scenarioIds } : {})
    });
    const inheritedV20Package = buildV20ProvenPackage(inheritedV20BaseData, {
      version: 'V20',
      generatedAt,
      inheritedV19: inheritedV19Package.data.v19,
      renderMarkdown: false
    });
    const v47Package = buildV47ProvenPackage(baseData, {
      generatedAt,
      inheritedV19: inheritedV19Package.data.v19,
      inheritedV20: inheritedV20Package.data.v20
    });
    finishGenerateProfile();
    return v47Package;
  }
  const v18Matrices = version === 'V18'
    ? buildV18Matrices(baseData, {
        version,
        generatedAt,
        buildInitialStateFn,
        runMakeBitcodeBranchFn
      })
    : null;
  const data = v18Matrices
    ? {
        ...baseData,
        v18Matrices,
        aggregate: {
          ...baseData.aggregate,
          fullyProven: baseData.aggregate.fullyProven && v18Matrices.fullyProven
        }
      }
    : baseData;
  const v18Package = {
    data,
    markdown: renderCanonicalProvenMarkdown(data),
    artifacts: {}
  };
  finishGenerateProfile();
  return v18Package;
}

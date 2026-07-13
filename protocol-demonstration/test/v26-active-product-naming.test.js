import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const serverSource = readFileSync(new URL('../server.js', import.meta.url), 'utf8');
const apiTestSource = readFileSync(new URL('./api.test.js', import.meta.url), 'utf8');
const workflowTestSource = readFileSync(new URL('./workflow.integration.test.js', import.meta.url), 'utf8');
const sonnerSource = readFileSync(new URL('../../uapi/components/base/shadcn/sonner.tsx', import.meta.url), 'utf8');
const footerSource = readFileSync(new URL('../../uapi/components/base/bitcode/layout/footer.tsx', import.meta.url), 'utf8');
const bitcodePublicCopySource = readFileSync(
  new URL('../../uapi/components/base/bitcode/layout/bitcode-public-copy.ts', import.meta.url),
  'utf8',
);
const bitcodePublicExplainersSource = readFileSync(
  new URL('../../uapi/components/base/bitcode/layout/bitcode-public-explainers.ts', import.meta.url),
  'utf8',
);
const publicDocsPageContentSource = readFileSync(new URL('../../uapi/app/(root)/components/PublicDocsPageContent.tsx', import.meta.url), 'utf8');
const footerAnimationsSource = readFileSync(new URL('../../uapi/styles/footer-animations.css', import.meta.url), 'utf8');
const fillGapsSource = readFileSync(new URL('../../uapi/app/fill-gaps.tsx', import.meta.url), 'utf8');
const featureFlagsSource = readFileSync(new URL('../../uapi/config/features.ts', import.meta.url), 'utf8');
const heroClientSource = readFileSync(new URL('../../uapi/app/hero-client.tsx', import.meta.url), 'utf8');
const terminalPageSource = readFileSync(new URL('../../uapi/app/terminal/page.tsx', import.meta.url), 'utf8');
const terminalPageClientSource = readFileSync(new URL('../../uapi/app/terminal/TerminalPageClient.tsx', import.meta.url), 'utf8');
const terminalTransactionsSource = readFileSync(
  new URL('../../uapi/app/terminal/terminal-transactions.ts', import.meta.url),
  'utf8',
);
const terminalRunDataSource = readFileSync(
  new URL('../../uapi/app/terminal/terminal-run-data.ts', import.meta.url),
  'utf8',
);
const terminalWorkspaceCopySource = readFileSync(
  new URL('../../uapi/app/terminal/terminal-workspace-copy.ts', import.meta.url),
  'utf8',
);
const terminalTransactionActivitySurfaceSource = readFileSync(
  new URL('../../uapi/app/terminal/TerminalTransactionActivitySurface.tsx', import.meta.url),
  'utf8',
);
const terminalTransactionDetailSurfaceSource = readFileSync(
  new URL('../../uapi/app/terminal/TerminalTransactionDetailSurface.tsx', import.meta.url),
  'utf8',
);
const terminalTransactionDetailHeroSource = readFileSync(
  new URL('../../uapi/app/terminal/TerminalTransactionDetailHero.tsx', import.meta.url),
  'utf8',
);
const terminalTransactionIdentityCardSource = readFileSync(
  new URL('../../uapi/app/terminal/TerminalTransactionIdentityCard.tsx', import.meta.url),
  'utf8',
);
const terminalTransactionClosureCardSource = readFileSync(
  new URL('../../uapi/app/terminal/TerminalTransactionClosureCard.tsx', import.meta.url),
  'utf8',
);
const terminalTransactionProofsCardSource = readFileSync(
  new URL('../../uapi/app/terminal/TerminalTransactionProofsCard.tsx', import.meta.url),
  'utf8',
);
const terminalTransactionHistoryCardSource = readFileSync(
  new URL('../../uapi/app/terminal/TerminalTransactionHistoryCard.tsx', import.meta.url),
  'utf8',
);
const terminalTransactionDetailActionBarSource = readFileSync(
  new URL('../../uapi/app/terminal/TerminalTransactionDetailActionBar.tsx', import.meta.url),
  'utf8',
);
const terminalClosureControlDeckSource = readFileSync(
  new URL('../../uapi/app/terminal/TerminalClosureControlDeck.tsx', import.meta.url),
  'utf8',
);
const terminalExperienceFrameSource = readFileSync(
  new URL('../../uapi/app/terminal/TerminalExperienceFrame.tsx', import.meta.url),
  'utf8',
);
const terminalWorkspaceRailSource = readFileSync(
  new URL('../../uapi/app/terminal/TerminalWorkspaceRail.tsx', import.meta.url),
  'utf8',
);
const terminalMockTransactionDetailsSource = readFileSync(
  new URL('../../uapi/app/terminal/TerminalMockTransactionDetails.tsx', import.meta.url),
  'utf8',
);
const terminalCommandPresentationSource = readFileSync(
  new URL('../../uapi/app/terminal/terminal-command-presentation.ts', import.meta.url),
  'utf8',
);
const terminalFlowGuideSource = readFileSync(
  new URL('../../uapi/app/terminal/terminal-flow-guide.ts', import.meta.url),
  'utf8',
);
const terminalTransactionWorkspaceSource = readFileSync(
  new URL('../../uapi/app/terminal/TerminalTransactionWorkspace.tsx', import.meta.url),
  'utf8',
);
const terminalDepositReadWorkbenchSource = readFileSync(
  new URL('../../uapi/app/terminal/TerminalDepositReadWorkbench.tsx', import.meta.url),
  'utf8',
);
const terminalReadScenarioPanelSource = readFileSync(
  new URL('../../uapi/app/terminal/TerminalReadScenarioPanel.tsx', import.meta.url),
  'utf8',
);
const terminalClosureNativeSectionsSource = readFileSync(
  new URL('../../uapi/app/terminal/TerminalClosureNativeSections.tsx', import.meta.url),
  'utf8',
);
const terminalExperienceArchitectureSource = readFileSync(
  new URL('../../uapi/app/terminal/terminal-experience-architecture.ts', import.meta.url),
  'utf8',
);
const terminalWorkspaceExplainersSource = readFileSync(
  new URL('../../uapi/app/terminal/terminal-workspace-explainers.ts', import.meta.url),
  'utf8',
);
const terminalReadmeSource = readFileSync(new URL('../../uapi/app/terminal/README.md', import.meta.url), 'utf8');
const agenticExecutionSource = readFileSync(
  new URL('../../packages/api/src/executions/agentic-execution.ts', import.meta.url),
  'utf8',
);
const bitcodeTransactionsTableSource = readFileSync(
  new URL('../../uapi/components/base/bitcode/execution/BitcodeTransactionsTable.tsx', import.meta.url),
  'utf8',
);
const bitcodeTransactionsActiveFiltersSource = readFileSync(
  new URL('../../uapi/components/base/bitcode/execution/BitcodeTransactionsActiveFilters.tsx', import.meta.url),
  'utf8',
);
const bitcodeTransactionsOverviewSource = readFileSync(
  new URL('../../uapi/components/base/bitcode/execution/BitcodeTransactionsOverview.tsx', import.meta.url),
  'utf8',
);
const executionReadmeSource = readFileSync(
  new URL('../../uapi/components/base/bitcode/execution/README.md', import.meta.url),
  'utf8',
);
const marketingScreenshotSectionSource = readFileSync(new URL('../../uapi/app/(root)/components/MarketingScreenshotSection.tsx', import.meta.url), 'utf8');
const conversationsStylesSource = readFileSync(new URL('../../uapi/styles/conversations.css', import.meta.url), 'utf8');
const conversationsRouteClientSource = readFileSync(
  new URL('../../uapi/app/conversations/ConversationsRouteClient.tsx', import.meta.url),
  'utf8',
);
const conversationsReadmeSource = readFileSync(new URL('../../uapi/app/conversations/README.md', import.meta.url), 'utf8');
const conversationsOverlaySource = readFileSync(
  new URL('../../uapi/app/conversations/components/ConversationsOverlay.tsx', import.meta.url),
  'utf8',
);
const conversationsEnhancedRichTextInputSource = readFileSync(
  new URL('../../uapi/app/conversations/components/ConversationsEnhancedRichTextInput.tsx', import.meta.url),
  'utf8',
);
const conversationsListSource = readFileSync(
  new URL('../../uapi/app/conversations/components/ConversationsList.tsx', import.meta.url),
  'utf8',
);
const conversationsSidebarLogsSource = readFileSync(
  new URL('../../uapi/app/conversations/components/ConversationsSidebarLogs.tsx', import.meta.url),
  'utf8',
);
const conversationSharedSource = readFileSync(new URL('../../uapi/app/api/conversations/_shared.ts', import.meta.url), 'utf8');
const orbitalStylesSource = readFileSync(new URL('../../uapi/styles/orbital.css', import.meta.url), 'utf8');
const webhookRouteSource = readFileSync(new URL('../../uapi/app/api/webhook/route.ts', import.meta.url), 'utf8');
const webhookVerifySource = readFileSync(new URL('../../uapi/app/api/webhook/verify.ts', import.meta.url), 'utf8');
const webhookRouteTestSource = readFileSync(new URL('../../uapi/tests/webhookRoute.test.ts', import.meta.url), 'utf8');
const uapiPackageSource = readFileSync(new URL('../../uapi/package.json', import.meta.url), 'utf8');
const uapiPackageLockPath = new URL('../../uapi/package-lock.json', import.meta.url);
const uapiPnpmLockPath = new URL('../../uapi/pnpm-lock.yaml', import.meta.url);
const landingTestSource = readFileSync(new URL('../../uapi/tests/marketingLandingPage.test.tsx', import.meta.url), 'utf8');
const footerTestSource = readFileSync(new URL('../../uapi/tests/footerPublicShell.test.tsx', import.meta.url), 'utf8');
const externalRealizationSource = readFileSync(new URL('../src/canonical/v24-external-realization.js', import.meta.url), 'utf8');
const v24LocalExecutorsSource = readFileSync(new URL('../src/canonical/v24-local-executors.js', import.meta.url), 'utf8');
const v24RemoteAdaptersSource = readFileSync(new URL('../src/canonical/v24-remote-adapters.js', import.meta.url), 'utf8');
const readMeasurementSource = readFileSync(new URL('../src/canonical/read-measurement.js', import.meta.url), 'utf8');
const runArtifactsSource = readFileSync(new URL('../src/canonical/run-artifacts.js', import.meta.url), 'utf8');
const canonPostureSource = readFileSync(new URL('../src/canon-posture.js', import.meta.url), 'utf8');
const v22CanonDriftTestSource = readFileSync(new URL('./v22-canon-drift.test.js', import.meta.url), 'utf8');
const bitcodeRuntimeSource = readFileSync(new URL('../src/bitcode-runtime.js', import.meta.url), 'utf8');
const attestationModelSource = readFileSync(new URL('../src/attestation-model.js', import.meta.url), 'utf8');
const provenGeneratorSource = readFileSync(new URL('../src/canonical/proven-generator.js', import.meta.url), 'utf8');
const v18MatricesSource = readFileSync(new URL('../src/canonical/v18-matrices.js', import.meta.url), 'utf8');
const stateSource = readFileSync(new URL('../data/state.json', import.meta.url), 'utf8');
const coreTestSource = readFileSync(new URL('./core.test.js', import.meta.url), 'utf8');
const hostCapabilitiesSource = readFileSync(new URL('../HOST_CAPABILITIES.json', import.meta.url), 'utf8');
const marketingMultiAgentShowcasePath = new URL('../../uapi/app/(root)/components/MarketingMultiAgentShowcase.tsx', import.meta.url);
const marketingFeaturesGridSource = readFileSync(new URL('../../uapi/app/(root)/components/MarketingFeaturesGrid.tsx', import.meta.url), 'utf8');
const marketingComputeSectionSource = readFileSync(new URL('../../uapi/app/(root)/components/MarketingComputeSection.tsx', import.meta.url), 'utf8');
const marketingMarketplaceSectionSource = readFileSync(new URL('../../uapi/app/(root)/components/MarketingMarketplaceSection.tsx', import.meta.url), 'utf8');
const marketingFaqSectionSource = readFileSync(new URL('../../uapi/app/(root)/components/MarketingFaqSection.tsx', import.meta.url), 'utf8');
const marketingSmsPhonePreviewSource = readFileSync(new URL('../../uapi/app/(root)/components/MarketingSmsPhonePreview.tsx', import.meta.url), 'utf8');
const marketingCompetitorTableSectionSource = readFileSync(new URL('../../uapi/app/(root)/components/MarketingCompetitorTableSection.tsx', import.meta.url), 'utf8');
const marketingCompetitorTableStylesSource = readFileSync(new URL('../../uapi/app/(root)/components/marketing-competitor-table-section.module.css', import.meta.url), 'utf8');
const executionsPageClientSource = readFileSync(new URL('../../uapi/app/executions/components/ExecutionsPageClient.tsx', import.meta.url), 'utf8');
const executionsToggleButtonsSource = readFileSync(new URL('../../uapi/app/executions/components/ExecutionsToggleButtons.tsx', import.meta.url), 'utf8');
const uapiFeatureFlagsSource = readFileSync(new URL('../../uapi/config/featureFlags.ts', import.meta.url), 'utf8');
const executionOptionToggleSource = readFileSync(new URL('../../uapi/components/base/bitcode/execution/execution-option-toggle.tsx', import.meta.url), 'utf8');
const executionToggleButtonsSource = readFileSync(new URL('../../uapi/components/base/bitcode/execution/toggle-buttons.tsx', import.meta.url), 'utf8');
const deliverableToolsIndexSource = readFileSync(new URL('../../packages/pipelines/asset-pack/src/tools/index.ts', import.meta.url), 'utf8');
const multiPipelinePackagePath = new URL('../../packages/pipelines/multi', import.meta.url);
const preprocessTogglePath = new URL('../../uapi/components/base/bitcode/execution/preprocess-toggle.tsx', import.meta.url);
const evidenceDocumentTemplatesSource = readFileSync(new URL('../../uapi/hooks/useEvidenceDocumentTemplates.ts', import.meta.url), 'utf8');
const orbitalsConnectsEmailSource = readFileSync(new URL('../../uapi/app/orbitals/components/OrbitalsConnectsOrbitalEmailConnection.tsx', import.meta.url), 'utf8');
const pipelineToastsSource = readFileSync(new URL('../../uapi/components/base/bitcode/toast/pipeline-toasts.ts', import.meta.url), 'utf8');
const pipelineExecutionLogSource = readFileSync(new URL('../../uapi/components/base/bitcode/execution/pipeline-execution-log.tsx', import.meta.url), 'utf8');
const auxillariesProviderSource = readFileSync(new URL('../../uapi/app/auxillaries/components/AuxillariesProvider.tsx', import.meta.url), 'utf8');
const auxillariesSurfaceSource = readFileSync(new URL('../../uapi/app/auxillaries/components/AuxillariesSurface.tsx', import.meta.url), 'utf8');
const auxillariesContentSource = readFileSync(new URL('../../uapi/app/auxillaries/components/AuxillariesContent.tsx', import.meta.url), 'utf8');
const auxillaryPaneMetaSource = readFileSync(new URL('../../uapi/app/auxillaries/components/auxillary-pane-meta.ts', import.meta.url), 'utf8');
const auxillariesLoginPaneSource = readFileSync(new URL('../../uapi/app/auxillaries/components/AuxillariesLoginPane.tsx', import.meta.url), 'utf8');
const auxillariesProfilePaneSource = readFileSync(new URL('../../uapi/app/auxillaries/components/AuxillariesProfilePane.tsx', import.meta.url), 'utf8');
const auxillariesConnectsPaneSource = readFileSync(new URL('../../uapi/app/auxillaries/components/AuxillariesConnectsPane.tsx', import.meta.url), 'utf8');
const auxillariesInterfacesPaneSource = readFileSync(new URL('../../uapi/app/auxillaries/components/AuxillariesInterfacesPane.tsx', import.meta.url), 'utf8');
const auxillariesBtdPaneSource = readFileSync(new URL('../../uapi/app/auxillaries/components/AuxillariesBTDPane.tsx', import.meta.url), 'utf8');
const auxillariesProfilePaneHeaderSource = readFileSync(new URL('../../uapi/app/auxillaries/components/headers/AuxillariesProfilePaneHeader.tsx', import.meta.url), 'utf8');
const auxillariesConnectsPaneHeaderSource = readFileSync(new URL('../../uapi/app/auxillaries/components/headers/AuxillariesConnectsPaneHeader.tsx', import.meta.url), 'utf8');
const auxillariesInterfacesPaneHeaderSource = readFileSync(new URL('../../uapi/app/auxillaries/components/headers/AuxillariesInterfacesPaneHeader.tsx', import.meta.url), 'utf8');
const auxillariesBtdPaneHeaderSource = readFileSync(new URL('../../uapi/app/auxillaries/components/headers/AuxillariesBTDPaneHeader.tsx', import.meta.url), 'utf8');
const auxillariesOrganizationSettingsSource = readFileSync(
  new URL('../../uapi/app/auxillaries/components/organization/OrganizationSettings.tsx', import.meta.url),
  'utf8',
);
const auxillariesBtdTreasuryManagementSource = readFileSync(
  new URL('../../uapi/app/auxillaries/components/organization/BTDTreasuryManagement.tsx', import.meta.url),
  'utf8',
);
const auxillariesPaneTitleSource = readFileSync(new URL('../../uapi/app/auxillaries/components/shared/PaneTitle.tsx', import.meta.url), 'utf8');
const auxillariesOnboardingInfoBoxSource = readFileSync(new URL('../../uapi/app/auxillaries/components/shared/OnboardingInfoBox.tsx', import.meta.url), 'utf8');
const auxillariesAfterOnboardingOverlaySource = readFileSync(new URL('../../uapi/app/auxillaries/components/shared/AfterOnboardingOverlay.tsx', import.meta.url), 'utf8');
const auxillariesPreferenceCardsSource = readFileSync(new URL('../../uapi/app/auxillaries/components/shared/AuxillariesPreferenceCards.tsx', import.meta.url), 'utf8');
const auxillariesStatGridSource = readFileSync(new URL('../../uapi/app/auxillaries/components/shared/AuxillariesStatGrid.tsx', import.meta.url), 'utf8');
const auxillariesWorkspaceSectionSource = readFileSync(new URL('../../uapi/app/auxillaries/components/shared/AuxillariesWorkspaceSection.tsx', import.meta.url), 'utf8');
const auxillariesGlobalModelSelectionSource = readFileSync(new URL('../../uapi/app/auxillaries/components/models/GlobalModelSelection.tsx', import.meta.url), 'utf8');
const auxillariesSystemPromptSectionSource = readFileSync(new URL('../../uapi/app/auxillaries/components/models/SystemPromptSection.tsx', import.meta.url), 'utf8');
const auxillariesDataSharingPanelSource = readFileSync(new URL('../../uapi/app/auxillaries/components/AuxillariesDataSharingPanel.tsx', import.meta.url), 'utf8');
const auxillaryPaneExplainersSource = readFileSync(new URL('../../uapi/app/auxillaries/components/auxillary-pane-explainers.ts', import.meta.url), 'utf8');
const auxillariesProfilePaneStylesSource = readFileSync(new URL('../../uapi/app/auxillaries/components/profile-pane.module.css', import.meta.url), 'utf8');
const auxillaryOnboardingContractSource = readFileSync(new URL('../../uapi/app/auxillaries/auxillary-onboarding-contract.ts', import.meta.url), 'utf8');
const userDataContextSource = readFileSync(new URL('../../uapi/context/UserDataContext.tsx', import.meta.url), 'utf8');
const useUserDataSource = readFileSync(new URL('../../uapi/hooks/useUserData.ts', import.meta.url), 'utf8');
const onboardingVisualSpecSource = readFileSync(new URL('../../uapi/tests/e2e/onboarding.visual.spec.ts', import.meta.url), 'utf8');
const onboardingFullFlowSpecSource = readFileSync(new URL('../../uapi/tests/e2e/onboarding-full-flow.spec.ts', import.meta.url), 'utf8');
const auxillariesHelperSource = readFileSync(new URL('../../uapi/tests/e2e/auxillaries.helpers.ts', import.meta.url), 'utf8');
const auxillariesBtdFlowsSpecSource = readFileSync(new URL('../../uapi/tests/e2e/auxillaries.btd.flows.spec.ts', import.meta.url), 'utf8');
const auxillariesConnectionsFlowsSpecPath = new URL('../../uapi/tests/e2e/auxillaries.connections.flows.spec.ts', import.meta.url);
const auxillariesProfileSpecPath = new URL('../../uapi/tests/e2e/auxillaries.profile.spec.ts', import.meta.url);
const auxillariesInterfacesFlowsSpecPath = new URL('../../uapi/tests/e2e/auxillaries.interfaces.flows.spec.ts', import.meta.url);
const auxillariesNavigationSpecPath = new URL('../../uapi/tests/e2e/auxillaries.navigation.spec.ts', import.meta.url);
const auxillariesBtdFlowsSpecPath = new URL('../../uapi/tests/e2e/auxillaries.btd.flows.spec.ts', import.meta.url);
const auxillariesBtdIntervalSpecPath = new URL('../../uapi/tests/e2e/auxillaries.btd.interval.active.spec.ts', import.meta.url);
const auxillariesBtdChartNoDataSpecPath = new URL('../../uapi/tests/e2e/auxillaries.btd.chart.nodata.spec.ts', import.meta.url);
const accountBtdVisualSpecPath = new URL('../../uapi/tests/e2e/account.btd.visual.spec.ts', import.meta.url);
const orbitalHelperPath = new URL('../../uapi/tests/e2e/orbital.helpers.ts', import.meta.url);
const orbitalConnectionsFlowsSpecPath = new URL('../../uapi/tests/e2e/orbital.connections.flows.spec.ts', import.meta.url);
const orbitalProfileSpecPath = new URL('../../uapi/tests/e2e/orbital.profile.spec.ts', import.meta.url);
const orbitalModelsFlowsSpecPath = new URL('../../uapi/tests/e2e/orbital.models.flows.spec.ts', import.meta.url);
const orbitalNavigationSpecPath = new URL('../../uapi/tests/e2e/orbital.navigation.spec.ts', import.meta.url);
const orbitalCreditsFlowsSpecPath = new URL('../../uapi/tests/e2e/orbital.credits.flows.spec.ts', import.meta.url);
const orbitalCreditsIntervalSpecPath = new URL('../../uapi/tests/e2e/orbital.credits.interval.active.spec.ts', import.meta.url);
const orbitalCreditsChartNoDataSpecPath = new URL('../../uapi/tests/e2e/orbital.credits.chart.nodata.spec.ts', import.meta.url);
const accountCreditsVisualSpecPath = new URL('../../uapi/tests/e2e/account.credits.visual.spec.ts', import.meta.url);
const checkoutCallbackClientPath = new URL('../../uapi/app/checkout/callback/CheckoutCallbackClient.tsx', import.meta.url);
const checkoutCallbackPagePath = new URL('../../uapi/app/checkout/callback/page.tsx', import.meta.url);
const createCheckoutSessionRoutePath = new URL('../../uapi/app/api/create-checkout-session/route.ts', import.meta.url);
const fulfillCheckoutSessionRoutePath = new URL('../../uapi/app/api/fulfill-checkout-session/route.ts', import.meta.url);
const lowBtdReminderRouteSource = readFileSync(new URL('../../uapi/app/api/notifications/low-btd-reminder/route.ts', import.meta.url), 'utf8');
const outOfBtdRouteSource = readFileSync(new URL('../../uapi/app/api/notifications/out-of-btd/route.ts', import.meta.url), 'utf8');
const btdTransferRouteSource = readFileSync(new URL('../../uapi/app/api/notifications/btd-transfer/route.ts', import.meta.url), 'utf8');
const apiClientSource = readFileSync(new URL('../../uapi/networking/api-client.ts', import.meta.url), 'utf8');
const btdTrackerSource = readFileSync(new URL('../../uapi/components/base/bitcode/btd/btd-tracker.tsx', import.meta.url), 'utf8');
const marketingPricingSectionSource = readFileSync(new URL('../../uapi/app/(root)/components/MarketingPricingSection.tsx', import.meta.url), 'utf8');
const nextConfigSource = readFileSync(new URL('../../uapi/next.config.mjs', import.meta.url), 'utf8');
const securityHeadersSource = readFileSync(new URL('../../uapi/middleware/security-headers.ts', import.meta.url), 'utf8');
const mockingIndexSource = readFileSync(new URL('../../uapi/mocking/index.ts', import.meta.url), 'utf8');
const mockingReadmeSource = readFileSync(new URL('../../uapi/mocking/README.md', import.meta.url), 'utf8');
const mockingIntegrationGuideSource = readFileSync(new URL('../../uapi/mocking/INTEGRATION_GUIDE.md', import.meta.url), 'utf8');
const mockingQuickStartDemoSource = readFileSync(new URL('../../uapi/mocking/QUICK_START_DEMO.md', import.meta.url), 'utf8');
const mockingSummarySource = readFileSync(new URL('../../uapi/mocking/COMPREHENSIVE_SYSTEM_SUMMARY.md', import.meta.url), 'utf8');
const mockingValidateSystemSource = readFileSync(new URL('../../uapi/mocking/validate-system.js', import.meta.url), 'utf8');
const mockingScriptsPackageSource = readFileSync(new URL('../../uapi/mocking/scripts/package.json', import.meta.url), 'utf8');
const mockingScriptsReadmeSource = readFileSync(new URL('../../uapi/mocking/scripts/README.md', import.meta.url), 'utf8');
const mockingSetupScriptSource = readFileSync(new URL('../../uapi/mocking/scripts/setup-mock-system.js', import.meta.url), 'utf8');
const mockingValidateScriptSource = readFileSync(new URL('../../uapi/mocking/scripts/validate-mock-system.js', import.meta.url), 'utf8');
const mockProviderSource = readFileSync(new URL('../../uapi/mocking/integration/MockProvider.tsx', import.meta.url), 'utf8');
const mockOrchestratorSource = readFileSync(new URL('../../uapi/mocking/core/MockOrchestrator.ts', import.meta.url), 'utf8');
const mockDataGeneratorsSource = readFileSync(new URL('../../uapi/mocking/generators/MockDataGenerators.ts', import.meta.url), 'utf8');
const comprehensiveMockDataGeneratorsSource = readFileSync(new URL('../../uapi/mocking/generators/ComprehensiveMockDataGenerators.ts', import.meta.url), 'utf8');
const specializedMockMiddlewareSource = readFileSync(new URL('../../uapi/mocking/middleware/SpecializedMockMiddleware.ts', import.meta.url), 'utf8');
const mockingTypesSource = readFileSync(new URL('../../uapi/mocking/types/core.ts', import.meta.url), 'utf8');
const orbitalsSurfaceSource = readFileSync(new URL('../../uapi/app/orbitals/components/index.tsx', import.meta.url), 'utf8');
const orbitalsContentSource = readFileSync(new URL('../../uapi/app/orbitals/components/OrbitalsContent.tsx', import.meta.url), 'utf8');
const orbitalsLoginPaneSource = readFileSync(new URL('../../uapi/app/orbitals/components/OrbitalsLoginPane.tsx', import.meta.url), 'utf8');
const orbitalsOrbitalHeaderSource = readFileSync(new URL('../../uapi/app/orbitals/components/headers/OrbitalsOrbitalHeader.tsx', import.meta.url), 'utf8');
const orbitalsProfileOrbitalHeaderSource = readFileSync(new URL('../../uapi/app/orbitals/components/headers/OrbitalsProfileOrbitalHeader.tsx', import.meta.url), 'utf8');
const orbitalsConnectsOrbitalHeaderSource = readFileSync(new URL('../../uapi/app/orbitals/components/headers/OrbitalsConnectsOrbitalHeader.tsx', import.meta.url), 'utf8');
const orbitalsInterfacesOrbitalHeaderSource = readFileSync(new URL('../../uapi/app/orbitals/components/headers/OrbitalsInterfacesOrbitalHeader.tsx', import.meta.url), 'utf8');
const orbitalsBtdOrbitalHeaderSource = readFileSync(new URL('../../uapi/app/orbitals/components/headers/OrbitalsBTDOrbitalHeader.tsx', import.meta.url), 'utf8');
const orbitalsPaneTitleSource = readFileSync(new URL('../../uapi/app/orbitals/components/shared/PaneTitle.tsx', import.meta.url), 'utf8');
const orbitalsOnboardingInfoBoxSource = readFileSync(new URL('../../uapi/app/orbitals/components/shared/OnboardingInfoBox.tsx', import.meta.url), 'utf8');
const orbitalsAfterOnboardingOverlaySource = readFileSync(new URL('../../uapi/app/orbitals/components/shared/after-onboarding-overlay.tsx', import.meta.url), 'utf8');
const orbitalsPreferenceCardsSource = readFileSync(new URL('../../uapi/app/orbitals/components/shared/OrbitalsPreferenceCards.tsx', import.meta.url), 'utf8');
const orbitalsStatGridSource = readFileSync(new URL('../../uapi/app/orbitals/components/shared/OrbitalsStatGrid.tsx', import.meta.url), 'utf8');
const orbitalsWorkspaceSectionSource = readFileSync(new URL('../../uapi/app/orbitals/components/shared/OrbitalsWorkspaceSection.tsx', import.meta.url), 'utf8');
const orbitalsGlobalModelSelectionSource = readFileSync(new URL('../../uapi/app/orbitals/components/models/GlobalModelSelection.tsx', import.meta.url), 'utf8');
const orbitalsSystemPromptSectionSource = readFileSync(new URL('../../uapi/app/orbitals/components/models/SystemPromptSection.tsx', import.meta.url), 'utf8');
const orbitalsDataSharingPanelSource = readFileSync(new URL('../../uapi/app/orbitals/components/OrbitalsDataSharingPanel.tsx', import.meta.url), 'utf8');
const orbitalsPaneExplainersSource = readFileSync(new URL('../../uapi/app/orbitals/components/orbital-pane-explainers.ts', import.meta.url), 'utf8');
const assetPackSystemReflectionSource = readFileSync(new URL('../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_asset_pack_system_ultra_critical_reflection.ts', import.meta.url), 'utf8');
const promptsIndexSource = readFileSync(new URL('../../packages/prompts/src/index.ts', import.meta.url), 'utf8');
const promptPartSource = readFileSync(new URL('../../packages/prompts/src/parts/PromptPart.ts', import.meta.url), 'utf8');
const promptPackageJsonSource = readFileSync(new URL('../../packages/prompts/package.json', import.meta.url), 'utf8');
const promptBenchmarkCliSource = readFileSync(new URL('../../packages/prompts/src/benchmarking/cli.ts', import.meta.url), 'utf8');
const promptBenchmarkReadmeSource = readFileSync(new URL('../../packages/prompts/src/benchmarking/README.md', import.meta.url), 'utf8');
const promptsIndexJsSource = readFileSync(new URL('../../packages/prompts/src/index.js', import.meta.url), 'utf8');
const promptPartJsSource = readFileSync(new URL('../../packages/prompts/src/parts/PromptPart.js', import.meta.url), 'utf8');
const promptTaskGuideSource = readFileSync(new URL('../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_digest_taskguides_identity_corestatement.ts', import.meta.url), 'utf8');
const promptCodeStylesIdentitySource = readFileSync(new URL('../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_digest_codestyles_identity_corestatement.ts', import.meta.url), 'utf8');
const promptCodeStylesBaseSource = readFileSync(new URL('../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_tool_digest_codestyles_base_core.ts', import.meta.url), 'utf8');
const bitcodeDemoSource = readFileSync(new URL('../src/bitcode-demo.js', import.meta.url), 'utf8');
const bitcodeCoreSource = readFileSync(new URL('../src/bitcode-core.js', import.meta.url), 'utf8');
const settlementSource = readFileSync(new URL('../src/canonical/settlement.js', import.meta.url), 'utf8');
const demoScenarioSource = readFileSync(new URL('../src/demo-scenario.js', import.meta.url), 'utf8');
const receiptSchemasSource = readFileSync(new URL('../src/receipt-schemas.js', import.meta.url), 'utf8');
const seedSource = readFileSync(new URL('../src/seed.js', import.meta.url), 'utf8');
const policyReleaseSource = readFileSync(new URL('../src/policy-release.js', import.meta.url), 'utf8');
const surfacesSource = readFileSync(new URL('../src/canonical/surfaces.js', import.meta.url), 'utf8');
const v20QualitySource = readFileSync(new URL('../src/canonical/v20-quality.js', import.meta.url), 'utf8');
const v23BitcoinDemonstrationServiceSource = readFileSync(
  new URL('../src/canonical/v23-bitcoin-demonstration-service.js', import.meta.url),
  'utf8',
);
const v23BitcoinSource = readFileSync(new URL('../src/canonical/v23-bitcoin.js', import.meta.url), 'utf8');
const streamsTsSource = readFileSync(new URL('../../packages/streams/src/streams.ts', import.meta.url), 'utf8');
const streamsJsSourceUrl = new URL('../../packages/streams/src/streams.js', import.meta.url);
const apiAuthRouteSource = readFileSync(new URL('../../packages/api/src/routes/auth.ts', import.meta.url), 'utf8');
const apiUserRouteSource = readFileSync(new URL('../../packages/api/src/routes/user.ts', import.meta.url), 'utf8');
const apiShippablesRouteSource = readFileSync(new URL('../../packages/api/src/routes/shippables.ts', import.meta.url), 'utf8');
const apiExecutionsRouteSource = readFileSync(new URL('../../packages/api/src/routes/executions.ts', import.meta.url), 'utf8');
const apiPackageSource = readFileSync(new URL('../../packages/api/package.json', import.meta.url), 'utf8');
const apiReadmeSource = readFileSync(new URL('../../packages/api/README.md', import.meta.url), 'utf8');
const apiIndexSource = readFileSync(new URL('../../packages/api/src/index.ts', import.meta.url), 'utf8');
const apiAuxillariesRouteSource = readFileSync(new URL('../../packages/api/src/routes/auxillaries.ts', import.meta.url), 'utf8');
const apiAuxillariesContractSource = readFileSync(
  new URL('../../packages/api/src/routes/auxillaries-contract.ts', import.meta.url),
  'utf8',
);
const conversationsApiRouteSource = readFileSync(new URL('../../uapi/app/api/conversations/route.ts', import.meta.url), 'utf8');
const conversationBranchApiRouteSource = readFileSync(new URL('../../uapi/app/api/conversations/branch/route.ts', import.meta.url), 'utf8');
const conversationStreamApiRouteSource = readFileSync(new URL('../../uapi/app/api/conversations/stream/route.ts', import.meta.url), 'utf8');
const conversationThreadStreamApiRouteSource = readFileSync(new URL('../../uapi/app/api/conversations/[conversationId]/stream/route.ts', import.meta.url), 'utf8');
const executionsApiRouteSource = readFileSync(new URL('../../uapi/app/api/executions/route.ts', import.meta.url), 'utf8');
const executionHistoryApiRouteSource = readFileSync(new URL('../../uapi/app/api/executions/history/route.ts', import.meta.url), 'utf8');
const executionHistoryRunApiRouteSource = readFileSync(new URL('../../uapi/app/api/executions/history/[runId]/route.ts', import.meta.url), 'utf8');
const auxillariesOnboardingApiRouteSource = readFileSync(
  new URL('../../uapi/app/api/auxillaries/onboarding/route.ts', import.meta.url),
  'utf8',
);
const auxillariesDataApiRouteSource = readFileSync(
  new URL('../../uapi/app/api/auxillaries/data/route.ts', import.meta.url),
  'utf8',
);
const auxillariesModelPreferencesApiRouteSource = readFileSync(
  new URL('../../uapi/app/api/auxillaries/model-preferences/route.ts', import.meta.url),
  'utf8',
);
const auxillariesTemplatePreferencesApiRouteSource = readFileSync(
  new URL('../../uapi/app/api/auxillaries/template-preferences/route.ts', import.meta.url),
  'utf8',
);
const webSearchSource = readFileSync(new URL('../../packages/web-search/src/index.ts', import.meta.url), 'utf8');
const webSearchReadmeSource = readFileSync(new URL('../../packages/web-search/README.md', import.meta.url), 'utf8');
const googleAnalyticsReadmeSource = readFileSync(new URL('../../packages/google-analytics/README.md', import.meta.url), 'utf8');
const registryReadmeSource = readFileSync(new URL('../../packages/registry/README.md', import.meta.url), 'utf8');
const registryTldrSource = readFileSync(new URL('../../packages/registry/TLDR.md', import.meta.url), 'utf8');
const registryTodoSource = readFileSync(new URL('../../packages/registry/TODO.md', import.meta.url), 'utf8');
const modelsReadmeSource = readFileSync(new URL('../../packages/models/README.md', import.meta.url), 'utf8');
const modelsPricingSource = readFileSync(new URL('../../packages/models/src/pricing.ts', import.meta.url), 'utf8');
const errorsPackageSource = readFileSync(new URL('../../packages/errors/package.json', import.meta.url), 'utf8');
const errorsTsSource = readFileSync(new URL('../../packages/errors/src/errors.ts', import.meta.url), 'utf8');
const errorsJsSource = readFileSync(new URL('../../packages/errors/src/errors.js', import.meta.url), 'utf8');
const notionPackageSource = readFileSync(new URL('../../packages/notion/package.json', import.meta.url), 'utf8');
const notionReadmeSource = readFileSync(new URL('../../packages/notion/README.md', import.meta.url), 'utf8');
const observabilityPackageSource = readFileSync(new URL('../../packages/observability/package.json', import.meta.url), 'utf8');
const observabilityReadmeSource = readFileSync(new URL('../../packages/observability/README.md', import.meta.url), 'utf8');
const observabilityJsSource = readFileSync(new URL('../../packages/observability/src/observability.js', import.meta.url), 'utf8');
const sentryReadmeSource = readFileSync(new URL('../../packages/sentry/README.md', import.meta.url), 'utf8');
const kubernetesReadmeSource = readFileSync(new URL('../../packages/kubernetes/README.md', import.meta.url), 'utf8');
const loggerReadmeSource = readFileSync(new URL('../../packages/logger/README.md', import.meta.url), 'utf8');
const ormPackageSource = readFileSync(new URL('../../packages/orm/package.json', import.meta.url), 'utf8');
const ormReadmeSource = readFileSync(new URL('../../packages/orm/README.md', import.meta.url), 'utf8');
const ormIndexSource = readFileSync(new URL('../../packages/orm/src/index.ts', import.meta.url), 'utf8');
const ormDatabaseGeneratedSource = readFileSync(new URL('../../packages/orm/src/types/database.generated.ts', import.meta.url), 'utf8');
const activeFieldIntelligenceUrls = [
  '../../packages/orm/src/queries/field-intelligence.ts',
  '../../packages/prompts/src/raw_promptparts/specific/promptpart_specific_fielddoc_intelligencecontext_detailcontent.ts',
].map((relativePath) => new URL(relativePath, import.meta.url));
const attachmentsGenericsPackageSource = readFileSync(new URL('../../packages/attachments-generics/package.json', import.meta.url), 'utf8');
const attachmentsGenericsReadmeSource = readFileSync(new URL('../../packages/attachments-generics/README.md', import.meta.url), 'utf8');
const attachmentsGenericsIndexSource = readFileSync(new URL('../../packages/attachments-generics/src/index.ts', import.meta.url), 'utf8');
const attachmentsGenericsTypesSource = readFileSync(new URL('../../packages/attachments-generics/src/types.ts', import.meta.url), 'utf8');
const btdIndexSource = readFileSync(new URL('../../packages/btd/src/index.ts', import.meta.url), 'utf8');
const btdIndexJsSource = readFileSync(new URL('../../packages/btd/src/index.js', import.meta.url), 'utf8');
const btdPlansSource = readFileSync(new URL('../../packages/btd/src/plans.ts', import.meta.url), 'utf8');
const digestReadmeSource = readFileSync(new URL('../../packages/digest/README.md', import.meta.url), 'utf8');
const digestCachingSource = readFileSync(new URL('../../packages/digest/caching/index.ts', import.meta.url), 'utf8');
const digestCachingTestSource = readFileSync(new URL('../../packages/digest/caching/__tests__/caching.test.ts', import.meta.url), 'utf8');
const digestCodeStyleSource = readFileSync(new URL('../../packages/digest/code-style/index.ts', import.meta.url), 'utf8');
const digestAgentPromptsSource = readFileSync(new URL('../../packages/digest/prompts/agent-prompts.ts', import.meta.url), 'utf8');
const digestProductPromptsSource = readFileSync(new URL('../../packages/digest/prompts/product-prompts.ts', import.meta.url), 'utf8');
const digestRunSource = readFileSync(new URL('../../packages/digest/run/digest.ts', import.meta.url), 'utf8');
const digestGenerateDigestTestSource = readFileSync(new URL('../../packages/digest/run/__tests__/generateDigest.test.ts', import.meta.url), 'utf8');
const digestJestConfigSource = readFileSync(new URL('../../packages/digest/jest.config.cjs', import.meta.url), 'utf8');
const digestTsconfigTestSource = readFileSync(new URL('../../packages/digest/tsconfig.test.json', import.meta.url), 'utf8');
const digestBitcodeLoggerMockSource = readFileSync(new URL('../../packages/digest/__mocks__/bitcode/logger.ts', import.meta.url), 'utf8');
const digestGitMockSource = readFileSync(new URL('../../packages/digest/__mocks__/lib/git/git.ts', import.meta.url), 'utf8');
const digestServiceReadmeSource = readFileSync(new URL('../../packages/digest/service/README.md', import.meta.url), 'utf8');
const chatgptAppServerSource = readFileSync(new URL('../../packages/chatgptapp/src/server.ts', import.meta.url), 'utf8');
const chatgptAppToolsSource = readFileSync(new URL('../../packages/chatgptapp/src/tools.ts', import.meta.url), 'utf8');
const chatgptAppIndexSource = readFileSync(new URL('../../packages/chatgptapp/src/index.ts', import.meta.url), 'utf8');
const chatgptAppPackageSource = readFileSync(new URL('../../packages/chatgptapp/package.json', import.meta.url), 'utf8');
const chatgptAppReadmeSource = readFileSync(new URL('../../packages/chatgptapp/README.md', import.meta.url), 'utf8');
const chatgptAppDemoSource = readFileSync(new URL('../../packages/chatgptapp/DEMO.md', import.meta.url), 'utf8');
const chatgptAppTldrSource = readFileSync(new URL('../../packages/chatgptapp/TLDR.md', import.meta.url), 'utf8');
const chatgptAppTodoSource = readFileSync(new URL('../../packages/chatgptapp/TODO.md', import.meta.url), 'utf8');
const chatgptAppEnvSource = readFileSync(new URL('../../packages/chatgptapp/src/env.ts', import.meta.url), 'utf8');
const chatgptAppYapperFlowTestSource = readFileSync(new URL('../../packages/chatgptapp/src/__tests__/yapperFlow.test.ts', import.meta.url), 'utf8');
const chatgptAppArtifactsMockSource = readFileSync(new URL('../../packages/chatgptapp/src/__mocks__/bitcode-artifacts.ts', import.meta.url), 'utf8');
const emailPackageSource = readFileSync(new URL('../../packages/email/package.json', import.meta.url), 'utf8');
const emailReadmeSource = readFileSync(new URL('../../packages/email/README.md', import.meta.url), 'utf8');
const emailInvitationServiceSource = readFileSync(new URL('../../packages/email/src/services/invitationService.ts', import.meta.url), 'utf8');
const makefileSource = readFileSync(new URL('../../Makefile', import.meta.url), 'utf8');
const rootPackageSource = readFileSync(new URL('../../package.json', import.meta.url), 'utf8');
const rootPackageLockSource = readFileSync(new URL('../../package-lock.json', import.meta.url), 'utf8');
const rootPnpmLockSource = readFileSync(new URL('../../pnpm-lock.yaml', import.meta.url), 'utf8');
const rootTsconfigSource = readFileSync(new URL('../../tsconfig.json', import.meta.url), 'utf8');
const rootEnvSource = readFileSync(new URL('../../.env', import.meta.url), 'utf8');
const rootEnvLocalSource = readFileSync(new URL('../../.env.local', import.meta.url), 'utf8');
const v26EnvSource = readFileSync(new URL('../../.v26.env', import.meta.url), 'utf8');
const conversationsOpenApiSource = readFileSync(new URL('../../docs/api/conversations-openapi.yaml', import.meta.url), 'utf8');
const rootReadmeSource = readFileSync(new URL('../../README.md', import.meta.url), 'utf8');
const rootProductSource = readFileSync(new URL('../../PRODUCT.md', import.meta.url), 'utf8');
const webSearchProductionWorkflowSource = readFileSync(new URL('../../.github/workflows/web-search-production.yml', import.meta.url), 'utf8');
const terminalOperatorExperienceDocSource = readFileSync(new URL('../../internal-docs/BITCODE_TERMINAL_OPERATOR_EXPERIENCE.md', import.meta.url), 'utf8');
const integrationsDocSource = readFileSync(new URL('../../internal-docs/INTEGRATIONS.md', import.meta.url), 'utf8');
const conversationsDocSource = readFileSync(new URL('../../internal-docs/BITCODE_CONVERSATIONS.md', import.meta.url), 'utf8');
const apiDocSource = readFileSync(new URL('../../internal-docs/BITCODE_API.md', import.meta.url), 'utf8');
const connectedServicesDocSource = readFileSync(new URL('../../internal-docs/BITCODE_CONNECTED_SERVICES.md', import.meta.url), 'utf8');
const internalDocsReadmeSource = readFileSync(new URL('../../internal-docs/README.md', import.meta.url), 'utf8');
const mysqlReadmeSource = readFileSync(new URL('../../packages/mysql/README.md', import.meta.url), 'utf8');
const authReadmeSource = readFileSync(new URL('../../packages/auth/README.md', import.meta.url), 'utf8');
const postgresqlReadmeSource = readFileSync(new URL('../../packages/postgresql/README.md', import.meta.url), 'utf8');
const jiraReadmeSource = readFileSync(new URL('../../packages/jira/README.md', import.meta.url), 'utf8');
const supabaseReadmeSource = readFileSync(new URL('../../packages/supabase/README.md', import.meta.url), 'utf8');
const supabaseClientSource = readFileSync(new URL('../../packages/supabase/src/client.ts', import.meta.url), 'utf8');
const templatesGenericsTypesSource = readFileSync(new URL('../../packages/templates-generics/src/types.ts', import.meta.url), 'utf8');
const templatesGenericsPackageSource = readFileSync(new URL('../../packages/templates-generics/package.json', import.meta.url), 'utf8');
const docCodingSource = readFileSync(new URL('../../internal-docs/DOC-CODING.md', import.meta.url), 'utf8');
const promptSystemDocSource = readFileSync(new URL('../../internal-docs/BITCODE_PROMPT_SYSTEM.md', import.meta.url), 'utf8');
const llmRegistryDocSource = readFileSync(new URL('../../internal-docs/BITCODE_LLM_REGISTRY.md', import.meta.url), 'utf8');
const securityDocSource = readFileSync(new URL('../../internal-docs/SECURITY.md', import.meta.url), 'utf8');
const protocolThesisDocSource = readFileSync(new URL('../../internal-docs/BITCODE_PROTOCOL_THESIS.md', import.meta.url), 'utf8');
const terminologyDocSource = readFileSync(new URL('../../internal-docs/TERMINOLOGY.md', import.meta.url), 'utf8');
const architecturePatternsDocSource = readFileSync(new URL('../../internal-docs/BITCODE_ARCHITECTURE_PATTERNS.md', import.meta.url), 'utf8');
const performanceDocSource = readFileSync(new URL('../../internal-docs/PERFORMANCE.md', import.meta.url), 'utf8');
const verificationDocSource = readFileSync(new URL('../../internal-docs/BITCODE_VERIFICATION.md', import.meta.url), 'utf8');
const auxillariesReadinessDocSource = readFileSync(new URL('../../internal-docs/BITCODE_AUXILLARIES_READINESS.md', import.meta.url), 'utf8');
const styleDocSource = readFileSync(new URL('../../internal-docs/BITCODE_INTERFACE_STYLE.md', import.meta.url), 'utf8');
const deploymentDocSource = readFileSync(new URL('../../internal-docs/DEPLOYMENT.md', import.meta.url), 'utf8');
const bitcodeV10PrepMemoSource = readFileSync(new URL('../../BITCODE_V10_PREP_MEMO.md', import.meta.url), 'utf8');
const bitcodeV11PrepMemoSource = readFileSync(new URL('../../BITCODE_V11_PREP_MEMO.md', import.meta.url), 'utf8');
const executionWorkSummariesDocSource = readFileSync(new URL('../../internal-docs/BITCODE_EXECUTION_WORK_SUMMARIES.md', import.meta.url), 'utf8');
const frontendArchitectureDocSource = readFileSync(new URL('../../internal-docs/BITCODE_FRONTEND_ARCHITECTURE.md', import.meta.url), 'utf8');
const databaseDocSource = readFileSync(new URL('../../internal-docs/BITCODE_EXCHANGE_DATABASE.md', import.meta.url), 'utf8');
const executionsDocSource = readFileSync(new URL('../../internal-docs/BITCODE_EXECUTIONS.md', import.meta.url), 'utf8');
const uapiArchitectureDocSource = readFileSync(new URL('../../uapi/ARCHITECTURE.md', import.meta.url), 'utf8');
const consolidatedSystemGuideSource = readFileSync(new URL('../../uapi/styles/CONSOLIDATED_SYSTEM_GUIDE.md', import.meta.url), 'utf8');
const webSearchEnhancedResearchExampleSource = readFileSync(new URL('../../packages/web-search/examples/enhanced-research-example.ts', import.meta.url), 'utf8');
const productGuideSource = readFileSync(new URL('../../.ai/PRODUCT.md', import.meta.url), 'utf8');
const marketingTestimonialsCtaSource = readFileSync(new URL('../../uapi/app/(root)/components/MarketingTestimonialsCTA.tsx', import.meta.url), 'utf8');
const marketingFeatureBentoSource = readFileSync(new URL('../../uapi/app/(root)/components/MarketingFeatureBento.tsx', import.meta.url), 'utf8');
const marketingFeatureListSource = readFileSync(new URL('../../uapi/app/(root)/components/MarketingFeatureList.tsx', import.meta.url), 'utf8');
const marketingStepsSource = readFileSync(new URL('../../uapi/app/(root)/components/MarketingSteps.tsx', import.meta.url), 'utf8');
const marketingHeadlessMobileShowcaseSource = readFileSync(
  new URL('../../uapi/app/(root)/components/MarketingHeadlessMobileShowcase.tsx', import.meta.url),
  'utf8',
);
const uapiBaseReadmeSource = readFileSync(new URL('../../uapi/components/base/README.md', import.meta.url), 'utf8');
const tailwindConfigSource = readFileSync(new URL('../../uapi/tailwind.config.ts', import.meta.url), 'utf8');
const longRunnerWorkerSource = readFileSync(new URL('../../uapi/scripts/long-runner-worker.ts', import.meta.url), 'utf8');
const dockerLongRunnerSource = readFileSync(new URL('../../Dockerfile.long-runner', import.meta.url), 'utf8');
const emailLogoSource = readFileSync(new URL('../../uapi/public/email-logo.svg', import.meta.url), 'utf8');
const magicLinkStorySource = readFileSync(new URL('../../uapi/stories/email-templates/MagicLink.stories.tsx', import.meta.url), 'utf8');
const confirmStorySource = readFileSync(new URL('../../uapi/stories/email-templates/Confirm.stories.tsx', import.meta.url), 'utf8');
const emailChangeStorySource = readFileSync(new URL('../../uapi/stories/email-templates/EmailChange.stories.tsx', import.meta.url), 'utf8');
const inviteStorySource = readFileSync(new URL('../../uapi/stories/email-templates/Invite.stories.tsx', import.meta.url), 'utf8');
const genericNotificationStorySource = readFileSync(new URL('../../uapi/stories/email-templates/GenericNotification.stories.tsx', import.meta.url), 'utf8');
const passwordRecoveryStorySource = readFileSync(new URL('../../uapi/stories/email-templates/PasswordRecovery.stories.tsx', import.meta.url), 'utf8');
const upgradeStatusStorySource = readFileSync(new URL('../../uapi/stories/email-templates/UpgradeStatus.stories.tsx', import.meta.url), 'utf8');
const stylingReadmeSource = readFileSync(new URL('../../packages/styling/README.md', import.meta.url), 'utf8');
const lspContextAwarenessCompositionSource = readFileSync(
  new URL('../../packages/generic-tools/lsp-query/src/prompts/lsp-context-awareness-composition.ts', import.meta.url),
  'utf8',
);
const vulnerabilityAuditSource = readFileSync(new URL('../../VULNERABILITY_AUDIT_2026-04-02.md', import.meta.url), 'utf8');
const investorMemoSource = readFileSync(new URL('../../INVESTOR_MEMO.md', import.meta.url), 'utf8');
const introPamphletSource = readFileSync(new URL('../../.sales/INTRO_PAMPHLET.md', import.meta.url), 'utf8');
const uapiEnvExampleSource = readFileSync(new URL('../../uapi/.env.example', import.meta.url), 'utf8');
const uapiEnvSource = readFileSync(new URL('../../uapi/.env', import.meta.url), 'utf8');
const uapiTsconfigSource = readFileSync(new URL('../../uapi/tsconfig.json', import.meta.url), 'utf8');
const storybookMainSource = readFileSync(new URL('../../uapi/.storybook/main.ts', import.meta.url), 'utf8');
const storybookPreviewSource = readFileSync(new URL('../../uapi/.storybook/preview.tsx', import.meta.url), 'utf8');
const startBitcodeMcpScriptSource = readFileSync(new URL('../../scripts/start-bitcode-mcp.sh', import.meta.url), 'utf8');
const phase2CompleteScriptSource = readFileSync(new URL('../../scripts/phase2-complete.sh', import.meta.url), 'utf8');
const phase2NamingComplianceScriptSource = readFileSync(new URL('../../scripts/phase2-naming-compliance.py', import.meta.url), 'utf8');
const userDeletionFunctionSource = readFileSync(new URL('../../scripts/user_deletion_function_with_cascading_cleanup.sql', import.meta.url), 'utf8');
const contractChangeLedgerTestSource = readFileSync(new URL('./contract-change-ledger.test.js', import.meta.url), 'utf8');
const v20QualityFixtureSource = readFileSync(new URL('./v20-quality-fixture.js', import.meta.url), 'utf8');
const e2eTestSource = readFileSync(new URL('./e2e.test.js', import.meta.url), 'utf8');
const verifyAssetPackQualityScriptSource = readFileSync(new URL('../../scripts/verify-asset-pack-quality.sh', import.meta.url), 'utf8');
const updateAssetPackStorageTableNamesScriptSource = readFileSync(new URL('../../scripts/update-asset-pack-storage-table-names.sh', import.meta.url), 'utf8');
const updateAssetPackAgentsScriptSource = readFileSync(new URL('../../scripts/update-asset-pack-agents.sh', import.meta.url), 'utf8');
const promptAuditScriptSource = readFileSync(new URL('../../scripts/prompt-audit.sh', import.meta.url), 'utf8');
const generateAssetPackPromptPartsTsSource = readFileSync(new URL('../../scripts/generate-asset-pack-promptparts.ts', import.meta.url), 'utf8');
const fixExecutionToDirectivesScriptSource = readFileSync(new URL('../../scripts/fix-execution-to-directives.sh', import.meta.url), 'utf8');
const verifyPromptExportsScriptSource = readFileSync(new URL('../../scripts/verify-prompt-exports.py', import.meta.url), 'utf8');
const cleanupRemainingDocsScriptSource = readFileSync(new URL('../../scripts/cleanup_remaining_docs.py', import.meta.url), 'utf8');
const cleanupOutdatedDocsScriptSource = readFileSync(new URL('../../scripts/cleanup_outdated_docs.py', import.meta.url), 'utf8');
const cleanupOutdatedDocsShellScriptSource = readFileSync(new URL('../../scripts/cleanup-outdated-docs.sh', import.meta.url), 'utf8');
const fixRemainingImportsScriptSource = readFileSync(new URL('../../scripts/fix-remaining-imports.sh', import.meta.url), 'utf8');
const fixBarrelImportsScriptSource = readFileSync(new URL('../../scripts/fix-barrel-imports.sh', import.meta.url), 'utf8');
const fixMultilineImportsScriptSource = readFileSync(new URL('../../scripts/fix-multiline-imports.sh', import.meta.url), 'utf8');
const fixCorruptedImportsScriptSource = readFileSync(new URL('../../scripts/fix-corrupted-imports.sh', import.meta.url), 'utf8');
const generateMassivePromptPartsScriptSource = readFileSync(new URL('../../scripts/generate-massive-prompt-parts.ts', import.meta.url), 'utf8');
const massUpdatePromptPartsScriptSource = readFileSync(new URL('../../scripts/mass-update-prompt-parts.ts', import.meta.url), 'utf8');
const codemodDeepPromptpartsScriptSource = readFileSync(new URL('../../scripts/codemod-deep-promptparts.mjs', import.meta.url), 'utf8');
const normalizeAssetPackPromptpartsScriptSource = readFileSync(new URL('../../scripts/normalize-asset-pack-promptparts.mjs', import.meta.url), 'utf8');
const architectureReviewScriptSource = readFileSync(new URL('../../scripts/architecture-review.ts', import.meta.url), 'utf8');
const generateToolJsdocScriptSource = readFileSync(new URL('../../scripts/generate-tool-jsdoc.ts', import.meta.url), 'utf8');
const codeRefactorToolSource = readFileSync(new URL('../../packages/generic-tools/code-refactor/src/index.ts', import.meta.url), 'utf8');
const codeReviewReadmeSource = readFileSync(new URL('../../scripts/code-review/README.md', import.meta.url), 'utf8');
const baseReviewScriptSource = readFileSync(new URL('../../scripts/code-review/base-review.sh', import.meta.url), 'utf8');
const reviewExcellenceGuideSource = readFileSync(new URL('../../scripts/code-review/REVIEW_EXCELLENCE_GUIDE.md', import.meta.url), 'utf8');
const reviewPromptPrimitivesEvolutionSource = readFileSync(new URL('../../scripts/code-review/reviews/review_prompt_primitives_evolution.sh', import.meta.url), 'utf8');
const reviewPromptPrimitivesEvolutionStdoutSource = readFileSync(new URL('../../scripts/code-review/reviews/review_prompt_primitives_evolution_stdout.sh', import.meta.url), 'utf8');
const bitcodeCanonWorkflowSource = readFileSync(new URL('../../.github/workflows/bitcode-canon-quality.yml', import.meta.url), 'utf8');
const rootEslintConfigSource = readFileSync(new URL('../../.eslintrc.cjs', import.meta.url), 'utf8');
const eslintPluginBitcodePackageSource = readFileSync(new URL('../../packages/eslint-plugin-bitcode/package.json', import.meta.url), 'utf8');
const eslintPluginBitcodeDocSource = readFileSync(new URL('../../packages/eslint-plugin-bitcode/docs/no-write-tools-outside-implementation.md', import.meta.url), 'utf8');
const bitcodeChecklistSource = readFileSync(new URL('../CHECKLIST.md', import.meta.url), 'utf8');
const loggerPackageSource = readFileSync(new URL('../../packages/logger/package.json', import.meta.url), 'utf8');
const loggerTsSource = readFileSync(new URL('../../packages/logger/src/logger.ts', import.meta.url), 'utf8');
const loggerJsSource = readFileSync(new URL('../../packages/logger/src/logger.js', import.meta.url), 'utf8');
const agentGenericsReadmeSource = readFileSync(new URL('../../packages/agent-generics/README.md', import.meta.url), 'utf8');
const agentGenericsTldrSource = readFileSync(new URL('../../packages/agent-generics/TLDR.md', import.meta.url), 'utf8');
const agentDiagnosticsConfigSource = readFileSync(new URL('../../packages/agent-generics/src/diagnostics/config.ts', import.meta.url), 'utf8');
const agentDiagnosticsInstrumentationSource = readFileSync(new URL('../../packages/agent-generics/src/diagnostics/instrumentation.ts', import.meta.url), 'utf8');
const agentExecutionSource = readFileSync(new URL('../../packages/agent-generics/src/execution/AgentExecution.ts', import.meta.url), 'utf8');
const agentFactoriesSource = readFileSync(new URL('../../packages/agent-generics/src/agents/factories.ts', import.meta.url), 'utf8');
const agentThinkingsGenerationSource = readFileSync(new URL('../../packages/agent-generics/src/steps/thinkings-generation.ts', import.meta.url), 'utf8');
const agentFailsafeSequenceSource = readFileSync(new URL('../../packages/agent-generics/src/steps/failsafe-sequence.ts', import.meta.url), 'utf8');
const agentSubstepsFactoriesSource = readFileSync(new URL('../../packages/agent-generics/src/substeps/factories.ts', import.meta.url), 'utf8');
const agentNormalizeStepNameSource = readFileSync(new URL('../../packages/agent-generics/src/phaseHelpers/normalizeStepName.ts', import.meta.url), 'utf8');
const deliverablePreprocessSource = readFileSync(new URL('../../packages/pipelines/asset-pack/src/preprocess.ts', import.meta.url), 'utf8');
const deliverableBringupDemoSource = readFileSync(new URL('../../packages/pipelines/asset-pack/src/__dev__/bringup-demo.ts', import.meta.url), 'utf8');
const deliverableMetricsTestSource = readFileSync(new URL('../../packages/pipelines/asset-pack/src/__tests__/metrics-output.test.ts', import.meta.url), 'utf8');
const deliverableSetupPlanAgentSource = readFileSync(new URL('../../packages/pipelines/asset-pack/src/agents/setup/asset-pack-setup-plan-agent.ts', import.meta.url), 'utf8');
const deliverableCreatePullRequestAgentSource = readFileSync(new URL('../../packages/pipelines/asset-pack/src/agents/finish/asset-pack-finish-create-pull-request-delivery-agent.ts', import.meta.url), 'utf8');
const parsingSource = readFileSync(new URL('../../packages/parsing/src/parsing.ts', import.meta.url), 'utf8');
const assetPackNotificationsTestSource = readFileSync(new URL('../../uapi/tests/api/assetPack.notifications.test.ts', import.meta.url), 'utf8');
const vercelIndexSource = readFileSync(new URL('../../packages/vercel/src/index.ts', import.meta.url), 'utf8');
const vercelReadmeSource = readFileSync(new URL('../../packages/vercel/README.md', import.meta.url), 'utf8');
const genericRepositorySetupPackageSource = readFileSync(new URL('../../packages/generic-tools/repository-setup/package.json', import.meta.url), 'utf8');
const genericRepositorySetupSource = readFileSync(new URL('../../packages/generic-tools/repository-setup/src/index.ts', import.meta.url), 'utf8');
const genericSimpleSystemTextSearchSource = readFileSync(new URL('../../packages/generic-tools/simple-system-text-search/src/index.ts', import.meta.url), 'utf8');
const genericSimpleSystemTextSearchReadmeSource = readFileSync(new URL('../../packages/generic-tools/simple-system-text-search/README.md', import.meta.url), 'utf8');
const genericFilesMaintainingSource = readFileSync(new URL('../../packages/generic-tools/files-maintaining/src/index.ts', import.meta.url), 'utf8');
const gitPackageSource = readFileSync(new URL('../../packages/git/src/index.ts', import.meta.url), 'utf8');
const gitPackageReadmeSource = readFileSync(new URL('../../packages/git/README.md', import.meta.url), 'utf8');
const gitPackageManifestSource = readFileSync(new URL('../../packages/git/package.json', import.meta.url), 'utf8');
const genericGitInteractorSource = readFileSync(new URL('../../packages/generic-tools/git-interactor/src/index.ts', import.meta.url), 'utf8');
const conversationsGenericsAgentSource = readFileSync(new URL('../../packages/conversations-generics/src/agent/ConversationAgent.ts', import.meta.url), 'utf8');
const useConversationStreamSource = readFileSync(new URL('../../uapi/hooks/useConversationStream.ts', import.meta.url), 'utf8');
const lspIndexSource = readFileSync(new URL('../../packages/lsp/src/index.ts', import.meta.url), 'utf8');
const filesSecurityUtilsSource = readFileSync(new URL('../../packages/files/src/securityUtils.ts', import.meta.url), 'utf8');
const genericLlmsGoogleSource = readFileSync(new URL('../../packages/generic-llms/src/providers/google.ts', import.meta.url), 'utf8');
const genericLlmsOpenAiSource = readFileSync(new URL('../../packages/generic-llms/src/providers/openai.ts', import.meta.url), 'utf8');
const genericLlmsAnthropicSource = readFileSync(new URL('../../packages/generic-llms/src/providers/anthropic.ts', import.meta.url), 'utf8');
const genericLlmsRegistryTestSource = readFileSync(new URL('../../packages/generic-llms/tests/unit/registry.test.ts', import.meta.url), 'utf8');
const webSearchOrchestratorSource = readFileSync(new URL('../../packages/web-search/src/orchestrator.ts', import.meta.url), 'utf8');
const executionGenericsReadmeSource = readFileSync(new URL('../../packages/execution-generics/README.md', import.meta.url), 'utf8');
const executionGenericsTldrSource = readFileSync(new URL('../../packages/execution-generics/TLDR.md', import.meta.url), 'utf8');
const pipelineAgentRegistrySource = readFileSync(new URL('../../packages/pipelines-generics/src/execution/PipelineAgentRegistry.ts', import.meta.url), 'utf8');
const pipelineLlmRegistrySource = readFileSync(new URL('../../packages/pipelines-generics/src/execution/PipelineLLMRegistry.ts', import.meta.url), 'utf8');
const pipelineToolRegistrySource = readFileSync(new URL('../../packages/pipelines-generics/src/execution/PipelineToolRegistry.ts', import.meta.url), 'utf8');
const pipelineExecutionDebugSource = readFileSync(new URL('../../packages/pipelines-generics/src/execution/debug.ts', import.meta.url), 'utf8');
const pipelineStreamIntegrationSource = readFileSync(new URL('../../packages/pipelines-generics/src/streaming/pipeline-stream-integration.ts', import.meta.url), 'utf8');
const executionsMcpServerSource = readFileSync(new URL('../../packages/executions-mcp/src/mcp-server/src/server.ts', import.meta.url), 'utf8');
const executionsMcpIndexSource = readFileSync(new URL('../../packages/executions-mcp/src/mcp-server/src/index.ts', import.meta.url), 'utf8');
const executionsMcpShutdownSource = readFileSync(new URL('../../packages/executions-mcp/src/mcp-server/src/shutdown/graceful-shutdown.ts', import.meta.url), 'utf8');
const executionsMcpTypesSource = readFileSync(new URL('../../packages/executions-mcp/src/mcp-server/src/types/index.ts', import.meta.url), 'utf8');
const executionsMcpPipelineToolsSource = readFileSync(new URL('../../packages/executions-mcp/src/mcp-server/src/tools/pipeline-tools.ts', import.meta.url), 'utf8');
const executionsMcpAnalysisToolsSource = readFileSync(new URL('../../packages/executions-mcp/src/mcp-server/src/tools/analysis-tools.ts', import.meta.url), 'utf8');
const executionsMcpMonitoringToolsSource = readFileSync(new URL('../../packages/executions-mcp/src/mcp-server/src/tools/monitoring-tools.ts', import.meta.url), 'utf8');
const executionsMcpEnterpriseToolsSource = readFileSync(new URL('../../packages/executions-mcp/src/mcp-server/src/tools/enterprise-tools.ts', import.meta.url), 'utf8');
const executionsMcpObservabilityToolsSource = readFileSync(new URL('../../packages/executions-mcp/src/mcp-server/src/tools/observability-tools.ts', import.meta.url), 'utf8');
const executionsMcpLspToolsSource = readFileSync(new URL('../../packages/executions-mcp/src/mcp-server/src/tools/lsp-tools.ts', import.meta.url), 'utf8');
const executionsMcpJiraToolsSource = readFileSync(new URL('../../packages/executions-mcp/src/mcp-server/src/tools/jira-tools.ts', import.meta.url), 'utf8');
const executionsMcpAnalysisPromptsSource = readFileSync(new URL('../../packages/executions-mcp/src/mcp-server/src/prompts/analysis-prompts.ts', import.meta.url), 'utf8');
const executionsMcpWorkflowPromptsSource = readFileSync(new URL('../../packages/executions-mcp/src/mcp-server/src/prompts/workflow-prompts.ts', import.meta.url), 'utf8');
const executionsMcpDevelopmentPromptsSource = readFileSync(new URL('../../packages/executions-mcp/src/mcp-server/src/prompts/development-prompts.ts', import.meta.url), 'utf8');
const executionsMcpPipelineResourcesSource = readFileSync(new URL('../../packages/executions-mcp/src/mcp-server/src/resources/pipeline-resources.ts', import.meta.url), 'utf8');
const executionsMcpIntelligenceResourcesSource = readFileSync(new URL('../../packages/executions-mcp/src/mcp-server/src/resources/intelligence-resources.ts', import.meta.url), 'utf8');
const executionsMcpOrganizationResourcesSource = readFileSync(new URL('../../packages/executions-mcp/src/mcp-server/src/resources/organization-resources.ts', import.meta.url), 'utf8');
const executionsMcpTestSetupSource = readFileSync(new URL('../../packages/executions-mcp/src/mcp-server/src/__tests__/setup/mcpTestSetup.ts', import.meta.url), 'utf8');
const executionsMcpGlobalTeardownSource = readFileSync(new URL('../../packages/executions-mcp/src/mcp-server/src/__tests__/setup/mcpGlobalTeardown.ts', import.meta.url), 'utf8');
const executionsMcpSuiteSource = readFileSync(new URL('../../packages/executions-mcp/src/mcp-server/src/__tests__/suites/MCPServerTestSuite.test.ts', import.meta.url), 'utf8');
const executionsMcpReadmeSource = readFileSync(new URL('../../packages/executions-mcp/src/mcp-server/README.md', import.meta.url), 'utf8');
const executionsMcpTestingSource = readFileSync(new URL('../../packages/executions-mcp/src/mcp-server/TESTING.md', import.meta.url), 'utf8');
const executionsMcpArchitectureSource = readFileSync(new URL('../../packages/executions-mcp/src/mcp-server/ARCHITECTURE.md', import.meta.url), 'utf8');
const executionsMcpInternalArchitectureSource = readFileSync(new URL('../../packages/executions-mcp/src/mcp-server/INTERNAL_ARCHITECTURE.md', import.meta.url), 'utf8');
const procurementCoreSource = readFileSync(new URL('../../packages/procurement/src/core.ts', import.meta.url), 'utf8');
const procurementPipelineIntegrationSource = readFileSync(
  new URL('../../packages/procurement/src/pipeline-integration.ts', import.meta.url),
  'utf8',
);
const procurementTypesSource = readFileSync(new URL('../../packages/procurement/src/types.ts', import.meta.url), 'utf8');
const procurementNotificationsSource = readFileSync(new URL('../../packages/procurement/src/notifications.ts', import.meta.url), 'utf8');
const procurementIntegrationExampleSource = readFileSync(
  new URL('../../packages/procurement/src/integration-example.ts', import.meta.url),
  'utf8',
);
const procurementReadmeSource = readFileSync(new URL('../../packages/procurement/README.md', import.meta.url), 'utf8');
const procurementQualityAssessmentSource = readFileSync(new URL('../../packages/procurement/src/quality-assessment.ts', import.meta.url), 'utf8');
const executionsMcpProductionReadinessSource = readFileSync(new URL('../../packages/executions-mcp/src/mcp-server/PRODUCTION_READINESS_ASSESSMENT.md', import.meta.url), 'utf8');
const executionsMcpPublicOverviewSource = readFileSync(new URL('../../packages/executions-mcp/src/mcp-server/docs/public/mcp-overview.md', import.meta.url), 'utf8');
const executionsMcpPublicApiReferenceSource = readFileSync(new URL('../../packages/executions-mcp/src/mcp-server/docs/public/mcp-api-reference.md', import.meta.url), 'utf8');
const executionsMcpSpecGeneratorSource = readFileSync(new URL('../../packages/executions-mcp/src/mcp-server/src/docs/mcp-spec-generator.ts', import.meta.url), 'utf8');
const executionsMcpOpenApiGeneratorSource = readFileSync(new URL('../../packages/executions-mcp/src/mcp-server/src/docs/openapi-generator.ts', import.meta.url), 'utf8');
const executionsMcpKubernetesDeploymentSource = readFileSync(new URL('../../packages/executions-mcp/src/mcp-server/deployment/kubernetes/deployment.yaml', import.meta.url), 'utf8');
const executionsMcpOpenApiSource = readFileSync(new URL('../../packages/executions-mcp/src/mcp-server/docs/openapi/bitcode-mcp-openapi.json', import.meta.url), 'utf8');
const executionsMcpPackageSource = readFileSync(new URL('../../packages/executions-mcp/src/mcp-server/package.json', import.meta.url), 'utf8');
const executionsMcpConfigSource = readFileSync(new URL('../../packages/executions-mcp/src/mcp-server/config/production.json', import.meta.url), 'utf8');
const executionsMcpTestFixturesSource = readFileSync(new URL('../../packages/executions-mcp/src/mcp-server/src/__tests__/fixtures/MCPTestFixtures.ts', import.meta.url), 'utf8');
const executionsMcpToolsTestSuiteSource = readFileSync(new URL('../../packages/executions-mcp/src/mcp-server/src/__tests__/tools/MCPToolsTestSuite.test.ts', import.meta.url), 'utf8');
const supabaseConfigSource = readFileSync(new URL('../../supabase/config.toml', import.meta.url), 'utf8');
const supabaseMagicLinkTemplateSource = readFileSync(new URL('../../supabase/templates/magic_link.html', import.meta.url), 'utf8');
const supabaseConfirmTemplateSource = readFileSync(new URL('../../supabase/templates/confirm.html', import.meta.url), 'utf8');
const supabaseAssetPackStartedTemplateSource = readFileSync(new URL('../../supabase/templates/asset_pack_started.html', import.meta.url), 'utf8');
const supabaseAssetPackCompleteTemplateSource = readFileSync(new URL('../../supabase/templates/asset_pack_complete.html', import.meta.url), 'utf8');
const supabaseAssetPackShortCircuitTemplateSource = readFileSync(new URL('../../supabase/templates/asset_pack_short_circuit.html', import.meta.url), 'utf8');
const supabaseAssetPackFailedTemplateSource = readFileSync(new URL('../../supabase/templates/asset_pack_failed.html', import.meta.url), 'utf8');
const supabaseIndexJsSource = readFileSync(new URL('../../packages/supabase/src/index.js', import.meta.url), 'utf8');
const supabaseStreamsJsSource = readFileSync(new URL('../../packages/supabase/src/streams.js', import.meta.url), 'utf8');
const procurementVectorizeSource = readFileSync(new URL('../../packages/procurement/src/vectorize.ts', import.meta.url), 'utf8');
const securityPackageSource = readFileSync(new URL('../../packages/security/package.json', import.meta.url), 'utf8');
const securityReadmeSource = readFileSync(new URL('../../packages/security/README.md', import.meta.url), 'utf8');
const multimodalUtilsReadmeSource = readFileSync(new URL('../../packages/multimodal-utils/README.md', import.meta.url), 'utf8');
const uniqueTechSource = readFileSync(new URL('../../packages/tech-types/src/uniqueTech.ts', import.meta.url), 'utf8');
const supabaseStreamsSource = readFileSync(new URL('../../packages/supabase/src/streams.ts', import.meta.url), 'utf8');
const docCodeJestConfigSource = readFileSync(new URL('../../packages/doc-code/jest.config.cjs', import.meta.url), 'utf8');
const docCodeBitcodeToolsGenericsMockSource = readFileSync(new URL('../../packages/doc-code/__mocks__/bitcode-tools-generics.ts', import.meta.url), 'utf8');
const genericDocCommentDevelopingPackageSource = readFileSync(new URL('../../packages/generic-doc-comment-plugins/doc-developing/package.json', import.meta.url), 'utf8');
const executionsPersistedStateSource = readFileSync(new URL('../../uapi/app/executions/hooks/usePersistedState.ts', import.meta.url), 'utf8');
const patternRecognitionSource = readFileSync(new URL('../../uapi/hooks/usePatternRecognition.ts', import.meta.url), 'utf8');
const llmGenericsJestConfigSource = readFileSync(new URL('../../packages/llm-generics/jest.config.cjs', import.meta.url), 'utf8');
const llmGenericsTsconfigTestSource = readFileSync(new URL('../../packages/llm-generics/tsconfig.test.json', import.meta.url), 'utf8');
const llmGenericsReadmeSource = readFileSync(new URL('../../packages/llm-generics/README.md', import.meta.url), 'utf8');
const llmGenericsIndexJsSource = readFileSync(new URL('../../packages/llm-generics/src/index.js', import.meta.url), 'utf8');
const llmGenericsBitcodeRegistryMockSource = readFileSync(new URL('../../packages/llm-generics/__mocks__/bitcode-registry.ts', import.meta.url), 'utf8');
const llmGenericsBitcodePromptsMockSource = readFileSync(new URL('../../packages/llm-generics/__mocks__/bitcode-prompts.ts', import.meta.url), 'utf8');
const techTypesIdentifierIndexSource = readFileSync(new URL('../../packages/generic-agents/tech-types-identifier/src/index.ts', import.meta.url), 'utf8');
const techTypesIdentifierReadmeSource = readFileSync(new URL('../../packages/generic-agents/tech-types-identifier/README.md', import.meta.url), 'utf8');
const jestBaseSource = readFileSync(new URL('../../jest.base.cjs', import.meta.url), 'utf8');
const pnpmWorkspaceSource = readFileSync(new URL('../../pnpm-workspace.yaml', import.meta.url), 'utf8');
const accountOrbitalStorySource = readFileSync(new URL('../../uapi/stories/AccountOrbital.stories.tsx', import.meta.url), 'utf8');
const completionCelebrationStorySource = readFileSync(new URL('../../uapi/stories/CompletionCelebration.stories.tsx', import.meta.url), 'utf8');
const readDefinitionInputStorySource = readFileSync(new URL('../../uapi/stories/ReadDefinitionInput.stories.tsx', import.meta.url), 'utf8');
const executionActionsStorySource = readFileSync(new URL('../../uapi/stories/shippables/Actions.stories.tsx', import.meta.url), 'utf8');
const errorRecoveryGraceStorySource = readFileSync(new URL('../../uapi/stories/ErrorRecoveryGrace.stories.tsx', import.meta.url), 'utf8');
const patternMemoryStorySource = readFileSync(new URL('../../uapi/stories/PatternMemory.stories.tsx', import.meta.url), 'utf8');
const pipelinePhasePoetryStorySource = readFileSync(new URL('../../uapi/stories/PipelinePhasePoetry.stories.tsx', import.meta.url), 'utf8');
const conversationsCompleteSystemStorySource = readFileSync(new URL('../../uapi/stories/conversations/CompleteSystem.stories.tsx', import.meta.url), 'utf8');
const btdInvestmentExperienceStorySource = readFileSync(new URL('../../uapi/stories/BTDInvestmentExperience.stories.tsx', import.meta.url), 'utf8');
const marketingBtdInvestmentExperienceSource = readFileSync(new URL('../../uapi/app/(root)/components/MarketingBtdInvestmentExperience.tsx', import.meta.url), 'utf8');
const marketingTestimonialsSource = readFileSync(new URL('../../uapi/app/(root)/components/MarketingTestimonials.tsx', import.meta.url), 'utf8');
const btdPricesSource = [
  readFileSync(new URL('../../uapi/components/base/bitcode/btd/BTDPrices.tsx', import.meta.url), 'utf8'),
  readFileSync(new URL('../../uapi/components/base/bitcode/btd/BTDPrices.js', import.meta.url), 'utf8'),
].join('\n');
const flexibleBtdSelectorSource = [
  readFileSync(new URL('../../uapi/components/base/bitcode/btd/FlexibleBtdSelector.tsx', import.meta.url), 'utf8'),
  readFileSync(new URL('../../uapi/components/base/bitcode/btd/FlexibleBtdSelector.js', import.meta.url), 'utf8'),
].join('\n');
const intelligentProcessingIndicatorStorySource = readFileSync(new URL('../../uapi/stories/IntelligentProcessingIndicator.stories.tsx', import.meta.url), 'utf8');
const userAccountOrbitalStorySource = readFileSync(new URL('../../uapi/stories/user/AccountOrbital.stories.tsx', import.meta.url), 'utf8');
const markdownElementsStorySource = readFileSync(new URL('../../uapi/stories/docs/MarkdownElements.stories.tsx', import.meta.url), 'utf8');
const sourceDividerStorySource = readFileSync(new URL('../../uapi/stories/SourceDivider.stories.tsx', import.meta.url), 'utf8');
const sourceConfigStorySource = readFileSync(new URL('../../uapi/stories/SourceConfig.stories.tsx', import.meta.url), 'utf8');
const conversationDigestPipelineTestSource = readFileSync(new URL('../../uapi/tests/e2e/conversation-digest-pipeline.test.ts', import.meta.url), 'utf8');
const killBugStoryFixtureSource = readFileSync(new URL('../../uapi/tests/e2e/fixtures/stories/killBug.json', import.meta.url), 'utf8');
const pipelineMeasureSmokePath = new URL('../../uapi/tests/pipelineMeasureSmoke.test.ts', import.meta.url);
const btdStepStaticTestSource = readFileSync(new URL('../../uapi/tests/btdStep.static.test.tsx', import.meta.url), 'utf8');
const btdStepInitialFlowTestSource = readFileSync(new URL('../../uapi/tests/btdStep.initialFlow.test.tsx', import.meta.url), 'utf8');
const connectionsStepTestSource = readFileSync(new URL('../../uapi/tests/connectionsStep.test.tsx', import.meta.url), 'utf8');
const modelsStepTestSource = readFileSync(new URL('../../uapi/tests/modelsStep.test.tsx', import.meta.url), 'utf8');
const profileStepTestSource = readFileSync(new URL('../../uapi/tests/profileStep.test.tsx', import.meta.url), 'utf8');
const orbitalsInterfacesPaneTestSource = readFileSync(new URL('../../uapi/tests/orbitalsInterfacesPane.test.tsx', import.meta.url), 'utf8');
const orbitalsBtdPaneTestSource = readFileSync(new URL('../../uapi/tests/orbitalsBTDPane.test.tsx', import.meta.url), 'utf8');
const orbitalsLoginPaneTestSource = readFileSync(new URL('../../uapi/tests/orbitalsLoginPane.test.tsx', import.meta.url), 'utf8');
const orbitalsContentTestSource = readFileSync(new URL('../../uapi/tests/orbitalsContent.test.tsx', import.meta.url), 'utf8');
const orbitalsPaneTabsTestSource = readFileSync(new URL('../../uapi/tests/orbitalsPaneTabs.test.tsx', import.meta.url), 'utf8');
const orbitalsWorkspacePanelsTestSource = readFileSync(new URL('../../uapi/tests/orbitalsWorkspacePanels.test.tsx', import.meta.url), 'utf8');
const orbitalPaneMetaTestSource = readFileSync(new URL('../../uapi/tests/orbitalPaneMeta.test.ts', import.meta.url), 'utf8');
const modelsPaneCatalogRenderTestSource = readFileSync(new URL('../../uapi/tests/modelsPane.catalogRender.test.tsx', import.meta.url), 'utf8');
const authStorySource = readFileSync(new URL('../../uapi/stories/user/Auth.stories.tsx', import.meta.url), 'utf8');
const loginPaneStorySource = readFileSync(new URL('../../uapi/stories/LoginPane.stories.tsx', import.meta.url), 'utf8');
const onboardingPaneStorySource = readFileSync(new URL('../../uapi/stories/OnboardingPane.stories.tsx', import.meta.url), 'utf8');
const onboardingUserStorySource = readFileSync(new URL('../../uapi/stories/user/Onboarding.stories.tsx', import.meta.url), 'utf8');
const orbitalsProfilePaneSource = readFileSync(new URL('../../uapi/app/orbitals/components/OrbitalsProfilePane.tsx', import.meta.url), 'utf8');
const orbitalsConnectsPaneSource = readFileSync(new URL('../../uapi/app/orbitals/components/OrbitalsConnectsPane.tsx', import.meta.url), 'utf8');
const orbitalsInterfacesPaneSource = readFileSync(new URL('../../uapi/app/orbitals/components/OrbitalsInterfacesPane.tsx', import.meta.url), 'utf8');
const orbitalsBtdPaneSource = readFileSync(new URL('../../uapi/app/orbitals/components/OrbitalsBTDPane.tsx', import.meta.url), 'utf8');
const orbitalsOrganizationSettingsSource = readFileSync(
  new URL('../../uapi/app/orbitals/components/organization/OrganizationSettings.tsx', import.meta.url),
  'utf8',
);
const orbitalsModelsPaneSource = readFileSync(new URL('../../uapi/app/orbitals/components/OrbitalsModelsPane.tsx', import.meta.url), 'utf8');
const auxillariesConnectsSource = readFileSync(new URL('../../uapi/app/auxillaries/components/AuxillariesConnects.tsx', import.meta.url), 'utf8');
const auxillariesModelsSource = readFileSync(new URL('../../uapi/app/auxillaries/components/AuxillariesModels.tsx', import.meta.url), 'utf8');
const auxillariesProfileStepSource = readFileSync(new URL('../../uapi/app/auxillaries/components/AuxillariesProfileStep.tsx', import.meta.url), 'utf8');
const externalRealizationRouteTestSource = readFileSync(new URL('../../uapi/tests/api/externalRealizationRoute.test.ts', import.meta.url), 'utf8');
const terminalExternalRuntimeTestSource = readFileSync(new URL('../../uapi/tests/terminalExternalRuntime.test.ts', import.meta.url), 'utf8');
const orbitalsOnboardingRouteTestSource = readFileSync(new URL('../../uapi/tests/orbitalsOnboardingRoute.test.ts', import.meta.url), 'utf8');
const userDataRouteTestSource = readFileSync(new URL('../../uapi/tests/userDataRoute.test.ts', import.meta.url), 'utf8');
const bitcodeScriptSource = readFileSync(new URL('../SCRIPT.md', import.meta.url), 'utf8');
const bitcodeScriptShortSource = readFileSync(new URL('../SCRIPT_SHORT.md', import.meta.url), 'utf8');
const bitcodeDemoSpecV15Source = readFileSync(new URL('../BITCODE_DEMO_SPEC_V15.md', import.meta.url), 'utf8');
const specV6GapAnalysisSource = readFileSync(new URL('../SPEC_V6_GAP_ANALYSIS.md', import.meta.url), 'utf8');
const specV6CoverageMatrixSource = readFileSync(new URL('../SPEC_V6_COVERAGE_MATRIX.md', import.meta.url), 'utf8');
const specV7CoverageMatrixSource = readFileSync(new URL('../SPEC_V7_COVERAGE_MATRIX.md', import.meta.url), 'utf8');
const specV8CoverageMatrixSource = readFileSync(new URL('../SPEC_V8_COVERAGE_MATRIX.md', import.meta.url), 'utf8');
const specV9ImplementationMatrixSource = readFileSync(new URL('../SPEC_V9_IMPLEMENTATION_MATRIX.md', import.meta.url), 'utf8');
const specV10ImplementationMatrixSource = readFileSync(new URL('../SPEC_V10_IMPLEMENTATION_MATRIX.md', import.meta.url), 'utf8');
const specV11ImplementationMatrixSource = readFileSync(new URL('../SPEC_V11_IMPLEMENTATION_MATRIX.md', import.meta.url), 'utf8');
const specV12ImplementationMatrixSource = readFileSync(new URL('../SPEC_V12_IMPLEMENTATION_MATRIX.md', import.meta.url), 'utf8');
const specV13ImplementationMatrixSource = readFileSync(new URL('../SPEC_V13_IMPLEMENTATION_MATRIX.md', import.meta.url), 'utf8');
const specV14ImplementationMatrixSource = readFileSync(new URL('../SPEC_V14_IMPLEMENTATION_MATRIX.md', import.meta.url), 'utf8');
const specV15ImplementationMatrixSource = readFileSync(new URL('../SPEC_V15_IMPLEMENTATION_MATRIX.md', import.meta.url), 'utf8');
const architectureMapSource = readFileSync(new URL('../ARCHITECTURE_MAP.md', import.meta.url), 'utf8');
const docCommentExampleSource = readFileSync(new URL('../../packages/doc-comment/examples/doc-comments-as-prompts.ts', import.meta.url), 'utf8');
const docCommentImplementationSource = readFileSync(new URL('../../packages/doc-comment/IMPLEMENTATION.md', import.meta.url), 'utf8');
const figmaIntegrationSource = readFileSync(new URL('../../packages/figma/INTEGRATION.md', import.meta.url), 'utf8');
const multimodalProcessingPackageSource = readFileSync(new URL('../../packages/generic-tools/multimodal-processing/package.json', import.meta.url), 'utf8');
const multimodalProcessingReadmeSource = readFileSync(new URL('../../packages/generic-tools/multimodal-processing/README.md', import.meta.url), 'utf8');
const systemGrepReadmeSource = readFileSync(new URL('../../packages/system-grep/README.md', import.meta.url), 'utf8');
const marketingSetupFormSource = readFileSync(new URL('../../uapi/app/(root)/components/MarketingSetupForm.tsx', import.meta.url), 'utf8');

test('active root spec family is Bitcode-named and legacy spec family is preserved under _legacy', () => {
  const activeSpecPaths = [
    new URL('../../BITCODE_SPEC.txt', import.meta.url),
    new URL('../../BITCODE_SPECIFYING.md', import.meta.url),
    new URL('../../BITCODE_SPEC_TEMPLATEGUIDE.md', import.meta.url),
    new URL('../../BITCODE_SPEC_V26.md', import.meta.url),
    new URL('../../BITCODE_SPEC_V26_DELTA.md', import.meta.url),
    new URL('../../BITCODE_SPEC_V26_NOTES.md', import.meta.url),
    new URL('../../BITCODE_SPEC_V26_PARITY_MATRIX.md', import.meta.url),
    new URL('../../BITCODE_SPEC_V26_PROVEN.md', import.meta.url)
  ];
  const retiredRootLegacyPaths = [
    new URL('../../ENGI_SPEC.txt', import.meta.url),
    new URL('../../ENGI_SPECIFYING.md', import.meta.url),
    new URL('../../ENGI_SPEC_TEMPLATEGUIDE.md', import.meta.url),
    new URL('../../ENGI_SPEC_V26.md', import.meta.url),
    new URL('../../ENGI_SPEC_V26_DELTA.md', import.meta.url),
    new URL('../../ENGI_SPEC_V26_NOTES.md', import.meta.url),
    new URL('../../ENGI_SPEC_V26_PARITY_MATRIX.md', import.meta.url),
    new URL('../../ENGI_SPEC_V26_PROVEN.md', import.meta.url)
  ];
  const retiredRootHistoricalPaths = [
    new URL('../../ENGI_V10_PREP_MEMO.md', import.meta.url),
    new URL('../../ENGI_V11_PREP_MEMO.md', import.meta.url)
  ];
  const activeHistoricalBitcodePaths = [
    new URL('../../BITCODE_V10_PREP_MEMO.md', import.meta.url),
    new URL('../../BITCODE_V11_PREP_MEMO.md', import.meta.url),
    new URL('../BITCODE_DEMO_SPEC_V15.md', import.meta.url),
    new URL('../BITCODE_DEMO_SPEC_V15_IMPLEMENTATION_MATRIX.md', import.meta.url)
  ];
  const preservedLegacyPaths = [
    new URL('../../_legacy/ENGI_SPEC_V25.md', import.meta.url),
    new URL('../../_legacy/ENGI_SPEC_V25_PROVEN.md', import.meta.url)
  ];

  for (const fileUrl of activeSpecPaths) {
    assert.equal(existsSync(fileUrl), true, `${fileUrl.pathname} should exist in the active Bitcode root family`);
  }
  for (const fileUrl of retiredRootLegacyPaths) {
    assert.equal(existsSync(fileUrl), false, `${fileUrl.pathname} should not remain in the active root family`);
  }
  for (const fileUrl of retiredRootHistoricalPaths) {
    assert.equal(existsSync(fileUrl), false, `${fileUrl.pathname} should not remain as an Engi-named root carrier`);
  }
  for (const fileUrl of activeHistoricalBitcodePaths) {
    assert.equal(existsSync(fileUrl), true, `${fileUrl.pathname} should exist under Bitcode naming`);
  }
  for (const fileUrl of preservedLegacyPaths) {
    assert.equal(existsSync(fileUrl), true, `${fileUrl.pathname} should remain preserved under _legacy`);
  }
  assert.equal(
    existsSync(new URL('../../.engi', import.meta.url)),
    false,
    `${new URL('../../.engi', import.meta.url).pathname} should not remain as an active root artifact namespace`
  );
  assert.equal(
    existsSync(new URL('../../uapi/app/_legacy', import.meta.url)),
    false,
    `${new URL('../../uapi/app/_legacy', import.meta.url).pathname} should not remain as an active terminal subtree`
  );
  assert.equal(
    existsSync(new URL('../../uapi/components/base/bitcode/credits', import.meta.url)),
    false,
    `${new URL('../../uapi/components/base/bitcode/credits', import.meta.url).pathname} should not remain as an active Bitcode UI directory`
  );
  assert.equal(
    existsSync(new URL('../../uapi/components/base/bitcode/btd/btd-tracker.tsx', import.meta.url)),
    true,
    `${new URL('../../uapi/components/base/bitcode/btd/btd-tracker.tsx', import.meta.url).pathname} should exist under canonical BTD naming`
  );
  assert.equal(
    existsSync(new URL('../../uapi/components/base/bitcode/btd/BTDPrices.tsx', import.meta.url)),
    true,
    `${new URL('../../uapi/components/base/bitcode/btd/BTDPrices.tsx', import.meta.url).pathname} should exist under canonical BTD naming`
  );
  assert.equal(
    existsSync(new URL('../../uapi/components/base/bitcode/btd/FlexibleBtdSelector.tsx', import.meta.url)),
    true,
    `${new URL('../../uapi/components/base/bitcode/btd/FlexibleBtdSelector.tsx', import.meta.url).pathname} should exist under canonical BTD naming`
  );
  assert.equal(
    existsSync(new URL('../../uapi/app/orbitals/components/organization/CreditManagement.tsx', import.meta.url)),
    false,
    `${new URL('../../uapi/app/orbitals/components/organization/CreditManagement.tsx', import.meta.url).pathname} should not remain as an active credit-named organization carrier`
  );
  assert.equal(
    existsSync(new URL('../../uapi/app/auxillaries/components/organization/BTDTreasuryManagement.tsx', import.meta.url)),
    true,
    `${new URL('../../uapi/app/auxillaries/components/organization/BTDTreasuryManagement.tsx', import.meta.url).pathname} should exist under canonical BTD treasury naming`
  );
});
const genericVcsReadmeSource = readFileSync(new URL('../../packages/generic-tools/vcs/README.md', import.meta.url), 'utf8');
const genericTaskComprehensionReadmeSource = readFileSync(new URL('../../packages/generic-tools/read-comprehension/README.md', import.meta.url), 'utf8');
const genericLspPurposeSource = readFileSync(new URL('../../packages/generic-tools/lsp-query/src/prompts/lsp-purpose-composition.ts', import.meta.url), 'utf8');
const jiraToolsPackageSource = readFileSync(new URL('../../packages/generic-tools/mcps-tools/jira/package.json', import.meta.url), 'utf8');
const figmaToolsPackageSource = readFileSync(new URL('../../packages/generic-tools/mcps-tools/figma/package.json', import.meta.url), 'utf8');
const testingIndexSource = readFileSync(new URL('../../packages/testing/src/test-drymockfakestub/src/index.ts', import.meta.url), 'utf8');
const testingDryRunAdapterSource = readFileSync(new URL('../../packages/testing/src/test-drymockfakestub/src/adapters/DryRunAdapter.ts', import.meta.url), 'utf8');
const testingMockSystemAdapterSource = readFileSync(new URL('../../packages/testing/src/test-drymockfakestub/src/adapters/MockSystemAdapter.ts', import.meta.url), 'utf8');
const testingReadmeSource = readFileSync(new URL('../../packages/testing/src/test-drymockfakestub/README.md', import.meta.url), 'utf8');
const testingArchitectureSource = readFileSync(new URL('../../packages/testing/src/test-drymockfakestub/ARCHITECTURE.md', import.meta.url), 'utf8');
const testingMigrationGuideSource = readFileSync(new URL('../../packages/testing/src/test-drymockfakestub/MIGRATION_GUIDE.md', import.meta.url), 'utf8');
const testingIntegrationExampleSource = readFileSync(new URL('../../packages/testing/src/test-drymockfakestub/examples/integration.example.ts', import.meta.url), 'utf8');
const testingTsupConfigSource = readFileSync(new URL('../../packages/testing/src/test-drymockfakestub/tsup.config.ts', import.meta.url), 'utf8');
const testingAssetPackScenariosSource = readFileSync(new URL('../../packages/testing/src/test-drymockfakestub/src/scenarios/specific/asset-pack-scenarios.ts', import.meta.url), 'utf8');
const promptQualityIndexSource = readFileSync(new URL('../../packages/testing/src/prompt-quality-framework/index.ts', import.meta.url), 'utf8');
const promptQualityEngineSource = readFileSync(new URL('../../packages/testing/src/prompt-quality-framework/core/PromptQualityEngine.ts', import.meta.url), 'utf8');
const promptQualityConfigSource = readFileSync(new URL('../../packages/testing/src/prompt-quality-framework/config/FrameworkConfig.ts', import.meta.url), 'utf8');
const promptQualityReadmeSource = readFileSync(new URL('../../packages/testing/src/prompt-quality-framework/README.md', import.meta.url), 'utf8');
const timeReadmeSource = readFileSync(new URL('../../packages/time/README.md', import.meta.url), 'utf8');
const techTypesReadmeSource = readFileSync(new URL('../../packages/tech-types/README.md', import.meta.url), 'utf8');
const streamsReadmeSource = readFileSync(new URL('../../packages/streams/README.md', import.meta.url), 'utf8');
const toolsGenericsToolSource = readFileSync(new URL('../../packages/tools-generics/src/Tool.ts', import.meta.url), 'utf8');
const toolsGenericsDocCodeToolIndexSource = readFileSync(
  new URL('../../packages/tools-generics/src/doc-code-tool/index.ts', import.meta.url),
  'utf8',
);

test('active V26 runtime and package tests no longer admit the make-engi-branch compatibility route', () => {
  assert.equal(
    existsSync(new URL('../../uapi/app/api/make-engi-branch/route.ts', import.meta.url)),
    false,
  );
  assert.equal(
    existsSync(new URL('../../uapi/app/api/make-engi-branch', import.meta.url)),
    false,
  );
  assert.doesNotMatch(serverSource, /\/api\/make-engi-branch/);
  assert.doesNotMatch(serverSource, /ENGI_DEMO_DATA_PATH/);
  assert.doesNotMatch(serverSource, /ENGI_DEMO_PUBLIC_DIR/);
  assert.doesNotMatch(apiTestSource, /\/api\/make-engi-branch/);
  assert.doesNotMatch(workflowTestSource, /\/api\/make-engi-branch/);
});

test('active V26 auth and AssetPack email templates use Bitcode naming', () => {
  assert.match(supabaseConfigSource, /Your Bitcode magic link/);
  assert.match(supabaseConfigSource, /Confirm your Bitcode account/);
  assert.match(supabaseMagicLinkTemplateSource, /Sign in to Bitcode/);
  assert.match(supabaseConfirmTemplateSource, /activate your Bitcode account/);
  assert.match(supabaseConfirmTemplateSource, /Connect GitHub and wallet posture/);
  assert.match(supabaseConfirmTemplateSource, /Review wallet and \$BTD readiness/);
  assert.match(supabaseAssetPackCompleteTemplateSource, /Open in Bitcode/);
  assert.match(supabaseAssetPackCompleteTemplateSource, /BitcodeURL/);
  assert.match(supabaseAssetPackStartedTemplateSource, /Estimated measured \$BTD/);
  assert.match(supabaseAssetPackCompleteTemplateSource, /Measured \$BTD/);
  assert.match(supabaseAssetPackShortCircuitTemplateSource, /BTC fee hold released/);
  assert.match(supabaseAssetPackFailedTemplateSource, /BTC fee hold released/);
  assert.match(procurementVectorizeSource, /global Bitcode dataset/);
  assert.doesNotMatch(supabaseConfigSource, /Your Engi magic link/);
  assert.doesNotMatch(supabaseConfigSource, /Confirm your Engi account/);
  assert.doesNotMatch(supabaseMagicLinkTemplateSource, /Sign in to Engi/);
  assert.doesNotMatch(supabaseConfirmTemplateSource, /activate your Engi account/);
  assert.doesNotMatch(supabaseConfirmTemplateSource, /Engi Software Agents/);
  assert.doesNotMatch(supabaseConfirmTemplateSource, /Buy Credits/);
  assert.doesNotMatch(supabaseAssetPackCompleteTemplateSource, /inside Engi/);
  assert.doesNotMatch(supabaseAssetPackCompleteTemplateSource, /EngiURL/);
  assert.doesNotMatch(supabaseAssetPackStartedTemplateSource, /Credits:/);
  assert.doesNotMatch(supabaseAssetPackCompleteTemplateSource, /Credits:/);
  assert.doesNotMatch(supabaseAssetPackShortCircuitTemplateSource, /credits were returned to your balance/);
  assert.doesNotMatch(supabaseAssetPackFailedTemplateSource, /credits were returned to your balance/);
  assert.doesNotMatch(procurementVectorizeSource, /global Engi dataset/);
});

test('active V26 shared surface primitives use Bitcode naming instead of Engi naming', () => {
  assert.match(sonnerSource, /\bBitcodeStatusIcon\b/);
  assert.match(sonnerSource, /\bBitcodePhaseIcon\b/);
  assert.doesNotMatch(sonnerSource, /\bEngiStatusIcon\b/);
  assert.doesNotMatch(sonnerSource, /\bEngiPhaseIcon\b/);

  assert.match(footerSource, /bitcode-software-svg-logo/);
  assert.match(footerSource, /engineeredsoftware\/bitcode\/blob\/main\/BITCODE_SPEC\.txt/);
  assert.match(publicDocsPageContentSource, /engineeredsoftware\/bitcode\/blob\/main\/BITCODE_SPEC\.txt/);
  assert.match(uapiPackageSource, /"name": "bitcode-uapi"/);
  assert.equal(existsSync(uapiPackageLockPath), false);
  assert.equal(existsSync(uapiPnpmLockPath), false);
  assert.doesNotMatch(footerSource, /engi-software-svg-logo/);
  assert.doesNotMatch(footerSource, /engineeredsoftware\/ENGI\/blob\/main\/ENGI_SPEC\.txt/);
  assert.doesNotMatch(publicDocsPageContentSource, /engineeredsoftware\/ENGI\/blob\/main\/ENGI_SPEC\.txt/);
  assert.doesNotMatch(uapiPackageSource, /"name": "engi-uapi"/);
  assert.doesNotMatch(uapiPackageSource, /@stripe\/react-stripe-js/);
  assert.doesNotMatch(uapiPackageSource, /@stripe\/stripe-js/);
  assert.doesNotMatch(uapiPackageSource, /"stripe":/);
  assert.match(footerSource, /bitcode-text/);
  assert.match(footerAnimationsSource, /\.bitcode-text/);
  assert.match(footerAnimationsSource, /\.bitcode-text-glow/);
  assert.match(fillGapsSource, /bitcode-text/);
  assert.match(fillGapsSource, /bitcode-text-glow/);
  assert.match(fillGapsSource, /github\.com\/engineeredsoftware\/bitcode/);
  assert.match(fillGapsSource, /Bitcode on GitHub/);
  assert.match(featureFlagsSource, /window\.__BITCODE_FLAGS/);
  assert.match(heroClientSource, /window\.__bitcodeRevealScreenshotsFired/);
  assert.match(marketingScreenshotSectionSource, /window\.__bitcodeRevealScreenshotsFired/);
  assert.match(conversationsStylesSource, /@keyframes bitcode-bubble-entry/);
  assert.match(conversationsStylesSource, /animation: bitcode-typing 1s infinite ease-in-out/);
  assert.match(conversationsStylesSource, /@keyframes bitcode-shimmer/);
  assert.match(conversationsStylesSource, /@keyframes bitcode-orb-glow/);
  assert.match(orbitalStylesSource, /\.system-prompt-section/);
  assert.match(orbitalStylesSource, /\.prompt-header/);
  assert.match(orbitalStylesSource, /\.bitcode-cost/);
  assert.match(footerSource, /Bitcode on GitHub/);
  assert.match(footerSource, /github\.com\/engineeredsoftware\/bitcode/);
  assert.match(footerTestSource, /Bitcode on GitHub/);
  assert.match(footerTestSource, /github\.com\/engineeredsoftware\/bitcode/);
  assert.doesNotMatch(footerSource, /engi-text/);
  assert.doesNotMatch(footerAnimationsSource, /\.engi-text/);
  assert.doesNotMatch(footerAnimationsSource, /\.engi-text-glow/);
  assert.doesNotMatch(fillGapsSource, /engi-text/);
  assert.doesNotMatch(fillGapsSource, /engi-text-glow/);
  assert.doesNotMatch(fillGapsSource, /x\.com\/engisoftware/);
  assert.doesNotMatch(fillGapsSource, /Bitcode on X/);
  assert.doesNotMatch(featureFlagsSource, /window\.__ENGI_FLAGS/);
  assert.doesNotMatch(heroClientSource, /window\.__engiRevealScreenshotsFired/);
  assert.doesNotMatch(marketingScreenshotSectionSource, /window\.__engiRevealScreenshotsFired/);
  assert.doesNotMatch(conversationsStylesSource, /engi-bubble-entry/);
  assert.doesNotMatch(conversationsStylesSource, /engi-typing/);
  assert.doesNotMatch(conversationsStylesSource, /engi-shimmer/);
  assert.doesNotMatch(conversationsStylesSource, /engi-orb-glow/);
  assert.doesNotMatch(orbitalStylesSource, /engi-system-prompt-section/);
  assert.doesNotMatch(orbitalStylesSource, /engi-prompt-header/);
  assert.doesNotMatch(orbitalStylesSource, /engi-cost/);
  assert.doesNotMatch(footerSource, /Bitcode on Bluesky/);
  assert.doesNotMatch(footerSource, /engicomms\.bsky\.social/);
  assert.doesNotMatch(footerTestSource, /Bitcode on Bluesky/);
  assert.doesNotMatch(footerTestSource, /engicomms\.bsky\.social/);
  assert.match(webhookRouteSource, /bitcode-deliver-issue/);
  assert.match(webhookRouteSource, /bitcode-deliver-pr/);
  assert.match(webhookRouteSource, /bitcode-pr/);
  assert.match(webhookRouteSource, /@bitcode-pr/);
  assert.match(webhookRouteSource, /@bitcode-review/);
  assert.match(webhookRouteSource, /@bitcode-commit/);
  assert.match(webhookVerifySource, /verifyGitHubSignature/);
  assert.match(webhookRouteTestSource, /bitcode-deliver-issue/);
  assert.match(webhookRouteTestSource, /bitcode-deliver-pr/);
  assert.match(webhookRouteTestSource, /bitcode-pr/);
  assert.match(webhookRouteTestSource, /@bitcode-pr/);
  assert.match(webhookRouteTestSource, /@bitcode-review/);
  assert.match(webhookRouteTestSource, /@bitcode-commit/);
  assert.doesNotMatch(webhookRouteSource, /engi-deliver-/);
  assert.doesNotMatch(webhookRouteSource, /@engi-/);
  assert.doesNotMatch(webhookRouteTestSource, /engi-deliver-/);
  assert.doesNotMatch(webhookRouteTestSource, /@engi-/);
  assert.match(mockingIndexSource, /\bBitcodeMockConfig\b/);
  assert.match(mockingIndexSource, /window\.__bitcodeMockSystem/);
  assert.match(mockingIndexSource, /Bitcode Mock System/);
  assert.match(mockingIndexSource, /mockAreas\.auxillaries/);
  assert.match(mockingReadmeSource, /Bitcode Mock System/);
  assert.match(mockingReadmeSource, /__bitcodeMockSystem/);
  assert.match(mockingReadmeSource, /User Auxillaries/);
  assert.match(mockingReadmeSource, /BTC settlement/);
  assert.match(mockingIntegrationGuideSource, /Bitcode routes and experiences/);
  assert.match(mockingIntegrationGuideSource, /__bitcodeMockSystem/);
  assert.match(mockingQuickStartDemoSource, /showcasing Bitcode capabilities/);
  assert.match(mockingQuickStartDemoSource, /__bitcodeMockSystem/);
  assert.match(mockingSummarySource, /BITCODE MOCK SYSTEM/);
  assert.match(mockingSummarySource, /BTC_SETTLEMENTS/);
  assert.match(mockingValidateSystemSource, /Starting Bitcode Mock System Validation/);
  assert.match(mockingScriptsPackageSource, /bitcode-mock-setup/);
  assert.match(mockingScriptsReadmeSource, /Bitcode Mock System Scripts/);
  assert.match(mockingSetupScriptSource, /Bitcode Mock System Setup/);
  assert.match(mockingSetupScriptSource, /mocking\/QUICK_START_/);
  assert.match(mockingValidateScriptSource, /Bitcode Mock System Validation/);
  assert.match(mockingValidateScriptSource, /mocking\/index\.ts/);
  assert.match(mockProviderSource, /__bitcodeMockProvider/);
  assert.match(mockOrchestratorSource, /Bitcode mock system/);
  assert.match(mockDataGeneratorsSource, /for Bitcode/);
  assert.match(comprehensiveMockDataGeneratorsSource, /bitcode-labs\/auth-service/);
  assert.match(comprehensiveMockDataGeneratorsSource, /Bitcode Labs/);
  assert.match(comprehensiveMockDataGeneratorsSource, /developer@bitcode\.dev/);
  assert.match(comprehensiveMockDataGeneratorsSource, /marketplace\.bitcode\.ai\/previews\/react-perf-1\.png/);
  assert.match(comprehensiveMockDataGeneratorsSource, /BTC_SETTLEMENTS/);
  assert.match(comprehensiveMockDataGeneratorsSource, /wallet_observer/);
  assert.match(comprehensiveMockDataGeneratorsSource, /Complete system coverage \(User Auxillaries, Conversations, AssetPacks, Organizations, etc\.\)/);
  assert.match(mockingSummarySource, /User Auxillaries/);
  assert.match(specializedMockMiddlewareSource, /User Auxillaries/);
  assert.match(specializedMockMiddlewareSource, /auxillaries:\s*\{\s*auth: mockAuth,\s*user: mockUser,\s*onboarding: mockOnboarding\s*\}/);
  assert.match(specializedMockMiddlewareSource, /BTC \/ \$BTD TREASURY MIDDLEWARE/);
  assert.match(specializedMockMiddlewareSource, /feature: 'BTC_SETTLEMENTS'/);
  assert.match(mockingTypesSource, /Bitcode system/);
  assert.doesNotMatch(mockingIndexSource, /\bEngiMockConfig\b/);
  assert.doesNotMatch(mockingIndexSource, /window\.__engiMockSystem/);
  assert.doesNotMatch(mockingReadmeSource, /\bEngi\b/);
  assert.doesNotMatch(mockingReadmeSource, /User Orbital/);
  assert.doesNotMatch(mockingReadmeSource, /\bStripe\b/);
  assert.doesNotMatch(mockingIntegrationGuideSource, /\bEngi\b/);
  assert.doesNotMatch(mockingQuickStartDemoSource, /\bEngi\b/);
  assert.doesNotMatch(mockingSummarySource, /\bEngi\b/);
  assert.doesNotMatch(mockingSummarySource, /User Orbital/);
  assert.doesNotMatch(mockingSummarySource, /STRIPE_CHECKOUT/);
  assert.doesNotMatch(mockingSummarySource, /CREDIT_PURCHASES/);
  assert.doesNotMatch(mockingScriptsPackageSource, /engi-mock-/);
  assert.doesNotMatch(mockingScriptsReadmeSource, /\bEngi\b/);
  assert.doesNotMatch(mockingSetupScriptSource, /\bEngi\b/);
  assert.doesNotMatch(mockingValidateScriptSource, /\bEngi\b/);
  assert.doesNotMatch(mockingReadmeSource, /app\/mocking/);
  assert.doesNotMatch(mockingScriptsReadmeSource, /app\/mocking/);
  assert.doesNotMatch(mockingSetupScriptSource, /app\/mocking/);
  assert.doesNotMatch(mockingValidateScriptSource, /app\/mocking/);
  assert.doesNotMatch(mockProviderSource, /__engiMockProvider/);
  assert.doesNotMatch(mockOrchestratorSource, /Engi's/);
  assert.doesNotMatch(mockDataGeneratorsSource, /for Engi/);
  assert.doesNotMatch(comprehensiveMockDataGeneratorsSource, /engi-corp/);
  assert.doesNotMatch(comprehensiveMockDataGeneratorsSource, /Engi Technologies/);
  assert.doesNotMatch(comprehensiveMockDataGeneratorsSource, /Engi Corporation/);
  assert.doesNotMatch(comprehensiveMockDataGeneratorsSource, /@engi\.com/);
  assert.doesNotMatch(comprehensiveMockDataGeneratorsSource, /marketplace\.engi\.com/);
  assert.doesNotMatch(comprehensiveMockDataGeneratorsSource, /STRIPE_CHECKOUT/);
  assert.doesNotMatch(comprehensiveMockDataGeneratorsSource, /CREDIT_PURCHASES/);
  assert.doesNotMatch(comprehensiveMockDataGeneratorsSource, /\bstripe\b/);
  assert.doesNotMatch(specializedMockMiddlewareSource, /User Orbital/);
  assert.doesNotMatch(specializedMockMiddlewareSource, /STRIPE_CHECKOUT/);
  assert.doesNotMatch(specializedMockMiddlewareSource, /CREDIT_PURCHASES/);
  assert.doesNotMatch(mockingTypesSource, /Engi system/);
  assert.doesNotMatch(mockingTypesSource, /STRIPE_CHECKOUT/);
  assert.doesNotMatch(mockingTypesSource, /CREDIT_PURCHASES/);
  assert.match(landingTestSource, /bitcode-pill/);
  assert.match(landingTestSource, /bitcode-software-svg-logo/);
  assert.match(footerTestSource, /bitcode-software-svg-logo/);
  assert.doesNotMatch(landingTestSource, /\bEngiPill\b/);
  assert.doesNotMatch(landingTestSource, /\bEngiSoftwareSvgLogo\b/);
  assert.doesNotMatch(footerTestSource, /\bEngiSoftwareSvgLogo\b/);
  assert.equal(existsSync(marketingMultiAgentShowcasePath), false);
  assert.match(marketingFeaturesGridSource, /measurement-evidence/);
  assert.match(marketingFeaturesGridSource, /Read Measurement Evidence/);
  assert.match(marketingFeaturesGridSource, /reviewable Read/);
  assert.match(marketingFeaturesGridSource, /bitcode@feature:~\//);
  assert.match(marketingFeaturesGridSource, /bitcode\.feature\.load/);
  assert.match(marketingComputeSectionSource, /s3:\/\/bitcode-runs\/42GPU\/checkout\//);
  assert.match(marketingMarketplaceSectionSource, /Amount of Bitcode `?\$BTD`? involved in this listing/);
  assert.match(marketingMarketplaceSectionSource, /settling \$BTD/);
  assert.match(marketingFaqSectionSource, /coins', 'tokens', and '\$BTD'/);
  assert.match(marketingSmsPhonePreviewSource, /45 \$BTD/);
  assert.doesNotMatch(marketingFeaturesGridSource, /multi-agent/);
  assert.doesNotMatch(marketingFeaturesGridSource, /Multi-Agent/);
  assert.doesNotMatch(marketingFeaturesGridSource, /engi@feature:~\//);
  assert.doesNotMatch(marketingFeaturesGridSource, /engi\.feature\.load/);
  assert.doesNotMatch(marketingComputeSectionSource, /s3:\/\/engi-runs\/42GPU\/checkout\//);
  assert.doesNotMatch(marketingMarketplaceSectionSource, /Amount of Engi credits involved in this listing/);
  assert.doesNotMatch(marketingMarketplaceSectionSource, /spending credits to acquire/);
  assert.doesNotMatch(marketingFaqSectionSource, /coins', 'tokens', and 'credits'/);
  assert.doesNotMatch(marketingSmsPhonePreviewSource, /45 credits/);
  assert.match(marketingCompetitorTableSectionSource, /\bBitcodeAdvantageCard\b/);
  assert.match(marketingCompetitorTableSectionSource, /\bBITCODE_CRUSH_COPY\b/);
  assert.match(marketingCompetitorTableSectionSource, /marketing-bitcode-row-glow/);
  assert.match(marketingCompetitorTableSectionSource, /marketing-bitcode-logo-cell/);
  assert.match(marketingCompetitorTableSectionSource, /marketing-bitcode-icon-glow/);
  assert.match(marketingCompetitorTableSectionSource, /marketing-bitcode-no-icon-glow/);
  assert.match(marketingCompetitorTableSectionSource, /excluding Bitcode/);
  assert.match(marketingCompetitorTableStylesSource, /@keyframes bitcodeRowGlow/);
  assert.match(marketingCompetitorTableStylesSource, /\.marketing-bitcode-row-glow/);
  assert.match(marketingCompetitorTableStylesSource, /\.marketing-bitcode-logo-cell/);
  assert.match(marketingCompetitorTableStylesSource, /\.marketing-bitcode-icon-glow/);
  assert.match(marketingCompetitorTableStylesSource, /\.marketing-bitcode-no-icon-glow/);
  assert.doesNotMatch(marketingCompetitorTableSectionSource, /\bEngiCrushCard\b/);
  assert.doesNotMatch(marketingCompetitorTableSectionSource, /\bENGI_CRUSH_COPY\b/);
  assert.doesNotMatch(marketingCompetitorTableSectionSource, /marketing-engi-row-glow/);
  assert.doesNotMatch(marketingCompetitorTableSectionSource, /marketing-engi-logo-cell/);
  assert.doesNotMatch(marketingCompetitorTableSectionSource, /marketing-engi-icon-glow/);
  assert.doesNotMatch(marketingCompetitorTableSectionSource, /marketing-engi-no-icon-glow/);
  assert.doesNotMatch(marketingCompetitorTableSectionSource, /excluding Engi/);
  assert.doesNotMatch(marketingCompetitorTableStylesSource, /@keyframes engiRowGlow/);
  assert.doesNotMatch(marketingCompetitorTableStylesSource, /\.marketing-engi-row-glow/);
  assert.doesNotMatch(marketingCompetitorTableStylesSource, /\.marketing-engi-logo-cell/);
  assert.doesNotMatch(marketingCompetitorTableStylesSource, /\.marketing-engi-icon-glow/);
  assert.doesNotMatch(marketingCompetitorTableStylesSource, /\.marketing-engi-no-icon-glow/);
});

test('active V26 external realization bindings use bitcode identifiers instead of engi identifiers', () => {
  assert.doesNotMatch(externalRealizationSource, /:\/\/engi\//);
  assert.doesNotMatch(externalRealizationSource, /mock:[^'\n]*:engi\b/);
  assert.doesNotMatch(externalRealizationSource, /\bengi-runner\b/);
  assert.doesNotMatch(externalRealizationSource, /bucket:\/\/engi-/);
  assert.match(externalRealizationSource, /:\/\/bitcode\//);
  assert.match(externalRealizationSource, /mock:bitcoin-mainchain:bitcode/);
  assert.match(externalRealizationSource, /mock:sidechain:bitcode/);
});

test('active V26 canon posture and preserved runtime state use bitcode policy and environment identifiers', () => {
  assert.match(bitcodeRuntimeSource, /from '\.\/bitcode-demo\.js'/);
  assert.doesNotMatch(bitcodeRuntimeSource, /engi-demo\.js/);
  assert.doesNotMatch(bitcodeRuntimeSource, /\brunMakeEngiBranch\b/);
  assert.match(provenGeneratorSource, /from '\.\.\/bitcode-demo\.js'/);
  assert.match(v18MatricesSource, /from '\.\.\/bitcode-demo\.js'/);
  assert.doesNotMatch(provenGeneratorSource, /engi-demo\.js/);
  assert.doesNotMatch(v18MatricesSource, /engi-demo\.js/);
  assert.doesNotMatch(provenGeneratorSource, /\brunMakeEngiBranch\b/);
  assert.doesNotMatch(v18MatricesSource, /\brunMakeEngiBranch\b/);
  assert.match(assetPackSystemReflectionSource, /Bitcode AssetPack system reflection/);
  assert.match(assetPackSystemReflectionSource, /written assets primary and delivery mechanisms secondary/);
  assert.doesNotMatch(assetPackSystemReflectionSource, /Engi Deliverables Pipeline AI System|deliverables_system/u);
  assert.match(executionsPageClientSource, /bitcode-mcp-configs/);
  assert.match(executionsToggleButtonsSource, /execution-option-toggle/);
  assert.match(executionOptionToggleSource, /ExecutionOptionToggle/);
  assert.match(executionToggleButtonsSource, /computer-use-measurement/);
  assert.match(executionToggleButtonsSource, /fit-review/);
  assert.equal(existsSync(multiPipelinePackagePath), false);
  assert.equal(existsSync(preprocessTogglePath), false);
  assert.match(deliverableToolsIndexSource, /BITCODE_ENABLE_COMPUTER_USE_READ_MEASUREMENT/);
  assert.match(deliverableToolsIndexSource, /read-measurement:computer-use-evidence-agent/);
  assert.doesNotMatch(deliverableToolsIndexSource, /implementation-correct-code-change-agent': \[bitcodeReadMeasurementComputerUseTool\]/);
  assert.doesNotMatch(deliverableToolsIndexSource, /finish:deliver-asset-pack-to-destination-agent': \[bitcodeReadMeasurementComputerUseTool/);
  assert.doesNotMatch(deliverableToolsIndexSource, /shipping:deliverable-pipeline|SHIPPING_PHASE_TOOLS/);
  assert.doesNotMatch(uapiFeatureFlagsSource, /ENABLE_COMPUTE_TOGGLE/);
  assert.doesNotMatch(uapiFeatureFlagsSource, /ENABLE_MULTI_AGENT_TOGGLE/);
  assert.doesNotMatch(executionsPageClientSource, /computeEnabled/);
  assert.doesNotMatch(executionsPageClientSource, /multiAgentEnabled/);
  assert.doesNotMatch(executionsPageClientSource, /PreprocessToggle/);
  assert.match(evidenceDocumentTemplatesSource, /bitcode-mcp-configs/);
  assert.doesNotMatch(executionsPageClientSource, /engi-mcp-configs/);
  assert.doesNotMatch(evidenceDocumentTemplatesSource, /engi-mcp-configs/);
  assert.doesNotMatch(auxillariesProviderSource, /open-orbitals/);
  assert.doesNotMatch(auxillariesProviderSource, /close-orbitals/);
  assert.doesNotMatch(auxillariesProviderSource, /open-orbital/);
  assert.doesNotMatch(auxillariesProviderSource, /close-orbital/);
  assert.match(auxillariesProviderSource, /auxillaries-portal/);
  assert.match(auxillariesProviderSource, /auxillaries-open/);
  assert.doesNotMatch(auxillariesProviderSource, /orbital-portal/);
  assert.doesNotMatch(auxillariesProviderSource, /orbital-open/);
  assert.match(auxillariesSurfaceSource, /function AuxillariesSurface/);
  assert.match(auxillariesSurfaceSource, /auxillaries-close-button/);
  assert.match(auxillariesSurfaceSource, /auxillaries-toggle-button/);
  assert.doesNotMatch(auxillariesSurfaceSource, /orbital-close-button/);
  assert.doesNotMatch(auxillariesSurfaceSource, /orbital-toggle-button/);
  assert.match(auxillariesContentSource, /function AuxillariesContent/);
  assert.match(auxillariesContentSource, /auxillaries-label-active/);
  assert.doesNotMatch(auxillariesContentSource, /orbital-label-active/);
  assert.match(auxillariesLoginPaneSource, /function AuxillariesLoginPane/);
  assert.match(auxillariesProfilePaneSource, /function AuxillariesProfilePane/);
  assert.match(auxillariesConnectsPaneSource, /function AuxillariesConnectsPane/);
  assert.match(auxillariesInterfacesPaneSource, /function AuxillariesInterfacesPane/);
  assert.match(auxillariesBtdPaneSource, /function AuxillariesBTDPane/);
  assert.match(orbitalsConnectsEmailSource, /orbitals-connects-bitcode-email/);
  assert.match(pipelineToastsSource, /Bitcode phase tinting/);
  assert.match(pipelineExecutionLogSource, /Custom Bitcode log icons/);
  assert.doesNotMatch(auxillariesSurfaceSource, /export \{ default \} from '@\/app\/orbitals\/components'/);
  assert.match(auxillariesSurfaceSource, /import\("\.\/AuxillariesProfilePane"\)/);
  assert.match(auxillariesSurfaceSource, /import\("\.\/AuxillariesConnectsPane"\)/);
  assert.match(auxillariesSurfaceSource, /import\("\.\/AuxillariesInterfacesPane"\)/);
  assert.match(auxillariesSurfaceSource, /import\("\.\/AuxillariesBTDPane"\)/);
  assert.doesNotMatch(auxillariesSurfaceSource, /@\/app\/orbitals\/components\/OrbitalsProfilePane/);
  assert.doesNotMatch(auxillariesSurfaceSource, /@\/app\/orbitals\/components\/OrbitalsConnectsPane/);
  assert.doesNotMatch(auxillariesSurfaceSource, /@\/app\/orbitals\/components\/OrbitalsInterfacesPane/);
  assert.doesNotMatch(auxillariesSurfaceSource, /@\/app\/orbitals\/components\/OrbitalsBTDPane/);
  assert.doesNotMatch(auxillariesContentSource, /export \{ default \} from '@\/app\/orbitals\/components\/OrbitalsContent'/);
  assert.doesNotMatch(auxillariesLoginPaneSource, /export \{ default \} from '@\/app\/orbitals\/components\/OrbitalsLoginPane'/);
  assert.doesNotMatch(auxillariesProfilePaneSource, /@\/app\/orbitals\/components\/OrbitalsProfilePane/);
  assert.doesNotMatch(auxillariesConnectsPaneSource, /@\/app\/orbitals\/components\/OrbitalsConnectsPane/);
  assert.doesNotMatch(auxillariesInterfacesPaneSource, /@\/app\/orbitals\/components\/OrbitalsInterfacesPane/);
  assert.doesNotMatch(auxillariesBtdPaneSource, /@\/app\/orbitals\/components\/OrbitalsBTDPane/);
  assert.match(auxillariesProfilePaneSource, /@\/app\/auxillaries\/components\/headers\/AuxillariesProfilePaneHeader/);
  assert.match(agenticExecutionSource, /agentic-execution:asset-pack/);
  assert.match(agenticExecutionSource, /agentic-execution:read-measurement/);
  assert.match(agenticExecutionSource, /resolveAgenticExecutionQueryTypes/);
  assert.doesNotMatch(agenticExecutionSource, /pipeline:deliverables/);
  assert.match(agenticExecutionSource, /AssetPack execution/);
  assert.match(agenticExecutionSource, /read measurement execution/);
  assert.match(terminalPageSource, /Bitcode Terminal/);
  assert.match(terminalPageClientSource, /Bitcode Terminal/);
  assert.match(conversationsRouteClientSource, /Bitcode Terminal write path/);
  assert.match(conversationsRouteClientSource, /Bitcode activity ledger/);
  assert.match(
    conversationsRouteClientSource,
    /rich\s+inputs, source attachments, output destinations, and agentic execution updates/,
  );
  assert.doesNotMatch(conversationsRouteClientSource, /Step back into transactions/);
  assert.match(conversationsReadmeSource, /return flow back into the Bitcode activity ledger/);
  assert.match(conversationsReadmeSource, /source attachments, asset-pack references, and output destinations/);
  assert.match(conversationsOverlaySource, /Rich write input with source attachments and output destinations/);
  assert.match(conversationsOverlaySource, /agentic execution events/);
  assert.match(conversationsEnhancedRichTextInputSource, /asset packs, attachments, source connects, and output destinations/);
  assert.match(conversationsEnhancedRichTextInputSource, /Shippable/);
  assert.match(conversationsEnhancedRichTextInputSource, /Output destination/);
  assert.match(conversationsListSource, /execution run/);
  assert.match(conversationsSidebarLogsSource, /execution/);
  assert.match(conversationSharedSource, /agentic-execution:asset-pack/);
  assert.match(conversationSharedSource, /agentic-execution:read-measurement/);
  assert.match(conversationSharedSource, /Mock Bitcode agentic execution/);
  assert.match(conversationSharedSource, /source attachments, asset packs, output destinations, and settlement-bound proofs/);
  assert.match(terminalWorkspaceExplainersSource, /Bitcode Terminal experience map/);
  assert.match(terminalWorkspaceExplainersSource, /Bitcode Terminal activity map/);
  assert.doesNotMatch(terminalWorkspaceExplainersSource, /Transactions experience map/);
  assert.match(terminalPageClientSource, /buildTerminalExecutionHistoryRequest/);
  assert.match(terminalPageClientSource, /mapExecutionHistoryRunToWorkspaceRun/);
  assert.match(terminalPageClientSource, /\/api\/executions\/history/);
  assert.doesNotMatch(terminalPageClientSource, /deriveClosureFocus/);
  assert.doesNotMatch(terminalPageClientSource, /deriveProofStatus/);
  assert.doesNotMatch(terminalPageClientSource, /deriveTransactionLens/);
  assert.match(terminalTransactionsSource, /buildAgenticExecutionSummary/);
  assert.match(terminalTransactionsSource, /typeLabel/);
  assert.match(terminalRunDataSource, /agentic-execution:asset-pack/);
  assert.match(terminalRunDataSource, /agentic-execution:read-measurement/);
  assert.match(terminalRunDataSource, /agentic-execution:proof-refresh/);
  assert.match(terminalRunDataSource, /Bitcode Terminal/);
  assert.match(terminalPageSource, /read measurement, asset packs, settlements/);
  assert.match(terminalPageClientSource, /activity into asset packs, proofs, and history/);
  assert.match(terminalWorkspaceCopySource, /Bitcode Terminal/);
  assert.match(terminalWorkspaceCopySource, /asset-pack posture/);
  assert.match(terminalWorkspaceCopySource, /asset pack, proofs, and history/);
  assert.match(terminalTransactionActivitySurfaceSource, /Bitcode Terminal/);
  assert.match(terminalTransactionActivitySurfaceSource, /selected Bitcode activity/);
  assert.match(terminalTransactionDetailSurfaceSource, /selected Bitcode activity/);
  assert.match(terminalTransactionDetailSurfaceSource, /Shippables attached to this activity/);
  assert.match(terminalTransactionDetailHeroSource, /Bitcode Terminal activity detail/);
  assert.match(terminalTransactionIdentityCardSource, /Selected activity/);
  assert.match(terminalTransactionIdentityCardSource, /Activity payload/);
  assert.match(terminalTransactionClosureCardSource, /selected Bitcode activity/);
  assert.match(terminalTransactionProofsCardSource, /Bounded proof stays in activity detail/);
  assert.match(terminalTransactionHistoryCardSource, /Recent activity history stays inline/);
  assert.match(terminalTransactionDetailActionBarSource, /Shippables/);
  assert.match(terminalTransactionDetailActionBarSource, /selected Bitcode activity/);
  assert.match(terminalClosureControlDeckSource, /active Bitcode activity detail/);
  assert.match(terminalTransactionWorkspaceSource, /Master-detail activity, asset packs, proofs, and history/);
  assert.match(terminalTransactionWorkspaceSource, /select Bitcode activity, inspect its asset packs/);
  assert.match(terminalDepositReadWorkbenchSource, /read measurement/);
  assert.match(terminalDepositReadWorkbenchSource, /Asset-pack fit and settlement intent/);
  assert.match(terminalReadScenarioPanelSource, /Choose the active read measurement/);
  assert.match(terminalReadScenarioPanelSource, /asset-pack fit, proof, or settlement posture/);
  assert.match(terminalClosureNativeSectionsSource, /Read review, verification, asset pack, settlement, and ledger/);
  assert.match(terminalExperienceArchitectureSource, /label: 'Bitcode Terminal'/);
  assert.match(terminalExperienceArchitectureSource, /Bitcode activity ledger/);
  assert.match(terminalExperienceArchitectureSource, /current Bitcode activity context/);
  assert.match(terminalExperienceArchitectureSource, /label: 'Shippables'/);
  assert.match(terminalWorkspaceExplainersSource, /selected activity/);
  assert.match(terminalWorkspaceExplainersSource, /current Bitcode activity chain/);
  assert.match(terminalWorkspaceExplainersSource, /asset packs or settlement/);
  assert.match(terminalExperienceFrameSource, /activity ledger \+ selected detail/);
  assert.match(terminalExperienceFrameSource, /asset packs, and history stay connected/);
  assert.match(terminalWorkspaceRailSource, /Activity id/);
  assert.match(terminalWorkspaceRailSource, /selected Bitcode activity is now loaded/);
  assert.match(terminalMockTransactionDetailsSource, /Mock activity detail/);
  assert.match(terminalCommandPresentationSource, /current Bitcode activity/);
  assert.match(terminalFlowGuideSource, /selected Bitcode activity context/);
  assert.match(terminalFlowGuideSource, /asset-pack, and history follow-through/);
  assert.match(terminalReadmeSource, /activity ledger as the master surface/);
  assert.match(terminalReadmeSource, /selected activity detail as the detail surface/);
  assert.match(bitcodeTransactionsTableSource, /Rich Bitcode activity ledger/);
  assert.match(bitcodeTransactionsActiveFiltersSource, /Bitcode activity window/);
  assert.match(bitcodeTransactionsOverviewSource, /activity active/);
  assert.match(executionReadmeSource, /selected-activity detail/);
  assert.match(bitcodePublicCopySource, /Open Bitcode Terminal/);
  assert.match(bitcodePublicCopySource, /Bitcode Terminal/);
  assert.doesNotMatch(bitcodePublicCopySource, /Open transactions/);
  assert.match(bitcodePublicExplainersSource, /title: 'Terminal'/);
  assert.doesNotMatch(bitcodePublicExplainersSource, /title: 'Transactions'/);
  assert.match(executionsPageClientSource, /agentic-execution:asset-pack/);
  assert.match(executionsPageClientSource, /Open Bitcode Terminal/);
  assert.doesNotMatch(executionsPageClientSource, /Open transactions/);
  assert.match(auxillariesConnectsPaneSource, /@\/app\/auxillaries\/components\/headers\/AuxillariesConnectsPaneHeader/);
  assert.match(auxillariesConnectsPaneSource, /read measurement, asset-pack synthesis, and settlement follow-through/);
  assert.match(auxillariesInterfacesPaneSource, /@\/app\/auxillaries\/components\/headers\/AuxillariesInterfacesPaneHeader/);
  assert.match(auxillariesBtdPaneSource, /@\/app\/auxillaries\/components\/headers\/AuxillariesBTDPaneHeader/);
  assert.match(auxillaryPaneMetaSource, /Bitcode Terminal/);
  assert.match(auxillaryPaneMetaSource, /read measurement, asset-pack synthesis, settlement follow-through/);
  assert.match(auxillariesConnectsPaneHeaderSource, /measure read, synthesize asset packs, and settle against live repositories/);
  assert.match(auxillariesProfilePaneSource, /@\/app\/auxillaries\/components\/shared\/AfterOnboardingOverlay/);
  assert.match(auxillariesInterfacesPaneSource, /@\/app\/auxillaries\/components\/shared\/AuxillariesPreferenceCards/);
  assert.match(auxillariesInterfacesPaneSource, /@\/app\/auxillaries\/components\/shared\/AuxillariesStatGrid/);
  assert.match(auxillariesInterfacesPaneSource, /@\/app\/auxillaries\/components\/shared\/AuxillariesWorkspaceSection/);
  assert.match(auxillariesInterfacesPaneSource, /@\/app\/auxillaries\/components\/models\/GlobalModelSelection/);
  assert.match(auxillariesInterfacesPaneSource, /@\/app\/auxillaries\/components\/models\/SystemPromptSection/);
  assert.match(auxillariesInterfacesPaneSource, /@\/app\/auxillaries\/components\/auxillary-pane-explainers/);
  assert.match(auxillariesBtdPaneSource, /@\/app\/auxillaries\/components\/AuxillariesDataSharingPanel/);
  assert.match(auxillariesBtdPaneSource, /@\/app\/auxillaries\/components\/shared\/AuxillariesPreferenceCards/);
  assert.match(auxillariesBtdPaneSource, /@\/app\/auxillaries\/components\/shared\/AuxillariesStatGrid/);
  assert.match(auxillariesBtdPaneSource, /@\/app\/auxillaries\/components\/shared\/AuxillariesWorkspaceSection/);
  assert.match(auxillariesBtdPaneSource, /@\/app\/auxillaries\/components\/auxillary-pane-explainers/);
  assert.doesNotMatch(auxillariesProfilePaneSource, /@\/app\/orbitals\/components\/headers\/OrbitalsProfileOrbitalHeader/);
  assert.doesNotMatch(auxillariesConnectsPaneSource, /@\/app\/orbitals\/components\/headers\/OrbitalsConnectsOrbitalHeader/);
  assert.doesNotMatch(auxillariesInterfacesPaneSource, /@\/app\/orbitals\/components\/headers\/OrbitalsInterfacesOrbitalHeader/);
  assert.doesNotMatch(auxillariesBtdPaneSource, /@\/app\/orbitals\/components\/headers\/OrbitalsBTDOrbitalHeader/);
  assert.doesNotMatch(auxillariesProfilePaneSource, /@\/app\/orbitals\/components\/shared\/after-onboarding-overlay/);
  assert.doesNotMatch(auxillariesInterfacesPaneSource, /@\/app\/orbitals\/components\/shared\/OrbitalsPreferenceCards/);
  assert.doesNotMatch(auxillariesInterfacesPaneSource, /@\/app\/orbitals\/components\/shared\/OrbitalsStatGrid/);
  assert.doesNotMatch(auxillariesInterfacesPaneSource, /@\/app\/orbitals\/components\/shared\/OrbitalsWorkspaceSection/);
  assert.doesNotMatch(auxillariesInterfacesPaneSource, /@\/app\/orbitals\/components\/models\/GlobalModelSelection/);
  assert.doesNotMatch(auxillariesInterfacesPaneSource, /@\/app\/orbitals\/components\/models\/SystemPromptSection/);
  assert.doesNotMatch(auxillariesInterfacesPaneSource, /orbitalsPaneExplainers/);
  assert.doesNotMatch(auxillariesBtdPaneSource, /@\/app\/orbitals\/components\/OrbitalsDataSharingPanel/);
  assert.doesNotMatch(auxillariesBtdPaneSource, /@\/app\/orbitals\/components\/shared\/OrbitalsPreferenceCards/);
  assert.doesNotMatch(auxillariesBtdPaneSource, /@\/app\/orbitals\/components\/shared\/OrbitalsStatGrid/);
  assert.doesNotMatch(auxillariesBtdPaneSource, /@\/app\/orbitals\/components\/shared\/OrbitalsWorkspaceSection/);
  assert.doesNotMatch(auxillariesBtdPaneSource, /orbitalsPaneExplainers/);
  assert.match(auxillariesProfilePaneHeaderSource, /function AuxillariesProfilePaneHeader/);
  assert.match(auxillariesConnectsPaneHeaderSource, /function AuxillariesConnectsPaneHeader/);
  assert.match(auxillariesInterfacesPaneHeaderSource, /function AuxillariesInterfacesPaneHeader/);
  assert.match(auxillariesBtdPaneHeaderSource, /function AuxillariesBTDPaneHeader/);
  assert.match(auxillariesPaneTitleSource, /Auxillary step/);
  assert.match(auxillariesOnboardingInfoBoxSource, /Auxillary step/);
  assert.match(auxillariesAfterOnboardingOverlaySource, /auxillary panes/);
  assert.match(auxillariesPreferenceCardsSource, /function AuxillariesPreferenceCards/);
  assert.match(auxillariesStatGridSource, /function AuxillariesStatGrid/);
  assert.match(auxillariesWorkspaceSectionSource, /function AuxillariesWorkspaceSection/);
  assert.match(auxillariesGlobalModelSelectionSource, /function GlobalModelSelection/);
  assert.match(auxillariesSystemPromptSectionSource, /function SystemPromptSection/);
  assert.match(auxillariesDataSharingPanelSource, /function AuxillariesDataSharingPanel/);
  assert.match(auxillaryPaneExplainersSource, /auxillaryPaneExplainers/);
  assert.match(auxillariesProfilePaneStylesSource, /\.data-share-list/);
  assert.match(auxillaryOnboardingContractSource, /@bitcode\/api\/src\/routes\/auxillaries-contract/);
  assert.match(auxillaryOnboardingContractSource, /buildAuxillaryOnboardingPayload/);
  assert.match(auxillaryOnboardingContractSource, /buildAuxillaryDataPayload/);
  assert.match(auxillaryOnboardingContractSource, /AuxillaryOnboardingPayload/);
  assert.match(auxillaryOnboardingContractSource, /AuxillaryDataPayload/);
  assert.match(v22CanonDriftTestSource, /scripts\/check-bitcode-canon-posture-drift\.mjs/);
  assert.match(v22CanonDriftTestSource, /scripts\/prepare-bitcode-spec-family-promotion\.mjs/);
  assert.match(v22CanonDriftTestSource, /scripts\/prepare-bitcode-runtime-canon-promotion\.mjs/);
  assert.match(v22CanonDriftTestSource, /scripts\/promote-bitcode-canon\.mjs/);
  assert.match(v22CanonDriftTestSource, /path\.join\(fixtureRoot, 'protocol-demonstration', 'src', 'canon-posture\.js'\)/);
  assert.match(v22CanonDriftTestSource, /path\.join\(fixtureRoot, 'protocol-demonstration', 'README\.md'\)/);
  assert.match(v22CanonDriftTestSource, /_legacy\/ENGI_SPEC_V23\.md/);
  assert.match(v22CanonDriftTestSource, /_legacy\/ENGI_SPEC_V24\.md/);
  assert.match(v22CanonDriftTestSource, /_legacy\/ENGI_SPEC_V25\.md/);
  assert.doesNotMatch(v22CanonDriftTestSource, /check-engi-canon-posture-drift/);
  assert.doesNotMatch(v22CanonDriftTestSource, /prepare-engi-spec-family-promotion/);
  assert.doesNotMatch(v22CanonDriftTestSource, /prepare-engi-runtime-canon-promotion/);
  assert.doesNotMatch(v22CanonDriftTestSource, /promote-engi-canon/);
  assert.doesNotMatch(v22CanonDriftTestSource, /path\.join\(fixtureRoot, 'engi-demo'/);
  assert.doesNotMatch(orbitalsConnectsEmailSource, /orbitals-connects-engi-email/);
  assert.doesNotMatch(pipelineToastsSource, /Engi phase tinting/);
  assert.doesNotMatch(pipelineExecutionLogSource, /award-winning Engi icons/);
  assert.match(orbitalsSurfaceSource, /export \{ default \} from '@\/app\/auxillaries\/components\/AuxillariesSurface'/);
  assert.match(orbitalsContentSource, /export \{ default \} from '@\/app\/auxillaries\/components\/AuxillariesContent'/);
  assert.match(orbitalsLoginPaneSource, /export \{ default \} from '@\/app\/auxillaries\/components\/AuxillariesLoginPane'/);
  assert.match(orbitalsOrbitalHeaderSource, /AuxillariesPaneHeader as OrbitalsOrbitalHeader/);
  assert.match(orbitalsProfileOrbitalHeaderSource, /AuxillariesProfilePaneHeader/);
  assert.match(orbitalsConnectsOrbitalHeaderSource, /AuxillariesConnectsPaneHeader/);
  assert.match(orbitalsInterfacesOrbitalHeaderSource, /AuxillariesInterfacesPaneHeader/);
  assert.match(orbitalsBtdOrbitalHeaderSource, /AuxillariesBTDPaneHeader/);
  assert.match(orbitalsPaneTitleSource, /@\/app\/auxillaries\/components\/shared\/PaneTitle/);
  assert.match(orbitalsOnboardingInfoBoxSource, /@\/app\/auxillaries\/components\/shared\/OnboardingInfoBox/);
  assert.match(orbitalsAfterOnboardingOverlaySource, /@\/app\/auxillaries\/components\/shared\/AfterOnboardingOverlay/);
  assert.match(orbitalsPreferenceCardsSource, /@\/app\/auxillaries\/components\/shared\/AuxillariesPreferenceCards/);
  assert.match(orbitalsStatGridSource, /@\/app\/auxillaries\/components\/shared\/AuxillariesStatGrid/);
  assert.match(orbitalsWorkspaceSectionSource, /@\/app\/auxillaries\/components\/shared\/AuxillariesWorkspaceSection/);
  assert.match(orbitalsGlobalModelSelectionSource, /@\/app\/auxillaries\/components\/models\/GlobalModelSelection/);
  assert.match(orbitalsSystemPromptSectionSource, /@\/app\/auxillaries\/components\/models\/SystemPromptSection/);
  assert.match(orbitalsDataSharingPanelSource, /@\/app\/auxillaries\/components\/AuxillariesDataSharingPanel/);
  assert.match(orbitalsPaneExplainersSource, /auxillaryPaneExplainers as orbitalsPaneExplainers/);
  assert.doesNotMatch(auxillaryOnboardingContractSource, /"models","credits"/);
  assert.doesNotMatch(auxillaryOnboardingContractSource, /\? 'credits'/);
  assert.doesNotMatch(userDataContextSource, /\bcredits:\s*number/);
  assert.doesNotMatch(useUserDataSource, /credits_cached/);
  assert.doesNotMatch(useUserDataSource, /credits:\s*btdBalance/);
  assert.equal(existsSync(checkoutCallbackClientPath), false);
  assert.equal(existsSync(checkoutCallbackPagePath), false);
  assert.equal(existsSync(new URL('../../uapi/app/checkout/callback/head.tsx', import.meta.url)), false);
  assert.equal(existsSync(createCheckoutSessionRoutePath), false);
  assert.equal(existsSync(fulfillCheckoutSessionRoutePath), false);
  assert.doesNotMatch(heroClientSource, /successful_checkout_session_id/);
  assert.match(btdTrackerSource, /\/terminal\?intent=acquire-btd/);
  assert.match(btdTrackerSource, /BTC pays fees/);
  assert.match(btdTrackerSource, /non-fungible asset-pack share\/read-right/);
  assert.doesNotMatch(btdTrackerSource, /create-checkout-session/);
  assert.doesNotMatch(btdTrackerSource, /\bStripe\b/);
  assert.doesNotMatch(btdTrackerSource, /Buy More/);
  assert.match(marketingPricingSectionSource, /Opening BTD acquisition/);
  assert.match(marketingPricingSectionSource, /\/terminal\?intent=acquire-btd/);
  assert.match(marketingPricingSectionSource, /BTC pays fees/);
  assert.doesNotMatch(marketingPricingSectionSource, /create-checkout-session/);
  assert.doesNotMatch(marketingPricingSectionSource, /\bStripe\b/);
  assert.match(marketingSetupFormSource, /BTC pays fees\./);
  assert.doesNotMatch(marketingSetupFormSource, /\/auxillaries\/btd/);
  assert.match(marketingSetupFormSource, /\/auxillaries\/connects/);
  assert.doesNotMatch(marketingSetupFormSource, /PaymentElement/);
  assert.doesNotMatch(marketingSetupFormSource, /\bStripe\b/);
  assert.doesNotMatch(btdPlansSource, /stripeProductId/);
  assert.match(useUserDataSource, /hasWalletConnection/);
  assert.match(auxillariesConnectsPaneSource, /GitHub plus a connected wallet are the minimum live prerequisites/);
  assert.match(auxillariesConnectsPaneSource, /settlement requires both a live GitHub connection here and a wallet binding in Profile/);
  assert.equal(existsSync(orbitalHelperPath), false);
  assert.equal(existsSync(orbitalConnectionsFlowsSpecPath), false);
  assert.equal(existsSync(orbitalProfileSpecPath), false);
  assert.equal(existsSync(orbitalModelsFlowsSpecPath), false);
  assert.equal(existsSync(orbitalNavigationSpecPath), false);
  assert.equal(existsSync(orbitalCreditsFlowsSpecPath), false);
  assert.equal(existsSync(orbitalCreditsIntervalSpecPath), false);
  assert.equal(existsSync(orbitalCreditsChartNoDataSpecPath), false);
  assert.equal(existsSync(accountCreditsVisualSpecPath), false);
  assert.equal(existsSync(auxillariesConnectionsFlowsSpecPath), true);
  assert.equal(existsSync(auxillariesProfileSpecPath), true);
  assert.equal(existsSync(auxillariesInterfacesFlowsSpecPath), true);
  assert.equal(existsSync(auxillariesNavigationSpecPath), true);
  assert.equal(existsSync(auxillariesBtdFlowsSpecPath), true);
  assert.equal(existsSync(auxillariesBtdIntervalSpecPath), true);
  assert.equal(existsSync(auxillariesBtdChartNoDataSpecPath), true);
  assert.equal(existsSync(accountBtdVisualSpecPath), true);
  assert.match(auxillariesHelperSource, /'profile'\|'connects'\|'interfaces'\|'btd'/);
  assert.match(auxillariesBtdFlowsSpecSource, /Auxillaries - \$BTD Step/);
  assert.match(onboardingVisualSpecSource, /onboarding-connects-step\.png/);
  assert.match(onboardingVisualSpecSource, /onboarding-interfaces-step\.png/);
  assert.match(onboardingVisualSpecSource, /onboarding-btd-step\.png/);
  assert.match(onboardingVisualSpecSource, /auxillaries-label-connects/);
  assert.match(onboardingVisualSpecSource, /auxillaries-label-interfaces/);
  assert.match(onboardingVisualSpecSource, /auxillaries-label-btd/);
  assert.doesNotMatch(onboardingVisualSpecSource, /onboarding-credits-step\.png/);
  assert.doesNotMatch(onboardingVisualSpecSource, /orbital-label-connects/);
  assert.doesNotMatch(onboardingVisualSpecSource, /orbital-label-interfaces/);
  assert.doesNotMatch(onboardingVisualSpecSource, /orbital-label-btd/);
  assert.doesNotMatch(onboardingVisualSpecSource, /orbital-label-connections/);
  assert.doesNotMatch(onboardingVisualSpecSource, /orbital-label-models/);
  assert.doesNotMatch(onboardingVisualSpecSource, /orbital-label-credits/);
  assert.match(onboardingFullFlowSpecSource, /onboarding-full-btd\.png/);
  assert.doesNotMatch(onboardingFullFlowSpecSource, /onboarding-full-credits\.png/);
  assert.match(auxillariesBtdTreasuryManagementSource, /Bitcode does not use prepaid spend bundles or Stripe checkout/);
  assert.match(auxillariesBtdTreasuryManagementSource, /GitHub required before transacting/);
  assert.match(auxillariesBtdTreasuryManagementSource, /Open \$BTD Auxillary/);
  assert.doesNotMatch(auxillariesBtdTreasuryManagementSource, /\/api\/organizations\/\$\{organizationId\}\/credits/);
  assert.doesNotMatch(auxillariesBtdTreasuryManagementSource, /Purchase Credits/);
  assert.match(auxillariesOrganizationSettingsSource, /Bitcode does not use Stripe or prepaid checkout units/);
  assert.match(auxillariesOrganizationSettingsSource, /Open Connects Auxillary/);
  assert.match(auxillariesOrganizationSettingsSource, /GitHub before transacting/);
  assert.doesNotMatch(auxillariesOrganizationSettingsSource, /paymentMethod:\s*'stripe'/);
  assert.doesNotMatch(auxillariesOrganizationSettingsSource, /Purchase Credits/);
  assert.match(orbitalsOrganizationSettingsSource, /auxillaries\/components\/organization\/OrganizationSettings/);
  assert.doesNotMatch(orbitalsOrganizationSettingsSource, /paymentMethod:\s*'stripe'/);
  assert.match(lowBtdReminderRouteSource, /low-btd-reminder/);
  assert.match(lowBtdReminderRouteSource, /low_btd_reminder/);
  assert.match(outOfBtdRouteSource, /out-of-btd/);
  assert.match(outOfBtdRouteSource, /out_of_btd/);
  assert.match(btdTransferRouteSource, /btd-transfer/);
  assert.match(btdTransferRouteSource, /btd_transfer/);
  assert.doesNotMatch(apiClientSource, /\/api\/notifications\/credit-transfer/);
  assert.doesNotMatch(apiClientSource, /\/api\/notifications\/low-credits-reminder/);
  assert.doesNotMatch(apiClientSource, /\/api\/notifications\/out-of-credits/);
  assert.match(apiClientSource, /\/api\/notifications\/btd-transfer/);
  assert.match(apiClientSource, /\/api\/notifications\/low-btd-reminder/);
  assert.match(apiClientSource, /\/api\/notifications\/out-of-btd/);
  assert.doesNotMatch(nextConfigSource, /source:\s*'\/orbitals\/credits'/);
  assert.doesNotMatch(securityHeadersSource, /\/api\/credits/);

  assert.match(canonPostureSource, /policy:\/\/bitcode\//);
  assert.match(canonPostureSource, /const CURRENT_PROJECT_LABEL = 'Bitcode'/);
  assert.match(canonPostureSource, /const CURRENT_SPEC_FAMILY_PREFIX = 'BITCODE_SPEC'/);
  assert.match(canonPostureSource, /ACTIVE_PROVEN_APPENDIX_PATH = `\$\{CURRENT_SPEC_FAMILY_PREFIX\}_\$\{ACTIVE_CANON_VERSION\}_PROVEN\.md`/);
  assert.match(canonPostureSource, /DRAFT_SPEC_PATH = `\$\{CURRENT_SPEC_FAMILY_PREFIX\}_\$\{DRAFT_TARGET_VERSION\}\.md`/);
  assert.match(canonPostureSource, /DRAFT_DELTA_PATH = `\$\{CURRENT_SPEC_FAMILY_PREFIX\}_\$\{DRAFT_TARGET_VERSION\}_DELTA\.md`/);
  assert.match(canonPostureSource, /DRAFT_PARITY_PATH = `\$\{CURRENT_SPEC_FAMILY_PREFIX\}_\$\{DRAFT_TARGET_VERSION\}_PARITY_MATRIX\.md`/);
  assert.doesNotMatch(canonPostureSource, /policy:\/\/engi\//);
  assert.doesNotMatch(canonPostureSource, /ENGI_SPEC/);
  assert.doesNotMatch(canonPostureSource, /ACTIVE_PROVEN_APPENDIX_PATH = `ENGI_SPEC_/);
  assert.doesNotMatch(canonPostureSource, /DRAFT_SPEC_PATH = `ENGI_SPEC_/);
  assert.doesNotMatch(canonPostureSource, /DRAFT_DELTA_PATH = `ENGI_SPEC_/);
  assert.doesNotMatch(canonPostureSource, /DRAFT_PARITY_PATH = `ENGI_SPEC_/);
  assert.match(externalRealizationSource, /BITCODE_V24_ENVIRONMENT_MODE/);
  assert.match(externalRealizationSource, /BITCODE_V24_GITHUB_APP_REF/);
  assert.match(externalRealizationSource, /BITCODE_V24_ENABLE_LOCAL_EXECUTORS/);
  assert.match(v24RemoteAdaptersSource, /BITCODE_V24_GITHUB_APP_JWT_ISSUER/);
  assert.match(v24LocalExecutorsSource, /bitcode-local:\/\//);
  assert.match(v24LocalExecutorsSource, /bitcode-v24-demo/);
  assert.match(v24RemoteAdaptersSource, /BITCODE_V24_GITHUB_APP_PRIVATE_KEY_PEM/);
  assert.match(v24RemoteAdaptersSource, /BITCODE_V24_GITHUB_BEARER_TOKEN/);
  assert.match(v24RemoteAdaptersSource, /BITCODE_V24_REPEATED_READ_BEARER_TOKEN/);
  assert.match(v24RemoteAdaptersSource, /BITCODE_V24_COMPUTE_BEARER_TOKEN/);
  assert.match(v24RemoteAdaptersSource, /BITCODE_V24_STORAGE_BEARER_TOKEN/);
  assert.match(v24RemoteAdaptersSource, /BITCODE_V24_BITCOIN_MAINCHAIN_RPC_PASSWORD/);
  assert.match(v24RemoteAdaptersSource, /bitcode-review\/v24/);
  assert.match(v24RemoteAdaptersSource, /bitcode-demo-run/);
  assert.match(v24RemoteAdaptersSource, /lnbcrt1bitcode/);
  assert.match(readMeasurementSource, /BITCODE_READ\.md/);
  assert.match(runArtifactsSource, /BITCODE_READ\.md/);
  assert.match(apiTestSource, /BITCODE_V24_ENVIRONMENT_MODE/);
  assert.match(apiTestSource, /bitcode-local:\/\/github-live-interface/);
  assert.match(apiTestSource, /github-app:\/\/bitcode\/development/);
  assert.match(apiTestSource, /github-installation:\/\/bitcode\/development/);
  assert.match(apiTestSource, /tx:testnet4:bitcode:001/);
  assert.match(apiTestSource, /lnbcrt1bitcode-live-read-001/);
  assert.match(workflowTestSource, /BITCODE_READ\.md/);
  assert.doesNotMatch(externalRealizationSource, /ENGI_V24_ENVIRONMENT_MODE/);
  assert.doesNotMatch(externalRealizationSource, /ENGI_V24_GITHUB_APP_REF/);
  assert.doesNotMatch(externalRealizationSource, /ENGI_V24_ENABLE_LOCAL_EXECUTORS/);
  assert.doesNotMatch(v24LocalExecutorsSource, /engi-local:\/\//);
  assert.doesNotMatch(v24LocalExecutorsSource, /engi-v24-demo/);
  assert.doesNotMatch(v24RemoteAdaptersSource, /ENGI_V24_/);
  assert.doesNotMatch(v24RemoteAdaptersSource, /engi-v24-github-app/);
  assert.doesNotMatch(v24RemoteAdaptersSource, /engi-review\/v24/);
  assert.doesNotMatch(v24RemoteAdaptersSource, /engi-demo-run/);
  assert.doesNotMatch(v24RemoteAdaptersSource, /lnbcrt1engi/);
  assert.doesNotMatch(readMeasurementSource, /ENGI_READ\.md/);
  assert.doesNotMatch(runArtifactsSource, /ENGI_READ\.md/);
  assert.doesNotMatch(apiTestSource, /ENGI_V24_/);
  assert.doesNotMatch(apiTestSource, /engi-local:\/\//);
  assert.doesNotMatch(apiTestSource, /github-app:\/\/engi\/development/);
  assert.doesNotMatch(apiTestSource, /github-installation:\/\/engi\/development/);
  assert.doesNotMatch(apiTestSource, /tx:testnet4:engi:001/);
  assert.doesNotMatch(apiTestSource, /lnbcrt1engi-live-read-001/);
  assert.doesNotMatch(workflowTestSource, /ENGI_READ\.md/);
  assert.match(bitcodeDemoSource, /bitcode-system:read-measurement/);
  assert.match(bitcodeDemoSource, /bitcode-system:branch-materializer/);
  assert.match(bitcodeDemoSource, /bitcode-system:settlement-engine/);
  assert.match(bitcodeDemoSource, /bitcode-system:proof-publisher/);
  assert.match(bitcodeDemoSource, /bitcode-asset-intake-attestation\.v11/);
  assert.match(bitcodeDemoSource, /policy-release-bitcode-v11-demo-2026-04-03/);
  assert.match(bitcodeDemoSource, /BITCODE_READ\.md/);
  assert.match(bitcodeDemoSource, /'bitcode-system-principal'/);
  assert.equal(existsSync(new URL('../src/engi-core.js', import.meta.url)), false);
  assert.equal(existsSync(new URL('../src/bitcode-core.js', import.meta.url)), true);
  assert.match(bitcodeCoreSource, /bitcode\.makeAssetCommitment/);
  assert.match(bitcodeCoreSource, /bitcode\.rankChunksForQuery/);
  assert.match(bitcodeCoreSource, /bitcode\.buildBundleIssuance/);
  assert.match(bitcodeCoreSource, /bitcode\.allocateUnits/);
  assert.match(bitcodeCoreSource, /bitcode\.utilityReceipt/);
  assert.match(receiptSchemasSource, /https:\/\/bitcode\.ai\/receipt\/deposit\/v1/);
  assert.match(receiptSchemasSource, /https:\/\/bitcode\.ai\/receipt\/bundle-issuance\/v1/);
  assert.match(receiptSchemasSource, /https:\/\/bitcode\.ai\/receipt\/allocation\/v1/);
  assert.match(receiptSchemasSource, /https:\/\/bitcode\.ai\/receipt\/utility\/v1/);
  assert.match(v20QualityFixtureSource, /bitcode\.proven-generator\.v1/);
  assert.match(contractChangeLedgerTestSource, /scripts\/promote-bitcode-canon\.mjs/);
  assert.match(contractChangeLedgerTestSource, /npm --prefix protocol-demonstration run test:deterministic-replay/);
  assert.match(contractChangeLedgerTestSource, /npm --prefix protocol-demonstration run test:negative-mutation-matrix/);
  assert.match(contractChangeLedgerTestSource, /generate-bitcode-proven/);
  assert.match(e2eTestSource, /protocol-demonstration-e2e-/);
  assert.match(bitcodeDemoSource, /bitcode\/remediation-/);
  assert.match(e2eTestSource, /Created bitcode\/remediation-/);
  assert.doesNotMatch(bitcodeDemoSource, /engi-system:/);
  assert.doesNotMatch(bitcodeDemoSource, /engi-asset-intake-attestation\.v11/);
  assert.doesNotMatch(bitcodeDemoSource, /policy-release-engi-v11-demo-2026-04-03/);
  assert.doesNotMatch(bitcodeDemoSource, /ENGI_READ\.md/);
  assert.doesNotMatch(bitcodeDemoSource, /'engi-system-principal'/);
  assert.doesNotMatch(bitcodeDemoSource, /engi\/remediation-/);
  assert.doesNotMatch(bitcodeCoreSource, /engi\.makeAssetCommitment/);
  assert.doesNotMatch(bitcodeCoreSource, /engi\.rankChunksForQuery/);
  assert.doesNotMatch(bitcodeCoreSource, /engi\.buildBundleIssuance/);
  assert.doesNotMatch(bitcodeCoreSource, /engi\.allocateUnits/);
  assert.doesNotMatch(bitcodeCoreSource, /engi\.utilityReceipt/);
  assert.doesNotMatch(receiptSchemasSource, /https:\/\/engi\.software\/receipt\//);
  assert.doesNotMatch(v20QualityFixtureSource, /engi-demo\.proven-generator\.v1/);
  assert.doesNotMatch(contractChangeLedgerTestSource, /scripts\/promote-engi-canon\.mjs/);
  assert.doesNotMatch(contractChangeLedgerTestSource, /npm --prefix engi-demo run test:deterministic-replay/);
  assert.doesNotMatch(contractChangeLedgerTestSource, /npm --prefix engi-demo run test:negative-mutation-matrix/);
  assert.doesNotMatch(contractChangeLedgerTestSource, /generate-engi-proven/);
  assert.doesNotMatch(e2eTestSource, /engi-demo-e2e-/);
  assert.doesNotMatch(e2eTestSource, /Created engi\/remediation-/);
  assert.match(attestationModelSource, /bitcode-demo-image/);
  assert.match(attestationModelSource, /bitcode-policy-release-v1/);
  assert.match(attestationModelSource, /bitcode-demo-verifier/);
  assert.match(attestationModelSource, /workspace\/bitcode/);
  assert.match(policyReleaseSource, /bitcode-policy-v0\.2/);
  assert.match(seedSource, /bitcode-internal/);
  assert.match(seedSource, /bitcode\.initialState/);
  assert.match(v20QualitySource, /bitcode-demo\.v20-quality-runner\.v1/);
  assert.match(v20QualitySource, /bitcode-demo-v20-quality-fixture-v1/);
  assert.match(v20QualitySource, /make Bitcode branch/);
  assert.match(v20QualitySource, /_legacy\/ENGI_SPEC_V20_PROVEN\.md/);
  assert.match(demoScenarioSource, /bitcode\.buildDemoScenario/);
  assert.match(v23BitcoinDemonstrationServiceSource, /bitcode\.v23\.bitcoin-demonstration-service/);
  assert.match(v23BitcoinDemonstrationServiceSource, /tb1qbitcode/);
  assert.match(v23BitcoinDemonstrationServiceSource, /lnbcrt1bitcode/);
  assert.match(v23BitcoinSource, /bitcode-deterministic-local-prototype/);
  assert.match(surfacesSource, /bitcode-system:branch-materializer/);
  assert.match(surfacesSource, /bitcode-system:proof-publisher/);
  assert.match(surfacesSource, /bitcode-system:settlement-engine/);
  assert.match(coreTestSource, /\.\.\/src\/bitcode-demo\.js/);
  assert.match(coreTestSource, /\brunMakeBitcodeBranch\b/);
  assert.match(coreTestSource, /BITCODE_V24_ENVIRONMENT_MODE/);
  assert.match(coreTestSource, /BITCODE_V24_GITHUB_APP_REF/);
  assert.match(coreTestSource, /github-app:\/\/bitcode\/staging-live/);
  assert.match(coreTestSource, /BITCODE_READ\.md/);
  assert.doesNotMatch(attestationModelSource, /engi-demo-image/);
  assert.doesNotMatch(attestationModelSource, /engi-policy-release-v1/);
  assert.doesNotMatch(attestationModelSource, /engi-demo-verifier/);
  assert.doesNotMatch(attestationModelSource, /workspace\/engi-demo/);
  assert.doesNotMatch(policyReleaseSource, /engi-policy-v0\.2/);
  assert.doesNotMatch(seedSource, /engi-internal/);
  assert.doesNotMatch(seedSource, /engi\.initialState/);
  assert.doesNotMatch(v20QualitySource, /engi-demo\.v20-quality-runner\.v1/);
  assert.doesNotMatch(v20QualitySource, /engi-demo-v20-quality-fixture-v1/);
  assert.doesNotMatch(v20QualitySource, /make ENGI branch/);
  assert.doesNotMatch(v20QualitySource, /(?<!_legacy\/)ENGI_SPEC_V20_PROVEN\.md/);
  assert.doesNotMatch(demoScenarioSource, /engi\.buildDemoScenario/);
  assert.doesNotMatch(v23BitcoinDemonstrationServiceSource, /engi\.v23\.bitcoin-demonstration-service/);
  assert.doesNotMatch(v23BitcoinDemonstrationServiceSource, /tb1qengi/);
  assert.doesNotMatch(v23BitcoinDemonstrationServiceSource, /lnbcrt1engi/);
  assert.doesNotMatch(v23BitcoinSource, /engi-deterministic-local-prototype/);
  assert.doesNotMatch(surfacesSource, /engi-system:branch-materializer/);
  assert.doesNotMatch(surfacesSource, /engi-system:proof-publisher/);
  assert.doesNotMatch(surfacesSource, /engi-system:settlement-engine/);
  assert.doesNotMatch(coreTestSource, /\.\.\/src\/engi-demo\.js/);
  assert.doesNotMatch(coreTestSource, /\brunMakeEngiBranch\b/);
  assert.doesNotMatch(coreTestSource, /ENGI_V24_ENVIRONMENT_MODE/);
  assert.doesNotMatch(coreTestSource, /ENGI_V24_GITHUB_APP_REF/);
  assert.doesNotMatch(coreTestSource, /github-app:\/\/engi\/staging-live/);
  assert.doesNotMatch(coreTestSource, /ENGI_READ\.md/);

  assert.doesNotMatch(stateSource, /policy:\/\/engi\//);
  assert.doesNotMatch(stateSource, /:\/\/engi\//);
  assert.doesNotMatch(stateSource, /mock:[^"\n]*:engi\b/);
  assert.doesNotMatch(stateSource, /\bengi-runner\b/);
  assert.doesNotMatch(stateSource, /bucket:\/\/engi-/);
  assert.doesNotMatch(stateSource, /engi-asset-intake-attestation\.v11/);
  assert.doesNotMatch(stateSource, /policy-release-engi-v11-demo-2026-04-03/);
  assert.doesNotMatch(stateSource, /"engi-system-principal"/);
  assert.doesNotMatch(stateSource, /ENGI_SPEC_V27\.md/);
  assert.doesNotMatch(stateSource, /ENGI_SPEC_V27_DELTA\.md/);
  assert.doesNotMatch(stateSource, /ENGI_SPEC_V27_PARITY_MATRIX\.md/);

  assert.match(stateSource, /policy:\/\/bitcode\/spec-v26-active-v27-system-draft\/current/);
  assert.match(stateSource, /kms:\/\/bitcode\/github-app/);
  assert.match(stateSource, /bitcode-asset-intake-attestation\.v11/);
  assert.match(stateSource, /policy-release-bitcode-v11-demo-2026-04-03/);
  assert.match(stateSource, /"bitcode-system-principal"/);
  assert.match(stateSource, /BITCODE_SPEC_V27\.md/);
  assert.match(stateSource, /BITCODE_SPEC_V27_DELTA\.md/);
  assert.match(stateSource, /BITCODE_SPEC_V27_PARITY_MATRIX\.md/);
  assert.match(hostCapabilitiesSource, /engineeredsoftware\/bitcode\.git/);
  assert.doesNotMatch(hostCapabilitiesSource, /engineeredsoftware\/ENGI\.git/);
});

test('active V26 auxillaries ownership and llm-generics harness use Bitcode naming instead of Engi residue', () => {
  assert.equal(
    existsSync(new URL('../../packages/llm-generics/__mocks__/engi-registry.ts', import.meta.url)),
    false,
  );
  assert.equal(
    existsSync(new URL('../../packages/llm-generics/__mocks__/engi-prompts.ts', import.meta.url)),
    false,
  );
  assert.match(llmGenericsJestConfigSource, /bitcode-registry\.ts/);
  assert.match(llmGenericsJestConfigSource, /bitcode-prompts\.ts/);
  assert.match(llmGenericsTsconfigTestSource, /bitcode-registry/);
  assert.match(llmGenericsTsconfigTestSource, /bitcode-prompts/);
  assert.match(llmGenericsReadmeSource, /foundation for AI integration in Bitcode/);
  assert.match(llmGenericsReadmeSource, /LLMs in Bitcode are simple async functions/);
  assert.match(llmGenericsIndexJsSource, /@bitcode\/registry/);
  assert.match(llmGenericsBitcodeRegistryMockSource, /RegistryPathBuilder/);
  assert.match(llmGenericsBitcodePromptsMockSource, /export type Prompt/);
  assert.match(jestBaseSource, /node_modules\/\(\?!\(@bitcode\)\/\)/);
  assert.doesNotMatch(jestBaseSource, /@engi/);
  assert.doesNotMatch(pnpmWorkspaceSource, /engi-dev-cli/);
  assert.doesNotMatch(llmGenericsJestConfigSource, /engi-registry/);
  assert.doesNotMatch(llmGenericsJestConfigSource, /engi-prompts/);
  assert.doesNotMatch(llmGenericsTsconfigTestSource, /engi-registry/);
  assert.doesNotMatch(llmGenericsTsconfigTestSource, /engi-prompts/);
  assert.doesNotMatch(llmGenericsReadmeSource, /\bengi\b/);
  assert.doesNotMatch(llmGenericsIndexJsSource, /@engi\/registry/);
});

test('active V26 auxillaries test ownership and retained examples use Bitcode naming instead of Engi residue', () => {
  assert.match(auxillariesBtdPaneSource, /AuxillariesWorkspaceSection/);
  assert.match(auxillariesConnectsSource, /AuxillariesConnectsPane/);
  assert.match(auxillariesModelsSource, /AuxillariesInterfacesPane/);
  assert.match(auxillariesProfileStepSource, /AuxillariesProfilePane/);
  assert.match(auxillariesProfilePaneSource, /@\/app\/auxillaries\/components\/shared\/AfterOnboardingOverlay/);
  assert.match(auxillariesConnectsPaneSource, /@\/app\/auxillaries\/components\/headers\/AuxillariesConnectsPaneHeader/);
  assert.match(auxillariesInterfacesPaneSource, /@\/app\/auxillaries\/components\/headers\/AuxillariesInterfacesPaneHeader/);
  assert.match(auxillariesBtdPaneSource, /@\/app\/auxillaries\/components\/headers\/AuxillariesBTDPaneHeader/);
  assert.doesNotMatch(auxillariesProfilePaneSource, /@\/app\/orbitals\/components\/OrbitalsProfilePane/);
  assert.doesNotMatch(auxillariesConnectsPaneSource, /@\/app\/orbitals\/components\/OrbitalsConnectsPane/);
  assert.doesNotMatch(auxillariesInterfacesPaneSource, /@\/app\/orbitals\/components\/OrbitalsInterfacesPane/);
  assert.doesNotMatch(auxillariesBtdPaneSource, /@\/app\/orbitals\/components\/OrbitalsBTDPane/);
  assert.match(orbitalsProfilePaneSource, /@\/app\/auxillaries\/components\/AuxillariesProfilePane/);
  assert.match(orbitalsConnectsPaneSource, /@\/app\/auxillaries\/components\/AuxillariesConnectsPane/);
  assert.match(orbitalsInterfacesPaneSource, /@\/app\/auxillaries\/components\/AuxillariesInterfacesPane/);
  assert.match(orbitalsBtdPaneSource, /@\/app\/auxillaries\/components\/AuxillariesBTDPane/);
  assert.match(orbitalsModelsPaneSource, /@\/app\/auxillaries\/components\/AuxillariesInterfacesPane/);
  assert.match(btdStepStaticTestSource, /@\/app\/auxillaries\/components\/AuxillariesBTDPane/);
  assert.match(connectionsStepTestSource, /@\/app\/auxillaries\/components\/AuxillariesConnects/);
  assert.match(modelsStepTestSource, /@\/app\/auxillaries\/components\/AuxillariesModels/);
  assert.match(profileStepTestSource, /@\/app\/auxillaries\/components\/AuxillariesProfileStep/);
  assert.match(orbitalsInterfacesPaneTestSource, /@\/app\/auxillaries\/components\/AuxillariesInterfacesPane/);
  assert.match(orbitalsBtdPaneTestSource, /@\/app\/auxillaries\/components\/AuxillariesBTDPane/);
  assert.match(orbitalsLoginPaneTestSource, /@\/app\/auxillaries\/components\/AuxillariesLoginPane/);
  assert.match(orbitalsContentTestSource, /@\/app\/auxillaries\/components\/AuxillariesContent/);
  assert.match(orbitalsPaneTabsTestSource, /@\/app\/auxillaries\/components\/shared\/AuxillariesPaneTabs/);
  assert.match(orbitalsWorkspacePanelsTestSource, /@\/app\/auxillaries\/components\/shared\/AuxillariesWorkspacePanels/);
  assert.match(orbitalPaneMetaTestSource, /@\/app\/auxillaries\/components\/auxillary-pane-meta/);
  assert.match(modelsPaneCatalogRenderTestSource, /@\/app\/auxillaries\/components\/AuxillariesInterfacesPane/);
  assert.match(authStorySource, /@\/app\/auxillaries\/components\/AuxillariesLoginPane/);
  assert.match(loginPaneStorySource, /\.\.\/app\/auxillaries\/components\/AuxillariesLoginPane/);
  assert.match(onboardingPaneStorySource, /\.\.\/app\/auxillaries\/components\/AuxillariesContent/);
  assert.match(onboardingUserStorySource, /@\/app\/auxillaries\/components\/AuxillariesContent/);
  assert.doesNotMatch(btdStepStaticTestSource, /@\/app\/orbitals\/components\/OrbitalsCredits/);
  assert.doesNotMatch(connectionsStepTestSource, /@\/app\/orbitals\/components\/OrbitalsConnects/);
  assert.doesNotMatch(modelsStepTestSource, /@\/app\/orbitals\/components\/OrbitalsModels/);
  assert.doesNotMatch(profileStepTestSource, /@\/app\/orbitals\/components\/OrbitalsProfileStep/);
  assert.doesNotMatch(orbitalsPaneTabsTestSource, /@\/app\/orbitals\/components\/shared\/OrbitalsPaneTabs/);
  assert.doesNotMatch(orbitalsWorkspacePanelsTestSource, /@\/app\/orbitals\/components\/shared\/OrbitalsWorkspacePanels/);
  assert.match(orbitalsInterfacesPaneTestSource, /@\/app\/auxillaries\/components\/models\/GlobalModelSelection/);
  assert.doesNotMatch(orbitalsInterfacesPaneTestSource, /@\/app\/orbitals\/components\/models\/GlobalModelSelection/);
  assert.match(orbitalsInterfacesPaneTestSource, /Auxillary step 3/);
  assert.match(orbitalsBtdPaneTestSource, /Auxillary step 4/);
  assert.match(btdStepInitialFlowTestSource, /@\/app\/auxillaries\/components\/AuxillariesDataSharingPanel/);
  assert.match(orbitalsOnboardingRouteTestSource, /completedPanes/);
  assert.match(userDataRouteTestSource, /onboardedPanes/);
  assert.match(externalRealizationRouteTestSource, /BITCODE_V24_ENVIRONMENT_MODE/);
  assert.match(terminalExternalRuntimeTestSource, /BITCODE_V24_BITCOIN_MAINCHAIN_RPC_PASSWORD/);
  assert.match(bitcodeChecklistSource, /BITCODE_READ\.md/);
  assert.match(bitcodeScriptSource, /BITCODE_READ\.md/);
  assert.match(bitcodeDemoSpecV15Source, /BITCODE_READ\.md/);
  assert.match(specV6GapAnalysisSource, /BITCODE_READ\.md/);
  assert.doesNotMatch(btdStepInitialFlowTestSource, /@\/app\/orbitals\/components\/OrbitalsDataSharingPanel/);
  assert.doesNotMatch(externalRealizationRouteTestSource, /ENGI_V24_ENVIRONMENT_MODE/);
  assert.doesNotMatch(terminalExternalRuntimeTestSource, /ENGI_V24_BITCOIN_MAINCHAIN_RPC_PASSWORD/);
  assert.doesNotMatch(bitcodeChecklistSource, /ENGI_READ\.md/);
  assert.doesNotMatch(bitcodeScriptSource, /ENGI_READ\.md/);
  assert.doesNotMatch(bitcodeDemoSpecV15Source, /ENGI_READ\.md/);
  assert.doesNotMatch(specV6GapAnalysisSource, /ENGI_READ\.md/);
  assert.doesNotMatch(orbitalPaneMetaTestSource, /@\/app\/orbitals\/components\/orbital-pane-meta/);
  assert.doesNotMatch(authStorySource, /@\/app\/orbitals\/components\/OrbitalLoginPane/);
  assert.doesNotMatch(loginPaneStorySource, /\.\.\/app\/orbitals\/components\/OrbitalLoginPane/);
  assert.doesNotMatch(onboardingPaneStorySource, /\.\.\/app\/orbitals\/components\/Orbital/);
  assert.doesNotMatch(onboardingUserStorySource, /@\/app\/orbitals\/components\/Orbital/);

  assert.match(docCommentExampleSource, /Bitcode system/);
  assert.match(docCommentExampleSource, /BITCODE_IDENTITY_PROMPT/);
  assert.match(docCommentExampleSource, /You are Bitcode/);
  assert.match(docCommentImplementationSource, /BITCODE_IDENTITY_PROMPT/);
  assert.match(figmaIntegrationSource, /Figma Integration for Bitcode/);
  assert.match(multimodalProcessingPackageSource, /Bitcode pipelines/);
  assert.match(multimodalProcessingReadmeSource, /Bitcode pipeline context/);
  assert.match(systemGrepReadmeSource, /Bitcode repository-evidence search/);
  assert.match(genericVcsReadmeSource, /Bitcode pipeline/);
  assert.match(genericTaskComprehensionReadmeSource, /Bitcode's prompt primitives architecture/);
  assert.match(genericLspPurposeSource, /Bitcode LSP purpose composition for static Read measurement and AssetPack evidence/);
  assert.match(jiraToolsPackageSource, /Bitcode agents/);
  assert.match(figmaToolsPackageSource, /Bitcode agents/);
  assert.match(testingIndexSource, /Unified testing infrastructure for Bitcode/);
  assert.match(testingDryRunAdapterSource, /Bitcode's DryRun system/);
  assert.match(testingMockSystemAdapterSource, /Bitcode's Mock System/);
  assert.match(testingReadmeSource, /Bitcode's Unified Testing Architecture/);
  assert.match(testingArchitectureSource, /Test framework in Bitcode/);
  assert.match(testingMigrationGuideSource, /follows Bitcode's architectural principles/);
  assert.match(testingIntegrationExampleSource, /existing Bitcode infrastructure/);
  assert.match(testingTsupConfigSource, /Unified testing infrastructure for Bitcode/);
  assert.match(testingAssetPackScenariosSource, /bitcode-bot/);
  assert.match(promptQualityIndexSource, /Bitcode Prompt Quality Assurance Framework/);
  assert.match(promptQualityEngineSource, /entire Bitcode ecosystem/);
  assert.match(promptQualityConfigSource, /BITCODE_ENVIRONMENT/);
  assert.match(promptQualityConfigSource, /BITCODE_MAX_CONCURRENCY/);
  assert.match(promptQualityReadmeSource, /Bitcode Prompt Quality Framework/);
  assert.match(promptQualityReadmeSource, /enterprise@bitcode\.dev/);
  assert.match(promptQualityReadmeSource, /github\.com\/engineeredsoftware\/bitcode\.git/);
  assert.match(promptQualityReadmeSource, /cd bitcode\/packages\/testing/);
  assert.match(promptQualityReadmeSource, /docs\.bitcode\.dev\/prompt-quality-framework/);
  assert.match(promptQualityReadmeSource, /github\.com\/engineeredsoftware\/bitcode\/issues/);
  assert.match(promptQualityReadmeSource, /github\.com\/engineeredsoftware\/bitcode\/discussions/);
  assert.match(sourceDividerStorySource, /engineeredsoftware\/bitcode/);
  assert.match(sourceConfigStorySource, /engineeredsoftware\/bitcode/);
  assert.match(conversationDigestPipelineTestSource, /name: 'Bitcode'/);
  assert.match(conversationDigestPipelineTestSource, /engineeredsoftware\/bitcode/);
  assert.match(killBugStoryFixtureSource, /Bitcode, clear our Q2 bug backlog/);
  assert.equal(existsSync(pipelineMeasureSmokePath), false);
  assert.match(executionsMcpReadmeSource, /bitcode\/mcp-server/);
  assert.match(executionsMcpReadmeSource, /namespace bitcode/);
  assert.match(executionsMcpPublicOverviewSource, /bitcode-engineering/);
  assert.match(executionsMcpPublicOverviewSource, /bitcode\.mcp-integration/);
  assert.match(executionsMcpPublicOverviewSource, /bitcode\.configure/);
  assert.match(executionsMcpPublicOverviewSource, /bitcode\/mcp-server:latest/);
  assert.match(executionsMcpPublicApiReferenceSource, /https:\/\/myapp\.com\/webhooks\/bitcode/);
  assert.match(executionsMcpSpecGeneratorSource, /"bitcode": \{/);
  assert.match(executionsMcpSpecGeneratorSource, /bitcode\/mcp-action@v1/);
  assert.match(executionsMcpOpenApiGeneratorSource, /https:\/\/myapp\.com\/webhooks\/bitcode/);
  assert.match(executionsMcpKubernetesDeploymentSource, /namespace: bitcode/);
  assert.match(executionsMcpKubernetesDeploymentSource, /image: bitcode\/mcp-server:latest/);
  assert.match(executionsMcpAnalysisToolsSource, /bitcode-ai-v1\.0/);
  assert.doesNotMatch(docCommentExampleSource, /\bEngi\b/);
  assert.doesNotMatch(docCommentImplementationSource, /ENGI_IDENTITY_PROMPT/);
  assert.doesNotMatch(figmaIntegrationSource, /\bEngi\b/);
  assert.doesNotMatch(multimodalProcessingPackageSource, /\bEngi\b/);
  assert.doesNotMatch(multimodalProcessingReadmeSource, /\bEngi\b/);
  assert.doesNotMatch(systemGrepReadmeSource, /\bEngi\b/);
  assert.doesNotMatch(genericVcsReadmeSource, /\bEngi\b/);
  assert.doesNotMatch(genericTaskComprehensionReadmeSource, /\bEngi\b/);
  assert.doesNotMatch(genericLspPurposeSource, /with Engi/);
  assert.doesNotMatch(jiraToolsPackageSource, /\bEngi\b/);
  assert.doesNotMatch(figmaToolsPackageSource, /\bEngi\b/);
  assert.doesNotMatch(testingIndexSource, /\bEngi\b/);
  assert.doesNotMatch(testingDryRunAdapterSource, /\bEngi\b/);
  assert.doesNotMatch(testingMockSystemAdapterSource, /\bEngi\b/);
  assert.doesNotMatch(testingReadmeSource, /\bEngi\b/);
  assert.doesNotMatch(testingArchitectureSource, /\bEngi\b/);
  assert.doesNotMatch(testingMigrationGuideSource, /\bEngi\b/);
  assert.doesNotMatch(testingIntegrationExampleSource, /\bEngi\b/);
  assert.doesNotMatch(testingTsupConfigSource, /\bEngi\b/);
  assert.doesNotMatch(testingAssetPackScenariosSource, /engi-bot/);
  assert.doesNotMatch(promptQualityIndexSource, /\bEngi\b/);
  assert.doesNotMatch(promptQualityEngineSource, /\bEngi\b/);
  assert.doesNotMatch(promptQualityConfigSource, /ENGI_ENVIRONMENT/);
  assert.doesNotMatch(promptQualityConfigSource, /ENGI_MAX_CONCURRENCY/);
  assert.doesNotMatch(promptQualityConfigSource, /ENGI_QUALITY_GATES/);
  assert.doesNotMatch(promptQualityConfigSource, /ENGI_ENABLE_MONITORING/);
  assert.doesNotMatch(promptQualityReadmeSource, /\bEngi\b/);
  assert.doesNotMatch(promptQualityReadmeSource, /github\.com\/engi\/engi/);
  assert.doesNotMatch(promptQualityReadmeSource, /cd engi\/packages\/testing/);
  assert.doesNotMatch(promptQualityReadmeSource, /docs\.engi\.ai\/prompt-quality-framework/);
  assert.doesNotMatch(promptQualityReadmeSource, /stackoverflow\.com\/questions\/tagged\/engi/);
  assert.doesNotMatch(sourceDividerStorySource, /engi-ai\/engi-platform/);
  assert.doesNotMatch(sourceConfigStorySource, /engi-ai\/engi-platform/);
  assert.doesNotMatch(conversationDigestPipelineTestSource, /name: 'Engi'/);
  assert.doesNotMatch(conversationDigestPipelineTestSource, /engi\/chatgpt-app/);
  assert.doesNotMatch(killBugStoryFixtureSource, /Engi, clear our Q2 bug backlog/);
  assert.doesNotMatch(executionsMcpReadmeSource, /engi\/mcp-server/);
  assert.doesNotMatch(executionsMcpReadmeSource, /namespace engi/);
  assert.doesNotMatch(executionsMcpPublicOverviewSource, /engi-engineering/);
  assert.doesNotMatch(executionsMcpPublicOverviewSource, /engi\.mcp-integration/);
  assert.doesNotMatch(executionsMcpPublicOverviewSource, /engi\.configure/);
  assert.doesNotMatch(executionsMcpPublicOverviewSource, /engi\/mcp-server:latest/);
  assert.doesNotMatch(executionsMcpPublicApiReferenceSource, /https:\/\/myapp\.com\/webhooks\/engi/);
  assert.doesNotMatch(executionsMcpSpecGeneratorSource, /"engi": \{/);
  assert.doesNotMatch(executionsMcpSpecGeneratorSource, /engi\/mcp-action@v1/);
  assert.doesNotMatch(executionsMcpOpenApiGeneratorSource, /https:\/\/myapp\.com\/webhooks\/engi/);
  assert.doesNotMatch(executionsMcpKubernetesDeploymentSource, /namespace: engi/);
  assert.doesNotMatch(executionsMcpKubernetesDeploymentSource, /image: engi\/mcp-server:latest/);
  assert.doesNotMatch(executionsMcpAnalysisToolsSource, /engi-ai-v1\.0/);
});

test('active V26 prompt-system package uses Bitcode naming instead of Engi naming', () => {
  assert.match(promptsIndexSource, /foundational prompt system for Bitcode/);
  assert.match(promptsIndexSource, /You are Bitcode/);
  assert.doesNotMatch(promptsIndexSource, /foundational prompt system for Engi/);
  assert.doesNotMatch(promptsIndexSource, /You are Engi/);

  assert.match(promptPartSource, /foundational type for all prompts in Bitcode/);
  assert.match(promptPartSource, /BitcodeSystemPrompt → bitcodesystem/);
  assert.doesNotMatch(promptPartSource, /foundational type for all prompts in Engi/);
  assert.doesNotMatch(promptPartSource, /EngiSystemPrompt → engisystem/);

  assert.match(promptBenchmarkCliSource, /Bitcode Prompt Benchmark CLI/);
  assert.doesNotMatch(promptBenchmarkCliSource, /Engi Prompt Benchmark CLI/);
  assert.match(promptBenchmarkReadmeSource, /The Bitcode prompt benchmarking system/);
  assert.doesNotMatch(promptBenchmarkReadmeSource, /The Engi prompt benchmarking system/);
  assert.match(promptsIndexJsSource, /foundational prompt system for Bitcode/);
  assert.match(promptsIndexJsSource, /@bitcode\/prompts/);
  assert.match(promptsIndexJsSource, /You are Bitcode/);
  assert.doesNotMatch(promptsIndexJsSource, /foundational prompt system for Engi/);
  assert.doesNotMatch(promptsIndexJsSource, /@engi\/prompts/);
  assert.doesNotMatch(promptsIndexJsSource, /You are Engi/);
  assert.match(promptPartJsSource, /foundational type for all prompts in Bitcode/);
  assert.match(promptPartJsSource, /BitcodeSystemPrompt → bitcodesystem/);
  assert.doesNotMatch(promptPartJsSource, /foundational type for all prompts in Engi/);
  assert.doesNotMatch(promptPartJsSource, /EngiSystemPrompt → engisystem/);

  assert.match(promptPackageJsonSource, /Bitcode prompt system/);
  assert.match(promptPackageJsonSource, /Bitcode Team/);
  assert.match(promptPackageJsonSource, /engineeredsoftware\/bitcode\.git/);
  assert.doesNotMatch(promptPackageJsonSource, /Engi engineering system/);
  assert.doesNotMatch(promptPackageJsonSource, /Engi Team/);
  assert.doesNotMatch(promptPackageJsonSource, /github\.com\/engi\/engi\.git/);

  assert.match(promptTaskGuideSource, /expert Bitcode task guide author/);
  assert.match(promptCodeStylesIdentitySource, /expert Bitcode codebase style author/);
  assert.match(promptCodeStylesBaseSource, /for the Bitcode monorepo in Markdown only/);
  assert.doesNotMatch(promptTaskGuideSource, /expert Engi task guide author/);
  assert.doesNotMatch(promptCodeStylesIdentitySource, /expert Engi codebase style author/);
  assert.doesNotMatch(promptCodeStylesBaseSource, /for the Engi monorepo in Markdown only/);
});

test('active V26 retained package surfaces use Bitcode naming instead of Engi naming', () => {
  assert.match(streamsTsSource, /used across Bitcode/);
  assert.equal(existsSync(streamsJsSourceUrl), false);
  assert.doesNotMatch(streamsTsSource, /used across Engi/);

  assert.match(webSearchSource, /generated by Bitcode/);
  assert.match(webSearchSource, /Using mock Exa client for Bitcode ChatGPT App/);
  assert.match(webSearchSource, /BITCODE_MOCK_EXA/);
  assert.match(webSearchSource, /BITCODE_MOCK_EXTERNAL/);
  assert.match(webSearchReadmeSource, /Production web research infrastructure for Bitcode technical-knowledge workflows/);
  assert.match(webSearchReadmeSource, /github\.com\/engineeredsoftware\/bitcode\.git/);
  assert.match(webSearchReadmeSource, /cd bitcode\/packages\/web-search/);
  assert.match(googleAnalyticsReadmeSource, /wrapper for the Bitcode platform/);
  assert.match(registryReadmeSource, /## How Bitcode Uses Registry/);
  assert.match(registryTldrSource, /makes configuration dynamic in Bitcode/);
  assert.match(registryTldrSource, /## How Bitcode Uses Registry/);
  assert.match(registryTldrSource, /Bitcode's dynamic configuration/);
  assert.match(registryTodoSource, /Registry is one of Bitcode's most elegant primitives/);
  assert.match(modelsReadmeSource, /# Bitcode Models Package/);
  assert.match(modelsReadmeSource, /for the Bitcode intelligence system/);
  assert.match(errorsPackageSource, /Unified error primitives shared across Bitcode services/);
  assert.match(errorsTsSource, /used across Bitcode codebases/);
  assert.match(errorsJsSource, /@bitcode\/sentry/);
  assert.match(errorsJsSource, /@bitcode\/errors|@bitcode\/sentry/);
  assert.match(errorsTsSource, /\bBitcodeErrorOptions\b/);
  assert.match(errorsTsSource, /\bBitcodeError\b/);
  assert.match(errorsTsSource, /\basBitcodeError\b/);
  assert.match(errorsTsSource, /__bitcode_reported__/);
  assert.match(notionPackageSource, /Notion API integration package for Bitcode/);
  assert.match(notionReadmeSource, /Notion integration package for Bitcode/);
  assert.match(notionReadmeSource, /part of the Bitcode monorepo/);
  assert.match(notionReadmeSource, /## Integration with Bitcode Pipelines/);
  assert.match(notionReadmeSource, /integrated with Bitcode's existing pipeline system/);
  assert.match(notionReadmeSource, /Follow Bitcode's TypeScript conventions/);
  assert.match(observabilityPackageSource, /Tracing helpers for Bitcode/);
  assert.match(observabilityReadmeSource, /for the Bitcode platform/);
  assert.match(observabilityJsSource, /@bitcode\/sentry/);
  assert.match(observabilityJsSource, /@bitcode\/errors/);
  assert.match(sentryReadmeSource, /for the Bitcode platform/);
  assert.match(kubernetesReadmeSource, /for the Bitcode platform/);
  assert.match(kubernetesReadmeSource, /Bitcode pipeline monitoring/);
  assert.match(loggerReadmeSource, /for the Bitcode platform/);
  assert.match(ormPackageSource, /Bitcode ORM - Database access layer with vector search/);
  assert.match(ormReadmeSource, /for the Bitcode platform/);
  assert.match(ormIndexSource, /Bitcode ORM - V26 Database Access Layer/);
  assert.doesNotMatch(ormReadmeSource, /field intelligence/i);
  assert.deepEqual(activeFieldIntelligenceUrls.filter((url) => existsSync(url)).map((url) => url.pathname), []);
  assert.match(attachmentsGenericsPackageSource, /Universal attachment types for Bitcode/);
  assert.match(attachmentsGenericsReadmeSource, /utilities for the Bitcode platform/);
  assert.match(attachmentsGenericsReadmeSource, /Attachments in Bitcode fall into exactly 2 categories/);
  assert.match(attachmentsGenericsIndexSource, /across the entire Bitcode codebase/);
  assert.match(attachmentsGenericsTypesSource, /Universal attachment definitions for Bitcode/);
  assert.match(btdIndexSource, /when Bitcode supports new models or vendors/);
  assert.match(btdIndexJsSource, /non-fungible AssetPack share\/read-right/);
  assert.match(btdIndexJsSource, /BTD_MAX_MINTABLE_SUPPLY = 21_000_000/);
  assert.doesNotMatch(btdIndexJsSource, /deductBtdBalance|reserveBtdBalance|processShortCircuitBtdRefund|InsufficientBtdBalanceError/u);
  assert.match(btdPlansSource, /Try Bitcode with a small project or quick fix/);
  assert.match(techTypesReadmeSource, /definitions for the Bitcode platform/);
  assert.match(techTypesReadmeSource, /across the Bitcode platform/);
  assert.match(techTypesReadmeSource, /used to measure technical needs/);
  assert.match(techTypesReadmeSource, /read-measurement spine/);
  assert.match(techTypesReadmeSource, /canonical V26 envelope/);
  assert.match(techTypesReadmeSource, /technologyProfile/);
  assert.match(techTypesIdentifierReadmeSource, /canonical `technologyProfile` emitted by Bitcode read-measurement/);
  assert.match(techTypesIdentifierIndexSource, /technologyProfile: CanonicalTechnologyProfileSchema/);
  assert.match(streamsReadmeSource, /for the Bitcode platform/);
  assert.match(digestReadmeSource, /bitcode-corp/);
  assert.match(digestCachingSource, /\/tmp\/bitcode\/digest-cache/);
  assert.match(digestCachingTestSource, /\/tmp\/bitcode\/digest-cache\/github\/org\/repo\/files/);
  assert.match(digestCodeStyleSource, /for the Bitcode codebase/);
  assert.match(digestAgentPromptsSource, /You are the Bitcode collaboration architect\./);
  assert.match(digestProductPromptsSource, /You are the Bitcode design systems narrator\./);
  assert.match(digestRunSource, /\/tmp\/bitcode\/digests/);
  assert.match(digestRunSource, /\/tmp\/bitcode\/digest-cache/);
  assert.match(digestRunSource, /\/tmp\/bitcode', 'clones'/);
  assert.match(digestGenerateDigestTestSource, /\/tmp\/bitcode\/digests/);
  assert.match(digestJestConfigSource, /__mocks__\/bitcode\/logger\.ts/);
  assert.match(digestTsconfigTestSource, /packages\/digest\/__mocks__\/bitcode\/logger\.ts/);
  assert.match(digestBitcodeLoggerMockSource, /no-op logger for tests/);
  assert.match(digestGitMockSource, /\/tmp\/bitcode\/mock-repo/);
  assert.match(digestServiceReadmeSource, /\/tmp\/bitcode\/digest-cache/);
  assert.match(apiAuthRouteSource, /Welcome to Bitcode/);
  assert.match(apiAuthRouteSource, /use Bitcode through ChatGPT/);
  assert.match(apiUserRouteSource, /bitcode_/);
  assert.match(apiPackageSource, /Comprehensive Bitcode API routes package - the unified backend route-orchestration layer/);
  assert.match(apiReadmeSource, /Interface-owned route bindings such as `uapi\/app\/api\/\*` should stay thin/);
  assert.match(apiReadmeSource, /formal route handlers from `packages\/api` entry modules such as `@bitcode\/api\/src\/routes\/\*`/);
  assert.match(apiIndexSource, /Bitcode API - Kitchen sink of route-level API orchestration/);
  assert.match(apiIndexSource, /Route ownership lives here; FS interface bindings stay thin/);
  assert.match(apiIndexSource, /export \* from '\.\/routes\/auxillaries';/);
  assert.match(apiIndexSource, /export \* from '\.\/routes\/auxillaries-contract';/);
  assert.match(apiIndexSource, /export \* from '\.\/routes\/executions';/);
  assert.match(apiIndexSource, /export \* as shippables from '\.\/routes\/shippables';/);
  assert.match(apiReadmeSource, /auxillaries/);
  assert.match(apiAuxillariesRouteSource, /buildGetAuxillaryOnboardingRoute/);
  assert.match(apiAuxillariesRouteSource, /buildPostAuxillaryOnboardingRoute/);
  assert.match(apiAuxillariesRouteSource, /buildGetAuxillaryDataRoute/);
  assert.match(apiAuxillariesRouteSource, /buildGetAuxillaryModelPreferencesRoute/);
  assert.match(apiAuxillariesRouteSource, /buildPostAuxillaryModelPreferencesRoute/);
  assert.match(apiAuxillariesRouteSource, /buildGetAuxillaryTemplatePreferencesRoute/);
  assert.match(apiAuxillariesRouteSource, /buildPostAuxillaryTemplatePreferencesRoute/);
  assert.match(apiAuxillariesRouteSource, /traceRoute\('\/auxillaries\/onboarding'/);
  assert.match(apiAuxillariesRouteSource, /traceRoute\('\/auxillaries\/data'/);
  assert.match(apiAuxillariesContractSource, /AUXILLARY_FLOW_STEPS = \['profile', 'connects', 'interfaces', 'btd'\]/);
  assert.match(apiAuxillariesContractSource, /buildAuxillaryOnboardingPayload/);
  assert.match(apiAuxillariesContractSource, /buildAuxillaryDataPayload/);
  assert.match(apiAuxillariesContractSource, /completedPanes/);
  assert.match(apiAuxillariesContractSource, /onboardedPanes/);
  assert.match(apiShippablesRouteSource, /Please ensure the Bitcode GitHub App has access to this repository/);
  assert.match(apiShippablesRouteSource, /BITCODE_LOG_TO_FILE/);
  assert.match(apiShippablesRouteSource, /BITCODE_ENABLE_COMPUTER_USE_READ_MEASUREMENT/);
  assert.doesNotMatch(apiShippablesRouteSource, /BITCODE_ENABLE_COMPUTE_TOGGLE/);
  assert.match(apiShippablesRouteSource, /BITCODE_ENABLE_NOTIFICATIONS/);
  assert.match(apiShippablesRouteSource, /BITCODE_LLM_PROVIDER/);
  assert.match(apiShippablesRouteSource, /BITCODE_LLM_MODEL/);
  assert.match(apiExecutionsRouteSource, /Executions API Route Handlers/);
  assert.match(apiExecutionsRouteSource, /Route ownership lives here in the API package/);
  assert.match(apiExecutionsRouteSource, /export async function getExecutionHistoryRoute/);
  assert.match(apiExecutionsRouteSource, /export async function postExecutionHistoryRoute/);
  assert.match(apiExecutionsRouteSource, /export async function getExecutionHistoryRunRoute/);
  assert.match(apiExecutionsRouteSource, /export function normalizeExecutionHistoryRow/);
  assert.match(apiExecutionsRouteSource, /export function normalizeExecutionEventRow/);
  assert.match(conversationsApiRouteSource, /from '@bitcode\/api\/src\/routes\/conversations'/);
  assert.match(conversationsApiRouteSource, /getConversationsRoute/);
  assert.match(conversationBranchApiRouteSource, /from '@bitcode\/api\/src\/routes\/conversations'/);
  assert.match(conversationBranchApiRouteSource, /postConversationBranchRoute/);
  assert.match(conversationStreamApiRouteSource, /from '@bitcode\/api\/src\/routes\/conversations'/);
  assert.match(conversationStreamApiRouteSource, /postConversationStreamRoute/);
  assert.match(conversationThreadStreamApiRouteSource, /from '@bitcode\/api\/src\/routes\/conversations'/);
  assert.match(conversationThreadStreamApiRouteSource, /postConversationThreadStreamRoute/);
  assert.match(executionsApiRouteSource, /from '@bitcode\/api\/src\/routes\/shippables'/);
  assert.match(executionsApiRouteSource, /export \{ DELETE, GET, POST \}/);
  assert.match(executionHistoryApiRouteSource, /from '@bitcode\/api\/src\/routes\/executions'/);
  assert.match(executionHistoryApiRouteSource, /getExecutionHistoryRoute/);
  assert.match(executionHistoryApiRouteSource, /postExecutionHistoryRoute/);
  assert.match(executionHistoryRunApiRouteSource, /from '@bitcode\/api\/src\/routes\/executions'/);
  assert.match(executionHistoryRunApiRouteSource, /getExecutionHistoryRunRoute/);
  assert.match(auxillariesOnboardingApiRouteSource, /from '@bitcode\/api\/src\/routes\/auxillaries'/);
  assert.match(auxillariesOnboardingApiRouteSource, /buildGetAuxillaryOnboardingRoute/);
  assert.match(auxillariesOnboardingApiRouteSource, /buildPostAuxillaryOnboardingRoute/);
  assert.match(auxillariesDataApiRouteSource, /from '@bitcode\/api\/src\/routes\/auxillaries'/);
  assert.match(auxillariesDataApiRouteSource, /buildGetAuxillaryDataRoute/);
  assert.match(auxillariesModelPreferencesApiRouteSource, /from '@bitcode\/api\/src\/routes\/auxillaries'/);
  assert.match(auxillariesModelPreferencesApiRouteSource, /buildGetAuxillaryModelPreferencesRoute/);
  assert.match(auxillariesModelPreferencesApiRouteSource, /buildPostAuxillaryModelPreferencesRoute/);
  assert.match(auxillariesTemplatePreferencesApiRouteSource, /from '@bitcode\/api\/src\/routes\/auxillaries'/);
  assert.match(auxillariesTemplatePreferencesApiRouteSource, /buildGetAuxillaryTemplatePreferencesRoute/);
  assert.match(auxillariesTemplatePreferencesApiRouteSource, /buildPostAuxillaryTemplatePreferencesRoute/);
  assert.match(modelsPricingSource, /BITCODE_LLM_PROVIDER/);
  assert.match(modelsPricingSource, /BITCODE_LLM_MODEL/);
  assert.match(securityPackageSource, /Bitcode Security Team/);
  assert.match(securityReadmeSource, /security@bitcode\.dev/);
  assert.match(multimodalUtilsReadmeSource, /across the Bitcode platform/);
  assert.match(uniqueTechSource, /combinations that Bitcode actively/);
  assert.match(supabaseStreamsSource, /expected by Bitcode's streaming helpers/);
  assert.match(supabaseIndexJsSource, /@bitcode\/supabase/);
  assert.match(supabaseStreamsJsSource, /@bitcode\/supabase/);
  assert.match(docCodeJestConfigSource, /bitcode-tools-generics\.ts/);
  assert.match(docCodeBitcodeToolsGenericsMockSource, /export class Tool/);
  assert.match(genericDocCommentDevelopingPackageSource, /Development-time doc-comment plugins for Bitcode/);
  assert.match(executionsPersistedStateSource, /bitcode_execution_state_v1/);
  assert.match(patternRecognitionSource, /bitcode_pattern_history/);
  assert.match(patternRecognitionSource, /bitcode_pattern_insights/);
  assert.match(comprehensiveMockDataGeneratorsSource, /bitcode_pk_/);
  assert.match(accountOrbitalStorySource, /Bitcode\/Auxillaries\/Account/);
  assert.match(accountOrbitalStorySource, /demo@bitcode\.dev/);
  assert.match(completionCelebrationStorySource, /Bitcode\/Surprise & Delight\/Completion Celebration/);
  assert.match(readDefinitionInputStorySource, /Bitcode\/Surprise & Delight\/Definition of Read Input/);
  assert.match(executionActionsStorySource, /Executions\/Actions/);
  assert.match(errorRecoveryGraceStorySource, /Bitcode\/Surprise & Delight\/Error Recovery Grace/);
  assert.match(patternMemoryStorySource, /Bitcode\/Surprise & Delight\/Pattern Memory/);
  assert.match(pipelinePhasePoetryStorySource, /Bitcode\/Surprise & Delight\/Pipeline Phase Poetry/);
  assert.match(conversationsCompleteSystemStorySource, /Conversations\/Complete System Demo/);
  assert.match(conversationsCompleteSystemStorySource, /Bitcode Transaction Workspace Development/);
  assert.match(btdInvestmentExperienceStorySource, /Bitcode\/Surprise & Delight\/BTD Holding Experience/);
  assert.match(marketingBtdInvestmentExperienceSource, /btd-holding-experience/);
  assert.match(marketingBtdInvestmentExperienceSource, /\$BTD/);
  assert.match(marketingTestimonialsSource, /BTC fee basis and measured \$BTD issuance/);
  assert.doesNotMatch(marketingTestimonialsSource, /\$BTD spend|BTD spend/);
  assert.match(btdPricesSource, /Terminal Read/);
  assert.match(btdPricesSource, /Exchange Preview/);
  assert.match(btdPricesSource, /BTC Fee Basis/);
  assert.match(btdPricesSource, /Non-Fungible Shares/);
  assert.doesNotMatch(btdPricesSource, /Industrial|Fair-Cost|Short-Circuit Refunds|spendUSD|INDUSTRIAL_CREDITS|perBtdCost/);
  assert.match(flexibleBtdSelectorSource, /BTC fee reference: \$\{referenceUsdPerBtd\.toFixed\(2\)\} \/ measured \$BTD/);
  assert.doesNotMatch(flexibleBtdSelectorSource, /isIndustrial|industrialBtd|perBtdCost|isEditingCredit|setIsEditingCredit/);
  assert.match(intelligentProcessingIndicatorStorySource, /Bitcode\/Surprise & Delight\/Intelligent Processing Indicator/);
  assert.match(userAccountOrbitalStorySource, /Bitcode\/Auxillaries\/Account Orbital/);
  assert.match(userAccountOrbitalStorySource, /Bitcode Engineer/);
  assert.match(markdownElementsStorySource, /Hello, Bitcode!/);
  assert.match(markdownElementsStorySource, /Bitcode Spec/);
  assert.doesNotMatch(webSearchSource, /generated by Engi/);
  assert.doesNotMatch(webSearchSource, /Using mock Exa client for Engi ChatGPT App/);
  assert.doesNotMatch(webSearchSource, /ENGI_MOCK_EXA/);
  assert.doesNotMatch(webSearchSource, /ENGI_MOCK_EXTERNAL/);
  assert.doesNotMatch(webSearchReadmeSource, /for the Engi development platform/);
  assert.doesNotMatch(webSearchReadmeSource, /github\.com\/engi\/engi\.git/);
  assert.doesNotMatch(webSearchReadmeSource, /cd engi\/packages\/web-search/);
  assert.doesNotMatch(googleAnalyticsReadmeSource, /wrapper for ENGI platform/);
  assert.doesNotMatch(registryReadmeSource, /## How Engi Uses Registry/);
  assert.doesNotMatch(registryTldrSource, /makes configuration dynamic in Engi/);
  assert.doesNotMatch(registryTldrSource, /## How Engi Uses Registry/);
  assert.doesNotMatch(registryTldrSource, /Engi's dynamic configuration/);
  assert.doesNotMatch(registryTodoSource, /Registry is one of Engi's most elegant primitives/);
  assert.doesNotMatch(modelsReadmeSource, /# Engi Models Package/);
  assert.doesNotMatch(modelsReadmeSource, /for the Engi intelligence system/);
  assert.doesNotMatch(errorsPackageSource, /Unified error primitives shared across Engi services/);
  assert.doesNotMatch(errorsTsSource, /used across Engi codebases/);
  assert.doesNotMatch(errorsJsSource, /@engi\/sentry/);
  assert.doesNotMatch(errorsTsSource, /\bEngiErrorOptions\b/);
  assert.doesNotMatch(errorsTsSource, /\bEngiError\b/);
  assert.doesNotMatch(errorsTsSource, /\basEngiError\b/);
  assert.doesNotMatch(errorsTsSource, /__engi_reported__/);
  assert.doesNotMatch(notionPackageSource, /Notion API integration package for Engi/);
  assert.doesNotMatch(notionReadmeSource, /Notion integration package for Engi/);
  assert.doesNotMatch(notionReadmeSource, /part of the Engi monorepo/);
  assert.doesNotMatch(notionReadmeSource, /## Integration with Engi Pipelines/);
  assert.doesNotMatch(notionReadmeSource, /integrated with Engi's existing pipeline system/);
  assert.doesNotMatch(notionReadmeSource, /Follow Engi's TypeScript conventions/);
  assert.doesNotMatch(observabilityPackageSource, /Tracing helpers for Engi/);
  assert.doesNotMatch(observabilityReadmeSource, /for the ENGI platform/);
  assert.doesNotMatch(observabilityJsSource, /@engi\/sentry/);
  assert.doesNotMatch(observabilityJsSource, /@engi\/errors/);
  assert.doesNotMatch(sentryReadmeSource, /for ENGI platform/);
  assert.doesNotMatch(kubernetesReadmeSource, /for ENGI platform/);
  assert.doesNotMatch(kubernetesReadmeSource, /ENGI pipeline monitoring/);
  assert.doesNotMatch(loggerReadmeSource, /for the ENGI platform/);
  assert.doesNotMatch(ormReadmeSource, /for ENGI platform/);
  assert.doesNotMatch(ormIndexSource, /ENGI ORM - V26 Database Access Layer/);
  assert.doesNotMatch(ormPackageSource, /Engi ORM - Database access layer with vector search/);
  assert.doesNotMatch(attachmentsGenericsPackageSource, /Universal attachment types for Engi/);
  assert.doesNotMatch(attachmentsGenericsReadmeSource, /utilities for the Engi platform/);
  assert.doesNotMatch(attachmentsGenericsReadmeSource, /attachments in Engi fall into exactly/);
  assert.doesNotMatch(attachmentsGenericsIndexSource, /across the entire Engi codebase/);
  assert.doesNotMatch(attachmentsGenericsTypesSource, /Universal attachment definitions for Engi/);
  assert.doesNotMatch(btdIndexSource, /when Engi supports new models or vendors/);
  assert.doesNotMatch(btdIndexJsSource, /when Engi supports new models or vendors/);
  assert.doesNotMatch(btdPlansSource, /Try Engi with a small project or quick fix/);
  assert.doesNotMatch(techTypesReadmeSource, /for ENGI platform/);
  assert.doesNotMatch(techTypesReadmeSource, /across ENGI platform/);
  assert.doesNotMatch(techTypesReadmeSource, /generic taxonomy sidecar/i);
  assert.doesNotMatch(techTypesIdentifierReadmeSource, /technologyProfile \/ `stackHints`/);
  assert.doesNotMatch(streamsReadmeSource, /for the ENGI platform/);
  assert.doesNotMatch(digestReadmeSource, /engi-corp/);
  assert.doesNotMatch(digestCachingSource, /\/tmp\/engi\/digest-cache/);
  assert.doesNotMatch(digestCachingTestSource, /\/tmp\/engi\/digest-cache/);
  assert.doesNotMatch(digestCodeStyleSource, /for the Engi codebase/);
  assert.doesNotMatch(digestAgentPromptsSource, /You are the Engi collaboration architect\./);
  assert.doesNotMatch(digestProductPromptsSource, /You are the Engi design systems narrator\./);
  assert.doesNotMatch(digestRunSource, /\/tmp\/engi\/digests/);
  assert.doesNotMatch(digestRunSource, /\/tmp\/engi\/digest-cache/);
  assert.doesNotMatch(digestRunSource, /\/tmp\/engi', 'clones'/);
  assert.doesNotMatch(digestGenerateDigestTestSource, /\/tmp\/engi\/digests/);
  assert.doesNotMatch(digestJestConfigSource, /__mocks__\/engi\/logger\.ts/);
  assert.doesNotMatch(digestTsconfigTestSource, /packages\/digest\/__mocks__\/engi\/logger\.ts/);
  assert.doesNotMatch(digestGitMockSource, /\/tmp\/engi\/mock-repo/);
  assert.doesNotMatch(digestServiceReadmeSource, /\/tmp\/engi\/digest-cache/);
  assert.doesNotMatch(apiAuthRouteSource, /Welcome to Engi/);
  assert.doesNotMatch(apiAuthRouteSource, /use Engi through ChatGPT/);
  assert.doesNotMatch(apiUserRouteSource, /engi_/);
  assert.doesNotMatch(apiPackageSource, /for engi - the unified backend API layer/i);
  assert.doesNotMatch(apiIndexSource, /ENGI API - Kitchen sink of all API business logic/);
  assert.doesNotMatch(apiIndexSource, /this package contains all business logic for the engi platform/i);
  assert.doesNotMatch(apiShippablesRouteSource, /Please ensure the Engi GitHub App has access to this repository/);
  assert.doesNotMatch(apiShippablesRouteSource, /ENGI_LOG_TO_FILE/);
  assert.doesNotMatch(apiShippablesRouteSource, /ENGI_ENABLE_COMPUTE_TOGGLE/);
  assert.doesNotMatch(apiShippablesRouteSource, /ENGI_ENABLE_NOTIFICATIONS/);
  assert.doesNotMatch(apiShippablesRouteSource, /ENGI_LLM_PROVIDER/);
  assert.doesNotMatch(apiShippablesRouteSource, /ENGI_LLM_MODEL/);
  assert.doesNotMatch(apiExecutionsRouteSource, /ENGI/);
  assert.doesNotMatch(apiAuxillariesRouteSource, /\bENGI\b/);
  assert.doesNotMatch(apiAuxillariesContractSource, /"models","credits"/);
  assert.doesNotMatch(apiAuxillariesContractSource, /\? 'credits'/);
  assert.match(settlementSource, /journalDiff\.credits/);
  assert.match(settlementSource, /journalDiff\.debits/);
  assert.doesNotMatch(auxillariesOnboardingApiRouteSource, /supabaseAdmin/);
  assert.doesNotMatch(auxillariesOnboardingApiRouteSource, /createClient/);
  assert.doesNotMatch(auxillariesDataApiRouteSource, /supabaseAdmin/);
  assert.doesNotMatch(auxillariesDataApiRouteSource, /createClient/);
  assert.doesNotMatch(auxillariesModelPreferencesApiRouteSource, /supabaseAdmin/);
  assert.doesNotMatch(auxillariesModelPreferencesApiRouteSource, /createClient/);
  assert.doesNotMatch(auxillariesTemplatePreferencesApiRouteSource, /supabaseAdmin/);
  assert.doesNotMatch(auxillariesTemplatePreferencesApiRouteSource, /createClient/);
  assert.doesNotMatch(conversationsApiRouteSource, /packages\/api\/src\/conversations/);
  assert.doesNotMatch(conversationBranchApiRouteSource, /packages\/api\/src\/conversations/);
  assert.doesNotMatch(conversationsApiRouteSource, /getConversationRouteUserId/);
  assert.doesNotMatch(conversationBranchApiRouteSource, /getConversationRouteUserId/);
  assert.doesNotMatch(executionHistoryApiRouteSource, /normalizeExecutionHistoryRow } from '\.\.\/_shared'/);
  assert.doesNotMatch(executionHistoryApiRouteSource, /supabaseAdmin/);
  assert.doesNotMatch(executionHistoryRunApiRouteSource, /normalizeExecutionEventRow/);
  assert.doesNotMatch(executionHistoryRunApiRouteSource, /supabaseAdmin/);
  assert.doesNotMatch(modelsPricingSource, /ENGI_LLM_PROVIDER/);
  assert.doesNotMatch(modelsPricingSource, /ENGI_LLM_MODEL/);
  assert.doesNotMatch(securityPackageSource, /Engi Security Team/);
  assert.doesNotMatch(securityReadmeSource, /security@engi\.com/);
  assert.doesNotMatch(multimodalUtilsReadmeSource, /across the Engi platform/);
  assert.doesNotMatch(uniqueTechSource, /combinations that Engi actively/);
  assert.doesNotMatch(supabaseStreamsSource, /expected by Engi's streaming helpers/);
  assert.doesNotMatch(supabaseIndexJsSource, /@engi\/supabase/);
  assert.doesNotMatch(supabaseStreamsJsSource, /@engi\/supabase/);
  assert.doesNotMatch(docCodeJestConfigSource, /engi-tools-generics\.ts/);
  assert.doesNotMatch(genericDocCommentDevelopingPackageSource, /Development-time doc-comment plugins for Engi/);
  assert.doesNotMatch(executionsPersistedStateSource, /engi_execution_state_v1/);
  assert.doesNotMatch(patternRecognitionSource, /engi_pattern_history/);
  assert.doesNotMatch(patternRecognitionSource, /engi_pattern_insights/);
  assert.doesNotMatch(comprehensiveMockDataGeneratorsSource, /engi_pk_/);
  assert.doesNotMatch(accountOrbitalStorySource, /Kitchen Sink\/Orbitals\/Account/);
  assert.doesNotMatch(accountOrbitalStorySource, /demo@engi\.ai/);
  assert.doesNotMatch(completionCelebrationStorySource, /Engi\/Surprise & Delight\/Completion Celebration/);
  assert.doesNotMatch(readDefinitionInputStorySource, /Engi\/Surprise & Delight\/Definition of Read Input/);
  assert.doesNotMatch(executionActionsStorySource, /The most critical moment in the engi experience|Engi\/Surprise/u);
  assert.doesNotMatch(errorRecoveryGraceStorySource, /Engi\/Surprise & Delight\/Error Recovery Grace/);
  assert.doesNotMatch(patternMemoryStorySource, /Engi\/Surprise & Delight\/Memory Manifestation/);
  assert.doesNotMatch(pipelinePhasePoetryStorySource, /Engi\/Surprise & Delight\/Pipeline Phase Poetry/);
  assert.doesNotMatch(conversationsCompleteSystemStorySource, /Engi\/Surprise & Delight|Engi Transaction Workspace/u);
  assert.doesNotMatch(btdInvestmentExperienceStorySource, /Engi\/Surprise & Delight\/Credit Investment Experience/);
  assert.doesNotMatch(marketingBtdInvestmentExperienceSource, /credit-investment-experience/);
  assert.doesNotMatch(nextConfigSource, /\/orbitals\/credits/);
  assert.doesNotMatch(intelligentProcessingIndicatorStorySource, /Engi\/Surprise & Delight\/Intelligent Processing Indicator/);
  assert.doesNotMatch(userAccountOrbitalStorySource, /Engi Engineer/);
  assert.doesNotMatch(markdownElementsStorySource, /Hello, Engi!/);
  assert.doesNotMatch(markdownElementsStorySource, /Engi Website/);

  assert.match(chatgptAppPackageSource, /Bitcode ChatGPT App MCP server scaffolding/);
  assert.match(chatgptAppReadmeSource, /Bitcode’s ChatGPT App MCP package/);
  assert.match(chatgptAppReadmeSource, /Why Bitcode/);
  assert.match(chatgptAppReadmeSource, /“Bitcode, where do we validate Yapper posts before save\?”/);
  assert.match(chatgptAppDemoSource, /showcases Bitcode building the fictitious social media app/);
  assert.match(chatgptAppDemoSource, /Bitcode Reply Outline/);
  assert.match(chatgptAppDemoSource, /bitcode-demo/);
  assert.match(chatgptAppDemoSource, /team_bitcode/);
  assert.match(chatgptAppDemoSource, /bitcode-yapper-demo/);
  assert.match(chatgptAppTldrSource, /# TLDR — Bitcode ChatGPT App/);
  assert.match(chatgptAppTodoSource, /# TODO — Bitcode ChatGPT App/);
  assert.match(chatgptAppEnvSource, /BITCODE_REPO_ROOT/);
  assert.match(chatgptAppEnvSource, /BITCODE_MOCK_EXA/);
  assert.match(chatgptAppEnvSource, /__BITCODE_CHATGPTAPP_ENV_INITIALIZED__/);
  assert.match(chatgptAppYapperFlowTestSource, /bitcode-yapper/);
  assert.match(chatgptAppArtifactsMockSource, /mock:\/\/artifacts\//);
  assert.match(chatgptAppServerSource, /BitcodeMCPServer/);
  assert.match(chatgptAppServerSource, /bitcode-chatgpt-app/);
  assert.match(chatgptAppServerSource, /Unknown bitcode tool/);
  assert.match(chatgptAppIndexSource, /BitcodeMCPServer/);
  assert.match(chatgptAppToolsSource, /Bitcode ChatGPT App/);
  assert.match(chatgptAppToolsSource, /const repositoryName = args\.name \?\? `bitcode-\$\{Date\.now\(\)\}`/);
  assert.match(chatgptAppToolsSource, /team_bitcode/);
  assert.match(chatgptAppToolsSource, /builder@bitcode\.dev/);
  assert.doesNotMatch(chatgptAppPackageSource, /Engi ChatGPT App MCP server scaffolding/);
  assert.doesNotMatch(chatgptAppReadmeSource, /Engi’s ChatGPT App MCP package/);
  assert.doesNotMatch(chatgptAppReadmeSource, /Why Engi/);
  assert.doesNotMatch(chatgptAppDemoSource, /showcases Engi building the fictitious social media app/);
  assert.doesNotMatch(chatgptAppDemoSource, /Engi Reply Outline/);
  assert.doesNotMatch(chatgptAppDemoSource, /engi-demo/);
  assert.doesNotMatch(chatgptAppDemoSource, /team_engi/);
  assert.doesNotMatch(chatgptAppDemoSource, /engi-yapper-demo/);
  assert.doesNotMatch(chatgptAppTldrSource, /# TLDR — Engi ChatGPT App/);
  assert.doesNotMatch(chatgptAppTodoSource, /# TODO — Engi ChatGPT App/);
  assert.doesNotMatch(chatgptAppEnvSource, /ENGI_REPO_ROOT/);
  assert.doesNotMatch(chatgptAppEnvSource, /ENGI_MOCK_EXA/);
  assert.doesNotMatch(chatgptAppEnvSource, /__ENGI_CHATGPTAPP_ENV_INITIALIZED__/);
  assert.doesNotMatch(chatgptAppYapperFlowTestSource, /engi-yapper/);
  assert.doesNotMatch(chatgptAppServerSource, /EngiMCPServer/);
  assert.doesNotMatch(chatgptAppServerSource, /engi-chatgpt-app/);
  assert.doesNotMatch(chatgptAppServerSource, /Unknown engi tool/);
  assert.doesNotMatch(chatgptAppIndexSource, /EngiMCPServer/);
  assert.doesNotMatch(chatgptAppToolsSource, /Engi ChatGPT App/);
  assert.doesNotMatch(chatgptAppToolsSource, /name: args\.name \?\? `engi-\$\{Date\.now\(\)\}`/);
  assert.doesNotMatch(chatgptAppToolsSource, /team_engi/);
  assert.doesNotMatch(chatgptAppToolsSource, /builder@engi\.dev/);
  assert.equal(
    existsSync(new URL('../../packages/chatgptapp/src/types/engi__artifacts.d.ts', import.meta.url)),
    false,
  );
  assert.equal(
    existsSync(new URL('../../packages/chatgptapp/src/types/engi__digest__run.d.ts', import.meta.url)),
    false,
  );
  assert.equal(
    existsSync(new URL('../../packages/chatgptapp/src/types/engi__generic-tools-mcps-aws.d.ts', import.meta.url)),
    false,
  );
  assert.equal(
    existsSync(new URL('../../packages/chatgptapp/src/types/engi__generic-tools-mcps-vercel.d.ts', import.meta.url)),
    false,
  );
  assert.equal(
    existsSync(new URL('../../packages/chatgptapp/src/types/engi__generic-tools-simple-system-text-search.d.ts', import.meta.url)),
    false,
  );
  assert.equal(
    existsSync(new URL('../../packages/chatgptapp/src/types/engi__generic-tools-web-search.d.ts', import.meta.url)),
    false,
  );
  assert.equal(
    existsSync(new URL('../../packages/chatgptapp/src/types/engi__github.d.ts', import.meta.url)),
    false,
  );
  assert.equal(
    existsSync(new URL('../../packages/chatgptapp/src/types/engi__vcs.d.ts', import.meta.url)),
    false,
  );
  assert.equal(
    existsSync(new URL('../../packages/chatgptapp/src/types/bitcode__artifacts.d.ts', import.meta.url)),
    true,
  );
  assert.equal(
    existsSync(new URL('../../packages/chatgptapp/src/types/bitcode__digest__run.d.ts', import.meta.url)),
    true,
  );
  assert.equal(
    existsSync(new URL('../../packages/chatgptapp/src/types/bitcode__generic-tools-mcps-aws.d.ts', import.meta.url)),
    true,
  );
  assert.equal(
    existsSync(new URL('../../packages/chatgptapp/src/types/bitcode__generic-tools-mcps-vercel.d.ts', import.meta.url)),
    true,
  );
  assert.equal(
    existsSync(new URL('../../packages/chatgptapp/src/types/bitcode__generic-tools-simple-system-text-search.d.ts', import.meta.url)),
    true,
  );
  assert.equal(
    existsSync(new URL('../../packages/chatgptapp/src/types/bitcode__generic-tools-web-search.d.ts', import.meta.url)),
    true,
  );
  assert.equal(
    existsSync(new URL('../../packages/chatgptapp/src/types/bitcode__github.d.ts', import.meta.url)),
    false,
  );
  assert.equal(
    existsSync(new URL('../../packages/chatgptapp/src/types/bitcode__vcs.d.ts', import.meta.url)),
    false,
  );
  assert.equal(
    existsSync(new URL('../../packages/chatgptapp/src/__stubs__/github.ts', import.meta.url)),
    true,
  );
  assert.equal(
    existsSync(new URL('../../packages/chatgptapp/src/__stubs__/vcs.ts', import.meta.url)),
    true,
  );

  assert.match(emailPackageSource, /Email service for Bitcode team management and notifications/);
  assert.match(emailPackageSource, /engineeredsoftware\/bitcode\.git/);
  assert.match(emailReadmeSource, /Professional email service package for Bitcode team management and notifications/);
  assert.match(emailReadmeSource, /Internal Bitcode package/);
  assert.match(emailReadmeSource, /https:\/\/app\.bitcode\.example\/dashboard/);
  assert.match(emailReadmeSource, /NEXT_PUBLIC_APP_URL=https:\/\/app\.bitcode\.example/);
  assert.match(emailInvitationServiceSource, /join \$\{data\.organizationName\} on Bitcode/);
  assert.doesNotMatch(emailPackageSource, /Email service for Engi team management and notifications/);
  assert.doesNotMatch(emailPackageSource, /github\.com\/engi\/engi\.git/);
  assert.doesNotMatch(emailReadmeSource, /Professional email service package for Engi team management and notifications/);
  assert.doesNotMatch(emailReadmeSource, /Internal Engi package/);
  assert.doesNotMatch(emailReadmeSource, /app\.engi\.software/);
  assert.doesNotMatch(emailInvitationServiceSource, /join \$\{data\.organizationName\} on Engi/);

  assert.match(makefileSource, /Bitcode Makefile shortcuts/);
  assert.match(makefileSource, /\(db=bitcode user=postgres\)/);
  assert.match(rootPackageSource, /"name": "bitcode-monorepo"/);
  assert.match(rootPnpmLockSource, /eslint-plugin-bitcode:/);
  assert.match(rootPnpmLockSource, /link:packages\/eslint-plugin-bitcode/);
  assert.match(rootReadmeSource, /`\.bitcode\/`/);
  assert.match(rootReadmeSource, /\.bitcode\/conversations-continuity-proof\.json/);
  assert.match(rootProductSource, /# PRODUCT: BITCODE V26 COMMERCIAL SYSTEM/);
  assert.match(rootProductSource, /Auditable market infrastructure for technical knowledge exchange/);
  assert.match(rootProductSource, /V26 is the first commercial Bitcode promotion baseline/);
  assert.doesNotMatch(rootProductSource, /GLOBAL PHENOMENON|engineering intelligence market infrastructure/u);
  assert.match(webSearchProductionWorkflowSource, /https:\/\/staging\.bitcode\.ai/);
  assert.match(webSearchProductionWorkflowSource, /https:\/\/bitcode\.ai/);
  assert.match(terminalOperatorExperienceDocSource, /# Bitcode Terminal Operator Experience Notes/);
  assert.match(terminalOperatorExperienceDocSource, /Read review before fit search/);
  assert.match(terminalOperatorExperienceDocSource, /AssetPack output semantics/);
  assert.match(integrationsDocSource, /Bitcode provides integrations/);
  assert.match(conversationsDocSource, /# Bitcode Conversations Notes/);
  assert.match(conversationsDocSource, /same Exchange activity and execution model/);
  assert.match(apiDocSource, /# Bitcode API Notes/);
  assert.match(apiDocSource, /server-owned admission layer for Bitcode Exchange state/);
  assert.match(apiDocSource, /BITCODE_ENABLE_COMPUTER_USE_READ_MEASUREMENT/);
  assert.match(connectedServicesDocSource, /# Bitcode Connected Services Notes/);
  assert.match(connectedServicesDocSource, /delivery mechanisms attached to Bitcode Exchange state/);
  assert.match(docCodingSource, /export const BITCODE_IDENTITY: PromptPart = `You are Bitcode\.\.\.`;/);
  assert.match(promptSystemDocSource, /# Bitcode Prompt System Notes/);
  assert.match(promptSystemDocSource, /Read-Comprehension Pattern/);
  assert.match(llmRegistryDocSource, /BITCODE_LLM_PROVIDER=google/);
  assert.match(llmRegistryDocSource, /BITCODE_LLM_MODEL=gemini-2\.5-flash/);
  assert.match(llmRegistryDocSource, /BITCODE_LLM_PROVIDER=anthropic/);
  assert.match(llmRegistryDocSource, /BITCODE_LLM_MODEL=opus-4\.1/);
  assert.match(securityDocSource, /BITCODE_ENABLE_MCP_AWS/);
  assert.match(securityDocSource, /BITCODE_ENABLE_MCP_VERCEL/);
  assert.match(protocolThesisDocSource, /Bitcode is the source-to-shares protocol/);
  assert.match(protocolThesisDocSource, /From source, Bitcode measures Reads/);
  assert.match(terminologyDocSource, /^# Bitcode Terminology Guide/m);
  assert.match(terminologyDocSource, /precise terminology used in the Bitcode codebase/);
  assert.match(architecturePatternsDocSource, /Architectural Laws Of Bitcode/);
  assert.match(architecturePatternsDocSource, /primitive: reusable typed behavior/);
  assert.match(performanceDocSource, /Critical Performance Patterns in Bitcode/);
  assert.match(performanceDocSource, /Auxillary Performance/);
  assert.match(verificationDocSource, /# Bitcode Verification Notes/);
  assert.match(verificationDocSource, /Read review and fit review tests/);
  assert.match(uapiArchitectureDocSource, /main API and web terminal layer for Bitcode/);
  assert.doesNotMatch(rootTsconfigSource, /measureEngi/);
  assert.doesNotMatch(uapiTsconfigSource, /measureEngi/);
  assert.match(startBitcodeMcpScriptSource, /BITCODE_LOG_STDOUT/);
  assert.match(phase2CompleteScriptSource, /Moving at Bitcode velocity!/);
  assert.match(phase2CompleteScriptSource, /PACKAGES_PATH=/);
  assert.match(phase2CompleteScriptSource, /dirname "\$0"/);
  assert.match(phase2CompleteScriptSource, /pwd\)\/packages"/);
  assert.match(phase2NamingComplianceScriptSource, /Bitcode Excellence - prompt-system cleanup freedom/);
  assert.match(phase2NamingComplianceScriptSource, /PACKAGES_PATH = REPO_ROOT \/ "packages"/);
  assert.match(phase2NamingComplianceScriptSource, /Bitcode Excellence Mode Activated!/);
  assert.match(userDeletionFunctionSource, /garrettmaring@bitcode\.dev/);
  assert.match(verifyAssetPackQualityScriptSource, /@bitcode\\\/prompts\\\/raw_promptparts/);
  assert.match(updateAssetPackStorageTableNamesScriptSource, /repo_root="\$\(cd "\$\(dirname "\$\{BASH_SOURCE\[0\]\}"\)\/\.\."/);
  assert.match(updateAssetPackStorageTableNamesScriptSource, /deliverable_pipeline_runs/);
  assert.match(updateAssetPackAgentsScriptSource, /retained AssetPack pipeline agents/);
  assert.match(updateAssetPackAgentsScriptSource, /repo_root="\$\(cd "\$\(dirname "\$\{BASH_SOURCE\[0\]\}"\)\/\.\."/);
  assert.match(promptAuditScriptSource, /ASSET-PACK PIPELINE PROMPT AUDIT/);
  assert.match(promptAuditScriptSource, /packages\/prompts\/src\/raw_promptparts\/specific/);
  assert.match(promptAuditScriptSource, /"comprehendread"/);
  assert.match(generateAssetPackPromptPartsTsSource, /raw_promptparts\/specific/);
  assert.match(generateAssetPackPromptPartsTsSource, /Comprehend Read/);
  assert.match(generateAssetPackPromptPartsTsSource, /AssetPack metadata/);
  assert.match(fixExecutionToDirectivesScriptSource, /try_execution PromptParts to try_directives/);
  assert.match(fixExecutionToDirectivesScriptSource, /packages\/prompts\/src\/raw_promptparts\/specific/);
  assert.match(verifyPromptExportsScriptSource, /raw PromptPart exports/);
  assert.match(verifyPromptExportsScriptSource, /packages\/prompts\/src\/raw_promptparts/);
  assert.match(cleanupRemainingDocsScriptSource, /remaining outdated Bitcode documentation files/);
  assert.match(cleanupRemainingDocsScriptSource, /BITCODE_FINAL_VERIFICATION_REPORT\.md/);
  assert.match(cleanupOutdatedDocsScriptSource, /outdated Bitcode documentation files/);
  assert.match(cleanupOutdatedDocsScriptSource, /BITCODE_EVOLUTIONARY_EXCELLENCE\.md/);
  assert.match(cleanupOutdatedDocsShellScriptSource, /outdated Bitcode documentation files/);
  assert.match(cleanupOutdatedDocsShellScriptSource, /BITCODE_EVOLUTIONARY_EXCELLENCE\.md/);
  assert.match(fixRemainingImportsScriptSource, /public @bitcode\/prompts/);
  assert.match(fixRemainingImportsScriptSource, /current raw_promptparts subpaths/);
  assert.match(fixBarrelImportsScriptSource, /public\s+# @bitcode\/prompts boundary/);
  assert.match(fixBarrelImportsScriptSource, /@bitcode\/prompts\/raw_promptparts\/\(generic\|specific\)/);
  assert.match(fixMultilineImportsScriptSource, /@bitcode\/prompts\/src\/raw_promptparts\/specific/);
  assert.match(fixCorruptedImportsScriptSource, /public @bitcode\/prompts carrier/);
  assert.match(generateMassivePromptPartsScriptSource, /Bitcode PromptPart generator/);
  assert.match(generateMassivePromptPartsScriptSource, /raw_promptparts\/generic/);
  assert.match(generateMassivePromptPartsScriptSource, /promptpart_generic_/);
  assert.match(massUpdatePromptPartsScriptSource, /Bitcode PromptPart mass-update utility/);
  assert.match(massUpdatePromptPartsScriptSource, /raw_promptparts\/generic/);
  assert.match(massUpdatePromptPartsScriptSource, /@bitcode\/prompts\/raw_promptparts\/generic/);
  assert.match(codemodDeepPromptpartsScriptSource, /@bitcode\\\/prompts/);
  assert.match(normalizeAssetPackPromptpartsScriptSource, /@bitcode\\\/prompts\\\/raw_promptparts/);
  assert.match(architectureReviewScriptSource, /raw_promptparts\/generic/);
  assert.match(architectureReviewScriptSource, /Bitcode V26 architecture review/);
  assert.match(architectureReviewScriptSource, /inference-system corridors/);
  assert.match(architectureReviewScriptSource, /Doc-comment and tool prompt injection bridge/);
  assert.match(generateToolJsdocScriptSource, /Bitcode tool prompt documentation generator/);
  assert.match(generateToolJsdocScriptSource, /support script generates doc-code tool comments/);
  assert.match(generateToolJsdocScriptSource, /asset-pack effect/);
  assert.match(codeRefactorToolSource, /Bitcode code-refactor tool adapters/);
  assert.match(codeRefactorToolSource, /support infrastructure for agentic Bitcode runs/);
  assert.match(codeRefactorToolSource, /asset-pack outputs remain the canonical product/);
  assert.match(baseReviewScriptSource, /BITCODE PROMPT PRIMITIVES EVOLUTION REVIEW RESULTS/);
  assert.match(baseReviewScriptSource, /\/tmp\/bitcode_review_/);
  assert.match(baseReviewScriptSource, /🚀 BITCODE CODE REVIEW SYSTEM/);
  assert.match(codeReviewReadmeSource, /# 🔍 BITCODE CODE REVIEW FRAMEWORK/);
  assert.match(bitcodeChecklistSource, /Developer\/ENGI\/protocol-demonstration/);
  assert.match(bitcodeChecklistSource, /Make Bitcode branch/);
  assert.match(bitcodeChecklistSource, /BITCODE-auth-issuer-rollback/);
  assert.match(bitcodeChecklistSource, /make-bitcode-branch gold path works end-to-end/);
  assert.match(bitcodeScriptSource, /current Bitcode V8 deterministic prototype/);
  assert.match(bitcodeScriptSource, /Bitcode measures a GitHub-bound engineering read/);
  assert.match(bitcodeScriptSource, /behavior for Bitcode Spec V8/);
  assert.match(bitcodeScriptSource, /Bitcode turns technical knowledge into a measurable, governable, inspectable remediation pipeline/);
  assert.match(bitcodeScriptSource, /click \*\*Make Bitcode branch\*\*/);
  assert.match(bitcodeScriptShortSource, /# Bitcode Demo Script — Short Version \(Spec V8\)/);
  assert.match(bitcodeScriptShortSource, /This demo shows Bitcode as a Spec V8 deterministic prototype/);
  assert.match(bitcodeScriptShortSource, /click \*\*Make Bitcode branch\*\*/);
  assert.match(specV6GapAnalysisSource, /\*\*Spec V6:\*\* the primary CTA is \*\*Make Bitcode branch\*\*/);
  assert.match(specV6GapAnalysisSource, /`POST \/api\/make-bitcode-branch`/);
  assert.match(specV6CoverageMatrixSource, /# Bitcode Spec V6 Coverage Matrix/);
  assert.match(specV6CoverageMatrixSource, /Developer\/ENGI\/protocol-demonstration/);
  assert.match(specV6CoverageMatrixSource, /Buyer UX: Make Bitcode branch/);
  assert.match(specV6CoverageMatrixSource, /The UI\/API primary action is now “Make Bitcode branch,”/);
  assert.match(architectureMapSource, /# Bitcode Demo Architecture Map/);
  assert.match(architectureMapSource, /Bitcode demo package before the Spec V6 refactor/);
  assert.match(architectureMapSource, /Make Bitcode branch buyer UX/);
  assert.match(reviewExcellenceGuideSource, /existing Bitcode patterns/);
  assert.match(reviewPromptPrimitivesEvolutionSource, /promptpart_specific_tool_multimodalprocessing_doccodetoolcapabilities/);
  assert.match(reviewPromptPrimitivesEvolutionSource, /promptpart_generic_agent_system_capabilities/);
  assert.match(reviewPromptPrimitivesEvolutionSource, /Bitcode's 5-year development philosophy/);
  assert.match(reviewPromptPrimitivesEvolutionStdoutSource, /BITCODE PROMPT PRIMITIVES EVOLUTION REVIEW RESULTS/);
  assert.match(reviewPromptPrimitivesEvolutionStdoutSource, /promptpart_specific_tool_websearch_doccodetoolcapabilities/);
  assert.match(eslintPluginBitcodePackageSource, /"name": "eslint-plugin-bitcode"/);
  assert.match(eslintPluginBitcodeDocSource, /eslint-plugin-bitcode/);
  assert.match(eslintPluginBitcodeDocSource, /plugins: \['bitcode'\]/);
  assert.match(eslintPluginBitcodeDocSource, /bitcode\/no-write-tools-outside-implementation/);
  assert.match(rootEslintConfigSource, /plugins: \['@typescript-eslint', 'bitcode', 'react'\]/);
  assert.match(rootEslintConfigSource, /'bitcode\/no-write-tools-outside-implementation': 'error'/);
  assert.match(rootEslintConfigSource, /'bitcode\/require-prompt-hierarchy': 'error'/);
  assert.doesNotMatch(makefileSource, /Engi Makefile shortcuts/);
  assert.doesNotMatch(makefileSource, /\bdb=engi\b/);
  assert.doesNotMatch(makefileSource, /POSTGRES_DB=engi/);
  assert.doesNotMatch(rootPackageSource, /"name": "engi-monorepo"/);
  assert.doesNotMatch(rootPackageSource, /eslint-plugin-engi/);
  assert.doesNotMatch(rootEslintConfigSource, /plugins: \['@typescript-eslint', 'engi', 'react'\]/);
  assert.doesNotMatch(rootEslintConfigSource, /'engi\/no-write-tools-outside-implementation': 'error'/);
  assert.doesNotMatch(rootEslintConfigSource, /'engi\/require-prompt-hierarchy': 'error'/);
  assert.doesNotMatch(rootPackageSource, /start-engi-mcp/);
  assert.doesNotMatch(rootPnpmLockSource, /eslint-plugin-engi:/);
  assert.doesNotMatch(rootPnpmLockSource, /link:packages\/eslint-plugin-engi/);
  assert.doesNotMatch(rootReadmeSource, /`\.engi\/`/);
  assert.doesNotMatch(rootReadmeSource, /\.engi\/conversations-continuity-proof\.json/);
  assert.doesNotMatch(rootProductSource, /PRODUCT: ENGI/);
  assert.doesNotMatch(rootProductSource, /\bEngi is not a tool\b/);
  assert.doesNotMatch(webSearchProductionWorkflowSource, /https:\/\/staging\.engi\.com/);
  assert.doesNotMatch(webSearchProductionWorkflowSource, /https:\/\/engi\.com/);
  assert.doesNotMatch(terminalOperatorExperienceDocSource, /\bEngi\b/);
  assert.doesNotMatch(terminalOperatorExperienceDocSource, /engi-avatars/);
  assert.doesNotMatch(terminalOperatorExperienceDocSource, /\/Users\/g\/Developer\/engi\/engi/);
  assert.doesNotMatch(integrationsDocSource, /\bEngi\b/);
  assert.doesNotMatch(conversationsDocSource, /\bEngi\b/);
  assert.doesNotMatch(apiDocSource, /\bEngi\b/);
  assert.doesNotMatch(apiDocSource, /\$ENGI\b/);
  assert.doesNotMatch(apiDocSource, /repoOwner: 'engi-software'/);
  assert.doesNotMatch(connectedServicesDocSource, /route-with-engi-mocks/);
  assert.doesNotMatch(docCodingSource, /\bENGI_IDENTITY\b/);
  assert.doesNotMatch(docCodingSource, /You are Engi/);
  assert.doesNotMatch(promptSystemDocSource, /promptpart_specific_system_engisystem_inherentknowledgeidentity_opener\.ts/);
  assert.doesNotMatch(promptSystemDocSource, /You are Engi, an advanced AI engineering system/);
  assert.doesNotMatch(llmRegistryDocSource, /ENGI_LLM_PROVIDER/);
  assert.doesNotMatch(llmRegistryDocSource, /ENGI_LLM_MODEL/);
  assert.doesNotMatch(securityDocSource, /ENGI_ENABLE_MCP_AWS/);
  assert.doesNotMatch(securityDocSource, /ENGI_ENABLE_MCP_VERCEL/);
  assert.doesNotMatch(protocolThesisDocSource, /const ENGI_THESIS: PromptPart = `/);
  assert.doesNotMatch(protocolThesisDocSource, /From capability, Engi\./);
  assert.doesNotMatch(terminologyDocSource, /^# Engi Terminology Guide/m);
  assert.doesNotMatch(architecturePatternsDocSource, /Architectural Laws of Engi/);
  assert.doesNotMatch(performanceDocSource, /Critical Performance Patterns in Engi/);
  assert.doesNotMatch(verificationDocSource, /explains the Engi test architecture across layers/);
  assert.doesNotMatch(uapiArchitectureDocSource, /main API and web terminal layer for Engi/);
  assert.doesNotMatch(bitcodeV10PrepMemoSource, /engi-demo\//);
  assert.doesNotMatch(bitcodeV10PrepMemoSource, /ENGI_V10_PREP_MEMO\.md/);
  assert.doesNotMatch(bitcodeV10PrepMemoSource, /ENGI_SPEC\.txt/);
  assert.doesNotMatch(bitcodeV11PrepMemoSource, /engi-demo\//);
  assert.doesNotMatch(bitcodeV11PrepMemoSource, /ENGI_V11_PREP_MEMO\.md/);
  assert.doesNotMatch(bitcodeV11PrepMemoSource, /ENGI system authority/);
  assert.doesNotMatch(bitcodeV11PrepMemoSource, /ENGI_SPEC\.txt/);
  assert.doesNotMatch(deploymentDocSource, /required to deploy Engi/);
  assert.doesNotMatch(deploymentDocSource, /support@engi\.ai/);
  assert.doesNotMatch(consolidatedSystemGuideSource, /transforms Engi's styling/);
  assert.doesNotMatch(webSearchEnhancedResearchExampleSource, /Engi web research system/);
  assert.doesNotMatch(startBitcodeMcpScriptSource, /ENGI_LOG_STDOUT/);
  assert.doesNotMatch(phase2CompleteScriptSource, /Engi velocity/);
  assert.doesNotMatch(phase2CompleteScriptSource, /Developer\/engi\/engi\/packages/);
  assert.doesNotMatch(phase2NamingComplianceScriptSource, /Engi Excellence - Pre-1.0 freedom!/);
  assert.doesNotMatch(phase2NamingComplianceScriptSource, /Developer\/engi\/engi\/packages/);
  assert.doesNotMatch(phase2NamingComplianceScriptSource, /Engi Excellence Mode Activated!/);
  assert.doesNotMatch(userDeletionFunctionSource, /garrettmaring@engi\.software/);
  assert.doesNotMatch(verifyAssetPackQualityScriptSource, /@engi\\\/prompts\\\/raw_promptparts/);
  assert.doesNotMatch(updateAssetPackStorageTableNamesScriptSource, /Developer\/engi\/engi/);
  assert.doesNotMatch(updateAssetPackAgentsScriptSource, /Developer\/engi\/engi/);
  assert.doesNotMatch(promptAuditScriptSource, /prompts\/src\/raw\/specific/);
  assert.doesNotMatch(promptAuditScriptSource, /"comprehendtask"/);
  assert.doesNotMatch(generateAssetPackPromptPartsTsSource, /comprehendtask/);
  assert.doesNotMatch(generateAssetPackPromptPartsTsSource, /packages\/prompts\/src\/raw\/specific/);
  assert.doesNotMatch(fixExecutionToDirectivesScriptSource, /packages\/prompts\/src\/raw\/specific/);
  assert.doesNotMatch(verifyPromptExportsScriptSource, /Developer\/engi\/engi/);
  assert.doesNotMatch(verifyPromptExportsScriptSource, /prompts\/src\/raw"/);
  assert.doesNotMatch(cleanupRemainingDocsScriptSource, /ENGI_FINAL_VERIFICATION_REPORT\.md/);
  assert.doesNotMatch(cleanupRemainingDocsScriptSource, /remaining outdated documentation files/);
  assert.doesNotMatch(cleanupOutdatedDocsScriptSource, /ENGI_EVOLUTIONARY_EXCELLENCE\.md/);
  assert.doesNotMatch(cleanupOutdatedDocsScriptSource, /Clean up outdated documentation files\./);
  assert.doesNotMatch(cleanupOutdatedDocsShellScriptSource, /ENGI_EVOLUTIONARY_EXCELLENCE\.md/);
  assert.doesNotMatch(cleanupOutdatedDocsShellScriptSource, /Cleaning up outdated documentation files\.\.\./);
  assert.doesNotMatch(fixRemainingImportsScriptSource, /@engi\\\/prompts/);
  assert.doesNotMatch(fixRemainingImportsScriptSource, /sed -i ''/);
  assert.doesNotMatch(fixBarrelImportsScriptSource, /@engi\\\/prompts\\\/raw_promptparts\\\/generic/);
  assert.doesNotMatch(fixBarrelImportsScriptSource, /sed -i ''/);
  assert.doesNotMatch(fixMultilineImportsScriptSource, /@engi\\\/prompts/);
  assert.doesNotMatch(fixMultilineImportsScriptSource, /sed -i ''/);
  assert.doesNotMatch(fixCorruptedImportsScriptSource, /@engi\\\/prompts/);
  assert.doesNotMatch(fixCorruptedImportsScriptSource, /sed -i ''/);
  assert.doesNotMatch(generateMassivePromptPartsScriptSource, /\bENGI\b/);
  assert.doesNotMatch(generateMassivePromptPartsScriptSource, /packages\/prompts\/src\/raw\/generic/);
  assert.doesNotMatch(generateMassivePromptPartsScriptSource, /packages\/prompts\/src\/raw\/specific/);
  assert.doesNotMatch(massUpdatePromptPartsScriptSource, /\bENGI\b/);
  assert.doesNotMatch(massUpdatePromptPartsScriptSource, /packages\/prompts\/src\/raw\/generic/);
  assert.doesNotMatch(massUpdatePromptPartsScriptSource, /packages\/prompts\/src\/raw\/specific/);
  assert.doesNotMatch(codemodDeepPromptpartsScriptSource, /@engi\/prompts/);
  assert.doesNotMatch(normalizeAssetPackPromptpartsScriptSource, /@engi\/prompts/);
  assert.doesNotMatch(architectureReviewScriptSource, /packages\/prompts\/src\/raw\/generic/);
  assert.doesNotMatch(architectureReviewScriptSource, new RegExp('Steve ' + 'Wozniak'));
  assert.doesNotMatch(architectureReviewScriptSource, /packages\/metadevelopment\/src\/tool-class/);
  assert.doesNotMatch(architectureReviewScriptSource, /text-editor-tool\.ts/);
  assert.doesNotMatch(generateToolJsdocScriptSource, new RegExp('Steve ' + 'Wozniak'));
  assert.doesNotMatch(generateToolJsdocScriptSource, new RegExp('copy' + '-paste'));
  assert.doesNotMatch(codeRefactorToolSource, new RegExp('Steve ' + 'Wozniak'));
  assert.doesNotMatch(codeRefactorToolSource, new RegExp('Maximum ' + 'elegance'));
  assert.doesNotMatch(baseReviewScriptSource, /ENGI PROMPT PRIMITIVES EVOLUTION REVIEW RESULTS/);
  assert.doesNotMatch(baseReviewScriptSource, /\/tmp\/engi_review_/);
  assert.doesNotMatch(baseReviewScriptSource, /🚀 ENGI CODE REVIEW SYSTEM/);
  assert.doesNotMatch(codeReviewReadmeSource, /# 🔍 ENGI CODE REVIEW FRAMEWORK/);
  assert.doesNotMatch(bitcodeChecklistSource, /Developer\/ENGI\/engi-demo/);
  assert.doesNotMatch(bitcodeChecklistSource, /Make ENGI branch/);
  assert.doesNotMatch(bitcodeChecklistSource, /ENGI-auth-issuer-rollback/);
  assert.doesNotMatch(bitcodeChecklistSource, /make-ENGI-branch gold path works end-to-end/);
  assert.doesNotMatch(bitcodeScriptSource, /\bENGI\b/);
  assert.doesNotMatch(bitcodeScriptShortSource, /\bENGI\b/);
  assert.doesNotMatch(specV6GapAnalysisSource, /Make ENGI branch/);
  assert.doesNotMatch(specV6GapAnalysisSource, /make-engi-branch/);
  assert.doesNotMatch(specV6CoverageMatrixSource, /# ENGI Spec V6 Coverage Matrix/);
  assert.doesNotMatch(specV6CoverageMatrixSource, /Developer\/ENGI\/engi-demo/);
  assert.doesNotMatch(specV6CoverageMatrixSource, /Buyer UX: Make ENGI branch/);
  assert.doesNotMatch(specV6CoverageMatrixSource, /The UI\/API primary action is now “Make ENGI branch,”/);
  assert.doesNotMatch(specV7CoverageMatrixSource, /# ENGI Spec V7 Coverage Matrix/);
  assert.match(specV8CoverageMatrixSource, /Historical spec target: legacy V8/);
  assert.match(specV8CoverageMatrixSource, /Historical root pointer at authoring time: `V8`/);
  assert.doesNotMatch(specV8CoverageMatrixSource, /Spec target: ENGI V8/);
  assert.doesNotMatch(specV8CoverageMatrixSource, /ENGI_SPEC\.txt/);
  assert.doesNotMatch(specV8CoverageMatrixSource, /ENGI spec-versioning convention/);
  assert.doesNotMatch(specV9ImplementationMatrixSource, /translate `ENGI_SPEC_V9\.md` into concrete repo work/);
  assert.doesNotMatch(specV9ImplementationMatrixSource, /\/api\/make-engi-branch/);
  assert.doesNotMatch(specV9ImplementationMatrixSource, /ENGI_SPEC\.txt/);
  assert.doesNotMatch(specV10ImplementationMatrixSource, /ENGI_SPEC\.txt/);
  assert.doesNotMatch(specV11ImplementationMatrixSource, /ENGI_SPEC\.txt/);
  assert.doesNotMatch(specV12ImplementationMatrixSource, /ENGI_SPEC\.txt/);
  assert.doesNotMatch(specV13ImplementationMatrixSource, /ENGI_SPEC\.txt/);
  assert.match(specV14ImplementationMatrixSource, /Historical root pointer at authoring time: `V14`/);
  assert.match(specV14ImplementationMatrixSource, /whole-Bitcode coverage expectations/);
  assert.doesNotMatch(specV14ImplementationMatrixSource, /ENGI_SPEC\.txt = V14/);
  assert.doesNotMatch(specV14ImplementationMatrixSource, /whole-ENGI coverage expectations/);
  assert.doesNotMatch(specV14ImplementationMatrixSource, /redesigning ENGI/);
  assert.doesNotMatch(specV15ImplementationMatrixSource, /canonical ENGI system/);
  assert.doesNotMatch(bitcodeDemoSpecV15Source, /Developer\/ENGI\/engi-demo/);
  assert.doesNotMatch(architectureMapSource, /\bENGI\b/);
  assert.doesNotMatch(architectureMapSource, /engi-demo\//);
  assert.doesNotMatch(reviewExcellenceGuideSource, /existing Engi patterns/);
  assert.doesNotMatch(reviewPromptPrimitivesEvolutionSource, /engi_specific_prompt_tool_/);
  assert.doesNotMatch(reviewPromptPrimitivesEvolutionSource, /Engi's 5-year development philosophy/);
  assert.doesNotMatch(reviewPromptPrimitivesEvolutionStdoutSource, /ENGI PROMPT PRIMITIVES EVOLUTION REVIEW RESULTS/);
  assert.doesNotMatch(reviewPromptPrimitivesEvolutionStdoutSource, /engi_specific_prompt_tool_/);
  assert.doesNotMatch(reviewPromptPrimitivesEvolutionStdoutSource, /Engi's 5-year philosophy/);
  assert.doesNotMatch(eslintPluginBitcodePackageSource, /eslint-plugin-engi/);
  assert.doesNotMatch(eslintPluginBitcodeDocSource, /\bEngi\b/);
  assert.doesNotMatch(eslintPluginBitcodeDocSource, /plugins: \['engi'\]/);
  assert.doesNotMatch(eslintPluginBitcodeDocSource, /engi\/no-write-tools-outside-implementation/);

  assert.match(conversationsOpenApiSource, /name: Bitcode API Support/);
  assert.match(conversationsOpenApiSource, /docs\.bitcode\.example/);
  assert.match(conversationsOpenApiSource, /api-support@bitcode\.example/);
  assert.match(conversationsOpenApiSource, /https:\/\/api\.bitcode\.example/);
  assert.match(conversationsOpenApiSource, /Hello Bitcode, how can you help me\?/);
  assert.doesNotMatch(conversationsOpenApiSource, /Engi API Support/);
  assert.doesNotMatch(conversationsOpenApiSource, /docs\.engi\.dev/);
  assert.doesNotMatch(conversationsOpenApiSource, /api-support@engi\.dev/);
  assert.doesNotMatch(conversationsOpenApiSource, /https:\/\/api\.engi\.dev/);
  assert.doesNotMatch(conversationsOpenApiSource, /Hello Engi/);

  assert.match(auxillariesReadinessDocSource, /# Bitcode Auxillaries Readiness Notes/);
  assert.match(auxillariesReadinessDocSource, /completedPanes/);
  assert.match(auxillariesReadinessDocSource, /currentPane/);
  assert.match(auxillariesReadinessDocSource, /AuxillariesProfilePane/);
  assert.match(auxillariesReadinessDocSource, /AuxillariesConnectsPane/);
  assert.match(auxillariesReadinessDocSource, /AuxillariesInterfacesPane/);
  assert.match(auxillariesReadinessDocSource, /AuxillariesBTDPane/);
  assert.doesNotMatch(auxillariesReadinessDocSource, /# User Onboarding and Authentication/);
  assert.doesNotMatch(auxillariesReadinessDocSource, /OrbitalsCreditsPane/);
  assert.doesNotMatch(auxillariesReadinessDocSource, /OrbitalsModelsPane/);
  assert.doesNotMatch(auxillariesReadinessDocSource, /OrbitalsProfilePane/);
  assert.doesNotMatch(auxillariesReadinessDocSource, /OrbitalsConnectsPane/);
  assert.doesNotMatch(auxillariesReadinessDocSource, /Engi uses Supabase Auth/);

  assert.match(frontendArchitectureDocSource, /# Bitcode Frontend Architecture Notes/);
  assert.match(frontendArchitectureDocSource, /Bitcode Terminal at `\/terminal`/);
  assert.match(frontendArchitectureDocSource, /Auxillaries/);
  assert.match(frontendArchitectureDocSource, /Transactions/);
  assert.doesNotMatch(frontendArchitectureDocSource, /The Engi app consists of three core experience categories/);
  assert.doesNotMatch(frontendArchitectureDocSource, /### 2\. Orbitals/);

  assert.match(databaseDocSource, /# Bitcode Exchange Database Notes/);
  assert.match(databaseDocSource, /Exchange State Requirements/);
  assert.doesNotMatch(databaseDocSource, /# Engi V26 Database Architecture/);
  assert.doesNotMatch(databaseDocSource, /The Engi V26 database schema/);

  assert.match(productGuideSource, /# Bitcode V26 Product Guide/);
  assert.match(productGuideSource, /Activity compatibility page lives under `\/executions`/);
  assert.match(productGuideSource, /Transactions write-space lives under `\/terminal`/);
  assert.match(productGuideSource, /Auxillaries live under `\/auxillaries\/\*`/);
  assert.doesNotMatch(productGuideSource, /# Engi V26 Product Guide/);

  assert.match(uapiEnvExampleSource, /one Bitcode `?\$BTD`? unit/);
  assert.doesNotMatch(uapiEnvExampleSource, /one Engi credit/);

  assert.match(loggerPackageSource, /Shared logging utilities for the Bitcode monorepo/);
  assert.match(loggerTsSource, /BITCODE_LOG_TO_FILE/);
  assert.match(loggerTsSource, /BITCODE_LOG_STDOUT/);
  assert.match(loggerTsSource, /BITCODE_LOG_SYNC_S3/);
  assert.match(loggerTsSource, /BITCODE_ENV/);
  assert.match(loggerTsSource, /BITCODE_WRITE_PROMPT_IO/);
  assert.match(loggerTsSource, /BITCODE_WRITE_STEP_TRACES/);
  assert.match(loggerTsSource, /\.bitcode_logs/);
  assert.match(loggerTsSource, /bitcode\.log/);
  assert.match(loggerTsSource, /__bitcodeLogSync/);
  assert.match(loggerJsSource, /BITCODE_LOG_TO_FILE/);
  assert.match(loggerJsSource, /BITCODE_LOG_STDOUT/);
  assert.match(loggerJsSource, /BITCODE_LOG_SYNC_S3/);
  assert.match(loggerJsSource, /BITCODE_ENV/);
  assert.match(loggerJsSource, /\.bitcode_logs/);
  assert.match(loggerJsSource, /bitcode\.log/);
  assert.doesNotMatch(loggerPackageSource, /Shared logging utilities for the Engi monorepo/);
  assert.doesNotMatch(loggerTsSource, /ENGI_LOG_TO_FILE/);
  assert.doesNotMatch(loggerTsSource, /ENGI_LOG_STDOUT/);
  assert.doesNotMatch(loggerTsSource, /ENGI_LOG_SYNC_S3/);
  assert.doesNotMatch(loggerTsSource, /ENGI_ENV/);
  assert.doesNotMatch(loggerTsSource, /ENGI_WRITE_PROMPT_IO/);
  assert.doesNotMatch(loggerTsSource, /ENGI_WRITE_STEP_TRACES/);
  assert.doesNotMatch(loggerTsSource, /\.engi_logs/);
  assert.doesNotMatch(loggerTsSource, /engi\.log/);
  assert.doesNotMatch(loggerTsSource, /__engiLogSync/);
  assert.doesNotMatch(loggerJsSource, /ENGI_LOG_TO_FILE/);
  assert.doesNotMatch(loggerJsSource, /ENGI_LOG_STDOUT/);
  assert.doesNotMatch(loggerJsSource, /ENGI_LOG_SYNC_S3/);
  assert.doesNotMatch(loggerJsSource, /ENGI_ENV/);
  assert.doesNotMatch(loggerJsSource, /\.engi_logs/);
  assert.doesNotMatch(loggerJsSource, /engi\.log/);

  assert.match(agentGenericsReadmeSource, /BITCODE_EXECUTION_DEBUG/);
  assert.match(agentGenericsReadmeSource, /BITCODE_LOG_TRACES=1/);
  assert.match(agentGenericsReadmeSource, /BITCODE_LOG_FULL_TRACES=1/);
  assert.match(agentGenericsReadmeSource, /BITCODE_LOG_FULL_PROMPTS=1/);
  assert.match(agentGenericsReadmeSource, /BITCODE_WRITE_PROMPT_IO=1/);
  assert.match(agentGenericsReadmeSource, /BITCODE_WRITE_STEP_TRACES=1/);
  assert.match(agentGenericsReadmeSource, /BITCODE_DEBUG_ONLY_PHASE/);
  assert.match(agentGenericsReadmeSource, /BITCODE_DEBUG_ONLY_AGENT/);
  assert.match(agentGenericsReadmeSource, /BITCODE_DEBUG_ONLY_STEP/);
  assert.match(agentGenericsReadmeSource, /BITCODE_DEBUG_ONLY_FAILSAFES/);
  assert.match(agentGenericsReadmeSource, /BITCODE_DEBUG_ONLY_GENERATIONS/);
  assert.match(agentGenericsReadmeSource, /Generated with Bitcode's Agent-Generics Framework/);
  assert.match(agentGenericsTldrSource, /BITCODE_LOG_TO_FILE=1/);
  assert.match(agentGenericsTldrSource, /BITCODE_DEBUG_REGISTRIES=1/);
  assert.match(agentGenericsTldrSource, /BITCODE_DEBUG_ONLY_PHASE/);
  assert.match(agentGenericsTldrSource, /BITCODE_DEBUG_ONLY_GENERATIONS/);
  assert.match(agentDiagnosticsConfigSource, /BITCODE_EXECUTION_DEBUG/);
  assert.match(agentDiagnosticsConfigSource, /BITCODE_LOG_TRACES/);
  assert.match(agentDiagnosticsConfigSource, /BITCODE_LOG_FULL_TRACES/);
  assert.match(agentDiagnosticsConfigSource, /BITCODE_LOG_FULL_PROMPTS/);
  assert.match(agentDiagnosticsConfigSource, /BITCODE_WRITE_PROMPT_IO/);
  assert.match(agentDiagnosticsConfigSource, /BITCODE_WRITE_STEP_TRACES/);
  assert.match(agentDiagnosticsConfigSource, /BITCODE_TRACE_MAX_SIZE/);
  assert.match(agentDiagnosticsInstrumentationSource, /BITCODE_LOG_DIAG_CONFIG/);
  assert.match(agentDiagnosticsInstrumentationSource, /BITCODE_WRITE_PROMPT_IO/);
  assert.match(agentDiagnosticsInstrumentationSource, /BITCODE_WRITE_STEP_TRACES/);
  assert.match(agentDiagnosticsInstrumentationSource, /BITCODE_LOG_TRACES/);
  assert.match(agentDiagnosticsInstrumentationSource, /BITCODE_EXECUTION_DEBUG/);
  assert.match(agentDiagnosticsInstrumentationSource, /BITCODE_DEBUG_STOP_AFTER_FIRST_REASON/);
  assert.match(agentDiagnosticsInstrumentationSource, /BITCODE_DEBUG_STOP_AGENT_FILTER/);
  assert.match(agentDiagnosticsInstrumentationSource, /BITCODE_DEBUG_STOP_AFTER_FIRST_STRUCTURED_OUTPUT/);
  assert.match(agentExecutionSource, /BITCODE_LLM_PROVIDER/);
  assert.match(agentExecutionSource, /BITCODE_LLM_MODEL/);
  assert.match(agentFactoriesSource, /BITCODE_DEBUG_ONLY_STEP/);
  assert.match(agentFactoriesSource, /BITCODE_DEBUG_ONLY_PHASE/);
  assert.match(agentFactoriesSource, /BITCODE_DEBUG_ONLY_AGENT/);
  assert.doesNotMatch(agentFactoriesSource, /BITCODE_DEBUG_STOP_AFTER_PLAN/);
  assert.match(agentThinkingsGenerationSource, /BITCODE_DEBUG_ONLY_GENERATIONS/);
  assert.match(agentFailsafeSequenceSource, /BITCODE_DEBUG_/);
  assert.match(agentSubstepsFactoriesSource, /BITCODE_LLM_ONE_SHOT/);
  assert.match(agentSubstepsFactoriesSource, /__BITCODE_DEBUG_STOP_AFTER_FIRST_REASON__/);
  assert.match(agentSubstepsFactoriesSource, /__BITCODE_DEBUG_STOP_AFTER_FIRST_STRUCTURED_OUTPUT__/);
  assert.match(agentNormalizeStepNameSource, /across Bitcode surfaces/);
  assert.doesNotMatch(agentGenericsReadmeSource, /ENGI_EXECUTION_DEBUG/);
  assert.doesNotMatch(agentGenericsReadmeSource, /ENGI_LOG_TRACES=1/);
  assert.doesNotMatch(agentGenericsReadmeSource, /ENGI_LOG_FULL_TRACES=1/);
  assert.doesNotMatch(agentGenericsReadmeSource, /ENGI_LOG_FULL_PROMPTS=1/);
  assert.doesNotMatch(agentGenericsReadmeSource, /ENGI_WRITE_PROMPT_IO=1/);
  assert.doesNotMatch(agentGenericsReadmeSource, /ENGI_WRITE_STEP_TRACES=1/);
  assert.doesNotMatch(agentGenericsReadmeSource, /ENGI_DEBUG_ONLY_PHASE/);
  assert.doesNotMatch(agentGenericsReadmeSource, /ENGI_DEBUG_ONLY_AGENT/);
  assert.doesNotMatch(agentGenericsReadmeSource, /ENGI_DEBUG_ONLY_STEP/);
  assert.doesNotMatch(agentGenericsReadmeSource, /ENGI_DEBUG_ONLY_FAILSAFES/);
  assert.doesNotMatch(agentGenericsReadmeSource, /ENGI_DEBUG_ONLY_GENERATIONS/);
  assert.doesNotMatch(agentGenericsReadmeSource, /Generated with Engi's Agent-Generics Framework/);
  assert.doesNotMatch(agentGenericsTldrSource, /ENGI_LOG_TO_FILE=1/);
  assert.doesNotMatch(agentGenericsTldrSource, /ENGI_DEBUG_REGISTRIES=1/);
  assert.doesNotMatch(agentGenericsTldrSource, /ENGI_DEBUG_ONLY_PHASE/);
  assert.doesNotMatch(agentGenericsTldrSource, /ENGI_DEBUG_ONLY_GENERATIONS/);
  assert.doesNotMatch(agentDiagnosticsConfigSource, /ENGI_EXECUTION_DEBUG/);
  assert.doesNotMatch(agentDiagnosticsConfigSource, /ENGI_LOG_TRACES/);
  assert.doesNotMatch(agentDiagnosticsConfigSource, /ENGI_LOG_FULL_TRACES/);
  assert.doesNotMatch(agentDiagnosticsConfigSource, /ENGI_LOG_FULL_PROMPTS/);
  assert.doesNotMatch(agentDiagnosticsConfigSource, /ENGI_WRITE_PROMPT_IO/);
  assert.doesNotMatch(agentDiagnosticsConfigSource, /ENGI_WRITE_STEP_TRACES/);
  assert.doesNotMatch(agentDiagnosticsConfigSource, /ENGI_TRACE_MAX_SIZE/);
  assert.doesNotMatch(agentDiagnosticsInstrumentationSource, /ENGI_LOG_DIAG_CONFIG/);
  assert.doesNotMatch(agentDiagnosticsInstrumentationSource, /ENGI_WRITE_PROMPT_IO/);
  assert.doesNotMatch(agentDiagnosticsInstrumentationSource, /ENGI_WRITE_STEP_TRACES/);
  assert.doesNotMatch(agentDiagnosticsInstrumentationSource, /ENGI_LOG_TRACES/);
  assert.doesNotMatch(agentDiagnosticsInstrumentationSource, /ENGI_EXECUTION_DEBUG/);
  assert.doesNotMatch(agentDiagnosticsInstrumentationSource, /ENGI_DEBUG_STOP_AFTER_FIRST_REASON/);
  assert.doesNotMatch(agentDiagnosticsInstrumentationSource, /ENGI_DEBUG_STOP_AGENT_FILTER/);
  assert.doesNotMatch(agentDiagnosticsInstrumentationSource, /ENGI_DEBUG_STOP_AFTER_FIRST_STRUCTURED_OUTPUT/);
  assert.doesNotMatch(agentExecutionSource, /ENGI_LLM_PROVIDER/);
  assert.doesNotMatch(agentExecutionSource, /ENGI_LLM_MODEL/);
  assert.doesNotMatch(agentFactoriesSource, /ENGI_DEBUG_STOP_AFTER_PLAN/);
  assert.doesNotMatch(agentFactoriesSource, /ENGI_DEBUG_ONLY_STEP/);
  assert.doesNotMatch(agentFactoriesSource, /ENGI_DEBUG_ONLY_PHASE/);
  assert.doesNotMatch(agentFactoriesSource, /ENGI_DEBUG_ONLY_AGENT/);
  assert.doesNotMatch(agentThinkingsGenerationSource, /ENGI_DEBUG_ONLY_GENERATIONS/);
  assert.doesNotMatch(agentFailsafeSequenceSource, /ENGI_DEBUG_/);
  assert.doesNotMatch(agentSubstepsFactoriesSource, /ENGI_LLM_ONE_SHOT/);
  assert.doesNotMatch(agentSubstepsFactoriesSource, /__ENGI_DEBUG_STOP_AFTER_FIRST_REASON__/);
  assert.doesNotMatch(agentSubstepsFactoriesSource, /__ENGI_DEBUG_STOP_AFTER_FIRST_STRUCTURED_OUTPUT__/);
  assert.doesNotMatch(agentNormalizeStepNameSource, /across Engi surfaces/);

  assert.match(deliverablePreprocessSource, /BITCODE_LLM_PROVIDER/);
  assert.match(deliverablePreprocessSource, /BITCODE_LLM_MODEL/);
  assert.match(deliverableBringupDemoSource, /BITCODE_DEBUG_ONLY_FAILSAFES/);
  assert.match(deliverableBringupDemoSource, /BITCODE_DEBUG_ONLY_GENERATIONS/);
  assert.match(deliverableMetricsTestSource, /BITCODE_DEBUG_ONLY_FAILSAFES/);
  assert.match(deliverableMetricsTestSource, /BITCODE_DEBUG_ONLY_GENERATIONS/);
  assert.match(deliverableSetupPlanAgentSource, /BITCODE_DEBUG_ONLY_FAILSAFES/);
  assert.match(deliverableSetupPlanAgentSource, /BITCODE_DEBUG_ONLY_GENERATIONS/);
  assert.match(deliverableCreatePullRequestAgentSource, /feature\/bitcode-change/);
  assert.match(parsingSource, /BITCODE_LOG_FULL_PROMPTS/);
  assert.match(assetPackNotificationsTestSource, /BITCODE_ENABLE_NOTIFICATIONS/);
  assert.doesNotMatch(deliverablePreprocessSource, /ENGI_LLM_PROVIDER/);
  assert.doesNotMatch(deliverablePreprocessSource, /ENGI_LLM_MODEL/);
  assert.doesNotMatch(deliverableBringupDemoSource, /ENGI_DEBUG_ONLY_FAILSAFES/);
  assert.doesNotMatch(deliverableBringupDemoSource, /ENGI_DEBUG_ONLY_GENERATIONS/);
  assert.doesNotMatch(deliverableMetricsTestSource, /ENGI_DEBUG_ONLY_FAILSAFES/);
  assert.doesNotMatch(deliverableMetricsTestSource, /ENGI_DEBUG_ONLY_GENERATIONS/);
  assert.doesNotMatch(deliverableSetupPlanAgentSource, /ENGI_DEBUG_ONLY_FAILSAFES/);
  assert.doesNotMatch(deliverableSetupPlanAgentSource, /ENGI_DEBUG_ONLY_GENERATIONS/);
  assert.doesNotMatch(deliverableCreatePullRequestAgentSource, /feature\/engi-change/);
  assert.doesNotMatch(parsingSource, /ENGI_LOG_FULL_PROMPTS/);
  assert.doesNotMatch(assetPackNotificationsTestSource, /ENGI_ENABLE_NOTIFICATIONS/);

  assert.match(vercelIndexSource, /vercel\.com\/bitcode\/yapper\/insights/);
  assert.match(vercelIndexSource, /bitcode-admin/);
  assert.match(vercelIndexSource, /admin\.bitcode\.dev/);
  assert.match(vercelIndexSource, /org: 'bitcode-demo'/);
  assert.match(vercelIndexSource, /team_bitcode/);
  assert.match(vercelIndexSource, /Bitcode Demo Org/);
  assert.match(vercelIndexSource, /Deployment requested via Bitcode ChatGPT App/);
  assert.match(vercelReadmeSource, /used by the Bitcode ChatGPT App/);
  assert.match(vercelReadmeSource, /team_bitcode/);
  assert.match(vercelReadmeSource, /Preview deploy triggered by Bitcode demo/);
  assert.doesNotMatch(vercelIndexSource, /vercel\.com\/engi\/yapper\/insights/);
  assert.doesNotMatch(vercelIndexSource, /engi-admin/);
  assert.doesNotMatch(vercelIndexSource, /admin\.engi\.dev/);
  assert.doesNotMatch(vercelIndexSource, /org: 'engi-demo'/);
  assert.doesNotMatch(vercelIndexSource, /team_engi/);
  assert.doesNotMatch(vercelIndexSource, /Engi Demo Org/);
  assert.doesNotMatch(vercelIndexSource, /Deployment requested via Engi ChatGPT App/);
  assert.doesNotMatch(vercelReadmeSource, /used by the Engi ChatGPT App/);
  assert.doesNotMatch(vercelReadmeSource, /team_engi/);
  assert.doesNotMatch(vercelReadmeSource, /Preview deploy triggered by Engi demo/);

  assert.match(genericRepositorySetupPackageSource, /Repository setup and analysis tools for Bitcode pipelines/);
  assert.match(genericRepositorySetupSource, /Bitcode's prompt primitives architecture/);
  assert.match(genericSimpleSystemTextSearchSource, /Bitcode repository-evidence search support/);
  assert.match(genericSimpleSystemTextSearchReadmeSource, /Bitcode repository-evidence search support/);
  assert.match(genericSimpleSystemTextSearchReadmeSource, /BitcodeRepositoryEvidenceSearchDocCodeToolPrompt/);
  assert.match(genericFilesMaintainingSource, /Bitcode written-asset file mutation support/);
  assert.match(genericFilesMaintainingSource, /proof-facing operation evidence/);
  assert.match(genericFilesMaintainingSource, /asset-pack synthesis runs/);
  assert.match(gitPackageManifestSource, /Bitcode Git operation bridge/);
  assert.match(gitPackageSource, /Git is retained in V26 as concrete repository-transport infrastructure/);
  assert.match(gitPackageReadmeSource, /Bitcode Git operation bridge/);
  assert.match(genericGitInteractorSource, /Bitcode's distributed version control intelligence/);
  assert.match(conversationsGenericsAgentSource, /PROMPTPART_SPECIFIC_AGENT_CONVERSATIONAGENT_IDENTITY_DEFINITION/);
  assert.doesNotMatch(conversationsGenericsAgentSource, /Bitcode conversational AI assistant/);
  assert.match(useConversationStreamSource, /@author Bitcode Team/);
  assert.match(lspIndexSource, /Bitcode static measurement/);
  assert.match(lspIndexSource, /Read\/AssetPack evidence/);
  assert.match(lspIndexSource, /Bitcode Read measurement/);
  assert.match(filesSecurityUtilsSource, /process\.env\.BITCODE_REPO_ROOT/);
  assert.match(genericLlmsGoogleSource, /BITCODE_LLM_ALLOW_MOCK/);
  assert.match(genericLlmsOpenAiSource, /BITCODE_LLM_ALLOW_MOCK/);
  assert.match(genericLlmsAnthropicSource, /BITCODE_LLM_ALLOW_MOCK/);
  assert.match(genericLlmsRegistryTestSource, /delete process\.env\.BITCODE_LLM_PROVIDER/);
  assert.match(genericLlmsRegistryTestSource, /delete process\.env\.BITCODE_LLM_MODEL/);
  assert.doesNotMatch(webSearchOrchestratorSource, /__bitcode_reservation_id/);
  assert.doesNotMatch(genericRepositorySetupPackageSource, /Repository setup and analysis tools for Engi pipelines/);
  assert.doesNotMatch(genericRepositorySetupSource, /Engi's prompt primitives architecture/);
  assert.doesNotMatch(genericSimpleSystemTextSearchSource, /Engi's grep-based recursive analysis engine/);
  assert.doesNotMatch(genericSimpleSystemTextSearchReadmeSource, /Integration with Engi pipeline for comprehensive codebase analysis/);
  assert.doesNotMatch(genericFilesMaintainingSource, /Engi's atomic file management engine/);
  assert.doesNotMatch(genericFilesMaintainingSource, /Engi's comprehensive file system safety engine/);
  assert.doesNotMatch(genericFilesMaintainingSource, /Engi's comprehensive file system validation engine/);
  assert.doesNotMatch(gitPackageManifestSource, /deprecated|0\\.0\\.0-deprecated/i);
  assert.doesNotMatch(gitPackageSource, /deprecated|0\\.0\\.0-deprecated/i);
  assert.doesNotMatch(gitPackageReadmeSource, /deprecated|0\\.0\\.0-deprecated/i);
  assert.doesNotMatch(genericGitInteractorSource, /Engi's distributed version control intelligence/);
  assert.doesNotMatch(genericGitInteractorSource, /deprecated|0\\.0\\.0-deprecated/i);
  assert.doesNotMatch(conversationsGenericsAgentSource, /Engi conversational AI assistant/);
  assert.doesNotMatch(useConversationStreamSource, /@author Engi Team/);
  assert.doesNotMatch(lspIndexSource, /for Engi code editing/);
  assert.doesNotMatch(lspIndexSource, /optimal performance in Engi pipeline tasks/);
  assert.doesNotMatch(filesSecurityUtilsSource, /process\.env\.ENGI_REPO_ROOT/);
  assert.doesNotMatch(genericLlmsGoogleSource, /ENGI_LLM_ALLOW_MOCK/);
  assert.doesNotMatch(genericLlmsOpenAiSource, /ENGI_LLM_ALLOW_MOCK/);
  assert.doesNotMatch(genericLlmsAnthropicSource, /ENGI_LLM_ALLOW_MOCK/);
  assert.doesNotMatch(genericLlmsRegistryTestSource, /delete process\.env\.ENGI_LLM_PROVIDER/);
  assert.doesNotMatch(genericLlmsRegistryTestSource, /delete process\.env\.ENGI_LLM_MODEL/);
  assert.doesNotMatch(webSearchOrchestratorSource, /__engi_reservation_id/);

  assert.match(executionGenericsReadmeSource, /Every AI operation in Bitcode/);
  assert.match(executionGenericsReadmeSource, /How AI Agents Work in Bitcode/);
  assert.match(executionGenericsTldrSource, /How AI agents work in Bitcode/);
  assert.match(pipelineAgentRegistrySource, /BITCODE_DEBUG_REGISTRIES/);
  assert.match(pipelineLlmRegistrySource, /BITCODE_DEBUG_REGISTRIES/);
  assert.match(pipelineToolRegistrySource, /BITCODE_DEBUG_REGISTRIES/);
  assert.match(pipelineExecutionDebugSource, /BITCODE_EXECUTION_DEBUG/);
  assert.match(pipelineStreamIntegrationSource, /BITCODE_PIPELINE_STRUCTURED_DB/);
  assert.match(executionsMcpServerSource, /\bBitcodeMCPServer\b/);
  assert.match(executionsMcpServerSource, /bitcode-market-infrastructure/);
  assert.match(executionsMcpServerSource, /bitcode:\/\//);
  assert.match(executionsMcpIndexSource, /Bitcode Exchange-facing MCP interface surface/);
  assert.match(executionsMcpShutdownSource, /\bBitcodeMCPServer\b/);
  assert.match(executionsMcpTypesSource, /\bPipelinePhase\b/);
  assert.match(executionsMcpTypesSource, /\/Users\/garrettmaring\/Developer\/Bitcode/);
  assert.match(executionsMcpPipelineToolsSource, /bitcode:\/\/pipelines\/asset-pack\/create/);
  assert.match(executionsMcpAnalysisToolsSource, /bitcode:\/\/analysis\/repository\/analyze/);
  assert.match(executionsMcpMonitoringToolsSource, /bitcode:\/\/monitoring\/pipeline\/status/);
  assert.match(executionsMcpEnterpriseToolsSource, /https:\/\/api\.bitcode\.dev/);
  assert.match(executionsMcpEnterpriseToolsSource, /bitcode:\/\/enterprise\/webhook\/orchestrate/);
  assert.match(executionsMcpObservabilityToolsSource, /bitcode:\/\/observability\/metrics\/realtime/);
  assert.match(executionsMcpLspToolsSource, /bitcode:\/\/lsp\/semantic\/analyze/);
  assert.match(executionsMcpJiraToolsSource, /bitcode:\/\/jira\/projects\/list/);
  assert.match(executionsMcpAnalysisPromptsSource, /Bitcode MCP Analysis Prompts/);
  assert.match(executionsMcpAnalysisPromptsSource, /bitcode:\/\/prompts\/analysis\/security-audit/);
  assert.match(executionsMcpWorkflowPromptsSource, /Bitcode MCP Workflow Prompts/);
  assert.match(executionsMcpWorkflowPromptsSource, /bitcode:\/\/prompts\/workflow\/feature-creation/);
  assert.match(executionsMcpDevelopmentPromptsSource, /Bitcode MCP Development Prompts/);
  assert.match(executionsMcpDevelopmentPromptsSource, /bitcode:\/\/prompts\/development\/api-development/);
  assert.match(executionsMcpPipelineResourcesSource, /bitcode:\/\/resources\/pipelines\/active/);
  assert.match(executionsMcpIntelligenceResourcesSource, /bitcode:\/\/resources\/intelligence\/synthesis/);
  assert.match(executionsMcpOrganizationResourcesSource, /bitcode:\/\/resources\/organizations\/\{id\}\/analytics/);
  assert.match(executionsMcpTestSetupSource, /\bPipelinePhase\b/);
  assert.match(executionsMcpGlobalTeardownSource, /Bitcode MCP Server Test Suite/);
  assert.match(executionsMcpSuiteSource, /Bitcode MCP Server Test Suite/);
  assert.match(executionsMcpReadmeSource, /# Bitcode MCP Server - Bitcode Exchange interface/);
  assert.match(executionsMcpReadmeSource, /Bitcode Protocol/);
  assert.match(executionsMcpReadmeSource, /Bitcode Terminal/);
  assert.match(executionsMcpTestingSource, /# Bitcode MCP Server Testing Suite/);
  assert.match(executionsMcpArchitectureSource, /# Bitcode MCP Server Architecture/);
  assert.match(executionsMcpInternalArchitectureSource, /# Bitcode MCP Server: Internal Architecture & System Guarantees/);
  assert.match(executionsMcpProductionReadinessSource, /# Bitcode MCP Server: Production Readiness Assessment/);
  assert.match(executionsMcpPublicOverviewSource, /# Bitcode MCP: Bitcode Exchange interface over Model Context Protocol/);
  assert.match(executionsMcpPublicOverviewSource, /Bitcode Protocol/);
  assert.match(executionsMcpPublicOverviewSource, /Bitcode Terminal/);
  assert.match(executionsMcpPublicOverviewSource, /ingress\/input context/);
  assert.match(executionsMcpPublicOverviewSource, /wallet-gated Bitcode transaction flow/);
  assert.match(executionsMcpPublicApiReferenceSource, /# Bitcode MCP API Reference/);
  assert.match(executionsMcpOpenApiSource, /Bitcode MCP Interface API/);
  assert.match(executionsMcpPackageSource, /Bitcode Exchange-facing Model Context Protocol interface for read measurement, activity continuation, repository workflows, and asset-pack outputs/);
  assert.match(executionsMcpArchitectureSource, /\$BTD Treasury Integration/);
  assert.match(executionsMcpArchitectureSource, /\bBtdTreasuryManagement\b/);
  assert.match(executionsMcpTestFixturesSource, /wallet-gated Bitcode transaction flow/);
  assert.match(executionsMcpToolsTestSuiteSource, /wallet-gated Bitcode transaction flow/);
  assert.match(marketingBtdInvestmentExperienceSource, /\$BTD Holdings/);
  assert.match(marketingBtdInvestmentExperienceSource, /measuredBtdEstimate/);
  assert.match(marketingBtdInvestmentExperienceSource, /measuredBtd/);
  assert.match(marketingBtdInvestmentExperienceSource, /assetPackName/);
  assert.doesNotMatch(marketingBtdInvestmentExperienceSource, /estimatedCredits|actualCredits|onCreditProjection|legacy story|Compatibility aliases|shippableName/);
  assert.match(procurementCoreSource, /currency: 'BTD'/);
  assert.match(procurementPipelineIntegrationSource, /currency: 'BTD'/);
  assert.match(procurementTypesSource, /BTD-denominated Bitcode share units/);
  assert.match(procurementNotificationsSource, /BTD Minted/);
  assert.match(procurementNotificationsSource, /BTD share units/);
  assert.match(procurementIntegrationExampleSource, /Budget limit: 800 BTD share units/);
  assert.match(procurementReadmeSource, /Global solution procurement engine for Bitcode/);
  assert.match(procurementQualityAssessmentSource, /measureBitcodeFulfillmentArtifact/);
  assert.doesNotMatch(procurementCoreSource, /currency: 'ENGI'/);
  assert.doesNotMatch(procurementPipelineIntegrationSource, /currency: 'ENGI'/);
  assert.doesNotMatch(procurementTypesSource, /ENGI tokens/);
  assert.doesNotMatch(procurementNotificationsSource, /ENGI/);
  assert.doesNotMatch(procurementIntegrationExampleSource, /ENGI tokens/);
  assert.doesNotMatch(procurementReadmeSource, /ENGI platform/);
  assert.doesNotMatch(procurementQualityAssessmentSource, /measureBitcodeDeliverable|measureEngi/);
  assert.match(executionsMcpConfigSource, /\"apiKeyPrefix\": \"bitcode_\"/);
  assert.match(executionsMcpConfigSource, /\"prefix\": \"bitcode_mcp_\"/);
  assert.match(executionsMcpConfigSource, /https:\/\/bitcode\.dev/);
  assert.doesNotMatch(executionGenericsReadmeSource, /Every AI operation in Engi/);
  assert.doesNotMatch(executionGenericsReadmeSource, /How AI Agents Work in Engi/);
  assert.doesNotMatch(executionGenericsTldrSource, /How AI agents work in Engi/);
  assert.doesNotMatch(ormDatabaseGeneratedSource, /^Using workdir /m);
  assert.doesNotMatch(pipelineAgentRegistrySource, /ENGI_DEBUG_REGISTRIES/);
  assert.doesNotMatch(pipelineLlmRegistrySource, /ENGI_DEBUG_REGISTRIES/);
  assert.doesNotMatch(pipelineToolRegistrySource, /ENGI_DEBUG_REGISTRIES/);
  assert.doesNotMatch(pipelineExecutionDebugSource, /ENGI_EXECUTION_DEBUG/);
  assert.doesNotMatch(pipelineStreamIntegrationSource, /ENGI_PIPELINE_STRUCTURED_DB/);
  assert.doesNotMatch(executionsMcpServerSource, /\bEngiMCPServer\b/);
  assert.doesNotMatch(executionsMcpServerSource, /engi-engineering-intelligence/);
  assert.doesNotMatch(executionsMcpServerSource, /engi:\/\//);
  assert.doesNotMatch(executionsMcpTypesSource, /\bEngiPhase\b/);
  assert.doesNotMatch(executionsMcpTypesSource, /\/Users\/g\/Developer\/engi\/engi/);
  assert.doesNotMatch(executionsMcpPipelineToolsSource, /engi:\/\/pipelines\/deliverable\/create/);
  assert.doesNotMatch(executionsMcpAnalysisToolsSource, /engi:\/\/analysis\/repository\/analyze/);
  assert.doesNotMatch(executionsMcpMonitoringToolsSource, /engi:\/\/monitoring\/pipeline\/status/);
  assert.match(executionsMcpEnterpriseToolsSource, /https:\/\/api\.bitcode/);
  assert.doesNotMatch(executionsMcpEnterpriseToolsSource, /engi:\/\/enterprise\/webhook\/orchestrate/);
  assert.doesNotMatch(executionsMcpObservabilityToolsSource, /engi:\/\/observability\/metrics\/realtime/);
  assert.doesNotMatch(executionsMcpLspToolsSource, /engi:\/\/lsp\/semantic\/analyze/);
  assert.doesNotMatch(executionsMcpJiraToolsSource, /engi:\/\/jira\/projects\/list/);
  assert.doesNotMatch(executionsMcpAnalysisPromptsSource, /Engi MCP Analysis Prompts/);
  assert.doesNotMatch(executionsMcpWorkflowPromptsSource, /Engi MCP Workflow Prompts/);
  assert.doesNotMatch(executionsMcpDevelopmentPromptsSource, /Engi MCP Development Prompts/);
  assert.doesNotMatch(executionsMcpPipelineResourcesSource, /engi:\/\/resources\/pipelines\/active/);
  assert.doesNotMatch(executionsMcpIntelligenceResourcesSource, /engi:\/\/resources\/intelligence\/synthesis/);
  assert.doesNotMatch(executionsMcpOrganizationResourcesSource, /engi:\/\/resources\/organizations\/\{id\}\/analytics/);
  assert.doesNotMatch(executionsMcpTestSetupSource, /\bEngiPhase\b/);
  assert.doesNotMatch(executionsMcpGlobalTeardownSource, /Engi MCP Server Test Suite/);
  assert.doesNotMatch(executionsMcpSuiteSource, /Engi MCP Server Test Suite/);
  assert.doesNotMatch(executionsMcpReadmeSource, /# Engi MCP Server - Production Ready/);
  assert.doesNotMatch(executionsMcpTestingSource, /# Engi MCP Server Testing Suite/);
  assert.doesNotMatch(executionsMcpArchitectureSource, /# Engi MCP Server Architecture/);
  assert.doesNotMatch(executionsMcpInternalArchitectureSource, /# Engi MCP Server: Internal Architecture & System Guarantees/);
  assert.doesNotMatch(executionsMcpProductionReadinessSource, /# Engi MCP Server: Production Readiness Assessment/);
  assert.doesNotMatch(executionsMcpPublicOverviewSource, /# Engi MCP:/);
  assert.doesNotMatch(executionsMcpPublicApiReferenceSource, /# Engi MCP API Reference/);
  assert.doesNotMatch(executionsMcpOpenApiSource, /Engi MCP Server API/);
  assert.doesNotMatch(executionsMcpPackageSource, /Engi's Model Context Protocol server - market infrastructure for read measurement and engineering workflows/);
  assert.doesNotMatch(executionsMcpConfigSource, /\"apiKeyPrefix\": \"engi_\"/);
  assert.doesNotMatch(executionsMcpConfigSource, /\"prefix\": \"engi_mcp_\"/);
  assert.doesNotMatch(executionsMcpConfigSource, /https:\/\/engi\.ai/);
  assert.doesNotMatch(executionsMcpPublicOverviewSource, /\bStripe\b/);
  assert.doesNotMatch(executionsMcpTestFixturesSource, /\bStripe\b/);
  assert.doesNotMatch(executionsMcpToolsTestSuiteSource, /\bStripe\b/);
  assert.doesNotMatch(executionsMcpArchitectureSource, /\bCreditManagement\b/);
  assert.doesNotMatch(marketingBtdInvestmentExperienceSource, /Available Credits/);
});

test('active V26 env examples, Storybook config, internal docs, and canon workflow use Bitcode naming', () => {
  assert.match(rootEnvSource, /BITCODE_MOCK_EXA=true/);
  assert.doesNotMatch(rootEnvSource, /ENGI_MOCK_EXA=/);
  assert.match(rootEnvLocalSource, /BITCODE_LLM_PROVIDER=google/);
  assert.match(rootEnvLocalSource, /BITCODE_LOG_TO_FILE=1/);
  assert.match(rootEnvLocalSource, /BITCODE_EXECUTION_DEBUG=true/);
  assert.doesNotMatch(rootEnvLocalSource, /ENGI_LLM_PROVIDER=/);
  assert.doesNotMatch(rootEnvLocalSource, /ENGI_LOG_TO_FILE=/);
  assert.doesNotMatch(rootEnvLocalSource, /ENGI_EXECUTION_DEBUG=/);
  assert.match(v26EnvSource, /GITHUB_BITCODE_APP_CLIENT_SECRET=/);
  assert.doesNotMatch(v26EnvSource, /GITHUB_ENGI_APP_CLIENT_SECRET=/);
  assert.match(uapiEnvSource, /# Example environment values for local Bitcode development\./);
  assert.match(uapiEnvSource, /BITCODE_LOG_FULL_PROMPTS=1/);
  assert.match(uapiEnvSource, /GITHUB_BITCODE_APP_CLIENT_SECRET=/);
  assert.doesNotMatch(uapiEnvSource, /local Engi development/);
  assert.doesNotMatch(uapiEnvSource, /ENGI_LOG_FULL_PROMPTS=/);
  assert.doesNotMatch(uapiEnvSource, /GITHUB_ENGI_APP_CLIENT_SECRET=/);
  assert.match(storybookMainSource, /@bitcode\/generic-agents/);
  assert.match(storybookMainSource, /@bitcode\/agents/);
  assert.doesNotMatch(storybookMainSource, /@engi\/generic-agents/);
  assert.doesNotMatch(storybookMainSource, /@engi\/agents/);
  assert.doesNotMatch(storybookMainSource, /@engi\/email-templates/);
  assert.match(storybookPreviewSource, /inherit Bitcode visual language/);
  assert.doesNotMatch(storybookPreviewSource, /inherit Engi brand/);
  assert.match(internalDocsReadmeSource, /^# Bitcode Internal Notes/m);
  assert.match(internalDocsReadmeSource, /Promote requirements into `BITCODE_SPEC_V26\.md`/);
  assert.doesNotMatch(internalDocsReadmeSource, /^# Engi Internal Documentation/m);
  assert.doesNotMatch(internalDocsReadmeSource, /New to Engi\?/);
  assert.match(styleDocSource, /# Bitcode Interface Style Notes/);
  assert.match(styleDocSource, /Bitcode interface style/);
  assert.match(styleDocSource, /uapi\/components\/base\/bitcode\/\*/);
  assert.match(styleDocSource, /Auxillaries/);
  assert.doesNotMatch(styleDocSource, /Engi primitives/);
  assert.doesNotMatch(styleDocSource, /Reusable Engi Components/);
  assert.doesNotMatch(styleDocSource, /OrbitalsProvider\.tsx/);
  assert.doesNotMatch(styleDocSource, /User Orbital/);
  assert.match(auxillariesReadinessDocSource, /completedStep/);
  assert.match(connectedServicesDocSource, /Connected services are not separate products/);
  assert.match(connectedServicesDocSource, /MCP servers/);
  assert.match(frontendArchitectureDocSource, /conversations as rich input overlays/);
  assert.match(databaseDocSource, /Read review state/);
  assert.match(apiDocSource, /\/api\/read-review/);
  assert.match(apiDocSource, /\/api\/make-bitcode-branch/);
  assert.doesNotMatch(apiDocSource, /https:\/\/api\.engi\.software/);
  assert.doesNotMatch(connectedServicesDocSource, /OrbitalsConnectsPane\.tsx/);
  assert.match(mysqlReadmeSource, /Bitcode platform/);
  assert.match(mysqlReadmeSource, /Bitcode data pipeline/);
  assert.doesNotMatch(mysqlReadmeSource, /ENGI platform/);
  assert.doesNotMatch(mysqlReadmeSource, /ENGI data pipeline/);
  assert.match(authReadmeSource, /Bitcode platform/);
  assert.doesNotMatch(authReadmeSource, /ENGI platform/);
  assert.match(postgresqlReadmeSource, /Bitcode platform/);
  assert.match(postgresqlReadmeSource, /Bitcode vector search and analytics workflows/);
  assert.doesNotMatch(postgresqlReadmeSource, /ENGI platform/);
  assert.doesNotMatch(postgresqlReadmeSource, /ENGI vector search and analytics workflows/);
  assert.match(jiraReadmeSource, /Bitcode platform/);
  assert.doesNotMatch(jiraReadmeSource, /ENGI platform/);
  assert.match(supabaseReadmeSource, /Bitcode platform/);
  assert.doesNotMatch(supabaseReadmeSource, /ENGI platform/);
  assert.match(supabaseClientSource, /Bitcode system/);
  assert.doesNotMatch(supabaseClientSource, /engi system/);
  assert.match(templatesGenericsTypesSource, /Template Types for the Bitcode platform/);
  assert.doesNotMatch(templatesGenericsTypesSource, /Template Types for ENGI Platform/);
  assert.match(templatesGenericsPackageSource, /Bitcode platform/);
  assert.doesNotMatch(templatesGenericsPackageSource, /ENGI platform/);
  assert.match(timeReadmeSource, /Time utility functions for the Bitcode platform/);
  assert.match(timeReadmeSource, /across the Bitcode platform/);
  assert.match(toolsGenericsToolSource, /all tools in Bitcode/);
  assert.match(toolsGenericsDocCodeToolIndexSource, /documentation system for tools in Bitcode/);
  assert.match(executionsDocSource, /# Bitcode Executions Notes/);
  assert.match(executionsDocSource, /proof-bearing Bitcode inference run/);
  assert.match(styleDocSource, /Read measurement/);
  assert.doesNotMatch(connectedServicesDocSource, /upcoming Measure pipeline/);
  assert.doesNotMatch(frontendArchitectureDocSource, /Measure pipeline placeholder/);
  assert.doesNotMatch(executionsDocSource, /reserved Measure placeholder/);
  assert.match(executionWorkSummariesDocSource, /# Bitcode Execution Work Summary Notes/);
  assert.doesNotMatch(executionWorkSummariesDocSource, /Work Update system for Engi executions/);
  assert.match(deploymentDocSource, /Bitcode UI callback:/);
  assert.doesNotMatch(deploymentDocSource, /Engi UI callback:/);
  assert.doesNotMatch(timeReadmeSource, /ENGI platform/);
  assert.doesNotMatch(toolsGenericsToolSource, /all tools in engi/);
  assert.doesNotMatch(toolsGenericsDocCodeToolIndexSource, /documentation system for tools in engi/);
  assert.match(bitcodeCanonWorkflowSource, /bitcode-spec-basics:/);
  assert.match(bitcodeCanonWorkflowSource, /bitcode-full:/);
  assert.match(bitcodeCanonWorkflowSource, /bitcode-spec-commit-conformance:/);
  assert.match(bitcodeCanonWorkflowSource, /npm --prefix protocol-demonstration run test/);
  assert.doesNotMatch(bitcodeCanonWorkflowSource, /engi-spec-basics:/);
  assert.doesNotMatch(bitcodeCanonWorkflowSource, /npm --prefix engi-demo/);
  assert.equal(existsSync(new URL('../../.github/workflows/engi-canon-quality.yml', import.meta.url)), false);
  assert.equal(existsSync(new URL('../../.github/workflows/bitcode-canon-quality.yml', import.meta.url)), true);
});

test('active V26 marketing, styling, asset, and operator carriers use Bitcode naming and filesystem truth', () => {
  assert.match(marketingTestimonialsCtaSource, /Bitcode is a great GitHub app/);
  assert.match(marketingFeatureBentoSource, /Assign '<span className="font-light text-green-primary">bitcode<\/span>'/);
  assert.match(marketingFeatureListSource, /parse-issue-with-comment-from-bitcode\.png/);
  assert.match(marketingStepsSource, /subscribe to bitcode/);
  assert.match(marketingHeadlessMobileShowcaseSource, /https:\/\/api\.bitcode\.ai\/v1\/mcp/);
  assert.doesNotMatch(marketingTestimonialsCtaSource, /\bengi is a great gh app\b/i);
  assert.doesNotMatch(marketingFeatureBentoSource, />engi</);
  assert.doesNotMatch(marketingFeatureListSource, /parse-issue-with-comment-from-engi\.png/);
  assert.doesNotMatch(marketingStepsSource, /subscribe to engi/);
  assert.doesNotMatch(marketingHeadlessMobileShowcaseSource, /https:\/\/api\.engi\.sh\/v1\/mcp/);

  assert.match(uapiBaseReadmeSource, /First‑party: `bitcode\/`/);
  assert.match(uapiBaseReadmeSource, /flat under `bitcode\/`/);
  assert.match(tailwindConfigSource, /BITCODE BRAND COLOR SYSTEM/);
  assert.match(consolidatedSystemGuideSource, /# 🚀 BITCODE CONSOLIDATED DESIGN SYSTEM/);
  assert.match(orbitalStylesSource, /\.roi-column\.bitcode/);
  assert.match(orbitalStylesSource, /\.roi-column\.bitcode \.roi-metric-value/);
  assert.match(stylingReadmeSource, /Tailwind CSS styling utilities for the Bitcode platform/);
  assert.match(lspContextAwarenessCompositionSource, /BITCODE EXCELLENCE/);
  assert.doesNotMatch(uapiBaseReadmeSource, /`engi\//);
  assert.doesNotMatch(tailwindConfigSource, /ENGI BRAND COLOR SYSTEM/);
  assert.doesNotMatch(consolidatedSystemGuideSource, /ENGI CONSOLIDATED DESIGN SYSTEM/);
  assert.doesNotMatch(orbitalStylesSource, /\.roi-column\.engi/);
  assert.doesNotMatch(stylingReadmeSource, /ENGI platform/);
  assert.doesNotMatch(lspContextAwarenessCompositionSource, /ENGI EXCELLENCE/);

  assert.match(longRunnerWorkerSource, /bitcode\/long-runner:latest/);
  assert.match(dockerLongRunnerSource, /bitcode\/long-runner:latest/);
  assert.match(rootPackageLockSource, /"name": "bitcode-monorepo"/);
  assert.match(vulnerabilityAuditSource, /"name": "bitcode-monorepo"/);
  assert.doesNotMatch(longRunnerWorkerSource, /engi\/long-runner:latest/);
  assert.doesNotMatch(dockerLongRunnerSource, /engi\/long-runner:latest/);
  assert.doesNotMatch(rootPackageLockSource, /"name": "engi"/);
  assert.doesNotMatch(vulnerabilityAuditSource, /"name": "engi"/);

  assert.match(emailLogoSource, />bitcode</);
  assert.match(magicLinkStorySource, /https:\/\/app\.bitcode\.ai\/auth\/confirm/);
  assert.match(confirmStorySource, /https:\/\/app\.bitcode\.ai\/auth\/confirm/);
  assert.match(emailChangeStorySource, /https:\/\/app\.bitcode\.ai\/email-change/);
  assert.match(inviteStorySource, /https:\/\/app\.bitcode\.ai\/invite/);
  assert.match(genericNotificationStorySource, /https:\/\/status\.bitcode\.ai/);
  assert.match(passwordRecoveryStorySource, /https:\/\/app\.bitcode\.ai\/reset/);
  assert.match(upgradeStatusStorySource, /https:\/\/app\.bitcode\.ai\/executions/);
  assert.doesNotMatch(emailLogoSource, />engi</);
  assert.doesNotMatch(magicLinkStorySource, /https:\/\/engi\.dev/);
  assert.doesNotMatch(confirmStorySource, /https:\/\/engi\.dev/);
  assert.doesNotMatch(emailChangeStorySource, /https:\/\/engi\.dev/);
  assert.doesNotMatch(inviteStorySource, /https:\/\/engi\.dev/);
  assert.doesNotMatch(genericNotificationStorySource, /status\.engi\.dev/);
  assert.doesNotMatch(passwordRecoveryStorySource, /https:\/\/engi\.dev/);
  assert.doesNotMatch(upgradeStatusStorySource, /https:\/\/engi\.dev/);

  assert.match(productGuideSource, /uapi\/components\/base\/bitcode\/execution\/WorkUpdatePanel\.tsx/);
  assert.match(investorMemoSource, /raw\.githubusercontent\.com\/engineeredsoftware\/bitcode\/main/);
  assert.match(introPamphletSource, /Bitcode Technical-Knowledge Exchange/);
  assert.match(introPamphletSource, /AES' Unique Offering with Bitcode/);
  assert.doesNotMatch(productGuideSource, /uapi\/components\/base\/engi\/execution\/WorkUpdatePanel\.tsx/);
  assert.doesNotMatch(investorMemoSource, /raw\.githubusercontent\.com\/engineeredsoftware\/ENGI\/main/);
  assert.doesNotMatch(introPamphletSource, /'Engi Software Agents'/);
  assert.doesNotMatch(introPamphletSource, /AES' Unique Offering with ESAs/);

  assert.equal(existsSync(new URL('../../uapi/public/bitcode.svg', import.meta.url)), false);
  assert.equal(existsSync(new URL('../../uapi/public/logo.svg', import.meta.url)), true);
  assert.equal(existsSync(new URL('../../uapi/public/icon.svg', import.meta.url)), true);
  assert.equal(existsSync(new URL('../../uapi/public/icons/logo.svg', import.meta.url)), true);
  assert.equal(existsSync(new URL('../../uapi/public/bitcode-typelogo.png', import.meta.url)), true);
  assert.equal(existsSync(new URL('../../uapi/public/parse-issue-with-comment-from-bitcode.png', import.meta.url)), true);
  assert.equal(existsSync(new URL('../../uapi/public/engi.svg', import.meta.url)), false);
  assert.equal(existsSync(new URL('../../uapi/public/engi-typelogo.png', import.meta.url)), false);
  assert.equal(existsSync(new URL('../../uapi/public/parse-issue-with-comment-from-engi.png', import.meta.url)), false);
  assert.equal(existsSync(new URL('../../packages/eslint-plugin-engi', import.meta.url)), false);
});

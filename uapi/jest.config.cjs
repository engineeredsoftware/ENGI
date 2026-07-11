/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  // Use jsdom environment for DOM-based component tests
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests'],
  // Override cache directory to project-local path to avoid OS temp permissions issues
  cacheDirectory: '<rootDir>/tmp/jest-cache',
  modulePaths: ['<rootDir>'],
  transform: {
    '^.+\\.[jt]sx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react'
      }
    }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    // ---------- project-local utilities ----------
    '^@/.+\\.txt$': '<rootDir>/tests/textMock.js',
    '^@/.+\\.css$': '<rootDir>/tests/styleMock.js',
    '\\.css$': '<rootDir>/tests/styleMock.js',
    // jsdom's `browser` export condition resolves the untransformed ESM
    // build; pin the package to a passive stub (tests jest.mock over it).
    '^@vercel/analytics$': '<rootDir>/tests/mocks/vercelAnalytics.ts',

    // ---------- explicit maps for shared pipeline libs ----------
    // -------------------------------------------------------------------
    // New @bitcode/* package namespace redirects. These replace the historical
    // "@/lib/*" imports that lived inside the uapi codebase. As we migrate
    // source files over to the new package-scoped imports, Jest also needs
    // to know how to resolve them when running the TS output. Wherever
    // possible we mirror the old explicit mappings to keep the runtime
    // resolution behaviour identical.
    // -------------------------------------------------------------------
    '^@bitcode/logger$': '<rootDir>/../packages/logger/src/logger.ts',
    '^@bitcode/sentry$': '<rootDir>/../packages/sentry/src/sentry.ts',
    '^@bitcode/context$': '<rootDir>/../packages/context/src/index.ts',
    '^@bitcode/context/(.*)$': '<rootDir>/../packages/context/src/$1',
    '^@bitcode/observability$': '<rootDir>/tests/mocks/observability.js',
    '^@bitcode/orm$': '<rootDir>/tests/mocks/orm.ts',
    '^@bitcode/sse$': '<rootDir>/../packages/networking/src/sse.ts',
    '^@bitcode/google-analytics$': '<rootDir>/../packages/google-analytics/src/ga.ts',
    '^@bitcode/errors$': '<rootDir>/../packages/errors/src/errors.ts',
    '^@bitcode/artifacts$': '<rootDir>/../packages/artifacts/src/artifacts.ts',
    '^@bitcode/btd/terminal-operational-health$': '<rootDir>/../packages/btd/src/terminal-operational-health.ts',
    '^@bitcode/vcs-tools$': '<rootDir>/../packages/generic-tools/vcs/src/index.ts',
    '^@bitcode/protocol$': '<rootDir>/../packages/protocol/src/index.js',
    '^@bitcode/protocol/src/(.+)$': '<rootDir>/../packages/protocol/src/$1',
    '^@bitcode/generic-tools/(.+)/src/(.+)$': '<rootDir>/../packages/generic-tools/$1/src/$2',
    '^@bitcode/generic-tools/(.+)$': '<rootDir>/../packages/generic-tools/$1/src/index.ts',
    '^@bitcode/generic-tools-mcps-(.+)$': '<rootDir>/../packages/generic-tools/mcps-tools/$1/src/index.ts',
    '^@bitcode/generic-tools-(.+)$': '<rootDir>/../packages/generic-tools/$1/src/index.ts',
    '^@bitcode/pipeline-asset-pack/read-need$': '<rootDir>/../packages/pipelines/asset-pack/src/read-need.ts',
    '^@bitcode/pipeline-asset-pack/asset-packs-synthesis$': '<rootDir>/../packages/pipelines/asset-pack/src/asset-packs-synthesis.ts',
    '^@bitcode/pipeline-asset-pack/deposit-option-real-synthesis$': '<rootDir>/../packages/pipelines/asset-pack/src/deposit-option-real-synthesis.ts',
    '^@bitcode/pipeline-asset-pack/runtime-inference-policy$': '<rootDir>/../packages/pipelines/asset-pack/src/runtime-inference-policy.ts',
    '^@bitcode/pipeline-asset-pack/asset-pack-commodity-state$': '<rootDir>/../packages/pipelines/asset-pack/src/asset-pack-commodity-state.ts',
    '^@bitcode/pipeline-asset-pack/read-need-review-resynthesis$': '<rootDir>/../packages/pipelines/asset-pack/src/read-need-review-resynthesis.ts',
    '^@bitcode/pipeline-asset-pack/reading-interface-product-parity$': '<rootDir>/../packages/pipelines/asset-pack/src/reading-interface-product-parity.ts',
    '^@bitcode/pipeline-asset-pack/reading-pipeline-contract$': '<rootDir>/../packages/pipelines/asset-pack/src/reading-pipeline-contract.ts',
    '^@bitcode/pipeline-asset-pack/deposit-asset-pack-options$': '<rootDir>/../packages/pipelines/asset-pack/src/deposit-asset-pack-options.ts',
    '^@bitcode/pipeline-asset-pack/deposit-asset-pack-option-policy$': '<rootDir>/../packages/pipelines/asset-pack/src/deposit-asset-pack-option-policy.ts',
    '^@bitcode/pipeline-asset-pack/deposit-asset-pack-option-admission$': '<rootDir>/../packages/pipelines/asset-pack/src/deposit-asset-pack-option-admission.ts',
    '^@bitcode/pipeline-asset-pack/depositor-earning-supply-intelligence$': '<rootDir>/../packages/pipelines/asset-pack/src/depositor-earning-supply-intelligence.ts',
    '^@bitcode/pipeline-asset-pack/organization-policy-wallet-authority$': '<rootDir>/../packages/pipelines/asset-pack/src/organization-policy-wallet-authority.ts',
    '^@bitcode/pipeline-asset-pack/src/(.+)$': '<rootDir>/../packages/pipelines/asset-pack/src/$1',
    '^@bitcode/([^/]+)/src/(.+)$': '<rootDir>/../packages/$1/src/$2',
    '^@bitcode/supabase/ssr/server$': '<rootDir>/tests/mocks/supabaseServerClient.ts',
    '^@bitcode/supabase/ssr/client$': '<rootDir>/tests/mocks/supabaseBrowserClient.ts',
    '^@bitcode/supabase/ssr/(.*)$': '<rootDir>/../packages/supabase/src/ssr/$1',
    '^@bitcode/supabase$': '<rootDir>/../packages/supabase/src/index.ts',
    '^@bitcode/pipeline-asset-pack$': '<rootDir>/../packages/pipelines/asset-pack/src/index.ts',
    '^@bitcode/engine/pipeline$': '<rootDir>/../packages/pipelines/asset-pack/src/run.ts',
    '^@bitcode/engine/(.*)$': '<rootDir>/../packages/pipelines-generics/src/pipeline/$1',
    // Fallback - treat other @bitcode/<pkg> references as pointing into packages/<pkg>/src
    '^@bitcode/([^/]+)$': '<rootDir>/../packages/$1/src/index.ts',
    '^@bitcode/([^/]+)/(.+)$': '<rootDir>/../packages/$1/src/$2',

    // -------------------------------------------------------------------
    // Current @/lib/* test aliases for files that still import terminal-local
    // helpers through the Next.js path convention.
    // -------------------------------------------------------------------
    '^@/lib/bitcode-app-context$': '<rootDir>/lib/bitcode-app-context.ts',
    '^@/lib/bitcode-app-context-options$': '<rootDir>/lib/bitcode-app-context-options.ts',
    '^@/lib/bitcoin-wallet-oauth-provider$': '<rootDir>/lib/bitcoin-wallet-oauth-provider.ts',
    '^@/lib/bitcoin-wallet-client$': '<rootDir>/lib/bitcoin-wallet-client.ts',
    '^@/lib/github-app-url$': '<rootDir>/lib/github-app-url.ts',
    '^@/lib/bitcode-server-telemetry$': '<rootDir>/lib/bitcode-server-telemetry.ts',
    '^@/lib/deposit-source-provisioning$': '<rootDir>/lib/deposit-source-provisioning.ts',
    '^@/lib/depository-settled-demand$': '<rootDir>/lib/depository-settled-demand.ts',
    '^@/lib/execution-orphan-sweep$': '<rootDir>/lib/execution-orphan-sweep.ts',
    '^@/lib/execution-cancel$': '<rootDir>/lib/execution-cancel.ts',
    '^@/lib/bitcode-qa-telemetry$': '<rootDir>/lib/bitcode-qa-telemetry.ts',
    '^@/lib/bitcode-wallet-local$': '<rootDir>/lib/bitcode-wallet-local.ts',
    '^@/lib/supabase-auth-redirect$': '<rootDir>/lib/supabase-auth-redirect.ts',
    '^@/lib/mock-review-mode$': '<rootDir>/lib/mock-review-mode.ts',
    '^@/lib/product-analytics$': '<rootDir>/lib/product-analytics.ts',
    '^@/lib/logger$': '<rootDir>/../packages/pipelines-generics/src/logger.ts',
    '^@/lib/engine/pipeline$': '<rootDir>/../packages/pipelines-generics/src/pipeline/index.ts',
    '^@/lib/engine/(.*)$': '<rootDir>/../packages/pipelines-generics/src/pipeline/$1',
    '^@/lib/(.*)$': '<rootDir>/../packages/pipelines-generics/src/$1',

    // ---------- packages namespace ----------
    '^packages/(.*)$': '<rootDir>/../packages/$1',

    // ---------- fallback to uapi-local paths ----------
    '^@/(.*)$': '<rootDir>/$1',

    '\\.txt$': '<rootDir>/tests/textMock.js',
  },
  // Limit to Evidence Document search and active Bitcode tests for targeted CI
  testMatch: [
    '<rootDir>/tests/search.test.ts',
    '<rootDir>/tests/searchLocalVector.test.ts',
    // Include API integration tests for AssetPack and Shippable routes
    '<rootDir>/tests/api/**/*.test.ts',
    '<rootDir>/tests/api/**/*.test.tsx',
    // Library unit tests (deposit source provisioning, …)
    '<rootDir>/tests/lib/**/*.test.ts',
    '<rootDir>/tests/webhookRoute.test.ts',
    // Include mock system tests
    '<rootDir>/tests/MockOrchestrator.test.ts',
    // Added targeted AssetPack/runtime tests
    '<rootDir>/tests/searchRelevantAssetPackEvidence.test.ts',
    '<rootDir>/tests/assetPackInstructionsRoute.test.ts',
    '<rootDir>/tests/RunDetailsView.mapping.test.tsx',
    '<rootDir>/tests/usePipelineExecution.test.tsx',
    // BTD and auxillaries coverage
    '<rootDir>/tests/userDataRoute.test.ts',
    '<rootDir>/tests/useUserDataHydration.test.tsx',
    '<rootDir>/tests/featureFlagsMockMode.test.ts',
    '<rootDir>/tests/bitcoinWalletClient.test.ts',
    '<rootDir>/tests/supabaseAuthRedirect.test.ts',
    '<rootDir>/tests/auxillariesContent.access.test.tsx',
    '<rootDir>/tests/auxillariesWorkspacePanels.access.test.tsx',
    '<rootDir>/tests/auxillariesWorkspacePanels.test.tsx',
    '<rootDir>/tests/auxillariesExternalsPane.test.tsx',
    '<rootDir>/tests/profileStep.test.tsx',
    '<rootDir>/tests/btdTrackerLoading.test.tsx',
    '<rootDir>/tests/notificationsWidget.test.tsx',
    '<rootDir>/tests/auxillariesWalletPane.test.tsx',
    '<rootDir>/tests/orbitalsInterfacesPane.test.tsx',
    '<rootDir>/tests/marketingLandingPage.test.tsx',
    '<rootDir>/tests/marketingOperatorGuideCard.test.tsx',
    '<rootDir>/tests/publicDocsPageContent.test.tsx',
    '<rootDir>/tests/bitcodeDocsContent.test.tsx',
    '<rootDir>/tests/features.test.ts',
    '<rootDir>/tests/workspaceSurface.test.ts',
    '<rootDir>/tests/packsPageClient.test.tsx',
    '<rootDir>/tests/packActivityModel.test.ts',
    '<rootDir>/tests/depositRouteModel.test.ts',
    '<rootDir>/tests/depositPageClient.test.tsx',
    '<rootDir>/tests/depositSourceSelection.test.tsx',
    '<rootDir>/tests/productAnalytics.test.ts',
    // V48 product route helpers (Packs/Reads/Deposits; not Terminal)
    '<rootDir>/tests/productRoutes.test.ts',
    '<rootDir>/tests/repositoryContext.test.ts',
    '<rootDir>/tests/pipelineRunData.test.ts',
    '<rootDir>/tests/transactionReadiness.test.ts',
    '<rootDir>/tests/pipelineSelectionQuery.test.ts',
    '<rootDir>/tests/searchableSelect.test.tsx',
    '<rootDir>/tests/vcsFileTreePicker.test.tsx',
    '<rootDir>/tests/vcsConnectionCard.test.tsx',
    '<rootDir>/tests/bitcodeInlineExplainerAriaLabel.test.tsx',
    '<rootDir>/tests/readRouteModel.test.ts',
    '<rootDir>/tests/readPageClient.test.tsx',
    '<rootDir>/tests/exchangeTerminalHandoff.test.ts',
    '<rootDir>/tests/terminalPreservedShellSurface.test.tsx',
    '<rootDir>/tests/terminalFloatingDebugWidget.test.tsx',
    '<rootDir>/tests/terminalPageShell.test.tsx',
    '<rootDir>/tests/terminalWorkspaceRail.test.tsx',
    '<rootDir>/tests/terminalActivityHistory.test.ts',
    '<rootDir>/tests/terminalSurfaceCopy.test.ts',
    '<rootDir>/tests/terminalCommandState.test.ts',
    '<rootDir>/tests/terminalExperienceArchitecture.test.ts',
    '<rootDir>/tests/terminalCommercialLaunchReadiness.test.ts',
    '<rootDir>/tests/terminalOperationalHealthPanel.test.tsx',
    '<rootDir>/tests/terminalShellBridge.test.tsx',
    '<rootDir>/tests/terminalTransactionSource.test.ts',
    '<rootDir>/tests/terminalRepositoryContext.test.ts',
    '<rootDir>/tests/terminalRepositoryContextPanel.test.tsx',
    '<rootDir>/tests/terminalSupplySelection.test.ts',
    '<rootDir>/tests/terminalSupplySelectionPanel.test.tsx',
    '<rootDir>/tests/terminalDepositReadWorkbench.test.ts',
    '<rootDir>/tests/terminalEnterpriseReadingUxState.test.ts',
    '<rootDir>/tests/terminalPipelineHarnessClient.test.ts',
    '<rootDir>/tests/terminalProtocolProjection.test.ts',
    '<rootDir>/tests/terminalInterfaceIntegrationRegression.test.ts',
    '<rootDir>/tests/conversationStreamPipelineLog.test.tsx',
    '<rootDir>/tests/conversationTerminalIntegrationCoverage.test.tsx',
    '<rootDir>/tests/readingOperationalTelemetryPipelineLog.test.tsx',
    '<rootDir>/tests/conversationTerminalHandoff.test.tsx',
    '<rootDir>/tests/conversationPersistencePrivacyPanel.test.tsx',
    '<rootDir>/tests/conversationTelemetryProofPanel.test.tsx',
    '<rootDir>/tests/conversationRehearsalPanel.test.tsx',
    '<rootDir>/tests/conversationSourceSelector.test.tsx',
    '<rootDir>/tests/conversationWritingWorkspace.test.tsx',
    '<rootDir>/tests/pipelineExecutionLogHeader.test.tsx',
    '<rootDir>/tests/pipelineExecutionLogCopy.test.tsx',
    '<rootDir>/tests/pipelineExecutionLogTelemetryUx.test.tsx',
    '<rootDir>/tests/processingIndicator.test.tsx',
    '<rootDir>/tests/terminalJournalReconciliation.test.ts',
    '<rootDir>/tests/terminalOrganizationAuthority.test.ts',
    '<rootDir>/tests/terminalTransactionActivity.test.ts',
    '<rootDir>/tests/terminalTransactionActivitySurface.test.tsx',
    '<rootDir>/tests/terminalTransactionDetail.test.ts',
    '<rootDir>/tests/terminalTransactionDetailCards.test.tsx',
    '<rootDir>/tests/terminalTransactionDetailSnapshot.test.ts',
    '<rootDir>/tests/terminalTransactionQuery.test.ts',
    '<rootDir>/tests/terminalTransactionReadModel.test.ts',
    '<rootDir>/tests/bitcodeBrowserProof.test.ts',
    '<rootDir>/tests/bitcodeBrowserAccessibilityResponsiveProof.test.ts',
    '<rootDir>/tests/bitcodeLedgerStorageSync.test.ts',
    '<rootDir>/tests/terminalWalletBtcOperation.test.ts',
    '<rootDir>/tests/terminalCoreNativeSections.test.tsx',
    '<rootDir>/tests/terminalDepositComposer.test.ts',
    '<rootDir>/tests/terminalDepositComposerCard.test.tsx',
    '<rootDir>/tests/demonstrationWitnessMount.test.tsx',
    '<rootDir>/tests/protocolCommercialBoundary.test.ts',
    '<rootDir>/tests/demonstrationWitnessScopedStylesRoute.test.ts',
    '<rootDir>/tests/walletPane.static.test.tsx',
    '<rootDir>/tests/walletPane.initialFlow.test.tsx',
    '<rootDir>/tests/walletPane.test.tsx',
    '<rootDir>/tests/walletSessionPersistenceBridge.test.tsx',
    '<rootDir>/tests/bitcoinWalletAuthorizeClient.test.tsx',
    '<rootDir>/tests/externalsPane.dataShareFlow.test.tsx',
    '<rootDir>/tests/walletPane.integration.test.tsx',
    '<rootDir>/tests/navPublicShell.test.tsx',
    '<rootDir>/tests/navBrand.test.tsx',
    '<rootDir>/tests/userMenu.test.tsx',
    '<rootDir>/tests/footerPublicShell.test.tsx',
    '<rootDir>/tests/bitcodeTransactionsFilterBar.test.tsx',
    '<rootDir>/tests/bitcodeTransactionsActiveFilters.test.tsx',
    '<rootDir>/tests/bitcodeTransactionsDataTable.test.tsx',
    '<rootDir>/tests/navWorkspaceChrome.test.tsx'
  ],
  // Setup mocks and global configurations
  // Setup module mocks and globals before tests
  setupFiles: ['<rootDir>/tests/setupTests.ts'],
  setupFilesAfterEnv: [],
  // Do not run E2E files and pipeline phase wrapper tests in unit/integration test suite
  testPathIgnorePatterns: [
    // Do not run Playwright e2e tests in Jest
    '<rootDir>/tests/e2e/',
    'fetchEvidenceDocumentsAgent.test.[jt]sx?$',
  ],
  collectCoverage: false,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'lib/**/*.ts',
    'llm/**/*.js'
  ]
};

/** @type {import('ts-jest').JestConfigWithTsJest} */
const path = require('path');
const { buildPackageMap } = require('../../tests/jest.package-map.cjs');
const hierarchyPackageMapper = buildPackageMap(path.join(__dirname, '../../packages'));
module.exports = {
  resolver: path.join(__dirname, '../../tests/jest.bitcode-resolver.cjs'),
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
    ...hierarchyPackageMapper,
    '^@bitcode/generic-llms-models/src/pricing$': '<rootDir>/../../packages/generic-llms/models/src/pricing.ts',
    '^@bitcode/generic-llms-models/(.*)$': '<rootDir>/../../packages/generic-llms/models/src/$1',
    '^@bitcode/generic-generations-failsafes/(.*)$': '<rootDir>/../../packages/generic-generations/failsafes/src/$1',
    '^@bitcode/generic-generations-thinkings/(.*)$': '<rootDir>/../../packages/generic-generations/thinkings/src/$1',
    '^@bitcode/generic-artifacts-aws-provider/(.*)$': '<rootDir>/../../packages/generic-artifacts/aws-provider/src/$1',
    '^@bitcode/generic-artifacts-supabase-provider/(.*)$': '<rootDir>/../../packages/generic-artifacts/supabase-provider/src/$1',
    '^@bitcode/generic-artifacts-vercel-provider/(.*)$': '<rootDir>/../../packages/generic-artifacts/vercel-provider/src/$1',
    '^@bitcode/generic-artifacts-patch-kind/(.*)$': '<rootDir>/../../packages/generic-artifacts/patch-kind/src/$1',
    '^@bitcode/externals-jira/(.*)$': '<rootDir>/../../packages/externals/jira/src/$1',
    '^@bitcode/externals-notion/(.*)$': '<rootDir>/../../packages/externals/notion/src/$1',
    '^@bitcode/externals-figma/(.*)$': '<rootDir>/../../packages/externals/figma/src/$1',
    '^@bitcode/generic-vcs-github/(.*)$': '<rootDir>/../../packages/generic-vcs/github/src/$1',
    '^@bitcode/generic-vcs-gitlab/(.*)$': '<rootDir>/../../packages/generic-vcs/gitlab/src/$1',
    '^@bitcode/generic-vcs-bitbucket/(.*)$': '<rootDir>/../../packages/generic-vcs/bitbucket/src/$1',
    '^@bitcode/generic-vcs-git/(.*)$': '<rootDir>/../../packages/generic-vcs/git/src/$1',
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
    // Repo-root constants/ (not under packages/)
    '^@bitcode/global-constants$': '<rootDir>/../../constants/global-constants.ts',
    '^@bitcode/logger$': '<rootDir>/../../packages/logger/src/logger.ts',
    '^@bitcode/external-telemetry-sentry$': '<rootDir>/../../packages/external-telemetry/sentry/src/sentry.ts',
    '^@bitcode/observability$': '<rootDir>/tests/mocks/observability.js',
    '^@bitcode/observability/product-analytics$': '<rootDir>/../../packages/observability/src/product-analytics.ts',
    '^@bitcode/api/pipelines/cancel$': '<rootDir>/../../packages/api/src/pipelines/cancel.ts',
    '^@bitcode/api/pipelines/orphan-sweep$': '<rootDir>/../../packages/api/src/pipelines/orphan-sweep.ts',
    '^@bitcode/auth/wallet-local$': '<rootDir>/../../packages/auth/src/bitcode-wallet-local.ts',
    '^@bitcode/auth/bitcoin-wallet-client$': '<rootDir>/../../packages/auth/src/bitcoin-wallet-client.ts',
    '^@bitcode/auth/bitcoin-wallet-oauth-provider$': '<rootDir>/../../packages/auth/src/bitcoin-wallet-oauth-provider.ts',
    '^@bitcode/auth/supabase-auth-redirect$': '<rootDir>/../../packages/auth/src/supabase-auth-redirect.ts',
    '^@bitcode/auth/qa-telemetry$': '<rootDir>/../../packages/auth/src/qa-telemetry.ts',
    '^sats-connect$': '<rootDir>/tests/mocks/sats-connect.js',
    '^@bitcode/orm$': '<rootDir>/tests/mocks/orm.ts',
    '^@bitcode/sse$': '<rootDir>/../../packages/networking/src/sse.ts',
    '^@bitcode/external-telemetry-google$': '<rootDir>/../../packages/external-telemetry/google/src/ga.ts',
    '^@bitcode/errors$': '<rootDir>/../../packages/errors/src/errors.ts',
    '^@bitcode/generic-artifacts-compose$': '<rootDir>/../../packages/generic-artifacts/compose/src/index.ts',
    '^@bitcode/btd/operational-health$': '<rootDir>/../../packages/btd/src/operational-health.ts',
    '^@bitcode/generic-tools-vcs$': '<rootDir>/../../packages/generic-tools/vcs/src/index.ts',
    '^@bitcode/specifying$': '<rootDir>/../../scripts/specifying/src/index.js',
    '^@bitcode/specifying/src/(.+)$': '<rootDir>/../../scripts/specifying/src/$1',
    '^@bitcode/generic-tools/(.+)/src/(.+)$': '<rootDir>/../../packages/generic-tools/$1/src/$2',
    '^@bitcode/generic-tools/(.+)$': '<rootDir>/../../packages/generic-tools/$1/src/index.ts',
    '^@bitcode/generic-tools-mcps-(.+)$': '<rootDir>/../../packages/generic-tools/mcps-tools/$1/src/index.ts',
    '^@bitcode/generic-tools-(.+)$': '<rootDir>/../../packages/generic-tools/$1/src/index.ts',
    '^@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-reads-asset-packs/read-need$': '<rootDir>/../../packages/asset-packs-pipelines/syntheses/read/src/read-need.ts',
    '^@bitcode/asset-packs-pipelines-syntheses-domain/asset-packs-synthesis$': '<rootDir>/../../packages/asset-packs-pipelines/syntheses/domain/src/asset-packs-synthesis.ts',
    '^@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs/deposit-option-real-synthesis$': '<rootDir>/../../packages/asset-packs-pipelines/syntheses/deposit/src/deposit-option-real-synthesis.ts',
    '^@bitcode/asset-packs-pipelines-syntheses-domain/runtime-inference-policy$': '<rootDir>/../../packages/asset-packs-pipelines/syntheses/domain/src/runtime-inference-policy.ts',
    '^@bitcode/asset-packs-pipelines-domain/asset-pack-commodity-state$': '<rootDir>/../../packages/asset-packs-pipelines/domain/src/asset-pack-commodity-state.ts',
    '^@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-reads-asset-packs/read-need-review-resynthesis$': '<rootDir>/../../packages/asset-packs-pipelines/syntheses/read/src/read-need-review-resynthesis.ts',
    '^@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-reads-asset-packs/reading-interface-product-parity$': '<rootDir>/../../packages/asset-packs-pipelines/syntheses/read/src/reading-interface-product-parity.ts',
    '^@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-reads-asset-packs/reading-pipeline-contract$': '<rootDir>/../../packages/asset-packs-pipelines/syntheses/read/src/reading-pipeline-contract.ts',
    '^@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs/deposit-asset-pack-options$': '<rootDir>/../../packages/asset-packs-pipelines/syntheses/deposit/src/deposit-asset-pack-options.ts',
    '^@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs/deposit-asset-pack-option-policy$': '<rootDir>/../../packages/asset-packs-pipelines/syntheses/deposit/src/deposit-asset-pack-option-policy.ts',
    '^@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs/deposit-asset-pack-option-admission$': '<rootDir>/../../packages/asset-packs-pipelines/syntheses/deposit/src/deposit-asset-pack-option-admission.ts',
    '^@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs/depositor-earning-supply-intelligence$': '<rootDir>/../../packages/asset-packs-pipelines/syntheses/deposit/src/depositor-earning-supply-intelligence.ts',
    '^@bitcode/asset-packs-pipelines-domain/organization-policy-wallet-authority$': '<rootDir>/../../packages/asset-packs-pipelines/domain/src/organization-policy-wallet-authority.ts',
    '^@bitcode/asset-packs-pipelines-domain/src/(.+)$': '<rootDir>/../../packages/asset-packs-pipelines/domain/src/$1',
    '^@bitcode/supabase/ssr/server$': '<rootDir>/tests/mocks/supabaseServerClient.ts',
    '^@bitcode/supabase/ssr/client$': '<rootDir>/tests/mocks/supabaseBrowserClient.ts',
    '^@bitcode/supabase/ssr/(.*)$': '<rootDir>/../../packages/supabase/src/ssr/$1',
    '^@bitcode/supabase$': '<rootDir>/../../packages/supabase/src/index.ts',
    '^@bitcode/asset-packs-pipelines-domain$': '<rootDir>/../../packages/asset-packs-pipelines/domain/src/index.ts',
    '^@bitcode/asset-packs-pipelines-syntheses-domain$': '<rootDir>/../../packages/asset-packs-pipelines/syntheses/domain/src/index.ts',
    '^@bitcode/asset-packs-pipelines-syntheses-domain/(.+)$': '<rootDir>/../../packages/asset-packs-pipelines/syntheses/domain/src/$1',
    '^@bitcode/engine/pipeline$': '<rootDir>/../../packages/asset-packs-pipelines/syntheses/domain/src/run.ts',
    '^@bitcode/engine/(.*)$': '<rootDir>/../../packages/pipelines-generics/src/pipeline/$1',
    // Fallback - treat other @bitcode/<pkg> references as pointing into packages/<pkg>/src
    // Host hierarchy (nested paths — must precede catch-all @bitcode/([^/]+)$)
    '^@bitcode/host-generics$': '<rootDir>/../../packages/host-generics/src/index.ts',
    '^@bitcode/host-generics/(.*)$': '<rootDir>/../../packages/host-generics/src/$1',
    '^@bitcode/generic-hosts-local$': '<rootDir>/../../packages/generic-hosts/Local/src/index.ts',
    '^@bitcode/generic-hosts-vercel-sandbox$': '<rootDir>/../../packages/generic-hosts/VercelSandbox/src/index.ts',
    // Attachment hierarchy
    '^@bitcode/attachment-generics$': '<rootDir>/../../packages/attachment-generics/src/index.ts',
    '^@bitcode/generic-attachments-file$': '<rootDir>/../../packages/generic-attachments/file/src/index.ts',
    '^@bitcode/generic-attachments-external$': '<rootDir>/../../packages/generic-attachments/external/src/index.ts',
    '^@bitcode/attachments-generics$': '<rootDir>/../../packages/attachments-generics/src/index.ts',
    '^@bitcode/mcp-generics$': '<rootDir>/../../packages/mcp-generics/src/index.ts',
    '^@bitcode/generic-mcps-bitcode$': '<rootDir>/../apps/mcp/src/index.ts',
    '^@bitcode/generic-mcps-bitcode$': '<rootDir>/../apps/mcp/src/index.ts',
    '^@bitcode/mcp-generics$': '<rootDir>/../../packages/mcp-generics/src/index.ts',
    '^@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs$': '<rootDir>/../../packages/asset-packs-pipelines/syntheses/deposit/src/index.ts',
    '^@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-reads-asset-packs$': '<rootDir>/../../packages/asset-packs-pipelines/syntheses/read/src/index.ts',
    '^@bitcode/asset-packs-pipelines-execution-pipeline-simple-settle-asset-pack$': '<rootDir>/../../packages/asset-packs-pipelines/settle/src/index.ts',
    '^@bitcode/generic-pipelines-execution-pipeline-simple$': '<rootDir>/../../packages/generic-pipelines/execution-pipeline-simple/src/index.ts',
    '^@bitcode/generic-agents-ptrr$': '<rootDir>/../../packages/generic-agents/PTRR/src/index.ts',
    '^@bitcode/generic-agents-ptrr/(.*)$': '<rootDir>/../../packages/generic-agents/PTRR/src/$1',
    '^@bitcode/pipeline-hosts$': '<rootDir>/../../packages/pipeline-hosts/src/index.ts',
    '^@bitcode/pipeline-hosts/(.*)$': '<rootDir>/../../packages/pipeline-hosts/src/$1',

    // -------------------------------------------------------------------
    // Current @/lib/* test aliases for files that still import terminal-local
    // helpers through the Next.js path convention.
    // -------------------------------------------------------------------
    '^@/lib/bitcode-app-context$': '<rootDir>/lib/bitcode-app-context.ts',
    '^@/lib/bitcode-app-context-options$': '<rootDir>/lib/bitcode-app-context-options.ts',
    '^@/lib/github-app-url$': '<rootDir>/lib/github-app-url.ts',
    '^@/lib/bitcode-server-telemetry$': '<rootDir>/lib/bitcode-server-telemetry.ts',
    '^@/lib/deposit-source-provisioning$': '<rootDir>/lib/deposit-source-provisioning.ts',
    '^@/lib/deposit-source-samples$': '<rootDir>/lib/deposit-source-samples.ts',
    '^@/lib/depository-settled-demand$': '<rootDir>/lib/depository-settled-demand.ts',
    '^@/lib/mock-review-mode$': '<rootDir>/lib/mock-review-mode.ts',
    '^@/lib/product-analytics$': '<rootDir>/lib/product-analytics.ts',
    '^@/lib/logger$': '<rootDir>/../../packages/logger/src/logger.ts',
    '^@/lib/engine/pipeline$': '<rootDir>/../../packages/pipelines-generics/src/pipeline/index.ts',
    '^@/lib/engine/(.*)$': '<rootDir>/../../packages/pipelines-generics/src/pipeline/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',

    // ---------- packages namespace ----------
    '^packages/(.*)$': '<rootDir>/../../packages/$1',

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
    '<rootDir>/tests/depositActivityLedger.test.ts',
    '<rootDir>/tests/depositSourceCriticality.test.ts',
    '<rootDir>/tests/depositRunStatus.test.ts',
    '<rootDir>/tests/productAnalytics.test.ts',
    // V48 product route helpers (Packs/Reads/Deposits; not product)
    '<rootDir>/tests/productRoutes.test.ts',
    '<rootDir>/tests/repositoryContext.test.ts',
    '<rootDir>/tests/pipelineRunData.test.ts',
    // Settle delivery completion mapping (settleDelivery only; pre-production)
    '<rootDir>/tests/streamParser.completion.test.ts',
    '<rootDir>/tests/executionsHeaderSemanticMirrors.test.ts',
    '<rootDir>/tests/transactionReadiness.test.ts',
    '<rootDir>/tests/pipelineSelectionQuery.test.ts',
    '<rootDir>/tests/pipelineActivityHistory.test.ts',
    '<rootDir>/tests/searchableSelect.test.tsx',
    '<rootDir>/tests/vcsFileTreePicker.test.tsx',
    '<rootDir>/tests/vcsConnectionCard.test.tsx',
    '<rootDir>/tests/bitcodeInlineExplainerAriaLabel.test.tsx',
    '<rootDir>/tests/readRouteModel.test.ts',
    '<rootDir>/tests/readPageClient.test.tsx',
    '<rootDir>/tests/conversationStreamPipelineLog.test.tsx',
    '<rootDir>/tests/readingOperationalTelemetryPipelineLog.test.tsx',
    '<rootDir>/tests/conversationPersistencePrivacyPanel.test.tsx',
    '<rootDir>/tests/conversationTelemetryProofPanel.test.tsx',
    '<rootDir>/tests/conversationRehearsalPanel.test.tsx',
    '<rootDir>/tests/conversationSourceSelector.test.tsx',
    '<rootDir>/tests/conversationWritingWorkspace.test.tsx',
    '<rootDir>/tests/pipelineExecutionLogHeader.test.tsx',
    '<rootDir>/tests/pipelineExecutionLogCopy.test.tsx',
    '<rootDir>/tests/pipelineExecutionLogTelemetryUx.test.tsx',
    '<rootDir>/tests/processingIndicator.test.tsx',
    '<rootDir>/tests/bitcodeBrowserProof.test.ts',
    '<rootDir>/tests/bitcodeBrowserAccessibilityResponsiveProof.test.ts',
    '<rootDir>/tests/bitcodeLedgerStorageSync.test.ts',
    '<rootDir>/tests/protocolCommercialBoundary.test.ts',
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
  // USE_REAL_DB loads real @supabase/supabase-js, which pulls ESM-only isows.
  // Transform those packages (pnpm nests them under .pnpm/) so Jest can load them.
  transformIgnorePatterns: [
    '/node_modules/(?!(.pnpm/)?(isows|until-async|@supabase|ws)(@|/|\\+|$))',
  ],
  collectCoverage: false,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'lib/**/*.ts',
    'llm/**/*.js'
  ]
};

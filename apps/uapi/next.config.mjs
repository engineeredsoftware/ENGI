/** @type {import('next').NextConfig} */
// --------------------------------------
// Make sure apps/uapi/.env.local takes highest precedence, even when a monorepo
// root processed .env values earlier (e.g. turbo / `pnpm dev`).  We load it
// here with `override:true` so any NEXT_PUBLIC_*=false lines used for local
// performance profiling beat previously-defined true values.
// --------------------------------------

import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
// `require` will be created below to load CJS modules

const require = createRequire(import.meta.url);
// For resolving tsconfig path aliases in webpack
const { TsconfigPathsPlugin } = require('tsconfig-paths-webpack-plugin');

// __dirname equivalent in ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Always allow the *package-local* .env.local file to win over anything that
// Turbo / the repo root may have placed in process.env earlier.  We resolve
// the path relative to this config file so it works no matter where `next`
// is started from (monorepo root, IDE, etc.).
dotenv.config({ path: path.resolve(__dirname, '.env.local'), override: true });

// Local staging/read-fit QA can point the app at a branch-scoped env file
// without copying secrets into apps/uapi/.env.local. This keeps ordinary package
// local overrides intact while letting the strict pipeline harness use the
// same root env pulled from the staging Vercel project/branch.
if (process.env.BITCODE_UAPI_ENV_FILE) {
  const envFile = path.isAbsolute(process.env.BITCODE_UAPI_ENV_FILE)
    ? process.env.BITCODE_UAPI_ENV_FILE
    : path.resolve(__dirname, process.env.BITCODE_UAPI_ENV_FILE);
  dotenv.config({ path: envFile, override: true });
}

const mcpsToolsRoot = path.resolve(__dirname, '..', '..', 'packages', 'generic-tools', 'mcps-tools');
const mcpToolPackageDirs = fs.existsSync(mcpsToolsRoot)
  ? fs
      .readdirSync(mcpsToolsRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
  : [];
const mcpToolTranspilePackages = mcpToolPackageDirs.map(
  (name) => `@bitcode/generic-tools-mcps-${name}`
);
const mcpToolAliases = Object.fromEntries(
  mcpToolPackageDirs.map((name) => [
    `@bitcode/generic-tools-mcps-${name}`,
    path.resolve(mcpsToolsRoot, name, 'src', 'index.ts'),
  ])
);

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

// Deep import resolver removed. All packages must be imported via root exports.

// Base Next.js configuration
let nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // V28 QA runs deterministic mock and testnet-readiness dev servers side by
  // side.  Keep their Next build artifacts isolated so public env compilation
  // cannot leak between lanes.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  productionBrowserSourceMaps: false,
  experimental: {
    // Allow importing source files from outside the `uapi` package directory.
    externalDir: true,
    // Keep the Vercel Sandbox SDK as a traced Node runtime package. Bundling it
    // pulls in undici syntax newer than this Next/SWC build pipeline accepts,
    // and can force the CJS graph (command.cjs → require(@workflow/serde) →
    // ERR_REQUIRE_ESM on Vercel). Host code loads the pure-ESM entry at runtime.
    serverComponentsExternalPackages: [
      '@vercel/sandbox',
      '@workflow/serde',
      '@vercel/oidc',
    ],
    // Monorepo root so workspace packages outside apps/uapi trace correctly
    // without falling back to over-broad project trees on Vercel.
    outputFileTracingRoot: path.join(__dirname, '../..'),
    // Pitch deck PDF SoT lives at monorepo `.bd/the-pitch.pdf` (not public/).
    // Include it only for the deck route so NFT can stream the single file.
    outputFileTracingIncludes: {
      '/api/deck': ['./.bd/the-pitch.pdf', '../../.bd/the-pitch.pdf'],
      // Waitlist mail template (also under apps/uapi/email-templates for cwd).
      '/api/waitlist': [
        './email-templates/**/*',
        '../../supabase/templates/waitlist.html',
      ],
    },
    // Next 14.x: tracing excludes live under experimental (stable top-level
    // only in later majors). Specifying is repo metadevelopment only — never
    // product runtime. Tests/snapshots and other non-runtime trees must stay
    // out of serverless NFT packages (250 MB uncompressed limit).
    outputFileTracingExcludes: {
      '*': [
        '**/scripts/specifying/**',
        '**/v23-bitcoin-demonstration-service.*',
        '**/specifying-runtime.js',
        '**/ai-reading-demonstration/**',
        '**/.proofs/**',
        '**/storybook-static/**',
        '**/tmp/**',
        // Specifying machine (canon/gates/proofs) — not commercial product.
        '**/scripts/specifying/**',

        // Unit/e2e/fixture trees (incl. committed Playwright PNG snapshots).
        '**/tests/**',
        '**/__tests__/**',
        '**/*.{test,spec}.{js,jsx,ts,tsx}',
        '**/*-snapshots/**',
        '**/playwright-report/**',
        '**/coverage/**',
        '**/.next/cache/**',
        '**/.next-*/**',
        // Sibling apps and non-product monorepo surfaces.
        '**/apps/mcp/**',
        '**/apps/chatgpt/**',
        '**/apps/admin/**',
        '**/containers/**',
        '**/.git/**',
        '**/_legacy/**',
      ],
    },
  },

  // Transpile workspace packages that the Next app imports directly or
  // transitively so webpack/SWC can handle TS/ESM + monorepo paths.
  transpilePackages: [
    '@bitcode/styling',
    '@bitcode/prompts',
    '@bitcode/pipeline-hosts',
    '@bitcode/asset-packs-pipelines-domain',
    '@bitcode/asset-packs-pipelines-execution-pipeline-simple-settle-asset-pack',
    '@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs',
    '@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-reads-asset-packs',
    '@bitcode/generic-pipelines-execution-pipeline-simple',
    '@bitcode/generic-pipelines-execution-pipeline-sdivf',
    '@bitcode/pipelines-generics',
    '@bitcode/vcs-generics',
    '@bitcode/agent-generics',
    // Generic agents used by pipelines
    '@bitcode/generic-agent-code-editor',
    '@bitcode/generic-agents-ready-to-short-circuit',
    '@bitcode/generic-agents-language',
    '@bitcode/generic-agents-vcs',
    '@bitcode/generic-agents-read-comprehension',
    '@bitcode/generic-agents-text-search',
    '@bitcode/generic-agents-danger-wall',
    // Generic tools used by pipelines/agents
    '@bitcode/generic-tools-editing',
    '@bitcode/generic-tools-git',
    '@bitcode/generic-tools-lsp-query',
    '@bitcode/generic-tools-read-comprehension',
    '@bitcode/generic-tools-multimodal-processing',
    '@bitcode/generic-tools-simple-system-text-search',
    '@bitcode/generic-tools-repository-setup',
    '@bitcode/generic-tools-vcs',
    ...mcpToolTranspilePackages,
    '@bitcode/generic-tools-lsp-query',
    '@bitcode/generic-tools-vcs',
    // Core shared libs commonly imported in app/server code
    // Do not transpile the specifying machine — not product runtime; must not
    // enter the Next/Vercel serverless graph.
    '@bitcode/btd',
    '@bitcode/generic-llms-models',
    '@bitcode/files',
    '@bitcode/logger',
    '@bitcode/api/streams',
    '@bitcode/observability',
    '@bitcode/mcp-generics',
    '@bitcode/generic-vcs-git',
    '@bitcode/externals-notion',
    '@bitcode/security',
    '@bitcode/generic-vcs-gitlab',
    '@bitcode/generic-vcs-bitbucket',
  ],
  compiler: {
    // Remove console.* calls in production builds
    removeConsole: process.env.NODE_ENV === 'production',
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable ESLint during build to avoid interactive prompts
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY,
    // Disable “use” / auth entry points across the marketing site.
    NEXT_PUBLIC_DISABLE_USING: process.env.NEXT_PUBLIC_DISABLE_USING ?? 'true',
    NEXT_PUBLIC_MASTER_MOCK_MODE: process.env.NEXT_PUBLIC_MASTER_MOCK_MODE,
    NEXT_PUBLIC_ENABLE_MOCKS: process.env.NEXT_PUBLIC_ENABLE_MOCKS,
    NEXT_PUBLIC_MOCK_USER_AUXILLARIES: process.env.NEXT_PUBLIC_MOCK_USER_AUXILLARIES,
    NEXT_PUBLIC_MOCK_USER_AUXILLARIES_SCENARIO: process.env.NEXT_PUBLIC_MOCK_USER_AUXILLARIES_SCENARIO,
    NEXT_PUBLIC_MOCK_SCENARIO: process.env.NEXT_PUBLIC_MOCK_SCENARIO,
    NEXT_PUBLIC_MOCK_GITHUB_ACCOUNTS: process.env.NEXT_PUBLIC_MOCK_GITHUB_ACCOUNTS,
    NEXT_PUBLIC_MOCK_GITHUB_REPOS: process.env.NEXT_PUBLIC_MOCK_GITHUB_REPOS,
    NEXT_PUBLIC_MOCK_GITHUB_BRANCHES: process.env.NEXT_PUBLIC_MOCK_GITHUB_BRANCHES,
    NEXT_PUBLIC_MOCK_GITHUB_COMMITS: process.env.NEXT_PUBLIC_MOCK_GITHUB_COMMITS,
    NEXT_PUBLIC_MOCK_CHAT_STREAM: process.env.NEXT_PUBLIC_MOCK_CHAT_STREAM,
    NEXT_PUBLIC_MOCK_CHAT_SCENARIO: process.env.NEXT_PUBLIC_MOCK_CHAT_SCENARIO,
    NEXT_PUBLIC_APP_VERSION: (() => {
      // Prefer CI-provided commit SHA if available to avoid spawning git.
      if (process.env.VERCEL_GIT_COMMIT_SHA) {
        return process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7);
      }
      // Fall back to local git commit hash.
      try {
        return require('child_process').execSync('git rev-parse --short HEAD').toString().trim();
      } catch {
        return 'dev';
      }
    })(),
    NEXT_PUBLIC_APP_VERSION_DATE: (() => {
      if (process.env.VERCEL_GIT_COMMIT_SHA) {
        // Use build time in UTC when run on Vercel
        return new Date().toISOString();
      }
      try {
        return require('child_process').execSync('git log -1 --format=%cI').toString().trim();
      } catch {
        return new Date().toISOString();
      }
    })(),
  },
  async redirects() {
    return [

      {
        source: '/executions',
        destination: '/exchange',
        permanent: false,
      },
      {
        source: '/executions/:runId',
        destination: '/exchange?transactionId=:runId',
        permanent: false,
      },
      {
        source: '/orbitals',
        destination: '/auxillaries/profile',
        permanent: false,
      },
      {
        source: '/orbitals/profile',
        destination: '/auxillaries/profile',
        permanent: false,
      },
      {
        source: '/orbitals/users',
        destination: '/auxillaries/profile',
        permanent: false,
      },
      {
        source: '/orbitals/connects',
        destination: '/auxillaries/connects',
        permanent: false,
      },
      {
        source: '/orbitals/interfaces',
        destination: '/auxillaries/interfaces',
        permanent: false,
      },
      {
        source: '/orbitals/models',
        destination: '/auxillaries/interfaces',
        permanent: false,
      },
      {
        source: '/orbitals/btd',
        destination: '/auxillaries/btd',
        permanent: false,
      },
    ];
  },
  webpack: (config, { dev, isServer, nextRuntime }) => {
    // Detect edge runtime (middleware, edge API routes)
    const isEdge = nextRuntime === 'edge';

    // Stub Sentry for Edge Runtime and client builds
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@bitcode/external-telemetry-sentry$': path.resolve(__dirname, '..', '..', 'packages', 'external-telemetry', 'sentry', 'src', (isServer && !isEdge) ? 'sentry.ts' : 'sentry-edge-stub.ts'),
    };

    // Resolve TS path aliases based on tsconfig.json and prefer TS siblings over stale JS artifacts.
    if (Array.isArray(config.resolve.extensions)) {
      config.resolve.extensions = Array.from(new Set([
        '.ts',
        '.tsx',
        '.js',
        '.jsx',
        ...config.resolve.extensions,
      ]));
    }
    config.resolve.plugins = config.resolve.plugins || [];
    config.resolve.plugins.push(new TsconfigPathsPlugin({ extensions: config.resolve.extensions }));
    // Removed deep-src resolver to rely on single alias + tsconfig paths
    // Inline .txt imports as raw source
    config.module.rules.push({
      test: /\.txt$/i,
      type: 'asset/source',
    });
    
    // Add doc-code-tool loader for automatic prompt attachment.
    // Resolve from @bitcode/generic-doc-comments-doc-code package export (built to dist at dev start).
    try {
      const docCodeLoader = require.resolve('@bitcode/generic-doc-comments-doc-code/loader');
      config.module.rules.push({
        test: /\.(ts|tsx)$/,
        include: [
          path.resolve(__dirname, '..', '..', 'packages', 'generic-tools'),
          path.resolve(__dirname, '..', '..', 'packages', 'tools-generics'),
        ],
        use: [
          {
            loader: docCodeLoader,
            options: { exclude: [/\.test\./, /\.spec\./] }
          }
        ]
      });
    } catch (e) {
      // If the loader isn't built yet, skip silently; prompts will still work without runtime attachments.
      // The dev script should build @bitcode/generic-doc-comments-doc-code before starting dev to enable the loader.
    }
    // For client builds and edge runtime, stub out server-only modules
    if (!isServer || isEdge) {
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        fs: false,
        'fs/promises': false,
        child_process: false,
        path: false,
        os: false,
        crypto: false,
        util: false,
        async_hooks: false,
        net: false,
        tls: false,
        https: false,
        http: false,
        diagnostics_channel: false,
        worker_threads: false,
        'module-details-from-path': false,
        'import-in-the-middle': false,
        // Node.js prefixed modules
        'node:fs': false,
        'node:child_process': false,
        'node:diagnostics_channel': false,
        'node:https': false,
        'node:http': false,
        'node:async_hooks': false,
        'node:os': false,
        'node:path': false,
        'node:util': false,
      };

      // Replace problematic Node.js packages with stubs for Edge Runtime and client builds
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        '@bitcode/external-telemetry-sentry': path.resolve(__dirname, '..', '..', 'packages', 'external-telemetry', 'sentry', 'src', 'sentry-edge-stub.ts'),
        '@sentry/node': path.resolve(__dirname, '..', '..', 'packages', 'external-telemetry', 'sentry', 'src', 'sentry-edge-stub.ts'),
        '@sentry/nextjs': path.resolve(__dirname, '..', '..', 'packages', 'external-telemetry', 'sentry', 'src', 'sentry-edge-stub.ts'),
        diagnostics_channel: path.resolve(__dirname, '..', 'admin', 'lib', 'stubs', 'diagnostics_channel.ts'),
        'require-in-the-middle': path.resolve(__dirname, 'config', 'stubs', 'require-in-the-middle.js'),
        '@opentelemetry/instrumentation': path.resolve(__dirname, 'config', 'stubs', 'opentelemetry-instrumentation.js'),
        '@opentelemetry/instrumentation/build/esm/index.js': path.resolve(
          __dirname,
          'config',
          'stubs',
          'opentelemetry-instrumentation.js'
        ),
        '@opentelemetry/instrumentation/build/esm/platform/node/instrumentation.js': path.resolve(
          __dirname,
          'config',
          'stubs',
          'opentelemetry-instrumentation.js'
        ),
      };
    }

    // ---------------------------------------------------------------------
    // Custom module aliases for recently refactored packages.  These point
    // the historical import specifiers used across the codebase at the newly
    // organised source locations inside /packages/.
    // ---------------------------------------------------------------------
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // Single top-level alias for prompts – root-only import
      // No specifying webpack alias: commercial product must not resolve the
      // specifying machine into serverless bundles.
      '@bitcode/prompts': path.resolve(__dirname, '..', '..', 'packages', 'prompts', 'src', 'index.ts'),
      '@bitcode/execution-generics': path.resolve(
        __dirname,
        '..',
        '..',
        'packages',
        'execution-generics',
        'src',
        'index.ts'
      ),
      // Co-located layout: packages/asset-packs-pipelines/{domain,syntheses/{deposit,read,domain},settle}
      '@bitcode/asset-packs-pipelines-domain$': path.resolve(
        __dirname,
        '..',
        '..',
        'packages',
        'asset-packs-pipelines',
        'domain',
        'src',
        'index.ts'
      ),
      '@bitcode/asset-packs-pipelines-syntheses-domain$': path.resolve(
        __dirname,
        '..',
        '..',
        'packages',
        'asset-packs-pipelines',
        'syntheses',
        'domain',
        'src',
        'index.ts'
      ),
      '@bitcode/asset-packs-pipelines-syntheses-domain/asset-packs-synthesis': path.resolve(
        __dirname,
        '..',
        '..',
        'packages',
        'asset-packs-pipelines',
        'syntheses',
        'domain',
        'src',
        'asset-packs-synthesis.ts'
      ),
      '@bitcode/asset-packs-pipelines-syntheses-domain/runtime-inference-policy': path.resolve(
        __dirname,
        '..',
        '..',
        'packages',
        'asset-packs-pipelines',
        'syntheses',
        'domain',
        'src',
        'runtime-inference-policy.ts'
      ),
      '@bitcode/asset-packs-pipelines-syntheses-domain/depository-settled-demand-estimate': path.resolve(
        __dirname,
        '..',
        '..',
        'packages',
        'asset-packs-pipelines',
        'syntheses',
        'domain',
        'src',
        'depository-settled-demand-estimate.ts'
      ),
      '@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs': path.resolve(
        __dirname,
        '..',
        '..',
        'packages',
        'asset-packs-pipelines',
        'syntheses',
        'deposit',
        'src',
        'index.ts'
      ),
      '@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs/deposit-asset-pack-options': path.resolve(
        __dirname,
        '..',
        '..',
        'packages',
        'asset-packs-pipelines',
        'syntheses',
        'deposit',
        'src',
        'deposit-asset-pack-options.ts'
      ),
      '@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs/deposit-asset-pack-option-policy': path.resolve(
        __dirname,
        '..',
        '..',
        'packages',
        'asset-packs-pipelines',
        'syntheses',
        'deposit',
        'src',
        'deposit-asset-pack-option-policy.ts'
      ),
      '@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs/deposit-asset-pack-option-admission': path.resolve(
        __dirname,
        '..',
        '..',
        'packages',
        'asset-packs-pipelines',
        'syntheses',
        'deposit',
        'src',
        'deposit-asset-pack-option-admission.ts'
      ),
      '@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs/depositor-earning-supply-intelligence': path.resolve(
        __dirname,
        '..',
        '..',
        'packages',
        'asset-packs-pipelines',
        'syntheses',
        'deposit',
        'src',
        'depositor-earning-supply-intelligence.ts'
      ),
      '@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs/deposit-option-real-synthesis': path.resolve(
        __dirname,
        '..',
        '..',
        'packages',
        'asset-packs-pipelines',
        'syntheses',
        'deposit',
        'src',
        'deposit-option-real-synthesis.ts'
      ),
      '@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs/agents/finish/deposit-store-artifacts-agent': path.resolve(
        __dirname,
        '..',
        '..',
        'packages',
        'asset-packs-pipelines',
        'syntheses',
        'deposit',
        'src',
        'agents',
        'finish',
        'deposit-store-artifacts-agent.ts'
      ),
      '@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs/agents/implementation/deposit-asset-pack-synthesis-schema': path.resolve(
        __dirname,
        '..',
        '..',
        'packages',
        'asset-packs-pipelines',
        'syntheses',
        'deposit',
        'src',
        'agents',
        'implementation',
        'deposit-asset-pack-synthesis-schema.ts'
      ),
      '@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs/agents/implementation/deposit-asset-pack-synthesis-prompts': path.resolve(
        __dirname,
        '..',
        '..',
        'packages',
        'asset-packs-pipelines',
        'syntheses',
        'deposit',
        'src',
        'agents',
        'implementation',
        'deposit-asset-pack-synthesis-prompts.ts'
      ),
      '@bitcode/asset-packs-pipelines-syntheses-domain/agents/validation/agent-measure-absolutes': path.resolve(
        __dirname,
        '..',
        '..',
        'packages',
        'asset-packs-pipelines',
        'syntheses',
        'domain',
        'src',
        'agents',
        'validation',
        'agent-measure-absolutes.ts'
      ),
      '@bitcode/asset-packs-pipelines-syntheses-domain/agents/implementation/asset-pack-patch-write-tool': path.resolve(
        __dirname,
        '..',
        '..',
        'packages',
        'asset-packs-pipelines',
        'syntheses',
        'domain',
        'src',
        'agents',
        'implementation',
        'asset-pack-patch-write-tool.ts'
      ),
      '@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs/agents/validation/deposit-validation-schema': path.resolve(
        __dirname,
        '..',
        '..',
        'packages',
        'asset-packs-pipelines',
        'syntheses',
        'deposit',
        'src',
        'agents',
        'validation',
        'deposit-validation-schema.ts'
      ),
      '@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs/agents/validation/deposit-validation-prompts': path.resolve(
        __dirname,
        '..',
        '..',
        'packages',
        'asset-packs-pipelines',
        'syntheses',
        'deposit',
        'src',
        'agents',
        'validation',
        'deposit-validation-prompts.ts'
      ),
      '@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs/agents/validation/deposit-validation-checks': path.resolve(
        __dirname,
        '..',
        '..',
        'packages',
        'asset-packs-pipelines',
        'syntheses',
        'deposit',
        'src',
        'agents',
        'validation',
        'deposit-validation-checks.ts'
      ),
      '@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs/ensure-deposit-checkout-source-files': path.resolve(
        __dirname,
        '..',
        '..',
        'packages',
        'asset-packs-pipelines',
        'syntheses',
        'deposit',
        'src',
        'ensure-deposit-checkout-source-files.ts'
      ),
      '@bitcode/asset-packs-pipelines-syntheses-domain/agents/finish/asset-packs-ledgerize-agent': path.resolve(
        __dirname,
        '..',
        '..',
        'packages',
        'asset-packs-pipelines',
        'syntheses',
        'domain',
        'src',
        'agents',
        'finish',
        'asset-packs-ledgerize-agent.ts'
      ),
      '@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-reads-asset-packs': path.resolve(
        __dirname,
        '..',
        '..',
        'packages',
        'asset-packs-pipelines',
        'syntheses',
        'read',
        'src',
        'index.ts'
      ),
      '@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-reads-asset-packs/read-need': path.resolve(
        __dirname,
        '..',
        '..',
        'packages',
        'asset-packs-pipelines',
        'syntheses',
        'read',
        'src',
        'read-need.ts'
      ),
      '@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-reads-asset-packs/read-need-review-resynthesis': path.resolve(
        __dirname,
        '..',
        '..',
        'packages',
        'asset-packs-pipelines',
        'syntheses',
        'read',
        'src',
        'read-need-review-resynthesis.ts'
      ),
      '@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-reads-asset-packs/reading-pipeline-contract': path.resolve(
        __dirname,
        '..',
        '..',
        'packages',
        'asset-packs-pipelines',
        'syntheses',
        'read',
        'src',
        'reading-pipeline-contract.ts'
      ),
      '@bitcode/asset-packs-pipelines-execution-pipeline-simple-settle-asset-pack': path.resolve(
        __dirname,
        '..',
        '..',
        'packages',
        'asset-packs-pipelines',
        'settle',
        'src',
        'index.ts'
      ),
      // Security package: server-safe root and explicit client entry
      '@bitcode/security': path.resolve(__dirname, '..', '..', 'packages', 'security', 'src', 'index.ts'),
      '@bitcode/security/client': path.resolve(__dirname, '..', '..', 'packages', 'security', 'client', 'src', 'index.ts'),
      '@bitcode/mcp-generics/validation': path.resolve(__dirname, '..', '..', 'packages', 'mcp-generics', 'src', 'index.ts'),
      '@bitcode/generic-vcs-git': path.resolve(
        __dirname,
        '..',
        'packages',
        'generic-vcs',
        'git',
        'src',
        'index.ts',
      ),
      '@bitcode/mcp-generics': path.resolve(__dirname, '..', '..', 'packages', 'mcp-generics', 'src', 'index.ts'),
      '@bitcode/mcp-generics$': path.resolve(__dirname, '..', '..', 'packages', 'mcp-generics', 'src', 'index.ts'),
      '@bitcode/mcp-generics': path.resolve(__dirname, '..', '..', 'packages', 'mcp-generics', 'src', 'index.ts'),
      '@bitcode/generic-mcps-bitcode': path.resolve(__dirname, '..', '..', 'packages', 'generic-mcps', 'bitcode', 'src', 'index.ts'),
      // Generic agents umbrella alias
      '@bitcode/generic-agents': path.resolve(__dirname, '..', '..', 'packages', 'agent-generics', 'src', 'index.ts'),
      '@bitcode/generic-agent-code-editor': path.resolve(
        __dirname,
        '..',
        'packages',
        'generic-agents',
        'code-editor',
        'src',
        'index.ts'
      ),
      '@bitcode/generic-agents-vcs': path.resolve(
        __dirname,
        '..',
        'packages',
        'generic-agents',
        'vcs',
        'src',
        'index.ts'
      ),
      '@bitcode/generic-agents-read-comprehension': path.resolve(
        __dirname,
        '..',
        'packages',
        'generic-agents',
        'read-comprehension',
        'src',
        'index.ts'
      ),
      '@bitcode/generic-tools-files-maintaining': path.resolve(
        __dirname,
        '..',
        'packages',
        'generic-tools',
        'files-maintaining',
        'src',
        'index.ts'
      ),
      '@bitcode/generic-tools-editing/execution-context': path.resolve(
        __dirname,
        '..',
        'packages',
        'generic-tools',
        'files-maintaining',
        'src',
        'execution-context.ts'
      ),
      '@bitcode/generic-tools-lsp-query': path.resolve(
        __dirname,
        '..',
        'packages',
        'generic-tools',
        'lsp-query',
        'src',
        'index.ts'
      ),
      '@bitcode/generic-tools-read-comprehension': path.resolve(
        __dirname,
        '..',
        'packages',
        'generic-tools',
        'read-comprehension',
        'src',
        'index.ts'
      ),
      '@bitcode/generic-tools-multimodal-processing': path.resolve(
        __dirname,
        '..',
        'packages',
        'generic-tools',
        'multimodal-processing',
        'src',
        'index.ts'
      ),
      '@bitcode/generic-tools-repository-setup': path.resolve(
        __dirname,
        '..',
        'packages',
        'generic-tools',
        'repository-setup',
        'src',
        'index.ts'
      ),
      '@bitcode/generic-tools-vcs': path.resolve(
        __dirname,
        '..',
        'packages',
        'generic-tools',
        'vcs',
        'src',
        'index.ts'
      ),
      '@bitcode/generic-tools/use-computer/src/index': path.resolve(
        __dirname,
        '..',
        'packages',
        'generic-tools',
        'use-computer',
        'src',
        'index.ts'
      ),
      ...mcpToolAliases,
      'require-in-the-middle': path.resolve(__dirname, 'config', 'stubs', 'require-in-the-middle.js'),
      '@opentelemetry/instrumentation': path.resolve(__dirname, 'config', 'stubs', 'opentelemetry-instrumentation.js'),
      '@opentelemetry/instrumentation/build/esm/index.js': path.resolve(
        __dirname,
        'config',
        'stubs',
        'opentelemetry-instrumentation.js'
      ),
      '@opentelemetry/instrumentation/build/esm/platform/node/instrumentation.js': path.resolve(
        __dirname,
        'config',
        'stubs',
        'opentelemetry-instrumentation.js'
      ),
      '@/lib/validation': path.resolve(
        __dirname,
        '..',
        'packages',
        'pipelines-generics',
        'src',
        'phases',
        'validation'
      ),
      '@/lib/validation/validationOTFAdherencePhaseModule': path.resolve(
        __dirname,
        '..',
        'packages',
        'pipelines-generics',
        'src',
        'phases',
        'validation',
        'index.ts'
      ),
    };
    // Further production optimizations
    if (!dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 50,
        minSize: 20000,
      };
    }
    return config;
  },
};

// Wrap configuration with bundle analyzer capabilities
export default withBundleAnalyzer(nextConfig);

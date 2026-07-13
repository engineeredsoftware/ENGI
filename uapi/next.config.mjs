/** @type {import('next').NextConfig} */
// --------------------------------------
// Make sure uapi/.env.local takes highest precedence, even when a monorepo
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
// without copying secrets into uapi/.env.local. This keeps ordinary package
// local overrides intact while letting the strict pipeline harness use the
// same root env pulled from the staging Vercel project/branch.
if (process.env.BITCODE_UAPI_ENV_FILE) {
  const envFile = path.isAbsolute(process.env.BITCODE_UAPI_ENV_FILE)
    ? process.env.BITCODE_UAPI_ENV_FILE
    : path.resolve(__dirname, process.env.BITCODE_UAPI_ENV_FILE);
  dotenv.config({ path: envFile, override: true });
}

const mcpsToolsRoot = path.resolve(__dirname, '..', 'packages', 'generic-tools', 'mcps-tools');
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
    // pulls in undici syntax newer than this Next/SWC build pipeline accepts.
    serverComponentsExternalPackages: ['@vercel/sandbox'],
  },
  // Transpile workspace packages that the Next app imports directly or
  // transitively so webpack/SWC can handle TS/ESM + monorepo paths.
  transpilePackages: [
    '@bitcode/styling',
    '@bitcode/prompts',
    '@bitcode/pipeline-hosts',
    '@bitcode/pipeline-asset-pack',
    '@bitcode/pipelines-generics',
    '@bitcode/vcs',
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
    '@bitcode/vcs-tools',
    ...mcpToolTranspilePackages,
    '@bitcode/generic-tools-lsp-query',
    '@bitcode/vcs-tools',
    // Core shared libs commonly imported in app/server code
    '@bitcode/protocol',
    '@bitcode/btd',
    '@bitcode/models',
    '@bitcode/files',
    '@bitcode/logger',
    '@bitcode/streams',
    '@bitcode/observability',
    '@bitcode/mcp',
    '@bitcode/git',
    '@bitcode/notion',
    '@bitcode/security',
    '@bitcode/gitlab',
    '@bitcode/bitbucket',
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
        destination: '/packs',
        permanent: false,
      },
      {
        source: '/executions/:runId',
        destination: '/packs?transactionId=:runId',
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
      '@bitcode/sentry$': path.resolve(__dirname, '..', 'packages', 'external-telemetry', 'sentry', 'src', (isServer && !isEdge) ? 'sentry.ts' : 'sentry-edge-stub.ts'),
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
    // Resolve from @bitcode/doc-code package export (built to dist at dev start).
    try {
      const docCodeLoader = require.resolve('@bitcode/doc-code/loader');
      config.module.rules.push({
        test: /\.(ts|tsx)$/,
        include: [
          path.resolve(__dirname, '..', 'packages', 'generic-tools'),
          path.resolve(__dirname, '..', 'packages', 'tools-generics'),
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
      // The dev script should build @bitcode/doc-code before starting dev to enable the loader.
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
        '@bitcode/sentry': path.resolve(__dirname, '..', 'packages', 'external-telemetry', 'sentry', 'src', 'sentry-edge-stub.ts'),
        '@sentry/node': path.resolve(__dirname, '..', 'packages', 'external-telemetry', 'sentry', 'src', 'sentry-edge-stub.ts'),
        '@sentry/nextjs': path.resolve(__dirname, '..', 'packages', 'external-telemetry', 'sentry', 'src', 'sentry-edge-stub.ts'),
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
      '@bitcode/protocol': path.resolve(__dirname, '..', 'packages', 'protocol', 'src', 'index.js'),
      '@bitcode/protocol$': path.resolve(__dirname, '..', 'packages', 'protocol', 'src', 'index.js'),
      '@bitcode/prompts': path.resolve(__dirname, '..', 'packages', 'prompts', 'src', 'index.ts'),
      '@bitcode/execution-generics': path.resolve(
        __dirname,
        '..',
        'packages',
        'execution-generics',
        'src',
        'index.ts'
      ),
      '@bitcode/pipeline-asset-pack$': path.resolve(
        __dirname,
        '..',
        'packages',
        'pipelines',
        'asset-pack',
        'src',
        'index.ts'
      ),
      '@bitcode/pipeline-asset-pack/read-need': path.resolve(
        __dirname,
        '..',
        'packages',
        'pipelines',
        'asset-pack',
        'src',
        'read-need.ts'
      ),
      '@bitcode/pipeline-asset-pack/asset-packs-synthesis': path.resolve(
        __dirname,
        '..',
        'packages',
        'pipelines',
        'asset-pack',
        'src',
        'asset-packs-synthesis.ts'
      ),
      '@bitcode/pipeline-asset-pack/deposit-option-real-synthesis': path.resolve(
        __dirname,
        '..',
        'packages',
        'pipelines',
        'asset-pack',
        'src',
        'deposit-option-real-synthesis.ts'
      ),
      '@bitcode/pipeline-asset-pack/runtime-inference-policy': path.resolve(
        __dirname,
        '..',
        'packages',
        'pipelines',
        'asset-pack',
        'src',
        'runtime-inference-policy.ts'
      ),
      '@bitcode/pipeline-asset-pack/read-need-review-resynthesis': path.resolve(
        __dirname,
        '..',
        'packages',
        'pipelines',
        'asset-pack',
        'src',
        'read-need-review-resynthesis.ts'
      ),
      '@bitcode/pipeline-asset-pack/reading-pipeline-contract': path.resolve(
        __dirname,
        '..',
        'packages',
        'pipelines',
        'asset-pack',
        'src',
        'reading-pipeline-contract.ts'
      ),
      // Security package: server-safe root and explicit client entry
      '@bitcode/security': path.resolve(__dirname, '..', 'packages', 'security', 'src', 'index.ts'),
      '@bitcode/security/client': path.resolve(__dirname, '..', 'packages', 'security', 'src', 'client.ts'),
      '@bitcode/engine/pipeline/pipelineSDIVF': path.resolve(
        __dirname,
        '..',
        'packages',
        'pipelines',
        'asset-pack',
        'src',
        'run.ts'
      ),
      '@bitcode/engine/pipeline/pipelineMeasureSDIVS': path.resolve(
        __dirname,
        '..',
        'packages',
        'pipelines',
        'measure',
        'src',
        'run.ts'
      ),
      '@bitcode/mcp/validation': path.resolve(__dirname, '..', 'packages', 'mcp-generics', 'src', 'index.ts'),
      '@bitcode/git': path.resolve(__dirname, '..', 'packages', 'git', 'src', 'index.ts'),
      '@bitcode/mcp': path.resolve(__dirname, '..', 'packages', 'mcp-generics', 'src', 'index.ts'),
      '@bitcode/mcp$': path.resolve(__dirname, '..', 'packages', 'mcp-generics', 'src', 'index.ts'),
      '@bitcode/mcp-generics': path.resolve(__dirname, '..', 'packages', 'mcp-generics', 'src', 'index.ts'),
      '@bitcode/generic-mcps-bitcode': path.resolve(__dirname, '..', 'packages', 'generic-mcps', 'bitcode', 'src', 'index.ts'),
      // Generic agents umbrella alias
      '@bitcode/generic-agents': path.resolve(__dirname, '..', 'packages', 'agent-generics', 'src', 'index.ts'),
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
      '@bitcode/vcs-tools': path.resolve(
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

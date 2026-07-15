/**
 * Storybook main config for the Bitcode uapi surface.
 *
 * Catalog is the maintainable story set under .storybook/stories/ (known-broken
 * marketplace/auto stories were removed from the tree). Server-only Node
 * packages (Sentry, fs, etc.) are stubbed via webpack fallbacks so client
 * stories that transitively import observability do not fail the build.
 *
 * Preview imports only app/globals.css so Tailwind layers are established
 * before any @layer utilities CSS.
 */
import type { StorybookConfig } from "@storybook/nextjs";
import path from "path";

const config: StorybookConfig = {
  stories: [
    // Curated catalog roots. Do not use a single ** glob over all of .storybook/stories/
    // while marketplace/auto deferred stories may reappear on disk.
    "./stories/*.stories.@(js|jsx|mjs|ts|tsx)",
    "./stories/base/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "./stories/components/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "./stories/ui/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "./stories/docs/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: [
    "@storybook/addon-onboarding",
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@chromatic-com/storybook",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/nextjs",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  staticDirs: ["../public"],
  webpackFinal: async (config) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { TsconfigPathsPlugin } = require("tsconfig-paths-webpack-plugin");
    config.resolve = config.resolve || {};
    config.resolve.plugins = config.resolve.plugins || [];
    config.resolve.plugins.push(
      new TsconfigPathsPlugin({ extensions: config.resolve.extensions })
    );
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@": path.resolve(__dirname, ".."),
      // Client stories must not pull Node SDK entrypoints into the iframe.
      "@sentry/node": false,
      "@sentry/profiling-node": false,
    };
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      module: false,
      fs: false,
      path: false,
      os: false,
      crypto: false,
      stream: false,
      http: false,
      https: false,
      zlib: false,
      net: false,
      tls: false,
      child_process: false,
      worker_threads: false,
      diagnostics_channel: false,
      async_hooks: false,
      inspector: false,
    };
    return config;
  },
};

export default config;

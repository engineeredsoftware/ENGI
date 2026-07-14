/**
 * Storybook preview: global styles and layout for every story.
 *
 * Import only app/globals.css. Do NOT bulk-require styles/* — files such as
 * ring-utilities.css use `@layer utilities` without a preceding
 * `@tailwind utilities` directive and break the Storybook postcss/tailwind
 * pipeline (SB_BUILDER-WEBPACK5_0003). globals.css owns the Tailwind layers.
 */
import type { Preview } from '@storybook/react';

import '../app/globals.css';

export const parameters: Preview['parameters'] = {
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/i,
    },
  },
  backgrounds: {
    default: 'dark',
    values: [
      { name: 'dark', value: '#030816' },
      { name: 'light', value: '#ffffff' },
    ],
  },
  layout: 'fullscreen',
};

export const decorators = [
  (Story) => (
    <div className="dark min-h-screen bg-background text-foreground p-6">
      <Story />
    </div>
  ),
];

const preview: Preview = {
  parameters,
  decorators,
};

export default preview;

import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import ExecutionPageHeader from '@/components/bitcode/pipeline/ExecutionsPageHeader/ExecutionsPageHeader';
import { templates as defaultTemplates } from '@/config/templates';

const sampleShippables = {
  pullRequest: {
    url: 'https://github.com/openai/react/pull/574',
    number: 574,
    title: 'Improve accessibility on Button component',
    description: 'Adds ARIA labels and keyboard support to the Button component to meet WCAG 2.1 standards. Includes unit tests and documentation updates.',
    status: 'open',
    createdAt: '2025-04-28T10:15:00Z',
  },
  fileChanges: {
    edited: 5,
    created: 2,
    deleted: 0,
    paths: [
      'src/components/Button/Button.tsx',
      'src/components/Button/Button.test.tsx',
      'src/styles/theme.css',
    ],
    charDiff: { edited: 350, created: 120, deleted: 20 },
  },
  summary: `The pipeline execution completed successfully.
- Accessibility improvements applied
- 7 new tests added
- Dark mode feature planned for next iteration`,
};

const sampleStats = {
  time: '3m 12s',
  tokens: { input: 1500, output: 800, total: 2300 },
  btcFeesPaid: 0.000012,
};

const sampleRepoSnapshot = {
  org: 'openai',
  repo: 'react',
  branch: 'main',
  commit: 'd4e5f6a7',
};

const meta = {
  title: 'Executions/ExecutionPageHeader',
  component: ExecutionPageHeader,
  tags: ['autodocs'],
  argTypes: {
    executionStatus: { control: { type: 'radio' }, options: ['execute', 'executing', 'executed'] },
    shippables: { control: 'object' },
    processingStats: { control: 'object' },
    repoSnapshot: { control: 'object' },
    showSourceEdu: { control: 'boolean' },
    showAttachmentsEdu: { control: 'boolean' },
    showEnhanceEdu: { control: 'boolean' },
    showSaveTemplateEdu: { control: 'boolean' },
    showExecuteButtonEdu: { control: 'boolean' },
    templates: { control: 'object' },
  },
} satisfies Meta<typeof ExecutionPageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Execute: Story = {
  args: {
    executionStatus: 'execute',
    onSelectShippableTemplateDefinitionOfNeed: action('onSelectShippableTemplateDefinitionOfNeed'),
    showSourceEdu: false,
    showAttachmentsEdu: false,
    showEnhanceEdu: false,
    showSaveTemplateEdu: false,
    showExecuteButtonEdu: false,
    templates: defaultTemplates,
    onTemplateSelect: action('onTemplateSelect'),
  },
};

export const Executed: Story = {
  args: {
    executionStatus: 'executed',
    onSelectShippableTemplateDefinitionOfNeed: action('onSelectShippableTemplateDefinitionOfNeed'),
    showSourceEdu: false,
    showAttachmentsEdu: false,
    showEnhanceEdu: false,
    showSaveTemplateEdu: false,
    showExecuteButtonEdu: false,
    templates: defaultTemplates,
    onTemplateSelect: action('onTemplateSelect'),
    shippables: sampleShippables,
    processingStats: sampleStats,
    repoSnapshot: sampleRepoSnapshot,
  },
};

// ---------------------------------------------------------------------------
//  In-Progress state – run is still processing / streaming summary
// ---------------------------------------------------------------------------

export const Executing: Story = {
  args: {
    executionStatus: 'executing',
    onSelectShippableTemplateDefinitionOfNeed: action('onSelectShippableTemplateDefinitionOfNeed'),
    showSourceEdu: false,
    showAttachmentsEdu: false,
    showEnhanceEdu: false,
    showSaveTemplateEdu: false,
    showExecuteButtonEdu: false,
    templates: defaultTemplates,
    onTemplateSelect: action('onTemplateSelect'),
    shippables: sampleShippables,
    processingStats: {
      time: '2m 07s',
      tokens: { input: 900, output: 450, total: 1350 },
      btcFeesPaid: 0.000009,
    },
    repoSnapshot: sampleRepoSnapshot,
  },
};

// ---------------------------------------------------------------------------
//  Educational overlay variants (execute mode with specific education bubble open)
// ---------------------------------------------------------------------------

const eduBaseArgs = {
  executionStatus: 'execute' as const,
  onSelectShippableTemplateDefinitionOfNeed: action('onSelectShippableTemplateDefinitionOfNeed'),
  templates: defaultTemplates,
  onTemplateSelect: action('onTemplateSelect'),
};

export const SourceEdu: Story = {
  name: 'Execute – Source edu',
  args: {
    ...eduBaseArgs,
    showSourceEdu: true,
  },
};

export const AttachmentsEdu: Story = {
  name: 'Execute – Attachments edu',
  args: {
    ...eduBaseArgs,
    showAttachmentsEdu: true,
  },
};

export const ExecuteButtonEdu: Story = {
  name: 'Execute – Execute-button edu',
  args: {
    ...eduBaseArgs,
    showExecuteButtonEdu: true,
  },
};

export const SaveTemplateEdu: Story = {
  name: 'Execute – Save-template edu',
  args: {
    ...eduBaseArgs,
    showSaveTemplateEdu: true,
  },
};

export const EnhanceEdu: Story = {
  name: 'Execute – Enhance edu',
  args: {
    ...eduBaseArgs,
    showEnhanceEdu: true,
  },
};
// Fully configurable header story
export const Configurable: Story = {
  name: 'Configurable',
  args: {
    executionStatus: 'execute',
    onSelectShippableTemplateDefinitionOfNeed: action('onSelectShippableTemplateDefinitionOfNeed'),
    showSourceEdu: false,
    showAttachmentsEdu: false,
    showEnhanceEdu: false,
    showSaveTemplateEdu: false,
    showExecuteButtonEdu: false,
    templates: defaultTemplates,
    onTemplateSelect: action('onTemplateSelect'),
    shippables: sampleShippables,
    processingStats: sampleStats,
    repoSnapshot: sampleRepoSnapshot,
  },
  render: (args) => <ExecutionPageHeader {...args} />,
};

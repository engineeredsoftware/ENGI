import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import ExecutionReadInput from '@/components/bitcode/execution/ExecutionReadInput';

const meta = {
  title: 'Shippables/ReadInput',
  component: ExecutionReadInput,
  tags: ['autodocs'],
  argTypes: {
    isProcessing: { control: 'boolean' },
    placeholder: { control: 'text' },
    initialNeed: { control: 'text' },
  },
} satisfies Meta<typeof ExecutionReadInput>;

export default meta;
type Story = StoryObj<typeof meta>;

const Template: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.initialNeed || '');
    return (
      <ExecutionReadInput
        {...args}
        definitionOfRead={value}
        onChange={(val) => {
          setValue(val);
          action('onChange')(val);
        }}
        attachments={[]}
        onEnhanceError={action('onEnhanceError')}
        repoSlug="storybook/storybook"
      />
    );
  },
};

export const Default: Story = {
  ...Template,
  args: {
    isProcessing: false,
    placeholder: 'Definition of Read...',
    initialNeed: '',
  },
};

export const Processing: Story = {
  ...Template,
  args: {
    isProcessing: true,
    placeholder: 'Definition of Read...',
    initialNeed: 'Existing Read content',
  },
};

// ---------------------------------------------------------------------------
//  With file attachments – shows attachment badges + enhance button active
// ---------------------------------------------------------------------------

export const WithAttachments: Story = {
  ...Template,
  name: 'With attachments',
  args: {
    isProcessing: false,
    placeholder: 'Definition of Read...',
    initialNeed: 'Profile the new indexing pipeline and optimise hotspots',
  },
  render: (args) => {
    const [value, setValue] = React.useState(args.initialNeed || '');
    return (
      <ExecutionReadInput
        {...args}
        definitionOfRead={value}
        onChange={(val) => {
          setValue(val);
          action('onChange')(val);
        }}
        attachments={[
          { id: 'att1', type: 'image', url: 'https://placehold.co/100x100?text=CPU' },
          { id: 'att2', type: 'file', name: 'stacktrace.log' },
        ] as any}
        onEnhanceError={action('onEnhanceError')}
        repoSlug="acme/repo"
      />
    );
  },
};

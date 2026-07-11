import type { Meta, StoryObj } from '@storybook/react';
import SectionWrapper from '@/components/marketing/SectionWrapper/SectionWrapper';

const meta: Meta<typeof SectionWrapper> = {
  title: 'Components/SectionWrapper',
  component: SectionWrapper,
  tags: ['autodocs'],
  argTypes: {
    id: { control: 'text' },
    className: { control: 'text' },
  },
};
export default meta;
type Story = StoryObj<typeof SectionWrapper>;

export const Default: Story = {
  args: {
    id: 'section',
    className: 'bg-gray-100',
  },
  render: (args) => (
    <SectionWrapper {...args}>
      <h1>Section Title</h1>
      <p>This is some section content inside the wrapper.</p>
    </SectionWrapper>
  ),
};
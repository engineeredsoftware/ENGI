import type { Meta, StoryObj } from '@storybook/react';
import Card from '@/components/bitcode/panels/card';
import { Sun } from 'lucide-react';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    name: { control: 'text' },
    description: { control: 'text' },
    href: { control: 'text' },
    cta: { control: 'text' },
    disabled: { control: 'boolean' },
    special: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    name: 'Example Card',
    description: 'This is a description for the example card.',
    href: '#',
    cta: 'Learn More',
    disabled: false,
    special: false,
    className: '',
    background: <div style={{ background: 'theme(colors.slate.200)', height: '100px' }} />, 
    Icon: Sun,
  },
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
  },
};

export const Special: Story = {
  args: {
    ...Default.args,
    special: true,
  },
};
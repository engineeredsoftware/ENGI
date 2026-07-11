import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '@/components/shadcn/input';

const meta = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    type: { control: 'select', options: ['text', 'password', 'email', 'number', 'search'] },
    onChange: { action: 'changed' },
    value: { control: 'text' },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Type here...',
  },
};

export const WithValue: Story = {
  args: {
    value: 'Hello',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Disabled input',
  },
};

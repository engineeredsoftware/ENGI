import type { Meta, StoryObj } from '@storybook/react';
import Logo from '@/components/bitcode/branding/logo';
import XLogo from '@/components/bitcode/branding/x-logo';

const meta: Meta<typeof Logo> = {
  title: 'Components/Logo',
  component: Logo,
  tags: ['autodocs'],
  argTypes: {
    beta: { control: 'boolean' },
    className: { control: 'text' },
    height: { control: 'text' },
    width: { control: 'text' },
    fill: { control: 'color' },
  },
};
export default meta;
type Story = StoryObj<typeof Logo>;

export const Default: Story = {
  args: {
    beta: false,
    className: '',
    height: 'h-10',
    width: 'h-10',
    fill: '#67FEB7', // brand emerald
  },
};

export const Beta: Story = {
  args: {
    ...Default.args,
    beta: true,
  },
};

export const XLogoOnly: StoryObj<typeof XLogo> = {
  component: XLogo,
  title: 'Components/XLogo',
};
import type { Meta, StoryObj } from '@storybook/react';
import CodeBlock from '@/components/bitcode/media/SyntaxHighlighter/SyntaxHighlighter';

const sampleCode = `function hello(name) {
  console.log('Hello, ' + name);
}`;

const meta: Meta<typeof CodeBlock> = {
  title: 'Components/CodeBlock',
  component: CodeBlock,
  tags: ['autodocs'],
  argTypes: {
    language: { control: 'text' },
    children: { control: 'text' },
  },
};
export default meta;
type Story = StoryObj<typeof CodeBlock>;

export const Default: Story = {
  args: {
    language: 'javascript',
    children: sampleCode,
    className: 'language-javascript',
  },
};
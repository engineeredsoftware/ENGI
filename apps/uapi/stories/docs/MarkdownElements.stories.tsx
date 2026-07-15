import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MarkdownRenderer: React.FC<{ markdown: string }> = ({ markdown }) => (
  <div className="prose prose-invert max-w-none p-8">
    <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
  </div>
);

export default {
  title: 'Documentation/Markdown Elements',
  component: MarkdownRenderer,
  parameters: { backgrounds: { default: 'light' }, layout: 'fullscreen' },
} as Meta<typeof MarkdownRenderer>;

type Story = StoryObj<typeof MarkdownRenderer>;

export const Basic: Story = {
  render: () => (
    <MarkdownRenderer markdown={`# Heading 1\n## Heading 2\n\nThis is a sample paragraph demonstrating **bold**, _italic_, and \`inline code\`.`} />
  ),
};

export const Extended: Story = {
  render: () => (
    <MarkdownRenderer markdown={`- List item 1\n- List item 2\n\n> This is a blockquote example.\n\n\`\`\`js\nconsole.log('Hello, Bitcode!');\n\`\`\`\n\n| A | B |\n|---|---|\n| 1 | 2 |\n\n![Placeholder](https://via.placeholder.com/150)\n\n[Bitcode Spec](https://github.com/engineeredsoftware/bitcode/blob/main/BITCODE_SPEC.txt)`} />
  ),
};

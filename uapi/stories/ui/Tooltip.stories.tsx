import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/shadcn/tooltip';
import { Button } from '@/components/shadcn/button';

const meta = {
  title: 'UI/Tooltip',
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover me</Button>
        </TooltipTrigger>
        <TooltipContent>
          Tooltip message
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

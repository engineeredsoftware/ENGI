import type { Meta, StoryObj } from '@storybook/react';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from '@/components/shadcn/table';

const meta = {
  title: 'UI/Table',
  tags: ['autodocs'],
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <Table>
      <TableCaption>Users</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Age</TableHead>
          <TableHead>Email</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Alice</TableCell>
          <TableCell>25</TableCell>
          <TableCell>alice@example.com</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Bob</TableCell>
          <TableCell>30</TableCell>
          <TableCell>bob@example.com</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableHead>Total</TableHead>
          <TableCell>2 users</TableCell>
          <TableCell />
        </TableRow>
      </TableFooter>
    </Table>
  ),
};

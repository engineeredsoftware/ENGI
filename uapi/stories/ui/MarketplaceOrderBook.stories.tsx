import type { Meta, StoryObj } from '@storybook/react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/shadcn/table';

const meta = {
  title: 'Marketplace/OrderBook',
  tags: ['autodocs'],
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample data for order book
const sampleOrders = [
  { id: '1', type: 'upgrade', asset: 'knowledge_extension', side: 'sell', price: 100, quantity: 5, owner: 'alice' },
  { id: '2', type: 'shippable', asset: 'pr', side: 'buy', price: 150, quantity: 2, owner: 'bob' },
  { id: '3', type: 'upgrade', asset: 'knowledge_extension', side: 'buy', price: 120, quantity: 1, owner: 'carol' },
];

export const OrderBook: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Asset</TableHead>
          <TableHead>Side</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Owner</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sampleOrders.map(order => (
          <TableRow key={order.id}>
            <TableCell>{order.id}</TableCell>
            <TableCell>{order.type}</TableCell>
            <TableCell>{order.asset}</TableCell>
            <TableCell>{order.side}</TableCell>
            <TableCell>{order.price}</TableCell>
            <TableCell>{order.quantity}</TableCell>
            <TableCell>{order.owner}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

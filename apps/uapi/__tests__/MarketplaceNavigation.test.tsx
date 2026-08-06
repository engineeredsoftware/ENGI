/** @jest-environment jsdom */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MarketplacePage from '@/app/marketplace/page';

// ---------------------------------------------------------------------------
// Helpers / mocks
// ---------------------------------------------------------------------------

// Basic EventSource stub so the OrderBook component thinks SSE is supported.
class EventSourceMock {
  onmessage: ((this: EventSource, ev: MessageEvent<any>) => any) | null = null;
  onerror: ((this: EventSource, ev: Event) => any) | null = null;
  constructor(public url: string) {
    (global as any)._lastEventSource = this;
  }
  close = jest.fn();
  // helper to push data events into listeners
  emit(data: any) {
    this.onmessage?.({ data: JSON.stringify(data) } as any);
  }
}
(global as any).EventSource = EventSourceMock;

// Mock fetch for listings route and detail route
global.fetch = jest.fn((url: RequestInfo) => {
  if (typeof url === 'string' && url.startsWith('/api/marketplace/listings')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ listings: [] }),
    }) as any;
  }
  return Promise.resolve({ ok: true, json: () => Promise.resolve([]) }) as any;
}) as any;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Marketplace navigation flow', () => {
  it('opens detail view when a listing row is clicked and back arrow restores list', async () => {
    render(<MarketplacePage />);

    // Push a fake listing via SSE mock so the OrderBook renders a row.
    const es = (global as any)._lastEventSource as EventSourceMock | undefined;
    if (es) {
      es.emit([
        {
          id: 'L1',
          type: 'shippable',
          asset: 'pr',
          side: 'sell',
          price: 100,
          quantity: 2,
          owner: 'alice',
          measure: 90,
        },
      ]);
    }

    // Wait for the row to appear
    const row = await screen.findByText('shippable');
    fireEvent.click(row);

    // Detail header appears
    expect(await screen.findByText(/Listing L1/i)).toBeInTheDocument();

    // Click back arrow
    fireEvent.click(screen.getByText('← Back'));

    // Order book appears again
    await waitFor(() => expect(screen.getByText('shippable')).toBeInTheDocument());
  });
});

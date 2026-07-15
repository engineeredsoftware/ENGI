import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ConversationRehearsalPanel from '@/components/conversations/ConversationRehearsalPanel/ConversationRehearsalPanel';

describe('ConversationRehearsalPanel', () => {
  it('shows source-safe rehearsal posture and blocks value-bearing mainnet', async () => {
    const user = userEvent.setup();
    render(
      <ConversationRehearsalPanel
        conversationId="conv-1"
        defaultSourceText="protected source with token=abc12345678901234567890"
      />,
    );

    expect(screen.getByTestId('conversation-rehearsal-proof')).toBeTruthy();
    expect(screen.getByText('Rehearsal Proof')).toBeTruthy();
    expect(screen.getByDisplayValue(/protected source/)).toBeTruthy();

    await user.selectOptions(screen.getByLabelText(/conversation rehearsal lane/i), 'value-bearing-mainnet');
    await user.selectOptions(screen.getByLabelText(/conversation rehearsal flow/i), 'product_handoff');
    await user.click(screen.getByRole('button', { name: /refresh conversation rehearsal preview/i }));

    expect(screen.getByText('Value-bearing mainnet blocked Terminal handoff rehearsal')).toBeTruthy();
    expect(screen.getAllByText(/mainnet blocked/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/no ledger authority/i)).toBeTruthy();
    expect(screen.getByText(/no wallet signing/i)).toBeTruthy();
    expect(screen.getByLabelText(/source-safe conversation rehearsal preview/i).textContent).not.toContain(
      'abc12345678901234567890',
    );
  });
});

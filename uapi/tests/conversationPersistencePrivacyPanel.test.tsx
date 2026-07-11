import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ConversationPersistencePrivacyPanel from '@/components/conversations/ConversationPersistencePrivacyPanel/ConversationPersistencePrivacyPanel';

describe('ConversationPersistencePrivacyPanel', () => {
  it('shows source-safe persistence posture and redacts protected text', async () => {
    const user = userEvent.setup();
    render(
      <ConversationPersistencePrivacyPanel
        conversationId="conv-1"
        defaultSourceText="raw prompt with protected source and token=abc12345678901234567890"
      />,
    );

    expect(screen.getByTestId('conversation-persistence-privacy')).toBeTruthy();
    expect(screen.getByText('Persistence Privacy')).toBeTruthy();
    expect(screen.getByDisplayValue(/raw prompt/)).toBeTruthy();

    await user.click(screen.getByRole('button', { name: /refresh persistence privacy preview/i }));

    expect(screen.getAllByText(/redacted/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/conversation-persistence-privacy:/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/protected source payloads/i)).toBeTruthy();
    expect(screen.getByLabelText(/source-safe persistence privacy preview/i).textContent).not.toContain(
      'abc12345678901234567890',
    );
  });
});

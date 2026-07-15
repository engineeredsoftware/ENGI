import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ConversationTelemetryProofPanel from '@/components/conversations/ConversationTelemetryProofPanel/ConversationTelemetryProofPanel';

describe('ConversationTelemetryProofPanel', () => {
  it('shows source-safe telemetry proof posture and redacts protected text', async () => {
    const user = userEvent.setup();
    render(
      <ConversationTelemetryProofPanel
        conversationId="conv-1"
        defaultSourceText="raw prompt with protected source and token=abc12345678901234567890"
      />,
    );

    expect(screen.getByTestId('conversation-telemetry-proof')).toBeTruthy();
    expect(screen.getByText('Telemetry Proof')).toBeTruthy();
    expect(screen.getByDisplayValue(/raw prompt/)).toBeTruthy();

    await user.selectOptions(screen.getByLabelText(/conversation telemetry event family/i), 'tool');
    await user.click(screen.getByRole('button', { name: /refresh telemetry proof preview/i }));

    expect(screen.getByText('conversation.tool.completed')).toBeTruthy();
    expect(screen.getByText('conversation.dashboard.tool-policy')).toBeTruthy();
    expect(screen.getByText('runbook.conversation.tool-policy-denial')).toBeTruthy();
    expect(screen.getAllByText(/source-safe/i).length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/source-safe telemetry proof preview/i).textContent).not.toContain(
      'abc12345678901234567890',
    );
  });
});

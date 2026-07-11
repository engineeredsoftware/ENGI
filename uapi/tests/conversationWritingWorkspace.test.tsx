import '@testing-library/jest-dom';
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import ConversationWritingWorkspace from '@/components/conversations/ConversationWritingWorkspace/ConversationWritingWorkspace';
import {
  buildConversationWritingWorkspaceHandoff,
  summarizeConversationWritingWorkspaceDraft,
} from '@/components/conversations/models/conversation-writing-workspace';

describe('ConversationWritingWorkspace', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('summarizes and hands off only source-safe draft metadata', async () => {
    const onHandoff = jest.fn();
    const token = ['sk', 'local_unsafe_example_value_12345'].join('-');
    const rawDraft = [
      'Read this repository for a migration plan.',
      '```ts',
      'const protectedSource = true;',
      '```',
      `token=${token}`,
    ].join('\n');

    render(<ConversationWritingWorkspace conversationId="conv-1" onHandoff={onHandoff} />);

    const draft = screen.getByLabelText('Read Request draft');
    fireEvent.change(draft, { target: { value: rawDraft } });
    fireEvent.click(screen.getByRole('button', { name: 'Summarize workspace draft' }));

    expect(screen.getByLabelText('Workspace source-safe summary')).toHaveTextContent('[redacted-source-block]');
    expect(screen.getByLabelText('Workspace source-safe summary')).toHaveTextContent('[redacted-secret-field]');
    expect(screen.getByLabelText('Workspace source-safe summary')).not.toHaveTextContent('protectedSource');
    expect(screen.getByLabelText('Workspace source-safe summary')).not.toHaveTextContent(token);

    fireEvent.click(screen.getByRole('button', { name: 'Handoff workspace summary' }));
    await waitFor(() => expect(onHandoff).toHaveBeenCalledTimes(1));
    const handoff = onHandoff.mock.calls[0][0];
    expect(handoff.metadata.disclosureClass).toBe('source_safe_conversation_writing_workspace_handoff');
    expect(handoff.metadata.protectedSourceVisible).toBe(false);
    expect(handoff.message).toContain('Disclosure: source-safe workspace summary only.');
    expect(handoff.message).not.toContain('protectedSource');
    expect(handoff.message).not.toContain(token);
  });

  it('saves, restores, and switches writing modes with accessible controls', () => {
    render(<ConversationWritingWorkspace conversationId="conv-restore" initialMode="need_feedback" />);

    expect(screen.getByRole('tab', { name: 'Need' })).toHaveAttribute('aria-selected', 'true');
    const draft = screen.getByLabelText('Need Feedback draft');
    fireEvent.change(draft, { target: { value: 'Need should mention rollback evidence.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save workspace draft' }));
    expect(screen.getByRole('status')).toHaveTextContent('draft saved locally');

    fireEvent.change(draft, { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Restore workspace draft' }));
    expect(screen.getByLabelText('Need Feedback draft')).toHaveValue('Need should mention rollback evidence.');

    fireEvent.click(screen.getByRole('tab', { name: 'Handoff' }));
    expect(screen.getByLabelText('Terminal Handoff Summary draft')).toBeInTheDocument();
  });

  it('helper functions redact source-bearing draft text before preview or handoff', () => {
    const token = ['sb', 'secret'].join('_') + '__localunsafevalue';
    const draft = `password: ${token}\nPlease prepare the Terminal summary.`;
    const summary = summarizeConversationWritingWorkspaceDraft('terminal_handoff_summary', draft);
    const handoff = buildConversationWritingWorkspaceHandoff('terminal_handoff_summary', draft);

    expect(summary.redactionApplied).toBe(true);
    expect(summary.sourceSafePreview).toContain('[redacted-secret-field]');
    expect(summary.sourceSafePreview).not.toContain(token);
    expect(handoff.message).toContain('Terminal Handoff Summary');
    expect(handoff.message).not.toContain(token);
  });
});

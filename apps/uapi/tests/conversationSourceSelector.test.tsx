import '@testing-library/jest-dom';
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import ConversationSourceSelector from '@/components/conversations/ConversationSourceSelector/ConversationSourceSelector';
import {
  buildConversationSourceSelectorPreview,
  redactConversationSourceSelectorRef,
} from '@/components/conversations/models/conversation-source-selector';

describe('ConversationSourceSelector', () => {
  it('selects source-safe repository context with proof and event metadata', async () => {
    const onSelect = jest.fn();

    render(
      <ConversationSourceSelector
        initialKind="repository"
        initialSourceRef="octocat/Spoon-Knife"
        onSelect={onSelect}
      />,
    );

    expect(screen.getByLabelText('Source-safe selector preview')).toHaveTextContent('allowed');
    expect(screen.getByLabelText('Source-safe selector preview')).toHaveTextContent('octocat/Spoon-Knife');

    fireEvent.click(screen.getByRole('button', { name: 'Select conversation source' }));
    await waitFor(() => expect(onSelect).toHaveBeenCalledTimes(1));

    const preview = onSelect.mock.calls[0][0];
    expect(preview.metadata.disclosureClass).toBe('source_safe_conversation_source_selector_preview');
    expect(preview.metadata.protectedSourceVisible).toBe(false);
    expect(preview.metadata.unpaidAssetPackSourceVisible).toBe(false);
    expect(preview.proofRoot).toMatch(/^conversation-source-selector:/u);
  });

  it('shows retry posture for wallet-bound BTD range without a connected wallet', () => {
    render(
      <ConversationSourceSelector
        initialKind="btd_range"
        initialSourceRef="btd:range:001-004"
        initialGovernance={{ wallet: 'missing' }}
      />,
    );

    expect(screen.getByLabelText('Source-safe selector preview')).toHaveTextContent('retry required');
    expect(screen.getByLabelText('Source-safe selector preview')).toHaveTextContent('connect_wallet_or_select_non_wallet_source');
  });

  it('denies protected source disclosure and redacts source-shaped references', () => {
    const token = ['sk', 'local_unsafe_example_value_12345'].join('-');
    const ref = ['repository context', '```ts', 'const protectedSource = true;', '```', `token=${token}`].join('\n');
    const redacted = redactConversationSourceSelectorRef(ref);
    const preview = buildConversationSourceSelectorPreview({
      kind: 'document',
      sourceRef: ref,
      governance: {
        account: 'authenticated',
        organization: 'allowed',
        wallet: 'not_required',
        rights: 'preview_allowed',
        settlement: 'not_required',
        disclosure: 'protected_source_requested',
        policy: 'allowed',
      },
    });

    expect(redacted.redactionApplied).toBe(true);
    expect(preview.previewState).toBe('denied');
    expect(preview.denialReason).toBe('requested_disclosure_crosses_source_safe_boundary');
    expect(preview.sourceSafeRefSummary).toContain('[redacted-source-block]');
    expect(preview.sourceSafeRefSummary).toContain('[redacted-secret-field]');
    expect(preview.sourceSafeRefSummary).not.toContain('protectedSource');
    expect(preview.sourceSafeRefSummary).not.toContain(token);
  });
});

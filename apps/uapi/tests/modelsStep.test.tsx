import React from 'react';
import { renderToString } from 'react-dom/server';
import ModelsStep from '@/components/auxillaries/AuxillariesModels/AuxillariesModels';

describe('ModelsStep (SSR)', () => {
  it('renders multiple model configuration rows and Save button with initial data', () => {
    const initialModelPreferences = {
      modelCalls: [
        {
          id: 'call1', phase: 'plan', agent: 'agentA', step: 'prepare', failsafe: 'prepare_concise_context', generation: 'reason',
          model: 'gpt-4', systemPrompt: 'Prompt A', fullName: 'Agent A Reason'
        },
        {
          id: 'call2', phase: 'plan', agent: 'agentB', step: 'try', failsafe: 'chunk_then_sum', generation: 'judge',
          model: 'gpt-3.5', systemPrompt: 'Prompt B', fullName: 'Agent B Judge'
        }
      ]
    };
    const html = renderToString(
      <ModelsStep
        loading={false}
        isFirstTimeUser={false}
        isDevMode={false}
        initialModelPreferences={initialModelPreferences}
        onCompletionStatusChange={() => {}}
        onSave={() => {}}
      />
    );
    // Hidden submit button
    expect(html).toContain('id="models-submit-button"');
    // Visible Save button
    expect(html).toContain('Save Configuration');
    // Global prompt section
    expect(html).toContain('Global System Prompt');
    // First model call
    expect(html).toContain('gpt-4');
    expect(html).toContain('Prompt A');
    expect(html).toContain('Agent A Reason');
    // Second model call
    expect(html).toContain('gpt-3.5');
    expect(html).toContain('Prompt B');
    expect(html).toContain('Agent B Judge');
  });
});

import React from 'react';
import { renderToString } from 'react-dom/server';
import ExternalsPane from '@/components/auxillaries/AuxillariesExternals/AuxillariesExternals';

describe('ExternalsPane API Keys UI (SSR)', () => {
  it('renders Generate API Key section', () => {
    const html = renderToString(
      <ExternalsPane
        loading={false}
        initialConnectionData={{}}
        isFirstTimeUser={false}
        onCompletionStatusChange={() => {}}
        isDevMode={false}
        onSave={() => {}}
      />
    );
    expect(html).toContain('API Keys');
    expect(html).toContain('Generate API Key');
  });
});

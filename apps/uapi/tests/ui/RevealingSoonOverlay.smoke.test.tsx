import React from 'react';
import { render } from '@testing-library/react';
import RevealingSoonOverlay from '@/components/bitcode/overlays/RevealingSoonOverlay/RevealingSoonOverlay';

describe('RevealingSoonOverlay (smoke)', () => {
  it('renders in a container without crashing', () => {
    const { container } = render(
      <div style={{ position: 'relative', width: 320, height: 120 }}>
        <RevealingSoonOverlay stretch={false} />
      </div>
    );
    expect(container.firstChild).toBeTruthy();
  });
});


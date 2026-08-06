import React from 'react';
import { render, screen } from '@testing-library/react';
import GlassyInput from '@/components/bitcode/inputs/GlassyInput/GlassyInput';

describe('GlassyInput (smoke)', () => {
  it('renders children inside container', () => {
    render(
      <GlassyInput>
        <textarea aria-label="gi" />
      </GlassyInput>
    );
    expect(screen.getByLabelText('gi')).toBeInTheDocument();
  });
});


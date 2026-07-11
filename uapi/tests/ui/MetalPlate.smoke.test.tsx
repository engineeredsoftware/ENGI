import React from 'react';
import { render, screen } from '@testing-library/react';
import MetalPlate from '@/components/bitcode/MetalPlate/MetalPlate';

describe('MetalPlate (smoke)', () => {
  it('renders headline and children', () => {
    render(
      <MetalPlate headline="Test Headline">
        <div>Inner</div>
      </MetalPlate>
    );
    expect(screen.getByText('Test Headline')).toBeInTheDocument();
    expect(screen.getByText('Inner')).toBeInTheDocument();
  });
});


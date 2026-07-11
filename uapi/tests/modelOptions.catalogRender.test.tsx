import React from 'react';
import { render, screen } from '@testing-library/react';
import ModelOptions from '@/components/bitcode/execution/model-options';
import { SUPPORTED_LLM_MODELS } from '@/utils/model-pricing';

describe('ModelOptions uses centralized model catalog', () => {
  test('renders at least one known model friendly id', () => {
    render(<ModelOptions />);
    const sample = SUPPORTED_LLM_MODELS[0]?.models[0];
    expect(sample).toBeDefined();
    if (sample) {
      expect(screen.getByText(sample.id)).toBeInTheDocument();
    }
  });
});


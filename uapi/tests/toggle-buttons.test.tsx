import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { ExecutionOptionToggle } from '@/components/bitcode/pipeline/execution-option-toggle';

describe('ExecutionOptionToggle component', () => {
  it('calls onToggle when clicked', () => {
    const onToggle = jest.fn();
    const { getByRole } = render(
      <ExecutionOptionToggle enabled={false} onToggle={onToggle} type="fit-review" />
    );
    fireEvent.click(getByRole('button'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('renders fit-review evidence icon', () => {
    const { container } = render(
      <ExecutionOptionToggle enabled={false} onToggle={() => {}} type="fit-review" />
    );
    // Fit-review icon renders evidence nodes and connecting path.
    expect(container.querySelectorAll('circle').length).toBeGreaterThanOrEqual(3);
    expect(container.querySelector('path')).not.toBeNull();
  });

  it('renders internal computer-use measurement icon', () => {
    const { container } = render(
      <ExecutionOptionToggle enabled={false} onToggle={() => {}} type="computer-use-measurement" />
    );
    // Computer-use measurement icon renders a rectangle grid.
    expect(container.querySelectorAll('rect').length).toBeGreaterThanOrEqual(1);
  });
});

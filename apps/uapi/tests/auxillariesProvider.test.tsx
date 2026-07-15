import React from 'react';
import { act, render, screen } from '@testing-library/react';

jest.mock('next/dynamic', () => {
  const React = require('react');

  return () => {
    const MockAuxillaries = ({
      window,
      initialStep,
      onClose,
    }: {
      window: string;
      initialStep?: string;
      onClose: () => void;
    }) =>
      React.createElement(
        'div',
        { 'data-testid': 'auxillaries-overlay' },
        `${window}:${initialStep ?? 'none'}`,
        React.createElement('button', { onClick: onClose, type: 'button' }, 'Close auxillaries'),
      );

    MockAuxillaries.preload = jest.fn();
    return MockAuxillaries;
  };
});

import AuxillariesProvider, {
  closeAuxillaries,
  openAuxillaries,
} from '@/components/auxillaries/AuxillariesProvider/AuxillariesProvider';

describe('AuxillariesProvider', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/packs');
    Object.defineProperty(window, '__auxillariesPrefetched', {
      configurable: true,
      value: true,
      writable: true,
    });
  });

  afterEach(() => {
    act(() => {
      closeAuxillaries();
    });
  });

  it('creates a portal container and renders auxillaries when opened through the shared event bridge', () => {
    render(
      <AuxillariesProvider>
        <div>product</div>
      </AuxillariesProvider>,
    );

    expect(document.getElementById('auxillaries-portal')).toBeTruthy();

    act(() => {
      openAuxillaries('auxillaries', 'externals');
    });

    expect(document.documentElement.classList.contains('auxillaries-open')).toBe(true);
    expect(screen.getByTestId('auxillaries-overlay').textContent).toContain('AuxillariesWindow:externals');

    act(() => {
      closeAuxillaries();
    });

    expect(screen.queryByTestId('auxillaries-overlay')).toBeNull();
  });

  it('clears deep-linked pane state after close so later opens do not reuse a stale auxillaries pane', () => {
    render(
      <AuxillariesProvider>
        <div>product</div>
      </AuxillariesProvider>,
    );

    act(() => {
      openAuxillaries('auxillaries', 'externals');
    });

    expect(screen.getByTestId('auxillaries-overlay').textContent).toContain('AuxillariesWindow:externals');

    act(() => {
      closeAuxillaries();
    });

    act(() => {
      openAuxillaries('connect');
    });

    expect(screen.getByTestId('auxillaries-overlay').textContent).toContain('ConnectWindow:none');
  });

  it('opens the requested pane from the overlay query parameter without rendering a route page', () => {
    window.history.replaceState({}, '', '/packs?auxillary-open-to=wallet');

    render(
      <AuxillariesProvider>
        <div>product</div>
      </AuxillariesProvider>,
    );

    expect(screen.getByTestId('auxillaries-overlay').textContent).toContain('AuxillariesWindow:wallet');
  });
});

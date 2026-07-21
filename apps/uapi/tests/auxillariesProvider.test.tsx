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
    window.history.replaceState({}, '', '/exchange');
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
    expect(screen.getByTestId('auxillaries-overlay-root').getAttribute('data-auxillaries-open')).toBe(
      'true',
    );

    act(() => {
      closeAuxillaries();
    });

    // Keep-alive: surface stays mounted (hidden) so re-open skips remount cost.
    expect(document.documentElement.classList.contains('auxillaries-open')).toBe(false);
    expect(screen.getByTestId('auxillaries-overlay-root').getAttribute('data-auxillaries-open')).toBe(
      'false',
    );
    expect(screen.getByTestId('auxillaries-overlay')).toBeTruthy();
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
    window.history.replaceState({}, '', '/exchange?auxillary-open-to=wallet');

    render(
      <AuxillariesProvider>
        <div>product</div>
      </AuxillariesProvider>,
    );

    expect(screen.getByTestId('auxillaries-overlay').textContent).toContain('AuxillariesWindow:wallet');
  });

  it('re-opens instantly from keep-alive without dropping the warm surface mount', () => {
    render(
      <AuxillariesProvider>
        <div>product</div>
      </AuxillariesProvider>,
    );

    act(() => {
      openAuxillaries('auxillaries', 'wallet');
    });
    const firstRoot = screen.getByTestId('auxillaries-overlay-root');

    act(() => {
      closeAuxillaries();
    });
    act(() => {
      openAuxillaries('auxillaries', 'profile');
    });

    // Same portal root node — keep-alive path (not unmount/remount).
    expect(screen.getByTestId('auxillaries-overlay-root')).toBe(firstRoot);
    expect(screen.getByTestId('auxillaries-overlay').textContent).toContain(
      'AuxillariesWindow:profile',
    );
    expect(screen.getByTestId('auxillaries-overlay-root').getAttribute('data-auxillaries-open')).toBe(
      'true',
    );
  });
});

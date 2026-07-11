/**
 * @jest-environment jsdom
 */
/* eslint-disable react/no-multi-comp */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('@radix-ui/react-dropdown-menu', () => {
  const React = require('react');

  return {
    Root: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Trigger: ({ asChild, children }: { asChild?: boolean; children: React.ReactNode }) =>
      asChild ? children : <button type="button">{children}</button>,
    Portal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Content: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Item: ({
      children,
      onSelect,
      className,
    }: {
      children: React.ReactNode;
      onSelect?: (event: { preventDefault: () => void }) => void;
      className?: string;
    }) => (
      <button
        type="button"
        className={className}
        onClick={() => onSelect?.({ preventDefault: () => {} })}
      >
        {children}
      </button>
    ),
  };
});

import { UserMenu } from '@/components/bitcode/layout/user-menu';

describe('UserMenu', () => {
  const mockUser = {
    email: 'operator@example.com',
    user_metadata: {},
  } as any;

  it('opens Auxillaries through the workspace account menu with current product naming', async () => {
    const onOpenAuxillaries = jest.fn();
    const onSignOut = jest.fn();

    render(
      <UserMenu user={mockUser} onOpenAuxillaries={onOpenAuxillaries} onSignOut={onSignOut} />,
    );

    expect(screen.getByText('Bitcode account')).toBeInTheDocument();
    expect(screen.getByText('Open Auxillaries fullscreen')).toBeInTheDocument();
    expect(screen.getByText('Wallet, Externals, Profile, Interfaces')).toBeInTheDocument();
    expect(screen.getByTestId('auxillaries-solar-icon')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Open Auxillaries fullscreen'));

    expect(onOpenAuxillaries).toHaveBeenCalledTimes(1);
    expect(onSignOut).not.toHaveBeenCalled();
  });
});

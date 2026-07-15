/**
 * @jest-environment jsdom
 */
/* eslint-disable react/no-multi-comp */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('@radix-ui/react-popover', () => {
  const React = require('react');

  return {
    Root: ({
      children,
      open,
      onOpenChange,
    }: {
      children: React.ReactNode;
      open?: boolean;
      onOpenChange?: (open: boolean) => void;
    }) => (
      <div data-testid="chrome-menu-root" data-open={open ? 'true' : 'false'}>
        {React.Children.map(children, (child: any) =>
          React.isValidElement(child)
            ? React.cloneElement(child as React.ReactElement<any>, { open, onOpenChange })
            : child,
        )}
      </div>
    ),
    Trigger: ({ asChild, children, onOpenChange }: any) => {
      if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<any>, {
          onClick: (event: React.MouseEvent) => {
            (children as any).props?.onClick?.(event);
            onOpenChange?.(true);
          },
        });
      }
      return (
        <button type="button" onClick={() => onOpenChange?.(true)}>
          {children}
        </button>
      );
    },
    Portal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Content: ({ children }: { children: React.ReactNode }) => (
      <div role="dialog">{children}</div>
    ),
  };
});

import { UserMenu } from '@/components/bitcode/layout/UserMenu/UserMenu';

describe('UserMenu', () => {
  const mockUser = {
    email: 'operator@example.com',
    user_metadata: {},
  } as any;

  it('opens Auxillaries through the workspace account menu with current product naming', async () => {
    const onOpenAuxillaries = jest.fn();
    const onDisconnect = jest.fn();

    render(
      <UserMenu user={mockUser} onOpenAuxillaries={onOpenAuxillaries} onDisconnect={onDisconnect} />,
    );

    expect(screen.getByText('Bitcode account')).toBeInTheDocument();
    expect(screen.getByText('Open Auxillaries fullscreen')).toBeInTheDocument();
    expect(screen.getByText('Wallet, Externals, Profile, Interfaces')).toBeInTheDocument();
    expect(screen.getByTestId('auxillaries-solar-icon')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Open Auxillaries fullscreen'));

    expect(onOpenAuxillaries).toHaveBeenCalledTimes(1);
    expect(onDisconnect).not.toHaveBeenCalled();
  });
});

import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ExternalsPane from '@/components/auxillaries/AuxillariesExternals/AuxillariesExternals';

describe('ExternalsPane interactions', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  it('connects to Figma and displays project options', () => {
    render(
      <ExternalsPane
        loading={false}
        isFirstTimeUser={false}
        isDevMode={false}
        initialConnectionData={{}}
        onCompletionStatusChange={() => {}}
        onSave={() => {}}
      />
    );
    // Initially, Select Figma Projects not present
    expect(screen.queryByText('Select Figma Projects')).toBeNull();
    // Click connect Figma
    fireEvent.click(screen.getByText('Connect to Figma'));
    // Advance timers for simulated OAuth flow
    act(() => { jest.advanceTimersByTime(1500); });
    // Now the Figma section should appear
    expect(screen.getByText('Select Figma Projects')).toBeInTheDocument();
    // Projects list
    expect(screen.getByText('Design System')).toBeInTheDocument();
    expect(screen.getByText('Product Redesign')).toBeInTheDocument();
  });
  it('connects to Notion and displays workspace options', () => {
    render(
      <ExternalsPane
        loading={false}
        isFirstTimeUser={false}
        isDevMode={false}
        initialConnectionData={{}}
        onCompletionStatusChange={() => {}}
        onSave={() => {}}
      />
    );
    expect(screen.queryByText('Select Notion Workspaces')).toBeNull();
    fireEvent.click(screen.getByText('Connect to Notion'));
    act(() => { jest.advanceTimersByTime(1500); });
    expect(screen.getByText('Select Notion Workspaces')).toBeInTheDocument();
    expect(screen.getByText('Engineering')).toBeInTheDocument();
    expect(screen.getByText('Product Management')).toBeInTheDocument();
  });
});

import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ExternalsPane from '@/components/auxillaries/AuxillariesExternals/AuxillariesExternals';

describe('ExternalsPane Error Handling', () => {
  beforeEach(() => {
    // Stub global fetch in jsdom
    global.fetch = jest.fn();
  });
  afterEach(() => {
    // Clean up stub
    delete (global as any).fetch;
    jest.restoreAllMocks();
  });

  it('shows format error when code missing dash', async () => {
    render(
      <ExternalsPane
        loading={false}
        isFirstTimeUser={true}
        isDevMode={false}
        initialConnectionData={null}
        onCompletionStatusChange={() => {}}
        onSave={() => {}}
      />
    );
    const input = screen.getByPlaceholderText(/Enter verification code/i);
    fireEvent.change(input, { target: { value: 'invalidcode' } });
    fireEvent.click(screen.getByText('Verify'));
    expect(await screen.findByText('Invalid code format')).toBeInTheDocument();
    // fetch should not be called when format invalid
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('shows error when POST responds not ok', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: false, text: async () => 'Bad request' });
    render(
      <ExternalsPane
        loading={false}
        isFirstTimeUser={true}
        isDevMode={false}
        initialConnectionData={null}
        onCompletionStatusChange={() => {}}
        onSave={() => {}}
      />
    );
    const input = screen.getByPlaceholderText(/Enter verification code/i);
    fireEvent.change(input, { target: { value: '123-abc' } });
    fireEvent.click(screen.getByText('Verify'));
    expect(await screen.findByText('Bad request')).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('shows network error when fetch throws', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('fail network'));
    render(
      <ExternalsPane
        loading={false}
        isFirstTimeUser={true}
        isDevMode={false}
        initialConnectionData={null}
        onCompletionStatusChange={() => {}}
        onSave={() => {}}
      />
    );
    const input = screen.getByPlaceholderText(/Enter verification code/i);
    fireEvent.change(input, { target: { value: '123-abc' } });
    fireEvent.click(screen.getByText('Verify'));
    expect(await screen.findByText('Network error')).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});

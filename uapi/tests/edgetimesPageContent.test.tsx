import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';

import EdgetimesPageContent from '@/app/edgetimes/EdgetimesPageContent';

jest.mock('@/components/bitcode/layout/footer', () => ({
  __esModule: true,
  default: () => <div>Footer</div>,
}));

describe('EdgetimesPageContent', () => {
  it('renders the fourth-gate storage and package ownership map', () => {
    render(<EdgetimesPageContent />);

    expect(
      screen.getByText('Converge storage, schema, and retained package ownership.'),
    ).toBeInTheDocument();
    expect(screen.getAllByText('supabase/migrations/001_v26_production.sql').length).toBeGreaterThan(0);
    expect(screen.getByText('@bitcode/supabase')).toBeInTheDocument();
    expect(screen.getByText('run_jobs')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Return to docs' })).toHaveAttribute('href', '/docs');
    expect(screen.getByRole('link', { name: 'Open Bitcode Terminal' })).toHaveAttribute('href', '/terminal');
    expect(screen.getByRole('link', { name: 'Open conversations' })).toHaveAttribute('href', '/conversations');
  });
});

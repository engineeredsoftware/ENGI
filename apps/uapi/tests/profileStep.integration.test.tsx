import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import ProfileStep from '@/components/auxillaries/AuxillariesProfileStep/AuxillariesProfileStep';

describe('ProfileStep interactions', () => {
  it('adds a new team member and calls onSave with updated members', () => {
    const onSave = jest.fn();
    render(
      <ProfileStep
        onSave={onSave}
        loading={false}
        initialTeamMembers={[]}
        initialUsername="user1"
        initialDisplayName="User One"
        initialBio="Bio"
        initialCompanyName="Co"
        initialAvatarUrl=""
        initialIsVerified={true}
        isFirstTimeUser={false}
        onCompletionStatusChange={() => {}}
        isDevMode={false}
      />
    );
    // Open Add Member modal
    fireEvent.click(screen.getByText('Add Member'));
    expect(screen.getByText('Add Team Member')).toBeInTheDocument();
    // Fill modal form
    fireEvent.change(screen.getByPlaceholderText('Enter full name'), { target: { value: 'New Member' } });
    fireEvent.change(screen.getByPlaceholderText('Enter email address'), { target: { value: 'new@example.com' } });
    // Add the member
    fireEvent.click(screen.getByRole('button', { name: 'Add Member' }));
    // Verify row appears in table
    expect(screen.getByText('New Member')).toBeInTheDocument();
    expect(screen.getByText('@new')).toBeInTheDocument();
    // Click Save Profile button
    fireEvent.click(screen.getByText('Save Profile'));
    // onSave should be called with teamMembers containing the new member
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      teamMembers: expect.arrayContaining([
        expect.objectContaining({ displayName: 'New Member', username: 'new' })
      ])
    }));
  });
});

// moved to app/orbitals/components/api.ts

// Save user profile information
export const saveUserProfile = async (profileData: any) => {
  const res = await fetch('/api/auxillaries/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profileData)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.error || 'Failed to save user profile');
  }
  return res.json();
};

// Connect to GitHub
export const connectGitHub = async (connectionData: any) => {
  const res = await fetch('/api/auxillaries/connections/github', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(connectionData)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.error || 'Failed to connect GitHub');
  }
  return res.json();
};

// Update model preferences
export const updateModelPreferences = async (modelData: any) => {
  const res = await fetch('/api/auxillaries/model-preferences', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(modelData)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.error || 'Failed to update model preferences');
  }
  return res.json();
};

// Get current user data (could be used to pre-populate fields)
export const getUserData = async () => {
  const res = await fetch('/api/auxillaries/data');
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.error || 'Failed to fetch user data');
  }
  return res.json();
};

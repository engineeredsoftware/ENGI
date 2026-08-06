"use client";

import React, { ReactNode, useState, useEffect, createContext, useContext } from 'react';

export interface UserData {
  profile: any;
  vcsConnections: any[];
  btdBalance: number;
  modelPreferences: any;
}

interface UserDataContextValue {
  data?: UserData;
  loading: boolean;
  error?: Error;
}

const UserDataContext = createContext<UserDataContextValue>({ loading: true });

export function UserDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<UserData>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        const res = await fetch('/api/auxillaries/data');
        if (!res.ok) throw new Error(`Failed to fetch user data: ${res.status}`);
        const json = await res.json();
        if (!cancelled) {
          setData(json as UserData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, []);

  return (
    <UserDataContext.Provider value={{ data, loading, error }}>
      {children}
    </UserDataContext.Provider>
  );
}

/**
 * Hook to access user data (profile, GitHub connection, BTD balance, model prefs).
 */
export function useUserData(): UserDataContextValue {
  return useContext(UserDataContext);
}

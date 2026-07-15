declare module '@supabase/supabase-js' {
  export interface User {
    id: string;
    email?: string | null;
    email_confirmed_at?: string | null;
    user_metadata?: Record<string, unknown>;
    app_metadata?: Record<string, unknown>;
  }

  export interface Session {
    user: User | null;
    access_token?: string;
    refresh_token?: string;
  }

  export type AuthChangeEvent = string;

  export interface AuthSubscription {
    unsubscribe(): void;
  }

  export interface AuthChangeEventResult {
    data: {
      subscription: AuthSubscription;
    };
  }

  export interface AuthSessionResult {
    data: {
      session: Session | null;
    };
    error?: Error | null;
  }

  export interface AuthUserResult {
    data: {
      user: User | null;
    };
    error?: Error | null;
  }

  export interface SupabaseAuthClient {
    getSession(): Promise<AuthSessionResult>;
    getUser(): Promise<AuthUserResult>;
    onAuthStateChange(
      callback: (event: AuthChangeEvent, session: Session | null) => void,
    ): AuthChangeEventResult;
  }

  export interface SupabaseClient<T = unknown> {
    from(table: string): any;
    rpc(fn: string, params?: Record<string, unknown>): Promise<any>;
    auth: SupabaseAuthClient;
    storage: {
      listBuckets(): Promise<{
        data: Array<{ id?: string; name: string }> | null;
        error?: Error | null;
      }>;
      from(bucket: string): {
        upload(
          path: string,
          body: unknown,
          options?: Record<string, unknown>,
        ): Promise<{
          data: { path: string } | null;
          error?: Error | null;
        }>;
        getPublicUrl(path: string): {
          data: {
            publicUrl: string;
          };
        };
      };
    };
  }

  export function createClient<T = unknown>(
    url: string,
    key: string,
    options?: Record<string, unknown>,
  ): SupabaseClient<T>;
}

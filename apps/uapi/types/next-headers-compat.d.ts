declare module 'next/headers' {
  export interface RequestCookie {
    name: string;
    value: string;
  }

  export interface RequestCookies {
    get(name: string): RequestCookie | undefined;
    set(cookie: RequestCookie & Record<string, unknown>): void;
    set(name: string, value: string, options?: Record<string, unknown>): void;
  }

  export function cookies(): RequestCookies;
}

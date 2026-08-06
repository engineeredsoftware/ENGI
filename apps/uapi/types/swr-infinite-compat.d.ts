declare module 'swr/infinite' {
  export interface SWRInfiniteResponse<T> {
    data?: T[];
    error?: unknown;
    size: number;
    setSize: (size: number | ((size: number) => number)) => Promise<T[] | undefined>;
    isLoading?: boolean;
    isValidating?: boolean;
    mutate: (...args: any[]) => Promise<T[] | undefined>;
  }

  export default function useSWRInfinite<T = unknown>(
    getKey: (...args: any[]) => string | null,
    fetcher: (key: string) => Promise<T>,
    config?: Record<string, unknown>,
  ): SWRInfiniteResponse<T>;
}

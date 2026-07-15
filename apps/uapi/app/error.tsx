"use client";

import { useEffect } from 'react';
import { reportError, BitcodeError } from '@bitcode/errors';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    reportError(error);
  }, [error]);

  const e = error instanceof BitcodeError ? error : undefined;

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <h1 className="mb-4 text-2xl font-semibold text-red-600">Something went wrong</h1>
      <p className="mb-8 max-w-md text-gray-700">
        {e?.userMessage || 'An unexpected error occurred. Please try again.'}
      </p>
      <button
        onClick={() => reset()}
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Retry
      </button>
      {e?.code && <code className="mt-4 text-xs text-gray-500">Error code: {e.code}</code>}
    </div>
  );
}

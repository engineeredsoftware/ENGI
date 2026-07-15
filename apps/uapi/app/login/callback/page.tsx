import { redirect } from 'next/navigation';

type SearchParams = Record<string, string | string[] | undefined>;

function appendSearchParams(target: URLSearchParams, searchParams: SearchParams) {
  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      for (const entry of value) {
        if (entry) target.append(key, entry);
      }
    } else if (value) {
      target.set(key, value);
    }
  }
}

export default function LoginCallbackRedirectPage({ searchParams }: { searchParams: SearchParams }) {
  const params = new URLSearchParams();
  appendSearchParams(params, searchParams);
  const query = params.toString();
  redirect(`/tps/supabase/callback${query ? `?${query}` : ''}`);
}


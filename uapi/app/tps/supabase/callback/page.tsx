import { redirect } from 'next/navigation';

import LoginCallbackClient from '@/app/login/callback/LoginCallbackClient';

type SearchParams = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

export default function SupabaseCallbackPage({ searchParams }: { searchParams: SearchParams }) {
  const error = firstParam(searchParams.error);
  if (error) {
    const redirectUrl = new URL('/', 'http://bitcode.local');
    // Product language: Connect (not login). Keep legacy loginError* as
    // aliases only if clients still strip them — writers use connectError*.
    redirectUrl.searchParams.set('connectError', error);
    const description = firstParam(searchParams.error_description);
    if (description) redirectUrl.searchParams.set('connectErrorDescription', description);
    redirect(`${redirectUrl.pathname}${redirectUrl.search}`);
  }

  const nextPath = firstParam(searchParams.next) || '/';
  const authCode = firstParam(searchParams.code);
  const tokenHash = firstParam(searchParams.token_hash);
  return (
    <LoginCallbackClient
      code={authCode || tokenHash}
      codeKind={authCode ? 'oauth_code' : tokenHash ? 'token_hash' : 'none'}
      nextPath={nextPath}
    />
  );
}

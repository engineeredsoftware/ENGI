import BitcoinWalletAuthorizeClient from './BitcoinWalletAuthorizeClient';

type SearchParams = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

export default function BitcoinWalletAuthorizePage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <BitcoinWalletAuthorizeClient
      clientId={firstParam(searchParams.client_id)}
      redirectUri={firstParam(searchParams.redirect_uri)}
      responseType={firstParam(searchParams.response_type)}
      state={firstParam(searchParams.state)}
      scope={firstParam(searchParams.scope)}
      codeChallenge={firstParam(searchParams.code_challenge)}
      codeChallengeMethod={firstParam(searchParams.code_challenge_method)}
      walletProviderHint={firstParam(searchParams.wallet_provider || searchParams.bitcode_wallet_provider)}
    />
  );
}


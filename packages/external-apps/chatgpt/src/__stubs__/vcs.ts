export type VCSAuth = {
  accessToken: string;
  tokenType: string;
  provider: 'github';
};

export function getVCSConfig(_provider: 'github') {
  return {
    apiBaseUrl: 'https://api.github.com'
  };
}

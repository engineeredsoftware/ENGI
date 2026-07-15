export const runtime = 'nodejs';

export function GET(request: Request) {
  const redirectUrl = new URL('/tps/github/callback', request.url);
  redirectUrl.search = new URL(request.url).search;
  return new Response(null, {
    status: 308,
    headers: {
      Location: redirectUrl.toString(),
    },
  });
}

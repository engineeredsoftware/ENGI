declare module 'next/server' {
  export interface NextRequest extends Request {
    nextUrl: URL;
  }

  export class NextResponse extends Response {
    static redirect(url: string | URL, init?: number | ResponseInit): NextResponse;
    static json(body: unknown, init?: ResponseInit): NextResponse;
  }
}

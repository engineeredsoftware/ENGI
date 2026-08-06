/**
 * Ambient stubs for monorepo package typecheck under pnpm isolation.
 * Do not stub packages with rich real typings (zod, @supabase/supabase-js).
 */

declare module '@mendable/firecrawl-js' {
  export default class FirecrawlApp {
    constructor(...args: any[]);
    [key: string]: any;
  }
}

declare module 'exa-js' {
  export default class Exa {
    constructor(...args: any[]);
    search(...args: any[]): Promise<any>;
    searchAndContents(...args: any[]): Promise<any>;
    contents(...args: any[]): Promise<any>;
    findSimilar(...args: any[]): Promise<any>;
    [key: string]: any;
  }
}

declare module 'dockerode' {
  const Docker: any;
  export default Docker;
}

declare module 'ws' {
  export class WebSocket {
    constructor(...args: any[]);
    [key: string]: any;
  }
  export class WebSocketServer {
    constructor(...args: any[]);
    [key: string]: any;
  }
  const _default: typeof WebSocket;
  export default _default;
}

declare module 'openai' {
  export default class OpenAI {
    constructor(...args: any[]);
    [key: string]: any;
  }
}

declare module 'uuid' {
  export function v4(...args: any[]): string;
  export function v1(...args: any[]): string;
}

declare module 'next/headers' {
  export function cookies(...args: any[]): any;
  export function headers(...args: any[]): any;
}

declare module 'next/server' {
  export class NextRequest {
    constructor(...args: any[]);
    [key: string]: any;
  }
  export class NextResponse {
    constructor(body?: any, init?: any);
    static json(...args: any[]): any;
    static redirect(...args: any[]): any;
    static next(...args: any[]): any;
    [key: string]: any;
  }
}

declare module '@bitcode/system-grep' {
  export function simpleSystemTextSearch(...args: any[]): any;
  export const grep: any;
  const _default: any;
  export default _default;
}

declare module '@bitcode/generics' {
  export class BaseExecutionContext {
    [key: string]: any;
  }
  const _default: any;
  export default _default;
}

declare module '@bitcode/tool-generics' {
  export class BaseTool {
    [key: string]: any;
  }
  export type ToolResult = any;
  const _default: any;
  export default _default;
}

declare module '@bitcode/doc-prompt' {
  export class DocPromptBase<T = any> {
    [key: string]: any;
  }
  const _default: any;
  export default _default;
}

declare module '@bitcode/generic-tools/figma-api' { const x: any; export default x; export const x2: any; }
declare module '@bitcode/generic-tools/design-parser' { const x: any; export default x; }
declare module '@bitcode/generic-tools/code-generator' { const x: any; export default x; }
declare module '@bitcode/generic-tools/language-detector' { const x: any; export default x; }
declare module '@bitcode/generic-tools/sentiment-analyzer' { const x: any; export default x; }
declare module '@bitcode/generic-tools/linguistic-processor' { const x: any; export default x; }
declare module '@bitcode/pipelines/asset-pack' { const x: any; export default x; }

declare module '@typescript-eslint/utils' {
  export const ESLintUtils: any;
  export namespace TSESTree {
    export type Node = any;
    export type ImportDeclaration = any;
    export type Identifier = any;
    export type AssignmentExpression = any;
    export type CallExpression = any;
  }
}

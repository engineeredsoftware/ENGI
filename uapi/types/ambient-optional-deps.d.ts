/**
 * Ambient declarations for optional third-party packages that may not resolve
 * through every monorepo path-mapping edge during `tsc --noEmit`.
 * Runtime deps are still installed on the owning workspace packages.
 */
declare module '@ai-sdk/anthropic';
declare module '@ai-sdk/google';
declare module '@ai-sdk/openai';
declare module '@notionhq/client';
declare module 'sats-connect';

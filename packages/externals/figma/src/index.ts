export * from './types';
export * from './client';
export * from './auth';
export * from './connections';

// Re-export main client and types for convenience
export { FigmaClient } from './client';
export { FigmaAuth } from './auth';
export { FigmaConnections } from './connections';
export type {
  FigmaAuthConfig,
  FigmaFileRef,
  FigmaArtboard,
  FigmaImageOptions,
  FigmaOAuthData,
  FigmaConnection,
  FigmaUser,
} from './types';

/**
 * Helper functions for common Figma operations
 */

import { FigmaClient } from './client';
import type { FigmaAuthConfig, FigmaFileRef, FigmaImageOptions } from './types';

/**
 * Create a new Figma client instance
 */
export function createFigmaClient(auth: FigmaAuthConfig): FigmaClient {
  return new FigmaClient(auth);
}

/**
 * Factory function to create authenticated client from user connection
 */
export async function createFigmaClientFromUser(userId: string): Promise<FigmaClient | null> {
  const connection = await FigmaConnections.getConnection(userId);
  if (!connection) {
    return null;
  }
  
  return new FigmaClient({ accessToken: connection.access_token });
}

/**
 * Extract file key from Figma URL
 */
export function extractFileKeyFromUrl(figmaUrl: string): string | null {
  const match = figmaUrl.match(/figma\.com\/file\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

/**
 * Extract node ID from Figma URL
 */
export function extractNodeIdFromUrl(figmaUrl: string): string | null {
  const match = figmaUrl.match(/node-id=([^&]+)/);
  if (!match) return null;
  
  // Figma URLs encode node IDs, read to decode
  return decodeURIComponent(match[1]);
}

/**
 * Parse Figma URL to get file key and node ID
 */
export function parseFigmaUrl(figmaUrl: string): FigmaFileRef | null {
  const fileKey = extractFileKeyFromUrl(figmaUrl);
  if (!fileKey) return null;
  
  const nodeId = extractNodeIdFromUrl(figmaUrl);
  
  return {
    fileKey,
    nodeId: nodeId || undefined,
  };
}

/**
 * List recent files for a user
 */
export async function figmaListRecentFiles(auth: FigmaAuthConfig) {
  const client = createFigmaClient(auth);
  return client.listRecentFiles();
}

/**
 * List all artboards in a file
 */
export async function figmaListArtboards(auth: FigmaAuthConfig, fileKey: string) {
  const client = createFigmaClient(auth);
  return client.listArtboards(fileKey);
}

/**
 * Get artboard PNG image
 */
export async function figmaGetArtboardPNG(
  auth: FigmaAuthConfig,
  fileKey: string,
  nodeId: string,
  options: FigmaImageOptions = {}
) {
  const client = createFigmaClient(auth);
  const scale = options.scale || 2;
  return client.getArtboardPNG(fileKey, nodeId, scale);
}

/**
 * Find artboard by name
 */
export async function figmaFindArtboardByName(
  auth: FigmaAuthConfig,
  fileKey: string,
  artboardName: string
) {
  const client = createFigmaClient(auth);
  return client.findArtboardByName(fileKey, artboardName);
}

/**
 * Get file metadata and structure
 */
export async function figmaGetFile(auth: FigmaAuthConfig, fileKey: string) {
  const client = createFigmaClient(auth);
  return client.getFile(fileKey);
}
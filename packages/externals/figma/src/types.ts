import { z } from 'zod';

/**
 * Figma API Authentication
 */
export interface FigmaAuthConfig {
  accessToken: string;
}

/**
 * Figma OAuth Data from token exchange
 */
export interface FigmaOAuthData {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  user_id: string;
  team_id: string;
  team_name: string;
}

/**
 * Figma User Info
 */
export interface FigmaUser {
  id: string;
  email: string;
  handle: string;
  img_url: string;
}

/**
 * Figma Connection stored in database
 */
export interface FigmaConnection {
  id: string;
  user_id: string;
  access_token: string;
  refresh_token?: string;
  token_expires_at?: string;
  team_id: string;
  team_name: string;
  user_name: string;
  user_email: string;
  created_at: string;
  updated_at: string;
}

/**
 * Figma File Reference
 */
export interface FigmaFileRef {
  fileKey: string;
  nodeId?: string;
}

/**
 * Figma Team
 */
export interface FigmaTeam {
  id: string;
  name: string;
}

/**
 * Figma Project
 */
export interface FigmaProject {
  id: string;
  name: string;
}

/**
 * Figma File metadata
 */
export interface FigmaFile {
  key: string;
  name: string;
  thumbnail_url?: string;
  last_modified: string;
  project_id?: string;
}

/**
 * Figma Node (Frame/Artboard)
 */
export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * Figma Page
 */
export interface FigmaPage {
  id: string;
  name: string;
  children: FigmaNode[];
}

/**
 * Figma Document structure
 */
export interface FigmaDocument {
  id: string;
  name: string;
  children: FigmaPage[];
}

/**
 * Full Figma File response
 */
export interface FigmaFileResponse {
  name: string;
  lastModified: string;
  document: FigmaDocument;
  components?: Record<string, any>;
  schemaVersion?: number;
}

/**
 * Figma Image render response
 */
export interface FigmaImageResponse {
  images: Record<string, string>;
  err?: string;
}

/**
 * Image render options
 */
export interface FigmaImageOptions {
  scale?: number;
  format?: 'png' | 'jpg' | 'svg' | 'pdf';
  width?: number;
  height?: number;
}

/**
 * Artboard summary for UI selection
 */
export interface FigmaArtboard {
  id: string;
  name: string;
  pageId: string;
  pageName: string;
  width?: number;
  height?: number;
}

// Zod schemas for validation
export const FigmaAuthConfigSchema = z.object({
  accessToken: z.string().min(1, 'Access token is required'),
});

export const FigmaFileRefSchema = z.object({
  fileKey: z.string().min(1, 'File key is required'),
  nodeId: z.string().optional(),
});

export const FigmaImageOptionsSchema = z.object({
  scale: z.number().min(0.01).max(4.0).optional(),
  format: z.enum(['png', 'jpg', 'svg', 'pdf']).optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
});
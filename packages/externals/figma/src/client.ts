import { logger } from '@bitcode/logger';
import type {
  FigmaAuthConfig,
  FigmaFileRef,
  FigmaTeam,
  FigmaProject,
  FigmaFile,
  FigmaFileResponse,
  FigmaImageResponse,
  FigmaImageOptions,
  FigmaArtboard,
  FigmaNode,
} from './types';

const FIGMA_API_BASE = 'https://api.figma.com/v1';
const DEFAULT_RATE_LIMIT_DELAY = 1000; // 1 second between requests

/**
 * Rate limiting helper
 */
class RateLimiter {
  private lastRequestTime = 0;
  private delay: number;

  constructor(delay = DEFAULT_RATE_LIMIT_DELAY) {
    this.delay = delay;
  }

  async throttle(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.delay) {
      const waitTime = this.delay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }
}

/**
 * Figma API Client
 */
export class FigmaClient {
  private auth: FigmaAuthConfig;
  private rateLimiter: RateLimiter;

  constructor(auth: FigmaAuthConfig) {
    this.auth = auth;
    this.rateLimiter = new RateLimiter();
  }

  /**
   * Make authenticated request to Figma API
   */
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    await this.rateLimiter.throttle();

    const url = `${FIGMA_API_BASE}${endpoint}`;
    const headers = {
      'X-Figma-Token': this.auth.accessToken,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 429) {
        logger.warn('Figma API rate limit exceeded, waiting 60 seconds');
        await new Promise(resolve => setTimeout(resolve, 60000));
        return this.makeRequest<T>(endpoint, options);
      }

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Figma API error ${response.status}: ${errorBody}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('Figma API request failed', { endpoint, error });
      throw error;
    }
  }

  /**
   * List user's recent files
   */
  async listRecentFiles(): Promise<FigmaFile[]> {
    const response = await this.makeRequest<{ files: FigmaFile[] }>('/files/recent');
    return response.files || [];
  }

  /**
   * List projects in a team
   */
  async listProjects(teamId: string): Promise<FigmaProject[]> {
    const response = await this.makeRequest<{ projects: FigmaProject[] }>(`/teams/${teamId}/projects`);
    return response.projects || [];
  }

  /**
   * List files in a project
   */
  async listFiles(projectId: string): Promise<FigmaFile[]> {
    const response = await this.makeRequest<{ files: FigmaFile[] }>(`/projects/${projectId}/files`);
    return response.files || [];
  }

  /**
   * Get file structure and metadata
   */
  async getFile(fileKey: string): Promise<FigmaFileResponse> {
    return this.makeRequest<FigmaFileResponse>(`/files/${fileKey}`);
  }

  /**
   * Get specific node information
   */
  async getNode(fileKey: string, nodeId: string): Promise<FigmaNode> {
    const response = await this.makeRequest<{ nodes: Record<string, { document: FigmaNode }> }>(
      `/files/${fileKey}/nodes?ids=${nodeId}`
    );
    
    const nodeData = response.nodes[nodeId];
    if (!nodeData) {
      throw new Error(`Node ${nodeId} not found in file ${fileKey}`);
    }
    
    return nodeData.document;
  }

  /**
   * Render node as image
   */
  async renderImage(
    fileKey: string, 
    nodeId: string, 
    options: FigmaImageOptions = {}
  ): Promise<string> {
    const params = new URLSearchParams({
      ids: nodeId,
      format: options.format || 'png',
    });

    if (options.scale) {
      params.append('scale', options.scale.toString());
    }
    if (options.width) {
      params.append('width', options.width.toString());
    }
    if (options.height) {
      params.append('height', options.height.toString());
    }

    const response = await this.makeRequest<FigmaImageResponse>(
      `/images/${fileKey}?${params.toString()}`
    );

    if (response.err) {
      throw new Error(`Figma image render error: ${response.err}`);
    }

    const imageUrl = response.images[nodeId];
    if (!imageUrl) {
      throw new Error(`No image URL returned for node ${nodeId}`);
    }

    return imageUrl;
  }

  /**
   * Download image from Figma URL
   */
  async downloadImage(imageUrl: string): Promise<ArrayBuffer> {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status}`);
    }
    return response.arrayBuffer();
  }

  /**
   * Extract all artboards (Frame nodes) from a file
   */
  async listArtboards(fileKey: string): Promise<FigmaArtboard[]> {
    const file = await this.getFile(fileKey);
    const artboards: FigmaArtboard[] = [];

    for (const page of file.document.children) {
      const frames = page.children.filter(node => node.type === 'FRAME');
      
      for (const frame of frames) {
        artboards.push({
          id: frame.id,
          name: frame.name,
          pageId: page.id,
          pageName: page.name,
          width: frame.absoluteBoundingBox?.width,
          height: frame.absoluteBoundingBox?.height,
        });
      }
    }

    return artboards;
  }

  /**
   * Find artboard by name
   */
  async findArtboardByName(fileKey: string, artboardName: string): Promise<FigmaArtboard | null> {
    const artboards = await this.listArtboards(fileKey);
    return artboards.find(artboard => 
      artboard.name.toLowerCase().includes(artboardName.toLowerCase())
    ) || null;
  }

  /**
   * Get PNG image of artboard
   */
  async getArtboardPNG(
    fileKey: string, 
    nodeId: string, 
    scale: number = 2
  ): Promise<ArrayBuffer> {
    const imageUrl = await this.renderImage(fileKey, nodeId, { 
      format: 'png', 
      scale 
    });
    
    return this.downloadImage(imageUrl);
  }
}
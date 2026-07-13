import { Client } from '@notionhq/client';
import { log } from '@bitcode/logger';
import type {
  NotionConnection,
  NotionPage,
  NotionDatabase,
  NotionBlock,
  NotionUser,
  NotionComment,
  CreatePageInput,
  UpdatePageInput,
  QueryDatabaseInput,
  SearchInput,
  AppendBlockChildrenInput,
  UpdateBlockInput,
  CreateCommentInput,
  PaginatedResponse,
  NotionError,
  NotionToolResult
} from './types';

function normalizeCreatePageParent(parent: CreatePageInput['parent']) {
  if (parent.page_id) {
    return { page_id: parent.page_id, type: 'page_id' as const };
  }

  if (parent.database_id) {
    return { database_id: parent.database_id, type: 'database_id' as const };
  }

  throw new Error('CreatePageInput.parent must include either page_id or database_id');
}

function normalizePageIcon(icon: CreatePageInput['icon'] | UpdatePageInput['icon']) {
  if (!icon) {
    return icon;
  }

  if (icon.type === 'emoji') {
    return {
      type: 'emoji' as const,
      emoji: icon.emoji as any,
    };
  }

  return icon;
}

function normalizeQuerySorts(sorts: QueryDatabaseInput['sorts']) {
  if (!sorts) {
    return undefined;
  }

  const normalized: Array<Record<string, string>> = [];

  for (const sort of sorts) {
    if (sort.property) {
      normalized.push({ property: sort.property, direction: sort.direction });
      continue;
    }

    if (sort.timestamp) {
      normalized.push({ timestamp: sort.timestamp, direction: sort.direction });
    }
  }

  return normalized;
}

export class NotionClient {
  private client: Client;
  private connection: NotionConnection;

  constructor(connection: NotionConnection) {
    this.connection = connection;
    this.client = new Client({
      auth: connection.access_token,
      notionVersion: '2022-06-28'
    });
  }

  private async handleRequest<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<NotionToolResult<T>> {
    try {
      const startTime = Date.now();
      const data = await operation();
      const duration = Date.now() - startTime;

      log(`[NotionClient] ${context} completed successfully`, 'info', {
        user_id: this.connection.user_id,
        workspace_id: this.connection.workspace_id,
        duration
      });

      return {
        success: true,
        data,
        metadata: {
          rate_limit: this.extractRateLimit()
        }
      };
    } catch (error: any) {
      log(`[NotionClient] ${context} failed`, 'error', {
        user_id: this.connection.user_id,
        workspace_id: this.connection.workspace_id,
        error: error.message,
        code: error.code,
        status: error.status
      });

      return {
        success: false,
        error: this.formatError(error),
        metadata: {
          request_id: error.request_id,
          rate_limit: this.extractRateLimit()
        }
      };
    }
  }

  private formatError(error: any): string {
    if (error.code) {
      switch (error.code) {
        case 'unauthorized':
          return 'Notion access token is invalid or expired. Please reconnect your Notion account.';
        case 'forbidden':
          return 'The Notion integration lacks permission to access this resource. Please check your integration capabilities.';
        case 'object_not_found':
          return 'The requested Notion page, database, or block could not be found.';
        case 'rate_limited':
          return 'Rate limit exceeded. Please try again later.';
        case 'internal_server_error':
          return 'Notion API is experiencing issues. Please try again later.';
        case 'service_unavailable':
          return 'Notion API is temporarily unavailable. Please try again later.';
        case 'database_connection_unavailable':
          return 'Notion database is temporarily unavailable. Please try again later.';
        default:
          return error.message || 'An unexpected error occurred with the Notion API.';
      }
    }
    return error.message || 'An unexpected error occurred.';
  }

  private extractRateLimit(): { remaining: number; reset_time: string } | undefined {
    // Notion doesn't expose rate limit headers in SDK responses
    // This would read to be implemented if using direct HTTP requests
    return undefined;
  }

  // Page operations
  async getPage(pageId: string): Promise<NotionToolResult<NotionPage>> {
    return this.handleRequest(
      async () => {
        const response = await this.client.pages.retrieve({ page_id: pageId });
        return response as NotionPage;
      },
      `Get page ${pageId}`
    );
  }

  async createPage(input: CreatePageInput): Promise<NotionToolResult<NotionPage>> {
    return this.handleRequest(
      async () => {
        const response = await this.client.pages.create({
          ...input,
          parent: normalizeCreatePageParent(input.parent),
          icon: normalizePageIcon(input.icon),
        } as any);
        return response as NotionPage;
      },
      'Create page'
    );
  }

  async updatePage(pageId: string, input: UpdatePageInput): Promise<NotionToolResult<NotionPage>> {
    return this.handleRequest(
      async () => {
        const response = await this.client.pages.update({
          page_id: pageId,
          ...input,
          icon: normalizePageIcon(input.icon),
        } as any);
        return response as NotionPage;
      },
      `Update page ${pageId}`
    );
  }

  // Database operations
  async getDatabase(databaseId: string): Promise<NotionToolResult<NotionDatabase>> {
    return this.handleRequest(
      async () => {
        const response = await this.client.databases.retrieve({ database_id: databaseId });
        return response as NotionDatabase;
      },
      `Get database ${databaseId}`
    );
  }

  async queryDatabase(input: QueryDatabaseInput): Promise<NotionToolResult<PaginatedResponse<NotionPage>>> {
    return this.handleRequest(
      async () => {
        const response = await this.client.databases.query({
          ...input,
          sorts: normalizeQuerySorts(input.sorts),
        } as any);
        return response as PaginatedResponse<NotionPage>;
      },
      `Query database ${input.database_id}`
    );
  }

  async createDatabase(pageId: string, schema: any): Promise<NotionToolResult<NotionDatabase>> {
    return this.handleRequest(
      async () => {
        const response = await this.client.databases.create({
          parent: { page_id: pageId },
          ...schema
        });
        return response as NotionDatabase;
      },
      `Create database in page ${pageId}`
    );
  }

  async updateDatabase(databaseId: string, updates: any): Promise<NotionToolResult<NotionDatabase>> {
    return this.handleRequest(
      async () => {
        const response = await this.client.databases.update({
          database_id: databaseId,
          ...updates
        });
        return response as NotionDatabase;
      },
      `Update database ${databaseId}`
    );
  }

  // Block operations
  async getBlockChildren(blockId: string, startCursor?: string): Promise<NotionToolResult<PaginatedResponse<NotionBlock>>> {
    return this.handleRequest(
      async () => {
        const response = await this.client.blocks.children.list({
          block_id: blockId,
          start_cursor: startCursor,
          page_size: 100
        });
        return response as PaginatedResponse<NotionBlock>;
      },
      `Get block children ${blockId}`
    );
  }

  async appendBlockChildren(input: AppendBlockChildrenInput): Promise<NotionToolResult<PaginatedResponse<NotionBlock>>> {
    return this.handleRequest(
      async () => {
        const response = await this.client.blocks.children.append({
          block_id: input.block_id,
          children: input.children as any,
          after: input.after,
        } as any);
        return response as PaginatedResponse<NotionBlock>;
      },
      `Append blocks to ${input.block_id}`
    );
  }

  async updateBlock(blockId: string, input: UpdateBlockInput): Promise<NotionToolResult<NotionBlock>> {
    return this.handleRequest(
      async () => {
        const response = await this.client.blocks.update({
          block_id: blockId,
          ...input
        });
        return response as NotionBlock;
      },
      `Update block ${blockId}`
    );
  }

  async deleteBlock(blockId: string): Promise<NotionToolResult<NotionBlock>> {
    return this.handleRequest(
      async () => {
        const response = await this.client.blocks.delete({ block_id: blockId });
        return response as NotionBlock;
      },
      `Delete block ${blockId}`
    );
  }

  // User operations
  async getUsers(): Promise<NotionToolResult<PaginatedResponse<NotionUser>>> {
    return this.handleRequest(
      async () => {
        const response = await this.client.users.list({});
        return response as PaginatedResponse<NotionUser>;
      },
      'Get users'
    );
  }

  async getUser(userId: string): Promise<NotionToolResult<NotionUser>> {
    return this.handleRequest(
      async () => {
        const response = await this.client.users.retrieve({ user_id: userId });
        return response as NotionUser;
      },
      `Get user ${userId}`
    );
  }

  async getMe(): Promise<NotionToolResult<NotionUser>> {
    return this.handleRequest(
      async () => {
        const response = await this.client.users.me({});
        return response as NotionUser;
      },
      'Get integration user'
    );
  }

  // Comment operations
  async getComments(pageId: string, startCursor?: string): Promise<NotionToolResult<PaginatedResponse<NotionComment>>> {
    return this.handleRequest(
      async () => {
        const response = await this.client.comments.list({
          block_id: pageId,
          start_cursor: startCursor
        });
        return response as PaginatedResponse<NotionComment>;
      },
      `Get comments for page ${pageId}`
    );
  }

  async createComment(input: CreateCommentInput): Promise<NotionToolResult<NotionComment>> {
    return this.handleRequest(
      async () => {
        const response = await this.client.comments.create(input);
        return response as NotionComment;
      },
      `Create comment on page ${input.parent.page_id}`
    );
  }

  // Search operations
  async search(input: SearchInput = {}): Promise<NotionToolResult<PaginatedResponse<NotionPage | NotionDatabase>>> {
    return this.handleRequest(
      async () => {
        const response = await this.client.search(input);
        return response as PaginatedResponse<NotionPage | NotionDatabase>;
      },
      `Search workspace${input.query ? ` for "${input.query}"` : ''}`
    );
  }

  // Utility methods
  async getAllPages(): Promise<NotionToolResult<(NotionPage | NotionDatabase)[]>> {
    return this.handleRequest(
      async () => {
        const allResults: (NotionPage | NotionDatabase)[] = [];
        let hasMore = true;
        let startCursor: string | undefined;

        while (hasMore) {
          const response = await this.client.search({
            start_cursor: startCursor,
            page_size: 100
          });

          allResults.push(...response.results as (NotionPage | NotionDatabase)[]);
          hasMore = response.has_more;
          startCursor = response.next_cursor || undefined;
        }

        return allResults;
      },
      'Get all pages and databases'
    );
  }

  async getAllBlocksInPage(pageId: string): Promise<NotionToolResult<NotionBlock[]>> {
    return this.handleRequest(
      async () => {
        const allBlocks: NotionBlock[] = [];
        
        const fetchBlocks = async (blockId: string): Promise<void> => {
          let hasMore = true;
          let startCursor: string | undefined;

          while (hasMore) {
            const response = await this.client.blocks.children.list({
              block_id: blockId,
              start_cursor: startCursor,
              page_size: 100
            });

            const blocks = response.results as NotionBlock[];
            allBlocks.push(...blocks);

            // Recursively fetch children for blocks that have them
            for (const block of blocks) {
              if (block.has_children) {
                await fetchBlocks(block.id);
              }
            }

            hasMore = response.has_more;
            startCursor = response.next_cursor || undefined;
          }
        };

        await fetchBlocks(pageId);
        return allBlocks;
      },
      `Get all blocks in page ${pageId}`
    );
  }

  // Connection info
  getConnection(): NotionConnection {
    return this.connection;
  }
}

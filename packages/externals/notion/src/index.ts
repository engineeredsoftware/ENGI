import { NotionClient } from './client';
import { NotionConnections } from './connections';

// Re-export all types
export * from './types';

// Re-export main classes
export { NotionClient } from './client';
export { NotionAuth } from './auth';
export { NotionConnections } from './connections';

// Re-export utilities
export * from './utils';

// Tool functions for MCP integration
export { 
  notionGetPageTool,
  notionCreatePageTool,
  notionUpdatePageTool,
  notionGetDatabaseTool,
  notionQueryDatabaseTool,
  notionCreateDatabaseTool,
  notionUpdateDatabaseTool,
  notionGetBlockChildrenTool,
  notionAppendBlockChildrenTool,
  notionUpdateBlockTool,
  notionDeleteBlockTool,
  notionGetUsersTool,
  notionGetUserTool,
  notionGetCommentsTool,
  notionCreateCommentTool,
  notionSearchTool,
  notionGetAllPagesTool,
  notionGetPageContentTool
} from './tools';

// Factory function to create authenticated client
export async function createNotionClient(userId: string): Promise<NotionClient | null> {
  const connection = await NotionConnections.getConnection(userId);
  if (!connection) {
    return null;
  }
  
  return new NotionClient(connection);
}

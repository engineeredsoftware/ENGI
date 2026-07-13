import { log } from '@bitcode/logger';
import { NotionClient } from './client';
import { NotionConnections } from './connections';
import { extractTitle, pageToText, normalizeNotionId, isValidNotionId } from './utils';
import type { 
  NotionToolContext, 
  NotionToolResult,
  CreatePageInput,
  UpdatePageInput,
  QueryDatabaseInput,
  SearchInput,
  AppendBlockChildrenInput,
  UpdateBlockInput,
  CreateCommentInput
} from './types';

async function withNotionClient<T>(
  context: NotionToolContext,
  operation: (client: NotionClient) => Promise<NotionToolResult<T>>,
  operationName: string
): Promise<NotionToolResult<T>> {
  try {
    let connection = context.connection;
    
    if (!connection) {
      const validatedConnection = await NotionConnections.validateConnection(context.user_id);
      if (!validatedConnection) {
        return {
          success: false,
          error: 'No valid Notion connection found. Please connect your Notion account first.'
        };
      }

      connection = validatedConnection;
    }
    
    const client = new NotionClient(connection);
    return await operation(client);
  } catch (error: any) {
    log(`[NotionTools] ${operationName} failed`, 'error', {
      user_id: context.user_id,
      error: error.message
    });
    
    return {
      success: false,
      error: error.message || `Failed to ${operationName.toLowerCase()}`
    };
  }
}

/**
 * Get a Notion page by ID
 */
export async function notionGetPageTool(
  context: NotionToolContext,
  pageId: string
): Promise<NotionToolResult<any>> {
  if (!isValidNotionId(pageId)) {
    return { success: false, error: 'Invalid page ID format' };
  }
  
  const normalizedId = normalizeNotionId(pageId);
  
  return withNotionClient(context, async (client) => {
    return await client.getPage(normalizedId);
  }, 'Get page');
}

/**
 * Create a new Notion page
 */
export async function notionCreatePageTool(
  context: NotionToolContext,
  input: CreatePageInput
): Promise<NotionToolResult<any>> {
  if (input.parent.database_id && !isValidNotionId(input.parent.database_id)) {
    return { success: false, error: 'Invalid database ID format' };
  }
  
  if (input.parent.page_id && !isValidNotionId(input.parent.page_id)) {
    return { success: false, error: 'Invalid parent page ID format' };
  }
  
  return withNotionClient(context, async (client) => {
    const normalizedInput = { ...input };
    if (normalizedInput.parent.database_id) {
      normalizedInput.parent.database_id = normalizeNotionId(normalizedInput.parent.database_id);
    }
    if (normalizedInput.parent.page_id) {
      normalizedInput.parent.page_id = normalizeNotionId(normalizedInput.parent.page_id);
    }
    
    return await client.createPage(normalizedInput);
  }, 'Create page');
}

/**
 * Update a Notion page
 */
export async function notionUpdatePageTool(
  context: NotionToolContext,
  pageId: string,
  input: UpdatePageInput
): Promise<NotionToolResult<any>> {
  if (!isValidNotionId(pageId)) {
    return { success: false, error: 'Invalid page ID format' };
  }
  
  const normalizedId = normalizeNotionId(pageId);
  
  return withNotionClient(context, async (client) => {
    return await client.updatePage(normalizedId, input);
  }, 'Update page');
}

/**
 * Get a Notion database by ID
 */
export async function notionGetDatabaseTool(
  context: NotionToolContext,
  databaseId: string
): Promise<NotionToolResult<any>> {
  if (!isValidNotionId(databaseId)) {
    return { success: false, error: 'Invalid database ID format' };
  }
  
  const normalizedId = normalizeNotionId(databaseId);
  
  return withNotionClient(context, async (client) => {
    return await client.getDatabase(normalizedId);
  }, 'Get database');
}

/**
 * Query a Notion database
 */
export async function notionQueryDatabaseTool(
  context: NotionToolContext,
  input: QueryDatabaseInput
): Promise<NotionToolResult<any>> {
  if (!isValidNotionId(input.database_id)) {
    return { success: false, error: 'Invalid database ID format' };
  }
  
  const normalizedInput = {
    ...input,
    database_id: normalizeNotionId(input.database_id)
  };
  
  return withNotionClient(context, async (client) => {
    return await client.queryDatabase(normalizedInput);
  }, 'Query database');
}

/**
 * Create a new Notion database
 */
export async function notionCreateDatabaseTool(
  context: NotionToolContext,
  pageId: string,
  schema: any
): Promise<NotionToolResult<any>> {
  if (!isValidNotionId(pageId)) {
    return { success: false, error: 'Invalid page ID format' };
  }
  
  const normalizedId = normalizeNotionId(pageId);
  
  return withNotionClient(context, async (client) => {
    return await client.createDatabase(normalizedId, schema);
  }, 'Create database');
}

/**
 * Update a Notion database
 */
export async function notionUpdateDatabaseTool(
  context: NotionToolContext,
  databaseId: string,
  updates: any
): Promise<NotionToolResult<any>> {
  if (!isValidNotionId(databaseId)) {
    return { success: false, error: 'Invalid database ID format' };
  }
  
  const normalizedId = normalizeNotionId(databaseId);
  
  return withNotionClient(context, async (client) => {
    return await client.updateDatabase(normalizedId, updates);
  }, 'Update database');
}

/**
 * Get children blocks of a page or block
 */
export async function notionGetBlockChildrenTool(
  context: NotionToolContext,
  blockId: string,
  startCursor?: string
): Promise<NotionToolResult<any>> {
  if (!isValidNotionId(blockId)) {
    return { success: false, error: 'Invalid block ID format' };
  }
  
  const normalizedId = normalizeNotionId(blockId);
  
  return withNotionClient(context, async (client) => {
    return await client.getBlockChildren(normalizedId, startCursor);
  }, 'Get block children');
}

/**
 * Append blocks to a page or block
 */
export async function notionAppendBlockChildrenTool(
  context: NotionToolContext,
  input: AppendBlockChildrenInput
): Promise<NotionToolResult<any>> {
  if (!isValidNotionId(input.block_id)) {
    return { success: false, error: 'Invalid block ID format' };
  }
  
  const normalizedInput = {
    ...input,
    block_id: normalizeNotionId(input.block_id)
  };
  
  return withNotionClient(context, async (client) => {
    return await client.appendBlockChildren(normalizedInput);
  }, 'Append block children');
}

/**
 * Update a block
 */
export async function notionUpdateBlockTool(
  context: NotionToolContext,
  blockId: string,
  input: UpdateBlockInput
): Promise<NotionToolResult<any>> {
  if (!isValidNotionId(blockId)) {
    return { success: false, error: 'Invalid block ID format' };
  }
  
  const normalizedId = normalizeNotionId(blockId);
  
  return withNotionClient(context, async (client) => {
    return await client.updateBlock(normalizedId, input);
  }, 'Update block');
}

/**
 * Delete a block
 */
export async function notionDeleteBlockTool(
  context: NotionToolContext,
  blockId: string
): Promise<NotionToolResult<any>> {
  if (!isValidNotionId(blockId)) {
    return { success: false, error: 'Invalid block ID format' };
  }
  
  const normalizedId = normalizeNotionId(blockId);
  
  return withNotionClient(context, async (client) => {
    return await client.deleteBlock(normalizedId);
  }, 'Delete block');
}

/**
 * Get all users in the workspace
 */
export async function notionGetUsersTool(
  context: NotionToolContext
): Promise<NotionToolResult<any>> {
  return withNotionClient(context, async (client) => {
    return await client.getUsers();
  }, 'Get users');
}

/**
 * Get a specific user
 */
export async function notionGetUserTool(
  context: NotionToolContext,
  userId: string
): Promise<NotionToolResult<any>> {
  return withNotionClient(context, async (client) => {
    return await client.getUser(userId);
  }, 'Get user');
}

/**
 * Get comments for a page
 */
export async function notionGetCommentsTool(
  context: NotionToolContext,
  pageId: string,
  startCursor?: string
): Promise<NotionToolResult<any>> {
  if (!isValidNotionId(pageId)) {
    return { success: false, error: 'Invalid page ID format' };
  }
  
  const normalizedId = normalizeNotionId(pageId);
  
  return withNotionClient(context, async (client) => {
    return await client.getComments(normalizedId, startCursor);
  }, 'Get comments');
}

/**
 * Create a comment on a page
 */
export async function notionCreateCommentTool(
  context: NotionToolContext,
  input: CreateCommentInput
): Promise<NotionToolResult<any>> {
  if (!isValidNotionId(input.parent.page_id)) {
    return { success: false, error: 'Invalid page ID format' };
  }
  
  const normalizedInput = {
    ...input,
    parent: {
      page_id: normalizeNotionId(input.parent.page_id)
    }
  };
  
  return withNotionClient(context, async (client) => {
    return await client.createComment(normalizedInput);
  }, 'Create comment');
}

/**
 * Search the workspace
 */
export async function notionSearchTool(
  context: NotionToolContext,
  input: SearchInput = {}
): Promise<NotionToolResult<any>> {
  return withNotionClient(context, async (client) => {
    return await client.search(input);
  }, 'Search workspace');
}

/**
 * Get all pages and databases in the workspace
 */
export async function notionGetAllPagesTool(
  context: NotionToolContext
): Promise<NotionToolResult<any>> {
  return withNotionClient(context, async (client) => {
    return await client.getAllPages();
  }, 'Get all pages');
}

/**
 * Get page content with blocks as readable text
 */
export async function notionGetPageContentTool(
  context: NotionToolContext,
  pageId: string
): Promise<NotionToolResult<{ title: string; content: string; markdown: string }>> {
  if (!isValidNotionId(pageId)) {
    return { success: false, error: 'Invalid page ID format' };
  }
  
  const normalizedId = normalizeNotionId(pageId);
  
  return withNotionClient(context, async (client) => {
    // Get page details
    const pageResult = await client.getPage(normalizedId);
    if (!pageResult.success || !pageResult.data) {
      return {
        success: false,
        error: pageResult.error || 'Failed to retrieve page details'
      };
    }
    
    // Get all blocks in the page
    const blocksResult = await client.getAllBlocksInPage(normalizedId);
    if (!blocksResult.success || !blocksResult.data) {
      return {
        success: false,
        error: blocksResult.error || 'Failed to retrieve page blocks'
      };
    }
    
    const page = pageResult.data;
    const blocks = blocksResult.data;
    
    // Convert to readable text
    const title = extractTitle(page);
    const markdown = pageToText(page, blocks);
    const content = markdown; // For now, content and markdown are the same
    
    return {
      success: true,
      data: {
        title,
        content,
        markdown
      }
    };
  }, 'Get page content');
}

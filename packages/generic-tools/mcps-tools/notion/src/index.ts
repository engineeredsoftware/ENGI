// AI tool wrappers around Notion utilities for AI agents to interact with
// Notion workspaces, pages, databases, blocks, comments, and search functionality.

import { Tool } from '@bitcode/tools-generics';

import {
  notionGetPageTool as _notionGetPage,
  notionCreatePageTool as _notionCreatePage,
  notionUpdatePageTool as _notionUpdatePage,
  notionGetPageContentTool as _notionGetPageContent,
  notionGetDatabaseTool as _notionGetDatabase,
  notionQueryDatabaseTool as _notionQueryDatabase,
  notionCreateDatabaseTool as _notionCreateDatabase,
  notionUpdateDatabaseTool as _notionUpdateDatabase,
  notionGetBlockChildrenTool as _notionGetBlockChildren,
  notionAppendBlockChildrenTool as _notionAppendBlockChildren,
  notionUpdateBlockTool as _notionUpdateBlock,
  notionDeleteBlockTool as _notionDeleteBlock,
  notionGetUsersTool as _notionGetUsers,
  notionGetUserTool as _notionGetUser,
  notionGetCommentsTool as _notionGetComments,
  notionCreateCommentTool as _notionCreateComment,
  notionSearchTool as _notionSearch,
  notionGetAllPagesTool as _notionGetAllPages,
} from '@bitcode/externals-notion';

// ---------------------------------------------------------------------------
// Page Operations
// ---------------------------------------------------------------------------

/**
 * Retrieve a Notion page with its properties, metadata, and structure
 */
class NotionGetPageTool extends Tool<typeof _notionGetPage> {
  use = _notionGetPage;
}

export const notionGetPageTool = new NotionGetPageTool();

/**
 * Create a new Notion page in a database or as a child of another page
 */
class NotionCreatePageTool extends Tool<typeof _notionCreatePage> {
  use = _notionCreatePage;
}

export const notionCreatePageTool = new NotionCreatePageTool();

/**
 * Update an existing Notion page's properties, icon, cover, or archive status
 */
class NotionUpdatePageTool extends Tool<typeof _notionUpdatePage> {
  use = _notionUpdatePage;
}

export const notionUpdatePageTool = new NotionUpdatePageTool();

/**
 * Retrieve page content as readable text and markdown format
 */
class NotionGetPageContentTool extends Tool<typeof _notionGetPageContent> {
  use = _notionGetPageContent;
}

export const notionGetPageContentTool = new NotionGetPageContentTool();

// ---------------------------------------------------------------------------
// Database Operations
// ---------------------------------------------------------------------------

/**
 * Retrieve a Notion database with its schema and property definitions
 */
class NotionGetDatabaseTool extends Tool<typeof _notionGetDatabase> {
  use = _notionGetDatabase;
}

export const notionGetDatabaseTool = new NotionGetDatabaseTool();

/**
 * Query a Notion database with filters, sorting, and pagination
 */
class NotionQueryDatabaseTool extends Tool<typeof _notionQueryDatabase> {
  use = _notionQueryDatabase;
}

export const notionQueryDatabaseTool = new NotionQueryDatabaseTool();

/**
 * Create a new Notion database as a child of a page with custom schema
 */
class NotionCreateDatabaseTool extends Tool<typeof _notionCreateDatabase> {
  use = _notionCreateDatabase;
}

export const notionCreateDatabaseTool = new NotionCreateDatabaseTool();

/**
 * Update a Notion database's properties schema and configuration
 */
class NotionUpdateDatabaseTool extends Tool<typeof _notionUpdateDatabase> {
  use = _notionUpdateDatabase;
}

export const notionUpdateDatabaseTool = new NotionUpdateDatabaseTool();

// ---------------------------------------------------------------------------
// Block Operations
// ---------------------------------------------------------------------------

/**
 * Retrieve child blocks of a page or block with pagination support
 */
class NotionGetBlockChildrenTool extends Tool<typeof _notionGetBlockChildren> {
  use = _notionGetBlockChildren;
}

export const notionGetBlockChildrenTool = new NotionGetBlockChildrenTool();

/**
 * Append new content blocks to a page or existing block
 */
class NotionAppendBlockChildrenTool extends Tool<typeof _notionAppendBlockChildren> {
  use = _notionAppendBlockChildren;
}

export const notionAppendBlockChildrenTool = new NotionAppendBlockChildrenTool();

/**
 * Update the content of a specific block
 */
class NotionUpdateBlockTool extends Tool<typeof _notionUpdateBlock> {
  use = _notionUpdateBlock;
}

export const notionUpdateBlockTool = new NotionUpdateBlockTool();

/**
 * Delete a block by archiving it
 */
class NotionDeleteBlockTool extends Tool<typeof _notionDeleteBlock> {
  use = _notionDeleteBlock;
}

export const notionDeleteBlockTool = new NotionDeleteBlockTool();

// ---------------------------------------------------------------------------
// User Operations
// ---------------------------------------------------------------------------

/**
 * Retrieve all users in the Notion workspace
 */
class NotionGetUsersTool extends Tool<typeof _notionGetUsers> {
  use = _notionGetUsers;
}

export const notionGetUsersTool = new NotionGetUsersTool();

/**
 * Retrieve specific user information by user ID
 */
class NotionGetUserTool extends Tool<typeof _notionGetUser> {
  use = _notionGetUser;
}

export const notionGetUserTool = new NotionGetUserTool();

// ---------------------------------------------------------------------------
// Comment Operations
// ---------------------------------------------------------------------------

/**
 * Retrieve comments for a specific page with pagination support
 */
class NotionGetCommentsTool extends Tool<typeof _notionGetComments> {
  use = _notionGetComments;
}

export const notionGetCommentsTool = new NotionGetCommentsTool();

/**
 * Create a new comment on a Notion page
 */
class NotionCreateCommentTool extends Tool<typeof _notionCreateComment> {
  use = _notionCreateComment;
}

export const notionCreateCommentTool = new NotionCreateCommentTool();

// ---------------------------------------------------------------------------
// Search Operations
// ---------------------------------------------------------------------------

/**
 * Search the Notion workspace for pages and databases using text queries
 */
class NotionSearchTool extends Tool<typeof _notionSearch> {
  use = _notionSearch;
}

export const notionSearchTool = new NotionSearchTool();

/**
 * Retrieve all accessible pages and databases in the workspace
 */
class NotionGetAllPagesTool extends Tool<typeof _notionGetAllPages> {
  use = _notionGetAllPages;
}

export const notionGetAllPagesTool = new NotionGetAllPagesTool();

// ---------------------------------------------------------------------------
// Re-export Tool function types for strong typing at call-sites
// ---------------------------------------------------------------------------

export type NotionGetPageToolFn = typeof notionGetPageTool;
export type NotionCreatePageToolFn = typeof notionCreatePageTool;
export type NotionUpdatePageToolFn = typeof notionUpdatePageTool;
export type NotionGetPageContentToolFn = typeof notionGetPageContentTool;
export type NotionGetDatabaseToolFn = typeof notionGetDatabaseTool;
export type NotionQueryDatabaseToolFn = typeof notionQueryDatabaseTool;
export type NotionCreateDatabaseToolFn = typeof notionCreateDatabaseTool;
export type NotionUpdateDatabaseToolFn = typeof notionUpdateDatabaseTool;
export type NotionGetBlockChildrenToolFn = typeof notionGetBlockChildrenTool;
export type NotionAppendBlockChildrenToolFn = typeof notionAppendBlockChildrenTool;
export type NotionUpdateBlockToolFn = typeof notionUpdateBlockTool;
export type NotionDeleteBlockToolFn = typeof notionDeleteBlockTool;
export type NotionGetUsersToolFn = typeof notionGetUsersTool;
export type NotionGetUserToolFn = typeof notionGetUserTool;
export type NotionGetCommentsToolFn = typeof notionGetCommentsTool;
export type NotionCreateCommentToolFn = typeof notionCreateCommentTool;
export type NotionSearchToolFn = typeof notionSearchTool;
export type NotionGetAllPagesToolFn = typeof notionGetAllPagesTool;
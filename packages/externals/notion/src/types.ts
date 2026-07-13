export interface NotionConnection {
  id: string;
  user_id: string;
  access_token: string;
  bot_id: string;
  workspace_id: string;
  workspace_name: string;
  workspace_icon?: string;
  owner_type: 'user' | 'workspace';
  created_at: string;
  updated_at: string;
}

export interface NotionOAuthData {
  access_token: string;
  token_type: 'bearer';
  bot_id: string;
  workspace_name: string;
  workspace_icon?: string;
  workspace_id: string;
  owner: {
    type: 'user' | 'workspace';
    user?: {
      object: 'user';
      id: string;
      name?: string;
      avatar_url?: string;
      type: 'person';
      person: {
        email: string;
      };
    };
    workspace?: {
      id: string;
      name: string;
    };
  };
  duplicated_template_id?: string;
  request_id: string;
}

export interface NotionPage {
  id: string;
  created_time: string;
  last_edited_time: string;
  created_by: {
    object: 'user';
    id: string;
  };
  last_edited_by: {
    object: 'user';
    id: string;
  };
  cover?: {
    type: 'external' | 'file';
    external?: { url: string };
    file?: { url: string; expiry_time: string };
  };
  icon?: {
    type: 'emoji' | 'external' | 'file';
    emoji?: string;
    external?: { url: string };
    file?: { url: string; expiry_time: string };
  };
  parent: {
    type: 'database_id' | 'page_id' | 'workspace';
    database_id?: string;
    page_id?: string;
  };
  archived: boolean;
  properties: Record<string, any>;
  url: string;
  public_url?: string;
}

export interface NotionDatabase {
  id: string;
  created_time: string;
  last_edited_time: string;
  created_by: {
    object: 'user';
    id: string;
  };
  last_edited_by: {
    object: 'user';
    id: string;
  };
  title: Array<{
    type: 'text';
    text: {
      content: string;
      link?: { url: string };
    };
    annotations: {
      bold: boolean;
      italic: boolean;
      strikethrough: boolean;
      underline: boolean;
      code: boolean;
      color: string;
    };
    plain_text: string;
    href?: string;
  }>;
  description: Array<any>;
  icon?: {
    type: 'emoji' | 'external' | 'file';
    emoji?: string;
    external?: { url: string };
    file?: { url: string; expiry_time: string };
  };
  cover?: {
    type: 'external' | 'file';
    external?: { url: string };
    file?: { url: string; expiry_time: string };
  };
  properties: Record<string, any>;
  parent: {
    type: 'page_id' | 'workspace';
    page_id?: string;
  };
  url: string;
  public_url?: string;
  archived: boolean;
}

export interface NotionBlock {
  object: 'block';
  id: string;
  parent: {
    type: 'page_id' | 'block_id';
    page_id?: string;
    block_id?: string;
  };
  created_time: string;
  last_edited_time: string;
  created_by: {
    object: 'user';
    id: string;
  };
  last_edited_by: {
    object: 'user';
    id: string;
  };
  has_children: boolean;
  archived: boolean;
  type: string;
  [key: string]: any; // Block-specific properties
}

export interface NotionUser {
  object: 'user';
  id: string;
  type: 'person' | 'bot';
  name?: string;
  avatar_url?: string;
  person?: {
    email?: string;
  };
  bot?: {
    owner: {
      type: 'workspace';
      workspace: boolean;
    };
    workspace_name?: string;
  };
}

export interface NotionComment {
  object: 'comment';
  id: string;
  parent: {
    type: 'page_id';
    page_id: string;
  } | {
    type: 'block_id';
    block_id: string;
  };
  discussion_id: string;
  created_time: string;
  last_edited_time: string;
  created_by: {
    object: 'user';
    id: string;
  };
  rich_text: Array<{
    type: 'text';
    text: {
      content: string;
      link?: { url: string };
    };
    annotations: {
      bold: boolean;
      italic: boolean;
      strikethrough: boolean;
      underline: boolean;
      code: boolean;
      color: string;
    };
    plain_text: string;
    href?: string;
  }>;
}

export interface CreatePageInput {
  parent: {
    database_id?: string;
    page_id?: string;
    type?: 'database_id' | 'page_id';
  };
  properties: Record<string, any>;
  children?: NotionBlock[];
  icon?: {
    type: 'emoji';
    emoji: string;
  } | {
    type: 'external';
    external: { url: string };
  };
  cover?: {
    type: 'external';
    external: { url: string };
  };
}

export interface UpdatePageInput {
  properties?: Record<string, any>;
  archived?: boolean;
  icon?: {
    type: 'emoji';
    emoji: string;
  } | {
    type: 'external';
    external: { url: string };
  } | null;
  cover?: {
    type: 'external';
    external: { url: string };
  } | null;
}

export interface QueryDatabaseInput {
  database_id: string;
  filter?: any;
  sorts?: Array<{
    property?: string;
    timestamp?: 'created_time' | 'last_edited_time';
    direction: 'ascending' | 'descending';
  }>;
  start_cursor?: string;
  page_size?: number;
}

export interface SearchInput {
  query?: string;
  filter?: {
    value: 'page' | 'database';
    property: 'object';
  };
  sort?: {
    direction: 'ascending' | 'descending';
    timestamp: 'last_edited_time';
  };
  start_cursor?: string;
  page_size?: number;
}

export interface AppendBlockChildrenInput {
  block_id: string;
  children: NotionBlock[];
  after?: string;
}

export interface UpdateBlockInput {
  [blockType: string]: any;
}

export interface CreateCommentInput {
  parent: {
    page_id: string;
  };
  rich_text: Array<{
    text: {
      content: string;
    };
  }>;
}

export interface NotionError {
  object: 'error';
  status: number;
  code: string;
  message: string;
  developer_survey?: string;
}

export interface PaginatedResponse<T> {
  object: 'list';
  results: T[];
  next_cursor?: string;
  has_more: boolean;
  type?: string;
  page_or_database?: Record<string, any>;
  developer_survey?: string;
  request_id?: string;
}

export interface NotionWorkspace {
  id: string;
  name: string;
  icon?: string;
}

export interface NotionIntegrationCapabilities {
  read_content: boolean;
  insert_content: boolean;
  update_content: boolean;
  read_user_info: boolean;
  read_user_email: boolean;
  insert_comments: boolean;
}

// Tool-specific types
export interface NotionToolContext {
  user_id: string;
  connection?: NotionConnection;
}

export interface NotionToolResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    request_id?: string;
    rate_limit?: {
      remaining: number;
      reset_time: string;
    };
  };
}
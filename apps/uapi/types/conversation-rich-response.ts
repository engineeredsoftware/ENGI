/**
 * CONVERSATION RICH RESPONSE TYPES - REVOLUTIONARY MESSAGE SYSTEM
 * 
 * Type definitions for dynamic rich responses rendered inside the Conversations experience.
 */

export interface BaseConversationRichMessage {
  id: string;
  role?: 'user' | 'assistant' | 'system';
  type?: 'user' | 'agent' | 'divider';
  content?: string;
  createdAt?: string;
  timestamp?: Date;
}

export interface ConversationRichMessage extends BaseConversationRichMessage {
  /** Rich content attachments - can contain multiple rich responses */
  richResponses?: ConversationRichResponse[];
  
  /** Interactive elements embedded in the message */
  interactiveElements?: ConversationInteractiveElement[];
  
  /** Conversation-specific metadata */
  conversationMetadata?: {
    queryType?: 'data_query' | 'pipeline_status' | 'conversation_ref' | 'code_analysis' | 'system_operation';
    autoRichTextReplaced?: boolean;
    safetyValidated?: boolean;
    toolsUsed?: string[];
    surpriseDelightActivated?: boolean;
  };
}

export interface ConversationRichResponse {
  /** Unique identifier for this rich response */
  id: string;
  
  /** Type of rich response content */
  type: ConversationRichResponseType;
  
  /** The actual content data */
  data: any;
  
  /** Metadata for rendering and interaction */
  metadata: {
    title?: string;
    description?: string;
    priority: 'high' | 'medium' | 'low';
    renderMode: 'inline' | 'compact' | 'expanded' | 'modal';
    interactionLevel: 'read_only' | 'interactive' | 'editable';
    performance: {
      renderCost: 'low' | 'medium' | 'high';
      updateFrequency?: 'static' | 'realtime' | 'periodic';
    };
  };
  
  /** Actions available on this rich response */
  actions?: ConversationRichAction[];
  
  /** Real-time update configuration */
  liveUpdate?: {
    enabled: boolean;
    interval?: number;
    eventSource?: string;
    updateStrategy: 'replace' | 'merge' | 'append';
  };
}

export type ConversationRichResponseType = 
  // Pipeline & Execution
  | 'pipeline_logs_compact'
  | 'pipeline_logs_detailed'
  | 'pipeline_status_card'
  | 'pipeline_metrics_dashboard'
  | 'pipeline_execution_timeline'
  
  // Code & Development
  | 'code_diff_viewer'
  | 'file_tree_explorer'
  | 'code_analysis_report'
  | 'architecture_diagram'
  | 'dependency_graph'
  
  // Data & Analytics
  | 'data_table_interactive'
  | 'metrics_chart'
  | 'performance_graph'
  | 'cost_analysis_breakdown'
  | 'roi_calculator'
  
  // Conversation & Collaboration
  | 'conversation_thread'
  | 'conversation_summary'
  | 'team_activity_feed'
  | 'shared_workspace'
  | 'collaborative_document'
  
  // System & Operations
  | 'system_status_dashboard'
  | 'resource_monitor'
  | 'deployment_tracker'
  | 'security_report'
  | 'audit_trail'
  
  // Interactive & Tools
  | 'interactive_checklist'
  | 'form_builder'
  | 'command_palette'
  | 'terminal_interface'
  | 'debug_console'
  
  // Surprise & Delight
  | 'celebration_animation'
  | 'achievement_unlock'
  | 'progress_celebration'
  | 'easter_egg_reveal'
  | 'personalized_insight';

export interface ConversationInteractiveElement {
  id: string;
  type: 'button' | 'toggle' | 'slider' | 'input' | 'dropdown' | 'checkbox' | 'radio' | 'file_upload';
  config: {
    label?: string;
    placeholder?: string;
    options?: Array<{ value: string; label: string }>;
    validation?: {
      required?: boolean;
      pattern?: string;
      min?: number;
      max?: number;
    };
  };
  state: any;
  onChange: (value: any) => void;
  actions: ConversationRichAction[];
}

export interface ConversationRichAction {
  id: string;
  type: 'navigate' | 'execute' | 'download' | 'share' | 'copy' | 'edit' | 'delete' | 'refresh' | 'expand' | 'collapse';
  label: string;
  icon?: string;
  handler: string | (() => void);
  config?: {
    confirmation?: {
      required: boolean;
      message: string;
    };
    loading?: {
      text: string;
      duration?: number;
    };
    success?: {
      message: string;
      duration?: number;
    };
    error?: {
      fallback: string;
    };
  };
}

// Specific Rich Response Data Types

export interface PipelineLogsCompactData {
  runId: string;
  pipelineType: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  currentPhase: string;
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
  recentLogs: Array<{
    timestamp: string;
    level: 'info' | 'warning' | 'error' | 'success';
    message: string;
    phase?: string;
    agent?: string;
  }>;
  metrics: {
    duration: number;
    tokensUsed: number;
    btdConsumed: number;
  };
}

export interface PipelineLogsDetailedData extends PipelineLogsCompactData {
  fullLogs: Array<{
    id: string;
    timestamp: string;
    level: 'info' | 'warning' | 'error' | 'success' | 'debug';
    message: string;
    phase: string;
    agent: string;
    step?: string;
    metadata?: Record<string, any>;
    context?: {
      file?: string;
      line?: number;
      function?: string;
    };
  }>;
  phases: Array<{
    name: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    startTime?: string;
    endTime?: string;
    duration?: number;
    agents: Array<{
      name: string;
      status: 'pending' | 'running' | 'completed' | 'failed';
      progress?: number;
    }>;
  }>;
  systemMetrics: {
    cpuUsage: number[];
    memoryUsage: number[];
    diskIO: number[];
    networkIO: number[];
  };
}

export interface CodeDiffViewerData {
  title: string;
  files: Array<{
    path: string;
    language: string;
    oldContent?: string;
    newContent: string;
    changeType: 'added' | 'modified' | 'deleted' | 'renamed';
    stats: {
      additions: number;
      deletions: number;
      changes: number;
    };
  }>;
  summary: {
    totalFiles: number;
    totalAdditions: number;
    totalDeletions: number;
  };
  context: {
    repo: string;
    branch: string;
    commit?: string;
    pr?: string;
    comparison?: {
      base: string;
      head: string;
    };
  };
}

export interface DataTableInteractiveData {
  columns: Array<{
    key: string;
    label: string;
    type: 'string' | 'number' | 'date' | 'boolean' | 'enum' | 'action';
    sortable?: boolean;
    filterable?: boolean;
    width?: number;
    format?: string;
  }>;
  rows: Array<Record<string, any>>;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: Array<{
    column: string;
    operator: 'equals' | 'contains' | 'greater' | 'less' | 'in' | 'between';
    value: any;
  }>;
  sorting: Array<{
    column: string;
    direction: 'asc' | 'desc';
  }>;
  actions: {
    rowActions?: ConversationRichAction[];
    bulkActions?: ConversationRichAction[];
    headerActions?: ConversationRichAction[];
  };
}

export interface ConversationThreadData {
  conversationId: string;
  title: string;
  participants: Array<{
    id: string;
    name: string;
    role: 'user' | 'assistant' | 'system';
    avatar?: string;
  }>;
  messages: Array<{
    id: string;
    authorId: string;
    content: string;
    timestamp: string;
    type: 'text' | 'code' | 'file' | 'image' | 'rich_response';
    reactions?: Array<{
      emoji: string;
      count: number;
      users: string[];
    }>;
    replies?: ConversationThreadData['messages'];
  }>;
  status: 'active' | 'archived' | 'closed';
  linkedPipelines?: Array<{
    id: string;
    type: string;
    status: string;
    link: string;
  }>;
  context: {
    repo?: string;
    branch?: string;
    project?: string;
    tags?: string[];
  };
}

// Rich Response Renderer Props
export interface ConversationRichResponseRendererProps {
  richResponse: ConversationRichResponse;
  messageId: string;
  conversationId: string;
  onAction: (action: ConversationRichAction, context?: any) => void;
  onUpdate?: (data: any) => void;
  className?: string;
}

// Rich Response Factory
export interface ConversationRichResponseFactory {
  createPipelineLogsCompact(runId: string, data: PipelineLogsCompactData): ConversationRichResponse;
  createPipelineLogsDetailed(runId: string, data: PipelineLogsDetailedData): ConversationRichResponse;
  createCodeDiffViewer(data: CodeDiffViewerData): ConversationRichResponse;
  createDataTableInteractive(data: DataTableInteractiveData): ConversationRichResponse;
  createConversationThread(data: ConversationThreadData): ConversationRichResponse;
  
  // Multi-response factory
  createMultiResponse(responses: ConversationRichResponse[]): ConversationRichResponse[];
  
  // Smart response selection
  selectOptimalResponse(
    data: any, 
    context: { 
      userPreference?: string; 
      screenSize?: string; 
      performance?: string; 
    }
  ): ConversationRichResponse;
}

// Stream Event Extensions for Rich Responses
export interface ConversationRichStreamEvent {
  type: 'rich_response' | 'rich_response_update' | 'interactive_element_update';
  data: {
    messageId: string;
    richResponse?: ConversationRichResponse;
    update?: {
      richResponseId: string;
      data: any;
      updateType: 'replace' | 'merge' | 'append';
    };
    interactiveElement?: {
      elementId: string;
      state: any;
    };
  };
}

// Error Types for Rich Responses
export interface ConversationRichResponseError {
  type: 'render_error' | 'data_error' | 'permission_error' | 'network_error' | 'timeout_error';
  richResponseId: string;
  message: string;
  code?: string;
  retryable: boolean;
  fallback?: {
    type: ConversationRichResponseType;
    data: any;
  };
}

// Performance Monitoring
export interface ConversationRichResponseMetrics {
  richResponseId: string;
  renderTime: number;
  updateTime: number;
  memoryUsage: number;
  interactionCount: number;
  errorCount: number;
  userSatisfaction?: number; // 1-5 rating
}

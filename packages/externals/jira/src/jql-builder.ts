/**
 * JQL (Jira Query Language) Builder and Utilities
 * 
 * Provides safe, type-checked JQL query construction with injection prevention
 * and intelligent query optimization for Jira Cloud API integration.
 */

/**
 * JQL Builder for safe query construction
 */
export class JQLBuilder {
  private conditions: string[] = [];
  private orderFields: string[] = [];
  private ascending = true;

  /**
   * Add project filter
   */
  project(key: string): this {
    this.conditions.push(`project = "${this.escapeValue(key)}"`);
    return this;
  }

  /**
   * Add multiple projects filter
   */
  projects(keys: string[]): this {
    const escapedKeys = keys.map(k => `"${this.escapeValue(k)}"`).join(', ');
    this.conditions.push(`project in (${escapedKeys})`);
    return this;
  }

  /**
   * Add assignee filter
   */
  assignee(accountId: string): this {
    this.conditions.push(`assignee = "${this.escapeValue(accountId)}"`);
    return this;
  }

  /**
   * Add current user assignee filter
   */
  assigneeCurrentUser(): this {
    this.conditions.push('assignee = currentUser()');
    return this;
  }

  /**
   * Add unassigned filter
   */
  unassigned(): this {
    this.conditions.push('assignee is EMPTY');
    return this;
  }

  /**
   * Add status filter
   */
  status(statusName: string): this {
    this.conditions.push(`status = "${this.escapeValue(statusName)}"`);
    return this;
  }

  /**
   * Add multiple statuses filter
   */
  statuses(statusNames: string[]): this {
    const escapedStatuses = statusNames.map(s => `"${this.escapeValue(s)}"`).join(', ');
    this.conditions.push(`status in (${escapedStatuses})`);
    return this;
  }

  /**
   * Add issue type filter
   */
  issueType(typeName: string): this {
    this.conditions.push(`issuetype = "${this.escapeValue(typeName)}"`);
    return this;
  }

  /**
   * Add multiple issue types filter
   */
  issueTypes(typeNames: string[]): this {
    const escapedTypes = typeNames.map(t => `"${this.escapeValue(t)}"`).join(', ');
    this.conditions.push(`issuetype in (${escapedTypes})`);
    return this;
  }

  /**
   * Add priority filter
   */
  priority(priorityName: string): this {
    this.conditions.push(`priority = "${this.escapeValue(priorityName)}"`);
    return this;
  }

  /**
   * Add high priority filter (Highest, High)
   */
  highPriority(): this {
    this.conditions.push('priority in (Highest, High)');
    return this;
  }

  /**
   * Add resolution filter
   */
  resolution(resolutionName: string): this {
    this.conditions.push(`resolution = "${this.escapeValue(resolutionName)}"`);
    return this;
  }

  /**
   * Add unresolved filter
   */
  unresolved(): this {
    this.conditions.push('resolution = Unresolved');
    return this;
  }

  /**
   * Add resolved filter
   */
  resolved(): this {
    this.conditions.push('resolution != Unresolved');
    return this;
  }

  /**
   * Add created date filter
   */
  createdAfter(date: string): this {
    this.conditions.push(`created >= "${this.escapeValue(date)}"`);
    return this;
  }

  /**
   * Add created in last N days
   */
  createdInLastDays(days: number): this {
    this.conditions.push(`created >= -${Math.abs(days)}d`);
    return this;
  }

  /**
   * Add updated date filter
   */
  updatedAfter(date: string): this {
    this.conditions.push(`updated >= "${this.escapeValue(date)}"`);
    return this;
  }

  /**
   * Add updated in last N days
   */
  updatedInLastDays(days: number): this {
    this.conditions.push(`updated >= -${Math.abs(days)}d`);
    return this;
  }

  /**
   * Add due date filter
   */
  dueAfter(date: string): this {
    this.conditions.push(`duedate >= "${this.escapeValue(date)}"`);
    return this;
  }

  /**
   * Add overdue filter
   */
  overdue(): this {
    this.conditions.push('duedate < now() AND resolution = Unresolved');
    return this;
  }

  /**
   * Add label filter
   */
  hasLabel(labelName: string): this {
    this.conditions.push(`labels = "${this.escapeValue(labelName)}"`);
    return this;
  }

  /**
   * Add multiple labels filter (ANY)
   */
  hasAnyLabel(labelNames: string[]): this {
    const escapedLabels = labelNames.map(l => `"${this.escapeValue(l)}"`).join(', ');
    this.conditions.push(`labels in (${escapedLabels})`);
    return this;
  }

  /**
   * Add component filter
   */
  component(componentName: string): this {
    this.conditions.push(`component = "${this.escapeValue(componentName)}"`);
    return this;
  }

  /**
   * Add text search in summary
   */
  summaryContains(text: string): this {
    this.conditions.push(`summary ~ "${this.escapeValue(text)}"`);
    return this;
  }

  /**
   * Add text search in description
   */
  descriptionContains(text: string): this {
    this.conditions.push(`description ~ "${this.escapeValue(text)}"`);
    return this;
  }

  /**
   * Add text search across summary and description
   */
  textContains(text: string): this {
    const escapedText = this.escapeValue(text);
    this.conditions.push(`(summary ~ "${escapedText}" OR description ~ "${escapedText}")`);
    return this;
  }

  /**
   * Add fix version filter
   */
  fixVersion(versionName: string): this {
    this.conditions.push(`fixVersion = "${this.escapeValue(versionName)}"`);
    return this;
  }

  /**
   * Add affects version filter
   */
  affectsVersion(versionName: string): this {
    this.conditions.push(`affectedVersion = "${this.escapeValue(versionName)}"`);
    return this;
  }

  /**
   * Add custom condition (use with caution)
   */
  custom(condition: string): this {
    // Basic validation to prevent obvious injection attempts
    if (this.containsDangerousPatterns(condition)) {
      throw new Error('Potentially dangerous JQL condition detected');
    }
    this.conditions.push(condition);
    return this;
  }

  /**
   * Order by field
   */
  orderBy(field: string, ascending = true): this {
    this.orderFields = [`${field} ${ascending ? 'ASC' : 'DESC'}`];
    this.ascending = ascending;
    return this;
  }

  /**
   * Order by created date (newest first)
   */
  orderByCreated(ascending = false): this {
    return this.orderBy('created', ascending);
  }

  /**
   * Order by updated date (newest first)
   */
  orderByUpdated(ascending = false): this {
    return this.orderBy('updated', ascending);
  }

  /**
   * Order by priority (highest first)
   */
  orderByPriority(ascending = false): this {
    return this.orderBy('priority', ascending);
  }

  /**
   * Clear all conditions
   */
  clear(): this {
    this.conditions = [];
    this.orderFields = [];
    return this;
  }

  /**
   * Build the final JQL query
   */
  build(): string {
    if (this.conditions.length === 0) {
      throw new Error('At least one condition is required to build a JQL query');
    }

    let jql = this.conditions.join(' AND ');
    
    if (this.orderFields.length > 0) {
      jql += ` ORDER BY ${this.orderFields.join(', ')}`;
    }

    return jql;
  }

  /**
   * Escape special characters in JQL values
   */
  private escapeValue(value: string): string {
    return value
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/'/g, "\\'");
  }

  /**
   * Check for potentially dangerous patterns
   */
  private containsDangerousPatterns(input: string): boolean {
    const dangerousPatterns = [
      /\b(DROP|DELETE|UPDATE|INSERT|CREATE|ALTER)\b/i,
      /--/,
      /\/\*/,
      /\*\//,
      /<script/i,
      /javascript:/i,
    ];

    return dangerousPatterns.some(pattern => pattern.test(input));
  }
}

/**
 * Common JQL query templates
 */
export const JQLTemplates = {
  /**
   * My open issues
   */
  myOpenIssues: () => new JQLBuilder()
    .assigneeCurrentUser()
    .unresolved()
    .orderByUpdated(),

  /**
   * My recent issues
   */
  myRecentIssues: (days = 7) => new JQLBuilder()
    .assigneeCurrentUser()
    .updatedInLastDays(days)
    .orderByUpdated(),

  /**
   * Project backlog
   */
  projectBacklog: (projectKey: string) => new JQLBuilder()
    .project(projectKey)
    .status('To Do')
    .orderByPriority(),

  /**
   * Sprint issues
   */
  sprintIssues: (projectKey: string) => new JQLBuilder()
    .project(projectKey)
    .statuses(['In Progress', 'Code Review', 'Testing'])
    .orderByUpdated(),

  /**
   * Open bugs
   */
  openBugs: (projectKey?: string) => {
    const builder = new JQLBuilder()
      .issueType('Bug')
      .unresolved()
      .orderByPriority();
    
    if (projectKey) {
      builder.project(projectKey);
    }
    
    return builder;
  },

  /**
   * High priority issues
   */
  highPriorityOpen: (projectKey?: string) => {
    const builder = new JQLBuilder()
      .highPriority()
      .unresolved()
      .orderByCreated();
    
    if (projectKey) {
      builder.project(projectKey);
    }
    
    return builder;
  },

  /**
   * Overdue issues
   */
  overdueIssues: (projectKey?: string) => {
    const builder = new JQLBuilder()
      .overdue()
      .orderBy('duedate');
    
    if (projectKey) {
      builder.project(projectKey);
    }
    
    return builder;
  },

  /**
   * Recently completed
   */
  recentlyCompleted: (projectKey: string, days = 7) => new JQLBuilder()
    .project(projectKey)
    .resolved()
    .updatedInLastDays(days)
    .orderByUpdated(),

  /**
   * Unassigned issues
   */
  unassignedIssues: (projectKey: string) => new JQLBuilder()
    .project(projectKey)
    .unassigned()
    .unresolved()
    .orderByCreated(),
};

/**
 * Sanitize and validate JQL queries
 */
export function sanitizeJQL(jql: string): string {
  // Remove potentially dangerous content
  let sanitized = jql
    .replace(/\b(DROP|DELETE|UPDATE|INSERT|CREATE|ALTER)\b/gi, '')
    .replace(/--.*$/gm, '') // Remove SQL-style comments
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove C-style comments
    .replace(/<script[\s\S]*?<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, ''); // Remove javascript: protocols

  // Validate basic JQL syntax
  if (!isValidJQLSyntax(sanitized)) {
    throw new Error('Invalid JQL syntax detected');
  }

  return sanitized.trim();
}

/**
 * Basic JQL syntax validation
 */
export function isValidJQLSyntax(jql: string): boolean {
  // Check for balanced quotes
  const doubleQuotes = (jql.match(/"/g) || []).length;
  const singleQuotes = (jql.match(/'/g) || []).length;
  
  if (doubleQuotes % 2 !== 0 || singleQuotes % 2 !== 0) {
    return false;
  }

  // Check for valid JQL operators and functions
  const validPattern = /^[a-zA-Z0-9\s\-_"'().,=!<>~\[\]]+$/;
  if (!validPattern.test(jql)) {
    return false;
  }

  return true;
}

/**
 * Create a new JQL builder instance
 */
export function createJQLBuilder(): JQLBuilder {
  return new JQLBuilder();
}
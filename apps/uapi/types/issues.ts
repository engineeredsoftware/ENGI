export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IssueStatus = 'open' | 'in_progress' | 'closed';

export interface Issue {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  description: string;
  severity: IssueSeverity;
  status: IssueStatus;
  assigned_to: string | null;
  reported_by: string | null;
  metadata: Record<string, any>;
}

export type IssueEventType = 'created' | 'updated' | 'deleted';

export interface IssueEvent {
  id: string;
  issue_id: string;
  created_at: string;
  event_type: IssueEventType;
  old_data: Record<string, any> | null;
  new_data: Record<string, any> | null;
  metadata: Record<string, any>;
}
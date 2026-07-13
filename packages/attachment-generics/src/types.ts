/**
 * Attachment primitive types.
 *
 * Hierarchy:
 *   Attachment / BaseAttachment          # this package
 *     → FileAttachment                   # generic-attachments/file
 *     → ExternalAttachment               # generic-attachments/external
 *
 * Categories admitted: file | external only.
 * VCS and bare-URL categories removed; VCS/GitHub (and future Jira, etc.)
 * attach as external connections via the Externals auxillary.
 */

/** Core attachment type discriminator — only two product categories. */
export type AttachmentCategory = 'file' | 'external';

/** Base attachment — all attachments share these fields. */
export interface BaseAttachment {
  id: string;
  category: AttachmentCategory;
  title: string;
  description?: string;
  /** Optional deep-link / open URL (not a separate URL attachment category). */
  url?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
}

/**
 * Attachment reference for DB / message linkage.
 * Minimal fields to point at a stored attachment.
 */
export interface AttachmentReference {
  attachment_id: string;
  category: AttachmentCategory;
  /** Sub-type within category (file type or external type). */
  type?: string;
}

/**
 * Create-input skeleton. Category-specific payloads live on bases
 * (`file` / `external` partials filled by product builders).
 */
export interface CreateAttachmentInput {
  category: AttachmentCategory;
  title: string;
  description?: string;
  url?: string;
  metadata?: Record<string, unknown>;
  file?: Record<string, unknown>;
  external?: Record<string, unknown>;
}

export function isAttachmentCategory(value: unknown): value is AttachmentCategory {
  return value === 'file' || value === 'external';
}

export function validateAttachmentCategory(category: string): category is AttachmentCategory {
  return isAttachmentCategory(category);
}

export function isBaseAttachment(value: unknown): value is BaseAttachment {
  if (!value || typeof value !== 'object') return false;
  const a = value as Record<string, unknown>;
  return (
    typeof a.id === 'string' &&
    isAttachmentCategory(a.category) &&
    typeof a.title === 'string' &&
    typeof a.created_at === 'string'
  );
}

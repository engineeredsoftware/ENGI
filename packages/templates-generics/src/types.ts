/**
 * Template Types for the Bitcode platform
 * V26 Production Ready
 */

// Settle delivers AssetPacks via pull request after rights transfer.
export type DeliveryTemplateType = 'pullRequests';

// Evidence Document template types matching UI categories.
export type EvidenceDocumentTemplateType =
  | 'knowledgeExtension'
  | 'shippableFeedback'
  | 'assetPackFeedback'
  | 'mcpConfig';

// Base template interface
interface BaseTemplate {
  id: string;
  user_id: string;
  name: string;
  template_text: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeliveryTemplate extends BaseTemplate {
  shippable_type: DeliveryTemplateType;
}

// Evidence Document template.
export interface EvidenceDocumentTemplate extends BaseTemplate {
  evidenceDocumentType: EvidenceDocumentTemplateType;
}

// User template preferences
export interface UserTemplatePreferences {
  id: string;
  user_id: string;
  default_shippable_template_id?: string;
  default_evidence_document_template_id?: string;
  auto_save_templates: boolean;
  created_at: string;
  updated_at: string;
}

// Template creation payloads
export interface CreateDeliveryTemplatePayload {
  name: string;
  deliveryTypes: DeliveryTemplateType[];
  templateText: string;
}

export interface CreateEvidenceDocumentTemplatePayload {
  name: string;
  evidenceDocumentTypes: EvidenceDocumentTemplateType[];
  templateText: string;
}

// Response types
export interface TemplatesResponse<T> {
  templates: T[];
  error?: string;
}

export interface TemplatePreferencesResponse {
  preferences: UserTemplatePreferences | null;
  error?: string;
}

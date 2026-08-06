export interface DeliveryTemplate {
  id: string;
  name: string;
  text: string;
}

export interface DeliveryTemplates {
  pullRequests: DeliveryTemplate[];
}

export interface EvidenceDocumentTemplate {
  id: string;
  name: string;
  text: string;
}

export interface EvidenceDocumentTemplates {
  knowledgeExtension: EvidenceDocumentTemplate[];
  assetPackFeedback: EvidenceDocumentTemplate[];
  deliveryFeedback?: EvidenceDocumentTemplate[];
  mcpConfig: EvidenceDocumentTemplate[];
}

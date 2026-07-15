export interface ShippableTemplate {
  id: string;
  name: string;
  text: string;
}

export interface ShippableTemplates {
  pullRequests: ShippableTemplate[];
}

export interface EvidenceDocumentTemplate {
  id: string;
  name: string;
  text: string;
}

export interface EvidenceDocumentTemplates {
  knowledgeExtension: EvidenceDocumentTemplate[];
  assetPackFeedback: EvidenceDocumentTemplate[];
  shippableFeedback?: EvidenceDocumentTemplate[];
  mcpConfig: EvidenceDocumentTemplate[];
}

export interface IntegrationMetadata {
  database?: string;
  entry?: string;
  project?: string;
  frame?: string;
  dimensions?: string;
  lastEdited?: string;
}

export interface IntegrationOption {
  label: string;
  value: string;
  type: string;
  parentLabel?: string;
  subLabel?: string;
  isDisabled?: boolean;
  metadata?: IntegrationMetadata;
  options?: IntegrationOption[];
}


/**
 * Shared types for Bitcode public docs articles, chapters, and API reference.
 */
import type { BitcodeExplainer } from '@/components/bitcode/pipeline/BitcodeTransactionTypes/bitcode-transaction-types';

export type DocsGuideCard = {
  id: string;
  eyebrow: string;
  title: string;
  summary: string;
  detail: string;
  reason?: string;
  points?: readonly string[];
  steps?: readonly string[];
};

export type DocsEmbeddedUiSpecimen = {
  id: string;
  eyebrow: string;
  title: string;
  summary: string;
  explainer: BitcodeExplainer;
  signals?: readonly {
    label: string;
    value: string;
    tone?: 'default' | 'emerald' | 'amber' | 'cyan';
  }[];
  steps?: readonly {
    label: string;
    body: string;
  }[];
};

export type DocsInterfaceApiFeature = {
  name: string;
  method?: string;
  packagePath: string;
  useWhen: string;
  howToUse: string;
  inputs: readonly string[];
  outputs: readonly string[];
  verifyInTerminal?: string;
  failureModes?: readonly string[];
  requiresConfirmation?: boolean;
};

export type DocsInterfaceApiSection = {
  id: string;
  title: string;
  summary: string;
  packagePath: string;
  features: readonly DocsInterfaceApiFeature[];
};

export type BitcodeDocsPageSlug = string;

export type BitcodeDocsPage = {
  slug: BitcodeDocsPageSlug;
  href: string;
  chapterId: string;
  eyebrow: string;
  title: string;
  summary: string;
  detail: string;
  learningOutcome: string;
  primaryCta: {
    href: string;
    label: string;
  };
  sections: readonly DocsGuideCard[];
  embeddedUi?: readonly DocsEmbeddedUiSpecimen[];
  apiReference?: readonly DocsInterfaceApiSection[];
};

export type BitcodeDocsChapter = {
  id: string;
  number: string;
  title: string;
  summary: string;
  pages: readonly BitcodeDocsPage[];
};

export type TerminalActionGuide = {
  id: string;
  action: string;
  location: string;
  write: string;
  expectedRead: string;
  proofSignal: string;
};

export type TerminalReadGuide = {
  id: string;
  read: string;
  location: string;
  tellsYou: string;
  expectedResult: string;
};

import { useCallback, useEffect, useState } from 'react';
import type { EvidenceDocumentTemplates } from '@/types/templates';

interface ApiTemplate {
  id: string;
  name: string;
  evidenceDocumentType: string;
  template_text: string;
}

interface Hook {
  templates: EvidenceDocumentTemplates | null;
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export const useEvidenceDocumentTemplates = (): Hook => {
  const [templates, setTemplates] = useState<EvidenceDocumentTemplates | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/templates/evidence-documents');
      if (!res.ok) throw new Error(`Failed to load templates (${res.status})`);
      const data = await res.json();
      const grouped: any = {
        assetPackFeedback: [],
        knowledgeExtension: [],
        mcpConfig: [],
      } as EvidenceDocumentTemplates;

      (data.templates as ApiTemplate[]).forEach((t) => {
        // Normalize stored `mcpIntegration` payloads to the UI's `mcpConfig` bucket.
        const typeKey = (t.evidenceDocumentType === 'mcpIntegration' ? 'mcpConfig' : t.evidenceDocumentType) as keyof EvidenceDocumentTemplates;
        const arr = (grouped as any)[typeKey];
        if (arr) arr.push({ id: t.id, name: t.name, text: t.template_text });
      });
      try {
        const stored = localStorage.getItem('bitcode-mcp-configs');
        const mcpConfig = stored ? JSON.parse(stored) : {};
        grouped.mcpConfig = grouped.mcpConfig.filter((t: any) => mcpConfig[t.id]);
      } catch {}
      setTemplates(grouped as EvidenceDocumentTemplates);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  return { templates, isLoading, error, reload: fetchTemplates };
};

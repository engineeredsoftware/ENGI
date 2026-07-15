import { useCallback, useEffect, useState } from 'react';
import type { ShippableTemplates } from '@/types/templates';

interface ApiTemplate {
  id: string;
  name: string;
  shippable_type?: keyof ShippableTemplates;
  template_text: string;
}

interface Hook {
  templates: ShippableTemplates | null;
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export const useShippableTemplates = (): Hook => {
  const [templates, setTemplates] = useState<ShippableTemplates | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/templates/shippables');
      if (res.status === 401 || res.status === 404) {
        setTemplates({
          pullRequests: [],
        });
        return;
      }
      if (!res.ok) throw new Error(`Failed to load templates (${res.status})`);
      const data = await res.json();
      const grouped: ShippableTemplates = {
        pullRequests: [],
      };
      (data.templates as ApiTemplate[]).forEach(t => {
        const category = t.shippable_type;
        if (!category) return;
        const arr = grouped[category];
        if (arr) arr.push({ id: t.id, name: t.name, text: t.template_text });
      });
      setTemplates(grouped);
    } catch (err) {
      setTemplates({
        pullRequests: [],
      });
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  return { templates, isLoading, error, reload: fetchTemplates };
};

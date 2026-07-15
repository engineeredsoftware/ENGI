import { useCallback, useEffect, useState } from 'react';

interface UserTemplatePreferencesApiResponse {
  shippable_templates?: Record<string, string[]>;
  evidence_document_templates?: Record<string, string[]>;
}

export interface UserTemplatePreferences {
  shippable_templates: Record<string, string[]>;
  evidence_document_templates: Record<string, string[]>;
}

interface UseTemplatePreferencesHook {
  preferences: UserTemplatePreferences | null;
  isLoading: boolean;
  error: string | null;
  /**
   * Manually trigger a reload of the preferences from the API.
   */
  reload: () => Promise<void>;
}

/**
 * Client-side hook that fetches the current user's saved template
 * preferences (Shippable & Evidence Document) from `/api/auxillaries/template-preferences`.
 *
 * It automatically fetches once on mount but also returns a `reload`
 * function should the caller read to refresh the data (e.g. after a
 * successful template save).
 */
export const useTemplatePreferences = (): UseTemplatePreferencesHook => {
  const [preferences, setPreferences] = useState<UserTemplatePreferences | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auxillaries/template-preferences');
      if (res.status === 401 || res.status === 404) {
        setPreferences({
          shippable_templates: {},
          evidence_document_templates: {},
        });
        return;
      }
      if (!res.ok) {
        // Non-2xx response – surface message returned by the API when
        // possible to aid debugging.
        let msg = `Failed to load template preferences (${res.status})`;
        try {
          const errPayload = await res.json();
          if (errPayload?.error) msg = errPayload.error as string;
        } catch (_) {
          /* swallow json parse errors */
        }
        throw new Error(msg);
      }

      const data = (await res.json()) as UserTemplatePreferencesApiResponse;

      setPreferences({
        shippable_templates: data.shippable_templates ?? {},
        evidence_document_templates: data.evidence_document_templates ?? {},
      });
    } catch (err) {
      setPreferences({
        shippable_templates: {},
        evidence_document_templates: {},
      });
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  return {
    preferences,
    isLoading,
    error,
    reload: fetchPreferences,
  };
};

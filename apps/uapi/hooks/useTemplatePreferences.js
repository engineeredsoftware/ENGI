"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTemplatePreferences = void 0;
const react_1 = require("react");
/**
 * Client-side hook that fetches the current user's saved template
 * preferences (Shippable & Evidence Document) from `/api/auxillaries/template-preferences`.
 *
 * It automatically fetches once on mount but also returns a `reload`
 * function should the caller read to refresh the data (e.g. after a
 * successful template save).
 */
const useTemplatePreferences = () => {
    const [preferences, setPreferences] = (0, react_1.useState)(null);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const fetchPreferences = (0, react_1.useCallback)(async () => {
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
                    if (errPayload?.error)
                        msg = errPayload.error;
                }
                catch (_) {
                    /* swallow json parse errors */
                }
                throw new Error(msg);
            }
            const data = (await res.json());
            setPreferences({
                shippable_templates: data.shippable_templates ?? {},
                evidence_document_templates: data.evidence_document_templates ?? {},
            });
        }
        catch (err) {
            setPreferences({
                shippable_templates: {},
                evidence_document_templates: {},
            });
            setError(err instanceof Error ? err.message : String(err));
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    (0, react_1.useEffect)(() => {
        fetchPreferences();
    }, [fetchPreferences]);
    return {
        preferences,
        isLoading,
        error,
        reload: fetchPreferences,
    };
};
exports.useTemplatePreferences = useTemplatePreferences;

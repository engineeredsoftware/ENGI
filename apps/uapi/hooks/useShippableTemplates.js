"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useShippableTemplates = void 0;
const react_1 = require("react");
const useShippableTemplates = () => {
    const [templates, setTemplates] = (0, react_1.useState)(null);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const fetchTemplates = (0, react_1.useCallback)(async () => {
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
            if (!res.ok)
                throw new Error(`Failed to load templates (${res.status})`);
            const data = await res.json();
            const grouped = {
                pullRequests: [],
            };
            data.templates.forEach(t => {
                const category = t.shippable_type;
                if (!category)
                    return;
                const arr = grouped[category];
                if (arr)
                    arr.push({ id: t.id, name: t.name, text: t.template_text });
            });
            setTemplates(grouped);
        }
        catch (err) {
            setTemplates({
                pullRequests: [],
            });
            setError(err instanceof Error ? err.message : String(err));
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    (0, react_1.useEffect)(() => { fetchTemplates(); }, [fetchTemplates]);
    return { templates, isLoading, error, reload: fetchTemplates };
};
exports.useShippableTemplates = useShippableTemplates;

import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import glassyInputStyles from '@/components/bitcode/inputs/glassy-input.module.css';
import { ENABLE_ENHANCE_NEED_DEFINITION } from '@/config/featureFlags';

interface Attachment {
  id: string;
  type: string;
  content?: string;
}

interface ExecutionInputProps {
  definitionOfRead: string;
  onChange: (value: string) => void;
  isProcessing: boolean;
  placeholder?: string;
  /** Execution type to drive mode-specific behavior */
  type?: string;
  /** Initial content loaded (e.g. from template); disables save when equal */
  initialDefinitionOfNeed?: string;
  /** Additional context to feed into the Enhance endpoint */
  attachments?: Attachment[];
  /** Optional repo slug (owner/repo).  If undefined or null no repo context will be sent. */
  repoSlug?: string | null;
  /** Callback for enhance writing errors */
  onEnhanceError?: (error: string | null) => void;
  /** Hover handlers for displaying enhancement edu box */
  onEnhanceMouseEnter?: () => void;
  onEnhanceMouseLeave?: () => void;
  /** Hover handlers for displaying save-template edu box */
  onSaveTemplateMouseEnter?: () => void;
  onSaveTemplateMouseLeave?: () => void;
  /** Callback triggered after a template is successfully saved */
  onTemplateSaved?: () => void;
}

interface TemplateCategory {
  id: string;
  name: string;
  checked: boolean;
}

export const ExecutionReadInput = ({
  definitionOfRead,
  onChange,
  isProcessing,
  placeholder = "Definition of Read...",
  type,
  initialDefinitionOfNeed,
  attachments = [],
  repoSlug = null,
  onEnhanceError,
  onEnhanceMouseEnter,
  onEnhanceMouseLeave,
  onSaveTemplateMouseEnter,
  onSaveTemplateMouseLeave,
  onTemplateSaved,
}: ExecutionInputProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateCategories, setTemplateCategories] = useState<TemplateCategory[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [enhanceError, setEnhanceError] = useState<string | null>(null);

  // Determine mode from explicit type prop (preferred) or fallback to path sniffing
  useEffect(() => {
    if (type === 'knowledge' || type === 'mcp') {
      setTemplateCategories([
        { id: 'knowledgeExtension', name: 'Knowledge Extension', checked: true },
        { id: 'assetPackFeedback', name: 'AssetPack Feedback', checked: false },
        { id: 'mcpConfig', name: 'MCP Config', checked: false },
      ]);
    } else {
      setTemplateCategories([
        { id: 'pullRequests', name: 'Pull Request', checked: true },
      ]);
    }
  }, [type]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      containerRef.current.style.setProperty("--mouse-x", x + "px");
      containerRef.current.style.setProperty("--mouse-y", y + "px");
    };

    const el = containerRef.current;
    el?.addEventListener("mousemove", handleMouseMove);
    return () => el?.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleEnhanceWriting = async () => {
    if (!definitionOfRead.trim() || isEnhancing) return;

    setIsEnhancing(true);
    setEnhanceError(null);
    onEnhanceError?.(null);
    try {
      const res = await fetch('/api/enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: definitionOfRead,
          attachments,
          repoSlug,
        }),
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(errText || `Enhance request failed (${res.status})`);
      }
      const json = await res.json();
      if (typeof json.enhanced === 'string') {
        onChange(json.enhanced);
      }
    } catch (error) {
      console.error('Error enhancing writing:', error);
      const errorMessage = (error as Error)?.message || 'Unknown error';
      setEnhanceError(errorMessage);
      onEnhanceError?.(errorMessage);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSaveTemplate = () => {
    if (!definitionOfRead.trim()) return;
    setShowSaveModal(true);
  };

  const handleSaveConfirm = async () => {
    if (!templateName.trim() || !templateCategories.some(cat => cat.checked)) {
      return;
    }

    try {
      const response = await fetch('/api/templates/shippables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: templateName.trim(),
          shippableTypes: templateCategories
            .filter(cat => cat.checked)
            .map(cat => cat.id),
          templateText: definitionOfRead,
        }),
      });
      if (!response.ok) {
        throw new Error(`Failed to save template (${response.status}): ${await response.text()}`);
      }

      setSaveSuccess(true);
      onTemplateSaved?.();

      setTimeout(() => {
        setSaveSuccess(false);
        setShowSaveModal(false);
        setTemplateName('');
      }, 1500);
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const toggleCategory = (id: string) => {
    setTemplateCategories(prev =>
      prev.map(cat => cat.id === id ? { ...cat, checked: !cat.checked } : cat)
    );
  };

  // Clear enhance error if the user modifies text
  useEffect(() => {
    if (enhanceError) {
      setEnhanceError(null);
      onEnhanceError?.(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [definitionOfRead]);

  return (
    <div
      ref={containerRef}
      className={`relative my-awesome-textarea ${glassyInputStyles.container} transition-all duration-300 ease-out ${definitionOfRead.trim() ? 'has-content' : ''}`}
    >
      <div className={`${glassyInputStyles.cornerDot} ${glassyInputStyles.tl}`} />
      <div className={`${glassyInputStyles.cornerDot} ${glassyInputStyles.tr}`} />
      <div className={`${glassyInputStyles.cornerDot} ${glassyInputStyles.bl}`} />
      <div className={`${glassyInputStyles.cornerDot} ${glassyInputStyles.br}`} />

      <textarea data-testid="execution-read-definition-input"
        className="w-full min-h-[366px] px-4 py-4 bg-transparent text-gray-100 placeholder-gray-500 font-mono resize-none focus:outline-none"
        placeholder={placeholder}
        value={definitionOfRead}
        onChange={(e) => onChange(e.target.value)}
        spellCheck="false"
        style={{
          caretShape: 'block',
        }}
        disabled={isProcessing}
      />

      {/* Action buttons - floating on the right for ≥md, stacked below for small screens */}
      {/* Desktop / tablet (vertical) - positioned outside textarea area */}
      <div className="hidden laptop:flex absolute -right-14 top-1/2 -translate-y-1/2 flex-col space-y-4">
        {/* Enhance Writing Button - always shown, disabled when feature flag is off */}
        <button
          onClick={handleEnhanceWriting}
          onMouseEnter={onEnhanceMouseEnter}
          onMouseLeave={onEnhanceMouseLeave}
          disabled={!ENABLE_ENHANCE_NEED_DEFINITION || isEnhancing || isProcessing || !definitionOfRead.trim()}
          className={`
            flex items-center justify-center w-10 h-10
            transition-all duration-300
            ${definitionOfRead.trim() && ENABLE_ENHANCE_NEED_DEFINITION ? 'opacity-80 hover:opacity-100' : 'opacity-30 cursor-not-allowed'}
            ${isEnhancing ? 'bg-gray-500/20' : ENABLE_ENHANCE_NEED_DEFINITION ? 'bg-purple-500/10' : 'bg-gray-500/10'}
            border ${ENABLE_ENHANCE_NEED_DEFINITION ? 'border-purple-500/20' : 'border-gray-500/20'}
            ${ENABLE_ENHANCE_NEED_DEFINITION ? 'hover:bg-purple-500/20 hover:border-purple-500/30' : ''}
            ${ENABLE_ENHANCE_NEED_DEFINITION ? 'hover:shadow-glow-purple' : ''}
            disabled:hover:bg-gray-500/10 disabled:hover:border-gray-500/20
            disabled:hover:shadow-none disabled:cursor-not-allowed
            group
            active:scale-95
          `}
          aria-label="Enhance Writing"
        >
          {isEnhancing ? (
            <svg className="animate-spin h-5 w-5 text-purple-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg
              className="h-5 w-5 text-purple-300 group-hover:text-purple-200 transition-colors filter drop-shadow-md animate-pulse-subtle"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
          )}

          {/* Quantum glow effect */}
          <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>

          {/* Orbital ring */}
          <div className="absolute inset-0 border border-purple-500/20 opacity-0 group-hover:opacity-100 animate-orbital-glow"></div>
        </button>

          {/* Save as Template Button */}
          <div
            onMouseEnter={onSaveTemplateMouseEnter}
            onMouseLeave={onSaveTemplateMouseLeave}
            className="relative inline-block"
          >
          <button
            onClick={handleSaveTemplate}
            disabled={!definitionOfRead.trim() || isProcessing || definitionOfRead === initialDefinitionOfNeed}
          className={`
            flex items-center justify-center w-10 h-10
            transition-all duration-300
            ${definitionOfRead.trim() ? 'opacity-80 hover:opacity-100' : 'opacity-30 cursor-not-allowed'}
            bg-purple-500/10 border border-purple-500/20
            hover:bg-purple-500/20 hover:border-purple-500/30
            hover:shadow-glow-purple
            disabled:hover:bg-purple-500/10 disabled:hover:border-purple-500/20
            disabled:hover:shadow-none
            group
            transform hover:scale-110 active:scale-95
          `}
          aria-label="Save as Template"
        >
          <svg
            className="h-5 w-5 text-purple-300 group-hover:text-purple-200 transition-colors filter drop-shadow-md"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
          </svg>

          {/* Quantum glow effect */}
          <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>

          {/* Orbital ring */}
          <div className="absolute inset-0 border border-purple-500/20 opacity-0 group-hover:opacity-100 animate-orbital-glow"></div>
          </button>
          </div>
      </div>

      {/* Mobile action buttons (horizontal) */}
      <div className="flex laptop:hidden justify-center space-x-4 mt-4">
        {/* Enhance Writing - always shown, disabled when feature flag is off */}
        <button
          onClick={handleEnhanceWriting}
          disabled={!ENABLE_ENHANCE_NEED_DEFINITION || isEnhancing || isProcessing || !definitionOfRead.trim()}
          className={`
            flex items-center justify-center w-10 h-10
            transition-all duration-300
            ${definitionOfRead.trim() && ENABLE_ENHANCE_NEED_DEFINITION ? 'opacity-80 hover:opacity-100' : 'opacity-30 cursor-not-allowed'}
            ${isEnhancing ? 'bg-gray-500/20' : ENABLE_ENHANCE_NEED_DEFINITION ? 'bg-purple-500/10' : 'bg-gray-500/10'}
            border ${ENABLE_ENHANCE_NEED_DEFINITION ? 'border-purple-500/20' : 'border-gray-500/20'}
            ${ENABLE_ENHANCE_NEED_DEFINITION ? 'hover:bg-purple-500/20 hover:border-purple-500/30' : ''}
            ${ENABLE_ENHANCE_NEED_DEFINITION ? 'hover:shadow-glow-purple' : ''}
            disabled:hover:bg-gray-500/10 disabled:hover:border-gray-500/20
            disabled:hover:shadow-none disabled:cursor-not-allowed
            group
            active:scale-95
          `}
          aria-label="Enhance Writing"
        >
          {isEnhancing ? (
            <svg className="animate-spin h-5 w-5 text-purple-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg
              className="h-5 w-5 text-purple-300 group-hover:text-purple-200 transition-colors filter drop-shadow-md animate-pulse-subtle"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
          )}
        </button>

        {/* Save template */}
        <button
          onClick={handleSaveTemplate}
          disabled={!definitionOfRead.trim() || isProcessing || definitionOfRead === initialDefinitionOfNeed}
          className={`
            flex items-center justify-center w-10 h-10
            transition-all duration-300
            ${definitionOfRead.trim() ? 'opacity-80 hover:opacity-100' : 'opacity-30 cursor-not-allowed'}
            bg-purple-500/10 border border-purple-500/20
            hover:bg-purple-500/20 hover:border-purple-500/30
            hover:shadow-glow-purple
            disabled:hover:bg-purple-500/10 disabled:hover:border-purple-500/20
            disabled:hover:shadow-none
            group
            transform hover:scale-110 active:scale-95
          `}
          aria-label="Save as Template"
        >
          <svg
            className="h-5 w-5 text-purple-300 group-hover:text-purple-200 transition-colors filter drop-shadow-md"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
          </svg>
        </button>
      </div>


      {/* Save as Template Modal */}
      <AnimatePresence>
        {showSaveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowSaveModal(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900/95 backdrop-blur-md border border-brand-purple-glow-subtle p-4 w-full max-w-sm shadow-xl z-[100]"
              style={{
                boxShadow: `
                  0 10px 30px theme(colors.brand.black-translucent),
                  0 0 0 1px theme(colors.brand.purple-glow-subtle),
                  inset 0 0 20px theme(colors.brand.purple-glow-subtle)
                `
              }}
            >
              {saveSuccess ? (
                <div className="flex flex-col items-center justify-center py-4">
                  <div className="w-12 h-12 bg-brand-emerald-glow-subtle flex items-center justify-center mb-3 relative">
                    <svg className="h-6 w-6 text-brand-emerald-bright" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {/* Success animation rings */}
                    <div className="absolute inset-0 border border-brand-emerald-glow animate-ping-slow"></div>
                    <div className="absolute inset-0 border-2 border-brand-emerald-glow-subtle animate-pulse-subtle"></div>
                  </div>
                  <h3 className="text-base font-medium text-brand-emerald-bright mb-1">Template Saved!</h3>
                  <p className="text-gray-400 text-xs text-center">
                    Your template is now available in the templates menu.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-base font-medium text-purple-300 flex items-center">
                      <svg className="h-4 w-4 mr-1.5 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                      </svg>
                      Save as Template
                    </h3>
                    <button
                      onClick={() => setShowSaveModal(false)}
                      className="text-gray-400 hover:text-white transition-colors hover:bg-purple-500/10 p-0.5"
                    >
                      <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label htmlFor="template-name" className="block text-xs font-medium text-gray-300 mb-1.5">
                        Template Name
                      </label>
                      <input
                        type="text"
                        id="template-name"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-brand-black-translucent border border-brand-purple-glow-subtle text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-purple-glow-subtle focus:border-brand-purple-glow-subtle transition-all duration-300"
                        placeholder="Enter a name for your template"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1.5">
                        Available For
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {templateCategories.map((category) => (
                          <div
                            key={category.id}
                            className={`
                              flex items-center p-2 border transition-all duration-300 cursor-pointer
                              ${category.checked
                                ? 'border-brand-purple-glow bg-brand-purple-glow-subtle shadow-glow-purple-subtle'
                                : 'border-gray-700/50 bg-brand-black-translucent hover:border-brand-purple-glow-subtle hover:bg-brand-purple-glow-subtle'}
                            `}
                            onClick={() => toggleCategory(category.id)}
                          >
                            <div className={`
                              w-3.5 h-3.5 mr-1.5 flex items-center justify-center
                              ${category.checked
                                ? 'bg-brand-purple-glow border border-brand-purple-bright'
                                : 'bg-brand-black-translucent border border-gray-600/50'}
                              transition-all duration-300
                            `}>
                              {category.checked && (
                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <span className={`text-xs ${category.checked ? 'text-brand-purple-bright' : 'text-gray-300'}`}>
                              {category.name}
                            </span>
                          </div>
                        ))}
                      </div>
                      {!templateCategories.some(cat => cat.checked) && (
                        <p className="text-brand-red-bright text-xs mt-1 flex items-center">
                          <svg className="w-2.5 h-2.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          Please select at least one category
                        </p>
                      )}
                    </div>

                    <div className="pt-1">
                      <button
                        onClick={handleSaveConfirm}
                        disabled={!templateName.trim() || !templateCategories.some(cat => cat.checked)}
                        className={`
                          w-full flex items-center justify-center space-x-1.5 px-3 py-2
                          text-xs font-medium transition-all duration-300
                          bg-brand-purple-glow-subtle text-brand-purple-bright border border-brand-purple-glow
                          hover:bg-brand-purple-glow hover:border-brand-purple-bright hover:text-brand-purple-bright
                          hover:shadow-glow-purple
                          disabled:opacity-50 disabled:cursor-not-allowed
                          disabled:hover:bg-brand-purple-glow-subtle disabled:hover:border-brand-purple-glow
                          disabled:hover:shadow-none
                          relative overflow-hidden group
                        `}
                      >
                        <svg className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                        </svg>
                        <span>Save Template</span>

                        {/* Shine effect */}
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-purple-300/20 to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-in-out"></div>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExecutionReadInput;

import React from 'react';
import { ContentVisibility } from '@/components/base/bitcode/perf/ContentVisibility';
import { UrlEntry } from '@/types/api';
import { IntegrationItem } from './integrations-selector';
import { motion, AnimatePresence } from 'framer-motion';

interface SelectedAttachmentsProps {
  selectedFiles: File[];
  attachedUrls: UrlEntry[];
  selectedIssueOrPR: string[];
  selectedIntegrations: IntegrationItem[];
  issuesAndPRs: any[];
  onRemoveFile: (index: number) => void;
  onRemoveUrl: (index: number) => void;
  onRemoveIssue: (id: string) => void;
  onRemoveIntegration: (id: string) => void;
}

export const SelectedAttachments = ({
  selectedFiles,
  attachedUrls,
  selectedIssueOrPR,
  selectedIntegrations,
  issuesAndPRs,
  onRemoveFile,
  onRemoveUrl,
  onRemoveIssue,
  onRemoveIntegration
}: SelectedAttachmentsProps) => {
  // Check if we have any attachments
  const hasAttachments = selectedFiles.length > 0 ||
    attachedUrls.length > 0 ||
    selectedIssueOrPR.length > 0 ||
    selectedIntegrations.length > 0;

  if (!hasAttachments) return null;

  // Find the issue/PR objects that match the selected IDs
  const selectedIssues = issuesAndPRs.filter(issue =>
    selectedIssueOrPR.includes(issue.id)
  );

  return (
    <div className="mt-4 w-full">
      <AnimatePresence>
        {hasAttachments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <ContentVisibility className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto custom-scrollbar p-1">
              {/* Files */}
              {selectedFiles.map((file, index) => (
                <AttachmentItem
                  key={`file-${index}`}
                  label={file.name}
                  type="file"
                  onRemove={() => onRemoveFile(index)}
                />
              ))}

              {/* URLs */}
              {attachedUrls.map((url, index) => (
                <AttachmentItem
                  key={`url-${index}`}
                  label={url.title !== "Untitled" ? url.title : url.url}
                  type="url"
                  status={url.status}
                  onRemove={() => onRemoveUrl(index)}
                />
              ))}

              {/* Issues & PRs */}
              {selectedIssues.map((issue) => (
                <AttachmentItem
                  key={`issue-${issue.id}`}
                  label={issue.title}
                  type={issue.isPR ? "pr" : "issue"}
                  onRemove={() => onRemoveIssue(issue.id)}
                />
              ))}

              {/* Integrations */}
              {selectedIntegrations.map((integration) => (
                <AttachmentItem
                  key={`integration-${integration.id}`}
                  label={integration.label}
                  type={integration.type}
                  subLabel={integration.parentLabel}
                  onRemove={() => onRemoveIntegration(integration.id)}
                />
              ))}
            </ContentVisibility>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface AttachmentItemProps {
  label: string;
  type: string;
  subLabel?: string;
  status?: string;
  onRemove: () => void;
}

const AttachmentItem = ({ label, type, subLabel, status, onRemove }: AttachmentItemProps) => {
  // Determine icon and color based on type
  const getTypeStyles = () => {
    switch (type) {
      case 'file':
        return {
          icon: (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
          bgColor: 'bg-sky-500/10',
          borderColor: 'border-sky-500/30',
          textColor: 'text-sky-300'
        };
      case 'url':
        return {
          icon: (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          ),
          bgColor: status === 'error' ? 'bg-red-500/10' : 'bg-purple-500/10',
          borderColor: status === 'error' ? 'border-red-500/30' : 'border-purple-500/30',
          textColor: status === 'error' ? 'text-red-300' : 'text-purple-300'
        };
      case 'issue':
        return {
          icon: (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          bgColor: 'bg-emerald-500/10',
          borderColor: 'border-emerald-500/30',
          textColor: 'text-emerald-300'
        };
      case 'pr':
        return {
          icon: (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4 4 4m6 0v12m0 0 4-4m-4 4-4-4" />
            </svg>
          ),
          bgColor: 'bg-purple-500/10',
          borderColor: 'border-purple-500/30',
          textColor: 'text-purple-300'
        };
      case 'notion-db':
      case 'notion-db-entry':
        return {
          icon: (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-gray-500/30',
          textColor: 'text-gray-300'
        };
      case 'figma-project':
      case 'figma-frame':
        return {
          icon: (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
          ),
          bgColor: 'bg-indigo-500/10',
          borderColor: 'border-indigo-500/30',
          textColor: 'text-indigo-300'
        };
      default:
        return {
          icon: (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          ),
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-gray-500/30',
          textColor: 'text-gray-300'
        };
    }
  };

  const { icon, bgColor, borderColor, textColor } = getTypeStyles();

  return (
    <div className={`
      flex items-center gap-2 px-2 py-1
      ${bgColor} ${borderColor} border
      group hover:bg-opacity-20 transition-all duration-200
    `}>
      <span className={`${textColor}`}>
        {icon}
      </span>
      <div className="flex flex-col">
        <span className={`text-xs truncate max-w-[150px] ${textColor}`}>
          {label}
        </span>
        {subLabel && (
          <span className="text-[10px] text-gray-400 truncate max-w-[150px]">
            {subLabel}
          </span>
        )}
      </div>
      <button
        onClick={onRemove}
        className={`
          ml-1 p-0.5
          opacity-50 hover:opacity-100
          ${textColor} hover:bg-opacity-20
          transition-all duration-200
        `}
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

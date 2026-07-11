import React from 'react';
import { components } from 'react-select';
import { NotionIcon, FigmaIcon } from './integration-icons';
import { CheckIcon } from "@radix-ui/react-icons";

interface IntegrationMetadata {
  database?: string;
  entry?: string;
  project?: string;
  frame?: string;
  lastEdited?: string;
  dimensions?: string;
}

interface IntegrationOption {
  label: string;
  value: string;
  type: 'notion-db' | 'notion-db-entry' | 'figma-project' | 'figma-frame';
  subLabel?: string;
  parentLabel?: string;
  metadata?: IntegrationMetadata;
  isDisabled?: boolean;
}

interface IntegrationGroupData {
  label: string;
  subLabel?: string;
  options: IntegrationOption[];
}

export const IntegrationGroup = ({ children, ...props }: any) => {
  const { data } = props;
  return (
    <components.Group {...props}>
      <div className="px-2 py-1">
        <div className="text-xs font-medium text-[#67feb7] mb-1">
          {data.label}
          {data.subLabel && (
            <span className="ml-2 text-gray-400">• {data.subLabel}</span>
          )}
        </div>
        {children}
      </div>
    </components.Group>
  );
};

export const IntegrationOption = ({ children, ...props }: any) => {
  const { data } = props;

  // If this is a header (disabled) option
  if (data.isDisabled) {
    return (
      <components.Option {...props}>
        <div className="flex flex-col py-1 border-b border-[#1f2937]/50">
          <div className="flex items-center">
            {data.type === 'notion-db' && <NotionIcon />}
            {data.type === 'figma-project' && <FigmaIcon />}
            <div className="flex flex-col">
              <span className="text-[#67feb7] font-medium">{data.label}</span>
              {data.subLabel && (
                <span className="text-xs text-gray-400">{data.subLabel}</span>
              )}
            </div>
          </div>
        </div>
      </components.Option>
    );
  }

  // For regular selectable options
  return (
    <components.Option {...props} data-testid={`integration-option-${data.value}`}>
      <div className="flex flex-col pl-4">
        <div className="flex items-center">
          {data.type === 'notion-db-entry' && <NotionIcon small />}
          {data.type === 'figma-frame' && <FigmaIcon small />}
          <div className="flex flex-col">
            <span>{data.label}</span>
            {data.parentLabel && (
              <span className="text-xs text-gray-500">in {data.parentLabel}</span>
            )}
          </div>
        </div>
        {data.subLabel && (
          <span className="text-xs text-gray-500 ml-6">{data.subLabel}</span>
        )}
      </div>
    </components.Option>
  );
};

export const formatContainerLabel = (option: any) => (
  <div className="flex flex-col">
    <div className="flex items-center space-x-2">
      {option.type === 'notion-db' && <NotionIcon />}
      {option.type === 'figma-project' && <FigmaIcon />}
      <span className="text-gray-100 font-medium">{option.label}</span>
    </div>
    {option.subLabel && <span className="text-xs text-gray-400">{option.subLabel}</span>}
  </div>
);

export const formatItemLabel = (option: IntegrationOption, { selectValue }: any) => {
  const isSelected = selectValue && selectValue.some((val: any) => val.value === option.value);

  if (!option.metadata) {
    return (
      <div className="flex items-center space-x-2">
        {isSelected && <CheckIcon className="text-[#67feb7]" />}
        <span>{option.label}</span>
      </div>
    );
  }

  const prefix = option.type.startsWith('notion') ? '[Notion]' : '[Figma]';
  const mainLabel =
    option.type === 'notion-db-entry'
      ? `${option.metadata?.database || ''} › ${option.metadata?.entry || ''}`
      : `${option.metadata?.project || ''} › ${option.metadata?.frame || ''}`;

  return (
    <div className="flex flex-col">
      <div className="flex items-center space-x-2">
        {isSelected && <CheckIcon className="text-[#67feb7]" />}
        {option.type === 'notion-db-entry' && <NotionIcon small />}
        {option.type === 'figma-frame' && <FigmaIcon small />}
        <span className="text-gray-100">
          <span className="text-[#67feb7]">{prefix}</span> {mainLabel}
        </span>
      </div>
      {option.type === 'notion-db-entry' && option.metadata?.lastEdited && (
        <span className="text-xs text-gray-500">Last edited {option.metadata.lastEdited}</span>
      )}
      {option.type === 'figma-frame' && option.metadata?.dimensions && (
        <span className="text-xs text-gray-500">{option.metadata.dimensions}</span>
      )}
    </div>
  );
};


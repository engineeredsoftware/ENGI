'use client';

/* eslint-disable react/no-multi-comp */
import React, { useState } from 'react';
import Select, { components, type GroupBase } from 'react-select';
import { Plug } from 'lucide-react';
import { glassyStyles, glassyPillStyles } from '@/components/bitcode/selects/GlassySelectStyles/glassy-select-styles';
import { NoOptionsMessage } from '@/components/bitcode/pipeline/SelectComponents/SelectComponents';
import { IntegrationGroup, IntegrationOption, formatContainerLabel, formatItemLabel } from '@/components/bitcode/pipeline/IntegrationComponents/IntegrationComponents';

// Define the integration option types
export interface IntegrationItem {
  id: string;
  type: 'notion-db' | 'notion-db-entry' | 'figma-project' | 'figma-frame';
  label: string;
  subLabel?: string;
  parentLabel?: string;
  metadata?: {
    database?: string;
    entry?: string;
    project?: string;
    frame?: string;
    lastEdited?: string;
    dimensions?: string;
  };
}

interface IntegrationsGroupData {
  label: string;
  subLabel?: string;
  options: IntegrationItem[];
}

interface IntegrationsSelectorProps {
  selectedIntegrations: IntegrationItem[];
  onIntegrationSelect: (integrations: IntegrationItem[]) => void;
  disabled?: boolean;
}

export const IntegrationsSelector = ({
  selectedIntegrations,
  onIntegrationSelect,
  disabled = false
}: IntegrationsSelectorProps) => {
  // Sample integration data - in a real app, this would come from an API
  const sampleIntegrations: IntegrationsGroupData[] = [
    {
      label: 'Notion',
      subLabel: 'Connected',
      options: [
        {
          id: 'notion-1',
          type: 'notion-db',
          label: 'Product Roadmap',
          subLabel: 'Last updated 2 days ago',
          metadata: {
            database: 'Product Roadmap'
          }
        },
        {
          id: 'notion-2',
          type: 'notion-db-entry',
          label: 'Authentication Feature',
          parentLabel: 'Product Roadmap',
          metadata: {
            database: 'Product Roadmap',
            entry: 'Authentication Feature',
            lastEdited: '2 days ago'
          }
        },
        {
          id: 'notion-3',
          type: 'notion-db-entry',
          label: 'API Documentation',
          parentLabel: 'Product Roadmap',
          metadata: {
            database: 'Product Roadmap',
            entry: 'API Documentation',
            lastEdited: '5 days ago'
          }
        }
      ]
    },
    {
      label: 'Figma',
      subLabel: 'Connected',
      options: [
        {
          id: 'figma-1',
          type: 'figma-project',
          label: 'UI Design System',
          subLabel: 'Last updated yesterday',
          metadata: {
            project: 'UI Design System'
          }
        },
        {
          id: 'figma-2',
          type: 'figma-frame',
          label: 'Authentication Flow',
          parentLabel: 'UI Design System',
          metadata: {
            project: 'UI Design System',
            frame: 'Authentication Flow',
            dimensions: '1440 x 900'
          }
        },
        {
          id: 'figma-3',
          type: 'figma-frame',
          label: 'Dashboard Layout',
          parentLabel: 'UI Design System',
          metadata: {
            project: 'UI Design System',
            frame: 'Dashboard Layout',
            dimensions: '1920 x 1080'
          }
        }
      ]
    }
  ];

  return (
    <div data-testid="integration-selector" className="relative w-48">
      <Select
        value={selectedIntegrations.map(integration => ({
          ...integration,
          value: integration.id,
        }))}
        onChange={(options) => {
          const selections = Array.isArray(options) ? options : [options];
          onIntegrationSelect(selections.map(option => ({
            id: option.value,
            type: option.type,
            label: option.label,
            subLabel: option.subLabel,
            parentLabel: option.parentLabel,
            metadata: option.metadata
          })));
        }}
        isMulti
        options={sampleIntegrations.flatMap(group => group.options.map(option => ({
          ...option,
          value: option.id
        })))}
        formatGroupLabel={(data) => {
          const group = data as GroupBase<IntegrationItem> & { subLabel?: string };
          return (
            <div className="px-2 py-1">
              <div className="text-xs font-medium text-[#67feb7] mb-1">
                {group.label}
                {group.subLabel && (
                  <span className="ml-2 text-gray-400">• {group.subLabel}</span>
                )}
              </div>
            </div>
          );
        }}
        formatOptionLabel={formatItemLabel}
        isSearchable
        isDisabled={disabled}
        menuPlacement="top"
        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
        menuPosition="fixed"
        styles={{
          ...glassyStyles,
          control: (base, state) => ({
            ...glassyStyles.control(base, state),
            ...glassyPillStyles,
          }),
        }}
        components={{
          NoOptionsMessage,
          DropdownIndicator: (props) => (
            <components.DropdownIndicator {...props}>
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </components.DropdownIndicator>
          ),
          Group: IntegrationGroup,
          Option: IntegrationOption,
          Control: ({ children, ...props }) => (
            <components.Control {...props}>
              <Plug className="w-2.5 h-2.5 opacity-70 group-hover:opacity-100 transition-opacity mx-2" />
              {children}
            </components.Control>
          ),
        }}
        placeholder="Integrations"
      />
    </div>
  );
};

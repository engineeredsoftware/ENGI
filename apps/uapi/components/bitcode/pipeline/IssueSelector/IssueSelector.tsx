"use client";
import React from 'react';
import Select, { components } from 'react-select';
import { glassyStyles, glassyPillStyles } from '@/components/bitcode/selects/GlassySelectStyles/glassy-select-styles';
import { NoOptionsMessage } from '@/components/bitcode/pipeline/SelectComponents/SelectComponents';
import Image from 'next/image';

interface IssueOrPR {
  id: string;
  title: string;
  isPR: boolean;
  url: string;
}

interface IssueSelectorProps {
  issuesAndPRs: IssueOrPR[];
  selectedIssueOrPR: string[];
  isLoadingIssues: boolean;
  onIssueSelect: (value: string[]) => void;
  disabled?: boolean;
}

export const IssueSelector = ({
  issuesAndPRs,
  selectedIssueOrPR,
  isLoadingIssues,
  onIssueSelect,
  disabled = false
}: IssueSelectorProps) => {
  // Find the selected issues/PRs to display in the control
  const selectedOptions = issuesAndPRs
    .filter(issue => selectedIssueOrPR.includes(issue.id))
    .map(issue => ({
      label: issue.title,
      value: issue.id,
      isPR: issue.isPR
    }));

  return (
    <div data-testid="gh-issue" className="relative w-48">
      <Select
        value={selectedOptions}
        onChange={(options) => {
          const picks = Array.isArray(options) ? options : [options];
          const values = picks.map(pick => pick.value);
          onIssueSelect(values);
        }}
        isMulti
        options={issuesAndPRs.map((issue) => ({
          label: issue.title,
          value: issue.id,
          isPR: issue.isPR
        }))}
        isSearchable
        isLoading={isLoadingIssues}
        isDisabled={disabled || isLoadingIssues}
        menuPlacement="top"
        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
        menuPosition="fixed"
        styles={{
          ...glassyStyles,
          control: (base, state) => ({
            ...glassyStyles.control(base, state),
            ...glassyPillStyles,
            ...(selectedIssueOrPR.length > 0 ? {
              borderColor: 'rgba(216, 180, 254, 0.35)',
              '&:hover': {
                borderColor: 'rgba(216, 180, 254, 0.5)',
              }
            } : {})
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
          Option: ({ children, ...props }) => (
            <components.Option {...props}>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 ${props.data.isPR ? 'bg-purple-400' : 'bg-emerald-400'}`}
                />
                <span>{props.data.label}</span>
              </div>
            </components.Option>
          ),
          Control: ({ children, ...props }) => (
            <components.Control {...props}>
              <Image
                src="/icons/label.svg"
                width={12}
                height={12}
                alt=""
                className="w-2.5 h-2.5 opacity-70 group-hover:opacity-100 transition-opacity mx-2"
              />
              {children}
              {isLoadingIssues && (
                <svg
                  className="w-3 h-3 mx-2 text-[#67feb7] animate-spin"
                  viewBox="0 0 24 24" fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12" cy="12" r="10"
                    stroke="currentColor" strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
              )}
            </components.Control>
          ),
          MultiValueLabel: ({ children, ...props }) => (
            <components.MultiValueLabel {...props}>
              <span className="text-xs">{children}</span>
            </components.MultiValueLabel>
          ),
        }}
        placeholder={selectedIssueOrPR.length > 0 ? `Issues & PRs (${selectedIssueOrPR.length})` : "Issues & PRs"}
      />
    </div>
  );
};

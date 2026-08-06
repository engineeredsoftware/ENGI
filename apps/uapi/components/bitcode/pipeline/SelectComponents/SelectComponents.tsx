import React from 'react';
import { components } from 'react-select';

export const NoOptionsMessage = (props: any) => {
  const placeholder = props.selectProps.placeholder;

  let message = 'No options found';
  let icon = '⚠️';

  switch (placeholder) {
    case 'Account':
      message = 'No accounts found';
      icon = '👤';
      break;
    case 'Repository':
      message = 'No repositories found';
      icon = '📦';
      break;
    case 'Branch':
      message = 'No branches found';
      icon = '🌿';
      break;
    case 'Commit':
      message = 'No commits found';
      icon = '📝';
      break;
    case 'Issues & PRs':
      message = 'No issues or PRs found';
      icon = '🔍';
      break;
    case 'Integrations':
      message = 'No integrations found';
      icon = '🔌';
      break;
  }

  return (
    <components.NoOptionsMessage {...props}>
      <div className="relative px-3 py-2 my-1">
        <div className="absolute inset-0 bg-emerald-500/5" />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.02] via-emerald-500/[0.05] to-emerald-500/[0.02] animate-gradient" />
        <div className="relative flex items-center space-x-2">
          <span className="opacity-70">{icon}</span>
          <span className="text-gray-400 text-sm">{message}</span>
        </div>
      </div>
    </components.NoOptionsMessage>
  );
};

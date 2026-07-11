import React from 'react';
import ExecuteButtonBase from '@/components/bitcode/execution/execute-button';

export type ExecutionsExecuteButtonProps = React.ComponentProps<typeof ExecuteButtonBase>;

export function ExecutionsExecuteButton(props: ExecutionsExecuteButtonProps) {
  return <ExecuteButtonBase {...props} />;
}

export default ExecutionsExecuteButton;

import React from 'react';
import ExecuteButtonBase from '@/components/bitcode/pipeline/ExecuteButton/ExecuteButton';

export type ExecutionsExecuteButtonProps = React.ComponentProps<typeof ExecuteButtonBase>;

export function ExecutionsExecuteButton(props: ExecutionsExecuteButtonProps) {
  return <ExecuteButtonBase {...props} />;
}

export default ExecutionsExecuteButton;

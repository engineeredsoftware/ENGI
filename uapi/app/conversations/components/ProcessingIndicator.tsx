import { ProcessingIndicator as BaseProcessingIndicator } from '@/components/bitcode/indicators/ProcessingIndicator';

interface ProcessingIndicatorProps {
  label?: string;
  status?: string;
  size?: string;
  className?: string;
}

export function ProcessingIndicator({
  label,
  status,
  size: _size,
  className,
}: ProcessingIndicatorProps) {
  return (
    <div className={className}>
      <BaseProcessingIndicator label={label ?? status ?? 'Processing'} />
    </div>
  );
}

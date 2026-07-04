import React from 'react';
import { cn } from '@bitcode/styling';
import LogoIcon from '@/components/base/bitcode/icons/LogoIcon';
import { ReloadIcon, ArrowRightIcon } from '@radix-ui/react-icons';
import { trackEvent } from '@bitcode/google-analytics';

type ColorScheme = 'emerald' | 'purple' | 'orange';

const glowClasses: Record<ColorScheme, string> = {
  emerald: 'glow-emerald group-hover:glow-emerald-strong',
  purple: 'glow-purple group-hover:glow-purple-strong',
  orange: 'glow-orange group-hover:glow-orange-strong',
};

const textClasses: Record<ColorScheme, string> = {
  emerald: 'text-brand-emerald',
  purple: 'text-brand-purple',
  orange: 'text-brand-orange',
};

const backgroundClasses: Record<ColorScheme, string> = {
  emerald: 'from-brand-emerald-glow-subtle/0 via-brand-emerald-glow-subtle/5 to-brand-emerald-glow-subtle/0 group-hover:via-brand-emerald-glow-subtle/10',
  purple: 'from-brand-purple-glow/0 via-brand-purple-glow/5 to-brand-purple-glow/0 group-hover:via-brand-purple-glow/10',
  orange: 'from-brand-orange-glow/0 via-brand-orange-glow/5 to-brand-orange-glow/0 group-hover:via-brand-orange-glow/10',
};

interface ExecuteButtonProps {
  isProcessing: boolean;
  onSubmit: () => void;
  onCancel?: () => void;
  disabled: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  className?: string;
  label?: string;
  labelNode?: React.ReactNode;
  processingLabel?: string;
  processingLabelNode?: React.ReactNode;
  cancelLabel?: string;
  allowCancel?: boolean;
  icon?: React.ReactNode;
  compact?: boolean;
  labelClassName?: string;
  compactPaddingClass?: string;
  transformOnProcessing?: boolean;
  colorScheme?: ColorScheme;
  trackingMetadata?: Record<string, any>;
}

const ExecuteButtonBase = ({
  isProcessing,
  onSubmit,
  onCancel,
  disabled,
  onMouseEnter,
  onMouseLeave,
  className,
  label = 'Execute',
  labelNode,
  processingLabel = 'Executing...',
  processingLabelNode,
  cancelLabel = 'Cancel',
  icon,
  compact = false,
  labelClassName,
  compactPaddingClass,
  allowCancel = true,
  transformOnProcessing = true,
  colorScheme = 'emerald',
  trackingMetadata = {},
}: ExecuteButtonProps) => {
  const iconFilter = disabled
    ? 'grayscale(1)'
    : colorScheme === 'emerald' ? 'drop-shadow(0 0 8px theme(colors.brand.emerald-glow))'
    : colorScheme === 'purple' ? 'drop-shadow(0 0 8px theme(colors.brand.purple-glow))'
    : 'drop-shadow(0 0 8px theme(colors.brand.orange-glow))';
  const dangerHover = isProcessing && allowCancel && !disabled;
  return (
    <button data-testid="execute-button"
      data-ga-event={isProcessing ? 'asset_pack_pipeline_cancel_clicked' : 'asset_pack_pipeline_submit_clicked'}
      onClick={(e) => {
        e.preventDefault();
        if (isProcessing) {
          trackEvent('asset_pack_pipeline_cancel_clicked', { event_category: 'asset_pack_pipeline_interaction', button_label: cancelLabel, color_scheme: colorScheme, compact, ...trackingMetadata });
          if (onCancel) onCancel();
        } else {
          trackEvent('asset_pack_pipeline_submit_clicked', { event_category: 'asset_pack_pipeline_interaction', button_label: label, color_scheme: colorScheme, compact, disabled, ...trackingMetadata });
          onSubmit();
        }
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      type="submit"
      disabled={disabled}
      className={`${compact ? 'w-auto' : 'w-full'} relative ${disabled ? '' : 'group'} disabled:opacity-50 disabled:cursor-not-allowed mt-4 mb-2 transition-all duration-500 ease-out max-w-2xl ${isProcessing ? (transformOnProcessing ? 'processing mb-0 scale-[0.98] translate-y-4 hover:scale-100 hover:translate-y-0' : 'processing') : 'opacity-100'} ${className ? className : ''}`}
      style={{ transformStyle: 'preserve-3d', perspective: '1000px', zIndex: isProcessing ? 1 : 'auto', transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)', willChange: 'transform, opacity', backfaceVisibility: 'hidden' }}
    >
      <div className={cn(`absolute inset-x-0 -inset-y-1 blur-xl opacity-20 transition duration-1000 group-hover:duration-200 group-hover:opacity-40 bg-gradient-to-r`, backgroundClasses[colorScheme], dangerHover && 'group-hover:via-red-500/10')} />
      <div className={cn(`relative h-12 bg-brand-cosmic/90 backdrop-blur-sm transition-all duration-500 overflow-hidden group-active:scale-[0.99] group-active:brightness-90`, !disabled && !dangerHover && glowClasses[colorScheme], dangerHover && 'group-hover:glow-red group-hover:glow-red-strong')} style={{ willChange: 'transform, box-shadow, border-color', backfaceVisibility: 'hidden' }}>
        <div className={cn(`absolute inset-0 bg-gradient-to-r transition-opacity duration-500`, backgroundClasses[colorScheme], dangerHover && 'group-hover:via-red-500/10')} />
        <div className={cn('absolute inset-0 opacity-0 transition-opacity duration-500', !disabled && 'group-hover:opacity-100')}>
          <div className={cn('absolute inset-0 bg-gradient-to-r from-transparent to-transparent transition-opacity duration-500', colorScheme === 'emerald' && 'via-brand-emerald-glow-subtle group-hover:via-brand-emerald-glow-subtle', colorScheme === 'purple' && 'via-brand-purple-glow group-hover:via-brand-purple-glow', colorScheme === 'orange' && 'via-brand-orange-glow group-hover:via-brand-orange-glow', dangerHover && 'group-hover:via-red-500/30')} style={{ transform: 'translateX(-100%)', animation: 'shimmer 4s infinite cubic-bezier(0.4, 0, 0.2, 1)' }} />
        </div>
        <div className={cn('absolute inset-0 opacity-0 group-active:opacity-20 transition-opacity duration-100', colorScheme === 'emerald' && 'bg-brand-emerald-glow-subtle', colorScheme === 'purple' && 'bg-brand-purple-glow', colorScheme === 'orange' && 'bg-brand-orange-glow', dangerHover && 'group-hover:bg-red-500/20')} />
        <div className={`relative flex items-center justify-center h-full ${compact ? (compactPaddingClass ?? 'px-6') : 'px-10 min-w-[650px]'}`}>
          {isProcessing ? (
            allowCancel ? (
              <div className="flex items-center space-x-3 [transition:transform_300ms,opacity_0ms_150ms] group-hover:scale-110">
                <div className="[transition:opacity_0ms_150ms] group-hover:hidden"><ReloadIcon className={cn(`h-4 w-4 animate-spin`, textClasses[colorScheme])} style={{ filter: disabled ? undefined : iconFilter }} /></div>
                <div className="hidden [transition:opacity_0ms_150ms] group-hover:block"><svg className="h-4 w-4 text-red-400 [filter:drop-shadow(0_0_8px_rgba(239,68,68,0.3))]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></div>
                <span className={cn(labelClassName ?? 'text-sm tracking-wider font-light', textClasses[colorScheme], 'group-hover:text-red-400 text-neon')}><span className="[transition:opacity_0ms_150ms] group-hover:hidden">{processingLabelNode ?? processingLabel}</span><span className="hidden [transition:opacity_0ms_150ms] group-hover:inline">{cancelLabel}</span></span>
              </div>
            ) : (
              <div className="flex items-center space-x-3"><ReloadIcon className={cn(`h-4 w-4 animate-spin`, textClasses[colorScheme])} style={{ filter: disabled ? undefined : iconFilter }} /><span className={cn(labelClassName ?? 'text-sm tracking-wider font-light text-neon', textClasses[colorScheme])}>{processingLabelNode ?? processingLabel}</span></div>
            )
          ) : (
            <div className={cn('flex items-center space-x-3 text-gray-300 transition-colors duration-500', colorScheme === 'emerald' && 'group-hover:text-brand-emerald', colorScheme === 'purple' && 'group-hover:text-brand-purple', colorScheme === 'orange' && 'group-hover:text-brand-orange')}>
              <div className="relative w-5 h-5">
                <LogoIcon fill={colorScheme === 'emerald' ? '#65FEB7' : colorScheme === 'purple' ? '#A855F7' : '#F97316'} width={20} height={20} className={cn('w-5 h-5 transition-all duration-700', !disabled && 'group-hover:scale-110 group-hover:brightness-125 group-hover:animate-float group-active:scale-90 group-active:brightness-150', disabled && 'opacity-30')} style={{ filter: iconFilter }} aria-hidden="true" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                  <div className={cn('absolute inset-[-50%] bg-gradient-conic animate-spin-slow rounded-full blur-md', colorScheme === 'emerald' && 'bg-brand-emerald-glow-subtle', colorScheme === 'purple' && 'bg-brand-purple-glow', colorScheme === 'orange' && 'bg-brand-orange-glow')} />
                  <div className={cn('absolute inset-[-25%] bg-gradient-radial animate-pulse-slow rounded-full blur-sm', colorScheme === 'emerald' && 'bg-brand-emerald-glow-subtle', colorScheme === 'purple' && 'bg-brand-purple-glow', colorScheme === 'orange' && 'bg-brand-orange-glow')} />
                </div>
              </div>
              <span className={cn(labelClassName ?? 'text-sm tracking-wider font-light group-hover:text-neon')}>{labelNode ?? label}</span>
              <ArrowRightIcon className={cn('h-3.5 w-3.5 stroke-current text-gray-300 transition-transform duration-500', 'group-hover:translate-x-1', colorScheme === 'emerald' && 'group-hover:text-brand-emerald', colorScheme === 'purple' && 'group-hover:text-brand-purple', colorScheme === 'orange' && 'group-hover:text-brand-orange')} style={{ filter: disabled ? undefined : iconFilter }} aria-hidden="true" />
            </div>
          )}
        </div>
      </div>
    </button>
  );
};

const ExecuteMemo = React.memo(ExecuteButtonBase);
export const ExecuteAssetPackPipelineButton = ExecuteMemo;
export default ExecuteMemo;
